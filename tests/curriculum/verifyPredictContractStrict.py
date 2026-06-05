"""Predict strict 게이트 — strict 카테고리에 대한 LearningPredictContract 필수 검증.

`tests/_predictStrictCategories.txt`에 등록된 카테고리는 모든 exercise 보유 step에
`predict.prompt` + 최소 1개 expected 필드(`expectedShape`/`expectedDtype`/`expectedValue`/
`expectedError`)를 가져야 한다. PRD S1.a — Predict→Run→Reconcile→Adapt 루프 1단계가
빈 카드로 죽지 않게 막는 가드.

strict 미등록 카테고리는 경고만 (정보용) — 백필 진행 중 호환성 유지.

Usage:
    uv run python -X utf8 tests/curriculum/verifyPredictContractStrict.py [PATH ...]

PATH 없으면 curricula/python 전체 스캔.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from codaro.curriculum.sectionContract import lessonContractFromYaml  # noqa: E402

CURRICULA_ROOT = ROOT / "curricula" / "python"
STRICT_LIST_PATH = ROOT / "tests" / "_predictStrictCategories.txt"
REPORT_DIR = ROOT / "output" / "test-runner" / "predict-contract-strict"
REPORT_PATH = REPORT_DIR / "predict-contract-strict-report.json"


@dataclass
class StepViolation:
    file: str
    category: str
    sectionId: str
    sectionTitle: str
    reason: str


@dataclass
class CategoryStats:
    category: str
    totalExerciseSteps: int = 0
    stepsWithPredict: int = 0
    violations: list[StepViolation] = field(default_factory=list)

    @property
    def coverage(self) -> float:
        if self.totalExerciseSteps == 0:
            return 1.0
        return self.stepsWithPredict / self.totalExerciseSteps


def loadStrictCategories() -> set[str]:
    if not STRICT_LIST_PATH.exists():
        return set()
    categories: set[str] = set()
    for rawLine in STRICT_LIST_PATH.read_text(encoding="utf-8").splitlines():
        line = rawLine.split("#", 1)[0].strip()
        if line:
            categories.add(line)
    return categories


def predictIsPresent(predict) -> bool:
    if predict is None:
        return False
    if not predict.prompt:
        return False
    expected = (predict.expectedShape, predict.expectedDtype, predict.expectedValue, predict.expectedError)
    return any(field.strip() for field in expected)


def categorizePath(filePath: Path) -> str:
    """카테고리 키 — YAML 파일의 부모 디렉터리 (curricula/python 기준 상대 경로).

    예: `curricula/python/basics/30days/day01_*.yaml` → `basics/30days`.
    """
    try:
        relative = filePath.relative_to(CURRICULA_ROOT)
    except ValueError:
        return ""
    parent = relative.parent
    if str(parent) in ("", "."):
        return ""
    return parent.as_posix()


def scanLesson(filePath: Path) -> tuple[str, list[StepViolation], int, int]:
    try:
        rawContent = yaml.safe_load(filePath.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:
        # YAML 파싱 실패는 다른 게이트가 잡으므로 여기서는 0건으로 보고
        return categorizePath(filePath), [], 0, 0
    if not isinstance(rawContent, dict):
        return categorizePath(filePath), [], 0, 0
    lesson = lessonContractFromYaml(rawContent, fallbackTitle=filePath.stem)
    category = categorizePath(filePath)
    violations: list[StepViolation] = []
    exerciseSteps = 0
    withPredict = 0
    for section in lesson.sections:
        exercise = section.exercise
        # exercise 가 비어있으면 predict 요구 안 함
        if not (exercise.prompt or exercise.starterCode or exercise.solution):
            continue
        exerciseSteps += 1
        if predictIsPresent(exercise.predict):
            withPredict += 1
        else:
            violations.append(StepViolation(
                file=str(filePath.relative_to(ROOT).as_posix()),
                category=category,
                sectionId=section.id,
                sectionTitle=section.title,
                reason="exercise step requires predict.prompt + at least one expected field",
            ))
    return category, violations, exerciseSteps, withPredict


def collectYamlFiles(targets: list[Path]) -> list[Path]:
    files: list[Path] = []
    for path in targets:
        if path.is_file() and path.suffix == ".yaml":
            files.append(path)
        elif path.is_dir():
            files.extend(sorted(p for p in path.rglob("*.yaml") if p.name != "schema.yaml"))
    return files


def writeReport(payload: dict[str, object]) -> None:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def gitHead() -> str | None:
    headFile = ROOT / ".git" / "HEAD"
    if not headFile.exists():
        return None
    raw = headFile.read_text(encoding="utf-8").strip()
    if raw.startswith("ref: "):
        refPath = ROOT / ".git" / raw[5:].strip()
        if refPath.exists():
            return refPath.read_text(encoding="utf-8").strip()
        return None
    return raw or None


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="*", type=Path, help="YAML 파일/디렉토리. 기본은 curricula/python.")
    args = parser.parse_args(argv)
    targets = args.paths or [CURRICULA_ROOT]
    startedAt = time.monotonic()
    startedAtIso = utcTimestamp()

    strictCategories = loadStrictCategories()
    files = collectYamlFiles(targets)

    categoryStats: dict[str, CategoryStats] = {}
    allViolations: list[StepViolation] = []

    for filePath in files:
        category, violations, exerciseSteps, withPredict = scanLesson(filePath)
        if not category:
            continue
        stats = categoryStats.setdefault(category, CategoryStats(category=category))
        stats.totalExerciseSteps += exerciseSteps
        stats.stepsWithPredict += withPredict
        stats.violations.extend(violations)
        allViolations.extend(violations)

    strictFailures: list[StepViolation] = []
    for category in strictCategories:
        stats = categoryStats.get(category)
        if stats is None:
            print(f"[warn] strict 카테고리 '{category}' 에 해당하는 강의가 없습니다.", file=sys.stderr)
            continue
        strictFailures.extend(stats.violations)

    payload: dict[str, object] = {
        "passed": len(strictFailures) == 0,
        "status": "ok" if len(strictFailures) == 0 else "fail",
        "startedAt": startedAtIso,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - startedAt) * 1000),
        "gitHead": gitHead(),
        "strictCategories": sorted(strictCategories),
        "totalFilesScanned": len(files),
        "categoryCoverage": [
            {
                "category": stats.category,
                "totalExerciseSteps": stats.totalExerciseSteps,
                "stepsWithPredict": stats.stepsWithPredict,
                "coverage": round(stats.coverage, 4),
                "strictMode": stats.category in strictCategories,
                "violationCount": len(stats.violations),
            }
            for stats in sorted(categoryStats.values(), key=lambda s: s.category)
        ],
        "strictViolations": [
            {
                "file": v.file,
                "category": v.category,
                "sectionId": v.sectionId,
                "sectionTitle": v.sectionTitle,
                "reason": v.reason,
            }
            for v in strictFailures
        ],
        "warningViolationCount": sum(1 for v in allViolations if v.category not in strictCategories),
    }
    writeReport(payload)

    if strictFailures:
        print(f"FAIL: predict-contract-strict — {len(strictFailures)}건 위반 (strict 카테고리: {sorted(strictCategories)})", file=sys.stderr)
        for v in strictFailures[:20]:
            print(f"  - [{v.category}] {v.file} :: {v.sectionId} — {v.reason}", file=sys.stderr)
        if len(strictFailures) > 20:
            print(f"  (+{len(strictFailures) - 20} more, see {REPORT_PATH.relative_to(ROOT).as_posix()})", file=sys.stderr)
        return 1

    print(
        f"ok: predict-contract-strict — strict {len(strictCategories)} category · "
        f"{len(files)} files scanned · {sum(s.totalExerciseSteps for s in categoryStats.values())} exercise steps"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
