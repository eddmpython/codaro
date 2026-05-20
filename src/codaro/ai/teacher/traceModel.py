from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any


@dataclass
class TeacherTraceEvent:
    eventIndex: int
    eventType: str
    payload: dict[str, Any]
    elapsedMs: int

    def toPayload(self) -> dict[str, Any]:
        return {
            "eventIndex": self.eventIndex,
            "eventType": self.eventType,
            "elapsedMs": self.elapsedMs,
            "payload": self.payload,
        }


@dataclass
class TeacherTrace:
    traceId: str
    conversationId: str | None
    startedAt: float = field(default_factory=time.monotonic)
    events: list[TeacherTraceEvent] = field(default_factory=list)

    @classmethod
    def start(cls, conversationId: str | None = None) -> "TeacherTrace":
        return cls(traceId=f"trace-{uuid.uuid4().hex[:10]}", conversationId=conversationId)

    def record(self, eventType: str, payload: dict[str, Any]) -> TeacherTraceEvent:
        event = TeacherTraceEvent(
            eventIndex=len(self.events) + 1,
            eventType=eventType,
            payload=payload,
            elapsedMs=int((time.monotonic() - self.startedAt) * 1000),
        )
        self.events.append(event)
        return event

    def toolSequence(self) -> list[str]:
        return [
            str(event.payload.get("name"))
            for event in self.events
            if event.eventType == "tool-result" and event.payload.get("name")
        ]

    def summary(self, *, includeEvents: bool = False) -> dict[str, Any]:
        toolResults = [event for event in self.events if event.eventType == "tool-result"]
        errors = [
            event
            for event in self.events
            if event.eventType == "turn-error"
            or (event.eventType == "tool-result" and str(event.payload.get("status", "")).lower() == "error")
        ]
        policyViolations = [
            event for event in self.events
            if event.eventType == "tool-policy-violation"
        ]
        payload: dict[str, Any] = {
            "traceId": self.traceId,
            "conversationId": self.conversationId,
            "elapsedMs": int((time.monotonic() - self.startedAt) * 1000),
            "eventCount": len(self.events),
            "toolCount": len(toolResults),
            "errorCount": len(errors),
            "policyViolationCount": len(policyViolations),
            "policyViolations": [event.payload for event in policyViolations],
            "toolSequence": self.toolSequence(),
        }
        if includeEvents:
            payload["events"] = [event.toPayload() for event in self.events]
        return payload
