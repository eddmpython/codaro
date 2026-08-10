from __future__ import annotations

import json
from pathlib import Path
import shutil
import subprocess
import sys

from fastapi.testclient import TestClient

import pytest

from codaro.publication import (
    PublicationBuildError,
    buildLocalPublication,
    rollbackLocalPublication,
    verifyLocalPublication,
)
from codaro.server import createPublishedLocalApp


ROOT = Path(__file__).resolve().parents[2]


def _shell(root: Path) -> Path:
    shell = root / "webBuild"
    (shell / "_app").mkdir(parents=True)
    (shell / "_app/app.js").write_text("window.localPublicationFixture = true;", encoding="utf-8")
    (shell / "index.html").write_text(
        "<!doctype html><html><head><title>Codaro</title></head>"
        "<body><div id='root'></div><script src='/_app/app.js'></script></body></html>",
        encoding="utf-8",
    )
    return shell


def testLocalPublicationBuildsServesAndCreatesSemanticArtifact(tmp_path: Path) -> None:
    source = ROOT / "examples/apps/local-file-automation/app.py"
    output = tmp_path / "local-app"
    built = buildLocalPublication(source, output, webBuildRoot=_shell(tmp_path))
    verified = verifyLocalPublication(output)

    assert verified.bundleHash == built.bundleHash
    policyHash = str(verified.manifest["runtime"]["policyHash"])
    app = createPublishedLocalApp(output, approvedPolicyHash=policyHash)
    runtime = app.state.publicationRuntime
    with TestClient(app) as client:
        sessionId = client.post("/api/kernel/create", json={}).json()["sessionId"]
        response = client.post(
            f"/api/kernel/{sessionId}/execute-all",
            json={"blocks": runtime.expectedBlocks, "notebookName": "local"},
        )
        assert response.status_code == 200, response.text
        assert "재고 자동화 완료: 4개 품목, 부족 2개" in response.text
        artifact = runtime._sessionPaths[sessionId] / "artifacts/inventory-report.json"
        assert json.loads(artifact.read_text(encoding="utf-8")) == {
            "itemCount": 4,
            "lowStockCount": 2,
            "lowStockItems": ["모니터", "마우스"],
            "status": "attention",
        }
        assert client.post("/api/document/save", json={}).status_code == 404
        assert client.get("/api/terminal/sessions").status_code == 404


def testLocalPublicationIsImmutableRejectsTamperAndRollsBack(tmp_path: Path) -> None:
    workspace = tmp_path / "workspace"
    shutil.copytree(ROOT / "examples/apps/local-file-automation", workspace)
    source = workspace / "app.py"
    output = tmp_path / "local-app"
    shell = _shell(tmp_path)
    workspaceHash = _treeHash(workspace)

    first = buildLocalPublication(source, output, webBuildRoot=shell)
    assert _treeHash(workspace) == workspaceHash
    source.write_text(source.read_text(encoding="utf-8").replace("재고 자동화 완료", "재고 자동화 v2"), encoding="utf-8")
    second = buildLocalPublication(source, output, webBuildRoot=shell)
    assert second.bundleHash != first.bundleHash
    assert verifyLocalPublication(output).bundleHash == second.bundleHash
    assert rollbackLocalPublication(output, first.bundleHash).bundleHash == first.bundleHash

    verified = verifyLocalPublication(output)
    documentPath = verified.bundleRoot / str(verified.manifest["documentPath"])
    originalDocument = documentPath.read_bytes()
    documentPath.write_bytes(originalDocument + b"\n# tamper\n")
    with pytest.raises(PublicationBuildError, match="손상"):
        verifyLocalPublication(output)
    documentPath.write_bytes(originalDocument)

    manifestPath = verified.bundleRoot / "publication.json"
    originalManifest = manifestPath.read_bytes()
    manifest = json.loads(originalManifest)
    manifest["runtime"]["policyHash"] = "sha256-" + "0" * 64
    manifestPath.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    with pytest.raises(PublicationBuildError, match="policy hash"):
        verifyLocalPublication(output)
    manifestPath.write_bytes(originalManifest)


def testLocalPublicationCliBuildVerifyAndRollback(tmp_path: Path) -> None:
    workspace = tmp_path / "workspace"
    shutil.copytree(ROOT / "examples/apps/local-file-automation", workspace)
    source = workspace / "app.py"
    output = tmp_path / "local-cli"

    first = _cliJson("build", str(source), "--target", "local", "--output", str(output), "--json")
    source.write_text(source.read_text(encoding="utf-8").replace("재고 자동화 완료", "재고 자동화 v2"), encoding="utf-8")
    second = _cliJson("build", str(source), "--target", "local", "--output", str(output), "--json")
    assert first["bundleHash"] != second["bundleHash"]
    assert _cliJson("verify", str(output), "--target", "local", "--json")["bundleHash"] == second["bundleHash"]
    rolledBack = subprocess.run(
        [
            sys.executable,
            "-X",
            "utf8",
            "-m",
            "codaro.cli",
            "rollback",
            str(output),
            str(first["bundleHash"]),
            "--target",
            "local",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=120,
        check=False,
    )
    assert rolledBack.returncode == 0, rolledBack.stderr or rolledBack.stdout
    assert _cliJson("verify", str(output), "--target", "local", "--json")["bundleHash"] == first["bundleHash"]


def _treeHash(root: Path) -> list[tuple[str, bytes]]:
    return [
        (path.relative_to(root).as_posix(), path.read_bytes())
        for path in sorted(root.rglob("*"))
        if path.is_file()
    ]


def _cliJson(*arguments: str) -> dict[str, object]:
    completed = subprocess.run(
        [sys.executable, "-X", "utf8", "-m", "codaro.cli", *arguments],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=120,
        check=False,
    )
    assert completed.returncode == 0, completed.stderr or completed.stdout
    return json.loads(completed.stdout)
