from __future__ import annotations

import sys
import time
from typing import Any

import yaml

from codaro.curriculum.lessonGraph import buildLessonGraph
from codaro.curriculum.planComposer import PlanGoal, composeMasterPlan
from codaro.curriculum.studyLoader import StudyLoader
from codaro.curriculum.taxonomy import loadTaxonomy

from learningLedgerAudit import CURRICULA_ROOT, ROOT, currentGitHead, utcTimestamp, writeReport


REPORT_PATH = ROOT / "output/test-runner/learning-content/learning-metadata-coverage-report.json"
FEATURED_PATH_IDS = (
    "pythonFoundation",
    "dataReporting",
    "dataVisualization",
    "fileAutomation",
    "officeAutomation",
    "webMonitoring",
)


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    loader = StudyLoader(CURRICULA_ROOT)
    taxonomy = loadTaxonomy(CURRICULA_ROOT / "_taxonomy.yml")
    graph = buildLessonGraph(loader, taxonomy)
    byKey = {lesson.key: lesson for lesson in graph.lessons}
    selected: set[str] = set()
    pathLessonCounts: dict[str, int] = {}
    for pathId in FEATURED_PATH_IDS:
        plan = composeMasterPlan(
            PlanGoal(domain=pathId, excludeCompleted=False, adaptiveSkip=False),
            graph,
            taxonomy,
        )
        if plan.gaps:
            failures.append(f"{pathId}: unresolved gaps {len(plan.gaps)}")
        pathLessonCounts[pathId] = len(plan.steps)
        selected.update(step.key for step in plan.steps)

    for lessonRef in sorted(selected):
        lesson = byKey[lessonRef]
        sourcePath = loader._getStudyPath(lesson.category, lesson.contentId)  # noqa: SLF001
        payload = yaml.safe_load(sourcePath.read_text(encoding="utf-8"))
        meta = payload.get("meta") if isinstance(payload, dict) and isinstance(payload.get("meta"), dict) else {}
        expected = {
            "outcomes": list(lesson.outcomes),
            "prerequisites": list(lesson.prerequisites),
            "estimatedMinutes": lesson.estimatedMinutes,
        }
        for key, expectedValue in expected.items():
            if meta.get(key) != expectedValue:
                failures.append(f"{lessonRef}: explicit {key} differs")

    passed = not failures
    payload: dict[str, Any] = {
        "gate": "learning-metadata-coverage",
        "passed": passed,
        "status": "passed" if passed else "failed",
        "completionEligible": passed,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "summary": {
            "featuredPathCount": len(FEATURED_PATH_IDS),
            "featuredLessonCount": len(selected),
            "explicitMetadataLessonCount": len(selected) - len({failure.split(":", 1)[0] for failure in failures}),
            "pathLessonCounts": pathLessonCounts,
        },
        "failures": failures[:100],
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    writeReport(REPORT_PATH, payload)
    if failures:
        print("FAIL: featured learning metadata coverage is incomplete", file=sys.stderr)
        return 1
    print(f"ok: featured learning metadata coverage {len(selected)}/{len(selected)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
