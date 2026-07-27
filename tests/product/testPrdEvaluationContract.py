from __future__ import annotations

import copy
import importlib.util
from pathlib import Path
from types import ModuleType


ROOT = Path(__file__).resolve().parents[2]
VERIFIER_PATH = ROOT / "tests" / "product" / "verifyPrdEvaluationContract.py"


def loadVerifier() -> ModuleType:
    spec = importlib.util.spec_from_file_location("verifyPrdEvaluationContractUnderTest", VERIFIER_PATH)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def currentContract(verifier: ModuleType) -> tuple[dict[str, object], dict[str, object]]:
    return verifier.loadMapping(verifier.RUBRIC_PATH), verifier.loadMapping(verifier.SCHEMA_PATH)


def testCurrentEvaluationContractIsFrozenAndComplete() -> None:
    verifier = loadVerifier()
    rubric, schema = currentContract(verifier)

    facts, failures = verifier.validateContract(rubric, schema)

    assert failures == []
    assert facts["rubric"]["dimensionCount"] == 7
    assert facts["rubric"]["totalWeight"] == 100
    assert facts["rubric"]["targetScore"] is None
    assert facts["rubric"]["passThreshold"] is None
    assert facts["schema"]["closedObject"] is True
    assert len(facts["rubric"]["sha256"]) == 64
    assert len(facts["schema"]["sha256"]) == 64


def testEvaluationContractRejectsTargetScoreAndThreshold() -> None:
    verifier = loadVerifier()
    rubric, schema = currentContract(verifier)
    changed = copy.deepcopy(rubric)
    changed["targetScore"] = 90
    changed["passThreshold"] = 80

    _, failures = verifier.validateContract(changed, schema)

    assert "rubric must not define a target score or pass threshold" in failures


def testEvaluationContractRejectsDimensionDrift() -> None:
    verifier = loadVerifier()
    rubric, schema = currentContract(verifier)
    changed = copy.deepcopy(rubric)
    changed["dimensions"] = list(reversed(changed["dimensions"]))

    _, failures = verifier.validateContract(changed, schema)

    assert "rubric dimension IDs or order differ from the frozen contract" in failures


def testEvaluationContractRejectsOpenOrIncompleteReportSchema() -> None:
    verifier = loadVerifier()
    rubric, schema = currentContract(verifier)
    changed = copy.deepcopy(schema)
    changed["additionalProperties"] = True
    changed["required"] = ["totalScore"]

    _, failures = verifier.validateContract(rubric, changed)

    assert "evaluation report schema must be a closed object" in failures
    assert "evaluation report schema misses required evidence fields" in failures


def testEvaluationContractRejectsSchemaDimensionDrift() -> None:
    verifier = loadVerifier()
    rubric, schema = currentContract(verifier)
    changed = copy.deepcopy(schema)
    changed["properties"]["dimensions"]["propertyNames"]["enum"].pop()
    changed["properties"]["dimensions"]["maxProperties"] = 6

    _, failures = verifier.validateContract(rubric, changed)

    assert "evaluation report schema dimensions must mirror the frozen rubric IDs" in failures


def testEvaluationContractReportsMissingDimensionSchemaWithoutCrashing() -> None:
    verifier = loadVerifier()
    rubric, schema = currentContract(verifier)
    changed = copy.deepcopy(schema)
    del changed["properties"]["dimensions"]

    _, failures = verifier.validateContract(rubric, changed)

    assert "evaluation report schema dimensions must mirror the frozen rubric IDs" in failures


def testEvaluationContractRunsRawReportAndBundleNegativeFixtures() -> None:
    verifier = loadVerifier()
    commands = {name: command for name, command in verifier.checkCommands()}
    fixtureCommand = commands["evaluation-contract-fixtures"]

    assert "tests/product/testPrdEvaluationContract.py" in fixtureCommand
    assert "tests/product/testPrdEvaluationReport.py" in fixtureCommand
    assert "tests/product/testPrdEvaluationBundle.py" in fixtureCommand
