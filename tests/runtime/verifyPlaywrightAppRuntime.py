"""실제 앱 projection, 위젯 반응성, 모바일, 세션 격리 Chromium gate."""
from __future__ import annotations

import json
import sys
import tempfile
import threading
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


def appDocument(path: Path, *, hideCode: bool = True) -> None:
    from codaro.document import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig
    from codaro.document import writePercentDocument

    document = CodaroDocument(
        id="app-runtime-document",
        title="반응형 계산 앱",
        blocks=[
            BlockConfig(
                id="amount-widget",
                type="code",
                content=(
                    "from codaro.outputDescriptor import ui\n"
                    "amount = ui.number(2, min=0, max=10, label='수량')\n"
                    "amount"
                ),
            ),
            BlockConfig(
                id="calculated-output",
                type="code",
                content="f'결과:{10 // amount.value}'",
            ),
            BlockConfig(
                id="filtered-output",
                type="code",
                content="'이 출력은 앱에 보이면 안 됩니다'",
            ),
        ],
        metadata=DocumentMetadata(sourceFormat="percent"),
        runtime=RuntimeConfig(reactiveMode="hybrid"),
        app=AppConfig(
            title="반응형 계산 앱",
            layout="grid",
            hideCode=hideCode,
            entryBlockIds=["amount-widget", "calculated-output"],
            statePolicy="perSession",
        ),
    )
    path.write_text(writePercentDocument(document), encoding="utf-8")


def sharedStateDocument(path: Path, markerPath: Path) -> None:
    from codaro.document import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig
    from codaro.document import writePercentDocument

    document = CodaroDocument(
        id="shared-state-app-document",
        title="공유 상태 차단 앱",
        blocks=[
            BlockConfig(
                id="shared-effect",
                type="code",
                content=(
                    "from pathlib import Path\n"
                    f"Path({str(markerPath)!r}).write_text('ran', encoding='utf-8')\n"
                    "'실행되면 안 됩니다'"
                ),
            ),
        ],
        metadata=DocumentMetadata(sourceFormat="percent"),
        runtime=RuntimeConfig(reactiveMode="hybrid"),
        app=AppConfig(
            title="공유 상태 차단 앱",
            layout="notebook",
            hideCode=True,
            entryBlockIds=["shared-effect"],
            statePolicy="shared",
        ),
    )
    path.write_text(writePercentDocument(document), encoding="utf-8")


def runHttpContract(documentPath: Path, workspaceRoot: Path) -> dict[str, Any]:
    from fastapi.testclient import TestClient

    from codaro.server import createServerApp

    with TestClient(createServerApp(
        mode="app",
        documentPath=documentPath,
        workspaceRoot=workspaceRoot,
    )) as client:
        bootstrap = client.get("/api/bootstrap")
        root = client.get("/")
    payload = bootstrap.json()
    return {
        "appMode": payload.get("appMode"),
        "documentPath": payload.get("documentPath"),
        "rootHasEditorBundle": "<div id=\"root\"></div>" in root.text,
        "rootStatus": root.status_code,
    }


