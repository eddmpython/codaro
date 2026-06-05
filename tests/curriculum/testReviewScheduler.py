"""ReviewScheduler — spaced repetition (SM-2 lite) 단위 테스트."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path

from codaro.curriculum.progress import ProgressTracker
from codaro.curriculum.reviewScheduler import (
    DEFAULT_INTERVAL_DAYS,
    EASE_INITIAL,
    EASE_LAPSE_DELTA,
    EASE_MIN,
    daysOverdue,
    initState,
    isDue,
    updateOnLapse,
    updateOnSuccess,
)


def testInitStateGivesOneDayInterval() -> None:
    state = initState("cat/lesson", completedAt="2026-01-01T00:00:00+00:00")
    assert state.lessonKey == "cat/lesson"
    assert state.interval == DEFAULT_INTERVAL_DAYS
    assert state.ease == EASE_INITIAL
    assert state.streak == 0
    assert state.lastResult == "fresh"
    expectedNext = datetime(2026, 1, 2, tzinfo=timezone.utc).isoformat()
    assert state.nextReviewAt == expectedNext


def testSuccessGrowsInterval() -> None:
    state = initState("cat/lesson", completedAt="2026-01-01T00:00:00+00:00")
    now = datetime(2026, 1, 2, 8, tzinfo=timezone.utc)
    s1 = updateOnSuccess(state, now=now)
    # 1 * 2.5 = 2.5 → rounded to 3 days (round-half-up via int(round))
    assert s1.interval >= 2
    assert s1.streak == 1
    assert s1.lastResult == "success"

    s2 = updateOnSuccess(s1, now=now + timedelta(days=s1.interval))
    assert s2.interval > s1.interval
    assert s2.streak == 2


def testLapseResetsIntervalAndDropsEase() -> None:
    state = initState("cat/lesson")
    state = updateOnSuccess(state)
    state = updateOnSuccess(state)
    easeBefore = state.ease
    lapsed = updateOnLapse(state)
    assert lapsed.interval == DEFAULT_INTERVAL_DAYS
    assert lapsed.streak == 0
    assert lapsed.ease == max(EASE_MIN, easeBefore - EASE_LAPSE_DELTA)
    assert lapsed.lastResult == "lapse"


def testEaseFloorsAtMin() -> None:
    state = initState("cat/lesson")
    for _ in range(20):
        state = updateOnLapse(state)
    assert state.ease >= EASE_MIN
    assert state.ease == EASE_MIN


def testIsDueAndOverdue() -> None:
    state = initState("cat/lesson", completedAt="2026-01-01T00:00:00+00:00")
    # interval=1, nextReviewAt=2026-01-02
    assert not isDue(state, now=datetime(2026, 1, 1, 12, tzinfo=timezone.utc))
    assert isDue(state, now=datetime(2026, 1, 3, tzinfo=timezone.utc))
    assert daysOverdue(state, now=datetime(2026, 1, 3, tzinfo=timezone.utc)) == 1


def testCompleteMissionAutoCreatesReviewState(tmp_path: Path) -> None:
    storage = tmp_path / "progress.json"
    tracker = ProgressTracker(storagePath=storage)
    tracker.completeMission("cat", "lesson", "step1", totalMissions=1)
    state = tracker.getReviewState("cat/lesson")
    assert state is not None
    assert state.lessonKey == "cat/lesson"
    assert state.interval == DEFAULT_INTERVAL_DAYS


def testRecordReviewResultUpdates(tmp_path: Path) -> None:
    storage = tmp_path / "progress.json"
    tracker = ProgressTracker(storagePath=storage)
    tracker.completeMission("cat", "lesson", "step1", totalMissions=1)
    updated = tracker.recordReviewResult("cat/lesson", success=True)
    assert updated.streak == 1
    assert updated.lastResult == "success"

    relapsed = tracker.recordReviewResult("cat/lesson", success=False)
    assert relapsed.streak == 0
    assert relapsed.lastResult == "lapse"


def testListDueReviewsRespectsClock(tmp_path: Path) -> None:
    storage = tmp_path / "progress.json"
    tracker = ProgressTracker(storagePath=storage)
    tracker.completeMission("cat", "lesson", "step1", totalMissions=1)
    # state defaults to nextReviewAt ≈ now + 1 day
    assert tracker.listDueReviews(now=datetime.now(timezone.utc)) == []
    # future: should be due
    farFuture = datetime.now(timezone.utc) + timedelta(days=10)
    due = tracker.listDueReviews(now=farFuture)
    assert len(due) == 1
    assert due[0].lessonKey == "cat/lesson"
