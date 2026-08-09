from __future__ import annotations

import base64
import hashlib
import json
from pathlib import Path

import pytest

from codaro.document import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig
from codaro.document.percentFormat import writePercentDocument
from codaro.publication import PublicationBuildError, buildBlockEmbed, verifyBlockEmbed


ROOT = Path(__file__).resolve().parents[2]


def _sri(payload: bytes) -> str:
    return "sha256-" + base64.b64encode(hashlib.sha256(payload).digest()).decode("ascii")


def _runtimeManifest(path: Path, root: str, names: list[str]) -> None:
    files = []
    for name in names:
        payload = (path.parent / root / name).read_bytes()
        files.append(
            {
                "path": name,
                "url": f"/{root}{name}",
                "integrity": _sri(payload),
                "bytes": len(payload),
                "roles": ["engineScript"] if name == "pyodide.js" else ["engineCore"],
            }
        )
    path.write_text(json.dumps({"version": 1, "packageRoot": f"/{root}", "files": files}), encoding="utf-8")


def _shell(root: Path) -> Path:
    shell = root / "webBuild"
    (shell / "_app").mkdir(parents=True)
    (shell / "embed").mkdir()
    (shell / "vendor/pyproc/src").mkdir(parents=True)
    (shell / "vendor/pyodide").mkdir(parents=True)
    (shell / "_app/app.js").write_text("window.codaroEmbedFixture = true;", encoding="utf-8")
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
        ["pyodide.js", "pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "pyodide-lock.json", "python_stdlib.zip"],
    )
    return shell


def _document(root: Path, *, code: str = "result = source + 1\nresult") -> Path:
    document = CodaroDocument(
        id="embed-fixture",
        title="기능 블록",
        blocks=[
            BlockConfig(id="provider", type="code", content="source = 41"),
            BlockConfig(id="entry", type="code", content=code),
            BlockConfig(id="unrelated", type="code", content="secret_unrelated = 99"),
        ],
        metadata=DocumentMetadata(sourceFormat="percent"),
        runtime=RuntimeConfig(reactiveMode="hybrid"),
        app=AppConfig(title="기능 블록", entryBlockIds=[]),
    )
    path = root / "block.py"
    path.write_text(writePercentDocument(document), encoding="utf-8")
    return path


def testEmbedBuildIsImmutableAndCarriesOnlyEntryDependencyClosure(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    source = _document(workspace)
    output = tmp_path / "embed"

    first = buildBlockEmbed(source, output, entryBlockId="entry", webBuildRoot=shell)
    second = buildBlockEmbed(source, output, entryBlockId="entry", webBuildRoot=shell)
    verified = verifyBlockEmbed(output)

    assert first.embedHash == second.embedHash == verified.embedHash
    assert second.reused is True
    assert verified.manifest["entryBlockId"] == "entry"
    assert verified.manifest["dependencyBlockIds"] == ["provider"]
    assert verified.manifest["sandbox"] == ["allow-scripts", "allow-same-origin"]
    publicationDocument = json.loads(
        verified.publication.bundleRoot.joinpath("document.json").read_text(encoding="utf-8")
    )
    assert [block["id"] for block in publicationDocument["blocks"]] == ["provider", "entry"]
    assert "secret_unrelated" not in json.dumps(publicationDocument)


def testEmbedVerificationRejectsCorruptLoaderAndUnsafeModePolicy(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    source = _document(workspace)

    with pytest.raises(PublicationBuildError, match="allowedModes"):
        buildBlockEmbed(
            source,
            tmp_path / "invalid",
            entryBlockId="entry",
            defaultMode="interactive",
            allowedModes=("output",),
            webBuildRoot=shell,
        )

    result = buildBlockEmbed(source, tmp_path / "valid", entryBlockId="entry", webBuildRoot=shell)
    result.embedRoot.joinpath("codaro-block.js").write_text("corrupt", encoding="utf-8")
    with pytest.raises(PublicationBuildError, match="loader"):
        verifyBlockEmbed(tmp_path / "valid")


def testEmbedRejectsNonBrowserEntryWithoutFallback(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    source = _document(workspace, code="import requests\nrequests.get('https://example.com')")

    with pytest.raises(PublicationBuildError, match="browser") as excInfo:
        buildBlockEmbed(source, tmp_path / "embed", entryBlockId="entry", webBuildRoot=shell)

    assert excInfo.value.diagnostics[0]["code"] == "NETWORK_REQUIRES_SERVER"


def testEmbedMessageSchemaAndRuntimeUseClosedVersionedProtocol() -> None:
    schema = json.loads((ROOT / "contracts/embedMessage.schema.json").read_text(encoding="utf-8"))
    loader = (ROOT / "editor/src/embed/codaroBlock.js").read_text(encoding="utf-8")
    bridge = (ROOT / "editor/src/embed/embedMessage.ts").read_text(encoding="utf-8")

    assert len(schema["oneOf"]) == 4
    assert all(definition["additionalProperties"] is False for name, definition in schema["$defs"].items() if name.endswith("Message"))
    assert 'const PROTOCOL = "codaro.embed"' in loader
    assert "event.source !== current.element.contentWindow" in loader
    assert "event.origin !== current.origin" in loader
    assert 'BLOCK_EMBED_PROTOCOL_VERSION = 1' in bridge
