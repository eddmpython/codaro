from __future__ import annotations

from typing import Any

from .contextBuilder import injectContext
from .toolLifecycle import toolCallResult, toolCallStart
from .toolPolicy import ToolPolicyState, ToolPolicyViolation
from .traceModel import TeacherTrace


class TeacherOrchestrator:
    def __init__(self, context: dict[str, Any] | None = None) -> None:
        self._context = context if isinstance(context, dict) else {}

    @classmethod
    def fromContext(cls, context: dict[str, Any] | None) -> "TeacherOrchestrator":
        return cls(context)

    def injectContext(self, message: str) -> str:
        return injectContext(message, self._context) if self._context else message

    def createToolPolicy(self) -> ToolPolicyState:
        return ToolPolicyState.fromContext(self._context)

    def startTrace(self, conversationId: str | None) -> TeacherTrace:
        trace = TeacherTrace.start(conversationId=conversationId)
        trace.record("turn-start", {"hasContext": bool(self._context)})
        return trace

    def toolCallStart(self, trace: TeacherTrace, toolCallId: str, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        payload = toolCallStart(toolCallId, name, arguments, traceId=trace.traceId)
        trace.record("tool-start", {"toolCallId": toolCallId, "name": name})
        return payload

    def toolPolicyViolation(
        self,
        trace: TeacherTrace,
        violation: ToolPolicyViolation,
    ) -> dict[str, Any]:
        result = violation.asResult()
        trace.record("tool-policy-violation", result)
        return result

    def toolCallResult(
        self,
        trace: TeacherTrace,
        toolCallId: str,
        name: str,
        arguments: dict[str, Any],
        result: dict[str, Any],
    ) -> dict[str, Any]:
        payload = toolCallResult(toolCallId, name, arguments, result, traceId=trace.traceId)
        trace.record("tool-result", {"toolCallId": toolCallId, "name": name, "status": payload["status"]})
        return payload
