from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[2]
BUILDER_PATH = ROOT / "docs" / "skills" / "ops" / "tools" / "buildReleaseManifest.py"
COMPATIBILITY_PATH = ROOT / "launcher" / "releaseCompatibility.json"


def loadBuilder():
    spec = importlib.util.spec_from_file_location("codaroReleaseManifestBuilder", BUILDER_PATH)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def builderArgs(tmp_path: Path, output: Path) -> list[str]:
    runtime = tmp_path / "python-runtime-win-x64.zip"
    runtime.write_bytes(b"managed runtime")
    return [
        "--tag",
        "v0.0.13",
        "--backend-wheel-url",
        "https://example.test/codaro-0.0.13-py3-none-any.whl",
        "--backend-sha256",
        "a" * 64,
        "--python-runtime-version",
        "3.12.12",
        "--python-runtime-archive",
        str(runtime),
        "--output",
        str(output),
    ]


def testReleaseManifestUsesCompatibilityFloorSsot(tmp_path: Path) -> None:
    builder = loadBuilder()
    output = tmp_path / "release-manifest.json"

    assert builder.main(builderArgs(tmp_path, output)) == 0

    manifest = json.loads(output.read_text(encoding="utf-8"))
    compatibility = json.loads(COMPATIBILITY_PATH.read_text(encoding="utf-8"))
    assert manifest["minLauncherVersion"] == compatibility["minLauncherVersion"]
    assert manifest["minLauncherVersion"] != manifest["launcherVersion"]


def testReleaseManifestRejectsMinimumNewerThanLauncher(tmp_path: Path) -> None:
    builder = loadBuilder()
    output = tmp_path / "release-manifest.json"
    args = [
        *builderArgs(tmp_path, output),
        "--launcher-version",
        "1.2.3",
        "--min-launcher-version",
        "1.2.4",
    ]

    with pytest.raises(ValueError, match="cannot exceed launcher version"):
        builder.main(args)
