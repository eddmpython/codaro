from __future__ import annotations

import json
from abc import ABC, abstractmethod
from typing import Generator

from .types import LLMConfig, LLMResponse, ToolCall, ToolResponse


class BaseProvider(ABC):

    def __init__(self, config: LLMConfig):
        self.config = config

    @abstractmethod
    def complete(self, messages: list[dict[str, str]]) -> LLMResponse:
        ...

    @abstractmethod
    def stream(self, messages: list[dict[str, str]]) -> Generator[str, None, None]:
        ...

    @abstractmethod
    def checkAvailable(self) -> bool:
        ...

    @property
    @abstractmethod
    def defaultModel(self) -> str:
        ...

    @property
    def resolvedModel(self) -> str:
        return self.config.model or self.defaultModel

    @property
    def supportsNativeTools(self) -> bool:
        return False

    def completeWithTools(
        self,
        messages: list[dict],
        tools: list[dict],
    ) -> ToolResponse:
        response = self.complete(messages)
        return ToolResponse(
            answer=response.answer,
            provider=response.provider,
            model=response.model,
            usage=response.usage,
        )

    def formatToolResult(self, toolCallId: str, result: str) -> dict:
        return {
            "role": "tool",
            "tool_call_id": toolCallId,
            "content": result,
        }

    def formatAssistantToolCalls(
        self,
        answer: str | None,
        toolCalls: list[ToolCall],
    ) -> dict:
        msg: dict = {"role": "assistant", "content": answer}
        msg["tool_calls"] = [
            {
                "id": tc.id,
                "type": "function",
                "function": {
                    "name": tc.name,
                    "arguments": json.dumps(tc.arguments, ensure_ascii=False),
                },
            }
            for tc in toolCalls
        ]
        return msg
