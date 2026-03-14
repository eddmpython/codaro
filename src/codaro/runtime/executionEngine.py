from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol


@dataclass(slots=True)
class ExecutionResult:
    type: str
    data: str
    stdout: str = ""
    stderr: str = ""
    variables: list[str] = field(default_factory=list)


class ExecutionEngine(Protocol):
    def initialize(self) -> None: ...

    def executeBlock(self, code: str) -> ExecutionResult: ...

    def executeAll(self, blocks: list[str]) -> list[ExecutionResult]: ...

    def interrupt(self) -> None: ...

    def getVariables(self) -> list[str]: ...

    def getFiles(self) -> list[str]: ...

    def writeFile(self, path: str, content: str) -> None: ...

    def installPackage(self, packageName: str) -> None: ...

    def dispose(self) -> None: ...
