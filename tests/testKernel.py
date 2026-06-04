from __future__ import annotations

import asyncio
from pathlib import Path

from codaro.kernel import SessionManager, KernelSession, executeKernelBlock, executeKernelReactive


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


def testPartialResetPreservesDefinitions() -> None:
    session = KernelSession()
    _run(session.execute("import math", blockId="b1"))
    _run(session.execute("def double(n):\n    return n * 2", blockId="b2"))
    _run(session.execute("value = 99", blockId="b3"))

    session.reset(preserveDefinitions=True)

    valueResult = _run(session.execute("value", blockId="b4"))
    assert valueResult.status == "error"

    callResult = _run(session.execute("double(7)", blockId="b5", injectedVars=["double"]))
    assert callResult.status == "done"
    assert "14" in callResult.data

    importResult = _run(session.execute("math.pi", blockId="b6", injectedVars=["math"]))
    assert importResult.status == "done"
    assert "3.14" in importResult.data

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


def testExecutionPayloadOwnsHttpAndWsResultShapes() -> None:
    session = KernelSession()
    payload = _run(executeKernelBlock(session, "value = 7\nvalue", blockId="b1"))

    httpPayload = payload.httpPayload()
    wsPayload = payload.wsResultPayload("req-1")

    assert payload.durationMs >= 0
    assert httpPayload["blockId"] == "b1"
    assert httpPayload["status"] == "done"
    assert wsPayload["type"] == "result"
    assert wsPayload["requestId"] == "req-1"
    assert wsPayload["blockId"] == "b1"
    assert wsPayload["status"] == "done"
    session.dispose()


def testReactivePayloadOwnsHttpWsAndToolShapes() -> None:
    session = KernelSession()
    blocks = [
        {"id": "b1", "type": "code", "content": "x = 3"},
        {"id": "b2", "type": "code", "content": "y = x + 4\ny"},
    ]
    payload = _run(executeKernelReactive(session, blocks, "b1"))

    assert payload.executionOrder == ("b1", "b2")
    assert payload.httpPayload()["executionOrder"] == ["b1", "b2"]
    assert payload.wsCompletePayload("req-r") == {
        "type": "reactiveComplete",
        "requestId": "req-r",
        "executionOrder": ["b1", "b2"],
        "cycles": [],
        "multipleDefinitions": [],
        "crossCellMutations": [],
        "staleBlockIds": [],
        "dependents": {"b1": ["b2"]},
        "definedBy": {"x": ["b1"], "y": ["b2"]},
        "nodes": [
            {"blockId": "b1", "defines": ["x"], "uses": []},
            {"blockId": "b2", "defines": ["y"], "uses": ["x"]},
        ],
    }

    toolPayload = payload.toolPayload()
    assert toolPayload["executionOrder"] == ["b1", "b2"]
    assert toolPayload["results"][0]["blockId"] == "b1"
    assert set(toolPayload["results"][0]) == {"blockId", "status", "stdout", "stderr", "data"}
    session.dispose()


def testReactiveReassignmentReadsExternalValueWithoutError() -> None:
    # 다른 셀의 변수를 읽어 재할당(total = total + 5)이 격리 주입으로 동작 — NameError 없음.
    session = KernelSession()
    blocks = [
        {"id": "a", "type": "code", "content": "total = 0"},
        {"id": "b", "type": "code", "content": "total = total + 5"},
    ]
    payload = _run(executeKernelReactive(session, blocks, "a"))
    statuses = {result.blockId: result.status for result in payload.results}
    assert statuses == {"a": "done", "b": "done"}  # a→b 캐스케이드, 에러 없음
    session.dispose()


def testReactivePayloadMarksUnrunDownstreamStaleOnError() -> None:
    session = KernelSession()
    blocks = [
        {"id": "a", "type": "code", "content": "x = 1"},
        {"id": "b", "type": "code", "content": "y = x + missing"},  # NameError → early stop
        {"id": "c", "type": "code", "content": "z = y + 1"},
    ]
    payload = _run(executeKernelReactive(session, blocks, "a"))

    assert payload.executionOrder == ("a", "b", "c")
    # b가 에러로 끊겨 c는 실행 못 함 → stale.
    assert payload.staleBlockIds == ("c",)
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

    result = session.interrupt()
    assert result.interrupted is False

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
