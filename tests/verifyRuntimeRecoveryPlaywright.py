from __future__ import annotations

import argparse
import json
import shutil
import socket
import sys
import tempfile
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

import yaml

from browserStaticServer import StaticAppServer
from codaro.curriculum.converter import yamlToDocument
from playwrightCli import PlaywrightCli, PlaywrightCliError, resolvePlaywrightCli


ROOT = Path(__file__).resolve().parents[1]
STORAGE_KEY = "codaro-custom-curricula"
FIXTURE_TITLE = "Runtime recovery browser fixture"
MISSING_PACKAGE = "codaro_missing_runtime_pkg"


def main(argv: list[str] | None = None) -> int:
    args = buildParser().parse_args(argv)
    try:
        cliPath = resolvePlaywrightCli(ROOT)
    except PlaywrightCliError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1

    appPort = args.port or freeAppPort()
    api = RuntimeRecoveryStubApi(port=freePort())
    api.start()
    url = f"http://127.0.0.1:{appPort}/#curriculum"
    tempRoot = Path(tempfile.mkdtemp(prefix="codaro-runtime-recovery-pw-"))
    session = f"codaro-runtime-recovery-{int(time.time())}"
    server = StaticAppServer(port=appPort, apiBaseUrl=api.baseUrl)
    server.start()
    cli: PlaywrightCli | None = None

    try:
        waitForHttp(url)
        cli = PlaywrightCli(cliPath=cliPath, cwd=tempRoot, session=session)
        cli.run("open", url)
        cli.run("resize", "1280", "900")
        cli.run("localstorage-set", STORAGE_KEY, json.dumps([customCurriculumEntry()], ensure_ascii=False))
        cli.run("reload")
        cli.waitEval(jsTextPresent(FIXTURE_TITLE), "custom runtime recovery curriculum")
        cli.eval(jsClickText(FIXTURE_TITLE))
        cli.waitEval(jsTextPresent("셀을 실행하면 결과와 오류가 여기에 표시됩니다."), "idle result recovery copy")
        idle = cli.eval(jsAssertIdleRuntimeRecovery())
        cli.eval(jsClickFirstRunButton())
        cli.waitEval(jsTextPresent("라이브러리 준비 실패"), "package install failure notice")
        failure = cli.eval(jsAssertPackageFailureRecovery())
        api.assertExpectedCalls()
        print(f"ok: runtime recovery browser verified {idle} {failure}")
        return 0
    except (VerificationError, PlaywrightCliError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        if cli is not None:
            print(debugPageState(cli), file=sys.stderr)
        print("API calls: " + json.dumps(api.calls, ensure_ascii=False), file=sys.stderr)
        return 1
    finally:
        if cli is not None:
            cli.close()
        server.stop()
        api.stop()
        shutil.rmtree(tempRoot, ignore_errors=True)


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Verify runtime recovery UI with Playwright CLI")
    parser.add_argument("--port", type=int, default=0)
    return parser


class VerificationError(RuntimeError):
    pass


class RuntimeRecoveryStubApi:
    def __init__(self, *, port: int) -> None:
        self.port = port
        self.baseUrl = f"http://127.0.0.1:{port}"
        self.calls: list[str] = []
        self._server = ThreadingHTTPServer(("127.0.0.1", port), self._handler())
        self._thread = threading.Thread(target=self._server.serve_forever, daemon=True)

    def start(self) -> None:
        self._thread.start()

    def stop(self) -> None:
        self._server.shutdown()
        self._server.server_close()
        self._thread.join(timeout=4)

    def assertExpectedCalls(self) -> None:
        required = {
            "POST /api/kernel/create",
            "GET /api/kernel/session-runtime-recovery/packages/list packages-check",
            f"POST /api/kernel/session-runtime-recovery/packages/install packages-install {MISSING_PACKAGE}",
        }
        missing = sorted(required - set(self.calls))
        if missing:
            raise VerificationError("runtime recovery API calls missing: " + ", ".join(missing))
        if any("execute" in call for call in self.calls):
            raise VerificationError("cell-call endpoint should not run after package install failure")

    def _handler(self):
        owner = self

        class Handler(BaseHTTPRequestHandler):
            def do_OPTIONS(self):
                self._sendNoContent()

            def do_GET(self):
                parsed = urllib.parse.urlparse(self.path)
                path = parsed.path
                if path == "/api/health":
                    owner.calls.append("GET /api/health")
                    self._sendJson({"status": "ok"})
                elif path == "/api/bootstrap":
                    owner.calls.append("GET /api/bootstrap")
                    self._sendJson({"appMode": False, "documentPath": None, "workspaceRoot": str(ROOT), "rootPath": str(ROOT)})
                elif path == "/api/curriculum/categories":
                    self._sendJson({
                        "categories": [{"key": "30days", "name": "파이썬 기초", "description": "runtime recovery", "count": 1}],
                        "groups": {"기본": ["30days"]},
                        "learningPaths": {},
                    })
                elif path.startswith("/api/curriculum/contents/"):
                    self._sendJson({"category": "30days", "categoryName": "파이썬 기초", "contents": [{"contentId": "runtime-recovery", "title": FIXTURE_TITLE}]})
                elif path.startswith("/api/curriculum/content/"):
                    self._sendJson({"document": customCurriculumDocument(), "solutions": {}})
                elif path == "/api/ai/tools":
                    self._sendJson({"groups": [], "lanes": [], "tools": [], "grouped": {}, "byLane": {}})
                elif path == "/api/ai/profile":
                    self._sendJson({"activeProvider": "oauth-chatgpt", "activeModel": "gpt-5.4", "ready": True, "catalog": [], "providers": {}})
                elif path == "/api/ai/providers":
                    self._sendJson({"catalog": []})
                elif path == "/api/packages/list":
                    self._sendJson([])
                elif path == "/api/kernel/session-runtime-recovery/packages/list":
                    owner.calls.append("GET /api/kernel/session-runtime-recovery/packages/list packages-check")
                    self._sendJson([])
                elif path.endswith("/variables"):
                    self._sendJson([])
                else:
                    self._sendJson({"error": f"unhandled {path}"}, status=404)

            def do_POST(self):
                parsed = urllib.parse.urlparse(self.path)
                path = parsed.path
                payload = self._readJson()
                if path == "/api/kernel/create":
                    owner.calls.append("POST /api/kernel/create")
                    self._sendJson({"sessionId": "session-runtime-recovery", "status": "ready"})
                elif path == "/api/kernel/session-runtime-recovery/packages/install":
                    packageName = str(payload.get("name") or "")
                    owner.calls.append(f"POST /api/kernel/session-runtime-recovery/packages/install packages-install {packageName}")
                    self._sendJson({
                        "package": packageName,
                        "success": False,
                        "message": f"{packageName} 설치 실패\nuv pip install failed",
                        "installer": "uv",
                        "environment": "project .venv",
                        "durationMs": 125,
                        "skipped": False,
                    })
                elif path.endswith("/execute"):
                    owner.calls.append(f"POST {path} cell-call")
                    self._sendJson({"type": "text", "status": "error", "data": "should not execute", "blockId": payload.get("blockId")})
                else:
                    self._sendJson({"error": f"unhandled {path}"}, status=404)

            def log_message(self, _format: str, *_args: object) -> None:
                return

            def _readJson(self) -> dict[str, Any]:
                length = int(self.headers.get("Content-Length") or "0")
                if not length:
                    return {}
                return json.loads(self.rfile.read(length).decode("utf-8"))

            def _sendNoContent(self):
                self.send_response(204)
                self._sendCors()
                self.end_headers()

            def _sendJson(self, payload: Any, *, status: int = 200):
                body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
                self.send_response(status)
                self._sendCors()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def _sendCors(self):
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "Content-Type")

        return Handler


