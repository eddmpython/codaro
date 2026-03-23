from __future__ import annotations

import enum
import logging
import time
from dataclasses import dataclass, field
from typing import Any, Protocol, runtime_checkable

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class TranscriptionResult:
    text: str
    language: str = "en"
    confidence: float = 0.0
    duration: float = 0.0
    segments: list[dict[str, Any]] = field(default_factory=list)
    timestamp: float = field(default_factory=time.time)

    def serialize(self) -> dict[str, Any]:
        return {
            "text": self.text,
            "language": self.language,
            "confidence": round(self.confidence, 3),
            "duration": round(self.duration, 2),
            "segmentCount": len(self.segments),
            "timestamp": self.timestamp,
        }


@runtime_checkable
class VoiceListener(Protocol):

    def startListening(self, language: str = "en") -> None: ...

    def stopListening(self) -> TranscriptionResult | None: ...

    def isListening(self) -> bool: ...

    def transcribeFile(self, filePath: str, language: str = "en") -> TranscriptionResult: ...

    def dispose(self) -> None: ...
