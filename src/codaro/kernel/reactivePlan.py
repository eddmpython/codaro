from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass(slots=True)
class BlockNode:
    blockId: str
    defines: list[str] = field(default_factory=list)
    uses: list[str] = field(default_factory=list)
    mutatedFreeNames: list[str] = field(default_factory=list)
    imports: list[str] = field(default_factory=list)
    unsafeCalls: list[str] = field(default_factory=list)
    isEmpty: bool = False


@dataclass(slots=True)
class ReactiveGraph:
    nodes: dict[str, BlockNode] = field(default_factory=dict)
    definedBy: dict[str, list[str]] = field(default_factory=dict)
    dependents: dict[str, set[str]] = field(default_factory=dict)
    blockOrder: list[str] = field(default_factory=list)


@dataclass(frozen=True, slots=True)
class ReactiveDiagnostics:
    cycles: tuple[tuple[str, ...], ...] = ()
    multipleDefinitions: tuple[tuple[str, tuple[str, ...]], ...] = ()
    crossCellMutations: tuple[tuple[str, str, str], ...] = ()
    selfImports: tuple[tuple[str, str], ...] = ()
    definitionOrder: tuple[tuple[str, str, str], ...] = ()
    emptyCells: tuple[str, ...] = ()
    unsafeCalls: tuple[tuple[str, str], ...] = ()


def buildReactiveGraph(
    blocks: list[dict[str, Any]],
    analyzeCellBindings: Callable[[str], Any],
    analyzeMarkdownRefs: Callable[[str], list[str]],
) -> ReactiveGraph:
    graph = ReactiveGraph()
    for block in blocks:
        blockType = block.get("type")
        if blockType not in ("code", "markdown"):
            continue
        blockId = block["id"]
        content = block.get("content", "")
        if blockType == "markdown":
            graph.nodes[blockId] = BlockNode(blockId=blockId, uses=analyzeMarkdownRefs(content))
            graph.blockOrder.append(blockId)
            continue
        binding = analyzeCellBindings(content)
        graph.nodes[blockId] = BlockNode(
            blockId=blockId,
            defines=binding.defines,
            uses=binding.uses,
            mutatedFreeNames=binding.mutatedFreeNames,
            imports=binding.imports,
            unsafeCalls=binding.unsafeCalls,
            isEmpty=binding.isEmpty,
        )
        graph.blockOrder.append(blockId)
        for variable in binding.defines:
            graph.definedBy.setdefault(variable, []).append(blockId)

    for blockId, node in graph.nodes.items():
        for variable in node.uses:
            for provider in graph.definedBy.get(variable, []):
                if provider != blockId:
                    graph.dependents.setdefault(provider, set()).add(blockId)
    return graph


def calculateStaleSet(
    graph: ReactiveGraph,
    changedBlockId: str,
    *,
    includeSource: bool = True,
) -> set[str]:
    affected = {changedBlockId}
    queue = [changedBlockId]
    while queue:
        current = queue.pop(0)
        for dependent in graph.dependents.get(current, set()):
            if dependent not in affected:
                affected.add(dependent)
                queue.append(dependent)
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
    return [blockId for blockId in graph.blockOrder if blockId in affected]


def getAllExecutionOrder(graph: ReactiveGraph) -> list[str]:
    return list(graph.blockOrder)


def dependencyClosure(graph: ReactiveGraph, entryBlockId: str) -> list[str]:
    """Return the entry block and every provider it needs in document order."""
    if entryBlockId not in graph.nodes:
        raise KeyError(entryBlockId)
    closure = {entryBlockId}
    queue = [entryBlockId]
    while queue:
        current = queue.pop(0)
        node = graph.nodes[current]
        for variable in node.uses:
            for provider in graph.definedBy.get(variable, []):
                if provider in closure:
                    continue
                closure.add(provider)
                queue.append(provider)
    return [blockId for blockId in graph.blockOrder if blockId in closure]


def detectCycles(graph: ReactiveGraph) -> list[list[str]]:
    white, gray, black = 0, 1, 2
    color = {blockId: white for blockId in graph.nodes}
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


def detectMultipleDefinitions(graph: ReactiveGraph) -> list[tuple[str, list[str]]]:
    result: list[tuple[str, list[str]]] = []
    for variable in sorted(graph.definedBy):
        if variable.startswith("_"):
            continue
        blockIds = list(dict.fromkeys(graph.definedBy[variable]))
        rootDefiners = [
            blockId
            for blockId in blockIds
            if blockId in graph.nodes and variable not in graph.nodes[blockId].uses
        ]
        if len(rootDefiners) > 1:
            result.append((variable, rootDefiners))
    return result


