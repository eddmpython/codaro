from __future__ import annotations

from datetime import UTC, datetime
import secrets
import string
import uuid
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


AssignmentStatus = Literal["draft", "published", "archived"]
MaterialSourceKind = Literal["document", "sharePack", "inlineYaml"]
ParticipantRole = Literal["student", "tutor"]
ShareCodePolicy = Literal["never", "finalOnly", "liveHelp"]
AssignmentEventType = Literal[
    "materialOpened",
    "sectionStarted",
    "predictionLocked",
    "checkSubmitted",
    "checkPassed",
    "checkFailed",
    "hintUsed",
    "missionCompleted",
    "lessonCompleted",
    "questionAsked",
    "feedbackPosted",
    "feedbackRead",
]


def utcNow() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def newAssignmentId() -> str:
    return f"as-{uuid.uuid4().hex[:12]}"


def newParticipantId() -> str:
    return f"pt-{uuid.uuid4().hex[:12]}"


def newEventId() -> str:
    return f"ev-{uuid.uuid4().hex}"


def newSecretToken(prefix: str) -> str:
    return f"{prefix}-{secrets.token_urlsafe(24)}"


def newJoinCode() -> str:
    alphabet = string.ascii_uppercase + string.digits
    chunks = [
        "".join(secrets.choice(alphabet) for _ in range(4)),
        "".join(secrets.choice(alphabet) for _ in range(4)),
    ]
    return "-".join(chunks)


class AssignmentSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")

    shareCode: ShareCodePolicy = "never"
    allowLateSubmission: bool = True
    syncMode: Literal["local", "relay"] = "local"


class AssignmentMaterial(BaseModel):
    model_config = ConfigDict(extra="forbid")

    materialId: str = Field(default_factory=lambda: f"mat-{uuid.uuid4().hex[:12]}")
    sourceKind: MaterialSourceKind = "document"
    title: str
    category: str = ""
    contentId: str = ""
    document: dict[str, Any] | None = None
    packId: str = ""
    packVersion: str = ""
    contentPath: str = ""
    packages: list[str] = Field(default_factory=list)

    @field_validator("title")
    @classmethod
    def titleMustNotBeEmpty(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("material title is required")
        return cleaned

    @field_validator("packages", mode="before")
    @classmethod
    def normalizePackages(cls, value: Any) -> list[str]:
        if value is None:
            return []
        if not isinstance(value, list):
            raise TypeError("packages must be a list")
        return [str(item).strip() for item in value if str(item).strip()]


class AssignmentParticipant(BaseModel):
    model_config = ConfigDict(extra="forbid")

    participantId: str = Field(default_factory=newParticipantId)
    role: ParticipantRole = "student"
    studentTag: str
    displayName: str = ""
    participantToken: str = Field(default_factory=lambda: newSecretToken("student"))
    joinedAt: str = Field(default_factory=utcNow)
    lastSeenAt: str = Field(default_factory=utcNow)

    @field_validator("studentTag")
    @classmethod
    def studentTagMustNotBeEmpty(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("studentTag is required")
        return cleaned

    def payload(self) -> dict[str, Any]:
        payload = self.model_dump(mode="json")
        payload.pop("participantToken", None)
        return payload


class AssignmentEvent(BaseModel):
    model_config = ConfigDict(extra="forbid")

    eventId: str = Field(default_factory=newEventId)
    assignmentId: str
    participantId: str
    eventType: AssignmentEventType
    sequence: int = 0
    sectionId: str = ""
    category: str = ""
    contentId: str = ""
    createdAt: str = Field(default_factory=utcNow)
    payload: dict[str, Any] = Field(default_factory=dict)


class AssignmentRoom(BaseModel):
    model_config = ConfigDict(extra="forbid")

    assignmentId: str = Field(default_factory=newAssignmentId)
    title: str
    description: str = ""
    status: AssignmentStatus = "draft"
    joinCode: str = ""
    tutorToken: str = Field(default_factory=lambda: newSecretToken("tutor"))
    material: AssignmentMaterial
    participants: dict[str, AssignmentParticipant] = Field(default_factory=dict)
    settings: AssignmentSettings = Field(default_factory=AssignmentSettings)
    dueAt: str | None = None
    createdAt: str = Field(default_factory=utcNow)
    updatedAt: str = Field(default_factory=utcNow)

    @field_validator("title")
    @classmethod
    def titleMustNotBeEmpty(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("assignment title is required")
        return cleaned

    def publicPayload(self) -> dict[str, Any]:
        payload = self.model_dump(mode="json")
        payload.pop("tutorToken", None)
        payload["participants"] = {
            participantId: participant.payload()
            for participantId, participant in self.participants.items()
        }
        return payload
