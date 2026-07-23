from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[2]
REPORT_PATH = ROOT / "output" / "test-runner" / "repository-simplification" / "product-module-boundaries-report.json"
CHECKS = (
    ("landing", "scripts/splitLandingRoutes.mjs"),
    ("editor", "scripts/splitTypeDomains.mjs"),
    ("editor", "scripts/splitApiDomains.mjs"),
    ("editor", "scripts/splitCurriculumMarkdown.mjs"),
    ("editor", "scripts/splitCurriculumSurface.mjs"),
)
LINE_LIMITS = {
    "landing/src/App.jsx": 150,
    "editor/src/types.ts": 10,
    "editor/src/lib/api.ts": 40,
    "editor/src/components/curriculum/curriculumMarkdownBody.tsx": 280,
    "editor/src/components/curriculum/curriculumSurface.tsx": 230,
}
FORBIDDEN_ROOT_OWNERSHIP = {
    "landing/src/App.jsx": ("function DocsPage", "function BlogPostPage", "function SearchPage", "function ToolsPage"),
    "editor/src/types.ts": ("export type CurriculumCategory", "export type AiProvider", "export type TaskDefinition"),
    "editor/src/lib/api.ts": ("curriculumCategories:", "runAutomationCell:", "teacherChat:"),
    "editor/src/components/curriculum/curriculumMarkdownBody.tsx": ("function MediaCell", "function MarkdownBlock", "function LearningTable"),
    "editor/src/components/curriculum/curriculumSurface.tsx": ("function CurriculumSectionCard", "function CurriculumLearningCell"),
}


def currentGitHead() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=ROOT, check=True, capture_output=True, text=True
    )
    return result.stdout.strip()


def main() -> int:
    failures: list[str] = []
    commandResults: list[dict[str, object]] = []
    for cwd, script in CHECKS:
        result = subprocess.run(
            ["node", script],
            cwd=ROOT / cwd,
            capture_output=True,
            text=True,
        )
        commandResults.append({
            "cwd": cwd,
            "script": script,
            "returnCode": result.returncode,
            "output": (result.stdout + result.stderr).strip(),
        })
        if result.returncode != 0:
            failures.append(f"module boundary check failed: {cwd}/{script}")

    lineCounts: dict[str, int] = {}
    for relativePath, limit in LINE_LIMITS.items():
        source = (ROOT / relativePath).read_text(encoding="utf-8")
        lineCount = len(source.splitlines())
        lineCounts[relativePath] = lineCount
        if lineCount > limit:
            failures.append(f"composition module exceeds ownership limit: {relativePath}={lineCount}>{limit}")
        for token in FORBIDDEN_ROOT_OWNERSHIP[relativePath]:
            if token in source:
                failures.append(f"composition module regained domain symbol: {relativePath}: {token}")

    report = {
        "schemaVersion": 1,
        "gate": "repository-simplification",
        "check": "product-module-boundaries",
        "passed": not failures,
        "completionEligible": not failures,
        "gitHead": currentGitHead(),
        "completedAt": datetime.now(UTC).isoformat(),
        "lineCounts": lineCounts,
        "commands": commandResults,
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print("ok: product module ownership boundaries verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
