from __future__ import annotations

import re
from pathlib import Path
from threading import Lock
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
from ..document.models import CodaroDocument, ExportRequest, ExportResponse, LoadRequest, SaveRequest
from ..document.service import createEmptyDocument, exportDocument, loadDocument, saveDocument
from ..kernel.documentExecution import executeDocumentCodeBlock
from ..serverLog import formatLogFields, getServerLogger
from ..system.fileOps import WorkspacePathError, resolvePath
from ..system.serverState import ServerState
from .errors import fail
from .requestModels import InsertBlockRequest, MoveBlockRequest, RemoveBlockRequest, RunBlockRequest, UpdateBlockRequest


WINDOWS_RESERVED_STEMS = {
    "AUX",
    "CON",
    "NUL",
    "PRN",
    *(f"COM{index}" for index in range(1, 10)),
    *(f"LPT{index}" for index in range(1, 10)),
}


def createDocumentRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()
    saveLock = Lock()
    latestSaveByDocument: dict[tuple[str, str], tuple[int, Path]] = {}

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
    def apiSaveDocument(request: SaveRequest) -> dict[str, str | int | bool | None]:
        generationValues = (
            request.saveDocumentId,
            request.saveRevision,
            request.saveSessionId,
        )
        if any(value is not None for value in generationValues) and any(
            value is None for value in generationValues
        ):
            fail(
                400,
                "document_save_generation_incomplete",
                "saveDocumentId, saveRevision, and saveSessionId must be provided together.",
            )

        with saveLock:
            generationKey = (
                (request.saveSessionId, request.saveDocumentId)
                if request.saveSessionId is not None and request.saveDocumentId is not None
                else None
            )
            latestSave: tuple[int, Path] | None = None
            if generationKey is not None and request.saveRevision is not None:
                latestSave = latestSaveByDocument.get(generationKey)
                if latestSave is not None and request.saveRevision <= latestSave[0]:
                    return {
                        "accepted": False,
                        "path": str(latestSave[1]),
                        "saveRevision": latestSave[0],
                    }

            requestedPath = safeResolvePath(request.path) if request.path else None
            # Jupyter import is intentionally lossy; autosave must never rewrite its source file.
            isJupyterAutosave = generationKey is not None and (
                request.document.metadata.sourceFormat == "ipynb"
                or (requestedPath is not None and requestedPath.suffix.lower() == ".ipynb")
            )
            documentToSave = (
                request.document.model_copy(
                    update={
                        "metadata": request.document.metadata.model_copy(
                            update={"sourceFormat": "percent"}
                        )
                    }
                )
                if isJupyterAutosave
                else request.document
            )
            if isJupyterAutosave:
                path = (
                    latestSave[1]
                    if latestSave is not None
                    else allocateCodaroCopyPath(
                        state.workspaceRoot,
                        documentToSave,
                        sourcePath=requestedPath,
                    )
                )
            else:
                path = (
                    requestedPath
                    if requestedPath is not None
                    else (
                        latestSave[1]
                        if generationKey is not None and latestSave is not None
                        else allocateDocumentPath(state.workspaceRoot, documentToSave)
                    )
                )
            savedPath = saveDocument(str(path), documentToSave)
            if generationKey is not None and request.saveRevision is not None:
                latestSaveByDocument[generationKey] = (request.saveRevision, savedPath)
            if (
                isJupyterAutosave
                and requestedPath is not None
                and state.documentPath is not None
                and state.documentPath.expanduser().resolve() == requestedPath
            ):
                state.documentPath = savedPath

        logger.info(
            "document-save %s",
            formatLogFields(path=savedPath, title=request.document.title, blockCount=len(request.document.blocks)),
        )
        return {
            "accepted": True,
            "path": str(savedPath),
            "saveRevision": request.saveRevision,
        }

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


def allocateDocumentPath(workspaceRoot: Path, document: CodaroDocument) -> Path:
    suffix = ".ipynb" if document.metadata.sourceFormat == "ipynb" else ".py"
    stem = safeDocumentStem(document.title, suffix=suffix)
    resolvedWorkspace = workspaceRoot.resolve()
    candidate = resolvedWorkspace / f"{stem}{suffix}"
    sequence = 2
    while candidate.exists():
        candidate = resolvedWorkspace / f"{stem}-{sequence}{suffix}"
        sequence += 1
    return candidate


def allocateCodaroCopyPath(
    workspaceRoot: Path,
    document: CodaroDocument,
    *,
    sourcePath: Path | None,
) -> Path:
    resolvedWorkspace = workspaceRoot.resolve()
    targetDirectory = sourcePath.parent if sourcePath is not None else resolvedWorkspace
    rawTitle = sourcePath.stem if sourcePath is not None else document.title
    stem = safeDocumentStem(rawTitle, suffix=".ipynb")
    candidate = targetDirectory / f"{stem}.codaro.py"
    sequence = 2
    while candidate.exists():
        candidate = targetDirectory / f"{stem}-{sequence}.codaro.py"
        sequence += 1
    return candidate


def safeDocumentStem(rawTitle: str, *, suffix: str) -> str:
    stemSource = str(rawTitle or "notebook").strip()
    if stemSource.lower().endswith(suffix):
        stemSource = stemSource[: -len(suffix)]
    stem = (
        re.sub(r'[<>:"/\\|?*\x00-\x1f]+', "-", stemSource).strip(" .-")[:80]
        or "notebook"
    )
    if stem.upper() in WINDOWS_RESERVED_STEMS:
        return f"notebook-{stem.lower()}"
    return stem
