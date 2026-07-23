from __future__ import annotations

import ast
import base64
import binascii
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any


WORKER_PATH = Path(__file__).with_name("_localStrongCheckWorker.py")
REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
MAX_SOURCE_BYTES = 512 * 1024
MAX_FIXTURE_BYTES = 2 * 1024 * 1024
MAX_OUTPUT_BYTES = 2 * 1024 * 1024
MAX_ARTIFACTS = 64
ENV_NAME_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_]*$")
ARTIFACT_HASH_RE = re.compile(r"^sha256-[A-Za-z0-9_-]{43}$")
RESERVED_ENV_NAMES = {
    "COMSPEC",
    "PATH",
    "PATHEXT",
    "PYTHONHOME",
    "PYTHONPATH",
    "SYSTEMROOT",
    "TEMP",
    "TMP",
}
FORBIDDEN_SOURCE_IMPORTS = {
    "ctypes",
    "ftplib",
    "http",
    "multiprocessing",
    "requests",
    "socket",
    "subprocess",
    "winreg",
}
ALLOWED_URLLIB_IMPORTS = {"urllib.error", "urllib.parse"}
FORBIDDEN_SOURCE_CALLS = {"__import__", "compile", "eval", "exec"}


class LocalStrongCheckInvalid(ValueError):
    pass


def runLocalStrongCheck(spec: dict[str, Any], source: str) -> dict[str, object]:
    normalized = validateLocalStrongCheck(spec, source)
    expected = expectedDisplay(normalized)
    timeoutMs = int(normalized["timeoutMs"])

    for attempt in range(2):
        result, retryable = runLocalStrongCheckAttempt(normalized, source, expected, timeoutMs)
        if not retryable or attempt == 1:
            return result
    raise AssertionError("local strong-check retry loop did not return")


def runLocalStrongCheckAttempt(
    normalized: dict[str, Any],
    source: str,
    expected: str,
    timeoutMs: int,
) -> tuple[dict[str, object], bool]:

    with tempfile.TemporaryDirectory(prefix="codaro-strong-check-") as rootText:
        root = Path(rootText)
        materializeFixture(root, normalized["fixture"])
        request = {
            "kind": normalized["kind"],
            "payload": runtimeCheckPayload(normalized),
            "source": source,
        }
        try:
            completed = subprocess.run(
                [sys.executable, "-I", "-X", "utf8", str(WORKER_PATH)],
                input=json.dumps(request, ensure_ascii=False, separators=(",", ":")),
                text=True,
                encoding="utf-8",
                errors="replace",
                cwd=root,
                env=workerEnvironment(root, normalized["fixture"], normalized["_localPackagePaths"]),
                capture_output=True,
                timeout=(timeoutMs / 1000) + 1.5,
                check=False,
            )
        except subprocess.TimeoutExpired:
            return (
                failedResult(
                    "error",
                    expected,
                    "",
                    f"로컬 격리 검증이 {timeoutMs}ms 제한 시간을 넘었습니다.",
                ),
                timeoutMs >= 1_000,
            )
        except OSError as error:
            return (
                failedResult(
                    "error",
                    expected,
                    "",
                    f"로컬 격리 검증 프로세스를 시작하지 못했습니다: {error}",
                ),
                True,
            )

        if len(completed.stdout.encode("utf-8")) > MAX_OUTPUT_BYTES:
            return failedResult("error", expected, "", "로컬 격리 검증 결과가 허용 크기를 넘었습니다."), False
        try:
            response = json.loads(completed.stdout)
        except json.JSONDecodeError:
            detail = conciseWorkerFailure(completed.stderr, completed.returncode)
            return failedResult("error", expected, "", detail), True
        if not isinstance(response, dict):
            return failedResult("error", expected, "", "로컬 격리 검증기가 잘못된 응답을 반환했습니다."), True
        if response.get("error"):
            return (
                failedResult("error", expected, str(response.get("actual") or ""), str(response["error"])),
                False,
            )

        actual = normalizeOutput(str(response.get("actual") or "")) if normalized["kind"] == "output" else str(
            response.get("actual") or ""
        )
        if actual != expected:
            return (
                failedResult(
                    "mismatch",
                    expected,
                    actual,
                    f"기대 결과와 로컬 격리 실행 결과가 다릅니다. 기대: {displayOutput(expected)}, 실제: {displayOutput(actual)}",
                ),
                False,
            )
        return (
            {
                "actual": actual,
                "artifacts": normalizeWorkerArtifacts(response.get("artifacts")),
                "detail": (
                    "새 로컬 Python 격리 프로세스에서 fixture와 함께 다시 실행해 정확한 출력을 확인했습니다."
                    if normalized["kind"] == "output"
                    else "새 로컬 Python 격리 프로세스에서 함수 반환값과 생성된 경로를 함께 확인했습니다."
                ),
                "executor": "local-sandbox",
                "expected": expected,
                "passed": True,
                "state": "verified",
            },
            False,
        )


