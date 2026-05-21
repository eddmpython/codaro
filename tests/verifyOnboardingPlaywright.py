from __future__ import annotations

import argparse
from datetime import UTC, datetime
import json
import socket
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

from browserStaticServer import StaticAppServer
from playwrightCli import PlaywrightCli, PlaywrightCliError, repoLocalPlaywrightWorkspace, resolvePlaywrightCli


ROOT = Path(__file__).resolve().parents[1]
ONBOARDING_REPORT_PATH = ROOT / "output" / "test-runner" / "onboarding-browser" / "onboarding-report.json"


def main(argv: list[str] | None = None) -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    checks: list[dict[str, Any]] = []
    args = buildParser().parse_args(argv)
    try:
        cliPath = resolvePlaywrightCli(ROOT)
    except PlaywrightCliError as exc:
        writeOnboardingReport(
            {
                "passed": False,
                "status": "failed",
                "checks": checks,
                "error": str(exc),
            },
            startedAt=startedAt,
            startedAtMonotonic=started,
        )
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1

    appPort = args.port or freeAppPort()
    api = OnboardingStubApi(port=freePort())
    api.start()
    url = f"http://127.0.0.1:{appPort}/#chat"
    workspace = repoLocalPlaywrightWorkspace(ROOT, "onboarding-browser")
    session = f"codaro-onboarding-{int(time.time())}"
    server = StaticAppServer(port=appPort, apiBaseUrl=api.baseUrl)
    server.start()
    cli: PlaywrightCli | None = None

    try:
        waitForHttp(url)
        cli = PlaywrightCli(cliPath=cliPath, cwd=workspace, session=session)
        cli.run("open", url)
        cli.run("resize", "1280", "900")
        cli.waitEval(jsTextPresent("Codaro로 무엇을 만들까요?"), "first onboarding screen")
        fallback = recordCheck(checks, "fallback-onboarding", cli.eval(jsAssertFallbackOnboarding()))
        cli.eval(jsInstallClipboardStub())
        diagnosticExport = recordCheck(checks, "diagnostic-export-copy", cli.eval(jsClickDiagnosticExportCopy()))
        providerCta = recordCheck(checks, "provider-connect-cta", cli.eval(jsClickOnboardingProviderConnect()))
        cli.waitEval(jsTextPresent("기본 안내 모드"), "provider fallback copy from onboarding CTA")
        fallbackSettings = recordCheck(checks, "provider-fallback-settings", cli.eval(jsAssertProviderFallbackSettings()))
        cli.eval(jsCloseProviderSettings())
        cli.waitEval(jsProviderSettingsClosed(), "provider settings closed after onboarding CTA")
        cli.eval(jsOpenSurface("커리큘럼"))
        cli.waitEval(jsTextPresent("Codaro 커리큘럼"), "curriculum sidebar")
        sidebar = recordCheck(checks, "curriculum-sidebar-groups", cli.eval(jsAssertCurriculumSidebarGroups()))
        cli.eval(jsOpenSurface("채팅"))
        cli.waitEval(jsTextPresent("Codaro로 무엇을 만들까요?"), "chat surface after sidebar check")
        api.ready = True
        cli.run("reload")
        cli.waitEval(jsTextPresent("Codaro로 무엇을 만들까요?"), "ready onboarding screen")
        ready = recordCheck(checks, "ready-onboarding", cli.eval(jsAssertReadyOnboarding()))
        cli.eval(jsOpenProviderSettings())
        cli.eval(jsClickProviderValidate())
        cli.waitEval(jsTextPresent("실제 응답 사용 중"), "provider ready copy")
        settings = recordCheck(checks, "provider-ready-settings", cli.eval(jsAssertProviderReadySettings()))
        api.assertExpectedCalls()
        recordCheck(checks, "expected-api-calls", "expected-api-calls-ok")
        writeOnboardingReport(
            {
                "passed": True,
                "status": "passed",
                "checks": checks,
                "signals": onboardingSignals(api.calls, checks),
            },
            startedAt=startedAt,
            startedAtMonotonic=started,
        )
        print(
            f"ok: onboarding browser verified {fallback} {diagnosticExport} {providerCta} "
            f"{fallbackSettings} {sidebar} {ready} {settings}"
        )
        return 0
    except (VerificationError, PlaywrightCliError) as exc:
        debugText = debugPageState(cli) if cli is not None else ""
        writeOnboardingReport(
            {
                "passed": False,
                "status": "failed",
                "checks": checks,
                "error": str(exc),
                "debugText": debugText[:2000],
                "signals": onboardingSignals(api.calls, checks),
            },
            startedAt=startedAt,
            startedAtMonotonic=started,
        )
        print(f"FAIL: {exc}", file=sys.stderr)
        if cli is not None:
            print(debugText, file=sys.stderr)
        print("API calls: " + json.dumps(api.calls, ensure_ascii=False), file=sys.stderr)
        return 1
    finally:
        if cli is not None:
            cli.close()
        server.stop()
        api.stop()


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Verify first-run onboarding browser surface")
    parser.add_argument("--port", type=int, default=0)
    return parser


