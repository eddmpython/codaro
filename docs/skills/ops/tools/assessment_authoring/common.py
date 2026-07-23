from __future__ import annotations

import base64
import copy
import hashlib
import json
import os
from pathlib import Path
import tempfile
from typing import Any, TypedDict

import yaml


ROOT = Path(__file__).resolve().parents[5]
EMPTY_FIXTURE = {
    "directories": ["input", "output"],
    "env": {"LANG": "C.UTF-8", "TZ": "UTC"},
    "files": [],
    "stdin": [],
}


class LiteralString(str):
    pass


class ExpectedException(str):
    pass


class TaskBlueprint(TypedDict):
    slug: str
    title: str
    goal: str
    prompt: str
    starter: str
    solution: str
    entry: str
    cases: list[tuple[str, list[Any], Any]]
    hints: list[str]
    expectedPaths: list[dict[str, Any]]
    normalizeReturnPaths: list[str]


def _literalStringRepresenter(dumper: yaml.SafeDumper, value: LiteralString):
    return dumper.represent_scalar("tag:yaml.org,2002:str", str(value), style="|")


yaml.SafeDumper.add_representer(LiteralString, _literalStringRepresenter)


def task(
    slug: str,
    title: str,
    goal: str,
    prompt: str,
    starter: str,
    solution: str,
    entry: str,
    cases: list[tuple[str, list[Any], Any]],
    hints: list[str],
    *,
    expectedPaths: list[dict[str, Any]] | None = None,
    normalizeReturnPaths: list[str] | None = None,
) -> TaskBlueprint:
    return {
        "slug": slug,
        "title": title,
        "goal": goal,
        "prompt": prompt,
        "starter": starter,
        "solution": solution,
        "entry": entry,
        "cases": cases,
        "hints": hints,
        "expectedPaths": copy.deepcopy(expectedPaths or []),
        "normalizeReturnPaths": list(normalizeReturnPaths or []),
    }


def raises(name: str) -> ExpectedException:
    return ExpectedException(name)


def stableJson(value: Any) -> str:
    if isinstance(value, list):
        return "[" + ",".join(stableJson(item) for item in value) + "]"
    if isinstance(value, dict):
        return "{" + ",".join(
            f"{json.dumps(key, ensure_ascii=False)}:{stableJson(value[key])}"
            for key in sorted(value)
        ) + "}"
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def fixtureHash(value: dict[str, Any] = EMPTY_FIXTURE) -> str:
    digest = hashlib.sha256(stableJson(value).encode("utf-8")).digest()
    return "sha256-" + base64.b64encode(digest).decode("ascii")


def checkSpec(namespace: str, lessonId: str, mode: str, blueprint: TaskBlueprint) -> dict[str, Any]:
    checkId = f"python.{namespace}.{lessonId}.{blueprint['slug']}.{mode}.behavior.v1"
    cases: list[dict[str, Any]] = []
    for caseId, arguments, expected in blueprint["cases"]:
        case: dict[str, Any] = {
            "id": caseId,
            "arguments": [{"value": copy.deepcopy(value)} for value in arguments],
        }
        if isinstance(expected, ExpectedException):
            case["expectedException"] = str(expected)
        else:
            case["expectedReturn"] = copy.deepcopy(expected)
        cases.append(case)
    return {
        "id": checkId,
        "version": 1,
        "kind": "behavior",
        "strength": "strong",
        "executor": "browser-worker",
        "timeoutMs": 8000,
        "fixtureId": f"{checkId}.fixture",
        "fixtureHash": fixtureHash(),
        "fixture": copy.deepcopy(EMPTY_FIXTURE),
        "packageAssets": [],
        "payload": {
            "entry": blueprint["entry"],
            "cases": cases,
            "expectedPaths": copy.deepcopy(blueprint["expectedPaths"]),
            "normalizeReturnPaths": list(blueprint["normalizeReturnPaths"]),
        },
    }


def assessmentVariant(
    namespace: str,
    lessonId: str,
    mode: str,
    blueprint: TaskBlueprint,
    sourceIds: list[str],
) -> dict[str, Any]:
    variantId = f"{lessonId}-{blueprint['slug']}-{mode}"
    rationale = {
        "mastery": (
            "worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.",
            "브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.",
        ),
        "transfer": (
            "같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.",
            "숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.",
        ),
        "retrieval": (
            "시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.",
            "전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.",
        ),
    }
    why, explanation = rationale[mode]
    variant: dict[str, Any] = {
        "id": variantId,
        "mode": mode,
        "unseen": True,
        "claimScope": "portable-concept",
        "reviewStatus": "machine-verified-pending-independent-review",
        "sourceSectionIds": sourceIds,
        "title": blueprint["title"],
        "subtitle": {
            "mastery": "새 입력으로 핵심 분석 재현",
            "transfer": "다른 업무 문맥으로 판단 전이",
            "retrieval": "7일 뒤 기준을 기억에서 복원",
        }[mode],
        "goal": blueprint["goal"],
        "why": why,
        "explanation": explanation,
        "tips": blueprint["hints"],
        "exercise": {
            "prompt": blueprint["prompt"],
            "starterCode": LiteralString(blueprint["starter"]),
            "solution": LiteralString(blueprint["solution"]),
            "hints": blueprint["hints"],
        },
        "check": checkSpec(namespace, lessonId, mode, blueprint),
    }
    if mode == "retrieval":
        variant["minimumDelayHours"] = 7 * 24
    return variant


