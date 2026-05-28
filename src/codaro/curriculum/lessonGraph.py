"""레슨 + outcome 그래프 빌더.

StudyLoader의 카테고리/콘텐츠를 순회하면서 각 레슨이 어떤 outcome을 주고
무엇을 prerequisite로 요구하는지 묶어 LessonGraph를 만든다. 레슨 meta에
outcomes/prerequisites가 있으면 그것을 쓰고, 없으면 taxonomy.lessonOutcomes의
backfill을 쓴다.
"""
from __future__ import annotations

from pydantic import BaseModel, Field

from .studyLoader import StudyLoader, _readMetaHeader  # type: ignore[attr-defined]
from .taxonomy import CurriculumTaxonomy, LessonOutcomeRecord, mergeLessonRecord


class LessonNode(BaseModel):
    category: str
    contentId: str
    title: str
    sortKey: tuple = (0, "")
    outcomes: list[str] = Field(default_factory=list)
    prerequisites: list[str] = Field(default_factory=list)
    estimatedMinutes: int = 0
    practicalDomain: list[str] = Field(default_factory=list)
    sectionOutcomes: dict[str, list[str]] = Field(default_factory=dict)

    @property
    def key(self) -> str:
        return f"{self.category}/{self.contentId}"

    def outcomesForSection(self, sectionId: str) -> list[str]:
        explicit = self.sectionOutcomes.get(sectionId)
        if explicit:
            return list(explicit)
        return list(self.outcomes)


class LessonGraph(BaseModel):
    lessons: list[LessonNode] = Field(default_factory=list)

    def byKey(self, key: str) -> LessonNode | None:
        for lesson in self.lessons:
            if lesson.key == key:
                return lesson
        return None

    def lessonsProvidingOutcome(self, outcomeId: str) -> list[LessonNode]:
        return [lesson for lesson in self.lessons if outcomeId in lesson.outcomes]

    def lessonsInCategory(self, category: str) -> list[LessonNode]:
        return [lesson for lesson in self.lessons if lesson.category == category]

    def coveredOutcomes(self) -> set[str]:
        covered: set[str] = set()
        for lesson in self.lessons:
            covered.update(lesson.outcomes)
        return covered


def buildLessonGraph(
    studyLoader: StudyLoader,
    taxonomy: CurriculumTaxonomy,
) -> LessonGraph:
    """모든 카테고리의 레슨을 순회하여 LessonGraph를 만든다.

    레슨 YAML meta가 outcomes/prerequisites를 가지면 우선,
    없으면 taxonomy.lessonOutcomes에서 채운다.
    """
    nodes: list[LessonNode] = []
    for category in studyLoader.listCategories():
        for summary in studyLoader.listContents(category.key):
            # 레슨 YAML의 meta 전체를 직접 읽어 outcomes/prerequisites 등을 확보한다.
            try:
                filePath = studyLoader._getStudyPath(category.key, summary.contentId)  # noqa: SLF001
                meta = _readMetaHeader(filePath)
            except FileNotFoundError:
                meta = {}
            taxonomyRecord: LessonOutcomeRecord | None = taxonomy.lessonRecord(
                category.key, summary.contentId,
            )
            record = mergeLessonRecord(meta, taxonomyRecord)
            nodes.append(LessonNode(
                category=category.key,
                contentId=summary.contentId,
                title=summary.title,
                sortKey=summary.sortKey,
                outcomes=record.outcomes,
                prerequisites=record.prerequisites,
                estimatedMinutes=record.estimatedMinutes,
                practicalDomain=record.practicalDomain,
                sectionOutcomes=record.sectionOutcomes,
            ))
    return LessonGraph(lessons=nodes)
