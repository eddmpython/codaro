from __future__ import annotations

import asyncio
import logging
import threading
import uuid
from typing import Any, Awaitable, Callable, TypeVar

from .sessionModel import SessionStatus

logger = logging.getLogger(__name__)

T = TypeVar("T")

DriverFactory = Callable[[], Awaitable[Any]]
Step = Callable[[Any], Awaitable[Any]]
EstopCheck = Callable[[], None]


def _noEstop() -> None:
    return None


class SessionError(RuntimeError):
    """세션 lifecycle 위반(미오픈 step, 루프 미가동 등)."""


class PersistentSession:
    """자체 asyncio 루프를 도는 daemon 스레드에 고정된 영속 세션 (driver-agnostic 런타임).

    driver 는 worker 루프에서 1회 생성되어 step 사이 재사용된다. teardown 은 close()
    또는 복구불가 실패 때만. runStep 성공은 절대 LIVE 를 벗어나지 않는다(task 완료 ≠ 객체 소멸).
    DESIGN: tests/_attempts/browserPersistence/DESIGN.md §2.
    """

    def __init__(self, sessionId: str | None = None, *, estopCheck: EstopCheck = _noEstop) -> None:
        self.sessionId = sessionId or f"ps-{uuid.uuid4().hex[:10]}"
        self._estopCheck = estopCheck
        self._status = SessionStatus.OPENING
        self._statusLock = threading.Lock()
        self._loop: asyncio.AbstractEventLoop | None = None
        self._thread: threading.Thread | None = None
        self._ready = threading.Event()
        self._driver: Any = None
        self._stepLock: asyncio.Lock | None = None

    # ---- 상태 (caller 스레드에서 읽힘) -----------------------------------
    @property
    def status(self) -> SessionStatus:
        with self._statusLock:
            return self._status

    @property
    def isLive(self) -> bool:
        return self.status is SessionStatus.LIVE

    @property
    def driver(self) -> Any:
        return self._driver

    def _setStatus(self, status: SessionStatus) -> None:
        with self._statusLock:
            self._status = status

    # ---- public lifecycle (서버 루프 안전, async) ------------------------
    async def open(self, driverFactory: DriverFactory) -> None:
        """worker 루프 스레드를 띄우고 driver 를 1회 생성. 멱등."""
        if self.status is SessionStatus.LIVE:
            return
        self._estopCheck()
        self._setStatus(SessionStatus.OPENING)
        self._startLoopThread()
        try:
            await self.submit(self._launch(driverFactory))
        except SessionError:
            self._setStatus(SessionStatus.FAILED)
            self._stopLoopThread()
            raise
        self._setStatus(SessionStatus.LIVE)

    async def runStep(self, step: Step, *, timeoutSeconds: float | None = None) -> Any:
        """라이브 driver 에 step 1개 실행. 성공해도 driver 는 닫히지 않는다."""
        if self.status is not SessionStatus.LIVE:
            raise SessionError(f"session not live: {self.status.value}")
        self._estopCheck()
        # 불변식: 성공 = LIVE 유지, driver 그대로. 상태 전이 없음.
        return await self.submit(self._guardedStep(step), timeoutSeconds=timeoutSeconds)

    async def close(self, reason: str = "explicit") -> None:
        """일상적 teardown 의 유일 경로. driver 닫고 루프 정지."""
        if self.status in (SessionStatus.CLOSED, SessionStatus.CLOSING):
            return
        self._setStatus(SessionStatus.CLOSING)
        if self._loop is not None and self._ready.is_set():
            try:
                await self.submit(self._teardown(), timeoutSeconds=10.0)
            except (SessionError, asyncio.TimeoutError) as exc:
                logger.warning("session %s teardown 강제 진행: %s", self.sessionId, exc)
        self._stopLoopThread()
        self._driver = None
        self._setStatus(SessionStatus.CLOSED)
        logger.info("session %s closed (%s)", self.sessionId, reason)

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
            raise SessionError(f"driver launch failed: {exc}") from exc

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
