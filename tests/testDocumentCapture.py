"""engine 층 도메인-무관 실행 포착 primitive(captureDocument) 테스트.

authoring · automation · diagnostics가 공유하는 단일 포착 경로를 검증한다.
"""
from __future__ import annotations

import asyncio

import pytest

from codaro.document.models import BlockConfig, CodaroDocument
from codaro.kernel.documentExecution import CaptureResult, captureDocument
from codaro.kernel.manager import SessionManager


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def _doc(*contents: str) -> CodaroDocument:
    blocks = [
        BlockConfig(id=f"b{index}", type="code", content=content)
        for index, content in enumerate(contents)
    ]
    return CodaroDocument(id="doc", title="t", blocks=blocks)


def testCapturesStdoutAcrossBlocks() -> None:
    result = _run(captureDocument(_doc("print('a')", "print('b')"), manager=SessionManager()))
    assert isinstance(result, CaptureResult)
    assert result.status == "ok"
    assert "a" in result.stdout and "b" in result.stdout


def testCapturesVariablesWithShapeDtype() -> None:
    result = _run(
        captureDocument(
            _doc("import numpy as np", "arr = np.zeros((3, 5), dtype='int64')"),
            manager=SessionManager(),
        )
    )
    byName = {variable.name: variable for variable in result.variables}
    assert "arr" in byName
    assert byName["arr"].shape == "(3, 5)"
    assert byName["arr"].dtype == "int64"


def testPlainValueHasEmptyShapeDtype() -> None:
    result = _run(captureDocument(_doc("x = 42"), manager=SessionManager()))
    byName = {variable.name: variable for variable in result.variables}
    assert byName["x"].shape == ""
    assert byName["x"].dtype == ""


def testErrorBlockReportsStatusNotRaises() -> None:
    result = _run(captureDocument(_doc("print('before')", "1 / 0", "print('after')"), manager=SessionManager()))
    assert result.status == "error"
    assert result.failedBlockId == "b1"
    # 오류 전 부분 stdout은 보존되고, 오류 후 블록은 실행되지 않는다.
    assert "before" in result.stdout
    assert "after" not in result.stdout
    assert result.error


def testSkipsNonCodeAndEmptyBlocks() -> None:
    doc = CodaroDocument(
        id="doc",
        title="t",
        blocks=[
            BlockConfig(id="m", type="markdown", content="# heading"),
            BlockConfig(id="e", type="code", content="   "),
            BlockConfig(id="c", type="code", content="y = 7"),
        ],
    )
    result = _run(captureDocument(doc, manager=SessionManager()))
    assert result.status == "ok"
    assert {variable.name for variable in result.variables} == {"y"}


def testOnBlockHookInvokedPerCodeBlock() -> None:
    seen: list[str] = []
    _run(
        captureDocument(
            _doc("a = 1", "b = 2"),
            manager=SessionManager(),
            onBlock=lambda block: seen.append(block.id),
        )
    )
    assert seen == ["b0", "b1"]


def testOnBlockHookRaiseAborts() -> None:
    class Stop(RuntimeError):
        pass

    def guard(block: BlockConfig) -> None:
        raise Stop("halt")

    with pytest.raises(Stop):
        _run(captureDocument(_doc("a = 1"), manager=SessionManager(), onBlock=guard))
