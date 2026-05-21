from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from typing import Any

from ..providerErrors import ProviderRuntimeError, providerErrorDiagnostic
from ..types import ToolCall
from .clarificationPolicy import ClarificationPlan, clarificationAnswer
from .teacherOrchestrator import TeacherOrchestrator
from .toolPolicy import ToolPolicyState
from .traceModel import TeacherTrace


logger = logging.getLogger(__name__)

def _envInt(name: str, default: int) -> int:
    try:
        return int(os.environ.get(name, str(default)))
    except ValueError:
        return default


PROVIDER_TOOL_RESULT_MAX_CHARS = _envInt("CODARO_PROVIDER_TOOL_RESULT_MAX_CHARS", 16000)
PROVIDER_TOOL_RESULT_SIGNAL_TEXT_MAX_CHARS = 240

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
    ProviderRuntimeError,
)

PROVIDER_TOOL_RESULT_SIGNAL_KEYS = (
    "ok",
    "success",
    "error",
    "message",
    "title",
    "status",
    "passed",
    "missing",
    "packages",
    "package",
    "installer",
    "environment",
    "durationMs",
    "skipped",
    "loadedInEditor",
    "documentId",
    "sectionCount",
    "exerciseCellCount",
    "snippetCellCount",
    "contractGapCount",
    "contractGaps",
    "runtimePackageCount",
    "blockCount",
    "solutionCount",
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
    error: str | BaseException,
    toolCalls: list[dict[str, Any]],
) -> dict[str, Any]:
    diagnostic = (
        providerErrorDiagnostic(error, provider=providerName(provider))
        if isinstance(error, ProviderRuntimeError)
        else None
    )
    message = diagnostic.message if diagnostic else str(error)
    logger.info("provider loop failed: %s", message)
    trace.record("turn-error", diagnostic.payload() if diagnostic else {"message": message})
    answer = message if diagnostic else f"provider 응답 중 오류가 발생했습니다: {message}"
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
        clarificationPayload = clarificationPlan.payload()
        recordPendingClarification(convManager, conversationId, clarificationPayload)
        trace.record("clarification-gate", clarificationPayload)
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
                error=exc,
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
            error=exc,
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


def recordPendingClarification(convManager: Any, conversationId: str, payload: dict[str, Any]) -> None:
    setter = getattr(convManager, "setPendingClarification", None)
    if callable(setter):
        setter(conversationId, payload)


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

    resultText = serializeToolResultForProvider(
        result,
        toolName=toolCall.name,
        arguments=toolCall.arguments,
        policy=policy,
    )
    convManager.addToolResult(conversationId, toolCall.id, resultText)
    messages.append({"role": "tool", "tool_call_id": toolCall.id, "content": resultText})
    return orchestrator.toolCallResult(trace, toolCall.id, toolCall.name, toolCall.arguments, result)


def serializeToolResultForProvider(
    result: dict[str, Any],
    *,
    maxChars: int | None = None,
    toolName: str | None = None,
    arguments: dict[str, Any] | None = None,
    policy: ToolPolicyState | None = None,
) -> str:
    providerResult = providerToolResultWithPolicyHint(
        result,
        toolName=toolName,
        arguments=arguments,
        policy=policy,
    )
    fullText = json.dumps(providerResult, ensure_ascii=False, default=str)
    limit = providerToolResultMaxChars(maxChars)
    if len(fullText) <= limit:
        return fullText
    return _boundedToolResultEnvelope(providerResult, fullText, limit)


def providerToolResultWithPolicyHint(
    result: dict[str, Any],
    *,
    toolName: str | None,
    arguments: dict[str, Any] | None,
    policy: ToolPolicyState | None,
) -> dict[str, Any]:
    if not isinstance(result, dict):
        return result
    hint = providerToolPolicyHint(toolName=toolName, arguments=arguments or {}, result=result, policy=policy)
    if not hint:
        return result
    return {
        **result,
        "codaroNextRequiredTool": hint.get("nextRequiredTool"),
        "codaroProviderInstruction": hint.get("instruction"),
        "codaroToolPolicy": hint,
    }


