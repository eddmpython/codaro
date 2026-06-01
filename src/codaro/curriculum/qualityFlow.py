from __future__ import annotations

from typing import Any

from .checkProposer import lessonContextForSection, proposeChecksForGap, weakCheckCoverage
from .learnerState import LearnerStateStore
from .osCache import CurriculumOsCache
from .progress import ProgressTracker
from .qualityAnalytics import CurriculumQualityReport, computeQualityReport
from .studyLoader import StudyLoader


class CurriculumQualityError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def buildCurriculumQualityReport(
    *,
    curriculumOs: CurriculumOsCache,
    progressTracker: ProgressTracker,
    learnerStateStore: LearnerStateStore | None,
) -> CurriculumQualityReport:
    graph = curriculumOs.graph()
    misconceptionMap: dict[str, int] = {}
    if learnerStateStore is not None:
        outcomeHits: dict[str, int] = {}
        for hit in learnerStateStore.listMisconceptionHits():
            outcomeHits[hit.outcomeId] = outcomeHits.get(hit.outcomeId, 0) + hit.hitCount
        for outcomeId, count in outcomeHits.items():
            for lesson in graph.lessonsProvidingOutcome(outcomeId):
                misconceptionMap[lesson.key] = misconceptionMap.get(lesson.key, 0) + count
    return computeQualityReport(graph, progressTracker, misconceptionMap)


def buildCurriculumQualityAnalysisPayload(
    *,
    curriculumOs: CurriculumOsCache,
    progressTracker: ProgressTracker,
    learnerStateStore: LearnerStateStore | None,
    domain: str | None = None,
    limit: int = 10,
) -> dict[str, object]:
    graph = curriculumOs.graph()
    report = buildCurriculumQualityReport(
        curriculumOs=curriculumOs,
        progressTracker=progressTracker,
        learnerStateStore=learnerStateStore,
    )
    lessons = report.lessons
    if domain:
        taxonomy = curriculumOs.taxonomy()
        targetDomain = taxonomy.domainById(domain)
        if targetDomain is None:
            raise CurriculumQualityError(
                "curriculum_unknown_domain",
                f"Unknown domain: {domain}",
            )
        targetSet = set(targetDomain.targetOutcomes)
        relevantKeys: set[str] = set()
        for outcomeId in targetSet:
            for lesson in graph.lessonsProvidingOutcome(outcomeId):
                relevantKeys.add(lesson.key)
        lessons = [lesson for lesson in lessons if lesson.lessonKey in relevantKeys]

    topMetrics = lessons[:limit]
    flagged = [metric for metric in topMetrics if metric.qualitySignal == "needs-attention"]
    if flagged:
        top = flagged[0]
        recommendation = (
            f"'{top.title}' 강의는 hint 평균 {top.averageHintLevel:.1f}, "
            f"통과율 {top.passRate*100:.0f}% — 가장 먼저 보강을 검토하세요."
        )
    else:
        recommendation = "needs-attention 강의 없음 — 현재 데이터로는 보강 우선순위 신호 없음."

    return {
        "lessons": [metric.model_dump() for metric in topMetrics],
        "overallHintAverage": report.overallHintAverage,
        "overallPassRate": report.overallPassRate,
        "flaggedCount": report.flaggedCount,
        "recommendation": recommendation,
    }


def buildCurriculumCheckProposalsPayload(
    *,
    curriculumOs: CurriculumOsCache,
    studyLoader: StudyLoader | None,
    aiProvider: Any,
    outcomeId: str | None = None,
    maxProposals: int = 5,
) -> dict[str, object]:
    if studyLoader is None:
        return {"available": False, "weak": [], "proposals": []}
    graph = curriculumOs.graph()
    weak = weakCheckCoverage(graph, studyLoader)
    if outcomeId:
        weak = [entry for entry in weak if entry.outcomeId == outcomeId]
    taxonomy = curriculumOs.taxonomy()
    for entry in weak:
        entry.outcomeLabel = taxonomy.outcomeLabel(entry.outcomeId)

    proposals: list[dict[str, object]] = []
    if aiProvider is not None:
        proposalLimit = max(0, maxProposals)
        for entry in weak[:proposalLimit]:
            context = lessonContextForSection(
                studyLoader,
                entry.category,
                entry.contentId,
                entry.sectionId,
            )
            proposal = proposeChecksForGap(
                entry,
                context,
                outcomeLabel=entry.outcomeLabel,
                aiProvider=aiProvider,
            )
            if proposal is not None:
                proposals.append(proposal.model_dump())
    return {
        "available": aiProvider is not None,
        "weak": [entry.model_dump() for entry in weak],
        "proposals": proposals,
    }


def buildCurriculumLessonStatsPayload(
    *,
    curriculumOs: CurriculumOsCache,
    progressTracker: ProgressTracker,
    minSamples: int = 1,
) -> dict[str, object]:
    graph = curriculumOs.graph()
    progress = progressTracker.load()
    rows: list[dict[str, object]] = []
    for key, lesson in progress.lessons.items():
        if lesson.observedSampleCount < minSamples:
            continue
        node = graph.byKey(key)
        if node is None:
            continue
        static = node.estimatedMinutes
        observed = lesson.observedMinutesEwma
        deviation = ""
        if static > 0 and observed > 0:
            pct = (observed - static) / static * 100
            deviation = f"{pct:+.1f}%"
        rows.append({
            "key": key,
            "title": node.title,
            "static": static,
            "observedEwma": round(observed, 2),
            "sampleCount": lesson.observedSampleCount,
            "deviation": deviation,
        })
    rows.sort(key=lambda row: (-int(row["sampleCount"]), str(row["key"])))
    return {"lessons": rows}
