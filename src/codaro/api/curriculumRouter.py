from __future__ import annotations

from fastapi import APIRouter

from ..curriculum.analyticsFlow import CurriculumAnalyticsFlow
from ..curriculum.catalogFlow import buildCurriculumTaxonomyPayload, buildLearningSpecPayload
from ..curriculum.checkFlow import (
    CurriculumCheckInput,
    CurriculumCheckInvalid,
    CurriculumCheckSessionMissing,
    runCurriculumCheckFlow,
)
from ..curriculum.contentFlow import (
    CurriculumContentFlow,
    CurriculumContentError,
)
from ..curriculum.evidenceArchive import EvidenceArchiveError
from ..curriculum.learningArchive import LearningArchiveError, readCurrentLearningArchive
from ..curriculum.learningArchiveFlow import importLearningArchive
from ..curriculum.localStrongCheck import LocalStrongCheckInvalid, runLocalStrongCheck
from ..curriculum.planningFlow import (
    CurriculumMasterPlanInput,
    CurriculumPlanningError,
    buildCurriculumGapsPayload,
    composeCurriculumMasterPlan,
)
from ..curriculum.progressFlow import (
    CurriculumProgressInput,
    buildCurriculumProgressSummary,
    updateCurriculumProgress,
)
from ..curriculum.qualityFlow import (
    buildCurriculumCheckProposalsPayload,
    buildCurriculumLessonStatsPayload,
    buildCurriculumQualityReport,
)
from ..curriculum.learnerProgressFlow import (
    LearnerProgressError,
    buildLearnerOutcomePayload,
    buildLearnerSnapshotPayload,
    updateOutcomeValidation,
)
from ..curriculum.reviewFlow import buildCurriculumReviewsPayload, recordCurriculumReviewResult
from ..serverLog import formatLogFields, getServerLogger
from ..system.serverState import ServerState
from .errors import fail
from .learningArchiveAutomation import adoptLearningArchiveAutomationDraft
from .requestModels import (
    CheckExerciseRequest,
    CurriculumEvidenceArchiveRequest,
    CurriculumEvidenceEventRequest,
    CurriculumLearningArchiveRequest,
    CurriculumProgressRequest,
    LocalStrongCheckRequest,
    MasterPlanRequest,
    OutcomeValidationRequest,
    ReviewResultRequest,
)


def createCurriculumRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()
    contentFlow = CurriculumContentFlow(
        studyLoader=state.studyLoader,
        progressTracker=state.progressTracker,
    )
    analyticsFlow = CurriculumAnalyticsFlow(
        curriculumOs=state.curriculumOs,
        progressTracker=state.progressTracker,
        learnerStateStore=state.learnerStateStore,
        analyticsTimeline=state.analyticsTimeline,
        learningEvents=state.learningEvidenceArchiveStore.eventPayloads,
    )

    @router.get("/api/curriculum/categories")
    def apiCurriculumCategories() -> dict[str, object]:
        payload = contentFlow.categoriesPayload()
        categories = payload.get("categories", [])
        logger.debug(
            "curriculum %s",
            formatLogFields(action="categories", categoryCount=len(categories) if isinstance(categories, list) else 0),
        )
        return payload

    @router.get("/api/curriculum/contents/{category}")
    def apiCurriculumContents(category: str) -> dict[str, object]:
        try:
            payload = contentFlow.contentsPayload(category=category)
        except CurriculumContentError as error:
            fail(error.statusCode, error.code, error.message)
        contents = payload.get("contents", [])
        logger.debug(
            "curriculum %s",
            formatLogFields(action="contents", category=category, contentCount=len(contents) if isinstance(contents, list) else None),
        )
        return payload

    @router.get("/api/curriculum/content/{category}/{contentId}")
    def apiCurriculumContent(category: str, contentId: str) -> dict[str, object]:
        try:
            result = contentFlow.contentPayload(
                category=category,
                contentId=contentId,
            )
        except CurriculumContentError as error:
            fail(error.statusCode, error.code, error.message)
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="content",
                category=category,
                contentId=contentId,
                blockCount=result.blockCount,
                solutionCount=result.solutionCount,
            ),
        )
        return result.payload

    @router.get("/api/curriculum/progress")
    def apiCurriculumProgress() -> dict[str, object]:
        summary = buildCurriculumProgressSummary(state.progressTracker, state.studyLoader)
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
        result = updateCurriculumProgress(
            progressTracker=state.progressTracker,
            request=CurriculumProgressInput(
                category=request.category,
                contentId=request.contentId,
                missionId=request.missionId,
                totalMissions=request.totalMissions,
            ),
        )
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action=result.action,
                category=request.category,
                contentId=request.contentId,
                missionId=request.missionId or None,
                totalMissions=request.totalMissions or None,
            ),
        )
        return result.payload

    @router.get("/api/curriculum/evidence/summary")
    def apiCurriculumEvidenceSummary() -> dict[str, int]:
        return state.learningEvidenceArchiveStore.summary()

    @router.get("/api/curriculum/evidence/archive")
    def apiCurriculumEvidenceArchive() -> dict[str, object]:
        return state.learningEvidenceArchiveStore.buildArchive()

    @router.post("/api/curriculum/evidence/import")
    def apiImportCurriculumEvidence(request: CurriculumEvidenceArchiveRequest) -> dict[str, object]:
        try:
            receipt = state.learningEvidenceArchiveStore.mergeArchive(request.archive)
        except EvidenceArchiveError as error:
            fail(400, "curriculum-evidence-archive-invalid", str(error))
        logger.info(
            "curriculum %s",
            formatLogFields(
                action="evidence-import",
                inserted=receipt["inserted"],
                skipped=receipt["skipped"],
                conflicted=receipt["conflicted"],
            ),
        )
        return receipt

    @router.post("/api/curriculum/evidence/event")
    def apiAppendCurriculumEvidence(request: CurriculumEvidenceEventRequest) -> dict[str, object]:
        try:
            receipt = state.learningEvidenceArchiveStore.appendEvent(request.event)
        except EvidenceArchiveError as error:
            fail(400, "curriculum-evidence-event-invalid", str(error))
        logger.info(
            "curriculum %s",
            formatLogFields(
                action="evidence-append",
                inserted=receipt["inserted"],
                skipped=receipt["skipped"],
                conflicted=receipt["conflicted"],
            ),
        )
        return receipt

    @router.get("/api/curriculum/learning-archive/current")
    def apiCurrentCurriculumLearningArchive() -> dict[str, object] | None:
        try:
            archive = readCurrentLearningArchive(state.learningArchiveRoot, required=False)
        except LearningArchiveError as error:
            fail(500, "curriculum-learning-archive-corrupt", str(error))
        return archive

    @router.post("/api/curriculum/learning-archive/import")
    def apiImportCurriculumLearningArchive(request: CurriculumLearningArchiveRequest) -> dict[str, object]:
        try:
            receipt = importLearningArchive(
                request.archive,
                storeRoot=state.learningArchiveRoot,
                evidenceStore=state.learningEvidenceArchiveStore,
            )
        except LearningArchiveError as error:
            fail(400, "curriculum-learning-archive-invalid", str(error))
        logger.info(
            "curriculum %s",
            formatLogFields(
                action="learning-archive-import",
                archiveId=receipt["archiveId"],
                changed=receipt["changed"],
                evidenceInserted=receipt["evidence"]["inserted"],
                automationDrafts=len(receipt["automationDrafts"]),
            ),
        )
        return receipt

    @router.post("/api/curriculum/learning-archive/automation-drafts/{draftId}/adopt")
    def apiAdoptCurriculumLearningArchiveAutomationDraft(draftId: str) -> dict[str, object]:
        try:
            return adoptLearningArchiveAutomationDraft(
                draftId,
                storeRoot=state.learningArchiveRoot,
                workspaceRoot=state.workspaceRoot,
            )
        except LearningArchiveError as error:
            fail(400, "curriculum-learning-archive-automation-invalid", str(error))

    @router.post("/api/curriculum/check/strong/local")
    def apiLocalStrongCheck(request: LocalStrongCheckRequest) -> dict[str, object]:
        try:
            payload = runLocalStrongCheck(request.checkSpec, request.source)
        except LocalStrongCheckInvalid as error:
            fail(400, "curriculum-local-strong-check-invalid", str(error))
        logger.info(
            "curriculum %s",
            formatLogFields(
                action="local-strong-check",
                checkId=request.checkSpec.get("id"),
                passed=payload.get("passed"),
                state=payload.get("state"),
            ),
        )
        return payload

    @router.post("/api/curriculum/check")
    async def apiCheckExercise(request: CheckExerciseRequest) -> dict[str, object]:
        try:
            payload = await runCurriculumCheckFlow(
                curriculumOs=state.curriculumOs,
                learnerStateStore=state.learnerStateStore,
                progressTracker=state.progressTracker,
                request=CurriculumCheckInput(
                    sessionId=request.sessionId,
                    studentCode=request.studentCode,
                    expectedCode=request.expectedCode,
                    checkType=request.checkType,
                    variableName=request.variableName,
                    expectedValue=request.expectedValue,
                    requiredPatterns=request.requiredPatterns,
                    hints=request.hints,
                    currentHintLevel=request.currentHintLevel,
                    category=request.category,
                    contentId=request.contentId,
                    sectionId=request.sectionId,
                ),
                sessionManager=state.sessionManager,
            )
        except CurriculumCheckSessionMissing:
            fail(404, "session_not_found", "Session not found.")
        except CurriculumCheckInvalid as error:
            fail(400, "curriculum_invalid_check", str(error))

        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="check",
                sessionId=request.sessionId,
                checkType=request.checkType,
                passed=payload.get("passed"),
                hintLevel=payload.get("hintLevel"),
                creditedCount=len(payload.get("creditedOutcomes", [])),
                autoValidatedCount=len(payload.get("autoValidatedOutcomes", [])),
                misconceptionMatches=len(payload.get("misconceptionMatches", [])),
                doneCriterionViolated=payload.get("doneCriterionViolated"),
            ),
        )
        return payload

    @router.get("/api/curriculum/taxonomy")
    def apiCurriculumTaxonomy() -> dict[str, object]:
        result = buildCurriculumTaxonomyPayload(state.curriculumOs)
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="taxonomy",
                outcomes=result.outcomeCount,
                domains=result.domainCount,
            ),
        )
        return result.payload

    @router.post("/api/curriculum/master-plan")
    def apiCurriculumMasterPlan(request: MasterPlanRequest) -> dict[str, object]:
        try:
            plan = composeCurriculumMasterPlan(
                curriculumOs=state.curriculumOs,
                progressTracker=state.progressTracker,
                learnerStateStore=state.learnerStateStore,
                learningEvents=state.learningEvidenceArchiveStore.eventPayloads(),
                request=CurriculumMasterPlanInput(
                    domain=request.domain,
                    outcomes=request.outcomes,
                    excludeCompleted=request.excludeCompleted,
                    excludeKeys=request.excludeKeys,
                    skipMasteredOutcomes=request.skipMasteredOutcomes,
                    maxMinutes=request.maxMinutes,
                    projectIntent=request.projectIntent,
                    deliverableOnly=request.deliverableOnly,
                    adaptiveSkip=request.adaptiveSkip,
                ),
            )
        except CurriculumPlanningError as error:
            fail(400, error.code, error.message)
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
        report = analyticsFlow.masteryReport()
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="mastery",
                mastered=report.masteredOutcomeCount,
                total=report.totalOutcomeCount,
            ),
        )
        return report.model_dump()

    @router.get("/api/curriculum/quality-report")
    def apiCurriculumQualityReport() -> dict[str, object]:
        """학습자 행동 데이터 기반 강의 품질 신호 (Phase 8).

        작가가 needs-attention lesson 을 보고 보강 우선순위 결정. 신호는 informational —
        audit gate 차단은 안 한다.
        """
        report = buildCurriculumQualityReport(
            curriculumOs=state.curriculumOs,
            progressTracker=state.progressTracker,
            learnerStateStore=state.learnerStateStore,
        )
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="quality-report",
                lessonCount=len(report.lessons),
                flagged=report.flaggedCount,
            ),
        )
        return report.model_dump()

    @router.get("/api/curriculum/check-proposals")
    def apiCurriculumCheckProposals() -> dict[str, object]:
        """약한 검증 lesson 식별 + (AI provider 있으면) 제안 초안.

        AI provider 가 없으면 약점 목록만 반환 — 작가가 직접 보강.
        """
        provider = getattr(state, "aiProvider", None)
        payload = buildCurriculumCheckProposalsPayload(
            curriculumOs=state.curriculumOs,
            studyLoader=state.studyLoader,
            aiProvider=provider,
        )
        weak = payload.get("weak", [])
        proposals = payload.get("proposals", [])
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="check-proposals",
                weakCount=len(weak) if isinstance(weak, list) else None,
                proposalCount=len(proposals) if isinstance(proposals, list) else None,
            ),
        )
        return payload

    @router.get("/api/curriculum/lesson-stats")
    def apiCurriculumLessonStats() -> dict[str, object]:
        """학습자 실측 학습 시간 통계.

        작가가 estimatedMinutes 보정에 사용. observed 표본이 있는 lesson 만 반환.
        """
        payload = buildCurriculumLessonStatsPayload(
            curriculumOs=state.curriculumOs,
            progressTracker=state.progressTracker,
        )
        lessons = payload.get("lessons", [])
        logger.debug(
            "curriculum %s",
            formatLogFields(action="lesson-stats", count=len(lessons) if isinstance(lessons, list) else None),
        )
        return payload

    @router.post("/api/curriculum/outcomes/validate")
    def apiCurriculumValidateOutcome(request: OutcomeValidationRequest) -> dict[str, object]:
        try:
            payload = updateOutcomeValidation(
                curriculumOs=state.curriculumOs,
                progressTracker=state.progressTracker,
                outcomeId=request.outcomeId,
                validated=request.validated,
            )
        except LearnerProgressError as error:
            fail(400, error.code, error.message)
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="outcome-validate",
                outcomeId=request.outcomeId,
                validated=request.validated,
            ),
        )
        return payload

    @router.get("/api/curriculum/gaps")
    def apiCurriculumGaps(domain: str | None = None) -> dict[str, object]:
        try:
            payload = buildCurriculumGapsPayload(curriculumOs=state.curriculumOs, domain=domain)
        except CurriculumPlanningError as error:
            fail(400, error.code, error.message)
        logger.debug(
            "curriculum %s",
            formatLogFields(action="gaps", domain=domain, gapDomains=len(payload["gaps"])),
        )
        return payload

    @router.get("/api/curriculum/learning-spec")
    def apiLearningSpec() -> dict[str, object]:
        logger.debug("curriculum %s", formatLogFields(action="learning-spec"))
        return buildLearningSpecPayload()

    @router.get("/api/learner/snapshot")
    def apiLearnerSnapshot() -> dict[str, object]:
        """학습자 상태 전체 스냅샷.

        프론트가 mastery 패널, misconception 표시, dynamic gap UI를 그릴 때 호출한다.
        """
        payload = buildLearnerSnapshotPayload(
            learnerStateStore=state.learnerStateStore,
            curriculumOs=state.curriculumOs,
        )
        logger.debug(
            "learner %s",
            formatLogFields(
                action="snapshot",
                masteryEntries=len(payload.get("mastery", [])) if isinstance(payload.get("mastery"), list) else None,
                misconceptionHits=len(payload.get("misconceptions", []))
                if isinstance(payload.get("misconceptions"), list)
                else None,
                repeatedMisconceptions=payload.get("repeatedMisconceptionCount"),
            ),
        )
        return payload

    @router.get("/api/learner/outcome/{outcomeId}")
    def apiLearnerOutcome(outcomeId: str) -> dict[str, object]:
        """단일 outcome에 대한 mastery + 관련 misconception hit 목록.

        한 outcome에 집중할 때 폴링용.
        """
        try:
            payload = buildLearnerOutcomePayload(
                curriculumOs=state.curriculumOs,
                learnerStateStore=state.learnerStateStore,
                outcomeId=outcomeId,
            )
        except LearnerProgressError as error:
            fail(400, error.code, error.message)
        mastery = payload["mastery"] if isinstance(payload.get("mastery"), dict) else {}
        misconceptionHits = payload.get("misconceptionHits")
        logger.debug(
            "learner %s",
            formatLogFields(
                action="outcome",
                outcomeId=outcomeId,
                score=mastery.get("score") if isinstance(mastery, dict) else None,
                misconceptionHits=len(misconceptionHits) if isinstance(misconceptionHits, list) else None,
            ),
        )
        return payload

    @router.get("/api/curriculum/reviews")
    def apiCurriculumReviews() -> dict[str, object]:
        payload = buildCurriculumReviewsPayload(
            curriculumOs=state.curriculumOs,
            progressTracker=state.progressTracker,
        )
        reviews = payload.get("reviews", [])
        logger.debug(
            "curriculum %s",
            formatLogFields(action="reviews-list", dueCount=len(reviews) if isinstance(reviews, list) else None),
        )
        return payload

    @router.get("/api/curriculum/mastery/unified")
    def apiUnifiedMastery() -> dict[str, object]:
        report = analyticsFlow.unifiedMasteryReport()
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
        payload = analyticsFlow.analyticsPayload(days=days)
        logger.debug(
            "curriculum %s",
            formatLogFields(action="analytics", snapshotCount=payload["totalSnapshots"], days=days),
        )
        return payload

    @router.get("/api/curriculum/analytics/summary")
    def apiCurriculumAnalyticsSummary() -> dict[str, object]:
        return analyticsFlow.analyticsSummaryPayload()

    @router.post("/api/curriculum/reviews/{category}/{contentId}")
    def apiRecordReviewResult(category: str, contentId: str, request: ReviewResultRequest) -> dict[str, object]:
        key = f"{category}/{contentId}"
        updated = recordCurriculumReviewResult(
            progressTracker=state.progressTracker,
            category=category,
            contentId=contentId,
            success=request.success,
        )
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
