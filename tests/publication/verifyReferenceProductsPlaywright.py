from __future__ import annotations

from datetime import UTC, datetime
import json
import os
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
MAX_SERVER_INTERACTION_MS = 15_000
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


def _calculatorEmbedModes(browser, output: Path) -> dict[str, object]:
    from codaro.publication import startBlockEmbedServer
    from playwright.sync_api import expect

    server, url = startBlockEmbedServer(output, port=0)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    origin = _origin(url)
    observations = {key: [] for key in ("externalRequests", "failedRequests", "consoleErrors", "pageErrors")}
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()
    _observePage(page, origin, observations)
    try:
        page.goto(url, wait_until="domcontentloaded", timeout=MAX_READY_MS)
        page.wait_for_function(
            "() => document.querySelector('codaro-block')?.dataset.codaroEmbedReady === 'true'",
            timeout=MAX_READY_MS,
        )
        page.evaluate(
            """() => {
              for (const mode of ['output', 'editable']) {
                const block = document.createElement('codaro-block');
                block.setAttribute('src', './embed.json');
                block.setAttribute('mode', mode);
                document.querySelector('main').append(block);
              }
            }"""
        )
        page.wait_for_function(
            "() => [...document.querySelectorAll('codaro-block')].length === 3 && [...document.querySelectorAll('codaro-block')].every((item) => item.dataset.codaroEmbedReady === 'true')",
            timeout=MAX_READY_MS,
        )
        blocks = page.locator("codaro-block")
        modes = [blocks.nth(index).get_attribute("data-codaro-embed-mode") for index in range(3)]
        if modes != ["interactive", "output", "editable"]:
            raise AssertionError(f"calculator embed mode projection이 다릅니다: {modes}")

        interactiveFrame = blocks.nth(0).locator("iframe").content_frame
        quantity = interactiveFrame.locator('[data-widget-ui="number"]').nth(1)
        quantity.wait_for(timeout=MAX_READY_MS)
        quantity.fill("4")
        interactiveFrame.get_by_text("검증된 견적 합계: 50,000원", exact=True).wait_for(
            timeout=MAX_INTERACTION_MS
        )

        outputFrame = blocks.nth(1).locator("iframe").content_frame
        outputWidget = outputFrame.locator('[data-widget-ui="number"]').first
        outputWidget.wait_for(timeout=MAX_READY_MS)
        if outputWidget.evaluate("element => getComputedStyle(element).pointerEvents") != "none":
            raise AssertionError("calculator output embed가 widget interaction을 차단하지 않았습니다.")

        editableFrame = blocks.nth(2).locator("iframe").content_frame
        sourceEditor = editableFrame.locator(
            '[data-app-editable-source="total-view"] textarea'
        )
        sourceEditor.wait_for(timeout=MAX_READY_MS)
        sourceEditor.fill(
            "if int(quantity.value) <= 0:\n"
            "    raise ValueError('수량은 1 이상이어야 합니다')\n"
            "total = int(price.value) * int(quantity.value)\n"
            "f'편집 실행 합계: {total:,}원'"
        )
        editableStarted = time.perf_counter()
        editableFrame.locator('[data-app-entry="total-view"]').get_by_role(
            "button", name="코드 실행"
        ).click()
        totalEntry = editableFrame.locator('[data-app-entry="total-view"]')
        try:
            expect(totalEntry).to_contain_text(
                "편집 실행 합계: 25,000원",
                timeout=MAX_READY_MS,
            )
        except AssertionError as error:
            currentErrorEntry = totalEntry.locator('[data-app-current-error="true"]')
            currentError = currentErrorEntry.text_content() if currentErrorEntry.count() else None
            currentText = totalEntry.text_content() or ""
            stale = totalEntry.get_attribute("data-app-output-stale")
            raise AssertionError(
                "calculator editable embed의 코드 실행이 완료되지 않았습니다: "
                f"stale={stale}, currentError={currentError or '없음'}, content={currentText}"
            ) from error
        editableInteractionMs = int((time.perf_counter() - editableStarted) * 1000)
        if editableInteractionMs > MAX_INTERACTION_MS:
            raise AssertionError(
                "calculator editable embed interaction 예산을 넘었습니다: "
                f"{editableInteractionMs}ms > {MAX_INTERACTION_MS}ms"
            )
        if any(observations.values()):
            raise AssertionError(f"calculator embed browser 오류: {observations}")
        return {
            "modes": ["output", "interactive", "editable"],
            "interactiveRecalculated": True,
            "outputInteractionBlocked": True,
            "editableRunObserved": True,
            "editableInteractionMs": editableInteractionMs,
            **observations,
        }
    finally:
        context.close()
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


