from __future__ import annotations

import base64
import hashlib
import json
from pathlib import Path

import pytest

from codaro.document import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata
from codaro.document.percentFormat import writePercentDocument
from codaro.executionIsolation import proofExecutionIsolationPolicyHash
from codaro.proof import (
    BuildArtifact,
    FunctionalCheckReceipt,
    OperationalRunReceipt,
    PermissionReceipt,
    ProofArchive,
    SourceRevision,
    canonicalJson,
    contentDigest,
    sealProofReceipt,
)
from codaro.publication import (
    PublicationBuildError,
    buildBlockEmbed,
    buildServerPublication,
    buildStaticPublication,
    compileExecutableUnit,
)
from codaro.publication.adapters import DeploymentError, FolderDeploymentAdapter, deployPublication
from codaro.publication.proofLineage import createPromotedBlockPayload


ROOT = Path(__file__).resolve().parents[2]
NOW = "2026-08-10T00:00:00+00:00"


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
            "roles": ["engineScript"] if name.endswith(".js") else ["engineCore"],
        })
    path.write_text(
        json.dumps({"version": 1, "packageRoot": f"/{root}", "files": files}),
        encoding="utf-8",
    )


def _shell(root: Path) -> Path:
    shell = root / "webBuild"
    (shell / "_app").mkdir(parents=True)
    (shell / "embed").mkdir()
    (shell / "vendor/pyproc/src").mkdir(parents=True)
    (shell / "vendor/pyodide").mkdir(parents=True)
    (shell / "_app/app.js").write_text("window.proofLineageFixture = true;", encoding="utf-8")
    (shell / "embed/codaro-block.js").write_bytes((ROOT / "editor/src/embed/codaroBlock.js").read_bytes())
    (shell / "vendor/pyproc/src/worker.js").write_text("self.onmessage = () => {};", encoding="utf-8")
    for name, payload in {
        "pyodide.js": b"globalThis.loadPyodide = async () => ({});",
        "pyodide.mjs": b"export const loadPyodide = async () => ({});",
        "pyodide.asm.mjs": b"export default {};",
        "pyodide.asm.wasm": b"\x00asm",
        "pyodide-lock.json": b"{}",
        "python_stdlib.zip": b"PK\x05\x06" + b"\x00" * 18,
    }.items():
        (shell / "vendor/pyodide" / name).write_bytes(payload)
    (shell / "index.html").write_text(
        "<!doctype html><html><head><title>Codaro</title>"
        '<script type="module" src="/_app/app.js"></script></head><body><div id="root"></div>'
        '<script>const isLocalPreview = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);</script>'
        "</body></html>",
        encoding="utf-8",
    )
    _runtimeManifest(shell / "pyproc-assets.json", "vendor/pyproc/", ["src/worker.js"])
    _runtimeManifest(
        shell / "pyodide-assets.json",
        "vendor/pyodide/",
        [
            "pyodide.js",
            "pyodide.mjs",
            "pyodide.asm.mjs",
            "pyodide.asm.wasm",
            "pyodide-lock.json",
            "python_stdlib.zip",
        ],
    )
    return shell


