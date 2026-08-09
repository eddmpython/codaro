from __future__ import annotations

from pathlib import Path

import pytest

from codaro.automation.taskModel import TaskRun, TaskStatus
from codaro.automation.taskRegistry import TaskRegistry
from codaro.proof import (
    PROOF_ARCHIVE_KIND,
    ProofArchive,
    ProofArchiveError,
    ProofContractError,
    contentDigest,
    sealProofReceipt,
    validateDeploymentLink,
    validateOperationalLink,
)


NOW = "2026-08-09T00:00:00+00:00"
LATER = "2026-08-09T00:01:00+00:00"


def _chain() -> dict[str, object]:
    source = sealProofReceipt({
        "kind": "sourceRevision",
        "sourceHash": contentDigest("source"),
        "dependencyHash": contentDigest("dependencies"),
        "packageSetHash": contentDigest("packages"),
        "effectSetHash": contentDigest("effects"),
        "documentPath": "automations/report.py",
        "blockIds": ["load", "report"],
        "createdAt": NOW,
    })
    build = sealProofReceipt({
        "kind": "buildArtifact",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "buildArtifactHash": contentDigest("build"),
        "manifestHash": contentDigest("manifest"),
        "target": "local",
        "createdAt": NOW,
    })
    permission = sealProofReceipt({
        "kind": "permission",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "effectSetHash": source.effectSetHash,
        "permissionSetHash": contentDigest("permission-set"),
        "approvedAt": NOW,
    })
    check = sealProofReceipt({
        "kind": "functionalCheck",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "buildArtifactReceiptId": build.receiptId,
        "buildArtifactHash": build.buildArtifactHash,
        "inputHash": contentDigest("input"),
        "checkSpecHash": contentDigest("check-spec"),
        "artifactHashes": [contentDigest("run-artifact")],
        "passed": True,
        "checkedAt": LATER,
    })
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
        "learningEvidenceCreditIds": ["credit-1"],
        "learningEvidenceArtifactHashes": [contentDigest("learning-artifact")],
        "capabilityDomainId": "reportAutomationFoundation",
        "taskId": "task-1",
        "runId": "run-1",
        "runtimeTier": "local",
        "learnerSelectedInput": True,
        "startedAt": NOW,
        "finishedAt": LATER,
    })
    deployment = sealProofReceipt({
        "kind": "deployment",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "buildArtifactReceiptId": build.receiptId,
        "buildArtifactHash": build.buildArtifactHash,
        "manifestHash": build.manifestHash,
        "deploymentArtifactHash": contentDigest("deployment"),
        "target": "folder",
        "verifiedAt": LATER,
    })
    return {
        "source": source,
        "build": build,
        "permission": permission,
        "check": check,
        "operational": operational,
        "deployment": deployment,
    }


def testProofArchiveImportsLinkedReceiptsIdempotentlyInAnyOrder(tmp_path: Path) -> None:
    chain = _chain()
    archive = ProofArchive(tmp_path / "proof.sqlite3")
    payload = {
        "archiveKind": PROOF_ARCHIVE_KIND,
        "schemaVersion": 1,
        "receipts": [receipt.model_dump(mode="json") for receipt in reversed(chain.values())],
    }

    first = archive.mergeArchive(payload)
    second = archive.mergeArchive(payload)

    assert first["inserted"] == 6
    assert first["conflicted"] == 0
    assert second["inserted"] == 0
    assert second["skipped"] == 6
    assert archive.summary() == {"receipts": 6, "conflicts": 0}
    assert archive.buildArchive()["archiveKind"] == PROOF_ARCHIVE_KIND
    validateOperationalLink(
        chain["operational"],
        chain["source"],
        chain["build"],
        chain["permission"],
        chain["check"],
    )
    validateDeploymentLink(chain["deployment"], chain["source"], chain["build"])


def testSameReceiptIdWithDifferentPayloadIsQuarantined(tmp_path: Path) -> None:
    archive = ProofArchive(tmp_path / "proof.sqlite3")
    source = _chain()["source"]
    archive.appendReceipt(source)
    conflicting = source.model_dump(mode="json")
    conflicting["sourceHash"] = contentDigest("different source")

    result = archive.appendReceipt(conflicting)

    assert result["conflicted"] == 1
    assert result["inserted"] == 0
    assert archive.summary() == {"receipts": 1, "conflicts": 1}
    assert archive.receiptById(source.receiptId) == source


@pytest.mark.parametrize(
    ("fieldName", "value"),
    [
        ("sourceHash", contentDigest("other-source")),
        ("buildArtifactHash", contentDigest("other-build")),
        ("inputHash", contentDigest("other-input")),
        ("permissionSetHash", contentDigest("other-permission")),
        ("functionalCheckReceiptId", f"functionalCheck:{contentDigest('other-check')}"),
        ("artifactHashes", [contentDigest("other-artifact")]),
    ],
)
def testOperationalLinkRejectsEveryBrokenHashBinding(fieldName: str, value: object) -> None:
    chain = _chain()
    payload = chain["operational"].model_dump(mode="json")
    payload[fieldName] = value
    changed = sealProofReceipt(payload)

    with pytest.raises(ProofContractError):
        validateOperationalLink(
            changed,
            chain["source"],
            chain["build"],
            chain["permission"],
            chain["check"],
        )


def testArchiveRejectsUnlinkedOperationalReceipt(tmp_path: Path) -> None:
    archive = ProofArchive(tmp_path / "proof.sqlite3")
    with pytest.raises(ProofArchiveError, match="dependency is missing"):
        archive.appendReceipt(_chain()["operational"])


def testLegacyTaskRunsAreNeverMigratedIntoProofArchive(tmp_path: Path) -> None:
    registry = TaskRegistry(tmp_path / "tasks")
    task = registry.create(name="Legacy", documentPath="legacy.py")
    registry.addRun(TaskRun(taskId=task.id, status=TaskStatus.SUCCESS))

    archive = ProofArchive(tmp_path / "proof.sqlite3")
    archive.initialize()

    assert registry.getLastRun(task.id) is not None
    assert archive.summary() == {"receipts": 0, "conflicts": 0}
