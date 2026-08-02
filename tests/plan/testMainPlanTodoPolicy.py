from __future__ import annotations

from pathlib import Path
import re

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
