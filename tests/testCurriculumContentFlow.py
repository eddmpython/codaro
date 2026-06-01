from types import SimpleNamespace

import pytest

from codaro.curriculum.contentFlow import (
    CurriculumContentError,
    buildCurriculumCategoriesPayload,
    buildCurriculumContentsPayload,
)


class _StudyLoader:
    def listCategories(self):
        return [SimpleNamespace(model_dump=lambda: {"key": "python", "name": "Python"})]

    def listContents(self, category):
        assert category == "python"
        return [SimpleNamespace(contentId="variables", title="Variables")]


def testCategoriesPayloadHandlesUnavailableLoader() -> None:
    assert buildCurriculumCategoriesPayload(None) == {
        "categories": [],
        "groups": {},
        "tree": [],
        "learningPaths": {},
    }


def testContentsPayloadMapsStudyLoaderSummaries() -> None:
    payload = buildCurriculumContentsPayload(_StudyLoader(), category="python")

    assert payload["category"] == "python"
    assert payload["contents"] == [{"contentId": "variables", "title": "Variables"}]


def testContentsPayloadRejectsUnavailableLoader() -> None:
    with pytest.raises(CurriculumContentError) as excInfo:
        buildCurriculumContentsPayload(None, category="python")

    assert excInfo.value.code == "curriculum_unavailable"
    assert excInfo.value.statusCode == 404
