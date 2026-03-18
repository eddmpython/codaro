from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from ..kernel.protocol import (
    CreateSessionRequest,
    CreateSessionResponse,
    ExecuteRequest,
    WsExecuteMessage,
    WsExecuteReactiveMessage,
    WsErrorMessage,
    WsExecutionEventMessage,
    WsGetVariablesMessage,
    WsInterruptMessage,
    WsResetMessage,
    WsResultMessage,
    WsStatusMessage,
)
from ..kernel.reactive import executeReactive, previewReactiveOrder
from ..serverLog import formatLogFields, getServerLogger
from ..system.fileOps import MoveRequest, WorkspacePathError, WriteFileRequest
from ..system.packageOps import PackageEnvironmentError
from .appState import ServerState
from .errors import fail
from .requestModels import PackageRequest, PathRequest, ReactiveExecuteRequest


def createKernelRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()

    def failWorkspaceBoundary(error: WorkspacePathError) -> None:
        fail(403, "workspace_path_forbidden", str(error))

    @router.post("/api/kernel/create", response_model=CreateSessionResponse)
    def apiCreateSession(request: CreateSessionRequest | None = None) -> CreateSessionResponse:
        workingDirectory = request.workingDirectory if request else None
        session = state.sessionManager.createSession(workingDirectory=workingDirectory)
        logger.info(
            "kernel-session %s",
            formatLogFields(
                action="create",
                sessionId=session.sessionId,
                workingDirectory=workingDirectory,
                totalSessions=state.sessionManager.sessionCount,
            ),
        )
        return CreateSessionResponse(sessionId=session.sessionId, status=session.status)

    @router.get("/api/kernel/sessions")
    def apiListSessions() -> list[dict[str, Any]]:
        sessions = state.sessionManager.listSessions()
        logger.debug("kernel-session %s", formatLogFields(action="list", totalSessions=len(sessions)))
        return [session.model_dump() for session in sessions]

    @router.post("/api/kernel/{sessionId}/execute")
    async def apiExecute(sessionId: str, request: ExecuteRequest) -> dict[str, Any]:
        session = requireSession(state, sessionId)
        startedAt = time.perf_counter()
        result = await session.execute(request.code, blockId=request.blockId)
        logger.debug(
            "kernel-execute %s",
            formatLogFields(
                transport="http",
                sessionId=sessionId,
                blockId=request.blockId,
                status=result.status,
                durationMs=round((time.perf_counter() - startedAt) * 1000, 1),
                executionCount=result.executionCount,
            ),
        )
        return result.model_dump()

    @router.post("/api/kernel/{sessionId}/interrupt")
    def apiInterrupt(sessionId: str) -> dict[str, bool]:
        session = requireSession(state, sessionId)
        success = session.interrupt()
        logger.info(
            "kernel-interrupt %s",
            formatLogFields(sessionId=sessionId, interrupted=success),
        )
        return {"interrupted": success}

    @router.get("/api/kernel/{sessionId}/variables")
    def apiGetVariables(sessionId: str) -> list[dict[str, Any]]:
        session = requireSession(state, sessionId)
        variables = session.getVariables()
        logger.debug(
            "kernel-variables %s",
            formatLogFields(transport="http", sessionId=sessionId, variableCount=len(variables)),
        )
        return [variable.model_dump() for variable in variables]

    @router.post("/api/kernel/{sessionId}/reset")
    def apiResetSession(sessionId: str) -> dict[str, str]:
        session = requireSession(state, sessionId)
        session.reset()
        logger.info("kernel-reset %s", formatLogFields(sessionId=sessionId))
        return {"status": "reset"}

    @router.delete("/api/kernel/{sessionId}")
    def apiDestroySession(sessionId: str) -> dict[str, bool]:
        success = state.sessionManager.destroySession(sessionId)
        if not success:
            fail(404, "session_not_found", "Session not found.")
        logger.info(
            "kernel-session %s",
            formatLogFields(
                action="destroy",
                sessionId=sessionId,
                totalSessions=state.sessionManager.sessionCount,
            ),
        )
        return {"destroyed": True}

    @router.post("/api/kernel/{sessionId}/execute-reactive")
    async def apiExecuteReactive(sessionId: str, request: ReactiveExecuteRequest) -> dict[str, Any]:
        session = requireSession(state, sessionId)
        startedAt = time.perf_counter()
        blocks = [block.model_dump() for block in request.blocks]
        results, executionOrder = await executeReactive(session, blocks, request.blockId)
        logger.debug(
            "kernel-reactive %s",
            formatLogFields(
                transport="http",
                sessionId=sessionId,
                changedBlockId=request.blockId,
                resultCount=len(results),
                executionCount=len(executionOrder),
                durationMs=round((time.perf_counter() - startedAt) * 1000, 1),
            ),
        )
        return {
            "results": [result.model_dump() for result in results],
            "executionOrder": executionOrder,
        }

    @router.post("/api/kernel/reactive-preview")
    def apiReactivePreview(request: ReactiveExecuteRequest) -> dict[str, Any]:
        executionOrder = previewReactiveOrder([block.model_dump() for block in request.blocks], request.blockId)
        logger.debug(
            "kernel-reactive %s",
            formatLogFields(
                transport="http",
                mode="preview",
                changedBlockId=request.blockId,
                executionCount=len(executionOrder),
            ),
        )
        return {"executionOrder": executionOrder}

    @router.post("/api/kernel/{sessionId}/remove-cell")
    def apiRemoveCellDefinitions(sessionId: str, request: ExecuteRequest) -> dict[str, str]:
        session = requireSession(state, sessionId)
        session.removeCellDefinitions(request.blockId or "")
        logger.debug(
            "kernel-remove-definitions %s",
            formatLogFields(sessionId=sessionId, blockId=request.blockId),
        )
        return {"status": "removed"}

    @router.post("/api/kernel/{sessionId}/fs/list")
    async def apiListSessionDirectory(sessionId: str, request: PathRequest) -> dict[str, Any]:
        session = requireSession(state, sessionId)
        try:
            result = await session.getFiles(request.path)
            logger.debug(
                "kernel-fs %s",
                formatLogFields(action="list", sessionId=sessionId, path=request.path, entryCount=len(result.entries)),
            )
            return result.model_dump()
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)

    @router.post("/api/kernel/{sessionId}/fs/read")
    async def apiReadSessionFile(sessionId: str, request: PathRequest) -> dict[str, Any]:
        session = requireSession(state, sessionId)
        try:
            content = await session.readFile(request.path)
            logger.debug(
                "kernel-fs %s",
                formatLogFields(action="read", sessionId=sessionId, path=request.path, contentLength=len(content.content)),
            )
            return content.model_dump()
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)
        except FileNotFoundError:
            fail(404, "file_not_found", "File not found.")
        except UnicodeDecodeError:
            fail(400, "file_not_text", "File is not a text file or has unsupported encoding.")

    @router.post("/api/kernel/{sessionId}/fs/write")
    async def apiWriteSessionFile(sessionId: str, request: WriteFileRequest) -> dict[str, str]:
        session = requireSession(state, sessionId)
        try:
            resultPath = await session.writeFile(
                request.path,
                request.content,
                encoding=request.encoding,
                createDirectories=request.createDirectories,
            )
            logger.debug(
                "kernel-fs %s",
                formatLogFields(
                    action="write",
                    sessionId=sessionId,
                    path=resultPath,
                    contentLength=len(request.content),
                    createDirectories=request.createDirectories,
                ),
            )
            return {"path": resultPath}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)

    @router.post("/api/kernel/{sessionId}/fs/delete")
    async def apiDeleteSessionEntry(sessionId: str, request: PathRequest) -> dict[str, str]:
        session = requireSession(state, sessionId)
        try:
            result = await session.deleteEntry(request.path)
            logger.debug("kernel-fs %s", formatLogFields(action="delete", sessionId=sessionId, path=result))
            return {"deleted": result}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)
        except FileNotFoundError:
            fail(404, "file_not_found", "File not found.")

    @router.post("/api/kernel/{sessionId}/fs/move")
    async def apiMoveSessionEntry(sessionId: str, request: MoveRequest) -> dict[str, str]:
        session = requireSession(state, sessionId)
        try:
            result = await session.moveEntry(request.source, request.destination)
            logger.debug(
                "kernel-fs %s",
                formatLogFields(
                    action="move",
                    sessionId=sessionId,
                    source=request.source,
                    destination=request.destination,
                    path=result,
                ),
            )
            return {"path": result}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)
        except FileNotFoundError:
            fail(404, "file_source_not_found", "Source not found.")

    @router.post("/api/kernel/{sessionId}/fs/mkdir")
    async def apiCreateSessionDirectory(sessionId: str, request: PathRequest) -> dict[str, str]:
        session = requireSession(state, sessionId)
        try:
            result = await session.createDirectory(request.path)
            logger.debug("kernel-fs %s", formatLogFields(action="mkdir", sessionId=sessionId, path=result))
            return {"path": result}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)

    @router.post("/api/kernel/{sessionId}/fs/exists")
    async def apiSessionFileExists(sessionId: str, request: PathRequest) -> dict[str, bool]:
        session = requireSession(state, sessionId)
        try:
            exists = await session.fileExists(request.path)
            logger.debug(
                "kernel-fs %s",
                formatLogFields(action="exists", sessionId=sessionId, path=request.path, exists=exists),
            )
            return {"exists": exists}
        except WorkspacePathError as error:
            failWorkspaceBoundary(error)

    @router.get("/api/kernel/{sessionId}/packages/list")
    async def apiListSessionPackages(sessionId: str) -> list[dict[str, str]]:
        session = requireSession(state, sessionId)
        try:
            packages = await session.listPackages()
            logger.debug(
                "kernel-packages %s",
                formatLogFields(action="list", sessionId=sessionId, packageCount=len(packages)),
            )
            return [package.model_dump() for package in packages]
        except PackageEnvironmentError as error:
            fail(error.statusCode, error.code, error.message)

    @router.post("/api/kernel/{sessionId}/packages/install")
    async def apiInstallSessionPackage(sessionId: str, request: PackageRequest) -> dict[str, Any]:
        session = requireSession(state, sessionId)
        result = await session.installPackage(request.name)
        logger.info(
            "kernel-packages %s",
            formatLogFields(action="install", sessionId=sessionId, name=request.name, success=result.success),
        )
        return result.model_dump()

    @router.post("/api/kernel/{sessionId}/packages/uninstall")
    async def apiUninstallSessionPackage(sessionId: str, request: PackageRequest) -> dict[str, Any]:
        session = requireSession(state, sessionId)
        result = await session.uninstallPackage(request.name)
        logger.info(
            "kernel-packages %s",
            formatLogFields(action="uninstall", sessionId=sessionId, name=request.name, success=result.success),
        )
        return result.model_dump()

    @router.websocket("/ws/kernel/{sessionId}")
    async def kernelWebSocket(websocket: WebSocket, sessionId: str) -> None:
        session = state.sessionManager.getSession(sessionId)
        if session is None:
            await websocket.close(code=4004, reason="Session not found.")
            return

        await websocket.accept()
        logger.debug("kernel-ws %s", formatLogFields(action="connect", sessionId=sessionId))
        await websocket.send_json(WsStatusMessage(type="status", engineStatus="ready").model_dump())

        try:
            while True:
                message = await websocket.receive_json()
                try:
                    parsedMessage = validateWsMessage(message)
                except ValidationError as error:
                    logger.warning(
                        "kernel-ws %s",
                        formatLogFields(action="validation", sessionId=sessionId, message=str(error)),
                    )
                    await websocket.send_json(
                        WsErrorMessage(
                            type="error",
                            requestId=message.get("requestId"),
                            message=firstValidationMessage(error),
                        ).model_dump()
                    )
                    continue
                except ValueError as error:
                    logger.warning(
                        "kernel-ws %s",
                        formatLogFields(action="validation", sessionId=sessionId, message=str(error)),
                    )
                    await websocket.send_json(WsErrorMessage(type="error", message=str(error)).model_dump())
                    continue

                if isinstance(parsedMessage, WsExecuteMessage):
                    await handleExecuteMessage(websocket, session, parsedMessage, logger)
                elif isinstance(parsedMessage, WsInterruptMessage):
                    session.interrupt()
                    logger.debug("kernel-interrupt %s", formatLogFields(transport="ws", sessionId=sessionId))
                elif isinstance(parsedMessage, WsGetVariablesMessage):
                    await websocket.send_json({
                        "type": "variables",
                        "variables": [variable.model_dump() for variable in session.getVariables()],
                    })
                    logger.debug("kernel-variables %s", formatLogFields(transport="ws", sessionId=sessionId))
                elif isinstance(parsedMessage, WsExecuteReactiveMessage):
                    await handleReactiveMessage(websocket, session, parsedMessage, logger)
                elif isinstance(parsedMessage, WsResetMessage):
                    session.reset()
                    await websocket.send_json(WsStatusMessage(type="status", engineStatus="ready").model_dump())
                    logger.debug("kernel-reset %s", formatLogFields(transport="ws", sessionId=sessionId))
        except WebSocketDisconnect:
            logger.debug("kernel-ws %s", formatLogFields(action="disconnect", sessionId=sessionId))
            return
        except Exception as error:
            logger.exception(
                "kernel-ws %s",
                formatLogFields(action="error", sessionId=sessionId, message=str(error)),
            )
            try:
                await websocket.send_json(WsErrorMessage(type="error", message=str(error)).model_dump())
            except Exception:
                return

    return router


