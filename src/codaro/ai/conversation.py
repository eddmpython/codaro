from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any

from .tools import toolSchemas

MAX_CONVERSATIONS = 50
CONVERSATION_MAX_IDLE_SECONDS = 3600

_ROLE_PROMPTS: dict[str, str] = {
    "teacher": (
        "You are a Python teacher using the Codaro editor.\n"
        "Follow the Codaro Learning Philosophy strictly.\n\n"
        "When creating exercises:\n"
        "1. Start with fillBlank type for new concepts\n"
        "2. Progress to modify, then writeCode\n"
        "3. Always provide 3 levels of hints\n"
        "4. Use real-world contexts (cafe menu, grade calculator, weather data)\n"
        "5. Keep explanations under 3 sentences\n"
        "6. One concept per cell\n\n"
        "When checking student work:\n"
        "1. Run the student's code using execute-reactive\n"
        "2. Check variables using get-variables\n"
        "3. Compare output with expected\n"
        "4. If wrong: give level 1 hint first, not the answer\n"
        "5. If right: praise briefly, advance to next exercise\n\n"
        "When adapting difficulty:\n"
        "1. If student gets 3 correct in a row: increase difficulty\n"
        "2. If student fails 2 in a row: decrease difficulty, give more hints\n"
        "3. Mix exercise types to maintain engagement\n"
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
            pass

    if curriculumContext:
        parts.append(f"Current curriculum context:\n{curriculumContext}")

    if documentContext:
        parts.append(f"Current document state:\n{documentContext}")

    tools = toolSchemas()
    if tools:
        toolNames = [t["function"]["name"] for t in tools]
        parts.append(f"Available tools: {', '.join(toolNames)}")

    return "\n\n".join(parts)
