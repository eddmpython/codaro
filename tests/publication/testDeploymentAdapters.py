from __future__ import annotations

import base64
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile

import pytest

from codaro.document import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata
from codaro.document.percentFormat import writePercentDocument
from codaro.proof import ProofArchive
from codaro.publication import buildStaticPublication, verifyPublication
from codaro.publication.adapters import (
    DeploymentAdapterDefinition,
    DeploymentError,
    FolderDeploymentAdapter,
    ProviderFilesystemAdapter,
    SelfHostDeploymentAdapter,
    ZipDeploymentAdapter,
    deployPublication,
    redactDeploymentDiagnostic,
)


NOW = "2026-08-10T00:00:00+00:00"
LATER = "2026-08-10T00:01:00+00:00"
EVEN_LATER = "2026-08-10T00:02:00+00:00"


def _hash(payload: bytes) -> str:
    return "sha256-" + hashlib.sha256(payload).hexdigest()


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
    (shell / "vendor/pyproc/src").mkdir(parents=True)
    (shell / "vendor/pyodide").mkdir(parents=True)
    (shell / "_app/app.js").write_text("window.fixture = true", encoding="utf-8")
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
            "pyodide.js",
            "pyodide.mjs",
            "pyodide.asm.mjs",
            "pyodide.asm.wasm",
            "pyodide-lock.json",
            "python_stdlib.zip",
        ],
    )
    return shell


def _source(root: Path, value: int) -> Path:
    document = CodaroDocument(
        id="deployment-adapter-fixture",
        title="배포 adapter fixture",
        blocks=[BlockConfig(id="entry", type="code", content=f"result = {value}\nprint(result)")],
        metadata=DocumentMetadata(sourceFormat="percent"),
        app=AppConfig(title="배포 adapter fixture", entryBlockIds=["entry"]),
    )
    path = root / "app.py"
    path.write_text(writePercentDocument(document), encoding="utf-8")
    return path


