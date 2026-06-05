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

_TESTS_ROOT = Path(__file__).resolve().parents[1]
if str(_TESTS_ROOT) not in sys.path:
    sys.path.insert(0, str(_TESTS_ROOT))

from browserStaticServer import StaticAppServer  # noqa: E402
from playwrightCli import (  # noqa: E402
    PlaywrightCli,
    PlaywrightCliError,
    repoLocalPlaywrightWorkspace,
    resolvePlaywrightCli,
    uniquePlaywrightSessionName,
)


ROOT = Path(__file__).resolve().parents[2]
PROVIDER_SETTINGS_REPORT_PATH = ROOT / "output" / "test-runner" / "provider-settings-browser" / "provider-settings-report.json"


def main(argv: list[str] | None = None) -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    checks: list[dict[str, Any]] = []
    args = buildParser().parse_args(argv)
    try:
        cliPath = resolvePlaywrightCli(ROOT)
    except PlaywrightCliError as exc:
        writeProviderSettingsReport(
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
    api = ProviderStubApi(port=freePort())
    api.start()
    url = f"http://127.0.0.1:{appPort}/#chat"
    workspace = repoLocalPlaywrightWorkspace(ROOT, "provider-settings-browser")
    session = uniquePlaywrightSessionName("codaro-provider-settings")
    server = StaticAppServer(port=appPort, apiBaseUrl=api.baseUrl)
    server.start()
    cli: PlaywrightCli | None = None

    try:
        waitForHttp(url)
        cli = PlaywrightCli(cliPath=cliPath, cwd=workspace, session=session)
        cli.run("open", url)
        cli.run("resize", "1280", "900")
        cli.waitEval(jsPageReady(), "app ready")
        cli.eval(jsDisablePopup())
        cli.eval(jsOpenProviderSettings())
        cli.waitEval(jsProviderSheetReady(), "provider settings sheet")
        initial = recordCheck(checks, "initial-provider-settings", cli.eval(jsAssertInitialProviderSettings()))
        oauthLoginFailure = recordCheck(checks, "oauth-state-mismatch", cli.eval(jsLoginOauthFailure()))
        cli.eval(jsConfigureStub({"oauthStatusMode": "permission_denied"}))
        oauthPermissionFailure = recordCheck(checks, "oauth-permission-denied", cli.eval(jsLoginOauthPermissionFailure()))
        cli.eval(jsConfigureStub({"oauthStatusMode": "success", "oauthValidationMode": "valid"}))
        oauthLoginSuccess = recordCheck(checks, "oauth-login-success", cli.eval(jsLoginOauthSuccess()))
        cli.eval(jsOpenProviderSettings())
        cli.waitEval(jsProviderSheetReady(), "provider settings sheet after OAuth login")
        oauthLive = recordCheck(checks, "oauth-live-status", cli.eval(jsAssertOauthLive()))
        selected = recordCheck(checks, "openai-provider-selected", cli.eval(jsSelectStoredOpenaiProvider()))
        cli.waitEval(jsOpenaiLiveReady(), "openai provider live validation")
        openai = recordCheck(checks, "openai-live-status", cli.eval(jsAssertOpenaiLive()))
        cli.eval(jsConfigureStub({"oauthValidationMode": "compat"}))
        oauth = recordCheck(
            checks,
            "oauth-compatibility-failure",
            cli.eval(jsValidateProviderFailure("oauth-chatgpt", "OAuth 호환성 점검", "다시 로그인 필요")),
        )
        ollama = recordCheck(
            checks,
            "ollama-network-failure",
            cli.eval(jsValidateProviderFailure("ollama", "네트워크 문제", None)),
        )
        custom = recordCheck(
            checks,
            "custom-base-url-failure",
            cli.eval(jsValidateProviderFailure("custom", "Base URL 입력 필요", None)),
        )
        desktopVisual = recordCheck(
            checks,
            "desktop-visual-integrity",
            cli.eval(jsAssertProviderSettingsVisualIntegrity("desktop")),
        )
        cli.run("resize", "390", "844")
        cli.waitEval(jsProviderSheetReady(), "provider settings sheet after mobile resize")
        mobileVisual = recordCheck(
            checks,
            "mobile-visual-integrity",
            cli.eval(jsAssertProviderSettingsVisualIntegrity("mobile")),
        )
        api.assertExpectedCalls()
        recordCheck(checks, "expected-api-calls", "expected-api-calls-ok")
        writeProviderSettingsReport(
            {
                "passed": True,
                "status": "passed",
                "checks": checks,
                "signals": providerSettingsSignals(api.calls, checks),
            },
            startedAt=startedAt,
            startedAtMonotonic=started,
        )
        print(
            "ok: provider settings browser smoke verified "
            f"{initial} {oauthLoginFailure} {oauthPermissionFailure} {oauthLoginSuccess} {oauthLive} "
            f"{selected} {openai} {oauth} {ollama} {custom} {desktopVisual} {mobileVisual}"
        )
        return 0
    except (VerificationError, PlaywrightCliError) as exc:
        debugText = debugPageState(cli) if cli is not None else ""
        writeProviderSettingsReport(
            {
                "passed": False,
                "status": "failed",
                "checks": checks,
                "error": str(exc),
                "debugText": debugText[:2000],
                "signals": providerSettingsSignals(api.calls, checks),
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
    parser = argparse.ArgumentParser(description="Verify provider settings rendering with Playwright CLI")
    parser.add_argument("--port", type=int, default=0)
    return parser


class VerificationError(RuntimeError):
    pass


def recordCheck(checks: list[dict[str, Any]], caseId: str, result: str) -> str:
    checks.append({"caseId": caseId, "passed": True, "status": "passed", "result": result})
    return result


def providerSettingsSignals(apiCalls: list[str], checks: list[dict[str, Any]]) -> dict[str, Any]:
    checkIds = [str(check["caseId"]) for check in checks]
    return {
        "apiCallCount": len(apiCalls),
        "apiCalls": apiCalls,
        "checkIds": checkIds,
        "oauthStateMismatchHandled": "oauth-state-mismatch" in checkIds,
        "oauthPermissionDeniedHandled": "oauth-permission-denied" in checkIds,
        "oauthLoginSucceeded": "oauth-login-success" in checkIds,
        "oauthLiveAfterLogin": "oauth-live-status" in checkIds,
        "openaiSelectedAndLive": "openai-live-status" in checkIds,
        "oauthCompatibilityFailureHandled": "oauth-compatibility-failure" in checkIds,
        "ollamaNetworkFailureHandled": "ollama-network-failure" in checkIds,
        "customBaseUrlFailureHandled": "custom-base-url-failure" in checkIds,
        "desktopVisualIntegrity": "desktop-visual-integrity" in checkIds,
        "mobileVisualIntegrity": "mobile-visual-integrity" in checkIds,
    }


def writeProviderSettingsReport(payload: dict[str, Any], *, startedAt: str, startedAtMonotonic: float) -> Path:
    report = dict(payload)
    report["gate"] = "provider-settings-browser"
    report["startedAt"] = startedAt
    report["completedAt"] = utcTimestamp()
    report["durationMs"] = round((time.monotonic() - startedAtMonotonic) * 1000)
    gitHead = currentGitHead()
    if gitHead:
        report["gitHead"] = gitHead
    report["reportPath"] = reportDisplayPath(PROVIDER_SETTINGS_REPORT_PATH)
    PROVIDER_SETTINGS_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    PROVIDER_SETTINGS_REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return PROVIDER_SETTINGS_REPORT_PATH


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


class ProviderStubApi:
    def __init__(self, *, port: int) -> None:
        self.port = port
        self.baseUrl = f"http://127.0.0.1:{port}"
        self.calls: list[str] = []
        self.activeProvider = "oauth-chatgpt"
        self.oauthSecretConfigured = False
        self.oauthStatusMode = "state_mismatch"
        self.oauthValidationMode = "compat"
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
            "PUT /api/ai/profile openai",
            "GET /api/oauth/authorize",
            "GET /api/oauth/status state_mismatch",
            "GET /api/oauth/status permission_denied",
            "GET /api/oauth/status success",
            "POST /api/ai/provider/validate openai valid",
            "POST /api/ai/provider/validate oauth-chatgpt compat",
            "POST /api/ai/provider/validate oauth-chatgpt valid",
            "POST /api/ai/provider/validate ollama network",
            "POST /api/ai/provider/validate custom base_url_missing",
        }
        missing = sorted(required - set(self.calls))
        if missing:
            raise VerificationError("provider settings API calls missing: " + ", ".join(missing))

    def profile(self) -> dict[str, Any]:
        return {
            "defaultProvider": "oauth-chatgpt",
            "activeProvider": self.activeProvider,
            "activeModel": "gpt-4o-mini" if self.activeProvider == "openai" else "gpt-5.4",
            "ready": self.activeProvider == "openai" or (self.activeProvider == "oauth-chatgpt" and self.oauthSecretConfigured),
            "catalog": providerCatalog(),
            "providers": {
                "oauth-chatgpt": {"model": "gpt-5.4", "secretConfigured": self.oauthSecretConfigured},
                "openai": {"model": "gpt-4o-mini", "secretConfigured": True},
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
                if path == "/api/health":
                    self._sendJson({"status": "ok"})
                elif path == "/api/bootstrap":
                    self._sendJson({
                        "appMode": False,
                        "documentPath": None,
                        "workspaceRoot": str(ROOT),
                        "rootPath": str(ROOT),
                    })
                elif path == "/api/curriculum/categories":
                    self._sendJson({
                        "categories": [{"key": "python", "name": "Python", "description": "기본", "count": 1}],
                        "groups": {"기본": ["python"]},
                        "learningPaths": {},
                    })
                elif path.startswith("/api/curriculum/contents/"):
                    category = path.rsplit("/", 1)[-1]
                    self._sendJson({
                        "category": category,
                        "categoryName": "Python",
                        "contents": [{"contentId": "hello", "title": "Hello"}],
                    })
                elif path.startswith("/api/curriculum/content/"):
                    self._sendJson(curriculumLessonPayload())
                elif path == "/api/ai/tools":
                    self._sendJson({"groups": [], "lanes": [], "tools": [], "grouped": {}, "byLane": {}})
                elif path == "/api/ai/profile":
                    self._sendJson(owner.profile())
                elif path == "/api/ai/providers":
                    self._sendJson({"catalog": providerCatalog()})
                elif path == "/api/oauth/authorize":
                    owner.calls.append("GET /api/oauth/authorize")
                    self._sendJson({"authUrl": f"{owner.baseUrl}/oauth/stub", "state": "state-test"})
                elif path == "/api/oauth/status":
                    owner.calls.append(f"GET /api/oauth/status {owner.oauthStatusMode}")
                    if owner.oauthStatusMode == "success":
                        owner.oauthSecretConfigured = True
                        owner.activeProvider = "oauth-chatgpt"
                        self._sendJson({"done": True, "error": None})
                    elif owner.oauthStatusMode == "state_mismatch":
                        self._sendJson({
                            "done": True,
                            "error": "state_mismatch",
                            "message": "보안 검증이 실패했습니다. Provider 설정에서 로그인을 다시 시작하세요.",
                            "diagnostic": {
                                "code": "oauth_state_mismatch",
                                "message": "보안 검증이 실패했습니다. Provider 설정에서 로그인을 다시 시작하세요.",
                                "action": "restart-login",
                                "provider": "oauth-chatgpt",
                                "recoverable": True,
                                "statusCode": 503,
                            },
                        })
                    elif owner.oauthStatusMode == "permission_denied":
                        self._sendJson({
                            "done": True,
                            "error": "oauth_permission_denied",
                            "message": "Provider 권한이 허용되지 않았습니다. 브라우저에서 권한을 허용한 뒤 다시 로그인하세요.",
                            "diagnostic": {
                                "code": "oauth_permission_denied",
                                "message": "Provider 권한이 허용되지 않았습니다. 브라우저에서 권한을 허용한 뒤 다시 로그인하세요.",
                                "action": "check-permission",
                                "provider": "oauth-chatgpt",
                                "recoverable": True,
                                "statusCode": 503,
                            },
                        })
                    else:
                        self._sendJson({"done": False})
                elif path == "/api/tasks":
                    self._sendJson({"tasks": [], "total": 0})
                elif path == "/api/scheduler/status":
                    self._sendJson({"activeJobs": [], "jobCount": 0})
                elif path == "/api/automation/e-stop":
                    self._sendJson({"active": False, "reason": "", "triggeredAt": None})
                elif path == "/api/automation/audit":
                    self._sendJson({"entries": [], "count": 0})
                else:
                    self._sendJson({"error": f"unhandled GET {path}"}, status=404)

            def do_POST(self):
                parsed = urllib.parse.urlparse(self.path)
                path = parsed.path
                if path == "/api/kernel/create":
                    self._sendJson({"sessionId": "provider-settings-session", "status": "ready"})
                elif path == "/api/ai/provider/validate":
                    provider = urllib.parse.parse_qs(parsed.query).get("provider", [""])[0]
                    payload = owner.validationPayload(provider)
                    outcome = validationOutcome(provider, payload)
                    owner.calls.append(f"POST /api/ai/provider/validate {provider} {outcome}")
                    self._sendJson(payload)
                elif path == "/api/provider-settings-test":
                    payload = self._readJson()
                    owner.applyControlPayload(payload)
                    self._sendJson({"ok": True})
                elif path == "/api/ai/profile/secrets":
                    self._sendJson(owner.profile())
                elif path == "/api/oauth/logout":
                    self._sendJson({"ok": True})
                elif path == "/api/automation/e-stop":
                    self._sendJson({"active": True, "reason": "stub", "triggeredAt": 1})
                else:
                    self._sendJson({"error": f"unhandled POST {path}"}, status=404)

            def do_PUT(self):
                parsed = urllib.parse.urlparse(self.path)
                if parsed.path != "/api/ai/profile":
                    self._sendJson({"error": f"unhandled PUT {parsed.path}"}, status=404)
                    return
                payload = self._readJson()
                provider = str(payload.get("provider") or owner.activeProvider)
                owner.activeProvider = provider
                owner.calls.append(f"PUT /api/ai/profile {provider}")
                self._sendJson(owner.profile())

            def do_DELETE(self):
                parsed = urllib.parse.urlparse(self.path)
                if parsed.path == "/api/automation/e-stop":
                    self._sendJson({"active": False, "reason": "", "triggeredAt": None})
                else:
                    self._sendJson({"error": f"unhandled DELETE {parsed.path}"}, status=404)

            def _readJson(self) -> dict[str, Any]:
                length = int(self.headers.get("Content-Length") or "0")
                if length <= 0:
                    return {}
                raw = self.rfile.read(length).decode("utf-8")
                try:
                    data = json.loads(raw)
                except json.JSONDecodeError:
                    return {}
                return data if isinstance(data, dict) else {}

            def _sendNoContent(self) -> None:
                self.send_response(204)
                self._sendCors()
                self.end_headers()

            def _sendJson(self, payload: dict[str, Any], *, status: int = 200) -> None:
                body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
                self.send_response(status)
                self._sendCors()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def _sendCors(self) -> None:
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
                self.send_header("Access-Control-Allow-Headers", "Content-Type")

            def log_message(self, fmt, *args):
                pass

        return Handler

    def applyControlPayload(self, payload: dict[str, Any]) -> None:
        if "oauthStatusMode" in payload:
            self.oauthStatusMode = str(payload["oauthStatusMode"])
        if "oauthValidationMode" in payload:
            self.oauthValidationMode = str(payload["oauthValidationMode"])

    def validationPayload(self, provider: str) -> dict[str, Any]:
        if provider == "openai":
            return {"valid": True, "model": "gpt-4o-mini", "probe": "response"}
        if provider == "oauth-chatgpt" and self.oauthValidationMode == "valid":
            return {"valid": True, "model": "gpt-5.4", "probe": "response"}
        if provider == "oauth-chatgpt":
            return {
                "valid": False,
                "probe": "response",
                "diagnostic": {
                    "code": "provider_compatibility_error",
                    "message": "OAuth provider 호환성 점검이 필요합니다. 외부 endpoint가 바뀌었을 수 있습니다.",
                    "action": "check-provider-compatibility",
                    "provider": "oauth-chatgpt",
                    "recoverable": False,
                },
            }
        if provider == "ollama":
            return {
                "valid": False,
                "probe": "response",
                "diagnostic": {
                    "code": "provider_network_error",
                    "message": "Provider 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도하세요.",
                    "action": "check-network",
                    "provider": "ollama",
                    "recoverable": True,
                },
            }
        if provider == "custom":
            return {
                "valid": False,
                "probe": "response",
                "diagnostic": {
                    "code": "provider_base_url_missing",
                    "message": "호환 provider 서버 주소가 필요합니다. Provider 설정에서 base URL을 입력하세요.",
                    "action": "configure-base-url",
                    "provider": "custom",
                    "recoverable": True,
                },
            }
        return {"valid": False, "error": f"unknown provider {provider}"}


def providerCatalog() -> list[dict[str, Any]]:
    return [
        {
            "id": "oauth-chatgpt",
            "label": "ChatGPT 구독",
            "description": "브라우저 로그인으로 Codaro 대화와 셀 도움을 연결합니다.",
            "authKind": "oauth",
            "defaultModel": "gpt-5.4",
        },
        {
            "id": "openai",
            "label": "OpenAI API 키",
            "description": "API 키를 저장해 Codaro provider로 사용합니다.",
            "authKind": "api_key",
            "envKey": "OPENAI_API_KEY",
            "defaultModel": "gpt-4o-mini",
        },
        {
            "id": "ollama",
            "label": "Ollama 로컬",
            "description": "로컬 모델을 사용합니다.",
            "authKind": "none",
            "defaultModel": "llama3.2",
        },
        {
            "id": "custom",
            "label": "호환 API",
            "description": "OpenAI 호환 서버 주소와 키를 사용합니다.",
            "authKind": "api_key",
            "defaultModel": "custom-model",
        },
    ]


def validationOutcome(provider: str, payload: dict[str, Any]) -> str:
    if payload.get("valid"):
        return "valid"
    diagnostic = payload.get("diagnostic")
    if isinstance(diagnostic, dict):
        code = diagnostic.get("code")
        if code == "provider_network_error":
            return "network"
        if code == "provider_base_url_missing":
            return "base_url_missing"
        if code == "provider_compatibility_error":
            return "compat"
    return f"{provider}_invalid"


def curriculumLessonPayload() -> dict[str, Any]:
    document = {
        "id": "provider-settings-browser-doc",
        "title": "Provider settings browser fixture",
        "blocks": [
            {"id": "m1", "type": "markdown", "content": "Provider 설정 브라우저 검증"},
            {"id": "c1", "type": "code", "content": "print('provider')"},
        ],
    }
    return {
        "document": document,
        "solutions": {},
        "category": "python",
        "contentId": "hello",
        "prevNext": {"prev": None, "next": None},
    }


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
    for _ in range(50):
        port = freePort()
        if not (5170 <= port <= 5179):
            return port
    raise VerificationError("could not find a non-517x app port")


def jsPageReady() -> str:
    return "Boolean(document.querySelector('button[aria-label=\"Provider 설정\"]')) && !document.body.innerText.includes('Codaro 여는 중')"


def jsDisablePopup() -> str:
    return "(() => { window.__codaroOpenedUrls = []; window.open = (url) => { window.__codaroOpenedUrls.push(String(url)); return null; }; return true; })()"


def jsConfigureStub(payload: dict[str, Any]) -> str:
    return compactJs(f"""
(async () => {{
  const response = await fetch('/api/provider-settings-test', {{
    method: 'POST',
    headers: {{ 'Content-Type': 'application/json' }},
    body: JSON.stringify({json.dumps(payload)}),
  }});
  if (!response.ok) throw new Error('stub control failed: ' + response.status);
  return true;
}})()
""")


def jsOpenProviderSettings() -> str:
    return compactJs("""
(() => {
  const button = document.querySelector('button[aria-label="Provider 설정"]');
  if (!button) throw new Error('provider settings button missing');
  button.click();
  return true;
})()
""")


def jsLoginOauthFailure() -> str:
    return compactJs("""
(async () => {
  clickProviderButton('oauth-chatgpt', '브라우저 로그인');
  await waitForProviderStatus('oauth-chatgpt', 'oauth-polling', 3000);
  const pending = providerStatus(providerCard('oauth-chatgpt'));
  const pendingText = pending.textContent || '';
  if (pending.getAttribute('data-provider-validation-pending') !== 'true') {
    throw new Error('OAuth login did not expose polling state');
  }
  if (!pendingText.includes('브라우저 로그인 대기') || !pendingText.includes('로그인 탭 완료')) {
    throw new Error('OAuth polling copy missing: ' + pendingText);
  }
  await waitForProviderStatus('oauth-chatgpt', 'needs-action', 9000);
  const card = providerCard('oauth-chatgpt');
  const status = providerStatus(card);
  const text = status.textContent || '';
  if (status.getAttribute('data-provider-validation-status') !== 'invalid') {
    throw new Error('OAuth login failure did not persist validation failure');
  }
  if (!text.includes('로그인 다시 시작') || !text.includes('보안 검증이 실패했습니다')) {
    throw new Error('OAuth state mismatch copy missing: ' + text);
  }
  const opened = window.__codaroOpenedUrls || [];
  if (!opened.some((url) => url.includes('/oauth/stub'))) {
    throw new Error('OAuth login did not open auth URL');
  }
  return JSON.stringify({ login: 'state_mismatch', pending: true, action: '로그인 다시 시작' });
})()
""")


def jsLoginOauthSuccess() -> str:
    return compactJs("""
(async () => {
  clickProviderButton('oauth-chatgpt', '브라우저 로그인');
  await waitForNoProviderSheet(9000);
  return JSON.stringify({ login: 'success', sheetClosed: true });
})()
""")


def jsLoginOauthPermissionFailure() -> str:
    return compactJs("""
(async () => {
  clickProviderButton('oauth-chatgpt', '브라우저 로그인');
  await waitForProviderStatus('oauth-chatgpt', 'oauth-polling', 3000);
  await waitForProviderText('oauth-chatgpt', '권한 문제', 9000);
  const card = providerCard('oauth-chatgpt');
  const status = providerStatus(card);
  const text = status.textContent || '';
  if (status.getAttribute('data-provider-validation-status') !== 'invalid') {
    throw new Error('OAuth permission failure did not persist validation failure');
  }
  if (!text.includes('권한 문제') || !text.includes('권한이 허용되지 않았습니다')) {
    throw new Error('OAuth permission copy missing: ' + text);
  }
  return JSON.stringify({ login: 'permission_denied', action: '권한 문제' });
})()
""")


def jsAssertOauthLive() -> str:
    return compactJs("""
(() => {
  const card = providerCard('oauth-chatgpt');
  const status = providerStatus(card);
  if (status.getAttribute('data-provider-fallback-state') !== 'live') {
    throw new Error('oauth provider did not enter live mode after login');
  }
  if (status.getAttribute('data-provider-validation-status') !== 'valid') {
    throw new Error('oauth validation status is not valid after login');
  }
  const text = card.textContent || '';
  if (!text.includes('실제 응답 사용 중') || !text.includes('gpt-5.4')) {
    throw new Error('oauth live copy missing');
  }
  return JSON.stringify({ provider: 'oauth-chatgpt', mode: 'live' });
})()
""")


def jsProviderSheetReady() -> str:
    return "Boolean(document.querySelector('[data-provider-card=\"oauth-chatgpt\"]'))"


def jsAssertInitialProviderSettings() -> str:
    return compactJs("""
(() => {
  const providers = ['oauth-chatgpt', 'openai', 'ollama', 'custom'];
  for (const provider of providers) {
    if (!document.querySelector(`[data-provider-card="${provider}"]`)) {
      throw new Error('provider card missing: ' + provider);
    }
  }
  const oauth = providerCard('oauth-chatgpt');
  const status = providerStatus(oauth);
  if (status.getAttribute('data-provider-fallback-state') !== 'fallback') {
    throw new Error('oauth provider should start in fallback mode');
  }
  const text = oauth.textContent || '';
  if (!text.includes('기본 안내 모드') || !text.includes('연결 전에는 기본 안내만 사용합니다')) {
    throw new Error('fallback copy missing');
  }
  const openai = providerCard('openai');
  if (!(openai.textContent || '').includes('저장된 인증 있음')) {
    throw new Error('stored credential candidate copy missing');
  }
  return JSON.stringify({ fallback: true, providers: providers.length });
})()
""")


def jsSelectStoredOpenaiProvider() -> str:
    return compactJs("""
(() => {
  clickProviderButton('openai', '저장된 키 사용');
  return JSON.stringify({ selected: 'openai' });
})()
""")


def jsOpenaiLiveReady() -> str:
    return (
        "(() => { const card = document.querySelector('[data-provider-card=\"openai\"]');"
        "const status = card && card.querySelector('[data-provider-fallback-state]');"
        "return Boolean(status && status.getAttribute('data-provider-fallback-state') === 'live'); })()"
    )


def jsAssertOpenaiLive() -> str:
    return compactJs("""
(() => {
  const openai = providerCard('openai');
  const status = providerStatus(openai);
  if (status.getAttribute('data-provider-fallback-state') !== 'live') {
    throw new Error('openai provider did not enter live mode');
  }
  if (status.getAttribute('data-provider-validation-status') !== 'valid') {
    throw new Error('openai validation status is not valid');
  }
  const text = openai.textContent || '';
  if (!text.includes('실제 응답 사용 중') || !text.includes('gpt-4o-mini')) {
    throw new Error('live response copy missing');
  }
  return JSON.stringify({ provider: 'openai', mode: 'live' });
})()
""")


def jsValidateProviderFailure(provider: str, expectedAction: str, forbiddenAction: str | None) -> str:
    return compactJs(f"""
(async () => {{
  clickProviderButton({json.dumps(provider)}, '응답 검증');
  await waitForProviderStatus({json.dumps(provider)}, 'needs-action');
  await waitForProviderText({json.dumps(provider)}, {json.dumps(expectedAction, ensure_ascii=False)});
  const card = providerCard({json.dumps(provider)});
  const status = providerStatus(card);
  if (status.getAttribute('data-provider-validation-status') !== 'invalid') {{
    throw new Error({json.dumps(provider)} + ' validation status is not invalid');
  }}
  const text = status.textContent || '';
  if (!text.includes({json.dumps(expectedAction, ensure_ascii=False)})) {{
    throw new Error({json.dumps(provider)} + ' action label missing: ' + text);
  }}
  const forbidden = {json.dumps(forbiddenAction, ensure_ascii=False)};
  if (forbidden && text.includes('권장 조치: ' + forbidden)) {{
    throw new Error({json.dumps(provider)} + ' was misclassified as ' + forbidden);
  }}
  return JSON.stringify({{ provider: {json.dumps(provider)}, action: {json.dumps(expectedAction, ensure_ascii=False)} }});
}})()
""")


def jsAssertProviderSettingsVisualIntegrity(viewport: str) -> str:
    return compactJs(f"""
(() => {{
  if (document.documentElement.scrollWidth > window.innerWidth + 2) {{
    throw new Error('page horizontal overflow');
  }}
  const cards = Array.from(document.querySelectorAll('[data-provider-card]'));
  if (cards.length !== 4) throw new Error('expected 4 provider cards, found ' + cards.length);
  const sheet = cards[0].closest('[role="dialog"]') || document.body;
  const sheetRect = sheet.getBoundingClientRect();
  cards.forEach((card) => {{
    const rect = card.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) throw new Error('empty provider card');
    if (rect.left < sheetRect.left - 2 || rect.right > sheetRect.right + 2) {{
      throw new Error('provider card escapes sheet: ' + card.getAttribute('data-provider-card'));
    }}
    const status = providerStatus(card);
    const statusRect = status.getBoundingClientRect();
    if (statusRect.width <= 0 || statusRect.height <= 0) {{
      throw new Error('empty status for ' + card.getAttribute('data-provider-card'));
    }}
    Array.from(card.querySelectorAll('button')).forEach((button) => {{
      if (button.scrollWidth > button.clientWidth + 2) {{
        throw new Error('button overflow: ' + (button.textContent || '').trim());
      }}
    }});
  }});
  return JSON.stringify({{ viewport: {json.dumps(viewport)}, cards: cards.length }});
}})()
""")


def compactJs(source: str) -> str:
    helpers = """
function providerCard(provider) {
  const card = document.querySelector(`[data-provider-card="${provider}"]`);
  if (!card) throw new Error('provider card not found: ' + provider);
  return card;
}
function providerStatus(card) {
  const status = card.querySelector('[data-provider-fallback-state]');
  if (!status) throw new Error('provider status not found: ' + card.getAttribute('data-provider-card'));
  return status;
}
function clickProviderButton(provider, label) {
  const card = providerCard(provider);
  const button = Array.from(card.querySelectorAll('button')).find((item) =>
    (item.textContent || '').includes(label)
  );
  if (!button) throw new Error('button not found for ' + provider + ': ' + label);
  button.click();
}
async function waitForProviderStatus(provider, mode, timeout = 7000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const status = providerStatus(providerCard(provider));
    if (status.getAttribute('data-provider-fallback-state') === mode) return true;
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw new Error('timed out waiting for ' + provider + ' status ' + mode);
}
async function waitForProviderText(provider, text, timeout = 7000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const status = providerStatus(providerCard(provider));
    if ((status.textContent || '').includes(text)) return true;
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw new Error('timed out waiting for ' + provider + ' text ' + text);
}
async function waitForNoProviderSheet(timeout = 7000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (!document.querySelector('[data-provider-card="oauth-chatgpt"]')) return true;
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  throw new Error('timed out waiting for provider sheet to close');
}
"""
    wrapped = f"""
(() => {{
{helpers}
return {source};
}})()
"""
    return " ".join(line.strip() for line in wrapped.strip().splitlines() if line.strip())


def debugPageState(cli: PlaywrightCli) -> str:
    try:
        return "DEBUG: " + cli.eval(
            "(() => JSON.stringify({hash: window.location.hash, bodyText: document.body.innerText.slice(0, 1000), "
            "cards: Array.from(document.querySelectorAll('[data-provider-card]')).map((card) => ({"
            "provider: card.getAttribute('data-provider-card'), text: (card.textContent || '').slice(0, 260), "
            "mode: card.querySelector('[data-provider-fallback-state]')?.getAttribute('data-provider-fallback-state'), "
            "validation: card.querySelector('[data-provider-validation-status]')?.getAttribute('data-provider-validation-status')"
            "})), buttons: Array.from(document.querySelectorAll('button')).map((button) => button.textContent.trim()).filter(Boolean).slice(0, 40)}))()"
        )
    except VerificationError as exc:
        return f"DEBUG unavailable: {exc}"


if __name__ == "__main__":
    raise SystemExit(main())
