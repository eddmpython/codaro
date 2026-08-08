"""학습 출력 비교의 단일 의미(SSOT).

모든 채점기(웹 연습, 웹/로컬 강검증, 로컬 커널 약검증)는 이 의미 하나를 쓴다.
TS 미러: editor/src/lib/learningOutputMatch.ts (같은 규칙, 같은 피드백 계층).
계약 벡터: contracts/learning-content/outputMatchVectors.json - 두 구현이 같은
벡터를 통과해야 한다.

auto 비교는 코드를 실행하지 않는다. 양쪽 전체가 제한된 Python 표시값 문법으로
해석될 때만 숫자와 컨테이너 구조를 비교하고, 아니면 일반 text 비교에 머문다.
exact 비교는 표기 자체가 학습 목표일 때 사용한다.
"""

from __future__ import annotations

import math
import re
import unicodedata
from dataclasses import dataclass, replace
from typing import Any, Mapping


MAX_LITERAL_LENGTH = 20_000
MAX_LITERAL_DEPTH = 64
MAX_LITERAL_ITEMS = 2_000
MAX_SAFE_NUMBER = 9_007_199_254_740_991
NUMBER_RELATIVE_TOLERANCE = 1e-9
NUMBER_ABSOLUTE_TOLERANCE = 1e-12
NUMBER_PATTERN = re.compile(r"[+-]?(?:(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)")
OUTPUT_GRADING_POLICY_KEYS = frozenset({
    "absoluteTolerance",
    "caseSensitive",
    "listOrder",
    "relativeTolerance",
    "whitespace",
})


@dataclass(slots=True)
class OutputMatchVerdict:
    passed: bool
    tier: str
    feedback: str


@dataclass(frozen=True, slots=True)
class OutputGradingPolicy:
    absoluteTolerance: float
    caseSensitive: bool
    listOrder: str
    relativeTolerance: float
    whitespace: str


@dataclass(slots=True)
class _LiteralValue:
    kind: str
    value: Any = None


class _LiteralParseError(ValueError):
    pass