class VerificationError(RuntimeError):
    pass


def recordCheck(checks: list[dict[str, Any]], caseId: str, result: str) -> str:
    checks.append({"caseId": caseId, "passed": True, "status": "passed", "result": result})
    return result


def onboardingSignals(apiCalls: list[str], checks: list[dict[str, Any]]) -> dict[str, Any]:
    checkIds = [str(check["caseId"]) for check in checks]
    return {
        "apiCallCount": len(apiCalls),
        "apiCalls": apiCalls,
        "checkIds": checkIds,
        "diagnosticExportCopied": "diagnostic-export-copy" in checkIds,
        "providerCtaOpenedSettings": "provider-connect-cta" in checkIds,
        "providerFallbackBeforeReady": "provider-fallback-settings" in checkIds,
        "providerReadyAfterValidate": "provider-ready-settings" in checkIds,
        "curriculumGroupsVisible": "curriculum-sidebar-groups" in checkIds,
    }


def writeOnboardingReport(payload: dict[str, Any], *, startedAt: str, startedAtMonotonic: float) -> Path:
    report = dict(payload)
    report["gate"] = "onboarding-browser"
    report["startedAt"] = startedAt
    report["completedAt"] = utcTimestamp()
    report["durationMs"] = round((time.monotonic() - startedAtMonotonic) * 1000)
    gitHead = currentGitHead()
    if gitHead:
        report["gitHead"] = gitHead
    report["reportPath"] = reportDisplayPath(ONBOARDING_REPORT_PATH)
    ONBOARDING_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    ONBOARDING_REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return ONBOARDING_REPORT_PATH


