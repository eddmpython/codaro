"""Phase 7 — Knowledge Check 셀 자동 제안.

작가가 lesson YAML 의 section 에 outcome 을 매핑했는데 정작 검증 (`check`) 셀이
없거나 `noError` 만 있는 경우가 있다. 이 모듈은:

1. `weakCheckCoverage(graph, studyLoader)` — 약점 식별 (결정적)
2. `proposeChecksForGap(...)` — LLM provider 가 있으면 검증 셀 초안 제안

CLAUDE.md 의 "커리큘럼 YAML 은 한 강의씩 직접 작성" 규칙은 유지. 제안은 작가가
검토 후 수동으로 lesson YAML 에 패치한다 — 자동 패치 금지.
"""
from __future__ import annotations

import json
import re
from typing import Any

import yaml
from pydantic import BaseModel, Field, ValidationError

from .lessonGraph import LessonGraph
from .studyLoader import StudyLoader


WEAK_CHECK_TYPES = {"noError"}
STRONG_CHECK_TYPES = {"output", "variable", "contains", "resultCheck"}


class WeakCheckCoverage(BaseModel):
    lessonKey: str
    category: str
    contentId: str
    sectionId: str
    outcomeId: str
    outcomeLabel: str = ""
    currentCheckType: str | None = None
    reason: str


class CheckProposal(BaseModel):
    lessonKey: str
    sectionId: str
    outcomeId: str
    proposedCheckType: str
    proposedCheckYaml: str
    starterCode: str = ""
    hints: list[str] = Field(default_factory=list)
    reasoning: str = ""
    confidence: float = 0.0


def _checkSpec(section: dict[str, Any]) -> tuple[str | None, dict[str, Any]]:
    """section 의 check 스펙을 (대표 타입, 원본 dict) 으로 반환."""
    check = section.get("check")
    if not isinstance(check, dict) or not check:
        return None, {}
    # check 가 단일 키 (noError / resultCheck / output / variable / contains).
    # 우선순위: 강한 타입이 있으면 그 타입 반환.
    for strong in ("output", "variable", "contains", "resultCheck"):
        if strong in check:
            return strong, check
    for weak in ("noError",):
        if weak in check:
            return weak, check
    # 알 수 없는 키 — 첫 키.
    firstKey = next(iter(check.keys()), None)
    return firstKey, check


def _sectionsFromLesson(payload: dict[str, Any]) -> list[dict[str, Any]]:
    """lesson YAML 에서 section dict 리스트 추출."""
    sections = payload.get("sections")
    if isinstance(sections, list):
        return [s for s in sections if isinstance(s, dict)]
    return []


def _sectionIdFor(section: dict[str, Any]) -> str | None:
    sid = section.get("id")
    if isinstance(sid, str) and sid:
        return sid
    return None


def weakCheckCoverage(
    graph: LessonGraph,
    studyLoader: StudyLoader,
) -> list[WeakCheckCoverage]:
    """outcome 매핑은 있는데 검증이 약한 (없거나 noError 만) section 을 찾는다."""
    weak: list[WeakCheckCoverage] = []
    for lesson in graph.lessons:
        if not lesson.sectionOutcomes:
            continue
        try:
            payload = studyLoader.loadStudy(lesson.category, lesson.contentId)
        except FileNotFoundError:
            continue
        if not isinstance(payload, dict):
            continue
        sectionsById = {
            sid: section
            for section in _sectionsFromLesson(payload)
            if (sid := _sectionIdFor(section)) is not None
        }
        for sectionId, outcomeIds in lesson.sectionOutcomes.items():
            section = sectionsById.get(sectionId)
            currentType: str | None = None
            reason = ""
            if section is None:
                reason = "section 정의 없음 — outcome 매핑만 존재"
            else:
                currentType, _ = _checkSpec(section)
                if currentType is None:
                    reason = "section.check 없음"
                elif currentType in WEAK_CHECK_TYPES:
                    reason = f"check 가 '{currentType}' 만 있음 — 결과 검증 보강 필요"
                else:
                    continue
            for outcomeId in outcomeIds:
                weak.append(WeakCheckCoverage(
                    lessonKey=lesson.key,
                    category=lesson.category,
                    contentId=lesson.contentId,
                    sectionId=sectionId,
                    outcomeId=outcomeId,
                    currentCheckType=currentType,
                    reason=reason,
                ))
    return weak


