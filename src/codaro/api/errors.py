from __future__ import annotations

from dataclasses import dataclass

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from ..serverLog import formatLogFields, getServerLogger


@dataclass(slots=True)
class ApiError(Exception):
    statusCode: int
    code: str
    message: str


def fail(statusCode: int, code: str, message: str) -> None:
    raise ApiError(statusCode=statusCode, code=code, message=message)


def buildErrorBody(code: str, message: str) -> dict[str, dict[str, str]]:
    return {"error": {"code": code, "message": message}}


def normalizeHttpDetail(statusCode: int, detail: object) -> tuple[str, str]:
    if isinstance(detail, dict):
        code = str(detail.get("code", defaultErrorCode(statusCode)))
        message = str(detail.get("message", detail))
        return code, message
    return defaultErrorCode(statusCode), str(detail)


def defaultErrorCode(statusCode: int) -> str:
    if statusCode == 400:
        return "bad_request"
    if statusCode == 404:
        return "not_found"
    if statusCode == 422:
        return "validation_error"
    return "http_error"


async def apiErrorHandler(request: Request, error: ApiError) -> JSONResponse:
    logger = getServerLogger()
    logger.warning(
        "api-error %s",
        formatLogFields(
            method=request.method,
            path=request.url.path,
            status=error.statusCode,
            code=error.code,
            message=error.message,
        ),
    )
    return JSONResponse(
        status_code=error.statusCode,
        content=buildErrorBody(error.code, error.message),
    )


async def httpExceptionHandler(request: Request, error: HTTPException) -> JSONResponse:
    code, message = normalizeHttpDetail(error.status_code, error.detail)
    logger = getServerLogger()
    logger.warning(
        "http-error %s",
        formatLogFields(
            method=request.method,
            path=request.url.path,
            status=error.status_code,
            code=code,
            message=message,
        ),
    )
    return JSONResponse(
        status_code=error.status_code,
        content=buildErrorBody(code, message),
    )


async def validationExceptionHandler(request: Request, error: RequestValidationError) -> JSONResponse:
    firstError = error.errors()[0] if error.errors() else {}
    message = str(firstError.get("msg", "Invalid request."))
    logger = getServerLogger()
    logger.warning(
        "validation-error %s",
        formatLogFields(
            method=request.method,
            path=request.url.path,
            status=422,
            code="validation_error",
            message=message,
        ),
    )
    return JSONResponse(
        status_code=422,
        content=buildErrorBody("validation_error", message),
    )


async def unhandledExceptionHandler(request: Request, error: Exception) -> JSONResponse:
    logger = getServerLogger()
    logger.exception(
        "unhandled-error %s",
        formatLogFields(
            method=request.method,
            path=request.url.path,
            status=500,
            code="internal_error",
            message=str(error),
        ),
    )
    return JSONResponse(
        status_code=500,
        content=buildErrorBody("internal_error", "Internal server error."),
    )
