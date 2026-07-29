from __future__ import annotations

from copy import deepcopy
from datetime import UTC, datetime
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
from types import ModuleType
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[2]
VERIFIER_PATH = ROOT / "tests/product/verifyManualAtMatrix.py"
MATRIX_PATH = ROOT / "tests/product/manual-at.matrix.yml"


def loadVerifier() -> ModuleType:
    spec = importlib.util.spec_from_file_location("verifyManualAtMatrixUnderTest", VERIFIER_PATH)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def loadMatrix() -> dict[str, Any]:
    payload = yaml.safe_load(MATRIX_PATH.read_text(encoding="utf-8"))
    assert isinstance(payload, dict)
    return payload


def writeArtifact(root: Path) -> dict[str, str]:
    relative = "docs/evidence/astryx-journey/verification.json"
    path = root / relative
    path.parent.mkdir(parents=True)
    path.write_text('{"scope":"synthetic verifier fixture"}\n', encoding="utf-8")
    return {
        "path": relative,
        "sha256": "sha256-" + hashlib.sha256(path.read_bytes()).hexdigest(),
    }


def completedMatrix(root: Path, head: str) -> dict[str, Any]:
    matrix = deepcopy(loadMatrix())
    artifact = writeArtifact(root)
    observedAt = datetime.now(UTC).isoformat(timespec="seconds")
    for index, scenario in enumerate(matrix["manualScenarios"]):
        target = scenario["target"]
        scenario["status"] = "passed"
        scenario["actual"] = {
            "osVersion": (
                "Windows 10 22H2 build 19045"
                if target["osRelease"] == "Windows 10 22H2"
                else f"{target['osFamily']} 20{index + 20}.1"
            ),
            "browserVersion": f"{target['browserFamily']} {150 + index}.0.1",
            "assistiveTechnologyVersion": (
                f"{target['assistiveTechnology']} {2026 + index}.1"
            ),
            "locale": "ko-KR",
        }
        scenario["tester"] = f"manual-reviewer-{index}"
        scenario["observedAt"] = observedAt
        scenario["productGitHead"] = head
        scenario["checkResults"] = {
            check: True for check in scenario["requiredChecks"]
        }
        scenario["evidence"] = [artifact]

    study = matrix["study"]
    study["status"] = "passed"
    study["researchOwner"] = "research-owner"
    study["privacyOwner"] = "privacy-owner"
    study["observedAt"] = observedAt
    study["productGitHead"] = head
    study["participants"] = [
        {
            "participantId": f"P{index + 1:02d}",
            "consentRecorded": True,
            "firstStrongCheckReached": index < 10,
            "facilitatorHelp": False,
            "elapsedSeconds": 120 if index < 10 else 240,
        }
        for index in range(12)
    ]
    study["evidence"] = [artifact]

    for index, review in enumerate(matrix["independentReviews"]):
        review["status"] = "passed"
        review["reviewer"] = f"independent-reviewer-{index}"
        review["relationship"] = "independent"
        review["observedAt"] = observedAt
        review["productGitHead"] = head
        review["decision"] = "approve"
        review["evidence"] = [artifact]

    nativePath = root / matrix["automatedNativeEvidence"]["reportPath"]
    nativePath.parent.mkdir(parents=True)
    nativePath.write_text(
        json.dumps(
            {
                "gitHead": head,
                "passed": True,
                "status": "passed",
                "runtime": {
                    "windowsVersion": "10.0.19045",
                    "browser": "Edg/150.0.4078.99",
                },
                "cases": [
                    {"id": caseId, "passed": True}
                    for caseId in matrix["automatedNativeEvidence"]["requiredCases"]
                ],
            }
        ),
        encoding="utf-8",
    )
    return matrix


def testPendingMatrixIsMachineValidButCannotComplete(tmp_path: Path) -> None:
    verifier = loadVerifier()
    matrixPath = tmp_path / "tests/product/manual-at.matrix.yml"
    matrixPath.parent.mkdir(parents=True)
    matrixPath.write_text(MATRIX_PATH.read_text(encoding="utf-8"), encoding="utf-8")
    reportPath = tmp_path / "output/manual-at-report.json"
    payload = verifier.verifyManualAtMatrix(
        matrixPath=matrixPath,
        reportPath=reportPath,
        root=tmp_path,
        gitHead="a" * 40,
    )

    assert payload["passed"] is True
    assert payload["machineEligible"] is True
    assert payload["completionEligible"] is False
    assert payload["facts"]["manualScenarios"]["passed"] == 0
    assert len(payload["completionBlockers"]) == 4
    assert json.loads(reportPath.read_text(encoding="utf-8"))["gitHead"] == "a" * 40


def testCompletedMatrixRequiresAllEvidenceAndPassesThreshold(tmp_path: Path) -> None:
    verifier = loadVerifier()
    head = "b" * 40
    matrix = completedMatrix(tmp_path, head)

    facts, blockers = verifier.evaluateManualAtMatrix(
        matrix,
        root=tmp_path,
        currentHead=head,
        revisionValidator=lambda _tested, _current, _paths, _root: None,
    )

    assert blockers == []
    assert facts["nativeWebView2"]["complete"] is True
    assert facts["manualScenarios"]["passed"] == 6
    assert facts["study"]["participants"] == 12
    assert facts["study"]["unassistedSuccesses"] == 10
    assert facts["study"]["unassistedRate"] == 0.8333
    assert facts["independentReviews"]["passed"] == 2


def testPassedScenarioWithoutExecutedEvidenceIsRejected(tmp_path: Path) -> None:
    verifier = loadVerifier()
    matrix = loadMatrix()
    scenario = matrix["manualScenarios"][0]
    scenario["status"] = "passed"

    try:
        verifier.evaluateManualAtMatrix(
            matrix,
            root=tmp_path,
            currentHead="c" * 40,
            revisionValidator=lambda _tested, _current, _paths, _root: None,
        )
    except ValueError as error:
        assert "actual versions and locale are required" in str(error)
    else:
        raise AssertionError("unverified passed scenario unexpectedly succeeded")


def testScenarioSetAndClosedSchemaCannotDrift(tmp_path: Path) -> None:
    verifier = loadVerifier()
    matrix = loadMatrix()
    matrix["manualScenarios"][0]["unexpected"] = True

    try:
        verifier.evaluateManualAtMatrix(
            matrix,
            root=tmp_path,
            currentHead="d" * 40,
            revisionValidator=lambda _tested, _current, _paths, _root: None,
        )
    except ValueError as error:
        assert "invalid closed schema" in str(error)
    else:
        raise AssertionError("manual scenario schema drift unexpectedly succeeded")
