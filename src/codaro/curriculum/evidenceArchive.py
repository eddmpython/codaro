from __future__ import annotations

import base64
from contextlib import closing
import hashlib
import json
import os
import re
import sqlite3
import tempfile
import threading
import time
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, Callable

from .learningEvent import (
    LearningEventError,
    learningEventDigest,
    sealLearningEvent,
    validateLearningEvent,
)


ARCHIVE_KIND = "codaro.learning-evidence-archive"
ARCHIVE_EVENT_PATH = "evidence/events.json"
MAX_ARCHIVE_EVENTS = 10_000
SHA256_PATTERN = re.compile(r"^sha256-(?:[A-Za-z0-9_-]{43}|[A-Za-z0-9+/]{43}=)$")
STRONG_EVENT_FIELDS = (
    "attemptFingerprint",
    "blockId",
    "checkId",
    "eventId",
    "executionCount",
    "expectedHash",
    "fixtureHash",
    "kind",
    "lessonRef",
    "occurredAt",
    "resultHash",
    "runtimeTier",
    "schemaVersion",
    "sourceHash",
    "strength",
)
MIGRATION_SOURCE_KINDS = {
    "learner-state-sqlite-v1",
    "progress-json-v1",
    "web-progress-v1",
}
LEGACY_BACKUP_DIRECTORY = "learningEvidence.legacy-import"
MAX_LEGACY_SOURCE_BYTES = 32 * 1024 * 1024
MAX_EVENT_ARTIFACTS = 64
MAX_EVENT_PACKAGES = 16
MAX_CANONICAL_EVENTS = 4
STORE_HEADER_KEY = "store-header"
STORE_HEADER_SCHEMA_VERSION = 1
STORE_DATA_EPOCH = 1
LEARNING_EVIDENCE_READER_VERSION = 1


class EvidenceArchiveError(ValueError):
    pass


