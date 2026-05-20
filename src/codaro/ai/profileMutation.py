from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .profile import AiProfileManager
from .providerSpec import getProviderSpec, normalizeProvider


@dataclass(frozen=True)
class ProfileMutationError(ValueError):
    message: str

    def __str__(self) -> str:
        return self.message


@dataclass(frozen=True)
class ProviderProfileUpdate:
    provider: str | None = None
    model: str | None = None
    role: str | None = None
    baseUrl: str | None = None
    temperature: float | None = None
    maxTokens: int | None = None
    systemPrompt: str | None = None


@dataclass(frozen=True)
class ProviderSecretUpdate:
    provider: str
    apiKey: str | None = None
    clear: bool = False


def updateProviderProfile(
    manager: AiProfileManager,
    request: ProviderProfileUpdate,
    *,
    updatedBy: str = "ui",
) -> dict[str, Any]:
    provider = _supportedProvider(request.provider)
    try:
        profile = manager.update(
            provider=provider,
            role=request.role,
            model=request.model,
            baseUrl=request.baseUrl,
            temperature=request.temperature,
            maxTokens=request.maxTokens,
            systemPrompt=request.systemPrompt,
            updatedBy=updatedBy,
        )
    except ValueError as exc:
        raise ProfileMutationError(str(exc)) from exc
    return manager.serialize() | {"revision": profile.revision}


def updateProviderSecret(
    manager: AiProfileManager,
    request: ProviderSecretUpdate,
    *,
    updatedBy: str = "ui",
) -> dict[str, Any]:
    provider = _requiredApiKeyProvider(request.provider)
    try:
        if request.clear or not request.apiKey:
            profile = manager.clearApiKey(provider, updatedBy=updatedBy)
        else:
            profile = manager.saveApiKey(provider, request.apiKey, updatedBy=updatedBy)
    except ValueError as exc:
        raise ProfileMutationError(str(exc)) from exc
    return manager.serialize() | {"revision": profile.revision}


def _supportedProvider(provider: str | None) -> str | None:
    if provider is None:
        return None
    normalized = normalizeProvider(provider) or provider
    if getProviderSpec(normalized) is None:
        raise ProfileMutationError(f"Unsupported provider: {normalized}")
    return normalized


def _requiredApiKeyProvider(provider: str) -> str:
    normalized = normalizeProvider(provider) or provider
    spec = getProviderSpec(normalized)
    if spec is None:
        raise ProfileMutationError(f"Unsupported provider: {normalized}")
    if spec.authKind != "api_key":
        raise ProfileMutationError(f"{normalized} provider does not use API key secrets")
    return normalized
