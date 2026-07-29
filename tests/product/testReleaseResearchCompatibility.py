from __future__ import annotations

from copy import deepcopy

import pytest

from codaro.releaseResearch import (
    COMPATIBILITY_TOMBSTONES,
    CompatibilityMilestone,
    CompatibilityReleaseInvalid,
    telemetryPolicyHash,
    verifyCompatibilityRelease,
)


HASH_A = "sha256-" + ("a" * 64)
HASH_B = "sha256-" + ("b" * 64)
HASH_C = "sha256-" + ("c" * 64)
HASH_D = "sha256-" + ("d" * 64)


def compatibilityCandidate(milestone: str = "C3") -> dict[str, object]:
    policy: dict[str, object] = {
        "sealedAt": "2026-01-01T00:00:00Z",
        "minimumWindowDays": 28,
        "minimumEligibleSessions": 100,
        "maximumLegacyRequestRate": 0.01,
    }
    policy["sha256"] = telemetryPolicyHash(policy)
    return {
        "milestone": milestone,
        "releaseArchiveUrl": "https://example.invalid/releases/c0.zip",
        "releaseArchiveSha256": HASH_A,
        "deployedTreeSha256": HASH_B,
        "deployedCrawlSha256": HASH_B,
        "stableReleaseIds": ["stable-1", "stable-2"],
        "appTreeSha256": HASH_B,
        "runTreeSha256": HASH_C,
        "outputCollisionCount": 0,
        "serviceWorkerScopes": ["/codaro/app/", "/codaro/run/"],
        "directReloadPassed": True,
        "deepReloadPassed": True,
        "coldOnlinePythonPassed": True,
        "rollbackArchiveSha256": HASH_D,
        "scopeAuditSha256": HASH_A,
        "compatibilityPagePassed": True,
        "queryRoundTripPassed": True,
        "hashRoundTripPassed": True,
        "backForwardPassed": True,
        "ownedCacheOnly": True,
        "exactUnregisterPassed": True,
        "tombstonePaths": list(COMPATIBILITY_TOMBSTONES),
        "unregisterReleaseMarker": "stable-1-to-stable-2",
        "navigationAuditSha256": HASH_B,
        "ownedCacheAuditSha256": HASH_C,
        "telemetryPolicy": policy,
        "telemetryReport": {
            "windowStartedAt": "2026-02-01T00:00:00Z",
            "windowEndedAt": "2026-03-01T00:00:00Z",
            "eligibleSessions": 200,
            "legacyRequests": 1,
            "reportSha256": HASH_D,
        },
        "retirementDiffSha256": HASH_A,
        "previousUrlSmokePassed": True,
    }


def testCompatibilityMilestonesVerifyCumulatively() -> None:
    for milestone, expectedFacts in (
        (CompatibilityMilestone.C0, {"C0"}),
        (CompatibilityMilestone.C1, {"C0", "C1"}),
        (CompatibilityMilestone.C2, {"C0", "C1", "C2"}),
        (CompatibilityMilestone.C3, {"C0", "C1", "C2", "C3"}),
    ):
        candidate = compatibilityCandidate(milestone.value)
        if milestone is CompatibilityMilestone.C1:
            candidate["stableReleaseIds"] = ["stable-1"]
        result = verifyCompatibilityRelease(candidate)

        assert set(result["facts"]) == expectedFacts
        assert result["appAssetsRetired"] is (milestone is CompatibilityMilestone.C3)
        assert result["tombstoneRequired"] is (milestone is CompatibilityMilestone.C2)


def testC1RejectsScopeDriftAndTreeCollision() -> None:
    scopeDrift = compatibilityCandidate("C1")
    scopeDrift["stableReleaseIds"] = ["stable-1"]
    scopeDrift["serviceWorkerScopes"] = ["/"]
    with pytest.raises(CompatibilityReleaseInvalid) as raised:
        verifyCompatibilityRelease(scopeDrift)
    assert raised.value.code == "service-worker-scope-drift"

    collision = compatibilityCandidate("C1")
    collision["stableReleaseIds"] = ["stable-1"]
    collision["runTreeSha256"] = HASH_B
    with pytest.raises(CompatibilityReleaseInvalid) as raised:
        verifyCompatibilityRelease(collision)
    assert raised.value.code == "run-app-tree-collision"


def testC2RequiresTwoReleasesAndExactOwnedTombstones() -> None:
    oneRelease = compatibilityCandidate("C2")
    oneRelease["stableReleaseIds"] = ["stable-1"]
    with pytest.raises(CompatibilityReleaseInvalid) as raised:
        verifyCompatibilityRelease(oneRelease)
    assert raised.value.code == "stable-release-history-invalid"

    broadUnregister = compatibilityCandidate("C2")
    broadUnregister["exactUnregisterPassed"] = False
    with pytest.raises(CompatibilityReleaseInvalid) as raised:
        verifyCompatibilityRelease(broadUnregister)
    assert raised.value.code == "exact-unregister-required"

    foreignTombstone = compatibilityCandidate("C2")
    foreignTombstone["tombstonePaths"] = ["/serviceWorker.js"]
    with pytest.raises(CompatibilityReleaseInvalid) as raised:
        verifyCompatibilityRelease(foreignTombstone)
    assert raised.value.code == "compatibility-tombstone-drift"


def testC3RejectsShortWindowAndPosthocThreshold() -> None:
    shortWindow = compatibilityCandidate()
    shortWindow["telemetryReport"] = {
        **shortWindow["telemetryReport"],
        "windowEndedAt": "2026-02-14T00:00:00Z",
    }
    with pytest.raises(CompatibilityReleaseInvalid) as raised:
        verifyCompatibilityRelease(shortWindow)
    assert raised.value.code == "telemetry-window-too-short"

    posthoc = compatibilityCandidate()
    policy = deepcopy(posthoc["telemetryPolicy"])
    policy["sealedAt"] = "2026-02-02T00:00:00Z"
    policy["sha256"] = telemetryPolicyHash(policy)
    posthoc["telemetryPolicy"] = policy
    with pytest.raises(CompatibilityReleaseInvalid) as raised:
        verifyCompatibilityRelease(posthoc)
    assert raised.value.code == "telemetry-policy-sealed-too-late"


def testC3RejectsThresholdFailureAndTamperedPolicy() -> None:
    thresholdFailure = compatibilityCandidate()
    thresholdFailure["telemetryReport"] = {
        **thresholdFailure["telemetryReport"],
        "legacyRequests": 3,
    }
    with pytest.raises(CompatibilityReleaseInvalid) as raised:
        verifyCompatibilityRelease(thresholdFailure)
    assert raised.value.code == "telemetry-threshold-not-met"

    tampered = compatibilityCandidate()
    tampered["telemetryPolicy"]["maximumLegacyRequestRate"] = 0.02
    with pytest.raises(CompatibilityReleaseInvalid) as raised:
        verifyCompatibilityRelease(tampered)
    assert raised.value.code == "telemetry-policy-hash-mismatch"
