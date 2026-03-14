from __future__ import annotations

import asyncio

from codaro.kernel.session import KernelSession


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testExecuteSimple() -> None:
    session = KernelSession()
    result = _run(session.execute("x = 42\nx"))

    assert result.status == "done"
    assert "42" in result.data
    variables = {v.name: v for v in result.variables}
    assert "x" in variables
    assert variables["x"].typeName == "int"
    session.dispose()


def testExecuteStdout() -> None:
    session = KernelSession()
    result = _run(session.execute("print('hello codaro')"))

    assert result.status == "done"
    assert "hello codaro" in result.stdout
    session.dispose()


def testExecuteError() -> None:
    session = KernelSession()
    result = _run(session.execute("1 / 0"))

    assert result.status == "error"
    assert "ZeroDivisionError" in result.data
    session.dispose()


def testExecuteSyntaxError() -> None:
    session = KernelSession()
    result = _run(session.execute("def f(\n"))

    assert result.status == "error"
    assert "SyntaxError" in result.data
    session.dispose()


def testStatePersistence() -> None:
    session = KernelSession()
    _run(session.execute("counter = 0"))
    _run(session.execute("counter += 10"))
    result = _run(session.execute("counter"))

    assert result.status == "done"
    assert "10" in result.data
    session.dispose()


def testImportModule() -> None:
    session = KernelSession()
    result = _run(session.execute("import math\nmath.pi"))

    assert result.status == "done"
    assert "3.14" in result.data
    session.dispose()


def testReset() -> None:
    session = KernelSession()
    _run(session.execute("value = 99"))
    session.reset()
    result = _run(session.execute("value"))

    assert result.status == "error"
    assert "NameError" in result.data
    session.dispose()


def testGetVariables() -> None:
    session = KernelSession()
    _run(session.execute("name = 'codaro'\nversion = 1"))
    variables = session.getVariables()

    names = {v.name for v in variables}
    assert "name" in names
    assert "version" in names
    session.dispose()


def testExecutionCount() -> None:
    session = KernelSession()
    _run(session.execute("1"))
    _run(session.execute("2"))
    result = _run(session.execute("3"))

    assert result.executionCount == 3
    session.dispose()


def testMultilineCode() -> None:
    session = KernelSession()
    code = """
def greet(name):
    return f"Hello, {name}!"

greet("Codaro")
"""
    result = _run(session.execute(code))

    assert result.status == "done"
    assert "Hello, Codaro" in result.data
    session.dispose()
