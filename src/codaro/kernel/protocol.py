from __future__ import annotations

from pydantic import BaseModel, Field


class VariableInfo(BaseModel):
    name: str
    typeName: str
    repr: str
    size: int | None = None


class ExecutionOutput(BaseModel):
    type: str
    blockId: str | None = None
    data: str = ""
    stdout: str = ""
    stderr: str = ""
    variables: list[VariableInfo] = Field(default_factory=list)
    executionCount: int = 0
    status: str = "done"


class ExecuteRequest(BaseModel):
    code: str
    blockId: str | None = None


class SessionInfo(BaseModel):
    sessionId: str
    status: str
    executionCount: int
    variableCount: int


class CreateSessionRequest(BaseModel):
    workingDirectory: str | None = None


class CreateSessionResponse(BaseModel):
    sessionId: str
    status: str


class ResetRequest(BaseModel):
    sessionId: str


class WsExecuteMessage(BaseModel):
    type: str = "execute"
    requestId: str
    code: str
    blockId: str | None = None


class WsResultMessage(BaseModel):
    type: str = "result"
    requestId: str
    blockId: str | None = None
    status: str = "done"
    data: str = ""
    stdout: str = ""
    stderr: str = ""
    variables: list[VariableInfo] = Field(default_factory=list)
    executionCount: int = 0


class WsStatusMessage(BaseModel):
    type: str = "status"
    engineStatus: str


class WsErrorMessage(BaseModel):
    type: str = "error"
    message: str
    requestId: str | None = None
