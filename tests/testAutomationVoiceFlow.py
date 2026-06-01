from __future__ import annotations

import asyncio

from codaro.automation.voice.listener import TranscriptionResult
from codaro.automation.voiceFlow import (
    listenAutomationVoicePayload,
    parseAutomationVoiceCommandPayload,
    speakAutomationVoicePayload,
)


class _VoiceEngine:
    def __init__(self, result=None, fail: Exception | None = None) -> None:
        self.result = result
        self.fail = fail
        self.startedLanguage = None
        self.disposed = False

    def startListening(self, language: str = "en") -> None:
        if self.fail:
            raise self.fail
        self.startedLanguage = language

    def stopListening(self):
        return self.result

    def dispose(self) -> None:
        self.disposed = True


class _VoiceSpeaker:
    def __init__(self, fail: Exception | None = None) -> None:
        self.fail = fail
        self.calls = []
        self.disposed = False

    def speak(self, text: str, rate: int = 150) -> None:
        if self.fail:
            raise self.fail
        self.calls.append({"text": text, "rate": rate})

    def dispose(self) -> None:
        self.disposed = True


async def _noSleep(duration: float) -> None:
    del duration


def testVoiceFlowListensAndSerializesTranscription(monkeypatch) -> None:
    engine = _VoiceEngine(result=TranscriptionResult(text="run report", language="en", confidence=0.8))
    monkeypatch.setattr("codaro.automation.voiceFlow.createWhisperEngine", lambda: engine)

    payload = asyncio.run(listenAutomationVoicePayload(
        duration=99,
        language="ko",
        sleep=_noSleep,
    ))

    assert payload["text"] == "run report"
    assert payload["confidence"] == 0.8
    assert engine.startedLanguage == "ko"
    assert engine.disposed is True


def testVoiceFlowReportsMissingVoiceDependencies(monkeypatch) -> None:
    engine = _VoiceEngine(fail=ImportError("sounddevice missing"))
    monkeypatch.setattr("codaro.automation.voiceFlow.createWhisperEngine", lambda: engine)

    payload = asyncio.run(listenAutomationVoicePayload(sleep=_noSleep))

    assert payload == {"error": "Voice dependencies not installed: sounddevice missing"}
    assert engine.disposed is True


def testVoiceFlowPreservesToolNoAudioTextField(monkeypatch) -> None:
    monkeypatch.setattr("codaro.automation.voiceFlow.createWhisperEngine", lambda: _VoiceEngine(result=None))

    payload = asyncio.run(listenAutomationVoicePayload(
        includeEmptyText=True,
        sleep=_noSleep,
    ))

    assert payload == {"error": "No audio captured", "text": ""}


def testVoiceFlowSpeaksAndDisposes(monkeypatch) -> None:
    speaker = _VoiceSpeaker()
    monkeypatch.setattr("codaro.automation.voiceFlow.createVoiceSpeaker", lambda: speaker)

    payload = speakAutomationVoicePayload(text="done", rate=180)

    assert payload == {"spoken": True, "text": "done", "rate": 180}
    assert speaker.calls == [{"text": "done", "rate": 180}]
    assert speaker.disposed is True


def testVoiceFlowParsesCommandPayload() -> None:
    payload = parseAutomationVoiceCommandPayload("click on Save")

    assert payload["command"]["commandType"] == "click"
    assert payload["action"] == {"tool": "click-element", "args": {"text": "Save"}}
    assert parseAutomationVoiceCommandPayload("") == {"error": "Empty text"}
