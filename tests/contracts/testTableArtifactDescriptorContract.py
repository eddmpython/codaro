from __future__ import annotations

import json
from pathlib import Path


SCHEMA_PATH = Path(__file__).resolve().parents[2] / "contracts" / "tableArtifactDescriptor.schema.json"


def testTableArtifactSchemaRequiresShapeAndContentIdentity() -> None:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    required = set(schema["required"])
    properties = schema["properties"]

    assert required == {
        "schemaVersion",
        "kind",
        "origin",
        "path",
        "format",
        "byteLength",
        "contentHash",
        "rowCount",
        "columnCount",
        "columns",
    }
    assert properties["format"]["enum"] == ["csv", "json"]
    assert properties["columns"]["uniqueItems"] is True
    assert properties["columns"]["minItems"] == 1
