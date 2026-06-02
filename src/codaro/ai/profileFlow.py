from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Any

from .profile import getProfileManager
from .profileEvents import streamProfileChangeEvents
from .profileMutation import (
    ProfileMutationError,
    ProviderProfileUpdate,
    ProviderSecretUpdate,
    updateProviderProfile,
    updateProviderSecret,
)
from .providerModels import providerModelList
from .providerSpec import buildProviderCatalog
from .providerValidation import validateProviderConnection

ProfileFlowError = ProfileMutationError


def buildProviderCatalogPayload() -> dict[str, Any]:
    return {"catalog": buildProviderCatalog()}


def buildProviderProfilePayload() -> dict[str, Any]:
    return getProfileManager().serialize()


def buildProviderToolsPayload() -> dict[str, Any]:
    from .tools import toolManifest

    return toolManifest()


def updateProviderProfilePayload(
    *,
    provider: str | None,
    model: str | None,
    role: str | None,
    baseUrl: str | None,
    temperature: float | None,
    maxTokens: int | None,
    systemPrompt: str | None,
) -> dict[str, Any]:
    return updateProviderProfile(
        getProfileManager(),
        ProviderProfileUpdate(
            provider=provider,
            model=model,
            role=role,
            baseUrl=baseUrl,
            temperature=temperature,
            maxTokens=maxTokens,
            systemPrompt=systemPrompt,
        ),
    )


def updateProviderSecretPayload(
    *,
    provider: str,
    apiKey: str | None,
    clear: bool,
) -> dict[str, Any]:
    return updateProviderSecret(
        getProfileManager(),
        ProviderSecretUpdate(provider=provider, apiKey=apiKey, clear=clear),
    )


def validateProviderConnectionPayload(
    *,
    provider: str,
    model: str | None,
    probe: str,
) -> dict[str, Any]:
    return validateProviderConnection(
        provider=provider,
        model=model,
        probe=probe,
        profileManager=getProfileManager(),
    ).payload()


def buildProviderModelsPayload(provider: str) -> dict[str, Any]:
    return {"models": providerModelList(provider, profileManager=getProfileManager())}


def streamProviderProfileEvents(*, isDisconnected: Callable[[], Awaitable[bool]]) -> Any:
    return streamProfileChangeEvents(
        manager=getProfileManager(),
        isDisconnected=isDisconnected,
    )
