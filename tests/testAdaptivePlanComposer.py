"""Adaptive planComposer 테스트 — Predict-Run-Reconcile-Adapt 루프 5단계.

learnerState 입력이 주어졌을 때 step에 mastery가 붙고 dynamic gap이 분리되며,
같은 입력에 대해 결정적 plan이 나오는지 검증한다.
"""
from __future__ import annotations

from pathlib import Path

from codaro.curriculum.learnerState import LearnerStateStore
from codaro.curriculum.lessonGraph import LessonGraph, LessonNode
from codaro.curriculum.planComposer import (
    DYNAMIC_GAP_MASTERY_THRESHOLD,
    PlanGoal,
    composeMasterPlan,
)
from codaro.curriculum.taxonomy import (
    CurriculumTaxonomy,
    DomainDef,
    OutcomeDef,
)


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


def testStepsHaveNullMasteryWhenLearnerStoreAbsent() -> None:
    plan = composeMasterPlan(
        PlanGoal(domain="goalC"),
        _smallGraph(),
        _smallTaxonomy(),
    )
    for step in plan.steps:
        assert step.learnerMastery is None
        assert step.learnerConfidence is None
    assert plan.dynamicGaps == []


def testStepsCarryMasteryWhenLearnerStorePresent(tmp_path: Path) -> None:
    store = LearnerStateStore(tmp_path / "learner.db")
    store.recordOutcomeAttempt("a", success=True)
    store.recordOutcomeAttempt("a", success=True)

    plan = composeMasterPlan(
        PlanGoal(domain="goalC"),
        _smallGraph(),
        _smallTaxonomy(),
        learnerStateStore=store,
    )

    stepA = next(step for step in plan.steps if step.key == "cat/01_a")
    assert stepA.learnerMastery is not None
    assert stepA.learnerMastery > 0.0
    assert stepA.learnerConfidence is not None


def testDynamicGapTriggeredByLowMastery(tmp_path: Path) -> None:
    """목표 outcome에 대해 학습자 mastery가 낮으면 dynamic gap으로 분리."""
    store = LearnerStateStore(tmp_path / "learner.db")
    # 학습자가 c에 한 번 실패함 — 낮은 mastery
    store.recordOutcomeAttempt("c", success=False)

    plan = composeMasterPlan(
        PlanGoal(outcomes=["c"]),
        _smallGraph(),
        _smallTaxonomy(),
        learnerStateStore=store,
    )

    dynamicOutcomes = {gap.outcomeId for gap in plan.dynamicGaps}
    assert "c" in dynamicOutcomes
    # 정적 gap은 없어야 한다 (c에 대한 레슨이 존재)
    staticOutcomes = {gap.outcomeId for gap in plan.gaps}
    assert "c" not in staticOutcomes


def testNoDynamicGapWhenHighMastery(tmp_path: Path) -> None:
    store = LearnerStateStore(tmp_path / "learner.db")
    # 20번 성공 → high mastery + confidence
    for _ in range(20):
        store.recordOutcomeAttempt("c", success=True)

    plan = composeMasterPlan(
        PlanGoal(outcomes=["c"]),
        _smallGraph(),
        _smallTaxonomy(),
        learnerStateStore=store,
    )

    assert plan.dynamicGaps == []


def testStaticGapPrecedesDynamicGap(tmp_path: Path) -> None:
    """outcome에 lesson이 없으면 static gap, 학습자 mastery는 부차적."""
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
    store = LearnerStateStore(tmp_path / "learner.db")
    store.recordOutcomeAttempt("missing", success=False)

    plan = composeMasterPlan(
        PlanGoal(domain="goal"),
        graph,
        taxonomy,
        learnerStateStore=store,
    )

    staticOutcomes = {gap.outcomeId for gap in plan.gaps}
    dynamicOutcomes = {gap.outcomeId for gap in plan.dynamicGaps}
    assert "missing" in staticOutcomes
    assert "missing" not in dynamicOutcomes


def testDeterministicWithLearnerState(tmp_path: Path) -> None:
    store = LearnerStateStore(tmp_path / "learner.db")
    store.recordOutcomeAttempt("a", success=True)
    store.recordOutcomeAttempt("b", success=False)

    plan1 = composeMasterPlan(
        PlanGoal(domain="goalC"),
        _smallGraph(),
        _smallTaxonomy(),
        learnerStateStore=store,
    )
    plan2 = composeMasterPlan(
        PlanGoal(domain="goalC"),
        _smallGraph(),
        _smallTaxonomy(),
        learnerStateStore=store,
    )

    keys1 = [step.key for step in plan1.steps]
    keys2 = [step.key for step in plan2.steps]
    assert keys1 == keys2

    masteries1 = [step.learnerMastery for step in plan1.steps]
    masteries2 = [step.learnerMastery for step in plan2.steps]
    assert masteries1 == masteries2

    assert [gap.outcomeId for gap in plan1.dynamicGaps] == [
        gap.outcomeId for gap in plan2.dynamicGaps
    ]


def testGapSortingIsDeterministic(tmp_path: Path) -> None:
    """unresolved outcome이 여러 개일 때 알파벳 순으로 정렬되어야 한다 (결정성)."""
    taxonomy = CurriculumTaxonomy(
        outcomes=[
            OutcomeDef(id="zeta", label="Zeta"),
            OutcomeDef(id="alpha", label="Alpha"),
            OutcomeDef(id="middle", label="Middle"),
        ],
        domains=[DomainDef(
            id="d",
            label="D",
            targetOutcomes=["zeta", "alpha", "middle"],
        )],
    )
    plan = composeMasterPlan(
        PlanGoal(domain="d"),
        LessonGraph(),
        taxonomy,
    )
    gapOrder = [gap.outcomeId for gap in plan.gaps]
    assert gapOrder == sorted(gapOrder)


def testThresholdConstantIsExposed() -> None:
    assert 0 < DYNAMIC_GAP_MASTERY_THRESHOLD < 1
