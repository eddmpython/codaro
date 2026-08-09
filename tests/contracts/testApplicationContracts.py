from __future__ import annotations

import hashlib
import json
from pathlib import Path

from codaro.generatedContracts import (
    APP_LAYOUTS,
    APP_SPEC_CONTRACT_SHA256,
    APP_STATE_POLICIES,
    EXECUTABLE_UNIT_CONTRACT_SHA256,
    RUNTIME_TARGETS,
    AppSpec,
    ExecutableUnitSpec,
)


ROOT = Path(__file__).resolve().parents[2]
APP_SCHEMA = ROOT / "contracts" / "appSpec.schema.json"
UNIT_SCHEMA = ROOT / "contracts" / "executableUnit.schema.json"


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def testApplicationContractHashesMatchCanonicalSchemas() -> None:
    assert APP_SPEC_CONTRACT_SHA256 == _sha256(APP_SCHEMA)
    assert EXECUTABLE_UNIT_CONTRACT_SHA256 == _sha256(UNIT_SCHEMA)


def testAppSpecSchemaAndGeneratedPythonTypeHaveExactFields() -> None:
    schema = json.loads(APP_SCHEMA.read_text(encoding="utf-8"))
    expected = {
        "schemaVersion",
        "title",
        "layout",
        "hideCode",
        "entryBlockIds",
        "statePolicy",
    }

    assert schema["additionalProperties"] is False
    assert set(schema["required"]) == expected
    assert set(schema["properties"]) == expected
    assert AppSpec.__required_keys__ == frozenset(expected)
    assert tuple(schema["properties"]["layout"]["enum"]) == APP_LAYOUTS
    assert tuple(schema["properties"]["statePolicy"]["enum"]) == APP_STATE_POLICIES


def testExecutableUnitSchemaAndGeneratedPythonTypeHaveExactFields() -> None:
    schema = json.loads(UNIT_SCHEMA.read_text(encoding="utf-8"))
    expected = {
        "schemaVersion",
        "unitId",
        "entryBlockId",
        "dependencyBlockIds",
        "inputSchema",
        "outputSchema",
        "effects",
        "statePolicy",
        "runtimeTarget",
        "sourceSpan",
        "sourceHash",
        "dependencyHash",
        "assetHashes",
        "checkScenarioIds",
        "evidenceReceiptIds",
        "diagnostics",
    }

    assert schema["additionalProperties"] is False
    assert set(schema["required"]) == expected
    assert set(schema["properties"]) == expected
    assert ExecutableUnitSpec.__required_keys__ == frozenset(expected)
    assert tuple(schema["$defs"]["RuntimeTarget"]["enum"]) == RUNTIME_TARGETS
    assert set(schema["$defs"]["CapabilityDiagnostic"]["required"]) == {
        "blockId",
        "code",
        "message",
        "severity",
        "sourceSpan",
    }


def testGeneratedTypeScriptContractsExposeEveryCanonicalField() -> None:
    appSource = (ROOT / "editor/src/lib/generatedContracts/appSpec.ts").read_text(encoding="utf-8")
    unitSource = (ROOT / "editor/src/lib/generatedContracts/executableUnit.ts").read_text(encoding="utf-8")

    for field in AppSpec.__required_keys__:
        assert f"{field}:" in appSource
    for field in ExecutableUnitSpec.__required_keys__:
        assert f"{field}:" in unitSource
