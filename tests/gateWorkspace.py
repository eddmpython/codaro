"""Gate execution owns temporary files separately from retained verification reports."""

from __future__ import annotations

from contextlib import contextmanager
from contextvars import ContextVar
import json
import os
from pathlib import Path
import re
import shutil
import stat
import tempfile
import time


_activeWorkspace: ContextVar[tuple[str, Path] | None] = ContextVar("gateWorkspace", default=None)


def executionRoot() -> Path:
    if os.name == "nt":
        base = Path(os.environ.get("LOCALAPPDATA", Path.home() / "AppData" / "Local"))
    else:
        base = Path(os.environ.get("XDG_DATA_HOME", Path.home() / ".local" / "share"))
    return base / "dev-workspace"


def currentGateWorkspace(gateName: str) -> Path | None:
    current = _activeWorkspace.get()
    return current[1] if current is not None and current[0] == gateName else None


def checkFreeSpace(root: Path) -> int:
    usage = shutil.disk_usage(root)
    reserve = max(2 * 1024**3, usage.total // 20)
    if usage.free < reserve:
        raise OSError(
            f"Insufficient space for a new gate: {usage.free / 1024**3:.1f} GiB free; "
            f"{reserve / 1024**3:.1f} GiB reserved on {root.anchor}"
        )
    return usage.free


def removeReadOnlyFile(function, path, error) -> None:
    if not isinstance(error, PermissionError) or Path(path).is_symlink():
        raise error
    mode = os.stat(path, follow_symlinks=False).st_mode
    if mode & stat.S_IWRITE:
        raise error
    os.chmod(path, mode | stat.S_IWRITE)
    function(path)


def removeOwnedWorkspace(path: Path, root: Path) -> None:
    if path.is_symlink() or path.resolve().parent != root.resolve():
        raise OSError(f"Execution workspace escaped its owned parent: {path}")
    for attempt in range(5):
        try:
            shutil.rmtree(path, onexc=removeReadOnlyFile)
            return
        except FileNotFoundError:
            if not path.exists():
                return
            raise
        except PermissionError:
            if attempt == 4:
                raise
            time.sleep(0.2 * (attempt + 1))


@contextmanager
def gateWorkspace(gateName: str, reportRoot: Path):
    active = currentGateWorkspace(gateName)
    if active is not None:
        yield active
        return
    root = executionRoot().resolve()
    root.mkdir(parents=True, exist_ok=True)
    freeBefore = checkFreeSpace(root)
    safeName = re.sub(r"[^A-Za-z0-9-]", "-", gateName)[:60] or "gate"
    owned = Path(tempfile.mkdtemp(prefix=f"codaro-{safeName}-", dir=root))
    token = _activeWorkspace.set((gateName, owned))
    started = time.time()
    cleaned = False
    try:
        yield owned
    finally:
        _activeWorkspace.reset(token)
        try:
            removeOwnedWorkspace(owned, root)
            cleaned = True
        finally:
            reportRoot.mkdir(parents=True, exist_ok=True)
            report = {
                "gate": gateName,
                "workspace": str(owned),
                "startedAt": started,
                "completedAt": time.time(),
                "cleaned": cleaned,
                "freeBytesBefore": freeBefore,
                "freeBytesAfter": shutil.disk_usage(root).free,
            }
            reportPath = reportRoot / f"workspace-{os.getpid()}-{time.time_ns()}.json"
            reportPath.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
