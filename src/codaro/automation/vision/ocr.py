from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Protocol, runtime_checkable

from .capture import Frame, Region


@dataclass(slots=True)
class TextRegion:
    text: str
    confidence: float
    bbox: Region

    def serialize(self) -> dict[str, Any]:
        return {
            "text": self.text,
            "confidence": round(self.confidence, 3),
            "bbox": {
                "x": self.bbox.x,
                "y": self.bbox.y,
                "width": self.bbox.width,
                "height": self.bbox.height,
            },
        }


@runtime_checkable
class OcrEngine(Protocol):

    def readText(self, frame: Frame, region: Region | None = None) -> list[TextRegion]: ...

    def readLines(self, frame: Frame) -> list[str]: ...

    def dispose(self) -> None: ...
