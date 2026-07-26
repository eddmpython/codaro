from __future__ import annotations

import importlib.util
from pathlib import Path
from types import ModuleType


ROOT = Path(__file__).resolve().parents[2]
VERIFIER_PATH = ROOT / "tests" / "surface" / "verifyDesignSystemContract.py"


def loadVerifier() -> ModuleType:
    spec = importlib.util.spec_from_file_location("verifyDesignSystemContractUnderTest", VERIFIER_PATH)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def testDesignSystemReportCarriesCurrentCommitEvidence(monkeypatch) -> None:
    verifier = loadVerifier()
    gitHead = "a" * 40
    monkeypatch.setattr(verifier, "currentGitHead", lambda: gitHead)
    monkeypatch.setattr(verifier, "utcTimestamp", lambda: "2026-07-26T15:40:00+00:00")

    payload = verifier.buildReportPayload(
        tokens={"astryx": {"core": "0.1.6"}},
        compatibility={"sharedPackages": {"@astryxdesign/core": "0.1.6"}},
        failures=[],
        startedAt="2026-07-26T15:39:59+00:00",
        durationMs=1000,
    )

    assert payload["schemaVersion"] == 1
    assert payload["gate"] == "design-system-contract"
    assert payload["passed"] is True
    assert payload["status"] == "passed"
    assert payload["gitHead"] == gitHead
    assert payload["startedAt"] == "2026-07-26T15:39:59+00:00"
    assert payload["completedAt"] == "2026-07-26T15:40:00+00:00"
    assert payload["durationMs"] == 1000
    assert payload["reportPath"] == "output/test-runner/design-system-contract/design-system-report.json"
