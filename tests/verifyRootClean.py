from __future__ import annotations

import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
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
    "__pycache__",
    "logs",
    "node_modules",
    "screenshots",
    "temp",
    "tmp",
}
ALLOWED_UNTRACKED_ROOT_DIRS = {
    ".agents",
    ".claude",
    ".venv",
    ".venv-wsl",
    "_archive",
    "_backup",
    "_reference",
    "data",
    "output",
}


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


def rootUnexpectedUntrackedEntries() -> list[str]:
    failures: list[str] = []
    for entry in rootUntrackedEntries():
        path = ROOT / entry
        if path.is_dir() and entry in ALLOWED_UNTRACKED_ROOT_DIRS:
            continue
        if path.is_file() and path.suffix.lower() in FORBIDDEN_FILE_SUFFIXES:
            failures.append(entry)
            continue
        if path.is_file() or path.is_dir():
            failures.append(entry + ("/" if path.is_dir() else ""))
    return failures


def main() -> int:
    failures = sorted(set(rootIgnoredForbiddenEntries() + rootUnexpectedUntrackedEntries()))
    if failures:
        print("FAIL: repo root contains local scratch or generated artifacts", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        print(
            "Move disposable files into output/test-runner/<gate>/scratch, OS temp, or _backup/ before finishing.",
            file=sys.stderr,
        )
        return 1

    print("ok: repo root has no local scratch or generated artifacts")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