def runPlaywrightContract(documentPath: Path, workspaceRoot: Path) -> dict[str, Any] | None:
    try:
        from playwright.sync_api import Error as PlaywrightError
        from playwright.sync_api import sync_playwright
    except ImportError:
        return None

    import uvicorn
    from codaro.server import createServerApp

    app = createServerApp(
        mode="app",
        documentPath=documentPath,
        workspaceRoot=workspaceRoot,
    )
    config = uvicorn.Config(app, host="127.0.0.1", port=0, log_level="warning")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    port = waitForServerPort(server)
    if port is None:
        server.should_exit = True
        thread.join(timeout=3)
        return {"status": "server-start-timeout"}

    result: dict[str, Any] = {"port": port}
    try:
        with sync_playwright() as playwright:
            try:
                browser = playwright.chromium.launch(headless=True)
            except PlaywrightError as error:
                return {"status": "browser-launch-failed", "error": str(error)}

            baseUrl = f"http://127.0.0.1:{port}/"
            contextOne = browser.new_context(viewport={"width": 1280, "height": 820})
            contextTwo = browser.new_context(viewport={"width": 1280, "height": 820})
            pageOne = contextOne.new_page()
            pageTwo = contextTwo.new_page()
            errors: list[str] = []
            for page in (pageOne, pageTwo):
                page.on("pageerror", lambda error: errors.append(str(error)))

            openAppPage(pageOne, baseUrl)
            assertAppChromeAbsent(pageOne)
            result["desktopEntryCount"] = pageOne.locator("[data-app-entry]").count()
            result["hiddenEntryCount"] = pageOne.locator('[data-app-entry="filtered-output"]').count()
            result["sourceCountWhenHidden"] = pageOne.locator("[data-app-source]").count()
            result["initialOutput"] = pageOne.locator('[data-app-entry="calculated-output"]').inner_text()
            result["sourceTextLeakedWhenHidden"] = "10 // amount.value" in pageOne.locator("body").inner_text()

            amountInputOne = pageOne.locator('[data-widget-ui="number"]')
            amountInputOne.fill("0")
            pageOne.wait_for_selector(
                '[data-app-entry="calculated-output"][data-app-output-stale="true"]',
                timeout=15_000,
            )
            result["lastGoodVisibleAfterError"] = "결과:5" in pageOne.locator(
                '[data-app-entry="calculated-output"]',
            ).inner_text()
            result["currentErrorVisible"] = pageOne.locator("[data-app-current-error]").count() == 1

            amountInputOne.fill("4")
            pageOne.wait_for_function(
                """() => {
                  const entry = document.querySelector('[data-app-entry="calculated-output"]');
                  return entry?.getAttribute('data-app-output-stale') === 'false'
                    && entry.textContent?.includes('결과:2');
                }""",
                timeout=15_000,
            )
            result["recoveredOutput"] = pageOne.locator('[data-app-entry="calculated-output"]').inner_text()

            openAppPage(pageTwo, baseUrl)
            result["secondSessionOutput"] = pageTwo.locator('[data-app-entry="calculated-output"]').inner_text()

            appDocument(documentPath, hideCode=False)
            pageOne.reload(wait_until="domcontentloaded")
            pageOne.wait_for_selector('[data-app-source="amount-widget"]', timeout=15_000)
            result["sourceCountWhenShown"] = pageOne.locator("[data-app-source]").count()

            mobileContext = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
            mobilePage = mobileContext.new_page()
            mobilePage.on("pageerror", lambda error: errors.append(str(error)))
            openAppPage(mobilePage, baseUrl)
            mobileNumber = mobilePage.locator('[data-widget-ui="number"]')
            mobileNumber.focus()
            mobileNumber.fill("3")
            mobilePage.wait_for_function(
                "() => document.body.textContent?.includes('결과:3')",
                timeout=15_000,
            )
            result["mobileFocusedInputAfterRerun"] = mobilePage.evaluate(
                "() => document.activeElement?.getAttribute('data-widget-ui') === 'number'",
            )
            result["mobileOverflow"] = mobilePage.evaluate(
                "() => document.documentElement.scrollWidth - window.innerWidth",
            )
            result["previewToolbarInServerMode"] = mobilePage.locator("[data-app-preview-toolbar]").count()
            screenshotPath = REPORT_DIR / "app-mobile.png"
            mobilePage.screenshot(path=str(screenshotPath), full_page=False)
            result["screenshot"] = str(screenshotPath.relative_to(ROOT))

            sharedMarker = workspaceRoot / "shared-state-executed.txt"
            sharedStateDocument(documentPath, sharedMarker)
            pageOne.reload(wait_until="domcontentloaded")
            pageOne.wait_for_selector('[data-app-state-policy="shared"]', timeout=15_000)
            pageOne.wait_for_function(
                "() => document.body.textContent?.includes('공유 상태를 안전하게 열 수 없습니다')",
                timeout=15_000,
            )
            pageOne.wait_for_timeout(750)
            result["sharedStateExecutionBlocked"] = not sharedMarker.exists()
            result["consoleErrors"] = errors
            result["status"] = "ok"

            mobileContext.close()
            contextTwo.close()
            contextOne.close()
            browser.close()
    finally:
        server.should_exit = True
        thread.join(timeout=5)
    return result


