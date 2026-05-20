from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..document.models import CodaroDocument
from .converter import yamlToDocument
from .studyLoader import StudyLoader


@dataclass(frozen=True, slots=True)
class CurriculumContentPayload:
    category: str
    contentId: str
    document: CodaroDocument
    solutions: dict[str, str]
    prevNext: dict[str, Any]

    @property
    def blockCount(self) -> int:
        return len(self.document.blocks)

    @property
    def solutionCount(self) -> int:
        return len(self.solutions)

    def response(self) -> dict[str, object]:
        return {
            "document": self.document.model_dump(),
            "solutions": dict(self.solutions),
            "category": self.category,
            "contentId": self.contentId,
            "prevNext": dict(self.prevNext),
        }


@dataclass(frozen=True, slots=True)
class CachedCurriculumContent:
    document: CodaroDocument
    solutions: dict[str, str]
    prevNext: dict[str, Any]

    def payload(self, category: str, contentId: str) -> CurriculumContentPayload:
        return CurriculumContentPayload(
            category=category,
            contentId=contentId,
            document=self.document.model_copy(deep=True),
            solutions=dict(self.solutions),
            prevNext=dict(self.prevNext),
        )


class CurriculumContentCache:
    def __init__(self) -> None:
        self._cache: dict[str, CachedCurriculumContent] = {}

    def get(self, studyLoader: StudyLoader, category: str, contentId: str) -> CurriculumContentPayload:
        cacheKey = f"{category}/{contentId}"
        cached = self._cache.get(cacheKey)
        if cached is None:
            yamlContent = studyLoader.loadStudy(category, contentId)
            document, solutions = yamlToDocument(yamlContent, category, contentId)
            cached = CachedCurriculumContent(
                document=document,
                solutions=dict(solutions),
                prevNext=dict(studyLoader.getPrevNext(category, contentId)),
            )
            self._cache[cacheKey] = cached
        return cached.payload(category, contentId)
