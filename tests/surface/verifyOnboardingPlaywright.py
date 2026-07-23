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
    session = uniquePlaywrightSessionName("codaro-onboarding")
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
        cli.eval(jsOpenSurface("현재 학습"))
        cli.waitEval(jsTextPresent("Codaro 커리큘럼"), "curriculum sidebar")
        cli.waitEval(jsTextPresent("Hello World"), "default curriculum lesson")
        defaultLesson = recordCheck(checks, "curriculum-default-lesson", cli.eval(jsAssertCurriculumDefaultLesson()))
        exerciseCheck = recordCheck(checks, "curriculum-exercise-check", cli.eval(jsAssertExerciseCheck()))
        falseCompletionCalls = [
            call for call in api.calls
            if call in {"POST /api/curriculum/check", "POST /api/curriculum/progress"}
        ]
        if falseCompletionCalls:
            raise VerificationError("practice execution called a legacy completion API: " + ", ".join(falseCompletionCalls))
        sidebar = recordCheck(checks, "curriculum-sidebar-groups", cli.eval(jsAssertCurriculumSidebarGroups()))
        sidebarClearance = recordCheck(checks, "curriculum-sidebar-scrollbar-clearance", cli.eval(jsAssertCurriculumSidebarScrollbarClearance()))
        sidebarToggle = recordCheck(checks, "curriculum-sidebar-toggle", cli.eval(jsAssertCurriculumSidebarToggle()))
        curriculumHome = recordCheck(checks, "curriculum-home", cli.eval(jsAssertCurriculumHome()))
        cli.eval(jsOpenSurface("대화"))
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
            f"{fallbackSettings} {defaultLesson} {sidebar} {sidebarClearance} {sidebarToggle} "
            f"{curriculumHome} {ready} {settings}"
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
        "curriculumDefaultLesson": "curriculum-default-lesson" in checkIds,
        "curriculumGroupsVisible": "curriculum-sidebar-groups" in checkIds,
        "curriculumScrollbarClearance": "curriculum-sidebar-scrollbar-clearance" in checkIds,
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
        self.checkCalls = 0
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
                            {"key": "excel", "name": "엑셀 자동화", "description": "반복 작업 자동화", "count": 3, "track": "자동화"},
                            {"key": "playwright", "name": "Playwright", "description": "브라우저 자동화", "count": 11, "track": "자동화"},
                        ],
                        "groups": {
                            "Python 기초": ["30days"],
                            "데이터 분석": ["pandas"],
                            "자동화": ["playwright", "excel"],
                        },
                        "tree": [
                            {"id": "python-basics", "name": "Python 기초", "categories": ["30days"], "children": []},
                            {"id": "data-analysis", "name": "데이터 분석", "categories": ["pandas"], "children": []},
                            {
                                "id": "automation",
                                "name": "자동화",
                                "categories": [],
                                "children": [
                                    {"id": "browser-automation", "name": "브라우저 자동화", "categories": ["playwright"], "children": []},
                                    {"id": "office-automation", "name": "업무 자동화", "categories": ["excel"], "children": []},
                                ],
                            },
                        ],
                        "learningPaths": {},
                    })
                elif path == "/api/curriculum/progress":
                    self._sendJson({
                        "totalAccessed": 5,
                        "totalCompleted": 2,
                        "validatedOutcomeCount": 3,
                        "autoValidatedOutcomeCount": 1,
                        "creditedOutcomeCount": 6,
                        "categoryProgress": {"30days": {"completed": 2, "accessed": 5}},
                        "resume": {"category": "30days", "contentId": "hello"},
                        "learningPath": {
                            "tracks": [
                                {"track": "초급", "description": "처음이라면", "completed": 2, "total": 5, "ratio": 0.4, "state": "active"},
                                {"track": "중급", "description": "기초를 마쳤다면", "completed": 0, "total": 10, "ratio": 0.0, "state": "upcoming"},
                            ],
                            "recommended": {"track": "초급", "category": "30days", "completed": 2, "total": 5, "description": "처음이라면"},
                        },
                        "updatedAt": "2026-06-02T00:00:00+00:00",
                    })
                elif path == "/api/curriculum/reviews":
                    self._sendJson({
                        "reviews": [
                            {
                                "lessonKey": "30days/hello",
                                "title": "Hello World",
                                "category": "30days",
                                "contentId": "hello",
                                "interval": 1,
                                "ease": 2.5,
                                "streak": 1,
                                "lastResult": "success",
                                "nextReviewAt": "2026-06-01T00:00:00+00:00",
                                "daysOverdue": 1,
                            },
                        ],
                        "totalDue": 1,
                    })
                elif path == "/api/learner/snapshot":
                    self._sendJson({
                        "mastery": [],
                        "misconceptions": [
                            {"misconceptionId": "python.operators.caretAsPower", "outcomeId": "python.operators", "outcomeLabel": "Python 연산자", "lessonCategory": "30days", "lessonContentId": "hello", "firstSeenAt": "2026-06-01T00:00:00+00:00", "lastSeenAt": "2026-06-02T00:00:00+00:00", "hitCount": 2, "resolvedAt": None},
                        ],
                        "execution": {"totalRuns": 3, "errorRuns": 1},
                        "repeatedMisconceptionCount": 1,
                        "doneCriterionViolated": True,
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
                elif path == "/api/kernel/create":
                    self._sendJson({"sessionId": "onboarding-session", "status": "ready"})
                elif path.startswith("/api/kernel/") and path.endswith("/execute"):
                    self._sendJson({
                        "type": "execute_result",
                        "blockId": "cell-1",
                        "data": None,
                        "stdout": "hello\n",
                        "stderr": "",
                        "variables": [],
                        "stateDelta": {"added": [], "updated": [], "removed": []},
                        "executionCount": 1,
                        "status": "ok",
                    })
                elif path == "/api/curriculum/progress":
                    self._sendJson({"category": "python", "contentId": "hello", "completedMissions": ["cell-1"], "totalMissions": 1, "completedAt": "2026-06-02T00:00:00+00:00"})
                elif path.startswith("/api/curriculum/reviews/"):
                    self._sendJson({"lessonKey": "30days/hello", "interval": 3, "ease": 2.6, "streak": 2, "nextReviewAt": "2026-06-05T00:00:00+00:00", "lastResult": "success", "lastReviewedAt": "2026-06-02T00:00:00+00:00"})
                elif path == "/api/curriculum/check":
                    owner.checkCalls += 1
                    if owner.checkCalls == 1:
                        self._sendJson({
                            "passed": False,
                            "feedback": "출력이 기대와 다릅니다.",
                            "hintLevel": 0,
                            "hints": ["print 함수를 사용하세요"],
                            "studentOutput": "hi\n",
                            "expectedOutput": "hello\n",
                            "detail": "",
                            "creditedOutcomes": [],
                            "autoValidatedOutcomes": [],
                            "misconceptionMatches": [{
                                "misconceptionId": "python.intro.printQuote",
                                "outcomeId": "python.intro",
                                "label": "출력 문자열 불일치",
                                "summary": "출력할 문자열을 다르게 적었습니다.",
                                "diagnostic": {"message": "기대한 'hello'와 다른 문자열을 출력했습니다.", "references": ["python.intro"]},
                                "correction": {"hint": "정확히 'hello'를 출력하세요.", "miniExercise": "print('hello')"},
                                "repeatStatus": "repeat",
                                "hitCount": 2,
                            }],
                            "doneCriterionViolated": True,
                            "nextAction": {"kind": "studyCorrection", "label": "교정 코드를 보고 다시 풀기"},
                        })
                    else:
                        self._sendJson({
                            "passed": True,
                            "feedback": "정확합니다!",
                            "hintLevel": 0,
                            "hints": ["print 함수를 사용하세요"],
                            "studentOutput": "hello\n",
                            "expectedOutput": "hello\n",
                            "detail": "",
                            "creditedOutcomes": ["python.intro"],
                            "autoValidatedOutcomes": [],
                            "misconceptionMatches": [],
                            "doneCriterionViolated": False,
                            "nextAction": {"kind": "advance", "label": "다음 단계로 진행하기"},
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
(async () => {
  const text = document.body.innerText;
  const providerButton = [...document.querySelectorAll('button')].find((button) => button.textContent?.includes('Provider 연결'));
  const avatar = [...document.querySelectorAll('img')].some((img) => img.getAttribute('src')?.includes('/brand/avatar-small.png'));
  const diagnosticExport = document.querySelector('[data-diagnostic-export-copy="true"]');
  const accessibleSidebarTriggers = [...document.querySelectorAll('button')]
    .filter((button) => button.textContent?.includes('사이드바 전환'));
  const rail = document.querySelector('[data-sidebar="rail"]');
  const required = ['Codaro로 무엇을 만들까요?', '목표부터 말하세요', 'Provider 연결', '진단 복사', 'Pandas 실습', '브라우저 자동화 배우기', '검증 후 자동화'];
  const missing = required.filter((item) => !text.includes(item));
  if (missing.length) throw new Error('fallback onboarding missing: ' + missing.join(', '));
  if (!providerButton || providerButton.disabled) throw new Error('Provider 연결 button is missing or disabled');
  if (!diagnosticExport) throw new Error('diagnostic export copy button is missing');
  if (accessibleSidebarTriggers.length !== 1) throw new Error('expected one accessible sidebar trigger, found ' + accessibleSidebarTriggers.length);
  if (!rail || rail.getAttribute('aria-hidden') !== 'true') throw new Error('sidebar rail must be hidden from accessibility tree');
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
  const response = await fetch('/api/system/diagnostics/export');
  if (!response.ok) throw new Error('diagnostic export request failed');
  const payload = await response.json();
  const copied = JSON.stringify(payload);
  button.click();
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
(async () => {
  const text = document.body.innerText;
  const required = ['Codaro 커리큘럼', 'Python 기초', '데이터 분석', '자동화'];
  const missing = required.filter((item) => !text.includes(item));
  if (missing.length) throw new Error('curriculum sidebar groups missing: ' + missing.join(', '));
  const groupButtons = [...document.querySelectorAll('button[aria-expanded]')].filter((button) => ['Python 기초', '데이터 분석', '자동화'].some((label) => button.textContent?.includes(label)));
  if (groupButtons.length < 3) throw new Error('curriculum sidebar group buttons missing');
  const automationButton = groupButtons.find((button) => button.textContent?.includes('자동화'));
  if (!automationButton) throw new Error('automation tree button missing');
  automationButton.click();
  await new Promise((resolve) => setTimeout(resolve, 80));
  if (!document.body.innerText.includes('브라우저 자동화')) throw new Error('browser automation branch missing after expanding automation tree');
  return 'curriculum-sidebar-groups-ok';
})()
""")


def jsAssertCurriculumHome() -> str:
    return compactJs("""
(async () => {
  const entry = document.querySelector('[data-curriculum-home-entry="true"]');
  if (!entry) throw new Error('curriculum home sidebar entry missing');
  entry.click();
  let home = null;
  for (let i = 0; i < 60; i++) {
    home = document.querySelector('[data-curriculum-home="true"]');
    if (home) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!home) throw new Error('curriculum home did not render after clicking home entry');
  const text = home.innerText;
  if (!text.includes('코드로 증명')) throw new Error('curriculum home outcome-first heading missing');
  const mastery = document.querySelector('[data-curriculum-home-mastery="true"]');
  if (!mastery) throw new Error('curriculum home mastery stat missing');
  if (!mastery.textContent || !mastery.textContent.includes('강한 검증')) throw new Error('curriculum home strong evidence label missing');
  const resume = document.querySelector('[data-curriculum-home-resume="true"]');
  if (!resume) throw new Error('curriculum home resume CTA missing');
  if (!resume.textContent || !resume.textContent.includes('이어서 학습')) throw new Error('curriculum home resume label missing');
  const goals = document.querySelector('[data-curriculum-home-goals="true"]');
  if (!goals) throw new Error('curriculum home goal map missing');
  const goalGroups = goals.querySelectorAll('[data-curriculum-home-goal-group]');
  if (goalGroups.length < 1) throw new Error('curriculum home goal groups missing');
  const routes = goals.querySelectorAll('button[data-curriculum-home-category][data-learning-control-intent="navigation"]');
  if (routes.length < 1) throw new Error('curriculum home goal navigation missing');
  if (document.querySelector('[data-curriculum-home-progress="true"]')) {
    throw new Error('bulk lesson progress must not dominate the learning home');
  }
  const reviews = document.querySelector('[data-curriculum-home-reviews="true"]');
  if (!reviews) throw new Error('curriculum home review section missing');
  if (!reviews.textContent || !reviews.textContent.includes('다시 풀 문제')) throw new Error('curriculum home retrieval-task label missing');
  const reviewItems = reviews.querySelectorAll('[data-curriculum-home-review]');
  if (reviewItems.length < 1) throw new Error('curriculum home review items missing');
  const reviewOpen = reviews.querySelector('[data-curriculum-home-review-open="true"]');
  if (!reviewOpen || reviewOpen.disabled) throw new Error('runnable retrieval-task navigation missing');
  if (reviews.querySelector('[data-curriculum-home-review-pass], [data-curriculum-home-review-lapse]')) {
    throw new Error('self-rating controls must not change review state');
  }
  if (document.querySelector('[data-curriculum-home-weak-areas="true"]')) {
    throw new Error('unapproved weakness surface must not render');
  }
  return 'curriculum-home-ok';
})()
""")


def jsAssertExerciseCheck() -> str:
    return compactJs("""
(async () => {
  const exercise = document.querySelector('[data-learning-section-part="exercise"]');
  if (!exercise) throw new Error('exercise part missing');
  const runBtn = exercise.querySelector('button[aria-label="셀 실행"]');
  if (!runBtn) throw new Error('exercise run button missing');
  runBtn.click();
  let result = null;
  for (let i = 0; i < 80; i++) {
    result = exercise.querySelector('[data-learning-check-result="verified"]');
    if (result) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (!result) throw new Error('automatic practice verification did not render after execution');
  if (!result.textContent || !result.textContent.includes('연습 검증 통과')) throw new Error('automatic practice verification label missing');
  if (document.querySelector('[data-learning-exercise-check="true"]')) throw new Error('redundant verify button returned');
  if (document.querySelector('[data-lesson-completed="true"]')) throw new Error('practice-only evidence falsely completed the lesson');
  return 'exercise-check-ok';
})()
""")


def jsAssertCurriculumDefaultLesson() -> str:
    return compactJs("""
(() => {
  const text = document.body.innerText;
  const required = ['Hello World', 'Hello World 실습'];
  const missing = required.filter((item) => !text.includes(item));
  if (missing.length) throw new Error('default curriculum lesson missing: ' + missing.join(', '));
  if (text.includes('새 노트북')) throw new Error('curriculum surface fell back to blank notebook');
  if (text.includes('화면을 불러오는 중')) throw new Error('curriculum surface is stuck on loading');
  return 'curriculum-default-lesson-ok';
})()
""")


def jsAssertCurriculumSidebarScrollbarClearance() -> str:
    return compactJs("""
(() => {
  const sidebar = document.querySelector('[data-sidebar="sidebar"]');
  if (!sidebar) throw new Error('sidebar root missing');
  sidebar.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  const viewport = sidebar.querySelector('[data-slot="scroll-area-viewport"]');
  if (!viewport) throw new Error('sidebar viewport missing');
  const viewportRect = viewport.getBoundingClientRect();
  const visibleBadges = [...sidebar.querySelectorAll('[data-sidebar="menu-badge"]')]
    .filter((badge) => badge.getClientRects().length > 0);
  const badgeTooClose = visibleBadges.find((badge) => badge.getBoundingClientRect().right > viewportRect.right - 10);
  if (badgeTooClose) throw new Error('sidebar badge too close to scrollbar gutter: ' + badgeTooClose.textContent);
  const scrollbar = sidebar.querySelector('[data-slot="scroll-area-scrollbar"]');
  if (!scrollbar) return 'curriculum-sidebar-scrollbar-clearance-ok';
  const scrollbarRect = scrollbar.getBoundingClientRect();
  if (scrollbarRect.width <= 0) return 'curriculum-sidebar-scrollbar-clearance-ok';
  const overlapped = visibleBadges.find((badge) => badge.getBoundingClientRect().right > scrollbarRect.left - 1);
  if (overlapped) throw new Error('sidebar scrollbar overlaps badge: ' + overlapped.textContent);
  return 'curriculum-sidebar-scrollbar-clearance-ok';
})()
""")


def jsAssertCurriculumSidebarToggle() -> str:
    return compactJs("""
(async () => {
  const sidebar = document.querySelector('[data-sidebar="sidebar"]');
  if (!sidebar) throw new Error('sidebar root missing');
  const visibleButtons = () => [...sidebar.querySelectorAll('button')].filter((button) => button.getClientRects().length > 0);
  const buttonByPrefix = (label) => visibleButtons().find((button) => button.textContent?.trim().startsWith(label));
  const hasVisibleButton = (label) => visibleButtons().some((button) => button.textContent?.includes(label));
  const waitForRender = () => new Promise((resolve) => setTimeout(resolve, 80));
  const pythonGroup = buttonByPrefix('Python 기초');
  if (!pythonGroup) throw new Error('Python 기초 group button missing');
  if (!hasVisibleButton('파이썬 기초')) throw new Error('selected group should start expanded');
  pythonGroup.click();
  await waitForRender();
  if (hasVisibleButton('파이썬 기초')) throw new Error('selected group did not collapse on second click');
  pythonGroup.click();
  await waitForRender();
  if (!hasVisibleButton('파이썬 기초')) throw new Error('selected group did not expand again');
  const pythonBasics = buttonByPrefix('파이썬 기초');
  if (!pythonBasics) throw new Error('파이썬 기초 category button missing');
  if (!hasVisibleButton('Hello World')) throw new Error('selected category should start expanded');
  pythonBasics.click();
  await waitForRender();
  if (hasVisibleButton('Hello World')) throw new Error('selected category did not collapse on second click');
  pythonBasics.click();
  await waitForRender();
  if (!hasVisibleButton('Hello World')) throw new Error('selected category did not expand again');
  return 'curriculum-sidebar-toggle-ok';
})()
""")


def jsOpenSurface(label: str) -> str:
    return compactJs(f"""
(() => {{
  const target = {json.dumps(label, ensure_ascii=False)}.replace(/\\s+/g, '');
  const button = [...document.querySelectorAll('button')].find((item) => (item.textContent || '').replace(/\\s+/g, '').includes(target));
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
                {
                    "id": "cell-1", "type": "code", "role": "exercise", "displayKind": "cell", "executionKind": "python",
                    "sourceType": "sectionContract:exercise", "title": "Hello World 실습", "content": "print('hello')", "payload": {},
                    "guide": {
                        "exerciseType": "code",
                        "hints": ["print 함수를 사용하세요"],
                        "checkConfig": {"type": "outputExact", "evidence": "practice", "outputExact": "hello"},
                        "difficulty": "easy",
                        "solution": "print('hello')",
                        "description": "hello를 출력하세요",
                        "studentAnswer": "",
                    },
                },
            ],
        },
        "solutions": {},
    }


if __name__ == "__main__":
    raise SystemExit(main())
