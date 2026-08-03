from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys

from codaro.classroomRetirement import (
    ClassroomRetirementContractInvalid,
    evaluateRetirementState,
    loadRetirementContract,
)


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
    "src/codaro/server.py",
    "src/codaro/system/serverState.py",
    "src/codaro/api/__init__.py",
    "src/codaro/api/requestModels.py",
    "editor/src/lib/api.ts",
    "editor/src/types.ts",
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


def _git(*arguments: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *arguments],
        cwd=ROOT,
        check=False,
        capture_output=True,
        text=True,
    )


def collectReleaseHistory(markerPath: str, routerPath: str) -> dict[str, list[str]] | None:
    """게시된 release tag에 각 path가 들어 있었는지 조사한다.

    tag를 fetch하지 않는 shallow checkout에서는 이력을 알 수 없으므로 `None`을 준다.
    이때 계약 선언이 유일한 판정 근거가 되며 drift 검사만 생략된다.
    """
    listed = _git("tag", "--list")
    if listed.returncode != 0:
        return None
    tags = [line.strip() for line in listed.stdout.splitlines() if line.strip()]
    if not tags:
        return None
    return {
        "tags": tags,
        "releasesWithActiveClassroom": [tag for tag in tags if _pathExistsAtTag(tag, markerPath)],
        "releasesWithTombstone": [tag for tag in tags if _pathExistsAtTag(tag, routerPath)],
    }


def _pathExistsAtTag(tag: str, relativePath: str) -> bool:
    listed = _git("ls-tree", "-r", "--name-only", f"{tag}^{{tree}}", "--", relativePath)
    return listed.returncode == 0 and bool(listed.stdout.strip())


def _pathHasContent(relative: str) -> bool:
    target = ROOT / relative
    if target.is_file():
        return True
    return target.is_dir() and any(
        path.is_file() and "__pycache__" not in path.parts for path in target.rglob("*")
    )


def _readText(relative: str) -> str:
    target = ROOT / relative
    return target.read_text(encoding="utf-8") if target.is_file() else ""


def collectObservedState(contract: dict[str, object]) -> dict[str, object]:
    tombstone = contract["tombstone"]
    window = contract["compatibilityWindow"]
    migration = contract["retainedLocalMigration"]
    routerPath = tombstone["routerPath"]

    symbolReferences: list[dict[str, object]] = []
    for relative in SOURCE_PATHS:
        for lineNumber, line in enumerate(_readText(relative).splitlines(), start=1):
            symbols = [symbol for symbol in FORBIDDEN_SYMBOLS if symbol in line]
            if symbols:
                symbolReferences.append({"path": relative, "line": lineNumber, "symbols": symbols})

    scanPaths = dict.fromkeys((*tombstone["wiringPaths"], *SOURCE_PATHS))
    wiringPaths = [
        relative for relative in scanPaths if tombstone["factory"] in _readText(relative)
    ]

    return {
        "existingRemovedPaths": [
            relative for relative in REMOVED_PATHS if _pathHasContent(relative)
        ],
        "activeSymbolReferences": symbolReferences,
        "tombstonePresent": (ROOT / routerPath).is_file(),
        "tombstoneText": _readText(routerPath),
        "tombstoneWiringPaths": wiringPaths,
        "migrationText": _readText(migration["modulePath"]),
        "releaseHistory": collectReleaseHistory(window["activeClassroomMarkerPath"], routerPath),
    }


def main() -> int:
    startedAt = datetime.now(UTC)
    try:
        contract = loadRetirementContract(ROOT)
    except ClassroomRetirementContractInvalid as exc:
        print(f"FAIL: {exc.code}: {exc}", file=sys.stderr)
        return 1

    observed = collectObservedState(contract)
    evaluation = evaluateRetirementState(contract, observed)
    failures = evaluation["failures"]
    history = observed["releaseHistory"]
    migrationOperations = contract["retainedLocalMigration"]["operations"]
    completedAt = datetime.now(UTC)
    report = {
        "schemaVersion": 2,
        "status": "passed" if not failures else "failed",
        "completionEligible": not failures,
        "gitHead": currentGitHead(),
        "startedAt": startedAt.isoformat(),
        "completedAt": completedAt.isoformat(),
        "durationMs": round((completedAt - startedAt).total_seconds() * 1000),
        "phase": evaluation["phase"],
        "tombstoneRequired": evaluation["tombstoneRequired"],
        "tombstonePresent": observed["tombstonePresent"],
        "tombstoneWiringPaths": observed["tombstoneWiringPaths"],
        "lastReleaseWithActiveClassroom": evaluation["lastReleaseWithActiveClassroom"],
        "firstReleaseWithTombstone": evaluation["firstReleaseWithTombstone"],
        "releaseHistoryChecked": evaluation["releaseHistoryChecked"],
        "releasesWithTombstone": history["releasesWithTombstone"] if history else [],
        "removedPathCount": len(REMOVED_PATHS),
        "existingRemovedPaths": observed["existingRemovedPaths"],
        "activeSymbolReferenceCount": len(observed["activeSymbolReferences"]),
        "activeSymbolReferences": observed["activeSymbolReferences"],
        "retirementHttpStatus": (
            contract["tombstone"]["httpStatus"] if observed["tombstonePresent"] else None
        ),
        "migrationOperationCount": sum(
            symbol in observed["migrationText"] for symbol in migrationOperations
        ),
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print(
        f"ok: classroom retirement is in {evaluation['phase']} phase, "
        "active implementation removed and local migration retained"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
