from __future__ import annotations

from collections.abc import Mapping
import json
from typing import Any

from pydantic import ValidationError

from .models import AppConfig, BlockConfig, CodaroDocument, DocumentMetadata, RuntimeConfig


FORMAT_METADATA_SCHEMA_VERSION = 1

_DOCUMENT_FIELDS = {"schemaVersion", "id", "title", "metadata", "runtime"}
_DOCUMENT_METADATA_FIELDS = {"createdAt", "updatedAt", "sourceFormat", "tags"}
_RUNTIME_FIELDS = {"defaultEngine", "reactiveMode", "packages"}
_APP_FIELDS = {"schemaVersion", "title", "layout", "hideCode", "entryBlockIds", "statePolicy"}
_BLOCK_FIELDS = {
    "schemaVersion",
    "id",
    "type",
    "role",
    "executionKind",
    "displayKind",
    "sourceType",
    "payload",
    "title",
    "description",
    "collapsed",
    "guide",
}


class FormatMetadataError(ValueError):
    pass


def documentMetadataPayload(document: CodaroDocument, sourceFormat: str) -> dict[str, object]:
    metadata = document.metadata.model_copy(update={"sourceFormat": sourceFormat})
    return {
        "schemaVersion": FORMAT_METADATA_SCHEMA_VERSION,
        "id": document.id,
        "title": document.title,
        "metadata": metadata.model_dump(mode="json"),
        "runtime": document.runtime.model_dump(mode="json"),
    }


def appMetadataPayload(app: AppConfig) -> dict[str, object]:
    return app.model_dump(mode="json")


def blockMetadataPayload(block: BlockConfig, *, includeContent: bool = False) -> dict[str, object]:
    payload = {
        "schemaVersion": FORMAT_METADATA_SCHEMA_VERSION,
        **block.model_dump(mode="json", exclude={"content", "execution"}),
    }
    if includeContent:
        payload["content"] = block.content
    return payload


def parseDocumentMetadata(
    value: object,
    *,
    sourceFormat: str,
) -> tuple[str, str, DocumentMetadata, RuntimeConfig]:
    payload = _closedObject(value, _DOCUMENT_FIELDS, "document metadata")
    _requireVersion(payload, "document metadata")
    documentId = payload["id"]
    title = payload["title"]
    if not isinstance(documentId, str) or not documentId:
        raise FormatMetadataError("document metadata id must be a non-empty string")
    if not isinstance(title, str):
        raise FormatMetadataError("document metadata title must be a string")

    metadataPayload = _closedObject(payload["metadata"], _DOCUMENT_METADATA_FIELDS, "document properties")
    runtimePayload = _closedObject(payload["runtime"], _RUNTIME_FIELDS, "runtime metadata")
    try:
        metadata = DocumentMetadata.model_validate(metadataPayload)
        runtime = RuntimeConfig.model_validate(runtimePayload)
    except ValidationError as exc:
        raise FormatMetadataError(f"document metadata is invalid: {exc}") from exc
    if metadata.sourceFormat != sourceFormat:
        raise FormatMetadataError(
            f"document metadata sourceFormat must be {sourceFormat!r}, got {metadata.sourceFormat!r}"
        )
    return documentId, title, metadata, runtime


def parseAppMetadataPayload(value: object) -> AppConfig:
    payload = _closedObject(value, _APP_FIELDS, "app metadata")
    _requireVersion(payload, "app metadata")
    try:
        return AppConfig.model_validate(payload)
    except ValidationError as exc:
        raise FormatMetadataError(f"app metadata is invalid: {exc}") from exc


def parseBlockMetadata(
    value: object,
    *,
    content: str | None = None,
    contentIncluded: bool = False,
) -> BlockConfig:
    expectedFields = _BLOCK_FIELDS | ({"content"} if contentIncluded else set())
    payload = _closedObject(value, expectedFields, "block metadata")
    _requireVersion(payload, "block metadata")
    if contentIncluded:
        resolvedContent = payload.pop("content")
        if not isinstance(resolvedContent, str):
            raise FormatMetadataError("block metadata content must be a string")
    else:
        if content is None:
            raise FormatMetadataError("block metadata requires native cell content")
        resolvedContent = content
    payload.pop("schemaVersion")
    try:
        return BlockConfig.model_validate({**payload, "content": resolvedContent})
    except ValidationError as exc:
        raise FormatMetadataError(f"block metadata is invalid: {exc}") from exc


def persistentDocumentPayload(document: CodaroDocument, sourceFormat: str) -> dict[str, object]:
    return {
        "schemaVersion": FORMAT_METADATA_SCHEMA_VERSION,
        "document": documentMetadataPayload(document, sourceFormat),
        "app": appMetadataPayload(document.app),
        "blocks": [blockMetadataPayload(block, includeContent=True) for block in document.blocks],
    }


def parsePersistentDocumentPayload(value: object, *, sourceFormat: str) -> CodaroDocument:
    payload = _closedObject(value, {"schemaVersion", "document", "app", "blocks"}, "document envelope")
    _requireVersion(payload, "document envelope")
    documentId, title, metadata, runtime = parseDocumentMetadata(
        payload["document"],
        sourceFormat=sourceFormat,
    )
    app = parseAppMetadataPayload(payload["app"])
    rawBlocks = payload["blocks"]
    if not isinstance(rawBlocks, list):
        raise FormatMetadataError("document envelope blocks must be a list")
    blocks = [parseBlockMetadata(item, contentIncluded=True) for item in rawBlocks]
    blockIds = [block.id for block in blocks]
    if len(blockIds) != len(set(blockIds)):
        raise FormatMetadataError("document envelope block ids must be unique")
    try:
        return CodaroDocument(
            id=documentId,
            title=title,
            blocks=blocks,
            metadata=metadata,
            runtime=runtime,
            app=app,
        )
    except ValidationError as exc:
        raise FormatMetadataError(f"document envelope is invalid: {exc}") from exc


def canonicalJson(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def _closedObject(value: object, expectedFields: set[str], label: str) -> dict[str, Any]:
    if not isinstance(value, Mapping):
        raise FormatMetadataError(f"{label} must be an object")
    payload = dict(value)
    if set(payload) != expectedFields:
        raise FormatMetadataError(f"{label} fields are invalid")
    return payload


def _requireVersion(payload: Mapping[str, object], label: str) -> None:
    version = payload.get("schemaVersion")
    if version != FORMAT_METADATA_SCHEMA_VERSION:
        raise FormatMetadataError(f"{label} schemaVersion is not supported: {version!r}")
