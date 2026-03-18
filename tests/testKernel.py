from __future__ import annotations

import asyncio
from pathlib import Path

from codaro.kernel.manager import SessionManager
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


def testSerializeDataFramePayload() -> None:
    session = KernelSession()
    code = """
class FakeDataFrame:
    __module__ = "pandas.core.frame"

    def __init__(self):
        self.columns = ["name", "age"]
        self.index = [0, 1]

    def __len__(self):
        return 2

    def to_dict(self, orient="records"):
        assert orient == "records"
        return [
            {"name": "Ada", "age": 30},
            {"name": "Grace", "age": 28},
        ]

FakeDataFrame()
"""
    result = _run(session.execute(code, blockId="table"))

    assert result.status == "done"
    assert result.type == "dataframe"
    assert result.data["columns"] == ["name", "age"]
    assert result.data["totalRows"] == 2
    assert result.data["rows"][0]["name"] == "Ada"
    session.dispose()


def testSerializeImagePayload() -> None:
    session = KernelSession()
    code = """
class FakeImage:
    def _repr_png_(self):
        return b"png-binary"

FakeImage()
"""
    result = _run(session.execute(code, blockId="image"))

    assert result.status == "done"
    assert result.type == "image"
    assert result.data.startswith("data:image/png;base64,")
    session.dispose()


def testSerializeLayoutDescriptorPayload() -> None:
    session = KernelSession()
    code = """
import codaro

codaro.hstack(
    [
        codaro.md("# Revenue"),
        codaro.callout(
            codaro.stat("MRR", 4200, caption="USD", kind="success"),
            kind="info",
            title="Summary",
        ),
        codaro.ui.slider(0, 10, value=4, label="Level"),
    ],
    widths=[2, 2, 1],
)
"""
    result = _run(session.execute(code, blockId="layout"))

    assert result.status == "done"
    assert result.type == "layout"
    assert result.data["type"] == "hstack"
    assert result.data["widths"] == [2.0, 2.0, 1.0]
    assert result.data["items"][0]["type"] == "markdown"
    assert result.data["items"][1]["type"] == "callout"
    assert result.data["items"][1]["content"]["type"] == "stat"
    assert result.data["items"][2]["type"] == "ui"
    assert result.data["items"][2]["component"] == "slider"
    session.dispose()


def testSerializeTabsAndAccordionDescriptors() -> None:
    session = KernelSession()
    code = """
import codaro

codaro.tabs(
    {
        "Overview": codaro.stat("Users", 128, caption="active"),
        "Filters": codaro.accordion(
            {
                "Region": codaro.ui.dropdown(["KR", "US"], value="KR", label="Region"),
                "Toggle": codaro.ui.checkbox(True, label="Enabled"),
            }
        ),
    },
    value="Filters",
)
"""
    result = _run(session.execute(code, blockId="tabs"))

    assert result.status == "done"
    assert result.type == "layout"
    assert result.data["type"] == "tabs"
    assert result.data["value"] == "Filters"
    assert result.data["items"][1]["content"]["type"] == "accordion"
    assert result.data["items"][1]["content"]["items"][0]["content"]["type"] == "ui"
    assert result.data["items"][1]["content"]["items"][0]["content"]["component"] == "dropdown"
    session.dispose()


def testInterruptReturnsFalseWhenIdle() -> None:
    session = KernelSession()

    assert session.interrupt() is False

    session.dispose()


def testWorkingDirectoryIsolatedPerSession(tmp_path: Path) -> None:
    firstDir = tmp_path / "first"
    secondDir = tmp_path / "second"
    firstDir.mkdir()
    secondDir.mkdir()

    firstSession = KernelSession(workingDirectory=str(firstDir))
    secondSession = KernelSession(workingDirectory=str(secondDir))

    firstResult = _run(firstSession.execute("import os\nos.getcwd()", blockId="one"))
    secondResult = _run(secondSession.execute("import os\nos.getcwd()", blockId="two"))

    assert Path(firstResult.data.strip("'")).resolve() == firstDir.resolve()
    assert Path(secondResult.data.strip("'")).resolve() == secondDir.resolve()

    firstSession.dispose()
    secondSession.dispose()


def testSessionManagerLifecycle() -> None:
    manager = SessionManager()

    first = manager.createSession()
    second = manager.createSession()

    assert manager.sessionCount == 2
    assert manager.getSession(first.sessionId) is first
    assert manager.destroySession(first.sessionId) is True
    assert manager.getSession(first.sessionId) is None
    assert manager.destroySession("missing") is False

    manager.destroyAll()
    assert manager.sessionCount == 0
