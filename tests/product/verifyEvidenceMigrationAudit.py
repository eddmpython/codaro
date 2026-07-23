from __future__ import annotations

from contextlib import closing
from datetime import UTC, datetime
import json
import os
from pathlib import Path
import sqlite3
import subprocess
import sys
import tempfile
import time
from typing import Any

import yaml

from codaro.curriculum.evidenceArchive import (
    EvidenceArchiveError,
    LEARNING_EVIDENCE_READER_VERSION,
    LearningEvidenceArchiveStore,
    digestBytes,
    digestText,
    sealEvidenceEvent,
    stableJson,
)


ROOT = Path(__file__).resolve().parents[2]
FIXTURE_PATH = ROOT / "tests/learning/fixtures/evidenceMigration/old-reader-after-cutover.yml"
REPORT_PATH = ROOT / "output/test-runner/evidence-migration/evidence-migration-report.json"
WEB_STORE_PATH = ROOT / "editor/src/lib/webLearningEvidence.ts"
LOCAL_STORE_PATH = ROOT / "src/codaro/curriculum/evidenceArchive.py"
LAUNCHER_MAIN_PATH = ROOT / "launcher/codaro-launcher/src/main.rs"
LAUNCHER_BACKEND_PATH = ROOT / "launcher/codaro-launcher/src/backend.rs"
LAUNCHER_MANIFEST_PATH = ROOT / "launcher/codaro-launcher/src/manifest.rs"
RELEASE_BUILDER_PATH = ROOT / "docs/skills/ops/tools/buildReleaseManifest.py"
PRODUCT_BROWSER_PATH = ROOT / "tests/surface/verifyProductExperiencePlaywright.py"
PRODUCT_BROWSER_REPORT_PATH = (
    ROOT / "output/test-runner/evidence-migration/product-experience-report.json"
)


