from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[2]
REPORT_PATH = ROOT / "output" / "test-runner" / "repository-simplification" / "landing-dead-source-report.json"


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
    sources = {
        "landing/scripts/prerenderReact.js": (
            "function " + "homeBody",
            "463개 공개 커리큘럼 레슨",
            "예측 → 실행 → 검증 → 변주",
        ),
        "landing/src/App.jsx": ("const " + "navItems", "const " + "proofItems"),
        "landing/src/styles.css": (
            ".heroFrameWrap",
            ".productFrame",
            ".editorShell",
            ".editorWorkspace",
            ".surfaceCard",
        ),
    }
    failures: list[str] = []
    matches: list[dict[str, str]] = []
    for relativePath, forbidden in sources.items():
        source = (ROOT / relativePath).read_text(encoding="utf-8")
        for token in forbidden:
            if token in source:
                matches.append({"path": relativePath, "token": token})
                failures.append(f"legacy landing source remains: {relativePath}: {token}")

    check = subprocess.run(
        ["node", "scripts/removeLegacySource.mjs"],
        cwd=ROOT / "landing",
        capture_output=True,
        text=True,
    )
    if check.returncode != 0:
        failures.append(check.stderr.strip() or check.stdout.strip() or "legacy source check failed")

    report = {
        "schemaVersion": 1,
        "gate": "repository-simplification",
        "check": "landing-dead-source",
        "passed": not failures,
        "completionEligible": not failures,
        "gitHead": currentGitHead(),
        "completedAt": datetime.now(UTC).isoformat(),
        "matches": matches,
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print("ok: legacy landing source remains absent")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
