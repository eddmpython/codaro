from __future__ import annotations

from datetime import UTC, datetime
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import threading
import time
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))
sys.path.insert(0, str(ROOT / "tests"))

from playwrightCli import repoLocalPlaywrightWorkspace  # noqa: E402

REPORT_ROOT = ROOT / "output" / "test-runner" / "markdown-diagram"
REPORT_PATH = REPORT_ROOT / "markdown-diagram-report.json"
SCREENSHOT_PATH = REPORT_ROOT / "markdown-diagram.png"

SPACER_LINES = "\n".join(
    f"# 화면 아래 다이어그램 지연 로딩 확인 {index}<br><br><br><br>" for index in range(60)
)
BUDGET_NODES = "\n".join(f"#   N{index}[노드 {index}]" for index in range(25))

DOCUMENT_SOURCE = f"""# %% [code] id=code-cell
print("diagram-ready")

# %% [markdown] id=diagram-spacer
# # 지연 로딩 검사
{SPACER_LINES}

# %% [markdown] id=diagram-valid
# # 실행 흐름
# <span onclick="window.__codaroMarkdownXss = true">안전한 설명</span>
# <script>window.__codaroMarkdownXss = true</script>
#
# ```mermaid
# flowchart LR
#   accTitle: Codaro Markdown 다이어그램
#   accDescr: Markdown 원문이 안전한 공통 렌더러를 거쳐 제품 화면에 표시됩니다.
#   A[Markdown 원문] --> B[안전한 렌더링]
#   B --> C[Web과 Local 공통 UI]
# ```
#
# 원문을 선택하면 다시 편집할 수 있습니다.

# %% [markdown] id=diagram-invalid
# ```mermaid
# flowchart LR
#   A[외부 링크] --> B[차단]
#   click A "https://example.com"
# ```

# %% [markdown] id=diagram-budget
# ```mermaid
# flowchart LR
{BUDGET_NODES}
# ```
"""


class VerificationError(RuntimeError):
    pass


def gitHead() -> str:
    completed = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return completed.stdout.strip()


def startLocalServer(workspace: Path, documentPath: Path) -> tuple[Any, threading.Thread, int]:
    import uvicorn
    from codaro.server import createServerApp, createServerEventLoop

    app = createServerApp(mode="edit", documentPath=documentPath, workspaceRoot=workspace)
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
    thread.join(timeout=5)
    raise VerificationError("Markdown diagram product server did not start")


def invoke(page: Any, actionId: str, args: dict[str, Any]) -> dict[str, Any]:
    receipt = page.evaluate(
        "([actionId, args]) => window.codaroGui.invoke(actionId, args)",
        [actionId, args],
    )
    if not isinstance(receipt, dict) or receipt.get("ok") is not True:
        raise VerificationError(f"GUI action failed: {actionId}: {receipt}")
    return receipt


def waitForReady(page: Any) -> None:
    page.wait_for_function(
        "() => window.codaroGui?.ready === true && window.codaroGui.getState().loadState === 'ready'",
        timeout=45_000,
    )


def diagramNodeFill(page: Any) -> str:
    return str(page.evaluate(
        """() => {
          const node = document.querySelector("[data-notebook-cell-id='diagram-valid'] [data-markdown-diagram-svg] .node rect, [data-notebook-cell-id='diagram-valid'] [data-markdown-diagram-svg] .node polygon, [data-notebook-cell-id='diagram-valid'] [data-markdown-diagram-svg] .node path");
          return node ? getComputedStyle(node).fill : "";
        }"""
    ))