class LearningEvidenceArchiveStore:
    def __init__(
        self,
        storagePath: str | Path | None = None,
        *,
        headerPath: str | Path | None = None,
        legacyLearnerStatePath: str | Path | None = None,
        legacyProgressPath: str | Path | None = None,
        lessonRefResolver: Callable[[str], str] | None = None,
        cutoverFault: Callable[[str], None] | None = None,
    ) -> None:
        defaultHome = Path(os.environ.get("CODARO_HOME", Path.home() / ".codaro")).expanduser()
        if storagePath is None:
            storagePath = defaultHome / "learningEvidence.sqlite3"
        self._storagePath = Path(storagePath).resolve()
        legacyRoot = defaultHome if storagePath is None else self._storagePath.parent
        configuredHeaderPath = headerPath or os.environ.get("CODARO_LEARNING_STORE_HEADER_PATH")
        self._headerPath = (
            Path(configuredHeaderPath).expanduser().resolve()
            if configuredHeaderPath
            else self._storagePath.with_name("learningEvidence.store-header.json")
        )
        self._legacyProgressPath = Path(legacyProgressPath or legacyRoot / "progress.json").expanduser().resolve()
        self._legacyLearnerStatePath = Path(
            legacyLearnerStatePath or legacyRoot / "learnerState.db"
        ).expanduser().resolve()
        self._lessonRefResolver = lessonRefResolver
        self._cutoverFault = cutoverFault
        self._initializationLock = threading.RLock()

    @property
    def storagePath(self) -> Path:
        return self._storagePath

    @property
    def headerPath(self) -> Path:
        return self._headerPath

    def initialize(self) -> dict[str, Any]:
        return self.storeHeader()

    def storeHeader(self) -> dict[str, Any]:
        with closing(self._connect()) as connection:
            row = connection.execute(
                "SELECT payload_json FROM metadata WHERE metadata_key = ?",
                (STORE_HEADER_KEY,),
            ).fetchone()
        if row is None:
            raise EvidenceArchiveError("학습 증거 store header를 만들지 못했습니다.")
        return validateStoreHeader(json.loads(str(row[0])))

    def summary(self) -> dict[str, int]:
        with closing(self._connect()) as connection:
            eventCount = int(connection.execute("SELECT COUNT(*) FROM events").fetchone()[0])
            conflictCount = int(connection.execute("SELECT COUNT(*) FROM conflicts").fetchone()[0])
        return {"events": eventCount, "conflicts": conflictCount}

    def buildArchive(self) -> dict[str, Any]:
        with closing(self._connect()) as connection:
            rows = connection.execute("SELECT payload_json FROM events ORDER BY event_id").fetchall()
        events = [json.loads(str(row[0])) for row in rows]
        return buildLearningEvidenceArchive(events)

    def mergeArchive(self, value: object) -> dict[str, object]:
        archive = validateLearningEvidenceArchive(value)
        events = [self._canonicalEvent(event) for event in archive["events"]]
        receipt: dict[str, Any] = {
            "accepted": [],
            "conflicted": 0,
            "inserted": 0,
            "migrated": sum(
                event["kind"] == "StrongCheckVerified"
                and original["kind"] == "StrongCheckVerified"
                and event["lessonRef"] != original["lessonRef"]
                for event, original in zip(events, archive["events"], strict=True)
            ),
            "skipped": 0,
        }
        connection = self._connect()
        try:
            connection.execute("BEGIN IMMEDIATE")
            for event in events:
                eventId = str(event["eventId"])
                payloadJson = stableJson(event)
                existing = connection.execute(
                    "SELECT payload_hash, payload_json FROM events WHERE event_id = ?",
                    (eventId,),
                ).fetchone()
                if existing is None:
                    connection.execute(
                        "INSERT INTO events(event_id, payload_hash, payload_json, occurred_at) VALUES (?, ?, ?, ?)",
                        (eventId, event["payloadHash"], payloadJson, event["occurredAt"]),
                    )
                    receipt["inserted"] += 1
                    if event["kind"] == "StrongCheckVerified":
                        receipt["accepted"].append({"checkId": event["checkId"], "lessonRef": event["lessonRef"]})
                    continue
                if str(existing[1]) == payloadJson:
                    receipt["skipped"] += 1
                    if event["kind"] == "StrongCheckVerified":
                        receipt["accepted"].append({"checkId": event["checkId"], "lessonRef": event["lessonRef"]})
                    continue
                receipt["conflicted"] += 1
                conflictId = f"{eventId}:{event['payloadHash']}"
                connection.execute(
                    """
                    INSERT OR IGNORE INTO conflicts(
                        conflict_id, event_id, existing_payload_hash, imported_payload_hash, occurred_at
                    ) VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        conflictId,
                        eventId,
                        str(existing[0]),
                        str(event["payloadHash"]),
                        utcTimestamp(),
                    ),
                )
            connection.commit()
            return receipt
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def appendEvent(self, value: object) -> dict[str, object]:
        event = normalizeEvidenceEvent(value)
        return self.mergeArchive(buildLearningEvidenceArchive([event]))

    def eventPayloads(self) -> list[dict[str, Any]]:
        with closing(self._connect()) as connection:
            rows = connection.execute("SELECT payload_json FROM events ORDER BY event_id").fetchall()
        payloads: list[dict[str, Any]] = []
        for row in rows:
            event = json.loads(str(row[0]))
            payloads.append(event)
            if event.get("kind") == "StrongCheckVerified":
                payloads.extend(event.get("canonicalEvents", []))
        return payloads

    def _canonicalEvent(self, event: dict[str, Any]) -> dict[str, Any]:
        if event["kind"] != "StrongCheckVerified" or self._lessonRefResolver is None:
            return normalizeEvidenceEvent(event)
        try:
            lessonRef = self._lessonRefResolver(str(event["lessonRef"]))
        except ValueError as error:
            raise EvidenceArchiveError(str(error)) from error
        return migrateEvidenceEventLessonRef(event, lessonRef)

    def _connect(self) -> sqlite3.Connection:
        with self._initializationLock:
            self._storagePath.parent.mkdir(parents=True, exist_ok=True)
            connection = sqlite3.connect(self._storagePath, timeout=10.0)
            connection.execute("PRAGMA foreign_keys = ON")
            connection.execute("PRAGMA journal_mode = WAL")
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS events(
                    event_id TEXT PRIMARY KEY,
                    payload_hash TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    occurred_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS conflicts(
                    conflict_id TEXT PRIMARY KEY,
                    event_id TEXT NOT NULL,
                    existing_payload_hash TEXT NOT NULL,
                    imported_payload_hash TEXT NOT NULL,
                    occurred_at TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS conflicts_event_id ON conflicts(event_id);
                CREATE TABLE IF NOT EXISTS metadata(
                    metadata_key TEXT PRIMARY KEY,
                    payload_json TEXT NOT NULL
                );
                """
            )
            try:
                self._ensureStoreHeader(connection)
            except Exception:
                connection.close()
                raise
            return connection

    def _ensureStoreHeader(self, connection: sqlite3.Connection) -> None:
        row = connection.execute(
            "SELECT payload_json FROM metadata WHERE metadata_key = ?",
            (STORE_HEADER_KEY,),
        ).fetchone()
        if row is None:
            migrationEvents, importSources = self._prepareLegacyImport()
            self._raiseCutoverFault("afterBackup")
            try:
                connection.execute("BEGIN IMMEDIATE")
                for event in migrationEvents:
                    connection.execute(
                        """
                        INSERT OR IGNORE INTO events(event_id, payload_hash, payload_json, occurred_at)
                        VALUES (?, ?, ?, ?)
                        """,
                        (event["eventId"], event["payloadHash"], stableJson(event), event["occurredAt"]),
                    )
                self._raiseCutoverFault("afterImport")
                events = [
                    json.loads(str(item[0]))
                    for item in connection.execute("SELECT payload_json FROM events ORDER BY event_id").fetchall()
                ]
                legacySnapshotHash = digestText(stableJson(events))
                cutoverMarker = {
                    "eventId": f"learning-evidence-cutover:{legacySnapshotHash.removeprefix('sha256-')}",
                    "occurredAt": utcTimestamp(),
                }
                header = {
                    "cutoverMarker": cutoverMarker,
                    "dataEpoch": STORE_DATA_EPOCH,
                    "legacyImport": {
                        "eventCount": len(migrationEvents),
                        "sources": importSources,
                    },
                    "legacySnapshotHash": legacySnapshotHash,
                    "minimumReaderVersion": LEARNING_EVIDENCE_READER_VERSION,
                    "schemaVersion": STORE_HEADER_SCHEMA_VERSION,
                }
                connection.execute(
                    "INSERT INTO metadata(metadata_key, payload_json) VALUES (?, ?)",
                    (STORE_HEADER_KEY, stableJson(header)),
                )
                connection.execute(f"PRAGMA user_version = {STORE_DATA_EPOCH}")
                connection.commit()
            except Exception:
                connection.rollback()
                raise
            self._raiseCutoverFault("afterMarkerCommit")
        else:
            try:
                rawHeader = json.loads(str(row[0]))
            except json.JSONDecodeError as error:
                raise EvidenceArchiveError("학습 증거 store header가 손상되었습니다.") from error
            header = validateStoreHeader(rawHeader)
        self._writeStoreHeaderSidecar(header)

    def _prepareLegacyImport(self) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
        events: list[dict[str, Any]] = []
        sources: list[dict[str, Any]] = []
        if self._legacyProgressPath.exists():
            rawProgress = self._legacyProgressPath.read_bytes()
            if len(rawProgress) > MAX_LEGACY_SOURCE_BYTES:
                raise EvidenceArchiveError("기존 학습 progress 파일이 이관 한도를 초과했습니다.")
            try:
                progress = json.loads(rawProgress.decode("utf-8"))
            except (UnicodeDecodeError, json.JSONDecodeError) as error:
                raise EvidenceArchiveError("기존 학습 progress 파일을 읽을 수 없습니다.") from error
            if not isinstance(progress, dict):
                raise EvidenceArchiveError("기존 학습 progress 형식이 유효하지 않습니다.")
            recordCount = legacyProgressRecordCount(progress)
            if recordCount > 0:
                event = buildMigrationImportedEvent(
                    legacyState=progress,
                    lessonRefMap=self._legacyLessonRefMap(progress),
                    occurredAt=str(progress.get("updatedAt") or utcTimestamp()),
                    recordCount=recordCount,
                    runtimeTier="local",
                    sourceKind="progress-json-v1",
                )
                backup = self._writeLegacyBackup("progress-json-v1", rawProgress, ".json")
                events.append(event)
                sources.append(self._legacySourceDescriptor(event, backup))
        if self._legacyLearnerStatePath.exists():
            learnerState, backupBytes = self._readLegacyLearnerStateSnapshot()
            recordCount = sum(len(rows) for rows in learnerState.values())
            if recordCount > 0:
                event = buildMigrationImportedEvent(
                    legacyState=learnerState,
                    lessonRefMap={},
                    occurredAt=utcTimestamp(),
                    recordCount=recordCount,
                    runtimeTier="local",
                    sourceKind="learner-state-sqlite-v1",
                )
                backup = self._writeLegacyBackup("learner-state-sqlite-v1", backupBytes, ".sqlite3")
                events.append(event)
                sources.append(self._legacySourceDescriptor(event, backup))
        return events, sources

    def _legacyLessonRefMap(self, progress: dict[str, Any]) -> dict[str, str]:
        if self._lessonRefResolver is None:
            return {}
        lessons = progress.get("lessons")
        if not isinstance(lessons, dict):
            return {}
        result: dict[str, str] = {}
        for key, value in lessons.items():
            if not isinstance(key, str) or not isinstance(value, dict):
                continue
            category = value.get("category")
            contentId = value.get("contentId")
            candidate = f"{category}/{contentId}" if isinstance(category, str) and isinstance(contentId, str) else key
            try:
                result[key] = self._lessonRefResolver(candidate)
            except ValueError:
                continue
        return result

    def _readLegacyLearnerStateSnapshot(self) -> tuple[dict[str, list[dict[str, Any]]], bytes]:
        temporaryDirectory = self._storagePath.parent
        temporaryDirectory.mkdir(parents=True, exist_ok=True)
        descriptor, temporaryName = tempfile.mkstemp(prefix=".learner-state-snapshot.", dir=temporaryDirectory)
        os.close(descriptor)
        temporary = Path(temporaryName)
        try:
            with closing(sqlite3.connect(f"file:{self._legacyLearnerStatePath}?mode=ro", uri=True)) as source:
                with closing(sqlite3.connect(temporary)) as destination:
                    source.backup(destination)
            snapshot: dict[str, list[dict[str, Any]]] = {}
            with closing(sqlite3.connect(temporary)) as connection:
                connection.row_factory = sqlite3.Row
                tables = {
                    str(row[0])
                    for row in connection.execute("SELECT name FROM sqlite_master WHERE type = 'table'").fetchall()
                }
                for table, orderBy in (
                    ("outcomeMastery", "outcomeId"),
                    ("misconceptionHit", "misconceptionId"),
                    ("executionSummary", "key"),
                ):
                    snapshot[table] = (
                        [dict(row) for row in connection.execute(f"SELECT * FROM {table} ORDER BY {orderBy}").fetchall()]
                        if table in tables
                        else []
                    )
            return snapshot, temporary.read_bytes()
        except sqlite3.DatabaseError as error:
            raise EvidenceArchiveError("기존 learner state database를 읽을 수 없습니다.") from error
        finally:
            if temporary.exists():
                temporary.unlink()

    def _writeLegacyBackup(self, sourceKind: str, payload: bytes, suffix: str) -> dict[str, Any]:
        backupHash = digestBytes(payload)
        backupDirectory = self._storagePath.parent / LEGACY_BACKUP_DIRECTORY
        backupDirectory.mkdir(parents=True, exist_ok=True)
        sourceLabel = "progress" if sourceKind == "progress-json-v1" else "learner-state"
        hashLabel = backupHash.removeprefix("sha256-")[:16]
        backupPath = backupDirectory / f"{sourceLabel}-{hashLabel}{suffix}"
        if backupPath.exists():
            if digestBytes(backupPath.read_bytes()) != backupHash:
                raise EvidenceArchiveError("기존 학습 진도 backup hash가 일치하지 않습니다.")
        else:
            descriptor, temporaryName = tempfile.mkstemp(prefix=f".{backupPath.name}.", dir=backupDirectory)
            temporary = Path(temporaryName)
            try:
                with os.fdopen(descriptor, "wb") as handle:
                    handle.write(payload)
                    handle.flush()
                    os.fsync(handle.fileno())
                os.replace(temporary, backupPath)
            finally:
                if temporary.exists():
                    temporary.unlink()
        return {
            "backupHash": backupHash,
            "backupPath": backupPath.relative_to(self._storagePath.parent).as_posix(),
        }

    @staticmethod
    def _legacySourceDescriptor(event: dict[str, Any], backup: dict[str, Any]) -> dict[str, Any]:
        return {
            **backup,
            "eventId": event["eventId"],
            "recordCount": event["recordCount"],
            "sourceKind": event["sourceKind"],
            "sourceRecordHash": event["sourceRecordHash"],
        }

    def _raiseCutoverFault(self, point: str) -> None:
        if self._cutoverFault is not None:
            self._cutoverFault(point)

    def _writeStoreHeaderSidecar(self, header: dict[str, Any]) -> None:
        self._headerPath.parent.mkdir(parents=True, exist_ok=True)
        serialized = json.dumps(header, ensure_ascii=False, indent=2) + "\n"
        try:
            if self._headerPath.read_text(encoding="utf-8") == serialized:
                return
        except FileNotFoundError:
            pass
        descriptor, temporaryName = tempfile.mkstemp(
            prefix=f".{self._headerPath.name}.",
            dir=self._headerPath.parent,
        )
        temporary = Path(temporaryName)
        try:
            with os.fdopen(descriptor, "w", encoding="utf-8", newline="\n") as handle:
                handle.write(serialized)
                handle.flush()
                os.fsync(handle.fileno())
            for attempt in range(4):
                try:
                    os.replace(temporary, self._headerPath)
                    self._raiseCutoverFault("afterSidecarReplace")
                    break
                except PermissionError:
                    if self._headerPath.exists() and self._headerPath.read_text(encoding="utf-8") == serialized:
                        return
                    if attempt == 3:
                        raise
                    time.sleep(0.05 * (attempt + 1))
        finally:
            if temporary.exists():
                temporary.unlink()


