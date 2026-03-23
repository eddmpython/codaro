from __future__ import annotations

import enum
import logging
import time
import uuid
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger(__name__)


class RecordingStatus(enum.Enum):
    IDLE = "idle"
    RECORDING = "recording"
    STOPPED = "stopped"


@dataclass(slots=True)
class RecordedAction:
    actionType: str
    timestamp: float
    parameters: dict[str, Any] = field(default_factory=dict)
    screenshot: str | None = None

    def serialize(self) -> dict[str, Any]:
        result: dict[str, Any] = {
            "actionType": self.actionType,
            "timestamp": self.timestamp,
            "parameters": self.parameters,
        }
        if self.screenshot:
            result["screenshot"] = self.screenshot[:50] + "..."
        return result


class ActionRecorder:

    def __init__(self, captureScreenshots: bool = False) -> None:
        self._recordingId: str | None = None
        self._status = RecordingStatus.IDLE
        self._actions: list[RecordedAction] = []
        self._startTime: float | None = None
        self._captureScreenshots = captureScreenshots

    @property
    def recordingId(self) -> str | None:
        return self._recordingId

    @property
    def status(self) -> RecordingStatus:
        return self._status

    @property
    def actions(self) -> list[RecordedAction]:
        return list(self._actions)

    @property
    def actionCount(self) -> int:
        return len(self._actions)

    def start(self) -> str:
        if self._status == RecordingStatus.RECORDING:
            raise RuntimeError("Already recording")

        self._recordingId = f"rec-{uuid.uuid4().hex[:10]}"
        self._status = RecordingStatus.RECORDING
        self._actions.clear()
        self._startTime = time.monotonic()
        logger.info("Recording started: %s", self._recordingId)
        return self._recordingId

    def record(
        self,
        actionType: str,
        parameters: dict[str, Any] | None = None,
        screenshot: str | None = None,
    ) -> RecordedAction:
        if self._status != RecordingStatus.RECORDING:
            raise RuntimeError("Not recording")

        action = RecordedAction(
            actionType=actionType,
            timestamp=time.monotonic() - (self._startTime or 0),
            parameters=parameters or {},
            screenshot=screenshot,
        )
        self._actions.append(action)
        return action

    def stop(self) -> list[RecordedAction]:
        if self._status != RecordingStatus.RECORDING:
            raise RuntimeError("Not recording")

        self._status = RecordingStatus.STOPPED
        logger.info("Recording stopped: %s (%d actions)", self._recordingId, len(self._actions))
        return list(self._actions)

    def reset(self) -> None:
        self._status = RecordingStatus.IDLE
        self._recordingId = None
        self._actions.clear()
        self._startTime = None

    def serialize(self) -> dict[str, Any]:
        return {
            "recordingId": self._recordingId,
            "status": self._status.value,
            "actionCount": len(self._actions),
            "elapsed": round(time.monotonic() - self._startTime, 1) if self._startTime else 0,
            "actions": [a.serialize() for a in self._actions],
        }
