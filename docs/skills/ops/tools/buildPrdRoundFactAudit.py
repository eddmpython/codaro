from __future__ import annotations

import argparse
import ast
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import sys
from types import ModuleType
from typing import Any
import zipfile

import yaml


ROOT = Path(__file__).resolve().parents[4]
ROUND_ROOT = (
    ROOT
    / "mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/08-r10-independent-review"
)
BUNDLE_BUILDER_PATH = ROOT / "docs/skills/ops/tools/buildPrdEvaluationBundle.py"
TOP_TIER_AUDIT_PATH = ROOT / "tests/curriculum/verifyCurriculumTopTierAudit.py"
FACT_AUDIT_PATH = ROUND_ROOT / "fact-audit.json"
BOOTSTRAP_FIXTURE_PATH = ROOT / "tests/product/bootstrapAfterUse.fixture.yml"
REQUIRED_BUNDLE_PATHS = (
    "README.md",
    "mainPlan/astryx-product-experience/README.md",
    "mainPlan/astryx-product-experience/02-learning-method/README.md",
    "mainPlan/astryx-product-experience/04-web-learning/README.md",
    "mainPlan/astryx-product-experience/05-local-studio/README.md",
    "curricula/python/schema.yaml",
    "editor/src/components/curriculum/curriculumSurface.tsx",
    "editor/src/lib/webLearningEvidence.ts",
    "landing/src/pages/learn.jsx",
    "tests/run.py",
)
REQUIRED_SYMBOLS = {
    "editor/src/lib/webLearningEvidence.ts": ("appendWebStrongCheckEvidenceTransaction",),
    "editor/src/lib/curriculumProgressEvent.ts": ("PROGRESS_UPDATED_EVENT",),
    "tests/run.py": ("PRODUCT_QUALITY_GATES",),
}
ROLLBACK_SYMBOLS = ("minimumReaderVersion", "cutoverMarker")
REQUIRED_QUALITY_GATES = {
    "curriculum-top-tier-audit",
    "design-system-contract",
    "learning-method",
    "product-experience-browser",
    "astryx-journey",
    "visual-assets",
    "web-learning",
    "landing-public",
    "learning-evidence-contract",
}


class FactAuditError(ValueError):
    pass


