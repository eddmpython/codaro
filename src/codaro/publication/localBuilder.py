from __future__ import annotations

from dataclasses import dataclass
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import tempfile
from typing import Any, Mapping

from ..document.models import CodaroDocument
from ..document.percentFormat import writePercentDocument
from ..document.service import loadDocument
from ..generatedContracts import PublicationManifest
from ..proof import ProofArchive
from .compiler import CompilationReport, compileDocument
from .errors import PublicationBuildError
from .immutablePointer import activateImmutablePointer, rollbackImmutablePointer
from .proofLineage import (
    PublicationProofError,
    publicationProof,
    recordPublicationBuildArtifacts,
    validatePublicationProof,
)
from .serverBuilder import (
    _collectServerDataAssets,
    _copyServerShell,
    _requireServerShell,
    _resolveWebBuildRoot,
)


_HASH_PREFIX = "sha256-"
_SECRET_REF = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,127}$")
_LOCAL_API_ALLOWLIST = [
    "health",
    "bootstrap",
    "document.load",
    "kernel.session",
    "kernel.execute",
    "kernel.ui",
    "kernel.variables",
    "kernel.packages",
]


@dataclass(frozen=True, slots=True)
class LocalPublicationBuildResult:
    outputRoot: Path
    bundleRoot: Path
    activePointer: Path
    bundleHash: str
    manifest: PublicationManifest
    reused: bool


@dataclass(frozen=True, slots=True)
class LocalPublicationVerification:
    outputRoot: Path
    bundleRoot: Path
    bundleHash: str
    manifest: PublicationManifest
    fileCount: int
    totalBytes: int


