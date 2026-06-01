from __future__ import annotations

import pytest

from codaro.automation.recipeAuthoring import (
    automationRecipeSlug,
    buildAutomationRecipeDraft,
    buildAutomationTaskDraft,
    validateAutomationTaskRecipeText,
)


def testBuildAutomationRecipeDraftCreatesPercentFormatRecipe() -> None:
    draft = buildAutomationRecipeDraft(
        title="Daily Report",
        description="Prepare a recurring report.",
        code="print('ready')",
    )

    assert draft.outputPath == "automations/daily-report.py"
    assert draft.dryRunFirst is True
    assert draft.automationBody == "DRY_RUN = True\n\nprint('ready')\n"
    assert "# %% [markdown]" in draft.recipe
    assert "# Daily Report" in draft.recipe
    assert "# %% [automation]" in draft.recipe
    assert "DRY_RUN = True" in draft.recipe


def testAutomationRecipeSlugUsesStableAsciiFallback() -> None:
    assert automationRecipeSlug("Daily Report!") == "daily-report"
    assert automationRecipeSlug("자동화") == "automation-recipe"


def testBuildAutomationTaskDraftNormalizesAndValidatesInputs() -> None:
    draft = buildAutomationTaskDraft(
        name=" Run report ",
        documentPath=" automations/report.py ",
        description=" Scheduled report ",
        schedule="@every_15m",
        inputs={"dryRun": True},
    )

    assert draft.name == "Run report"
    assert draft.documentPath == "automations/report.py"
    assert draft.description == "Scheduled report"
    assert draft.schedule == "@every_15m"
    assert draft.inputs == {"dryRun": True}


def testBuildAutomationTaskDraftRejectsInvalidSchedule() -> None:
    with pytest.raises(ValueError, match="Invalid schedule"):
        buildAutomationTaskDraft(
            name="Run report",
            documentPath="automations/report.py",
            schedule="every day",
        )


def testBuildAutomationTaskDraftRejectsNonObjectInputs() -> None:
    with pytest.raises(TypeError, match="inputs must be an object"):
        buildAutomationTaskDraft(
            name="Run report",
            documentPath="automations/report.py",
            inputs=["bad"],
        )


def testValidateAutomationTaskRecipeRequiresPercentFormatDryRun() -> None:
    validation = validateAutomationTaskRecipeText("# %% [automation]\nDRY_RUN = True\n\nprint('ready')\n")

    assert validation.percentFormat is True
    assert validation.dryRunFirst is True

    with pytest.raises(ValueError, match="percent-format automation cell"):
        validateAutomationTaskRecipeText("DRY_RUN = True\nprint('ready')\n")

    with pytest.raises(ValueError, match="DRY_RUN = True"):
        validateAutomationTaskRecipeText("# %% [automation]\nprint('ready')\n")
