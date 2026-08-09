from __future__ import annotations

from dataclasses import dataclass
from functools import partial
import hashlib
import html
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import mimetypes
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import tempfile
from typing import Any, Mapping
import uuid
import webbrowser

from ..document.service import loadDocument
from ..generatedContracts import PublicationAsset, PublicationFile, PublicationManifest, PublicationPackage
from .compiler import CompilationReport, compileDocument


_HASH_PREFIX = "sha256-"
_STATIC_CSP = (
    "default-src 'self'; "
    "base-uri 'none'; "
    "connect-src 'self'; "
    "font-src 'self'; "
    "frame-src 'none'; "
    "img-src 'self' data: blob:; "
    "object-src 'none'; "
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; "
    "style-src 'self' 'unsafe-inline'; "
    "worker-src 'self' blob:"
)


class PublicationBuildError(RuntimeError):
    def __init__(self, message: str, *, diagnostics: list[dict[str, Any]] | None = None) -> None:
        super().__init__(message)
        self.diagnostics = diagnostics or []


@dataclass(frozen=True, slots=True)
class PublicationBuildResult:
    outputRoot: Path
    bundleRoot: Path
    activePointer: Path
    bundleHash: str
    manifest: PublicationManifest
    reused: bool


@dataclass(frozen=True, slots=True)
class PublicationVerification:
    bundleRoot: Path
    bundleHash: str
    manifest: PublicationManifest
    fileCount: int
    totalBytes: int


