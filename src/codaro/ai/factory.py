from __future__ import annotations

import importlib
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .baseProvider import BaseProvider
    from .types import LLMConfig

_PROVIDER_MAP: dict[str, str] = {
    "openai": "codaro.ai.providers.openaiProvider.OpenAIProvider",
    "ollama": "codaro.ai.providers.ollamaProvider.OllamaProvider",
    "custom": "codaro.ai.providers.customProvider.CustomProvider",
    "oauth-chatgpt": "codaro.ai.providers.oauthChatgptProvider.OAuthChatGPTProvider",
}


def createProvider(config: "LLMConfig") -> "BaseProvider":
    classPath = _PROVIDER_MAP.get(config.provider)
    if classPath is None:
        supported = list(_PROVIDER_MAP.keys())
        raise ValueError(f"Unsupported provider: '{config.provider}'. Supported: {supported}")
    modulePath, className = classPath.rsplit(".", 1)
    mod = importlib.import_module(modulePath)
    cls = getattr(mod, className)
    return cls(config)


def registerProvider(name: str, classPath: str) -> None:
    _PROVIDER_MAP[name] = classPath


def availableProviders() -> list[str]:
    return list(_PROVIDER_MAP.keys())