def validateStoreHeader(value: object) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise EvidenceArchiveError("학습 증거 store header 형식이 유효하지 않습니다.")
    marker = value.get("cutoverMarker")
    minimumReaderVersion = value.get("minimumReaderVersion")
    if (
        value.get("schemaVersion") != STORE_HEADER_SCHEMA_VERSION
        or value.get("dataEpoch") != STORE_DATA_EPOCH
        or isinstance(minimumReaderVersion, bool)
        or not isinstance(minimumReaderVersion, int)
        or minimumReaderVersion < 1
        or not isinstance(value.get("legacySnapshotHash"), str)
        or not SHA256_PATTERN.fullmatch(value["legacySnapshotHash"])
        or not isinstance(marker, dict)
        or not isinstance(marker.get("eventId"), str)
        or not marker["eventId"].startswith("learning-evidence-cutover:")
        or not isinstance(marker.get("occurredAt"), str)
    ):
        raise EvidenceArchiveError("학습 증거 store header 계약이 유효하지 않습니다.")
    if minimumReaderVersion > LEARNING_EVIDENCE_READER_VERSION:
        raise EvidenceArchiveError(
            "이 Codaro 버전은 현재 학습 증거 store를 안전하게 읽을 수 없습니다. "
            f"reader {LEARNING_EVIDENCE_READER_VERSION}, required {minimumReaderVersion}."
        )
    validateLegacyImportHeader(value.get("legacyImport"))
    return value


