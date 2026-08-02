from __future__ import annotations

import argparse
from datetime import datetime
from pathlib import Path
import re
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[4]
INTEGRITY_ROOT = ROOT / "contracts" / "learning-content"
IDENTITY_LEDGER_ROOT = INTEGRITY_ROOT / "identity-ledger"
CONTENT_LEDGER_ROOT = INTEGRITY_ROOT / "content-ledger"
ALIAS_MIGRATION_PATH = INTEGRITY_ROOT / "evidence" / "legacy-alias-migration.yml"
CURRICULA_ROOT = ROOT / "curricula" / "python"
COMMIT_PATTERN = re.compile(r"[0-9a-f]{40}")
REVIEWER_PATTERN = re.compile(r"[a-z0-9][a-z0-9-]{2,63}")


def parseArgs() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Apply an evidenced learning-content review decision.")
    parser.add_argument("--reviewer-id", required=True)
    parser.add_argument("--reviewed-at", required=True)
    parser.add_argument("--evidence-commit", required=True)
    parser.add_argument("--write", action="store_true")
    return parser.parse_args()


def validateArgs(args: argparse.Namespace) -> None:
    if REVIEWER_PATTERN.fullmatch(args.reviewer_id) is None:
        raise ValueError("reviewer id must be a lowercase kebab-case identifier")
    if COMMIT_PATTERN.fullmatch(args.evidence_commit) is None:
        raise ValueError("evidence commit must be a full lowercase Git hash")
    reviewedAt = datetime.fromisoformat(args.reviewed_at)
    if reviewedAt.tzinfo is None or reviewedAt.utcoffset() is None:
        raise ValueError("reviewed-at must include a timezone offset")


def loadYaml(path: Path) -> dict[str, Any]:
    payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"YAML root must be a mapping: {path.relative_to(ROOT)}")
    return payload


def reviewMetadata(args: argparse.Namespace, indent: str) -> str:
    return (
        f'{indent}reviewerId: "{args.reviewer_id}"\n'
        f'{indent}reviewedAt: "{args.reviewed_at}"\n'
        f'{indent}evidenceCommit: "{args.evidence_commit}"'
    )


def approveRows(
    path: Path,
    field: str,
    pendingValue: str,
    expectedRows: int,
    args: argparse.Namespace,
) -> int:
    text = path.read_text(encoding="utf-8")
    pending = f"    {field}: {pendingValue}"
    approved = f"    {field}: approved"
    metadata = reviewMetadata(args, "    ")
    pendingCount = text.count(pending)
    approvedCount = text.count(approved)
    if pendingCount and approvedCount:
        raise ValueError(f"mixed review states: {path.relative_to(ROOT)}")
    if pendingCount:
        if pendingCount != expectedRows:
            raise ValueError(
                f"unexpected pending row count {pendingCount}/{expectedRows}: {path.relative_to(ROOT)}"
            )
        updated = text.replace(pending, f"{approved}\n{metadata}")
    else:
        expectedBlock = f"{approved}\n{metadata}"
        if approvedCount != expectedRows or text.count(expectedBlock) != expectedRows:
            raise ValueError(f"approved metadata differs: {path.relative_to(ROOT)}")
        updated = text
    loadResult = yaml.safe_load(updated)
    if not isinstance(loadResult, dict):
        raise ValueError(f"review update produced invalid YAML: {path.relative_to(ROOT)}")
    if args.write and updated != text:
        path.write_text(updated, encoding="utf-8", newline="\n")
    return expectedRows


def approveLedgerDirectory(
    directory: Path,
    field: str,
    pendingValue: str,
    countField: str,
    args: argparse.Namespace,
) -> int:
    reviewedRows = 0
    for path in sorted(directory.glob("*.yml")):
        if path.name == "summary.yml":
            continue
        payload = loadYaml(path)
        lessons = payload.get("lessons")
        if not isinstance(lessons, list):
            raise ValueError(f"lessons must be a list: {path.relative_to(ROOT)}")
        expectedRows = int(payload.get(countField, -1))
        if expectedRows != len(lessons):
            raise ValueError(f"ledger row count differs: {path.relative_to(ROOT)}")
        reviewedRows += approveRows(path, field, pendingValue, expectedRows, args)
    return reviewedRows


def approveAssessments(args: argparse.Namespace) -> int:
    reviewedLessons = 0
    for path in sorted(CURRICULA_ROOT.rglob("*.yaml")):
        if path.name == "schema.yaml":
            continue
        payload = loadYaml(path)
        assessment = payload.get("assessment")
        if not isinstance(assessment, dict) or not assessment:
            continue
        reviewedLessons += approveRows(path, "independentReview", "pending", 1, args)
    return reviewedLessons


def approveAliasMigration(args: argparse.Namespace) -> int:
    text = ALIAS_MIGRATION_PATH.read_text(encoding="utf-8")
    pendingBlock = "review:\n  status: pending\n  reviewerId: null\n  reviewedAt: null\n  evidenceCommit: null"
    approvedBlock = (
        "review:\n"
        "  status: approved\n"
        + reviewMetadata(args, "  ")
    )
    if pendingBlock in text:
        updated = text.replace(pendingBlock, approvedBlock)
    elif approvedBlock in text:
        updated = text
    else:
        raise ValueError("legacy alias review block differs from the supported contract")
    loadResult = yaml.safe_load(updated)
    if not isinstance(loadResult, dict):
        raise ValueError("alias review update produced invalid YAML")
    if args.write and updated != text:
        ALIAS_MIGRATION_PATH.write_text(updated, encoding="utf-8", newline="\n")
    return 1


def main() -> int:
    args = parseArgs()
    validateArgs(args)
    counts = {
        "identityRows": approveLedgerDirectory(
            IDENTITY_LEDGER_ROOT, "reviewStatus", "pending", "sourceCount", args
        ),
        "contentRows": approveLedgerDirectory(
            CONTENT_LEDGER_ROOT, "authorReviewStatus", "planned", "canonicalRows", args
        ),
        "assessmentLessons": approveAssessments(args),
        "aliasReviews": approveAliasMigration(args),
    }
    expected = {
        "identityRows": 472,
        "contentRows": 472,
        "assessmentLessons": 468,
        "aliasReviews": 1,
    }
    if counts != expected:
        raise ValueError(f"review scope differs: actual={counts} expected={expected}")
    action = "updated" if args.write else "validated"
    print(f"ok: {action} learning-content reviews {counts}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
