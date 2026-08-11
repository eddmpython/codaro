from __future__ import annotations

import hashlib
import json
from pathlib import Path

from codaro.generatedContracts import (
    APP_LAYOUTS,
    APP_SPEC_CONTRACT_SHA256,
    APP_STATE_POLICIES,
    EXECUTABLE_UNIT_CONTRACT_SHA256,
    REFERENCE_CLAIM_BOUNDARIES,
    REFERENCE_EMBED_MODES,
    REFERENCE_PRODUCTS_CONTRACT_SHA256,
    REFERENCE_PUBLICATION_STEPS,
    REFERENCE_RUNTIME_TARGETS,
    RUNTIME_TARGETS,
    AppSpec,
    ExecutableUnitSpec,
    ReferenceProduct,
    ReferenceProductJourney,
    ReferenceProductsManifest,
)


ROOT = Path(__file__).resolve().parents[2]
APP_SCHEMA = ROOT / "contracts" / "appSpec.schema.json"
UNIT_SCHEMA = ROOT / "contracts" / "executableUnit.schema.json"
REFERENCE_PRODUCTS_SCHEMA = ROOT / "contracts" / "referenceProducts.schema.json"
REFERENCE_PRODUCTS_MANIFEST = ROOT / "examples" / "apps" / "referenceProducts.json"


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def testApplicationContractHashesMatchCanonicalSchemas() -> None:
    assert APP_SPEC_CONTRACT_SHA256 == _sha256(APP_SCHEMA)
    assert EXECUTABLE_UNIT_CONTRACT_SHA256 == _sha256(UNIT_SCHEMA)
    assert REFERENCE_PRODUCTS_CONTRACT_SHA256 == _sha256(REFERENCE_PRODUCTS_SCHEMA)


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
        "entryBlockHash",
        "sourceFileHash",
        "sourceRevisionHash",
        "dependencyHash",
        "assetHashes",
        "checkScenarioIds",
        "evidenceReceiptIds",
        "proofLineage",
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


def testReferenceProductJourneySchemaAndManifestStayClosed() -> None:
    schema = json.loads(REFERENCE_PRODUCTS_SCHEMA.read_text(encoding="utf-8"))
    manifest = json.loads(REFERENCE_PRODUCTS_MANIFEST.read_text(encoding="utf-8"))
    journeySchema = schema["$defs"]["Journey"]
    journeyFields = {
        "plainPython",
        "publicSdkImports",
        "appProjection",
        "embedModes",
        "publicationSteps",
        "proofKinds",
        "claimBoundary",
    }

    assert schema["additionalProperties"] is False
    assert journeySchema["additionalProperties"] is False
    assert set(journeySchema["required"]) == journeyFields
    assert set(journeySchema["properties"]) == journeyFields
    assert len(manifest["products"]) == 5
    assert all(set(row["journey"]) == journeyFields for row in manifest["products"])
    assert all(row["journey"]["claimBoundary"] == "machineVerified" for row in manifest["products"])
    assert ReferenceProductJourney.__required_keys__ == frozenset(journeyFields)
    assert ReferenceProduct.__required_keys__ == frozenset(schema["$defs"]["Product"]["required"])
    assert ReferenceProductsManifest.__required_keys__ == frozenset(schema["required"])
    assert tuple(schema["$defs"]["Product"]["properties"]["runtimeTarget"]["enum"]) == REFERENCE_RUNTIME_TARGETS
    assert tuple(journeySchema["properties"]["embedModes"]["items"]["enum"]) == REFERENCE_EMBED_MODES
    assert tuple(journeySchema["properties"]["publicationSteps"]["items"]["enum"]) == REFERENCE_PUBLICATION_STEPS
    assert tuple(journeySchema["properties"]["claimBoundary"]["enum"]) == REFERENCE_CLAIM_BOUNDARIES

    typeScriptSource = (
        ROOT / "editor/src/lib/generatedContracts/referenceProducts.ts"
    ).read_text(encoding="utf-8")
    for field in journeyFields:
        assert f"{field}:" in typeScriptSource
