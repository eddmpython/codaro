from __future__ import annotations

from dataclasses import dataclass
from functools import partial
import hashlib
import html
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path, PurePosixPath
import shutil
import tempfile
from typing import Any, Literal, Mapping, Sequence, TypedDict
from urllib.parse import unquote, urlsplit
import uuid
import webbrowser

from ..document.service import loadDocument
from .compiler import compileExecutableUnit
from .staticBuilder import (
    PublicationBuildError,
    PublicationBuildResult,
    PublicationVerification,
    buildStaticPublication,
    verifyPublication,
)


BlockEmbedMode = Literal["output", "interactive", "editable"]
_EMBED_MODES: tuple[BlockEmbedMode, ...] = ("output", "interactive", "editable")
_SANDBOX = ("allow-scripts", "allow-same-origin")
_HASH_PREFIX = "sha256-"
_EMBED_CSP = (
    "default-src 'self'; "
    "base-uri 'none'; "
    "connect-src 'self'; "
    "font-src 'self' data:; "
    "frame-src 'self'; "
    "img-src 'self' data: blob:; "
    "object-src 'none'; "
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval'; "
    "style-src 'self' 'unsafe-inline'; "
    "worker-src 'self' blob:"
)


class BlockEmbedManifest(TypedDict):
    schemaVersion: Literal[1]
    kind: Literal["codaro.block-embed"]
    protocol: dict[str, Any]
    embedId: str
    title: str
    entryBlockId: str
    dependencyBlockIds: list[str]
    runtimeTarget: Literal["browser"]
    defaultMode: BlockEmbedMode
    allowedModes: list[BlockEmbedMode]
    framePath: str
    publicationBundleHash: str
    publicationManifestHash: str
    sandbox: list[str]
    loaderHash: str
    manifestHash: str


@dataclass(frozen=True, slots=True)
class BlockEmbedBuildResult:
    outputRoot: Path
    embedRoot: Path
    activePointer: Path
    embedHash: str
    manifest: BlockEmbedManifest
    publication: PublicationBuildResult
    reused: bool


@dataclass(frozen=True, slots=True)
class BlockEmbedVerification:
    outputRoot: Path
    embedRoot: Path
    embedHash: str
    manifest: BlockEmbedManifest
    publication: PublicationVerification
    fileCount: int
    totalBytes: int


