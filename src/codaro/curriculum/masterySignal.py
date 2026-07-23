"""Mastery 신호를 실제 체크 결과의 강도에 맞춰 정직하게 변환한다."""
from __future__ import annotations

import math
from dataclasses import dataclass

CHECK_STRENGTH: dict[str, float] = {
    "output": 1.0,    # 출력 동등성 — 강한 증거
    "variable": 1.0,  # 변수 상태 동등성 — 강한 증거
    "contains": 0.6,  # 패턴 포함 — 중간
    "noError": 0.25,  # "예외 안 남" — 약한 증거
}
DEFAULT_STRENGTH = 0.5

@dataclass(frozen=True, slots=True)
class MasteryEvidence:
    """한 번의 체크가 mastery에 주는 증거.

    scoreTarget: EMA가 향하는 실제 체크 결과(0..1).
    strength: EMA 이동 가중(0..1). 약한 체크는 작게.
    isSuccess: success/failure 카운트에 반영할 실제 통과 여부.
    """

    scoreTarget: float
    strength: float
    isSuccess: bool


def checkSignalStrength(checkType: str) -> float:
    return CHECK_STRENGTH.get(checkType, DEFAULT_STRENGTH)


def combineEvidence(
    *,
    passed: bool,
    strength: float,
) -> MasteryEvidence:
    """실제 체크 통과 여부를 체크 강도와 결합한다."""
    return MasteryEvidence(
        scoreTarget=1.0 if passed else 0.0,
        strength=strength,
        isSuccess=passed,
    )


# ----------------------------------------------------------------------
# 불확실성 — "숙달" 주장의 정직성. 점추정(score)을 표본 부족 마진으로 깎는다.
# ----------------------------------------------------------------------

STRONG_OBSERVATION_THRESHOLD = 0.6  # 이 이상 강도의 관측을 "강한 관측"으로 친다(contains 이상).
MASTERY_THRESHOLD = 0.7             # 숙달로 부르는 하한 임계.
WILSON_Z = 1.0                      # ≈68% 신뢰 — 1인 소표본엔 1.96은 과도, 1.0이 적정.


def masteryLowerBound(score: float, trials: int, *, z: float = WILSON_Z) -> float:
    """strength 가중 점추정(score)에 대한 Wilson 하한 — 표본이 적을수록 크게 깎인다.

    score를 비율 추정치(phat), trials를 표본 수 n으로 본 Wilson score interval의 하한.
    trials=0이면 0.0(증거 없음 → 숙달 주장 불가). trials가 늘수록 마진이 줄어 score로 수렴.
    noError가 score를 낮게 유지하면 하한도 낮으므로, 약한 신호로는 숙달이 안 된다.
    """
    if trials <= 0:
        return 0.0
    n = float(trials)
    phat = min(1.0, max(0.0, score))
    denom = 1.0 + z * z / n
    center = phat + z * z / (2.0 * n)
    margin = z * math.sqrt((phat * (1.0 - phat) + z * z / (4.0 * n)) / n)
    return max(0.0, (center - margin) / denom)


def isMastered(
    *,
    score: float,
    trials: int,
    strongCount: int,
    threshold: float = MASTERY_THRESHOLD,
) -> bool:
    """숙달 판정 — 불확실성 하한이 임계 이상 AND 강한 관측이 최소 1회.

    두 조건이 함께라야 "숙달" 라벨을 단다: 통계적으로 충분히 일관되게(하한) 잘하고,
    적어도 한 번은 강한 체크(output/variable/contains)로 증명했다. noError만으로는 못 단다.
    """
    return masteryLowerBound(score, trials, z=WILSON_Z) >= threshold and strongCount >= 1
