from __future__ import annotations

import logging
import threading
import time
from typing import Any, Awaitable, Callable

from ..audit import getAuditTrail
from ..eStop import EmergencyStopActive, getEmergencyStop
from ..taskModel import TaskStatus
from .browserDriver import browserState, buildBrowserStep, createBrowserDriver
from .persistentSession import PersistentSession, SessionError
from .sessionModel import (
    SessionDefinition,
    SessionHandle,
    SessionKind,
    SessionStatus,
    SessionStepRecord,
    _nowIso,
)

logger = logging.getLogger(__name__)

MAX_SESSION_STEPS = 50
DEFAULT_STEP_TIMEOUT_SECONDS = 300.0

DriverFactory = Callable[[], Awaitable[Any]]
StepBuilder = Callable[[str, dict[str, Any]], Callable[[Any], Awaitable[Any]]]
StateFn = Callable[[Any], Awaitable[dict[str, Any]]]


class SessionRegistryError(RuntimeError):
    """세션 조회/상태 위반(미존재, busy, 미지원 kind 등). flow 가 HTTP status 로 매핑한다."""


class _SessionRuntime:
    __slots__ = ("session", "stepBuilder", "stateFn")

    def __init__(self, session: PersistentSession, stepBuilder: StepBuilder, stateFn: StateFn | None) -> None:
        self.session = session
        self.stepBuilder = stepBuilder
        self.stateFn = stateFn


