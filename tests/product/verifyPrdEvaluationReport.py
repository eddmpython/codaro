from __future__ import annotations

import argparse
from datetime import UTC, datetime
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import time
from typing import Any
import zipfile

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
RUBRIC_PATH = ROOT / "contracts" / "prdEvaluationRubric.yml"
SCHEMA_PATH = ROOT / "contracts" / "prdEvaluationReport.schema.yml"
LEDGER_SCHEMA_PATH = ROOT / "contracts" / "prdEvaluationFindingLedger.schema.yml"
INPUT_PATH = ROUND_ROOT / "r10-input-manifest.yml"
ROSTER_PATH = ROUND_ROOT / "evaluator-roster.yml"
BUNDLE_PATH = ROUND_ROOT / "evaluation-bundle.manifest.yml"
FACT_AUDIT_PATH = ROUND_ROOT / "fact-audit.json"
FINDING_LEDGER_PATH = ROUND_ROOT / "finding-ledger.yml"
REPORT_PATH = ROOT / "output" / "test-runner" / "plan-quality" / "evaluation-validation.json"
DISCIPLINES = ("learning", "ux", "architecture")
FORBIDDEN_BUNDLE_PREFIXES = (
    "mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/",
)
FORBIDDEN_BUNDLE_SEGMENTS = {
    ".cache", ".git", ".pytest_cache", ".ruff_cache", ".tmp", ".venv", "__pycache__",
    "build", "coverage", "dist", "node_modules", "output",
}
REQUIRED_FACT_DOMAINS = {
    "bundleIntegrity", "requiredPaths", "symbols", "qualityGates", "learningCoverage", "machineEvidence",
    "mainPlanTodoPolicy",
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
READINESS_BLOCKERS = {
    "R10 input manifest is not sealed and ready",
    "R10 scope is not sealed",
    "evaluation bundle is not eligible for a round seal",
    "evaluation bundle manifest is not sealed",
    "evaluation bundle scope is not sealed",
    "evaluator roster is not ready and eligible",
    "round fact audit is not bound to a seal-eligible scope",
}


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


def parseTimestamp(value: Any, *, field: str) -> datetime:
    if not isinstance(value, str) or not value:
        raise EvaluationError(f"{field} must be a timezone-aware ISO-8601 timestamp")
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise EvaluationError(f"{field} must be a timezone-aware ISO-8601 timestamp") from exc
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise EvaluationError(f"{field} must be a timezone-aware ISO-8601 timestamp")
    return parsed.astimezone(UTC)


def expectedScopeBinding(inputManifest: dict[str, Any]) -> dict[str, Any] | None:
    scope = inputManifest.get("scope")
    if isinstance(scope, dict) and scope.get("sealState") == "sealed":
        return scope
    draft = inputManifest.get("draftBundle")
    return draft if isinstance(draft, dict) else scope if isinstance(scope, dict) else None


def evidenceRefValid(
    value: Any,
    *,
    evidenceFiles: dict[str, bytes] | None = None,
) -> bool:
    if not isinstance(value, dict):
        return False
    allowed = {"path", "line", "symbol", "command", "resultHash"}
    if not set(value).issubset(allowed) or "path" not in value:
        return False
    path = value.get("path")
    if not isinstance(path, str) or not path.strip():
        return False
    if not any(key in value for key in ("line", "symbol", "command", "resultHash")):
        return False
    line = value.get("line")
    if line is not None and (isinstance(line, bool) or not isinstance(line, int) or line < 1):
        return False
    for field in ("symbol", "command"):
        item = value.get(field)
        if item is not None and (not isinstance(item, str) or not item.strip()):
            return False
    resultHash = value.get("resultHash")
    if resultHash is not None and not isSha256(resultHash):
        return False
    if evidenceFiles is None:
        return True
    payload = evidenceFiles.get(path)
    if payload is None:
        return False
    if line is not None and line > max(1, len(payload.decode("utf-8", errors="replace").splitlines())):
        return False
    symbol = value.get("symbol")
    if isinstance(symbol, str) and symbol not in payload.decode("utf-8", errors="replace"):
        return False
    return True


def reportEvidenceRefs(report: dict[str, Any]) -> list[dict[str, Any]]:
    refs: list[dict[str, Any]] = []
    dimensions = report.get("dimensions")
    if isinstance(dimensions, dict):
        for dimension in dimensions.values():
            if isinstance(dimension, dict) and isinstance(dimension.get("evidenceRefs"), list):
                refs.extend(item for item in dimension["evidenceRefs"] if isinstance(item, dict))
    findings = report.get("findings")
    if isinstance(findings, list):
        for finding in findings:
            if isinstance(finding, dict) and isinstance(finding.get("evidenceRefs"), list):
                refs.extend(item for item in finding["evidenceRefs"] if isinstance(item, dict))
    maturity = report.get("productEvidenceMaturity")
    if isinstance(maturity, dict) and isinstance(maturity.get("evidenceRefs"), list):
        refs.extend(item for item in maturity["evidenceRefs"] if isinstance(item, dict))
    return refs


def validatePromptAudit(report: dict[str, Any], failures: list[str]) -> None:
    promptAudit = report.get("promptAudit")
    expected = {"targetScorePresent": False, "priorScorePresent": False, "desiredConclusionPresent": False}
    if promptAudit != expected:
        failures.append("promptAudit must prove target, prior score, and desired conclusion were absent")


def validateDimensions(
    report: dict[str, Any],
    rubric: dict[str, Any],
    failures: list[str],
    *,
    evidenceFiles: dict[str, bytes] | None = None,
) -> None:
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
        if (
            not isinstance(refs, list)
            or not refs
            or not all(evidenceRefValid(item, evidenceFiles=evidenceFiles) for item in refs)
        ):
            failures.append(f"dimension {dimensionId} needs concrete evidenceRefs")
        if not isinstance(counterEvidence, list) or not counterEvidence or not all(isinstance(item, str) and item for item in counterEvidence):
            failures.append(f"dimension {dimensionId} needs counterEvidence")
    totalScore = report.get("totalScore")
    if not isinstance(totalScore, (int, float)) or abs(float(totalScore) - scoreTotal) > 0.000001:
        failures.append("totalScore must equal the untouched sum of dimension scores")


def validateFindings(
    report: dict[str, Any],
    failures: list[str],
    *,
    evidenceFiles: dict[str, bytes] | None = None,
) -> None:
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
        if (
            not isinstance(findingId, str)
            or re.fullmatch(r"[A-Z]+-[0-9]+", findingId) is None
            or findingId in ids
        ):
            failures.append(f"finding {index} has a missing or duplicate findingId")
        else:
            ids.add(findingId)
        if finding.get("severity") not in {"P0", "P1", "P2"}:
            failures.append(f"finding {findingId} has invalid severity")
        refs = finding.get("evidenceRefs")
        if (
            not isinstance(refs, list)
            or not refs
            or not all(evidenceRefValid(item, evidenceFiles=evidenceFiles) for item in refs)
        ):
            failures.append(f"finding {findingId} needs evidenceRefs")
        counterEvidence = finding.get("counterEvidence")
        if (
            not isinstance(counterEvidence, list)
            or not counterEvidence
            or not all(isinstance(item, str) and item.strip() for item in counterEvidence)
        ):
            failures.append(f"finding {findingId} needs counterEvidence")
        for field in ("title", "claim", "impact"):
            value = finding.get(field)
            if not isinstance(value, str) or not value.strip():
                failures.append(f"finding {findingId} needs {field}")


def validateMaturity(
    report: dict[str, Any],
    failures: list[str],
    *,
    evidenceFiles: dict[str, bytes] | None = None,
) -> None:
    maturity = report.get("productEvidenceMaturity")
    if not isinstance(maturity, dict) or set(maturity) != {"stage", "rationale", "evidenceRefs"}:
        failures.append("productEvidenceMaturity must contain stage, rationale, and evidenceRefs")
        return
    if maturity.get("stage") not in {"E0", "E1", "E2", "E3", "E4"}:
        failures.append("productEvidenceMaturity.stage is invalid")
    refs = maturity.get("evidenceRefs")
    if (
        not isinstance(refs, list)
        or not refs
        or not all(evidenceRefValid(item, evidenceFiles=evidenceFiles) for item in refs)
    ):
        failures.append("productEvidenceMaturity needs concrete evidenceRefs")
    rationale = maturity.get("rationale")
    if not isinstance(rationale, str) or not rationale.strip():
        failures.append("productEvidenceMaturity needs a rationale")


def validateRawReport(
    report: dict[str, Any],
    *,
    discipline: str,
    rubric: dict[str, Any],
    manifest: dict[str, Any],
    roster: dict[str, Any],
    evidenceFiles: dict[str, bytes] | None = None,
) -> list[str]:
    failures: list[str] = []
    schema = loadMapping(SCHEMA_PATH)
    required = schema.get("required")
    if not isinstance(required, list) or not set(required).issubset(report):
        missing = sorted(set(required or []) - set(report))
        failures.append(f"raw report misses required fields: {', '.join(missing)}")
        return failures
    properties = schema.get("properties")
    allowedFields = set(properties) if isinstance(properties, dict) else set(required)
    if set(report) != allowedFields:
        failures.append("raw report must match the closed schema field set")
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
            validExpected = (
                isinstance(expected, str)
                and len(expected) in {40, 64}
                and all(character in "0123456789abcdef" for character in expected)
            ) if key == "scopeGitCommit" else isSha256(expected)
            if report.get(key) != expected or not validExpected:
                failures.append(f"raw report {key} does not match the sealed scope")
    for field in ("evaluationId", "evaluatorId"):
        value = report.get(field)
        if not isinstance(value, str) or not value.strip():
            failures.append(f"raw report {field} is missing")
    scopePaths = report.get("scopePaths")
    if (
        not isinstance(scopePaths, list)
        or not scopePaths
        or not all(isinstance(item, str) and item.strip() for item in scopePaths)
        or len(scopePaths) != len(set(scopePaths))
    ):
        failures.append("raw report scopePaths must be a non-empty unique list")
    elif evidenceFiles is not None:
        availablePaths = tuple(evidenceFiles)
        for path in scopePaths:
            if not isinstance(path, str) or not any(
                candidate == path or candidate.startswith(path.rstrip("/") + "/")
                for candidate in availablePaths
            ):
                failures.append(f"raw report scope path is outside the sealed bundle: {path}")
    excludedPriorReports = report.get("excludedPriorReports")
    if (
        not isinstance(excludedPriorReports, list)
        or not excludedPriorReports
        or not all(isinstance(item, str) and item.strip() for item in excludedPriorReports)
        or len(excludedPriorReports) != len(set(excludedPriorReports))
    ):
        failures.append("raw report excludedPriorReports must be a non-empty unique list")
    elif not any("01-prd-improvement-loop" in item for item in excludedPriorReports):
        failures.append("raw report does not record the prior-report exclusion boundary")
    try:
        startedAt = parseTimestamp(report.get("startedAt"), field="raw report startedAt")
        completedAt = parseTimestamp(report.get("completedAt"), field="raw report completedAt")
        if completedAt < startedAt:
            failures.append("raw report completedAt precedes startedAt")
        if isinstance(slot, dict):
            availability = slot.get("availability")
            if isinstance(availability, dict):
                availableFrom = parseTimestamp(
                    availability.get("startsAt"),
                    field=f"{discipline} evaluator availability.startsAt",
                )
                availableUntil = parseTimestamp(
                    availability.get("endsAt"),
                    field=f"{discipline} evaluator availability.endsAt",
                )
                signedAt = parseTimestamp(
                    slot.get("signedAt"),
                    field=f"{discipline} evaluator signedAt",
                )
                if not availableFrom <= signedAt <= startedAt <= completedAt <= availableUntil:
                    failures.append(f"raw report is outside the signed {discipline} evaluator availability")
    except EvaluationError as exc:
        failures.append(str(exc))
    validatePromptAudit(report, failures)
    validateDimensions(report, rubric, failures, evidenceFiles=evidenceFiles)
    validateFindings(report, failures, evidenceFiles=evidenceFiles)
    validateMaturity(report, failures, evidenceFiles=evidenceFiles)
    refs = reportEvidenceRefs(report)
    if any(
        "/08-r10-independent-review/reports/" in str(ref.get("path")).replace("\\", "/")
        or str(ref.get("path")).replace("\\", "/").startswith("reports/")
        for ref in refs
    ):
        failures.append("raw report must not reference another evaluator report")
    limitations = report.get("limitations")
    if not isinstance(limitations, list) or not all(isinstance(item, str) and item.strip() for item in limitations):
        failures.append("raw report limitations must be a string list")
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
        expectedSlotFields = {
            "evaluatorId",
            "expertiseEvidence",
            "remediationParticipation",
            "priorRoundParticipation",
            "conflictOfInterest",
            "availability",
            "signedAt",
            "signatureHash",
            "eligible",
        }
        if set(slot) != expectedSlotFields:
            failures.append(f"{discipline} evaluator slot has an invalid field set")
        evaluatorId = slot.get("evaluatorId")
        if not isinstance(evaluatorId, str) or not evaluatorId:
            failures.append(f"{discipline} evaluator is unassigned")
            continue
        evaluatorIds.append(evaluatorId)
        if slot.get("eligible") is not True:
            failures.append(f"{discipline} evaluator is not eligible")
        if slot.get("remediationParticipation") is not False or slot.get("priorRoundParticipation") is not False:
            failures.append(f"{discipline} evaluator independence is not proven")
        if slot.get("conflictOfInterest") is not False:
            failures.append(f"{discipline} evaluator conflict status is not clean")
        expertiseEvidence = slot.get("expertiseEvidence")
        if not isinstance(expertiseEvidence, str) or not expertiseEvidence.strip():
            failures.append(f"{discipline} evaluator expertise evidence is absent")
        availability = slot.get("availability")
        if not isinstance(availability, dict) or set(availability) != {"startsAt", "endsAt"}:
            failures.append(f"{discipline} evaluator availability is invalid")
        else:
            try:
                startsAt = parseTimestamp(
                    availability.get("startsAt"),
                    field=f"{discipline} evaluator availability.startsAt",
                )
                endsAt = parseTimestamp(
                    availability.get("endsAt"),
                    field=f"{discipline} evaluator availability.endsAt",
                )
                signedAt = parseTimestamp(slot.get("signedAt"), field=f"{discipline} evaluator signedAt")
                if startsAt >= endsAt:
                    failures.append(f"{discipline} evaluator availability is invalid")
                if signedAt > endsAt:
                    failures.append(f"{discipline} evaluator signature is outside availability")
            except EvaluationError:
                failures.append(f"{discipline} evaluator availability or signature is invalid")
        if not isSha256(slot.get("signatureHash")):
            failures.append(f"{discipline} evaluator signature hash is absent")
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
        if bundleScope.get("sealState") != "sealed":
            failures.append("evaluation bundle scope is not sealed")
        expectedFields = {
            "gitCommit": inputScope.get("gitCommit"),
            "dirtyDiffHash": inputScope.get("dirtyDiffHash"),
            "manifestHash": inputScope.get("manifestHash"),
        }
        for field, expected in expectedFields.items():
            if bundleScope.get(field) != expected:
                failures.append(f"evaluation bundle scope {field} does not match the sealed input")
    archive = bundle.get("archive")
    if (
        not isinstance(archive, dict)
        or not isSha256(archive.get("sha256"))
        or archive.get("readOnlyEntries") is not True
    ):
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
    ledgerContract = next(
        (
            row
            for row in contracts
            if isinstance(contracts, list)
            and isinstance(row, dict)
            and row.get("bundlePath") == "evaluation-contract/finding-ledger.schema.yml"
        ),
        None,
    ) if isinstance(contracts, list) else None
    if (
        not isinstance(ledgerContract, dict)
        or ledgerContract.get("sha256") != sha256File(LEDGER_SCHEMA_PATH)
    ):
        failures.append("evaluation bundle finding ledger schema hash is stale")
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
    machineEvidence = facts.get("machineEvidence")
    if not isinstance(machineEvidence, dict):
        failures.append("round fact audit machine evidence check failed")
    elif (
        machineEvidence.get("scopeClean") is True
        and (
            machineEvidence.get("allCurrent") is not True
            or machineEvidence.get("includedReportCount") != machineEvidence.get("requiredReportCount")
            or machineEvidence.get("blockingReasons") != []
        )
    ):
        failures.append("round fact audit machine evidence check failed")
    todoPolicy = facts.get("mainPlanTodoPolicy")
    if (
        not isinstance(todoPolicy, dict)
        or todoPolicy.get("todoOnly") is not True
        or todoPolicy.get("policyTestPresent") is not True
    ):
        failures.append("round fact audit mainPlan TODO-only policy check failed")
    learning = facts.get("learningCoverage")
    requiredLearningFields = {
        "lessonCount", "strongCheckSpecCount", "strongCheckSpecLessonCount", "weakOnlyLessonCount",
        "masteryAssessmentLessonCount", "transferAssessmentLessonCount", "retrievalAssessmentLessonCount",
        "topTierEligible", "completionEligible",
    }
    if not isinstance(learning, dict) or not requiredLearningFields.issubset(learning):
        failures.append("round fact audit learning coverage facts are incomplete")
    return failures


def loadBundleEvidence(bundle: dict[str, Any]) -> dict[str, bytes]:
    archive = bundle.get("archive")
    rows = bundle.get("files")
    if not isinstance(archive, dict) or not isinstance(rows, list):
        raise EvaluationError("evaluation bundle archive inventory is absent")
    relativeArchive = archive.get("path")
    if not isinstance(relativeArchive, str) or not relativeArchive:
        raise EvaluationError("evaluation bundle archive path is absent")
    archivePath = (ROOT / relativeArchive).resolve()
    if not archivePath.is_relative_to(ROOT.resolve()) or not archivePath.is_file():
        raise EvaluationError("evaluation bundle archive path is unavailable")
    expectedRows = {
        row["path"]: row
        for row in rows
        if isinstance(row, dict) and isinstance(row.get("path"), str)
    }
    if len(expectedRows) != len(rows):
        raise EvaluationError("evaluation bundle archive inventory is malformed")
    try:
        with zipfile.ZipFile(archivePath) as zipped:
            if zipped.namelist() != list(expectedRows):
                raise EvaluationError("evaluation bundle archive paths differ from the manifest")
            files = {path: zipped.read(path) for path in expectedRows}
    except (OSError, KeyError, zipfile.BadZipFile) as exc:
        raise EvaluationError("evaluation bundle archive cannot be read") from exc
    for path, payload in files.items():
        row = expectedRows[path]
        if hashlib.sha256(payload).hexdigest() != row.get("sha256") or len(payload) != row.get("bytes"):
            raise EvaluationError(f"evaluation bundle evidence is stale: {path}")
    return files


def sealIndependentReport(
    report: dict[str, Any],
    *,
    discipline: str,
    rubric: dict[str, Any],
    manifest: dict[str, Any],
    roster: dict[str, Any],
    evidenceFiles: dict[str, bytes] | None = None,
    rawBytes: bytes | None = None,
) -> dict[str, Any]:
    failures = validateRawReport(
        report,
        discipline=discipline,
        rubric=rubric,
        manifest=manifest,
        roster=roster,
        evidenceFiles=evidenceFiles,
    )
    if failures:
        raise EvaluationError("; ".join(sorted(set(failures))))
    reportBytes = rawBytes if rawBytes is not None else json.dumps(
        report,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    findings = report.get("findings")
    assert isinstance(findings, list)
    seal = {
        "evaluationId": report["evaluationId"],
        "evaluatorId": report["evaluatorId"],
        "rawReportHash": hashlib.sha256(reportBytes).hexdigest(),
        "totalScore": report["totalScore"],
        "findingCount": len(findings),
        "completedAt": report["completedAt"],
    }
    return {
        "discipline": discipline,
        "seal": seal,
        "findings": findings,
        "report": report,
    }


def renderIndependentReportMarkdown(sealedReport: dict[str, Any]) -> str:
    report = sealedReport["report"]
    seal = sealedReport["seal"]
    lines = [
        f"# {report['roundId']} {report['discipline']} independent review",
        "",
        f"- Evaluation: `{report['evaluationId']}`",
        f"- Evaluator: `{report['evaluatorId']}`",
        f"- Raw report SHA-256: `{seal['rawReportHash']}`",
        f"- Total score: {report['totalScore']} / 100",
        f"- Product evidence maturity: {report['productEvidenceMaturity']['stage']}",
        "",
        "## Dimensions",
        "",
    ]
    for dimensionId in DIMENSION_IDS:
        dimension = report["dimensions"][dimensionId]
        lines.append(f"- `{dimensionId}`: {dimension['score']} / {dimension['maxScore']}")
    lines.extend(["", "## Findings", ""])
    findings = report["findings"]
    if not findings:
        lines.append("- None")
    else:
        for finding in findings:
            lines.append(
                f"- `{finding['findingId']}` [{finding['severity']}] {finding['title']}"
            )
    lines.extend(["", "## Limitations", ""])
    limitations = report["limitations"]
    if not limitations:
        lines.append("- None declared")
    else:
        lines.extend(f"- {limitation}" for limitation in limitations)
    return "\n".join(lines) + "\n"


def mergeCanonicalFindings(
    sealedReports: dict[str, dict[str, Any]],
    ledger: dict[str, Any],
    *,
    inputManifest: dict[str, Any],
    evidenceFiles: dict[str, bytes] | None = None,
) -> dict[str, Any]:
    if set(sealedReports) != set(DISCIPLINES):
        raise EvaluationError("all three independent reports must be sealed before finding merge")
    schema = loadMapping(LEDGER_SCHEMA_PATH)
    properties = schema.get("properties")
    if not isinstance(properties, dict) or set(ledger) != set(properties):
        raise EvaluationError("finding ledger must match the closed schema field set")
    if (
        ledger.get("schemaVersion") != 1
        or ledger.get("roundId") != inputManifest.get("roundId")
        or ledger.get("state") != "sealed"
        or ledger.get("scoreThresholdApplied") is not False
    ):
        raise EvaluationError("finding ledger round metadata is invalid")
    scope = expectedScopeBinding(inputManifest)
    if not isinstance(scope, dict):
        raise EvaluationError("finding ledger sealed scope is absent")
    scopeBinding = {
        "evaluationBundleHash": scope.get("evaluationBundleHash"),
        "scopeGitCommit": scope.get("gitCommit"),
        "scopeDirtyDiffHash": scope.get("dirtyDiffHash"),
        "scopeManifestHash": scope.get("manifestHash"),
    }
    for field, expected in scopeBinding.items():
        if ledger.get(field) != expected:
            raise EvaluationError(f"finding ledger {field} does not match the sealed scope")
    completedAt = parseTimestamp(ledger.get("completedAt"), field="finding ledger completedAt")

    sourceReports = ledger.get("sourceReports")
    if not isinstance(sourceReports, dict) or set(sourceReports) != set(DISCIPLINES):
        raise EvaluationError("finding ledger must preserve all three report seals")
    evaluationIds = [
        sealedReports[discipline]["seal"]["evaluationId"]
        for discipline in DISCIPLINES
    ]
    evaluatorIds = [
        sealedReports[discipline]["seal"]["evaluatorId"]
        for discipline in DISCIPLINES
    ]
    if len(evaluationIds) != len(set(evaluationIds)):
        raise EvaluationError("independent report evaluation IDs must be unique")
    if len(evaluatorIds) != len(set(evaluatorIds)):
        raise EvaluationError("independent report evaluator IDs must be unique")
    for discipline in DISCIPLINES:
        if sourceReports.get(discipline) != sealedReports[discipline]["seal"]:
            raise EvaluationError(f"finding ledger changed the raw {discipline} report seal or score")
        reportCompletedAt = parseTimestamp(
            sealedReports[discipline]["seal"]["completedAt"],
            field=f"{discipline} report completedAt",
        )
        if completedAt < reportCompletedAt:
            raise EvaluationError("finding ledger was completed before all reports were sealed")

    expectedFindings: dict[tuple[str, str], dict[str, Any]] = {}
    for discipline, sealed in sealedReports.items():
        for finding in sealed["findings"]:
            key = (discipline, finding["findingId"])
            expectedFindings[key] = {
                "severity": finding["severity"],
                "rawReportHash": sealed["seal"]["rawReportHash"],
            }

    canonicalFindings = ledger.get("canonicalFindings")
    if not isinstance(canonicalFindings, list):
        raise EvaluationError("finding ledger canonicalFindings must be a list")
    canonicalIds: set[str] = set()
    consumed: set[tuple[str, str]] = set()
    openBlockingIds: list[str] = []
    severityCounts = {"P0": 0, "P1": 0, "P2": 0}
    for index, canonical in enumerate(canonicalFindings):
        if not isinstance(canonical, dict) or set(canonical) != {
            "canonicalFindingId",
            "title",
            "sourceFindings",
            "remediationResponse",
        }:
            raise EvaluationError(f"canonical finding {index} has an invalid field set")
        canonicalId = canonical.get("canonicalFindingId")
        if (
            not isinstance(canonicalId, str)
            or re.fullmatch(r"R[0-9]+-F[0-9]+", canonicalId) is None
            or canonicalId in canonicalIds
        ):
            raise EvaluationError(f"canonical finding {index} has a duplicate or invalid ID")
        canonicalIds.add(canonicalId)
        title = canonical.get("title")
        if not isinstance(title, str) or not title.strip():
            raise EvaluationError(f"canonical finding {canonicalId} has no title")
        sources = canonical.get("sourceFindings")
        if not isinstance(sources, list) or not sources:
            raise EvaluationError(f"canonical finding {canonicalId} has no source findings")
        canonicalSeverities: set[str] = set()
        for source in sources:
            if not isinstance(source, dict) or set(source) != {
                "discipline",
                "findingId",
                "severity",
                "rawReportHash",
            }:
                raise EvaluationError(f"canonical finding {canonicalId} has a malformed source")
            key = (source.get("discipline"), source.get("findingId"))
            if key in consumed:
                raise EvaluationError(f"raw finding is merged more than once: {key}")
            expected = expectedFindings.get(key)
            if expected is None:
                raise EvaluationError(f"canonical finding references an unknown raw finding: {key}")
            if source.get("severity") != expected["severity"]:
                raise EvaluationError(f"canonical finding changed raw severity: {key}")
            if source.get("rawReportHash") != expected["rawReportHash"]:
                raise EvaluationError(f"canonical finding changed raw report binding: {key}")
            consumed.add(key)
            canonicalSeverities.add(expected["severity"])
            severityCounts[expected["severity"]] += 1
        response = canonical.get("remediationResponse")
        if not isinstance(response, dict) or set(response) != {
            "status",
            "owner",
            "packet",
            "response",
            "evidenceRefs",
            "reviewAt",
            "closureEvidenceHash",
        }:
            raise EvaluationError(f"canonical finding {canonicalId} has no complete remediation response")
        if response.get("status") not in {"open", "remediated"}:
            raise EvaluationError(f"canonical finding {canonicalId} has invalid response status")
        for field in ("owner", "packet", "response"):
            value = response.get(field)
            if not isinstance(value, str) or not value.strip():
                raise EvaluationError(f"canonical finding {canonicalId} response misses {field}")
        parseTimestamp(response.get("reviewAt"), field=f"{canonicalId} remediation reviewAt")
        refs = response.get("evidenceRefs")
        if not isinstance(refs, list) or not all(
            evidenceRefValid(ref, evidenceFiles=evidenceFiles) for ref in refs
        ):
            raise EvaluationError(f"canonical finding {canonicalId} remediation evidence is invalid")
        closureHash = response.get("closureEvidenceHash")
        if response["status"] == "remediated":
            resultHashes = {
                ref.get("resultHash")
                for ref in refs
                if isinstance(ref, dict) and isSha256(ref.get("resultHash"))
            }
            if not refs or not isSha256(closureHash) or closureHash not in resultHashes:
                raise EvaluationError(f"canonical finding {canonicalId} remediation closure is unproven")
        elif closureHash is not None:
            raise EvaluationError(f"canonical finding {canonicalId} open response cannot claim closure evidence")
        if response["status"] == "open" and canonicalSeverities.intersection({"P0", "P1"}):
            openBlockingIds.append(canonicalId)
    missing = sorted(set(expectedFindings) - consumed)
    if missing:
        raise EvaluationError(f"raw findings are missing from the canonical ledger: {missing}")
    return {
        "canonicalFindingCount": len(canonicalFindings),
        "rawFindingCount": len(expectedFindings),
        "severityCounts": severityCounts,
        "openBlockingFindingIds": sorted(openBlockingIds),
        "allRawFindingsPreserved": len(consumed) == len(expectedFindings),
    }


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
    bundle: dict[str, Any] | None = None
    evidenceFiles: dict[str, bytes] | None = None
    if not BUNDLE_PATH.is_file():
        failures.append(f"evaluation bundle manifest is absent: {relativePath(BUNDLE_PATH)}")
    else:
        bundle = loadMapping(BUNDLE_PATH)
        failures.extend(validateBundleManifest(bundle, manifest))
        try:
            evidenceFiles = loadBundleEvidence(bundle)
        except EvaluationError as exc:
            failures.append(str(exc))
    if not FACT_AUDIT_PATH.is_file():
        failures.append(f"round fact audit is absent: {relativePath(FACT_AUDIT_PATH)}")
    else:
        factAudit = loadMapping(FACT_AUDIT_PATH)
        failures.extend(validateFactAudit(factAudit, manifest))
    ledger: dict[str, Any] | None = None
    if not FINDING_LEDGER_PATH.is_file():
        failures.append(f"finding ledger is absent: {relativePath(FINDING_LEDGER_PATH)}")
    else:
        ledger = loadMapping(FINDING_LEDGER_PATH)
    validatedReports = 0
    sealedReports: dict[str, dict[str, Any]] = {}
    for discipline in DISCIPLINES:
        reportPath = ROUND_ROOT / "reports" / f"{discipline}.yml"
        if not reportPath.is_file():
            failures.append(f"raw {discipline} report is absent: {relativePath(reportPath)}")
            continue
        report = loadMapping(reportPath)
        try:
            sealedReport = sealIndependentReport(
                report,
                discipline=discipline,
                rubric=rubric,
                manifest=manifest,
                roster=roster,
                evidenceFiles=evidenceFiles,
                rawBytes=reportPath.read_bytes(),
            )
        except EvaluationError as exc:
            failures.extend(
                f"{discipline}: {failure}"
                for failure in str(exc).split("; ")
            )
            continue
        sealedReports[discipline] = sealedReport
        viewPath = reportPath.with_suffix(".md")
        if not viewPath.is_file():
            failures.append(f"{discipline}: report Markdown view is absent")
        elif viewPath.read_text(encoding="utf-8") != renderIndependentReportMarkdown(sealedReport):
            failures.append(f"{discipline}: report Markdown view changed raw score or finding data")
        else:
            validatedReports += 1
    ledgerSummary: dict[str, Any] | None = None
    if ledger is not None and len(sealedReports) == len(DISCIPLINES):
        try:
            ledgerSummary = mergeCanonicalFindings(
                sealedReports,
                ledger,
                inputManifest=manifest,
                evidenceFiles=evidenceFiles,
            )
        except EvaluationError as exc:
            failures.append(str(exc))
        else:
            for findingId in ledgerSummary["openBlockingFindingIds"]:
                failures.append(f"open P0/P1 canonical finding requires remediation: {findingId}")
    return {
        "passed": not failures,
        "roundId": manifest.get("roundId"),
        "validatedReportCount": validatedReports,
        "requiredReportCount": len(DISCIPLINES),
        "scoreThresholdApplied": False,
        "ledgerSummary": ledgerSummary,
        "failures": sorted(set(failures)),
    }


def isReadinessBlocker(failure: str) -> bool:
    if failure in READINESS_BLOCKERS:
        return True
    if failure.startswith("finding ledger is absent: "):
        return True
    for discipline in DISCIPLINES:
        if failure == f"{discipline} evaluator conflict status is not clean":
            return True
        if failure == f"{discipline} evaluator independence is not proven":
            return True
        if failure == f"{discipline} evaluator is not eligible":
            return True
        if failure == f"{discipline} evaluator is unassigned":
            return True
        if failure.startswith(f"raw {discipline} report is absent: "):
            return True
    return False


def planQualityEligible(result: dict[str, Any]) -> bool:
    failures = result.get("failures")
    return (
        result.get("passed") is True
        or (
            isinstance(failures, list)
            and bool(failures)
            and all(isinstance(failure, str) and isReadinessBlocker(failure) for failure in failures)
        )
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--allow-readiness-blockers",
        action="store_true",
        help="accept an internally valid draft whose only gaps require independent R10 participants",
    )
    args = parser.parse_args()
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
    acceptedDraft = args.allow_readiness_blockers and planQualityEligible(result)
    passed = result["passed"] or acceptedDraft
    payload = {
        "schemaVersion": 1,
        "gate": "plan-quality",
        "audit": "evaluation-report-completeness",
        "status": "passed" if passed else "blocked",
        "passed": passed,
        "roundReady": result["passed"],
        "acceptedDraft": acceptedDraft,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "reportPath": relativePath(REPORT_PATH),
        **{key: value for key, value in result.items() if key != "passed"},
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not passed:
        print("BLOCKED: independent R10 evidence is incomplete", file=sys.stderr)
        for failure in result["failures"]:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    if acceptedDraft:
        print("ok: plan-quality draft is internally valid; independent R10 readiness blockers remain explicit")
        return 0
    print("ok: independent R10 reports are complete; no score threshold was applied")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
