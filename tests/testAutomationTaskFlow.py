from __future__ import annotations

import asyncio

import pytest

import codaro.automation.taskRegistry as taskRegistryModule
from codaro.automation.eStop import getEmergencyStop
from codaro.automation.taskFlow import (
    AutomationTaskFlowError,
    automationSchedulerStatusPayload,
    automationTaskScheduler,
    clearAutomationStopPayload,
    createAutomationTaskFromRecipePayload,
    createAutomationTaskPayload,
    getAutomationTaskPayload,
    rehydrateAutomationSchedules,
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


def testRehydrateRestoresSchedulesAfterRestart(tmp_path) -> None:
    async def scenario() -> None:
        task = createAutomationTaskPayload(name="Report", documentPath="report.py")
        setAutomationTaskSchedulePayload(task["id"], schedule="@every_1m", workspaceRoot=str(tmp_path))
        assert automationSchedulerStatusPayload()["jobCount"] == 1

        # 재시작 시뮬레이션 — active 잡은 휘발(schedule 문자열은 task에 영속).
        automationTaskScheduler().cancelAll()
        assert automationSchedulerStatusPayload()["jobCount"] == 0

        result = rehydrateAutomationSchedules(str(tmp_path))
        assert result["count"] == 1
        assert task["id"] in result["restored"]
        assert automationSchedulerStatusPayload()["jobCount"] == 1

    asyncio.run(scenario())


def testRehydrateSkipsUnscheduledTasks(tmp_path) -> None:
    async def scenario() -> None:
        createAutomationTaskPayload(name="NoSchedule", documentPath="x.py")
        result = rehydrateAutomationSchedules(str(tmp_path))
        assert result["count"] == 0

    asyncio.run(scenario())


def testNotifyCompletionNoOpWithoutChannels() -> None:
    from codaro.automation.taskFlow import _notifyTaskCompletion
    from codaro.automation.taskModel import TaskDefinition, TaskRun, TaskStatus

    task = TaskDefinition(name="R", documentPath="r.py")
    run = TaskRun(taskId=task.id, status=TaskStatus.SUCCESS)
    # 채널 0개 — 예외 없이 무동작.
    asyncio.run(_notifyTaskCompletion(task, run))


def testNotifyCompletionBroadcastsWhenChannel(monkeypatch) -> None:
    import codaro.automation.shared as shared
    from codaro.automation.taskFlow import _notifyTaskCompletion
    from codaro.automation.taskModel import TaskDefinition, TaskRun, TaskStatus

    sent: list[str] = []

    class _FakeBridge:
        def listChannels(self):
            return ["channel"]

        def broadcast(self, message):
            sent.append(message)
            return []

    monkeypatch.setattr(shared, "getSharedMessageBridge", lambda: _FakeBridge())
    task = TaskDefinition(name="Weekly", documentPath="r.py")
    run = TaskRun(taskId=task.id, status=TaskStatus.SUCCESS)
    asyncio.run(_notifyTaskCompletion(task, run))
    assert sent and "Weekly" in sent[0] and "완료" in sent[0]


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
