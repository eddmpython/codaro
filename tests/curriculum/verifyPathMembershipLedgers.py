from __future__ import annotations

import sys
import time
from typing import Any

from codaro.curriculum.lessonGraph import buildLessonGraph
from codaro.curriculum.planComposer import PlanGoal, composeMasterPlan
from codaro.curriculum.studyLoader import StudyLoader
from codaro.curriculum.taxonomy import loadTaxonomy

from learningLedgerAudit import (
    CONTENT_LEDGER_ROOT,
    CURRICULA_ROOT,
    EVIDENCE_ROOT,
    ROOT,
    contentRows,
    currentGitHead,
    fileSha256,
    loadYaml,
    pathLedgers,
    utcTimestamp,
    writeReport,
)


REPORT_PATH = ROOT / "output/test-runner/learning-content/path-membership-ledgers-report.json"
FORBIDDEN_PATH_FIELDS = {
    "outcomes", "prerequisites", "runtimeTier", "checkSpecId", "checkKinds", "artifactDecision",
    "visualDecision", "retrievalVariantIds", "transferVariantIds",
}


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    rows = contentRows()
    ledgers = pathLedgers()
    transition = loadYaml(EVIDENCE_ROOT / "taxonomy-transition.yml")
    taxonomy = loadTaxonomy(CURRICULA_ROOT / "_taxonomy.yml")
    graph = buildLessonGraph(StudyLoader(CURRICULA_ROOT), taxonomy)
    targetHash = fileSha256(CURRICULA_ROOT / "_taxonomy.yml")
    composerHash = fileSha256(ROOT / "src/codaro/curriculum/planComposer.py")
    contentSummary = loadYaml(CONTENT_LEDGER_ROOT / "summary.yml")
    transitionDiffs = {
        str(row.get("pathId", "")): row
        for row in transition.get("pathDiffs", [])
        if isinstance(row, dict)
    }
    changedPaths: list[str] = []

    if set(ledgers) != {domain.id for domain in taxonomy.domains}:
        failures.append("path ledgers do not match taxonomy domains")
    for pathId, (_, payload) in sorted(ledgers.items()):
        lessonRows = payload.get("lessons", [])
        refs: list[str] = []
        for order, row in enumerate(lessonRows, start=1):
            if not isinstance(row, dict):
                failures.append(f"{pathId}: lesson row is not a mapping")
                continue
            lessonRef = str(row.get("lessonRef", ""))
            refs.append(lessonRef)
            if lessonRef not in rows or row.get("canonicalContentRef") != lessonRef or row.get("order") != order:
                failures.append(f"{pathId}/{lessonRef}: canonical path row mismatch")
            duplicated = sorted(FORBIDDEN_PATH_FIELDS & set(row))
            if duplicated:
                failures.append(f"{pathId}/{lessonRef}: duplicates canonical fields {duplicated}")
        plan = composeMasterPlan(
            PlanGoal(domain=pathId, excludeCompleted=False, adaptiveSkip=False),
            graph,
            taxonomy,
        )
        targetRefs = [step.key for step in plan.steps]
        if refs != targetRefs:
            changedPaths.append(pathId)
        transitionDiff = transitionDiffs.get(pathId)
        if not isinstance(transitionDiff, dict):
            failures.append(f"{pathId}: taxonomy transition diff is absent")
        if payload.get("composerVersionHash") != composerHash:
            failures.append(f"{pathId}: composer hash is stale")

    review = transition.get("review") if isinstance(transition.get("review"), dict) else {}
    applied = transition.get("applyState") == "applied"
    if applied:
        for pathId, (_, payload) in ledgers.items():
            if payload.get("taxonomySnapshotHash") != targetHash:
                failures.append(f"{pathId}: applied taxonomy hash is stale")
            if payload.get("sourceSetHash") != contentSummary.get("sourceSetHash"):
                failures.append(f"{pathId}: applied source set hash is stale")
        if changedPaths:
            failures.append(f"applied path membership differs: {changedPaths}")
    else:
        baselineHash = str(transition.get("fromHash", ""))
        for pathId, (_, payload) in ledgers.items():
            if payload.get("taxonomySnapshotHash") != baselineHash:
                failures.append(f"{pathId}: proposed transition baseline hash differs")

    machinePassed = not failures
    completionEligible = machinePassed and applied and review.get("status") == "approved" and not changedPaths
    payload: dict[str, Any] = {
        "gate": "path-membership-ledgers",
        "passed": machinePassed,
        "status": "passed" if machinePassed else "failed",
        "completionEligible": completionEligible,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "summary": {
            "pathLedgerCount": len(ledgers),
            "taxonomyDomainCount": len(taxonomy.domains),
            "runtimeGraphCount": len(graph.lessons),
            "transitionFromHash": transition.get("fromHash"),
            "transitionToHash": transition.get("toHash"),
            "currentTaxonomyHash": targetHash,
            "transitionApplyState": transition.get("applyState"),
            "transitionReviewStatus": review.get("status"),
            "changedPathCount": len(changedPaths),
            "changedPathIds": changedPaths,
        },
        "failures": failures[:100],
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    writeReport(REPORT_PATH, payload)
    if failures:
        print("FAIL: path membership ledger integrity failed", file=sys.stderr)
        return 1
    print(f"ok: path membership machine integrity {len(ledgers)} paths")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
