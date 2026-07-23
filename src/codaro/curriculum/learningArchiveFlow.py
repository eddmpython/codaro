from __future__ import annotations

from pathlib import Path
import threading
from typing import Any, Protocol

from .evidenceArchive import EvidenceArchiveError
from .learningArchive import (
    LearningArchiveError,
    commitLearningArchiveImport,
    materializeLearningArchive,
    readCurrentLearningArchive,
)


learningArchiveMutationLock = threading.RLock()


class LearningEvidenceImporter(Protocol):
    def mergeArchive(self, value: object) -> dict[str, object]: ...


def importLearningArchive(
    value: object,
    *,
    storeRoot: str | Path,
    evidenceStore: LearningEvidenceImporter,
) -> dict[str, Any]:
    """Publish a full archive, then merge its already-validated evidence.

    The immutable object is written before HEAD. If the SQLite merge rejects the
    embedded evidence, HEAD is restored so the product never exposes a partial
    import. Published immutable objects may remain as harmless content-addressed
    cache entries.
    """

    root = Path(storeRoot).expanduser().resolve()
    with learningArchiveMutationLock:
        materialized = materializeLearningArchive(value)
        previous = readCurrentLearningArchive(root, required=False)
        archiveReceipt = commitLearningArchiveImport(materialized.archive, root)
        try:
            evidenceReceipt = evidenceStore.mergeArchive(materialized.evidenceArchive)
        except Exception as error:
            _restoreHead(root, previous)
            if isinstance(error, (EvidenceArchiveError, LearningArchiveError)):
                raise LearningArchiveError(str(error)) from error
            raise

    return {
        **archiveReceipt,
        "automationDrafts": [
            {
                "draftId": draft.draftId,
                "enabled": False,
                "lineageId": draft.lineageId,
                "name": draft.name,
                "schedule": None,
                "state": "draft",
            }
            for draft in materialized.automationDrafts
        ],
        "documentId": materialized.document.get("id"),
        "draftCount": len(materialized.drafts),
        "evidence": evidenceReceipt,
        "packageCount": len(materialized.packages),
        "virtualFsEntryCount": len(materialized.virtualDirectories) + len(materialized.virtualFiles),
    }


def _restoreHead(root: Path, previous: dict[str, Any] | None) -> None:
    if previous is not None:
        commitLearningArchiveImport(previous, root)
        return
    headPath = root / "HEAD.json"
    try:
        headPath.unlink(missing_ok=True)
    except OSError as error:
        raise LearningArchiveError("학습 archive import rollback 중 HEAD를 제거하지 못했습니다.") from error
