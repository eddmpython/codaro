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

    def testCaptureSourceSetHashDriftIsRejected(self) -> None:
        invalid = deepcopy(self.manifest)
        captureAsset = next(
            asset for asset in invalid["assets"] if asset["sourceType"] == "playwrightCapture"
        )
        captureAsset["capture"]["sourceSetHash"] = "sha256-" + "0" * 64
        with self.assertRaisesRegex(BUILDER.VisualAssetError, "capture source set hash drift"):
            BUILDER.validateVisualManifest(invalid)

    def testCaptureSourceHashNormalizesTextLineEndings(self) -> None:
        with tempfile.TemporaryDirectory(prefix="codaro-capture-hash-") as temporary:
            root = Path(temporary)
            windowsText = root / "windows.tsx"
            linuxText = root / "linux.tsx"
            windowsText.write_bytes(b"const value = 1;\r\nexport { value };\r\n")
            linuxText.write_bytes(b"const value = 1;\nexport { value };\n")
            self.assertEqual(
                BUILDER.canonicalCaptureSourceBytes(windowsText),
                BUILDER.canonicalCaptureSourceBytes(linuxText),
            )

            binary = root / "capture.png"
            binaryPayload = b"\x89PNG\r\n\x1a\n\r\nbinary"
            binary.write_bytes(binaryPayload)
            self.assertEqual(
                BUILDER.canonicalCaptureSourceBytes(binary),
                binaryPayload,
            )

    def testInstructionalPurposeCannotBeEmpty(self) -> None:
        invalid = deepcopy(self.manifest)
        invalid["assets"][0]["learning"]["decisionShown"] = ""
        with self.assertRaisesRegex(BUILDER.VisualAssetError, "decisionShown must be non-empty text"):
            BUILDER.validateVisualManifest(invalid)

    def testGeneratedRasterPromptSourceAndHashAreVerified(self) -> None:
        generated = next(
            asset for asset in self.manifest["assets"]
            if asset["sourceType"] == "generatedRaster"
        )
        promptPath = ROOT / generated["provenance"]["promptPath"]
        self.assertTrue(promptPath.is_file())
        self.assertEqual(
            generated["provenance"]["promptHash"],
            "sha256-" + BUILDER.sha256Bytes(promptPath.read_bytes()),
        )

        invalid = deepcopy(self.manifest)
        invalidGenerated = next(
            asset for asset in invalid["assets"]
            if asset["sourceType"] == "generatedRaster"
        )
        invalidGenerated["provenance"]["promptHash"] = "sha256-" + "0" * 64
        with self.assertRaisesRegex(BUILDER.VisualAssetError, "prompt hash drift"):
            BUILDER.validateVisualManifest(invalid)

    def testProprietaryAndLicensedMediaProvenanceStayDistinct(self) -> None:
        invalidProprietary = deepcopy(self.manifest)
        invalidProprietary["assets"][0]["provenance"]["licenseUrl"] = (
            "https://example.com/license"
        )
        with self.assertRaisesRegex(
            BUILDER.VisualAssetError,
            "proprietary-project licenseUrl must be null",
        ):
            BUILDER.validateVisualManifest(invalidProprietary)

        invalidLicensed = deepcopy(self.manifest)
        invalidLicensed["assets"][0]["sourceType"] = "licensedMedia"
        with self.assertRaisesRegex(
            BUILDER.VisualAssetError,
            "licensedMedia cannot use proprietary-project",
        ):
            BUILDER.validateVisualManifest(invalidLicensed)

        invalidLicenseUrl = deepcopy(self.manifest)
        invalidLicenseUrl["assets"][0]["sourceType"] = "licensedMedia"
        invalidLicenseUrl["assets"][0]["provenance"]["license"] = "CC-BY-4.0"
        with self.assertRaisesRegex(
            BUILDER.VisualAssetError,
            "licensedMedia requires an HTTPS licenseUrl",
        ):
            BUILDER.validateVisualManifest(invalidLicenseUrl)

    def testResponsiveVariantsContainAvifAndWebp(self) -> None:
        with tempfile.TemporaryDirectory(prefix="codaro-visual-test-") as temporary:
            generated = BUILDER.buildResponsiveVariants(self.manifest, Path(temporary))
        for asset in generated["assets"]:
            expectedCount = len(asset["variants"]["responsiveWidths"]) * 2
            self.assertEqual(len(asset["outputs"]), expectedCount)
            self.assertEqual({output["format"] for output in asset["outputs"]}, {"avif", "webp"})
            self.assertTrue(all(output["integrity"].startswith("sha256-") for output in asset["outputs"]))

    def testProductScreenshotsHaveReciprocalLightAndDarkPairs(self) -> None:
        assetsById = {asset["id"]: asset for asset in self.manifest["assets"]}
        productAssets = [
            asset for asset in self.manifest["assets"]
            if asset["kind"] == "productScreenshot"
        ]
        self.assertGreaterEqual(len(productAssets), 2)
        for asset in productAssets:
            with self.subTest(asset=asset["id"]):
                self.assertEqual(asset["variants"]["lightDark"], "paired")
                pair = assetsById[asset["themePairId"]]
                self.assertEqual(pair["themePairId"], asset["id"])
                self.assertEqual(
                    {asset["capture"]["theme"], pair["capture"]["theme"]},
                    {"light", "dark"},
                )
                self.assertEqual(
                    asset["provenance"]["fixtureId"],
                    pair["provenance"]["fixtureId"],
                )

    def testProductScreenshotWithoutThemePairIsRejected(self) -> None:
        invalid = deepcopy(self.manifest)
        productAsset = next(
            asset for asset in invalid["assets"]
            if asset["kind"] == "productScreenshot"
        )
        productAsset.pop("themePairId")
        productAsset["variants"]["lightDark"] = "single"
        with self.assertRaisesRegex(
            BUILDER.VisualAssetError,
            "product screenshot requires a light and dark pair",
        ):
            BUILDER.validateVisualManifest(invalid)

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
