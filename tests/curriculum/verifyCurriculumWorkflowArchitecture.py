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


ROOT = Path(__file__).resolve().parents[2]
CURRICULA_ROOT = ROOT / "curricula" / "python"
REPORT_PATH = ROOT / "output" / "test-runner" / "curriculum-workflow-architecture" / "curriculum-workflow-architecture-report.json"

GENERIC_LABELS = {
    "목표",
    "준비",
    "개념",
    "스니펫",
    "실습",
    "실행",
    "검증",
    "완료",
    "패키지",
    "첫실행",
    "환경",
}
GENERIC_PHRASES = (
    "무슨 공부",
    "설명과 팁",
    "따라 칠 코드",
    "입력과 검증",
    "YAML SSOT",
    "uv 준비",
    "assert와 결과 비교",
    "예제를 실행한 뒤 값 하나",
    "기준 실행 후 값 하나",
    "출력 또는 assert 확인",
    "오류 없이 실행",
)


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[dict[str, str]] = []
    checked = 0
    for path in curriculumYamlPaths():
        checked += 1
        inspectCurriculum(path, failures)

    payload = {
        "gate": "curriculum-workflow-architecture",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "reportPath": "output/test-runner/curriculum-workflow-architecture/curriculum-workflow-architecture-report.json",
        "checked": checked,
        "failureCount": len(failures),
        "failures": failures[:200],
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    if failures:
        for failure in failures[:50]:
            print(f"FAIL: {failure['path']}: {failure['message']}", file=sys.stderr)
        if len(failures) > 50:
            print(f"FAIL: ... and {len(failures) - 50} more", file=sys.stderr)
        return 1

    print(f"ok: curriculum workflow architecture verified ({checked} YAML files)")
    return 0


def curriculumYamlPaths() -> list[Path]:
    return sorted(
        path
        for path in CURRICULA_ROOT.glob("**/*.yaml")
        if path.name != "schema.yaml"
    )


def inspectCurriculum(path: Path, failures: list[dict[str, str]]) -> None:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:
        addFailure(path, failures, f"invalid YAML: {exc}")
        return

    if not isinstance(data, dict):
        addFailure(path, failures, "top-level YAML is not a mapping")
        return

    intro = data.get("intro")
    if not isinstance(intro, dict):
        addFailure(path, failures, "intro mapping is missing")
        return

    diagram = intro.get("diagram")
    if not isinstance(diagram, dict):
        addFailure(path, failures, "intro.diagram mapping is missing")
        return

    steps = diagram.get("steps")
    if not isinstance(steps, list) or len(steps) < 3:
        addFailure(path, failures, "intro.diagram.steps must contain at least three concrete workflow steps")
    else:
        for index, step in enumerate(steps):
            inspectWorkflowStep(path, failures, index, step)

    runtime = diagram.get("runtime")
    if not isinstance(runtime, list) or len(runtime) < 2:
        addFailure(path, failures, "intro.diagram.runtime must describe the local execution layer")

    inspectSections(path, failures, data.get("sections"))


def inspectWorkflowStep(path: Path, failures: list[dict[str, str]], index: int, step: Any) -> None:
    if not isinstance(step, dict):
        addFailure(path, failures, f"workflow step {index + 1} is not a mapping")
        return
    label = cleanText(step.get("label"))
    detail = cleanText(step.get("detail"))
    compactLabel = re.sub(r"\s+", "", label)
    combined = f"{label} {detail}"
    if not label or compactLabel in GENERIC_LABELS:
        addFailure(path, failures, f"workflow step {index + 1} has a generic label: {label!r}")
    if len(combined) < 12:
        addFailure(path, failures, f"workflow step {index + 1} is too vague")
    for phrase in GENERIC_PHRASES:
        if phrase in combined:
            addFailure(path, failures, f"workflow step {index + 1} contains generic phrase: {phrase}")


def inspectSections(path: Path, failures: list[dict[str, str]], sections: Any) -> None:
    if not isinstance(sections, list):
        return
    for section in sections:
        if not isinstance(section, dict):
            continue
        fields = [
            ("goal", section.get("goal")),
            ("why", section.get("why")),
        ]
        exercise = section.get("exercise")
        if isinstance(exercise, dict):
            fields.append(("exercise.prompt", exercise.get("prompt")))
            hints = exercise.get("hints")
            if isinstance(hints, list):
                fields.extend((f"exercise.hints[{index}]", hint) for index, hint in enumerate(hints))
        check = section.get("check")
        if isinstance(check, dict):
            fields.extend([
                ("check.noError", check.get("noError")),
                ("check.resultCheck", check.get("resultCheck")),
            ])

        for field, value in fields:
            text = cleanText(value)
            for phrase in GENERIC_PHRASES:
                if phrase in text:
                    addFailure(path, failures, f"{field} contains generic phrase: {phrase}")


def cleanText(value: Any) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


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


def addFailure(path: Path, failures: list[dict[str, str]], message: str) -> None:
    failures.append({
        "path": path.relative_to(ROOT).as_posix(),
        "message": message,
    })


if __name__ == "__main__":
    raise SystemExit(main())