def requireSession(state: ServerState, sessionId: str):
    session = state.sessionManager.getSession(sessionId)
    if session is None:
        fail(404, "session_not_found", "Session not found.")
    return session


def validateWsMessage(message: dict[str, Any]):
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


def firstValidationMessage(error: ValidationError) -> str:
    firstError = error.errors()[0] if error.errors() else {}
    return str(firstError.get("msg", "Invalid websocket payload."))


async def handleExecuteMessage(websocket: WebSocket, session, message: WsExecuteMessage, logger) -> None:
    requestId = message.requestId
    code = message.code
    blockId = message.blockId

    startedAt = time.perf_counter()
    await websocket.send_json(WsStatusMessage(type="status", engineStatus="busy").model_dump())
    result = await session.execute(
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
            status=result.status,
            durationMs=round((time.perf_counter() - startedAt) * 1000, 1),
            executionCount=result.executionCount,
        ),
    )
    await websocket.send_json(
        WsResultMessage(
            type="result",
            requestId=requestId,
            blockId=blockId,
            status=result.status,
            data=result.data,
            stdout=result.stdout,
            stderr=result.stderr,
            variables=result.variables,
            stateDelta=result.stateDelta,
            executionCount=result.executionCount,
        ).model_dump()
    )
    await websocket.send_json(WsStatusMessage(type="status", engineStatus="ready").model_dump())


