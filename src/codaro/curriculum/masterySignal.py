"""Mastery 신호 — 체크 결과를 정직한 학습 증거로 변환한다(순수, provider 불필요).

[[learnerState]]의 EMA mastery는 좋은 입력에 굶주려 있었다. 두 부정직을 고친다:

1. **신호 강도 가중** — `noError`("예외 안 남")는 약한 증거인데 통과를 full 1.0으로
   먹였다. 체크 타입별 강도로 EMA 이동량을 가중해, 약한 noError는 거의 안 움직이고
   강한 output/variable 동등성만 mastery를 크게 올린다.
2. **slip/guess** — 예측과 실행을 either/or로 버리지 않고 결합한다. 통과했지만 예측이
   틀렸으면(guess) 점수를 덜 올리고, 실패했지만 예측이 맞았으면(slip) 덜 깎는다.

모델(PFA/BKT)을 올리지 않는다 — 1인·소표본에선 신호의 질이 모델 복잡도보다 중요하다.
"""
from __future__ import annotations

from dataclasses import dataclass

from .predictionDiff import PredictionDiff


CHECK_STRENGTH: dict[str, float] = {
    "output": 1.0,    # 출력 동등성 — 강한 증거
    "variable": 1.0,  # 변수 상태 동등성 — 강한 증거
    "contains": 0.6,  # 패턴 포함 — 중간
    "noError": 0.25,  # "예외 안 남" — 약한 증거
}
DEFAULT_STRENGTH = 0.5

GUESS_TARGET = 0.6  # 통과했지만 예측이 틀림 — 운/표면적 이해
SLIP_TARGET = 0.4   # 실패했지만 예측이 맞음 — 이해했으나 실행 실수


@dataclass(frozen=True, slots=True)
class MasteryEvidence:
    """한 번의 체크가 mastery에 주는 증거.

    scoreTarget: EMA가 향하는 목표(0..1). slip/guess가 조정한다.
    strength: EMA 이동 가중(0..1). 약한 체크는 작게.
    isSuccess: success/failure 카운트 — 실제 통과 여부로만(slip/guess는 점수만 조정).
    """

    scoreTarget: float
    strength: float
    isSuccess: bool


def checkSignalStrength(checkType: str) -> float:
    return CHECK_STRENGTH.get(checkType, DEFAULT_STRENGTH)


def combineEvidence(
    *,
    passed: bool,
    diff: PredictionDiff | None,
    strength: float,
) -> MasteryEvidence:
    """체크 통과 여부 + 예측 diff를 하나의 정직한 증거로 결합한다."""
    if diff is None or diff.overall == "skipped":
        return MasteryEvidence(scoreTarget=1.0 if passed else 0.0, strength=strength, isSuccess=passed)

    predictedRight = diff.overall == "match"
    if passed and predictedRight:
        target = 1.0
    elif passed and not predictedRight:
        target = GUESS_TARGET
    elif not passed and predictedRight:
        target = SLIP_TARGET
    else:
        target = 0.0
    return MasteryEvidence(scoreTarget=target, strength=strength, isSuccess=passed)
