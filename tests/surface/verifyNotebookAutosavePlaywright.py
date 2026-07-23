from __future__ import annotations

import argparse
from contextlib import nullcontext
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import subprocess
import tempfile
import threading
import time
from urllib.parse import urlsplit, urlunsplit


ROOT = Path(__file__).resolve().parents[2]
OUTPUT_ROOT = ROOT / "output" / "test-runner" / "notebook-autosave-browser"


class QuietStaticHandler(SimpleHTTPRequestHandler):
    def log_message(self, _format: str, *args: object) -> None:
        return


class ReusedEditorBuildHandler(QuietStaticHandler):
    def do_GET(self) -> None:
        parsed = urlsplit(self.path)
        path = "/index.html" if parsed.path in {"/run", "/run/"} else parsed.path
        self.path = urlunsplit(("", "", path, parsed.query, ""))
        super().do_GET()


def startLocalServer(workspace: Path, documentPath: Path):
    import uvicorn
    from codaro.server import createServerApp, createServerEventLoop

    app = createServerApp(
        mode="edit",
        documentPath=documentPath,
        workspaceRoot=workspace,
    )
    config = uvicorn.Config(
        app,
        host="127.0.0.1",
        port=0,
        log_level="warning",
        loop=createServerEventLoop,
        timeout_graceful_shutdown=5,
        timeout_keep_alive=1,
    )
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()

    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        if server.started and server.servers:
            sockets = list(server.servers)[0].sockets
            if sockets:
                return server, thread, int(sockets[0].getsockname()[1])
        time.sleep(0.1)
    server.should_exit = True
    thread.join(timeout=3)
    raise RuntimeError("Local notebook autosave server did not start")


def installSaveRequestRecorder(page) -> None:
    page.add_init_script(
        """
        (() => {
          const originalFetch = window.fetch.bind(window);
          const originalSetTimeout = window.setTimeout.bind(window);
          window.__codaroNotebookSaveRequests = [];
          window.setTimeout = (handler, delay, ...args) => originalSetTimeout(
            handler,
            delay === 700 ? 5000 : delay,
            ...args,
          );
          window.fetch = (input, init = {}) => {
            const url = typeof input === "string" ? input : input.url;
            if (url.includes("/api/document/save")) {
              window.__codaroNotebookSaveRequests.push({
                body: String(init.body || ""),
                keepalive: Boolean(init.keepalive),
              });
            }
            return originalFetch(input, init);
          };
        })();
        """
    )


def localSaveRequests(page, marker: str) -> list[dict[str, object]]:
    return page.evaluate(
        """marker => window.__codaroNotebookSaveRequests
          .filter(request => request.body.includes(marker))""",
        marker,
    )


def waitForFileContent(path: Path, marker: str, timeoutSeconds: float = 20) -> None:
    deadline = time.monotonic() + timeoutSeconds
    while time.monotonic() < deadline:
        if path.is_file() and marker in path.read_text(encoding="utf-8"):
            return
        time.sleep(0.1)
    raise AssertionError(f"autosave marker was not written to {path}")


