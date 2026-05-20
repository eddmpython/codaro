from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ToolDef:
    name: str
    description: str
    parameters: dict[str, Any]
    handler: str


_TOOL_REGISTRY: dict[str, ToolDef] = {}


def registerTool(tool: ToolDef) -> None:
    _TOOL_REGISTRY[tool.name] = tool


def getTool(name: str) -> ToolDef | None:
    return _TOOL_REGISTRY.get(name)


def allTools() -> list[ToolDef]:
    return list(_TOOL_REGISTRY.values())


def toolSchemas() -> list[dict[str, Any]]:
    return [
        {
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters,
            },
        }
        for tool in _TOOL_REGISTRY.values()
    ]
