from __future__ import annotations

import pytest

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
