from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse


def createClassroomRetirementRouter() -> APIRouter:
    router = APIRouter()

    def retiredResponse() -> JSONResponse:
        return JSONResponse(
            status_code=410,
            content={
                "error": {
                    "code": "classroom_retired",
                    "message": "The classroom feature is retired. Manage legacy data from the local Codaro CLI.",
                    "localCommands": [
                        "codaro classroom audit",
                        "codaro classroom export --output <archive.zip>",
                        "codaro classroom verify <archive.zip>",
                        "codaro classroom purge --archive <archive.zip> --confirm-hash <sha256> --reason user",
                    ],
                }
            },
        )

    @router.api_route(
        "/api/classroom",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        include_in_schema=False,
    )
    def apiClassroomRootRetired() -> JSONResponse:
        return retiredResponse()

    @router.api_route(
        "/api/classroom/{legacyPath:path}",
        methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        include_in_schema=False,
    )
    def apiClassroomPathRetired(legacyPath: str) -> JSONResponse:
        del legacyPath
        return retiredResponse()

    return router
