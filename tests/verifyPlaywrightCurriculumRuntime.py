from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
import json
import os
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
CURRICULUM_DIR = ROOT / "curricula" / "python" / "automation" / "browser" / "playwright"
REPORT_PATH = ROOT / "output" / "test-runner" / "playwright-curriculum-runtime" / "playwright-curriculum-runtime-report.json"
WORK_ROOT = ROOT / "output" / "test-runner" / "playwright-curriculum-runtime"
SAMPLE_DIR = WORK_ROOT / "scratch" / "samples"
BROWSER_DIR = WORK_ROOT / "scratch" / "browsers"
ARTIFACT_DIR = WORK_ROOT / "scratch" / "artifacts"
EXPECTED_LESSON_COUNT = 11
SAMPLE_TIMEOUT_SECONDS = 120


@dataclass(frozen=True)
class Sample:
    path: Path
    lessonId: str
    sectionId: str
    kind: str
    code: str


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    BROWSER_DIR.mkdir(parents=True, exist_ok=True)
    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

    failures: list[dict[str, str]] = []
    lessons: list[dict[str, Any]] = []
    samples: list[Sample] = []

    for path in sorted(CURRICULUM_DIR.glob("*.yaml")):
        lesson, lessonSamples, lessonFailures = evaluateLesson(path)
        lessons.append(lesson)
        samples.extend(lessonSamples)
        failures.extend(lessonFailures)

    if len(lessons) != EXPECTED_LESSON_COUNT:
        failures.append({
            "path": displayPath(CURRICULUM_DIR),
            "kind": "lesson-count",
            "detail": f"expected {EXPECTED_LESSON_COUNT} Playwright lessons, found {len(lessons)}",
        })

    env = sampleEnvironment()
    browserReady, browserDetail = ensurePlaywrightReady(env)
    if not browserReady:
        failures.append({
            "path": "playwright",
            "kind": "browser-ready",
            "detail": browserDetail,
        })
        sampleResults: list[dict[str, Any]] = []
    else:
        sampleResults = [runSample(sample, env) for sample in samples]
        failures.extend(
            {
                "path": result["path"],
                "kind": result["kind"],
                "detail": result["detail"],
            }
            for result in sampleResults
            if not result["passed"]
        )

    payload = {
        "gate": "playwright-curriculum-runtime",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "reportPath": displayPath(REPORT_PATH),
        "browserReady": browserReady,
        "browserDetail": browserDetail,
        "lessonCount": len(lessons),
        "sampleCount": len(samples),
        "samplePassedCount": sum(1 for result in sampleResults if result["passed"]),
        "failureCount": len(failures),
        "lessons": lessons,
        "sampleResults": sampleResults,
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: Playwright curriculum runtime samples failed", file=sys.stderr)
        return 1
    print(f"ok: Playwright curriculum runtime verified {len(samples)} samples")
    return 0


def evaluateLesson(path: Path) -> tuple[dict[str, Any], list[Sample], list[dict[str, str]]]:
    relPath = displayPath(path)
    failures: list[dict[str, str]] = []
    try:
        text = path.read_text(encoding="utf-8")
        content = yaml.safe_load(text) or {}
    except (OSError, UnicodeDecodeError, yaml.YAMLError) as exc:
        return (
            {"path": relPath, "loaded": False, "failure": f"{type(exc).__name__}: {exc}"},
            [],
            [{"path": relPath, "kind": "yaml-load", "detail": f"{type(exc).__name__}: {exc}"}],
        )

    if not isinstance(content, dict):
        return (
            {"path": relPath, "loaded": False, "failure": "top-level YAML is not a mapping"},
            [],
            [{"path": relPath, "kind": "yaml-shape", "detail": "top-level YAML is not a mapping"}],
        )

    meta = content.get("meta") if isinstance(content.get("meta"), dict) else {}
    tags = meta.get("tags") if isinstance(meta.get("tags"), list) else content.get("tags")
    packages = uniqueTextList(meta.get("packages"))
    contract = lessonContractFromYaml(content, fallbackTitle=path.stem)
    contractGaps = [
        {"section": section.title or section.id, "missingFields": section.contractGaps}
        for section in contract.sections
        if section.contractGaps
    ]

    if not textValue(meta.get("id")):
        failures.append({"path": relPath, "kind": "meta.id", "detail": "meta.id is required"})
    if textValue(meta.get("category")) != "playwright":
        failures.append({"path": relPath, "kind": "meta.category", "detail": "meta.category must be playwright"})
    if not uniqueTextList(tags):
        failures.append({"path": relPath, "kind": "tags", "detail": "meta.tags or tags must not be empty"})
    if "playwright" not in packages:
        failures.append({"path": relPath, "kind": "packages", "detail": "meta.packages must include playwright"})
    if re.search(r"\bpip\s+install\b", text, re.I):
        failures.append({"path": relPath, "kind": "pip-install-copy", "detail": "curriculum must not instruct pip install"})
    if contractGaps:
        failures.append({"path": relPath, "kind": "contract-gaps", "detail": json.dumps(contractGaps, ensure_ascii=False)})

    conversionFailure = ""
    solutionCount = 0
    runtimePackages: list[str] = []
    try:
        document, solutions = yamlToDocument(content, "playwright", path.stem)
        solutionCount = len(solutions)
        runtimePackages = list(document.runtime.packages)
    except (TypeError, ValueError, KeyError, AttributeError) as exc:
        conversionFailure = f"{type(exc).__name__}: {exc}"
        failures.append({"path": relPath, "kind": "yamlToDocument", "detail": conversionFailure})

    samples = list(extractSamples(path, content))
    if not samples:
        failures.append({"path": relPath, "kind": "sample-count", "detail": "lesson has no executable snippet or solution samples"})

    lesson = {
        "path": relPath,
        "id": textValue(meta.get("id")),
        "title": textValue(meta.get("title")) or path.stem,
        "sectionCount": len(contract.sections),
        "contractGapCount": sum(len(item["missingFields"]) for item in contractGaps),
        "sampleCount": len(samples),
        "solutionCount": solutionCount,
        "packages": packages,
        "runtimePackages": runtimePackages,
        "conversionFailure": conversionFailure,
    }
    return lesson, samples, failures


def extractSamples(path: Path, content: dict[str, Any]):
    meta = content.get("meta") if isinstance(content.get("meta"), dict) else {}
    lessonId = textValue(meta.get("id")) or path.stem
    sections = content.get("sections") if isinstance(content.get("sections"), list) else []
    for index, sectionValue in enumerate(sections, start=1):
        if not isinstance(sectionValue, dict):
            continue
        sectionId = textValue(sectionValue.get("id")) or f"section-{index}"
        snippet = textValue(sectionValue.get("snippet"))
        if snippet:
            yield Sample(path=path, lessonId=lessonId, sectionId=sectionId, kind="snippet", code=snippet)
        exercise = sectionValue.get("exercise")
        if isinstance(exercise, dict):
            solution = textValue(exercise.get("solution"))
            if solution:
                yield Sample(path=path, lessonId=lessonId, sectionId=sectionId, kind="solution", code=solution)


def sampleEnvironment() -> dict[str, str]:
    env = os.environ.copy()
    env["PYTHONUTF8"] = "1"
    env["CODARO_PLAYWRIGHT_OUTPUT_DIR"] = str(ARTIFACT_DIR)
    env["PLAYWRIGHT_BROWSERS_PATH"] = str(BROWSER_DIR)
    pytestOpts = env.get("PYTEST_ADDOPTS", "").strip()
    cacheOpt = "-p no:cacheprovider"
    env["PYTEST_ADDOPTS"] = f"{pytestOpts} {cacheOpt}".strip() if cacheOpt not in pytestOpts else pytestOpts
    return env


def ensurePlaywrightReady(env: dict[str, str]) -> tuple[bool, str]:
    os.environ["CODARO_PLAYWRIGHT_OUTPUT_DIR"] = env["CODARO_PLAYWRIGHT_OUTPUT_DIR"]
    os.environ["PLAYWRIGHT_BROWSERS_PATH"] = env["PLAYWRIGHT_BROWSERS_PATH"]
    try:
        from playwright.sync_api import Error as PlaywrightError
        from playwright.sync_api import sync_playwright
    except ImportError as exc:
        return False, f"playwright import failed: {exc}"

    ready, detail = tryLaunchChromium(sync_playwright, PlaywrightError)
    if ready:
        return True, detail

    installResult = subprocess.run(
        [sys.executable, "-m", "playwright", "install", "chromium"],
        cwd=ROOT,
        env=env,
        capture_output=True,
        text=True,
        timeout=300,
    )
    if installResult.returncode != 0:
        return False, trimText(installResult.stdout + installResult.stderr)

    ready, detail = tryLaunchChromium(sync_playwright, PlaywrightError)
    return ready, detail


def tryLaunchChromium(syncPlaywright: Any, playwrightError: type[BaseException]) -> tuple[bool, str]:
    try:
        with syncPlaywright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_content("<title>ready</title>")
            title = page.title()
            browser.close()
    except playwrightError as exc:
        return False, trimText(str(exc))
    if title != "ready":
        return False, f"unexpected browser title: {title}"
    return True, "chromium launch ok"


def runSample(sample: Sample, env: dict[str, str]) -> dict[str, Any]:
    fileName = safeName(f"{sample.lessonId}_{sample.sectionId}_{sample.kind}") + ".py"
    samplePath = SAMPLE_DIR / fileName
    samplePath.write_text(sample.code + "\n", encoding="utf-8")
    relPath = displayPath(sample.path)
    label = f"{sample.sectionId}:{sample.kind}"

    try:
        result = subprocess.run(
            [sys.executable, "-X", "utf8", str(samplePath)],
            cwd=ROOT,
            env=env,
            capture_output=True,
            text=True,
            timeout=SAMPLE_TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired as exc:
        return {
            "path": relPath,
            "sectionId": sample.sectionId,
            "kind": sample.kind,
            "passed": False,
            "samplePath": displayPath(samplePath),
            "detail": f"{label}: timeout after {exc.timeout}s",
            "stdout": trimText(exc.stdout or ""),
            "stderr": trimText(exc.stderr or ""),
        }
    except (OSError, UnicodeDecodeError) as exc:
        return {
            "path": relPath,
            "sectionId": sample.sectionId,
            "kind": sample.kind,
            "passed": False,
            "samplePath": displayPath(samplePath),
            "detail": f"{label}: {type(exc).__name__}: {exc}",
            "stdout": "",
            "stderr": "",
        }

    passed = result.returncode == 0
    return {
        "path": relPath,
        "sectionId": sample.sectionId,
        "kind": sample.kind,
        "passed": passed,
        "returnCode": result.returncode,
        "samplePath": displayPath(samplePath),
        "detail": "passed" if passed else trimText(result.stdout + result.stderr),
        "stdout": trimText(result.stdout),
        "stderr": trimText(result.stderr),
    }


def uniqueTextList(value: Any) -> list[str]:
    if isinstance(value, str | int | float | bool):
        text = str(value).strip()
        return [text] if text else []
    if not isinstance(value, list):
        return []
    result: list[str] = []
    for item in value:
        if isinstance(item, str | int | float | bool):
            text = str(item).strip()
            if text:
                result.append(text)
    return list(dict.fromkeys(result))


def textValue(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, int | float | bool):
        return str(value)
    return ""


def trimText(value: str, limit: int = 2400) -> str:
    text = value.strip()
    if len(text) <= limit:
        return text
    return text[-limit:]


def safeName(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", value).strip("_") or "sample"


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


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def displayPath(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


if __name__ == "__main__":
    raise SystemExit(main())
