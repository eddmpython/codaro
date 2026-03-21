from __future__ import annotations

import asyncio
from concurrent.futures import ThreadPoolExecutor
from multiprocessing.connection import Connection
import multiprocessing as mp
from pathlib import Path
import threading
from typing import Any, Sequence
import uuid

from ..system import fileOps, packageOps
from .executionEngine import (
    ExecutionBlock,
    ExecutionEngine,
    ExecutionEvent,
    ExecutionResult,
    VariableDelta,
    VariableState,
)
from .localWorker import runLocalWorker

EXECUTION_TIMEOUT_SECONDS = 300


class LocalEngine(ExecutionEngine):
    def __init__(
        self,
        *,
        workingDirectory: str | Path | None = None,
        workspaceRoot: str | Path | None = None,
        engineId: str | None = None,
    ) -> None:
        self.engineId = engineId or f"engine-{uuid.uuid4().hex[:10]}"
        self.executionCount = 0
        self.status = "idle"
        self._workspaceRoot = _resolvePath(workspaceRoot) or Path.cwd().resolve()
        self._workingDirectory = _resolvePath(workingDirectory)
        self._ipcExecutor = ThreadPoolExecutor(max_workers=1, thread_name_prefix=f"engine-ipc-{self.engineId[:8]}")
        self._processContext = mp.get_context("spawn")
        self._process: mp.Process | None = None
        self._connection: Connection | None = None
        self._processLock = threading.RLock()
        self._commandLock = threading.Lock()
        self._workerBusy = threading.Event()
        self._interruptCount = 0

        self._registry: dict[str, object] = {}
        self._cellDefinitions: dict[str, set[str]] = {}
        self._variableStates: list[VariableState] = []

    async def initialize(self) -> None:
        self._ensureWorker()

    async def executeBlock(
        self,
        code: str,
        *,
        blockId: str | None = None,
        injectedVars: list[str] | None = None,
        eventHandler=None,
    ) -> ExecutionResult:
        loop = asyncio.get_running_loop()
        self.status = "busy"
        self._workerBusy.set()
        startInterruptCount = self._interruptCount
        collectedEvents: list[ExecutionEvent] = []

        def emitEvent(eventPayload: dict[str, Any]) -> None:
            event = self._deserializeExecutionEvent(eventPayload)
            collectedEvents.append(event)
            if eventHandler is None:
                return
            try:
                future = asyncio.run_coroutine_threadsafe(eventHandler(event), loop)
                future.result()
            except Exception as exc:
                import logging
                logging.getLogger("codaro.runtime").warning("Event handler failed: %s", exc)
                return

        try:
            response = await asyncio.wait_for(
                loop.run_in_executor(
                    self._ipcExecutor,
                    self._executeBlocking,
                    code,
                    blockId,
                    injectedVars,
                    startInterruptCount,
                    emitEvent,
                ),
                timeout=EXECUTION_TIMEOUT_SECONDS,
            )
        except asyncio.TimeoutError:
            self.interrupt()
            response = {
                "type": "error",
                "data": f"Execution timed out after {EXECUTION_TIMEOUT_SECONDS} seconds.",
                "stdout": "",
                "stderr": "",
                "status": "error",
                "variables": [],
                "stateDelta": {"added": [], "updated": [], "removed": []},
                "registryMirror": {},
                "cellDefinitions": {},
                "executionCount": self.executionCount,
            }
        finally:
            self.status = "idle"
            self._workerBusy.clear()

        self._applyWorkerState(response)
        stateDelta = self._deserializeVariableDelta(response.get("stateDelta", {}))
        return ExecutionResult(
            type=str(response.get("type", "text")),
            data=response.get("data", ""),
            stdout=str(response.get("stdout", "")),
            stderr=str(response.get("stderr", "")),
            variables=self.getVariables(),
            stateDelta=stateDelta,
            events=collectedEvents,
            executionCount=self.executionCount,
            status=str(response.get("status", "done")),
        )

    async def executeAll(self, blocks: Sequence[ExecutionBlock]) -> list[ExecutionResult]:
        results: list[ExecutionResult] = []
        for block in blocks:
            result = await self.executeBlock(
                block.code,
                blockId=block.blockId,
                injectedVars=block.injectedVars,
            )
            results.append(result)
            if result.status == "error":
                break
        return results

    def interrupt(self) -> bool:
        if not self._workerBusy.is_set():
            return False

        with self._processLock:
            if self._process is None or not self._process.is_alive():
                return False
            self._interruptCount += 1
            self._terminateWorkerLocked()
            self._startWorkerLocked()

        self._registry.clear()
        self._cellDefinitions.clear()
        self._variableStates = []
        self.executionCount = 0
        self.status = "idle"
        return True

    def getVariables(self) -> list[VariableState]:
        return list(self._variableStates)

    async def getFiles(self, path: str = ".") -> fileOps.DirectoryListing:
        return await fileOps.listDirectory(path, workspaceRoot=self._workspaceRoot)

    async def readFile(self, path: str, *, encoding: str = "utf-8") -> fileOps.FileContent:
        return await fileOps.readFile(path, encoding=encoding, workspaceRoot=self._workspaceRoot)

    async def writeFile(
        self,
        path: str,
        content: str,
        *,
        encoding: str = "utf-8",
        createDirectories: bool = True,
    ) -> str:
        return await fileOps.writeFile(
            path,
            content,
            encoding=encoding,
            createDirectories=createDirectories,
            workspaceRoot=self._workspaceRoot,
        )

    async def deleteEntry(self, path: str) -> str:
        return await fileOps.deleteEntry(path, workspaceRoot=self._workspaceRoot)

    async def moveEntry(self, sourcePath: str, destinationPath: str) -> str:
        return await fileOps.moveEntry(sourcePath, destinationPath, workspaceRoot=self._workspaceRoot)

    async def createDirectory(self, path: str) -> str:
        return await fileOps.createDirectory(path, workspaceRoot=self._workspaceRoot)

    async def fileExists(self, path: str) -> bool:
        return await fileOps.fileExists(path, workspaceRoot=self._workspaceRoot)

    async def listPackages(self) -> list[packageOps.PackageInfo]:
        return await packageOps.listPackages()

    async def installPackage(self, packageName: str) -> packageOps.InstallResult:
        return await packageOps.installPackage(packageName)

    async def uninstallPackage(self, packageName: str) -> packageOps.InstallResult:
        return await packageOps.uninstallPackage(packageName)

    def removeBlockDefinitions(self, blockId: str) -> None:
        if not self._hasLiveWorker():
            self._cellDefinitions.pop(blockId, None)
            return

        try:
            response = self._sendCommand({"action": "removeDefinitions", "blockId": blockId})
            self._applyWorkerState(response)
        except (BrokenPipeError, EOFError, OSError):
            self._replaceWorker()
            self._cellDefinitions.pop(blockId, None)

    def reset(self) -> None:
        if self._hasLiveWorker():
            try:
                response = self._sendCommand({"action": "reset"})
                self._applyWorkerState(response)
            except (BrokenPipeError, EOFError, OSError):
                self._replaceWorker()
                self._registry.clear()
                self._cellDefinitions.clear()
                self._variableStates = []
                self.executionCount = 0
        else:
            self._registry.clear()
            self._cellDefinitions.clear()
            self._variableStates = []
            self.executionCount = 0
        self.status = "idle"

    def dispose(self) -> None:
        with self._processLock:
            self._shutdownWorkerLocked()
        self._registry.clear()
        self._cellDefinitions.clear()
        self._variableStates = []
        self._ipcExecutor.shutdown(wait=False)

    def _executeBlocking(
        self,
        code: str,
        blockId: str | None,
        injectedVars: list[str] | None,
        startInterruptCount: int,
        eventSink,
    ) -> dict[str, Any]:
        with self._commandLock:
            try:
                return self._sendCommand(
                    {
                        "action": "execute",
                        "code": code,
                        "blockId": blockId,
                        "injectedVars": injectedVars,
                    },
                    eventSink=eventSink,
                )
            except (BrokenPipeError, EOFError, OSError) as error:
                if self._interruptCount != startInterruptCount:
                    return {
                        "type": "error",
                        "data": "Execution interrupted.",
                        "stdout": "",
                        "stderr": "",
                        "status": "error",
                        "variables": [],
                        "stateDelta": {
                            "added": [],
                            "updated": [],
                            "removed": [],
                        },
                        "registryMirror": {},
                        "cellDefinitions": {},
                        "executionCount": 0,
                    }
                self._replaceWorker()
                return {
                    "type": "error",
                        "data": f"Engine worker crashed: {error}",
                        "stdout": "",
                        "stderr": "",
                        "status": "error",
                        "variables": self._serializeVariables(self._variableStates),
                        "stateDelta": {
                            "added": [],
                            "updated": [],
                            "removed": [],
                        },
                        "registryMirror": dict(self._registry),
                        "cellDefinitions": {block: sorted(defines) for block, defines in self._cellDefinitions.items()},
                        "executionCount": self.executionCount,
                    }

    def _sendCommand(self, command: dict[str, Any], *, eventSink=None) -> dict[str, Any]:
        with self._processLock:
            self._ensureWorkerLocked()
            connection = self._connection

        if connection is None:
            raise RuntimeError("Engine worker connection is not available.")

        connection.send(command)
        while True:
            response = connection.recv()
            if isinstance(response, dict) and response.get("kind") == "event":
                if eventSink is not None:
                    eventSink(dict(response.get("event", {})))
                continue
            if isinstance(response, dict) and response.get("kind") == "response":
                response = response.get("response", {})
            if isinstance(response, dict) and response.get("error"):
                raise RuntimeError(str(response["error"]))
            return response

    def _replaceWorker(self) -> None:
        with self._processLock:
            self._terminateWorkerLocked()
            self._startWorkerLocked()

    def _ensureWorker(self) -> None:
        with self._processLock:
            self._ensureWorkerLocked()

    def _ensureWorkerLocked(self) -> None:
        if self._process is not None and self._process.is_alive() and self._connection is not None:
            return
        self._startWorkerLocked()

    def _startWorkerLocked(self) -> None:
        parentConnection, childConnection = self._processContext.Pipe()
        process = self._processContext.Process(
            target=runLocalWorker,
            kwargs={
                "connection": childConnection,
                "workingDirectory": str(self._workingDirectory) if self._workingDirectory is not None else None,
                "workspaceRoot": str(self._workspaceRoot),
            },
            daemon=True,
        )
        process.start()
        childConnection.close()
        self._connection = parentConnection
        self._process = process

    def _shutdownWorkerLocked(self) -> None:
        if self._process is None:
            return

        connection = self._connection
        process = self._process

        try:
            if connection is not None and process.is_alive():
                connection.send({"action": "shutdown"})
                connection.recv()
        except (OSError, EOFError, BrokenPipeError):
            pass
        finally:
            self._terminateWorkerLocked()

    def _terminateWorkerLocked(self) -> None:
        connection = self._connection
        process = self._process

        self._connection = None
        self._process = None

        if connection is not None:
            try:
                connection.close()
            except OSError:
                pass

        if process is None:
            return

        if process.is_alive():
            process.terminate()
            process.join(timeout=1)
            if process.is_alive():
                process.kill()
                process.join(timeout=1)
        else:
            process.join(timeout=1)

    def _hasLiveWorker(self) -> bool:
        with self._processLock:
            return self._process is not None and self._process.is_alive() and self._connection is not None

    def _applyWorkerState(self, response: dict[str, Any]) -> None:
        self.executionCount = int(response.get("executionCount", self.executionCount))
        self._registry.clear()
        self._registry.update(dict(response.get("registryMirror", {})))
        self._cellDefinitions.clear()
        self._cellDefinitions.update(
            {
                blockId: set(defines)
                for blockId, defines in response.get("cellDefinitions", {}).items()
            }
        )
        self._variableStates = self._deserializeVariables(response.get("variables", []))

    def _serializeVariables(self, variables: list[VariableState]) -> list[dict[str, object]]:
        return [
            {
                "name": variable.name,
                "typeName": variable.typeName,
                "repr": variable.repr,
                "size": variable.size,
            }
            for variable in variables
        ]

    def _deserializeVariables(self, variables: list[dict[str, object]]) -> list[VariableState]:
        return [
            VariableState(
                name=str(variable.get("name", "")),
                typeName=str(variable.get("typeName", "")),
                repr=str(variable.get("repr", "")),
                size=variable.get("size"),
            )
            for variable in variables
        ]

    def _deserializeVariableDelta(self, payload: dict[str, Any]) -> VariableDelta:
        return VariableDelta(
            added=self._deserializeVariables(payload.get("added", [])),
            updated=self._deserializeVariables(payload.get("updated", [])),
            removed=[str(name) for name in payload.get("removed", [])],
        )

    def _deserializeExecutionEvent(self, payload: dict[str, Any]) -> ExecutionEvent:
        return ExecutionEvent(
            sequence=int(payload.get("sequence", 0)),
            eventType=str(payload.get("eventType", "")),
            blockId=payload.get("blockId"),
            executionCount=int(payload.get("executionCount", 0)),
            payload=payload.get("payload"),
        )


def _resolvePath(pathLike: str | Path | None) -> Path | None:
    if pathLike is None:
        return None
    return Path(pathLike).expanduser().resolve()