def buildBlockEmbed(
    sourcePath: str | Path,
    outputRoot: str | Path,
    *,
    entryBlockId: str,
    defaultMode: BlockEmbedMode = "interactive",
    allowedModes: Sequence[BlockEmbedMode] = _EMBED_MODES,
    packageLock: Mapping[str, Any] | None = None,
    webBuildRoot: str | Path | None = None,
    embedLoaderPath: str | Path | None = None,
) -> BlockEmbedBuildResult:
    source = Path(sourcePath).expanduser().resolve()
    output = Path(outputRoot).expanduser().resolve()
    if not source.is_file():
        raise PublicationBuildError(f"문서가 없습니다: {source}")
    modes = tuple(dict.fromkeys(allowedModes))
    if not modes or any(mode not in _EMBED_MODES for mode in modes):
        raise PublicationBuildError("embed allowedModes가 잘못됐습니다.")
    if defaultMode not in modes:
        raise PublicationBuildError("embed defaultMode은 allowedModes에 포함돼야 합니다.")

    document = loadDocument(str(source))
    try:
        compiled = compileExecutableUnit(
            document,
            entryBlockId,
            sourcePath=source,
            sourceText=source.read_text(encoding="utf-8"),
            workspaceRoot=source.parent,
            packageLock=packageLock,
        )
    except ValueError as exc:
        raise PublicationBuildError(str(exc)) from exc
    if compiled.targetDecision.selected != "browser":
        diagnostics = [dict(item) for item in compiled.unit["diagnostics"]]
        detail = diagnostics[0]["code"] if diagnostics else compiled.targetDecision.selected
        raise PublicationBuildError(
            f"block embed은 browser 기능 블록만 만들 수 있습니다: {detail}",
            diagnostics=diagnostics,
        )

    output.mkdir(parents=True, exist_ok=True)
    publication = buildStaticPublication(
        source,
        output / "publication",
        packageLock=packageLock,
        webBuildRoot=webBuildRoot,
        entryBlockIds=(entryBlockId,),
        closureOnly=True,
    )
    loader = _resolveEmbedLoader(webBuildRoot, embedLoaderPath)
    loaderBytes = loader.read_bytes()
    loaderHash = _contentHash(loaderBytes)
    framePath = (
        "../../publication/bundles/"
        f"{publication.bundleHash.removeprefix(_HASH_PREFIX)}/index.html"
    )
    embedId = compiled.unit["unitId"]
    unsignedManifest: dict[str, Any] = {
        "schemaVersion": 1,
        "kind": "codaro.block-embed",
        "protocol": {"name": "codaro.embed", "version": 1},
        "embedId": embedId,
        "title": document.app.title or document.title,
        "entryBlockId": entryBlockId,
        "dependencyBlockIds": list(compiled.unit["dependencyBlockIds"]),
        "runtimeTarget": "browser",
        "defaultMode": defaultMode,
        "allowedModes": list(modes),
        "framePath": framePath,
        "publicationBundleHash": publication.bundleHash,
        "publicationManifestHash": publication.manifest["manifestHash"],
        "sandbox": list(_SANDBOX),
        "loaderHash": loaderHash,
    }
    manifestHash = _contentHash(_canonicalBytes(unsignedManifest))
    manifest: BlockEmbedManifest = {**unsignedManifest, "manifestHash": manifestHash}  # type: ignore[typeddict-item]
    hostBytes = _hostHtml(document.app.title or document.title, defaultMode).encode("utf-8")
    embedHash = _contentHash(
        _canonicalBytes(
            {
                "manifestHash": manifestHash,
                "loaderHash": loaderHash,
                "hostHash": _contentHash(hostBytes),
            }
        )
    )

    embedsRoot = output / "embeds"
    embedsRoot.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix=".codaro-embed-", dir=embedsRoot)).resolve()
    if staging.parent != embedsRoot.resolve():
        raise PublicationBuildError("embed 임시 경로가 output 경계를 벗어났습니다.")
    try:
        (staging / "codaro-block.js").write_bytes(loaderBytes)
        (staging / "index.html").write_bytes(hostBytes)
        _writeCanonicalJson(staging / "embed.json", manifest)
        finalRoot = embedsRoot / embedHash.removeprefix(_HASH_PREFIX)
        reused = finalRoot.is_dir()
        if reused:
            _assertSameFiles(staging, finalRoot)
            _removeStaging(staging, embedsRoot)
        else:
            os.replace(staging, finalRoot)
        active = {
            "schemaVersion": 1,
            "target": "embed",
            "embedHash": embedHash,
            "embedPath": finalRoot.relative_to(output).as_posix(),
            "manifestFileHash": _fileHash(finalRoot / "embed.json"),
            "loaderHash": loaderHash,
            "hostHash": _fileHash(finalRoot / "index.html"),
        }
        _writeJsonAtomically(output / "active.json", active)
        verified = verifyBlockEmbed(output)
        return BlockEmbedBuildResult(
            outputRoot=output,
            embedRoot=verified.embedRoot,
            activePointer=output / "active.json",
            embedHash=verified.embedHash,
            manifest=verified.manifest,
            publication=publication,
            reused=reused,
        )
    except BaseException:
        if staging.exists():
            _removeStaging(staging, embedsRoot)
        raise


