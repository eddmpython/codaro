from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..automation.integrations.base import getIntegrationRegistry

logger = logging.getLogger(__name__)


class ConfigureRequest(BaseModel):
    config: dict[str, Any]


class ExecuteRequest(BaseModel):
    action: str
    params: dict[str, Any] = {}


def createIntegrationRouter(state: Any) -> APIRouter:
    router = APIRouter()

    @router.get("/api/integrations")
    def apiListIntegrations():
        registry = getIntegrationRegistry()
        return {
            "integrations": [i.serialize() for i in registry.listIntegrations()],
            "total": registry.count,
        }

    @router.get("/api/integrations/category/{category}")
    def apiIntegrationsByCategory(category: str):
        registry = getIntegrationRegistry()
        return {
            "integrations": [i.serialize() for i in registry.listByCategory(category)],
        }

    @router.get("/api/integrations/{integrationId}")
    def apiGetIntegration(integrationId: str):
        registry = getIntegrationRegistry()
        integration = registry.get(integrationId)
        if integration is None:
            raise HTTPException(status_code=404, detail="Integration not found")
        return {
            "info": integration.info().serialize(),
            "actions": integration.listActions(),
        }

    @router.post("/api/integrations/{integrationId}/configure")
    def apiConfigureIntegration(integrationId: str, req: ConfigureRequest):
        registry = getIntegrationRegistry()
        success = registry.configure(integrationId, req.config)
        if not success:
            raise HTTPException(status_code=404, detail="Integration not found")
        return {"ok": True, "integrationId": integrationId}

    @router.post("/api/integrations/{integrationId}/test")
    def apiTestIntegration(integrationId: str):
        registry = getIntegrationRegistry()
        result = registry.testConnection(integrationId)
        return result.serialize()

    @router.post("/api/integrations/{integrationId}/execute")
    def apiExecuteIntegration(integrationId: str, req: ExecuteRequest):
        registry = getIntegrationRegistry()
        result = registry.execute(integrationId, req.action, req.params)
        return result

    return router
