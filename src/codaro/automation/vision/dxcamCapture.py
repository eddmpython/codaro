from __future__ import annotations

import logging
import time

from ...errorGuard import safeDispose
from .capture import Frame, Region

logger = logging.getLogger(__name__)


class DxcamCapture:

    def __init__(self) -> None:
        self._camera = None
        self._frameCount = 0
        self._startTime = time.monotonic()

    def _ensureCamera(self):
        if self._camera is None:
            import dxcam
            self._camera = dxcam.create()
        return self._camera

    def grab(self, region: Region | None = None) -> Frame:
        camera = self._ensureCamera()
        tupleRegion = region.asTuple() if region is not None else None
        screenshot = camera.grab(region=tupleRegion)

        if screenshot is None:
            if region is not None:
                return Frame(
                    data=b"",
                    width=region.width,
                    height=region.height,
                    channels=3,
                    region=region,
                )
            return Frame(data=b"", width=0, height=0, channels=3)

        self._frameCount += 1
        return Frame(
            data=screenshot.tobytes(),
            width=screenshot.shape[1],
            height=screenshot.shape[0],
            channels=screenshot.shape[2] if len(screenshot.shape) > 2 else 3,
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
        if self._camera is not None:
            safeDispose(self._camera, "release", logger)
            self._camera = None
