from __future__ import annotations

import asyncio
from pathlib import Path

from codaro.runtime import ExecutionBlock, LocalEngine
from codaro.system import packageOps


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testLocalEngineExecuteBlock() -> None:
    engine = LocalEngine()
    result = _run(engine.executeBlock("value = 21\nvalue * 2", blockId="b1"))

    assert result.status == "done"
    assert result.data == "42"
    assert result.executionCount == 1
    assert any(variable.name == "value" for variable in result.variables)

    engine.dispose()


def testLocalEngineExecuteAllStopsOnError() -> None:
    engine = LocalEngine()
    blocks = [
        ExecutionBlock(code="x = 1", blockId="b1"),
        ExecutionBlock(code="y = x / 0", blockId="b2", injectedVars=["x"]),
        ExecutionBlock(code="z = 99", blockId="b3"),
    ]

    results = _run(engine.executeAll(blocks))

    assert len(results) == 2
    assert results[0].status == "done"
    assert results[1].status == "error"
    assert "z" not in engine._registry

    engine.dispose()


def testLocalEngineUsesWorkspaceRootForFiles(tmp_path: Path) -> None:
    engine = LocalEngine(workspaceRoot=tmp_path)

    writtenPath = _run(engine.writeFile("notes/test.txt", "hello runtime"))
    listing = _run(engine.getFiles("notes"))
    content = _run(engine.readFile("notes/test.txt"))

    assert Path(writtenPath).resolve() == (tmp_path / "notes" / "test.txt").resolve()
    assert [entry.name for entry in listing.entries] == ["test.txt"]
    assert content.content == "hello runtime"

    engine.dispose()


def testLocalEngineInstallPackageDelegates(monkeypatch, tmp_path: Path) -> None:
    engine = LocalEngine(workspaceRoot=tmp_path)

    async def fakeInstallPackage(name: str):
        return packageOps.InstallResult(package=name, success=True, message="installed")

    monkeypatch.setattr(packageOps, "installPackage", fakeInstallPackage)

    result = _run(engine.installPackage("rich"))

    assert result == packageOps.InstallResult(package="rich", success=True, message="installed")

    engine.dispose()


def testLocalEngineListPackagesDelegates(monkeypatch, tmp_path: Path) -> None:
    engine = LocalEngine(workspaceRoot=tmp_path)

    async def fakeListPackages():
        return [packageOps.PackageInfo(name="CodaroPkg", version="1.2.3")]

    monkeypatch.setattr(packageOps, "listPackages", fakeListPackages)

    packages = _run(engine.listPackages())

    assert packages == [packageOps.PackageInfo(name="CodaroPkg", version="1.2.3")]

    engine.dispose()
