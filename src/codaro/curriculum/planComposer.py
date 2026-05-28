"""Curriculum OS — master plan composer.

사용자의 학습 목적(domain 혹은 outcome 집합)을 입력받아 레슨 순서를 짜고,
부족한 outcome은 gap으로 리포트한다. 알고리즘은 결정적(deterministic)이라
같은 입력이면 같은 plan을 낸다.

흐름:
1. 목표 outcome 집합 해석 (domain.targetOutcomes ∪ explicit outcomes)
2. backward expansion — 각 target outcome에 도달하기 위한 prerequisite outcomes를 모두 모음
3. outcome -> 대표 레슨 선택 (학습 경로 기준으로 가장 가까운 한 개)
4. 선택된 레슨 집합을 prerequisite 그래프 위에서 topological sort
5. 완료한 레슨 제외, gap 식별
"""
from __future__ import annotations

from typing import Iterable

from pydantic import BaseModel, Field

from .learnerState import LearnerStateStore
from .lessonGraph import LessonGraph, LessonNode
from .outcomeMastery import computeMastery, masteredOutcomeIds
from .progress import ProgressTracker
from .taxonomy import CurriculumTaxonomy


# 학습자 mastery가 이 임계 이하면 dynamic gap으로 표시한다.
# learnerState EMA 기본 0.3 (한 번 성공 시 0.3 도달) — 그 아래면 신뢰할 수 없는 상태로 본다.
DYNAMIC_GAP_MASTERY_THRESHOLD = 0.3
DYNAMIC_GAP_CONFIDENCE_THRESHOLD = 0.2


PRIMARY_CATEGORY_ORDER = (
    "30days",
    "advancedPython",
    "builtins",
    "pandas",
    "numpy",
    "polars",
    "duckdb",
    "pydantic",
    "matplotlib",
    "seaborn",
    "plotly",
    "altair",
    "folium",
    "sympy",
    "scipy",
    "statsmodels",
    "sklearn",
    "networkx",
    "regex",
    "excel",
    "playwright",
    "fileOps",
    "procCtl",
    "watchSched",
    "inputCtl",
    "pillow",
    "opencv",
    "practical",
)


class PlanGoal(BaseModel):
    domain: str | None = None
    outcomes: list[str] = Field(default_factory=list)
    excludeCompleted: bool = True
    excludeKeys: list[str] = Field(default_factory=list)
    skipMasteredOutcomes: bool = False


class PlanStep(BaseModel):
    order: int
    category: str
    contentId: str
    key: str
    title: str
    outcomes: list[str]
    prerequisites: list[str]
    rationale: str
    estimatedMinutes: int
    completed: bool = False
    learnerMastery: float | None = None
    learnerConfidence: float | None = None


class PlanGap(BaseModel):
    outcomeId: str
    outcomeLabel: str
    reason: str
    suggestedCategory: str | None = None


class MasterPlan(BaseModel):
    goal: PlanGoal
    targetOutcomes: list[str]
    steps: list[PlanStep]
    gaps: list[PlanGap]
    dynamicGaps: list[PlanGap] = Field(default_factory=list)
    totalMinutes: int
    summary: str
    nextStepKey: str | None = None
    completedCount: int = 0


def _categoryRank(category: str) -> int:
    if category in PRIMARY_CATEGORY_ORDER:
        return PRIMARY_CATEGORY_ORDER.index(category)
    return len(PRIMARY_CATEGORY_ORDER) + 1


def _selectLessonForOutcome(
    outcomeId: str,
    graph: LessonGraph,
    excludeKeys: set[str],
) -> LessonNode | None:
    """outcome을 제공하는 레슨 중 학습 경로에 가장 적합한 한 개를 고른다.

    휴리스틱:
    1. prerequisite이 적은 레슨 우선 (더 입문에 가까움)
    2. 같으면 카테고리 우선순위(기초가 앞)
    3. 같으면 sortKey 순
    """
    candidates = [
        lesson
        for lesson in graph.lessonsProvidingOutcome(outcomeId)
        if lesson.key not in excludeKeys
    ]
    if not candidates:
        return None
    candidates.sort(key=lambda lesson: (
        len(lesson.prerequisites),
        _categoryRank(lesson.category),
        lesson.sortKey,
    ))
    return candidates[0]


