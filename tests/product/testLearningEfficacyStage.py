from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from codaro.curriculum.efficacyStage import EfficacyStageInvalid, resolveEfficacyStage, resolvePathPortfolio


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
