from __future__ import annotations

import asyncio
import logging
import threading
from collections.abc import AsyncIterator
from dataclasses import dataclass
from typing import Any

from .providerLoop import (
    finishTeacherTurnPayload,
    finishTeacherToolCall,
    recordTeacherToolRoundRequest,
    startTeacherToolCall,
)
from .streamEvents import (
    teacherStreamDeltaEvent,
    teacherStreamDoneEvent,
    teacherStreamErrorEvent,
    teacherStreamStartEvent,
    teacherStreamTokenEvent,
    teacherStreamToolResultsEvent,
    teacherStreamToolStartEvent,
)
from .teacherOrchestrator import TeacherOrchestrator
from .traceModel import TeacherTrace

logger = logging.getLogger(__name__)

PROVIDER_STREAM_ERRORS = (
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
class ProviderStreamError:
    message: str


async def runTeacherChatStream(
    *,
    provider: Any,
    convManager: Any,
    conversationId: str,
    messages: list[dict[str, Any]],
    tools: list[dict[str, Any]],
    executor: Any,
    orchestrator: TeacherOrchestrator,
    maxToolRounds: int = 10,
) -> AsyncIterator[dict[str, Any]]:
    allToolResults: list[dict[str, Any]] = []
    policy = orchestrator.createToolPolicy()
    trace = orchestrator.startTrace(conversationId)

    yield teacherStreamStartEvent(conversationId)

    if not (provider.supportsNativeTools and tools):
        async for event in streamTeacherTokens(
            provider=provider,
            convManager=convManager,
            conversationId=conversationId,
            messages=messages,
            orchestrator=orchestrator,
            trace=trace,
        ):
            yield event
        return

    for _round in range(maxToolRounds):
        response = provider.completeWithTools(messages, tools)

        if not response.toolCalls:
            donePayload = finishTeacherTurnPayload(
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
            if response.answer:
                yield teacherStreamTokenEvent(response.answer)
            yield teacherStreamDoneEvent(donePayload)
            return

        recordTeacherToolRoundRequest(
            toolCalls=response.toolCalls,
            assistantAnswer=response.answer or "",
            convManager=convManager,
            conversationId=conversationId,
            messages=messages,
        )

        if response.answer:
            yield teacherStreamTokenEvent(response.answer)

        toolResults: list[dict[str, Any]] = []
        for toolCall in response.toolCalls:
            toolStart = startTeacherToolCall(orchestrator=orchestrator, trace=trace, toolCall=toolCall)
            yield teacherStreamToolStartEvent(toolStart)
            payload = await finishTeacherToolCall(
                convManager=convManager,
                conversationId=conversationId,
                messages=messages,
                executor=executor,
                policy=policy,
                orchestrator=orchestrator,
                trace=trace,
                toolCall=toolCall,
            )
            toolResults.append(payload)
            allToolResults.append(payload)

        yield teacherStreamToolResultsEvent(toolResults)

    async for event in streamTeacherTokens(
        provider=provider,
        convManager=convManager,
        conversationId=conversationId,
        messages=messages,
        orchestrator=orchestrator,
        trace=trace,
        toolCalls=allToolResults,
    ):
        yield event


async def streamTeacherTokens(
    *,
    provider: Any,
    convManager: Any,
    conversationId: str,
    messages: list[dict[str, Any]],
    orchestrator: TeacherOrchestrator,
    trace: TeacherTrace,
    toolCalls: list[dict[str, Any]] | None = None,
) -> AsyncIterator[dict[str, Any]]:
    loop = asyncio.get_running_loop()
    queue: asyncio.Queue[str | ProviderStreamError | None] = asyncio.Queue()

    def runStream() -> None:
        try:
            for token in provider.stream(messages):
                loop.call_soon_threadsafe(queue.put_nowait, token)
        except PROVIDER_STREAM_ERRORS as exc:
            logger.info("provider stream failed: %s", exc)
            loop.call_soon_threadsafe(queue.put_nowait, ProviderStreamError(str(exc)))
        finally:
            loop.call_soon_threadsafe(queue.put_nowait, None)

    thread = threading.Thread(target=runStream, daemon=True)
    thread.start()

    accumulated = ""
    streamError: ProviderStreamError | None = None
    while True:
        item = await queue.get()
        if item is None:
            break
        if isinstance(item, ProviderStreamError):
            streamError = item
            break
        token = item
        accumulated += token
        yield teacherStreamDeltaEvent(delta=token, content=accumulated)

    if streamError is not None:
        trace.record("turn-error", {"message": streamError.message})
        yield teacherStreamErrorEvent(error=streamError.message, trace=trace.summary())
        thread.join(timeout=2)
        return

    donePayload = finishTeacherTurnPayload(
        convManager=convManager,
        conversationId=conversationId,
        orchestrator=orchestrator,
        trace=trace,
        answer=accumulated,
        provider=provider.config.provider,
        model=provider.resolvedModel,
        usage=None,
        toolCalls=toolCalls or [],
    )
    yield teacherStreamDoneEvent(donePayload)
    thread.join(timeout=2)