def _promotedFixture(root: Path) -> tuple[Path, ProofArchive, SourceRevision, BuildArtifact]:
    workspace = root / "workspace"
    workspace.mkdir(parents=True)
    sourcePath = workspace / "promoted.py"
    code = "value = 41\nresult = value + 1\nprint(result)"
    creditIds = ["credit:learning-application-1"]
    checkIds = ["check:learning-application-1"]
    plain = CodaroDocument(
        id="proof-lineage-fixture",
        title="증거 계보 기능",
        blocks=[BlockConfig(id="entry", type="automation", content=code)],
        metadata=DocumentMetadata(sourceFormat="percent"),
        app=AppConfig(title="증거 계보 기능", entryBlockIds=["entry"]),
    )
    previewText = writePercentDocument(plain)
    preview = compileExecutableUnit(
        plain,
        "entry",
        sourcePath=sourcePath,
        sourceText=previewText,
        workspaceRoot=workspace,
        checkScenarioIds=checkIds,
        evidenceReceiptIds=creditIds,
    )
    source = sealProofReceipt({
        "kind": "sourceRevision",
        "sourceHash": preview.unit["entryBlockHash"],
        "dependencyHash": preview.unit["dependencyHash"],
        "packageSetHash": contentDigest(canonicalJson(sorted(preview.packages))),
        "effectSetHash": contentDigest(canonicalJson(preview.unit["effects"])),
        "documentPath": sourcePath.name,
        "blockIds": ["entry"],
        "createdAt": NOW,
    })
    assert isinstance(source, SourceRevision)
    payload = createPromotedBlockPayload(
        sourceRevisionReceiptId=source.receiptId,
        sourceBlockHash=source.sourceHash,
        dependencyHash=source.dependencyHash,
        learningCreditIds=creditIds,
        learningCheckIds=checkIds,
    )
    promoted = plain.model_copy(update={
        "blocks": [plain.blocks[0].model_copy(update={
            "sourceType": "promoted",
            "role": "automation",
            "executionKind": "task",
            "payload": payload,
        })],
    })
    sourceBytes = writePercentDocument(promoted).encode("utf-8")
    sourcePath.write_bytes(sourceBytes)
    compiled = compileExecutableUnit(
        promoted,
        "entry",
        sourcePath=sourcePath,
        sourceText=sourceBytes.decode("utf-8"),
        workspaceRoot=workspace,
    )
    proofReference = compiled.unit["proofLineage"]
    assert isinstance(proofReference, dict)
    build = sealProofReceipt({
        "kind": "buildArtifact",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "buildArtifactHash": contentDigest(sourceBytes),
        "manifestHash": proofReference["lineageHash"],
        "target": "local",
        "createdAt": NOW,
    })
    assert isinstance(build, BuildArtifact)
    archive = ProofArchive(root / "proof.sqlite3")
    archive.appendReceipt(source)
    archive.appendReceipt(build)
    _appendOperationalVariant(
        archive,
        source,
        build,
        creditIds=creditIds,
        permissionSeed="permission-a",
        artifactSeed="artifact-a",
        timestamp="2026-08-10T00:01:00+00:00",
    )
    return sourcePath, archive, source, build


def _appendOperationalVariant(
    archive: ProofArchive,
    source: SourceRevision,
    build: BuildArtifact,
    *,
    creditIds: list[str],
    permissionSeed: str,
    artifactSeed: str,
    timestamp: str,
) -> OperationalRunReceipt:
    permission = sealProofReceipt({
        "kind": "permission",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "effectSetHash": source.effectSetHash,
        "permissionSetHash": contentDigest(permissionSeed),
        "approvedAt": timestamp,
    })
    assert isinstance(permission, PermissionReceipt)
    check = sealProofReceipt({
        "kind": "functionalCheck",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "buildArtifactReceiptId": build.receiptId,
        "buildArtifactHash": build.buildArtifactHash,
        "inputHash": contentDigest("input"),
        "checkSpecHash": contentDigest("check-spec"),
        "artifactHashes": [contentDigest(artifactSeed)],
        "passed": True,
        "checkedAt": timestamp,
    })
    assert isinstance(check, FunctionalCheckReceipt)
    operational = sealProofReceipt({
        "kind": "operationalRun",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "buildArtifactReceiptId": build.receiptId,
        "buildArtifactHash": build.buildArtifactHash,
        "inputHash": check.inputHash,
        "permissionReceiptId": permission.receiptId,
        "permissionSetHash": permission.permissionSetHash,
        "functionalCheckReceiptId": check.receiptId,
        "artifactHashes": check.artifactHashes,
        "learningEvidenceCreditIds": creditIds,
        "learningEvidenceArtifactHashes": [contentDigest("learning-artifact")],
        "capabilityDomainId": "proof-lineage",
        "taskId": "proof-lineage-task",
        "runId": f"run:{timestamp}",
        "runtimeTier": "local",
        "isolationProfile": "codaro-local-restricted-v1",
        "isolationPolicyHash": proofExecutionIsolationPolicyHash(),
        "isolationTerminationStatus": "destroyed",
        "learnerSelectedInput": True,
        "startedAt": timestamp,
        "finishedAt": timestamp,
    })
    assert isinstance(operational, OperationalRunReceipt)
    archive.appendReceipt(permission)
    archive.appendReceipt(check)
    archive.appendReceipt(operational)
    return operational


