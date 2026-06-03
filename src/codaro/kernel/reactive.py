from __future__ import annotations

from dataclasses import dataclass, field
from collections.abc import Awaitable, Callable
from typing import Any

from ..document.analysis import analyzeCellBindings
from .protocol import ExecutionOutput
from .session import KernelSession


@dataclass(slots=True)
class BlockNode:
    blockId: str
    defines: list[str] = field(default_factory=list)
    uses: list[str] = field(default_factory=list)
    mutatedFreeNames: list[str] = field(default_factory=list)


@dataclass(slots=True)
class ReactiveGraph:
    nodes: dict[str, BlockNode] = field(default_factory=dict)
    # 한 변수를 정의하는 블록은 여럿일 수 있다(다중 정의). blockOrder 순서로 쌓고,
    # 실행 값의 owner는 마지막 provider(last-wins, 워커 registry와 일치)로 본다.
    definedBy: dict[str, list[str]] = field(default_factory=dict)
    dependents: dict[str, set[str]] = field(default_factory=dict)
    blockOrder: list[str] = field(default_factory=list)


def buildReactiveGraph(blocks: list[dict[str, Any]]) -> ReactiveGraph:
    graph = ReactiveGraph()

    for block in blocks:
        if block.get("type") != "code":
            continue
        blockId = block["id"]
        content = block.get("content", "")
        binding = analyzeCellBindings(content)
        graph.nodes[blockId] = BlockNode(
            blockId=blockId,
            defines=binding.defines,
            uses=binding.uses,
            mutatedFreeNames=binding.mutatedFreeNames,
        )
        graph.blockOrder.append(blockId)
        for var in binding.defines:
            graph.definedBy.setdefault(var, []).append(blockId)

    for blockId, node in graph.nodes.items():
        for var in node.uses:
            # 모든 provider에 의존 엣지(보수적 완전 — 어느 정의가 바뀌어도 다운스트림 stale).
            for provider in graph.definedBy.get(var, []):
                if provider != blockId:
                    graph.dependents.setdefault(provider, set()).add(blockId)

    return graph


def calculateStaleSet(
    graph: ReactiveGraph,
    changedBlockId: str,
    *,
    includeSource: bool = True,
) -> set[str]:
    """`changedBlockId`가 바뀌면 영향받는(=재실행 필요한) 블록 집합을 BFS로 구한다.

    `dependents` 전이 폐포라 A→B→C에서 A 변경 시 {A,B,C}. stale 표시와 실행 순서가
    공유하는 단일 진실원이다(getReactiveOrder가 이 집합을 blockOrder로 정렬해 반환).
    """
    affected: set[str] = {changedBlockId}
    queue = [changedBlockId]

    while queue:
        current = queue.pop(0)
        for dependent in graph.dependents.get(current, set()):
            if dependent not in affected:
                affected.add(dependent)
                queue.append(dependent)

    # 위젯 값 변경 등에서는 source 블록(위젯 정의 셀) 자신은 재실행하지 않고
    # 그 변수를 쓰는 다운스트림만 돌린다(값 리셋 방지).
    if not includeSource:
        affected.discard(changedBlockId)

    return affected


def getReactiveOrder(
    graph: ReactiveGraph,
    changedBlockId: str,
    *,
    includeSource: bool = True,
) -> list[str]:
    affected = calculateStaleSet(graph, changedBlockId, includeSource=includeSource)
    return [bid for bid in graph.blockOrder if bid in affected]


def detectCycles(graph: ReactiveGraph) -> list[list[str]]:
    """`dependents` 방향그래프의 순환 경로들을 반환한다(없으면 빈 리스트).

    A↔B 같은 순환 의존은 실행 순서가 미정의라 한 셀이 stale 데이터로 돈다.
    white/gray/black DFS로 back-edge를 잡아 순환을 노출한다(엔진은 측정, 표시는 표면).
    """
    white, gray, black = 0, 1, 2
    color: dict[str, int] = {blockId: white for blockId in graph.nodes}
    cycles: list[list[str]] = []
    seen: set[frozenset[str]] = set()

    def visit(node: str, stack: list[str]) -> None:
        color[node] = gray
        stack.append(node)
        for dependent in sorted(graph.dependents.get(node, set())):
            state = color.get(dependent, white)
            if state == gray:
                cycle = stack[stack.index(dependent):]
                key = frozenset(cycle)
                if key not in seen:
                    seen.add(key)
                    cycles.append(list(cycle))
            elif state == white:
                visit(dependent, stack)
        stack.pop()
        color[node] = black

    for blockId in graph.blockOrder:
        if color.get(blockId, white) == white:
            visit(blockId, [])
    return cycles


