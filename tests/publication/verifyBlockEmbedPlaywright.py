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
REPORT_DIR = ROOT / "output/test-runner/block-embedding"
REPORT_PATH = REPORT_DIR / "block-embedding-report.json"


def utcTimestamp() -> str:
    return datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def publicationDocument(path: Path) -> None:
    from codaro.document import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig
    from codaro.document.percentFormat import writePercentDocument

    document = CodaroDocument(
        id="block-embed-browser-fixture",
        title="독립 수량 블록",
        blocks=[
            BlockConfig(
                id="quantity",
                type="code",
                content=(
                    "from codaro.outputDescriptor import ui\n"
                    "quantity = ui.number(2, min=1, max=10, label='수량')\n"
                    "quantity"
                ),
            ),
            BlockConfig(id="unrelated", type="code", content="unrelated = 'do not publish'"),
        ],
        metadata=DocumentMetadata(sourceFormat="percent"),
        runtime=RuntimeConfig(reactiveMode="hybrid"),
        app=AppConfig(title="독립 수량 블록", entryBlockIds=[]),
    )
    path.write_text(writePercentDocument(document), encoding="utf-8")


def main() -> int:
    from playwright.sync_api import sync_playwright

    from codaro.publication import buildBlockEmbed, startBlockEmbedServer, verifyBlockEmbed

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report: dict[str, object] = {
        "schemaVersion": 1,
        "gate": "block-embedding",
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
        with tempfile.TemporaryDirectory(prefix="codaro-block-embed-") as tempDirectory:
            workspace = Path(tempDirectory)
            source = workspace / "block.py"
            publicationDocument(source)
            output = workspace / "embed"
            first = buildBlockEmbed(source, output, entryBlockId="quantity")
            second = buildBlockEmbed(source, output, entryBlockId="quantity")
            verified = verifyBlockEmbed(output)
            if first.embedHash != second.embedHash or not second.reused:
                raise AssertionError("동일한 기능 블록 build가 immutable embed를 재사용하지 않았습니다.")
            server, url = startBlockEmbedServer(output, port=0)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            origin = f"{urlsplit(url).scheme}://{urlsplit(url).netloc}"
            manifestRequests = 0
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(headless=True)
                context = browser.new_context(viewport={"width": 1280, "height": 900})
                page = context.new_page()

                def observeRequest(request) -> None:
                    nonlocal manifestRequests
                    if request.url.endswith("/embed.json"):
                        manifestRequests += 1
                    if not request.url.startswith(origin):
                        externalRequests.append(request.url)

                page.on("request", observeRequest)
                page.on("requestfailed", lambda request: failedRequests.append(request.url))
                page.on("console", lambda message: consoleErrors.append(message.text) if message.type == "error" else None)
                page.on("pageerror", lambda error: pageErrors.append(str(error)))
                page.goto(url, wait_until="domcontentloaded", timeout=120_000)
                page.evaluate(
                    """() => {
                      const style = document.createElement('style');
                      style.textContent = 'iframe{display:none!important}[data-widget-ui]{display:none!important}';
                      document.head.append(style);
                      const second = document.createElement('codaro-block');
                      second.setAttribute('src', './embed.json');
                      second.setAttribute('mode', 'interactive');
                      document.querySelector('main').append(second);
                    }"""
                )
                blocks = page.locator("codaro-block")
                page.wait_for_function(
                    "() => [...document.querySelectorAll('codaro-block')].length === 2 && [...document.querySelectorAll('codaro-block')].every((item) => item.dataset.codaroEmbedReady === 'true')",
                    timeout=120_000,
                )
                firstFrame = blocks.nth(0).locator("iframe")
                secondFrame = blocks.nth(1).locator("iframe")
                if firstFrame.get_attribute("sandbox") != "allow-scripts allow-same-origin":
                    raise AssertionError("iframe sandbox가 최소 권한 계약과 다릅니다.")
                if not firstFrame.is_visible() or not secondFrame.is_visible():
                    raise AssertionError("host CSS가 Shadow DOM 안의 iframe을 침범했습니다.")
                firstInput = firstFrame.content_frame.locator('[data-widget-ui="number"]')
                secondInput = secondFrame.content_frame.locator('[data-widget-ui="number"]')
                firstInput.wait_for(timeout=120_000)
                secondInput.wait_for(timeout=120_000)
                firstInput.fill("7")
                page.wait_for_timeout(500)
                if secondInput.input_value() != "2":
                    raise AssertionError("두 embed의 widget state가 공유됐습니다.")
                if manifestRequests != 1:
                    raise AssertionError(f"공용 embed manifest를 {manifestRequests}회 요청했습니다.")

                beforeHeight = firstFrame.evaluate("element => element.style.height")
                firstFrame.evaluate(
                    """(element) => {
                      const source = element.contentWindow;
                      const origin = location.origin;
                      window.dispatchEvent(new MessageEvent('message', {
                        source,
                        origin,
                        data: { protocol: 'codaro.embed', version: 99, type: 'resize', embedId: 'bad', frameId: 'bad', height: 4096 },
                      }));
                      window.dispatchEvent(new MessageEvent('message', {
                        source,
                        origin: 'https://invalid.example',
                        data: { protocol: 'codaro.embed', version: 1, type: 'resize', embedId: 'bad', frameId: 'bad', height: 4096 },
                      }));
                    }""",
                )
                if firstFrame.evaluate("element => element.style.height") != beforeHeight:
                    raise AssertionError("invalid protocol 또는 origin 메시지가 iframe 크기를 바꿨습니다.")

                blocks.nth(0).evaluate("element => element.setAttribute('mode', 'output')")
                page.wait_for_function(
                    "() => { const item = document.querySelectorAll('codaro-block')[0]; return item?.dataset.codaroEmbedMode === 'output' && item?.dataset.codaroEmbedReady === 'true'; }",
                    timeout=120_000,
                )
                outputInput = blocks.nth(0).locator("iframe").content_frame.locator('[data-widget-ui="number"]')
                outputInput.wait_for(timeout=120_000)
                if outputInput.evaluate("element => getComputedStyle(element).pointerEvents") != "none":
                    raise AssertionError("output mode가 widget interaction을 차단하지 않았습니다.")

                page.evaluate(
                    """() => {
                      const editable = document.createElement('codaro-block');
                      editable.setAttribute('src', './embed.json');
                      editable.setAttribute('mode', 'editable');
                      document.querySelector('main').append(editable);
                    }"""
                )
                editable = blocks.nth(2)
                page.wait_for_function(
                    "() => document.querySelectorAll('codaro-block')[2]?.dataset.codaroEmbedReady === 'true'",
                    timeout=120_000,
                )
                editableFrame = editable.locator("iframe").content_frame
                sourceEditor = editableFrame.locator('[data-app-editable-source="quantity"] textarea')
                sourceEditor.wait_for(timeout=120_000)
                sourceEditor.fill("answer = 41 + 1\nanswer")
                editableFrame.get_by_role("button", name="코드 실행").click()
                editableFrame.locator('[data-app-entry="quantity"]').get_by_text("42", exact=True).first.wait_for(
                    timeout=120_000
                )

                if externalRequests or failedRequests or consoleErrors or pageErrors:
                    raise AssertionError(
                        f"브라우저 오류: external={externalRequests}, failed={failedRequests}, "
                        f"console={consoleErrors}, page={pageErrors}"
                    )
                report.update(
                    {
                        "status": "passed",
                        "embedHash": verified.embedHash,
                        "publicationBundleHash": verified.publication.bundleHash,
                        "dependencyBlockIds": verified.manifest["dependencyBlockIds"],
                        "manifestRequests": manifestRequests,
                        "isolatedState": True,
                        "shadowCssIsolation": True,
                        "invalidMessageRejected": True,
                        "outputInteractionBlocked": True,
                        "editableRunObserved": True,
                        "sandbox": verified.manifest["sandbox"],
                        "externalRequests": externalRequests,
                        "failedRequests": failedRequests,
                        "consoleErrors": consoleErrors,
                        "pageErrors": pageErrors,
                    }
                )
                screenshot = REPORT_DIR / "block-embedding.png"
                page.screenshot(path=str(screenshot), full_page=False)
                report["screenshot"] = screenshot.relative_to(ROOT).as_posix()
                context.close()
                browser.close()
    except Exception as error:  # noqa: BLE001 - preserve unexpected browser failures in the gate report
        report["error"] = f"{type(error).__name__}: {error}"
        report["externalRequests"] = externalRequests
        report["failedRequests"] = failedRequests
        report["consoleErrors"] = consoleErrors
        report["pageErrors"] = pageErrors
        if page is not None:
            try:
                report["bodyText"] = page.locator("body").inner_text()[:4000]
            except Exception as diagnosticError:  # noqa: BLE001 - failure diagnostics must not mask the original error
                report["bodyTextError"] = f"{type(diagnosticError).__name__}: {diagnosticError}"
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
