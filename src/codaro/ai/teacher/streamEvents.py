from __future__ import annotations

import json
from typing import Any


def teacherStreamStartEvent(conversationId: str) -> dict[str, Any]:
    return {"type": "start", "conversationId": conversationId}


def teacherStreamDeltaEvent(*, delta: str, content: str) -> dict[str, Any]:
    return {"type": "delta", "delta": delta, "content": content}


def teacherStreamTokenEvent(content: str) -> dict[str, Any]:
    return {"type": "token", "content": content}


def teacherStreamToolStartEvent(toolCall: dict[str, Any]) -> dict[str, Any]:
    return {"type": "tool_start", "toolCall": toolCall}


def teacherStreamToolResultsEvent(toolCalls: list[dict[str, Any]]) -> dict[str, Any]:
    return {"type": "tool_results", "toolCalls": toolCalls}


def teacherStreamDoneEvent(payload: dict[str, Any]) -> dict[str, Any]:
    return {"type": "done", **payload}


def teacherStreamErrorEvent(*, error: str, trace: dict[str, Any]) -> dict[str, Any]:
    return {"type": "error", "error": error, "trace": trace}


def teacherStreamSseFrame(event: dict[str, Any]) -> str:
    return f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
