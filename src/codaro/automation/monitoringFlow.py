from __future__ import annotations

from typing import Any

from .audit import getAuditTrail


def automationResourceUsagePayload(sessionManager: Any | None) -> dict[str, Any]:
    if sessionManager is None:
        return {"sessions": []}

    snapshots: list[dict[str, Any]] = []
    for session in sessionManager.listSessions():
        engine = getattr(session, "engine", None)
        if engine is None or not hasattr(engine, "getResourceUsage"):
            continue
        snap = engine.getResourceUsage()
        snapshots.append({
            "sessionId": session.id,
            "memoryMb": round(snap.memoryMb, 1),
            "cpuPercent": round(snap.cpuPercent, 1),
            "uptime": round(snap.uptime, 1),
            "alive": snap.alive,
        })
    return {"sessions": snapshots}


def automationAuditLogPayload(
    *,
    actionType: str | None = None,
    date: str | None = None,
    limit: int = 100,
) -> dict[str, Any]:
    trail = getAuditTrail()
    if date:
        entries = trail.queryFromDisk(date=date, actionType=actionType, limit=limit)
    else:
        entries = [
            entry.serialize()
            for entry in trail.query(actionType=actionType, limit=limit)
        ]
    return {"entries": entries, "count": len(entries)}
