from __future__ import annotations

from dataclasses import dataclass, field
import os
import json
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
    if len(executable) == 1:
        return contentDigest(str(executable[0]["content"]))
    return contentDigest(canonicalJson(executable))


def taskInputPrelude(inputs: Mapping[str, object]) -> str:
    """Return a JSON-only prelude that exposes declared Task inputs to Python.

    The prelude is runtime state, not generated source, so the promoted block keeps
    the same content hash as its learning evidence.  Names that could mutate Python
    internals are rejected before any learner code executes.
    """

    if not inputs:
        return ""
    if any(not isinstance(name, str) or not name.isidentifier() or name.startswith("_") for name in inputs):
        raise TaskExecutionError("task-input-name-invalid")
    try:
        encodedValues = {
            name: json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
            for name, value in sorted(inputs.items())
        }
    except (TypeError, ValueError) as error:
        raise TaskExecutionError("task-input-json-invalid") from error
    assignments = "".join(
        f"{name} = __codaro_json.loads({encoded!r})\n"
        for name, encoded in encodedValues.items()
    )
    return "import json as __codaro_json\n" + assignments + "del __codaro_json\n"


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
        jsonSchema = artifact.get("jsonSchema")
        if jsonSchema is not None:
            errors.extend(_validateJsonArtifact(payload, str(artifact["path"]), jsonSchema))
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
            if not isinstance(artifact, dict) or not {"path", "minBytes"}.issubset(artifact) or set(artifact) - {
                "path", "minBytes", "contentHash", "jsonSchema"
            }:
                raise TaskExecutionError("output-contract-artifacts-invalid")
            path = artifact.get("path")
            minBytes = artifact.get("minBytes")
            contentHash = artifact.get("contentHash")
            jsonSchema = artifact.get("jsonSchema")
            if (
                not isinstance(path, str)
                or not _safeRelativePath(path)
                or isinstance(minBytes, bool)
                or not isinstance(minBytes, int)
                or minBytes < 0
                or (contentHash is not None and not isinstance(contentHash, str))
            ):
                raise TaskExecutionError("output-contract-artifacts-invalid")
            normalizedJsonSchema = _normalizeJsonArtifactSchema(jsonSchema) if jsonSchema is not None else None
            normalizedArtifacts.append({
                "path": path,
                "minBytes": minBytes,
                **({"contentHash": contentHash} if contentHash is not None else {}),
                **({"jsonSchema": normalizedJsonSchema} if normalizedJsonSchema is not None else {}),
            })
        if len({item["path"] for item in normalizedArtifacts}) != len(normalizedArtifacts):
            raise TaskExecutionError("output-contract-artifacts-duplicate")
        normalized["artifacts"] = sorted(normalizedArtifacts, key=lambda item: item["path"])
    return normalized


def _normalizeJsonArtifactSchema(value: object) -> dict[str, object]:
    if not isinstance(value, dict) or set(value) != {"requiredFields", "fieldTypes"}:
        raise TaskExecutionError("output-contract-json-schema-invalid")
    requiredFields = value.get("requiredFields")
    fieldTypes = value.get("fieldTypes")
    supportedTypes = {"integer", "number", "string", "boolean", "object", "array", "null"}
    if (
        not isinstance(requiredFields, list)
        or not requiredFields
        or not all(isinstance(field, str) and field for field in requiredFields)
        or len(requiredFields) != len(set(requiredFields))
        or not isinstance(fieldTypes, dict)
        or set(fieldTypes) != set(requiredFields)
        or not all(isinstance(kind, str) and kind in supportedTypes for kind in fieldTypes.values())
    ):
        raise TaskExecutionError("output-contract-json-schema-invalid")
    return {
        "requiredFields": sorted(requiredFields),
        "fieldTypes": {field: fieldTypes[field] for field in sorted(fieldTypes)},
    }


def _validateJsonArtifact(payload: bytes, path: str, schema: Mapping[str, object]) -> list[str]:
    try:
        value = json.loads(payload.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return [f"artifact-json-invalid:{path}"]
    if not isinstance(value, dict):
        return [f"artifact-json-object-required:{path}"]
    errors: list[str] = []
    fieldTypes = schema["fieldTypes"]
    assert isinstance(fieldTypes, dict)
    for field in schema["requiredFields"]:
        if field not in value:
            errors.append(f"artifact-json-field-missing:{path}:{field}")
            continue
        if not _jsonValueMatchesType(value[field], str(fieldTypes[field])):
            errors.append(f"artifact-json-field-type:{path}:{field}")
    return errors


def _jsonValueMatchesType(value: object, kind: str) -> bool:
    if kind == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if kind == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    if kind == "string":
        return isinstance(value, str)
    if kind == "boolean":
        return isinstance(value, bool)
    if kind == "object":
        return isinstance(value, dict)
    if kind == "array":
        return isinstance(value, list)
    return value is None


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
