"""학습 출력 비교(outputMatch)의 계약 벡터와 TS 미러 동기화를 검증한다."""
from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

from codaro.curriculum.outputMatch import matchLearningOutput, normalizeLearningOutput

ROOT = Path(__file__).resolve().parents[2]
VECTORS_PATH = ROOT / "contracts" / "learning-content" / "outputMatchVectors.json"
TS_MIRROR_PATH = ROOT / "editor" / "src" / "lib" / "learningOutputMatch.ts"


def loadVectors() -> list[dict]:
    payload = json.loads(VECTORS_PATH.read_text(encoding="utf-8"))
    assert payload["schemaVersion"] == 1
    vectors = payload["vectors"]
    assert vectors, "계약 벡터가 비어 있다"
    assert len({vector["id"] for vector in vectors}) == len(vectors)
    return vectors


@pytest.mark.parametrize("vector", loadVectors(), ids=lambda vector: vector["id"])
def testPythonMatcherSatisfiesContractVectors(vector: dict) -> None:
    verdict = matchLearningOutput(
        vector["expected"],
        vector["actual"],
        caseInsensitive=vector["caseInsensitive"],
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
    verdict = matchLearningOutput("Hello Codaro", "hello codaro")
    assert "대소문자" in verdict.feedback
    assert "Hello Codaro" in verdict.feedback and "hello codaro" in verdict.feedback


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
        '"whitespaceOnly"',
        '"different"',
        '"caseInsensitive"',
        "번째 줄부터 다릅니다",
        "대소문자만 다릅니다",
        "공백 개수나 줄바꿈이 다릅니다",
    ):
        assert marker in mirror, f"TS 미러에 {marker} 가 없다"
    # 정규화 규칙: 줄 끝 공백 제거 + CRLF 통일 + 앞뒤 빈 줄 제거.
    assert re.search(r"replace\(/\\r\\n\?/g", mirror)
    assert "[ \\t\\f\\v]+$" in mirror
