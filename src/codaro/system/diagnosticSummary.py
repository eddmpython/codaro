from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any, Literal

from codaro.generatedContracts import ARTIFACT_OWNERSHIP_CONTRACT_SHA256


DiagnosticCategory = Literal["provider", "runtime", "package", "frontend"]
DiagnosticSeverity = Literal["info", "warning", "error"]

DIAGNOSTIC_CATEGORIES: tuple[DiagnosticCategory, ...] = ("provider", "runtime", "package", "frontend")
SECRET_KEYS = ("token", "apiKey", "api_key", "secret", "password", "authorization")
CATEGORY_LABELS: dict[DiagnosticCategory, str] = {
    "provider": "Provider",
    "runtime": "Runtime",
    "package": "패키지",
    "frontend": "Frontend",
}
ACTION_LABELS = {
    "build-editor": "Editor 빌드",
    "check-network": "네트워크 점검",
    "check-permission": "권한 확인",
    "check-provider": "Provider 확인",
    "check-provider-compatibility": "OAuth 호환성 점검",
    "configure-api-key": "API 키 입력",
    "configure-base-url": "Base URL 입력",
    "connect-provider": "Provider 연결",
    "create-project-venv": ".venv 준비",
    "install-uv": "uv 설치",
    "relogin-provider": "Provider 다시 로그인",
    "restart-login": "로그인 다시 시작",
    "restart-runtime": "Runtime 재시작",
    "retry-later": "잠시 후 재시도",
    "retry-package-install": "라이브러리 설치 재시도",
    "reload-editor": "Editor 새로고침",
}


@dataclass(frozen=True)
class DiagnosticItem:
    category: DiagnosticCategory
    code: str
    message: str
    action: str
    detail: str = ""
    severity: DiagnosticSeverity = "error"
    recoverable: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)

    def payload(self) -> dict[str, Any]:
        data: dict[str, Any] = {
            "category": self.category,
            "code": safeDiagnosticText(self.code),
            "message": safeDiagnosticText(self.message),
            "action": safeDiagnosticText(self.action),
            "severity": self.severity,
            "recoverable": self.recoverable,
        }
        if self.detail:
            data["detail"] = safeDiagnosticText(self.detail)
        if self.metadata:
            data["metadata"] = safeDiagnosticValue(self.metadata)
        return data


def buildDiagnosticSummary(items: list[DiagnosticItem] | tuple[DiagnosticItem, ...]) -> dict[str, Any]:
    payloadItems = [item.payload() for item in items]
    counts = {category: 0 for category in DIAGNOSTIC_CATEGORIES}
    for item in payloadItems:
        category = item.get("category")
        if category in counts:
            counts[category] += 1

    actions: list[str] = []
    seenActions: set[str] = set()
    for item in payloadItems:
        action = str(item.get("action") or "")
        if action and action not in seenActions:
            seenActions.add(action)
            actions.append(action)

    readableActions = [readableDiagnosticAction(action) for action in actions]
    return {
        "version": 1,
        "status": "needs-action" if payloadItems else "ok",
        "items": payloadItems,
        "categories": counts,
        "nextActions": actions,
        "readableActions": readableActions,
        "summaryText": readableDiagnosticSummaryText(payloadItems, counts, readableActions),
    }


def buildDiagnosticExport(
    summary: dict[str, Any],
    *,
    context: dict[str, Any] | None = None,
    generatedAt: str | None = None,
) -> dict[str, Any]:
    safeSummary = safeDiagnosticValue(summary)
    return {
        "version": 1,
        "kind": "codaro-local-diagnostic-export",
        "generatedAt": generatedAt or datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        "status": safeDiagnosticText(str(safeSummary.get("status") or "unknown")),
        "summaryText": safeDiagnosticText(str(safeSummary.get("summaryText") or "")),
        "readableActions": safeDiagnosticValue(safeSummary.get("readableActions") or []),
        "categories": safeDiagnosticValue(safeSummary.get("categories") or {}),
        "items": safeDiagnosticValue(safeSummary.get("items") or []),
        "summary": safeSummary,
        "context": safeDiagnosticValue(context or {}),
        "contractHashes": {
            "artifactOwnership": ARTIFACT_OWNERSHIP_CONTRACT_SHA256,
        },
        "redaction": {
            "secrets": "redacted",
            "policy": "token/apiKey/secret/authorization/oauth/sk values are removed",
        },
    }


