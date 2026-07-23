from __future__ import annotations

from datetime import UTC, datetime, timedelta
import hashlib
import json
from pathlib import Path
import zipfile

from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

from codaro.api.classroomRetirementRouter import createClassroomRetirementRouter
from codaro.migrations.classroomArchive import (
    ClassroomMigrationError,
    _exclusiveMigrationLock,
    auditClassroomArchive,
    exportClassroomArchive,
    purgeClassroomArchive,
    resumeClassroomPurge,
    verifyClassroomArchive,
)


def _writeClassroom(home: Path, *, twoEventFiles: bool = False) -> None:
    assignmentRoot = home / "classroom" / "assignments"
    eventRoot = home / "classroom" / "events"
    assignmentRoot.mkdir(parents=True)
    eventRoot.mkdir(parents=True)
    assignment = {
        "assignmentId": "as-1",
        "title": "Private lesson",
        "joinCode": "ABCD-1234",
        "tutorToken": "tutor-super-secret",
        "material": {
            "title": "Exercise",
            "document": {"code": "open('C:\\\\Users\\\\Alice\\\\secret.txt')", "email": "learner@example.com"},
        },
        "participants": {
            "pt-1": {
                "participantId": "pt-1",
                "studentTag": "student-raw",
                "displayName": "Alice",
                "participantToken": "student-super-secret",
            }
        },
    }
    (assignmentRoot / "as-1.json").write_text(json.dumps(assignment), encoding="utf-8")
    event = {
        "eventId": "ev-1",
        "assignmentId": "as-1",
        "participantId": "pt-1",
        "eventType": "questionAsked",
        "payload": {"body": "email learner@example.com; api_key=abcdefghijk"},
    }
    (eventRoot / "as-1.jsonl").write_text(json.dumps(event) + "\n{invalid\n", encoding="utf-8")
    if twoEventFiles:
        second = {**event, "eventId": "ev-2"}
        (eventRoot / "as-2.jsonl").write_text(json.dumps(second) + "\n", encoding="utf-8")


def _export(home: Path, tmp_path: Path) -> dict:
    return exportClassroomArchive(
        tmp_path / "classroom.zip",
        home,
        createdAt=datetime(2026, 7, 22, 1, 2, 4, tzinfo=UTC),
        pseudonymKey=b"k" * 32,
    )


def testAuditCountsValidAndInvalidRows(tmp_path: Path) -> None:
    home = tmp_path / "home"
    _writeClassroom(home)

    audit = auditClassroomArchive(home)

    assert audit["assignmentCount"] == 1
    assert audit["eventCount"] == 1
    assert audit["invalidRowCount"] == 1
    assert audit["sourceFileCount"] == 2
    assert len(audit["sourceAggregateHash"]) == 64


def testExportRedactsSecretsAndPseudonymizesIdentity(tmp_path: Path) -> None:
    home = tmp_path / "home"
    _writeClassroom(home)

    exported = _export(home, tmp_path)
    verified = verifyClassroomArchive(exported["archivePath"])

    assert verified["status"] == "verified"
    assert verified["archiveHash"] == exported["archiveHash"]
    with zipfile.ZipFile(exported["archivePath"]) as archive:
        assert tuple(archive.namelist()) == ("manifest.json", "assignments.jsonl", "events.jsonl")
        payload = archive.read("assignments.jsonl").decode("utf-8") + archive.read("events.jsonl").decode("utf-8")
    for forbidden in ("ABCD-1234", "tutor-super-secret", "student-super-secret", "student-raw", "Alice", "learner@example.com", "abcdefghijk"):
        assert forbidden not in payload
    assert "p_" in payload
    assert "[redacted-path]" in payload
    assert "[redacted-email]" in payload
    assert "[redacted-secret]" in payload


def testVerifyRejectsDetachedHashMismatch(tmp_path: Path) -> None:
    home = tmp_path / "home"
    _writeClassroom(home)
    exported = _export(home, tmp_path)
    Path(exported["sidecarPath"]).write_text("0" * 64 + "  classroom.zip\n", encoding="ascii")

    with pytest.raises(ClassroomMigrationError, match="detached"):
        verifyClassroomArchive(exported["archivePath"])


