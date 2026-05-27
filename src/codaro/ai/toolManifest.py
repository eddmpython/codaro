from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .toolRegistry import ToolDef, allTools


@dataclass(frozen=True)
class ToolManifestMetadata:
    category: str
    lane: str
    target: str
    risk: str = "normal"


TOOL_GROUPS: dict[str, dict[str, str]] = {
    "curriculumOs": {
        "label": "Curriculum OS",
        "description": "Compose master plans, search curricula, and identify gaps.",
    },
    "workbench": {
        "label": "Workbench",
        "description": "Create and edit the live notebook surface.",
    },
    "runtime": {
        "label": "Runtime",
        "description": "Run code, inspect state, and validate student work.",
    },
    "learning": {
        "label": "Learning",
        "description": "Generate curriculum, exercises, quizzes, and progress events.",
    },
    "files": {
        "label": "Files",
        "description": "Write files, install packages, and create notebooks.",
    },
    "automation": {
        "label": "Automation",
        "description": "Record, execute, and monitor desktop or workflow automation.",
    },
    "sensory": {
        "label": "Sensory",
        "description": "Read screen, voice, UI state, and external channels.",
    },
    "safety": {
        "label": "Safety",
        "description": "Control emergency stop and guarded external actions.",
    },
}


TOOL_LANE_GROUPS: dict[str, dict[str, str]] = {
    "planning": {
        "label": "Planning",
        "description": "Compose learning master plans and inspect curriculum coverage.",
    },
    "curriculum": {
        "label": "Curriculum",
        "description": "Author YAML learning specs and materialize them as editor cells.",
    },
    "read": {
        "label": "Read",
        "description": "Inspect learning cells, runtime state, files, or visible UI state.",
    },
    "write": {
        "label": "Write",
        "description": "Create, update, delete, or stage editor/workspace content.",
    },
    "cell-call": {
        "label": "Cell Call",
        "description": "Run, check, or inspect a specific learning cell.",
    },
    "progress": {
        "label": "Progress",
        "description": "Record completion, mastery, and learner state.",
    },
    "automation": {
        "label": "Automation",
        "description": "Record or execute multi-step external workflows.",
    },
    "safety": {
        "label": "Safety",
        "description": "Guard input actions and stop unsafe automation.",
    },
}


TOOL_METADATA: dict[str, ToolManifestMetadata] = {
    "read-cells": ToolManifestMetadata("workbench", "read", "learning-editor"),
    "write-cell": ToolManifestMetadata("workbench", "write", "learning-editor", "writes"),
    "cell-call": ToolManifestMetadata("runtime", "cell-call", "learning-editor"),
    "write-curriculum-yaml": ToolManifestMetadata("learning", "curriculum", "curriculum-yaml", "writes"),
    "insert-block": ToolManifestMetadata("workbench", "write", "learning-editor"),
    "update-block": ToolManifestMetadata("workbench", "write", "learning-editor"),
    "delete-block": ToolManifestMetadata("workbench", "write", "learning-editor", "destructive"),
    "get-blocks": ToolManifestMetadata("workbench", "read", "learning-editor"),
    "execute-reactive": ToolManifestMetadata("runtime", "cell-call", "kernel-runtime"),
    "get-variables": ToolManifestMetadata("runtime", "read", "kernel-runtime"),
    "check-exercise": ToolManifestMetadata("runtime", "cell-call", "kernel-runtime"),
    "create-guide": ToolManifestMetadata("learning", "write", "learning-editor"),
    "create-learning-card": ToolManifestMetadata("learning", "write", "learning-editor"),
    "create-quiz": ToolManifestMetadata("learning", "write", "learning-editor"),
    "create-notebook-exercise": ToolManifestMetadata("learning", "write", "learning-editor"),
    "track-achievement": ToolManifestMetadata("learning", "progress", "learner-progress"),
    "split-notebook": ToolManifestMetadata("files", "write", "file-system"),
    "generate-notebook": ToolManifestMetadata("files", "write", "learning-editor"),
    "fs-write": ToolManifestMetadata("files", "write", "file-system", "writes"),
    "packages-check": ToolManifestMetadata("files", "read", "kernel-runtime"),
    "packages-install": ToolManifestMetadata("files", "write", "kernel-runtime", "writes"),
    "http-request": ToolManifestMetadata("automation", "automation", "external-api", "external"),
    "start-recording": ToolManifestMetadata("automation", "automation", "desktop-automation"),
    "stop-recording": ToolManifestMetadata("automation", "automation", "desktop-automation"),
    "write-automation-recipe": ToolManifestMetadata("automation", "write", "automation-recipe", "writes"),
    "create-automation-task": ToolManifestMetadata("automation", "automation", "task-registry", "writes"),
    "run-automation": ToolManifestMetadata("automation", "automation", "desktop-automation", "input"),
    "capture-screen": ToolManifestMetadata("sensory", "read", "screen"),
    "read-screen-text": ToolManifestMetadata("sensory", "read", "screen"),
    "find-element": ToolManifestMetadata("sensory", "read", "screen"),
    "detect-elements": ToolManifestMetadata("sensory", "read", "screen"),
    "voice-listen": ToolManifestMetadata("sensory", "read", "voice"),
    "voice-speak": ToolManifestMetadata("sensory", "automation", "voice"),
    "send-notification": ToolManifestMetadata("sensory", "automation", "external-channel"),
    "click-element": ToolManifestMetadata("safety", "safety", "guarded-input", "input"),
    "type-text": ToolManifestMetadata("safety", "safety", "guarded-input", "input"),
    "press-hotkey": ToolManifestMetadata("safety", "safety", "guarded-input", "input"),
    "wait-for": ToolManifestMetadata("safety", "safety", "guarded-input"),
    "emergency-stop": ToolManifestMetadata("safety", "safety", "automation-safety", "safety"),
    "list-curriculum-domains": ToolManifestMetadata("curriculumOs", "planning", "curriculum-taxonomy"),
    "resolve-learning-goal": ToolManifestMetadata("curriculumOs", "planning", "curriculum-taxonomy"),
    "search-curricula": ToolManifestMetadata("curriculumOs", "planning", "curriculum-taxonomy"),
    "compose-master-plan": ToolManifestMetadata("curriculumOs", "planning", "curriculum-taxonomy"),
    "inspect-curriculum": ToolManifestMetadata("curriculumOs", "planning", "curriculum-taxonomy"),
    "list-curriculum-gaps": ToolManifestMetadata("curriculumOs", "planning", "curriculum-taxonomy"),
    "propose-curriculum-draft": ToolManifestMetadata("curriculumOs", "planning", "curriculum-taxonomy"),
}


