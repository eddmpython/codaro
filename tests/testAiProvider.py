from __future__ import annotations

import pytest

from codaro.ai.completion import buildCompletionMessages, completeCode, completionTextFromAnswer
from codaro.ai.types import LLMConfig, LLMResponse, ToolCall, ToolResponse
from codaro.ai.factory import createProvider, availableProviders, registerProvider
from codaro.ai.providerSpec import (
    getProviderSpec,
    normalizeProvider,
    publicProviderIds,
    buildProviderCatalog,
    apiKeySecretName,
    oauthSecretName,
    normalizeRole,
    AI_ROLES,
)
from codaro.ai.baseProvider import BaseProvider
from codaro.ai.providers.oauthChatgptProvider import OAuthChatGPTProvider, _parseSseResponseDetailed
from codaro.ai.tools import toolManifest


class _CompletionProfileManager:
    def __init__(self) -> None:
        self.resolvedProvider: str | None = None
        self.resolvedRole: str | None = None

    def resolve(self, provider: str | None = None, *, role: str | None = None):
        self.resolvedProvider = provider
        self.resolvedRole = role
        return {
            "provider": "custom",
            "model": "completion-model",
            "apiKey": "secret",
            "baseUrl": "http://local.test",
        }


class _CompletionProvider:
    def __init__(self, config: LLMConfig) -> None:
        self.config = config
        self.messages: list[dict[str, str]] = []

    def complete(self, messages: list[dict[str, str]]) -> LLMResponse:
        self.messages = messages
        return LLMResponse(answer="```python\nvalue + 1\n```", provider=self.config.provider, model=self.config.model)


class TestLLMConfig:
    def test_defaults(self):
        config = LLMConfig()
        assert config.provider == "openai"
        assert config.model is None
        assert config.temperature == 0.3
        assert config.maxTokens == 4096

    def test_merge(self):
        config = LLMConfig(provider="openai", temperature=0.5)
        merged = config.merge({"model": "gpt-4o", "temperature": 0.7})
        assert merged.model == "gpt-4o"
        assert merged.temperature == 0.7
        assert merged.provider == "openai"

    def test_merge_ignores_none(self):
        config = LLMConfig(model="gpt-4o")
        merged = config.merge({"model": None})
        assert merged.model == "gpt-4o"


class TestProviderSpec:
    def test_known_providers(self):
        for name in ("openai", "ollama", "custom", "oauth-chatgpt"):
            spec = getProviderSpec(name)
            assert spec is not None
            assert spec.id == name

    def test_unknown_provider(self):
        spec = getProviderSpec("nonexistent")
        assert spec is None

    def test_normalize_provider(self):
        assert normalizeProvider("openai") == "openai"
        assert normalizeProvider("  ollama  ") == "ollama"
        assert normalizeProvider(None) is None

    def test_public_provider_ids(self):
        ids = publicProviderIds()
        assert isinstance(ids, tuple)
        assert "openai" in ids
        assert "ollama" in ids

    def test_build_catalog(self):
        catalog = buildProviderCatalog()
        assert isinstance(catalog, list)
        assert len(catalog) > 0
        for item in catalog:
            assert "id" in item
            assert "label" in item
            assert "authKind" in item

    def test_secret_names(self):
        assert apiKeySecretName("openai") == "provider:openai:api_key"
        assert oauthSecretName("oauth-chatgpt") == "provider:oauth-chatgpt:oauth"


class TestRoles:
    def test_ai_roles(self):
        assert "teacher" in AI_ROLES
        assert "copilot" in AI_ROLES
        assert "automation" in AI_ROLES

    def test_normalize_role(self):
        assert normalizeRole("teacher") == "teacher"
        assert normalizeRole("  COPILOT  ") == "copilot"
        assert normalizeRole("invalid") is None
        assert normalizeRole(None) is None


class TestFactory:
    def test_available_providers(self):
        providers = availableProviders()
        assert "openai" in providers
        assert "ollama" in providers
        assert "custom" in providers
        assert "oauth-chatgpt" in providers

    def test_create_provider_openai(self):
        config = LLMConfig(provider="openai", apiKey="test-key")
        provider = createProvider(config)
        assert isinstance(provider, BaseProvider)
        assert provider.resolvedModel == "gpt-4o"

    def test_create_provider_custom(self):
        config = LLMConfig(provider="custom", baseUrl="http://localhost:8080/v1")
        provider = createProvider(config)
        assert isinstance(provider, BaseProvider)

    def test_create_provider_ollama(self):
        config = LLMConfig(provider="ollama")
        provider = createProvider(config)
        assert isinstance(provider, BaseProvider)

    def test_create_unknown_provider(self):
        config = LLMConfig()
        config.provider = "nonexistent"
        with pytest.raises(ValueError, match="Unsupported provider"):
            createProvider(config)

    def test_register_provider(self):
        registerProvider("test-prov", "codaro.ai.providers.openaiProvider.OpenAIProvider")
        assert "test-prov" in availableProviders()
        config = LLMConfig()
        config.provider = "test-prov"
        provider = createProvider(config)
        assert isinstance(provider, BaseProvider)


