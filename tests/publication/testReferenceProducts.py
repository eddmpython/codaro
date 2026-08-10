from __future__ import annotations

import asyncio
import base64
import hashlib
import json
from pathlib import Path
import shutil

from codaro.automation.taskModel import TaskDefinition, TaskStatus
from codaro.automation.taskRunner import TaskRunner
from codaro.automation.taskSafety import confirmTaskSafety
from codaro.document import loadDocument
from codaro.proof import ProofArchive
from codaro.publication import (
    FolderDeploymentAdapter,
    ZipDeploymentAdapter,
    buildBlockEmbed,
    buildServerPublication,
    buildStaticPublication,
    compileDocument,
    deployPublication,
    verifyBlockEmbed,
    verifyPublication,
    verifyServerPublication,
)


ROOT = Path(__file__).resolve().parents[2]
EXAMPLE_ROOT = ROOT / "examples/apps"
MANIFEST_PATH = EXAMPLE_ROOT / "referenceProducts.json"
SCHEMA_PATH = ROOT / "contracts/referenceProducts.schema.json"
EXPECTED_IDS = {
    "browser-calculator",
    "csv-dashboard",
    "snapshot-report",
    "server-secret-app",
    "local-file-automation",
}


def _sri(payload: bytes) -> str:
    return "sha256-" + base64.b64encode(hashlib.sha256(payload).digest()).decode("ascii")


def _runtimeManifest(path: Path, root: str, names: list[str]) -> None:
    files = []
    for name in names:
        payload = (path.parent / root / name).read_bytes()
        files.append({
            "path": name,
            "url": f"/{root}{name}",
            "integrity": _sri(payload),
            "bytes": len(payload),
            "roles": ["engineScript"],
        })
    path.write_text(json.dumps({"version": 1, "packageRoot": f"/{root}", "files": files}), encoding="utf-8")


def _shell(root: Path) -> Path:
    shell = root / "webBuild"
    (shell / "_app").mkdir(parents=True)
    (shell / "embed").mkdir()
    (shell / "vendor/pyproc/src").mkdir(parents=True)
    (shell / "vendor/pyodide").mkdir(parents=True)
    (shell / "_app/app.js").write_text("window.referenceFixture = true", encoding="utf-8")
    (shell / "embed/codaro-block.js").write_text("customElements.define('codaro-block', class extends HTMLElement {})", encoding="utf-8")
    (shell / "vendor/pyproc/src/worker.js").write_text("self.onmessage = () => {}", encoding="utf-8")
    for name, payload in {
        "pyodide.js": b"globalThis.loadPyodide = async () => ({})",
        "pyodide.mjs": b"export const loadPyodide = async () => ({})",
        "pyodide.asm.mjs": b"export default {}",
        "pyodide.asm.wasm": b"\x00asm",
        "pyodide-lock.json": b"{}",
        "python_stdlib.zip": b"PK\x05\x06" + b"\x00" * 18,
    }.items():
        (shell / "vendor/pyodide" / name).write_bytes(payload)
    (shell / "index.html").write_text(
        '<!doctype html><html><head><title>Codaro</title></head><body><div id="root"></div></body></html>',
        encoding="utf-8",
    )
    _runtimeManifest(shell / "pyproc-assets.json", "vendor/pyproc/", ["src/worker.js"])
    _runtimeManifest(
        shell / "pyodide-assets.json",
        "vendor/pyodide/",
        [
            "pyodide.js", "pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm",
            "pyodide-lock.json", "python_stdlib.zip",
        ],
    )
    return shell


def _manifest() -> dict[str, object]:
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def _products() -> list[dict[str, object]]:
    products = _manifest()["products"]
    assert isinstance(products, list)
    return products


def _row(productId: str) -> dict[str, object]:
    return next(row for row in _products() if row["id"] == productId)


def _source(row: dict[str, object]) -> Path:
    return ROOT / str(row["sourcePath"])


def testReferenceManifestIsClosedAndContainsExactlyFiveProducts() -> None:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    manifest = _manifest()

    assert schema["additionalProperties"] is False
    assert schema["properties"]["schemaVersion"] == {"const": 1}
    assert manifest["schemaVersion"] == 1
    assert manifest["kind"] == "codaro.reference-products"
    assert {row["id"] for row in _products()} == EXPECTED_IDS
    assert len(_products()) == 5
    assert set(manifest) == {"schemaVersion", "kind", "products", "claimBoundary"}
    expectedProductFields = {
        "id", "title", "sourcePath", "runtimeTarget", "entryBlockIds", "assetPaths",
        "secretRefs", "journey", "expectedProofKinds", "claim",
    }
    assert all(set(row) == expectedProductFields for row in _products())
    assert all(_source(row).is_file() for row in _products())
    assert all((ROOT / path).is_file() for row in _products() for path in row["assetPaths"])


def testEveryReferenceProductRoundTripsAndCompilerMatchesDeclaredTarget() -> None:
    for row in _products():
        source = _source(row)
        document = loadDocument(str(source))
        report = compileDocument(
            document,
            sourcePath=source,
            sourceText=source.read_text(encoding="utf-8"),
            workspaceRoot=source.parent,
        )

        assert report.runtimeTarget == row["runtimeTarget"]
        assert document.app.entryBlockIds == row["entryBlockIds"]
        assert document.app.hideCode is True
        assert source.read_text(encoding="utf-8").startswith("# /// codaro-app")
        assert all(blockId in {block.id for block in document.blocks} for blockId in row["entryBlockIds"])
        detectedSecrets = sorted({
            secret
            for unit in report.units
            for secret in unit.unit["effects"]["secretRefs"]
        })
        assert detectedSecrets == row["secretRefs"]


