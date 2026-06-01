from __future__ import annotations

from typing import Any

from .loop.automationLoop import AutomationLoop, LoopConfig


class AutomationPlanFlowError(Exception):
    def __init__(self, statusCode: int, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.message = message


_activePlans: dict[str, AutomationLoop] = {}


async def executeAutomationPlanPayload(
    *,
    steps: list[dict[str, Any]],
    maxConsecutiveFailures: int = 3,
) -> dict[str, Any]:
    if not steps:
        raise AutomationPlanFlowError(400, "No steps provided")

    async def actionHandler(action: str, params: dict[str, Any]) -> dict[str, Any]:
        return {"status": "simulated", "action": action, "parameters": params}

    loop = AutomationLoop(
        actionHandler=actionHandler,
        config=LoopConfig(maxConsecutiveFailures=maxConsecutiveFailures),
    )
    loop.addSteps(steps)
    _activePlans[loop.planId] = loop
    return await loop.run()


def getAutomationPlanStatusPayload(planId: str) -> dict[str, Any]:
    return automationPlan(planId).serialize()


def pauseAutomationPlanPayload(planId: str) -> dict[str, Any]:
    loop = automationPlan(planId)
    paused = loop.pause()
    if not paused:
        raise AutomationPlanFlowError(409, "Cannot pause plan in current state")
    return loop.progress


def resumeAutomationPlanPayload(planId: str) -> dict[str, Any]:
    loop = automationPlan(planId)
    resumed = loop.resume()
    if not resumed:
        raise AutomationPlanFlowError(409, "Cannot resume plan in current state")
    return loop.progress


def automationPlan(planId: str) -> AutomationLoop:
    loop = _activePlans.get(planId)
    if loop is None:
        raise AutomationPlanFlowError(404, "Plan not found")
    return loop


def resetAutomationPlanFlowState() -> None:
    _activePlans.clear()
