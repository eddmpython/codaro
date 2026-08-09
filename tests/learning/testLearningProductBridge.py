from __future__ import annotations

import asyncio
from pathlib import Path

import pytest

import codaro.api.learningArchiveAutomation as bridge
from codaro.automation.taskRegistry import TaskRegistry
from codaro.automation.taskRunner import TaskRunner
from codaro.automation.taskSafety import confirmTaskSafety
from codaro.curriculum.evidenceArchive import (
    buildLearningEvidenceArchive,
    digestBytes,
    digestText,
    sealEvidenceEvent,
    strongEvidenceAttemptFingerprint,
)
from codaro.curriculum.learningArchive import (
    LearningArchiveAutomationDraftInput,
    LearningArchiveError,
    LearningArchiveVirtualFile,
    buildLearningArchive,
    commitLearningArchiveImport,
)
from codaro.proof import ProofArchive
from codaro.curriculum.learningEvent import learningEventDigest, sealLearningEvent
from codaro.curriculum.taxonomy import loadTaxonomy


SOURCE = """from pathlib import Path
import json

report = {"count": count, "total": total, "average": average}
Path(outputPath).write_text(json.dumps(report), encoding="utf-8")
""".rstrip()


def _archive(source: str = SOURCE) -> dict[str, object]:
    attempt = digestText("bridge-attempt")
    evidence = sealEvidenceEvent({
        "attemptFingerprint": attempt,
        "blockId": "report",
        "checkId": "bridge-check",
        "eventId": f"local-strong:{attempt}",
        "executionCount": 1,
        "expectedHash": digestText("expected"),
        "fixtureHash": digestText("fixture"),
        "kind": "StrongCheckVerified",
        "lessonRef": "30days/day30_최종프로젝트",
        "occurredAt": "2026-08-10T00:00:00+00:00",
        "resultHash": digestText("actual"),
        "runtimeTier": "local",
        "schemaVersion": 1,
        "sourceHash": digestBytes(source.encode("utf-8")),
        "strength": "strong",
    })
    return buildLearningArchive(
        document={
            "blocks": [{"content": source, "id": "report", "type": "code"}],
            "id": "bridge-document",
            "title": "검증 보고서",
        },
        drafts={"report": source},
        evidenceArchive=buildLearningEvidenceArchive([evidence]),
        lessonRef="30days/day30_최종프로젝트",
        virtualDirectories=("proof", f"proof/{digestText('learning-report').removeprefix('sha256-')}",),
        virtualFiles=(LearningArchiveVirtualFile(
            path=f"proof/{digestText('learning-report').removeprefix('sha256-')}/report.json",
            payload=b'{"count":1,"total":2,"average":2}',
            mediaType="application/json",
        ),),
        automationDrafts=(LearningArchiveAutomationDraftInput(
            name="검증 보고서",
            description="학습 코드 그대로 실행하는 보고서",
            recipe=source,
            sourceBlockIds=("report",),
        ),),
        createdAt="2026-08-10T00:01:00+00:00",
    )


def _proof(source: str = SOURCE) -> dict[str, object]:
    return {
        "capabilityDomainId": "reportAutomationFoundation",
        "capabilityClaimIds": ["python.report.delivery"],
        "creditEventIds": ["local-application:credit"],
        "artifactContentHashes": [digestText("learning-report")],
        "sourceCodeHashes": [digestBytes(source.encode("utf-8"))],
        "taskVariantIds": ["python.report.delivery.application.v1"],
        "artifacts": [{
            "byteLength": 38,
            "contentHash": digestText("learning-report"),
            "kind": "file",
            "origin": "created",
            "path": "report.json",
            "schemaVersion": 1,
        }],
        "artifactContractIds": [("python.report.json.v1", 1)],
    }