class SessionRegistry:
    """프로세스 전역 영속 세션 레지스트리. 각 세션은 자체 스레드+루프를 보유한다.

    E-Stop 안전은 open/runStep 진입의 getEmergencyStop().check() 로 보장한다(taskRunner 와 동일 스파인).
    라이브 핸들은 in-memory only — 프로세스 재시작에 휘발한다(라이브 브라우저는 부활 불가).
    """

    def __init__(self) -> None:
        self._handles: dict[str, SessionHandle] = {}
        self._runtimes: dict[str, _SessionRuntime] = {}
        self._steps: dict[str, list[SessionStepRecord]] = {}
        self._lock = threading.Lock()

    def _resolveKind(
        self,
        definition: SessionDefinition,
        driverFactory: DriverFactory | None,
        stepBuilder: StepBuilder | None,
        stateFn: StateFn | None,
    ) -> tuple[DriverFactory, StepBuilder, StateFn | None]:
        if driverFactory is not None:
            if stepBuilder is None:
                raise SessionRegistryError("driverFactory 주입 시 stepBuilder 도 필요합니다")
            return driverFactory, stepBuilder, stateFn
        if definition.kind is SessionKind.BROWSER:
            return (lambda: createBrowserDriver(definition.options)), buildBrowserStep, browserState
        raise SessionRegistryError(f"지원하지 않는 session kind: {definition.kind.value}")

    async def open(
        self,
        definition: SessionDefinition,
        *,
        driverFactory: DriverFactory | None = None,
        stepBuilder: StepBuilder | None = None,
        stateFn: StateFn | None = None,
    ) -> SessionHandle:
        getEmergencyStop().check()
        factory, builder, state = self._resolveKind(definition, driverFactory, stepBuilder, stateFn)
        session = PersistentSession(definition.id, estopCheck=getEmergencyStop().check)
        handle = SessionHandle(definition=definition, status=SessionStatus.OPENING)
        with self._lock:
            self._handles[definition.id] = handle
            self._runtimes[definition.id] = _SessionRuntime(session, builder, state)
            self._steps[definition.id] = []
        try:
            await session.open(factory)
        except SessionError as exc:
            with self._lock:
                handle.status = SessionStatus.FAILED
                handle.lastError = str(exc)
            getAuditTrail().record(
                "automationSessionOpen",
                "session-registry",
                {"kind": definition.kind.value, "name": definition.name},
                sessionId=definition.id,
                success=False,
                error=str(exc),
            )
            raise SessionRegistryError(str(exc)) from exc
        now = _nowIso()
        with self._lock:
            handle.status = SessionStatus.LIVE
            handle.openedAt = now
            handle.lastActiveAt = now
        getAuditTrail().record(
            "automationSessionOpen",
            "session-registry",
            {"kind": definition.kind.value, "name": definition.name},
            sessionId=definition.id,
            success=True,
        )
        return handle

    def get(self, sessionId: str) -> SessionHandle | None:
        return self._handles.get(sessionId)

    def listSessions(self) -> list[SessionHandle]:
        with self._lock:
            return list(self._handles.values())

    def getSteps(self, sessionId: str, limit: int = 20) -> list[SessionStepRecord]:
        return self._steps.get(sessionId, [])[-limit:]

    async def currentState(self, sessionId: str) -> dict[str, Any] | None:
        handle = self._handles.get(sessionId)
        runtime = self._runtimes.get(sessionId)
        if handle is None or runtime is None or runtime.stateFn is None:
            return None
        if handle.status is not SessionStatus.LIVE:
            return None
        stateFn = runtime.stateFn
        try:
            return await runtime.session.runStep(lambda driver: stateFn(driver), timeoutSeconds=30.0)
        except (SessionError, EmergencyStopActive) as exc:
            logger.warning("session %s 상태 조회 실패: %s", sessionId, exc)
            return None

    async def runStep(
        self,
        sessionId: str,
        action: str,
        params: dict[str, Any],
        *,
        timeoutSeconds: float = DEFAULT_STEP_TIMEOUT_SECONDS,
    ) -> SessionStepRecord:
        handle = self._handles.get(sessionId)
        runtime = self._runtimes.get(sessionId)
        if handle is None or runtime is None:
            raise SessionRegistryError("session not found")
        getEmergencyStop().check()
        with self._lock:
            if handle.status is SessionStatus.BUSY:
                raise SessionRegistryError("session busy")
            if handle.status is not SessionStatus.LIVE:
                raise SessionRegistryError(f"session not live: {handle.status.value}")
            handle.status = SessionStatus.BUSY
        record = SessionStepRecord(
            sessionId=sessionId, action=action, startedAt=_nowIso(), status=TaskStatus.RUNNING
        )
        startMono = time.monotonic()
        newStatus = SessionStatus.LIVE
        try:
            step = runtime.stepBuilder(action, params)
            result = await runtime.session.runStep(step, timeoutSeconds=timeoutSeconds)
            record.status = TaskStatus.SUCCESS
            record.result = result if isinstance(result, dict) else {"value": result}
        except EmergencyStopActive as exc:
            record.status = TaskStatus.CANCELLED
            record.error = str(exc)
        except Exception as exc:  # noqa: BLE001 — step execution boundary
            record.status = TaskStatus.FAILED
            record.error = str(exc)
            newStatus = SessionStatus.LIVE if runtime.session.isLive else SessionStatus.FAILED
        finally:
            record.finishedAt = _nowIso()
            record.durationMs = int((time.monotonic() - startMono) * 1000)
            with self._lock:
                handle.status = newStatus
                handle.stepCount += 1
                handle.lastActiveAt = record.finishedAt
                if record.error:
                    handle.lastError = record.error
                self._appendStepLocked(record)
            getAuditTrail().record(
                f"automationSessionStep:{action}",
                "session-registry",
                {"action": action, "status": record.status.value},
                sessionId=sessionId,
                success=record.status == TaskStatus.SUCCESS,
                error=record.error,
            )
        return record

    def _appendStepLocked(self, record: SessionStepRecord) -> None:
        steps = self._steps.setdefault(record.sessionId, [])
        steps.append(record)
        if len(steps) > MAX_SESSION_STEPS:
            self._steps[record.sessionId] = steps[-MAX_SESSION_STEPS:]

    async def close(self, sessionId: str, reason: str = "explicit") -> bool:
        runtime = self._runtimes.get(sessionId)
        handle = self._handles.get(sessionId)
        if runtime is None or handle is None:
            return False
        try:
            await runtime.session.close(reason=reason)
        finally:
            with self._lock:
                handle.status = SessionStatus.CLOSED
                handle.lastActiveAt = _nowIso()
        getAuditTrail().record(
            "automationSessionClose",
            "session-registry",
            {"reason": reason, "stepCount": handle.stepCount},
            sessionId=sessionId,
            success=True,
        )
        return True

    async def closeAll(self) -> None:
        for sessionId in list(self._handles.keys()):
            await self.close(sessionId, reason="close-all")


_registry: SessionRegistry | None = None


def getSessionRegistry() -> SessionRegistry:
    global _registry
    if _registry is None:
        _registry = SessionRegistry()
    return _registry


def resetSessionRegistry() -> None:
    global _registry
    _registry = None