def testPromotedProofExtendsOneArchiveDagThroughBuildEmbedAndDeploy(tmp_path: Path) -> None:
    sourcePath, archive, source, localBuild = _promotedFixture(tmp_path)
    shell = _shell(tmp_path)

    static = buildStaticPublication(
        sourcePath,
        tmp_path / "static",
        webBuildRoot=shell,
        proofArchive=archive,
    )
    server = buildServerPublication(
        sourcePath,
        tmp_path / "server",
        webBuildRoot=shell,
        proofArchive=archive,
    )
    embed = buildBlockEmbed(
        sourcePath,
        tmp_path / "embed",
        entryBlockId="entry",
        webBuildRoot=shell,
        proofArchive=archive,
    )
    deployment = deployPublication(
        tmp_path / "static",
        FolderDeploymentAdapter(tmp_path / "deployed"),
        proofArchive=archive,
        verifiedAt="2026-08-10T00:02:00+00:00",
    )
    embedDeployment = deployPublication(
        tmp_path / "embed",
        FolderDeploymentAdapter(tmp_path / "embed-deployed"),
        proofArchive=archive,
        verifiedAt="2026-08-10T00:03:00+00:00",
    )

    assert static.manifest["proof"]["verificationStatus"] == "verified"
    assert server.manifest["proof"]["verificationStatus"] == "verified"
    assert embed.manifest["proof"] == embed.publication.manifest["proof"]
    assert deployment.verificationStatus == "verified"
    assert embedDeployment.verificationStatus == "verified"
    lineage = static.manifest["proof"]["lineages"][0]
    assert lineage["sourceRevisionReceiptId"] == source.receiptId
    assert lineage["promotionBuildArtifactReceiptId"] == localBuild.receiptId
    assert lineage["learningCreditIds"] == ["credit:learning-application-1"]
    assert lineage["learningCheckIds"] == ["check:learning-application-1"]
    for fieldName in (
        "sourceRevisionReceiptId",
        "promotionBuildArtifactReceiptId",
        "permissionReceiptId",
        "functionalCheckReceiptId",
        "operationalRunReceiptId",
    ):
        assert archive.receiptById(lineage[fieldName]) is not None
    resolved = archive.resolveLineage(deployment.deploymentReceipt.receiptId)
    assert deployment.deploymentReceipt in resolved
    assert source in resolved
    assert localBuild in resolved
    assert embedDeployment.deploymentReceipt in archive.resolveLineage(
        embedDeployment.deploymentReceipt.receiptId
    )


