from __future__ import annotations

from pathlib import Path
import subprocess
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from .document.models import BootstrapResponse, ExportRequest, ExportResponse, LoadRequest, SaveRequest
from .document.service import createEmptyDocument, exportDocument, loadDocument, saveDocument


PACKAGE_ROOT = Path(__file__).resolve().parent
FRONTEND_ROOT = PACKAGE_ROOT.parent.parent.parent / "frontend"
WEB_BUILD_ROOT = PACKAGE_ROOT / "webBuild"


def createServerApp(mode: str = "edit", documentPath: Path | None = None) -> FastAPI:
    app = FastAPI(title="Codaro")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/bootstrap", response_model=BootstrapResponse)
    def bootstrap() -> BootstrapResponse:
        return BootstrapResponse(
            appMode=mode == "app",
            documentPath=str(documentPath) if documentPath else None,
        )

    @app.post("/api/document/load")
    def apiLoadDocument(request: LoadRequest) -> dict[str, Any]:
        path = Path(request.path).expanduser()
        if not path.exists():
            return {
                "path": str(path.resolve()),
                "document": createEmptyDocument(title=path.stem or "Untitled").model_dump(),
                "exists": False,
            }
        document = loadDocument(str(path))
        return {"path": str(path.resolve()), "document": document.model_dump(), "exists": True}

    @app.post("/api/document/save")
    def apiSaveDocument(request: SaveRequest) -> dict[str, str]:
        if not request.path:
            raise HTTPException(status_code=400, detail="Path is required for save.")
        savedPath = saveDocument(request.path, request.document)
        return {"path": str(savedPath)}

    @app.post("/api/document/export", response_model=ExportResponse)
    def apiExportDocument(request: ExportRequest) -> ExportResponse:
        try:
            outputPath = exportDocument(request.path, request.format, request.outputPath)
        except ValueError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error
        return ExportResponse(path=request.path, outputPath=str(outputPath), format=request.format)

    if WEB_BUILD_ROOT.exists():
        assetsPath = WEB_BUILD_ROOT / "_app"
        if assetsPath.exists():
            app.mount("/_app", StaticFiles(directory=assetsPath), name="app-assets")

        @app.get("/{fullPath:path}")
        def spa(fullPath: str) -> FileResponse:
            filePath = WEB_BUILD_ROOT / fullPath
            if fullPath and filePath.exists() and filePath.is_file():
                return FileResponse(filePath)
            return FileResponse(WEB_BUILD_ROOT / "index.html")
    else:
        @app.get("/{fullPath:path}")
        def missingBuild(fullPath: str) -> dict[str, str]:
            return {
                "detail": "Codaro frontend build not found. Run `npm install` and `npm run build` in frontend/."
            }

    return app


def runServer(
    host: str = "127.0.0.1",
    port: int = 8765,
    mode: str = "edit",
    documentPath: Path | None = None,
) -> None:
    _ensureFrontendBuild()
    app = createServerApp(mode=mode, documentPath=documentPath)
    uvicorn.run(app, host=host, port=port, log_level="warning")


def _ensureFrontendBuild() -> None:
    if WEB_BUILD_ROOT.exists():
        return
    packageJson = FRONTEND_ROOT / "package.json"
    if not packageJson.exists():
        return
    subprocess.run(["npm", "install"], cwd=FRONTEND_ROOT, check=True)
    subprocess.run(["npm", "run", "build"], cwd=FRONTEND_ROOT, check=True)
