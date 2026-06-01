from __future__ import annotations

from .packService import PackService
from ..automation.recipeAuthoring import buildAutomationTaskDraft
from ..automation.taskRegistry import getTaskRegistry


def createSharePackAutomationTask(
    *,
    contentPath: str,
    description: str = "",
    name: str = "",
    packId: str,
    schedule: str | None = None,
    service: PackService,
    version: str | None = None,
) -> dict[str, object]:
    record = service.findInstalled(packId, version)
    recipePath = service.resolveAutomationRecipePath(record, contentPath)
    taskDraft = buildAutomationTaskDraft(
        name=name or recipePath.stem,
        documentPath=str(recipePath),
        description=description or f"Shared pack automation: {record.title}",
        schedule=schedule,
    )
    task = getTaskRegistry().create(
        name=taskDraft.name,
        documentPath=taskDraft.documentPath,
        description=taskDraft.description,
        schedule=taskDraft.schedule,
        inputs=taskDraft.inputs,
    )
    return task.serialize()
