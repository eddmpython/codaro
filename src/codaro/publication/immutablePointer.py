from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import re
from typing import Any, Callable, TypeVar
import uuid

from .errors import PublicationBuildError


_CONTENT_HASH = re.compile(r"^sha256-[0-9a-f]{64}$")
T = TypeVar("T")


def activateImmutablePointer(outputRoot: str | Path, payload: dict[str, Any]) -> Path:
    output = Path(outputRoot).expanduser().resolve()
    _validatePayload(payload)
    output.mkdir(parents=True, exist_ok=True)
    pointer = output / "active.json"
    temporary = output / f".active.{uuid.uuid4().hex}.tmp"
    temporary.write_bytes(_canonicalBytes(payload))
    os.replace(temporary, pointer)
    return pointer


def rollbackImmutablePointer(
    outputRoot: str | Path,
    *,
    target: str,
    contentHash: str,
    collection: str,
    candidate: Callable[[Path, str], tuple[dict[str, Any], T]],
) -> T:
    output = Path(outputRoot).expanduser().resolve()
    if not _CONTENT_HASH.fullmatch(contentHash):
        raise PublicationBuildError("rollback content hash가 올바르지 않습니다.")
    collectionRoot = (output / collection).resolve()
    bundleRoot = (collectionRoot / contentHash.removeprefix("sha256-")).resolve()
    if bundleRoot.parent != collectionRoot:
        raise PublicationBuildError("rollback bundle 경계가 올바르지 않습니다.")
    payload, verified = candidate(bundleRoot, contentHash)
    if payload.get("target") != target:
        raise PublicationBuildError("rollback pointer target이 일치하지 않습니다.")
    activateImmutablePointer(output, payload)
    return verified


def pointerFileHash(path: Path) -> str:
    if not path.is_file():
        raise PublicationBuildError(f"publication 파일이 없습니다: {path}")
    return "sha256-" + hashlib.sha256(path.read_bytes()).hexdigest()


def _validatePayload(payload: dict[str, Any]) -> None:
    if payload.get("schemaVersion") != 1 or not isinstance(payload.get("target"), str):
        raise PublicationBuildError("immutable active pointer 계약이 잘못됐습니다.")
    identity = payload.get("bundleHash", payload.get("embedHash"))
    if not isinstance(identity, str) or not _CONTENT_HASH.fullmatch(identity):
        raise PublicationBuildError("immutable active pointer hash가 잘못됐습니다.")


def _canonicalBytes(payload: Any) -> bytes:
    return json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
