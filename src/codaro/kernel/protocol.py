from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class VariableInfo(BaseModel):
    name: str
    typeName: str
    repr: str
    size: int | None = None


class VariableDelta(BaseModel):
    added: list[VariableInfo] = Field(default_factory=list)
    updated: list[VariableInfo] = Field(default_factory=list)
    removed: list[str] = Field(default_factory=list)


class ExecutionEvent(BaseModel):
    sequence: int
    eventType: str
    blockId: str | None = None
    executionCount: int = 0
    payload: Any = None


class ExecutionOutput(BaseModel):
    type: str
    blockId: str | None = None
    data: Any = ""
    stdout: str = ""
    stderr: str = ""
    variables: list[VariableInfo] = Field(default_factory=list)
    stateDelta: VariableDelta = Field(default_factory=VariableDelta)
    events: list[ExecutionEvent] = Field(default_factory=list)
    executionCount: int = 0
    status: str = "done"


class ExecuteRequest(BaseModel):
    code: str
    blockId: str | None = None


class ReactiveBlockPayload(BaseModel):
    id: str
    type: Literal["code", "markdown"]
    content: str


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
    type: Literal["execute"] = "execute"
    requestId: str
    code: str
    blockId: str | None = None


class WsInterruptMessage(BaseModel):
    type: Literal["interrupt"] = "interrupt"


class WsGetVariablesMessage(BaseModel):
    type: Literal["getVariables"] = "getVariables"


class WsExecuteReactiveMessage(BaseModel):
    type: Literal["executeReactive"] = "executeReactive"
    requestId: str
    blockId: str
    blocks: list[ReactiveBlockPayload]


class WsResetMessage(BaseModel):
    type: Literal["reset"] = "reset"


class WsResultMessage(BaseModel):
    type: str = "result"
    requestId: str
    blockId: str | None = None
    status: str = "done"
    data: Any = ""
    stdout: str = ""
    stderr: str = ""
    variables: list[VariableInfo] = Field(default_factory=list)
    stateDelta: VariableDelta = Field(default_factory=VariableDelta)
    executionCount: int = 0


class WsExecutionEventMessage(BaseModel):
    type: str = "executionEvent"
    requestId: str
    blockId: str | None = None
    sequence: int
    eventType: str
    executionCount: int = 0
    payload: Any = None


class WsStatusMessage(BaseModel):
    type: str = "status"
    engineStatus: str


class WsErrorMessage(BaseModel):
    type: str = "error"
    message: str
    requestId: str | None = None
