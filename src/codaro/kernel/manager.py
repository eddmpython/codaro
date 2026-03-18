from __future__ import annotations

from pathlib import Path

from .protocol import SessionInfo
from .session import KernelSession


class SessionManager:
    def __init__(self, workspaceRoot: str | Path | None = None) -> None:
        self._sessions: dict[str, KernelSession] = {}
        self._workspaceRoot = Path(workspaceRoot).expanduser().resolve() if workspaceRoot is not None else None

    def createSession(self, workingDirectory: str | None = None) -> KernelSession:
        sessionWorkingDirectory = workingDirectory or (str(self._workspaceRoot) if self._workspaceRoot is not None else None)
        session = KernelSession(
            workingDirectory=sessionWorkingDirectory,
            workspaceRoot=str(self._workspaceRoot) if self._workspaceRoot is not None else None,
        )
        self._sessions[session.sessionId] = session
        return session

    def getSession(self, sessionId: str) -> KernelSession | None:
        return self._sessions.get(sessionId)

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
        if session is None:
            return False
        session.dispose()
        return True

    def destroyAll(self) -> None:
        for session in self._sessions.values():
            session.dispose()
        self._sessions.clear()

    @property
    def sessionCount(self) -> int:
        return len(self._sessions)
