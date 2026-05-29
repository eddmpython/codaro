from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import FileResponse, HTMLResponse, PlainTextResponse

from .appState import ServerState


def createSpaRouter(state: ServerState) -> APIRouter:
    router = APIRouter()

    indexPath = state.webBuildRoot / "index.html"
    assetsPath = state.webBuildRoot / "_app"

    if indexPath.is_file() and assetsPath.is_dir():
        indexHtml = indexPath.read_text(encoding="utf-8")

        @router.get("/{fullPath:path}", response_model=None)
        def spa(fullPath: str, request: Request) -> FileResponse | HTMLResponse | PlainTextResponse:
            filePath = state.webBuildRoot / fullPath
            if fullPath and filePath.is_file():
                if not filePath.resolve().is_relative_to(state.webBuildRoot.resolve()):
                    return PlainTextResponse("Not Found", status_code=404)
                return FileResponse(filePath)
            # A request for a missing file that carries an extension (a hashed build
            # asset, favicon, source map, …) must 404. Falling back to index.html
            # makes the browser receive text/html where it expected JS/CSS; with
            # `nosniff` enforced that is rejected on a MIME mismatch and the SPA
            # boots to a blank screen. Only extensionless paths are client routes.
            if Path(fullPath).suffix:
                return PlainTextResponse("Not Found", status_code=404)
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
            "detail": "Codaro editor build not found. Run `npm install` and `npm run build` in editor/."
        }

    return router
