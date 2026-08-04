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
RUNNER = ROOT / "tests" / "surface" / "verifyProductExperiencePlaywright.py"
REPORT_ROOT = ROOT / "output" / "test-runner" / "instructional-visual-browser"
REPORT_PATH = REPORT_ROOT / "instructional-visual-browser-report.json"
EXPECTED_ASSETS = {
    "instructional-ai-1440": "aiIntegration",
    "instructional-automation-390": "learningAutomation",
    "instructional-data-analysis-390": "dataAnalysis",
    "instructional-data-visualization-768": "dataVisualization",
    "instructional-developer-768": "developerLiteracy",
    "instructional-image-320": "imageVision",
    "instructional-python-320": "pythonFundamentals",
    "instructional-statistics-1440": "statisticsMachineLearning",
}


def main() -> int:
    startedAt = datetime.now(UTC).isoformat()
    started = time.monotonic()
    failures: list[str] = []
    schemes: dict[str, Any] = {}
    for colorScheme in ("light", "dark"):
        sourceReport = REPORT_ROOT / f"instructional-visual-{colorScheme}.json"
        environment = os.environ.copy()
        environment["CODARO_PRODUCT_CASE"] = "instructional-visuals"
        environment["CODARO_PRODUCT_COLOR_SCHEME"] = colorScheme
        environment["CODARO_PRODUCT_GATE"] = "instructional-visual-browser"
        environment["CODARO_PRODUCT_REPORT_PATH"] = sourceReport.relative_to(ROOT).as_posix()
        result = subprocess.run(
            ("uv", "run", "--with", "playwright", "python", "-X", "utf8", str(RUNNER)),
            cwd=ROOT,
            env=environment,
            capture_output=True,
            text=True,
            timeout=1700,
            check=False,
        )
        if result.returncode != 0 or not sourceReport.is_file():
            detail = (result.stderr or result.stdout).strip()[-1_500:]
            failures.append(f"{colorScheme}: browser matrix failed: {detail}")
            continue
        report = json.loads(sourceReport.read_text(encoding="utf-8"))
        caseFailures, facts = validateReport(report, colorScheme)
        failures.extend(caseFailures)
        schemes[colorScheme] = facts

    payload = {
        "gate": "instructional-visual-browser",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "gitHead": gitHead(),
        "startedAt": startedAt,
        "completedAt": datetime.now(UTC).isoformat(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "assetCount": len(EXPECTED_ASSETS),
        "viewportWidths": [320, 390, 768, 1440],
        "colorSchemes": ["light", "dark"],
        "schemes": schemes,
        "failures": failures,
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print("ok: instructional visual browser (8 assets, 4 widths, light/dark)")
    return 0


def validateReport(report: dict[str, Any], colorScheme: str) -> tuple[list[str], dict[str, Any]]:
    failures: list[str] = []
    cases = report.get("cases")
    if not isinstance(cases, list):
        return [f"{colorScheme}: report has no cases"], {}
    casesByName = {
        str(case.get("name")): case
        for case in cases
        if isinstance(case, dict)
    }
    if set(casesByName) != set(EXPECTED_ASSETS):
        failures.append(
            f"{colorScheme}: instructional case set drifted: {sorted(casesByName)}"
        )
    facts: dict[str, Any] = {}
    for caseName, assetId in EXPECTED_ASSETS.items():
        case = casesByName.get(caseName)
        if case is None:
            continue
        audit = case.get("audit", {})
        screenshot = ROOT / str(case.get("screenshot", ""))
        caseFailures = [
            *case.get("failures", []),
            *case.get("consoleErrors", []),
            *case.get("httpFailures", []),
            *case.get("assetFailures", []),
        ]
        if caseFailures:
            failures.append(f"{colorScheme}/{caseName}: {caseFailures[:3]}")
        if audit.get("learningVisualAssetIds") != [assetId]:
            failures.append(
                f"{colorScheme}/{caseName}: expected {assetId}, "
                f"got {audit.get('learningVisualAssetIds')}"
            )
        if (
            audit.get("learningVisualQuestionCount") != 1
            or audit.get("learningVisualDecisionCount") != 1
            or audit.get("missingImageAlt") != 0
            or audit.get("brokenImages")
            or audit.get("documentWidth") != audit.get("viewportWidth")
        ):
            failures.append(f"{colorScheme}/{caseName}: accessibility/layout audit drifted")
        if not screenshot.is_file() or screenshot.stat().st_size < 1_024:
            failures.append(f"{colorScheme}/{caseName}: screenshot is missing or empty")
        facts[caseName] = {
            "assetId": assetId,
            "screenshot": case.get("screenshot"),
            "viewport": case.get("viewport"),
        }
    return failures, facts


def gitHead() -> str:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout.strip()


if __name__ == "__main__":
    raise SystemExit(main())
