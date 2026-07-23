from __future__ import annotations

from datetime import UTC, datetime
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import time
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[2]
ROUND_ROOT = (
    ROOT
    / "mainPlan"
    / "astryx-product-experience"
    / "00-product-contract"
    / "01-prd-improvement-loop"
    / "08-r10-independent-review"
)
CONTRACT_ROOT = ROUND_ROOT.parent / "00-evaluation-contract"
RUBRIC_PATH = CONTRACT_ROOT / "rubric.yml"
SCHEMA_PATH = CONTRACT_ROOT / "evaluation-report.schema.yml"
INPUT_PATH = ROUND_ROOT / "r10-input-manifest.yml"
ROSTER_PATH = ROUND_ROOT / "evaluator-roster.yml"
BUNDLE_PATH = ROUND_ROOT / "evaluation-bundle.manifest.yml"
FACT_AUDIT_PATH = ROUND_ROOT / "fact-audit.json"
FINDING_LEDGER_PATH = ROUND_ROOT / "finding-ledger.yml"
REPORT_PATH = ROOT / "output" / "test-runner" / "plan-quality" / "evaluation-validation.json"
DISCIPLINES = ("learning", "ux", "architecture")
FORBIDDEN_BUNDLE_PREFIXES = (
    "mainPlan/astryx-product-experience/00-product-contract/00-specialist-review/",
    "mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/",
)
FORBIDDEN_BUNDLE_SEGMENTS = {
    ".cache", ".git", ".pytest_cache", ".ruff_cache", ".tmp", ".venv", "__pycache__",
    "build", "coverage", "dist", "node_modules", "output",
}
REQUIRED_FACT_DOMAINS = {
    "bundleIntegrity", "requiredPaths", "symbols", "qualityGates", "learningCoverage", "dependencyBootstrap",
}
DIMENSION_IDS = (
    "learnerValue",
    "currentStateAccuracy",
    "decisionCompleteness",
    "dependencyOwnership",
    "feasibilityCapacity",
    "testRollback",
    "measurementRelease",
)


class EvaluationError(ValueError):
    pass


