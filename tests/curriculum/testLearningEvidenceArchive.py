from __future__ import annotations

from contextlib import closing
from copy import deepcopy
import json
import os
from pathlib import Path
import sqlite3

import pytest
from fastapi.testclient import TestClient

from codaro.curriculum.evidenceArchive import (
    EvidenceArchiveError,
    LEARNING_EVIDENCE_READER_VERSION,
    LearningEvidenceArchiveStore,
    buildLearningEvidenceArchive,
    digestBytes,
    digestText,
    migrateEvidenceEventLessonRef,
    sealEvidenceEvent,
    stableJson,
    strongEvidenceAttemptFingerprint,
)
from codaro.curriculum.learningEvent import learningEventDigest, sealLearningEvent
from codaro.curriculum.masteryPolicy import MasteryPolicy
from codaro.server import createServerApp


def evidenceEvent(
    *,
    artifacts: list[dict[str, object]] | None = None,
    result: str = "result-a",
    runtimeTier: str = "web",
) -> dict[str, object]:
    core: dict[str, object] = {
        "blockId": "section-one-exercise",
        "checkId": "lesson:30days/day01:required:hello-output:v1",
        "executionCount": 2,
        "expectedHash": digestText("Hello Codaro\n"),
        "fixtureHash": "sha256-EUE3dsIaRrkQcqkx52hMvHYX4XSUaDqh+aRH0f9shqI=",
        "kind": "StrongCheckVerified",
        "lessonRef": "30days/day01",
        "occurredAt": "2026-07-19T00:00:00.000Z",
        "resultHash": digestText(result),
        "runtimeTier": runtimeTier,
        "schemaVersion": 1,
        "sourceHash": digestText("print('Hello Codaro')"),
        "strength": "strong",
    }
    if artifacts is not None:
        core["artifacts"] = artifacts
    attemptFingerprint = strongEvidenceAttemptFingerprint(core, includeAttemptMetadata=True)  # type: ignore[arg-type]
    core["attemptFingerprint"] = attemptFingerprint
    core["eventId"] = f"{runtimeTier}-strong:{attemptFingerprint}"
    return sealEvidenceEvent(core)


def canonicalLessonRef(lessonRef: str) -> str:
    if lessonRef == "30days/day01":
        return "30days/day01_헬로월드"
    return lessonRef


def canonicalEvent(
    outer: dict[str, object],
    kind: str,
    sequence: int,
    **payload: object,
) -> dict[str, object]:
    return sealLearningEvent({
        "deviceId": f"codaro-{outer['runtimeTier']}-learning-evidence",
        "deviceSequence": str(sequence),
        "epochRefByScope": {
            "global": "learning-epoch-v1",
            "lesson": f"learning-epoch-v1:{outer['lessonRef']}",
        },
        "eventId": f"{outer['eventId']}:{ {'RunObserved': 'run', 'CheckEvaluated': 'check', 'CreditGranted': 'credit'}[kind] }",
        "kind": kind,
        "lamport": str(sequence),
        "learningEpoch": "learning-epoch-v1",
        "occurredAt": outer["occurredAt"],
        "schemaVersion": 1,
        **payload,
    })