def _strongArchive(source: str = SOURCE) -> dict[str, object]:
    taxonomy = loadTaxonomy()
    family = taxonomy.taskFamilyById("python.report.delivery")
    assert family is not None and family.applicationVariant is not None
    variant = family.applicationVariant
    artifactPayload = b'{"count":1,"total":2,"average":2}'
    artifactHash = digestBytes(artifactPayload)
    occurredAt = "2026-08-10T00:00:00+00:00"
    outerCore: dict[str, object] = {
        "answerReveal": False,
        "blockId": "report",
        "checkId": variant.checkSpecId,
        "executionCount": 1,
        "expectedHash": digestText("expected"),
        "fixtureHash": variant.fixtureHash,
        "kind": "AttemptObserved",
        "lessonRef": variant.lessonRef,
        "occurredAt": occurredAt,
        "resultHash": digestText("actual"),
        "runtimeTier": "local",
        "schemaVersion": 1,
        "sourceHash": digestBytes(source.encode("utf-8")),
        "strength": "strong",
        "artifacts": [{
            "byteLength": len(artifactPayload),
            "contentHash": artifactHash,
            "fileCount": 1,
            "kind": "file",
            "origin": "created",
            "path": "report.json",
            "schemaVersion": 1,
        }],
        "errorClass": "",
        "hintLevel": 0,
        "passed": True,
        "recommendedHintLevel": 0,
        "runStatus": "success",
    }
    attempt = strongEvidenceAttemptFingerprint(outerCore, includeAttemptMetadata=True)  # type: ignore[arg-type]
    outerCore["attemptFingerprint"] = attempt
    outerCore["eventId"] = f"local-attempt:{attempt}"
    eventId = str(outerCore["eventId"])

    def canonical(kind: str, sequence: int, **payload: object) -> dict[str, object]:
        suffix = {"RunObserved": "run", "CheckEvaluated": "check", "CreditGranted": "credit"}[kind]
        return sealLearningEvent({
            "deviceId": "codaro-local-learning-evidence",
            "deviceSequence": str(sequence),
            "epochRefByScope": {
                "global": "learning-epoch-v1",
                "lesson": f"learning-epoch-v1:{variant.lessonRef}",
            },
            "eventId": f"{eventId}:{suffix}",
            "kind": kind,
            "lamport": str(sequence),
            "learningEpoch": "learning-epoch-v1",
            "occurredAt": occurredAt,
            "schemaVersion": 1,
            **payload,
        })

    run = canonical(
        "RunObserved",
        1,
        artifactDescriptors=outerCore["artifacts"],
        completedAt=occurredAt,
        runContext={
            "attemptId": eventId,
            "artifactContractId": family.artifactContractId,
            "artifactContractVersion": family.artifactContractVersion,
            "capabilityClaimId": family.ownerClaimId,
            "capabilityClaimVersion": 1,
            "checkEngineVersion": "local-sandbox-v1",
            "checkSpecId": variant.checkSpecId,
            "checkSpecVersion": variant.checkSpecVersion,
            "fixtureHash": variant.fixtureHash,
            "lessonContentHash": learningEventDigest({
                "checkId": variant.checkSpecId,
                "lessonRef": variant.lessonRef,
                "outcomeIds": family.outcomeIds,
                "sectionId": variant.sectionId,
            }),
            "lessonRef": variant.lessonRef,
            "masteryPolicyVersion": 2,
            "outcomeIds": family.outcomeIds,
            "packageSetHash": learningEventDigest([]),
            "runId": eventId,
            "runtimeId": "codaro-local",
            "runtimeVersion": "1",
            "sectionId": variant.sectionId,
            "sourceCodeHash": outerCore["sourceHash"],
            "taskFamilyId": family.id,
            "taskFamilyVersion": family.version,
            "taskVariantId": variant.taskVariantId,
            "taskVariantVersion": variant.taskVariantVersion,
            "tierUsed": "local",
        },
        runStatus="success",
        startedAt=occurredAt,
    )
    check = canonical(
        "CheckEvaluated",
        2,
        assessmentMode="capstone",
        checkId=variant.checkSpecId,
        errorClass="",
        passed=True,
        recommendedHintLevel=0,
        runEventId=run["eventId"],
        strength="strong",
        unseen=True,
    )
    credit = canonical(
        "CreditGranted",
        3,
        appendReceiptAt=occurredAt,
        attemptFingerprint=attempt,
        checkEventIds=[check["eventId"]],
        creditSlices=[{
            "creditMode": "capstone",
            "outcomeId": outcomeId,
            "preAttemptState": "unproven",
        } for outcomeId in family.outcomeIds],
        evidenceTime=occurredAt,
        runEventId=run["eventId"],
        supportEventIds=[],
    )
    outer = sealEvidenceEvent({**outerCore, "canonicalEvents": [run, check, credit]})
    hashPath = artifactHash.removeprefix("sha256-")
    return buildLearningArchive(
        document={
            "blocks": [{"content": source, "id": "report", "type": "code"}],
            "id": "strong-bridge-document",
            "title": "검증 보고서",
        },
        drafts={"report": source},
        evidenceArchive=buildLearningEvidenceArchive([outer]),
        lessonRef=variant.lessonRef,
        virtualDirectories=("proof", f"proof/{hashPath}"),
        virtualFiles=(LearningArchiveVirtualFile(
            path=f"proof/{hashPath}/report.json",
            payload=artifactPayload,
            mediaType="application/json",
        ),),
        automationDrafts=(LearningArchiveAutomationDraftInput(
            name="검증 보고서",
            description="학습 코드 그대로 실행하는 보고서",
            recipe=source,
            sourceBlockIds=("report",),
        ),),
        createdAt="2026-08-10T00:01:00+00:00",
    )


