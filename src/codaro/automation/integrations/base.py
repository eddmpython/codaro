from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class IntegrationInfo:
    id: str
    name: str
    category: str
    description: str
    icon: str = ""
    configSchema: dict[str, Any] = field(default_factory=dict)

    def serialize(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "icon": self.icon,
            "configSchema": self.configSchema,
        }


@dataclass(slots=True)
class ConnectionTestResult:
    success: bool
    message: str = ""
    details: dict[str, Any] = field(default_factory=dict)

    def serialize(self) -> dict[str, Any]:
        result: dict[str, Any] = {"success": self.success, "message": self.message}
        if self.details:
            result["details"] = self.details
        return result


class Integration(ABC):

    @abstractmethod
    def info(self) -> IntegrationInfo:
        ...

    @abstractmethod
    def configure(self, config: dict[str, Any]) -> None:
        ...

    @abstractmethod
    def testConnection(self) -> ConnectionTestResult:
        ...

    @abstractmethod
    def execute(self, action: str, params: dict[str, Any]) -> dict[str, Any]:
        ...

    def listActions(self) -> list[dict[str, Any]]:
        return []

    def dispose(self) -> None:
        pass


class IntegrationRegistry:

    def __init__(self) -> None:
        self._integrations: dict[str, Integration] = {}
        self._configs: dict[str, dict[str, Any]] = {}

    def register(self, integration: Integration) -> None:
        integrationInfo = integration.info()
        self._integrations[integrationInfo.id] = integration
        logger.info("Integration registered: %s", integrationInfo.name)

    def unregister(self, integrationId: str) -> bool:
        return self._integrations.pop(integrationId, None) is not None

    def get(self, integrationId: str) -> Integration | None:
        return self._integrations.get(integrationId)

    def listIntegrations(self) -> list[IntegrationInfo]:
        return [i.info() for i in self._integrations.values()]

    def listByCategory(self, category: str) -> list[IntegrationInfo]:
        return [
            i.info() for i in self._integrations.values()
            if i.info().category == category
        ]

    def configure(self, integrationId: str, config: dict[str, Any]) -> bool:
        integration = self._integrations.get(integrationId)
        if integration is None:
            return False
        integration.configure(config)
        self._configs[integrationId] = config
        return True

    def testConnection(self, integrationId: str) -> ConnectionTestResult:
        integration = self._integrations.get(integrationId)
        if integration is None:
            return ConnectionTestResult(success=False, message="Integration not found")
        return integration.testConnection()

    def execute(self, integrationId: str, action: str, params: dict[str, Any]) -> dict[str, Any]:
        integration = self._integrations.get(integrationId)
        if integration is None:
            return {"error": f"Integration not found: {integrationId}"}
        return integration.execute(action, params)

    @property
    def count(self) -> int:
        return len(self._integrations)


_registry: IntegrationRegistry | None = None


def getIntegrationRegistry() -> IntegrationRegistry:
    global _registry
    if _registry is None:
        _registry = IntegrationRegistry()
        _registerBuiltinIntegrations(_registry)
    return _registry


def _registerBuiltinIntegrations(registry: IntegrationRegistry) -> None:
    from .slackIntegration import SlackIntegration
    from .emailIntegration import EmailIntegration
    from .webhookIntegration import WebhookIntegration
    registry.register(SlackIntegration())
    registry.register(EmailIntegration())
    registry.register(WebhookIntegration())
