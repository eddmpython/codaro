from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any, Protocol, runtime_checkable


@dataclass(slots=True)
class InputAction:
    actionType: str
    parameters: dict[str, Any] = field(default_factory=dict)
    timestamp: float = field(default_factory=time.time)

    def serialize(self) -> dict[str, Any]:
        return {
            "actionType": self.actionType,
            "parameters": self.parameters,
            "timestamp": self.timestamp,
        }


@runtime_checkable
class InputController(Protocol):

    def moveTo(self, x: int, y: int, duration: float = 0.1) -> None: ...

    def click(self, x: int, y: int, button: str = "left", clicks: int = 1) -> None: ...

    def typeText(self, text: str, interval: float = 0.02) -> None: ...

    def hotkey(self, *keys: str) -> None: ...

    def scroll(self, clicks: int, x: int | None = None, y: int | None = None) -> None: ...

    def mousePosition(self) -> tuple[int, int]: ...

    def dragTo(self, x: int, y: int, duration: float = 0.3) -> None: ...

    def dispose(self) -> None: ...
