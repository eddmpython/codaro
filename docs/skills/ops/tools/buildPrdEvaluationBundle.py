from __future__ import annotations

import argparse
from dataclasses import dataclass
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
RUBRIC_SOURCE = ROOT / LOOP / "00-evaluation-contract/rubric.yml"
SCHEMA_SOURCE = ROOT / LOOP / "00-evaluation-contract/evaluation-report.schema.yml"
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
    f"{INITIATIVE}/00-product-contract/00-specialist-review/",
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
}
BRIEFING_PATH = "evaluation-contract/evaluator-briefing.yml"
ZIP_TIMESTAMP = (1980, 1, 1, 0, 0, 0)


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


def sha256Bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


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
        return "_done" not in parts
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


def collectRepositoryEntries() -> list[BundleEntry]:
    paths = decodeGitPaths(runGit("ls-files", "-z", "--cached", "--others", "--exclude-standard"))
    entries: list[BundleEntry] = []
    for path in sorted(set(paths)):
        normalized = PurePosixPath(path).as_posix()
        if not isPathIncluded(normalized):
            continue
        source = ROOT / Path(normalized)
        if source.is_symlink():
            raise BundleError(f"bundle source must not be a symbolic link: {normalized}")
        if not source.is_file():
            continue
        try:
            source.resolve().relative_to(ROOT.resolve())
        except ValueError as exc:
            raise BundleError(f"bundle source escapes repository root: {normalized}") from exc
        entries.append(BundleEntry(normalized, source.read_bytes(), normalized, "repository"))
    return entries


def evaluatorBriefing() -> bytes:
    payload = {
        "schemaVersion": 1,
        "roundId": "R10",
        "task": "Independently assess the current product plan and evidence against the frozen rubric.",
        "disciplines": ["learning", "ux", "architecture"],
        "constraints": [
            "Use only files contained in this bundle.",
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


def collectBundleEntries() -> tuple[BundleEntry, ...]:
    entries = collectRepositoryEntries()
    for bundlePath, source in CONTRACT_BUNDLE_PATHS.items():
        entries.append(BundleEntry(bundlePath, source.read_bytes(), relativePath(source), "frozen-contract"))
    entries.append(BundleEntry(BRIEFING_PATH, evaluatorBriefing(), None, "generated-briefing"))
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


def changedScopeStatuses() -> list[tuple[str, str]]:
    rows: list[tuple[str, str]] = []
    changed = decodeGitPaths(runGit("diff", "--name-status", "--no-renames", "-z", "HEAD"))
    if len(changed) % 2:
        raise BundleError("git diff name-status output is malformed")
    for index in range(0, len(changed), 2):
        statusCode, path = changed[index], PurePosixPath(changed[index + 1]).as_posix()
        if not isPathIncluded(path):
            continue
        rows.append((statusCode, path))
    untracked = decodeGitPaths(runGit("ls-files", "-z", "--others", "--exclude-standard"))
    trackedPaths = {path for _, path in rows}
    for path in untracked:
        normalized = PurePosixPath(path).as_posix()
        if normalized in trackedPaths or not isPathIncluded(normalized):
            continue
        source = ROOT / Path(normalized)
        if source.is_file():
            rows.append(("??", normalized))
    return sorted(rows, key=lambda row: (row[1], row[0]))


def dirtyDiffHash(entries: Iterable[BundleEntry], statuses: Iterable[tuple[str, str]]) -> str:
    contentHashes = {entry.path: sha256Bytes(entry.data) for entry in entries}
    rows = [
        {"path": path, "status": statusCode, "sha256": contentHashes.get(path)}
        for statusCode, path in statuses
    ]
    return sha256Bytes(canonicalJson(rows))


def buildZipBytes(entries: Iterable[BundleEntry]) -> bytes:
    output = io.BytesIO()
    with zipfile.ZipFile(output, mode="w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for entry in sorted(entries, key=lambda item: item.path):
            info = zipfile.ZipInfo(entry.path, date_time=ZIP_TIMESTAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.create_system = 3
            info.external_attr = (stat.S_IFREG | 0o444) << 16
            info.flag_bits |= 0x800
            archive.writestr(info, entry.data, compress_type=zipfile.ZIP_DEFLATED, compresslevel=6)
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
    if len(evaluatorIds) != len(set(evaluatorIds)):
        blockers.append("evaluator IDs must be unique")
    return blockers


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


def roundReadiness(inputManifest: dict[str, Any], roster: dict[str, Any]) -> dict[str, Any]:
    sealBlockers = remediationSealBlockers(inputManifest) + verifyEvaluatorRoster(roster)
    rubric = inputManifest.get("rubric")
    if (
        not isinstance(rubric, dict)
        or rubric.get("sha256") != sha256Bytes(RUBRIC_SOURCE.read_bytes())
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
    beforeStatuses = changedScopeStatuses()
    entries = collectBundleEntries()
    beforeDiffHash = dirtyDiffHash(entries, beforeStatuses)
    scope = buildEvaluationScopeManifest(entries, gitHead=gitHead, diffHash=beforeDiffHash)
    archiveBytes = buildZipBytes(entries)
    if currentGitHead() != gitHead or changedScopeStatuses() != beforeStatuses:
        raise BundleError("evaluation scope changed while the bundle was being built")
    inputManifest = loadMapping(INPUT_PATH)
    readiness = roundReadiness(inputManifest, loadMapping(ROSTER_PATH))
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
            "readOnlyEntries": True,
        },
        "roundReadiness": readiness,
        "exclusions": {
            "forbiddenPrefixes": list(FORBIDDEN_PREFIXES),
            "forbiddenSegments": sorted(FORBIDDEN_SEGMENTS),
            "priorScoresIncluded": False,
            "priorConclusionsIncluded": False,
        },
        "contracts": [
            {
                "bundlePath": bundlePath,
                "sourcePath": relativePath(source),
                "sha256": sha256Bytes(source.read_bytes()),
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


def sealedInputManifest(inputManifest: dict[str, Any], bundleManifest: dict[str, Any]) -> dict[str, Any]:
    if bundleManifest["roundReadiness"]["sealEligible"] is not True:
        reasons = bundleManifest["roundReadiness"]["sealBlockingReasons"]
        raise BundleError("R10 scope cannot be sealed: " + "; ".join(reasons))
    scope = bundleManifest["scope"]
    archive = bundleManifest["archive"]
    updated = dict(inputManifest)
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
    updated = dict(inputManifest)
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