def buildStaticPublication(
    sourcePath: str | Path,
    outputRoot: str | Path,
    *,
    packageLock: Mapping[str, Any] | None = None,
    webBuildRoot: str | Path | None = None,
) -> PublicationBuildResult:
    source = Path(sourcePath).expanduser().resolve()
    output = Path(outputRoot).expanduser().resolve()
    if not source.is_file():
        raise PublicationBuildError(f"문서가 없습니다: {source}")
    document = loadDocument(str(source))
    sourceText = source.read_text(encoding="utf-8")
    report = compileDocument(
        document,
        sourcePath=source,
        sourceText=sourceText,
        workspaceRoot=source.parent,
        packageLock=packageLock,
    )
    if report.runtimeTarget != "browser":
        diagnostics = [dict(item) for item in report.diagnostics]
        detail = _diagnosticSummary(report)
        raise PublicationBuildError(f"browser publication을 만들 수 없습니다. {detail}", diagnostics=diagnostics)

    shellRoot = _resolveWebBuildRoot(webBuildRoot)
    _requireStaticShell(shellRoot)
    output.mkdir(parents=True, exist_ok=True)
    bundlesRoot = output / "bundles"
    bundlesRoot.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix=".codaro-publication-", dir=bundlesRoot)).resolve()
    if staging.parent != bundlesRoot.resolve():
        raise PublicationBuildError("publication 임시 경로가 output 경계를 벗어났습니다.")

    try:
        _copyShell(shellRoot, staging)
        dataAssets = _collectDataAssets(report, source.parent, staging)
        packageAssets, runtimePackages = _collectPackageAssets(
            report, source.parent, staging, packageLock or {}
        )
        publicationDocument = document.model_copy(
            update={
                "id": f"publication-{report.sourceRevision.revisionHash.removeprefix(_HASH_PREFIX)[:24]}",
                "metadata": document.metadata.model_copy(
                    update={
                        "createdAt": "1970-01-01T00:00:00+00:00",
                        "updatedAt": "1970-01-01T00:00:00+00:00",
                    }
                ),
                "runtime": document.runtime.model_copy(update={"packages": runtimePackages}),
            }
        )
        documentPath = "document.json"
        _writeCanonicalJson(staging / documentPath, publicationDocument.model_dump(mode="json"))
        _rewriteRuntimeManifest(staging / "pyproc-assets.json", "vendor/pyproc/")
        _rewriteRuntimeManifest(staging / "pyodide-assets.json", "vendor/pyodide/")
        _rewriteIndex(staging / "index.html", publicationDocument.app.title)

        files = _publicationFiles(staging, dataAssets, packageAssets, documentPath)
        unsignedManifest: dict[str, Any] = {
            "schemaVersion": 1,
            "target": "browser",
            "compilerManifestHash": report.manifestHash,
            "sourceRevisionHash": report.sourceRevision.revisionHash,
            "entryBlockIds": list(report.entryBlockIds),
            "documentPath": documentPath,
            "runtime": {
                "pythonIndexPath": "vendor/pyodide/",
                "pythonIntegrityPath": "pyodide-assets.json",
                "pyprocIntegrityPath": "pyproc-assets.json",
            },
            "files": files,
            "dataAssets": dataAssets,
            "packageAssets": packageAssets,
        }
        manifestHash = _contentHash(_canonicalBytes(unsignedManifest))
        manifest: PublicationManifest = {**unsignedManifest, "manifestHash": manifestHash}  # type: ignore[typeddict-item]
        _writeCanonicalJson(staging / "publication.json", manifest)

        indexHash = _fileHash(staging / "index.html")
        publicationFileHash = _fileHash(staging / "publication.json")
        bundleHash = _contentHash(
            _canonicalBytes(
                {
                    "indexHash": indexHash,
                    "manifestHash": manifestHash,
                    "publicationFileHash": publicationFileHash,
                }
            )
        )
        finalRoot = bundlesRoot / bundleHash.removeprefix(_HASH_PREFIX)
        reused = finalRoot.is_dir()
        if reused:
            _assertSameBundle(staging, finalRoot)
            _removeStaging(staging, bundlesRoot)
        else:
            os.replace(staging, finalRoot)

        activePayload = {
            "schemaVersion": 1,
            "bundleHash": bundleHash,
            "bundlePath": finalRoot.relative_to(output).as_posix(),
            "indexHash": indexHash,
            "publicationFileHash": publicationFileHash,
        }
        _writeJsonAtomically(output / "active.json", activePayload)
        verified = verifyPublication(output)
        return PublicationBuildResult(
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


def verifyPublication(outputRoot: str | Path) -> PublicationVerification:
    output = Path(outputRoot).expanduser().resolve()
    activePath = output / "active.json"
    active = _readJsonObject(activePath, "active pointer")
    if active.get("schemaVersion") != 1:
        raise PublicationBuildError("지원하지 않는 active pointer입니다.")
    bundlePath = _safeRelativePath(active.get("bundlePath"), "bundlePath")
    bundleRoot = (output / Path(*PurePosixPath(bundlePath).parts)).resolve()
    if not bundleRoot.is_relative_to(output) or not bundleRoot.is_dir():
        raise PublicationBuildError("active bundle 경로가 output 안의 디렉터리가 아닙니다.")
    manifest = _readJsonObject(bundleRoot / "publication.json", "publication manifest")
    if manifest.get("schemaVersion") != 1 or manifest.get("target") != "browser":
        raise PublicationBuildError("지원하지 않는 publication manifest입니다.")
    manifestHash = manifest.get("manifestHash")
    unsigned = dict(manifest)
    unsigned.pop("manifestHash", None)
    if manifestHash != _contentHash(_canonicalBytes(unsigned)):
        raise PublicationBuildError("publication manifest hash가 일치하지 않습니다.")

    listed: set[str] = set()
    totalBytes = 0
    files = manifest.get("files")
    if not isinstance(files, list):
        raise PublicationBuildError("publication files가 목록이 아닙니다.")
    for item in files:
        if not isinstance(item, dict):
            raise PublicationBuildError("publication file 항목이 객체가 아닙니다.")
        path = _safeRelativePath(item.get("path"), "file.path")
        if path in listed or path in {"index.html", "publication.json"}:
            raise PublicationBuildError(f"publication file 경로가 중복되거나 예약됐습니다: {path}")
        listed.add(path)
        target = _resolvedBundleFile(bundleRoot, path)
        if not target.is_file():
            raise PublicationBuildError(f"publication 파일이 없습니다: {path}")
        data = target.read_bytes()
        if item.get("bytes") != len(data) or item.get("contentHash") != _contentHash(data):
            raise PublicationBuildError(f"publication 파일이 손상됐습니다: {path}")
        totalBytes += len(data)

    actual = set()
    for path in bundleRoot.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(bundleRoot).as_posix()
        if relative not in {"index.html", "publication.json"}:
            actual.add(relative)
    if actual != listed:
        raise PublicationBuildError("publication manifest와 실제 파일 목록이 다릅니다.")
    if active.get("indexHash") != _fileHash(bundleRoot / "index.html"):
        raise PublicationBuildError("publication index가 손상됐습니다.")
    if active.get("publicationFileHash") != _fileHash(bundleRoot / "publication.json"):
        raise PublicationBuildError("publication manifest 파일이 손상됐습니다.")
    bundleHash = _contentHash(
        _canonicalBytes(
            {
                "indexHash": active.get("indexHash"),
                "manifestHash": manifestHash,
                "publicationFileHash": active.get("publicationFileHash"),
            }
        )
    )
    if active.get("bundleHash") != bundleHash or bundleRoot.name != bundleHash.removeprefix(_HASH_PREFIX):
        raise PublicationBuildError("active pointer의 bundle hash가 일치하지 않습니다.")
    return PublicationVerification(
        bundleRoot=bundleRoot,
        bundleHash=bundleHash,
        manifest=manifest,  # type: ignore[arg-type]
        fileCount=len(files) + 2,
        totalBytes=totalBytes + (bundleRoot / "index.html").stat().st_size + (bundleRoot / "publication.json").stat().st_size,
    )


def startPublicationServer(
    outputRoot: str | Path,
    *,
    host: str = "127.0.0.1",
    port: int = 8766,
) -> tuple[ThreadingHTTPServer, str]:
    verified = verifyPublication(outputRoot)
    handler = partial(_PublicationRequestHandler, directory=str(verified.bundleRoot))
    server = ThreadingHTTPServer((host, port), handler)
    actualPort = server.server_address[1]
    visibleHost = "127.0.0.1" if host in {"0.0.0.0", "::"} else host
    return server, f"http://{visibleHost}:{actualPort}/"


def servePublication(
    outputRoot: str | Path,
    *,
    host: str = "127.0.0.1",
    port: int = 8766,
    openBrowser: bool = True,
) -> None:
    server, url = startPublicationServer(outputRoot, host=host, port=port)
    print(f"Serving publication at {url}")
    if openBrowser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


class _PublicationRequestHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args: object) -> None:
        return

    def end_headers(self) -> None:
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Content-Security-Policy", _STATIC_CSP)
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def translate_path(self, path: str) -> str:
        translated = Path(super().translate_path(path)).resolve()
        root = Path(self.directory or ".").resolve()
        if not translated.is_relative_to(root):
            return str(root / ".codaro-not-found")
        return str(translated)


