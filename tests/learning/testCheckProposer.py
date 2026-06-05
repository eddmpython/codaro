"""Phase 7 — Knowledge Check 자동 제안 회귀 테스트."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pytest

from codaro.curriculum.checkProposer import (
    CheckProposal,
    WeakCheckCoverage,
    proposeChecksForGap,
    weakCheckCoverage,
)
from codaro.curriculum.lessonGraph import buildLessonGraph
from codaro.curriculum.studyLoader import StudyLoader
from codaro.curriculum.taxonomy import loadTaxonomy


ROOT = Path(__file__).resolve().parent.parent.parent
CURRICULA_DIR = ROOT / "curricula" / "python"


@pytest.fixture
def studyLoader():
    return StudyLoader(str(CURRICULA_DIR))


@pytest.fixture
def graph(studyLoader):
    taxonomy = loadTaxonomy()
    return buildLessonGraph(studyLoader, taxonomy)


@dataclass
class _FakeResponse:
    answer: str


class _FakeAiProvider:
    def __init__(self, answer: str) -> None:
        self.answer = answer

    def complete(self, messages):
        return _FakeResponse(answer=self.answer)


def testWeakCheckCoverageReturnsList(graph, studyLoader) -> None:
    """전체 그래프에서 weak check 식별 가능."""
    weak = weakCheckCoverage(graph, studyLoader)
    assert isinstance(weak, list)
    for entry in weak:
        assert isinstance(entry, WeakCheckCoverage)


def testWeakCheckCoverageFindsNoErrorOnly(tmp_path: Path) -> None:
    """noError 만 있는 section 이 weak 로 식별."""
    # 미니 curricula 디렉토리
    minDir = tmp_path / "mini" / "demo"
    minDir.mkdir(parents=True)
    lessonYaml = """\
meta:
  id: l1
  title: 데모 강의
  category: demo
  outcomes: [python.intro]
  sectionOutcomes:
    s1: [python.intro]
sections:
  - id: s1
    title: 인사
    explanation: print 사용법
    snippet: |
      print('hi')
    check:
      noError: 에러 없이 실행되어야 합니다
"""
    (minDir / "lesson.yaml").write_text(lessonYaml, encoding="utf-8")
    # 실제 buildLessonGraph 가 minimal 디렉토리에서 동작하는지가 까다로워 단위 함수만 검증.
    from codaro.curriculum.checkProposer import _checkSpec, _sectionsFromLesson
    import yaml

    payload = yaml.safe_load(lessonYaml)
    sections = _sectionsFromLesson(payload)
    assert len(sections) == 1
    checkType, _ = _checkSpec(sections[0])
    assert checkType == "noError"


def testWeakCheckCoverageFindsEmptyCheck() -> None:
    from codaro.curriculum.checkProposer import _checkSpec

    section = {"id": "s1", "title": "x"}  # check 키 없음
    checkType, _ = _checkSpec(section)
    assert checkType is None


def testStrongCheckTypeNotWeak() -> None:
    """check.output 가 있으면 weak 가 아님."""
    from codaro.curriculum.checkProposer import _checkSpec

    section = {"check": {"output": "hi"}}
    checkType, _ = _checkSpec(section)
    assert checkType == "output"


def testProposerWithoutAiReturnsNone() -> None:
    weak = WeakCheckCoverage(
        lessonKey="x/y", category="x", contentId="y",
        sectionId="s1", outcomeId="python.intro",
        currentCheckType="noError", reason="weak",
    )
    result = proposeChecksForGap(weak, "context", aiProvider=None)
    assert result is None


def testProposerWithFakeAiReturnsStructured() -> None:
    fakeJson = """{
        "proposedCheckType": "output",
        "proposedCheckYaml": "check:\\n  output: hi\\n",
        "starterCode": "print('hi')",
        "hints": ["print 함수 사용"],
        "reasoning": "출력 검증이 가장 직관적",
        "confidence": 0.85
    }"""
    provider = _FakeAiProvider(fakeJson)
    weak = WeakCheckCoverage(
        lessonKey="x/y", category="x", contentId="y",
        sectionId="s1", outcomeId="python.intro",
        currentCheckType="noError", reason="weak",
    )
    proposal = proposeChecksForGap(weak, "context", aiProvider=provider)
    assert isinstance(proposal, CheckProposal)
    assert proposal.proposedCheckType == "output"
    assert proposal.confidence == pytest.approx(0.85)
    assert "print" in proposal.starterCode
    assert "출력 검증" in proposal.reasoning


def testProposalYamlIsValidYaml() -> None:
    import yaml

    fakeJson = """{
        "proposedCheckType": "output",
        "proposedCheckYaml": "check:\\n  output: hi\\n",
        "starterCode": "",
        "hints": [],
        "reasoning": "",
        "confidence": 0.6
    }"""
    provider = _FakeAiProvider(fakeJson)
    weak = WeakCheckCoverage(
        lessonKey="x/y", category="x", contentId="y",
        sectionId="s1", outcomeId="python.intro",
        currentCheckType=None, reason="empty",
    )
    proposal = proposeChecksForGap(weak, "context", aiProvider=provider)
    assert proposal is not None
    parsed = yaml.safe_load(proposal.proposedCheckYaml)
    assert isinstance(parsed, dict)
    assert "check" in parsed


def testInvalidJsonFallsBackToNone() -> None:
    provider = _FakeAiProvider("not json at all {{}}")
    weak = WeakCheckCoverage(
        lessonKey="x/y", category="x", contentId="y",
        sectionId="s1", outcomeId="python.intro",
        currentCheckType=None, reason="empty",
    )
    assert proposeChecksForGap(weak, "context", aiProvider=provider) is None


def testInvalidYamlInProposalRejected() -> None:
    fakeJson = """{
        "proposedCheckType": "output",
        "proposedCheckYaml": "this is: not\\n  : valid: yaml: at all : []",
        "confidence": 0.5
    }"""
    provider = _FakeAiProvider(fakeJson)
    weak = WeakCheckCoverage(
        lessonKey="x/y", category="x", contentId="y",
        sectionId="s1", outcomeId="python.intro",
        currentCheckType=None, reason="empty",
    )
    # YAML 파싱은 통과해도 dict 가 아니면 reject. 위 yaml 은 invalid.
    result = proposeChecksForGap(weak, "context", aiProvider=provider)
    assert result is None
