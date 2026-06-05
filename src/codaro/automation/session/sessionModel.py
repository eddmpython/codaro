from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any

from ..taskModel import TaskStatus


def _nowIso() -> str:
    return datetime.now(timezone.utc).isoformat()


class SessionKind(str, Enum):
    """영속 자동화 세션이 보유하는 라이브 객체 종류."""

    BROWSER = "browser"
    DESKTOP = "desktop"


class SessionStatus(str, Enum):
    """세션 lifecycle 상태. BUSY 는 registry 가 단일-writer 보장을 위해 step 동안 잠깐 둔다."""

    OPENING = "opening"
    LIVE = "live"
    BUSY = "busy"
    CLOSING = "closing"
    CLOSED = "closed"
    FAILED = "failed"


@dataclass
class SessionDefinition:
    """세션 재오픈 레시피. 직렬화·영속 가능(라이브 객체와 분리)."""

    id: str = field(default_factory=lambda: f"session-{uuid.uuid4().hex[:10]}")
    name: str = ""
    kind: SessionKind = SessionKind.BROWSER
    options: dict[str, Any] = field(default_factory=dict)
    createdAt: str = field(default_factory=_nowIso)

    def serialize(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "kind": self.kind.value,
            "options": self.options,
            "createdAt": self.createdAt,
        }


@dataclass
class SessionStepRecord:
    """runStep 한 번의 결과. TaskRun 모양을 차용하고 step 결과는 TaskStatus 로 표기한다."""

    id: str = field(default_factory=lambda: f"step-{uuid.uuid4().hex[:10]}")
    sessionId: str = ""
    action: str = ""
    status: TaskStatus = TaskStatus.PENDING
    startedAt: str | None = None
    finishedAt: str | None = None
    durationMs: int | None = None
    error: str | None = None
    result: dict[str, Any] = field(default_factory=dict)

    def serialize(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "sessionId": self.sessionId,
            "action": self.action,
            "status": self.status.value,
            "startedAt": self.startedAt,
            "finishedAt": self.finishedAt,
            "durationMs": self.durationMs,
            "error": self.error,
            "result": self.result,
        }


@dataclass
class SessionHandle:
    """라이브 in-memory 자원의 상태 스냅샷. 라이브 객체/스레드/루프는 registry 가 따로 보유한다."""

    definition: SessionDefinition
    status: SessionStatus = SessionStatus.OPENING
    openedAt: str | None = None
    lastActiveAt: str | None = None
    stepCount: int = 0
    lastError: str | None = None

    def serialize(self) -> dict[str, Any]:
        return {
            "sessionId": self.definition.id,
            "name": self.definition.name,
            "kind": self.definition.kind.value,
            "status": self.status.value,
            "options": self.definition.options,
            "openedAt": self.openedAt,
            "lastActiveAt": self.lastActiveAt,
            "stepCount": self.stepCount,
            "lastError": self.lastError,
        }