def testBrowserReferencesBuildDeployAndCalculatorEmbedsWithoutSourceMutation(tmp_path: Path) -> None:
    archive = ProofArchive(tmp_path / "proof.sqlite3")
    shell = _shell(tmp_path)
    for row in (item for item in _products() if item["runtimeTarget"] == "browser"):
        source = _source(row)
        sourceBefore = source.read_bytes()
        output = tmp_path / str(row["id"])
        first = buildStaticPublication(source, output, webBuildRoot=shell)
        second = buildStaticPublication(source, output, webBuildRoot=shell)
        assert first.bundleHash == second.bundleHash
        assert second.reused is True
        assert verifyPublication(output).bundleHash == first.bundleHash
        assert source.read_bytes() == sourceBefore

        folder = deployPublication(
            output,
            FolderDeploymentAdapter(tmp_path / f"{row['id']}-folder"),
            proofArchive=archive,
            verifiedAt="2026-08-10T00:00:00+00:00",
        )
        zipped = deployPublication(
            output,
            ZipDeploymentAdapter(tmp_path / f"{row['id']}.zip"),
            verifiedAt="2026-08-10T00:00:00+00:00",
        )
        assert folder.target == "folder"
        assert zipped.target == "zip"

    calculator = _row("browser-calculator")
    embed = buildBlockEmbed(
        _source(calculator),
        tmp_path / "calculator-embed",
        entryBlockId="total-view",
        defaultMode="interactive",
        webBuildRoot=shell,
    )
    verifiedEmbed = verifyBlockEmbed(embed.outputRoot)
    assert verifiedEmbed.manifest["entryBlockId"] == "total-view"
    assert verifiedEmbed.manifest["dependencyBlockIds"] == ["price-widget", "quantity-widget"]
    assert archive.summary()["receipts"] == 9


def testServerReferenceBuildKeepsSecretOutOfBundle(tmp_path: Path) -> None:
    row = _row("server-secret-app")
    source = _source(row)
    built = buildServerPublication(source, tmp_path / "server", webBuildRoot=_shell(tmp_path))
    verified = verifyServerPublication(built.outputRoot)
    bundleBytes = b"\n".join(path.read_bytes() for path in verified.bundleRoot.rglob("*") if path.is_file())

    assert verified.bundleHash == built.bundleHash
    assert verified.manifest["runtime"]["secretRefs"] == ["REFERENCE_API_TOKEN"]
    assert b"reference-secret-canary" not in bundleBytes
    assert b"REFERENCE_API_TOKEN" in bundleBytes


def testLocalReferenceRunsAsSemanticallyValidatedTask(tmp_path: Path) -> None:
    row = _row("local-file-automation")
    workspace = tmp_path / "workspace"
    shutil.copytree(_source(row).parent, workspace)
    task = TaskDefinition(
        id="reference-local-inventory",
        name="재고 파일 자동화",
        documentPath="app.py",
        outputs=["artifacts/inventory-report.json"],
        outputContract={
            "schemaVersion": 1,
            "stdoutContains": ["재고 자동화 완료: 4개 품목, 부족 2개"],
            "artifacts": [{
                "path": "artifacts/inventory-report.json",
                "minBytes": 40,
                "jsonSchema": {
                    "requiredFields": ["itemCount", "lowStockCount", "lowStockItems", "status"],
                    "fieldTypes": {
                        "itemCount": "integer",
                        "lowStockCount": "integer",
                        "lowStockItems": "array",
                        "status": "string"
                    }
                }
            }],
        },
        permissionScopes=["filesystem.read", "filesystem.write"],
        riskLevel="destructive",
    )
    task.safetyApproval = confirmTaskSafety(task, confirmation=task.id, workspaceRoot=workspace)

    run = asyncio.run(TaskRunner(workspaceRoot=workspace).run(task))
    artifact = json.loads((workspace / "artifacts/inventory-report.json").read_text(encoding="utf-8"))

    assert run.status == TaskStatus.SUCCESS
    assert run.validated is True
    assert run.operationalCandidate is True
    assert run.validationErrors == []
    assert len(run.artifactDescriptors) == 1
    assert artifact == {
        "itemCount": 4,
        "lowStockCount": 2,
        "lowStockItems": ["모니터", "마우스"],
        "status": "attention",
    }


def testReferenceClaimsStayInsideMachineVerifiedBoundary() -> None:
    manifest = _manifest()
    boundary = manifest["claimBoundary"]
    assert isinstance(boundary, dict)
    machineVerified = boundary["machineVerified"]
    notVerified = boundary["notVerified"]
    assert "공용 인터넷 URL의 uptime, DNS, TLS" in notVerified
    assert "인간 학습 효과의 인과 검증" in notVerified
    assert all("학습 효과가 입증" not in str(row["claim"]) for row in _products())
    assert all("공용 인터넷에 배포" not in claim for claim in machineVerified)
