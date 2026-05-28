"""Phase 5 — 실측 학습 시간 EWMA 회귀 테스트."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from pathlib import Path

from codaro.curriculum.progress import (
    LessonProgress,
    ProgressTracker,
    _updateObservedMinutes,
)


def _tracker(tmp_path: Path) -> ProgressTracker:
    return ProgressTracker(storagePath=tmp_path / "progress.json")


def testFirstAccessSeedsTimestamp(tmp_path: Path) -> None:
    tracker = _tracker(tmp_path)
    lesson = tracker.getLesson("python", "01_intro")
    assert lesson.firstAccessedAt is not None, "getLesson 첫 호출이 firstAccessedAt 채워야 함"


def testFirstAccessNotOverwrittenOnSecondCall(tmp_path: Path) -> None:
    tracker = _tracker(tmp_path)
    first = tracker.getLesson("python", "01_intro").firstAccessedAt
    again = tracker.getLesson("python", "01_intro").firstAccessedAt
    assert first == again, "두 번째 호출이 firstAccessedAt 을 덮어쓰면 안 됨"


def testCompleteMissionUpdatesEwma(tmp_path: Path) -> None:
    tracker = _tracker(tmp_path)
    lesson = tracker.getLesson("python", "01_intro")
    # 시뮬레이션: firstAccessedAt 을 30 분 전으로 세팅.
    thirtyMinAgo = (datetime.now(timezone.utc) - timedelta(minutes=30)).isoformat()
    lesson.firstAccessedAt = thirtyMinAgo
    tracker.save()
    # totalMissions=1 로 한 번 호출 → 즉시 완료
    result = tracker.completeMission("python", "01_intro", "m1", totalMissions=1)
    assert result.completedAt is not None
    assert result.observedSampleCount == 1
    assert 25 <= result.observedMinutesEwma <= 35, (
        f"30분 elapsed → EWMA 이 30 분 부근이어야: {result.observedMinutesEwma}"
    )


def testEwmaConvergesAcrossSamples(tmp_path: Path) -> None:
    """5 번 표본 후 EWMA 가 평균 부근에 수렴."""
    lesson = LessonProgress(category="x", contentId="y")
    samples = [20, 22, 25, 20, 21]
    for s in samples:
        lesson.firstAccessedAt = (datetime.now(timezone.utc) - timedelta(minutes=s)).isoformat()
        lesson.completedAt = datetime.now(timezone.utc).isoformat()
        _updateObservedMinutes(lesson)
    assert lesson.observedSampleCount == 5
    assert 19 <= lesson.observedMinutesEwma <= 25, (
        f"평균 약 22 부근으로 수렴해야: {lesson.observedMinutesEwma}"
    )


def testOutlierClampedToMax(tmp_path: Path) -> None:
    """8 시간 (480분) 이상 elapsed 는 480 분으로 클램프."""
    lesson = LessonProgress(category="x", contentId="y")
    # 10 시간 elapsed 시뮬레이션 (단, 48h 미만이므로 stale 은 아님)
    lesson.firstAccessedAt = (datetime.now(timezone.utc) - timedelta(hours=10)).isoformat()
    lesson.completedAt = datetime.now(timezone.utc).isoformat()
    _updateObservedMinutes(lesson)
    assert lesson.observedSampleCount == 1
    assert lesson.observedMinutesEwma == 480.0, (
        f"480 분으로 클램프되어야: {lesson.observedMinutesEwma}"
    )


def testStaleSessionSkipsSample(tmp_path: Path) -> None:
    """3 일 이상 간격 (>48h) 은 표본에서 제외."""
    lesson = LessonProgress(category="x", contentId="y")
    lesson.firstAccessedAt = (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
    lesson.completedAt = datetime.now(timezone.utc).isoformat()
    _updateObservedMinutes(lesson)
    assert lesson.observedSampleCount == 0
    assert lesson.observedMinutesEwma == 0.0


def testMissingTimestampsSkipsSample() -> None:
    lesson = LessonProgress(category="x", contentId="y")
    _updateObservedMinutes(lesson)  # 둘 다 None
    assert lesson.observedSampleCount == 0


def testElapsedClampedToMinimum() -> None:
    """1 분 미만은 1 분으로 clamp — 너무 빠른 통과 흔적."""
    lesson = LessonProgress(category="x", contentId="y")
    now = datetime.now(timezone.utc)
    lesson.firstAccessedAt = now.isoformat()
    lesson.completedAt = (now + timedelta(seconds=10)).isoformat()
    _updateObservedMinutes(lesson)
    assert lesson.observedSampleCount == 1
    assert lesson.observedMinutesEwma == 1.0