def _resolveTargetOutcomes(goal: PlanGoal, taxonomy: CurriculumTaxonomy) -> list[str]:
    targets: list[str] = []
    seen: set[str] = set()
    if goal.domain:
        domain = taxonomy.domainById(goal.domain)
        if domain:
            for outcomeId in domain.targetOutcomes:
                if outcomeId not in seen:
                    targets.append(outcomeId)
                    seen.add(outcomeId)
    for outcomeId in goal.outcomes:
        if outcomeId not in seen:
            targets.append(outcomeId)
            seen.add(outcomeId)
    return targets


def _expandWithPrerequisites(
    targetOutcomes: Iterable[str],
    graph: LessonGraph,
    excludeKeys: set[str],
    masteredOutcomes: set[str] | None = None,
) -> tuple[dict[str, LessonNode], set[str]]:
    """target outcome 집합에서 출발해 prerequisite을 따라가며 필요한 레슨을 모은다.

    masteredOutcomes가 주어지면 — 이미 익힌 outcome은 lesson을 추가하지 않고
    "이미 만족됨"으로 처리한다 (prerequisite 사슬을 따라 들어와도 차단).

    반환: (선택된 레슨 매핑[key -> LessonNode], 미해결 outcome 집합).
    """
    mastered = masteredOutcomes or set()
    selected: dict[str, LessonNode] = {}
    unresolved: set[str] = set()
    open_: list[str] = list(targetOutcomes)
    visitedOutcomes: set[str] = set()
    while open_:
        outcomeId = open_.pop(0)
        if outcomeId in visitedOutcomes:
            continue
        visitedOutcomes.add(outcomeId)
        # 이미 익힌 outcome은 레슨 추가 없이 만족된 것으로 본다.
        if outcomeId in mastered:
            continue
        # 이미 선택된 레슨이 이 outcome을 제공하면 추가 작업 불필요
        alreadyCovered = any(
            outcomeId in lesson.outcomes for lesson in selected.values()
        )
        if alreadyCovered:
            continue
        lesson = _selectLessonForOutcome(outcomeId, graph, excludeKeys)
        if lesson is None:
            unresolved.add(outcomeId)
            continue
        selected[lesson.key] = lesson
        for prereq in lesson.prerequisites:
            if prereq not in visitedOutcomes:
                open_.append(prereq)
    return selected, unresolved


def _topologicalSort(
    selected: dict[str, LessonNode],
) -> list[LessonNode]:
    """선택된 레슨을 prerequisite outcome 순서로 정렬.

    Kahn's algorithm 변형 — outcome을 노드 사이의 의존 edge로 본다.
    의존 사이클이 있으면 sortKey 순으로 fallback.
    """
    nodes = list(selected.values())
    # outcome -> 이 outcome을 제공하는 selected 레슨 키
    providers: dict[str, str] = {}
    for lesson in nodes:
        for outcomeId in lesson.outcomes:
            providers.setdefault(outcomeId, lesson.key)

    # 각 레슨이 prerequisite으로 요구하는, 같은 plan 내에 존재하는 의존 레슨 키
    dependsOn: dict[str, set[str]] = {lesson.key: set() for lesson in nodes}
    for lesson in nodes:
        for prereq in lesson.prerequisites:
            providerKey = providers.get(prereq)
            if providerKey and providerKey != lesson.key:
                dependsOn[lesson.key].add(providerKey)

    ordered: list[LessonNode] = []
    remaining = {lesson.key: lesson for lesson in nodes}
    while remaining:
        ready = [
            lesson
            for key, lesson in remaining.items()
            if not (dependsOn[key] & set(remaining.keys()))
        ]
        if not ready:
            # cycle 또는 의존 누락 — sortKey 순으로 잔여 처리
            ready = sorted(
                remaining.values(),
                key=lambda lesson: (_categoryRank(lesson.category), lesson.sortKey),
            )
        ready.sort(key=lambda lesson: (_categoryRank(lesson.category), lesson.sortKey))
        for lesson in ready:
            ordered.append(lesson)
            remaining.pop(lesson.key, None)
            if not remaining:
                break
    return ordered


