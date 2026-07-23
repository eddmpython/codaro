from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[2]
REPORT_PATH = ROOT / "output" / "test-runner" / "repository-simplification" / "unused-illustrations-report.json"


def currentGitHead() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def main() -> int:
    illustrationPaths = sorted(
        path.relative_to(ROOT).as_posix()
        for path in (ROOT / "curricula" / "python").rglob("illustration.py")
    )
    curriculumModule = (ROOT / "curricula" / "python" / "__init__.py").read_text(encoding="utf-8")
    forbiddenSymbols = tuple(
        symbol
        for symbol in ("getCategoryIllustration", "getCategoryCodePreview", "_illustrationCache")
        if symbol in curriculumModule
    )
    failures = [
        *[f"unused illustration source remains: {path}" for path in illustrationPaths],
        *[f"legacy illustration loader remains: {symbol}" for symbol in forbiddenSymbols],
    ]
    report = {
        "schemaVersion": 1,
        "gate": "repository-simplification",
        "check": "unused-illustrations",
        "passed": not failures,
        "completionEligible": not failures,
        "gitHead": currentGitHead(),
        "completedAt": datetime.now(UTC).isoformat(),
        "illustrationPaths": illustrationPaths,
        "forbiddenSymbols": forbiddenSymbols,
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print("ok: unused curriculum illustration source remains absent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
