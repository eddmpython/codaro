from __future__ import annotations

from copy import deepcopy
import hashlib
import importlib.util
import json
from pathlib import Path
from types import ModuleType
import zipfile

import yaml


ROOT = Path(__file__).resolve().parents[2]
VERIFIER_PATH = ROOT / "tests" / "product" / "verifyPrdEvaluationReport.py"
SHA = "a" * 64
COMMIT = "1" * 40


def loadVerifier() -> ModuleType:
    spec = importlib.util.spec_from_file_location("verifyPrdEvaluationReportUnderTest", VERIFIER_PATH)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def rosterSlot(discipline: str) -> dict[str, object]:
    return {
        "evaluatorId": f"{discipline}-reviewer",
        "expertiseEvidence": f"https://example.invalid/{discipline}-expertise",
        "remediationParticipation": False,
        "priorRoundParticipation": False,
        "conflictOfInterest": False,
        "availability": {
            "startsAt": "2026-07-18T00:00:00+00:00",
            "endsAt": "2026-07-20T00:00:00+00:00",
        },
        "signedAt": "2026-07-18T12:00:00+00:00",
        "signatureHash": SHA,
        "eligible": True,
    }


def completeRoster() -> dict[str, object]:
    return {
        "roundState": "ready",
        "roundEligible": True,
        "slots": {
            discipline: rosterSlot(discipline)
            for discipline in ("learning", "ux", "architecture")
        },
    }


def context(verifier: ModuleType) -> tuple[dict[str, object], dict[str, object], dict[str, object]]:
    rubric = verifier.loadMapping(verifier.RUBRIC_PATH)
    manifest = {
        "roundId": "R10",
        "rubric": {"version": 1, "sha256": SHA},
        "scope": {
            "gitCommit": COMMIT,
            "dirtyDiffHash": SHA,
            "manifestHash": SHA,
            "evaluationBundleHash": SHA,
        },
    }
    roster = completeRoster()
    return rubric, manifest, roster


def completeReport(verifier: ModuleType, discipline: str = "learning") -> dict[str, object]:
    rubric, _, _ = context(verifier)
    weights = {row["id"]: row["weight"] for row in rubric["dimensions"]}
    return {
        "schemaVersion": 1,
        "evaluationId": f"r10-{discipline}",
        "roundId": "R10",
        "discipline": discipline,
        "evaluatorId": f"{discipline}-reviewer",
        "rubricVersion": 1,
        "rubricHash": SHA,
        "evaluationBundleHash": SHA,
        "scopeGitCommit": COMMIT,
        "scopeDirtyDiffHash": SHA,
        "scopeManifestHash": SHA,
        "scopePaths": ["README.md"],
        "excludedPriorReports": ["mainPlan/**/01-prd-improvement-loop/**"],
        "promptAudit": {
            "targetScorePresent": False,
            "priorScorePresent": False,
            "desiredConclusionPresent": False,
        },
        "startedAt": "2026-07-19T00:00:00+00:00",
        "completedAt": "2026-07-19T00:10:00+00:00",
        "dimensions": {
            dimensionId: {
                "score": 0,
                "maxScore": weight,
                "evidenceRefs": [{"path": "README.md", "line": 1}],
                "counterEvidence": ["No executable evidence was available."],
            }
            for dimensionId, weight in weights.items()
        },
        "findings": [],
        "totalScore": 0,
        "productEvidenceMaturity": {
            "stage": "E0",
            "rationale": "No executable product evidence.",
            "evidenceRefs": [{"path": "README.md", "line": 1}],
        },
        "limitations": ["The product slice is not implemented."],
    }


