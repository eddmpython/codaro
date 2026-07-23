from __future__ import annotations

import base64
import os
from pathlib import Path

from fastapi.testclient import TestClient
import pytest
import yaml

from codaro.curriculum import localStrongCheck as localStrongCheckModule
from codaro.curriculum.localStrongCheck import LocalStrongCheckInvalid, fixtureHash, runLocalStrongCheck
from codaro.server import createServerApp


EMPTY_FIXTURE = {
    "directories": [],
    "env": {"LANG": "C.UTF-8", "TZ": "UTC"},
    "files": [],
    "stdin": [],
}


def outputSpec(expected: str, *, timeoutMs: int = 2_000) -> dict[str, object]:
    return {
        "id": "test.local.output.v1",
        "version": 1,
        "kind": "output",
        "strength": "strong",
        "executor": "browser-worker",
        "timeoutMs": timeoutMs,
        "fixtureId": "test.local.output.fixture.v1",
        "fixtureHash": fixtureHash(EMPTY_FIXTURE),
        "fixture": EMPTY_FIXTURE,
        "packageAssets": [],
        "payload": {
            "comparator": "exact",
            "expected": expected,
            "normalization": "trim-final-newline",
        },
    }


def behaviorSpec(tmpFixture: dict[str, object] | None = None) -> dict[str, object]:
    fixture = tmpFixture or EMPTY_FIXTURE
    return {
        "id": "test.local.behavior.v1",
        "version": 1,
        "kind": "behavior",
        "strength": "strong",
        "executor": "browser-worker",
        "timeoutMs": 2_000,
        "fixtureId": "test.local.behavior.fixture.v1",
        "fixtureHash": fixtureHash(fixture),
        "fixture": fixture,
        "packageAssets": [],
        "payload": {
            "entry": "writeUpper",
            "cases": [{
                "id": "report",
                "arguments": [{"fixturePath": "source.txt"}, {"value": "result.txt"}],
                "expectedReturn": "HELLO\nCODARO\n",
            }],
            "expectedPaths": [
                {"path": "source.txt", "kind": "file", "origin": "fixture"},
                {"path": "result.txt", "kind": "file", "origin": "created"},
            ],
            "normalizeReturnPaths": [],
        },
    }


def testLocalStrongOutputCheckSeparatesPassAndMismatch() -> None:
    spec = outputSpec("Hello Codaro")

    passed = runLocalStrongCheck(spec, "print('Hello Codaro')")
    failed = runLocalStrongCheck(spec, "print('Hello World')")

    assert passed["passed"] is True
    assert passed["state"] == "verified"
    assert passed["executor"] == "local-sandbox"
    assert failed["passed"] is False
    assert failed["state"] == "mismatch"


def testLocalStrongBehaviorCheckUsesFixtureAndCreatedPath() -> None:
    fixture = {
        **EMPTY_FIXTURE,
        "files": [{"path": "source.txt", "content": "hello\ncodaro\n"}],
    }
    source = """\
def writeUpper(sourcePath, outputName):
    from pathlib import Path
    content = Path(sourcePath).read_text(encoding="utf-8").upper()
    Path(outputName).write_text(content, encoding="utf-8")
    return content
"""

    result = runLocalStrongCheck(behaviorSpec(fixture), source)

    assert result["passed"] is True
    assert '"path":"result.txt"' in str(result["actual"])
    artifacts = result["artifacts"]
    assert isinstance(artifacts, list)
    created = next(item for item in artifacts if item["origin"] == "created" and item["path"] == "result.txt")
    assert created["byteLength"] == len("HELLO\nCODARO\n".replace("\n", os.linesep).encode("utf-8"))
    assert created["contentHash"].startswith("sha256-")
    assert created["kind"] == "file"


