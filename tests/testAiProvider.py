from __future__ import annotations

import asyncio

import pytest

from codaro.ai.completion import (
    CodeCompletionRequest,
    buildCompletionMessages,
    completeCode,
    completeCodeFromRequest,
    completionTextFromAnswer,
)
from codaro.ai.conversation import ConversationManager
from codaro.ai.providerModels import DEFAULT_OPENAI_CHAT_MODELS, filterOpenaiChatModelIds, providerModelList
from codaro.ai.providerErrors import providerErrorDiagnostic
from codaro.ai.profile import AiProfileManager
from codaro.ai.providerValidation import providerValidationConfig, validateProviderConnection
from codaro.ai.oauthFlow import OAuthLoginFlow
from codaro.ai.oauthToken import TokenExchangeError, TokenRefreshError
from codaro.ai.secrets import SecretStore
from codaro.ai.teacher import TeacherRuntimeTurnRequest, prepareTeacherRuntimeTurnFromRequest, runTeacherChatLoop
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
from codaro.ai.providers import oauthChatgptProvider as oauthProviderModule
from codaro.ai.providers.oauthChatgptProvider import ChatGPTOAuthError, OAuthChatGPTProvider, _parseSseResponseDetailed
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


class _InstalledModelsProvider:
    def __init__(self, models: list[str]) -> None:
        self.models = models

    def getInstalledModels(self) -> list[str]:
        return self.models


class _ValidationProvider:
    def __init__(self, available: bool = True) -> None:
        self.available = available
        self.resolvedModel = "validated-model"

    def checkAvailable(self) -> bool:
        return self.available


class _ResponseValidationProvider(_ValidationProvider):
    def __init__(self, answer: str = "검증되었습니다.") -> None:
        super().__init__(available=True)
        self.answer = answer
        self.messages: list[dict[str, str]] = []

    def complete(self, messages: list[dict[str, str]]) -> LLMResponse:
        self.messages = messages
        return LLMResponse(answer=self.answer, provider="custom", model=self.resolvedModel)


class _OAuthResponse:
    def __init__(self, statusCode: int, text: str = "") -> None:
        self.status_code = statusCode
        self.text = text
        self.encoding = "utf-8"

    def json(self):
        return {}


class _ResolvedProfileManager:
    def __init__(self, resolved: dict[str, object]) -> None:
        self.resolved = resolved

    def resolve(self, provider: str | None = None, *, role: str | None = None):
        del provider, role
        return self.resolved


class _OAuthProfileManager:
    def __init__(self) -> None:
        self.updates: list[dict[str, str]] = []

    def update(self, *, provider: str, updatedBy: str):
        self.updates.append({"provider": provider, "updatedBy": updatedBy})


class _OAuthE2EProvider:
    supportsNativeTools = False

    def complete(self, messages: list[dict[str, str]]) -> LLMResponse:
        return LLMResponse(answer="OAuth provider answer", provider="oauth-chatgpt", model="oauth-model")


class _OAuthE2EProviderFactory:
    def __init__(self) -> None:
        self.config: LLMConfig | None = None

    def __call__(self, config: LLMConfig) -> _OAuthE2EProvider:
        self.config = config
        return _OAuthE2EProvider()


class _NoSessionManager:
    def getSession(self, sessionId: str):
        del sessionId
        return None


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


class TestProviderModels:
    def test_ollama_model_list_uses_provider_capability(self):
        def providerFactory(config: LLMConfig):
            assert config.provider == "ollama"
            return _InstalledModelsProvider(["llama3.2", "codellama"])

        models = providerModelList(
            "ollama",
            profileManager=_CompletionProfileManager(),
            providerFactory=providerFactory,
        )

        assert models == ["llama3.2", "codellama"]

    def test_openai_model_list_uses_fallback_when_fetch_empty(self):
        models = providerModelList(
            "openai",
            profileManager=_CompletionProfileManager(),
            openaiModelFetcher=lambda profileManager: [],
        )

        assert models == list(DEFAULT_OPENAI_CHAT_MODELS)

    def test_openai_model_filter_keeps_chat_models_sorted(self):
        models = filterOpenaiChatModelIds([
            "text-embedding-3-large",
            "gpt-4.1-audio-preview",
            "o3",
            "gpt-4.1-mini",
            "custom-model",
        ])

        assert models == ["gpt-4.1-mini", "o3"]


