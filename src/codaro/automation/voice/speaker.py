from __future__ import annotations

import logging
from typing import Protocol, runtime_checkable

logger = logging.getLogger(__name__)


@runtime_checkable
class VoiceSpeaker(Protocol):

    def speak(self, text: str, rate: int = 150) -> None: ...

    def setVoice(self, voiceId: str) -> None: ...

    def listVoices(self) -> list[dict[str, str]]: ...

    def dispose(self) -> None: ...