def validateLegacyImportHeader(value: object) -> None:
    if value is None:
        return
    if not isinstance(value, dict):
        raise EvidenceArchiveError("기존 학습 진도 이관 header 형식이 유효하지 않습니다.")
    eventCount = value.get("eventCount")
    sources = value.get("sources")
    if (
        isinstance(eventCount, bool)
        or not isinstance(eventCount, int)
        or eventCount < 0
        or not isinstance(sources, list)
        or eventCount != len(sources)
    ):
        raise EvidenceArchiveError("기존 학습 진도 이관 header 계약이 유효하지 않습니다.")
    for source in sources:
        if (
            not isinstance(source, dict)
            or source.get("sourceKind") not in MIGRATION_SOURCE_KINDS
            or not isinstance(source.get("eventId"), str)
            or not isinstance(source.get("backupPath"), str)
            or not safeRelativePath(source["backupPath"])
            or not isinstance(source.get("backupHash"), str)
            or not SHA256_PATTERN.fullmatch(source["backupHash"])
            or not isinstance(source.get("sourceRecordHash"), str)
            or not SHA256_PATTERN.fullmatch(source["sourceRecordHash"])
            or isinstance(source.get("recordCount"), bool)
            or not isinstance(source.get("recordCount"), int)
            or source["recordCount"] < 0
        ):
            raise EvidenceArchiveError("기존 학습 진도 이관 source descriptor가 유효하지 않습니다.")


def legacyProgressRecordCount(value: dict[str, Any]) -> int:
    count = 0
    for key in ("lessons", "lessonReviews", "outcomeCredits"):
        current = value.get(key)
        if isinstance(current, dict):
            count += len(current)
    for key in ("validatedOutcomes", "autoValidatedOutcomes"):
        current = value.get(key)
        if isinstance(current, list):
            count += len(current)
    return count


def buildLearningEvidenceArchive(events: list[dict[str, Any]]) -> dict[str, Any]:
    normalized = sorted(
        (normalizeEvidenceEvent(event) for event in events),
        key=lambda event: str(event["eventId"]),
    )
    canonical = stableJson(normalized)
    canonicalBytes = canonical.encode("utf-8")
    eventSetHash = digestBytes(canonicalBytes)
    runtimeTier = archiveRuntimeTier(normalized)
    return {
        "events": normalized,
        "kind": ARCHIVE_KIND,
        "manifest": {
            "archiveId": f"learning-evidence:{eventSetHash.removeprefix('sha256-')}",
            "createdAt": utcTimestamp(),
            "eventCount": len(normalized),
            "eventSetHash": eventSetHash,
            "files": [
                {
                    "byteLength": len(canonicalBytes),
                    "contentHash": eventSetHash,
                    "mediaType": "application/json",
                    "path": ARCHIVE_EVENT_PATH,
                }
            ],
            "runtimeTier": runtimeTier,
            "schemaVersion": 1,
        },
        "schemaVersion": 1,
    }


