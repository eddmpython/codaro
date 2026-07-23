from __future__ import annotations

from datetime import UTC, datetime
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from typing import Any

import yaml

from codaro.curriculum.localStrongCheck import runLocalStrongCheck


ROOT = Path(__file__).resolve().parents[2]
FIXTURE_PATH = ROOT / "tests/learning/fixtures/verticalSlice/weak-no-error-only.yml"
REPORT_PATH = ROOT / "output/test-runner/learning-vertical-slice/learning-vertical-slice-report.json"
PRODUCT_BROWSER_PATH = ROOT / "tests/surface/verifyProductExperiencePlaywright.py"
PRODUCT_BROWSER_REPORT_PATH = (
    ROOT / "output/test-runner/learning-vertical-slice/product-experience-report.json"
)
LESSON_PATTERNS = (
    (ROOT / "curricula/python/automation/os/fileOps", "01_*.yaml", "fileOps"),
    (ROOT / "curricula/python/automation/os/fileOps", "06_*.yaml", "fileOps"),
    (ROOT / "curricula/python/automation/os/watchSched", "05_*.yaml", "watchSched"),
)
ASSESSMENT_KEYS = ("masteryVariants", "transferVariants", "retrievalVariants")
ASSESSMENT_MODES = {
    "masteryVariants": "mastery",
    "transferVariants": "transfer",
    "retrievalVariants": "retrieval",
}


def loadMapping(path: Path) -> dict[str, Any]:
    payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"YAML root must be a mapping: {path.relative_to(ROOT).as_posix()}")
    return payload


def rejectWeakFixture() -> dict[str, Any]:
    fixture = loadMapping(FIXTURE_PATH)
    check = fixture.get("candidateCheck")
    expected = fixture.get("expectedFailure")
    if not isinstance(check, dict) or not isinstance(expected, dict):
        raise ValueError("vertical slice negative fixture is incomplete")
    rejected = not (
        check.get("kind") == "behavior"
        and check.get("strength") == "strong"
        and check.get("executor") == "browser-worker"
        and isinstance(check.get("fixture"), dict)
        and isinstance(check.get("payload"), dict)
        and isinstance(check["payload"].get("cases"), list)
        and bool(check["payload"]["cases"])
    )
    if not rejected or expected.get("code") != "strong-behavior-check-required":
        raise ValueError("weak no-error fixture was not rejected by the vertical slice contract")
    return {
        "expectedFailure": expected["code"],
        "path": FIXTURE_PATH.relative_to(ROOT).as_posix(),
        "rejected": True,
    }


def lessonPaths() -> list[Path]:
    paths: list[Path] = []
    for directory, pattern, _category in LESSON_PATTERNS:
        matches = sorted(directory.glob(pattern))
        if len(matches) != 1:
            raise ValueError(f"expected one W0 lesson for {directory.relative_to(ROOT)}/{pattern}")
        paths.append(matches[0])
    return paths