def completeBundle(verifier: ModuleType) -> dict[str, object]:
    row = {"path": "README.md", "sha256": SHA, "bytes": 1, "kind": "repository", "sourcePath": "README.md"}
    return {
        "schemaVersion": 1,
        "roundId": "R10",
        "state": "sealed",
        "scope": {
            "sealState": "sealed",
            "gitCommit": COMMIT,
            "dirtyDiffHash": SHA,
            "manifestHash": verifier.canonicalHash({"schemaVersion": 1, "files": [row]}),
            "fileCount": 1,
            "totalBytes": 1,
        },
        "archive": {"path": "output/bundle.zip", "sha256": SHA, "bytes": 1, "readOnlyEntries": True},
        "roundReadiness": {"sealEligible": True, "blockingReasons": []},
        "exclusions": {"priorScoresIncluded": False, "priorConclusionsIncluded": False},
        "contracts": [
            {"bundlePath": "evaluation-contract/rubric.yml", "sha256": SHA},
            {
                "bundlePath": "evaluation-contract/finding-ledger.schema.yml",
                "sha256": verifier.sha256File(verifier.LEDGER_SCHEMA_PATH),
            },
        ],
        "files": [row],
    }


def sealedReports(
    verifier: ModuleType,
    *,
    findingSeverity: str | None = None,
) -> tuple[dict[str, object], dict[str, object], dict[str, object], dict[str, object]]:
    rubric, manifest, roster = context(verifier)
    reports: dict[str, object] = {}
    for discipline in verifier.DISCIPLINES:
        report = completeReport(verifier, discipline)
        if discipline == "learning" and findingSeverity is not None:
            report["findings"] = [{
                "findingId": "LEARN-99",
                "severity": findingSeverity,
                "title": "새 학습 결함",
                "claim": "현재 근거가 결함을 반증한다.",
                "evidenceRefs": [{"path": "README.md", "line": 1}],
                "counterEvidence": ["반대 근거도 검토했다."],
                "impact": "학습 경로를 차단한다.",
            }]
        rawBytes = json.dumps(report, ensure_ascii=False, sort_keys=True).encode("utf-8")
        reports[discipline] = verifier.sealIndependentReport(
            report,
            discipline=discipline,
            rubric=rubric,
            manifest=manifest,
            roster=roster,
            evidenceFiles={"README.md": b"# Codaro\n"},
            rawBytes=rawBytes,
        )
    return reports, rubric, manifest, roster


def completeLedger(
    verifier: ModuleType,
    reports: dict[str, object],
    manifest: dict[str, object],
    *,
    findingStatus: str = "remediated",
) -> dict[str, object]:
    canonicalFindings: list[dict[str, object]] = []
    learning = reports["learning"]
    if learning["findings"]:
        finding = learning["findings"][0]
        canonicalFindings.append({
            "canonicalFindingId": "R10-F001",
            "title": finding["title"],
            "sourceFindings": [{
                "discipline": "learning",
                "findingId": finding["findingId"],
                "severity": finding["severity"],
                "rawReportHash": learning["seal"]["rawReportHash"],
            }],
            "remediationResponse": {
                "status": findingStatus,
                "owner": "learning-owner",
                "packet": "10-r10-learning-remediation",
                "response": "현재 결함을 별도 packet에서 처리한다.",
                "evidenceRefs": (
                    [{"path": "README.md", "line": 1, "resultHash": SHA}]
                    if findingStatus == "remediated"
                    else []
                ),
                "reviewAt": "2026-07-21T00:00:00+00:00",
                "closureEvidenceHash": SHA if findingStatus == "remediated" else None,
            },
        })
    scope = manifest["scope"]
    return {
        "schemaVersion": 1,
        "roundId": "R10",
        "state": "sealed",
        "evaluationBundleHash": scope["evaluationBundleHash"],
        "scopeGitCommit": scope["gitCommit"],
        "scopeDirtyDiffHash": scope["dirtyDiffHash"],
        "scopeManifestHash": scope["manifestHash"],
        "scoreThresholdApplied": False,
        "sourceReports": {
            discipline: reports[discipline]["seal"]
            for discipline in verifier.DISCIPLINES
        },
        "canonicalFindings": canonicalFindings,
        "completedAt": "2026-07-20T01:00:00+00:00",
    }


