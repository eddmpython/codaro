from pathlib import Path

import pytest

from codaro.document.blockOperations import (
    DocumentOperationError,
    getDocumentBlock,
    getDocumentCodeBlock,
    insertDocumentBlock,
    insertBlock,
    loadCodeBlockForExecution,
    moveBlock,
    removeDocumentBlock,
    updateDocumentBlock,
    updateBlock,
)
from codaro.document.models import BlockConfig, CodaroDocument
from codaro.document.service import createEmptyDocument, saveDocument


def savedDocumentPath(tmp_path: Path) -> Path:
    document = createEmptyDocument("Ops")
    document.blocks[0] = document.blocks[0].model_copy(update={"id": "b1", "content": "value = 1"})
    path = tmp_path / "ops.py"
    saveDocument(str(path), document)
    return path


def testInsertMoveAndUpdateBlockPersistsThroughDocumentService(tmp_path: Path) -> None:
    path = savedDocumentPath(tmp_path)

    inserted = insertBlock(
        path,
        anchorBlockId="b1",
        direction="after",
        blockType="markdown",
        content="note",
    )
    assert inserted.block is not None
    newBlockId = inserted.block.id
    assert [block.id for block in inserted.document.blocks] == ["b1", newBlockId]

    moved = moveBlock(path, blockId=newBlockId, offset=-1)
    assert [block.id for block in moved.document.blocks] == [newBlockId, "b1"]
    assert moved.fromIndex == 1
    assert moved.toIndex == 0

    updated = updateBlock(path, blockId=newBlockId, content="updated note", blockType=None)

    assert updated.block is not None
    assert updated.block.content == "updated note"
    assert updated.document.blocks[0].content == "updated note"


def testInMemoryDocumentBlockOperationsMutateCurrentDocument() -> None:
    document = CodaroDocument(
        id="doc",
        title="Tool Doc",
        blocks=[BlockConfig(id="b1", type="code", content="x = 1")],
    )

    inserted = insertDocumentBlock(
        document,
        blockType="automation",
        content="run()",
        position=1,
        idPrefix="automation",
        role="automation",
        executionKind="python",
        displayKind="cell",
        sourceType="automationAuthoring",
        title="Daily Report",
        description="Prepare report",
        payload={"dryRunFirst": True},
    )
    assert inserted.block is not None
    blockId = inserted.block.id
    assert blockId.startswith("automation-")
    assert inserted.toIndex == 1
    assert document.blocks[1].type == "automation"
    assert document.blocks[1].role == "automation"
    assert document.blocks[1].executionKind == "python"
    assert document.blocks[1].sourceType == "automationAuthoring"
    assert document.blocks[1].payload == {"dryRunFirst": True}

    updated = updateDocumentBlock(document, blockId=blockId, content="dry_run()", blockType=None)
    assert updated.block is not None
    assert document.blocks[1].content == "dry_run()"

    removed = removeDocumentBlock(document, blockId=blockId)
    assert removed.fromIndex == 1
    assert [block.id for block in document.blocks] == ["b1"]


def testGetDocumentBlockHelpersResolveCurrentDocumentBlocks() -> None:
    document = CodaroDocument(
        id="doc",
        title="Tool Doc",
        blocks=[
            BlockConfig(id="code-1", type="code", content="x = 1"),
            BlockConfig(id="note-1", type="markdown", content="note"),
        ],
    )

    assert getDocumentBlock(document, blockId="note-1").content == "note"
    assert getDocumentCodeBlock(document, blockId="code-1").content == "x = 1"

    with pytest.raises(DocumentOperationError) as excInfo:
        getDocumentCodeBlock(document, blockId="note-1")

    assert excInfo.value.code == "document_block_not_code"


def testLoadCodeBlockForExecutionRejectsMarkdown(tmp_path: Path) -> None:
    path = savedDocumentPath(tmp_path)
    inserted = insertBlock(
        path,
        anchorBlockId="b1",
        direction="after",
        blockType="markdown",
        content="note",
    )
    assert inserted.block is not None

    with pytest.raises(DocumentOperationError) as excInfo:
        loadCodeBlockForExecution(path, blockId=inserted.block.id)

    assert excInfo.value.code == "document_block_not_code"
    assert excInfo.value.kind == "invalid"


def testMissingBlockIsDomainNotFoundError(tmp_path: Path) -> None:
    path = savedDocumentPath(tmp_path)

    with pytest.raises(DocumentOperationError) as excInfo:
        updateBlock(path, blockId="missing", content="x = 2", blockType=None)

    assert excInfo.value.code == "document_block_not_found"
    assert excInfo.value.kind == "not_found"
