from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any


@dataclass
class TeacherTraceEvent:
    eventType: str
    payload: dict[str, Any]
    elapsedMs: int


@dataclass
class TeacherTrace:
    traceId: str
    conversationId: str | None
    startedAt: float = field(default_factory=time.monotonic)
    events: list[TeacherTraceEvent] = field(default_factory=list)

    @classmethod
    def start(cls, conversationId: str | None = None) -> "TeacherTrace":
        return cls(traceId=f"trace-{uuid.uuid4().hex[:10]}", conversationId=conversationId)

    def record(self, eventType: str, payload: dict[str, Any]) -> None:
        self.events.append(
            TeacherTraceEvent(
                eventType=eventType,
                payload=payload,
                elapsedMs=int((time.monotonic() - self.startedAt) * 1000),
            )
        )
