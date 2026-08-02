from __future__ import annotations

import runpy
from pathlib import Path


AUDIT = runpy.run_path(str(Path(__file__).with_name("verifyCurriculumTopTierAudit.py")))
eligibilityStatus = AUDIT["eligibilityStatus"]
learningEvidenceProfile = AUDIT["learningEvidenceProfile"]


def testMachineAuditPassDoesNotClaimTopTierWithoutIndependentReview() -> None:
    status = eligibilityStatus([], {
        "lessonCount": 472,
        "independentReviewApprovedLessonCount": 0,
    })

    assert status["machineAuditPassed"] is True
    assert status["topTierEligible"] is False
    assert status["humanEvidenceGaps"] == [{
        "label": "independent assessment review approval coverage",
        "detail": "0/472 = 0.000 < 0.90",
    }]


def testMachineRequirementFailureStillFailsAudit() -> None:
    status = eligibilityStatus([{"id": "strong-evidence"}], {
        "lessonCount": 472,
        "independentReviewApprovedLessonCount": 472,
    })

    assert status["machineAuditPassed"] is False
    assert status["topTierEligible"] is False
    assert status["humanEvidenceGaps"] == []


def testCanonicalAuthoringReviewMetadataCountsAsIndependentApproval() -> None:
    profile = learningEvidenceProfile({
        "assessment": {
            "authoring": {
                "independentReview": "approved",
                "reviewerId": "curriculum-integrity-review",
                "reviewedAt": "2026-08-02T13:06:47+09:00",
                "evidenceCommit": "22505376c1ba875625c425f828eff3f51bd14d3e",
            },
        },
    })

    assert profile["independentReviewStateDeclared"] is True
    assert profile["independentReviewApproved"] is True


def testLegacyDuplicateReviewObjectCannotGrantApproval() -> None:
    profile = learningEvidenceProfile({
        "assessment": {
            "authoring": {"independentReview": "pending"},
            "review": {
                "status": "approved",
                "reviewerRole": "learning-qa",
                "evidenceRef": "review.yml",
                "reviewedContentHash": "a" * 64,
            },
        },
    })

    assert profile["independentReviewApproved"] is False
