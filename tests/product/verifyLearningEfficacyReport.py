from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys
import time
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "src"))

from codaro.curriculum.efficacyStage import EfficacyStageInvalid, resolveEfficacyStage  # noqa: E402


REPORT_PATH = ROOT / "output/test-runner/learning-efficacy-report/learning-efficacy-report.json"
CONTENT_HASH = "sha256-" + ("a" * 64)


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def gitHead() -> str:
    return subprocess.run(
        ("git", "rev-parse", "HEAD"), cwd=ROOT, check=True, capture_output=True, encoding="utf-8"
    ).stdout.strip()


def stageCandidate(stage: str) -> dict[str, Any]:
    candidate: dict[str, Any] = {
        "pathId": "contract-path",
        "targetStage": stage,
        "contentHash": CONTENT_HASH,
        "curriculumOwner": "curriculum-owner",
        "learningQaReviewer": "learning-qa-reviewer",
        "contentApproved": True,
    }
    if stage in {"E1", "E2", "E3"}:
        candidate.update({"representativeParticipants": 8, "usabilityReportHash": CONTENT_HASH})
    if stage in {"E2", "E3"}:
        candidate.update({
            "noviceParticipants": 20,
            "measures": ["pre", "post", "unseenTransfer"],
            "causalClaim": False,
            "researchOperations": {
                "researchOwner": "research-owner",
                "privacyOwner": "privacy-owner",
                "recruitmentChannel": "approved-panel",
                "budgetCeiling": 1,
                "schedule": "preregistered",
                "consentVersion": "v1",
                "withdrawalRoute": "/withdraw",
                "encryptedRawStore": "encrypted-store",
                "accessRoster": "two-person-roster",
                "deletionJob": "90-day-delete",
                "preregistrationUrl": "https://example.invalid/preregistered",
                "preregistrationHash": CONTENT_HASH,
            },
        })
    if stage == "E3":
        candidate.update({
            "participantsPerArm": 60,
            "powerStatus": "active",
            "effectReportHash": CONTENT_HASH,
        })
    return candidate


def verifyStages() -> dict[str, Any]:
    claims = {}
    for stage in ("E0", "E1", "E2", "E3"):
        result = resolveEfficacyStage(stageCandidate(stage), currentContentHash=CONTENT_HASH)
        claims[stage] = result["allowedClaim"]
    rejected: list[str] = []
    cases = (
        ({**stageCandidate("E2"), "causalClaim": True}, "causal-claim-forbidden"),
        ({**stageCandidate("E3"), "participantsPerArm": 59}, "confirmatory-arm-too-small"),
        (stageCandidate("E2"), "stale-content-evidence"),
    )
    for index, (candidate, expectedCode) in enumerate(cases):
        currentHash = ("sha256-" + ("b" * 64)) if index == 2 else CONTENT_HASH
        try:
            resolveEfficacyStage(candidate, currentContentHash=currentHash)
        except EfficacyStageInvalid as error:
            if error.code != expectedCode:
                raise ValueError(f"expected {expectedCode}, got {error.code}") from error
            rejected.append(error.code)
        else:
            raise ValueError(f"negative efficacy fixture unexpectedly passed: {expectedCode}")
    return {"allowedClaims": claims, "rejectedFixtures": rejected, "aggregatePromotionForbidden": True}


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    facts: dict[str, Any] = {}
    try:
        facts = verifyStages()
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        failures.append(str(error))
    payload = {
        "schemaVersion": 1,
        "gate": "learning-efficacy-report",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "contractEligible": not failures,
        "completionEligible": False,
        "gitHead": gitHead(),
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "facts": facts,
        "completionBlockers": ["real E1, E2, and E3 participant reports remain path-scoped human evidence"],
        "failures": failures,
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print("ok: E0-E3 efficacy report contract and negative fixtures verified (completionEligible=false)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
