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


def testCodePatternMatchesPrintWithoutParentheses() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "python.intro.yml")
    hits = matchCodePattern(catalog, 'print "Hello World"')
    ids = {hit.id for hit in hits}
    assert "python.intro.printWithoutParentheses" in ids


def testErrorPatternMatchesBareWordNameError() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "python.intro.yml")
    hits = matchErrorPattern(catalog, "Traceback (most recent call last):\nNameError: name 'Hello' is not defined")
    ids = {hit.id for hit in hits}
    assert "python.intro.bareWordString" in ids


def testCodePatternMatchesCaretAsPower() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "python.operators.yml")
    hits = matchCodePattern(catalog, "print(2 ^ 3)")
    ids = {hit.id for hit in hits}
    assert "python.operators.caretAsPower" in ids


def testErrorPatternMatchesNumpyMissingAlias() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "numpy.intro.yml")
    hits = matchErrorPattern(catalog, "Traceback (most recent call last):\nNameError: name 'np' is not defined")
    ids = {hit.id for hit in hits}
    assert "numpy.intro.missingImportAlias" in ids


def testErrorPatternMatchesMergeKeyNotFound() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "pandas.merge.yml")
    hits = matchErrorPattern(catalog, "Traceback (most recent call last):\nKeyError: 'customer_id'")
    ids = {hit.id for hit in hits}
    assert "pandas.merge.keyNotFound" in ids


def testErrorPatternMatchesTimeSeriesDtAccessor() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "pandas.timeSeries.yml")
    hits = matchErrorPattern(catalog, "AttributeError: Can only use .dt accessor with datetimelike values")
    ids = {hit.id for hit in hits}
    assert "pandas.timeSeries.stringDateAccessor" in ids


def testErrorPatternMatchesMathDomainError() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "builtins.numericMath.yml")
    hits = matchErrorPattern(catalog, "ValueError: math domain error")
    ids = {hit.id for hit in hits}
    assert "builtins.numericMath.domainError" in ids


def testErrorPatternMatchesStrptimeMismatch() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "builtins.datetime.yml")
    hits = matchErrorPattern(catalog, "ValueError: time data '06/02/2026' does not match format '%Y-%m-%d'")
    ids = {hit.id for hit in hits}
    assert "builtins.datetime.strptimeFormatMismatch" in ids


def testErrorPatternMatchesFileNotFound() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "builtins.fileSystem.yml")
    hits = matchErrorPattern(catalog, "FileNotFoundError: [Errno 2] No such file or directory: 'x.txt'")
    ids = {hit.id for hit in hits}
    assert "builtins.fileSystem.fileNotFound" in ids


def testErrorPatternMatchesMatplotlibMissingImport() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "matplotlib.basics.yml")
    hits = matchErrorPattern(catalog, "NameError: name 'plt' is not defined")
    ids = {hit.id for hit in hits}
    assert "matplotlib.basics.missingPyplotImport" in ids


def testErrorPatternMatchesDataclassMutableDefault() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "python.dataclasses.yml")
    hits = matchErrorPattern(catalog, "ValueError: mutable default <class 'list'> for field items is not allowed")
    ids = {hit.id for hit in hits}
    assert "python.dataclasses.mutableDefault" in ids


def testErrorPatternMatchesMlNotFitted() -> None:
    catalog = loadCatalog(DEFAULT_CATALOG_DIR / "ml.intro.yml")
    hits = matchErrorPattern(catalog, "sklearn.exceptions.NotFittedError: This LinearRegression instance is not fitted yet")
    ids = {hit.id for hit in hits}
    assert "ml.intro.predictBeforeFit" in ids


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


def testMatchOutcomesMixesCodeAndError() -> None:
    from codaro.curriculum.misconceptionCatalog import matchOutcomes

    hits = matchOutcomes(
        ["python.variables", "python.lists"],
        code="5 = x",
        errorText="",
    )
    ids = {entry.id for _, entry in hits}
    assert "python.variables.assignmentReversal" in ids


def testMatchOutcomesAcrossMultipleOutcomes() -> None:
    from codaro.curriculum.misconceptionCatalog import matchOutcomes

    hits = matchOutcomes(
        ["python.variables", "python.dictsAndSets"],
        code="",
        errorText="KeyError: 'banana'",
    )
    ids = {(outcomeId, entry.id) for outcomeId, entry in hits}
    assert ("python.dictsAndSets", "python.dictsAndSets.missingKeyError") in ids


def testMatchOutcomesSkipsUnknownCatalog() -> None:
    from codaro.curriculum.misconceptionCatalog import matchOutcomes

    hits = matchOutcomes(
        ["nonexistent.outcome", "python.variables"],
        code="5 = x",
    )
    # 존재하지 않는 catalog는 조용히 skip, 존재하는 것만 매칭
    assert any(entry.id.startswith("python.variables.") for _, entry in hits)


def testMatchOutcomesDeduplicatesEntries() -> None:
    from codaro.curriculum.misconceptionCatalog import matchOutcomes

    hits = matchOutcomes(
        ["python.variables"],
        code="5 = x",
        errorText="SyntaxError: cannot assign to literal",
    )
    # 같은 entry 가 code/error 양쪽으로 매칭되더라도 한 번만
    ids = [entry.id for _, entry in hits]
    assert len(ids) == len(set(ids))


# False-positive 가드: 정상 코드가 어떤 카탈로그에도 false hit 을 일으키지 않아야 한다.
# 카탈로그 정규식이 너무 느슨해지면 학습자에게 잘못된 진단을 던지게 된다.
_INNOCUOUS_CODE_SAMPLES = [
    'name = "alice"\nprint(name.upper())\n',
    "numbers = [1, 2, 3]\ntotal = sum(numbers)\nprint(total)\n",
    "scores = {'alice': 90, 'bob': 85}\nfor name, score in scores.items():\n    print(name, score)\n",
    "def square(value):\n    return value * value\n\nresult = square(7)\nprint(result)\n",
    "try:\n    value = int('123')\nexcept ValueError as exc:\n    print('parse failed:', exc)\n",
    "class Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\np = Point(1, 2)\nprint(p.x, p.y)\n",
]


def testInnocuousCodeDoesNotTriggerFalseHitsOnSeedCatalogs() -> None:
    from codaro.curriculum.misconceptionCatalog import matchOutcomes

    catalogs = loadAllCatalogs()
    allOutcomeIds = [catalog.outcomeId for catalog in catalogs]
    falsePositives: list[tuple[str, str, str]] = []
    for sample in _INNOCUOUS_CODE_SAMPLES:
        hits = matchOutcomes(allOutcomeIds, code=sample, errorText="")
        for outcomeId, entry in hits:
            falsePositives.append((outcomeId, entry.id, sample.splitlines()[0]))
    assert not falsePositives, (
        "innocuous code triggered misconception hits — catalog patterns too loose:\n  - "
        + "\n  - ".join(f"{entry} for outcome {outcome} on '{first}'" for outcome, entry, first in falsePositives)
    )
