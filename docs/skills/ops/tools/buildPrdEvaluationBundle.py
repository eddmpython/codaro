from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import stat
import subprocess
import sys
import tempfile
from typing import Any, Iterable
import zipfile

import yaml


ROOT = Path(__file__).resolve().parents[4]
INITIATIVE = "mainPlan/astryx-product-experience"
LOOP = f"{INITIATIVE}/00-product-contract/01-prd-improvement-loop"
ROUND_ROOT = ROOT / LOOP / "08-r10-independent-review"
INPUT_PATH = ROUND_ROOT / "r10-input-manifest.yml"
ROSTER_PATH = ROUND_ROOT / "evaluator-roster.yml"
MANIFEST_PATH = ROUND_ROOT / "evaluation-bundle.manifest.yml"
RUBRIC_SOURCE = ROOT / "contracts/prdEvaluationRubric.yml"
SCHEMA_SOURCE = ROOT / "contracts/prdEvaluationReport.schema.yml"
LEDGER_SCHEMA_SOURCE = ROOT / "contracts/prdEvaluationFindingLedger.schema.yml"
ARCHIVE_PATH = ROOT / "output/test-runner/prd-evaluation-bundle/astryx-r10-evaluation.zip"

ROOT_FILES = {
    ".python-version",
    "README.md",
    "pyproject.toml",
    "uv.lock",
}
SOURCE_PREFIXES = (
    ".github/workflows/",
    "assets/",
    "contracts/",
    "curricula/",
    "docs/",
    "editor/",
    "landing/",
    "launcher/",
    "src/",
    "tests/",
)
PRODUCT_PLAN_PREFIXES = tuple(
    f"{INITIATIVE}/{index:02d}-"
    for index in range(1, 11)
)
PRODUCT_PLAN_ROOT = f"{INITIATIVE}/README.md"
FORBIDDEN_PREFIXES = (
    f"{INITIATIVE}/00-product-contract/01-prd-improvement-loop/",
)
FORBIDDEN_SEGMENTS = {
    ".cache",
    ".git",
    ".pytest_cache",
    ".ruff_cache",
    ".tmp",
    ".venv",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "output",
}
CONTRACT_BUNDLE_PATHS = {
    "evaluation-contract/rubric.yml": RUBRIC_SOURCE,
    "evaluation-contract/evaluation-report.schema.yml": SCHEMA_SOURCE,
    "evaluation-contract/finding-ledger.schema.yml": LEDGER_SCHEMA_SOURCE,
}
BRIEFING_PATH = "evaluation-contract/evaluator-briefing.yml"
EVIDENCE_INDEX_PATH = "evaluation-evidence/manifest.yml"
EVIDENCE_SOURCE_PREFIX = "output/test-runner/"
EVIDENCE_BUNDLE_PREFIX = "evaluation-evidence/"
EVIDENCE_ARTIFACT_SUFFIXES = {
    ".avif",
    ".json",
    ".png",
    ".txt",
    ".webp",
    ".yaml",
    ".yml",
}
MACHINE_EVIDENCE_REPORTS = (
    (
        "product-experience-browser",
        "output/test-runner/product-experience-browser/product-experience-report.json",
        "gate",
        "product-experience-browser",
    ),
    (
        "local-studio-browser",
        "output/test-runner/local-studio-browser/local-studio-report.json",
        "gate",
        "local-studio-browser",
    ),
    (
        "curriculum-top-tier-audit",
        "output/test-runner/curriculum-top-tier-audit/curriculum-top-tier-report.json",
        "gate",
        "curriculum-top-tier-audit",
    ),
    (
        "learning-vertical-slice",
        "output/test-runner/learning-vertical-slice/learning-vertical-slice-report.json",
        "audit",
        "learning-vertical-slice",
    ),
    (
        "evidence-migration",
        "output/test-runner/evidence-migration/evidence-migration-report.json",
        "audit",
        "evidence-migration",
    ),
    (
        "astryx-journey",
        "output/test-runner/astryx-journey/astryx-journey-report.json",
        "audit",
        "astryx-journey",
    ),
    (
        "manual-at-matrix",
        "output/test-runner/astryx-journey/manual-at-report.json",
        "audit",
        "manual-at-matrix",
    ),
    (
        "release-research-operations",
        "output/test-runner/release-research-operations/release-research-operations-report.json",
        "audit",
        "release-research-operations",
    ),
    (
        "product-browser-webview2-evergreen",
        "output/test-runner/product-browser-webview2-evergreen/webview2-product-smoke-report.json",
        "gate",
        "product-browser-webview2-evergreen",
    ),
)
EVIDENCE_ALLOWED_SOURCE_PREFIXES = tuple(
    sorted({sourcePath.rsplit("/", 1)[0] + "/" for _, sourcePath, _, _ in MACHINE_EVIDENCE_REPORTS})
)
ZIP_TIMESTAMP = (1980, 1, 1, 0, 0, 0)
ZIP_COMPRESSION = zipfile.ZIP_STORED
ZIP_COMPRESSION_NAME = "stored"
ZIP_CREATE_SYSTEM = 3
ZIP_FORMAT_VERSION = 20


class BundleError(ValueError):
    pass


