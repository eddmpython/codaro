from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Mapping

from .checker import (
    CheckResult,
    checkByOutput,
    checkByVariable,
    checkContains,
    checkExpectedOutput,
    checkNoError,
    checkOutputContains,
    checkVariableSnapshotContains,
)


EVAL_RESERVED_KEYS: frozenset[str] = frozenset({
    "type",
    "expectedCode",
    "variableName",
    "expectedValue",
    "requiredPatterns",
    "hints",
})


class InvalidExerciseCheck(ValueError):
    pass


@dataclass(frozen=True, slots=True)
class ExerciseCheckInput:
    studentCode: str
    expectedCode: str = ""
    checkType: str = "output"
    variableName: str = ""
    expectedValue: str = ""
    requiredPatterns: list[str] = field(default_factory=list)
    hints: list[str] = field(default_factory=list)
    currentHintLevel: int = 0


@dataclass(frozen=True, slots=True)
class ToolExerciseCheckInput:
    studentCode: str
    checkType: str
    expected: str = ""


def exerciseCheckInputFromConfig(
    studentCode: str,
    checkConfig: Mapping[str, Any],
    *,
    currentHintLevel: int = 0,
) -> ExerciseCheckInput:
    """Build ExerciseCheckInput from a curriculum YAML check dict.

    Only EVAL_RESERVED_KEYS are read; display-only keys (noError, resultCheck, ...)
    are ignored. Returns input with empty checkType if `type` missing — caller
    should treat that as 'evaluation disabled'.
    """
    requiredPatterns = checkConfig.get("requiredPatterns") or []
    if not isinstance(requiredPatterns, list):
        requiredPatterns = []
    hints = checkConfig.get("hints") or []
    if not isinstance(hints, list):
        hints = []
    return ExerciseCheckInput(
        studentCode=studentCode,
        expectedCode=str(checkConfig.get("expectedCode") or ""),
        checkType=str(checkConfig.get("type") or ""),
        variableName=str(checkConfig.get("variableName") or ""),
        expectedValue=str(checkConfig.get("expectedValue") or ""),
        requiredPatterns=[str(p) for p in requiredPatterns],
        hints=[str(h) for h in hints],
        currentHintLevel=currentHintLevel,
    )


async def runExerciseCheck(session: Any, request: ExerciseCheckInput) -> CheckResult:
    if request.checkType == "output" and request.expectedCode:
        return await checkByOutput(
            session,
            request.studentCode,
            request.expectedCode,
            hints=request.hints,
            currentHintLevel=request.currentHintLevel,
        )
    if request.checkType == "variable" and request.variableName:
        return await checkByVariable(
            session,
            request.studentCode,
            request.variableName,
            request.expectedValue,
            hints=request.hints,
            currentHintLevel=request.currentHintLevel,
        )
    if request.checkType == "contains" and request.requiredPatterns:
        return await checkContains(request.studentCode, request.requiredPatterns)
    if request.checkType == "noError":
        return await checkNoError(session, request.studentCode)
    if not request.checkType:
        raise InvalidExerciseCheck("check.type 키가 비어 있습니다. type=output/variable/contains/noError 중 하나를 지정하세요.")
    if request.checkType == "output":
        raise InvalidExerciseCheck("check.type=output 에는 expectedCode 또는 solution이 필요합니다.")
    if request.checkType == "variable":
        raise InvalidExerciseCheck("check.type=variable 에는 variableName이 필요합니다.")
    if request.checkType == "contains":
        raise InvalidExerciseCheck("check.type=contains 에는 requiredPatterns(리스트)가 필요합니다.")
    raise InvalidExerciseCheck(f"알 수 없는 check.type: {request.checkType!r}")


async def runToolExerciseCheck(session: Any, request: ToolExerciseCheckInput) -> dict[str, Any]:
    if request.checkType == "noError":
        return _toolCheckPayload(await checkNoError(session, request.studentCode))
    if request.checkType == "outputMatch":
        return _toolCheckPayload(await checkExpectedOutput(session, request.studentCode, request.expected))
    if request.checkType == "outputContains":
        return _toolCheckPayload(
            await checkOutputContains(session, request.studentCode, request.expected),
            pattern=request.expected,
        )
    if request.checkType == "variableCheck":
        return _toolCheckPayload(await checkVariableSnapshotContains(session, request.studentCode, request.expected))
    if request.checkType == "codeContains":
        return _toolCheckPayload(await checkContains(request.studentCode, [request.expected]), pattern=request.expected)
    raise InvalidExerciseCheck("Invalid check type or missing parameters.")


def _toolCheckPayload(
    result: CheckResult,
    *,
    pattern: str | None = None,
) -> dict[str, Any]:
    payload = result.payload()
    payload["actual"] = result.studentOutput
    payload["expected"] = result.expectedOutput
    if pattern is not None:
        payload["pattern"] = pattern
    return payload
