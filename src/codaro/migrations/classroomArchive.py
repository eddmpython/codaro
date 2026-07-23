from __future__ import annotations

from contextlib import contextmanager
from datetime import UTC, datetime, timedelta
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import secrets
import stat
import subprocess
from typing import Any, Callable, Iterator
import uuid
import zipfile


ARCHIVE_SCHEMA_VERSION = 1
ARCHIVE_ENTRIES = ("manifest.json", "assignments.jsonl", "events.jsonl")
MIGRATION_LEDGER = Path("migrations") / "classroom.jsonl"
MIGRATION_LOCK = Path("migrations") / "classroom.lock"
EXPIRY_DAYS = 90
_DROP_KEYS = {
    "accesstoken",
    "apikey",
    "email",
    "joincode",
    "participanttoken",
    "providercredential",
    "providercredentials",
    "refreshtoken",
    "tutortoken",
}
_PSEUDONYM_KEYS = {"displayname", "participantid", "studenttag", "targetparticipantid"}
_EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
_WINDOWS_PATH_RE = re.compile(r"(?<![A-Za-z0-9_])[A-Za-z]:\\(?:[^\s\"'<>|]+\\)*[^\s\"'<>|]*")
_POSIX_PATH_RE = re.compile(r"(?<![A-Za-z0-9_])/(?:home|Users|var|tmp|private|opt)/[^\s\"'<>]+")
_SECRET_RE = re.compile(
    r"(?i)(?:bearer\s+[A-Za-z0-9._~+/=-]{12,}|sk-[A-Za-z0-9_-]{12,}|"
    r"(?:api[_-]?key|token|secret)\s*[:=]\s*[A-Za-z0-9._~+/=-]{8,})"
)


class ClassroomMigrationError(RuntimeError):
    pass


def _now() -> datetime:
    return datetime.now(UTC)


def _gitHead() -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=Path(__file__).resolve().parents[3],
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError):
        return "installed-release"
    return result.stdout.strip()


def _codaroHome(codaroHome: str | Path | None) -> Path:
    configured = codaroHome or os.environ.get("CODARO_HOME") or Path.home() / ".codaro"
    home = Path(configured).expanduser().resolve()
    if home.exists() and _isLinkOrReparse(home):
        raise ClassroomMigrationError("CODARO_HOME cannot be a symlink or reparse point")
    return home


def _classroomRoot(home: Path) -> Path:
    root = home / "classroom"
    if root.parent != home:
        raise ClassroomMigrationError("classroom root escaped CODARO_HOME")
    return root


def _isLinkOrReparse(path: Path) -> bool:
    if path.is_symlink():
        return True
    try:
        attributes = path.lstat().st_file_attributes
    except (AttributeError, OSError):
        return False
    return bool(attributes & stat.FILE_ATTRIBUTE_REPARSE_POINT)


def _validateSourcePath(path: Path, root: Path) -> None:
    if _isLinkOrReparse(path):
        raise ClassroomMigrationError(f"classroom source cannot be a link: {path.name}")
    try:
        path.resolve().relative_to(root.resolve())
    except ValueError as exc:
        raise ClassroomMigrationError("classroom source escaped its storage root") from exc
    if hasattr(os, "getuid") and path.stat().st_uid != os.getuid():
        raise ClassroomMigrationError(f"classroom source is not owned by the current user: {path.name}")


def _sourcePaths(root: Path) -> list[tuple[str, Path, str]]:
    if not root.exists():
        return []
    _validateSourcePath(root, root)
    paths: list[tuple[str, Path, str]] = []
    for folder, pattern, kind in (("assignments", "*.json", "assignment"), ("events", "*.jsonl", "event")):
        sourceRoot = root / folder
        if not sourceRoot.exists():
            continue
        _validateSourcePath(sourceRoot, root)
        for path in sorted(sourceRoot.glob(pattern)):
            _validateSourcePath(path, root)
            paths.append((path.relative_to(root).as_posix(), path, kind))
    return paths


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _aggregateHash(rows: list[dict[str, Any]]) -> str:
    digest = hashlib.sha256()
    for row in sorted(rows, key=lambda item: str(item["path"])):
        digest.update(str(row["path"]).encode("utf-8"))
        digest.update(b"\0")
        digest.update(str(row["sha256"]).encode("ascii"))
        digest.update(b"\n")
    return digest.hexdigest()


