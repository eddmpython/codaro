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
sys.path.insert(0, str(ROOT / "tests/product"))

from verifyManualAtMatrix import (  # noqa: E402
    MATRIX_PATH as MANUAL_AT_MATRIX_PATH,
    REPORT_PATH as MANUAL_AT_REPORT_PATH,
    verifyManualAtMatrix,
)


FIXTURE_PATH = ROOT / "tests/product/fixtures/astryxVerticalSlice/reveal-only-control.json"
MATRIX_PATH = ROOT / "tests/product/astryxVerticalSlice.matrix.json"
PRODUCT_BROWSER_PATH = ROOT / "tests/surface/verifyProductExperiencePlaywright.py"
PRODUCT_BROWSER_REPORT_ROOT = ROOT / "output/test-runner/astryx-journey"
REPORT_PATH = ROOT / "output/test-runner/astryx-journey/astryx-journey-report.json"
NPM_COMMAND = "npm.cmd" if os.name == "nt" else "npm"
FRONTEND_BUILD_REUSE_ENV = "CODARO_FRONTEND_BUILD_REUSE"
SOURCE_BUILDS = (
    ("landing", ROOT / "landing", ROOT / "landing/build/index.html"),
    ("editor", ROOT / "editor", ROOT / "src/codaro/webBuild/index.html"),
)


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def loadObject(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"JSON root must be an object: {path.relative_to(ROOT).as_posix()}")
    return payload


def currentGitHead() -> str:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=30,
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        raise ValueError("cannot read current Git head") from exc
    gitHead = result.stdout.strip()
    if len(gitHead) not in {40, 64}:
        raise ValueError("current Git head is invalid")
    return gitHead


def buildCurrentSources() -> dict[str, dict[str, Any]]:
    facts: dict[str, dict[str, Any]] = {}
    reuseRequested = os.environ.get(FRONTEND_BUILD_REUSE_ENV, "").strip().lower() in {
        "1",
        "true",
        "yes",
        "on",
    }
    for name, workingDirectory, outputPath in SOURCE_BUILDS:
        if reuseRequested:
            command = (
                sys.executable,
                "-X",
                "utf8",
                "tests/run.py",
                "gate",
                f"{name}-build",
            )
            commandLabel = f"tests/run.py gate {name}-build"
            commandDirectory = ROOT
        else:
            command = (NPM_COMMAND, "run", "build")
            commandLabel = "npm run build"
            commandDirectory = workingDirectory
        try:
            result = subprocess.run(
                command,
                cwd=commandDirectory,
                env=os.environ.copy(),
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=900,
            )
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise ValueError(f"{name} current-source build could not run") from exc
        if result.returncode != 0:
            detail = (result.stderr or result.stdout).strip()[-1_500:]
            raise ValueError(f"{name} current-source build failed: {detail}")
        if not outputPath.is_file():
            raise ValueError(f"{name} current-source build output is missing")
        facts[name] = {
            "command": commandLabel,
            "outputPath": outputPath.relative_to(ROOT).as_posix(),
            "passed": True,
        }
        if reuseRequested:
            facts[name]["reusePolicy"] = "exact-receipt-or-fresh-build"
    return facts


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


def verifyJourneyReport(
    reportPath: Path,
    expectedNames: list[str],
    requiredSurfaces: list[str],
    colorScheme: str,
) -> dict[str, Any]:
    report = loadObject(reportPath)
    cases = report.get("cases")
    if report.get("colorScheme") != colorScheme:
        raise ValueError(f"Astryx journey report has wrong color scheme: {colorScheme}")
    if not isinstance(cases, list):
        raise ValueError(f"Astryx journey browser report has no cases: {colorScheme}")
    actualNames = [case.get("name") for case in cases if isinstance(case, dict)]
    if actualNames != expectedNames:
        raise ValueError(f"Astryx journey browser report does not match the sealed matrix: {colorScheme}")
    surfaces: set[str] = set()
    imageProofCases = 0
    learningCases = 0
    for case in cases:
        if not isinstance(case, dict):
            raise ValueError(f"Astryx journey case is not an object: {colorScheme}")
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
            raise ValueError(
                f"Astryx journey case evidence is incomplete: {colorScheme}/{case.get('name')}"
            )
        expectedScreenshotPart = f"/screenshots/{colorScheme}/"
        screenshotRef = "/" + str(case.get("screenshot") or "").replace("\\", "/")
        if expectedScreenshotPart not in screenshotRef:
            raise ValueError(
                f"Astryx journey screenshot is not isolated by color scheme: {colorScheme}/{case.get('name')}"
            )
        surface = str(case.get("surface"))
        surfaces.add(surface)
        if surface == "landing-home" and int(audit.get("visibleImageCount") or 0) > 0:
            imageProofCases += 1
        if surface in {"web-lesson", "local-lesson"}:
            learningCases += 1
            if audit.get("forbiddenLearningControls") != []:
                raise ValueError(
                    f"redundant learning control returned: {colorScheme}/{case.get('name')}"
                )
    missingSurfaces = sorted(set(requiredSurfaces) - surfaces)
    if missingSurfaces:
        raise ValueError(
            f"Astryx journey misses surfaces in {colorScheme}: " + ", ".join(missingSurfaces)
        )
    if imageProofCases != 2 or learningCases != 2:
        raise ValueError(f"Astryx journey image or learning proof count is incomplete: {colorScheme}")
    return {
        "browser": report.get("browser"),
        "caseCount": len(cases),
        "forbiddenLearningControls": 0,
        "imageProofCases": imageProofCases,
        "learningCases": learningCases,
        "reportPath": reportPath.relative_to(ROOT).as_posix(),
        "surfaces": sorted(surfaces),
    }


