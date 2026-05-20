from __future__ import annotations

from dataclasses import dataclass

from .toolExecutor import ToolExecutor
from .toolManifest import (
    TOOL_CATEGORIES,
    TOOL_GROUPS,
    TOOL_LANE_GROUPS,
    TOOL_LANES,
    TOOL_TARGETS,
)
from .tools import defaultTools


@dataclass(frozen=True)
class ToolContractIssue:
    code: str
    toolName: str
    message: str


def validateDefaultToolContract() -> list[ToolContractIssue]:
    issues: list[ToolContractIssue] = []
    seenNames: set[str] = set()

    for tool in defaultTools():
        if tool.name in seenNames:
            issues.append(ToolContractIssue("duplicate-tool", tool.name, "tool name is registered more than once"))
        seenNames.add(tool.name)

        if tool.parameters.get("type") != "object":
            issues.append(ToolContractIssue("schema-type", tool.name, "parameters.type must be object"))
        if not isinstance(tool.parameters.get("properties"), dict):
            issues.append(ToolContractIssue("schema-properties", tool.name, "parameters.properties must be a mapping"))
        if not hasattr(ToolExecutor, f"_handle_{tool.handler}"):
            issues.append(ToolContractIssue("missing-handler", tool.name, f"handler is missing: {tool.handler}"))

        category = TOOL_CATEGORIES.get(tool.name)
        if category is None:
            issues.append(ToolContractIssue("missing-category", tool.name, "tool category is not declared"))
        elif category not in TOOL_GROUPS:
            issues.append(ToolContractIssue("unknown-category", tool.name, f"unknown category: {category}"))

        lane = TOOL_LANES.get(tool.name)
        if lane is None:
            issues.append(ToolContractIssue("missing-lane", tool.name, "tool lane is not declared"))
        elif lane not in TOOL_LANE_GROUPS:
            issues.append(ToolContractIssue("unknown-lane", tool.name, f"unknown lane: {lane}"))

        if tool.name not in TOOL_TARGETS:
            issues.append(ToolContractIssue("missing-target", tool.name, "tool target is not declared"))

    return issues


def assertDefaultToolContract() -> None:
    issues = validateDefaultToolContract()
    if issues:
        details = "; ".join(f"{issue.toolName}:{issue.code}" for issue in issues)
        raise AssertionError(f"Default tool contract is invalid: {details}")
