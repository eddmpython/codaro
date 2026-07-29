from __future__ import annotations

from dataclasses import asdict
from datetime import UTC, datetime
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import time
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))

from codaro.curriculum.pathPromotion import (  # noqa: E402
    PathPromotionInvalid,
    resolvePathPromotionState,
)


REPORT_PATH = ROOT / "output/test-runner/path-promotion-readiness/path-promotion-readiness-report.json"
CAPSTONES = ROOT / "mainPlan/astryx-product-experience/08-learning-content/evidence/featured-capstones.yml"
EVIDENCE_ROOT = ROOT / "mainPlan/astryx-product-experience/10-quality-release/evidence/path-efficacy"
R10_MANIFEST = (
    ROOT
    / "mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/"
    "08-r10-independent-review/evaluation-bundle.manifest.yml"
)
INPUT_REPORTS = {
    "featuredPaths": ROOT / "output/test-runner/learning-content/featured-learning-paths-report.json",
    "capstoneContracts": ROOT / "output/test-runner/learning-content/featured-capstone-contracts-report.json",
    "solutionExecution": (
        ROOT / "output/test-runner/curriculum-quality-matrix/strong-assessment-solutions-report.json"
    ),
    "authoringIntegrity": (
        ROOT / "output/test-runner/curriculum-quality-matrix/assessment-authoring-quality-report.json"
    ),
}
STAGE_ORDER = ("E3", "E2", "E1", "E0")


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def gitHead() -> str:
    return subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=True,
        capture_output=True,
        encoding="utf-8",
    ).stdout.strip()


def loadMapping(path: Path) -> dict[str, Any]:
    value = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"mapping root required: {path.relative_to(ROOT).as_posix()}")
    return value


def loadReport(path: Path, *, expectedHead: str) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"report root must be an object: {path.relative_to(ROOT).as_posix()}")
    if value.get("gitHead") != expectedHead:
        raise ValueError(f"report is stale: {path.relative_to(ROOT).as_posix()}")
    if value.get("passed") is not True:
        raise ValueError(f"report is not green: {path.relative_to(ROOT).as_posix()}")
    return value


def rowsByPath(report: dict[str, Any]) -> dict[str, dict[str, Any]]:
    summary = report.get("summary") if isinstance(report.get("summary"), dict) else {}
    rows = summary.get("paths") if isinstance(summary.get("paths"), list) else []
    return {
        str(row.get("pathId") or ""): row
        for row in rows
        if isinstance(row, dict) and str(row.get("pathId") or "")
    }


def contentPath(lessonRef: str) -> Path:
    relative = Path(*lessonRef.split("/"))
    candidates = [
        path
        for path in (ROOT / "curricula/python").rglob(relative.name + ".yaml")
        if path.as_posix().endswith(relative.as_posix() + ".yaml")
    ]
    if len(candidates) != 1:
        raise ValueError(f"capstone lesson path is not unique: {lessonRef}")
    return candidates[0]


def contentHash(path: Path) -> str:
    return "sha256-" + hashlib.sha256(path.read_bytes()).hexdigest()


def r10RoundReady(manifest: dict[str, Any]) -> bool:
    scope = manifest.get("scope") if isinstance(manifest.get("scope"), dict) else {}
    inputReadiness = (
        manifest.get("inputReadiness") if isinstance(manifest.get("inputReadiness"), dict) else {}
    )
    roundReadiness = (
        manifest.get("roundReadiness") if isinstance(manifest.get("roundReadiness"), dict) else {}
    )
    return (
        manifest.get("state") == "sealed"
        and scope.get("sealState") == "sealed"
        and inputReadiness.get("inputFrozen") is True
        and roundReadiness.get("roundReady") is True
    )


