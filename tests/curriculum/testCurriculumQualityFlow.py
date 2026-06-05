from types import SimpleNamespace

from codaro.curriculum.learnerState import LearnerStateStore
from codaro.curriculum.lessonGraph import LessonGraph, LessonNode
from codaro.curriculum.progress import ProgressTracker
from codaro.curriculum.qualityFlow import (
    buildCurriculumCheckProposalsPayload,
    buildCurriculumQualityAnalysisPayload,
    buildCurriculumLessonStatsPayload,
    buildCurriculumQualityReport,
)
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
                estimatedMinutes=20,
            )
        ]
    )
    return SimpleNamespace(taxonomy=lambda: taxonomy, graph=lambda: graph)


def testLessonStatsPayloadUsesObservedProgressSamples(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")
    lesson = tracker.getLesson("python", "variables")
    lesson.observedMinutesEwma = 30.0
    lesson.observedSampleCount = 2
    tracker.save()

    payload = buildCurriculumLessonStatsPayload(
        curriculumOs=curriculumOs(),
        progressTracker=tracker,
    )

    assert payload["lessons"] == [
        {
            "key": "python/variables",
            "title": "Variables",
            "static": 20,
            "observedEwma": 30.0,
            "sampleCount": 2,
            "deviation": "+50.0%",
        }
    ]


def testQualityReportDistributesMisconceptionHitsToLessons(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")
    tracker.recordSectionResult("python", "variables", "intro", passed=False, hintLevel=2)
    store = LearnerStateStore(tmp_path / "learner.db")
    store.recordMisconception("m-1", "python.variables")

    report = buildCurriculumQualityReport(
        curriculumOs=curriculumOs(),
        progressTracker=tracker,
        learnerStateStore=store,
    )

    assert any(metric.misconceptionHits == 1 for metric in report.lessons)


def testCheckProposalPayloadHandlesMissingStudyLoader() -> None:
    payload = buildCurriculumCheckProposalsPayload(
        curriculumOs=curriculumOs(),
        studyLoader=None,
        aiProvider=None,
    )

    assert payload == {"available": False, "weak": [], "proposals": []}


def testQualityAnalysisPayloadFiltersDomainAndBuildsRecommendation(tmp_path) -> None:
    tracker = ProgressTracker(tmp_path / "progress.json")
    tracker.recordSectionResult("python", "variables", "intro", passed=False, hintLevel=2)

    payload = buildCurriculumQualityAnalysisPayload(
        curriculumOs=curriculumOs(),
        progressTracker=tracker,
        learnerStateStore=None,
        domain="pythonBasics",
        limit=3,
    )

    assert payload["lessons"][0]["lessonKey"] == "python/variables"
    assert payload["recommendation"]