def testLocalStrongBehaviorCheckMaterializesBinaryFixture() -> None:
    payload = bytes([0, 255, 67, 68, 82, 79])
    fixture = {
        **EMPTY_FIXTURE,
        "files": [{"path": "payload.bin", "contentBase64": base64.b64encode(payload).decode("ascii")}],
    }
    spec = behaviorSpec(fixture)
    spec["payload"] = {
        "entry": "readBytes",
        "cases": [{
            "id": "binary",
            "arguments": [{"fixturePath": "payload.bin"}],
            "expectedReturn": [0, 255, 67, 68, 82, 79],
        }],
        "expectedPaths": [{"path": "payload.bin", "kind": "file", "origin": "fixture"}],
        "normalizeReturnPaths": [],
    }
    source = """\
def readBytes(path):
    from pathlib import Path
    return list(Path(path).read_bytes())
"""

    result = runLocalStrongCheck(spec, source)

    assert result["passed"] is True
    artifacts = result["artifacts"]
    assert isinstance(artifacts, list)
    fixtureArtifact = next(item for item in artifacts if item["origin"] == "fixture")
    assert fixtureArtifact["byteLength"] == len(payload)


def testLocalStrongBehaviorCheckAwaitsAsyncEntry() -> None:
    spec = behaviorSpec()
    spec["payload"] = {
        "entry": "collectStatuses",
        "cases": [{
            "id": "async-statuses",
            "arguments": [{"value": ["load-users", "sync-report"]}],
            "expectedReturn": [
                {"name": "load-users", "status": "ok"},
                {"name": "sync-report", "status": "ok"},
            ],
        }],
        "expectedPaths": [],
        "normalizeReturnPaths": [],
    }
    source = """\
import asyncio

async def collectStatuses(names):
    await asyncio.sleep(0)
    return [{"name": name, "status": "ok"} for name in names]
"""

    result = runLocalStrongCheck(spec, source)

    assert result["passed"] is True


def testLocalStrongCheckDoesNotExposeExpectedValuesToStudentFrames() -> None:
    spec = behaviorSpec()
    spec["payload"] = {
        "entry": "canSeeExpectedValues",
        "cases": [{
            "id": "frame-contract",
            "arguments": [{"value": None}],
            "expectedReturn": False,
        }],
        "expectedPaths": [],
        "normalizeReturnPaths": [],
    }
    source = """\
def canSeeExpectedValues(_unused):
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

    result = runLocalStrongCheck(spec, source)

    assert result["passed"] is True


def testLocalStrongCheckBlocksFixtureEscape(tmp_path: Path) -> None:
    secret = tmp_path / "outside.txt"
    secret.write_text("outside-secret", encoding="utf-8")
    spec = behaviorSpec()
    spec["payload"] = {
        "entry": "writeUpper",
        "cases": [{
            "id": "escape",
            "arguments": [{"value": str(secret)}, {"value": "unused"}],
            "expectedReturn": "outside-secret",
        }],
        "expectedPaths": [],
        "normalizeReturnPaths": [],
    }
    source = """\
def writeUpper(path, _unused):
    from pathlib import Path
    return Path(path).read_text(encoding="utf-8")
