from __future__ import annotations

import importlib.util
from pathlib import Path
from types import ModuleType


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
    roster = {"slots": {"learning": {"evaluatorId": "learning-reviewer"}}}
    return rubric, manifest, roster


def completeReport(verifier: ModuleType) -> dict[str, object]:
    rubric, _, _ = context(verifier)
    weights = {row["id"]: row["weight"] for row in rubric["dimensions"]}
    return {
        "schemaVersion": 1,
        "evaluationId": "r10-learning",
        "roundId": "R10",
        "discipline": "learning",
        "evaluatorId": "learning-reviewer",
        "rubricVersion": 1,
        "rubricHash": SHA,
        "evaluationBundleHash": SHA,
        "scopeGitCommit": COMMIT,
        "scopeDirtyDiffHash": SHA,
        "scopeManifestHash": SHA,
        "scopePaths": ["mainPlan/astryx-product-experience"],
        "excludedPriorReports": ["mainPlan/**/00-specialist-review/**"],
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
            "sealState": "draft",
            "gitCommit": COMMIT,
            "dirtyDiffHash": SHA,
            "manifestHash": verifier.canonicalHash({"schemaVersion": 1, "files": [row]}),
            "fileCount": 1,
            "totalBytes": 1,
        },
        "archive": {"path": "output/bundle.zip", "sha256": SHA, "bytes": 1, "readOnlyEntries": True},
        "roundReadiness": {"sealEligible": True, "blockingReasons": []},
        "exclusions": {"priorScoresIncluded": False, "priorConclusionsIncluded": False},
        "contracts": [{"bundlePath": "evaluation-contract/rubric.yml", "sha256": SHA}],
        "files": [row],
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
            "dependencyBootstrap": {"negativeFixtureRejected": True},
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