def testFolderAndSelfHostDeployVerifiedBundlesAndWriteLinkedProof(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    source = _source(workspace, 1)
    publicationRoot = tmp_path / "publication"
    firstBuild = buildStaticPublication(source, publicationRoot, webBuildRoot=shell)
    archive = ProofArchive(tmp_path / "proof.sqlite3")
    folder = FolderDeploymentAdapter(tmp_path / "folder")

    first = deployPublication(publicationRoot, folder, proofArchive=archive, verifiedAt=NOW)

    assert first.target == "folder"
    assert first.deploymentReceipt.deploymentArtifactHash == first.artifactHash
    assert verifyPublication(tmp_path / "folder").bundleHash == firstBuild.bundleHash
    assert archive.summary() == {"receipts": 3, "conflicts": 0}
    assert [receipt.kind for receipt in archive.receipts()] == ["buildArtifact", "deployment", "sourceRevision"]

    _source(workspace, 2)
    secondBuild = buildStaticPublication(source, publicationRoot, webBuildRoot=shell)
    second = deployPublication(publicationRoot, folder, proofArchive=archive, verifiedAt=LATER)
    assert second.previousVersionId == first.versionId
    assert verifyPublication(tmp_path / "folder").bundleHash == secondBuild.bundleHash

    rollback = folder.rollback(first.versionId)
    assert rollback.available is True
    assert verifyPublication(tmp_path / "folder").bundleHash == firstBuild.bundleHash

    selfHost = deployPublication(
        publicationRoot,
        SelfHostDeploymentAdapter(tmp_path / "self-host"),
        verifiedAt=LATER,
    )
    assert selfHost.target == "self-host"
    assert verifyPublication(tmp_path / "self-host").bundleHash == secondBuild.bundleHash


def testZipDeploymentIsByteReproducibleAndContainsOnlyVerifiedSnapshot(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    source = _source(workspace, 41)
    publicationRoot = tmp_path / "publication"
    built = buildStaticPublication(source, publicationRoot, webBuildRoot=shell)

    first = deployPublication(publicationRoot, ZipDeploymentAdapter(tmp_path / "first.zip"), verifiedAt=NOW)
    second = deployPublication(publicationRoot, ZipDeploymentAdapter(tmp_path / "second.zip"), verifiedAt=LATER)

    assert first.artifactHash == second.artifactHash
    assert (tmp_path / "first.zip").read_bytes() == (tmp_path / "second.zip").read_bytes()
    assert first.deploymentReceipt.target == "zip"
    with ZipFile(tmp_path / "first.zip") as archive:
        names = archive.namelist()
        assert names == sorted(names)
        assert "active.json" in names
        assert f"bundles/{built.bundleHash.removeprefix('sha256-')}/publication.json" in names


def testProviderRequiresCredentialAndNeverLeaksItsValue(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    source = _source(workspace, 1)
    publicationRoot = tmp_path / "publication"
    buildStaticPublication(source, publicationRoot, webBuildRoot=shell)
    archive = ProofArchive(tmp_path / "proof.sqlite3")
    provider = ProviderFilesystemAdapter(
        tmp_path / "remote",
        credentialRefs=("CODARO_DEPLOY_TOKEN",),
        environment={},
    )

    with pytest.raises(DeploymentError, match="CODARO_DEPLOY_TOKEN"):
        deployPublication(publicationRoot, provider, proofArchive=archive, verifiedAt=NOW)

    assert archive.summary() == {"receipts": 0, "conflicts": 0}
    assert not (tmp_path / "remote/active.json").exists()
    assert redactDeploymentDiagnostic("request token=secret-value failed", {"token": "secret-value"}) == (
        "request token=[REDACTED] failed"
    )

    folder = deployPublication(publicationRoot, FolderDeploymentAdapter(tmp_path / "folder"), verifiedAt=NOW)
    zipped = deployPublication(publicationRoot, ZipDeploymentAdapter(tmp_path / "site.zip"), verifiedAt=NOW)
    selfHosted = deployPublication(publicationRoot, SelfHostDeploymentAdapter(tmp_path / "host"), verifiedAt=NOW)
    assert {folder.target, zipped.target, selfHosted.target} == {"folder", "zip", "self-host"}


def testCorruptProviderUploadCannotMovePointerOrWriteProof(tmp_path: Path) -> None:
    class CorruptingProvider(ProviderFilesystemAdapter):
        def upload(self, prepared):
            uploaded = super().upload(prepared)
            target = next(item for item in prepared.source.files if item.relativePath.endswith("publication.json"))
            (prepared.destination / Path(*target.relativePath.split("/"))).write_bytes(b"corrupt")
            return uploaded

    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    source = _source(workspace, 1)
    publicationRoot = tmp_path / "publication"
    firstBuild = buildStaticPublication(source, publicationRoot, webBuildRoot=shell)
    remote = tmp_path / "remote"
    archive = ProofArchive(tmp_path / "proof.sqlite3")
    healthy = ProviderFilesystemAdapter(
        remote,
        credentialRefs=("CODARO_DEPLOY_TOKEN",),
        environment={"CODARO_DEPLOY_TOKEN": "secret-value"},
    )
    first = deployPublication(publicationRoot, healthy, proofArchive=archive, verifiedAt=NOW)
    assert first.target == "provider"
    assert verifyPublication(remote).bundleHash == firstBuild.bundleHash
    countBefore = archive.summary()

    _source(workspace, 2)
    buildStaticPublication(source, publicationRoot, webBuildRoot=shell)
    corrupting = CorruptingProvider(
        remote,
        credentialRefs=("CODARO_DEPLOY_TOKEN",),
        environment={"CODARO_DEPLOY_TOKEN": "secret-value"},
    )
    with pytest.raises(DeploymentError, match="probe"):
        deployPublication(publicationRoot, corrupting, proofArchive=archive, verifiedAt=LATER)

    assert verifyPublication(remote).bundleHash == firstBuild.bundleHash
    assert archive.summary() == countBefore

    second = deployPublication(publicationRoot, healthy, proofArchive=archive, verifiedAt=EVEN_LATER)
    assert second.previousVersionId == first.versionId
    assert verifyPublication(remote).bundleHash != firstBuild.bundleHash
    rollback = healthy.rollback(first.versionId)
    assert rollback.available is True
    assert verifyPublication(remote).bundleHash == firstBuild.bundleHash


def testAdapterDefinitionIsClosedAndCredentialRefsAreCanonical() -> None:
    definition = DeploymentAdapterDefinition(
        adapterId="example.provider",
        target="provider",
        credentialRefs=("API_TOKEN",),
    )
    assert definition.schemaVersion == 1
    with pytest.raises(ValueError):
        DeploymentAdapterDefinition(
            adapterId="example.provider",
            target="provider",
            credentialRefs=("TOKEN", "TOKEN"),
        )
    with pytest.raises(ValueError):
        DeploymentAdapterDefinition.model_validate({
            "adapterId": "example.provider",
            "target": "provider",
            "credentialRefs": (),
            "secret": "plain-text",
        })
