from __future__ import annotations

from typing import Any

from ..toolManifest import toolDescriptor
from .traceModel import TeacherTraceEvent


def toolCallStart(
    toolCallId: str,
    name: str,
    arguments: dict[str, Any],
    *,
    traceId: str | None = None,
    traceEvent: TeacherTraceEvent | None = None,
) -> dict[str, Any]:
    descriptor = toolDescriptor(name)
    payload = {
        "id": toolCallId,
        "toolCallId": toolCallId,
        "name": name,
        "arguments": arguments,
        "status": "running",
        "category": descriptor.get("category"),
        "lane": descriptor.get("lane"),
        "target": descriptor.get("target"),
        "risk": descriptor.get("risk"),
    }
    if traceId:
        payload["traceId"] = traceId
    if traceEvent:
        payload["traceEventIndex"] = traceEvent.eventIndex
        payload["turnElapsedMs"] = traceEvent.elapsedMs
    return payload


def toolCallResult(
    toolCallId: str,
    name: str,
    arguments: dict[str, Any],
    result: dict[str, Any],
    *,
    traceId: str | None = None,
    traceEvent: TeacherTraceEvent | None = None,
) -> dict[str, Any]:
    error = result.get("error") if isinstance(result, dict) else None
    descriptor = toolDescriptor(name)
    payload = {
        "id": toolCallId,
        "toolCallId": toolCallId,
        "name": name,
        "arguments": arguments,
        "status": "error" if error else "done",
        "error": error,
        "result": result,
        "category": descriptor.get("category"),
        "lane": descriptor.get("lane"),
        "target": descriptor.get("target"),
        "risk": descriptor.get("risk"),
    }
    if traceId:
        payload["traceId"] = traceId
    if traceEvent:
        payload["traceEventIndex"] = traceEvent.eventIndex
        payload["turnElapsedMs"] = traceEvent.elapsedMs
    return payload
