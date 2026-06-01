from __future__ import annotations

from codaro.outputDescriptor import isDescriptorPayload, ui
from codaro.kernel.protocol import UiEventRequest
from codaro.kernel.uiEventFlow import handleKernelUiEvent, jsonSafeUiEventResult, reactiveTriggerFromUiEventResult
from codaro.uiCallbacks import callbackCount, invokeCallback, resetCallbacks


def setUp() -> None:
    resetCallbacks()


def testButtonRegistersClickCallback() -> None:
    setUp()
    fired: list[str] = []
    descriptor = ui.button("증가", onClick=lambda: fired.append("clicked"))

    assert isDescriptorPayload(descriptor)
    assert descriptor["type"] == "ui"
    assert descriptor["component"] == "button"
    events = descriptor.get("events", {})
    assert "click" in events
    callbackId = events["click"]
    assert isinstance(callbackId, str)
    assert callbackId.startswith("cb_")

    invokeCallback(callbackId)
    assert fired == ["clicked"]


def testCheckboxChangeCallbackReceivesPayload() -> None:
    setUp()
    received: list[object] = []
    descriptor = ui.checkbox(False, label="동의", onChange=lambda value: received.append(value))

    callbackId = descriptor["events"]["change"]
    invokeCallback(callbackId, True)
    invokeCallback(callbackId, False)

    assert received == [True, False]


def testSliderEventsBindWithMinMaxStep() -> None:
    setUp()
    received: list[float] = []
    descriptor = ui.slider(0, 200, value=10, step=5, onChange=lambda value: received.append(float(value)))

    assert descriptor["component"] == "slider"
    assert descriptor["min"] == 0
    assert descriptor["max"] == 200
    assert descriptor["value"] == 10
    invokeCallback(descriptor["events"]["change"], 42)
    assert received == [42.0]


def testDropdownDefaultSelectsFirstOption() -> None:
    setUp()
    received: list[str] = []
    descriptor = ui.dropdown(["red", "green", "blue"], onChange=lambda value: received.append(value))

    assert descriptor["value"] == "red"
    assert descriptor["options"] == ["red", "green", "blue"]
    invokeCallback(descriptor["events"]["change"], "blue")
    assert received == ["blue"]


def testNoCallbackKeepsDescriptorPureData() -> None:
    setUp()
    descriptor = ui.text("hello", label="이름")
    assert "events" not in descriptor or descriptor["events"] == {}


def testResetCallbacksClearsRegistry() -> None:
    setUp()
    ui.button("a", onClick=lambda: None)
    ui.button("b", onClick=lambda: None)
    assert callbackCount() == 2
    resetCallbacks()
    assert callbackCount() == 0


def testInvalidCallbackRaises() -> None:
    setUp()
    raised = False
    try:
        invokeCallback("cb_nonexistent")
    except KeyError:
        raised = True
    assert raised


def testKernelUiEventFlowReturnsReactiveTrigger() -> None:
    setUp()
    descriptor = ui.button(
        "run",
        onClick=lambda: {
            "reactiveTrigger": ["cell-1", "", 2],
            "other": object(),
        },
    )

    response = handleKernelUiEvent(UiEventRequest(callbackId=descriptor["events"]["click"], eventType="click"))

    assert response.status == "ok"
    assert response.callbackId == descriptor["events"]["click"]
    assert response.reactiveTrigger == ["cell-1", "2"]
    assert isinstance(response.result, dict)
    assert response.result["other"].startswith("<object object")


def testKernelUiEventFlowReturnsCallbackErrorResponse() -> None:
    setUp()
    descriptor = ui.button("fail", onClick=lambda: (_ for _ in ()).throw(ValueError("bad input")))

    response = handleKernelUiEvent(UiEventRequest(callbackId=descriptor["events"]["click"], eventType="click"))

    assert response.status == "error"
    assert response.error == "bad input"


def testKernelUiEventHelpersNormalizePayloads() -> None:
    assert jsonSafeUiEventResult({"x": object(), "items": (1, object())})["items"][1].startswith("<object object")
    assert reactiveTriggerFromUiEventResult({"reactiveTrigger": ["a", "", None]}) == ["a", "None"]
    assert reactiveTriggerFromUiEventResult({"reactiveTrigger": "a"}) == []


def testCustomDescriptorShape() -> None:
    from codaro.outputDescriptor import custom, isDescriptorPayload
    descriptor = custom("counter-card", {"value": 5, "label": "합계"})
    assert isDescriptorPayload(descriptor)
    assert descriptor["type"] == "custom"
    assert descriptor["name"] == "counter-card"
    assert descriptor["props"] == {"value": 5, "label": "합계"}


def testCustomDescriptorRejectsEmptyName() -> None:
    from codaro.outputDescriptor import custom
    raised = False
    try:
        custom("")
    except ValueError:
        raised = True
    assert raised


def testCallableTypeGuard() -> None:
    setUp()
    raised = False
    try:
        ui.button("x", onClick="not callable")  # type: ignore[arg-type]
    except TypeError:
        raised = True
    assert raised


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test") and callable(fn):
            fn()
            print(f"ok {name}")
