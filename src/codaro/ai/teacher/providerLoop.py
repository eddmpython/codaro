from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Any

from ..types import ToolCall
from .clarificationPolicy import ClarificationPlan, clarificationAnswer
from .teacherOrchestrator import TeacherOrchestrator
from .toolPolicy import ToolPolicyState
from .traceModel import TeacherTrace


logger = logging.getLogger(__name__)

PROVIDER_LOOP_ERRORS = (
    AttributeError,
    ConnectionError,
    FileNotFoundError,
    ImportError,
    OSError,
    PermissionError,
    RuntimeError,
    TypeError,
    ValueError,
)


@dataclass(frozen=True)
class TeacherToolRound:
    providerToolCalls: list[dict[str, Any]]
    toolStarts: list[dict[str, Any]]
    toolResults: list[dict[str, Any]]


def teacherTurnPayload(
    *,
    conversationId: str,
    answer: str,
    provider: str,
    model: str | None,
    usage: Any,
    toolCalls: list[dict[str, Any]],
    trace: dict[str, Any],
) -> dict[str, Any]:
    return {
        "conversationId": conversationId,
        "answer": answer,
        "provider": provider,
        "model": model,
        "usage": usage,
        "toolCalls": toolCalls,
        "trace": trace,
    }


def finishTeacherTurnPayload(
    *,
    convManager: Any,
    conversationId: str,
    orchestrator: TeacherOrchestrator,
    trace: TeacherTrace,
    answer: str,
    provider: str,
    model: str | None,
    usage: Any,
    toolCalls: list[dict[str, Any]],
) -> dict[str, Any]:
    convManager.addAssistantMessage(conversationId, answer)
    tracePayload = orchestrator.finishTrace(trace, answer=answer, toolCalls=toolCalls, includeEvents=True)
    return teacherTurnPayload(
        conversationId=conversationId,
        answer=answer,
        provider=provider,
        model=model,
        usage=usage,
        toolCalls=toolCalls,
        trace=tracePayload,
    )


def finishTeacherTurnErrorPayload(
    *,
    convManager: Any,
    conversationId: str,
    orchestrator: TeacherOrchestrator,
    trace: TeacherTrace,
    provider: Any,
    error: str,
    toolCalls: list[dict[str, Any]],
) -> dict[str, Any]:
    logger.info("provider loop failed: %s", error)
    trace.record("turn-error", {"message": error})
    answer = f"provider 응답 중 오류가 발생했습니다: {error}"
    return finishTeacherTurnPayload(
        convManager=convManager,
        conversationId=conversationId,
        orchestrator=orchestrator,
        trace=trace,
        answer=answer,
        provider=providerName(provider),
        model=providerModel(provider),
        usage=None,
        toolCalls=toolCalls,
    )


async def runTeacherChatLoop(
    *,
    provider: Any,
    convManager: Any,
    conversationId: str,
    messages: list[dict[str, Any]],
    tools: list[dict[str, Any]],
    executor: Any,
    orchestrator: TeacherOrchestrator,
    clarificationPlan: ClarificationPlan | None = None,
    maxToolRounds: int = 10,
) -> dict[str, Any]:
    allToolResults: list[dict[str, Any]] = []
    policy = orchestrator.createToolPolicy()
    trace = orchestrator.startTrace(conversationId)

    if clarificationPlan and clarificationPlan.shouldAsk:
        answer = clarificationAnswer(clarificationPlan)
        trace.record("clarification-gate", clarificationPlan.payload())
        return finishTeacherTurnPayload(
            convManager=convManager,
            conversationId=conversationId,
            orchestrator=orchestrator,
            trace=trace,
            answer=answer,
            provider="codaro",
            model="clarification-gate",
            usage=None,
            toolCalls=[],
        )

    for _round in range(maxToolRounds):
        try:
            if provider.supportsNativeTools and tools:
                response = provider.completeWithTools(messages, tools)
            else:
                response = provider.complete(messages)
        except PROVIDER_LOOP_ERRORS as exc:
            return finishTeacherTurnErrorPayload(
                convManager=convManager,
                conversationId=conversationId,
                orchestrator=orchestrator,
                trace=trace,
                provider=provider,
                error=str(exc) or "provider unavailable",
                toolCalls=allToolResults,
            )

        if not provider.supportsNativeTools or not tools:
            return finishTeacherTurnPayload(
                convManager=convManager,
                conversationId=conversationId,
                orchestrator=orchestrator,
                trace=trace,
                answer=response.answer,
                provider=response.provider,
                model=response.model,
                usage=response.usage,
                toolCalls=allToolResults,
            )

        if not response.toolCalls:
            return finishTeacherTurnPayload(
                convManager=convManager,
                conversationId=conversationId,
                orchestrator=orchestrator,
                trace=trace,
                answer=response.answer,
                provider=response.provider,
                model=response.model,
                usage=response.usage,
                toolCalls=allToolResults,
            )

        roundResult = await executeTeacherToolRound(
            toolCalls=response.toolCalls,
            assistantAnswer=response.answer or "",
            convManager=convManager,
            conversationId=conversationId,
            messages=messages,
            executor=executor,
            policy=policy,
            orchestrator=orchestrator,
            trace=trace,
        )
        allToolResults.extend(roundResult.toolResults)

    try:
        finalResponse = provider.complete(messages)
    except PROVIDER_LOOP_ERRORS as exc:
        return finishTeacherTurnErrorPayload(
            convManager=convManager,
            conversationId=conversationId,
            orchestrator=orchestrator,
            trace=trace,
            provider=provider,
            error=str(exc) or "provider unavailable",
            toolCalls=allToolResults,
        )
    return finishTeacherTurnPayload(
        convManager=convManager,
        conversationId=conversationId,
        orchestrator=orchestrator,
        trace=trace,
        answer=finalResponse.answer,
        provider=finalResponse.provider,
        model=finalResponse.model,
        usage=finalResponse.usage,
        toolCalls=allToolResults,
    )