def providerToolPolicyHint(
    *,
    toolName: str | None,
    arguments: dict[str, Any],
    result: dict[str, Any],
    policy: ToolPolicyState | None,
) -> dict[str, Any] | None:
    if result.get("error"):
        return None
    if toolName == "packages-check":
        checked = _argumentNames(arguments)
        missing = _resultNames(result.get("missing"))
        if missing:
            return {
                "status": "packages-missing",
                "checkedPackages": checked,
                "missingPackages": missing,
                "nextRequiredTool": "packages-install",
                "instruction": (
                    "packages-check is complete. Do not call packages-check again for these packages; "
                    "call packages-install for each missing package before cell-call."
                ),
            }
        return {
            "status": "packages-ready",
            "checkedPackages": checked,
            "nextRequiredTool": "cell-call",
            "instruction": (
                "packages-check is complete and all required packages are ready. "
                "Do not call packages-check again for these packages; call cell-call for the target learning cell."
            ),
        }
    if toolName == "packages-install" and result.get("success") is True:
        unresolved = _unresolvedPackages(policy)
        return {
            "status": "package-installed",
            "nextRequiredTool": "packages-install" if unresolved else "cell-call",
            "unresolvedPackages": unresolved,
            "instruction": (
                "Package installation result is recorded. "
                "Install any remaining missing packages, otherwise call cell-call for the target learning cell."
            ),
        }
    return None


def _argumentNames(arguments: dict[str, Any]) -> list[str]:
    names = arguments.get("names")
    if isinstance(names, list):
        return [str(name) for name in names if str(name).strip()]
    name = arguments.get("name")
    return [str(name)] if str(name or "").strip() else []


def _resultNames(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []
    return [str(name) for name in value if str(name).strip()]


def _unresolvedPackages(policy: ToolPolicyState | None) -> list[str]:
    if policy is None:
        return []
    unresolved = (policy.requiredPackages & policy.missingPackages) - policy.installedPackages
    return sorted(unresolved)


def providerToolResultMaxChars(maxChars: int | None = None) -> int:
    value = PROVIDER_TOOL_RESULT_MAX_CHARS if maxChars is None else maxChars
    if not isinstance(value, int) or isinstance(value, bool) or value < 512:
        return 512
    return value


def _boundedToolResultEnvelope(result: dict[str, Any], fullText: str, limit: int) -> str:
    previewLength = min(4000, max(0, limit // 2))
    while previewLength >= 0:
        envelope = {
            "truncated": True,
            "truncatedReason": "provider-tool-result-max-chars",
            "originalChars": len(fullText),
            "maxChars": limit,
            **_providerToolResultSignals(result),
        }
        if previewLength:
            envelope["preview"] = fullText[:previewLength]
        boundedText = json.dumps(envelope, ensure_ascii=False, default=str)
        if len(boundedText) <= limit or previewLength == 0:
            if len(boundedText) <= limit:
                return boundedText
            return _minimalToolResultEnvelope(result, fullText, limit)
        previewLength = max(0, previewLength - max(128, len(boundedText) - limit))
    return _minimalToolResultEnvelope(result, fullText, limit)


def _minimalToolResultEnvelope(result: dict[str, Any], fullText: str, limit: int) -> str:
    envelope = {
        "truncated": True,
        "truncatedReason": "provider-tool-result-max-chars",
        "originalChars": len(fullText),
        "maxChars": limit,
    }
    for key in ("ok", "success", "loadedInEditor", "sectionCount", "exerciseCellCount", "contractGapCount"):
        if key in result:
            envelope[key] = _compactProviderSignalValue(result[key])
    return json.dumps(envelope, ensure_ascii=False, default=str)


def _providerToolResultSignals(result: dict[str, Any]) -> dict[str, Any]:
    signals: dict[str, Any] = {}
    for key in PROVIDER_TOOL_RESULT_SIGNAL_KEYS:
        if key not in result:
            continue
        value = result[key]
        if key == "contractGaps" and isinstance(value, list):
            signals[key] = [_compactProviderSignalValue(item) for item in value[:8]]
        elif key == "packages" and isinstance(value, list):
            signals[key] = [_compactProviderSignalValue(item) for item in value[:20]]
        else:
            signals[key] = _compactProviderSignalValue(value)
    return signals


def _compactProviderSignalValue(value: Any, *, depth: int = 0) -> Any:
    if isinstance(value, str):
        if len(value) <= PROVIDER_TOOL_RESULT_SIGNAL_TEXT_MAX_CHARS:
            return value
        return f"{value[:PROVIDER_TOOL_RESULT_SIGNAL_TEXT_MAX_CHARS]}...[truncated]"
    if isinstance(value, list):
        if depth >= 2:
            return f"[{len(value)} items]"
        return [_compactProviderSignalValue(item, depth=depth + 1) for item in value[:20]]
    if isinstance(value, dict):
        if depth >= 2:
            return {"keys": list(value.keys())[:8]}
        return {
            str(key): _compactProviderSignalValue(item, depth=depth + 1)
            for key, item in list(value.items())[:16]
        }
    return value


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
