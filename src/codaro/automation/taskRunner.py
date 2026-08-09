from __future__ import annotations

import time
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING

from ..runtime.executionPolicy import ExecutionSecurityPolicy
from .audit import getAuditTrail
from .eStop import EmergencyStopActive, getEmergencyStop
from .taskModel import TaskDefinition, TaskRun, TaskStatus
from .taskExecution import (
    documentSourceHash,
    evaluateTaskOutput,
    redactTaskText,
    redactTaskVariables,
    resolveTaskSecretValues,
    taskInputPrelude,
)
from .taskSafety import resolveTaskDocumentPath, taskPermissionPolicyHash

if TYPE_CHECKING:
    from ..kernel.documentExecution import CaptureResult


class TaskRunner:

    def __init__(self, workspaceRoot: str | Path | None = None) -> None:
        self._workspaceRoot = Path(workspaceRoot) if workspaceRoot else Path.cwd()

    async def run(self, task: TaskDefinition) -> TaskRun:
        run = TaskRun(taskId=task.id, status=TaskStatus.RUNNING)
        run.startedAt = datetime.now(timezone.utc).isoformat()
        startTime = time.monotonic()
        secrets: tuple[str, ...] = ()

        try:
            getEmergencyStop().check()
            secrets = resolveTaskSecretValues(task)
            documentPath = resolveTaskDocumentPath(task, self._workspaceRoot)
            from ..document.service import loadDocument

            document = loadDocument(str(documentPath))
            run.sourceHash = documentSourceHash(document)
            run.enforcementPolicyHash = taskPermissionPolicyHash(task, workspaceRoot=self._workspaceRoot)
            policy = ExecutionSecurityPolicy.create(
                workspaceRoot=self._workspaceRoot,
                permissionScopes=task.permissionScopes,
                policyHash=run.enforcementPolicyHash,
            )
            capture = await self._executeDocument(task, document=document, policy=policy)
            rawVariables = {variable.name: variable.repr for variable in capture.variables}
            run.output = redactTaskText(capture.stdout, secrets)
            run.variables = redactTaskVariables(rawVariables, secrets)
            if capture.status == "error":
                run.status = TaskStatus.FAILED
                run.error = redactTaskText(capture.error or f"Block {capture.failedBlockId} failed", secrets)
                run.validationErrors = ["execution-error"]
            else:
                run.status = TaskStatus.SUCCESS
                evaluation = evaluateTaskOutput(task, capture, workspaceRoot=self._workspaceRoot)
                run.validated = evaluation.passed
                run.validationErrors = list(evaluation.errors)
                run.artifactDescriptors = list(evaluation.artifactDescriptors)
                run.inputHash = evaluation.inputHash
                run.checkSpecHash = evaluation.checkSpecHash
                run.operationalCandidate = bool(
                    evaluation.passed
                    and evaluation.artifactDescriptors
                    and (task.safetyApproval or {}).get("policyHash") == run.enforcementPolicyHash
                )
                if task.outputContract is not None and not evaluation.passed:
                    run.status = TaskStatus.FAILED
                    run.error = redactTaskText(
                        f"Output contract failed: {', '.join(evaluation.errors)}",
                        secrets,
                    )
        except EmergencyStopActive as exc:
            run.status = TaskStatus.CANCELLED
            run.error = redactTaskText(exc, secrets)
            run.validationErrors = ["emergency-stop"]
        except Exception as exc:  # noqa: BLE001 — task execution boundary
            run.status = TaskStatus.FAILED
            run.error = redactTaskText(exc, secrets)
            run.validationErrors = ["execution-boundary-error"]
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
                    "riskLevel": task.riskLevel,
                    "permissionScopes": list(task.permissionScopes),
                    "safetyFingerprint": (task.safetyApproval or {}).get("fingerprint"),
                    "enforcementPolicyHash": run.enforcementPolicyHash,
                    "validated": run.validated,
                    "operationalCandidate": run.operationalCandidate,
                },
                success=run.status == TaskStatus.SUCCESS,
                error=redactTaskText(run.error, secrets) if run.error else None,
            )

        return run

    async def _executeDocument(
        self,
        task: TaskDefinition,
        *,
        document,
        policy: ExecutionSecurityPolicy,
    ) -> CaptureResult:
        from ..kernel.documentExecution import captureDocument
        from ..kernel.manager import SessionManager

        manager = SessionManager(
            workspaceRoot=str(self._workspaceRoot),
            executionPolicy=policy,
        )
        return await captureDocument(
            document,
            manager=manager,
            onBlock=lambda block: getEmergencyStop().check(),
            executableBlockTypes=frozenset({"code", "automation"}),
            inputPrelude=taskInputPrelude(task.inputs),
        )
