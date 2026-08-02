from __future__ import annotations

import sys
import time
from typing import Any

from learningLedgerAudit import (
    CONTENT_LEDGER_ROOT,
    ROOT,
    contentRows,
    currentGitHead,
    fileSha256,
    hasValidReviewMetadata,
    identityRows,
    loadYaml,
    ownerRegistry,
    utcTimestamp,
    writeReport,
)


REPORT_PATH = ROOT / "output/test-runner/learning-content/canonical-content-ledger-report.json"
REQUIRED_FIELDS = {
    "lessonRef", "identityLedgerRef", "lessonContentHash", "disposition", "ownerPacket",
    "eligiblePathIds", "outcomes", "prerequisites", "reinforcesOutcomeIds", "runtimeTier",
    "checkSpecId", "checkKinds", "retrievalVariantIds", "transferVariantIds", "artifactDecision",
    "visualDecision", "reviewerRoles", "authorReviewStatus", "evidenceCommitRequirement",
}


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    rows = contentRows()
    identities = identityRows()
    if set(rows) != set(identities):
        failures.append(f"content/identity sets differ: content={len(rows)} identity={len(identities)}")

    owners: dict[str, int] = {}
    registeredOwners = ownerRegistry()
    approvedRows = 0
    for lessonRef, row in sorted(rows.items()):
        missing = sorted(REQUIRED_FIELDS - set(row))
        if missing:
            failures.append(f"{lessonRef}: missing fields {missing}")
            continue
        sourcePath = ROOT / str(identities[lessonRef].get("sourcePath", ""))
        if not sourcePath.is_file() or row.get("lessonContentHash") != fileSha256(sourcePath):
            failures.append(f"{lessonRef}: source hash is stale")
        outcomes = [str(value) for value in row.get("outcomes", [])]
        prerequisites = [str(value) for value in row.get("prerequisites", [])]
        expectedReinforces = [value for value in outcomes if value in set(prerequisites)]
        if not outcomes:
            failures.append(f"{lessonRef}: outcomes are empty")
        if row.get("reinforcesOutcomeIds") != expectedReinforces:
            failures.append(f"{lessonRef}: reinforcement intersection differs")
        owner = str(row.get("ownerPacket", ""))
        owners[owner] = owners.get(owner, 0) + 1
        if owner not in registeredOwners:
            failures.append(f"{lessonRef}: owner is not registered")
        expectedIdentityRef = f"identity-ledger/{lessonRef.split('/', 1)[0]}.yml"
        if row.get("identityLedgerRef") != expectedIdentityRef:
            failures.append(f"{lessonRef}: identity ledger reference differs")
        if row.get("authorReviewStatus") == "approved" and not hasValidReviewMetadata(row):
            failures.append(f"{lessonRef}: author approval metadata is invalid")
        approvedRows += int(row.get("authorReviewStatus") == "approved")

    summary = loadYaml(CONTENT_LEDGER_ROOT / "summary.yml")
    if dict(sorted(owners.items())) != dict(sorted(registeredOwners.items())):
        failures.append("owner registry counts differ from canonical content rows")
    machinePassed = not failures
    completionEligible = (
        machinePassed
        and approvedRows == len(rows)
        and isinstance(summary.get("targetTaxonomyHash"), str)
        and len(str(summary.get("targetTaxonomyHash"))) == 64
    )
    payload: dict[str, Any] = {
        "gate": "canonical-content-ledger",
        "passed": machinePassed,
        "status": "passed" if machinePassed else "failed",
        "completionEligible": completionEligible,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "summary": {
            "canonicalRows": len(rows),
            "identityRows": len(identities),
            "ownerPacketCount": len(owners),
            "unownedRows": sum(1 for row in rows.values() if not row.get("ownerPacket")),
            "emptyOutcomeRows": sum(1 for row in rows.values() if not row.get("outcomes")),
            "approvedAuthorReviewRows": approvedRows,
            "pendingAuthorReviewRows": len(rows) - approvedRows,
            "targetTaxonomyHash": summary.get("targetTaxonomyHash"),
        },
        "failures": failures[:100],
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    writeReport(REPORT_PATH, payload)
    if failures:
        print("FAIL: canonical content ledger failed", file=sys.stderr)
        return 1
    print(f"ok: canonical content ledger machine integrity {len(rows)} rows")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
