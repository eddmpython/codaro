from __future__ import annotations

from dataclasses import dataclass, field
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


def getReactiveOrder(graph: ReactiveGraph, changedBlockId: str) -> list[str]:
    affected: set[str] = {changedBlockId}
    queue = [changedBlockId]

    while queue:
        current = queue.pop(0)
        for dependent in graph.dependents.get(current, set()):
            if dependent not in affected:
                affected.add(dependent)
                queue.append(dependent)

    return [bid for bid in graph.blockOrder if bid in affected]


def previewReactiveOrder(blocks: list[dict[str, Any]], changedBlockId: str) -> list[str]:
    graph = buildReactiveGraph(blocks)
    return getReactiveOrder(graph, changedBlockId)


async def executeReactive(
    session: KernelSession,
    blocks: list[dict[str, Any]],
    changedBlockId: str,
) -> tuple[list[ExecutionOutput], list[str]]:
    graph = buildReactiveGraph(blocks)
    executionOrder = getReactiveOrder(graph, changedBlockId)

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
        )
        results.append(result)
        if result.status == "error":
            break

    return results, executionOrder
