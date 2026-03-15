from __future__ import annotations

import re
from dataclasses import dataclass, field

from ..kernel.session import KernelSession


@dataclass(slots=True)
class CheckResult:
    passed: bool
    feedback: str
    hintLevel: int = 0
    hints: list[str] = field(default_factory=list)
    studentOutput: str = ""
    expectedOutput: str = ""
    detail: str = ""


COMMON_ERROR_PATTERNS = {
    "NameError": "변수 이름을 확인하세요. 오타가 있거나 정의하지 않은 변수를 사용했을 수 있습니다.",
    "SyntaxError": "문법 오류입니다. 괄호, 콜론, 따옴표가 빠지지 않았는지 확인하세요.",
    "TypeError": "타입이 맞지 않습니다. 숫자와 문자열을 섞어서 계산하려 했을 수 있습니다.",
    "IndexError": "인덱스가 범위를 벗어났습니다. 리스트 길이를 확인하세요.",
    "KeyError": "딕셔너리에 없는 키를 사용했습니다. 키 이름을 확인하세요.",
    "IndentationError": "들여쓰기가 잘못되었습니다. 스페이스 4칸을 사용하세요.",
    "ZeroDivisionError": "0으로 나눌 수 없습니다. 나누는 값을 확인하세요.",
    "AttributeError": "존재하지 않는 속성이나 메서드입니다. 이름을 확인하세요.",
    "ValueError": "값이 올바르지 않습니다. 입력 데이터를 확인하세요.",
    "ImportError": "모듈을 찾을 수 없습니다. 설치되어 있는지 확인하세요.",
}


async def checkByOutput(
    session: KernelSession,
    studentCode: str,
    expectedCode: str,
    hints: list[str] | None = None,
    currentHintLevel: int = 0,
) -> CheckResult:
    studentResult = await session.execute(studentCode, blockId="_check_student")
    expectedResult = await session.execute(expectedCode, blockId="_check_expected")

    if studentResult.status == "error":
        errorFeedback = _explainError(studentResult.data)
        return CheckResult(
            passed=False,
            feedback=errorFeedback,
            hintLevel=currentHintLevel,
            hints=hints or [],
            studentOutput=studentResult.data,
            expectedOutput=_composeOutput(expectedResult),
            detail="execution_error",
        )

    studentOut = _normalize(studentResult.stdout + studentResult.data)
    expectedOut = _normalize(expectedResult.stdout + expectedResult.data)

    if studentOut == expectedOut:
        return CheckResult(
            passed=True,
            feedback="정답입니다!",
            studentOutput=studentOut,
            expectedOutput=expectedOut,
        )

    nextHintLevel = min(currentHintLevel + 1, len(hints) if hints else 0)
    hintText = ""
    if hints and nextHintLevel > 0 and nextHintLevel <= len(hints):
        hintText = hints[nextHintLevel - 1]

    feedback = "출력이 다릅니다."
    if hintText:
        feedback += f" 힌트: {hintText}"

    return CheckResult(
        passed=False,
        feedback=feedback,
        hintLevel=nextHintLevel,
        hints=hints or [],
        studentOutput=studentOut,
        expectedOutput=expectedOut,
        detail="output_mismatch",
    )


async def checkByVariable(
    session: KernelSession,
    studentCode: str,
    variableName: str,
    expectedValue: str,
    hints: list[str] | None = None,
    currentHintLevel: int = 0,
) -> CheckResult:
    result = await session.execute(studentCode, blockId="_check_var")

    if result.status == "error":
        return CheckResult(
            passed=False,
            feedback=_explainError(result.data),
            hintLevel=currentHintLevel,
            hints=hints or [],
            studentOutput=result.data,
            detail="execution_error",
        )

    variables = {v.name: v for v in result.variables}
    if variableName not in variables:
        return CheckResult(
            passed=False,
            feedback=f"변수 `{variableName}`이 정의되지 않았습니다.",
            hintLevel=currentHintLevel,
            hints=hints or [],
            detail="variable_missing",
        )

    actual = variables[variableName].repr
    if _normalize(actual) == _normalize(expectedValue):
        return CheckResult(
            passed=True,
            feedback="정답입니다!",
            studentOutput=actual,
            expectedOutput=expectedValue,
        )

    nextHintLevel = min(currentHintLevel + 1, len(hints) if hints else 0)
    hintText = hints[nextHintLevel - 1] if hints and nextHintLevel > 0 and nextHintLevel <= len(hints) else ""

    feedback = f"`{variableName}`의 값이 다릅니다. (현재: {actual})"
    if hintText:
        feedback += f" 힌트: {hintText}"

    return CheckResult(
        passed=False,
        feedback=feedback,
        hintLevel=nextHintLevel,
        hints=hints or [],
        studentOutput=actual,
        expectedOutput=expectedValue,
        detail="variable_mismatch",
    )


async def checkContains(
    studentCode: str,
    requiredPatterns: list[str],
) -> CheckResult:
    missing: list[str] = []
    for pattern in requiredPatterns:
        if pattern not in studentCode:
            missing.append(pattern)

    if not missing:
        return CheckResult(passed=True, feedback="코드 구조가 올바릅니다!")

    return CheckResult(
        passed=False,
        feedback=f"코드에 다음이 포함되어야 합니다: {', '.join(missing)}",
        detail="pattern_missing",
    )


async def checkNoError(
    session: KernelSession,
    studentCode: str,
) -> CheckResult:
    result = await session.execute(studentCode, blockId="_check_noerr")

    if result.status == "error":
        return CheckResult(
            passed=False,
            feedback=_explainError(result.data),
            studentOutput=result.data,
            detail="execution_error",
        )

    return CheckResult(
        passed=True,
        feedback="에러 없이 실행되었습니다!",
        studentOutput=_composeOutput(result),
    )


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip()).strip()


def _composeOutput(result) -> str:
    parts = []
    if result.stdout:
        parts.append(result.stdout.strip())
    if result.data:
        parts.append(result.data.strip())
    return "\n".join(parts)


def _explainError(errorText: str) -> str:
    for errorType, explanation in COMMON_ERROR_PATTERNS.items():
        if errorType in errorText:
            return f"{explanation}\n\n```\n{errorText.strip()}\n```"
    return f"오류가 발생했습니다.\n\n```\n{errorText.strip()}\n```"
