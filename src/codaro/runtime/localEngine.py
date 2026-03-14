from __future__ import annotations

from .executionEngine import ExecutionEngine, ExecutionResult


class LocalEngine(ExecutionEngine):
    def initialize(self) -> None:
        return

    def executeBlock(self, code: str) -> ExecutionResult:
        raise NotImplementedError("LocalEngine is not implemented in Codaro v0.")

    def executeAll(self, blocks: list[str]) -> list[ExecutionResult]:
        raise NotImplementedError("LocalEngine is not implemented in Codaro v0.")

    def interrupt(self) -> None:
        return

    def getVariables(self) -> list[str]:
        return []

    def getFiles(self) -> list[str]:
        return []

    def writeFile(self, path: str, content: str) -> None:
        raise NotImplementedError("LocalEngine is not implemented in Codaro v0.")

    def installPackage(self, packageName: str) -> None:
        raise NotImplementedError("LocalEngine is not implemented in Codaro v0.")

    def dispose(self) -> None:
        return