def highestEfficacyCandidate(pathId: str) -> tuple[dict[str, Any] | None, str]:
    for stage in STAGE_ORDER:
        path = EVIDENCE_ROOT / stage / f"{pathId}.yml"
        if path.is_file():
            return loadMapping(path), path.relative_to(ROOT).as_posix()
    return None, ""


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    currentHead = gitHead()
    failures: list[str] = []
    reports: dict[str, dict[str, Any]] = {}
    states: list[dict[str, Any]] = []
    roundReady = False
    try:
        reports = {
            key: loadReport(path, expectedHead=currentHead)
            for key, path in INPUT_REPORTS.items()
        }
        capstoneContract = loadMapping(CAPSTONES)
        capstoneRows = capstoneContract.get("paths")
        if not isinstance(capstoneRows, list) or len(capstoneRows) != 6:
            raise ValueError("featured capstone contract must contain exactly six paths")
        pathRows = rowsByPath(reports["featuredPaths"])
        capstoneReportRows = rowsByPath(reports["capstoneContracts"])
        expectedPathIds = {
            str(row.get("pathId") or "")
            for row in capstoneRows
            if isinstance(row, dict)
        }
        if (
            len(expectedPathIds) != 6
            or set(pathRows) != expectedPathIds
            or set(capstoneReportRows) != expectedPathIds
        ):
            raise ValueError("featured path reports do not cover the same six paths")

        solutionReport = reports["solutionExecution"]
        authoringReport = reports["authoringIntegrity"]
        solutionReady = (
            solutionReport.get("completionEligible") is True
            and solutionReport.get("failureCount") == 0
            and intValue(solutionReport.get("lessonCount")) > 0
            and intValue(solutionReport.get("variantCount")) > 0
        )
        lessonCount = intValue(authoringReport.get("lessonCount"))
        variantCount = intValue(authoringReport.get("variantCount"))
        authoringReady = (
            authoringReport.get("failureCount") == 0
            and lessonCount > 0
            and variantCount > 0
            and intValue(authoringReport.get("uniqueCheckIdCount")) == variantCount
            and intValue(authoringReport.get("uniqueTaskFingerprintCount")) == variantCount
            and intValue(authoringReport.get("explicitClaimScopeLessonCount")) == lessonCount
        )
        roundReady = r10RoundReady(loadMapping(R10_MANIFEST))
        for capstone in capstoneRows:
            if not isinstance(capstone, dict):
                raise ValueError("featured capstone row must be a mapping")
            pathId = str(capstone.get("pathId") or "")
            lessonRef = str(capstone.get("capstoneLessonRef") or "")
            pathRow = pathRows[pathId]
            capstoneReportRow = capstoneReportRows[pathId]
            candidate, candidatePath = highestEfficacyCandidate(pathId)
            checks = {
                "pathStructure": (
                    intValue(pathRow.get("lessonCount")) > 0
                    and pathRow.get("gapCount") == 0
                    and pathRow.get("finalOrderedLessonRef") == lessonRef
                    and pathRow.get("capstoneLessonRef") == lessonRef
                ),
                "assessmentProgression": pathRow.get("failureCount") == 0,
                "capstoneContract": (
                    capstoneReportRow.get("failureCount") == 0
                    and intValue(capstoneReportRow.get("artifactCount")) > 0
                    and capstoneReportRow.get("capstoneLessonRef") == lessonRef
                ),
                "solutionExecution": solutionReady,
                "authoringIntegrity": authoringReady,
            }
            humanEvidenceStatus = "missing"
            humanEvidenceFailureCode = ""
            try:
                state = resolvePathPromotionState(
                    pathId=pathId,
                    contentHash=contentHash(contentPath(lessonRef)),
                    machineChecks=checks,
                    r10RoundReady=roundReady,
                    efficacyCandidate=candidate,
                )
                humanEvidenceStatus = "valid" if candidate is not None else "missing"
            except PathPromotionInvalid as error:
                humanEvidenceStatus = "invalid"
                humanEvidenceFailureCode = error.code
                state = resolvePathPromotionState(
                    pathId=pathId,
                    contentHash=contentHash(contentPath(lessonRef)),
                    machineChecks=checks,
                    r10RoundReady=roundReady,
                )
            row = {
                **asdict(state),
                "humanEvidenceStatus": humanEvidenceStatus,
                "humanEvidencePath": candidatePath,
                "humanEvidenceFailureCode": humanEvidenceFailureCode,
            }
            if not row["machineReady"]:
                failures.append(f"{pathId}: machine readiness failed")
            if row["promotionEligible"] and (
                row["visibility"] != "featured"
                or row["allowedClaim"] != "effectVerified"
                or row["humanEfficacyStage"] != "E3"
                or not roundReady
            ):
                failures.append(f"{pathId}: promotion invariant failed")
            if not row["promotionEligible"] and row["visibility"] == "featured":
                failures.append(f"{pathId}: featured visibility bypassed promotion blockers")
            states.append(row)
    except (
        json.JSONDecodeError,
        OSError,
        subprocess.SubprocessError,
        ValueError,
        yaml.YAMLError,
    ) as error:
        failures.append(str(error))

    machineReadyCount = sum(1 for state in states if state["machineReady"])
    promotedCount = sum(1 for state in states if state["promotionEligible"])
    passed = not failures and len(states) == 6 and machineReadyCount == 6
    payload = {
        "schemaVersion": 1,
        "gate": "path-promotion-readiness",
        "claimScope": "machine-readiness-only",
        "status": "passed" if passed else "failed",
        "passed": passed,
        "completionEligible": passed,
        "gitHead": currentHead,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "r10RoundReady": roundReady,
        "summary": {
            "pathCount": len(states),
            "machineReadyPathCount": machineReadyCount,
            "promotionEligiblePathCount": promotedCount,
            "provisionalPathCount": sum(1 for state in states if state["visibility"] == "provisional"),
            "independentReviewApprovedLessonCount": (
                reports.get("authoringIntegrity", {}).get("independentReviewApprovedLessonCount", 0)
            ),
            "independentReviewPendingLessonCount": (
                reports.get("authoringIntegrity", {}).get("independentReviewPendingLessonCount", 0)
            ),
        },
        "paths": states,
        "inputReports": {
            key: path.relative_to(ROOT).as_posix()
            for key, path in INPUT_REPORTS.items()
        },
        "failures": failures,
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not passed:
        print("FAIL: path promotion machine readiness is incomplete", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    print(
        f"ok: M0 machine readiness {machineReadyCount}/6; "
        f"promotion eligible {promotedCount}/6"
    )
    return 0


def intValue(value: Any) -> int:
    return int(value) if isinstance(value, int) and not isinstance(value, bool) else 0


if __name__ == "__main__":
    raise SystemExit(main())