def reportDisplayPath(reportPath: Path) -> str:
    try:
        return str(reportPath.relative_to(ROOT))
    except ValueError:
        return str(reportPath)


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def currentGitHead() -> str | None:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
    except (FileNotFoundError, OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() or None


class OnboardingStubApi:
    def __init__(self, *, port: int) -> None:
        self.port = port
        self.baseUrl = f"http://127.0.0.1:{port}"
        self.ready = False
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
            "GET /api/health",
            "GET /api/bootstrap",
            "GET /api/system/diagnostics",
            "GET /api/system/diagnostics/export",
            "GET /api/ai/profile",
        }
        missing = sorted(required - set(self.calls))
        if missing:
            raise VerificationError("onboarding API calls missing: " + ", ".join(missing))

    def profile(self) -> dict[str, Any]:
        return {
            "defaultProvider": "oauth-chatgpt",
            "activeProvider": "oauth-chatgpt",
            "activeModel": "gpt-5.4",
            "ready": self.ready,
            "catalog": providerCatalog(),
            "providers": {
                "oauth-chatgpt": {"model": "gpt-5.4", "secretConfigured": self.ready},
                "openai": {"model": "gpt-4o-mini", "secretConfigured": False},
                "ollama": {"model": "llama3.2", "secretConfigured": False},
                "custom": {"model": "custom-model", "baseUrl": None, "secretConfigured": False},
            },
        }

    def _handler(self):
        owner = self

        class Handler(BaseHTTPRequestHandler):
            def do_OPTIONS(self):
                self._sendNoContent()

            def do_GET(self):
                parsed = urllib.parse.urlparse(self.path)
                path = parsed.path
                owner.calls.append(f"GET {path}")
                if path == "/api/health":
                    self._sendJson({"status": "ok"})
                elif path == "/api/bootstrap":
                    self._sendJson({"appMode": False, "documentPath": None, "workspaceRoot": str(ROOT), "rootPath": str(ROOT)})
                elif path == "/api/system/diagnostics":
                    self._sendJson(diagnosticPayload(owner.ready))
                elif path == "/api/system/diagnostics/export":
                    self._sendJson(diagnosticExportPayload(owner.ready))
                elif path == "/api/curriculum/categories":
                    self._sendJson({
                        "categories": [
                            {"key": "30days", "name": "파이썬 기초", "description": "첫 경로", "count": 30, "track": "Python 기초"},
                            {"key": "pandas", "name": "Pandas", "description": "데이터 분석", "count": 11, "track": "데이터 분석"},
                            {"key": "excel", "name": "엑셀 자동화", "description": "반복 작업 자동화", "count": 3, "track": "자동화·실무"},
                        ],
                        "groups": {
                            "Python 기초": ["30days"],
                            "데이터 분석": ["pandas"],
                            "자동화·실무": ["excel"],
                        },
                        "learningPaths": {},
                    })
                elif path.startswith("/api/curriculum/contents/"):
                    self._sendJson({"category": "python", "categoryName": "Python", "contents": [{"contentId": "hello", "title": "Hello World"}]})
                elif path.startswith("/api/curriculum/content/"):
                    self._sendJson(curriculumLessonPayload())
                elif path == "/api/ai/tools":
                    self._sendJson({"groups": [], "lanes": [], "tools": [], "grouped": {}, "byLane": {}})
                elif path == "/api/ai/profile":
                    self._sendJson(owner.profile())
                elif path == "/api/ai/providers":
                    self._sendJson({"catalog": providerCatalog()})
                else:
                    self._sendJson({"error": f"unhandled {path}"}, status=404)

            def do_POST(self):
                parsed = urllib.parse.urlparse(self.path)
                path = parsed.path
                owner.calls.append(f"POST {path}")
                if path == "/api/ai/provider/validate":
                    self._sendJson({
                        "valid": owner.ready,
                        "provider": "oauth-chatgpt",
                        "model": "gpt-5.4",
                        "message": "응답 검증을 통과했습니다." if owner.ready else "Provider 로그인이 필요합니다.",
                    })
                else:
                    self._sendJson({"error": f"unhandled {path}"}, status=404)

            def log_message(self, _format: str, *_args: object) -> None:
                return

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


def jsAssertFallbackOnboarding() -> str:
    return compactJs("""
(() => {
  const text = document.body.innerText;
  const providerButton = [...document.querySelectorAll('button')].find((button) => button.textContent?.includes('Provider 연결'));
  const avatar = [...document.querySelectorAll('img')].some((img) => img.getAttribute('src')?.includes('/brand/avatar-small.png'));
  const diagnosticExport = document.querySelector('[data-diagnostic-export-copy="true"]');
  const required = ['Codaro로 무엇을 만들까요?', '목표부터 말하세요', 'Provider 연결', '시작 진단 필요', '진단 복사', 'Pandas 레슨', '브라우저 루틴', '자동화 노트북'];
  const missing = required.filter((item) => !text.includes(item));
  if (missing.length) throw new Error('fallback onboarding missing: ' + missing.join(', '));
  if (!providerButton || providerButton.disabled) throw new Error('Provider 연결 button is missing or disabled');
  if (!diagnosticExport) throw new Error('diagnostic export copy button is missing');
  if (!avatar) throw new Error('Codaro avatar is missing on first screen');
  if (text.includes('provider 연결됨')) throw new Error('ready provider copy shown before provider connection');
  return 'fallback-onboarding-ok';
})()
""")


def jsInstallClipboardStub() -> str:
    return compactJs("""
(() => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async (text) => {
        window.__codaroCopiedDiagnosticExport = text;
      },
    },
  });
  return 'clipboard-stub-installed';
})()
""")


def jsClickDiagnosticExportCopy() -> str:
    return compactJs("""
(async () => {
  const button = document.querySelector('[data-diagnostic-export-copy="true"]');
  if (!button) throw new Error('diagnostic export copy button missing');
  button.click();
  const deadline = Date.now() + 4000;
  while (!window.__codaroCopiedDiagnosticExport && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  const copied = String(window.__codaroCopiedDiagnosticExport || '');
  if (!copied) throw new Error('diagnostic export was not copied');
  if (!copied.includes('codaro-local-diagnostic-export')) throw new Error('diagnostic export kind missing');
  if (!copied.includes('Provider 연결')) throw new Error('diagnostic readable action missing');
  if (copied.includes('oauth-secret-value') || copied.includes('sk-onboarding-secret')) throw new Error('diagnostic export leaked secret');
  return 'diagnostic-export-copy-ok';
})()
""")


