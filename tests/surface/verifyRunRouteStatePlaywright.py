from __future__ import annotations

import json
import socket
import subprocess
import sys
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
from urllib.parse import quote


_TESTS_ROOT = Path(__file__).resolve().parents[1]
if str(_TESTS_ROOT) not in sys.path:
    sys.path.insert(0, str(_TESTS_ROOT))

from browserStaticServer import StaticAppServer  # noqa: E402


ROOT = Path(__file__).resolve().parents[2]
REPORT_PATH = ROOT / "output" / "test-runner" / "run-route-state" / "report.json"
FIRST_CONTENT_ID = "day01_헬로월드"
SECOND_CONTENT_ID = "day02_변수와데이터타입"
PATH_ID = "pythonFoundation"


def main() -> int:
    started = time.monotonic()
    failures: list[str] = []
    observations: dict[str, Any] = {}
    server: StaticAppServer | None = None
    localServer: StaticAppServer | None = None
    try:
        from playwright.sync_api import Error as PlaywrightError
        from playwright.sync_api import sync_playwright

        port = freePort()
        server = StaticAppServer(port=port)
        server.start()
        with sync_playwright() as playwright:
            try:
                browser = playwright.chromium.launch(headless=True)
            except PlaywrightError as exc:
                raise RuntimeError("Chromium is unavailable; run playwright install chromium") from exc
            try:
                barePage = browser.new_page(viewport={"width": 1440, "height": 900})
                barePage.goto(f"http://127.0.0.1:{port}/", wait_until="networkidle", timeout=45_000)
                barePage.wait_for_selector('[data-run-route-runtime="web"]')
                barePage.wait_for_selector('[data-curriculum-home-entry="true"]')
                bare = snapshot(barePage)
                if bare["surface"] != "curriculum" or bare["lessonKey"] is not None or bare["contentId"] is not None:
                    failures.append("bare /run/ did not canonicalize to the curriculum home")

                webHomePage = browser.new_page(viewport={"width": 1024, "height": 768})
                webHomePage.goto(
                    f"http://127.0.0.1:{port}/?surface=home#home",
                    wait_until="networkidle",
                    timeout=45_000,
                )
                webHomePage.wait_for_selector('[data-curriculum-home-entry="true"]')
                webHome = snapshot(webHomePage)
                if webHome["surface"] != "curriculum" or webHome["hash"] != "#curriculum":
                    failures.append("Web surface=home did not canonicalize to the curriculum home")

                page = browser.new_page(viewport={"width": 1440, "height": 900})
                directUrl = (
                    f"http://127.0.0.1:{port}/?surface=curriculum"
                    f"&category=30days&lesson={quote(FIRST_CONTENT_ID)}"
                    f"&path={PATH_ID}&runtime=web#curriculum"
                )
                page.goto(directUrl, wait_until="networkidle", timeout=45_000)
                page.wait_for_selector(f'[data-run-route-lesson-key="30days/{FIRST_CONTENT_ID}"]')
                direct = snapshot(page)

                page.reload(wait_until="networkidle", timeout=45_000)
                page.wait_for_selector(f'[data-run-route-lesson-key="30days/{FIRST_CONTENT_ID}"]')
                reloaded = snapshot(page)

                page.locator(f'[data-curriculum-content-id="{SECOND_CONTENT_ID}"]').click()
                page.wait_for_selector(f'[data-run-route-lesson-key="30days/{SECOND_CONTENT_ID}"]')
                second = snapshot(page)

                page.go_back(wait_until="networkidle", timeout=45_000)
                page.wait_for_selector(f'[data-run-route-lesson-key="30days/{FIRST_CONTENT_ID}"]')
                restored = snapshot(page)

                observations = {
                    "bareRun": bare,
                    "direct": direct,
                    "reloaded": reloaded,
                    "secondLesson": second,
                    "restored": restored,
                }
                assertSnapshot(direct, FIRST_CONTENT_ID, failures, "direct")
                assertSnapshot(reloaded, FIRST_CONTENT_ID, failures, "reload")
                assertSnapshot(second, SECOND_CONTENT_ID, failures, "second lesson")
                assertSnapshot(restored, FIRST_CONTENT_ID, failures, "back")
                if direct["pathId"] != PATH_ID or any(
                    item["pathId"] != PATH_ID for item in (reloaded, second, restored)
                ):
                    failures.append("path context was not preserved across reload, lesson navigation, and back")
                if second["historyLength"] <= direct["historyLength"]:
                    failures.append("lesson navigation did not create a durable history entry")

                localPort = freePort()
                localServer = StaticAppServer(port=localPort, apiBaseUrl="http://127.0.0.1:1")
                localServer.start()
                localHomePage = browser.new_page(viewport={"width": 1024, "height": 768})
                localHomePage.goto(
                    f"http://127.0.0.1:{localPort}/",
                    wait_until="networkidle",
                    timeout=45_000,
                )
                localHomePage.wait_for_selector('[data-local-home-surface="true"]')
                localHome = snapshot(localHomePage)
                if localHome["surface"] != "home" or localHome["runtimeTier"] != "local":
                    failures.append("bare Local Studio did not open the durable local home")
                if localHomePage.locator('[data-product-surface="home"]').count() != 1:
                    failures.append("Local product navigation does not expose exactly one home destination")
                localHomePage.locator('[data-product-surface="curriculum"] button').click()
                localHomePage.wait_for_selector('[data-curriculum-home-entry="true"]')
                localHomePage.go_back(wait_until="networkidle", timeout=45_000)
                localHomePage.wait_for_selector('[data-local-home-surface="true"]')
                localHomeRestored = snapshot(localHomePage)
                if localHomeRestored["surface"] != "home":
                    failures.append("Local history did not restore the home surface")

                localPage = browser.new_page(viewport={"width": 1024, "height": 768})
                localPage.goto(
                    directUrl.replace(f":{port}/", f":{localPort}/"),
                    wait_until="networkidle",
                    timeout=45_000,
                )
                localPage.wait_for_selector(
                    f'[data-run-route-lesson-key="30days/{FIRST_CONTENT_ID}"][data-run-route-runtime="local"]'
                )
                local = snapshot(localPage)
                observations["localHandoff"] = local
                observations["webHomeCanonical"] = webHome
                observations["localHome"] = localHome
                observations["localHomeRestored"] = localHomeRestored
                assertSnapshot(local, FIRST_CONTENT_ID, failures, "local handoff", runtimeTier="local")
                if local["pathId"] != PATH_ID:
                    failures.append("local handoff did not preserve the learning path context")
            finally:
                browser.close()
    except (FileNotFoundError, OSError, RuntimeError) as exc:
        failures.append(f"route browser audit could not run: {type(exc).__name__}: {exc}")
    finally:
        if server is not None:
            server.stop()
        if localServer is not None:
            localServer.stop()

    payload = {
        "gate": "run-route-state",
        "passed": not failures,
        "completedAt": datetime.now(UTC).isoformat(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "observations": observations,
        "failures": failures,
        "gitHead": gitHead(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0 if not failures else 1


def snapshot(page: Any) -> dict[str, Any]:
    return page.evaluate(
        """
        () => {
          const root = document.querySelector('[data-run-route-runtime]');
          const params = new URLSearchParams(location.search);
          return {
            contentId: params.get('lesson'),
            lessonKey: root?.getAttribute('data-run-route-lesson-key') || null,
            pathId: root?.getAttribute('data-run-route-path') || null,
            runtimeTier: root?.getAttribute('data-run-route-runtime') || null,
            urlRuntimeTier: params.get('runtime'),
            surface: params.get('surface'),
            hash: location.hash,
            historyLength: history.length,
          };
        }
        """
    )


def assertSnapshot(
    value: dict[str, Any],
    contentId: str,
    failures: list[str],
    label: str,
    runtimeTier: str = "web",
) -> None:
    expected = {
        "contentId": contentId,
        "lessonKey": f"30days/{contentId}",
        "runtimeTier": runtimeTier,
        "urlRuntimeTier": runtimeTier,
        "surface": "curriculum",
        "hash": "#curriculum",
    }
    for key, expectedValue in expected.items():
        if value.get(key) != expectedValue:
            failures.append(f"{label}: expected {key}={expectedValue!r}, got {value.get(key)!r}")


def freePort() -> int:
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        return int(probe.getsockname()[1])


def gitHead() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=ROOT,
        capture_output=True,
        check=False,
        text=True,
    )
    return result.stdout.strip() if result.returncode == 0 else "unknown"


if __name__ == "__main__":
    raise SystemExit(main())
