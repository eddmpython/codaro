"""Sanity-check curriculum YAML check evaluations end-to-end.

For every section that defines `check.type`, this tool runs the actual checker:

  1. Drive the section's solution code as the student → expect pass.
  2. If solution != starterCode, drive the starterCode as the student → expect fail.
     (Skipped when starterCode == solution; that lesson has no fill-in-the-blank.)

Authors can run this without launching the UI to confirm a new `check` actually
fires. Exits non-zero if any expected case diverges.

Usage:
    uv run python -X utf8 docs/skills/ops/tools/validateLessonChecks.py [PATH ...]
    uv run python -X utf8 docs/skills/ops/tools/validateLessonChecks.py <file> --section step1_load
    uv run python -X utf8 docs/skills/ops/tools/validateLessonChecks.py <dir> --dry-run

PATH may be a YAML file or a directory; without arguments scans curricula/python.

Flags:
    --section <id>   Only evaluate the section with this id (per file).
    --dry-run        List sections + current check.type without invoking kernel.
    --timeout <sec>  Per-file kernel timeout (default 120).
"""
from __future__ import annotations

import argparse
import asyncio
import os
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

# Avoid OpenBLAS multi-thread memory failures inside kernel subprocesses on
# Windows. The kernel worker imports numpy/pandas under stricter memory limits
# than the parent. Setting these BEFORE any import keeps OpenBLAS to a single
# thread and prevents the "Memory allocation still failed" crash.
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
# Use non-interactive backend so matplotlib doesn't try to open a window in
# the kernel subprocess.
os.environ.setdefault("MPLBACKEND", "Agg")

import yaml  # noqa: E402

# Ensure src/ is on sys.path when run as a standalone script.
ROOT = Path(__file__).resolve().parents[4]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from codaro.curriculum.exerciseCheck import (  # noqa: E402
    InvalidExerciseCheck,
    exerciseCheckInputFromConfig,
    runExerciseCheck,
)
from codaro.curriculum.sectionContract import lessonContractFromYaml  # noqa: E402
from codaro.kernel.session import KernelSession  # noqa: E402

CURRICULA_ROOT = ROOT / "curricula" / "python"


@dataclass
class SectionFinding:
    file: Path
    sectionId: str
    sectionTitle: str
    status: str  # "ok", "fail", "skip", "error"
    message: str


def _normalizeCode(code: str) -> str:
    return code.strip()


