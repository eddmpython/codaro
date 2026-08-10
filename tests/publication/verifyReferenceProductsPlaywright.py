from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import shutil
import sys
import tempfile
import threading
import time
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))
REPORT_DIR = ROOT / "output/test-runner/reference-products"
REPORT_PATH = REPORT_DIR / "reference-products-report.json"
MACHINE_REPORT_PATH = REPORT_DIR / "reference-products-machine.json"
MANIFEST_PATH = ROOT / "examples/apps/referenceProducts.json"
SECRET_VALUE = "reference-browser-secret-canary-86420"
MAX_READY_MS = 180_000
MAX_INTERACTION_MS = 8_000
MAX_STATIC_BYTES = 300 * 1024 * 1024


def utcTimestamp() -> str:
    return datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def waitForServerPort(server, timeoutSeconds: float = 30.0) -> int | None:
    deadline = time.time() + timeoutSeconds
    while time.time() < deadline:
        if server.started and server.servers:
            sockets = list(server.servers)[0].sockets
            if sockets:
                return int(sockets[0].getsockname()[1])
        time.sleep(0.05)
    return None


def _origin(url: str) -> str:
    parsed = urlsplit(url)
    return f"{parsed.scheme}://{parsed.netloc}"


def _observePage(page, origin: str, observations: dict[str, list[str]]) -> None:
    page.on(
        "request",
        lambda request: observations["externalRequests"].append(request.url)
        if not request.url.startswith(origin) and not request.url.startswith(("data:", "blob:"))
        else None,
    )
    page.on("requestfailed", lambda request: observations["failedRequests"].append(request.url))
    page.on(
        "console",
        lambda message: observations["consoleErrors"].append(message.text) if message.type == "error" else None,
    )
    page.on("pageerror", lambda error: observations["pageErrors"].append(str(error)))


def _openApp(page, url: str, expectedText: str) -> int:
    started = time.perf_counter()
    page.goto(url, wait_until="domcontentloaded", timeout=MAX_READY_MS)
    page.wait_for_selector('[data-app-projection="true"]', timeout=MAX_READY_MS)
    page.wait_for_function(
        "expected => document.body.textContent?.includes(expected)",
        arg=expectedText,
        timeout=MAX_READY_MS,
    )
    return int((time.perf_counter() - started) * 1000)


def _mobileContract(page) -> dict[str, object]:
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(150)
    return {
        "overflowPx": page.evaluate("() => document.documentElement.scrollWidth - window.innerWidth"),
        "headingCount": page.locator("h1").count(),
        "entryCount": page.locator("[data-app-entry]").count(),
    }


