from __future__ import annotations

import asyncio
import contextlib
import base64
import csv
import hashlib
import io
import inspect
import json
import os
from pathlib import Path
import random
import sys
import traceback
from typing import Any


ROOT = Path.cwd().resolve()
for packagePath in reversed([item for item in os.environ.get("CODARO_CHECK_PACKAGE_PATHS", "").split(os.pathsep) if item]):
    sys.path.insert(0, packagePath)
READ_ROOTS = tuple(
    path.resolve()
    for value in {*sys.path, sys.base_prefix, sys.prefix}
    if value and (path := Path(value)).exists()
)
WRITE_EVENTS = {
    "os.chdir",
    "os.chmod",
    "os.chown",
    "os.mkdir",
    "os.remove",
    "os.rename",
    "os.replace",
    "os.rmdir",
    "os.truncate",
    "os.unlink",
    "shutil.copyfile",
    "shutil.copymode",
    "shutil.copystat",
    "shutil.move",
    "shutil.rmtree",
}
DENIED_EVENTS = {
    "os.exec",
    "os.posix_spawn",
    "os.spawn",
    "os.startfile",
    "os.system",
    "socket.__new__",
    "socket.bind",
    "socket.connect",
    "subprocess.Popen",
}
MAX_ARTIFACTS = 64
ALLOW_ASYNCIO_INTERNAL_SOCKET = False
ASYNCIO_SOCKET_IDS: set[int] = set()


def inside(path: Path, roots: tuple[Path, ...]) -> bool:
    resolved = path.resolve(strict=False)
    return any(resolved == root or root in resolved.parents for root in roots)


def pathFrom(value: Any) -> Path | None:
    if isinstance(value, int) or value is None:
        return None
    try:
        return Path(os.fsdecode(value))
    except (TypeError, ValueError):
        return None


def audit(event: str, args: tuple[Any, ...]) -> None:
    if allowAsyncioInternalSocketEvent(event, args):
        return
    if event in DENIED_EVENTS or event.startswith("socket."):
        raise PermissionError(f"로컬 격리 검증에서 허용하지 않는 작업: {event}")
    if event == "open" and args:
        path = pathFrom(args[0])
        if path is None:
            return
        mode = str(args[1]) if len(args) > 1 else "r"
        flags = args[2] if len(args) > 2 and isinstance(args[2], int) else 0
        writing = any(marker in mode for marker in "wax+") or bool(flags & (os.O_WRONLY | os.O_RDWR | os.O_CREAT))
        allowed = (ROOT,) if writing else (ROOT, *READ_ROOTS)
        if not inside(path, allowed):
            raise PermissionError("로컬 격리 검증은 fixture 밖의 파일을 열 수 없습니다.")
    if event in WRITE_EVENTS and args:
        for value in args[:2]:
            path = pathFrom(value)
            if path is not None and not inside(path, (ROOT,)):
                raise PermissionError("로컬 격리 검증은 fixture 밖의 경로를 변경할 수 없습니다.")
    if event in {"os.link", "os.symlink"}:
        raise PermissionError("로컬 격리 검증에서는 link 생성을 허용하지 않습니다.")


def allowAsyncioInternalSocketEvent(event: str, args: tuple[Any, ...]) -> bool:
    if not ALLOW_ASYNCIO_INTERNAL_SOCKET or event not in {"socket.__new__", "socket.bind", "socket.connect"}:
        return False
    if not args:
        return False
    socketId = id(args[0])
    if event == "socket.__new__":
        ASYNCIO_SOCKET_IDS.add(socketId)
        return True
    if socketId not in ASYNCIO_SOCKET_IDS:
        return False
    address = args[1] if len(args) > 1 else None
    return isinstance(address, tuple) and address[:1] in {("127.0.0.1",), ("::1",)}


def runAwaitable(value: Any) -> Any:
    global ALLOW_ASYNCIO_INTERNAL_SOCKET
    ALLOW_ASYNCIO_INTERNAL_SOCKET = True
    try:
        return asyncio.run(value)
    finally:
        ALLOW_ASYNCIO_INTERNAL_SOCKET = False
        ASYNCIO_SOCKET_IDS.clear()


def stableJson(value: Any) -> str:
    if isinstance(value, list):
        return "[" + ",".join(stableJson(item) for item in value) + "]"
    if isinstance(value, dict):
        return "{" + ",".join(
            f"{json.dumps(key, ensure_ascii=False)}:{stableJson(value[key])}"
            for key in sorted(value)
        ) + "}"
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False)


