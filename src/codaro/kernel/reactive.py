from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

from ..document.analysis import analyzeCellBindings, analyzeMarkdownRefs
from .protocol import ExecutionOutput
from .reactivePlan import (
    BlockNode,
    ReactiveDiagnostics,
    ReactiveGraph,
    calculateStaleSet,
    detectCrossCellMutations,
    detectCycles,
    detectDefinitionOrder,
    detectEmptyCells,
    detectMultipleDefinitions,
    detectSelfImports,
    detectUnsafeCalls,
    diagnosticsFromGraph,
    getAllExecutionOrder,
    getReactiveOrder,
    reactivePlanPayload,
    stableTopologicalOrder,
)
from .reactivePlan import buildReactiveGraph as buildReactiveGraphFromAnalysis
from .session import KernelSession


def buildReactiveGraph(blocks: list[dict[str, Any]]) -> ReactiveGraph:
    return buildReactiveGraphFromAnalysis(blocks, analyzeCellBindings, analyzeMarkdownRefs)


def reactiveDiagnostics(blocks: list[dict[str, Any]]) -> list[list[str]]:
    return detectCycles(buildReactiveGraph(blocks))


def buildReactiveDiagnostics(
    blocks: list[dict[str, Any]],
    notebookName: str | None = None,
) -> ReactiveDiagnostics:
    return diagnosticsFromGraph(buildReactiveGraph(blocks), notebookName)


def previewReactiveOrder(blocks: list[dict[str, Any]], changedBlockId: str) -> list[str]:
    return getReactiveOrder(buildReactiveGraph(blocks), changedBlockId)


async def executeReactive(
    session: KernelSession,
    blocks: list[dict[str, Any]],
    changedBlockId: str,
    eventHandler: Callable[[Any], Awaitable[None]] | None = None,
    *,
    includeSource: bool = True,
    graph: ReactiveGraph | None = None,
) -> tuple[list[ExecutionOutput], list[str]]:
    activeGraph = graph or buildReactiveGraph(blocks)
    if _executionBlocked(activeGraph):
        return [], []
    executionOrder = getReactiveOrder(activeGraph, changedBlockId, includeSource=includeSource)
    return await executePlanned(
        session,
        blocks,
        executionOrder,
        activeGraph,
        eventHandler=eventHandler,
        stopFailedDependents=True,
    )


async def executeAll(
    session: KernelSession,
    blocks: list[dict[str, Any]],
    eventHandler: Callable[[Any], Awaitable[None]] | None = None,
    *,
    graph: ReactiveGraph | None = None,
) -> tuple[list[ExecutionOutput], list[str]]:
    activeGraph = graph or buildReactiveGraph(blocks)
    if _executionBlocked(activeGraph):
        return [], []
    return await executePlanned(
        session,
        blocks,
        getAllExecutionOrder(activeGraph),
        activeGraph,
        eventHandler=eventHandler,
        stopFailedDependents=True,
    )


async def executePlanned(
    session: KernelSession,
    blocks: list[dict[str, Any]],
    executionOrder: list[str],
    graph: ReactiveGraph,
    eventHandler: Callable[[Any], Awaitable[None]] | None = None,
    *,
    stopFailedDependents: bool,
) -> tuple[list[ExecutionOutput], list[str]]:
    blockMap = {block["id"]: block for block in blocks if block.get("type") in ("code", "markdown")}
    results: list[ExecutionOutput] = []
    skipped: set[str] = set()
    for blockId in executionOrder:
        if blockId in skipped:
            continue
        block = blockMap.get(blockId)
        if block is None:
            continue
        node = graph.nodes.get(blockId)
        result = await session.execute(
            block["content"],
            blockId=blockId,
            injectedVars=list(node.uses) if node else None,
            cellType=block.get("type", "code"),
            eventHandler=eventHandler,
        )
        results.append(result)
        if stopFailedDependents and result.status in ("error", "stopped"):
            skipped.update(calculateStaleSet(graph, blockId, includeSource=False))
    return results, executionOrder


def _executionBlocked(graph: ReactiveGraph) -> bool:
    diagnostics = diagnosticsFromGraph(graph)
    return bool(diagnostics.cycles or diagnostics.multipleDefinitions)


__all__ = [
    "BlockNode",
    "ReactiveDiagnostics",
    "ReactiveGraph",
    "buildReactiveDiagnostics",
    "buildReactiveGraph",
    "calculateStaleSet",
    "detectCrossCellMutations",
    "detectCycles",
    "detectDefinitionOrder",
    "detectEmptyCells",
    "detectMultipleDefinitions",
    "detectSelfImports",
    "detectUnsafeCalls",
    "diagnosticsFromGraph",
    "executeAll",
    "executeReactive",
    "getAllExecutionOrder",
    "getReactiveOrder",
    "previewReactiveOrder",
    "reactiveDiagnostics",
    "reactivePlanPayload",
    "stableTopologicalOrder",
]