class TestToolResponse:
    def test_tool_response_defaults(self):
        resp = ToolResponse(answer="hello", provider="openai", model="gpt-4o")
        assert resp.toolCalls == []
        assert resp.finishReason == "stop"

    def test_tool_call(self):
        tc = ToolCall(id="call_123", name="insert-block", arguments={"position": 0})
        assert tc.id == "call_123"
        assert tc.name == "insert-block"
        assert tc.arguments == {"position": 0}


class TestToolManifest:
    def test_manifest_groups_tools_for_workbench(self):
        manifest = toolManifest()

        group_ids = {group["id"] for group in manifest["groups"]}
        assert {"workbench", "runtime", "learning", "automation", "safety"}.issubset(group_ids)

        tools = {tool["name"]: tool for tool in manifest["tools"]}
        assert tools["insert-block"]["category"] == "workbench"
        assert tools["execute-reactive"]["category"] == "runtime"
        assert tools["create-notebook-exercise"]["category"] == "learning"
        assert tools["read-cells"]["lane"] == "read"
        assert tools["write-cell"]["lane"] == "write"
        assert tools["cell-call"]["lane"] == "cell-call"
        assert tools["write-curriculum-yaml"]["target"] == "curriculum-yaml"
        assert tools["click-element"]["risk"] == "input"


class TestCompletion:
    def test_build_completion_messages_includes_context(self):
        messages = buildCompletionMessages(
            prefix="value = ",
            suffix="\nprint(value)",
            context={
                "variables": [{"name": "value", "type": "int"}],
                "blocks": [{"type": "code", "content": "value = 10"}],
            },
        )

        assert "Available variables" in messages[0]["content"]
        assert "value: int" in messages[0]["content"]
        assert "Other cells" in messages[0]["content"]
        assert "value = █" in messages[1]["content"]
        assert "print(value)" in messages[1]["content"]

    def test_completion_text_strips_code_fence(self):
        assert completionTextFromAnswer("```python\nvalue + 1\n```") == "value + 1"
        assert completionTextFromAnswer("value + 1") == "value + 1"
        assert completionTextFromAnswer("```") == ""

    def test_complete_code_owns_provider_config_and_payload(self):
        profileManager = _CompletionProfileManager()
        providers: list[_CompletionProvider] = []

        def providerFactory(config: LLMConfig):
            provider = _CompletionProvider(config)
            providers.append(provider)
            return provider

        result = completeCode(
            profileManager=profileManager,
            prefix="value = ",
            suffix="",
            context={"variables": [{"name": "value", "type": "int"}]},
            providerOverride="custom",
            providerFactory=providerFactory,
        )

        assert result.payload() == {
            "completions": ["value + 1"],
            "provider": "custom",
            "model": "completion-model",
        }
        assert profileManager.resolvedProvider == "custom"
        assert profileManager.resolvedRole == "copilot"
        assert providers[0].config.temperature == 0
        assert providers[0].config.maxTokens == 120
        assert "Available variables" in providers[0].messages[0]["content"]


class TestOAuthChatGPTTools:
    def test_oauth_provider_supports_native_tools(self):
        provider = OAuthChatGPTProvider(LLMConfig(provider="oauth-chatgpt"))

        assert provider.supportsNativeTools is True

    def test_parse_responses_function_call_events(self):
        raw = "\n".join(
            [
                'data: {"type":"response.output_item.added","item":{"id":"fc_1","type":"function_call","call_id":"call_1","name":"get-variables"}}',
                'data: {"type":"response.function_call_arguments.delta","item_id":"fc_1","delta":"{\\"limit\\":"}',
                'data: {"type":"response.function_call_arguments.done","item_id":"fc_1","arguments":"{\\"limit\\":5}"}',
                'data: {"type":"response.output_text.delta","delta":"Checking variables."}',
                "data: [DONE]",
            ]
        )

        answer, toolCalls = _parseSseResponseDetailed(raw)

        assert answer == "Checking variables."
        assert len(toolCalls) == 1
        assert toolCalls[0].id == "call_1"
        assert toolCalls[0].name == "get-variables"
        assert toolCalls[0].arguments == {"limit": 5}
