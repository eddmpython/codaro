from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from typing import Any

from learningLedgerAudit import currentGitHead, utcTimestamp


ROOT = Path(__file__).resolve().parents[2]
REPORT_ROOT = ROOT / "output/test-runner/learning-content"
REPORT_PATHS = (
    REPORT_ROOT / "lesson-identity-integrity-report.json",
    REPORT_ROOT / "canonical-content-ledger-report.json",
    REPORT_ROOT / "path-membership-ledgers-report.json",
    REPORT_ROOT / "learning-metadata-coverage-report.json",
    REPORT_ROOT / "scored-check-strength-report.json",
    REPORT_ROOT / "retrieval-task-transfer-report.json",
    REPORT_ROOT / "featured-learning-paths-report.json",
    REPORT_ROOT / "featured-capstone-contracts-report.json",
    ROOT / "output/test-runner/curriculum-quality-matrix/strong-assessment-solutions-report.json",
    ROOT / "output/test-runner/curriculum-quality-matrix/assessment-authoring-quality-report.json",
)


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    gitHead = currentGitHead()
    blockers: list[str] = []
    reports: list[dict[str, Any]] = []
    for path in REPORT_PATHS:
        if not path.is_file():
            blockers.append(f"report is absent: {path.relative_to(ROOT).as_posix()}")
            continue
        payload = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(payload, dict):
            blockers.append(f"report is invalid: {path.relative_to(ROOT).as_posix()}")
            continue
        reports.append(payload)
        if payload.get("gitHead") != gitHead:
            blockers.append(f"report git head is stale: {payload.get('gate')}")
        if payload.get("passed") is not True:
            blockers.append(f"machine audit failed: {payload.get('gate')}")
        if payload.get("completionEligible") is not True:
            summary = payload.get("summary") if isinstance(payload.get("summary"), dict) else {}
            gate = payload.get("gate")
            if gate == "lesson-identity-integrity":
                blockers.append(
                    "lesson identity approvals are incomplete: "
                    f"pendingRows={summary.get('pendingHumanReviewRows')} "
                    f"aliasReview={summary.get('aliasReviewStatus')}"
                )
            elif gate == "canonical-content-ledger":
                blockers.append(
                    "canonical content approvals are incomplete: "
                    f"pendingRows={summary.get('pendingAuthorReviewRows')} "
                    f"targetTaxonomyHash={summary.get('targetTaxonomyHash')}"
                )
            elif gate == "path-membership-ledgers":
                blockers.append(
                    "taxonomy path transition is incomplete: "
                    f"applyState={summary.get('transitionApplyState')} "
                    f"review={summary.get('transitionReviewStatus')} "
                    f"changedPaths={summary.get('changedPathCount')}"
                )
            elif gate == "assessment-authoring-quality":
                blockers.append(
                    "independent assessment review is incomplete: "
                    f"approved={summary.get('independentReviewApprovedLessonCount')} "
                    f"pending={summary.get('independentReviewPendingLessonCount')}"
                )
            else:
                blockers.append(f"completion evidence is incomplete: {gate}")

    payload = {
        "gate": "learning-content",
        "passed": not blockers,
        "status": "passed" if not blockers else "blocked",
        "completionEligible": not blockers,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": gitHead,
        "reports": [report.get("reportPath") for report in reports],
        "blockers": blockers,
        "reportPath": (REPORT_ROOT / "learning-content-report.json").relative_to(ROOT).as_posix(),
    }
    outputPath = REPORT_ROOT / "learning-content-report.json"
    outputPath.parent.mkdir(parents=True, exist_ok=True)
    outputPath.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if blockers:
        print("BLOCKED: learning content completion evidence is incomplete", file=sys.stderr)
        return 1
    print("ok: learning content completion evidence is complete")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
