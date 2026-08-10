from __future__ import annotations

import base64
from datetime import datetime
import hashlib
import json
from pathlib import PurePosixPath
import re
from typing import Any, Literal, Mapping, TypeAlias

from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator

from ..executionIsolation import proofExecutionIsolationPolicyHash


HASH_PATTERN = re.compile(r"^sha256-(?:[0-9a-f]{64}|[A-Za-z0-9_-]{43})$")
RECEIPT_ID_PATTERN = re.compile(
    r"^(sourceRevision|buildArtifact|permission|functionalCheck|operationalRun|deployment):"
    r"sha256-[A-Za-z0-9_-]{43}$"
)
SORTED_LIST_FIELDS = {
    "artifactHashes",
    "blockIds",
    "learningEvidenceArtifactHashes",
    "learningEvidenceCreditIds",
}


class ProofContractError(ValueError):
    pass


class _ProofReceipt(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True, strict=True)

    schemaVersion: Literal[1]
    kind: str
    receiptId: str

    @field_validator("receiptId")
    @classmethod
    def _validReceiptId(cls, value: str) -> str:
        if not RECEIPT_ID_PATTERN.fullmatch(value):
            raise ValueError("receiptId is not a supported proof receipt identity")
        return value

    @model_validator(mode="after")
    def _validCanonicalValues(self) -> "_ProofReceipt":
        payload = self.model_dump(mode="python")
        for fieldName, value in payload.items():
            if fieldName.endswith("Hash") and not _isHash(value):
                raise ValueError(f"{fieldName} must be a SHA-256 content hash")
            if fieldName.endswith("Hashes"):
                _requireSortedUnique(value, fieldName, hashes=True)
            elif fieldName in SORTED_LIST_FIELDS:
                _requireSortedUnique(value, fieldName, hashes=False)
            if fieldName.endswith("At"):
                _parseTimestamp(value, fieldName)
        return self


class SourceRevision(_ProofReceipt):
    kind: Literal["sourceRevision"]
    sourceHash: str
    dependencyHash: str
    packageSetHash: str
    effectSetHash: str
    documentPath: str
    blockIds: list[str] = Field(min_length=1)
    createdAt: str

    @field_validator("documentPath")
    @classmethod
    def _safeDocumentPath(cls, value: str) -> str:
        path = PurePosixPath(value)
        if not value or "\\" in value or ":" in value or path.is_absolute() or ".." in path.parts:
            raise ValueError("documentPath must be a safe repository-relative POSIX path")
        return value


class BuildArtifact(_ProofReceipt):
    kind: Literal["buildArtifact"]
    sourceRevisionId: str
    sourceHash: str
    buildArtifactHash: str
    manifestHash: str
    target: Literal["browser", "server", "local"]
    createdAt: str

    @model_validator(mode="after")
    def _validReferences(self) -> "BuildArtifact":
        _requireReceiptKind(self.sourceRevisionId, "sourceRevision", "sourceRevisionId")
        return self


class PermissionReceipt(_ProofReceipt):
    kind: Literal["permission"]
    sourceRevisionId: str
    sourceHash: str
    effectSetHash: str
    permissionSetHash: str
    approvedAt: str

    @model_validator(mode="after")
    def _validReferences(self) -> "PermissionReceipt":
        _requireReceiptKind(self.sourceRevisionId, "sourceRevision", "sourceRevisionId")
        return self


class FunctionalCheckReceipt(_ProofReceipt):
    kind: Literal["functionalCheck"]
    sourceRevisionId: str
    sourceHash: str
    buildArtifactReceiptId: str
    buildArtifactHash: str
    inputHash: str
    checkSpecHash: str
    artifactHashes: list[str] = Field(min_length=1)
    passed: Literal[True]
    checkedAt: str

    @model_validator(mode="after")
    def _validReferences(self) -> "FunctionalCheckReceipt":
        _requireReceiptKind(self.sourceRevisionId, "sourceRevision", "sourceRevisionId")
        _requireReceiptKind(self.buildArtifactReceiptId, "buildArtifact", "buildArtifactReceiptId")
        return self


