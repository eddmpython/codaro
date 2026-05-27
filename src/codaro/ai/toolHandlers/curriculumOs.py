"""Curriculum OS — AI 도구 핸들러.

학습 경로 조립, 갭 식별, 드래프트 제안. 실제 강의 작성은 사람이 한다.
"""
from __future__ import annotations

from pathlib import Path
from threading import Lock
from typing import Any

from ...curriculum.lessonGraph import LessonGraph, buildLessonGraph
from ...curriculum.planComposer import PlanGoal, composeMasterPlan
from ...curriculum.studyLoader import StudyLoader
from ...curriculum.taxonomy import CurriculumTaxonomy, loadTaxonomy


_PROJECT_ROOT = Path(__file__).resolve().parents[4]
_DEFAULT_STUDY_ROOT = _PROJECT_ROOT / "curricula" / "python"

_cacheLock = Lock()
_taxonomyCache: CurriculumTaxonomy | None = None
_graphCache: LessonGraph | None = None
_studyLoaderCache: StudyLoader | None = None


def _taxonomy() -> CurriculumTaxonomy:
    global _taxonomyCache
    if _taxonomyCache is None:
        with _cacheLock:
            if _taxonomyCache is None:
                _taxonomyCache = loadTaxonomy()
    return _taxonomyCache


def _studyLoader() -> StudyLoader | None:
    global _studyLoaderCache
    if _studyLoaderCache is None:
        with _cacheLock:
            if _studyLoaderCache is None and _DEFAULT_STUDY_ROOT.exists():
                _studyLoaderCache = StudyLoader(str(_DEFAULT_STUDY_ROOT))
    return _studyLoaderCache


def _graph() -> LessonGraph:
    global _graphCache
    if _graphCache is None:
        with _cacheLock:
            if _graphCache is None:
                loader = _studyLoader()
                _graphCache = (
                    buildLessonGraph(loader, _taxonomy())
                    if loader is not None
                    else LessonGraph()
                )
    return _graphCache