def verifyLessons() -> dict[str, Any]:
    checkIds: set[str] = set()
    facts: list[dict[str, Any]] = []
    strongSectionCount = 0
    behaviorCaseCount = 0
    negativeCaseCount = 0
    assessmentSolutionCount = 0
    assessmentBehaviorCaseCount = 0
    assessmentCounts = {key: 0 for key in ASSESSMENT_KEYS}
    for path in lessonPaths():
        lesson = loadMapping(path)
        sections = lesson.get("sections")
        if not isinstance(sections, list):
            raise ValueError(f"sections missing: {path.relative_to(ROOT).as_posix()}")
        lessonStrongCount = 0
        lessonCaseCount = 0
        for section in sections:
            if not isinstance(section, dict):
                continue
            check = section.get("check")
            exercise = section.get("exercise")
            if not isinstance(check, dict) or check.get("strength") != "strong":
                continue
            if (
                check.get("version") != 1
                or check.get("kind") != "behavior"
                or check.get("executor") != "browser-worker"
                or not isinstance(exercise, dict)
                or not isinstance(exercise.get("solution"), str)
                or not exercise["solution"].strip()
            ):
                raise ValueError(f"invalid strong behavior section: {path.name}/{section.get('id')}")
            checkId = check.get("id")
            if not isinstance(checkId, str) or not checkId or checkId in checkIds:
                raise ValueError(f"missing or duplicate CheckSpec id: {checkId}")
            checkIds.add(checkId)
            payload = check.get("payload")
            cases = payload.get("cases") if isinstance(payload, dict) else None
            if not isinstance(cases, list) or not cases:
                raise ValueError(f"behavior cases missing: {checkId}")
            result = runLocalStrongCheck(check, exercise["solution"])
            if result.get("passed") is not True or result.get("executor") != "local-sandbox":
                raise ValueError(f"authored solution failed Local strong check: {checkId}")
            lessonStrongCount += 1
            lessonCaseCount += len(cases)
            negativeCaseCount += sum(1 for case in cases if isinstance(case, dict) and case.get("expectedException"))
        if lessonStrongCount != 4:
            raise ValueError(f"expected four strong W0 sections: {path.name}, got {lessonStrongCount}")
        assessment = lesson.get("assessment") if isinstance(lesson.get("assessment"), dict) else {}
        lessonAssessments = {
            key: len(assessment.get(key, [])) if isinstance(assessment.get(key), list) else 0
            for key in ASSESSMENT_KEYS
        }
        for key, count in lessonAssessments.items():
            assessmentCounts[key] += count
            variants = assessment.get(key)
            if not isinstance(variants, list):
                raise ValueError(f"assessment variants missing: {path.name}/{key}")
            for variant in variants:
                if not isinstance(variant, dict):
                    raise ValueError(f"assessment variant is not an object: {path.name}/{key}")
                check = variant.get("check")
                exercise = variant.get("exercise")
                sourceSectionIds = variant.get("sourceSectionIds")
                if (
                    variant.get("mode") != ASSESSMENT_MODES[key]
                    or variant.get("unseen") is not True
                    or not isinstance(sourceSectionIds, list)
                    or not sourceSectionIds
                    or not isinstance(check, dict)
                    or check.get("version") != 1
                    or check.get("kind") != "behavior"
                    or check.get("strength") != "strong"
                    or check.get("executor") != "browser-worker"
                    or not isinstance(exercise, dict)
                    or not isinstance(exercise.get("solution"), str)
                    or not exercise["solution"].strip()
                ):
                    raise ValueError(f"invalid assessment behavior: {path.name}/{key}")
                checkId = check.get("id")
                if not isinstance(checkId, str) or not checkId or checkId in checkIds:
                    raise ValueError(f"missing or duplicate assessment CheckSpec id: {checkId}")
                checkIds.add(checkId)
                payload = check.get("payload")
                cases = payload.get("cases") if isinstance(payload, dict) else None
                if not isinstance(cases, list) or not cases:
                    raise ValueError(f"assessment behavior cases missing: {checkId}")
                result = runLocalStrongCheck(check, exercise["solution"])
                if result.get("passed") is not True or result.get("executor") != "local-sandbox":
                    raise ValueError(f"assessment solution failed Local strong check: {checkId}")
                assessmentSolutionCount += 1
                assessmentBehaviorCaseCount += len(cases)
        strongSectionCount += lessonStrongCount
        behaviorCaseCount += lessonCaseCount
        facts.append({
            "assessmentVariants": lessonAssessments,
            "behaviorCases": lessonCaseCount,
            "lessonRef": f"{lesson.get('meta', {}).get('category')}/{path.stem}",
            "strongSections": lessonStrongCount,
        })
    return {
        "assessmentBehaviorCaseCount": assessmentBehaviorCaseCount,
        "assessmentSolutionCount": assessmentSolutionCount,
        "assessmentVariants": assessmentCounts,
        "behaviorCaseCount": behaviorCaseCount,
        "lessons": facts,
        "negativeCaseCount": negativeCaseCount,
        "strongSectionCount": strongSectionCount,
    }


