from __future__ import annotations

import importlib.util
from pathlib import Path
import sys
from types import ModuleType

import pytest


ROOT = Path(__file__).resolve().parents[2]
VERIFIER_PATH = ROOT / "tests/product/verifyReleaseResearchOperations.py"


def loadVerifier() -> ModuleType:
    spec = importlib.util.spec_from_file_location(
        "verifyReleaseResearchOperationsUnderTest",
        VERIFIER_PATH,
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def testPreserveDirectoriesRestoresExistingAndMissingTrees(tmp_path: Path) -> None:
    verifier = loadVerifier()
    existing = tmp_path / "static/run"
    missing = tmp_path / "static/app"
    existing.mkdir(parents=True)
    (existing / "original.bin").write_bytes(b"\x00original")

    with verifier.preserveDirectories(
        (existing, missing),
        tmp_path / "backup",
        allowedRoot=tmp_path,
    ):
        (existing / "original.bin").write_bytes(b"changed")
        (existing / "generated.js").write_text("generated", encoding="utf-8")
        missing.mkdir(parents=True)
        (missing / "index.html").write_text("temporary", encoding="utf-8")

    assert (existing / "original.bin").read_bytes() == b"\x00original"
    assert not (existing / "generated.js").exists()
    assert not missing.exists()


def testPreserveDirectoriesRestoresAfterFailure(tmp_path: Path) -> None:
    verifier = loadVerifier()
    staticTree = tmp_path / "static/run"
    staticTree.mkdir(parents=True)
    (staticTree / "index.html").write_text("before", encoding="utf-8")

    with pytest.raises(RuntimeError, match="build failed"):
        with verifier.preserveDirectories(
            (staticTree,),
            tmp_path / "backup",
            allowedRoot=tmp_path,
        ):
            (staticTree / "index.html").write_text("during", encoding="utf-8")
            raise RuntimeError("build failed")

    assert (staticTree / "index.html").read_text(encoding="utf-8") == "before"
