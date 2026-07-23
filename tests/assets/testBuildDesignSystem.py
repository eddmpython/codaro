from __future__ import annotations

from copy import deepcopy
import importlib.util
import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[2]
GENERATOR_PATH = ROOT / "assets" / "brand" / "tools" / "buildDesignSystem.py"
TOKEN_PATH = ROOT / "assets" / "brand" / "designSystem" / "tokens.json"
FONT_MANIFEST_PATH = ROOT / "assets" / "brand" / "designSystem" / "fontManifest.json"


def loadGenerator():
    spec = importlib.util.spec_from_file_location("codaro_build_design_system", GENERATOR_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("unable to load design system generator")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


GENERATOR = loadGenerator()


class BuildDesignSystemTest(unittest.TestCase):
    def setUp(self) -> None:
        self.tokens = json.loads(TOKEN_PATH.read_text(encoding="utf-8"))
        self.fontManifest = json.loads(FONT_MANIFEST_PATH.read_text(encoding="utf-8"))

    def testCurrentSourcesValidate(self) -> None:
        GENERATOR.validateTokenDocument(self.tokens)
        GENERATOR.validateFontManifest(self.fontManifest)

    def testRadiusCeilingRejectsOversizedContainer(self) -> None:
        invalid = deepcopy(self.tokens)
        invalid["astryxTokens"]["--radius-container"] = "12px"
        with self.assertRaisesRegex(GENERATOR.DesignSystemError, "8px product radius ceiling"):
            GENERATOR.validateTokenDocument(invalid)

    def testRuntimeContractKeepsThreeDensitiesAndAccents(self) -> None:
        runtimeTypes = GENERATOR.renderRuntimeTypes("a" * 64, self.tokens)
        self.assertIn('type DensityMode = "public" | "learningComfortable" | "studioDense"', runtimeTypes)
        self.assertIn('type AccentId = "plum" | "blue" | "teal"', runtimeTypes)
        self.assertIn('surface === "curriculum" || surface === "lesson"', runtimeTypes)
        self.assertIn('accentSwatches = {"plum":"#6d2857","blue":"#1559aa","teal":"#08786a"}', runtimeTypes)

    def testRuntimeCssIsDeterministicAndReducedMotionAware(self) -> None:
        first = GENERATOR.renderRuntimeCss(self.tokens)
        second = GENERATOR.renderRuntimeCss(self.tokens)
        self.assertEqual(first, second)
        self.assertIn('@media (prefers-reduced-motion: reduce)', first)
        self.assertIn('[data-density="learningComfortable"]', first)
        self.assertIn('[data-accent="plum"]', first)

    def testFontCssUsesManifestPolicy(self) -> None:
        css = GENERATOR.renderFontCss(self.fontManifest, "/fonts/")
        self.assertEqual(css.count("@font-face"), 6)
        self.assertEqual(css.count("font-display: swap"), 6)
        self.assertIn('font-family: "Pretendard"', css)
        self.assertIn('font-family: "JetBrains Mono"', css)


if __name__ == "__main__":
    unittest.main()
