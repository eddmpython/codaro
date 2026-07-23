"""Diagnostic tool definitions for evidence-grounded learner guidance.

AI teacher가 학습자 mental model 상태를 읽고 갱신하기 위한 도구들.
[[teacher-tool-loop]]의 diagnosis lane 입구다.
"""
from __future__ import annotations

from ..toolRegistry import ToolDef


TOOL_READ_LEARNER_STATE = ToolDef(
    name="read-learner-state",
    description=(
        "Read the current learner state — per-outcome mastery scores, "
        "misconception hits, and execution summary. Use this before suggesting "
        "the next step so the recommendation is grounded in the actual state."
    ),
    parameters={
        "type": "object",
        "properties": {
            "outcomeId": {
                "type": "string",
                "description": "Optional — limit mastery payload to a single outcome.",
            },
        },
    },
    handler="readLearnerState",
)


TOOL_MATCH_MISCONCEPTION = ToolDef(
    name="match-misconception",
    description=(
        "Match a learner's submitted code or error traceback "
        "against the misconception catalog for one or more outcomes. Records "
        "each matched misconception as a hit and reports whether it is a new "
        "or repeat occurrence (repeats are the done criterion to avoid)."
    ),
    parameters={
        "type": "object",
        "properties": {
            "outcomeIds": {
                "type": "array",
                "items": {"type": "string"},
                "description": "outcome ids whose catalogs should be considered.",
            },
            "code": {
                "type": "string",
                "description": "Optional — learner's submitted code.",
            },
            "errorText": {
                "type": "string",
                "description": "Optional — traceback or error message.",
            },
        },
        "required": ["outcomeIds"],
    },
    handler="matchMisconception",
)


TOOL_SUGGEST_NEXT_STEP = ToolDef(
    name="suggest-next-step",
    description=(
        "Suggest the next action for the learner given their current state — "
        "either replay a weak outcome, advance to the next prerequisite, or "
        "surface a misconception correction. Returns the recommendation with "
        "the deriving signal (mastery score / repeat misconception / gap)."
    ),
    parameters={
        "type": "object",
        "properties": {
            "currentOutcomeId": {
                "type": "string",
                "description": "The outcome the learner is currently practising.",
            },
            "domainId": {
                "type": "string",
                "description": "Optional — the broader domain plan to align with.",
            },
        },
        "required": ["currentOutcomeId"],
    },
    handler="suggestNextStep",
)
