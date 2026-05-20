from __future__ import annotations

import importlib.util
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDIT_PATH = ROOT / "tests" / "verifyLearningGoalObjectiveAudit.py"


def loadAuditModule():
    spec = importlib.util.spec_from_file_location("codaroLearningGoalAudit", AUDIT_PATH)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def fakeResult(identifier: str, passed: bool) -> dict[str, Any]:
    return {
        "id": identifier,
        "passed": passed,
        "requirement": identifier,
        "evidence": [],
        "missing": [] if passed else [f"{identifier}: missing proof"],
    }


def testGoalAuditRequiresEveryExplicitRequirement() -> None:
    audit = loadAuditModule()
    results = tuple(
        fakeResult(f"requirement-{index}", passed=index != 0)
        for index in range(audit.MINIMUM_SCORE + 1)
    )

    payload = audit.buildAuditPayload(results)

    assert payload["score"] >= audit.MINIMUM_SCORE
    assert payload["requiredScore"] == len(results)
    assert payload["requirementFailures"] == ["requirement-0"]
    assert payload["passed"] is False


def testGoalAuditPassesWhenAllRequirementsPass() -> None:
    audit = loadAuditModule()
    results = tuple(
        fakeResult(f"requirement-{index}", passed=True)
        for index in range(audit.MINIMUM_SCORE + 1)
    )

    payload = audit.buildAuditPayload(results)

    assert payload["score"] == len(results)
    assert payload["requirementFailures"] == []
    assert payload["passed"] is True
