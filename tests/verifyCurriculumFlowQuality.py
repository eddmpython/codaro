from __future__ import annotations

from datetime import UTC, datetime
import json
import re
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

import yaml

from codaro.curriculum.converter import yamlToDocument
from codaro.curriculum.sectionContract import lessonContractFromYaml


ROOT = Path(__file__).resolve().parents[1]
CURRICULA_DIR = ROOT / "curricula" / "python"
REPORT_PATH = ROOT / "output" / "test-runner" / "curriculum-quality-matrix" / "curriculum-flow-quality-report.json"

PACKAGE_ALIASES = {
    "PIL": "pillow",
    "cv2": "opencv-python",
    "mpl_toolkits": "matplotlib",
    "pydantic_settings": "pydantic-settings",
    "sklearn": "scikit-learn",
}
STDLIB_MODULES = set(getattr(sys, "stdlib_module_names", set())) | {
    "__future__",
    "codaro",
    "typing_extensions",
}
IMPORT_RE = re.compile(r"^\s*(?:import\s+([A-Za-z_][\w.]*)|from\s+([A-Za-z_][\w.]*)\s+import\s+)", re.M)
COMPLETION_MARKERS = ("정리", "종합", "완성", "최종", "결과", "프로젝트", "복습", "실습", "미션", "연습")
ORIENTATION_CATEGORIES = {"excel", "practical"}


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    results = [evaluateLesson(path) for path in sorted(CURRICULA_DIR.rglob("*.yaml")) if path.name != "schema.yaml"]
    failures = [failure for result in results for failure in result["failures"]]
    payload = {
        "gate": "curriculum-flow-quality",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "reportPath": displayPath(REPORT_PATH),
        "summary": summarize(results),
        "results": results,
        "failures": failures,
    }
    writeReport(payload)
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: curriculum flow quality audit has failures", file=sys.stderr)
        return 1
    print("ok: curriculum flow quality verified")
    return 0


def evaluateLesson(path: Path) -> dict[str, Any]:
    rel = path.relative_to(CURRICULA_DIR).as_posix()
    category = path.parent.name
    raw = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    content = raw if isinstance(raw, dict) else {}
    meta = content.get("meta") if isinstance(content.get("meta"), dict) else {}
    lessonContract = lessonContractFromYaml(content, fallbackTitle=path.stem)
    sections = [item for item in content.get("sections", []) if isinstance(item, dict)]
    importedPackages = inferImportedPackages(content)
    declaredPackages = uniquePackages(meta.get("packages"))
    declaredNormalized = {normalizePackageName(item) for item in declaredPackages}
    missingPackages = [package for package in importedPackages if normalizePackageName(package) not in declaredNormalized]
    expansionCount = countBlocks(content, "expansion") + structuredPracticeCount(content)
    codeCount = countBlocks(content, "code") + structuredCodeCount(content)
    orientation = isOrientation(rel, category)
    failures: list[str] = []

    try:
        document, solutions = yamlToDocument(content, category, path.stem)
    except Exception as exc:  # pragma: no cover - reports the failing path
        return {
            "path": rel,
            "category": category,
            "orientation": orientation,
            "failures": [f"{rel}: conversion failed: {type(exc).__name__}: {exc}"],
        }

    if not textValue(meta.get("title")):
        failures.append(f"{rel}: meta.title is required")
    if not (lessonContract.intro.direction or lessonContract.intro.benefits):
        failures.append(f"{rel}: intro needs goal, description, or points")
    if not sections:
        failures.append(f"{rel}: sections are required")
    if missingPackages:
        failures.append(f"{rel}: imported packages missing from meta.packages: {', '.join(missingPackages)}")
    if importedPackages and not document.runtime.packages:
        failures.append(f"{rel}: document runtime packages were not preserved")

    solutionBlocks = {block.id: block for block in document.blocks if block.id in solutions}
    if expansionCount:
        if not solutions:
            failures.append(f"{rel}: expansion practice exists but no solutions were captured")
        missingSolutionBlocks = [cellId for cellId in solutions if cellId not in solutionBlocks]
        if missingSolutionBlocks:
            failures.append(f"{rel}: solution ids are missing document blocks: {', '.join(missingSolutionBlocks[:3])}")
        filledExerciseBlocks = [
            block.title or block.id
            for block in solutionBlocks.values()
            if block.role != "exercise"
            or (block.content.strip() and block.sourceType != "sectionContract:exercise")
        ]
        if filledExerciseBlocks:
            failures.append(
                f"{rel}: legacy solution cells must be blank exercise cells: {', '.join(filledExerciseBlocks[:3])}"
            )

    if not orientation:
        if not expansionCount:
            failures.append(f"{rel}: non-orientation lesson needs at least one practice expansion")
        if codeCount < 3:
            failures.append(f"{rel}: non-orientation lesson needs executable code flow")
        if len(sections) < 4:
            failures.append(f"{rel}: non-orientation lesson needs at least 4 learning sections")
        if not hasCompletionSignal(content):
            failures.append(f"{rel}: lesson needs a completion, recap, practice, or final-result signal")

    return {
        "path": rel,
        "category": category,
        "title": textValue(meta.get("title")),
        "orientation": orientation,
        "sectionCount": len(sections),
        "codeBlockCount": codeCount,
        "expansionCount": expansionCount,
        "solutionCount": len(solutions),
        "declaredPackages": declaredPackages,
        "importedPackages": importedPackages,
        "missingPackages": missingPackages,
        "externalUrlCount": len(re.findall(r"https?://", path.read_text(encoding="utf-8"))),
        "failures": failures,
    }


