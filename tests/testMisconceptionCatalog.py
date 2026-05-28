"""Misconception Catalog 무결성/스키마 테스트.

Predict-Run-Reconcile-Adapt 루프 1단계의 시드 카탈로그가 schema/cross-ref/
trigger 규칙을 모두 만족하는지 검사한다.
"""
from __future__ import annotations

from pathlib import Path

import pytest
import yaml

from codaro.curriculum.misconceptionCatalog import (
    DEFAULT_CATALOG_DIR,
    MisconceptionCatalog,
    loadAllCatalogs,
    loadCatalog,
    matchCodePattern,
    matchErrorPattern,
    validateCatalogs,
)
from codaro.curriculum.taxonomy import loadTaxonomy


ROOT = Path(__file__).resolve().parent.parent


def _knownOutcomeIds() -> set[str]:
    taxonomy = loadTaxonomy()
    return {outcome.id for outcome in taxonomy.outcomes}


def testCatalogDirectoryExists() -> None:
    assert DEFAULT_CATALOG_DIR.exists(), (
        f"catalog directory missing: {DEFAULT_CATALOG_DIR}"
    )


def testAllCatalogsLoad() -> None:
    catalogs = loadAllCatalogs()
    assert catalogs, "at least one misconception catalog must exist"
    # Phase 1 시드 — Python 기초 10 outcome 커버
    outcomeIds = {catalog.outcomeId for catalog in catalogs}
    expected = {
        "python.variables",
        "python.strings",
        "python.lists",
        "python.dictsAndSets",
        "python.controlFlow",
        "python.functions",
        "python.errorHandling",
        "python.modulesAndIo",
        "python.oop",
        "python.advancedSyntax",
    }
    assert expected.issubset(outcomeIds), (
        f"missing seed catalogs: {expected - outcomeIds}"
    )


def testCatalogsValidateAgainstTaxonomy() -> None:
    catalogs = loadAllCatalogs()
    known = _knownOutcomeIds()
    errors = validateCatalogs(catalogs, known)
    assert not errors, "catalog integrity errors:\n  - " + "\n  - ".join(errors)


def testEachCatalogHasAtLeastTwoMisconceptions() -> None:
    catalogs = loadAllCatalogs()
    for catalog in catalogs:
        assert len(catalog.misconceptions) >= 2, (
            f"catalog '{catalog.outcomeId}' should have at least 2 misconceptions, "
            f"has {len(catalog.misconceptions)}"
        )


def testTriggersKindMatchesAppliesTo() -> None:
    catalogs = loadAllCatalogs()
    for catalog in catalogs:
        for entry in catalog.misconceptions:
            for idx, trigger in enumerate(entry.triggers):
                errors = trigger.consistencyErrors()
                assert not errors, (
                    f"{entry.id} trigger[{idx}] inconsistencies: {errors}"
                )


def testRejectUnknownOutcome(tmp_path: Path) -> None:
    bad = tmp_path / "bad.yml"
    bad.write_text(
        yaml.safe_dump({
            "meta": {"outcomeId": "nonexistent.outcome", "status": "draft", "version": 1},
            "misconceptions": [
                {
                    "id": "nonexistent.outcome.foo",
                    "label": "Foo",
                    "summary": "x",
                    "triggers": [
                        {"kind": "codePattern", "appliesTo": "code", "pattern": "foo"}
                    ],
                    "diagnostic": {"message": "x", "references": []},
                    "correction": {"hint": "x"},
                }
            ],
        }),
        encoding="utf-8",
    )
    catalog = loadCatalog(bad)
    errors = validateCatalogs([catalog], _knownOutcomeIds())
    assert any("unknown outcome" in err for err in errors)


def testRejectMisconceptionIdPrefixMismatch(tmp_path: Path) -> None:
    bad = tmp_path / "bad.yml"
    bad.write_text(
        yaml.safe_dump({
            "meta": {"outcomeId": "python.variables", "status": "draft", "version": 1},
            "misconceptions": [
                {
                    "id": "python.lists.wrongPrefix",
                    "label": "x",
                    "summary": "x",
                    "triggers": [
                        {"kind": "codePattern", "appliesTo": "code", "pattern": "foo"}
                    ],
                    "diagnostic": {"message": "x", "references": []},
                    "correction": {"hint": "x"},
                }
            ],
        }),
        encoding="utf-8",
    )
    catalog = loadCatalog(bad)
    errors = validateCatalogs([catalog], _knownOutcomeIds())
    assert any("must be prefixed" in err for err in errors)


def testInvalidRegexRejectedAtLoad(tmp_path: Path) -> None:
    bad = tmp_path / "bad.yml"
    bad.write_text(
        yaml.safe_dump({
            "meta": {"outcomeId": "python.variables", "status": "draft", "version": 1},
            "misconceptions": [
                {
                    "id": "python.variables.bad",
                    "label": "x",
                    "summary": "x",
                    "triggers": [
                        {"kind": "codePattern", "appliesTo": "code", "pattern": "([unclosed"}
                    ],
                    "diagnostic": {"message": "x", "references": []},
                    "correction": {"hint": "x"},
                }
            ],
        }),
        encoding="utf-8",
    )
    with pytest.raises(Exception) as excInfo:
        loadCatalog(bad)
    assert "invalid regex" in str(excInfo.value)


def testCodePatternMatchesAssignmentReversal() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "python.variables.yml")
    hits = matchCodePattern(catalog, "5 = x")
    ids = {hit.id for hit in hits}
    assert "python.variables.assignmentReversal" in ids


def testErrorPatternMatchesKeyError() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "python.dictsAndSets.yml")
    hits = matchErrorPattern(catalog, "Traceback (most recent call last):\nKeyError: 'banana'")
    ids = {hit.id for hit in hits}
    assert "python.dictsAndSets.missingKeyError" in ids


def testCodePatternMatchesBareExcept() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "python.errorHandling.yml")
    code = "try:\n    risky()\nexcept:\n    pass\n"
    hits = matchCodePattern(catalog, code)
    ids = {hit.id for hit in hits}
    assert "python.errorHandling.bareExcept" in ids