def buildLocalPublication(
    sourcePath: str | Path,
    outputRoot: str | Path,
    *,
    packageLock: Mapping[str, Any] | None = None,
    webBuildRoot: str | Path | None = None,
    maxMemoryMb: int = 1024,
    maxExecutionSeconds: int = 600,
    maxChildProcesses: int = 4,
    proofArchive: ProofArchive | None = None,
) -> LocalPublicationBuildResult:
    source = Path(sourcePath).expanduser().resolve()
    output = Path(outputRoot).expanduser().resolve()
    if not source.is_file():
        raise PublicationBuildError(f"문서가 없습니다: {source}")
    if not 64 <= maxMemoryMb <= 8192:
        raise PublicationBuildError("local maxMemoryMb는 64에서 8192 사이여야 합니다.")
    if not 1 <= maxExecutionSeconds <= 3600:
        raise PublicationBuildError("local maxExecutionSeconds는 1에서 3600 사이여야 합니다.")
    if not 0 <= maxChildProcesses <= 32:
        raise PublicationBuildError("local maxChildProcesses는 0에서 32 사이여야 합니다.")

    sourceText = source.read_text(encoding="utf-8")
    document = loadDocument(str(source))
    if document.app.statePolicy == "shared":
        raise PublicationBuildError("shared state local publication은 지원하지 않습니다.")
    report = compileDocument(
        document,
        sourcePath=source,
        sourceText=sourceText,
        workspaceRoot=source.parent,
        packageLock=packageLock,
    )
    if report.runtimeTarget == "blocked":
        raise PublicationBuildError(
            f"local publication을 만들 수 없습니다. {_diagnosticSummary(report)}",
            diagnostics=[dict(item) for item in report.diagnostics],
        )
    unreproducible = {
        "ABSOLUTE_PATH_REQUIRES_LOCAL",
        "OUTSIDE_WORKSPACE_REQUIRES_LOCAL",
    }
    blockers = [dict(item) for item in report.diagnostics if item["code"] in unreproducible]
    if blockers:
        raise PublicationBuildError(
            "workspace 밖 filesystem 경로는 immutable local publication에 포함할 수 없습니다.",
            diagnostics=blockers,
        )
    try:
        proof = publicationProof(
            [result.unit for result in report.units],
            report.executionBlockIds,
            document.runtime.packages,
            proofArchive,
        )
    except PublicationProofError as exc:
        raise PublicationBuildError(f"local publication proof를 검증할 수 없습니다: {exc}") from exc

    effects = _localEffects(report)
    if "dynamic" in effects["networkOrigins"]:
        raise PublicationBuildError("동적 network 목적지는 local publication에서 허용하지 않습니다.")
    if "dynamic" in effects["secretRefs"]:
        raise PublicationBuildError("동적 secret 이름은 local publication에서 허용하지 않습니다.")
    if any(not _SECRET_REF.fullmatch(name) for name in effects["secretRefs"]):
        raise PublicationBuildError("local secret reference 이름이 안전하지 않습니다.")
    permissionScopes = _permissionScopes(effects)
    policyPayload = {
        "schemaVersion": 1,
        "compilerManifestHash": report.manifestHash,
        "sourceRevisionHash": report.sourceRevision.revisionHash,
        "executionProjectionHash": report.executionProjectionHash,
        "permissionScopes": permissionScopes,
        "effects": effects,
        "statePolicy": document.app.statePolicy,
        "pythonVersion": f"{sys.version_info.major}.{sys.version_info.minor}",
        "maxMemoryMb": maxMemoryMb,
        "maxExecutionSeconds": maxExecutionSeconds,
        "maxChildProcesses": maxChildProcesses,
        "apiAllowlist": _LOCAL_API_ALLOWLIST,
    }
    policyHash = _contentHash(_canonicalBytes(policyPayload))

    blockById = {block.id: block for block in document.blocks}
    publicationDocument = document.model_copy(
        update={"blocks": [blockById[blockId] for blockId in report.executionBlockIds]}
    )
    shellRoot = _resolveWebBuildRoot(webBuildRoot)
    _requireServerShell(shellRoot)
    output.mkdir(parents=True, exist_ok=True)
    bundlesRoot = output / "bundles"
    bundlesRoot.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix=".codaro-local-publication-", dir=bundlesRoot)).resolve()
    if staging.parent != bundlesRoot.resolve():
        raise PublicationBuildError("local publication 임시 경로가 output 경계를 벗어났습니다.")

    try:
        _copyServerShell(shellRoot, staging / "shell")
        _markLocalShell(staging / "shell/index.html")
        templateRoot = staging / "workspace-template"
        templateRoot.mkdir(parents=True)
        documentPath = "workspace-template/publication.py"
        (staging / documentPath).write_text(
            writePercentDocument(publicationDocument),
            encoding="utf-8",
            newline="\n",
        )
        dataAssets = _collectServerDataAssets(report, source.parent, templateRoot)
        packageAssets, requirements = _collectLocalPackages(
            document,
            source.parent,
            staging,
            packageLock or {},
        )
        requirementsPath = "requirements.lock"
        _writeCanonicalJson(staging / requirementsPath, {"schemaVersion": 1, "packages": requirements})
        files = _localFiles(staging, documentPath, dataAssets, packageAssets)
        unsignedManifest: dict[str, Any] = {
            "schemaVersion": 1,
            "target": "local",
            "compilerManifestHash": report.manifestHash,
            "sourceRevisionHash": report.sourceRevision.revisionHash,
            "entryBlockIds": list(report.entryBlockIds),
            "executionBlockIds": list(report.executionBlockIds),
            "executionProjectionHash": report.executionProjectionHash,
            "proof": proof,
            "documentPath": documentPath,
            "runtime": {
                "kind": "local",
                "pythonVersion": f"{sys.version_info.major}.{sys.version_info.minor}",
                "requirementsPath": requirementsPath,
                "permissionScopes": permissionScopes,
                "effects": effects,
                "secretRefs": effects["secretRefs"],
                "networkOrigins": effects["networkOrigins"],
                "statePolicy": document.app.statePolicy,
                "policyHash": policyHash,
                "maxMemoryMb": maxMemoryMb,
                "maxExecutionSeconds": maxExecutionSeconds,
                "maxChildProcesses": maxChildProcesses,
                "apiAllowlist": _LOCAL_API_ALLOWLIST,
            },
            "files": files,
            "dataAssets": dataAssets,
            "packageAssets": packageAssets,
        }
        manifestHash = _contentHash(_canonicalBytes(unsignedManifest))
        manifest: PublicationManifest = {**unsignedManifest, "manifestHash": manifestHash}  # type: ignore[typeddict-item]
        _writeCanonicalJson(staging / "publication.json", manifest)
        publicationFileHash = _fileHash(staging / "publication.json")
        bundleHash = _contentHash(_canonicalBytes({
            "manifestHash": manifestHash,
            "publicationFileHash": publicationFileHash,
        }))
        finalRoot = bundlesRoot / bundleHash.removeprefix(_HASH_PREFIX)
        reused = finalRoot.is_dir()
        if reused:
            _assertSameBundle(staging, finalRoot)
            _removeStaging(staging, bundlesRoot)
        else:
            os.replace(staging, finalRoot)
        _verifyLocalBundleRoot(finalRoot, bundleHash=bundleHash)
        try:
            recordPublicationBuildArtifacts(
                proof,
                proofArchive,
                buildArtifactHash=bundleHash,
                manifestHash=manifestHash,
                target="local",
            )
        except PublicationProofError as exc:
            raise PublicationBuildError(f"local publication build proof를 기록할 수 없습니다: {exc}") from exc
        activateImmutablePointer(output, _activePayload(output, finalRoot, bundleHash))
        verified = verifyLocalPublication(output)
        return LocalPublicationBuildResult(
            outputRoot=output,
            bundleRoot=verified.bundleRoot,
            activePointer=output / "active.json",
            bundleHash=verified.bundleHash,
            manifest=verified.manifest,
            reused=reused,
        )
    except BaseException:
        if staging.exists():
            _removeStaging(staging, bundlesRoot)
        raise


