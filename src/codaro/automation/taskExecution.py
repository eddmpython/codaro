from __future__ import annotations

from dataclasses import dataclass, field
import os
from pathlib import Path, PurePosixPath
import re
from typing import Any, Mapping

from ..document.models import CodaroDocument
from ..kernel.documentExecution import CaptureResult
from ..proof.contracts import canonicalJson, contentDigest
from .taskModel import TaskDefinition


OUTPUT_CONTRACT_FIELDS = {
    "schemaVersion",
    "stdoutEquals",
    "stdoutContains",
    "requiredVariables",
    "artifacts",
}
MAX_PERSISTED_TASK_TEXT = 200_000
SECRET_REF_PATTERN = re.compile(r"^[A-Z][A-Z0-9_]{1,127}$")


class TaskExecutionError(ValueError):
    pass


@dataclass(frozen=True, slots=True)
class TaskOutputEvaluation:
    passed: bool
    errors: list[str] = field(default_factory=list)
    artifactDescriptors: list[dict[str, Any]] = field(default_factory=list)
    inputHash: str | None = None
    checkSpecHash: str | None = None


def resolveTaskSecretValues(task: TaskDefinition) -> tuple[str, ...]:
    values: list[str] = []
    for reference in task.secretRefs:
        if not SECRET_REF_PATTERN.fullmatch(reference):
            raise TaskExecutionError("task secret reference name is invalid")
        value = os.environ.get(reference)
        if value is None or not value:
            raise TaskExecutionError(f"task secret reference is unavailable: {reference}")
        values.append(value)
    return tuple(sorted(set(values), key=len, reverse=True))


def redactTaskText(value: object, secrets: tuple[str, ...]) -> str:
    text = str(value or "")
    for secret in secrets:
        text = text.replace(secret, "[redacted]")
    text = re.sub(r"Bearer\s+[A-Za-z0-9._~+/=-]+", "Bearer [redacted]", text)
    text = re.sub(r"sk-[A-Za-z0-9_-]{12,}", "sk-[redacted]", text)
    return text[:MAX_PERSISTED_TASK_TEXT]


def redactTaskVariables(values: Mapping[str, object], secrets: tuple[str, ...]) -> dict[str, str]:
    return {
        str(name): redactTaskText(value, secrets)
        for name, value in values.items()
    }


def documentSourceHash(document: CodaroDocument) -> str:
    executable = [
        {"blockId": block.id, "content": block.content, "type": block.type}
        for block in document.blocks
        if block.type in {"code", "automation"} and block.content.strip()
    ]
    return contentDigest(canonicalJson(executable))


def evaluateTaskOutput(
    task: TaskDefinition,
    capture: CaptureResult,
    *,
    workspaceRoot: str | Path,
) -> TaskOutputEvaluation:
    contract = task.outputContract
    if contract is None:
        return TaskOutputEvaluation(passed=False, errors=["output-contract-missing"])
    try:
        normalized = _validateOutputContract(contract)
    except TaskExecutionError as error:
        return TaskOutputEvaluation(passed=False, errors=[str(error)])

    errors: list[str] = []
    stdoutEquals = normalized.get("stdoutEquals")
    if isinstance(stdoutEquals, str) and capture.stdout.strip() != stdoutEquals.strip():
        errors.append("stdout-equals-mismatch")
    stdoutContains = normalized.get("stdoutContains", [])
    for expected in stdoutContains:
        if expected not in capture.stdout:
            errors.append(f"stdout-missing:{expected}")
    variableByName = {variable.name: variable.repr for variable in capture.variables}
    for name, expected in normalized.get("requiredVariables", {}).items():
        if variableByName.get(name) != expected:
            errors.append(f"variable-mismatch:{name}")

    artifactDescriptors: list[dict[str, Any]] = []
    for artifact in normalized.get("artifacts", []):
        try:
            path = _workspaceArtifactPath(str(artifact["path"]), workspaceRoot)
        except TaskExecutionError:
            errors.append(f"artifact-path-invalid:{artifact['path']}")
            continue
        if not path.is_file():
            errors.append(f"artifact-missing:{artifact['path']}")
            continue
        try:
            payload = path.read_bytes()
        except OSError:
            errors.append(f"artifact-unreadable:{artifact['path']}")
            continue
        contentHash = contentDigest(payload)
        if len(payload) < artifact["minBytes"]:
            errors.append(f"artifact-too-small:{artifact['path']}")
        expectedHash = artifact.get("contentHash")
        if expectedHash is not None and contentHash != expectedHash:
            errors.append(f"artifact-hash-mismatch:{artifact['path']}")
        artifactDescriptors.append({
            "schemaVersion": 1,
            "kind": "file",
            "path": str(artifact["path"]),
            "byteLength": len(payload),
            "contentHash": contentHash,
            "fileCount": 1,
        })

    return TaskOutputEvaluation(
        passed=not errors,
        errors=errors,
        artifactDescriptors=sorted(artifactDescriptors, key=lambda item: str(item["path"])),
        inputHash=contentDigest(canonicalJson(task.inputs)),
        checkSpecHash=contentDigest(canonicalJson(normalized)),
    )


