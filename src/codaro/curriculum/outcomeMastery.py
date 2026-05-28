"""Outcome Mastery — 학습 진도를 outcome 단위 숙련도로 끌어올린다.

Curriculum OS의 합성기는 "어떤 레슨을 끝냈는가"를 보지만, 진짜 교육 AI는
"학습자가 어떤 능력(outcome)을 얼마나 익혔는가"를 알아야 한다. 이 모듈은
ProgressTracker가 가진 레슨 단위 데이터를 outcome 단위 숙련도로 환산한다.

모델 — 확률적 누적(compound):
- 각 outcome은 그것을 제공하는 레슨들로부터 신뢰도를 받는다.
- 한 레슨이 완료되면 contribution p = LESSON_CONTRIB(완료 ≈ 0.6,
  접근만 ≈ 0.2). 사용자가 명시적으로 outcome을 validated 표시하면 1.0.
- 여러 레슨이 같은 outcome을 제공할 때는 독립 사건으로 보고
  mastery = 1 - ∏(1 - p_i)
  → 한 레슨만 끝내도 60%, 두 레슨 끝내면 84%, 세 레슨이면 94%.
- 도메인 mastery는 targetOutcomes 평균.

이 값은 그대로 UI에 표시되고, 합성기의 `skipMasteredOutcomes` 옵션이 켜지면
mastery > MASTERY_THRESHOLD인 outcome은 plan에서 제외된다.
"""
from __future__ import annotations

from datetime import datetime, timezone
from math import prod

from pydantic import BaseModel, Field

from .lessonGraph import LessonGraph
from .outcomeCredit import OutcomeCreditEntry, creditContribution
from .progress import LessonProgress, ProgressTracker
from .taxonomy import CurriculumTaxonomy


COMPLETED_CONTRIB = 0.6
ACCESSED_CONTRIB = 0.2
MASTERY_THRESHOLD = 0.8
DECAY_HALFLIFE_DAYS = 30.0
DECAY_FLOOR = 0.25


def _decayedContribution(baseContrib: float, isoTimestamp: str | None) -> float:
    """ISO timestamp 의 마지막 접촉 이후 시간을 반영해 contribution 을 줄인다.

    half-life = DECAY_HALFLIFE_DAYS. 30 일 지나면 0.5 배, 60 일 0.25 배.
    floor 는 DECAY_FLOOR — 학습 흔적은 완전히 사라지지 않게.
    """
    if not isoTimestamp:
        return baseContrib
    try:
        ts = datetime.fromisoformat(isoTimestamp)
    except ValueError:
        return baseContrib
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    delta = datetime.now(timezone.utc) - ts
    days = max(0.0, delta.total_seconds() / 86400.0)
    factor = max(DECAY_FLOOR, 0.5 ** (days / DECAY_HALFLIFE_DAYS))
    return baseContrib * factor


class OutcomeMastery(BaseModel):
    outcomeId: str
    label: str
    level: float = 0.0  # 0..1
    completedLessonKeys: list[str] = Field(default_factory=list)
    inProgressLessonKeys: list[str] = Field(default_factory=list)
    sourceLessonCount: int = 0
    creditCount: int = 0
    lastCreditAt: str | None = None
    validated: bool = False
    autoValidated: bool = False

    @property
    def mastered(self) -> bool:
        return self.validated or self.autoValidated or self.level >= MASTERY_THRESHOLD


class DomainMastery(BaseModel):
    domainId: str
    label: str
    level: float = 0.0
    masteredOutcomeCount: int = 0
    targetOutcomeCount: int = 0


class MasteryReport(BaseModel):
    outcomes: list[OutcomeMastery]
    domains: list[DomainMastery]
    masteredOutcomeCount: int
    totalOutcomeCount: int


def _lessonStateMap(progressTracker: ProgressTracker) -> dict[str, tuple[str, LessonProgress]]:
    """레슨 키 -> ('completed' | 'inProgress', LessonProgress) — decay 계산에 쓸 timestamp 동봉."""
    state = progressTracker.load()
    out: dict[str, tuple[str, LessonProgress]] = {}
    for key, lesson in state.lessons.items():
        status = "completed" if lesson.completedAt else "inProgress"
        out[key] = (status, lesson)
    return out


