"""reactive markdown — 변수 보간, 마크다운→HTML 렌더, 마크다운 셀의 리액티브 의존 테스트."""
from __future__ import annotations

import asyncio

from codaro.document.analysis import analyzeMarkdownRefs, interpolateMarkdown
from codaro.kernel.executionPayload import executeKernelReactive
from codaro.kernel.reactive import buildReactiveGraph
from codaro.kernel.session import KernelSession
from codaro.outputDescriptor import markdown


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testAnalyzeMarkdownRefsExtractsVariables() -> None:
    assert analyzeMarkdownRefs("Hello {name}, {count} items {{literal}}") == ["count", "name"]


def testInterpolateMarkdownSubstitutesAndEscapes() -> None:
    assert interpolateMarkdown("Hi {name} {{x}}", {"name": "World"}) == "Hi World {x}"
    # 모르는 이름은 그대로 둔다.
    assert interpolateMarkdown("{unknown}", {}) == "{unknown}"


def testMarkdownHelperRendersHtml() -> None:
    descriptor = markdown("# Title")
    assert descriptor["type"] == "markdown"
    assert "<h1>Title</h1>" in descriptor["html"]
    assert descriptor["content"] == "# Title"


def testMarkdownCellIsReactiveNode() -> None:
    blocks = [
        {"id": "a", "type": "code", "content": "name = 'World'"},
        {"id": "b", "type": "markdown", "content": "# Hello {name}"},
    ]
    graph = buildReactiveGraph(blocks)
    assert "b" in graph.nodes
    assert graph.nodes["b"].uses == ["name"]  # 마크다운 셀이 name을 use → a에 의존
    assert "b" in graph.dependents.get("a", set())


def testMarkdownCellRendersWithInterpolatedVariable() -> None:
    session = KernelSession()
    blocks = [
        {"id": "a", "type": "code", "content": "name = 'World'"},
        {"id": "b", "type": "markdown", "content": "# Hello {name}!"},
    ]
    payload = _run(executeKernelReactive(session, blocks, "a"))
    rendered = {r.blockId: r for r in payload.results}
    assert rendered["b"].type == "markdown"
    assert "<h1>Hello World!</h1>" in rendered["b"].data["html"]
    session.dispose()
