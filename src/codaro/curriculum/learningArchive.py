from __future__ import annotations

import base64
import binascii
from collections.abc import Callable, Iterable, Mapping, Sequence
from dataclasses import dataclass
from datetime import UTC, datetime
import json
import os
from pathlib import Path
import re
import shutil
import tempfile
from typing import Any, TypeVar

from .evidenceArchive import (
    EvidenceArchiveError,
    digestBytes,
    stableJson,
    validateLearningEvidenceArchive,
)


ARCHIVE_KIND = "codaro.learning-archive"
ARCHIVE_SCHEMA_VERSION = 2
IMPORT_MODE = "atomic-head-swap"
DOCUMENT_BLOCK_TYPES = {"automation", "code", "markdown"}
DOCUMENT_MEDIA_TYPE = "application/vnd.codaro.document+json"
DRAFT_MEDIA_TYPE = "text/plain; charset=utf-8"
EVIDENCE_MEDIA_TYPE = "application/vnd.codaro.learning-evidence+json"
BLOB_MEDIA_TYPE = "application/octet-stream"
MAX_BLOB_BYTES = 128 * 1024 * 1024
MAX_TOTAL_BYTES = 512 * 1024 * 1024
MAX_DRAFTS = 10_000
MAX_VFS_ENTRIES = 10_000
MAX_PACKAGES = 256
MAX_AUTOMATION_DRAFTS = 256
HASH_PATTERN = re.compile(r"^sha256-[A-Za-z0-9_-]{43}$")
AUTOMATION_DRAFT_ID_PATTERN = re.compile(r"^automation-draft:[A-Za-z0-9_-]{43}$")
LINEAGE_ID_PATTERN = re.compile(r"^lineage:[A-Za-z0-9_-]{43}$")
PACKAGE_NAME_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]*$")
PACKAGE_VERSION_PATTERN = re.compile(r"^\d+(?:\.\d+){1,3}(?:[-+][A-Za-z0-9.-]+)?$")
WINDOWS_RESERVED_NAMES = {
    "CON",
    "PRN",
    "AUX",
    "NUL",
    *(f"COM{index}" for index in range(1, 10)),
    *(f"LPT{index}" for index in range(1, 10)),
}


class LearningArchiveError(ValueError):
    pass


@dataclass(frozen=True)
class LearningArchiveVirtualFile:
    path: str
    payload: bytes
    mediaType: str = BLOB_MEDIA_TYPE
    executable: bool = False


@dataclass(frozen=True)
class LearningArchivePackage:
    name: str
    version: str
    path: str
    payload: bytes


@dataclass(frozen=True)
class LearningArchiveAutomationDraftInput:
    name: str
    recipe: str | bytes
    sourceBlockIds: tuple[str, ...]
    description: str = ""


@dataclass(frozen=True)
class LearningArchiveImportPlan:
    archiveId: str
    rootHash: str
    canonicalArchiveBytes: bytes
    blobs: tuple[tuple[str, bytes], ...]


@dataclass(frozen=True)
class LearningArchiveAutomationDraft:
    draftId: str
    lineageId: str
    name: str
    description: str
    recipe: bytes
    sourceBlockIds: tuple[str, ...]


@dataclass(frozen=True)
class LearningArchiveMaterialization:
    archive: dict[str, Any]
    document: dict[str, Any]
    drafts: dict[str, str]
    evidenceArchive: dict[str, Any]
    virtualDirectories: tuple[str, ...]
    virtualFiles: tuple[LearningArchiveVirtualFile, ...]
    packages: tuple[LearningArchivePackage, ...]
    automationDrafts: tuple[LearningArchiveAutomationDraft, ...]


T = TypeVar("T")


