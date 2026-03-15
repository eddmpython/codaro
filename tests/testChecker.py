from __future__ import annotations

import asyncio

from codaro.kernel.session import KernelSession
from codaro.curriculum.checker import checkByOutput, checkByVariable, checkContains, checkNoError


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testCheckOutputCorrect() -> None:
    session = KernelSession()
    result = _run(checkByOutput(session, "print(42)", "print(42)"))

    assert result.passed is True
    assert "정답" in result.feedback
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
