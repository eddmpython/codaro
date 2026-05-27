"""Curriculum OS — taxonomy/composer/AI tool 통합 테스트."""
from __future__ import annotations

from pathlib import Path

import pytest

from codaro.curriculum.lessonGraph import LessonGraph, LessonNode, buildLessonGraph
from codaro.curriculum.planComposer import PlanGoal, composeMasterPlan
from codaro.curriculum.studyLoader import StudyLoader
from codaro.curriculum.taxonomy import (
    CurriculumTaxonomy,
    DomainDef,
    LessonOutcomeRecord,
    OutcomeDef,
    loadTaxonomy,
    mergeLessonRecord,
)


ROOT = Path(__file__).resolve().parent.parent
CURRICULA_DIR = ROOT / "curricula" / "python"


# ---------------------------------------------------------------------------
# Taxonomy
# ---------------------------------------------------------------------------


def testTaxonomyLoadsAndValidates() -> None:
    taxonomy = loadTaxonomy()
    assert taxonomy.outcomes, "outcomes must be defined"
    assert taxonomy.domains, "domains must be defined"
    # 무결성 — domain.targetOutcomes의 모든 id가 outcome 목록에 있어야 함
    knownOutcomes = {outcome.id for outcome in taxonomy.outcomes}
    for domain in taxonomy.domains:
        for outcomeId in domain.targetOutcomes:
            assert outcomeId in knownOutcomes, (
                f"domain '{domain.id}' references unknown outcome '{outcomeId}'"
            )


def testTaxonomyLessonOutcomesValid() -> None:
    taxonomy = loadTaxonomy()
    knownOutcomes = {outcome.id for outcome in taxonomy.outcomes}
    for key, record in taxonomy.lessonOutcomes.items():
        for outcomeId in record.outcomes:
            assert outcomeId in knownOutcomes, (
                f"lesson {key} references unknown outcome '{outcomeId}'"
            )
        for outcomeId in record.prerequisites:
            assert outcomeId in knownOutcomes, (
                f"lesson {key} references unknown prerequisite '{outcomeId}'"
            )


def testTaxonomyRejectsUnknownOutcome(tmp_path: Path) -> None:
    bad = tmp_path / "bad.yml"
    bad.write_text(
        "outcomes:\n"
        "  - id: a\n    label: A\n"
        "domains:\n"
        "  - id: d\n    label: D\n    targetOutcomes: [a, missing]\n",
        encoding="utf-8",
    )
    with pytest.raises(ValueError, match="unknown outcome"):
        loadTaxonomy(bad)


def testMergeLessonRecordPrefersMeta() -> None:
    fallback = LessonOutcomeRecord(
        outcomes=["x.fallback"],
        prerequisites=["x.fallback"],
        estimatedMinutes=10,
    )
    meta = {
        "outcomes": ["x.meta"],
        "prerequisites": ["x.meta"],
        "estimatedMinutes": 99,
    }
    merged = mergeLessonRecord(meta, fallback)
    assert merged.outcomes == ["x.meta"]
    assert merged.prerequisites == ["x.meta"]
    assert merged.estimatedMinutes == 99


def testMergeLessonRecordFallsBack() -> None:
    fallback = LessonOutcomeRecord(
        outcomes=["x.fallback"],
        prerequisites=[],
        estimatedMinutes=20,
    )
    merged = mergeLessonRecord({}, fallback)
    assert merged.outcomes == ["x.fallback"]
    assert merged.estimatedMinutes == 20


# ---------------------------------------------------------------------------
# Lesson graph
# ---------------------------------------------------------------------------


def _smallTaxonomy() -> CurriculumTaxonomy:
    return CurriculumTaxonomy(
        outcomes=[
            OutcomeDef(id="a", label="A"),
            OutcomeDef(id="b", label="B"),
            OutcomeDef(id="c", label="C"),
        ],
        domains=[
            DomainDef(id="goalC", label="Goal C", targetOutcomes=["c"]),
        ],
    )


def _smallGraph() -> LessonGraph:
    return LessonGraph(lessons=[
        LessonNode(
            category="cat",
            contentId="01_a",
            title="Lesson A",
            sortKey=(100, "01_a"),
            outcomes=["a"],
            prerequisites=[],
            estimatedMinutes=10,
        ),
        LessonNode(
            category="cat",
            contentId="02_b",
            title="Lesson B",
            sortKey=(200, "02_b"),
            outcomes=["b"],
            prerequisites=["a"],
            estimatedMinutes=15,
        ),
        LessonNode(
            category="cat",
            contentId="03_c",
            title="Lesson C",
            sortKey=(300, "03_c"),
            outcomes=["c"],
            prerequisites=["b"],
            estimatedMinutes=20,
        ),
    ])


def testGraphBuildFromRealRepo() -> None:
    loader = StudyLoader(str(CURRICULA_DIR))
    taxonomy = loadTaxonomy()
    graph = buildLessonGraph(loader, taxonomy)
    assert graph.lessons, "real repo must produce at least one lesson"
    # 30days 트랙은 30개 정도가 등록되어 있어야 한다
    days = graph.lessonsInCategory("30days")
    assert len(days) >= 25