def validateLocalStrongCheck(spec: dict[str, Any], source: str) -> dict[str, Any]:
    if not isinstance(spec, dict):
        raise LocalStrongCheckInvalid("checkSpec은 object여야 합니다.")
    if not isinstance(source, str) or not source.strip():
        raise LocalStrongCheckInvalid("검증할 source가 비어 있습니다.")
    if len(source.encode("utf-8")) > MAX_SOURCE_BYTES:
        raise LocalStrongCheckInvalid("검증할 source가 허용 크기를 넘었습니다.")
    validateSourceAst(source)
    if (
        spec.get("version") != 1
        or spec.get("strength") != "strong"
        or spec.get("executor") not in {"browser-worker", "local-sandbox"}
    ):
        raise LocalStrongCheckInvalid("지원하는 strong CheckSpec v1이 아닙니다.")
    timeoutMs = spec.get("timeoutMs")
    if isinstance(timeoutMs, bool) or not isinstance(timeoutMs, int) or not 250 <= timeoutMs <= 15_000:
        raise LocalStrongCheckInvalid("timeoutMs는 250..15000 정수여야 합니다.")
    for key in ("id", "fixtureId", "fixtureHash"):
        if not isinstance(spec.get(key), str) or not str(spec[key]).strip():
            raise LocalStrongCheckInvalid(f"{key}가 비어 있습니다.")

    fixture = normalizeFixture(spec.get("fixture"))
    if fixtureHash(fixture) != spec["fixtureHash"]:
        raise LocalStrongCheckInvalid("fixture hash가 일치하지 않습니다.")
    kind = spec.get("kind")
    payload = spec.get("payload")
    if not isinstance(payload, dict):
        raise LocalStrongCheckInvalid("check payload가 비어 있습니다.")
    if kind == "output":
        if payload.get("comparator") != "exact" or payload.get("normalization") != "trim-final-newline":
            raise LocalStrongCheckInvalid("지원하지 않는 output comparator입니다.")
        if not isinstance(payload.get("expected"), str) or not payload["expected"]:
            raise LocalStrongCheckInvalid("output expected가 비어 있습니다.")
        normalizedPayload = {
            "comparator": "exact",
            "expected": payload["expected"],
            "normalization": "trim-final-newline",
        }
    elif kind == "variable":
        name = payload.get("name")
        if not isinstance(name, str) or not name.isidentifier():
            raise LocalStrongCheckInvalid("variable name이 올바른 식별자가 아닙니다.")
        if "expected" not in payload:
            raise LocalStrongCheckInvalid("variable expected가 비어 있습니다.")
        ensureJsonValue(payload["expected"], "variable expected")
        normalizedPayload = {"expected": payload["expected"], "name": name}
    elif kind == "behavior":
        normalizedPayload = normalizeBehaviorPayload(payload)
    else:
        raise LocalStrongCheckInvalid("지원하지 않는 strong check kind입니다.")
    return {
        **spec,
        "_localPackagePaths": validatePackageAssets(spec.get("packageAssets", [])),
        "fixture": fixture,
        "kind": kind,
        "payload": normalizedPayload,
    }


def validateSourceAst(source: str) -> None:
    try:
        tree = ast.parse(source, filename="<local-learning-check>", mode="exec")
    except SyntaxError as error:
        raise LocalStrongCheckInvalid(f"검증할 source 문법이 올바르지 않습니다: {error.msg}") from error
    for node in ast.walk(tree):
        blocked = blockedSourceImportNames(sourceImportNames(node))
        if blocked:
            raise LocalStrongCheckInvalid("로컬 격리 검증에서 허용하지 않는 import: " + ", ".join(blocked))
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in FORBIDDEN_SOURCE_CALLS:
            raise LocalStrongCheckInvalid(f"로컬 격리 검증에서 허용하지 않는 호출: {node.func.id}")


