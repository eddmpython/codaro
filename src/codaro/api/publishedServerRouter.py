from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request

from ..document.models import LoadRequest
from ..kernel.executionPayload import executeKernelAll, executeKernelBlock, executeKernelReactive
from ..kernel.protocol import CreateSessionRequest, CreateSessionResponse, ExecuteRequest, UiEventRequest, UiEventResponse
from ..kernel.session import KernelSession
from ..publication.serverRuntime import PUBLIC_DOCUMENT_PATH, PublishedServerRequestError, PublishedServerRuntime
from ..serverLog import formatLogFields, getServerLogger
from .errors import fail
from .requestModels import NotebookExecuteRequest, ReactiveExecuteRequest, SetUiValueRequest


def createPublishedServerRouter(runtime: PublishedServerRuntime) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()

    def requireSession(sessionId: str) -> KernelSession:
        session = runtime.sessionManager.getSession(sessionId)
        if session is None:
            fail(404, "session_not_found", "Session not found.")
        return session

    def enforce(action) -> None:
        try:
            action()
        except PublishedServerRequestError as error:
            fail(error.statusCode, error.code, error.message)

    @router.get("/api/health")
    def health() -> dict[str, object]:
        return {
            "status": "ok",
            "target": "server",
            "bundleHash": runtime.bundleHash,
            "policyHash": runtime.policyHash,
            "activeSessions": runtime.sessionManager.sessionCount,
        }

    @router.get("/api/bootstrap")
    def bootstrap(request: Request) -> dict[str, object]:
        return {
            "appMode": True,
            "documentPath": PUBLIC_DOCUMENT_PATH,
            "workspaceRoot": "publication",
            "rootPath": request.scope.get("root_path", ""),
            "publicationTarget": "server",
            "bundleHash": runtime.bundleHash,
        }

    @router.post("/api/document/load")
    def loadPublishedDocument(request: LoadRequest) -> dict[str, object]:
        if request.path != PUBLIC_DOCUMENT_PATH:
            fail(404, "publication_document_not_found", "Published document not found.")
        return {
            "path": PUBLIC_DOCUMENT_PATH,
            "document": runtime.document.model_dump(mode="json"),
            "exists": True,
        }

    @router.post("/api/kernel/create", response_model=CreateSessionResponse)
    def createSession(request: CreateSessionRequest | None = None) -> CreateSessionResponse:
        if request is not None and request.workingDirectory:
            fail(403, "publication_working_directory_forbidden", "Published sessions cannot select a working directory.")
        session = runtime.sessionManager.createSession()
        logger.info(
            "publication-session %s",
            formatLogFields(action="create", sessionId=session.sessionId, bundleHash=runtime.bundleHash),
        )
        return CreateSessionResponse(sessionId=session.sessionId, status=session.status)

    @router.delete("/api/kernel/{sessionId}")
    def destroySession(sessionId: str) -> dict[str, bool]:
        requireSession(sessionId)
        return {"destroyed": runtime.sessionManager.destroySession(sessionId)}

    @router.post("/api/kernel/{sessionId}/execute")
    async def execute(sessionId: str, request: ExecuteRequest) -> dict[str, Any]:
        enforce(lambda: runtime.validateBlock(request.blockId, request.code))
        payload = await executeKernelBlock(requireSession(sessionId), request.code, blockId=request.blockId)
        return runtime.redact(payload.httpPayload())

    @router.post("/api/kernel/{sessionId}/execute-all")
    async def executeAll(sessionId: str, request: NotebookExecuteRequest) -> dict[str, Any]:
        blocks = [block.model_dump() for block in request.blocks]
        enforce(lambda: runtime.validateBlocks(blocks))
        payload = await executeKernelAll(requireSession(sessionId), blocks, notebookName=request.notebookName)
        return runtime.redact(payload.httpPayload())

    @router.post("/api/kernel/{sessionId}/execute-reactive")
    async def executeReactive(sessionId: str, request: ReactiveExecuteRequest) -> dict[str, Any]:
        blocks = [block.model_dump() for block in request.blocks]
        enforce(lambda: runtime.validateBlocks(blocks))
        if request.blockId not in runtime.expectedById:
            fail(409, "publication_block_unknown", "Published block is not in the immutable document.")
        payload = await executeKernelReactive(
            requireSession(sessionId),
            blocks,
            request.blockId,
            notebookName=request.notebookName,
        )
        return runtime.redact(payload.httpPayload())

    @router.post("/api/kernel/{sessionId}/set-ui-value")
    async def setUiValue(sessionId: str, request: SetUiValueRequest) -> dict[str, Any]:
        blocks = [block.model_dump() for block in request.blocks]
        enforce(lambda: runtime.validateBlocks(blocks))
        enforce(lambda: runtime.validateUiValue(request.value))
        session = requireSession(sessionId)
        session.setUiValue(request.elementId, request.value)
        payload = await executeKernelReactive(session, blocks, request.blockId, includeSource=False)
        return runtime.redact(payload.httpPayload())

    @router.post("/api/kernel/{sessionId}/interrupt")
    def interrupt(sessionId: str) -> dict[str, bool]:
        result = requireSession(sessionId).interrupt()
        return {"interrupted": bool(result.interrupted)}

    @router.post("/api/kernel/{sessionId}/reset")
    def reset(sessionId: str) -> dict[str, str]:
        requireSession(sessionId).reset()
        return {"status": "reset"}

    @router.get("/api/kernel/{sessionId}/variables")
    def variables(sessionId: str) -> list[dict[str, Any]]:
        payload = [item.model_dump(mode="json") for item in requireSession(sessionId).getVariables()]
        return runtime.redact(payload)

    @router.post("/api/kernel/{sessionId}/ui-event", response_model=UiEventResponse)
    def uiEvent(sessionId: str, request: UiEventRequest) -> UiEventResponse:
        response = requireSession(sessionId).invokeUiCallback(request)
        if response.status == "missing":
            fail(404, "ui_callback_not_found", "UI callback not found.")
        return UiEventResponse.model_validate(runtime.redact(response.model_dump(mode="json")))

    @router.get("/api/kernel/{sessionId}/packages/list")
    def packages(sessionId: str) -> list[dict[str, str]]:
        requireSession(sessionId)
        return runtime.packagePayload()

    @router.api_route("/api/{fullPath:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
    def unavailableApi(fullPath: str) -> None:
        del fullPath
        fail(404, "publication_api_not_available", "This API is not available in a published app.")

    return router
