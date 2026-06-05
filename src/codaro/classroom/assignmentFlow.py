from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from pydantic import ValidationError

from .assignmentModel import (
    AssignmentEvent,
    AssignmentMaterial,
    AssignmentRoom,
    AssignmentSettings,
)
from .assignmentStore import AssignmentStore, eventsByParticipant


class AssignmentFlowError(Exception):
    def __init__(self, statusCode: int, code: str, message: str) -> None:
        super().__init__(message)
        self.statusCode = statusCode
        self.code = code
        self.message = message


@dataclass(frozen=True)
class AssignmentCreateInput:
    title: str
    material: dict[str, Any]
    description: str = ""
    dueAt: str | None = None
    settings: dict[str, Any] | None = None


@dataclass(frozen=True)
class AssignmentEventInput:
    assignmentId: str
    participantId: str
    participantToken: str
    eventType: str
    eventId: str = ""
    sectionId: str = ""
    category: str = ""
    contentId: str = ""
    payload: dict[str, Any] | None = None


class AssignmentFlow:
    def __init__(self, store: AssignmentStore | None = None) -> None:
        self.store = store or AssignmentStore()

    def statusPayload(self) -> dict[str, object]:
        return {
            "enabled": True,
            "storageRoot": str(self.store.storageRoot),
            "syncMode": "local",
        }

    def listPayload(self) -> dict[str, object]:
        assignments = [assignment.publicPayload() for assignment in self.store.listAssignments()]
        return {"assignments": assignments, "total": len(assignments)}

    def createPayload(self, request: AssignmentCreateInput) -> dict[str, object]:
        try:
            material = AssignmentMaterial(**request.material)
            settings = AssignmentSettings(**(request.settings or {}))
            assignment = self.store.createAssignment(
                title=request.title,
                description=request.description,
                material=material,
                dueAt=request.dueAt,
                settings=settings,
            )
        except (ValidationError, ValueError) as error:
            raise AssignmentFlowError(400, "assignment_invalid", str(error)) from error
        return {
            "assignment": assignment.publicPayload(),
            "tutorToken": assignment.tutorToken,
        }

    def publishPayload(self, assignmentId: str, tutorToken: str) -> dict[str, object]:
        assignment = self._requireTutor(assignmentId, tutorToken)
        published = self.store.publishAssignment(assignment.assignmentId)
        if published is None:
            raise AssignmentFlowError(404, "assignment_not_found", "Assignment not found.")
        return {
            "assignment": published.publicPayload(),
            "tutorToken": published.tutorToken,
            "joinCode": published.joinCode,
        }

    def joinPayload(self, *, joinCode: str, studentTag: str, displayName: str = "") -> dict[str, object]:
        joined = self.store.joinAssignment(
            joinCode=joinCode,
            studentTag=studentTag,
            displayName=displayName,
        )
        if joined is None:
            raise AssignmentFlowError(404, "assignment_join_code_not_found", "Join code not found.")
        assignment, participant = joined
        return {
            "assignment": assignment.publicPayload(),
            "participant": participant.payload(),
            "participantToken": participant.participantToken,
        }

    def materialPayload(
        self,
        *,
        assignmentId: str,
        participantId: str = "",
        participantToken: str = "",
        tutorToken: str = "",
    ) -> dict[str, object]:
        assignment = self._requireAccess(
            assignmentId=assignmentId,
            participantId=participantId,
            participantToken=participantToken,
            tutorToken=tutorToken,
        )
        return {
            "assignment": assignment.publicPayload(),
            "material": assignment.material.model_dump(mode="json"),
        }

    def dashboardPayload(self, *, assignmentId: str, tutorToken: str) -> dict[str, object]:
        assignment = self._requireTutor(assignmentId, tutorToken)
        events = self.store.listEvents(assignmentId)
        participantEvents = eventsByParticipant(events)
        participants = []
        for participantId, participant in sorted(assignment.participants.items(), key=lambda item: item[1].joinedAt):
            summary = summarizeParticipantEvents(participantEvents.get(participantId, []))
            participants.append({
                **participant.payload(),
                **summary,
            })
        statusCounts = {
            "notStarted": sum(1 for item in participants if item["learningStatus"] == "notStarted"),
            "inProgress": sum(1 for item in participants if item["learningStatus"] == "inProgress"),
            "stuck": sum(1 for item in participants if item["learningStatus"] == "stuck"),
            "completed": sum(1 for item in participants if item["learningStatus"] == "completed"),
        }
        return {
            "assignment": assignment.publicPayload(),
            "participants": participants,
            "statusCounts": statusCounts,
            "sectionStats": summarizeSections(events),
            "eventCount": len(events),
        }

    def recordEventPayload(self, request: AssignmentEventInput) -> dict[str, object]:
        assignment = self._requireParticipant(
            request.assignmentId,
            request.participantId,
            request.participantToken,
        )
        del assignment
        try:
            eventPayload = {
                "assignmentId": request.assignmentId,
                "participantId": request.participantId,
                "eventType": request.eventType,
                "sectionId": request.sectionId,
                "category": request.category,
                "contentId": request.contentId,
                "payload": request.payload or {},
            }
            if request.eventId:
                eventPayload["eventId"] = request.eventId
            event = AssignmentEvent(**eventPayload)
        except (ValidationError, ValueError) as error:
            raise AssignmentFlowError(400, "assignment_event_invalid", str(error)) from error
        stored, accepted = self.store.appendEvent(event)
        return {
            "event": stored.model_dump(mode="json"),
            "accepted": accepted,
        }

    def eventsPayload(
        self,
        *,
        assignmentId: str,
        participantId: str = "",
        participantToken: str = "",
        tutorToken: str = "",
        afterSequence: int = 0,
    ) -> dict[str, object]:
        assignment = self._requireAccess(
            assignmentId=assignmentId,
            participantId=participantId,
            participantToken=participantToken,
            tutorToken=tutorToken,
        )
        events = self.store.listEvents(assignment.assignmentId, afterSequence=afterSequence)
        if tutorToken:
            visibleEvents = events
        else:
            visibleEvents = [event for event in events if event.participantId == participantId]
        return {
            "events": [event.model_dump(mode="json") for event in visibleEvents],
            "nextSequence": events[-1].sequence if events else afterSequence,
        }

    def commentPayload(
        self,
        *,
        assignmentId: str,
        body: str,
        sectionId: str = "",
        targetParticipantId: str = "",
        tutorToken: str = "",
        participantId: str = "",
        participantToken: str = "",
    ) -> dict[str, object]:
        if tutorToken:
            assignment = self._requireTutor(assignmentId, tutorToken)
            authorParticipantId = "tutor"
            eventType = "feedbackPosted"
            payload = {
                "body": body,
                "authorRole": "tutor",
                "targetParticipantId": targetParticipantId,
            }
        else:
            assignment = self._requireParticipant(assignmentId, participantId, participantToken)
            authorParticipantId = participantId
            eventType = "questionAsked"
            payload = {
                "body": body,
                "authorRole": "student",
                "targetParticipantId": targetParticipantId,
            }
        if not body.strip():
            raise AssignmentFlowError(400, "assignment_comment_empty", "Comment body is required.")
        event = AssignmentEvent(
            assignmentId=assignment.assignmentId,
            participantId=authorParticipantId,
            eventType=eventType,
            sectionId=sectionId,
            payload=payload,
        )
        stored, accepted = self.store.appendEvent(event)
        return {"event": stored.model_dump(mode="json"), "accepted": accepted}

    def _requireTutor(self, assignmentId: str, tutorToken: str) -> AssignmentRoom:
        assignment = self.store.getAssignment(assignmentId)
        if assignment is None:
            raise AssignmentFlowError(404, "assignment_not_found", "Assignment not found.")
        if not tutorToken or tutorToken != assignment.tutorToken:
            raise AssignmentFlowError(403, "assignment_tutor_forbidden", "Tutor token is required.")
        return assignment

    def _requireParticipant(
        self,
        assignmentId: str,
        participantId: str,
        participantToken: str,
    ) -> AssignmentRoom:
        assignment = self.store.getAssignment(assignmentId)
        if assignment is None:
            raise AssignmentFlowError(404, "assignment_not_found", "Assignment not found.")
        participant = assignment.participants.get(participantId)
        if participant is None or participant.participantToken != participantToken:
            raise AssignmentFlowError(403, "assignment_participant_forbidden", "Participant token is required.")
        return assignment

    def _requireAccess(
        self,
        *,
        assignmentId: str,
        participantId: str = "",
        participantToken: str = "",
        tutorToken: str = "",
    ) -> AssignmentRoom:
        assignment = self.store.getAssignment(assignmentId)
        if assignment is None:
            raise AssignmentFlowError(404, "assignment_not_found", "Assignment not found.")
        if tutorToken and tutorToken == assignment.tutorToken:
            return assignment
        return self._requireParticipant(assignmentId, participantId, participantToken)


