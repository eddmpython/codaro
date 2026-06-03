from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .reportDiff import RunDiff, diffRuns
from .taskModel import TaskDefinition, TaskRun, TaskStatus

logger = logging.getLogger(__name__)

MAX_PERSISTED_RUNS = 50


class TaskRegistry:

    def __init__(self, storagePath: Path | None = None) -> None:
        if storagePath is None:
            import os
            home = Path(os.environ.get("CODARO_HOME", Path.home() / ".codaro"))
            storagePath = home / "tasks"
        self._storagePath = storagePath
        self._tasks: dict[str, TaskDefinition] = {}
        self._runs: dict[str, list[TaskRun]] = {}
        self._load()

    def _load(self) -> None:
        indexPath = self._storagePath / "index.json"
        if not indexPath.exists():
            return
        try:
            data = json.loads(indexPath.read_text(encoding="utf-8"))
            for entry in data.get("tasks", []):
                task = TaskDefinition(**entry)
                self._tasks[task.id] = task
        except (json.JSONDecodeError, TypeError, KeyError):
            logger.warning("Failed to load task registry from %s", indexPath)
            return
        for task in self._tasks.values():
            self._runs[task.id] = self._loadRuns(task.id)

    def _runsPath(self, taskId: str) -> Path:
        return self._storagePath / "runs" / f"{taskId}.json"

    def _loadRuns(self, taskId: str) -> list[TaskRun]:
        runsPath = self._runsPath(taskId)
        if not runsPath.exists():
            return []
        try:
            payload = json.loads(runsPath.read_text(encoding="utf-8"))
            return [TaskRun.deserialize(entry) for entry in payload.get("runs", [])]
        except (json.JSONDecodeError, TypeError, KeyError, ValueError) as exc:
            logger.warning("Failed to load runs for %s: %s", taskId, exc)
            return []

    def _saveRuns(self, taskId: str) -> None:
        runsPath = self._runsPath(taskId)
        runsPath.parent.mkdir(parents=True, exist_ok=True)
        payload = {"runs": [run.serialize() for run in self._runs.get(taskId, [])]}
        runsPath.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def _save(self) -> None:
        self._storagePath.mkdir(parents=True, exist_ok=True)
        indexPath = self._storagePath / "index.json"
        data = {"tasks": [t.serialize() for t in self._tasks.values()]}
        indexPath.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    def create(
        self,
        name: str,
        documentPath: str,
        description: str = "",
        schedule: str | None = None,
        inputs: dict[str, Any] | None = None,
    ) -> TaskDefinition:
        task = TaskDefinition(
            name=name,
            documentPath=documentPath,
            description=description,
            schedule=schedule,
            inputs=inputs or {},
        )
        self._tasks[task.id] = task
        self._save()
        return task

    def get(self, taskId: str) -> TaskDefinition | None:
        return self._tasks.get(taskId)

    def listTasks(self) -> list[TaskDefinition]:
        return list(self._tasks.values())

    def update(self, taskId: str, **kwargs: Any) -> TaskDefinition | None:
        task = self._tasks.get(taskId)
        if task is None:
            return None
        for key, value in kwargs.items():
            if hasattr(task, key) and value is not None:
                setattr(task, key, value)
        task.updatedAt = datetime.now(timezone.utc).isoformat()
        self._save()
        return task

    def delete(self, taskId: str) -> bool:
        if taskId in self._tasks:
            del self._tasks[taskId]
            self._runs.pop(taskId, None)
            runsPath = self._runsPath(taskId)
            if runsPath.exists():
                runsPath.unlink()
            self._save()
            return True
        return False

    def addRun(self, run: TaskRun) -> None:
        if run.taskId not in self._runs:
            self._runs[run.taskId] = []
        self._runs[run.taskId].append(run)
        if len(self._runs[run.taskId]) > MAX_PERSISTED_RUNS:
            self._runs[run.taskId] = self._runs[run.taskId][-MAX_PERSISTED_RUNS:]
        self._saveRuns(run.taskId)

    def getRuns(self, taskId: str, limit: int = 20) -> list[TaskRun]:
        runs = self._runs.get(taskId, [])
        return runs[-limit:]

    def getLastRun(self, taskId: str) -> TaskRun | None:
        runs = self._runs.get(taskId, [])
        return runs[-1] if runs else None

    def getRunDiff(self, taskId: str) -> RunDiff:
        """가장 최근 실행을 직전 실행과 비교한다 — '무엇이 바뀌었나'(retention pull)."""
        runs = self._runs.get(taskId, [])
        if not runs:
            return diffRuns(None, TaskRun(taskId=taskId, status=TaskStatus.PENDING))
        previous = runs[-2] if len(runs) >= 2 else None
        return diffRuns(previous, runs[-1])


_registry: TaskRegistry | None = None


def getTaskRegistry() -> TaskRegistry:
    global _registry
    if _registry is None:
        _registry = TaskRegistry()
    return _registry
