from __future__ import annotations

import logging
from typing import Any

logger = logging.getLogger(__name__)


class AccessibilityController:

    def __init__(self, backend: str = "uia") -> None:
        self._app: Any = None
        self._backend = backend
        self._pwa = None

    def _ensurePwa(self):
        if self._pwa is None:
            import pywinauto
            self._pwa = pywinauto
        return self._pwa

    def connectToWindow(self, title: str | None = None, processId: int | None = None) -> None:
        pwa = self._ensurePwa()
        kwargs: dict[str, Any] = {"backend": self._backend}
        if processId is not None:
            kwargs["process"] = processId
        elif title is not None:
            kwargs["title"] = title
        self._app = pwa.Application(**kwargs).connect(**{k: v for k, v in kwargs.items() if k != "backend"})

    def moveTo(self, x: int, y: int, duration: float = 0.1) -> None:
        pwa = self._ensurePwa()
        pwa.mouse.move(coords=(x, y))

    def click(self, x: int, y: int, button: str = "left", clicks: int = 1) -> None:
        pwa = self._ensurePwa()
        for _ in range(clicks):
            pwa.mouse.click(button=button, coords=(x, y))

    def typeText(self, text: str, interval: float = 0.02) -> None:
        pwa = self._ensurePwa()
        pwa.keyboard.send_keys(text, pause=interval, with_spaces=True)

    def hotkey(self, *keys: str) -> None:
        pwa = self._ensurePwa()
        combo = "".join(f"{{{k}}}" if len(k) > 1 else k for k in keys)
        pwa.keyboard.send_keys(combo)

    def scroll(self, clicks: int, x: int | None = None, y: int | None = None) -> None:
        pwa = self._ensurePwa()
        coords = (x, y) if x is not None and y is not None else None
        pwa.mouse.scroll(coords=coords, wheel_dist=clicks)

    def mousePosition(self) -> tuple[int, int]:
        import ctypes
        from ctypes import wintypes
        pt = wintypes.POINT()
        ctypes.windll.user32.GetCursorPos(ctypes.byref(pt))
        return (pt.x, pt.y)

    def dragTo(self, x: int, y: int, duration: float = 0.3) -> None:
        pwa = self._ensurePwa()
        start = self.mousePosition()
        pwa.mouse.press(button="left", coords=start)
        pwa.mouse.release(button="left", coords=(x, y))

    def findElement(self, title: str | None = None, controlType: str | None = None, automationId: str | None = None) -> Any:
        if self._app is None:
            raise RuntimeError("No window connected. Call connectToWindow() first.")
        window = self._app.top_window()
        criteria: dict[str, str] = {}
        if title:
            criteria["title"] = title
        if controlType:
            criteria["control_type"] = controlType
        if automationId:
            criteria["auto_id"] = automationId
        return window.child_window(**criteria)

    def dispose(self) -> None:
        self._app = None
        self._pwa = None
