from types import SimpleNamespace

import pytest

from codaro.curriculum.lessonGraph import LessonGraph, LessonNode
from codaro.curriculum.planningFlow import (
    CurriculumMasterPlanInput,
    CurriculumPlanningError,
    buildCurriculumGapsPayload,
    composeCurriculumMasterPlan,
)
from codaro.curriculum.progress import ProgressTracker
from codaro.curriculum.taxonomy import CurriculumTaxonomy, DomainDef, OutcomeDef


def smallCurriculumOs() -> SimpleNamespace:
    taxonomy = CurriculumTaxonomy(
        outcomes=[
            OutcomeDef(id="python.variables", label="Variables"),
            OutcomeDef(id="python.loops", label="Loops"),
        ],
        domains=[
            DomainDef(
                id="python-basics",
                label="Python Basics",
                targetOutcomes=["python.variables", "python.loops"],
            )
        ],
    )
    graph = LessonGraph(
        lessons=[
            LessonNode(
                category="python",
                contentId="variables",
                title="Variables",
                outcomes=["python.variables"],
            )
        ]
    )
    return SimpleNamespace(taxonomy=lambda: taxonomy, graph=lambda: graph)


def testCurriculumGapsPayloadReportsUncoveredDomainOutcomes() -> None:
    payload = buildCurriculumGapsPayload(curriculumOs=smallCurriculumOs(), domain="python-basics")

    assert payload == {
        "gaps": [
            {
                "domainId": "python-basics",
                "domainLabel": "Python Basics",
                "missing": [{"outcomeId": "python.loops", "outcomeLabel": "Loops"}],
            }
        ]
    }


def testCurriculumPlanningFlowRejectsUnknownDomain() -> None:
    with pytest.raises(CurriculumPlanningError) as excInfo:
        buildCurriculumGapsPayload(curriculumOs=smallCurriculumOs(), domain="missing")

    assert excInfo.value.code == "curriculum_unknown_domain"


def testMasterPlanInputValidationRejectsUnknownOutcome(tmp_path) -> None:
    with pytest.raises(CurriculumPlanningError) as excInfo:
        composeCurriculumMasterPlan(
            curriculumOs=smallCurriculumOs(),
            progressTracker=ProgressTracker(tmp_path / "progress.json"),
            learnerStateStore=None,
            request=CurriculumMasterPlanInput(outcomes=["missing.outcome"]),
        )

    assert excInfo.value.code == "curriculum_unknown_outcome"
