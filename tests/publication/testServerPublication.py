from __future__ import annotations

import hashlib
import json
from pathlib import Path
import zipfile

from fastapi.testclient import TestClient
import pytest

from codaro.document import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata
from codaro.document.percentFormat import writePercentDocument
from codaro.publication import (
    PublicationBuildError,
    buildServerPublication,
    prepareServerPackageEnvironment,
    rollbackServerPublication,
    verifyServerPublication,
)
from codaro.server import createPublishedServerApp


SECRET_VALUE = "server-secret-canary-987654321"


def _hash(payload: bytes) -> str:
    return "sha256-" + hashlib.sha256(payload).hexdigest()


def _shell(root: Path) -> Path:
    shell = root / "webBuild"
    (shell / "_app").mkdir(parents=True)
    (shell / "_app/app.js").write_text("window.serverPublicationFixture = true;", encoding="utf-8")
    (shell / "index.html").write_text(
        "<!doctype html><html><head><title>Codaro</title></head><body><div id='root'></div><script src='/_app/app.js'></script></body></html>",
        encoding="utf-8",
    )
    return shell


def _document(root: Path, code: str, *, packages: list[str] | None = None) -> Path:
    document = CodaroDocument(
        id="server-publication-fixture",
        title="서버 앱",
        blocks=[BlockConfig(id="entry", type="code", content=code)],
        metadata=DocumentMetadata(sourceFormat="percent"),
        app=AppConfig(title="서버 앱", entryBlockIds=["entry"], statePolicy="perSession"),
    )
    if packages:
        document.runtime.packages = packages
    path = root / "app.py"
    path.write_text(writePercentDocument(document), encoding="utf-8")
    return path


def _serverCode(label: str = "v1") -> str:
    return (
        "import os\n"
        "from pathlib import Path\n"
        "counter_name = ''.join(['counter', '.txt'])\n"
        "counter_path = Path(counter_name)\n"
        "count = int(counter_path.read_text()) + 1 if counter_path.exists() else 1\n"
        "counter_path.write_text(str(count))\n"
        f"print('{label}:' + str(count) + ':' + os.getenv('APP_TOKEN', 'missing') + ':' + "
        "vars(os)['environ'].get('UNDECLARED_CANARY', 'absent'))"
    )


def _wheel(path: Path) -> None:
    distInfo = "sample_pkg-1.0.dist-info"
    with zipfile.ZipFile(path, "w") as archive:
        archive.writestr("sample_pkg/__init__.py", "VALUE = 42\n")
        archive.writestr(f"{distInfo}/METADATA", "Metadata-Version: 2.1\nName: sample-pkg\nVersion: 1.0\n")
        archive.writestr(f"{distInfo}/WHEEL", "Wheel-Version: 1.0\nGenerator: codaro-test\nRoot-Is-Purelib: true\nTag: py3-none-any\n")
        archive.writestr(f"{distInfo}/RECORD", "")


def _runtimeBlocks(code: str) -> list[dict[str, str]]:
    return [{"id": "entry", "type": "code", "content": code}]


