from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Protocol, runtime_checkable


@dataclass(slots=True)
class Region:
    x: int
    y: int
    width: int
    height: int

    def asTuple(self) -> tuple[int, int, int, int]:
        return (self.x, self.y, self.x + self.width, self.y + self.height)


@dataclass(slots=True)
class Frame:
    data: bytes
    width: int
    height: int
    channels: int
    timestamp: float = field(default_factory=time.monotonic)
    region: Region | None = None

    @property
    def size(self) -> int:
        return len(self.data)


@runtime_checkable
class ScreenCapture(Protocol):

    def grab(self, region: Region | None = None) -> Frame: ...

    def grabWindow(self, title: str) -> Frame | None: ...

    def fps(self) -> float: ...

    def dispose(self) -> None: ...