class TestProviderValidation:
    def test_validation_config_uses_profile_and_model_override(self):
        profileManager = _CompletionProfileManager()

        config = providerValidationConfig("custom", "override-model", profileManager)

        assert config.provider == "custom"
        assert config.model == "override-model"
        assert config.apiKey == "secret"
        assert config.baseUrl == "http://local.test"
        assert profileManager.resolvedProvider == "custom"

    def test_validate_provider_returns_payload(self):
        configs: list[LLMConfig] = []

        def providerFactory(config: LLMConfig):
            configs.append(config)
            return _ValidationProvider()

        result = validateProviderConnection(
            provider="custom",
            profileManager=_CompletionProfileManager(),
            providerFactory=providerFactory,
        )

        assert result.payload() == {"valid": True, "model": "validated-model"}
        assert configs[0].provider == "custom"
        assert configs[0].model == "completion-model"

    def test_validation_config_uses_env_api_key(self, monkeypatch):
        monkeypatch.setenv("OPENAI_API_KEY", "env-secret")
        profileManager = _ResolvedProfileManager({
            "provider": "openai",
            "model": "gpt-test",
            "apiKey": None,
            "baseUrl": None,
        })

        config = providerValidationConfig("openai", None, profileManager)

        assert config.apiKey == "env-secret"
        assert config.temperature == 0
        assert config.maxTokens == 64

    def test_validate_provider_captures_connection_errors(self):
        def providerFactory(config: LLMConfig):
            raise ConnectionError("not reachable")

        result = validateProviderConnection(
            provider="custom",
            profileManager=_CompletionProfileManager(),
            providerFactory=providerFactory,
        )

        payload = result.payload()
        assert payload["valid"] is False
        assert payload["error"] == "not reachable"
        assert payload["diagnostic"]["code"] == "provider_unavailable"
        assert payload["diagnostic"]["action"] == "check-provider"
        assert payload["diagnostic"]["provider"] == "custom"

    def test_validate_provider_response_probe_calls_provider(self):
        providers: list[_ResponseValidationProvider] = []

        def providerFactory(config: LLMConfig):
            del config
            provider = _ResponseValidationProvider()
            providers.append(provider)
            return provider

        result = validateProviderConnection(
            provider="custom",
            probe="response",
            profileManager=_CompletionProfileManager(),
            providerFactory=providerFactory,
        )

        assert result.payload() == {"valid": True, "model": "validated-model"}
        assert providers[0].messages[0]["role"] == "system"
        assert providers[0].messages[1]["role"] == "user"

    def test_validate_provider_response_probe_rejects_empty_answer(self):
        def providerFactory(config: LLMConfig):
            del config
            return _ResponseValidationProvider(answer="")

        result = validateProviderConnection(
            provider="custom",
            probe="response",
            profileManager=_CompletionProfileManager(),
            providerFactory=providerFactory,
        )

        payload = result.payload()
        assert payload["valid"] is False
        assert payload["diagnostic"]["code"] == "provider_empty_response"
        assert payload["diagnostic"]["action"] == "check-provider"

    def test_validate_provider_rejects_missing_openai_key(self, monkeypatch):
        monkeypatch.delenv("OPENAI_API_KEY", raising=False)
        profileManager = _ResolvedProfileManager({
            "provider": "openai",
            "model": "gpt-test",
            "apiKey": None,
            "baseUrl": None,
        })

        result = validateProviderConnection(
            provider="openai",
            probe="response",
            profileManager=profileManager,
            providerFactory=lambda config: _ValidationProvider(),
        )

        payload = result.payload()
        assert payload["valid"] is False
        assert payload["diagnostic"]["code"] == "provider_credential_missing"
        assert payload["diagnostic"]["action"] == "configure-api-key"

    def test_validate_provider_rejects_missing_custom_base_url(self, monkeypatch):
        monkeypatch.delenv("CODARO_LLM_BASE_URL", raising=False)
        profileManager = _ResolvedProfileManager({
            "provider": "custom",
            "model": "demo",
            "apiKey": "secret",
            "baseUrl": None,
        })

        result = validateProviderConnection(
            provider="custom",
            probe="response",
            profileManager=profileManager,
            providerFactory=lambda config: _ValidationProvider(),
        )

        payload = result.payload()
        assert payload["valid"] is False
        assert payload["diagnostic"]["code"] == "provider_base_url_missing"
        assert payload["diagnostic"]["action"] == "configure-base-url"


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

    def test_completion_request_owns_payload_shape(self):
        request = CodeCompletionRequest.fromPayload({
            "prefix": 123,
            "suffix": "\nprint(value)",
            "provider": "custom",
            "context": {"variables": [{"name": "value", "type": "int"}]},
        })

        assert request.prefix == "123"
        assert request.suffix == "\nprint(value)"
        assert request.providerOverride == "custom"
        assert request.context == {"variables": [{"name": "value", "type": "int"}]}

    def test_complete_code_from_request_uses_runtime_request(self):
        profileManager = _CompletionProfileManager()
        providers: list[_CompletionProvider] = []

        def providerFactory(config: LLMConfig):
            provider = _CompletionProvider(config)
            providers.append(provider)
            return provider

        result = completeCodeFromRequest(
            profileManager=profileManager,
            request=CodeCompletionRequest(prefix="value = ", providerOverride="custom"),
            providerFactory=providerFactory,
        )

        assert result.payload()["completions"] == ["value + 1"]
        assert profileManager.resolvedProvider == "custom"
        assert providers[0].config.provider == "custom"


