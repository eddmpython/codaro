from __future__ import annotations

from dataclasses import dataclass

from .contentCache import CurriculumContentCache
from .progress import ProgressTracker
from .studyLoader import CATEGORY_GROUPS, CATEGORY_MAPPING, LEARNING_PATHS, StudyLoader, curriculumCategoryTree


class CurriculumContentError(Exception):
    def __init__(self, code: str, message: str, *, statusCode: int = 400) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.statusCode = statusCode


@dataclass(frozen=True)
class CurriculumContentResult:
    payload: dict[str, object]
    blockCount: int
    solutionCount: int


class CurriculumContentFlow:
    def __init__(
        self,
        *,
        studyLoader: StudyLoader | None,
        progressTracker: ProgressTracker,
        contentCache: CurriculumContentCache | None = None,
    ) -> None:
        self._studyLoader = studyLoader
        self._progressTracker = progressTracker
        self._contentCache = contentCache or CurriculumContentCache()

    def categoriesPayload(self) -> dict[str, object]:
        return buildCurriculumCategoriesPayload(self._studyLoader)

    def contentsPayload(self, *, category: str) -> dict[str, object]:
        return buildCurriculumContentsPayload(self._studyLoader, category=category)

    def contentPayload(self, *, category: str, contentId: str) -> CurriculumContentResult:
        return loadCurriculumContentPayload(
            studyLoader=self._studyLoader,
            contentCache=self._contentCache,
            progressTracker=self._progressTracker,
            category=category,
            contentId=contentId,
        )


def buildCurriculumCategoriesPayload(studyLoader: StudyLoader | None) -> dict[str, object]:
    if studyLoader is None:
        return {"categories": [], "groups": {}, "tree": [], "learningPaths": {}}
    categories = studyLoader.listCategories()
    return {
        "categories": [category.model_dump() for category in categories],
        "groups": CATEGORY_GROUPS,
        "tree": curriculumCategoryTree(),
        "learningPaths": LEARNING_PATHS,
    }


def buildCurriculumContentsPayload(studyLoader: StudyLoader | None, *, category: str) -> dict[str, object]:
    if studyLoader is None:
        raise CurriculumContentError(
            "curriculum_unavailable",
            "Curriculum content not available.",
            statusCode=404,
        )
    contents = studyLoader.listContents(category)
    return {
        "category": category,
        "categoryName": CATEGORY_MAPPING.get(category, category),
        "contents": [{"contentId": content.contentId, "title": content.title} for content in contents],
    }


def loadCurriculumContentPayload(
    *,
    studyLoader: StudyLoader | None,
    contentCache: CurriculumContentCache,
    progressTracker: ProgressTracker,
    category: str,
    contentId: str,
) -> CurriculumContentResult:
    if studyLoader is None:
        raise CurriculumContentError(
            "curriculum_unavailable",
            "Curriculum content not available.",
            statusCode=404,
        )
    try:
        payload = contentCache.get(studyLoader, category, contentId)
    except FileNotFoundError as exc:
        raise CurriculumContentError(
            "curriculum_content_not_found",
            "Content not found.",
            statusCode=404,
        ) from exc
    progressTracker.markAccessed(category, contentId)
    return CurriculumContentResult(
        payload=payload.response(),
        blockCount=payload.blockCount,
        solutionCount=payload.solutionCount,
    )
