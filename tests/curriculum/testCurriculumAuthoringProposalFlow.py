import pytest

from codaro.curriculum.authoringProposalFlow import (
    CurriculumAuthoringProposalError,
    buildVariationProposalPayload,
    generateVariationDrafts,
)


class StudyLoader:
    def loadStudy(self, category: str, contentId: str) -> dict[str, object]:
        if contentId == "missing":
            raise FileNotFoundError(contentId)
        return {
            "meta": {"title": "Variables"},
            "sections": [
                {
                    "id": "intro",
                    "title": "Variables intro",
                    "exercise": {
                        "prompt": "Change the value.",
                        "starterCode": "score = 10\nprint(score)",
                        "solution": "score = 10\nprint(score)",
                    },
                },
                {
                    "id": "practice",
                    "title": "Additional practice",
                    "exercise": {"prompt": "Run it.", "starterCode": "print('ok')"},
                },
            ],
        }


def testVariationProposalPayloadUsesSectionExerciseCode() -> None:
    payload = buildVariationProposalPayload(
        studyLoader=StudyLoader(),
        category="python",
        contentId="variables",
        sectionId="intro",
        count=2,
    )

    assert payload["baseSnippet"] == "score = 10\nprint(score)"
    assert len(payload["drafts"]) == 2
    assert "20" in payload["drafts"][0]["starterCode"]


def testVariationProposalRejectsMissingSection() -> None:
    with pytest.raises(CurriculumAuthoringProposalError) as excInfo:
        buildVariationProposalPayload(
            studyLoader=StudyLoader(),
            category="python",
            contentId="variables",
            sectionId="missing",
        )

    assert excInfo.value.code == "curriculum_section_not_found"


def testGenerateVariationDraftsFallsBackWhenNoLiteralFound() -> None:
    drafts = generateVariationDrafts("value = input()\nprint(value)", count=3)

    assert drafts == [
        {
            "parameterization": "동일 흐름 재호출 (입력값 변경 미감지)",
            "starterCode": "value = input()\nprint(value)",
            "solution": "(작성자가 새 입력/예상결과를 정의)",
            "promptHint": "이 코드를 다른 입력으로 실행한 결과를 비교하세요.",
        }
    ]