@dataclass(frozen=True)
class BundleEntry:
    path: str
    data: bytes
    sourcePath: str | None
    kind: str

    def manifestRow(self) -> dict[str, Any]:
        row: dict[str, Any] = {
            "path": self.path,
            "sha256": sha256Bytes(self.data),
            "bytes": len(self.data),
            "kind": self.kind,
        }
        if self.sourcePath is not None:
            row["sourcePath"] = self.sourcePath
        return row


@dataclass(frozen=True)
class GitIndexEntry:
    objectId: str
    mode: str


def runGit(*args: str) -> bytes:
    try:
        result = subprocess.run(
            ("git", *args),
            cwd=ROOT,
            check=True,
            capture_output=True,
            timeout=30,
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        raise BundleError(f"git command failed: git {' '.join(args)}") from exc
    return result.stdout


def decodeGitPaths(payload: bytes) -> list[str]:
    return [part.decode("utf-8", errors="surrogateescape") for part in payload.split(b"\0") if part]


def gitIndexEntries() -> dict[str, GitIndexEntry]:
    entries: dict[str, GitIndexEntry] = {}
    for row in runGit("ls-files", "--stage", "-z").split(b"\0"):
        if not row:
            continue
        try:
            metadata, encodedPath = row.split(b"\t", 1)
            mode, objectId, stage = metadata.decode("ascii", errors="strict").split(" ")
            path = encodedPath.decode("utf-8", errors="surrogateescape")
        except (UnicodeDecodeError, ValueError) as exc:
            raise BundleError("git index row is malformed") from exc
        if stage != "0":
            raise BundleError(f"git index contains an unresolved path: {path}")
        entries[PurePosixPath(path).as_posix()] = GitIndexEntry(objectId=objectId, mode=mode)
    return entries


def readGitBlobs(objectIds: Iterable[str]) -> dict[str, bytes]:
    requested = sorted(set(objectIds))
    if not requested:
        return {}
    try:
        result = subprocess.run(
            ("git", "cat-file", "--batch"),
            cwd=ROOT,
            input=("".join(f"{objectId}\n" for objectId in requested)).encode("ascii"),
            check=True,
            capture_output=True,
            timeout=60,
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        raise BundleError("git command failed: git cat-file --batch") from exc
    stream = io.BytesIO(result.stdout)
    blobs: dict[str, bytes] = {}
    for requestedId in requested:
        header = stream.readline().rstrip(b"\n")
        parts = header.split(b" ")
        if len(parts) != 3 or parts[1] != b"blob":
            raise BundleError(f"git index object is not a blob: {requestedId}")
        try:
            size = int(parts[2])
        except ValueError as exc:
            raise BundleError(f"git blob size is invalid: {requestedId}") from exc
        payload = stream.read(size)
        if len(payload) != size or stream.read(1) != b"\n":
            raise BundleError(f"git blob payload is truncated: {requestedId}")
        blobs[requestedId] = payload
    if stream.read(1):
        raise BundleError("git cat-file returned unexpected trailing data")
    return blobs


def sha256Bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def isSha256(value: Any) -> bool:
    return (
        isinstance(value, str)
        and len(value) == 64
        and all(character in "0123456789abcdef" for character in value)
    )


def canonicalJson(payload: Any) -> bytes:
    return json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def relativePath(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def loadMapping(path: Path) -> dict[str, Any]:
    try:
        payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        raise BundleError(f"cannot read {relativePath(path)}: {exc}") from exc
    if not isinstance(payload, dict):
        raise BundleError(f"document root must be a mapping: {relativePath(path)}")
    return payload


def isPathIncluded(path: str) -> bool:
    normalized = PurePosixPath(path).as_posix()
    if normalized.startswith("./"):
        normalized = normalized[2:]
    parts = PurePosixPath(normalized).parts
    if not normalized or any(part in FORBIDDEN_SEGMENTS for part in parts):
        return False
    if normalized == PRODUCT_PLAN_ROOT:
        return True
    if any(normalized.startswith(prefix) for prefix in PRODUCT_PLAN_PREFIXES):
        return True
    if normalized in ROOT_FILES:
        return True
    return any(normalized.startswith(prefix) for prefix in SOURCE_PREFIXES)


def verifyExcludedPriorReports(paths: Iterable[str]) -> None:
    failures: list[str] = []
    for path in paths:
        normalized = PurePosixPath(path).as_posix()
        if normalized.startswith("./"):
            normalized = normalized[2:]
        parts = PurePosixPath(normalized).parts
        if any(normalized.startswith(prefix) for prefix in FORBIDDEN_PREFIXES):
            failures.append(normalized)
        if any(part in FORBIDDEN_SEGMENTS for part in parts):
            failures.append(normalized)
    if failures:
        raise BundleError("bundle contains excluded history or generated paths: " + ", ".join(sorted(set(failures))))


def repositoryPaths() -> list[str]:
    return sorted(set(decodeGitPaths(runGit("ls-files", "-z", "--cached", "--others", "--exclude-standard"))))


def repositorySourceBytes(
    paths: Iterable[str],
    statuses: Iterable[tuple[str, str]],
) -> dict[str, bytes]:
    normalizedPaths = sorted({PurePosixPath(path).as_posix() for path in paths})
    dirtyPaths = {PurePosixPath(path).as_posix() for _, path in statuses}
    indexEntries = gitIndexEntries()
    cleanObjectIds = {
        indexEntries[path].objectId
        for path in normalizedPaths
        if path not in dirtyPaths and path in indexEntries
    }
    blobs = readGitBlobs(cleanObjectIds)
    payloads: dict[str, bytes] = {}
    for path in normalizedPaths:
        source = ROOT / Path(path)
        indexEntry = indexEntries.get(path)
        if path not in dirtyPaths and indexEntry is not None:
            if indexEntry.mode == "120000":
                raise BundleError(f"bundle source must not be a symbolic link: {path}")
            if indexEntry.mode not in {"100644", "100755"}:
                raise BundleError(f"bundle source must be a regular Git blob: {path}")
            payloads[path] = blobs[indexEntry.objectId]
            continue
        if source.is_symlink():
            raise BundleError(f"bundle source must not be a symbolic link: {path}")
        if not source.is_file():
            continue
        try:
            source.resolve().relative_to(ROOT.resolve())
        except ValueError as exc:
            raise BundleError(f"bundle source escapes repository root: {path}") from exc
        payloads[path] = source.read_bytes()
    return payloads


def collectRepositoryEntries(paths: Iterable[str], sourceBytes: dict[str, bytes]) -> list[BundleEntry]:
    entries: list[BundleEntry] = []
    for path in sorted(set(paths)):
        normalized = PurePosixPath(path).as_posix()
        if not isPathIncluded(normalized):
            continue
        payload = sourceBytes.get(normalized)
        if payload is None:
            continue
        entries.append(BundleEntry(normalized, payload, normalized, "repository"))
    return entries


def nestedTextValues(value: Any) -> Iterable[str]:
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for child in value.values():
            yield from nestedTextValues(child)
    elif isinstance(value, list):
        for child in value:
            yield from nestedTextValues(child)


def normalizedEvidencePath(value: str) -> str | None:
    normalized = PurePosixPath(value).as_posix()
    parts = PurePosixPath(normalized).parts
    if (
        not normalized.startswith(EVIDENCE_SOURCE_PREFIX)
        or not any(normalized.startswith(prefix) for prefix in EVIDENCE_ALLOWED_SOURCE_PREFIXES)
        or normalized.startswith("/")
        or ".." in parts
        or PurePosixPath(normalized).suffix.lower() not in EVIDENCE_ARTIFACT_SUFFIXES
    ):
        return None
    return normalized


def evidenceBundlePath(sourcePath: str) -> str:
    if not sourcePath.startswith(EVIDENCE_SOURCE_PREFIX):
        raise BundleError(f"machine evidence path is outside the allowlist: {sourcePath}")
    return EVIDENCE_BUNDLE_PREFIX + sourcePath[len(EVIDENCE_SOURCE_PREFIX):]


def readEvidenceFile(sourcePath: str) -> bytes:
    source = ROOT / Path(sourcePath)
    if source.is_symlink():
        raise BundleError(f"machine evidence must not be a symbolic link: {sourcePath}")
    if not source.is_file():
        raise BundleError(f"referenced machine evidence is absent: {sourcePath}")
    try:
        source.resolve().relative_to(ROOT.resolve())
    except ValueError as exc:
        raise BundleError(f"machine evidence escapes repository root: {sourcePath}") from exc
    return source.read_bytes()


def reportScopeMatches(
    reportHead: Any,
    *,
    currentHistory: set[str],
    scopeCommit: str,
) -> bool:
    if not isinstance(reportHead, str) or reportHead not in currentHistory:
        return False
    try:
        return latestIncludedScopeCommit(reportHead) == scopeCommit
    except BundleError:
        return False


def collectReferencedEvidence(
    rootPath: str,
    *,
    currentHistory: set[str],
    scopeCommit: str,
) -> dict[str, bytes]:
    pending = [rootPath]
    payloads: dict[str, bytes] = {}
    while pending:
        sourcePath = pending.pop()
        if sourcePath in payloads:
            continue
        data = readEvidenceFile(sourcePath)
        payloads[sourcePath] = data
        if PurePosixPath(sourcePath).suffix.lower() != ".json":
            continue
        try:
            payload = json.loads(data.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise BundleError(f"machine evidence JSON is invalid: {sourcePath}") from exc
        if not isinstance(payload, dict):
            raise BundleError(f"machine evidence JSON root must be an object: {sourcePath}")
        reportHead = payload.get("gitHead")
        if reportHead is not None and not reportScopeMatches(
            reportHead,
            currentHistory=currentHistory,
            scopeCommit=scopeCommit,
        ):
            raise BundleError(f"referenced machine evidence is stale: {sourcePath}")
        for value in nestedTextValues(payload):
            referencedPath = normalizedEvidencePath(value)
            if referencedPath is not None and referencedPath not in payloads:
                pending.append(referencedPath)
    return payloads


def collectMachineEvidence(
    *,
    currentHead: str,
    scopeCommit: str,
    scopeDirty: bool,
) -> tuple[tuple[BundleEntry, ...], dict[str, Any]]:
    currentHistory = set(
        runGit("rev-list", "--first-parent", currentHead)
        .decode("ascii", errors="strict")
        .splitlines()
    )
    entriesByPath: dict[str, BundleEntry] = {}
    reportRows: list[dict[str, Any]] = []
    blockers: list[str] = []
    for reportId, sourcePath, identityField, expectedIdentity in MACHINE_EVIDENCE_REPORTS:
        reportRow: dict[str, Any] = {
            "reportId": reportId,
            "sourcePath": sourcePath,
            "bundlePath": evidenceBundlePath(sourcePath),
            "status": "missing",
        }
        source = ROOT / Path(sourcePath)
        if not source.is_file():
            blockers.append(f"current machine evidence report is missing: {reportId}")
            reportRows.append(reportRow)
            continue
        try:
            rawBytes = readEvidenceFile(sourcePath)
            payload = json.loads(rawBytes.decode("utf-8"))
            if not isinstance(payload, dict):
                raise BundleError(f"machine evidence JSON root must be an object: {sourcePath}")
            if payload.get(identityField) != expectedIdentity:
                raise BundleError(f"machine evidence identity is invalid: {sourcePath}")
            reportedPath = payload.get("reportPath")
            if (
                not isinstance(reportedPath, str)
                or PurePosixPath(reportedPath.replace("\\", "/")).as_posix() != sourcePath
            ):
                raise BundleError(f"machine evidence reportPath is invalid: {sourcePath}")
            if not isinstance(payload.get("passed"), bool):
                raise BundleError(f"machine evidence passed state is invalid: {sourcePath}")
            reportHead = payload.get("gitHead")
            reportRow["reportedGitHead"] = reportHead
            reportRow["sha256"] = sha256Bytes(rawBytes)
            reportRow["bytes"] = len(rawBytes)
            if not reportScopeMatches(
                reportHead,
                currentHistory=currentHistory,
                scopeCommit=scopeCommit,
            ):
                reportRow["status"] = "stale"
                blockers.append(f"current machine evidence report is stale: {reportId}")
                reportRows.append(reportRow)
                continue
            referenced = collectReferencedEvidence(
                sourcePath,
                currentHistory=currentHistory,
                scopeCommit=scopeCommit,
            )
        except (BundleError, UnicodeDecodeError, json.JSONDecodeError) as exc:
            reportRow["status"] = "invalid"
            reportRow["reason"] = str(exc)
            blockers.append(f"current machine evidence report is invalid: {reportId}")
            reportRows.append(reportRow)
            continue
        reportRow["status"] = "current"
        reportRow["artifactCount"] = len(referenced)
        reportRows.append(reportRow)
        for referencedPath, data in referenced.items():
            bundlePath = evidenceBundlePath(referencedPath)
            entry = BundleEntry(
                bundlePath,
                data,
                referencedPath,
                "raw-machine-report" if referencedPath == sourcePath else "raw-machine-artifact",
            )
            existing = entriesByPath.get(bundlePath)
            if existing is not None and existing.data != entry.data:
                raise BundleError(f"machine evidence bundle path collision: {bundlePath}")
            entriesByPath[bundlePath] = entry
    if scopeDirty:
        blockers.append("current evaluation scope has uncommitted changes not covered by machine reports")
    includedReports = [row for row in reportRows if row["status"] == "current"]
    evidenceFiles = [
        entry.manifestRow()
        for entry in sorted(entriesByPath.values(), key=lambda item: item.path)
    ]
    index = {
        "schemaVersion": 1,
        "scopeGitCommit": scopeCommit,
        "scopeClean": not scopeDirty,
        "requiredReportCount": len(MACHINE_EVIDENCE_REPORTS),
        "includedReportCount": len(includedReports),
        "artifactCount": len(evidenceFiles),
        "allCurrent": not blockers and len(includedReports) == len(MACHINE_EVIDENCE_REPORTS),
        "blockingReasons": sorted(set(blockers)),
        "reports": reportRows,
        "files": evidenceFiles,
    }
    indexBytes = yaml.safe_dump(index, allow_unicode=True, sort_keys=False, width=120).encode("utf-8")
    entriesByPath[EVIDENCE_INDEX_PATH] = BundleEntry(
        EVIDENCE_INDEX_PATH,
        indexBytes,
        None,
        "machine-evidence-index",
    )
    return tuple(sorted(entriesByPath.values(), key=lambda item: item.path)), index


def evaluatorBriefing() -> bytes:
    payload = {
        "schemaVersion": 1,
        "roundId": "R10",
        "task": "Independently assess the current product plan and evidence against the frozen rubric.",
        "disciplines": ["learning", "ux", "architecture"],
        "constraints": [
            "Use only files contained in this bundle.",
            "Treat evaluation-evidence/manifest.yml as the index of current raw machine reports and artifacts.",
            "Record current evidence and counter-evidence for every dimension.",
            "Do not infer implementation completion from a plan or a passing wiring audit.",
            "Preserve raw scores and report new P0, P1, or P2 findings without normalization.",
            "Do not read another evaluator's draft before all three reports are sealed.",
        ],
        "promptAudit": {
            "targetScorePresent": False,
            "priorScorePresent": False,
            "desiredConclusionPresent": False,
        },
    }
    return yaml.safe_dump(payload, allow_unicode=True, sort_keys=False).encode("utf-8")


def collectBundleEntries(
    paths: Iterable[str],
    sourceBytes: dict[str, bytes],
    machineEvidenceEntries: Iterable[BundleEntry] = (),
) -> tuple[BundleEntry, ...]:
    entries = collectRepositoryEntries(paths, sourceBytes)
    for bundlePath, source in CONTRACT_BUNDLE_PATHS.items():
        sourcePath = relativePath(source)
        entries.append(BundleEntry(bundlePath, sourceBytes[sourcePath], sourcePath, "frozen-contract"))
    entries.append(BundleEntry(BRIEFING_PATH, evaluatorBriefing(), None, "generated-briefing"))
    entries.extend(machineEvidenceEntries)
    entries.sort(key=lambda entry: entry.path)
    paths = [entry.path for entry in entries]
    if len(paths) != len(set(paths)):
        raise BundleError("bundle entry paths must be unique")
    verifyExcludedPriorReports(paths)
    return tuple(entries)


def currentGitHead() -> str:
    value = runGit("rev-parse", "HEAD").decode("ascii", errors="strict").strip()
    if len(value) not in {40, 64}:
        raise BundleError("current git HEAD is invalid")
    return value


def latestIncludedScopeCommit(gitHead: str) -> str:
    history = runGit("rev-list", "--first-parent", gitHead).decode("ascii", errors="strict").splitlines()
    for commit in history:
        if len(commit) not in {40, 64}:
            raise BundleError("git history contains an invalid commit ID")
        changedPaths = decodeGitPaths(
            runGit(
                "diff-tree",
                "--root",
                "--no-commit-id",
                "--name-only",
                "--no-renames",
                "-r",
                "-z",
                "-m",
                "--first-parent",
                commit,
            )
        )
        if any(isPathIncluded(path) for path in changedPaths):
            return commit
    raise BundleError("git history does not contain an evaluation scope commit")


def changedRepositoryStatuses() -> list[tuple[str, str]]:
    rows: list[tuple[str, str]] = []
    changed = decodeGitPaths(runGit("diff", "--name-status", "--no-renames", "-z", "HEAD"))
    if len(changed) % 2:
        raise BundleError("git diff name-status output is malformed")
    for index in range(0, len(changed), 2):
        statusCode, path = changed[index], PurePosixPath(changed[index + 1]).as_posix()
        rows.append((statusCode, path))
    untracked = decodeGitPaths(runGit("ls-files", "-z", "--others", "--exclude-standard"))
    trackedPaths = {path for _, path in rows}
    for path in untracked:
        normalized = PurePosixPath(path).as_posix()
        if normalized in trackedPaths:
            continue
        source = ROOT / Path(normalized)
        if source.is_file():
            rows.append(("??", normalized))
    return sorted(rows, key=lambda row: (row[1], row[0]))


def isBundleSourcePath(path: str) -> bool:
    normalized = PurePosixPath(path).as_posix()
    contractSources = {relativePath(source) for source in CONTRACT_BUNDLE_PATHS.values()}
    return isPathIncluded(normalized) or normalized in contractSources


def changedScopeStatuses(
    statuses: Iterable[tuple[str, str]] | None = None,
) -> list[tuple[str, str]]:
    sourceStatuses = changedRepositoryStatuses() if statuses is None else statuses
    return [
        (statusCode, PurePosixPath(path).as_posix())
        for statusCode, path in sourceStatuses
        if isBundleSourcePath(path)
    ]


def dirtyDiffHash(entries: Iterable[BundleEntry], statuses: Iterable[tuple[str, str]]) -> str:
    contentHashes: dict[str, str] = {}
    for entry in entries:
        contentHash = sha256Bytes(entry.data)
        contentHashes[entry.path] = contentHash
        if entry.sourcePath is not None:
            contentHashes[entry.sourcePath] = contentHash
    rows = [
        {"path": path, "status": statusCode, "sha256": contentHashes.get(path)}
        for statusCode, path in statuses
    ]
    return sha256Bytes(canonicalJson(rows))


def buildZipBytes(entries: Iterable[BundleEntry]) -> bytes:
    output = io.BytesIO()
    with zipfile.ZipFile(output, mode="w", compression=ZIP_COMPRESSION, allowZip64=False) as archive:
        for entry in sorted(entries, key=lambda item: item.path):
            info = zipfile.ZipInfo(entry.path, date_time=ZIP_TIMESTAMP)
            info.compress_type = ZIP_COMPRESSION
            info.create_system = ZIP_CREATE_SYSTEM
            info.create_version = ZIP_FORMAT_VERSION
            info.extract_version = ZIP_FORMAT_VERSION
            info.extra = b""
            info.comment = b""
            info.internal_attr = 0
            info.external_attr = (stat.S_IFREG | 0o444) << 16
            archive.writestr(info, entry.data)
    return output.getvalue()


def verifyEvaluatorRoster(roster: dict[str, Any]) -> list[str]:
    blockers: list[str] = []
    if roster.get("roundState") != "ready" or roster.get("roundEligible") is not True:
        blockers.append("evaluator roster is not ready and eligible")
    slots = roster.get("slots")
    evaluatorIds: list[str] = []
    for discipline in ("learning", "ux", "architecture"):
        slot = slots.get(discipline) if isinstance(slots, dict) else None
        if not isinstance(slot, dict) or not isinstance(slot.get("evaluatorId"), str) or not slot["evaluatorId"]:
            blockers.append(f"{discipline} evaluator is unassigned")
            continue
        evaluatorIds.append(slot["evaluatorId"])
        if slot.get("eligible") is not True:
            blockers.append(f"{discipline} evaluator is not eligible")
        if slot.get("remediationParticipation") is not False or slot.get("priorRoundParticipation") is not False:
            blockers.append(f"{discipline} evaluator independence is not proven")
        if slot.get("conflictOfInterest") is not False:
            blockers.append(f"{discipline} evaluator conflict status is not clean")
        expertiseEvidence = slot.get("expertiseEvidence")
        if not isinstance(expertiseEvidence, str) or not expertiseEvidence.strip():
            blockers.append(f"{discipline} evaluator expertise evidence is absent")
        availability = slot.get("availability")
        if not isinstance(availability, dict) or set(availability) != {"startsAt", "endsAt"}:
            blockers.append(f"{discipline} evaluator availability is invalid")
        else:
            startsAt = parseTimestamp(availability.get("startsAt"))
            endsAt = parseTimestamp(availability.get("endsAt"))
            if startsAt is None or endsAt is None or startsAt >= endsAt:
                blockers.append(f"{discipline} evaluator availability is invalid")
        signedAt = parseTimestamp(slot.get("signedAt"))
        if signedAt is None:
            blockers.append(f"{discipline} evaluator signature is absent")
        elif isinstance(availability, dict):
            endsAt = parseTimestamp(availability.get("endsAt"))
            if endsAt is not None and signedAt > endsAt:
                blockers.append(f"{discipline} evaluator signature is outside availability")
        if not isSha256(slot.get("signatureHash")):
            blockers.append(f"{discipline} evaluator signature hash is absent")
    if len(evaluatorIds) != len(set(evaluatorIds)):
        blockers.append("evaluator IDs must be unique")
    return blockers


def parseTimestamp(value: Any) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        return None
    return parsed


def remediationSealBlockers(inputManifest: dict[str, Any]) -> list[str]:
    blockers: list[str] = []
    remediations = inputManifest.get("remediations")
    if not isinstance(remediations, list) or not remediations:
        return ["R10 remediation list is absent"]
    for item in remediations:
        if not isinstance(item, dict):
            blockers.append("unknown remediation row is malformed")
            continue
        packet = str(item.get("packet") or "unknown-packet")
        if item.get("eligibleForR10") is not True:
            blockers.append(f"{packet} is not eligible for R10")
        if not item.get("closureEvidence"):
            blockers.append(f"{packet} closure evidence is absent")
        if item.get("factAuditCommandState") != "implemented":
            blockers.append(f"{packet} fact audit command is not implemented")
        fixture = item.get("negativeFixture")
        if item.get("negativeFixtureState") != "present":
            blockers.append(f"{packet} negative fixture is not present")
        elif not isinstance(fixture, str) or not (ROOT / fixture).is_file():
            blockers.append(f"{packet} negative fixture path is absent")
    return blockers


def roundReadiness(
    inputManifest: dict[str, Any],
    roster: dict[str, Any],
    rubricBytes: bytes,
    machineEvidenceBlockers: Iterable[str] = (),
) -> dict[str, Any]:
    sealBlockers = (
        remediationSealBlockers(inputManifest)
        + verifyEvaluatorRoster(roster)
        + list(machineEvidenceBlockers)
    )
    rubric = inputManifest.get("rubric")
    if (
        not isinstance(rubric, dict)
        or rubric.get("sha256") != sha256Bytes(rubricBytes)
        or rubric.get("targetScore") is not None
        or rubric.get("passThreshold") is not None
    ):
        sealBlockers.append("frozen rubric metadata is invalid")
    blockers = list(sealBlockers)
    if inputManifest.get("sealed") is not True or inputManifest.get("roundState") != "ready":
        blockers.append("R10 input manifest is not sealed and ready")
    scope = inputManifest.get("scope")
    if not isinstance(scope, dict) or scope.get("sealState") != "sealed":
        blockers.append("R10 scope is not sealed")
    sealBlockers = sorted(set(sealBlockers))
    blockers = sorted(set(blockers))
    return {
        "sealEligible": not sealBlockers,
        "roundReady": False,
        "sealBlockingReasons": sealBlockers,
        "blockingReasons": blockers,
    }


def buildEvaluationScopeManifest(entries: tuple[BundleEntry, ...], *, gitHead: str, diffHash: str) -> dict[str, Any]:
    fileRows = [entry.manifestRow() for entry in entries]
    manifestHash = sha256Bytes(canonicalJson({"schemaVersion": 1, "files": fileRows}))
    return {
        "sealState": "draft",
        "gitCommit": gitHead,
        "dirtyDiffHash": diffHash,
        "manifestHash": manifestHash,
        "fileCount": len(fileRows),
        "totalBytes": sum(row["bytes"] for row in fileRows),
        "files": fileRows,
    }


def buildPrdEvaluationBundle() -> tuple[dict[str, Any], bytes]:
    gitHead = currentGitHead()
    scopeCommit = latestIncludedScopeCommit(gitHead)
    paths = repositoryPaths()
    repositoryStatuses = changedRepositoryStatuses()
    beforeStatuses = changedScopeStatuses(repositoryStatuses)
    sourcePaths = {
        PurePosixPath(path).as_posix()
        for path in paths
        if isPathIncluded(path)
    }
    sourcePaths.update(relativePath(source) for source in CONTRACT_BUNDLE_PATHS.values())
    sourceBytes = repositorySourceBytes(sourcePaths, repositoryStatuses)
    machineEvidenceEntries, machineEvidence = collectMachineEvidence(
        currentHead=gitHead,
        scopeCommit=scopeCommit,
        scopeDirty=bool(beforeStatuses),
    )
    entries = collectBundleEntries(paths, sourceBytes, machineEvidenceEntries)
    beforeDiffHash = dirtyDiffHash(entries, beforeStatuses)
    scope = buildEvaluationScopeManifest(entries, gitHead=scopeCommit, diffHash=beforeDiffHash)
    archiveBytes = buildZipBytes(entries)
    if currentGitHead() != gitHead or changedScopeStatuses() != beforeStatuses:
        raise BundleError("evaluation scope changed while the bundle was being built")
    inputManifest = loadMapping(INPUT_PATH)
    readiness = roundReadiness(
        inputManifest,
        loadMapping(ROSTER_PATH),
        sourceBytes[relativePath(RUBRIC_SOURCE)],
        machineEvidence["blockingReasons"],
    )
    inputScope = inputManifest.get("scope")
    sealedScopeMatches = (
        inputManifest.get("sealed") is True
        and inputManifest.get("roundState") == "ready"
        and isinstance(inputScope, dict)
        and inputScope.get("sealState") == "sealed"
        and inputScope.get("gitCommit") == scope["gitCommit"]
        and inputScope.get("dirtyDiffHash") == scope["dirtyDiffHash"]
        and inputScope.get("manifestHash") == scope["manifestHash"]
        and inputScope.get("evaluationBundleHash") == sha256Bytes(archiveBytes)
    )
    if inputManifest.get("sealed") is True and not sealedScopeMatches:
        readiness["blockingReasons"] = sorted(
            set(readiness["blockingReasons"] + ["sealed input scope does not match the current bundle"])
        )
    readiness["roundReady"] = readiness["sealEligible"] and sealedScopeMatches
    scope["sealState"] = "sealed" if sealedScopeMatches else "draft"
    state = "sealed" if sealedScopeMatches else "ready-to-seal" if readiness["sealEligible"] else "draft"
    manifest = {
        "schemaVersion": 1,
        "roundId": "R10",
        "state": state,
        "scope": {key: value for key, value in scope.items() if key != "files"},
        "archive": {
            "path": relativePath(ARCHIVE_PATH),
            "sha256": sha256Bytes(archiveBytes),
            "bytes": len(archiveBytes),
            "format": "zip",
            "compression": ZIP_COMPRESSION_NAME,
            "compressionMethod": ZIP_COMPRESSION,
            "readOnlyEntries": True,
        },
        "roundReadiness": readiness,
        "machineEvidence": {
            "indexPath": EVIDENCE_INDEX_PATH,
            "scopeGitCommit": machineEvidence["scopeGitCommit"],
            "scopeClean": machineEvidence["scopeClean"],
            "requiredReportCount": machineEvidence["requiredReportCount"],
            "includedReportCount": machineEvidence["includedReportCount"],
            "artifactCount": machineEvidence["artifactCount"],
            "allCurrent": machineEvidence["allCurrent"],
            "blockingReasons": machineEvidence["blockingReasons"],
        },
        "exclusions": {
            "forbiddenPrefixes": list(FORBIDDEN_PREFIXES),
            "forbiddenSegments": sorted(FORBIDDEN_SEGMENTS),
            "allowlistedMachineEvidencePrefix": EVIDENCE_BUNDLE_PREFIX,
            "priorScoresIncluded": False,
            "priorConclusionsIncluded": False,
        },
        "contracts": [
            {
                "bundlePath": bundlePath,
                "sourcePath": relativePath(source),
                "sha256": sha256Bytes(sourceBytes[relativePath(source)]),
            }
            for bundlePath, source in CONTRACT_BUNDLE_PATHS.items()
        ],
        "files": scope["files"],
    }
    return manifest, archiveBytes


def dumpManifest(manifest: dict[str, Any]) -> bytes:
    return yaml.safe_dump(manifest, allow_unicode=True, sort_keys=False, width=120).encode("utf-8")


def writeAtomic(path: Path, payload: bytes, *, readOnly: bool = False) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        path.chmod(stat.S_IREAD | stat.S_IWRITE)
    descriptor, temporaryName = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    temporary = Path(temporaryName)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        temporary.replace(path)
        if readOnly:
            path.chmod(stat.S_IREAD)
    finally:
        if temporary.exists():
            temporary.unlink()


def verifyWrittenManifest(expected: dict[str, Any]) -> None:
    actual = loadMapping(MANIFEST_PATH)
    if actual != expected:
        raise BundleError(
            "evaluation bundle manifest is stale; run "
            "uv run --no-sync python -X utf8 docs/skills/ops/tools/buildPrdEvaluationBundle.py --write"
        )


def bindRubricSource(inputManifest: dict[str, Any]) -> dict[str, Any]:
    updated = dict(inputManifest)
    rubric = dict(updated.get("rubric") or {})
    rubric["path"] = relativePath(RUBRIC_SOURCE)
    updated["rubric"] = rubric
    return updated


def sealedInputManifest(inputManifest: dict[str, Any], bundleManifest: dict[str, Any]) -> dict[str, Any]:
    if bundleManifest["roundReadiness"]["sealEligible"] is not True:
        reasons = bundleManifest["roundReadiness"]["sealBlockingReasons"]
        raise BundleError("R10 scope cannot be sealed: " + "; ".join(reasons))
    scope = bundleManifest["scope"]
    archive = bundleManifest["archive"]
    updated = bindRubricSource(inputManifest)
    updated["roundState"] = "ready"
    updated["sealed"] = True
    updated["scope"] = {
        "sealState": "sealed",
        "gitCommit": scope["gitCommit"],
        "dirtyDiffHash": scope["dirtyDiffHash"],
        "manifestHash": scope["manifestHash"],
        "evaluationBundleHash": archive["sha256"],
        "reason": None,
    }
    draftBundle = dict(updated.get("draftBundle") or {})
    draftBundle.update({
        "manifestPath": relativePath(MANIFEST_PATH),
        "archivePath": archive["path"],
        "gitCommit": scope["gitCommit"],
        "dirtyDiffHash": scope["dirtyDiffHash"],
        "manifestHash": scope["manifestHash"],
        "evaluationBundleHash": archive["sha256"],
        "fileCount": scope["fileCount"],
        "bundleIntegrityState": "passed",
        "sealEligible": True,
    })
    updated["draftBundle"] = draftBundle
    return updated


def draftInputManifest(inputManifest: dict[str, Any], bundleManifest: dict[str, Any]) -> dict[str, Any]:
    scope = bundleManifest["scope"]
    archive = bundleManifest["archive"]
    updated = bindRubricSource(inputManifest)
    draftBundle = dict(updated.get("draftBundle") or {})
    draftBundle.update({
        "manifestPath": relativePath(MANIFEST_PATH),
        "archivePath": archive["path"],
        "gitCommit": scope["gitCommit"],
        "dirtyDiffHash": scope["dirtyDiffHash"],
        "manifestHash": scope["manifestHash"],
        "evaluationBundleHash": archive["sha256"],
        "fileCount": scope["fileCount"],
        "bundleIntegrityState": "passed",
        "sealEligible": bundleManifest["roundReadiness"]["sealEligible"],
    })
    updated["draftBundle"] = draftBundle
    return updated


def sealBundle(manifest: dict[str, Any], archiveBytes: bytes) -> dict[str, Any]:
    inputManifest = loadMapping(INPUT_PATH)
    updatedInput = sealedInputManifest(inputManifest, manifest)
    originalInputBytes = INPUT_PATH.read_bytes()
    updatedInputBytes = yaml.safe_dump(updatedInput, allow_unicode=True, sort_keys=False, width=120).encode("utf-8")
    try:
        writeAtomic(INPUT_PATH, updatedInputBytes)
        sealedManifest, sealedArchiveBytes = buildPrdEvaluationBundle()
        if sealedManifest["state"] != "sealed" or sealedManifest["roundReadiness"]["roundReady"] is not True:
            raise BundleError("R10 input was updated but the current bundle did not reach a sealed state")
        if sealedArchiveBytes != archiveBytes:
            raise BundleError("evaluation archive changed during the seal transition")
    except Exception:
        writeAtomic(INPUT_PATH, originalInputBytes)
        raise
    writeAtomic(ARCHIVE_PATH, sealedArchiveBytes, readOnly=True)
    writeAtomic(MANIFEST_PATH, dumpManifest(sealedManifest))
    return sealedManifest


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Build the history-free R10 independent evaluation bundle.")
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--write", action="store_true", help="Write the tracked manifest and generated ZIP archive.")
    action.add_argument("--check", action="store_true", help="Verify the tracked manifest against the current scope.")
    action.add_argument("--seal", action="store_true", help="Seal only after remediation and evaluator evidence is ready.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = buildParser().parse_args(argv)
    try:
        manifest, archiveBytes = buildPrdEvaluationBundle()
        if args.seal:
            sealed = sealBundle(manifest, archiveBytes)
            print(
                f"sealed R10 bundle: {sealed['scope']['fileCount']} files, "
                f"sha256={sealed['archive']['sha256']}"
            )
        elif args.write:
            inputManifest = loadMapping(INPUT_PATH)
            updatedInput = draftInputManifest(inputManifest, manifest)
            writeAtomic(
                INPUT_PATH,
                yaml.safe_dump(updatedInput, allow_unicode=True, sort_keys=False, width=120).encode("utf-8"),
            )
            writeAtomic(ARCHIVE_PATH, archiveBytes, readOnly=True)
            writeAtomic(MANIFEST_PATH, dumpManifest(manifest))
            print(
                f"wrote draft R10 bundle: {manifest['scope']['fileCount']} files, "
                f"sha256={manifest['archive']['sha256']}"
            )
        else:
            verifyWrittenManifest(manifest)
            print(
                f"ok: R10 bundle manifest matches {manifest['scope']['fileCount']} files; "
                f"sealEligible={str(manifest['roundReadiness']['sealEligible']).lower()}"
            )
    except BundleError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