def canonicalChain(outer: dict[str, object]) -> list[dict[str, object]]:
    runtimeTier = str(outer["runtimeTier"])
    sectionId = "hello_world"
    outcomeIds = ["python.intro"]
    run = canonicalEvent(
        outer,
        "RunObserved",
        1,
        completedAt=outer["occurredAt"],
        runContext={
            "attemptId": outer["eventId"],
            "checkEngineVersion": "browser-worker-v1" if runtimeTier == "web" else "local-sandbox-v1",
            "checkSpecId": outer["checkId"],
            "checkSpecVersion": "1",
            "fixtureHash": outer["fixtureHash"],
            "lessonContentHash": learningEventDigest({
                "checkId": outer["checkId"],
                "lessonRef": outer["lessonRef"],
                "outcomeIds": outcomeIds,
                "sectionId": sectionId,
            }),
            "lessonRef": outer["lessonRef"],
            "masteryPolicyVersion": 1,
            "outcomeIds": outcomeIds,
            "packageSetHash": learningEventDigest([]),
            "runId": outer["eventId"],
            "runtimeId": "pyproc" if runtimeTier == "web" else "codaro-local",
            "runtimeVersion": "1",
            "sectionId": sectionId,
            "sourceCodeHash": outer["sourceHash"],
            "taskVariantId": f"{outer['lessonRef']}#{sectionId}",
            "tierUsed": "browser" if runtimeTier == "web" else "local",
        },
        runStatus="success",
        startedAt=outer["occurredAt"],
    )
    check = canonicalEvent(
        outer,
        "CheckEvaluated",
        2,
        assessmentMode="acquisition",
        checkId=outer["checkId"],
        errorClass="",
        passed=True,
        recommendedHintLevel=0,
        runEventId=run["eventId"],
        strength="strong",
        unseen=True,
    )
    credit = canonicalEvent(
        outer,
        "CreditGranted",
        3,
        appendReceiptAt=outer["occurredAt"],
        attemptFingerprint=outer["attemptFingerprint"],
        checkEventIds=[check["eventId"]],
        creditSlices=[{
            "creditMode": "acquisition",
            "outcomeId": "python.intro",
            "preAttemptState": "unproven",
        }],
        evidenceTime=outer["occurredAt"],
        runEventId=run["eventId"],
        supportEventIds=[],
    )
    return [run, check, credit]


def testEvidenceArchivePreservesAndFlattensCanonicalLearningEvents(tmp_path: Path) -> None:
    outer = evidenceEvent()
    chain = canonicalChain(outer)
    outerCore = {key: value for key, value in outer.items() if key != "payloadHash"}
    outerWithChain = sealEvidenceEvent({**outerCore, "canonicalEvents": chain})
    store = LearningEvidenceArchiveStore(tmp_path / "evidence.sqlite3")

    receipt = store.appendEvent(outerWithChain)

    assert receipt["inserted"] == 1
    assert store.buildArchive()["events"][0]["canonicalEvents"] == chain
    assert store.eventPayloads() == [outerWithChain, *chain]
    projection = MasteryPolicy().reduce(store.eventPayloads())
    assert projection.outcomes[0].outcomeId == "python.intro"
    assert projection.outcomes[0].stage == "independent"

    tampered = deepcopy(outerWithChain)
    tampered["canonicalEvents"][1]["passed"] = False
    with pytest.raises(EvidenceArchiveError, match="canonical event"):
        store.appendEvent(tampered)


@pytest.mark.parametrize(
    "field",
    ["attemptFingerprint", "checkId", "fixtureHash", "lessonRef", "runtimeTier", "sourceHash"],
)
def testEvidenceArchiveRejectsResealedCrossLinkCanonicalEvents(field: str) -> None:
    outer = evidenceEvent()
    chain = canonicalChain(outer)
    if field == "checkId":
        index = 1
        core = {key: value for key, value in chain[index].items() if key != "payloadHash"}
        core["checkId"] = "other-check"
    elif field == "attemptFingerprint":
        index = 2
        core = {key: value for key, value in chain[index].items() if key != "payloadHash"}
        core["attemptFingerprint"] = learningEventDigest("other-attempt")
    else:
        index = 0
        core = {key: value for key, value in chain[index].items() if key != "payloadHash"}
        context = dict(core["runContext"])  # type: ignore[arg-type]
        replacement = {
            "fixtureHash": learningEventDigest("other-fixture"),
            "lessonRef": "30days/day02_변수와자료형",
            "runtimeTier": "local",
            "sourceHash": learningEventDigest("other-source"),
        }[field]
        context[{"runtimeTier": "tierUsed", "sourceHash": "sourceCodeHash"}.get(field, field)] = replacement
        core["runContext"] = context
    chain[index] = sealLearningEvent(core)
    outerCore = {key: value for key, value in outer.items() if key != "payloadHash"}
    outerCore["canonicalEvents"] = chain

    with pytest.raises(EvidenceArchiveError, match="outer evidence"):
        sealEvidenceEvent(outerCore)


