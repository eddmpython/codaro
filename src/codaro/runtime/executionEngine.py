from __future__ import annotations

from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import Any, Literal, Protocol, Sequence


InterruptMode = Literal["soft", "hard", "auto"]


@dataclass(slots=True)
class VariableState:
    name: str
    typeName: str
    repr: str
    size: int | None = None


@dataclass(slots=True)
class VariableDelta:
    added: list[VariableState] = field(default_factory=list)
    updated: list[VariableState] = field(default_factory=list)
    removed: list[str] = field(default_factory=list)


@dataclass(slots=True)
class ExecutionEvent:
    sequence: int
    eventType: str
    blockId: str | None = None
    executionCount: int = 0
    payload: Any = None


@dataclass(slots=True)
class ExecutionBlock:
    code: str
    blockId: str | None = None
    injectedVars: list[str] | None = None


@dataclass(slots=True)
class ExecutionResult:
    type: str
    data: Any = ""
    stdout: str = ""
    stderr: str = ""
    variables: list[VariableState] = field(default_factory=list)
    stateDelta: VariableDelta = field(default_factory=VariableDelta)
    events: list[ExecutionEvent] = field(default_factory=list)
    executionCount: int = 0
    status: str = "done"
    interruptMode: str | None = None


@dataclass(slots=True)
class InterruptResult:
    interrupted: bool
    requestedMode: InterruptMode = "auto"
    appliedMode: str = "none"
    preservedState: bool = True
    message: str = ""


class ExecutionEngine(Protocol):
    async def initialize(self) -> None: ...

    async def executeBlock(
        self,
        code: str,
        *,
        blockId: str | None = None,
        injectedVars: list[str] | None = None,
        eventHandler: Callable[[ExecutionEvent], Awaitable[None]] | None = None,
    ) -> ExecutionResult: ...

    async def executeAll(self, blocks: Sequence[ExecutionBlock]) -> list[ExecutionResult]: ...

    def interrupt(
        self,
        *,
        mode: InterruptMode = "auto",
        graceMs: int = 250,
    ) -> InterruptResult: ...

    def getVariables(self) -> list[VariableState]: ...

    async def getFiles(self, path: str = ".") -> Any: ...

    async def readFile(self, path: str, *, encoding: str = "utf-8") -> Any: ...

    async def writeFile(
        self,
        path: str,
        content: str,
        *,
        encoding: str = "utf-8",
        createDirectories: bool = True,
    ) -> str: ...

    async def deleteEntry(self, path: str) -> str: ...

    async def moveEntry(self, sourcePath: str, destinationPath: str) -> str: ...

    async def createDirectory(self, path: str) -> str: ...

    async def fileExists(self, path: str) -> bool: ...

    async def listPackages(self) -> Any: ...

    async def installPackage(self, packageName: str) -> Any: ...

    async def uninstallPackage(self, packageName: str) -> Any: ...

    def removeBlockDefinitions(self, blockId: str) -> None: ...

    def reset(self) -> None: ...

    def dispose(self) -> None: ...
