from __future__ import annotations

from ..toolRegistry import ToolDef


TOOL_EXECUTE_REACTIVE = ToolDef(
    name="execute-reactive",
    description="Execute a code block and reactively re-execute all dependent blocks.",
    parameters={
        "type": "object",
        "properties": {
            "blockId": {
                "type": "string",
                "description": "The ID of the code block to execute.",
            },
        },
        "required": ["blockId"],
    },
    handler="executeReactive",
)

TOOL_GET_VARIABLES = ToolDef(
    name="get-variables",
    description="Get the current variable registry from the active kernel session.",
    parameters={
        "type": "object",
        "properties": {},
    },
    handler="getVariables",
)

TOOL_FS_WRITE = ToolDef(
    name="fs-write",
    description="Create or overwrite a file in the workspace. Useful for creating exercise data files.",
    parameters={
        "type": "object",
        "properties": {
            "path": {
                "type": "string",
                "description": "Relative path within the workspace.",
            },
            "content": {
                "type": "string",
                "description": "File content to write.",
            },
        },
        "required": ["path", "content"],
    },
    handler="fsWrite",
)

TOOL_PACKAGES_CHECK = ToolDef(
    name="packages-check",
    description="Check whether Python packages are already installed in the workspace environment before installing or running dependent cells.",
    parameters={
        "type": "object",
        "properties": {
            "names": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Package names to check, e.g. ['pandas', 'matplotlib'].",
            },
        },
        "required": ["names"],
    },
    handler="packagesCheck",
)

TOOL_PACKAGES_INSTALL = ToolDef(
    name="packages-install",
    description="Install a Python package in the workspace environment.",
    parameters={
        "type": "object",
        "properties": {
            "name": {
                "type": "string",
                "description": "Package name to install (e.g., 'pandas', 'matplotlib').",
            },
        },
        "required": ["name"],
    },
    handler="packagesInstall",
)

TOOL_CHECK_EXERCISE = ToolDef(
    name="check-exercise",
    description="Check if a student's code block output matches the expected answer.",
    parameters={
        "type": "object",
        "properties": {
            "blockId": {
                "type": "string",
                "description": "The ID of the block containing the student's answer.",
            },
            "checkType": {
                "type": "string",
                "enum": ["outputMatch", "outputContains", "variableCheck", "codeContains", "noError"],
                "description": "Type of check to perform.",
            },
            "expected": {
                "type": "string",
                "description": "Expected value or pattern to match against.",
            },
        },
        "required": ["blockId", "checkType"],
    },
    handler="checkExercise",
)
