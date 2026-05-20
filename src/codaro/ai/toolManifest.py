from __future__ import annotations

from typing import Any

from .toolRegistry import ToolDef, allTools


TOOL_GROUPS: dict[str, dict[str, str]] = {
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


TOOL_CATEGORIES: dict[str, str] = {
    "read-cells": "workbench",
    "write-cell": "workbench",
    "cell-call": "runtime",
    "write-curriculum-yaml": "learning",
    "insert-block": "workbench",
    "update-block": "workbench",
    "delete-block": "workbench",
    "get-blocks": "workbench",
    "execute-reactive": "runtime",
    "get-variables": "runtime",
    "check-exercise": "runtime",
    "create-guide": "learning",
    "create-learning-card": "learning",
    "create-quiz": "learning",
    "create-notebook-exercise": "learning",
    "track-achievement": "learning",
    "split-notebook": "files",
    "generate-notebook": "files",
    "fs-write": "files",
    "packages-check": "files",
    "packages-install": "files",
    "http-request": "automation",
    "start-recording": "automation",
    "stop-recording": "automation",
    "run-automation": "automation",
    "capture-screen": "sensory",
    "read-screen-text": "sensory",
    "find-element": "sensory",
    "detect-elements": "sensory",
    "voice-listen": "sensory",
    "voice-speak": "sensory",
    "send-notification": "sensory",
    "click-element": "safety",
    "type-text": "safety",
    "press-hotkey": "safety",
    "wait-for": "safety",
    "emergency-stop": "safety",
}


TOOL_LANES: dict[str, str] = {
    "read-cells": "read",
    "write-cell": "write",
    "cell-call": "cell-call",
    "write-curriculum-yaml": "curriculum",
    "get-blocks": "read",
    "get-variables": "read",
    "insert-block": "write",
    "update-block": "write",
    "delete-block": "write",
    "execute-reactive": "cell-call",
    "check-exercise": "cell-call",
    "create-guide": "write",
    "create-learning-card": "write",
    "create-quiz": "write",
    "create-notebook-exercise": "write",
    "track-achievement": "progress",
    "split-notebook": "write",
    "generate-notebook": "write",
    "fs-write": "write",
    "packages-check": "read",
    "packages-install": "write",
    "http-request": "automation",
    "start-recording": "automation",
    "stop-recording": "automation",
    "run-automation": "automation",
    "capture-screen": "read",
    "read-screen-text": "read",
    "find-element": "read",
    "detect-elements": "read",
    "voice-listen": "read",
    "voice-speak": "automation",
    "send-notification": "automation",
    "click-element": "safety",
    "type-text": "safety",
    "press-hotkey": "safety",
    "wait-for": "safety",
    "emergency-stop": "safety",
}


TOOL_TARGETS: dict[str, str] = {
    "read-cells": "learning-editor",
    "write-cell": "learning-editor",
    "cell-call": "learning-editor",
    "write-curriculum-yaml": "curriculum-yaml",
    "get-blocks": "learning-editor",
    "insert-block": "learning-editor",
    "update-block": "learning-editor",
    "delete-block": "learning-editor",
    "execute-reactive": "kernel-runtime",
    "get-variables": "kernel-runtime",
    "check-exercise": "kernel-runtime",
    "create-guide": "learning-editor",
    "create-learning-card": "learning-editor",
    "create-quiz": "learning-editor",
    "create-notebook-exercise": "learning-editor",
    "track-achievement": "learner-progress",
    "split-notebook": "file-system",
    "generate-notebook": "learning-editor",
    "fs-write": "file-system",
    "packages-check": "kernel-runtime",
    "packages-install": "kernel-runtime",
    "http-request": "external-api",
    "start-recording": "desktop-automation",
    "stop-recording": "desktop-automation",
    "run-automation": "desktop-automation",
    "capture-screen": "screen",
    "read-screen-text": "screen",
    "find-element": "screen",
    "detect-elements": "screen",
    "voice-listen": "voice",
    "voice-speak": "voice",
    "send-notification": "external-channel",
    "click-element": "guarded-input",
    "type-text": "guarded-input",
    "press-hotkey": "guarded-input",
    "wait-for": "guarded-input",
    "emergency-stop": "automation-safety",
}


TOOL_RISK: dict[str, str] = {
    "write-cell": "writes",
    "delete-block": "destructive",
    "write-curriculum-yaml": "writes",
    "fs-write": "writes",
    "packages-install": "writes",
    "http-request": "external",
    "click-element": "input",
    "type-text": "input",
    "press-hotkey": "input",
    "run-automation": "input",
    "emergency-stop": "safety",
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
        return {
            "name": toolName,
            "category": TOOL_CATEGORIES.get(toolName, "workbench"),
            "lane": TOOL_LANES.get(toolName, "write"),
            "target": TOOL_TARGETS.get(toolName, "learning-editor"),
            "risk": TOOL_RISK.get(toolName, "normal"),
        }
    return _toolManifestItem(tool)


def _toolManifestItem(tool: ToolDef) -> dict[str, Any]:
    required = tool.parameters.get("required", [])
    properties = tool.parameters.get("properties", {})
    return {
        "name": tool.name,
        "description": tool.description,
        "handler": tool.handler,
        "category": TOOL_CATEGORIES.get(tool.name, "workbench"),
        "lane": TOOL_LANES.get(tool.name, "write"),
        "target": TOOL_TARGETS.get(tool.name, "learning-editor"),
        "risk": TOOL_RISK.get(tool.name, "normal"),
        "required": required if isinstance(required, list) else [],
        "parameters": list(properties.keys()) if isinstance(properties, dict) else [],
    }