def testWeakArchiveCannotPromoteAndCallerInputsCannotSpoofLineage(tmp_path: Path) -> None:
    storeRoot = tmp_path / "archives"
    commitLearningArchiveImport(_archive(), storeRoot)
    archive = bridge.readCurrentLearningArchive(storeRoot)
    draftId = archive["automationDrafts"][0]["draftId"]
    registry = TaskRegistry(tmp_path / "tasks")

    status = bridge.learningArtifactPromotionStatus(
        draftId,
        storeRoot=storeRoot,
        workspaceRoot=tmp_path / "workspace",
    )
    assert status["eligible"] is False
    assert "application evidence" in status["reason"]

    with pytest.raises(LearningArchiveError, match="application evidence"):
        bridge.promoteLearningArtifactToExecutableUnit(
            draftId,
            storeRoot=storeRoot,
            workspaceRoot=tmp_path / "workspace",
            proofArchive=ProofArchive(tmp_path / "proof.sqlite3"),
            taskRegistry=registry,
            inputs={"average": 2, "count": 1, "outputPath": "report.json", "total": 2},
        )

    spoof = registry.create(
        name="가짜",
        documentPath="spoof.py",
        inputs={
            "sourceDraftId": draftId,
            "capabilityDomainId": "reportAutomationFoundation",
            "proofCreditEventIds": ["fake"],
        },
    )
    assert spoof.provenance is None


