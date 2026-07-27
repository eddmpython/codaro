from __future__ import annotations

import os
from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import FileResponse, HTMLResponse, PlainTextResponse

from ..system.serverState import ServerState


def createSpaRouter(state: ServerState) -> APIRouter:
    router = APIRouter()

    webBuildRoot = state.webBuildRoot.resolve()
    indexPath = _filesystemPath(webBuildRoot / "index.html")
    assetsPath = _filesystemPath(webBuildRoot / "_app")

    if indexPath.is_file() and assetsPath.is_dir():
        indexHtml = indexPath.read_text(encoding="utf-8")

        @router.get("/{fullPath:path}", response_model=None)
        def spa(fullPath: str, request: Request) -> FileResponse | HTMLResponse | PlainTextResponse:
            if fullPath:
                resolvedPath = (webBuildRoot / fullPath).resolve()
                if not resolvedPath.is_relative_to(webBuildRoot):
                    return PlainTextResponse("Not Found", status_code=404)
                filePath = _filesystemPath(resolvedPath)
                if filePath.is_file():
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
                (
                    f'<meta name="codaro-base" content="{rootPath}">\n'
                    '  <meta name="codaro-runtime-tier" content="local">\n  </head>'
                ),
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


def _filesystemPath(path: Path) -> Path:
    resolved = path.resolve()
    raw = str(resolved)
    if os.name == "nt" and not raw.startswith("\\\\?\\"):
        return Path(f"\\\\?\\{raw}")
    return resolved
