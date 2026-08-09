from __future__ import annotations

from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import UTC, datetime
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import tempfile
from typing import Literal, Protocol, runtime_checkable
import uuid
from zipfile import ZIP_DEFLATED, BadZipFile, ZipFile, ZipInfo

from pydantic import BaseModel, ConfigDict, Field, field_validator

from ...proof import (
    BuildArtifact,
    DeploymentReceipt,
    ProofArchive,
    SourceRevision,
    canonicalJson,
    contentDigest,
    sealProofReceipt,
)
from ..embedBuilder import verifyBlockEmbed
from ..serverBuilder import verifyServerPublication
from ..staticBuilder import PublicationBuildError, verifyPublication


DeploymentTarget = Literal["folder", "zip", "self-host", "provider"]
_HASH_PREFIX = "sha256-"
_HEX_HASH = re.compile(r"^sha256-[0-9a-f]{64}$")
_CREDENTIAL_REF = re.compile(r"^[A-Z][A-Z0-9_]{1,63}$")
_POINTER_PATHS = frozenset({"active.json", "publication/active.json"})


class DeploymentError(RuntimeError):
    def __init__(self, message: str, *, diagnostics: Sequence[str] = ()) -> None:
        super().__init__(message)
        self.diagnostics = tuple(diagnostics)


class DeploymentAdapterDefinition(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True, strict=True)

    schemaVersion: Literal[1] = 1
    kind: Literal["codaro.deployment-adapter"] = "codaro.deployment-adapter"
    adapterId: str = Field(pattern=r"^[a-z][a-z0-9.-]{1,63}$")
    target: DeploymentTarget
    credentialRefs: tuple[str, ...] = ()

    @field_validator("credentialRefs", mode="before")
    @classmethod
    def _validCredentialRefs(cls, value: object) -> tuple[str, ...]:
        if isinstance(value, list):
            value = tuple(value)
        if not isinstance(value, tuple) or any(not isinstance(item, str) for item in value):
            raise ValueError("credentialRefs must be a list of environment variable names")
        if tuple(sorted(set(value))) != value or any(not _CREDENTIAL_REF.fullmatch(item) for item in value):
            raise ValueError("credentialRefs must be sorted unique environment variable names")
        return value


@dataclass(frozen=True, slots=True)
class DeploymentFile:
    relativePath: str
    sourcePath: Path
    contentHash: str
    byteCount: int
    pointer: bool = False


@dataclass(frozen=True, slots=True)
class VerifiedDeploymentSource:
    outputRoot: Path
    publicationTarget: Literal["browser", "server", "embed"]
    buildArtifactHash: str
    manifestHash: str
    manifest: Mapping[str, object]
    files: tuple[DeploymentFile, ...]
    snapshotHash: str


@dataclass(frozen=True, slots=True)
class PreparedDeployment:
    adapter: DeploymentAdapterDefinition
    source: VerifiedDeploymentSource
    destination: Path


@dataclass(frozen=True, slots=True)
class UploadedDeployment:
    prepared: PreparedDeployment
    versionId: str
    artifactPath: Path
    artifactHash: str


@dataclass(frozen=True, slots=True)
class DeploymentProbe:
    available: bool
    versionId: str
    artifactHash: str
    manifestHash: str
    diagnostic: str = ""


@dataclass(frozen=True, slots=True)
class DeploymentOutcome:
    adapterId: str
    target: DeploymentTarget
    versionId: str
    previousVersionId: str | None
    artifactPath: Path
    artifactHash: str
    manifestHash: str
    deploymentReceipt: DeploymentReceipt


@runtime_checkable
class DeploymentAdapter(Protocol):
    definition: DeploymentAdapterDefinition

    def prepare(self, publicationRoot: str | Path) -> PreparedDeployment: ...

    def upload(self, prepared: PreparedDeployment) -> UploadedDeployment: ...

    def probe(self, uploaded: UploadedDeployment) -> DeploymentProbe: ...

    def activate(self, uploaded: UploadedDeployment) -> str | None: ...

    def rollback(self, versionId: str) -> DeploymentProbe: ...