class _LiteralParser:
    def __init__(self, source: str) -> None:
        self.source = source
        self.index = 0
        self.itemCount = 0

    def parse(self) -> _LiteralValue:
        if len(self.source) > MAX_LITERAL_LENGTH:
            raise _LiteralParseError
        value = self._parseValue(0)
        self._skipWhitespace()
        if self.index != len(self.source):
            raise _LiteralParseError
        return value

    def _parseValue(self, depth: int) -> _LiteralValue:
        if depth > MAX_LITERAL_DEPTH:
            raise _LiteralParseError
        self._skipWhitespace()
        if self.index >= len(self.source):
            raise _LiteralParseError
        character = self.source[self.index]
        if character in {"'", '"'}:
            return _LiteralValue("string", self._parseString(character))
        if character == "[":
            return self._parseSequence("list", "]", depth)
        if character == "(":
            return self._parseSequence("tuple", ")", depth)
        if character == "{":
            return self._parseBrace(depth)
        if self._consumeKeyword("None"):
            return _LiteralValue("none")
        if self._consumeKeyword("True"):
            return _LiteralValue("boolean", True)
        if self._consumeKeyword("False"):
            return _LiteralValue("boolean", False)
        if self._consumeKeyword("set"):
            self._skipWhitespace()
            if self.source[self.index : self.index + 2] != "()":
                raise _LiteralParseError
            self.index += 2
            return _LiteralValue("set", [])
        match = NUMBER_PATTERN.match(self.source, self.index)
        if match is None:
            raise _LiteralParseError
        token = match.group(0)
        number = float(token)
        if not math.isfinite(number) or abs(number) > MAX_SAFE_NUMBER:
            raise _LiteralParseError
        self.index = match.end()
        return _LiteralValue("number", number)

    def _parseSequence(self, kind: str, closer: str, depth: int) -> _LiteralValue:
        self.index += 1
        self._skipWhitespace()
        if self._consume(closer):
            return _LiteralValue(kind, [])
        values: list[_LiteralValue] = []
        hadComma = False
        while True:
            values.append(self._parseValue(depth + 1))
            self._countItem()
            self._skipWhitespace()
            if self._consume(closer):
                if kind == "tuple" and len(values) == 1 and not hadComma:
                    return values[0]
                return _LiteralValue(kind, values)
            if not self._consume(","):
                raise _LiteralParseError
            hadComma = True
            self._skipWhitespace()
            if self._consume(closer):
                return _LiteralValue(kind, values)

    def _parseBrace(self, depth: int) -> _LiteralValue:
        self.index += 1
        self._skipWhitespace()
        if self._consume("}"):
            return _LiteralValue("dict", [])
        first = self._parseValue(depth + 1)
        self._countItem()
        self._skipWhitespace()
        if self._consume(":"):
            entries = [(first, self._parseValue(depth + 1))]
            self._countItem()
            while True:
                self._skipWhitespace()
                if self._consume("}"):
                    return _LiteralValue("dict", entries)
                if not self._consume(","):
                    raise _LiteralParseError
                self._skipWhitespace()
                if self._consume("}"):
                    return _LiteralValue("dict", entries)
                key = self._parseValue(depth + 1)
                self._countItem()
                self._skipWhitespace()
                if not self._consume(":"):
                    raise _LiteralParseError
                entries.append((key, self._parseValue(depth + 1)))
                self._countItem()
        values = [first]
        while True:
            self._skipWhitespace()
            if self._consume("}"):
                return _LiteralValue("set", values)
            if not self._consume(","):
                raise _LiteralParseError
            self._skipWhitespace()
            if self._consume("}"):
                return _LiteralValue("set", values)
            values.append(self._parseValue(depth + 1))
            self._countItem()

    def _parseString(self, quote: str) -> str:
        self.index += 1
        decoded: list[str] = []
        escapes = {
            "\\": "\\",
            "'": "'",
            '"': '"',
            "a": "\a",
            "b": "\b",
            "f": "\f",
            "n": "\n",
            "r": "\r",
            "t": "\t",
            "v": "\v",
        }
        while self.index < len(self.source):
            character = self.source[self.index]
            self.index += 1
            if character == quote:
                return "".join(decoded)
            if character in {"\n", "\r"}:
                raise _LiteralParseError
            if character != "\\":
                decoded.append(character)
                continue
            if self.index >= len(self.source):
                raise _LiteralParseError
            escaped = self.source[self.index]
            self.index += 1
            if escaped in escapes:
                decoded.append(escapes[escaped])
                continue
            width = 2 if escaped == "x" else 4 if escaped == "u" else 8 if escaped == "U" else 0
            if not width:
                decoded.append(f"\\{escaped}")
                continue
            hexadecimal = self.source[self.index : self.index + width]
            if len(hexadecimal) != width or re.fullmatch(r"[0-9a-fA-F]+", hexadecimal) is None:
                raise _LiteralParseError
            codePoint = int(hexadecimal, 16)
            if codePoint > 0x10FFFF:
                raise _LiteralParseError
            decoded.append(chr(codePoint))
            self.index += width
        raise _LiteralParseError

    def _consumeKeyword(self, keyword: str) -> bool:
        if not self.source.startswith(keyword, self.index):
            return False
        end = self.index + len(keyword)
        if end < len(self.source) and (self.source[end].isalnum() or self.source[end] == "_"):
            return False
        self.index = end
        return True

    def _consume(self, token: str) -> bool:
        if not self.source.startswith(token, self.index):
            return False
        self.index += len(token)
        return True

    def _skipWhitespace(self) -> None:
        while self.index < len(self.source) and self.source[self.index].isspace():
            self.index += 1

    def _countItem(self) -> None:
        self.itemCount += 1
        if self.itemCount > MAX_LITERAL_ITEMS:
            raise _LiteralParseError


