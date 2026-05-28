"""학습 목표 해석 — 키워드 매칭 + (선택적) AI ranking.

학습자가 "고객 이탈 분석", "쇼핑몰 트래픽 보고서" 같은 자유 표현을 했을 때:
1. 결정적 키워드 매칭(`PROJECT_INTENT_KEYWORDS`)으로 카테고리 prioritization.
2. AI provider 가 있으면 outcome/domain 카탈로그 + intent → ranking.
3. 두 결과를 blend — AI ranking 이 있으면 우선, 키워드 매칭으로 보강.

AI 가 없거나 응답 파싱이 실패하면 키워드 결과만으로 동작 (회귀 안전).
"""
from __future__ import annotations

import json
import re
from threading import Lock
from typing import Any, Literal, Protocol

from pydantic import BaseModel, Field, ValidationError

from .planComposer import PROJECT_INTENT_KEYWORDS, _matchProjectIntent
from .taxonomy import CurriculumTaxonomy


class _AiCompleteResponse(Protocol):
    answer: str


class _AiProviderLike(Protocol):
    def complete(self, messages: list[dict[str, str]]) -> _AiCompleteResponse: ...


class OutcomeSuggestion(BaseModel):
    outcomeId: str
    label: str
    score: float = 0.0  # 0~1, 키워드 매칭은 0.5 고정, AI 는 자체 점수
    reason: str = ""


class DomainSuggestion(BaseModel):
    domainId: str
    label: str
    score: float = 0.0
    reason: str = ""


class GoalResolution(BaseModel):
    intentText: str
    matchedKeywords: list[str] = Field(default_factory=list)
    boostedCategories: list[str] = Field(default_factory=list)
    aiSuggestedOutcomes: list[OutcomeSuggestion] = Field(default_factory=list)
    aiSuggestedDomains: list[DomainSuggestion] = Field(default_factory=list)
    source: Literal["keyword", "ai", "blended", "none"] = "none"
    reasoning: str = ""


def _outcomeToCategoryIndex(taxonomy: CurriculumTaxonomy) -> dict[str, set[str]]:
    """outcome id → 그 outcome 을 가르치는 lesson 의 category 집합."""
    index: dict[str, set[str]] = {}
    for key, record in taxonomy.lessonOutcomes.items():
        category = key.split("/", 1)[0]
        for outcomeId in record.outcomes:
            index.setdefault(outcomeId, set()).add(category)
    return index


def _domainsForCategories(
    boostedCategories: set[str],
    taxonomy: CurriculumTaxonomy,
) -> list[DomainSuggestion]:
    """카테고리 boost → 도메인 ranking.

    도메인 targetOutcomes 중 boosted 카테고리에서 가르치는 outcome 비율로 score.
    예: domain.targetOutcomes 가 5개, 그 중 3개가 boosted 카테고리 lesson 에 등장하면 0.6.
    """
    if not boostedCategories:
        return []
    boostedLower = {c.lower() for c in boostedCategories}
    outcomeIndex = _outcomeToCategoryIndex(taxonomy)
    suggestions: list[DomainSuggestion] = []
    for domain in taxonomy.domains:
        if not domain.targetOutcomes:
            continue
        matched: list[str] = []
        hits = 0
        for outcomeId in domain.targetOutcomes:
            categories = {c.lower() for c in outcomeIndex.get(outcomeId, set())}
            overlap = categories & boostedLower
            if overlap:
                hits += 1
                matched.extend(sorted(overlap))
        if hits == 0:
            continue
        score = hits / len(domain.targetOutcomes)
        suggestions.append(DomainSuggestion(
            domainId=domain.id,
            label=domain.label,
            score=min(score, 1.0),
            reason=f"카테고리 '{', '.join(sorted(set(matched))[:3])}' 의 outcome {hits}개 매칭",
        ))
    suggestions.sort(key=lambda s: (-s.score, s.domainId))
    return suggestions


def _outcomesForCategories(
    boostedCategories: set[str],
    taxonomy: CurriculumTaxonomy,
    limit: int = 8,
) -> list[OutcomeSuggestion]:
    """boost 된 카테고리의 lesson 들이 가르치는 outcome 을 수집해서 ranking.

    예: boost={"sklearn"} → `lessonOutcomes["sklearn/*"]` 가 가르치는 outcome (ml.* 등) 우선.
    """
    if not boostedCategories:
        return []
    boostedLower = {c.lower() for c in boostedCategories}
    scores: dict[str, float] = {}
    for key, record in taxonomy.lessonOutcomes.items():
        category = key.split("/", 1)[0].lower()
        if category not in boostedLower:
            continue
        for outcomeId in record.outcomes:
            scores[outcomeId] = scores.get(outcomeId, 0.0) + 0.1
    # 카테고리/outcome id substring 매칭은 보조 신호로 합산.
    for outcome in taxonomy.outcomes:
        outcomeIdLower = outcome.id.lower()
        for category in boostedLower:
            if outcomeIdLower.startswith(category + ".") or outcomeIdLower == category:
                scores[outcome.id] = scores.get(outcome.id, 0.0) + 0.4
                break
    suggestions: list[OutcomeSuggestion] = []
    for outcomeId, raw in scores.items():
        outcome = taxonomy.outcomeById(outcomeId)
        if outcome is None:
            continue
        suggestions.append(OutcomeSuggestion(
            outcomeId=outcomeId,
            label=outcome.label,
            score=min(raw, 1.0),
            reason="키워드→레슨 매칭",
        ))
    suggestions.sort(key=lambda s: (-s.score, s.outcomeId))
    return suggestions[:limit]