class FolderDeploymentAdapter:
    def __init__(
        self,
        destination: str | Path,
        *,
        target: Literal["folder", "self-host"] = "folder",
    ) -> None:
        adapterId = "codaro.folder" if target == "folder" else "codaro.self-host"
        self.definition = DeploymentAdapterDefinition(adapterId=adapterId, target=target)
        self._destination = Path(destination).expanduser().resolve()

    def prepare(self, publicationRoot: str | Path) -> PreparedDeployment:
        source = verifyDeploymentSource(publicationRoot)
        if (
            self._destination == source.outputRoot
            or self._destination.is_relative_to(source.outputRoot)
            or source.outputRoot.is_relative_to(self._destination)
        ):
            raise DeploymentError("배포 대상은 원본 publication 밖에 있어야 합니다.")
        return PreparedDeployment(adapter=self.definition, source=source, destination=self._destination)

    def upload(self, prepared: PreparedDeployment) -> UploadedDeployment:
        self._requirePrepared(prepared)
        prepared.destination.mkdir(parents=True, exist_ok=True)
        for item in prepared.source.files:
            if item.pointer:
                continue
            _copyVerifiedFile(item, prepared.destination / _relativePath(item.relativePath))
        return UploadedDeployment(
            prepared=prepared,
            versionId=prepared.source.snapshotHash,
            artifactPath=prepared.destination,
            artifactHash=prepared.source.snapshotHash,
        )

    def probe(self, uploaded: UploadedDeployment) -> DeploymentProbe:
        self._requirePrepared(uploaded.prepared)
        try:
            _verifyUploadedFiles(uploaded.prepared.source, uploaded.prepared.destination, includePointers=False)
        except DeploymentError as error:
            return DeploymentProbe(
                available=False,
                versionId=uploaded.versionId,
                artifactHash="",
                manifestHash="",
                diagnostic=str(error),
            )
        return DeploymentProbe(
            available=True,
            versionId=uploaded.versionId,
            artifactHash=uploaded.artifactHash,
            manifestHash=uploaded.prepared.source.manifestHash,
        )

    def activate(self, uploaded: UploadedDeployment) -> str | None:
        probe = self.probe(uploaded)
        _requireMatchingProbe(uploaded, probe)
        statePath = uploaded.prepared.destination / ".codaro-deployment.json"
        state = _readDeploymentState(statePath)
        previous = state.get("activeVersionId") if isinstance(state.get("activeVersionId"), str) else None
        pointers = _pointerPayloads(uploaded.prepared.source)
        previousPointers = _captureFiles(uploaded.prepared.destination, pointers)
        previousState = statePath.read_bytes() if statePath.is_file() else None
        versions = state.get("versions") if isinstance(state.get("versions"), dict) else {}
        versions[uploaded.versionId] = _stateVersion(uploaded, pointers)
        try:
            _writePointers(uploaded.prepared.destination, pointers)
            _verifyActivatedPublication(uploaded.prepared.destination, uploaded.prepared.source)
            _writeDeploymentState(statePath, activeVersionId=uploaded.versionId, versions=versions)
        except BaseException:
            _restoreFiles(uploaded.prepared.destination, previousPointers)
            _restoreFile(statePath, previousState)
            raise
        return previous

    def rollback(self, versionId: str) -> DeploymentProbe:
        statePath = self._destination / ".codaro-deployment.json"
        state = _readDeploymentState(statePath)
        versions = state.get("versions") if isinstance(state.get("versions"), dict) else {}
        rawVersion = versions.get(versionId)
        if not isinstance(rawVersion, dict):
            raise DeploymentError("rollback 대상 version이 없습니다.")
        pointers = rawVersion.get("pointers")
        if not isinstance(pointers, dict) or not pointers:
            raise DeploymentError("rollback pointer 기록이 손상됐습니다.")
        encodedPointers: dict[str, bytes] = {}
        for relativePath, payload in pointers.items():
            if not isinstance(payload, str):
                raise DeploymentError("rollback pointer payload가 손상됐습니다.")
            encodedPointers[relativePath] = payload.encode("utf-8")
        previousPointers = _captureFiles(self._destination, encodedPointers)
        previousState = statePath.read_bytes()
        try:
            _writePointers(self._destination, encodedPointers)
            _verifyDeploymentHashes(
                self._destination,
                str(rawVersion.get("publicationTarget") or ""),
                str(rawVersion.get("buildArtifactHash") or ""),
                str(rawVersion.get("manifestHash") or ""),
            )
            _writeDeploymentState(statePath, activeVersionId=versionId, versions=versions)
        except BaseException:
            _restoreFiles(self._destination, previousPointers)
            _restoreFile(statePath, previousState)
            raise
        return DeploymentProbe(
            available=True,
            versionId=versionId,
            artifactHash=str(rawVersion.get("artifactHash") or ""),
            manifestHash=str(rawVersion.get("manifestHash") or ""),
        )

    def _requirePrepared(self, prepared: PreparedDeployment) -> None:
        if prepared.adapter != self.definition or prepared.destination != self._destination:
            raise DeploymentError("다른 adapter가 만든 deployment를 사용할 수 없습니다.")