def _validateOutputContract(value: object) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) - OUTPUT_CONTRACT_FIELDS or value.get("schemaVersion") != 1:
        raise TaskExecutionError("output-contract-invalid")
    criteria = set(value) - {"schemaVersion"}
    if not criteria:
        raise TaskExecutionError("output-contract-empty")
    normalized: dict[str, Any] = {"schemaVersion": 1}
    stdoutEquals = value.get("stdoutEquals")
    if stdoutEquals is not None:
        if not isinstance(stdoutEquals, str):
            raise TaskExecutionError("output-contract-stdout-invalid")
        normalized["stdoutEquals"] = stdoutEquals
    stdoutContains = value.get("stdoutContains")
    if stdoutContains is not None:
        if (
            not isinstance(stdoutContains, list)
            or not stdoutContains
            or not all(isinstance(item, str) and item for item in stdoutContains)
        ):
            raise TaskExecutionError("output-contract-stdout-invalid")
        normalized["stdoutContains"] = sorted(set(stdoutContains))
    requiredVariables = value.get("requiredVariables")
    if requiredVariables is not None:
        if (
            not isinstance(requiredVariables, dict)
            or not requiredVariables
            or not all(isinstance(name, str) and name and isinstance(expected, str) for name, expected in requiredVariables.items())
        ):
            raise TaskExecutionError("output-contract-variables-invalid")
        normalized["requiredVariables"] = {
            name: requiredVariables[name]
            for name in sorted(requiredVariables)
        }
    artifacts = value.get("artifacts")
    if artifacts is not None:
        if not isinstance(artifacts, list) or not artifacts:
            raise TaskExecutionError("output-contract-artifacts-invalid")
        normalizedArtifacts: list[dict[str, Any]] = []
        for artifact in artifacts:
            if not isinstance(artifact, dict) or set(artifact) not in ({"path", "minBytes"}, {"path", "minBytes", "contentHash"}):
                raise TaskExecutionError("output-contract-artifacts-invalid")
            path = artifact.get("path")
            minBytes = artifact.get("minBytes")
            contentHash = artifact.get("contentHash")
            if (
                not isinstance(path, str)
                or not _safeRelativePath(path)
                or isinstance(minBytes, bool)
                or not isinstance(minBytes, int)
                or minBytes < 0
                or (contentHash is not None and not isinstance(contentHash, str))
            ):
                raise TaskExecutionError("output-contract-artifacts-invalid")
            normalizedArtifacts.append({
                "path": path,
                "minBytes": minBytes,
                **({"contentHash": contentHash} if contentHash is not None else {}),
            })
        if len({item["path"] for item in normalizedArtifacts}) != len(normalizedArtifacts):
            raise TaskExecutionError("output-contract-artifacts-duplicate")
        normalized["artifacts"] = sorted(normalizedArtifacts, key=lambda item: item["path"])
    return normalized


def _workspaceArtifactPath(relativePath: str, workspaceRoot: str | Path) -> Path:
    if not _safeRelativePath(relativePath):
        raise TaskExecutionError("artifact path must be workspace-relative")
    workspace = Path(workspaceRoot).expanduser().resolve()
    path = (workspace / relativePath).resolve()
    if not path.is_relative_to(workspace):
        raise TaskExecutionError("artifact path must stay inside the workspace")
    return path


def _safeRelativePath(value: str) -> bool:
    path = PurePosixPath(value)
    return bool(value) and "\\" not in value and ":" not in value and not path.is_absolute() and ".." not in path.parts
