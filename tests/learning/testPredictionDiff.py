"""Prediction vs Actual diff 테스트 — Predict-Run-Reconcile-Adapt 루프 2단계."""
from __future__ import annotations

from codaro.curriculum.predictionDiff import (
    ActualResult,
    comparePrediction,
    extractErrorClass,
)
from codaro.curriculum.sectionContract import LearningPredictContract


def testAllMatchYieldsOverallMatch() -> None:
    predict = LearningPredictContract(
        expectedShape="(3,)",
        expectedDtype="int",
        expectedValue="[1, 2, 3]",
    )
    actual = ActualResult(shape="(3,)", dtype="int", value="[1, 2, 3]")
    diff = comparePrediction(predict, actual)
    assert diff.overall == "match"
    assert not diff.hasMismatch


def testValueMismatchYieldsOverallMismatch() -> None:
    predict = LearningPredictContract(expectedValue="[1, 2, 3]")
    actual = ActualResult(value="[1, 2, 4]")
    diff = comparePrediction(predict, actual)
    assert diff.overall == "mismatch"
    assert "value" in diff.mismatchedFields()


def testEmptyExpectationsAreSkipped() -> None:
    predict = LearningPredictContract()
    actual = ActualResult(value="[1, 2, 3]")
    diff = comparePrediction(predict, actual)
    assert diff.overall == "skipped"


def testWhitespaceInsensitiveMatch() -> None:
    predict = LearningPredictContract(expectedShape="(3, 4)")
    actual = ActualResult(shape="(3,4)")
    diff = comparePrediction(predict, actual)
    assert diff.overall == "match"


def testExpectedErrorClassMatch() -> None:
    predict = LearningPredictContract(expectedError="ValueError")
    actual = ActualResult(errorClass="ValueError")
    diff = comparePrediction(predict, actual)
    assert diff.overall == "match"
    errorFields = [f for f in diff.fields if f.field == "error"]
    assert errorFields and errorFields[0].status == "match"


def testExpectedErrorButNormalExecution() -> None:
    predict = LearningPredictContract(expectedError="ValueError")
    actual = ActualResult(value="[1, 2]")
    diff = comparePrediction(predict, actual)
    assert diff.overall == "mismatch"
    errorFields = [f for f in diff.fields if f.field == "error"]
    assert errorFields[0].status == "mismatch"
    assert "정상 종료" in errorFields[0].note


def testUnexpectedErrorFlagged() -> None:
    predict = LearningPredictContract(expectedValue="[1, 2, 3]")
    actual = ActualResult(errorClass="TypeError")
    diff = comparePrediction(predict, actual)
    assert diff.overall == "mismatch"
    errorFields = [f for f in diff.fields if f.field == "error"]
    assert errorFields[0].status == "mismatch"
    assert errorFields[0].actual == "TypeError"


def testDtypeMismatchIsolated() -> None:
    predict = LearningPredictContract(
        expectedShape="(3,)",
        expectedDtype="float64",
        expectedValue="[1, 2, 3]",
    )
    actual = ActualResult(shape="(3,)", dtype="int64", value="[1, 2, 3]")
    diff = comparePrediction(predict, actual)
    assert diff.overall == "mismatch"
    assert diff.mismatchedFields() == ["dtype"]


def testExtractErrorClassFromTraceback() -> None:
    traceback = (
        "Traceback (most recent call last):\n"
        '  File "<stdin>", line 1, in <module>\n'
        "ValueError: invalid literal for int() with base 10: 'x'"
    )
    assert extractErrorClass(traceback) == "ValueError"


def testExtractErrorClassEmptyOnNoTraceback() -> None:
    assert extractErrorClass("") == ""
    assert extractErrorClass("no error here") == ""


def testExtractErrorClassQualifiedName() -> None:
    traceback = "pandas.errors.ParserError: malformed CSV"
    assert extractErrorClass(traceback) == "ParserError"


def testContractParsesPredictFromYaml() -> None:
    """YAML lesson에서 predict 블록이 LearningPredictContract로 파싱되는지."""
    from codaro.curriculum.sectionContract import lessonContractFromYaml

    raw = {
        "meta": {"title": "T"},
        "intro": {"direction": "x"},
        "sections": [
            {
                "title": "section1",
                "goal": "g",
                "exercise": {
                    "prompt": "예측해보세요",
                    "starterCode": "x = 1",
                    "predict": {
                        "prompt": "어떻게 될까요?",
                        "expectedShape": "scalar",
                        "expectedValue": "1",
                    },
                },
            }
        ],
    }
    lesson = lessonContractFromYaml(raw)
    assert lesson.sections
    predict = lesson.sections[0].exercise.predict
    assert predict.prompt == "어떻게 될까요?"
    assert predict.expectedShape == "scalar"
    assert predict.expectedValue == "1"
    assert not predict.isEmpty()


def testPredictDefaultsAreEmpty() -> None:
    predict = LearningPredictContract()
    assert predict.isEmpty()
