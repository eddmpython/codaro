from __future__ import annotations

from itertools import count

import pytest

from codaro.curriculum.capabilityProjection import projectCapability
from codaro.curriculum.learningEvent import learningEventDigest, sealLearningEvent
from codaro.curriculum.taxonomy import TaskFamilyDef, TaskFamilyVariantDef, loadTaxonomy
from codaro.proof import contentDigest, sealProofReceipt, validateOperationalLink
from codaro.executionIsolation import proofExecutionIsolationPolicyHash


def _transaction(
    family: TaskFamilyDef,
    variant: TaskFamilyVariantDef,
    *,
    mode: str,
    occurredAt: str,
    sequence: count,
    claimVersion: int = 1,
    tier: str = "browser",
    artifacts: list[dict[str, object]] | None = None,
) -> list[dict[str, object]]:
    base = next(sequence)
    runId = f"run-{base}"
    run = _envelope(
        "RunObserved",
        base,
        occurredAt,
        artifactDescriptors=artifacts or [],
        completedAt=occurredAt,
        exception=None,
        runContext={
            "attemptId": f"attempt-{base}",
            "capabilityClaimId": family.ownerClaimId,
            "capabilityClaimVersion": claimVersion,
            "checkEngineVersion": "local-sandbox-v1" if tier == "local" else "browser-worker-v1",
            "checkSpecId": variant.checkSpecId,
            "checkSpecVersion": variant.checkSpecVersion,
            "fixtureHash": variant.fixtureHash,
            "lessonContentHash": learningEventDigest(variant.lessonRef),
            "lessonRef": variant.lessonRef,
            "masteryPolicyVersion": 2,
            "outcomeIds": family.outcomeIds,
            "packageSetHash": learningEventDigest("packages"),
            "runId": runId,
            "runtimeId": "codaro-local" if tier == "local" else "pyproc",
            "runtimeVersion": "1",
            "sectionId": variant.sectionId,
            "sourceCodeHash": learningEventDigest(f"source-{base}"),
            "taskFamilyId": family.id,
            "taskFamilyVersion": family.version,
            "taskVariantId": variant.taskVariantId,
            "taskVariantVersion": variant.taskVariantVersion,
            "tierUsed": tier,
            **({"artifactContractId": family.artifactContractId} if family.artifactContractId else {}),
            **({"artifactContractVersion": family.artifactContractVersion} if family.artifactContractVersion else {}),
        },
        runStatus="success",
        startedAt=occurredAt,
        stderr="",
        stdout="",
    )
    check = _envelope(
        "CheckEvaluated",
        next(sequence),
        occurredAt,
        assessmentMode=mode,
        checkId=variant.checkSpecId,
        errorClass="",
        passed=True,
        recommendedHintLevel=0,
        runEventId=run["eventId"],
        strength="strong",
        unseen=True,
    )
    credit = _envelope(
        "CreditGranted",
        next(sequence),
        occurredAt,
        appendReceiptAt=occurredAt,
        attemptFingerprint=learningEventDigest(f"attempt-{base}"),
        checkEventIds=[check["eventId"]],
        creditSlices=[{
            "creditMode": mode,
            "outcomeId": outcomeId,
            "preAttemptState": "unproven",
        } for outcomeId in family.outcomeIds],
        evidenceTime=occurredAt,
        runEventId=run["eventId"],
        supportEventIds=[],
    )
    return [run, check, credit]


def _envelope(kind: str, sequence: int, occurredAt: str, **payload: object) -> dict[str, object]:
    return sealLearningEvent({
        "deviceId": "capability-test",
        "deviceSequence": str(sequence),
        "epochRefByScope": {"global": "epoch", "lesson": "epoch"},
        "eventId": f"capability-{sequence}-{kind}",
        "kind": kind,
        "lamport": str(sequence),
        "learningEpoch": "epoch",
        "occurredAt": occurredAt,
        "schemaVersion": 1,
        **payload,
    })


def testDomainStageUsesLowestRequiredTaskFamily() -> None:
    taxonomy = loadTaxonomy()
    recordFamily = taxonomy.taskFamilyById("python.report.record")
    assert recordFamily is not None
    events = _transaction(
        recordFamily,
        recordFamily.variants["acquisition"],
        mode="acquisition",
        occurredAt="2026-01-01T00:00:00+00:00",
        sequence=count(1),
    )

    projection = projectCapability(taxonomy, "reportAutomationFoundation", events)

    assert projection.assuranceStage == "unproven"
    assert next(item for item in projection.taskFamilies if item.taskFamilyId == recordFamily.id).stage == "independent"
    assert next(item for item in projection.claims if item.claimId == "report.pipeline").stage == "unproven"


def testCurrentVersionEvidenceRaisesEveryFamilyToIndependent() -> None:
    taxonomy = loadTaxonomy()
    sequence = count(1)
    events: list[dict[str, object]] = []
    for family in taxonomy.taskFamilies:
        events.extend(_transaction(
            family,
            family.variants["acquisition"],
            mode="acquisition",
            occurredAt="2026-01-01T00:00:00+00:00",
            sequence=sequence,
        ))

    projection = projectCapability(taxonomy, "reportAutomationFoundation", events)

    assert projection.assuranceStage == "independent"
    assert all(family.stage == "independent" for family in projection.taskFamilies)