async def _evaluateSection(
    session: KernelSession,
    file: Path,
    section,
) -> list[SectionFinding]:
    findings: list[SectionFinding] = []
    exercise = section.exercise
    checkConfig = exercise.check or section.check or {}
    starterCode = _normalizeCode(exercise.starterCode)
    solutionCode = _normalizeCode(exercise.solution)

    # Prewarm: execute the section's solution as its OWN block. Prior sections'
    # variables stay in `session` registry across sections (each section uses
    # unique `_warm_{id}` blockId), so this section can see them.
    if solutionCode:
        prewarmResult = await session.execute(solutionCode, blockId=f"_warm_{section.id}")
        if prewarmResult.status == "error":
            preview = repr(prewarmResult.data)[:800]
            print(
                f"  [warn] prewarm 실패 {section.id}: {preview}",
                file=sys.stderr,
            )

    if not isinstance(checkConfig, dict) or not checkConfig.get("type"):
        return findings  # No evaluation requested, skip silently.

    if not solutionCode:
        findings.append(SectionFinding(
            file=file,
            sectionId=section.id,
            sectionTitle=section.title,
            status="error",
            message="check.type 지정되었으나 exercise.solution 코드가 비어 있어 검증할 수 없습니다.",
        ))
        return findings

    # Apply same solution → expectedCode fallback as converter.
    if checkConfig.get("type") == "output" and not checkConfig.get("expectedCode"):
        if solutionCode != starterCode:
            checkConfig = {**checkConfig, "expectedCode": solutionCode}

    # Pass 1: solution as student → must pass.
    try:
        passRequest = exerciseCheckInputFromConfig(studentCode=solutionCode, checkConfig=checkConfig)
        result = await runExerciseCheck(session, passRequest)
    except InvalidExerciseCheck as exc:
        findings.append(SectionFinding(
            file=file,
            sectionId=section.id,
            sectionTitle=section.title,
            status="error",
            message=f"check 구조 무효: {exc}",
        ))
        return findings
    if not result.passed:
        findings.append(SectionFinding(
            file=file,
            sectionId=section.id,
            sectionTitle=section.title,
            status="fail",
            message=f"solution을 student로 던졌는데 통과 못 함: {result.feedback}",
        ))
    else:
        findings.append(SectionFinding(
            file=file,
            sectionId=section.id,
            sectionTitle=section.title,
            status="ok",
            message="solution → pass",
        ))

    # Pass 2: starterCode as student → must fail when starter differs from solution
    # (i.e. there's a blank for the student to fill). When starter == solution,
    # the section has no genuine challenge so we skip this check.
    if starterCode and starterCode != solutionCode:
        failRequest = exerciseCheckInputFromConfig(studentCode=starterCode, checkConfig=checkConfig)
        try:
            failResult = await runExerciseCheck(session, failRequest)
        except InvalidExerciseCheck as exc:
            findings.append(SectionFinding(
                file=file,
                sectionId=section.id,
                sectionTitle=section.title,
                status="error",
                message=f"starterCode check 무효: {exc}",
            ))
            return findings
        if failResult.passed:
            findings.append(SectionFinding(
                file=file,
                sectionId=section.id,
                sectionTitle=section.title,
                status="fail",
                message="starterCode가 그대로인데 통과해 버림 — check가 너무 느슨하거나 빈칸이 의미 없음.",
            ))
        else:
            findings.append(SectionFinding(
                file=file,
                sectionId=section.id,
                sectionTitle=section.title,
                status="ok",
                message="starterCode → fail (정상)",
            ))

    return findings


