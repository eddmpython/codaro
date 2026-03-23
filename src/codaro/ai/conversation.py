from __future__ import annotations

import logging
import time
import uuid
from dataclasses import dataclass, field
from typing import Any

from .tools import toolSchemas

logger = logging.getLogger(__name__)

MAX_CONVERSATIONS = 50
CONVERSATION_MAX_IDLE_SECONDS = 3600

_ROLE_PROMPTS: dict[str, str] = {
    "teacher": (
        "You are a Python teacher in the Codaro editor.\n"
        "You MUST follow the Codaro Learning Philosophy — 10 principles:\n\n"
        "1. MINIMAL EXPLANATION, MAXIMUM EXECUTION — explain in under 3 sentences, then immediately give an exercise.\n"
        "2. START WITH BLANKS — for new concepts, give nearly-complete code with blanks to fill, not empty cells.\n"
        "3. PREDICT THEN VERIFY — ask 'what will this print?' before running code. Use predict-type exercises.\n"
        "4. ERRORS ARE LEARNING — intentionally give buggy code. Use fixBug exercises.\n"
        "5. PROGRESSIVE BUILD — one concept per cell, build on previous cells incrementally.\n"
        "6. MODIFY EXPERIMENTS — after correct answer, say 'change X and see what happens.'\n"
        "7. 3-LEVEL HINTS — never give the answer directly. Level 1: concept, Level 2: structure, Level 3: solution.\n"
        "8. INSTANT FEEDBACK — use check-exercise or execute-reactive to validate within 1 second.\n"
        "9. VARIED REPETITION — same concept in different real-world contexts (cafe, weather, grades, shopping).\n"
        "10. REAL CONTEXT — never use abstract 'foo/bar' examples. Use realistic data and scenarios.\n\n"
        "Exercise flow:\n"
        "- New concept → fillBlank (easy) → modify (medium) → writeCode (hard)\n"
        "- Always provide 3 hints per exercise\n"
        "- One concept per cell, use insert-block to add exercises\n\n"
        "Checking student work:\n"
        "- Run code with execute-reactive, check variables with get-variables\n"
        "- Wrong answer → give level 1 hint first, NEVER the answer\n"
        "- Right answer → praise in one sentence, immediately advance\n"
        "- 3 wrong in a row → simplify the exercise, use create-notebook-exercise for extra practice\n\n"
        "Adaptive difficulty:\n"
        "- 3 correct streak → increase difficulty (easy→medium→hard)\n"
        "- 2 fails in a row → decrease difficulty, give more scaffolding\n"
        "- Mix exercise types every 3-4 exercises to maintain engagement\n"
        "- After 3 consecutive fails on a topic → use create-notebook-exercise to generate remedial practice\n"
        "- Track achievements with track-achievement after topic completion\n\n"
        "Learning tools available:\n"
        "- create-guide: single exercise block\n"
        "- create-learning-card: explanation + fill-blank card\n"
        "- create-quiz: multiple questions on a topic\n"
        "- create-notebook-exercise: multi-stage progressive exercise\n"
        "- track-achievement: record exercise-complete, quiz-score, topic-mastery, streak\n"
        "- check-exercise: validate student answer against expected\n"
    ),
    "copilot": (
        "You are a coding assistant in the Codaro editor.\n"
        "Help the user write, debug, and improve code.\n"
        "When appropriate, insert code blocks directly into the notebook.\n"
        "Be concise. Show don't tell.\n"
    ),
    "automation": (
        "You are an automation assistant in the Codaro editor.\n"
        "Help the user create automated tasks, data pipelines, and scheduled jobs.\n"
        "Focus on practical, working code that can run headlessly.\n"
        "Prefer robust error handling and clear output.\n"
    ),
}


@dataclass
class Message:
    role: str
    content: str
    toolCalls: list[dict[str, Any]] | None = None
    toolCallId: str | None = None
    name: str | None = None


@dataclass
class ConversationState:
    conversationId: str = field(default_factory=lambda: f"conv-{uuid.uuid4().hex[:10]}")
    messages: list[Message] = field(default_factory=list)
    role: str = "copilot"
    systemPrompt: str | None = None
    curriculumContext: str | None = None
    documentContext: str | None = None
    turnCount: int = 0


