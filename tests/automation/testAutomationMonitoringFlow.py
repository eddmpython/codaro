from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from codaro.automation.monitoringFlow import (
    automationAuditLogPayload,
    automationResourceUsagePayload,
)


@dataclass(frozen=True)
class FakeResourceUsage:
    memoryMb: float
    cpuPercent: float
    uptime: float
    alive: bool


class FakeEngine:
    def getResourceUsage(self) -> FakeResourceUsage:
        return FakeResourceUsage(
            memoryMb=12.34,
            cpuPercent=3.45,
            uptime=67.89,
            alive=True,
        )


class FakeSession:
    def __init__(self, sessionId: str, engine: Any) -> None:
        self.id = sessionId
        self.engine = engine


class FakeSessionManager:
    def listSessions(self) -> list[FakeSession]:
        return [
            FakeSession("session-1", FakeEngine()),
            FakeSession("session-2", object()),
        ]


class FakeAuditEntry:
    def serialize(self) -> dict[str, Any]:
        return {"actionType": "taskRun", "source": "test"}


class FakeAuditTrail:
    def __init__(self) -> None:
        self.memoryQuery: dict[str, Any] | None = None
        self.diskQuery: dict[str, Any] | None = None

    def query(self, *, actionType: str | None, limit: int) -> list[FakeAuditEntry]:
        self.memoryQuery = {"actionType": actionType, "limit": limit}
        return [FakeAuditEntry()]

    def queryFromDisk(
        self,
        *,
        date: str,
        actionType: str | None,
        limit: int,
    ) -> list[dict[str, Any]]:
        self.diskQuery = {"date": date, "actionType": actionType, "limit": limit}
        return [{"actionType": actionType, "source": "disk"}]


def testMonitoringFlowBuildsResourceUsagePayload() -> None:
    payload = automationResourceUsagePayload(FakeSessionManager())

    assert payload == {
        "sessions": [{
            "sessionId": "session-1",
            "memoryMb": 12.3,
            "cpuPercent": 3.5,
            "uptime": 67.9,
            "alive": True,
        }],
    }


def testMonitoringFlowHandlesMissingSessionManager() -> None:
    assert automationResourceUsagePayload(None) == {"sessions": []}


def testMonitoringFlowBuildsMemoryAuditPayload(monkeypatch) -> None:
    trail = FakeAuditTrail()
    monkeypatch.setattr("codaro.automation.monitoringFlow.getAuditTrail", lambda: trail)

    payload = automationAuditLogPayload(actionType="taskRun", limit=8)

    assert trail.memoryQuery == {"actionType": "taskRun", "limit": 8}
    assert payload == {
        "entries": [{"actionType": "taskRun", "source": "test"}],
        "count": 1,
    }


def testMonitoringFlowBuildsDiskAuditPayload(monkeypatch) -> None:
    trail = FakeAuditTrail()
    monkeypatch.setattr("codaro.automation.monitoringFlow.getAuditTrail", lambda: trail)

    payload = automationAuditLogPayload(
        actionType="taskRun",
        date="2026-06-01",
        limit=20,
    )

    assert trail.diskQuery == {
        "date": "2026-06-01",
        "actionType": "taskRun",
        "limit": 20,
    }
    assert payload == {
        "entries": [{"actionType": "taskRun", "source": "disk"}],
        "count": 1,
    }
