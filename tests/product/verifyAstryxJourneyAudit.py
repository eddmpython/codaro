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
FIXTURE_PATH = ROOT / "tests/product/fixtures/astryxVerticalSlice/reveal-only-control.json"
MATRIX_PATH = ROOT / "tests/product/astryxVerticalSlice.matrix.json"
PRODUCT_BROWSER_PATH = ROOT / "tests/surface/verifyProductExperiencePlaywright.py"
PRODUCT_BROWSER_REPORT_PATH = ROOT / "output/test-runner/astryx-journey/product-experience-report.json"
REPORT_PATH = ROOT / "output/test-runner/astryx-journey/astryx-journey-report.json"


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def loadObject(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"JSON root must be an object: {path.relative_to(ROOT).as_posix()}")
    return payload


def rejectRevealOnlyFixture() -> dict[str, Any]:
    fixture = loadObject(FIXTURE_PATH)
    candidate = fixture.get("candidate")
    expectedFailure = fixture.get("expectedFailure")
    control = candidate.get("control") if isinstance(candidate, dict) else None
    rejected = (
        isinstance(control, dict)
        and control.get("intent") == "reveal-only"
        and candidate.get("contentAlreadyAvailableFromRunState") is True
    )
    if not rejected or not isinstance(expectedFailure, dict) or expectedFailure.get("code") != "redundant-reveal-control":
        raise ValueError("reveal-only negative fixture was not rejected")
    return {
        "expectedFailure": expectedFailure["code"],
        "path": FIXTURE_PATH.relative_to(ROOT).as_posix(),
        "rejected": True,
    }


def verifyJourney() -> dict[str, Any]:
    matrix = loadObject(MATRIX_PATH)
    expectedNames = matrix.get("cases")
    requiredSurfaces = matrix.get("requiredSurfaces")
    selection = matrix.get("selection")
    if (
        not isinstance(expectedNames, list)
        or len(expectedNames) != 11
        or not all(isinstance(item, str) and item for item in expectedNames)
        or not isinstance(requiredSurfaces, list)
        or not all(isinstance(item, str) and item for item in requiredSurfaces)
        or selection != "astryx-journey"
    ):
        raise ValueError("Astryx vertical slice matrix is invalid")
    command = (
        "uv", "run", "--with", "playwright", "python", "-X", "utf8",
        str(PRODUCT_BROWSER_PATH.relative_to(ROOT)),
    )
    environment = os.environ.copy()
    environment["CODARO_PRODUCT_CASE"] = str(selection)
    environment["CODARO_PRODUCT_REPORT_PATH"] = str(PRODUCT_BROWSER_REPORT_PATH.relative_to(ROOT))
    result = subprocess.run(
        command,
        cwd=ROOT,
        env=environment,
        capture_output=True,
        text=True,
        timeout=900,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()[-1_500:]
        raise ValueError(f"Astryx journey browser matrix failed: {detail}")
    report = loadObject(PRODUCT_BROWSER_REPORT_PATH)
    cases = report.get("cases")
    if not isinstance(cases, list):
        raise ValueError("Astryx journey browser report has no cases")
    actualNames = [case.get("name") for case in cases if isinstance(case, dict)]
    if set(actualNames) != set(expectedNames) or len(actualNames) != len(expectedNames):
        raise ValueError("Astryx journey browser report does not match the sealed matrix")
    surfaces: set[str] = set()
    imageProofCases = 0
    learningCases = 0
    for case in cases:
        if not isinstance(case, dict):
            raise ValueError("Astryx journey case is not an object")
        audit = case.get("audit")
        screenshot = ROOT / str(case.get("screenshot") or "")
        if (
            not isinstance(audit, dict)
            or case.get("failures")
            or audit.get("rootTheme") != "codaro"
            or audit.get("brokenImages")
            or audit.get("unnamedButtons")
            or audit.get("overlaps")
            or not screenshot.is_file()
            or screenshot.stat().st_size < 1_024
        ):
            raise ValueError(f"Astryx journey case evidence is incomplete: {case.get('name')}")
        surface = str(case.get("surface"))
        surfaces.add(surface)
        if surface == "landing-home" and int(audit.get("visibleImageCount") or 0) > 0:
            imageProofCases += 1
        if surface in {"web-lesson", "local-lesson"}:
            learningCases += 1
            if audit.get("forbiddenLearningControls") != []:
                raise ValueError(f"redundant learning control returned: {case.get('name')}")
    missingSurfaces = sorted(set(requiredSurfaces) - surfaces)
    if missingSurfaces:
        raise ValueError("Astryx journey misses surfaces: " + ", ".join(missingSurfaces))
    if imageProofCases != 2 or learningCases != 2:
        raise ValueError("Astryx journey image or learning proof count is incomplete")
    return {
        "browser": report.get("browser"),
        "caseCount": len(cases),
        "forbiddenLearningControls": 0,
        "imageProofCases": imageProofCases,
        "learningCases": learningCases,
        "matrixPath": MATRIX_PATH.relative_to(ROOT).as_posix(),
        "reportPath": PRODUCT_BROWSER_REPORT_PATH.relative_to(ROOT).as_posix(),
        "surfaces": sorted(surfaces),
    }


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    facts: dict[str, Any] = {}
    try:
        facts["negativeFixture"] = rejectRevealOnlyFixture()
        facts["journey"] = verifyJourney()
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        failures.append(str(error))
    completionBlockers = [
        "actual Windows WebView2 900x640 and 1440x900 capture matrix is absent",
        "NVDA, VoiceOver, TalkBack, Narrator, IME, and forced-colors manual reports are absent",
        "12-person facilitated first-strong-check study is absent",
        "independent product-design and accessibility review is absent",
    ]
    payload = {
        "schemaVersion": 1,
        "audit": "astryx-journey",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "machineEligible": not failures,
        "completionEligible": False,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "facts": facts,
        "completionBlockers": completionBlockers,
        "failures": failures,
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        print("FAIL: Astryx journey audit failed", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    print(f"ok: Astryx journey verified ({facts['journey']['caseCount']} cases, completionEligible=false)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
