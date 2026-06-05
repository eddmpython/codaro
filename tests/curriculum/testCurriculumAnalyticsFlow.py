from types import SimpleNamespace

import pytest

from codaro.curriculum.analyticsFlow import (
    CurriculumAnalyticsError,
    CurriculumAnalyticsFlow,
    buildOutcomeMasteryPayload,
)
from codaro.curriculum.analyticsTimeline import AnalyticsTimeline
from codaro.curriculum.learnerState import LearnerStateStore
from codaro.curriculum.lessonGraph import LessonGraph, LessonNode
from codaro.curriculum.progress import ProgressTracker
from codaro.curriculum.taxonomy import CurriculumTaxonomy, DomainDef, OutcomeDef


def curriculumOs() -> SimpleNamespace:
    taxonomy = CurriculumTaxonomy(
        outcomes=[OutcomeDef(id="python.variables", label="Variables")],
        domains=[
            DomainDef(
                id="pythonBasics",
                label="Python basics",
                targetOutcomes=["python.variables"],
            )
        ],
    )
    graph = LessonGraph(
        lessons=[
            LessonNode(
                category="python",
                contentId="variables",
                title="Variables",
                outcomes=["python.variables"],
            )
        ]
    )
    return SimpleNamespace(taxonomy=lambda: taxonomy, graph=lambda: graph)


def testAnalyticsFlowOwnsMasteryAndSnapshotPayloads(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")
    tracker.markOutcomeValidated("python.variables")
    flow = CurriculumAnalyticsFlow(
        curriculumOs=curriculumOs(),
        progressTracker=tracker,
        learnerStateStore=LearnerStateStore(tmp_path / "learner.db"),
        analyticsTimeline=AnalyticsTimeline(tmp_path / "analytics.jsonl"),
        refreshIntervalSeconds=0,
    )

    mastery = flow.masteryReport()
    analytics = flow.analyticsPayload(days=30)
    summary = flow.analyticsSummaryPayload()

    assert mastery.masteredOutcomeCount == 1
    assert analytics["totalSnapshots"] == 1
    assert summary["available"] is True
    assert summary["currentMastered"] == 1


def testAnalyticsFlowThrottlesRepeatedRefreshes(tmp_path) -> None:
    flow = CurriculumAnalyticsFlow(
        curriculumOs=curriculumOs(),
        progressTracker=ProgressTracker(tmp_path / "progress.json"),
        learnerStateStore=None,
        analyticsTimeline=AnalyticsTimeline(tmp_path / "analytics.jsonl"),
        refreshIntervalSeconds=30,
    )

    assert flow.refreshSnapshot() is True
    assert flow.refreshSnapshot() is False


def testOutcomeMasteryPayloadFiltersDomainAndRejectsUnknownDomain(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")
    tracker.markOutcomeValidated("python.variables")

    payload = buildOutcomeMasteryPayload(
        curriculumOs=curriculumOs(),
        progressTracker=tracker,
        domain="pythonBasics",
        minLevel=0.5,
    )

    assert payload["masteredOutcomeIds"] == ["python.variables"]
    assert payload["domains"][0]["domainId"] == "pythonBasics"

    with pytest.raises(CurriculumAnalyticsError) as excInfo:
        buildOutcomeMasteryPayload(
            curriculumOs=curriculumOs(),
            progressTracker=tracker,
            domain="missing",
        )

    assert excInfo.value.code == "curriculum_unknown_domain"
