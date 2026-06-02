from __future__ import annotations

import logging
from collections.abc import AsyncIterator, Mapping
from pathlib import Path
from typing import Any

from .completion import CodeCompletionRequest, completeCodeFromRequest, emptyCompletionResult
from .profile import getProfileManager
from .providerErrors import ProviderRuntimeError, providerErrorPayload
from .teacher import (
    TeacherConversationNotFound,
    prepareTeacherRuntimeTurnFromPayload,
    runTeacherRuntimeTurn,
    streamTeacherRuntimeTurn,
    teacherStreamSseFrame,
)

logger = logging.getLogger(__name__)

CHAT_FLOW_ERRORS = (
    AttributeError,
    ProviderRuntimeError,
    ConnectionError,
    FileNotFoundError,
    ImportError,
    OSError,
    PermissionError,
    RuntimeError,
    TypeError,
    ValueError,
)

ChatFlowConversationNotFound = TeacherConversationNotFound


def chatFlowErrorPayload(exc: Exception) -> dict[str, Any]:
    return providerErrorPayload(exc)


async def runChatTurnPayload(
    *,
    payload: Mapping[str, Any],
    convManager: Any,
    sessionManager: Any,
    documentPath: str | Path | None,
    workspaceRoot: str | Path | None,
) -> dict[str, Any]:
    runtimeTurn = _prepareChatRuntimeTurn(
        payload=payload,
        convManager=convManager,
        sessionManager=sessionManager,
        documentPath=documentPath,
        workspaceRoot=workspaceRoot,
    )
    return await runTeacherRuntimeTurn(
        runtimeTurn,
        convManager=convManager,
    )


def streamChatTurnSseFrames(
    *,
    payload: Mapping[str, Any],
    convManager: Any,
    sessionManager: Any,
    documentPath: str | Path | None,
    workspaceRoot: str | Path | None,
) -> AsyncIterator[str]:
    runtimeTurn = _prepareChatRuntimeTurn(
        payload=payload,
        convManager=convManager,
        sessionManager=sessionManager,
        documentPath=documentPath,
        workspaceRoot=workspaceRoot,
    )

    async def frames() -> AsyncIterator[str]:
        async for event in streamTeacherRuntimeTurn(
            runtimeTurn,
            convManager=convManager,
        ):
            yield teacherStreamSseFrame(event)

    return frames()


def buildCodeCompletionPayload(payload: Mapping[str, Any]) -> dict[str, Any]:
    completionRequest = CodeCompletionRequest.fromPayload(payload)
    try:
        return completeCodeFromRequest(
            profileManager=getProfileManager(),
            request=completionRequest,
        ).payload()
    except CHAT_FLOW_ERRORS as exc:
        logger.info("completion failed: %s", exc)
        return emptyCompletionResult().payload()


def _prepareChatRuntimeTurn(
    *,
    payload: Mapping[str, Any],
    convManager: Any,
    sessionManager: Any,
    documentPath: str | Path | None,
    workspaceRoot: str | Path | None,
) -> Any:
    return prepareTeacherRuntimeTurnFromPayload(
        convManager=convManager,
        profileManager=getProfileManager(),
        sessionManager=sessionManager,
        documentPath=documentPath,
        workspaceRoot=workspaceRoot,
        payload=payload,
    )
