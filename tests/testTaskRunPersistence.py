"""태스크 실행 기록 영속성 — 재시작에 run이 생존하는지(자동화 스튜디오의 기본)."""
from __future__ import annotations

from pathlib import Path

from codaro.automation.taskModel import TaskRun, TaskStatus
from codaro.automation.taskRegistry import TaskRegistry


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
