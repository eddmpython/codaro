from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from ..generatedContracts import AppLayout, AppStatePolicy


def utcNow() -> str:
    return datetime.now(timezone.utc).isoformat()


class BlockExecution(BaseModel):
    executionCount: int = 0
    status: str = "idle"
    lastRunAt: str | None = None
    lastOutput: str | None = None


class GuideConfig(BaseModel):
    exerciseType: str = "fillBlank"
    hints: list[str] = Field(default_factory=list)
    checkConfig: dict[str, Any] = Field(default_factory=dict)
    difficulty: str = "easy"
    solution: str = ""
    description: str = ""
    studentAnswer: str = ""


class BlockConfig(BaseModel):
    id: str
    type: str
    content: str
    role: str | None = None
    executionKind: str | None = None
    displayKind: str | None = None
    sourceType: str | None = None
    payload: Any = None
    title: str | None = None
    description: str | None = None
    collapsed: bool = False
    execution: BlockExecution = Field(default_factory=BlockExecution)
    guide: GuideConfig | None = None


class DocumentMetadata(BaseModel):
    createdAt: str = Field(default_factory=utcNow)
    updatedAt: str = Field(default_factory=utcNow)
    sourceFormat: str = "codaro"
    tags: list[str] = Field(default_factory=list)


class RuntimeConfig(BaseModel):
    defaultEngine: str = "local"
    reactiveMode: str = "hybrid"
    packages: list[str] = Field(default_factory=list)


class AppConfig(BaseModel):
    model_config = ConfigDict(extra="forbid", validate_assignment=True)

    schemaVersion: Literal[1] = 1
    title: str = Field(default="Untitled", min_length=1, max_length=200)
    layout: AppLayout = "notebook"
    hideCode: bool = True
    entryBlockIds: list[str] = Field(default_factory=list)
    statePolicy: AppStatePolicy = "perSession"

    @field_validator("entryBlockIds")
    @classmethod
    def validateUniqueEntryBlockIds(cls, value: list[str]) -> list[str]:
        if len(value) != len(set(value)):
            raise ValueError("app entry block ids must be unique")
        if any(not blockId or len(blockId) > 200 for blockId in value):
            raise ValueError("app entry block ids must contain 1 to 200 characters")
        return value


class CodaroDocument(BaseModel):
    id: str
    title: str
    blocks: list[BlockConfig]
    metadata: DocumentMetadata = Field(default_factory=DocumentMetadata)
    runtime: RuntimeConfig = Field(default_factory=RuntimeConfig)
    app: AppConfig = Field(default_factory=AppConfig)

    @model_validator(mode="after")
    def validateAppEntryBlocks(self) -> "CodaroDocument":
        blockIds = {block.id for block in self.blocks}
        missing = [blockId for blockId in self.app.entryBlockIds if blockId not in blockIds]
        if missing:
            raise ValueError(f"app entry blocks are missing from the document: {missing}")
        return self


class LoadRequest(BaseModel):
    path: str


class SaveRequest(BaseModel):
    path: str | None = None
    document: CodaroDocument
    saveDocumentId: str | None = Field(default=None, max_length=200)
    saveRevision: int | None = Field(default=None, ge=0)
    saveSessionId: str | None = Field(default=None, max_length=200)


class ExportRequest(BaseModel):
    path: str
    format: str
    outputPath: str | None = None


class ExportResponse(BaseModel):
    path: str
    outputPath: str
    format: str


class BootstrapResponse(BaseModel):
    appMode: bool
    documentPath: str | None = None
