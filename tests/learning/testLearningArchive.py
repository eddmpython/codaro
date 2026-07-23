from __future__ import annotations

import base64
from copy import deepcopy
from pathlib import Path

from fastapi.testclient import TestClient
import pytest
import codaro.automation.taskRegistry as taskRegistryModule

from codaro.curriculum.evidenceArchive import (
    EvidenceArchiveError,
    LearningEvidenceArchiveStore,
    buildLearningEvidenceArchive,
    digestBytes,
    digestText,
    sealEvidenceEvent,
)
from codaro.curriculum.learningArchiveFlow import importLearningArchive
from codaro.server import createServerApp
from codaro.curriculum.learningArchive import (
    LearningArchiveAutomationDraftInput,
    LearningArchiveError,
    LearningArchivePackage,
    LearningArchiveVirtualFile,
    buildLearningArchive,
    commitLearningArchiveImport,
    confirmAutomationDraft,
    materializeLearningArchive,
    prepareLearningArchiveImport,
    readCurrentLearningArchive,
    serializeLearningArchive,
    validateLearningArchive,
)


def evidenceArchive(*, result: str = "1") -> dict[str, object]:
    attemptFingerprint = digestText(f"attempt:{result}")
    event = sealEvidenceEvent({
        "attemptFingerprint": attemptFingerprint,
        "blockId": "cell-1",
        "checkId": "lesson:30days/day01:required:print:v1",
        "eventId": f"web-strong:{attemptFingerprint}",
        "executionCount": 1,
        "expectedHash": digestText("1\n"),
        "fixtureHash": digestText("fixture"),
        "kind": "StrongCheckVerified",
        "lessonRef": "30days/day01",
        "occurredAt": "2026-07-23T00:00:00+00:00",
        "resultHash": digestText(result),
        "runtimeTier": "web",
        "schemaVersion": 1,
        "sourceHash": digestText("print(1)"),
        "strength": "strong",
    })
    return buildLearningEvidenceArchive([event])


def learningArchive(*, title: str = "첫 문서", result: str = "1") -> dict[str, object]:
    return buildLearningArchive(
        document={
            "blocks": [{"content": "print(1)", "id": "cell-1", "type": "code"}],
            "id": "document-1",
            "title": title,
        },
        drafts={"cell-1": "print(1)\n"},
        evidenceArchive=evidenceArchive(result=result),
        lessonRef="30days/day01_헬로월드",
        virtualDirectories=("data", "data/results"),
        virtualFiles=(
            LearningArchiveVirtualFile(
                path="data/results/report.csv",
                payload=b"course,score\npython,91\n",
                mediaType="text/csv",
            ),
        ),
        packages=(
            LearningArchivePackage(
                name="schedule",
                version="1.2.2",
                path="packages/schedule-1.2.2-py3-none-any.whl",
                payload=b"PK\x03\x04wheel-bytes",
            ),
        ),
        automationDrafts=(
            LearningArchiveAutomationDraftInput(
                name="점수 보고서",
                description="CSV 보고서를 만드는 초안",
                recipe="DRY_RUN = True\nprint(1)\n",
                sourceBlockIds=("cell-1",),
            ),
        ),
        createdAt="2026-07-23T00:02:00+00:00",
    )


def decodedBlobs(archive: dict[str, object]) -> dict[str, bytes]:
    result: dict[str, bytes] = {}
    for blobHash, descriptor in archive["blobs"].items():
        payload = descriptor["payload"]
        padding = "=" * ((4 - len(payload) % 4) % 4)
        result[blobHash] = base64.urlsafe_b64decode(payload + padding)
    return result


