from __future__ import annotations

import time

from fastapi import APIRouter

from ..system.workspaceIndex import WorkspaceIndex, buildWorkspaceIndex
from ..serverLog import formatLogFields, getServerLogger
from .appState import ServerState


def createWorkspaceRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()

    @router.get("/api/workspace/index", response_model=WorkspaceIndex)
    def workspaceIndex() -> WorkspaceIndex:
        startedAt = time.perf_counter()
        logger.debug("workspace-scan %s", formatLogFields(status="start", root=state.workspaceRoot))
        index = buildWorkspaceIndex(state.workspaceRoot)
        logger.debug(
            "workspace-scan %s",
            formatLogFields(
                status="done",
                root=state.workspaceRoot,
                codaroDocuments=index.totalCodaroDocuments,
                compatibleDocuments=index.totalCompatibleDocuments,
                durationMs=round((time.perf_counter() - startedAt) * 1000, 1),
            ),
        )
        return index

    return router