def _staticProduct(browser, source: Path, output: Path, row: dict[str, object]) -> dict[str, object]:
    from codaro.proof import ProofArchive
    from codaro.publication.workbench import PublicationWorkbench

    productId = str(row["id"])
    archive = ProofArchive(output.parent / f"{productId}-proof.sqlite3")
    archive.initialize()
    workbench = PublicationWorkbench(proofArchive=archive)
    built = _finished(workbench, workbench.build(sourcePath=source, outputPath=output, target="browser"))
    _finished(workbench, workbench.verify(outputPath=output, target="browser"))
    served = _finished(workbench, workbench.serve(outputPath=output, target="browser"))
    url = str(served["result"]["url"])
    serverId = str(served["result"]["serverId"])
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
        bundleRoot = Path(str(built["result"]["bundleRoot"]))
        totalBytes = sum(path.stat().st_size for path in bundleRoot.rglob("*") if path.is_file())
        if readyMs > MAX_READY_MS or interactionMs > MAX_INTERACTION_MS or totalBytes > MAX_STATIC_BYTES:
            raise AssertionError(f"{productId} performance budget을 넘었습니다.")
        if any(observations.values()):
            raise AssertionError(f"{productId} browser 오류: {observations}")
        journey = row["journey"]
        publicationSteps = list(journey["publicationSteps"])
        executed = ["build", "serve"]
        embedConsumption: dict[str, object] | None = None
        if "embed" in publicationSteps:
            embedOutput = output.parent / f"{productId}-embed"
            _finished(workbench, workbench.build(
                sourcePath=source,
                outputPath=embedOutput,
                target="embed",
                entryBlockId=str(row["entryBlockIds"][-1]),
            ))
            _finished(workbench, workbench.verify(outputPath=embedOutput, target="embed"))
            if productId == "browser-calculator":
                embedConsumption = _calculatorEmbedModes(browser, embedOutput)
                if embedConsumption["modes"] != journey["embedModes"]:
                    raise AssertionError(
                        f"{productId} embed mode evidence가 다릅니다: "
                        f"{embedConsumption['modes']} != {journey['embedModes']}"
                    )
            executed.append("embed")
        if "deploy" in publicationSteps:
            _finished(workbench, workbench.deploy(
                publicationPath=output,
                outputPath=output.parent / f"{productId}-deploy",
                target="folder",
            ))
            executed.append("deploy")
        proof = _proofResult(archive, row, executed)
        return {
            "id": productId,
            "runtimeTarget": "browser",
            "bundleHash": built["result"]["bundleHash"],
            "manifestHash": built["result"]["receiptId"],
            "readyMs": readyMs,
            "interactionMs": interactionMs,
            "totalBytes": totalBytes,
            "mobile": mobile,
            "failureRecovered": recovered,
            "embedConsumption": embedConsumption,
            **proof,
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
        _finished(workbench, workbench.stop(serverId))
        workbench.close()


def _serverProduct(browser, source: Path, output: Path, row: dict[str, object]) -> dict[str, object]:
    from codaro.proof import ProofArchive
    from codaro.publication.workbench import PublicationWorkbench

    archive = ProofArchive(output.parent / "server-secret-app-proof.sqlite3")
    archive.initialize()
    workbench = PublicationWorkbench(proofArchive=archive)
    previousSecret = os.environ.get("REFERENCE_API_TOKEN")
    os.environ["REFERENCE_API_TOKEN"] = SECRET_VALUE
    built = _finished(workbench, workbench.build(sourcePath=source, outputPath=output, target="server"))
    _finished(workbench, workbench.verify(outputPath=output, target="server"))
    served = _finished(workbench, workbench.serve(outputPath=output, target="server"))
    url = str(served["result"]["url"])
    serverId = str(served["result"]["serverId"])
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
            timeout=MAX_READY_MS,
        )
        interactionMs = int((time.perf_counter() - started) * 1000)
        if interactionMs > MAX_SERVER_INTERACTION_MS:
            raise AssertionError(
                "server reference interaction 예산을 넘었습니다: "
                f"{interactionMs}ms > {MAX_SERVER_INTERACTION_MS}ms"
            )
        mobile = _mobileContract(page)
        if mobile["overflowPx"] > 1 or any(observations.values()):
            raise AssertionError(f"server reference browser 계약 실패: mobile={mobile}, errors={observations}")
        _finished(workbench, workbench.deploy(
            publicationPath=output,
            outputPath=output.parent / "server-secret-app-deploy",
            target="folder",
        ))
        proof = _proofResult(archive, row, ["build", "serve", "deploy"])
        return {
            "id": "server-secret-app",
            "runtimeTarget": "server",
            "bundleHash": built["result"]["bundleHash"],
            "manifestHash": built["result"]["receiptId"],
            "readyMs": readyMs,
            "interactionMs": interactionMs,
            "secretRedacted": True,
            "mobile": mobile,
            **proof,
            **observations,
        }
    except Exception as error:
        bodyText = ""
        try:
            bodyText = page.locator("body").inner_text()[:4000].replace(SECRET_VALUE, "[secret]")
        except Exception as diagnosticError:  # noqa: BLE001 - diagnostics must not mask the original failure
            bodyText = f"<body unavailable: {type(diagnosticError).__name__}>"
        raise AssertionError(
            f"server-secret-app Chromium journey 실패: {type(error).__name__}: {error}; "
            f"body={bodyText!r}; observations={observations}"
        ) from error
    finally:
        context.close()
        _finished(workbench, workbench.stop(serverId))
        workbench.close()
        if previousSecret is None:
            os.environ.pop("REFERENCE_API_TOKEN", None)
        else:
            os.environ["REFERENCE_API_TOKEN"] = previousSecret