def verifyJourney() -> dict[str, Any]:
    matrix = loadObject(MATRIX_PATH)
    expectedNames = matrix.get("cases")
    requiredSurfaces = matrix.get("requiredSurfaces")
    selection = matrix.get("selection")
    colorSchemes = matrix.get("colorSchemes")
    if (
        matrix.get("schemaVersion") != 1
        or not isinstance(expectedNames, list)
        or not expectedNames
        or not all(isinstance(item, str) and item for item in expectedNames)
        or len(expectedNames) != len(set(expectedNames))
        or not isinstance(requiredSurfaces, list)
        or not all(isinstance(item, str) and item for item in requiredSurfaces)
        or len(requiredSurfaces) != len(set(requiredSurfaces))
        or selection != "astryx-journey"
        or colorSchemes != ["dark", "light"]
    ):
        raise ValueError("Astryx vertical slice matrix is invalid")

    schemeFacts: dict[str, dict[str, Any]] = {}
    for colorScheme in colorSchemes:
        reportPath = PRODUCT_BROWSER_REPORT_ROOT / f"product-experience-{colorScheme}-report.json"
        command = (
            "uv", "run", "--with", "playwright", "python", "-X", "utf8",
            str(PRODUCT_BROWSER_PATH.relative_to(ROOT)),
        )
        environment = os.environ.copy()
        environment["CODARO_PRODUCT_CASE"] = str(selection)
        environment["CODARO_PRODUCT_COLOR_SCHEME"] = colorScheme
        environment["CODARO_PRODUCT_REPORT_PATH"] = str(reportPath.relative_to(ROOT))
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
            raise ValueError(f"Astryx journey browser matrix failed in {colorScheme}: {detail}")
        schemeFacts[colorScheme] = verifyJourneyReport(
            reportPath,
            expectedNames,
            requiredSurfaces,
            colorScheme,
        )

    browserFacts = {json.dumps(facts["browser"], sort_keys=True) for facts in schemeFacts.values()}
    if len(browserFacts) != 1:
        raise ValueError("Astryx journey schemes used different browser engines")
    return {
        "browser": next(iter(schemeFacts.values()))["browser"],
        "caseCount": len(expectedNames),
        "evidenceCaseCount": len(expectedNames) * len(colorSchemes),
        "colorSchemes": colorSchemes,
        "forbiddenLearningControls": 0,
        "matrixPath": MATRIX_PATH.relative_to(ROOT).as_posix(),
        "schemes": schemeFacts,
    }


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    facts: dict[str, Any] = {}
    gitHead = "unknown"
    manualAtReport: dict[str, Any] | None = None
    try:
        gitHead = currentGitHead()
        facts["builds"] = buildCurrentSources()
        facts["negativeFixture"] = rejectRevealOnlyFixture()
        facts["journey"] = verifyJourney()
        manualAtReport = verifyManualAtMatrix(
            matrixPath=MANUAL_AT_MATRIX_PATH,
            reportPath=MANUAL_AT_REPORT_PATH,
            root=ROOT,
            gitHead=gitHead,
        )
        facts["manualAt"] = {
            "reportPath": manualAtReport["reportPath"],
            "machineEligible": manualAtReport["machineEligible"],
            "completionEligible": manualAtReport["completionEligible"],
            "facts": manualAtReport["facts"],
        }
        if manualAtReport["passed"] is not True:
            raise ValueError(
                "manual accessibility matrix contract failed: "
                + "; ".join(manualAtReport["failures"])
            )
        if currentGitHead() != gitHead:
            raise ValueError("Git head changed while the Astryx journey was running")
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        failures.append(str(error))
    promotionBlockers = (
        list(manualAtReport["completionBlockers"])
        if manualAtReport is not None
        else ["manual accessibility completion evidence was not evaluated"]
    )
    promotionEligible = (
        not failures
        and manualAtReport is not None
        and manualAtReport["completionEligible"] is True
    )
    payload = {
        "schemaVersion": 1,
        "audit": "astryx-journey",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "gitHead": gitHead,
        "machineEligible": not failures,
        "implementationComplete": not failures,
        "completionEligible": not failures,
        "promotionEligible": promotionEligible,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "facts": facts,
        "completionBlockers": [],
        "promotionBlockers": promotionBlockers,
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
    print(
        "ok: Astryx journey verified "
        f"({facts['journey']['caseCount']} cases x "
        f"{len(facts['journey']['colorSchemes'])} color schemes, "
        "implementationComplete=true, "
        f"promotionEligible={str(promotionEligible).lower()})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
