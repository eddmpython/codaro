from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping


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

    @classmethod
    def create(
        cls,
        *,
        workspaceRoot: str | Path,
        permissionScopes: list[str] | tuple[str, ...] | frozenset[str],
        policyHash: str,
    ) -> "ExecutionSecurityPolicy":
        root = Path(workspaceRoot).expanduser().resolve()
        scopes = frozenset(permissionScopes)
        unknown = scopes - EXECUTION_PERMISSION_SCOPES
        if unknown:
            raise ExecutionPolicyError(f"unsupported execution permission scopes: {sorted(unknown)}")
        if not policyHash.startswith("sha256-"):
            raise ExecutionPolicyError("execution policy hash is invalid")
        return cls(workspaceRoot=root, permissionScopes=scopes, policyHash=policyHash)

    def serialize(self) -> dict[str, Any]:
        return {
            "schemaVersion": 1,
            "workspaceRoot": str(self.workspaceRoot),
            "permissionScopes": sorted(self.permissionScopes),
            "policyHash": self.policyHash,
        }

    @classmethod
    def deserialize(cls, value: Mapping[str, object]) -> "ExecutionSecurityPolicy":
        if set(value) != {"schemaVersion", "workspaceRoot", "permissionScopes", "policyHash"}:
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
        )