def _localProduct(browser, sourceRoot: Path, workspace: Path, row: dict[str, object]) -> dict[str, object]:
    from codaro.proof import ProofArchive
    from codaro.publication.workbench import PublicationWorkbench

    shutil.copytree(sourceRoot, workspace)
    source = workspace / "app.py"
    sourceSnapshot = _fileSnapshot(workspace)
    output = workspace.parent / f"{workspace.name}-bundle"
    archive = ProofArchive(workspace.parent / "local-file-automation-proof.sqlite3")
    archive.initialize()
    workbench = PublicationWorkbench(proofArchive=archive)
    built = _finished(workbench, workbench.build(sourcePath=source, outputPath=output, target="local"))
    if _fileSnapshot(workspace) != sourceSnapshot:
        raise AssertionError("Local publication build가 source workspace를 변경했습니다.")
    _finished(workbench, workbench.verify(outputPath=output, target="local"))
    policyHash = str(built["result"]["policyHash"])
    served = _finished(workbench, workbench.serve(
        outputPath=output,
        target="local",
        approvedPolicyHash=policyHash,
    ))
    url = str(served["result"]["url"])
    serverId = str(served["result"]["serverId"])
    observations = {key: [] for key in ("externalRequests", "failedRequests", "consoleErrors", "pageErrors")}
    context = browser.new_context(viewport={"width": 1280, "height": 820})
    page = context.new_page()
    _observePage(page, _origin(url), observations)
    try:
        readyMs = _openApp(page, url, "재고 자동화 완료: 4개 품목, 부족 2개")
        mobile = _mobileContract(page)
        if mobile["overflowPx"] > 1 or any(observations.values()):
            raise AssertionError(f"Local reference browser 계약 실패: mobile={mobile}, errors={observations}")
        source.write_text(source.read_text(encoding="utf-8").replace("layout = \"stack\"", "layout = \"notebook\""), encoding="utf-8")
        second = _finished(workbench, workbench.build(sourcePath=source, outputPath=output, target="local"))
        if second["result"]["bundleHash"] == built["result"]["bundleHash"]:
            raise AssertionError("Local reference rollback fixture가 두 build를 만들지 못했습니다.")
        _finished(workbench, workbench.rollback(
            outputPath=output,
            target="local",
            versionId=str(built["result"]["bundleHash"]),
        ))
        proof = _proofResult(archive, row, ["build", "serve", "rollback"])
        return {
            "id": "local-file-automation",
            "runtimeTarget": "local",
            "bundleHash": built["result"]["bundleHash"],
            "manifestHash": built["result"]["receiptId"],
            "policyHash": policyHash,
            "readyMs": readyMs,
            "mobile": mobile,
            **proof,
            **observations,
        }
    finally:
        context.close()
        if serverId:
            _finished(workbench, workbench.stop(serverId))
        workbench.close()


def _fileSnapshot(root: Path) -> list[tuple[str, bytes]]:
    return [
        (path.relative_to(root).as_posix(), path.read_bytes())
        for path in sorted(root.rglob("*"))
        if path.is_file()
    ]