def testProofInputChangesCannotReuseVerifiedPublication(tmp_path: Path) -> None:
    sourcePath, archive, source, localBuild = _promotedFixture(tmp_path)
    shell = _shell(tmp_path)
    output = tmp_path / "static"
    baseline = buildStaticPublication(sourcePath, output, webBuildRoot=shell, proofArchive=archive)

    original = sourcePath.read_text(encoding="utf-8")
    sourcePath.write_text(original.replace("value = 41", "value = 40", 1), encoding="utf-8")
    with pytest.raises(PublicationBuildError, match="proof"):
        buildStaticPublication(sourcePath, output, webBuildRoot=shell, proofArchive=archive)
    sourcePath.write_text(original, encoding="utf-8")

    evidenceChanged = original.replace(
        "credit:learning-application-1",
        "credit:learning-application-2",
        1,
    )
    sourcePath.write_text(evidenceChanged, encoding="utf-8")
    with pytest.raises((PublicationBuildError, ValueError), match="proof|lineage"):
        buildStaticPublication(sourcePath, output, webBuildRoot=shell, proofArchive=archive)
    sourcePath.write_text(original, encoding="utf-8")

    permissionRun = _appendOperationalVariant(
        archive,
        source,
        localBuild,
        creditIds=["credit:learning-application-1"],
        permissionSeed="permission-b",
        artifactSeed="artifact-a",
        timestamp="2026-08-10T00:03:00+00:00",
    )
    permissionChanged = buildStaticPublication(sourcePath, output, webBuildRoot=shell, proofArchive=archive)
    assert permissionChanged.reused is False
    assert permissionChanged.bundleHash != baseline.bundleHash
    assert permissionChanged.manifest["proof"]["lineages"][0]["permissionReceiptId"] == permissionRun.permissionReceiptId

    artifactRun = _appendOperationalVariant(
        archive,
        source,
        localBuild,
        creditIds=["credit:learning-application-1"],
        permissionSeed="permission-b",
        artifactSeed="artifact-b",
        timestamp="2026-08-10T00:04:00+00:00",
    )
    artifactChanged = buildStaticPublication(sourcePath, output, webBuildRoot=shell, proofArchive=archive)
    assert artifactChanged.reused is False
    assert artifactChanged.bundleHash != permissionChanged.bundleHash
    assert artifactChanged.manifest["proof"]["lineages"][0]["artifactHashes"] == artifactRun.artifactHashes

    (shell / "_app/app.js").write_text("window.proofLineageFixture = false;", encoding="utf-8")
    artifactBytesChanged = buildStaticPublication(sourcePath, output, webBuildRoot=shell, proofArchive=archive)
    assert artifactBytesChanged.reused is False
    assert artifactBytesChanged.bundleHash != artifactChanged.bundleHash


def testGeneralPublicationStaysUnverifiedAndDanglingPublicationBuildCannotDeploy(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "general-workspace"
    workspace.mkdir()
    general = CodaroDocument(
        id="general-publication",
        title="일반 문서",
        blocks=[BlockConfig(id="entry", type="code", content="print('general')")],
        metadata=DocumentMetadata(sourceFormat="percent"),
        app=AppConfig(title="일반 문서", entryBlockIds=["entry"]),
    )
    generalPath = workspace / "general.py"
    generalPath.write_text(writePercentDocument(general), encoding="utf-8")
    generalBuild = buildStaticPublication(generalPath, tmp_path / "general", webBuildRoot=shell)
    generalArchive = ProofArchive(tmp_path / "general-proof.sqlite3")
    generalDeployment = deployPublication(
        tmp_path / "general",
        FolderDeploymentAdapter(tmp_path / "general-deployed"),
        proofArchive=generalArchive,
        verifiedAt=NOW,
    )
    assert generalBuild.manifest["proof"]["verificationStatus"] == "unverified"
    assert generalBuild.manifest["proof"]["lineages"] == []
    assert generalDeployment.verificationStatus == "unverified"

    sourcePath, completeArchive, _sourceReceipt, _localBuild = _promotedFixture(tmp_path / "promoted")
    publication = buildStaticPublication(
        sourcePath,
        tmp_path / "promoted-publication",
        webBuildRoot=shell,
        proofArchive=completeArchive,
    )
    incompleteArchive = ProofArchive(tmp_path / "incomplete.sqlite3")
    receipts = [
        receipt.model_dump(mode="json")
        for receipt in completeArchive.receipts()
        if not (
            isinstance(receipt, BuildArtifact)
            and receipt.target == "browser"
            and receipt.buildArtifactHash == publication.bundleHash
        )
    ]
    incompleteArchive.mergeArchive({
        "archiveKind": "codaro.proof-archive",
        "schemaVersion": 1,
        "receipts": receipts,
    })
    danglingTarget = tmp_path / "dangling-deployed"
    with pytest.raises(DeploymentError, match="build artifact"):
        deployPublication(
            tmp_path / "promoted-publication",
            FolderDeploymentAdapter(danglingTarget),
            proofArchive=incompleteArchive,
            verifiedAt=NOW,
        )
    assert not (danglingTarget / "active.json").exists()
