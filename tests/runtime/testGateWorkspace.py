"""Execution cleanup is checked against real child processes and retained reports."""

from concurrent.futures import ThreadPoolExecutor
import importlib.util
import json
import os
from pathlib import Path
import stat
import sys
import threading

import pytest

import gateWorkspace as workspace


def loadRunner():
    path = Path(__file__).resolve().parents[1] / "run.py"
    spec = importlib.util.spec_from_file_location("workspaceTestRunner", path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def testFailureRemovesOnlyOwnedWorkspaceAndKeepsLogs(monkeypatch, tmp_path):
    shared = tmp_path / "shared"
    shared.mkdir()
    other = shared / "otherTask"
    other.mkdir()
    (other / "data.txt").write_text("keep", encoding="utf-8")
    monkeypatch.setattr(workspace, "executionRoot", lambda: shared)
    runner = loadRunner()
    monkeypatch.setattr(runner, "ROOT", tmp_path)
    monkeypatch.setattr(runner, "GATE_WORK_ROOT", tmp_path / "reports")
    code = (
        "import os,pathlib,sys; "
        "root=pathlib.Path(os.environ['CODARO_GATE_WORKSPACE']); "
        "(root/'payload.bin').write_bytes(b'x'*1048576); "
        "print(root, flush=True); sys.exit(3)"
    )
    assert runner.runCommand("unit", runner.GateCommand((sys.executable, "-c", code))) == 3
    assert list(shared.iterdir()) == [other]
    report = next((tmp_path / "reports" / "unit" / "logs").glob("workspace-*.json"))
    payload = json.loads(report.read_text(encoding="utf-8"))
    assert payload["cleaned"] is True
    assert not Path(payload["workspace"]).exists()
    assert any((tmp_path / "reports" / "unit" / "logs").glob("*.log"))
    assert (other / "data.txt").read_text(encoding="utf-8") == "keep"


def testConcurrentGatesHaveSeparateWorkspaces(monkeypatch, tmp_path):
    monkeypatch.setattr(workspace, "executionRoot", lambda: tmp_path / "shared")
    barrier = threading.Barrier(2)

    def execute():
        with workspace.gateWorkspace("same", tmp_path / "reports") as path:
            (path / "data").write_bytes(b"owned")
            barrier.wait(timeout=10)
            assert (path / "data").read_bytes() == b"owned"
            with workspace.gateWorkspace("same", tmp_path / "reports") as nested:
                assert nested == path
            assert path.exists()
        return path

    with ThreadPoolExecutor(max_workers=2) as pool:
        paths = list(pool.map(lambda _: execute(), range(2)))
    assert paths[0] != paths[1]
    assert all(not path.exists() for path in paths)


def testReadOnlyGeneratedFileIsCleaned(monkeypatch, tmp_path):
    monkeypatch.setattr(workspace, "executionRoot", lambda: tmp_path / "shared")
    with workspace.gateWorkspace("readonly", tmp_path / "reports") as path:
        file = path / "package.py"
        file.write_text("pass", encoding="utf-8")
        os.chmod(file, stat.S_IREAD)
    assert not path.exists()


def testLowDiskRefusesWorkBeforeCreatingDirectory(monkeypatch, tmp_path):
    from collections import namedtuple

    disk = namedtuple("DiskUsage", "total used free")
    monkeypatch.setattr(workspace, "executionRoot", lambda: tmp_path / "shared")
    monkeypatch.setattr(workspace.shutil, "disk_usage", lambda _: disk(100 * 1024**3, 99 * 1024**3, 1024**3))
    with pytest.raises(OSError, match="Insufficient space"):
        with workspace.gateWorkspace("blocked", tmp_path / "reports"):
            pytest.fail("low disk must not start work")
    assert list((tmp_path / "shared").iterdir()) == []


def testCleanupRefusesParentAndOutsidePaths(tmp_path):
    shared = tmp_path / "shared"
    shared.mkdir()
    outside = tmp_path / "outside"
    outside.mkdir()
    for target in (shared, outside):
        with pytest.raises(OSError, match="escaped"):
            workspace.removeOwnedWorkspace(target, shared)
    assert shared.exists() and outside.exists()