def waitForHttp(url: str, timeout: float = 30.0) -> None:
    deadline = time.monotonic() + timeout
    lastError = ""
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=1.0) as response:
                if 200 <= response.status < 500:
                    return
        except (OSError, urllib.error.URLError) as exc:
            lastError = str(exc)
        time.sleep(0.25)
    raise VerificationError(f"dev server did not become ready: {lastError}")


def freePort() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


def freeAppPort() -> int:
    for _attempt in range(40):
        port = freePort()
        if not 5170 <= port <= 5179:
            return port
    raise VerificationError("could not find a non-517x app port")


def jsTextPresent(text: str) -> str:
    return f"document.body.innerText.includes({json.dumps(text, ensure_ascii=False)})"


def jsClickText(text: str) -> str:
    return compactJs(f"""
(() => {{
  const target = [...document.querySelectorAll('button,[role="button"],a')].find((element) => element.textContent?.includes({json.dumps(text, ensure_ascii=False)}));
  if (!target) throw new Error('click target missing: {text}');
  target.click();
  return 'clicked';
}})()
""")


def jsClickFirstRunButton() -> str:
    return compactJs("""
(() => {
  const buttons = [...document.querySelectorAll('button[aria-label="셀 실행"]')];
  const button = buttons.find((item) => !item.disabled);
  if (!button) throw new Error('enabled cell run button missing');
  button.click();
  return 'run-clicked';
})()
""")


