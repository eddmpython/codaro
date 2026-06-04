"""리액티브 정합성 진단 테스트 — 다중정의·cross-cell mutation·stale 집합(순수, 결정적)."""
from __future__ import annotations

from codaro.kernel.reactive import (
    buildReactiveDiagnostics,
    buildReactiveGraph,
    calculateStaleSet,
    detectCrossCellMutations,
    detectMultipleDefinitions,
    getReactiveOrder,
)


def _blocks(*pairs: tuple[str, str]) -> list[dict[str, str]]:
    return [{"id": blockId, "type": "code", "content": code} for blockId, code in pairs]


def testDetectsMultipleDefinitionsAcrossCells() -> None:
    blocks = _blocks(("a", "x = 1"), ("b", "x = 2"), ("c", "y = x + 1"))
    multi = detectMultipleDefinitions(buildReactiveGraph(blocks))
    assert multi == [("x", ["a", "b"])]


def testSingleCellRedefinitionIsNotMultipleDefinition() -> None:
    blocks = _blocks(("a", "x = 1\nx = 2"), ("b", "y = x"))
    assert detectMultipleDefinitions(buildReactiveGraph(blocks)) == []


def testUnderscoreNamesExemptFromMultipleDefinitionSurface() -> None:
    blocks = _blocks(("a", "_tmp = 1"), ("b", "_tmp = 2"))
    assert detectMultipleDefinitions(buildReactiveGraph(blocks)) == []


def testRefinementChainIsNotMultipleDefinition() -> None:
    # 읽어서 다듬는 셀(df = df.dropna())은 충돌이 아니라 정상 체인.
    blocks = _blocks(("a", "df = load()"), ("b", "df = df.dropna()"))
    assert detectMultipleDefinitions(buildReactiveGraph(blocks)) == []


def testAccumulationChainIsNotMultipleDefinition() -> None:
    blocks = _blocks(("a", "total = 0"), ("b", "total = total + 5"))
    assert detectMultipleDefinitions(buildReactiveGraph(blocks)) == []


def testRefinerDependsOnRootDefiner() -> None:
    # df = df.dropna()(b)는 df를 읽으므로 정의 셀 a에 의존(a 수정 시 b 재실행).
    blocks = _blocks(("a", "df = load()"), ("b", "df = df.dropna()"))
    graph = buildReactiveGraph(blocks)
    assert "b" in getReactiveOrder(graph, "a")


def testMultipleDefinitionRegistersDependentsOnAllProviders() -> None:
    # b1:x=1, b2:x=2, b3:y=x → x를 쓰는 b3은 b1·b2 둘 다의 변경에 영향받아야 한다.
    blocks = _blocks(("b1", "x = 1"), ("b2", "x = 2"), ("b3", "y = x"))
    graph = buildReactiveGraph(blocks)
    assert "b3" in getReactiveOrder(graph, "b1")
    assert "b3" in getReactiveOrder(graph, "b2")


def testDetectsCrossCellMutation() -> None:
    blocks = _blocks(("a", "d = {}"), ("b", "d[0] = 1"))
    muts = detectCrossCellMutations(buildReactiveGraph(blocks))
    assert muts == [("d", "b", "a")]


def testCrossCellMutationOwnerIsLastDefiner() -> None:
    blocks = _blocks(("a", "d = {}"), ("b", "d = {}"), ("c", "d[0] = 1"))
    muts = detectCrossCellMutations(buildReactiveGraph(blocks))
    assert muts == [("d", "c", "b")]  # owner = last-wins 정의자


def testSelfMutationIsNotCrossCell() -> None:
    blocks = _blocks(("a", "d = {}\nd[0] = 1"))
    assert detectCrossCellMutations(buildReactiveGraph(blocks)) == []


def testStaleSetIsTransitiveDownstream() -> None:
    blocks = _blocks(("a", "x = 1"), ("b", "y = x"), ("c", "z = y"))
    graph = buildReactiveGraph(blocks)
    assert calculateStaleSet(graph, "a") == {"a", "b", "c"}
    assert calculateStaleSet(graph, "a", includeSource=False) == {"b", "c"}


def testBuildReactiveDiagnosticsBundlesAll() -> None:
    blocks = _blocks(("a", "x = 1"), ("b", "x = 2"), ("c", "d = {}"), ("e", "d[0] = x"))
    diag = buildReactiveDiagnostics(blocks)
    assert diag.multipleDefinitions == (("x", ("a", "b")),)
    assert diag.crossCellMutations == (("d", "e", "c"),)
    assert diag.cycles == ()
