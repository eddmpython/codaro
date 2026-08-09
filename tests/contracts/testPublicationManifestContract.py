from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def testPublicationManifestContractIsOwnedAndGeneratedOnBothSurfaces() -> None:
    schemaPath = ROOT / "contracts/publicationManifest.schema.json"
    schema = json.loads(schemaPath.read_text(encoding="utf-8"))
    owners = (ROOT / "contracts/artifactOwners.yml").read_text(encoding="utf-8")
    python = (ROOT / "src/codaro/generatedContracts/publicationManifest.py").read_text(encoding="utf-8")
    typescript = (ROOT / "editor/src/lib/generatedContracts/publicationManifest.ts").read_text(encoding="utf-8")

    assert schema["properties"]["schemaVersion"]["const"] == 1
    assert schema["additionalProperties"] is False
    assert "contracts/publicationManifest.schema.json" in owners
    assert "class PublicationManifest(TypedDict)" in python
    assert "export type PublicationManifest" in typescript