def jsClickOnboardingProviderConnect() -> str:
    return compactJs("""
(() => {
  const button = [...document.querySelectorAll('button')].find((item) => item.textContent?.includes('Provider 연결'));
  if (!button) throw new Error('onboarding Provider 연결 CTA missing');
  if (button.disabled) throw new Error('onboarding Provider 연결 CTA disabled');
  button.click();
  return 'onboarding-provider-connect-ok';
})()
""")


def jsCloseProviderSettings() -> str:
    return compactJs("""
(() => {
  const button = [...document.querySelectorAll('button')].find((item) => item.textContent?.includes('닫기'));
  if (!button) throw new Error('provider settings close button missing');
  button.click();
  return 'provider-settings-closed';
})()
""")


def jsProviderSettingsClosed() -> str:
    return "(() => !document.body.innerText.includes('AI Provider'))()"


def jsAssertReadyOnboarding() -> str:
    return compactJs("""
(() => {
  const text = document.body.innerText;
  const providerButton = [...document.querySelectorAll('button')].find((button) => button.textContent?.includes('Provider 연결'));
  if (!text.includes('Codaro로 무엇을 만들까요?')) throw new Error('ready onboarding hero missing');
  if (providerButton) throw new Error('Provider 연결 button should not remain after provider is ready');
  if (text.includes('시작 진단 필요')) throw new Error('startup diagnostic warning should clear after provider is ready');
  return 'ready-onboarding-ok';
})()
""")


def jsAssertCurriculumSidebarGroups() -> str:
    return compactJs("""
(() => {
  const text = document.body.innerText;
  const required = ['Codaro 커리큘럼', 'Python 기초', '데이터 분석', '자동화·실무'];
  const missing = required.filter((item) => !text.includes(item));
  if (missing.length) throw new Error('curriculum sidebar groups missing: ' + missing.join(', '));
  const groupButtons = [...document.querySelectorAll('button')].filter((button) => ['Python 기초', '데이터 분석', '자동화·실무'].some((label) => button.textContent?.includes(label)));
  if (groupButtons.length < 3) throw new Error('curriculum sidebar group buttons missing');
  return 'curriculum-sidebar-groups-ok';
})()
""")


def jsOpenSurface(label: str) -> str:
    return compactJs(f"""
(() => {{
  const button = [...document.querySelectorAll('button')].find((item) => item.textContent?.trim() === {json.dumps(label, ensure_ascii=False)});
  if (!button) throw new Error({json.dumps(label + ' surface button missing', ensure_ascii=False)});
  button.click();
  return {json.dumps(label + '-surface-opened', ensure_ascii=False)};
}})()
""")


def jsOpenProviderSettings() -> str:
    return compactJs("""
(() => {
  const button = document.querySelector('button[aria-label="Provider 설정"]');
  if (!button) throw new Error('Provider settings button missing');
  button.click();
  return 'provider-settings-opened';
})()
""")


def jsAssertProviderReadySettings() -> str:
    return compactJs("""
(() => {
  const text = document.body.innerText;
  const required = ['Codaro가 채팅, 학습 셀, 자동화 요청에 사용할 provider를 연결합니다.', 'ChatGPT 구독', '실제 응답 사용 중'];
  const missing = required.filter((item) => !text.includes(item));
  if (missing.length) throw new Error('provider ready settings missing: ' + missing.join(', '));
  return 'provider-ready-settings-ok';
})()
""")


def jsClickProviderValidate() -> str:
    return compactJs("""
(() => {
  const card = document.querySelector('[data-provider-card="oauth-chatgpt"]');
  if (!card) throw new Error('oauth provider card missing');
  const button = [...card.querySelectorAll('button')].find((item) => item.textContent?.includes('응답 검증'));
  if (!button) throw new Error('provider response validation button missing');
  button.click();
  return 'provider-validate-clicked';
})()
""")