def validateLearningEvidenceArchive(value: object) -> dict[str, Any]:
    if not isinstance(value, dict) or value.get("kind") != ARCHIVE_KIND or value.get("schemaVersion") != 1:
        raise EvidenceArchiveError("지원하지 않는 Codaro 학습 증거 archive입니다.")
    rawEvents = value.get("events")
    if not isinstance(rawEvents, list) or len(rawEvents) > MAX_ARCHIVE_EVENTS:
        raise EvidenceArchiveError("학습 증거 event 목록이 유효하지 않습니다.")
    events = sorted((normalizeEvidenceEvent(event) for event in rawEvents), key=lambda event: event["eventId"])
    eventIds = {event["eventId"] for event in events}
    if len(eventIds) != len(events):
        raise EvidenceArchiveError("학습 증거 archive에 중복 eventId가 있습니다.")
    canonical = stableJson(events)
    canonicalBytes = canonical.encode("utf-8")
    eventSetHash = digestBytes(canonicalBytes)
    manifest = value.get("manifest")
    files = manifest.get("files") if isinstance(manifest, dict) else None
    file = files[0] if isinstance(files, list) and files else None
    hashValue = eventSetHash.removeprefix("sha256-")
    expectedArchiveIds = {f"learning-evidence:{hashValue}", f"web-evidence:{hashValue}"}
    expectedRuntimeTier = archiveRuntimeTier(events)
    if not (
        isinstance(manifest, dict)
        and manifest.get("schemaVersion") == 1
        and manifest.get("runtimeTier") == expectedRuntimeTier
        and manifest.get("eventCount") == len(events)
        and manifest.get("eventSetHash") == eventSetHash
        and manifest.get("archiveId") in expectedArchiveIds
        and isinstance(manifest.get("createdAt"), str)
        and isinstance(files, list)
        and len(files) == 1
        and isinstance(file, dict)
        and file.get("path") == ARCHIVE_EVENT_PATH
        and file.get("mediaType") == "application/json"
        and file.get("contentHash") == eventSetHash
        and file.get("byteLength") == len(canonicalBytes)
    ):
        raise EvidenceArchiveError("학습 증거 archive manifest 해시가 일치하지 않습니다.")
    return {**value, "events": events}


def normalizeEvidenceEvent(value: object) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise EvidenceArchiveError("학습 증거 event 형식이 유효하지 않습니다.")
    core = evidenceEventCore(value)
    payloadHash = digestText(stableJson(core))
    existingPayloadHash = value.get("payloadHash")
    if isinstance(existingPayloadHash, str) and existingPayloadHash != payloadHash:
        raise EvidenceArchiveError(f"학습 증거 payload hash가 일치하지 않습니다: {core['eventId']}")
    return {**core, "payloadHash": payloadHash}


def evidenceEventCore(value: dict[str, Any]) -> dict[str, Any]:
    if value.get("kind") == "MigrationImported":
        return migrationImportedEventCore(value)
    stringFields = (
        "attemptFingerprint",
        "blockId",
        "checkId",
        "eventId",
        "expectedHash",
        "fixtureHash",
        "lessonRef",
        "occurredAt",
        "resultHash",
        "sourceHash",
    )
    if any(not isinstance(value.get(field), str) or not value[field] for field in stringFields):
        raise EvidenceArchiveError("학습 증거 event의 문자열 필드가 유효하지 않습니다.")
    executionCount = value.get("executionCount")
    if (
        value.get("kind") != "StrongCheckVerified"
        or value.get("runtimeTier") not in {"local", "web"}
        or value.get("schemaVersion") != 1
        or value.get("strength") != "strong"
        or isinstance(executionCount, bool)
        or not isinstance(executionCount, int)
        or executionCount < 0
    ):
        raise EvidenceArchiveError("학습 증거 event 계약이 유효하지 않습니다.")
    for field in ("attemptFingerprint", "expectedHash", "fixtureHash", "resultHash", "sourceHash"):
        if not SHA256_PATTERN.fullmatch(str(value[field])):
            raise EvidenceArchiveError(f"학습 증거 event의 {field} 해시가 유효하지 않습니다.")
    if value["eventId"] != f"{value['runtimeTier']}-strong:{value['attemptFingerprint']}" or "/" not in value["lessonRef"]:
        raise EvidenceArchiveError("학습 증거 event identity가 유효하지 않습니다.")
    core = {field: value[field] for field in STRONG_EVENT_FIELDS}
    if "artifacts" in value:
        core["artifacts"] = normalizeEvidenceArtifacts(value["artifacts"])
    if "packages" in value:
        core["packages"] = normalizeEvidencePackages(value["packages"])
    if "canonicalEvents" in value:
        core["canonicalEvents"] = normalizeCanonicalEvents(value["canonicalEvents"], outerEvent=core)
    return core


def sealEvidenceEvent(core: dict[str, Any]) -> dict[str, Any]:
    normalizedCore = evidenceEventCore(core)
    return {**normalizedCore, "payloadHash": digestText(stableJson(normalizedCore))}


def buildMigrationImportedEvent(
    *,
    legacyState: dict[str, Any],
    lessonRefMap: dict[str, str],
    occurredAt: str,
    recordCount: int,
    runtimeTier: str,
    sourceKind: str,
) -> dict[str, Any]:
    sourceRecordHash = digestText(stableJson(legacyState))
    core = {
        "creditEligibility": "none",
        "eventId": f"{runtimeTier}-migration:{sourceRecordHash.removeprefix('sha256-')}",
        "kind": "MigrationImported",
        "legacyState": legacyState,
        "lessonRefMap": lessonRefMap,
        "occurredAt": occurredAt,
        "recordCount": recordCount,
        "runtimeTier": runtimeTier,
        "schemaVersion": 1,
        "sourceKind": sourceKind,
        "sourceRecordHash": sourceRecordHash,
    }
    return sealEvidenceEvent(core)


