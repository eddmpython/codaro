"""Analytics Timeline — 일별 학습 스냅샷의 append-only JSONL 저장소.

학습자가 자기 학습 패턴을 시간 축으로 볼 수 있게 매일 한 줄씩 스냅샷을 남긴다.
같은 날 두 번 호출되면 마지막 호출의 값으로 갱신 (idempotent per day).

저장 형식: JSON Lines (한 줄 = 한 날짜). 1년 = 365 줄, 회전 없음.
"""
from __future__ import annotations

import json
from datetime import date, datetime, timezone
from pathlib import Path

from pydantic import BaseModel, Field


class DailySnapshot(BaseModel):
    date: str  # ISO date (YYYY-MM-DD)
    masteredCount: int = 0
    totalOutcomes: int = 0
    lessonsCompletedToday: int = 0
    sectionsCompletedToday: int = 0
    creditsToday: int = 0
    domainsTouched: list[str] = Field(default_factory=list)
    hintLevelHistogram: dict[str, int] = Field(default_factory=dict)


def _todayIso() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _parseDate(s: str) -> date | None:
    try:
        return date.fromisoformat(s)
    except ValueError:
        return None


class AnalyticsTimeline:
    def __init__(self, storagePath: str | Path | None = None) -> None:
        if storagePath:
            self._path = Path(storagePath).resolve()
        else:
            self._path = Path.home() / ".codaro" / "analyticsTimeline.jsonl"

    @property
    def path(self) -> Path:
        return self._path

    def _readAll(self) -> list[DailySnapshot]:
        if not self._path.exists():
            return []
        snapshots: list[DailySnapshot] = []
        for raw in self._path.read_text(encoding="utf-8").splitlines():
            raw = raw.strip()
            if not raw:
                continue
            try:
                payload = json.loads(raw)
                snapshots.append(DailySnapshot(**payload))
            except (json.JSONDecodeError, ValueError):
                continue
        return snapshots

    def _writeAll(self, snapshots: list[DailySnapshot]) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        lines = [snap.model_dump_json() for snap in snapshots]
        self._path.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")

    def append(self, snapshot: DailySnapshot) -> bool:
        """같은 날짜가 이미 있으면 교체, 없으면 append (idempotent per day).

        값이 동일한 snapshot 이 이미 있으면 disk write 없이 False 반환 — 매
        /analytics 호출마다 365 row rewrite 하는 핫스팟을 막는다.
        """
        snapshots = self._readAll()
        existing = next((s for s in snapshots if s.date == snapshot.date), None)
        if existing is not None and existing.model_dump() == snapshot.model_dump():
            return False
        snapshots = [s for s in snapshots if s.date != snapshot.date]
        snapshots.append(snapshot)
        snapshots.sort(key=lambda s: s.date)
        self._writeAll(snapshots)
        return True

    def latest(self) -> DailySnapshot | None:
        snapshots = self._readAll()
        return snapshots[-1] if snapshots else None

    def loadRange(self, start: str | None = None, end: str | None = None) -> list[DailySnapshot]:
        snapshots = self._readAll()
        startDate = _parseDate(start) if start else None
        endDate = _parseDate(end) if end else None
        result: list[DailySnapshot] = []
        for snap in snapshots:
            snapDate = _parseDate(snap.date)
            if snapDate is None:
                continue
            if startDate and snapDate < startDate:
                continue
            if endDate and snapDate > endDate:
                continue
            result.append(snap)
        return result

    def todaySnapshot(self) -> DailySnapshot | None:
        today = _todayIso()
        for snap in self._readAll():
            if snap.date == today:
                return snap
        return None


def buildSnapshot(
    progressTracker,
    masteryReport,
    *,
    snapshotDate: str | None = None,
) -> DailySnapshot:
    """ProgressTracker + MasteryReport 에서 오늘의 활동을 추출해 snapshot 합성.

    'today' 는 UTC 기준. lastAccessedAt / completedAt / creditedAt 이
    오늘 날짜와 같은 것만 카운트한다.
    """
    today = snapshotDate or _todayIso()
    progress = progressTracker.load()

    lessonsToday = 0
    sectionsToday = 0
    domainsTouched: set[str] = set()
    for lesson in progress.lessons.values():
        if lesson.completedAt and lesson.completedAt.startswith(today):
            lessonsToday += 1
        if lesson.lastAccessedAt and lesson.lastAccessedAt.startswith(today):
            domainsTouched.add(lesson.category)
        for section in lesson.sectionResults.values():
            if section.firstPassAt and section.firstPassAt.startswith(today):
                sectionsToday += 1

    creditsToday = 0
    hintHistogram: dict[str, int] = {}
    for credits in progress.outcomeCredits.values():
        for credit in credits:
            if credit.creditedAt and credit.creditedAt.startswith(today):
                creditsToday += 1
                key = str(credit.hintLevel)
                hintHistogram[key] = hintHistogram.get(key, 0) + 1

    return DailySnapshot(
        date=today,
        masteredCount=masteryReport.masteredOutcomeCount,
        totalOutcomes=masteryReport.totalOutcomeCount,
        lessonsCompletedToday=lessonsToday,
        sectionsCompletedToday=sectionsToday,
        creditsToday=creditsToday,
        domainsTouched=sorted(domainsTouched),
        hintLevelHistogram=hintHistogram,
    )