def completeFactAudit() -> dict[str, object]:
    return {
        "schemaVersion": 1,
        "roundId": "R10",
        "state": "ready-to-seal",
        "passed": True,
        "auditComplete": True,
        "scoreThresholdApplied": False,
        "roundSealEligible": True,
        "scope": {
            "gitCommit": COMMIT,
            "dirtyDiffHash": SHA,
            "manifestHash": SHA,
            "evaluationBundleHash": SHA,
        },
        "facts": {
            "bundleIntegrity": {
                "archiveEntriesReadOnly": True,
                "excludedHistoryPathCount": 0,
                "priorScoresIncluded": False,
                "priorConclusionsIncluded": False,
            },
            "requiredPaths": {"missing": []},
            "symbols": {"requiredMissing": []},
            "qualityGates": {"requiredMissing": [], "planQualityRegistered": True},
            "learningCoverage": {
                "lessonCount": 472,
                "strongCheckSpecCount": 345,
                "strongCheckSpecLessonCount": 114,
                "weakOnlyLessonCount": 353,
                "masteryAssessmentLessonCount": 111,
                "transferAssessmentLessonCount": 111,
                "retrievalAssessmentLessonCount": 111,
                "topTierEligible": False,
                "completionEligible": False,
            },
            "mainPlanTodoPolicy": {"todoOnly": True, "policyTestPresent": True},
        },
    }


def testScoreOnlyReportIsRejected() -> None:
    verifier = loadVerifier()
    rubric, manifest, roster = context(verifier)
    failures = verifier.validateRawReport(
        {"schemaVersion": 1, "roundId": "R10", "totalScore": 100},
        discipline="learning",
        rubric=rubric,
        manifest=manifest,
        roster=roster,
    )

    assert any("required fields" in failure for failure in failures)


def testCompleteZeroScoreReportIsNotRejectedByThreshold() -> None:
    verifier = loadVerifier()
    rubric, manifest, roster = context(verifier)
    failures = verifier.validateRawReport(
        completeReport(verifier),
        discipline="learning",
        rubric=rubric,
        manifest=manifest,
        roster=roster,
    )

    assert failures == []


def testDesiredConclusionInPromptIsRejected() -> None:
    verifier = loadVerifier()
    rubric, manifest, roster = context(verifier)
    report = completeReport(verifier)
    report["promptAudit"]["desiredConclusionPresent"] = True

    failures = verifier.validateRawReport(
        report,
        discipline="learning",
        rubric=rubric,
        manifest=manifest,
        roster=roster,
    )

    assert any("promptAudit" in failure for failure in failures)


def testSealedBundleManifestWithMatchingScopeIsAccepted() -> None:
    verifier = loadVerifier()
    _, manifest, _ = context(verifier)
    bundle = completeBundle(verifier)
    manifest["scope"]["manifestHash"] = bundle["scope"]["manifestHash"]

    failures = verifier.validateBundleManifest(bundle, manifest)

    assert failures == []


def testDraftBundleManifestIsRejected() -> None:
    verifier = loadVerifier()
    _, manifest, _ = context(verifier)
    bundle = completeBundle(verifier)
    bundle["state"] = "draft"
    bundle["roundReadiness"]["sealEligible"] = False
    manifest["scope"]["manifestHash"] = bundle["scope"]["manifestHash"]

    failures = verifier.validateBundleManifest(bundle, manifest)

    assert any("not sealed" in failure for failure in failures)
    assert any("not eligible" in failure for failure in failures)


def testDraftFactAuditIsRejectedWithoutChangingLearningFacts() -> None:
    verifier = loadVerifier()
    _, manifest, _ = context(verifier)
    factAudit = completeFactAudit()
    factAudit["state"] = "draft"
    factAudit["roundSealEligible"] = False

    failures = verifier.validateFactAudit(factAudit, manifest)

    assert any("not bound" in failure for failure in failures)
    assert factAudit["facts"]["learningCoverage"]["weakOnlyLessonCount"] == 353