def migrationImportedEventCore(value: dict[str, Any]) -> dict[str, Any]:
    legacyState = value.get("legacyState")
    lessonRefMap = value.get("lessonRefMap")
    recordCount = value.get("recordCount")
    runtimeTier = value.get("runtimeTier")
    sourceKind = value.get("sourceKind")
    sourceRecordHash = value.get("sourceRecordHash")
    if (
        value.get("kind") != "MigrationImported"
        or value.get("schemaVersion") != 1
        or value.get("creditEligibility") != "none"
        or runtimeTier not in {"local", "web"}
        or sourceKind not in MIGRATION_SOURCE_KINDS
        or not isinstance(value.get("eventId"), str)
        or not isinstance(value.get("occurredAt"), str)
        or not value["occurredAt"]
        or not isinstance(legacyState, dict)
        or not isinstance(lessonRefMap, dict)
        or any(not isinstance(key, str) or not isinstance(item, str) for key, item in lessonRefMap.items())
        or isinstance(recordCount, bool)
        or not isinstance(recordCount, int)
        or recordCount < 0
        or not isinstance(sourceRecordHash, str)
        or not SHA256_PATTERN.fullmatch(sourceRecordHash)
    ):
        raise EvidenceArchiveError("기존 학습 진도 이관 event 계약이 유효하지 않습니다.")
    serializedState = stableJson(legacyState)
    if len(serializedState.encode("utf-8")) > MAX_LEGACY_SOURCE_BYTES:
        raise EvidenceArchiveError("기존 학습 진도 이관 event가 크기 한도를 초과했습니다.")
    if digestText(serializedState) != sourceRecordHash:
        raise EvidenceArchiveError("기존 학습 진도 이관 source hash가 일치하지 않습니다.")
    expectedEventId = f"{runtimeTier}-migration:{sourceRecordHash.removeprefix('sha256-')}"
    if value["eventId"] != expectedEventId:
        raise EvidenceArchiveError("기존 학습 진도 이관 event identity가 유효하지 않습니다.")
    return {
        "creditEligibility": "none",
        "eventId": expectedEventId,
        "kind": "MigrationImported",
        "legacyState": legacyState,
        "lessonRefMap": dict(sorted(lessonRefMap.items())),
        "occurredAt": value["occurredAt"],
        "recordCount": recordCount,
        "runtimeTier": runtimeTier,
        "schemaVersion": 1,
        "sourceKind": sourceKind,
        "sourceRecordHash": sourceRecordHash,
    }


def migrateEvidenceEventLessonRef(event: dict[str, Any], lessonRef: str) -> dict[str, Any]:
    normalized = normalizeEvidenceEvent(event)
    if normalized["kind"] != "StrongCheckVerified":
        return normalized
    if normalized["lessonRef"] == lessonRef:
        return normalized
    includeAttemptMetadata = normalized["attemptFingerprint"] == strongEvidenceAttemptFingerprint(
        normalized,
        includeAttemptMetadata=True,
    )
    core = {
        field: normalized[field]
        for field in STRONG_EVENT_FIELDS
    }
    if "artifacts" in normalized:
        core["artifacts"] = normalized["artifacts"]
    if "packages" in normalized:
        core["packages"] = normalized["packages"]
    core["lessonRef"] = lessonRef
    attemptFingerprint = strongEvidenceAttemptFingerprint(
        core,
        includeAttemptMetadata=includeAttemptMetadata,
    )
    core["attemptFingerprint"] = attemptFingerprint
    core["eventId"] = f"{normalized['runtimeTier']}-strong:{attemptFingerprint}"
    if "canonicalEvents" in normalized:
        core["canonicalEvents"] = migrateCanonicalEventsLessonRef(normalized["canonicalEvents"], core)
    return sealEvidenceEvent(core)


def strongEvidenceAttemptFingerprint(
    event: dict[str, Any],
    *,
    includeAttemptMetadata: bool,
) -> str:
    payload = {
        "blockId": event["blockId"],
        "checkId": event["checkId"],
        "fixtureHash": event["fixtureHash"],
        "lessonRef": event["lessonRef"],
        "runtimeTier": event["runtimeTier"],
        "sourceHash": event["sourceHash"],
    }
    if includeAttemptMetadata:
        payload.update({
            "executionCount": event["executionCount"],
            "occurredAt": event["occurredAt"],
        })
    return digestText(stableJson(payload))


def migrateCanonicalEventsLessonRef(
    events: list[dict[str, Any]],
    outerEvent: dict[str, Any],
) -> list[dict[str, Any]]:
    eventIds = {
        "RunObserved": f"{outerEvent['eventId']}:run",
        "CheckEvaluated": f"{outerEvent['eventId']}:check",
        "SupportProvided": f"{outerEvent['eventId']}:support",
        "CreditGranted": f"{outerEvent['eventId']}:credit",
    }
    migrated: list[dict[str, Any]] = []
    supportIds = [eventIds["SupportProvided"]] if any(
        event["kind"] == "SupportProvided" for event in events
    ) else []
    for event in events:
        kind = str(event["kind"])
        core = {key: item for key, item in event.items() if key != "payloadHash"}
        core["eventId"] = eventIds[kind]
        epochRefs = dict(core["epochRefByScope"])
        epochRefs["lesson"] = f"{core['learningEpoch']}:{outerEvent['lessonRef']}"
        core["epochRefByScope"] = epochRefs
        if kind == "RunObserved":
            context = dict(core["runContext"])
            context.update({
                "attemptId": outerEvent["eventId"],
                "fixtureHash": outerEvent["fixtureHash"],
                "lessonRef": outerEvent["lessonRef"],
                "runId": outerEvent["eventId"],
                "sourceCodeHash": outerEvent["sourceHash"],
                "taskVariantId": f"{outerEvent['lessonRef']}#{context['sectionId']}",
            })
            context["lessonContentHash"] = learningEventDigest({
                "checkId": outerEvent["checkId"],
                "lessonRef": outerEvent["lessonRef"],
                "outcomeIds": context["outcomeIds"],
                "sectionId": context["sectionId"],
            })
            core["runContext"] = context
        elif kind == "CheckEvaluated":
            core["checkId"] = outerEvent["checkId"]
            core["runEventId"] = eventIds["RunObserved"]
        elif kind == "SupportProvided":
            core["runEventId"] = eventIds["RunObserved"]
        elif kind == "CreditGranted":
            core.update({
                "attemptFingerprint": outerEvent["attemptFingerprint"],
                "checkEventIds": [eventIds["CheckEvaluated"]],
                "runEventId": eventIds["RunObserved"],
                "supportEventIds": supportIds,
            })
        migrated.append(sealLearningEvent(core))
    return normalizeCanonicalEvents(migrated, outerEvent=outerEvent)


