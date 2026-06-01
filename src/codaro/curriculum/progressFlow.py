from __future__ import annotations

from dataclasses import dataclass

from .progress import ProgressTracker


@dataclass(frozen=True)
class CurriculumProgressInput:
    category: str
    contentId: str
    missionId: str = ""
    totalMissions: int = 0


@dataclass(frozen=True)
class CurriculumProgressResult:
    payload: dict[str, object]
    action: str


def buildCurriculumProgressSummary(progressTracker: ProgressTracker) -> dict[str, object]:
    return progressTracker.getSummary()


def updateCurriculumProgress(
    *,
    progressTracker: ProgressTracker,
    request: CurriculumProgressInput,
) -> CurriculumProgressResult:
    if request.missionId:
        lesson = progressTracker.completeMission(
            request.category,
            request.contentId,
            request.missionId,
            request.totalMissions,
        )
        return CurriculumProgressResult(payload=lesson.model_dump(), action="progress-mission")
    progressTracker.markAccessed(request.category, request.contentId)
    return CurriculumProgressResult(payload={"status": "accessed"}, action="progress-access")
