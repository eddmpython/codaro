from __future__ import annotations

import asyncio
import subprocess
from pathlib import Path

import pytest

from codaro.system import fileOps, packageOps


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testListDirectory(tmp_path: Path) -> None:
    (tmp_path / "file1.txt").write_text("hello")
    (tmp_path / "file2.py").write_text("x = 1")
    (tmp_path / "subdir").mkdir()

    listing = _run(fileOps.listDirectory(str(tmp_path)))

    assert listing.totalFiles == 2
    assert listing.totalDirectories == 1
    names = [e.name for e in listing.entries]
    assert "subdir" in names
    assert "file1.txt" in names


def testReadFile(tmp_path: Path) -> None:
    target = tmp_path / "read_test.txt"
    target.write_text("test content", encoding="utf-8")

    content = _run(fileOps.readFile(str(target)))

    assert content.content == "test content"
    assert content.size > 0


def testWriteFile(tmp_path: Path) -> None:
    target = tmp_path / "nested" / "write_test.txt"

    resultPath = _run(fileOps.writeFile(str(target), "written content"))

    assert Path(resultPath).exists()
    assert Path(resultPath).read_text() == "written content"


def testDeleteFile(tmp_path: Path) -> None:
    target = tmp_path / "delete_me.txt"
    target.write_text("bye")

    _run(fileOps.deleteEntry(str(target)))

    assert not target.exists()


def testMoveFile(tmp_path: Path) -> None:
    source = tmp_path / "source.txt"
    destination = tmp_path / "moved.txt"
    source.write_text("moving")

    _run(fileOps.moveEntry(str(source), str(destination)))

    assert not source.exists()
    assert destination.exists()
    assert destination.read_text() == "moving"


def testCreateDirectory(tmp_path: Path) -> None:
    target = tmp_path / "new_dir" / "nested"

    _run(fileOps.createDirectory(str(target)))

    assert target.exists()
    assert target.is_dir()


def testFileExists(tmp_path: Path) -> None:
    existing = tmp_path / "exists.txt"
    existing.write_text("here")

    assert _run(fileOps.fileExists(str(existing))) is True
    assert _run(fileOps.fileExists(str(tmp_path / "nope.txt"))) is False


def testWorkspaceBoundaryRejectsOutsidePath(tmp_path: Path) -> None:
    outside = tmp_path.parent / "outside.txt"

    with pytest.raises(fileOps.WorkspacePathError):
        _run(fileOps.writeFile(str(outside), "blocked", workspaceRoot=tmp_path))


def testWorkspaceBoundaryAllowsRelativePathInsideWorkspace(tmp_path: Path) -> None:
    resultPath = _run(fileOps.writeFile("nested/inside.txt", "ok", workspaceRoot=tmp_path))

    assert Path(resultPath).resolve() == (tmp_path / "nested" / "inside.txt").resolve()


def testListPackages() -> None:
    packages = _run(packageOps.listPackages())

    names = [p.name.lower() for p in packages]
    assert "fastapi" in names or "pydantic" in names


def testListPackagesUsesProjectPython(monkeypatch, tmp_path: Path) -> None:
    pythonPath = tmp_path / "python.exe"
    pythonPath.write_text("", encoding="utf-8")

    def fakeRun(command, **kwargs):
        del kwargs
        assert command[:3] == [str(pythonPath), "-X", "utf8"]
        return subprocess.CompletedProcess(
            command,
            0,
            stdout='[{"name": "CodaroPkg", "version": "1.2.3"}]',
            stderr="",
        )

    monkeypatch.setattr(packageOps, "getProjectPythonPath", lambda: pythonPath)
    monkeypatch.setattr(packageOps.subprocess, "run", fakeRun)

    packages = _run(packageOps.listPackages())

    assert packages == [packageOps.PackageInfo(name="CodaroPkg", version="1.2.3")]


def testInstallPackageReportsMissingEnvironment(monkeypatch) -> None:
    def fakeProjectPython():
        raise packageOps.PackageEnvironmentError(
            "package_environment_missing",
            "Project virtual environment was not found.",
        )

    monkeypatch.setattr(packageOps, "getProjectPythonPath", fakeProjectPython)

    result = _run(packageOps.installPackage("rich"))

    assert result.success is False
    assert "virtual environment" in result.message


def testInstallPackageReportsTimeout(monkeypatch, tmp_path: Path) -> None:
    pythonPath = tmp_path / "python.exe"
    pythonPath.write_text("", encoding="utf-8")

    monkeypatch.setattr(packageOps, "getProjectPythonPath", lambda: pythonPath)

    def fakeRunUvPip(*args, **kwargs):
        del args, kwargs
        raise subprocess.TimeoutExpired("uv pip install", 180)

    monkeypatch.setattr(packageOps, "runUvPip", fakeRunUvPip)

    result = _run(packageOps.installPackage("rich"))

    assert result.success is False
    assert "timed out" in result.message


def testUninstallPackageUsesProjectPython(monkeypatch, tmp_path: Path) -> None:
    pythonPath = tmp_path / "python.exe"
    pythonPath.write_text("", encoding="utf-8")

    monkeypatch.setattr(packageOps, "getProjectPythonPath", lambda: pythonPath)

    def fakeRunUvPip(command, arguments, *, pythonPath, timeoutSeconds):
        assert command == "uninstall"
        assert arguments == ["rich", "-y"]
        assert timeoutSeconds == 60
        return subprocess.CompletedProcess(["uv"], 0, stdout="Removed rich", stderr="")

    monkeypatch.setattr(packageOps, "runUvPip", fakeRunUvPip)

    result = _run(packageOps.uninstallPackage("rich"))

    assert result.success is True
    assert "Removed rich" in result.message
