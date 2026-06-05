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


ROOT = Path(__file__).resolve().parent.parent.parent
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


def testResolveLearningGoalRanksCandidates() -> None:
    import asyncio

    from codaro.ai.toolHandlers.curriculumOs import CurriculumOsToolHandlers

    class Holder(CurriculumOsToolHandlers):
        pass

    handler = Holder()
    result = asyncio.run(
        handler._handle_resolveLearningGoal({"goalText": "엑셀 자동화로 보고서를 만들고 싶어요"})
    )
    assert "candidates" in result
    candidates = result["candidates"]
    assert candidates, "expected at least one candidate"
    # officeAutomation 도메인이 후보에 등장해야 한다
    domainIds = [c["domainId"] for c in candidates]
    assert "officeAutomation" in domainIds


def testResolveLearningGoalRequiresText() -> None:
    import asyncio

    from codaro.ai.toolHandlers.curriculumOs import CurriculumOsToolHandlers

    class Holder(CurriculumOsToolHandlers):
        pass

    handler = Holder()
    result = asyncio.run(handler._handle_resolveLearningGoal({"goalText": ""}))
    assert "error" in result


# ---------------------------------------------------------------------------
# API integration (FastAPI TestClient)
# ---------------------------------------------------------------------------


def testNoOrphanLessons() -> None:
    """모든 레슨이 plan 그래프에서 보여야 한다 — outcomes 또는 prerequisites가 비어있지 않아야.

    Curriculum OS 약점 audit과 동일한 무결성 게이트: 레슨이 존재하는데
    plan에서 보이지 않으면 학습 경로 합성이 그 레슨을 활용하지 못한다.
    """
    from codaro.curriculum.lessonGraph import buildLessonGraph

    loader = StudyLoader(str(CURRICULA_DIR))
    taxonomy = loadTaxonomy()
    graph = buildLessonGraph(loader, taxonomy)
    orphans = [
        lesson.key
        for lesson in graph.lessons
        if not lesson.outcomes and not lesson.prerequisites
    ]
    assert not orphans, f"orphan lessons (no outcomes nor prereqs): {orphans}"


def testEveryDomainProducesPlan() -> None:
    """모든 도메인이 실제 repo에서 비어있지 않은 plan을 만들어야 한다.

    Curriculum OS의 완성도 게이트: 카탈로그에 등록된 모든 도메인이
    실제 backfill로 작동해야 한다.
    """
    from codaro.curriculum.lessonGraph import buildLessonGraph

    loader = StudyLoader(str(CURRICULA_DIR))
    taxonomy = loadTaxonomy()
    graph = buildLessonGraph(loader, taxonomy)

    failures: list[str] = []
    for domain in taxonomy.domains:
        plan = composeMasterPlan(
            PlanGoal(domain=domain.id, excludeCompleted=False),
            graph, taxonomy,
        )
        if not plan.steps:
            failures.append(f"{domain.id}: empty plan")
        if plan.gaps:
            failures.append(f"{domain.id}: gaps - {[g.outcomeId for g in plan.gaps]}")
    assert not failures, "\n".join(failures)


def testTaxonomyCoversAllOutcomes() -> None:
    """모든 outcome이 어딘가의 레슨에서 제공되어야 한다."""
    from codaro.curriculum.lessonGraph import buildLessonGraph

    loader = StudyLoader(str(CURRICULA_DIR))
    taxonomy = loadTaxonomy()
    graph = buildLessonGraph(loader, taxonomy)
    covered = graph.coveredOutcomes()
    uncovered = {o.id for o in taxonomy.outcomes} - covered
    assert not uncovered, f"uncovered outcomes: {sorted(uncovered)}"


def testComposerEmitsNextStepKey() -> None:
    plan = composeMasterPlan(
        PlanGoal(domain="goalC"),
        _smallGraph(),
        _smallTaxonomy(),
    )
    assert plan.nextStepKey == "cat/01_a"


def testComposerCountsCompleted(tmp_path: Path) -> None:
    from codaro.curriculum.progress import ProgressTracker

    tracker = ProgressTracker(tmp_path / "progress.json")
    tracker.completeMission("cat", "01_a", "m1", totalMissions=1)
    plan = composeMasterPlan(
        PlanGoal(domain="goalC", excludeCompleted=False),
        _smallGraph(),
        _smallTaxonomy(),
        progressTracker=tracker,
    )
    assert plan.completedCount == 1
    assert plan.nextStepKey == "cat/02_b"