class CurriculumOsToolHandlers:
    async def _handle_listCurriculumDomains(self, args: dict[str, Any]) -> dict[str, Any]:
        taxonomy = _taxonomy()
        return {
            "outcomes": [outcome.model_dump() for outcome in taxonomy.outcomes],
            "domains": [domain.model_dump() for domain in taxonomy.domains],
        }

    async def _handle_searchCurricula(self, args: dict[str, Any]) -> dict[str, Any]:
        query = str(args.get("query") or "").strip().lower()
        category = args.get("category") or None
        outcomeId = args.get("outcomeId") or None
        limit = args.get("limit") or 12
        if not isinstance(limit, int) or limit <= 0:
            limit = 12
        graph = _graph()
        matches = []
        for lesson in graph.lessons:
            if category and lesson.category != category:
                continue
            if outcomeId and outcomeId not in lesson.outcomes:
                continue
            if query:
                haystack = f"{lesson.title} {lesson.category}".lower()
                if query not in haystack:
                    continue
            matches.append({
                "category": lesson.category,
                "contentId": lesson.contentId,
                "title": lesson.title,
                "outcomes": lesson.outcomes,
                "prerequisites": lesson.prerequisites,
                "estimatedMinutes": lesson.estimatedMinutes,
            })
            if len(matches) >= limit:
                break
        return {"matches": matches, "total": len(matches)}

    async def _handle_composeMasterPlan(self, args: dict[str, Any]) -> dict[str, Any]:
        domain = args.get("domain") or None
        outcomes = args.get("outcomes") or []
        excludeCompleted = args.get("excludeCompleted")
        if excludeCompleted is None:
            excludeCompleted = True
        taxonomy = _taxonomy()
        if domain and not taxonomy.domainById(domain):
            return {"error": f"Unknown domain: {domain}"}
        for outcomeId in outcomes:
            if not taxonomy.hasOutcome(str(outcomeId)):
                return {"error": f"Unknown outcome: {outcomeId}"}
        goal = PlanGoal(
            domain=domain,
            outcomes=[str(o) for o in outcomes if isinstance(o, str)],
            excludeCompleted=bool(excludeCompleted),
        )
        plan = composeMasterPlan(goal, _graph(), taxonomy, None)
        return plan.model_dump()

    async def _handle_inspectCurriculum(self, args: dict[str, Any]) -> dict[str, Any]:
        category = str(args.get("category") or "")
        contentId = str(args.get("contentId") or "")
        if not category or not contentId:
            return {"error": "category and contentId are required"}
        graph = _graph()
        lesson = graph.byKey(f"{category}/{contentId}")
        if lesson is None:
            return {"error": f"Lesson not found: {category}/{contentId}"}
        loader = _studyLoader()
        intro: dict[str, Any] = {}
        if loader is not None:
            try:
                payload = loader.loadStudy(category, contentId)
                metaIntro = payload.get("intro") if isinstance(payload, dict) else None
                if isinstance(metaIntro, dict):
                    intro = {
                        "direction": metaIntro.get("direction", ""),
                        "benefits": metaIntro.get("benefits", []),
                    }
            except FileNotFoundError:
                intro = {}
        return {
            "category": lesson.category,
            "contentId": lesson.contentId,
            "title": lesson.title,
            "outcomes": lesson.outcomes,
            "prerequisites": lesson.prerequisites,
            "estimatedMinutes": lesson.estimatedMinutes,
            "intro": intro,
        }

    async def _handle_listCurriculumGaps(self, args: dict[str, Any]) -> dict[str, Any]:
        domain = args.get("domain") or None
        taxonomy = _taxonomy()
        graph = _graph()
        covered = graph.coveredOutcomes()
        domainsOfInterest = taxonomy.domains
        if domain:
            single = taxonomy.domainById(domain)
            if single is None:
                return {"error": f"Unknown domain: {domain}"}
            domainsOfInterest = [single]
        gaps = []
        for dom in domainsOfInterest:
            missing = [outcomeId for outcomeId in dom.targetOutcomes if outcomeId not in covered]
            if missing:
                gaps.append({
                    "domainId": dom.id,
                    "domainLabel": dom.label,
                    "missing": [
                        {
                            "outcomeId": outcomeId,
                            "outcomeLabel": taxonomy.outcomeLabel(outcomeId),
                        }
                        for outcomeId in missing
                    ],
                })
        return {"gaps": gaps}

    async def _handle_proposeCurriculumDraft(self, args: dict[str, Any]) -> dict[str, Any]:
        outcomeId = str(args.get("outcomeId") or "")
        title = str(args.get("title") or "")
        summary = str(args.get("summary") or "")
        sectionOutline = args.get("sectionOutline") or []
        if not outcomeId or not title or not summary or not sectionOutline:
            return {"error": "outcomeId, title, summary, and sectionOutline are required"}
        taxonomy = _taxonomy()
        outcome = taxonomy.outcomeById(outcomeId)
        return {
            "draft": {
                "outcomeId": outcomeId,
                "outcomeLabel": outcome.label if outcome else outcomeId,
                "suggestedCategory": args.get("suggestedCategory"),
                "suggestedContentId": args.get("suggestedContentId"),
                "title": title,
                "summary": summary,
                "prerequisites": args.get("prerequisites") or [],
                "sectionOutline": [
                    str(section)
                    for section in sectionOutline
                    if isinstance(section, str)
                ],
                "estimatedMinutes": args.get("estimatedMinutes") or 0,
            },
            "next": (
                "초안만 반환했습니다. 실제 강의는 사용자가 검토 후 직접 작성해야 합니다 — "
                "'커리큘럼 YAML은 한 강의씩 직접 작성' 원칙을 지키세요."
            ),
        }


def resetCurriculumOsCache() -> None:
    """테스트에서 taxonomy/graph 재로딩이 필요할 때 사용."""
    global _taxonomyCache, _graphCache, _studyLoaderCache
    with _cacheLock:
        _taxonomyCache = None
        _graphCache = None
        _studyLoaderCache = None
