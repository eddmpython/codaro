from __future__ import annotations

import json
import os
import tempfile
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .providerSpec import (
    apiKeySecretName,
    buildProviderCatalog,
    getProviderSpec,
    normalizeProvider,
    oauthSecretName,
    publicProviderIds,
)
from .providerSpec import AI_ROLES, DEFAULT_ROLE, normalizeRole
from .secrets import SecretStore, getSecretStore


def _codaroHome() -> Path:
    raw = os.environ.get("CODARO_HOME")
    if raw:
        return Path(raw)
    return Path.home() / ".codaro"


def _utcNow() -> str:
    return datetime.now(UTC).isoformat()


@dataclass
class ProviderProfile:
    model: str | None = None
    baseUrl: str | None = None


@dataclass
class RoleBinding:
    provider: str | None = None
    model: str | None = None


@dataclass
class AiProfile:
    version: int = 2
    revision: int = 0
    defaultProvider: str = "oauth-chatgpt"
    providers: dict[str, ProviderProfile] = field(default_factory=dict)
    roles: dict[str, RoleBinding] = field(default_factory=dict)
    temperature: float = 0.3
    maxTokens: int = 4096
    systemPrompt: str | None = None
    updatedAt: str | None = None
    updatedBy: str | None = None


def _defaultRoles(provider: str, providers: dict[str, ProviderProfile]) -> dict[str, RoleBinding]:
    defaultModel = providers.get(provider).model if provider in providers else None
    return {
        role: RoleBinding(provider=provider, model=defaultModel)
        for role in AI_ROLES
    }


