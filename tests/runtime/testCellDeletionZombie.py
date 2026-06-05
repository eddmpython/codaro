"""셀 삭제 → 워커 registry 변수 제거(zombie 상태 없음) 테스트."""
from __future__ import annotations

import asyncio

from codaro.kernel.session import KernelSession


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testDeletingDefiningCellRemovesVariable() -> None:
    session = KernelSession()
    _run(session.execute("x = 10", blockId="a"))
    _run(session.execute("y = x + 1", blockId="b"))
    assert session._registry.get("x") == 10

    # 셀 a 삭제 → x가 registry에서 사라져야 한다(zombie 없음).
    session.removeCellDefinitions("a")
    assert "x" not in session._registry

    # 셀 b를 다시 실행하면 x가 없어 NameError.
    result = _run(session.execute("y = x + 1", blockId="b"))
    assert result.status == "error"
    assert "NameError" in f"{result.data} {result.stderr}"
    session.dispose()


def testDeletingOneOfMultipleDefinersKeepsVariable() -> None:
    session = KernelSession()
    _run(session.execute("x = 10", blockId="a"))
    _run(session.execute("x = 20", blockId="b"))  # last-wins → x == 20

    # a만 삭제 → b가 여전히 x를 정의하므로 registry에 x 유지.
    session.removeCellDefinitions("a")
    assert session._registry.get("x") == 20
    session.dispose()