def testPlanQualityAcceptsOnlyIndependentReadinessBlockers() -> None:
    verifier = loadVerifier()
    result = {
        "passed": False,
        "failures": [
            "R10 input manifest is not sealed and ready",
            "learning evaluator is unassigned",
            "raw ux report is absent: mainPlan/reports/ux.yml",
            "finding ledger is absent: mainPlan/finding-ledger.yml",
        ],
    }

    assert verifier.planQualityEligible(result) is True


def testPlanQualityRejectsMalformedIndependentReport() -> None:
    verifier = loadVerifier()
    result = {
        "passed": False,
        "failures": [
            "R10 input manifest is not sealed and ready",
            "learning: totalScore must equal the untouched sum of dimension scores",
        ],
    }

    assert verifier.planQualityEligible(result) is False


def testRawReportRejectsOpenSchemaAndUnresolvableEvidence() -> None:
    verifier = loadVerifier()
    rubric, manifest, roster = context(verifier)
    report = completeReport(verifier)
    report["unexpected"] = True
    report["dimensions"]["learnerValue"]["evidenceRefs"] = [{
        "path": "missing.md",
        "line": 1,
    }]

    failures = verifier.validateRawReport(
        report,
        discipline="learning",
        rubric=rubric,
        manifest=manifest,
        roster=roster,
        evidenceFiles={"README.md": b"# Codaro\n"},
    )

    assert "raw report must match the closed schema field set" in failures
    assert any("learnerValue needs concrete evidenceRefs" in failure for failure in failures)


def testRawReportRejectsReferenceToAnotherEvaluatorDraft() -> None:
    verifier = loadVerifier()
    rubric, manifest, roster = context(verifier)
    report = completeReport(verifier)
    report["dimensions"]["learnerValue"]["evidenceRefs"] = [{
        "path": "reports/ux.yml",
        "line": 1,
    }]

    failures = verifier.validateRawReport(
        report,
        discipline="learning",
        rubric=rubric,
        manifest=manifest,
        roster=roster,
    )

    assert "raw report must not reference another evaluator report" in failures


def testReportSealAndMarkdownPreserveRawScoreAndHash() -> None:
    verifier = loadVerifier()
    reports, _, _, _ = sealedReports(verifier)
    learning = reports["learning"]

    markdown = verifier.renderIndependentReportMarkdown(learning)

    assert learning["seal"]["totalScore"] == 0
    assert len(learning["seal"]["rawReportHash"]) == 64
    assert "- Total score: 0 / 100" in markdown
    assert learning["seal"]["rawReportHash"] in markdown


def testCanonicalMergePreservesLowerScoreAndNewP0WithoutThreshold() -> None:
    verifier = loadVerifier()
    reports, _, manifest, _ = sealedReports(verifier, findingSeverity="P0")
    ledger = completeLedger(verifier, reports, manifest, findingStatus="open")

    summary = verifier.mergeCanonicalFindings(
        reports,
        ledger,
        inputManifest=manifest,
        evidenceFiles={"README.md": b"# Codaro\n"},
    )

    assert ledger["sourceReports"]["learning"]["totalScore"] == 0
    assert ledger["scoreThresholdApplied"] is False
    assert summary["severityCounts"]["P0"] == 1
    assert summary["openBlockingFindingIds"] == ["R10-F001"]
    assert summary["allRawFindingsPreserved"] is True


