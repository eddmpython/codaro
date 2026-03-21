from __future__ import annotations

import json
from typing import Generator

from codaro.ai.baseProvider import BaseProvider
from codaro.ai.types import LLMConfig, LLMResponse, ToolCall, ToolResponse

try:
    from openai import OpenAIError as _OpenAIError

    _COMPAT_ERRORS = (ImportError, OSError, RuntimeError, TypeError, ValueError, _OpenAIError)
except ImportError:
    _COMPAT_ERRORS = (ImportError, OSError, RuntimeError, TypeError, ValueError)


class CustomProvider(BaseProvider):

    def __init__(self, config: LLMConfig):
        super().__init__(config)
        self._client = None

    def _getClient(self):
        if self._client is None:
            try:
                from openai import OpenAI
            except ImportError:
                raise ImportError("openai package is required.\n  uv add codaro[ai]")
            if not self.config.baseUrl:
                raise ValueError("Custom provider requires a baseUrl.")
            kwargs: dict = {"base_url": self.config.baseUrl}
            if self.config.apiKey:
                kwargs["api_key"] = self.config.apiKey
            else:
                kwargs["api_key"] = "unused"
            self._client = OpenAI(**kwargs)
        return self._client

    @property
    def defaultModel(self) -> str:
        return "gpt-4o"

    @property
    def supportsNativeTools(self) -> bool:
        return True

    def checkAvailable(self) -> bool:
        try:
            self._getClient()
            return True
        except _COMPAT_ERRORS:
            return False

    def complete(self, messages: list[dict[str, str]]) -> LLMResponse:
        client = self._getClient()
        response = client.chat.completions.create(
            model=self.resolvedModel,
            messages=messages,
            temperature=self.config.temperature,
            max_tokens=self.config.maxTokens,
        )
        choice = response.choices[0]
        usage = None
        if response.usage:
            usage = {
                "promptTokens": response.usage.prompt_tokens,
                "completionTokens": response.usage.completion_tokens,
                "totalTokens": response.usage.total_tokens,
            }
        return LLMResponse(
            answer=choice.message.content or "",
            provider="custom",
            model=response.model,
            usage=usage,
        )

    def stream(self, messages: list[dict[str, str]]) -> Generator[str, None, None]:
        client = self._getClient()
        response = client.chat.completions.create(
            model=self.resolvedModel,
            messages=messages,
            temperature=self.config.temperature,
            max_tokens=self.config.maxTokens,
            stream=True,
        )
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    def completeWithTools(
        self,
        messages: list[dict],
        tools: list[dict],
    ) -> ToolResponse:
        client = self._getClient()
        kwargs: dict = {
            "model": self.resolvedModel,
            "messages": messages,
            "temperature": self.config.temperature,
            "max_tokens": self.config.maxTokens,
        }
        if tools:
            kwargs["tools"] = tools

        response = client.chat.completions.create(**kwargs)
        choice = response.choices[0]

        usage = None
        if response.usage:
            usage = {
                "promptTokens": response.usage.prompt_tokens,
                "completionTokens": response.usage.completion_tokens,
                "totalTokens": response.usage.total_tokens,
            }

        toolCalls = []
        if choice.message.tool_calls:
            for tc in choice.message.tool_calls:
                toolCalls.append(
                    ToolCall(
                        id=tc.id,
                        name=tc.function.name,
                        arguments=json.loads(tc.function.arguments),
                    )
                )

        return ToolResponse(
            answer=choice.message.content or "",
            provider="custom",
            model=response.model,
            toolCalls=toolCalls,
            finishReason=choice.finish_reason or "stop",
            usage=usage,
        )
