"""리액티브 순환 감지 + dependents-only 실행 순서 테스트(순수, 결정적)."""
from __future__ import annotations

import asyncio

from codaro.kernel.reactive import (
    buildReactiveGraph,
    detectCycles,
    getReactiveOrder,
    reactiveDiagnostics,
    executeAll,
)


def _blocks(*pairs: tuple[str, str]) -> list[dict[str, str]]:
    return [{"id": blockId, "type": "code", "content": code} for blockId, code in pairs]


def testNoCycleInAcyclicGraph() -> None:
    blocks = _blocks(("a", "x = 1"), ("b", "y = x + 1"), ("c", "z = y + 1"))
    assert detectCycles(buildReactiveGraph(blocks)) == []


def testDetectsTwoBlockCycle() -> None:
    # a: x = bVar (defines x, uses bVar) · b: bVar = x (defines bVar, uses x) → a↔b
    blocks = _blocks(("a", "x = bVar"), ("b", "bVar = x"))
    cycles = detectCycles(buildReactiveGraph(blocks))
    assert len(cycles) == 1
    assert set(cycles[0]) == {"a", "b"}


def testDetectsThreeBlockCycle() -> None:
    # a: x = z · b: y = x · c: z = y → a→b→c→a
    blocks = _blocks(("a", "x = z"), ("b", "y = x"), ("c", "z = y"))
    cycles = detectCycles(buildReactiveGraph(blocks))
    assert len(cycles) == 1
    assert set(cycles[0]) == {"a", "b", "c"}


def testReactiveDiagnosticsWrapsDetect() -> None:
    blocks = _blocks(("a", "x = bVar"), ("b", "bVar = x"))
    diag = reactiveDiagnostics(blocks)
    assert len(diag) == 1 and set(diag[0]) == {"a", "b"}


def testGetReactiveOrderIncludesSourceByDefault() -> None:
    blocks = _blocks(("a", "x = 1"), ("b", "y = x + 1"), ("c", "z = y + 1"))
    graph = buildReactiveGraph(blocks)
    assert getReactiveOrder(graph, "a") == ["a", "b", "c"]


def testGetReactiveOrderExcludesSourceWhenAsked() -> None:
    # 위젯 값 변경 경로: source(위젯 셀)는 빼고 dependents만.
    blocks = _blocks(("a", "x = 1"), ("b", "y = x + 1"), ("c", "z = y + 1"))
    graph = buildReactiveGraph(blocks)
    assert getReactiveOrder(graph, "a", includeSource=False) == ["b", "c"]


def testForwardDependencyRunsProviderBeforeConsumer() -> None:
    class RecordingResult:
        status = "done"

    class RecordingSession:
        def __init__(self) -> None:
            self.executed: list[str] = []

        async def execute(self, _code: str, *, blockId: str, **_kwargs):
            self.executed.append(blockId)
            return RecordingResult()

    blocks = _blocks(("consumer", "y = x + 1"), ("provider", "x = 1"))
    graph = buildReactiveGraph(blocks)
    session = RecordingSession()
    results, executionOrder = asyncio.run(executeAll(session, blocks))  # type: ignore[arg-type]

    assert getReactiveOrder(graph, "provider") == ["provider", "consumer"]
    assert executionOrder == ["provider", "consumer"]
    assert session.executed == executionOrder
    assert len(results) == 2


def testCycleAndMultipleDefinitionFailClosedBeforeAnyExecution() -> None:
    class RecordingSession:
        def __init__(self) -> None:
            self.executed: list[str] = []

        async def execute(self, _code: str, *, blockId: str, **_kwargs):
            self.executed.append(blockId)
            raise AssertionError("ambiguous graph executed a side effect")

    for blocks in (
        _blocks(("a", "x = y"), ("b", "y = x")),
        _blocks(("a", "x = 1"), ("b", "x = 2"), ("c", "y = x")),
    ):
        session = RecordingSession()
        results, executionOrder = asyncio.run(executeAll(session, blocks))  # type: ignore[arg-type]
        assert results == []
        assert executionOrder == []
        assert session.executed == []
