from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class PackContentEntry(BaseModel):
    path: str
    title: str = ""
    description: str = ""


class PackContents(BaseModel):
    curricula: list[PackContentEntry] = Field(default_factory=list)
    automations: list[PackContentEntry] = Field(default_factory=list)
    assets: list[PackContentEntry] = Field(default_factory=list)

    @field_validator("curricula", "automations", "assets", mode="before")
    @classmethod
    def normalizeEntries(cls, value: Any) -> list[dict[str, Any]]:
        if value is None:
            return []
        if not isinstance(value, list):
            raise TypeError("content entries must be a list")
        normalized: list[dict[str, Any]] = []
        for item in value:
            if isinstance(item, str):
                normalized.append({"path": item})
            elif isinstance(item, dict):
                normalized.append(dict(item))
            else:
                raise TypeError("content entries must be strings or objects")
        return normalized


class PackManifest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    kind: str = "codaroPack"
    specVersion: int = 1
    id: str
    version: str = "0.1.0"
    title: str
    description: str = ""
    author: str = ""
    license: str = ""
    codaro: dict[str, Any] = Field(default_factory=dict)
    contents: PackContents = Field(default_factory=PackContents)
    packages: list[str] = Field(default_factory=list)
    permissions: dict[str, Any] = Field(default_factory=dict)
    tags: list[str] = Field(default_factory=list)

    @field_validator("packages", "tags", mode="before")
    @classmethod
    def normalizeStringList(cls, value: Any) -> list[str]:
        if value is None:
            return []
        if not isinstance(value, list):
            raise TypeError("value must be a list")
        return [str(item).strip() for item in value if str(item).strip()]


class PackIssue(BaseModel):
    severity: Literal["error", "warning"]
    code: str
    message: str
    path: str = ""


class PackPreview(BaseModel):
    source: str
    manifest: PackManifest | None
    issues: list[PackIssue] = Field(default_factory=list)
    contentCounts: dict[str, int] = Field(default_factory=dict)
    files: list[str] = Field(default_factory=list)

    @property
    def installable(self) -> bool:
        return self.manifest is not None and not any(issue.severity == "error" for issue in self.issues)

    def payload(self) -> dict[str, Any]:
        return {
            "source": self.source,
            "manifest": self.manifest.model_dump(mode="json") if self.manifest else None,
            "issues": [issue.model_dump(mode="json") for issue in self.issues],
            "contentCounts": dict(self.contentCounts),
            "files": list(self.files),
            "installable": self.installable,
        }


class PackInstallRecord(BaseModel):
    id: str
    version: str
    title: str
    author: str = ""
    source: str
    installedAt: str
    rootPath: str
    contentCounts: dict[str, int] = Field(default_factory=dict)
    contents: dict[str, list[str]] = Field(default_factory=dict)
    packages: list[str] = Field(default_factory=list)
    permissions: dict[str, Any] = Field(default_factory=dict)

    def payload(self) -> dict[str, Any]:
        return self.model_dump(mode="json")