def _readRows(root: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    assignments: list[dict[str, Any]] = []
    events: list[dict[str, Any]] = []
    sourceFiles: list[dict[str, Any]] = []
    for relative, path, kind in _sourcePaths(root):
        validRows = 0
        invalidRows = 0
        if kind == "assignment":
            try:
                payload = json.loads(path.read_text(encoding="utf-8"))
                if not isinstance(payload, dict):
                    raise ValueError("assignment must be an object")
                assignments.append({"sourcePath": relative, "record": payload})
                validRows = 1
            except (OSError, UnicodeError, json.JSONDecodeError, ValueError):
                invalidRows = 1
        else:
            try:
                lines = path.read_text(encoding="utf-8").splitlines()
            except (OSError, UnicodeError):
                lines = [""]
            for lineNumber, line in enumerate(lines, start=1):
                if not line.strip():
                    continue
                try:
                    payload = json.loads(line)
                    if not isinstance(payload, dict):
                        raise ValueError("event must be an object")
                    events.append({"sourcePath": relative, "sourceLine": lineNumber, "record": payload})
                    validRows += 1
                except (json.JSONDecodeError, ValueError):
                    invalidRows += 1
        sourceFiles.append({
            "path": relative,
            "kind": kind,
            "sha256": _sha256(path),
            "validRowCount": validRows,
            "invalidRowCount": invalidRows,
        })
    return assignments, events, sourceFiles


def auditClassroomArchive(codaroHome: str | Path | None = None) -> dict[str, Any]:
    home = _codaroHome(codaroHome)
    root = _classroomRoot(home)
    assignments, events, sources = _readRows(root)
    return {
        "schemaVersion": ARCHIVE_SCHEMA_VERSION,
        "status": "data-found" if sources else "empty",
        "assignmentCount": len(assignments),
        "eventCount": len(events),
        "invalidRowCount": sum(int(row["invalidRowCount"]) for row in sources),
        "sourceFileCount": len(sources),
        "sourceAggregateHash": _aggregateHash(sources),
        "sourceFiles": sources,
    }


class _Redactor:
    def __init__(self, key: bytes) -> None:
        self.key = key
        self.count = 0

    def pseudonym(self, value: Any) -> str:
        self.count += 1
        digest = hmac.new(self.key, str(value).encode("utf-8"), hashlib.sha256).hexdigest()
        return f"p_{digest[:24]}"

    def value(self, value: Any, keyName: str = "") -> Any:
        normalizedKey = keyName.lower()
        if normalizedKey in _PSEUDONYM_KEYS and value not in (None, ""):
            return self.pseudonym(value)
        if isinstance(value, dict):
            result: dict[str, Any] = {}
            for key, child in value.items():
                normalized = str(key).lower()
                if normalized in _DROP_KEYS or "credential" in normalized:
                    self.count += 1
                    continue
                outputKey = self.pseudonym(key) if keyName == "participants" else str(key)
                result[outputKey] = self.value(child, str(key))
            return result
        if isinstance(value, list):
            return [self.value(child, keyName) for child in value]
        if isinstance(value, str):
            updated = value
            for pattern, marker in (
                (_EMAIL_RE, "[redacted-email]"),
                (_WINDOWS_PATH_RE, "[redacted-path]"),
                (_POSIX_PATH_RE, "[redacted-path]"),
                (_SECRET_RE, "[redacted-secret]"),
            ):
                updated, count = pattern.subn(marker, updated)
                self.count += count
            return updated
        return value


def _jsonLine(value: Any) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")


def _zipInfo(name: str, createdAt: datetime) -> zipfile.ZipInfo:
    stamp = createdAt.astimezone(UTC)
    year = max(1980, stamp.year)
    info = zipfile.ZipInfo(name, (year, stamp.month, stamp.day, stamp.hour, stamp.minute, stamp.second))
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o600 << 16
    return info


def _appendLedger(home: Path, row: dict[str, Any]) -> None:
    path = home / MIGRATION_LEDGER
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8", newline="\n") as ledger:
        ledger.write(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n")
        ledger.flush()
        os.fsync(ledger.fileno())


def exportClassroomArchive(
    outputPath: str | Path,
    codaroHome: str | Path | None = None,
    *,
    createdAt: datetime | None = None,
    pseudonymKey: bytes | None = None,
) -> dict[str, Any]:
    home = _codaroHome(codaroHome)
    root = _classroomRoot(home)
    assignments, events, sources = _readRows(root)
    created = (createdAt or _now()).astimezone(UTC).replace(microsecond=0)
    archiveId = str(uuid.uuid4())
    redactor = _Redactor(pseudonymKey or secrets.token_bytes(32))
    redactedAssignments = [redactor.value(row) for row in assignments]
    redactedEvents = [redactor.value(row) for row in events]
    manifest = {
        "schemaVersion": ARCHIVE_SCHEMA_VERSION,
        "archiveId": archiveId,
        "createdAt": created.isoformat(),
        "assignmentCount": len(redactedAssignments),
        "eventCount": len(redactedEvents),
        "invalidRowCount": sum(int(row["invalidRowCount"]) for row in sources),
        "redactionCount": redactor.count,
        "sourceFileCount": len(sources),
        "sourceAggregateHash": _aggregateHash(sources),
        "sourceFiles": sources,
        "gitHead": _gitHead(),
    }
    output = Path(outputPath).expanduser().resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    payloads = {
        "manifest.json": json.dumps(manifest, ensure_ascii=False, sort_keys=True, indent=2).encode("utf-8") + b"\n",
        "assignments.jsonl": b"".join(_jsonLine(row) for row in redactedAssignments),
        "events.jsonl": b"".join(_jsonLine(row) for row in redactedEvents),
    }
    temporary = output.with_name(f".{output.name}.{uuid.uuid4().hex}.tmp")
    try:
        with zipfile.ZipFile(temporary, "w") as archive:
            for name in ARCHIVE_ENTRIES:
                archive.writestr(_zipInfo(name, created), payloads[name])
        os.replace(temporary, output)
    finally:
        if temporary.exists():
            temporary.unlink()
    archiveHash = _sha256(output)
    sidecar = output.with_suffix(output.suffix + ".sha256")
    sidecar.write_text(f"{archiveHash}  {output.name}\n", encoding="ascii")
    _appendLedger(home, {
        "schemaVersion": 1,
        "operation": "archive-export",
        "transactionId": archiveId,
        "state": "completed",
        "archiveHash": archiveHash,
        "sourceAggregateHash": manifest["sourceAggregateHash"],
        "sourceFileCount": manifest["sourceFileCount"],
        "assignmentCount": manifest["assignmentCount"],
        "eventCount": manifest["eventCount"],
        "invalidRowCount": manifest["invalidRowCount"],
        "redactionCount": manifest["redactionCount"],
        "requestedAt": manifest["createdAt"],
        "completedAt": _now().isoformat(),
        "gitHead": _gitHead(),
    })
    return {"archivePath": str(output), "sidecarPath": str(sidecar), "archiveHash": archiveHash, "manifest": manifest}


def _readJsonLines(data: bytes, label: str) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for lineNumber, line in enumerate(data.decode("utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ClassroomMigrationError(f"invalid {label} JSONL at line {lineNumber}") from exc
        if not isinstance(row, dict):
            raise ClassroomMigrationError(f"invalid {label} row at line {lineNumber}")
        rows.append(row)
    return rows


def _containsForbiddenArchiveValue(value: Any, keyName: str = "") -> bool:
    normalized = keyName.lower()
    if normalized in _DROP_KEYS or "credential" in normalized:
        return True
    if normalized in _PSEUDONYM_KEYS and isinstance(value, str) and value and not value.startswith("p_"):
        return True
    if isinstance(value, dict):
        return any(_containsForbiddenArchiveValue(child, str(key)) for key, child in value.items())
    if isinstance(value, list):
        return any(_containsForbiddenArchiveValue(child, keyName) for child in value)
    if isinstance(value, str):
        return bool(_EMAIL_RE.search(value) or _WINDOWS_PATH_RE.search(value) or _POSIX_PATH_RE.search(value) or _SECRET_RE.search(value))
    return False


def verifyClassroomArchive(archivePath: str | Path) -> dict[str, Any]:
    path = Path(archivePath).expanduser().resolve()
    if not path.is_file() or _isLinkOrReparse(path):
        raise ClassroomMigrationError("classroom archive is missing or unsafe")
    archiveHash = _sha256(path)
    sidecar = path.with_suffix(path.suffix + ".sha256")
    if not sidecar.is_file():
        raise ClassroomMigrationError("detached classroom archive hash is missing")
    expectedHash = sidecar.read_text(encoding="ascii").split()[0]
    if not hmac.compare_digest(expectedHash, archiveHash):
        raise ClassroomMigrationError("detached classroom archive hash differs")
    try:
        with zipfile.ZipFile(path) as archive:
            names = archive.namelist()
            if tuple(names) != ARCHIVE_ENTRIES or len(names) != len(set(names)):
                raise ClassroomMigrationError("classroom archive entry contract differs")
            manifest = json.loads(archive.read("manifest.json"))
            assignments = _readJsonLines(archive.read("assignments.jsonl"), "assignment")
            events = _readJsonLines(archive.read("events.jsonl"), "event")
    except (OSError, UnicodeError, json.JSONDecodeError, zipfile.BadZipFile) as exc:
        raise ClassroomMigrationError("classroom archive cannot be read") from exc
    required = {
        "schemaVersion", "archiveId", "createdAt", "assignmentCount", "eventCount",
        "invalidRowCount", "redactionCount", "sourceFileCount", "sourceAggregateHash",
        "sourceFiles", "gitHead",
    }
    if not isinstance(manifest, dict) or required - set(manifest):
        raise ClassroomMigrationError("classroom archive manifest is incomplete")
    if manifest["schemaVersion"] != ARCHIVE_SCHEMA_VERSION:
        raise ClassroomMigrationError("classroom archive schema version differs")
    try:
        uuid.UUID(str(manifest["archiveId"]))
        datetime.fromisoformat(str(manifest["createdAt"]))
    except ValueError as exc:
        raise ClassroomMigrationError("classroom archive identity or timestamp is invalid") from exc
    sources = manifest["sourceFiles"]
    if not isinstance(sources, list) or manifest["sourceFileCount"] != len(sources):
        raise ClassroomMigrationError("classroom archive source count differs")
    for source in sources:
        if not isinstance(source, dict) or set(source) != {"path", "kind", "sha256", "validRowCount", "invalidRowCount"}:
            raise ClassroomMigrationError("classroom archive source row differs")
        relative = Path(str(source["path"]))
        if relative.is_absolute() or ".." in relative.parts or source["kind"] not in {"assignment", "event"}:
            raise ClassroomMigrationError("classroom archive source path is unsafe")
    if manifest["sourceAggregateHash"] != _aggregateHash(sources):
        raise ClassroomMigrationError("classroom archive source aggregate hash differs")
    if manifest["assignmentCount"] != len(assignments) or manifest["eventCount"] != len(events):
        raise ClassroomMigrationError("classroom archive record count differs")
    if any(_containsForbiddenArchiveValue(row) for row in [*assignments, *events]):
        raise ClassroomMigrationError("classroom archive contains an unredacted sensitive value")
    return {"status": "verified", "archiveHash": archiveHash, "manifest": manifest}


@contextmanager
def _exclusiveMigrationLock(home: Path) -> Iterator[None]:
    path = home / MIGRATION_LOCK
    path.parent.mkdir(parents=True, exist_ok=True)
    lockFile = path.open("a+b")
    if lockFile.tell() == 0:
        lockFile.write(b"0")
        lockFile.flush()
    lockFile.seek(0)
    try:
        if os.name == "nt":
            import ctypes
            from ctypes import wintypes
            import msvcrt

            class Overlapped(ctypes.Structure):
                _fields_ = [
                    ("Internal", ctypes.c_size_t),
                    ("InternalHigh", ctypes.c_size_t),
                    ("Offset", wintypes.DWORD),
                    ("OffsetHigh", wintypes.DWORD),
                    ("hEvent", wintypes.HANDLE),
                ]

            overlapped = Overlapped()
            handle = msvcrt.get_osfhandle(lockFile.fileno())
            locked = ctypes.windll.kernel32.LockFileEx(handle, 0x00000002 | 0x00000001, 0, 1, 0, ctypes.byref(overlapped))
            if not locked:
                raise ClassroomMigrationError("another classroom migration is running")
            try:
                yield
            finally:
                ctypes.windll.kernel32.UnlockFileEx(handle, 0, 1, 0, ctypes.byref(overlapped))
        else:
            import fcntl

            try:
                fcntl.flock(lockFile.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            except BlockingIOError as exc:
                raise ClassroomMigrationError("another classroom migration is running") from exc
            try:
                yield
            finally:
                fcntl.flock(lockFile.fileno(), fcntl.LOCK_UN)
    finally:
        lockFile.close()


def _fsyncDirectory(path: Path) -> None:
    try:
        descriptor = os.open(path, os.O_RDONLY)
    except OSError:
        return
    try:
        os.fsync(descriptor)
    except OSError:
        pass
    finally:
        os.close(descriptor)


def _validateActiveSources(root: Path, sources: list[dict[str, Any]]) -> None:
    actual = {relative: path for relative, path, _ in _sourcePaths(root)}
    expected = {str(row["path"]): str(row["sha256"]) for row in sources}
    allFiles = {
        path.relative_to(root).as_posix(): path
        for path in root.rglob("*")
        if path.is_file()
    } if root.exists() else {}
    if set(allFiles) != set(expected) or set(actual) != set(expected):
        raise ClassroomMigrationError("active classroom file set differs from the archive manifest")
    for relative, expectedHash in expected.items():
        if _sha256(actual[relative]) != expectedHash:
            raise ClassroomMigrationError(f"active classroom source changed: {relative}")


def _deleteQuarantine(quarantine: Path, sources: list[dict[str, Any]], fault: Callable[[str], None] | None) -> None:
    for index, source in enumerate(sources):
        path = quarantine / str(source["path"])
        if path.exists():
            _validateSourcePath(path, quarantine)
            if _sha256(path) != source["sha256"]:
                raise ClassroomMigrationError(f"quarantined classroom source changed: {source['path']}")
            path.unlink()
        if fault is not None and index == 0:
            fault("mid-delete")
    for path in sorted((item for item in quarantine.rglob("*") if item.is_dir()), key=lambda item: len(item.parts), reverse=True):
        path.rmdir()
    if quarantine.exists():
        quarantine.rmdir()
    _fsyncDirectory(quarantine.parent)


def _ledgerRows(home: Path) -> list[dict[str, Any]]:
    path = home / MIGRATION_LEDGER
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ClassroomMigrationError("classroom migration ledger is invalid") from exc
        if isinstance(value, dict):
            rows.append(value)
    return rows


def _completePrepared(home: Path, prepared: dict[str, Any], fault: Callable[[str], None] | None = None) -> dict[str, Any]:
    root = _classroomRoot(home)
    quarantine = home / str(prepared["quarantineName"])
    sources = prepared["sourceFiles"]
    if quarantine.exists():
        if _isLinkOrReparse(quarantine):
            raise ClassroomMigrationError("classroom quarantine is unsafe")
    elif root.exists():
        _validateActiveSources(root, sources)
        os.replace(root, quarantine)
        _fsyncDirectory(home)
        if fault is not None:
            fault("after-rename")
    elif sources:
        raise ClassroomMigrationError("prepared classroom purge has no active root or quarantine")
    if quarantine.exists():
        _deleteQuarantine(quarantine, sources, fault)
    completedAt = _now().isoformat()
    completed = {**prepared, "state": "completed", "completedAt": completedAt}
    completed.pop("sourceFiles", None)
    completed.pop("quarantineName", None)
    _appendLedger(home, completed)
    return completed


def resumeClassroomPurge(
    codaroHome: str | Path | None = None,
    *,
    _fault: Callable[[str], None] | None = None,
) -> dict[str, Any]:
    home = _codaroHome(codaroHome)
    rows = _ledgerRows(home)
    completedIds = {str(row.get("transactionId")) for row in rows if row.get("state") == "completed"}
    pending = [
        row for row in rows
        if row.get("operation") == "classroom-purge"
        and row.get("state") == "prepared"
        and str(row.get("transactionId")) not in completedIds
    ]
    if not pending:
        return {"status": "nothing-to-resume", "count": 0}
    with _exclusiveMigrationLock(home):
        completed = [_completePrepared(home, row, _fault) for row in pending]
    return {"status": "resumed", "count": len(completed), "transactions": completed}


def purgeClassroomArchive(
    archivePath: str | Path,
    confirmHash: str,
    reason: str,
    codaroHome: str | Path | None = None,
    *,
    now: datetime | None = None,
    _fault: Callable[[str], None] | None = None,
) -> dict[str, Any]:
    verified = verifyClassroomArchive(archivePath)
    manifest = verified["manifest"]
    archiveHash = verified["archiveHash"]
    current = (now or _now()).astimezone(UTC)
    created = datetime.fromisoformat(str(manifest["createdAt"])).astimezone(UTC)
    expired = current >= created + timedelta(days=EXPIRY_DAYS)
    if reason not in {"user", "expired"}:
        raise ClassroomMigrationError("purge reason must be user or expired")
    if reason == "user" and not hmac.compare_digest(confirmHash.strip().lower(), archiveHash):
        raise ClassroomMigrationError("purge confirmation hash differs from the verified archive")
    if reason == "expired" and not expired:
        raise ClassroomMigrationError("classroom archive has not reached the 90 day expiry")
    home = _codaroHome(codaroHome)
    transactionId = str(uuid.uuid4())
    requestedAt = current.isoformat()
    prepared = {
        "schemaVersion": 1,
        "operation": "classroom-purge",
        "transactionId": transactionId,
        "state": "prepared",
        "archiveHash": archiveHash,
        "sourceAggregateHash": manifest["sourceAggregateHash"],
        "sourceFileCount": manifest["sourceFileCount"],
        "assignmentCount": manifest["assignmentCount"],
        "eventCount": manifest["eventCount"],
        "invalidRowCount": manifest["invalidRowCount"],
        "redactionCount": manifest["redactionCount"],
        "reason": reason,
        "requestedAt": requestedAt,
        "completedAt": "",
        "gitHead": _gitHead(),
        "quarantineName": f".classroom-purge-{transactionId}",
        "sourceFiles": manifest["sourceFiles"],
    }
    with _exclusiveMigrationLock(home):
        root = _classroomRoot(home)
        if manifest["sourceFileCount"]:
            _validateActiveSources(root, manifest["sourceFiles"])
        elif root.exists() and any(root.rglob("*")):
            raise ClassroomMigrationError("active classroom data exists but the archive manifest is empty")
        _appendLedger(home, prepared)
        if _fault is not None:
            _fault("after-prepared")
        completed = _completePrepared(home, prepared, _fault)
    return {"status": "purged", "transaction": completed}