class AiProfileManager:
    def __init__(self, path: Path | None = None, secretStore: SecretStore | None = None) -> None:
        self.path = path or (_codaroHome() / "ai_profile.json")
        self.secretStore = secretStore or getSecretStore()

    def _bootstrap(self) -> AiProfile:
        return AiProfile(
            defaultProvider="oauth-chatgpt",
            roles=_defaultRoles("oauth-chatgpt", {}),
            updatedAt=_utcNow(),
            updatedBy="bootstrap",
        )

    def load(self) -> AiProfile:
        if not self.path.exists():
            return self._bootstrap()
        raw = self.path.read_text(encoding="utf-8")
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            return self._bootstrap()

        providersRaw = data.get("providers", {})
        providers: dict[str, ProviderProfile] = {}
        if isinstance(providersRaw, dict):
            for name, item in providersRaw.items():
                normalized = normalizeProvider(name) or name
                if getProviderSpec(normalized) is None or not isinstance(item, dict):
                    continue
                providers[normalized] = ProviderProfile(
                    model=item.get("model"),
                    baseUrl=item.get("baseUrl") or item.get("base_url"),
                )

        defaultProvider = (
            normalizeProvider(data.get("defaultProvider"))
            or normalizeProvider(data.get("provider"))
            or "oauth-chatgpt"
        )
        if getProviderSpec(defaultProvider) is None:
            defaultProvider = "oauth-chatgpt"

        roles: dict[str, RoleBinding] = {}
        rolesRaw = data.get("roles", {})
        if isinstance(rolesRaw, dict):
            for roleName, binding in rolesRaw.items():
                normalizedRole = normalizeRole(roleName)
                if normalizedRole is None or not isinstance(binding, dict):
                    continue
                boundProvider = normalizeProvider(binding.get("provider")) or defaultProvider
                if getProviderSpec(boundProvider) is None:
                    boundProvider = defaultProvider
                roles[normalizedRole] = RoleBinding(
                    provider=boundProvider,
                    model=binding.get("model"),
                )

        for roleName, binding in _defaultRoles(defaultProvider, providers).items():
            roles.setdefault(roleName, binding)

        return AiProfile(
            version=2,
            revision=int(data.get("revision", 0)),
            defaultProvider=defaultProvider,
            providers=providers,
            roles=roles,
            temperature=float(data.get("temperature", 0.3)),
            maxTokens=int(data.get("maxTokens", data.get("max_tokens", 4096))),
            systemPrompt=data.get("systemPrompt") or data.get("system_prompt"),
            updatedAt=data.get("updatedAt") or data.get("updated_at") or _utcNow(),
            updatedBy=data.get("updatedBy") or data.get("updated_by") or "unknown",
        )

    def save(self, profile: AiProfile) -> AiProfile:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "version": 2,
            "revision": profile.revision,
            "defaultProvider": profile.defaultProvider,
            "providers": {
                name: {
                    "model": item.model,
                    "baseUrl": item.baseUrl,
                }
                for name, item in profile.providers.items()
            },
            "roles": {
                role: {
                    "provider": binding.provider,
                    "model": binding.model,
                }
                for role, binding in profile.roles.items()
            },
            "temperature": profile.temperature,
            "maxTokens": profile.maxTokens,
            "systemPrompt": profile.systemPrompt,
            "updatedAt": profile.updatedAt,
            "updatedBy": profile.updatedBy,
        }
        content = json.dumps(payload, ensure_ascii=False, indent=2)
        fd, tmpPath = tempfile.mkstemp(dir=self.path.parent, suffix=".tmp")
        try:
            os.write(fd, content.encode("utf-8"))
            os.close(fd)
            fd = -1
            tmp = Path(tmpPath)
            if os.name != "nt":
                tmp.chmod(0o600)
            tmp.replace(self.path)
        finally:
            if fd >= 0:
                os.close(fd)
            if os.path.exists(tmpPath):
                os.unlink(tmpPath)
        return profile

    def ensureProvider(self, profile: AiProfile, provider: str) -> ProviderProfile:
        normalized = normalizeProvider(provider) or provider
        if normalized not in profile.providers:
            profile.providers[normalized] = ProviderProfile()
        return profile.providers[normalized]

    def ensureRole(self, profile: AiProfile, role: str) -> RoleBinding:
        normalized = normalizeRole(role)
        if normalized is None:
            raise ValueError(f"Unsupported role: {role}")
        if normalized not in profile.roles:
            defaultModel = (
                profile.providers.get(profile.defaultProvider).model
                if profile.defaultProvider in profile.providers
                else None
            )
            profile.roles[normalized] = RoleBinding(provider=profile.defaultProvider, model=defaultModel)
        return profile.roles[normalized]

    def update(
        self,
        *,
        provider: str | None = None,
        model: str | None = None,
        role: str | None = None,
        baseUrl: str | None = None,
        temperature: float | None = None,
        maxTokens: int | None = None,
        systemPrompt: str | None = None,
        updatedBy: str = "code",
    ) -> AiProfile:
        profile = self.load()
        normalizedRole = normalizeRole(role)
        if role is not None and normalizedRole is None:
            raise ValueError(f"Unsupported role: {role}")

        targetProvider = normalizeProvider(provider) if provider is not None else None
        if targetProvider is not None and getProviderSpec(targetProvider) is None:
            raise ValueError(f"Unsupported provider: {targetProvider}")

        oldDefault = profile.defaultProvider

        if normalizedRole is None:
            effectiveProvider = targetProvider or profile.defaultProvider
            if targetProvider is not None:
                profile.defaultProvider = targetProvider
            target = self.ensureProvider(profile, effectiveProvider)
            if model is not None:
                target.model = model
            if baseUrl is not None:
                target.baseUrl = baseUrl
            if targetProvider is not None:
                for binding in profile.roles.values():
                    if binding.provider in (None, oldDefault):
                        binding.provider = targetProvider
                        if model is not None:
                            binding.model = model
                        elif binding.model is None:
                            binding.model = target.model
        else:
            binding = self.ensureRole(profile, normalizedRole)
            effectiveProvider = targetProvider or binding.provider or profile.defaultProvider
            if getProviderSpec(effectiveProvider) is None:
                effectiveProvider = profile.defaultProvider
            binding.provider = effectiveProvider
            if model is not None:
                binding.model = model
            elif binding.model is None:
                binding.model = self.ensureProvider(profile, effectiveProvider).model
            if targetProvider is not None:
                target = self.ensureProvider(profile, targetProvider)
                if baseUrl is not None:
                    target.baseUrl = baseUrl
                if model is not None and target.model is None:
                    target.model = model

        if temperature is not None:
            profile.temperature = temperature
        if maxTokens is not None:
            profile.maxTokens = maxTokens
        if systemPrompt is not None:
            profile.systemPrompt = systemPrompt
        profile.revision += 1
        profile.updatedAt = _utcNow()
        profile.updatedBy = updatedBy
        return self.save(profile)

    def resolve(self, provider: str | None = None, *, role: str | None = None) -> dict[str, Any]:
        profile = self.load()
        normalizedRole = normalizeRole(role)
        explicitProvider = normalizeProvider(provider) if provider is not None else None

        if explicitProvider is not None and getProviderSpec(explicitProvider) is not None:
            targetProvider = explicitProvider
            roleModel = None
        else:
            binding = profile.roles.get(normalizedRole or DEFAULT_ROLE)
            targetProvider = binding.provider if binding and binding.provider else profile.defaultProvider
            roleModel = binding.model if binding else None

        if getProviderSpec(targetProvider) is None:
            targetProvider = profile.defaultProvider

        settings = profile.providers.get(targetProvider) or ProviderProfile()
        spec = getProviderSpec(targetProvider)
        apiKey = None
        if spec and spec.authKind == "api_key":
            apiKey = self.secretStore.get(apiKeySecretName(targetProvider))
        return {
            "provider": targetProvider,
            "model": roleModel or settings.model,
            "apiKey": apiKey,
            "baseUrl": settings.baseUrl,
            "temperature": profile.temperature,
            "maxTokens": profile.maxTokens,
            "systemPrompt": profile.systemPrompt,
        }

    def saveApiKey(self, provider: str, apiKey: str, *, updatedBy: str = "ui") -> AiProfile:
        normalized = normalizeProvider(provider) or provider
        if getProviderSpec(normalized) is None:
            raise ValueError(f"Unsupported provider: {normalized}")
        self.secretStore.set(apiKeySecretName(normalized), apiKey)
        return self.update(provider=normalized, updatedBy=updatedBy)

    def clearApiKey(self, provider: str, *, updatedBy: str = "ui") -> AiProfile:
        normalized = normalizeProvider(provider) or provider
        if getProviderSpec(normalized) is None:
            raise ValueError(f"Unsupported provider: {normalized}")
        self.secretStore.delete(apiKeySecretName(normalized))
        return self.update(provider=normalized, updatedBy=updatedBy)

    def serialize(self) -> dict[str, Any]:
        profile = self.load()
        providerSettings: dict[str, dict[str, Any]] = {}
        for providerId in publicProviderIds():
            settings = profile.providers.get(providerId) or ProviderProfile()
            spec = getProviderSpec(providerId)
            secretConfigured = False
            if spec and spec.authKind == "api_key":
                secretConfigured = self.secretStore.has(apiKeySecretName(providerId))
            elif spec and spec.authKind == "oauth":
                secretConfigured = self.secretStore.has(oauthSecretName(providerId))
            providerSettings[providerId] = {
                "model": settings.model,
                "baseUrl": settings.baseUrl,
                "secretConfigured": secretConfigured,
            }
        return {
            "defaultProvider": profile.defaultProvider,
            "temperature": profile.temperature,
            "maxTokens": profile.maxTokens,
            "systemPrompt": profile.systemPrompt,
            "updatedAt": profile.updatedAt,
            "updatedBy": profile.updatedBy,
            "revision": profile.revision,
            "providers": providerSettings,
            "roles": {
                role: {
                    "provider": binding.provider,
                    "model": binding.model,
                }
                for role, binding in profile.roles.items()
            },
            "catalog": buildProviderCatalog(),
        }

    def fingerprint(self) -> str:
        profile = self.load()
        roleFingerprint = ",".join(
            f"{role}:{binding.provider}:{binding.model or ''}"
            for role, binding in sorted(profile.roles.items())
        )
        return f"{profile.revision}:{profile.updatedAt}:{profile.updatedBy}:{profile.defaultProvider}:{roleFingerprint}"


def getProfileManager() -> AiProfileManager:
    return AiProfileManager(secretStore=getSecretStore())
