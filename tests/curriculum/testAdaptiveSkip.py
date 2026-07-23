"""Phase 6 — Adaptive Prerequisite Skip 회귀 테스트.

hint 0 + 첫 시도 통과 → outcome 이 빠르게 mastered. plan 합성 시 skip.
"""
from __future__ import annotations

from pathlib import Path

import pytest

from codaro.curriculum.lessonGraph import buildLessonGraph
from codaro.curriculum.outcomeMastery import computeMastery
from codaro.curriculum.planComposer import PlanGoal, composeMasterPlan
from codaro.curriculum.progress import ProgressTracker
from codaro.curriculum.studyLoader import StudyLoader
from codaro.curriculum.taxonomy import loadTaxonomy


ROOT = Path(__file__).resolve().parent.parent.parent
CURRICULA_DIR = ROOT / "curricula" / "python"


@pytest.fixture
def taxonomy():
    return loadTaxonomy()


@pytest.fixture
def graph(taxonomy):
    loader = StudyLoader(str(CURRICULA_DIR))
    return buildLessonGraph(loader, taxonomy)


@pytest.fixture
def tracker(tmp_path: Path):
    return ProgressTracker(storagePath=tmp_path / "progress.json")


def _pickOutcomeWithLesson(graph):
    """첫 lesson 의 첫 outcome 을 가져와서 그 lesson key/sectionId 와 함께 반환."""
    for lesson in graph.lessons:
        if lesson.outcomes:
            sectionId = next(iter(lesson.sectionOutcomes.keys()), "default")
            return lesson, sectionId, lesson.outcomes[0]
    raise RuntimeError("no lesson with outcomes")


def testFirstAttemptHintZeroMarksFastTrack(tracker, graph) -> None:
    lesson, sectionId, outcomeId = _pickOutcomeWithLesson(graph)
    # 첫 시도 → recordSectionResult 가 attemptCount 1 로 만든다.
    tracker.recordSectionResult(lesson.category, lesson.contentId, sectionId, passed=True, hintLevel=0)
    credited, _ = tracker.creditCheckPass(lesson.category, lesson.contentId, sectionId, [outcomeId], hintLevel=0)
    assert credited == [outcomeId]
    credits = tracker.listOutcomeCredits(outcomeId)
    assert any(c.fastTrack for c in credits), "hint 0 첫 시도 → fastTrack=True"


def testHintedPassDoesNotFastTrack(tracker, graph) -> None:
    lesson, sectionId, outcomeId = _pickOutcomeWithLesson(graph)
    tracker.recordSectionResult(lesson.category, lesson.contentId, sectionId, passed=True, hintLevel=2)
    tracker.creditCheckPass(lesson.category, lesson.contentId, sectionId, [outcomeId], hintLevel=2)
    credits = tracker.listOutcomeCredits(outcomeId)
    assert all(not c.fastTrack for c in credits), "힌트 사용은 fastTrack 아님"


def testSecondAttemptDoesNotFastTrack(tracker, graph) -> None:
    lesson, sectionId, outcomeId = _pickOutcomeWithLesson(graph)
    # 두 번 시도 → attemptCount=2.
    tracker.recordSectionResult(lesson.category, lesson.contentId, sectionId, passed=False, hintLevel=0)
    tracker.recordSectionResult(lesson.category, lesson.contentId, sectionId, passed=True, hintLevel=0)
    tracker.creditCheckPass(lesson.category, lesson.contentId, sectionId, [outcomeId], hintLevel=0)
    credits = tracker.listOutcomeCredits(outcomeId)
    assert all(not c.fastTrack for c in credits), "두 번째 시도부터 fastTrack 아님"


def testLegacyFastTrackDoesNotBoostCanonicalMastery(tracker, graph, taxonomy) -> None:
    lesson, sectionId, outcomeId = _pickOutcomeWithLesson(graph)
    tracker.recordSectionResult(lesson.category, lesson.contentId, sectionId, passed=True, hintLevel=0)
    tracker.creditCheckPass(lesson.category, lesson.contentId, sectionId, [outcomeId], hintLevel=0)
    report = computeMastery(graph, taxonomy, tracker)
    entry = next(o for o in report.outcomes if o.outcomeId == outcomeId)
    assert entry.fastTracked is False
    assert entry.level == 0.0
    assert entry.stage == "unproven"


def testLegacyFastTrackOutcomeIsNotSkippedInAdaptivePlan(tracker, graph, taxonomy) -> None:
    lesson, sectionId, outcomeId = _pickOutcomeWithLesson(graph)
    tracker.recordSectionResult(lesson.category, lesson.contentId, sectionId, passed=True, hintLevel=0)
    tracker.creditCheckPass(lesson.category, lesson.contentId, sectionId, [outcomeId], hintLevel=0)
    goal = PlanGoal(outcomes=[outcomeId], adaptiveSkip=True)
    plan = composeMasterPlan(goal, graph, taxonomy, tracker)
    skippedIds = {item["outcomeId"] for item in plan.adaptiveSkipped}
    assert outcomeId not in skippedIds
    assert outcomeId in plan.targetOutcomes


def testAdaptiveSkipDisabledKeepsOutcome(tracker, graph, taxonomy) -> None:
    lesson, sectionId, outcomeId = _pickOutcomeWithLesson(graph)
    tracker.recordSectionResult(lesson.category, lesson.contentId, sectionId, passed=True, hintLevel=0)
    tracker.creditCheckPass(lesson.category, lesson.contentId, sectionId, [outcomeId], hintLevel=0)
    goal = PlanGoal(outcomes=[outcomeId], adaptiveSkip=False)
    plan = composeMasterPlan(goal, graph, taxonomy, tracker)
    assert plan.adaptiveSkipped == [], "adaptiveSkip=False 면 빈 list"