def normalizeCanonicalEvents(
    value: object,
    *,
    outerEvent: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    if not isinstance(value, list) or not 2 <= len(value) <= MAX_CANONICAL_EVENTS:
        raise EvidenceArchiveError("학습 증거 canonical event chain 길이가 유효하지 않습니다.")
    try:
        events = [validateLearningEvent(event) for event in value]
    except LearningEventError as error:
        raise EvidenceArchiveError("학습 증거 canonical event가 유효하지 않습니다.") from error
    kinds = [str(event["kind"]) for event in events]
    if kinds[:2] != ["RunObserved", "CheckEvaluated"]:
        raise EvidenceArchiveError("학습 증거 canonical event chain 순서가 유효하지 않습니다.")
    suffix = kinds[2:]
    if suffix not in ([], ["SupportProvided"], ["CreditGranted"], ["SupportProvided", "CreditGranted"]):
        raise EvidenceArchiveError("학습 증거 canonical event chain 순서가 유효하지 않습니다.")
    eventIds = [str(event["eventId"]) for event in events]
    if len(eventIds) != len(set(eventIds)):
        raise EvidenceArchiveError("학습 증거 canonical eventId가 중복되었습니다.")
    runEventId = eventIds[0]
    check = events[1]
    if check["runEventId"] != runEventId:
        raise EvidenceArchiveError("학습 증거 canonical check가 run과 연결되지 않았습니다.")
    supportEvents = [event for event in events if event["kind"] == "SupportProvided"]
    if any(event["runEventId"] != runEventId for event in supportEvents):
        raise EvidenceArchiveError("학습 증거 canonical support가 run과 연결되지 않았습니다.")
    creditEvents = [event for event in events if event["kind"] == "CreditGranted"]
    if creditEvents:
        credit = creditEvents[0]
        if (
            credit["runEventId"] != runEventId
            or credit["checkEventIds"] != [check["eventId"]]
            or credit["supportEventIds"] != [event["eventId"] for event in supportEvents]
        ):
            raise EvidenceArchiveError("학습 증거 canonical credit 연결이 유효하지 않습니다.")
    if outerEvent is not None:
        validateCanonicalEventBinding(events, outerEvent)
    return events


def validateCanonicalEventBinding(
    events: list[dict[str, Any]],
    outerEvent: dict[str, Any],
) -> None:
    byKind = {str(event["kind"]): event for event in events}
    run = byKind["RunObserved"]
    check = byKind["CheckEvaluated"]
    support = byKind.get("SupportProvided")
    credit = byKind.get("CreditGranted")
    expectedIds = {
        "RunObserved": f"{outerEvent['eventId']}:run",
        "CheckEvaluated": f"{outerEvent['eventId']}:check",
        "SupportProvided": f"{outerEvent['eventId']}:support",
        "CreditGranted": f"{outerEvent['eventId']}:credit",
    }
    if any(event["eventId"] != expectedIds[str(event["kind"])] for event in events):
        raise EvidenceArchiveError("학습 증거 canonical event identity가 outer evidence와 일치하지 않습니다.")
    expectedDeviceId = f"codaro-{outerEvent['runtimeTier']}-learning-evidence"
    if any(
        event["occurredAt"] != outerEvent["occurredAt"]
        or event["deviceId"] != expectedDeviceId
        or event["epochRefByScope"].get("lesson") != f"{event['learningEpoch']}:{outerEvent['lessonRef']}"
        for event in events
    ):
        raise EvidenceArchiveError("학습 증거 canonical envelope가 outer evidence와 일치하지 않습니다.")
    context = run["runContext"]
    runtimeBinding = {
        "local": ("local", "codaro-local", "local-sandbox-v1"),
        "web": ("browser", "pyproc", "browser-worker-v1"),
    }[outerEvent["runtimeTier"]]
    expectedLessonContentHash = learningEventDigest({
        "checkId": outerEvent["checkId"],
        "lessonRef": outerEvent["lessonRef"],
        "outcomeIds": context["outcomeIds"],
        "sectionId": context["sectionId"],
    })
    if (
        context["attemptId"] != outerEvent["eventId"]
        or context["runId"] != outerEvent["eventId"]
        or context["lessonRef"] != outerEvent["lessonRef"]
        or context["checkSpecId"] != outerEvent["checkId"]
        or context["fixtureHash"] != outerEvent["fixtureHash"]
        or context["sourceCodeHash"] != outerEvent["sourceHash"]
        or context["taskVariantId"] != f"{outerEvent['lessonRef']}#{context['sectionId']}"
        or context["lessonContentHash"] != expectedLessonContentHash
        or context["packageSetHash"] != learningEventDigest(outerEvent.get("packages", []))
        or (context["tierUsed"], context["runtimeId"], context["checkEngineVersion"]) != runtimeBinding
        or context["runtimeVersion"] != "1"
        or run["startedAt"] != outerEvent["occurredAt"]
        or run["completedAt"] != outerEvent["occurredAt"]
        or run["runStatus"] != "success"
    ):
        raise EvidenceArchiveError("학습 증거 canonical run이 outer evidence와 일치하지 않습니다.")
    if (
        check["checkId"] != outerEvent["checkId"]
        or check["strength"] != "strong"
        or check["passed"] is not True
    ):
        raise EvidenceArchiveError("학습 증거 canonical check가 outer evidence와 일치하지 않습니다.")
    if support is not None and support["runEventId"] != run["eventId"]:
        raise EvidenceArchiveError("학습 증거 canonical support가 outer evidence와 일치하지 않습니다.")
    if credit is not None and (
        credit["attemptFingerprint"] != outerEvent["attemptFingerprint"]
        or credit["evidenceTime"] != outerEvent["occurredAt"]
        or credit["appendReceiptAt"] != outerEvent["occurredAt"]
    ):
        raise EvidenceArchiveError("학습 증거 canonical credit가 outer evidence와 일치하지 않습니다.")


def normalizeEvidenceArtifacts(value: object) -> list[dict[str, object]]:
    if not isinstance(value, list) or len(value) > MAX_EVENT_ARTIFACTS:
        raise EvidenceArchiveError("학습 증거 산출물 목록이 유효하지 않습니다.")
    artifacts: list[dict[str, object]] = []
    seen: set[tuple[str, str, str]] = set()
    for item in value:
        if not isinstance(item, dict):
            raise EvidenceArchiveError("학습 증거 산출물 형식이 유효하지 않습니다.")
        byteLength = item.get("byteLength")
        path = item.get("path")
        contentHash = item.get("contentHash")
        kind = item.get("kind")
        origin = item.get("origin")
        if (
            isinstance(item.get("schemaVersion"), bool)
            or item.get("schemaVersion") != 1
            or kind not in {"directory", "file", "table", "image"}
            or origin not in {"created", "fixture"}
            or not isinstance(path, str)
            or not safeRelativePath(path)
            or not isinstance(contentHash, str)
            or not SHA256_PATTERN.fullmatch(contentHash)
            or isinstance(byteLength, bool)
            or not isinstance(byteLength, int)
            or byteLength < 0
        ):
            raise EvidenceArchiveError("학습 증거 산출물 descriptor가 유효하지 않습니다.")
        key = (origin, path, kind)
        if key in seen:
            raise EvidenceArchiveError("학습 증거 산출물 descriptor가 중복되었습니다.")
        seen.add(key)
        normalized: dict[str, object] = {
            "byteLength": byteLength,
            "contentHash": contentHash,
            "kind": kind,
            "origin": origin,
            "path": path,
            "schemaVersion": 1,
        }
        if kind in {"directory", "file"}:
            fileCount = item.get("fileCount")
            if isinstance(fileCount, bool) or not isinstance(fileCount, int) or fileCount < 0:
                raise EvidenceArchiveError("학습 증거 파일 산출물 descriptor가 유효하지 않습니다.")
            normalized["fileCount"] = fileCount
        elif kind == "table":
            formatName = item.get("format")
            rowCount = item.get("rowCount")
            columnCount = item.get("columnCount")
            columns = item.get("columns")
            if (
                formatName not in {"csv", "json"}
                or isinstance(rowCount, bool)
                or not isinstance(rowCount, int)
                or rowCount < 0
                or isinstance(columnCount, bool)
                or not isinstance(columnCount, int)
                or columnCount < 1
                or not isinstance(columns, list)
                or not all(isinstance(column, str) and column for column in columns)
                or len(set(columns)) != len(columns)
                or len(columns) != columnCount
            ):
                raise EvidenceArchiveError("학습 증거 표 산출물 descriptor가 유효하지 않습니다.")
            normalized.update({
                "columnCount": columnCount,
                "columns": list(columns),
                "format": formatName,
                "rowCount": rowCount,
            })
        else:
            mediaType = item.get("mediaType")
            width = item.get("width")
            height = item.get("height")
            if (
                mediaType not in {"image/png", "image/jpeg", "image/gif"}
                or isinstance(width, bool)
                or not isinstance(width, int)
                or width < 1
                or isinstance(height, bool)
                or not isinstance(height, int)
                or height < 1
            ):
                raise EvidenceArchiveError("학습 증거 이미지 산출물 descriptor가 유효하지 않습니다.")
            normalized.update({"height": height, "mediaType": mediaType, "width": width})
        artifacts.append(normalized)
    return sorted(artifacts, key=lambda item: (str(item["origin"]), str(item["path"]), str(item["kind"])))


def normalizeEvidencePackages(value: object) -> list[dict[str, object]]:
    if not isinstance(value, list) or len(value) > MAX_EVENT_PACKAGES:
        raise EvidenceArchiveError("학습 증거 package descriptor 목록이 유효하지 않습니다.")
    packages: list[dict[str, object]] = []
    seen: set[tuple[str, str, str]] = set()
    for item in value:
        if not isinstance(item, dict):
            raise EvidenceArchiveError("학습 증거 package descriptor 형식이 유효하지 않습니다.")
        integrity = item.get("integrity")
        name = item.get("name")
        url = item.get("url")
        version = item.get("version")
        if (
            item.get("schemaVersion") != 1
            or not isinstance(name, str)
            or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", name)
            or not isinstance(version, str)
            or not re.fullmatch(r"\d+(?:\.\d+){1,3}(?:[-+][A-Za-z0-9.-]+)?", version)
            or not isinstance(url, str)
            or not url.startswith("check-packages/")
            or not url.endswith(".whl")
            or not safeRelativePath(url)
            or not isinstance(integrity, str)
            or not SHA256_PATTERN.fullmatch(integrity)
        ):
            raise EvidenceArchiveError("학습 증거 package descriptor가 유효하지 않습니다.")
        key = (name, version, url)
        if key in seen:
            raise EvidenceArchiveError("학습 증거 package descriptor가 중복되었습니다.")
        seen.add(key)
        packages.append({
            "integrity": integrity,
            "name": name,
            "schemaVersion": 1,
            "url": url,
            "version": version,
        })
    return sorted(packages, key=lambda item: (str(item["name"]), str(item["version"]), str(item["url"])))


def archiveRuntimeTier(events: list[dict[str, Any]]) -> str:
    tiers = {str(event["runtimeTier"]) for event in events}
    if len(tiers) == 1:
        return tiers.pop()
    return "web" if not tiers else "mixed"


def stableJson(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def safeRelativePath(value: str) -> bool:
    normalized = value.replace("\\", "/")
    path = Path(normalized)
    return bool(normalized) and not path.is_absolute() and ".." not in path.parts and ":" not in normalized


def digestText(value: str) -> str:
    return digestBytes(value.encode("utf-8"))


def digestBytes(value: bytes) -> str:
    encoded = base64.urlsafe_b64encode(hashlib.sha256(value).digest()).decode("ascii").rstrip("=")
    return f"sha256-{encoded}"


def utcTimestamp() -> str:
    return datetime.now(tz=UTC).isoformat()
