from __future__ import annotations

import shutil
from pathlib import Path
from typing import Any

from ..ai.profile import getProfileManager
from . import packageOps
from .diagnosticSummary import (
    DiagnosticItem,
    buildDiagnosticExport,
    buildDiagnosticSummary,
    frontendDiagnosticItem,
    packageDiagnosticItem,
    providerDiagnosticItem,
    runtimeDiagnosticItem,
)
from .packageOps import PackageEnvironmentError


def buildLocalDiagnosticSummary(state: Any) -> dict[str, Any]:
    items: list[DiagnosticItem] = []
    items.extend(providerDiagnostics(getProfileManager().serialize()))
    items.extend(packageDiagnostics())
    items.extend(runtimeDiagnostics(state))
    items.extend(frontendDiagnostics(state.webBuildRoot))
    return buildDiagnosticSummary(items)


def buildLocalDiagnosticExport(state: Any) -> dict[str, Any]:
    summary = buildLocalDiagnosticSummary(state)
    return buildDiagnosticExport(summary, context=diagnosticExportContext(state))


def diagnosticExportContext(state: Any) -> dict[str, Any]:
    profile = getProfileManager().serialize()
    activeProvider = str(profile.get("activeProvider") or profile.get("defaultProvider") or "")
    catalog = catalogById(profile.get("catalog"))
    providers = profile.get("providers") if isinstance(profile.get("providers"), dict) else {}
    runtime = providers.get(activeProvider) if isinstance(providers.get(activeProvider), dict) else {}
    spec = catalog.get(activeProvider, {})
    projectPython: str | None = None
    packageEnvironmentReady = True
    try:
        projectPython = packageOps.getProjectPythonPath().as_posix()
    except PackageEnvironmentError:
        packageEnvironmentReady = False

    return {
        "app": {
            "mode": state.mode,
            "documentPath": state.documentPath.as_posix() if state.documentPath else None,
            "workspaceRoot": state.workspaceRoot.as_posix(),
            "studyRootExists": state.studyRoot.exists(),
        },
        "provider": {
            "activeProvider": activeProvider or None,
            "ready": profile.get("ready") is True,
            "authKind": spec.get("authKind"),
            "secretConfigured": runtime.get("secretConfigured"),
        },
        "runtime": {
            "engineStatus": getattr(state.workspaceEngine, "status", "unknown"),
            "sessionCount": state.sessionManager.sessionCount,
            "executionCount": getattr(state.workspaceEngine, "executionCount", None),
        },
        "package": {
            "installer": "uv",
            "uvExecutableFound": shutil.which("uv") is not None,
            "projectEnvironmentReady": packageEnvironmentReady,
            "projectPython": projectPython,
        },
        "frontend": {
            "webBuildRoot": state.webBuildRoot.as_posix(),
            "indexHtmlFound": (state.webBuildRoot / "index.html").is_file(),
            "assetsDirFound": (state.webBuildRoot / "_app").is_dir(),
        },
    }


def providerDiagnostics(profile: dict[str, Any]) -> list[DiagnosticItem]:
    if profile.get("ready") is True:
        return []

    provider = str(profile.get("activeProvider") or profile.get("defaultProvider") or "provider")
    catalog = catalogById(profile.get("catalog"))
    providers = profile.get("providers") if isinstance(profile.get("providers"), dict) else {}
    runtime = providers.get(provider) if isinstance(providers.get(provider), dict) else {}
    spec = catalog.get(provider, {})
    authKind = str(spec.get("authKind") or "")

    action = "connect-provider"
    message = "Provider가 아직 실제 응답 사용 상태가 아닙니다."
    if authKind == "api_key":
        action = "configure-api-key"
        if provider == "custom" and not runtime.get("baseUrl"):
            action = "configure-base-url"
            message = "Custom provider Base URL이 필요합니다."
        else:
            message = "Provider API 키가 필요합니다."
    elif authKind == "oauth":
        message = "브라우저 로그인 후 실제 provider 응답을 사용할 수 있습니다."
    elif authKind == "none":
        action = "check-provider"
        message = "Provider 상태를 다시 확인해야 합니다."

    return [
        providerDiagnosticItem(
            code="provider_not_connected",
            message=message,
            action=action,
            metadata={
                "provider": provider,
                "authKind": authKind or None,
                "secretConfigured": runtime.get("secretConfigured"),
            },
        )
    ]


def packageDiagnostics() -> list[DiagnosticItem]:
    items: list[DiagnosticItem] = []
    if shutil.which("uv") is None:
        items.append(
            packageDiagnosticItem(
                code="uv-missing",
                message="uv 실행 파일을 찾지 못했습니다.",
                action="install-uv",
            )
        )
    try:
        packageOps.getProjectPythonPath()
    except PackageEnvironmentError as error:
        items.append(
            packageDiagnosticItem(
                code=error.code,
                message=error.message,
                action="create-project-venv",
                detail=error.message,
            )
        )
    return items


def runtimeDiagnostics(state: Any) -> list[DiagnosticItem]:
    status = str(getattr(state.workspaceEngine, "status", "unknown"))
    if status in {"idle", "busy", "ready"}:
        return []
    return [
        runtimeDiagnosticItem(
            code="runtime-status-unhealthy",
            message="Runtime engine 상태를 확인해야 합니다.",
            action="restart-runtime",
            metadata={"status": status, "activeSessions": state.sessionManager.sessionCount},
        )
    ]


def frontendDiagnostics(webBuildRoot: Path) -> list[DiagnosticItem]:
    missing = [
        path
        for path in (webBuildRoot / "index.html", webBuildRoot / "_app")
        if not (path.is_file() if path.name == "index.html" else path.is_dir())
    ]
    if not missing:
        return []
    return [
        frontendDiagnosticItem(
            code="editor-build-missing",
            message="Editor build 산출물이 없습니다.",
            action="build-editor",
            detail=", ".join(path.as_posix() for path in missing),
            metadata={"webBuildRoot": webBuildRoot.as_posix(), "missing": [path.as_posix() for path in missing]},
        )
    ]


def catalogById(catalog: Any) -> dict[str, dict[str, Any]]:
    if isinstance(catalog, dict):
        return {
            str(key): value
            for key, value in catalog.items()
            if isinstance(value, dict)
        }
    if isinstance(catalog, list):
        return {
            str(item.get("id")): item
            for item in catalog
            if isinstance(item, dict) and item.get("id")
        }
    return {}
