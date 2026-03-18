from __future__ import annotations

from typing import Literal

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


class PackageRequest(BaseModel):
    name: str


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