def testCanonicalMergeRejectsSeverityRewriteAndDuplicateSource() -> None:
    verifier = loadVerifier()
    reports, _, manifest, _ = sealedReports(verifier, findingSeverity="P1")
    ledger = completeLedger(verifier, reports, manifest)
    changedSeverity = deepcopy(ledger)
    changedSeverity["canonicalFindings"][0]["sourceFindings"][0]["severity"] = "P2"

    try:
        verifier.mergeCanonicalFindings(reports, changedSeverity, inputManifest=manifest)
    except verifier.EvaluationError as error:
        assert "changed raw severity" in str(error)
    else:
        raise AssertionError("severity rewrite was accepted")

    duplicated = deepcopy(ledger)
    duplicated["canonicalFindings"].append(deepcopy(duplicated["canonicalFindings"][0]))
    duplicated["canonicalFindings"][1]["canonicalFindingId"] = "R10-F002"
    try:
        verifier.mergeCanonicalFindings(reports, duplicated, inputManifest=manifest)
    except verifier.EvaluationError as error:
        assert "merged more than once" in str(error)
    else:
        raise AssertionError("duplicate raw finding merge was accepted")


def testCanonicalMergeRejectsChangedRawScoreAndMissingFinding() -> None:
    verifier = loadVerifier()
    reports, _, manifest, _ = sealedReports(verifier, findingSeverity="P2")
    ledger = completeLedger(verifier, reports, manifest)
    changedScore = deepcopy(ledger)
    changedScore["sourceReports"]["learning"]["totalScore"] = 100

    try:
        verifier.mergeCanonicalFindings(reports, changedScore, inputManifest=manifest)
    except verifier.EvaluationError as error:
        assert "changed the raw learning report seal or score" in str(error)
    else:
        raise AssertionError("raw score rewrite was accepted")

    missing = deepcopy(ledger)
    missing["canonicalFindings"] = []
    try:
        verifier.mergeCanonicalFindings(reports, missing, inputManifest=manifest)
    except verifier.EvaluationError as error:
        assert "missing from the canonical ledger" in str(error)
    else:
        raise AssertionError("missing raw finding was accepted")


def testRosterRejectsDuplicateEvaluatorAndUnsignedAvailability() -> None:
    verifier = loadVerifier()
    roster = completeRoster()
    roster["slots"]["ux"]["evaluatorId"] = "learning-reviewer"
    roster["slots"]["architecture"]["signedAt"] = None

    failures = verifier.validateRoster(roster)

    assert "evaluator IDs must be unique" in failures
    assert "architecture evaluator availability or signature is invalid" in failures