def itemFromProviderDiagnostic(diagnostic: dict[str, Any]) -> DiagnosticItem:
    return DiagnosticItem(
        category="provider",
        code=str(diagnostic.get("code") or "provider_unavailable"),
        message=str(diagnostic.get("message") or "Provider 상태를 확인해야 합니다."),
        action=str(diagnostic.get("action") or "check-provider"),
        detail=str(diagnostic.get("detail") or ""),
        recoverable=bool(diagnostic.get("recoverable", True)),
        metadata={"provider": diagnostic.get("provider"), "statusCode": diagnostic.get("statusCode")},
    )


def providerDiagnosticItem(
    *,
    code: str,
    message: str,
    action: str,
    detail: str = "",
    metadata: dict[str, Any] | None = None,
) -> DiagnosticItem:
    return DiagnosticItem(
        category="provider",
        code=code,
        message=message,
        action=action,
        detail=detail,
        metadata=metadata or {},
    )


def runtimeDiagnosticItem(*, code: str, message: str, action: str, detail: str = "", metadata: dict[str, Any] | None = None) -> DiagnosticItem:
    return DiagnosticItem(
        category="runtime",
        code=code,
        message=message,
        action=action,
        detail=detail,
        metadata=metadata or {},
    )


def packageDiagnosticItem(*, code: str, message: str, action: str, detail: str = "", metadata: dict[str, Any] | None = None) -> DiagnosticItem:
    return DiagnosticItem(
        category="package",
        code=code,
        message=message,
        action=action,
        detail=detail,
        metadata=metadata or {},
    )


def frontendDiagnosticItem(*, code: str, message: str, action: str, detail: str = "", metadata: dict[str, Any] | None = None) -> DiagnosticItem:
    return DiagnosticItem(
        category="frontend",
        code=code,
        message=message,
        action=action,
        detail=detail,
        metadata=metadata or {},
    )


def readableDiagnosticAction(action: str) -> str:
    return ACTION_LABELS.get(action, action)


def readableDiagnosticSummaryText(
    payloadItems: list[dict[str, Any]],
    counts: dict[DiagnosticCategory, int],
    readableActions: list[str],
) -> str:
    if not payloadItems:
        return "진단 정상"

    categories = ", ".join(
        f"{CATEGORY_LABELS[category]} {count}"
        for category, count in counts.items()
        if count > 0
    )
    messages = [str(item.get("message") or "") for item in payloadItems[:2]]
    hiddenCount = max(0, len(payloadItems) - len(messages))
    issueText = " · ".join(message for message in messages if message)
    if hiddenCount:
        issueText = f"{issueText} 외 {hiddenCount}건" if issueText else f"{hiddenCount}건"
    actionText = ", ".join(readableActions[:3])
    parts = [
        categories,
        issueText,
        f"다음: {actionText}" if actionText else "",
    ]
    return safeDiagnosticText(" · ".join(part for part in parts if part), limit=700)


def safeDiagnosticValue(value: Any) -> Any:
    if isinstance(value, str):
        return safeDiagnosticText(value)
    if isinstance(value, dict):
        redacted: dict[str, Any] = {}
        for key, item in value.items():
            textKey = str(key)
            if _isSecretKey(textKey) and not _isSafeSecretState(textKey, item):
                redacted[textKey] = "[redacted]"
            else:
                redacted[textKey] = safeDiagnosticValue(item)
        return redacted
    if isinstance(value, list):
        return [safeDiagnosticValue(item) for item in value]
    if isinstance(value, tuple):
        return [safeDiagnosticValue(item) for item in value]
    return value


def safeDiagnosticText(value: str, *, limit: int = 500) -> str:
    text = value
    for envName in ("OPENAI_API_KEY", "CODARO_LLM_API_KEY"):
        secret = os.environ.get(envName)
        if secret:
            text = text.replace(secret, "[redacted]")
    text = re.sub(r"Bearer\s+[A-Za-z0-9._~+/=-]+", "Bearer [redacted]", text)
    text = re.sub(r"sk-[A-Za-z0-9_-]{12,}", "sk-[redacted]", text)
    text = re.sub(r'"access_token"\s*:\s*"[^"]+"', '"access_token":"[redacted]"', text)
    text = re.sub(r'"refresh_token"\s*:\s*"[^"]+"', '"refresh_token":"[redacted]"', text)
    return text[:limit]


def _isSecretKey(key: str) -> bool:
    normalized = key.replace("-", "_").lower()
    return any(secretKey.lower() in normalized for secretKey in SECRET_KEYS)


def _isSafeSecretState(key: str, value: Any) -> bool:
    normalized = key.replace("-", "_").lower()
    return normalized in {"secretconfigured", "secret_configured"} and isinstance(value, bool)
