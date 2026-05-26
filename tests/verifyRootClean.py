from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
STRUCTURE_DOC = ROOT / "docs" / "skills" / "architecture" / "repository-structure.md"
FORBIDDEN_FILE_SUFFIXES = {
    ".csv",
    ".db",
    ".ipynb",
    ".log",
    ".parquet",
    ".pid",
    ".sqlite",
    ".tmp",
    ".tsbuildinfo",
    ".txt",
}
FORBIDDEN_ROOT_DIRS = {
    ".playwright-cli",
    ".pytest_cache",
    "_archive",
    "_backup",
    "_reference",
    "build",
    "__pycache__",
    "logs",
    "node_modules",
    "screenshots",
    "temp",
    "tmp",
    "wheels",
}
FORBIDDEN_BACKUP_DIR_NAMES = {
    "_archive",
    "_backup",
    "_reference",
}
BACKUP_SCAN_SKIP_DIRS = {
    ".git",
    ".ruff_cache",
    ".venv",
    ".venv-wsl",
    "dist",
    "localData",
    "node_modules",
    "output",
    "sns",
}
REQUIRED_ROOT_DIRS = {
    ".github",
    ".githooks",
    "assets",
    "curricula",
    "demos",
    "docs",
    "editor",
    "landing",
    "launcher",
    "notebooks",
    "src",
    "tests",
}
REQUIRED_ROOT_FILES = {
    ".gitignore",
    ".python-version",
    "CHANGELOG.md",
    "CODE_OF_CONDUCT.md",
    "CONTRIBUTING.md",
    "LICENSE",
    "LICENSE-CONTENT.md",
    "PRIVACY.md",
    "README.md",
    "SECURITY.md",
    "SUPPORT.md",
    "TRADEMARKS.md",
    "goalNinePlusChecklist.md",
    "launchKit.md",
    "objectiveNinePlusScorecard.md",
    "pyproject.toml",
    "publicReadinessChecklist.md",
    "uv.lock",
}
ALLOWED_LOCAL_ROOT_DIRS = {
    ".agents",
    ".claude",
    ".git",
    ".ruff_cache",
    ".venv",
    ".venv-wsl",
    "data",
    "dist",
    "localData",
    "output",
    "sns",
}
ALLOWED_LOCAL_ROOT_FILES = {
    "AGENTS.md",
    "CLAUDE.md",
    "PRD.local.md",
}
ALLOWED_ROOT_DIRS = REQUIRED_ROOT_DIRS | ALLOWED_LOCAL_ROOT_DIRS
ALLOWED_ROOT_FILES = REQUIRED_ROOT_FILES | ALLOWED_LOCAL_ROOT_FILES


def gitOutput(*args: str) -> list[str]:
    result = subprocess.run(
        ("git", *args),
        cwd=ROOT,
        check=True,
        capture_output=True,
        encoding="utf-8",
    )
    return [line.strip() for line in result.stdout.splitlines() if line.strip()]


def rootRelativePath(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def rootUntrackedEntries() -> list[str]:
    entries = gitOutput("ls-files", "--others", "--exclude-standard", "--", ":/*")
    return [entry for entry in entries if "/" not in entry]


def rootIgnoredForbiddenEntries() -> list[str]:
    failures: list[str] = []
    for entry in ROOT.iterdir():
        name = entry.name
        if entry.is_file() and entry.suffix.lower() in FORBIDDEN_FILE_SUFFIXES:
            failures.append(rootRelativePath(entry))
        if entry.is_dir() and name in FORBIDDEN_ROOT_DIRS:
            failures.append(rootRelativePath(entry) + "/")
    return failures


def rootUnexpectedFilesystemEntries() -> list[str]:
    failures: list[str] = []
    for entry in ROOT.iterdir():
        name = entry.name
        if entry.is_dir():
            if name not in ALLOWED_ROOT_DIRS:
                failures.append(rootRelativePath(entry) + "/")
            continue
        if entry.is_file():
            if name not in ALLOWED_ROOT_FILES:
                failures.append(rootRelativePath(entry))
    return failures


def backupLikeDirectoryEntries() -> list[str]:
    failures: list[str] = []
    pending = [ROOT]
    while pending:
        current = pending.pop()
        try:
            children = tuple(current.iterdir())
        except OSError as exc:
            failures.append(f"{rootRelativePath(current)}/ unreadable: {exc}")
            continue
        for child in children:
            if not child.is_dir():
                continue
            name = child.name
            if name in FORBIDDEN_BACKUP_DIR_NAMES:
                failures.append(rootRelativePath(child) + "/")
                continue
            if name in BACKUP_SCAN_SKIP_DIRS:
                continue
            pending.append(child)
    return failures


def missingRequiredRootEntries() -> list[str]:
    failures: list[str] = []
    for name in sorted(REQUIRED_ROOT_DIRS):
        if not (ROOT / name).is_dir():
            failures.append(f"{name}/")
    for name in sorted(REQUIRED_ROOT_FILES):
        if not (ROOT / name).is_file():
            failures.append(name)
    return failures


def structureDocFailures() -> list[str]:
    if not STRUCTURE_DOC.exists():
        return [rootRelativePath(STRUCTURE_DOC)]
    text = STRUCTURE_DOC.read_text(encoding="utf-8")
    requiredNeedles = (
        "## Things To Watch",
        "## Canonical Root Tree",
        "`tests/verifyRootClean.py`",
        "launcher는 PyPI 단독 배포를 전제로 삼지 않는다",
        "백업성 루트",
        "`uv run python -X utf8 tests/run.py gate root-clean`",
    )
    return [rootRelativePath(STRUCTURE_DOC) + f" missing {needle}" for needle in requiredNeedles if needle not in text]


def rootUnexpectedUntrackedEntries() -> list[str]:
    failures: list[str] = []
    for entry in rootUntrackedEntries():
        path = ROOT / entry
        if path.is_dir() and entry in ALLOWED_LOCAL_ROOT_DIRS:
            continue
        if path.is_file() and entry in ALLOWED_LOCAL_ROOT_FILES:
            continue
        if path.is_file() and path.suffix.lower() in FORBIDDEN_FILE_SUFFIXES:
            failures.append(entry)
            continue
        if path.is_file() or path.is_dir():
            failures.append(entry + ("/" if path.is_dir() else ""))
    return failures


def main() -> int:
    failures = sorted(set(
        rootIgnoredForbiddenEntries()
        + rootUnexpectedFilesystemEntries()
        + backupLikeDirectoryEntries()
        + rootUnexpectedUntrackedEntries()
    ))
    missingEntries = missingRequiredRootEntries()
    docFailures = structureDocFailures()
    if failures:
        print("FAIL: repo root diverges from the canonical structure", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        print(
            "Use docs/skills/architecture/repository-structure.md before adding root files or folders.",
            file=sys.stderr,
        )
        return 1
    if missingEntries:
        print("FAIL: repo root is missing required structure entries", file=sys.stderr)
        for failure in missingEntries:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    if docFailures:
        print("FAIL: repository structure SSOT is missing or stale", file=sys.stderr)
        for failure in docFailures:
            print(f"  - {failure}", file=sys.stderr)
        return 1

    print("ok: repo root matches the canonical structure and has no local scratch artifacts")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
