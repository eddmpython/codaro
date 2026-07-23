from __future__ import annotations

import json
from pathlib import Path


SCHEMA_PATH = Path(__file__).resolve().parents[2] / "contracts" / "imageArtifactDescriptor.schema.json"


def testImageArtifactSchemaRequiresDecodedDimensions() -> None:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    required = set(schema["required"])
    properties = schema["properties"]

    assert {"mediaType", "width", "height", "contentHash"} <= required
    assert properties["mediaType"]["enum"] == [
        "image/png",
        "image/jpeg",
        "image/gif",
    ]
    assert properties["width"]["minimum"] == 1
    assert properties["height"]["minimum"] == 1
