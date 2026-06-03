from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

from .eStop import getEmergencyStop
from .recipeAuthoring import buildAutomationTaskDraft, validateAutomationTaskRecipeText
from .scheduler import TaskScheduler, parseScheduleSeconds
from .taskModel import TaskDefinition, TaskRun
from .taskRegistry import getTaskRegistry
from .taskRunner import TaskRunner


async def _notifyTaskCompletion(task: TaskDefinition, run: TaskRun) -> None:
    """완료 시 등록된 채널로 diff 요약을 broadcast한다 — 채널이 0개면 no-op(무해).

    재진입 hook: "리포트 준비됨 — 무엇이 바뀌었나". 블로킹 urllib는 스레드로 빼 루프를 막지 않는다.
    """
    from .shared import getSharedMessageBridge

    bridge = getSharedMessageBridge()
    if not bridge.listChannels():
        return
    diff = getTaskRegistry().getRunDiff(task.id)
    message = f"[{task.name}] 완료 — 상태 {run.status.value} · {diff.summary}"
    await asyncio.to_thread(bridge.broadcast, message)


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


def _harvestSlug(name: str) -> str:
    import re

    slug = re.sub(r"[^a-zA-Z0-9]+", "-", name.strip().lower()).strip("-")
    return slug or "task"


def createAutomationTaskFromCodePayload(
    *,
    code: str,
    name: str,
    description: str = "",
    schedule: str | None = None,
    inputs: dict[str, Any] | None = None,
    workspaceRoot: str,
) -> dict[str, Any]:
    """학습/편집기에서 쓴 코드를 자동화 태스크로 Harvest한다(졸업 메커닉).

    임의 코드 문자열을 두 번째 생성 경로로 만들지 않는다 — document service로 percent 문서로
    materialize한 뒤, 기존 path-based 생성/실행(TaskRunner)을 그대로 쓴다(단일 경로).
    """
    import uuid

    from ..document.models import BlockConfig, CodaroDocument, DocumentMetadata
    from ..document.service import saveDocument

    if not code.strip():
        raise AutomationTaskFlowError(400, "코드가 비어 있습니다.")
    if schedule is not None and parseScheduleSeconds(schedule) is None:
        raise AutomationTaskFlowError(400, f"Invalid schedule: {schedule}")

    relPath = f"automations/{_harvestSlug(name)}-{uuid.uuid4().hex[:6]}.py"
    document = CodaroDocument(
        id=_harvestSlug(name),
        title=name,
        blocks=[BlockConfig(id="harvested", type="code", content=code)],
        metadata=DocumentMetadata(sourceFormat="percent"),
    )
    saveDocument(str(Path(workspaceRoot) / relPath), document)

    payload = createAutomationTaskPayload(
        name=name,
        documentPath=relPath,
        description=description,
        inputs=inputs,
    )
    if schedule is not None:
        setAutomationTaskSchedulePayload(payload["id"], schedule=schedule, workspaceRoot=workspaceRoot)
        payload = getAutomationTaskPayload(payload["id"])
    return {"created": True, "documentPath": relPath, "task": payload}


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
    from dataclasses import asdict

    registry = getTaskRegistry()
    task = registry.get(taskId)
    if task is None:
        raise AutomationTaskFlowError(404, "Task not found")
    runs = registry.getRuns(taskId, limit=limit)
    # 직전 대비 diff를 동봉 — 프론트가 "무엇이 바뀌었나"를 한 번의 호출로 렌더한다.
    return {
        "runs": [run.serialize() for run in runs],
        "diff": asdict(registry.getRunDiff(taskId)),
    }


def _scheduleTaskRun(taskId: str, schedule: str, workspaceRoot: str) -> bool:
    """스케줄러에 한 태스크의 주기 실행을 등록한다(설정·재시작 복원 공용 경로)."""
    registry = getTaskRegistry()
    scheduler = automationTaskScheduler()

    async def runScheduled() -> None:
        fresh = registry.get(taskId)
        if fresh is None or not fresh.enabled:
            scheduler.cancel(taskId)
            return
        run = await TaskRunner(workspaceRoot=workspaceRoot).run(fresh)
        registry.addRun(run)
        await _notifyTaskCompletion(fresh, run)

    return scheduler.schedule(taskId, schedule, runScheduled)


def setAutomationTaskSchedulePayload(
    taskId: str,
    *,
    schedule: str,
    workspaceRoot: str,
) -> dict[str, Any]:
    if parseScheduleSeconds(schedule) is None:
        raise AutomationTaskFlowError(400, f"Invalid schedule: {schedule}")

    task = getTaskRegistry().update(taskId, schedule=schedule)
    if task is None:
        raise AutomationTaskFlowError(404, "Task not found")

    _scheduleTaskRun(taskId, schedule, workspaceRoot)
    return {"ok": True, "schedule": schedule}


def rehydrateAutomationSchedules(workspaceRoot: str) -> dict[str, Any]:
    """재시작 시 schedule 보유 enabled 태스크의 주기 실행을 복원한다.

    schedule 문자열은 index.json에 영속되지만 active 잡(asyncio 루프)은 휘발하므로,
    서버 기동 시 한 번 호출해 스케줄을 되살린다(재부팅에 잡이 사라지지 않게).
    이벤트 루프가 도는 컨텍스트(서버 startup)에서 호출해야 한다.
    """
    registry = getTaskRegistry()
    scheduler = automationTaskScheduler()
    restored: list[str] = []
    for task in registry.listTasks():
        if not task.enabled or not task.schedule:
            continue
        if scheduler.isScheduled(task.id):
            continue
        if _scheduleTaskRun(task.id, task.schedule, workspaceRoot):
            restored.append(task.id)
    return {"restored": restored, "count": len(restored)}


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
    await _notifyTaskCompletion(task, run)
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
