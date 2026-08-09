import hashlib
import json
from pathlib import Path

from codaro.curriculum.machinePublication import evaluateReportAutomationPublication


ROOT = Path(__file__).resolve().parents[2]


def testReportAutomationIsTheMachineGoldenPath() -> None:
    state = evaluateReportAutomationPublication()

    assert state.machineChecks == {
        "pathStructure": True,
        "assessmentProgression": True,
        "capstoneContract": True,
        "solutionExecution": True,
        "authoringIntegrity": True,
    }
    assert state.publicationState == "golden"
    assert state.machinePublicationEligible is True
    assert state.allowedClaim == "machineVerified"
    assert state.promotionEligible is False


def testMachinePublicationGeneratedContractMatchesCurrentSources() -> None:
    contract = json.loads((ROOT / "contracts" / "machinePublication.v1.json").read_text(encoding="utf-8"))
    editorContract = json.loads((
        ROOT / "editor" / "src" / "lib" / "generatedContracts" / "machinePublication.v1.json"
    ).read_text(encoding="utf-8"))
    pythonContract = json.loads((
        ROOT / "src" / "codaro" / "generatedContracts" / "machinePublication.v1.json"
    ).read_text(encoding="utf-8"))
    state = evaluateReportAutomationPublication(runDiscrimination=False)

    assert editorContract == contract == pythonContract
    assert contract["sourceIdentity"] == {
        "capstoneContentHash": state.contentHash,
        "composerHash": _sourceHash(ROOT / "src" / "codaro" / "curriculum" / "planComposer.py"),
        "taxonomyHash": _sourceHash(ROOT / "curricula" / "python" / "_taxonomy.yml"),
    }
    assert contract["paths"] == [{
        "allowedClaim": state.allowedClaim,
        "pathId": state.pathId,
        "publicationState": state.publicationState,
    }]


def _sourceHash(path: Path) -> str:
    return "sha256-" + hashlib.sha256(path.read_bytes()).hexdigest()
