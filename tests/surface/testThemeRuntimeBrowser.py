from __future__ import annotations

import importlib.util
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
VERIFIER_PATH = ROOT / "tests" / "surface" / "verifyThemeRuntimePlaywright.py"


def loadVerifier():
    spec = importlib.util.spec_from_file_location("codaroThemeRuntimeVerifier", VERIFIER_PATH)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def testThemeRuntimeMatrixCoversSharedRuntimeContract() -> None:
    verifier = loadVerifier()
    cases = verifier.THEME_RUNTIME_CASES

    assert len(cases) == 8
    assert {case.product for case in cases} == {"landing", "run", "local"}
    assert {case.storedTheme for case in cases} == {None, "light", "dark"}
    assert {case.expectedTheme for case in cases} == {"light", "dark"}
    assert {case.expectedDensity for case in cases} == {
        "public",
        "learningComfortable",
        "studioDense",
    }
    assert {case.expectedAccent for case in cases} == {"plum", "blue", "teal"}
    assert {case.reducedMotion for case in cases} == {False, True}
    assert {case.product for case in cases if case.systemLiveSwitch} == {"landing", "local"}
    assert {case.product for case in cases if case.togglePersistence} == {"landing", "run"}


def testThemeRuntimeReportCarriesCurrentEvidenceMetadata() -> None:
    verifier = loadVerifier()
    payload = verifier.buildReport(
        startedAt="2026-07-26T00:00:00+00:00",
        startedMonotonic=time.monotonic(),
        results=[],
        failures=[],
        browserVersion="unit",
    )

    assert payload["schemaVersion"] == 1
    assert payload["gate"] == "theme-runtime-browser"
    assert payload["passed"] is True
    assert payload["status"] == "passed"
    assert payload["gitHead"]
    assert payload["startedAt"] == "2026-07-26T00:00:00+00:00"
    assert payload["completedAt"]
    assert isinstance(payload["durationMs"], int)
    assert payload["browser"] == {"engine": "chromium", "version": "unit"}
    assert payload["matrix"]["caseCount"] == 8
    assert payload["matrix"]["products"] == ["landing", "local", "run"]
    assert payload["failureCount"] == 0
    assert payload["reportPath"] == "output/test-runner/theme-runtime-browser/theme-runtime-report.json"