def loadFixture() -> dict[str, Any]:
    payload = yaml.safe_load(FIXTURE_PATH.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("evidence migration fixture root must be a mapping")
    return payload


def sampleEvent() -> dict[str, object]:
    attemptFingerprint = digestText("migration-attempt")
    return sealEvidenceEvent({
        "attemptFingerprint": attemptFingerprint,
        "blockId": "section-exercise",
        "checkId": "lesson:30days/day01:required:hello-output:v1",
        "eventId": f"web-strong:{attemptFingerprint}",
        "executionCount": 1,
        "expectedHash": digestText("Hello Codaro\n"),
        "fixtureHash": digestText("fixture"),
        "kind": "StrongCheckVerified",
        "lessonRef": "30days/day01",
        "occurredAt": "2026-07-22T00:00:00Z",
        "resultHash": digestText("Hello Codaro\n"),
        "runtimeTier": "web",
        "schemaVersion": 1,
        "sourceHash": digestText("print('Hello Codaro')"),
        "strength": "strong",
    })


def verifyLocalCutover() -> dict[str, Any]:
    with tempfile.TemporaryDirectory(prefix="codaro-evidence-migration-") as temporary:
        root = Path(temporary)
        storagePath = root / "learningEvidence.sqlite3"
        headerPath = root / "launcher-state" / "learning-evidence-store-header.json"
        progressPath = root / "progress.json"
        learnerStatePath = root / "learnerState.db"
        event = sampleEvent()
        progress = {
            "lessons": {
                "30days/day01": {
                    "category": "30days",
                    "completedAt": "2026-07-20T00:00:00Z",
                    "completedMissions": ["legacy-mission"],
                    "contentId": "day01",
                    "totalMissions": 1,
                }
            },
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
            connection.commit()
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
        store = LearningEvidenceArchiveStore(
            storagePath,
            headerPath=headerPath,
            legacyLearnerStatePath=learnerStatePath,
            legacyProgressPath=progressPath,
        )
        header = store.initialize()
        beforeEvents = store.eventPayloads()
        expectedSnapshotHash = digestText(stableJson(beforeEvents))
        if header.get("legacySnapshotHash") != expectedSnapshotHash:
            raise ValueError("legacy event snapshot hash was not preserved at cutover")
        legacyImport = header.get("legacyImport")
        sources = legacyImport.get("sources") if isinstance(legacyImport, dict) else None
        if not isinstance(sources, list) or len(sources) != 2:
            raise ValueError("Local legacy progress and learner state were not both imported")
        for source in sources:
            backupPath = root / str(source.get("backupPath", ""))
            if not backupPath.is_file() or source.get("backupHash") != digestBytes(backupPath.read_bytes()):
                raise ValueError("Local legacy import backup hash is invalid")
        migrationEvents = [item for item in beforeEvents if item.get("kind") == "MigrationImported"]
        if (
            len(migrationEvents) != 2
            or any(item.get("creditEligibility") != "none" for item in migrationEvents)
            or any("checkId" in item or "strength" in item for item in migrationEvents)
        ):
            raise ValueError("Local legacy import granted credit or lost a source event")
        if json.loads(headerPath.read_text(encoding="utf-8")) != header:
            raise ValueError("launcher sidecar does not match the canonical SQLite header")
        incompatibleHeader = {**header, "minimumReaderVersion": LEARNING_EVIDENCE_READER_VERSION + 1}
        with closing(sqlite3.connect(storagePath)) as connection:
            connection.execute(
                "UPDATE metadata SET payload_json = ? WHERE metadata_key = ?",
                (stableJson(incompatibleHeader), "store-header"),
            )
            connection.commit()
        try:
            LearningEvidenceArchiveStore(
                storagePath,
                headerPath=headerPath,
                legacyLearnerStatePath=learnerStatePath,
                legacyProgressPath=progressPath,
            ).summary()
        except EvidenceArchiveError as error:
            if "안전하게 읽을 수 없습니다" not in str(error):
                raise
        else:
            raise ValueError("reader below the persisted floor was accepted")
        with closing(sqlite3.connect(storagePath)) as connection:
            afterEvents = [
                json.loads(str(row[0]))
                for row in connection.execute("SELECT payload_json FROM events ORDER BY event_id").fetchall()
            ]
        if beforeEvents != afterEvents:
            raise ValueError("reader rejection changed canonical evidence events")
        return {
            "cutoverMarker": header["cutoverMarker"]["eventId"],
            "legacySnapshotHash": expectedSnapshotHash,
            "legacyImportEventCount": len(migrationEvents),
            "legacyImportSources": sorted(item["sourceKind"] for item in migrationEvents),
            "minimumReaderVersion": header["minimumReaderVersion"],
            "preservedEventCount": len(afterEvents),
            "storeUnchangedAfterRejection": True,
        }


def verifyCrashPointMatrix() -> dict[str, Any]:
    crashPoints = ("afterBackup", "afterImport", "afterMarkerCommit", "afterSidecarReplace")
    recovered: list[str] = []
    for crashPoint in crashPoints:
        with tempfile.TemporaryDirectory(prefix=f"codaro-evidence-{crashPoint}-") as temporary:
            root = Path(temporary)
            progressPath = root / "progress.json"
            progressPath.write_text(
                json.dumps({
                    "lessons": {"30days/day01": {"category": "30days", "contentId": "day01"}},
                    "updatedAt": "2026-07-20T00:00:00Z",
                }),
                encoding="utf-8",
            )
            storagePath = root / "learningEvidence.sqlite3"
            headerPath = root / "learningEvidence.store-header.json"

            def failAt(point: str) -> None:
                if point == crashPoint:
                    raise RuntimeError(f"simulated crash at {point}")

            try:
                LearningEvidenceArchiveStore(
                    storagePath,
                    cutoverFault=failAt,
                    headerPath=headerPath,
                    legacyProgressPath=progressPath,
                ).initialize()
            except RuntimeError as error:
                if crashPoint not in str(error):
                    raise
            else:
                raise ValueError(f"crash point did not interrupt cutover: {crashPoint}")
            store = LearningEvidenceArchiveStore(
                storagePath,
                headerPath=headerPath,
                legacyProgressPath=progressPath,
            )
            header = store.initialize()
            events = store.eventPayloads()
            if (
                len(events) != 1
                or events[0].get("kind") != "MigrationImported"
                or header.get("legacyImport", {}).get("eventCount") != 1
                or json.loads(headerPath.read_text(encoding="utf-8")) != header
            ):
                raise ValueError(f"cutover did not recover cleanly after {crashPoint}")
            recovered.append(crashPoint)
    return {"crashPoints": recovered, "duplicateEvents": 0, "recovered": len(recovered)}


def verifySourceContracts() -> dict[str, Any]:
    sources = {
        "web": WEB_STORE_PATH.read_text(encoding="utf-8"),
        "local": LOCAL_STORE_PATH.read_text(encoding="utf-8"),
        "launcher": (
            LAUNCHER_MAIN_PATH.read_text(encoding="utf-8")
            + LAUNCHER_BACKEND_PATH.read_text(encoding="utf-8")
        ),
        "manifest": LAUNCHER_MANIFEST_PATH.read_text(encoding="utf-8"),
        "release": RELEASE_BUILDER_PATH.read_text(encoding="utf-8"),
    }
    required = {
        "web": (
            "DATABASE_VERSION = 3",
            "METADATA_STORE",
            "ensureWebLearningEvidenceCutover",
            "MigrationImported",
            "legacyImport",
        ),
        "local": (
            "minimumReaderVersion",
            "cutoverMarker",
            "legacySnapshotHash",
            "MigrationImported",
            "_prepareLegacyImport",
        ),
        "launcher": ("learning_evidence_reader_floor", "Rollback blocked", "CODARO_LEARNING_STORE_HEADER_PATH"),
        "manifest": ("learning_evidence_reader_version",),
        "release": ('"learningEvidenceReaderVersion"',),
    }
    missing = [
        f"{scope}:{token}"
        for scope, tokens in required.items()
        for token in tokens
        if token not in sources[scope]
    ]
    if missing:
        raise ValueError("evidence migration source contracts are absent: " + ", ".join(missing))
    return {"requiredTokenCount": sum(len(tokens) for tokens in required.values()), "missing": missing}


def verifyWebCutover() -> dict[str, Any]:
    command = (
        "uv", "run", "--with", "playwright", "python", "-X", "utf8",
        str(PRODUCT_BROWSER_PATH.relative_to(ROOT)),
    )
    environment = os.environ.copy()
    environment["CODARO_PRODUCT_CASE"] = "web-lesson-mobile"
    environment["CODARO_PRODUCT_REPORT_PATH"] = str(PRODUCT_BROWSER_REPORT_PATH.relative_to(ROOT))
    result = subprocess.run(
        command,
        cwd=ROOT,
        env=environment,
        capture_output=True,
        text=True,
        timeout=300,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()[-800:]
        raise ValueError(f"Web evidence cutover browser case failed: {detail}")
    report = json.loads(PRODUCT_BROWSER_REPORT_PATH.read_text(encoding="utf-8"))
    cases = report.get("cases")
    case = cases[0] if isinstance(cases, list) and len(cases) == 1 else None
    audit = case.get("audit") if isinstance(case, dict) else None
    header = audit.get("webEvidenceStoreHeader") if isinstance(audit, dict) else None
    marker = header.get("cutoverMarker") if isinstance(header, dict) else None
    if not (
        report.get("passed") is True
        and isinstance(case, dict)
        and case.get("name") == "web-lesson-mobile"
        and isinstance(audit, dict)
        and isinstance(header, dict)
        and header.get("key") == "store-header"
        and header.get("schemaVersion") == 1
        and header.get("dataEpoch") == 1
        and header.get("minimumReaderVersion") == 3
        and isinstance(header.get("legacySnapshotHash"), str)
        and header["legacySnapshotHash"].startswith("sha256-")
        and isinstance(marker, dict)
        and isinstance(marker.get("eventId"), str)
        and marker["eventId"].startswith("learning-evidence-cutover:")
        and audit.get("webLegacyReaderRejected") is True
        and audit.get("webStrongEvidenceEventCount", 0) >= 1
        and audit.get("webMigrationImportedEventCount") == 1
        and isinstance(header.get("legacyImport"), dict)
        and header["legacyImport"].get("eventCount") == 1
    ):
        raise ValueError("Web evidence cutover report does not prove the v3 header and v2 rejection")
    return {
        "browser": report.get("browser"),
        "command": " ".join(command),
        "legacyReaderRejected": True,
        "legacyProgressImported": True,
        "minimumReaderVersion": header["minimumReaderVersion"],
        "reportPath": PRODUCT_BROWSER_REPORT_PATH.relative_to(ROOT).as_posix(),
    }


def verifyLauncherRejection() -> dict[str, Any]:
    command = (
        "cargo", "test", "resolve_rollback_state_rejects_reader_below_cutover_floor",
        "--", "--nocapture",
    )
    result = subprocess.run(
        command,
        cwd=ROOT / "launcher/codaro-launcher",
        capture_output=True,
        text=True,
        timeout=180,
    )
    output = f"{result.stdout}\n{result.stderr}"
    if result.returncode != 0 or "1 passed" not in output:
        raise ValueError("launcher old-reader rejection test failed")
    return {"command": " ".join(command), "passed": True, "returnCode": result.returncode}


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    facts: dict[str, Any] = {}
    try:
        fixture = loadFixture()
        candidate = fixture.get("candidateRelease")
        storeHeader = fixture.get("storeHeader")
        expectedFailure = fixture.get("expectedFailure")
        if (
            fixture.get("schemaVersion") != 1
            or not isinstance(candidate, dict)
            or not isinstance(storeHeader, dict)
            or not isinstance(expectedFailure, dict)
            or not isinstance(candidate.get("learningEvidenceReaderVersion"), int)
            or not isinstance(storeHeader.get("minimumReaderVersion"), int)
            or candidate.get("learningEvidenceReaderVersion", 0) >= storeHeader.get("minimumReaderVersion", 0)
            or expectedFailure.get("storeUnchanged") is not True
        ):
            raise ValueError("old-reader negative fixture does not describe a rejected downgrade")
        facts["fixture"] = {
            "path": FIXTURE_PATH.relative_to(ROOT).as_posix(),
            "candidateReaderVersion": candidate["learningEvidenceReaderVersion"],
            "minimumReaderVersion": storeHeader["minimumReaderVersion"],
        }
        facts["localCutover"] = verifyLocalCutover()
        facts["crashPointMatrix"] = verifyCrashPointMatrix()
        facts["sourceContracts"] = verifySourceContracts()
        facts["webCutover"] = verifyWebCutover()
        facts["launcherRejection"] = verifyLauncherRejection()
    except (OSError, ValueError, subprocess.SubprocessError, yaml.YAMLError) as error:
        failures.append(str(error))
    payload = {
        "schemaVersion": 1,
        "audit": "evidence-migration",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "facts": facts,
        "failures": failures,
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        print("FAIL: evidence migration audit failed", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    print("ok: evidence migration cutover and old-reader rejection passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