def verifyBlockEmbed(outputRoot: str | Path) -> BlockEmbedVerification:
    output = Path(outputRoot).expanduser().resolve()
    active = _readJson(output / "active.json", "embed active pointer")
    if set(active) != {
        "schemaVersion", "target", "embedHash", "embedPath", "manifestFileHash", "loaderHash", "hostHash"
    } or active.get("schemaVersion") != 1 or active.get("target") != "embed":
        raise PublicationBuildError("지원하지 않는 embed active pointer입니다.")
    embedPath = _safeRelative(active.get("embedPath"), "embedPath")
    embedRoot = (output / Path(*PurePosixPath(embedPath).parts)).resolve()
    if not embedRoot.is_relative_to(output) or not embedRoot.is_dir():
        raise PublicationBuildError("active embed 경로가 output 안의 디렉터리가 아닙니다.")
    manifestPath = embedRoot / "embed.json"
    if active.get("manifestFileHash") != _fileHash(manifestPath):
        raise PublicationBuildError("embed manifest 파일이 손상됐습니다.")
    manifest = _readJson(manifestPath, "embed manifest")
    _validateManifest(manifest)
    unsigned = dict(manifest)
    unsigned.pop("manifestHash", None)
    if manifest.get("manifestHash") != _contentHash(_canonicalBytes(unsigned)):
        raise PublicationBuildError("embed manifest hash가 일치하지 않습니다.")
    loaderPath = embedRoot / "codaro-block.js"
    hostPath = embedRoot / "index.html"
    if active.get("loaderHash") != _fileHash(loaderPath) or manifest.get("loaderHash") != active.get("loaderHash"):
        raise PublicationBuildError("embed loader가 손상됐습니다.")
    if active.get("hostHash") != _fileHash(hostPath):
        raise PublicationBuildError("embed host가 손상됐습니다.")
    actualFiles = {path.relative_to(embedRoot).as_posix() for path in embedRoot.rglob("*") if path.is_file()}
    if actualFiles != {"codaro-block.js", "embed.json", "index.html"}:
        raise PublicationBuildError("embed bundle 파일 목록이 다릅니다.")

    publication = verifyPublication(output / "publication")
    if publication.bundleHash != manifest.get("publicationBundleHash"):
        raise PublicationBuildError("embed와 publication bundle hash가 다릅니다.")
    if publication.manifest["manifestHash"] != manifest.get("publicationManifestHash"):
        raise PublicationBuildError("embed와 publication manifest hash가 다릅니다.")
    framePath = manifest.get("framePath")
    if not isinstance(framePath, str) or "\\" in framePath or ":" in framePath:
        raise PublicationBuildError("embed framePath가 안전한 상대 경로가 아닙니다.")
    frame = (embedRoot / Path(*PurePosixPath(framePath).parts)).resolve()
    expectedFrame = (publication.bundleRoot / "index.html").resolve()
    if frame != expectedFrame or not frame.is_relative_to(output):
        raise PublicationBuildError("embed framePath가 검증된 publication index를 가리키지 않습니다.")

    embedHash = _contentHash(
        _canonicalBytes(
            {
                "manifestHash": manifest["manifestHash"],
                "loaderHash": active["loaderHash"],
                "hostHash": active["hostHash"],
            }
        )
    )
    if active.get("embedHash") != embedHash or embedRoot.name != embedHash.removeprefix(_HASH_PREFIX):
        raise PublicationBuildError("embed hash가 일치하지 않습니다.")
    totalBytes = sum(path.stat().st_size for path in embedRoot.iterdir() if path.is_file())
    return BlockEmbedVerification(
        outputRoot=output,
        embedRoot=embedRoot,
        embedHash=embedHash,
        manifest=manifest,  # type: ignore[arg-type]
        publication=publication,
        fileCount=3 + publication.fileCount,
        totalBytes=totalBytes + publication.totalBytes,
    )


def startBlockEmbedServer(
    outputRoot: str | Path,
    *,
    host: str = "127.0.0.1",
    port: int = 8766,
) -> tuple[ThreadingHTTPServer, str]:
    verified = verifyBlockEmbed(outputRoot)
    handler = partial(
        _BlockEmbedRequestHandler,
        directory=str(verified.outputRoot),
        publicationDirectory=str(verified.publication.bundleRoot),
    )
    server = ThreadingHTTPServer((host, port), handler)
    actualPort = server.server_address[1]
    visibleHost = "127.0.0.1" if host in {"0.0.0.0", "::"} else host
    relative = verified.embedRoot.relative_to(verified.outputRoot).as_posix()
    return server, f"http://{visibleHost}:{actualPort}/{relative}/index.html"


def serveBlockEmbed(
    outputRoot: str | Path,
    *,
    host: str = "127.0.0.1",
    port: int = 8766,
    openBrowser: bool = True,
) -> None:
    server, url = startBlockEmbedServer(outputRoot, host=host, port=port)
    print(f"Serving block embed at {url}")
    if openBrowser:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


class _BlockEmbedRequestHandler(SimpleHTTPRequestHandler):
    def __init__(
        self,
        *args: Any,
        directory: str,
        publicationDirectory: str,
        **kwargs: Any,
    ) -> None:
        self.publicationDirectory = publicationDirectory
        super().__init__(*args, directory=directory, **kwargs)

    def log_message(self, format: str, *args: object) -> None:
        return

    def end_headers(self) -> None:
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Content-Security-Policy", _EMBED_CSP)
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def translate_path(self, path: str) -> str:
        translated = Path(super().translate_path(path)).resolve()
        root = Path(self.directory or ".").resolve()
        if translated.is_relative_to(root) and translated.exists():
            return str(translated)
        requestPath = unquote(urlsplit(path).path).lstrip("/")
        publicationRoot = Path(self.publicationDirectory).resolve()
        publicationTarget = (publicationRoot / requestPath).resolve()
        if publicationTarget.is_relative_to(publicationRoot) and publicationTarget.exists():
            return str(publicationTarget)
        return str(root / ".codaro-not-found")


