from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCHEMA_PATH = ROOT / "contracts" / "learningArchive.schema.json"


def loadSchema() -> dict[str, object]:
    return json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))


def testLearningArchiveContractIsClosedAndVersioned() -> None:
    schema = loadSchema()

    assert schema["$schema"] == "https://json-schema.org/draft/2020-12/schema"
    assert schema["additionalProperties"] is False
    assert schema["properties"]["kind"] == {"const": "codaro.learning-archive"}
    assert schema["properties"]["schemaVersion"] == {"const": 2}

    definitions = schema["$defs"]
    closedObjects = {
        "AutomationDraft",
        "Blob",
        "DocumentRef",
        "DraftRef",
        "EvidenceRef",
        "Lineage",
        "Manifest",
        "PackageRef",
        "TaskDefaults",
        "VirtualFsDirectory",
        "VirtualFsFile",
    }
    assert all(definitions[name]["additionalProperties"] is False for name in closedObjects)


def testLearningArchiveContractRequiresActualBytesAndSafeDraftState() -> None:
    schema = loadSchema()
    definitions = schema["$defs"]

    assert set(definitions["Blob"]["required"]) == {"encoding", "byteLength", "mediaType", "payload"}
    assert definitions["Blob"]["properties"]["encoding"] == {"const": "base64url"}
    assert definitions["AutomationDraft"]["properties"]["confirmation"] == {"const": "required"}
    assert definitions["AutomationDraft"]["properties"]["sideEffectPolicy"] == {
        "const": "blocked-until-explicit-confirmation"
    }
    assert definitions["TaskDefaults"]["properties"] == {
        "enabled": {"const": False},
        "schedule": {"type": "null"},
    }
    assert definitions["Manifest"]["properties"]["importMode"] == {"const": "atomic-head-swap"}
    assert definitions["EvidenceRef"]["properties"]["eventCount"]["minimum"] == 0
    assert "minItems" not in definitions["EvidenceRef"]["properties"]["eventIds"]
    assert "minItems" not in definitions["Lineage"]["properties"]["evidenceEventIds"]
