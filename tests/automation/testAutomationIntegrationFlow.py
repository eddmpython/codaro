from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import pytest

from codaro.automation.integrationFlow import (
    AutomationIntegrationFlowError,
    configureAutomationIntegrationPayload,
    executeAutomationIntegrationPayload,
    getAutomationIntegrationPayload,
    listAutomationIntegrationsByCategoryPayload,
    listAutomationIntegrationsPayload,
    runAutomationIntegrationTestPayload,
)


@dataclass(frozen=True)
class FakeIntegrationInfo:
    id: str
    name: str
    category: str

    def serialize(self) -> dict[str, str]:
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
        }


class FakeConnectionResult:
    def serialize(self) -> dict[str, Any]:
        return {"success": True, "message": "ok"}


class FakeIntegration:
    def __init__(self, info: FakeIntegrationInfo) -> None:
        self._info = info

    def info(self) -> FakeIntegrationInfo:
        return self._info

    def listActions(self) -> list[dict[str, Any]]:
        return [{"id": "send", "name": "Send"}]


class FakeIntegrationRegistry:
    def __init__(self) -> None:
        self.integration = FakeIntegration(
            FakeIntegrationInfo(id="slack", name="Slack", category="messaging"),
        )
        self.configured: dict[str, Any] | None = None
        self.executed: dict[str, Any] | None = None

    @property
    def count(self) -> int:
        return 1

    def listIntegrations(self) -> list[FakeIntegrationInfo]:
        return [self.integration.info()]

    def listByCategory(self, category: str) -> list[FakeIntegrationInfo]:
        if category == "messaging":
            return [self.integration.info()]
        return []

    def get(self, integrationId: str) -> FakeIntegration | None:
        if integrationId == "slack":
            return self.integration
        return None

    def configure(self, integrationId: str, config: dict[str, Any]) -> bool:
        if integrationId != "slack":
            return False
        self.configured = {"integrationId": integrationId, "config": config}
        return True

    def testConnection(self, integrationId: str) -> FakeConnectionResult:
        return FakeConnectionResult()

    def execute(
        self,
        integrationId: str,
        action: str,
        params: dict[str, Any],
    ) -> dict[str, Any]:
        self.executed = {
            "integrationId": integrationId,
            "action": action,
            "params": params,
        }
        return {"ok": True, "action": action}


@pytest.fixture()
def registry(monkeypatch) -> FakeIntegrationRegistry:
    fakeRegistry = FakeIntegrationRegistry()
    monkeypatch.setattr(
        "codaro.automation.integrationFlow.getIntegrationRegistry",
        lambda: fakeRegistry,
    )
    return fakeRegistry


def testIntegrationFlowListsAndGetsIntegrations(registry: FakeIntegrationRegistry) -> None:
    expected = {
        "id": "slack",
        "name": "Slack",
        "category": "messaging",
    }

    assert listAutomationIntegrationsPayload() == {
        "integrations": [expected],
        "total": 1,
    }
    assert listAutomationIntegrationsByCategoryPayload("messaging") == {
        "integrations": [expected],
    }
    assert getAutomationIntegrationPayload("slack") == {
        "info": expected,
        "actions": [{"id": "send", "name": "Send"}],
    }


def testIntegrationFlowRaisesForMissingIntegration(
    registry: FakeIntegrationRegistry,
) -> None:
    with pytest.raises(AutomationIntegrationFlowError) as getInfo:
        getAutomationIntegrationPayload("missing")
    with pytest.raises(AutomationIntegrationFlowError) as configureInfo:
        configureAutomationIntegrationPayload("missing", {})

    assert getInfo.value.statusCode == 404
    assert configureInfo.value.statusCode == 404


def testIntegrationFlowConfiguresTestsAndExecutes(
    registry: FakeIntegrationRegistry,
) -> None:
    configured = configureAutomationIntegrationPayload(
        "slack",
        {"url": "https://example.test"},
    )

    assert configured == {
        "ok": True,
        "integrationId": "slack",
    }
    assert registry.configured == {
        "integrationId": "slack",
        "config": {"url": "https://example.test"},
    }

    assert runAutomationIntegrationTestPayload("slack") == {
        "success": True,
        "message": "ok",
    }
    assert executeAutomationIntegrationPayload("slack", "send", {"text": "done"}) == {
        "ok": True,
        "action": "send",
    }
    assert registry.executed == {
        "integrationId": "slack",
        "action": "send",
        "params": {"text": "done"},
    }
