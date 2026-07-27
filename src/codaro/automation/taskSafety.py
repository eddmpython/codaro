from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

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
    except TaskSafetyError as error:
        return _statusPayload(
            task,
            status="blocked",
            reason=error.reason,
            fingerprint=None,
        )

    approval = task.safetyApproval or {}
    if approval.get("fingerprint") != fingerprint:
        reason = "definition-changed" if approval else "not-confirmed"
        return _statusPayload(
            task,
            status="confirmationRequired",
            reason=reason,
            fingerprint=fingerprint,
        )
    if (
        approval.get("riskLevel") != task.riskLevel
        or approval.get("permissionScopes") != task.permissionScopes
    ):
        return _statusPayload(
            task,
            status="confirmationRequired",
            reason="permission-changed",
            fingerprint=fingerprint,
        )
    return _statusPayload(
        task,
        status="approved",
        reason="approved",
        fingerprint=fingerprint,
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
    if not task.permissionScopes:
        raise TaskSafetyError("permissions-empty", "Task permission scopes are empty.")

    fingerprint = taskSafetyFingerprint(task, workspaceRoot=workspaceRoot)
    return {
        "schemaVersion": SAFETY_SCHEMA_VERSION,
        "fingerprint": fingerprint,
        "confirmedAt": datetime.now(timezone.utc).isoformat(),
        "riskLevel": task.riskLevel,
        "permissionScopes": list(task.permissionScopes),
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
    documentPath = _taskDocumentPath(task, workspaceRoot)
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
    }
    encoded = json.dumps(
        payload,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return f"sha256-{hashlib.sha256(encoded).hexdigest()}"


def _taskDocumentPath(task: TaskDefinition, workspaceRoot: str | Path) -> Path:
    rawPath = Path(task.documentPath).expanduser()
    if rawPath.is_absolute():
        return rawPath.resolve()
    return (Path(workspaceRoot).expanduser().resolve() / rawPath).resolve()


def _statusPayload(
    task: TaskDefinition,
    *,
    status: str,
    reason: str,
    fingerprint: str | None,
) -> dict[str, Any]:
    approval = task.safetyApproval or {}
    return {
        "status": status,
        "reason": reason,
        "riskLevel": task.riskLevel,
        "permissionScopes": list(task.permissionScopes),
        "fingerprint": fingerprint,
        "approvedAt": approval.get("confirmedAt") if status == "approved" else None,
    }


def _blockedMessage(reason: str) -> str:
    messages = {
        "definition-changed": "Task code or schedule changed after safety confirmation.",
        "document-missing": "Task document is missing.",
        "document-unreadable": "Task document cannot be read.",
        "not-confirmed": "Task permissions and destructive effects require confirmation.",
        "permission-changed": "Task permission scopes changed after safety confirmation.",
    }
    return messages.get(reason, "Task safety confirmation is required.")
