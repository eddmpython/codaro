from __future__ import annotations

from fastapi import APIRouter, WebSocket

from ..serverLog import getServerLogger
from ..system.serverState import ServerState
from .terminalWebSocket import handleTerminalWebSocket


def createTerminalRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()

    @router.websocket("/ws/terminal")
    async def terminalWebSocket(websocket: WebSocket) -> None:
        await handleTerminalWebSocket(websocket, state.workspaceRoot, logger)

    return router
