from __future__ import annotations

import hashlib
import json
from pathlib import Path
import re
import uuid

from pydantic import ValidationError

from .formatMetadata import (
    FORMAT_METADATA_SCHEMA_VERSION,
    FormatMetadataError,
    appMetadataPayload,
    blockMetadataPayload,
    documentMetadataPayload,
    parseAppMetadataPayload,
    parseBlockMetadata,
    parseDocumentMetadata,
)
from .models import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig


_NAMESPACE = "codaro"
_NOTEBOOK_METADATA_FIELDS = {"schemaVersion", "document", "app"}
_CELL_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


class JupyterFormatError(ValueError):
    pass


def parseJupyterDocument(source: str, sourcePath: Path | None = None) -> CodaroDocument:
    try:
        payload = json.loads(source)
    except json.JSONDecodeError as exc:
        raise JupyterFormatError(f"jupyter document is invalid JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise JupyterFormatError("jupyter document must be an object")
    rawCells = payload.get("cells", [])
    if not isinstance(rawCells, list):
        raise JupyterFormatError("jupyter cells must be a list")
    notebookMetadata = payload.get("metadata", {})
    if not isinstance(notebookMetadata, dict):
        raise JupyterFormatError("jupyter notebook metadata must be an object")
    codaroMetadata = notebookMetadata.get(_NAMESPACE)
    canonical = codaroMetadata is not None

    if canonical:
        try:
            envelope = _closedObject(codaroMetadata, _NOTEBOOK_METADATA_FIELDS, "jupyter codaro metadata")
            _requireVersion(envelope, "jupyter codaro metadata")
            documentId, title, documentProperties, runtime = parseDocumentMetadata(
                envelope["document"],
                sourceFormat="ipynb",
            )
            app = parseAppMetadataPayload(envelope["app"])
        except FormatMetadataError as exc:
            raise JupyterFormatError(str(exc)) from exc
    else:
        title = sourcePath.stem if sourcePath else "Imported"
        documentId = f"doc-{uuid.uuid4().hex[:10]}"
        documentProperties = DocumentMetadata(sourceFormat="ipynb")
        runtime = RuntimeConfig()
        app = None

    blocks: list[BlockConfig] = []
    seenBlockIds: set[str] = set()
    for index, rawCell in enumerate(rawCells):
        if not isinstance(rawCell, dict):
            raise JupyterFormatError("jupyter cell must be an object")
        cellType = rawCell.get("cell_type")
        content = _normalizeSource(rawCell.get("source", ""))
        rawCellMetadata = rawCell.get("metadata", {})
        if not isinstance(rawCellMetadata, dict):
            raise JupyterFormatError("jupyter cell metadata must be an object")
        codaroCellMetadata = rawCellMetadata.get(_NAMESPACE)

        if canonical:
            if codaroCellMetadata is None:
                raise JupyterFormatError("canonical jupyter cell is missing codaro metadata")
            try:
                block = parseBlockMetadata(codaroCellMetadata, content=content)
            except FormatMetadataError as exc:
                raise JupyterFormatError(str(exc)) from exc
            if block.type == "markdown" and cellType != "markdown":
                raise JupyterFormatError("markdown block must use a jupyter markdown cell")
            if block.type != "markdown" and cellType != "code":
                raise JupyterFormatError("executable block must use a jupyter code cell")
        else:
            if codaroCellMetadata is not None:
                raise JupyterFormatError("legacy jupyter notebook cannot contain partial codaro cell metadata")
            blockId = _legacyBlockId(rawCell.get("id"), index)
            if cellType == "markdown":
                block = BlockConfig(id=blockId, type="markdown", content=content)
            elif cellType == "code":
                block = BlockConfig(id=blockId, type="code", content=_stripJupyterMagics(content))
            else:
                continue
        if block.id in seenBlockIds:
            raise JupyterFormatError(f"jupyter block id is duplicated: {block.id}")
        seenBlockIds.add(block.id)
        blocks.append(block)

    if not blocks and not canonical:
        blocks.append(BlockConfig(id=_blockId(), type="code", content=""))

    if app is None:
        app = AppConfig(title=title, entryBlockIds=[block.id for block in blocks if block.type == "code"])
    try:
        return CodaroDocument(
            id=documentId,
            title=title,
            blocks=blocks,
            metadata=documentProperties,
            runtime=runtime,
            app=app,
        )
    except ValidationError as exc:
        raise JupyterFormatError(f"jupyter codaro metadata is invalid: {exc}") from exc


def writeJupyterDocument(document: CodaroDocument) -> str:
    cells: list[dict[str, object]] = []
    usedCellIds: set[str] = set()
    for index, block in enumerate(document.blocks):
        cellId = _jupyterCellId(block.id, index, usedCellIds)
        usedCellIds.add(cellId)
        metadata = {_NAMESPACE: blockMetadataPayload(block)}
        if block.type == "markdown":
            cells.append(
                {
                    "cell_type": "markdown",
                    "id": cellId,
                    "metadata": metadata,
                    "source": block.content,
                }
            )
            continue

        cells.append(
            {
                "cell_type": "code",
                "id": cellId,
                "metadata": metadata,
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
            _NAMESPACE: {
                "schemaVersion": FORMAT_METADATA_SCHEMA_VERSION,
                "document": documentMetadataPayload(document, "ipynb"),
                "app": appMetadataPayload(document.app),
            },
        },
        "cells": cells,
    }
    return json.dumps(payload, ensure_ascii=False, indent=1)


def _normalizeSource(source: object) -> str:
    if isinstance(source, list) and all(isinstance(item, str) for item in source):
        return "".join(source)
    if isinstance(source, str):
        return source
    raise JupyterFormatError("jupyter cell source must be a string or string list")


def _stripJupyterMagics(content: str) -> str:
    """Jupyter magic/shell 줄을 주석 처리한다. legacy notebook을 Python에서 실행 가능하게 옮긴다."""
    lines = content.split("\n")
    firstNonEmpty = next((line for line in lines if line.strip()), "")
    if firstNonEmpty.lstrip().startswith("%%"):
        return "\n".join(f"# {line}" if line.strip() else line for line in lines)
    out: list[str] = []
    for line in lines:
        stripped = line.lstrip()
        if stripped.startswith("%") or stripped.startswith("!"):
            out.append(f"# {line}")
        else:
            out.append(line)
    return "\n".join(out)


def _jupyterCellId(value: str, index: int, used: set[str]) -> str:
    if _CELL_ID_PATTERN.fullmatch(value) and value not in used:
        return value
    digest = hashlib.sha256(f"{index}:{value}".encode("utf-8")).hexdigest()[:32]
    return f"codaro-{digest}"


def _legacyBlockId(value: object, index: int) -> str:
    if isinstance(value, str) and value:
        return value
    return f"block-{index + 1}-{uuid.uuid4().hex[:8]}"


def _closedObject(value: object, fields: set[str], label: str) -> dict[str, object]:
    if not isinstance(value, dict) or set(value) != fields:
        raise FormatMetadataError(f"{label} fields are invalid")
    return dict(value)


def _requireVersion(payload: dict[str, object], label: str) -> None:
    version = payload.get("schemaVersion")
    if version != FORMAT_METADATA_SCHEMA_VERSION:
        raise FormatMetadataError(f"{label} schemaVersion is not supported: {version!r}")


def _blockId() -> str:
    return f"block-{uuid.uuid4().hex[:8]}"
