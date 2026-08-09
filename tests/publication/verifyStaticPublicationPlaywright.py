from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import sys
import tempfile
import threading
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))
REPORT_DIR = ROOT / "output/test-runner/static-publication"
REPORT_PATH = REPORT_DIR / "static-publication-report.json"


def utcTimestamp() -> str:
    return datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def publicationDocument(path: Path) -> None:
    from codaro.document import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig
    from codaro.document.percentFormat import writePercentDocument

    document = CodaroDocument(
        id="static-browser-fixture",
        title="정적 반응형 계산기",
        blocks=[
            BlockConfig(
                id="amount-widget",
                type="code",
                content=(
                    "from pathlib import Path\n"
                    "from codaro.outputDescriptor import ui\n"
                    "unit = int(Path('data/unit.txt').read_text().strip())\n"
                    "amount = ui.number(2, min=1, max=10, label='수량')\n"
                    "amount"
                ),
            ),
            BlockConfig(
                id="calculated-output",
                type="code",
                content="f'검증된 결과:{unit * amount.value}'",
            ),
        ],
        metadata=DocumentMetadata(sourceFormat="percent"),
        runtime=RuntimeConfig(reactiveMode="hybrid"),
        app=AppConfig(
            title="정적 반응형 계산기",
            layout="grid",
            hideCode=True,
            entryBlockIds=["amount-widget", "calculated-output"],
            statePolicy="perSession",
        ),
    )
    path.write_text(writePercentDocument(document), encoding="utf-8")


def main() -> int:
    from playwright.sync_api import sync_playwright

    from codaro.publication import buildStaticPublication, startPublicationServer, verifyPublication

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report: dict[str, object] = {
        "schemaVersion": 1,
        "gate": "static-publication",
        "generatedAt": utcTimestamp(),
        "status": "failed",
    }
    server = None
    thread = None
    page = None
    externalRequests: list[str] = []
    failedRequests: list[str] = []
    consoleErrors: list[str] = []
    pageErrors: list[str] = []
    try:
        with tempfile.TemporaryDirectory(prefix="codaro-static-publication-") as tempDirectory:
            workspace = Path(tempDirectory)
            (workspace / "data").mkdir()
            (workspace / "data/unit.txt").write_text("10\n", encoding="utf-8")
            source = workspace / "app.py"
            publicationDocument(source)
            output = workspace / "site"
            first = buildStaticPublication(source, output)
            second = buildStaticPublication(source, output)
            verification = verifyPublication(output)
            if first.bundleHash != second.bundleHash or not second.reused:
                raise AssertionError("같은 source의 두 build가 같은 immutable bundle을 재사용하지 않았습니다.")

            server, url = startPublicationServer(output, port=0)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            origin = f"{urlsplit(url).scheme}://{urlsplit(url).netloc}"
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(headless=True)
                context = browser.new_context(viewport={"width": 1280, "height": 820})
                page = context.new_page()
                page.on(
                    "request",
                    lambda request: externalRequests.append(request.url)
                    if not request.url.startswith(origin)
                    else None,
                )
                page.on("requestfailed", lambda request: failedRequests.append(request.url))
                page.on(
                    "console",
                    lambda message: consoleErrors.append(message.text) if message.type == "error" else None,
                )
                page.on("pageerror", lambda error: pageErrors.append(str(error)))
                page.goto(url, wait_until="domcontentloaded", timeout=120_000)
                page.wait_for_selector('[data-app-projection="true"]', timeout=120_000)
                page.wait_for_selector('[data-widget-ui="number"]', timeout=45_000)
                page.wait_for_function(
                    "() => document.body.textContent?.includes('검증된 결과:20')",
                    timeout=120_000,
                )
                numberInput = page.locator('[data-widget-ui="number"]')
                numberInput.fill("4")
                page.wait_for_function(
                    "() => document.body.textContent?.includes('검증된 결과:40')",
                    timeout=30_000,
                )
                report.update(
                    {
                        "status": "passed",
                        "bundleHash": first.bundleHash,
                        "bundleReused": second.reused,
                        "fileCount": verification.fileCount,
                        "totalBytes": verification.totalBytes,
                        "entryCount": page.locator("[data-app-entry]").count(),
                        "editorChromeCount": page.locator("[data-app-preview-toolbar], [data-product-sidebar]").count(),
                        "initialOutputObserved": True,
                        "widgetOutputObserved": True,
                        "externalRequests": externalRequests,
                        "failedRequests": failedRequests,
                        "consoleErrors": consoleErrors,
                        "pageErrors": pageErrors,
                    }
                )
                if externalRequests or failedRequests or consoleErrors or pageErrors:
                    raise AssertionError(
                        f"브라우저 오류: external={externalRequests}, failed={failedRequests}, "
                        f"console={consoleErrors}, page={pageErrors}"
                    )
                if report["entryCount"] != 2 or report["editorChromeCount"] != 0:
                    raise AssertionError("정적 app projection이 entry 또는 chrome 계약을 지키지 않았습니다.")
                screenshot = REPORT_DIR / "static-publication.png"
                page.screenshot(path=str(screenshot), full_page=False)
                report["screenshot"] = str(screenshot.relative_to(ROOT)).replace("\\", "/")
                context.close()
                browser.close()
    except BaseException as error:
        report["error"] = f"{type(error).__name__}: {error}"
        report["externalRequests"] = externalRequests
        report["failedRequests"] = failedRequests
        report["consoleErrors"] = consoleErrors
        report["pageErrors"] = pageErrors
        if page is not None:
            try:
                report["bodyText"] = page.locator("body").inner_text()[:4000]
                screenshot = REPORT_DIR / "static-publication-failed.png"
                page.screenshot(path=str(screenshot), full_page=False)
                report["screenshot"] = str(screenshot.relative_to(ROOT)).replace("\\", "/")
            except BaseException:
                pass
        REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return 1
    finally:
        if server is not None:
            server.shutdown()
            server.server_close()
        if thread is not None:
            thread.join(timeout=5)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
