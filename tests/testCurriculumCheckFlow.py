"""체크 흐름의 provider-독립 다음 행동 추천 규칙 테스트.

LLM provider 없이도 학습 루프가 "진단 → 안내"까지 닫히는지 결정적으로 검증한다.
"""
from codaro.curriculum.checkFlow import recommendNextAction


def testPassAdvances() -> None:
    action = recommendNextAction(
        passed=True, hasMisconception=False, doneCriterionViolated=False, hintLevel=0, maxHints=3
    )
    assert action["kind"] == "advance"


def testPassWithMisconceptionReconcilesPrediction() -> None:
    # 통과했지만 예측이 어긋나 silent 오개념이 발화한 경우 — reflective 안내.
    action = recommendNextAction(
        passed=True, hasMisconception=True, doneCriterionViolated=False, hintLevel=0, maxHints=3
    )
    assert action["kind"] == "reconcilePrediction"
    assert action["label"]


def testMisconceptionPointsToCorrection() -> None:
    action = recommendNextAction(
        passed=False, hasMisconception=True, doneCriterionViolated=False, hintLevel=0, maxHints=3
    )
    assert action["kind"] == "studyCorrection"


def testRepeatedMistakeReviewsConcept() -> None:
    action = recommendNextAction(
        passed=False, hasMisconception=False, doneCriterionViolated=True, hintLevel=1, maxHints=3
    )
    assert action["kind"] == "reviewConcept"


def testFailWithRemainingHintsOffersNextHint() -> None:
    action = recommendNextAction(
        passed=False, hasMisconception=False, doneCriterionViolated=False, hintLevel=1, maxHints=3
    )
    assert action["kind"] == "nextHint"


def testFailWithNoHintsLeftRetries() -> None:
    action = recommendNextAction(
        passed=False, hasMisconception=False, doneCriterionViolated=False, hintLevel=3, maxHints=3
    )
    assert action["kind"] == "retry"


def testEveryBranchHasLabel() -> None:
    cases = [
        (True, False, False, 0, 3),
        (True, True, False, 0, 3),
        (False, True, False, 0, 3),
        (False, False, True, 0, 3),
        (False, False, False, 0, 3),
        (False, False, False, 3, 3),
    ]
    for passed, misc, done, level, maxH in cases:
        action = recommendNextAction(
            passed=passed, hasMisconception=misc, doneCriterionViolated=done, hintLevel=level, maxHints=maxH
        )
        assert action["label"]
