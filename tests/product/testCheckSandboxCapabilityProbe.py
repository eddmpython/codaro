from __future__ import annotations

from checkSandboxCapabilityProbe import capabilityDecision, percentile


def testCapabilityDecisionFallsBackWithoutOpaqueFrameSupport() -> None:
    decision = capabilityDecision(
        {"candidateAEligible": False},
        {"candidateEligible": False},
    )

    assert decision["browser"] == {
        "decision": "candidate-b-supported-subset",
        "localRequiredKinds": ["behavior"],
        "strongKinds": ["output", "variable"],
    }
    assert decision["localWindows"]["decision"] == "unsupported"
    assert decision["localWindows"]["provisionalExecutorMayGrantStrongCredit"] is False
    assert decision["enforcementState"] == "pending-implementation-workstream"


def testCapabilityDecisionDoesNotHideSupportedCandidate() -> None:
    decision = capabilityDecision(
        {"candidateAEligible": True},
        {"candidateEligible": True},
    )

    assert decision["browser"]["decision"] == "opaque-frame-supported"
    assert decision["browser"]["localRequiredKinds"] == []
    assert decision["browser"]["strongKinds"] == ["behavior", "output", "variable"]
    assert decision["localWindows"]["decision"] == "supported"


def testPercentileUsesObservedUpperSample() -> None:
    assert percentile([10.0, 20.0, 30.0, 40.0, 50.0], 0.95) == 50
