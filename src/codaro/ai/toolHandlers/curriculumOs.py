"""Curriculum OS — AI 도구 핸들러.

학습 경로 조립, 갭 식별, 드래프트 제안. 실제 강의 작성은 사람이 한다.
"""
from __future__ import annotations

from pathlib import Path
from threading import Lock
from typing import Any

from ...curriculum.authoringProposalFlow import (
    CurriculumAuthoringProposalError,
    buildPredictPromptProposalPayload,
    buildVariationProposalPayload,
)
from ...curriculum.catalogFlow import buildCurriculumTaxonomyPayload
from ...curriculum.analyticsFlow import CurriculumAnalyticsError, buildOutcomeMasteryPayload
from ...curriculum.goalDiscoveryFlow import (
    CurriculumGoalDiscoveryError,
    buildCurriculumDraftProposalPayload,
    inspectCurriculumPayload,
    resolveLearningGoalPayload,
    searchCurriculaPayload,
)
from ...curriculum.learnerProgressFlow import LearnerProgressError, updateOutcomeValidationToolPayload
from ...curriculum.osCache import CurriculumOsCache
from ...curriculum.planningFlow import (
    CurriculumMasterPlanInput,
    CurriculumPlanningError,
    buildCurriculumGapsPayload,
    composeCurriculumMasterPlan,
)
from ...curriculum.progress import ProgressTracker
from ...curriculum.qualityFlow import (
    CurriculumQualityError,
    buildCurriculumCheckProposalsPayload,
    buildCurriculumLessonStatsPayload,
    buildCurriculumQualityAnalysisPayload,
)
from ...curriculum.studyLoader import StudyLoader


_PROJECT_ROOT = Path(__file__).resolve().parents[4]
_DEFAULT_STUDY_ROOT = _PROJECT_ROOT / "curricula" / "python"

_cacheLock = Lock()
_curriculumOsCache: CurriculumOsCache | None = None
_studyLoaderCache: StudyLoader | None = None
_progressTrackerCache: ProgressTracker | None = None


def _progressTracker() -> ProgressTracker:
    global _progressTrackerCache
    if _progressTrackerCache is None:
        with _cacheLock:
            if _progressTrackerCache is None:
                _progressTrackerCache = ProgressTracker()
    return _progressTrackerCache


def _curriculumOs() -> CurriculumOsCache:
    global _curriculumOsCache
    if _curriculumOsCache is None:
        loader = _studyLoader()
        with _cacheLock:
            if _curriculumOsCache is None:
                _curriculumOsCache = CurriculumOsCache(loader)
    return _curriculumOsCache


def _studyLoader() -> StudyLoader | None:
    global _studyLoaderCache
    if _studyLoaderCache is None:
        with _cacheLock:
            if _studyLoaderCache is None and _DEFAULT_STUDY_ROOT.exists():
                _studyLoaderCache = StudyLoader(str(_DEFAULT_STUDY_ROOT))
    return _studyLoaderCache


