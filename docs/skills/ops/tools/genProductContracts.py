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
PYTHON_APP_SPEC_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "appSpec.py"
PYTHON_EXECUTABLE_UNIT_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "executableUnit.py"
PYTHON_PUBLICATION_MANIFEST_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "publicationManifest.py"
PACKAGED_APP_SPEC_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "appSpec.schema.json"
PACKAGED_EXECUTABLE_UNIT_PATH = ROOT / "src" / "codaro" / "generatedContracts" / "executableUnit.schema.json"
PACKAGED_PUBLICATION_MANIFEST_PATH = (
    ROOT / "src" / "codaro" / "generatedContracts" / "publicationManifest.schema.json"
)
TYPESCRIPT_APP_SPEC_PATH = ROOT / "editor" / "src" / "lib" / "generatedContracts" / "appSpec.ts"
TYPESCRIPT_EXECUTABLE_UNIT_PATH = (
    ROOT / "editor" / "src" / "lib" / "generatedContracts" / "executableUnit.ts"
)
TYPESCRIPT_PUBLICATION_MANIFEST_PATH = (
    ROOT / "editor" / "src" / "lib" / "generatedContracts" / "publicationManifest.ts"
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
from .executableUnit import (
    EXECUTABLE_UNIT_CONTRACT_SHA256,
    RUNTIME_TARGETS,
    CapabilityDiagnostic,
    EffectSpec,
    ExecutableUnitSpec,
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
    "EXECUTABLE_UNIT_CONTRACT_SHA256",
    "RUNTIME_TARGETS",
    "CapabilityDiagnostic",
    "EffectSpec",
    "ExecutableUnitSpec",
    "RuntimeTarget",
    "SourceSpan",
    "PUBLICATION_MANIFEST_CONTRACT_SHA256",
    "PublicationAsset",
    "PublicationFile",
    "PublicationFileRole",
    "PublicationManifest",
    "PublicationPackage",
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
    sourceHash: str
    dependencyHash: str
    assetHashes: dict[str, str]
    checkScenarioIds: list[str]
    evidenceReceiptIds: list[str]
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
  sourceHash: string;
  dependencyHash: string;
  assetHashes: Record<string, string>;
  checkScenarioIds: string[];
  evidenceReceiptIds: string[];
  diagnostics: CapabilityDiagnostic[];
}};
'''


def publicationManifestPythonSource(schemaHash: str, ownersHash: str) -> str:
    return generatedHeader(schemaHash, ownersHash, "#") + f'''from typing import Literal, TypedDict


PUBLICATION_MANIFEST_CONTRACT_SHA256 = "{schemaHash}"
PublicationTarget = Literal["browser", "server", "local"]
PublicationFileRole = Literal["shell", "runtime", "document", "data", "package"]


class PublicationRuntime(TypedDict):
    pythonIndexPath: str
    pythonIntegrityPath: str
    pyprocIntegrityPath: str


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


class PublicationManifest(TypedDict):
    schemaVersion: Literal[1]
    target: PublicationTarget
    compilerManifestHash: str
    sourceRevisionHash: str
    entryBlockIds: list[str]
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

export type PublicationRuntime = {{
  pythonIndexPath: string;
  pythonIntegrityPath: string;
  pyprocIntegrityPath: string;
}};

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

export type PublicationManifest = {{
  schemaVersion: 1;
  target: PublicationTarget;
  compilerManifestHash: string;
  sourceRevisionHash: string;
  entryBlockIds: string[];
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

pub const ARTIFACT_OWNERSHIP_CONTRACT_SHA256: &str = "{schemaHash}";
pub const ARTIFACT_OWNERSHIP_OWNERS_SHA256: &str = "{ownersHash}";

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
    _appSpec, appSpecHash = loadJsonSchema(APP_SPEC_PATH)
    _executableUnit, executableUnitHash = loadJsonSchema(EXECUTABLE_UNIT_PATH)
    _publicationManifest, publicationManifestHash = loadJsonSchema(PUBLICATION_MANIFEST_PATH)
    return {
        PYTHON_PATH: pythonSource(schemaHash, ownersHash),
        PYTHON_INIT_PATH: pythonInitSource(schemaHash, ownersHash),
        PACKAGED_SCHEMA_PATH: SCHEMA_PATH.read_text(encoding="utf-8"),
        TYPESCRIPT_PATH: typeScriptSource(schemaHash, ownersHash),
        PYTHON_APP_SPEC_PATH: appSpecPythonSource(appSpecHash, ownersHash),
        PYTHON_EXECUTABLE_UNIT_PATH: executableUnitPythonSource(executableUnitHash, ownersHash),
        PACKAGED_APP_SPEC_PATH: APP_SPEC_PATH.read_text(encoding="utf-8"),
        PACKAGED_EXECUTABLE_UNIT_PATH: EXECUTABLE_UNIT_PATH.read_text(encoding="utf-8"),
        TYPESCRIPT_APP_SPEC_PATH: appSpecTypeScriptSource(appSpecHash, ownersHash),
        TYPESCRIPT_EXECUTABLE_UNIT_PATH: executableUnitTypeScriptSource(executableUnitHash, ownersHash),
        PYTHON_PUBLICATION_MANIFEST_PATH: publicationManifestPythonSource(publicationManifestHash, ownersHash),
        PACKAGED_PUBLICATION_MANIFEST_PATH: PUBLICATION_MANIFEST_PATH.read_text(encoding="utf-8"),
        TYPESCRIPT_PUBLICATION_MANIFEST_PATH: publicationManifestTypeScriptSource(
            publicationManifestHash, ownersHash
        ),
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
