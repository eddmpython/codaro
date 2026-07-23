from __future__ import annotations

import os
from pathlib import Path

from codaro.curriculum.localStrongCheck import fixtureHash, runLocalStrongCheck


EMPTY_FIXTURE = {
    "directories": [],
    "env": {"LANG": "C.UTF-8", "TZ": "UTC"},
    "files": [],
    "stdin": [],
}


def checkSpec(kind: str, payload: dict[str, object], *, fixture: dict[str, object] | None = None) -> dict[str, object]:
    resolvedFixture = fixture or EMPTY_FIXTURE
    return {
        "id": f"test.artifact.{kind}.v1",
        "version": 1,
        "kind": kind,
        "strength": "strong",
        "executor": "browser-worker",
        "timeoutMs": 2_000,
        "fixtureId": f"test.artifact.{kind}.fixture.v1",
        "fixtureHash": fixtureHash(resolvedFixture),
        "fixture": resolvedFixture,
        "packageAssets": [],
        "payload": payload,
    }


def testVariableCheckRunsWithoutExpectedValueInStudentFrames() -> None:
    spec = checkSpec("variable", {"name": "expected_is_visible", "expected": False})
    source = """\
import inspect


def frame_has_expected_value(frame):
    while frame is not None:
        for value in frame.f_locals.values():
            if isinstance(value, dict):
                payload = value.get("payload")
                if isinstance(payload, dict) and "expected" in payload:
                    return True
        frame = frame.f_back
    return False


expected_is_visible = frame_has_expected_value(inspect.currentframe())
"""

    result = runLocalStrongCheck(spec, source)

    assert result["passed"] is True
    assert result["actual"] == '{"exists":true,"value":false}'


def testVariableCheckSeparatesMissingAndMismatchedValues() -> None:
    spec = checkSpec("variable", {"name": "summary", "expected": {"count": 2, "total": 7}})

    matched = runLocalStrongCheck(spec, "summary = {'count': 2, 'total': 7}")
    mismatched = runLocalStrongCheck(spec, "summary = {'count': 2, 'total': 8}")
    missing = runLocalStrongCheck(spec, "other = 7")

    assert matched["passed"] is True
    assert mismatched["passed"] is False
    assert mismatched["state"] == "mismatch"
    assert missing["passed"] is False
    assert missing["actual"] == '{"exists":false,"value":null}'


def testBehaviorCheckReturnsSealedFileAndDirectoryDescriptors() -> None:
    fixture = {
        **EMPTY_FIXTURE,
        "directories": ["output"],
        "files": [{"path": "source.txt", "content": "hello\n"}],
    }
    spec = checkSpec(
        "behavior",
        {
            "entry": "buildArtifact",
            "cases": [{
                "id": "build",
                "arguments": [{"fixturePath": "source.txt"}, {"value": "output/result.txt"}],
                "expectedReturn": "HELLO\n",
            }],
            "expectedPaths": [
                {"path": "source.txt", "kind": "file", "origin": "fixture"},
                {"path": "output", "kind": "directory", "origin": "fixture"},
                {"path": "output/result.txt", "kind": "file", "origin": "created"},
            ],
            "normalizeReturnPaths": [],
        },
        fixture=fixture,
    )
    source = """\
def buildArtifact(source_path, output_path):
    from pathlib import Path
    content = Path(source_path).read_text(encoding="utf-8").upper()
    Path(output_path).write_text(content, encoding="utf-8")
    return content
"""

    result = runLocalStrongCheck(spec, source)

    assert result["passed"] is True
    artifacts = result["artifacts"]
    assert isinstance(artifacts, list)
    byPath = {str(item["path"]): item for item in artifacts}
    assert set(byPath) == {"output", "output/result.txt", "source.txt"}
    assert byPath["output"]["fileCount"] == 1
    assert byPath["output/result.txt"]["byteLength"] == len(f"HELLO{os.linesep}".encode())
    assert all(str(item["contentHash"]).startswith("sha256-") for item in artifacts)
    assert all(item["schemaVersion"] == 1 for item in artifacts)


