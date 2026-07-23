from __future__ import annotations

from datetime import UTC, datetime
import importlib.util
from pathlib import Path
import json
import subprocess
from types import ModuleType
import uuid

import pytest
import yaml


ROOT = Path(__file__).resolve().parents[2]
TOOL_PATH = ROOT / "docs" / "skills" / "ops" / "tools" / "completeMainPlanPacket.py"
VERIFIER_PATH = ROOT / "tests" / "plan" / "verifyMainPlanCompletion.py"
SHA_A = "a" * 64
SHA_B = "b" * 64
COMMIT = "1" * 40
EVIDENCE_COMMIT = "2" * 40


def loadTool() -> ModuleType:
    spec = importlib.util.spec_from_file_location("completeMainPlanPacketUnderTest", TOOL_PATH)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def loadVerifier() -> ModuleType:
    spec = importlib.util.spec_from_file_location("verifyMainPlanCompletionUnderTest", VERIFIER_PATH)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def git(repo: Path, *args: str) -> str:
    result = subprocess.run(("git", *args), cwd=repo, check=True, capture_output=True, text=True)
    return result.stdout.strip()


def commitAll(repo: Path, message: str) -> str:
    git(repo, "add", "--all")
    git(repo, "-c", "user.name=Codaro Test", "-c", "user.email=codaro-test@example.invalid", "commit", "-m", message)
    return git(repo, "rev-parse", "HEAD")


def timestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def validEvidence() -> dict[str, object]:
    return {
        "schemaVersion": 1,
        "initiativeId": "astryx-product-experience",
        "packetId": "completion-and-gate-bootstrap",
        "completedAt": timestamp(),
        "gitCommit": COMMIT,
        "implementationPaths": ["tests/example.py"],
        "gates": [
            {
                "name": "plan-quality",
                "reportPath": "evidence/plan-quality.json",
                "reportHash": SHA_A,
                "gitHead": COMMIT,
                "passedAt": timestamp(),
            }
        ],
        "reviews": [],
        "docsUpdated": True,
        "parentIndexUpdated": True,
        "residualRisks": [],
    }


def validTransition(tool: ModuleType, *, nonce: str | None = None) -> dict[str, object]:
    transitionNonce = nonce or str(uuid.uuid4())
    transitionId = tool.calculateTransitionId(
        initiativeId="astryx-product-experience",
        packetId="completion-and-gate-bootstrap",
        implementationCommit=COMMIT,
        evidenceCommit=EVIDENCE_COMMIT,
        nonce=transitionNonce,
    )
    return {
        "schemaVersion": 1,
        "transitionKind": "complete",
        "nonce": transitionNonce,
        "transitionId": transitionId,
        "initiativeId": "astryx-product-experience",
        "packetId": "completion-and-gate-bootstrap",
        "implementationCommit": COMMIT,
        "evidenceCommit": EVIDENCE_COMMIT,
        "fromPath": "mainPlan/astryx-product-experience/00-product-contract/02-completion-and-gate-bootstrap",
        "toPath": "mainPlan/astryx-product-experience/00-product-contract/_done/02-completion-and-gate-bootstrap",
        "evidencePath": (
            "mainPlan/astryx-product-experience/00-product-contract/_done/"
            "02-completion-and-gate-bootstrap/completion-evidence.yml"
        ),
        "evidenceHash": SHA_B,
        "preparedAt": timestamp(),
    }


def testCompletionEvidenceRejectsFalseDocumentationState() -> None:
    tool = loadTool()
    evidence = validEvidence()
    evidence["docsUpdated"] = False

    with pytest.raises(tool.CompletionError, match="docsUpdated"):
        tool.validateCompletionEvidence(evidence)


def testTransitionIdRejectsTampering() -> None:
    tool = loadTool()
    transition = validTransition(tool)
    transition["transitionId"] = SHA_A

    with pytest.raises(tool.CompletionError, match="transitionId"):
        tool.validateTransition(transition)


@pytest.mark.parametrize("duplicateField", ["nonce", "packet", "fromPath"])
def testLedgerRejectsDuplicateCompletionIdentity(duplicateField: str) -> None:
    tool = loadTool()
    first = validTransition(tool)
    second = validTransition(tool)
    if duplicateField == "nonce":
        second["nonce"] = first["nonce"]
        second["transitionId"] = tool.calculateTransitionId(
            initiativeId=second["initiativeId"],
            packetId=second["packetId"],
            implementationCommit=second["implementationCommit"],
            evidenceCommit=second["evidenceCommit"],
            nonce=second["nonce"],
        )
    elif duplicateField == "packet":
        second["fromPath"] = "mainPlan/astryx-product-experience/elsewhere/02-completion-and-gate-bootstrap"
        second["toPath"] = "mainPlan/astryx-product-experience/elsewhere/_done/02-completion-and-gate-bootstrap"
        second["evidencePath"] = f"{second['toPath']}/completion-evidence.yml"
    else:
        second["packetId"] = "different-packet"
        second["transitionId"] = tool.calculateTransitionId(
            initiativeId=second["initiativeId"],
            packetId=second["packetId"],
            implementationCommit=second["implementationCommit"],
            evidenceCommit=second["evidenceCommit"],
            nonce=second["nonce"],
        )

    with pytest.raises(tool.CompletionError, match="duplicate"):
        tool.validateTransitionLedger({"schemaVersion": 1, "transitions": [first, second]})


