from __future__ import annotations

import logging

from ...errorGuard import safeDispose

logger = logging.getLogger(__name__)


class Pyttsx3Speaker:

    def __init__(self) -> None:
        self._engine = None

    def _ensureEngine(self):
        if self._engine is None:
            import pyttsx3
            self._engine = pyttsx3.init()
        return self._engine

    def speak(self, text: str, rate: int = 150) -> None:
        engine = self._ensureEngine()
        engine.setProperty("rate", rate)
        engine.say(text)
        engine.runAndWait()

    def setVoice(self, voiceId: str) -> None:
        engine = self._ensureEngine()
        engine.setProperty("voice", voiceId)

    def listVoices(self) -> list[dict[str, str]]:
        engine = self._ensureEngine()
        voices = engine.getProperty("voices")
        return [
            {"id": v.id, "name": v.name, "language": ",".join(v.languages) if v.languages else ""}
            for v in voices
        ]

    def dispose(self) -> None:
        if self._engine:
            safeDispose(self._engine, "stop", logger)
            self._engine = None
