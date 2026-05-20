from __future__ import annotations

import time
from collections.abc import Awaitable, Callable, Sequence
from dataclasses import dataclass
from typing import Any

from .protocol import ExecutionEvent, ExecutionOutput, WsResultMessage
from .reactive import executeReactive, previewReactiveOrder
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

    @property
    def resultCount(self) -> int:
        return len(self.results)

    @property
    def executionCount(self) -> int:
        return len(self.executionOrder)

    def httpPayload(self) -> dict[str, Any]:
        return {
            "results": [result.model_dump() for result in self.results],
            "executionOrder": list(self.executionOrder),
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
) -> KernelReactivePayload:
    startedAt = time.perf_counter()
    results, executionOrder = await executeReactive(session, list(blocks), changedBlockId, eventHandler=eventHandler)
    return KernelReactivePayload(
        results=tuple(results),
        executionOrder=tuple(executionOrder),
        durationMs=_durationMs(startedAt),
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
