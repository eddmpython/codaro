from __future__ import annotations

from typing import Any

from .integrations.base import getIntegrationRegistry


class AutomationIntegrationFlowError(Exception):
    def __init__(self, statusCode: int, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.message = message


def listAutomationIntegrationsPayload() -> dict[str, Any]:
    registry = getIntegrationRegistry()
    return {
        "integrations": [
            integration.serialize()
            for integration in registry.listIntegrations()
        ],
        "total": registry.count,
    }


def listAutomationIntegrationsByCategoryPayload(category: str) -> dict[str, Any]:
    return {
        "integrations": [
            integration.serialize()
            for integration in getIntegrationRegistry().listByCategory(category)
        ],
    }


def getAutomationIntegrationPayload(integrationId: str) -> dict[str, Any]:
    integration = getIntegrationRegistry().get(integrationId)
    if integration is None:
        raise AutomationIntegrationFlowError(404, "Integration not found")
    return {
        "info": integration.info().serialize(),
        "actions": integration.listActions(),
    }


def configureAutomationIntegrationPayload(
    integrationId: str,
    config: dict[str, Any],
) -> dict[str, Any]:
    success = getIntegrationRegistry().configure(integrationId, config)
    if not success:
        raise AutomationIntegrationFlowError(404, "Integration not found")
    return {"ok": True, "integrationId": integrationId}


def runAutomationIntegrationTestPayload(integrationId: str) -> dict[str, Any]:
    return getIntegrationRegistry().testConnection(integrationId).serialize()


def executeAutomationIntegrationPayload(
    integrationId: str,
    action: str,
    params: dict[str, Any],
) -> dict[str, Any]:
    return getIntegrationRegistry().execute(integrationId, action, params)