class OperationalRunReceipt(_ProofReceipt):
    kind: Literal["operationalRun"]
    sourceRevisionId: str
    sourceHash: str
    buildArtifactReceiptId: str
    buildArtifactHash: str
    inputHash: str
    permissionReceiptId: str
    permissionSetHash: str
    functionalCheckReceiptId: str
    artifactHashes: list[str] = Field(min_length=1)
    learningEvidenceCreditIds: list[str] = Field(min_length=1)
    learningEvidenceArtifactHashes: list[str] = Field(min_length=1)
    capabilityDomainId: str = Field(min_length=1)
    taskId: str = Field(min_length=1)
    runId: str = Field(min_length=1)
    runtimeTier: Literal["server", "local"]
    isolationProfile: Literal["codaro-local-restricted-v1"]
    isolationPolicyHash: str
    isolationTerminationStatus: Literal["destroyed"]
    learnerSelectedInput: bool
    startedAt: str
    finishedAt: str

    @model_validator(mode="after")
    def _validReferencesAndTime(self) -> "OperationalRunReceipt":
        _requireReceiptKind(self.sourceRevisionId, "sourceRevision", "sourceRevisionId")
        _requireReceiptKind(self.buildArtifactReceiptId, "buildArtifact", "buildArtifactReceiptId")
        _requireReceiptKind(self.permissionReceiptId, "permission", "permissionReceiptId")
        _requireReceiptKind(self.functionalCheckReceiptId, "functionalCheck", "functionalCheckReceiptId")
        if self.isolationPolicyHash != proofExecutionIsolationPolicyHash():
            raise ValueError("isolationPolicyHash must identify the current proof execution policy")
        if _parseTimestamp(self.finishedAt, "finishedAt") < _parseTimestamp(self.startedAt, "startedAt"):
            raise ValueError("finishedAt must not precede startedAt")
        return self


class DeploymentReceipt(_ProofReceipt):
    kind: Literal["deployment"]
    sourceRevisionId: str
    sourceHash: str
    buildArtifactReceiptId: str
    buildArtifactHash: str
    manifestHash: str
    deploymentArtifactHash: str
    target: Literal["folder", "zip", "self-host", "provider"]
    verifiedAt: str

    @model_validator(mode="after")
    def _validReferences(self) -> "DeploymentReceipt":
        _requireReceiptKind(self.sourceRevisionId, "sourceRevision", "sourceRevisionId")
        _requireReceiptKind(self.buildArtifactReceiptId, "buildArtifact", "buildArtifactReceiptId")
        return self


ProofReceipt: TypeAlias = (
    SourceRevision
    | BuildArtifact
    | PermissionReceipt
    | FunctionalCheckReceipt
    | OperationalRunReceipt
    | DeploymentReceipt
)
RECEIPT_MODELS: dict[str, type[_ProofReceipt]] = {
    "sourceRevision": SourceRevision,
    "buildArtifact": BuildArtifact,
    "permission": PermissionReceipt,
    "functionalCheck": FunctionalCheckReceipt,
    "operationalRun": OperationalRunReceipt,
    "deployment": DeploymentReceipt,
}


def canonicalJson(value: object) -> str:
    if isinstance(value, BaseModel):
        value = value.model_dump(mode="json")
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def contentDigest(value: str | bytes) -> str:
    payload = value.encode("utf-8") if isinstance(value, str) else value
    encoded = base64.urlsafe_b64encode(hashlib.sha256(payload).digest()).decode("ascii").rstrip("=")
    return f"sha256-{encoded}"


def receiptDigest(value: Mapping[str, object] | _ProofReceipt) -> str:
    payload = dict(value.model_dump(mode="json") if isinstance(value, BaseModel) else value)
    payload.pop("receiptId", None)
    return contentDigest(canonicalJson(payload))


def sealProofReceipt(value: Mapping[str, object]) -> ProofReceipt:
    payload = _canonicalizeLists(dict(value))
    kind = payload.get("kind")
    if kind not in RECEIPT_MODELS:
        raise ProofContractError("proof receipt kind is not supported")
    payload.setdefault("schemaVersion", 1)
    payload.pop("receiptId", None)
    payload["receiptId"] = f"{kind}:{receiptDigest(payload)}"
    return validateProofReceipt(payload)


def validateProofReceipt(value: Mapping[str, object] | _ProofReceipt, *, verifyDigest: bool = True) -> ProofReceipt:
    payload = value.model_dump(mode="python") if isinstance(value, BaseModel) else value
    if not isinstance(payload, Mapping):
        raise ProofContractError("proof receipt must be an object")
    kind = payload.get("kind")
    model = RECEIPT_MODELS.get(str(kind))
    if model is None:
        raise ProofContractError("proof receipt kind is not supported")
    try:
        receipt = model.model_validate(dict(payload), strict=True)
    except ValidationError as error:
        raise ProofContractError(f"proof receipt is invalid: {error.errors(include_url=False)}") from error
    expectedId = f"{receipt.kind}:{receiptDigest(receipt)}"
    if verifyDigest and receipt.receiptId != expectedId:
        raise ProofContractError("proof receipt identity does not match its canonical payload")
    return receipt