def sourceImportNames(node: ast.AST) -> list[str]:
    if isinstance(node, ast.Import):
        return [alias.name for alias in node.names]
    if isinstance(node, ast.ImportFrom):
        module = node.module or ""
        if not module:
            return []
        if module == "urllib":
            return [module if alias.name == "*" else f"{module}.{alias.name}" for alias in node.names]
        return [module]
    return []


def blockedSourceImportNames(imported: list[str]) -> list[str]:
    blocked: list[str] = []
    for name in imported:
        root = name.split(".", 1)[0]
        if root in FORBIDDEN_SOURCE_IMPORTS:
            blocked.append(name)
            continue
        if name == "urllib" or name.startswith("urllib."):
            if any(name == allowed or name.startswith(f"{allowed}.") for allowed in ALLOWED_URLLIB_IMPORTS):
                continue
            blocked.append(name)
    return sorted(set(blocked))


def normalizeFixture(value: Any) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise LocalStrongCheckInvalid("fixture는 object여야 합니다.")
    directories = value.get("directories", [])
    files = value.get("files", [])
    stdin = value.get("stdin", [])
    env = value.get("env", {})
    if not isinstance(directories, list) or not all(isinstance(item, str) and safeRelativePath(item) for item in directories):
        raise LocalStrongCheckInvalid("fixture directories에 안전하지 않은 경로가 있습니다.")
    if not isinstance(files, list):
        raise LocalStrongCheckInvalid("fixture files는 array여야 합니다.")
    normalizedFiles: list[dict[str, str]] = []
    totalBytes = 0
    for item in files:
        if not isinstance(item, dict) or not isinstance(item.get("path"), str) or not safeRelativePath(item["path"]):
            raise LocalStrongCheckInvalid("fixture file 경로가 안전하지 않습니다.")
        contentBase64 = item.get("contentBase64")
        if isinstance(contentBase64, str) and contentBase64:
            try:
                decoded = base64.b64decode(contentBase64, validate=True)
            except (ValueError, binascii.Error) as error:
                raise LocalStrongCheckInvalid("fixture file contentBase64가 올바른 base64가 아닙니다.") from error
            totalBytes += len(decoded)
            normalizedFiles.append({"path": item["path"], "contentBase64": contentBase64})
        else:
            content = item.get("content", "")
            if not isinstance(content, str):
                raise LocalStrongCheckInvalid("fixture file content는 문자열이어야 합니다.")
            totalBytes += len(content.encode("utf-8"))
            normalizedFiles.append({"path": item["path"], "content": content})
    if totalBytes > MAX_FIXTURE_BYTES:
        raise LocalStrongCheckInvalid("fixture file 크기가 허용 범위를 넘었습니다.")
    if not isinstance(stdin, list) or not all(isinstance(item, str) for item in stdin):
        raise LocalStrongCheckInvalid("fixture stdin은 문자열 array여야 합니다.")
    if not isinstance(env, dict):
        raise LocalStrongCheckInvalid("fixture env는 object여야 합니다.")
    normalizedEnv: dict[str, str] = {}
    for key, item in env.items():
        upper = str(key).upper()
        if (
            not isinstance(key, str)
            or not ENV_NAME_RE.fullmatch(key)
            or upper in RESERVED_ENV_NAMES
            or upper.startswith(("CODARO_", "PYTHON"))
        ):
            raise LocalStrongCheckInvalid(f"fixture env 이름을 사용할 수 없습니다: {key}")
        if not isinstance(item, str):
            raise LocalStrongCheckInvalid("fixture env 값은 문자열이어야 합니다.")
        normalizedEnv[key] = item
    return {
        "directories": list(directories),
        "env": normalizedEnv,
        "files": normalizedFiles,
        "stdin": list(stdin),
    }


