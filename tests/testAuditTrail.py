from __future__ import annotations

import json
from pathlib import Path

from codaro.automation.audit import AuditEntry, AuditTrail


def testAuditEntrySerialize() -> None:
    entry = AuditEntry(
        timestamp=1700000000.0,
        actionType="click",
        source="ai",
        parameters={"x": 100, "y": 200},
    )
    data = entry.serialize()
    assert data["actionType"] == "click"
    assert data["source"] == "ai"
    assert data["parameters"]["x"] == 100
    assert data["success"] is True
    assert "iso" in data


def testAuditEntryErrorField() -> None:
    entry = AuditEntry(
        timestamp=1700000000.0,
        actionType="click",
        source="ai",
        success=False,
        error="Rate limit exceeded",
    )
    data = entry.serialize()
    assert data["success"] is False
    assert data["error"] == "Rate limit exceeded"


def testAuditTrailRecord(tmp_path: Path) -> None:
    trail = AuditTrail(auditDir=tmp_path)
    entry = trail.record("click", "ai", {"x": 10})

    assert entry.actionType == "click"
    assert entry.source == "ai"

    jsonlFiles = list(tmp_path.glob("audit-*.jsonl"))
    assert len(jsonlFiles) == 1

    lines = jsonlFiles[0].read_text(encoding="utf-8").strip().splitlines()
    assert len(lines) == 1
    parsed = json.loads(lines[0])
    assert parsed["actionType"] == "click"

    trail.dispose()


def testAuditTrailQuery(tmp_path: Path) -> None:
    trail = AuditTrail(auditDir=tmp_path)
    trail.record("click", "ai")
    trail.record("typeText", "ai")
    trail.record("click", "user")

    allEntries = trail.query()
    assert len(allEntries) == 3

    clicksOnly = trail.query(actionType="click")
    assert len(clicksOnly) == 2

    aiOnly = trail.query(source="ai")
    assert len(aiOnly) == 2

    limited = trail.query(limit=1)
    assert len(limited) == 1

    trail.dispose()


def testAuditTrailQueryFromDisk(tmp_path: Path) -> None:
    trail = AuditTrail(auditDir=tmp_path)
    trail.record("click", "ai", {"x": 1})
    trail.record("scroll", "user", {"clicks": 3})
    trail.dispose()

    trail2 = AuditTrail(auditDir=tmp_path)
    diskEntries = trail2.queryFromDisk(actionType="click")
    assert len(diskEntries) == 1
    assert diskEntries[0]["actionType"] == "click"
    trail2.dispose()


def testAuditTrailClear(tmp_path: Path) -> None:
    trail = AuditTrail(auditDir=tmp_path)
    trail.record("click", "ai")
    trail.record("scroll", "ai")

    assert len(trail.query()) == 2
    trail.clear()
    assert len(trail.query()) == 0

    trail.dispose()


def testAuditTrailDisposeIdempotent(tmp_path: Path) -> None:
    trail = AuditTrail(auditDir=tmp_path)
    trail.record("click", "ai")
    trail.dispose()
    trail.dispose()
