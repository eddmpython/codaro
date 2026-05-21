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
        "ai-live-smoke",
        "editor-runtime-preflight",
        "learning-system-readiness",
        "learning-goal-audit",
        "dogfood-alpha-audit",
        "product-quality-audit",
        "service-readiness-audit",
        "diagnostic-summary-contract",
        "install-launcher-smoke",
        "runtime-recovery-contract",
        "runtime-recovery-browser",
        "curriculum-quality-matrix",
        "onboarding-browser",
        "frontend-performance-budget",
        "learning-card-contract",
        "learning-card-browser",
        "provider-settings-browser",
        "editor-build",
        "landing-build",
        "launcher-check",
        "launcher-test",
    }
    assert runner.PREFLIGHT_GATES == ("docs", "backend")
    assert runner.PRODUCT_QUALITY_GATES == (
        "docs",
        "backend",
        "learning-system-readiness",
        "dogfood-alpha-audit",
        "product-quality-audit",
        "diagnostic-summary-contract",
        "ai-live-smoke",
        "provider-settings-browser",
        "install-launcher-smoke",
        "runtime-recovery-contract",
        "runtime-recovery-browser",
        "curriculum-quality-matrix",
        "onboarding-browser",
        "frontend-performance-budget",
        "landing-build",
        "launcher-test",
    )


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


def testGateSequencePrintsReadableSummary(monkeypatch, capsys) -> None:
    runner = loadRunner()
    calls: list[str] = []

    def fakeRunGate(name: str) -> int:
        calls.append(name)
        return 0

    monkeypatch.setattr(runner, "runGate", fakeRunGate)

    assert runner.runGateSequence(("docs", "backend")) == 0

    captured = capsys.readouterr()
    assert calls == ["docs", "backend"]
    assert "ok: gate sequence passed 2/2 gates" in captured.out
    assert "gates: docs(" in captured.out
    assert "backend(" in captured.out


def testGateSequenceFailureReportsCompletedGates(monkeypatch, capsys) -> None:
    runner = loadRunner()

    def fakeRunGate(name: str) -> int:
        return 7 if name == "backend" else 0

    monkeypatch.setattr(runner, "runGate", fakeRunGate)

    assert runner.runGateSequence(("docs", "backend", "landing-build")) == 7

    captured = capsys.readouterr()
    assert "FAIL: gate sequence stopped at backend after 1/3 gates" in captured.err
    assert "passed gates: docs(" in captured.err
