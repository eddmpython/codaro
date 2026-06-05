"""GoalResolver — 키워드 매칭 + AI ranking blend 회귀 테스트."""
from __future__ import annotations

from dataclasses import dataclass

from codaro.curriculum.goalResolver import (
    GoalResolution,
    clearResolutionCache,
    resolveGoal,
)
from codaro.curriculum.taxonomy import loadTaxonomy


@dataclass
class _FakeResponse:
    answer: str


class _FakeAiProvider:
    """결정적 fake — 미리 짠 응답을 그대로 돌려준다."""

    def __init__(self, answer: str, callCount: list[int] | None = None) -> None:
        self.answer = answer
        self.calls: list[list[dict[str, str]]] = []
        self._counter = callCount if callCount is not None else []

    def complete(self, messages):
        self.calls.append(messages)
        self._counter.append(1)
        return _FakeResponse(answer=self.answer)


class _BrokenAiProvider:
    def complete(self, messages):
        raise RuntimeError("simulated provider failure")


def testEmptyIntentReturnsNone() -> None:
    taxonomy = loadTaxonomy()
    result = resolveGoal("", taxonomy)
    assert result.source == "none"
    assert result.matchedKeywords == []
    assert result.aiSuggestedOutcomes == []


def testKoreanKeywordMatchesDashboard() -> None:
    taxonomy = loadTaxonomy()
    result = resolveGoal("판매 대시보드 만들기", taxonomy)
    assert result.source == "keyword"
    assert "대시보드" in result.matchedKeywords
    # plotly, altair, seaborn, matplotlib, folium 중 하나 이상 boost
    assert any(c in result.boostedCategories for c in ("plotly", "altair", "seaborn", "matplotlib"))


def testKoreanKeywordMatchesReport() -> None:
    taxonomy = loadTaxonomy()
    result = resolveGoal("월별 매출 보고서 자동화", taxonomy)
    assert result.source == "keyword"
    # 보고서 + 자동화 둘 다 매칭
    assert "보고서" in result.matchedKeywords
    assert "자동화" in result.matchedKeywords


def testNonMatchingIntentSourceNone() -> None:
    taxonomy = loadTaxonomy()
    result = resolveGoal("ㅁㄴㅇㄹ 알아들을 수 없는 문장", taxonomy)
    assert result.source == "none"
    assert result.matchedKeywords == []


def testOutcomeSuggestionsAreDeterministic() -> None:
    taxonomy = loadTaxonomy()
    a = resolveGoal("엑셀 보고서", taxonomy)
    b = resolveGoal("엑셀 보고서", taxonomy)
    assert a.model_dump() == b.model_dump(), "같은 입력은 같은 결과를 반환해야 한다"


def testKeywordMatchProducesOutcomeSuggestions() -> None:
    taxonomy = loadTaxonomy()
    result = resolveGoal("머신러닝 분류 모델", taxonomy)
    assert result.source == "keyword"
    # 머신러닝 → sklearn / scipy / statsmodels 중 하나라도 boost
    assert any(c in result.boostedCategories for c in ("sklearn", "scipy", "statsmodels"))
    # sklearn 레슨들이 가르치는 outcome (ml.*) 이 최소 1개 추천돼야 함
    assert len(result.aiSuggestedOutcomes) >= 1, f"expected outcome suggestions, got {result.aiSuggestedOutcomes}"
    mlOutcomes = [s for s in result.aiSuggestedOutcomes if s.outcomeId.startswith("ml.")]
    assert len(mlOutcomes) >= 1, f"expected ml.* outcomes, got {[s.outcomeId for s in result.aiSuggestedOutcomes]}"


def testAiProviderNoneFallsBackToKeyword() -> None:
    """aiProvider=None 일 때 키워드 결과만 반환 (회귀 없음)."""
    taxonomy = loadTaxonomy()
    result = resolveGoal("대시보드", taxonomy, aiProvider=None)
    assert result.source == "keyword"
    assert isinstance(result, GoalResolution)


def testReasoningIsHumanReadable() -> None:
    taxonomy = loadTaxonomy()
    result = resolveGoal("엑셀 자동화", taxonomy)
    assert "매칭" in result.reasoning or "prioritize" in result.reasoning.lower()


def testAiProviderBlendedRanking() -> None:
    clearResolutionCache()
    taxonomy = loadTaxonomy()
    # 첫 outcome / domain 의 id 를 그대로 추천하게 한다 (결정적).
    firstOutcomeId = taxonomy.outcomes[0].id
    firstDomainId = taxonomy.domains[0].id
    fakeJson = (
        '{"outcomes": [{"id": "%s", "score": 9, "reason": "fake"}],'
        ' "domains": [{"id": "%s", "score": 8, "reason": "fake"}],'
        ' "summary": "AI 해석 결과"}'
    ) % (firstOutcomeId, firstDomainId)
    provider = _FakeAiProvider(fakeJson)
    result = resolveGoal("판매 대시보드 만들기", taxonomy, aiProvider=provider, useCache=False)
    assert result.source == "blended", f"expected blended, got {result.source}"
    assert any(s.outcomeId == firstOutcomeId for s in result.aiSuggestedOutcomes)
    assert any(d.domainId == firstDomainId for d in result.aiSuggestedDomains)
    assert "AI 해석 결과" in result.reasoning


