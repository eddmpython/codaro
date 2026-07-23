from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[2]
REPORT_PATH = ROOT / "output" / "test-runner" / "removed-learning-concepts" / "classroom-removed-report.json"
REMOVED_PATHS = (
    "src/codaro/classroom",
    "src/codaro/api/classroomRouter.py",
    "tests/classroom/testAssignmentRoom.py",
    "editor/src/components/classroom",
    "editor/src/hooks/useAssignmentRoomState.ts",
    "editor/src/lib/classroomEvents.ts",
    "editor/src/lib/classroomOperations.ts",
    "editor/src/lib/classroomSession.ts",
)
FORBIDDEN_SYMBOLS = (
    "AssignmentStore",
    "AssignmentFlow",
    "createClassroomRouter",
    "assignmentStore",
)
SOURCE_PATHS = (
    ROOT / "src" / "codaro" / "server.py",
    ROOT / "src" / "codaro" / "system" / "serverState.py",
    ROOT / "src" / "codaro" / "api" / "__init__.py",
    ROOT / "src" / "codaro" / "api" / "requestModels.py",
    ROOT / "editor" / "src" / "lib" / "api.ts",
    ROOT / "editor" / "src" / "types.ts",
)


def currentGitHead() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def main() -> int:
    startedAt = datetime.now(UTC)
    existingPaths = [
        relative
        for relative in REMOVED_PATHS
        if (ROOT / relative).is_file()
        or (
            (ROOT / relative).is_dir()
            and any(
                path.is_file() and "__pycache__" not in path.parts
                for path in (ROOT / relative).rglob("*")
            )
        )
    ]
    symbolReferences: list[dict[str, object]] = []
    for path in SOURCE_PATHS:
        text = path.read_text(encoding="utf-8")
        for lineNumber, line in enumerate(text.splitlines(), start=1):
            symbols = [symbol for symbol in FORBIDDEN_SYMBOLS if symbol in line]
            if symbols:
                symbolReferences.append({
                    "path": path.relative_to(ROOT).as_posix(),
                    "line": lineNumber,
                    "symbols": symbols,
                })
    retirementRouter = ROOT / "src" / "codaro" / "api" / "classroomRetirementRouter.py"
    retirementText = retirementRouter.read_text(encoding="utf-8") if retirementRouter.is_file() else ""
    migration = ROOT / "src" / "codaro" / "migrations" / "classroomArchive.py"
    migrationText = migration.read_text(encoding="utf-8") if migration.is_file() else ""
    requiredRetirementTokens = (
        'status_code=410',
        '"codaro classroom audit"',
        '"codaro classroom export --output <archive.zip>"',
    )
    requiredMigrationSymbols = (
        "auditClassroomArchive",
        "exportClassroomArchive",
        "verifyClassroomArchive",
        "purgeClassroomArchive",
        "resumeClassroomPurge",
    )
    failures = [
        *[f"removed classroom path still exists: {path}" for path in existingPaths],
        *[
            f"active classroom symbol remains: {row['path']}:{row['line']}"
            for row in symbolReferences
        ],
        *[
            f"classroom retirement response missing: {token}"
            for token in requiredRetirementTokens
            if token not in retirementText
        ],
        *[
            f"classroom migration operation missing: {symbol}"
            for symbol in requiredMigrationSymbols
            if symbol not in migrationText
        ],
    ]
    completedAt = datetime.now(UTC)
    report = {
        "schemaVersion": 1,
        "status": "passed" if not failures else "failed",
        "completionEligible": not failures,
        "gitHead": currentGitHead(),
        "startedAt": startedAt.isoformat(),
        "completedAt": completedAt.isoformat(),
        "durationMs": round((completedAt - startedAt).total_seconds() * 1000),
        "removedPathCount": len(REMOVED_PATHS),
        "existingRemovedPaths": existingPaths,
        "activeSymbolReferenceCount": len(symbolReferences),
        "activeSymbolReferences": symbolReferences,
        "retirementHttpStatus": 410 if "status_code=410" in retirementText else None,
        "migrationOperationCount": sum(symbol in migrationText for symbol in requiredMigrationSymbols),
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print("ok: active classroom implementation is removed and local migration remains")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
