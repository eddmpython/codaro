from __future__ import annotations

from fastapi import APIRouter

from ..curriculum.exerciseCheck import ExerciseCheckInput, InvalidExerciseCheck, runExerciseCheck
from ..curriculum.contentCache import CurriculumContentCache
from ..curriculum.outcomeMastery import computeMastery
from ..curriculum.planComposer import PlanGoal, composeMasterPlan
from ..curriculum.studyLoader import CATEGORY_GROUPS, CATEGORY_MAPPING, LEARNING_PATHS, curriculumCategoryTree
from ..curriculum.learningSpec import AI_TEACHER_INSTRUCTIONS, EXERCISE_TYPES, HINT_STRATEGY, LESSON_STRUCTURE, PHILOSOPHY
from ..serverLog import formatLogFields, getServerLogger
from .appState import ServerState
from .errors import fail
from .requestModels import (
    CheckExerciseRequest,
    CurriculumProgressRequest,
    MasterPlanRequest,
    OutcomeValidationRequest,
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

        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="check",
                sessionId=request.sessionId,
                checkType=request.checkType,
                passed=result.passed,
                hintLevel=result.hintLevel,
            ),
        )
        return result.payload()

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

    return router
