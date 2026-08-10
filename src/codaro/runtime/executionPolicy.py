from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping
from urllib.parse import urlsplit

from ..executionIsolation import (
    PROOF_EXECUTION_ISOLATION_PROFILE,
    executionIsolationPolicyHash,
    proofExecutionIsolationPolicyHash,
)


EXECUTION_PERMISSION_SCOPES = frozenset({
    "filesystem.read",
    "filesystem.write",
    "network",
    "process.execute",
    "gui.display",
    "secret.read",
})

class ExecutionPolicyError(ValueError):
    pass


def canonicalNetworkOrigin(value: str) -> str:
    parsed = urlsplit(value)
    if (
        parsed.scheme.lower() not in {"http", "https"}
        or not parsed.hostname
        or parsed.username is not None
        or parsed.password is not None
        or parsed.path not in {"", "/"}
        or parsed.query
        or parsed.fragment
    ):
        raise ExecutionPolicyError(f"execution network origin is invalid: {value}")
    try:
        port = parsed.port
    except ValueError as error:
        raise ExecutionPolicyError(f"execution network origin is invalid: {value}") from error
    scheme = parsed.scheme.lower()
    host = parsed.hostname.lower().rstrip(".")
    defaultPort = 443 if scheme == "https" else 80
    renderedHost = f"[{host}]" if ":" in host else host
    return f"{scheme}://{renderedHost}" + (f":{port}" if port is not None and port != defaultPort else "")


def networkOriginEndpoint(value: str) -> tuple[str, int]:
    canonical = canonicalNetworkOrigin(value)
    parsed = urlsplit(canonical)
    return parsed.hostname or "", parsed.port or (443 if parsed.scheme == "https" else 80)