def loadModule(path: Path, name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise FactAuditError(f"cannot load module: {path.relative_to(ROOT).as_posix()}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def sha256Bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def loadMapping(path: Path) -> dict[str, Any]:
    try:
        text = path.read_text(encoding="utf-8")
        payload = json.loads(text) if path.suffix == ".json" else yaml.safe_load(text)
    except (OSError, json.JSONDecodeError, yaml.YAMLError) as exc:
        raise FactAuditError(f"cannot parse {path.relative_to(ROOT).as_posix()}: {exc}") from exc
    if not isinstance(payload, dict):
        raise FactAuditError(f"document root must be a mapping: {path.relative_to(ROOT).as_posix()}")
    return payload


def qualityGateNames(source: str) -> tuple[str, ...]:
    tree = ast.parse(source)
    for node in tree.body:
        if not isinstance(node, ast.Assign):
            continue
        if not any(isinstance(target, ast.Name) and target.id == "PRODUCT_QUALITY_GATES" for target in node.targets):
            continue
        if not isinstance(node.value, (ast.Tuple, ast.List)):
            raise FactAuditError("PRODUCT_QUALITY_GATES must be a literal tuple or list")
        values: list[str] = []
        for item in node.value.elts:
            if not isinstance(item, ast.Constant) or not isinstance(item.value, str):
                raise FactAuditError("PRODUCT_QUALITY_GATES must contain only string literals")
            values.append(item.value)
        return tuple(values)
    raise FactAuditError("PRODUCT_QUALITY_GATES is absent from tests/run.py")


def bootstrapFixtureFacts() -> dict[str, Any]:
    fixture = loadMapping(BOOTSTRAP_FIXTURE_PATH)
    milestones = fixture.get("milestones")
    artifacts = fixture.get("artifacts")
    if not isinstance(milestones, dict) or not isinstance(artifacts, list):
        raise FactAuditError("bootstrap negative fixture is malformed")
    detected: list[str] = []
    for artifact in artifacts:
        if not isinstance(artifact, dict):
            raise FactAuditError("bootstrap artifact must be a mapping")
        owner = artifact.get("creationOwner")
        consumers = artifact.get("consumers")
        if not isinstance(owner, dict) or not isinstance(consumers, list):
            raise FactAuditError("bootstrap artifact must define owner and consumers")
        ownerOrder = milestones.get(owner.get("milestone"))
        if not isinstance(ownerOrder, int):
            raise FactAuditError("bootstrap owner milestone is unknown")
        for consumer in consumers:
            consumerOrder = milestones.get(consumer.get("milestone")) if isinstance(consumer, dict) else None
            if not isinstance(consumerOrder, int):
                raise FactAuditError("bootstrap consumer milestone is unknown")
            if consumerOrder < ownerOrder:
                detected.append(str(artifact.get("path")))
    expected = fixture.get("expectedFailure")
    return {
        "fixturePath": BOOTSTRAP_FIXTURE_PATH.relative_to(ROOT).as_posix(),
        "expectedFailure": expected,
        "detectedArtifactCount": len(detected),
        "detectedArtifacts": sorted(detected),
        "negativeFixtureRejected": bool(detected),
    }


def learningCoverageFacts() -> dict[str, Any]:
    audit = loadModule(TOP_TIER_AUDIT_PATH, "prdRoundTopTierAudit")
    lessons = [
        audit.evaluateLesson(path)
        for path in sorted(audit.CURRICULA_DIR.rglob("*.yaml"))
        if path.name != "schema.yaml"
    ]
    summary = audit.summarizeLessons(lessons)
    domains = audit.buildDomains(summary, lessons)
    failedDomains = [
        domain["id"]
        for domain in domains
        if domain["score"] < audit.MINIMUM_SCORE or domain["requirementFailures"]
    ]
    return {
        "lessonCount": summary["lessonCount"],
        "strongCheckSpecCount": summary["strongCheckSpecCount"],
        "strongCheckSpecLessonCount": summary["strongCheckSpecLessonCount"],
        "weakOnlyLessonCount": summary["weakOnlyLessonCount"],
        "masteryAssessmentLessonCount": summary["masteryAssessmentLessonCount"],
        "transferAssessmentLessonCount": summary["transferAssessmentLessonCount"],
        "retrievalAssessmentLessonCount": summary["retrievalAssessmentLessonCount"],
        "failedDomains": failedDomains,
        "topTierEligible": not failedDomains,
        "completionEligible": False,
    }


def verifyBundleArchive(
    builder: ModuleType, manifest: dict[str, Any], expectedArchiveBytes: bytes
) -> dict[str, bytes]:
    archivePath = ROOT / manifest["archive"]["path"]
    archiveBytes = archivePath.read_bytes() if archivePath.is_file() else expectedArchiveBytes
    if sha256Bytes(archiveBytes) != manifest["archive"].get("sha256"):
        raise FactAuditError("evaluation archive hash does not match its manifest")
    if sha256Bytes(expectedArchiveBytes) != manifest["archive"].get("sha256"):
        raise FactAuditError("reconstructed evaluation archive hash does not match its manifest")
    rows = manifest.get("files")
    if not isinstance(rows, list):
        raise FactAuditError("evaluation bundle file rows are absent")
    expectedPaths = [row.get("path") for row in rows if isinstance(row, dict)]
    if len(expectedPaths) != len(rows) or not all(isinstance(path, str) for path in expectedPaths):
        raise FactAuditError("evaluation bundle file rows are malformed")
    builder.verifyExcludedPriorReports(expectedPaths)
    files: dict[str, bytes] = {}
    with zipfile.ZipFile(io.BytesIO(archiveBytes)) as archive:
        if archive.namelist() != expectedPaths:
            raise FactAuditError("evaluation archive paths do not match the manifest")
        for row, info in zip(rows, archive.infolist(), strict=True):
            data = archive.read(info)
            if sha256Bytes(data) != row.get("sha256") or len(data) != row.get("bytes"):
                raise FactAuditError(f"evaluation archive entry is stale: {row.get('path')}")
            if ((info.external_attr >> 16) & 0o777) != 0o444:
                raise FactAuditError(f"evaluation archive entry is not read-only: {row.get('path')}")
            files[row["path"]] = data
    return files


def symbolFacts(files: dict[str, bytes]) -> dict[str, Any]:
    present: list[str] = []
    missing: list[str] = []
    for path, symbols in REQUIRED_SYMBOLS.items():
        source = files.get(path, b"").decode("utf-8", errors="replace")
        for symbol in symbols:
            target = f"{path}::{symbol}"
            (present if symbol in source else missing).append(target)
    implementationText = "\n".join(
        data.decode("utf-8", errors="replace")
        for path, data in files.items()
        if path.startswith(("src/", "editor/src/", "launcher/"))
        and path.endswith((".py", ".ts", ".tsx", ".rs"))
    )
    rollbackPresent = [symbol for symbol in ROLLBACK_SYMBOLS if symbol in implementationText]
    return {
        "requiredPresent": sorted(present),
        "requiredMissing": sorted(missing),
        "rollbackContractSymbolsPresent": rollbackPresent,
        "rollbackContractSymbolsMissing": [symbol for symbol in ROLLBACK_SYMBOLS if symbol not in rollbackPresent],
        "rollbackCutoverImplemented": len(rollbackPresent) == len(ROLLBACK_SYMBOLS),
    }


def buildPrdRoundFactAudit() -> dict[str, Any]:
    builder = loadModule(BUNDLE_BUILDER_PATH, "prdEvaluationBundleBuilder")
    expectedManifest, expectedArchiveBytes = builder.buildPrdEvaluationBundle()
    actualManifest = loadMapping(builder.MANIFEST_PATH)
    if actualManifest != expectedManifest:
        raise FactAuditError("evaluation bundle manifest is stale")
    files = verifyBundleArchive(builder, actualManifest, expectedArchiveBytes)
    missingPaths = sorted(path for path in REQUIRED_BUNDLE_PATHS if path not in files)
    if missingPaths:
        raise FactAuditError("required evaluation paths are absent: " + ", ".join(missingPaths))
    runSource = files["tests/run.py"].decode("utf-8")
    gates = qualityGateNames(runSource)
    missingGates = sorted(REQUIRED_QUALITY_GATES - set(gates))
    if missingGates:
        raise FactAuditError("required product quality gates are absent: " + ", ".join(missingGates))
    planQualityRegistered = '"plan-quality": Gate(' in runSource
    if not planQualityRegistered:
        raise FactAuditError("plan-quality gate is absent from tests/run.py")
    symbols = symbolFacts(files)
    if symbols["requiredMissing"]:
        raise FactAuditError("required current symbols are absent: " + ", ".join(symbols["requiredMissing"]))
    learning = learningCoverageFacts()
    bootstrap = bootstrapFixtureFacts()
    if not bootstrap["negativeFixtureRejected"]:
        raise FactAuditError("bootstrap negative fixture unexpectedly passed")
    scope = actualManifest["scope"]
    archive = actualManifest["archive"]
    productGaps = [
        f"{learning['weakOnlyLessonCount']} of {learning['lessonCount']} lessons remain weak-only",
        "independent learning, UX, and architecture reports are not assigned or sealed",
    ]
    if not symbols["rollbackCutoverImplemented"]:
        productGaps.append("minimumReaderVersion and cutoverMarker rollback contract is not implemented")
    return {
        "schemaVersion": 1,
        "roundId": "R10",
        "state": actualManifest["state"],
        "passed": True,
        "auditComplete": True,
        "scoreThresholdApplied": False,
        "productCompletionEligible": False,
        "roundSealEligible": actualManifest["roundReadiness"]["sealEligible"],
        "scope": {
            "gitCommit": scope["gitCommit"],
            "dirtyDiffHash": scope["dirtyDiffHash"],
            "manifestHash": scope["manifestHash"],
            "evaluationBundleHash": archive["sha256"],
        },
        "facts": {
            "bundleIntegrity": {
                "fileCount": scope["fileCount"],
                "totalSourceBytes": scope["totalBytes"],
                "archiveBytes": archive["bytes"],
                "archiveEntriesReadOnly": archive["readOnlyEntries"],
                "excludedHistoryPathCount": 0,
                "priorScoresIncluded": actualManifest["exclusions"]["priorScoresIncluded"],
                "priorConclusionsIncluded": actualManifest["exclusions"]["priorConclusionsIncluded"],
            },
            "requiredPaths": {"checked": len(REQUIRED_BUNDLE_PATHS), "missing": missingPaths},
            "symbols": symbols,
            "qualityGates": {
                "count": len(gates),
                "names": list(gates),
                "requiredMissing": missingGates,
                "planQualityRegistered": planQualityRegistered,
            },
            "learningCoverage": learning,
            "dependencyBootstrap": bootstrap,
        },
        "productGaps": productGaps,
    }


def dumpAudit(payload: dict[str, Any]) -> str:
    return json.dumps(payload, ensure_ascii=False, indent=2) + "\n"


def buildParser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Build the current-scope R10 fact audit without scoring the product.")
    action = parser.add_mutually_exclusive_group(required=True)
    action.add_argument("--write", action="store_true")
    action.add_argument("--check", action="store_true")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = buildParser().parse_args(argv)
    try:
        payload = buildPrdRoundFactAudit()
        text = dumpAudit(payload)
        if args.write:
            FACT_AUDIT_PATH.write_text(text, encoding="utf-8")
            print(
                f"wrote R10 fact audit: {payload['facts']['bundleIntegrity']['fileCount']} files, "
                f"topTierEligible={str(payload['facts']['learningCoverage']['topTierEligible']).lower()}"
            )
        else:
            if not FACT_AUDIT_PATH.is_file() or FACT_AUDIT_PATH.read_text(encoding="utf-8") != text:
                raise FactAuditError(
                    "R10 fact audit is stale; run "
                    "uv run --no-sync python -X utf8 docs/skills/ops/tools/buildPrdRoundFactAudit.py --write"
                )
            print("ok: R10 fact audit matches the current draft bundle")
    except FactAuditError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
