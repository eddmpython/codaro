from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..automation.integrationFlow import (
    AutomationIntegrationFlowError,
    configureAutomationIntegrationPayload,
    executeAutomationIntegrationPayload,
    getAutomationIntegrationPayload,
    listAutomationIntegrationsByCategoryPayload,
    listAutomationIntegrationsPayload,
    runAutomationIntegrationTestPayload,
)


class ConfigureRequest(BaseModel):
    config: dict[str, Any]


class ExecuteRequest(BaseModel):
    action: str
    params: dict[str, Any] = Field(default_factory=dict)


def createIntegrationRouter(state: Any) -> APIRouter:
    router = APIRouter()

    def failAutomationIntegrationFlow(error: AutomationIntegrationFlowError) -> None:
        raise HTTPException(status_code=error.statusCode, detail=error.message)

    @router.get("/api/integrations")
    def apiListIntegrations():
        return listAutomationIntegrationsPayload()

    @router.get("/api/integrations/category/{category}")
    def apiIntegrationsByCategory(category: str):
        return listAutomationIntegrationsByCategoryPayload(category)

    @router.get("/api/integrations/{integrationId}")
    def apiGetIntegration(integrationId: str):
        try:
            return getAutomationIntegrationPayload(integrationId)
        except AutomationIntegrationFlowError as error:
            failAutomationIntegrationFlow(error)

    @router.post("/api/integrations/{integrationId}/configure")
    def apiConfigureIntegration(integrationId: str, req: ConfigureRequest):
        try:
            return configureAutomationIntegrationPayload(integrationId, req.config)
        except AutomationIntegrationFlowError as error:
            failAutomationIntegrationFlow(error)

    @router.post("/api/integrations/{integrationId}/test")
    def apiTestIntegration(integrationId: str):
        return runAutomationIntegrationTestPayload(integrationId)

    @router.post("/api/integrations/{integrationId}/execute")
    def apiExecuteIntegration(integrationId: str, req: ExecuteRequest):
        return executeAutomationIntegrationPayload(integrationId, req.action, req.params)

    return router
