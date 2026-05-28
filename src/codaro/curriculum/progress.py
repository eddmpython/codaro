from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from pydantic import BaseModel, Field

from .outcomeCredit import OutcomeCreditEntry, hintWeight, shouldAutoValidate


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


class UserProgress(BaseModel):
    lessons: dict[str, LessonProgress] = Field(default_factory=dict)
    validatedOutcomes: list[str] = Field(default_factory=list)
    autoValidatedOutcomes: list[str] = Field(default_factory=list)
    outcomeCredits: dict[str, list[OutcomeCreditEntry]] = Field(default_factory=dict)
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
        return progress.lessons[key]

    def completeMission(self, category: str, contentId: str, missionId: str, totalMissions: int = 0) -> LessonProgress:
        lesson = self.getLesson(category, contentId)
        if missionId not in lesson.completedMissions:
            lesson.completedMissions.append(missionId)
        lesson.lastAccessedAt = datetime.now(timezone.utc).isoformat()
        if totalMissions > 0:
            lesson.totalMissions = totalMissions
        if lesson.totalMissions > 0 and len(lesson.completedMissions) >= lesson.totalMissions:
            lesson.completedAt = datetime.now(timezone.utc).isoformat()
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
        return {
            "totalAccessed": totalLessons,
            "totalCompleted": completedLessons,
            "validatedOutcomeCount": len(progress.validatedOutcomes),
            "autoValidatedOutcomeCount": len(progress.autoValidatedOutcomes),
            "creditedOutcomeCount": len(progress.outcomeCredits),
            "updatedAt": progress.updatedAt,
        }

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
        self.save()
        return existing

    def recordOutcomeCredit(self, credit: OutcomeCreditEntry) -> bool:
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
        self.save()
        return autoValidated

    def listOutcomeCredits(self, outcomeId: str) -> list[OutcomeCreditEntry]:
        return list(self.load().outcomeCredits.get(outcomeId, []))

    def outcomeCreditMap(self) -> dict[str, list[OutcomeCreditEntry]]:
        return {k: list(v) for k, v in self.load().outcomeCredits.items()}

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
        """
        weight = hintWeight(hintLevel)
        lessonKey = f"{category}/{contentId}"
        creditedIds: list[str] = []
        autoValidatedIds: list[str] = []
        for outcomeId in outcomes:
            entry = OutcomeCreditEntry(
                outcomeId=outcomeId,
                lessonKey=lessonKey,
                sectionId=sectionId,
                hintLevel=hintLevel,
                weight=weight,
            )
            became = self.recordOutcomeCredit(entry)
            creditedIds.append(outcomeId)
            if became:
                autoValidatedIds.append(outcomeId)
        return creditedIds, autoValidatedIds
