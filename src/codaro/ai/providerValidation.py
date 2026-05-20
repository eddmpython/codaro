from __future__ import annotations

import logging
import os
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from .factory import createProvider
from .providerErrors import ProviderRuntimeError, providerErrorDiagnostic
from .providers.oauthChatgptProvider import ChatGPTOAuthError
from .providerSpec import getProviderSpec, normalizeProvider
from .types import LLMConfig

logger = logging.getLogger(__name__)

PROVIDER_VALIDATION_ERRORS = (
    AttributeError,
    ChatGPTOAuthError,
    ProviderRuntimeError,
    ConnectionError,
    FileNotFoundError,
    ImportError,
    OSError,
    PermissionError,
    RuntimeError,
    TypeError,
    ValueError,
)

VALIDATION_PROBES = ("availability", "response")
VALIDATION_MESSAGES = [
    {
        "role": "system",
        "content": "You are Codaro provider validation. Reply with one short Korean sentence.",
    },
    {
        "role": "user",
        "content": "Codaro provider 검증입니다. 한국어 한 문장으로만 답하세요.",
    },
]


@dataclass(frozen=True)
class ProviderValidationResult:
    valid: bool
    model: str | None = None
    error: str | None = None
    diagnostic: dict[str, Any] | None = None

    def payload(self) -> dict[str, Any]:
        data: dict[str, Any] = {"valid": self.valid}
        if self.model is not None:
            data["model"] = self.model
        if self.error is not None:
            data["error"] = self.error
        if self.diagnostic is not None:
            data["diagnostic"] = self.diagnostic
        return data


def providerValidationConfig(provider: str, model: str | None, profileManager: Any) -> LLMConfig:
    normalized = normalizeProvider(provider) or provider
    resolved = profileManager.resolve(provider=normalized)
    spec = getProviderSpec(normalized)
    apiKey = resolved.get("apiKey")
    if not apiKey and spec and spec.envKey:
        apiKey = os.environ.get(spec.envKey)
    return LLMConfig(
        provider=normalized,
        model=model or resolved.get("model"),
        apiKey=apiKey,
        baseUrl=resolved.get("baseUrl"),
        temperature=0,
        maxTokens=64,
    )


def validateProviderConnection(
    *,
    provider: str,
    model: str | None = None,
    probe: str = "availability",
    profileManager: Any,
    providerFactory: Callable[[LLMConfig], Any] = createProvider,
) -> ProviderValidationResult:
    normalized = normalizeProvider(provider) or provider
    try:
        normalizedProbe = normalizeValidationProbe(probe)
        config = providerValidationConfig(provider, model, profileManager)
        prerequisiteError = providerPrerequisiteError(config)
        if prerequisiteError is not None:
            raise prerequisiteError
        resolvedProvider = providerFactory(config)
        available = bool(resolvedProvider.checkAvailable())
        if not available:
            raise ProviderRuntimeError(
                "provider checkAvailable returned false",
                action="unavailable",
                provider=config.provider,
            )
        if normalizedProbe == "response":
            response = resolvedProvider.complete(VALIDATION_MESSAGES)
            if not response.answer.strip():
                raise ProviderRuntimeError(
                    "provider validation response was empty",
                    action="empty_response",
                    provider=config.provider,
                )
        return ProviderValidationResult(valid=available, model=resolvedProvider.resolvedModel)
    except PROVIDER_VALIDATION_ERRORS as exc:
        diagnostic = providerErrorDiagnostic(exc, provider=normalized)
        logger.info("provider validation unavailable: %s", diagnostic.message)
        return ProviderValidationResult(
            valid=False,
            error=diagnostic.message,
            diagnostic=diagnostic.payload(),
        )


def normalizeValidationProbe(probe: str | None) -> str:
    normalized = (probe or "availability").strip().lower()
    if normalized in VALIDATION_PROBES:
        return normalized
    return "availability"


def providerPrerequisiteError(config: LLMConfig) -> ProviderRuntimeError | None:
    spec = getProviderSpec(config.provider)
    if spec is None:
        return ProviderRuntimeError(
            f"Unsupported provider: {config.provider}",
            action="unavailable",
            provider=config.provider,
        )
    if spec.authKind != "api_key":
        return None
    if config.provider == "custom" and not config.baseUrl:
        return ProviderRuntimeError(
            "Custom provider requires a base URL.",
            action="base_url_missing",
            provider=config.provider,
        )
    if not config.apiKey:
        return ProviderRuntimeError(
            f"{spec.envKey or 'provider API key'} is missing.",
            action="api_key_missing",
            provider=config.provider,
        )
    return None
