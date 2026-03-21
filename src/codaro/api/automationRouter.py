from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query, Request
from pydantic import BaseModel

from ..automation.taskModel import TaskDefinition
from ..automation.taskRegistry import getTaskRegistry
from ..automation.taskRunner import TaskRunner
from ..automation.workflow import getWorkflowEngine

logger = logging.getLogger(__name__)


class CreateTaskRequest(BaseModel):
    name: str
    documentPath: str
    description: str = ""
    schedule: str | None = None
    inputs: dict[str, Any] | None = None


class UpdateTaskRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    schedule: str | None = None
    enabled: bool | None = None


class ScheduleRequest(BaseModel):
    schedule: str


class CreateWorkflowRequest(BaseModel):
    name: str
    description: str = ""
    steps: list[dict[str, Any]]


def createAutomationRouter(state: Any) -> APIRouter:
    router = APIRouter()

    @router.get("/api/tasks")
    def apiListTasks():
        registry = getTaskRegistry()
        tasks = registry.listTasks()
        return {
            "tasks": [t.serialize() for t in tasks],
            "total": len(tasks),
        }

    @router.post("/api/tasks")
    def apiCreateTask(req: CreateTaskRequest):
        registry = getTaskRegistry()
        task = registry.create(
            name=req.name,
            documentPath=req.documentPath,
            description=req.description,
            schedule=req.schedule,
            inputs=req.inputs,
        )
        return task.serialize()

    @router.get("/api/tasks/{taskId}")
    def apiGetTask(taskId: str):
        registry = getTaskRegistry()
        task = registry.get(taskId)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        lastRun = registry.getLastRun(taskId)
        result = task.serialize()
        if lastRun:
            result["lastRun"] = lastRun.serialize()
        return result

    @router.put("/api/tasks/{taskId}")
    def apiUpdateTask(taskId: str, req: UpdateTaskRequest):
        registry = getTaskRegistry()
        task = registry.update(
            taskId,
            name=req.name,
            description=req.description,
            schedule=req.schedule,
            enabled=req.enabled,
        )
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return task.serialize()

    @router.delete("/api/tasks/{taskId}")
    def apiDeleteTask(taskId: str):
        registry = getTaskRegistry()
        deleted = registry.delete(taskId)
        if not deleted:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"ok": True}

    @router.post("/api/tasks/{taskId}/run")
    async def apiRunTask(taskId: str):
        registry = getTaskRegistry()
        task = registry.get(taskId)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")

        workspaceRoot = str(getattr(state, "workspaceRoot", "."))
        runner = TaskRunner(workspaceRoot=workspaceRoot)
        run = await runner.run(task)
        registry.addRun(run)
        return run.serialize()

    @router.get("/api/tasks/{taskId}/runs")
    def apiGetRuns(taskId: str, limit: int = Query(20)):
        registry = getTaskRegistry()
        task = registry.get(taskId)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        runs = registry.getRuns(taskId, limit=limit)
        return {"runs": [r.serialize() for r in runs]}

    @router.put("/api/tasks/{taskId}/schedule")
    def apiSetSchedule(taskId: str, req: ScheduleRequest):
        registry = getTaskRegistry()
        task = registry.update(taskId, schedule=req.schedule)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")

        from ..automation.scheduler import parseScheduleSeconds

        if parseScheduleSeconds(req.schedule) is None:
            raise HTTPException(status_code=400, detail=f"Invalid schedule: {req.schedule}")

        scheduler = _getScheduler()
        workspaceRoot = str(getattr(state, "workspaceRoot", "."))

        async def _runScheduled():
            fresh = registry.get(taskId)
            if fresh is None or not fresh.enabled:
                scheduler.cancel(taskId)
                return
            runner = TaskRunner(workspaceRoot=workspaceRoot)
            run = await runner.run(fresh)
            registry.addRun(run)

        scheduler.schedule(taskId, req.schedule, _runScheduled)
        return {"ok": True, "schedule": req.schedule}

    @router.delete("/api/tasks/{taskId}/schedule")
    def apiCancelSchedule(taskId: str):
        scheduler = _getScheduler()
        cancelled = scheduler.cancel(taskId)
        if not cancelled:
            raise HTTPException(status_code=404, detail="No active schedule for this task")
        registry = getTaskRegistry()
        registry.update(taskId, schedule=None)
        return {"ok": True}

    @router.get("/api/scheduler/status")
    def apiSchedulerStatus():
        scheduler = _getScheduler()
        return {
            "activeJobs": scheduler.listScheduled(),
            "jobCount": scheduler.jobCount,
        }

    @router.post("/api/webhooks/trigger/{taskId}")
    async def apiWebhookTrigger(taskId: str, request: Request):
        registry = getTaskRegistry()
        task = registry.get(taskId)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        if not task.enabled:
            raise HTTPException(status_code=403, detail="Task is disabled")

        try:
            payload = await request.json()
        except Exception:
            payload = {}

        workspaceRoot = str(getattr(state, "workspaceRoot", "."))
        runner = TaskRunner(workspaceRoot=workspaceRoot)
        run = await runner.run(task)
        registry.addRun(run)
        return {
            "triggered": True,
            "taskId": taskId,
            "runId": run.id,
            "status": run.status.value,
        }

    @router.get("/api/workflows")
    def apiListWorkflows():
        engine = getWorkflowEngine(str(getattr(state, "workspaceRoot", ".")))
        workflows = engine.listWorkflows()
        return {"workflows": [w.serialize() for w in workflows], "total": len(workflows)}

    @router.post("/api/workflows")
    def apiCreateWorkflow(req: CreateWorkflowRequest):
        engine = getWorkflowEngine(str(getattr(state, "workspaceRoot", ".")))
        workflow = engine.create(name=req.name, steps=req.steps, description=req.description)
        return workflow.serialize()

    @router.get("/api/workflows/{workflowId}")
    def apiGetWorkflow(workflowId: str):
        engine = getWorkflowEngine()
        workflow = engine.get(workflowId)
        if workflow is None:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return workflow.serialize()

    @router.delete("/api/workflows/{workflowId}")
    def apiDeleteWorkflow(workflowId: str):
        engine = getWorkflowEngine()
        deleted = engine.delete(workflowId)
        if not deleted:
            raise HTTPException(status_code=404, detail="Workflow not found")
        return {"ok": True}

    @router.post("/api/workflows/{workflowId}/run")
    async def apiRunWorkflow(workflowId: str):
        engine = getWorkflowEngine(str(getattr(state, "workspaceRoot", ".")))
        try:
            wfRun = await engine.run(workflowId)
        except ValueError as exc:
            raise HTTPException(status_code=404, detail=str(exc))
        return wfRun.serialize()

    @router.get("/api/workflows/{workflowId}/runs")
    def apiGetWorkflowRuns(workflowId: str, limit: int = Query(20)):
        engine = getWorkflowEngine()
        runs = engine.getRuns(workflowId, limit=limit)
        return {"runs": [r.serialize() for r in runs]}

    return router


_scheduler = None


def _getScheduler():
    global _scheduler
    if _scheduler is None:
        from ..automation.scheduler import TaskScheduler
        _scheduler = TaskScheduler()
    return _scheduler
