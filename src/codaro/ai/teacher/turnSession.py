from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

from ..factory import createProvider
from ..tools import toolSchemas
from ..types import LLMConfig
from .clarificationPolicy import ClarificationPlan


class TeacherConversationNotFound(LookupError):
    pass


@dataclass(frozen=True)
class TeacherTurnSession:
    conversationId: str
    provider: Any
    messages: list[dict[str, Any]]
    role: str
    tools: list[dict[str, Any]]
    clarificationPlan: ClarificationPlan | None = None


def prepareTeacherTurn(
    *,
    convManager: Any,
    profileManager: Any,
    message: str,
    conversationId: str | None = None,
    providerOverride: str | None = None,
    roleOverride: str | None = None,
    clarificationPlan: ClarificationPlan | None = None,
    skipProvider: bool = False,
    providerFactory: Callable[[LLMConfig], Any] = createProvider,
) -> TeacherTurnSession:
    if not conversationId:
        conv = convManager.create(role=roleOverride or "copilot")
        conversationId = conv.conversationId
    else:
        conv = convManager.get(conversationId)
        if conv is None:
            raise TeacherConversationNotFound(conversationId)

    convManager.addUserMessage(conversationId, message)
    role = conv.role if conv else "copilot"
    if skipProvider:
        return TeacherTurnSession(
            conversationId=conversationId,
            provider=None,
            messages=convManager.buildMessages(conversationId),
            role=role,
            tools=[],
            clarificationPlan=clarificationPlan,
        )

    resolved = profileManager.resolve(provider=providerOverride, role=role)
    config = LLMConfig(
        provider=resolved["provider"],
        model=resolved.get("model"),
        apiKey=resolved.get("apiKey"),
        baseUrl=resolved.get("baseUrl"),
        temperature=resolved.get("temperature", 0.3),
        maxTokens=resolved.get("maxTokens", 4096),
    )

    return TeacherTurnSession(
        conversationId=conversationId,
        provider=providerFactory(config),
        messages=convManager.buildMessages(conversationId),
        role=role,
        tools=toolSchemas(),
        clarificationPlan=clarificationPlan,
    )
