from __future__ import annotations

import logging
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from .factory import createProvider
from .providerErrors import ProviderRuntimeError, providerErrorDiagnostic
from .providers.oauthChatgptProvider import ChatGPTOAuthError
from .providerSpec import normalizeProvider
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
    return LLMConfig(
        provider=normalized,
        model=model or resolved.get("model"),
        apiKey=resolved.get("apiKey"),
        baseUrl=resolved.get("baseUrl"),
    )


def validateProviderConnection(
    *,
    provider: str,
    model: str | None = None,
    profileManager: Any,
    providerFactory: Callable[[LLMConfig], Any] = createProvider,
) -> ProviderValidationResult:
    try:
        config = providerValidationConfig(provider, model, profileManager)
        resolvedProvider = providerFactory(config)
        available = bool(resolvedProvider.checkAvailable())
        return ProviderValidationResult(valid=available, model=resolvedProvider.resolvedModel)
    except PROVIDER_VALIDATION_ERRORS as exc:
        diagnostic = providerErrorDiagnostic(exc, provider=normalizeProvider(provider) or provider)
        logger.info("provider validation unavailable: %s", diagnostic.message)
        return ProviderValidationResult(
            valid=False,
            error=diagnostic.message,
            diagnostic=diagnostic.payload(),
        )