def runPreviewAuthoringContract(documentPath: Path, workspaceRoot: Path) -> dict[str, Any] | None:
    try:
        from playwright.sync_api import Error as PlaywrightError
        from playwright.sync_api import sync_playwright
    except ImportError:
        return None

    import uvicorn
    from codaro.document import parsePercentDocument
    from codaro.server import createServerApp

    app = createServerApp(
        mode="edit",
        documentPath=documentPath,
        workspaceRoot=workspaceRoot,
    )
    config = uvicorn.Config(app, host="127.0.0.1", port=0, log_level="warning")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    port = waitForServerPort(server)
    if port is None:
        server.should_exit = True
        thread.join(timeout=3)
        return {"status": "server-start-timeout"}

    result: dict[str, Any] = {"port": port}
    try:
        with sync_playwright() as playwright:
            try:
                browser = playwright.chromium.launch(headless=True)
            except PlaywrightError as error:
                return {"status": "browser-launch-failed", "error": str(error)}

            page = browser.new_page(viewport={"width": 1280, "height": 820})
            errors: list[str] = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(
                f"http://127.0.0.1:{port}/?surface=editor&runtime=local#editor",
                wait_until="domcontentloaded",
                timeout=15_000,
            )
            page.wait_for_selector('[data-product-surface-view="editor"]', timeout=30_000)
            page.wait_for_selector('[data-app-preview-open="true"]', timeout=30_000)
            result["previewOpenActionCount"] = 1
            page.locator('[data-app-preview-open="true"]').click()
            page.wait_for_selector(
                '[data-app-projection="true"][data-app-mode="preview"]',
                timeout=30_000,
            )
            page.wait_for_function(
                "() => document.body.textContent?.includes('결과:5')",
                timeout=30_000,
            )
            result["previewToolbarCount"] = page.locator("[data-app-preview-toolbar]").count()
            result["editorChromeInPreview"] = page.locator("[data-product-surface-view]").count()

            page.locator('select[aria-label="앱 레이아웃"]').select_option("stack")
            page.locator('[data-app-preview-toolbar] label').filter(has_text="코드 표시").locator("input").click()
            entryPicker = page.locator('[data-app-entry-picker="true"]')
            entryPicker.evaluate("element => { element.open = true; }")
            entryPicker.locator("label").filter(has_text="이 출력은 앱에 보이면 안 됩니다").locator("input").click()

            page.wait_for_function(
                """() => {
                  const app = document.querySelector('[data-app-projection="true"]');
                  return app?.getAttribute('data-app-layout') === 'stack'
                    && document.querySelectorAll('[data-app-entry]').length === 3
                    && document.querySelectorAll('[data-app-source]').length === 3;
                }""",
                timeout=15_000,
            )
            result["previewLayout"] = page.locator('[data-app-projection="true"]').get_attribute("data-app-layout")
            result["previewEntryCount"] = page.locator("[data-app-entry]").count()
            result["previewSourceCount"] = page.locator("[data-app-source]").count()

            page.wait_for_timeout(1_500)
            page.get_by_role("button", name="편집으로 돌아가기").click()
            page.wait_for_selector('[data-product-surface-view="editor"]', timeout=15_000)
            result["returnedToEditor"] = page.locator('[data-app-projection="true"]').count() == 0
            result["consoleErrors"] = errors
            result["status"] = "ok"
            browser.close()
    finally:
        server.should_exit = True
        thread.join(timeout=5)

    persisted = parsePercentDocument(documentPath.read_text(encoding="utf-8"))
    result["persistedLayout"] = persisted.app.layout
    result["persistedHideCode"] = persisted.app.hideCode
    result["persistedEntryBlockIds"] = persisted.app.entryBlockIds
    return result


def waitForServerPort(server) -> int | None:
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        if server.started and server.servers:
            sockets = list(server.servers)[0].sockets
            if sockets:
                return int(sockets[0].getsockname()[1])
        time.sleep(0.1)
    return None


def openAppPage(page, url: str) -> None:
    page.goto(url, wait_until="domcontentloaded", timeout=15_000)
    page.wait_for_selector('[data-app-projection="true"]', timeout=30_000)
    page.wait_for_selector('[data-app-entry="calculated-output"]', timeout=30_000)
    page.wait_for_function(
        "() => document.body.textContent?.includes('결과:5')",
        timeout=30_000,
    )


def assertAppChromeAbsent(page) -> None:
    forbiddenSelectors = (
        "[data-sidebar]",
        "[data-top-control-lane]",
        "[data-topbar-controls]",
        "[data-product-mobile-nav]",
        "[data-product-surface-view]",
    )
    for selector in forbiddenSelectors:
        if page.locator(selector).count() != 0:
            raise AssertionError(f"app mode rendered editor chrome: {selector}")


