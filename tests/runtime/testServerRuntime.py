from __future__ import annotations

from pathlib import Path

import pytest

import codaro.server as serverModule
from codaro.server import EditorBuildError, getEditorBuildStatus, requireEditorBuildReady, runServer
from codaro.server import resolveWebBuildRoot


def writeEditorBuild(root: Path, index: str = "<html></html>") -> None:
    import hashlib
    import json

    (root / "_app").mkdir(exist_ok=True)
    (root / "index.html").write_text(index, encoding="utf-8")
    payload = {
        "version": 1,
        "generationId": "test-generation",
        "basePath": "/",
        "indexSha256": hashlib.sha256(index.encode("utf-8")).hexdigest(),
        "references": [],
    }
    (root / "build-generation.json").write_text(json.dumps(payload), encoding="utf-8")


def testGetEditorBuildStatusReportsMissingPaths(tmp_path: Path) -> None:
    status = getEditorBuildStatus(tmp_path)

    assert status.status == "missing"
    assert status.indexPath == tmp_path / "index.html"
    assert status.assetsPath == tmp_path / "_app"
    assert status.missingPaths == (
        tmp_path / "index.html",
        tmp_path / "_app",
        tmp_path / "build-generation.json",
    )


def testRequireEditorBuildReadyIncludesBuildInstructions(tmp_path: Path) -> None:
    with pytest.raises(EditorBuildError) as excInfo:
        requireEditorBuildReady(webBuildRoot=tmp_path)

    message = str(excInfo.value)
    assert "npm run build" in message
    assert "index.html" in message


def testGetEditorBuildStatusRejectsMissingHashedChunk(tmp_path: Path) -> None:
    import hashlib
    import json

    index = '<script type="module" src="/_app/index-missing.js"></script>'
    (tmp_path / "_app").mkdir()
    (tmp_path / "index.html").write_text(index, encoding="utf-8")
    (tmp_path / "build-generation.json").write_text(json.dumps({
        "version": 1,
        "generationId": "broken-generation",
        "basePath": "/",
        "indexSha256": hashlib.sha256(index.encode("utf-8")).hexdigest(),
        "references": [{
            "url": "/_app/index-missing.js",
            "path": "_app/index-missing.js",
            "sha256": "0" * 64,
            "contentType": "text/javascript",
        }],
    }), encoding="utf-8")

    status = getEditorBuildStatus(tmp_path)

    assert status.status == "invalid"
    assert status.integrityErrors == ("index.html 참조 파일이 없습니다: _app/index-missing.js",)


def testRunServerRaisesWhenEditorBuildIsMissing(monkeypatch, tmp_path: Path) -> None:
    uvicornCalled = False

    def fakeUvicornRun(*args, **kwargs) -> None:
        del args, kwargs
        nonlocal uvicornCalled
        uvicornCalled = True

    monkeypatch.setattr(serverModule, "WEB_BUILD_ROOT", tmp_path)
    monkeypatch.setattr(serverModule.uvicorn, "run", fakeUvicornRun)

    with pytest.raises(EditorBuildError):
        runServer()

    assert uvicornCalled is False


def testRunServerStartsWithExistingEditorBuild(monkeypatch, tmp_path: Path) -> None:
    writeEditorBuild(tmp_path)

    captured = {}

    def fakeCreateServerApp(**kwargs):
        captured["appArgs"] = kwargs
        return "sentinel-app"

    def fakeUvicornRun(app, host: str, port: int, log_level: str, loop) -> None:
        captured["uvicorn"] = {
            "app": app,
            "host": host,
            "port": port,
            "logLevel": log_level,
            "loop": loop,
        }

    monkeypatch.setattr(serverModule, "WEB_BUILD_ROOT", tmp_path)
    monkeypatch.setattr(serverModule, "createServerApp", fakeCreateServerApp)
    monkeypatch.setattr(serverModule.uvicorn, "run", fakeUvicornRun)

    runServer(host="0.0.0.0", port=9011, mode="edit", documentPath=None, verbose=False)

    assert captured["appArgs"]["mode"] == "edit"
    assert captured["uvicorn"]["app"] == "sentinel-app"
    assert captured["uvicorn"]["host"] == "0.0.0.0"
    assert captured["uvicorn"]["port"] == 9011
    assert captured["uvicorn"]["logLevel"] == "warning"
    assert captured["uvicorn"]["loop"] is serverModule.createServerEventLoop


def testResolveWebBuildRootUsesEnvironmentOverride(monkeypatch, tmp_path: Path) -> None:
    monkeypatch.setenv("CODARO_WEB_BUILD_ROOT", str(tmp_path))

    assert resolveWebBuildRoot() == tmp_path.resolve()