def summarizeParticipantEvents(events: list[AssignmentEvent]) -> dict[str, object]:
    if not events:
        return {
            "learningStatus": "notStarted",
            "lastEventAt": None,
            "currentSectionId": "",
            "checkPassedCount": 0,
            "checkFailedCount": 0,
            "hintUsedCount": 0,
            "missionCompletedCount": 0,
            "completedSections": [],
            "failedSections": [],
            "latestFailure": None,
        }
    last = events[-1]
    passedSections = {
        event.sectionId
        for event in events
        if event.eventType == "checkPassed" and event.sectionId
    }
    failedSections = {
        event.sectionId
        for event in events
        if event.eventType == "checkFailed" and event.sectionId and event.sectionId not in passedSections
    }
    checkFailed = [event for event in events if event.eventType == "checkFailed"]
    checkPassed = [event for event in events if event.eventType == "checkPassed"]
    hintUsed = [event for event in events if event.eventType == "hintUsed"]
    missionCompleted = [event for event in events if event.eventType == "missionCompleted"]
    lessonCompleted = any(event.eventType == "lessonCompleted" for event in events)
    latestFailure = checkFailed[-1] if checkFailed else None
    stuck = bool(failedSections) or (len(checkFailed) >= 2 and len(checkFailed) > len(checkPassed))
    status = "completed" if lessonCompleted else "stuck" if stuck else "inProgress"
    return {
        "learningStatus": status,
        "lastEventAt": last.createdAt,
        "currentSectionId": last.sectionId,
        "checkPassedCount": len(checkPassed),
        "checkFailedCount": len(checkFailed),
        "hintUsedCount": len(hintUsed),
        "missionCompletedCount": len(missionCompleted),
        "completedSections": sorted(passedSections),
        "failedSections": sorted(failedSections),
        "latestFailure": latestFailure.model_dump(mode="json") if latestFailure else None,
    }


def summarizeSections(events: list[AssignmentEvent]) -> list[dict[str, object]]:
    bySection: dict[str, dict[str, object]] = {}
    for event in events:
        if not event.sectionId:
            continue
        bucket = bySection.setdefault(
            event.sectionId,
            {
                "sectionId": event.sectionId,
                "started": 0,
                "passed": 0,
                "failed": 0,
                "hintUsed": 0,
            },
        )
        if event.eventType == "sectionStarted":
            bucket["started"] = int(bucket["started"]) + 1
        elif event.eventType == "checkPassed":
            bucket["passed"] = int(bucket["passed"]) + 1
        elif event.eventType == "checkFailed":
            bucket["failed"] = int(bucket["failed"]) + 1
        elif event.eventType == "hintUsed":
            bucket["hintUsed"] = int(bucket["hintUsed"]) + 1
    return [bySection[key] for key in sorted(bySection)]
