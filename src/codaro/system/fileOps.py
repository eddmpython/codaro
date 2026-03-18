from __future__ import annotations

import shutil
from datetime import datetime, timezone
from pathlib import Path

from pydantic import BaseModel, Field


class FileEntry(BaseModel):
    name: str
    path: str
    isDirectory: bool
    size: int | None = None
    modified: str | None = None
    extension: str | None = None


class FileContent(BaseModel):
    path: str
    content: str
    encoding: str = "utf-8"
    size: int = 0


class WriteFileRequest(BaseModel):
    path: str
    content: str
    encoding: str = "utf-8"
    createDirectories: bool = True


class MoveRequest(BaseModel):
    source: str
    destination: str


class DirectoryListing(BaseModel):
    path: str
    entries: list[FileEntry] = Field(default_factory=list)
    totalFiles: int = 0
    totalDirectories: int = 0


class WorkspacePathError(ValueError):
    def __init__(self, message: str, *, path: Path, workspaceRoot: Path):
        super().__init__(message)
        self.path = path
        self.workspaceRoot = workspaceRoot


def resolvePath(pathLike: str, workspaceRoot: str | Path | None = None) -> Path:
    if workspaceRoot is None:
        return Path(pathLike).expanduser().resolve()

    root = Path(workspaceRoot).expanduser().resolve()
    target = Path(pathLike).expanduser()
    if not target.is_absolute():
        target = root / target
    target = target.resolve()

    try:
        target.relative_to(root)
    except ValueError as error:
        raise WorkspacePathError(
            "Path must stay within the active workspace.",
            path=target,
            workspaceRoot=root,
        ) from error

    return target


async def listDirectory(dirPath: str, workspaceRoot: str | Path | None = None) -> DirectoryListing:
    target = resolvePath(dirPath, workspaceRoot)
    if not target.exists() or not target.is_dir():
        return DirectoryListing(path=str(target))

    entries: list[FileEntry] = []
    fileCount = 0
    dirCount = 0

    for item in sorted(target.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
        try:
            stat = item.stat()
        except OSError:
            continue

        isDir = item.is_dir()
        if isDir:
            dirCount += 1
        else:
            fileCount += 1

        entries.append(
            FileEntry(
                name=item.name,
                path=str(item),
                isDirectory=isDir,
                size=stat.st_size if not isDir else None,
                modified=datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
                extension=item.suffix.lstrip(".") if not isDir and item.suffix else None,
            )
        )

    return DirectoryListing(
        path=str(target),
        entries=entries,
        totalFiles=fileCount,
        totalDirectories=dirCount,
    )


async def readFile(
    filePath: str,
    encoding: str = "utf-8",
    workspaceRoot: str | Path | None = None,
) -> FileContent:
    target = resolvePath(filePath, workspaceRoot)
    content = target.read_text(encoding=encoding)
    return FileContent(
        path=str(target),
        content=content,
        encoding=encoding,
        size=target.stat().st_size,
    )


async def writeFile(
    filePath: str,
    content: str,
    encoding: str = "utf-8",
    createDirectories: bool = True,
    workspaceRoot: str | Path | None = None,
) -> str:
    target = resolvePath(filePath, workspaceRoot)
    if createDirectories:
        target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding=encoding)
    return str(target)


async def deleteEntry(filePath: str, workspaceRoot: str | Path | None = None) -> str:
    target = resolvePath(filePath, workspaceRoot)
    if target.is_dir():
        shutil.rmtree(target)
    else:
        target.unlink()
    return str(target)


async def moveEntry(
    sourcePath: str,
    destinationPath: str,
    workspaceRoot: str | Path | None = None,
) -> str:
    source = resolvePath(sourcePath, workspaceRoot)
    destination = resolvePath(destinationPath, workspaceRoot)
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(source), str(destination))
    return str(destination)


async def createDirectory(dirPath: str, workspaceRoot: str | Path | None = None) -> str:
    target = resolvePath(dirPath, workspaceRoot)
    target.mkdir(parents=True, exist_ok=True)
    return str(target)


async def fileExists(filePath: str, workspaceRoot: str | Path | None = None) -> bool:
    return resolvePath(filePath, workspaceRoot).exists()
