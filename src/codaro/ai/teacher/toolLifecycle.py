from __future__ import annotations

from typing import Any


def toolCallStart(
    toolCallId: str,
    name: str,
    arguments: dict[str, Any],
    *,
    traceId: str | None = None,
) -> dict[str, Any]:
    payload = {
        "id": toolCallId,
        "toolCallId": toolCallId,
        "name": name,
        "arguments": arguments,
        "status": "running",
    }
    if traceId:
        payload["traceId"] = traceId
    return payload


def toolCallResult(
    toolCallId: str,
    name: str,
    arguments: dict[str, Any],
    result: dict[str, Any],
    *,
    traceId: str | None = None,
) -> dict[str, Any]:
    error = result.get("error") if isinstance(result, dict) else None
    payload = {
        "id": toolCallId,
        "toolCallId": toolCallId,
        "name": name,
        "arguments": arguments,
        "status": "error" if error else "done",
        "error": error,
        "result": result,
    }
    if traceId:
        payload["traceId"] = traceId
    return payload
