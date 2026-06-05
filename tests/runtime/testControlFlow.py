"""H4 — mo.stop(조건부 중단)·mo.state(반응형 상태)·autoreload(모듈 재로드) 테스트."""
from __future__ import annotations

import asyncio
import os
import time

from codaro import state
from codaro.kernel.executionPayload import executeKernelReactive
from codaro.kernel.session import KernelSession
from codaro.uiValue import beginBlock, resetStore


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testStateGetterSetterPrimitive() -> None:
    resetStore()
    beginBlock("blk")
    getter, setter = state(10)
    assert getter() == 10
    setter(42)
    assert getter() == 42
    setter(lambda current: current + 1)  # updater 함수도 지원
    assert getter() == 43


def testStatePersistsAcrossReexecution() -> None:
    resetStore()
    beginBlock("blk")
    getter, _ = state(5)
    beginBlock("blk")  # 같은 블록 재실행 — 위치 기반 키라 값 유지
    getter2, setter2 = state(5)
    setter2(99)
    assert getter() == 99 and getter2() == 99


def testMoStopMarksStoppedAndPrunesDownstream() -> None:
    session = KernelSession()
    blocks = [
        {"id": "a", "type": "code", "content": "from codaro import stop\nstop(True, '중단')\nx = 1"},
        {"id": "b", "type": "code", "content": "y = x + 1"},
    ]
    payload = _run(executeKernelReactive(session, blocks, "a"))
    statuses = {r.blockId: r.status for r in payload.results}
    assert statuses["a"] == "stopped"
    assert "b" not in statuses  # 다운스트림 프루닝
    session.dispose()


def testMoStopFalseRunsNormally() -> None:
    session = KernelSession()
    blocks = [
        {"id": "a", "type": "code", "content": "from codaro import stop\nstop(False)\nx = 5"},
        {"id": "b", "type": "code", "content": "y = x + 1"},
    ]
    payload = _run(executeKernelReactive(session, blocks, "a"))
    assert {r.blockId: r.status for r in payload.results} == {"a": "done", "b": "done"}
    session.dispose()


def testAutoreloadReloadsChangedUserModule(tmp_path) -> None:
    module = tmp_path / "mymod.py"
    module.write_text("VALUE = 1\n", encoding="utf-8")
    session = KernelSession(workingDirectory=str(tmp_path))
    first = _run(session.execute("import mymod\nmymod.VALUE", blockId="a"))
    assert "1" in str(first.data)

    module.write_text("VALUE = 2\n", encoding="utf-8")
    future = time.time() + 10
    os.utime(module, (future, future))  # mtime을 확실히 앞당겨 reload 트리거
    second = _run(session.execute("import mymod\nmymod.VALUE", blockId="b"))
    assert "2" in str(second.data)
    session.dispose()
