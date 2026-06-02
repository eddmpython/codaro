from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from .checker import debuggingPatternRef, detectErrorClass
from .exerciseCheck import ExerciseCheckInput, InvalidExerciseCheck, runExerciseCheck
from .misconceptionCatalog import matchOutcomes
from .predictionDiff import ActualResult, comparePrediction, extractErrorClass
from .sectionContract import LearningPredictContract


def recommendNextAction(
    *,
    passed: bool,
    hasMisconception: bool,
    doneCriterionViolated: bool,
    hintLevel: int,
    maxHints: int,
) -> dict[str, str]:
    """체크 결과로부터 다음 행동을 결정적으로 추천한다(provider 불필요).

    학습 루프가 LLM provider 없이도 "진단 → 안내"까지 닫히게 하는 규칙 기반 baseline.
    provider가 있으면 teacher가 더 풍부히 보강하지만, 없어도 항상 한 가지 다음 행동을 준다.
    """
    if passed:
        return {"kind": "advance", "label": "다음 단계로 진행하기"}
    if hasMisconception:
        return {"kind": "studyCorrection", "label": "교정 코드를 보고 다시 풀기"}
    if doneCriterionViolated:
        return {"kind": "reviewConcept", "label": "개념을 다시 보고 시도하기"}
    if hintLevel < maxHints:
        return {"kind": "nextHint", "label": "다음 힌트 보기"}
    return {"kind": "retry", "label": "예상한 결과와 비교하며 다시 시도하기"}


class CurriculumCheckInvalid(ValueError):
    pass


class CurriculumCheckSessionMissing(LookupError):
    pass


@dataclass(frozen=True, slots=True)
class CurriculumCheckPrediction:
    expectedShape: str = ""
    expectedDtype: str = ""
    expectedValue: str = ""
    expectedError: str = ""


@dataclass(frozen=True, slots=True)
class CurriculumCheckInput:
    sessionId: str
    studentCode: str
    expectedCode: str = ""
    checkType: str = "output"
    variableName: str = ""
    expectedValue: str = ""
    requiredPatterns: list[str] = field(default_factory=list)
    hints: list[str] = field(default_factory=list)
    currentHintLevel: int = 0
    category: str = ""
    contentId: str = ""
    sectionId: str = ""
    prediction: CurriculumCheckPrediction | None = None


async def runCurriculumCheckFlow(
    *,
    curriculumOs: Any,
    learnerStateStore: Any,
    progressTracker: Any,
    request: CurriculumCheckInput,
    sessionManager: Any,
) -> dict[str, object]:
    session = sessionManager.getSession(request.sessionId)
    if session is None:
        raise CurriculumCheckSessionMissing("Session not found.")

    try:
        result = await runExerciseCheck(
            session,
            ExerciseCheckInput(
                studentCode=request.studentCode,
                expectedCode=request.expectedCode,
                checkType=request.checkType,
                variableName=request.variableName,
                expectedValue=request.expectedValue,
                requiredPatterns=list(request.requiredPatterns),
                hints=list(request.hints),
                currentHintLevel=request.currentHintLevel,
            ),
        )
    except InvalidExerciseCheck as exc:
        raise CurriculumCheckInvalid(str(exc)) from exc

    payload = result.payload()
    creditedOutcomes: list[str] = []
    autoValidatedOutcomes: list[str] = []
    sectionOutcomes: list[str] = []
    if request.category and request.contentId and request.sectionId:
        progressTracker.recordSectionResult(
            request.category,
            request.contentId,
            request.sectionId,
            passed=result.passed,
            hintLevel=result.hintLevel,
        )
        graph = curriculumOs.graph()
        lesson = graph.byKey(f"{request.category}/{request.contentId}")
        sectionOutcomes = list(
            lesson.outcomesForSection(request.sectionId) if lesson else []
        )
        if result.passed and sectionOutcomes:
            creditedOutcomes, autoValidatedOutcomes = progressTracker.creditCheckPass(
                request.category,
                request.contentId,
                request.sectionId,
                sectionOutcomes,
                hintLevel=result.hintLevel,
            )
    payload["creditedOutcomes"] = creditedOutcomes
    payload["autoValidatedOutcomes"] = autoValidatedOutcomes

    misconceptionPayload: list[dict[str, object]] = []
    doneCriterionViolated = False
    predictionDiffPayload: dict[str, object] | None = None
    if sectionOutcomes:
        errorText = payload.get("detail") or payload.get("studentOutput") or ""
        usedPredictionSignal = False
        if request.prediction is not None:
            predict = LearningPredictContract(
                expectedShape=request.prediction.expectedShape,
                expectedDtype=request.prediction.expectedDtype,
                expectedValue=request.prediction.expectedValue,
                expectedError=request.prediction.expectedError,
            )
            if not predict.isEmpty():
                actual = ActualResult(
                    value=str(payload.get("studentOutput") or ""),
                    errorClass=extractErrorClass(str(payload.get("detail") or "")),
                )
                diff = comparePrediction(predict, actual)
                predictionDiffPayload = diff.model_dump()
                if diff.overall != "skipped":
                    for outcomeId in sectionOutcomes:
                        learnerStateStore.recordPredictionResult(outcomeId, diff)
                    usedPredictionSignal = True

        if not usedPredictionSignal:
            for outcomeId in sectionOutcomes:
                learnerStateStore.recordOutcomeAttempt(outcomeId, success=result.passed)

        if not result.passed:
            for outcomeId, entry in matchOutcomes(
                sectionOutcomes,
                code=request.studentCode or "",
                errorText=str(errorText),
            ):
                hit, repeatStatus = learnerStateStore.recordMisconception(entry.id, outcomeId)
                if repeatStatus == "repeat":
                    doneCriterionViolated = True
                misconceptionPayload.append({
                    "misconceptionId": entry.id,
                    "outcomeId": outcomeId,
                    "label": entry.label,
                    "summary": entry.summary,
                    "diagnostic": entry.diagnostic.model_dump(),
                    "correction": entry.correction.model_dump(),
                    "repeatStatus": repeatStatus,
                    "hitCount": hit.hitCount,
                })
    payload["misconceptionMatches"] = misconceptionPayload
    payload["doneCriterionViolated"] = doneCriterionViolated
    payload["predictionDiff"] = predictionDiffPayload

    errorContext = " ".join([
        str(payload.get("studentOutput") or ""),
        str(payload.get("detail") or ""),
        str(payload.get("feedback") or ""),
    ])
    errorClass = detectErrorClass(errorContext) if not result.passed else ""
    payload["errorClass"] = errorClass
    payload["debuggingPatternRef"] = debuggingPatternRef(errorClass)
    payload["nextAction"] = recommendNextAction(
        passed=result.passed,
        hasMisconception=bool(misconceptionPayload),
        doneCriterionViolated=doneCriterionViolated,
        hintLevel=result.hintLevel,
        maxHints=len(request.hints),
    )
    return payload