def assessmentFor(
    path: Path,
    namespace: str,
    blueprints: dict[str, TaskBlueprint],
) -> dict[str, Any]:
    content = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    lessonId = str(content.get("meta", {}).get("id") or path.stem.split("_", 1)[0])
    sectionIds = [
        str(section.get("id"))
        for section in content.get("sections", [])
        if isinstance(section, dict) and section.get("id")
    ]
    sourceIds = ([sectionIds[0], sectionIds[-1]] if len(sectionIds) > 1 else sectionIds) or [lessonId]
    masteryId = f"{lessonId}-{blueprints['mastery']['slug']}-mastery"
    transferId = f"{lessonId}-{blueprints['transfer']['slug']}-transfer"
    return {
        "schemaVersion": 1,
        "performanceClaim": "웹에서는 외부 패키지 없이 분석 판단과 데이터 계약을 검증하고, 실제 패키지 API와 산출물은 lesson Run 및 Local 실습 증거로 분리합니다.",
        "tierParity": {
            "web": "portable-concept",
            "local": "package-practice-and-artifact",
        },
        "supportPolicy": "첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.",
        "authoring": {
            "source": "curated-blueprint",
            "solutionVerification": "required",
            "independentReview": "pending",
        },
        "masteryVariants": [assessmentVariant(namespace, lessonId, "mastery", blueprints["mastery"], sourceIds)],
        "transferVariants": [assessmentVariant(namespace, lessonId, "transfer", blueprints["transfer"], [masteryId])],
        "retrievalVariants": [assessmentVariant(namespace, lessonId, "retrieval", blueprints["retrieval"], [transferId])],
    }


def validateBlueprints(namespace: str, blueprints: dict[str, dict[str, TaskBlueprint]]) -> None:
    if fixtureHash() != "sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=":
        raise RuntimeError("fixture hash no longer matches the browser stable JSON contract")
    checkIds: set[str] = set()
    fingerprints: set[str] = set()
    for lessonId, modes in blueprints.items():
        if set(modes) != {"mastery", "transfer", "retrieval"}:
            raise RuntimeError(f"{lessonId}: all three assessment modes are required")
        for mode, blueprint in modes.items():
            compile(blueprint["starter"], f"<{namespace}-{lessonId}-{mode}-starter>", "exec")
            compile(blueprint["solution"], f"<{namespace}-{lessonId}-{mode}-solution>", "exec")
            if blueprint["starter"].strip() == blueprint["solution"].strip():
                raise RuntimeError(f"{lessonId} {mode}: starter exposes the solution")
            if len(blueprint["cases"]) < 2:
                raise RuntimeError(f"{lessonId} {mode}: at least two hidden cases are required")
            fingerprint = hashlib.sha256(
                stableJson({
                    "prompt": blueprint["prompt"],
                    "solution": blueprint["solution"],
                    "cases": blueprint["cases"],
                    "expectedPaths": blueprint["expectedPaths"],
                    "normalizeReturnPaths": blueprint["normalizeReturnPaths"],
                }).encode("utf-8")
            ).hexdigest()
            if fingerprint in fingerprints:
                raise RuntimeError(f"{lessonId} {mode}: duplicated authored task")
            fingerprints.add(fingerprint)
            _verifyTask(lessonId, mode, blueprint)
            checkId = checkSpec(namespace, lessonId, mode, blueprint)["id"]
            if checkId in checkIds:
                raise RuntimeError(f"duplicate check id: {checkId}")
            checkIds.add(checkId)


