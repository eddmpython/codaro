from __future__ import annotations

from fastapi import APIRouter

from ..curriculum.exerciseCheck import ExerciseCheckInput, InvalidExerciseCheck, runExerciseCheck
from ..curriculum.contentCache import CurriculumContentCache
from ..curriculum.misconceptionCatalog import matchOutcomes
from ..curriculum.outcomeMastery import computeMastery
from ..curriculum.planComposer import PlanGoal, composeMasterPlan
from ..curriculum.predictionDiff import ActualResult, comparePrediction, extractErrorClass
from ..curriculum.sectionContract import LearningPredictContract
from ..curriculum.studyLoader import CATEGORY_GROUPS, CATEGORY_MAPPING, LEARNING_PATHS, curriculumCategoryTree
from ..curriculum.learningSpec import AI_TEACHER_INSTRUCTIONS, EXERCISE_TYPES, HINT_STRATEGY, LESSON_STRUCTURE, PHILOSOPHY
from ..serverLog import formatLogFields, getServerLogger
from .appState import ServerState
from .errors import fail
from ..curriculum.analyticsTimeline import buildSnapshot
from ..curriculum.learnerStateBridge import buildUnifiedMastery
from ..curriculum.reviewScheduler import daysOverdue
from .requestModels import (
    CheckExerciseRequest,
    CurriculumProgressRequest,
    MasterPlanRequest,
    OutcomeValidationRequest,
    ReviewResultRequest,
)


def createCurriculumRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()
    contentCache = CurriculumContentCache()

    @router.get("/api/curriculum/categories")
    def apiCurriculumCategories() -> dict[str, object]:
        if state.studyLoader is None:
            return {"categories": [], "groups": {}, "tree": [], "learningPaths": {}}
        categories = state.studyLoader.listCategories()
        logger.debug(
            "curriculum %s",
            formatLogFields(action="categories", categoryCount=len(categories)),
        )
        return {
            "categories": [category.model_dump() for category in categories],
            "groups": CATEGORY_GROUPS,
            "tree": curriculumCategoryTree(),
            "learningPaths": LEARNING_PATHS,
        }

    @router.get("/api/curriculum/contents/{category}")
    def apiCurriculumContents(category: str) -> dict[str, object]:
        if state.studyLoader is None:
            fail(404, "curriculum_unavailable", "Curriculum content not available.")
        contents = state.studyLoader.listContents(category)
        logger.debug(
            "curriculum %s",
            formatLogFields(action="contents", category=category, contentCount=len(contents)),
        )
        return {
            "category": category,
            "categoryName": CATEGORY_MAPPING.get(category, category),
            "contents": [{"contentId": content.contentId, "title": content.title} for content in contents],
        }

    @router.get("/api/curriculum/content/{category}/{contentId}")
    def apiCurriculumContent(category: str, contentId: str) -> dict[str, object]:
        if state.studyLoader is None:
            fail(404, "curriculum_unavailable", "Curriculum content not available.")
        try:
            payload = contentCache.get(state.studyLoader, category, contentId)
        except FileNotFoundError:
            fail(404, "curriculum_content_not_found", "Content not found.")
        state.progressTracker.markAccessed(category, contentId)
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="content",
                category=category,
                contentId=contentId,
                blockCount=payload.blockCount,
                solutionCount=payload.solutionCount,
            ),
        )
        return payload.response()

    @router.get("/api/curriculum/progress")
    def apiCurriculumProgress() -> dict[str, object]:
        summary = state.progressTracker.getSummary()
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="progress-summary",
                lessonCount=len(summary.get("lessons", [])) if isinstance(summary.get("lessons"), list) else None,
            ),
        )
        return summary

    @router.post("/api/curriculum/progress")
    def apiUpdateProgress(request: CurriculumProgressRequest) -> dict[str, object]:
        if request.missionId:
            lesson = state.progressTracker.completeMission(
                request.category, request.contentId, request.missionId, request.totalMissions,
            )
            logger.debug(
                "curriculum %s",
                formatLogFields(
                    action="progress-mission",
                    category=request.category,
                    contentId=request.contentId,
                    missionId=request.missionId,
                    totalMissions=request.totalMissions,
                ),
            )
            return lesson.model_dump()
        state.progressTracker.markAccessed(request.category, request.contentId)
        logger.debug(
            "curriculum %s",
            formatLogFields(action="progress-access", category=request.category, contentId=request.contentId),
        )
        return {"status": "accessed"}

    @router.post("/api/curriculum/check")
    async def apiCheckExercise(request: CheckExerciseRequest) -> dict[str, object]:
        session = state.sessionManager.getSession(request.sessionId)
        if session is None:
            fail(404, "session_not_found", "Session not found.")

        try:
            result = await runExerciseCheck(
                session,
                ExerciseCheckInput(
                    studentCode=request.studentCode,
                    expectedCode=request.expectedCode,
                    checkType=request.checkType,
                    variableName=request.variableName,
                    expectedValue=request.expectedValue,
                    requiredPatterns=request.requiredPatterns,
                    hints=request.hints,
                    currentHintLevel=request.currentHintLevel,
                ),
            )
        except InvalidExerciseCheck as error:
            fail(400, "curriculum_invalid_check", str(error))

        payload = result.payload()
        creditedOutcomes: list[str] = []
        autoValidatedOutcomes: list[str] = []
        sectionOutcomes: list[str] = []
        if request.category and request.contentId and request.sectionId:
            state.progressTracker.recordSectionResult(
                request.category,
                request.contentId,
                request.sectionId,
                passed=result.passed,
                hintLevel=result.hintLevel,
            )
            graph = state.curriculumOs.graph()
            lesson = graph.byKey(f"{request.category}/{request.contentId}")
            sectionOutcomes = list(
                lesson.outcomesForSection(request.sectionId) if lesson else []
            )
            if result.passed and sectionOutcomes:
                creditedOutcomes, autoValidatedOutcomes = state.progressTracker.creditCheckPass(
                    request.category,
                    request.contentId,
                    request.sectionId,
                    sectionOutcomes,
                    hintLevel=result.hintLevel,
                )
        payload["creditedOutcomes"] = creditedOutcomes
        payload["autoValidatedOutcomes"] = autoValidatedOutcomes

        # Predict-Run-Reconcile-Adapt 루프 — 매 check 마다 learnerState 갱신.
        # 진단을 AI tool call이 아니라 런타임에서 deterministic하게 박는다.
        misconceptionPayload: list[dict[str, object]] = []
        doneCriterionViolated = False
        predictionDiffPayload: dict[str, object] | None = None
        if sectionOutcomes:
            store = state.learnerStateStore
            errorText = payload.get("detail") or payload.get("studentOutput") or ""

            # 학습자 예측이 잠겨 있으면 실측과 4차원 diff 를 계산해 mastery 신호로 변환.
            # prediction-based 신호가 있으면 그것을 우선; 없으면 check pass/fail 만으로 갱신.
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
                            store.recordPredictionResult(outcomeId, diff)
                        usedPredictionSignal = True

            if not usedPredictionSignal:
                for outcomeId in sectionOutcomes:
                    store.recordOutcomeAttempt(outcomeId, success=result.passed)

            if not result.passed:
                for outcomeId, entry in matchOutcomes(
                    sectionOutcomes,
                    code=request.studentCode or "",
                    errorText=str(errorText),
                ):
                    hit, repeatStatus = store.recordMisconception(entry.id, outcomeId)
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

        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="check",
                sessionId=request.sessionId,
                checkType=request.checkType,
                passed=result.passed,
                hintLevel=result.hintLevel,
                creditedCount=len(creditedOutcomes),
                autoValidatedCount=len(autoValidatedOutcomes),
                misconceptionMatches=len(misconceptionPayload),
                doneCriterionViolated=doneCriterionViolated,
            ),
        )
        return payload

    @router.get("/api/curriculum/taxonomy")
    def apiCurriculumTaxonomy() -> dict[str, object]:
        taxonomy = state.curriculumOs.taxonomy()
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="taxonomy",
                outcomes=len(taxonomy.outcomes),
                domains=len(taxonomy.domains),
            ),
        )
        return {
            "outcomes": [outcome.model_dump() for outcome in taxonomy.outcomes],
            "domains": [domain.model_dump() for domain in taxonomy.domains],
        }

    @router.post("/api/curriculum/master-plan")
    def apiCurriculumMasterPlan(request: MasterPlanRequest) -> dict[str, object]:
        taxonomy = state.curriculumOs.taxonomy()
        if request.domain and not taxonomy.domainById(request.domain):
            fail(400, "curriculum_unknown_domain", f"Unknown domain: {request.domain}")
        for outcomeId in request.outcomes:
            if not taxonomy.hasOutcome(outcomeId):
                fail(400, "curriculum_unknown_outcome", f"Unknown outcome: {outcomeId}")
        graph = state.curriculumOs.graph()
        goal = PlanGoal(
            domain=request.domain,
            outcomes=request.outcomes,
            excludeCompleted=request.excludeCompleted,
            excludeKeys=request.excludeKeys,
            skipMasteredOutcomes=request.skipMasteredOutcomes,
            maxMinutes=request.maxMinutes,
            projectIntent=request.projectIntent,
            deliverableOnly=request.deliverableOnly,
        )
        plan = composeMasterPlan(
            goal,
            graph,
            taxonomy,
            state.progressTracker,
            learnerStateStore=state.learnerStateStore,
        )
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="master-plan",
                domain=request.domain,
                outcomes=len(request.outcomes),
                steps=len(plan.steps),
                gaps=len(plan.gaps),
            ),
        )
        return plan.model_dump()

    @router.get("/api/curriculum/mastery")
    def apiCurriculumMastery() -> dict[str, object]:
        taxonomy = state.curriculumOs.taxonomy()
        graph = state.curriculumOs.graph()
        validated = state.progressTracker.listValidatedOutcomes()
        report = computeMastery(graph, taxonomy, state.progressTracker, validated)
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="mastery",
                mastered=report.masteredOutcomeCount,
                total=report.totalOutcomeCount,
            ),
        )
        return report.model_dump()

    @router.post("/api/curriculum/outcomes/validate")
    def apiCurriculumValidateOutcome(request: OutcomeValidationRequest) -> dict[str, object]:
        taxonomy = state.curriculumOs.taxonomy()
        if not taxonomy.hasOutcome(request.outcomeId):
            fail(400, "curriculum_unknown_outcome", f"Unknown outcome: {request.outcomeId}")
        if request.validated:
            state.progressTracker.markOutcomeValidated(request.outcomeId)
        else:
            state.progressTracker.clearOutcomeValidation(request.outcomeId)
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="outcome-validate",
                outcomeId=request.outcomeId,
                validated=request.validated,
            ),
        )
        return {
            "outcomeId": request.outcomeId,
            "validated": request.validated,
        }

    @router.get("/api/curriculum/gaps")
    def apiCurriculumGaps(domain: str | None = None) -> dict[str, object]:
        taxonomy = state.curriculumOs.taxonomy()
        graph = state.curriculumOs.graph()
        covered = graph.coveredOutcomes()
        domainsOfInterest = taxonomy.domains
        if domain:
            singleDomain = taxonomy.domainById(domain)
            if singleDomain is None:
                fail(400, "curriculum_unknown_domain", f"Unknown domain: {domain}")
            domainsOfInterest = [singleDomain]
        gaps: list[dict[str, object]] = []
        for dom in domainsOfInterest:
            missing = [outcomeId for outcomeId in dom.targetOutcomes if outcomeId not in covered]
            if missing:
                gaps.append({
                    "domainId": dom.id,
                    "domainLabel": dom.label,
                    "missing": [
                        {
                            "outcomeId": outcomeId,
                            "outcomeLabel": taxonomy.outcomeLabel(outcomeId),
                        }
                        for outcomeId in missing
                    ],
                })
        logger.debug(
            "curriculum %s",
            formatLogFields(action="gaps", domain=domain, gapDomains=len(gaps)),
        )
        return {"gaps": gaps}

    @router.get("/api/curriculum/learning-spec")
    def apiLearningSpec() -> dict[str, object]:
        logger.debug("curriculum %s", formatLogFields(action="learning-spec"))
        return {
            "philosophy": PHILOSOPHY,
            "exerciseTypes": EXERCISE_TYPES,
            "hintStrategy": HINT_STRATEGY,
            "lessonStructure": LESSON_STRUCTURE,
            "aiTeacherInstructions": AI_TEACHER_INSTRUCTIONS,
        }

    @router.get("/api/learner/snapshot")
    def apiLearnerSnapshot() -> dict[str, object]:
        """학습자 상태 전체 스냅샷 — Predict-Run-Reconcile-Adapt 루프 표면.

        프론트가 mastery 패널, misconception 표시, dynamic gap UI를 그릴 때 호출한다.
        """
        snapshot = state.learnerStateStore.snapshot()
        repeats = state.learnerStateStore.listRepeatedMisconceptions()
        logger.debug(
            "learner %s",
            formatLogFields(
                action="snapshot",
                masteryEntries=len(snapshot.mastery),
                misconceptionHits=len(snapshot.misconceptions),
                repeatedMisconceptions=len(repeats),
            ),
        )
        return {
            **snapshot.model_dump(),
            "repeatedMisconceptionCount": len(repeats),
            "doneCriterionViolated": bool(repeats),
        }

    @router.get("/api/learner/outcome/{outcomeId}")
    def apiLearnerOutcome(outcomeId: str) -> dict[str, object]:
        """단일 outcome에 대한 mastery + 관련 misconception hit 목록.

        Predict-Run-Reconcile-Adapt 루프에서 한 outcome에 집중할 때 폴링용.
        """
        taxonomy = state.curriculumOs.taxonomy()
        if not taxonomy.hasOutcome(outcomeId):
            fail(400, "curriculum_unknown_outcome", f"Unknown outcome: {outcomeId}")
        store = state.learnerStateStore
        mastery = store.getMastery(outcomeId)
        related = [
            hit.model_dump()
            for hit in store.listMisconceptionHits()
            if hit.outcomeId == outcomeId
        ]
        logger.debug(
            "learner %s",
            formatLogFields(
                action="outcome",
                outcomeId=outcomeId,
                score=mastery.score,
                misconceptionHits=len(related),
            ),
        )
        return {
            "outcomeId": outcomeId,
            "outcomeLabel": taxonomy.outcomeLabel(outcomeId),
            "mastery": mastery.model_dump(),
            "misconceptionHits": related,
        }

    @router.get("/api/curriculum/reviews")
    def apiCurriculumReviews() -> dict[str, object]:
        dueStates = state.progressTracker.listDueReviews()
        graph = state.curriculumOs.graph()
        items: list[dict[str, object]] = []
        for review in dueStates:
            lesson = graph.byKey(review.lessonKey)
            items.append({
                "lessonKey": review.lessonKey,
                "title": lesson.title if lesson else review.lessonKey,
                "category": lesson.category if lesson else "",
                "contentId": lesson.contentId if lesson else "",
                "interval": review.interval,
                "ease": review.ease,
                "streak": review.streak,
                "lastResult": review.lastResult,
                "nextReviewAt": review.nextReviewAt,
                "daysOverdue": daysOverdue(review),
            })
        logger.debug(
            "curriculum %s",
            formatLogFields(action="reviews-list", dueCount=len(items)),
        )
        return {"reviews": items, "totalDue": len(items)}

    def _refreshAnalyticsSnapshot() -> None:
        taxonomy = state.curriculumOs.taxonomy()
        graph = state.curriculumOs.graph()
        validated = state.progressTracker.listValidatedOutcomes()
        report = computeMastery(graph, taxonomy, state.progressTracker, validated)
        snapshot = buildSnapshot(state.progressTracker, report)
        state.analyticsTimeline.append(snapshot)

    @router.get("/api/curriculum/mastery/unified")
    def apiUnifiedMastery() -> dict[str, object]:
        taxonomy = state.curriculumOs.taxonomy()
        graph = state.curriculumOs.graph()
        report = buildUnifiedMastery(
            state.progressTracker, state.learnerStateStore, taxonomy, graph,
        )
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="mastery-unified",
                mastered=report.masteredCount,
                total=report.totalCount,
            ),
        )
        return report.model_dump()

    @router.get("/api/curriculum/analytics")
    def apiCurriculumAnalytics(days: int = 30) -> dict[str, object]:
        _refreshAnalyticsSnapshot()
        snapshots = state.analyticsTimeline.loadRange()
        if days > 0 and len(snapshots) > days:
            snapshots = snapshots[-days:]
        logger.debug(
            "curriculum %s",
            formatLogFields(action="analytics", snapshotCount=len(snapshots), days=days),
        )
        return {
            "snapshots": [snap.model_dump() for snap in snapshots],
            "totalSnapshots": len(snapshots),
        }

    @router.get("/api/curriculum/analytics/summary")
    def apiCurriculumAnalyticsSummary() -> dict[str, object]:
        _refreshAnalyticsSnapshot()
        snapshots = state.analyticsTimeline.loadRange()
        if not snapshots:
            return {"available": False}
        latest = snapshots[-1]
        first = snapshots[0]
        recent30 = snapshots[-30:] if len(snapshots) > 30 else snapshots
        lessonsRecent = sum(s.lessonsCompletedToday for s in recent30)
        sectionsRecent = sum(s.sectionsCompletedToday for s in recent30)
        creditsRecent = sum(s.creditsToday for s in recent30)
        hintHistogram: dict[str, int] = {}
        for snap in recent30:
            for k, v in snap.hintLevelHistogram.items():
                hintHistogram[k] = hintHistogram.get(k, 0) + v
        domainTouches: dict[str, int] = {}
        for snap in recent30:
            for dom in snap.domainsTouched:
                domainTouches[dom] = domainTouches.get(dom, 0) + 1
        return {
            "available": True,
            "firstDate": first.date,
            "latestDate": latest.date,
            "currentMastered": latest.masteredCount,
            "totalOutcomes": latest.totalOutcomes,
            "recent30": {
                "lessons": lessonsRecent,
                "sections": sectionsRecent,
                "credits": creditsRecent,
                "hintHistogram": hintHistogram,
                "domainTouches": dict(sorted(domainTouches.items(), key=lambda kv: -kv[1])),
            },
            "totalSnapshots": len(snapshots),
        }

    @router.post("/api/curriculum/reviews/{category}/{contentId}")
    def apiRecordReviewResult(category: str, contentId: str, request: ReviewResultRequest) -> dict[str, object]:
        key = f"{category}/{contentId}"
        updated = state.progressTracker.recordReviewResult(key, request.success)
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="review-result",
                lessonKey=key,
                success=request.success,
                streak=updated.streak,
                interval=updated.interval,
            ),
        )
        return updated.model_dump()

    return router