class SelfHostDeploymentAdapter(FolderDeploymentAdapter):
    def __init__(self, destination: str | Path) -> None:
        super().__init__(destination, target="self-host")


class ZipDeploymentAdapter:
    def __init__(self, destination: str | Path) -> None:
        destinationPath = Path(destination).expanduser().resolve()
        if destinationPath.suffix.lower() != ".zip":
            raise DeploymentError("zip 배포 대상은 .zip 파일이어야 합니다.")
        self.definition = DeploymentAdapterDefinition(adapterId="codaro.zip", target="zip")
        self._destination = destinationPath
        self._statePath = destinationPath.with_suffix(destinationPath.suffix + ".codaro-deployment.json")
        self._versionsRoot = destinationPath.parent / f".{destinationPath.name}.versions"

    def prepare(self, publicationRoot: str | Path) -> PreparedDeployment:
        source = verifyDeploymentSource(publicationRoot)
        if self._destination.is_relative_to(source.outputRoot):
            raise DeploymentError("zip 배포 대상은 원본 publication 밖에 있어야 합니다.")
        return PreparedDeployment(adapter=self.definition, source=source, destination=self._destination)

    def upload(self, prepared: PreparedDeployment) -> UploadedDeployment:
        self._requirePrepared(prepared)
        self._versionsRoot.mkdir(parents=True, exist_ok=True)
        descriptor, temporaryName = tempfile.mkstemp(prefix=".codaro-zip-", suffix=".tmp", dir=self._versionsRoot)
        os.close(descriptor)
        temporary = Path(temporaryName).resolve()
        try:
            with ZipFile(temporary, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
                for item in prepared.source.files:
                    payload = _readVerifiedSource(item)
                    info = ZipInfo(item.relativePath, date_time=(1980, 1, 1, 0, 0, 0))
                    info.compress_type = ZIP_DEFLATED
                    info.external_attr = 0o100644 << 16
                    info.create_system = 3
                    archive.writestr(info, payload)
            artifactHash = _fileHash(temporary)
            finalPath = self._versionsRoot / f"{artifactHash.removeprefix(_HASH_PREFIX)}.zip"
            if finalPath.is_file():
                if _fileHash(finalPath) != artifactHash:
                    raise DeploymentError("기존 immutable zip이 손상됐습니다.")
                temporary.unlink()
            else:
                os.replace(temporary, finalPath)
            return UploadedDeployment(
                prepared=prepared,
                versionId=artifactHash,
                artifactPath=finalPath,
                artifactHash=artifactHash,
            )
        finally:
            if temporary.exists():
                temporary.unlink()

    def probe(self, uploaded: UploadedDeployment) -> DeploymentProbe:
        self._requirePrepared(uploaded.prepared)
        try:
            _verifyZip(uploaded.artifactPath, uploaded.prepared.source)
            actualHash = _fileHash(uploaded.artifactPath)
        except DeploymentError as error:
            return DeploymentProbe(False, uploaded.versionId, "", "", str(error))
        return DeploymentProbe(
            available=actualHash == uploaded.artifactHash,
            versionId=uploaded.versionId,
            artifactHash=actualHash,
            manifestHash=uploaded.prepared.source.manifestHash,
            diagnostic="" if actualHash == uploaded.artifactHash else "zip artifact hash가 일치하지 않습니다.",
        )

    def activate(self, uploaded: UploadedDeployment) -> str | None:
        probe = self.probe(uploaded)
        _requireMatchingProbe(uploaded, probe)
        state = _readDeploymentState(self._statePath)
        previous = state.get("activeVersionId") if isinstance(state.get("activeVersionId"), str) else None
        previousArtifact = self._destination.read_bytes() if self._destination.is_file() else None
        previousState = self._statePath.read_bytes() if self._statePath.is_file() else None
        versions = state.get("versions") if isinstance(state.get("versions"), dict) else {}
        versions[uploaded.versionId] = {
            "artifactHash": uploaded.artifactHash,
            "manifestHash": uploaded.prepared.source.manifestHash,
            "path": uploaded.artifactPath.name,
        }
        try:
            _copyFileAtomically(uploaded.artifactPath, self._destination)
            if _fileHash(self._destination) != uploaded.artifactHash:
                raise DeploymentError("활성 zip hash가 일치하지 않습니다.")
            _writeDeploymentState(self._statePath, activeVersionId=uploaded.versionId, versions=versions)
        except BaseException:
            _restoreFile(self._destination, previousArtifact)
            _restoreFile(self._statePath, previousState)
            raise
        return previous

    def rollback(self, versionId: str) -> DeploymentProbe:
        state = _readDeploymentState(self._statePath)
        versions = state.get("versions") if isinstance(state.get("versions"), dict) else {}
        rawVersion = versions.get(versionId)
        if not isinstance(rawVersion, dict):
            raise DeploymentError("rollback 대상 zip version이 없습니다.")
        path = self._versionsRoot / str(rawVersion.get("path") or "")
        artifactHash = str(rawVersion.get("artifactHash") or "")
        if not path.is_file() or _fileHash(path) != artifactHash:
            raise DeploymentError("rollback zip artifact가 없거나 손상됐습니다.")
        previousArtifact = self._destination.read_bytes() if self._destination.is_file() else None
        previousState = self._statePath.read_bytes()
        try:
            _copyFileAtomically(path, self._destination)
            if _fileHash(self._destination) != artifactHash:
                raise DeploymentError("rollback zip hash가 일치하지 않습니다.")
            _writeDeploymentState(self._statePath, activeVersionId=versionId, versions=versions)
        except BaseException:
            _restoreFile(self._destination, previousArtifact)
            _restoreFile(self._statePath, previousState)
            raise
        return DeploymentProbe(True, versionId, artifactHash, str(rawVersion.get("manifestHash") or ""))

    def _requirePrepared(self, prepared: PreparedDeployment) -> None:
        if prepared.adapter != self.definition or prepared.destination != self._destination:
            raise DeploymentError("다른 adapter가 만든 deployment를 사용할 수 없습니다.")


class ProviderFilesystemAdapter(FolderDeploymentAdapter):
    """Provider adapter contract를 검증하는 로컬 원격 저장소 구현이다.

    실제 provider SDK는 이 클래스가 아니라 DeploymentAdapter protocol만 구현한다.
    credential 값은 adapter 경계에서만 읽고 state나 diagnostic에 저장하지 않는다.
    """

    def __init__(
        self,
        destination: str | Path,
        *,
        credentialRefs: Sequence[str],
        environment: Mapping[str, str] | None = None,
    ) -> None:
        refs = tuple(sorted(set(credentialRefs)))
        self.definition = DeploymentAdapterDefinition(
            adapterId="codaro.provider-filesystem",
            target="provider",
            credentialRefs=refs,
        )
        self._destination = Path(destination).expanduser().resolve()
        self._environment = environment if environment is not None else os.environ

    def upload(self, prepared: PreparedDeployment) -> UploadedDeployment:
        _resolveCredentials(self.definition.credentialRefs, self._environment)
        return super().upload(prepared)


def verifyDeploymentSource(publicationRoot: str | Path) -> VerifiedDeploymentSource:
    output = Path(publicationRoot).expanduser().resolve()
    try:
        active = _readJsonObject(output / "active.json", "publication active pointer")
        target = active.get("target")
        if target == "server":
            verified = verifyServerPublication(output)
            publicationTarget: Literal["browser", "server", "embed"] = "server"
            buildHash = verified.bundleHash
            manifest = dict(verified.manifest)
        elif target == "embed":
            embed = verifyBlockEmbed(output)
            publicationTarget = "embed"
            buildHash = embed.embedHash
            manifest = dict(embed.manifest)
        else:
            verified = verifyPublication(output)
            publicationTarget = "browser"
            buildHash = verified.bundleHash
            manifest = dict(verified.manifest)
    except (PublicationBuildError, OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise DeploymentError(f"검증된 publication을 읽을 수 없습니다: {error}") from error

    manifestHash = str(manifest.get("manifestHash") or "")
    if not _HEX_HASH.fullmatch(buildHash) or not _HEX_HASH.fullmatch(manifestHash):
        raise DeploymentError("publication hash 계약이 올바르지 않습니다.")
    paths = _deploymentPaths(output, publicationTarget, active)
    files = tuple(_deploymentFile(output, path) for path in sorted(paths))
    snapshotHash = contentDigest(canonicalJson([
        {"path": item.relativePath, "contentHash": item.contentHash, "bytes": item.byteCount}
        for item in files
    ]))
    return VerifiedDeploymentSource(
        outputRoot=output,
        publicationTarget=publicationTarget,
        buildArtifactHash=buildHash,
        manifestHash=manifestHash,
        manifest=manifest,
        files=files,
        snapshotHash=snapshotHash,
    )


def deployPublication(
    publicationRoot: str | Path,
    adapter: DeploymentAdapter,
    *,
    proofArchive: ProofArchive | None = None,
    verifiedAt: str | None = None,
) -> DeploymentOutcome:
    prepared = adapter.prepare(publicationRoot)
    uploaded = adapter.upload(prepared)
    probe = adapter.probe(uploaded)
    _requireMatchingProbe(uploaded, probe)
    previousVersion: str | None = None
    activated = False
    try:
        previousVersion = adapter.activate(uploaded)
        activated = True
        timestamp = verifiedAt or datetime.now(UTC).isoformat()
        sourceReceipt, buildReceipt, deploymentReceipt = _deploymentProof(
            prepared.source,
            probe,
            prepared.adapter.target,
            timestamp,
        )
        if proofArchive is not None:
            proofArchive.mergeArchive({
                "archiveKind": "codaro.proof-archive",
                "schemaVersion": 1,
                "receipts": [
                    sourceReceipt.model_dump(mode="json"),
                    buildReceipt.model_dump(mode="json"),
                    deploymentReceipt.model_dump(mode="json"),
                ],
            })
        return DeploymentOutcome(
            adapterId=prepared.adapter.adapterId,
            target=prepared.adapter.target,
            versionId=uploaded.versionId,
            previousVersionId=previousVersion,
            artifactPath=uploaded.artifactPath,
            artifactHash=probe.artifactHash,
            manifestHash=probe.manifestHash,
            deploymentReceipt=deploymentReceipt,
        )
    except BaseException:
        if activated and previousVersion is not None:
            adapter.rollback(previousVersion)
        raise


def redactDeploymentDiagnostic(message: str, credentials: Mapping[str, str]) -> str:
    redacted = message
    for value in sorted((value for value in credentials.values() if value), key=len, reverse=True):
        redacted = redacted.replace(value, "[REDACTED]")
    return redacted


def _deploymentProof(
    source: VerifiedDeploymentSource,
    probe: DeploymentProbe,
    target: DeploymentTarget,
    timestamp: str,
) -> tuple[SourceRevision, BuildArtifact, DeploymentReceipt]:
    manifest = source.manifest
    sourceHash = str(manifest.get("sourceRevisionHash") or source.buildArtifactHash)
    entryBlockIds = manifest.get("entryBlockIds")
    blockIds = sorted(set(str(item) for item in entryBlockIds)) if isinstance(entryBlockIds, list) else ["publication"]
    packages = manifest.get("packageAssets") if isinstance(manifest.get("packageAssets"), list) else []
    runtime = manifest.get("runtime") if isinstance(manifest.get("runtime"), dict) else {}
    documentPath = str(manifest.get("documentPath") or "publication.py")
    if documentPath.endswith(".json"):
        documentPath = "publication.py"
    sourceReceipt = sealProofReceipt({
        "kind": "sourceRevision",
        "sourceHash": sourceHash,
        "dependencyHash": contentDigest(canonicalJson(blockIds)),
        "packageSetHash": contentDigest(canonicalJson(packages)),
        "effectSetHash": contentDigest(canonicalJson(runtime)),
        "documentPath": documentPath,
        "blockIds": blockIds,
        "createdAt": timestamp,
    })
    assert isinstance(sourceReceipt, SourceRevision)
    buildReceipt = sealProofReceipt({
        "kind": "buildArtifact",
        "sourceRevisionId": sourceReceipt.receiptId,
        "sourceHash": sourceReceipt.sourceHash,
        "buildArtifactHash": source.buildArtifactHash,
        "manifestHash": source.manifestHash,
        "target": "server" if source.publicationTarget == "server" else "browser",
        "createdAt": timestamp,
    })
    assert isinstance(buildReceipt, BuildArtifact)
    deploymentReceipt = sealProofReceipt({
        "kind": "deployment",
        "sourceRevisionId": sourceReceipt.receiptId,
        "sourceHash": sourceReceipt.sourceHash,
        "buildArtifactReceiptId": buildReceipt.receiptId,
        "buildArtifactHash": buildReceipt.buildArtifactHash,
        "manifestHash": buildReceipt.manifestHash,
        "deploymentArtifactHash": probe.artifactHash,
        "target": target,
        "verifiedAt": timestamp,
    })
    assert isinstance(deploymentReceipt, DeploymentReceipt)
    return sourceReceipt, buildReceipt, deploymentReceipt


def _deploymentPaths(output: Path, target: str, active: Mapping[str, object]) -> set[str]:
    if target == "embed":
        embedPath = _safeRelative(active.get("embedPath"), "embedPath")
        publicationActive = _readJsonObject(output / "publication/active.json", "embed publication pointer")
        publicationPath = _safeRelative(publicationActive.get("bundlePath"), "publication.bundlePath")
        return {
            "active.json",
            "publication/active.json",
            *{
                path.relative_to(output).as_posix()
                for root in (output / _relativePath(embedPath), output / "publication" / _relativePath(publicationPath))
                for path in root.rglob("*")
                if path.is_file()
            },
        }
    bundlePath = _safeRelative(active.get("bundlePath"), "bundlePath")
    bundleRoot = output / _relativePath(bundlePath)
    return {
        "active.json",
        *{path.relative_to(output).as_posix() for path in bundleRoot.rglob("*") if path.is_file()},
    }


def _deploymentFile(root: Path, relativePath: str) -> DeploymentFile:
    path = (root / _relativePath(relativePath)).resolve()
    if not path.is_relative_to(root) or not path.is_file():
        raise DeploymentError(f"publication file이 없습니다: {relativePath}")
    payload = path.read_bytes()
    return DeploymentFile(
        relativePath=relativePath,
        sourcePath=path,
        contentHash=contentDigest(payload),
        byteCount=len(payload),
        pointer=relativePath in _POINTER_PATHS,
    )


def _copyVerifiedFile(item: DeploymentFile, destination: Path) -> None:
    payload = _readVerifiedSource(item)
    _writeAtomically(destination, payload)


def _readVerifiedSource(item: DeploymentFile) -> bytes:
    payload = item.sourcePath.read_bytes()
    if len(payload) != item.byteCount or contentDigest(payload) != item.contentHash:
        raise DeploymentError(f"prepare 이후 publication file이 바뀌었습니다: {item.relativePath}")
    return payload


def _verifyUploadedFiles(source: VerifiedDeploymentSource, destination: Path, *, includePointers: bool) -> None:
    for item in source.files:
        if item.pointer and not includePointers:
            continue
        target = destination / _relativePath(item.relativePath)
        if not target.is_file() or target.stat().st_size != item.byteCount or _fileHash(target) != item.contentHash:
            raise DeploymentError(f"업로드된 file hash가 일치하지 않습니다: {item.relativePath}")


def _verifyZip(path: Path, source: VerifiedDeploymentSource) -> None:
    try:
        with ZipFile(path, "r") as archive:
            names = archive.namelist()
            expected = [item.relativePath for item in source.files]
            if names != expected or len(names) != len(set(names)):
                raise DeploymentError("zip file 목록이 publication snapshot과 다릅니다.")
            for item in source.files:
                payload = archive.read(item.relativePath)
                if len(payload) != item.byteCount or contentDigest(payload) != item.contentHash:
                    raise DeploymentError(f"zip file hash가 일치하지 않습니다: {item.relativePath}")
    except (BadZipFile, KeyError, OSError) as error:
        raise DeploymentError(f"zip artifact를 검증할 수 없습니다: {error}") from error


def _pointerPayloads(source: VerifiedDeploymentSource) -> dict[str, bytes]:
    return {item.relativePath: _readVerifiedSource(item) for item in source.files if item.pointer}


def _stateVersion(uploaded: UploadedDeployment, pointers: Mapping[str, bytes]) -> dict[str, object]:
    return {
        "artifactHash": uploaded.artifactHash,
        "manifestHash": uploaded.prepared.source.manifestHash,
        "buildArtifactHash": uploaded.prepared.source.buildArtifactHash,
        "publicationTarget": uploaded.prepared.source.publicationTarget,
        "pointers": {key: value.decode("utf-8") for key, value in sorted(pointers.items())},
    }


def _readDeploymentState(path: Path) -> dict[str, object]:
    if not path.exists():
        return {"schemaVersion": 1, "activeVersionId": None, "versions": {}}
    state = _readJsonObject(path, "deployment state")
    if state.get("schemaVersion") != 1 or not isinstance(state.get("versions"), dict):
        raise DeploymentError("deployment state가 손상됐습니다.")
    return state


def _writeDeploymentState(path: Path, *, activeVersionId: str, versions: Mapping[str, object]) -> None:
    _writeAtomically(path, _canonicalBytes({
        "schemaVersion": 1,
        "activeVersionId": activeVersionId,
        "versions": dict(sorted(versions.items())),
    }))


def _verifyActivatedPublication(destination: Path, source: VerifiedDeploymentSource) -> None:
    _verifyDeploymentHashes(
        destination,
        source.publicationTarget,
        source.buildArtifactHash,
        source.manifestHash,
    )


def _verifyDeploymentHashes(
    destination: Path,
    publicationTarget: str,
    expectedBuildHash: str,
    expectedManifestHash: str,
) -> None:
    try:
        if publicationTarget == "server":
            verified = verifyServerPublication(destination)
            actualHash = verified.bundleHash
            actualManifestHash = verified.manifest["manifestHash"]
        elif publicationTarget == "embed":
            verifiedEmbed = verifyBlockEmbed(destination)
            actualHash = verifiedEmbed.embedHash
            actualManifestHash = verifiedEmbed.manifest["manifestHash"]
        elif publicationTarget == "browser":
            verified = verifyPublication(destination)
            actualHash = verified.bundleHash
            actualManifestHash = verified.manifest["manifestHash"]
        else:
            raise DeploymentError("deployment publication target이 손상됐습니다.")
    except PublicationBuildError as error:
        raise DeploymentError(f"활성 deployment 검증에 실패했습니다: {error}") from error
    if actualHash != expectedBuildHash or actualManifestHash != expectedManifestHash:
        raise DeploymentError("활성 deployment가 준비한 publication과 다릅니다.")


def _requireMatchingProbe(uploaded: UploadedDeployment, probe: DeploymentProbe) -> None:
    if (
        not probe.available
        or probe.versionId != uploaded.versionId
        or probe.artifactHash != uploaded.artifactHash
        or probe.manifestHash != uploaded.prepared.source.manifestHash
    ):
        detail = f" {probe.diagnostic}" if probe.diagnostic else ""
        raise DeploymentError(f"배포 probe가 업로드 artifact를 검증하지 못했습니다.{detail}")


def _resolveCredentials(refs: Sequence[str], environment: Mapping[str, str]) -> dict[str, str]:
    missing = [name for name in refs if not environment.get(name)]
    if missing:
        raise DeploymentError("provider credential reference가 없습니다: " + ", ".join(missing))
    return {name: environment[name] for name in refs}


def _safeRelative(value: object, field: str) -> str:
    if not isinstance(value, str) or not value or "\\" in value or ":" in value:
        raise DeploymentError(f"{field}가 안전한 상대 경로가 아닙니다.")
    pure = PurePosixPath(value)
    if pure.is_absolute() or any(part in {"", ".", ".."} for part in pure.parts):
        raise DeploymentError(f"{field}가 안전한 상대 경로가 아닙니다.")
    return pure.as_posix()


def _relativePath(value: str) -> Path:
    return Path(*PurePosixPath(_safeRelative(value, "path")).parts)


def _readJsonObject(path: Path, label: str) -> dict[str, object]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise DeploymentError(f"{label}를 읽을 수 없습니다: {error}") from error
    if not isinstance(payload, dict):
        raise DeploymentError(f"{label}가 JSON object가 아닙니다.")
    return payload


def _canonicalBytes(payload: object) -> bytes:
    return canonicalJson(payload).encode("utf-8")


def _fileHash(path: Path) -> str:
    return contentDigest(path.read_bytes())


def _writeAtomically(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    temporary.write_bytes(payload)
    os.replace(temporary, path)


def _copyFileAtomically(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(f".{destination.name}.{uuid.uuid4().hex}.tmp")
    shutil.copyfile(source, temporary)
    os.replace(temporary, destination)


def _captureFiles(root: Path, paths: Mapping[str, bytes]) -> dict[str, bytes | None]:
    return {
        relativePath: (target.read_bytes() if target.is_file() else None)
        for relativePath in paths
        for target in (root / _relativePath(relativePath),)
    }


def _writePointers(root: Path, pointers: Mapping[str, bytes]) -> None:
    for relativePath in sorted(pointers, key=lambda value: (value.count("/"), value), reverse=True):
        _writeAtomically(root / _relativePath(relativePath), pointers[relativePath])


def _restoreFiles(root: Path, previous: Mapping[str, bytes | None]) -> None:
    for relativePath, payload in previous.items():
        _restoreFile(root / _relativePath(relativePath), payload)


def _restoreFile(path: Path, payload: bytes | None) -> None:
    if payload is None:
        if path.is_file():
            path.unlink()
        return
    _writeAtomically(path, payload)
