from __future__ import annotations

import pytest

from codaro.automation.input.inputGuard import InputPolicy
from codaro.automation.inputPolicyFlow import (
    AutomationInputPolicyFlowError,
    getAutomationInputPolicyPayload,
    updateAutomationInputPolicyPayload,
)


class _Guard:
    def __init__(self) -> None:
        self.policy = InputPolicy()


@pytest.fixture()
def guard(monkeypatch) -> _Guard:
    fakeGuard = _Guard()
    monkeypatch.setattr(
        "codaro.automation.inputPolicyFlow.getSharedInputGuard",
        lambda: fakeGuard,
    )
    return fakeGuard


def testInputPolicyFlowSerializesAndUpdatesPolicy(guard: _Guard) -> None:
    initial = getAutomationInputPolicyPayload()

    assert initial["maxActionsPerSecond"] == 10

    updated = updateAutomationInputPolicyPayload({
        "maxActionsPerSecond": "3",
        "maxActionsPerMinute": 30,
        "humanDelay": False,
        "enabled": False,
        "allowedScreenRegion": {"x": 1, "y": 2, "width": 300, "height": 400},
    })

    assert updated["maxActionsPerSecond"] == 3
    assert updated["maxActionsPerMinute"] == 30
    assert updated["humanDelay"] is False
    assert updated["enabled"] is False
    assert updated["allowedScreenRegion"] == {
        "x": 1,
        "y": 2,
        "width": 300,
        "height": 400,
    }
    assert guard.policy.allowedScreenRegion is not None


def testInputPolicyFlowClearsAllowedRegion(guard: _Guard) -> None:
    updateAutomationInputPolicyPayload({
        "allowedScreenRegion": {"x": 1, "y": 2, "width": 3, "height": 4},
    })

    cleared = updateAutomationInputPolicyPayload({"allowedScreenRegion": None})

    assert cleared["allowedScreenRegion"] is None


def testInputPolicyFlowRejectsInvalidRegion(guard: _Guard) -> None:
    del guard

    with pytest.raises(AutomationInputPolicyFlowError) as excInfo:
        updateAutomationInputPolicyPayload({"allowedScreenRegion": {"x": 1}})

    assert excInfo.value.statusCode == 400