def inferImportedPackages(content: dict[str, Any]) -> list[str]:
    packages: set[str] = set()
    for code in codeSamples(content):
        for match in IMPORT_RE.finditer(code):
            moduleName = (match.group(1) or match.group(2) or "").split(".")[0]
            if not moduleName or moduleName in STDLIB_MODULES:
                continue
            packages.add(PACKAGE_ALIASES.get(moduleName, moduleName))
    return sorted(packages, key=str.lower)


def codeSamples(content: dict[str, Any]):
    for block in walkBlocks(content):
        if block.get("type") not in {"code", "expansion"}:
            continue
        yield textValue(block.get("code") if block.get("code") is not None else block.get("content"))
    for section in structuredSections(content):
        yield textValue(section.get("snippet"))
        exercise = section.get("exercise")
        if isinstance(exercise, dict):
            yield textValue(exercise.get("starterCode"))
            yield textValue(exercise.get("solution"))


def structuredSections(content: dict[str, Any]) -> list[dict[str, Any]]:
    sections = content.get("sections")
    if not isinstance(sections, list):
        return []
    result: list[dict[str, Any]] = []
    for section in sections:
        if not isinstance(section, dict):
            continue
        if section.get("structuredPrimary") is True or any(key in section for key in ("goal", "snippet", "exercise", "check")):
            result.append(section)
    return result


def structuredPracticeCount(content: dict[str, Any]) -> int:
    count = 0
    for section in structuredSections(content):
        exercise = section.get("exercise")
        if isinstance(exercise, dict) and any(
            textValue(exercise.get(key)) for key in ("prompt", "starterCode", "solution")
        ):
            count += 1
    return count


def structuredCodeCount(content: dict[str, Any]) -> int:
    count = 0
    for section in structuredSections(content):
        if textValue(section.get("snippet")):
            count += 1
        exercise = section.get("exercise")
        if isinstance(exercise, dict) and textValue(exercise.get("starterCode")):
            count += 1
    return count


def countBlocks(content: dict[str, Any], sourceType: str) -> int:
    return sum(1 for block in walkBlocks(content) if block.get("type") == sourceType)


def walkBlocks(value: Any):
    if isinstance(value, dict):
        if "type" in value:
            yield value
        for item in value.values():
            yield from walkBlocks(item)
    elif isinstance(value, list):
        for item in value:
            yield from walkBlocks(item)


def hasCompletionSignal(content: dict[str, Any]) -> bool:
    parts: list[str] = []
    for section in content.get("sections", []):
        if not isinstance(section, dict):
            continue
        parts.append(textValue(section.get("title")))
        parts.append(textValue(section.get("goal")))
        parts.append(textValue(section.get("why")))
        exercise = section.get("exercise")
        if isinstance(exercise, dict):
            parts.append(textValue(exercise.get("prompt")))
        for block in section.get("blocks", []):
            if isinstance(block, dict):
                parts.append(textValue(block.get("title")))
                parts.append(textValue(block.get("content")))
    haystack = "\n".join(parts)
    return any(marker in haystack for marker in COMPLETION_MARKERS)


def isOrientation(rel: str, category: str) -> bool:
    fileName = rel.rsplit("/", 1)[-1]
    return fileName.startswith("00_") or category in ORIENTATION_CATEGORIES


def summarize(results: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "lessonCount": len(results),
        "orientationLessonCount": sum(1 for result in results if result.get("orientation")),
        "practiceLessonCount": sum(1 for result in results if int(result.get("expansionCount", 0)) > 0),
        "runtimePackageLessonCount": sum(1 for result in results if result.get("declaredPackages")),
        "externalUrlLessonCount": sum(1 for result in results if int(result.get("externalUrlCount", 0)) > 0),
        "allImportedPackagesDeclared": all(not result.get("missingPackages") for result in results),
        "allPracticeSolutionsCaptured": all(
            int(result.get("expansionCount", 0)) == 0 or int(result.get("solutionCount", 0)) > 0
            for result in results
        ),
        "failureCount": sum(len(result.get("failures", [])) for result in results),
    }


def uniquePackages(value: Any) -> list[str]:
    return sorted(set(uniqueTextList(value)), key=str.lower)


def uniqueTextList(value: Any) -> list[str]:
    if isinstance(value, str | int | float | bool):
        return [str(value)]
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in value:
        if isinstance(item, str | int | float | bool):
            text = str(item).strip()
            if text:
                result.append(text)
    return list(dict.fromkeys(result))


def normalizePackageName(value: str) -> str:
    packageName = re.match(r"^[A-Za-z0-9_.-]+", value.strip())
    normalized = packageName.group(0) if packageName else value.strip()
    return normalized.lower().replace("_", "-")


def textValue(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, int | float | bool):
        return str(value)
    return ""


def writeReport(payload: dict[str, Any]) -> None:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def displayPath(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def currentGitHead() -> str | None:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
    except (FileNotFoundError, OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() or None


if __name__ == "__main__":
    raise SystemExit(main())
