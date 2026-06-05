"""runtime weakness audit 테스트 — Predict-Run-Reconcile-Adapt 루프 6단계."""
from __future__ import annotations

from pathlib import Path

from codaro.curriculum.learnerState import LearnerStateStore

import sys

TESTS_ROOT = Path(__file__).resolve().parents[1]
if str(TESTS_ROOT) not in sys.path:
    sys.path.insert(0, str(TESTS_ROOT))

from curriculum.auditCurriculumWeakness import (
    RUNTIME_CONFIDENCE_THRESHOLD,
    RUNTIME_MASTERY_THRESHOLD,
    auditRuntimeWeakness,
)


def testRuntimeAuditReturnsEmptyWhenNoDb() -> None:
    result = auditRuntimeWeakness(None)
    assert result["available"] is False
    assert result["weakOutcomes"] == []
    assert result["repeatedMisconceptions"] == []


def testRuntimeAuditReportsWeakOutcomes(tmp_path: Path) -> None:
    db = tmp_path / "learner.db"
    store = LearnerStateStore(db)
    # 한 번만 실패 → score 가 0 + EMA 갱신, confidence 0.1 — 둘 다 threshold 미달
    store.recordOutcomeAttempt("python.variables", success=False)

    result = auditRuntimeWeakness(db)
    assert result["available"] is True
    weakIds = {item["outcomeId"] for item in result["weakOutcomes"]}
    assert "python.variables" in weakIds


def testRuntimeAuditExcludesStrongOutcomes(tmp_path: Path) -> None:
    db = tmp_path / "learner.db"
    store = LearnerStateStore(db)
    for _ in range(20):
        store.recordOutcomeAttempt("python.variables", success=True)

    result = auditRuntimeWeakness(db)
    weakIds = {item["outcomeId"] for item in result["weakOutcomes"]}
    assert "python.variables" not in weakIds


def testRuntimeAuditCapturesRepeatedMisconceptions(tmp_path: Path) -> None:
    db = tmp_path / "learner.db"
    store = LearnerStateStore(db)
    store.recordMisconception("python.lists.indexFromOne", "python.lists")
    store.recordMisconception("python.lists.indexFromOne", "python.lists")
    store.recordMisconception("python.variables.typeConflation", "python.variables")

    result = auditRuntimeWeakness(db)
    repeated = [item["misconceptionId"] for item in result["repeatedMisconceptions"]]
    assert "python.lists.indexFromOne" in repeated
    assert "python.variables.typeConflation" not in repeated


def testRuntimeAuditPerOutcomeHitCounts(tmp_path: Path) -> None:
    db = tmp_path / "learner.db"
    store = LearnerStateStore(db)
    store.recordMisconception("python.lists.indexFromOne", "python.lists")
    store.recordMisconception("python.lists.indexFromOne", "python.lists")
    store.recordMisconception("python.variables.typeConflation", "python.variables")

    result = auditRuntimeWeakness(db)
    counts = result["perOutcomeHitCounts"]
    assert counts.get("python.lists") == 2
    assert counts.get("python.variables") == 1


def testRuntimeAuditThresholdsExposedInResult(tmp_path: Path) -> None:
    db = tmp_path / "learner.db"
    LearnerStateStore(db)
    result = auditRuntimeWeakness(db)
    assert result["thresholds"]["mastery"] == RUNTIME_MASTERY_THRESHOLD
    assert result["thresholds"]["confidence"] == RUNTIME_CONFIDENCE_THRESHOLD


def testRuntimeAuditDeterministicOrdering(tmp_path: Path) -> None:
    """동일 store 상태에서 같은 정렬이 반복 가능해야 한다."""
    db = tmp_path / "learner.db"
    store = LearnerStateStore(db)
    store.recordOutcomeAttempt("python.zeta", success=False)
    store.recordOutcomeAttempt("python.alpha", success=False)

    first = auditRuntimeWeakness(db)
    second = auditRuntimeWeakness(db)
    assert first["weakOutcomes"] == second["weakOutcomes"]
    # 알파벳 정렬 검증
    ids = [item["outcomeId"] for item in first["weakOutcomes"]]
    assert ids == sorted(ids)
