"""Prediction vs Actual diff — Predict-Run-Reconcile-Adapt 루프 2단계.

학습자가 적은 예측(`LearningPredictContract`)과 실제 실행 결과를 비교해
어느 차원(shape/dtype/value/error)에서 mental model이 어긋났는지 보고한다.

이 diff는 [[misconceptionCatalog]]의 `predictionMismatch` trigger 매칭과
[[learnerState]] 갱신의 입력이다. UI는 학습자에게 어느 차원이 어긋났는지
보여주는 데 사용한다.
"""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

from .sectionContract import LearningPredictContract


DiffField = Literal["shape", "dtype", "value", "error"]
MatchStatus = Literal["match", "mismatch", "skipped"]


class ActualResult(BaseModel):
    """학습자 코드 실행 후 관찰된 사실.

    각 필드는 선택. 비어 있으면 비교에서 제외된다. shape/dtype/value 는
    프론트나 runtime이 채워서 보내고, error 는 traceback에서 클래스명만 추출한다.
    """
    model_config = ConfigDict(extra="forbid")

    shape: str = ""
    dtype: str = ""
    value: str = ""
    errorClass: str = ""


class FieldDiff(BaseModel):
    model_config = ConfigDict(extra="forbid")

    field: DiffField
    status: MatchStatus
    expected: str
    actual: str
    note: str = ""


class PredictionDiff(BaseModel):
    model_config = ConfigDict(extra="forbid")

    overall: MatchStatus
    fields: list[FieldDiff] = Field(default_factory=list)

    @property
    def hasMismatch(self) -> bool:
        return any(field.status == "mismatch" for field in self.fields)

    def mismatchedFields(self) -> list[DiffField]:
        return [field.field for field in self.fields if field.status == "mismatch"]


def _normalize(text: str) -> str:
    return text.strip().replace(" ", "").lower()


def _compareField(field: DiffField, expected: str, actual: str) -> FieldDiff:
    if not expected:
        return FieldDiff(field=field, status="skipped", expected="", actual=actual, note="예측 비어 있음")
    if not actual:
        return FieldDiff(field=field, status="skipped", expected=expected, actual="", note="실측 비어 있음")
    if _normalize(expected) == _normalize(actual):
        return FieldDiff(field=field, status="match", expected=expected, actual=actual)
    return FieldDiff(field=field, status="mismatch", expected=expected, actual=actual)


def comparePrediction(
    predict: LearningPredictContract,
    actual: ActualResult,
) -> PredictionDiff:
    """예측과 실행 결과를 4차원에서 비교한다.

    동작 규칙:
    - 한쪽이 비어 있는 차원은 `skipped`로 표시 (비교 대상 아님).
    - 예측에 errorClass가 있고 실측도 errorClass가 있으면 클래스 이름만 비교.
    - 예측에 errorClass가 있는데 실측이 정상 종료(value 채워짐)면 mismatch.
    - 예측이 정상 결과인데 실측이 errorClass면 mismatch.
    - overall: 어느 하나라도 mismatch면 mismatch, 전부 skipped면 skipped, 그 외 match.
    """
    fields: list[FieldDiff] = []

    # 예측: error vs 실측: error → 클래스 이름 비교.
    # 예측: error vs 실측: 값 → mismatch (예외 안 났음).
    # 예측: 값 vs 실측: error → mismatch (예측은 정상이지만 에러 났음).
    expectedError = predict.expectedError
    actualError = actual.errorClass

    if expectedError or actualError:
        if expectedError and actualError:
            fields.append(_compareField("error", expectedError, actualError))
        elif expectedError and not actualError:
            fields.append(FieldDiff(
                field="error",
                status="mismatch",
                expected=expectedError,
                actual="<no error>",
                note="예측은 에러였지만 정상 종료했습니다.",
            ))
        elif actualError and not expectedError:
            # 학습자는 정상 결과를 예측했는데 에러가 발생.
            fields.append(FieldDiff(
                field="error",
                status="mismatch",
                expected="<no error>",
                actual=actualError,
                note="예측은 정상 결과였지만 에러가 발생했습니다.",
            ))

    # error 차원이 mismatch면 value/shape/dtype 비교는 의미가 약하지만,
    # 학습자가 양쪽 차원을 모두 적었다면 함께 보고한다.
    fields.append(_compareField("shape", predict.expectedShape, actual.shape))
    fields.append(_compareField("dtype", predict.expectedDtype, actual.dtype))
    fields.append(_compareField("value", predict.expectedValue, actual.value))

    # overall 결정
    statuses = {field.status for field in fields}
    if "mismatch" in statuses:
        overall: MatchStatus = "mismatch"
    elif statuses == {"skipped"}:
        overall = "skipped"
    else:
        overall = "match"

    return PredictionDiff(overall=overall, fields=fields)


def extractErrorClass(traceback: str) -> str:
    """traceback 문자열에서 마지막 줄의 ExceptionClass: ... 패턴을 뽑는다.

    실행 런타임이 errorClass를 직접 채우지 못할 때 보조로 쓰는 helper.
    """
    if not traceback:
        return ""
    for line in reversed(traceback.strip().splitlines()):
        stripped = line.strip()
        if not stripped:
            continue
        # 형식: `ValueError: message` 또는 `ModuleName.ClassName: msg`
        if ":" in stripped and not stripped.startswith("File "):
            head = stripped.split(":", 1)[0].strip()
            # 클래스 이름은 보통 대문자로 시작.
            tail = head.rsplit(".", 1)[-1]
            if tail and tail[0].isupper() and tail.replace("_", "").isalnum():
                return tail
        if stripped.startswith("Traceback"):
            break
    return ""