def _staticProduct(browser, source: Path, output: Path, productId: str) -> dict[str, object]:
    from codaro.publication import buildStaticPublication, startPublicationServer, verifyPublication

    built = buildStaticPublication(source, output)
    verified = verifyPublication(output)
    server, url = startPublicationServer(output, port=0)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    observations = {key: [] for key in ("externalRequests", "failedRequests", "consoleErrors", "pageErrors")}
    context = browser.new_context(viewport={"width": 1280, "height": 820})
    page = context.new_page()
    _observePage(page, _origin(url), observations)
    try:
        expected = {
            "browser-calculator": "검증된 견적 합계: 25,000원",
            "csv-dashboard": "전체 매출: 1,780,000원, 4건",
            "snapshot-report": "처리 건수",
        }[productId]
        readyMs = _openApp(page, url, expected)
        interactionMs = 0
        recovered = True
        if productId == "browser-calculator":
            quantity = page.locator('[data-widget-ui="number"]').nth(1)
            quantity.fill("0")
            page.wait_for_selector('[data-app-entry="total-view"][data-app-output-stale="true"]', timeout=MAX_INTERACTION_MS)
            started = time.perf_counter()
            quantity.fill("4")
            page.wait_for_function(
                "() => document.body.textContent?.includes('검증된 견적 합계: 50,000원')",
                timeout=MAX_INTERACTION_MS,
            )
            interactionMs = int((time.perf_counter() - started) * 1000)
            recovered = page.locator('[data-app-entry="total-view"][data-app-output-stale="false"]').count() == 1
        elif productId == "csv-dashboard":
            started = time.perf_counter()
            page.locator('[data-widget-ui="dropdown"]').select_option("부산")
            page.wait_for_function(
                "() => document.body.textContent?.includes('부산 매출: 200,000원, 2건')",
                timeout=MAX_INTERACTION_MS,
            )
            interactionMs = int((time.perf_counter() - started) * 1000)
        else:
            if "정상" not in page.locator("body").inner_text() or "128" not in page.locator("body").inner_text():
                raise AssertionError("snapshot report 값이 보이지 않습니다.")
        mobile = _mobileContract(page)
        if mobile["overflowPx"] > 1 or mobile["headingCount"] != 1:
            raise AssertionError(f"{productId} mobile 또는 heading 계약이 실패했습니다: {mobile}")
        if readyMs > MAX_READY_MS or interactionMs > MAX_INTERACTION_MS or verified.totalBytes > MAX_STATIC_BYTES:
            raise AssertionError(f"{productId} performance budget을 넘었습니다.")
        if any(observations.values()):
            raise AssertionError(f"{productId} browser 오류: {observations}")
        return {
            "id": productId,
            "runtimeTarget": "browser",
            "bundleHash": built.bundleHash,
            "manifestHash": built.manifest["manifestHash"],
            "readyMs": readyMs,
            "interactionMs": interactionMs,
            "totalBytes": verified.totalBytes,
            "mobile": mobile,
            "failureRecovered": recovered,
            **observations,
        }
    except Exception as error:
        bodyText = ""
        try:
            bodyText = page.locator("body").inner_text()[:4000]
        except Exception as diagnosticError:  # noqa: BLE001 - diagnostics must not mask the original failure
            bodyText = f"<body unavailable: {type(diagnosticError).__name__}>"
        raise AssertionError(
            f"{productId} Chromium journey 실패: {type(error).__name__}: {error}; "
            f"body={bodyText!r}; observations={observations}"
        ) from error
    finally:
        context.close()
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def _serverProduct(browser, source: Path, output: Path) -> dict[str, object]:
    import uvicorn

    from codaro.publication import buildServerPublication, verifyServerPublication
    from codaro.server import createPublishedServerApp

    built = buildServerPublication(source, output)
    verified = verifyServerPublication(output)
    app = createPublishedServerApp(output, environment={"REFERENCE_API_TOKEN": SECRET_VALUE})
    config = uvicorn.Config(app, host="127.0.0.1", port=0, log_level="warning")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    port = waitForServerPort(server)
    if port is None:
        raise AssertionError("reference server app이 시작되지 않았습니다.")
    url = f"http://127.0.0.1:{port}/app"
    observations = {key: [] for key in ("externalRequests", "failedRequests", "consoleErrors", "pageErrors")}
    context = browser.new_context(viewport={"width": 1280, "height": 820})
    page = context.new_page()
    _observePage(page, _origin(url), observations)
    try:
        readyMs = _openApp(page, url, "서버 처리: 10건, credential=[redacted]")
        if SECRET_VALUE in page.locator("body").inner_text():
            raise AssertionError("server secret이 client text에 노출됐습니다.")
        started = time.perf_counter()
        page.locator('[data-widget-ui="number"]').fill("3")
        page.wait_for_function(
            "() => document.body.textContent?.includes('서버 처리: 15건, credential=[redacted]')",
            timeout=MAX_INTERACTION_MS,
        )
        interactionMs = int((time.perf_counter() - started) * 1000)
        mobile = _mobileContract(page)
        if mobile["overflowPx"] > 1 or any(observations.values()):
            raise AssertionError(f"server reference browser 계약 실패: mobile={mobile}, errors={observations}")
        return {
            "id": "server-secret-app",
            "runtimeTarget": "server",
            "bundleHash": built.bundleHash,
            "manifestHash": verified.manifest["manifestHash"],
            "readyMs": readyMs,
            "interactionMs": interactionMs,
            "secretRedacted": True,
            "mobile": mobile,
            **observations,
        }
    finally:
        context.close()
        server.should_exit = True
        thread.join(timeout=20)