class TestOAuthChatGPTTools:
    def test_oauth_provider_supports_native_tools(self):
        provider = OAuthChatGPTProvider(LLMConfig(provider="oauth-chatgpt"))

        assert provider.supportsNativeTools is True

    def test_refresh_network_failure_keeps_network_action(self, monkeypatch):
        def failToken():
            raise TokenRefreshError("network", "OpenAI auth server response timeout.")

        monkeypatch.setattr(oauthProviderModule.oauthToken, "getValidToken", failToken)
        provider = OAuthChatGPTProvider(LLMConfig(provider="oauth-chatgpt"))

        with pytest.raises(ChatGPTOAuthError) as excinfo:
            provider.checkAvailable()

        diagnostic = providerErrorDiagnostic(excinfo.value)
        assert diagnostic.code == "provider_network_error"
        assert diagnostic.action == "check-network"
        assert diagnostic.provider == "oauth-chatgpt"

    def test_refresh_expired_failure_keeps_relogin_action(self, monkeypatch):
        def failToken():
            raise TokenRefreshError("expired", "refresh_token expired. Re-login required.")

        monkeypatch.setattr(oauthProviderModule.oauthToken, "getValidToken", failToken)
        provider = OAuthChatGPTProvider(LLMConfig(provider="oauth-chatgpt"))

        with pytest.raises(ChatGPTOAuthError) as excinfo:
            provider.checkAvailable()

        diagnostic = providerErrorDiagnostic(excinfo.value)
        assert diagnostic.code == "provider_relogin_required"
        assert diagnostic.action == "relogin-provider"
        assert diagnostic.provider == "oauth-chatgpt"

    def test_retry_refresh_network_failure_keeps_network_action(self, monkeypatch):
        monkeypatch.setattr(oauthProviderModule.oauthToken, "getAccountId", lambda: None)
        monkeypatch.setattr(
            oauthProviderModule.oauthToken,
            "refreshAccessToken",
            lambda: (_ for _ in ()).throw(TokenRefreshError("network", "Cannot connect to auth server.")),
        )
        monkeypatch.setattr(
            oauthProviderModule.requests,
            "post",
            lambda *args, **kwargs: _OAuthResponse(401, "expired"),
        )
        provider = OAuthChatGPTProvider(LLMConfig(provider="oauth-chatgpt"))

        with pytest.raises(ChatGPTOAuthError) as excinfo:
            provider._requestWithRetry("old-token", {"input": []})

        diagnostic = providerErrorDiagnostic(excinfo.value)
        assert diagnostic.code == "provider_network_error"
        assert diagnostic.action == "check-network"

    def test_retry_second_request_network_failure_is_diagnostic(self, monkeypatch):
        monkeypatch.setattr(oauthProviderModule.oauthToken, "getAccountId", lambda: None)
        monkeypatch.setattr(oauthProviderModule.oauthToken, "refreshAccessToken", lambda: {"access_token": "new-token"})
        authorizations: list[str] = []

        def fakePost(url, *, headers, json, stream, timeout):
            del url, json, stream, timeout
            authorizations.append(headers["Authorization"])
            if len(authorizations) == 1:
                return _OAuthResponse(401, "expired")
            raise oauthProviderModule.requests.ConnectionError("network down")

        monkeypatch.setattr(oauthProviderModule.requests, "post", fakePost)
        provider = OAuthChatGPTProvider(LLMConfig(provider="oauth-chatgpt"))

        with pytest.raises(ChatGPTOAuthError) as excinfo:
            provider._requestWithRetry("old-token", {"input": []})

        diagnostic = providerErrorDiagnostic(excinfo.value)
        assert authorizations == ["Bearer old-token", "Bearer new-token"]
        assert diagnostic.code == "provider_network_error"
        assert diagnostic.action == "check-network"

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


