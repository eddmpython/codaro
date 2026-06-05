from __future__ import annotations

import asyncio
import threading
import time
from pathlib import Path

from codaro.kernel import KernelSession
from codaro.runtime.hotReload import FileChangeBatcher
from codaro.runtime.processSupervisor import ProcessSupervisor, ResourceLimits


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testPartialResetPreservesDefinitions() -> None:
    session = KernelSession()
    try:
        _run(session.execute("def add(a, b):\n    return a + b\n", blockId="defs"))
        _run(session.execute("counter = 0", blockId="state"))
        _run(session.execute("counter += 1", blockId="state"))

        engine = session._engine  # type: ignore[attr-defined]
        engine.reset(preserveDefinitions=True)

        result = _run(session.execute("add(2, 3)", blockId="check"))
        assert result.status == "done"
        assert "5" in result.data
    finally:
        session.dispose()


def testFullResetClearsDefinitions() -> None:
    session = KernelSession()
    try:
        _run(session.execute("def greet():\n    return 'hi'\n", blockId="defs"))
        engine = session._engine  # type: ignore[attr-defined]
        engine.reset()
        result = _run(session.execute("greet()", blockId="check"))
        assert result.status == "error"
        assert "NameError" in result.data or "name 'greet'" in result.data
    finally:
        session.dispose()


def testFileChangeBatcherDebounces() -> None:
    received: list[list[Path]] = []
    event = threading.Event()

    def collect(paths: list[Path]) -> None:
        received.append(paths)
        event.set()

    batcher = FileChangeBatcher(onBatch=collect, debounceSeconds=0.1)
    batcher.submit(Path("a.py"))
    batcher.submit(Path("b.py"))
    batcher.submit(Path("a.py"))

    assert event.wait(timeout=1.0)
    assert len(received) == 1
    paths = received[0]
    assert Path("a.py") in paths
    assert Path("b.py") in paths
    assert len(paths) == 2  # dedup


def testProcessSupervisorHeartbeatTracking() -> None:
    limits = ResourceLimits(heartbeatTimeoutSeconds=0.2)
    supervisor = ProcessSupervisor(limits)
    assert not supervisor.isHeartbeatStale()
    supervisor._lastHeartbeat = time.monotonic() - 1.0
    assert supervisor.isHeartbeatStale()
    supervisor.heartbeat()
    assert not supervisor.isHeartbeatStale()


def testProcessSupervisorDisabledWhenTimeoutZero() -> None:
    supervisor = ProcessSupervisor(ResourceLimits(heartbeatTimeoutSeconds=0))
    supervisor._lastHeartbeat = time.monotonic() - 10
    assert not supervisor.isHeartbeatStale()


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test") and callable(fn):
            fn()
            print(f"ok {name}")