TOOL_CATEGORIES: dict[str, str] = {
    toolName: metadata.category
    for toolName, metadata in TOOL_METADATA.items()
}


TOOL_LANES: dict[str, str] = {
    toolName: metadata.lane
    for toolName, metadata in TOOL_METADATA.items()
}


TOOL_TARGETS: dict[str, str] = {
    toolName: metadata.target
    for toolName, metadata in TOOL_METADATA.items()
}


TOOL_RISK: dict[str, str] = {
    toolName: metadata.risk
    for toolName, metadata in TOOL_METADATA.items()
}


def toolManifest() -> dict[str, Any]:
    tools = [_toolManifestItem(tool) for tool in allTools()]
    grouped: dict[str, list[str]] = {group: [] for group in TOOL_GROUPS}
    byLane: dict[str, list[str]] = {lane: [] for lane in TOOL_LANE_GROUPS}
    for tool in tools:
        grouped.setdefault(tool["category"], []).append(tool["name"])
        byLane.setdefault(tool["lane"], []).append(tool["name"])
    return {
        "groups": [
            {"id": groupId, **group}
            for groupId, group in TOOL_GROUPS.items()
        ],
        "lanes": [
            {"id": laneId, **lane}
            for laneId, lane in TOOL_LANE_GROUPS.items()
        ],
        "tools": tools,
        "grouped": grouped,
        "byLane": byLane,
    }


def toolDescriptor(toolName: str) -> dict[str, Any]:
    from .toolRegistry import getTool

    tool = getTool(toolName)
    if tool is None:
        metadata = _metadataForToolName(toolName)
        return {
            "name": toolName,
            "category": metadata.category,
            "lane": metadata.lane,
            "target": metadata.target,
            "risk": metadata.risk,
        }
    return _toolManifestItem(tool)


def _toolManifestItem(tool: ToolDef) -> dict[str, Any]:
    required = tool.parameters.get("required", [])
    properties = tool.parameters.get("properties", {})
    metadata = _metadataForToolName(tool.name)
    return {
        "name": tool.name,
        "description": tool.description,
        "handler": tool.handler,
        "category": metadata.category,
        "lane": metadata.lane,
        "target": metadata.target,
        "risk": metadata.risk,
        "required": required if isinstance(required, list) else [],
        "parameters": list(properties.keys()) if isinstance(properties, dict) else [],
    }


def _metadataForToolName(toolName: str) -> ToolManifestMetadata:
    return TOOL_METADATA.get(toolName, ToolManifestMetadata("workbench", "write", "learning-editor"))