def testBehaviorCheckDoesNotReturnDescriptorForMissingCreatedPath(tmp_path: Path) -> None:
    spec = checkSpec(
        "behavior",
        {
            "entry": "doNothing",
            "cases": [{"id": "noop", "arguments": [{"value": None}], "expectedReturn": None}],
            "expectedPaths": [{"path": "missing.txt", "kind": "file", "origin": "created"}],
            "normalizeReturnPaths": [],
        },
    )

    result = runLocalStrongCheck(spec, "def doNothing(_value):\n    return None")

    assert result["passed"] is False
    assert result["artifacts"] == []
    assert not (tmp_path / "missing.txt").exists()


def testBehaviorCheckReturnsSemanticTableDescriptors() -> None:
    spec = checkSpec(
        "behavior",
        {
            "entry": "buildTables",
            "cases": [{"id": "build", "arguments": [{"value": "output"}], "expectedReturn": 2}],
            "expectedPaths": [
                {"path": "output/report.csv", "kind": "table", "origin": "created", "format": "csv", "columns": ["course", "score"]},
                {"path": "output/report.json", "kind": "table", "origin": "created", "format": "json", "columns": ["course", "score"]},
            ],
            "normalizeReturnPaths": [],
        },
    )
    source = """\
def buildTables(output_dir):
    import csv
    import json
    from pathlib import Path
    root = Path(output_dir)
    root.mkdir(parents=True, exist_ok=True)
    rows = [{"course": "python", "score": 91}, {"course": "data", "score": 88}]
    with (root / "report.csv").open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=["course", "score"])
        writer.writeheader()
        writer.writerows(rows)
    (root / "report.json").write_text(json.dumps(rows), encoding="utf-8")
    return len(rows)
"""

    result = runLocalStrongCheck(spec, source)

    assert result["passed"] is True
    byPath = {str(item["path"]): item for item in result["artifacts"]}
    assert byPath["output/report.csv"] == {
        **{key: byPath["output/report.csv"][key] for key in ("byteLength", "contentHash")},
        "columnCount": 2,
        "columns": ["course", "score"],
        "format": "csv",
        "kind": "table",
        "origin": "created",
        "path": "output/report.csv",
        "rowCount": 2,
        "schemaVersion": 1,
    }
    assert byPath["output/report.json"]["columns"] == ["course", "score"]
    assert byPath["output/report.json"]["rowCount"] == 2
    assert "fileCount" not in byPath["output/report.json"]


def testBehaviorCheckReturnsSemanticImageDescriptor() -> None:
    spec = checkSpec(
        "behavior",
        {
            "entry": "buildImage",
            "cases": [{"id": "build", "arguments": [{"value": "chart.png"}], "expectedReturn": "chart.png"}],
            "expectedPaths": [{
                "path": "chart.png",
                "kind": "image",
                "origin": "created",
                "mediaType": "image/png",
                "width": 1,
                "height": 1,
            }],
            "normalizeReturnPaths": [],
        },
    )
    source = """\
def buildImage(output_path):
    import base64
    from pathlib import Path
    png = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=")
    Path(output_path).write_bytes(png)
    return output_path
"""

    result = runLocalStrongCheck(spec, source)

    assert result["passed"] is True
    assert result["artifacts"][0]["kind"] == "image"
    assert result["artifacts"][0]["mediaType"] == "image/png"
    assert result["artifacts"][0]["width"] == 1
    assert result["artifacts"][0]["height"] == 1
    assert "fileCount" not in result["artifacts"][0]


def testBehaviorCheckRejectsMalformedSemanticArtifacts() -> None:
    spec = checkSpec(
        "behavior",
        {
            "entry": "buildBrokenArtifacts",
            "cases": [{"id": "build", "arguments": [{"value": None}], "expectedReturn": None}],
            "expectedPaths": [
                {"path": "broken.csv", "kind": "table", "origin": "created", "format": "csv", "columns": ["name", "score"]},
                {"path": "broken.png", "kind": "image", "origin": "created", "mediaType": "image/png", "width": 1, "height": 1},
            ],
            "normalizeReturnPaths": [],
        },
    )
    source = """\
def buildBrokenArtifacts(_value):
    from pathlib import Path
    Path("broken.csv").write_text("name,score\\npython\\n", encoding="utf-8")
    Path("broken.png").write_bytes(b"not-an-image")
"""

    result = runLocalStrongCheck(spec, source)

    assert result["passed"] is False
    assert result["artifacts"] == []