def digestBytes(value: bytes) -> str:
    encoded = base64.urlsafe_b64encode(hashlib.sha256(value).digest()).decode("ascii").rstrip("=")
    return f"sha256-{encoded}"


def digestFile(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        while chunk := stream.read(1024 * 1024):
            digest.update(chunk)
    encoded = base64.urlsafe_b64encode(digest.digest()).decode("ascii").rstrip("=")
    return f"sha256-{encoded}"


def tableShape(path: Path, formatName: str) -> tuple[list[str], int] | None:
    try:
        if formatName == "csv":
            with path.open("r", encoding="utf-8-sig", newline="") as stream:
                rows = csv.reader(stream)
                columns = next(rows)
                if not columns or any(not column for column in columns) or len(columns) != len(set(columns)):
                    return None
                rowCount = 0
                for row in rows:
                    if len(row) != len(columns):
                        return None
                    rowCount += 1
                return columns, rowCount
        if formatName == "json":
            records = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(records, list) or not records or not all(isinstance(record, dict) for record in records):
                return None
            columns = sorted({key for record in records for key in record if isinstance(key, str) and key})
            if not columns or any(len(record) != len([key for key in record if isinstance(key, str) and key]) for record in records):
                return None
            return columns, len(records)
    except (csv.Error, OSError, UnicodeError, ValueError, TypeError):
        return None
    return None


def imageShape(path: Path) -> tuple[str, int, int] | None:
    try:
        data = path.read_bytes()
    except OSError:
        return None
    if len(data) >= 24 and data.startswith(b"\x89PNG\r\n\x1a\n"):
        width = int.from_bytes(data[16:20], "big")
        height = int.from_bytes(data[20:24], "big")
        return ("image/png", width, height) if width > 0 and height > 0 else None
    if len(data) >= 10 and data[:6] in {b"GIF87a", b"GIF89a"}:
        width = int.from_bytes(data[6:8], "little")
        height = int.from_bytes(data[8:10], "little")
        return ("image/gif", width, height) if width > 0 and height > 0 else None
    if len(data) < 4 or not data.startswith(b"\xff\xd8"):
        return None
    index = 2
    frameMarkers = {0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF}
    while index < len(data):
        while index < len(data) and data[index] != 0xFF:
            index += 1
        while index < len(data) and data[index] == 0xFF:
            index += 1
        if index >= len(data):
            return None
        marker = data[index]
        index += 1
        if marker == 0xD9:
            return None
        if marker == 0x01 or 0xD0 <= marker <= 0xD8:
            continue
        if index + 2 > len(data):
            return None
        segmentLength = int.from_bytes(data[index:index + 2], "big")
        if segmentLength < 2 or index + segmentLength > len(data):
            return None
        if marker in frameMarkers and segmentLength >= 7:
            height = int.from_bytes(data[index + 3:index + 5], "big")
            width = int.from_bytes(data[index + 5:index + 7], "big")
            return ("image/jpeg", width, height) if width > 0 and height > 0 else None
        index += segmentLength
    return None


def artifactDescriptor(item: dict[str, Any]) -> dict[str, Any] | None:
    path = str(item.get("path") or "")
    if not path:
        return None
    target = ROOT / path
    origin = "fixture" if item.get("origin") == "fixture" else "created"
    if item.get("kind") == "file" and target.is_file():
        return {
            "byteLength": target.stat().st_size,
            "contentHash": digestFile(target),
            "fileCount": 1,
            "kind": "file",
            "origin": origin,
            "path": path,
            "schemaVersion": 1,
        }
    if item.get("kind") == "directory" and target.is_dir():
        entries: list[dict[str, Any]] = []
        totalBytes = 0
        for child in sorted(target.rglob("*")):
            if not child.is_file():
                continue
            byteLength = child.stat().st_size
            totalBytes += byteLength
            entries.append({
                "byteLength": byteLength,
                "contentHash": digestFile(child),
                "path": child.relative_to(target).as_posix(),
            })
        return {
            "byteLength": totalBytes,
            "contentHash": digestBytes(stableJson(entries).encode("utf-8")),
            "fileCount": len(entries),
            "kind": "directory",
            "origin": origin,
            "path": path,
            "schemaVersion": 1,
        }
    if item.get("kind") == "table" and target.is_file():
        formatName = item.get("format")
        shape = tableShape(target, formatName) if isinstance(formatName, str) else None
        if shape is None or shape[0] != item.get("columns"):
            return None
        columns, rowCount = shape
        return {
            "byteLength": target.stat().st_size,
            "columnCount": len(columns),
            "columns": columns,
            "contentHash": digestFile(target),
            "format": formatName,
            "kind": "table",
            "origin": origin,
            "path": path,
            "rowCount": rowCount,
            "schemaVersion": 1,
        }
    if item.get("kind") == "image" and target.is_file():
        shape = imageShape(target)
        if (
            shape is None
            or shape[0] != item.get("mediaType")
            or shape[1] != item.get("width")
            or shape[2] != item.get("height")
        ):
            return None
        mediaType, width, height = shape
        return {
            "byteLength": target.stat().st_size,
            "contentHash": digestFile(target),
            "height": height,
            "kind": "image",
            "mediaType": mediaType,
            "origin": origin,
            "path": path,
            "schemaVersion": 1,
            "width": width,
        }
    return None


def artifactDescriptors(expectedPaths: list[dict[str, Any]]) -> list[dict[str, Any]]:
    descriptors = [
        descriptor
        for item in expectedPaths[:MAX_ARTIFACTS]
        if (descriptor := artifactDescriptor(item)) is not None
    ]
    return sorted(descriptors, key=lambda item: (item["origin"], item["path"], item["kind"]))


def run(request: dict[str, Any]) -> dict[str, str]:
    source = request["source"]
    kind = request["kind"]
    payload = request["payload"]
    stdout = io.StringIO()
    stderr = io.StringIO()
    observed: Any = None
    sys.addaudithook(audit)
    random.seed(0)
    namespace = {"__name__": "__main__", "__builtins__": __builtins__}
    try:
        with contextlib.redirect_stdout(stdout), contextlib.redirect_stderr(stderr):
            exec(compile(source, "<local-learning-check>", "exec"), namespace, namespace)
            if kind == "variable":
                name = payload["name"]
                observed = {"exists": name in namespace, "value": namespace.get(name)}
            elif kind == "behavior":
                entry = namespace.get(payload["entry"])
                if not callable(entry):
                    raise AssertionError(f"호출 가능한 함수가 없습니다: {payload['entry']}")
                preexisting = [
                    item["path"]
                    for item in payload["expectedPaths"]
                    if item["origin"] == "created" and (ROOT / item["path"]).exists()
                ]
                if preexisting:
                    raise AssertionError("함수 호출 전에 fixture를 변경했습니다: " + ", ".join(preexisting))
                caseResults: list[dict[str, Any]] = []
                for case in payload["cases"]:
                    arguments = [
                        ROOT / item["fixturePath"] if "fixturePath" in item else item.get("value")
                        for item in case["arguments"]
                    ]
                    try:
                        returned = entry(*arguments)
                        if inspect.isawaitable(returned):
                            returned = runAwaitable(returned)
                        if payload["normalizeReturnPaths"] and isinstance(returned, dict):
                            returned = dict(returned)
                            for key in payload["normalizeReturnPaths"]:
                                if key not in returned:
                                    raise AssertionError(f"정규화할 반환 경로 key가 없습니다: {key}")
                                try:
                                    returned[key] = Path(returned[key]).resolve().relative_to(ROOT).as_posix()
                                except ValueError:
                                    returned[key] = "outside-fixture"
                        caseResults.append({"id": case["id"], "return": returned})
                    except Exception as error:
                        caseResults.append({"id": case["id"], "exception": type(error).__name__})
                paths = []
                artifacts = []
                for item in payload["expectedPaths"]:
                    target = ROOT / item["path"]
                    descriptor = artifactDescriptor(item)
                    if descriptor is not None:
                        artifacts.append(descriptor)
                    actualKind = (
                        str(descriptor["kind"])
                        if descriptor is not None
                        else "directory" if target.is_dir() else "file" if target.is_file() else "missing"
                    )
                    paths.append({"path": item["path"], "kind": actualKind})
                observed = {"cases": caseResults, "paths": paths}
                artifacts.sort(key=lambda item: (item["origin"], item["path"], item["kind"]))
    except Exception:
        return {
            "actual": stableJson(observed) if observed is not None else "",
            "error": " ".join(traceback.format_exc(limit=4).strip().splitlines()[-2:]),
        }
    actual = (
        stdout.getvalue().replace("\r\n", "\n").replace("\r", "\n").rstrip("\n")
        if kind == "output"
        else stableJson(observed)
    )
    return {
        "actual": actual,
        "artifacts": artifacts if kind == "behavior" else [],
        "error": "",
    }


def main() -> int:
    try:
        request = json.loads(sys.stdin.read())
        response = run(request)
    except Exception:
        response = {"actual": "", "error": " ".join(traceback.format_exc(limit=4).strip().splitlines()[-2:])}
    sys.stdout.write(json.dumps(response, ensure_ascii=False, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