def reactiveDiagnostics(blocks: list[dict[str, Any]]) -> list[list[str]]:
    return detectCycles(buildReactiveGraph(blocks))


@dataclass(frozen=True, slots=True)
class ReactiveDiagnostics:
    """정적으로 잘못된 것들 — "측정은 엔진, 표시는 표면" 철학의 정합성 진단 묶음.

    stale은 정적 오류가 아니라 변경 전파의 함수라 여기 두지 않는다(calculateStaleSet 담당).
    """

    cycles: tuple[tuple[str, ...], ...] = ()
    multipleDefinitions: tuple[tuple[str, tuple[str, ...]], ...] = ()
    crossCellMutations: tuple[tuple[str, str, str], ...] = ()


def detectMultipleDefinitions(graph: ReactiveGraph) -> list[tuple[str, list[str]]]:
    """한 변수를 둘 이상의 *구별되는* 셀이 정의하는 경우 (변수, 정의 셀들)를 반환한다.

    `_` 접두 임시 변수는 surface에서 면제한다(의존 엣지는 유지). 같은 셀 내 재정의는
    binding이 1회로 모으므로 제외된다.
    """
    result: list[tuple[str, list[str]]] = []
    for var in sorted(graph.definedBy):
        if var.startswith("_"):
            continue
        blockIds = list(dict.fromkeys(graph.definedBy[var]))
        if len(blockIds) > 1:
            result.append((var, blockIds))
    return result


def detectCrossCellMutations(graph: ReactiveGraph) -> list[tuple[str, str, str]]:
    """다른 셀이 정의한 변수를 제자리 변경하는 경우 (변수, 변경 셀, 소유 셀)을 반환한다.

    소유 셀 = 마지막 정의자(last-wins owner). 정적으로 잡히는 형태(subscript/attribute store)만.
    """
    result: list[tuple[str, str, str]] = []
    for blockId in graph.blockOrder:
        node = graph.nodes.get(blockId)
        if node is None:
            continue
        for var in node.mutatedFreeNames:
            providers = [provider for provider in graph.definedBy.get(var, []) if provider != blockId]
            if providers:
                result.append((var, blockId, providers[-1]))
    result.sort()
    return result


def diagnosticsFromGraph(graph: ReactiveGraph) -> ReactiveDiagnostics:
    return ReactiveDiagnostics(
        cycles=tuple(tuple(cycle) for cycle in detectCycles(graph)),
        multipleDefinitions=tuple((var, tuple(blockIds)) for var, blockIds in detectMultipleDefinitions(graph)),
        crossCellMutations=tuple(detectCrossCellMutations(graph)),
    )


def buildReactiveDiagnostics(blocks: list[dict[str, Any]]) -> ReactiveDiagnostics:
    return diagnosticsFromGraph(buildReactiveGraph(blocks))


def previewReactiveOrder(blocks: list[dict[str, Any]], changedBlockId: str) -> list[str]:
    graph = buildReactiveGraph(blocks)
    return getReactiveOrder(graph, changedBlockId)


async def executeReactive(
    session: KernelSession,
    blocks: list[dict[str, Any]],
    changedBlockId: str,
    eventHandler: Callable[[Any], Awaitable[None]] | None = None,
    *,
    includeSource: bool = True,
    graph: ReactiveGraph | None = None,
) -> tuple[list[ExecutionOutput], list[str]]:
    if graph is None:
        graph = buildReactiveGraph(blocks)
    executionOrder = getReactiveOrder(graph, changedBlockId, includeSource=includeSource)

    blockMap = {b["id"]: b for b in blocks if b.get("type") == "code"}
    results: list[ExecutionOutput] = []

    for blockId in executionOrder:
        block = blockMap.get(blockId)
        if not block:
            continue

        node = graph.nodes.get(blockId)
        injectedVars = list(node.uses) if node else None

        result = await session.execute(
            block["content"],
            blockId=blockId,
            injectedVars=injectedVars,
            eventHandler=eventHandler,
        )
        results.append(result)
        if result.status == "error":
            break

    return results, executionOrder
