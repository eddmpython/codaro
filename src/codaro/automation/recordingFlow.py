from __future__ import annotations

from typing import Any

from .recorder.recipeGenerator import RecipeGenerator
from .shared import getSharedRecorder


class AutomationRecordingFlowError(Exception):
    def __init__(self, statusCode: int, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.message = message


def startAutomationRecordingPayload() -> dict[str, Any]:
    try:
        recordingId = getSharedRecorder().start()
    except RuntimeError as exc:
        raise AutomationRecordingFlowError(409, str(exc)) from exc
    return {"recordingId": recordingId, "status": "recording"}


def stopAutomationRecordingPayload(*, title: str = "Recorded Automation") -> dict[str, Any]:
    recorder = getSharedRecorder()
    try:
        actions = recorder.stop()
    except RuntimeError as exc:
        raise AutomationRecordingFlowError(409, str(exc)) from exc

    generator = RecipeGenerator()
    recipe = generator.generate(actions, title=title)
    summary = generator.generateDict(actions, title=title)
    recorder.reset()
    return {"recipe": recipe, "summary": summary}


def getAutomationRecordingStatusPayload() -> dict[str, Any]:
    return getSharedRecorder().serialize()