def verifyLocalPublication(outputRoot: str | Path) -> LocalPublicationVerification:
    output = Path(outputRoot).expanduser().resolve()
    active = _readJsonObject(output / "active.json", "local active pointer")
    if active.get("schemaVersion") != 1 or active.get("target") != "local":
        raise PublicationBuildError("지원하지 않는 local active pointer입니다.")
    bundlePath = _safeRelativePath(active.get("bundlePath"), "bundlePath")
    bundleRoot = (output / Path(*PurePosixPath(bundlePath).parts)).resolve()
    if not bundleRoot.is_relative_to(output) or not bundleRoot.is_dir():
        raise PublicationBuildError("active local bundle이 output 안의 디렉터리가 아닙니다.")
    bundleHash = str(active.get("bundleHash") or "")
    verified = _verifyLocalBundleRoot(bundleRoot, bundleHash=bundleHash)
    if active.get("publicationFileHash") != _fileHash(bundleRoot / "publication.json"):
        raise PublicationBuildError("local publication manifest 파일이 손상됐습니다.")
    return LocalPublicationVerification(
        outputRoot=output,
        bundleRoot=bundleRoot,
        bundleHash=bundleHash,
        manifest=verified[0],
        fileCount=verified[1],
        totalBytes=verified[2],
    )


def rollbackLocalPublication(outputRoot: str | Path, bundleHash: str) -> LocalPublicationVerification:
    output = Path(outputRoot).expanduser().resolve()

    def candidate(bundleRoot: Path, contentHash: str):
        verified = _verifyLocalBundleRoot(bundleRoot, bundleHash=contentHash)
        return _activePayload(output, bundleRoot, contentHash), LocalPublicationVerification(
            outputRoot=output,
            bundleRoot=bundleRoot,
            bundleHash=contentHash,
            manifest=verified[0],
            fileCount=verified[1],
            totalBytes=verified[2],
        )

    return rollbackImmutablePointer(
        output,
        target="local",
        contentHash=bundleHash,
        collection="bundles",
        candidate=candidate,
    )


def prepareLocalPackageEnvironment(verified: LocalPublicationVerification, runtimeRoot: Path) -> Path | None:
    if not verified.manifest["packageAssets"]:
        return None
    target = runtimeRoot / "site-packages"
    target.mkdir(parents=True)
    wheels = [
        str(_resolvedBundleFile(verified.bundleRoot, item["bundlePath"]))
        for item in verified.manifest["packageAssets"]
    ]
    uvExecutable = shutil.which("uv")
    if uvExecutable is None:
        raise PublicationBuildError("local package 실행에는 uv가 필요합니다.")
    completed = subprocess.run(
        [
            uvExecutable,
            "pip",
            "install",
            "--offline",
            "--no-cache",
            "--no-deps",
            "--target",
            str(target),
            *wheels,
        ],
        cwd=runtimeRoot,
        capture_output=True,
        text=True,
        timeout=300,
        check=False,
    )
    if completed.returncode != 0:
        detail = (completed.stderr or completed.stdout).strip()[-2000:]
        raise PublicationBuildError(f"local package offline 설치가 실패했습니다: {detail}")
    return target