def buildLearningArchive(
    *,
    document: Mapping[str, Any],
    drafts: Mapping[str, str | bytes],
    evidenceArchive: object,
    lessonRef: str,
    virtualFiles: Sequence[LearningArchiveVirtualFile] = (),
    virtualDirectories: Iterable[str] = (),
    packages: Sequence[LearningArchivePackage] = (),
    automationDrafts: Sequence[LearningArchiveAutomationDraftInput] = (),
    createdAt: str | None = None,
) -> dict[str, Any]:
    if not isinstance(document, Mapping):
        raise LearningArchiveError("학습 archive document가 객체가 아닙니다.")
    documentId = document.get("id")
    if not isinstance(documentId, str) or not documentId or len(documentId) > 255:
        raise LearningArchiveError("학습 archive documentId가 유효하지 않습니다.")
    normalizedLessonRef = _normalizeLessonRef(lessonRef)
    blobs: dict[str, dict[str, object]] = {}

    try:
        documentBytes = stableJson(dict(document)).encode("utf-8")
    except (TypeError, ValueError) as error:
        raise LearningArchiveError("학습 archive document를 직렬화할 수 없습니다.") from error
    documentBlobHash = _addBlob(blobs, documentBytes)
    documentRef = {
        "blobHash": documentBlobHash,
        "documentId": documentId,
        "mediaType": DOCUMENT_MEDIA_TYPE,
        "path": "document/document.json",
    }

    if not drafts or len(drafts) > MAX_DRAFTS:
        raise LearningArchiveError("학습 archive draft 목록이 유효하지 않습니다.")
    draftRefs: list[dict[str, object]] = []
    draftBlockIds: set[str] = set()
    for blockId, draft in drafts.items():
        normalizedBlockId = _boundedString(blockId, "draft blockId", maximum=255)
        if normalizedBlockId in draftBlockIds:
            raise LearningArchiveError("학습 archive draft blockId가 중복되었습니다.")
        draftBlockIds.add(normalizedBlockId)
        draftBytes = _textOrBytes(draft, "draft")
        draftRefs.append({
            "blobHash": _addBlob(blobs, draftBytes),
            "blockId": normalizedBlockId,
            "mediaType": DRAFT_MEDIA_TYPE,
        })
    draftRefs.sort(key=lambda item: str(item["blockId"]))

    directories = sorted({_normalizeSafePath(path) for path in virtualDirectories})
    if len(directories) > MAX_VFS_ENTRIES:
        raise LearningArchiveError("학습 archive virtual FS 항목 수가 한도를 초과했습니다.")
    directorySet = set(directories)
    for directory in directories:
        _requireParentDirectories(directory, directorySet)
    virtualFs: list[dict[str, object]] = [
        {"kind": "directory", "path": path}
        for path in directories
    ]
    virtualPaths = set(directories)
    for item in virtualFiles:
        if not isinstance(item, LearningArchiveVirtualFile):
            raise LearningArchiveError("학습 archive virtual file 입력이 유효하지 않습니다.")
        path = _normalizeSafePath(item.path)
        if path in virtualPaths:
            raise LearningArchiveError(f"학습 archive virtual FS 경로가 중복되었습니다: {path}")
        _requireParentDirectories(path, directorySet)
        if not isinstance(item.payload, bytes):
            raise LearningArchiveError("학습 archive virtual file payload는 bytes여야 합니다.")
        mediaType = _boundedString(item.mediaType, "virtual file mediaType", maximum=255)
        if not isinstance(item.executable, bool):
            raise LearningArchiveError("학습 archive virtual file executable이 유효하지 않습니다.")
        virtualPaths.add(path)
        virtualFs.append({
            "blobHash": _addBlob(blobs, item.payload),
            "executable": item.executable,
            "kind": "file",
            "mediaType": mediaType,
            "path": path,
        })
    if len(virtualFs) > MAX_VFS_ENTRIES:
        raise LearningArchiveError("학습 archive virtual FS 항목 수가 한도를 초과했습니다.")
    virtualFs.sort(key=lambda item: (str(item["path"]), str(item["kind"])))

    if len(packages) > MAX_PACKAGES:
        raise LearningArchiveError("학습 archive package 수가 한도를 초과했습니다.")
    packageRefs: list[dict[str, object]] = []
    packageKeys: set[tuple[str, str, str]] = set()
    for package in packages:
        if not isinstance(package, LearningArchivePackage):
            raise LearningArchiveError("학습 archive package 입력이 유효하지 않습니다.")
        name = _packageName(package.name)
        version = _packageVersion(package.version)
        path = _normalizeSafePath(package.path)
        if not path.lower().endswith(".whl"):
            raise LearningArchiveError("학습 archive package는 wheel 파일이어야 합니다.")
        key = (name, version, path)
        if key in packageKeys:
            raise LearningArchiveError("학습 archive package가 중복되었습니다.")
        if not isinstance(package.payload, bytes) or not package.payload.startswith(b"PK\x03\x04"):
            raise LearningArchiveError("학습 archive package bytes가 wheel ZIP 형식이 아닙니다.")
        packageKeys.add(key)
        blobHash = _addBlob(blobs, package.payload)
        packageRefs.append({
            "blobHash": blobHash,
            "integrity": blobHash,
            "mediaType": "application/zip",
            "name": name,
            "path": path,
            "version": version,
        })
    packageRefs.sort(key=lambda item: (str(item["name"]), str(item["version"]), str(item["path"])))

    try:
        normalizedEvidence = validateLearningEvidenceArchive(evidenceArchive)
    except EvidenceArchiveError as error:
        raise LearningArchiveError(f"학습 archive evidence가 유효하지 않습니다: {error}") from error
    evidenceEvents = normalizedEvidence["events"]
    evidenceBytes = stableJson(normalizedEvidence).encode("utf-8")
    evidenceEventIds = sorted(str(event["eventId"]) for event in evidenceEvents)
    evidenceRef = {
        "blobHash": _addBlob(blobs, evidenceBytes),
        "eventCount": len(evidenceEvents),
        "eventIds": evidenceEventIds,
        "eventSetHash": normalizedEvidence["manifest"]["eventSetHash"],
        "mediaType": EVIDENCE_MEDIA_TYPE,
        "path": "evidence/archive.json",
    }

    if len(automationDrafts) > MAX_AUTOMATION_DRAFTS:
        raise LearningArchiveError("학습 archive automation draft 수가 한도를 초과했습니다.")
    draftParts: list[dict[str, object]] = []
    draftIds: set[str] = set()
    for draft in automationDrafts:
        if not isinstance(draft, LearningArchiveAutomationDraftInput):
            raise LearningArchiveError("학습 archive automation draft 입력이 유효하지 않습니다.")
        name = _boundedString(draft.name.strip(), "automation draft name", maximum=255)
        description = _boundedString(draft.description, "automation draft description", maximum=4096, allowEmpty=True)
        recipeBytes = _textOrBytes(draft.recipe, "automation recipe")
        if not recipeBytes.strip():
            raise LearningArchiveError("학습 archive automation recipe가 비어 있습니다.")
        sourceBlockIds = _normalizeStringSet(
            draft.sourceBlockIds,
            "automation sourceBlockIds",
            maximum=MAX_DRAFTS,
            itemMaximum=255,
        )
        if not sourceBlockIds or any(blockId not in draftBlockIds for blockId in sourceBlockIds):
            raise LearningArchiveError("automation draft sourceBlockIds가 document draft와 일치하지 않습니다.")
        recipeBlobHash = _addBlob(blobs, recipeBytes)
        draftId = _automationDraftId(
            documentBlobHash=documentBlobHash,
            lessonRef=normalizedLessonRef,
            name=name,
            recipeBlobHash=recipeBlobHash,
            sourceBlockIds=sourceBlockIds,
        )
        if draftId in draftIds:
            raise LearningArchiveError("학습 archive automation draft가 중복되었습니다.")
        draftIds.add(draftId)
        draftParts.append({
            "description": description,
            "draftId": draftId,
            "name": name,
            "recipeBlobHash": recipeBlobHash,
            "sourceBlockIds": sourceBlockIds,
        })
    draftParts.sort(key=lambda item: str(item["draftId"]))

    lineageCore = {
        "automationDraftIds": [str(item["draftId"]) for item in draftParts],
        "documentBlobHash": documentBlobHash,
        "evidenceEventIds": evidenceEventIds,
        "lessonRef": normalizedLessonRef,
    }
    lineageId = _lineageId(lineageCore)
    lineage = [{"lineageId": lineageId, **lineageCore}]
    normalizedAutomationDrafts = [
        buildAutomationDraftFromDocument(
            documentBlobHash=documentBlobHash,
            lessonRef=normalizedLessonRef,
            lineageId=lineageId,
            name=str(item["name"]),
            description=str(item["description"]),
            recipeBlobHash=str(item["recipeBlobHash"]),
            sourceBlockIds=tuple(str(value) for value in item["sourceBlockIds"]),
        )
        for item in draftParts
    ]

    body = {
        "automationDrafts": normalizedAutomationDrafts,
        "blobs": dict(sorted(blobs.items())),
        "document": documentRef,
        "drafts": draftRefs,
        "evidence": evidenceRef,
        "lineage": lineage,
        "packages": packageRefs,
        "virtualFs": virtualFs,
    }
    rootHash = digestBytes(stableJson(body).encode("utf-8"))
    archive = {
        "schemaVersion": ARCHIVE_SCHEMA_VERSION,
        "kind": ARCHIVE_KIND,
        "manifest": {
            "archiveId": f"learning-archive:{rootHash.removeprefix('sha256-')}",
            "automationDraftCount": len(normalizedAutomationDrafts),
            "blobCount": len(blobs),
            "createdAt": createdAt or datetime.now(tz=UTC).isoformat(),
            "draftCount": len(draftRefs),
            "evidenceEventCount": len(evidenceEvents),
            "importMode": IMPORT_MODE,
            "packageCount": len(packageRefs),
            "rootHash": rootHash,
            "runtimeTier": normalizedEvidence["manifest"]["runtimeTier"],
            "totalByteLength": sum(int(blob["byteLength"]) for blob in blobs.values()),
            "virtualFsEntryCount": len(virtualFs),
        },
        **body,
    }
    return validateLearningArchive(archive)


