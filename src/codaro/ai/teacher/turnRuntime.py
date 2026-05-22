from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

from ..factory import createProvider
from ..toolExecutor import ToolExecutor
from ..types import LLMConfig
from .clarificationPolicy import (
    BALANCE_MARKERS,
    DEPTH_MARKERS,
    ENVIRONMENT_MARKERS,
    LEVEL_MARKERS,
    LEARNING_KEYWORDS,
    buildClarificationPlan,
)
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
    displayLocale: str | None = None
    sessionId: str | None = None
    providerOverride: str | None = None
    roleOverride: str | None = None

    @classmethod
    def fromPayload(cls, payload: Mapping[str, Any]) -> TeacherRuntimeTurnRequest:
        return cls(
            conversationId=_optionalPayloadText(payload.get("conversationId")),
            displayLocale=_optionalPayloadText(payload.get("displayLocale")),
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
        displayLocale=request.displayLocale,
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
    displayLocale: str | None = None,
    sessionId: str | None = None,
    providerOverride: str | None = None,
    roleOverride: str | None = None,
    providerFactory: Callable[[LLMConfig], Any] = createProvider,
) -> TeacherRuntimeTurn:
    contextMap = teacherTurnContext(
        context=context,
        convManager=convManager,
        conversationId=conversationId,
        displayLocale=displayLocale,
        message=message,
    )
    orchestrator = TeacherOrchestrator.fromContext(contextMap)
    clarificationPlan = buildClarificationPlan(message, contextMap)
    gateClarification = clarificationPlan.shouldAsk
    turn = prepareTeacherTurn(
        convManager=convManager,
        profileManager=profileManager,
        conversationId=conversationId,
        message=message if gateClarification else orchestrator.injectContext(message),
        providerOverride=providerOverride,
        roleOverride=roleOverride,
        clarificationPlan=clarificationPlan if gateClarification else None,
        skipProvider=gateClarification,
        providerFactory=providerFactory,
    )
    executor = createTeacherToolExecutor(
        sessionManager=sessionManager,
        documentPath=documentPath,
        workspaceRoot=workspaceRoot,
        sessionId=sessionId,
    )
    return TeacherRuntimeTurn(turn=turn, orchestrator=orchestrator, executor=executor)


def teacherTurnContext(
    *,
    context: Any,
    convManager: Any,
    conversationId: str | None,
    displayLocale: str | None,
    message: str,
) -> dict[str, Any]:
    contextMap = dict(context) if isinstance(context, dict) else {}
    normalizedLocale = _normalizedDisplayLocale(displayLocale)
    if normalizedLocale and "displayLocale" not in contextMap:
        contextMap["displayLocale"] = normalizedLocale
    pendingClarification = consumePendingClarification(convManager, conversationId)
    if (
        pendingClarification is not None
        and "clarificationPlan" not in contextMap
        and shouldApplyPendingClarification(message, pendingClarification)
    ):
        contextMap["clarificationPlan"] = pendingClarification
    return contextMap


def _normalizedDisplayLocale(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip().lower()
    if normalized.startswith("en"):
        return "en"
    if normalized.startswith("ko"):
        return "ko"
    return None


CONTINUATION_MARKERS = (
    "진행",
    "그대로",
    "좋아",
    "좋습니다",
    "네",
    "예",
    "응",
    "ㅇㅇ",
    "맞아",
    "맞습니다",
    "ok",
    "okay",
    "yes",
    "go",
    "continue",
    "proceed",
)

STALE_CLARIFICATION_RESET_MARKERS = (
    "취소",
    "무시",
    "처음부터",
    "새로",
    "새 주제",
    "새 커리큘럼",
    "다른 주제",
    "다른 걸",
    "다른거",
    "cancel",
    "ignore",
    "reset",
    "new topic",
    "different topic",
)

CLARIFICATION_AXIS_MARKERS = (
    *LEVEL_MARKERS,
    *DEPTH_MARKERS,
    *BALANCE_MARKERS,
    *ENVIRONMENT_MARKERS,
)

NEW_LEARNING_REQUEST_MARKERS = tuple(
    marker for marker in LEARNING_KEYWORDS if marker not in {"실습", "practice"}
)


def shouldApplyPendingClarification(message: str, pendingClarification: Mapping[str, Any]) -> bool:
    assumptions = pendingClarification.get("assumptions")
    if not isinstance(assumptions, dict):
        return False

    normalized = " ".join(message.lower().split())
    if not normalized or _hasPendingMarker(normalized, STALE_CLARIFICATION_RESET_MARKERS):
        return False
    if normalized in CONTINUATION_MARKERS:
        return True
    if len(normalized) <= 80 and _hasPendingMarker(normalized, CONTINUATION_MARKERS):
        return True
    if _hasPendingMarker(normalized, NEW_LEARNING_REQUEST_MARKERS):
        return False
    return len(normalized) <= 120 and _hasPendingMarker(normalized, CLARIFICATION_AXIS_MARKERS)


def _hasPendingMarker(normalizedMessage: str, markers: tuple[str, ...]) -> bool:
    return any(marker in normalizedMessage for marker in markers)


def consumePendingClarification(convManager: Any, conversationId: str | None) -> dict[str, Any] | None:
    if not conversationId:
        return None
    consumer = getattr(convManager, "consumePendingClarification", None)
    if not callable(consumer):
        return None
    payload = consumer(conversationId)
    return dict(payload) if isinstance(payload, dict) else None


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
