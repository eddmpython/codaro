from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any


DEFAULT_TASK_PERMISSION_SCOPES = [
    "filesystem.read",
    "filesystem.write",
    "network",
    "process.execute",
]


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
    provenance: dict[str, Any] | None = None
    outputs: list[str] = field(default_factory=list)
    outputContract: dict[str, Any] | None = None
    secretRefs: list[str] = field(default_factory=list)
    permissionScopes: list[str] = field(default_factory=lambda: list(DEFAULT_TASK_PERMISSION_SCOPES))
    riskLevel: str = "destructive"
    safetyApproval: dict[str, Any] | None = None
    createdAt: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    enabled: bool = False

    def serialize(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "documentPath": self.documentPath,
            "schedule": self.schedule,
            "inputs": self.inputs,
            "provenance": self.provenance,
            "outputs": self.outputs,
            "outputContract": self.outputContract,
            "secretRefs": self.secretRefs,
            "permissionScopes": self.permissionScopes,
            "riskLevel": self.riskLevel,
            "safetyApproval": self.safetyApproval,
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
    executionStatus: str = "not-started"
    semanticStatus: str = "not-checked"
    validated: bool = False
    validationErrors: list[str] = field(default_factory=list)
    artifactDescriptors: list[dict[str, Any]] = field(default_factory=list)
    enforcementPolicyHash: str | None = None
    sourceHash: str | None = None
    buildArtifactHash: str | None = None
    inputHash: str | None = None
    checkSpecHash: str | None = None
    operationalCandidate: bool = False
    isolationProfile: str | None = None
    isolationPolicyHash: str | None = None
    isolationTerminationStatus: str | None = None
    isolationProofEligible: bool = False
    operationalReceiptId: str | None = None

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
            "executionStatus": self.executionStatus,
            "semanticStatus": self.semanticStatus,
            "proofStatus": self.proofStatus,
            "validated": self.validated,
            "validationErrors": self.validationErrors,
            "artifactDescriptors": self.artifactDescriptors,
            "enforcementPolicyHash": self.enforcementPolicyHash,
            "sourceHash": self.sourceHash,
            "buildArtifactHash": self.buildArtifactHash,
            "inputHash": self.inputHash,
            "checkSpecHash": self.checkSpecHash,
            "operationalCandidate": self.operationalCandidate,
            "isolationProfile": self.isolationProfile,
            "isolationPolicyHash": self.isolationPolicyHash,
            "isolationTerminationStatus": self.isolationTerminationStatus,
            "isolationProofEligible": self.isolationProofEligible,
            "operationalReceiptId": self.operationalReceiptId,
        }

    @property
    def proofStatus(self) -> str:
        if self.operationalReceiptId:
            return "operational-proof"
        if self.semanticStatus == "contract-passed":
            return "contract-passed"
        if self.semanticStatus == "contract-failed":
            return "contract-failed"
        return "semantic-not-checked"

    @classmethod
    def deserialize(cls, data: dict[str, Any]) -> "TaskRun":
        status = TaskStatus(str(data.get("status") or TaskStatus.PENDING.value))
        legacyExecutionStatus = (
            "success"
            if status == TaskStatus.SUCCESS
            else "failed"
            if status in {TaskStatus.FAILED, TaskStatus.CANCELLED}
            else "not-started"
        )
        legacySemanticStatus = "contract-passed" if data.get("validated") is True else "not-checked"
        return cls(
            id=str(data.get("id") or f"run-{uuid.uuid4().hex[:10]}"),
            taskId=str(data.get("taskId") or ""),
            status=status,
            startedAt=data.get("startedAt"),
            finishedAt=data.get("finishedAt"),
            durationMs=data.get("durationMs"),
            output=str(data.get("output") or ""),
            error=data.get("error"),
            variables=dict(data.get("variables") or {}),
            executionStatus=str(data.get("executionStatus") or legacyExecutionStatus),
            semanticStatus=str(data.get("semanticStatus") or legacySemanticStatus),
            validated=data.get("validated") is True,
            validationErrors=[str(value) for value in data.get("validationErrors", [])],
            artifactDescriptors=[
                dict(value)
                for value in data.get("artifactDescriptors", [])
                if isinstance(value, dict)
            ],
            enforcementPolicyHash=data.get("enforcementPolicyHash"),
            sourceHash=data.get("sourceHash"),
            buildArtifactHash=data.get("buildArtifactHash"),
            inputHash=data.get("inputHash"),
            checkSpecHash=data.get("checkSpecHash"),
            operationalCandidate=data.get("operationalCandidate") is True,
            isolationProfile=data.get("isolationProfile"),
            isolationPolicyHash=data.get("isolationPolicyHash"),
            isolationTerminationStatus=data.get("isolationTerminationStatus"),
            isolationProofEligible=data.get("isolationProofEligible") is True,
            operationalReceiptId=data.get("operationalReceiptId"),
        )
