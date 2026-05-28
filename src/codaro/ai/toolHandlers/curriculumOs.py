"""Curriculum OS — AI 도구 핸들러.

학습 경로 조립, 갭 식별, 드래프트 제안. 실제 강의 작성은 사람이 한다.
"""
from __future__ import annotations

from pathlib import Path
from threading import Lock
from typing import Any

from ...curriculum.goalResolver import resolveGoal
from ...curriculum.lessonGraph import LessonGraph, buildLessonGraph
from ...curriculum.outcomeMastery import computeMastery, masteredOutcomeIds
from ...curriculum.planComposer import PlanGoal, composeMasterPlan
from ...curriculum.progress import ProgressTracker
from ...curriculum.studyLoader import StudyLoader
from ...curriculum.taxonomy import CurriculumTaxonomy, loadTaxonomy


_PROJECT_ROOT = Path(__file__).resolve().parents[4]
_DEFAULT_STUDY_ROOT = _PROJECT_ROOT / "curricula" / "python"

_cacheLock = Lock()
_taxonomyCache: CurriculumTaxonomy | None = None
_graphCache: LessonGraph | None = None
_studyLoaderCache: StudyLoader | None = None
_progressTrackerCache: ProgressTracker | None = None


def _progressTracker() -> ProgressTracker:
    global _progressTrackerCache
    if _progressTrackerCache is None:
        with _cacheLock:
            if _progressTrackerCache is None:
                _progressTrackerCache = ProgressTracker()
    return _progressTrackerCache


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


def _scoreGoalForDomain(goalTokens: set[str], domain, taxonomy) -> float:
    """도메인/outcome 라벨/설명에 대한 토큰 일치 점수.

    완전 결정적 — 같은 입력이면 같은 순위가 나온다. 한국어/영어 라벨 모두 기여.
    """
    haystack: list[str] = []
    haystack.append(domain.label.lower())
    haystack.append(domain.description.lower())
    for outcomeId in domain.targetOutcomes:
        outcome = taxonomy.outcomeById(outcomeId)
        if outcome:
            haystack.append(outcome.label.lower())
            haystack.append(outcome.description.lower())
    blob = " ".join(haystack)
    score = 0.0
    for token in goalTokens:
        if token and token in blob:
            score += 1.0
    # 짧은 토큰(< 2자)은 노이즈가 되기 쉬워 가중 낮춤
    return score


def _tokenize(text: str) -> set[str]:
    cleaned = text.lower()
    for ch in ",.!?():;\"'":
        cleaned = cleaned.replace(ch, " ")
    return {token for token in cleaned.split() if len(token) >= 2}


