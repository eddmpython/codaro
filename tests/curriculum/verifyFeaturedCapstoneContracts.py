from __future__ import annotations

import sys
import time
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import yaml

from codaro.curriculum.taxonomy import loadTaxonomy
from learningLedgerAudit import (
    CURRICULA_ROOT,
    ROOT,
    currentGitHead,
    curriculumPayloads,
    utcTimestamp,
    validAssessmentVariants,
    writeReport,
)


CONTRACT_PATH = (
    ROOT
    / "mainPlan/astryx-product-experience/08-learning-content/evidence/featured-capstones.yml"
)
REPORT_PATH = ROOT / "output/test-runner/learning-content/featured-capstone-contracts-report.json"
FEATURED_PATH_IDS = {
    "pythonFoundation",
    "dataReporting",
    "dataVisualization",
    "fileAutomation",
    "officeAutomation",
    "webMonitoring",
}


def publicUrl(lessonRef: str) -> str:
    category, contentId = lessonRef.split("/", 1)
    query = urlencode({"surface": "curriculum", "category": category, "lesson": contentId})
    return f"/run/?{query}#curriculum"


def semanticExpectedPath(item: object) -> bool:
    if not isinstance(item, dict) or item.get("origin") != "created":
        return False
    kind = item.get("kind")
    if kind in {"file", "directory"}:
        return True
    if kind == "table":
        columns = item.get("columns")
        return (
            item.get("format") in {"csv", "json"}
            and isinstance(columns, list)
            and bool(columns)
            and all(isinstance(column, str) and column for column in columns)
            and len(set(columns)) == len(columns)
        )
    if kind == "image":
        return (
            item.get("mediaType") in {"image/png", "image/jpeg", "image/gif"}
            and isinstance(item.get("width"), int)
            and not isinstance(item.get("width"), bool)
            and item["width"] > 0
            and isinstance(item.get("height"), int)
            and not isinstance(item.get("height"), bool)
            and item["height"] > 0
        )
    return False


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    payload = yaml.safe_load(CONTRACT_PATH.read_text(encoding="utf-8"))
    rows = payload.get("paths") if isinstance(payload, dict) else None
    if not isinstance(payload, dict) or payload.get("schemaVersion") != 1:
        failures.append("featured capstone contract schemaVersion is invalid")
        rows = []
    if payload.get("surfaceState") != "route-backed" or payload.get("learnerEvidenceClaim") != "none":
        failures.append("capstone contract must distinguish route backing from learner evidence")
    if not isinstance(rows, list):
        failures.append("featured capstone paths must be an array")
        rows = []

    source = curriculumPayloads()
    taxonomy = loadTaxonomy(CURRICULA_ROOT / "_taxonomy.yml")
    seen: set[str] = set()
    summaries: list[dict[str, Any]] = []
    for row in rows:
        if not isinstance(row, dict):
            failures.append("capstone row is not an object")
            continue
        pathId = str(row.get("pathId") or "")
        lessonRef = str(row.get("capstoneLessonRef") or "")
        rowFailures: list[str] = []
        if pathId in seen or pathId not in FEATURED_PATH_IDS:
            rowFailures.append("path id is missing, duplicate, or not featured")
        seen.add(pathId)
        domain = taxonomy.domainById(pathId)
        if domain is None or domain.capstoneLessonRef != lessonRef:
            rowFailures.append("taxonomy capstone does not match")
        if "/" not in lessonRef or row.get("publicUrl") != publicUrl(lessonRef):
            rowFailures.append("public run URL does not match the capstone lesson")
        lesson = source.get(lessonRef)
        mastery = validAssessmentVariants(lesson or {}, "mastery")
        variant = next(
            (
                item
                for item in mastery
                if isinstance(item.get("check"), dict)
                and item["check"].get("id") == row.get("masteryCheckId")
            ),
            None,
        )
        if variant is None:
            rowFailures.append("declared mastery strong check is absent")
            expectedPaths: list[object] = []
        else:
            checkPayload = variant["check"].get("payload")
            expectedPaths = (
                checkPayload.get("expectedPaths", []) if isinstance(checkPayload, dict) else []
            )
        createdPaths = [
            item for item in expectedPaths if isinstance(item, dict) and item.get("origin") == "created"
        ]
        if not createdPaths or not all(semanticExpectedPath(item) for item in createdPaths):
            rowFailures.append("created artifact descriptors are absent or structurally weak")
        actualPaths = {
            str(item.get("path"))
            for item in createdPaths
        }
        actualKinds = {
            str(item.get("kind"))
            for item in createdPaths
        }
        if actualPaths != set(row.get("webArtifactPaths") or []):
            rowFailures.append("declared artifact paths do not match the strong check")
        if actualKinds != set(row.get("webArtifactKinds") or []):
            rowFailures.append("declared artifact kinds do not match the strong check")
        if set(row.get("evidenceKinds") or []) != {"strong-check", "artifact-descriptor"}:
            rowFailures.append("capstone must combine strong check and artifact descriptor evidence")
        localRequired = row.get("localGraduationRequired") is True
        localState = row.get("localGraduationState")
        if localRequired and localState != "pending-independent-evidence":
            rowFailures.append("required Local graduation cannot be claimed without independent evidence")
        if not localRequired and localState not in {"not-required", "optional"}:
            rowFailures.append("optional Local graduation state is invalid")
        failures.extend(f"{pathId}: {failure}" for failure in rowFailures)
        summaries.append({
            "pathId": pathId,
            "capstoneLessonRef": lessonRef,
            "artifactKinds": sorted(actualKinds),
            "artifactCount": len(actualPaths),
            "localGraduationRequired": localRequired,
            "failureCount": len(rowFailures),
        })

    missing = FEATURED_PATH_IDS - seen
    if missing:
        failures.append("featured capstone rows are missing: " + ", ".join(sorted(missing)))
    report: dict[str, Any] = {
        "gate": "featured-capstone-contracts",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "completionEligible": not failures,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "summary": {
            "routeBackedCapstoneCount": len(summaries),
            "learnerEvidenceClaim": payload.get("learnerEvidenceClaim"),
            "localGraduationPendingCount": sum(
                1 for row in summaries if row["localGraduationRequired"]
            ),
            "paths": summaries,
        },
        "failures": failures,
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    writeReport(REPORT_PATH, report)
    if failures:
        print("FAIL: featured capstone contracts are incomplete", file=sys.stderr)
        return 1
    print(f"ok: featured capstone contracts {len(summaries)}/{len(FEATURED_PATH_IDS)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
