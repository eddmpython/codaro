from __future__ import annotations

from dataclasses import dataclass

from .learningPathFlow import recommendLearningPath
from .progress import ProgressTracker
from .studyLoader import LEARNING_PATHS, StudyLoader


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


def buildCurriculumProgressSummary(
    progressTracker: ProgressTracker,
    studyLoader: StudyLoader | None = None,
) -> dict[str, object]:
    summary = progressTracker.getSummary()
    if studyLoader is not None and LEARNING_PATHS:
        categoryTotals = {category.key: category.count for category in studyLoader.listCategories()}
        categoryProgress = summary.get("categoryProgress")
        if not isinstance(categoryProgress, dict):
            categoryProgress = {}
        summary["learningPath"] = recommendLearningPath(
            learningPaths=LEARNING_PATHS,
            categoryTotals=categoryTotals,
            categoryProgress=categoryProgress,
        )
    return summary


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
