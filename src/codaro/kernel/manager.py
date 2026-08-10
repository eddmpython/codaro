from __future__ import annotations

import time
from collections.abc import Callable
from pathlib import Path
import threading

from .protocol import SessionInfo
from .session import KernelSession
from ..runtime.executionPolicy import ExecutionSecurityPolicy

SESSION_MAX_IDLE_SECONDS = 3600
MAX_SESSIONS = 10


class SessionCapacityError(RuntimeError):
    pass


class SessionManager:
    def __init__(
        self,
        workspaceRoot: str | Path | None = None,
        *,
        executionPolicy: ExecutionSecurityPolicy | None = None,
        runtimeEnvironment: dict[str, str] | None = None,
        clearEnvironment: bool = False,
        pythonPaths: list[str] | None = None,
        sessionFactory: Callable[[str | None], KernelSession] | None = None,
        onSessionDestroyed: Callable[[KernelSession], None] | None = None,
        maxSessions: int = MAX_SESSIONS,
        rejectWhenFull: bool = False,
    ) -> None:
        self._sessions: dict[str, KernelSession] = {}
        self._lastActivity: dict[str, float] = {}
        self._workspaceRoot = Path(workspaceRoot).expanduser().resolve() if workspaceRoot is not None else None
        self._executionPolicy = executionPolicy
        self._runtimeEnvironment = dict(runtimeEnvironment or {})
        self._clearEnvironment = clearEnvironment
        self._pythonPaths = list(pythonPaths or [])
        self._sessionFactory = sessionFactory
        self._onSessionDestroyed = onSessionDestroyed
        if maxSessions < 1:
            raise ValueError("maxSessions must be positive")
        self._maxSessions = maxSessions
        self._rejectWhenFull = rejectWhenFull
        self._lock = threading.RLock()

    def createSession(self, workingDirectory: str | None = None) -> KernelSession:
        with self._lock:
            if len(self._sessions) >= self._maxSessions:
                self.reapExpired()
            if len(self._sessions) >= self._maxSessions:
                if self._rejectWhenFull:
                    raise SessionCapacityError(f"session capacity reached: {self._maxSessions}")
                oldest = min(self._lastActivity, key=self._lastActivity.get, default=None)
                if oldest is not None:
                    self.destroySession(oldest)
            sessionWorkingDirectory = workingDirectory or (str(self._workspaceRoot) if self._workspaceRoot is not None else None)
            session = (
                self._sessionFactory(workingDirectory)
                if self._sessionFactory is not None
                else KernelSession(
                    workingDirectory=sessionWorkingDirectory,
                    workspaceRoot=str(self._workspaceRoot) if self._workspaceRoot is not None else None,
                    executionPolicy=self._executionPolicy,
                    runtimeEnvironment=self._runtimeEnvironment,
                    clearEnvironment=self._clearEnvironment,
                    pythonPaths=self._pythonPaths,
                )
            )
            self._sessions[session.sessionId] = session
            self._lastActivity[session.sessionId] = time.monotonic()
            return session

    def touchSession(self, sessionId: str) -> None:
        with self._lock:
            if sessionId in self._sessions:
                self._lastActivity[sessionId] = time.monotonic()

    def getSession(self, sessionId: str) -> KernelSession | None:
        with self._lock:
            session = self._sessions.get(sessionId)
            if session is not None:
                self._lastActivity[sessionId] = time.monotonic()
            return session

    def reapExpired(self, maxIdleSeconds: float = SESSION_MAX_IDLE_SECONDS) -> int:
        with self._lock:
            now = time.monotonic()
            expired = [
                sid for sid, lastActive in self._lastActivity.items()
                if (now - lastActive) > maxIdleSeconds
            ]
        for sid in expired:
            self.destroySession(sid)
        return len(expired)

    def listSessions(self) -> list[SessionInfo]:
        with self._lock:
            sessions = list(self._sessions.values())
        return [
            SessionInfo(
                sessionId=session.sessionId,
                status=session.status,
                executionCount=session.executionCount,
                variableCount=len(session._collectVariables()),
            )
            for session in sessions
        ]

    def destroySession(self, sessionId: str) -> bool:
        with self._lock:
            session = self._sessions.pop(sessionId, None)
            self._lastActivity.pop(sessionId, None)
        if session is None:
            return False
        session.dispose()
        if self._onSessionDestroyed is not None:
            self._onSessionDestroyed(session)
        return True

    def destroyAll(self) -> None:
        with self._lock:
            sessions = list(self._sessions.values())
            self._sessions.clear()
            self._lastActivity.clear()
        errors: list[BaseException] = []
        for session in sessions:
            try:
                session.dispose()
                if self._onSessionDestroyed is not None:
                    self._onSessionDestroyed(session)
            except (OSError, RuntimeError) as error:
                errors.append(error)
        if errors:
            raise RuntimeError(
                f"failed to destroy {len(errors)} of {len(sessions)} sessions: {errors[0]}"
            ) from errors[0]

    @property
    def sessionCount(self) -> int:
        with self._lock:
            return len(self._sessions)
