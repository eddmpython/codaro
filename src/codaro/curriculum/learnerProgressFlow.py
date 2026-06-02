from __future__ import annotations

from .learnerState import LearnerStateStore
from .osCache import CurriculumOsCache
from .progress import ProgressTracker


class LearnerProgressError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def updateOutcomeValidation(
    *,
    curriculumOs: CurriculumOsCache,
    progressTracker: ProgressTracker,
    outcomeId: str,
    validated: bool,
) -> dict[str, object]:
    taxonomy = curriculumOs.taxonomy()
    if not taxonomy.hasOutcome(outcomeId):
        raise LearnerProgressError(
            "curriculum_unknown_outcome",
            f"Unknown outcome: {outcomeId}",
        )
    if validated:
        progressTracker.markOutcomeValidated(outcomeId)
    else:
        progressTracker.clearOutcomeValidation(outcomeId)
    return {
        "outcomeId": outcomeId,
        "validated": validated,
    }


def updateOutcomeValidationToolPayload(
    *,
    curriculumOs: CurriculumOsCache,
    progressTracker: ProgressTracker,
    outcomeId: str,
    validated: bool,
    reason: object = None,
) -> dict[str, object]:
    payload = updateOutcomeValidation(
        curriculumOs=curriculumOs,
        progressTracker=progressTracker,
        outcomeId=outcomeId,
        validated=validated,
    )
    taxonomy = curriculumOs.taxonomy()
    return {
        **payload,
        "outcomeLabel": taxonomy.outcomeLabel(outcomeId),
        "reason": reason,
    }


def buildLearnerSnapshotPayload(
    *,
    learnerStateStore: LearnerStateStore,
    curriculumOs: CurriculumOsCache | None = None,
) -> dict[str, object]:
    snapshot = learnerStateStore.snapshot()
    repeats = learnerStateStore.listRepeatedMisconceptions()
    payload = snapshot.model_dump()
    if curriculumOs is not None:
        taxonomy = curriculumOs.taxonomy()
        graph = curriculumOs.graph()
        misconceptions = payload.get("misconceptions")
        if isinstance(misconceptions, list):
            for hit in misconceptions:
                if isinstance(hit, dict):
                    outcomeId = str(hit.get("outcomeId") or "")
                    hit["outcomeLabel"] = taxonomy.outcomeLabel(outcomeId) if outcomeId else ""
                    lessons = graph.lessonsProvidingOutcome(outcomeId) if outcomeId else []
                    if lessons:
                        lesson = lessons[0]
                        hit["lessonCategory"] = lesson.category
                        hit["lessonContentId"] = lesson.contentId
    return {
        **payload,
        "repeatedMisconceptionCount": len(repeats),
        "doneCriterionViolated": bool(repeats),
    }


def buildLearnerOutcomePayload(
    *,
    curriculumOs: CurriculumOsCache,
    learnerStateStore: LearnerStateStore,
    outcomeId: str,
) -> dict[str, object]:
    taxonomy = curriculumOs.taxonomy()
    if not taxonomy.hasOutcome(outcomeId):
        raise LearnerProgressError(
            "curriculum_unknown_outcome",
            f"Unknown outcome: {outcomeId}",
        )
    mastery = learnerStateStore.getMastery(outcomeId)
    related = [
        hit.model_dump()
        for hit in learnerStateStore.listMisconceptionHits()
        if hit.outcomeId == outcomeId
    ]
    return {
        "outcomeId": outcomeId,
        "outcomeLabel": taxonomy.outcomeLabel(outcomeId),
        "mastery": mastery.model_dump(),
        "misconceptionHits": related,
    }