def buildAutomationDraftFromDocument(
    *,
    documentBlobHash: str,
    lessonRef: str,
    lineageId: str,
    name: str,
    description: str,
    recipeBlobHash: str,
    sourceBlockIds: Sequence[str],
) -> dict[str, object]:
    _requireHash(documentBlobHash, "automation documentBlobHash")
    normalizedLessonRef = _normalizeLessonRef(lessonRef)
    if not LINEAGE_ID_PATTERN.fullmatch(lineageId):
        raise LearningArchiveError("automation draft lineageId가 유효하지 않습니다.")
    normalizedName = _boundedString(name.strip(), "automation draft name", maximum=255)
    normalizedDescription = _boundedString(
        description,
        "automation draft description",
        maximum=4096,
        allowEmpty=True,
    )
    _requireHash(recipeBlobHash, "automation recipeBlobHash")
    normalizedBlockIds = _normalizeStringSet(
        sourceBlockIds,
        "automation sourceBlockIds",
        maximum=MAX_DRAFTS,
        itemMaximum=255,
    )
    if not normalizedBlockIds:
        raise LearningArchiveError("automation draft sourceBlockIds가 비어 있습니다.")
    draftId = _automationDraftId(
        documentBlobHash=documentBlobHash,
        lessonRef=normalizedLessonRef,
        name=normalizedName,
        recipeBlobHash=recipeBlobHash,
        sourceBlockIds=normalizedBlockIds,
    )
    return {
        "confirmation": "required",
        "description": normalizedDescription,
        "draftId": draftId,
        "lineageId": lineageId,
        "name": normalizedName,
        "recipeBlobHash": recipeBlobHash,
        "sideEffectPolicy": "blocked-until-explicit-confirmation",
        "sourceBlockIds": normalizedBlockIds,
        "state": "draft",
        "taskDefaults": {"enabled": False, "schedule": None},
    }


def confirmAutomationDraft(
    archive: object,
    draftId: str,
    confirmation: object,
) -> dict[str, object]:
    normalized = validateLearningArchive(archive)
    draft = next(
        (item for item in normalized["automationDrafts"] if item["draftId"] == draftId),
        None,
    )
    if draft is None:
        raise LearningArchiveError("확인할 automation draft를 찾을 수 없습니다.")
    value = _closedObject(
        confirmation,
        {"confirmationId", "confirmedAt", "draftId", "recipeBlobHash"},
        "automation confirmation",
    )
    confirmationId = _boundedString(value["confirmationId"], "confirmationId", maximum=255)
    confirmedAt = _timestamp(value["confirmedAt"], "confirmedAt")
    if value["draftId"] != draft["draftId"] or value["recipeBlobHash"] != draft["recipeBlobHash"]:
        raise LearningArchiveError("automation confirmation이 draft identity와 일치하지 않습니다.")
    return {
        "confirmationId": confirmationId,
        "confirmedAt": confirmedAt,
        "description": draft["description"],
        "enabled": False,
        "kind": "codaro.automation-task-registration",
        "lineageId": draft["lineageId"],
        "name": draft["name"],
        "recipeBlobHash": draft["recipeBlobHash"],
        "schedule": None,
        "schemaVersion": 1,
        "sourceDraftId": draft["draftId"],
    }


def validateLearningArchive(value: object) -> dict[str, Any]:
    archive = _closedObject(
        value,
        {
            "automationDrafts",
            "blobs",
            "document",
            "drafts",
            "evidence",
            "kind",
            "lineage",
            "manifest",
            "packages",
            "schemaVersion",
            "virtualFs",
        },
        "learning archive",
    )
    if archive["kind"] != ARCHIVE_KIND or archive["schemaVersion"] != ARCHIVE_SCHEMA_VERSION:
        raise LearningArchiveError("지원하지 않는 학습 archive입니다.")
    blobs, decodedBlobs = _normalizeBlobs(archive["blobs"])
    document, documentBlockIds = _normalizeDocumentRef(archive["document"], decodedBlobs)
    drafts = _normalizeDraftRefs(archive["drafts"], decodedBlobs)
    if any(str(item["blockId"]) not in documentBlockIds for item in drafts):
        raise LearningArchiveError("학습 archive draft가 document block과 연결되지 않습니다.")
    virtualFs = _normalizeVirtualFs(archive["virtualFs"], decodedBlobs)
    packages = _normalizePackages(archive["packages"], decodedBlobs)
    evidence, evidenceArchive = _normalizeEvidenceRef(archive["evidence"], decodedBlobs)
    lineage = _normalizeLineage(archive["lineage"], document, evidence)
    automationDrafts = _normalizeAutomationDrafts(
        archive["automationDrafts"],
        decodedBlobs,
        drafts,
        lineage,
    )
    _validateLineageDraftLinks(lineage, automationDrafts)
    referencedHashes = {
        document["blobHash"],
        evidence["blobHash"],
        *(item["blobHash"] for item in drafts),
        *(item["blobHash"] for item in virtualFs if item["kind"] == "file"),
        *(item["blobHash"] for item in packages),
        *(item["recipeBlobHash"] for item in automationDrafts),
    }
    if referencedHashes != set(blobs):
        missing = sorted(referencedHashes - set(blobs))
        unused = sorted(set(blobs) - referencedHashes)
        raise LearningArchiveError(f"학습 archive blob 참조가 닫혀 있지 않습니다: missing={missing}, unused={unused}")
    body = {
        "automationDrafts": automationDrafts,
        "blobs": blobs,
        "document": document,
        "drafts": drafts,
        "evidence": evidence,
        "lineage": lineage,
        "packages": packages,
        "virtualFs": virtualFs,
    }
    rootHash = digestBytes(stableJson(body).encode("utf-8"))
    manifest = _normalizeManifest(
        archive["manifest"],
        rootHash=rootHash,
        blobCount=len(blobs),
        totalByteLength=sum(len(payload) for payload in decodedBlobs.values()),
        draftCount=len(drafts),
        virtualFsEntryCount=len(virtualFs),
        packageCount=len(packages),
        evidenceEventCount=len(evidenceArchive["events"]),
        automationDraftCount=len(automationDrafts),
        runtimeTier=str(evidenceArchive["manifest"]["runtimeTier"]),
    )
    return {
        "automationDrafts": automationDrafts,
        "blobs": blobs,
        "document": document,
        "drafts": drafts,
        "evidence": evidence,
        "kind": ARCHIVE_KIND,
        "lineage": lineage,
        "manifest": manifest,
        "packages": packages,
        "schemaVersion": ARCHIVE_SCHEMA_VERSION,
        "virtualFs": virtualFs,
    }


def serializeLearningArchive(value: object, *, pretty: bool = True) -> str:
    archive = validateLearningArchive(value)
    if pretty:
        return json.dumps(archive, ensure_ascii=False, indent=2) + "\n"
    return stableJson(archive)


