from __future__ import annotations

import argparse
from datetime import UTC, datetime
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import time
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))

from codaro.curriculum.efficacyStage import resolvePathPortfolio  # noqa: E402


CAPSTONES = ROOT / "mainPlan/astryx-product-experience/08-learning-content/evidence/featured-capstones.yml"
EVIDENCE_ROOT = ROOT / "mainPlan/astryx-product-experience/10-quality-release/evidence/path-efficacy"


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def gitHead() -> str:
    return subprocess.run(
        ("git", "rev-parse", "HEAD"), cwd=ROOT, check=True, capture_output=True, encoding="utf-8"
    ).stdout.strip()


def contentPath(lessonRef: str) -> Path:
    relative = Path(*lessonRef.split("/"))
    candidates = [
        path for path in (ROOT / "curricula/python").rglob(relative.name + ".yaml")
        if path.as_posix().endswith(relative.as_posix() + ".yaml")
    ]
    if len(candidates) != 1:
        raise ValueError(f"capstone lesson path is not unique: {lessonRef}")
    return candidates[0]


def contentHash(path: Path) -> str:
    return "sha256-" + hashlib.sha256(path.read_bytes()).hexdigest()


def loadMapping(path: Path) -> dict[str, Any]:
    value = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"YAML root must be a mapping: {path.relative_to(ROOT).as_posix()}")
    return value


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Verify path-scoped E2 or E3 efficacy evidence")
    parser.add_argument("--stage", choices=("E2", "E3"), required=True)
    args = parser.parse_args(argv)
    gate = "path-learning-signal" if args.stage == "E2" else "path-efficacy-confirmatory"
    reportPath = ROOT / f"output/test-runner/{gate}/{gate}-report.json"
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    results: dict[str, Any] = {}
    try:
        capstones = loadMapping(CAPSTONES).get("paths")
        if not isinstance(capstones, list) or len(capstones) != 6:
            raise ValueError("featured capstone manifest must define exactly six paths")
        currentHashes: dict[str, str] = {}
        candidates: list[dict[str, Any]] = []
        for item in capstones:
            if not isinstance(item, dict):
                raise ValueError("featured capstone entry must be a mapping")
            pathId = str(item.get("pathId") or "")
            lessonRef = str(item.get("capstoneLessonRef") or "")
            currentHashes[pathId] = contentHash(contentPath(lessonRef))
            candidatePath = EVIDENCE_ROOT / args.stage / f"{pathId}.yml"
            if not candidatePath.is_file():
                failures.append(f"{pathId}: missing {candidatePath.relative_to(ROOT).as_posix()}")
                continue
            candidate = loadMapping(candidatePath)
            if candidate.get("targetStage") != args.stage:
                failures.append(f"{pathId}: targetStage must be {args.stage}")
            candidates.append(candidate)
        results = resolvePathPortfolio(candidates, currentContentHashes=currentHashes)
        for pathId, result in results.items():
            if result.get("passed") is not True:
                failures.append(f"{pathId}: {result.get('code', 'efficacy-evidence-invalid')}")
    except (OSError, ValueError, yaml.YAMLError, subprocess.SubprocessError) as error:
        failures.append(str(error))
    payload = {
        "schemaVersion": 1,
        "gate": gate,
        "stage": args.stage,
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "completionEligible": not failures,
        "gitHead": gitHead(),
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "pathResults": results,
        "failures": failures,
        "reportPath": reportPath.relative_to(ROOT).as_posix(),
    }
    reportPath.parent.mkdir(parents=True, exist_ok=True)
    reportPath.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        print(f"FAIL: {gate} requires current path-scoped human evidence", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    print(f"ok: {gate} verified all six featured paths")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