def verifyLocalTransitionFlush(playwright, consoleErrors: list[str], pageErrors: list[str]) -> None:
    scratchRoot = OUTPUT_ROOT / "scratch"
    scratchRoot.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="local-autosave-", dir=scratchRoot) as tempDirectory:
        stateRoot = Path(tempDirectory)
        workspace = stateRoot / "workspace"
        workspace.mkdir()
        documentPath = workspace / "owned.py"
        documentPath.write_text("print('initial')\n", encoding="utf-8")
        previousCodaroHome = os.environ.get("CODARO_HOME")
        os.environ["CODARO_HOME"] = str(stateRoot / "home")
        server = None
        thread = None
        try:
            server, thread, port = startLocalServer(workspace, documentPath)
            browser = playwright.chromium.launch(headless=True)
            context = browser.new_context()
            page = context.new_page()
            installSaveRequestRecorder(page)
            page.on(
                "console",
                lambda message: consoleErrors.append(message.text)
                if message.type == "error"
                else None,
            )
            page.on("pageerror", lambda error: pageErrors.append(str(error)))
            page.goto(
                f"http://127.0.0.1:{port}/?surface=editor#editor",
                wait_until="domcontentloaded",
                timeout=30_000,
            )
            page.wait_for_selector('[data-notebook-studio="true"]', timeout=30_000)
            page.wait_for_selector(
                '[data-notebook-persistence-mode="local"]:not([data-notebook-persistence="error"])',
                timeout=20_000,
            )
            page.wait_for_timeout(1_000)

            smallMarker = "autosave_small_transition = 1"
            page.locator(".cm-content").first.fill(smallMarker, timeout=20_000)
            page.wait_for_selector(
                '[data-notebook-persistence="pending"][data-notebook-persistence-mode="local"]',
                timeout=3_000,
            )
            page.evaluate(
                """() => new Promise(resolve => requestAnimationFrame(() => {
                  Object.defineProperty(document, "visibilityState", {
                    configurable: true,
                    get: () => "hidden",
                  });
                  document.dispatchEvent(new Event("visibilitychange"));
                  resolve();
                }))"""
            )
            page.wait_for_function(
                """marker => window.__codaroNotebookSaveRequests
                  .some(request => request.body.includes(marker))""",
                arg=smallMarker,
                timeout=20_000,
            )
            page.wait_for_selector(
                '[data-notebook-persistence="saved"][data-notebook-persistence-mode="local"]',
                timeout=20_000,
            )
            waitForFileContent(documentPath, smallMarker)
            smallRequests = localSaveRequests(page, smallMarker)
            if not any(request["keepalive"] is False for request in smallRequests):
                raise AssertionError("small transition did not start the ordinary save")
            if not any(request["keepalive"] is True for request in smallRequests):
                raise AssertionError("small transition did not send the bounded keepalive save")

            page.evaluate("window.__codaroNotebookSaveRequests = []")
            largeMarker = "autosave_large_transition = "
            largeContent = f"{largeMarker!s}{'x' * (70 * 1024)!r}"
            page.locator(".cm-content").first.fill(largeContent, timeout=20_000)
            page.wait_for_selector(
                '[data-notebook-persistence="pending"][data-notebook-persistence-mode="local"]',
                timeout=3_000,
            )
            warningPrevented = page.evaluate(
                """() => new Promise(resolve => requestAnimationFrame(() => {
                  const event = new Event("beforeunload", { cancelable: true });
                  window.dispatchEvent(event);
                  resolve(event.defaultPrevented);
                }))"""
            )
            page.evaluate("window.dispatchEvent(new PageTransitionEvent('pagehide'))")
            page.wait_for_function(
                """marker => window.__codaroNotebookSaveRequests
                  .some(request => request.body.includes(marker))""",
                arg=largeMarker,
                timeout=20_000,
            )
            page.wait_for_selector(
                '[data-notebook-persistence="saved"][data-notebook-persistence-mode="local"]',
                timeout=20_000,
            )
            waitForFileContent(documentPath, largeMarker)
            largeRequests = localSaveRequests(page, largeMarker)
            if not largeRequests:
                raise AssertionError("large transition did not start the ordinary save")
            if any(request["keepalive"] is True for request in largeRequests):
                raise AssertionError("large transition exceeded the fetch keepalive body limit")
            if not warningPrevented:
                raise AssertionError("large unsaved transition did not request the native unload warning")
            context.close()
            browser.close()
        finally:
            if server is not None:
                server.should_exit = True
            if thread is not None:
                thread.join(timeout=8)
            if previousCodaroHome is None:
                os.environ.pop("CODARO_HOME", None)
            else:
                os.environ["CODARO_HOME"] = previousCodaroHome


