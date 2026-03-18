from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from .appState import ServerState


def createSpaRouter(state: ServerState) -> APIRouter:
    router = APIRouter()

    indexPath = state.webBuildRoot / "index.html"
    assetsPath = state.webBuildRoot / "_app"

    if indexPath.is_file() and assetsPath.is_dir():
        indexHtml = indexPath.read_text(encoding="utf-8")
        if assetsPath.exists():
            router.mount("/_app", StaticFiles(directory=assetsPath), name="app-assets")

        @router.get("/{fullPath:path}", response_model=None)
        def spa(fullPath: str, request: Request) -> FileResponse | HTMLResponse:
            filePath = state.webBuildRoot / fullPath
            if fullPath and filePath.exists() and filePath.is_file():
                return FileResponse(filePath)
            rootPath = request.scope.get("root_path", "")
            injected = indexHtml.replace(
                "</head>",
                f'<meta name="codaro-base" content="{rootPath}">\n  </head>',
            )
            return HTMLResponse(injected)

        return router

    @router.get("/{fullPath:path}")
    def missingBuild(fullPath: str) -> dict[str, str]:
        del fullPath
        return {
            "detail": "Codaro frontend build not found. Run `npm install` and `npm run build` in frontend/."
        }

    return router
