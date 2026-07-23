from __future__ import annotations

from copy import deepcopy
import importlib.util
import json
from pathlib import Path
import re
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[2]
BUILDER_PATH = ROOT / "assets" / "brand" / "tools" / "buildVisualAssets.py"
MANIFEST_PATH = ROOT / "assets" / "brand" / "visuals" / "manifest.json"
SCHEMA_PATH = ROOT / "assets" / "brand" / "visuals" / "manifest.schema.json"
CURRICULUM_GENERATOR_PATH = ROOT / "landing" / "scripts" / "generateCurriculum.js"
LEARNING_DOMAINS = {
    "basics",
    "dataAnalysis",
    "visualization",
    "mathStatsMl",
    "imageVision",
    "automation",
    "devLiteracy",
    "aiIntegration",
}


def loadBuilder():
    spec = importlib.util.spec_from_file_location("codaro_build_visual_assets", BUILDER_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("unable to load visual asset builder")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


BUILDER = loadBuilder()


class VisualAssetManifestTest(unittest.TestCase):
    def setUp(self) -> None:
        self.manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))

    def testCurrentManifestAndSchemaValidate(self) -> None:
        schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
        self.assertEqual(schema["$schema"], "https://json-schema.org/draft/2020-12/schema")
        self.assertIn("asset", schema["$defs"])
        BUILDER.validateVisualManifest(self.manifest)

    def testDuplicateAssetIdIsRejected(self) -> None:
        invalid = deepcopy(self.manifest)
        invalid["assets"].append(deepcopy(invalid["assets"][0]))
        with self.assertRaisesRegex(BUILDER.VisualAssetError, "duplicate visual asset id"):
            BUILDER.validateVisualManifest(invalid)

    def testSourceHashDriftIsRejected(self) -> None:
        invalid = deepcopy(self.manifest)
        invalid["assets"][0]["sourceHash"] = "sha256-" + "0" * 64
        with self.assertRaisesRegex(BUILDER.VisualAssetError, "source hash drift"):
            BUILDER.validateVisualManifest(invalid)

    def testInstructionalPurposeCannotBeEmpty(self) -> None:
        invalid = deepcopy(self.manifest)
        invalid["assets"][0]["learning"]["decisionShown"] = ""
        with self.assertRaisesRegex(BUILDER.VisualAssetError, "decisionShown must be non-empty text"):
            BUILDER.validateVisualManifest(invalid)

    def testResponsiveVariantsContainAvifAndWebp(self) -> None:
        with tempfile.TemporaryDirectory(prefix="codaro-visual-test-") as temporary:
            generated = BUILDER.buildResponsiveVariants(self.manifest, Path(temporary))
        for asset in generated["assets"]:
            expectedCount = len(asset["variants"]["responsiveWidths"]) * 2
            self.assertEqual(len(asset["outputs"]), expectedCount)
            self.assertEqual({output["format"] for output in asset["outputs"]}, {"avif", "webp"})
            self.assertTrue(all(output["integrity"].startswith("sha256-") for output in asset["outputs"]))

    def testEveryLearningDomainUsesADistinctInstructionalVisual(self) -> None:
        source = CURRICULUM_GENERATOR_PATH.read_text(encoding="utf-8")
        match = re.search(r"const DOMAIN_VISUALS = \{(?P<body>.*?)\n\};", source, re.DOTALL)
        self.assertIsNotNone(match, "landing curriculum generator must define DOMAIN_VISUALS")
        mapping = dict(
            re.findall(r'^\s*([A-Za-z][A-Za-z0-9]*):\s*"([A-Za-z][A-Za-z0-9]*)",?\s*$', match.group("body"), re.MULTILINE)
        )

        self.assertEqual(set(mapping), LEARNING_DOMAINS)
        self.assertEqual(len(set(mapping.values())), len(LEARNING_DOMAINS))

        assetsById = {asset["id"]: asset for asset in self.manifest["assets"]}
        for domain, assetId in mapping.items():
            with self.subTest(domain=domain, assetId=assetId):
                self.assertIn(assetId, assetsById)
                asset = assetsById[assetId]
                self.assertEqual(asset["kind"], "instructional")
                self.assertEqual(asset["sourceType"], "generatedRaster")
                self.assertTrue(asset["provenance"]["promptHash"].startswith("sha256-"))
                self.assertIn("lesson-context", asset["rendering"]["proofUsage"])
                self.assertTrue(asset["learning"]["learningQuestion"].strip())
                self.assertTrue(asset["learning"]["decisionShown"].strip())


if __name__ == "__main__":
    unittest.main()