def testVerifyRoundEvidenceAcceptsACompleteSyntheticRound(
    tmp_path: Path,
    monkeypatch,
) -> None:
    verifier = loadVerifier()
    roundRoot = tmp_path / "round"
    reportsRoot = roundRoot / "reports"
    reportsRoot.mkdir(parents=True)
    archivePath = tmp_path / "bundle.zip"
    readme = b"# Codaro\n"
    with zipfile.ZipFile(archivePath, "w", compression=zipfile.ZIP_STORED) as archive:
        archive.writestr("README.md", readme)
    archiveHash = hashlib.sha256(archivePath.read_bytes()).hexdigest()
    row = {
        "path": "README.md",
        "sha256": hashlib.sha256(readme).hexdigest(),
        "bytes": len(readme),
        "kind": "repository",
        "sourcePath": "README.md",
    }
    manifestHash = verifier.canonicalHash({"schemaVersion": 1, "files": [row]})
    rubricHash = verifier.sha256File(verifier.RUBRIC_PATH)
    inputManifest = {
        "schemaVersion": 1,
        "roundId": "R10",
        "roundState": "ready",
        "sealed": True,
        "rubric": {"version": 1, "sha256": rubricHash},
        "scope": {
            "sealState": "sealed",
            "gitCommit": COMMIT,
            "dirtyDiffHash": SHA,
            "manifestHash": manifestHash,
            "evaluationBundleHash": archiveHash,
        },
    }
    bundle = {
        "schemaVersion": 1,
        "roundId": "R10",
        "state": "sealed",
        "scope": {
            "sealState": "sealed",
            "gitCommit": COMMIT,
            "dirtyDiffHash": SHA,
            "manifestHash": manifestHash,
            "fileCount": 1,
            "totalBytes": len(readme),
        },
        "archive": {
            "path": str(archivePath.relative_to(tmp_path)).replace("\\", "/"),
            "sha256": archiveHash,
            "bytes": archivePath.stat().st_size,
            "readOnlyEntries": True,
        },
        "roundReadiness": {"sealEligible": True, "blockingReasons": []},
        "exclusions": {"priorScoresIncluded": False, "priorConclusionsIncluded": False},
        "contracts": [
            {"bundlePath": "evaluation-contract/rubric.yml", "sha256": rubricHash},
            {
                "bundlePath": "evaluation-contract/finding-ledger.schema.yml",
                "sha256": verifier.sha256File(verifier.LEDGER_SCHEMA_PATH),
            },
        ],
        "files": [row],
    }
    roster = completeRoster()
    factAudit = completeFactAudit()
    factAudit["scope"] = {
        "gitCommit": COMMIT,
        "dirtyDiffHash": SHA,
        "manifestHash": manifestHash,
        "evaluationBundleHash": archiveHash,
    }
    rubric = verifier.loadMapping(verifier.RUBRIC_PATH)
    sealed: dict[str, object] = {}
    for discipline in verifier.DISCIPLINES:
        report = completeReport(verifier, discipline)
        report["rubricHash"] = rubricHash
        report["evaluationBundleHash"] = archiveHash
        report["scopeManifestHash"] = manifestHash
        reportPath = reportsRoot / f"{discipline}.yml"
        reportPath.write_text(
            yaml.safe_dump(report, allow_unicode=True, sort_keys=False),
            encoding="utf-8",
        )
        receipt = verifier.sealIndependentReport(
            report,
            discipline=discipline,
            rubric=rubric,
            manifest=inputManifest,
            roster=roster,
            evidenceFiles={"README.md": readme},
            rawBytes=reportPath.read_bytes(),
        )
        sealed[discipline] = receipt
        reportPath.with_suffix(".md").write_text(
            verifier.renderIndependentReportMarkdown(receipt),
            encoding="utf-8",
        )
    ledger = completeLedger(verifier, sealed, inputManifest)
    inputPath = roundRoot / "r10-input-manifest.yml"
    rosterPath = roundRoot / "evaluator-roster.yml"
    bundlePath = roundRoot / "evaluation-bundle.manifest.yml"
    factAuditPath = roundRoot / "fact-audit.json"
    ledgerPath = roundRoot / "finding-ledger.yml"
    inputPath.write_text(yaml.safe_dump(inputManifest, sort_keys=False), encoding="utf-8")
    rosterPath.write_text(yaml.safe_dump(roster, sort_keys=False), encoding="utf-8")
    bundlePath.write_text(yaml.safe_dump(bundle, sort_keys=False), encoding="utf-8")
    factAuditPath.write_text(json.dumps(factAudit), encoding="utf-8")
    ledgerPath.write_text(yaml.safe_dump(ledger, allow_unicode=True, sort_keys=False), encoding="utf-8")

    monkeypatch.setattr(verifier, "ROOT", tmp_path)
    monkeypatch.setattr(verifier, "ROUND_ROOT", roundRoot)
    monkeypatch.setattr(verifier, "INPUT_PATH", inputPath)
    monkeypatch.setattr(verifier, "ROSTER_PATH", rosterPath)
    monkeypatch.setattr(verifier, "BUNDLE_PATH", bundlePath)
    monkeypatch.setattr(verifier, "FACT_AUDIT_PATH", factAuditPath)
    monkeypatch.setattr(verifier, "FINDING_LEDGER_PATH", ledgerPath)

    result = verifier.verifyRoundEvidence()

    assert result["passed"] is True
    assert result["validatedReportCount"] == 3
    assert result["ledgerSummary"]["allRawFindingsPreserved"] is True
