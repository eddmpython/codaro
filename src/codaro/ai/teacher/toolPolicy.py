from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ToolPolicyViolation:
    code: str
    message: str
    toolName: str

    def asResult(self) -> dict[str, Any]:
        return {
            "error": self.message,
            "policy": self.code,
            "tool": self.toolName,
        }


@dataclass
class ToolPolicyState:
    requiredPackages: set[str] = field(default_factory=set)
    checkedPackages: set[str] = field(default_factory=set)
    missingPackages: set[str] = field(default_factory=set)

    @classmethod
    def fromContext(cls, context: dict[str, Any] | None) -> "ToolPolicyState":
        if not isinstance(context, dict):
            return cls()
        preflight = context.get("dependencyPreflight")
        if not isinstance(preflight, dict):
            return cls()
        packages = preflight.get("packages")
        if not isinstance(packages, list):
            return cls()
        return cls(requiredPackages={str(package).strip().lower() for package in packages if str(package).strip()})

    def validateStart(self, toolName: str, arguments: dict[str, Any]) -> ToolPolicyViolation | None:
        if toolName == "packages-install":
            packageName = str(arguments.get("name", "")).strip().lower()
            if not packageName:
                return ToolPolicyViolation("package-name-required", "packages-install에는 name이 필요합니다.", toolName)
            if packageName not in self.missingPackages:
                return ToolPolicyViolation(
                    "package-check-required",
                    "패키지 설치 전에는 packages-check로 missing 여부를 먼저 확인해야 합니다.",
                    toolName,
                )

        if toolName in {"cell-call", "execute-reactive"}:
            unchecked = self.requiredPackages - self.checkedPackages
            if unchecked:
                return ToolPolicyViolation(
                    "dependency-preflight-required",
                    f"실행 전 packages-check가 필요합니다: {', '.join(sorted(unchecked))}",
                    toolName,
                )

        return None

    def recordResult(self, toolName: str, arguments: dict[str, Any], result: dict[str, Any]) -> None:
        if toolName != "packages-check" or not isinstance(result, dict):
            return
        names = arguments.get("names")
        if isinstance(names, list):
            self.checkedPackages.update(str(name).strip().lower() for name in names if str(name).strip())
        missing = result.get("missing")
        if isinstance(missing, list):
            self.missingPackages.update(str(name).strip().lower() for name in missing if str(name).strip())