def relativePath(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def loadPayload(path: Path) -> Any:
    try:
        text = path.read_text(encoding="utf-8")
        return json.loads(text) if path.suffix.lower() == ".json" else yaml.safe_load(text)
    except (OSError, json.JSONDecodeError, yaml.YAMLError) as exc:
        raise EvaluationError(f"cannot parse {relativePath(path)}: {exc}") from exc


def loadMapping(path: Path) -> dict[str, Any]:
    payload = loadPayload(path)
    if not isinstance(payload, dict):
        raise EvaluationError(f"document root must be a mapping: {relativePath(path)}")
    return payload


def sha256File(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def currentGitHead() -> str | None:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"), cwd=ROOT, check=True, capture_output=True, text=True, timeout=5
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() or None


def isSha256(value: Any) -> bool:
    return isinstance(value, str) and len(value) == 64 and all(character in "0123456789abcdef" for character in value)


def canonicalHash(payload: Any) -> str:
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def expectedScopeBinding(inputManifest: dict[str, Any]) -> dict[str, Any] | None:
    scope = inputManifest.get("scope")
    if isinstance(scope, dict) and scope.get("sealState") == "sealed":
        return scope
    draft = inputManifest.get("draftBundle")
    return draft if isinstance(draft, dict) else scope if isinstance(scope, dict) else None


def evidenceRefValid(value: Any) -> bool:
    return isinstance(value, dict) and isinstance(value.get("path"), str) and bool(value["path"].strip())


def validatePromptAudit(report: dict[str, Any], failures: list[str]) -> None:
    promptAudit = report.get("promptAudit")
    expected = {"targetScorePresent": False, "priorScorePresent": False, "desiredConclusionPresent": False}
    if promptAudit != expected:
        failures.append("promptAudit must prove target, prior score, and desired conclusion were absent")


def validateDimensions(report: dict[str, Any], rubric: dict[str, Any], failures: list[str]) -> None:
    dimensions = report.get("dimensions")
    if not isinstance(dimensions, dict) or set(dimensions) != set(DIMENSION_IDS):
        failures.append("dimensions must contain the seven canonical rubric IDs exactly once")
        return
    rubricRows = rubric.get("dimensions")
    weights = {
        row.get("id"): row.get("weight")
        for row in rubricRows
        if isinstance(rubricRows, list) and isinstance(row, dict)
    } if isinstance(rubricRows, list) else {}
    scoreTotal = 0.0
    for dimensionId, rawDimension in dimensions.items():
        if not isinstance(rawDimension, dict):
            failures.append(f"dimension {dimensionId} must be a mapping")
            continue
        if set(rawDimension) != {"score", "maxScore", "evidenceRefs", "counterEvidence"}:
            failures.append(f"dimension {dimensionId} has an invalid field set")
            continue
        score = rawDimension.get("score")
        maxScore = rawDimension.get("maxScore")
        if not isinstance(score, (int, float)) or not isinstance(maxScore, (int, float)) or score < 0 or score > maxScore:
            failures.append(f"dimension {dimensionId} score is invalid")
        else:
            scoreTotal += float(score)
        if maxScore != weights.get(dimensionId):
            failures.append(f"dimension {dimensionId} maxScore does not match the frozen rubric")
        refs = rawDimension.get("evidenceRefs")
        counterEvidence = rawDimension.get("counterEvidence")
        if not isinstance(refs, list) or not refs or not all(evidenceRefValid(item) for item in refs):
            failures.append(f"dimension {dimensionId} needs concrete evidenceRefs")
        if not isinstance(counterEvidence, list) or not counterEvidence or not all(isinstance(item, str) and item for item in counterEvidence):
            failures.append(f"dimension {dimensionId} needs counterEvidence")
    totalScore = report.get("totalScore")
    if not isinstance(totalScore, (int, float)) or abs(float(totalScore) - scoreTotal) > 0.000001:
        failures.append("totalScore must equal the untouched sum of dimension scores")


def validateFindings(report: dict[str, Any], failures: list[str]) -> None:
    findings = report.get("findings")
    if not isinstance(findings, list):
        failures.append("findings must be a list")
        return
    ids: set[str] = set()
    for index, finding in enumerate(findings):
        if not isinstance(finding, dict):
            failures.append(f"finding {index} must be a mapping")
            continue
        required = {"findingId", "severity", "title", "claim", "evidenceRefs", "counterEvidence", "impact"}
        if set(finding) != required:
            failures.append(f"finding {index} has an invalid field set")
            continue
        findingId = finding.get("findingId")
        if not isinstance(findingId, str) or findingId in ids:
            failures.append(f"finding {index} has a missing or duplicate findingId")
        else:
            ids.add(findingId)
        if finding.get("severity") not in {"P0", "P1", "P2"}:
            failures.append(f"finding {findingId} has invalid severity")
        refs = finding.get("evidenceRefs")
        if not isinstance(refs, list) or not refs or not all(evidenceRefValid(item) for item in refs):
            failures.append(f"finding {findingId} needs evidenceRefs")
        counterEvidence = finding.get("counterEvidence")
        if not isinstance(counterEvidence, list) or not counterEvidence:
            failures.append(f"finding {findingId} needs counterEvidence")


def validateMaturity(report: dict[str, Any], failures: list[str]) -> None:
    maturity = report.get("productEvidenceMaturity")
    if not isinstance(maturity, dict) or set(maturity) != {"stage", "rationale", "evidenceRefs"}:
        failures.append("productEvidenceMaturity must contain stage, rationale, and evidenceRefs")
        return
    if maturity.get("stage") not in {"E0", "E1", "E2", "E3", "E4"}:
        failures.append("productEvidenceMaturity.stage is invalid")
    refs = maturity.get("evidenceRefs")
    if not isinstance(refs, list) or not refs or not all(evidenceRefValid(item) for item in refs):
        failures.append("productEvidenceMaturity needs concrete evidenceRefs")


def validateRawReport(
    report: dict[str, Any], *, discipline: str, rubric: dict[str, Any], manifest: dict[str, Any], roster: dict[str, Any]
) -> list[str]:
    failures: list[str] = []
    required = loadMapping(SCHEMA_PATH).get("required")
    if not isinstance(required, list) or not set(required).issubset(report):
        missing = sorted(set(required or []) - set(report))
        failures.append(f"raw report misses required fields: {', '.join(missing)}")
        return failures
    if report.get("schemaVersion") != 1 or report.get("roundId") != manifest.get("roundId"):
        failures.append("raw report schemaVersion or roundId does not match")
    if report.get("discipline") != discipline:
        failures.append(f"raw report discipline must be {discipline}")
    slots = roster.get("slots")
    slot = slots.get(discipline) if isinstance(slots, dict) else None
    if not isinstance(slot, dict) or report.get("evaluatorId") != slot.get("evaluatorId"):
        failures.append(f"raw report evaluator does not match the eligible {discipline} roster slot")
    rubricMeta = manifest.get("rubric")
    scope = manifest.get("scope")
    if not isinstance(rubricMeta, dict) or report.get("rubricVersion") != rubricMeta.get("version"):
        failures.append("raw report rubricVersion does not match")
    if not isinstance(rubricMeta, dict) or report.get("rubricHash") != rubricMeta.get("sha256"):
        failures.append("raw report rubricHash does not match")
    if not isinstance(scope, dict):
        failures.append("sealed scope is missing")
    else:
        expectedScope = {
            "evaluationBundleHash": scope.get("evaluationBundleHash"),
            "scopeGitCommit": scope.get("gitCommit"),
            "scopeDirtyDiffHash": scope.get("dirtyDiffHash"),
            "scopeManifestHash": scope.get("manifestHash"),
        }
        for key, expected in expectedScope.items():
            if report.get(key) != expected or not isSha256(expected) and key != "scopeGitCommit":
                failures.append(f"raw report {key} does not match the sealed scope")
    validatePromptAudit(report, failures)
    validateDimensions(report, rubric, failures)
    validateFindings(report, failures)
    validateMaturity(report, failures)
    return failures


def validateRoster(roster: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    if roster.get("roundEligible") is not True or roster.get("roundState") != "ready":
        failures.append("evaluator roster is not ready and eligible")
    slots = roster.get("slots")
    evaluatorIds: list[str] = []
    for discipline in DISCIPLINES:
        slot = slots.get(discipline) if isinstance(slots, dict) else None
        if not isinstance(slot, dict):
            failures.append(f"{discipline} evaluator slot is absent")
            continue
        evaluatorId = slot.get("evaluatorId")
        if not isinstance(evaluatorId, str) or not evaluatorId:
            failures.append(f"{discipline} evaluator is unassigned")
        else:
            evaluatorIds.append(evaluatorId)
        if slot.get("eligible") is not True:
            failures.append(f"{discipline} evaluator is not eligible")
        if slot.get("remediationParticipation") is not False or slot.get("priorRoundParticipation") is not False:
            failures.append(f"{discipline} evaluator independence is not proven")
        if slot.get("conflictOfInterest") is not False:
            failures.append(f"{discipline} evaluator conflict status is not clean")
    if len(evaluatorIds) != len(set(evaluatorIds)):
        failures.append("evaluator IDs must be unique")
    return failures


def validateBundleManifest(bundle: dict[str, Any], inputManifest: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    if bundle.get("schemaVersion") != 1 or bundle.get("roundId") != inputManifest.get("roundId"):
        failures.append("evaluation bundle schemaVersion or roundId does not match")
    if bundle.get("state") != "sealed":
        failures.append("evaluation bundle manifest is not sealed")
    readiness = bundle.get("roundReadiness")
    if not isinstance(readiness, dict) or readiness.get("sealEligible") is not True:
        failures.append("evaluation bundle is not eligible for a round seal")
    bundleScope = bundle.get("scope")
    inputScope = expectedScopeBinding(inputManifest)
    if not isinstance(bundleScope, dict) or not isinstance(inputScope, dict):
        failures.append("evaluation bundle or input scope is absent")
    else:
        expectedFields = {
            "gitCommit": inputScope.get("gitCommit"),
            "dirtyDiffHash": inputScope.get("dirtyDiffHash"),
            "manifestHash": inputScope.get("manifestHash"),
        }
        for field, expected in expectedFields.items():
            if bundleScope.get(field) != expected:
                failures.append(f"evaluation bundle scope {field} does not match the sealed input")
    archive = bundle.get("archive")
    if not isinstance(archive, dict) or not isSha256(archive.get("sha256")):
        failures.append("evaluation bundle archive hash is absent")
    elif isinstance(inputScope, dict) and archive.get("sha256") != inputScope.get("evaluationBundleHash"):
        failures.append("evaluation bundle archive hash does not match the sealed input")
    rows = bundle.get("files")
    if not isinstance(rows, list) or not rows:
        failures.append("evaluation bundle file manifest is absent")
    else:
        paths: list[str] = []
        validRows = True
        for row in rows:
            if (
                not isinstance(row, dict)
                or not isinstance(row.get("path"), str)
                or not isSha256(row.get("sha256"))
                or not isinstance(row.get("bytes"), int)
                or row["bytes"] < 0
            ):
                validRows = False
                continue
            paths.append(row["path"])
        if not validRows or len(paths) != len(rows):
            failures.append("evaluation bundle file rows are malformed")
        if paths != sorted(paths) or len(paths) != len(set(paths)):
            failures.append("evaluation bundle file paths must be sorted and unique")
        forbidden = [
            path
            for path in paths
            if any(path.startswith(prefix) for prefix in FORBIDDEN_BUNDLE_PREFIXES)
            or any(part in FORBIDDEN_BUNDLE_SEGMENTS for part in Path(path).parts)
        ]
        if forbidden:
            failures.append("evaluation bundle contains excluded history or generated paths")
        if isinstance(bundleScope, dict):
            expectedManifestHash = canonicalHash({"schemaVersion": 1, "files": rows})
            if bundleScope.get("manifestHash") != expectedManifestHash:
                failures.append("evaluation bundle scope manifestHash is invalid")
            if bundleScope.get("fileCount") != len(rows):
                failures.append("evaluation bundle scope fileCount is invalid")
            if bundleScope.get("totalBytes") != sum(
                row.get("bytes", 0) for row in rows if isinstance(row, dict) and isinstance(row.get("bytes"), int)
            ):
                failures.append("evaluation bundle scope totalBytes is invalid")
    exclusions = bundle.get("exclusions")
    if (
        not isinstance(exclusions, dict)
        or exclusions.get("priorScoresIncluded") is not False
        or exclusions.get("priorConclusionsIncluded") is not False
    ):
        failures.append("evaluation bundle prior score and conclusion exclusions are not proven")
    contracts = bundle.get("contracts")
    rubricContract = next(
        (
            row
            for row in contracts
            if isinstance(contracts, list)
            and isinstance(row, dict)
            and row.get("bundlePath") == "evaluation-contract/rubric.yml"
        ),
        None,
    ) if isinstance(contracts, list) else None
    rubricMeta = inputManifest.get("rubric")
    if (
        not isinstance(rubricContract, dict)
        or not isinstance(rubricMeta, dict)
        or rubricContract.get("sha256") != rubricMeta.get("sha256")
    ):
        failures.append("evaluation bundle frozen rubric hash does not match the input")
    return failures


def validateFactAudit(factAudit: dict[str, Any], inputManifest: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    if factAudit.get("schemaVersion") != 1 or factAudit.get("roundId") != inputManifest.get("roundId"):
        failures.append("round fact audit schemaVersion or roundId does not match")
    if factAudit.get("passed") is not True or factAudit.get("auditComplete") is not True:
        failures.append("round fact audit is incomplete or failed")
    if factAudit.get("scoreThresholdApplied") is not False:
        failures.append("round fact audit must not apply a score threshold")
    if factAudit.get("roundSealEligible") is not True or factAudit.get("state") == "draft":
        failures.append("round fact audit is not bound to a seal-eligible scope")
    scope = factAudit.get("scope")
    inputScope = expectedScopeBinding(inputManifest)
    if not isinstance(scope, dict) or not isinstance(inputScope, dict):
        failures.append("round fact audit or input scope is absent")
    else:
        expected = {
            "gitCommit": inputScope.get("gitCommit"),
            "dirtyDiffHash": inputScope.get("dirtyDiffHash"),
            "manifestHash": inputScope.get("manifestHash"),
            "evaluationBundleHash": inputScope.get("evaluationBundleHash"),
        }
        for field, value in expected.items():
            if scope.get(field) != value:
                failures.append(f"round fact audit {field} does not match the sealed input")
    facts = factAudit.get("facts")
    if not isinstance(facts, dict) or not REQUIRED_FACT_DOMAINS.issubset(facts):
        failures.append("round fact audit misses required fact domains")
        return failures
    bundleIntegrity = facts.get("bundleIntegrity")
    if (
        not isinstance(bundleIntegrity, dict)
        or bundleIntegrity.get("archiveEntriesReadOnly") is not True
        or bundleIntegrity.get("excludedHistoryPathCount") != 0
        or bundleIntegrity.get("priorScoresIncluded") is not False
        or bundleIntegrity.get("priorConclusionsIncluded") is not False
    ):
        failures.append("round fact audit bundle integrity facts are invalid")
    requiredPaths = facts.get("requiredPaths")
    if not isinstance(requiredPaths, dict) or requiredPaths.get("missing") != []:
        failures.append("round fact audit required path check failed")
    symbols = facts.get("symbols")
    if not isinstance(symbols, dict) or symbols.get("requiredMissing") != []:
        failures.append("round fact audit required symbol check failed")
    qualityGates = facts.get("qualityGates")
    if (
        not isinstance(qualityGates, dict)
        or qualityGates.get("requiredMissing") != []
        or qualityGates.get("planQualityRegistered") is not True
    ):
        failures.append("round fact audit gate registry check failed")
    dependency = facts.get("dependencyBootstrap")
    if not isinstance(dependency, dict) or dependency.get("negativeFixtureRejected") is not True:
        failures.append("round fact audit bootstrap negative fixture check failed")
    learning = facts.get("learningCoverage")
    requiredLearningFields = {
        "lessonCount", "strongCheckSpecCount", "strongCheckSpecLessonCount", "weakOnlyLessonCount",
        "masteryAssessmentLessonCount", "transferAssessmentLessonCount", "retrievalAssessmentLessonCount",
        "topTierEligible", "completionEligible",
    }
    if not isinstance(learning, dict) or not requiredLearningFields.issubset(learning):
        failures.append("round fact audit learning coverage facts are incomplete")
    return failures


def verifyRoundEvidence() -> dict[str, Any]:
    manifest = loadMapping(INPUT_PATH)
    roster = loadMapping(ROSTER_PATH)
    rubric = loadMapping(RUBRIC_PATH)
    failures: list[str] = []
    rubricMeta = manifest.get("rubric")
    if not isinstance(rubricMeta, dict) or rubricMeta.get("sha256") != sha256File(RUBRIC_PATH):
        failures.append("input manifest rubric hash is stale")
    if rubric.get("targetScore") is not None or rubric.get("passThreshold") is not None:
        failures.append("rubric must not define a target score or pass threshold")
    if manifest.get("sealed") is not True or manifest.get("roundState") != "ready":
        failures.append("R10 input manifest is not sealed and ready")
    scope = manifest.get("scope")
    if not isinstance(scope, dict) or scope.get("sealState") != "sealed":
        failures.append("R10 scope is not sealed")
    else:
        for field in ("dirtyDiffHash", "manifestHash", "evaluationBundleHash"):
            if not isSha256(scope.get(field)):
                failures.append(f"R10 scope {field} is missing")
    failures.extend(validateRoster(roster))
    if not BUNDLE_PATH.is_file():
        failures.append(f"evaluation bundle manifest is absent: {relativePath(BUNDLE_PATH)}")
    else:
        bundle = loadMapping(BUNDLE_PATH)
        failures.extend(validateBundleManifest(bundle, manifest))
    if not FACT_AUDIT_PATH.is_file():
        failures.append(f"round fact audit is absent: {relativePath(FACT_AUDIT_PATH)}")
    else:
        factAudit = loadMapping(FACT_AUDIT_PATH)
        failures.extend(validateFactAudit(factAudit, manifest))
    if not FINDING_LEDGER_PATH.is_file():
        failures.append(f"finding ledger is absent: {relativePath(FINDING_LEDGER_PATH)}")
    validatedReports = 0
    for discipline in DISCIPLINES:
        reportPath = ROUND_ROOT / "reports" / f"{discipline}.yml"
        if not reportPath.is_file():
            failures.append(f"raw {discipline} report is absent: {relativePath(reportPath)}")
            continue
        report = loadMapping(reportPath)
        reportFailures = validateRawReport(report, discipline=discipline, rubric=rubric, manifest=manifest, roster=roster)
        failures.extend(f"{discipline}: {failure}" for failure in reportFailures)
        if not reportFailures:
            validatedReports += 1
    return {
        "passed": not failures,
        "roundId": manifest.get("roundId"),
        "validatedReportCount": validatedReports,
        "requiredReportCount": len(DISCIPLINES),
        "scoreThresholdApplied": False,
        "failures": sorted(set(failures)),
    }


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    try:
        result = verifyRoundEvidence()
    except EvaluationError as exc:
        result = {
            "passed": False,
            "roundId": "R10",
            "validatedReportCount": 0,
            "requiredReportCount": len(DISCIPLINES),
            "scoreThresholdApplied": False,
            "failures": [str(exc)],
        }
    payload = {
        "schemaVersion": 1,
        "gate": "plan-quality",
        "audit": "evaluation-report-completeness",
        "status": "passed" if result["passed"] else "blocked",
        "passed": result["passed"],
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "reportPath": relativePath(REPORT_PATH),
        **{key: value for key, value in result.items() if key != "passed"},
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not result["passed"]:
        print("BLOCKED: independent R10 evidence is incomplete", file=sys.stderr)
        for failure in result["failures"]:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    print("ok: independent R10 reports are complete; no score threshold was applied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
