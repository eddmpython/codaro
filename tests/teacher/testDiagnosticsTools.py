"""Diagnostics tool handler 테스트 — Predict-Run-Reconcile-Adapt 루프 4단계.

teacher-e2e golden 시나리오: 학습자가 misconception을 한 번 보이면 진단·교정,
같은 misconception이 두 번째 매칭되면 doneCriterionViolated=True가 떠야 한다.
"""
from __future__ import annotations

import asyncio
from pathlib import Path

import pytest

from codaro.ai.toolHandlers.diagnostics import (
    DiagnosticsToolHandlers,
    _setStoreForTesting,
)
from codaro.curriculum.learnerState import LearnerStateStore


@pytest.fixture(autouse=True)
def isolatedStore(tmp_path: Path):
    store = LearnerStateStore(tmp_path / "diag.db")
    _setStoreForTesting(store)
    yield store
    _setStoreForTesting(None)


@pytest.fixture
def handlers() -> DiagnosticsToolHandlers:
    return DiagnosticsToolHandlers()


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testReadLearnerStateEmpty(handlers: DiagnosticsToolHandlers) -> None:
    result = _run(handlers._handle_readLearnerState({}))
    assert result["mastery"] == []
    assert result["misconceptions"] == []
    assert result["execution"]["totalExecutions"] == 0
    assert result["repeatedMisconceptionCount"] == 0


def testReadLearnerStateForSingleOutcome(
    handlers: DiagnosticsToolHandlers, isolatedStore: LearnerStateStore
) -> None:
    isolatedStore.recordOutcomeAttempt("python.variables", success=True)
    result = _run(handlers._handle_readLearnerState({"outcomeId": "python.variables"}))
    assert result["outcomeId"] == "python.variables"
    assert result["mastery"]["successCount"] == 1


def testRecordPredictionResultMatch(handlers: DiagnosticsToolHandlers) -> None:
    result = _run(handlers._handle_recordPredictionResult({
        "outcomeId": "python.variables",
        "predict": {"expectedValue": "42"},
        "actual": {"value": "42"},
    }))
    assert result["diff"]["overall"] == "match"
    assert result["mastery"]["successCount"] == 1


def testRecordPredictionResultMismatchDecrementsMastery(
    handlers: DiagnosticsToolHandlers,
) -> None:
    _run(handlers._handle_recordPredictionResult({
        "outcomeId": "python.variables",
        "predict": {"expectedValue": "42"},
        "actual": {"value": "42"},
    }))
    second = _run(handlers._handle_recordPredictionResult({
        "outcomeId": "python.variables",
        "predict": {"expectedValue": "42"},
        "actual": {"value": "43"},
    }))
    assert second["diff"]["overall"] == "mismatch"
    assert second["mastery"]["failureCount"] == 1


def testRecordPredictionResultRequiresOutcomeId(
    handlers: DiagnosticsToolHandlers,
) -> None:
    result = _run(handlers._handle_recordPredictionResult({
        "predict": {},
        "actual": {},
    }))
    assert "error" in result


def testMatchMisconceptionFromCodePattern(
    handlers: DiagnosticsToolHandlers,
) -> None:
    result = _run(handlers._handle_matchMisconception({
        "outcomeIds": ["python.variables"],
        "code": "5 = x",
    }))
    ids = {match["misconceptionId"] for match in result["matches"]}
    assert "python.variables.assignmentReversal" in ids
    assert result["repeatCount"] == 0
    assert not result["doneCriterionViolated"]


def testMatchMisconceptionFromErrorPattern(
    handlers: DiagnosticsToolHandlers,
) -> None:
    result = _run(handlers._handle_matchMisconception({
        "outcomeIds": ["python.dictsAndSets"],
        "errorText": "Traceback (most recent call last):\nKeyError: 'banana'",
    }))
    ids = {match["misconceptionId"] for match in result["matches"]}
    assert "python.dictsAndSets.missingKeyError" in ids


def testRepeatedMisconceptionViolatesDoneCriterion(
    handlers: DiagnosticsToolHandlers,
) -> None:
    """같은 학습자가 동일 misconception을 두 번 보이면 doneCriterionViolated=True."""
    first = _run(handlers._handle_matchMisconception({
        "outcomeIds": ["python.variables"],
        "code": "5 = x",
    }))
    assert not first["doneCriterionViolated"]

    second = _run(handlers._handle_matchMisconception({
        "outcomeIds": ["python.variables"],
        "code": "5 = x",
    }))
    assert second["doneCriterionViolated"]
    assert second["repeatCount"] >= 1
    assert second["matches"][0]["repeatStatus"] == "repeat"


