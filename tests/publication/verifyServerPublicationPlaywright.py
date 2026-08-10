from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import sys
import tempfile
import threading
import time
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))
sys.path.insert(0, str(ROOT / "tests"))

from playwrightCli import repoLocalPlaywrightWorkspace  # noqa: E402


REPORT_DIR = ROOT / "output/test-runner/server-publication"
REPORT_PATH = REPORT_DIR / "server-publication-report.json"
SECRET_VALUE = "server-browser-secret-canary-24680"


def utcTimestamp() -> str:
    return datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def publicationDocument(path: Path) -> None:
    from codaro.document import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata
    from codaro.document.percentFormat import writePercentDocument

    document = CodaroDocument(
        id="server-browser-fixture",
        title="격리된 서버 계산기",
        blocks=[
            BlockConfig(
                id="amount-widget",
                type="code",
                content=(
                    "from codaro.outputDescriptor import ui\n"
                    "amount = ui.number(2, min=1, max=10, label='수량')\n"
                    "amount"
                ),
            ),
            BlockConfig(
                id="calculated-output",
                type="code",
                content=(
                    "import os\n"
                    "f'서버 결과:{amount.value * 10}:{os.getenv(\"APP_TOKEN\")}'"
                ),
            ),
        ],
        metadata=DocumentMetadata(sourceFormat="percent"),
        app=AppConfig(
            title="격리된 서버 계산기",
            layout="grid",
            hideCode=True,
            entryBlockIds=["amount-widget", "calculated-output"],
            statePolicy="perSession",
        ),
    )
    path.write_text(writePercentDocument(document), encoding="utf-8")


def waitForServerPort(server, timeoutSeconds: float = 20.0) -> int | None:
    deadline = time.time() + timeoutSeconds
    while time.time() < deadline:
        if server.started and server.servers:
            sockets = list(server.servers)[0].sockets
            if sockets:
                return int(sockets[0].getsockname()[1])
        if not threading.main_thread().is_alive():
            return None
        time.sleep(0.05)
    return None


