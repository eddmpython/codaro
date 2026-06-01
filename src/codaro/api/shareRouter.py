from __future__ import annotations

from fastapi import APIRouter, Query
from pydantic import BaseModel

from ..serverLog import formatLogFields, getServerLogger
from ..share.packFlow import SharePackFlow, SharePackFlowError
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
    flow = SharePackFlow(workspaceRoot=state.workspaceRoot)

    def failSharePackFlow(error: SharePackFlowError) -> None:
        fail(error.statusCode, error.code, error.message)

    @router.get("/api/share/packs/status")
    def apiSharePackStatus() -> dict[str, object]:
        return flow.statusPayload()

    @router.get("/api/share/packs")
    def apiListSharePacks() -> dict[str, object]:
        payload = flow.listPayload()
        logger.debug("share-pack %s", formatLogFields(action="list", count=payload["total"]))
        return payload

    @router.post("/api/share/packs/inspect")
    def apiInspectSharePack(request: SharePackSourceRequest) -> dict[str, object]:
        try:
            payload = flow.inspectPayload(request.source)
        except SharePackFlowError as error:
            failSharePackFlow(error)
        logger.debug(
            "share-pack %s",
            formatLogFields(action="inspect", source=request.source, installable=payload.get("installable")),
        )
        return payload

    @router.post("/api/share/packs/install")
    def apiInstallSharePack(request: SharePackSourceRequest) -> dict[str, object]:
        try:
            payload = flow.installPayload(request.source)
        except SharePackFlowError as error:
            failSharePackFlow(error)
        pack = payload.get("pack") if isinstance(payload.get("pack"), dict) else {}
        logger.info(
            "share-pack %s",
            formatLogFields(action="install", packId=pack.get("id"), version=pack.get("version")),
        )
        return payload

    @router.delete("/api/share/packs/{packId}")
    def apiUninstallSharePack(packId: str, version: str | None = Query(default=None)) -> dict[str, object]:
        try:
            payload = flow.uninstallPayload(packId, version)
        except SharePackFlowError as error:
            failSharePackFlow(error)
        logger.info("share-pack %s", formatLogFields(action="uninstall", packId=packId, version=version))
        return payload

    @router.post("/api/share/packs/export")
    def apiExportSharePack(request: SharePackExportRequest) -> dict[str, object]:
        try:
            payload = flow.exportPayload(request.sourceDir, request.outputPath)
        except SharePackFlowError as error:
            failSharePackFlow(error)
        logger.info("share-pack %s", formatLogFields(action="export", outputPath=payload["outputPath"]))
        return payload

    @router.get("/api/share/packs/{packId}/curriculum")
    def apiLoadSharePackCurriculum(
        packId: str,
        path: str,
        version: str | None = Query(default=None),
    ) -> dict[str, object]:
        try:
            return flow.curriculumPayload(packId, path, version)
        except SharePackFlowError as error:
            failSharePackFlow(error)

    @router.get("/api/share/packs/{packId}/automation")
    def apiLoadSharePackAutomation(
        packId: str,
        path: str,
        version: str | None = Query(default=None),
    ) -> dict[str, object]:
        try:
            return flow.automationPayload(packId, path, version)
        except SharePackFlowError as error:
            failSharePackFlow(error)

    @router.post("/api/share/packs/{packId}/automation-task")
    def apiCreateSharePackAutomationTask(
        packId: str,
        request: SharePackAutomationTaskRequest,
        version: str | None = Query(default=None),
    ) -> dict[str, object]:
        try:
            payload = flow.automationTaskPayload(
                contentPath=request.path,
                schedule=request.schedule,
                description=request.description,
                name=request.name,
                packId=packId,
                version=version,
            )
        except SharePackFlowError as error:
            failSharePackFlow(error)
        task = payload.get("task") if isinstance(payload.get("task"), dict) else {}
        logger.info(
            "share-pack %s",
            formatLogFields(action="create-task", packId=packId, path=request.path, taskId=task.get("id")),
        )
        return payload

    return router
