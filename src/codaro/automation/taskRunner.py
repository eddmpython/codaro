from __future__ import annotations

import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .taskModel import TaskDefinition, TaskRun, TaskStatus


class TaskRunner:

    def __init__(self, workspaceRoot: str | Path | None = None) -> None:
        self._workspaceRoot = Path(workspaceRoot) if workspaceRoot else Path.cwd()

    async def run(self, task: TaskDefinition) -> TaskRun:
        run = TaskRun(taskId=task.id, status=TaskStatus.RUNNING)
        run.startedAt = datetime.now(timezone.utc).isoformat()
        startTime = time.monotonic()

        try:
            result = await self._executeDocument(task)
            run.status = TaskStatus.SUCCESS
            run.output = result.get("stdout", "")
            run.variables = result.get("variables", {})
        except Exception as exc:
            run.status = TaskStatus.FAILED
            run.error = str(exc)
        finally:
            elapsed = time.monotonic() - startTime
            run.durationMs = int(elapsed * 1000)
            run.finishedAt = datetime.now(timezone.utc).isoformat()

        return run

    async def _executeDocument(self, task: TaskDefinition) -> dict[str, Any]:
        from ..document.service import loadDocument
        from ..kernel.manager import SessionManager

        docPath = self._workspaceRoot / task.documentPath
        document = loadDocument(str(docPath))

        manager = SessionManager(workspaceRoot=str(self._workspaceRoot))
        session = manager.createSession()

        allStdout: list[str] = []
        lastVariables: dict[str, Any] = {}

        try:
            for block in document.blocks:
                if block.type != "code":
                    continue
                if not block.content.strip():
                    continue

                result = await session.execute(block.content)
                if result.stdout:
                    allStdout.append(result.stdout)
                if result.status == "error":
                    raise RuntimeError(
                        f"Block {block.id} failed: {result.stderr}"
                    )

            variables = session.getVariables()
            lastVariables = {
                v.name: v.repr
                for v in variables
            }
        finally:
            manager.destroySession(session.sessionId)

        return {
            "stdout": "\n".join(allStdout),
            "variables": lastVariables,
        }
