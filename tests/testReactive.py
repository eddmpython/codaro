from __future__ import annotations

import asyncio

from codaro.kernel.reactive import buildReactiveGraph, executeReactive, getReactiveOrder
from codaro.kernel.session import KernelSession


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def _blocks(*specs):
    return [{"id": f"b{i+1}", "type": "code", "content": code} for i, code in enumerate(specs)]


def testBuildGraph() -> None:
    blocks = _blocks("x = 1", "y = x + 1", "z = y * 2")
    graph = buildReactiveGraph(blocks)

    assert "b1" in graph.dependents
    assert "b2" in graph.dependents.get("b1", set())
    assert "b3" in graph.dependents.get("b2", set())


def testReactiveOrderFromRoot() -> None:
    blocks = _blocks("x = 1", "y = x + 1", "z = y * 2", "w = 100")
    graph = buildReactiveGraph(blocks)

    order = getReactiveOrder(graph, "b1")
    assert order == ["b1", "b2", "b3"]
    assert "b4" not in order


def testReactiveOrderFromMiddle() -> None:
    blocks = _blocks("x = 1", "y = x + 1", "z = y * 2")
    graph = buildReactiveGraph(blocks)

    order = getReactiveOrder(graph, "b2")
    assert order == ["b2", "b3"]


def testReactiveExecution() -> None:
    session = KernelSession()
    blocks = _blocks("x = 10", "y = x * 2", "z = y + 1")

    results, order = _run(executeReactive(session, blocks, "b1"))

    assert order == ["b1", "b2", "b3"]
    assert len(results) == 3
    assert all(r.status == "done" for r in results)
    assert session._registry.get("x") == 10
    assert session._registry.get("y") == 20
    assert session._registry.get("z") == 21
    session.dispose()


def testReactiveStopsOnError() -> None:
    session = KernelSession()
    blocks = _blocks("x = 10", "y = x / 0", "z = y + 1")

    results, order = _run(executeReactive(session, blocks, "b1"))

    assert order == ["b1", "b2", "b3"]
    assert len(results) == 2
    assert results[0].status == "done"
    assert results[1].status == "error"
    session.dispose()


def testReactiveIsolation() -> None:
    session = KernelSession()
    blocks = _blocks("x = 5", "y = x + 1", "w = 99")

    _run(executeReactive(session, blocks, "b1"))
    _run(session.execute("w = 99", blockId="b3"))

    assert session._registry.get("x") == 5
    assert session._registry.get("y") == 6
    assert session._registry.get("w") == 99

    blocks2 = _blocks("x = 100", "y = x + 1", "w = 99")
    results, order = _run(executeReactive(session, blocks2, "b1"))

    assert "b3" not in order
    assert session._registry.get("y") == 101
    assert session._registry.get("w") == 99
    session.dispose()


def testScopedCellCannotSeeUninjectedVars() -> None:
    session = KernelSession()
    _run(session.execute("secret = 42", blockId="b1"))

    result = _run(session.execute("secret + 1", blockId="b2", injectedVars=[]))

    assert result.status == "error"
    assert "NameError" in result.data

    result2 = _run(session.execute("secret + 1", blockId="b3", injectedVars=["secret"]))
    assert result2.status == "done"
    assert "43" in result2.data
    session.dispose()
