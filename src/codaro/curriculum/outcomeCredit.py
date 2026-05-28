"""Outcome Credit — 체크 통과를 outcome 숙련도 신호로 변환한다.

학생이 어떤 섹션의 체크를 통과하면, 그 섹션에 매핑된 outcome 들에
weight 가 부여된 credit 이 누적된다. 힌트를 적게 쓸수록 가중치가 높다.

mastery 합성기는 이 credit 을 기존 lesson-level contribution 과
독립 사건으로 함께 합성한다. 같은 outcome 에 credit 이 충분히 쌓이면
(CERTIFY_THRESHOLD 회 + 평균 weight CERTIFY_WEIGHT 이상) auto-validated
표시가 되어 master plan 에서 skip 된다.
"""
from __future__ import annotations

from datetime import datetime, timezone

from pydantic import BaseModel, Field


CREDIT_CONTRIB = 0.5
CREDIT_HINT_FACTOR: dict[int, float] = {0: 1.0, 1: 0.7, 2: 0.5, 3: 0.3}
CREDIT_HINT_FACTOR_MIN = 0.2
CERTIFY_THRESHOLD = 3
CERTIFY_WEIGHT = 0.7


class OutcomeCreditEntry(BaseModel):
    outcomeId: str
    lessonKey: str
    sectionId: str
    hintLevel: int = 0
    weight: float = 1.0
    creditedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


def hintWeight(hintLevel: int) -> float:
    if hintLevel in CREDIT_HINT_FACTOR:
        return CREDIT_HINT_FACTOR[hintLevel]
    return CREDIT_HINT_FACTOR_MIN


def creditContribution(weight: float) -> float:
    """weight (0..1) 를 mastery 합성 기여도로 변환."""
    return CREDIT_CONTRIB * max(0.0, min(1.0, weight))


def shouldAutoValidate(credits: list[OutcomeCreditEntry]) -> bool:
    if len(credits) < CERTIFY_THRESHOLD:
        return False
    avgWeight = sum(c.weight for c in credits) / len(credits)
    return avgWeight >= CERTIFY_WEIGHT
