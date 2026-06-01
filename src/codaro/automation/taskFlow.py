from __future__ import annotations

from pathlib import Path
from typing import Any

from .eStop import getEmergencyStop
from .recipeAuthoring import buildAutomationTaskDraft, validateAutomationTaskRecipeText
from .scheduler import TaskScheduler, parseScheduleSeconds
from .taskRegistry import getTaskRegistry
from .taskRunner import TaskRunner


class AutomationTaskFlowError(Exception):
    def __init__(self, statusCode: int, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.message = message


_scheduler: TaskScheduler | None = None


def listAutomationTasksPayload() -> dict[str, Any]:
    registry = getTaskRegistry()
    tasks = registry.listTasks()
    return {
        "tasks": [task.serialize() for task in tasks],
        "total": len(tasks),
    }


def createAutomationTaskPayload(
    *,
    name: str,
    documentPath: str,
    description: str = "",
    schedule: str | None = None,
    inputs: dict[str, Any] | None = None,
) -> dict[str, Any]:
    task = getTaskRegistry().create(
        name=name,
        documentPath=documentPath,
        description=description,
        schedule=schedule,
        inputs=inputs,
    )
    return task.serialize()


def createAutomationTaskFromRecipePayload(
    *,
    recipePath: Path,
    documentPath: str,
    name: str,
    description: str = "",
    schedule: str | None = None,
    inputs: dict[str, Any] | None = None,
) -> dict[str, Any]:
    try:
        draft = buildAutomationTaskDraft(
            name=name,
            documentPath=documentPath,
            description=description,
            schedule=schedule,
            inputs=inputs,
        )
    except (TypeError, ValueError) as exc:
        raise AutomationTaskFlowError(400, str(exc)) from exc

    if not recipePath.is_file():
        raise AutomationTaskFlowError(404, f"Automation recipe not found: {draft.documentPath}")
    try:
        recipeValidation = validateAutomationTaskRecipeText(recipePath.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError) as exc:
        raise AutomationTaskFlowError(400, f"Automation recipe could not be read: {exc}") from exc
    except ValueError as exc:
        raise AutomationTaskFlowError(400, str(exc)) from exc

    task = getTaskRegistry().create(
        name=draft.name,
        documentPath=str(recipePath),
        description=draft.description,
        schedule=draft.schedule,
        inputs=draft.inputs,
    )
    return {
        "created": True,
        "task": task.serialize(),
        "documentPath": str(recipePath),
        "recipeValidation": {
            "percentFormat": recipeValidation.percentFormat,
            "dryRunFirst": recipeValidation.dryRunFirst,
        },
    }


def getAutomationTaskPayload(taskId: str) -> dict[str, Any]:
    registry = getTaskRegistry()
    task = registry.get(taskId)
    if task is None:
        raise AutomationTaskFlowError(404, "Task not found")
    lastRun = registry.getLastRun(taskId)
    result = task.serialize()
    if lastRun:
        result["lastRun"] = lastRun.serialize()
    return result


def updateAutomationTaskPayload(
    taskId: str,
    *,
    name: str | None = None,
    description: str | None = None,
    schedule: str | None = None,
    enabled: bool | None = None,
) -> dict[str, Any]:
    task = getTaskRegistry().update(
        taskId,
        name=name,
        description=description,
        schedule=schedule,
        enabled=enabled,
    )
    if task is None:
        raise AutomationTaskFlowError(404, "Task not found")
    return task.serialize()


def deleteAutomationTaskPayload(taskId: str) -> dict[str, bool]:
    deleted = getTaskRegistry().delete(taskId)
    if not deleted:
        raise AutomationTaskFlowError(404, "Task not found")
    return {"ok": True}


async def runAutomationTaskPayload(taskId: str, *, workspaceRoot: str) -> dict[str, Any]:
    registry = getTaskRegistry()
    task = registry.get(taskId)
    if task is None:
        raise AutomationTaskFlowError(404, "Task not found")
    run = await TaskRunner(workspaceRoot=workspaceRoot).run(task)
    registry.addRun(run)
    return run.serialize()


def listAutomationTaskRunsPayload(taskId: str, *, limit: int) -> dict[str, Any]:
    registry = getTaskRegistry()
    task = registry.get(taskId)
    if task is None:
        raise AutomationTaskFlowError(404, "Task not found")
    runs = registry.getRuns(taskId, limit=limit)
    return {"runs": [run.serialize() for run in runs]}


def setAutomationTaskSchedulePayload(
    taskId: str,
    *,
    schedule: str,
    workspaceRoot: str,
) -> dict[str, Any]:
    if parseScheduleSeconds(schedule) is None:
        raise AutomationTaskFlowError(400, f"Invalid schedule: {schedule}")

    registry = getTaskRegistry()
    task = registry.update(taskId, schedule=schedule)
    if task is None:
        raise AutomationTaskFlowError(404, "Task not found")

    scheduler = automationTaskScheduler()

    async def runScheduled() -> None:
        fresh = registry.get(taskId)
        if fresh is None or not fresh.enabled:
            scheduler.cancel(taskId)
            return
        run = await TaskRunner(workspaceRoot=workspaceRoot).run(fresh)
        registry.addRun(run)

    scheduler.schedule(taskId, schedule, runScheduled)
    return {"ok": True, "schedule": schedule}


def cancelAutomationTaskSchedulePayload(taskId: str) -> dict[str, Any]:
    cancelled = automationTaskScheduler().cancel(taskId)
    if not cancelled:
        raise AutomationTaskFlowError(404, "No active schedule for this task")
    getTaskRegistry().update(taskId, schedule=None)
    return {"ok": True}


def automationSchedulerStatusPayload() -> dict[str, Any]:
    scheduler = automationTaskScheduler()
    return {
        "activeJobs": scheduler.listScheduled(),
        "jobCount": scheduler.jobCount,
    }


async def triggerAutomationWebhookPayload(taskId: str, *, workspaceRoot: str) -> dict[str, Any]:
    registry = getTaskRegistry()
    task = registry.get(taskId)
    if task is None:
        raise AutomationTaskFlowError(404, "Task not found")
    if not task.enabled:
        raise AutomationTaskFlowError(403, "Task is disabled")

    run = await TaskRunner(workspaceRoot=workspaceRoot).run(task)
    registry.addRun(run)
    return {
        "triggered": True,
        "taskId": taskId,
        "runId": run.id,
        "status": run.status.value,
    }


def getAutomationStopPayload() -> dict[str, Any]:
    return getEmergencyStop().serialize()


def triggerAutomationStopPayload(reason: str) -> dict[str, Any]:
    eStop = getEmergencyStop()
    triggered = eStop.trigger(reason)
    if not triggered:
        raise AutomationTaskFlowError(409, "E-Stop already active")
    automationTaskScheduler().cancelAll()
    return eStop.serialize()


def clearAutomationStopPayload() -> dict[str, Any]:
    eStop = getEmergencyStop()
    cleared = eStop.clear()
    if not cleared:
        raise AutomationTaskFlowError(409, "E-Stop is not active")
    return eStop.serialize()


def automationTaskScheduler() -> TaskScheduler:
    global _scheduler
    if _scheduler is None:
        _scheduler = TaskScheduler()
    return _scheduler


def resetAutomationTaskFlowState() -> None:
    global _scheduler
    _scheduler = None