def testOldClaimVersionIsPreservedButDoesNotRaiseCurrentStage() -> None:
    taxonomy = loadTaxonomy()
    family = taxonomy.taskFamilyById("python.report.record")
    assert family is not None
    events = _transaction(
        family,
        family.variants["acquisition"],
        mode="acquisition",
        occurredAt="2026-01-01T00:00:00+00:00",
        sequence=count(1),
        claimVersion=99,
    )

    projection = projectCapability(taxonomy, "reportAutomationFoundation", events)

    assert next(item for item in projection.taskFamilies if item.taskFamilyId == family.id).stage == "unproven"


def testApplicationProofRequiresLocalArtifactAndOnlyTrustsLinkedOperationalReceipt() -> None:
    taxonomy = loadTaxonomy()
    sequence = count(1)
    events: list[dict[str, object]] = []
    for family in taxonomy.taskFamilies:
        events.extend(_transaction(
            family,
            family.variants["acquisition"],
            mode="acquisition",
            occurredAt="2026-01-01T00:00:00+00:00",
            sequence=sequence,
        ))
    delivery = taxonomy.taskFamilyById("python.report.delivery")
    assert delivery is not None and delivery.applicationVariant is not None
    events.extend(_transaction(
        delivery,
        delivery.applicationVariant,
        mode="capstone",
        occurredAt="2026-01-02T00:00:00+00:00",
        sequence=sequence,
        tier="local",
        artifacts=[{
            "byteLength": 42,
            "contentHash": learningEventDigest("report"),
            "fileCount": 1,
            "kind": "file",
            "origin": "created",
            "path": "report.json",
            "schemaVersion": 1,
        }],
    ))

    integrated = projectCapability(taxonomy, "reportAutomationFoundation", events)
    assert integrated.application.stage == "integrated"
    assert integrated.application.receiptCount == 1
    with pytest.raises(TypeError):
        projectCapability(
            taxonomy,
            "reportAutomationFoundation",
            events,
            automationRuns=[{"validated": True, "learnerSelectedInput": True}],
        )

    applicationReceipt = integrated.application.receipts[0]
    source = sealProofReceipt({
        "kind": "sourceRevision",
        "sourceHash": applicationReceipt.sourceCodeHash,
        "dependencyHash": contentDigest("dependencies"),
        "packageSetHash": contentDigest("packages"),
        "effectSetHash": contentDigest("effects"),
        "documentPath": "automations/report.py",
        "blockIds": ["report"],
        "createdAt": "2026-01-03T00:00:00+00:00",
    })
    build = sealProofReceipt({
        "kind": "buildArtifact",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "buildArtifactHash": contentDigest("build"),
        "manifestHash": contentDigest("manifest"),
        "target": "local",
        "createdAt": "2026-01-03T00:00:00+00:00",
    })
    permission = sealProofReceipt({
        "kind": "permission",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "effectSetHash": source.effectSetHash,
        "permissionSetHash": contentDigest("permission"),
        "approvedAt": "2026-01-03T00:00:00+00:00",
    })
    check = sealProofReceipt({
        "kind": "functionalCheck",
        "sourceRevisionId": source.receiptId,
        "sourceHash": source.sourceHash,
        "buildArtifactReceiptId": build.receiptId,
        "buildArtifactHash": build.buildArtifactHash,
        "inputHash": contentDigest("learner-input"),
        "checkSpecHash": contentDigest("operational-check"),
        "artifactHashes": [contentDigest("rerun-report")],
        "passed": True,
        "checkedAt": "2026-01-03T00:01:00+00:00",
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
        "learningEvidenceCreditIds": [applicationReceipt.creditEventId],
        "learningEvidenceArtifactHashes": applicationReceipt.artifactContentHashes,
        "capabilityDomainId": "reportAutomationFoundation",
        "taskId": "task-report",
        "runId": "run-report",
        "runtimeTier": "local",
        "isolationProfile": "codaro-local-restricted-v1",
        "isolationPolicyHash": proofExecutionIsolationPolicyHash(),
        "isolationTerminationStatus": "destroyed",
        "learnerSelectedInput": True,
        "startedAt": "2026-01-03T00:00:00+00:00",
        "finishedAt": "2026-01-03T00:01:00+00:00",
    })
    validateOperationalLink(operational, source, build, permission, check)

    rerun = projectCapability(
        taxonomy,
        "reportAutomationFoundation",
        events,
        operationalReceipts=[operational],
    )

    assert rerun.application.stage == "rerun"
    assert rerun.application.operationalReceiptIds == [operational.receiptId]
    assert rerun.application.userInputRerun is True


def testTombstonedApplicationReceiptNoLongerRaisesApplicationStage() -> None:
    taxonomy = loadTaxonomy()
    delivery = taxonomy.taskFamilyById("python.report.delivery")
    assert delivery is not None and delivery.applicationVariant is not None
    sequence = count(1)
    events = _transaction(
        delivery,
        delivery.applicationVariant,
        mode="capstone",
        occurredAt="2026-01-02T00:00:00+00:00",
        sequence=sequence,
        tier="local",
        artifacts=[{
            "byteLength": 42,
            "contentHash": learningEventDigest("report"),
            "fileCount": 1,
            "kind": "file",
            "origin": "created",
            "path": "report.json",
            "schemaVersion": 1,
        }],
    )
    creditId = str(events[-1]["eventId"])
    events.append(_envelope(
        "EvidenceTombstoned",
        next(sequence),
        "2026-01-03T00:00:00+00:00",
        frontierByDevice={"capability-test": "3"},
        newEpoch="epoch-2",
        parentEpoch="epoch",
        revokedCreditEventIds=[creditId],
        scope="global",
    ))

    projection = projectCapability(taxonomy, "reportAutomationFoundation", events)

    assert projection.application.stage == "none"
    assert projection.application.receiptCount == 0
