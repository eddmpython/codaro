from __future__ import annotations

from datetime import UTC, datetime
import json
import os
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[2]
SURFACE = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumSurface.tsx"
SECTION_RENDERER = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumSectionRenderer.tsx"
HOME = ROOT / "editor" / "src" / "components" / "curriculum" / "curriculumHome.tsx"
SIDEBAR = ROOT / "editor" / "src" / "components" / "app" / "curriculumSidebarTree.tsx"
REVIEWS = ROOT / "editor" / "src" / "lib" / "curriculumReviews.ts"
LEGACY_CHECK_PANEL = ROOT / "editor" / "src" / "components" / "curriculum" / "checkResultPanel.tsx"
REMOVED_CLASSROOM_FRONTEND = (
    ROOT / "editor" / "src" / "components" / "classroom" / "assignmentRoomPanel.tsx",
    ROOT / "editor" / "src" / "hooks" / "useAssignmentRoomState.ts",
    ROOT / "editor" / "src" / "lib" / "classroomSession.ts",
    ROOT / "editor" / "src" / "lib" / "classroomOperations.ts",
    ROOT / "editor" / "src" / "lib" / "classroomEvents.ts",
    ROOT / "editor" / "src" / "lib" / "curriculumCheck.ts",
    ROOT / "editor" / "src" / "lib" / "curriculumCompletion.ts",
)
PRODUCT_BROWSER = ROOT / "tests" / "surface" / "verifyProductExperiencePlaywright.py"
PRODUCT_REPORT = ROOT / "output" / "test-runner" / "learning-method" / "product-experience-report.json"
REPORT = ROOT / "output" / "test-runner" / "learning-method" / "learning-flow-report.json"


def require(text: str, token: str, label: str, failures: list[str]) -> None:
    if token not in text:
        failures.append(f"missing {label}: {token}")


def reject(text: str, token: str, label: str, failures: list[str]) -> None:
    if token in text:
        failures.append(f"forbidden {label}: {token}")


def current_git_head() -> str:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=True,
        capture_output=True,
        encoding="utf-8",
    )
    return result.stdout.strip()


def main() -> int:
    paths = (SURFACE, SECTION_RENDERER, HOME, SIDEBAR, REVIEWS, PRODUCT_BROWSER)
    missing = [str(path.relative_to(ROOT)) for path in paths if not path.exists()]
    if missing:
        print(f"FAIL: missing learning flow files: {missing}", file=sys.stderr)
        return 1

    surface = SURFACE.read_text(encoding="utf-8")
    section_renderer = SECTION_RENDERER.read_text(encoding="utf-8")
    home = HOME.read_text(encoding="utf-8")
    sidebar = SIDEBAR.read_text(encoding="utf-8")
    reviews = REVIEWS.read_text(encoding="utf-8")
    browser = PRODUCT_BROWSER.read_text(encoding="utf-8")
    failures: list[str] = []
    if LEGACY_CHECK_PANEL.exists():
        failures.append("legacy checkResultPanel.tsx must stay removed from the learning surface")
    for path in REMOVED_CLASSROOM_FRONTEND:
        if path.exists():
            failures.append(f"removed classroom frontend returned: {path.relative_to(ROOT)}")

    required = {
        "automatic attempt evaluation": "void evaluateLearningAttempt(",
        "inline automatic result": "data-learning-check-result={attemptCheck.state}",
        "inline next edit hint": "다음 수정:",
        "automatic transfer and retrieval sections": "dueAssessmentBlocks(",
        "goal-first learning home": 'data-curriculum-home-goals="true"',
        "declared navigation intent": 'data-learning-control-intent="navigation"',
        "mobile navigation closes the sheet": "if (isMobile) setOpenMobile(false);",
        "canonical evidence-derived review": "reviewListFromCanonicalProjection",
        "canonical completion projection": 'data-curriculum-header-progress="true"',
        "browser redundant-control audit": "forbiddenLearningControls",
        "browser inline-hint evidence": 'case.get("requireInlineHint")',
    }
    combined = "\n".join((surface, section_renderer, home, sidebar, reviews, browser))
    for label, token in required.items():
        require(combined, token, label, failures)

    forbidden = {
        "manual verification control": 'data-learning-exercise-check="true"',
        "classroom panel in core lesson": "AssignmentRoomPanel",
        "assignment tools in core lesson": 'data-learning-assignment-tools="after-lesson"',
        "bulk lesson progress on learning home": 'data-curriculum-home-progress="true"',
        "category card grid on learning home": 'from "@/components/ui/card"',
        "self-rating pass control": "data-curriculum-home-review-pass",
        "self-rating lapse control": "data-curriculum-home-review-lapse",
    }
    learning_surface = "\n".join((surface, section_renderer, home))
    for label, token in forbidden.items():
        reject(learning_surface, token, label, failures)

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1

    environment = os.environ.copy()
    environment["CODARO_PRODUCT_CASE"] = "web-lesson-mobile"
    environment["CODARO_PRODUCT_REPORT_PATH"] = str(PRODUCT_REPORT.relative_to(ROOT))
    result = subprocess.run(
        (sys.executable, "-X", "utf8", str(PRODUCT_BROWSER)),
        cwd=ROOT,
        env=environment,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        timeout=240,
    )
    if result.stdout:
        print(result.stdout, end="")
    if result.stderr:
        print(result.stderr, end="", file=sys.stderr)
    if result.returncode != 0:
        return result.returncode

    product_report = json.loads(PRODUCT_REPORT.read_text(encoding="utf-8"))
    cases = product_report.get("cases", [])
    if product_report.get("failures") or len(cases) != 1 or cases[0].get("name") != "web-lesson-mobile":
        print("FAIL: browser evidence does not contain the focused Web lesson case", file=sys.stderr)
        return 1

    report = {
        "passed": True,
        "status": "verified",
        "gitHead": current_git_head(),
        "completedAt": datetime.now(UTC).isoformat(timespec="seconds"),
        "case": "web-lesson-mobile",
        "principles": {
            "redundantLearningControls": 0,
            "automaticCheckAfterRun": True,
            "inlineHintAfterFailure": True,
            "requiredOutcomeCreditCompletion": True,
            "automaticTransferSection": True,
            "assignmentToolsInCoreLesson": 0,
        },
        "browser": product_report.get("browser"),
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("ok: learning flow adds no redundant confirmation click")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