class TestOAuthLoginFlow:
    def test_authorize_and_callback_success(self):
        exchanged: list[tuple[str, str]] = []
        profileManager = _OAuthProfileManager()
        flow = OAuthLoginFlow(
            authUrlBuilder=lambda: ("http://auth.test", "verifier-test", "state-test"),
            codeExchanger=lambda code, verifier: exchanged.append((code, verifier)) or {},
            profileManagerFactory=lambda: profileManager,
            tokenRevoker=lambda: None,
        )

        assert flow.authorize(startServer=False) == {"authUrl": "http://auth.test", "state": "state-test"}
        assert flow.status() == {"done": False}

        response = flow.handleCallback("/auth/callback?code=code-test&state=state-test")

        assert response.statusCode == 200
        assert response.title == "Authentication Successful"
        assert flow.status() == {"done": True, "error": None}
        assert exchanged == [("code-test", "verifier-test")]
        assert profileManager.updates == [{"provider": "oauth-chatgpt", "updatedBy": "ui"}]

    def test_callback_rejects_state_mismatch(self):
        flow = OAuthLoginFlow(
            authUrlBuilder=lambda: ("http://auth.test", "verifier-test", "state-test"),
            codeExchanger=lambda code, verifier: {},
            profileManagerFactory=lambda: _OAuthProfileManager(),
            tokenRevoker=lambda: None,
        )
        flow.authorize(startServer=False)

        response = flow.handleCallback("/auth/callback?code=code-test&state=wrong")

        assert response.title == "Provider Login Failed"
        status = flow.status()
        assert status["done"] is True
        assert status["error"] == "state_mismatch"
        assert status["diagnostic"]["code"] == "oauth_state_mismatch"
        assert status["diagnostic"]["action"] == "restart-login"

    def test_callback_reports_token_exchange_network_failure(self):
        flow = OAuthLoginFlow(
            authUrlBuilder=lambda: ("http://auth.test", "verifier-test", "state-test"),
            codeExchanger=lambda code, verifier: (_ for _ in ()).throw(
                TokenExchangeError("network", "Cannot connect to auth server.")
            ),
            profileManagerFactory=lambda: _OAuthProfileManager(),
            tokenRevoker=lambda: None,
        )
        flow.authorize(startServer=False)

        response = flow.handleCallback("/auth/callback?code=code-test&state=state-test")

        assert response.title == "Provider Login Failed"
        status = flow.status()
        assert status["done"] is True
        assert status["error"] == "oauth_network_error"
        assert status["diagnostic"]["code"] == "oauth_network_error"
        assert status["diagnostic"]["action"] == "check-network"

    def test_logout_revokes_token_and_updates_profile(self):
        revoked: list[bool] = []
        profileManager = _OAuthProfileManager()
        flow = OAuthLoginFlow(
            authUrlBuilder=lambda: ("http://auth.test", "verifier-test", "state-test"),
            codeExchanger=lambda code, verifier: {},
            profileManagerFactory=lambda: profileManager,
            tokenRevoker=lambda: revoked.append(True),
        )

        assert flow.logout() == {"ok": True}
        assert revoked == [True]
        assert profileManager.updates == [{"provider": "oauth-chatgpt", "updatedBy": "ui"}]

    def test_callback_success_feeds_teacher_question_path(self, tmp_path):
        secretStore = SecretStore(path=tmp_path / "secrets.json")
        profileManager = AiProfileManager(path=tmp_path / "ai_profile.json", secretStore=secretStore)

        def exchangeCode(code: str, verifier: str) -> dict[str, object]:
            assert (code, verifier) == ("code-test", "verifier-test")
            secretStore.setJson(
                oauthSecretName("oauth-chatgpt"),
                {
                    "access_token": "access-test",
                    "refresh_token": "refresh-test",
                    "expires_at": 4_102_444_800,
                },
            )
            return {"access_token": "access-test"}

        flow = OAuthLoginFlow(
            authUrlBuilder=lambda: ("http://auth.test", "verifier-test", "state-test"),
            codeExchanger=exchangeCode,
            profileManagerFactory=lambda: profileManager,
            tokenRevoker=lambda: None,
        )
        providerFactory = _OAuthE2EProviderFactory()
        convManager = ConversationManager()

        flow.authorize(startServer=False)
        response = flow.handleCallback("/auth/callback?code=code-test&state=state-test")
        runtimeTurn = prepareTeacherRuntimeTurnFromRequest(
            convManager=convManager,
            profileManager=profileManager,
            sessionManager=_NoSessionManager(),
            documentPath=None,
            workspaceRoot=tmp_path,
            request=TeacherRuntimeTurnRequest.fromPayload({
                "message": "현재 provider 상태를 짧게 확인해줘",
                "role": "teacher",
            }),
            providerFactory=providerFactory,
        )
        payload = asyncio.run(runTeacherChatLoop(
            provider=runtimeTurn.turn.provider,
            convManager=convManager,
            conversationId=runtimeTurn.turn.conversationId,
            messages=runtimeTurn.turn.messages,
            tools=runtimeTurn.turn.tools,
            executor=runtimeTurn.executor,
            orchestrator=runtimeTurn.orchestrator,
            clarificationPlan=runtimeTurn.turn.clarificationPlan,
        ))

        assert response.title == "Authentication Successful"
        assert flow.status() == {"done": True, "error": None}
        assert profileManager.serialize()["activeProvider"] == "oauth-chatgpt"
        assert profileManager.serialize()["ready"] is True
        assert providerFactory.config is not None
        assert providerFactory.config.provider == "oauth-chatgpt"
        assert runtimeTurn.turn.role == "teacher"
        assert runtimeTurn.turn.clarificationPlan is None
        assert payload["provider"] == "oauth-chatgpt"
        assert payload["answer"] == "OAuth provider answer"
