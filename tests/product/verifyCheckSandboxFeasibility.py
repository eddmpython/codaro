from __future__ import annotations

from datetime import UTC, datetime
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import time
from typing import Any

from codaro.curriculum.localStrongCheck import (
    LocalStrongCheckInvalid,
    fixtureHash,
    runLocalStrongCheck,
    runtimeCheckPayload,
    validateLocalStrongCheck,
)


ROOT = Path(__file__).resolve().parents[2]
FIXTURE_PATH = ROOT / "tests/curriculum/fixtures/checkSandbox/shared-student-expected-namespace.json"
REPORT_PATH = ROOT / "output/test-runner/check-sandbox-feasibility/check-sandbox-feasibility-report.json"
BROWSER_EXECUTOR_PATH = ROOT / "editor/src/lib/browserLearningCheckExecutor.ts"
PRODUCT_BROWSER_PATH = ROOT / "tests/surface/verifyProductExperiencePlaywright.py"
PRODUCT_BROWSER_REPORT_PATH = ROOT / "output/test-runner/check-sandbox-feasibility/product-experience-report.json"
EMPTY_FIXTURE = {
    "directories": [],
    "env": {"LANG": "C.UTF-8", "TZ": "UTC"},
    "files": [],
    "stdin": [],
}


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def outputSpec(expected: str, *, timeoutMs: int = 2_000) -> dict[str, Any]:
    return {
        "id": "audit.sandbox.output.v1",
        "version": 1,
        "kind": "output",
        "strength": "strong",
        "executor": "browser-worker",
        "timeoutMs": timeoutMs,
        "fixtureId": "audit.sandbox.output.fixture.v1",
        "fixtureHash": fixtureHash(EMPTY_FIXTURE),
        "fixture": EMPTY_FIXTURE,
        "packageAssets": [],
        "payload": {
            "comparator": "exact",
            "expected": expected,
            "normalization": "trim-final-newline",
        },
    }


def behaviorSpec(expectedReturn: Any) -> dict[str, Any]:
    return {
        "id": "audit.sandbox.behavior.v1",
        "version": 1,
        "kind": "behavior",
        "strength": "strong",
        "executor": "browser-worker",
        "timeoutMs": 2_000,
        "fixtureId": "audit.sandbox.behavior.fixture.v1",
        "fixtureHash": fixtureHash(EMPTY_FIXTURE),
        "fixture": EMPTY_FIXTURE,
        "packageAssets": [],
        "payload": {
            "entry": "probe",
            "cases": [{
                "id": "probe",
                "arguments": [{"value": None}],
                "expectedReturn": expectedReturn,
            }],
            "expectedPaths": [],
            "normalizeReturnPaths": [],
        },
    }


def containsExpectedValueKeys(value: Any) -> bool:
    if isinstance(value, dict):
        if "expectedReturn" in value or "expectedException" in value or "expected" in value:
            return True
        return any(containsExpectedValueKeys(item) for item in value.values())
    if isinstance(value, list):
        return any(containsExpectedValueKeys(item) for item in value)
    return False


def rejectSharedNamespaceFixture() -> dict[str, Any]:
    fixture = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
    candidate = fixture.get("candidate")
    expectedFailure = fixture.get("expectedFailure")
    rejected = (
        isinstance(candidate, dict)
        and candidate.get("studentAndExpectedShareRuntimePayload") is True
        and isinstance(candidate.get("workerPayloadKeys"), list)
        and any(key in candidate["workerPayloadKeys"] for key in ("expectedReturn", "expectedException"))
    )
    if not rejected or not isinstance(expectedFailure, dict) or expectedFailure.get("code") != "shared-student-expected-namespace":
        raise ValueError("shared student/expected namespace negative fixture was not rejected")
    return {
        "expectedFailure": expectedFailure["code"],
        "path": FIXTURE_PATH.relative_to(ROOT).as_posix(),
        "rejected": True,
    }