def _localProduct(browser, sourceRoot: Path, workspace: Path) -> dict[str, object]:
    import uvicorn

    from codaro.server import createServerApp

    shutil.copytree(sourceRoot, workspace)
    source = workspace / "app.py"
    app = createServerApp(mode="app", documentPath=source, workspaceRoot=workspace)
    config = uvicorn.Config(app, host="127.0.0.1", port=0, log_level="warning")
    server = uvicorn.Server(config)
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    port = waitForServerPort(server)
    if port is None:
        raise AssertionError("reference Local app이 시작되지 않았습니다.")
    url = f"http://127.0.0.1:{port}/app"
    observations = {key: [] for key in ("externalRequests", "failedRequests", "consoleErrors", "pageErrors")}
    context = browser.new_context(viewport={"width": 1280, "height": 820})
    page = context.new_page()
    _observePage(page, _origin(url), observations)
    try:
        readyMs = _openApp(page, url, "재고 자동화 완료: 4개 품목, 부족 2개")
        artifact = workspace / "artifacts/inventory-report.json"
        if not artifact.is_file():
            raise AssertionError("Local app이 inventory artifact를 만들지 못했습니다.")
        mobile = _mobileContract(page)
        if mobile["overflowPx"] > 1 or any(observations.values()):
            raise AssertionError(f"Local reference browser 계약 실패: mobile={mobile}, errors={observations}")
        return {
            "id": "local-file-automation",
            "runtimeTarget": "local",
            "readyMs": readyMs,
            "artifact": json.loads(artifact.read_text(encoding="utf-8")),
            "mobile": mobile,
            **observations,
        }
    finally:
        context.close()
        server.should_exit = True
        thread.join(timeout=20)


def main() -> int:
    from playwright.sync_api import sync_playwright

    started = datetime.now(tz=UTC)
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    machine = json.loads(MACHINE_REPORT_PATH.read_text(encoding="utf-8"))
    report: dict[str, object] = {
        "schemaVersion": 1,
        "gate": "reference-products",
        "gitHead": machine.get("gitHead"),
        "startedAt": started.isoformat(),
        "generatedAt": utcTimestamp(),
        "status": "failed",
        "machine": machine,
        "products": [],
        "budgets": {
            "maxReadyMs": MAX_READY_MS,
            "maxInteractionMs": MAX_INTERACTION_MS,
            "maxStaticBytes": MAX_STATIC_BYTES,
            "externalRequests": 0,
            "mobileOverflowPx": 1,
        },
    }
    try:
        if machine.get("status") != "passed":
            raise AssertionError("machine reference product 검증이 먼저 통과해야 합니다.")
        manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        byId = {row["id"]: row for row in manifest["products"]}
        with tempfile.TemporaryDirectory(prefix="codaro-reference-browser-") as temporary:
            scratch = Path(temporary)
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(headless=True)
                results = []
                for productId in ("browser-calculator", "csv-dashboard", "snapshot-report"):
                    results.append(_staticProduct(
                        browser,
                        ROOT / byId[productId]["sourcePath"],
                        scratch / productId,
                        productId,
                    ))
                results.append(_serverProduct(
                    browser,
                    ROOT / byId["server-secret-app"]["sourcePath"],
                    scratch / "server-secret-app",
                ))
                results.append(_localProduct(
                    browser,
                    (ROOT / byId["local-file-automation"]["sourcePath"]).parent,
                    scratch / "local-file-automation",
                ))
                browser.close()
        if {row["id"] for row in results} != set(byId):
            raise AssertionError("다섯 reference product의 browser 결과가 모두 없습니다.")
        report["products"] = results
        report["status"] = "passed"
        report["claimBoundary"] = manifest["claimBoundary"]
    except Exception as error:  # noqa: BLE001 - gate report must retain unexpected failures
        report["error"] = f"{type(error).__name__}: {error}"
    completedAt = datetime.now(tz=UTC)
    report["completedAt"] = completedAt.isoformat()
    report["durationMs"] = int((completedAt - started).total_seconds() * 1000)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
