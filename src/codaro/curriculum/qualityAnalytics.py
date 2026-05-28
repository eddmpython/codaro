"""Phase 8 — 강의 품질 신호 합성.

학습자 progress (sectionResults + outcomeCredits) 와 learnerState misconception 누적을
강의 단위로 묶어 작가가 다음 보강 우선순위를 결정할 수 있게 한다.

판정 룰 (결정적):
- averageHintLevel >= NEEDS_ATTENTION_HINT 또는 passRate <= NEEDS_ATTENTION_PASS → needs-attention
- sampleSize < MIN_SAMPLES → insufficient-data
- 그 외 → good
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from .lessonGraph import LessonGraph
from .progress import ProgressTracker


MIN_SAMPLES = 3
NEEDS_ATTENTION_HINT = 1.5
NEEDS_ATTENTION_PASS = 0.5


QualitySignal = Literal["good", "needs-attention", "insufficient-data"]


class LessonQualityMetric(BaseModel):
    lessonKey: str
    title: str
    sectionCount: int = 0
    averageHintLevel: float = 0.0
    averageAttemptCount: float = 0.0
    passRate: float = 0.0
    misconceptionHits: int = 0
    sampleSize: int = 0
    qualitySignal: QualitySignal = "insufficient-data"


class CurriculumQualityReport(BaseModel):
    lessons: list[LessonQualityMetric] = Field(default_factory=list)
    overallHintAverage: float = 0.0
    overallPassRate: float = 0.0
    flaggedCount: int = 0


def _classify(metric: LessonQualityMetric) -> QualitySignal:
    if metric.sampleSize < MIN_SAMPLES:
        return "insufficient-data"
    if metric.averageHintLevel >= NEEDS_ATTENTION_HINT or metric.passRate <= NEEDS_ATTENTION_PASS:
        return "needs-attention"
    return "good"


def computeQualityReport(
    graph: LessonGraph,
    progressTracker: ProgressTracker,
    misconceptionHitsByLesson: dict[str, int] | None = None,
) -> CurriculumQualityReport:
    """progressTracker.load() 의 lessons[*].sectionResults 를 강의별로 합성."""
    progress = progressTracker.load()
    misconceptionMap = misconceptionHitsByLesson or {}
    metrics: list[LessonQualityMetric] = []
    totalHint = 0.0
    totalAttempts = 0.0
    totalSamples = 0
    totalPasses = 0
    for key, lesson in progress.lessons.items():
        sectionResults = list(lesson.sectionResults.values())
        if not sectionResults:
            continue
        node = graph.byKey(key)
        title = node.title if node else key
        hintSum = sum(s.hintLevel for s in sectionResults)
        attemptSum = sum(s.attemptCount for s in sectionResults)
        passes = sum(1 for s in sectionResults if s.passed)
        sample = len(sectionResults)
        metric = LessonQualityMetric(
            lessonKey=key,
            title=title,
            sectionCount=sample,
            averageHintLevel=hintSum / sample,
            averageAttemptCount=attemptSum / sample,
            passRate=passes / sample,
            misconceptionHits=misconceptionMap.get(key, 0),
            sampleSize=sample,
        )
        metric.qualitySignal = _classify(metric)
        metrics.append(metric)
        totalHint += hintSum
        totalAttempts += attemptSum
        totalSamples += sample
        totalPasses += passes
    metrics.sort(key=lambda m: (
        0 if m.qualitySignal == "needs-attention" else (1 if m.qualitySignal == "good" else 2),
        -m.averageHintLevel,
        m.lessonKey,
    ))
    overallHint = (totalHint / totalSamples) if totalSamples > 0 else 0.0
    overallPass = (totalPasses / totalSamples) if totalSamples > 0 else 0.0
    flagged = sum(1 for m in metrics if m.qualitySignal == "needs-attention")
    return CurriculumQualityReport(
        lessons=metrics,
        overallHintAverage=round(overallHint, 4),
        overallPassRate=round(overallPass, 4),
        flaggedCount=flagged,
    )


def flaggedLessonKeys(report: CurriculumQualityReport) -> list[str]:
    return [m.lessonKey for m in report.lessons if m.qualitySignal == "needs-attention"]


__all__ = [
    "CurriculumQualityReport",
    "LessonQualityMetric",
    "MIN_SAMPLES",
    "NEEDS_ATTENTION_HINT",
    "NEEDS_ATTENTION_PASS",
    "QualitySignal",
    "computeQualityReport",
    "flaggedLessonKeys",
]
