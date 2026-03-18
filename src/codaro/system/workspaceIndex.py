from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

from pydantic import BaseModel, Field

from ..document.percentFormat import isPercentFormat


IGNORED_DIRECTORY_NAMES = {
    ".git",
    ".idea",
    ".svelte-kit",
    ".venv",
    ".venv-wsl",
    "__pycache__",
    "node_modules",
    "webBuild",
    "_backup",
}
NOTEBOOK_FILE_SUFFIXES = {".py", ".ipynb"}
MAX_SCAN_DEPTH = 5
MAX_RECENT_DOCUMENTS = 3


class WorkspaceNode(BaseModel):
    name: str
    path: str
    isDirectory: bool
    notebookType: str
    modified: str | None = None
    children: list["WorkspaceNode"] = Field(default_factory=list)


class WorkspaceDocumentSummary(BaseModel):
    name: str
    path: str
    notebookType: str
    modified: str | None = None
    relativePath: str


class WorkspaceIndex(BaseModel):
    workspaceRoot: str
    codaroTree: list[WorkspaceNode] = Field(default_factory=list)
    recentDocuments: list[WorkspaceDocumentSummary] = Field(default_factory=list)
    compatibleDocuments: list[WorkspaceDocumentSummary] = Field(default_factory=list)
    totalCodaroDocuments: int = 0
    totalCompatibleDocuments: int = 0


WorkspaceNode.model_rebuild()


def buildWorkspaceIndex(workspaceRootPath: str | Path) -> WorkspaceIndex:
    workspaceRoot = Path(workspaceRootPath).expanduser().resolve()
    if not workspaceRoot.exists():
        return WorkspaceIndex(workspaceRoot=str(workspaceRoot))

    recentCandidates: list[WorkspaceDocumentSummary] = []
    compatibleDocuments: list[WorkspaceDocumentSummary] = []
    codaroDocumentCount = 0

    def walkDirectory(directoryPath: Path, depth: int) -> list[WorkspaceNode]:
        nonlocal codaroDocumentCount
        if depth > MAX_SCAN_DEPTH:
            return []

        nodes: list[WorkspaceNode] = []
        for entry in sorted(directoryPath.iterdir(), key=lambda item: (not item.is_dir(), item.name.lower())):
            if shouldIgnoreEntry(entry):
                continue

            if entry.is_dir():
                childNodes = walkDirectory(entry, depth + 1)
                if not childNodes:
                    continue
                nodes.append(
                    WorkspaceNode(
                        name=entry.name,
                        path=str(entry),
                        isDirectory=True,
                        notebookType="folder",
                        modified=toIsoTimestamp(entry),
                        children=childNodes,
                    )
                )
                continue

            notebookType = detectNotebookType(entry)
            if notebookType is None:
                continue
            summary = WorkspaceDocumentSummary(
                name=entry.name,
                path=str(entry),
                notebookType=notebookType,
                modified=toIsoTimestamp(entry),
                relativePath=entry.relative_to(workspaceRoot).as_posix(),
            )
            recentCandidates.append(summary)
            if notebookType == "codaro":
                codaroDocumentCount += 1
                nodes.append(
                    WorkspaceNode(
                        name=entry.name,
                        path=str(entry),
                        isDirectory=False,
                        notebookType=notebookType,
                        modified=summary.modified,
                    )
                )
                continue

            compatibleDocuments.append(summary)
        return nodes

    codaroTree = walkDirectory(workspaceRoot, 0)
    recentDocuments = sorted(
        recentCandidates,
        key=lambda item: item.modified or "",
        reverse=True,
    )[:MAX_RECENT_DOCUMENTS]
    compatibleDocuments.sort(key=lambda item: item.modified or "", reverse=True)
    return WorkspaceIndex(
        workspaceRoot=str(workspaceRoot),
        codaroTree=codaroTree,
        recentDocuments=recentDocuments,
        compatibleDocuments=compatibleDocuments,
        totalCodaroDocuments=codaroDocumentCount,
        totalCompatibleDocuments=len(compatibleDocuments),
    )


def shouldIgnoreEntry(entry: Path) -> bool:
    if entry.name.startswith(".") and entry.name not in {".ipynb"}:
        return True
    if entry.is_dir() and entry.name in IGNORED_DIRECTORY_NAMES:
        return True
    return False


def detectNotebookType(filePath: Path) -> str | None:
    if filePath.suffix.lower() not in NOTEBOOK_FILE_SUFFIXES:
        return None
    if filePath.suffix.lower() == ".ipynb":
        return "jupyter"

    source = filePath.read_text(encoding="utf-8", errors="ignore")
    if "marimo.App" in source or "@app.cell" in source:
        return "marimo"
    if "codaro:app" in source or "import codaro" in source or "@app.block" in source:
        return "codaro"
    if isPercentFormat(source):
        return "codaro"
    return None


def toIsoTimestamp(targetPath: Path) -> str | None:
    try:
        modifiedTime = targetPath.stat().st_mtime
    except OSError:
        return None
    return datetime.fromtimestamp(modifiedTime, tz=timezone.utc).isoformat()
