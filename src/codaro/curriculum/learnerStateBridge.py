"""Compatibility view over the canonical mastery projection.

This module keeps the existing unified-report endpoint shape available while
the old progress and learner-state databases are imported. It never blends or
scores those legacy rows.
"""
from __future__ import annotations

from collections.abc import Iterable, Mapping
from typing import Literal

from pydantic import BaseModel, Field

from .lessonGraph import LessonGraph
from .outcomeMastery import MasteryReport, computeMastery
from .progress import ProgressTracker
from .taxonomy import CurriculumTaxonomy


Source = Literal["evidence", "none"]


class UnifiedOutcomeMastery(BaseModel):
    outcomeId: str
    label: str
    canonicalScore: float = 0.0
    stage: str = "unproven"
    reviewDue: bool = False
    source: Source = "none"
    creditCount: int = 0


class UnifiedMasteryReport(BaseModel):
    outcomes: list[UnifiedOutcomeMastery] = Field(default_factory=list)
    masteredCount: int = 0
    totalCount: int = 0
    policyVersion: int = 1
    invalidEventIds: list[str] = Field(default_factory=list)


def buildUnifiedMastery(
    progressTracker: ProgressTracker,
    learnerStateStore: object | None,
    taxonomy: CurriculumTaxonomy,
    graph: LessonGraph,
    *,
    learningEvents: Iterable[Mapping[str, object]] = (),
) -> UnifiedMasteryReport:
    """Return one canonical reader view; ``learnerStateStore`` is ignored.

    The parameter remains during the downgrade-safe migration window so older
    callers can upgrade without a second response contract.
    """
    _ = learnerStateStore
    report: MasteryReport = computeMastery(
        graph,
        taxonomy,
        progressTracker,
        learningEvents=learningEvents,
    )
    outcomes = [
        UnifiedOutcomeMastery(
            outcomeId=entry.outcomeId,
            label=entry.label,
            canonicalScore=entry.level,
            stage=entry.stage,
            reviewDue=entry.reviewDue,
            source="evidence" if entry.creditCount else "none",
            creditCount=entry.creditCount,
        )
        for entry in report.outcomes
    ]
    return UnifiedMasteryReport(
        outcomes=sorted(outcomes, key=lambda item: (-item.canonicalScore, item.outcomeId)),
        masteredCount=report.masteredOutcomeCount,
        totalCount=report.totalOutcomeCount,
        policyVersion=report.policyVersion,
        invalidEventIds=report.invalidEventIds,
    )
