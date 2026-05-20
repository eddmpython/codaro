from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass, field
from typing import Any

from ..toolManifest import toolDescriptor


@dataclass(frozen=True)
class ToolPolicyViolation:
    code: str
    message: str
    toolName: str

    def asResult(self) -> dict[str, Any]:
        return toolPolicyViolationPayload(self)


def toolPolicyViolationPayload(violation: ToolPolicyViolation) -> dict[str, Any]:
    return {
        "error": violation.message,
        "message": violation.message,
        "policy": violation.code,
        "policyCode": violation.code,
        "tool": violation.toolName,
        "toolName": violation.toolName,
    }


def normalizeToolPolicyViolation(
    violation: ToolPolicyViolation | Mapping[str, Any],
) -> dict[str, str] | None:
    if isinstance(violation, ToolPolicyViolation):
        code = violation.code
        toolName = violation.toolName
        message = violation.message
    elif isinstance(violation, Mapping):
        code = str(violation.get("policyCode") or violation.get("policy") or "")
        toolName = str(violation.get("toolName") or violation.get("tool") or "")
        message = str(violation.get("message") or violation.get("error") or "")
    else:
        return None

    if not (code or toolName or message):
        return None
    return {
        "policyCode": code,
        "toolName": toolName,
        "message": message,
    }


def normalizeToolPolicyViolations(
    violations: Iterable[ToolPolicyViolation | Mapping[str, Any]],
) -> tuple[dict[str, str], ...]:
    normalized: list[dict[str, str]] = []
    for violation in violations:
        payload = normalizeToolPolicyViolation(violation)
        if payload is not None:
            normalized.append(payload)
    return tuple(normalized)


@dataclass
class ToolPolicyState:
    requiredPackages: set[str] = field(default_factory=set)
    checkedPackages: set[str] = field(default_factory=set)
    installedPackages: set[str] = field(default_factory=set)
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
        return cls(requiredPackages={normalizePackageName(package) for package in packages if normalizePackageName(package)})

    def validateStart(self, toolName: str, arguments: dict[str, Any]) -> ToolPolicyViolation | None:
        if toolName == "packages-install":
            packageName = normalizePackageName(arguments.get("name", ""))
            if not packageName:
                return ToolPolicyViolation("package-name-required", "packages-install에는 name이 필요합니다.", toolName)
            if packageName not in self.missingPackages:
                return ToolPolicyViolation(
                    "package-check-required",
                    "패키지 설치 전에는 packages-check로 missing 여부를 먼저 확인해야 합니다.",
                    toolName,
                )

        if toolRequiresDependencyPreflight(toolName):
            unchecked = self.requiredPackages - self.checkedPackages
            if unchecked:
                return ToolPolicyViolation(
                    "dependency-preflight-required",
                    f"실행 전 packages-check가 필요합니다: {', '.join(sorted(unchecked))}",
                    toolName,
                )
            unresolved = (self.requiredPackages & self.missingPackages) - self.installedPackages
            if unresolved:
                return ToolPolicyViolation(
                    "dependency-install-required",
                    f"실행 전 packages-install이 필요합니다: {', '.join(sorted(unresolved))}",
                    toolName,
                )

        return None

    def recordResult(self, toolName: str, arguments: dict[str, Any], result: dict[str, Any]) -> None:
        if not isinstance(result, dict):
            return

        if toolName == "packages-check":
            if result.get("error"):
                return
            names = arguments.get("names")
            checked = set()
            if isinstance(names, list):
                checked = {normalizePackageName(name) for name in names if normalizePackageName(name)}
            missing = result.get("missing")
            if not isinstance(missing, list):
                return
            missingNames = {normalizePackageName(name) for name in missing if normalizePackageName(name)} & checked
            self.checkedPackages.update(checked)
            self.missingPackages.update(missingNames)
            self.installedPackages.update(checked - missingNames)
            return

        if toolName == "packages-install" and result.get("success") is True:
            packageName = normalizePackageName(arguments.get("name", ""))
            if packageName:
                self.installedPackages.add(packageName)
                self.missingPackages.discard(packageName)


def normalizePackageName(value: Any) -> str:
    return str(value).strip().lower().replace("_", "-")


def toolRequiresDependencyPreflight(toolName: str) -> bool:
    return toolDescriptor(toolName).get("lane") == "cell-call"
