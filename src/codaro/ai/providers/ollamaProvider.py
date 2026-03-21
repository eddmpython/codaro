from __future__ import annotations

import json
from typing import Generator

from codaro.ai.baseProvider import BaseProvider
from codaro.ai.types import LLMConfig, LLMResponse, ToolCall, ToolResponse

OLLAMA_DEFAULT_URL = "http://localhost:11434"


class OllamaProvider(BaseProvider):

    def __init__(self, config: LLMConfig):
        super().__init__(config)
        self._client = None
        self._baseUrl = config.baseUrl or f"{OLLAMA_DEFAULT_URL}/v1"

    @property
    def defaultModel(self) -> str:
        models = self.getInstalledModels()
        if models:
            return models[0]
        return "llama3.1"

    @property
    def supportsNativeTools(self) -> bool:
        return True

    def checkAvailable(self) -> bool:
        import requests

        try:
            resp = requests.get(f"{OLLAMA_DEFAULT_URL}/api/tags", timeout=2)
            return resp.status_code == 200
        except (requests.ConnectionError, requests.Timeout):
            return False

    def getInstalledModels(self) -> list[str]:
        import requests

        try:
            resp = requests.get(f"{OLLAMA_DEFAULT_URL}/api/tags", timeout=2)
            data = resp.json()
            names = []
            for m in data.get("models", []):
                name = m["name"]
                if name.endswith(":latest"):
                    name = name[:-7]
                names.append(name)
            return names
        except (requests.RequestException, AttributeError, KeyError, OSError, TypeError, ValueError):
            return []

    def preload(self) -> bool:
        import requests

        try:
            resp = requests.post(
                f"{OLLAMA_DEFAULT_URL}/api/generate",
                json={"model": self.resolvedModel, "prompt": "", "keep_alive": -1, "stream": False},
                timeout=60,
            )
            return resp.status_code == 200
        except (requests.ConnectionError, requests.Timeout):
            return False

    def _getClient(self):
        if self._client is None:
            if not self.checkAvailable():
                raise ConnectionError(
                    f"Cannot connect to Ollama server ({OLLAMA_DEFAULT_URL}). "
                    "Make sure Ollama is installed and running."
                )
            try:
                from openai import OpenAI
            except ImportError:
                raise ImportError("openai package is required.\n  uv add codaro[ai]")
            self._client = OpenAI(base_url=self._baseUrl, api_key="ollama")
        return self._client

    def complete(self, messages: list[dict[str, str]]) -> LLMResponse:
        client = self._getClient()
        response = client.chat.completions.create(
            model=self.resolvedModel,
            messages=messages,
            temperature=self.config.temperature,
        )
        return LLMResponse(
            answer=response.choices[0].message.content or "",
            provider="ollama",
            model=self.resolvedModel,
        )

    def stream(self, messages: list[dict[str, str]]) -> Generator[str, None, None]:
        client = self._getClient()
        response = client.chat.completions.create(
            model=self.resolvedModel,
            messages=messages,
            temperature=self.config.temperature,
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
        }
        if tools:
            kwargs["tools"] = tools

        response = client.chat.completions.create(**kwargs)
        choice = response.choices[0]

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
            provider="ollama",
            model=self.resolvedModel,
            toolCalls=toolCalls,
            finishReason=choice.finish_reason or "stop",
        )
