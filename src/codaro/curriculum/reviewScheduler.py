"""Review Scheduler — 완료한 lesson 의 망각 곡선 + spaced repetition 스케줄링.

SM-2 의 간소화 버전. 등급 0~5 대신 binary success/lapse 만 받는다 (체크 통과 = success).

- 신규 완료: interval=1, ease=2.5, streak=0
- 성공: interval *= ease, streak++, ease 변동 없음 (안정 학습)
- 실패: interval=1, ease=max(EASE_MIN, ease-0.2), streak=0
- 다음 검토는 (now + interval일) 시각

mastery 합성기는 이 시간감쇠를 사용해 오래된 lesson 의 contribution 을 절감한다.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Literal

from pydantic import BaseModel, Field


DEFAULT_INTERVAL_DAYS = 1
EASE_INITIAL = 2.5
EASE_MIN = 1.3
EASE_MAX = 2.8
EASE_LAPSE_DELTA = 0.2
INTERVAL_MAX_DAYS = 365


ReviewResult = Literal["fresh", "success", "lapse"]


class ReviewState(BaseModel):
    lessonKey: str
    interval: int = DEFAULT_INTERVAL_DAYS
    ease: float = EASE_INITIAL
    streak: int = 0
    nextReviewAt: str = Field(default_factory=lambda: _isoNow())
    lastResult: ReviewResult = "fresh"
    lastReviewedAt: str | None = None


def _isoNow() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parseIso(s: str | None) -> datetime | None:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        return None


def initState(lessonKey: str, completedAt: str | None = None) -> ReviewState:
    base = _parseIso(completedAt) or datetime.now(timezone.utc)
    nextAt = base + timedelta(days=DEFAULT_INTERVAL_DAYS)
    return ReviewState(
        lessonKey=lessonKey,
        interval=DEFAULT_INTERVAL_DAYS,
        ease=EASE_INITIAL,
        streak=0,
        nextReviewAt=nextAt.isoformat(),
        lastResult="fresh",
        lastReviewedAt=None,
    )


def updateOnSuccess(state: ReviewState, now: datetime | None = None) -> ReviewState:
    nowDt = now or datetime.now(timezone.utc)
    newInterval = min(INTERVAL_MAX_DAYS, max(DEFAULT_INTERVAL_DAYS, int(round(state.interval * state.ease))))
    nextAt = nowDt + timedelta(days=newInterval)
    return state.model_copy(update={
        "interval": newInterval,
        "streak": state.streak + 1,
        "nextReviewAt": nextAt.isoformat(),
        "lastResult": "success",
        "lastReviewedAt": nowDt.isoformat(),
    })


def updateOnLapse(state: ReviewState, now: datetime | None = None) -> ReviewState:
    nowDt = now or datetime.now(timezone.utc)
    newEase = max(EASE_MIN, state.ease - EASE_LAPSE_DELTA)
    nextAt = nowDt + timedelta(days=DEFAULT_INTERVAL_DAYS)
    return state.model_copy(update={
        "interval": DEFAULT_INTERVAL_DAYS,
        "ease": newEase,
        "streak": 0,
        "nextReviewAt": nextAt.isoformat(),
        "lastResult": "lapse",
        "lastReviewedAt": nowDt.isoformat(),
    })


def isDue(state: ReviewState, now: datetime | None = None) -> bool:
    nextAt = _parseIso(state.nextReviewAt)
    if nextAt is None:
        return True
    return (now or datetime.now(timezone.utc)) >= nextAt


def daysOverdue(state: ReviewState, now: datetime | None = None) -> int:
    nextAt = _parseIso(state.nextReviewAt)
    if nextAt is None:
        return 0
    delta = (now or datetime.now(timezone.utc)) - nextAt
    return max(0, delta.days)