def _finished(workbench, job: dict[str, object]) -> dict[str, object]:
    deadline = time.monotonic() + 180
    current = job
    while current["status"] == "running" and time.monotonic() < deadline:
        time.sleep(0.05)
        refreshed = workbench.job(str(current["id"]))
        if refreshed is None:
            raise AssertionError(f"publication job이 사라졌습니다: {current['id']}")
        current = refreshed
    if current["status"] != "completed":
        raise AssertionError(f"publication job 실패: {current}")
    return current


def _proofResult(archive, row: dict[str, object], journey: list[str]) -> dict[str, object]:
    journeyContract = row["journey"]
    declaredJourney = [str(item) for item in journeyContract["publicationSteps"]]
    if journey != declaredJourney:
        raise AssertionError(f"{row['id']} journey mismatch: {journey} != {declaredJourney}")
    receipts = archive.receipts()
    proofKinds = sorted({receipt.kind for receipt in receipts})
    expectedKinds = sorted(str(item) for item in journeyContract["proofKinds"])
    if proofKinds != expectedKinds:
        raise AssertionError(f"{row['id']} proof mismatch: {proofKinds} != {expectedKinds}")
    for receipt in receipts:
        if receipt.kind == "deployment":
            archive.resolveLineage(receipt.receiptId)
    return {
        "journey": journey,
        "proofKinds": proofKinds,
        "receiptIds": [receipt.receiptId for receipt in receipts],
    }


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
            "maxServerInteractionMs": MAX_SERVER_INTERACTION_MS,
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
        machineById = {row["id"]: row for row in machine.get("products", [])}
        if set(machineById) != set(byId):
            raise AssertionError("machine report가 다섯 source journey를 모두 포함하지 않습니다.")
        for productId, row in byId.items():
            evidence = machineById[productId].get("journeyEvidence")
            journey = row["journey"]
            if not isinstance(evidence, dict):
                raise AssertionError(f"{productId} machine journey evidence가 없습니다.")
            if evidence.get("publicSdkImports", {}).get("observed") != sorted(journey["publicSdkImports"]):
                raise AssertionError(f"{productId} public SDK import evidence가 다릅니다.")
            if evidence.get("appProjection", {}).get("entryBlockIds") != row["entryBlockIds"]:
                raise AssertionError(f"{productId} app projection evidence가 다릅니다.")
            if evidence.get("publication", {}).get("target") != row["runtimeTarget"]:
                raise AssertionError(f"{productId} publication target evidence가 다릅니다.")
            if evidence.get("publication", {}).get("steps") != journey["publicationSteps"]:
                raise AssertionError(f"{productId} publication step evidence가 다릅니다.")
            if evidence.get("embedModes") != journey["embedModes"]:
                raise AssertionError(f"{productId} embed mode evidence가 다릅니다.")
            if evidence.get("proofKinds") != journey["proofKinds"]:
                raise AssertionError(f"{productId} proof kind evidence가 다릅니다.")
            if evidence.get("claimBoundary") != journey["claimBoundary"]:
                raise AssertionError(f"{productId} claim boundary evidence가 다릅니다.")
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
                        byId[productId],
                    ))
                results.append(_serverProduct(
                    browser,
                    ROOT / byId["server-secret-app"]["sourcePath"],
                    scratch / "server-secret-app",
                    byId["server-secret-app"],
                ))
                results.append(_localProduct(
                    browser,
                    (ROOT / byId["local-file-automation"]["sourcePath"]).parent,
                    scratch / "local-file-automation",
                    byId["local-file-automation"],
                ))
                browser.close()
        if {row["id"] for row in results} != set(byId):
            raise AssertionError("다섯 reference product의 browser 결과가 모두 없습니다.")
        report["products"] = results
        report["sameSourceJourney"] = {
            "plainPython": all(row["plainPythonExitCode"] == 0 for row in machineById.values()),
            "publicSdkImports": all(
                not row["journeyEvidence"]["publicSdkImports"]["internalImports"]
                for row in machineById.values()
            ),
            "appProjection": all(
                row["journeyEvidence"]["appProjection"]["declared"] is True
                for row in machineById.values()
            ),
            "publicationTargets": sorted({row["runtimeTarget"] for row in results}),
            "calculatorEmbedModes": next(
                row["embedConsumption"]["modes"]
                for row in results
                if row["id"] == "browser-calculator"
            ),
            "proofKinds": sorted({kind for row in results for kind in row["proofKinds"]}),
            "claimBoundary": sorted({row["journey"]["claimBoundary"] for row in byId.values()}),
        }
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
