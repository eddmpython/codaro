from __future__ import annotations

from typing import Any

from .eStop import EmergencyStopActive
from .session.sessionModel import SessionDefinition, SessionKind
from .session.sessionRegistry import SessionRegistryError, getSessionRegistry


class AutomationSessionFlowError(Exception):
    """세션 도메인 오류를 transport status 로 옮기기 위한 파사드 예외(taskFlow 패턴)."""

    def __init__(self, statusCode: int, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.message = message


def _kindFromStr(kind: str) -> SessionKind:
    try:
        return SessionKind(kind)
    except ValueError as exc:
        raise AutomationSessionFlowError(400, f"지원하지 않는 session kind: {kind}") from exc


async def openAutomationSessionPayload(
    *,
    kind: str = "browser",
    name: str = "",
    options: dict[str, Any] | None = None,
) -> dict[str, Any]:
    definition = SessionDefinition(name=name, kind=_kindFromStr(kind), options=dict(options or {}))
    registry = getSessionRegistry()
    try:
        handle = await registry.open(definition)
    except EmergencyStopActive as exc:
        raise AutomationSessionFlowError(409, str(exc)) from exc
    except SessionRegistryError as exc:
        raise AutomationSessionFlowError(503, str(exc)) from exc
    result = handle.serialize()
    state = await registry.currentState(definition.id)
    if state is not None:
        result["state"] = state
    return result


def listAutomationSessionsPayload() -> dict[str, Any]:
    registry = getSessionRegistry()
    sessions = registry.listSessions()
    return {
        "sessions": [handle.serialize() for handle in sessions],
        "total": len(sessions),
    }


async def getAutomationSessionStatePayload(sessionId: str) -> dict[str, Any]:
    registry = getSessionRegistry()
    handle = registry.get(sessionId)
    if handle is None:
        raise AutomationSessionFlowError(404, "Session not found")
    result = handle.serialize()
    result["steps"] = [step.serialize() for step in registry.getSteps(sessionId)]
    state = await registry.currentState(sessionId)
    if state is not None:
        result["state"] = state
    return result


async def runAutomationSessionStepPayload(
    sessionId: str,
    *,
    action: str,
    params: dict[str, Any] | None = None,
) -> dict[str, Any]:
    registry = getSessionRegistry()
    if registry.get(sessionId) is None:
        raise AutomationSessionFlowError(404, "Session not found")
    try:
        record = await registry.runStep(sessionId, action, dict(params or {}))
    except EmergencyStopActive as exc:
        raise AutomationSessionFlowError(409, str(exc)) from exc
    except SessionRegistryError as exc:
        message = str(exc)
        if "busy" in message:
            statusCode = 409
        elif "not found" in message:
            statusCode = 404
        else:
            statusCode = 400
        raise AutomationSessionFlowError(statusCode, message) from exc
    return record.serialize()


async def closeAutomationSessionPayload(sessionId: str, *, reason: str = "explicit") -> dict[str, Any]:
    closed = await getSessionRegistry().close(sessionId, reason=reason)
    if not closed:
        raise AutomationSessionFlowError(404, "Session not found")
    return {"ok": True, "sessionId": sessionId}
