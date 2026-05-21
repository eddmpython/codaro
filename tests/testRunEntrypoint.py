from __future__ import annotations

import importlib.util
import json
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


def testCurrentGitHeadReadsCommonWorktreeRefs(monkeypatch, tmp_path) -> None:
    runner = loadRunner()
    sha = "a" * 40
    commonGitDir = tmp_path / "git-store"
    worktreeGitDir = commonGitDir / "worktrees" / "codaro"
    refPath = commonGitDir / "refs" / "heads" / "main"
    worktreeGitDir.mkdir(parents=True)
    refPath.parent.mkdir(parents=True)
    (tmp_path / ".git").write_text(f"gitdir: {worktreeGitDir}\n", encoding="utf-8")
    (worktreeGitDir / "HEAD").write_text("ref: refs/heads/main\n", encoding="utf-8")
    (worktreeGitDir / "commondir").write_text("../..\n", encoding="utf-8")
    refPath.write_text(f"{sha}\n", encoding="utf-8")

    monkeypatch.setattr(runner, "ROOT", tmp_path)

    assert runner.currentGitHead() == sha


def testAuditSelfPasses() -> None:
    runner = loadRunner()

    assert runner.auditSelf() == 0


def testGateSequencePrintsReadableSummary(monkeypatch, capsys, tmp_path) -> None:
    runner = loadRunner()
    calls: list[str] = []
    artifactRelPath = "output/test-runner/backend/evidence.json"

    def fakeRunGate(name: str) -> int:
        calls.append(name)
        if name == "backend":
            artifactPath = tmp_path / artifactRelPath
            artifactPath.parent.mkdir(parents=True, exist_ok=True)
            artifactPath.write_text('{"passed": true}\n', encoding="utf-8")
        return 0

    monkeypatch.setattr(runner, "ROOT", tmp_path)
    monkeypatch.setattr(runner, "GATE_WORK_ROOT", tmp_path)
    monkeypatch.setattr(runner, "GATE_ARTIFACTS", {"backend": (artifactRelPath,)})
    monkeypatch.setattr(runner, "runGate", fakeRunGate)

    assert runner.runGateSequence(("docs", "backend"), sequenceName="unit-sequence") == 0

    captured = capsys.readouterr()
    assert calls == ["docs", "backend"]
    assert "ok: gate sequence passed 2/2 gates" in captured.out
    assert "gates: docs(" in captured.out
    assert "backend(" in captured.out

    payload = json.loads((tmp_path / "unit-sequence" / "sequence-summary.json").read_text(encoding="utf-8"))
    assert payload["sequence"] == "unit-sequence"
    assert payload["passed"] is True
    assert payload["completedGateCount"] == 2
    assert payload["totalGateCount"] == 2
    summaryPath = payload["summaryPath"]
    assert summaryPath.endswith("unit-sequence\\sequence-summary.json") or summaryPath.endswith(
        "unit-sequence/sequence-summary.json"
    )
    assert payload["gitHead"] is None
    assert payload["failedGate"] is None
    assert [item["gate"] for item in payload["gates"]] == ["docs", "backend"]
    assert payload["gates"][0]["artifacts"] == []
    backendArtifacts = payload["gates"][1]["artifacts"]
    assert len(backendArtifacts) == 1
    assert backendArtifacts[0]["path"] == artifactRelPath
    assert backendArtifacts[0]["exists"] is True
    assert backendArtifacts[0]["fresh"] is True
    assert isinstance(backendArtifacts[0]["modifiedAtNs"], int)


def testRunCommandWritesRepoLocalFailureLog(monkeypatch, capsys, tmp_path) -> None:
    runner = loadRunner()
    monkeypatch.setattr(runner, "ROOT", tmp_path)
    monkeypatch.setattr(runner, "GATE_WORK_ROOT", tmp_path / "output" / "test-runner")

    returnCode = runner.runCommand(
        "unit-gate",
        runner.GateCommand(
            args=(
                sys.executable,
                "-c",
                "import sys; print('visible stdout'); print('visible stderr', file=sys.stderr); sys.exit(3)",
            ),
            cwd=".",
        ),
    )

    assert returnCode == 3
    captured = capsys.readouterr()
    assert "visible stdout" in captured.out
    assert "visible stderr" in captured.out
    assert "command log:" in captured.err
    logs = sorted((tmp_path / "output" / "test-runner" / "unit-gate" / "logs").glob("*.log"))
    assert len(logs) == 1
    logText = logs[0].read_text(encoding="utf-8")
    assert "visible stdout" in logText
    assert "visible stderr" in logText
    assert "exit: 3" in logText