def testLearningArchiveRoundTripsEveryPayloadAsActualBytes() -> None:
    archive = learningArchive()
    normalized = validateLearningArchive(archive)
    plan = prepareLearningArchiveImport(serializeLearningArchive(archive))
    blobs = dict(plan.blobs)

    assert normalized["manifest"] == archive["manifest"]
    assert plan.archiveId == archive["manifest"]["archiveId"]
    assert blobs[archive["document"]["blobHash"]].startswith(b'{"blocks"')
    assert blobs[archive["drafts"][0]["blobHash"]] == b"print(1)\n"
    fileRef = next(item for item in archive["virtualFs"] if item["kind"] == "file")
    assert blobs[fileRef["blobHash"]] == b"course,score\npython,91\n"
    assert blobs[archive["packages"][0]["blobHash"]] == b"PK\x03\x04wheel-bytes"
    assert blobs[archive["evidence"]["blobHash"]].startswith(b'{"events"')
    assert blobs[archive["automationDrafts"][0]["recipeBlobHash"]] == b"DRY_RUN = True\nprint(1)\n"
    assert set(blobs) == set(archive["blobs"])


def testLearningArchivePreservesDraftBeforeFirstVerifiedEvent() -> None:
    archive = buildLearningArchive(
        document={
            "blocks": [{"content": "", "id": "cell-1", "type": "code"}],
            "id": "document-before-check",
            "title": "검증 전 문서",
        },
        drafts={"cell-1": "print('editing')\n"},
        evidenceArchive=buildLearningEvidenceArchive([]),
        lessonRef="30days/day01_헬로월드",
        createdAt="2026-07-23T00:01:00+00:00",
    )

    materialized = materializeLearningArchive(serializeLearningArchive(archive))

    assert archive["evidence"]["eventCount"] == 0
    assert archive["evidence"]["eventIds"] == []
    assert archive["lineage"][0]["evidenceEventIds"] == []
    assert materialized.drafts == {"cell-1": "print('editing')\n"}
    assert materialized.evidenceArchive["events"] == []


def testLearningArchiveRejectsMalformedDocumentBeforeImportSideEffects() -> None:
    with pytest.raises(LearningArchiveError, match="document block"):
        buildLearningArchive(
            document={
                "blocks": [None],
                "id": "malformed-document",
                "title": "잘못된 문서",
            },
            drafts={"cell-1": "print(1)\n"},
            evidenceArchive=buildLearningEvidenceArchive([]),
            lessonRef="30days/day01_헬로월드",
        )


def testLearningArchiveRejectsDraftWithoutDocumentBlock() -> None:
    with pytest.raises(LearningArchiveError, match="draft가 document block과 연결되지 않습니다"):
        buildLearningArchive(
            document={
                "blocks": [{"content": "print(1)", "id": "cell-1", "type": "code"}],
                "id": "orphan-draft-document",
                "title": "연결되지 않은 초안",
            },
            drafts={"missing-cell": "print(2)\n"},
            evidenceArchive=buildLearningEvidenceArchive([]),
            lessonRef="custom/deleted-lesson",
        )


def testLearningArchiveMaterializesDocumentDraftsArtifactsAndAutomation() -> None:
    materialized = materializeLearningArchive(serializeLearningArchive(learningArchive()))

    assert materialized.document["id"] == "document-1"
    assert materialized.drafts == {"cell-1": "print(1)\n"}
    assert materialized.evidenceArchive["events"][0]["lessonRef"] == "30days/day01"
    assert materialized.virtualDirectories == ("data", "data/results")
    assert materialized.virtualFiles[0].payload == b"course,score\npython,91\n"
    assert materialized.packages[0].payload == b"PK\x03\x04wheel-bytes"
    assert materialized.automationDrafts[0].recipe == b"DRY_RUN = True\nprint(1)\n"