def verifyBrowser(page: Any, baseUrl: str) -> dict[str, Any]:
    consoleErrors: list[str] = []
    pageErrors: list[str] = []
    page.on(
        "console",
        lambda message: consoleErrors.append(message.text) if message.type == "error" else None,
    )
    page.on("pageerror", lambda error: pageErrors.append(str(error)))
    chatResponse = page.goto(
        f"{baseUrl}/?surface=chat#chat",
        wait_until="domcontentloaded",
        timeout=45_000,
    )
    if chatResponse is None or chatResponse.status != 200:
        raise VerificationError(f"Non-diagram surface did not return 200: {chatResponse}")
    page.locator("[data-product-surface-ready='chat']").wait_for(timeout=45_000)
    loadedBeforeDiagramSurface = bool(page.evaluate(
        "() => performance.getEntriesByType('resource').some(entry => entry.name.includes('diagramRuntime-'))"
    ))
    if loadedBeforeDiagramSurface:
        raise VerificationError("Mermaid runtime loaded on a surface without a Markdown diagram")

    response = page.goto(
        f"{baseUrl}/?surface=editor#editor",
        wait_until="domcontentloaded",
        timeout=45_000,
    )
    if response is None or response.status != 200:
        raise VerificationError(f"Markdown diagram surface did not return 200: {response}")
    waitForReady(page)

    state = page.evaluate("window.codaroGui.getState()")
    cells = state.get("notebook", {}).get("cells", [])
    codeCell = next((cell for cell in cells if cell.get("id") == "code-cell"), None)
    if codeCell is None:
        raise VerificationError("Diagram fixture code cell is missing")
    scrollState = page.evaluate(
        """() => Array.from(document.querySelectorAll('[data-slot=scroll-area-viewport]')).map((node, index) => ({ index, top: node.scrollTop, height: node.clientHeight, scrollHeight: node.scrollHeight }))"""
    )
    page.evaluate("() => document.querySelector('[data-notebook-cell-id=diagram-spacer]')?.scrollIntoView({ block: 'start' })")
    page.wait_for_timeout(300)
    spacer = page.locator("[data-notebook-cell-id='diagram-spacer']")
    spacerBox = spacer.bounding_box()
    validBoxBeforeScroll = page.locator("[data-notebook-cell-id='diagram-valid']").bounding_box()
    viewportHeight = int(page.evaluate("window.innerHeight"))

    valid = page.locator("[data-notebook-cell-id='diagram-valid']")
    invalid = page.locator("[data-notebook-cell-id='diagram-invalid']")
    budget = page.locator("[data-notebook-cell-id='diagram-budget']")
    page.wait_for_timeout(500)
    loadedBeforeVisibleDiagram = bool(page.evaluate(
        "() => performance.getEntriesByType('resource').some(entry => entry.name.includes('diagramRuntime-'))"
    ))
    if loadedBeforeVisibleDiagram:
        raise VerificationError(
            "Mermaid runtime loaded before an offscreen diagram approached the viewport: "
            f"spacer={spacerBox}, diagram={validBoxBeforeScroll}, viewportHeight={viewportHeight}, scrollState={scrollState}"
        )
    valid.scroll_into_view_if_needed()
    valid.locator("[data-markdown-diagram='ready']").wait_for(timeout=60_000)
    invalid.locator("[data-markdown-diagram='error']").wait_for(timeout=20_000)
    budget.scroll_into_view_if_needed()
    budget.locator("[data-markdown-diagram='error']").wait_for(timeout=20_000)
    valid.locator("[data-notebook-cell-menu]").evaluate("element => { element.open = true; }")
    valid.locator("[data-cell-ai-help-trigger]").evaluate("element => element.click()")
    valid.get_by_role("button", name="다이어그램", exact=True).wait_for(timeout=5_000)
    valid.locator("[data-notebook-cell-menu]").evaluate("element => { element.open = false; }")

    if page.evaluate("() => Boolean(window.__codaroMarkdownXss)"):
        raise VerificationError("Unsafe Markdown script or event handler executed")
    if valid.locator("script, [onclick], iframe, object, embed, svg a, svg image, svg foreignObject").count():
        raise VerificationError("Sanitized Markdown or Mermaid SVG retained an unsafe element")
    if "클릭 동작" not in invalid.inner_text():
        raise VerificationError("Unsafe Mermaid click action did not produce an inline error")
    if "노드는 24개" not in budget.inner_text():
        raise VerificationError("Mermaid node budget did not produce an inline error")

    svg = valid.locator("[data-markdown-diagram-svg] svg")
    if svg.get_attribute("role") != "img" or not svg.get_attribute("aria-label"):
        raise VerificationError("Rendered Mermaid SVG is missing its accessible image name")
    if not svg.get_attribute("viewBox"):
        raise VerificationError("Rendered Mermaid SVG is missing a responsive viewBox")
    if valid.locator("[data-markdown-diagram-text-alternative]").text_content().find("flowchart LR") < 0:
        raise VerificationError("Diagram source text alternative is missing")
    renderedNodeCount = valid.locator("[data-markdown-diagram-svg] g.node").count()
    if not 1 <= renderedNodeCount <= 24:
        raise VerificationError(f"Rendered node budget drifted: {renderedNodeCount}")

    previewBox = valid.locator("[data-notebook-markdown-preview]").bounding_box()
    svgBox = svg.bounding_box()
    if previewBox is None or svgBox is None or svgBox["width"] > previewBox["width"] + 1:
        raise VerificationError(f"Diagram overflowed its Markdown preview: preview={previewBox}, svg={svgBox}")

    loadedAfterPreview = bool(page.evaluate(
        "() => performance.getEntriesByType('resource').some(entry => entry.name.includes('diagramRuntime-'))"
    ))
    if not loadedAfterPreview:
        raise VerificationError("Mermaid runtime was not loaded after a diagram preview became visible")

    initialFill = diagramNodeFill(page)
    invoke(page, "design.setTheme", {"mode": "dark"})
    invoke(page, "design.setAccent", {"accent": "teal"})
    page.wait_for_function(
        "() => document.documentElement.dataset.theme === 'dark' && document.documentElement.dataset.accent === 'teal'",
        timeout=10_000,
    )
    page.wait_for_function(
        "initialFill => { const node = document.querySelector(\"[data-notebook-cell-id='diagram-valid'] [data-markdown-diagram-svg] .node rect, [data-notebook-cell-id='diagram-valid'] [data-markdown-diagram-svg] .node polygon, [data-notebook-cell-id='diagram-valid'] [data-markdown-diagram-svg] .node path\"); return node && getComputedStyle(node).fill !== initialFill; }",
        arg=initialFill,
        timeout=30_000,
    )
    themedFill = diagramNodeFill(page)
    valid.scroll_into_view_if_needed()
    page.screenshot(path=str(SCREENSHOT_PATH), full_page=True)

    if consoleErrors or pageErrors:
        raise VerificationError(
            "Browser errors: " + json.dumps(
                {"console": consoleErrors, "page": pageErrors},
                ensure_ascii=False,
            )
        )
    return {
        "lazyRuntime": {
            "beforeDiagramSurface": loadedBeforeDiagramSurface,
            "beforeVisibleDiagram": loadedBeforeVisibleDiagram,
            "afterDiagramPreview": loadedAfterPreview,
        },
        "nodeCount": renderedNodeCount,
        "authoringAction": True,
        "sanitized": True,
        "sourcePreserved": True,
        "theme": {"initialFill": initialFill, "themedFill": themedFill},
        "viewport": {"preview": previewBox, "svg": svgBox},
    }