def validateResults(
    httpResult: dict[str, Any],
    browserResult: dict[str, Any] | None,
    previewResult: dict[str, Any] | None,
) -> list[str]:
    failures: list[str] = []
    if httpResult["appMode"] is not True:
        failures.append("bootstrap did not expose appMode=true")
    if not httpResult["documentPath"]:
        failures.append("bootstrap omitted the app document path")
    if httpResult["rootStatus"] != 200 or not httpResult["rootHasEditorBundle"]:
        failures.append("app root did not serve the product bundle")
    if browserResult is None:
        failures.append("playwright is required for the app projection gate")
        return failures
    if browserResult.get("status") != "ok":
        failures.append(f"app Chromium contract failed to start: {browserResult}")
        return failures
    expected = {
        "desktopEntryCount": 2,
        "hiddenEntryCount": 0,
        "sourceCountWhenHidden": 0,
        "sourceCountWhenShown": 2,
        "previewToolbarInServerMode": 0,
    }
    for key, value in expected.items():
        if browserResult.get(key) != value:
            failures.append(f"{key} expected {value}, got {browserResult.get(key)}")
    if not browserResult.get("lastGoodVisibleAfterError"):
        failures.append("last good output disappeared after a reactive error")
    if browserResult.get("sourceTextLeakedWhenHidden"):
        failures.append("hideCode still exposed Python source as an output heading")
    if not browserResult.get("currentErrorVisible"):
        failures.append("current reactive error was hidden")
    if "결과:2" not in str(browserResult.get("recoveredOutput")):
        failures.append("widget correction did not recover the downstream output")
    if "결과:5" not in str(browserResult.get("secondSessionOutput")):
        failures.append("widget state leaked into a second browser session")
    if browserResult.get("mobileFocusedInputAfterRerun") is not True:
        failures.append("mobile app input lost focus during a reactive rerun")
    if browserResult.get("sharedStateExecutionBlocked") is not True:
        failures.append("unsupported shared state executed app code instead of failing closed")
    if int(browserResult.get("mobileOverflow", 1)) > 0:
        failures.append(f"mobile app overflowed by {browserResult.get('mobileOverflow')}px")
    if browserResult.get("consoleErrors"):
        failures.append(f"app browser console errors: {browserResult.get('consoleErrors')}")
    if previewResult is None:
        failures.append("playwright is required for the app preview authoring gate")
        return failures
    if previewResult.get("status") != "ok":
        failures.append(f"app preview contract failed to start: {previewResult}")
        return failures
    previewExpected = {
        "previewOpenActionCount": 1,
        "previewToolbarCount": 1,
        "editorChromeInPreview": 0,
        "previewLayout": "stack",
        "previewEntryCount": 3,
        "previewSourceCount": 3,
        "returnedToEditor": True,
        "persistedLayout": "stack",
        "persistedHideCode": False,
        "persistedEntryBlockIds": [],
    }
    for key, value in previewExpected.items():
        if previewResult.get(key) != value:
            failures.append(f"preview {key} expected {value}, got {previewResult.get(key)}")
    if previewResult.get("consoleErrors"):
        failures.append(f"app preview browser console errors: {previewResult.get('consoleErrors')}")
    return failures


def main() -> int:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    startedAt = utcTimestamp()
    started = time.monotonic()
    with tempfile.TemporaryDirectory(prefix="codaro-app-runtime-") as temporaryDirectory:
        temporaryRoot = Path(temporaryDirectory)
        documentPath = temporaryRoot / "reactiveApp.py"
        workspaceRoot = temporaryRoot
        appDocument(documentPath)
        httpResult = runHttpContract(documentPath, workspaceRoot)
        browserResult = runPlaywrightContract(documentPath, workspaceRoot)
        previewDocumentPath = temporaryRoot / "previewAuthoring.py"
        appDocument(previewDocumentPath)
        previewResult = runPreviewAuthoringContract(previewDocumentPath, workspaceRoot)

    failures = validateResults(httpResult, browserResult, previewResult)
    report = {
        "startedAt": startedAt,
        "finishedAt": utcTimestamp(),
        "durationSeconds": round(time.monotonic() - started, 2),
        "http": httpResult,
        "browser": browserResult,
        "preview": previewResult,
        "failures": failures,
        "ok": not failures,
    }
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print("ok: app projection Chromium contract")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
