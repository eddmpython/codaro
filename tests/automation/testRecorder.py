from __future__ import annotations

import pytest

from codaro.automation.recorder.actionRecorder import ActionRecorder, RecordedAction, RecordingStatus
from codaro.automation.recorder.recipeGenerator import RecipeGenerator


def testRecordedActionSerialize() -> None:
    action = RecordedAction(
        actionType="click",
        timestamp=1.5,
        parameters={"x": 100, "y": 200},
    )
    data = action.serialize()
    assert data["actionType"] == "click"
    assert data["timestamp"] == 1.5
    assert data["parameters"]["x"] == 100


def testRecorderStartStop() -> None:
    recorder = ActionRecorder()
    assert recorder.status == RecordingStatus.IDLE

    recordingId = recorder.start()
    assert recorder.status == RecordingStatus.RECORDING
    assert recordingId.startswith("rec-")

    recorder.record("click", {"x": 10, "y": 20})
    recorder.record("typeText", {"text": "hello"})

    actions = recorder.stop()
    assert recorder.status == RecordingStatus.STOPPED
    assert len(actions) == 2
    assert actions[0].actionType == "click"
    assert actions[1].actionType == "typeText"


def testRecorderDoubleStartRaises() -> None:
    recorder = ActionRecorder()
    recorder.start()
    with pytest.raises(RuntimeError):
        recorder.start()


def testRecorderRecordBeforeStartRaises() -> None:
    recorder = ActionRecorder()
    with pytest.raises(RuntimeError):
        recorder.record("click", {})


def testRecorderStopBeforeStartRaises() -> None:
    recorder = ActionRecorder()
    with pytest.raises(RuntimeError):
        recorder.stop()


def testRecorderReset() -> None:
    recorder = ActionRecorder()
    recorder.start()
    recorder.record("click", {"x": 1})
    recorder.stop()
    recorder.reset()

    assert recorder.status == RecordingStatus.IDLE
    assert recorder.actionCount == 0
    assert recorder.recordingId is None


def testRecorderSerialize() -> None:
    recorder = ActionRecorder()
    recorder.start()
    recorder.record("click", {"x": 10})
    data = recorder.serialize()
    assert data["status"] == "recording"
    assert data["actionCount"] == 1
    assert len(data["actions"]) == 1


def testRecipeGeneratorBasic() -> None:
    actions = [
        RecordedAction(actionType="click", timestamp=0.0, parameters={"x": 100, "y": 200}),
        RecordedAction(actionType="typeText", timestamp=0.5, parameters={"text": "hello"}),
        RecordedAction(actionType="hotkey", timestamp=1.0, parameters={"keys": ["ctrl", "s"]}),
    ]
    gen = RecipeGenerator()
    recipe = gen.generate(actions, title="Test Recipe")

    assert "# codaro:app title='Test Recipe'" in recipe
    assert "guard.click(100, 200)" in recipe
    assert "guard.typeText('hello')" in recipe
    assert "guard.hotkey('ctrl', 's')" in recipe
    assert "# %% [automation]" in recipe


def testRecipeGeneratorDict() -> None:
    actions = [
        RecordedAction(actionType="click", timestamp=0.0, parameters={"x": 10}),
    ]
    gen = RecipeGenerator()
    data = gen.generateDict(actions, title="My Recipe")

    assert data["title"] == "My Recipe"
    assert data["stepCount"] == 1
    assert data["steps"][0]["action"] == "click"


def testRecipeGeneratorAllActionTypes() -> None:
    actions = [
        RecordedAction(actionType="click", timestamp=0.0, parameters={"x": 10, "y": 20, "button": "right", "clicks": 2}),
        RecordedAction(actionType="moveTo", timestamp=0.1, parameters={"x": 50, "y": 60}),
        RecordedAction(actionType="scroll", timestamp=0.2, parameters={"clicks": 3, "x": 100, "y": 200}),
        RecordedAction(actionType="dragTo", timestamp=0.3, parameters={"x": 300, "y": 400}),
        RecordedAction(actionType="unknown", timestamp=0.4, parameters={"foo": "bar"}),
    ]
    gen = RecipeGenerator()
    recipe = gen.generate(actions)

    assert "guard.click(10, 20, button='right', clicks=2)" in recipe
    assert "guard.moveTo(50, 60)" in recipe
    assert "guard.scroll(3, x=100, y=200)" in recipe
    assert "guard.dragTo(300, 400)" in recipe
    assert "# Unknown action: unknown" in recipe