def testServerBuildIsImmutableAndRollbackRestoresVerifiedPointer(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    source = _document(workspace, _serverCode("v1"))
    output = tmp_path / "server-app"

    first = buildServerPublication(source, output, webBuildRoot=shell)
    source.write_text(source.read_text(encoding="utf-8").replace("v1:", "v2:"), encoding="utf-8")
    second = buildServerPublication(source, output, webBuildRoot=shell)

    assert first.bundleHash != second.bundleHash
    assert first.manifest["runtime"]["policyHash"] != second.manifest["runtime"]["policyHash"]
    assert first.bundleRoot.is_dir()
    assert verifyServerPublication(output).bundleHash == second.bundleHash

    rolledBack = rollbackServerPublication(output, first.bundleHash)
    assert rolledBack.bundleHash == first.bundleHash
    assert verifyServerPublication(output).bundleHash == first.bundleHash


def testServerBuildRejectsDynamicSecretAndUnverifiedWheel(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    dynamic = _document(workspace, "import os\nname = 'APP_TOKEN'\nprint(os.getenv(name))")
    with pytest.raises(PublicationBuildError, match="동적 secret"):
        buildServerPublication(dynamic, tmp_path / "dynamic", webBuildRoot=shell)

    packageSource = _document(workspace, "import sample_pkg\nprint(sample_pkg)", packages=["sample-pkg==1.0"])
    wheel = workspace / "sample_pkg-1.0-py3-none-any.whl"
    wheel.write_bytes(b"not-a-real-wheel")
    with pytest.raises(PublicationBuildError, match="serverSmoke"):
        buildServerPublication(
            packageSource,
            tmp_path / "package",
            webBuildRoot=shell,
            packageLock={
                "sample-pkg": {
                    "wheelPath": wheel.name,
                    "wheelHash": _hash(wheel.read_bytes()),
                    "tags": ["py3-none-any"],
                    "browserSmoke": True,
                }
            },
        )

    sharedDocument = CodaroDocument(
        id="shared-server-fixture",
        title="공유 서버 앱",
        blocks=[BlockConfig(id="entry", type="code", content="value = 1")],
        metadata=DocumentMetadata(sourceFormat="percent"),
        app=AppConfig(title="공유 서버 앱", entryBlockIds=["entry"], statePolicy="shared"),
    )
    sharedPath = workspace / "shared.py"
    sharedPath.write_text(writePercentDocument(sharedDocument), encoding="utf-8")
    with pytest.raises(PublicationBuildError, match="shared state"):
        buildServerPublication(sharedPath, tmp_path / "shared", webBuildRoot=shell)


def testPublishedServerIsolatesSessionsRejectsSourceChangesAndRedactsSecrets(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    code = _serverCode()
    source = _document(workspace, code)
    output = tmp_path / "server-app"
    result = buildServerPublication(source, output, webBuildRoot=shell)
    assert all(SECRET_VALUE.encode("utf-8") not in path.read_bytes() for path in result.bundleRoot.rglob("*") if path.is_file())

    monkeypatch.setenv("UNDECLARED_CANARY", "must-not-enter-worker")
    app = createPublishedServerApp(output, environment={"APP_TOKEN": SECRET_VALUE})
    runtime = app.state.publicationRuntime
    with TestClient(app) as client:
        firstSession = client.post("/api/kernel/create", json={}).json()["sessionId"]
        secondSession = client.post("/api/kernel/create", json={}).json()["sessionId"]
        payload = {"blocks": _runtimeBlocks(code), "notebookName": "server"}

        firstOne = client.post(f"/api/kernel/{firstSession}/execute-all", json=payload)
        firstTwo = client.post(f"/api/kernel/{firstSession}/execute-all", json=payload)
        secondOne = client.post(f"/api/kernel/{secondSession}/execute-all", json=payload)

        assert firstOne.status_code == 200
        assert "v1:1:[redacted]:absent" in firstOne.text
        assert "v1:2:[redacted]:absent" in firstTwo.text
        assert "v1:1:[redacted]:absent" in secondOne.text
        assert SECRET_VALUE not in firstOne.text + firstTwo.text + secondOne.text
        assert runtime._sessionPaths[firstSession] != runtime._sessionPaths[secondSession]

        modified = {"blocks": _runtimeBlocks("print('changed')"), "notebookName": "server"}
        rejected = client.post(f"/api/kernel/{firstSession}/execute-all", json=modified)
        assert rejected.status_code == 409
        assert client.post("/api/document/save", json={}).status_code == 404
        assert client.get("/api/terminal/sessions").status_code == 404

        firstWorker = runtime.sessionManager.getSession(firstSession)._engine._process
        assert firstWorker is not None
        firstWorker.kill()
        firstWorker.join(timeout=5)
        crashed = client.post(f"/api/kernel/{firstSession}/execute-all", json=payload)
        survivor = client.post(f"/api/kernel/{secondSession}/execute-all", json=payload)
        assert crashed.status_code == 200
        assert "v1:3:[redacted]:absent" in crashed.text
        replacementWorker = runtime.sessionManager.getSession(firstSession)._engine._process
        assert replacementWorker is not None and replacementWorker.pid != firstWorker.pid
        assert "v1:2:[redacted]:absent" in survivor.text
        assert client.get("/api/health").json()["status"] == "ok"

        firstPath = runtime._sessionPaths[firstSession]
        assert client.delete(f"/api/kernel/{firstSession}").json() == {"destroyed": True}
        assert not firstPath.exists()
    assert SECRET_VALUE not in caplog.text


def testServerPackageEnvironmentIsOfflineAndSelfVerifying(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    source = _document(workspace, "import sample_pkg\nprint(sample_pkg.VALUE)", packages=["sample-pkg==1.0"])
    wheel = workspace / "sample_pkg-1.0-py3-none-any.whl"
    _wheel(wheel)
    output = tmp_path / "server-app"
    built = buildServerPublication(
        source,
        output,
        webBuildRoot=shell,
        packageLock={
            "sample-pkg": {
                "wheelPath": wheel.name,
                "wheelHash": _hash(wheel.read_bytes()),
                "serverSmoke": True,
            }
        },
    )

    environment = prepareServerPackageEnvironment(verifyServerPublication(output))
    assert environment is not None
    installed = environment / "sample_pkg/__init__.py"
    assert "VALUE = 42" in installed.read_text(encoding="utf-8")
    installed.write_text("VALUE = -1\n", encoding="utf-8")

    repaired = prepareServerPackageEnvironment(verifyServerPublication(output))
    assert repaired == environment
    assert "VALUE = 42" in installed.read_text(encoding="utf-8")
    assert built.bundleRoot.joinpath("wheelhouse").is_dir()


def testPublishedServerBlocksFilesystemOutsideSessionWorkspace(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    code = (
        "from pathlib import Path\n"
        "outside = Path.cwd().parent / 'escape.txt'\n"
        "outside.write_text('must-not-exist')"
    )
    source = _document(workspace, code)
    output = tmp_path / "server-app"
    buildServerPublication(source, output, webBuildRoot=shell)
    app = createPublishedServerApp(output)

    with TestClient(app) as client:
        sessionId = client.post("/api/kernel/create", json={}).json()["sessionId"]
        response = client.post(
            f"/api/kernel/{sessionId}/execute-all",
            json={"blocks": _runtimeBlocks(code), "notebookName": "server"},
        )
        assert response.status_code == 200
        assert "outside the workspace" in response.text
        sessionPath = app.state.publicationRuntime._sessionPaths[sessionId]
        assert not sessionPath.parent.joinpath("escape.txt").exists()


def testServerCorruptionAndPathTraversalAreRejectedBeforeStartup(tmp_path: Path) -> None:
    shell = _shell(tmp_path)
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    source = _document(workspace, _serverCode())
    output = tmp_path / "server-app"
    result = buildServerPublication(source, output, webBuildRoot=shell)
    result.bundleRoot.joinpath("shell/_app/app.js").write_text("corrupt", encoding="utf-8")
    with pytest.raises(PublicationBuildError, match="손상"):
        verifyServerPublication(output)

    active = json.loads(output.joinpath("active.json").read_text(encoding="utf-8"))
    active["bundlePath"] = "../outside"
    output.joinpath("active.json").write_text(json.dumps(active), encoding="utf-8")
    with pytest.raises(PublicationBuildError, match="상대 경로"):
        verifyServerPublication(output)