"""

    result = runLocalStrongCheck(spec, source)

    assert result["passed"] is False
    assert result["state"] == "mismatch"
    assert "PermissionError" in str(result["actual"])


def testLocalStrongCheckTerminatesTimedOutSource() -> None:
    result = runLocalStrongCheck(outputSpec("never", timeoutMs=250), "while True:\n    pass")

    assert result["passed"] is False
    assert result["state"] == "error"
    assert "제한 시간" in str(result["detail"])


def testLocalStrongCheckRetriesOneInfrastructureFailure(monkeypatch: pytest.MonkeyPatch) -> None:
    attempts: list[int] = []

    def runAttempt(*_args: object) -> tuple[dict[str, object], bool]:
        attempts.append(len(attempts) + 1)
        if len(attempts) == 1:
            return {"passed": False, "state": "error"}, True
        return {"passed": True, "state": "verified"}, False

    monkeypatch.setattr(localStrongCheckModule, "runLocalStrongCheckAttempt", runAttempt)

    result = runLocalStrongCheck(outputSpec("Hello"), "print('Hello')")

    assert result == {"passed": True, "state": "verified"}
    assert attempts == [1, 2]


def testLocalStrongCheckDoesNotRetryDeterministicFailure(monkeypatch: pytest.MonkeyPatch) -> None:
    attempts: list[int] = []

    def runAttempt(*_args: object) -> tuple[dict[str, object], bool]:
        attempts.append(len(attempts) + 1)
        return {"passed": False, "state": "mismatch"}, False

    monkeypatch.setattr(localStrongCheckModule, "runLocalStrongCheckAttempt", runAttempt)

    result = runLocalStrongCheck(outputSpec("Hello"), "print('World')")

    assert result == {"passed": False, "state": "mismatch"}
    assert attempts == [1]


def testLocalStrongCheckRejectsNetworkAndDynamicCode() -> None:
    for source in (
        "import requests\nprint('not allowed')",
        "import subprocess\nprint('not allowed')",
        "import urllib\nprint('not allowed')",
        "import urllib.request\nprint('not allowed')",
        "from urllib import request\nprint('not allowed')",
        "from urllib.request import urlopen\nprint('not allowed')",
        "exec(\"print('not allowed')\")",
    ):
        try:
            runLocalStrongCheck(outputSpec("not allowed"), source)
        except LocalStrongCheckInvalid as error:
            assert "허용하지 않는" in str(error)
        else:
            raise AssertionError(f"unsafe source was accepted: {source}")


def testLocalStrongCheckAllowsPureUrlParsing() -> None:
    source = """\
from urllib.parse import urlencode, urlparse

parsed = urlparse("https://codaro.example.com/learn?lesson=urllib")
print(parsed.scheme)
print(urlencode({"lesson": "urllib", "mode": "web run"}))
"""

    result = runLocalStrongCheck(outputSpec("https\nlesson=urllib&mode=web+run"), source)

    assert result["passed"] is True


def testLocalStrongCheckApiUsesCanonicalDayOneSpec(tmp_path: Path) -> None:
    lessonPath = next((Path("curricula/python/basics/30days")).glob("day01_*.yaml"))
    content = yaml.safe_load(lessonPath.read_text(encoding="utf-8"))
    spec = content["sections"][0]["check"]
    with TestClient(createServerApp(workspaceRoot=tmp_path)) as client:
        response = client.post(
            "/api/curriculum/check/strong/local",
            json={"checkSpec": spec, "source": "print('Hello Codaro')"},
        )

    assert response.status_code == 200
    assert response.json()["executor"] == "local-sandbox"
    assert response.json()["passed"] is True


def testLocalStrongCheckApiRejectsTamperedFixtureHash(tmp_path: Path) -> None:
    spec = outputSpec("Hello")
    spec["fixtureHash"] = "sha256-tampered"
    with TestClient(createServerApp(workspaceRoot=tmp_path)) as client:
        response = client.post(
            "/api/curriculum/check/strong/local",
            json={"checkSpec": spec, "source": "print('Hello')"},
        )

    assert response.status_code == 400
    assert response.json()["error"]["code"] == "curriculum-local-strong-check-invalid"


@pytest.mark.parametrize(
    "relativePath",
    [
        "automation/os/fileOps/01_pathlib경로감각.yaml",
        "automation/os/fileOps/06_zip압축.yaml",
        "automation/os/watchSched/05_schedule간단스케줄.yaml",
    ],
)
def testW0AutomationSolutionsPassNativeSandbox(relativePath: str) -> None:
    lessonPath = Path("curricula/python") / relativePath
    content = yaml.safe_load(lessonPath.read_text(encoding="utf-8"))
    checked = 0
    for section in content["sections"]:
        check = section.get("check")
        exercise = section.get("exercise")
        if not isinstance(check, dict) or check.get("strength") != "strong" or not isinstance(exercise, dict):
            continue
        result = runLocalStrongCheck(check, exercise["solution"])
        assert result["passed"] is True, f"{relativePath} {section.get('id')}: {result}"
        assert result["executor"] == "local-sandbox"
        checked += 1
    assert checked == 4
