from __future__ import annotations

import asyncio

from codaro.kernel.session import KernelSession


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testExecuteSimple() -> None:
    session = KernelSession()
    result = _run(session.execute("x = 42\nx", blockId="b1"))

    assert result.status == "done"
    assert "42" in result.data
    variables = {v.name: v for v in result.variables}
    assert "x" in variables
    assert variables["x"].typeName == "int"
    session.dispose()


def testExecuteStdout() -> None:
    session = KernelSession()
    result = _run(session.execute("print('hello codaro')", blockId="b1"))

    assert result.status == "done"
    assert "hello codaro" in result.stdout
    session.dispose()


def testExecuteError() -> None:
    session = KernelSession()
    result = _run(session.execute("1 / 0", blockId="b1"))

    assert result.status == "error"
    assert "ZeroDivisionError" in result.data
    session.dispose()


def testExecuteSyntaxError() -> None:
    session = KernelSession()
    result = _run(session.execute("def f(\n", blockId="b1"))

    assert result.status == "error"
    assert "SyntaxError" in result.data
    session.dispose()


def testScopedIsolation() -> None:
    session = KernelSession()
    _run(session.execute("x = 10", blockId="cell1"))
    _run(session.execute("y = 20", blockId="cell2"))

    result = _run(session.execute("x + y", blockId="cell3", injectedVars=["x", "y"]))
    assert result.status == "done"
    assert "30" in result.data

    result2 = _run(session.execute("x", blockId="cell4", injectedVars=["y"]))
    assert result2.status == "error"
    assert "NameError" in result2.data

    session.dispose()


def testRegistryUpdatesOnReexecute() -> None:
    session = KernelSession()
    _run(session.execute("x = 10", blockId="cell1"))
    assert session._registry.get("x") == 10

    _run(session.execute("x = 99", blockId="cell1"))
    assert session._registry.get("x") == 99
    session.dispose()


def testRemoveCellDefinitions() -> None:
    session = KernelSession()
    _run(session.execute("x = 10\ny = 20", blockId="cell1"))
    assert "x" in session._registry
    assert "y" in session._registry

    session.removeCellDefinitions("cell1")
    assert "x" not in session._registry
    assert "y" not in session._registry
    session.dispose()


def testImportGoesToRegistry() -> None:
    session = KernelSession()
    _run(session.execute("import math", blockId="cell1"))

    result = _run(session.execute("math.pi", blockId="cell2", injectedVars=["math"]))
    assert result.status == "done"
    assert "3.14" in result.data
    session.dispose()


def testReset() -> None:
    session = KernelSession()
    _run(session.execute("value = 99", blockId="cell1"))
    session.reset()

    assert len(session._registry) == 0
    assert len(session._cellDefinitions) == 0

    result = _run(session.execute("value", blockId="cell2"))
    assert result.status == "error"
    session.dispose()


def testGetVariables() -> None:
    session = KernelSession()
    _run(session.execute("name = 'codaro'\nversion = 1", blockId="cell1"))
    variables = session.getVariables()

    names = {v.name for v in variables}
    assert "name" in names
    assert "version" in names
    session.dispose()


def testExecutionCount() -> None:
    session = KernelSession()
    _run(session.execute("1", blockId="b1"))
    _run(session.execute("2", blockId="b2"))
    result = _run(session.execute("3", blockId="b3"))

    assert result.executionCount == 3
    session.dispose()


def testMultilineCode() -> None:
    session = KernelSession()
    code = """
def greet(name):
    return f"Hello, {name}!"

greet("Codaro")
"""
    result = _run(session.execute(code, blockId="b1"))

    assert result.status == "done"
    assert "Hello, Codaro" in result.data
    session.dispose()


def testAugAssignTrackedAsUse() -> None:
    session = KernelSession()
    _run(session.execute("counter = 0", blockId="cell1"))
    result = _run(session.execute("counter += 10\ncounter", blockId="cell2", injectedVars=["counter"]))

    assert result.status == "done"
    assert "10" in result.data
    session.dispose()
