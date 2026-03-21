from __future__ import annotations

from dataclasses import dataclass

AI_ROLES = ("teacher", "copilot", "automation")
DEFAULT_ROLE = "copilot"


def normalizeRole(role: str | None) -> str | None:
    if role is None:
        return None
    normalized = role.strip().lower()
    return normalized if normalized in AI_ROLES else None


@dataclass(frozen=True)
class ProviderSpec:
    id: str
    label: str
    description: str
    authKind: str
    public: bool = True
    setupKind: str = "runtime"
    envKey: str | None = None
    probePolicy: str = "on_demand"
    supportedRoles: tuple[str, ...] = AI_ROLES


_PROVIDERS: dict[str, ProviderSpec] = {
    "oauth-chatgpt": ProviderSpec(
        id="oauth-chatgpt",
        label="GPT (ChatGPT subscription)",
        description="Browser OAuth login, recommended for AI-assisted learning and analysis",
        authKind="oauth",
        setupKind="oauth",
        probePolicy="selected_only",
    ),
    "ollama": ProviderSpec(
        id="ollama",
        label="Ollama (local)",
        description="Free, offline, private",
        authKind="none",
        setupKind="local",
        probePolicy="selected_only",
    ),
    "openai": ProviderSpec(
        id="openai",
        label="OpenAI API",
        description="GPT models via API key",
        authKind="api_key",
        setupKind="api_key",
        envKey="OPENAI_API_KEY",
        probePolicy="credentialed",
    ),
    "custom": ProviderSpec(
        id="custom",
        label="Custom OpenAI-Compatible",
        description="OpenAI-compatible API endpoint",
        authKind="api_key",
        setupKind="api_key",
        probePolicy="credentialed",
    ),
}


def normalizeProvider(provider: str | None) -> str | None:
    if provider is None:
        return None
    normalized = provider.strip()
    return normalized if normalized in _PROVIDERS else provider


def getProviderSpec(provider: str) -> ProviderSpec | None:
    normalized = normalizeProvider(provider)
    if normalized is None:
        return None
    return _PROVIDERS.get(normalized)


def publicProviderIds() -> tuple[str, ...]:
    return tuple(spec.id for spec in _PROVIDERS.values() if spec.public)


def providerChoices(*, includeHidden: bool = False) -> list[str]:
    return [spec.id for spec in _PROVIDERS.values() if includeHidden or spec.public]


def buildProviderCatalog(*, includeHidden: bool = False) -> list[dict[str, str | list[str]]]:
    items: list[dict[str, str | list[str]]] = []
    for spec in _PROVIDERS.values():
        if not includeHidden and not spec.public:
            continue
        item: dict[str, str | list[str]] = {
            "id": spec.id,
            "label": spec.label,
            "description": spec.description,
            "authKind": spec.authKind,
            "setupKind": spec.setupKind,
            "probePolicy": spec.probePolicy,
            "supportedRoles": list(spec.supportedRoles),
        }
        if spec.envKey:
            item["envKey"] = spec.envKey
        items.append(item)
    return items


def apiKeySecretName(provider: str) -> str:
    normalized = normalizeProvider(provider) or provider
    return f"provider:{normalized}:api_key"


def oauthSecretName(provider: str) -> str:
    normalized = normalizeProvider(provider) or provider
    return f"provider:{normalized}:oauth"
