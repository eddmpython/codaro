from __future__ import annotations

import importlib.util
import json
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


def testLatestQualityCycleArtifactsRequireCurrentHeadAndLiveToolLoop(monkeypatch, tmp_path) -> None:
    audit = loadAuditModule()
    head = "abcdef1234567890abcdef1234567890abcdef12"
    monkeypatch.setattr(audit, "ROOT", tmp_path)
    monkeypatch.setattr(audit, "currentGitHead", lambda: head)
    monkeypatch.setattr(audit, "currentTrackedWorktreeChanges", lambda: ())

    writeQualityCycleSummary(audit, tmp_path, head)
    writeLiveSmokeReport(tmp_path, head[:7])

    result = audit.evaluateLatestQualityCycleArtifacts()

    assert result["passed"] is True
    assert result["id"] == "latest-quality-cycle-artifacts"
    assert any("quality-cycle completed gate count" in item for item in result["evidence"])
    assert any("ai-live-smoke live-cell-call-loop toolSequence" in item for item in result["evidence"])


def testLatestQualityCycleArtifactsRejectStaleQualityCycleHead(monkeypatch, tmp_path) -> None:
    audit = loadAuditModule()
    head = "abcdef1234567890abcdef1234567890abcdef12"
    monkeypatch.setattr(audit, "ROOT", tmp_path)
    monkeypatch.setattr(audit, "currentGitHead", lambda: head)
    monkeypatch.setattr(audit, "currentTrackedWorktreeChanges", lambda: ())

    writeQualityCycleSummary(audit, tmp_path, "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef")
    writeLiveSmokeReport(tmp_path, head[:7])

    result = audit.evaluateLatestQualityCycleArtifacts()

    assert result["passed"] is False
    assert any("quality-cycle gitHead" in item for item in result["missing"])


def writeQualityCycleSummary(audit: Any, root: Path, head: str) -> None:
    aiArtifact = {
        "path": "output/test-runner/ai-live-smoke/live-smoke-report.json",
        "exists": True,
        "fresh": True,
        "payloadReadable": True,
        "payloadPassed": True,
        "payloadStatus": "passed",
        "gitHeadMatches": True,
    }
    gates = []
    for gateName in audit.PRODUCT_QUALITY_GATES:
        gate = {
            "gate": gateName,
            "returnCode": 0,
            "commandReturnCode": 0,
            "artifactFailure": False,
            "artifacts": [],
        }
        if gateName == "ai-live-smoke":
            gate["artifacts"] = [aiArtifact]
        gates.append(gate)
    payload = {
        "sequence": "quality-cycle",
        "passed": True,
        "completedGateCount": len(audit.PRODUCT_QUALITY_GATES),
        "totalGateCount": len(audit.PRODUCT_QUALITY_GATES),
        "softFailureCount": 0,
        "gitHead": head,
        "gates": gates,
    }
    writeJson(root / "output/test-runner/quality-cycle/sequence-summary.json", payload)


def writeLiveSmokeReport(root: Path, head: str) -> None:
    payload = {
        "passed": True,
        "status": "passed",
        "gitHead": head,
        "selection": {
            "provider": "oauth-chatgpt",
            "model": "gpt-5.4",
            "credentialMissing": False,
        },
        "cases": [
            {
                "caseId": "provider-availability",
                "passed": True,
                "status": "passed",
                "signals": {"supportsNativeTools": True},
            },
            {
                "caseId": "short-answer",
                "passed": True,
                "status": "passed",
                "signals": {"answerChars": 24},
            },
            {
                "caseId": "teacher-answer",
                "passed": True,
                "status": "passed",
                "signals": {"answerChars": 72},
            },
            {
                "caseId": "clarification-before-provider",
                "passed": True,
                "status": "passed",
                "signals": {"providerCalled": False, "questionCount": 2},
            },
            {
                "caseId": "live-tool-loop",
                "passed": True,
                "status": "passed",
                "signals": {
                    "toolSequence": ["packages-check", "write-curriculum-yaml"],
                    "contractGapCount": 0,
                    "yamlContractObserved": True,
                    "sectionCount": 1,
                    "exerciseCellCount": 1,
                    "snippetCellCount": 1,
                    "workloopReadable": True,
                },
            },
            {
                "caseId": "live-cell-call-loop",
                "passed": True,
                "status": "passed",
                "signals": {
                    "toolSequence": ["packages-check", "cell-call"],
                    "exactSequence": True,
                    "policyViolationCount": 0,
                    "workloopReadable": True,
                },
            },
        ],
    }
    writeJson(root / "output/test-runner/ai-live-smoke/live-smoke-report.json", payload)


def writeJson(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload), encoding="utf-8")
