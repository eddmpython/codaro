from __future__ import annotations

import json
from pathlib import Path
import uuid

from .models import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig


def parseJupyterDocument(source: str, sourcePath: Path | None = None) -> CodaroDocument:
    payload = json.loads(source)
    title = sourcePath.stem if sourcePath else "Imported"
    blocks: list[BlockConfig] = []

    for cell in payload.get("cells", []):
        cellType = cell.get("cell_type")
        content = _normalizeSource(cell.get("source", ""))
        if cellType == "markdown":
            blocks.append(BlockConfig(id=_blockId(), type="markdown", content=content))
            continue
        if cellType == "code":
            blocks.append(BlockConfig(id=_blockId(), type="code", content=content))

    if not blocks:
        blocks.append(BlockConfig(id=_blockId(), type="code", content=""))

    return CodaroDocument(
        id=f"doc-{uuid.uuid4().hex[:10]}",
        title=title,
        blocks=blocks,
        metadata=DocumentMetadata(sourceFormat="ipynb"),
        runtime=RuntimeConfig(),
        app=AppConfig(title=title, entryBlockIds=[block.id for block in blocks if block.type == "code"]),
    )


def writeJupyterDocument(document: CodaroDocument) -> str:
    cells: list[dict[str, object]] = []
    for block in document.blocks:
        if block.type == "markdown":
            cells.append(
                {
                    "cell_type": "markdown",
                    "id": _sanitizeId(block.id),
                    "metadata": {},
                    "source": block.content,
                }
            )
            continue

        cells.append(
            {
                "cell_type": "code",
                "id": _sanitizeId(block.id),
                "metadata": {},
                "source": block.content,
                "execution_count": None,
                "outputs": [],
            }
        )

    payload = {
        "nbformat": 4,
        "nbformat_minor": 5,
        "metadata": {
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
            "language_info": {"name": "python", "version": "3.12"},
        },
        "cells": cells,
    }
    return json.dumps(payload, ensure_ascii=False, indent=1)


def _normalizeSource(source: str | list[str]) -> str:
    if isinstance(source, list):
        return "".join(source)
    return source


def _sanitizeId(value: str) -> str:
    return value.replace("_", "-")


def _blockId() -> str:
    return f"block-{uuid.uuid4().hex[:8]}"