def _completedKeys(progress: ProgressTracker) -> set[str]:
    state = progress.load()
    return {
        key
        for key, lesson in state.lessons.items()
        if lesson.completedAt
    }


def _buildRationale(
    lesson: LessonNode,
    targetOutcomes: set[str],
    taxonomy: CurriculumTaxonomy,
) -> str:
    directHits = [
        taxonomy.outcomeLabel(outcomeId)
        for outcomeId in lesson.outcomes
        if outcomeId in targetOutcomes
    ]
    if directHits:
        return f"목표 능력 ‘{', '.join(directHits)}’을(를) 얻는 단계"
    if lesson.outcomes:
        labels = [taxonomy.outcomeLabel(outcomeId) for outcomeId in lesson.outcomes]
        return f"선수 능력 ‘{', '.join(labels)}’ 준비"
    return "보강 학습 단계"


def composeMasterPlan(
    goal: PlanGoal,
    graph: LessonGraph,
    taxonomy: CurriculumTaxonomy,
    progressTracker: ProgressTracker | None = None,
    learnerStateStore: LearnerStateStore | None = None,
) -> MasterPlan:
    targetOutcomes = _resolveTargetOutcomes(goal, taxonomy)
    excludeKeys: set[str] = set(goal.excludeKeys or [])

    # skipMasteredOutcomes — mastery >= MASTERY_THRESHOLD인 outcome은 plan에서 제외.
    # target 단계뿐 아니라 prerequisite expansion에서도 차단되어야 한다.
    masteredOutcomes: set[str] = set()
    if goal.skipMasteredOutcomes and progressTracker is not None:
        validated = progressTracker.listValidatedOutcomes()
        report = computeMastery(graph, taxonomy, progressTracker, validated)
        masteredOutcomes = masteredOutcomeIds(report)
        targetOutcomes = [oid for oid in targetOutcomes if oid not in masteredOutcomes]

    selected, unresolved = _expandWithPrerequisites(
        targetOutcomes, graph, excludeKeys, masteredOutcomes,
    )

    # completed는 항상 조회한다 — excludeCompleted=False여도 진도/다음단계 표시에 필요.
    completed: set[str] = set()
    if progressTracker is not None:
        completed = _completedKeys(progressTracker)

    ordered = _topologicalSort(selected)

    # learnerState 입력 — 결정적: 동일 store 상태 → 동일 결과
    learnerMasteryByOutcome: dict[str, tuple[float, float]] = {}
    if learnerStateStore is not None:
        for mastery in learnerStateStore.listMastery():
            learnerMasteryByOutcome[mastery.outcomeId] = (
                mastery.score,
                mastery.confidence,
            )

    targetSet = set(targetOutcomes)
    steps: list[PlanStep] = []
    visibleOrder = 0
    totalMinutes = 0
    completedCount = 0
    nextStepKey: str | None = None
    for lesson in ordered:
        isCompleted = lesson.key in completed
        if isCompleted:
            completedCount += 1
            if goal.excludeCompleted:
                continue
        visibleOrder += 1
        totalMinutes += lesson.estimatedMinutes
        if nextStepKey is None and not isCompleted:
            nextStepKey = lesson.key

        # lesson의 첫 outcome에서 learner mastery 가져오기 — 가장 representative
        learnerMastery: float | None = None
        learnerConfidence: float | None = None
        if learnerMasteryByOutcome and lesson.outcomes:
            primary = lesson.outcomes[0]
            if primary in learnerMasteryByOutcome:
                learnerMastery, learnerConfidence = learnerMasteryByOutcome[primary]

        steps.append(PlanStep(
            order=visibleOrder,
            category=lesson.category,
            contentId=lesson.contentId,
            key=lesson.key,
            title=lesson.title,
            outcomes=lesson.outcomes,
            prerequisites=lesson.prerequisites,
            rationale=_buildRationale(lesson, targetSet, taxonomy),
            estimatedMinutes=lesson.estimatedMinutes,
            completed=isCompleted,
            learnerMastery=learnerMastery,
            learnerConfidence=learnerConfidence,
        ))

    # 정적 gap — 해당 outcome을 가르치는 레슨이 없음
    gaps: list[PlanGap] = [
        PlanGap(
            outcomeId=outcomeId,
            outcomeLabel=taxonomy.outcomeLabel(outcomeId),
            reason="해당 능력을 가르치는 레슨이 아직 커리큘럼에 없습니다.",
        )
        for outcomeId in sorted(unresolved)
    ]

    # 동적 gap — 레슨은 있지만 학습자 mastery가 낮은 outcome
    dynamicGaps = _computeDynamicGaps(
        targetOutcomes, learnerMasteryByOutcome, taxonomy, unresolved
    )

    summary = _formatSummary(goal, taxonomy, steps, gaps, dynamicGaps, totalMinutes)

    return MasterPlan(
        goal=goal,
        targetOutcomes=targetOutcomes,
        steps=steps,
        gaps=gaps,
        dynamicGaps=dynamicGaps,
        totalMinutes=totalMinutes,
        summary=summary,
        nextStepKey=nextStepKey,
        completedCount=completedCount,
    )


