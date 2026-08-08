"""학습 출력 비교(outputMatch)의 계약 벡터와 TS 미러 동기화를 검증한다."""
from __future__ import annotations

import json
import re
from pathlib import Path

import pytest
import yaml

from codaro.curriculum.outputMatch import (
    matchLearningOutput,
    normalizeLearningOutput,
    normalizeOutputGradingPolicy,
)

ROOT = Path(__file__).resolve().parents[2]
VECTORS_PATH = ROOT / "contracts" / "learning-content" / "outputMatchVectors.json"
TS_MIRROR_PATH = ROOT / "editor" / "src" / "lib" / "learningOutputMatch.ts"
DAY06_PATH = ROOT / "curricula" / "python" / "basics" / "30days" / "day06_문자열메서드.yaml"
DAY01_PATH = ROOT / "curricula" / "python" / "basics" / "30days" / "day01_헬로월드.yaml"


def loadVectors() -> list[dict]:
    payload = json.loads(VECTORS_PATH.read_text(encoding="utf-8"))
    assert payload["schemaVersion"] == 3
    vectors = payload["vectors"]
    assert vectors, "계약 벡터가 비어 있다"
    assert len({vector["id"] for vector in vectors}) == len(vectors)
    return vectors


@pytest.mark.parametrize("vector", loadVectors(), ids=lambda vector: vector["id"])
def testPythonMatcherSatisfiesContractVectors(vector: dict) -> None:
    verdict = matchLearningOutput(
        vector["expected"],
        vector["actual"],
        comparator=vector["comparator"],
        gradingPolicy=vector.get("gradingPolicy"),
    )
    assert verdict.passed == vector["passed"], verdict.feedback
    assert verdict.tier == vector["tier"], verdict.feedback
    # 실패 피드백은 항상 무엇이 다른지 말해야 한다. 빈 문구 금지.
    assert verdict.feedback


def testNormalizationForgivesOnlyInvisibleDifferences() -> None:
    assert normalizeLearningOutput("a \r\nb\t\n\n") == "a\nb"
    assert normalizeLearningOutput("\n\n결과") == "결과"
    # 줄 안 공백과 대소문자는 보존한다(보이는 차이).
    assert normalizeLearningOutput("a  b") == "a  b"
    assert normalizeLearningOutput("Hello") == "Hello"


def testDifferentTierPointsAtFirstDifferingLine() -> None:
    verdict = matchLearningOutput("1일차\n2일차\n3일차", "1일차\n둘째날\n3일차")
    assert "2번째 줄" in verdict.feedback
    assert "2일차" in verdict.feedback and "둘째날" in verdict.feedback


def testCaseOnlyFeedbackShowsBothSpellings() -> None:
    verdict = matchLearningOutput("Hello Codaro", "hello codaro", comparator="exact")
    assert "대소문자" in verdict.feedback
    assert "Hello Codaro" in verdict.feedback and "hello codaro" in verdict.feedback


def testTextComparatorAcceptsCaseOnlyDifferenceWithTransparentFeedback() -> None:
    verdict = matchLearningOutput("Hello Codaro", "hello codaro", comparator="text")
    assert verdict.passed is True
    assert verdict.tier == "text"
    assert "대소문자 차이는 허용" in verdict.feedback


def testAutoComparatorIsDefaultAndExplainsAcceptedNumberDifference() -> None:
    verdict = matchLearningOutput("0.3", "0.30000000000000004")
    assert verdict.passed is True
    assert verdict.tier == "number"
    assert "계산 오차는 허용" in verdict.feedback


def testAutoComparatorExplainsStructuredMismatch() -> None:
    verdict = matchLearningOutput("{'items': [1, 2]}", "{'items': [2, 1]}")
    assert verdict.passed is False
    assert verdict.tier == "valueDifferent"
    assert "값이나 구조가 다릅니다" in verdict.feedback


def testUnknownComparatorIsRejected() -> None:
    with pytest.raises(ValueError, match="지원하지 않는 출력 비교 방식"):
        matchLearningOutput("Hello", "hello", comparator="guess")


@pytest.mark.parametrize(
    "policy",
    [
        {"caseSensitive": "no"},
        {"whitespace": "loose"},
        {"relativeTolerance": -1},
        {"absoluteTolerance": float("inf")},
        {"listOrder": "sorted"},
        {"typo": True},
    ],
)
def testInvalidPerExercisePolicyIsRejected(policy: dict) -> None:
    with pytest.raises(ValueError):
        normalizeOutputGradingPolicy(policy)


def testOrderedListMismatchExplainsTheOrderProblem() -> None:
    verdict = matchLearningOutput("[1, 2, 3]", "[3, 2, 1]")
    assert verdict.passed is False
    assert "원소는 맞지만 순서" in verdict.feedback


def testNumericMismatchExplainsTheAllowedTolerance() -> None:
    verdict = matchLearningOutput("10", "12", gradingPolicy={"absoluteTolerance": 1})
    assert verdict.passed is False
    assert "허용 오차" in verdict.feedback


def testDayOneReplacementTargetIsInlineAndConsistent() -> None:
    lesson = yaml.safe_load(DAY01_PATH.read_text(encoding="utf-8"))
    sections = {section["id"]: section for section in lesson["sections"]}
    exercise = sections["print_multiple"]["exercise"]
    check = sections["print_multiple"]["check"]
    assert "____를 '바뀐 두 번째 줄'로 바꾸세요" in exercise["prompt"]
    assert "아래 글자로 바꾸세요" not in exercise["prompt"]
    assert "바뀐 두 번째 줄" in exercise["solution"]
    assert "바뀐 두 번째 줄" in check["outputExact"]


def testCaseTransformationExercisesKeepExactComparison() -> None:
    lesson = yaml.safe_load(DAY06_PATH.read_text(encoding="utf-8"))
    sections = {section["id"]: section for section in lesson["sections"]}
    strictIds = {
        "method_upper",
        "method_lower",
        "method_capitalize",
        "method_title",
        "practice",
    }
    for sectionId in strictIds:
        assert sections[sectionId]["check"]["comparator"] == "exact"


def testTsMirrorStaysInSync() -> None:
    """TS 미러가 같은 규칙 집합을 선언하는지 구조적으로 확인한다.

    실행 결과 동등성은 계약 벡터(공유 JSON)와 브라우저 학습 게이트가 잡고,
    여기서는 규칙 상수가 한쪽만 바뀌는 드리프트를 막는다.
    """
    mirror = TS_MIRROR_PATH.read_text(encoding="utf-8")
    for marker in (
        "outputMatchVectors.json",
        "normalizeLearningOutput",
        "matchLearningOutput",
        '"caseOnly"',
        '"auto"',
        '"number"',
        '"value"',
        '"valueDifferent"',
        '"whitespaceOnly"',
        '"different"',
        "LiteralParser",
        '"text"',
        "번째 줄부터 다릅니다",
        "대소문자만 다릅니다",
        "공백 개수나 줄바꿈이 다릅니다",
    ):
        assert marker in mirror, f"TS 미러에 {marker} 가 없다"
    # 정규화 규칙: 줄 끝 공백 제거 + CRLF 통일 + 앞뒤 빈 줄 제거.
    assert re.search(r"replace\(/\\r\\n\?/g", mirror)
    assert "[ \\t\\f\\v]+$" in mirror
