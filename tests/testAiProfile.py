from __future__ import annotations

import json
from pathlib import Path

import pytest

from codaro.ai.profile import AiProfile, AiProfileManager, ProviderProfile, RoleBinding
from codaro.ai.secrets import SecretStore


@pytest.fixture
def tmpProfile(tmp_path):
    profilePath = tmp_path / "ai_profile.json"
    secretPath = tmp_path / "secrets.json"
    secretStore = SecretStore(path=secretPath)
    return AiProfileManager(path=profilePath, secretStore=secretStore)


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
