from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol, Sequence


@dataclass(slots=True)
class VariableState:
    name: str
    typeName: str
    repr: str
    size: int | None = None


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
    executionCount: int = 0
    status: str = "done"


class ExecutionEngine(Protocol):
    async def initialize(self) -> None: ...

    async def executeBlock(
        self,
        code: str,
        *,
        blockId: str | None = None,
        injectedVars: list[str] | None = None,
    ) -> ExecutionResult: ...

    async def executeAll(self, blocks: Sequence[ExecutionBlock]) -> list[ExecutionResult]: ...

    def interrupt(self) -> bool: ...

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

    async def listPackages(self) -> Any: ...

    async def installPackage(self, packageName: str) -> Any: ...

    async def uninstallPackage(self, packageName: str) -> Any: ...

    def removeBlockDefinitions(self, blockId: str) -> None: ...

    def reset(self) -> None: ...

    def dispose(self) -> None: ...