def testRunCommandTimesOutWithLog(monkeypatch, capsys, tmp_path) -> None:
    runner = loadRunner()
    monkeypatch.setattr(runner, "ROOT", tmp_path)
    monkeypatch.setattr(runner, "GATE_WORK_ROOT", tmp_path / "output" / "test-runner")

    returnCode = runner.runCommand(
        "unit-timeout",
        runner.GateCommand(
            args=(
                sys.executable,
                "-c",
                "import time; print('starting long command', flush=True); time.sleep(10)",
            ),
            cwd=".",
            timeoutSeconds=1,
        ),
    )

    assert returnCode == 124
    captured = capsys.readouterr()
    assert "command log:" in captured.err
    assert "timeout: exceeded 1s" in captured.out
    logs = sorted((tmp_path / "output" / "test-runner" / "unit-timeout" / "logs").glob("*.log"))
    assert len(logs) == 1
    logText = logs[0].read_text(encoding="utf-8")
    assert "starting long command" in logText
    assert "timeout: exceeded 1s" in logText
    assert "exit: 124" in logText


def testGateSequenceRecordsArtifactPayloadMetadata(monkeypatch, tmp_path) -> None:
    runner = loadRunner()
    artifactRelPath = "output/test-runner/ai-live-smoke/live-smoke-report.json"

    def fakeRunGate(name: str) -> int:
        artifactPath = tmp_path / artifactRelPath
        artifactPath.parent.mkdir(parents=True, exist_ok=True)
        artifactPath.write_text(
            json.dumps({
                "passed": True,
                "status": "passed",
                "startedAt": "2026-05-22T00:00:00+00:00",
                "completedAt": "2026-05-22T00:00:03+00:00",
                "durationMs": 3000,
                "gitHead": "abcdef1",
            }),
            encoding="utf-8",
        )
        return 0

    monkeypatch.setattr(runner, "ROOT", tmp_path)
    monkeypatch.setattr(runner, "GATE_WORK_ROOT", tmp_path)
    monkeypatch.setattr(runner, "GATE_ARTIFACTS", {"ai-live-smoke": (artifactRelPath,)})
    monkeypatch.setattr(runner, "currentGitHead", lambda: "abcdef1234567890")
    monkeypatch.setattr(runner, "runGate", fakeRunGate)

    assert runner.runGateSequence(("ai-live-smoke",), sequenceName="artifact-sequence") == 0

    payload = json.loads((tmp_path / "artifact-sequence" / "sequence-summary.json").read_text(encoding="utf-8"))
    artifact = payload["gates"][0]["artifacts"][0]
    assert payload["gitHead"] == "abcdef1234567890"
    assert artifact["payloadReadable"] is True
    assert artifact["payloadPassed"] is True
    assert artifact["payloadStatus"] == "passed"
    assert artifact["payloadGitHead"] == "abcdef1"
    assert artifact["gitHeadMatches"] is True
    assert artifact["payloadDurationMs"] == 3000


def testGateSequenceFailsWhenArtifactGitHeadDoesNotMatch(monkeypatch, capsys, tmp_path) -> None:
    runner = loadRunner()
    artifactRelPath = "output/test-runner/ai-live-smoke/live-smoke-report.json"

    def fakeRunGate(name: str) -> int:
        artifactPath = tmp_path / artifactRelPath
        artifactPath.parent.mkdir(parents=True, exist_ok=True)
        artifactPath.write_text(
            json.dumps({"passed": True, "status": "passed", "gitHead": "deadbeef"}),
            encoding="utf-8",
        )
        return 0

    monkeypatch.setattr(runner, "ROOT", tmp_path)
    monkeypatch.setattr(runner, "GATE_WORK_ROOT", tmp_path)
    monkeypatch.setattr(runner, "GATE_ARTIFACTS", {"ai-live-smoke": (artifactRelPath,)})
    monkeypatch.setattr(runner, "currentGitHead", lambda: "abcdef1234567890")
    monkeypatch.setattr(runner, "runGate", fakeRunGate)

    assert runner.runGateSequence(("ai-live-smoke", "backend"), sequenceName="stale-artifact-sequence") == 1

    captured = capsys.readouterr()
    assert "FAIL: gate sequence stopped at ai-live-smoke" in captured.err
    payload = json.loads((tmp_path / "stale-artifact-sequence" / "sequence-summary.json").read_text(encoding="utf-8"))
    firstGate = payload["gates"][0]
    artifact = firstGate["artifacts"][0]
    assert payload["passed"] is False
    assert payload["failedGate"] == "ai-live-smoke"
    assert firstGate["commandReturnCode"] == 0
    assert firstGate["returnCode"] == 1
    assert firstGate["artifactFailure"] is True
    assert artifact["payloadGitHead"] == "deadbeef"
    assert artifact["gitHeadMatches"] is False


