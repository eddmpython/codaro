from __future__ import annotations

import sys
import time
from typing import Any

from codaro.curriculum.lessonGraph import buildLessonGraph
from codaro.curriculum.studyLoader import StudyLoader
from codaro.curriculum.taxonomy import loadTaxonomy

from learningLedgerAudit import (
    CURRICULA_ROOT,
    EVIDENCE_ROOT,
    IDENTITY_LEDGER_ROOT,
    ROOT,
    currentGitHead,
    fileSha256,
    identityRows,
    loadYaml,
    utcTimestamp,
    writeReport,
)


REPORT_PATH = ROOT / "output/test-runner/learning-content/lesson-identity-integrity-report.json"


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    rows = identityRows()
    summary = loadYaml(IDENTITY_LEDGER_ROOT / "summary.yml")
    aliasLedger = loadYaml(EVIDENCE_ROOT / "legacy-alias-migration.yml")
    graph = buildLessonGraph(StudyLoader(CURRICULA_ROOT), loadTaxonomy(CURRICULA_ROOT / "_taxonomy.yml"))
    graphKeys = {lesson.key for lesson in graph.lessons}
    rowKeys = set(rows)

    if rowKeys != graphKeys:
        failures.append(f"identity/graph key mismatch: identity={len(rowKeys)} graph={len(graphKeys)}")
    if summary.get("registeredRows") != len(rowKeys & graphKeys) or summary.get("missingRegistryRows") != 0:
        failures.append("identity registry summary is not current")
    if summary.get("metaIdMismatchRows") != aliasLedger.get("migrationRowCount"):
        failures.append("legacy alias migration count differs from identity summary")
    if aliasLedger.get("categoryScopedCollisionCount") != 0:
        failures.append("category-scoped legacy alias collision exists")
    readerPolicy = aliasLedger.get("readerPolicy")
    if not isinstance(readerPolicy, dict) or readerPolicy.get("unscopedDuplicateAliasResult") != "migration-error":
        failures.append("unscoped duplicate aliases are not rejected")
    for lessonRef, row in rows.items():
        sourcePath = ROOT / str(row.get("sourcePath", ""))
        if not sourcePath.is_file() or sourcePath.stem != lessonRef.split("/", 1)[1]:
            failures.append(f"identity source mismatch: {lessonRef}")
        if row.get("registryStatus") != "registered":
            failures.append(f"identity registry status is not registered: {lessonRef}")

    review = aliasLedger.get("review") if isinstance(aliasLedger.get("review"), dict) else {}
    pendingRows = int(summary.get("pendingHumanReviewRows", len(rows)))
    machinePassed = not failures
    completionEligible = machinePassed and pendingRows == 0 and review.get("status") == "approved"
    payload: dict[str, Any] = {
        "gate": "lesson-identity-integrity",
        "passed": machinePassed,
        "status": "passed" if machinePassed else "failed",
        "completionEligible": completionEligible,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "summary": {
            "canonicalIdentityRows": len(rows),
            "runtimeGraphRows": len(graph.lessons),
            "registeredRows": summary.get("registeredRows"),
            "legacyAliasMigrationRows": aliasLedger.get("migrationRowCount"),
            "categoryScopedCollisions": aliasLedger.get("categoryScopedCollisionCount"),
            "globalDuplicateAliases": aliasLedger.get("globalDuplicateAliasCount"),
            "pendingHumanReviewRows": pendingRows,
            "aliasReviewStatus": review.get("status"),
            "taxonomyHash": fileSha256(CURRICULA_ROOT / "_taxonomy.yml"),
        },
        "failures": failures[:100],
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    writeReport(REPORT_PATH, payload)
    if failures:
        print("FAIL: lesson identity integrity failed", file=sys.stderr)
        return 1
    print(f"ok: lesson identity machine integrity {len(rows)}/{len(graph.lessons)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
