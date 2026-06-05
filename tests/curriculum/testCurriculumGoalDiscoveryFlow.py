from types import SimpleNamespace

import pytest

from codaro.curriculum.goalDiscoveryFlow import (
    CurriculumGoalDiscoveryError,
    buildCurriculumDraftProposalPayload,
    inspectCurriculumPayload,
    resolveLearningGoalPayload,
    searchCurriculaPayload,
)
from codaro.curriculum.lessonGraph import LessonGraph, LessonNode
from codaro.curriculum.taxonomy import CurriculumTaxonomy, DomainDef, OutcomeDef


def curriculumOs() -> SimpleNamespace:
    taxonomy = CurriculumTaxonomy(
        outcomes=[OutcomeDef(id="python.variables", label="Variables")],
        domains=[
            DomainDef(
                id="dataReporting",
                label="Data reporting",
                description="Build reporting notebooks",
                targetOutcomes=["python.variables"],
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
                prerequisites=[],
                estimatedMinutes=15,
            )
        ]
    )
    return SimpleNamespace(taxonomy=lambda: taxonomy, graph=lambda: graph)


class StudyLoader:
    def loadStudy(self, category: str, contentId: str) -> dict[str, object]:
        assert (category, contentId) == ("python", "variables")
        return {
            "intro": {
                "direction": "Start with variables.",
                "benefits": ["Reusable values"],
            }
        }


def testResolveLearningGoalPayloadRanksDomainFallback() -> None:
    payload = resolveLearningGoalPayload(
        curriculumOs=curriculumOs(),
        goalText="report notebook",
        aiProvider=None,
        limit=3,
    )

    assert payload["goalText"] == "report notebook"
    assert payload["candidates"][0]["domainId"] == "dataReporting"


def testResolveLearningGoalPayloadRejectsMissingGoal() -> None:
    with pytest.raises(CurriculumGoalDiscoveryError) as excInfo:
        resolveLearningGoalPayload(
            curriculumOs=curriculumOs(),
            goalText="",
            aiProvider=None,
        )

    assert excInfo.value.code == "goal_text_required"


def testSearchCurriculaPayloadFiltersByQueryAndOutcome() -> None:
    payload = searchCurriculaPayload(
        curriculumOs=curriculumOs(),
        query="var",
        outcomeId="python.variables",
    )

    assert payload["total"] == 1
    assert payload["matches"][0]["contentId"] == "variables"


def testInspectCurriculumPayloadIncludesIntroSummary() -> None:
    payload = inspectCurriculumPayload(
        curriculumOs=curriculumOs(),
        studyLoader=StudyLoader(),
        category="python",
        contentId="variables",
    )

    assert payload["title"] == "Variables"
    assert payload["intro"]["direction"] == "Start with variables."


def testDraftProposalPayloadUsesOutcomeLabel() -> None:
    payload = buildCurriculumDraftProposalPayload(
        curriculumOs=curriculumOs(),
        outcomeId="python.variables",
        title="Variables lab",
        summary="Practice variables.",
        sectionOutline=["Read", "Practice"],
    )

    assert payload["draft"]["outcomeLabel"] == "Variables"
    assert payload["draft"]["sectionOutline"] == ["Read", "Practice"]