def testLessonRefMigrationRebindsCanonicalChain() -> None:
    outer = evidenceEvent()
    outerCore = {key: value for key, value in outer.items() if key != "payloadHash"}
    original = sealEvidenceEvent({**outerCore, "canonicalEvents": canonicalChain(outer)})

    migrated = migrateEvidenceEventLessonRef(original, "30days/day01_헬로월드")

    run, check, credit = migrated["canonicalEvents"]
    assert run["eventId"] == f"{migrated['eventId']}:run"
    assert run["runContext"]["lessonRef"] == migrated["lessonRef"]
    assert run["runContext"]["attemptId"] == migrated["eventId"]
    assert check["checkId"] == migrated["checkId"]
    assert credit["attemptFingerprint"] == migrated["attemptFingerprint"]


def testEvidenceArchiveMergeIsIdempotentAndIsolatesConflicts(tmp_path: Path) -> None:
    store = LearningEvidenceArchiveStore(
        tmp_path / "evidence.sqlite3",
        lessonRefResolver=canonicalLessonRef,
    )
    original = evidenceEvent()
    canonical = migrateEvidenceEventLessonRef(original, canonicalLessonRef(str(original["lessonRef"])))
    archive = buildLearningEvidenceArchive([original])

    first = store.mergeArchive(archive)
    second = store.mergeArchive(archive)

    assert first == {
        "accepted": [{"checkId": canonical["checkId"], "lessonRef": canonical["lessonRef"]}],
        "conflicted": 0,
        "inserted": 1,
        "migrated": 1,
        "skipped": 0,
    }
    assert second["inserted"] == 0
    assert second["migrated"] == 1
    assert second["skipped"] == 1
    assert store.summary() == {"events": 1, "conflicts": 0}

    conflicting = evidenceEvent(result="result-b")
    conflictReceipt = store.mergeArchive(buildLearningEvidenceArchive([conflicting]))

    assert conflictReceipt["conflicted"] == 1
    assert conflictReceipt["accepted"] == []
    assert store.summary() == {"events": 1, "conflicts": 1}
    assert store.eventPayloads() == [canonical]


def testEvidenceArchiveRejectsTamperingBeforeTransaction(tmp_path: Path) -> None:
    store = LearningEvidenceArchiveStore(
        tmp_path / "evidence.sqlite3",
        lessonRefResolver=canonicalLessonRef,
    )
    archive = buildLearningEvidenceArchive([evidenceEvent()])
    tampered = deepcopy(archive)
    tampered["events"][0]["resultHash"] = tampered["events"][0]["sourceHash"]

    with pytest.raises(EvidenceArchiveError, match="payload hash"):
        store.mergeArchive(tampered)

    assert store.summary() == {"events": 0, "conflicts": 0}


def testEvidenceArchiveAppendsOneValidatedEventIdempotently(tmp_path: Path) -> None:
    store = LearningEvidenceArchiveStore(
        tmp_path / "evidence.sqlite3",
        lessonRefResolver=canonicalLessonRef,
    )
    event = evidenceEvent()
    canonical = migrateEvidenceEventLessonRef(event, canonicalLessonRef(str(event["lessonRef"])))

    first = store.appendEvent(event)
    second = store.appendEvent(event)

    assert first["inserted"] == 1
    assert first["migrated"] == 1
    assert second["skipped"] == 1
    assert store.eventPayloads() == [canonical]

    tampered = deepcopy(event)
    tampered["sourceHash"] = tampered["resultHash"]
    with pytest.raises(EvidenceArchiveError, match="payload hash"):
        store.appendEvent(tampered)
    assert store.summary() == {"events": 1, "conflicts": 0}


