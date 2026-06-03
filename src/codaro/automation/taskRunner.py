from __future__ import annotations

import time
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING

from .audit import getAuditTrail
from .eStop import EmergencyStopActive, getEmergencyStop
from .taskModel import TaskDefinition, TaskRun, TaskStatus

if TYPE_CHECKING:
    from ..kernel.documentExecution import CaptureResult


class TaskRunner:

    def __init__(self, workspaceRoot: str | Path | None = None) -> None:
        self._workspaceRoot = Path(workspaceRoot) if workspaceRoot else Path.cwd()

    async def run(self, task: TaskDefinition) -> TaskRun:
        run = TaskRun(taskId=task.id, status=TaskStatus.RUNNING)
        run.startedAt = datetime.now(timezone.utc).isoformat()
        startTime = time.monotonic()

        try:
            getEmergencyStop().check()
            capture = await self._executeDocument(task)
            run.output = capture.stdout
            run.variables = {variable.name: variable.repr for variable in capture.variables}
            if capture.status == "error":
                run.status = TaskStatus.FAILED
                run.error = capture.error or f"Block {capture.failedBlockId} failed"
            else:
                run.status = TaskStatus.SUCCESS
        except EmergencyStopActive as exc:
            run.status = TaskStatus.CANCELLED
            run.error = str(exc)
        except Exception as exc:  # noqa: BLE001 — task execution boundary
            run.status = TaskStatus.FAILED
            run.error = str(exc)
        finally:
            elapsed = time.monotonic() - startTime
            run.durationMs = int(elapsed * 1000)
            run.finishedAt = datetime.now(timezone.utc).isoformat()
            getAuditTrail().record(
                "taskRun",
                "task-runner",
                {
                    "taskId": task.id,
                    "documentPath": task.documentPath,
                    "status": run.status.value,
                    "durationMs": run.durationMs,
                },
                success=run.status == TaskStatus.SUCCESS,
                error=run.error,
            )

        return run

    async def _executeDocument(self, task: TaskDefinition) -> CaptureResult:
        from ..document.service import loadDocument
        from ..kernel.documentExecution import captureDocument
        from ..kernel.manager import SessionManager

        docPath = self._workspaceRoot / task.documentPath
        document = loadDocument(str(docPath))

        manager = SessionManager(workspaceRoot=str(self._workspaceRoot))
        return await captureDocument(
            document,
            manager=manager,
            onBlock=lambda block: getEmergencyStop().check(),
        )
