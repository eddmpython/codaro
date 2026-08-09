from __future__ import annotations

import base64
import hashlib
import json
from pathlib import Path

import pytest

from codaro.document import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig
from codaro.document.percentFormat import writePercentDocument
from codaro.publication import PublicationBuildError, buildStaticPublication, verifyPublication
import codaro.publication.staticBuilder as staticBuilderModule


def _hash(payload: bytes) -> str:
    return "sha256-" + hashlib.sha256(payload).hexdigest()


def _sri(payload: bytes) -> str:
    return "sha256-" + base64.b64encode(hashlib.sha256(payload).digest()).decode("ascii")


def _shell(root: Path) -> Path:
    shell = root / "webBuild"
    (shell / "_app").mkdir(parents=True)
    (shell / "vendor/pyproc/src").mkdir(parents=True)
    (shell / "vendor/pyodide").mkdir(parents=True)
    (shell / "_app/app.js").write_text("window.codaroStaticFixture = true;", encoding="utf-8")
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
        """<!doctype html><html><head>
<link rel="preconnect" href="https://cdn.example" crossorigin>
<title>Codaro</title><script type="module" src="/_app/app.js"></script>
</head><body><div id="root"></div><script>
const isLocalPreview = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
</script></body></html>""",
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
    path.write_text(
        json.dumps({"version": 1, "packageRoot": f"/{root}", "files": files}),
        encoding="utf-8",
    )


def _document(root: Path, code: str, *, packages: list[str] | None = None) -> Path:
    document = CodaroDocument(
        id="static-publication-fixture",
        title="정적 보고서",
        blocks=[BlockConfig(id="entry", type="code", content=code)],
        metadata=DocumentMetadata(sourceFormat="percent"),
        runtime=RuntimeConfig(packages=packages or []),
        app=AppConfig(title="정적 보고서", entryBlockIds=["entry"]),
    )
    path = root / "app.py"
    path.write_text(writePercentDocument(document), encoding="utf-8")
    return path