def testSuggestNextStepReplaysWhenMasteryLow(
    handlers: DiagnosticsToolHandlers,
) -> None:
    result = _run(handlers._handle_suggestNextStep({
        "currentOutcomeId": "python.variables",
    }))
    assert result["action"] == "replayOutcome"


def testSuggestNextStepAdvancesWhenMasteryHigh(
    handlers: DiagnosticsToolHandlers,
    isolatedStore: LearnerStateStore,
) -> None:
    for _ in range(20):
        isolatedStore.recordOutcomeAttempt("python.variables", success=True)
    result = _run(handlers._handle_suggestNextStep({
        "currentOutcomeId": "python.variables",
    }))
    assert result["action"] == "advanceToNextOutcome"


def testSuggestNextStepDoesNotAdvanceOnWeakSignalOnly(
    handlers: DiagnosticsToolHandlers,
    isolatedStore: LearnerStateStore,
) -> None:
    # noError(약한 신호)만 스무 번 통과 — score는 올라도 강한 관측 0이라 진급하지 않는다.
    from codaro.curriculum.masterySignal import MasteryEvidence

    for _ in range(20):
        isolatedStore.recordEvidence(
            "python.variables", MasteryEvidence(scoreTarget=1.0, strength=0.25, isSuccess=True)
        )
    result = _run(handlers._handle_suggestNextStep({"currentOutcomeId": "python.variables"}))
    assert result["action"] != "advanceToNextOutcome"
    assert result["signal"]["mastered"] is False
    assert result["signal"]["strongObservations"] == 0


def testSuggestNextStepAppliesCorrectionOnRepeat(
    handlers: DiagnosticsToolHandlers,
    isolatedStore: LearnerStateStore,
) -> None:
    # 충분한 mastery 가 있어도 반복 misconception이 있으면 교정 우선.
    for _ in range(20):
        isolatedStore.recordOutcomeAttempt("python.variables", success=True)
    isolatedStore.recordMisconception(
        "python.variables.assignmentReversal", "python.variables"
    )
    isolatedStore.recordMisconception(
        "python.variables.assignmentReversal", "python.variables"
    )
    result = _run(handlers._handle_suggestNextStep({
        "currentOutcomeId": "python.variables",
    }))
    assert result["action"] == "applyCorrection"
    assert result["misconceptionId"] == "python.variables.assignmentReversal"


def testTeacherE2eGoldenFullCycle(
    handlers: DiagnosticsToolHandlers,
) -> None:
    """teacher-e2e golden 시나리오 — read → match → record → suggest.

    1) 학습자가 잘못된 코드 제출 → misconception 매치 (new).
    2) record-prediction-result로 mismatch 기록 → mastery 하락.
    3) suggest-next-step → replayOutcome 권고.
    4) 학습자가 다시 같은 misconception → repeat → doneCriterionViolated.
    """
    # 1) 첫 매치
    match1 = _run(handlers._handle_matchMisconception({
        "outcomeIds": ["python.variables"],
        "code": "5 = x",
    }))
    assert match1["matches"]
    assert match1["matches"][0]["repeatStatus"] == "new"
    assert not match1["doneCriterionViolated"]

    # 2) prediction mismatch 기록
    pred1 = _run(handlers._handle_recordPredictionResult({
        "outcomeId": "python.variables",
        "predict": {"expectedValue": "5"},
        "actual": {"errorClass": "SyntaxError"},
    }))
    assert pred1["diff"]["overall"] == "mismatch"

    # 3) suggest-next-step → 같은 outcome 반복 (교정 권고)
    suggest1 = _run(handlers._handle_suggestNextStep({
        "currentOutcomeId": "python.variables",
    }))
    assert suggest1["action"] == "applyCorrection"

    # 4) 두 번째 동일 misconception → done 기준 위반
    match2 = _run(handlers._handle_matchMisconception({
        "outcomeIds": ["python.variables"],
        "code": "5 = x",
    }))
    assert match2["doneCriterionViolated"]
    assert match2["repeatCount"] >= 1
