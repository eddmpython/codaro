from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

from ..factory import createProvider
from ..toolExecutor import ToolExecutor
from ..types import LLMConfig
from .teacherOrchestrator import TeacherOrchestrator
from .turnSession import TeacherTurnSession, prepareTeacherTurn


@dataclass(frozen=True)
class TeacherRuntimeTurn:
    turn: TeacherTurnSession
    orchestrator: TeacherOrchestrator
    executor: ToolExecutor


@dataclass(frozen=True)
class TeacherRuntimeTurnRequest:
    message: str
    context: Any = None
    conversationId: str | None = None
    sessionId: str | None = None
    providerOverride: str | None = None
    roleOverride: str | None = None

    @classmethod
    def fromPayload(cls, payload: Mapping[str, Any]) -> TeacherRuntimeTurnRequest:
        return cls(
            conversationId=_optionalPayloadText(payload.get("conversationId")),
            message=_payloadText(payload.get("message"), fallback=""),
            sessionId=_optionalPayloadText(payload.get("sessionId")),
            providerOverride=_optionalPayloadText(payload.get("provider")),
            roleOverride=_optionalPayloadText(payload.get("role")),
            context=payload.get("context"),
        )


def _payloadText(value: Any, *, fallback: str) -> str:
    if value is None:
        return fallback
    if isinstance(value, str):
        return value
    return str(value)


def _optionalPayloadText(value: Any) -> str | None:
    if value is None:
        return None
    if isinstance(value, str):
        return value
    return str(value)


def prepareTeacherRuntimeTurnFromRequest(
    *,
    convManager: Any,
    profileManager: Any,
    sessionManager: Any,
    documentPath: str | Path | None,
    workspaceRoot: str | Path | None,
    request: TeacherRuntimeTurnRequest,
    providerFactory: Callable[[LLMConfig], Any] = createProvider,
) -> TeacherRuntimeTurn:
    return prepareTeacherRuntimeTurn(
        convManager=convManager,
        profileManager=profileManager,
        sessionManager=sessionManager,
        documentPath=documentPath,
        workspaceRoot=workspaceRoot,
        conversationId=request.conversationId,
        message=request.message,
        context=request.context,
        sessionId=request.sessionId,
        providerOverride=request.providerOverride,
        roleOverride=request.roleOverride,
        providerFactory=providerFactory,
    )


def prepareTeacherRuntimeTurn(
    *,
    convManager: Any,
    profileManager: Any,
    sessionManager: Any,
    documentPath: str | Path | None,
    workspaceRoot: str | Path | None,
    message: str,
    context: Any = None,
    conversationId: str | None = None,
    sessionId: str | None = None,
    providerOverride: str | None = None,
    roleOverride: str | None = None,
    providerFactory: Callable[[LLMConfig], Any] = createProvider,
) -> TeacherRuntimeTurn:
    orchestrator = TeacherOrchestrator.fromContext(context)
    turn = prepareTeacherTurn(
        convManager=convManager,
        profileManager=profileManager,
        conversationId=conversationId,
        message=orchestrator.injectContext(message),
        providerOverride=providerOverride,
        roleOverride=roleOverride,
        providerFactory=providerFactory,
    )
    executor = createTeacherToolExecutor(
        sessionManager=sessionManager,
        documentPath=documentPath,
        workspaceRoot=workspaceRoot,
        sessionId=sessionId,
    )
    return TeacherRuntimeTurn(turn=turn, orchestrator=orchestrator, executor=executor)


def createTeacherToolExecutor(
    *,
    sessionManager: Any,
    documentPath: str | Path | None,
    workspaceRoot: str | Path | None,
    sessionId: str | None = None,
) -> ToolExecutor:
    from ...document.service import loadDocument, saveDocument

    docPath = Path(documentPath) if documentPath is not None else None

    def documentGetter():
        if docPath is None:
            return None
        try:
            return loadDocument(str(docPath))
        except (FileNotFoundError, OSError):
            return None

    def documentSetter(doc) -> None:
        if docPath is not None:
            saveDocument(str(docPath), doc)

    executor = ToolExecutor(
        sessionManager=sessionManager,
        documentGetter=documentGetter if docPath is not None else None,
        documentSetter=documentSetter if docPath is not None else None,
        workspaceRoot=str(workspaceRoot) if workspaceRoot is not None else None,
    )
    if sessionId:
        executor.setActiveSession(sessionId)
    return executor