def jsAssertProviderFallbackSettings() -> str:
    return compactJs("""
(() => {
  const text = document.body.innerText;
  const required = ['기본 안내 모드', '연결 전에는 기본 안내만 사용합니다.', 'Provider 연결'];
  const missing = required.filter((item) => !text.includes(item));
  if (missing.length) throw new Error('provider fallback settings missing: ' + missing.join(', '));
  if (text.includes('실제 응답 사용 중')) throw new Error('ready provider copy shown in fallback provider settings');
  return 'provider-fallback-settings-ok';
})()
""")


def debugPageState(cli: PlaywrightCli) -> str:
    try:
        return cli.eval("document.body.innerText.slice(0, 2000)")
    except VerificationError as exc:
        return f"debug unavailable: {exc}"


def compactJs(source: str) -> str:
    return " ".join(line.strip() for line in source.strip().splitlines() if line.strip())


def providerCatalog() -> list[dict[str, Any]]:
    return [
        {"id": "oauth-chatgpt", "name": "ChatGPT OAuth", "label": "ChatGPT OAuth", "authKind": "oauth"},
        {"id": "openai", "name": "OpenAI", "label": "OpenAI", "authKind": "apiKey", "envKey": "OPENAI_API_KEY"},
        {"id": "ollama", "name": "Ollama", "label": "Ollama", "authKind": "local"},
        {"id": "custom", "name": "Custom", "label": "Custom", "authKind": "custom", "envKey": "CUSTOM_API_KEY"},
    ]


def diagnosticPayload(ready: bool) -> dict[str, Any]:
    if ready:
        return {
            "version": 1,
            "status": "ok",
            "items": [],
            "categories": {"provider": 0, "runtime": 0, "package": 0, "frontend": 0},
            "nextActions": [],
            "readableActions": [],
            "summaryText": "진단 정상",
        }
    return {
        "version": 1,
        "status": "needs-action",
        "items": [
            {
                "category": "provider",
                "code": "provider_not_connected",
                "message": "브라우저 로그인 후 실제 provider 응답을 사용할 수 있습니다.",
                "action": "connect-provider",
                "severity": "error",
                "recoverable": True,
                "metadata": {"provider": "oauth-chatgpt", "authKind": "oauth"},
            }
        ],
        "categories": {"provider": 1, "runtime": 0, "package": 0, "frontend": 0},
        "nextActions": ["connect-provider"],
        "readableActions": ["Provider 연결"],
        "summaryText": "Provider 1 · 브라우저 로그인 후 실제 provider 응답을 사용할 수 있습니다. · 다음: Provider 연결",
    }


def diagnosticExportPayload(ready: bool) -> dict[str, Any]:
    summary = diagnosticPayload(ready)
    return {
        "version": 1,
        "kind": "codaro-local-diagnostic-export",
        "generatedAt": "2026-05-22T00:00:00Z",
        "status": summary["status"],
        "summaryText": summary["summaryText"],
        "readableActions": summary["readableActions"],
        "categories": summary["categories"],
        "items": summary["items"],
        "summary": summary,
        "context": {
            "provider": {
                "activeProvider": "oauth-chatgpt",
                "ready": ready,
                "authKind": "oauth",
                "access_token": "[redacted]",
            },
            "package": {"installer": "uv"},
        },
        "redaction": {
            "secrets": "redacted",
            "policy": "token/apiKey/secret/authorization/oauth/sk values are removed",
        },
    }


def curriculumLessonPayload() -> dict[str, Any]:
    return {
        "category": "python",
        "contentId": "hello",
        "document": {
            "id": "onboarding-lesson",
            "title": "Hello World",
            "metadata": {"sourceFormat": "curriculum", "tags": ["python", "hello"]},
            "runtime": {"defaultEngine": "local", "reactiveMode": "hybrid", "packages": []},
            "app": {"title": "Hello World", "layout": "learning", "hideCode": False},
            "blocks": [
                {"id": "intro", "type": "markdown", "role": "title", "displayKind": "hero", "executionKind": "none", "sourceType": "intro", "title": "Hello World", "content": "# Hello World", "payload": {}},
                {"id": "cell-1", "type": "code", "role": "exercise", "displayKind": "cell", "executionKind": "python", "sourceType": "sectionContract:exercise", "title": "Hello World 실습", "content": "print('hello')", "payload": {}},
            ],
        },
        "solutions": {},
    }


if __name__ == "__main__":
    raise SystemExit(main())
