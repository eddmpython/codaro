from __future__ import annotations

import time
import uuid
from pathlib import Path
from typing import Any

from fastapi import APIRouter

from ..document.models import BlockConfig, CodaroDocument, ExportRequest, ExportResponse, LoadRequest, SaveRequest
from ..document.service import createEmptyDocument, exportDocument, loadDocument, saveDocument
from ..serverLog import formatLogFields, getServerLogger
from .appState import ServerState
from .errors import fail
from .requestModels import InsertBlockRequest, MoveBlockRequest, RemoveBlockRequest, RunBlockRequest, UpdateBlockRequest


def createDocumentRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()

    @router.post("/api/document/load")
    def apiLoadDocument(request: LoadRequest) -> dict[str, Any]:
        path = Path(request.path).expanduser()
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
        savedPath = saveDocument(request.path, request.document)
        logger.info(
            "document-save %s",
            formatLogFields(path=savedPath, title=request.document.title, blockCount=len(request.document.blocks)),
        )
        return {"path": str(savedPath)}

    @router.post("/api/document/export", response_model=ExportResponse)
    def apiExportDocument(request: ExportRequest) -> ExportResponse:
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
        path = Path(request.path).expanduser().resolve()
        if not path.exists():
            fail(404, "document_not_found", "Document not found.")
        document = loadDocument(str(path))
        newBlock = BlockConfig(
            id=f"block-{uuid.uuid4().hex[:8]}",
            type=request.type,
            content=request.content,
        )
        if not request.anchorBlockId:
            document.blocks.append(newBlock)
        else:
            anchorIndex = findBlockIndex(document, request.anchorBlockId)
            insertionIndex = anchorIndex if request.direction == "before" else anchorIndex + 1
            document.blocks.insert(insertionIndex, newBlock)
        saveDocument(str(path), document)
        logger.debug(
            "document-block %s",
            formatLogFields(
                action="insert",
                path=path,
                blockId=newBlock.id,
                blockType=newBlock.type,
                direction=request.direction,
                anchorBlockId=request.anchorBlockId,
                blockCount=len(document.blocks),
            ),
        )
        return {"blockId": newBlock.id, "document": document.model_dump()}

    @router.post("/api/document/remove-block")
    def apiRemoveBlock(request: RemoveBlockRequest) -> dict[str, Any]:
        path = Path(request.path).expanduser().resolve()
        if not path.exists():
            fail(404, "document_not_found", "Document not found.")
        document = loadDocument(str(path))
        document.blocks = [block for block in document.blocks if block.id != request.blockId]
        saveDocument(str(path), document)
        logger.debug(
            "document-block %s",
            formatLogFields(
                action="remove",
                path=path,
                blockId=request.blockId,
                blockCount=len(document.blocks),
            ),
        )
        return {"document": document.model_dump()}

    @router.post("/api/document/move-block")
    def apiMoveBlock(request: MoveBlockRequest) -> dict[str, Any]:
        path = Path(request.path).expanduser().resolve()
        if not path.exists():
            fail(404, "document_not_found", "Document not found.")
        if request.offset == 0:
            fail(400, "document_move_invalid_offset", "Move offset must be non-zero.")
        document = loadDocument(str(path))
        index = findBlockIndex(document, request.blockId)
        nextIndex = index + request.offset
        if nextIndex < 0 or nextIndex >= len(document.blocks):
            fail(400, "document_move_out_of_range", "Move out of range.")
        block = document.blocks.pop(index)
        document.blocks.insert(nextIndex, block)
        saveDocument(str(path), document)
        logger.debug(
            "document-block %s",
            formatLogFields(
                action="move",
                path=path,
                blockId=request.blockId,
                fromIndex=index,
                toIndex=nextIndex,
                offset=request.offset,
            ),
        )
        return {"document": document.model_dump()}

    @router.post("/api/document/update-block")
    def apiUpdateBlock(request: UpdateBlockRequest) -> dict[str, Any]:
        path = Path(request.path).expanduser().resolve()
        if not path.exists():
            fail(404, "document_not_found", "Document not found.")
        if request.content is None and request.type is None:
            fail(400, "document_block_update_empty", "No block fields were provided for update.")
        document = loadDocument(str(path))
        index = findBlockIndex(document, request.blockId)
        block = document.blocks[index]
        if request.content is not None:
            block = block.model_copy(update={"content": request.content})
        if request.type is not None:
            block = block.model_copy(update={"type": request.type})
        document.blocks[index] = block
        saveDocument(str(path), document)
        logger.debug(
            "document-block %s",
            formatLogFields(
                action="update",
                path=path,
                blockId=request.blockId,
                blockType=block.type,
                contentLength=len(block.content),
            ),
        )
        return {"block": block.model_dump(), "document": document.model_dump()}

    @router.post("/api/document/run-block")
    async def apiRunBlock(request: RunBlockRequest) -> dict[str, Any]:
        session = state.sessionManager.getSession(request.sessionId)
        if session is None:
            fail(404, "session_not_found", "Session not found.")
        path = Path(request.path).expanduser().resolve()
        if not path.exists():
            fail(404, "document_not_found", "Document not found.")
        document = loadDocument(str(path))
        index = findBlockIndex(document, request.blockId)
        block = document.blocks[index]
        if block.type != "code":
            fail(400, "document_block_not_code", "Block is not a code block.")
        startedAt = time.perf_counter()
        result = await session.execute(block.content, blockId=block.id)
        logger.debug(
            "document-run %s",
            formatLogFields(
                path=path,
                sessionId=request.sessionId,
                blockId=block.id,
                status=result.status,
                durationMs=round((time.perf_counter() - startedAt) * 1000, 1),
            ),
        )
        return {"result": result.model_dump(), "blockId": block.id}

    return router


def findBlockIndex(document: CodaroDocument, blockId: str) -> int:
    for index, block in enumerate(document.blocks):
        if block.id == blockId:
            return index
    fail(404, "document_block_not_found", f"Block {blockId} not found.")