def verifyDocumentPathOwnership(playwright) -> None:
    scratchRoot = OUTPUT_ROOT / "scratch"
    scratchRoot.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="path-owner-", dir=scratchRoot) as tempDirectory:
        root = Path(tempDirectory)
        entry = root / "harness.tsx"
        bundle = root / "harness.js"
        entry.write_text(
            """
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { useNotebookDocumentState } from "@/hooks/useNotebookDocumentState";

const secondDocument = {
  id: "document-2",
  title: "second.py",
  blocks: [{ id: "cell-2", type: "code", content: "second = 2" }],
  metadata: { sourceFormat: "codaro", tags: ["notebook"] },
  runtime: { defaultEngine: "local", reactiveMode: "hybrid", packages: [] },
};

function Harness() {
  const notebook = useNotebookDocumentState({
    localDocumentPath: "owned.py",
    persistenceEnabled: true,
    retryKey: true,
  });
  useEffect(() => {
    const activeCodeBlockId = notebook.document.blocks
      .find(block => block.type === "code")?.id;
    window.__notebookHarness = {
      editActive: (value) => {
        if (activeCodeBlockId) notebook.updateDraft(activeCodeBlockId, value);
      },
      transition: () => notebook.applyNotebookDocument(secondDocument),
    };
  }, [notebook.applyNotebookDocument, notebook.document.blocks, notebook.updateDraft]);
  return <div data-phase={notebook.persistence.phase}>{notebook.document.id}</div>;
}

createRoot(document.getElementById("root")).render(<Harness />);
""",
            encoding="utf-8",
        )
        esbuild = ROOT / "editor" / "node_modules" / ".bin" / (
            "esbuild.cmd" if os.name == "nt" else "esbuild"
        )
        environment = {
            **os.environ,
            "NODE_PATH": str(ROOT / "editor" / "node_modules"),
        }
        subprocess.run(
            [
                str(esbuild),
                str(entry),
                "--bundle",
                "--platform=browser",
                "--format=iife",
                f"--outfile={bundle}",
                f"--tsconfig={ROOT / 'editor/tsconfig.json'}",
                '--define:import.meta.env={"VITE_CODARO_API_BASE":""}',
            ],
            cwd=ROOT,
            env=environment,
            check=True,
        )
        (root / "index.html").write_text(
            """
<!doctype html>
<html>
  <head><meta name="codaro-runtime-tier" content="local"></head>
  <body><div id="root"></div><script src="/harness.js"></script></body>
</html>
""",
            encoding="utf-8",
        )
        handler = partial(QuietStaticHandler, directory=str(root))
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            browser = playwright.chromium.launch(headless=True)
            context = browser.new_context()
            page = context.new_page()
            page.add_init_script(
                """
                (() => {
                  window.__pathOwnerRequests = [];
                  window.fetch = async (_input, init = {}) => {
                    const body = JSON.parse(String(init.body || "{}"));
                    window.__pathOwnerRequests.push(body);
                    return new Response(JSON.stringify({
                      accepted: true,
                      path: body.path || `${body.document.id}.py`,
                      saveRevision: body.saveRevision,
                    }), {
                      status: 200,
                      headers: { "Content-Type": "application/json" },
                    });
                  };
                })();
                """
            )
            page.goto(
                f"http://127.0.0.1:{int(server.server_address[1])}/",
                wait_until="domcontentloaded",
                timeout=20_000,
            )
            page.wait_for_function("() => Boolean(window.__notebookHarness)", timeout=20_000)
            page.evaluate("window.__notebookHarness.editActive('first = 1')")
            page.wait_for_function(
                """() => window.__pathOwnerRequests
                  .some(request => request.document?.id === "new-notebook")""",
                timeout=10_000,
            )
            page.evaluate("window.__notebookHarness.transition()")
            page.wait_for_function(
                """() => window.__pathOwnerRequests
                  .some(request => request.document?.id === "document-2")""",
                timeout=10_000,
            )
            transitionRequest = page.evaluate(
                """() => window.__pathOwnerRequests
                  .find(request => request.document?.id === "document-2")"""
            )
            if transitionRequest["path"] is not None:
                raise AssertionError("new document reused the previous document's local path")
            page.evaluate("window.__notebookHarness.editActive('second = 3')")
            page.wait_for_function(
                """() => window.__pathOwnerRequests
                  .filter(request => request.document?.id === "document-2").length >= 2""",
                timeout=10_000,
            )
            secondRequests = page.evaluate(
                """() => window.__pathOwnerRequests
                  .filter(request => request.document?.id === "document-2")"""
            )
            if secondRequests[-1]["path"] != "document-2.py":
                raise AssertionError("allocated path was not retained by its owning document")
            context.close()
            browser.close()
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)


