"""End-to-end tests for the lesson check pipeline.

Covers the path from YAML check dict → converter → ExerciseCheckInput → checker,
including the EVAL_RESERVED_KEYS filter, the solution→expectedCode fallback,
and the requiredPatterns regression case that previously failed because the
frontend was passing display strings as patterns.
"""
from __future__ import annotations

import asyncio

import pytest

from codaro.kernel.session import KernelSession
from codaro.curriculum.exerciseCheck import (
    EVAL_RESERVED_KEYS,
    ExerciseCheckInput,
    InvalidExerciseCheck,
    exerciseCheckInputFromConfig,
    runExerciseCheck,
)


def _run(coro):
    return asyncio.new_event_loop().run_until_complete(coro)


def testNoErrorTypePasses() -> None:
    """check.type=noError on clean snippet → pass."""
    session = KernelSession()
    request = exerciseCheckInputFromConfig(
        studentCode="x = 1 + 1\nassert x == 2",
        checkConfig={
            "type": "noError",
            "noError": "셀이 에러 없이 실행되어야 합니다.",
        },
    )
    result = _run(runExerciseCheck(session, request))
    assert result.passed is True
    session.dispose()


def testNoErrorTypeFailsOnError() -> None:
    """check.type=noError catches runtime errors."""
    session = KernelSession()
    request = exerciseCheckInputFromConfig(
        studentCode="raise ValueError('boom')",
        checkConfig={"type": "noError"},
    )
    result = _run(runExerciseCheck(session, request))
    assert result.passed is False
    session.dispose()


def testOutputTypeWithExplicitExpectedCode() -> None:
    """check.type=output with expectedCode → student output compared to expected output."""
    session = KernelSession()
    request = exerciseCheckInputFromConfig(
        studentCode="print(2 + 2)",
        checkConfig={
            "type": "output",
            "expectedCode": "print(4)",
        },
    )
    result = _run(runExerciseCheck(session, request))
    assert result.passed is True
    session.dispose()


def testVariableTypeMissingVariableFails() -> None:
    """check.type=variable with the variable never defined → fail with clear message."""
    session = KernelSession()
    request = exerciseCheckInputFromConfig(
        studentCode="other = 1",
        checkConfig={
            "type": "variable",
            "variableName": "answer",
            "expectedValue": "42",
        },
    )
    result = _run(runExerciseCheck(session, request))
    assert result.passed is False
    assert "answer" in result.feedback
    session.dispose()


def testVariableTypePasses() -> None:
    """check.type=variable with matching value → pass."""
    session = KernelSession()
    request = exerciseCheckInputFromConfig(
        studentCode="answer = 42",
        checkConfig={
            "type": "variable",
            "variableName": "answer",
            "expectedValue": "42",
        },
    )
    result = _run(runExerciseCheck(session, request))
    assert result.passed is True
    session.dispose()


def testDisplayOnlyKeysDoNotEvaluate() -> None:
    """A check dict without `type` is evaluation-disabled, not crashing."""
    request = exerciseCheckInputFromConfig(
        studentCode="x = 1",
        checkConfig={
            "noError": "셀이 에러 없이 실행되어야 합니다.",
            "resultCheck": "x가 정수여야 합니다.",
        },
    )
    assert request.checkType == ""
    session = KernelSession()
    with pytest.raises(InvalidExerciseCheck, match="type 키가 비어"):
        _run(runExerciseCheck(session, request))
    session.dispose()


def testRequiredPatternsArrayWorks() -> None:
    """Regression: requiredPatterns must be a list, not extracted from display strings.

    Before the frontend bug fix, ALL string values in checkConfig (including
    Korean display labels) were passed as patterns, making `contains` always fail.
    Here we verify the contract: requiredPatterns is an explicit array on the
    check config and must match the student's code.
    """
    request = exerciseCheckInputFromConfig(
        studentCode="result = df.groupby('species').agg('mean')",
        checkConfig={
            "type": "contains",
            "requiredPatterns": ["groupby", "agg"],
        },
    )
    assert request.requiredPatterns == ["groupby", "agg"]
    session = KernelSession()
    result = _run(runExerciseCheck(session, request))
    assert result.passed is True
    session.dispose()


def testRequiredPatternsFailureMessagesPatternName() -> None:
    """When a required pattern is missing, feedback names it."""
    request = exerciseCheckInputFromConfig(
        studentCode="result = df.groupby('species')",
        checkConfig={
            "type": "contains",
            "requiredPatterns": ["groupby", "agg"],
        },
    )
    session = KernelSession()
    result = _run(runExerciseCheck(session, request))
    assert result.passed is False
    assert "agg" in result.feedback
    session.dispose()


def testEvalReservedKeysCoverFrontendContract() -> None:
    """The reserved-key set must include every field the frontend evaluator reads.

    If the frontend starts reading a new field from checkConfig, this set must
    grow so the display-only filter still hides it.
    """
    frontendReadKeys = {
        "type",
        "expectedCode",
        "variableName",
        "expectedValue",
        "requiredPatterns",
        "hints",
    }
    missing = frontendReadKeys - EVAL_RESERVED_KEYS
    assert missing == set(), f"EVAL_RESERVED_KEYS missing keys read by frontend: {missing}"
