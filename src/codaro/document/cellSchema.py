from __future__ import annotations

BLOCK_TYPES = ("code", "markdown", "automation")

CELL_ROLES = (
    "title",
    "explanation",
    "learning",
    "snippet",
    "exercise",
    "check",
    "visual",
    "automation",
    "skill",
)

EXECUTION_KINDS = (
    "python",
    "browser",
    "os",
    "mouse",
    "image",
    "task",
    "skill",
)

CELL_DISPLAY_KINDS = (
    "title",
    "hero",
    "prose",
    "callout",
    "code",
    "cardGrid",
    "comparison",
    "table",
    "media",
    "resource",
    "practice",
    "quiz",
    "centerText",
)


def schemaSummary() -> dict[str, tuple[str, ...]]:
    return {
        "blockTypes": BLOCK_TYPES,
        "cellRoles": CELL_ROLES,
        "executionKinds": EXECUTION_KINDS,
        "cellDisplayKinds": CELL_DISPLAY_KINDS,
    }