def _verifyTask(lessonId: str, mode: str, blueprint: TaskBlueprint) -> None:
    with tempfile.TemporaryDirectory(prefix=f"codaro-{lessonId}-{mode}-") as rootText:
        previousCwd = Path.cwd()
        previousEnv = dict(os.environ)
        try:
            os.chdir(rootText)
            root = Path(rootText)
            for directory in EMPTY_FIXTURE["directories"]:
                (root / directory).mkdir(parents=True, exist_ok=True)
            os.environ.update(EMPTY_FIXTURE["env"])
            namespace: dict[str, Any] = {}
            exec(compile(blueprint["solution"], f"<{lessonId}-{mode}-solution>", "exec"), namespace, namespace)
            entry = namespace.get(blueprint["entry"])
            if not callable(entry):
                raise RuntimeError(f"entry is not callable: {blueprint['entry']}")
            for caseId, arguments, expected in blueprint["cases"]:
                try:
                    actual = entry(*copy.deepcopy(arguments))
                except BaseException as error:
                    if isinstance(expected, ExpectedException) and type(error).__name__ == str(expected):
                        continue
                    raise RuntimeError(f"{lessonId} {mode} {caseId}: unexpected {type(error).__name__}") from error
                if isinstance(expected, ExpectedException):
                    raise RuntimeError(f"{lessonId} {mode} {caseId}: expected {expected}")
                actualJson = json.loads(json.dumps(actual, ensure_ascii=False))
                if actualJson != expected:
                    raise RuntimeError(
                        f"{lessonId} {mode} {caseId}: expected {expected!r}, got {actualJson!r}"
                    )
            _verifyExpectedPaths(Path(rootText), lessonId, mode, blueprint["expectedPaths"])
        finally:
            os.chdir(previousCwd)
            os.environ.clear()
            os.environ.update(previousEnv)


def _verifyExpectedPaths(
    root: Path,
    lessonId: str,
    mode: str,
    expectedPaths: list[dict[str, Any]],
) -> None:
    seen: set[str] = set()
    for item in expectedPaths:
        path = str(item.get("path") or "")
        normalized = path.replace("\\", "/")
        if (
            not path
            or Path(path).is_absolute()
            or ":" in normalized
            or ".." in normalized.split("/")
            or path in seen
        ):
            raise RuntimeError(f"{lessonId} {mode}: invalid or duplicate expected path: {path!r}")
        seen.add(path)
        if item.get("origin") not in {"created", "fixture"}:
            raise RuntimeError(f"{lessonId} {mode}: expected path origin is invalid: {path}")
        kind = item.get("kind")
        target = root / path
        if kind == "directory":
            valid = target.is_dir()
        elif kind in {"file", "table", "image"}:
            valid = target.is_file()
        else:
            raise RuntimeError(f"{lessonId} {mode}: expected path kind is invalid: {path}")
        if not valid:
            raise RuntimeError(f"{lessonId} {mode}: solution did not create expected {kind}: {path}")
        if kind == "table":
            columns = item.get("columns")
            if (
                item.get("format") not in {"csv", "json"}
                or not isinstance(columns, list)
                or not columns
                or not all(isinstance(column, str) and column for column in columns)
                or len(columns) != len(set(columns))
            ):
                raise RuntimeError(f"{lessonId} {mode}: table descriptor is invalid: {path}")
        if kind == "image" and (
            item.get("mediaType") not in {"image/png", "image/jpeg", "image/gif"}
            or not isinstance(item.get("width"), int)
            or isinstance(item.get("width"), bool)
            or item["width"] <= 0
            or not isinstance(item.get("height"), int)
            or isinstance(item.get("height"), bool)
            or item["height"] <= 0
        ):
            raise RuntimeError(f"{lessonId} {mode}: image descriptor is invalid: {path}")


def materialize(
    track: Path,
    namespace: str,
    blueprints: dict[str, dict[str, TaskBlueprint]],
    *,
    write: bool,
    refresh: bool,
) -> list[str]:
    changed: list[str] = []
    for lessonId, modes in sorted(blueprints.items()):
        exactPath = track / f"{lessonId}.yaml"
        paths = [exactPath] if exactPath.is_file() else list(track.glob(f"{lessonId}_*.yaml"))
        if len(paths) != 1:
            raise RuntimeError(f"expected one lesson for {lessonId}, found {len(paths)}")
        path = paths[0]
        text = path.read_text(encoding="utf-8")
        content = yaml.safe_load(text) or {}
        expected = assessmentFor(path, namespace, modes)
        existing = content.get("assessment")
        if existing and existing != expected and not refresh:
            raise RuntimeError(f"authored assessment drift: {path.relative_to(ROOT).as_posix()}")
        if existing == expected:
            continue
        block = yaml.safe_dump(
            {"assessment": expected},
            allow_unicode=True,
            default_flow_style=False,
            sort_keys=False,
            width=120,
        )
        changed.append(path.relative_to(ROOT).as_posix())
        if write:
            marker = "\nassessment:\n"
            prefix = text.split(marker, 1)[0] if refresh and marker in text else text.rstrip()
            path.write_text(prefix.rstrip() + "\n" + block, encoding="utf-8", newline="\n")
    return changed
