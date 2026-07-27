from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]
CAPTURE_PATH = ROOT / "assets" / "brand" / "tools" / "captureOutcomeProofs.py"
MANIFEST_PATH = ROOT / "assets" / "brand" / "visuals" / "manifest.json"


def loadCaptureTool():
    spec = importlib.util.spec_from_file_location("codaro_capture_outcome_proofs_test", CAPTURE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("unable to load outcome proof capture tool")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


CAPTURE = loadCaptureTool()


class CaptureOutcomeProofsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
        self.assets = CAPTURE.manifestAssets(self.manifest)

    def testAllRequiredOutcomeProofsUseDeterministicCaptureContract(self) -> None:
        self.assertEqual(set(self.assets), set(CAPTURE.OUTCOME_IDS))
        pathUsage = {
            "dataReportOutcome": "path-dataReporting",
            "fileAutomationOutcome": "path-fileAutomation",
            "officeAutomationOutcome": "path-officeAutomation",
            "webMonitoringOutcome": "path-webMonitoring",
        }
        for assetId, asset in self.assets.items():
            with self.subTest(assetId=assetId):
                self.assertEqual(asset["kind"], "outcomeProof")
                self.assertEqual(asset["sourceType"], "playwrightCapture")
                self.assertEqual(asset["rendering"]["fit"], "contain")
                self.assertEqual(asset["rendering"]["width"], CAPTURE.WIDTH)
                self.assertEqual(asset["rendering"]["height"], CAPTURE.HEIGHT)
                self.assertIn(pathUsage[assetId], asset["rendering"]["proofUsage"])
                self.assertTrue(asset["learning"]["learningQuestion"])
                self.assertTrue(asset["learning"]["decisionShown"])

    def testFixtureRenderersShowInputResultAndVerificationReceipt(self) -> None:
        fixtures = CAPTURE.loadJson(CAPTURE.FIXTURE_PATH)
        for assetId, renderer in CAPTURE.renderers().items():
            with self.subTest(assetId=assetId):
                html = renderer(fixtures[assetId])
                self.assertIn("입력", html)
                self.assertIn("실행 결과", html)
                self.assertIn("검증 통과", html)
                self.assertIn("ACTUAL OUTCOME", html)
                self.assertNotIn("blur(", html)

    def testCaptureSourcesIncludeFixtureTokensFontsAndOwner(self) -> None:
        expected = [
            "assets/brand/designSystem/fonts",
            "assets/brand/designSystem/tokens.json",
            "assets/brand/tools/captureOutcomeProofs.py",
            "assets/brand/visuals/outcomes/fixtures.json",
        ]
        for assetId, asset in self.assets.items():
            with self.subTest(assetId=assetId):
                self.assertEqual(asset["capture"]["sourcePaths"], expected)


if __name__ == "__main__":
    unittest.main()
