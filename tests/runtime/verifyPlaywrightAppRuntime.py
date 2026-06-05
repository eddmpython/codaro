"""앱 모드 런타임 + 위젯 브리지 server boot smoke.

진짜 playwright browser가 설치되어 있으면 chromium으로 실제 페이지 진입 + 위젯 클릭까지
검증한다. 없으면 fastapi TestClient로 HTML 응답과 위젯 router round-trip만 검증한다.
"""
from __future__ import annotations

import json
import os
import sys
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))

REPORT_DIR = ROOT / "output" / "test-runner" / "playwright-app-runtime"
REPORT_PATH = REPORT_DIR / "playwright-app-runtime-report.json"


def utcTimestamp() -> str:
    return datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def runHttpRoundTrip() -> dict[str, Any]:
    from fastapi.testclient import TestClient

    from codaro.outputDescriptor import ui
    from codaro.server import createServerApp
    from codaro.uiCallbacks import resetCallbacks

    resetCallbacks()
    fired: list[str] = []
    descriptor = ui.button("증가", onClick=lambda: fired.append("clicked"))
    callbackId = descriptor["events"]["click"]

    fastapiApp = createServerApp(mode="edit")
    client = TestClient(fastapiApp)

    session = client.post("/api/kernel/create", json={"workingDirectory": None})
    sessionPayload = session.json()
    sessionId = sessionPayload["sessionId"]

    badRequest = client.post(
        f"/api/kernel/{sessionId}/ui-event",
        json={"callbackId": "cb_nonexistent", "eventType": "click", "payload": None},
    )

    valid = client.post(
        f"/api/kernel/{sessionId}/ui-event",
        json={"callbackId": callbackId, "eventType": "click", "payload": None},
    )

    return {
        "mode": "http",
        "sessionId": sessionId,
        "badStatus": badRequest.status_code,
        "okStatus": valid.status_code,
        "callbackFired": fired == ["clicked"],
        "validBody": valid.json() if valid.status_code == 200 else None,
    }


def runPlaywrightRoundTrip() -> dict[str, Any] | None:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return None

    import subprocess
    import threading

    import uvicorn
    from codaro.server import createServerApp

    def _tryLaunch(playwrightObj):
        try:
            return playwrightObj.chromium.launch(headless=True), None
        except Exception as exc:
            return None, str(exc)

    def _installChromium() -> tuple[bool, str]:
        try:
            result = subprocess.run(
                [sys.executable, "-m", "playwright", "install", "chromium", "--with-deps=false"],
                capture_output=True,
                text=True,
                timeout=600,
            )
            if result.returncode == 0:
                return True, ""
            return False, (result.stderr or result.stdout or "").strip()[-400:]
        except subprocess.TimeoutExpired:
            return False, "chromium install timed out"
        except OSError as exc:
            return False, str(exc)

    app = createServerApp(mode="edit")
    config = uvicorn.Config(app, host="127.0.0.1", port=0, log_level="warning")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    deadline = time.monotonic() + 15
    port = None
    while time.monotonic() < deadline:
        if server.started and server.servers:
            sockets = list(server.servers)[0].sockets
            if sockets:
                port = sockets[0].getsockname()[1]
                break
        time.sleep(0.1)
    if not port:
        server.should_exit = True
        thread.join(timeout=3)
        return {"mode": "playwright", "status": "server-start-timeout"}

    result: dict[str, Any] = {"mode": "playwright", "port": port}
    try:
        with sync_playwright() as p:
            browser, launchError = _tryLaunch(p)
            if browser is None:
                installed, installError = _installChromium()
                if not installed:
                    result["status"] = "browser-install-failed"
                    result["error"] = installError or launchError
                    return result
                browser, launchError = _tryLaunch(p)
                if browser is None:
                    result["status"] = "browser-launch-failed"
                    result["error"] = launchError
                    return result
            context = browser.new_context()
            page = context.new_page()
            consoleMessages: list[dict[str, str]] = []
            page.on("console", lambda msg: consoleMessages.append({"type": msg.type, "text": msg.text[:200]}))
            page.on("pageerror", lambda err: consoleMessages.append({"type": "pageerror", "text": str(err)[:200]}))
            page.goto(f"http://127.0.0.1:{port}/", wait_until="domcontentloaded", timeout=15000)
            page.wait_for_selector("#root", timeout=15000)
            page.wait_for_timeout(1500)
            result["title"] = page.title()
            result["rootMounted"] = page.locator("#root").count() == 1
            result["rootChildCount"] = page.evaluate("() => document.getElementById('root')?.childElementCount ?? 0")
            screenshotPath = REPORT_DIR / "screenshot-desktop.png"
            page.screenshot(path=str(screenshotPath), full_page=False)
            result["screenshot"] = str(screenshotPath.relative_to(ROOT))
            errorMessages = [m for m in consoleMessages if m["type"] in ("error", "pageerror")]
            result["consoleErrors"] = errorMessages[:5]
            result["consoleErrorCount"] = len(errorMessages)
            result["status"] = "ok"
            browser.close()
    finally:
        server.should_exit = True
        thread.join(timeout=3)
    return result


def main() -> int:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []

    httpResult = runHttpRoundTrip()
    if httpResult["badStatus"] != 404:
        failures.append(f"missing callback should 404 (got {httpResult['badStatus']})")
    if httpResult["okStatus"] != 200:
        failures.append(f"valid callback should 200 (got {httpResult['okStatus']})")
    if not httpResult["callbackFired"]:
        failures.append("callback was not invoked on POST")

    playwrightResult = runPlaywrightRoundTrip()
    if playwrightResult is not None and playwrightResult.get("status") == "ok":
        if not playwrightResult.get("rootMounted"):
            failures.append("React root did not mount in chromium")
        if (playwrightResult.get("rootChildCount") or 0) < 1:
            failures.append("React root mounted but rendered no children")
        consoleErrorCount = playwrightResult.get("consoleErrorCount", 0)
        if consoleErrorCount > 0:
            failures.append(f"chromium reported {consoleErrorCount} console error(s): {playwrightResult.get('consoleErrors')}")
    elif playwrightResult is not None and playwrightResult.get("status") not in (
        "browser-missing",
        "server-start-timeout",
        "browser-install-failed",
        "browser-launch-failed",
    ):
        failures.append(f"playwright unexpected status: {playwrightResult.get('status')}")

    report = {
        "startedAt": startedAt,
        "finishedAt": utcTimestamp(),
        "durationSeconds": round(time.monotonic() - started, 2),
        "httpRoundTrip": httpResult,
        "playwright": playwrightResult,
        "failures": failures,
        "ok": not failures,
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print(f"ok: app-runtime e2e ({len(failures)} failures, playwright={playwrightResult.get('status') if playwrightResult else 'unavailable'})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
