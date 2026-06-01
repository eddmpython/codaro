from __future__ import annotations

import asyncio

import pytest

from codaro.automation.planFlow import (
    AutomationPlanFlowError,
    executeAutomationPlanPayload,
    getAutomationPlanStatusPayload,
    pauseAutomationPlanPayload,
    resetAutomationPlanFlowState,
)


@pytest.fixture(autouse=True)
def isolatedPlanFlow():
    resetAutomationPlanFlowState()
    yield
    resetAutomationPlanFlowState()


def testExecuteAutomationPlanStoresCompletedPlanStatus() -> None:
    result = asyncio.run(executeAutomationPlanPayload(
        steps=[
            {"action": "click-element", "parameters": {"x": 10, "y": 20}},
            {"action": "type-text", "parameters": {"text": "done"}},
        ],
    ))

    assert result["status"] == "completed"
    assert result["completedSteps"] == 2
    assert result["planId"].startswith("plan-")

    status = getAutomationPlanStatusPayload(result["planId"])
    assert status["status"] == "completed"
    assert [step["action"] for step in status["steps"]] == ["click-element", "type-text"]


def testExecuteAutomationPlanRejectsEmptySteps() -> None:
    with pytest.raises(AutomationPlanFlowError) as excInfo:
        asyncio.run(executeAutomationPlanPayload(steps=[]))

    assert excInfo.value.statusCode == 400
    assert excInfo.value.message == "No steps provided"


def testPlanControlReportsMissingAndInvalidState() -> None:
    with pytest.raises(AutomationPlanFlowError) as missingInfo:
        getAutomationPlanStatusPayload("missing")

    assert missingInfo.value.statusCode == 404

    result = asyncio.run(executeAutomationPlanPayload(steps=[{"action": "noop"}]))
    with pytest.raises(AutomationPlanFlowError) as stateInfo:
        pauseAutomationPlanPayload(result["planId"])

    assert stateInfo.value.statusCode == 409
