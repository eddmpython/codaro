from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Request, Response

from ..document.models import LoadRequest
from ..kernel.executionPayload import executeKernelAll, executeKernelBlock, executeKernelReactive
from ..kernel.protocol import CreateSessionRequest, CreateSessionResponse, ExecuteRequest, UiEventRequest, UiEventResponse
from ..kernel.session import KernelSession
from ..publication.publishedRuntime import PUBLIC_DOCUMENT_PATH, PublishedAppRequestError, PublishedAppRuntime
from ..serverLog import formatLogFields, getServerLogger
from .errors import fail
from .requestModels import NotebookExecuteRequest, ReactiveExecuteRequest, SetUiValueRequest


_OWNER_COOKIE = "codaro_published_owner"


def createPublishedServerRouter(runtime: PublishedAppRuntime) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()

    def ownerToken(request: Request) -> str | None:
        return request.cookies.get(_OWNER_COOKIE)

    def requireSession(sessionId: str, request: Request) -> KernelSession:
        try:
            return runtime.requireOwnedSession(sessionId, ownerToken(request))
        except PublishedAppRequestError as error:
            fail(error.statusCode, error.code, error.message)

    def enforce(action) -> None:
        try:
            action()
        except PublishedAppRequestError as error:
            fail(error.statusCode, error.code, error.message)

    @router.get("/api/health")
    def health() -> dict[str, object]:
        return {
            "status": "ok",
            "target": runtime.publicationTarget,
            "bundleHash": runtime.bundleHash,
            "policyHash": runtime.policyHash,
            "activeSessions": runtime.sessionManager.sessionCount,
            "permissionApprovalHash": runtime.approvalHash,
        }

    @router.get("/api/bootstrap")
    def bootstrap(request: Request) -> dict[str, object]:
        return {
            "appMode": True,
            "documentPath": PUBLIC_DOCUMENT_PATH,
            "workspaceRoot": "publication",
            "rootPath": request.scope.get("root_path", ""),
            "publicationTarget": runtime.publicationTarget,
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
    def createSession(
        httpRequest: Request,
        response: Response,
        request: CreateSessionRequest | None = None,
    ) -> CreateSessionResponse:
        if request is not None and request.workingDirectory:
            fail(403, "publication_working_directory_forbidden", "Published sessions cannot select a working directory.")
        owner = ownerToken(httpRequest) or runtime.newOwnerToken()
        try:
            session = runtime.createOwnedSession(owner)
        except PublishedAppRequestError as error:
            fail(error.statusCode, error.code, error.message)
        response.set_cookie(
            _OWNER_COOKIE,
            owner,
            httponly=True,
            samesite="strict",
            secure=httpRequest.url.scheme == "https",
            path="/",
        )
        logger.info(
            "publication-session %s",
            formatLogFields(action="create", sessionId=session.sessionId, bundleHash=runtime.bundleHash),
        )
        return CreateSessionResponse(sessionId=session.sessionId, status=session.status)

    @router.delete("/api/kernel/{sessionId}")
    def destroySession(sessionId: str, request: Request) -> dict[str, bool]:
        try:
            return {"destroyed": runtime.destroyOwnedSession(sessionId, ownerToken(request))}
        except PublishedAppRequestError as error:
            fail(error.statusCode, error.code, error.message)

    @router.post("/api/kernel/{sessionId}/execute")
    async def execute(sessionId: str, httpRequest: Request, request: ExecuteRequest) -> dict[str, Any]:
        enforce(lambda: runtime.validateBlock(request.blockId, request.code))
        payload = await executeKernelBlock(requireSession(sessionId, httpRequest), request.code, blockId=request.blockId)
        return runtime.redact(payload.httpPayload())

    @router.post("/api/kernel/{sessionId}/execute-all")
    async def executeAll(sessionId: str, httpRequest: Request, request: NotebookExecuteRequest) -> dict[str, Any]:
        blocks = [block.model_dump() for block in request.blocks]
        enforce(lambda: runtime.validateBlocks(blocks))
        payload = await executeKernelAll(requireSession(sessionId, httpRequest), blocks, notebookName=request.notebookName)
        return runtime.redact(payload.httpPayload())

    @router.post("/api/kernel/{sessionId}/execute-reactive")
    async def executeReactive(sessionId: str, httpRequest: Request, request: ReactiveExecuteRequest) -> dict[str, Any]:
        blocks = [block.model_dump() for block in request.blocks]
        enforce(lambda: runtime.validateBlocks(blocks))
        if request.blockId not in runtime.expectedById:
            fail(409, "publication_block_unknown", "Published block is not in the immutable document.")
        payload = await executeKernelReactive(
            requireSession(sessionId, httpRequest),
            blocks,
            request.blockId,
            notebookName=request.notebookName,
        )
        return runtime.redact(payload.httpPayload())

    @router.post("/api/kernel/{sessionId}/set-ui-value")
    async def setUiValue(sessionId: str, httpRequest: Request, request: SetUiValueRequest) -> dict[str, Any]:
        blocks = [block.model_dump() for block in request.blocks]
        enforce(lambda: runtime.validateBlocks(blocks))
        enforce(lambda: runtime.validateUiValue(request.value))
        session = requireSession(sessionId, httpRequest)
        session.setUiValue(request.elementId, request.value)
        payload = await executeKernelReactive(session, blocks, request.blockId, includeSource=False)
        return runtime.redact(payload.httpPayload())

    @router.post("/api/kernel/{sessionId}/interrupt")
    def interrupt(sessionId: str, request: Request) -> dict[str, bool]:
        result = requireSession(sessionId, request).interrupt()
        return {"interrupted": bool(result.interrupted)}

    @router.post("/api/kernel/{sessionId}/reset")
    def reset(sessionId: str, request: Request) -> dict[str, str]:
        requireSession(sessionId, request).reset()
        return {"status": "reset"}

    @router.get("/api/kernel/{sessionId}/variables")
    def variables(sessionId: str, request: Request) -> list[dict[str, Any]]:
        payload = [item.model_dump(mode="json") for item in requireSession(sessionId, request).getVariables()]
        return runtime.redact(payload)

    @router.post("/api/kernel/{sessionId}/ui-event", response_model=UiEventResponse)
    def uiEvent(sessionId: str, httpRequest: Request, request: UiEventRequest) -> UiEventResponse:
        response = requireSession(sessionId, httpRequest).invokeUiCallback(request)
        if response.status == "missing":
            fail(404, "ui_callback_not_found", "UI callback not found.")
        return UiEventResponse.model_validate(runtime.redact(response.model_dump(mode="json")))

    @router.get("/api/kernel/{sessionId}/packages/list")
    def packages(sessionId: str, request: Request) -> list[dict[str, str]]:
        requireSession(sessionId, request)
        return runtime.packagePayload()

    @router.api_route("/api/{fullPath:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
    def unavailableApi(fullPath: str) -> None:
        del fullPath
        fail(404, "publication_api_not_available", "This API is not available in a published app.")

    return router