def testComposerDeterministicSnapshot() -> None:
    """같은 입력은 같은 plan을 낸다 — 알고리즘 결정성 보장."""
    from codaro.curriculum.lessonGraph import buildLessonGraph

    loader = StudyLoader(str(CURRICULA_DIR))
    taxonomy = loadTaxonomy()
    graph = buildLessonGraph(loader, taxonomy)

    plan1 = composeMasterPlan(
        PlanGoal(domain="dataReporting", excludeCompleted=False),
        graph, taxonomy,
    )
    plan2 = composeMasterPlan(
        PlanGoal(domain="dataReporting", excludeCompleted=False),
        graph, taxonomy,
    )
    keys1 = [step.key for step in plan1.steps]
    keys2 = [step.key for step in plan2.steps]
    assert keys1 == keys2
    assert plan1.totalMinutes == plan2.totalMinutes


def testCurriculumOsApiEndpoints(tmp_path) -> None:
    from fastapi.testclient import TestClient

    from codaro.server import createServerApp

    client = TestClient(createServerApp(workspaceRoot=tmp_path))

    taxonomy = client.get("/api/curriculum/taxonomy").json()
    assert taxonomy["outcomes"]
    assert taxonomy["domains"]

    plan = client.post(
        "/api/curriculum/master-plan",
        json={"domain": "dataReporting", "excludeCompleted": False},
    )
    assert plan.status_code == 200
    payload = plan.json()
    assert payload["steps"], "plan must produce steps for dataReporting"
    assert any(
        "pandas.intro" in step["outcomes"]
        for step in payload["steps"]
    ), "pandas.intro should appear in the plan"

    gaps = client.get("/api/curriculum/gaps").json()
    assert "gaps" in gaps

    unknown = client.post(
        "/api/curriculum/master-plan",
        json={"domain": "nonexistent"},
    )
    assert unknown.status_code == 400


# ---------------------------------------------------------------------------
# Phase 2b — Outcome credit & section-level outcomes
# ---------------------------------------------------------------------------


def _miniTaxonomyWithSections(tmp_path):
    yamlText = (
        "outcomes:\n"
        "  - id: a.intro\n    label: A intro\n"
        "  - id: a.advanced\n    label: A advanced\n"
        "domains:\n"
        "  - id: dom\n    label: Dom\n    targetOutcomes: [a.intro, a.advanced]\n"
        "lessonOutcomes:\n"
        "  cat/lessonA:\n"
        "    outcomes: [a.intro, a.advanced]\n"
        "    sectionOutcomes:\n"
        "      sec1: [a.intro]\n"
        "      sec2: [a.advanced]\n"
    )
    path = tmp_path / "tax.yml"
    path.write_text(yamlText, encoding="utf-8")
    return path


def testTaxonomySectionOutcomesParsed(tmp_path) -> None:
    path = _miniTaxonomyWithSections(tmp_path)
    taxonomy = loadTaxonomy(path)
    record = taxonomy.lessonRecord("cat", "lessonA")
    assert record is not None
    assert record.sectionOutcomes == {"sec1": ["a.intro"], "sec2": ["a.advanced"]}


def testTaxonomySectionOutcomesMustBeSubset(tmp_path) -> None:
    yamlText = (
        "outcomes:\n"
        "  - id: a.intro\n    label: A\n"
        "domains: []\n"
        "lessonOutcomes:\n"
        "  cat/lessonA:\n"
        "    outcomes: [a.intro]\n"
        "    sectionOutcomes:\n"
        "      sec1: [a.intro, a.unrelated]\n"
    )
    path = tmp_path / "tax.yml"
    path.write_text(yamlText, encoding="utf-8")
    with pytest.raises(ValueError, match="a.unrelated"):
        loadTaxonomy(path)


def testProgressRecordsSectionResult(tmp_path) -> None:
    from codaro.curriculum.progress import ProgressTracker

    storage = tmp_path / "progress.json"
    tracker = ProgressTracker(storagePath=storage)
    result = tracker.recordSectionResult("cat", "lesson", "sec1", passed=False, hintLevel=1)
    assert result.attemptCount == 1
    assert not result.passed
    result2 = tracker.recordSectionResult("cat", "lesson", "sec1", passed=True, hintLevel=2)
    assert result2.attemptCount == 2
    assert result2.passed
    assert result2.firstPassAt is not None


def testCheckPassCreditsOutcome(tmp_path) -> None:
    from codaro.curriculum.progress import ProgressTracker

    storage = tmp_path / "progress.json"
    tracker = ProgressTracker(storagePath=storage)
    credited, auto = tracker.creditCheckPass(
        "cat", "lesson", "sec1", ["a.intro"], hintLevel=0,
    )
    assert credited == ["a.intro"]
    assert auto == []
    credits = tracker.listOutcomeCredits("a.intro")
    assert len(credits) == 1
    assert credits[0].weight == 1.0
    assert credits[0].hintLevel == 0


def testHintLevelReducesCreditWeight(tmp_path) -> None:
    from codaro.curriculum.outcomeCredit import hintWeight

    assert hintWeight(0) == 1.0
    assert hintWeight(1) == 0.7
    assert hintWeight(2) == 0.5
    assert hintWeight(3) == 0.3
    assert hintWeight(10) == 0.2  # min floor


