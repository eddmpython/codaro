from __future__ import annotations

import json
from pathlib import Path

import pytest

from codaro.ai.profileEvents import PROFILE_CHANGED_EVENT, profileEventFrame, streamProfileChangeEvents
from codaro.ai.profile import AiProfile, AiProfileManager, ProviderProfile, RoleBinding
from codaro.ai.profileMutation import (
    ProfileMutationError,
    ProviderProfileUpdate,
    ProviderSecretUpdate,
    updateProviderProfile,
    updateProviderSecret,
)
from codaro.ai.secrets import SecretStore


@pytest.fixture
def tmpProfile(tmp_path):
    profilePath = tmp_path / "ai_profile.json"
    secretPath = tmp_path / "secrets.json"
    secretStore = SecretStore(path=secretPath)
    return AiProfileManager(path=profilePath, secretStore=secretStore)


def _run(coro):
    import asyncio

    return asyncio.new_event_loop().run_until_complete(coro)


class _ProfileEventManager:
    def __init__(self) -> None:
        self.payload = {"defaultProvider": "openai"}
        self.fingerprintValue = "fp-1"

    def serialize(self):
        return self.payload

    def fingerprint(self):
        return self.fingerprintValue


class TestAiProfileBootstrap:
    def test_bootstrap_on_missing(self, tmpProfile):
        profile = tmpProfile.load()
        assert profile.defaultProvider == "oauth-chatgpt"
        assert profile.version == 2
        assert "teacher" in profile.roles
        assert "copilot" in profile.roles
        assert "automation" in profile.roles

    def test_bootstrap_on_corrupt(self, tmpProfile):
        tmpProfile.path.parent.mkdir(parents=True, exist_ok=True)
        tmpProfile.path.write_text("not json", encoding="utf-8")
        profile = tmpProfile.load()
        assert profile.defaultProvider == "oauth-chatgpt"


class TestAiProfileSaveLoad:
    def test_round_trip(self, tmpProfile):
        profile = tmpProfile.load()
        profile.temperature = 0.8
        profile.maxTokens = 2048
        tmpProfile.save(profile)

        loaded = tmpProfile.load()
        assert loaded.temperature == 0.8
        assert loaded.maxTokens == 2048

    def test_save_creates_file(self, tmpProfile):
        profile = tmpProfile.load()
        tmpProfile.save(profile)
        assert tmpProfile.path.exists()

        data = json.loads(tmpProfile.path.read_text(encoding="utf-8"))
        assert data["version"] == 2
        assert data["defaultProvider"] == "oauth-chatgpt"


class TestAiProfileUpdate:
    def test_update_provider(self, tmpProfile):
        profile = tmpProfile.update(provider="openai", updatedBy="test")
        assert profile.defaultProvider == "openai"
        assert profile.revision == 1

    def test_update_model(self, tmpProfile):
        profile = tmpProfile.update(provider="openai", model="gpt-4o-mini", updatedBy="test")
        settings = profile.providers.get("openai")
        assert settings is not None
        assert settings.model == "gpt-4o-mini"

    def test_update_role(self, tmpProfile):
        profile = tmpProfile.update(role="teacher", provider="ollama", updatedBy="test")
        assert profile.roles["teacher"].provider == "ollama"

    def test_update_invalid_role(self, tmpProfile):
        with pytest.raises(ValueError, match="Unsupported role"):
            tmpProfile.update(role="invalid_role", updatedBy="test")

    def test_update_invalid_provider(self, tmpProfile):
        with pytest.raises(ValueError, match="Unsupported provider"):
            tmpProfile.update(provider="nonexistent", updatedBy="test")

    def test_update_temperature(self, tmpProfile):
        profile = tmpProfile.update(temperature=0.9, updatedBy="test")
        assert profile.temperature == 0.9

    def test_revision_increments(self, tmpProfile):
        p1 = tmpProfile.update(temperature=0.5, updatedBy="test")
        p2 = tmpProfile.update(temperature=0.6, updatedBy="test")
        assert p2.revision == p1.revision + 1


