"""학습 출력 비교의 단일 의미(SSOT).

모든 채점기(웹 연습, 웹/로컬 강검증, 로컬 커널 약검증)는 이 의미 하나를 쓴다.
TS 미러: editor/src/lib/learningOutputMatch.ts (같은 규칙, 같은 피드백 계층).
계약 벡터: contracts/learning-content/outputMatchVectors.json - 두 구현이 같은
벡터를 통과해야 한다.

규칙:
1. line-trim 정규화: CRLF/CR → LF, 각 줄 끝 공백 제거, 앞뒤 빈 줄 제거.
   눈에 보이지 않는 차이(끝 공백, 마지막 줄바꿈, 개행 방식)로는 틀리지 않는다.
2. 대소문자와 줄 안 공백은 눈에 보이는 차이이므로 기본적으로 틀린 것이 맞다.
   단, 피드백이 "무엇이 다른지"를 정확히 짚는다:
   - 대소문자만 다르면 그 사실을 말한다.
   - 공백 개수/줄바꿈 구조만 다르면 그 사실을 말한다.
   - 그 외에는 처음 다른 줄 번호와 기대/현재 줄을 함께 보여준다.
3. caseInsensitive=True 옵트인: 대소문자가 학습 목표와 무관한 검사(콘텐츠가
   명시)는 casefold 비교로 통과시킨다.
"""
from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(slots=True)
class OutputMatchVerdict:
    passed: bool
    tier: str  # "exact" | "caseInsensitive" | "caseOnly" | "whitespaceOnly" | "different"
    feedback: str


def normalizeLearningOutput(value: str) -> str:
    """line-trim 정규화. 비교 양쪽(기대/실제)에 같은 규칙을 적용한다."""
    unified = value.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.rstrip() for line in unified.split("\n")]
    while lines and not lines[0]:
        lines.pop(0)
    while lines and not lines[-1]:
        lines.pop()
    return "\n".join(lines)


def _collapse(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _preview(value: str, limit: int = 60) -> str:
    text = value if len(value) <= limit else value[: limit - 1] + "…"
    return f"`{text}`" if text else "(빈 줄)"


def matchLearningOutput(
    expected: str,
    actual: str,
    *,
    caseInsensitive: bool = False,
) -> OutputMatchVerdict:
    expectedNorm = normalizeLearningOutput(expected)
    actualNorm = normalizeLearningOutput(actual)

    if expectedNorm == actualNorm:
        return OutputMatchVerdict(True, "exact", "목표한 출력과 일치합니다.")
    if caseInsensitive and expectedNorm.casefold() == actualNorm.casefold():
        return OutputMatchVerdict(True, "caseInsensitive", "목표한 출력과 일치합니다.")

    if expectedNorm.casefold() == actualNorm.casefold():
        expectedLine, actualLine = _firstDifferingPair(expectedNorm, actualNorm)
        return OutputMatchVerdict(
            False,
            "caseOnly",
            "내용은 맞는데 대소문자만 다릅니다. "
            f"기대 {_preview(expectedLine)} ↔ 현재 {_preview(actualLine)}",
        )
    if _collapse(expectedNorm) == _collapse(actualNorm):
        return OutputMatchVerdict(
            False,
            "whitespaceOnly",
            "내용은 맞는데 공백 개수나 줄바꿈이 다릅니다. "
            "띄어쓰기와 줄 구조를 기대 출력과 똑같이 맞춰 주세요.",
        )
    if _collapse(expectedNorm).casefold() == _collapse(actualNorm).casefold():
        return OutputMatchVerdict(
            False,
            "whitespaceOnly",
            "내용은 맞는데 대소문자와 공백이 조금 다릅니다. "
            "기대 출력과 글자 그대로 비교해 주세요.",
        )

    expectedLines = expectedNorm.split("\n") if expectedNorm else []
    actualLines = actualNorm.split("\n") if actualNorm else []
    if not actualLines:
        return OutputMatchVerdict(
            False, "different", "아직 출력이 없습니다. print()로 결과를 출력해 주세요.",
        )
    lineNumber, expectedLine, actualLine = _firstDifferingLine(expectedLines, actualLines)
    parts = [f"{lineNumber}번째 줄부터 다릅니다. 기대 {_preview(expectedLine)} ↔ 현재 {_preview(actualLine)}"]
    if len(expectedLines) != len(actualLines):
        parts.append(f"줄 수도 다릅니다(기대 {len(expectedLines)}줄, 현재 {len(actualLines)}줄).")
    return OutputMatchVerdict(False, "different", " ".join(parts))


def _firstDifferingLine(
    expectedLines: list[str],
    actualLines: list[str],
) -> tuple[int, str, str]:
    for index in range(max(len(expectedLines), len(actualLines))):
        expectedLine = expectedLines[index] if index < len(expectedLines) else ""
        actualLine = actualLines[index] if index < len(actualLines) else ""
        if expectedLine != actualLine:
            return index + 1, expectedLine, actualLine
    return 1, expectedLines[0] if expectedLines else "", actualLines[0] if actualLines else ""


def _firstDifferingPair(expectedNorm: str, actualNorm: str) -> tuple[str, str]:
    _, expectedLine, actualLine = _firstDifferingLine(
        expectedNorm.split("\n"), actualNorm.split("\n"),
    )
    return expectedLine, actualLine
