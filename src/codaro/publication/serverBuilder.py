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
import uuid

from ..document.models import CodaroDocument
from ..document.percentFormat import writePercentDocument
from ..document.service import loadDocument
from ..generatedContracts import PublicationManifest
from ..proof import ProofArchive
from .compiler import CompilationReport, compileDocument
from .immutablePointer import activateImmutablePointer, rollbackImmutablePointer
from .proofLineage import (
    PublicationProofError,
    publicationProof,
    recordPublicationBuildArtifacts,
    validatePublicationProof,
)
from .staticBuilder import PublicationBuildError


_HASH_PREFIX = "sha256-"
_SECRET_REF = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,127}$")
_SERVER_SHELL_EXCLUDES = {"check-packages", "curriculum", "pyodide-assets.json", "pyproc-assets.json", "vendor"}


@dataclass(frozen=True, slots=True)
class ServerPublicationBuildResult:
    outputRoot: Path
    bundleRoot: Path
    activePointer: Path
    bundleHash: str
    manifest: PublicationManifest
    reused: bool


@dataclass(frozen=True, slots=True)
class ServerPublicationVerification:
    outputRoot: Path
    bundleRoot: Path
    bundleHash: str
    manifest: PublicationManifest
    fileCount: int
    totalBytes: int


def buildServerPublication(
    sourcePath: str | Path,
    outputRoot: str | Path,
    *,
    packageLock: Mapping[str, Any] | None = None,
    webBuildRoot: str | Path | None = None,
    maxMemoryMb: int = 512,
    maxExecutionSeconds: int = 300,
    proofArchive: ProofArchive | None = None,
) -> ServerPublicationBuildResult:
    source = Path(sourcePath).expanduser().resolve()
    output = Path(outputRoot).expanduser().resolve()
    if not source.is_file():
        raise PublicationBuildError(f"문서가 없습니다: {source}")
    if not 64 <= maxMemoryMb <= 4096:
        raise PublicationBuildError("server maxMemoryMb는 64에서 4096 사이여야 합니다.")
    if not 1 <= maxExecutionSeconds <= 3600:
        raise PublicationBuildError("server maxExecutionSeconds는 1에서 3600 사이여야 합니다.")

    sourceText = source.read_text(encoding="utf-8")
    document = loadDocument(str(source))
    if document.app.statePolicy == "shared":
        raise PublicationBuildError("shared state server publication은 아직 지원하지 않습니다. perSession을 선택하세요.")
    report = compileDocument(
        document,
        sourcePath=source,
        sourceText=sourceText,
        workspaceRoot=source.parent,
        packageLock=packageLock,
    )
    if report.runtimeTarget not in {"browser", "server"}:
        diagnostics = [dict(item) for item in report.diagnostics]
        raise PublicationBuildError(
            f"server publication을 만들 수 없습니다. {_diagnosticSummary(report)}",
            diagnostics=diagnostics,
        )
    try:
        proof = publicationProof(
            [result.unit for result in report.units],
            report.executionBlockIds,
            document.runtime.packages,
            proofArchive,
        )
    except PublicationProofError as exc:
        raise PublicationBuildError(f"server publication proof를 검증할 수 없습니다: {exc}") from exc

    effects = _serverEffects(report)
    if "dynamic" in effects["secretRefs"]:
        raise PublicationBuildError("동적 secret 이름은 server publication에서 허용하지 않습니다.")
    if "dynamic" in effects["networkOrigins"]:
        raise PublicationBuildError("동적 network 목적지는 server publication에서 허용하지 않습니다.")
    if any(not _SECRET_REF.fullmatch(name) for name in effects["secretRefs"]):
        raise PublicationBuildError("server secret reference 이름이 안전하지 않습니다.")
    blockById = {block.id: block for block in document.blocks}
    publicationDocument = document.model_copy(
        update={"blocks": [blockById[blockId] for blockId in report.executionBlockIds]}
    )
    publicationSourceBytes = writePercentDocument(publicationDocument).encode("utf-8")

    permissionScopes = _permissionScopes(effects)
    policyHash = _contentHash(_canonicalBytes({
        "compilerManifestHash": report.manifestHash,
        "sourceRevisionHash": report.sourceRevision.revisionHash,
        "permissionScopes": permissionScopes,
        "secretRefs": effects["secretRefs"],
        "networkOrigins": effects["networkOrigins"],
        "statePolicy": document.app.statePolicy,
        "maxMemoryMb": maxMemoryMb,
        "maxExecutionSeconds": maxExecutionSeconds,
    }))

    shellRoot = _resolveWebBuildRoot(webBuildRoot)
    _requireServerShell(shellRoot)
    output.mkdir(parents=True, exist_ok=True)
    bundlesRoot = output / "bundles"
    bundlesRoot.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix=".codaro-server-publication-", dir=bundlesRoot)).resolve()
    if staging.parent != bundlesRoot.resolve():
        raise PublicationBuildError("server publication 임시 경로가 output 경계를 벗어났습니다.")

    try:
        _copyServerShell(shellRoot, staging / "shell")
        templateRoot = staging / "workspace-template"
        templateRoot.mkdir(parents=True)
        documentPath = "workspace-template/publication.py"
        (staging / documentPath).write_bytes(publicationSourceBytes)
        dataAssets = _collectServerDataAssets(report, source.parent, templateRoot)
        packageAssets, requirements = _collectServerPackages(
            document,
            source.parent,
            staging,
            packageLock or {},
        )
        requirementsPath = "requirements.lock"
        _writeCanonicalJson(staging / requirementsPath, {"schemaVersion": 1, "packages": requirements})

        files = _serverFiles(staging, documentPath, dataAssets, packageAssets)
        unsignedManifest: dict[str, Any] = {
            "schemaVersion": 1,
            "target": "server",
            "compilerManifestHash": report.manifestHash,
            "sourceRevisionHash": report.sourceRevision.revisionHash,
            "entryBlockIds": list(report.entryBlockIds),
            "executionBlockIds": list(report.executionBlockIds),
            "executionProjectionHash": report.executionProjectionHash,
            "proof": proof,
            "documentPath": documentPath,
            "runtime": {
                "kind": "server",
                "pythonVersion": f"{sys.version_info.major}.{sys.version_info.minor}",
                "requirementsPath": requirementsPath,
                "permissionScopes": permissionScopes,
                "secretRefs": effects["secretRefs"],
                "networkOrigins": effects["networkOrigins"],
                "statePolicy": document.app.statePolicy,
                "policyHash": policyHash,
                "maxMemoryMb": maxMemoryMb,
                "maxExecutionSeconds": maxExecutionSeconds,
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

        _verifyServerBundleRoot(finalRoot, bundleHash=bundleHash)
        try:
            recordPublicationBuildArtifacts(
                proof,
                proofArchive,
                buildArtifactHash=bundleHash,
                manifestHash=manifestHash,
                target="server",
            )
        except PublicationProofError as exc:
            raise PublicationBuildError(f"server publication build proof를 기록할 수 없습니다: {exc}") from exc
        activePayload = _activePayload(output, finalRoot, bundleHash)
        activateImmutablePointer(output, activePayload)
        verified = verifyServerPublication(output)
        return ServerPublicationBuildResult(
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


def verifyServerPublication(outputRoot: str | Path) -> ServerPublicationVerification:
    output = Path(outputRoot).expanduser().resolve()
    active = _readJsonObject(output / "active.json", "active pointer")
    if active.get("schemaVersion") != 1 or active.get("target") != "server":
        raise PublicationBuildError("지원하지 않는 server active pointer입니다.")
    bundlePath = _safeRelativePath(active.get("bundlePath"), "bundlePath")
    bundleRoot = (output / Path(*PurePosixPath(bundlePath).parts)).resolve()
    if not bundleRoot.is_relative_to(output) or not bundleRoot.is_dir():
        raise PublicationBuildError("active server bundle이 output 안의 디렉터리가 아닙니다.")
    bundleHash = str(active.get("bundleHash") or "")
    verified = _verifyServerBundleRoot(bundleRoot, bundleHash=bundleHash)
    if active.get("publicationFileHash") != _fileHash(bundleRoot / "publication.json"):
        raise PublicationBuildError("server publication manifest 파일이 손상됐습니다.")
    return ServerPublicationVerification(
        outputRoot=output,
        bundleRoot=bundleRoot,
        bundleHash=bundleHash,
        manifest=verified[0],
        fileCount=verified[1],
        totalBytes=verified[2],
    )


def rollbackServerPublication(outputRoot: str | Path, bundleHash: str) -> ServerPublicationVerification:
    output = Path(outputRoot).expanduser().resolve()

    def candidate(bundleRoot: Path, contentHash: str):
        verified = _verifyServerBundleRoot(bundleRoot, bundleHash=contentHash)
        return _activePayload(output, bundleRoot, contentHash), ServerPublicationVerification(
            outputRoot=output,
            bundleRoot=bundleRoot,
            bundleHash=contentHash,
            manifest=verified[0],
            fileCount=verified[1],
            totalBytes=verified[2],
        )

    return rollbackImmutablePointer(
        output,
        target="server",
        contentHash=bundleHash,
        collection="bundles",
        candidate=candidate,
    )


def prepareServerPackageEnvironment(verified: ServerPublicationVerification) -> Path | None:
    packages = verified.manifest["packageAssets"]
    if not packages:
        return None
    runtimeRoot = verified.outputRoot / "runtime" / "environments"
    runtimeRoot.mkdir(parents=True, exist_ok=True)
    environmentRoot = runtimeRoot / verified.bundleHash.removeprefix(_HASH_PREFIX)
    receiptPath = environmentRoot / "environment.json"
    identity = {
        "schemaVersion": 1,
        "bundleHash": verified.bundleHash,
        "pythonVersion": f"{sys.version_info.major}.{sys.version_info.minor}",
        "packages": [{"name": item["name"], "contentHash": item["contentHash"]} for item in packages],
    }
    if receiptPath.is_file():
        receipt = _readJsonObject(receiptPath, "server environment receipt")
        if all(receipt.get(key) == value for key, value in identity.items()) and _verifyEnvironmentFiles(
            environmentRoot,
            receipt.get("files"),
        ):
            return environmentRoot / "site-packages"

    staging = Path(tempfile.mkdtemp(prefix="codaro-server-env-")).resolve()
    try:
        target = staging / "site-packages"
        target.mkdir()
        wheels = [str(_resolvedBundleFile(verified.bundleRoot, item["bundlePath"])) for item in packages]
        uvExecutable = shutil.which("uv")
        installCommand = (
            [uvExecutable, "pip", "install", "--offline", "--no-cache", "--no-deps", "--target", str(target), *wheels]
            if uvExecutable is not None
            else [sys.executable, "-m", "pip", "install", "--disable-pip-version-check", "--no-index", "--no-deps", "--target", str(target), *wheels]
        )
        completed = subprocess.run(
            installCommand,
            capture_output=True,
            text=True,
            timeout=600,
            check=False,
        )
        if completed.returncode != 0:
            detail = (completed.stderr or completed.stdout or "offline install failed").strip().splitlines()[-1]
            raise PublicationBuildError(f"server package 환경을 만들 수 없습니다: {detail}")
        _writeCanonicalJson(staging / "environment.json", {
            **identity,
            "files": _environmentFiles(staging),
        })
        if environmentRoot.exists():
            _removeRuntimeEnvironment(environmentRoot, runtimeRoot)
        os.replace(staging, environmentRoot)
        return environmentRoot / "site-packages"
    except BaseException:
        if staging.exists():
            _removeTemporaryEnvironment(staging)
        raise


def _environmentFiles(environmentRoot: Path) -> list[dict[str, object]]:
    return [
        {
            "path": path.relative_to(environmentRoot).as_posix(),
            "contentHash": _fileHash(path),
            "bytes": path.stat().st_size,
        }
        for path in sorted((environmentRoot / "site-packages").rglob("*"))
        if path.is_file()
    ]


def _verifyEnvironmentFiles(environmentRoot: Path, rawFiles: object) -> bool:
    if not isinstance(rawFiles, list):
        return False
    expected: dict[str, tuple[str, int]] = {}
    for raw in rawFiles:
        if not isinstance(raw, dict):
            return False
        try:
            relative = _safeRelativePath(raw.get("path"), "environment file")
        except PublicationBuildError:
            return False
        if relative == "environment.json" or relative in expected:
            return False
        contentHash = raw.get("contentHash")
        byteCount = raw.get("bytes")
        if not isinstance(contentHash, str) or not isinstance(byteCount, int):
            return False
        expected[relative] = (contentHash, byteCount)
    actual = {
        path.relative_to(environmentRoot).as_posix(): (_fileHash(path), path.stat().st_size)
        for path in environmentRoot.rglob("*")
        if path.is_file() and path.name != "environment.json"
    }
    return actual == expected


def _serverEffects(report: CompilationReport) -> dict[str, list[str]]:
    effects = {
        "filesystemRead": set(),
        "filesystemWrite": set(),
        "networkOrigins": set(),
        "secretRefs": set(),
    }
    for result in report.units:
        unitEffects = result.unit["effects"]
        for name in effects:
            effects[name].update(str(item) for item in unitEffects[name])
    return {name: sorted(values) for name, values in effects.items()}


def _permissionScopes(effects: Mapping[str, list[str]]) -> list[str]:
    scopes: list[str] = []
    if effects["filesystemRead"]:
        scopes.append("filesystem.read")
    if effects["filesystemWrite"]:
        scopes.append("filesystem.write")
    if effects["networkOrigins"]:
        scopes.append("network")
    return scopes


def _collectServerDataAssets(
    report: CompilationReport,
    workspaceRoot: Path,
    templateRoot: Path,
) -> list[dict[str, str]]:
    collected: dict[str, str] = {}
    for result in report.units:
        collected.update(result.unit["assetHashes"])
    assets: list[dict[str, str]] = []
    for sourcePath, expectedHash in sorted(collected.items()):
        safePath = _safeRelativePath(sourcePath, "data asset")
        source = (workspaceRoot / Path(*PurePosixPath(safePath).parts)).resolve()
        if not source.is_relative_to(workspaceRoot) or not source.is_file():
            raise PublicationBuildError(f"server data asset이 workspace 안의 파일이 아닙니다: {safePath}")
        actualHash = _fileHash(source)
        if actualHash != expectedHash:
            raise PublicationBuildError(f"compile 뒤 server data asset이 바뀌었습니다: {safePath}")
        destination = templateRoot / Path(*PurePosixPath(safePath).parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        assets.append({
            "sourcePath": safePath,
            "bundlePath": destination.relative_to(templateRoot.parent).as_posix(),
            "contentHash": actualHash,
        })
    return assets


def _collectServerPackages(
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
        if not isinstance(record, Mapping) or record.get("serverSmoke") is not True:
            raise PublicationBuildError(f"server package에 검증된 lock과 serverSmoke가 필요합니다: {name}")
        wheelValue = record.get("wheelPath")
        if not isinstance(wheelValue, str):
            raise PublicationBuildError(f"server package wheelPath가 필요합니다: {name}")
        wheelPath = Path(wheelValue).expanduser()
        source = wheelPath.resolve() if wheelPath.is_absolute() else (workspaceRoot / wheelPath).resolve()
        if not source.is_relative_to(workspaceRoot) or not source.is_file() or source.suffix != ".whl":
            raise PublicationBuildError(f"server package wheel이 workspace 안의 .whl 파일이 아닙니다: {name}")
        actualHash = _fileHash(source)
        if record.get("wheelHash") != actualHash:
            raise PublicationBuildError(f"server package wheel hash가 lock과 다릅니다: {name}")
        bundlePath = f"wheelhouse/{actualHash.removeprefix(_HASH_PREFIX)}/{source.name}"
        destination = staging / Path(*PurePosixPath(bundlePath).parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        assets.append({"name": name, "bundlePath": bundlePath, "contentHash": actualHash})
        requirements.append({"name": name, "requirement": requirement, "wheelHash": actualHash, "wheelPath": bundlePath})
    return assets, requirements


def _copyServerShell(source: Path, destination: Path) -> None:
    destination.mkdir(parents=True)
    for item in source.iterdir():
        if item.name in _SERVER_SHELL_EXCLUDES:
            continue
        target = destination / item.name
        if item.is_dir():
            shutil.copytree(item, target)
        elif item.is_file():
            shutil.copy2(item, target)
    indexPath = destination / "index.html"
    index = indexPath.read_text(encoding="utf-8")
    if "codaro-server-publication" in index:
        raise PublicationBuildError("app shell index에 server publication metadata가 이미 있습니다.")
    index = index.replace(
        "</head>",
        '    <meta name="codaro-server-publication" content="true">\n  </head>',
        1,
    )
    indexPath.write_text(index, encoding="utf-8", newline="\n")


def _serverFiles(
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
        files.append({"path": relative, "contentHash": _fileHash(path), "bytes": path.stat().st_size, "role": role})
    return files


def _verifyServerBundleRoot(bundleRoot: Path, *, bundleHash: str) -> tuple[PublicationManifest, int, int]:
    if not bundleRoot.is_dir():
        raise PublicationBuildError("server bundle 디렉터리가 없습니다.")
    manifest = _readJsonObject(bundleRoot / "publication.json", "server publication manifest")
    runtime = manifest.get("runtime")
    if manifest.get("schemaVersion") != 1 or manifest.get("target") != "server" or not isinstance(runtime, dict) or runtime.get("kind") != "server":
        raise PublicationBuildError("지원하지 않는 server publication manifest입니다.")
    unsigned = dict(manifest)
    manifestHash = unsigned.pop("manifestHash", None)
    if manifestHash != _contentHash(_canonicalBytes(unsigned)):
        raise PublicationBuildError("server publication manifest hash가 일치하지 않습니다.")
    try:
        validatePublicationProof(
            manifest.get("proof"),
            executionBlockIds=manifest.get("executionBlockIds") if isinstance(manifest.get("executionBlockIds"), list) else [],
        )
    except PublicationProofError as exc:
        raise PublicationBuildError(f"server publication proof가 손상됐습니다: {exc}") from exc
    files = manifest.get("files")
    if not isinstance(files, list):
        raise PublicationBuildError("server publication files가 목록이 아닙니다.")
    listed: set[str] = set()
    totalBytes = 0
    for item in files:
        if not isinstance(item, dict):
            raise PublicationBuildError("server publication file 항목이 객체가 아닙니다.")
        relative = _safeRelativePath(item.get("path"), "file.path")
        if relative in listed or relative == "publication.json":
            raise PublicationBuildError(f"server publication file 경로가 중복되거나 예약됐습니다: {relative}")
        listed.add(relative)
        target = _resolvedBundleFile(bundleRoot, relative)
        data = target.read_bytes() if target.is_file() else b""
        if not data and (not target.is_file() or item.get("bytes") != 0):
            raise PublicationBuildError(f"server publication 파일이 없습니다: {relative}")
        if item.get("bytes") != len(data) or item.get("contentHash") != _contentHash(data):
            raise PublicationBuildError(f"server publication 파일이 손상됐습니다: {relative}")
        totalBytes += len(data)
    actual = {
        path.relative_to(bundleRoot).as_posix()
        for path in bundleRoot.rglob("*")
        if path.is_file() and path.name != "publication.json"
    }
    if actual != listed:
        raise PublicationBuildError("server publication manifest와 실제 파일 목록이 다릅니다.")
    _verifyServerExecutionProjection(manifest, bundleRoot)
    publicationFileHash = _fileHash(bundleRoot / "publication.json")
    calculatedBundleHash = _contentHash(_canonicalBytes({
        "manifestHash": manifestHash,
        "publicationFileHash": publicationFileHash,
    }))
    if bundleHash != calculatedBundleHash or bundleRoot.name != bundleHash.removeprefix(_HASH_PREFIX):
        raise PublicationBuildError("server bundle hash가 일치하지 않습니다.")
    return manifest, len(files) + 1, totalBytes + (bundleRoot / "publication.json").stat().st_size  # type: ignore[return-value]


def _verifyServerExecutionProjection(manifest: dict[str, Any], bundleRoot: Path) -> None:
    blockIds = manifest.get("executionBlockIds")
    projectionHash = manifest.get("executionProjectionHash")
    documentPath = _safeRelativePath(manifest.get("documentPath"), "documentPath")
    if (
        not isinstance(blockIds, list)
        or not blockIds
        or len(blockIds) != len(set(blockIds))
        or any(not isinstance(blockId, str) or not blockId for blockId in blockIds)
        or not isinstance(projectionHash, str)
    ):
        raise PublicationBuildError("server publication execution projection 계약이 잘못됐습니다.")
    document = loadDocument(str(_resolvedBundleFile(bundleRoot, documentPath)))
    executionBlocks = [
        block
        for block in document.blocks
        if block.type in {"code", "automation", "markdown"}
    ]
    actualIds = [block.id for block in executionBlocks]
    actualProjectionHash = _contentHash(_canonicalBytes([
        {
            "blockId": block.id,
            "type": block.type,
            "contentHash": _contentHash(block.content.encode("utf-8")),
        }
        for block in executionBlocks
    ]))
    if actualIds != blockIds or actualProjectionHash != projectionHash:
        raise PublicationBuildError("server publication execution projection이 bundle 문서와 다릅니다.")


def _activePayload(output: Path, bundleRoot: Path, bundleHash: str) -> dict[str, object]:
    return {
        "schemaVersion": 1,
        "target": "server",
        "bundleHash": bundleHash,
        "bundlePath": bundleRoot.relative_to(output).as_posix(),
        "publicationFileHash": _fileHash(bundleRoot / "publication.json"),
    }


def _resolveWebBuildRoot(configured: str | Path | None) -> Path:
    if configured is not None:
        return Path(configured).expanduser().resolve()
    environment = os.environ.get("CODARO_WEB_BUILD_ROOT")
    if environment:
        return Path(environment).expanduser().resolve()
    return Path(__file__).resolve().parents[1] / "webBuild"


def _requireServerShell(root: Path) -> None:
    if not (root / "index.html").is_file() or not (root / "_app").is_dir():
        raise PublicationBuildError("server publication app shell이 없습니다. editor build를 먼저 만드세요.")


def _diagnosticSummary(report: CompilationReport) -> str:
    if not report.diagnostics:
        return f"판정 target: {report.runtimeTarget}"
    diagnostic = report.diagnostics[0]
    span = diagnostic["sourceSpan"]
    return f"{diagnostic['code']} {span['path']}:{span['startLine']} {diagnostic['message']}"


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
        raise PublicationBuildError(f"server bundle 경로가 경계를 벗어났습니다: {relative}")
    return target


def _canonicalBytes(payload: Any) -> bytes:
    return json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _contentHash(payload: bytes) -> str:
    return _HASH_PREFIX + hashlib.sha256(payload).hexdigest()


def _fileHash(path: Path) -> str:
    if not path.is_file():
        raise PublicationBuildError(f"server publication 파일이 없습니다: {path}")
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


def _writeJsonAtomically(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    temporary.write_bytes(_canonicalBytes(payload))
    os.replace(temporary, path)


def _assertSameBundle(expected: Path, existing: Path) -> None:
    expectedFiles = {path.relative_to(expected).as_posix(): _fileHash(path) for path in expected.rglob("*") if path.is_file()}
    existingFiles = {path.relative_to(existing).as_posix(): _fileHash(path) for path in existing.rglob("*") if path.is_file()}
    if expectedFiles != existingFiles:
        raise PublicationBuildError(f"기존 immutable server bundle이 손상됐습니다: {existing.name}")


def _removeStaging(staging: Path, bundlesRoot: Path) -> None:
    resolved = staging.resolve()
    if resolved.parent != bundlesRoot.resolve() or not resolved.name.startswith(".codaro-server-publication-"):
        raise PublicationBuildError("server publication 임시 디렉터리 삭제 경계가 잘못됐습니다.")
    shutil.rmtree(resolved)


def _removeRuntimeEnvironment(target: Path, runtimeRoot: Path) -> None:
    resolved = target.resolve()
    if resolved.parent != runtimeRoot.resolve() or not (
        resolved.name.startswith(".codaro-server-env-") or re.fullmatch(r"[0-9a-f]{64}", resolved.name)
    ):
        raise PublicationBuildError("server runtime 환경 삭제 경계가 잘못됐습니다.")
    shutil.rmtree(resolved)


def _removeTemporaryEnvironment(target: Path) -> None:
    resolved = target.resolve()
    temporaryRoot = Path(tempfile.gettempdir()).resolve()
    if resolved.parent != temporaryRoot or not resolved.name.startswith("codaro-server-env-"):
        raise PublicationBuildError("server runtime 임시 환경 삭제 경계가 잘못됐습니다.")
    shutil.rmtree(resolved)
