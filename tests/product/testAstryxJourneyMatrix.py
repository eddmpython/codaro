from __future__ import annotations

import importlib.util
import json
from pathlib import Path
from types import ModuleType


ROOT = Path(__file__).resolve().parents[2]
MATRIX_PATH = ROOT / "tests/product/astryxVerticalSlice.matrix.json"
RUNNER_PATH = ROOT / "tests/surface/verifyProductExperiencePlaywright.py"


def loadRunner() -> ModuleType:
    spec = importlib.util.spec_from_file_location("astryxProductExperienceRunner", RUNNER_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("product experience runner could not be loaded")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def selectedCases() -> tuple[dict[str, object], list[dict[str, object]]]:
    matrix = json.loads(MATRIX_PATH.read_text(encoding="utf-8"))
    runner = loadRunner()
    available = runner.browserCases(4100, 4200, 4300)
    casesByName = {case["name"]: case for case in available}
    names = runner.astryxJourneyCaseNames(set(casesByName))
    return matrix, [casesByName[name] for name in names]


def testAstryxRunnerConsumesTheSealedMatrixInOrder() -> None:
    matrix, cases = selectedCases()

    assert [case["name"] for case in cases] == matrix["cases"]
    assert len(cases) == 12
    assert matrix["colorSchemes"] == ["dark", "light"]
    assert set(matrix["requiredSurfaces"]) <= {case["surface"] for case in cases}


def testAstryxJourneyKeepsDiscoveryCanonicalAndWorkspaceRolesDistinct() -> None:
    _, cases = selectedCases()
    casesByName = {case["name"]: case for case in cases}
    catalog = casesByName["landing-learn-desktop"]
    publicLesson = casesByName["landing-public-lesson-desktop"]
    workspaceHome = casesByName["web-learning-home-mobile"]

    assert catalog["surface"] == "landing-learn"
    assert publicLesson["surface"] == "landing-public-lesson"
    assert workspaceHome["surface"] == "learning-home"
    assert "/codaro/learn/" in catalog["url"]
    assert "/codaro/learn/lesson/" in publicLesson["url"]
    assert ":4200/" in workspaceHome["url"]
    assert len({catalog["url"], publicLesson["url"], workspaceHome["url"]}) == 3


def testAstryxJourneyPinsResponsiveAndLocalMinimumAnchors() -> None:
    _, cases = selectedCases()
    casesByName = {case["name"]: case for case in cases}

    assert casesByName["landing-home-mobile"]["viewport"] == {"width": 390, "height": 844}
    assert casesByName["landing-home-desktop"]["viewport"] == {"width": 1440, "height": 900}
    assert casesByName["web-learning-home-mobile"]["viewport"]["width"] == 390
    assert casesByName["web-lesson-mobile"]["viewport"]["width"] == 390
    assert casesByName["web-run-mobile"]["viewport"]["width"] == 390
    assert casesByName["web-run-desktop"]["viewport"]["width"] == 1440
    assert casesByName["local-run-minimum"]["viewport"] == {"width": 900, "height": 640}