# ---------------------------------------------------------------------------
# Plan composer
# ---------------------------------------------------------------------------


def testComposerOrdersByPrerequisite() -> None:
    plan = composeMasterPlan(
        PlanGoal(domain="goalC"),
        _smallGraph(),
        _smallTaxonomy(),
        progressTracker=None,
    )
    keys = [step.key for step in plan.steps]
    assert keys == ["cat/01_a", "cat/02_b", "cat/03_c"], keys
    assert plan.totalMinutes == 45
    assert plan.gaps == []


def testComposerReportsGap() -> None:
    taxonomy = CurriculumTaxonomy(
        outcomes=[
            OutcomeDef(id="a", label="A"),
            OutcomeDef(id="missing", label="Missing"),
        ],
        domains=[DomainDef(id="goal", label="Goal", targetOutcomes=["a", "missing"])],
    )
    graph = LessonGraph(lessons=[
        LessonNode(
            category="cat",
            contentId="01_a",
            title="Lesson A",
            sortKey=(100, "01_a"),
            outcomes=["a"],
            prerequisites=[],
            estimatedMinutes=10,
        ),
    ])
    plan = composeMasterPlan(PlanGoal(domain="goal"), graph, taxonomy)
    gapIds = {gap.outcomeId for gap in plan.gaps}
    assert gapIds == {"missing"}
    assert [step.key for step in plan.steps] == ["cat/01_a"]


def testComposerWithExplicitOutcomes() -> None:
    plan = composeMasterPlan(
        PlanGoal(outcomes=["b"]),
        _smallGraph(),
        _smallTaxonomy(),
    )
    # b를 받기 위해 a도 끌어와야 한다
    keys = [step.key for step in plan.steps]
    assert keys == ["cat/01_a", "cat/02_b"]


def testComposerExcludesCompleted(tmp_path: Path) -> None:
    from codaro.curriculum.progress import ProgressTracker

    progressPath = tmp_path / "progress.json"
    tracker = ProgressTracker(progressPath)
    # cat/01_a를 완료 처리
    tracker.completeMission("cat", "01_a", "mission-1", totalMissions=1)
    plan = composeMasterPlan(
        PlanGoal(domain="goalC", excludeCompleted=True),
        _smallGraph(),
        _smallTaxonomy(),
        progressTracker=tracker,
    )
    keys = [step.key for step in plan.steps]
    assert "cat/01_a" not in keys
    assert keys == ["cat/02_b", "cat/03_c"]


def testComposerRealRepoSmokeForDataReporting() -> None:
    loader = StudyLoader(str(CURRICULA_DIR))
    taxonomy = loadTaxonomy()
    graph = buildLessonGraph(loader, taxonomy)
    plan = composeMasterPlan(
        PlanGoal(domain="dataReporting"),
        graph,
        taxonomy,
        progressTracker=None,
    )
    assert plan.steps, "dataReporting plan should produce lessons"
    # python.variables가 들어 있어야 한다 (pandas 작업의 기반)
    allOutcomes: set[str] = set()
    for step in plan.steps:
        allOutcomes.update(step.outcomes)
    assert "python.variables" in allOutcomes
    assert "pandas.intro" in allOutcomes


def testComposerSummaryMentionsGoal() -> None:
    plan = composeMasterPlan(
        PlanGoal(domain="goalC"),
        _smallGraph(),
        _smallTaxonomy(),
    )
    assert "Goal C" in plan.summary


# ---------------------------------------------------------------------------
# AI tool registration
# ---------------------------------------------------------------------------


def testCurriculumOsToolsRegistered() -> None:
    from codaro.ai.tools import allTools

    names = {tool.name for tool in allTools()}
    assert "list-curriculum-domains" in names
    assert "compose-master-plan" in names
    assert "inspect-curriculum" in names
    assert "list-curriculum-gaps" in names
    assert "propose-curriculum-draft" in names
    assert "search-curricula" in names


def testToolManifestIncludesCurriculumOsCategory() -> None:
    from codaro.ai.toolManifest import toolManifest

    manifest = toolManifest()
    groupIds = {group["id"] for group in manifest["groups"]}
    assert "curriculumOs" in groupIds
    laneIds = {lane["id"] for lane in manifest["lanes"]}
    assert "planning" in laneIds


def testProposeCurriculumDraftReturnsDraftOnly() -> None:
    import asyncio

    from codaro.ai.toolHandlers.curriculumOs import CurriculumOsToolHandlers

    class Holder(CurriculumOsToolHandlers):
        pass

    handler = Holder()
    args = {
        "outcomeId": "python.variables",
        "title": "테스트 강의",
        "summary": "변수 학습을 다루는 임시 강의",
        "sectionOutline": ["섹션 A", "섹션 B"],
        "suggestedCategory": "30days",
    }
    result = asyncio.run(handler._handle_proposeCurriculumDraft(args))
    assert "draft" in result
    assert result["draft"]["title"] == "테스트 강의"
    assert "사용자가 검토" in result["next"]
