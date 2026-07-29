from __future__ import annotations

import pytest

from codaro.curriculum.pathPromotion import (
    MACHINE_CHECK_KEYS,
    PathPromotionInvalid,
    resolvePathPromotionPortfolio,
    resolvePathPromotionState,
)


CONTENT_HASH = "sha256-" + ("a" * 64)


def machineChecks(**changes: bool) -> dict[str, bool]:
    checks = {key: True for key in MACHINE_CHECK_KEYS}
    checks.update(changes)
    return checks


def efficacyCandidate(stage: str) -> dict[str, object]:
    candidate: dict[str, object] = {
        "pathId": "pythonFoundation",
        "targetStage": stage,
        "contentHash": CONTENT_HASH,
        "curriculumOwner": "curriculum-owner",
        "learningQaReviewer": "learning-qa",
        "contentApproved": True,
    }
    if stage in {"E1", "E2", "E3"}:
        candidate.update({
            "representativeParticipants": 8,
            "usabilityReportHash": CONTENT_HASH,
        })
    if stage in {"E2", "E3"}:
        candidate.update({
            "noviceParticipants": 20,
            "participantReportHash": CONTENT_HASH,
            "measures": ["pre", "post", "unseenTransfer"],
            "causalClaim": False,
            "researchOperations": {
                "researchOwner": "research-owner",
                "privacyOwner": "privacy-owner",
                "recruitmentChannel": "approved-panel",
                "budgetCeiling": 1_000_000,
                "schedule": "2026-Q4",
                "consentVersion": "consent-v1",
                "withdrawalRoute": "/research/withdraw",
                "encryptedRawStore": "research-raw-v1",
                "accessRoster": "research-roster-v1",
                "deletionJob": {
                    "jobId": "delete-after-90-days",
                    "retentionDays": 90,
                },
                "preregistrationUrl": "https://example.invalid/preregistration",
                "preregistrationHash": CONTENT_HASH,
                "consentReceiptHash": CONTENT_HASH,
                "withdrawalTestReceiptHash": CONTENT_HASH,
                "deletionTestReceiptHash": CONTENT_HASH,
                "redactionAuditHash": CONTENT_HASH,
            },
        })
    if stage == "E3":
        candidate.update({
            "participantsPerArm": 60,
            "powerStatus": "active",
            "effectReportHash": CONTENT_HASH,
        })
    return candidate


def testMachineReadyPathStaysProvisionalWithoutHumanEvidence() -> None:
    state = resolvePathPromotionState(
        pathId="pythonFoundation",
        contentHash=CONTENT_HASH,
        machineChecks=machineChecks(),
        r10RoundReady=False,
    )

    assert state.machineStage == "M0"
    assert state.machineReady is True
    assert state.humanEfficacyStage is None
    assert state.allowedClaim == "machineVerified"
    assert state.visibility == "provisional"
    assert state.promotionEligible is False
    assert state.blockers == (
        "content-review-required",
        "formative-evidence-required",
        "learning-signal-evidence-required",
        "confirmatory-evidence-required",
        "r10-round-not-ready",
    )


def testOneMachineFailureIsVisiblePerPath() -> None:
    portfolio = resolvePathPromotionPortfolio([
        {
            "pathId": "passedPath",
            "contentHash": CONTENT_HASH,
            "machineChecks": machineChecks(),
            "r10RoundReady": False,
        },
        {
            "pathId": "failedPath",
            "contentHash": CONTENT_HASH,
            "machineChecks": machineChecks(capstoneContract=False),
            "r10RoundReady": False,
        },
    ])

    assert portfolio["passedPath"]["machineReady"] is True
    assert portfolio["failedPath"]["machineReady"] is False
    assert portfolio["failedPath"]["blockers"][0] == "machine-check-failed:capstoneContract"
    assert portfolio["failedPath"]["visibility"] == "provisional"


def testR10BlockerPreventsSyntheticE3Promotion() -> None:
    state = resolvePathPromotionState(
        pathId="pythonFoundation",
        contentHash=CONTENT_HASH,
        machineChecks=machineChecks(),
        r10RoundReady=False,
        efficacyCandidate=efficacyCandidate("E3"),
    )

    assert state.humanEfficacyStage == "E3"
    assert state.allowedClaim == "machineVerified"
    assert state.visibility == "provisional"
    assert state.promotionEligible is False
    assert state.blockers == ("r10-round-not-ready",)


def testReadyR10AllowsE2BetaButNotFeaturedPromotion() -> None:
    state = resolvePathPromotionState(
        pathId="pythonFoundation",
        contentHash=CONTENT_HASH,
        machineChecks=machineChecks(),
        r10RoundReady=True,
        efficacyCandidate=efficacyCandidate("E2"),
    )

    assert state.allowedClaim == "learningSignal"
    assert state.visibility == "beta"
    assert state.promotionEligible is False
    assert state.blockers == ("confirmatory-evidence-required",)


def testReadyR10AndE3AllowFeaturedPromotion() -> None:
    state = resolvePathPromotionState(
        pathId="pythonFoundation",
        contentHash=CONTENT_HASH,
        machineChecks=machineChecks(),
        r10RoundReady=True,
        efficacyCandidate=efficacyCandidate("E3"),
    )

    assert state.allowedClaim == "effectVerified"
    assert state.visibility == "featured"
    assert state.promotionEligible is True
    assert state.blockers == ()


def testStaleEfficacyEvidenceIsRejected() -> None:
    candidate = efficacyCandidate("E0")
    candidate["contentHash"] = "sha256-" + ("b" * 64)

    with pytest.raises(PathPromotionInvalid) as raised:
        resolvePathPromotionState(
            pathId="pythonFoundation",
            contentHash=CONTENT_HASH,
            machineChecks=machineChecks(),
            r10RoundReady=True,
            efficacyCandidate=candidate,
        )

    assert raised.value.code == "stale-content-evidence"
