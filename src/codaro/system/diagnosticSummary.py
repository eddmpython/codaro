from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from typing import Any, Literal


DiagnosticCategory = Literal["provider", "runtime", "package", "frontend"]
DiagnosticSeverity = Literal["info", "warning", "error"]

DIAGNOSTIC_CATEGORIES: tuple[DiagnosticCategory, ...] = ("provider", "runtime", "package", "frontend")
SECRET_KEYS = ("token", "apiKey", "api_key", "secret", "password", "authorization")


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

    return {
        "version": 1,
        "status": "needs-action" if payloadItems else "ok",
        "items": payloadItems,
        "categories": counts,
        "nextActions": actions,
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


def safeDiagnosticValue(value: Any) -> Any:
    if isinstance(value, str):
        return safeDiagnosticText(value)
    if isinstance(value, dict):
        redacted: dict[str, Any] = {}
        for key, item in value.items():
            textKey = str(key)
            if _isSecretKey(textKey):
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
