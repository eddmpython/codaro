"""Phase 8 — 강의 품질 분석 회귀 테스트."""
from __future__ import annotations

from pathlib import Path

import pytest

from codaro.curriculum.lessonGraph import buildLessonGraph
from codaro.curriculum.progress import ProgressTracker
from codaro.curriculum.qualityAnalytics import (
    NEEDS_ATTENTION_HINT,
    computeQualityReport,
    flaggedLessonKeys,
)
from codaro.curriculum.studyLoader import StudyLoader
from codaro.curriculum.taxonomy import loadTaxonomy


ROOT = Path(__file__).resolve().parent.parent
CURRICULA_DIR = ROOT / "curricula" / "python"


@pytest.fixture
def graph():
    taxonomy = loadTaxonomy()
    return buildLessonGraph(StudyLoader(str(CURRICULA_DIR)), taxonomy)


@pytest.fixture
def tracker(tmp_path):
    return ProgressTracker(storagePath=tmp_path / "progress.json")


def _pickLesson(graph):
    for lesson in graph.lessons:
        if lesson.sectionOutcomes:
            return lesson, next(iter(lesson.sectionOutcomes.keys()))
    return graph.lessons[0], "default"


def testGoodLessonMarkedGood(tracker, graph) -> None:
    lesson, sectionId = _pickLesson(graph)
    # hint 0 / 첫 시도 통과 3회 시뮬레이션 (3 sections passed cleanly).
    for sid in (f"{sectionId}_a", f"{sectionId}_b", f"{sectionId}_c"):
        tracker.recordSectionResult(lesson.category, lesson.contentId, sid, passed=True, hintLevel=0)
    report = computeQualityReport(graph, tracker)
    metric = next(m for m in report.lessons if m.lessonKey == lesson.key)
    assert metric.qualitySignal == "good"
    assert metric.passRate == 1.0
    assert metric.averageHintLevel == 0.0


def testHighHintMarkedNeedsAttention(tracker, graph) -> None:
    lesson, sectionId = _pickLesson(graph)
    # hint 2 평균 3 section.
    for i, hint in enumerate([2, 2, 2]):
        tracker.recordSectionResult(
            lesson.category, lesson.contentId, f"{sectionId}_{i}",
            passed=True, hintLevel=hint,
        )
    report = computeQualityReport(graph, tracker)
    metric = next(m for m in report.lessons if m.lessonKey == lesson.key)
    assert metric.qualitySignal == "needs-attention"
    assert metric.averageHintLevel >= NEEDS_ATTENTION_HINT


def testLowPassRateMarkedNeedsAttention(tracker, graph) -> None:
    lesson, sectionId = _pickLesson(graph)
    # 4 section 중 1 만 통과 → passRate 0.25.
    tracker.recordSectionResult(lesson.category, lesson.contentId, f"{sectionId}_a", passed=True, hintLevel=0)
    for sid in (f"{sectionId}_b", f"{sectionId}_c", f"{sectionId}_d"):
        tracker.recordSectionResult(lesson.category, lesson.contentId, sid, passed=False, hintLevel=1)
    report = computeQualityReport(graph, tracker)
    metric = next(m for m in report.lessons if m.lessonKey == lesson.key)
    assert metric.qualitySignal == "needs-attention"
    assert metric.passRate <= 0.5


def testInsufficientDataExcludedFromGood(tracker, graph) -> None:
    lesson, sectionId = _pickLesson(graph)
    # 1 section 만 → MIN_SAMPLES=3 미달.
    tracker.recordSectionResult(lesson.category, lesson.contentId, sectionId, passed=True, hintLevel=0)
    report = computeQualityReport(graph, tracker)
    metric = next(m for m in report.lessons if m.lessonKey == lesson.key)
    assert metric.qualitySignal == "insufficient-data"
    assert metric.sampleSize == 1


def testMisconceptionAggregation(tracker, graph) -> None:
    lesson, sectionId = _pickLesson(graph)
    for sid in (f"{sectionId}_a", f"{sectionId}_b", f"{sectionId}_c"):
        tracker.recordSectionResult(lesson.category, lesson.contentId, sid, passed=True, hintLevel=0)
    misconceptionMap = {lesson.key: 5}
    report = computeQualityReport(graph, tracker, misconceptionMap)
    metric = next(m for m in report.lessons if m.lessonKey == lesson.key)
    assert metric.misconceptionHits == 5


def testReportDeterministic(tracker, graph) -> None:
    lesson, sectionId = _pickLesson(graph)
    for sid in (f"{sectionId}_a", f"{sectionId}_b", f"{sectionId}_c"):
        tracker.recordSectionResult(lesson.category, lesson.contentId, sid, passed=True, hintLevel=1)
    a = computeQualityReport(graph, tracker)
    b = computeQualityReport(graph, tracker)
    assert a.model_dump() == b.model_dump()


def testFlaggedLessonKeysFiltersNeedsAttention(tracker, graph) -> None:
    lesson, sectionId = _pickLesson(graph)
    for sid in (f"{sectionId}_a", f"{sectionId}_b", f"{sectionId}_c"):
        tracker.recordSectionResult(lesson.category, lesson.contentId, sid, passed=True, hintLevel=2)
    report = computeQualityReport(graph, tracker)
    flagged = flaggedLessonKeys(report)
    assert lesson.key in flagged
