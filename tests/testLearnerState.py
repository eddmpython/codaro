"""Learner State Store 테스트 — Predict-Run-Reconcile-Adapt 루프 3단계."""
from __future__ import annotations

from pathlib import Path

import pytest

from codaro.curriculum.learnerState import (
    LearnerStateStore,
    MASTERY_EMA,
)
from codaro.curriculum.masterySignal import MasteryEvidence
from codaro.curriculum.predictionDiff import (
    ActualResult,
    PredictionDiff,
    comparePrediction,
)
from codaro.curriculum.sectionContract import LearningPredictContract


@pytest.fixture
def store(tmp_path: Path) -> LearnerStateStore:
    return LearnerStateStore(tmp_path / "learner.db")


def testFreshMasteryIsZero(store: LearnerStateStore) -> None:
    mastery = store.getMastery("python.variables")
    assert mastery.score == 0.0
    assert mastery.confidence == 0.0
    assert mastery.successCount == 0
    assert mastery.failureCount == 0


def testRecordSuccessRaisesScore(store: LearnerStateStore) -> None:
    mastery = store.recordOutcomeAttempt("python.variables", success=True)
    assert mastery.score == pytest.approx(MASTERY_EMA)
    assert mastery.successCount == 1
    assert mastery.failureCount == 0


def testRecordFailureLowersScore(store: LearnerStateStore) -> None:
    store.recordOutcomeAttempt("python.variables", success=True)
    after = store.recordOutcomeAttempt("python.variables", success=False)
    assert after.score < MASTERY_EMA
    assert after.successCount == 1
    assert after.failureCount == 1


def testRepeatedSuccessConvergesToOne(store: LearnerStateStore) -> None:
    for _ in range(30):
        store.recordOutcomeAttempt("python.variables", success=True)
    mastery = store.getMastery("python.variables")
    assert mastery.score > 0.95
    assert mastery.confidence == 1.0


def testWeakEvidenceMovesScoreLess(store: LearnerStateStore) -> None:
    weak = store.recordEvidence(
        "weak.outcome", MasteryEvidence(scoreTarget=1.0, strength=0.25, isSuccess=True)
    )
    strong = store.recordEvidence(
        "strong.outcome", MasteryEvidence(scoreTarget=1.0, strength=1.0, isSuccess=True)
    )
    assert weak.score == pytest.approx(MASTERY_EMA * 0.25)
    assert strong.score == pytest.approx(MASTERY_EMA)
    assert weak.score < strong.score
    # confidence 도 strength 로 누적 — 약한 증거는 덜 확신.
    assert weak.confidence < strong.confidence


def testRecordEvidenceCountsBySuccessFlag(store: LearnerStateStore) -> None:
    # guess: 통과(isSuccess=True)지만 점수 목표는 낮음 — 카운트는 success.
    guess = store.recordEvidence(
        "g.outcome", MasteryEvidence(scoreTarget=0.6, strength=1.0, isSuccess=True)
    )
    assert guess.successCount == 1 and guess.failureCount == 0
    # slip: 실패(isSuccess=False)지만 점수는 덜 깎임 — 카운트는 failure.
    slip = store.recordEvidence(
        "s.outcome", MasteryEvidence(scoreTarget=0.4, strength=1.0, isSuccess=False)
    )
    assert slip.failureCount == 1 and slip.successCount == 0


def testPredictionDiffMatchCountsAsSuccess(store: LearnerStateStore) -> None:
    predict = LearningPredictContract(expectedValue="42")
    actual = ActualResult(value="42")
    diff = comparePrediction(predict, actual)
    mastery = store.recordPredictionResult("python.variables", diff)
    assert mastery.successCount == 1


def testPredictionDiffMismatchCountsAsFailure(store: LearnerStateStore) -> None:
    predict = LearningPredictContract(expectedValue="42")
    actual = ActualResult(value="41")
    diff = comparePrediction(predict, actual)
    mastery = store.recordPredictionResult("python.variables", diff)
    assert mastery.failureCount == 1


