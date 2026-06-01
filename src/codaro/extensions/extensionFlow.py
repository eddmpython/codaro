from __future__ import annotations

from typing import Any

from .models import Extension, ExtensionCapability
from .registry import getExtensionRegistry


class ExtensionFlowError(Exception):
    def __init__(self, statusCode: int, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.message = message


def listExtensionsPayload() -> dict[str, Any]:
    registry = getExtensionRegistry()
    return {
        "extensions": [
            extension.serialize()
            for extension in registry.listExtensions()
        ],
        "total": registry.count,
    }


def registerExtensionPayload(
    *,
    name: str,
    version: str = "0.0.0",
    description: str = "",
    author: str = "",
    capabilities: list[str] | None = None,
    entryPoint: str = "",
    config: dict[str, Any] | None = None,
) -> dict[str, Any]:
    extension = Extension(
        name=name,
        version=version,
        description=description,
        author=author,
        capabilities=validExtensionCapabilities(capabilities or []),
        entryPoint=entryPoint,
        config=config or {},
    )
    getExtensionRegistry().register(extension)
    return extension.serialize()


def getExtensionPayload(extensionId: str) -> dict[str, Any]:
    extension = getExtensionRegistry().get(extensionId)
    if extension is None:
        raise ExtensionFlowError(404, "Extension not found")
    return extension.serialize()


def unregisterExtensionPayload(extensionId: str) -> dict[str, bool]:
    removed = getExtensionRegistry().unregister(extensionId)
    if not removed:
        raise ExtensionFlowError(404, "Extension not found")
    return {"ok": True}


def listExtensionsByCapabilityPayload(capability: str) -> dict[str, Any]:
    try:
        parsedCapability = ExtensionCapability(capability)
    except ValueError as exc:
        raise ExtensionFlowError(400, f"Unknown capability: {capability}") from exc
    extensions = getExtensionRegistry().listByCapability(parsedCapability)
    return {"extensions": [extension.serialize() for extension in extensions]}


def validExtensionCapabilities(values: list[str]) -> tuple[ExtensionCapability, ...]:
    return tuple(
        ExtensionCapability(value)
        for value in values
        if value in ExtensionCapability._value2member_map_
    )
