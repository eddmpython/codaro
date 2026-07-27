from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
MAIN_PLAN = ROOT / "mainPlan"
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