def normalizeBehaviorPayload(payload: dict[str, Any]) -> dict[str, Any]:
    entry = payload.get("entry")
    cases = payload.get("cases")
    expectedPaths = payload.get("expectedPaths", [])
    normalizeReturnPaths = payload.get("normalizeReturnPaths", [])
    if not isinstance(entry, str) or not entry.isidentifier():
        raise LocalStrongCheckInvalid("behavior entry가 올바른 함수 이름이 아닙니다.")
    if not isinstance(cases, list) or not cases:
        raise LocalStrongCheckInvalid("behavior cases가 비어 있습니다.")
    normalizedCases: list[dict[str, Any]] = []
    for case in cases:
        if not isinstance(case, dict) or not isinstance(case.get("id"), str) or not case["id"]:
            raise LocalStrongCheckInvalid("behavior case id가 비어 있습니다.")
        arguments = case.get("arguments")
        if not isinstance(arguments, list) or not arguments:
            raise LocalStrongCheckInvalid("behavior case arguments가 비어 있습니다.")
        normalizedArguments: list[dict[str, Any]] = []
        for argument in arguments:
            if not isinstance(argument, dict):
                raise LocalStrongCheckInvalid("behavior argument는 object여야 합니다.")
            if "fixturePath" in argument:
                path = argument.get("fixturePath")
                if not isinstance(path, str) or not safeRelativePath(path):
                    raise LocalStrongCheckInvalid("behavior fixturePath가 안전하지 않습니다.")
                normalizedArguments.append({"fixturePath": path})
            elif "value" in argument:
                ensureJsonValue(argument["value"], "behavior argument")
                normalizedArguments.append({"value": argument["value"]})
            else:
                raise LocalStrongCheckInvalid("behavior argument에 value 또는 fixturePath가 필요합니다.")
        hasReturn = "expectedReturn" in case
        hasException = isinstance(case.get("expectedException"), str) and bool(case["expectedException"])
        if hasReturn == hasException:
            raise LocalStrongCheckInvalid("behavior case는 expectedReturn 또는 expectedException 하나만 가져야 합니다.")
        normalizedCase: dict[str, Any] = {"id": case["id"], "arguments": normalizedArguments}
        if hasReturn:
            ensureJsonValue(case["expectedReturn"], "behavior expectedReturn")
            normalizedCase["expectedReturn"] = case["expectedReturn"]
        else:
            normalizedCase["expectedException"] = case["expectedException"]
        normalizedCases.append(normalizedCase)
    if not isinstance(expectedPaths, list):
        raise LocalStrongCheckInvalid("behavior expectedPaths는 array여야 합니다.")
    normalizedPaths: list[dict[str, Any]] = []
    for item in expectedPaths:
        if (
            not isinstance(item, dict)
            or item.get("kind") not in {"file", "directory", "table", "image"}
            or item.get("origin") not in {"fixture", "created"}
            or not isinstance(item.get("path"), str)
            or not safeRelativePath(item["path"])
        ):
            raise LocalStrongCheckInvalid("behavior expected path가 올바르지 않습니다.")
        normalizedItem: dict[str, Any] = {
            "kind": item["kind"],
            "origin": item["origin"],
            "path": item["path"],
        }
        if item["kind"] == "table":
            columns = item.get("columns")
            if (
                item.get("format") not in {"csv", "json"}
                or not isinstance(columns, list)
                or not all(isinstance(column, str) and column for column in columns)
                or len(set(columns)) != len(columns)
            ):
                raise LocalStrongCheckInvalid("table expected path에는 format과 고유한 columns가 필요합니다.")
            normalizedItem["format"] = item["format"]
            normalizedItem["columns"] = list(columns)
        if item["kind"] == "image":
            width = item.get("width")
            height = item.get("height")
            if (
                item.get("mediaType") not in {"image/png", "image/jpeg", "image/gif"}
                or isinstance(width, bool)
                or not isinstance(width, int)
                or width < 1
                or isinstance(height, bool)
                or not isinstance(height, int)
                or height < 1
            ):
                raise LocalStrongCheckInvalid("image expected path에는 mediaType과 양의 width·height가 필요합니다.")
            normalizedItem["mediaType"] = item["mediaType"]
            normalizedItem["width"] = width
            normalizedItem["height"] = height
        normalizedPaths.append(normalizedItem)
    if not isinstance(normalizeReturnPaths, list) or not all(
        isinstance(item, str) and item for item in normalizeReturnPaths
    ):
        raise LocalStrongCheckInvalid("normalizeReturnPaths는 문자열 array여야 합니다.")
    return {
        "cases": normalizedCases,
        "entry": entry,
        "expectedPaths": normalizedPaths,
        "normalizeReturnPaths": list(normalizeReturnPaths),
    }


def materializeFixture(root: Path, fixture: dict[str, Any]) -> None:
    for directory in fixture["directories"]:
        (root / directory).mkdir(parents=True, exist_ok=True)
    for item in fixture["files"]:
        target = root / item["path"]
        target.parent.mkdir(parents=True, exist_ok=True)
        if "contentBase64" in item:
            target.write_bytes(base64.b64decode(item["contentBase64"], validate=True))
        else:
            target.write_text(item["content"], encoding="utf-8")


