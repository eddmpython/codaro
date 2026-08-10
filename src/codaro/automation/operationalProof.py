from __future__ import annotations

from pathlib import Path

from ..document.service import loadDocument
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
from ..proof.contracts import validateBuildLink
from ..publication.proofLineage import PublicationProofError, promotedBlockProofLineage
from ..executionIsolation import (
    PROOF_EXECUTION_ISOLATION_PROFILE,
    proofExecutionIsolationPolicyHash,
)
from .taskModel import TaskDefinition, TaskRun
from .taskSafety import TaskSafetyError, resolveTaskDocumentPath


def recordPromotedTaskOperationalRun(
    task: TaskDefinition,
    run: TaskRun,
    *,
    proofArchive: ProofArchive,
    workspaceRoot: str | Path,
) -> OperationalRunReceipt | None:
    """Append operational proof only for a fresh, semantically checked promoted run."""

    provenance = task.provenance or {}
    if provenance.get("kind") != "codaro.learning-artifact-promotion":
        return None
    core = {key: value for key, value in provenance.items() if key != "promotionHash"}
    if provenance.get("promotionHash") != contentDigest(canonicalJson(core)):
        return None
    requiredInputs = provenance.get("requiredInputNames")
    fixtureHashes = provenance.get("learningFixtureHashes")
    initialLearnerInputHash = provenance.get("learnerSelectedInputHash")
    expectedInputHash = contentDigest(canonicalJson(task.inputs))
    if (
        run.operationalCandidate is not True
        or run.executionStatus != "success"
        or run.semanticStatus != "contract-passed"
        or not isinstance(requiredInputs, list)
        or not requiredInputs
        or set(task.inputs) != set(requiredInputs)
        or provenance.get("inputSelectionMode") != "learner"
        or not isinstance(initialLearnerInputHash, str)
        or not initialLearnerInputHash.startswith("sha256-")
        or run.inputHash != expectedInputHash
        or not isinstance(fixtureHashes, list)
        or not fixtureHashes
        or not all(isinstance(value, str) and value for value in fixtureHashes)
        or run.sourceHash != provenance.get("sourceBlockHash")
        or not run.buildArtifactHash
        or not run.inputHash
        or not run.checkSpecHash
        or not run.startedAt
        or not run.finishedAt
        or run.isolationProofEligible is not True
        or run.isolationProfile != PROOF_EXECUTION_ISOLATION_PROFILE
        or run.isolationPolicyHash != proofExecutionIsolationPolicyHash()
        or run.isolationTerminationStatus != "destroyed"
    ):
        return None
    source = proofArchive.receiptById(str(provenance.get("sourceRevisionReceiptId") or ""))
    build = proofArchive.receiptById(str(provenance.get("buildArtifactReceiptId") or ""))
    if not isinstance(source, SourceRevision) or not isinstance(build, BuildArtifact):
        return None
    try:
        validateBuildLink(build, source)
        documentPath = resolveTaskDocumentPath(task, workspaceRoot)
        persistedDocumentBytes = documentPath.read_bytes()
        currentBuildHash = contentDigest(persistedDocumentBytes)
        document = loadDocument(str(documentPath))
        documentStable = documentPath.read_bytes() == persistedDocumentBytes
        executableUnit = provenance.get("executableUnit")
        entryBlockId = executableUnit.get("entryBlockId") if isinstance(executableUnit, dict) else None
        entryBlock = next((block for block in document.blocks if block.id == entryBlockId), None)
        lineage = promotedBlockProofLineage(
            entryBlock.sourceType if entryBlock is not None else None,
            entryBlock.payload if entryBlock is not None else None,
        )
    except (OSError, PublicationProofError, TaskSafetyError, ValueError):
        return None
    if (
        source.documentPath != task.documentPath
        or not documentStable
        or build.target != "local"
        or run.buildArtifactHash != build.buildArtifactHash
        or currentBuildHash != run.buildArtifactHash
        or lineage is None
        or lineage.get("sourceRevisionReceiptId") != source.receiptId
        or lineage.get("sourceBlockHash") != source.sourceHash
        or lineage.get("dependencyHash") != source.dependencyHash
        or lineage.get("lineageHash") != build.manifestHash
        or lineage.get("learningCreditIds") != provenance.get("creditEventIds")
        or lineage.get("learningCheckIds") != executableUnit.get("checkScenarioIds")
    ):
        return None
    artifactHashes = sorted({
        str(item.get("contentHash"))
        for item in run.artifactDescriptors
        if isinstance(item, dict) and item.get("origin") == "created" and item.get("contentHash")
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
            "isolationPolicyHash": run.isolationPolicyHash,
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
        "isolationProfile": run.isolationProfile,
        "isolationPolicyHash": run.isolationPolicyHash,
        "isolationTerminationStatus": run.isolationTerminationStatus,
        "learnerSelectedInput": True,
        "startedAt": run.startedAt,
        "finishedAt": run.finishedAt,
    })
    assert isinstance(operational, OperationalRunReceipt)
    proofArchive.appendReceipt(permission)
    proofArchive.appendReceipt(check)
    proofArchive.appendReceipt(operational)
    run.operationalReceiptId = operational.receiptId
    return operational