def testEvidenceArchiveApiImportsAndExportsValidatedEvents(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("CODARO_HOME", str(tmp_path / "codaro-home"))
    archive = buildLearningEvidenceArchive([evidenceEvent()])
    canonical = migrateEvidenceEventLessonRef(archive["events"][0], "30days/day01_헬로월드")
    with TestClient(createServerApp(workspaceRoot=tmp_path)) as client:
        imported = client.post("/api/curriculum/evidence/import", json={"archive": archive})
        summary = client.get("/api/curriculum/evidence/summary")
        exported = client.get("/api/curriculum/evidence/archive")

        assert imported.status_code == 200
        assert imported.json()["inserted"] == 1
        assert imported.json()["migrated"] == 1
        assert summary.json() == {"events": 1, "conflicts": 0}
        assert exported.status_code == 200
        assert exported.json()["events"] == [canonical]

        invalid = deepcopy(archive)
        invalid["manifest"]["eventSetHash"] = digestText("not-the-event-set")
        rejected = client.post("/api/curriculum/evidence/import", json={"archive": invalid})
        assert rejected.status_code == 400
        assert rejected.json()["error"]["code"] == "curriculum-evidence-archive-invalid"
        assert client.get("/api/curriculum/evidence/summary").json() == {"events": 1, "conflicts": 0}


def testEvidenceArchiveApiAppendsValidatedLocalSurfaceEvent(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("CODARO_HOME", str(tmp_path / "codaro-home"))
    event = evidenceEvent(runtimeTier="local")
    canonical = migrateEvidenceEventLessonRef(event, "30days/day01_헬로월드")
    with TestClient(createServerApp(workspaceRoot=tmp_path)) as client:
        appended = client.post("/api/curriculum/evidence/event", json={"event": event})
        duplicate = client.post("/api/curriculum/evidence/event", json={"event": event})

        assert appended.status_code == 200
        assert appended.json()["inserted"] == 1
        assert appended.json()["migrated"] == 1
        assert duplicate.status_code == 200
        assert duplicate.json()["skipped"] == 1
        assert client.get("/api/curriculum/evidence/archive").json()["events"] == [canonical]
        assert client.get("/api/curriculum/evidence/archive").json()["manifest"]["runtimeTier"] == "local"

        invalid = deepcopy(event)
        invalid["payloadHash"] = invalid["sourceHash"]
        rejected = client.post("/api/curriculum/evidence/event", json={"event": invalid})
        assert rejected.status_code == 400
        assert rejected.json()["error"]["code"] == "curriculum-evidence-event-invalid"


def testEvidenceArchiveKeepsWebAndLocalAttemptsDistinct() -> None:
    webEvent = evidenceEvent(runtimeTier="web")
    localEvent = evidenceEvent(runtimeTier="local")

    archive = buildLearningEvidenceArchive([webEvent, localEvent])

    assert archive["manifest"]["runtimeTier"] == "mixed"
    assert {event["eventId"].split(":", 1)[0] for event in archive["events"]} == {
        "local-strong",
        "web-strong",
    }


def testEvidenceArchivePreservesLocalArtifactDescriptors(tmp_path: Path) -> None:
    artifacts = [{
        "byteLength": 13,
        "contentHash": digestText("HELLO\nCODARO\n"),
        "fileCount": 1,
        "kind": "file",
        "origin": "created",
        "path": "result.txt",
        "schemaVersion": 1,
    }]
    packages = [{
        "integrity": digestText("schedule-wheel"),
        "name": "schedule",
        "schemaVersion": 1,
        "url": "check-packages/schedule-1.2.2-py3-none-any.whl",
        "version": "1.2.2",
    }]
    store = LearningEvidenceArchiveStore(
        tmp_path / "evidence.sqlite3",
        lessonRefResolver=canonicalLessonRef,
    )
    event = evidenceEvent(artifacts=artifacts, runtimeTier="local")
    event_with_packages = {
        key: value
        for key, value in event.items()
        if key != "payloadHash"
    }
    event_with_packages["packages"] = packages
    event = sealEvidenceEvent(event_with_packages)

    receipt = store.appendEvent(event)
    archive = store.buildArchive()
    canonical = migrateEvidenceEventLessonRef(event, "30days/day01_헬로월드")

    assert receipt["inserted"] == 1
    assert archive["events"][0]["artifacts"] == artifacts
    assert archive["events"][0]["packages"] == packages
    assert archive["events"][0]["payloadHash"] == canonical["payloadHash"]

    tampered = deepcopy(event)
    tampered["artifacts"][0]["path"] = "../outside.txt"  # type: ignore[index]
    with pytest.raises(EvidenceArchiveError, match="산출물 descriptor"):
        store.appendEvent(tampered)

    bad_package = deepcopy(event)
    bad_package["packages"][0]["url"] = "https://example.invalid/schedule.whl"  # type: ignore[index]
    with pytest.raises(EvidenceArchiveError, match="package descriptor"):
        store.appendEvent(bad_package)


def testEvidenceArchivePreservesSemanticTableAndImageDescriptors(tmp_path: Path) -> None:
    artifacts = [
        {
            "byteLength": 31,
            "columnCount": 2,
            "columns": ["course", "score"],
            "contentHash": digestText("course,score\npython,91\n"),
            "format": "csv",
            "kind": "table",
            "origin": "created",
            "path": "report.csv",
            "rowCount": 1,
            "schemaVersion": 1,
        },
        {
            "byteLength": 68,
            "contentHash": digestText("one-pixel-png"),
            "height": 1,
            "kind": "image",
            "mediaType": "image/png",
            "origin": "created",
            "path": "chart.png",
            "schemaVersion": 1,
            "width": 1,
        },
    ]
    store = LearningEvidenceArchiveStore(
        tmp_path / "evidence.sqlite3",
        lessonRefResolver=canonicalLessonRef,
    )
    event = evidenceEvent(artifacts=artifacts, runtimeTier="local")

    receipt = store.appendEvent(event)

    assert receipt["inserted"] == 1
    assert store.buildArchive()["events"][0]["artifacts"] == [artifacts[1], artifacts[0]]

    invalid = deepcopy(event)
    tableArtifact = next(item for item in invalid["artifacts"] if item["kind"] == "table")  # type: ignore[union-attr]
    tableArtifact["columnCount"] = 3
    invalid.pop("payloadHash")
    with pytest.raises(EvidenceArchiveError, match="표 산출물 descriptor"):
        sealEvidenceEvent(invalid)


def testEvidenceStoreCutoverHeaderSealsLegacySnapshot(tmp_path: Path) -> None:
    storagePath = tmp_path / "evidence.sqlite3"
    headerPath = tmp_path / "launcher-state" / "learning-evidence-store-header.json"
    event = evidenceEvent()
    with closing(sqlite3.connect(storagePath)) as connection:
        connection.executescript(
            """
            CREATE TABLE events(
                event_id TEXT PRIMARY KEY,
                payload_hash TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                occurred_at TEXT NOT NULL
            );
            CREATE TABLE conflicts(
                conflict_id TEXT PRIMARY KEY,
                event_id TEXT NOT NULL,
                existing_payload_hash TEXT NOT NULL,
                imported_payload_hash TEXT NOT NULL,
                occurred_at TEXT NOT NULL
            );
            """
        )
        connection.execute(
            "INSERT INTO events(event_id, payload_hash, payload_json, occurred_at) VALUES (?, ?, ?, ?)",
            (event["eventId"], event["payloadHash"], stableJson(event), event["occurredAt"]),
        )
        connection.commit()

    store = LearningEvidenceArchiveStore(storagePath, headerPath=headerPath)
    header = store.initialize()

    assert header["schemaVersion"] == 1
    assert header["dataEpoch"] == 1
    assert header["minimumReaderVersion"] == LEARNING_EVIDENCE_READER_VERSION
    assert header["legacySnapshotHash"] == digestText(stableJson([event]))
    assert header["cutoverMarker"]["eventId"].startswith("learning-evidence-cutover:")
    assert json.loads(headerPath.read_text(encoding="utf-8")) == header
    assert store.eventPayloads() == [event]


def testEvidenceStoreRejectsReaderBelowPersistedFloor(tmp_path: Path) -> None:
    storagePath = tmp_path / "evidence.sqlite3"
    store = LearningEvidenceArchiveStore(storagePath, headerPath=tmp_path / "header.json")
    header = store.initialize()
    header["minimumReaderVersion"] = LEARNING_EVIDENCE_READER_VERSION + 1
    with closing(sqlite3.connect(storagePath)) as connection:
        connection.execute(
            "UPDATE metadata SET payload_json = ? WHERE metadata_key = ?",
            (stableJson(header), "store-header"),
        )
        connection.commit()

    incompatible = LearningEvidenceArchiveStore(storagePath, headerPath=tmp_path / "header.json")

    with pytest.raises(EvidenceArchiveError, match="안전하게 읽을 수 없습니다"):
        incompatible.summary()


def testEvidenceStoreRetriesTransientHeaderReplaceFailure(tmp_path: Path, monkeypatch) -> None:
    storagePath = tmp_path / "evidence.sqlite3"
    headerPath = tmp_path / "learning-evidence-store-header.json"
    store = LearningEvidenceArchiveStore(storagePath, headerPath=headerPath)
    realReplace = os.replace
    attempts = 0

    def replaceAfterTransientFailure(source, target) -> None:
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            raise PermissionError("temporary OneDrive file lock")
        realReplace(source, target)

    monkeypatch.setattr(os, "replace", replaceAfterTransientFailure)

    header = store.initialize()

    assert attempts == 2
    assert json.loads(headerPath.read_text(encoding="utf-8")) == header


def testEvidenceStoreImportsFullLegacyStateWithoutGrantingCredit(tmp_path: Path) -> None:
    progressPath = tmp_path / "progress.json"
    learnerStatePath = tmp_path / "learnerState.db"
    progress = {
        "autoValidatedOutcomes": ["python.basics.print"],
        "lessonReviews": {"30days/day01": {"lessonKey": "30days/day01", "stage": 1}},
        "lessons": {
            "30days/day01": {
                "category": "30days",
                "completedAt": "2026-07-20T00:00:00Z",
                "completedMissions": ["mission-1"],
                "contentId": "day01",
                "reflectionAnswers": {"why": "출력을 확인했다"},
                "totalMissions": 1,
            }
        },
        "outcomeCredits": {"python.basics.print": [{"source": "legacy"}]},
        "updatedAt": "2026-07-20T00:01:00Z",
        "validatedOutcomes": ["python.basics.print"],
    }
    progressPath.write_text(json.dumps(progress, ensure_ascii=False), encoding="utf-8")
    with closing(sqlite3.connect(learnerStatePath)) as connection:
        connection.executescript(
            """
            CREATE TABLE outcomeMastery(
                outcomeId TEXT PRIMARY KEY,
                score REAL NOT NULL,
                confidence REAL NOT NULL,
                successCount INTEGER NOT NULL,
                failureCount INTEGER NOT NULL,
                strongCount INTEGER NOT NULL,
                lastTouched TEXT NOT NULL
            );
            CREATE TABLE misconceptionHit(
                misconceptionId TEXT PRIMARY KEY,
                outcomeId TEXT NOT NULL,
                firstSeenAt TEXT NOT NULL,
                lastSeenAt TEXT NOT NULL,
                hitCount INTEGER NOT NULL,
                resolvedAt TEXT
            );
            CREATE TABLE executionSummary(key TEXT PRIMARY KEY, value TEXT NOT NULL);
            """
        )
        connection.execute(
            "INSERT INTO outcomeMastery VALUES (?, ?, ?, ?, ?, ?, ?)",
            ("python.basics.print", 0.8, 0.7, 3, 1, 2, "2026-07-20T00:00:00Z"),
        )
        connection.execute("INSERT INTO executionSummary VALUES (?, ?)", ("totalExecutions", "4"))
        connection.commit()

    store = LearningEvidenceArchiveStore(
        tmp_path / "learningEvidence.sqlite3",
        headerPath=tmp_path / "learningEvidence.store-header.json",
        legacyLearnerStatePath=learnerStatePath,
        legacyProgressPath=progressPath,
        lessonRefResolver=canonicalLessonRef,
    )
    header = store.initialize()
    events = store.eventPayloads()

    assert header["legacyImport"]["eventCount"] == 2
    assert {source["sourceKind"] for source in header["legacyImport"]["sources"]} == {
        "learner-state-sqlite-v1",
        "progress-json-v1",
    }
    for source in header["legacyImport"]["sources"]:
        backupPath = tmp_path / source["backupPath"]
        assert backupPath.is_file()
        assert source["backupHash"] == digestBytes(backupPath.read_bytes())
    assert len(events) == 2
    assert {event["kind"] for event in events} == {"MigrationImported"}
    assert all(event["creditEligibility"] == "none" for event in events)
    assert all("checkId" not in event and "strength" not in event for event in events)
    progressEvent = next(event for event in events if event["sourceKind"] == "progress-json-v1")
    assert progressEvent["legacyState"] == progress
    assert progressEvent["lessonRefMap"] == {"30days/day01": "30days/day01_헬로월드"}
    assert progressEvent["recordCount"] == 5
    assert store.buildArchive()["events"] == events

    progress["lessons"]["30days/day02"] = {"category": "30days", "contentId": "day02"}
    progressPath.write_text(json.dumps(progress, ensure_ascii=False), encoding="utf-8")
    reopened = LearningEvidenceArchiveStore(
        tmp_path / "learningEvidence.sqlite3",
        headerPath=tmp_path / "learningEvidence.store-header.json",
        legacyLearnerStatePath=learnerStatePath,
        legacyProgressPath=progressPath,
        lessonRefResolver=canonicalLessonRef,
    )
    assert reopened.initialize() == header
    assert reopened.eventPayloads() == events


@pytest.mark.parametrize(
    "faultPoint",
    ("afterBackup", "afterImport", "afterMarkerCommit", "afterSidecarReplace"),
)
def testEvidenceStoreRecoversEveryCutoverCrashPoint(tmp_path: Path, faultPoint: str) -> None:
    progressPath = tmp_path / "progress.json"
    progressPath.write_text(
        json.dumps({
            "lessons": {"30days/day01": {"category": "30days", "contentId": "day01"}},
            "updatedAt": "2026-07-20T00:00:00Z",
        }),
        encoding="utf-8",
    )
    storagePath = tmp_path / "learningEvidence.sqlite3"
    headerPath = tmp_path / "learningEvidence.store-header.json"

    def failAt(point: str) -> None:
        if point == faultPoint:
            raise RuntimeError(f"simulated crash at {point}")

    interrupted = LearningEvidenceArchiveStore(
        storagePath,
        cutoverFault=failAt,
        headerPath=headerPath,
        legacyProgressPath=progressPath,
    )
    with pytest.raises(RuntimeError, match=faultPoint):
        interrupted.initialize()

    recovered = LearningEvidenceArchiveStore(
        storagePath,
        headerPath=headerPath,
        legacyProgressPath=progressPath,
    )
    header = recovered.initialize()
    events = recovered.eventPayloads()

    assert header["legacyImport"]["eventCount"] == 1
    assert len(events) == 1
    assert events[0]["kind"] == "MigrationImported"
    assert recovered.summary() == {"events": 1, "conflicts": 0}
    assert json.loads(headerPath.read_text(encoding="utf-8")) == header
    assert len(list((tmp_path / "learningEvidence.legacy-import").iterdir())) == 1
