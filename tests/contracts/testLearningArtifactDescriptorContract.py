from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CONTRACT_ROOT = ROOT / "contracts"


def loadSchema(name: str) -> dict[str, object]:
    return json.loads((CONTRACT_ROOT / name).read_text(encoding="utf-8"))


def testLearningArtifactUnionReferencesSemanticContracts() -> None:
    schema = loadSchema("learningArtifactDescriptor.schema.json")

    assert schema["$schema"] == "https://json-schema.org/draft/2020-12/schema"
    assert schema["oneOf"] == [
        {"$ref": "#/$defs/FileSystemArtifact"},
        {"$ref": "tableArtifactDescriptor.schema.json"},
        {"$ref": "imageArtifactDescriptor.schema.json"},
    ]
