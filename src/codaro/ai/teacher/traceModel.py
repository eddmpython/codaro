from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any

from .toolPolicy import normalizeToolPolicyViolations


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
            "policyViolations": list(normalizeToolPolicyViolations(event.payload for event in policyViolations)),
            "toolSequence": self.toolSequence(),
            "workloop": self.workloopEvents(),
            "yamlContractObserved": self.yamlContractObserved(),
        }
        if includeEvents:
            payload["events"] = [event.toPayload() for event in self.events]
        return payload

    def workloopEvents(self) -> list[dict[str, Any]]:
        workloop: list[dict[str, Any]] = []
        for event in self.events:
            if event.eventType in {"tool-start", "tool-result"} and event.payload.get("workLabel"):
                workloop.append({
                    "eventIndex": event.eventIndex,
                    "eventType": event.eventType,
                    "toolCallId": event.payload.get("toolCallId"),
                    "toolName": event.payload.get("name"),
                    "status": event.payload.get("status"),
                    "error": event.payload.get("error"),
                    "category": event.payload.get("category"),
                    "lane": event.payload.get("lane"),
                    "target": event.payload.get("target"),
                    "risk": event.payload.get("risk"),
                    "workLabel": event.payload.get("workLabel"),
                    "workDetail": event.payload.get("workDetail"),
                    "elapsedMs": event.elapsedMs,
                })
                continue
            if event.eventType == "tool-policy-violation":
                workloop.append(_policyViolationWorkloopEvent(event))
                continue
            if event.eventType == "turn-error":
                workloop.append(_turnErrorWorkloopEvent(event))
                continue
            if event.eventType == "clarification-gate":
                workloop.append(_clarificationWorkloopEvent(event))
        return workloop

    def yamlContractObserved(self) -> bool:
        return any(
            bool(event.payload.get("yamlContractObserved"))
            for event in self.events
            if event.eventType == "tool-result"
        )


def _policyViolationWorkloopEvent(event: TeacherTraceEvent) -> dict[str, Any]:
    policyCode = _payloadText(event.payload, "policyCode") or _payloadText(event.payload, "policy")
    toolName = _payloadText(event.payload, "toolName") or _payloadText(event.payload, "tool")
    message = _payloadText(event.payload, "message") or _payloadText(event.payload, "error")
    detail = " · ".join(item for item in (toolName, policyCode) if item)
    return {
        "eventIndex": event.eventIndex,
        "eventType": event.eventType,
        "toolName": toolName,
        "status": "error",
        "error": message,
        "category": "policy",
        "lane": "safety",
        "target": "teacher-tool-policy",
        "risk": "safety",
        "workLabel": "도구 정책 확인",
        "workDetail": detail or "tool policy violation",
        "elapsedMs": event.elapsedMs,
    }


def _turnErrorWorkloopEvent(event: TeacherTraceEvent) -> dict[str, Any]:
    message = _payloadText(event.payload, "message") or _payloadText(event.payload, "error")
    provider = _payloadText(event.payload, "provider")
    code = _payloadText(event.payload, "code")
    action = _payloadText(event.payload, "action")
    workDetail = _turnErrorWorkDetail(provider=provider, code=code, action=action)
    return {
        "eventIndex": event.eventIndex,
        "eventType": event.eventType,
        "status": "error",
        "error": message,
        "category": "provider",
        "lane": "read",
        "target": "provider-loop",
        "risk": "normal",
        "workLabel": "provider 오류",
        "workDetail": workDetail,
        **({"provider": provider} if provider else {}),
        **({"diagnosticCode": code} if code else {}),
        **({"diagnosticAction": action} if action else {}),
        "elapsedMs": event.elapsedMs,
    }


def _turnErrorWorkDetail(*, provider: str, code: str, action: str) -> str:
    parts = [
        f"provider:{provider}" if provider else "",
        f"code:{code}" if code else "",
        f"action:{action}" if action else "",
    ]
    detail = " · ".join(part for part in parts if part)
    return detail or "provider 응답 처리 중단"


def _clarificationWorkloopEvent(event: TeacherTraceEvent) -> dict[str, Any]:
    questions = event.payload.get("questions")
    assumptions = event.payload.get("assumptions")
    questionCount = len(questions) if isinstance(questions, list) else 0
    workDetail = _clarificationWorkDetail(questionCount, assumptions)
    return {
        "eventIndex": event.eventIndex,
        "eventType": event.eventType,
        "status": "waiting",
        "category": "teacher",
        "lane": "read",
        "target": "clarification-gate",
        "risk": "normal",
        "workLabel": "작업 전 확인 질문",
        "workDetail": workDetail,
        "elapsedMs": event.elapsedMs,
    }


def _clarificationWorkDetail(questionCount: int, assumptions: Any) -> str:
    if not isinstance(assumptions, dict):
        return f"핵심 질문 {questionCount}개 · 작업 기준 0개"
    summary = [
        value
        for key in ("level", "depth", "environment", "balance")
        if isinstance(value := assumptions.get(key), str) and value
    ]
    if not summary:
        return f"핵심 질문 {questionCount}개 · 작업 기준 {len(assumptions)}개"
    return f"핵심 질문 {questionCount}개 · 작업 기준: {' / '.join(summary)}"


def _payloadText(payload: dict[str, Any], key: str) -> str:
    value = payload.get(key)
    return value if isinstance(value, str) else ""