def _resolveWebBuildRoot(configured: str | Path | None) -> Path:
    if configured is not None:
        return Path(configured).expanduser().resolve()
    environment = os.environ.get("CODARO_WEB_BUILD_ROOT")
    if environment:
        return Path(environment).expanduser().resolve()
    return Path(__file__).resolve().parents[1] / "webBuild"


def _requireStaticShell(root: Path) -> None:
    required = (
        root / "index.html",
        root / "_app",
        root / "pyproc-assets.json",
        root / "pyodide-assets.json",
        root / "vendor" / "pyproc",
        root / "vendor" / "pyodide",
    )
    missing = [path.as_posix() for path in required if not path.exists()]
    if missing:
        raise PublicationBuildError("정적 app shell이 준비되지 않았습니다: " + ", ".join(missing))


def _copyShell(source: Path, target: Path) -> None:
    for child in source.iterdir():
        destination = target / child.name
        if child.is_dir():
            shutil.copytree(child, destination)
        else:
            shutil.copy2(child, destination)


def _collectDataAssets(
    report: CompilationReport,
    workspaceRoot: Path,
    staging: Path,
) -> list[PublicationAsset]:
    hashes: dict[str, str] = {}
    for unit in report.units:
        for path, contentHash in unit.unit["assetHashes"].items():
            previous = hashes.setdefault(path, contentHash)
            if previous != contentHash:
                raise PublicationBuildError(f"같은 자산 경로의 hash가 다릅니다: {path}")
    assets: list[PublicationAsset] = []
    for sourcePath, expectedHash in sorted(hashes.items()):
        safePath = _safeRelativePath(sourcePath, "data asset")
        source = (workspaceRoot / Path(*PurePosixPath(safePath).parts)).resolve()
        if not source.is_relative_to(workspaceRoot) or not source.is_file():
            raise PublicationBuildError(f"data asset이 workspace 안의 파일이 아닙니다: {safePath}")
        actualHash = _fileHash(source)
        if actualHash != expectedHash:
            raise PublicationBuildError(f"compile 뒤 data asset이 바뀌었습니다: {safePath}")
        bundlePath = f"data/{actualHash.removeprefix(_HASH_PREFIX)}/{source.name}"
        destination = staging / Path(*PurePosixPath(bundlePath).parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        assets.append({"sourcePath": safePath, "bundlePath": bundlePath, "contentHash": actualHash})
    return assets


def _collectPackageAssets(
    report: CompilationReport,
    workspaceRoot: Path,
    staging: Path,
    packageLock: Mapping[str, Any],
) -> tuple[list[PublicationPackage], list[str]]:
    required = sorted({_packageName(package) for unit in report.units for package in unit.packages})
    normalizedLock = {_packageName(str(name)): value for name, value in packageLock.items()}
    assets: list[PublicationPackage] = []
    runtimePackages: list[str] = []
    for name in required:
        record = normalizedLock.get(name)
        if not isinstance(record, Mapping) or not isinstance(record.get("wheelPath"), str):
            raise PublicationBuildError(f"offline browser package에 wheelPath가 필요합니다: {name}")
        wheelPath = Path(str(record["wheelPath"])).expanduser()
        source = wheelPath.resolve() if wheelPath.is_absolute() else (workspaceRoot / wheelPath).resolve()
        if not source.is_relative_to(workspaceRoot) or not source.is_file() or source.suffix != ".whl":
            raise PublicationBuildError(f"package wheel이 workspace 안의 .whl 파일이 아닙니다: {name}")
        actualHash = _fileHash(source)
        if record.get("wheelHash") != actualHash:
            raise PublicationBuildError(f"package wheel hash가 lock과 다릅니다: {name}")
        bundlePath = f"packages/{actualHash.removeprefix(_HASH_PREFIX)}/{source.name}"
        destination = staging / Path(*PurePosixPath(bundlePath).parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        assets.append({"name": name, "bundlePath": bundlePath, "contentHash": actualHash})
        runtimePackages.append(f"./{bundlePath}")
    return assets, runtimePackages


def _publicationFiles(
    staging: Path,
    dataAssets: list[PublicationAsset],
    packageAssets: list[PublicationPackage],
    documentPath: str,
) -> list[PublicationFile]:
    dataPaths = {item["bundlePath"] for item in dataAssets}
    packagePaths = {item["bundlePath"] for item in packageAssets}
    files: list[PublicationFile] = []
    for path in sorted(item for item in staging.rglob("*") if item.is_file()):
        relative = path.relative_to(staging).as_posix()
        if relative in {"index.html", "publication.json"}:
            continue
        role = "shell"
        if relative == documentPath:
            role = "document"
        elif relative in dataPaths:
            role = "data"
        elif relative in packagePaths:
            role = "package"
        elif relative.startswith("vendor/") or relative in {"pyproc-assets.json", "pyodide-assets.json"}:
            role = "runtime"
        files.append(
            {
                "path": relative,
                "contentHash": _fileHash(path),
                "bytes": path.stat().st_size,
                "role": role,  # type: ignore[typeddict-item]
            }
        )
    return files


def _rewriteRuntimeManifest(path: Path, packageRoot: str) -> None:
    payload = _readJsonObject(path, path.name)
    payload["packageRoot"] = f"./{packageRoot}"
    files = payload.get("files")
    if not isinstance(files, list):
        raise PublicationBuildError(f"{path.name} files가 목록이 아닙니다.")
    for item in files:
        if not isinstance(item, dict) or not isinstance(item.get("path"), str):
            raise PublicationBuildError(f"{path.name} file 계약이 잘못됐습니다.")
        item["url"] = f"./{packageRoot}{item['path']}"
    _writeCanonicalJson(path, payload)


def _rewriteIndex(path: Path, title: str) -> None:
    source = path.read_text(encoding="utf-8")
    source = re.sub(r"\s*<link rel=\"(?:preconnect|dns-prefetch)\"[^>]*>\s*", "\n", source)
    source = re.sub(r'(?P<prefix>\b(?:href|src)=")/(?P<path>[^\"]*)', r'\g<prefix>./\g<path>', source)
    source = source.replace(
        "const isLocalPreview = [\"localhost\", \"127.0.0.1\", \"::1\"].includes(location.hostname);",
        "const isLocalPreview = true;",
    )
    source = re.sub(r"<title>.*?</title>", f"<title>{html.escape(title)}</title>", source, count=1)
    metadata = (
        f'<meta http-equiv="Content-Security-Policy" content="{html.escape(_STATIC_CSP, quote=True)}">\n'
        '    <meta name="codaro-runtime-tier" content="web">\n'
        '    <meta name="codaro-static-publication" content="./publication.json">\n'
    )
    if "codaro-static-publication" in source:
        raise PublicationBuildError("app shell index에 정적 publication metadata가 이미 있습니다.")
    source = source.replace("</head>", f"    {metadata}  </head>", 1)
    path.write_text(source, encoding="utf-8", newline="\n")


def _diagnosticSummary(report: CompilationReport) -> str:
    if not report.diagnostics:
        return f"판정 target: {report.runtimeTarget}"
    diagnostic = report.diagnostics[0]
    span = diagnostic["sourceSpan"]
    return f"{diagnostic['code']} {span['path']}:{span['startLine']} {diagnostic['message']}"


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
        raise PublicationBuildError(f"bundle 경로가 경계를 벗어났습니다: {relative}")
    return target


def _packageName(requirement: str) -> str:
    return re.split(r"[<>=!~;\s\[]", requirement.strip().lower(), maxsplit=1)[0].replace("_", "-")


def _readJsonObject(path: Path, label: str) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise PublicationBuildError(f"{label}를 읽을 수 없습니다: {exc}") from exc
    if not isinstance(payload, dict):
        raise PublicationBuildError(f"{label}가 JSON object가 아닙니다.")
    return payload


def _canonicalBytes(payload: Any) -> bytes:
    return json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def _contentHash(payload: bytes) -> str:
    return _HASH_PREFIX + hashlib.sha256(payload).hexdigest()


def _fileHash(path: Path) -> str:
    if not path.is_file():
        raise PublicationBuildError(f"publication 파일이 없습니다: {path}")
    return _contentHash(path.read_bytes())


def _writeCanonicalJson(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(_canonicalBytes(payload))


def _writeJsonAtomically(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    temporary.write_bytes(_canonicalBytes(payload))
    os.replace(temporary, path)


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
        raise PublicationBuildError(f"기존 immutable bundle이 손상됐습니다: {existing.name}")


def _removeStaging(staging: Path, bundlesRoot: Path) -> None:
    resolved = staging.resolve()
    if resolved.parent != bundlesRoot.resolve() or not resolved.name.startswith(".codaro-publication-"):
        raise PublicationBuildError("publication 임시 디렉터리 삭제 경계가 잘못됐습니다.")
    shutil.rmtree(resolved)


mimetypes.add_type("application/wasm", ".wasm")
