from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from pydantic import BaseModel, Field

from .outcomeCredit import OutcomeCreditEntry, hintWeight, shouldAutoValidate
from .reviewScheduler import ReviewState, initState as initReviewState, isDue as reviewIsDue, updateOnLapse as reviewOnLapse, updateOnSuccess as reviewOnSuccess


_EWMA_ALPHA = 0.3  # 새 표본의 가중치 — 0.3 → 신호 빠른 적응 + 노이즈 완충
_STALE_HOURS = 48.0  # 한 세션 만에 끝낸 게 아니면 표본에서 제외
_SAMPLE_MIN_MINUTES = 1.0
_SAMPLE_MAX_MINUTES = 480.0


def _parseIsoToDatetime(iso: str | None) -> datetime | None:
    if not iso:
        return None
    try:
        return datetime.fromisoformat(iso)
    except ValueError:
        return None


def _updateObservedMinutes(lesson: "LessonProgress") -> None:
    """완료 시점에 호출되어 EWMA 갱신. firstAccessedAt 없으면 skip,
    elapsed 가 48h 초과면 stale 로 보고 skip.
    """
    firstAt = _parseIsoToDatetime(lesson.firstAccessedAt)
    completedAt = _parseIsoToDatetime(lesson.completedAt)
    if firstAt is None or completedAt is None:
        return
    elapsedMinutes = (completedAt - firstAt).total_seconds() / 60.0
    if elapsedMinutes > _STALE_HOURS * 60:
        return  # 며칠 걸쳐 학습한 lesson 은 실측 신호로 부적합
    sample = max(_SAMPLE_MIN_MINUTES, min(elapsedMinutes, _SAMPLE_MAX_MINUTES))
    if lesson.observedSampleCount <= 0:
        lesson.observedMinutesEwma = sample
    else:
        prev = lesson.observedMinutesEwma
        lesson.observedMinutesEwma = (1 - _EWMA_ALPHA) * prev + _EWMA_ALPHA * sample
    lesson.observedSampleCount += 1


class SectionResult(BaseModel):
    sectionId: str
    passed: bool = False
    hintLevel: int = 0
    attemptCount: int = 0
    firstPassAt: str | None = None
    lastAttemptAt: str | None = None


class LessonProgress(BaseModel):
    category: str
    contentId: str
    completedMissions: list[str] = Field(default_factory=list)
    totalMissions: int = 0
    completedAt: str | None = None
    lastAccessedAt: str | None = None
    sectionResults: dict[str, SectionResult] = Field(default_factory=dict)
    firstAccessedAt: str | None = None
    observedMinutesEwma: float = 0.0
    observedSampleCount: int = 0
    reflectionAnswers: dict[str, str] = Field(default_factory=dict)


