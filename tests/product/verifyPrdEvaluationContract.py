from __future__ import annotations

from datetime import UTC, datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[2]
RUBRIC_PATH = ROOT / "contracts" / "prdEvaluationRubric.yml"
SCHEMA_PATH = ROOT / "contracts" / "prdEvaluationReport.schema.yml"
REPORT_PATH = (
    ROOT
    / "output"
    / "test-runner"
    / "evaluation-contract"
    / "evaluation-contract-report.json"
)
PYTEST_TEMP = REPORT_PATH.parent / "pytest"
DIMENSION_IDS = (
    "learnerValue",
    "currentStateAccuracy",
    "decisionCompleteness",
    "dependencyOwnership",
    "feasibilityCapacity",
    "testRollback",
    "measurementRelease",
)
REQUIRED_REPORT_FIELDS = {
    "dimensions",
    "findings",
    "totalScore",
    "productEvidenceMaturity",
    "promptAudit",
}


class EvaluationContractError(ValueError):
    pass


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def currentGitHead() -> str | None:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() or None


def worktreeChanges() -> list[str]:
    try:
        result = subprocess.run(
            ("git", "-c", "core.quotepath=false", "status", "--porcelain=v1", "--untracked-files=all"),
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
            timeout=10,
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        return [f"cannot inspect worktree: {exc}"]
    return [line for line in result.stdout.splitlines() if line.strip()]


def loadMapping(path: Path) -> dict[str, Any]:
    try:
        payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    except (OSError, yaml.YAMLError) as exc:
        raise EvaluationContractError(f"cannot parse {path.relative_to(ROOT).as_posix()}: {exc}") from exc
    if not isinstance(payload, dict):
        raise EvaluationContractError(f"document root must be a mapping: {path.relative_to(ROOT).as_posix()}")
    return payload


def sha256File(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validateContract(
    rubric: dict[str, Any],
    schema: dict[str, Any],
) -> tuple[dict[str, Any], list[str]]:
    failures: list[str] = []
    rawDimensions = rubric.get("dimensions")
    dimensions = [row for row in rawDimensions if isinstance(row, dict)] if isinstance(rawDimensions, list) else []
    dimensionIds = [row.get("id") for row in dimensions]
    weights = [row.get("weight") for row in dimensions]
    numericWeights = [weight for weight in weights if isinstance(weight, (int, float)) and not isinstance(weight, bool)]
    totalWeight = sum(numericWeights)

    if dimensionIds != list(DIMENSION_IDS):
        failures.append("rubric dimension IDs or order differ from the frozen contract")
    if len(set(dimensionIds)) != len(DIMENSION_IDS):
        failures.append("rubric dimension IDs must be unique")
    if len(numericWeights) != len(DIMENSION_IDS) or totalWeight != 100:
        failures.append("rubric dimensions must contain seven numeric weights totaling 100")
    if rubric.get("targetScore") is not None or rubric.get("passThreshold") is not None:
        failures.append("rubric must not define a target score or pass threshold")

    required = schema.get("required")
    properties = schema.get("properties")
    if schema.get("type") != "object" or schema.get("additionalProperties") is not False:
        failures.append("evaluation report schema must be a closed object")
    if not isinstance(required, list) or not REQUIRED_REPORT_FIELDS.issubset(set(required)):
        failures.append("evaluation report schema misses required evidence fields")
    if not isinstance(properties, dict):
        failures.append("evaluation report schema properties must be a mapping")
        properties = {}
    dimensionSchema = properties.get("dimensions")
    propertyNames = dimensionSchema.get("propertyNames") if isinstance(dimensionSchema, dict) else None
    schemaDimensionIds = propertyNames.get("enum") if isinstance(propertyNames, dict) else None
    minimumDimensionCount = dimensionSchema.get("minProperties") if isinstance(dimensionSchema, dict) else None
    maximumDimensionCount = dimensionSchema.get("maxProperties") if isinstance(dimensionSchema, dict) else None
    if (
        schemaDimensionIds != list(DIMENSION_IDS)
        or minimumDimensionCount != len(DIMENSION_IDS)
        or maximumDimensionCount != len(DIMENSION_IDS)
    ):
        failures.append("evaluation report schema dimensions must mirror the frozen rubric IDs")
    totalScore = properties.get("totalScore")
    if not isinstance(totalScore, dict) or "const" in totalScore:
        failures.append("evaluation report schema must preserve the evaluator's raw total score")

    return {
        "rubric": {
            "path": RUBRIC_PATH.relative_to(ROOT).as_posix(),
            "sha256": sha256File(RUBRIC_PATH),
            "dimensionCount": len(dimensions),
            "dimensionIds": dimensionIds,
            "totalWeight": totalWeight,
            "targetScore": rubric.get("targetScore"),
            "passThreshold": rubric.get("passThreshold"),
        },
        "schema": {
            "path": SCHEMA_PATH.relative_to(ROOT).as_posix(),
            "sha256": sha256File(SCHEMA_PATH),
            "closedObject": schema.get("additionalProperties") is False,
            "requiredEvidenceFields": sorted(REQUIRED_REPORT_FIELDS),
            "dimensionIds": schemaDimensionIds if isinstance(schemaDimensionIds, list) else [],
        },
    }, failures


def checkCommands() -> tuple[tuple[str, tuple[str, ...]], ...]:
    return (
        (
            "gate-registry",
            (sys.executable, "-X", "utf8", "tests/run.py", "audit-self"),
        ),
        (
            "generated-contract-freshness",
            (
                sys.executable,
                "-X",
                "utf8",
                "docs/skills/ops/tools/genProductContracts.py",
                "--check",
            ),
        ),
        (
            "plan-fact-contract",
            (
                sys.executable,
                "-X",
                "utf8",
                "tests/product/verifyPlanFactAudit.py",
            ),
        ),
        (
            "evaluation-contract-fixtures",
            (
                sys.executable,
                "-X",
                "utf8",
                "-m",
                "pytest",
                "tests/product/testPrdEvaluationContract.py",
                "tests/product/testPrdEvaluationReport.py",
                "tests/product/testPrdEvaluationBundle.py",
                "-q",
                "--tb=short",
                "-p",
                "no:cacheprovider",
                "--basetemp",
                str(PYTEST_TEMP / f"run-{os.getpid()}-{time.time_ns()}"),
            ),
        ),
    )


def runCheck(name: str, command: tuple[str, ...]) -> dict[str, Any]:
    started = time.monotonic()
    try:
        result = subprocess.run(
            command,
            cwd=ROOT,
            text=True,
            encoding="utf-8",
            errors="replace",
            capture_output=True,
            timeout=300,
        )
        stdout = result.stdout.strip()
        stderr = result.stderr.strip()
        if stdout:
            print(stdout)
        if stderr:
            print(stderr, file=sys.stderr)
        returnCode = result.returncode
    except (OSError, subprocess.TimeoutExpired) as exc:
        stdout = ""
        stderr = str(exc)
        returnCode = 124 if isinstance(exc, subprocess.TimeoutExpired) else 1
        print(f"FAIL: {name}: {stderr}", file=sys.stderr)
    return {
        "name": name,
        "command": list(command),
        "returnCode": returnCode,
        "durationMs": round((time.monotonic() - started) * 1000),
        "stdoutTail": stdout[-2000:],
        "stderrTail": stderr[-2000:],
    }


def verifyEvaluationContract() -> dict[str, Any]:
    startedAt = utcTimestamp()
    started = time.monotonic()
    gitHead = currentGitHead()
    dirtyPaths = worktreeChanges()
    checks: list[dict[str, Any]] = []
    failures: list[str] = []
    facts: dict[str, Any] = {}

    if gitHead is None:
        failures.append("current Git HEAD is unavailable")
    try:
        facts, contractFailures = validateContract(loadMapping(RUBRIC_PATH), loadMapping(SCHEMA_PATH))
        failures.extend(contractFailures)
    except (EvaluationContractError, OSError) as exc:
        failures.append(str(exc))
    if dirtyPaths:
        failures.append("evaluation contract evidence requires a clean worktree")

    if not failures:
        PYTEST_TEMP.mkdir(parents=True, exist_ok=True)
        for name, command in checkCommands():
            result = runCheck(name, command)
            checks.append(result)
            if result["returnCode"] != 0:
                failures.append(f"{name} exited with {result['returnCode']}")
                break

    return {
        "schemaVersion": 1,
        "gate": "evaluation-contract",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "gitHead": gitHead,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
        "cleanWorktree": not dirtyPaths,
        "dirtyPaths": dirtyPaths,
        "facts": facts,
        "checks": checks,
        "failures": failures,
        "roundBoundary": {
            "contractVerified": not failures,
            "independentRoundExecuted": False,
            "independentRoundOwner": (
                "mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/"
                "08-r10-independent-review"
            ),
        },
    }


def main() -> int:
    payload = verifyEvaluationContract()
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not payload["passed"]:
        print("FAIL: evaluation contract is not ready", file=sys.stderr)
        for failure in payload["failures"]:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    print(f"ok: evaluation contract verified at {payload['gitHead']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
