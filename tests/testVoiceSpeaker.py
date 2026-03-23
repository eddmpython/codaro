from __future__ import annotations

from codaro.automation.voice.speaker import VoiceSpeaker
from codaro.automation.voice.pyttsx3Speaker import Pyttsx3Speaker


def testPyttsx3SpeakerProtocolCompliance() -> None:
    assert hasattr(Pyttsx3Speaker, "speak")
    assert hasattr(Pyttsx3Speaker, "setVoice")
    assert hasattr(Pyttsx3Speaker, "listVoices")
    assert hasattr(Pyttsx3Speaker, "dispose")


def testPyttsx3SpeakerDisposeBeforeInit() -> None:
    speaker = Pyttsx3Speaker()
    speaker.dispose()
    assert speaker._engine is None
