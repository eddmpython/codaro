from __future__ import annotations

import time

from .capture import Frame, Region


class MssCapture:

    def __init__(self) -> None:
        self._sct = None
        self._frameCount = 0
        self._startTime = time.monotonic()

    def _ensureSct(self):
        if self._sct is None:
            import mss
            self._sct = mss.mss()
        return self._sct

    def grab(self, region: Region | None = None) -> Frame:
        sct = self._ensureSct()
        if region is not None:
            monitor = {
                "left": region.x,
                "top": region.y,
                "width": region.width,
                "height": region.height,
            }
        else:
            monitor = sct.monitors[1]

        screenshot = sct.grab(monitor)
        self._frameCount += 1

        return Frame(
            data=bytes(screenshot.raw),
            width=screenshot.width,
            height=screenshot.height,
            channels=4,
            region=region,
        )

    def grabWindow(self, title: str) -> Frame | None:
        return self.grab()

    def fps(self) -> float:
        elapsed = time.monotonic() - self._startTime
        if elapsed <= 0:
            return 0.0
        return self._frameCount / elapsed

    def dispose(self) -> None:
        if self._sct is not None:
            self._sct.close()
            self._sct = None
