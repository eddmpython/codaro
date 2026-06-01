from __future__ import annotations

from typing import Any

from fastapi import APIRouter, WebSocket

from ..kernel.executionPayload import executeKernelBlock, executeKernelReactive, previewKernelReactiveOrder
from ..kernel.protocol import (
    CreateSessionRequest,
    CreateSessionResponse,
    ExecuteRequest,
    UiEventRequest,
    UiEventResponse,
)
from ..kernel.uiEventFlow import UiCallbackNotFound, handleKernelUiEvent, resetKernelUiCallbacks
from ..serverLog import formatLogFields, getServerLogger
from ..system.fileOps import MoveRequest, WorkspacePathError, WriteFileRequest
from ..system.packageOps import PackageEnvironmentError
from ..system.serverState import ServerState
from .errors import fail
from .kernelWebSocket import handleKernelWebSocket
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
        payload = await executeKernelBlock(session, request.code, blockId=request.blockId)
        logger.debug(
            "kernel-execute %s",
            formatLogFields(
                transport="http",
                sessionId=sessionId,
                blockId=request.blockId,
                status=payload.result.status,
                durationMs=payload.durationMs,
                executionCount=payload.result.executionCount,
            ),
        )
        return payload.httpPayload()

    @router.post("/api/kernel/{sessionId}/interrupt")
    def apiInterrupt(sessionId: str) -> dict[str, Any]:
        session = requireSession(state, sessionId)
        result = session.interrupt()
        interrupted = result.interrupted if hasattr(result, "interrupted") else bool(result)
        logger.info(
            "kernel-interrupt %s",
            formatLogFields(sessionId=sessionId, interrupted=interrupted),
        )
        return {"interrupted": interrupted}

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
        resetKernelUiCallbacks()
        logger.info("kernel-reset %s", formatLogFields(sessionId=sessionId))
        return {"status": "reset"}

    @router.post("/api/kernel/{sessionId}/ui-event", response_model=UiEventResponse)
    def apiUiEvent(sessionId: str, request: UiEventRequest) -> UiEventResponse:
        requireSession(state, sessionId)
        try:
            response = handleKernelUiEvent(request)
        except UiCallbackNotFound:
            logger.warning(
                "ui-event %s",
                formatLogFields(action="missing", sessionId=sessionId, callbackId=request.callbackId),
            )
            fail(404, "ui_callback_not_found", "UI callback not found.")
        if response.status == "error":
            logger.warning(
                "ui-event %s",
                formatLogFields(
                    action="error",
                    sessionId=sessionId,
                    callbackId=request.callbackId,
                    eventType=request.eventType,
                    error=response.error,
                ),
            )
            return response
        logger.debug(
            "ui-event %s",
            formatLogFields(
                action="invoke",
                sessionId=sessionId,
                callbackId=request.callbackId,
                eventType=request.eventType,
                blockId=request.blockId,
                reactiveTriggerCount=len(response.reactiveTrigger),
            ),
        )
        return response

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
        blocks = [block.model_dump() for block in request.blocks]
        payload = await executeKernelReactive(session, blocks, request.blockId)
        logger.debug(
            "kernel-reactive %s",
            formatLogFields(
                transport="http",
                sessionId=sessionId,
                changedBlockId=request.blockId,
                resultCount=payload.resultCount,
                executionCount=payload.executionCount,
                durationMs=payload.durationMs,
            ),
        )
        return payload.httpPayload()

    @router.post("/api/kernel/reactive-preview")
    def apiReactivePreview(request: ReactiveExecuteRequest) -> dict[str, Any]:
        executionOrder = previewKernelReactiveOrder([block.model_dump() for block in request.blocks], request.blockId)
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
                formatLogFields(
                    action="read", sessionId=sessionId, path=request.path, contentLength=len(content.content)
                ),
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
        try:
            result = await session.installPackage(request.name)
        except PackageEnvironmentError as error:
            fail(error.statusCode, error.code, error.message)
        logger.info(
            "kernel-packages %s",
            formatLogFields(action="install", sessionId=sessionId, name=request.name, success=result.success),
        )
        return result.model_dump()

    @router.post("/api/kernel/{sessionId}/packages/uninstall")
    async def apiUninstallSessionPackage(sessionId: str, request: PackageRequest) -> dict[str, Any]:
        session = requireSession(state, sessionId)
        try:
            result = await session.uninstallPackage(request.name)
        except PackageEnvironmentError as error:
            fail(error.statusCode, error.code, error.message)
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

        await handleKernelWebSocket(websocket, session, logger)

    return router


def requireSession(state: ServerState, sessionId: str):
    session = state.sessionManager.getSession(sessionId)
    if session is None:
        fail(404, "session_not_found", "Session not found.")
    return session
