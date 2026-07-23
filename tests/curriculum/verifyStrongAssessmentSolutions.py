from __future__ import annotations

import asyncio
import base64
import copy
from contextlib import redirect_stdout
from dataclasses import dataclass
from datetime import UTC, datetime
import hashlib
import io
import inspect
import json
import os
from pathlib import Path
import sys
import tempfile
import time
from typing import Any

import yaml

from codaro.curriculum._localStrongCheckWorker import imageShape, tableShape
from codaro.curriculum.localStrongCheck import validatePackageAssets
from learningLedgerAudit import currentGitHead


ROOT = Path(__file__).resolve().parents[2]
CURRICULA_DIR = ROOT / "curricula" / "python"
REPORT_PATH = ROOT / "output" / "test-runner" / "curriculum-quality-matrix" / "strong-assessment-solutions-report.json"
ASSESSMENT_KEYS = ("masteryVariants", "transferVariants", "retrievalVariants")


@dataclass(frozen=True)
class VariantRef:
    path: Path
    mode: str
    variant: dict[str, Any]


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    variants = list(iterAssessmentVariants())
    failures: list[dict[str, str]] = []
    checkedIds: set[str] = set()
    kindCounts: dict[str, int] = {}
    for ref in variants:
        check = ref.variant.get("check") if isinstance(ref.variant.get("check"), dict) else {}
        checkId = textValue(check.get("id"))
        kind = textValue(check.get("kind") or check.get("type"))
        kindCounts[kind] = kindCounts.get(kind, 0) + 1
        if checkId in checkedIds:
            failures.append(failure(ref, f"duplicate check id: {checkId}"))
            continue
        checkedIds.add(checkId)
        try:
            verifyVariant(ref, check)
        except Exception as exc:  # noqa: BLE001
            failures.append(failure(ref, f"{type(exc).__name__}: {exc}"))

    payload = {
        "gate": "strong-assessment-solutions",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "completionEligible": not failures,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "lessonCount": len({ref.path.relative_to(CURRICULA_DIR).as_posix() for ref in variants}),
        "variantCount": len(variants),
        "checkKindCounts": kindCounts,
        "failureCount": len(failures),
        "failures": failures[:80],
        "reportPath": displayPath(REPORT_PATH),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: strong assessment solutions do not match their CheckSpec cases", file=os.sys.stderr)
        return 1
    print(f"ok: verified {len(variants)} strong assessment solution variant(s)")
    return 0


def iterAssessmentVariants() -> list[VariantRef]:
    refs: list[VariantRef] = []
    for path in sorted(CURRICULA_DIR.rglob("*.yaml")):
        if path.name == "schema.yaml":
            continue
        content = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
        assessment = content.get("assessment") if isinstance(content.get("assessment"), dict) else {}
        for key in ASSESSMENT_KEYS:
            variants = assessment.get(key)
            if not isinstance(variants, list):
                continue
            mode = key.removesuffix("Variants")
            for variant in variants:
                if isinstance(variant, dict):
                    refs.append(VariantRef(path=path, mode=mode, variant=variant))
    return refs


def verifyVariant(ref: VariantRef, check: dict[str, Any]) -> None:
    if check.get("version") != 1 or check.get("strength") != "strong" or check.get("executor") != "browser-worker":
        raise ValueError("check is not a strong browser-worker v1 CheckSpec")
    if not textValue(check.get("id")) or not textValue(check.get("fixtureId")):
        raise ValueError("check id or fixtureId missing")
    fixture = check.get("fixture") if isinstance(check.get("fixture"), dict) else {}
    actualFixtureHash = fixtureHash(fixture)
    if check.get("fixtureHash") != actualFixtureHash:
        raise ValueError(f"fixtureHash mismatch: expected {actualFixtureHash}, got {check.get('fixtureHash')}")
    exercise = ref.variant.get("exercise") if isinstance(ref.variant.get("exercise"), dict) else {}
    solution = textValue(exercise.get("solution"))
    if not solution:
        raise ValueError("exercise.solution missing")
    kind = textValue(check.get("kind") or check.get("type"))
    packagePaths = validatePackageAssets(check.get("packageAssets", []))
    if kind == "output":
        verifyOutput(ref, check, solution, fixture, packagePaths)
        return
    if kind == "behavior":
        verifyBehavior(ref, check, solution, fixture, packagePaths)
        return
    raise ValueError(f"unsupported strong assessment kind: {kind}")


def verifyOutput(
    ref: VariantRef,
    check: dict[str, Any],
    solution: str,
    fixture: dict[str, Any],
    packagePaths: list[str],
) -> None:
    payload = check.get("payload") if isinstance(check.get("payload"), dict) else {}
    expected = textValue(payload.get("expected"))
    with preparedFixture(ref, fixture, packagePaths) as root:
        del root
        stdout = io.StringIO()
        with redirect_stdout(stdout):
            namespace: dict[str, Any] = {}
            exec(compile(solution, displayPath(ref.path), "exec"), namespace, namespace)
        actual = normalizeOutput(stdout.getvalue())
    if actual != expected:
        raise AssertionError(f"output expected {expected!r}, got {actual!r}")


def verifyBehavior(
    ref: VariantRef,
    check: dict[str, Any],
    solution: str,
    fixture: dict[str, Any],
    packagePaths: list[str],
) -> None:
    payload = check.get("payload") if isinstance(check.get("payload"), dict) else {}
    entryName = textValue(payload.get("entry"))
    cases = payload.get("cases") if isinstance(payload.get("cases"), list) else []
    expectedPaths = payload.get("expectedPaths") if isinstance(payload.get("expectedPaths"), list) else []
    normalizeReturnPaths = [
        textValue(item)
        for item in payload.get("normalizeReturnPaths", [])
        if textValue(item)
    ] if isinstance(payload.get("normalizeReturnPaths"), list) else []
    if not entryName or not cases:
        raise ValueError("behavior payload entry or cases missing")
    with preparedFixture(ref, fixture, packagePaths) as root:
        namespace: dict[str, Any] = {}
        exec(compile(solution, displayPath(ref.path), "exec"), namespace, namespace)
        entry = namespace.get(entryName)
        if not callable(entry):
            raise ValueError(f"entry is not callable: {entryName}")
        for case in cases:
            if not isinstance(case, dict):
                raise ValueError("case must be an object")
            verifyBehaviorCase(ref, root, entry, case, normalizeReturnPaths)
        verifyExpectedPaths(root, expectedPaths)


def verifyBehaviorCase(
    ref: VariantRef,
    root: Path,
    entry: Any,
    case: dict[str, Any],
    normalizeReturnPaths: list[str],
) -> None:
    caseId = textValue(case.get("id"))
    arguments = case.get("arguments") if isinstance(case.get("arguments"), list) else []
    values = [argumentValue(root, argument) for argument in arguments if isinstance(argument, dict)]
    expectedException = textValue(case.get("expectedException"))
    try:
        returned = entry(*values)
        if inspect.isawaitable(returned):
            returned = asyncio.run(returned)
    except BaseException as exc:
        if expectedException and type(exc).__name__ == expectedException:
            return
        raise AssertionError(f"{caseId}: unexpected exception {type(exc).__name__}") from exc
    if expectedException:
        raise AssertionError(f"{caseId}: expected exception {expectedException}, got return")
    if "expectedReturn" not in case:
        raise ValueError(f"{caseId}: expectedReturn or expectedException missing")
    actual = normalizeReturnedValue(root, returned, normalizeReturnPaths)
    expected = jsonRoundTrip(case.get("expectedReturn"))
    if actual != expected:
        rel = ref.path.relative_to(CURRICULA_DIR).as_posix()
        raise AssertionError(f"{rel} {caseId}: expected {expected!r}, got {actual!r}")


def argumentValue(root: Path, argument: dict[str, Any]) -> Any:
    if "fixturePath" in argument:
        value = textValue(argument.get("fixturePath"))
        if unsafePath(value):
            raise ValueError(f"unsafe fixturePath: {value}")
        return root / value
    return copy.deepcopy(argument.get("value"))


def normalizeReturnedValue(root: Path, returned: Any, normalizeReturnPaths: list[str]) -> Any:
    if normalizeReturnPaths and isinstance(returned, dict):
        returned = dict(returned)
        for key in normalizeReturnPaths:
            returned[key] = Path(str(returned[key])).resolve().relative_to(root.resolve()).as_posix()
    return jsonRoundTrip(returned)


def jsonRoundTrip(value: Any) -> Any:
    return json.loads(json.dumps(value, ensure_ascii=False))


class preparedFixture:
    def __init__(self, ref: VariantRef, fixture: dict[str, Any], packagePaths: list[str]) -> None:
        self.ref = ref
        self.fixture = fixture
        self.packagePaths = packagePaths
        self.tempdir: tempfile.TemporaryDirectory[str] | None = None
        self.previousCwd: Path | None = None
        self.previousEnv: dict[str, str] | None = None
        self.root: Path | None = None
        self.previousSysPath: list[str] | None = None

    def __enter__(self) -> Path:
        self.tempdir = tempfile.TemporaryDirectory(prefix="codaro-strong-assessment-")
        self.root = Path(self.tempdir.name)
        for directory in self.fixture.get("directories", []):
            directoryText = textValue(directory)
            if unsafePath(directoryText):
                raise ValueError(f"unsafe fixture directory: {directoryText}")
            (self.root / directoryText).mkdir(parents=True, exist_ok=True)
        for item in self.fixture.get("files", []):
            if not isinstance(item, dict):
                continue
            path = textValue(item.get("path"))
            if unsafePath(path):
                raise ValueError(f"unsafe fixture file: {path}")
            target = self.root / path
            target.parent.mkdir(parents=True, exist_ok=True)
            if textValue(item.get("contentBase64")):
                target.write_bytes(base64.b64decode(textValue(item.get("contentBase64")), validate=True))
            else:
                target.write_text(textValue(item.get("content")), encoding="utf-8")
        self.previousCwd = Path.cwd()
        self.previousEnv = dict(os.environ)
        self.previousSysPath = list(sys.path)
        sys.path[:0] = list(reversed(self.packagePaths))
        os.chdir(self.root)
        env = self.fixture.get("env") if isinstance(self.fixture.get("env"), dict) else {}
        os.environ.update({str(key): textValue(value) for key, value in env.items()})
        return self.root

    def __exit__(self, exc_type: object, exc: object, traceback: object) -> None:
        if self.previousCwd is not None:
            os.chdir(self.previousCwd)
        if self.previousEnv is not None:
            os.environ.clear()
            os.environ.update(self.previousEnv)
        if self.previousSysPath is not None:
            sys.path[:] = self.previousSysPath
        if self.tempdir is not None:
            self.tempdir.cleanup()


def verifyExpectedPaths(root: Path, expectedPaths: list[Any]) -> None:
    for item in expectedPaths:
        if not isinstance(item, dict):
            raise ValueError("expectedPath must be an object")
        path = textValue(item.get("path"))
        if unsafePath(path):
            raise ValueError(f"unsafe expected path: {path}")
        target = root / path
        actualKind = "directory" if target.is_dir() else "file" if target.is_file() else "missing"
        expectedKind = textValue(item.get("kind"))
        if expectedKind == "table" and target.is_file():
            shape = tableShape(target, textValue(item.get("format")))
            expectedColumns = item.get("columns")
            if shape is None or not isinstance(expectedColumns, list) or shape[0] != expectedColumns:
                raise AssertionError(f"table {path}: schema does not match expected columns")
            actualKind = "table"
        if expectedKind == "image" and target.is_file():
            shape = imageShape(target)
            expectedShape = (item.get("mediaType"), item.get("width"), item.get("height"))
            if shape != expectedShape:
                raise AssertionError(f"image {path}: media type or dimensions do not match")
            actualKind = "image"
        if actualKind != expectedKind:
            raise AssertionError(f"path {path}: expected {expectedKind}, got {actualKind}")


def fixtureHash(value: dict[str, Any]) -> str:
    digest = hashlib.sha256(stableJson(value).encode("utf-8")).digest()
    return "sha256-" + base64.b64encode(digest).decode("ascii")


def stableJson(value: Any) -> str:
    if isinstance(value, list):
        return "[" + ",".join(stableJson(item) for item in value) + "]"
    if isinstance(value, dict):
        return "{" + ",".join(
            f"{json.dumps(key, ensure_ascii=False)}:{stableJson(value[key])}"
            for key in sorted(value)
        ) + "}"
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def normalizeOutput(value: str) -> str:
    return value.replace("\r\n", "\n").replace("\r", "\n").rstrip("\n")


def unsafePath(value: str) -> bool:
    normalized = value.replace("\\", "/")
    return normalized.startswith("/") or normalized.split("/").count("..") > 0


def failure(ref: VariantRef, detail: str) -> dict[str, str]:
    return {
        "path": ref.path.relative_to(CURRICULA_DIR).as_posix(),
        "mode": ref.mode,
        "variantId": textValue(ref.variant.get("id")),
        "detail": detail,
    }


def textValue(value: Any) -> str:
    return "" if value is None else str(value)


def utcTimestamp() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat()


def displayPath(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


if __name__ == "__main__":
    raise SystemExit(main())