def jsAssertIdleRuntimeRecovery() -> str:
    return compactJs("""
(() => {
  const text = document.body.innerText;
  const required = ['Python 실습 코드', '학습자가 작성', '셀을 실행하면 결과와 오류가 여기에 표시됩니다.'];
  const missing = required.filter((item) => !text.includes(item));
  if (missing.length) throw new Error('idle runtime recovery missing: ' + missing.join(', '));
  if (!document.querySelector('[data-learning-exercise-input-role="student-practice"]')) {
    throw new Error('direct student practice editor missing');
  }
  return 'idle-runtime-recovery-ok';
})()
""")


def jsAssertPackageFailureRecovery() -> str:
    return compactJs(f"""
(() => {{
  const text = document.body.innerText;
  const cellExecutionFailureLabel = '셀 실행 실패';
  const required = ['라이브러리 준비 실패', '{MISSING_PACKAGE}'];
  const missing = required.filter((item) => !text.includes(item));
  if (missing.length) throw new Error('package failure recovery missing: ' + missing.join(', '));
  if (text.includes(cellExecutionFailureLabel)) throw new Error('package failure was mislabeled as cell execution failure');
  if (text.includes('should not execute')) throw new Error('cell-call result leaked after failed package install');
  return 'package-failure-recovery-ok';
}})()
""")


def debugPageState(cli: PlaywrightCli) -> str:
    try:
        return cli.eval("document.body.innerText.slice(0, 2000)")
    except VerificationError as exc:
        return f"debug unavailable: {exc}"


def compactJs(source: str) -> str:
    return " ".join(line.strip() for line in source.strip().splitlines() if line.strip())


def customCurriculumEntry() -> dict[str, Any]:
    return {
        "id": "custom-runtime-recovery",
        "title": FIXTURE_TITLE,
        "document": customCurriculumDocument(),
        "createdAt": 1_700_000_000_000,
    }


def customCurriculumDocument() -> dict[str, Any]:
    document, _solutions = yamlToDocument(yaml.safe_load(structuredLessonYaml()), "runtime-recovery", "package-failure")
    payload = document.model_dump(mode="json")
    payload["id"] = "runtime-recovery-document"
    return compactDocumentForBrowserStorage(payload)


def compactDocumentForBrowserStorage(document: dict[str, Any]) -> dict[str, Any]:
    blocks = document.get("blocks")
    if not isinstance(blocks, list):
        return document
    compactBlocks = []
    for index, block in enumerate(block for block in blocks if isinstance(block, dict)):
        compact = compactBlock(block)
        compact["id"] = f"rr{index}"
        compactBlocks.append(compact)
    return {
        "id": document.get("id"),
        "title": document.get("title"),
        "blocks": compactBlocks,
        "runtime": document.get("runtime"),
    }