def testAiSourceWithoutKeywordMatch() -> None:
    clearResolutionCache()
    taxonomy = loadTaxonomy()
    firstOutcomeId = taxonomy.outcomes[0].id
    fakeJson = (
        '{"outcomes": [{"id": "%s", "score": 7, "reason": "ok"}], "domains": [], "summary": "x"}'
    ) % firstOutcomeId
    provider = _FakeAiProvider(fakeJson)
    # 키워드 매칭 안 되는 문구.
    result = resolveGoal("ㅁㄴㅇㄹ", taxonomy, aiProvider=provider, useCache=False)
    assert result.source == "ai"


def testInvalidAiResponseFallsBackToKeyword() -> None:
    clearResolutionCache()
    taxonomy = loadTaxonomy()
    provider = _FakeAiProvider("not json at all {{ malformed")
    result = resolveGoal("대시보드", taxonomy, aiProvider=provider, useCache=False)
    assert result.source == "keyword", f"expected keyword fallback, got {result.source}"


def testBrokenAiProviderFallsBackToKeyword() -> None:
    clearResolutionCache()
    taxonomy = loadTaxonomy()
    provider = _BrokenAiProvider()
    result = resolveGoal("대시보드", taxonomy, aiProvider=provider, useCache=False)
    assert result.source == "keyword"


def testCachingDeterministic() -> None:
    clearResolutionCache()
    taxonomy = loadTaxonomy()
    counter: list[int] = []
    firstOutcomeId = taxonomy.outcomes[0].id
    fakeJson = (
        '{"outcomes": [{"id": "%s", "score": 9, "reason": "fake"}], "domains": [], "summary": "x"}'
    ) % firstOutcomeId
    provider = _FakeAiProvider(fakeJson, callCount=counter)
    a = resolveGoal("대시보드", taxonomy, aiProvider=provider, useCache=True)
    b = resolveGoal("대시보드", taxonomy, aiProvider=provider, useCache=True)
    assert a.model_dump() == b.model_dump()
    assert len(counter) == 1, "cache 가 두 번째 호출에서 AI 재호출을 막아야 한다"


def testAiResponseInCodeFenceParses() -> None:
    clearResolutionCache()
    taxonomy = loadTaxonomy()
    firstOutcomeId = taxonomy.outcomes[0].id
    fakeJson = (
        "여기 응답이에요:\n```json\n"
        '{"outcomes": [{"id": "%s", "score": 6, "reason": "in fence"}], "domains": [], "summary": "fenced"}'
        "\n```"
    ) % firstOutcomeId
    provider = _FakeAiProvider(fakeJson)
    result = resolveGoal("대시보드", taxonomy, aiProvider=provider, useCache=False)
    assert result.source == "blended"
    assert any(s.outcomeId == firstOutcomeId for s in result.aiSuggestedOutcomes)


def testMasterPlanCarriesGoalResolution() -> None:
    """composeMasterPlan(projectIntent=...) 가 plan.goalResolution 을 채워야 한다."""
    from codaro.curriculum.lessonGraph import buildLessonGraph
    from codaro.curriculum.planComposer import PlanGoal, composeMasterPlan
    from codaro.curriculum.studyLoader import StudyLoader
    from pathlib import Path

    clearResolutionCache()
    taxonomy = loadTaxonomy()
    curriculaDir = Path(__file__).resolve().parent.parent.parent / "curricula" / "python"
    loader = StudyLoader(str(curriculaDir))
    graph = buildLessonGraph(loader, taxonomy)
    goal = PlanGoal(domain="dataExploration", projectIntent="판매 대시보드 만들기")
    plan = composeMasterPlan(goal, graph, taxonomy)
    assert plan.goalResolution is not None
    assert plan.goalResolution["source"] == "keyword"
    assert "대시보드" in plan.goalResolution["matchedKeywords"]


def testMasterPlanWithoutIntentLeavesResolutionNone() -> None:
    from codaro.curriculum.lessonGraph import buildLessonGraph
    from codaro.curriculum.planComposer import PlanGoal, composeMasterPlan
    from codaro.curriculum.studyLoader import StudyLoader
    from pathlib import Path

    taxonomy = loadTaxonomy()
    curriculaDir = Path(__file__).resolve().parent.parent.parent / "curricula" / "python"
    loader = StudyLoader(str(curriculaDir))
    graph = buildLessonGraph(loader, taxonomy)
    goal = PlanGoal(domain="dataExploration")
    plan = composeMasterPlan(goal, graph, taxonomy)
    assert plan.goalResolution is None


def testUnknownOutcomeIdDropped() -> None:
    clearResolutionCache()
    taxonomy = loadTaxonomy()
    fakeJson = (
        '{"outcomes": [{"id": "totally.unknown.id", "score": 9, "reason": "nope"}],'
        ' "domains": [], "summary": "nothing valid"}'
    )
    provider = _FakeAiProvider(fakeJson)
    result = resolveGoal("ㅁㄴㅇㄹ", taxonomy, aiProvider=provider, useCache=False)
    # 모든 outcome 이 unknown 이라 ai suggestion 0 — 결과적으로 source 는 ai 인데 빈 리스트.
    # 키워드 매칭도 없으니 이 경우 source 는 "ai" 일 수 있다 (parsing 자체는 성공).
    assert result.source in ("ai", "keyword", "none")
    assert all(s.outcomeId != "totally.unknown.id" for s in result.aiSuggestedOutcomes)
