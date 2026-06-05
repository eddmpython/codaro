from __future__ import annotations

from codaro.ai.providers.openaiProvider import OpenAIProvider
from codaro.ai.providers.ollamaProvider import OllamaProvider
from codaro.ai.baseProvider import BaseProvider
from codaro.ai.toolRegistry import allTools


def testOpenAIProviderSupportsNativeTools() -> None:
    config_obj = type("X", (), {"provider": "openai", "model": "gpt-4o", "apiKey": None, "baseUrl": None, "temperature": 0, "maxTokens": 100})()
    provider = OpenAIProvider(config_obj)
    assert provider.supportsNativeTools is True


def testOllamaProviderSupportsNativeTools() -> None:
    config_obj = type("X", (), {"provider": "ollama", "model": "llama3.1", "apiKey": None, "baseUrl": None, "temperature": 0, "maxTokens": 100})()
    provider = OllamaProvider(config_obj)
    assert provider.supportsNativeTools is True


def testBaseProviderToolMessageHelpers() -> None:
    config_obj = type("X", (), {"provider": "test", "model": None, "apiKey": None, "baseUrl": None, "temperature": 0, "maxTokens": 100})()

    class StubProvider(BaseProvider):
        @property
        def defaultModel(self) -> str:
            return "test-stub"

        def complete(self, messages):  # pragma: no cover
            raise NotImplementedError

        def stream(self, messages):  # pragma: no cover
            raise NotImplementedError

        def checkAvailable(self) -> bool:
            return True

    provider = StubProvider(config_obj)
    tool_msg = provider.formatToolResult("call_42", "result text")
    assert tool_msg["role"] == "tool"
    assert tool_msg["tool_call_id"] == "call_42"
    assert tool_msg["content"] == "result text"


def testToolRegistryHasCoreCellTools() -> None:
    registered = {tool.name for tool in allTools()}
    # 코어 셀/노트북 도구가 다 등록되어 있어야 한다
    expected_subset = {"cell-call", "read-cells", "write-cell", "get-variables"}
    missing = expected_subset - registered
    assert not missing, f"missing core teacher tools: {missing}"


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test") and callable(fn):
            fn()
            print(f"ok {name}")
