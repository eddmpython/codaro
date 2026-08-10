"""태스크 실행 기록 영속성 — 재시작에 run이 생존하는지(자동화 스튜디오의 기본)."""
from __future__ import annotations

from pathlib import Path

from codaro.automation.taskModel import TaskRun, TaskStatus
from codaro.automation.taskRegistry import TaskRegistry
from codaro.automation.taskFlow import _serializeTaskRun
from codaro.proof import ProofArchive


def _registry(tmp_path: Path) -> TaskRegistry:
    return TaskRegistry(storagePath=tmp_path / "tasks")


def testRunsSurviveReopen(tmp_path: Path) -> None:
    registry = _registry(tmp_path)
    task = registry.create(name="Report", documentPath="report.py")
    registry.addRun(TaskRun(taskId=task.id, status=TaskStatus.SUCCESS, output="line1"))

    reopened = TaskRegistry(storagePath=tmp_path / "tasks")
    runs = reopened.getRuns(task.id)
    assert len(runs) == 1
    assert runs[0].status == TaskStatus.SUCCESS
    assert runs[0].output == "line1"


def testRunDiffOfLastTwo(tmp_path: Path) -> None:
    registry = _registry(tmp_path)
    task = registry.create(name="R", documentPath="r.py")
    registry.addRun(TaskRun(taskId=task.id, status=TaskStatus.SUCCESS, output="a", variables={"n": "132"}))
    registry.addRun(TaskRun(taskId=task.id, status=TaskStatus.SUCCESS, output="a\nb", variables={"n": "147"}))

    diff = registry.getRunDiff(task.id)
    assert diff.hasPrevious is True
    assert diff.outputLineDelta == 1
    assert any(change.name == "n" and change.after == "147" for change in diff.variableChanges)


def testRunDiffFirstRun(tmp_path: Path) -> None:
    registry = _registry(tmp_path)
    task = registry.create(name="R", documentPath="r.py")
    registry.addRun(TaskRun(taskId=task.id, status=TaskStatus.SUCCESS, output="a"))
    diff = registry.getRunDiff(task.id)
    assert diff.hasPrevious is False


def testDeleteRemovesPersistedRuns(tmp_path: Path) -> None:
    registry = _registry(tmp_path)
    task = registry.create(name="R", documentPath="r.py")
    registry.addRun(TaskRun(taskId=task.id, status=TaskStatus.SUCCESS))
    assert (tmp_path / "tasks" / "runs" / f"{task.id}.json").exists()
    registry.delete(task.id)
    assert not (tmp_path / "tasks" / "runs" / f"{task.id}.json").exists()


def testRunSerializationKeepsExecutionSemanticAndOperationalProofStates() -> None:
    run = TaskRun(
        taskId="task-proof-states",
        status=TaskStatus.SUCCESS,
        executionStatus="success",
        semanticStatus="contract-passed",
    )
    contractPassed = run.serialize()
    assert contractPassed["executionStatus"] == "success"
    assert contractPassed["semanticStatus"] == "contract-passed"
    assert contractPassed["proofStatus"] == "contract-passed"

    run.operationalReceiptId = "operationalRun:sha256-proof"
    operational = TaskRun.deserialize(run.serialize())
    assert operational.executionStatus == "success"
    assert operational.semanticStatus == "contract-passed"
    assert operational.proofStatus == "operational-proof"


def testLegacySuccessfulRunDeserializesWithoutInventingSemanticProof() -> None:
    run = TaskRun.deserialize({
        "id": "run-legacy",
        "taskId": "task-legacy",
        "status": "success",
        "validated": False,
    })

    assert run.executionStatus == "success"
    assert run.semanticStatus == "not-checked"
    assert run.proofStatus == "semantic-not-checked"


def testApiProjectionRejectsUnresolvedOperationalReceiptId(tmp_path: Path) -> None:
    run = TaskRun(
        taskId="task-spoofed-proof",
        status=TaskStatus.SUCCESS,
        executionStatus="success",
        semanticStatus="contract-passed",
        operationalReceiptId="operationalRun:sha256-spoofed",
    )

    payload = _serializeTaskRun(
        run,
        proofArchive=ProofArchive(tmp_path / "proof.sqlite3"),
    )

    assert payload["operationalReceiptId"] is None
    assert payload["proofStatus"] == "contract-passed"