def validateBuildLink(build: BuildArtifact, source: SourceRevision) -> BuildArtifact:
    if build.sourceRevisionId != source.receiptId or build.sourceHash != source.sourceHash:
        raise ProofContractError("build artifact does not match its source revision")
    return build


def validatePermissionLink(permission: PermissionReceipt, source: SourceRevision) -> PermissionReceipt:
    if (
        permission.sourceRevisionId != source.receiptId
        or permission.sourceHash != source.sourceHash
        or permission.effectSetHash != source.effectSetHash
    ):
        raise ProofContractError("permission receipt does not match its source revision and effects")
    return permission


def validateFunctionalCheckLink(
    check: FunctionalCheckReceipt,
    source: SourceRevision,
    build: BuildArtifact,
) -> FunctionalCheckReceipt:
    validateBuildLink(build, source)
    if (
        check.sourceRevisionId != source.receiptId
        or check.sourceHash != source.sourceHash
        or check.buildArtifactReceiptId != build.receiptId
        or check.buildArtifactHash != build.buildArtifactHash
    ):
        raise ProofContractError("functional check does not match its source and build")
    return check


def validateOperationalLink(
    operational: OperationalRunReceipt,
    source: SourceRevision,
    build: BuildArtifact,
    permission: PermissionReceipt,
    check: FunctionalCheckReceipt,
) -> OperationalRunReceipt:
    validatePermissionLink(permission, source)
    validateFunctionalCheckLink(check, source, build)
    if (
        operational.sourceRevisionId != source.receiptId
        or operational.sourceHash != source.sourceHash
        or operational.buildArtifactReceiptId != build.receiptId
        or operational.buildArtifactHash != build.buildArtifactHash
        or operational.inputHash != check.inputHash
        or operational.permissionReceiptId != permission.receiptId
        or operational.permissionSetHash != permission.permissionSetHash
        or operational.functionalCheckReceiptId != check.receiptId
        or operational.artifactHashes != check.artifactHashes
    ):
        raise ProofContractError("operational run receipt does not match its proof chain")
    return operational


def validateDeploymentLink(
    deployment: DeploymentReceipt,
    source: SourceRevision,
    build: BuildArtifact,
) -> DeploymentReceipt:
    validateBuildLink(build, source)
    if (
        deployment.sourceRevisionId != source.receiptId
        or deployment.sourceHash != source.sourceHash
        or deployment.buildArtifactReceiptId != build.receiptId
        or deployment.buildArtifactHash != build.buildArtifactHash
        or deployment.manifestHash != build.manifestHash
    ):
        raise ProofContractError("deployment receipt does not match its source and build")
    return deployment


def _canonicalizeLists(payload: dict[str, object]) -> dict[str, object]:
    for fieldName in SORTED_LIST_FIELDS:
        value = payload.get(fieldName)
        if isinstance(value, list) and all(isinstance(item, str) for item in value):
            payload[fieldName] = sorted(set(value))
    return payload


def _isHash(value: object) -> bool:
    return isinstance(value, str) and HASH_PATTERN.fullmatch(value) is not None


def _requireSortedUnique(value: object, fieldName: str, *, hashes: bool) -> None:
    if (
        not isinstance(value, list)
        or not value
        or not all(isinstance(item, str) and item for item in value)
        or value != sorted(set(value))
        or (hashes and not all(_isHash(item) for item in value))
    ):
        raise ValueError(f"{fieldName} must be a sorted unique non-empty list")


def _requireReceiptKind(value: str, expectedKind: str, fieldName: str) -> None:
    if not value.startswith(f"{expectedKind}:") or not RECEIPT_ID_PATTERN.fullmatch(value):
        raise ValueError(f"{fieldName} must reference a {expectedKind} receipt")


def _parseTimestamp(value: object, fieldName: str) -> datetime:
    if not isinstance(value, str) or not value:
        raise ValueError(f"{fieldName} must be an ISO timestamp")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as error:
        raise ValueError(f"{fieldName} must be an ISO timestamp") from error
    if parsed.tzinfo is None:
        raise ValueError(f"{fieldName} must include a timezone")
    return parsed
