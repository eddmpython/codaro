from __future__ import annotations

from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from codaro.api.classroomRouter import createClassroomRouter
from codaro.classroom.assignmentFlow import AssignmentCreateInput, AssignmentEventInput, AssignmentFlow
from codaro.classroom.assignmentStore import AssignmentStore
from codaro.classroom.syncQueue import AssignmentSyncQueue


def testAssignmentFlowCreatesPublishesJoinsAndAggregatesEvents(tmp_path) -> None:
    flow = AssignmentFlow(store=AssignmentStore(tmp_path))

    created = flow.createPayload(
        AssignmentCreateInput(
            title="파이썬 변수 과제",
            material=_material(),
        )
    )
    assignment = created["assignment"]
    assert assignment["status"] == "draft"
    assert assignment["material"]["document"]["title"] == "파이썬 변수"

    published = flow.publishPayload(assignment["assignmentId"], created["tutorToken"])
    joinCode = published["joinCode"]
    assert joinCode

    joined = flow.joinPayload(joinCode=joinCode.lower(), studentTag="student-01", displayName="Student 01")
    participant = joined["participant"]
    token = joined["participantToken"]

    firstEvent = flow.recordEventPayload(
        AssignmentEventInput(
            assignmentId=assignment["assignmentId"],
            participantId=participant["participantId"],
            participantToken=token,
            eventId="ev-fixed",
            eventType="checkFailed",
            sectionId="mission-1",
            category="python",
            contentId="variables",
            payload={"feedback": "다시 확인"},
        )
    )
    repeatedEvent = flow.recordEventPayload(
        AssignmentEventInput(
            assignmentId=assignment["assignmentId"],
            participantId=participant["participantId"],
            participantToken=token,
            eventId="ev-fixed",
            eventType="checkFailed",
            sectionId="mission-1",
            category="python",
            contentId="variables",
            payload={"feedback": "다시 확인"},
        )
    )
    assert firstEvent["accepted"] is True
    assert repeatedEvent["accepted"] is False
    assert repeatedEvent["event"]["sequence"] == firstEvent["event"]["sequence"]

    flow.recordEventPayload(
        AssignmentEventInput(
            assignmentId=assignment["assignmentId"],
            participantId=participant["participantId"],
            participantToken=token,
            eventType="checkPassed",
            sectionId="mission-1",
            category="python",
            contentId="variables",
        )
    )
    flow.recordEventPayload(
        AssignmentEventInput(
            assignmentId=assignment["assignmentId"],
            participantId=participant["participantId"],
            participantToken=token,
            eventType="lessonCompleted",
            category="python",
            contentId="variables",
        )
    )

    dashboard = flow.dashboardPayload(assignmentId=assignment["assignmentId"], tutorToken=created["tutorToken"])
    assert dashboard["statusCounts"]["completed"] == 1
    assert dashboard["participants"][0]["learningStatus"] == "completed"
    assert dashboard["participants"][0]["checkFailedCount"] == 1
    assert dashboard["participants"][0]["checkPassedCount"] == 1


def testAssignmentFlowSeparatesStudentQuestionsFromTutorFeedback(tmp_path) -> None:
    flow = AssignmentFlow(store=AssignmentStore(tmp_path))
    created = flow.createPayload(AssignmentCreateInput(title="질문 과제", material=_material()))
    published = flow.publishPayload(created["assignment"]["assignmentId"], created["tutorToken"])
    joined = flow.joinPayload(joinCode=published["joinCode"], studentTag="student-01")
    assignmentId = created["assignment"]["assignmentId"]
    participantId = joined["participant"]["participantId"]
    participantToken = joined["participantToken"]

    question = flow.commentPayload(
        assignmentId=assignmentId,
        body="여기서 왜 실패하나요?",
        participantId=participantId,
        participantToken=participantToken,
    )
    feedback = flow.commentPayload(
        assignmentId=assignmentId,
        body="변수 이름을 먼저 확인하세요.",
        tutorToken=created["tutorToken"],
        targetParticipantId=participantId,
    )

    assert question["event"]["eventType"] == "questionAsked"
    assert question["event"]["participantId"] == participantId
    assert feedback["event"]["eventType"] == "feedbackPosted"
    assert feedback["event"]["participantId"] == "tutor"


def testClassroomRouterRoundTripUsesAssignmentFlowBoundary(tmp_path) -> None:
    app = FastAPI()
    app.include_router(createClassroomRouter(SimpleNamespace(assignmentStore=AssignmentStore(tmp_path))))
    client = TestClient(app)

    created = client.post(
        "/api/classroom/assignments",
        json={"title": "API 과제", "material": _material()},
    )
    assert created.status_code == 200
    createdPayload = created.json()

    published = client.post(
        f"/api/classroom/assignments/{createdPayload['assignment']['assignmentId']}/publish",
        json={"tutorToken": createdPayload["tutorToken"]},
    )
    assert published.status_code == 200
    joinCode = published.json()["joinCode"]

    joined = client.post("/api/classroom/join", json={"joinCode": joinCode, "studentTag": "student-api"})
    assert joined.status_code == 200
    joinedPayload = joined.json()

    material = client.get(
        f"/api/classroom/assignments/{createdPayload['assignment']['assignmentId']}/material",
        params={
            "participantId": joinedPayload["participant"]["participantId"],
            "participantToken": joinedPayload["participantToken"],
        },
    )
    assert material.status_code == 200
    assert material.json()["material"]["title"] == "파이썬 변수"


def testAssignmentSyncQueueTracksPendingDelivery(tmp_path) -> None:
    queue = AssignmentSyncQueue(tmp_path / "events.jsonl")
    queued = queue.enqueue({"eventId": "ev-1", "eventType": "checkPassed"})

    assert queued["attemptCount"] == 0
    assert len(queue.listPending()) == 1

    queue.recordAttempt("ev-1")
    assert queue.listPending()[0]["attemptCount"] == 1

    queue.markDelivered("ev-1")
    assert queue.listPending() == []


def _material() -> dict[str, object]:
    return {
        "sourceKind": "document",
        "title": "파이썬 변수",
        "category": "python",
        "contentId": "variables",
        "document": {
            "title": "파이썬 변수",
            "blocks": [
                {
                    "id": "mission-1",
                    "type": "code",
                    "content": "x = 1",
                }
            ],
        },
        "packages": ["pandas"],
    }