class CurriculumOsToolHandlers:
    async def _handle_listCurriculumDomains(self, args: dict[str, Any]) -> dict[str, Any]:
        return buildCurriculumTaxonomyPayload(_curriculumOs()).payload

    async def _handle_resolveLearningGoal(self, args: dict[str, Any]) -> dict[str, Any]:
        goalText = str(args.get("goalText") or "").strip()
        limit = args.get("limit") or 3
        if not isinstance(limit, int) or limit <= 0:
            limit = 3
        try:
            return resolveLearningGoalPayload(
                curriculumOs=_curriculumOs(),
                goalText=goalText,
                aiProvider=getattr(self, "innerAiProvider", None),
                limit=limit,
            )
        except CurriculumGoalDiscoveryError as error:
            return {"error": error.message, "code": error.code}

    async def _handle_searchCurricula(self, args: dict[str, Any]) -> dict[str, Any]:
        query = str(args.get("query") or "").strip().lower()
        category = args.get("category") or None
        outcomeId = args.get("outcomeId") or None
        limit = args.get("limit") or 12
        if not isinstance(limit, int) or limit <= 0:
            limit = 12
        return searchCurriculaPayload(
            curriculumOs=_curriculumOs(),
            query=query,
            category=category if isinstance(category, str) else None,
            outcomeId=outcomeId if isinstance(outcomeId, str) else None,
            limit=limit,
        )

    async def _handle_composeMasterPlan(self, args: dict[str, Any]) -> dict[str, Any]:
        domain = args.get("domain") or None
        outcomes = args.get("outcomes") or []
        excludeCompleted = args.get("excludeCompleted")
        if excludeCompleted is None:
            excludeCompleted = True
        maxMinutes = args.get("maxMinutes")
        if not isinstance(maxMinutes, int) or maxMinutes < 0:
            maxMinutes = 0
        adaptiveSkip = args.get("adaptiveSkip")
        if adaptiveSkip is None:
            adaptiveSkip = True
        try:
            plan = composeCurriculumMasterPlan(
                curriculumOs=_curriculumOs(),
                progressTracker=_progressTracker(),
                learnerStateStore=None,
                request=CurriculumMasterPlanInput(
                    domain=domain,
                    outcomes=[str(o) for o in outcomes if isinstance(o, str)],
                    excludeCompleted=bool(excludeCompleted),
                    skipMasteredOutcomes=bool(args.get("skipMasteredOutcomes") or False),
                    maxMinutes=int(maxMinutes),
                    projectIntent=str(args.get("projectIntent") or ""),
                    deliverableOnly=bool(args.get("deliverableOnly") or False),
                    adaptiveSkip=bool(adaptiveSkip),
                ),
            )
        except CurriculumPlanningError as error:
            return {"error": error.message, "code": error.code}
        return plan.model_dump()

    async def _handle_inspectCurriculum(self, args: dict[str, Any]) -> dict[str, Any]:
        category = str(args.get("category") or "")
        contentId = str(args.get("contentId") or "")
        try:
            return inspectCurriculumPayload(
                curriculumOs=_curriculumOs(),
                studyLoader=_studyLoader(),
                category=category,
                contentId=contentId,
            )
        except CurriculumGoalDiscoveryError as error:
            return {"error": error.message, "code": error.code}

    async def _handle_listCurriculumGaps(self, args: dict[str, Any]) -> dict[str, Any]:
        domain = args.get("domain") or None
        try:
            return buildCurriculumGapsPayload(curriculumOs=_curriculumOs(), domain=domain)
        except CurriculumPlanningError as error:
            return {"error": error.message, "code": error.code}

    async def _handle_getOutcomeMastery(self, args: dict[str, Any]) -> dict[str, Any]:
        domain = args.get("domain") or None
        min_level = args.get("minLevel")
        if not isinstance(min_level, (int, float)):
            min_level = 0.0
        try:
            return buildOutcomeMasteryPayload(
                curriculumOs=_curriculumOs(),
                progressTracker=_progressTracker(),
                domain=domain if isinstance(domain, str) else None,
                minLevel=float(min_level),
            )
        except CurriculumAnalyticsError as error:
            return {"error": error.message, "code": error.code}

    async def _handle_markOutcomeValidated(self, args: dict[str, Any]) -> dict[str, Any]:
        outcomeId = str(args.get("outcomeId") or "")
        if not outcomeId:
            return {"error": "outcomeId is required"}
        validated = args.get("validated")
        if validated is None:
            validated = True
        try:
            return updateOutcomeValidationToolPayload(
                curriculumOs=_curriculumOs(),
                progressTracker=_progressTracker(),
                outcomeId=outcomeId,
                validated=bool(validated),
                reason=args.get("reason"),
            )
        except LearnerProgressError as error:
            return {"error": error.message, "code": error.code}

    async def _handle_getLessonStats(self, args: dict[str, Any]) -> dict[str, Any]:
        minSamples = args.get("minSamples")
        if not isinstance(minSamples, int) or minSamples < 1:
            minSamples = 1
        return buildCurriculumLessonStatsPayload(
            curriculumOs=_curriculumOs(),
            progressTracker=_progressTracker(),
            minSamples=minSamples,
        )

    async def _handle_analyzeCurriculumQuality(self, args: dict[str, Any]) -> dict[str, Any]:
        domainFilter = args.get("domain")
        limit = args.get("limit") or 10
        if not isinstance(limit, int) or limit <= 0:
            limit = 10
        try:
            return buildCurriculumQualityAnalysisPayload(
                curriculumOs=_curriculumOs(),
                progressTracker=_progressTracker(),
                learnerStateStore=None,
                domain=domainFilter if isinstance(domainFilter, str) and domainFilter else None,
                limit=limit,
            )
        except CurriculumQualityError as error:
            return {"error": error.message, "code": error.code}

    async def _handle_proposeKnowledgeChecks(self, args: dict[str, Any]) -> dict[str, Any]:
        loader = _studyLoader()
        outcomeFilter = args.get("outcomeId")
        maxProposals = args.get("maxProposals") or 5
        if not isinstance(maxProposals, int) or maxProposals <= 0:
            maxProposals = 5
        provider = getattr(self, "innerAiProvider", None)
        payload = buildCurriculumCheckProposalsPayload(
            curriculumOs=_curriculumOs(),
            studyLoader=loader,
            aiProvider=provider,
            outcomeId=outcomeFilter if isinstance(outcomeFilter, str) and outcomeFilter else None,
            maxProposals=maxProposals,
        )
        weak = payload.get("weak", [])
        return {
            **payload,
            "weak": weak[:50] if isinstance(weak, list) else weak,
            "next": (
                "각 제안은 작가가 수동으로 lesson YAML 의 해당 section.check 필드에 패치해야 합니다 — "
                "자동 패치 금지 (커리큘럼은 한 강의씩 직접 작성)."
            ),
        }

    async def _handle_proposeVariation(self, args: dict[str, Any]) -> dict[str, Any]:
        category = str(args.get("category") or "").strip()
        contentId = str(args.get("contentId") or "").strip()
        sectionId = str(args.get("sectionId") or "").strip()
        count = args.get("count") or 2
        if not isinstance(count, int) or count <= 0:
            count = 2
        count = min(count, 4)
        try:
            return buildVariationProposalPayload(
                studyLoader=_studyLoader(),
                category=category,
                contentId=contentId,
                sectionId=sectionId,
                count=count,
            )
        except CurriculumAuthoringProposalError as error:
            return {"error": error.message, "code": error.code}

    async def _handle_proposePredictPrompts(self, args: dict[str, Any]) -> dict[str, Any]:
        category = str(args.get("category") or "").strip()
        contentId = str(args.get("contentId") or "").strip()
        maxProposals = args.get("maxProposals") or 20
        if not isinstance(maxProposals, int) or maxProposals <= 0:
            maxProposals = 20
        try:
            return buildPredictPromptProposalPayload(
                studyLoader=_studyLoader(),
                category=category,
                contentId=contentId,
                maxProposals=maxProposals,
            )
        except CurriculumAuthoringProposalError as error:
            return {"error": error.message, "code": error.code}

    async def _handle_proposeCurriculumDraft(self, args: dict[str, Any]) -> dict[str, Any]:
        outcomeId = str(args.get("outcomeId") or "")
        title = str(args.get("title") or "")
        summary = str(args.get("summary") or "")
        sectionOutline = args.get("sectionOutline") or []
        if not outcomeId or not title or not summary or not sectionOutline:
            return {"error": "outcomeId, title, summary, and sectionOutline are required"}
        try:
            return buildCurriculumDraftProposalPayload(
                curriculumOs=_curriculumOs(),
                outcomeId=outcomeId,
                title=title,
                summary=summary,
                sectionOutline=sectionOutline,
                suggestedCategory=args.get("suggestedCategory"),
                suggestedContentId=args.get("suggestedContentId"),
                prerequisites=args.get("prerequisites"),
                estimatedMinutes=args.get("estimatedMinutes") or 0,
            )
        except CurriculumGoalDiscoveryError as error:
            return {"error": error.message, "code": error.code}


def resetCurriculumOsCache() -> None:
    """테스트에서 taxonomy/graph 재로딩이 필요할 때 사용."""
    global _curriculumOsCache, _studyLoaderCache, _progressTrackerCache
    with _cacheLock:
        _curriculumOsCache = None
        _studyLoaderCache = None
        _progressTrackerCache = None
