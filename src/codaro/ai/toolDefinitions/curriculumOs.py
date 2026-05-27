"""Curriculum OS — AI 도구 정의.

AI(teacher)가 직접 호출해서 학습 경로를 짜고 갭을 식별할 수 있는 도구들이다.
실제 강의 작성은 사람 검토를 거치도록 propose-curriculum-draft만 draft를 반환한다.
"""
from __future__ import annotations

from ..toolRegistry import ToolDef


TOOL_LIST_CURRICULUM_DOMAINS = ToolDef(
    name="list-curriculum-domains",
    description=(
        "List available learning domains and outcomes registered in the Curriculum OS taxonomy. "
        "Use this to map a user's natural-language goal to a concrete domain id."
    ),
    parameters={
        "type": "object",
        "properties": {},
    },
    handler="listCurriculumDomains",
)


TOOL_SEARCH_CURRICULA = ToolDef(
    name="search-curricula",
    description=(
        "Search curriculum lessons by free-text query, category, or outcome id. "
        "Returns matching lessons with their outcomes and prerequisites."
    ),
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": "Free-text search across lesson title and category.",
            },
            "category": {
                "type": "string",
                "description": "Limit results to a single category id (e.g. 'pandas').",
            },
            "outcomeId": {
                "type": "string",
                "description": "Limit results to lessons that grant this outcome id.",
            },
            "limit": {
                "type": "integer",
                "description": "Max results to return (default 12).",
            },
        },
    },
    handler="searchCurricula",
)


TOOL_COMPOSE_MASTER_PLAN = ToolDef(
    name="compose-master-plan",
    description=(
        "Compose an ordered learning master plan for the user's goal. "
        "Accepts a domain id and/or explicit outcome ids. Returns ordered lesson steps "
        "and a gap report for outcomes the curriculum doesn't yet cover."
    ),
    parameters={
        "type": "object",
        "properties": {
            "domain": {
                "type": "string",
                "description": "Domain id from the taxonomy (e.g. 'dataReporting').",
            },
            "outcomes": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Explicit outcome ids to target on top of (or instead of) the domain.",
            },
            "excludeCompleted": {
                "type": "boolean",
                "description": "If true (default), filter out lessons the user has already completed.",
            },
        },
    },
    handler="composeMasterPlan",
)


TOOL_INSPECT_CURRICULUM = ToolDef(
    name="inspect-curriculum",
    description=(
        "Inspect a single lesson by category + contentId. Returns title, outcomes, "
        "prerequisites, estimated minutes, and intro/summary if available."
    ),
    parameters={
        "type": "object",
        "properties": {
            "category": {
                "type": "string",
                "description": "Category id (e.g. 'pandas').",
            },
            "contentId": {
                "type": "string",
                "description": "Lesson content id (e.g. '01_레스토랑팁분석').",
            },
        },
        "required": ["category", "contentId"],
    },
    handler="inspectCurriculum",
)


TOOL_LIST_CURRICULUM_GAPS = ToolDef(
    name="list-curriculum-gaps",
    description=(
        "List taxonomy outcomes that no lesson currently provides — i.e. concrete gaps "
        "in the curriculum that would block a master plan."
    ),
    parameters={
        "type": "object",
        "properties": {
            "domain": {
                "type": "string",
                "description": "Restrict gap analysis to a single domain id.",
            },
        },
    },
    handler="listCurriculumGaps",
)


TOOL_PROPOSE_CURRICULUM_DRAFT = ToolDef(
    name="propose-curriculum-draft",
    description=(
        "Propose a draft outline for a new lesson that would fill a curriculum gap. "
        "Returns a structured proposal ONLY — does not write any YAML file. "
        "A human must review and author the actual lesson."
    ),
    parameters={
        "type": "object",
        "properties": {
            "outcomeId": {
                "type": "string",
                "description": "Outcome id the proposed lesson would grant.",
            },
            "suggestedCategory": {
                "type": "string",
                "description": "Category id where this lesson would live.",
            },
            "suggestedContentId": {
                "type": "string",
                "description": "Proposed filename slug (lowerCamel or numeric prefix).",
            },
            "title": {
                "type": "string",
                "description": "Korean title for the new lesson.",
            },
            "summary": {
                "type": "string",
                "description": "One-paragraph summary of what this lesson teaches.",
            },
            "prerequisites": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Prerequisite outcome ids this lesson assumes.",
            },
            "sectionOutline": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Ordered section titles for the lesson body.",
            },
            "estimatedMinutes": {
                "type": "integer",
                "description": "Rough estimated minutes for one pass.",
            },
        },
        "required": ["outcomeId", "title", "summary", "sectionOutline"],
    },
    handler="proposeCurriculumDraft",
)
