from __future__ import annotations

import asyncio
import os
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
    InterruptResult,
    ResourceSnapshot,
    VariableDelta,
    VariableState,
)
from .localWorker import runLocalWorker
from .processSupervisor import ProcessSupervisor, ResourceLimits

EXECUTION_TIMEOUT_SECONDS = 300


class LocalEngine(ExecutionEngine):
    def __init__(
        self,
        *,
        workingDirectory: str | Path | None = None,
        workspaceRoot: str | Path | None = None,
        engineId: str | None = None,
        resourceLimits: ResourceLimits | None = None,
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
        self._interruptFlag: mp.Event | None = None
        self._processLock = threading.RLock()
        self._commandLock = threading.Lock()
        self._workerBusy = threading.Event()
        self._interruptCount = 0
        self._resourceLimits = resourceLimits or _defaultResourceLimits()
        self._supervisor = ProcessSupervisor(self._resourceLimits)

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
        cellType: str = "code",
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
            except Exception as exc:  # noqa: BLE001 — event handler must not crash worker
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
                    cellType,
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

    def interrupt(
        self,
        *,
        mode: str = "auto",
        graceMs: int = 250,
    ) -> InterruptResult:
        if not self._workerBusy.is_set():
            return InterruptResult(
                interrupted=False,
                requestedMode=mode,
                appliedMode="none",
                message="No execution in progress.",
            )

        if mode == "soft" or mode == "auto":
            softSuccess = self._trySoftInterrupt(graceMs)
            if softSuccess:
                self.status = "idle"
                return InterruptResult(
                    interrupted=True,
                    requestedMode=mode,
                    appliedMode="soft",
                    preservedState=True,
                    message="Execution interrupted gracefully. State preserved.",
                )
            if mode == "soft":
                return InterruptResult(
                    interrupted=False,
                    requestedMode=mode,
                    appliedMode="none",
                    message="Soft interrupt timed out but hard kill not requested.",
                )

        with self._processLock:
            if self._process is None or not self._process.is_alive():
                return InterruptResult(
                    interrupted=False,
                    requestedMode=mode,
                    appliedMode="none",
                    message="Worker already stopped.",
                )
            self._interruptCount += 1
            self._supervisor.detach()
            self._terminateWorkerLocked()
            self._startWorkerLocked()

        self._registry.clear()
        self._cellDefinitions.clear()
        self._variableStates = []
        self.executionCount = 0
        self.status = "idle"
        return InterruptResult(
            interrupted=True,
            requestedMode=mode,
            appliedMode="hard",
            preservedState=False,
            message="Execution killed. All state lost.",
        )

    def _trySoftInterrupt(self, graceMs: int) -> bool:
        flag = self._interruptFlag
        if flag is None:
            return False
        flag.set()
        deadline = graceMs / 1000.0
        waited = 0.0
        step = 0.05
        while waited < deadline:
            if not self._workerBusy.is_set():
                flag.clear()
                return True
            import time
            time.sleep(step)
            waited += step
        flag.clear()
        return not self._workerBusy.is_set()

    def getResourceUsage(self) -> ResourceSnapshot:
        return self._supervisor.snapshot()

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

    def setUiValue(self, elementId: str, value: Any) -> None:
        """리액티브 위젯 값을 워커 store에 갱신한다(registry/변수 불변, 값만)."""
        if not self._hasLiveWorker():
            return
        try:
            self._sendCommand({"action": "setUiValue", "elementId": elementId, "value": value})
        except (BrokenPipeError, EOFError, OSError):
            self._replaceWorker()

    def reset(self, *, preserveDefinitions: bool = False) -> None:
        if self._hasLiveWorker():
            action = "resetVariables" if preserveDefinitions else "reset"
            try:
                response = self._sendCommand({"action": action})
                self._applyWorkerState(response)
            except (BrokenPipeError, EOFError, OSError):
                self._replaceWorker()
                if not preserveDefinitions:
                    self._registry.clear()
                    self._cellDefinitions.clear()
                self._variableStates = []
                if not preserveDefinitions:
                    self.executionCount = 0
        else:
            if not preserveDefinitions:
                self._registry.clear()
                self._cellDefinitions.clear()
                self.executionCount = 0
            self._variableStates = []
        self.status = "idle"

    def dispose(self) -> None:
        self._supervisor.detach()
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
        cellType: str,
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
                        "cellType": cellType,
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
                crashMessage = self._workerCrashMessage(error)
                self._replaceWorker()
                return {
                    "type": "error",
                    "data": crashMessage,
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
            self._supervisor.heartbeat()
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

    def _workerCrashMessage(self, error: BaseException) -> str:
        process = self._process
        exitCode = process.exitcode if process is not None else None
        errorName = type(error).__name__
        detail = str(error).strip()
        suffix = f"{errorName}: {detail}" if detail else errorName
        if exitCode is not None:
            suffix = f"{suffix}; exitCode={exitCode}"
        return (
            "Engine worker crashed and was restarted. "
            "Run the cell again; if this happened after installing a package, Codaro has refreshed import caches. "
            f"Last IPC error: {suffix}"
        )

    def _ensureWorker(self) -> None:
        with self._processLock:
            self._ensureWorkerLocked()

    def _ensureWorkerLocked(self) -> None:
        if self._process is not None and self._process.is_alive() and self._connection is not None:
            return
        self._startWorkerLocked()

    def _startWorkerLocked(self) -> None:
        parentConnection, childConnection = self._processContext.Pipe()
        interruptFlag = self._processContext.Event()
        process = self._processContext.Process(
            target=runLocalWorker,
            kwargs={
                "connection": childConnection,
                "workingDirectory": str(self._workingDirectory) if self._workingDirectory is not None else None,
                "workspaceRoot": str(self._workspaceRoot),
                "interruptFlag": interruptFlag,
            },
            daemon=True,
        )
        process.start()
        childConnection.close()
        self._connection = parentConnection
        self._process = process
        self._interruptFlag = interruptFlag
        self._supervisor.attach(process)

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
                "shape": variable.shape,
                "dtype": variable.dtype,
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
                shape=str(variable.get("shape", "")),
                dtype=str(variable.get("dtype", "")),
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


def _defaultResourceLimits() -> ResourceLimits:
    # 기본 heartbeat timeout은 셀 실행 hard timeout(300s)의 2배.
    # 정상 셀은 IPC 응답마다 heartbeat 갱신되므로, 600초 이상 무응답인 worker만 좀비로 회수.
    limits = ResourceLimits(heartbeatTimeoutSeconds=600.0)
    raw = os.environ.get("CODARO_WORKER_HEARTBEAT_TIMEOUT")
    if raw:
        try:
            limits.heartbeatTimeoutSeconds = max(0.0, float(raw))
        except ValueError:
            pass
    return limits
