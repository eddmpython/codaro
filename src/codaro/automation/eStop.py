from __future__ import annotations

import logging
import threading
import time
from typing import Any, Callable

logger = logging.getLogger(__name__)

EStopCallback = Callable[[str], None]


class EmergencyStop:

    def __init__(self) -> None:
        self._active = False
        self._reason: str = ""
        self._triggeredAt: float = 0.0
        self._lock = threading.Lock()
        self._callbacks: list[EStopCallback] = []

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

        for callback in self._callbacks:
            try:
                callback(reason)
            except Exception as exc:  # noqa: BLE001 — callback must not break e-stop
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

    def serialize(self) -> dict[str, Any]:
        return {
            "active": self._active,
            "reason": self._reason,
            "triggeredAt": self._triggeredAt if self._active else None,
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