def testTwoCleanBuildsReuseSameImmutableBundleAndPreserveSource(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    (workspace / "data.csv").write_text("name,value\na,41\n", encoding="utf-8")
    source = _document(
        workspace,
        "from pathlib import Path\ntext = Path('data.csv').read_text()\nprint(text)",
    )
    sourceBefore = source.read_bytes()
    output = tmp_path / "site"

    first = buildStaticPublication(source, output, webBuildRoot=shell)
    second = buildStaticPublication(source, output, webBuildRoot=shell)

    assert first.bundleHash == second.bundleHash
    assert second.reused is True
    assert source.read_bytes() == sourceBefore
    assert verifyPublication(output).bundleHash == first.bundleHash
    index = first.bundleRoot.joinpath("index.html").read_text(encoding="utf-8")
    assert 'src="./_app/app.js"' in index
    assert "codaro-static-publication" in index
    assert "https://cdn.example" not in index
    assert "const isLocalPreview = true" in index
    assert first.manifest["dataAssets"][0]["sourcePath"] == "data.csv"
    runtimeManifest = json.loads(first.bundleRoot.joinpath("pyodide-assets.json").read_text(encoding="utf-8"))
    assert runtimeManifest["packageRoot"] == "./vendor/pyodide/"
    assert all(item["url"].startswith("./vendor/pyodide/") for item in runtimeManifest["files"])
    assert {item["path"] for item in runtimeManifest["files"]} >= {"pyodide.js", "pyodide.mjs"}


def testChangedSnapshotCreatesNewBundleWithoutMutatingPrevious(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    data = workspace / "data.csv"
    data.write_text("value\n1\n", encoding="utf-8")
    source = _document(workspace, "from pathlib import Path\nprint(Path('data.csv').read_text())")
    output = tmp_path / "site"

    first = buildStaticPublication(source, output, webBuildRoot=shell)
    oldData = next(first.bundleRoot.glob("data/*/data.csv"))
    data.write_text("value\n2\n", encoding="utf-8")
    second = buildStaticPublication(source, output, webBuildRoot=shell)

    assert first.bundleHash != second.bundleHash
    assert oldData.read_text(encoding="utf-8") == "value\n1\n"
    assert verifyPublication(output).bundleHash == second.bundleHash


def testCorruptBundleAndManifestPathTraversalAreRejected(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    source = _document(workspace, "print('ok')")
    output = tmp_path / "site"
    result = buildStaticPublication(source, output, webBuildRoot=shell)
    result.bundleRoot.joinpath("_app/app.js").write_text("corrupt", encoding="utf-8")

    with pytest.raises(PublicationBuildError, match="손상"):
        verifyPublication(output)

    active = json.loads(output.joinpath("active.json").read_text(encoding="utf-8"))
    active["bundlePath"] = "../outside"
    output.joinpath("active.json").write_text(json.dumps(active), encoding="utf-8")
    with pytest.raises(PublicationBuildError, match="상대 경로"):
        verifyPublication(output)


def testUnsupportedTargetReportsExactCompilerBlockerAndKeepsPreviousActive(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    output = tmp_path / "site"
    valid = _document(workspace, "print('ok')")
    previous = buildStaticPublication(valid, output, webBuildRoot=shell)
    blocked = _document(workspace, "import requests\nrequests.get('https://example.com')")

    with pytest.raises(PublicationBuildError, match="NETWORK_REQUIRES_SERVER") as excInfo:
        buildStaticPublication(blocked, output, webBuildRoot=shell)

    assert excInfo.value.diagnostics[0]["sourceSpan"]["startLine"] >= 1
    assert verifyPublication(output).bundleHash == previous.bundleHash


def testPackageWheelMustBeHashedAndStayInsideWorkspace(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    source = _document(workspace, "import sample_pkg\nprint(sample_pkg)", packages=["sample-pkg==1.0"])
    outsideWheel = tmp_path / "sample_pkg-1.0-py3-none-any.whl"
    outsideWheel.write_bytes(b"wheel")
    packageLock = {
        "sample-pkg": {
            "wheelHash": _hash(b"wheel"),
            "wheelPath": str(outsideWheel),
            "tags": ["py3-none-any"],
            "browserSmoke": True,
        }
    }

    with pytest.raises(PublicationBuildError, match="workspace"):
        buildStaticPublication(source, tmp_path / "site", packageLock=packageLock, webBuildRoot=shell)

    insideWheel = workspace / outsideWheel.name
    insideWheel.write_bytes(b"wheel")
    packageLock["sample-pkg"]["wheelPath"] = insideWheel.name
    result = buildStaticPublication(source, tmp_path / "site", packageLock=packageLock, webBuildRoot=shell)
    assert result.manifest["packageAssets"][0]["name"] == "sample-pkg"
    document = json.loads(result.bundleRoot.joinpath("document.json").read_text(encoding="utf-8"))
    assert document["runtime"]["packages"][0].startswith("./packages/")


def testAssetChangeBetweenCompileAndCopyRejectsStaleSnapshot(tmp_path: Path, monkeypatch) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    asset = workspace / "data.csv"
    asset.write_text("value\n1\n", encoding="utf-8")
    source = _document(workspace, "from pathlib import Path\nprint(Path('data.csv').read_text())")
    compileDocument = staticBuilderModule.compileDocument

    def compileThenChange(*args, **kwargs):
        report = compileDocument(*args, **kwargs)
        asset.write_text("value\n2\n", encoding="utf-8")
        return report

    monkeypatch.setattr(staticBuilderModule, "compileDocument", compileThenChange)
    with pytest.raises(PublicationBuildError, match="compile 뒤"):
        buildStaticPublication(source, tmp_path / "site", webBuildRoot=shell)
    assert not (tmp_path / "site/active.json").exists()
