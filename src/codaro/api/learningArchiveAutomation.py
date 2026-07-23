from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path
import re
from typing import Any

from ..automation.taskRegistry import TaskRegistry, getTaskRegistry
from ..curriculum.learningArchive import (
    LearningArchiveError,
    confirmAutomationDraft,
    materializeLearningArchive,
    readCurrentLearningArchive,
)
from ..curriculum.learningArchiveFlow import learningArchiveMutationLock
from ..document.models import BlockConfig, CodaroDocument, DocumentMetadata
from ..document.service import saveDocument


def adoptLearningArchiveAutomationDraft(
    draftId: str,
    *,
    storeRoot: str | Path,
    workspaceRoot: str | Path,
    taskRegistry: TaskRegistry | None = None,
) -> dict[str, Any]:
    """Adopt a validated learning recipe as a disabled, unscheduled Local task."""

    registry = taskRegistry or getTaskRegistry()
    with learningArchiveMutationLock:
        archive = readCurrentLearningArchive(storeRoot)
        materialized = materializeLearningArchive(archive)
        draft = next((item for item in materialized.automationDrafts if item.draftId == draftId), None)
        archiveDraft = next((item for item in archive["automationDrafts"] if item["draftId"] == draftId), None)
        if draft is None or archiveDraft is None:
            raise LearningArchiveError("현재 학습 archive에서 자동화 초안을 찾을 수 없습니다.")

        existing = next(
            (task for task in registry.listTasks() if task.inputs.get("sourceDraftId") == draftId),
            None,
        )
        relativePath = _automationDraftDocumentPath(draft.name, draftId)
        if existing is not None:
            return {
                "adopted": False,
                "confirmation": "already-adopted",
                "documentPath": existing.documentPath,
                "task": existing.serialize(),
            }

        confirmation = confirmAutomationDraft(
            archive,
            draftId,
            {
                "confirmationId": f"learning-adoption:{draftId.split(':', 1)[-1]}",
                "confirmedAt": datetime.now(tz=UTC).isoformat(),
                "draftId": draftId,
                "recipeBlobHash": archiveDraft["recipeBlobHash"],
            },
        )
        try:
            recipe = draft.recipe.decode("utf-8")
        except UnicodeDecodeError as error:
            raise LearningArchiveError("자동화 초안 recipe가 UTF-8 텍스트가 아닙니다.") from error

        document = CodaroDocument(
            id=f"learning-automation-{draftId.split(':', 1)[-1][:12]}",
            title=draft.name,
            blocks=[BlockConfig(id="recipe", type="automation", content=recipe)],
            metadata=DocumentMetadata(sourceFormat="percent"),
        )
        saveDocument(str(Path(workspaceRoot).expanduser().resolve() / relativePath), document)
        task = registry.create(
            name=draft.name,
            documentPath=relativePath,
            description=draft.description,
            schedule=None,
            inputs={
                "learningArchiveId": archive["manifest"]["archiveId"],
                "lineageId": confirmation["lineageId"],
                "sourceDraftId": confirmation["sourceDraftId"],
            },
            enabled=False,
        )
        return {
            "adopted": True,
            "confirmation": confirmation["confirmationId"],
            "documentPath": relativePath,
            "task": task.serialize(),
        }


def _automationDraftDocumentPath(name: str, draftId: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "learning-automation"
    digest = draftId.split(":", 1)[-1][:12]
    return f"automations/learning/{slug}-{digest}.py"
