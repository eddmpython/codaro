"""과제방이 제품에 다시 들어오지 않고 local archive migration만 남는지 검사한다.

계약은 하나이고 영구적이다. active classroom source 0건, `/api/classroom` HTTP surface 0건,
local-owner migration 연산 유지. 호환 안내를 위한 HTTP 410 tombstone은 제거됐으므로 다시
등장하면 실패한다. 기존 로컬 데이터는 CLI(`codaro classroom audit/export/verify/purge`)로만 다룬다.
"""

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
    "src/codaro/api/classroomRetirementRouter.py",
    "src/codaro/classroomRetirement.py",
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
    "createClassroomRetirementRouter",
    "assignmentStore",
)
FORBIDDEN_ROUTE_TOKENS = (
    "/api/classroom",
)
SOURCE_PATHS = (
    "src/codaro/server.py",
    "src/codaro/system/serverState.py",
    "src/codaro/api/__init__.py",
    "src/codaro/api/requestModels.py",
    "editor/src/lib/api.ts",
    "editor/src/types.ts",
)
MIGRATION_PATH = "src/codaro/migrations/classroomArchive.py"
MIGRATION_OPERATIONS = (
    "auditClassroomArchive",
    "exportClassroomArchive",
    "verifyClassroomArchive",
    "purgeClassroomArchive",
    "resumeClassroomPurge",
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


def pathHasContent(relative: str) -> bool:
    target = ROOT / relative
    if target.is_file():
        return True
    return target.is_dir() and any(
        path.is_file() and "__pycache__" not in path.parts for path in target.rglob("*")
    )


def readText(relative: str) -> str:
    target = ROOT / relative
    return target.read_text(encoding="utf-8") if target.is_file() else ""


def collectReferences(tokens: tuple[str, ...]) -> list[dict[str, object]]:
    references: list[dict[str, object]] = []
    for relative in SOURCE_PATHS:
        for lineNumber, line in enumerate(readText(relative).splitlines(), start=1):
            found = [token for token in tokens if token in line]
            if found:
                references.append({"path": relative, "line": lineNumber, "symbols": found})
    return references


def main() -> int:
    startedAt = datetime.now(UTC)
    existingPaths = [relative for relative in REMOVED_PATHS if pathHasContent(relative)]
    symbolReferences = collectReferences(FORBIDDEN_SYMBOLS)
    routeReferences = collectReferences(FORBIDDEN_ROUTE_TOKENS)
    migrationText = readText(MIGRATION_PATH)

    failures = [
        *[f"removed classroom path still exists: {path}" for path in existingPaths],
        *[
            f"active classroom symbol remains: {row['path']}:{row['line']}"
            for row in symbolReferences
        ],
        *[
            f"classroom HTTP surface remains: {row['path']}:{row['line']}"
            for row in routeReferences
        ],
        *[
            f"classroom migration operation missing: {symbol}"
            for symbol in MIGRATION_OPERATIONS
            if symbol not in migrationText
        ],
    ]
    completedAt = datetime.now(UTC)
    report = {
        "schemaVersion": 3,
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
        "httpSurfaceReferenceCount": len(routeReferences),
        "httpSurfaceReferences": routeReferences,
        "migrationOperationCount": sum(
            symbol in migrationText for symbol in MIGRATION_OPERATIONS
        ),
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print("ok: classroom implementation and HTTP surface are removed, local migration remains")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