class CurriculumOsToolHandlers:
    async def _handle_listCurriculumDomains(self, args: dict[str, Any]) -> dict[str, Any]:
        taxonomy = _taxonomy()
        return {
            "outcomes": [outcome.model_dump() for outcome in taxonomy.outcomes],
            "domains": [domain.model_dump() for domain in taxonomy.domains],
        }

    async def _handle_resolveLearningGoal(self, args: dict[str, Any]) -> dict[str, Any]:
        goalText = str(args.get("goalText") or "").strip()
        if not goalText:
            return {"error": "goalText is required"}
        limit = args.get("limit") or 3
        if not isinstance(limit, int) or limit <= 0:
            limit = 3
        taxonomy = _taxonomy()
        # Phase 4 — goalResolver 가 키워드 매칭 + (있으면) AI ranking 합성.
        # 핸들러 자신은 결정적: AI provider 는 self 가 노출하면 사용, 없으면 None.
        innerProvider = getattr(self, "innerAiProvider", None)
        resolution = resolveGoal(goalText, taxonomy, aiProvider=innerProvider)
        # 도메인 후보는 boostedCategories + AI ranking 결과를 합성. 부족하면 기존
        # token scoring 으로 보강해 결과가 비지 않게 한다 (회귀 방지).
        candidates: list[dict[str, Any]] = []
        seenDomains: set[str] = set()
        for suggestion in resolution.aiSuggestedDomains[:limit]:
            domain = taxonomy.domainById(suggestion.domainId)
            if domain is None or domain.id in seenDomains:
                continue
            seenDomains.add(domain.id)
            candidates.append({
                "domainId": domain.id,
                "domainLabel": domain.label,
                "description": domain.description,
                "score": suggestion.score,
                "reason": suggestion.reason,
                "matchedOutcomes": [
                    taxonomy.outcomeLabel(outcomeId)
                    for outcomeId in domain.targetOutcomes[:5]
                ],
            })
        if len(candidates) < limit:
            tokens = _tokenize(goalText)
            scored = []
            for domain in taxonomy.domains:
                if domain.id in seenDomains:
                    continue
                score = _scoreGoalForDomain(tokens, domain, taxonomy)
                scored.append((score, domain))
            scored.sort(key=lambda pair: (-pair[0], pair[1].id))
            for score, domain in scored:
                if len(candidates) >= limit:
                    break
                if score <= 0 and resolution.aiSuggestedDomains:
                    break  # AI 결과가 이미 있으면 score 0 후보로 채우지 않음
                candidates.append({
                    "domainId": domain.id,
                    "domainLabel": domain.label,
                    "description": domain.description,
                    "score": score,
                    "matchedOutcomes": [
                        taxonomy.outcomeLabel(outcomeId)
                        for outcomeId in domain.targetOutcomes[:5]
                    ],
                })
        return {
            "goalText": goalText,
            "source": resolution.source,
            "reasoning": resolution.reasoning,
            "matchedKeywords": resolution.matchedKeywords,
            "candidates": candidates,
            "aiSuggestedOutcomes": [s.model_dump() for s in resolution.aiSuggestedOutcomes[:limit]],
            "next": (
                "최상위 후보가 만족스러우면 그 domainId로 compose-master-plan을 호출하세요. "
                "두 후보 점수가 비슷하면 사용자에게 확인을 요청하세요."
            ),
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

    async def _handle_getOutcomeMastery(self, args: dict[str, Any]) -> dict[str, Any]:
        domain = args.get("domain") or None
        min_level = args.get("minLevel")
        if not isinstance(min_level, (int, float)):
            min_level = 0.0
        taxonomy = _taxonomy()
        if domain and not taxonomy.domainById(domain):
            return {"error": f"Unknown domain: {domain}"}
        tracker = _progressTracker()
        report = computeMastery(_graph(), taxonomy, tracker, tracker.listValidatedOutcomes())
        outcomes = [
            entry.model_dump()
            for entry in report.outcomes
            if entry.level >= float(min_level)
        ]
        if domain:
            target = taxonomy.domainById(domain)
            if target:
                wanted = set(target.targetOutcomes)
                outcomes = [o for o in outcomes if o["outcomeId"] in wanted]
        domains = [d.model_dump() for d in report.domains]
        if domain:
            domains = [d for d in domains if d["domainId"] == domain]
        return {
            "outcomes": outcomes,
            "domains": domains,
            "masteredOutcomeCount": report.masteredOutcomeCount,
            "totalOutcomeCount": report.totalOutcomeCount,
            "masteredOutcomeIds": sorted(masteredOutcomeIds(report)),
        }

    async def _handle_markOutcomeValidated(self, args: dict[str, Any]) -> dict[str, Any]:
        outcomeId = str(args.get("outcomeId") or "")
        if not outcomeId:
            return {"error": "outcomeId is required"}
        taxonomy = _taxonomy()
        if not taxonomy.hasOutcome(outcomeId):
            return {"error": f"Unknown outcome: {outcomeId}"}
        validated = args.get("validated")
        if validated is None:
            validated = True
        tracker = _progressTracker()
        if bool(validated):
            tracker.markOutcomeValidated(outcomeId)
        else:
            tracker.clearOutcomeValidation(outcomeId)
        return {
            "outcomeId": outcomeId,
            "outcomeLabel": taxonomy.outcomeLabel(outcomeId),
            "validated": bool(validated),
            "reason": args.get("reason"),
        }

    async def _handle_analyzeCurriculumQuality(self, args: dict[str, Any]) -> dict[str, Any]:
        from ...curriculum.qualityAnalytics import computeQualityReport

        graph = _graph()
        tracker = _progressTracker()
        report = computeQualityReport(graph, tracker, None)
        domainFilter = args.get("domain")
        limit = args.get("limit") or 10
        if not isinstance(limit, int) or limit <= 0:
            limit = 10
        lessons = report.lessons
        if isinstance(domainFilter, str) and domainFilter:
            # 도메인의 targetOutcomes 를 가르치는 lesson 만 필터.
            taxonomy = _taxonomy()
            domain = taxonomy.domainById(domainFilter)
            if domain is None:
                return {"error": f"Unknown domain: {domainFilter}"}
            targetSet = set(domain.targetOutcomes)
            relevantKeys: set[str] = set()
            for outcomeId in targetSet:
                for lesson in graph.lessonsProvidingOutcome(outcomeId):
                    relevantKeys.add(lesson.key)
            lessons = [l for l in lessons if l.lessonKey in relevantKeys]
        topMetrics = lessons[:limit]
        recommendation = ""
        flagged = [m for m in topMetrics if m.qualitySignal == "needs-attention"]
        if flagged:
            top = flagged[0]
            recommendation = (
                f"'{top.title}' 강의는 hint 평균 {top.averageHintLevel:.1f}, "
                f"통과율 {top.passRate*100:.0f}% — 가장 먼저 보강을 검토하세요."
            )
        else:
            recommendation = "needs-attention 강의 없음 — 현재 데이터로는 보강 우선순위 신호 없음."
        return {
            "lessons": [m.model_dump() for m in topMetrics],
            "overallHintAverage": report.overallHintAverage,
            "overallPassRate": report.overallPassRate,
            "flaggedCount": report.flaggedCount,
            "recommendation": recommendation,
        }

    async def _handle_proposeKnowledgeChecks(self, args: dict[str, Any]) -> dict[str, Any]:
        from ...curriculum.checkProposer import (
            lessonContextForSection,
            proposeChecksForGap,
            weakCheckCoverage,
        )

        loader = _studyLoader()
        if loader is None:
            return {"available": False, "weak": [], "proposals": []}
        graph = _graph()
        taxonomy = _taxonomy()
        weak = weakCheckCoverage(graph, loader)
        outcomeFilter = args.get("outcomeId")
        if isinstance(outcomeFilter, str) and outcomeFilter:
            weak = [w for w in weak if w.outcomeId == outcomeFilter]
        maxProposals = args.get("maxProposals") or 5
        if not isinstance(maxProposals, int) or maxProposals <= 0:
            maxProposals = 5
        for entry in weak:
            entry.outcomeLabel = taxonomy.outcomeLabel(entry.outcomeId)
        provider = getattr(self, "innerAiProvider", None)
        proposals: list[dict[str, Any]] = []
        if provider is not None:
            for entry in weak[:maxProposals]:
                context = lessonContextForSection(
                    loader, entry.category, entry.contentId, entry.sectionId,
                )
                proposal = proposeChecksForGap(
                    entry, context, outcomeLabel=entry.outcomeLabel, aiProvider=provider,
                )
                if proposal is not None:
                    proposals.append(proposal.model_dump())
        return {
            "available": provider is not None,
            "weak": [w.model_dump() for w in weak[:50]],
            "proposals": proposals,
            "next": (
                "각 제안은 작가가 수동으로 lesson YAML 의 해당 section.check 필드에 패치해야 합니다 — "
                "자동 패치 금지 (커리큘럼은 한 강의씩 직접 작성)."
            ),
        }

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
    global _taxonomyCache, _graphCache, _studyLoaderCache, _progressTrackerCache
    with _cacheLock:
        _taxonomyCache = None
        _graphCache = None
        _studyLoaderCache = None
        _progressTrackerCache = None
