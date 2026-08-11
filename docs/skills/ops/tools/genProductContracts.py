from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[4]
SCHEMA_PATH = ROOT / "contracts" / "artifactOwnership.schema.json"
OWNERS_PATH = ROOT / "contracts" / "artifactOwners.yml"
PYTHON_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "artifactOwnership.py"
PYTHON_INIT_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "__init__.py"
PACKAGED_SCHEMA_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "artifactOwnership.schema.json"
TYPESCRIPT_PATH = ROOT / "editor" / "src" / "lib" / "generatedContracts" / "artifactOwnership.ts"
RUST_PATH = ROOT / "launcher" / "codaro-launcher" / "src" / "generated_contracts" / "artifact_ownership.rs"
RUST_MOD_PATH = ROOT / "launcher" / "codaro-launcher" / "src" / "generated_contracts" / "mod.rs"
APP_SPEC_PATH = ROOT / "contracts" / "appSpec.schema.json"
EXECUTABLE_UNIT_PATH = ROOT / "contracts" / "executableUnit.schema.json"
PUBLICATION_MANIFEST_PATH = ROOT / "contracts" / "publicationManifest.schema.json"
EMBED_MESSAGE_PATH = ROOT / "contracts" / "embedMessage.schema.json"
REFERENCE_PRODUCTS_SCHEMA_PATH = ROOT / "contracts" / "referenceProducts.schema.json"
REFERENCE_PRODUCTS_MANIFEST_PATH = ROOT / "examples" / "apps" / "referenceProducts.json"
PYTHON_APP_SPEC_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "appSpec.py"
PYTHON_REFERENCE_PRODUCTS_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "referenceProducts.py"
PYTHON_EXECUTABLE_UNIT_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "executableUnit.py"
PYTHON_PUBLICATION_MANIFEST_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "publicationManifest.py"
PACKAGED_APP_SPEC_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "appSpec.schema.json"
PACKAGED_REFERENCE_PRODUCTS_PATH = (
    ROOT / "src" / "codaro" / "generatedContracts" / "referenceProducts.schema.json"
)
PACKAGED_EXECUTABLE_UNIT_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "executableUnit.schema.json"
PACKAGED_PUBLICATION_MANIFEST_PATH = (
    ROOT / "src" / "codaro" / "generatedContracts" / "publicationManifest.schema.json"
)
TYPESCRIPT_APP_SPEC_PATH = ROOT / "editor" / "src" / "lib" / "generatedContracts" / "appSpec.ts"
TYPESCRIPT_REFERENCE_PRODUCTS_PATH = (
    ROOT / "editor" / "src" / "lib" / "generatedContracts" / "referenceProducts.ts"
)
TYPESCRIPT_EXECUTABLE_UNIT_PATH = (
    ROOT / "editor" / "src" / "lib" / "generatedContracts" / "executableUnit.ts"
)
TYPESCRIPT_PUBLICATION_MANIFEST_PATH = (
    ROOT / "editor" / "src" / "lib" / "generatedContracts" / "publicationManifest.ts"
)
PACKAGED_EMBED_MESSAGE_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "embedMessage.schema.json"
TYPESCRIPT_EMBED_MESSAGE_PATH = (
    ROOT / "editor" / "src" / "lib" / "generatedContracts" / "embedMessage.schema.json"
)
CHECK_SANDBOX_DECISION_PATH = ROOT / "contracts" / "checkSandboxFeasibilityDecision.json"
TYPESCRIPT_CHECK_SANDBOX_DECISION_PATH = (
    ROOT / "editor" / "src" / "lib" / "generatedContracts" / "checkSandboxFeasibilityDecision.json"
)
ROLE_VALUES = ("source", "generated", "packaged", "evidence")


class ContractGenerationError(ValueError):
    pass


