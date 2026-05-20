from __future__ import annotations

import asyncio

import pytest

from codaro.kernel.session import KernelSession
from codaro.curriculum.checker import (
    checkByOutput,
    checkByVariable,
    checkContains,
    checkExpectedOutput,
    checkNoError,
    checkOutputContains,
    checkVariableSnapshotContains,
)
from codaro.curriculum.exerciseCheck import (
    ExerciseCheckInput,
    InvalidExerciseCheck,
    ToolExerciseCheckInput,
    runExerciseCheck,
    runToolExerciseCheck,
)


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testCheckOutputCorrect() -> None:
    session = KernelSession()
    result = _run(checkByOutput(session, "print(42)", "print(42)"))

    assert result.passed is True
    assert "정답" in result.feedback
    assert result.payload()["passed"] is True
    session.dispose()


def testCheckOutputIncorrect() -> None:
    session = KernelSession()
    hints = ["sum() 함수를 사용하세요", "sum([1,2,3]) 형태입니다", "답: print(sum([1,2,3]))"]
    result = _run(checkByOutput(
        session, "print(5)", "print(6)", hints=hints, currentHintLevel=0,
    ))

    assert result.passed is False
    assert result.hintLevel == 1
    assert "sum()" in result.feedback
    session.dispose()


def testCheckOutputProgressiveHints() -> None:
    session = KernelSession()
    hints = ["힌트1", "힌트2", "정답코드"]

    r1 = _run(checkByOutput(session, "print(1)", "print(2)", hints=hints, currentHintLevel=0))
    assert r1.hintLevel == 1
    assert "힌트1" in r1.feedback

    r2 = _run(checkByOutput(session, "print(1)", "print(2)", hints=hints, currentHintLevel=1))
    assert r2.hintLevel == 2
    assert "힌트2" in r2.feedback

    r3 = _run(checkByOutput(session, "print(1)", "print(2)", hints=hints, currentHintLevel=2))
    assert r3.hintLevel == 3
    assert "정답코드" in r3.feedback
    session.dispose()


def testCheckOutputWithError() -> None:
    session = KernelSession()
    result = _run(checkByOutput(session, "pritn(42)", "print(42)"))

    assert result.passed is False
    assert "NameError" in result.feedback or "이름" in result.feedback
    session.dispose()


def testCheckVariableCorrect() -> None:
    session = KernelSession()
    result = _run(checkByVariable(session, "x = 42", "x", "42"))

    assert result.passed is True
    session.dispose()


def testCheckVariableIncorrect() -> None:
    session = KernelSession()
    result = _run(checkByVariable(
        session, "x = 10", "x", "42",
        hints=["42를 대입하세요"],
    ))

    assert result.passed is False
    assert "10" in result.feedback
    session.dispose()


def testCheckVariableMissing() -> None:
    session = KernelSession()
    result = _run(checkByVariable(session, "y = 10", "x", "10"))

    assert result.passed is False
    assert "정의되지 않았습니다" in result.feedback
    session.dispose()


def testCheckExpectedOutput() -> None:
    session = KernelSession()
    result = _run(checkExpectedOutput(session, "print(42)", "42"))

    assert result.passed is True
    assert result.studentOutput == "42"
    session.dispose()


def testCheckOutputContains() -> None:
    session = KernelSession()
    result = _run(checkOutputContains(session, "print('hello world')", "world"))

    assert result.passed is True
    assert result.expectedOutput == "world"
    session.dispose()


def testCheckVariableSnapshotContains() -> None:
    session = KernelSession()
    result = _run(checkVariableSnapshotContains(session, "answer = 42", "42"))

    assert result.passed is True
    assert "answer" in result.studentOutput
    session.dispose()


def testCheckContainsPass() -> None:
    result = _run(checkContains("for i in range(10):\n    print(i)", ["for", "range", "print"]))
    assert result.passed is True


def testCheckContainsFail() -> None:
    result = _run(checkContains("x = 10", ["for", "range"]))
    assert result.passed is False
    assert "for" in result.feedback


def testCheckNoErrorPass() -> None:
    session = KernelSession()
    result = _run(checkNoError(session, "x = 1 + 2"))
    assert result.passed is True
    session.dispose()


def testCheckNoErrorFail() -> None:
    session = KernelSession()
    result = _run(checkNoError(session, "1/0"))
    assert result.passed is False
    assert "0으로 나눌 수 없습니다" in result.feedback
    session.dispose()


def testExerciseCheckDispatchesByType() -> None:
    session = KernelSession()
    result = _run(runExerciseCheck(
        session,
        ExerciseCheckInput(
            studentCode="answer = 42",
            checkType="variable",
            variableName="answer",
            expectedValue="42",
        ),
    ))

    assert result.payload()["passed"] is True
    session.dispose()


def testExerciseCheckRejectsInvalidContract() -> None:
    session = KernelSession()
    with pytest.raises(InvalidExerciseCheck, match="Invalid check type"):
        _run(runExerciseCheck(session, ExerciseCheckInput(studentCode="print(1)", checkType="output")))
    session.dispose()


def testToolExerciseCheckDispatchesRuntimeToolContract() -> None:
    session = KernelSession()
    output = _run(runToolExerciseCheck(
        session,
        ToolExerciseCheckInput(studentCode="print(42)", checkType="outputMatch", expected="42"),
    ))
    variable = _run(runToolExerciseCheck(
        session,
        ToolExerciseCheckInput(studentCode="answer = 42", checkType="variableCheck", expected="42"),
    ))
    contains = _run(runToolExerciseCheck(
        session,
        ToolExerciseCheckInput(studentCode="for item in items:\n    print(item)", checkType="codeContains", expected="for"),
    ))

    assert output["passed"] is True
    assert output["actual"] == "42"
    assert variable["passed"] is True
    assert contains["passed"] is True
    assert contains["pattern"] == "for"
    session.dispose()
