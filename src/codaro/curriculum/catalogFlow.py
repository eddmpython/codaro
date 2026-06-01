from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

from .learningSpec import AI_TEACHER_INSTRUCTIONS, EXERCISE_TYPES, HINT_STRATEGY, LESSON_STRUCTURE, PHILOSOPHY
from .taxonomy import CurriculumTaxonomy


class CurriculumCatalogSource(Protocol):
    def taxonomy(self) -> CurriculumTaxonomy:
        ...


@dataclass(frozen=True)
class CurriculumTaxonomyResult:
    payload: dict[str, object]
    outcomeCount: int
    domainCount: int


def buildCurriculumTaxonomyPayload(curriculumOs: CurriculumCatalogSource) -> CurriculumTaxonomyResult:
    taxonomy = curriculumOs.taxonomy()
    return CurriculumTaxonomyResult(
        payload={
            "outcomes": [outcome.model_dump() for outcome in taxonomy.outcomes],
            "domains": [domain.model_dump() for domain in taxonomy.domains],
        },
        outcomeCount=len(taxonomy.outcomes),
        domainCount=len(taxonomy.domains),
    )


def buildLearningSpecPayload() -> dict[str, object]:
    return {
        "philosophy": PHILOSOPHY,
        "exerciseTypes": EXERCISE_TYPES,
        "hintStrategy": HINT_STRATEGY,
        "lessonStructure": LESSON_STRUCTURE,
        "aiTeacherInstructions": AI_TEACHER_INSTRUCTIONS,
    }