def prepareLearningArchiveImport(value: str | bytes | object) -> LearningArchiveImportPlan:
    if isinstance(value, bytes):
        try:
            parsed = json.loads(value.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise LearningArchiveError("학습 archive JSON을 읽을 수 없습니다.") from error
    elif isinstance(value, str):
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError as error:
            raise LearningArchiveError("학습 archive JSON을 읽을 수 없습니다.") from error
    else:
        parsed = value
    archive = validateLearningArchive(parsed)
    _normalizedBlobs, decodedBlobs = _normalizeBlobs(archive["blobs"])
    return LearningArchiveImportPlan(
        archiveId=str(archive["manifest"]["archiveId"]),
        rootHash=str(archive["manifest"]["rootHash"]),
        canonicalArchiveBytes=stableJson(archive).encode("utf-8"),
        blobs=tuple(sorted(decodedBlobs.items())),
    )


def materializeLearningArchive(value: str | bytes | object) -> LearningArchiveMaterialization:
    plan = prepareLearningArchiveImport(value)
    archive = validateLearningArchive(json.loads(plan.canonicalArchiveBytes.decode("utf-8")))
    blobs = dict(plan.blobs)
    try:
        document = json.loads(blobs[str(archive["document"]["blobHash"])].decode("utf-8"))
        evidenceArchive = json.loads(blobs[str(archive["evidence"]["blobHash"])].decode("utf-8"))
        drafts = {
            str(item["blockId"]): blobs[str(item["blobHash"])].decode("utf-8")
            for item in archive["drafts"]
        }
    except (KeyError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise LearningArchiveError("학습 archive payload를 materialize할 수 없습니다.") from error
    if not isinstance(document, dict) or not isinstance(evidenceArchive, dict):
        raise LearningArchiveError("학습 archive document 또는 evidence payload가 객체가 아닙니다.")

    virtualDirectories = tuple(
        str(item["path"])
        for item in archive["virtualFs"]
        if item["kind"] == "directory"
    )
    virtualFiles = tuple(
        LearningArchiveVirtualFile(
            path=str(item["path"]),
            payload=blobs[str(item["blobHash"])],
            mediaType=str(item["mediaType"]),
            executable=bool(item["executable"]),
        )
        for item in archive["virtualFs"]
        if item["kind"] == "file"
    )
    packages = tuple(
        LearningArchivePackage(
            name=str(item["name"]),
            version=str(item["version"]),
            path=str(item["path"]),
            payload=blobs[str(item["blobHash"])],
        )
        for item in archive["packages"]
    )
    automationDrafts = tuple(
        LearningArchiveAutomationDraft(
            draftId=str(item["draftId"]),
            lineageId=str(item["lineageId"]),
            name=str(item["name"]),
            description=str(item["description"]),
            recipe=blobs[str(item["recipeBlobHash"])],
            sourceBlockIds=tuple(str(blockId) for blockId in item["sourceBlockIds"]),
        )
        for item in archive["automationDrafts"]
    )
    return LearningArchiveMaterialization(
        archive=archive,
        document=document,
        drafts=drafts,
        evidenceArchive=evidenceArchive,
        virtualDirectories=virtualDirectories,
        virtualFiles=virtualFiles,
        packages=packages,
        automationDrafts=automationDrafts,
    )


def commitLearningArchiveImport(
    value: LearningArchiveImportPlan | str | bytes | object,
    storeRoot: str | Path,
    *,
    fault: Callable[[str], None] | None = None,
) -> dict[str, object]:
    plan = value if isinstance(value, LearningArchiveImportPlan) else prepareLearningArchiveImport(value)
    root = Path(storeRoot).expanduser().resolve()
    objectsRoot = root / "objects"
    _ioPath(objectsRoot).mkdir(parents=True, exist_ok=True)
    objectName = plan.rootHash.removeprefix("sha256-")
    objectRoot = objectsRoot / objectName
    if not _ioPath(objectRoot).exists():
        stageRoot = Path(tempfile.mkdtemp(prefix=".learning-import-", dir=_ioPath(objectsRoot)))
        try:
            _writeDurableFile(stageRoot / "archive.json", plan.canonicalArchiveBytes)
            blobRoot = stageRoot / "blobs"
            _ioPath(blobRoot).mkdir(parents=True, exist_ok=True)
            for blobHash, payload in plan.blobs:
                _writeDurableFile(blobRoot / blobHash.removeprefix("sha256-"), payload)
            if fault is not None:
                fault("beforeObjectPublish")
            os.replace(_ioPath(stageRoot), _ioPath(objectRoot))
        finally:
            if _ioPath(stageRoot).exists():
                shutil.rmtree(_ioPath(stageRoot))
    _verifyStoredObject(plan, objectRoot)
    previous = readCurrentLearningArchive(storeRoot, required=False)
    if previous is not None and previous["manifest"]["archiveId"] == plan.archiveId:
        return {
            "archiveId": plan.archiveId,
            "changed": False,
            "previousArchiveId": plan.archiveId,
            "rootHash": plan.rootHash,
        }
    if fault is not None:
        fault("beforeHeadReplace")
    head = stableJson({
        "archiveId": plan.archiveId,
        "object": objectName,
        "rootHash": plan.rootHash,
        "schemaVersion": 1,
    }).encode("utf-8")
    _atomicReplaceFile(root / "HEAD.json", head)
    if fault is not None:
        fault("afterHeadReplace")
    return {
        "archiveId": plan.archiveId,
        "changed": True,
        "previousArchiveId": previous["manifest"]["archiveId"] if previous is not None else None,
        "rootHash": plan.rootHash,
    }


def readCurrentLearningArchive(
    storeRoot: str | Path,
    *,
    required: bool = True,
) -> dict[str, Any] | None:
    root = Path(storeRoot).expanduser().resolve()
    headPath = root / "HEAD.json"
    if not _ioPath(headPath).is_file():
        if required:
            raise LearningArchiveError("현재 학습 archive HEAD가 없습니다.")
        return None
    try:
        head = json.loads(_ioPath(headPath).read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise LearningArchiveError("학습 archive HEAD를 읽을 수 없습니다.") from error
    normalizedHead = _closedObject(head, {"archiveId", "object", "rootHash", "schemaVersion"}, "archive HEAD")
    if normalizedHead["schemaVersion"] != 1:
        raise LearningArchiveError("지원하지 않는 학습 archive HEAD입니다.")
    rootHash = _requireHash(normalizedHead["rootHash"], "archive HEAD rootHash")
    expectedObject = rootHash.removeprefix("sha256-")
    if normalizedHead["object"] != expectedObject:
        raise LearningArchiveError("학습 archive HEAD object가 rootHash와 일치하지 않습니다.")
    archivePath = root / "objects" / expectedObject / "archive.json"
    try:
        archive = json.loads(_ioPath(archivePath).read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise LearningArchiveError("현재 학습 archive object를 읽을 수 없습니다.") from error
    normalized = validateLearningArchive(archive)
    if normalized["manifest"]["archiveId"] != normalizedHead["archiveId"] or normalized["manifest"]["rootHash"] != rootHash:
        raise LearningArchiveError("학습 archive HEAD와 object identity가 일치하지 않습니다.")
    return normalized


def _normalizeBlobs(value: object) -> tuple[dict[str, dict[str, object]], dict[str, bytes]]:
    if not isinstance(value, dict) or len(value) < 2:
        raise LearningArchiveError("학습 archive blob store가 유효하지 않습니다.")
    normalized: dict[str, dict[str, object]] = {}
    decoded: dict[str, bytes] = {}
    totalBytes = 0
    for blobHash, rawBlob in value.items():
        normalizedHash = _requireHash(blobHash, "blob hash")
        blob = _closedObject(rawBlob, {"byteLength", "encoding", "mediaType", "payload"}, "blob")
        if blob["encoding"] != "base64url" or blob["mediaType"] != BLOB_MEDIA_TYPE:
            raise LearningArchiveError("학습 archive blob encoding 또는 mediaType이 유효하지 않습니다.")
        byteLength = _boundedInteger(blob["byteLength"], "blob byteLength", minimum=0, maximum=MAX_BLOB_BYTES)
        payloadText = blob["payload"]
        if not isinstance(payloadText, str) or not re.fullmatch(r"[A-Za-z0-9_-]*", payloadText):
            raise LearningArchiveError("학습 archive blob payload가 base64url이 아닙니다.")
        payload = _decodeBase64Url(payloadText)
        if len(payload) != byteLength or digestBytes(payload) != normalizedHash:
            raise LearningArchiveError(f"학습 archive blob hash 또는 byteLength가 일치하지 않습니다: {normalizedHash}")
        totalBytes += len(payload)
        if totalBytes > MAX_TOTAL_BYTES:
            raise LearningArchiveError("학습 archive 전체 bytes가 한도를 초과했습니다.")
        normalized[normalizedHash] = {
            "byteLength": byteLength,
            "encoding": "base64url",
            "mediaType": BLOB_MEDIA_TYPE,
            "payload": payloadText,
        }
        decoded[normalizedHash] = payload
    return dict(sorted(normalized.items())), decoded


def _normalizeDocumentRef(
    value: object,
    blobs: Mapping[str, bytes],
) -> tuple[dict[str, object], set[str]]:
    item = _closedObject(value, {"blobHash", "documentId", "mediaType", "path"}, "document ref")
    documentId = _boundedString(item["documentId"], "documentId", maximum=255)
    blobHash = _knownBlob(item["blobHash"], blobs, "document blobHash")
    if item["path"] != "document/document.json" or item["mediaType"] != DOCUMENT_MEDIA_TYPE:
        raise LearningArchiveError("학습 archive document ref가 유효하지 않습니다.")
    try:
        document = json.loads(blobs[blobHash].decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise LearningArchiveError("학습 archive document bytes가 JSON이 아닙니다.") from error
    blockIds = _validateDocumentPayload(document, documentId)
    if stableJson(document).encode("utf-8") != blobs[blobHash]:
        raise LearningArchiveError("학습 archive document bytes가 canonical JSON이 아닙니다.")
    return (
        {
            "blobHash": blobHash,
            "documentId": documentId,
            "mediaType": DOCUMENT_MEDIA_TYPE,
            "path": "document/document.json",
        },
        blockIds,
    )


def _normalizeDraftRefs(value: object, blobs: Mapping[str, bytes]) -> list[dict[str, object]]:
    items = _boundedList(value, "draft refs", minimum=1, maximum=MAX_DRAFTS)
    result: list[dict[str, object]] = []
    blockIds: set[str] = set()
    for raw in items:
        item = _closedObject(raw, {"blobHash", "blockId", "mediaType"}, "draft ref")
        blockId = _boundedString(item["blockId"], "draft blockId", maximum=255)
        if blockId in blockIds:
            raise LearningArchiveError("학습 archive draft blockId가 중복되었습니다.")
        blockIds.add(blockId)
        blobHash = _knownBlob(item["blobHash"], blobs, "draft blobHash")
        if item["mediaType"] != DRAFT_MEDIA_TYPE:
            raise LearningArchiveError("학습 archive draft mediaType이 유효하지 않습니다.")
        try:
            blobs[blobHash].decode("utf-8")
        except UnicodeDecodeError as error:
            raise LearningArchiveError("학습 archive draft bytes가 UTF-8이 아닙니다.") from error
        result.append({"blobHash": blobHash, "blockId": blockId, "mediaType": DRAFT_MEDIA_TYPE})
    return sorted(result, key=lambda item: str(item["blockId"]))


def _normalizeVirtualFs(value: object, blobs: Mapping[str, bytes]) -> list[dict[str, object]]:
    items = _boundedList(value, "virtual FS", minimum=0, maximum=MAX_VFS_ENTRIES)
    result: list[dict[str, object]] = []
    paths: set[str] = set()
    directoryPaths: set[str] = set()
    pendingFiles: list[dict[str, object]] = []
    for raw in items:
        if not isinstance(raw, dict):
            raise LearningArchiveError("학습 archive virtual FS 항목이 객체가 아닙니다.")
        kind = raw.get("kind")
        if kind == "directory":
            item = _closedObject(raw, {"kind", "path"}, "virtual directory")
            path = _normalizeSafePath(item["path"])
            normalized = {"kind": "directory", "path": path}
            directoryPaths.add(path)
        elif kind == "file":
            item = _closedObject(raw, {"blobHash", "executable", "kind", "mediaType", "path"}, "virtual file")
            path = _normalizeSafePath(item["path"])
            blobHash = _knownBlob(item["blobHash"], blobs, "virtual file blobHash")
            mediaType = _boundedString(item["mediaType"], "virtual file mediaType", maximum=255)
            if not isinstance(item["executable"], bool):
                raise LearningArchiveError("학습 archive virtual file executable이 유효하지 않습니다.")
            normalized = {
                "blobHash": blobHash,
                "executable": item["executable"],
                "kind": "file",
                "mediaType": mediaType,
                "path": path,
            }
            pendingFiles.append(normalized)
        else:
            raise LearningArchiveError("학습 archive virtual FS kind가 유효하지 않습니다.")
        if path in paths:
            raise LearningArchiveError(f"학습 archive virtual FS 경로가 중복되었습니다: {path}")
        paths.add(path)
        result.append(normalized)
    for item in pendingFiles:
        _requireParentDirectories(str(item["path"]), directoryPaths)
    for path in directoryPaths:
        _requireParentDirectories(path, directoryPaths)
    return sorted(result, key=lambda item: (str(item["path"]), str(item["kind"])))


def _normalizePackages(value: object, blobs: Mapping[str, bytes]) -> list[dict[str, object]]:
    items = _boundedList(value, "packages", minimum=0, maximum=MAX_PACKAGES)
    result: list[dict[str, object]] = []
    keys: set[tuple[str, str, str]] = set()
    for raw in items:
        item = _closedObject(
            raw,
            {"blobHash", "integrity", "mediaType", "name", "path", "version"},
            "package ref",
        )
        name = _packageName(item["name"])
        version = _packageVersion(item["version"])
        path = _normalizeSafePath(item["path"])
        if not path.lower().endswith(".whl") or item["mediaType"] != "application/zip":
            raise LearningArchiveError("학습 archive package path 또는 mediaType이 유효하지 않습니다.")
        blobHash = _knownBlob(item["blobHash"], blobs, "package blobHash")
        if item["integrity"] != blobHash or not blobs[blobHash].startswith(b"PK\x03\x04"):
            raise LearningArchiveError("학습 archive package integrity가 bytes hash와 일치하지 않습니다.")
        key = (name, version, path)
        if key in keys:
            raise LearningArchiveError("학습 archive package가 중복되었습니다.")
        keys.add(key)
        result.append({
            "blobHash": blobHash,
            "integrity": blobHash,
            "mediaType": "application/zip",
            "name": name,
            "path": path,
            "version": version,
        })
    return sorted(result, key=lambda item: (str(item["name"]), str(item["version"]), str(item["path"])))


def _normalizeEvidenceRef(
    value: object,
    blobs: Mapping[str, bytes],
) -> tuple[dict[str, object], dict[str, Any]]:
    item = _closedObject(
        value,
        {"blobHash", "eventCount", "eventIds", "eventSetHash", "mediaType", "path"},
        "evidence ref",
    )
    if item["path"] != "evidence/archive.json" or item["mediaType"] != EVIDENCE_MEDIA_TYPE:
        raise LearningArchiveError("학습 archive evidence ref가 유효하지 않습니다.")
    blobHash = _knownBlob(item["blobHash"], blobs, "evidence blobHash")
    eventCount = _boundedInteger(item["eventCount"], "evidence eventCount", minimum=0, maximum=10_000)
    eventIds = _normalizeStringSet(item["eventIds"], "evidence eventIds", maximum=10_000, itemMaximum=1024)
    if len(eventIds) != eventCount:
        raise LearningArchiveError("학습 archive evidence eventCount가 eventIds와 일치하지 않습니다.")
    eventSetHash = _requireHash(item["eventSetHash"], "evidence eventSetHash")
    try:
        rawEvidence = json.loads(blobs[blobHash].decode("utf-8"))
        evidenceArchive = validateLearningEvidenceArchive(rawEvidence)
    except (UnicodeDecodeError, json.JSONDecodeError, EvidenceArchiveError) as error:
        raise LearningArchiveError("학습 archive evidence bytes가 유효하지 않습니다.") from error
    canonicalBytes = stableJson(evidenceArchive).encode("utf-8")
    actualIds = sorted(str(event["eventId"]) for event in evidenceArchive["events"])
    if (
        canonicalBytes != blobs[blobHash]
        or actualIds != eventIds
        or len(actualIds) != eventCount
        or evidenceArchive["manifest"]["eventSetHash"] != eventSetHash
    ):
        raise LearningArchiveError("학습 archive evidence descriptor가 실제 event bytes와 일치하지 않습니다.")
    return ({
        "blobHash": blobHash,
        "eventCount": eventCount,
        "eventIds": eventIds,
        "eventSetHash": eventSetHash,
        "mediaType": EVIDENCE_MEDIA_TYPE,
        "path": "evidence/archive.json",
    }, evidenceArchive)


def _normalizeLineage(
    value: object,
    document: Mapping[str, object],
    evidence: Mapping[str, object],
) -> list[dict[str, object]]:
    items = _boundedList(value, "lineage", minimum=1, maximum=MAX_AUTOMATION_DRAFTS)
    result: list[dict[str, object]] = []
    lineageIds: set[str] = set()
    evidenceIds = set(str(item) for item in evidence["eventIds"])
    for raw in items:
        item = _closedObject(
            raw,
            {"automationDraftIds", "documentBlobHash", "evidenceEventIds", "lessonRef", "lineageId"},
            "lineage",
        )
        lessonRef = _normalizeLessonRef(item["lessonRef"])
        documentBlobHash = _requireHash(item["documentBlobHash"], "lineage documentBlobHash")
        if documentBlobHash != document["blobHash"]:
            raise LearningArchiveError("학습 archive lineage document가 archive document와 일치하지 않습니다.")
        eventIds = _normalizeStringSet(item["evidenceEventIds"], "lineage evidenceEventIds", maximum=10_000, itemMaximum=1024)
        if (evidenceIds and not eventIds) or not set(eventIds).issubset(evidenceIds):
            raise LearningArchiveError("학습 archive lineage evidence가 archive evidence에 포함되지 않습니다.")
        automationDraftIds = _normalizeStringSet(
            item["automationDraftIds"],
            "lineage automationDraftIds",
            maximum=MAX_AUTOMATION_DRAFTS,
            itemMaximum=80,
        )
        if any(not AUTOMATION_DRAFT_ID_PATTERN.fullmatch(draftId) for draftId in automationDraftIds):
            raise LearningArchiveError("학습 archive lineage automationDraftId가 유효하지 않습니다.")
        core = {
            "automationDraftIds": automationDraftIds,
            "documentBlobHash": documentBlobHash,
            "evidenceEventIds": eventIds,
            "lessonRef": lessonRef,
        }
        lineageId = item["lineageId"]
        if not isinstance(lineageId, str) or lineageId != _lineageId(core) or lineageId in lineageIds:
            raise LearningArchiveError("학습 archive lineageId가 유효하지 않거나 중복되었습니다.")
        lineageIds.add(lineageId)
        result.append({"lineageId": lineageId, **core})
    return sorted(result, key=lambda item: str(item["lineageId"]))


def _normalizeAutomationDrafts(
    value: object,
    blobs: Mapping[str, bytes],
    drafts: Sequence[Mapping[str, object]],
    lineage: Sequence[Mapping[str, object]],
) -> list[dict[str, object]]:
    items = _boundedList(value, "automation drafts", minimum=0, maximum=MAX_AUTOMATION_DRAFTS)
    result: list[dict[str, object]] = []
    draftIds: set[str] = set()
    blockIds = {str(item["blockId"]) for item in drafts}
    lineageById = {str(item["lineageId"]): item for item in lineage}
    for raw in items:
        item = _closedObject(
            raw,
            {
                "confirmation",
                "description",
                "draftId",
                "lineageId",
                "name",
                "recipeBlobHash",
                "sideEffectPolicy",
                "sourceBlockIds",
                "state",
                "taskDefaults",
            },
            "automation draft",
        )
        if (
            item["state"] != "draft"
            or item["confirmation"] != "required"
            or item["sideEffectPolicy"] != "blocked-until-explicit-confirmation"
        ):
            raise LearningArchiveError("학습 archive automation draft가 side-effect-free 상태가 아닙니다.")
        defaults = _closedObject(item["taskDefaults"], {"enabled", "schedule"}, "automation task defaults")
        if defaults["enabled"] is not False or defaults["schedule"] is not None:
            raise LearningArchiveError("학습 archive automation draft는 disabled, unscheduled여야 합니다.")
        lineageId = item["lineageId"]
        if not isinstance(lineageId, str) or lineageId not in lineageById:
            raise LearningArchiveError("학습 archive automation draft lineageId가 유효하지 않습니다.")
        lineageItem = lineageById[lineageId]
        name = _boundedString(item["name"], "automation draft name", maximum=255)
        description = _boundedString(item["description"], "automation draft description", maximum=4096, allowEmpty=True)
        recipeBlobHash = _knownBlob(item["recipeBlobHash"], blobs, "automation recipeBlobHash")
        sourceBlockIds = _normalizeStringSet(
            item["sourceBlockIds"],
            "automation sourceBlockIds",
            maximum=MAX_DRAFTS,
            itemMaximum=255,
        )
        if not sourceBlockIds or not set(sourceBlockIds).issubset(blockIds):
            raise LearningArchiveError("학습 archive automation sourceBlockIds가 draft에 포함되지 않습니다.")
        expectedDraftId = _automationDraftId(
            documentBlobHash=str(lineageItem["documentBlobHash"]),
            lessonRef=str(lineageItem["lessonRef"]),
            name=name,
            recipeBlobHash=recipeBlobHash,
            sourceBlockIds=sourceBlockIds,
        )
        if item["draftId"] != expectedDraftId or expectedDraftId in draftIds:
            raise LearningArchiveError("학습 archive automation draftId가 유효하지 않거나 중복되었습니다.")
        draftIds.add(expectedDraftId)
        result.append({
            "confirmation": "required",
            "description": description,
            "draftId": expectedDraftId,
            "lineageId": lineageId,
            "name": name,
            "recipeBlobHash": recipeBlobHash,
            "sideEffectPolicy": "blocked-until-explicit-confirmation",
            "sourceBlockIds": sourceBlockIds,
            "state": "draft",
            "taskDefaults": {"enabled": False, "schedule": None},
        })
    return sorted(result, key=lambda item: str(item["draftId"]))


def _validateLineageDraftLinks(
    lineage: Sequence[Mapping[str, object]],
    automationDrafts: Sequence[Mapping[str, object]],
) -> None:
    draftsByLineage: dict[str, list[str]] = {}
    for draft in automationDrafts:
        draftsByLineage.setdefault(str(draft["lineageId"]), []).append(str(draft["draftId"]))
    for item in lineage:
        expected = sorted(draftsByLineage.get(str(item["lineageId"]), []))
        if item["automationDraftIds"] != expected:
            raise LearningArchiveError("학습 archive lineage automationDraftIds가 실제 draft와 일치하지 않습니다.")


def _normalizeManifest(
    value: object,
    *,
    rootHash: str,
    blobCount: int,
    totalByteLength: int,
    draftCount: int,
    virtualFsEntryCount: int,
    packageCount: int,
    evidenceEventCount: int,
    automationDraftCount: int,
    runtimeTier: str,
) -> dict[str, object]:
    manifest = _closedObject(
        value,
        {
            "archiveId",
            "automationDraftCount",
            "blobCount",
            "createdAt",
            "draftCount",
            "evidenceEventCount",
            "importMode",
            "packageCount",
            "rootHash",
            "runtimeTier",
            "totalByteLength",
            "virtualFsEntryCount",
        },
        "manifest",
    )
    expectedArchiveId = f"learning-archive:{rootHash.removeprefix('sha256-')}"
    expectedCounts = {
        "automationDraftCount": automationDraftCount,
        "blobCount": blobCount,
        "draftCount": draftCount,
        "evidenceEventCount": evidenceEventCount,
        "packageCount": packageCount,
        "totalByteLength": totalByteLength,
        "virtualFsEntryCount": virtualFsEntryCount,
    }
    actualCounts = {
        key: _boundedInteger(manifest[key], f"manifest {key}", minimum=0, maximum=MAX_TOTAL_BYTES)
        for key in expectedCounts
    }
    manifestRootHash = _requireHash(manifest["rootHash"], "manifest rootHash")
    archiveId = manifest["archiveId"]
    manifestRuntimeTier = manifest["runtimeTier"]
    if (
        not isinstance(archiveId, str)
        or archiveId != expectedArchiveId
        or manifestRootHash != rootHash
        or manifestRuntimeTier not in {"local", "mixed", "web"}
        or manifestRuntimeTier != runtimeTier
        or manifest["importMode"] != IMPORT_MODE
        or actualCounts != expectedCounts
    ):
        raise LearningArchiveError("학습 archive manifest가 실제 payload와 일치하지 않습니다.")
    createdAt = _timestamp(manifest["createdAt"], "manifest createdAt")
    return {
        "archiveId": expectedArchiveId,
        "automationDraftCount": automationDraftCount,
        "blobCount": blobCount,
        "createdAt": createdAt,
        "draftCount": draftCount,
        "evidenceEventCount": evidenceEventCount,
        "importMode": IMPORT_MODE,
        "packageCount": packageCount,
        "rootHash": rootHash,
        "runtimeTier": runtimeTier,
        "totalByteLength": totalByteLength,
        "virtualFsEntryCount": virtualFsEntryCount,
    }


def _addBlob(blobs: dict[str, dict[str, object]], payload: bytes) -> str:
    if not isinstance(payload, bytes):
        raise LearningArchiveError("학습 archive blob payload는 bytes여야 합니다.")
    if len(payload) > MAX_BLOB_BYTES:
        raise LearningArchiveError("학습 archive blob이 크기 한도를 초과했습니다.")
    blobHash = digestBytes(payload)
    encoded = base64.urlsafe_b64encode(payload).decode("ascii").rstrip("=")
    descriptor = {
        "byteLength": len(payload),
        "encoding": "base64url",
        "mediaType": BLOB_MEDIA_TYPE,
        "payload": encoded,
    }
    existing = blobs.get(blobHash)
    if existing is not None and existing != descriptor:
        raise LearningArchiveError("학습 archive content-addressed blob 충돌이 발생했습니다.")
    blobs[blobHash] = descriptor
    if sum(int(item["byteLength"]) for item in blobs.values()) > MAX_TOTAL_BYTES:
        raise LearningArchiveError("학습 archive 전체 bytes가 한도를 초과했습니다.")
    return blobHash


def _automationDraftId(
    *,
    documentBlobHash: str,
    lessonRef: str,
    name: str,
    recipeBlobHash: str,
    sourceBlockIds: Sequence[str],
) -> str:
    core = {
        "documentBlobHash": documentBlobHash,
        "lessonRef": lessonRef,
        "name": name,
        "recipeBlobHash": recipeBlobHash,
        "sourceBlockIds": list(sourceBlockIds),
    }
    return f"automation-draft:{digestBytes(stableJson(core).encode('utf-8')).removeprefix('sha256-')}"


def _lineageId(core: Mapping[str, object]) -> str:
    return f"lineage:{digestBytes(stableJson(dict(core)).encode('utf-8')).removeprefix('sha256-')}"


def _closedObject(value: object, keys: set[str], label: str) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != keys:
        actual = sorted(str(key) for key in value) if isinstance(value, dict) else type(value).__name__
        raise LearningArchiveError(f"{label} 필드가 닫힌 계약과 일치하지 않습니다: {actual}")
    return value


def _boundedList(value: object, label: str, *, minimum: int, maximum: int) -> list[Any]:
    if not isinstance(value, list) or not minimum <= len(value) <= maximum:
        raise LearningArchiveError(f"{label} 목록 크기가 유효하지 않습니다.")
    return value


def _boundedString(
    value: object,
    label: str,
    *,
    maximum: int,
    allowEmpty: bool = False,
) -> str:
    if not isinstance(value, str) or len(value) > maximum or (not allowEmpty and not value):
        raise LearningArchiveError(f"{label} 문자열이 유효하지 않습니다.")
    return value


def _boundedInteger(value: object, label: str, *, minimum: int, maximum: int) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or not minimum <= value <= maximum:
        raise LearningArchiveError(f"{label} 정수가 유효하지 않습니다.")
    return value


def _normalizeStringSet(
    value: object,
    label: str,
    *,
    maximum: int,
    itemMaximum: int,
) -> list[str]:
    if not isinstance(value, (list, tuple)) or len(value) > maximum:
        raise LearningArchiveError(f"{label} 목록이 유효하지 않습니다.")
    result = sorted(_boundedString(item, label, maximum=itemMaximum) for item in value)
    if len(set(result)) != len(result):
        raise LearningArchiveError(f"{label} 항목이 중복되었습니다.")
    return result


def _validateDocumentPayload(value: object, documentId: str) -> set[str]:
    if (
        not isinstance(value, dict)
        or value.get("id") != documentId
        or not isinstance(value.get("title"), str)
        or not value["title"]
        or not isinstance(value.get("blocks"), list)
        or not value["blocks"]
    ):
        raise LearningArchiveError("학습 archive document payload가 유효하지 않습니다.")
    blockIds: set[str] = set()
    for block in value["blocks"]:
        if (
            not isinstance(block, dict)
            or not isinstance(block.get("id"), str)
            or not block["id"]
            or block["id"] in blockIds
            or block.get("type") not in DOCUMENT_BLOCK_TYPES
            or not isinstance(block.get("content"), str)
        ):
            raise LearningArchiveError("학습 archive document block이 유효하지 않습니다.")
        blockIds.add(block["id"])
    return blockIds


def _requireHash(value: object, label: str) -> str:
    if not isinstance(value, str) or not HASH_PATTERN.fullmatch(value):
        raise LearningArchiveError(f"{label}가 SHA-256 hash가 아닙니다.")
    return value


def _knownBlob(value: object, blobs: Mapping[str, bytes], label: str) -> str:
    blobHash = _requireHash(value, label)
    if blobHash not in blobs:
        raise LearningArchiveError(f"{label}가 존재하지 않는 blob을 참조합니다.")
    return blobHash


def _normalizeLessonRef(value: object) -> str:
    lessonRef = _boundedString(value, "lessonRef", maximum=1024)
    if lessonRef.startswith("/") or lessonRef.endswith("/") or lessonRef.count("/") < 1:
        raise LearningArchiveError("학습 archive lessonRef가 category/contentId 형식이 아닙니다.")
    if "\\" in lessonRef or ".." in lessonRef.split("/"):
        raise LearningArchiveError("학습 archive lessonRef가 안전하지 않습니다.")
    return lessonRef


def _normalizeSafePath(value: object) -> str:
    path = _boundedString(value, "archive path", maximum=1024)
    if path.startswith("/") or "\\" in path or ":" in path or "\x00" in path:
        raise LearningArchiveError(f"학습 archive 상대 경로가 안전하지 않습니다: {path!r}")
    parts = path.split("/")
    if any(not part or part in {".", ".."} or part.rstrip(". ") != part for part in parts):
        raise LearningArchiveError(f"학습 archive 상대 경로가 안전하지 않습니다: {path!r}")
    if any(part.split(".", 1)[0].upper() in WINDOWS_RESERVED_NAMES for part in parts):
        raise LearningArchiveError(f"학습 archive 경로가 Windows reserved name을 사용합니다: {path!r}")
    return path


def _requireParentDirectories(path: str, directories: set[str]) -> None:
    parts = path.split("/")[:-1]
    parents = {"/".join(parts[:index]) for index in range(1, len(parts) + 1)}
    missing = sorted(parents - directories)
    if missing:
        raise LearningArchiveError(f"학습 archive virtual FS parent directory가 누락되었습니다: {missing}")


def _packageName(value: object) -> str:
    name = _boundedString(value, "package name", maximum=255)
    if not PACKAGE_NAME_PATTERN.fullmatch(name):
        raise LearningArchiveError("학습 archive package name이 유효하지 않습니다.")
    return name


def _packageVersion(value: object) -> str:
    version = _boundedString(value, "package version", maximum=255)
    if not PACKAGE_VERSION_PATTERN.fullmatch(version):
        raise LearningArchiveError("학습 archive package version이 유효하지 않습니다.")
    return version


def _textOrBytes(value: object, label: str) -> bytes:
    if isinstance(value, str):
        return value.encode("utf-8")
    if isinstance(value, bytes):
        return value
    raise LearningArchiveError(f"학습 archive {label}는 text 또는 bytes여야 합니다.")


def _decodeBase64Url(value: str) -> bytes:
    padding = "=" * ((4 - len(value) % 4) % 4)
    try:
        decoded = base64.b64decode(value + padding, altchars=b"-_", validate=True)
    except (binascii.Error, ValueError) as error:
        raise LearningArchiveError("학습 archive blob base64url을 decode할 수 없습니다.") from error
    canonical = base64.urlsafe_b64encode(decoded).decode("ascii").rstrip("=")
    if canonical != value:
        raise LearningArchiveError("학습 archive blob base64url이 canonical encoding이 아닙니다.")
    return decoded


def _timestamp(value: object, label: str) -> str:
    timestamp = _boundedString(value, label, maximum=64)
    try:
        parsed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    except ValueError as error:
        raise LearningArchiveError(f"{label}가 ISO 8601 timestamp가 아닙니다.") from error
    if parsed.tzinfo is None:
        raise LearningArchiveError(f"{label}에 timezone이 없습니다.")
    return timestamp


def _writeDurableFile(path: Path, payload: bytes) -> None:
    target = _ioPath(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("wb") as handle:
        handle.write(payload)
        handle.flush()
        os.fsync(handle.fileno())


def _atomicReplaceFile(path: Path, payload: bytes) -> None:
    target = _ioPath(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporaryName = tempfile.mkstemp(prefix=f".{path.name}.", dir=target.parent)
    temporary = Path(temporaryName)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(_ioPath(temporary), target)
    finally:
        if _ioPath(temporary).exists():
            _ioPath(temporary).unlink()


def _verifyStoredObject(plan: LearningArchiveImportPlan, objectRoot: Path) -> None:
    try:
        storedArchive = _ioPath(objectRoot.joinpath("archive.json")).read_bytes()
    except OSError as error:
        raise LearningArchiveError("학습 archive object를 읽을 수 없습니다.") from error
    if storedArchive != plan.canonicalArchiveBytes:
        raise LearningArchiveError("학습 archive object가 import plan과 일치하지 않습니다.")
    for blobHash, expected in plan.blobs:
        try:
            actual = _ioPath(objectRoot.joinpath("blobs", blobHash.removeprefix("sha256-"))).read_bytes()
        except OSError as error:
            raise LearningArchiveError("학습 archive object blob을 읽을 수 없습니다.") from error
        if actual != expected or digestBytes(actual) != blobHash:
            raise LearningArchiveError("학습 archive object blob hash가 일치하지 않습니다.")


def _ioPath(path: Path) -> Path:
    if os.name != "nt":
        return path
    value = str(path)
    if value.startswith("\\\\?\\"):
        return path
    absolute = str(path.resolve())
    if absolute.startswith("\\\\"):
        return Path(f"\\\\?\\UNC\\{absolute[2:]}")
    return Path(f"\\\\?\\{absolute}")