class ConversationManager:

    def __init__(self) -> None:
        self._conversations: dict[str, ConversationState] = {}
        self._lastAccessed: dict[str, float] = {}

    def create(
        self,
        *,
        role: str = "copilot",
        systemPrompt: str | None = None,
        curriculumContext: str | None = None,
        documentContext: str | None = None,
    ) -> ConversationState:
        self._evictIfFull()
        state = ConversationState(
            role=role,
            systemPrompt=systemPrompt,
            curriculumContext=curriculumContext,
            documentContext=documentContext,
        )
        self._conversations[state.conversationId] = state
        self._lastAccessed[state.conversationId] = time.monotonic()
        return state

    def get(self, conversationId: str) -> ConversationState | None:
        state = self._conversations.get(conversationId)
        if state is not None:
            self._lastAccessed[conversationId] = time.monotonic()
        return state

    def addUserMessage(self, conversationId: str, content: str) -> ConversationState | None:
        state = self._conversations.get(conversationId)
        if state is None:
            return None
        state.messages.append(Message(role="user", content=content))
        state.turnCount += 1
        return state

    def addAssistantMessage(
        self,
        conversationId: str,
        content: str,
        toolCalls: list[dict[str, Any]] | None = None,
    ) -> ConversationState | None:
        state = self._conversations.get(conversationId)
        if state is None:
            return None
        state.messages.append(Message(role="assistant", content=content, toolCalls=toolCalls))
        return state

    def addToolResult(
        self,
        conversationId: str,
        toolCallId: str,
        result: str,
    ) -> ConversationState | None:
        state = self._conversations.get(conversationId)
        if state is None:
            return None
        state.messages.append(Message(role="tool", content=result, toolCallId=toolCallId))
        return state

    def delete(self, conversationId: str) -> bool:
        self._lastAccessed.pop(conversationId, None)
        return self._conversations.pop(conversationId, None) is not None

    def reapExpired(self, maxIdleSeconds: float = CONVERSATION_MAX_IDLE_SECONDS) -> int:
        now = time.monotonic()
        expired = [
            cid for cid, lastActive in self._lastAccessed.items()
            if (now - lastActive) > maxIdleSeconds
        ]
        for cid in expired:
            self.delete(cid)
        return len(expired)

    def _evictIfFull(self) -> None:
        if len(self._conversations) < MAX_CONVERSATIONS:
            return
        oldest = min(self._lastAccessed, key=self._lastAccessed.get, default=None)
        if oldest is not None:
            self.delete(oldest)

    @property
    def conversationCount(self) -> int:
        return len(self._conversations)

    def listConversations(self) -> list[dict[str, Any]]:
        return [
            {
                "conversationId": state.conversationId,
                "role": state.role,
                "turnCount": state.turnCount,
                "messageCount": len(state.messages),
            }
            for state in self._conversations.values()
        ]

    def buildMessages(self, conversationId: str) -> list[dict[str, Any]]:
        state = self._conversations.get(conversationId)
        if state is None:
            return []

        messages: list[dict[str, Any]] = []

        systemContent = buildSystemPrompt(
            role=state.role,
            customPrompt=state.systemPrompt,
            curriculumContext=state.curriculumContext,
            documentContext=state.documentContext,
        )
        messages.append({"role": "system", "content": systemContent})

        for msg in state.messages:
            entry: dict[str, Any] = {"role": msg.role, "content": msg.content}
            if msg.toolCalls:
                entry["tool_calls"] = msg.toolCalls
            if msg.toolCallId:
                entry["tool_call_id"] = msg.toolCallId
            if msg.name:
                entry["name"] = msg.name
            messages.append(entry)

        return messages

    def getToolSchemas(self) -> list[dict[str, Any]]:
        return toolSchemas()


def buildSystemPrompt(
    *,
    role: str = "copilot",
    customPrompt: str | None = None,
    curriculumContext: str | None = None,
    documentContext: str | None = None,
    learningPhilosophy: str | None = None,
) -> str:
    parts: list[str] = []

    rolePrompt = _ROLE_PROMPTS.get(role, _ROLE_PROMPTS["copilot"])
    parts.append(rolePrompt)

    if customPrompt:
        parts.append(f"Additional instructions:\n{customPrompt}")

    if learningPhilosophy:
        parts.append(f"Learning Philosophy:\n{learningPhilosophy}")
    elif role == "teacher":
        try:
            from codaro.curriculum.learningSpec import PHILOSOPHY
            parts.append(f"Learning Philosophy:\n{PHILOSOPHY}")
        except ImportError:
            logger.debug("curriculum.learningSpec not available, skipping philosophy")

    if curriculumContext:
        parts.append(f"Current curriculum context:\n{curriculumContext}")

    if role == "teacher":
        parts.append(
            "Adaptive behavior:\n"
            "- The frontend tracks streak, accuracy, and adaptive difficulty.\n"
            "- When curriculum context mentions low accuracy (<50%), use simpler exercises.\n"
            "- When streak is high (>5), challenge with harder exercises or new topics.\n"
            "- When weak topics are listed, prioritize exercises on those topics.\n"
            "- After student completes a topic, use track-achievement with type='topic-mastery'.\n"
        )

    if documentContext:
        parts.append(f"Current document state:\n{documentContext}")

    tools = toolSchemas()
    if tools:
        toolNames = [t["function"]["name"] for t in tools]
        parts.append(f"Available tools: {', '.join(toolNames)}")

    return "\n\n".join(parts)
