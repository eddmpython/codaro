from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class ProviderErrorDiagnostic:
    code: str
    message: str
    action: str
    provider: str | None = None
    detail: str = ""
    recoverable: bool = True
    statusCode: int = 503

    def payload(self) -> dict[str, Any]:
        data: dict[str, Any] = {
            "code": self.code,
            "message": self.message,
            "action": self.action,
            "recoverable": self.recoverable,
            "statusCode": self.statusCode,
        }
        if self.provider:
            data["provider"] = self.provider
        if self.detail:
            data["detail"] = self.detail
        return data


class ProviderRuntimeError(Exception):
    def __init__(
        self,
        message: str,
        *,
        action: str = "unknown",
        provider: str | None = None,
        detail: str = "",
        code: str | None = None,
        statusCode: int = 503,
        recoverable: bool = True,
    ) -> None:
        self.action = action
        self.provider = provider
        self.detail = detail
        self.code = code
        self.statusCode = statusCode
        self.recoverable = recoverable
        super().__init__(message)


_ACTION_DIAGNOSTICS = {
    "login": (
        "provider_login_required",
        "connect-provider",
        "Provider 로그인이 필요합니다. Provider 설정에서 브라우저 로그인을 완료하세요.",
        True,
    ),
    "relogin": (
        "provider_relogin_required",
        "relogin-provider",
        "로그인 세션이 만료되었습니다. Provider 설정에서 다시 로그인하세요.",
        True,
    ),
    "no_token": (
        "provider_login_required",
        "connect-provider",
        "Provider 로그인이 필요합니다. Provider 설정에서 브라우저 로그인을 완료하세요.",
        True,
    ),
    "expired": (
        "provider_relogin_required",
        "relogin-provider",
        "로그인 세션이 만료되었습니다. Provider 설정에서 다시 로그인하세요.",
        True,
    ),
    "reused": (
        "provider_relogin_required",
        "relogin-provider",
        "로그인 세션을 다시 사용할 수 없습니다. Provider 설정에서 다시 로그인하세요.",
        True,
    ),
    "revoked": (
        "provider_relogin_required",
        "relogin-provider",
        "로그인 권한이 해제되었습니다. Provider 설정에서 다시 로그인하세요.",
        True,
    ),
    "network": (
        "provider_network_error",
        "check-network",
        "Provider 서버에 연결하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도하세요.",
        True,
    ),
    "permission": (
        "provider_permission_denied",
        "check-permission",
        "Provider 권한이 허용되지 않았습니다. Provider 설정에서 권한을 확인한 뒤 다시 시도하세요.",
        True,
    ),
    "rate_limit": (
        "provider_rate_limited",
        "retry-later",
        "Provider 요청 한도가 초과되었습니다. 잠시 후 다시 시도하세요.",
        True,
    ),
    "api_key_missing": (
        "provider_credential_missing",
        "configure-api-key",
        "Provider API 키가 필요합니다. Provider 설정에서 키를 저장한 뒤 다시 검증하세요.",
        True,
    ),
    "base_url_missing": (
        "provider_base_url_missing",
        "configure-base-url",
        "호환 provider 서버 주소가 필요합니다. Provider 설정에서 base URL을 입력하세요.",
        True,
    ),
    "unavailable": (
        "provider_unavailable",
        "check-provider",
        "Provider에 연결하지 못했습니다. 설정과 서버 상태를 확인하세요.",
        True,
    ),
    "empty_response": (
        "provider_empty_response",
        "check-provider",
        "Provider 검증 응답이 비어 있습니다. 모델과 endpoint 설정을 확인하세요.",
        True,
    ),
    "check_client_id": (
        "provider_compatibility_error",
        "check-provider-compatibility",
        "OAuth provider 호환성 점검이 필요합니다. 외부 인증 설정이 바뀌었을 수 있습니다.",
        False,
    ),
    "check_headers": (
        "provider_compatibility_error",
        "check-provider-compatibility",
        "OAuth provider 호환성 점검이 필요합니다. 요청 헤더 정책이 바뀌었을 수 있습니다.",
        False,
    ),
    "check_endpoint": (
        "provider_compatibility_error",
        "check-provider-compatibility",
        "OAuth provider 호환성 점검이 필요합니다. 외부 endpoint가 바뀌었을 수 있습니다.",
        False,
    ),
    "check_sse": (
        "provider_compatibility_error",
        "check-provider-compatibility",
        "Provider 응답 형식이 바뀌었을 수 있습니다. live provider 경로를 점검하세요.",
        False,
    ),
}


def providerErrorDiagnostic(
    exc: BaseException,
    *,
    provider: str | None = None,
    statusCode: int = 503,
) -> ProviderErrorDiagnostic:
    action = str(getattr(exc, "action", "") or getattr(exc, "reason", "") or "unknown")
    code, nextAction, message, recoverable = _ACTION_DIAGNOSTICS.get(
        action,
        (
            "provider_unavailable",
            "check-provider",
            str(exc) or "Provider 응답 처리 중 문제가 발생했습니다.",
            True,
        ),
    )
    explicitCode = getattr(exc, "code", None)
    explicitStatus = getattr(exc, "statusCode", None)
    explicitRecoverable = getattr(exc, "recoverable", None)
    detail = safeProviderDetail(str(getattr(exc, "detail", "") or str(exc) or ""))
    return ProviderErrorDiagnostic(
        code=str(explicitCode or code),
        message=message,
        action=nextAction,
        provider=str(provider or getattr(exc, "provider", "") or "") or None,
        detail=detail,
        recoverable=bool(recoverable if explicitRecoverable is None else explicitRecoverable),
        statusCode=int(explicitStatus or statusCode),
    )


def providerErrorPayload(exc: BaseException, *, provider: str | None = None) -> dict[str, Any]:
    return providerErrorDiagnostic(exc, provider=provider).payload()


def safeProviderDetail(value: str, *, limit: int = 500) -> str:
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
