from types import SimpleNamespace

import pytest

from codaro.curriculum.learnerProgressFlow import (
    LearnerProgressError,
    buildLearnerOutcomePayload,
    buildLearnerSnapshotPayload,
    updateOutcomeValidationToolPayload,
    updateOutcomeValidation,
)
from codaro.curriculum.learnerState import LearnerStateStore
from codaro.curriculum.progress import ProgressTracker
from codaro.curriculum.taxonomy import CurriculumTaxonomy, OutcomeDef


def curriculumOsWithOutcome(outcomeId: str = "python.variables") -> SimpleNamespace:
    taxonomy = CurriculumTaxonomy(
        outcomes=[OutcomeDef(id=outcomeId, label="Variables")],
    )
    return SimpleNamespace(taxonomy=lambda: taxonomy)


def testOutcomeValidationUsesCurriculumTaxonomyBoundary(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")

    payload = updateOutcomeValidation(
        curriculumOs=curriculumOsWithOutcome(),
        progressTracker=tracker,
        outcomeId="python.variables",
        validated=True,
    )

    assert payload == {"outcomeId": "python.variables", "validated": True}
    assert "python.variables" in tracker.listValidatedOutcomes()


def testOutcomeValidationRejectsUnknownOutcome(tmp_path) -> None:
    with pytest.raises(LearnerProgressError) as excInfo:
        updateOutcomeValidation(
            curriculumOs=curriculumOsWithOutcome(),
            progressTracker=ProgressTracker(tmp_path / "progress.json"),
            outcomeId="missing",
            validated=True,
        )

    assert excInfo.value.code == "curriculum_unknown_outcome"


def testOutcomeValidationToolPayloadIncludesLabelAndReason(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")

    payload = updateOutcomeValidationToolPayload(
        curriculumOs=curriculumOsWithOutcome(),
        progressTracker=tracker,
        outcomeId="python.variables",
        validated=True,
        reason="checked by teacher",
    )

    assert payload["outcomeLabel"] == "Variables"
    assert payload["reason"] == "checked by teacher"


def testLearnerSnapshotAndOutcomePayloadsAreRedrawReady(tmp_path) -> None:
    store = LearnerStateStore(tmp_path / "learner.db")
    store.recordOutcomeAttempt("python.variables", success=True)
    store.recordMisconception("m-1", "python.variables")

    snapshot = buildLearnerSnapshotPayload(learnerStateStore=store)
    outcome = buildLearnerOutcomePayload(
        curriculumOs=curriculumOsWithOutcome(),
        learnerStateStore=store,
        outcomeId="python.variables",
    )

    assert snapshot["repeatedMisconceptionCount"] == 0
    assert snapshot["doneCriterionViolated"] is False
    assert outcome["outcomeLabel"] == "Variables"
    assert outcome["mastery"]["score"] > 0
    assert len(outcome["misconceptionHits"]) == 1
