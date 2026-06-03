"""실행 리포트 diff(직전 대비) 순수 로직 테스트."""
from __future__ import annotations

from codaro.automation.reportDiff import diffRuns, diffVariables
from codaro.automation.taskModel import TaskRun, TaskStatus


def _run(*, status=TaskStatus.SUCCESS, output="", variables=None) -> TaskRun:
    return TaskRun(taskId="t", status=status, output=output, variables=variables or {})


def testFirstRunHasNoPrevious() -> None:
    diff = diffRuns(None, _run(output="a\nb"))
    assert diff.hasPrevious is False
    assert diff.statusChanged is False
    assert "첫 실행" in diff.summary


def testStatusChangeDetected() -> None:
    diff = diffRuns(_run(status=TaskStatus.SUCCESS), _run(status=TaskStatus.FAILED))
    assert diff.statusChanged is True
    assert diff.previousStatus == "success"
    assert diff.currentStatus == "failed"
    assert "success→failed" in diff.summary


def testOutputLineDelta() -> None:
    diff = diffRuns(_run(output="a\nb"), _run(output="a\nb\nc\nd"))
    assert diff.outputLineDelta == 2
    assert "+2줄" in diff.summary


def testVariableChangesClassified() -> None:
    changes = diffVariables({"x": "1", "y": "2"}, {"y": "3", "z": "9"})
    byName = {change.name: change for change in changes}
    assert byName["x"].change == "removed"
    assert byName["y"].change == "changed" and byName["y"].before == "2" and byName["y"].after == "3"
    assert byName["z"].change == "added" and byName["z"].after == "9"


def testNoChangeSummary() -> None:
    diff = diffRuns(_run(output="a", variables={"x": "1"}), _run(output="a", variables={"x": "1"}))
    assert diff.statusChanged is False
    assert "변수 변화 없음" in diff.summary
    assert diff.outputLineDelta == 0