def toolCallsToProviderPayloads(toolCalls: list[ToolCall]) -> list[dict[str, Any]]:
    return [
        {
            "id": toolCall.id,
            "type": "function",
            "function": {
                "name": toolCall.name,
                "arguments": json.dumps(toolCall.arguments, ensure_ascii=False),
            },
        }
        for toolCall in toolCalls
    ]


def recordAssistantToolRequest(
    *,
    convManager: Any,
    conversationId: str,
    messages: list[dict[str, Any]],
    assistantAnswer: str,
    providerToolCalls: list[dict[str, Any]],
) -> None:
    convManager.addAssistantMessage(conversationId, assistantAnswer, toolCalls=providerToolCalls)
    messages.append({"role": "assistant", "content": assistantAnswer, "tool_calls": providerToolCalls})


def recordTeacherToolRoundRequest(
    *,
    toolCalls: list[ToolCall],
    assistantAnswer: str,
    convManager: Any,
    conversationId: str,
    messages: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    providerToolCalls = toolCallsToProviderPayloads(toolCalls)
    recordAssistantToolRequest(
        convManager=convManager,
        conversationId=conversationId,
        messages=messages,
        assistantAnswer=assistantAnswer,
        providerToolCalls=providerToolCalls,
    )
    return providerToolCalls


def startTeacherToolCall(
    *,
    orchestrator: TeacherOrchestrator,
    trace: TeacherTrace,
    toolCall: ToolCall,
) -> dict[str, Any]:
    return orchestrator.toolCallStart(trace, toolCall.id, toolCall.name, toolCall.arguments)


async def finishTeacherToolCall(
    *,
    convManager: Any,
    conversationId: str,
    messages: list[dict[str, Any]],
    executor: Any,
    policy: ToolPolicyState,
    orchestrator: TeacherOrchestrator,
    trace: TeacherTrace,
    toolCall: ToolCall,
) -> dict[str, Any]:
    violation = policy.validateStart(toolCall.name, toolCall.arguments)
    if violation is not None:
        result = orchestrator.toolPolicyViolation(trace, violation)
    else:
        result = await executor.execute(toolCall.name, toolCall.arguments)
    policy.recordResult(toolCall.name, toolCall.arguments, result)

    resultText = json.dumps(result, ensure_ascii=False)
    convManager.addToolResult(conversationId, toolCall.id, resultText)
    messages.append({"role": "tool", "tool_call_id": toolCall.id, "content": resultText})
    return orchestrator.toolCallResult(trace, toolCall.id, toolCall.name, toolCall.arguments, result)


async def executeTeacherToolRound(
    *,
    toolCalls: list[ToolCall],
    assistantAnswer: str,
    convManager: Any,
    conversationId: str,
    messages: list[dict[str, Any]],
    executor: Any,
    policy: ToolPolicyState,
    orchestrator: TeacherOrchestrator,
    trace: TeacherTrace,
) -> TeacherToolRound:
    providerToolCalls = recordTeacherToolRoundRequest(
        toolCalls=toolCalls,
        assistantAnswer=assistantAnswer,
        convManager=convManager,
        conversationId=conversationId,
        messages=messages,
    )

    toolStarts: list[dict[str, Any]] = []
    toolResults: list[dict[str, Any]] = []
    for toolCall in toolCalls:
        toolStarts.append(startTeacherToolCall(orchestrator=orchestrator, trace=trace, toolCall=toolCall))
        toolResults.append(
            await finishTeacherToolCall(
                convManager=convManager,
                conversationId=conversationId,
                messages=messages,
                executor=executor,
                policy=policy,
                orchestrator=orchestrator,
                trace=trace,
                toolCall=toolCall,
            )
        )

    return TeacherToolRound(
        providerToolCalls=providerToolCalls,
        toolStarts=toolStarts,
        toolResults=toolResults,
    )


def providerName(provider: Any) -> str:
    config = getattr(provider, "config", None)
    configured = getattr(config, "provider", None)
    if isinstance(configured, str) and configured:
        return configured
    name = getattr(provider, "provider", None)
    if isinstance(name, str) and name:
        return name
    return "provider"


def providerModel(provider: Any) -> str:
    resolved = getattr(provider, "resolvedModel", None)
    if isinstance(resolved, str) and resolved:
        return resolved
    config = getattr(provider, "config", None)
    configured = getattr(config, "model", None)
    if isinstance(configured, str) and configured:
        return configured
    return "turn-error"
