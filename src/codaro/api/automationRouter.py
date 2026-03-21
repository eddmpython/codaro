from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from ..automation.taskModel import TaskDefinition
from ..automation.taskRegistry import getTaskRegistry
from ..automation.taskRunner import TaskRunner

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

        from ..automation.scheduler import TaskScheduler, parseScheduleSeconds

        if parseScheduleSeconds(req.schedule) is None:
            raise HTTPException(status_code=400, detail=f"Invalid schedule: {req.schedule}")

        return {"ok": True, "schedule": req.schedule}

    return router
