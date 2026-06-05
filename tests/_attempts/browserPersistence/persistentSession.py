"""노Qt 영속 자동화 객체 런타임 프로토타입 (실브라우저 없이 결정론 검증).

DESIGN.md 런타임 코어(렌즈 ①)를 추상 async 'driver'로 파라미터화한 것. 실제 Playwright/OS
객체 대신 임의의 async driver 를 주입해 핵심 불변식 — "task 완료 != 객체 소멸" — 과
thread + 자체 asyncio 루프(run_forever) + run_coroutine_threadsafe/wrap_future 브리지를
결정론적으로 검증한다.

운영 코드 아님. tests/run.py gate attempts 전용. 승격 시 driver 자리에 실제
playwright async_api 객체가 들어가고, 위치는 src/codaro/automation/session/ 으로 간다.
"""

from __future__ import annotations

import asyncio
import enum
import logging
import threading
import uuid
from typing import Any, Awaitable, Callable, TypeVar

logger = logging.getLogger(__name__)

T = TypeVar("T")

DriverFactory = Callable[[], Awaitable[Any]]
Step = Callable[[Any], Awaitable[Any]]
EstopCheck = Callable[[], None]


class SessionState(enum.Enum):
    IDLE = "idle"
    STARTING = "starting"
    LIVE = "live"
    CLOSING = "closing"
    CLOSED = "closed"
    CRASHED = "crashed"


class SessionError(RuntimeError):
    """세션 lifecycle 위반(미오픈 step, 루프 미가동 등)."""


class SessionEStopActive(RuntimeError):
    """E-Stop 활성 중 open/step 시도."""


def _noEstop() -> None:
    return None


class PersistentSession:
    """자체 asyncio 루프를 도는 daemon 스레드에 고정된 영속 세션.

    driver 는 worker 루프에서 1회 생성되어 task 간 재사용된다. teardown 은 close()/
    dispose() 또는 (승격본에서) E-Stop/복구불가 crash 때만. runStep 성공은 절대 LIVE 를
    벗어나지 않는다.
    """

    def __init__(self, sessionId: str | None = None, *, estopCheck: EstopCheck = _noEstop) -> None:
        self.sessionId = sessionId or f"ps-{uuid.uuid4().hex[:10]}"
        self._estopCheck = estopCheck
        self._state = SessionState.IDLE
        self._stateLock = threading.Lock()
        self._loop: asyncio.AbstractEventLoop | None = None
        self._thread: threading.Thread | None = None
        self._ready = threading.Event()
        self._driver: Any = None
        self._stepLock: asyncio.Lock | None = None  # worker 루프에서 생성

    # ---- 상태 (caller 스레드에서 읽힘) -----------------------------------
    @property
    def state(self) -> SessionState:
        with self._stateLock:
            return self._state

    @property
    def isLive(self) -> bool:
        return self.state is SessionState.LIVE

    @property
    def driverId(self) -> int | None:
        """살아있는 driver 객체의 정체성(id). 객체 재사용 검증용."""
        driver = self._driver
        return id(driver) if driver is not None else None

    def _setState(self, state: SessionState) -> None:
        with self._stateLock:
            self._state = state

    # ---- public lifecycle (서버 루프 안전, async) ------------------------
    async def open(self, driverFactory: DriverFactory) -> None:
        """worker 루프 스레드를 띄우고 driver 를 1회 생성. 멱등."""
        if self.state in (SessionState.LIVE, SessionState.STARTING):
            return
        self._estopCheck()
        self._setState(SessionState.STARTING)
        self._startLoopThread()
        try:
            await self.submit(self._launch(driverFactory))
        except SessionError:
            self._setState(SessionState.CRASHED)
            self._stopLoopThread()
            raise
        self._setState(SessionState.LIVE)

    async def runStep(self, step: Step, *, timeoutSeconds: float | None = None) -> Any:
        """라이브 driver 에 step 1개 실행. 성공해도 driver 는 닫히지 않는다."""
        if self.state is not SessionState.LIVE:
            raise SessionError(f"session not live: {self.state.value}")
        self._estopCheck()
        result = await self.submit(self._guardedStep(step), timeoutSeconds=timeoutSeconds)
        # 불변식: 성공 = LIVE 유지, driver 그대로. 상태 전이 없음.
        return result

    async def close(self, reason: str = "explicit") -> None:
        """일상적 teardown 의 유일 경로. driver 닫고 루프 정지."""
        if self.state in (SessionState.CLOSED, SessionState.CLOSING):
            return
        self._setState(SessionState.CLOSING)
        if self._loop is not None and self._ready.is_set():
            try:
                await self.submit(self._teardown(), timeoutSeconds=10.0)
            except (SessionError, asyncio.TimeoutError) as exc:
                logger.warning("session %s teardown 강제 진행: %s", self.sessionId, exc)
        self._stopLoopThread()
        self._driver = None
        self._setState(SessionState.CLOSED)
        logger.info("session %s closed (%s)", self.sessionId, reason)

    async def dispose(self) -> None:
        await self.close(reason="dispose")

    # ---- thread-safe 브리지 ----------------------------------------------
    async def submit(self, coro: Awaitable[T], *, timeoutSeconds: float | None = None) -> T:
        """worker 루프에 coro 를 스케줄하고, caller 루프를 막지 않고 결과를 await."""
        if self._loop is None or not self._ready.is_set():
            raise SessionError("worker loop not running")
        concurrentFuture = asyncio.run_coroutine_threadsafe(coro, self._loop)
        awaitable = asyncio.wrap_future(concurrentFuture)
        if timeoutSeconds is None:
            return await awaitable
        try:
            return await asyncio.wait_for(awaitable, timeout=timeoutSeconds)
        except asyncio.TimeoutError:
            concurrentFuture.cancel()
            raise

    # ---- worker 루프 코루틴 (self._loop 에서만 실행) ----------------------
    async def _launch(self, driverFactory: DriverFactory) -> None:
        self._stepLock = asyncio.Lock()
        try:
            self._driver = await driverFactory()
        except Exception as exc:  # noqa: BLE001 — driver launch boundary
            logger.error("session %s driver launch 실패: %s", self.sessionId, exc)
            raise SessionError("driver launch failed") from exc

    async def _guardedStep(self, step: Step) -> Any:
        if self._driver is None or self._stepLock is None:
            raise SessionError("no live driver")
        async with self._stepLock:  # page 재진입 직렬화
            return await step(self._driver)

    async def _teardown(self) -> None:
        driver = self._driver
        if driver is None:
            return
        close = getattr(driver, "close", None)
        if close is None:
            return
        maybe = close()
        if asyncio.iscoroutine(maybe):
            await maybe

    # ---- thread / loop 플럼빙 --------------------------------------------
    def _startLoopThread(self) -> None:
        if self._thread is not None and self._thread.is_alive():
            return
        self._ready.clear()
        self._thread = threading.Thread(
            target=self._runLoopForever,
            name=f"persistentSession-{self.sessionId}",
            daemon=True,
        )
        self._thread.start()
        if not self._ready.wait(timeout=10.0):
            raise SessionError("worker loop failed to start")

    def _runLoopForever(self) -> None:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        self._loop = loop
        loop.call_soon(self._ready.set)
        try:
            loop.run_forever()
        finally:
            loop.run_until_complete(loop.shutdown_asyncgens())
            loop.close()

    def _stopLoopThread(self) -> None:
        if self._loop is not None and self._loop.is_running():
            self._loop.call_soon_threadsafe(self._loop.stop)
        if self._thread is not None:
            self._thread.join(timeout=5.0)
        self._loop = None
        self._thread = None
        self._ready.clear()
