"""모바일 viewport playwright smoke.

playwright가 설치돼 있고 chromium browser가 있으면 iPhone SE/Pixel 5 viewport로 페이지를
열어 root mount + 폭이 viewport 안에 들어오는지 검증. 없으면 skip (exit 0).
"""
from __future__ import annotations

import json
import sys
import threading
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

REPORT_DIR = ROOT / "output" / "test-runner" / "playwright-mobile"
REPORT_PATH = REPORT_DIR / "playwright-mobile-report.json"


def utcTimestamp() -> str:
    return datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def runPlaywrightViewports() -> dict[str, Any]:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return {"mode": "playwright", "status": "playwright-not-installed"}

    import subprocess
    import uvicorn
    from codaro.server import createServerApp

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
    port = None
    deadline = time.monotonic() + 15
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

    viewports = [
        {"name": "iphone-se", "width": 375, "height": 667},
        {"name": "pixel-5", "width": 393, "height": 851},
        {"name": "narrow-360", "width": 360, "height": 740},
    ]
    result: dict[str, Any] = {"mode": "playwright", "port": port, "viewports": []}
    try:
        with sync_playwright() as p:
            try:
                browser = p.chromium.launch(headless=True)
            except Exception:
                installed, installError = _installChromium()
                if not installed:
                    result["status"] = "browser-install-failed"
                    result["error"] = installError
                    return result
                try:
                    browser = p.chromium.launch(headless=True)
                except Exception as launchError:
                    result["status"] = "browser-launch-failed"
                    result["error"] = str(launchError)
                    return result
            for viewport in viewports:
                context = browser.new_context(viewport={"width": viewport["width"], "height": viewport["height"]})
                page = context.new_page()
                consoleErrors: list[str] = []
                page.on("console", lambda msg: consoleErrors.append(f"{msg.type}: {msg.text[:200]}") if msg.type == "error" else None)
                page.on("pageerror", lambda err: consoleErrors.append(f"pageerror: {str(err)[:200]}"))
                try:
                    page.goto(f"http://127.0.0.1:{port}/", wait_until="domcontentloaded", timeout=15000)
                    page.wait_for_selector("#root", timeout=15000)
                    page.wait_for_timeout(1000)
                    rootBounds = page.locator("#root").bounding_box()
                    screenshotPath = REPORT_DIR / f"screenshot-{viewport['name']}.png"
                    page.screenshot(path=str(screenshotPath), full_page=False)
                    result["viewports"].append({
                        "name": viewport["name"],
                        "rootWidth": rootBounds["width"] if rootBounds else None,
                        "rootHeight": rootBounds["height"] if rootBounds else None,
                        "fits": bool(rootBounds and rootBounds["width"] <= viewport["width"] + 1),
                        "screenshot": str(screenshotPath.relative_to(ROOT)),
                        "consoleErrorCount": len(consoleErrors),
                        "consoleErrors": consoleErrors[:3],
                    })
                finally:
                    context.close()
            mobileChatContext = browser.new_context(viewport={"width": 375, "height": 667})
            mobileChatPage = mobileChatContext.new_page()
            try:
                mobileChatPage.goto(f"http://127.0.0.1:{port}/m/chat", wait_until="domcontentloaded", timeout=15000)
                mobileChatPage.wait_for_selector("[data-route='mobile-chat']", timeout=10000)
                inputCount = mobileChatPage.locator("[data-mobile-chat-input='true']").count()
                sendCount = mobileChatPage.locator("[data-mobile-chat-send='true']").count()
                result["mobileChat"] = {
                    "mounted": True,
                    "hasInput": inputCount == 1,
                    "hasSendButton": sendCount == 1,
                }
            except Exception as chatError:
                result["mobileChat"] = {"mounted": False, "error": str(chatError)[:200]}
            finally:
                mobileChatContext.close()
            browser.close()
            result["status"] = "ok"
    finally:
        server.should_exit = True
        thread.join(timeout=3)
    return result


def main() -> int:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []

    playwrightResult = runPlaywrightViewports()
    if playwrightResult.get("status") == "ok":
        for entry in playwrightResult["viewports"]:
            if not entry["fits"]:
                failures.append(f"viewport {entry['name']} overflows: rootWidth={entry['rootWidth']}")
            if entry.get("consoleErrorCount", 0) > 0:
                failures.append(
                    f"viewport {entry['name']} reported {entry['consoleErrorCount']} console error(s): {entry.get('consoleErrors')}"
                )
        mobileChat = playwrightResult.get("mobileChat") or {}
        if not mobileChat.get("mounted"):
            failures.append(f"/m/chat route did not mount: {mobileChat.get('error')}")
        elif not mobileChat.get("hasInput") or not mobileChat.get("hasSendButton"):
            failures.append(f"/m/chat route missing input/send: {mobileChat}")

    report = {
        "startedAt": startedAt,
        "finishedAt": utcTimestamp(),
        "durationSeconds": round(time.monotonic() - started, 2),
        "playwright": playwrightResult,
        "failures": failures,
        "ok": not failures,
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print(f"ok: playwright-mobile (status={playwrightResult.get('status')})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
