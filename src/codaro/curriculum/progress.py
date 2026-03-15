from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from pydantic import BaseModel, Field


class LessonProgress(BaseModel):
    category: str
    contentId: str
    completedMissions: list[str] = Field(default_factory=list)
    totalMissions: int = 0
    completedAt: str | None = None
    lastAccessedAt: str | None = None


class UserProgress(BaseModel):
    lessons: dict[str, LessonProgress] = Field(default_factory=dict)
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
            "updatedAt": progress.updatedAt,
        }