_PROMPT_SYSTEM = (
    "당신은 학습 경로 큐레이터입니다. 학습자가 자유 표현한 목표를 outcome/domain 카탈로그 안에서 ranking 합니다. "
    "응답은 반드시 단일 JSON 객체로만 반환합니다 — 다른 설명 없이."
)

_PROMPT_TEMPLATE = """학습자 목표: "{intent}"

[outcomes]
{outcomeCatalog}

[domains]
{domainCatalog}

위 카탈로그에서 학습자 목표에 가장 적합한 outcome 최대 5개, domain 최대 3개를 ranking 하라.
JSON 만 반환:
{{
  "outcomes": [{{"id": "<outcomeId>", "score": <0-10>, "reason": "<한 줄>"}}, ...],
  "domains": [{{"id": "<domainId>", "score": <0-10>, "reason": "<한 줄>"}}, ...],
  "summary": "<해석 한 문장>"
}}
"""


def _buildPrompt(intentText: str, taxonomy: CurriculumTaxonomy) -> list[dict[str, str]]:
    outcomeLines = [
        f"- {o.id}: {o.label}"
        for o in taxonomy.outcomes
    ]
    domainLines = [
        f"- {d.id}: {d.label}"
        for d in taxonomy.domains
    ]
    user = _PROMPT_TEMPLATE.format(
        intent=intentText.replace('"', "'"),
        outcomeCatalog="\n".join(outcomeLines),
        domainCatalog="\n".join(domainLines),
    )
    return [
        {"role": "system", "content": _PROMPT_SYSTEM},
        {"role": "user", "content": user},
    ]


_JSON_BLOCK = re.compile(r"\{.*\}", re.DOTALL)


def _extractJsonPayload(answer: str) -> dict[str, Any] | None:
    """LLM 응답에서 첫 JSON 객체를 추출. 코드펜스/잡음 무시."""
    if not answer:
        return None
    stripped = answer.strip()
    candidates: list[str] = [stripped]
    fenceMatch = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", stripped, re.DOTALL)
    if fenceMatch:
        candidates.insert(0, fenceMatch.group(1))
    bareMatch = _JSON_BLOCK.search(stripped)
    if bareMatch:
        candidates.append(bareMatch.group(0))
    for raw in candidates:
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if isinstance(data, dict):
            return data
    return None


def _parseAiSuggestions(
    payload: dict[str, Any],
    taxonomy: CurriculumTaxonomy,
) -> tuple[list[OutcomeSuggestion], list[DomainSuggestion], str]:
    """AI JSON payload → 타이핑된 suggestion 리스트. 알 수 없는 id 는 drop."""
    outcomes: list[OutcomeSuggestion] = []
    rawOutcomes = payload.get("outcomes")
    if isinstance(rawOutcomes, list):
        for item in rawOutcomes:
            if not isinstance(item, dict):
                continue
            outcomeId = str(item.get("id") or "")
            outcome = taxonomy.outcomeById(outcomeId)
            if outcome is None:
                continue
            rawScore = item.get("score")
            score = float(rawScore) / 10.0 if isinstance(rawScore, (int, float)) else 0.5
            score = max(0.0, min(score, 1.0))
            outcomes.append(OutcomeSuggestion(
                outcomeId=outcomeId,
                label=outcome.label,
                score=score,
                reason=str(item.get("reason") or "AI ranking"),
            ))
    domains: list[DomainSuggestion] = []
    rawDomains = payload.get("domains")
    if isinstance(rawDomains, list):
        for item in rawDomains:
            if not isinstance(item, dict):
                continue
            domainId = str(item.get("id") or "")
            domain = taxonomy.domainById(domainId)
            if domain is None:
                continue
            rawScore = item.get("score")
            score = float(rawScore) / 10.0 if isinstance(rawScore, (int, float)) else 0.5
            score = max(0.0, min(score, 1.0))
            domains.append(DomainSuggestion(
                domainId=domainId,
                label=domain.label,
                score=score,
                reason=str(item.get("reason") or "AI ranking"),
            ))
    outcomes.sort(key=lambda s: (-s.score, s.outcomeId))
    domains.sort(key=lambda s: (-s.score, s.domainId))
    summary = str(payload.get("summary") or "")
    return outcomes, domains, summary