def _verifyLocalBundleRoot(
    bundleRoot: Path,
    *,
    bundleHash: str,
) -> tuple[PublicationManifest, int, int]:
    if not bundleRoot.is_dir():
        raise PublicationBuildError("local bundle 디렉터리가 없습니다.")
    manifest = _readJsonObject(bundleRoot / "publication.json", "local publication manifest")
    runtime = manifest.get("runtime")
    if (
        manifest.get("schemaVersion") != 1
        or manifest.get("target") != "local"
        or not isinstance(runtime, dict)
        or runtime.get("kind") != "local"
    ):
        raise PublicationBuildError("지원하지 않는 local publication manifest입니다.")
    if runtime.get("apiAllowlist") != _LOCAL_API_ALLOWLIST:
        raise PublicationBuildError("local publication API allowlist가 일치하지 않습니다.")
    try:
        validatePublicationProof(
            manifest.get("proof"),
            executionBlockIds=manifest.get("executionBlockIds") if isinstance(manifest.get("executionBlockIds"), list) else [],
        )
    except PublicationProofError as exc:
        raise PublicationBuildError(f"local publication proof가 손상됐습니다: {exc}") from exc
    expectedPolicy = _contentHash(_canonicalBytes({
        "schemaVersion": 1,
        "compilerManifestHash": manifest.get("compilerManifestHash"),
        "sourceRevisionHash": manifest.get("sourceRevisionHash"),
        "executionProjectionHash": manifest.get("executionProjectionHash"),
        "permissionScopes": runtime.get("permissionScopes"),
        "effects": runtime.get("effects"),
        "statePolicy": runtime.get("statePolicy"),
        "pythonVersion": runtime.get("pythonVersion"),
        "maxMemoryMb": runtime.get("maxMemoryMb"),
        "maxExecutionSeconds": runtime.get("maxExecutionSeconds"),
        "maxChildProcesses": runtime.get("maxChildProcesses"),
        "apiAllowlist": runtime.get("apiAllowlist"),
    }))
    if runtime.get("policyHash") != expectedPolicy:
        raise PublicationBuildError("local publication permission policy hash가 일치하지 않습니다.")
    unsigned = dict(manifest)
    manifestHash = unsigned.pop("manifestHash", None)
    if manifestHash != _contentHash(_canonicalBytes(unsigned)):
        raise PublicationBuildError("local publication manifest hash가 일치하지 않습니다.")
    files = manifest.get("files")
    if not isinstance(files, list):
        raise PublicationBuildError("local publication files가 목록이 아닙니다.")
    listed: set[str] = set()
    totalBytes = 0
    for item in files:
        if not isinstance(item, dict):
            raise PublicationBuildError("local publication file 항목이 객체가 아닙니다.")
        relative = _safeRelativePath(item.get("path"), "file.path")
        if relative in listed or relative == "publication.json":
            raise PublicationBuildError(f"local publication file 경로가 중복되거나 예약됐습니다: {relative}")
        listed.add(relative)
        target = _resolvedBundleFile(bundleRoot, relative)
        data = target.read_bytes() if target.is_file() else b""
        if not target.is_file() or item.get("bytes") != len(data) or item.get("contentHash") != _contentHash(data):
            raise PublicationBuildError(f"local publication 파일이 손상됐습니다: {relative}")
        totalBytes += len(data)
    actual = {
        path.relative_to(bundleRoot).as_posix()
        for path in bundleRoot.rglob("*")
        if path.is_file() and path.name != "publication.json"
    }
    if actual != listed:
        raise PublicationBuildError("local publication manifest와 실제 파일 목록이 다릅니다.")
    _verifyExecutionProjection(manifest, bundleRoot)
    publicationFileHash = _fileHash(bundleRoot / "publication.json")
    calculatedBundleHash = _contentHash(_canonicalBytes({
        "manifestHash": manifestHash,
        "publicationFileHash": publicationFileHash,
    }))
    if bundleHash != calculatedBundleHash or bundleRoot.name != bundleHash.removeprefix(_HASH_PREFIX):
        raise PublicationBuildError("local bundle hash가 일치하지 않습니다.")
    return manifest, len(files) + 1, totalBytes + (bundleRoot / "publication.json").stat().st_size  # type: ignore[return-value]