def validatePackageAssets(value: Any) -> list[str]:
    if not isinstance(value, list) or len(value) > 16:
        raise LocalStrongCheckInvalid("packageAssets는 최대 16개 array여야 합니다.")
    paths: list[str] = []
    for asset in value:
        if not isinstance(asset, dict):
            raise LocalStrongCheckInvalid("package asset은 object여야 합니다.")
        name = asset.get("name")
        version = asset.get("version")
        url = asset.get("url")
        integrity = asset.get("integrity")
        if not isinstance(name, str) or not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", name):
            raise LocalStrongCheckInvalid("package asset 이름이 유효하지 않습니다.")
        if not isinstance(version, str) or not re.fullmatch(r"\d+(?:\.\d+){1,3}(?:[-+][A-Za-z0-9.-]+)?", version):
            raise LocalStrongCheckInvalid("package asset version이 유효하지 않습니다.")
        if (
            not isinstance(url, str)
            or not url.startswith("check-packages/")
            or not url.endswith(".whl")
            or not safeRelativePath(url)
        ):
            raise LocalStrongCheckInvalid("package asset URL은 check-packages 아래 wheel이어야 합니다.")
        if not isinstance(integrity, str) or not re.fullmatch(r"sha256-[A-Za-z0-9+/]+={0,2}", integrity):
            raise LocalStrongCheckInvalid("package asset integrity가 유효하지 않습니다.")
        path = (REPOSITORY_ROOT / "editor" / "public" / url).resolve()
        assetRoot = (REPOSITORY_ROOT / "editor" / "public" / "check-packages").resolve()
        if assetRoot not in path.parents or not path.is_file():
            raise LocalStrongCheckInvalid(f"package asset 파일을 찾을 수 없습니다: {url}")
        actual = "sha256-" + base64.b64encode(hashlib.sha256(path.read_bytes()).digest()).decode("ascii")
        if actual != integrity:
            raise LocalStrongCheckInvalid(f"package asset integrity가 일치하지 않습니다: {name}")
        paths.append(str(path))
    return paths


def workerEnvironment(root: Path, fixture: dict[str, Any], packagePaths: list[str]) -> dict[str, str]:
    source = os.environ
    environment = {
        key: source[key]
        for key in ("PATH", "PATHEXT", "SYSTEMROOT", "WINDIR", "COMSPEC", "LD_LIBRARY_PATH")
        if key in source
    }
    environment.update({
        "CODARO_CHECK_PACKAGE_PATHS": os.pathsep.join(packagePaths),
        "HOME": str(root),
        "LANG": "C.UTF-8",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONUTF8": "1",
        "TEMP": str(root),
        "TMP": str(root),
        "TZ": "UTC",
    })
    environment.update(fixture["env"])
    return environment


def stableJson(value: Any) -> str:
    if isinstance(value, list):
        return "[" + ",".join(stableJson(item) for item in value) + "]"
    if isinstance(value, dict):
        return "{" + ",".join(
            f"{json.dumps(key, ensure_ascii=False)}:{stableJson(value[key])}"
            for key in sorted(value)
        ) + "}"
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def fixtureHash(value: dict[str, Any]) -> str:
    digest = hashlib.sha256(stableJson(value).encode("utf-8")).digest()
    return "sha256-" + base64.b64encode(digest).decode("ascii")


def expectedDisplay(spec: dict[str, Any]) -> str:
    payload = spec["payload"]
    if spec["kind"] == "output":
        return normalizeOutput(payload["expected"])
    if spec["kind"] == "variable":
        return stableJson({"exists": True, "value": payload["expected"]})
    return stableJson({
        "cases": [
            {"exception": item["expectedException"], "id": item["id"]}
            if "expectedException" in item
            else {"id": item["id"], "return": item["expectedReturn"]}
            for item in payload["cases"]
        ],
        "paths": [{"kind": item["kind"], "path": item["path"]} for item in payload["expectedPaths"]],
    })