def _resolveEmbedLoader(webBuildRoot: str | Path | None, configured: str | Path | None) -> Path:
    if configured is not None:
        path = Path(configured).expanduser().resolve()
    else:
        root = (
            Path(webBuildRoot).expanduser().resolve()
            if webBuildRoot is not None
            else Path(os.environ["CODARO_WEB_BUILD_ROOT"]).expanduser().resolve()
            if os.environ.get("CODARO_WEB_BUILD_ROOT")
            else Path(__file__).resolve().parents[1] / "webBuild"
        )
        path = root / "embed" / "codaro-block.js"
    if not path.is_file():
        raise PublicationBuildError(f"block embed loader가 준비되지 않았습니다: {path}")
    return path


def _validateManifest(manifest: dict[str, Any]) -> None:
    required = {
        "schemaVersion", "kind", "protocol", "embedId", "title", "entryBlockId",
        "dependencyBlockIds", "runtimeTarget", "defaultMode", "allowedModes", "framePath",
        "publicationBundleHash", "publicationManifestHash", "sandbox", "loaderHash", "manifestHash",
    }
    if set(manifest) != required or manifest.get("schemaVersion") != 1 or manifest.get("kind") != "codaro.block-embed":
        raise PublicationBuildError("지원하지 않는 embed manifest입니다.")
    if manifest.get("protocol") != {"name": "codaro.embed", "version": 1}:
        raise PublicationBuildError("지원하지 않는 embed protocol입니다.")
    if manifest.get("runtimeTarget") != "browser":
        raise PublicationBuildError("embed runtime target이 browser가 아닙니다.")
    modes = manifest.get("allowedModes")
    if not isinstance(modes, list) or not modes or len(modes) != len(set(modes)):
        raise PublicationBuildError("embed allowedModes가 잘못됐습니다.")
    if any(mode not in _EMBED_MODES for mode in modes) or manifest.get("defaultMode") not in modes:
        raise PublicationBuildError("embed mode 정책이 잘못됐습니다.")
    if manifest.get("sandbox") != list(_SANDBOX):
        raise PublicationBuildError("embed iframe sandbox가 최소 권한 계약과 다릅니다.")
    for field in ("publicationBundleHash", "publicationManifestHash", "loaderHash", "manifestHash"):
        value = manifest.get(field)
        if not isinstance(value, str) or len(value) != 71 or not value.startswith(_HASH_PREFIX):
            raise PublicationBuildError(f"embed {field}가 content hash가 아닙니다.")


def _hostHtml(title: str, mode: BlockEmbedMode) -> str:
    escapedTitle = html.escape(title)
    return (
        "<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\">"
        "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
        f"<title>{escapedTitle}</title><script type=\"module\" src=\"./codaro-block.js\"></script>"
        "<style>html,body{margin:0;min-height:100%;background:#f6f7f9}"
        "body{padding:24px;font-family:system-ui,sans-serif}main{max-width:960px;margin:auto}</style>"
        "</head><body><main>"
        f"<codaro-block src=\"./embed.json\" mode=\"{mode}\" title=\"{escapedTitle}\"></codaro-block>"
        "</main></body></html>"
    )


def _safeRelative(value: Any, field: str) -> str:
    if not isinstance(value, str) or not value or "\\" in value:
        raise PublicationBuildError(f"{field}가 안전한 상대 경로가 아닙니다.")
    pure = PurePosixPath(value)
    if pure.is_absolute() or ".." in pure.parts or ":" in pure.parts[0]:
        raise PublicationBuildError(f"{field}가 안전한 상대 경로가 아닙니다: {value}")
    return pure.as_posix()


def _readJson(path: Path, label: str) -> dict[str, Any]:
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
        raise PublicationBuildError(f"embed 파일이 없습니다: {path}")
    return _contentHash(path.read_bytes())


def _writeCanonicalJson(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(_canonicalBytes(payload))


def _writeJsonAtomically(path: Path, payload: Any) -> None:
    temporary = path.with_name(f".{path.name}.{uuid.uuid4().hex}.tmp")
    temporary.write_bytes(_canonicalBytes(payload))
    os.replace(temporary, path)


def _assertSameFiles(expected: Path, actual: Path) -> None:
    expectedFiles = {
        path.relative_to(expected).as_posix(): _fileHash(path)
        for path in expected.rglob("*") if path.is_file()
    }
    actualFiles = {
        path.relative_to(actual).as_posix(): _fileHash(path)
        for path in actual.rglob("*") if path.is_file()
    }
    if expectedFiles != actualFiles:
        raise PublicationBuildError(f"기존 immutable embed bundle이 손상됐습니다: {actual.name}")


def _removeStaging(staging: Path, embedsRoot: Path) -> None:
    resolved = staging.resolve()
    if resolved.parent != embedsRoot.resolve() or not resolved.name.startswith(".codaro-embed-"):
        raise PublicationBuildError("embed 임시 디렉터리 삭제 경계가 잘못됐습니다.")
    shutil.rmtree(resolved)