def testParentIndexRequiresOneActiveLink(tmp_path: Path) -> None:
    tool = loadTool()
    tool.ROOT = tmp_path
    readme = tmp_path / "README.md"
    readme.write_text("# packets\n", encoding="utf-8")

    with pytest.raises(tool.CompletionError, match="exactly one"):
        tool.updatedParentIndex(readme, "02-completion-and-gate-bootstrap")


def testReportHashMismatchIsRejected(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    tool = loadTool()
    tool.ROOT = tmp_path
    evidencePath = tmp_path / "packet" / "completion-evidence.yml"
    evidencePath.parent.mkdir(parents=True)
    evidence = validEvidence()
    evidencePath.write_text(yaml.safe_dump(evidence, sort_keys=False), encoding="utf-8")
    evidenceBytes = evidencePath.read_bytes()

    def fakeCommittedFile(_commit: str, path: str) -> bytes:
        if path == "packet/completion-evidence.yml":
            return evidenceBytes
        if path == "tests/example.py":
            return b"pass\n"
        if path == "evidence/plan-quality.json":
            return b'{"passed":true,"gitHead":"' + COMMIT.encode("ascii") + b'"}\n'
        raise AssertionError(path)

    monkeypatch.setattr(tool, "committedFile", fakeCommittedFile)
    with pytest.raises(tool.CompletionError, match="hash mismatch"):
        tool.verifyEvidenceAgainstCommit(evidencePath, evidence, COMMIT, EVIDENCE_COMMIT)


def testThreeCommitCompletionTransitionRoundTrip(tmp_path: Path) -> None:
    tool = loadTool()
    verifier = loadVerifier()
    git(tmp_path, "init")
    git(tmp_path, "branch", "-M", "main")

    packetPath = tmp_path / "mainPlan" / "sample-initiative" / "00-loop" / "02-packet"
    packetPath.mkdir(parents=True)
    (packetPath / "README.md").write_text("# 02 Packet\n\n상태: 진행\n", encoding="utf-8")
    (packetPath.parent / "README.md").write_text("# Loop\n\n- [packet](02-packet/)\n", encoding="utf-8")
    (tmp_path / "mainPlan" / "completion-transition-ledger.yml").write_text(
        "schemaVersion: 1\ntransitions: []\n", encoding="utf-8"
    )
    sourcePath = tmp_path / "src" / "example.py"
    sourcePath.parent.mkdir()
    sourcePath.write_text("VALUE = 1\n", encoding="utf-8")
    commitAll(tmp_path, "base")

    sourcePath.write_text("VALUE = 2\n", encoding="utf-8")
    implementationCommit = commitAll(tmp_path, "implementation")
    reportPath = packetPath / "evidence" / "plan-quality.json"
    reportPath.parent.mkdir()
    reportPayload = {
        "schemaVersion": 1,
        "gate": "plan-quality",
        "status": "passed",
        "passed": True,
        "gitHead": implementationCommit,
    }
    reportPath.write_text(json.dumps(reportPayload, indent=2) + "\n", encoding="utf-8")
    reportHash = tool.sha256Bytes(reportPath.read_text(encoding="utf-8").encode("utf-8"))
    evidence = {
        "schemaVersion": 1,
        "initiativeId": "sample-initiative",
        "packetId": "packet",
        "completedAt": timestamp(),
        "gitCommit": implementationCommit,
        "implementationPaths": ["src/example.py"],
        "gates": [
            {
                "name": "plan-quality",
                "reportPath": "mainPlan/sample-initiative/00-loop/02-packet/evidence/plan-quality.json",
                "reportHash": reportHash,
                "gitHead": implementationCommit,
                "passedAt": timestamp(),
            }
        ],
        "reviews": [],
        "docsUpdated": True,
        "parentIndexUpdated": True,
        "residualRisks": [],
    }
    (packetPath / "completion-evidence.yml").write_text(
        yaml.safe_dump(evidence, allow_unicode=True, sort_keys=False), encoding="utf-8"
    )
    evidenceCommit = commitAll(tmp_path, "evidence")

    tool.ROOT = tmp_path
    tool.MAIN_PLAN = tmp_path / "mainPlan"
    tool.LEDGER_PATH = tool.MAIN_PLAN / "completion-transition-ledger.yml"
    transition = tool.prepareCompletionTransition(
        implementationCommit=implementationCommit,
        evidenceCommit=evidenceCommit,
        packetPath="mainPlan/sample-initiative/00-loop/02-packet",
    )
    assert transition["implementationCommit"] == implementationCommit
    assert transition["evidenceCommit"] == evidenceCommit
    assert not packetPath.exists()
    assert (packetPath.parent / "_done" / "02-packet" / "completion-evidence.yml").is_file()
    transitionCommit = commitAll(tmp_path, "completion transition")

    verifier.ROOT = tmp_path
    verifier.completion.ROOT = tmp_path
    verifier.completion.MAIN_PLAN = tmp_path / "mainPlan"
    verifier.completion.LEDGER_PATH = tmp_path / "mainPlan" / "completion-transition-ledger.yml"
    verified = verifier.verifyCompletionTransition(transitionCommit)
    assert verified["transitionId"] == transition["transitionId"]
