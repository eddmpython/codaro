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
    createAutomationTaskFromCodePayload,
    createAutomationTaskFromRecipePayload,
    createAutomationTaskPayload,
    getAutomationTaskPayload,
    rehydrateAutomationSchedules,
    resetAutomationTaskFlowState,
    setAutomationTaskSchedulePayload,
    triggerAutomationStopPayload,
)
from codaro.automation.taskModel import TaskStatus


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


def testHarvestCodeMaterializesAndRuns(tmp_path) -> None:
    from codaro.automation.taskRegistry import getTaskRegistry
    from codaro.automation.taskRunner import TaskRunner

    result = createAutomationTaskFromCodePayload(
        code="x = 21 * 2\nprint(x)",
        name="My Weekly Job",
        workspaceRoot=str(tmp_path),
    )
    assert result["created"] is True
    docPath = tmp_path / result["documentPath"]
    assert docPath.exists()  # 코드가 문서로 materialize됨
    assert result["task"]["documentPath"] == result["documentPath"]

    # 단일 경로 — materialize된 문서를 기존 TaskRunner가 실행한다.
    task = getTaskRegistry().get(result["task"]["id"])
    run = asyncio.run(TaskRunner(workspaceRoot=str(tmp_path)).run(task))
    assert run.status == TaskStatus.SUCCESS
    assert "42" in run.output


def testHarvestRejectsEmptyCode(tmp_path) -> None:
    with pytest.raises(AutomationTaskFlowError) as excInfo:
        createAutomationTaskFromCodePayload(code="   ", name="X", workspaceRoot=str(tmp_path))
    assert excInfo.value.statusCode == 400


def testHarvestRejectsInvalidSchedule(tmp_path) -> None:
    with pytest.raises(AutomationTaskFlowError) as excInfo:
        createAutomationTaskFromCodePayload(
            code="x = 1", name="X", schedule="nope", workspaceRoot=str(tmp_path)
        )
    assert excInfo.value.statusCode == 400


def testNotifyCompletionNoOpWithoutChannels() -> None:
    from codaro.automation.taskFlow import _notifyTaskCompletion
    from codaro.automation.taskModel import TaskDefinition, TaskRun, TaskStatus

    task = TaskDefinition(name="R", documentPath="r.py")
    run = TaskRun(taskId=task.id, status=TaskStatus.SUCCESS)
    # 채널 0개 — 예외 없이 무동작.
    asyncio.run(_notifyTaskCompletion(task, run))


def _makeDiff(*, statusChanged: bool, previousStatus: str = "failed", currentStatus: str = "success") -> object:
    from codaro.automation.reportDiff import RunDiff

    return RunDiff(
        hasPrevious=True,
        previousStatus=previousStatus,
        currentStatus=currentStatus,
        statusChanged=statusChanged,
        outputLineDelta=0,
        summary=f"상태 {previousStatus}→{currentStatus}" if statusChanged else f"상태 {currentStatus} 유지",
    )


def testShouldNotifyRunFailureAlwaysSuccessOnlyOnRecovery() -> None:
    from codaro.automation.taskFlow import _shouldNotifyRun
    from codaro.automation.taskModel import TaskRun, TaskStatus

    # 실패·중단은 전환 여부와 무관하게 항상 알린다.
    assert _shouldNotifyRun(TaskRun(status=TaskStatus.FAILED), _makeDiff(statusChanged=False)) is True
    assert _shouldNotifyRun(TaskRun(status=TaskStatus.CANCELLED), _makeDiff(statusChanged=False)) is True
    # 성공은 직전이 실패였던 복구(statusChanged)일 때만 알리고, 반복 성공은 침묵(스팸 방지).
    assert _shouldNotifyRun(TaskRun(status=TaskStatus.SUCCESS), _makeDiff(statusChanged=True)) is True
    assert _shouldNotifyRun(TaskRun(status=TaskStatus.SUCCESS), _makeDiff(statusChanged=False)) is False


def testNotificationMessageDistinguishesFailureRecoveryAndError() -> None:
    from codaro.automation.taskFlow import _taskNotificationMessage
    from codaro.automation.taskModel import TaskDefinition, TaskRun, TaskStatus

    task = TaskDefinition(name="Nightly", documentPath="n.py")
    failMessage = _taskNotificationMessage(
        task,
        TaskRun(taskId=task.id, status=TaskStatus.FAILED, error="ValueError: boom\n  stack frame"),
        _makeDiff(statusChanged=True, previousStatus="success", currentStatus="failed"),
    )
    assert "실패" in failMessage and "Nightly" in failMessage and "ValueError: boom" in failMessage
    recoverMessage = _taskNotificationMessage(
        task,
        TaskRun(taskId=task.id, status=TaskStatus.SUCCESS),
        _makeDiff(statusChanged=True, previousStatus="failed", currentStatus="success"),
    )
    assert "복구" in recoverMessage and "Nightly" in recoverMessage


def testNotifyCompletionAlertsOnFailureNotRoutineSuccess(monkeypatch) -> None:
    import codaro.automation.shared as shared
    from codaro.automation.taskFlow import _notifyTaskCompletion, createAutomationTaskPayload
    from codaro.automation.taskModel import TaskRun, TaskStatus
    from codaro.automation.taskRegistry import getTaskRegistry

    sent: list[str] = []

    class _FakeBridge:
        def listChannels(self):
            return ["channel"]

        def broadcast(self, message):
            sent.append(message)
            return []

    monkeypatch.setattr(shared, "getSharedMessageBridge", lambda: _FakeBridge())

    registry = getTaskRegistry()
    created = createAutomationTaskPayload(name="Weekly", documentPath="r.py")
    taskId = created["id"]
    task = registry.get(taskId)

    def runWith(status: TaskStatus, error: str | None = None) -> None:
        run = TaskRun(taskId=taskId, status=status, error=error)
        registry.addRun(run)
        asyncio.run(_notifyTaskCompletion(task, run))

    # 첫 성공·반복 성공 — 스팸 방지로 침묵.
    runWith(TaskStatus.SUCCESS)
    runWith(TaskStatus.SUCCESS)
    assert sent == []

    # 실패 — 항상 알림.
    runWith(TaskStatus.FAILED, error="boom")
    assert len(sent) == 1 and "실패" in sent[0] and "Weekly" in sent[0]

    # 복구(실패→성공) — 알림.
    runWith(TaskStatus.SUCCESS)
    assert len(sent) == 2 and "복구" in sent[1]


def testListTasksIncludesLastRunStatus() -> None:
    from codaro.automation.taskFlow import createAutomationTaskPayload, listAutomationTasksPayload
    from codaro.automation.taskModel import TaskRun, TaskStatus
    from codaro.automation.taskRegistry import getTaskRegistry

    created = createAutomationTaskPayload(name="Daily", documentPath="d.py")
    # 실행 전 — lastRun 없음.
    before = listAutomationTasksPayload()
    assert before["tasks"][0].get("lastRun") is None

    getTaskRegistry().addRun(
        TaskRun(
            taskId=created["id"],
            status=TaskStatus.FAILED,
            finishedAt="2026-06-10T00:00:00+00:00",
        )
    )
    after = listAutomationTasksPayload()
    entry = next(item for item in after["tasks"] if item["id"] == created["id"])
    assert entry["lastRun"]["status"] == "failed"
    assert entry["lastRun"]["finishedAt"] == "2026-06-10T00:00:00+00:00"


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
