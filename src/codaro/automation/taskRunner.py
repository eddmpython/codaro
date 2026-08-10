from __future__ import annotations

import time
from datetime import datetime, timezone
from pathlib import Path
from typing import TYPE_CHECKING

from ..proof.contracts import contentDigest
from ..runtime.executionPolicy import ExecutionSecurityPolicy
from .audit import getAuditTrail
from .eStop import ActiveRunContext, EmergencyStopActive, getEmergencyStop
from .taskModel import TaskDefinition, TaskRun, TaskStatus
from .taskExecution import (
    captureTaskArtifactSnapshot,
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
        secretEnvironment: dict[str, str] = {}
        eStop = getEmergencyStop()
        activeRun = eStop.registerRun(run.id)

        try:
            eStop.check()
            activeRun.check()
            secretEnvironment = resolveTaskSecretValues(task)
            secrets = tuple(sorted(set(secretEnvironment.values()), key=len, reverse=True))
            documentPath = resolveTaskDocumentPath(task, self._workspaceRoot)
            from ..document.service import loadDocument

            persistedDocumentBytes = documentPath.read_bytes()
            document = loadDocument(str(documentPath))
            if documentPath.read_bytes() != persistedDocumentBytes:
                raise RuntimeError("task-document-changed-during-load")
            run.sourceHash = documentSourceHash(document)
            run.buildArtifactHash = contentDigest(persistedDocumentBytes)
            run.enforcementPolicyHash = taskPermissionPolicyHash(task, workspaceRoot=self._workspaceRoot)
            artifactSnapshot = captureTaskArtifactSnapshot(task, workspaceRoot=self._workspaceRoot)
            policy = ExecutionSecurityPolicy.createProofEligible(
                workspaceRoot=self._workspaceRoot,
                permissionScopes=task.permissionScopes,
                policyHash=run.enforcementPolicyHash,
            )
            run.isolationProfile = policy.isolationProfile
            run.isolationPolicyHash = policy.isolationPolicyHash
            capture = await self._executeDocument(
                task,
                document=document,
                policy=policy,
                activeRun=activeRun,
                runtimeEnvironment=secretEnvironment,
            )
            activeRun.check()
            run.isolationTerminationStatus = "destroyed" if activeRun.destroyed else "destroy-failed"
            run.isolationProofEligible = policy.proofEligible and activeRun.destroyed
            rawVariables = {variable.name: variable.repr for variable in capture.variables}
            run.output = redactTaskText(capture.stdout, secrets)
            run.variables = redactTaskVariables(rawVariables, secrets)
            if capture.status == "error":
                run.executionStatus = "failed"
                run.status = TaskStatus.FAILED
                run.error = redactTaskText(capture.error or f"Block {capture.failedBlockId} failed", secrets)
                run.validationErrors = ["execution-error"]
            else:
                run.executionStatus = "success"
                run.status = TaskStatus.SUCCESS
                evaluation = evaluateTaskOutput(
                    task,
                    capture,
                    workspaceRoot=self._workspaceRoot,
                    artifactSnapshot=artifactSnapshot,
                    secrets=secrets,
                )
                run.validated = evaluation.passed
                run.validationErrors = list(evaluation.errors)
                run.artifactDescriptors = list(evaluation.artifactDescriptors)
                run.inputHash = evaluation.inputHash
                run.checkSpecHash = evaluation.checkSpecHash
                run.operationalCandidate = bool(
                    evaluation.passed
                    and evaluation.artifactDescriptors
                    and (task.safetyApproval or {}).get("policyHash") == run.enforcementPolicyHash
                    and run.isolationProofEligible
                    and run.isolationTerminationStatus == "destroyed"
                )
                run.semanticStatus = (
                    "contract-passed"
                    if evaluation.passed
                    else "contract-failed"
                    if task.outputContract is not None
                    else "not-checked"
                )
                if task.outputContract is not None and not evaluation.passed:
                    run.status = TaskStatus.FAILED
                    run.error = redactTaskText(
                        f"Output contract failed: {', '.join(evaluation.errors)}",
                        secrets,
                    )
        except EmergencyStopActive as exc:
            run.executionStatus = "cancelled"
            run.status = TaskStatus.CANCELLED
            run.error = redactTaskText(exc, secrets)
            run.validationErrors = ["emergency-stop"]
        except Exception as exc:  # noqa: BLE001 - task execution boundary
            if activeRun.cancelled:
                run.executionStatus = "cancelled"
                run.status = TaskStatus.CANCELLED
                run.error = redactTaskText(EmergencyStopActive(eStop.reason), secrets)
                run.validationErrors = ["emergency-stop"]
            else:
                run.executionStatus = "failed"
                run.status = TaskStatus.FAILED
                run.error = redactTaskText(exc, secrets)
                run.validationErrors = ["execution-boundary-error"]
        finally:
            if activeRun.destroyed:
                run.isolationTerminationStatus = "destroyed"
            activeRun.close()
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
                    "executionStatus": run.executionStatus,
                    "semanticStatus": run.semanticStatus,
                    "proofStatus": run.proofStatus,
                    "durationMs": run.durationMs,
                    "riskLevel": task.riskLevel,
                    "permissionScopes": list(task.permissionScopes),
                    "safetyFingerprint": (task.safetyApproval or {}).get("fingerprint"),
                    "enforcementPolicyHash": run.enforcementPolicyHash,
                    "buildArtifactHash": run.buildArtifactHash,
                    "validated": run.validated,
                    "operationalCandidate": run.operationalCandidate,
                    "isolationProfile": run.isolationProfile,
                    "isolationPolicyHash": run.isolationPolicyHash,
                    "isolationTerminationStatus": run.isolationTerminationStatus,
                    "isolationProofEligible": run.isolationProofEligible,
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
        activeRun: ActiveRunContext,
        runtimeEnvironment: dict[str, str],
    ) -> CaptureResult:
        from ..kernel.documentExecution import captureDocument
        from ..kernel.manager import SessionManager

        manager = SessionManager(
            workspaceRoot=str(self._workspaceRoot),
            executionPolicy=policy,
            runtimeEnvironment=runtimeEnvironment,
            clearEnvironment=True,
        )

        def bindSession(session) -> None:
            activeRun.bindInterrupt(
                lambda _reason: session.destroyExecutionContext()
            )
            activeRun.check()

        def checkBeforeBlock(_block) -> None:
            getEmergencyStop().check()
            activeRun.check()

        try:
            capture = await captureDocument(
                document,
                manager=manager,
                onBlock=checkBeforeBlock,
                onSessionCreated=bindSession,
                executableBlockTypes=frozenset({"code", "automation"}),
                inputPrelude=taskInputPrelude(task.inputs),
            )
            activeRun.check()
            return capture
        finally:
            manager.destroyAll()
            activeRun.markDestroyed()