def detectCrossCellMutations(graph: ReactiveGraph) -> list[tuple[str, str, str]]:
    result: list[tuple[str, str, str]] = []
    for blockId in graph.blockOrder:
        node = graph.nodes.get(blockId)
        if node is None:
            continue
        for variable in node.mutatedFreeNames:
            providers = [provider for provider in graph.definedBy.get(variable, []) if provider != blockId]
            if providers:
                result.append((variable, blockId, providers[-1]))
    result.sort()
    return result


def moduleNameFromTitle(notebookName: str | None) -> str | None:
    if not notebookName:
        return None
    stem = notebookName.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    if stem.endswith(".py"):
        stem = stem[:-3]
    return stem or None


def detectSelfImports(graph: ReactiveGraph, notebookName: str | None) -> list[tuple[str, str]]:
    moduleName = moduleNameFromTitle(notebookName)
    if not moduleName:
        return []
    result: list[tuple[str, str]] = []
    for blockId in graph.blockOrder:
        node = graph.nodes.get(blockId)
        if node is None:
            continue
        for module in node.imports:
            if module == moduleName:
                result.append((blockId, module))
    return result


def detectDefinitionOrder(graph: ReactiveGraph) -> list[tuple[str, str, str]]:
    order = {blockId: index for index, blockId in enumerate(graph.blockOrder)}
    result: list[tuple[str, str, str]] = []
    for blockId in graph.blockOrder:
        node = graph.nodes.get(blockId)
        if node is None:
            continue
        for variable in node.uses:
            providers = [provider for provider in graph.definedBy.get(variable, []) if provider != blockId]
            if providers and all(order[provider] > order[blockId] for provider in providers):
                result.append((variable, blockId, providers[0]))
    result.sort()
    return result


def detectEmptyCells(graph: ReactiveGraph) -> list[str]:
    return [blockId for blockId in graph.blockOrder if graph.nodes[blockId].isEmpty]


def detectUnsafeCalls(graph: ReactiveGraph) -> list[tuple[str, str]]:
    return [
        (blockId, call)
        for blockId in graph.blockOrder
        for call in graph.nodes[blockId].unsafeCalls
    ]


def diagnosticsFromGraph(graph: ReactiveGraph, notebookName: str | None = None) -> ReactiveDiagnostics:
    return ReactiveDiagnostics(
        cycles=tuple(tuple(cycle) for cycle in detectCycles(graph)),
        multipleDefinitions=tuple((variable, tuple(blockIds)) for variable, blockIds in detectMultipleDefinitions(graph)),
        crossCellMutations=tuple(detectCrossCellMutations(graph)),
        selfImports=tuple(detectSelfImports(graph, notebookName)),
        definitionOrder=tuple(detectDefinitionOrder(graph)),
        emptyCells=tuple(detectEmptyCells(graph)),
        unsafeCalls=tuple(detectUnsafeCalls(graph)),
    )


def reactivePlanPayload(
    blocks: list[dict[str, Any]],
    changedBlockId: str | None,
    analyzeCellBindings: Callable[[str], Any],
    analyzeMarkdownRefs: Callable[[str], list[str]],
    *,
    includeSource: bool = True,
    notebookName: str | None = None,
) -> dict[str, Any]:
    graph = buildReactiveGraph(blocks, analyzeCellBindings, analyzeMarkdownRefs)
    diagnostics = diagnosticsFromGraph(graph, notebookName)
    executionOrder = (
        getReactiveOrder(graph, changedBlockId, includeSource=includeSource)
        if changedBlockId is not None
        else getAllExecutionOrder(graph)
    )
    return {
        "executionOrder": executionOrder,
        "cycles": [list(cycle) for cycle in diagnostics.cycles],
        "multipleDefinitions": [
            [variable, list(blockIds)]
            for variable, blockIds in diagnostics.multipleDefinitions
        ],
        "crossCellMutations": [list(item) for item in diagnostics.crossCellMutations],
        "staleBlockIds": [],
        "dependents": {
            blockId: sorted(graph.dependents[blockId])
            for blockId in graph.blockOrder
            if graph.dependents.get(blockId)
        },
        "definedBy": {variable: list(blockIds) for variable, blockIds in graph.definedBy.items()},
        "nodes": [
            {
                "blockId": node.blockId,
                "defines": list(node.defines),
                "uses": list(node.uses),
            }
            for node in graph.nodes.values()
        ],
        "selfImports": [list(item) for item in diagnostics.selfImports],
        "definitionOrder": [list(item) for item in diagnostics.definitionOrder],
        "emptyCells": list(diagnostics.emptyCells),
        "unsafeCalls": [list(item) for item in diagnostics.unsafeCalls],
    }
