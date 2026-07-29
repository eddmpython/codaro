from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from codaro.curriculum.efficacyStage import (
    EfficacyStageInvalid,
    PathReleaseState,
    productReleaseAggregate,
    resolveEfficacyStage,
    resolveFeaturedPathStatus,
    resolvePathPortfolio,
)


CONTENT_HASH = "sha256-" + ("a" * 64)


def e0Candidate(pathId: str = "python-foundations") -> dict[str, object]:
    return {
        "pathId": pathId,
        "targetStage": "E0",
        "contentHash": CONTENT_HASH,
        "curriculumOwner": "curriculum-owner",
        "learningQaReviewer": "learning-qa",
        "contentApproved": True,
    }


def e2Candidate(pathId: str = "python-foundations") -> dict[str, object]:
    candidate = e0Candidate(pathId)
    candidate.update({
        "targetStage": "E2",
        "representativeParticipants": 8,
        "usabilityReportHash": CONTENT_HASH,
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
    return candidate


def testEfficacyStageAcceptsApprovedConstructReview() -> None:
    result = resolveEfficacyStage(e0Candidate(), currentContentHash=CONTENT_HASH)

    assert result["stage"] == "E0"
    assert result["allowedClaim"] == "contentApproved"


def testEfficacyStageRejectsMissingResearchOwnerFixture() -> None:
    fixturePath = Path("tests/product/fixtures/releaseResearch/missing-research-owner.yml")
    fixture = yaml.safe_load(fixturePath.read_text(encoding="utf-8"))

    with pytest.raises(EfficacyStageInvalid) as raised:
        resolveEfficacyStage(fixture["candidate"], currentContentHash=CONTENT_HASH)

    assert raised.value.code == fixture["expectedFailure"]["code"]


def testEfficacyStageRejectsStaleContentEvidence() -> None:
    with pytest.raises(EfficacyStageInvalid) as raised:
        resolveEfficacyStage(e0Candidate(), currentContentHash="sha256-" + ("b" * 64))

    assert raised.value.code == "stale-content-evidence"


def testPortfolioDoesNotHideOneFailedPathInAggregate() -> None:
    passed = e0Candidate("passed-path")
    failed = e0Candidate("failed-path")
    failed["contentApproved"] = False

    result = resolvePathPortfolio(
        [passed, failed],
        currentContentHashes={"passed-path": CONTENT_HASH, "failed-path": CONTENT_HASH},
    )

    assert result["passed-path"]["passed"] is True
    assert result["failed-path"] == {
        "code": "content-review-required",
        "passed": False,
        "pathId": "failed-path",
    }


def testResearchOperationsRequireNinetyDayDeletionAndReceipts() -> None:
    wrongRetention = e2Candidate()
    wrongRetention["researchOperations"]["deletionJob"]["retentionDays"] = 91
    with pytest.raises(EfficacyStageInvalid) as raised:
        resolveEfficacyStage(wrongRetention, currentContentHash=CONTENT_HASH)
    assert raised.value.code == "invalid-deletion-job"

    missingWithdrawalReceipt = e2Candidate()
    missingWithdrawalReceipt["researchOperations"]["withdrawalTestReceiptHash"] = None
    with pytest.raises(EfficacyStageInvalid) as raised:
        resolveEfficacyStage(missingWithdrawalReceipt, currentContentHash=CONTENT_HASH)
    assert raised.value.code == "incomplete-research-operations"


def testResearchAndPrivacyOwnersMustBeDistinct() -> None:
    candidate = e2Candidate()
    candidate["researchOperations"]["privacyOwner"] = "research-owner"

    with pytest.raises(EfficacyStageInvalid) as raised:
        resolveEfficacyStage(candidate, currentContentHash=CONTENT_HASH)

    assert raised.value.code == "research-owner-independence-required"


def testResearchOperationsRejectSecretAndUserPath() -> None:
    pathLeak = e2Candidate()
    pathLeak["researchOperations"]["accessRoster"] = "C:\\Users\\person\\research-roster.yml"
    with pytest.raises(EfficacyStageInvalid) as raised:
        resolveEfficacyStage(pathLeak, currentContentHash=CONTENT_HASH)
    assert raised.value.code == "research-operations-sensitive-data"

    secretLeak = e2Candidate()
    secretLeak["researchOperations"]["encryptedRawStore"] = "sk-example-secret-value"
    with pytest.raises(EfficacyStageInvalid) as raised:
        resolveEfficacyStage(secretLeak, currentContentHash=CONTENT_HASH)
    assert raised.value.code == "research-operations-sensitive-data"


def testPathReleaseStateSeparatesBetaFromFeatured() -> None:
    beta = resolveFeaturedPathStatus(e2Candidate(), currentContentHash=CONTENT_HASH)
    assert isinstance(beta, PathReleaseState)
    assert beta.visibility == "beta"
    assert beta.allowedClaim == "learningSignal"

    e3 = e2Candidate()
    e3.update({
        "targetStage": "E3",
        "participantsPerArm": 60,
        "powerStatus": "active",
        "effectReportHash": CONTENT_HASH,
    })
    featured = resolveFeaturedPathStatus(e3, currentContentHash=CONTENT_HASH)
    assert featured.visibility == "featured"
    assert featured.allowedClaim == "effectVerified"


def testShellReleaseDoesNotPromoteFailedPath() -> None:
    passed = e0Candidate("passed-path")
    failed = e0Candidate("failed-path")
    failed["contentApproved"] = False

    result = productReleaseAggregate(
        [passed, failed],
        currentContentHashes={
            "passed-path": CONTENT_HASH,
            "failed-path": CONTENT_HASH,
        },
        shellReleaseEligible=True,
    )

    assert result["shellReleaseEligible"] is True
    assert result["allPathsEffectVerified"] is False
    assert result["failedPathIds"] == ["failed-path"]
