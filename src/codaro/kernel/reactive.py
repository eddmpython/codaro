from __future__ import annotations

from dataclasses import dataclass, field
from collections.abc import Awaitable, Callable
from typing import Any

from ..document.analysis import analyzeCode
from .protocol import ExecutionOutput
from .session import KernelSession


@dataclass(slots=True)
class BlockNode:
    blockId: str
    defines: list[str] = field(default_factory=list)
    uses: list[str] = field(default_factory=list)


@dataclass(slots=True)
class ReactiveGraph:
    nodes: dict[str, BlockNode] = field(default_factory=dict)
    definedBy: dict[str, str] = field(default_factory=dict)
    dependents: dict[str, set[str]] = field(default_factory=dict)
    blockOrder: list[str] = field(default_factory=list)


def buildReactiveGraph(blocks: list[dict[str, Any]]) -> ReactiveGraph:
    graph = ReactiveGraph()

    for block in blocks:
        if block.get("type") != "code":
            continue
        blockId = block["id"]
        content = block.get("content", "")
        defines, uses = analyzeCode(content)
        graph.nodes[blockId] = BlockNode(blockId=blockId, defines=defines, uses=uses)
        graph.blockOrder.append(blockId)
        for var in defines:
            graph.definedBy[var] = blockId

    for blockId, node in graph.nodes.items():
        for var in node.uses:
            provider = graph.definedBy.get(var)
            if provider and provider != blockId:
                graph.dependents.setdefault(provider, set()).add(blockId)

    return graph


def getReactiveOrder(
    graph: ReactiveGraph,
    changedBlockId: str,
    *,
    includeSource: bool = True,
) -> list[str]:
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
) -> tuple[list[ExecutionOutput], list[str]]:
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