def normalizeLearningOutput(value: str) -> str:
    """line-trim 정규화. 비교 양쪽에 같은 규칙을 적용한다."""
    unified = value.replace("\r\n", "\n").replace("\r", "\n")
    lines = [line.rstrip() for line in unified.split("\n")]
    while lines and not lines[0]:
        lines.pop(0)
    while lines and not lines[-1]:
        lines.pop()
    return "\n".join(lines)


def normalizeOutputGradingPolicy(
    value: Mapping[str, Any] | None,
    *,
    comparator: str = "auto",
) -> OutputGradingPolicy:
    if comparator not in {"auto", "exact", "text"}:
        raise ValueError(f"지원하지 않는 출력 비교 방식입니다: {comparator!r}")
    if value is None:
        raw: Mapping[str, Any] = {}
    elif isinstance(value, Mapping):
        raw = value
    else:
        raise ValueError("출력 채점 정책은 object여야 합니다.")

    unknownKeys = set(raw) - OUTPUT_GRADING_POLICY_KEYS
    if unknownKeys:
        raise ValueError("지원하지 않는 출력 채점 정책입니다: " + ", ".join(sorted(unknownKeys)))

    caseSensitive = raw.get("caseSensitive", comparator == "exact")
    if not isinstance(caseSensitive, bool):
        raise ValueError("caseSensitive는 boolean이어야 합니다.")
    whitespace = raw.get("whitespace", "line-trim")
    if whitespace not in {"line-trim", "collapse"}:
        raise ValueError("whitespace는 line-trim 또는 collapse여야 합니다.")
    listOrder = raw.get("listOrder", "ordered")
    if listOrder not in {"ordered", "any"}:
        raise ValueError("listOrder는 ordered 또는 any여야 합니다.")
    relativeTolerance = _policyTolerance(
        raw.get("relativeTolerance", NUMBER_RELATIVE_TOLERANCE),
        "relativeTolerance",
        maximum=1.0,
    )
    absoluteTolerance = _policyTolerance(
        raw.get("absoluteTolerance", NUMBER_ABSOLUTE_TOLERANCE),
        "absoluteTolerance",
        maximum=MAX_SAFE_NUMBER,
    )
    return OutputGradingPolicy(
        absoluteTolerance=absoluteTolerance,
        caseSensitive=caseSensitive,
        listOrder=listOrder,
        relativeTolerance=relativeTolerance,
        whitespace=whitespace,
    )


