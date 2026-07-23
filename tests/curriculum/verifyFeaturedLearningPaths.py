from __future__ import annotations

import sys
import time
from typing import Any

from codaro.curriculum.lessonGraph import buildLessonGraph
from codaro.curriculum.planComposer import PlanGoal, composeMasterPlan
from codaro.curriculum.studyLoader import StudyLoader
from codaro.curriculum.taxonomy import loadTaxonomy

from learningLedgerAudit import (
    CURRICULA_ROOT,
    ROOT,
    contentRows,
    currentGitHead,
    curriculumPayloads,
    isStrongCheckSpec,
    utcTimestamp,
    validAssessmentVariants,
    writeReport,
)


REPORT_PATH = ROOT / "output/test-runner/learning-content/featured-learning-paths-report.json"
FEATURED_PATH_IDS = (
    "pythonFoundation",
    "dataReporting",
    "dataVisualization",
    "fileAutomation",
    "officeAutomation",
    "webMonitoring",
)


def hasStrongMastery(payload: dict[str, Any]) -> bool:
    sections = payload.get("sections") if isinstance(payload.get("sections"), list) else []
    return bool(validAssessmentVariants(payload, "mastery")) or any(
        isinstance(section, dict)
        and section.get("assessmentMode") == "mastery"
        and isinstance(section.get("check"), dict)
        and isStrongCheckSpec(section["check"])
        for section in sections
    )


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    loader = StudyLoader(CURRICULA_ROOT)
    taxonomy = loadTaxonomy(CURRICULA_ROOT / "_taxonomy.yml")
    graph = buildLessonGraph(loader, taxonomy)
    source = curriculumPayloads()
    content = contentRows()
    pathSummaries: list[dict[str, Any]] = []
    selected: set[str] = set()
    for pathId in FEATURED_PATH_IDS:
        plan = composeMasterPlan(
            PlanGoal(domain=pathId, excludeCompleted=False, adaptiveSkip=False),
            graph,
            taxonomy,
        )
        pathFailures: list[str] = []
        domain = taxonomy.domainById(pathId)
        capstoneLessonRef = domain.capstoneLessonRef if domain else None
        finalLessonRef = plan.steps[-1].key if plan.steps else None
        if plan.gaps:
            pathFailures.append(f"unresolved gaps: {len(plan.gaps)}")
        if not capstoneLessonRef:
            pathFailures.append("explicit capstone lesson absent")
        elif plan.capstoneLessonRef != capstoneLessonRef or finalLessonRef != capstoneLessonRef:
            pathFailures.append(
                f"capstone is not the final ordered lesson: expected {capstoneLessonRef}, got {finalLessonRef}"
            )
        for step in plan.steps:
            selected.add(step.key)
            row = content.get(step.key)
            payload = source.get(step.key)
            if row is None or payload is None:
                pathFailures.append(f"missing canonical source: {step.key}")
                continue
            if not hasStrongMastery(payload):
                pathFailures.append(f"missing strong mastery: {step.key}")
            if not validAssessmentVariants(payload, "transfer"):
                pathFailures.append(f"missing unseen transfer: {step.key}")
            if not validAssessmentVariants(payload, "retrieval"):
                pathFailures.append(f"missing delayed retrieval: {step.key}")
            if row.get("runtimeTier") not in {"browser", "local"}:
                pathFailures.append(f"invalid runtime tier: {step.key}")
            if not row.get("artifactDecision") or not row.get("visualDecision"):
                pathFailures.append(f"artifact or visual decision absent: {step.key}")
        failures.extend(f"{pathId}: {failure}" for failure in pathFailures)
        pathSummaries.append({
            "pathId": pathId,
            "lessonCount": len(plan.steps),
            "targetOutcomeCount": len(plan.targetOutcomes),
            "gapCount": len(plan.gaps),
            "finalOrderedLessonRef": finalLessonRef,
            "capstoneLessonRef": capstoneLessonRef,
            "failureCount": len(pathFailures),
        })

    passed = not failures
    payload: dict[str, Any] = {
        "gate": "featured-learning-paths",
        "passed": passed,
        "status": "passed" if passed else "failed",
        "completionEligible": passed,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "summary": {
            "featuredPathCount": len(pathSummaries),
            "uniqueLessonCount": len(selected),
            "paths": pathSummaries,
        },
        "failures": failures[:100],
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    writeReport(REPORT_PATH, payload)
    if failures:
        print("FAIL: featured learning paths are incomplete", file=sys.stderr)
        return 1
    print(f"ok: featured learning paths {len(pathSummaries)}/{len(FEATURED_PATH_IDS)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
