from __future__ import annotations

from typing import Any

from fastapi import WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from ..kernel.executionPayload import executeKernelBlock, executeKernelReactive
from ..kernel.protocol import (
    WsErrorMessage,
    WsExecuteMessage,
    WsExecuteReactiveMessage,
    WsExecutionEventMessage,
    WsGetVariablesMessage,
    WsInterruptMessage,
    WsResetMessage,
    WsStatusMessage,
)
from ..serverLog import formatLogFields

KERNEL_WS_RUNTIME_ERRORS = (
    AttributeError,
    ConnectionError,
    OSError,
    RuntimeError,
    TypeError,
    ValueError,
)


async def handleKernelWebSocket(websocket: WebSocket, session: Any, logger: Any) -> None:
    await websocket.accept()
    logger.debug("kernel-ws %s", formatLogFields(action="connect", sessionId=session.sessionId))
    await websocket.send_json(WsStatusMessage(type="status", engineStatus="ready").model_dump())

    try:
        while True:
            message = await websocket.receive_json()
            try:
                parsedMessage = validateKernelWsMessage(message)
            except ValidationError as error:
                logger.warning(
                    "kernel-ws %s",
                    formatLogFields(action="validation", sessionId=session.sessionId, message=str(error)),
                )
                await websocket.send_json(
                    WsErrorMessage(
                        type="error",
                        requestId=message.get("requestId"),
                        message=firstKernelWsValidationMessage(error),
                    ).model_dump()
                )
                continue
            except ValueError as error:
                logger.warning(
                    "kernel-ws %s",
                    formatLogFields(action="validation", sessionId=session.sessionId, message=str(error)),
                )
                await websocket.send_json(WsErrorMessage(type="error", message=str(error)).model_dump())
                continue

            await handleKernelWsMessage(websocket, session, parsedMessage, logger)
    except WebSocketDisconnect:
        logger.debug("kernel-ws %s", formatLogFields(action="disconnect", sessionId=session.sessionId))
        return
    except KERNEL_WS_RUNTIME_ERRORS as error:
        logger.exception(
            "kernel-ws %s",
            formatLogFields(action="error", sessionId=session.sessionId, message=str(error)),
        )
        await _safeSendJson(websocket, WsErrorMessage(type="error", message=str(error)).model_dump())


async def handleKernelWsMessage(websocket: WebSocket, session: Any, message: Any, logger: Any) -> None:
    if isinstance(message, WsExecuteMessage):
        await handleExecuteMessage(websocket, session, message, logger)
    elif isinstance(message, WsInterruptMessage):
        session.interrupt()
        logger.debug("kernel-interrupt %s", formatLogFields(transport="ws", sessionId=session.sessionId))
    elif isinstance(message, WsGetVariablesMessage):
        await _safeSendJson(
            websocket,
            {
                "type": "variables",
                "variables": [variable.model_dump() for variable in session.getVariables()],
            },
        )
        logger.debug("kernel-variables %s", formatLogFields(transport="ws", sessionId=session.sessionId))
    elif isinstance(message, WsExecuteReactiveMessage):
        await handleReactiveMessage(websocket, session, message, logger)
    elif isinstance(message, WsResetMessage):
        session.reset()
        await _safeSendJson(websocket, WsStatusMessage(type="status", engineStatus="ready").model_dump())
        logger.debug("kernel-reset %s", formatLogFields(transport="ws", sessionId=session.sessionId))


def validateKernelWsMessage(message: dict[str, Any]) -> Any:
    messageType = message.get("type", "")
    if messageType == "execute":
        return WsExecuteMessage.model_validate(message)
    if messageType == "interrupt":
        return WsInterruptMessage.model_validate(message)
    if messageType == "getVariables":
        return WsGetVariablesMessage.model_validate(message)
    if messageType == "executeReactive":
        return WsExecuteReactiveMessage.model_validate(message)
    if messageType == "reset":
        return WsResetMessage.model_validate(message)
    raise ValueError(f"Unsupported websocket message type: {messageType or 'unknown'}.")


def firstKernelWsValidationMessage(error: ValidationError) -> str:
    firstError = error.errors()[0] if error.errors() else {}
    return str(firstError.get("msg", "Invalid websocket payload."))


async def handleExecuteMessage(websocket: WebSocket, session: Any, message: WsExecuteMessage, logger: Any) -> None:
    requestId = message.requestId
    code = message.code
    blockId = message.blockId

    if not await _safeSendJson(websocket, WsStatusMessage(type="status", engineStatus="busy").model_dump()):
        return
    payload = await executeKernelBlock(
        session,
        code,
        blockId=blockId,
        eventHandler=lambda event: sendExecutionEvent(websocket, requestId, event),
    )
    logger.debug(
        "kernel-execute %s",
        formatLogFields(
            transport="ws",
            sessionId=session.sessionId,
            requestId=requestId,
            blockId=blockId,
            status=payload.result.status,
            durationMs=payload.durationMs,
            executionCount=payload.result.executionCount,
        ),
    )
    if not await _safeSendJson(websocket, payload.wsResultPayload(requestId)):
        return
    await _safeSendJson(websocket, WsStatusMessage(type="status", engineStatus="ready").model_dump())


async def handleReactiveMessage(
    websocket: WebSocket,
    session: Any,
    message: WsExecuteReactiveMessage,
    logger: Any,
) -> None:
    requestId = message.requestId
    changedBlockId = message.blockId
    blocks = [block.model_dump() for block in message.blocks]

    if not await _safeSendJson(websocket, WsStatusMessage(type="status", engineStatus="busy").model_dump()):
        return
    reactiveEvents: list[dict[str, Any]] = []

    async def eventHandler(event: Any) -> None:
        reactiveEvents.append(
            {
                "blockId": event.blockId,
                "eventType": event.eventType,
            }
        )
        await sendExecutionEvent(websocket, requestId, event)

    payload = await executeKernelReactive(session, blocks, changedBlockId, eventHandler=eventHandler)
    logger.debug(
        "kernel-reactive %s",
        formatLogFields(
            transport="ws",
            sessionId=session.sessionId,
            requestId=requestId,
            changedBlockId=changedBlockId,
            resultCount=payload.resultCount,
            executionCount=payload.executionCount,
            eventCount=len(reactiveEvents),
            durationMs=payload.durationMs,
        ),
    )
    for resultPayload in payload.wsResultPayloads(requestId):
        if not await _safeSendJson(websocket, resultPayload):
            return
    if not await _safeSendJson(websocket, payload.wsCompletePayload(requestId)):
        return
    await _safeSendJson(websocket, WsStatusMessage(type="status", engineStatus="ready").model_dump())


async def sendExecutionEvent(websocket: WebSocket, requestId: str, event: Any) -> None:
    await _safeSendJson(
        websocket,
        WsExecutionEventMessage(
            requestId=requestId,
            blockId=event.blockId,
            sequence=event.sequence,
            eventType=event.eventType,
            executionCount=event.executionCount,
            payload=event.payload,
        ).model_dump(),
    )


async def _safeSendJson(websocket: WebSocket, data: dict[str, Any]) -> bool:
    try:
        await websocket.send_json(data)
        return True
    except (WebSocketDisconnect, RuntimeError, ConnectionError, OSError):
        return False
