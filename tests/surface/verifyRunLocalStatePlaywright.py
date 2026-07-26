from __future__ import annotations

import importlib.util
import json
import os
from pathlib import Path
import sys
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
RUNNER = ROOT / "tests" / "surface" / "verifyProductExperiencePlaywright.py"
REPORT_PATH = ROOT / "output/test-runner/run-local-state-browser/run-local-state-report.json"
EXPECTED_CASES = [
    "web-automation-compact",
    "web-run-compact",
    "web-run-desktop",
    "local-run-minimum",
    "local-home-minimum",
    "local-automation-minimum",
]
STATE_CASES = {"web-run-desktop", "local-run-minimum"}


def loadObject(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"report root must be an object: {path}")
    return payload


def validateReport() -> list[str]:
    failures: list[str] = []
    report = loadObject(REPORT_PATH)
    cases = report.get("cases")
    if not isinstance(cases, list):
        return ["Run/Local report has no case list"]
    caseNames = [case.get("name") for case in cases if isinstance(case, dict)]
    if caseNames != EXPECTED_CASES:
        failures.append(f"Run/Local case order drifted: {caseNames}")
    if report.get("gate") != "run-local-state-browser":
        failures.append(f"Run/Local gate identity drifted: {report.get('gate')}")
    for case in cases:
        if not isinstance(case, dict) or case.get("name") not in STATE_CASES:
            continue
        evidence = case.get("notebookStateEvidence")
        if not isinstance(evidence, dict):
            failures.append(f"{case.get('name')}: notebook state evidence is missing")
            continue
        if evidence.get("statusSequence") != ["running", "success", "running", "error"]:
            failures.append(f"{case.get('name')}: notebook state sequence drifted")
        screenshots = evidence.get("screenshots")
        if not isinstance(screenshots, dict) or set(screenshots) != {"running", "success", "error"}:
            failures.append(f"{case.get('name')}: notebook state screenshots are incomplete")
            continue
        for state, screenshotRef in screenshots.items():
            screenshotPath = ROOT / str(screenshotRef)
            if not screenshotPath.is_file() or screenshotPath.stat().st_size < 1_024:
                failures.append(
                    f"{case.get('name')}: {state} screenshot is missing or empty"
                )
    return failures


def main() -> int:
    os.environ["CODARO_PRODUCT_CASE"] = "run-local-state"
    os.environ["CODARO_PRODUCT_GATE"] = "run-local-state-browser"
    os.environ["CODARO_PRODUCT_REPORT_PATH"] = str(REPORT_PATH.relative_to(ROOT))
    spec = importlib.util.spec_from_file_location("codaroRunLocalStatePlaywright", RUNNER)
    if spec is None or spec.loader is None:
        raise RuntimeError("Run/Local Playwright runner could not be loaded")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    exitCode = int(module.main())
    if exitCode != 0:
        return exitCode
    failures = validateReport()
    if not failures:
        print("ok: run-local-state-browser (6 cases, 320px and Web/Local states)")
        return 0
    report = loadObject(REPORT_PATH)
    report["passed"] = False
    report["status"] = "failed"
    report["failures"] = [*report.get("failures", []), *failures]
    REPORT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    for failure in failures:
        print(f"FAIL: {failure}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