def _verifyExecutionProjection(manifest: dict[str, Any], bundleRoot: Path) -> None:
    blockIds = manifest.get("executionBlockIds")
    projectionHash = manifest.get("executionProjectionHash")
    documentPath = _safeRelativePath(manifest.get("documentPath"), "documentPath")
    document = loadDocument(str(_resolvedBundleFile(bundleRoot, documentPath)))
    blocks = [block for block in document.blocks if block.type in {"code", "automation", "markdown"}]
    actualIds = [block.id for block in blocks]
    actualHash = _contentHash(_canonicalBytes([
        {
            "blockId": block.id,
            "type": block.type,
            "contentHash": _contentHash(block.content.encode("utf-8")),
        }
        for block in blocks
    ]))
    if not isinstance(blockIds, list) or actualIds != blockIds or actualHash != projectionHash:
        raise PublicationBuildError("local publication execution projection이 bundle 문서와 다릅니다.")


def _localEffects(report: CompilationReport) -> dict[str, Any]:
    effects: dict[str, Any] = {
        "filesystemRead": set(),
        "filesystemWrite": set(),
        "networkOrigins": set(),
        "process": False,
        "gui": False,
        "secretRefs": set(),
    }
    for result in report.units:
        unit = result.unit["effects"]
        for name in ("filesystemRead", "filesystemWrite", "networkOrigins", "secretRefs"):
            effects[name].update(str(item) for item in unit[name])
        effects["process"] = effects["process"] or bool(unit["process"])
        effects["gui"] = effects["gui"] or bool(unit["gui"])
    return {
        "filesystemRead": sorted(effects["filesystemRead"]),
        "filesystemWrite": sorted(effects["filesystemWrite"]),
        "networkOrigins": sorted(effects["networkOrigins"]),
        "process": effects["process"],
        "gui": effects["gui"],
        "secretRefs": sorted(effects["secretRefs"]),
    }


def _permissionScopes(effects: Mapping[str, Any]) -> list[str]:
    scopes: list[str] = []
    if effects["filesystemRead"]:
        scopes.append("filesystem.read")
    if effects["filesystemWrite"]:
        scopes.append("filesystem.write")
    if effects["networkOrigins"]:
        scopes.append("network")
    if effects["process"]:
        scopes.append("process.execute")
    if effects["gui"]:
        scopes.append("gui.display")
    if effects["secretRefs"]:
        scopes.append("secret.read")
    return scopes