def _callAiProvider(
    aiProvider: _AiProviderLike,
    intentText: str,
    taxonomy: CurriculumTaxonomy,
) -> tuple[list[OutcomeSuggestion], list[DomainSuggestion], str] | None:
    """AI provider 호출 + 응답 파싱. 어떤 단계에서도 실패하면 None."""
    messages = _buildPrompt(intentText, taxonomy)
    try:
        response = aiProvider.complete(messages)
    except (RuntimeError, ValueError, TypeError, ConnectionError, TimeoutError, OSError):
        return None
    answer = getattr(response, "answer", None) or ""
    payload = _extractJsonPayload(answer)
    if payload is None:
        return None
    try:
        return _parseAiSuggestions(payload, taxonomy)
    except (ValidationError, ValueError, TypeError):
        return None


def _blendSuggestions(
    keywordOutcomes: list[OutcomeSuggestion],
    aiOutcomes: list[OutcomeSuggestion],
    keywordDomains: list[DomainSuggestion],
    aiDomains: list[DomainSuggestion],
) -> tuple[list[OutcomeSuggestion], list[DomainSuggestion]]:
    """AI ranking 이 우선, 키워드는 보강. 같은 id 가 양쪽에 있으면 AI 가 이긴다."""
    outcomes: dict[str, OutcomeSuggestion] = {s.outcomeId: s for s in keywordOutcomes}
    for s in aiOutcomes:
        # AI 점수가 더 높으면 교체, 같은 id 키워드 신호는 약한 boost 로만 유지.
        existing = outcomes.get(s.outcomeId)
        if existing is None or s.score >= existing.score:
            outcomes[s.outcomeId] = s
    domains: dict[str, DomainSuggestion] = {d.domainId: d for d in keywordDomains}
    for d in aiDomains:
        existing = domains.get(d.domainId)
        if existing is None or d.score >= existing.score:
            domains[d.domainId] = d
    outcomeList = sorted(outcomes.values(), key=lambda s: (-s.score, s.outcomeId))
    domainList = sorted(domains.values(), key=lambda s: (-s.score, s.domainId))
    return outcomeList, domainList


# Module-level cache — intentText → GoalResolution. 결정적 재호출 보장.
_resolutionCache: dict[str, GoalResolution] = {}
_cacheLock = Lock()


def clearResolutionCache() -> None:
    """테스트/AI provider 교체 시 호출."""
    with _cacheLock:
        _resolutionCache.clear()


def resolveGoal(
    intentText: str,
    taxonomy: CurriculumTaxonomy,
    aiProvider: _AiProviderLike | None = None,
    *,
    useCache: bool = True,
) -> GoalResolution:
    """intentText 를 outcome/domain 후보로 해석.

    1) 결정적 키워드 매칭. 2) aiProvider 있으면 LLM ranking + blend.
    AI 호출 실패/파싱 실패 시 자동으로 키워드 결과만 반환.
    """
    text = (intentText or "").strip()
    if not text:
        return GoalResolution(intentText="", source="none")

    cacheKey = f"{text}|ai={aiProvider is not None}"
    if useCache:
        with _cacheLock:
            cached = _resolutionCache.get(cacheKey)
        if cached is not None:
            return cached

    boostedCategories, matchedKeywords = _matchProjectIntent(text)
    keywordOutcomes = _outcomesForCategories(boostedCategories, taxonomy)
    keywordDomains = _domainsForCategories(boostedCategories, taxonomy)

    aiResult = _callAiProvider(aiProvider, text, taxonomy) if aiProvider is not None else None

    if aiResult is not None:
        aiOutcomes, aiDomains, summary = aiResult
        blendedOutcomes, blendedDomains = _blendSuggestions(
            keywordOutcomes, aiOutcomes, keywordDomains, aiDomains,
        )
        source: Literal["keyword", "ai", "blended", "none"] = (
            "blended" if matchedKeywords else "ai"
        )
        reasoning = summary or (
            f"AI ranking: outcome {len(aiOutcomes)}개, domain {len(aiDomains)}개"
        )
        if matchedKeywords:
            reasoning = f"{reasoning} · 키워드 '{', '.join(matchedKeywords)}' 보강"
        resolution = GoalResolution(
            intentText=text,
            matchedKeywords=matchedKeywords,
            boostedCategories=sorted(boostedCategories),
            aiSuggestedOutcomes=blendedOutcomes,
            aiSuggestedDomains=blendedDomains,
            source=source,
            reasoning=reasoning,
        )
    elif matchedKeywords:
        resolution = GoalResolution(
            intentText=text,
            matchedKeywords=matchedKeywords,
            boostedCategories=sorted(boostedCategories),
            aiSuggestedOutcomes=keywordOutcomes,
            aiSuggestedDomains=keywordDomains,
            source="keyword",
            reasoning=(
                f"키워드 '{', '.join(matchedKeywords)}' 매칭 → "
                f"카테고리 {sorted(boostedCategories)} prioritize"
            ),
        )
    else:
        resolution = GoalResolution(
            intentText=text,
            source="none",
            reasoning="키워드 매칭 결과 없음 — domain 후보를 직접 선택하세요.",
        )

    if useCache:
        with _cacheLock:
            _resolutionCache[cacheKey] = resolution
    return resolution


__all__ = [
    "DomainSuggestion",
    "GoalResolution",
    "OutcomeSuggestion",
    "PROJECT_INTENT_KEYWORDS",
    "clearResolutionCache",
    "resolveGoal",
]
