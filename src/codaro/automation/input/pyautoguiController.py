from __future__ import annotations

import logging

logger = logging.getLogger(__name__)


class PyAutoGuiController:

    def __init__(self, failSafe: bool = True) -> None:
        self._gui = None
        self._failSafe = failSafe

    def _ensureGui(self):
        if self._gui is None:
            import pyautogui
            pyautogui.FAILSAFE = self._failSafe
            pyautogui.PAUSE = 0.03
            self._gui = pyautogui
        return self._gui

    def moveTo(self, x: int, y: int, duration: float = 0.1) -> None:
        gui = self._ensureGui()
        gui.moveTo(x, y, duration=duration)

    def click(self, x: int, y: int, button: str = "left", clicks: int = 1) -> None:
        gui = self._ensureGui()
        gui.click(x, y, button=button, clicks=clicks)

    def typeText(self, text: str, interval: float = 0.02) -> None:
        gui = self._ensureGui()
        gui.typewrite(text, interval=interval)

    def hotkey(self, *keys: str) -> None:
        gui = self._ensureGui()
        gui.hotkey(*keys)

    def scroll(self, clicks: int, x: int | None = None, y: int | None = None) -> None:
        gui = self._ensureGui()
        gui.scroll(clicks, x=x, y=y)

    def mousePosition(self) -> tuple[int, int]:
        gui = self._ensureGui()
        pos = gui.position()
        return (pos.x, pos.y)

    def dragTo(self, x: int, y: int, duration: float = 0.3) -> None:
        gui = self._ensureGui()
        gui.dragTo(x, y, duration=duration)

    def dispose(self) -> None:
        self._gui = None
