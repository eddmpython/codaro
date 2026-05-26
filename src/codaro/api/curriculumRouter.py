from __future__ import annotations

from fastapi import APIRouter

from ..curriculum.exerciseCheck import ExerciseCheckInput, InvalidExerciseCheck, runExerciseCheck
from ..curriculum.contentCache import CurriculumContentCache
from ..curriculum.studyLoader import CATEGORY_GROUPS, CATEGORY_MAPPING, LEARNING_PATHS, curriculumCategoryTree
from ..curriculum.learningSpec import AI_TEACHER_INSTRUCTIONS, EXERCISE_TYPES, HINT_STRATEGY, LESSON_STRUCTURE, PHILOSOPHY
from ..serverLog import formatLogFields, getServerLogger
from .appState import ServerState
from .errors import fail
from .requestModels import CheckExerciseRequest, CurriculumProgressRequest


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
