from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
from typing import Any

import yaml

from codaro.curriculum.lessonGraph import LessonNode, buildLessonGraph
from codaro.curriculum.planComposer import PlanGoal, composeMasterPlan
from codaro.curriculum.studyLoader import StudyLoader
from codaro.curriculum.taxonomy import loadTaxonomy


ROOT = Path(__file__).resolve().parents[4]
CURRICULA_ROOT = ROOT / "curricula/python"
FEATURED_PATH_IDS = (
    "pythonFoundation",
    "dataReporting",
    "dataVisualization",
    "fileAutomation",
    "officeAutomation",
    "webMonitoring",
)
METADATA_KEYS = ("outcomes", "prerequisites", "estimatedMinutes")


def loadYaml(path: Path) -> dict[str, Any]:
    payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"YAML root must be a mapping: {path.relative_to(ROOT)}")
    return payload


def featuredLessons() -> dict[str, tuple[Path, LessonNode]]:
    loader = StudyLoader(CURRICULA_ROOT)
    taxonomy = loadTaxonomy(CURRICULA_ROOT / "_taxonomy.yml")
    graph = buildLessonGraph(loader, taxonomy)
    byKey = {lesson.key: lesson for lesson in graph.lessons}
    selected: dict[str, tuple[Path, LessonNode]] = {}
    for pathId in FEATURED_PATH_IDS:
        plan = composeMasterPlan(
            PlanGoal(domain=pathId, excludeCompleted=False, adaptiveSkip=False),
            graph,
            taxonomy,
        )
        if plan.gaps:
            raise ValueError(f"featured path has unresolved gap: {pathId}")
        for step in plan.steps:
            lesson = byKey[step.key]
            sourcePath = loader._getStudyPath(lesson.category, lesson.contentId)  # noqa: SLF001
            selected[lesson.key] = (sourcePath, lesson)
    return selected


def expectedMetadata(lesson: LessonNode) -> dict[str, Any]:
    if not lesson.outcomes or lesson.estimatedMinutes <= 0:
        raise ValueError(f"featured lesson has incomplete runtime metadata: {lesson.key}")
    return {
        "outcomes": list(lesson.outcomes),
        "prerequisites": list(lesson.prerequisites),
        "estimatedMinutes": lesson.estimatedMinutes,
    }


def insertMissingMetadata(path: Path, missing: dict[str, Any]) -> None:
    text = path.read_text(encoding="utf-8")
    newline = "\r\n" if "\r\n" in text else "\n"
    lines = text.splitlines()
    if not lines or lines[0].strip() != "meta:":
        raise ValueError(f"curriculum source must start with meta: {path.relative_to(ROOT)}")
    metaEnd = next((index for index, line in enumerate(lines[1:], start=1) if line and not line.startswith(" ")), len(lines))
    insertionIndex = next(
        (index for index in range(1, metaEnd) if lines[index].startswith("  tags:")),
        metaEnd,
    )
    generated: list[str] = []
    for key in METADATA_KEYS:
        if key not in missing:
            continue
        value = missing[key]
        encoded = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
        generated.append(f"  {key}: {encoded}")
    lines[insertionIndex:insertionIndex] = generated
    suffix = newline if text.endswith(("\n", "\r\n")) else ""
    path.write_text(newline.join(lines) + suffix, encoding="utf-8")


def evaluate(write: bool) -> tuple[list[str], dict[str, int]]:
    failures: list[str] = []
    selected = featuredLessons()
    currentCount = 0
    updatedCount = 0
    for lessonRef, (path, lesson) in sorted(selected.items()):
        payload = loadYaml(path)
        meta = payload.get("meta")
        if not isinstance(meta, dict):
            failures.append(f"meta is absent: {lessonRef}")
            continue
        expected = expectedMetadata(lesson)
        missing: dict[str, Any] = {}
        for key, expectedValue in expected.items():
            if key not in meta:
                missing[key] = expectedValue
            elif meta.get(key) != expectedValue:
                failures.append(f"existing {key} differs from runtime graph: {lessonRef}")
        if missing and write and not any(failure.endswith(lessonRef) for failure in failures):
            insertMissingMetadata(path, missing)
            updatedCount += 1
        elif missing:
            failures.append(f"explicit metadata is missing: {lessonRef} ({', '.join(missing)})")
        else:
            currentCount += 1
    return failures, {
        "featuredPathCount": len(FEATURED_PATH_IDS),
        "featuredLessonCount": len(selected),
        "currentLessonCount": currentCount + updatedCount,
        "updatedLessonCount": updatedCount,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="verify or write featured learning path source metadata")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--write", action="store_true")
    args = parser.parse_args()
    try:
        failures, summary = evaluate(write=args.write)
    except (OSError, ValueError, yaml.YAMLError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    modeName = "updated" if args.write else "current"
    print(f"ok: featured learning metadata {modeName}: {summary}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