def _collectLocalPackages(
    document: CodaroDocument,
    workspaceRoot: Path,
    staging: Path,
    packageLock: Mapping[str, Any],
) -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    normalizedLock = {_packageName(str(name)): value for name, value in packageLock.items()}
    assets: list[dict[str, str]] = []
    requirements: list[dict[str, str]] = []
    for requirement in sorted(set(document.runtime.packages), key=_packageName):
        name = _packageName(requirement)
        record = normalizedLock.get(name)
        if not isinstance(record, Mapping) or record.get("localSmoke") is not True:
            raise PublicationBuildError(f"local package에 검증된 lock과 localSmoke가 필요합니다: {name}")
        wheelValue = record.get("wheelPath")
        if not isinstance(wheelValue, str):
            raise PublicationBuildError(f"local package wheelPath가 필요합니다: {name}")
        wheelPath = Path(wheelValue).expanduser()
        source = wheelPath.resolve() if wheelPath.is_absolute() else (workspaceRoot / wheelPath).resolve()
        if not source.is_relative_to(workspaceRoot) or not source.is_file() or source.suffix != ".whl":
            raise PublicationBuildError(f"local package wheel이 workspace 안의 .whl 파일이 아닙니다: {name}")
        actualHash = _fileHash(source)
        if record.get("wheelHash") != actualHash:
            raise PublicationBuildError(f"local package wheel hash가 lock과 다릅니다: {name}")
        bundlePath = f"wheelhouse/{actualHash.removeprefix(_HASH_PREFIX)}/{source.name}"
        destination = staging / Path(*PurePosixPath(bundlePath).parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        assets.append({"name": name, "bundlePath": bundlePath, "contentHash": actualHash})
        requirements.append({
            "name": name,
            "requirement": requirement,
            "wheelHash": actualHash,
            "wheelPath": bundlePath,
        })
    return assets, requirements


def _localFiles(
    staging: Path,
    documentPath: str,
    dataAssets: list[dict[str, str]],
    packageAssets: list[dict[str, str]],
) -> list[dict[str, object]]:
    dataPaths = {item["bundlePath"] for item in dataAssets}
    packagePaths = {item["bundlePath"] for item in packageAssets}
    files: list[dict[str, object]] = []
    for path in sorted(item for item in staging.rglob("*") if item.is_file()):
        relative = path.relative_to(staging).as_posix()
        if relative == "publication.json":
            continue
        role = "shell"
        if relative == documentPath:
            role = "document"
        elif relative in dataPaths:
            role = "data"
        elif relative in packagePaths:
            role = "package"
        elif relative == "requirements.lock":
            role = "runtime"
        files.append({
            "path": relative,
            "contentHash": _fileHash(path),
            "bytes": path.stat().st_size,
            "role": role,
        })
    return files


def _markLocalShell(indexPath: Path) -> None:
    source = indexPath.read_text(encoding="utf-8")
    source = source.replace("codaro-server-publication", "codaro-local-publication")
    if "codaro-local-publication" not in source:
        raise PublicationBuildError("local publication shell metadata를 만들 수 없습니다.")
    indexPath.write_text(source, encoding="utf-8", newline="\n")


def _activePayload(output: Path, bundleRoot: Path, bundleHash: str) -> dict[str, object]:
    return {
        "schemaVersion": 1,
        "target": "local",
        "bundleHash": bundleHash,
        "bundlePath": bundleRoot.relative_to(output).as_posix(),
        "publicationFileHash": _fileHash(bundleRoot / "publication.json"),
    }


def _diagnosticSummary(report: CompilationReport) -> str:
    if not report.diagnostics:
        return f"판정 target: {report.runtimeTarget}"
    item = report.diagnostics[0]
    span = item["sourceSpan"]
    return f"{item['code']} {span['path']}:{span['startLine']} {item['message']}"


def _packageName(requirement: str) -> str:
    return re.split(r"[<>=!~;\s\[]", requirement.strip().lower(), maxsplit=1)[0].replace("_", "-")


def _safeRelativePath(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value or "\\" in value:
        raise PublicationBuildError(f"{field}가 안전한 상대 경로가 아닙니다.")
    pure = PurePosixPath(value)
    if pure.is_absolute() or ".." in pure.parts or ":" in pure.parts[0]:
        raise PublicationBuildError(f"{field}가 안전한 상대 경로가 아닙니다: {value}")
    return pure.as_posix()


def _resolvedBundleFile(root: Path, relative: str) -> Path:
    target = (root / Path(*PurePosixPath(relative).parts)).resolve()
    if not target.is_relative_to(root):
        raise PublicationBuildError(f"local bundle 경로가 경계를 벗어났습니다: {relative}")
    return target


def _canonicalBytes(payload: Any) -> bytes:
    return json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _contentHash(payload: bytes) -> str:
    return _HASH_PREFIX + hashlib.sha256(payload).hexdigest()


def _fileHash(path: Path) -> str:
    if not path.is_file():
        raise PublicationBuildError(f"local publication 파일이 없습니다: {path}")
    return _contentHash(path.read_bytes())


def _readJsonObject(path: Path, label: str) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise PublicationBuildError(f"{label}를 읽을 수 없습니다: {error}") from error
    if not isinstance(payload, dict):
        raise PublicationBuildError(f"{label}가 JSON object가 아닙니다.")
    return payload


def _writeCanonicalJson(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(_canonicalBytes(payload))


def _assertSameBundle(expected: Path, existing: Path) -> None:
    expectedFiles = {
        path.relative_to(expected).as_posix(): _fileHash(path)
        for path in expected.rglob("*")
        if path.is_file()
    }
    existingFiles = {
        path.relative_to(existing).as_posix(): _fileHash(path)
        for path in existing.rglob("*")
        if path.is_file()
    }
    if expectedFiles != existingFiles:
        raise PublicationBuildError(f"기존 immutable local bundle이 손상됐습니다: {existing.name}")


def _removeStaging(staging: Path, bundlesRoot: Path) -> None:
    resolved = staging.resolve()
    if resolved.parent != bundlesRoot.resolve() or not resolved.name.startswith(".codaro-local-publication-"):
        raise PublicationBuildError("local publication 임시 디렉터리 삭제 경계가 잘못됐습니다.")
    shutil.rmtree(resolved)
