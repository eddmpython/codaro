from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .scheduler import parseScheduleSeconds


@dataclass(frozen=True)
class AutomationRecipeDraft:
    title: str
    description: str
    automationBody: str
    recipe: str
    outputPath: str
    dryRunFirst: bool


@dataclass(frozen=True)
class AutomationTaskDraft:
    name: str
    documentPath: str
    description: str
    schedule: str | None
    inputs: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class AutomationTaskRecipeValidation:
    percentFormat: bool
    dryRunFirst: bool


def buildAutomationRecipeDraft(
    *,
    title: str,
    code: str,
    description: str = "",
    dryRunFirst: bool = True,
) -> AutomationRecipeDraft:
    normalizedTitle = title.strip()
    normalizedCode = code.rstrip()
    if not normalizedTitle:
        raise ValueError("title is required")
    if not normalizedCode.strip():
        raise ValueError("code is required")

    automationBody = automationBodyText(code=normalizedCode, dryRunFirst=dryRunFirst)
    recipe = automationRecipeText(
        title=normalizedTitle,
        description=description.strip(),
        automationBody=automationBody,
    )
    return AutomationRecipeDraft(
        title=normalizedTitle,
        description=description.strip(),
        automationBody=automationBody,
        recipe=recipe,
        outputPath=f"automations/{automationRecipeSlug(normalizedTitle)}.py",
        dryRunFirst=dryRunFirst,
    )


def buildAutomationTaskDraft(
    *,
    name: str,
    documentPath: str,
    description: str = "",
    schedule: str | None = None,
    inputs: Any = None,
) -> AutomationTaskDraft:
    normalizedName = name.strip()
    normalizedPath = documentPath.strip()
    normalizedDescription = description.strip()
    normalizedSchedule = schedule.strip() if schedule else None
    if not normalizedName:
        raise ValueError("name is required")
    if not normalizedPath:
        raise ValueError("documentPath is required")
    if normalizedSchedule and parseScheduleSeconds(normalizedSchedule) is None:
        raise ValueError(f"Invalid schedule: {normalizedSchedule}")
    if inputs is not None and not isinstance(inputs, dict):
        raise TypeError("inputs must be an object")
    return AutomationTaskDraft(
        name=normalizedName,
        documentPath=normalizedPath,
        description=normalizedDescription,
        schedule=normalizedSchedule,
        inputs=dict(inputs or {}),
    )


def validateAutomationTaskRecipeText(recipeText: str) -> AutomationTaskRecipeValidation:
    if "# %% [automation]" not in recipeText:
        raise ValueError("Automation task requires a percent-format automation cell.")
    if "DRY_RUN = True" not in recipeText:
        raise ValueError("Automation task requires DRY_RUN = True before registration.")
    return AutomationTaskRecipeValidation(percentFormat=True, dryRunFirst=True)


def automationRecipeSlug(title: str) -> str:
    chars: list[str] = []
    for char in title.lower():
        if char.isascii() and char.isalnum():
            chars.append(char)
        elif chars and chars[-1] != "-":
            chars.append("-")
    slug = "".join(chars).strip("-")[:60].rstrip("-")
    return slug or "automation-recipe"


def automationBodyText(*, code: str, dryRunFirst: bool) -> str:
    dryRunLiteral = "True" if dryRunFirst else "False"
    return f"DRY_RUN = {dryRunLiteral}\n\n{code.rstrip()}\n"


def automationRecipeText(*, title: str, description: str, automationBody: str) -> str:
    summary = description or "Automation recipe."
    return (
        "# %% [markdown]\n"
        f"# {title}\n\n"
        f"{summary}\n\n"
        "# %% [automation]\n"
        f"{automationBody}"
    )
