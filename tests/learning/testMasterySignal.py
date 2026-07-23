"""Mastery 신호 강도 가중 테스트."""
from __future__ import annotations

import pytest

from codaro.curriculum.masterySignal import (
    DEFAULT_STRENGTH,
    MASTERY_THRESHOLD,
    checkSignalStrength,
    combineEvidence,
    isMastered,
    masteryLowerBound,
)
def testCheckSignalStrengthTiers() -> None:
    assert checkSignalStrength("output") == 1.0
    assert checkSignalStrength("variable") == 1.0
    assert checkSignalStrength("contains") == 0.6
    assert checkSignalStrength("noError") == 0.25
    assert checkSignalStrength("unknownType") == DEFAULT_STRENGTH


def testCombineEvidenceUsesActualCheckResult() -> None:
    win = combineEvidence(passed=True, strength=0.25)
    assert (win.scoreTarget, win.isSuccess, win.strength) == (1.0, True, 0.25)
    lose = combineEvidence(passed=False, strength=1.0)
    assert (lose.scoreTarget, lose.isSuccess) == (0.0, False)


def testLowerBoundZeroWithoutTrials() -> None:
    assert masteryLowerBound(0.9, 0) == 0.0


def testLowerBoundRisesWithMoreTrials() -> None:
    # 같은 점추정이라도 표본이 많을수록 하한이 높다(불확실성 감소).
    few = masteryLowerBound(0.9, 3)
    many = masteryLowerBound(0.9, 30)
    assert few < many < 0.9


def testLowerBoundNeverExceedsScore() -> None:
    for trials in (1, 5, 50):
        assert masteryLowerBound(0.8, trials) <= 0.8 + 1e-9


def testIsMasteredRequiresStrongObservation() -> None:
    # 점수·표본 충분해도 강한 관측이 0이면 숙달 아님.
    assert isMastered(score=0.95, trials=20, strongCount=1) is True
    assert isMastered(score=0.95, trials=20, strongCount=0) is False


def testIsMasteredRequiresEnoughTrials() -> None:
    # 표본이 1이면 하한이 임계 아래 — 한 번 잘했다고 숙달 아님.
    assert isMastered(score=0.95, trials=1, strongCount=1) is False


def testIsMasteredRejectsLowScore() -> None:
    assert isMastered(score=0.3, trials=50, strongCount=5) is False
    assert MASTERY_THRESHOLD == 0.7
