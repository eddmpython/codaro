from __future__ import annotations

from fastapi import APIRouter, Query

from ..classroom.assignmentFlow import (
    AssignmentCreateInput,
    AssignmentEventInput,
    AssignmentFlow,
    AssignmentFlowError,
)
from ..serverLog import formatLogFields, getServerLogger
from ..system.serverState import ServerState
from .errors import fail
from .requestModels import (
    AssignmentCommentRequest,
    AssignmentCreateRequest,
    AssignmentEventRequest,
    AssignmentJoinRequest,
    AssignmentPublishRequest,
)


def createClassroomRouter(state: ServerState) -> APIRouter:
    router = APIRouter()
    logger = getServerLogger()
    flow = AssignmentFlow(store=state.assignmentStore)

    def failAssignment(error: AssignmentFlowError) -> None:
        fail(error.statusCode, error.code, error.message)

    @router.get("/api/classroom/status")
    def apiClassroomStatus() -> dict[str, object]:
        return flow.statusPayload()

    @router.get("/api/classroom/assignments")
    def apiListAssignments() -> dict[str, object]:
        payload = flow.listPayload()
        logger.debug("assignment-room %s", formatLogFields(action="list", count=payload["total"]))
        return payload

    @router.post("/api/classroom/assignments")
    def apiCreateAssignment(request: AssignmentCreateRequest) -> dict[str, object]:
        try:
            payload = flow.createPayload(
                AssignmentCreateInput(
                    title=request.title,
                    description=request.description,
                    material=request.material,
                    dueAt=request.dueAt,
                    settings=request.settings,
                )
            )
        except AssignmentFlowError as error:
            failAssignment(error)
        assignment = payload.get("assignment") if isinstance(payload.get("assignment"), dict) else {}
        logger.info("assignment-room %s", formatLogFields(action="create", assignmentId=assignment.get("assignmentId")))
        return payload

    @router.post("/api/classroom/assignments/{assignmentId}/publish")
    def apiPublishAssignment(assignmentId: str, request: AssignmentPublishRequest) -> dict[str, object]:
        try:
            payload = flow.publishPayload(assignmentId, request.tutorToken)
        except AssignmentFlowError as error:
            failAssignment(error)
        logger.info(
            "assignment-room %s",
            formatLogFields(action="publish", assignmentId=assignmentId, joinCode=payload.get("joinCode")),
        )
        return payload

    @router.post("/api/classroom/join")
    def apiJoinAssignment(request: AssignmentJoinRequest) -> dict[str, object]:
        try:
            payload = flow.joinPayload(
                joinCode=request.joinCode,
                studentTag=request.studentTag,
                displayName=request.displayName,
            )
        except AssignmentFlowError as error:
            failAssignment(error)
        assignment = payload.get("assignment") if isinstance(payload.get("assignment"), dict) else {}
        participant = payload.get("participant") if isinstance(payload.get("participant"), dict) else {}
        logger.info(
            "assignment-room %s",
            formatLogFields(
                action="join",
                assignmentId=assignment.get("assignmentId"),
                participantId=participant.get("participantId"),
            ),
        )
        return payload

    @router.get("/api/classroom/assignments/{assignmentId}/material")
    def apiAssignmentMaterial(
        assignmentId: str,
        participantId: str = Query(default=""),
        participantToken: str = Query(default=""),
        tutorToken: str = Query(default=""),
    ) -> dict[str, object]:
        try:
            return flow.materialPayload(
                assignmentId=assignmentId,
                participantId=participantId,
                participantToken=participantToken,
                tutorToken=tutorToken,
            )
        except AssignmentFlowError as error:
            failAssignment(error)

    @router.get("/api/classroom/assignments/{assignmentId}/dashboard")
    def apiAssignmentDashboard(
        assignmentId: str,
        tutorToken: str = Query(default=""),
    ) -> dict[str, object]:
        try:
            payload = flow.dashboardPayload(assignmentId=assignmentId, tutorToken=tutorToken)
        except AssignmentFlowError as error:
            failAssignment(error)
        logger.debug(
            "assignment-room %s",
            formatLogFields(action="dashboard", assignmentId=assignmentId, eventCount=payload.get("eventCount")),
        )
        return payload

    @router.post("/api/classroom/events")
    def apiRecordAssignmentEvent(request: AssignmentEventRequest) -> dict[str, object]:
        try:
            payload = flow.recordEventPayload(
                AssignmentEventInput(
                    assignmentId=request.assignmentId,
                    participantId=request.participantId,
                    participantToken=request.participantToken,
                    eventId=request.eventId,
                    eventType=request.eventType,
                    sectionId=request.sectionId,
                    category=request.category,
                    contentId=request.contentId,
                    payload=request.payload,
                )
            )
        except AssignmentFlowError as error:
            failAssignment(error)
        event = payload.get("event") if isinstance(payload.get("event"), dict) else {}
        logger.debug(
            "assignment-room %s",
            formatLogFields(
                action="event",
                assignmentId=request.assignmentId,
                eventType=event.get("eventType"),
                accepted=payload.get("accepted"),
            ),
        )
        return payload

    @router.get("/api/classroom/events")
    def apiAssignmentEvents(
        assignmentId: str,
        participantId: str = Query(default=""),
        participantToken: str = Query(default=""),
        tutorToken: str = Query(default=""),
        afterSequence: int = Query(default=0),
    ) -> dict[str, object]:
        try:
            return flow.eventsPayload(
                assignmentId=assignmentId,
                participantId=participantId,
                participantToken=participantToken,
                tutorToken=tutorToken,
                afterSequence=afterSequence,
            )
        except AssignmentFlowError as error:
            failAssignment(error)

    @router.post("/api/classroom/comments")
    def apiAssignmentComment(request: AssignmentCommentRequest) -> dict[str, object]:
        try:
            payload = flow.commentPayload(
                assignmentId=request.assignmentId,
                body=request.body,
                sectionId=request.sectionId,
                targetParticipantId=request.targetParticipantId,
                tutorToken=request.tutorToken,
                participantId=request.participantId,
                participantToken=request.participantToken,
            )
        except AssignmentFlowError as error:
            failAssignment(error)
        return payload

    return router
