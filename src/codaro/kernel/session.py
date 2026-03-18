from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable

from ..runtime import ExecutionEvent as RuntimeExecutionEvent
from ..runtime import LocalEngine, VariableDelta as RuntimeVariableDelta, VariableState
from ..system.fileOps import DirectoryListing, FileContent
from ..system.packageOps import InstallResult, PackageInfo
from .protocol import ExecutionEvent, ExecutionOutput, VariableDelta, VariableInfo


class KernelSession:
    def __init__(
        self,
        sessionId: str | None = None,
        workingDirectory: str | None = None,
        workspaceRoot: str | None = None,
    ):
        self.sessionId = sessionId or f"session-{uuid.uuid4().hex[:10]}"
        self._engine = LocalEngine(
            workingDirectory=workingDirectory,
            workspaceRoot=workspaceRoot,
            engineId=self.sessionId,
        )
        self._registry = self._engine._registry
        self._cellDefinitions = self._engine._cellDefinitions

    @property
    def executionCount(self) -> int:
        return self._engine.executionCount

    @property
    def status(self) -> str:
        return self._engine.status

    async def execute(
        self,
        code: str,
        blockId: str | None = None,
        injectedVars: list[str] | None = None,
        eventHandler: Callable[[ExecutionEvent], Awaitable[None]] | None = None,
    ) -> ExecutionOutput:
        engineEventHandler = None
        if eventHandler is not None:
            async def engineEventHandler(event: RuntimeExecutionEvent) -> None:
                await eventHandler(self._convertEvent(event))

        result = await self._engine.executeBlock(
            code,
            blockId=blockId,
            injectedVars=injectedVars,
            eventHandler=engineEventHandler,
        )
        return ExecutionOutput(
            type=result.type,
            blockId=blockId,
            data=result.data,
            stdout=result.stdout,
            stderr=result.stderr,
            variables=self._collectVariables(result.variables),
            stateDelta=self._convertVariableDelta(result.stateDelta),
            events=[self._convertEvent(event) for event in result.events],
            executionCount=result.executionCount,
            status=result.status,
        )

    def removeCellDefinitions(self, blockId: str) -> None:
        self._engine.removeBlockDefinitions(blockId)

    def interrupt(self) -> bool:
        return self._engine.interrupt()

    async def getFiles(self, path: str = ".") -> DirectoryListing:
        return await self._engine.getFiles(path)

    async def readFile(self, path: str, *, encoding: str = "utf-8") -> FileContent:
        return await self._engine.readFile(path, encoding=encoding)

    async def writeFile(
        self,
        path: str,
        content: str,
        *,
        encoding: str = "utf-8",
        createDirectories: bool = True,
    ) -> str:
        return await self._engine.writeFile(
            path,
            content,
            encoding=encoding,
            createDirectories=createDirectories,
        )

    async def deleteEntry(self, path: str) -> str:
        return await self._engine.deleteEntry(path)

    async def moveEntry(self, sourcePath: str, destinationPath: str) -> str:
        return await self._engine.moveEntry(sourcePath, destinationPath)

    async def createDirectory(self, path: str) -> str:
        return await self._engine.createDirectory(path)

    async def fileExists(self, path: str) -> bool:
        return await self._engine.fileExists(path)

    async def listPackages(self) -> list[PackageInfo]:
        return await self._engine.listPackages()

    async def installPackage(self, packageName: str) -> InstallResult:
        return await self._engine.installPackage(packageName)

    async def uninstallPackage(self, packageName: str) -> InstallResult:
        return await self._engine.uninstallPackage(packageName)

    def getVariables(self) -> list[VariableInfo]:
        return self._collectVariables()

    def _collectVariables(self, variables: list[VariableState] | None = None) -> list[VariableInfo]:
        return [
            VariableInfo(
                name=variable.name,
                typeName=variable.typeName,
                repr=variable.repr,
                size=variable.size,
            )
            for variable in (variables or self._engine.getVariables())
        ]

    def _convertVariableDelta(self, delta: RuntimeVariableDelta) -> VariableDelta:
        return VariableDelta(
            added=self._collectVariables(delta.added),
            updated=self._collectVariables(delta.updated),
            removed=list(delta.removed),
        )

    def _convertEvent(self, event: RuntimeExecutionEvent) -> ExecutionEvent:
        return ExecutionEvent(
            sequence=event.sequence,
            eventType=event.eventType,
            blockId=event.blockId,
            executionCount=event.executionCount,
            payload=event.payload,
        )

    def reset(self) -> None:
        self._engine.reset()

    def dispose(self) -> None:
        self._engine.dispose()
