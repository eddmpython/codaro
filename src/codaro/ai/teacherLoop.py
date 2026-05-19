from __future__ import annotations

import json
from typing import Any


def injectContext(message: str, context: dict[str, Any]) -> str:
    parts: list[str] = []
    if context.get("instruction"):
        parts.append(f"[Codaro procedure]\n{context['instruction']}")

    selectedCell = context.get("selectedCell") or context.get("selectedBlock")
    if isinstance(selectedCell, dict):
        parts.append(f"[Selected cell ({selectedCell.get('type', 'code')})]\n```\n{selectedCell.get('content', '')}\n```")
        if selectedCell.get("result"):
            parts.append(f"[Selected cell result]\n{json.dumps(selectedCell.get('result'), ensure_ascii=False)[:1200]}")

    variables = context.get("variables")
    if isinstance(variables, list):
        varLines = [
            f"  {v.get('name', '?')}: {v.get('typeName', v.get('type', '?'))} = {v.get('repr', '?')}"
            for v in variables[:20]
            if isinstance(v, dict)
        ]
        if varLines:
            parts.append("[Variables]\n" + "\n".join(varLines))

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

    cellMap = context.get("cellMap")
    if isinstance(cellMap, list) and cellMap:
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

    dependencyPreflight = context.get("dependencyPreflight")
    if isinstance(dependencyPreflight, dict):
        parts.append("[Dependency preflight]\n" + json.dumps(dependencyPreflight, ensure_ascii=False)[:1600])

    tools = context.get("tools")
    if isinstance(tools, list):
        toolLines = []
        for tool in tools[:40]:
            if isinstance(tool, dict):
                toolLines.append(
                    f"  {tool.get('name')} lane={tool.get('lane')} target={tool.get('target')} risk={tool.get('risk')}"
                )
        if toolLines:
            parts.append("[Available tool map]\n" + "\n".join(toolLines))

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

    if not parts:
        return message
    contextStr = "\n\n".join(parts)
    return f"{message}\n\n---\nContext:\n{contextStr}"


def toolCallStart(
    toolCallId: str,
    name: str,
    arguments: dict[str, Any],
) -> dict[str, Any]:
    return {
        "id": toolCallId,
        "toolCallId": toolCallId,
        "name": name,
        "arguments": arguments,
        "status": "running",
    }


def toolCallResult(
    toolCallId: str,
    name: str,
    arguments: dict[str, Any],
    result: dict[str, Any],
) -> dict[str, Any]:
    error = result.get("error") if isinstance(result, dict) else None
    return {
        "id": toolCallId,
        "toolCallId": toolCallId,
        "name": name,
        "arguments": arguments,
        "status": "error" if error else "done",
        "error": error,
        "result": result,
    }
