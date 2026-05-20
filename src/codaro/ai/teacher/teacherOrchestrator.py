from __future__ import annotations

from typing import Any

from .clarificationPolicy import buildClarificationPlan
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
        context = dict(self._context)
        clarificationPlan = buildClarificationPlan(message, context)
        if clarificationPlan.shouldAsk:
            context["clarificationPlan"] = clarificationPlan.payload()
        return injectContext(message, context) if context else message

    def createToolPolicy(self) -> ToolPolicyState:
        return ToolPolicyState.fromContext(self._context)

    def startTrace(self, conversationId: str | None) -> TeacherTrace:
        trace = TeacherTrace.start(conversationId=conversationId)
        trace.record("turn-start", {"hasContext": bool(self._context)})
        return trace

    def toolCallStart(self, trace: TeacherTrace, toolCallId: str, name: str, arguments: dict[str, Any]) -> dict[str, Any]:
        event = trace.record("tool-start", {"toolCallId": toolCallId, "name": name})
        payload = toolCallStart(toolCallId, name, arguments, traceId=trace.traceId, traceEvent=event)
        event.payload.update({
            "workLabel": payload.get("workLabel"),
            "workDetail": payload.get("workDetail"),
        })
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
        event = trace.record("tool-result", {"toolCallId": toolCallId, "name": name, "status": resultStatus(result)})
        payload = toolCallResult(toolCallId, name, arguments, result, traceId=trace.traceId, traceEvent=event)
        event.payload.update({
            "workLabel": payload.get("workLabel"),
            "workDetail": payload.get("workDetail"),
            "yamlContractObserved": learningContractObserved(result) if name == "write-curriculum-yaml" else None,
        })
        return payload

    def finishTrace(
        self,
        trace: TeacherTrace,
        *,
        answer: str | None = None,
        toolCalls: list[dict[str, Any]] | None = None,
        includeEvents: bool = False,
    ) -> dict[str, Any]:
        trace.record(
            "turn-finish",
            {
                "answerLength": len(answer or ""),
                "toolCount": len(toolCalls or []),
            },
        )
        return trace.summary(includeEvents=includeEvents)


def resultStatus(result: dict[str, Any]) -> str:
    if isinstance(result, dict) and result.get("error"):
        return "error"
    return "done"


def learningContractObserved(result: dict[str, Any]) -> bool:
    document = result.get("document") if isinstance(result, dict) else None
    if not isinstance(document, dict):
        return False
    blocks = document.get("blocks")
    if not isinstance(blocks, list):
        return False
    for block in blocks:
        if not isinstance(block, dict):
            continue
        payload = block.get("payload")
        if not isinstance(payload, dict):
            continue
        if isinstance(payload.get("learningContract"), dict):
            return True
        if isinstance(payload.get("sectionContract"), dict):
            return True
    return False
