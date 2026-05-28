"""LearnerState Bridge — outcomeMastery (progress.json 합성) 와 learnerState
(SQLite EMA) 두 소스를 통합 view 로 제공.

두 저장소는 합치지 않는다 — 각각의 의미가 다르기 때문이다:
- outcomeMastery: lesson 완료/체크 통과 등 진도 기반 확률 합성.
- learnerState: 매 코드 실행의 success/failure EMA + misconception hit.

planComposer.dynamicGaps 와 analytics 가 이 합쳐진 score 를 사용해 학습자의
실제 능력을 더 정확하게 가늠하도록 한다.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from .learnerState import LearnerStateStore
from .lessonGraph import LessonGraph
from .outcomeMastery import MasteryReport, computeMastery
from .progress import ProgressTracker
from .taxonomy import CurriculumTaxonomy


BLEND_PROGRESS_WEIGHT = 0.6
BLEND_LEARNER_WEIGHT = 0.4

Source = Literal["progress", "learnerState", "blended", "none"]


class UnifiedOutcomeMastery(BaseModel):
    outcomeId: str
    label: str
    progressMastery: float = 0.0       # outcomeMastery 결과 (0..1)
    learnerStateScore: float = 0.0     # learnerState EMA score
    learnerStateConfidence: float = 0.0
    blendedScore: float = 0.0
    source: Source = "none"
    validated: bool = False
    autoValidated: bool = False
    creditCount: int = 0


class UnifiedMasteryReport(BaseModel):
    outcomes: list[UnifiedOutcomeMastery] = Field(default_factory=list)
    masteredCount: int = 0
    totalCount: int = 0


def buildUnifiedMastery(
    progressTracker: ProgressTracker,
    learnerStateStore: LearnerStateStore | None,
    taxonomy: CurriculumTaxonomy,
    graph: LessonGraph,
) -> UnifiedMasteryReport:
    validated = progressTracker.listValidatedOutcomes()
    report: MasteryReport = computeMastery(graph, taxonomy, progressTracker, validated)

    learnerMap: dict[str, tuple[float, float]] = {}
    if learnerStateStore is not None:
        for mastery in learnerStateStore.listMastery():
            learnerMap[mastery.outcomeId] = (mastery.score, mastery.confidence)

    unified: list[UnifiedOutcomeMastery] = []
    masteredCount = 0
    for entry in report.outcomes:
        learner = learnerMap.get(entry.outcomeId)
        progress = entry.level
        if learner is not None:
            score, confidence = learner
            if progress > 0:
                blended = BLEND_PROGRESS_WEIGHT * progress + BLEND_LEARNER_WEIGHT * score
                source: Source = "blended"
            else:
                blended = score
                source = "learnerState"
        else:
            score, confidence = 0.0, 0.0
            if progress > 0:
                blended = progress
                source = "progress"
            else:
                blended = 0.0
                source = "none"
        if entry.validated or entry.autoValidated:
            blended = 1.0
        if entry.validated or entry.autoValidated or blended >= 0.8:
            masteredCount += 1
        unified.append(UnifiedOutcomeMastery(
            outcomeId=entry.outcomeId,
            label=entry.label,
            progressMastery=round(progress, 4),
            learnerStateScore=round(score, 4),
            learnerStateConfidence=round(confidence, 4),
            blendedScore=round(blended, 4),
            source=source,
            validated=entry.validated,
            autoValidated=entry.autoValidated,
            creditCount=entry.creditCount,
        ))

    return UnifiedMasteryReport(
        outcomes=sorted(unified, key=lambda u: (-u.blendedScore, u.outcomeId)),
        masteredCount=masteredCount,
        totalCount=len(unified),
    )
