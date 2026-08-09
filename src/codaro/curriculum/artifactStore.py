from __future__ import annotations

import json
import os
from pathlib import Path
import re
import tempfile
from typing import Any

from .learningArchive import digestBytes


HASH_PATTERN = re.compile(r"^sha256-[A-Za-z0-9_-]{43}$")
MAX_PROMOTED_ARTIFACT_BYTES = 32 * 1024 * 1024


class ArtifactStoreError(ValueError):
    pass


class ArtifactBlobStore:
    def __init__(self, root: Path) -> None:
        self._root = root.resolve()

    def promote(self, fixtureRoot: Path, descriptors: list[dict[str, object]]) -> list[str]:
        promoted: list[str] = []
        for descriptor in descriptors:
            if descriptor.get("origin") != "created" or descriptor.get("kind") == "directory":
                continue
            relativePath = str(descriptor.get("path") or "")
            contentHash = str(descriptor.get("contentHash") or "")
            source = (fixtureRoot / relativePath).resolve()
            if (
                not HASH_PATTERN.fullmatch(contentHash)
                or not source.is_relative_to(fixtureRoot.resolve())
                or not source.is_file()
            ):
                raise ArtifactStoreError("승격할 산출물 경로나 해시가 유효하지 않습니다.")
            payload = source.read_bytes()
            if len(payload) > MAX_PROMOTED_ARTIFACT_BYTES or digestBytes(payload) != contentHash:
                raise ArtifactStoreError("승격할 산출물의 크기 또는 content hash가 일치하지 않습니다.")
            objectPath = self._objectPath(contentHash)
            metadataPath = self._metadataPath(contentHash)
            self._writeOnce(objectPath, payload)
            metadata = {
                "byteLength": len(payload),
                "contentHash": contentHash,
                "mediaType": _mediaType(relativePath),
                "originalPath": relativePath,
                "schemaVersion": 1,
            }
            self._writeOnce(
                metadataPath,
                json.dumps(metadata, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8"),
            )
            promoted.append(contentHash)
        return sorted(set(promoted))

    def read(self, contentHash: str) -> tuple[bytes, dict[str, Any]]:
        if not HASH_PATTERN.fullmatch(contentHash):
            raise ArtifactStoreError("산출물 content hash가 유효하지 않습니다.")
        objectPath = self._objectPath(contentHash)
        metadataPath = self._metadataPath(contentHash)
        try:
            payload = objectPath.read_bytes()
            metadata = json.loads(metadataPath.read_text(encoding="utf-8"))
        except (OSError, ValueError, TypeError) as error:
            raise ArtifactStoreError("보존된 산출물을 찾을 수 없습니다.") from error
        if digestBytes(payload) != contentHash or metadata.get("contentHash") != contentHash:
            raise ArtifactStoreError("보존된 산출물 무결성이 손상되었습니다.")
        return payload, metadata

    def _objectPath(self, contentHash: str) -> Path:
        return self._root / "objects" / contentHash.removeprefix("sha256-")

    def _metadataPath(self, contentHash: str) -> Path:
        return self._root / "metadata" / f"{contentHash.removeprefix('sha256-')}.json"

    @staticmethod
    def _writeOnce(target: Path, payload: bytes) -> None:
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            if target.read_bytes() != payload:
                raise ArtifactStoreError("content hash 보존소에서 충돌이 발생했습니다.")
            return
        fileDescriptor, temporaryName = tempfile.mkstemp(prefix="artifact-", dir=target.parent)
        temporaryPath = Path(temporaryName)
        try:
            with os.fdopen(fileDescriptor, "wb") as stream:
                stream.write(payload)
                stream.flush()
                os.fsync(stream.fileno())
            os.replace(temporaryPath, target)
        finally:
            if temporaryPath.exists():
                temporaryPath.unlink()


def _mediaType(path: str) -> str:
    suffix = Path(path).suffix.lower()
    return {
        ".csv": "text/csv; charset=utf-8",
        ".gif": "image/gif",
        ".jpeg": "image/jpeg",
        ".jpg": "image/jpeg",
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".txt": "text/plain; charset=utf-8",
    }.get(suffix, "application/octet-stream")
