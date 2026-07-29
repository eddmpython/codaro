from __future__ import annotations

import importlib.util
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
VERIFIER_PATH = ROOT / "tests" / "surface" / "verifyVisualAccessibilityPlaywright.py"


def loadVerifier():
    spec = importlib.util.spec_from_file_location("codaroVisualAccessibilityVerifier", VERIFIER_PATH)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def testVisualAccessibilityMatrixCoversRepresentativeBrowserContract() -> None:
    verifier = loadVerifier()
    cases = verifier.VISUAL_ACCESSIBILITY_CASES

    assert len(cases) == 14
    assert {case.engine for case in cases} == {"chromium", "firefox", "webkit"}
    assert {case.product for case in cases} == {"landing", "run", "local"}
    assert {case.width for case in cases} == {320, 390, 900, 1440}
    assert {case.theme for case in cases} == {"light", "dark"}
    assert {case.density for case in cases} == {
        "public",
        "learningComfortable",
        "studioDense",
    }
    assert sum(case.forcedColors for case in cases) == 3
    assert sum(case.reducedMotion for case in cases) == 1
    assert sum(case.keyboardDialog for case in cases) == 6


def testVisualAccessibilityReportCarriesMachineAndManualEvidenceBoundary() -> None:
    verifier = loadVerifier()
    payload = verifier.buildReport(
        startedAt="2026-07-26T00:00:00+00:00",
        startedMonotonic=time.monotonic(),
        results=[{"passed": True}] * 14,
        failures=[],
        browserVersions={
            "chromium": "unit-chromium",
            "firefox": "unit-firefox",
            "webkit": "unit-webkit",
        },
    )

    assert payload["schemaVersion"] == 2
    assert payload["gate"] == "visual-accessibility-browser"
    assert payload["passed"] is True
    assert payload["status"] == "passed"
    assert payload["gitHead"]
    assert payload["playwright"]["lockedVersion"] == "1.61.0"
    assert payload["matrix"]["caseCount"] == 14
    assert payload["matrix"]["engines"] == ["chromium", "firefox", "webkit"]
    assert payload["matrix"]["viewportWidths"] == [320, 390, 900, 1440]
    assert payload["matrix"]["forcedColorsCaseCount"] == 3
    assert payload["matrix"]["publicExperienceCaseCount"] == 8
    assert payload["matrix"]["publicKeyboardJourneyCaseCount"] == 5
    assert payload["failureCount"] == 0
    assert "installed Windows WebView2 rendering" in payload["manualEvidenceNotClaimed"]
    assert "independent human brand review" in payload["manualEvidenceNotClaimed"]
    assert payload["reportPath"] == (
        "output/test-runner/visual-accessibility-browser/visual-accessibility-report.json"
    )
