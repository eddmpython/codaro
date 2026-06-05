from __future__ import annotations

import time

import pytest

from codaro.automation.vision.capture import Region
from codaro.automation.input.controller import InputAction, InputController
from codaro.automation.input.inputGuard import InputGuard, InputPolicy, RateLimitExceeded, RegionBlocked


class FakeController:

    def __init__(self) -> None:
        self.actions: list[tuple[str, dict]] = []
        self.disposed = False

    def moveTo(self, x: int, y: int, duration: float = 0.1) -> None:
        self.actions.append(("moveTo", {"x": x, "y": y}))

    def click(self, x: int, y: int, button: str = "left", clicks: int = 1) -> None:
        self.actions.append(("click", {"x": x, "y": y, "button": button}))

    def typeText(self, text: str, interval: float = 0.02) -> None:
        self.actions.append(("typeText", {"text": text}))

    def hotkey(self, *keys: str) -> None:
        self.actions.append(("hotkey", {"keys": list(keys)}))

    def scroll(self, clicks: int, x: int | None = None, y: int | None = None) -> None:
        self.actions.append(("scroll", {"clicks": clicks}))

    def mousePosition(self) -> tuple[int, int]:
        return (100, 200)

    def dragTo(self, x: int, y: int, duration: float = 0.3) -> None:
        self.actions.append(("dragTo", {"x": x, "y": y}))

    def dispose(self) -> None:
        self.disposed = True


def _makeGuard(policy: InputPolicy | None = None) -> tuple[InputGuard, FakeController]:
    ctrl = FakeController()
    guard = InputGuard(ctrl, policy)
    return guard, ctrl


def testInputPolicyDefaults() -> None:
    policy = InputPolicy()
    assert policy.maxActionsPerSecond == 10
    assert policy.maxActionsPerMinute == 200
    assert policy.humanDelay is True
    assert policy.enabled is True


def testInputPolicySerialize() -> None:
    policy = InputPolicy(
        allowedScreenRegion=Region(0, 0, 1920, 1080),
        blockedRegions=[Region(0, 1040, 1920, 40)],
    )
    data = policy.serialize()
    assert data["allowedScreenRegion"]["width"] == 1920
    assert len(data["blockedRegions"]) == 1
    assert data["blockedRegions"][0]["y"] == 1040


def testGuardPassesActionsToController() -> None:
    policy = InputPolicy(humanDelay=False, enabled=True)
    guard, ctrl = _makeGuard(policy)

    guard.click(100, 200)
    guard.typeText("hello")
    guard.hotkey("ctrl", "c")

    assert len(ctrl.actions) == 3
    assert ctrl.actions[0] == ("click", {"x": 100, "y": 200, "button": "left"})
    assert ctrl.actions[1] == ("typeText", {"text": "hello"})
    assert ctrl.actions[2] == ("hotkey", {"keys": ["ctrl", "c"]})


def testGuardRecordsActionLog() -> None:
    policy = InputPolicy(humanDelay=False)
    guard, _ = _makeGuard(policy)

    guard.click(50, 60)
    guard.moveTo(70, 80)

    log = guard.actionLog
    assert len(log) == 2
    assert log[0].actionType == "click"
    assert log[1].actionType == "moveTo"


def testRateLimitPerSecond() -> None:
    policy = InputPolicy(maxActionsPerSecond=3, humanDelay=False)
    guard, _ = _makeGuard(policy)

    guard.click(10, 10)
    guard.click(10, 10)
    guard.click(10, 10)

    with pytest.raises(RateLimitExceeded):
        guard.click(10, 10)


def testAllowedRegionBlocks() -> None:
    policy = InputPolicy(
        allowedScreenRegion=Region(0, 0, 800, 600),
        humanDelay=False,
    )
    guard, _ = _makeGuard(policy)

    guard.click(100, 100)

    with pytest.raises(RegionBlocked):
        guard.click(900, 100)


def testBlockedRegion() -> None:
    policy = InputPolicy(
        blockedRegions=[Region(0, 1040, 1920, 40)],
        humanDelay=False,
    )
    guard, _ = _makeGuard(policy)

    guard.click(100, 100)

    with pytest.raises(RegionBlocked):
        guard.click(100, 1050)


def testDisabledPolicySkipsChecks() -> None:
    policy = InputPolicy(
        maxActionsPerSecond=1,
        enabled=False,
        humanDelay=False,
    )
    guard, ctrl = _makeGuard(policy)

    for _ in range(10):
        guard.click(100, 100)

    assert len(ctrl.actions) == 10


def testMousePositionDoesNotRecord() -> None:
    policy = InputPolicy(humanDelay=False)
    guard, _ = _makeGuard(policy)

    pos = guard.mousePosition()
    assert pos == (100, 200)
    assert len(guard.actionLog) == 0


def testDisposeCleans() -> None:
    guard, ctrl = _makeGuard(InputPolicy(humanDelay=False))
    guard.click(10, 10)
    guard.dispose()

    assert ctrl.disposed
    assert len(guard.actionLog) == 0


def testInputActionSerialize() -> None:
    action = InputAction(actionType="click", parameters={"x": 10, "y": 20})
    data = action.serialize()
    assert data["actionType"] == "click"
    assert data["parameters"]["x"] == 10
    assert "timestamp" in data
