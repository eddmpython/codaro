from __future__ import annotations

import platform
import sys
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Request

from ..serverLog import formatLogFields, getServerLogger
from .appState import ServerState
from .requestModels import EnvironmentInfo


def createBootstrapRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()

    @router.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @router.get("/api/bootstrap")
    def bootstrap(request: Request) -> dict[str, Any]:
        rootPath = request.scope.get("root_path", "")
        payload = {
            "appMode": state.mode == "app",
            "documentPath": str(state.documentPath) if state.documentPath else None,
            "workspaceRoot": str(state.workspaceRoot),
            "rootPath": rootPath,
        }
        logger.debug(
            "bootstrap %s",
            formatLogFields(appMode=payload["appMode"], workspaceRoot=payload["workspaceRoot"], rootPath=rootPath),
        )
        return payload

    @router.get("/api/env/info", response_model=EnvironmentInfo)
    def envInfo() -> EnvironmentInfo:
        payload = EnvironmentInfo(
            pythonVersion=sys.version,
            platform=platform.platform(),
            cwd=str(Path.cwd()),
            executable=sys.executable,
        )
        logger.debug("env %s", formatLogFields(cwd=payload.cwd, executable=payload.executable))
        return payload

    return router
