from __future__ import annotations

from collections.abc import Iterable, Mapping
from pathlib import Path
from typing import Any
import uuid

from .models import BlockConfig, CodaroDocument
from .service import saveDocument


def buildGeneratedNotebookDocument(
    *,
    title: str,
    blockDrafts: Iterable[Mapping[str, Any]],
) -> CodaroDocument:
    return CodaroDocument(
        id=newNotebookDocumentId(),
        title=title,
        blocks=[
            BlockConfig(
                id=f"gen-{uuid.uuid4().hex[:8]}",
                type=str(block["type"]),
                content=str(block["content"]),
            )
            for block in blockDrafts
        ],
    )


def buildSplitNotebookDocument(
    *,
    title: str,
    blocks: Iterable[BlockConfig],
) -> CodaroDocument:
    return CodaroDocument(
        id=newNotebookDocumentId(),
        title=title,
        blocks=[
            BlockConfig(
                id=block.id,
                type=block.type,
                content=block.content,
            )
            for block in blocks
        ],
    )


def safeNotebookFileName(title: str) -> str:
    safeName = "".join(char if char.isalnum() or char in "-_ " else "" for char in title)
    return safeName.strip().replace(" ", "_")[:60] or "untitled"


def saveNotebookDocument(path: str | Path, document: CodaroDocument) -> None:
    saveDocument(str(path), document)


def newNotebookDocumentId() -> str:
    return f"doc-{uuid.uuid4().hex[:10]}"