def testAutoValidatedAfterThreshold(tmp_path) -> None:
    from codaro.curriculum.progress import ProgressTracker

    storage = tmp_path / "progress.json"
    tracker = ProgressTracker(storagePath=storage)
    for sectionId in ("sec1", "sec2", "sec3"):
        credited, auto = tracker.creditCheckPass(
            "cat", "lesson", sectionId, ["a.intro"], hintLevel=0,
        )
    assert credited == ["a.intro"]
    assert auto == ["a.intro"], "3 first-try credits should auto-validate"
    assert "a.intro" in tracker.listAutoValidatedOutcomes()
    assert "a.intro" in tracker.listValidatedOutcomes()


def testAutoValidatedRespectsAverageWeight(tmp_path) -> None:
    from codaro.curriculum.progress import ProgressTracker

    storage = tmp_path / "progress.json"
    tracker = ProgressTracker(storagePath=storage)
    # 3 credits at hintLevel=2 → weight 0.5 average → below 0.7 threshold
    for sectionId in ("a", "b", "c"):
        tracker.creditCheckPass("cat", "lesson", sectionId, ["a.intro"], hintLevel=2)
    assert "a.intro" not in tracker.listAutoValidatedOutcomes()


def testComputeMasteryIncludesCredits(tmp_path) -> None:
    from codaro.curriculum.lessonGraph import LessonGraph, LessonNode
    from codaro.curriculum.outcomeMastery import computeMastery
    from codaro.curriculum.progress import ProgressTracker
    from codaro.curriculum.taxonomy import CurriculumTaxonomy, OutcomeDef

    storage = tmp_path / "progress.json"
    tracker = ProgressTracker(storagePath=storage)
    tracker.creditCheckPass("cat", "lesson", "sec1", ["a.intro"], hintLevel=0)
    graph = LessonGraph(lessons=[LessonNode(
        category="cat", contentId="lesson", title="L",
        outcomes=["a.intro"],
        sectionOutcomes={"sec1": ["a.intro"]},
    )])
    taxonomy = CurriculumTaxonomy(outcomes=[OutcomeDef(id="a.intro", label="A")])
    report = computeMastery(graph, taxonomy, tracker)
    entry = next(o for o in report.outcomes if o.outcomeId == "a.intro")
    # credit weight 1.0 → 0.5 contribution
    assert entry.level >= 0.5
    assert entry.creditCount == 1


def testLessonNodeOutcomesForSection() -> None:
    from codaro.curriculum.lessonGraph import LessonNode

    node = LessonNode(
        category="cat", contentId="lesson", title="L",
        outcomes=["a", "b"],
        sectionOutcomes={"sec1": ["a"]},
    )
    assert node.outcomesForSection("sec1") == ["a"]
    # 매핑 없는 섹션은 lesson outcomes 전체 fallback
    assert node.outcomesForSection("unknown") == ["a", "b"]


# ---------------------------------------------------------------------------
# Phase 2d — lessonRole / project plan
# ---------------------------------------------------------------------------


def testPlanStepsCarryLessonRole() -> None:
    taxonomy = loadTaxonomy()
    loader = StudyLoader(str(CURRICULA_DIR))
    from codaro.curriculum.lessonGraph import buildLessonGraph
    graph = buildLessonGraph(loader, taxonomy)
    plan = composeMasterPlan(
        PlanGoal(domain="dataReporting", excludeCompleted=False),
        graph, taxonomy,
    )
    roles = {step.lessonRole for step in plan.steps}
    assert "concept" in roles or "project" in roles, "steps must carry lessonRole"


def testProjectIntentMatchesKoreanKeywords() -> None:
    taxonomy = loadTaxonomy()
    loader = StudyLoader(str(CURRICULA_DIR))
    from codaro.curriculum.lessonGraph import buildLessonGraph
    graph = buildLessonGraph(loader, taxonomy)
    plan = composeMasterPlan(
        PlanGoal(projectIntent="매출 대시보드 만들기", excludeCompleted=False),
        graph, taxonomy,
    )
    assert "대시보드" in plan.projectMatches
    assert plan.projectSteps, "matching project lessons should appear as project tier"


def testThreeTierSplit() -> None:
    taxonomy = loadTaxonomy()
    loader = StudyLoader(str(CURRICULA_DIR))
    from codaro.curriculum.lessonGraph import buildLessonGraph
    graph = buildLessonGraph(loader, taxonomy)
    plan = composeMasterPlan(
        PlanGoal(domain="dataReporting", excludeCompleted=False),
        graph, taxonomy,
    )
    # 합집합이 steps 와 동일
    combined = plan.conceptSteps + plan.practiceSteps + plan.projectSteps
    assert {s.key for s in combined} == {s.key for s in plan.steps}
