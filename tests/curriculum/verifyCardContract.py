"""학습 카드 블록 계약 게이트.

전 커리큘럼 YAML의 `sections[].blocks[]`(중첩 포함)를 walk하며, 각 블록의 `type`이
카드 계약 레지스트리(`codaro.curriculum.cardContract.CARD_REGISTRY`)에 있고 필수키를
갖췄는지 검사한다. type 오타가 조용히 prose로 fallback되는 사고(예: localRunner 드리프트)와
필수키 누락을 머신 게이트로 차단한다.

SSOT = `src/codaro/curriculum/cardContract.py`. 문서 미러 =
`docs/skills/architecture/curriculum-card-contract.md`.
"""

from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys
import time

import yaml

ROOT = Path(__file__).resolve().parents[2]
CURRICULA_ROOT = ROOT / "curricula" / "python"
REPORT_PATH = ROOT / "output" / "test-runner" / "card-contract" / "card-contract-report.json"

sys.path.insert(0, str(ROOT / "src"))
from codaro.curriculum.cardContract import iterCardBlocks, validateCardBlock  # noqa: E402


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[dict[str, str]] = []
    checked = 0
    blockCount = 0
    for path in curriculumYamlPaths():
        checked += 1
        blockCount += inspectCurriculum(path, failures)

    payload = {
        "gate": "card-contract",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "reportPath": "output/test-runner/card-contract/card-contract-report.json",
        "checkedFiles": checked,
        "checkedBlocks": blockCount,
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

    print(f"ok: card contract verified ({checked} YAML files, {blockCount} blocks)")
    return 0


def curriculumYamlPaths() -> list[Path]:
    return sorted(
        path
        for path in CURRICULA_ROOT.glob("**/*.yaml")
        if path.name != "schema.yaml"
    )


def inspectCurriculum(path: Path, failures: list[dict[str, str]]) -> int:
    try:
        data = yaml.safe_load(path.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:
        addFailure(path, failures, f"invalid YAML: {exc}")
        return 0
    if not isinstance(data, dict):
        return 0
    count = 0
    for block, blockPath in iterCardBlocks(data.get("sections")):
        count += 1
        for message in validateCardBlock(block, location=blockPath):
            addFailure(path, failures, message)
    return count


def addFailure(path: Path, failures: list[dict[str, str]], message: str) -> None:
    failures.append({"path": path.relative_to(ROOT).as_posix(), "message": message})


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat()


def currentGitHead() -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
    except (OSError, subprocess.SubprocessError):
        return ""
    return result.stdout.strip()


if __name__ == "__main__":
    raise SystemExit(main())
