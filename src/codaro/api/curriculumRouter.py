from __future__ import annotations

from fastapi import APIRouter

from ..curriculum.checker import checkByOutput, checkByVariable, checkContains, checkNoError
from ..curriculum.studyLoader import CATEGORY_GROUPS, CATEGORY_MAPPING, LEARNING_PATHS
from ..curriculum.converter import yamlToDocument
from ..curriculum.learningSpec import AI_TEACHER_INSTRUCTIONS, EXERCISE_TYPES, HINT_STRATEGY, LESSON_STRUCTURE, PHILOSOPHY
from ..serverLog import formatLogFields, getServerLogger
from .appState import ServerState
from .errors import fail
from .requestModels import CheckExerciseRequest, CurriculumProgressRequest


def createCurriculumRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()
    convertedStudyCache: dict[str, dict[str, object]] = {}

    @router.get("/api/curriculum/categories")
    def apiCurriculumCategories() -> dict[str, object]:
        if state.studyLoader is None:
            return {"categories": [], "groups": {}, "learningPaths": {}}
        categories = state.studyLoader.listCategories()
        logger.debug(
            "curriculum %s",
            formatLogFields(action="categories", categoryCount=len(categories)),
        )
        return {
            "categories": [category.model_dump() for category in categories],
            "groups": CATEGORY_GROUPS,
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
        cacheKey = f"{category}/{contentId}"
        cachedPayload = convertedStudyCache.get(cacheKey)
        if cachedPayload is None:
            try:
                yamlContent = state.studyLoader.loadStudy(category, contentId)
            except FileNotFoundError:
                fail(404, "curriculum_content_not_found", "Content not found.")
            document, solutions = yamlToDocument(yamlContent, category, contentId)
            prevNext = state.studyLoader.getPrevNext(category, contentId)
            cachedPayload = {
                "document": document,
                "solutions": dict(solutions),
                "prevNext": dict(prevNext),
            }
            convertedStudyCache[cacheKey] = cachedPayload
        state.progressTracker.markAccessed(category, contentId)
        document = cachedPayload["document"].model_copy(deep=True)
        solutions = dict(cachedPayload["solutions"])
        prevNext = dict(cachedPayload["prevNext"])
        logger.debug(
            "curriculum %s",
            formatLogFields(
                action="content",
                category=category,
                contentId=contentId,
                blockCount=len(document.blocks),
                solutionCount=len(solutions),
            ),
        )
        return {
            "document": document.model_dump(),
            "solutions": solutions,
            "category": category,
            "contentId": contentId,
            "prevNext": prevNext,
        }

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

        if request.checkType == "output" and request.expectedCode:
            result = await checkByOutput(
                session, request.studentCode, request.expectedCode,
                hints=request.hints, currentHintLevel=request.currentHintLevel,
            )
        elif request.checkType == "variable" and request.variableName:
            result = await checkByVariable(
                session, request.studentCode, request.variableName,
                request.expectedValue, hints=request.hints,
                currentHintLevel=request.currentHintLevel,
            )
        elif request.checkType == "contains" and request.requiredPatterns:
            result = await checkContains(request.studentCode, request.requiredPatterns)
        elif request.checkType == "noError":
            result = await checkNoError(session, request.studentCode)
        else:
            fail(400, "curriculum_invalid_check", "Invalid check type or missing parameters.")

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
        return {
            "passed": result.passed,
            "feedback": result.feedback,
            "hintLevel": result.hintLevel,
            "hints": result.hints,
            "studentOutput": result.studentOutput,
            "expectedOutput": result.expectedOutput,
            "detail": result.detail,
        }

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