def computeMastery(
    graph: LessonGraph,
    taxonomy: CurriculumTaxonomy,
    progressTracker: ProgressTracker | None,
    validatedOutcomes: set[str] | None = None,
) -> MasteryReport:
    """진도 + 그래프 + credit + (선택) validated 표시로부터 mastery 리포트 합성."""
    lessonStates = _lessonStateMap(progressTracker) if progressTracker is not None else {}
    creditMap: dict[str, list[OutcomeCreditEntry]] = (
        progressTracker.outcomeCreditMap() if progressTracker is not None else {}
    )
    manualValidated: set[str] = (
        progressTracker.listManuallyValidatedOutcomes() if progressTracker is not None else set()
    )
    autoValidated: set[str] = (
        progressTracker.listAutoValidatedOutcomes() if progressTracker is not None else set()
    )
    if validatedOutcomes is not None:
        manualValidated = manualValidated | (validatedOutcomes - autoValidated)
    validated = manualValidated | autoValidated

    outcomeMap: dict[str, OutcomeMastery] = {}
    for outcome in taxonomy.outcomes:
        providers = graph.lessonsProvidingOutcome(outcome.id)
        completed: list[str] = []
        inProgress: list[str] = []
        contributions: list[float] = []
        for lesson in providers:
            entry = lessonStates.get(lesson.key)
            if entry is None:
                continue
            status, lessonProgress = entry
            if status == "completed":
                completed.append(lesson.key)
                contributions.append(
                    _decayedContribution(COMPLETED_CONTRIB, lessonProgress.lastAccessedAt or lessonProgress.completedAt)
                )
            elif status == "inProgress":
                inProgress.append(lesson.key)
                contributions.append(
                    _decayedContribution(ACCESSED_CONTRIB, lessonProgress.lastAccessedAt)
                )
        credits = creditMap.get(outcome.id, [])
        for credit in credits:
            contributions.append(
                _decayedContribution(creditContribution(credit.weight), credit.creditedAt)
            )
        lastCreditAt = credits[-1].creditedAt if credits else None
        if outcome.id in validated:
            level = 1.0
        elif contributions:
            level = 1.0 - prod(1.0 - c for c in contributions)
        else:
            level = 0.0
        outcomeMap[outcome.id] = OutcomeMastery(
            outcomeId=outcome.id,
            label=outcome.label,
            level=round(level, 4),
            completedLessonKeys=completed,
            inProgressLessonKeys=inProgress,
            sourceLessonCount=len(providers),
            creditCount=len(credits),
            lastCreditAt=lastCreditAt,
            validated=outcome.id in manualValidated,
            autoValidated=outcome.id in autoValidated,
        )

    domains: list[DomainMastery] = []
    for domain in taxonomy.domains:
        targetLevels: list[float] = []
        masteredCount = 0
        for outcomeId in domain.targetOutcomes:
            entry = outcomeMap.get(outcomeId)
            if entry is None:
                continue
            targetLevels.append(entry.level)
            if entry.mastered:
                masteredCount += 1
        avg = sum(targetLevels) / len(targetLevels) if targetLevels else 0.0
        domains.append(DomainMastery(
            domainId=domain.id,
            label=domain.label,
            level=round(avg, 4),
            masteredOutcomeCount=masteredCount,
            targetOutcomeCount=len(domain.targetOutcomes),
        ))

    masteredOutcomeCount = sum(1 for o in outcomeMap.values() if o.mastered)
    return MasteryReport(
        outcomes=sorted(outcomeMap.values(), key=lambda o: (-o.level, o.outcomeId)),
        domains=sorted(domains, key=lambda d: (-d.level, d.domainId)),
        masteredOutcomeCount=masteredOutcomeCount,
        totalOutcomeCount=len(outcomeMap),
    )


def masteredOutcomeIds(report: MasteryReport) -> set[str]:
    return {entry.outcomeId for entry in report.outcomes if entry.mastered}
