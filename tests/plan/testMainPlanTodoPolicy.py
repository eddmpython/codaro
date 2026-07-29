from __future__ import annotations

from pathlib import Path
import re

import yaml


ROOT = Path(__file__).resolve().parents[2]
MAIN_PLAN = ROOT / "mainPlan"
R10_INPUT_PACKET = (
    MAIN_PLAN
    / "astryx-product-experience"
    / "00-product-contract"
    / "01-prd-improvement-loop"
    / "09-learning-quality-revalidation"
    / "03-independent-r10-input"
)
R10_ROUND_ROOT = (
    MAIN_PLAN
    / "astryx-product-experience"
    / "00-product-contract"
    / "01-prd-improvement-loop"
    / "08-r10-independent-review"
)
FORBIDDEN_COMPLETION_PATHS = (
    "mainPlan/completion-evidence.schema.yml",
    "mainPlan/completion-transition.schema.yml",
    "mainPlan/completion-transition-ledger.yml",
    "docs/skills/ops/tools/completeMainPlanPacket.py",
    "tests/plan/verifyMainPlanCompletion.py",
    "tests/plan/verifyCompletionBootstrap.py",
    "tests/plan/testMainPlanCompletion.py",
    "tests/product/bootstrapAfterUse.fixture.yml",
)
FORBIDDEN_HISTORY_HEADINGS = re.compile(
    r"^##\s+(?:현재\s+(?:증거|구현(?:\s+상태)?)|(?:\d{4}-\d{2}-\d{2}\s+)?구현\s+snapshot)\s*$",
    re.MULTILINE,
)
FORBIDDEN_COMMIT_SNAPSHOT = re.compile(r"\bmain@[0-9a-f]{7,40}\b")
FORBIDDEN_COMPLETION_STATE = re.compile(
    r"^상태:\s*(?:완료|done|completed)\s*$",
    re.IGNORECASE | re.MULTILINE,
)
CHECKED_TODO = re.compile(r"^\s*[-*]\s+\[[xX]\]\s+", re.MULTILINE)
LEGACY_DONE_LABEL = re.compile(r"`\*?done`", re.IGNORECASE)


def testMainPlanContainsOnlyUnfinishedTodoTree() -> None:
    doneDirectories = sorted(
        path.relative_to(ROOT).as_posix()
        for path in MAIN_PLAN.rglob("*")
        if path.is_dir() and path.name == "_done"
    )
    completionEvidence = sorted(
        path.relative_to(ROOT).as_posix()
        for path in MAIN_PLAN.rglob("completion-evidence.yml")
    )

    assert doneDirectories == []
    assert completionEvidence == []


def testRetiredCompletionInfrastructureDoesNotReturn() -> None:
    existing = [path for path in FORBIDDEN_COMPLETION_PATHS if (ROOT / path).exists()]

    assert existing == []


def testMainPlanDocumentsDoNotDescribeDoneStorage() -> None:
    offenders = []
    for path in sorted(MAIN_PLAN.rglob("*.md")):
        if path == MAIN_PLAN / "README.md":
            continue
        text = path.read_text(encoding="utf-8")
        if "_done" in text or "completion-evidence" in text or "completion transition" in text:
            offenders.append(path.relative_to(ROOT).as_posix())

    assert offenders == []


def testActiveTodoDocumentsDoNotKeepCompletionHistorySections() -> None:
    offenders = []
    for path in sorted(MAIN_PLAN.rglob("*.md")):
        if path == MAIN_PLAN / "README.md":
            continue
        text = path.read_text(encoding="utf-8")
        if FORBIDDEN_HISTORY_HEADINGS.search(text):
            offenders.append(path.relative_to(ROOT).as_posix())

    assert offenders == []


def testActiveTodoDocumentsDoNotStoreCommitSnapshots() -> None:
    offenders = []
    for path in sorted(MAIN_PLAN.rglob("*.md")):
        if path == MAIN_PLAN / "README.md":
            continue
        text = path.read_text(encoding="utf-8")
        if FORBIDDEN_COMMIT_SNAPSHOT.search(text):
            offenders.append(path.relative_to(ROOT).as_posix())

    assert offenders == []


def testFinishedStateIsDeletedInsteadOfMarkedDone() -> None:
    offenders = []
    for path in sorted(MAIN_PLAN.rglob("*.md")):
        if path == MAIN_PLAN / "README.md":
            continue
        text = path.read_text(encoding="utf-8")
        if (
            FORBIDDEN_COMPLETION_STATE.search(text)
            or CHECKED_TODO.search(text)
            or LEGACY_DONE_LABEL.search(text)
        ):
            offenders.append(path.relative_to(ROOT).as_posix())

    assert offenders == []


def testDeletedR10InputPacketHasAFrozenCurrentBundle() -> None:
    if R10_INPUT_PACKET.exists():
        return

    inputManifest = yaml.safe_load(
        (R10_ROUND_ROOT / "r10-input-manifest.yml").read_text(encoding="utf-8")
    )
    bundleManifest = yaml.safe_load(
        (R10_ROUND_ROOT / "evaluation-bundle.manifest.yml").read_text(encoding="utf-8")
    )
    inputFreeze = inputManifest.get("inputFreeze") if isinstance(inputManifest, dict) else None
    inputReadiness = bundleManifest.get("inputReadiness") if isinstance(bundleManifest, dict) else None
    scope = bundleManifest.get("scope") if isinstance(bundleManifest, dict) else None

    assert isinstance(inputFreeze, dict) and inputFreeze.get("state") == "frozen"
    assert isinstance(inputReadiness, dict) and inputReadiness.get("inputFrozen") is True
    assert bundleManifest.get("state") in {"input-frozen", "sealed"}
    assert isinstance(scope, dict) and scope.get("sealState") in {"input-frozen", "sealed"}
    assert inputFreeze.get("gitCommit") == scope.get("gitCommit")
    assert inputFreeze.get("manifestHash") == scope.get("manifestHash")
    assert inputFreeze.get("evaluationBundleHash") == bundleManifest.get("archive", {}).get("sha256")
