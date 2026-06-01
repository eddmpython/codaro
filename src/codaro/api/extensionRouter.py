from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..extensions.extensionFlow import (
    ExtensionFlowError,
    getExtensionPayload,
    listExtensionsByCapabilityPayload,
    listExtensionsPayload,
    registerExtensionPayload,
    unregisterExtensionPayload,
)


class RegisterExtensionRequest(BaseModel):
    name: str
    version: str = "0.0.0"
    description: str = ""
    author: str = ""
    capabilities: list[str] = Field(default_factory=list)
    entryPoint: str = ""
    config: dict[str, Any] = Field(default_factory=dict)


def createExtensionRouter(state: Any) -> APIRouter:
    router = APIRouter()

    def failExtensionFlow(error: ExtensionFlowError) -> None:
        raise HTTPException(status_code=error.statusCode, detail=error.message)

    @router.get("/api/extensions")
    def apiListExtensions():
        return listExtensionsPayload()

    @router.post("/api/extensions")
    def apiRegisterExtension(req: RegisterExtensionRequest):
        return registerExtensionPayload(
            name=req.name,
            version=req.version,
            description=req.description,
            author=req.author,
            capabilities=req.capabilities,
            entryPoint=req.entryPoint,
            config=req.config,
        )

    @router.get("/api/extensions/{extensionId}")
    def apiGetExtension(extensionId: str):
        try:
            return getExtensionPayload(extensionId)
        except ExtensionFlowError as error:
            failExtensionFlow(error)

    @router.delete("/api/extensions/{extensionId}")
    def apiUnregisterExtension(extensionId: str):
        try:
            return unregisterExtensionPayload(extensionId)
        except ExtensionFlowError as error:
            failExtensionFlow(error)

    @router.get("/api/extensions/capability/{capability}")
    def apiExtensionsByCapability(capability: str):
        try:
            return listExtensionsByCapabilityPayload(capability)
        except ExtensionFlowError as error:
            failExtensionFlow(error)

    return router
