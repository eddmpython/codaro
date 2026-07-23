from __future__ import annotations

import hashlib
import importlib.util
import io
import json
from pathlib import Path
import sys
from types import ModuleType
import zipfile

import pytest


ROOT = Path(__file__).resolve().parents[2]
BUILDER_PATH = ROOT / "docs" / "skills" / "ops" / "tools" / "buildPrdEvaluationBundle.py"


def loadBuilder() -> ModuleType:
    spec = importlib.util.spec_from_file_location("buildPrdEvaluationBundleUnderTest", BUILDER_PATH)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def testScopeAllowlistIncludesProductEvidenceAndRejectsHistory() -> None:
    builder = loadBuilder()

    assert builder.isPathIncluded(".github/workflows/ci.yml")
    assert builder.isPathIncluded("curricula/python/schema.yaml")
    assert builder.isPathIncluded("mainPlan/astryx-product-experience/04-web-learning/README.md")
    assert not builder.isPathIncluded(
        "mainPlan/astryx-product-experience/00-product-contract/00-specialist-review/README.md"
    )
    assert not builder.isPathIncluded(
        "mainPlan/astryx-product-experience/00-product-contract/01-prd-improvement-loop/01-r9-baseline/README.md"
    )
    assert not builder.isPathIncluded("editor/dist/assets/index.js")
    assert not builder.isPathIncluded("output/test-runner/report.json")


def testDeterministicZipHasReadOnlyEntries() -> None:
    builder = loadBuilder()
    entries = (
        builder.BundleEntry("b.txt", b"second", None, "test"),
        builder.BundleEntry("a.txt", b"first", None, "test"),
    )

    first = builder.buildZipBytes(entries)
    second = builder.buildZipBytes(tuple(reversed(entries)))

    assert first == second
    with zipfile.ZipFile(io.BytesIO(first)) as archive:
        assert archive.namelist() == ["a.txt", "b.txt"]
        assert all(info.date_time == builder.ZIP_TIMESTAMP for info in archive.infolist())
        assert all((info.external_attr >> 16) & 0o777 == 0o444 for info in archive.infolist())


def testCurrentBundleIsCompleteAndStillBlockedFromSealing() -> None:
    builder = loadBuilder()

    manifest, archiveBytes = builder.buildPrdEvaluationBundle()
    rows = manifest["files"]
    paths = [row["path"] for row in rows]

    builder.verifyExcludedPriorReports(paths)
    assert manifest["state"] == "draft"
    assert manifest["roundReadiness"]["sealEligible"] is False
    assert manifest["archive"]["sha256"] == hashlib.sha256(archiveBytes).hexdigest()
    assert manifest["scope"]["manifestHash"] == hashlib.sha256(
        json.dumps(
            {"schemaVersion": 1, "files": rows},
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    ).hexdigest()
    assert "evaluation-contract/rubric.yml" in paths
    assert "evaluation-contract/evaluation-report.schema.yml" in paths
    assert "evaluation-contract/evaluator-briefing.yml" in paths
    with zipfile.ZipFile(io.BytesIO(archiveBytes)) as archive:
        assert archive.namelist() == paths


def testExplicitExcludedPathIsRejected() -> None:
    builder = loadBuilder()

    with pytest.raises(builder.BundleError, match="excluded history"):
        builder.verifyExcludedPriorReports(
            ["mainPlan/astryx-product-experience/00-product-contract/00-specialist-review/report.yml"]
        )


def testSealTransitionRejectsAnUnreadyRound() -> None:
    builder = loadBuilder()
    manifest = {
        "roundReadiness": {
            "sealEligible": False,
            "sealBlockingReasons": ["learning evaluator is unassigned"],
        }
    }

    with pytest.raises(builder.BundleError, match="cannot be sealed"):
        builder.sealedInputManifest({}, manifest)


def testSealTransitionBindsAllScopeHashes() -> None:
    builder = loadBuilder()
    manifest = {
        "roundReadiness": {"sealEligible": True, "sealBlockingReasons": []},
        "scope": {
            "gitCommit": "1" * 40,
            "dirtyDiffHash": "a" * 64,
            "manifestHash": "b" * 64,
            "fileCount": 12,
        },
        "archive": {"path": "output/bundle.zip", "sha256": "c" * 64},
    }

    sealed = builder.sealedInputManifest({"draftBundle": {}}, manifest)

    assert sealed["roundState"] == "ready"
    assert sealed["sealed"] is True
    assert sealed["scope"] == {
        "sealState": "sealed",
        "gitCommit": "1" * 40,
        "dirtyDiffHash": "a" * 64,
        "manifestHash": "b" * 64,
        "evaluationBundleHash": "c" * 64,
        "reason": None,
    }


def testDraftTransitionRefreshesBundleFactsWithoutSealing() -> None:
    builder = loadBuilder()
    manifest = {
        "roundReadiness": {"sealEligible": False, "sealBlockingReasons": ["learning evaluator is unassigned"]},
        "scope": {
            "gitCommit": "1" * 40,
            "dirtyDiffHash": "a" * 64,
            "manifestHash": "b" * 64,
            "fileCount": 12,
        },
        "archive": {"path": "output/bundle.zip", "sha256": "c" * 64},
    }

    draft = builder.draftInputManifest(
        {"roundState": "blocked", "sealed": False, "draftBundle": {"fileCount": 4}},
        manifest,
    )

    assert draft["roundState"] == "blocked"
    assert draft["sealed"] is False
    assert draft["draftBundle"] == {
        "manifestPath": builder.relativePath(builder.MANIFEST_PATH),
        "archivePath": "output/bundle.zip",
        "gitCommit": "1" * 40,
        "dirtyDiffHash": "a" * 64,
        "manifestHash": "b" * 64,
        "evaluationBundleHash": "c" * 64,
        "fileCount": 12,
        "bundleIntegrityState": "passed",
        "sealEligible": False,
    }