def testGateSequenceFailureReportsCompletedGates(monkeypatch, capsys, tmp_path) -> None:
    runner = loadRunner()

    def fakeRunGate(name: str) -> int:
        return 7 if name == "backend" else 0

    monkeypatch.setattr(runner, "GATE_WORK_ROOT", tmp_path)
    monkeypatch.setattr(runner, "runGate", fakeRunGate)

    assert runner.runGateSequence(("docs", "backend", "landing-build"), sequenceName="failing-sequence") == 7

    captured = capsys.readouterr()
    assert "FAIL: gate sequence stopped at backend after 1/3 gates" in captured.err
    assert "passed gates: docs(" in captured.err

    payload = json.loads((tmp_path / "failing-sequence" / "sequence-summary.json").read_text(encoding="utf-8"))
    assert payload["passed"] is False
    assert payload["completedGateCount"] == 1
    assert payload["totalGateCount"] == 3
    assert payload["failedGate"] == "backend"
    assert [item["returnCode"] for item in payload["gates"]] == [0, 7]


def testGateSequenceSummaryIncludesCommandLogs(monkeypatch, tmp_path) -> None:
    runner = loadRunner()
    monkeypatch.setattr(runner, "ROOT", tmp_path)
    monkeypatch.setattr(runner, "GATE_WORK_ROOT", tmp_path / "output" / "test-runner")
    monkeypatch.setattr(runner, "GATES", {
        "unit-log": runner.Gate(
            tier="fast",
            description="unit log gate",
            commands=(
                runner.GateCommand(
                    args=(sys.executable, "-c", "print('sequence evidence log')"),
                    cwd=".",
                ),
            ),
        ),
    })

    assert runner.runGateSequence(("unit-log",), sequenceName="unit-log-sequence") == 0

    payload = json.loads(
        (tmp_path / "output" / "test-runner" / "unit-log-sequence" / "sequence-summary.json").read_text(
            encoding="utf-8"
        )
    )
    logs = payload["gates"][0]["logs"]
    assert len(logs) == 1
    assert logs[0]["path"].endswith(".log")
    assert logs[0]["exists"] is True
    assert logs[0]["fresh"] is True
    assert logs[0]["bytes"] > 0


def testGateSequenceContinuesThroughSoftLiveCredentialMissing(monkeypatch, capsys, tmp_path) -> None:
    runner = loadRunner()
    calls: list[str] = []

    def fakeRunGate(name: str) -> int:
        calls.append(name)
        return 2 if name == "ai-live-smoke" else 0

    monkeypatch.setattr(runner, "GATE_WORK_ROOT", tmp_path)
    monkeypatch.setattr(runner, "runGate", fakeRunGate)

    assert runner.runGateSequence(
        ("docs", "ai-live-smoke", "backend"),
        sequenceName="soft-sequence",
    ) == 0

    captured = capsys.readouterr()
    assert calls == ["docs", "ai-live-smoke", "backend"]
    assert "soft gates: ai-live-smoke(exit 2)" in captured.out

    payload = json.loads((tmp_path / "soft-sequence" / "sequence-summary.json").read_text(encoding="utf-8"))
    assert payload["passed"] is True
    assert payload["failedGate"] is None
    assert payload["completedGateCount"] == 2
    assert payload["softFailureCount"] == 1
    assert [item["returnCode"] for item in payload["gates"]] == [0, 2, 0]
    assert payload["gates"][1]["softFailure"] is True


def testGateSequenceStillFailsHardLiveProviderFailure(monkeypatch, capsys, tmp_path) -> None:
    runner = loadRunner()
    calls: list[str] = []

    def fakeRunGate(name: str) -> int:
        calls.append(name)
        return 1 if name == "ai-live-smoke" else 0

    monkeypatch.setattr(runner, "GATE_WORK_ROOT", tmp_path)
    monkeypatch.setattr(runner, "runGate", fakeRunGate)

    assert runner.runGateSequence(
        ("docs", "ai-live-smoke", "backend"),
        sequenceName="hard-live-sequence",
    ) == 1

    captured = capsys.readouterr()
    assert calls == ["docs", "ai-live-smoke"]
    assert "FAIL: gate sequence stopped at ai-live-smoke after 1/3 gates" in captured.err

    payload = json.loads((tmp_path / "hard-live-sequence" / "sequence-summary.json").read_text(encoding="utf-8"))
    assert payload["passed"] is False
    assert payload["failedGate"] == "ai-live-smoke"
    assert payload["completedGateCount"] == 1
    assert payload["softFailureCount"] == 0
    assert payload["gates"][1]["softFailure"] is False
