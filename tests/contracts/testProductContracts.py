from __future__ import annotations

import hashlib
import importlib.util
from pathlib import Path
from types import ModuleType

import yaml

from codaro.generatedContracts import ARTIFACT_OWNERSHIP_CONTRACT_SHA256, ARTIFACT_OWNERSHIP_OWNERS_SHA256


ROOT = Path(__file__).resolve().parents[2]
GENERATOR_PATH = ROOT / "docs" / "skills" / "ops" / "tools" / "genProductContracts.py"
SCHEMA_PATH = ROOT / "contracts" / "artifactOwnership.schema.json"
OWNERS_PATH = ROOT / "contracts" / "artifactOwners.yml"


def loadGenerator() -> ModuleType:
    spec = importlib.util.spec_from_file_location("genProductContractsUnderTest", GENERATOR_PATH)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def testGeneratedContractHashesMatchRootSources() -> None:
    assert ARTIFACT_OWNERSHIP_CONTRACT_SHA256 == sha256(SCHEMA_PATH)
    assert ARTIFACT_OWNERSHIP_OWNERS_SHA256 == sha256(OWNERS_PATH)


def testGeneratedContractFilesAreFresh() -> None:
    generator = loadGenerator()

    assert generator.generate(check=True) == []


def testEveryOwnedSurfacePathExistsAndIsUnique() -> None:
    payload = yaml.safe_load(OWNERS_PATH.read_text(encoding="utf-8"))
    artifacts = payload["artifacts"]
    surfacePaths = [surfacePath for artifact in artifacts for surfacePath in artifact["surfacePaths"]]

    assert len(surfacePaths) == len(set(surfacePaths))
    assert all((ROOT / surfacePath).is_file() for surfacePath in surfacePaths)
