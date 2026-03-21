from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class ExtensionCapability(str, Enum):
    TOOL = "tool"
    RENDERER = "renderer"
    PANEL = "panel"
    COMMAND = "command"
    PROVIDER = "provider"
    THEME = "theme"


@dataclass(frozen=True)
class Extension:
    id: str = field(default_factory=lambda: f"ext-{uuid.uuid4().hex[:10]}")
    name: str = ""
    version: str = "0.0.0"
    description: str = ""
    author: str = ""
    capabilities: tuple[ExtensionCapability, ...] = ()
    entryPoint: str = ""
    config: dict[str, Any] = field(default_factory=dict)
    enabled: bool = True

    def serialize(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "author": self.author,
            "capabilities": [c.value for c in self.capabilities],
            "entryPoint": self.entryPoint,
            "enabled": self.enabled,
        }