def _computeDynamicGaps(
    targetOutcomes: list[str],
    learnerMasteryByOutcome: dict[str, tuple[float, float]],
    taxonomy: CurriculumTaxonomy,
    unresolved: set[str],
) -> list[PlanGap]:
    """학습자 mastery 가 낮은 target outcome을 dynamic gap으로 보고.

    static gap(unresolved)과 중복되지 않게 분리. 학습자 정보가 없으면 빈 리스트.
    """
    if not learnerMasteryByOutcome:
        return []
    gaps: list[PlanGap] = []
    for outcomeId in targetOutcomes:
        if outcomeId in unresolved:
            continue  # static gap이 우선
        if outcomeId not in learnerMasteryByOutcome:
            continue  # 학습자가 시도 안 한 outcome은 dynamic gap 아님 (아직 모름)
        score, confidence = learnerMasteryByOutcome[outcomeId]
        if score < DYNAMIC_GAP_MASTERY_THRESHOLD or confidence < DYNAMIC_GAP_CONFIDENCE_THRESHOLD:
            gaps.append(PlanGap(
                outcomeId=outcomeId,
                outcomeLabel=taxonomy.outcomeLabel(outcomeId),
                reason=f"학습자 mastery {score:.2f} / confidence {confidence:.2f} — 보강 학습 필요",
            ))
    return gaps


def _formatSummary(
    goal: PlanGoal,
    taxonomy: CurriculumTaxonomy,
    steps: list[PlanStep],
    gaps: list[PlanGap],
    dynamicGaps: list[PlanGap],
    totalMinutes: int,
) -> str:
    parts: list[str] = []
    if goal.domain:
        domain = taxonomy.domainById(goal.domain)
        if domain:
            parts.append(f"목표: {domain.label}")
    if goal.outcomes:
        labels = [taxonomy.outcomeLabel(o) for o in goal.outcomes]
        parts.append(f"능력: {', '.join(labels)}")
    parts.append(f"{len(steps)}개 레슨")
    if totalMinutes:
        parts.append(f"약 {totalMinutes}분")
    if gaps:
        parts.append(f"미충족 능력 {len(gaps)}개")
    if dynamicGaps:
        parts.append(f"보강 필요 {len(dynamicGaps)}개")
    return " · ".join(parts) if parts else "마스터 플랜"