def compactBlock(block: dict[str, Any]) -> dict[str, Any]:
    result = {
        key: block.get(key)
        for key in (
            "id",
            "type",
            "content",
            "role",
            "executionKind",
            "displayKind",
            "sourceType",
            "title",
            "description",
            "guide",
        )
        if block.get(key) not in (None, "", [], {})
    }
    payload = compactBlockPayload(block)
    if payload:
        result["payload"] = payload
    return result


def compactBlockPayload(block: dict[str, Any]) -> dict[str, Any] | None:
    payload = block.get("payload")
    if not isinstance(payload, dict):
        return None
    if block.get("sourceType") == "intro":
        contract = payload.get("learningContract")
        return {"learningContract": compactLearningContract(contract)} if isinstance(contract, dict) else None
    if block.get("sourceType") == "section":
        contract = payload.get("sectionContract")
        return {
            key: value
            for key, value in {
                "title": payload.get("title"),
                "subtitle": payload.get("subtitle"),
                "id": payload.get("id"),
                "sectionContract": compactSectionContract(contract) if isinstance(contract, dict) else None,
                "sectionContractGaps": payload.get("sectionContractGaps"),
            }.items()
            if value not in (None, "", [], {})
        }
    if block.get("sourceType") == "sectionContract:check":
        return {"check": payload.get("check"), "sectionId": payload.get("sectionId")}
    return None


def compactLearningContract(contract: dict[str, Any]) -> dict[str, Any]:
    meta = contract.get("meta") if isinstance(contract.get("meta"), dict) else {}
    intro = contract.get("intro") if isinstance(contract.get("intro"), dict) else {}
    return {
        "meta": {"title": meta.get("title"), "packages": meta.get("packages")},
        "intro": {"direction": intro.get("direction"), "benefits": intro.get("benefits"), "diagram": intro.get("diagram")},
    }


def compactSectionContract(contract: dict[str, Any]) -> dict[str, Any]:
    return {
        key: value
        for key, value in {
            "id": contract.get("id"),
            "title": contract.get("title"),
            "subtitle": contract.get("subtitle"),
            "goal": contract.get("goal"),
            "why": contract.get("why"),
            "explanation": contract.get("explanation"),
            "tips": contract.get("tips"),
            "contractGaps": contract.get("contractGaps"),
        }.items()
        if value not in (None, "", [], {})
    }


def structuredLessonYaml() -> str:
    return f"""
meta:
  title: {FIXTURE_TITLE}
  audience: local dogfood learner
  difficulty: beginner
  packages:
    - {MISSING_PACKAGE}
intro:
  direction: runtime recovery path
  benefits:
    - package failure is shown near the cell
  diagram:
    runtime: packages-check → packages-install → cell-call
sections:
  - id: recovery
    title: Runtime 복구
    subtitle: 패키지 설치 실패를 셀 근처에서 확인
    goal: runtime preflight가 실행 전에 필요한 패키지를 확인한다.
    why: 설치 실패가 cell-call로 번지지 않아야 다시 실행 경로가 분명하다.
    explanation: 실행 전 package preflight가 필요한 패키지를 확인하고 실패를 사용자 문장으로 돌려준다.
    tips:
      - 실패한 패키지 이름과 설치 경로를 먼저 본다.
      - 설치 실패 뒤에는 셀 실행을 진행하지 않는다.
    snippet: |
      import {MISSING_PACKAGE}
      print("ready")
    exercise:
      prompt: 실패를 확인하기 위해 실습 셀을 실행하세요.
      starterCode: |
        import {MISSING_PACKAGE}
        print("ready")
      solution: |
        print("fallback")
      check:
        noError: 실행 오류가 없어야 한다.
      hints:
        - 먼저 라이브러리 준비 실패가 보이는지 확인하세요.
    check:
      noError: 실행 오류가 없어야 한다.
"""


if __name__ == "__main__":
    raise SystemExit(main())
