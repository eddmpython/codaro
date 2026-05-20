from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any

from ..types import ToolCall
from .teacherOrchestrator import TeacherOrchestrator
from .toolPolicy import ToolPolicyState
from .traceModel import TeacherTrace


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
    tracePayload = orchestrator.finishTrace(trace, answer=answer, toolCalls=toolCalls)
    return teacherTurnPayload(
        conversationId=conversationId,
        answer=answer,
        provider=provider,
        model=model,
        usage=usage,
        toolCalls=toolCalls,
        trace=tracePayload,
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
    maxToolRounds: int = 10,
) -> dict[str, Any]:
    allToolResults: list[dict[str, Any]] = []
    policy = orchestrator.createToolPolicy()
    trace = orchestrator.startTrace(conversationId)

    for _round in range(maxToolRounds):
        if provider.supportsNativeTools and tools:
            response = provider.completeWithTools(messages, tools)
        else:
            response = provider.complete(messages)

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

    finalResponse = provider.complete(messages)
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
    providerToolCalls = toolCallsToProviderPayloads(toolCalls)
    recordAssistantToolRequest(
        convManager=convManager,
        conversationId=conversationId,
        messages=messages,
        assistantAnswer=assistantAnswer,
        providerToolCalls=providerToolCalls,
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
