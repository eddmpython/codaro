from __future__ import annotations

from ..proof import (
    BuildArtifact,
    FunctionalCheckReceipt,
    OperationalRunReceipt,
    PermissionReceipt,
    ProofArchive,
    SourceRevision,
    canonicalJson,
    contentDigest,
    sealProofReceipt,
)
from .taskModel import TaskDefinition, TaskRun


def recordPromotedTaskOperationalRun(
    task: TaskDefinition,
    run: TaskRun,
    *,
    proofArchive: ProofArchive,
) -> OperationalRunReceipt | None:
    """Append operational proof only for a fresh, semantically checked promoted run."""

    provenance = task.provenance or {}
    if provenance.get("kind") != "codaro.learning-artifact-promotion":
        return None
    core = {key: value for key, value in provenance.items() if key != "promotionHash"}
    if provenance.get("promotionHash") != contentDigest(canonicalJson(core)):
        return None
    requiredInputs = provenance.get("requiredInputNames")
    if (
        run.operationalCandidate is not True
        or not isinstance(requiredInputs, list)
        or not requiredInputs
        or set(task.inputs) != set(requiredInputs)
        or run.sourceHash != provenance.get("sourceBlockHash")
        or not run.inputHash
        or not run.checkSpecHash
        or not run.startedAt
        or not run.finishedAt
    ):
        return None
    source = proofArchive.receiptById(str(provenance.get("sourceRevisionReceiptId") or ""))
    build = proofArchive.receiptById(str(provenance.get("buildArtifactReceiptId") or ""))
    if not isinstance(source, SourceRevision) or not isinstance(build, BuildArtifact):
        return None
    artifactHashes = sorted({
        str(item.get("contentHash"))
        for item in run.artifactDescriptors
        if isinstance(item, dict) and item.get("contentHash")
    })
    if not artifactHashes or not task.safetyApproval or not run.enforcementPolicyHash:
        return None
    permission = sealProofReceipt({
        "kind": "permission",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "effectSetHash": source.effectSetHash,
        "permissionSetHash": contentDigest(canonicalJson({
            "enforcementPolicyHash": run.enforcementPolicyHash,
            "permissionScopes": sorted(task.permissionScopes),
        })),
        "approvedAt": str(task.safetyApproval.get("confirmedAt") or run.startedAt),
    })
    assert isinstance(permission, PermissionReceipt)
    check = sealProofReceipt({
        "kind": "functionalCheck",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "buildArtifactReceiptId": build.receiptId,
        "buildArtifactHash": build.buildArtifactHash,
        "inputHash": run.inputHash,
        "checkSpecHash": run.checkSpecHash,
        "artifactHashes": artifactHashes,
        "passed": True,
        "checkedAt": run.finishedAt,
    })
    assert isinstance(check, FunctionalCheckReceipt)
    operational = sealProofReceipt({
        "kind": "operationalRun",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "buildArtifactReceiptId": build.receiptId,
        "buildArtifactHash": build.buildArtifactHash,
        "inputHash": check.inputHash,
        "permissionReceiptId": permission.receiptId,
        "permissionSetHash": permission.permissionSetHash,
        "functionalCheckReceiptId": check.receiptId,
        "artifactHashes": check.artifactHashes,
        "learningEvidenceCreditIds": list(provenance["creditEventIds"]),
        "learningEvidenceArtifactHashes": list(provenance["learningArtifactHashes"]),
        "capabilityDomainId": str(provenance["capabilityDomainId"]),
        "taskId": task.id,
        "runId": run.id,
        "runtimeTier": "local",
        "learnerSelectedInput": True,
        "startedAt": run.startedAt,
        "finishedAt": run.finishedAt,
    })
    assert isinstance(operational, OperationalRunReceipt)
    proofArchive.appendReceipt(permission)
    proofArchive.appendReceipt(check)
    proofArchive.appendReceipt(operational)
    return operational
