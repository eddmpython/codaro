from __future__ import annotations

import inspect
import logging
from typing import Any, Callable

from .ai.tools import ToolDef, registerTool

logger = logging.getLogger(__name__)

_CUSTOM_TOOL_HANDLERS: dict[str, Callable[..., Any]] = {}


def getCustomToolHandler(handlerName: str) -> Callable[..., Any] | None:
    return _CUSTOM_TOOL_HANDLERS.get(handlerName)


def allCustomHandlers() -> dict[str, Callable[..., Any]]:
    return dict(_CUSTOM_TOOL_HANDLERS)


def _buildParametersSchema(func: Callable[..., Any]) -> dict[str, Any]:
    sig = inspect.signature(func)
    hints = {}
    try:
        hints = inspect.get_annotations(func, eval_str=False)
    except Exception:  # noqa: BLE001 — annotation eval may fail
        pass

    properties: dict[str, Any] = {}
    required: list[str] = []

    typeMap = {
        str: "string",
        int: "integer",
        float: "number",
        bool: "boolean",
    }

    for name, param in sig.parameters.items():
        if name == "self":
            continue
        propSchema: dict[str, Any] = {}
        hint = hints.get(name)
        if hint in typeMap:
            propSchema["type"] = typeMap[hint]
        elif hint == list or (hasattr(hint, "__origin__") and getattr(hint, "__origin__", None) is list):
            propSchema["type"] = "array"
        elif hint == dict or (hasattr(hint, "__origin__") and getattr(hint, "__origin__", None) is dict):
            propSchema["type"] = "object"
        else:
            propSchema["type"] = "string"

        propSchema["description"] = f"Parameter: {name}"
        properties[name] = propSchema

        if param.default is inspect.Parameter.empty:
            required.append(name)

    schema: dict[str, Any] = {
        "type": "object",
        "properties": properties,
    }
    if required:
        schema["required"] = required
    return schema


def tool(
    name: str | None = None,
    *,
    description: str = "",
    parameters: dict[str, Any] | None = None,
) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        toolName = name or func.__name__.replace("_", "-")
        toolDescription = description or func.__doc__ or f"Custom tool: {toolName}"
        handlerName = f"custom_{toolName.replace('-', '_')}"

        toolParams = parameters
        if toolParams is None:
            toolParams = _buildParametersSchema(func)

        toolDef = ToolDef(
            name=toolName,
            description=toolDescription,
            parameters=toolParams,
            handler=handlerName,
        )

        registerTool(toolDef)
        _CUSTOM_TOOL_HANDLERS[handlerName] = func
        logger.info("Custom tool registered: %s → %s", toolName, handlerName)

        func._codaro_tool_name = toolName
        func._codaro_handler_name = handlerName
        return func

    return decorator
