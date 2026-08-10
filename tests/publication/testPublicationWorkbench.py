from __future__ import annotations

from pathlib import Path
import shutil
from urllib.request import urlopen
import time

from codaro.proof.archive import ProofArchive
from codaro.publication.workbench import PublicationWorkbench


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]


def testWorkbenchBuildVerifyServeStopAndDeploy(tmp_path: Path) -> None:
    archive = ProofArchive(tmp_path / "proof.sqlite3")
    archive.initialize()
    workbench = PublicationWorkbench(proofArchive=archive)
    output = tmp_path / "calculator-site"

    built = _finished(workbench, workbench.build(
        sourcePath=REPOSITORY_ROOT / "examples/apps/browser-calculator/app.py",
        outputPath=output,
        target="browser",
    ))
    assert built["status"] == "completed", built
    assert built["result"]["outputPath"] == output.as_posix()
    assert str(built["result"]["receiptId"]).startswith("sha256-")

    verified = _finished(workbench, workbench.verify(outputPath=output, target="browser"))
    assert verified["status"] == "completed", verified
    assert verified["result"]["bundleHash"] == built["result"]["bundleHash"]

    embedded = _finished(workbench, workbench.build(
        sourcePath=REPOSITORY_ROOT / "examples/apps/browser-calculator/app.py",
        outputPath=tmp_path / "calculator-embed",
        target="embed",
        entryBlockId="total-view",
    ))
    assert embedded["status"] == "completed", embedded
    assert embedded["result"]["sourceRevisionHash"] == built["result"]["sourceRevisionHash"]

    served = _finished(workbench, workbench.serve(outputPath=output, target="browser"))
    assert served["status"] == "completed", served
    with urlopen(str(served["result"]["url"]), timeout=5) as response:
        assert response.status == 200
    stopped = _finished(workbench, workbench.stop(str(served["result"]["serverId"])))
    assert stopped["status"] == "completed", stopped

    deployed = _finished(workbench, workbench.deploy(
        publicationPath=output,
        outputPath=tmp_path / "deployed",
        target="folder",
    ))
    assert deployed["status"] == "completed", deployed
    assert archive.receiptById(str(deployed["result"]["receiptId"])) is not None
    workbench.close()


def testWorkbenchReturnsCompilerDiagnosticsForBlockedBuild(tmp_path: Path) -> None:
    source = tmp_path / "blocked.py"
    source.write_text(
        "# %% [code] id=network\nimport requests\nrequests.get(target_url)\n",
        encoding="utf-8",
    )
    archive = ProofArchive(tmp_path / "proof.sqlite3")
    archive.initialize()
    workbench = PublicationWorkbench(proofArchive=archive)

    job = _finished(workbench, workbench.build(
        sourcePath=source,
        outputPath=tmp_path / "blocked-site",
        target="browser",
    ))

    assert job["status"] == "failed"
    assert job["error"] is not None
    assert job["error"]["diagnostics"]


def testWorkbenchRunsApprovedLocalPublicationAndRollsBack(tmp_path: Path) -> None:
    workspace = tmp_path / "workspace"
    shutil.copytree(REPOSITORY_ROOT / "examples/apps/local-file-automation", workspace)
    source = workspace / "app.py"
    output = tmp_path / "local-app"
    archive = ProofArchive(tmp_path / "proof.sqlite3")
    archive.initialize()
    workbench = PublicationWorkbench(proofArchive=archive)

    first = _finished(workbench, workbench.build(sourcePath=source, outputPath=output, target="local"))
    assert first["status"] == "completed", first
    policyHash = str(first["result"]["policyHash"])
    assert first["result"]["permissionScopes"] == ["filesystem.read", "filesystem.write", "process.execute"]
    assert _finished(workbench, workbench.verify(outputPath=output, target="local"))["status"] == "completed"

    served = _finished(workbench, workbench.serve(
        outputPath=output,
        target="local",
        approvedPolicyHash=policyHash,
    ))
    assert served["status"] == "completed", served
    healthUrl = str(served["result"]["url"]).removesuffix("/app") + "/api/health"
    with urlopen(healthUrl, timeout=5) as response:
        assert response.status == 200
    assert _finished(workbench, workbench.stop(str(served["result"]["serverId"])))["status"] == "completed"

    source.write_text(source.read_text(encoding="utf-8").replace("재고 자동화 완료", "재고 자동화 v2"), encoding="utf-8")
    second = _finished(workbench, workbench.build(sourcePath=source, outputPath=output, target="local"))
    assert second["result"]["bundleHash"] != first["result"]["bundleHash"]
    restored = _finished(workbench, workbench.rollback(
        outputPath=output,
        target="local",
        versionId=str(first["result"]["bundleHash"]),
    ))
    assert restored["result"]["versionId"] == first["result"]["bundleHash"]
    workbench.close()


def _finished(workbench: PublicationWorkbench, job: dict[str, object]) -> dict[str, object]:
    deadline = time.monotonic() + 90
    current = job
    while current["status"] == "running" and time.monotonic() < deadline:
        time.sleep(0.05)
        refreshed = workbench.job(str(current["id"]))
        assert refreshed is not None
        current = refreshed
    assert current["status"] != "running"
    return current
