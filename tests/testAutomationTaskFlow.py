from __future__ import annotations

import asyncio

import pytest

import codaro.automation.taskRegistry as taskRegistryModule
from codaro.automation.eStop import getEmergencyStop
from codaro.automation.taskFlow import (
    AutomationTaskFlowError,
    automationSchedulerStatusPayload,
    clearAutomationStopPayload,
    createAutomationTaskFromRecipePayload,
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


def testCreateAutomationTaskFromRecipeValidatesRecipeBeforeRegistration(tmp_path) -> None:
    recipePath = tmp_path / "recipes" / "report.py"
    recipePath.parent.mkdir()
    recipePath.write_text("# %% [automation]\nDRY_RUN = True\n\nprint('ok')\n", encoding="utf-8")

    result = createAutomationTaskFromRecipePayload(
        recipePath=recipePath,
        documentPath="recipes/report.py",
        name="Run report",
        description="Daily report task",
        schedule="@every_15m",
        inputs={"dryRun": True},
    )

    assert result["created"] is True
    assert result["documentPath"] == str(recipePath)
    assert result["task"]["name"] == "Run report"
    assert result["task"]["description"] == "Daily report task"
    assert result["task"]["schedule"] == "@every_15m"
    assert result["task"]["inputs"] == {"dryRun": True}
    assert result["recipeValidation"] == {"percentFormat": True, "dryRunFirst": True}


def testCreateAutomationTaskFromRecipeRejectsUnsafeRecipe(tmp_path) -> None:
    recipePath = tmp_path / "recipes" / "unsafe.py"
    recipePath.parent.mkdir()
    recipePath.write_text("# %% [automation]\nprint('writes now')\n", encoding="utf-8")

    with pytest.raises(AutomationTaskFlowError) as excInfo:
        createAutomationTaskFromRecipePayload(
            recipePath=recipePath,
            documentPath="recipes/unsafe.py",
            name="Unsafe",
        )

    assert excInfo.value.statusCode == 400
    assert str(excInfo.value) == "Automation task requires DRY_RUN = True before registration."


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