def main(argv: list[str] | None = None) -> int:
    from playwright.sync_api import sync_playwright

    parser = argparse.ArgumentParser()
    parser.add_argument("--reuse-build", action="store_true")
    args = parser.parse_args(argv)
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    npm = "npm.cmd" if os.name == "nt" else "npm"
    buildContext = (
        nullcontext(None)
        if args.reuse_build
        else tempfile.TemporaryDirectory(prefix="build-", dir=OUTPUT_ROOT)
    )
    with buildContext as tempDirectory:
        if args.reuse_build:
            staticRoot = ROOT / "src" / "codaro" / "webBuild"
            if not (staticRoot / "index.html").is_file():
                raise FileNotFoundError("editor build is missing; run npm run build in editor first")
            handlerClass = ReusedEditorBuildHandler
        else:
            if tempDirectory is None:
                raise RuntimeError("temporary build directory is unavailable")
            staticRoot = Path(tempDirectory)
            runRoot = staticRoot / "run"
            environment = {
                **os.environ,
                "CODARO_WEB_BASE": "run",
                "CODARO_WEB_OUT": str(runRoot),
            }
            subprocess.run(
                [npm, "run", "build"],
                cwd=ROOT / "editor",
                env=environment,
                check=True,
            )
            subprocess.run(
                [npm, "run", "build"],
                cwd=ROOT / "editor",
                check=True,
            )
            handlerClass = QuietStaticHandler

        handler = partial(handlerClass, directory=str(staticRoot))
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        port = int(server.server_address[1])
        consoleErrors: list[str] = []
        pageErrors: list[str] = []
        try:
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(headless=True)
                context = browser.new_context()
                page = context.new_page()
                page.on(
                    "console",
                    lambda message: consoleErrors.append(message.text)
                    if message.type == "error"
                    else None,
                )
                page.on("pageerror", lambda error: pageErrors.append(str(error)))
                page.goto(
                    f"http://127.0.0.1:{port}/run/?surface=editor#editor",
                    wait_until="domcontentloaded",
                    timeout=30_000,
                )
                page.wait_for_selector('[data-notebook-studio="true"]', timeout=30_000)
                marker = "autosave_round_trip = 'web-persisted'"
                page.locator(".cm-content").first.fill(marker, timeout=20_000)
                page.wait_for_selector(
                    '[data-notebook-persistence="saved"][data-notebook-persistence-mode="web"]',
                    timeout=20_000,
                )
                page.wait_for_function(
                    """marker => (
                      window.localStorage.getItem("codaro-notebook-document-v1") || ""
                    ).includes(marker)""",
                    arg=marker,
                    timeout=10_000,
                )

                page.reload(wait_until="domcontentloaded", timeout=30_000)
                page.wait_for_selector('[data-notebook-studio="true"]', timeout=30_000)
                page.wait_for_function(
                    """marker => Array.from(document.querySelectorAll(".cm-content"))
                      .some(element => (element.textContent || "").includes(marker))""",
                    arg=marker,
                    timeout=20_000,
                )
                page.wait_for_selector(
                    '[data-notebook-persistence-mode="web"]:not([data-notebook-persistence="error"])',
                    timeout=10_000,
                )
                page.get_by_label("셀 삭제").first.click(force=True, timeout=10_000)
                page.wait_for_selector(
                    '[data-notebook-persistence="saved"][data-notebook-persistence-mode="web"]',
                    timeout=20_000,
                )
                page.wait_for_function(
                    """() => {
                      const raw = window.localStorage.getItem("codaro-notebook-document-v1");
                      if (!raw) return false;
                      const payload = JSON.parse(raw);
                      return payload.document?.blocks?.length === 1
                        && payload.document.blocks[0].type === "code"
                        && payload.document.blocks[0].content === "";
                    }""",
                    timeout=10_000,
                )
                page.reload(wait_until="domcontentloaded", timeout=30_000)
                page.wait_for_selector('[data-notebook-studio="true"]', timeout=30_000)
                page.wait_for_function(
                    """() => {
                      const editors = Array.from(document.querySelectorAll(".cm-content"));
                      const activeCell = document.querySelector("[data-notebook-active-cell=true]");
                      return editors.length >= 1
                        && editors.every(
                          editor => !(editor.textContent || "").includes("autosave_round_trip"),
                        )
                        && (activeCell?.textContent || "").includes("셀 1 / 1");
                    }""",
                    timeout=20_000,
                )
                page.wait_for_timeout(500)
                context.close()
                browser.close()
                verifyLocalTransitionFlush(playwright, consoleErrors, pageErrors)
                verifyDocumentPathOwnership(playwright)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)

        if consoleErrors or pageErrors:
            for error in [*consoleErrors, *pageErrors]:
                print(f"FAIL: {error}")
            return 1

    print(
        "ok: notebook-autosave-browser "
        "(Web restore; Local bounded transition flush; document path ownership)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
