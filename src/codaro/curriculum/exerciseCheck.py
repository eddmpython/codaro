from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

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
    raise InvalidExerciseCheck("Invalid check type or missing parameters.")


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
