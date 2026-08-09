from __future__ import annotations

import asyncio
from datetime import UTC, datetime
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import runpy
import sys
import tempfile
import threading


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))
REPORT_DIR = ROOT / "output/test-runner/learning-product-bridge"
REPORT_PATH = REPORT_DIR / "learning-product-bridge-report.json"


def utcTimestamp() -> str:
    return datetime.now(tz=UTC).strftime("%Y-%m-%dT%H:%M:%SZ")


def runJourney(root: Path, archive: dict[str, object], inputs: dict[str, object]) -> dict[str, object]:
    from codaro.api.learningArchiveAutomation import (
        promoteLearningArtifactToExecutableUnit,
        readCurrentLearningArchive,
        recordPromotedTaskOperationalRun,
    )
    from codaro.automation.taskRegistry import TaskRegistry
    from codaro.automation.taskRunner import TaskRunner
    from codaro.automation.taskSafety import confirmTaskSafety
    from codaro.curriculum.learningArchive import commitLearningArchiveImport
    from codaro.proof import ProofArchive

    workspace = root / "workspace"
    workspace.mkdir(parents=True)
    store = root / "archives"
    commitLearningArchiveImport(archive, store)
    current = readCurrentLearningArchive(store)
    draftId = current["automationDrafts"][0]["draftId"]
    registry = TaskRegistry(root / "tasks")
    proofArchive = ProofArchive(root / "proof.sqlite3")
    promoted = promoteLearningArtifactToExecutableUnit(
        draftId,
        storeRoot=store,
        workspaceRoot=workspace,
        proofArchive=proofArchive,
        taskRegistry=registry,
        inputs=inputs,
    )
    task = registry.get(promoted["task"]["id"])
    if task is None:
        raise AssertionError("승격된 Task를 registry에서 찾지 못했습니다.")
    task.safetyApproval = confirmTaskSafety(task, confirmation=task.id, workspaceRoot=workspace)
    task.enabled = True
    run = asyncio.run(TaskRunner(workspaceRoot=workspace).run(task))
    receipt = recordPromotedTaskOperationalRun(task, run, proofArchive=proofArchive)
    if run.validated is not True or receipt is None:
        raise AssertionError(f"승격된 Task의 의미 검증 또는 operational proof가 실패했습니다: {run.validationErrors}")
    return {
        "artifact": (workspace / "report.json").read_bytes(),
        "artifactHash": run.artifactDescriptors[0]["contentHash"],
        "operationalReceiptId": receipt.receiptId,
        "sourceBlockHash": promoted["promotion"]["sourceBlockHash"],
        "unitId": promoted["executableUnit"]["unitId"],
    }


def main() -> int:
    from playwright.sync_api import sync_playwright

    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    report: dict[str, object] = {
        "schemaVersion": 1,
        "gate": "learning-product-bridge",
        "generatedAt": utcTimestamp(),
        "status": "failed",
    }
    server = None
    thread = None
    page = None
    try:
        fixture = runpy.run_path(str(ROOT / "tests/learning/testLearningProductBridge.py"))
        archive = fixture["_strongArchive"]()
        inputs = {"average": 2, "count": 1, "outputPath": "report.json", "total": 2}
        with tempfile.TemporaryDirectory(prefix="codaro-learning-product-") as tempDirectory:
            root = Path(tempDirectory)
            novice = runJourney(root / "novice", archive, inputs)
            fastTrack = runJourney(root / "fast-track", archive, inputs)
            if (
                novice["sourceBlockHash"] != fastTrack["sourceBlockHash"]
                or novice["unitId"] != fastTrack["unitId"]
                or novice["artifactHash"] != fastTrack["artifactHash"]
                or novice["artifact"] != fastTrack["artifact"]
            ):
                raise AssertionError("초보자 경로와 entry fast-track 경로의 최종 기능 블록이 다릅니다.")
            (root / "novice" / "report.json").write_bytes(novice["artifact"])
            (root / "fast-track" / "report.json").write_bytes(fastTrack["artifact"])
            (root / "index.html").write_text(
                """<!doctype html><html lang=\"ko\"><meta charset=\"utf-8\"><title>Codaro 기능 블록 계보</title>
                <body><main><h1>같은 기능 블록</h1>
                <button data-path=\"novice\">초보자 경로</button>
                <button data-path=\"fast-track\">빠른 진입 경로</button>
                <pre data-artifact></pre></main>
                <script>
                for (const button of document.querySelectorAll('button')) button.onclick = async () => {
                  const value = await (await fetch(`/${button.dataset.path}/report.json`)).json();
                  document.querySelector('[data-artifact]').textContent = JSON.stringify(value);
                  document.body.dataset.activePath = button.dataset.path;
                };
                </script></body></html>""",
                encoding="utf-8",
            )
            handler = partial(SimpleHTTPRequestHandler, directory=str(root))
            server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            url = f"http://127.0.0.1:{server.server_port}/"
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(headless=True)
                context = browser.new_context(viewport={"width": 900, "height": 600})
                page = context.new_page()
                page.goto(url, wait_until="networkidle")
                observed: list[str] = []
                for path in ("novice", "fast-track"):
                    page.locator(f"button[data-path='{path}']").click()
                    page.wait_for_function("path => document.body.dataset.activePath === path", arg=path)
                    observed.append(page.locator("[data-artifact]").inner_text())
                if observed[0] != observed[1] or json.loads(observed[0]) != {"average": 2, "count": 1, "total": 2}:
                    raise AssertionError("Chromium에서 두 진입 경로의 최종 산출물이 다릅니다.")
                screenshot = REPORT_DIR / "learning-product-bridge.png"
                page.screenshot(path=str(screenshot), full_page=True)
                context.close()
                browser.close()
            report.update({
                "status": "passed",
                "sourceBlockHash": novice["sourceBlockHash"],
                "unitId": novice["unitId"],
                "artifactHash": novice["artifactHash"],
                "noviceOperationalReceiptId": novice["operationalReceiptId"],
                "fastTrackOperationalReceiptId": fastTrack["operationalReceiptId"],
                "chromiumArtifacts": observed,
                "screenshot": screenshot.relative_to(ROOT).as_posix(),
            })
    except Exception as error:  # noqa: BLE001 - gate report must retain unexpected failures
        report["error"] = f"{type(error).__name__}: {error}"
        if page is not None:
            try:
                report["bodyText"] = page.locator("body").inner_text()[:4000]
            except Exception as diagnosticError:  # noqa: BLE001
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
