from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[2]
CATALOG_PATH = ROOT / "contracts" / "publicLearningCatalog.json"
TAXONOMY_PATH = ROOT / "curricula" / "python" / "_taxonomy.yml"
VISUAL_MANIFEST_PATH = ROOT / "assets" / "brand" / "visuals" / "manifest.json"
GENERATOR_PATH = ROOT / "landing" / "scripts" / "generateCurriculum.js"
EXPECTED_LESSON_COUNT = 472
EXPECTED_RUNTIME_COUNTS = {"browser": 310, "local": 162}
FEATURED_PATH_IDS = {
    "pythonFoundation",
    "dataReporting",
    "dataVisualization",
    "fileAutomation",
    "officeAutomation",
    "webMonitoring",
}
DOMAIN_VISUAL_IDS = {
    "basics": "pythonFundamentals",
    "dataAnalysis": "dataAnalysis",
    "visualization": "dataVisualization",
    "mathStatsMl": "statisticsMachineLearning",
    "imageVision": "imageVision",
    "automation": "learningAutomation",
    "devLiteracy": "developerLiteracy",
    "aiIntegration": "aiIntegration",
}

sys.path.insert(0, str(ROOT / "tests" / "curriculum"))
from learningLedgerAudit import identityRows  # noqa: E402


def loadJson(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    assert isinstance(payload, dict)
    return payload


def catalogRows() -> list[dict[str, Any]]:
    payload = loadJson(CATALOG_PATH)
    assert payload.get("schemaVersion") == 1
    assert payload.get("canonicalIdentity") == "category/contentId"
    rows = payload.get("lessons")
    assert isinstance(rows, list)
    assert all(isinstance(row, dict) for row in rows)
    return rows


def testPublicLearningCatalogHasExactCanonicalPopulation() -> None:
    rows = catalogRows()
    refs = [str(row.get("lessonRef", "")) for row in rows]
    checkSpecIds = [str(row.get("checkSpecId", "")) for row in rows]

    assert len(rows) == EXPECTED_LESSON_COUNT
    assert len(set(refs)) == EXPECTED_LESSON_COUNT
    assert len(set(checkSpecIds)) == EXPECTED_LESSON_COUNT
    assert set(refs) == set(identityRows())
    assert all(ref.count("/") == 1 and all(ref.split("/", 1)) for ref in refs)
    assert all(checkSpecId.startswith("lesson:") and checkSpecId.endswith(":required:v1") for checkSpecId in checkSpecIds)


def testPublicLearningCatalogHasExactRuntimeTiersAndPathContext() -> None:
    rows = catalogRows()
    runtimeCounts = Counter(str(row.get("runtimeTier", "")) for row in rows)
    pathCounts = Counter(
        str(pathId)
        for row in rows
        for pathId in row.get("eligiblePathIds", [])
    )

    assert dict(runtimeCounts) == EXPECTED_RUNTIME_COUNTS
    assert all(row.get("eligiblePathIds") for row in rows)
    assert all(
        len(row["eligiblePathIds"]) == len(set(row["eligiblePathIds"]))
        for row in rows
    )
    assert FEATURED_PATH_IDS <= set(pathCounts)
    assert all(
        any(
            row.get("runtimeTier") == "browser" and pathId in row.get("eligiblePathIds", [])
            for row in rows
        )
        for pathId in FEATURED_PATH_IDS
    )


def testEveryCatalogLessonCanGenerateOutcomeAndTimeMetadata() -> None:
    rows = catalogRows()
    taxonomy = yaml.safe_load(TAXONOMY_PATH.read_text(encoding="utf-8"))
    taxonomyRows = taxonomy.get("lessonOutcomes", {}) if isinstance(taxonomy, dict) else {}
    identities = identityRows()
    missing: list[str] = []

    for row in rows:
        lessonRef = str(row["lessonRef"])
        metadata = taxonomyRows.get(lessonRef, {}) if isinstance(taxonomyRows, dict) else {}
        outcomes = metadata.get("outcomes") if isinstance(metadata, dict) else None
        estimatedMinutes = metadata.get("estimatedMinutes") if isinstance(metadata, dict) else None
        if outcomes and isinstance(estimatedMinutes, int) and not isinstance(estimatedMinutes, bool) and estimatedMinutes > 0:
            continue
        identity = identities[lessonRef]
        sourcePath = ROOT / str(identity["sourcePath"])
        lesson = yaml.safe_load(sourcePath.read_text(encoding="utf-8"))
        meta = lesson.get("meta", {}) if isinstance(lesson, dict) else {}
        authoredOutcomes = meta.get("outcomes") if isinstance(meta, dict) else None
        authoredMinutes = meta.get("estimatedMinutes") if isinstance(meta, dict) else None
        if not authoredOutcomes or not isinstance(authoredMinutes, int) or isinstance(authoredMinutes, bool) or authoredMinutes <= 0:
            missing.append(lessonRef)

    assert not missing, f"outcome/time metadata missing for {missing[:10]}"


def testGeneratedLessonsUseRegisteredInstructionalVisuals() -> None:
    identities = identityRows()
    physicalDomains = {
        Path(str(row["sourcePath"])).relative_to("curricula/python").parts[0]
        for row in identities.values()
    }
    manifest = loadJson(VISUAL_MANIFEST_PATH)
    registeredIds = {
        str(asset.get("id", ""))
        for asset in manifest.get("assets", [])
        if isinstance(asset, dict) and asset.get("kind") == "instructional"
    }
    generatorText = GENERATOR_PATH.read_text(encoding="utf-8")

    assert physicalDomains <= set(DOMAIN_VISUAL_IDS)
    assert set(DOMAIN_VISUAL_IDS.values()) <= registeredIds
    for domain, visualId in DOMAIN_VISUAL_IDS.items():
        assert f'{domain}: "{visualId}"' in generatorText
    for token in (
        "PUBLIC_LEARNING_CATALOG",
        "contentId = basename(file, extname(file))",
        "runtimeTier: contentContract.runtimeTier",
        "eligiblePathIds: contentContract.eligiblePathIds",
        "outcome: outcomes",
        "visualAssetId",
    ):
        assert token in generatorText
