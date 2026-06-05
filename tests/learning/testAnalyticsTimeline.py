"""AnalyticsTimeline — daily snapshot store 테스트."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from codaro.curriculum.analyticsTimeline import (
    AnalyticsTimeline,
    DailySnapshot,
    buildSnapshot,
)
from codaro.curriculum.outcomeMastery import MasteryReport
from codaro.curriculum.progress import ProgressTracker


def _makeSnapshot(d: str, mastered: int = 0) -> DailySnapshot:
    return DailySnapshot(date=d, masteredCount=mastered, totalOutcomes=10)


def testAppendAndLoadRange(tmp_path: Path) -> None:
    timeline = AnalyticsTimeline(storagePath=tmp_path / "tl.jsonl")
    timeline.append(_makeSnapshot("2026-01-01"))
    timeline.append(_makeSnapshot("2026-01-02"))
    timeline.append(_makeSnapshot("2026-01-05"))
    snaps = timeline.loadRange()
    assert [s.date for s in snaps] == ["2026-01-01", "2026-01-02", "2026-01-05"]


def testAppendIsIdempotentPerDay(tmp_path: Path) -> None:
    timeline = AnalyticsTimeline(storagePath=tmp_path / "tl.jsonl")
    timeline.append(_makeSnapshot("2026-01-01", mastered=3))
    timeline.append(_makeSnapshot("2026-01-01", mastered=5))
    snaps = timeline.loadRange()
    assert len(snaps) == 1
    assert snaps[0].masteredCount == 5


def testLoadRangeFiltersDates(tmp_path: Path) -> None:
    timeline = AnalyticsTimeline(storagePath=tmp_path / "tl.jsonl")
    for day in ("2026-01-01", "2026-01-05", "2026-01-10"):
        timeline.append(_makeSnapshot(day))
    filtered = timeline.loadRange(start="2026-01-02", end="2026-01-08")
    assert [s.date for s in filtered] == ["2026-01-05"]


def testLatestReturnsMostRecent(tmp_path: Path) -> None:
    timeline = AnalyticsTimeline(storagePath=tmp_path / "tl.jsonl")
    timeline.append(_makeSnapshot("2026-01-01"))
    timeline.append(_makeSnapshot("2026-01-15"))
    timeline.append(_makeSnapshot("2026-01-10"))
    assert timeline.latest().date == "2026-01-15"


def testBuildSnapshotCountsTodaysActivity(tmp_path: Path) -> None:
    tracker = ProgressTracker(storagePath=tmp_path / "progress.json")
    # 오늘 lesson 1개 + section 2개 + credit 1개 시뮬레이션
    tracker.completeMission("cat", "lesson1", "m1", totalMissions=1)
    tracker.recordSectionResult("cat", "lesson1", "sec1", passed=True, hintLevel=0)
    tracker.recordSectionResult("cat", "lesson1", "sec2", passed=True, hintLevel=1)
    tracker.creditCheckPass("cat", "lesson1", "sec1", ["a.intro"], hintLevel=0)

    report = MasteryReport(
        outcomes=[], domains=[], masteredOutcomeCount=2, totalOutcomeCount=5,
    )
    snap = buildSnapshot(tracker, report)
    assert snap.lessonsCompletedToday >= 1
    assert snap.sectionsCompletedToday == 2
    assert snap.creditsToday == 1
    assert snap.masteredCount == 2
    assert snap.totalOutcomes == 5
    assert snap.hintLevelHistogram.get("0") == 1
