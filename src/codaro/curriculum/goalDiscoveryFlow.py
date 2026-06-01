from __future__ import annotations

from typing import Any

from .goalResolver import resolveGoal
from .osCache import CurriculumOsCache
from .studyLoader import StudyLoader


class CurriculumGoalDiscoveryError(Exception):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


def resolveLearningGoalPayload(
    *,
    curriculumOs: CurriculumOsCache,
    goalText: str,
    aiProvider: Any,
    limit: int = 3,
) -> dict[str, object]:
    goal = goalText.strip()
    if not goal:
        raise CurriculumGoalDiscoveryError("goal_text_required", "goalText is required")
    taxonomy = curriculumOs.taxonomy()
    resolution = resolveGoal(goal, taxonomy, aiProvider=aiProvider)
    candidates: list[dict[str, object]] = []
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
        tokens = _tokenize(goal)
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
                break
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
        "goalText": goal,
        "source": resolution.source,
        "reasoning": resolution.reasoning,
        "matchedKeywords": resolution.matchedKeywords,
        "candidates": candidates,
        "aiSuggestedOutcomes": [
            suggestion.model_dump()
            for suggestion in resolution.aiSuggestedOutcomes[:limit]
        ],
        "next": (
            "최상위 후보가 만족스러우면 그 domainId로 compose-master-plan을 호출하세요. "
            "두 후보 점수가 비슷하면 사용자에게 확인을 요청하세요."
        ),
    }


def searchCurriculaPayload(
    *,
    curriculumOs: CurriculumOsCache,
    query: str = "",
    category: str | None = None,
    outcomeId: str | None = None,
    limit: int = 12,
) -> dict[str, object]:
    normalizedQuery = query.strip().lower()
    matches: list[dict[str, object]] = []
    for lesson in curriculumOs.graph().lessons:
        if category and lesson.category != category:
            continue
        if outcomeId and outcomeId not in lesson.outcomes:
            continue
        if normalizedQuery:
            haystack = f"{lesson.title} {lesson.category}".lower()
            if normalizedQuery not in haystack:
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


def inspectCurriculumPayload(
    *,
    curriculumOs: CurriculumOsCache,
    studyLoader: StudyLoader | None,
    category: str,
    contentId: str,
) -> dict[str, object]:
    if not category or not contentId:
        raise CurriculumGoalDiscoveryError(
            "curriculum_lesson_required",
            "category and contentId are required",
        )
    lesson = curriculumOs.graph().byKey(f"{category}/{contentId}")
    if lesson is None:
        raise CurriculumGoalDiscoveryError(
            "curriculum_lesson_not_found",
            f"Lesson not found: {category}/{contentId}",
        )
    intro: dict[str, object] = {}
    if studyLoader is not None:
        try:
            payload = studyLoader.loadStudy(category, contentId)
        except FileNotFoundError:
            payload = {}
        metaIntro = payload.get("intro") if isinstance(payload, dict) else None
        if isinstance(metaIntro, dict):
            intro = {
                "direction": metaIntro.get("direction", ""),
                "benefits": metaIntro.get("benefits", []),
            }
    return {
        "category": lesson.category,
        "contentId": lesson.contentId,
        "title": lesson.title,
        "outcomes": lesson.outcomes,
        "prerequisites": lesson.prerequisites,
        "estimatedMinutes": lesson.estimatedMinutes,
        "intro": intro,
    }


def buildCurriculumDraftProposalPayload(
    *,
    curriculumOs: CurriculumOsCache,
    outcomeId: str,
    title: str,
    summary: str,
    sectionOutline: list[object],
    suggestedCategory: object = None,
    suggestedContentId: object = None,
    prerequisites: object = None,
    estimatedMinutes: object = 0,
) -> dict[str, object]:
    if not outcomeId or not title or not summary or not sectionOutline:
        raise CurriculumGoalDiscoveryError(
            "curriculum_draft_input_required",
            "outcomeId, title, summary, and sectionOutline are required",
        )
    taxonomy = curriculumOs.taxonomy()
    outcome = taxonomy.outcomeById(outcomeId)
    return {
        "draft": {
            "outcomeId": outcomeId,
            "outcomeLabel": outcome.label if outcome else outcomeId,
            "suggestedCategory": suggestedCategory,
            "suggestedContentId": suggestedContentId,
            "title": title,
            "summary": summary,
            "prerequisites": prerequisites or [],
            "sectionOutline": [
                str(section)
                for section in sectionOutline
                if isinstance(section, str)
            ],
            "estimatedMinutes": estimatedMinutes or 0,
        },
        "next": (
            "초안만 반환했습니다. 실제 강의는 사용자가 검토 후 직접 작성해야 합니다 — "
            "'커리큘럼 YAML은 한 강의씩 직접 작성' 원칙을 지키세요."
        ),
    }


def _scoreGoalForDomain(goalTokens: set[str], domain, taxonomy) -> float:
    haystack: list[str] = [
        domain.label.lower(),
        domain.description.lower(),
    ]
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
    return score


def _tokenize(text: str) -> set[str]:
    cleaned = text.lower()
    for ch in ",.!?():;\"'":
        cleaned = cleaned.replace(ch, " ")
    return {token for token in cleaned.split() if len(token) >= 2}
