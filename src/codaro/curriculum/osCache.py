"""Curriculum OS — taxonomy/LessonGraph lazy cache.

서버 부팅에 비용을 더하지 않도록 lazy하게 로드하고, 메모리에서 보존한다.
StudyLoader가 없거나 taxonomy가 없을 때도 안전하게 빈 그래프를 돌려준다.
"""
from __future__ import annotations

from threading import Lock

from .lessonGraph import LessonGraph, buildLessonGraph
from .studyLoader import StudyLoader
from .taxonomy import CurriculumTaxonomy, loadTaxonomy


class CurriculumOsCache:
    def __init__(self, studyLoader: StudyLoader | None) -> None:
        self._studyLoader = studyLoader
        self._taxonomy: CurriculumTaxonomy | None = None
        self._graph: LessonGraph | None = None
        self._lock = Lock()

    def taxonomy(self) -> CurriculumTaxonomy:
        if self._taxonomy is None:
            with self._lock:
                if self._taxonomy is None:
                    self._taxonomy = loadTaxonomy()
        return self._taxonomy

    def graph(self) -> LessonGraph:
        if self._graph is None:
            with self._lock:
                if self._graph is None:
                    if self._studyLoader is None:
                        self._graph = LessonGraph()
                    else:
                        self._graph = buildLessonGraph(self._studyLoader, self.taxonomy())
        return self._graph

    def invalidate(self) -> None:
        with self._lock:
            self._taxonomy = None
            self._graph = None
