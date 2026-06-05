from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class InsertBlockRequest(BaseModel):
    path: str
    anchorBlockId: str | None = None
    direction: Literal["before", "after"] = "after"
    type: Literal["code", "markdown"] = "code"
    content: str = ""


class RemoveBlockRequest(BaseModel):
    path: str
    blockId: str


class MoveBlockRequest(BaseModel):
    path: str
    blockId: str
    offset: int


class UpdateBlockRequest(BaseModel):
    path: str
    blockId: str
    content: str | None = None
    type: Literal["code", "markdown"] | None = None


class RunBlockRequest(BaseModel):
    sessionId: str
    path: str
    blockId: str


class ReactiveBlockRequest(BaseModel):
    id: str
    type: Literal["code", "markdown"]
    content: str


class ReactiveExecuteRequest(BaseModel):
    blockId: str
    blocks: list[ReactiveBlockRequest]
    notebookName: str | None = None


class SetUiValueRequest(BaseModel):
    blockId: str
    elementId: str
    value: Any = None
    blocks: list[ReactiveBlockRequest]


class PackageRequest(BaseModel):
    name: str


class PackageInstallCommandRequest(BaseModel):
    names: list[str] = Field(default_factory=list)


class PathRequest(BaseModel):
    path: str


class EnvironmentInfo(BaseModel):
    pythonVersion: str
    platform: str
    cwd: str
    executable: str


class CurriculumProgressRequest(BaseModel):
    category: str
    contentId: str
    missionId: str = ""
    totalMissions: int = 0


class LearnerPredictionPayload(BaseModel):
    expectedShape: str = ""
    expectedDtype: str = ""
    expectedValue: str = ""
    expectedError: str = ""


class CheckExerciseRequest(BaseModel):
    sessionId: str
    studentCode: str
    expectedCode: str = ""
    checkType: str = "output"
    variableName: str = ""
    expectedValue: str = ""
    requiredPatterns: list[str] = Field(default_factory=list)
    hints: list[str] = Field(default_factory=list)
    currentHintLevel: int = 0
    category: str = ""
    contentId: str = ""
    sectionId: str = ""
    prediction: LearnerPredictionPayload | None = None


class MasterPlanRequest(BaseModel):
    domain: str | None = None
    outcomes: list[str] = Field(default_factory=list)
    excludeCompleted: bool = True
    excludeKeys: list[str] = Field(default_factory=list)
    skipMasteredOutcomes: bool = False
    maxMinutes: int = 0
    projectIntent: str = ""
    deliverableOnly: bool = False
    adaptiveSkip: bool = True


class OutcomeValidationRequest(BaseModel):
    outcomeId: str
    validated: bool = True


class ReviewResultRequest(BaseModel):
    success: bool = True


class AssignmentCreateRequest(BaseModel):
    title: str
    description: str = ""
    material: dict[str, Any]
    dueAt: str | None = None
    settings: dict[str, Any] | None = None


class AssignmentPublishRequest(BaseModel):
    tutorToken: str


class AssignmentJoinRequest(BaseModel):
    joinCode: str
    studentTag: str
    displayName: str = ""


class AssignmentEventRequest(BaseModel):
    assignmentId: str
    participantId: str
    participantToken: str
    eventType: str
    eventId: str = ""
    sectionId: str = ""
    category: str = ""
    contentId: str = ""
    payload: dict[str, Any] = Field(default_factory=dict)


class AssignmentCommentRequest(BaseModel):
    assignmentId: str
    body: str
    sectionId: str = ""
    targetParticipantId: str = ""
    tutorToken: str = ""
    participantId: str = ""
    participantToken: str = ""
