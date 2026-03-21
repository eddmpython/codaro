from __future__ import annotations

import time
from pathlib import Path

from .protocol import SessionInfo
from .session import KernelSession

SESSION_MAX_IDLE_SECONDS = 3600
MAX_SESSIONS = 10


class SessionManager:
    def __init__(self, workspaceRoot: str | Path | None = None) -> None:
        self._sessions: dict[str, KernelSession] = {}
        self._lastActivity: dict[str, float] = {}
        self._workspaceRoot = Path(workspaceRoot).expanduser().resolve() if workspaceRoot is not None else None

    def createSession(self, workingDirectory: str | None = None) -> KernelSession:
        if len(self._sessions) >= MAX_SESSIONS:
            self.reapExpired()
        if len(self._sessions) >= MAX_SESSIONS:
            oldest = min(self._lastActivity, key=self._lastActivity.get, default=None)
            if oldest is not None:
                self.destroySession(oldest)
        sessionWorkingDirectory = workingDirectory or (str(self._workspaceRoot) if self._workspaceRoot is not None else None)
        session = KernelSession(
            workingDirectory=sessionWorkingDirectory,
            workspaceRoot=str(self._workspaceRoot) if self._workspaceRoot is not None else None,
        )
        self._sessions[session.sessionId] = session
        self._lastActivity[session.sessionId] = time.monotonic()
        return session

    def touchSession(self, sessionId: str) -> None:
        if sessionId in self._sessions:
            self._lastActivity[sessionId] = time.monotonic()

    def getSession(self, sessionId: str) -> KernelSession | None:
        session = self._sessions.get(sessionId)
        if session is not None:
            self._lastActivity[sessionId] = time.monotonic()
        return session

    def reapExpired(self, maxIdleSeconds: float = SESSION_MAX_IDLE_SECONDS) -> int:
        now = time.monotonic()
        expired = [
            sid for sid, lastActive in self._lastActivity.items()
            if (now - lastActive) > maxIdleSeconds
        ]
        for sid in expired:
            self.destroySession(sid)
        return len(expired)

    def listSessions(self) -> list[SessionInfo]:
        return [
            SessionInfo(
                sessionId=session.sessionId,
                status=session.status,
                executionCount=session.executionCount,
                variableCount=len(session._collectVariables()),
            )
            for session in self._sessions.values()
        ]

    def destroySession(self, sessionId: str) -> bool:
        session = self._sessions.pop(sessionId, None)
        self._lastActivity.pop(sessionId, None)
        if session is None:
            return False
        session.dispose()
        return True

    def destroyAll(self) -> None:
        for session in self._sessions.values():
            session.dispose()
        self._sessions.clear()
        self._lastActivity.clear()

    @property
    def sessionCount(self) -> int:
        return len(self._sessions)
