from __future__ import annotations

import importlib
import logging
from typing import Any, Callable

from .models import Extension, ExtensionCapability

logger = logging.getLogger(__name__)


class ExtensionRegistry:

    def __init__(self) -> None:
        self._extensions: dict[str, Extension] = {}
        self._hooks: dict[str, list[Callable[..., Any]]] = {}

    def register(self, extension: Extension) -> None:
        self._extensions[extension.id] = extension
        logger.info("Extension registered: %s v%s", extension.name, extension.version)

    def unregister(self, extensionId: str) -> bool:
        if extensionId in self._extensions:
            del self._extensions[extensionId]
            self._hooks.pop(extensionId, None)
            return True
        return False

    def get(self, extensionId: str) -> Extension | None:
        return self._extensions.get(extensionId)

    def listExtensions(self) -> list[Extension]:
        return list(self._extensions.values())

    def listByCapability(self, capability: ExtensionCapability) -> list[Extension]:
        return [
            ext for ext in self._extensions.values()
            if capability in ext.capabilities and ext.enabled
        ]

    @property
    def count(self) -> int:
        return len(self._extensions)

    def loadFromEntryPoint(self, extension: Extension) -> bool:
        if not extension.entryPoint:
            return False
        try:
            modulePath, funcName = extension.entryPoint.rsplit(".", 1)
            module = importlib.import_module(modulePath)
            activateFunc = getattr(module, funcName)
            activateFunc(self, extension)
            return True
        except (ImportError, AttributeError, TypeError) as exc:
            logger.warning(
                "Failed to load extension %s from %s: %s",
                extension.name, extension.entryPoint, exc,
            )
            return False

    def addHook(self, extensionId: str, hook: Callable[..., Any]) -> None:
        if extensionId not in self._hooks:
            self._hooks[extensionId] = []
        self._hooks[extensionId].append(hook)

    def getHooks(self, extensionId: str) -> list[Callable[..., Any]]:
        return self._hooks.get(extensionId, [])


_registry: ExtensionRegistry | None = None


def getExtensionRegistry() -> ExtensionRegistry:
    global _registry
    if _registry is None:
        _registry = ExtensionRegistry()
    return _registry