async def handleReactiveMessage(
    websocket: WebSocket,
    session,
    message: WsExecuteReactiveMessage,
    logger,
) -> None:
    requestId = message.requestId
    changedBlockId = message.blockId
    blocks = [block.model_dump() for block in message.blocks]

    startedAt = time.perf_counter()
    await websocket.send_json(WsStatusMessage(type="status", engineStatus="busy").model_dump())
    reactiveEvents: list[dict[str, Any]] = []

    async def eventHandler(event) -> None:
        reactiveEvents.append(
            {
                "blockId": event.blockId,
                "eventType": event.eventType,
            }
        )
        await sendExecutionEvent(websocket, requestId, event)

    results, executionOrder = await executeReactive(session, blocks, changedBlockId, eventHandler=eventHandler)
    logger.debug(
        "kernel-reactive %s",
        formatLogFields(
            transport="ws",
            sessionId=session.sessionId,
            requestId=requestId,
            changedBlockId=changedBlockId,
            resultCount=len(results),
            executionCount=len(executionOrder),
            eventCount=len(reactiveEvents),
            durationMs=round((time.perf_counter() - startedAt) * 1000, 1),
        ),
    )
    for result in results:
        await websocket.send_json(
            WsResultMessage(
                type="result",
                requestId=requestId,
                blockId=result.blockId,
                status=result.status,
                data=result.data,
                stdout=result.stdout,
                stderr=result.stderr,
                variables=result.variables,
                stateDelta=result.stateDelta,
                executionCount=result.executionCount,
            ).model_dump()
        )
    await websocket.send_json({
        "type": "reactiveComplete",
        "requestId": requestId,
        "executionOrder": executionOrder,
    })
    await websocket.send_json(WsStatusMessage(type="status", engineStatus="ready").model_dump())


async def sendExecutionEvent(websocket: WebSocket, requestId: str, event) -> None:
    await websocket.send_json(
        WsExecutionEventMessage(
            requestId=requestId,
            blockId=event.blockId,
            sequence=event.sequence,
            eventType=event.eventType,
            executionCount=event.executionCount,
            payload=event.payload,
        ).model_dump()
    )