def runtimeCheckPayload(spec: dict[str, Any]) -> dict[str, Any]:
    if spec["kind"] == "output":
        return {}
    payload = spec["payload"]
    if spec["kind"] == "variable":
        return {"name": payload["name"]}
    return {
        "cases": [
            {
                "arguments": case["arguments"],
                "id": case["id"],
            }
            for case in payload["cases"]
        ],
        "entry": payload["entry"],
        "expectedPaths": [dict(item) for item in payload["expectedPaths"]],
        "normalizeReturnPaths": payload["normalizeReturnPaths"],
    }


def safeRelativePath(value: str) -> bool:
    normalized = value.replace("\\", "/")
    path = Path(normalized)
    return bool(normalized) and not path.is_absolute() and ".." not in path.parts and ":" not in normalized


def ensureJsonValue(value: Any, label: str) -> None:
    try:
        json.dumps(value, ensure_ascii=False, allow_nan=False)
    except (TypeError, ValueError) as error:
        raise LocalStrongCheckInvalid(f"{label}이 JSON 값이 아닙니다.") from error


def normalizeOutput(value: str) -> str:
    return value.replace("\r\n", "\n").replace("\r", "\n").rstrip("\n")


def displayOutput(value: str) -> str:
    return f"'{value.replace(chr(10), ' ↵ ')}'" if value else "빈 출력"


def failedResult(state: str, expected: str, actual: str, detail: str) -> dict[str, object]:
    return {
        "actual": actual,
        "artifacts": [],
        "detail": detail,
        "executor": "local-sandbox",
        "expected": expected,
        "passed": False,
        "state": state,
    }


def conciseWorkerFailure(stderr: str, returncode: int) -> str:
    lines = [line.strip() for line in stderr.splitlines() if line.strip()]
    tail = " ".join(lines[-2:])
    return tail or f"로컬 격리 검증기가 종료 코드 {returncode}로 끝났습니다."


def normalizeWorkerArtifacts(value: Any) -> list[dict[str, object]]:
    if not isinstance(value, list) or len(value) > MAX_ARTIFACTS:
        return []
    artifacts: list[dict[str, object]] = []
    for item in value:
        if not isinstance(item, dict):
            return []
        byteLength = item.get("byteLength")
        path = item.get("path")
        contentHash = item.get("contentHash")
        kind = item.get("kind")
        origin = item.get("origin")
        if (
            isinstance(item.get("schemaVersion"), bool)
            or item.get("schemaVersion") != 1
            or kind not in {"directory", "file", "table", "image"}
            or origin not in {"created", "fixture"}
            or not isinstance(path, str)
            or not safeRelativePath(path)
            or not isinstance(contentHash, str)
            or not ARTIFACT_HASH_RE.fullmatch(contentHash)
            or isinstance(byteLength, bool)
            or not isinstance(byteLength, int)
            or byteLength < 0
        ):
            return []
        normalized: dict[str, object] = {
            "byteLength": byteLength,
            "contentHash": contentHash,
            "kind": kind,
            "origin": origin,
            "path": path,
            "schemaVersion": 1,
        }
        if kind in {"directory", "file"}:
            fileCount = item.get("fileCount")
            if isinstance(fileCount, bool) or not isinstance(fileCount, int) or fileCount < 0:
                return []
            normalized["fileCount"] = fileCount
        elif kind == "table":
            formatName = item.get("format")
            rowCount = item.get("rowCount")
            columnCount = item.get("columnCount")
            columns = item.get("columns")
            if (
                formatName not in {"csv", "json"}
                or isinstance(rowCount, bool)
                or not isinstance(rowCount, int)
                or rowCount < 0
                or isinstance(columnCount, bool)
                or not isinstance(columnCount, int)
                or columnCount < 1
                or not isinstance(columns, list)
                or not all(isinstance(column, str) and column for column in columns)
                or len(set(columns)) != len(columns)
                or len(columns) != columnCount
            ):
                return []
            normalized.update({
                "columnCount": columnCount,
                "columns": list(columns),
                "format": formatName,
                "rowCount": rowCount,
            })
        else:
            mediaType = item.get("mediaType")
            width = item.get("width")
            height = item.get("height")
            if (
                mediaType not in {"image/png", "image/jpeg", "image/gif"}
                or isinstance(width, bool)
                or not isinstance(width, int)
                or width < 1
                or isinstance(height, bool)
                or not isinstance(height, int)
                or height < 1
            ):
                return []
            normalized.update({"height": height, "mediaType": mediaType, "width": width})
        artifacts.append(normalized)
    return sorted(artifacts, key=lambda item: (str(item["origin"]), str(item["path"]), str(item["kind"])))