def main() -> int:
    from playwright.sync_api import sync_playwright

    REPORT_ROOT.mkdir(parents=True, exist_ok=True)
    previousHome = os.environ.get("CODARO_HOME")
    server = None
    thread = None
    report: dict[str, Any] = {
        "gate": "markdown-diagram",
        "generatedAt": datetime.now(tz=UTC).isoformat(timespec="seconds"),
        "gitHead": gitHead(),
        "schemaVersion": 1,
        "status": "failed",
    }
    try:
        playwrightWorkspace = repoLocalPlaywrightWorkspace(ROOT, "markdown-diagram")
        with tempfile.TemporaryDirectory(prefix="product-", dir=playwrightWorkspace) as rootText:
            root = Path(rootText)
            workspace = root / "workspace"
            workspace.mkdir()
            documentPath = workspace / "diagram.py"
            documentPath.write_text(DOCUMENT_SOURCE, encoding="utf-8")
            os.environ["CODARO_HOME"] = str(root / "home")
            server, thread, port = startLocalServer(workspace, documentPath)
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(headless=True)
                context = browser.new_context(
                    color_scheme="light",
                    locale="ko-KR",
                    service_workers="block",
                    viewport={"width": 1024, "height": 768},
                )
                page = context.new_page()
                report["browser"] = verifyBrowser(page, f"http://127.0.0.1:{port}")
                context.close()
                browser.close()
        report["status"] = "passed"
        REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 0
    except Exception as error:
        report["error"] = str(error)
        REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        raise
    finally:
        if server is not None:
            server.should_exit = True
        if thread is not None:
            thread.join(timeout=10)
            if thread.is_alive() and server is not None:
                server.force_exit = True
                thread.join(timeout=5)
        if previousHome is None:
            os.environ.pop("CODARO_HOME", None)
        else:
            os.environ["CODARO_HOME"] = previousHome


if __name__ == "__main__":
    raise SystemExit(main())
