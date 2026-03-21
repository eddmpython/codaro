from __future__ import annotations

import asyncio
import logging
import re
from datetime import datetime, timezone
from typing import Any, Callable, Coroutine

logger = logging.getLogger(__name__)

_CRON_PRESETS: dict[str, int] = {
    "@every_1m": 60,
    "@every_5m": 300,
    "@every_15m": 900,
    "@every_30m": 1800,
    "@every_1h": 3600,
    "@every_6h": 21600,
    "@every_12h": 43200,
    "@daily": 86400,
}


def parseScheduleSeconds(schedule: str) -> int | None:
    if schedule in _CRON_PRESETS:
        return _CRON_PRESETS[schedule]

    match = re.match(r"^@every_(\d+)(s|m|h)$", schedule)
    if match:
        value = int(match.group(1))
        unit = match.group(2)
        if unit == "s":
            return value
        if unit == "m":
            return value * 60
        if unit == "h":
            return value * 3600

    return None


class TaskScheduler:

    def __init__(self) -> None:
        self._jobs: dict[str, asyncio.Task[None]] = {}
        self._running = False

    @property
    def jobCount(self) -> int:
        return len(self._jobs)

    def schedule(
        self,
        taskId: str,
        schedule: str,
        callback: Callable[[], Coroutine[Any, Any, None]],
    ) -> bool:
        intervalSeconds = parseScheduleSeconds(schedule)
        if intervalSeconds is None:
            return False

        self.cancel(taskId)

        async def _loop() -> None:
            while True:
                await asyncio.sleep(intervalSeconds)
                try:
                    await callback()
                except asyncio.CancelledError:
                    break
                except Exception:
                    logger.exception("Scheduled task %s failed", taskId)

        self._jobs[taskId] = asyncio.create_task(_loop())
        return True

    def cancel(self, taskId: str) -> bool:
        job = self._jobs.pop(taskId, None)
        if job is not None:
            job.cancel()
            return True
        return False

    def cancelAll(self) -> int:
        count = len(self._jobs)
        for job in self._jobs.values():
            job.cancel()
        self._jobs.clear()
        return count

    def isScheduled(self, taskId: str) -> bool:
        return taskId in self._jobs

    def listScheduled(self) -> list[str]:
        return list(self._jobs.keys())
