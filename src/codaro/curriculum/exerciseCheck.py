from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .checker import CheckResult, checkByOutput, checkByVariable, checkContains, checkNoError


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
