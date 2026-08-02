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
    assert decision["localWindows"]["minimumBuild"] == 19045
    assert decision["localWindows"]["nativeExecutorMayGrantStrongCredit"] is False
    assert decision["localWindows"]["requiredIsolation"] == "windows-appcontainer"
    assert decision["localWindows"]["requiredNativeGates"] == [
        "launcher-test",
        "product-browser-webview2-fixed",
    ]
    assert decision["enforcementState"] == "enforced"
    assert decision["policyVersion"] == 2


def testCapabilityDecisionDoesNotHideSupportedCandidate() -> None:
    decision = capabilityDecision(
        {"candidateAEligible": True},
        {"candidateEligible": True},
    )

    assert decision["browser"]["decision"] == "opaque-frame-supported"
    assert decision["browser"]["localRequiredKinds"] == []
    assert decision["browser"]["strongKinds"] == ["behavior", "output", "variable"]
    assert decision["localWindows"]["decision"] == "supported"
    assert decision["localWindows"]["nativeExecutorMayGrantStrongCredit"] is True


def testPercentileUsesObservedUpperSample() -> None:
    assert percentile([10.0, 20.0, 30.0, 40.0, 50.0], 0.95) == 50
