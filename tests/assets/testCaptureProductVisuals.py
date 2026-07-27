from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[2]
CAPTURE_TOOL_PATH = ROOT / "tests" / "assets" / "captureProductVisuals.py"
PRODUCT_RUNNER_PATH = ROOT / "tests" / "surface" / "verifyProductExperiencePlaywright.py"


def loadModule(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"unable to load module: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


CAPTURE_TOOL = loadModule("codaro_capture_product_visuals_test", CAPTURE_TOOL_PATH)
PRODUCT_RUNNER = loadModule("codaro_product_experience_capture_test", PRODUCT_RUNNER_PATH)


class CaptureProductVisualsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.manifest = CAPTURE_TOOL.loadManifest()
        self.assets = CAPTURE_TOOL.productCaptureAssets(self.manifest)

    def testManifestTargetsRealBrowserFixturesAtExactViewport(self) -> None:
        browserCases = {
            case["name"]: case
            for case in PRODUCT_RUNNER.browserCases(41001, 41002, 41003)
        }
        self.assertEqual(
            CAPTURE_TOOL.validateManifestCaptureContract(
                self.assets,
                requireCaptureOwners=True,
            ),
            [],
        )
        for asset in self.assets:
            fixtureId = asset["provenance"]["fixtureId"]
            self.assertIn(fixtureId, browserCases)
            self.assertEqual(asset["capture"]["viewport"], browserCases[fixtureId]["viewport"])

    def testCaptureOwnerPathsArePartOfEveryScreenshotProvenance(self) -> None:
        for asset in self.assets:
            with self.subTest(asset=asset["id"]):
                sourcePaths = asset["capture"]["sourcePaths"]
                self.assertEqual(sourcePaths, sorted(set(sourcePaths)))
                self.assertTrue(set(CAPTURE_TOOL.CAPTURE_OWNER_PATHS).issubset(sourcePaths))

    def testCanonicalProductPngDimensionsMatchManifest(self) -> None:
        for asset in self.assets:
            with self.subTest(asset=asset["id"]):
                sourcePath = ROOT / asset["sourcePath"]
                self.assertEqual(
                    CAPTURE_TOOL.pngDimensions(sourcePath),
                    (asset["rendering"]["width"], asset["rendering"]["height"]),
                )
                self.assertEqual(
                    f"sha256-{CAPTURE_TOOL.sha256Path(sourcePath)}",
                    asset["sourceHash"],
                )

    def testLocalAutomationFixtureHasStableIdsTimesAndBytes(self) -> None:
        with tempfile.TemporaryDirectory(prefix="codaro-automation-fixture-a-") as first:
            with tempfile.TemporaryDirectory(prefix="codaro-automation-fixture-b-") as second:
                firstRoot = Path(first)
                secondRoot = Path(second)
                PRODUCT_RUNNER.seedLocalAutomationFixture(firstRoot)
                PRODUCT_RUNNER.seedLocalAutomationFixture(secondRoot)
                firstFiles = {
                    path.relative_to(firstRoot).as_posix(): path.read_bytes()
                    for path in firstRoot.rglob("*")
                    if path.is_file()
                }
                secondFiles = {
                    path.relative_to(secondRoot).as_posix(): path.read_bytes()
                    for path in secondRoot.rglob("*")
                    if path.is_file()
                }
                self.assertEqual(firstFiles, secondFiles)
                index = json.loads(
                    (firstRoot / "tasks" / "index.json").read_text(encoding="utf-8")
                )
                self.assertEqual(
                    [task["id"] for task in index["tasks"]],
                    ["task-daily-summary", "task-workbook-cleanup"],
                )
                self.assertEqual(
                    {task["updatedAt"] for task in index["tasks"]},
                    {
                        "2026-07-22T08:00:00+00:00",
                        "2026-07-23T08:00:00+00:00",
                    },
                )

    def testProductAuditRejectsVisibleSensitiveTextSignals(self) -> None:
        self.assertIn("captureRedactionSignals", PRODUCT_RUNNER.AUDIT_SCRIPT)
        for signal in (
            "windowsUserPath",
            "macUserPath",
            "linuxUserPath",
            "emailAddress",
            "accessCredential",
        ):
            self.assertIn(signal, PRODUCT_RUNNER.AUDIT_SCRIPT)
        source = PRODUCT_RUNNER_PATH.read_text(encoding="utf-8")
        self.assertIn("visible capture contains sensitive text signals", source)


if __name__ == "__main__":
    unittest.main()
