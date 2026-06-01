from __future__ import annotations

from typing import Any

from .shared import getSharedInputGuard
from .vision.capture import Region


class AutomationInputPolicyFlowError(Exception):
    def __init__(self, statusCode: int, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.message = message


def getAutomationInputPolicyPayload() -> dict[str, Any]:
    return getSharedInputGuard().policy.serialize()


def updateAutomationInputPolicyPayload(changes: dict[str, Any]) -> dict[str, Any]:
    policy = getSharedInputGuard().policy
    try:
        if "maxActionsPerSecond" in changes:
            policy.maxActionsPerSecond = int(changes["maxActionsPerSecond"])
        if "maxActionsPerMinute" in changes:
            policy.maxActionsPerMinute = int(changes["maxActionsPerMinute"])
        if "humanDelay" in changes:
            policy.humanDelay = bool(changes["humanDelay"])
        if "enabled" in changes:
            policy.enabled = bool(changes["enabled"])
        if "allowedScreenRegion" in changes:
            policy.allowedScreenRegion = regionFromPayload(changes["allowedScreenRegion"])
    except (KeyError, TypeError, ValueError) as exc:
        raise AutomationInputPolicyFlowError(400, "Invalid input policy payload") from exc
    return policy.serialize()


def regionFromPayload(payload: Any) -> Region | None:
    if payload is None:
        return None
    if not isinstance(payload, dict):
        raise AutomationInputPolicyFlowError(400, "allowedScreenRegion must be an object or null")
    try:
        return Region(
            x=int(payload["x"]),
            y=int(payload["y"]),
            width=int(payload["width"]),
            height=int(payload["height"]),
        )
    except (KeyError, TypeError, ValueError) as exc:
        raise AutomationInputPolicyFlowError(400, "Invalid allowedScreenRegion payload") from exc