def main() -> int:
    from playwright.sync_api import sync_playwright
    import uvicorn

    from codaro.publication import buildServerPublication, verifyServerPublication
    from codaro.server import createPublishedServerApp

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report: dict[str, object] = {
        "schemaVersion": 1,
        "gate": "server-publication",
        "generatedAt": utcTimestamp(),
        "status": "failed",
    }
    server = None
    thread = None
    pageOne = None
    externalRequests: list[str] = []
    failedRequests: list[str] = []
    consoleErrors: list[str] = []
    expectedRecoveryResponses: list[str] = []
    expectedRecoveryPaths: set[str] = set()
    pageErrors: list[str] = []
    try:
        scratch = repoLocalPlaywrightWorkspace(ROOT, "server-publication")
        with tempfile.TemporaryDirectory(prefix="codaro-server-publication-", dir=scratch) as tempDirectory:
            workspace = Path(tempDirectory)
            source = workspace / "app.py"
            publicationDocument(source)
            output = workspace / "server-app"
            built = buildServerPublication(source, output)
            verification = verifyServerPublication(output)
            app = createPublishedServerApp(output, environment={"APP_TOKEN": SECRET_VALUE})
            config = uvicorn.Config(app, host="127.0.0.1", port=0, log_level="warning")
            server = uvicorn.Server(config)
            thread = threading.Thread(target=server.run, daemon=True)
            thread.start()
            port = waitForServerPort(server)
            if port is None:
                raise AssertionError("server publication이 시작되지 않았습니다.")
            url = f"http://127.0.0.1:{port}/app"
            origin = f"{urlsplit(url).scheme}://{urlsplit(url).netloc}"

            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(headless=True)
                contextOne = browser.new_context(viewport={"width": 1280, "height": 820})
                contextTwo = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
                pageOne = contextOne.new_page()
                pageTwo = contextTwo.new_page()
                for page in (pageOne, pageTwo):
                    page.on("request", lambda request: externalRequests.append(request.url) if not request.url.startswith(origin) else None)
                    page.on("requestfailed", lambda request: failedRequests.append(request.url))
                    page.on(
                        "response",
                        lambda response: expectedRecoveryResponses.append(response.url)
                        if response.status == 404 and response.url in expectedRecoveryPaths
                        else None,
                    )
                    page.on("console", lambda message: consoleErrors.append(message.text) if message.type == "error" else None)
                    page.on("pageerror", lambda error: pageErrors.append(str(error)))
                    page.goto(url, wait_until="domcontentloaded", timeout=120_000)
                    page.wait_for_selector('[data-app-projection="true"]', timeout=120_000)
                    page.wait_for_selector('[data-widget-ui="number"]', timeout=45_000)
                    page.wait_for_function("() => document.body.textContent?.includes('서버 결과:20:[redacted]')", timeout=120_000)

                numberInput = pageOne.locator('[data-widget-ui="number"]')
                numberInput.fill("4")
                pageOne.wait_for_function("() => document.body.textContent?.includes('서버 결과:40:[redacted]')", timeout=30_000)
                if "서버 결과:20:[redacted]" not in pageTwo.locator("body").inner_text():
                    raise AssertionError("두 번째 browser session 상태가 첫 번째 session에서 바뀌었습니다.")
                ownerCookie = next(
                    (
                        cookie["value"]
                        for cookie in contextOne.cookies()
                        if cookie["name"] == "codaro_published_owner"
                    ),
                    None,
                )
                if not ownerCookie:
                    raise AssertionError("published session owner cookie가 없습니다.")
                firstSessionId = next(
                    (
                        sessionId
                        for sessionId, owner in app.state.publicationRuntime._sessionOwners.items()
                        if owner == ownerCookie
                    ),
                    None,
                )
                if not firstSessionId:
                    raise AssertionError("첫 browser의 owned session을 찾지 못했습니다.")
                expectedRecoveryPaths.add(f"{origin}/api/kernel/{firstSessionId}/set-ui-value")
                app.state.publicationRuntime.sessionManager.destroySession(firstSessionId)
                numberInput.fill("6")
                pageOne.wait_for_function(
                    "() => document.body.textContent?.includes('서버 결과:60:[redacted]')",
                    timeout=30_000,
                )
                recoveredSessionIds = [
                    sessionId
                    for sessionId, owner in app.state.publicationRuntime._sessionOwners.items()
                    if owner == ownerCookie
                ]
                if len(recoveredSessionIds) != 1 or recoveredSessionIds[0] == firstSessionId:
                    raise AssertionError("만료된 published session이 새 owner session으로 한 번만 복구되지 않았습니다.")
                if expectedRecoveryResponses != [f"{origin}/api/kernel/{firstSessionId}/set-ui-value"]:
                    raise AssertionError("만료 session 복구의 예상 404 응답이 정확히 한 번 관찰되지 않았습니다.")
                expectedConsole = "Failed to load resource: the server responded with a status of 404 (Not Found)"
                if expectedConsole in consoleErrors:
                    consoleErrors.remove(expectedConsole)
                combinedText = pageOne.locator("body").inner_text() + pageTwo.locator("body").inner_text()
                if SECRET_VALUE in combinedText:
                    raise AssertionError("secret 값이 browser text에 노출됐습니다.")
                unavailable = pageOne.request.post(f"{origin}/api/document/save", data={})
                if unavailable.status != 404:
                    raise AssertionError("published server가 document save API를 노출했습니다.")
                if externalRequests or failedRequests or consoleErrors or pageErrors:
                    raise AssertionError(
                        f"브라우저 오류: external={externalRequests}, failed={failedRequests}, console={consoleErrors}, page={pageErrors}"
                    )
                screenshot = REPORT_DIR / "server-publication.png"
                pageOne.screenshot(path=str(screenshot), full_page=False)
                health = pageOne.request.get(f"{origin}/api/health").json()
                report.update({
                    "status": "passed",
                    "bundleHash": built.bundleHash,
                    "fileCount": verification.fileCount,
                    "desktopOutput": "서버 결과:60:[redacted]",
                    "mobileOutput": "서버 결과:20:[redacted]",
                    "sessionIsolation": True,
                    "sessionRecovery": True,
                    "expectedRecoveryResponses": expectedRecoveryResponses,
                    "secretRedacted": True,
                    "editorChromeCount": pageOne.locator("[data-product-sidebar], [data-app-preview-toolbar]").count(),
                    "healthBundleHash": health.get("bundleHash"),
                    "externalRequests": externalRequests,
                    "failedRequests": failedRequests,
                    "consoleErrors": consoleErrors,
                    "pageErrors": pageErrors,
                    "screenshot": str(screenshot.relative_to(ROOT)).replace("\\", "/"),
                })
                if report["editorChromeCount"] != 0 or report["healthBundleHash"] != built.bundleHash:
                    raise AssertionError("server app projection 또는 health bundle identity가 다릅니다.")
                contextTwo.close()
                contextOne.close()
                browser.close()
            server.should_exit = True
            thread.join(timeout=20)
            if thread.is_alive():
                raise AssertionError("server publication이 종료 시간 안에 session worker를 정리하지 못했습니다.")
            server = None
            thread = None
    except BaseException as error:
        report["error"] = f"{type(error).__name__}: {error}"
        report["externalRequests"] = externalRequests
        report["failedRequests"] = failedRequests
        report["consoleErrors"] = consoleErrors
        report["pageErrors"] = pageErrors
        if pageOne is not None:
            try:
                report["bodyText"] = pageOne.locator("body").inner_text()[:4000]
            except BaseException:
                pass
        REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 1
    finally:
        if server is not None:
            server.should_exit = True
        if thread is not None:
            thread.join(timeout=10)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
