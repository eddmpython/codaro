from __future__ import annotations

import logging
import threading
import time
from typing import Any, Callable

logger = logging.getLogger(__name__)

EStopCallback = Callable[[str], None]
RunInterruptCallback = Callable[[str], None]


class ActiveRunContext:
    """One explicit execution context owned until its runtime is destroyed."""

    def __init__(self, runId: str, onClose: Callable[[str, "ActiveRunContext"], None]) -> None:
        self.runId = runId
        self._onClose = onClose
        self._interrupt: RunInterruptCallback | None = None
        self._cancelled = False
        self._cancelReason = ""
        self._interruptIssued = False
        self._destroyed = False
        self._closed = False
        self._lock = threading.RLock()

    @property
    def cancelled(self) -> bool:
        with self._lock:
            return self._cancelled

    @property
    def destroyed(self) -> bool:
        with self._lock:
            return self._destroyed

    def bindInterrupt(self, callback: RunInterruptCallback) -> None:
        with self._lock:
            if self._closed:
                raise RuntimeError("active run context is already closed")
            if self._interrupt is not None:
                raise RuntimeError("active run interrupt is already bound")
            self._interrupt = callback
            shouldInterrupt = self._cancelled and not self._interruptIssued
            reason = self._cancelReason
            if shouldInterrupt:
                self._interruptIssued = True
        if shouldInterrupt:
            self._invokeInterrupt(callback, reason)

    def cancel(self, reason: str) -> None:
        with self._lock:
            if self._closed or self._cancelled:
                return
            self._cancelled = True
            self._cancelReason = reason
            callback = self._interrupt
            shouldInterrupt = callback is not None and not self._interruptIssued
            if shouldInterrupt:
                self._interruptIssued = True
        if shouldInterrupt and callback is not None:
            self._invokeInterrupt(callback, reason)

    def check(self) -> None:
        with self._lock:
            cancelled = self._cancelled
            reason = self._cancelReason
        if cancelled:
            raise EmergencyStopActive(reason)

    def markDestroyed(self) -> None:
        with self._lock:
            self._destroyed = True

    def close(self) -> None:
        with self._lock:
            if self._closed:
                return
            self._closed = True
        self._onClose(self.runId, self)

    @staticmethod
    def _invokeInterrupt(callback: RunInterruptCallback, reason: str) -> None:
        try:
            callback(reason)
        except Exception as exc:  # noqa: BLE001 - cancellation must continue for the other active runs
            logger.warning("Active run interrupt failed: %s", exc)


class ActiveRunRegistry:
    def __init__(self) -> None:
        self._runs: dict[str, ActiveRunContext] = {}
        self._lock = threading.RLock()

    def open(self, runId: str) -> ActiveRunContext:
        context = ActiveRunContext(runId, self._close)
        with self._lock:
            if runId in self._runs:
                raise RuntimeError(f"active run is already registered: {runId}")
            self._runs[runId] = context
        return context

    def cancelAll(self, reason: str) -> int:
        with self._lock:
            contexts = list(self._runs.values())
        for context in contexts:
            context.cancel(reason)
        return len(contexts)

    @property
    def activeCount(self) -> int:
        with self._lock:
            return len(self._runs)

    def _close(self, runId: str, context: ActiveRunContext) -> None:
        with self._lock:
            if self._runs.get(runId) is context:
                self._runs.pop(runId, None)


class EmergencyStop:

    def __init__(self) -> None:
        self._active = False
        self._reason: str = ""
        self._triggeredAt: float = 0.0
        self._lock = threading.Lock()
        self._callbacks: list[EStopCallback] = []
        self._activeRuns = ActiveRunRegistry()

    @property
    def active(self) -> bool:
        return self._active

    @property
    def reason(self) -> str:
        return self._reason

    @property
    def triggeredAt(self) -> float:
        return self._triggeredAt

    def trigger(self, reason: str = "Manual trigger") -> bool:
        with self._lock:
            if self._active:
                return False
            self._active = True
            self._reason = reason
            self._triggeredAt = time.time()

        logger.warning("E-STOP triggered: %s", reason)

        self._activeRuns.cancelAll(reason)

        for callback in list(self._callbacks):
            try:
                callback(reason)
            except Exception as exc:  # noqa: BLE001 - callback must not break e-stop
                logger.warning("E-Stop callback failed: %s", exc)

        return True

    def clear(self) -> bool:
        with self._lock:
            if not self._active:
                return False
            self._active = False
            self._reason = ""
            self._triggeredAt = 0.0

        logger.info("E-STOP cleared")
        return True

    def check(self) -> None:
        if self._active:
            raise EmergencyStopActive(self._reason)

    def onTrigger(self, callback: EStopCallback) -> None:
        self._callbacks.append(callback)

    def registerRun(self, runId: str) -> ActiveRunContext:
        context = self._activeRuns.open(runId)
        if self.active:
            context.cancel(self.reason)
        return context

    @property
    def activeRunCount(self) -> int:
        return self._activeRuns.activeCount

    def serialize(self) -> dict[str, Any]:
        return {
            "active": self._active,
            "reason": self._reason,
            "triggeredAt": self._triggeredAt if self._active else None,
            "activeRunCount": self._activeRuns.activeCount,
        }


class EmergencyStopActive(RuntimeError):
    def __init__(self, reason: str) -> None:
        super().__init__(f"Emergency stop is active: {reason}")
        self.reason = reason


_eStop: EmergencyStop | None = None


def getEmergencyStop() -> EmergencyStop:
    global _eStop
    if _eStop is None:
        _eStop = EmergencyStop()
    return _eStop
