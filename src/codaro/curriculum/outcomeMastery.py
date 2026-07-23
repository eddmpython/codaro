"""Canonical outcome mastery projection.

Lesson access, lesson completion, manual validation, legacy outcome credits, and
learner-state EMA rows remain migration or diagnostics data. Only canonical
``LearningEvent`` rows reduced by ``MasteryPolicy`` can change mastery.
"""
from __future__ import annotations

from collections.abc import Iterable, Mapping

from pydantic import BaseModel, Field

from .lessonGraph import LessonGraph
from .masteryPolicy import MasteryPolicy
from .progress import LessonProgress, ProgressTracker
from .taxonomy import CurriculumTaxonomy


class OutcomeMastery(BaseModel):
    outcomeId: str
    label: str
    level: float = 0.0
    stage: str = "unproven"
    reviewDue: bool = False
    completedLessonKeys: list[str] = Field(default_factory=list)
    inProgressLessonKeys: list[str] = Field(default_factory=list)
    sourceLessonCount: int = 0
    creditCount: int = 0
    lastCreditAt: str | None = None
    validated: bool = False
    autoValidated: bool = False
    fastTracked: bool = False

    @property
    def mastered(self) -> bool:
        return self.stage == "mastered" and not self.reviewDue


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
    policyVersion: int = 1
    invalidEventIds: list[str] = Field(default_factory=list)


def _lessonStateMap(progressTracker: ProgressTracker) -> dict[str, tuple[str, LessonProgress]]:
    state = progressTracker.load()
    return {
        key: ("completed" if lesson.completedAt else "inProgress", lesson)
        for key, lesson in state.lessons.items()
    }


def computeMastery(
    graph: LessonGraph,
    taxonomy: CurriculumTaxonomy,
    progressTracker: ProgressTracker | None,
    validatedOutcomes: set[str] | None = None,
    *,
    learningEvents: Iterable[Mapping[str, object]] = (),
    asOf: str | None = None,
) -> MasteryReport:
    """Build the taxonomy view from the canonical event reducer.

    ``progressTracker`` is read only for navigation metadata. The
    ``validatedOutcomes`` argument remains temporarily source-compatible with
    older callers but intentionally has no mastery effect.
    """
    _ = validatedOutcomes
    projection = MasteryPolicy().reduce(learningEvents, asOf=asOf)
    projectedByOutcome = {entry.outcomeId: entry for entry in projection.outcomes}
    lessonStates = _lessonStateMap(progressTracker) if progressTracker is not None else {}

    outcomeMap: dict[str, OutcomeMastery] = {}
    for outcome in taxonomy.outcomes:
        providers = graph.lessonsProvidingOutcome(outcome.id)
        completed = [
            lesson.key
            for lesson in providers
            if lessonStates.get(lesson.key, ("", None))[0] == "completed"
        ]
        inProgress = [
            lesson.key
            for lesson in providers
            if lessonStates.get(lesson.key, ("", None))[0] == "inProgress"
        ]
        projected = projectedByOutcome.get(outcome.id)
        outcomeMap[outcome.id] = OutcomeMastery(
            outcomeId=outcome.id,
            label=outcome.label,
            level=projected.score if projected is not None else 0.0,
            stage=projected.stage if projected is not None else "unproven",
            reviewDue=projected.reviewDue if projected is not None else False,
            completedLessonKeys=completed,
            inProgressLessonKeys=inProgress,
            sourceLessonCount=len(providers),
            creditCount=len(projected.creditEventIds) if projected is not None else 0,
            lastCreditAt=projected.lastEvidenceTime if projected is not None else None,
        )

    domains: list[DomainMastery] = []
    for domain in taxonomy.domains:
        targetEntries = [
            outcomeMap[outcomeId]
            for outcomeId in domain.targetOutcomes
            if outcomeId in outcomeMap
        ]
        domains.append(DomainMastery(
            domainId=domain.id,
            label=domain.label,
            level=round(
                sum(entry.level for entry in targetEntries) / len(targetEntries),
                4,
            ) if targetEntries else 0.0,
            masteredOutcomeCount=sum(entry.mastered for entry in targetEntries),
            targetOutcomeCount=len(domain.targetOutcomes),
        ))

    return MasteryReport(
        outcomes=sorted(outcomeMap.values(), key=lambda item: (-item.level, item.outcomeId)),
        domains=sorted(domains, key=lambda item: (-item.level, item.domainId)),
        masteredOutcomeCount=sum(entry.mastered for entry in outcomeMap.values()),
        totalOutcomeCount=len(outcomeMap),
        policyVersion=projection.policyVersion,
        invalidEventIds=projection.invalidEventIds,
    )


def masteredOutcomeIds(report: MasteryReport) -> set[str]:
    return {entry.outcomeId for entry in report.outcomes if entry.mastered}
