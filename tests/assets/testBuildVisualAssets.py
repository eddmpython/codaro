from __future__ import annotations

import importlib.util
from pathlib import Path
import tempfile
import unittest


ROOT = Path(__file__).resolve().parents[2]
BUILDER_PATH = ROOT / "assets" / "brand" / "tools" / "buildVisualAssets.py"


def loadBuilder():
    spec = importlib.util.spec_from_file_location("codaro_build_visual_assets_determinism", BUILDER_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("unable to load visual asset builder")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


BUILDER = loadBuilder()


class BuildVisualAssetsTest(unittest.TestCase):
    def testCommittedOutputMatchesDeterministicBuild(self) -> None:
        manifest = BUILDER.loadManifest()
        with tempfile.TemporaryDirectory(prefix="codaro-visual-build-") as temporary:
            expectedRoot = Path(temporary) / "generated"
            BUILDER.buildResponsiveVariants(manifest, expectedRoot)
            self.assertEqual(BUILDER.compareTrees(expectedRoot, BUILDER.GENERATED_ROOT), [])

    def testGeneratedManifestHasHashedPublicPaths(self) -> None:
        generated = BUILDER.loadManifest(BUILDER.GENERATED_MANIFEST_PATH)
        self.assertEqual(generated["schemaVersion"], 1)
        self.assertTrue(generated["sourceManifestHash"].startswith("sha256-"))
        for asset in generated["assets"]:
            sourceHashPrefix = asset["sourceHash"].removeprefix("sha256-")[:12]
            self.assertTrue(asset["outputs"])
            self.assertTrue(all(sourceHashPrefix in output["publicPath"] for output in asset["outputs"]))


if __name__ == "__main__":
    unittest.main()