def testUserPurgeRequiresExactHashAndDeletesOnlyManifestFiles(tmp_path: Path) -> None:
    home = tmp_path / "home"
    _writeClassroom(home)
    exported = _export(home, tmp_path)

    with pytest.raises(ClassroomMigrationError, match="confirmation hash"):
        purgeClassroomArchive(exported["archivePath"], "bad", "user", home)

    result = purgeClassroomArchive(
        exported["archivePath"],
        exported["archiveHash"],
        "user",
        home,
    )
    assert result["status"] == "purged"
    assert not (home / "classroom").exists()
    ledger = (home / "migrations" / "classroom.jsonl").read_text(encoding="utf-8")
    assert '"state":"prepared"' in ledger
    assert '"state":"completed"' in ledger


def testPurgeRejectsChangedSource(tmp_path: Path) -> None:
    home = tmp_path / "home"
    _writeClassroom(home)
    exported = _export(home, tmp_path)
    source = home / "classroom" / "assignments" / "as-1.json"
    source.write_text(source.read_text(encoding="utf-8") + "\n", encoding="utf-8")

    with pytest.raises(ClassroomMigrationError, match="changed"):
        purgeClassroomArchive(exported["archivePath"], exported["archiveHash"], "user", home)


def testExpiredPurgeRequiresNinetyDays(tmp_path: Path) -> None:
    home = tmp_path / "home"
    _writeClassroom(home)
    exported = _export(home, tmp_path)
    created = datetime.fromisoformat(exported["manifest"]["createdAt"])

    with pytest.raises(ClassroomMigrationError, match="90 day"):
        purgeClassroomArchive(
            exported["archivePath"],
            "",
            "expired",
            home,
            now=created + timedelta(days=89),
        )


@pytest.mark.parametrize("faultStage", ["after-prepared", "after-rename", "mid-delete"])
def testPurgeResumesEveryCrashBoundary(tmp_path: Path, faultStage: str) -> None:
    home = tmp_path / "home"
    _writeClassroom(home, twoEventFiles=True)
    exported = _export(home, tmp_path)

    def fault(stage: str) -> None:
        if stage == faultStage:
            raise RuntimeError(stage)

    with pytest.raises(RuntimeError, match=faultStage):
        purgeClassroomArchive(
            exported["archivePath"],
            exported["archiveHash"],
            "user",
            home,
            _fault=fault,
        )

    resumed = resumeClassroomPurge(home)
    assert resumed["status"] == "resumed"
    assert resumed["count"] == 1
    assert not (home / "classroom").exists()
    assert not list(home.glob(".classroom-purge-*"))


def testMigrationLockRejectsSecondOwner(tmp_path: Path) -> None:
    home = tmp_path / "home"
    with _exclusiveMigrationLock(home):
        with pytest.raises(ClassroomMigrationError, match="another classroom migration"):
            with _exclusiveMigrationLock(home):
                pass


def testRetiredHttpSurfaceReturnsGoneWithoutArchiveData() -> None:
    app = FastAPI()
    app.include_router(createClassroomRetirementRouter())
    client = TestClient(app)

    for method, path in (("get", "/api/classroom/status"), ("post", "/api/classroom/events")):
        response = client.post(path, json={}) if method == "post" else client.get(path)
        assert response.status_code == 410
        payload = response.json()["error"]
        assert payload["code"] == "classroom_retired"
        assert "codaro classroom export" in " ".join(payload["localCommands"])
        assert "archivePath" not in response.text


def testArchiveHashMatchesActualBytes(tmp_path: Path) -> None:
    home = tmp_path / "home"
    _writeClassroom(home)
    exported = _export(home, tmp_path)
    actual = hashlib.sha256(Path(exported["archivePath"]).read_bytes()).hexdigest()
    assert exported["archiveHash"] == actual
