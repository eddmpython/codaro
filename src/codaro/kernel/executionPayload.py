from __future__ import annotations

import time
from collections.abc import Awaitable, Callable, Sequence
from dataclasses import dataclass
from typing import Any

from .protocol import ExecutionEvent, ExecutionOutput, WsResultMessage
from .reactive import buildReactiveGraph, diagnosticsFromGraph, executeReactive, previewReactiveOrder
from .session import KernelSession


@dataclass(frozen=True, slots=True)
class KernelExecutionPayload:
    result: ExecutionOutput
    durationMs: float

    def httpPayload(self) -> dict[str, Any]:
        return self.result.model_dump()

    def wsResultPayload(self, requestId: str) -> dict[str, Any]:
        return _wsResultPayload(requestId, self.result)


@dataclass(frozen=True, slots=True)
class KernelReactivePayload:
    results: tuple[ExecutionOutput, ...]
    executionOrder: tuple[str, ...]
    durationMs: float
    cycles: tuple[tuple[str, ...], ...] = ()
    multipleDefinitions: tuple[tuple[str, tuple[str, ...]], ...] = ()
    crossCellMutations: tuple[tuple[str, str, str], ...] = ()
    staleBlockIds: tuple[str, ...] = ()
    dependents: tuple[tuple[str, tuple[str, ...]], ...] = ()
    definedBy: tuple[tuple[str, tuple[str, ...]], ...] = ()
    nodes: tuple[tuple[str, tuple[str, ...], tuple[str, ...]], ...] = ()

    @property
    def resultCount(self) -> int:
        return len(self.results)

    @property
    def executionCount(self) -> int:
        return len(self.executionOrder)

    def _diagnosticsPayload(self) -> dict[str, Any]:
        return {
            "cycles": [list(cycle) for cycle in self.cycles],
            "multipleDefinitions": [[var, list(blockIds)] for var, blockIds in self.multipleDefinitions],
            "crossCellMutations": [list(mutation) for mutation in self.crossCellMutations],
            "staleBlockIds": list(self.staleBlockIds),
            "dependents": {blockId: list(downstream) for blockId, downstream in self.dependents},
        }

    def _graphPayload(self) -> dict[str, Any]:
        # 탐색 UI(변수 탐색기·의존성 그래프)용 그래프 데이터 — 변수→정의셀, 셀별 defines/uses.
        return {
            "definedBy": {var: list(cells) for var, cells in self.definedBy},
            "nodes": [
                {"blockId": blockId, "defines": list(defines), "uses": list(uses)}
                for blockId, defines, uses in self.nodes
            ],
        }

    def httpPayload(self) -> dict[str, Any]:
        return {
            "results": [result.model_dump() for result in self.results],
            "executionOrder": list(self.executionOrder),
            **self._diagnosticsPayload(),
            **self._graphPayload(),
        }

    def toolPayload(self) -> dict[str, Any]:
        return {
            "executionOrder": list(self.executionOrder),
            "results": [
                {
                    "blockId": result.blockId,
                    "status": result.status,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "data": result.data,
                }
                for result in self.results
            ],
        }

    def wsResultPayloads(self, requestId: str) -> tuple[dict[str, Any], ...]:
        return tuple(_wsResultPayload(requestId, result) for result in self.results)

    def wsCompletePayload(self, requestId: str) -> dict[str, Any]:
        return {
            "type": "reactiveComplete",
            "requestId": requestId,
            "executionOrder": list(self.executionOrder),
            **self._diagnosticsPayload(),
            **self._graphPayload(),
        }


async def executeKernelBlock(
    session: KernelSession,
    code: str,
    *,
    blockId: str | None = None,
    eventHandler: Callable[[ExecutionEvent], Awaitable[None]] | None = None,
) -> KernelExecutionPayload:
    startedAt = time.perf_counter()
    result = await session.execute(code, blockId=blockId, eventHandler=eventHandler)
    return KernelExecutionPayload(result=result, durationMs=_durationMs(startedAt))


async def executeKernelReactive(
    session: KernelSession,
    blocks: Sequence[dict[str, Any]],
    changedBlockId: str,
    *,
    eventHandler: Callable[[ExecutionEvent], Awaitable[None]] | None = None,
    includeSource: bool = True,
) -> KernelReactivePayload:
    startedAt = time.perf_counter()
    blockList = list(blocks)
    graph = buildReactiveGraph(blockList)
    diagnostics = diagnosticsFromGraph(graph)
    results, executionOrder = await executeReactive(
        session, blockList, changedBlockId, eventHandler=eventHandler, includeSource=includeSource, graph=graph
    )
    # early-stop(에러로 중단)으로 영향받았지만 실행 못 한 셀 = stale.
    executed = {result.blockId for result in results}
    staleBlockIds = tuple(blockId for blockId in executionOrder if blockId not in executed)
    dependents = tuple(
        (blockId, tuple(sorted(graph.dependents[blockId])))
        for blockId in graph.blockOrder
        if graph.dependents.get(blockId)
    )
    definedBy = tuple((var, tuple(cells)) for var, cells in graph.definedBy.items())
    nodes = tuple(
        (node.blockId, tuple(node.defines), tuple(node.uses))
        for node in graph.nodes.values()
    )
    return KernelReactivePayload(
        results=tuple(results),
        executionOrder=tuple(executionOrder),
        durationMs=_durationMs(startedAt),
        cycles=diagnostics.cycles,
        multipleDefinitions=diagnostics.multipleDefinitions,
        crossCellMutations=diagnostics.crossCellMutations,
        staleBlockIds=staleBlockIds,
        dependents=dependents,
        definedBy=definedBy,
        nodes=nodes,
    )


def previewKernelReactiveOrder(blocks: Sequence[dict[str, Any]], changedBlockId: str) -> list[str]:
    return previewReactiveOrder(list(blocks), changedBlockId)


def _wsResultPayload(requestId: str, result: ExecutionOutput) -> dict[str, Any]:
    return WsResultMessage(
        type="result",
        requestId=requestId,
        blockId=result.blockId,
        status=result.status,
        data=result.data,
        stdout=result.stdout,
        stderr=result.stderr,
        variables=result.variables,
        stateDelta=result.stateDelta,
        executionCount=result.executionCount,
    ).model_dump()


def _durationMs(startedAt: float) -> float:
    return round((time.perf_counter() - startedAt) * 1000, 1)
