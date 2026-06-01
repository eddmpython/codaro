from __future__ import annotations

import asyncio
from typing import Any, Awaitable, Callable

from .eStop import getEmergencyStop
from .voice.commandParser import CommandParser


SleepFn = Callable[[float], Awaitable[None]]


def createWhisperEngine():
    from .voice.whisperEngine import WhisperEngine
    return WhisperEngine()


def createVoiceSpeaker():
    from .voice.pyttsx3Speaker import Pyttsx3Speaker
    return Pyttsx3Speaker()


async def listenAutomationVoicePayload(
    *,
    duration: float = 5,
    language: str = "en",
    includeEmptyText: bool = False,
    enforceStop: bool = False,
    sleep: SleepFn = asyncio.sleep,
) -> dict[str, Any]:
    if enforceStop:
        getEmergencyStop().check()

    boundedDuration = min(duration, 30)
    engine = createWhisperEngine()
    try:
        engine.startListening(language=language)
        await sleep(boundedDuration)
        result = engine.stopListening()
    except ImportError as exc:
        return {"error": f"Voice dependencies not installed: {exc}"}
    finally:
        engine.dispose()

    if result is None:
        payload = {"error": "No audio captured"}
        if includeEmptyText:
            payload["text"] = ""
        return payload

    return result.serialize()


def speakAutomationVoicePayload(
    *,
    text: str,
    rate: int = 150,
    enforceStop: bool = False,
) -> dict[str, Any]:
    if enforceStop:
        getEmergencyStop().check()

    speaker = createVoiceSpeaker()
    try:
        speaker.speak(text, rate=rate)
    except ImportError as exc:
        return {"error": f"Voice dependencies not installed: {exc}"}
    finally:
        speaker.dispose()

    return {"spoken": True, "text": text, "rate": rate}


def parseAutomationVoiceCommandPayload(text: str) -> dict[str, Any]:
    parser = CommandParser()
    command = parser.parse(text)
    if command is None:
        return {"error": "Empty text"}

    return {
        "command": command.serialize(),
        "action": parser.parseToAction(text),
    }
