from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Query
from pydantic import BaseModel

from ..automation.recipeAuthoring import buildAutomationTaskDraft
from ..automation.taskRegistry import getTaskRegistry
from ..serverLog import formatLogFields, getServerLogger
from ..share import PackService
from .appState import ServerState
from .errors import fail


class SharePackSourceRequest(BaseModel):
    source: str


class SharePackExportRequest(BaseModel):
    sourceDir: str
    outputPath: str


class SharePackAutomationTaskRequest(BaseModel):
    path: str
    name: str = ""
    description: str = ""
    schedule: str | None = None


def createShareRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()
    service = PackService(workspaceRoot=state.workspaceRoot)

    @router.get("/api/share/packs/status")
    def apiSharePackStatus() -> dict[str, object]:
        return {
            "enabled": True,
            "devOnlySurface": True,
            "storageRoot": str(service.storageRoot),
            "workspaceRoot": str(state.workspaceRoot),
        }

    @router.get("/api/share/packs")
    def apiListSharePacks() -> dict[str, object]:
        records = [record.payload() for record in service.listInstalled()]
        logger.debug("share-pack %s", formatLogFields(action="list", count=len(records)))
        return {"packs": records, "total": len(records)}

    @router.post("/api/share/packs/inspect")
    def apiInspectSharePack(request: SharePackSourceRequest) -> dict[str, object]:
        try:
            preview = service.inspect(request.source)
        except (FileNotFoundError, ValueError, RuntimeError) as error:
            fail(400, "share_pack_inspect_failed", str(error))
        logger.debug(
            "share-pack %s",
            formatLogFields(action="inspect", source=request.source, installable=preview.installable),
        )
        return preview.payload()

    @router.post("/api/share/packs/install")
    def apiInstallSharePack(request: SharePackSourceRequest) -> dict[str, object]:
        try:
            record = service.install(request.source)
        except (FileNotFoundError, ValueError, RuntimeError) as error:
            fail(400, "share_pack_install_failed", str(error))
        logger.info("share-pack %s", formatLogFields(action="install", packId=record.id, version=record.version))
        return {"pack": record.payload()}

    @router.delete("/api/share/packs/{packId}")
    def apiUninstallSharePack(packId: str, version: str | None = Query(default=None)) -> dict[str, object]:
        try:
            removed = service.uninstall(packId, version)
        except ValueError as error:
            fail(400, "share_pack_uninstall_failed", str(error))
        if not removed:
            fail(404, "share_pack_not_found", "Pack not found.")
        logger.info("share-pack %s", formatLogFields(action="uninstall", packId=packId, version=version))
        return {"ok": True}

    @router.post("/api/share/packs/export")
    def apiExportSharePack(request: SharePackExportRequest) -> dict[str, object]:
        try:
            outputPath = service.exportArchive(Path(request.sourceDir), Path(request.outputPath))
        except (FileNotFoundError, ValueError, OSError) as error:
            fail(400, "share_pack_export_failed", str(error))
        logger.info("share-pack %s", formatLogFields(action="export", outputPath=outputPath))
        return {"outputPath": str(outputPath)}

    @router.get("/api/share/packs/{packId}/curriculum")
    def apiLoadSharePackCurriculum(
        packId: str,
        path: str,
        version: str | None = Query(default=None),
    ) -> dict[str, object]:
        try:
            return service.loadCurriculumDocument(packId, path, version)
        except (FileNotFoundError, ValueError) as error:
            fail(404, "share_pack_curriculum_not_found", str(error))

    @router.get("/api/share/packs/{packId}/automation")
    def apiLoadSharePackAutomation(
        packId: str,
        path: str,
        version: str | None = Query(default=None),
    ) -> dict[str, object]:
        try:
            return service.loadAutomationRecipe(packId, path, version)
        except (FileNotFoundError, ValueError) as error:
            fail(404, "share_pack_automation_not_found", str(error))

    @router.post("/api/share/packs/{packId}/automation-task")
    def apiCreateSharePackAutomationTask(
        packId: str,
        request: SharePackAutomationTaskRequest,
        version: str | None = Query(default=None),
    ) -> dict[str, object]:
        try:
            record = service.findInstalled(packId, version)
            recipePath = service.resolveAutomationRecipePath(record, request.path)
            taskDraft = buildAutomationTaskDraft(
                name=request.name or recipePath.stem,
                documentPath=str(recipePath),
                description=request.description or f"Shared pack automation: {record.title}",
                schedule=request.schedule,
            )
        except (FileNotFoundError, TypeError, ValueError) as error:
            fail(400, "share_pack_task_create_failed", str(error))
        task = getTaskRegistry().create(
            name=taskDraft.name,
            documentPath=taskDraft.documentPath,
            description=taskDraft.description,
            schedule=taskDraft.schedule,
            inputs=taskDraft.inputs,
        )
        logger.info(
            "share-pack %s",
            formatLogFields(action="create-task", packId=packId, path=request.path, taskId=task.id),
        )
        return {"task": task.serialize()}

    return router
