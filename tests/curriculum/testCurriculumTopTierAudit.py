from __future__ import annotations

import runpy
from pathlib import Path


AUDIT = runpy.run_path(str(Path(__file__).with_name("verifyCurriculumTopTierAudit.py")))
eligibilityStatus = AUDIT["eligibilityStatus"]


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
