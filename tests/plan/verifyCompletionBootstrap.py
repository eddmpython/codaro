from __future__ import annotations

from datetime import UTC, datetime
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
REPORT_PATH = ROOT / "output" / "test-runner" / "completion-bootstrap" / "completion-bootstrap-report.json"
PYTEST_TEMP = REPORT_PATH.parent / "pytest"


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
            "plan-fact-audit",
            (
                sys.executable,
                "-X",
                "utf8",
                "tests/product/verifyPlanFactAudit.py",
                "--packet",
                "02-completion-and-gate-bootstrap",
            ),
        ),
        (
            "completion-ledger",
            (
                sys.executable,
                "-X",
                "utf8",
                "tests/plan/verifyMainPlanCompletion.py",
                "--ledger-only",
            ),
        ),
        (
            "completion-and-evaluation-contract-tests",
            (
                sys.executable,
                "-X",
                "utf8",
                "-m",
                "pytest",
                "tests/plan/testMainPlanCompletion.py",
                "tests/product/testPrdEvaluationBundle.py",
                "tests/product/testPrdEvaluationReport.py",
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
        stderr = str(exc)
        print(f"FAIL: {name}: {stderr}", file=sys.stderr)
        stdout = ""
        returnCode = 124 if isinstance(exc, subprocess.TimeoutExpired) else 1
    return {
        "name": name,
        "command": list(command),
        "returnCode": returnCode,
        "durationMs": round((time.monotonic() - started) * 1000),
        "stdoutTail": stdout[-2000:],
        "stderrTail": stderr[-2000:],
    }


def verifyCompletionBootstrap() -> dict[str, Any]:
    startedAt = utcTimestamp()
    started = time.monotonic()
    gitHead = currentGitHead()
    dirtyPaths = worktreeChanges()
    checks: list[dict[str, Any]] = []
    failures: list[str] = []

    if gitHead is None:
        failures.append("current Git HEAD is unavailable")
    if dirtyPaths:
        failures.append("completion bootstrap evidence requires a clean worktree")
    else:
        PYTEST_TEMP.mkdir(parents=True, exist_ok=True)
        for name, command in checkCommands():
            result = runCheck(name, command)
            checks.append(result)
            if result["returnCode"] != 0:
                failures.append(f"{name} exited with {result['returnCode']}")
                break

    return {
        "schemaVersion": 1,
        "gate": "completion-bootstrap",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "gitHead": gitHead,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
        "cleanWorktree": not dirtyPaths,
        "dirtyPaths": dirtyPaths,
        "checks": checks,
        "failures": failures,
    }


def main() -> int:
    payload = verifyCompletionBootstrap()
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not payload["passed"]:
        print("FAIL: completion bootstrap contract is not ready", file=sys.stderr)
        for failure in payload["failures"]:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    print(f"ok: completion bootstrap verified at {payload['gitHead']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
