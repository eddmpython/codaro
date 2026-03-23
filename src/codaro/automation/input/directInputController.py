from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


class DirectInputController:

    def __init__(self) -> None:
        self._di = None

    def _ensureDi(self):
        if self._di is None:
            import pydirectinput
            pydirectinput.FAILSAFE = True
            pydirectinput.PAUSE = 0.03
            self._di = pydirectinput
        return self._di

    def moveTo(self, x: int, y: int, duration: float = 0.1) -> None:
        di = self._ensureDi()
        di.moveTo(x, y)

    def click(self, x: int, y: int, button: str = "left", clicks: int = 1) -> None:
        di = self._ensureDi()
        for _ in range(clicks):
            di.click(x, y, button=button)

    def typeText(self, text: str, interval: float = 0.02) -> None:
        di = self._ensureDi()
        di.typewrite(text, interval=interval)

    def hotkey(self, *keys: str) -> None:
        di = self._ensureDi()
        di.hotkey(*keys)

    def scroll(self, clicks: int, x: int | None = None, y: int | None = None) -> None:
        di = self._ensureDi()
        if x is not None and y is not None:
            di.moveTo(x, y)
        di.scroll(clicks)

    def mousePosition(self) -> tuple[int, int]:
        di = self._ensureDi()
        pos = di.position()
        return (pos[0], pos[1])

    def dragTo(self, x: int, y: int, duration: float = 0.3) -> None:
        di = self._ensureDi()
        di.moveTo(x, y)

    def dispose(self) -> None:
        self._di = None