@dataclass(frozen=True, slots=True)
class ExecutionSecurityPolicy:
    workspaceRoot: Path
    permissionScopes: frozenset[str]
    policyHash: str
    networkOrigins: tuple[str, ...] = ()
    isolationProfile: str = "local-policy-audit-v1"
    environmentMode: str = "inherit"
    childProcessMode: str = "scope"
    nativeInteropMode: str = "allow"
    destroyMode: str = "manager-dispose"

    @classmethod
    def create(
        cls,
        *,
        workspaceRoot: str | Path,
        permissionScopes: list[str] | tuple[str, ...] | frozenset[str],
        policyHash: str,
        networkOrigins: list[str] | tuple[str, ...] = (),
        isolationProfile: str = "local-policy-audit-v1",
        environmentMode: str = "inherit",
        childProcessMode: str = "scope",
        nativeInteropMode: str = "allow",
        destroyMode: str = "manager-dispose",
    ) -> "ExecutionSecurityPolicy":
        root = Path(workspaceRoot).expanduser().resolve()
        scopes = frozenset(permissionScopes)
        unknown = scopes - EXECUTION_PERMISSION_SCOPES
        if unknown:
            raise ExecutionPolicyError(f"unsupported execution permission scopes: {sorted(unknown)}")
        if not policyHash.startswith("sha256-"):
            raise ExecutionPolicyError("execution policy hash is invalid")
        if environmentMode not in {"inherit", "minimal-declared"}:
            raise ExecutionPolicyError("execution environment mode is invalid")
        if childProcessMode not in {"scope", "deny"}:
            raise ExecutionPolicyError("execution child process mode is invalid")
        if nativeInteropMode not in {"allow", "audit-deny"}:
            raise ExecutionPolicyError("execution native interop mode is invalid")
        if destroyMode not in {"manager-dispose", "interrupt-then-dispose"}:
            raise ExecutionPolicyError("execution destroy mode is invalid")
        origins = tuple(sorted({canonicalNetworkOrigin(origin) for origin in networkOrigins}))
        return cls(
            workspaceRoot=root,
            permissionScopes=scopes,
            policyHash=policyHash,
            networkOrigins=origins,
            isolationProfile=isolationProfile,
            environmentMode=environmentMode,
            childProcessMode=childProcessMode,
            nativeInteropMode=nativeInteropMode,
            destroyMode=destroyMode,
        )

    @classmethod
    def createProofEligible(
        cls,
        *,
        workspaceRoot: str | Path,
        permissionScopes: list[str] | tuple[str, ...] | frozenset[str],
        policyHash: str,
        networkOrigins: list[str] | tuple[str, ...] = (),
    ) -> "ExecutionSecurityPolicy":
        return cls.create(
            workspaceRoot=workspaceRoot,
            permissionScopes=permissionScopes,
            policyHash=policyHash,
            networkOrigins=networkOrigins,
            isolationProfile=PROOF_EXECUTION_ISOLATION_PROFILE,
            environmentMode="minimal-declared",
            childProcessMode="deny",
            nativeInteropMode="audit-deny",
            destroyMode="interrupt-then-dispose",
        )

    @property
    def isolationPolicyHash(self) -> str:
        payload = {
            "schemaVersion": 1,
            "profile": self.isolationProfile,
            "environmentMode": self.environmentMode,
            "childProcessMode": self.childProcessMode,
            "nativeInteropMode": self.nativeInteropMode,
            "destroyMode": self.destroyMode,
        }
        return executionIsolationPolicyHash(payload)

    @property
    def proofEligible(self) -> bool:
        return (
            self.isolationProfile == PROOF_EXECUTION_ISOLATION_PROFILE
            and self.environmentMode == "minimal-declared"
            and self.childProcessMode == "deny"
            and self.nativeInteropMode == "audit-deny"
            and self.destroyMode == "interrupt-then-dispose"
            and self.isolationPolicyHash == proofExecutionIsolationPolicyHash()
        )

    def serialize(self) -> dict[str, Any]:
        return {
            "schemaVersion": 1,
            "workspaceRoot": str(self.workspaceRoot),
            "permissionScopes": sorted(self.permissionScopes),
            "policyHash": self.policyHash,
            "networkOrigins": list(self.networkOrigins),
            "isolationProfile": self.isolationProfile,
            "environmentMode": self.environmentMode,
            "childProcessMode": self.childProcessMode,
            "nativeInteropMode": self.nativeInteropMode,
            "destroyMode": self.destroyMode,
        }

    @classmethod
    def deserialize(cls, value: Mapping[str, object]) -> "ExecutionSecurityPolicy":
        requiredFields = {"schemaVersion", "workspaceRoot", "permissionScopes", "policyHash"}
        optionalFields = {
            "networkOrigins",
            "isolationProfile",
            "environmentMode",
            "childProcessMode",
            "nativeInteropMode",
            "destroyMode",
        }
        if not requiredFields.issubset(value) or set(value) - requiredFields - optionalFields:
            raise ExecutionPolicyError("execution policy fields are invalid")
        if value.get("schemaVersion") != 1 or not isinstance(value.get("permissionScopes"), list):
            raise ExecutionPolicyError("execution policy schema is unsupported")
        scopes = value["permissionScopes"]
        if not all(isinstance(scope, str) for scope in scopes):
            raise ExecutionPolicyError("execution permission scopes are invalid")
        return cls.create(
            workspaceRoot=str(value.get("workspaceRoot") or ""),
            permissionScopes=scopes,
            policyHash=str(value.get("policyHash") or ""),
            networkOrigins=[str(origin) for origin in value.get("networkOrigins", [])] if isinstance(value.get("networkOrigins", []), list) else [],
            isolationProfile=str(value.get("isolationProfile") or "local-policy-audit-v1"),
            environmentMode=str(value.get("environmentMode") or "inherit"),
            childProcessMode=str(value.get("childProcessMode") or "scope"),
            nativeInteropMode=str(value.get("nativeInteropMode") or "allow"),
            destroyMode=str(value.get("destroyMode") or "manager-dispose"),
        )
