from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import APIRouter

from ..document.blockOperations import (
    DocumentOperationError,
    insertBlock,
    loadCodeBlockForExecution,
    moveBlock,
    removeBlock,
    updateBlock,
)
from ..document.models import ExportRequest, ExportResponse, LoadRequest, SaveRequest
from ..document.service import createEmptyDocument, exportDocument, loadDocument, saveDocument
from ..kernel.documentExecution import executeDocumentCodeBlock
from ..serverLog import formatLogFields, getServerLogger
from ..system.fileOps import WorkspacePathError, resolvePath
from .appState import ServerState
from .errors import fail
from .requestModels import InsertBlockRequest, MoveBlockRequest, RemoveBlockRequest, RunBlockRequest, UpdateBlockRequest


def createDocumentRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()

    def safeResolvePath(rawPath: str) -> Path:
        try:
            return resolvePath(rawPath, state.workspaceRoot)
        except WorkspacePathError:
            fail(403, "document_path_outside_workspace", "Path must stay within the active workspace.")

    def failDocumentOperation(error: DocumentOperationError) -> None:
        statusCode = 404 if error.kind == "not_found" else 400
        fail(statusCode, error.code, error.message)

    @router.post("/api/document/load")
    def apiLoadDocument(request: LoadRequest) -> dict[str, Any]:
        path = safeResolvePath(request.path)
        if not path.exists():
            payload = {
                "path": str(path.resolve()),
                "document": createEmptyDocument(title=path.stem or "Untitled").model_dump(),
                "exists": False,
            }
            logger.debug(
                "document-load %s",
                formatLogFields(path=path.resolve(), exists=False, title=payload["document"]["title"]),
            )
            return payload
        document = loadDocument(str(path))
        logger.debug(
            "document-load %s",
            formatLogFields(path=path.resolve(), exists=True, title=document.title, blockCount=len(document.blocks)),
        )
        return {"path": str(path.resolve()), "document": document.model_dump(), "exists": True}

    @router.post("/api/document/save")
    def apiSaveDocument(request: SaveRequest) -> dict[str, str]:
        if not request.path:
            fail(400, "document_path_required", "Path is required for save.")
        safeResolvePath(request.path)
        savedPath = saveDocument(request.path, request.document)
        logger.info(
            "document-save %s",
            formatLogFields(path=savedPath, title=request.document.title, blockCount=len(request.document.blocks)),
        )
        return {"path": str(savedPath)}

    @router.post("/api/document/export", response_model=ExportResponse)
    def apiExportDocument(request: ExportRequest) -> ExportResponse:
        safeResolvePath(request.path)
        try:
            outputPath = exportDocument(request.path, request.format, request.outputPath)
        except ValueError as error:
            fail(400, "document_export_invalid", str(error))
        logger.info(
            "document-export %s",
            formatLogFields(path=request.path, format=request.format, outputPath=outputPath),
        )
        return ExportResponse(path=request.path, outputPath=str(outputPath), format=request.format)

    @router.post("/api/document/insert-block")
    def apiInsertBlock(request: InsertBlockRequest) -> dict[str, Any]:
        path = safeResolvePath(request.path)
        try:
            result = insertBlock(
                path,
                anchorBlockId=request.anchorBlockId,
                direction=request.direction,
                blockType=request.type,
                content=request.content,
            )
        except DocumentOperationError as error:
            failDocumentOperation(error)
        assert result.block is not None
        logger.debug(
            "document-block %s",
            formatLogFields(
                action="insert",
                path=path,
                blockId=result.block.id,
                blockType=result.block.type,
                direction=request.direction,
                anchorBlockId=request.anchorBlockId,
                blockCount=result.blockCount,
            ),
        )
        return {"blockId": result.block.id, "document": result.document.model_dump()}

    @router.post("/api/document/remove-block")
    def apiRemoveBlock(request: RemoveBlockRequest) -> dict[str, Any]:
        path = safeResolvePath(request.path)
        try:
            result = removeBlock(path, blockId=request.blockId)
        except DocumentOperationError as error:
            failDocumentOperation(error)
        logger.debug(
            "document-block %s",
            formatLogFields(
                action="remove",
                path=path,
                blockId=request.blockId,
                blockCount=result.blockCount,
            ),
        )
        return {"document": result.document.model_dump()}

    @router.post("/api/document/move-block")
    def apiMoveBlock(request: MoveBlockRequest) -> dict[str, Any]:
        path = safeResolvePath(request.path)
        try:
            result = moveBlock(path, blockId=request.blockId, offset=request.offset)
        except DocumentOperationError as error:
            failDocumentOperation(error)
        logger.debug(
            "document-block %s",
            formatLogFields(
                action="move",
                path=path,
                blockId=request.blockId,
                fromIndex=result.fromIndex,
                toIndex=result.toIndex,
                offset=request.offset,
            ),
        )
        return {"document": result.document.model_dump()}

    @router.post("/api/document/update-block")
    def apiUpdateBlock(request: UpdateBlockRequest) -> dict[str, Any]:
        path = safeResolvePath(request.path)
        try:
            result = updateBlock(
                path,
                blockId=request.blockId,
                content=request.content,
                blockType=request.type,
            )
        except DocumentOperationError as error:
            failDocumentOperation(error)
        assert result.block is not None
        logger.debug(
            "document-block %s",
            formatLogFields(
                action="update",
                path=path,
                blockId=request.blockId,
                blockType=result.block.type,
                contentLength=len(result.block.content),
            ),
        )
        return {"block": result.block.model_dump(), "document": result.document.model_dump()}

    @router.post("/api/document/run-block")
    async def apiRunBlock(request: RunBlockRequest) -> dict[str, Any]:
        session = state.sessionManager.getSession(request.sessionId)
        if session is None:
            fail(404, "session_not_found", "Session not found.")
        path = safeResolvePath(request.path)
        try:
            block = loadCodeBlockForExecution(path, blockId=request.blockId)
        except DocumentOperationError as error:
            failDocumentOperation(error)
        payload = await executeDocumentCodeBlock(session, block)
        logger.debug(
            "document-run %s",
            formatLogFields(
                path=path,
                sessionId=request.sessionId,
                blockId=block.id,
                status=payload.result.status,
                durationMs=payload.durationMs,
            ),
        )
        return {"result": payload.httpPayload(), "blockId": block.id}

    return router