def testLearningArchiveRejectsTamperingUnknownFieldsAndUnreferencedBlobs() -> None:
    archive = learningArchive()

    tampered = deepcopy(archive)
    firstHash = next(iter(tampered["blobs"]))
    tampered["blobs"][firstHash]["payload"] = "AA"
    with pytest.raises(LearningArchiveError, match="blob hash 또는 byteLength"):
        validateLearningArchive(tampered)

    extraRoot = deepcopy(archive)
    extraRoot["debug"] = True
    with pytest.raises(LearningArchiveError, match="닫힌 계약"):
        validateLearningArchive(extraRoot)

    extraDraft = deepcopy(archive)
    extraDraft["automationDrafts"][0]["confirmed"] = True
    with pytest.raises(LearningArchiveError, match="닫힌 계약"):
        validateLearningArchive(extraDraft)

    orphan = b"not referenced"
    orphanHash = digestBytes(orphan)
    orphanArchive = deepcopy(archive)
    orphanArchive["blobs"][orphanHash] = {
        "byteLength": len(orphan),
        "encoding": "base64url",
        "mediaType": "application/octet-stream",
        "payload": base64.urlsafe_b64encode(orphan).decode("ascii").rstrip("="),
    }
    with pytest.raises(LearningArchiveError, match="blob 참조가 닫혀 있지 않습니다"):
        validateLearningArchive(orphanArchive)


def testAutomationConfirmationIsExplicitPureAndDisabled() -> None:
    archive = learningArchive()
    draft = archive["automationDrafts"][0]

    with pytest.raises(LearningArchiveError, match="identity"):
        confirmAutomationDraft(
            archive,
            draft["draftId"],
            {
                "confirmationId": "confirm-1",
                "confirmedAt": "2026-07-23T00:03:00+00:00",
                "draftId": draft["draftId"],
                "recipeBlobHash": digestText("different recipe"),
            },
        )

    registration = confirmAutomationDraft(
        archive,
        draft["draftId"],
        {
            "confirmationId": "confirm-1",
            "confirmedAt": "2026-07-23T00:03:00+00:00",
            "draftId": draft["draftId"],
            "recipeBlobHash": draft["recipeBlobHash"],
        },
    )

    assert registration["kind"] == "codaro.automation-task-registration"
    assert registration["enabled"] is False
    assert registration["schedule"] is None
    assert registration["sourceDraftId"] == draft["draftId"]
    assert registration["lineageId"] == draft["lineageId"]


def testInvalidArchiveDoesNotCreateImportStore(tmp_path: Path) -> None:
    archive = learningArchive()
    archive["manifest"]["rootHash"] = digestText("tampered")
    storeRoot = tmp_path / "learning-archives"

    with pytest.raises(LearningArchiveError, match="manifest"):
        commitLearningArchiveImport(archive, storeRoot)

    assert not storeRoot.exists()


def testAtomicHeadSwapKeepsPreviousArchiveOnInterruptedImport(tmp_path: Path) -> None:
    storeRoot = tmp_path / "learning-archives"
    first = learningArchive(title="첫 문서", result="1")
    second = learningArchive(title="수정 문서", result="2")

    firstReceipt = commitLearningArchiveImport(first, storeRoot)
    assert firstReceipt["changed"] is True
    assert readCurrentLearningArchive(storeRoot)["manifest"]["archiveId"] == first["manifest"]["archiveId"]

    def interruptBeforeHead(point: str) -> None:
        if point == "beforeHeadReplace":
            raise RuntimeError("simulated import interruption")

    with pytest.raises(RuntimeError, match="simulated import interruption"):
        commitLearningArchiveImport(second, storeRoot, fault=interruptBeforeHead)

    current = readCurrentLearningArchive(storeRoot)
    assert current["manifest"]["archiveId"] == first["manifest"]["archiveId"]
    assert decodedBlobs(current)[current["document"]["blobHash"]].find("첫 문서".encode()) >= 0

    secondReceipt = commitLearningArchiveImport(second, storeRoot)
    assert secondReceipt["changed"] is True
    assert secondReceipt["previousArchiveId"] == first["manifest"]["archiveId"]
    assert readCurrentLearningArchive(storeRoot)["manifest"]["archiveId"] == second["manifest"]["archiveId"]


