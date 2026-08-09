from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from ..runtime.executionPolicy import EXECUTION_PERMISSION_SCOPES
from .taskModel import TaskDefinition


SAFETY_SCHEMA_VERSION = 1
SUPPORTED_RISK_LEVELS = {"destructive"}


class TaskSafetyError(Exception):
    def __init__(self, reason: str, message: str) -> None:
        super().__init__(message)
        self.reason = reason
        self.message = message


def taskSafetyStatus(task: TaskDefinition, *, workspaceRoot: str | Path) -> dict[str, Any]:
    try:
        fingerprint = taskSafetyFingerprint(task, workspaceRoot=workspaceRoot)
        policyHash = taskPermissionPolicyHash(task, workspaceRoot=workspaceRoot)
    except TaskSafetyError as error:
        return _statusPayload(
            task,
            status="blocked",
            reason=error.reason,
            fingerprint=None,
            policyHash=None,
        )

    approval = task.safetyApproval or {}
    if approval.get("fingerprint") != fingerprint:
        reason = "definition-changed" if approval else "not-confirmed"
        return _statusPayload(
            task,
            status="confirmationRequired",
            reason=reason,
            fingerprint=fingerprint,
            policyHash=policyHash,
        )
    if (
        approval.get("riskLevel") != task.riskLevel
        or approval.get("permissionScopes") != task.permissionScopes
        or approval.get("policyHash") != policyHash
    ):
        return _statusPayload(
            task,
            status="confirmationRequired",
            reason="permission-changed",
            fingerprint=fingerprint,
            policyHash=policyHash,
        )
    return _statusPayload(
        task,
        status="approved",
        reason="approved",
        fingerprint=fingerprint,
        policyHash=policyHash,
    )


def confirmTaskSafety(
    task: TaskDefinition,
    *,
    confirmation: str,
    workspaceRoot: str | Path,
) -> dict[str, Any]:
    if confirmation != task.id:
        raise TaskSafetyError(
            "confirmation-mismatch",
            "Task safety confirmation must match the exact task id.",
        )
    if task.riskLevel not in SUPPORTED_RISK_LEVELS:
        raise TaskSafetyError("risk-unsupported", "Task risk level is not supported.")
    _validatePermissionScopes(task.permissionScopes)

    fingerprint = taskSafetyFingerprint(task, workspaceRoot=workspaceRoot)
    policyHash = taskPermissionPolicyHash(task, workspaceRoot=workspaceRoot)
    return {
        "schemaVersion": SAFETY_SCHEMA_VERSION,
        "fingerprint": fingerprint,
        "confirmedAt": datetime.now(timezone.utc).isoformat(),
        "riskLevel": task.riskLevel,
        "permissionScopes": list(task.permissionScopes),
        "policyHash": policyHash,
    }


def requireTaskSafety(task: TaskDefinition, *, workspaceRoot: str | Path) -> dict[str, Any]:
    status = taskSafetyStatus(task, workspaceRoot=workspaceRoot)
    if status["status"] != "approved":
        raise TaskSafetyError(
            str(status["reason"]),
            _blockedMessage(str(status["reason"])),
        )
    return status


def taskSafetyFingerprint(task: TaskDefinition, *, workspaceRoot: str | Path) -> str:
    documentPath = resolveTaskDocumentPath(task, workspaceRoot)
    if not documentPath.is_file():
        raise TaskSafetyError("document-missing", "Task document is missing.")
    try:
        documentHash = hashlib.sha256(documentPath.read_bytes()).hexdigest()
    except OSError as error:
        raise TaskSafetyError("document-unreadable", "Task document cannot be read.") from error

    payload = {
        "schemaVersion": SAFETY_SCHEMA_VERSION,
        "taskId": task.id,
        "documentPath": str(documentPath),
        "documentSha256": documentHash,
        "schedule": task.schedule,
        "riskLevel": task.riskLevel,
        "permissionScopes": list(task.permissionScopes),
        "inputs": task.inputs,
        "outputContract": task.outputContract,
        "provenance": task.provenance,
        "secretRefs": sorted(task.secretRefs),
    }
    encoded = json.dumps(
        payload,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return f"sha256-{hashlib.sha256(encoded).hexdigest()}"


def taskPermissionPolicyHash(task: TaskDefinition, *, workspaceRoot: str | Path) -> str:
    _validatePermissionScopes(task.permissionScopes)
    workspace = Path(workspaceRoot).expanduser().resolve()
    payload = {
        "schemaVersion": 1,
        "workspaceRoot": str(workspace),
        "permissionScopes": sorted(task.permissionScopes),
        "riskLevel": task.riskLevel,
    }
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return f"sha256-{hashlib.sha256(encoded).hexdigest()}"


def resolveTaskDocumentPath(task: TaskDefinition, workspaceRoot: str | Path) -> Path:
    workspace = Path(workspaceRoot).expanduser().resolve()
    rawPath = Path(task.documentPath).expanduser()
    resolved = rawPath.resolve() if rawPath.is_absolute() else (workspace / rawPath).resolve()
    if not resolved.is_relative_to(workspace):
        raise TaskSafetyError("document-outside-workspace", "Task document must stay inside the workspace.")
    return resolved


def _statusPayload(
    task: TaskDefinition,
    *,
    status: str,
    reason: str,
    fingerprint: str | None,
    policyHash: str | None,
) -> dict[str, Any]:
    approval = task.safetyApproval or {}
    return {
        "status": status,
        "reason": reason,
        "riskLevel": task.riskLevel,
        "permissionScopes": list(task.permissionScopes),
        "fingerprint": fingerprint,
        "policyHash": policyHash,
        "approvedAt": approval.get("confirmedAt") if status == "approved" else None,
    }


def _blockedMessage(reason: str) -> str:
    messages = {
        "definition-changed": "Task code or schedule changed after safety confirmation.",
        "document-missing": "Task document is missing.",
        "document-unreadable": "Task document cannot be read.",
        "document-outside-workspace": "Task document must stay inside the workspace.",
        "not-confirmed": "Task permissions and destructive effects require confirmation.",
        "permission-changed": "Task permission scopes changed after safety confirmation.",
        "permissions-unsupported": "Task contains unsupported permission scopes.",
    }
    return messages.get(reason, "Task safety confirmation is required.")


def _validatePermissionScopes(scopes: list[str]) -> None:
    unknown = set(scopes) - EXECUTION_PERMISSION_SCOPES
    if unknown or len(scopes) != len(set(scopes)):
        raise TaskSafetyError("permissions-unsupported", "Task contains unsupported permission scopes.")
