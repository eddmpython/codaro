from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping
from urllib.parse import urlsplit


EXECUTION_PERMISSION_SCOPES = frozenset({
    "filesystem.read",
    "filesystem.write",
    "network",
    "process.execute",
})


class ExecutionPolicyError(ValueError):
    pass


@dataclass(frozen=True, slots=True)
class ExecutionSecurityPolicy:
    workspaceRoot: Path
    permissionScopes: frozenset[str]
    policyHash: str
    networkOrigins: tuple[str, ...] = ()

    @classmethod
    def create(
        cls,
        *,
        workspaceRoot: str | Path,
        permissionScopes: list[str] | tuple[str, ...] | frozenset[str],
        policyHash: str,
        networkOrigins: list[str] | tuple[str, ...] = (),
    ) -> "ExecutionSecurityPolicy":
        root = Path(workspaceRoot).expanduser().resolve()
        scopes = frozenset(permissionScopes)
        unknown = scopes - EXECUTION_PERMISSION_SCOPES
        if unknown:
            raise ExecutionPolicyError(f"unsupported execution permission scopes: {sorted(unknown)}")
        if not policyHash.startswith("sha256-"):
            raise ExecutionPolicyError("execution policy hash is invalid")
        origins = tuple(sorted(set(networkOrigins)))
        for origin in origins:
            parsed = urlsplit(origin)
            if parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.path not in {"", "/"}:
                raise ExecutionPolicyError(f"execution network origin is invalid: {origin}")
        return cls(workspaceRoot=root, permissionScopes=scopes, policyHash=policyHash, networkOrigins=origins)

    def serialize(self) -> dict[str, Any]:
        return {
            "schemaVersion": 1,
            "workspaceRoot": str(self.workspaceRoot),
            "permissionScopes": sorted(self.permissionScopes),
            "policyHash": self.policyHash,
            "networkOrigins": list(self.networkOrigins),
        }

    @classmethod
    def deserialize(cls, value: Mapping[str, object]) -> "ExecutionSecurityPolicy":
        if set(value) not in (
            {"schemaVersion", "workspaceRoot", "permissionScopes", "policyHash"},
            {"schemaVersion", "workspaceRoot", "permissionScopes", "policyHash", "networkOrigins"},
        ):
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
        )