def sha256Bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def loadSources() -> tuple[dict[str, Any], dict[str, Any], str, str]:
    try:
        schemaBytes = SCHEMA_PATH.read_bytes()
        schema = json.loads(schemaBytes.decode("utf-8"))
        ownersBytes = OWNERS_PATH.read_bytes()
        owners = yaml.safe_load(ownersBytes.decode("utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError, yaml.YAMLError) as exc:
        raise ContractGenerationError(f"cannot read product contract sources: {exc}") from exc
    if not isinstance(schema, dict) or not isinstance(owners, dict):
        raise ContractGenerationError("contract sources must be mappings")
    validateSchema(schema)
    validateOwners(owners)
    return schema, owners, sha256Bytes(schemaBytes), sha256Bytes(ownersBytes)


def validateSchema(schema: dict[str, Any]) -> None:
    definitions = schema.get("$defs")
    if not isinstance(definitions, dict):
        raise ContractGenerationError("artifact ownership schema needs $defs")
    role = definitions.get("ArtifactRole")
    owner = definitions.get("ArtifactOwner")
    if not isinstance(role, dict) or tuple(role.get("enum", ())) != ROLE_VALUES:
        raise ContractGenerationError("ArtifactRole enum is not canonical")
    if not isinstance(owner, dict) or owner.get("additionalProperties") is not False:
        raise ContractGenerationError("ArtifactOwner must be a closed object")
    required = owner.get("required")
    expected = {"artifactId", "role", "owner", "sourcePath", "surfacePaths"}
    if not isinstance(required, list) or set(required) != expected:
        raise ContractGenerationError("ArtifactOwner required fields are not canonical")


def validateOwners(payload: dict[str, Any]) -> None:
    if set(payload) != {"schemaVersion", "artifacts"} or payload.get("schemaVersion") != 1:
        raise ContractGenerationError("artifactOwners.yml schemaVersion or fields are invalid")
    artifacts = payload.get("artifacts")
    if not isinstance(artifacts, list) or not artifacts:
        raise ContractGenerationError("artifactOwners.yml needs at least one artifact")
    artifactIds: set[str] = set()
    sourcePaths: set[str] = set()
    for index, artifact in enumerate(artifacts):
        if not isinstance(artifact, dict):
            raise ContractGenerationError(f"artifacts[{index}] must be a mapping")
        if set(artifact) != {"artifactId", "role", "owner", "sourcePath", "surfacePaths"}:
            raise ContractGenerationError(f"artifacts[{index}] fields are invalid")
        artifactId = artifact.get("artifactId")
        sourcePath = artifact.get("sourcePath")
        if not isinstance(artifactId, str) or not artifactId or artifactId in artifactIds:
            raise ContractGenerationError(f"artifacts[{index}].artifactId is missing or duplicate")
        if artifact.get("role") not in ROLE_VALUES:
            raise ContractGenerationError(f"artifacts[{index}].role is invalid")
        if not isinstance(sourcePath, str) or sourcePath in sourcePaths or not (ROOT / sourcePath).is_file():
            raise ContractGenerationError(f"artifacts[{index}].sourcePath is missing or duplicate")
        surfacePaths = artifact.get("surfacePaths")
        if not isinstance(surfacePaths, list) or not surfacePaths or len(surfacePaths) != len(set(surfacePaths)):
            raise ContractGenerationError(f"artifacts[{index}].surfacePaths are invalid")
        artifactIds.add(artifactId)
        sourcePaths.add(sourcePath)


def loadJsonSchema(path: Path) -> tuple[dict[str, Any], str]:
    try:
        payload = path.read_bytes()
        schema = json.loads(payload.decode("utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ContractGenerationError(f"cannot read product schema {path.name}: {exc}") from exc
    if not isinstance(schema, dict):
        raise ContractGenerationError(f"product schema {path.name} must be an object")
    if schema.get("type") != "object" or schema.get("additionalProperties") is not False:
        raise ContractGenerationError(f"product schema {path.name} must be a closed object")
    if schema.get("properties", {}).get("schemaVersion", {}).get("const") != 1:
        raise ContractGenerationError(f"product schema {path.name} must declare schemaVersion 1")
    return schema, sha256Bytes(payload)


def validateReferenceProductsContract() -> None:
    schema, _schemaHash = loadJsonSchema(REFERENCE_PRODUCTS_SCHEMA_PATH)
    try:
        manifest = json.loads(REFERENCE_PRODUCTS_MANIFEST_PATH.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ContractGenerationError(f"cannot read reference product manifest: {exc}") from exc
    if not isinstance(manifest, dict) or set(manifest) != {
        "schemaVersion", "kind", "products", "claimBoundary",
    }:
        raise ContractGenerationError("reference product manifest root fields are invalid")
    if manifest.get("schemaVersion") != 1 or manifest.get("kind") != "codaro.reference-products":
        raise ContractGenerationError("reference product manifest identity is invalid")

    definitions = schema.get("$defs")
    if not isinstance(definitions, dict):
        raise ContractGenerationError("reference product schema needs $defs")
    productSchema = definitions.get("Product")
    journeySchema = definitions.get("Journey")
    if not isinstance(productSchema, dict) or not isinstance(journeySchema, dict):
        raise ContractGenerationError("reference product schema needs Product and Journey definitions")
    productFields = set(productSchema.get("required", ()))
    journeyFields = set(journeySchema.get("required", ()))
    if productSchema.get("additionalProperties") is not False or productFields != set(productSchema.get("properties", {})):
        raise ContractGenerationError("reference Product must be a closed object")
    if journeySchema.get("additionalProperties") is not False or journeyFields != set(journeySchema.get("properties", {})):
        raise ContractGenerationError("reference Journey must be a closed object")

    products = manifest.get("products")
    if not isinstance(products, list) or len(products) != 5:
        raise ContractGenerationError("reference product manifest must contain exactly five products")
    productIds: set[str] = set()
    allowedModes = {"output", "interactive", "editable"}
    allowedSteps = {"build", "serve", "embed", "deploy", "rollback"}
    for index, row in enumerate(products):
        if not isinstance(row, dict) or set(row) != productFields:
            raise ContractGenerationError(f"reference products[{index}] fields are invalid")
        productId = row.get("id")
        if not isinstance(productId, str) or not productId or productId in productIds:
            raise ContractGenerationError(f"reference products[{index}].id is missing or duplicate")
        sourcePath = row.get("sourcePath")
        if not isinstance(sourcePath, str) or not (ROOT / sourcePath).is_file():
            raise ContractGenerationError(f"reference products[{index}].sourcePath is missing")
        journey = row.get("journey")
        if not isinstance(journey, dict) or set(journey) != journeyFields:
            raise ContractGenerationError(f"reference products[{index}].journey fields are invalid")
        modes = journey.get("embedModes")
        steps = journey.get("publicationSteps")
        proofKinds = journey.get("proofKinds")
        imports = journey.get("publicSdkImports")
        if journey.get("plainPython") is not True or journey.get("appProjection") is not True:
            raise ContractGenerationError(f"reference products[{index}] must require plain Python and app projection")
        if not isinstance(modes, list) or len(modes) != len(set(modes)) or not set(modes) <= allowedModes:
            raise ContractGenerationError(f"reference products[{index}].embedModes are invalid")
        if not isinstance(steps, list) or len(steps) < 3 or len(steps) != len(set(steps)) or not set(steps) <= allowedSteps:
            raise ContractGenerationError(f"reference products[{index}].publicationSteps are invalid")
        if ("embed" in steps) != bool(modes):
            raise ContractGenerationError(f"reference products[{index}] embed step and modes differ")
        if not isinstance(proofKinds, list) or len(proofKinds) != len(set(proofKinds)):
            raise ContractGenerationError(f"reference products[{index}].proofKinds are invalid")
        if not isinstance(imports, list) or len(imports) != len(set(imports)):
            raise ContractGenerationError(f"reference products[{index}].publicSdkImports are invalid")
        boundary = journey.get("claimBoundary")
        claimBoundary = manifest.get("claimBoundary")
        if boundary not in {"machineVerified", "notVerified"} or not isinstance(claimBoundary, dict):
            raise ContractGenerationError(f"reference products[{index}].claimBoundary is invalid")
        if not isinstance(claimBoundary.get(boundary), list):
            raise ContractGenerationError(f"reference products[{index}].claimBoundary list is missing")
        productIds.add(productId)


def generatedHeader(schemaHash: str, ownersHash: str, comment: str) -> str:
    return (
        f"{comment} Generated by docs/skills/ops/tools/genProductContracts.py.\n"
        f"{comment} Source SHA-256: {schemaHash}\n"
        f"{comment} Owners SHA-256: {ownersHash}\n"
    )


def pythonSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "#") + f'''from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


ARTIFACT_OWNERSHIP_CONTRACT_SHA256 = "{schemaHash}"
ARTIFACT_OWNERSHIP_OWNERS_SHA256 = "{ownersHash}"
ArtifactRole = Literal["source", "generated", "packaged", "evidence"]


@dataclass(frozen=True)
class ArtifactOwner:
    artifactId: str
    role: ArtifactRole
    owner: str
    sourcePath: str
    surfacePaths: tuple[str, ...]
'''


def pythonInitSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "#") + '''from .artifactOwnership import (
    ARTIFACT_OWNERSHIP_CONTRACT_SHA256,
    ARTIFACT_OWNERSHIP_OWNERS_SHA256,
    ArtifactOwner,
    ArtifactRole,
)
from .appSpec import (
    APP_SPEC_CONTRACT_SHA256,
    APP_LAYOUTS,
    APP_STATE_POLICIES,
    AppLayout,
    AppSpec,
    AppStatePolicy,
)
from .referenceProducts import (
    REFERENCE_CLAIM_BOUNDARIES,
    REFERENCE_EMBED_MODES,
    REFERENCE_PUBLICATION_STEPS,
    REFERENCE_PRODUCTS_CONTRACT_SHA256,
    REFERENCE_RUNTIME_TARGETS,
    ReferenceClaimBoundary,
    ReferenceEmbedMode,
    ReferenceProduct,
    ReferenceProductClaims,
    ReferenceProductJourney,
    ReferenceProductsManifest,
    ReferencePublicationStep,
    ReferenceRuntimeTarget,
)
from .executableUnit import (
    EXECUTABLE_UNIT_CONTRACT_SHA256,
    RUNTIME_TARGETS,
    CapabilityDiagnostic,
    EffectSpec,
    ExecutableUnitSpec,
    ProofLineage,
    RuntimeTarget,
    SourceSpan,
)
from .publicationManifest import (
    PUBLICATION_MANIFEST_CONTRACT_SHA256,
    PublicationAsset,
    PublicationFile,
    PublicationFileRole,
    PublicationManifest,
    PublicationPackage,
    PublicationProof,
    PublicationProofLineage,
    PublicationRuntime,
    PublicationTarget,
)

__all__ = [
    "ARTIFACT_OWNERSHIP_CONTRACT_SHA256",
    "ARTIFACT_OWNERSHIP_OWNERS_SHA256",
    "ArtifactOwner",
    "ArtifactRole",
    "APP_SPEC_CONTRACT_SHA256",
    "APP_LAYOUTS",
    "APP_STATE_POLICIES",
    "AppLayout",
    "AppSpec",
    "AppStatePolicy",
    "REFERENCE_CLAIM_BOUNDARIES",
    "REFERENCE_EMBED_MODES",
    "REFERENCE_PUBLICATION_STEPS",
    "REFERENCE_PRODUCTS_CONTRACT_SHA256",
    "REFERENCE_RUNTIME_TARGETS",
    "ReferenceClaimBoundary",
    "ReferenceEmbedMode",
    "ReferenceProduct",
    "ReferenceProductClaims",
    "ReferenceProductJourney",
    "ReferenceProductsManifest",
    "ReferencePublicationStep",
    "ReferenceRuntimeTarget",
    "EXECUTABLE_UNIT_CONTRACT_SHA256",
    "RUNTIME_TARGETS",
    "CapabilityDiagnostic",
    "EffectSpec",
    "ExecutableUnitSpec",
    "ProofLineage",
    "RuntimeTarget",
    "SourceSpan",
    "PUBLICATION_MANIFEST_CONTRACT_SHA256",
    "PublicationAsset",
    "PublicationFile",
    "PublicationFileRole",
    "PublicationManifest",
    "PublicationPackage",
    "PublicationProof",
    "PublicationProofLineage",
    "PublicationRuntime",
    "PublicationTarget",
]
'''


def appSpecPythonSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "#") + f'''from typing import Literal, TypedDict


APP_SPEC_CONTRACT_SHA256 = "{schemaHash}"
APP_LAYOUTS = ("notebook", "learning", "stack", "grid")
APP_STATE_POLICIES = ("none", "perSession", "shared")
AppLayout = Literal["notebook", "learning", "stack", "grid"]
AppStatePolicy = Literal["none", "perSession", "shared"]


class AppSpec(TypedDict):
    schemaVersion: Literal[1]
    title: str
    layout: AppLayout
    hideCode: bool
    entryBlockIds: list[str]
    statePolicy: AppStatePolicy
'''


def appSpecTypeScriptSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "//") + f'''export const APP_SPEC_CONTRACT_SHA256 = "{schemaHash}" as const;
export const APP_LAYOUTS = ["notebook", "learning", "stack", "grid"] as const;
export const APP_STATE_POLICIES = ["none", "perSession", "shared"] as const;
export type AppLayout = (typeof APP_LAYOUTS)[number];
export type AppStatePolicy = (typeof APP_STATE_POLICIES)[number];

export type AppSpec = {{
  schemaVersion: 1;
  title: string;
  layout: AppLayout;
  hideCode: boolean;
  entryBlockIds: string[];
  statePolicy: AppStatePolicy;
}};
'''


def referenceProductsPythonSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "#") + f'''from typing import Literal, TypedDict


REFERENCE_PRODUCTS_CONTRACT_SHA256 = "{schemaHash}"
REFERENCE_RUNTIME_TARGETS = ("browser", "server", "local")
REFERENCE_EMBED_MODES = ("output", "interactive", "editable")
REFERENCE_PUBLICATION_STEPS = ("build", "serve", "embed", "deploy", "rollback")
REFERENCE_CLAIM_BOUNDARIES = ("machineVerified", "notVerified")
ReferenceRuntimeTarget = Literal["browser", "server", "local"]
ReferenceEmbedMode = Literal["output", "interactive", "editable"]
ReferencePublicationStep = Literal["build", "serve", "embed", "deploy", "rollback"]
ReferenceClaimBoundary = Literal["machineVerified", "notVerified"]


class ReferenceProductJourney(TypedDict):
    plainPython: Literal[True]
    publicSdkImports: list[str]
    appProjection: Literal[True]
    embedModes: list[ReferenceEmbedMode]
    publicationSteps: list[ReferencePublicationStep]
    proofKinds: list[str]
    claimBoundary: ReferenceClaimBoundary


class ReferenceProduct(TypedDict):
    id: str
    title: str
    sourcePath: str
    runtimeTarget: ReferenceRuntimeTarget
    entryBlockIds: list[str]
    assetPaths: list[str]
    secretRefs: list[str]
    journey: ReferenceProductJourney
    claim: str


class ReferenceProductClaims(TypedDict):
    machineVerified: list[str]
    notVerified: list[str]


class ReferenceProductsManifest(TypedDict):
    schemaVersion: Literal[1]
    kind: Literal["codaro.reference-products"]
    products: list[ReferenceProduct]
    claimBoundary: ReferenceProductClaims
'''


def referenceProductsTypeScriptSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "//") + f'''export const REFERENCE_PRODUCTS_CONTRACT_SHA256 = "{schemaHash}" as const;
export const REFERENCE_RUNTIME_TARGETS = ["browser", "server", "local"] as const;
export const REFERENCE_EMBED_MODES = ["output", "interactive", "editable"] as const;
export const REFERENCE_PUBLICATION_STEPS = ["build", "serve", "embed", "deploy", "rollback"] as const;
export const REFERENCE_CLAIM_BOUNDARIES = ["machineVerified", "notVerified"] as const;
export type ReferenceRuntimeTarget = (typeof REFERENCE_RUNTIME_TARGETS)[number];
export type ReferenceEmbedMode = (typeof REFERENCE_EMBED_MODES)[number];
export type ReferencePublicationStep = (typeof REFERENCE_PUBLICATION_STEPS)[number];
export type ReferenceClaimBoundary = (typeof REFERENCE_CLAIM_BOUNDARIES)[number];

export type ReferenceProductJourney = {{
  plainPython: true;
  publicSdkImports: string[];
  appProjection: true;
  embedModes: ReferenceEmbedMode[];
  publicationSteps: ReferencePublicationStep[];
  proofKinds: string[];
  claimBoundary: ReferenceClaimBoundary;
}};

export type ReferenceProduct = {{
  id: string;
  title: string;
  sourcePath: string;
  runtimeTarget: ReferenceRuntimeTarget;
  entryBlockIds: string[];
  assetPaths: string[];
  secretRefs: string[];
  journey: ReferenceProductJourney;
  claim: string;
}};

export type ReferenceProductClaims = {{
  machineVerified: string[];
  notVerified: string[];
}};

export type ReferenceProductsManifest = {{
  schemaVersion: 1;
  kind: "codaro.reference-products";
  products: ReferenceProduct[];
  claimBoundary: ReferenceProductClaims;
}};
'''


def executableUnitPythonSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "#") + f'''from typing import Literal, TypedDict

from .appSpec import AppStatePolicy


EXECUTABLE_UNIT_CONTRACT_SHA256 = "{schemaHash}"
RUNTIME_TARGETS = ("browser", "server", "local", "blocked")
RuntimeTarget = Literal["browser", "server", "local", "blocked"]


class SourceSpan(TypedDict):
    path: str
    startLine: int
    endLine: int


class EffectSpec(TypedDict):
    filesystemRead: list[str]
    filesystemWrite: list[str]
    networkOrigins: list[str]
    process: bool
    gui: bool
    secretRefs: list[str]


class CapabilityDiagnostic(TypedDict):
    blockId: str
    code: str
    message: str
    severity: Literal["info", "warning", "blocked"]
    sourceSpan: SourceSpan


class ProofLineage(TypedDict):
    schemaVersion: Literal[1]
    kind: Literal["codaro.proof-lineage"]
    sourceRevisionReceiptId: str
    sourceBlockHash: str
    dependencyHash: str
    learningCreditIds: list[str]
    learningCheckIds: list[str]
    lineageHash: str


class ExecutableUnitSpec(TypedDict):
    schemaVersion: Literal[1]
    unitId: str
    entryBlockId: str
    dependencyBlockIds: list[str]
    inputSchema: dict[str, object]
    outputSchema: dict[str, object]
    effects: EffectSpec
    statePolicy: AppStatePolicy
    runtimeTarget: RuntimeTarget
    sourceSpan: SourceSpan
    entryBlockHash: str
    sourceFileHash: str
    sourceRevisionHash: str
    dependencyHash: str
    assetHashes: dict[str, str]
    checkScenarioIds: list[str]
    evidenceReceiptIds: list[str]
    proofLineage: ProofLineage | None
    diagnostics: list[CapabilityDiagnostic]
'''


def executableUnitTypeScriptSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "//") + f'''import type {{ AppStatePolicy }} from "./appSpec";

export const EXECUTABLE_UNIT_CONTRACT_SHA256 = "{schemaHash}" as const;
export const RUNTIME_TARGETS = ["browser", "server", "local", "blocked"] as const;
export type RuntimeTarget = (typeof RUNTIME_TARGETS)[number];

export type SourceSpan = {{ path: string; startLine: number; endLine: number }};

export type EffectSpec = {{
  filesystemRead: string[];
  filesystemWrite: string[];
  networkOrigins: string[];
  process: boolean;
  gui: boolean;
  secretRefs: string[];
}};

export type CapabilityDiagnostic = {{
  blockId: string;
  code: string;
  message: string;
  severity: "info" | "warning" | "blocked";
  sourceSpan: SourceSpan;
}};

export type ProofLineage = {{
  schemaVersion: 1;
  kind: "codaro.proof-lineage";
  sourceRevisionReceiptId: string;
  sourceBlockHash: string;
  dependencyHash: string;
  learningCreditIds: string[];
  learningCheckIds: string[];
  lineageHash: string;
}};

export type ExecutableUnitSpec = {{
  schemaVersion: 1;
  unitId: string;
  entryBlockId: string;
  dependencyBlockIds: string[];
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  effects: EffectSpec;
  statePolicy: AppStatePolicy;
  runtimeTarget: RuntimeTarget;
  sourceSpan: SourceSpan;
  entryBlockHash: string;
  sourceFileHash: string;
  sourceRevisionHash: string;
  dependencyHash: string;
  assetHashes: Record<string, string>;
  checkScenarioIds: string[];
  evidenceReceiptIds: string[];
  proofLineage: ProofLineage | null;
  diagnostics: CapabilityDiagnostic[];
}};
'''


def publicationManifestPythonSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "#") + f'''from typing import Literal, TypedDict


PUBLICATION_MANIFEST_CONTRACT_SHA256 = "{schemaHash}"
PublicationTarget = Literal["browser", "server", "local"]
PublicationFileRole = Literal["shell", "runtime", "document", "data", "package"]


class BrowserPublicationRuntime(TypedDict):
    pythonIndexPath: str
    pythonIntegrityPath: str
    pyprocIntegrityPath: str


class ServerPublicationRuntime(TypedDict):
    kind: Literal["server"]
    pythonVersion: str
    requirementsPath: str
    permissionScopes: list[Literal["filesystem.read", "filesystem.write", "network"]]
    secretRefs: list[str]
    networkOrigins: list[str]
    statePolicy: Literal["none", "perSession", "shared"]
    policyHash: str
    maxMemoryMb: int
    maxExecutionSeconds: int


class LocalPublicationRuntime(TypedDict):
    kind: Literal["local"]
    pythonVersion: str
    requirementsPath: str
    permissionScopes: list[Literal["filesystem.read", "filesystem.write", "network", "process.execute", "gui.display", "secret.read"]]
    effects: dict[str, object]
    secretRefs: list[str]
    networkOrigins: list[str]
    statePolicy: Literal["none", "perSession", "shared"]
    policyHash: str
    maxMemoryMb: int
    maxExecutionSeconds: int
    maxChildProcesses: int
    apiAllowlist: list[str]


PublicationRuntime = BrowserPublicationRuntime | ServerPublicationRuntime | LocalPublicationRuntime


class PublicationFile(TypedDict):
    path: str
    contentHash: str
    bytes: int
    role: PublicationFileRole


class PublicationAsset(TypedDict):
    sourcePath: str
    bundlePath: str
    contentHash: str


class PublicationPackage(TypedDict):
    name: str
    bundlePath: str
    contentHash: str


class PublicationProofLineage(TypedDict):
    schemaVersion: Literal[1]
    kind: Literal["codaro.proof-lineage"]
    sourceRevisionReceiptId: str
    promotionBuildArtifactReceiptId: str
    sourceBlockHash: str
    dependencyHash: str
    learningCreditIds: list[str]
    learningCheckIds: list[str]
    lineageHash: str
    coveredBlockIds: list[str]
    verificationStatus: Literal["verified", "unverified"]
    permissionReceiptId: str | None
    functionalCheckReceiptId: str | None
    operationalRunReceiptId: str | None
    artifactHashes: list[str]


class PublicationProof(TypedDict):
    schemaVersion: Literal[1]
    verificationStatus: Literal["verified", "unverified"]
    lineages: list[PublicationProofLineage]
    proofHash: str


class PublicationManifest(TypedDict):
    schemaVersion: Literal[1]
    target: PublicationTarget
    compilerManifestHash: str
    sourceRevisionHash: str
    entryBlockIds: list[str]
    executionBlockIds: list[str]
    executionProjectionHash: str
    proof: PublicationProof
    documentPath: str
    runtime: PublicationRuntime
    files: list[PublicationFile]
    dataAssets: list[PublicationAsset]
    packageAssets: list[PublicationPackage]
    manifestHash: str
'''


def publicationManifestTypeScriptSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "//") + f'''export const PUBLICATION_MANIFEST_CONTRACT_SHA256 = "{schemaHash}" as const;
export type PublicationTarget = "browser" | "server" | "local";
export type PublicationFileRole = "shell" | "runtime" | "document" | "data" | "package";

export type BrowserPublicationRuntime = {{
  pythonIndexPath: string;
  pythonIntegrityPath: string;
  pyprocIntegrityPath: string;
}};

export type ServerPublicationRuntime = {{
  kind: "server";
  pythonVersion: string;
  requirementsPath: string;
  permissionScopes: Array<"filesystem.read" | "filesystem.write" | "network">;
  secretRefs: string[];
  networkOrigins: string[];
  statePolicy: "none" | "perSession" | "shared";
  policyHash: string;
  maxMemoryMb: number;
  maxExecutionSeconds: number;
}};

export type LocalPublicationRuntime = {{
  kind: "local";
  pythonVersion: string;
  requirementsPath: string;
  permissionScopes: Array<"filesystem.read" | "filesystem.write" | "network" | "process.execute" | "gui.display" | "secret.read">;
  effects: Record<string, unknown>;
  secretRefs: string[];
  networkOrigins: string[];
  statePolicy: "none" | "perSession" | "shared";
  policyHash: string;
  maxMemoryMb: number;
  maxExecutionSeconds: number;
  maxChildProcesses: number;
  apiAllowlist: string[];
}};

export type PublicationRuntime = BrowserPublicationRuntime | ServerPublicationRuntime | LocalPublicationRuntime;

export type PublicationFile = {{
  path: string;
  contentHash: string;
  bytes: number;
  role: PublicationFileRole;
}};

export type PublicationAsset = {{
  sourcePath: string;
  bundlePath: string;
  contentHash: string;
}};

export type PublicationPackage = {{
  name: string;
  bundlePath: string;
  contentHash: string;
}};

export type PublicationProofLineage = {{
  schemaVersion: 1;
  kind: "codaro.proof-lineage";
  sourceRevisionReceiptId: string;
  promotionBuildArtifactReceiptId: string;
  sourceBlockHash: string;
  dependencyHash: string;
  learningCreditIds: string[];
  learningCheckIds: string[];
  lineageHash: string;
  coveredBlockIds: string[];
  verificationStatus: "verified" | "unverified";
  permissionReceiptId: string | null;
  functionalCheckReceiptId: string | null;
  operationalRunReceiptId: string | null;
  artifactHashes: string[];
}};

export type PublicationProof = {{
  schemaVersion: 1;
  verificationStatus: "verified" | "unverified";
  lineages: PublicationProofLineage[];
  proofHash: string;
}};

export type PublicationManifest = {{
  schemaVersion: 1;
  target: PublicationTarget;
  compilerManifestHash: string;
  sourceRevisionHash: string;
  entryBlockIds: string[];
  executionBlockIds: string[];
  executionProjectionHash: string;
  proof: PublicationProof;
  documentPath: string;
  runtime: PublicationRuntime;
  files: PublicationFile[];
  dataAssets: PublicationAsset[];
  packageAssets: PublicationPackage[];
  manifestHash: string;
}};
'''


def typeScriptSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "//") + f'''export const ARTIFACT_OWNERSHIP_CONTRACT_SHA256 = "{schemaHash}" as const;
export const ARTIFACT_OWNERSHIP_OWNERS_SHA256 = "{ownersHash}" as const;

export type ArtifactRole = "source" | "generated" | "packaged" | "evidence";

export type ArtifactOwner = {{
  artifactId: string;
  role: ArtifactRole;
  owner: string;
  sourcePath: string;
  surfacePaths: string[];
}};
'''


def rustSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "//") + f'''use serde::{{Deserialize, Serialize}};

pub const ARTIFACT_OWNERSHIP_CONTRACT_SHA256: &str =
    "{schemaHash}";
pub const ARTIFACT_OWNERSHIP_OWNERS_SHA256: &str =
    "{ownersHash}";

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum ArtifactRole {{
    Source,
    Generated,
    Packaged,
    Evidence,
}}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ArtifactOwner {{
    pub artifact_id: String,
    pub role: ArtifactRole,
    pub owner: String,
    pub source_path: String,
    pub surface_paths: Vec<String>,
}}
'''


def rustModSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "//") + "pub mod artifact_ownership;\n"


def expectedOutputs() -> dict[Path, str]:
    _schema, _owners, schemaHash, ownersHash = loadSources()
    validateReferenceProductsContract()
    _appSpec, appSpecHash = loadJsonSchema(APP_SPEC_PATH)
    _referenceProducts, referenceProductsHash = loadJsonSchema(REFERENCE_PRODUCTS_SCHEMA_PATH)
    _executableUnit, executableUnitHash = loadJsonSchema(EXECUTABLE_UNIT_PATH)
    _publicationManifest, publicationManifestHash = loadJsonSchema(PUBLICATION_MANIFEST_PATH)
    embedMessage = json.loads(EMBED_MESSAGE_PATH.read_text(encoding="utf-8"))
    if not isinstance(embedMessage, dict) or not isinstance(embedMessage.get("oneOf"), list):
        raise ContractGenerationError("embedMessage.schema.json must declare a oneOf message union")
    return {
        PYTHON_PATH: pythonSource(schemaHash, ownersHash),
        PYTHON_INIT_PATH: pythonInitSource(schemaHash, ownersHash),
        PACKAGED_SCHEMA_PATH: SCHEMA_PATH.read_text(encoding="utf-8"),
        TYPESCRIPT_PATH: typeScriptSource(schemaHash, ownersHash),
        PYTHON_APP_SPEC_PATH: appSpecPythonSource(appSpecHash, ownersHash),
        PYTHON_REFERENCE_PRODUCTS_PATH: referenceProductsPythonSource(referenceProductsHash, ownersHash),
        PYTHON_EXECUTABLE_UNIT_PATH: executableUnitPythonSource(executableUnitHash, ownersHash),
        PACKAGED_APP_SPEC_PATH: APP_SPEC_PATH.read_text(encoding="utf-8"),
        PACKAGED_REFERENCE_PRODUCTS_PATH: REFERENCE_PRODUCTS_SCHEMA_PATH.read_text(encoding="utf-8"),
        PACKAGED_EXECUTABLE_UNIT_PATH: EXECUTABLE_UNIT_PATH.read_text(encoding="utf-8"),
        TYPESCRIPT_APP_SPEC_PATH: appSpecTypeScriptSource(appSpecHash, ownersHash),
        TYPESCRIPT_REFERENCE_PRODUCTS_PATH: referenceProductsTypeScriptSource(
            referenceProductsHash, ownersHash
        ),
        TYPESCRIPT_EXECUTABLE_UNIT_PATH: executableUnitTypeScriptSource(executableUnitHash, ownersHash),
        PYTHON_PUBLICATION_MANIFEST_PATH: publicationManifestPythonSource(publicationManifestHash, ownersHash),
        PACKAGED_PUBLICATION_MANIFEST_PATH: PUBLICATION_MANIFEST_PATH.read_text(encoding="utf-8"),
        TYPESCRIPT_PUBLICATION_MANIFEST_PATH: publicationManifestTypeScriptSource(
            publicationManifestHash, ownersHash
        ),
        PACKAGED_EMBED_MESSAGE_PATH: EMBED_MESSAGE_PATH.read_text(encoding="utf-8"),
        TYPESCRIPT_EMBED_MESSAGE_PATH: EMBED_MESSAGE_PATH.read_text(encoding="utf-8"),
        TYPESCRIPT_CHECK_SANDBOX_DECISION_PATH: CHECK_SANDBOX_DECISION_PATH.read_text(encoding="utf-8"),
        RUST_PATH: rustSource(schemaHash, ownersHash),
        RUST_MOD_PATH: rustModSource(schemaHash, ownersHash),
    }


def generate(*, check: bool) -> list[str]:
    stale: list[str] = []
    for path, expected in expectedOutputs().items():
        current = path.read_text(encoding="utf-8") if path.is_file() else None
        if current == expected:
            continue
        stale.append(path.relative_to(ROOT).as_posix())
        if not check:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(expected, encoding="utf-8", newline="\n")
    return stale


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Generate shared product contract types for all runtime surfaces.")
    parser.add_argument("--check", action="store_true", help="Fail when generated product contracts are stale.")
    args = parser.parse_args(argv)
    try:
        stale = generate(check=args.check)
    except ContractGenerationError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    if args.check and stale:
        print("FAIL: generated product contracts are stale", file=sys.stderr)
        for path in stale:
            print(f"  - {path}", file=sys.stderr)
        return 1
    action = "checked" if args.check else "generated"
    print(f"ok: product contracts {action} ({len(expectedOutputs())} files)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