def _buildPrompt(
    lessonKey: str,
    sectionId: str,
    outcomeId: str,
    outcomeLabel: str,
    lessonContext: str,
) -> list[dict[str, str]]:
    system = (
        "당신은 Codaro 커리큘럼 검증 셀 작가입니다. lesson section 에 대해 학습자의 "
        "코드 실습 결과를 자동으로 검증하는 최소한의 check 셀 YAML 단편을 제안합니다. "
        "JSON 만 반환합니다."
    )
    user = (
        f"lesson: {lessonKey}\n"
        f"section: {sectionId}\n"
        f"outcome: {outcomeId} ({outcomeLabel})\n\n"
        f"section context:\n{lessonContext}\n\n"
        "다음 JSON 형식으로 응답:\n"
        "{\n"
        '  "proposedCheckType": "output|variable|contains|resultCheck",\n'
        '  "proposedCheckYaml": "check:\\n  <type>: <검증 표현식 또는 기대값>",\n'
        '  "starterCode": "<학습자 실습용 코드 단편>",\n'
        '  "hints": ["힌트1", "힌트2"],\n'
        '  "reasoning": "<왜 이 type 을 골랐는지>",\n'
        '  "confidence": <0~1>\n'
        "}"
    )
    return [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]


_JSON_BLOCK = re.compile(r"\{.*\}", re.DOTALL)


def _extractJsonPayload(answer: str) -> dict[str, Any] | None:
    if not answer:
        return None
    stripped = answer.strip()
    fenceMatch = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", stripped, re.DOTALL)
    candidates: list[str] = [stripped]
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


def _validateYamlFragment(fragment: str) -> bool:
    try:
        parsed = yaml.safe_load(fragment)
    except yaml.YAMLError:
        return False
    return isinstance(parsed, dict)


def proposeChecksForGap(
    weak: WeakCheckCoverage,
    lessonContext: str,
    outcomeLabel: str = "",
    aiProvider=None,
) -> CheckProposal | None:
    """AI provider 없으면 None — keyword/template fallback 시도하지 않음 (의도된 한계)."""
    if aiProvider is None:
        return None
    messages = _buildPrompt(
        weak.lessonKey, weak.sectionId, weak.outcomeId,
        outcomeLabel or weak.outcomeId, lessonContext,
    )
    try:
        response = aiProvider.complete(messages)
    except (RuntimeError, ValueError, TypeError, ConnectionError, TimeoutError, OSError):
        return None
    answer = getattr(response, "answer", None) or ""
    payload = _extractJsonPayload(answer)
    if payload is None:
        return None
    try:
        proposedType = str(payload.get("proposedCheckType") or "").strip()
        proposedYaml = str(payload.get("proposedCheckYaml") or "").strip()
        if not proposedType or not proposedYaml:
            return None
        if proposedType not in STRONG_CHECK_TYPES and proposedType not in WEAK_CHECK_TYPES:
            return None
        if not _validateYamlFragment(proposedYaml):
            return None
        hintsRaw = payload.get("hints") or []
        hints = [str(h) for h in hintsRaw if isinstance(h, str)] if isinstance(hintsRaw, list) else []
        confidenceRaw = payload.get("confidence")
        confidence = (
            float(confidenceRaw)
            if isinstance(confidenceRaw, (int, float))
            else 0.5
        )
        return CheckProposal(
            lessonKey=weak.lessonKey,
            sectionId=weak.sectionId,
            outcomeId=weak.outcomeId,
            proposedCheckType=proposedType,
            proposedCheckYaml=proposedYaml,
            starterCode=str(payload.get("starterCode") or ""),
            hints=hints,
            reasoning=str(payload.get("reasoning") or ""),
            confidence=max(0.0, min(confidence, 1.0)),
        )
    except (ValidationError, ValueError, TypeError):
        return None


def lessonContextForSection(
    studyLoader: StudyLoader,
    category: str,
    contentId: str,
    sectionId: str,
    maxChars: int = 800,
) -> str:
    """section explanation + snippet 을 LLM context 용으로 추출 (잘라서)."""
    try:
        payload = studyLoader.loadStudy(category, contentId)
    except FileNotFoundError:
        return ""
    if not isinstance(payload, dict):
        return ""
    for section in _sectionsFromLesson(payload):
        if _sectionIdFor(section) != sectionId:
            continue
        parts: list[str] = []
        title = section.get("title")
        if isinstance(title, str):
            parts.append(f"제목: {title}")
        explanation = section.get("explanation")
        if isinstance(explanation, str):
            parts.append(f"설명:\n{explanation}")
        snippet = section.get("snippet") or section.get("starterCode")
        if isinstance(snippet, str):
            parts.append(f"코드:\n{snippet}")
        blob = "\n\n".join(parts)
        return blob[:maxChars]
    return ""


__all__ = [
    "CheckProposal",
    "WeakCheckCoverage",
    "lessonContextForSection",
    "proposeChecksForGap",
    "weakCheckCoverage",
]
