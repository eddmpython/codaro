from __future__ import annotations

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