def testProductImportMergesEvidenceAndKeepsAutomationDisabled(tmp_path: Path) -> None:
    evidenceStore = LearningEvidenceArchiveStore(tmp_path / "evidence.sqlite3")
    evidenceStore.initialize()

    receipt = importLearningArchive(
        learningArchive(),
        storeRoot=tmp_path / "learning-archives",
        evidenceStore=evidenceStore,
    )

    assert receipt["changed"] is True
    assert receipt["evidence"]["inserted"] == 1
    assert receipt["automationDrafts"][0]["enabled"] is False
    assert receipt["automationDrafts"][0]["schedule"] is None
    assert evidenceStore.summary()["events"] == 1


def testProductImportRestoresPreviousHeadWhenEvidenceMergeFails(tmp_path: Path) -> None:
    storeRoot = tmp_path / "learning-archives"
    evidenceStore = LearningEvidenceArchiveStore(tmp_path / "evidence.sqlite3")
    evidenceStore.initialize()
    first = learningArchive(title="첫 문서", result="1")
    second = learningArchive(title="수정 문서", result="2")
    importLearningArchive(first, storeRoot=storeRoot, evidenceStore=evidenceStore)

    class RejectingEvidenceStore:
        def mergeArchive(self, _value: object) -> dict[str, object]:
            raise EvidenceArchiveError("simulated evidence rejection")

    with pytest.raises(LearningArchiveError, match="simulated evidence rejection"):
        importLearningArchive(second, storeRoot=storeRoot, evidenceStore=RejectingEvidenceStore())

    current = readCurrentLearningArchive(storeRoot)
    assert current["manifest"]["archiveId"] == first["manifest"]["archiveId"]


def testLearningArchiveApiUsesConfiguredWorkspaceInsteadOfProcessRoot(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("CODARO_HOME", str(tmp_path / "codaro-home"))
    monkeypatch.setattr(taskRegistryModule, "_registry", None)
    processRoot = tmp_path / "repository"
    processRoot.mkdir()
    workspaceRoot = tmp_path / "workspace"
    monkeypatch.chdir(processRoot)
    archive = learningArchive()

    with TestClient(createServerApp(workspaceRoot=workspaceRoot)) as client:
        missing = client.get("/api/curriculum/learning-archive/current")
        imported = client.post("/api/curriculum/learning-archive/import", json={"archive": archive})
        draftId = imported.json()["automationDrafts"][0]["draftId"]
        adopted = client.post(
            f"/api/curriculum/learning-archive/automation-drafts/{draftId}/adopt",
            json={},
        )
        adoptedAgain = client.post(
            f"/api/curriculum/learning-archive/automation-drafts/{draftId}/adopt",
            json={},
        )
        current = client.get("/api/curriculum/learning-archive/current")
        evidenceSummary = client.get("/api/curriculum/evidence/summary")
        tasks = client.get("/api/tasks")

    assert missing.status_code == 200
    assert missing.json() is None
    assert imported.status_code == 200
    assert imported.json()["archiveId"] == archive["manifest"]["archiveId"]
    assert imported.json()["automationDrafts"][0]["enabled"] is False
    assert imported.json()["automationDrafts"][0]["schedule"] is None
    assert adopted.status_code == 200
    assert adopted.json()["adopted"] is True
    assert adopted.json()["task"]["enabled"] is False
    assert adopted.json()["task"]["schedule"] is None
    assert adopted.json()["task"]["inputs"]["sourceDraftId"] == draftId
    assert adoptedAgain.status_code == 200
    assert adoptedAgain.json()["adopted"] is False
    assert adoptedAgain.json()["task"]["id"] == adopted.json()["task"]["id"]
    assert (workspaceRoot / adopted.json()["documentPath"]).is_file()
    assert not (processRoot / adopted.json()["documentPath"]).exists()
    assert current.status_code == 200
    assert current.json()["manifest"]["rootHash"] == archive["manifest"]["rootHash"]
    assert evidenceSummary.json() == {"events": 1, "conflicts": 0}
    assert tasks.json()["total"] == 1