def matchLearningOutput(
    expected: str,
    actual: str,
    *,
    comparator: str = "auto",
    gradingPolicy: Mapping[str, Any] | None = None,
) -> OutputMatchVerdict:
    policy = normalizeOutputGradingPolicy(gradingPolicy, comparator=comparator)

    expectedBase = normalizeLearningOutput(expected)
    actualBase = normalizeLearningOutput(actual)
    expectedNorm = _collapse(expectedBase) if policy.whitespace == "collapse" else expectedBase
    actualNorm = _collapse(actualBase) if policy.whitespace == "collapse" else actualBase

    if expectedNorm == actualNorm:
        if expectedBase != actualBase:
            return OutputMatchVerdict(
                True,
                "whitespace",
                "공백 개수와 줄바꿈 차이는 이 문제에서 허용했고, 내용은 맞습니다.",
            )
        return OutputMatchVerdict(True, "exact", "목표한 출력과 일치합니다.")

    if not policy.caseSensitive and _foldText(expectedNorm) == _foldText(actualNorm):
        return OutputMatchVerdict(
            True,
            "text",
            "대소문자 차이는 허용했고, 나머지 출력은 맞습니다.",
        )

    expectedValue = _parseLiteral(expectedNorm) if comparator == "auto" else None
    actualValue = _parseLiteral(actualNorm) if comparator == "auto" else None
    if expectedValue is not None and actualValue is not None:
        if _literalValuesEqual(expectedValue, actualValue, policy):
            if expectedValue.kind == "number" and actualValue.kind == "number":
                return OutputMatchVerdict(
                    True,
                    "number",
                    "숫자 표기나 미세한 계산 오차는 허용했고, 값은 맞습니다.",
                )
            orderedPolicy = replace(policy, listOrder="ordered")
            if (
                policy.listOrder == "any"
                and not _literalValuesEqual(expectedValue, actualValue, orderedPolicy)
            ):
                return OutputMatchVerdict(
                    True,
                    "order",
                    "목록 순서는 이 문제에서 허용했고, 원소와 구조는 맞습니다.",
                )
            return OutputMatchVerdict(
                True,
                "value",
                "표현 방식의 차이는 허용했고, Python 값과 구조는 맞습니다.",
            )
        if (
            expectedValue.kind == "number"
            and actualValue.kind == "number"
        ):
            allowedDifference = _allowedNumberDifference(expectedValue, actualValue, policy)
            return OutputMatchVerdict(
                False,
                "valueDifferent",
                "숫자 값이 허용 오차를 벗어났습니다. "
                f"기대 {_preview(expectedNorm)} ↔ 현재 {_preview(actualNorm)} "
                f"(허용 오차 {allowedDifference:.12g}).",
            )
        if (
            policy.listOrder == "ordered"
            and expectedValue.kind == "list"
            and actualValue.kind == "list"
            and _literalValuesEqual(expectedValue, actualValue, replace(policy, listOrder="any"))
        ):
            return OutputMatchVerdict(
                False,
                "valueDifferent",
                "목록 원소는 맞지만 순서가 다릅니다. 기대한 순서대로 배치해 주세요. "
                f"기대 {_preview(expectedNorm)} ↔ 현재 {_preview(actualNorm)}",
            )
        if (
            policy.caseSensitive
            and _literalValuesEqual(expectedValue, actualValue, replace(policy, caseSensitive=False))
        ):
            return OutputMatchVerdict(
                False,
                "caseOnly",
                f"값과 구조는 맞는데 대소문자만 다릅니다. 기대 {_preview(expectedNorm)} ↔ 현재 {_preview(actualNorm)}",
            )
        return OutputMatchVerdict(
            False,
            "valueDifferent",
            "Python 값으로 해석했지만 값이나 구조가 다릅니다. "
            f"기대 {_preview(expectedNorm)} ↔ 현재 {_preview(actualNorm)}",
        )

    if _foldText(expectedNorm) == _foldText(actualNorm):
        expectedLine, actualLine = _firstDifferingPair(expectedNorm, actualNorm)
        return OutputMatchVerdict(
            False,
            "caseOnly",
            f"내용은 맞는데 대소문자만 다릅니다. 기대 {_preview(expectedLine)} ↔ 현재 {_preview(actualLine)}",
        )
    if _collapse(expectedNorm) == _collapse(actualNorm):
        return OutputMatchVerdict(
            False,
            "whitespaceOnly",
            "내용은 맞는데 공백 개수나 줄바꿈이 다릅니다. 띄어쓰기와 줄 구조를 기대 출력과 똑같이 맞춰 주세요.",
        )
    if _foldText(_collapse(expectedNorm)) == _foldText(_collapse(actualNorm)):
        return OutputMatchVerdict(
            False,
            "whitespaceOnly",
            "내용은 맞는데 대소문자와 공백이 조금 다릅니다. 기대 출력과 글자 그대로 비교해 주세요.",
        )

    expectedLines = expectedNorm.split("\n") if expectedNorm else []
    actualLines = actualNorm.split("\n") if actualNorm else []
    if not actualLines:
        return OutputMatchVerdict(
            False,
            "different",
            "아직 출력이 없습니다. print()로 결과를 출력해 주세요.",
        )
    lineNumber, expectedLine, actualLine = _firstDifferingLine(expectedLines, actualLines)
    parts = [f"{lineNumber}번째 줄부터 다릅니다. 기대 {_preview(expectedLine)} ↔ 현재 {_preview(actualLine)}"]
    if len(expectedLines) != len(actualLines):
        parts.append(f"줄 수도 다릅니다(기대 {len(expectedLines)}줄, 현재 {len(actualLines)}줄).")
    return OutputMatchVerdict(False, "different", " ".join(parts))