async def _processFile(
    file: Path,
    *,
    sectionFilter: str | None = None,
    timeoutSeconds: float = 120.0,
) -> list[SectionFinding]:
    try:
        rawContent = yaml.safe_load(file.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:
        return [SectionFinding(
            file=file,
            sectionId="(file)",
            sectionTitle="",
            status="error",
            message=f"YAML 파싱 실패: {exc}",
        )]
    if not isinstance(rawContent, dict):
        return [SectionFinding(
            file=file,
            sectionId="(file)",
            sectionTitle="",
            status="skip",
            message="YAML 문서가 dict가 아닙니다.",
        )]

    lesson = lessonContractFromYaml(rawContent, fallbackTitle=file.stem)
    if not lesson.sections:
        return []

    sections = lesson.sections
    if sectionFilter:
        sections = [s for s in sections if s.id == sectionFilter]
        if not sections:
            return [SectionFinding(
                file=file,
                sectionId=sectionFilter,
                sectionTitle="",
                status="skip",
                message=f"--section {sectionFilter}: 해당 id 섹션 없음.",
            )]

    async def _runAll() -> list[SectionFinding]:
        # Use a temp directory as cwd so file-I/O lessons (open, pathlib, etc.)
        # don't pollute the repo and don't depend on a specific layout.
        import tempfile
        with tempfile.TemporaryDirectory(prefix="codaro_lesson_") as tmpdir:
            session = KernelSession(workingDirectory=tmpdir)
            try:
                results: list[SectionFinding] = []
                for section in sections:
                    sectionFindings = await _evaluateSection(session, file, section)
                    results.extend(sectionFindings)
                return results
            finally:
                session.dispose()

    try:
        return await asyncio.wait_for(_runAll(), timeout=timeoutSeconds)
    except asyncio.TimeoutError:
        return [SectionFinding(
            file=file,
            sectionId="(file)",
            sectionTitle="",
            status="error",
            message=f"kernel timeout {timeoutSeconds:.0f}s 초과 — 강의 평가 중단.",
        )]


def _dryRunFile(file: Path) -> list[SectionFinding]:
    try:
        rawContent = yaml.safe_load(file.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:
        return [SectionFinding(
            file=file,
            sectionId="(file)",
            sectionTitle="",
            status="error",
            message=f"YAML 파싱 실패: {exc}",
        )]
    if not isinstance(rawContent, dict):
        return []
    lesson = lessonContractFromYaml(rawContent, fallbackTitle=file.stem)
    findings: list[SectionFinding] = []
    for section in lesson.sections:
        exercise = section.exercise
        checkConfig = exercise.check or section.check or {}
        if not isinstance(checkConfig, dict):
            continue
        currentType = checkConfig.get("type")
        starter = _normalizeCode(exercise.starterCode)
        solution = _normalizeCode(exercise.solution)
        hasBlank = bool(starter and starter != solution)
        if currentType:
            note = f"활성: type={currentType}"
        elif solution:
            blankMark = " · 빈칸있음" if hasBlank else ""
            note = f"후보 (solution 존재{blankMark})"
        else:
            note = "skip — solution 없음"
        findings.append(SectionFinding(
            file=file,
            sectionId=section.id,
            sectionTitle=section.title,
            status="ok" if currentType else "skip",
            message=note,
        ))
    return findings


def _collectFiles(paths: Iterable[Path]) -> list[Path]:
    result: list[Path] = []
    for path in paths:
        if path.is_file():
            if path.suffix == ".yaml" and path.name != "schema.yaml":
                result.append(path)
        elif path.is_dir():
            result.extend(
                sorted(p for p in path.rglob("*.yaml") if p.name != "schema.yaml")
            )
    return result


async def _main(
    targets: list[Path],
    *,
    sectionFilter: str | None,
    timeoutSeconds: float,
    dryRun: bool,
) -> int:
    files = _collectFiles(targets)
    if not files:
        print("처리할 YAML 파일이 없습니다.", file=sys.stderr)
        return 1

    okCount = 0
    failCount = 0
    errorCount = 0
    skipped = 0
    evaluated = 0
    total = len(files)

    for index, file in enumerate(files, start=1):
        rel = file.relative_to(ROOT).as_posix() if file.is_absolute() else file.as_posix()
        prefix = f"[{index}/{total}]"
        print(f"{prefix} {rel}", file=sys.stderr, flush=True)
        if dryRun:
            findings = _dryRunFile(file)
        else:
            findings = await _processFile(
                file,
                sectionFilter=sectionFilter,
                timeoutSeconds=timeoutSeconds,
            )
        if not findings:
            skipped += 1
            continue
        for finding in findings:
            evaluated += 1
            tag = {"ok": "OK", "fail": "FAIL", "skip": "SKIP", "error": "ERROR"}[finding.status]
            findingRel = finding.file.relative_to(ROOT).as_posix() if finding.file.is_absolute() else finding.file.as_posix()
            print(f"[{tag}] {findingRel} :: {finding.sectionId} — {finding.message}")
            if finding.status == "ok":
                okCount += 1
            elif finding.status == "fail":
                failCount += 1
            elif finding.status == "error":
                errorCount += 1

    print()
    mode = "dry-run" if dryRun else "평가"
    sectionSummary = (
        f"check 정의 섹션 {evaluated // 2 if evaluated else 0}개 ·"
        if not dryRun else f"섹션 {evaluated}개 보고 ·"
    )
    print(
        f"[{mode}] 검사 파일 {len(files)}개 · {sectionSummary} "
        f"ok {okCount} · fail {failCount} · error {errorCount} · 평가 없는 파일 {skipped}개"
    )

    return 0 if (failCount == 0 and errorCount == 0) else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "paths",
        nargs="*",
        type=Path,
        help="YAML 파일 또는 디렉토리. 비우면 curricula/python 전체를 검사.",
    )
    parser.add_argument(
        "--section",
        default=None,
        help="이 id를 가진 섹션만 평가 (파일 단위 필터).",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=120.0,
        help="강의 1개의 kernel 평가 timeout (초). 기본 120.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="kernel 실행 없이 활성화된/후보 섹션 목록만 출력.",
    )
    args = parser.parse_args()
    targets = args.paths or [CURRICULA_ROOT]
    return asyncio.run(_main(
        targets,
        sectionFilter=args.section,
        timeoutSeconds=args.timeout,
        dryRun=args.dry_run,
    ))


if __name__ == "__main__":
    raise SystemExit(main())
