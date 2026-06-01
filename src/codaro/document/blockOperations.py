from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal
import uuid

from .models import BlockConfig, CodaroDocument
from .service import loadDocument, saveDocument


DocumentOperationErrorKind = Literal["invalid", "not_found"]
BlockInsertDirection = Literal["before", "after"]
EditableBlockType = Literal["code", "markdown"]


class DocumentOperationError(Exception):
    def __init__(self, code: str, message: str, *, kind: DocumentOperationErrorKind = "invalid") -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.kind = kind


@dataclass(frozen=True)
class BlockMutationResult:
    document: CodaroDocument
    block: BlockConfig | None = None
    fromIndex: int | None = None
    toIndex: int | None = None

    @property
    def blockCount(self) -> int:
        return len(self.document.blocks)


def insertBlock(
    path: Path,
    *,
    anchorBlockId: str | None,
    direction: BlockInsertDirection,
    blockType: EditableBlockType,
    content: str,
) -> BlockMutationResult:
    document = loadExistingDocument(path)
    newBlock = BlockConfig(
        id=newBlockId(),
        type=blockType,
        content=content,
    )
    if not anchorBlockId:
        document.blocks.append(newBlock)
    else:
        anchorIndex = findBlockIndex(document, anchorBlockId)
        insertionIndex = anchorIndex if direction == "before" else anchorIndex + 1
        document.blocks.insert(insertionIndex, newBlock)
    saveDocument(str(path), document)
    return BlockMutationResult(document=document, block=newBlock)


def insertDocumentBlock(
    document: CodaroDocument,
    *,
    blockType: str,
    content: str,
    position: int,
    idPrefix: str = "block",
    role: str | None = None,
    executionKind: str | None = None,
    displayKind: str | None = None,
    sourceType: str | None = None,
    title: str | None = None,
    description: str | None = None,
    payload: object | None = None,
) -> BlockMutationResult:
    newBlock = BlockConfig(
        id=newBlockId(idPrefix),
        type=blockType,
        content=content,
        role=role,
        executionKind=executionKind,
        displayKind=displayKind,
        sourceType=sourceType,
        title=title,
        description=description,
        payload=payload,
    )
    if position < 0 or position >= len(document.blocks):
        document.blocks.append(newBlock)
        resolvedPosition = len(document.blocks) - 1
    else:
        document.blocks.insert(position, newBlock)
        resolvedPosition = position
    return BlockMutationResult(document=document, block=newBlock, toIndex=resolvedPosition)


def updateDocumentBlock(
    document: CodaroDocument,
    *,
    blockId: str,
    content: str | None,
    blockType: str | None = None,
) -> BlockMutationResult:
    if content is None and blockType is None:
        raise DocumentOperationError(
            "document_block_update_empty",
            "No block fields were provided for update.",
        )
    index = findBlockIndex(document, blockId)
    block = document.blocks[index]
    if content is not None:
        block = block.model_copy(update={"content": content})
    if blockType is not None:
        block = block.model_copy(update={"type": blockType})
    document.blocks[index] = block
    return BlockMutationResult(document=document, block=block)


def removeDocumentBlock(document: CodaroDocument, *, blockId: str) -> BlockMutationResult:
    index = findBlockIndex(document, blockId)
    block = document.blocks.pop(index)
    return BlockMutationResult(document=document, block=block, fromIndex=index)


def removeBlock(path: Path, *, blockId: str) -> BlockMutationResult:
    document = loadExistingDocument(path)
    document.blocks = [block for block in document.blocks if block.id != blockId]
    saveDocument(str(path), document)
    return BlockMutationResult(document=document)


def moveBlock(path: Path, *, blockId: str, offset: int) -> BlockMutationResult:
    if offset == 0:
        raise DocumentOperationError(
            "document_move_invalid_offset",
            "Move offset must be non-zero.",
        )
    document = loadExistingDocument(path)
    index = findBlockIndex(document, blockId)
    nextIndex = index + offset
    if nextIndex < 0 or nextIndex >= len(document.blocks):
        raise DocumentOperationError(
            "document_move_out_of_range",
            "Move out of range.",
        )
    block = document.blocks.pop(index)
    document.blocks.insert(nextIndex, block)
    saveDocument(str(path), document)
    return BlockMutationResult(document=document, block=block, fromIndex=index, toIndex=nextIndex)


def updateBlock(
    path: Path,
    *,
    blockId: str,
    content: str | None,
    blockType: EditableBlockType | None,
) -> BlockMutationResult:
    if content is None and blockType is None:
        raise DocumentOperationError(
            "document_block_update_empty",
            "No block fields were provided for update.",
        )
    document = loadExistingDocument(path)
    index = findBlockIndex(document, blockId)
    block = document.blocks[index]
    if content is not None:
        block = block.model_copy(update={"content": content})
    if blockType is not None:
        block = block.model_copy(update={"type": blockType})
    document.blocks[index] = block
    saveDocument(str(path), document)
    return BlockMutationResult(document=document, block=block)


def loadCodeBlockForExecution(path: Path, *, blockId: str) -> BlockConfig:
    document = loadExistingDocument(path)
    index = findBlockIndex(document, blockId)
    block = document.blocks[index]
    if block.type != "code":
        raise DocumentOperationError(
            "document_block_not_code",
            "Block is not a code block.",
        )
    return block


def loadExistingDocument(path: Path) -> CodaroDocument:
    if not path.exists():
        raise DocumentOperationError(
            "document_not_found",
            "Document not found.",
            kind="not_found",
        )
    return loadDocument(str(path))


def findBlockIndex(document: CodaroDocument, blockId: str) -> int:
    for index, block in enumerate(document.blocks):
        if block.id == blockId:
            return index
    raise DocumentOperationError(
        "document_block_not_found",
        f"Block {blockId} not found.",
        kind="not_found",
    )


def newBlockId(prefix: str = "block") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"
