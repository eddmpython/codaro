from __future__ import annotations

import pytest

from codaro.automation.recorder.actionRecorder import ActionRecorder
from codaro.automation.recordingFlow import (
    AutomationRecordingFlowError,
    getAutomationRecordingStatusPayload,
    startAutomationRecordingPayload,
    stopAutomationRecordingPayload,
)


@pytest.fixture()
def recorder(monkeypatch) -> ActionRecorder:
    fakeRecorder = ActionRecorder()
    monkeypatch.setattr(
        "codaro.automation.recordingFlow.getSharedRecorder",
        lambda: fakeRecorder,
    )
    return fakeRecorder


def testRecordingFlowStartsStopsAndGeneratesRecipe(recorder: ActionRecorder) -> None:
    started = startAutomationRecordingPayload()
    recorder.record("click", {"x": 10, "y": 20})
    recorder.record("typeText", {"text": "hello"})

    stopped = stopAutomationRecordingPayload(title="Demo Recording")

    assert started["status"] == "recording"
    assert started["recordingId"].startswith("rec-")
    assert "guard.click(10, 20)" in stopped["recipe"]
    assert "guard.typeText('hello')" in stopped["recipe"]
    assert stopped["summary"]["title"] == "Demo Recording"
    assert stopped["summary"]["stepCount"] == 2
    assert getAutomationRecordingStatusPayload()["status"] == "idle"


def testRecordingFlowReportsInvalidRecordingState(recorder: ActionRecorder) -> None:
    del recorder

    with pytest.raises(AutomationRecordingFlowError) as excInfo:
        stopAutomationRecordingPayload()

    assert excInfo.value.statusCode == 409
    assert excInfo.value.message == "Not recording"
