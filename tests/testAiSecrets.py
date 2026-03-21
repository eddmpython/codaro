from __future__ import annotations

import json
import tempfile
from pathlib import Path

import pytest

from codaro.ai.secrets import SecretStore, SecretStoreError


@pytest.fixture
def tmpStore(tmp_path):
    path = tmp_path / "secrets.json"
    return SecretStore(path=path)


class TestSecretStore:
    def test_get_nonexistent(self, tmpStore):
        assert tmpStore.get("missing") is None

    def test_set_and_get(self, tmpStore):
        tmpStore.set("api_key", "sk-test-12345")
        result = tmpStore.get("api_key")
        assert result == "sk-test-12345"

    def test_has(self, tmpStore):
        assert tmpStore.has("key") is False
        tmpStore.set("key", "value")
        assert tmpStore.has("key") is True

    def test_delete(self, tmpStore):
        tmpStore.set("key", "value")
        assert tmpStore.has("key") is True
        tmpStore.delete("key")
        assert tmpStore.has("key") is False

    def test_delete_nonexistent(self, tmpStore):
        tmpStore.delete("nonexistent")

    def test_multiple_keys(self, tmpStore):
        tmpStore.set("key1", "value1")
        tmpStore.set("key2", "value2")
        assert tmpStore.get("key1") == "value1"
        assert tmpStore.get("key2") == "value2"

    def test_overwrite(self, tmpStore):
        tmpStore.set("key", "old")
        tmpStore.set("key", "new")
        assert tmpStore.get("key") == "new"

    def test_unicode(self, tmpStore):
        tmpStore.set("key", "한국어 테스트 🎉")
        assert tmpStore.get("key") == "한국어 테스트 🎉"

    def test_json_operations(self, tmpStore):
        data = {"access_token": "abc", "expires_in": 3600}
        tmpStore.setJson("oauth_token", data)
        result = tmpStore.getJson("oauth_token")
        assert result == data

    def test_json_get_nonexistent(self, tmpStore):
        assert tmpStore.getJson("missing") is None

    def test_persistence(self, tmp_path):
        path = tmp_path / "secrets.json"
        store1 = SecretStore(path=path)
        store1.set("persistent", "value")

        store2 = SecretStore(path=path)
        assert store2.get("persistent") == "value"

    def test_corrupt_json_raises(self, tmp_path):
        path = tmp_path / "secrets.json"
        path.write_text("not valid json", encoding="utf-8")
        store = SecretStore(path=path)
        with pytest.raises(SecretStoreError, match="JSON parse failed"):
            store.get("key")

    def test_invalid_format_raises(self, tmp_path):
        path = tmp_path / "secrets.json"
        path.write_text('"just a string"', encoding="utf-8")
        store = SecretStore(path=path)
        with pytest.raises(SecretStoreError, match="format is invalid"):
            store.get("key")

    def test_creates_parent_dirs(self, tmp_path):
        path = tmp_path / "nested" / "deep" / "secrets.json"
        store = SecretStore(path=path)
        store.set("key", "value")
        assert store.get("key") == "value"
        assert path.exists()
