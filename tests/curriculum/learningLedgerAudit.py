from __future__ import annotations

from datetime import UTC, datetime
import hashlib
import json
from pathlib import Path
import subprocess
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[2]
LEARNING_CONTENT_ROOT = ROOT / "mainPlan/astryx-product-experience/08-learning-content"
IDENTITY_ROOT = LEARNING_CONTENT_ROOT / "00-identity-integrity"
IDENTITY_LEDGER_ROOT = IDENTITY_ROOT / "identity-ledger"
CONTENT_LEDGER_ROOT = IDENTITY_ROOT / "content-ledger"
EVIDENCE_ROOT = IDENTITY_ROOT / "evidence"
CURRICULA_ROOT = ROOT / "curricula/python"
STRONG_CHECK_KINDS = {"output", "variable", "file", "table", "image", "behavior"}


def loadYaml(path: Path) -> dict[str, Any]:
    payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"YAML root must be a mapping: {displayPath(path)}")
    return payload


def identityRows() -> dict[str, dict[str, Any]]:
    rows: dict[str, dict[str, Any]] = {}
    for path in sorted(IDENTITY_LEDGER_ROOT.glob("*.yml")):
        if path.name == "summary.yml":
            continue
        payload = loadYaml(path)
        for row in payload.get("lessons", []):
            if not isinstance(row, dict):
                raise ValueError(f"identity row must be a mapping: {displayPath(path)}")
            lessonRef = str(row.get("lessonRef", ""))
            if not lessonRef or lessonRef in rows:
                raise ValueError(f"invalid or duplicate identity lessonRef: {lessonRef}")
            rows[lessonRef] = row
    return rows


def contentRows() -> dict[str, dict[str, Any]]:
    rows: dict[str, dict[str, Any]] = {}
    for path in sorted(CONTENT_LEDGER_ROOT.glob("*.yml")):
        if path.name == "summary.yml":
            continue
        payload = loadYaml(path)
        for row in payload.get("lessons", []):
            if not isinstance(row, dict):
                raise ValueError(f"content row must be a mapping: {displayPath(path)}")
            lessonRef = str(row.get("lessonRef", ""))
            if not lessonRef or lessonRef in rows:
                raise ValueError(f"invalid or duplicate content lessonRef: {lessonRef}")
            rows[lessonRef] = row
    return rows


def pathLedgers() -> dict[str, tuple[Path, dict[str, Any]]]:
    ledgers: dict[str, tuple[Path, dict[str, Any]]] = {}
    for path in sorted(LEARNING_CONTENT_ROOT.rglob("lesson-ledger.yml")):
        payload = loadYaml(path)
        pathId = str(payload.get("pathId", ""))
        if not pathId or pathId in ledgers:
            raise ValueError(f"invalid or duplicate pathId: {pathId}")
        ledgers[pathId] = (path, payload)
    return ledgers


def fileSha256(path: Path) -> str:
    content = path.read_bytes().replace(b"\r\n", b"\n").replace(b"\r", b"\n")
    return hashlib.sha256(content).hexdigest()


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def currentGitHead() -> str:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def displayPath(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return str(path)


def writeReport(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))


def curriculumPayloads() -> dict[str, dict[str, Any]]:
    payloads: dict[str, dict[str, Any]] = {}
    for lessonRef, row in identityRows().items():
        sourcePath = ROOT / str(row.get("sourcePath", ""))
        payloads[lessonRef] = loadYaml(sourcePath)
    return payloads


def isStrongCheckSpec(check: dict[str, Any]) -> bool:
    kind = check.get("kind") or check.get("type")
    payload = check.get("payload") if isinstance(check.get("payload"), dict) else {}
    return (
        kind in STRONG_CHECK_KINDS
        and check.get("strength") == "strong"
        and check.get("version") == 1
        and check.get("executor") in {"browser-worker", "local-sandbox"}
        and bool(str(check.get("fixtureId") or ""))
        and bool(str(check.get("fixtureHash") or ""))
        and bool(payload)
    )


def validAssessmentVariants(payload: dict[str, Any], mode: str) -> list[dict[str, Any]]:
    assessment = payload.get("assessment") if isinstance(payload.get("assessment"), dict) else {}
    variants = assessment.get(f"{mode}Variants")
    if not isinstance(variants, list):
        return []
    valid: list[dict[str, Any]] = []
    for variant in variants:
        if not isinstance(variant, dict):
            continue
        exercise = variant.get("exercise") if isinstance(variant.get("exercise"), dict) else {}
        check = variant.get("check") if isinstance(variant.get("check"), dict) else {}
        expectedUnseen = True
        if not (
            variant.get("mode") == mode
            and variant.get("unseen") is expectedUnseen
            and bool(str(variant.get("id") or ""))
            and bool(str(exercise.get("prompt") or ""))
            and bool(str(exercise.get("starterCode") or ""))
            and bool(str(exercise.get("solution") or ""))
            and bool(str(variant.get("claimScope") or ""))
            and isStrongCheckSpec(check)
        ):
            continue
        if mode == "retrieval" and (
            not isinstance(variant.get("minimumDelayHours"), int)
            or isinstance(variant.get("minimumDelayHours"), bool)
            or int(variant["minimumDelayHours"]) < 7 * 24
        ):
            continue
        valid.append(variant)
    return valid
