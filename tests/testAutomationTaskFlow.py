from __future__ import annotations

import asyncio

import pytest

import codaro.automation.taskRegistry as taskRegistryModule
from codaro.automation.eStop import getEmergencyStop
from codaro.automation.taskFlow import (
    AutomationTaskFlowError,
    automationSchedulerStatusPayload,
    clearAutomationStopPayload,
    createAutomationTaskPayload,
    getAutomationTaskPayload,
    resetAutomationTaskFlowState,
    setAutomationTaskSchedulePayload,
    triggerAutomationStopPayload,
)


@pytest.fixture(autouse=True)
def isolatedTaskFlow(tmp_path, monkeypatch):
    monkeypatch.setenv("CODARO_HOME", str(tmp_path / "home"))
    taskRegistryModule._registry = None
    resetAutomationTaskFlowState()
    getEmergencyStop().clear()
    yield
    getEmergencyStop().clear()
    resetAutomationTaskFlowState()
    taskRegistryModule._registry = None


def testInvalidScheduleDoesNotMutateTaskSchedule(tmp_path) -> None:
    task = createAutomationTaskPayload(name="Report", documentPath="report.py")

    with pytest.raises(AutomationTaskFlowError) as excInfo:
        setAutomationTaskSchedulePayload(
            task["id"],
            schedule="invalid",
            workspaceRoot=str(tmp_path),
        )

    assert excInfo.value.statusCode == 400
    assert getAutomationTaskPayload(task["id"])["schedule"] is None


def testEStopCancelsScheduledAutomationTasks(tmp_path) -> None:
    async def scenario() -> None:
        task = createAutomationTaskPayload(name="Report", documentPath="report.py")
        setAutomationTaskSchedulePayload(
            task["id"],
            schedule="@every_1m",
            workspaceRoot=str(tmp_path),
        )

        assert automationSchedulerStatusPayload()["jobCount"] == 1
        stopped = triggerAutomationStopPayload("manual stop")

        assert stopped["active"] is True
        assert automationSchedulerStatusPayload()["jobCount"] == 0
        assert clearAutomationStopPayload()["active"] is False

    asyncio.run(scenario())
