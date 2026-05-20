from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RUNNER_PATH = ROOT / "tests" / "run.py"


def loadRunner():
    spec = importlib.util.spec_from_file_location("codaroTestRunner", RUNNER_PATH)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def testGateNamesAreStable() -> None:
    runner = loadRunner()

    assert set(runner.GATES) == {
        "docs",
        "backend",
        "teacher-eval",
        "teacher-e2e",
        "assistant-workloop-contract",
        "editor-runtime-preflight",
        "learning-system-readiness",
        "learning-card-contract",
        "learning-card-browser",
        "editor-build",
        "landing-build",
        "launcher-check",
        "launcher-test",
    }
    assert runner.PREFLIGHT_GATES == ("docs", "backend")


def testCiWorkflowReferencesKnownRequiredGates() -> None:
    runner = loadRunner()

    ciNames = runner.ciGateNames()
    assert ciNames <= set(runner.GATES)
    assert {
        name
        for name, gate in runner.GATES.items()
        if gate.ci_required
    } <= ciNames


def testAuditSelfPasses() -> None:
    runner = loadRunner()

    assert runner.auditSelf() == 0
