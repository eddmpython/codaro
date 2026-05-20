from __future__ import annotations

import json
from typing import Any


def injectContext(message: str, context: dict[str, Any]) -> str:
    parts: list[str] = []
    _appendInstruction(parts, context)
    _appendSelectedCell(parts, context)
    _appendVariables(parts, context)
    _appendDocument(parts, context)
    _appendCellMap(parts, context)
    _appendDependencyPreflight(parts, context)
    _appendTools(parts, context)
    _appendWorkspace(parts, context)
    if not parts:
        return message
    contextText = "\n\n".join(parts)
    return f"{message}\n\n---\nContext:\n{contextText}"


def _appendInstruction(parts: list[str], context: dict[str, Any]) -> None:
    if context.get("instruction"):
        parts.append(f"[Codaro procedure]\n{context['instruction']}")


def _appendSelectedCell(parts: list[str], context: dict[str, Any]) -> None:
    selectedCell = context.get("selectedCell") or context.get("selectedBlock")
    if not isinstance(selectedCell, dict):
        return
    parts.append(f"[Selected cell ({selectedCell.get('type', 'code')})]\n```\n{selectedCell.get('content', '')}\n```")
    if selectedCell.get("result"):
        parts.append(f"[Selected cell result]\n{json.dumps(selectedCell.get('result'), ensure_ascii=False)[:1200]}")


def _appendVariables(parts: list[str], context: dict[str, Any]) -> None:
    variables = context.get("variables")
    if not isinstance(variables, list):
        return
    varLines = [
        f"  {v.get('name', '?')}: {v.get('typeName', v.get('type', '?'))} = {v.get('repr', '?')}"
        for v in variables[:20]
        if isinstance(v, dict)
    ]
    if varLines:
        parts.append("[Variables]\n" + "\n".join(varLines))


def _appendDocument(parts: list[str], context: dict[str, Any]) -> None:
    document = context.get("document")
    if isinstance(document, dict) and isinstance(document.get("blocks"), list):
        blockLines = [
            f"  [{b.get('type', '?')}] {b.get('id', '?')}: {str(b.get('content', ''))[:80]}"
            for b in document["blocks"][:15]
            if isinstance(b, dict)
        ]
        if blockLines:
            title = document.get("title") or document.get("id") or "document"
            parts.append(f"[Document: {title}]\n" + "\n".join(blockLines))

    blocks = context.get("blocks")
    if isinstance(blocks, list):
        blockLines = [
            f"  [{b.get('type', '?')}] {b.get('id', '?')}: {str(b.get('content', ''))[:80]}"
            for b in blocks[:15]
            if isinstance(b, dict)
        ]
        if blockLines:
            parts.append("[Document blocks]\n" + "\n".join(blockLines))


def _appendCellMap(parts: list[str], context: dict[str, Any]) -> None:
    cellMap = context.get("cellMap")
    if not isinstance(cellMap, list) or not cellMap:
        return
    cellLines = []
    for cell in cellMap[:40]:
        if not isinstance(cell, dict):
            continue
        cellLines.append(
            "  "
            + json.dumps({
                "index": cell.get("index"),
                "id": cell.get("id"),
                "type": cell.get("type"),
                "role": cell.get("role"),
                "displayKind": cell.get("displayKind"),
                "executionKind": cell.get("executionKind"),
                "title": cell.get("title"),
                "purpose": cell.get("purpose"),
                "canRun": cell.get("canRun"),
            }, ensure_ascii=False)
        )
    if cellLines:
        parts.append("[Cell map]\n" + "\n".join(cellLines))


def _appendDependencyPreflight(parts: list[str], context: dict[str, Any]) -> None:
    dependencyPreflight = context.get("dependencyPreflight")
    if isinstance(dependencyPreflight, dict):
        parts.append("[Dependency preflight]\n" + json.dumps(dependencyPreflight, ensure_ascii=False)[:1600])


def _appendTools(parts: list[str], context: dict[str, Any]) -> None:
    tools = context.get("tools")
    if not isinstance(tools, list):
        return
    toolLines = []
    for tool in tools[:40]:
        if isinstance(tool, dict):
            toolLines.append(f"  {tool.get('name')} lane={tool.get('lane')} target={tool.get('target')} risk={tool.get('risk')}")
    if toolLines:
        parts.append("[Available tool map]\n" + "\n".join(toolLines))


def _appendWorkspace(parts: list[str], context: dict[str, Any]) -> None:
    if context.get("fileName"):
        parts.append(f"[File: {context['fileName']}]")
    workspaceFiles = context.get("workspaceFiles")
    if isinstance(workspaceFiles, list):
        fileLines = [f"  {item}" for item in workspaceFiles[:30]]
        if fileLines:
            parts.append("[Workspace files]\n" + "\n".join(fileLines))
    errorHistory = context.get("errorHistory")
    if isinstance(errorHistory, list):
        errLines = [
            f"  [{item.get('blockId', '?')}] {str(item.get('error', ''))[:200]}"
            for item in errorHistory[:5]
            if isinstance(item, dict)
        ]
        if errLines:
            parts.append("[Recent errors]\n" + "\n".join(errLines))
