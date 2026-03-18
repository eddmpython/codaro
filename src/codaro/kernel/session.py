from __future__ import annotations

import uuid

from ..runtime import LocalEngine, VariableState
from .protocol import ExecutionOutput, VariableInfo


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
    ) -> ExecutionOutput:
        result = await self._engine.executeBlock(
            code,
            blockId=blockId,
            injectedVars=injectedVars,
        )
        return ExecutionOutput(
            type=result.type,
            blockId=blockId,
            data=result.data,
            stdout=result.stdout,
            stderr=result.stderr,
            variables=self._collectVariables(result.variables),
            executionCount=result.executionCount,
            status=result.status,
        )

    def removeCellDefinitions(self, blockId: str) -> None:
        self._engine.removeBlockDefinitions(blockId)

    def interrupt(self) -> bool:
        return self._engine.interrupt()

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

    def reset(self) -> None:
        self._engine.reset()

    def dispose(self) -> None:
        self._engine.dispose()