def testSkippedDiffDoesNotAffectMastery(store: LearnerStateStore) -> None:
    predict = LearningPredictContract()
    actual = ActualResult(value="42")
    diff = comparePrediction(predict, actual)
    assert diff.overall == "skipped"
    store.recordPredictionResult("python.variables", diff)
    mastery = store.getMastery("python.variables")
    assert mastery.successCount == 0
    assert mastery.failureCount == 0


def testNewMisconceptionReturnsNew(store: LearnerStateStore) -> None:
    hit, status = store.recordMisconception(
        "python.variables.typeConflation", "python.variables"
    )
    assert status == "new"
    assert hit.hitCount == 1


def testRepeatedMisconceptionReturnsRepeat(store: LearnerStateStore) -> None:
    store.recordMisconception("python.variables.typeConflation", "python.variables")
    _, status = store.recordMisconception(
        "python.variables.typeConflation", "python.variables"
    )
    assert status == "repeat"


def testListRepeatedMisconceptionsCapturesRepeats(store: LearnerStateStore) -> None:
    store.recordMisconception("python.variables.typeConflation", "python.variables")
    store.recordMisconception("python.variables.typeConflation", "python.variables")
    store.recordMisconception("python.lists.indexFromOne", "python.lists")
    repeats = store.listRepeatedMisconceptions()
    assert len(repeats) == 1
    assert repeats[0].misconceptionId == "python.variables.typeConflation"
    assert repeats[0].hitCount == 2


def testDoneCriterionNoRepeatedMisconceptions(store: LearnerStateStore) -> None:
    """Done 기준: 같은 학습자가 동일 misconception을 두 번 보이지 않는다."""
    store.recordMisconception("python.variables.typeConflation", "python.variables")
    assert not store.listRepeatedMisconceptions()


def testExecutionSummaryTracksCounts(store: LearnerStateStore) -> None:
    store.recordExecution(["python.variables"], success=True)
    store.recordExecution(["python.variables"], success=False, errorClass="TypeError")
    store.recordExecution(["python.lists"], success=True)
    summary = store.getExecutionSummary()
    assert summary.totalExecutions == 3
    assert summary.totalErrors == 1
    assert summary.lastErrorClass == "TypeError"
    assert summary.perOutcomeCounts["python.variables"] == {"success": 1, "failure": 1}
    assert summary.perOutcomeCounts["python.lists"] == {"success": 1, "failure": 0}


def testSnapshotAggregatesAllState(store: LearnerStateStore) -> None:
    store.recordOutcomeAttempt("python.variables", success=True)
    store.recordMisconception("python.lists.indexFromOne", "python.lists")
    store.recordExecution(["python.variables"], success=True)
    snap = store.snapshot()
    assert len(snap.mastery) == 1
    assert snap.mastery[0].outcomeId == "python.variables"
    assert len(snap.misconceptions) == 1
    assert snap.misconceptions[0].misconceptionId == "python.lists.indexFromOne"
    assert snap.execution.totalExecutions == 1


def testStorePersistsAcrossReopen(tmp_path: Path) -> None:
    dbPath = tmp_path / "learner.db"
    store1 = LearnerStateStore(dbPath)
    store1.recordOutcomeAttempt("python.variables", success=True)

    store2 = LearnerStateStore(dbPath)
    mastery = store2.getMastery("python.variables")
    assert mastery.successCount == 1
    assert mastery.score == pytest.approx(MASTERY_EMA)


def testResetClearsAllState(store: LearnerStateStore) -> None:
    store.recordOutcomeAttempt("python.variables", success=True)
    store.recordMisconception("python.lists.indexFromOne", "python.lists")
    store.reset()
    snap = store.snapshot()
    assert not snap.mastery
    assert not snap.misconceptions
    assert snap.execution.totalExecutions == 0


def testMarkMisconceptionResolvedSetsTimestamp(store: LearnerStateStore) -> None:
    store.recordMisconception("python.variables.typeConflation", "python.variables")
    store.markMisconceptionResolved("python.variables.typeConflation")
    hits = store.listMisconceptionHits()
    assert hits[0].resolvedAt is not None
