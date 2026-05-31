from __future__ import annotations

import asyncio
import os
import signal
import sys
from pathlib import Path
from typing import Any

from fastapi import WebSocket, WebSocketDisconnect

from ..serverLog import formatLogFields

# 전역 터미널: 작업 폴더에 붙은 실제 로컬 셸을 PTY로 띄워 xterm.js와 양방향으로 잇는다.
# 사용자는 "터미널"이 뭔지 몰라도 누락 패키지 설치(`uv add ...`) 같은 명령을 이 패널에서 그대로 친다.
# Windows는 ConPTY(pywinpty), POSIX는 표준 pty를 쓴다.

_IS_WINDOWS = sys.platform == "win32"
_READ_CHUNK = 65536

TERMINAL_WS_RUNTIME_ERRORS = (
    ConnectionError,
    OSError,
    RuntimeError,
    ValueError,
)


class PtyUnavailableError(RuntimeError):
    """PTY 백엔드를 사용할 수 없을 때(예: Windows에서 pywinpty 미설치)."""


class PtySession:
    """작업 폴더에 붙은 실제 셸을 PTY로 실행하고 read/write/resize/terminate를 제공한다."""

    def __init__(self, cwd: Path, cols: int = 80, rows: int = 24) -> None:
        self._cwd = str(cwd)
        self._cols = max(1, cols)
        self._rows = max(1, rows)
        self._winProc: Any = None
        self._posixPid: int | None = None
        self._masterFd: int | None = None
        self._closed = False

    def start(self) -> None:
        env = dict(os.environ)
        env.setdefault("TERM", "xterm-256color")
        if _IS_WINDOWS:
            self._startWindows(env)
        else:
            self._startPosix(env)

    def _startWindows(self, env: dict[str, str]) -> None:
        try:
            from winpty import PtyProcess  # type: ignore[import-not-found]
        except ImportError as exc:
            raise PtyUnavailableError(
                "터미널 백엔드(pywinpty)가 설치되어 있지 않습니다."
            ) from exc
        shell = env.get("COMSPEC", "cmd.exe")
        self._winProc = PtyProcess.spawn(
            shell,
            cwd=self._cwd,
            env=env,
            dimensions=(self._rows, self._cols),
        )

    def _startPosix(self, env: dict[str, str]) -> None:
        import pty

        shell = env.get("SHELL", "/bin/bash")
        pid, masterFd = pty.fork()
        if pid == 0:
            try:
                os.chdir(self._cwd)
            except OSError:
                pass
            os.execvpe(shell, [shell, "-i"], env)
            os._exit(1)
        self._posixPid = pid
        self._masterFd = masterFd
        self._setPosixWinsize(self._rows, self._cols)

    def read(self) -> str:
        """다음 출력 청크를 읽는다(블로킹). 셸 종료/닫힘이면 빈 문자열."""
        if self._closed:
            return ""
        if _IS_WINDOWS:
            try:
                return self._winProc.read(_READ_CHUNK)
            except EOFError:
                return ""
            except OSError:
                return ""
        if self._masterFd is None:
            return ""
        try:
            data = os.read(self._masterFd, _READ_CHUNK)
        except OSError:
            return ""
        if not data:
            return ""
        return data.decode("utf-8", errors="replace")

    def write(self, data: str) -> None:
        if self._closed or not data:
            return
        if _IS_WINDOWS:
            try:
                self._winProc.write(data)
            except (EOFError, OSError):
                pass
            return
        if self._masterFd is None:
            return
        try:
            os.write(self._masterFd, data.encode("utf-8"))
        except OSError:
            pass

    def resize(self, cols: int, rows: int) -> None:
        cols = max(1, cols)
        rows = max(1, rows)
        self._cols = cols
        self._rows = rows
        if self._closed:
            return
        if _IS_WINDOWS:
            try:
                self._winProc.setwinsize(rows, cols)
            except (EOFError, OSError, ValueError):
                pass
            return
        self._setPosixWinsize(rows, cols)

    def _setPosixWinsize(self, rows: int, cols: int) -> None:
        if self._masterFd is None:
            return
        import fcntl
        import struct
        import termios

        try:
            packed = struct.pack("HHHH", rows, cols, 0, 0)
            fcntl.ioctl(self._masterFd, termios.TIOCSWINSZ, packed)
        except OSError:
            pass

    def isAlive(self) -> bool:
        if self._closed:
            return False
        if _IS_WINDOWS:
            try:
                return bool(self._winProc.isalive())
            except (EOFError, OSError):
                return False
        if self._posixPid is None:
            return False
        try:
            pid, _ = os.waitpid(self._posixPid, os.WNOHANG)
        except ChildProcessError:
            return False
        except OSError:
            return True
        return pid == 0

    def terminate(self) -> None:
        if self._closed:
            return
        self._closed = True
        if _IS_WINDOWS:
            try:
                self._winProc.terminate(force=True)
            except (EOFError, OSError):
                pass
            return
        if self._posixPid is not None:
            try:
                os.kill(self._posixPid, signal.SIGHUP)
            except (ProcessLookupError, OSError):
                pass
        if self._masterFd is not None:
            try:
                os.close(self._masterFd)
            except OSError:
                pass


async def handleTerminalWebSocket(websocket: WebSocket, workspaceRoot: Path, logger: Any) -> None:
    await websocket.accept()
    logger.debug("terminal-ws %s", formatLogFields(action="connect", cwd=str(workspaceRoot)))

    session = PtySession(workspaceRoot)
    try:
        session.start()
    except PtyUnavailableError as error:
        await _safeSendJson(websocket, {"type": "error", "message": str(error)})
        await websocket.close(code=4500, reason="terminal-unavailable")
        logger.warning("terminal-ws %s", formatLogFields(action="unavailable", message=str(error)))
        return

    loop = asyncio.get_running_loop()
    outputTask = asyncio.create_task(_pumpOutput(websocket, session, loop, logger))

    try:
        while True:
            message = await websocket.receive_json()
            messageType = message.get("type")
            if messageType == "input":
                session.write(str(message.get("data", "")))
            elif messageType == "resize":
                session.resize(_asInt(message.get("cols"), 80), _asInt(message.get("rows"), 24))
    except WebSocketDisconnect:
        logger.debug("terminal-ws %s", formatLogFields(action="disconnect"))
    except TERMINAL_WS_RUNTIME_ERRORS as error:
        logger.warning("terminal-ws %s", formatLogFields(action="error", message=str(error)))
    finally:
        outputTask.cancel()
        session.terminate()


async def _pumpOutput(
    websocket: WebSocket,
    session: PtySession,
    loop: asyncio.AbstractEventLoop,
    logger: Any,
) -> None:
    try:
        while True:
            data = await loop.run_in_executor(None, session.read)
            if not data:
                break
            if not await _safeSendJson(websocket, {"type": "output", "data": data}):
                return
    except asyncio.CancelledError:
        raise
    except TERMINAL_WS_RUNTIME_ERRORS as error:
        logger.warning("terminal-ws %s", formatLogFields(action="output-error", message=str(error)))
    await _safeSendJson(websocket, {"type": "exit"})


def _asInt(value: Any, fallback: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


async def _safeSendJson(websocket: WebSocket, data: dict[str, Any]) -> bool:
    try:
        await websocket.send_json(data)
        return True
    except (WebSocketDisconnect, RuntimeError, ConnectionError, OSError):
        return False