def _parseLiteral(value: str) -> _LiteralValue | None:
    try:
        return _LiteralParser(value).parse()
    except _LiteralParseError:
        return None


def _literalValuesEqual(
    expected: _LiteralValue,
    actual: _LiteralValue,
    policy: OutputGradingPolicy,
) -> bool:
    if expected.kind != actual.kind:
        return False
    if expected.kind == "number":
        difference = abs(float(expected.value) - float(actual.value))
        return difference <= _allowedNumberDifference(expected, actual, policy)
    if expected.kind == "string":
        if policy.caseSensitive:
            return unicodedata.normalize("NFC", str(expected.value)) == unicodedata.normalize("NFC", str(actual.value))
        return _foldText(str(expected.value)) == _foldText(str(actual.value))
    if expected.kind in {"none", "boolean"}:
        return expected.value == actual.value
    if expected.kind in {"list", "tuple"}:
        if len(expected.value) != len(actual.value):
            return False
        if expected.kind == "list" and policy.listOrder == "any":
            return _unorderedValuesEqual(expected.value, actual.value, policy)
        return all(
            _literalValuesEqual(left, right, policy)
            for left, right in zip(expected.value, actual.value, strict=True)
        )
    if expected.kind == "dict":
        return _unorderedPairsEqual(expected.value, actual.value, policy)
    if expected.kind == "set":
        return _unorderedValuesEqual(expected.value, actual.value, policy)
    return False


def _unorderedPairsEqual(
    expected: list[tuple[_LiteralValue, _LiteralValue]],
    actual: list[tuple[_LiteralValue, _LiteralValue]],
    policy: OutputGradingPolicy,
) -> bool:
    if len(expected) != len(actual):
        return False
    unmatched = list(actual)
    for expectedKey, expectedValue in expected:
        matchIndex = next(
            (
                index
                for index, (actualKey, actualValue) in enumerate(unmatched)
                if _literalValuesEqual(expectedKey, actualKey, policy)
                and _literalValuesEqual(expectedValue, actualValue, policy)
            ),
            None,
        )
        if matchIndex is None:
            return False
        unmatched.pop(matchIndex)
    return True


def _unorderedValuesEqual(
    expected: list[_LiteralValue],
    actual: list[_LiteralValue],
    policy: OutputGradingPolicy,
) -> bool:
    if len(expected) != len(actual):
        return False
    unmatched = list(actual)
    for expectedValue in expected:
        matchIndex = next(
            (
                index
                for index, actualValue in enumerate(unmatched)
                if _literalValuesEqual(expectedValue, actualValue, policy)
            ),
            None,
        )
        if matchIndex is None:
            return False
        unmatched.pop(matchIndex)
    return True


def _allowedNumberDifference(
    expected: _LiteralValue,
    actual: _LiteralValue,
    policy: OutputGradingPolicy,
) -> float:
    scale = max(abs(float(expected.value)), abs(float(actual.value)))
    return max(policy.absoluteTolerance, policy.relativeTolerance * scale)


def _policyTolerance(value: Any, name: str, *, maximum: float) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name}는 0 이상의 유한한 숫자여야 합니다.")
    parsed = float(value)
    if not math.isfinite(parsed) or parsed < 0 or parsed > maximum:
        raise ValueError(f"{name}는 0 이상 {maximum:g} 이하의 유한한 숫자여야 합니다.")
    return parsed


def _foldText(value: str) -> str:
    return unicodedata.normalize("NFC", value).lower()


def _collapse(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _preview(value: str, limit: int = 60) -> str:
    text = value if len(value) <= limit else value[: limit - 1] + "…"
    return f"`{text}`" if text else "(빈 줄)"


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
        expectedNorm.split("\n"),
        actualNorm.split("\n"),
    )
    return expectedLine, actualLine
