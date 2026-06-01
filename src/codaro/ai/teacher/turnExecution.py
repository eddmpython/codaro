from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Any

from .providerLoop import runTeacherChatLoop
from .providerStream import runTeacherChatStream
from .turnRuntime import TeacherRuntimeTurn


async def runTeacherRuntimeTurn(
    runtimeTurn: TeacherRuntimeTurn,
    *,
    convManager: Any,
    maxToolRounds: int = 10,
) -> dict[str, Any]:
    return await runTeacherChatLoop(
        provider=runtimeTurn.turn.provider,
        convManager=convManager,
        conversationId=runtimeTurn.turn.conversationId,
        messages=runtimeTurn.turn.messages,
        tools=runtimeTurn.turn.tools,
        executor=runtimeTurn.executor,
        orchestrator=runtimeTurn.orchestrator,
        clarificationPlan=runtimeTurn.turn.clarificationPlan,
        maxToolRounds=maxToolRounds,
    )


async def streamTeacherRuntimeTurn(
    runtimeTurn: TeacherRuntimeTurn,
    *,
    convManager: Any,
    maxToolRounds: int = 10,
) -> AsyncIterator[dict[str, Any]]:
    async for event in runTeacherChatStream(
        provider=runtimeTurn.turn.provider,
        convManager=convManager,
        conversationId=runtimeTurn.turn.conversationId,
        messages=runtimeTurn.turn.messages,
        tools=runtimeTurn.turn.tools,
        executor=runtimeTurn.executor,
        orchestrator=runtimeTurn.orchestrator,
        clarificationPlan=runtimeTurn.turn.clarificationPlan,
        maxToolRounds=maxToolRounds,
    ):
        yield event