class UserProgress(BaseModel):
    lessons: dict[str, LessonProgress] = Field(default_factory=dict)
    validatedOutcomes: list[str] = Field(default_factory=list)
    autoValidatedOutcomes: list[str] = Field(default_factory=list)
    outcomeCredits: dict[str, list[OutcomeCreditEntry]] = Field(default_factory=dict)
    lessonReviews: dict[str, ReviewState] = Field(default_factory=dict)
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProgressTracker:
    def __init__(self, storagePath: str | Path | None = None):
        if storagePath:
            self._storagePath = Path(storagePath).resolve()
        else:
            self._storagePath = Path.home() / ".codaro" / "progress.json"
        self._progress: UserProgress | None = None

    def load(self) -> UserProgress:
        if self._progress is not None:
            return self._progress

        if self._storagePath.exists():
            try:
                data = json.loads(self._storagePath.read_text(encoding="utf-8"))
                self._progress = UserProgress(**data)
            except (json.JSONDecodeError, ValueError):
                self._progress = UserProgress()
        else:
            self._progress = UserProgress()

        return self._progress

    def save(self) -> None:
        if self._progress is None:
            return
        self._progress.updatedAt = datetime.now(timezone.utc).isoformat()
        self._storagePath.parent.mkdir(parents=True, exist_ok=True)
        self._storagePath.write_text(
            self._progress.model_dump_json(indent=2),
            encoding="utf-8",
        )

    def getLesson(self, category: str, contentId: str) -> LessonProgress:
        progress = self.load()
        key = f"{category}/{contentId}"
        if key not in progress.lessons:
            progress.lessons[key] = LessonProgress(category=category, contentId=contentId)
        lesson = progress.lessons[key]
        if lesson.firstAccessedAt is None:
            lesson.firstAccessedAt = datetime.now(timezone.utc).isoformat()
        return lesson

    def completeMission(self, category: str, contentId: str, missionId: str, totalMissions: int = 0) -> LessonProgress:
        lesson = self.getLesson(category, contentId)
        if missionId not in lesson.completedMissions:
            lesson.completedMissions.append(missionId)
        lesson.lastAccessedAt = datetime.now(timezone.utc).isoformat()
        if totalMissions > 0:
            lesson.totalMissions = totalMissions
        becameComplete = False
        if lesson.totalMissions > 0 and len(lesson.completedMissions) >= lesson.totalMissions:
            if lesson.completedAt is None:
                becameComplete = True
            lesson.completedAt = datetime.now(timezone.utc).isoformat()
        if becameComplete:
            key = f"{category}/{contentId}"
            progress = self.load()
            if key not in progress.lessonReviews:
                progress.lessonReviews[key] = initReviewState(key, lesson.completedAt)
            _updateObservedMinutes(lesson)
        self.save()
        return lesson

    def markAccessed(self, category: str, contentId: str) -> None:
        lesson = self.getLesson(category, contentId)
        lesson.lastAccessedAt = datetime.now(timezone.utc).isoformat()
        self.save()

    def getCompletedCount(self, category: str) -> int:
        progress = self.load()
        count = 0
        for key, lesson in progress.lessons.items():
            if lesson.category == category and lesson.completedAt:
                count += 1
        return count

    def getSummary(self) -> dict:
        progress = self.load()
        totalLessons = len(progress.lessons)
        completedLessons = sum(1 for l in progress.lessons.values() if l.completedAt)
        categoryProgress = self._summarizeByCategory(progress)
        resume = self._resumeTarget(progress)
        return {
            "totalAccessed": totalLessons,
            "totalCompleted": completedLessons,
            "validatedOutcomeCount": len(progress.validatedOutcomes),
            "autoValidatedOutcomeCount": len(progress.autoValidatedOutcomes),
            "creditedOutcomeCount": len(progress.outcomeCredits),
            "categoryProgress": categoryProgress,
            "resume": resume,
            "updatedAt": progress.updatedAt,
        }

    @staticmethod
    def _summarizeByCategory(progress: UserProgress) -> dict[str, dict[str, int]]:
        summary: dict[str, dict[str, int]] = {}
        for lesson in progress.lessons.values():
            bucket = summary.setdefault(lesson.category, {"completed": 0, "accessed": 0})
            bucket["accessed"] += 1
            if lesson.completedAt:
                bucket["completed"] += 1
        return summary

    @staticmethod
    def _resumeTarget(progress: UserProgress) -> dict[str, str] | None:
        candidate: LessonProgress | None = None
        for lesson in progress.lessons.values():
            if lesson.completedAt or not lesson.lastAccessedAt:
                continue
            if candidate is None or lesson.lastAccessedAt > (candidate.lastAccessedAt or ""):
                candidate = lesson
        if candidate is None:
            return None
        return {"category": candidate.category, "contentId": candidate.contentId}

    def listValidatedOutcomes(self) -> set[str]:
        progress = self.load()
        return set(progress.validatedOutcomes) | set(progress.autoValidatedOutcomes)

    def listManuallyValidatedOutcomes(self) -> set[str]:
        return set(self.load().validatedOutcomes)

    def listAutoValidatedOutcomes(self) -> set[str]:
        return set(self.load().autoValidatedOutcomes)

    def markOutcomeValidated(self, outcomeId: str) -> None:
        progress = self.load()
        if outcomeId not in progress.validatedOutcomes:
            progress.validatedOutcomes.append(outcomeId)
            self.save()

    def clearOutcomeValidation(self, outcomeId: str) -> None:
        progress = self.load()
        changed = False
        if outcomeId in progress.validatedOutcomes:
            progress.validatedOutcomes.remove(outcomeId)
            changed = True
        if outcomeId in progress.autoValidatedOutcomes:
            progress.autoValidatedOutcomes.remove(outcomeId)
            changed = True
        if changed:
            self.save()

    def recordSectionResult(
        self,
        category: str,
        contentId: str,
        sectionId: str,
        passed: bool,
        hintLevel: int,
        *,
        save: bool = True,
    ) -> SectionResult:
        lesson = self.getLesson(category, contentId)
        now = datetime.now(timezone.utc).isoformat()
        existing = lesson.sectionResults.get(sectionId)
        if existing is None:
            existing = SectionResult(sectionId=sectionId)
            lesson.sectionResults[sectionId] = existing
        existing.attemptCount += 1
        existing.lastAttemptAt = now
        existing.hintLevel = hintLevel
        if passed:
            existing.passed = True
            if existing.firstPassAt is None:
                existing.firstPassAt = now
        lesson.lastAccessedAt = now
        if save:
            self.save()
        return existing

    def recordOutcomeCredit(self, credit: OutcomeCreditEntry, *, save: bool = True) -> bool:
        """Append credit, return True if outcome reached auto-validated threshold."""
        progress = self.load()
        bucket = progress.outcomeCredits.setdefault(credit.outcomeId, [])
        bucket.append(credit)
        autoValidated = False
        if (
            credit.outcomeId not in progress.autoValidatedOutcomes
            and credit.outcomeId not in progress.validatedOutcomes
            and shouldAutoValidate(bucket)
        ):
            progress.autoValidatedOutcomes.append(credit.outcomeId)
            autoValidated = True
        if save:
            self.save()
        return autoValidated

    def listOutcomeCredits(self, outcomeId: str) -> list[OutcomeCreditEntry]:
        return list(self.load().outcomeCredits.get(outcomeId, []))

    def outcomeCreditMap(self) -> dict[str, list[OutcomeCreditEntry]]:
        """Read-only view of outcome → credits. 합성기는 수정하지 않는다."""
        return self.load().outcomeCredits

    def getReviewState(self, lessonKey: str) -> ReviewState | None:
        return self.load().lessonReviews.get(lessonKey)

    def listDueReviews(self, now: datetime | None = None) -> list[ReviewState]:
        progress = self.load()
        return [state for state in progress.lessonReviews.values() if reviewIsDue(state, now)]

    def recordReviewResult(self, lessonKey: str, success: bool) -> ReviewState:
        progress = self.load()
        existing = progress.lessonReviews.get(lessonKey)
        if existing is None:
            existing = initReviewState(lessonKey)
        updated = reviewOnSuccess(existing) if success else reviewOnLapse(existing)
        progress.lessonReviews[lessonKey] = updated
        self.save()
        return updated

    def creditCheckPass(
        self,
        category: str,
        contentId: str,
        sectionId: str,
        outcomes: list[str],
        hintLevel: int,
    ) -> tuple[list[str], list[str]]:
        """Credit attached outcomes for a section pass. Returns (creditedIds, autoValidatedIds).

        Caller is responsible for `recordSectionResult` — this method only handles credits.
        Batched: N credits 가 들어와도 disk write 는 1회.
        Phase 6 — hint 0 + 첫 시도 통과면 entry.fastTrack=True 로 표시.
        """
        from .outcomeCredit import FAST_TRACK_ATTEMPT_MAX, FAST_TRACK_HINT_MAX

        weight = hintWeight(hintLevel)
        lessonKey = f"{category}/{contentId}"
        # section.attemptCount 가 1 이고 hintLevel 이 0 이면 fast-track
        lesson = self.getLesson(category, contentId)
        sectionResult = lesson.sectionResults.get(sectionId)
        attemptCount = sectionResult.attemptCount if sectionResult else 0
        isFastTrack = (
            hintLevel <= FAST_TRACK_HINT_MAX
            and 0 < attemptCount <= FAST_TRACK_ATTEMPT_MAX
        )
        creditedIds: list[str] = []
        autoValidatedIds: list[str] = []
        for outcomeId in outcomes:
            entry = OutcomeCreditEntry(
                outcomeId=outcomeId,
                lessonKey=lessonKey,
                sectionId=sectionId,
                hintLevel=hintLevel,
                weight=weight,
                fastTrack=isFastTrack,
            )
            became = self.recordOutcomeCredit(entry, save=False)
            creditedIds.append(outcomeId)
            if became:
                autoValidatedIds.append(outcomeId)
        if creditedIds:
            self.save()
        return creditedIds, autoValidatedIds
