from __future__ import annotations

import logging
import threading
import time
from typing import Any

from ...errorGuard import safeDispose
from .listener import TranscriptionResult

logger = logging.getLogger(__name__)


class WhisperEngine:

    def __init__(
        self,
        modelSize: str = "turbo",
        device: str = "auto",
        computeType: str = "auto",
    ) -> None:
        self._modelSize = modelSize
        self._device = device
        self._computeType = computeType
        self._model = None
        self._listening = False
        self._audioBuffer: list[Any] = []
        self._stream = None
        self._sampleRate = 16000
        self._lock = threading.Lock()

    def _ensureModel(self):
        if self._model is None:
            from faster_whisper import WhisperModel
            logger.info("Loading faster-whisper model: %s", self._modelSize)
            self._model = WhisperModel(
                self._modelSize,
                device=self._device,
                compute_type=self._computeType,
            )
            logger.info("Whisper model loaded")
        return self._model

    def startListening(self, language: str = "en") -> None:
        if self._listening:
            return

        import sounddevice as sd
        import numpy as np

        self._audioBuffer.clear()
        self._language = language
        self._listenStart = time.monotonic()

        def callback(indata, frames, timeInfo, status):
            if status:
                logger.warning("Audio callback status: %s", status)
            self._audioBuffer.append(indata.copy())

        self._stream = sd.InputStream(
            samplerate=self._sampleRate,
            channels=1,
            dtype="float32",
            callback=callback,
            blocksize=int(self._sampleRate * 0.5),
        )
        self._stream.start()
        self._listening = True
        logger.info("Voice listening started (lang=%s)", language)

    def stopListening(self) -> TranscriptionResult | None:
        if not self._listening:
            return None

        with self._lock:
            self._listening = False
            if self._stream:
                self._stream.stop()
                self._stream.close()
                self._stream = None

            if not self._audioBuffer:
                return TranscriptionResult(text="", confidence=0.0)

            import numpy as np
            audio = np.concatenate(self._audioBuffer, axis=0).flatten()
            self._audioBuffer.clear()

        return self._transcribe(audio)

    def isListening(self) -> bool:
        return self._listening

    def transcribeFile(self, filePath: str, language: str = "en") -> TranscriptionResult:
        model = self._ensureModel()
        segments, info = model.transcribe(filePath, language=language, beam_size=5)

        segmentList = []
        textParts = []
        for seg in segments:
            textParts.append(seg.text)
            segmentList.append({
                "start": round(seg.start, 2),
                "end": round(seg.end, 2),
                "text": seg.text.strip(),
            })

        fullText = " ".join(t.strip() for t in textParts).strip()
        return TranscriptionResult(
            text=fullText,
            language=info.language,
            confidence=1.0 - info.language_probability if hasattr(info, "language_probability") else 0.0,
            duration=info.duration if hasattr(info, "duration") else 0.0,
            segments=segmentList,
        )

    def _transcribe(self, audio) -> TranscriptionResult:
        model = self._ensureModel()

        segments, info = model.transcribe(
            audio,
            language=getattr(self, "_language", "en"),
            beam_size=5,
        )

        segmentList = []
        textParts = []
        for seg in segments:
            textParts.append(seg.text)
            segmentList.append({
                "start": round(seg.start, 2),
                "end": round(seg.end, 2),
                "text": seg.text.strip(),
            })

        fullText = " ".join(t.strip() for t in textParts).strip()
        duration = time.monotonic() - getattr(self, "_listenStart", time.monotonic())

        return TranscriptionResult(
            text=fullText,
            language=getattr(info, "language", "en"),
            confidence=getattr(info, "language_probability", 0.0),
            duration=round(duration, 2),
            segments=segmentList,
        )

    def dispose(self) -> None:
        if self._stream:
            safeDispose(self._stream, "stop", logger)
            safeDispose(self._stream, "close", logger)
            self._stream = None
        self._listening = False
        self._audioBuffer.clear()
        self._model = None
