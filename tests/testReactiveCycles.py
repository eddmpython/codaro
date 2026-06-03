"""리액티브 순환 감지 + dependents-only 실행 순서 테스트(순수, 결정적)."""
from __future__ import annotations

from codaro.kernel.reactive import (
    buildReactiveGraph,
    detectCycles,
    getReactiveOrder,
    reactiveDiagnostics,
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
    # 위젯 값 변경 경로 — source(위젯 셀)는 빼고 dependents만.
    blocks = _blocks(("a", "x = 1"), ("b", "y = x + 1"), ("c", "z = y + 1"))
    graph = buildReactiveGraph(blocks)
    assert getReactiveOrder(graph, "a", includeSource=False) == ["b", "c"]
