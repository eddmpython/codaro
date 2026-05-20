from __future__ import annotations

import logging
import os
from collections.abc import Callable, Mapping
from typing import Any

from .factory import createProvider
from .providerSpec import normalizeProvider
from .types import LLMConfig

logger = logging.getLogger(__name__)

PROVIDER_MODEL_ERRORS = (
    AttributeError,
    ConnectionError,
    FileNotFoundError,
    ImportError,
    OSError,
    PermissionError,
    RuntimeError,
    TypeError,
    ValueError,
)

DEFAULT_OPENAI_CHAT_MODELS: tuple[str, ...] = (
    "o3",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "o4-mini",
    "gpt-4o",
    "gpt-4o-mini",
)

OPENAI_CHAT_MODEL_PREFIXES: tuple[str, ...] = ("gpt-5", "gpt-4", "gpt-3.5", "o1", "o3", "o4")

OPENAI_MODEL_EXCLUDES: tuple[str, ...] = (
    "realtime",
    "audio",
    "search",
    "instruct",
    "embedding",
    "tts",
    "whisper",
    "dall-e",
    "davinci",
    "babbage",
    "transcribe",
)

OPENAI_MODEL_PRIORITY: tuple[str, ...] = (
    "gpt-5.4",
    "gpt-5.3",
    "gpt-5.2",
    "gpt-5.1",
    "gpt-5",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "gpt-4o",
    "gpt-4o-mini",
    "o4-mini",
    "o3",
    "o3-mini",
    "o1",
    "o1-mini",
)


def providerModelList(
    provider: str,
    *,
    profileManager: Any,
    providerFactory: Callable[[LLMConfig], Any] = createProvider,
    openaiModelFetcher: Callable[[Any], list[str]] | None = None,
) -> list[str]:
    normalized = normalizeProvider(provider) or provider

    if normalized == "oauth-chatgpt":
        from .providers.oauthChatgptProvider import AVAILABLE_MODELS

        return list(AVAILABLE_MODELS)

    if normalized == "ollama":
        try:
            return list(providerFactory(LLMConfig(provider="ollama")).getInstalledModels())
        except PROVIDER_MODEL_ERRORS as exc:
            logger.info("ollama models unavailable: %s", exc)
            return []

    if normalized == "openai":
        try:
            models = (openaiModelFetcher or fetchOpenaiChatModels)(profileManager)
        except PROVIDER_MODEL_ERRORS as exc:
            logger.info("openai models unavailable: %s", exc)
            models = []
        return models or list(DEFAULT_OPENAI_CHAT_MODELS)

    return []


def fetchOpenaiChatModels(profileManager: Any, env: Mapping[str, str] | None = None) -> list[str]:
    resolved = profileManager.resolve(provider="openai")
    apiKey = resolved.get("apiKey") or (env or os.environ).get("OPENAI_API_KEY")
    if not apiKey:
        return []

    from openai import OpenAI

    client = OpenAI(api_key=apiKey)
    rawModels = client.models.list()
    return filterOpenaiChatModelIds(model.id for model in rawModels)


def filterOpenaiChatModelIds(modelIds: Any) -> list[str]:
    models = [
        modelId
        for modelId in modelIds
        if isinstance(modelId, str)
        and any(modelId.startswith(prefix) for prefix in OPENAI_CHAT_MODEL_PREFIXES)
        and not any(excluded in modelId for excluded in OPENAI_MODEL_EXCLUDES)
    ]
    models.sort(key=_openaiModelSortKey)
    return models


def _openaiModelSortKey(name: str) -> tuple[int, str]:
    for idx, prefix in enumerate(OPENAI_MODEL_PRIORITY):
        if name == prefix or name.startswith(prefix + "-"):
            return (idx, name)
    return (100, name)
