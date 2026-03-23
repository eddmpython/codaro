from __future__ import annotations

import logging
import time
from collections import deque
from dataclasses import dataclass, field
from typing import Any

from ..eStop import getEmergencyStop
from ..vision.capture import Region
from .controller import InputAction, InputController

logger = logging.getLogger(__name__)


@dataclass(slots=True)
class InputPolicy:
    maxActionsPerSecond: int = 10
    maxActionsPerMinute: int = 200
    allowedScreenRegion: Region | None = None
    blockedRegions: list[Region] = field(default_factory=list)
    requireConfirmation: list[str] = field(default_factory=lambda: ["hotkey"])
    humanDelay: bool = True
    enabled: bool = True

    def serialize(self) -> dict[str, Any]:
        return {
            "maxActionsPerSecond": self.maxActionsPerSecond,
            "maxActionsPerMinute": self.maxActionsPerMinute,
            "allowedScreenRegion": {
                "x": self.allowedScreenRegion.x,
                "y": self.allowedScreenRegion.y,
                "width": self.allowedScreenRegion.width,
                "height": self.allowedScreenRegion.height,
            } if self.allowedScreenRegion else None,
            "blockedRegions": [
                {"x": r.x, "y": r.y, "width": r.width, "height": r.height}
                for r in self.blockedRegions
            ],
            "requireConfirmation": self.requireConfirmation,
            "humanDelay": self.humanDelay,
            "enabled": self.enabled,
        }


class RateLimitExceeded(Exception):
    pass


class RegionBlocked(Exception):
    pass


class InputGuard:

    def __init__(self, controller: InputController, policy: InputPolicy | None = None) -> None:
        self._controller = controller
        self._policy = policy or InputPolicy()
        self._recentActions: deque[float] = deque()
        self._actionLog: list[InputAction] = []

    @property
    def policy(self) -> InputPolicy:
        return self._policy

    @policy.setter
    def policy(self, value: InputPolicy) -> None:
        self._policy = value

    @property
    def actionLog(self) -> list[InputAction]:
        return list(self._actionLog)

    def _checkEStop(self) -> None:
        getEmergencyStop().check()

    def _checkRateLimit(self) -> None:
        now = time.monotonic()
        while self._recentActions and self._recentActions[0] < now - 60:
            self._recentActions.popleft()

        oneSecondAgo = now - 1.0
        perSecondCount = sum(1 for t in self._recentActions if t >= oneSecondAgo)

        if perSecondCount >= self._policy.maxActionsPerSecond:
            raise RateLimitExceeded(
                f"Rate limit exceeded: {perSecondCount}/{self._policy.maxActionsPerSecond} actions/sec"
            )
        if len(self._recentActions) >= self._policy.maxActionsPerMinute:
            raise RateLimitExceeded(
                f"Rate limit exceeded: {len(self._recentActions)}/{self._policy.maxActionsPerMinute} actions/min"
            )

    def _checkRegion(self, x: int, y: int) -> None:
        if self._policy.allowedScreenRegion:
            r = self._policy.allowedScreenRegion
            if not (r.x <= x < r.x + r.width and r.y <= y < r.y + r.height):
                raise RegionBlocked(f"Point ({x}, {y}) outside allowed region")

        for blocked in self._policy.blockedRegions:
            if (blocked.x <= x < blocked.x + blocked.width and
                    blocked.y <= y < blocked.y + blocked.height):
                raise RegionBlocked(f"Point ({x}, {y}) inside blocked region")

    def _recordAction(self, actionType: str, **params: Any) -> None:
        now = time.monotonic()
        self._recentActions.append(now)
        self._actionLog.append(InputAction(
            actionType=actionType,
            parameters=params,
        ))

    def _applyHumanDelay(self) -> None:
        if self._policy.humanDelay:
            import random
            time.sleep(random.uniform(0.01, 0.05))

    def _preCheck(self, actionType: str, x: int | None = None, y: int | None = None) -> None:
        self._checkEStop()
        if not self._policy.enabled:
            return
        self._checkRateLimit()
        if x is not None and y is not None:
            self._checkRegion(x, y)

    def moveTo(self, x: int, y: int, duration: float = 0.1) -> None:
        self._preCheck("moveTo", x=x, y=y)
        self._applyHumanDelay()
        self._controller.moveTo(x, y, duration=duration)
        self._recordAction("moveTo", x=x, y=y, duration=duration)

    def click(self, x: int, y: int, button: str = "left", clicks: int = 1) -> None:
        self._preCheck("click", x=x, y=y)
        self._applyHumanDelay()
        self._controller.click(x, y, button=button, clicks=clicks)
        self._recordAction("click", x=x, y=y, button=button, clicks=clicks)

    def typeText(self, text: str, interval: float = 0.02) -> None:
        self._preCheck("typeText")
        self._applyHumanDelay()
        self._controller.typeText(text, interval=interval)
        self._recordAction("typeText", text=text, interval=interval)

    def hotkey(self, *keys: str) -> None:
        self._preCheck("hotkey")
        self._applyHumanDelay()
        self._controller.hotkey(*keys)
        self._recordAction("hotkey", keys=list(keys))

    def scroll(self, clicks: int, x: int | None = None, y: int | None = None) -> None:
        self._preCheck("scroll", x=x, y=y)
        self._applyHumanDelay()
        self._controller.scroll(clicks, x=x, y=y)
        self._recordAction("scroll", clicks=clicks, x=x, y=y)

    def mousePosition(self) -> tuple[int, int]:
        self._checkEStop()
        return self._controller.mousePosition()

    def dragTo(self, x: int, y: int, duration: float = 0.3) -> None:
        self._preCheck("dragTo", x=x, y=y)
        self._applyHumanDelay()
        self._controller.dragTo(x, y, duration=duration)
        self._recordAction("dragTo", x=x, y=y, duration=duration)

    def dispose(self) -> None:
        self._controller.dispose()
        self._recentActions.clear()
        self._actionLog.clear()
