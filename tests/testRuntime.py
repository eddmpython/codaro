from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import time

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
    assert any(variable.name == "value" for variable in result.stateDelta.added)
    assert [event.eventType for event in result.events] == ["started", "display", "stateDelta", "finished"]

    engine.dispose()


def testLocalEngineStreamsExecutionEvents() -> None:
    engine = LocalEngine()

    result = _run(
        engine.executeBlock(
            "import sys\nvalue = 3\nprint('out')\nprint('err', file=sys.stderr)\nvalue * 2",
            blockId="stream",
        )
    )

    eventTypes = [event.eventType for event in result.events]
    stdoutText = "".join(
        str(event.payload["text"])
        for event in result.events
        if event.eventType == "stdout"
    )
    stderrText = "".join(
        str(event.payload["text"])
        for event in result.events
        if event.eventType == "stderr"
    )
    displayEvent = next(event for event in result.events if event.eventType == "display")

    assert eventTypes[0] == "started"
    assert eventTypes[-1] == "finished"
    assert stdoutText == "out\n"
    assert stderrText == "err\n"
    assert displayEvent.payload == {"outputType": "text", "data": "6"}
    assert result.stateDelta.added == [
        result.variables[0]
    ]
    assert [event.sequence for event in result.events] == list(range(1, len(result.events) + 1))

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


def testLocalEngineSupportsDirectoryLifecycle(tmp_path: Path) -> None:
    engine = LocalEngine(workspaceRoot=tmp_path)

    createdPath = _run(engine.createDirectory("workspace/data"))
    existsAfterCreate = _run(engine.fileExists("workspace/data"))
    movedPath = _run(engine.moveEntry("workspace/data", "workspace/archive"))
    existsAfterMove = _run(engine.fileExists("workspace/archive"))
    deletedPath = _run(engine.deleteEntry("workspace/archive"))
    existsAfterDelete = _run(engine.fileExists("workspace/archive"))

    assert Path(createdPath).resolve() == (tmp_path / "workspace" / "data").resolve()
    assert existsAfterCreate is True
    assert Path(movedPath).resolve() == (tmp_path / "workspace" / "archive").resolve()
    assert existsAfterMove is True
    assert Path(deletedPath).resolve() == (tmp_path / "workspace" / "archive").resolve()
    assert existsAfterDelete is False

    engine.dispose()


def testLocalEngineInterruptRespawnsWorker() -> None:
    engine = LocalEngine()

    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(_run, engine.executeBlock("while True:\n    pass", blockId="loop"))
        time.sleep(0.2)

        assert engine.interrupt() is True

        interruptedResult = future.result(timeout=10)

    assert interruptedResult.status == "error"
    assert interruptedResult.data == "Execution interrupted."

    recoveryResult = _run(engine.executeBlock("value = 5\nvalue", blockId="after"))
    assert recoveryResult.status == "done"
    assert recoveryResult.data == "5"

    engine.dispose()


def testLocalEngineDoesNotChangeParentCwd(tmp_path: Path) -> None:
    engineDir = tmp_path / "engine"
    engineDir.mkdir()
    originalCwd = Path.cwd().resolve()
    engine = LocalEngine(workingDirectory=engineDir)

    result = _run(engine.executeBlock("import os\nos.getcwd()", blockId="cwd"))

    assert Path(result.data.strip("'")).resolve() == engineDir.resolve()
    assert Path.cwd().resolve() == originalCwd

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
