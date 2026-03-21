from __future__ import annotations

from datetime import datetime, timezone
from pydantic import BaseModel, Field


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
    checkConfig: dict[str, str] = Field(default_factory=dict)
    difficulty: str = "easy"
    solution: str = ""
    description: str = ""
    studentAnswer: str = ""


class BlockConfig(BaseModel):
    id: str
    type: str
    content: str
    collapsed: bool = False
    execution: BlockExecution = Field(default_factory=BlockExecution)
    guide: GuideConfig | None = None


class DocumentMetadata(BaseModel):
    createdAt: str = Field(default_factory=utcNow)
    updatedAt: str = Field(default_factory=utcNow)
    sourceFormat: str = "codaro"
    tags: list[str] = Field(default_factory=list)


class RuntimeConfig(BaseModel):
    defaultEngine: str = "pyodide"
    reactiveMode: str = "hybrid"
    packages: list[str] = Field(default_factory=list)


class AppConfig(BaseModel):
    title: str = "Untitled"
    layout: str = "notebook"
    hideCode: bool = True
    entryBlockIds: list[str] = Field(default_factory=list)


class CodaroDocument(BaseModel):
    id: str
    title: str
    blocks: list[BlockConfig]
    metadata: DocumentMetadata = Field(default_factory=DocumentMetadata)
    runtime: RuntimeConfig = Field(default_factory=RuntimeConfig)
    app: AppConfig = Field(default_factory=AppConfig)


class LoadRequest(BaseModel):
    path: str


class SaveRequest(BaseModel):
    path: str | None = None
    document: CodaroDocument


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