def verifyLocalSandbox() -> dict[str, Any]:
    first = runLocalStrongCheck(
        outputSpec("set"),
        "import builtins\nbuiltins.CODARO_SANDBOX_SENTINEL = 'set'\nprint('set')",
    )
    second = runLocalStrongCheck(
        outputSpec("False"),
        "import builtins\nprint(hasattr(builtins, 'CODARO_SANDBOX_SENTINEL'))",
    )
    if first.get("passed") is not True or second.get("passed") is not True:
        raise ValueError("Local check processes reused a mutable Python namespace")

    expectationSpec = behaviorSpec(False)
    normalized = validateLocalStrongCheck(expectationSpec, "def probe(_value):\n    return False")
    runtimePayload = runtimeCheckPayload(normalized)
    if containsExpectedValueKeys(runtimePayload):
        raise ValueError("Local worker payload still exposes expected values")

    frameProbe = """\
def probe(_unused):
    import inspect

    def has_expected_key(value, seen):
        identity = id(value)
        if identity in seen:
            return False
        seen.add(identity)
        if isinstance(value, dict):
            if "expected" + "Return" in value or "expected" + "Exception" in value:
                return True
            return any(has_expected_key(item, seen) for item in value.values())
        if isinstance(value, (list, tuple)):
            return any(has_expected_key(item, seen) for item in value)
        return False

    frame = inspect.currentframe().f_back
    while frame is not None:
        if has_expected_key(frame.f_locals, set()):
            return True
        frame = frame.f_back
    return False
"""
    frameResult = runLocalStrongCheck(expectationSpec, frameProbe)
    if frameResult.get("passed") is not True:
        raise ValueError("student frame introspection reached Local expected values")

    rejectedSources = 0
    for source in (
        "import socket\nprint('network')",
        "import subprocess\nprint('child')",
        "exec(\"print('dynamic')\")",
    ):
        try:
            runLocalStrongCheck(outputSpec("blocked"), source)
        except LocalStrongCheckInvalid:
            rejectedSources += 1
    if rejectedSources != 3:
        raise ValueError("Local sandbox accepted a forbidden source capability")

    timeoutResult = runLocalStrongCheck(outputSpec("never", timeoutMs=250), "while True:\n    pass")
    if timeoutResult.get("state") != "error" or "제한 시간" not in str(timeoutResult.get("detail")):
        raise ValueError("Local sandbox timeout did not terminate the worker")

    with tempfile.TemporaryDirectory(prefix="codaro-sandbox-audit-") as directory:
        outside = Path(directory) / "outside.txt"
        outside.write_text("outside", encoding="utf-8")
        escapeSpec = behaviorSpec("outside")
        escapeSpec["payload"]["cases"][0]["arguments"] = [{"value": str(outside)}]
        escapeResult = runLocalStrongCheck(
            escapeSpec,
            "def probe(path):\n    from pathlib import Path\n    return Path(path).read_text(encoding='utf-8')",
        )
    if escapeResult.get("passed") is not False or "PermissionError" not in str(escapeResult.get("actual")):
        raise ValueError("Local sandbox read outside its fixture root")

    return {
        "forbiddenSourcesRejected": rejectedSources,
        "freshProcessNamespace": True,
        "fixtureEscapeRejected": True,
        "isolationModel": "isolated-python-process-with-audit-hook",
        "osAppContainer": False,
        "studentExpectedPayloadSeparated": True,
        "timeoutTerminated": True,
    }


def verifyBrowserSandbox() -> dict[str, Any]:
    source = BROWSER_EXECUTOR_PATH.read_text(encoding="utf-8")
    required = (
        "new Worker(workerUrl",
        "worker?.terminate()",
        "runtimeBehaviorPayload(spec.payload)",
        "verifyAsset(file)",
        "crypto.subtle.digest(\"SHA-256\"",
        "forbidden_imports",
    )
    missing = [token for token in required if token not in source]
    if missing:
        raise ValueError("browser sandbox contract is incomplete: " + ", ".join(missing))
    runtimeStart = source.index("function runtimeBehaviorPayload")
    runtimeEnd = source.index("async function verifiedProcessWorkerUrl", runtimeStart)
    runtimeSource = source[runtimeStart:runtimeEnd]
    if "expectedReturn" in runtimeSource or "expectedException" in runtimeSource:
        raise ValueError("browser worker runtime payload still exposes expected values")

    command = (
        "uv", "run", "--with", "playwright", "python", "-X", "utf8",
        str(PRODUCT_BROWSER_PATH.relative_to(ROOT)),
    )
    environment = os.environ.copy()
    environment["CODARO_PRODUCT_CASE"] = "web-pathlib-assessment-progression-desktop"
    environment["CODARO_PRODUCT_REPORT_PATH"] = str(PRODUCT_BROWSER_REPORT_PATH.relative_to(ROOT))
    result = subprocess.run(
        command,
        cwd=ROOT,
        env=environment,
        capture_output=True,
        text=True,
        timeout=600,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()[-1_200:]
        raise ValueError(f"browser sandbox progression failed: {detail}")
    report = json.loads(PRODUCT_BROWSER_REPORT_PATH.read_text(encoding="utf-8"))
    cases = report.get("cases")
    if not isinstance(cases, list) or len(cases) != 1 or cases[0].get("failures"):
        raise ValueError("browser sandbox report does not contain one passing progression case")
    audit = cases[0].get("audit")
    if not isinstance(audit, dict) or audit.get("webStrongEvidenceEventCount") != 2:
        raise ValueError("browser sandbox did not store mastery and delayed retrieval evidence")
    return {
        "browser": report.get("browser"),
        "case": cases[0].get("name"),
        "freshWorkerPerCheck": True,
        "integrityCheckedModuleGraph": True,
        "isolationModel": "fresh-integrity-checked-module-worker",
        "opaqueOriginFrame": False,
        "studentExpectedPayloadSeparated": True,
    }


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    facts: dict[str, Any] = {}
    try:
        facts["negativeFixture"] = rejectSharedNamespaceFixture()
        facts["local"] = verifyLocalSandbox()
        facts["browser"] = verifyBrowserSandbox()
    except (OSError, ValueError, subprocess.SubprocessError) as error:
        failures.append(str(error))
    completionBlockers = [
        "browser opaque-origin iframe and three-engine capability matrix are absent",
        "Windows AppContainer, restricted token, Job Object, and broker probe are absent",
        "independent runtime-security review is absent",
    ]
    payload = {
        "schemaVersion": 1,
        "audit": "check-sandbox-feasibility",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "machineEligible": not failures,
        "completionEligible": False,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "facts": facts,
        "completionBlockers": completionBlockers,
        "failures": failures,
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        print("FAIL: check sandbox feasibility audit failed", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    print("ok: check sandbox supported subset verified (completionEligible=false)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
