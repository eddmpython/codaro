from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..extensions import ExtensionRegistry, Extension, ExtensionCapability, getExtensionRegistry

logger = logging.getLogger(__name__)


class RegisterExtensionRequest(BaseModel):
    name: str
    version: str = "0.0.0"
    description: str = ""
    author: str = ""
    capabilities: list[str] = []
    entryPoint: str = ""
    config: dict[str, Any] = {}


def createExtensionRouter(state: Any) -> APIRouter:
    router = APIRouter()

    @router.get("/api/extensions")
    def apiListExtensions():
        registry = getExtensionRegistry()
        return {
            "extensions": [e.serialize() for e in registry.listExtensions()],
            "total": registry.count,
        }

    @router.post("/api/extensions")
    def apiRegisterExtension(req: RegisterExtensionRequest):
        registry = getExtensionRegistry()
        caps = tuple(
            ExtensionCapability(c) for c in req.capabilities
            if c in ExtensionCapability._value2member_map_
        )
        extension = Extension(
            name=req.name,
            version=req.version,
            description=req.description,
            author=req.author,
            capabilities=caps,
            entryPoint=req.entryPoint,
            config=req.config,
        )
        registry.register(extension)
        return extension.serialize()

    @router.get("/api/extensions/{extensionId}")
    def apiGetExtension(extensionId: str):
        registry = getExtensionRegistry()
        ext = registry.get(extensionId)
        if ext is None:
            raise HTTPException(status_code=404, detail="Extension not found")
        return ext.serialize()

    @router.delete("/api/extensions/{extensionId}")
    def apiUnregisterExtension(extensionId: str):
        registry = getExtensionRegistry()
        removed = registry.unregister(extensionId)
        if not removed:
            raise HTTPException(status_code=404, detail="Extension not found")
        return {"ok": True}

    @router.get("/api/extensions/capability/{capability}")
    def apiExtensionsByCapability(capability: str):
        registry = getExtensionRegistry()
        try:
            cap = ExtensionCapability(capability)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Unknown capability: {capability}")
        extensions = registry.listByCapability(cap)
        return {"extensions": [e.serialize() for e in extensions]}

    return router