def testStrongLearningBlockPromotesWithOneHashAndRecordsOnlySemanticFreshRun(
    tmp_path: Path,
) -> None:
    storeRoot = tmp_path / "archives"
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    commitLearningArchiveImport(_strongArchive(), storeRoot)
    archive = bridge.readCurrentLearningArchive(storeRoot)
    draftId = archive["automationDrafts"][0]["draftId"]
    registry = TaskRegistry(tmp_path / "tasks")
    proofArchive = ProofArchive(tmp_path / "proof.sqlite3")
    inputs = {"average": 2, "count": 1, "outputPath": "report.json", "total": 2}

    status = bridge.learningArtifactPromotionStatus(
        draftId,
        storeRoot=storeRoot,
        workspaceRoot=workspace,
    )
    assert status["eligible"] is True

    promoted = bridge.promoteLearningArtifactToExecutableUnit(
        draftId,
        storeRoot=storeRoot,
        workspaceRoot=workspace,
        proofArchive=proofArchive,
        taskRegistry=registry,
        inputs=inputs,
    )
    task = registry.get(promoted["task"]["id"])
    assert task is not None
    assert task.provenance is not None
    assert task.provenance["sourceBlockHash"] == digestBytes(SOURCE.encode("utf-8"))
    assert len(task.provenance["executableUnit"]["evidenceReceiptIds"]) == 1
    assert task.inputs == inputs
    assert (workspace / task.documentPath).is_file()

    approval = confirmTaskSafety(task, confirmation=task.id, workspaceRoot=workspace)
    task = registry.update(task.id, safetyApproval=approval, enabled=True)
    assert task is not None
    run = asyncio.run(TaskRunner(workspaceRoot=workspace).run(task))
    if run.validated is not True:
        pytest.fail(f"{run.error}\n{run.validationErrors}", pytrace=False)
    assert run.operationalCandidate is True
    operational = bridge.recordPromotedTaskOperationalRun(task, run, proofArchive=proofArchive)

    assert operational is not None
    assert operational.sourceHash == task.provenance["sourceBlockHash"]
    assert operational.learningEvidenceCreditIds == task.provenance["creditEventIds"]
    assert operational.learnerSelectedInput is True
    assert proofArchive.receiptById(operational.receiptId) == operational

    task.inputs = {}
    replay = asyncio.run(TaskRunner(workspaceRoot=workspace).run(task))
    assert bridge.recordPromotedTaskOperationalRun(task, replay, proofArchive=proofArchive) is None


def testSourceMismatchAndJsonShapeFailureNeverProduceOperationalProof(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    storeRoot = tmp_path / "archives"
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    commitLearningArchiveImport(_archive(), storeRoot)
    archive = bridge.readCurrentLearningArchive(storeRoot)
    draftId = archive["automationDrafts"][0]["draftId"]
    registry = TaskRegistry(tmp_path / "tasks")
    proofArchive = ProofArchive(tmp_path / "proof.sqlite3")
    mismatched = _proof()
    mismatched["sourceCodeHashes"] = [digestText("other source")]
    monkeypatch.setattr(bridge, "_promotionCapabilityProof", lambda *_args: mismatched)
    with pytest.raises(LearningArchiveError, match="source block"):
        bridge.promoteLearningArtifactToExecutableUnit(
            draftId,
            storeRoot=storeRoot,
            workspaceRoot=workspace,
            proofArchive=proofArchive,
            taskRegistry=registry,
            inputs={"average": 2, "count": 1, "outputPath": "report.json", "total": 2},
        )

    badSource = SOURCE.replace('"count": count', '"count": "wrong"')
    commitLearningArchiveImport(_archive(badSource), storeRoot)
    archive = bridge.readCurrentLearningArchive(storeRoot)
    draftId = archive["automationDrafts"][0]["draftId"]
    monkeypatch.setattr(bridge, "_promotionCapabilityProof", lambda *_args: _proof(badSource))
    promoted = bridge.promoteLearningArtifactToExecutableUnit(
        draftId,
        storeRoot=storeRoot,
        workspaceRoot=workspace,
        proofArchive=proofArchive,
        taskRegistry=registry,
        inputs={"average": 2, "outputPath": "report.json", "total": 2},
    )
    task = registry.get(promoted["task"]["id"])
    assert task is not None
    task.safetyApproval = confirmTaskSafety(task, confirmation=task.id, workspaceRoot=workspace)
    task.enabled = True
    run = asyncio.run(TaskRunner(workspaceRoot=workspace).run(task))
    assert run.validated is False
    assert "artifact-json-field-type:report.json:count" in run.validationErrors
    assert bridge.recordPromotedTaskOperationalRun(task, run, proofArchive=proofArchive) is None