class TestAiProfileResolve:
    def test_resolve_default(self, tmpProfile):
        resolved = tmpProfile.resolve()
        assert resolved["provider"] == "oauth-chatgpt"
        assert "temperature" in resolved
        assert "maxTokens" in resolved

    def test_resolve_explicit_provider(self, tmpProfile):
        resolved = tmpProfile.resolve(provider="ollama")
        assert resolved["provider"] == "ollama"

    def test_resolve_by_role(self, tmpProfile):
        tmpProfile.update(role="teacher", provider="ollama", updatedBy="test")
        resolved = tmpProfile.resolve(role="teacher")
        assert resolved["provider"] == "ollama"


class TestAiProfileSecrets:
    def test_save_and_clear_api_key(self, tmpProfile):
        tmpProfile.saveApiKey("openai", "sk-test-key", updatedBy="test")
        resolved = tmpProfile.resolve(provider="openai")
        assert resolved["apiKey"] == "sk-test-key"

        tmpProfile.clearApiKey("openai", updatedBy="test")
        resolved = tmpProfile.resolve(provider="openai")
        assert resolved["apiKey"] is None

    def test_save_api_key_invalid_provider(self, tmpProfile):
        with pytest.raises(ValueError, match="Unsupported provider"):
            tmpProfile.saveApiKey("nonexistent", "key", updatedBy="test")


class TestAiProfileMutations:
    def test_update_provider_profile_returns_serialized_revision(self, tmpProfile):
        payload = updateProviderProfile(
            tmpProfile,
            ProviderProfileUpdate(provider="openai", model="gpt-4o-mini"),
            updatedBy="test",
        )

        assert payload["defaultProvider"] == "openai"
        assert payload["providers"]["openai"]["model"] == "gpt-4o-mini"
        assert payload["revision"] == 1

    def test_update_provider_profile_rejects_unknown_provider(self, tmpProfile):
        with pytest.raises(ProfileMutationError, match="Unsupported provider"):
            updateProviderProfile(tmpProfile, ProviderProfileUpdate(provider="missing"), updatedBy="test")

    def test_update_provider_secret_requires_api_key_provider(self, tmpProfile):
        with pytest.raises(ProfileMutationError, match="does not use API key secrets"):
            updateProviderSecret(tmpProfile, ProviderSecretUpdate(provider="ollama", apiKey="key"), updatedBy="test")

    def test_update_provider_secret_saves_and_clears(self, tmpProfile):
        saved = updateProviderSecret(
            tmpProfile,
            ProviderSecretUpdate(provider="openai", apiKey="sk-test"),
            updatedBy="test",
        )
        assert saved["providers"]["openai"]["secretConfigured"] is True

        cleared = updateProviderSecret(
            tmpProfile,
            ProviderSecretUpdate(provider="openai", clear=True),
            updatedBy="test",
        )
        assert cleared["providers"]["openai"]["secretConfigured"] is False


class TestAiProfileSerialize:
    def test_serialize(self, tmpProfile):
        data = tmpProfile.serialize()
        assert "defaultProvider" in data
        assert "providers" in data
        assert "roles" in data
        assert "catalog" in data
        assert isinstance(data["catalog"], list)

    def test_fingerprint(self, tmpProfile):
        fp1 = tmpProfile.fingerprint()
        tmpProfile.update(temperature=0.9, updatedBy="test")
        fp2 = tmpProfile.fingerprint()
        assert fp1 != fp2


class TestAiProfileEvents:
    def test_profile_event_frame_uses_stable_sse_shape(self):
        frame = profileEventFrame(PROFILE_CHANGED_EVENT, {"provider": "openai"})

        assert frame == 'event: profile_changed\ndata: {"provider": "openai"}\n\n'

    def test_stream_profile_change_events_emits_fingerprint_changes(self):
        manager = _ProfileEventManager()
        disconnected = False

        async def isDisconnected():
            return disconnected

        async def sleeper(_seconds: float):
            return None

        async def collectOne():
            nonlocal disconnected
            stream = streamProfileChangeEvents(
                manager=manager,
                isDisconnected=isDisconnected,
                sleeper=sleeper,
            )
            first = await stream.__anext__()
            disconnected = True
            try:
                await stream.__anext__()
            except StopAsyncIteration:
                pass
            return first

        assert _run(collectOne()) == 'event: profile_changed\ndata: {"defaultProvider": "openai"}\n\n'
