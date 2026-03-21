from __future__ import annotations

import dataclasses
import os
from dataclasses import dataclass, field
from typing import Any, Literal

ProviderName = Literal[
    "openai",
    "ollama",
    "custom",
    "oauth-chatgpt",
]


@dataclass
class LLMConfig:
    provider: ProviderName = "openai"
    model: str | None = None
    apiKey: str | None = None
    baseUrl: str | None = None
    temperature: float = 0.3
    maxTokens: int = 4096
    systemPrompt: str | None = None

    def __post_init__(self):
        if self.baseUrl is None:
            envUrl = os.environ.get("CODARO_LLM_BASE_URL")
            if envUrl:
                self.baseUrl = envUrl

    def merge(self, overrides: dict[str, Any]) -> LLMConfig:
        vals = dataclasses.asdict(self)
        vals.update({k: v for k, v in overrides.items() if v is not None})
        return LLMConfig(**vals)


@dataclass
class LLMResponse:
    answer: str
    provider: str
    model: str
    usage: dict[str, int] | None = None


@dataclass
class ToolCall:
    id: str
    name: str
    arguments: dict[str, Any]


@dataclass
class ToolResponse(LLMResponse):
    toolCalls: list[ToolCall] = field(default_factory=list)
    finishReason: str = "stop"