def verifyBrowserProgression() -> dict[str, Any]:
    command = (
        "uv", "run", "--with", "playwright", "python", "-X", "utf8",
        str(PRODUCT_BROWSER_PATH.relative_to(ROOT)),
    )
    environment = os.environ.copy()
    environment["CODARO_PRODUCT_CASE"] = "w0-assessment-progression"
    environment["CODARO_PRODUCT_REPORT_PATH"] = str(PRODUCT_BROWSER_REPORT_PATH.relative_to(ROOT))
    result = subprocess.run(
        command,
        cwd=ROOT,
        env=environment,
        capture_output=True,
        text=True,
        timeout=600,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()[-1_200:]
        raise ValueError(f"W0 assessment browser progression failed: {detail}")
    report = json.loads(PRODUCT_BROWSER_REPORT_PATH.read_text(encoding="utf-8"))
    cases = report.get("cases")
    expectedWebNames = {
        "web-pathlib-assessment-progression-desktop",
        "web-zip-assessment-progression-desktop",
        "web-schedule-assessment-progression-desktop",
    }
    expectedLocalNames = {
        "local-native-pathlib-assessment-progression-desktop",
        "local-native-zip-assessment-progression-desktop",
        "local-native-schedule-assessment-progression-desktop",
    }
    expectedNames = expectedWebNames | expectedLocalNames
    if not isinstance(cases, list) or {case.get("name") for case in cases if isinstance(case, dict)} != expectedNames:
        raise ValueError("W0 assessment browser report does not contain the six required Web/Local cases")
    localEvidenceByName = {
        "local-native-pathlib-assessment-progression-desktop": 1,
        "local-native-zip-assessment-progression-desktop": 2,
        "local-native-schedule-assessment-progression-desktop": 3,
    }
    facts: list[dict[str, Any]] = []
    for case in cases:
        if not isinstance(case, dict):
            raise ValueError("W0 assessment browser case is not an object")
        audit = case.get("audit")
        name = str(case.get("name"))
        if name in expectedWebNames:
            expectedEvidence = 3 if name == "web-pathlib-assessment-progression-desktop" else 1
            expectedCompleted = 1
            expectedTransfer = (
                0 if name == "web-pathlib-assessment-progression-desktop" else 1
            )
            complete = (
                isinstance(audit, dict)
                and not case.get("failures")
                and audit.get("transferSectionCount") == expectedTransfer
                and audit.get("webStrongEvidenceEventCount") == expectedEvidence
                and audit.get("webEvidenceSummaryCount") == expectedEvidence
                and audit.get("webCompletedLessonCount") == expectedCompleted
                and audit.get("forbiddenLearningControls") == []
            )
            runtimeTier = "web"
        else:
            expectedEvidence = localEvidenceByName[name]
            expectedCompleted = {
                "local-native-pathlib-assessment-progression-desktop": 1,
                "local-native-zip-assessment-progression-desktop": 2,
                "local-native-schedule-assessment-progression-desktop": 1,
            }[name]
            complete = (
                isinstance(audit, dict)
                and not case.get("failures")
                and audit.get("transferSectionCount") == 1
                and audit.get("retrievalSectionCount") == 0
                and audit.get("webEvidenceSummaryCount") == expectedEvidence
                and audit.get("learningEvidenceRuntime") == "local"
                and audit.get("webCompletedLessonCount") == expectedCompleted
                and audit.get("forbiddenLearningControls") == []
            )
            runtimeTier = "local"
        if not complete:
            raise ValueError(f"W0 assessment browser evidence is incomplete: {name}")
        facts.append({
            "evidenceEvents": expectedEvidence,
            "name": name,
            "runtimeTier": runtimeTier,
            "transferAutoProvided": True,
        })
    return {
        "browser": report.get("browser"),
        "caseCount": len(facts),
        "cases": facts,
        "command": " ".join(command),
        "reportPath": PRODUCT_BROWSER_REPORT_PATH.relative_to(ROOT).as_posix(),
    }


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    facts: dict[str, Any] = {}
    try:
        facts["negativeFixture"] = rejectWeakFixture()
        facts["verticalSlice"] = verifyLessons()
        facts["browserProgression"] = verifyBrowserProgression()
    except (OSError, ValueError, subprocess.SubprocessError, yaml.YAMLError) as error:
        failures.append(str(error))
    assessmentCounts = facts.get("verticalSlice", {}).get("assessmentVariants", {})
    missingAssessmentModes = [key for key in ASSESSMENT_KEYS if assessmentCounts.get(key, 0) < 3]
    machineEligible = not failures and not missingAssessmentModes
    completionBlockers = [
        f"W0 assessment mode has fewer than three authored variants: {key}"
        for key in missingAssessmentModes
    ]
    completionBlockers.append("W0 vertical slice has no independent human learning review")
    payload = {
        "schemaVersion": 1,
        "audit": "learning-vertical-slice",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "machineEligible": machineEligible,
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
        print("FAIL: learning vertical slice audit failed", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    print(
        "ok: W0 vertical slice facts verified "
        f"({facts['verticalSlice']['strongSectionCount']} strong sections, "
        f"completionEligible={str(payload['completionEligible']).lower()})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
