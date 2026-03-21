from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class TaskDefinition:
    id: str = field(default_factory=lambda: f"task-{uuid.uuid4().hex[:10]}")
    name: str = ""
    description: str = ""
    documentPath: str = ""
    schedule: str | None = None
    inputs: dict[str, Any] = field(default_factory=dict)
    outputs: list[str] = field(default_factory=list)
    createdAt: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    enabled: bool = True

    def serialize(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "documentPath": self.documentPath,
            "schedule": self.schedule,
            "inputs": self.inputs,
            "outputs": self.outputs,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt,
            "enabled": self.enabled,
        }


@dataclass
class TaskRun:
    id: str = field(default_factory=lambda: f"run-{uuid.uuid4().hex[:10]}")
    taskId: str = ""
    status: TaskStatus = TaskStatus.PENDING
    startedAt: str | None = None
    finishedAt: str | None = None
    durationMs: int | None = None
    output: str = ""
    error: str | None = None
    variables: dict[str, Any] = field(default_factory=dict)

    def serialize(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "taskId": self.taskId,
            "status": self.status.value,
            "startedAt": self.startedAt,
            "finishedAt": self.finishedAt,
            "durationMs": self.durationMs,
            "output": self.output,
            "error": self.error,
            "variables": self.variables,
        }
