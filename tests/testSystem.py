from __future__ import annotations

import asyncio
from pathlib import Path

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


def testListPackages() -> None:
    packages = _run(packageOps.listPackages())

    names = [p.name.lower() for p in packages]
    assert "fastapi" in names or "pydantic" in names
