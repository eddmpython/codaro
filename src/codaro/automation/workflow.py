from __future__ import annotations

import logging
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from .taskModel import TaskDefinition, TaskRun, TaskStatus
from .taskRegistry import getTaskRegistry
from .taskRunner import TaskRunner

logger = logging.getLogger(__name__)


@dataclass
class WorkflowStep:
    taskId: str
    dependsOn: list[str] = field(default_factory=list)


@dataclass
class Workflow:
    id: str = field(default_factory=lambda: f"wf-{uuid.uuid4().hex[:10]}")
    name: str = ""
    description: str = ""
    steps: list[WorkflowStep] = field(default_factory=list)
    createdAt: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def serialize(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "steps": [
                {"taskId": s.taskId, "dependsOn": s.dependsOn}
                for s in self.steps
            ],
            "createdAt": self.createdAt,
        }


@dataclass
class WorkflowRun:
    id: str = field(default_factory=lambda: f"wfr-{uuid.uuid4().hex[:10]}")
    workflowId: str = ""
    status: TaskStatus = TaskStatus.PENDING
    startedAt: str | None = None
    finishedAt: str | None = None
    durationMs: int | None = None
    stepResults: list[dict[str, Any]] = field(default_factory=list)
    error: str | None = None

    def serialize(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "workflowId": self.workflowId,
            "status": self.status.value,
            "startedAt": self.startedAt,
            "finishedAt": self.finishedAt,
            "durationMs": self.durationMs,
            "stepResults": self.stepResults,
            "error": self.error,
        }


class WorkflowEngine:

    def __init__(self, workspaceRoot: str | None = None) -> None:
        self._workspaceRoot = workspaceRoot
        self._workflows: dict[str, Workflow] = {}
        self._runs: dict[str, list[WorkflowRun]] = {}

    def create(
        self,
        name: str,
        steps: list[dict[str, Any]],
        description: str = "",
    ) -> Workflow:
        wfSteps = [
            WorkflowStep(
                taskId=s["taskId"],
                dependsOn=s.get("dependsOn", []),
            )
            for s in steps
        ]
        workflow = Workflow(name=name, description=description, steps=wfSteps)
        self._workflows[workflow.id] = workflow
        return workflow

    def get(self, workflowId: str) -> Workflow | None:
        return self._workflows.get(workflowId)

    def listWorkflows(self) -> list[Workflow]:
        return list(self._workflows.values())

    def delete(self, workflowId: str) -> bool:
        if workflowId in self._workflows:
            del self._workflows[workflowId]
            self._runs.pop(workflowId, None)
            return True
        return False

    async def run(self, workflowId: str) -> WorkflowRun:
        workflow = self._workflows.get(workflowId)
        if workflow is None:
            raise ValueError(f"Workflow not found: {workflowId}")

        wfRun = WorkflowRun(
            workflowId=workflowId,
            status=TaskStatus.RUNNING,
            startedAt=datetime.now(timezone.utc).isoformat(),
        )
        startTime = time.monotonic()

        registry = getTaskRegistry()
        runner = TaskRunner(workspaceRoot=self._workspaceRoot)
        completed: set[str] = set()

        try:
            for step in workflow.steps:
                for dep in step.dependsOn:
                    if dep not in completed:
                        raise RuntimeError(
                            f"Dependency {dep} not completed before step {step.taskId}"
                        )

                task = registry.get(step.taskId)
                if task is None:
                    raise RuntimeError(f"Task not found: {step.taskId}")

                taskRun = await runner.run(task)
                registry.addRun(taskRun)
                wfRun.stepResults.append({
                    "taskId": step.taskId,
                    "runId": taskRun.id,
                    "status": taskRun.status.value,
                    "durationMs": taskRun.durationMs,
                })

                if taskRun.status != TaskStatus.SUCCESS:
                    raise RuntimeError(
                        f"Task {step.taskId} failed: {taskRun.error}"
                    )
                completed.add(step.taskId)

            wfRun.status = TaskStatus.SUCCESS
        except Exception as exc:
            wfRun.status = TaskStatus.FAILED
            wfRun.error = str(exc)
            logger.exception("Workflow %s failed", workflowId)
        finally:
            elapsed = time.monotonic() - startTime
            wfRun.durationMs = int(elapsed * 1000)
            wfRun.finishedAt = datetime.now(timezone.utc).isoformat()

        if workflowId not in self._runs:
            self._runs[workflowId] = []
        self._runs[workflowId].append(wfRun)

        return wfRun

    def getRuns(self, workflowId: str, limit: int = 20) -> list[WorkflowRun]:
        runs = self._runs.get(workflowId, [])
        return runs[-limit:]


_engine: WorkflowEngine | None = None


def getWorkflowEngine(workspaceRoot: str | None = None) -> WorkflowEngine:
    global _engine
    if _engine is None:
        _engine = WorkflowEngine(workspaceRoot=workspaceRoot)
    return _engine
