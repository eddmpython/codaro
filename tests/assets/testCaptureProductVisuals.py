from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

from PIL import Image


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

    def testNestedEvidencePathSelectsExactIntermediateStateScreenshot(self) -> None:
        case = {
            "name": "fixture",
            "screenshot": "final.png",
            "checkStateEvidence": {
                "screenshots": {
                    "mismatch": "mismatch.png",
                    "verified": "verified.png",
                }
            },
        }
        self.assertEqual(CAPTURE_TOOL.nestedReportValue(case, ""), "final.png")
        self.assertEqual(
            CAPTURE_TOOL.nestedReportValue(
                case,
                "checkStateEvidence.screenshots.mismatch",
            ),
            "mismatch.png",
        )
        with self.assertRaisesRegex(
            CAPTURE_TOOL.ProductVisualCaptureError,
            "capture evidence path is missing",
        ):
            CAPTURE_TOOL.nestedReportValue(
                case,
                "checkStateEvidence.screenshots.unknown",
            )

    def testEveryFixtureHasOneLightAndOneDarkCapture(self) -> None:
        themesByFixture: dict[str, set[str]] = {}
        for asset in self.assets:
            fixtureId = asset["provenance"]["fixtureId"]
            themesByFixture.setdefault(fixtureId, set()).add(asset["capture"]["theme"])
        self.assertTrue(themesByFixture)
        self.assertTrue(
            all(themes == {"light", "dark"} for themes in themesByFixture.values())
        )

    def testEveryProductCaptureRecordsItsCapturePlatform(self) -> None:
        # 픽셀 비교는 같은 OS 래스터라이저에서만 유효하다. --check 가 플랫폼
        # 일치 여부를 판정하려면 모든 캡처가 자기 OS 를 기록해야 한다.
        for asset in self.assets:
            with self.subTest(asset=asset["id"]):
                self.assertIn(
                    asset["capture"].get("platform"),
                    {"win32", "linux", "darwin"},
                )

    def testCheckSkipsPixelComparisonOnlyForForeignCapturePlatform(self) -> None:
        assets = [
            {"id": "sameOs", "capture": {"platform": "win32"}},
            {"id": "foreignOs", "capture": {"platform": "linux"}},
            {"id": "unstamped", "capture": {}},
        ]
        matching, skipped, failures = CAPTURE_TOOL.partitionAssetsByPlatform(assets, "win32")
        self.assertEqual([asset["id"] for asset in matching], ["sameOs"])
        self.assertEqual(
            skipped,
            [
                {
                    "id": "foreignOs",
                    "skipped": "capture-platform-mismatch",
                    "capturePlatform": "linux",
                    "runnerPlatform": "win32",
                }
            ],
        )
        # 기록이 없는 자산은 skip 이 아니라 provenance 실패다.
        self.assertEqual(len(failures), 1)
        self.assertIn("unstamped", failures[0])
        self.assertIn("--update", failures[0])

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

    def testPixelComparisonAllowsOnlyTinyRoundedBorderRasterNoise(self) -> None:
        with tempfile.TemporaryDirectory(prefix="codaro-pixel-comparison-") as directory:
            root = Path(directory)
            expectedPath = root / "expected.png"
            withinTolerancePath = root / "within-tolerance.png"
            tooManyPixelsPath = root / "too-many-pixels.png"
            tooMuchDeltaPath = root / "too-much-delta.png"
            expected = Image.new("RGBA", (10, 10), (20, 21, 24, 255))
            expected.save(expectedPath)

            withinTolerance = expected.copy()
            for x in range(CAPTURE_TOOL.MIN_RASTER_NOISE_PIXELS):
                withinTolerance.putpixel((x, 0), (28, 21, 24, 255))
            withinTolerance.save(withinTolerancePath)
            comparison = CAPTURE_TOOL.pngPixelComparison(
                expectedPath,
                withinTolerancePath,
            )
            self.assertTrue(comparison["equivalent"])
            self.assertFalse(comparison["byteExact"])
            self.assertEqual(comparison["differingPixelCount"], 8)
            self.assertEqual(comparison["allowedDifferingPixelCount"], 8)
            self.assertEqual(comparison["maxChannelDelta"], 8)

            tooManyPixels = withinTolerance.copy()
            tooManyPixels.putpixel(
                (CAPTURE_TOOL.MIN_RASTER_NOISE_PIXELS, 0),
                (28, 21, 24, 255),
            )
            tooManyPixels.save(tooManyPixelsPath)
            self.assertFalse(
                CAPTURE_TOOL.pngPixelComparison(
                    expectedPath,
                    tooManyPixelsPath,
                )["equivalent"]
            )

            tooMuchDelta = expected.copy()
            tooMuchDelta.putpixel(
                (0, 0),
                (20 + CAPTURE_TOOL.MAX_RASTER_CHANNEL_DELTA + 1, 21, 24, 255),
            )
            tooMuchDelta.save(tooMuchDeltaPath)
            self.assertFalse(
                CAPTURE_TOOL.pngPixelComparison(
                    expectedPath,
                    tooMuchDeltaPath,
                )["equivalent"]
            )

    def testPixelComparisonRelaxesBudgetOnlyForLowDeltaAntialiasNoise(self) -> None:
        with tempfile.TemporaryDirectory(prefix="codaro-aa-noise-") as directory:
            root = Path(directory)
            expectedPath = root / "expected.png"
            expected = Image.new("RGBA", (10, 10), (20, 21, 24, 255))
            expected.save(expectedPath)
            aaBudget = (
                CAPTURE_TOOL.MIN_RASTER_NOISE_PIXELS
                * CAPTURE_TOOL.AA_RASTER_PIXEL_MULTIPLIER
            )

            def comparisonWith(pixelCount: int, delta: int) -> dict:
                actual = expected.copy()
                for index in range(pixelCount):
                    actual.putpixel(
                        (index % 10, index // 10),
                        (20 + delta, 21, 24, 255),
                    )
                actualPath = root / f"actual-{pixelCount}-{delta}.png"
                actual.save(actualPath)
                return CAPTURE_TOOL.pngPixelComparison(expectedPath, actualPath)

            # 글리프 안티앨리어싱 노이즈(저델타)는 기본 허용치를 넘어도 완화 범위 안이면 동등.
            lowDeltaShimmer = comparisonWith(aaBudget - 4, CAPTURE_TOOL.AA_RASTER_CHANNEL_DELTA)
            self.assertTrue(lowDeltaShimmer["equivalent"])
            # 같은 픽셀 수라도 델타가 완화 기준을 넘으면 실제 드리프트로 본다.
            highDeltaChange = comparisonWith(
                aaBudget - 4,
                CAPTURE_TOOL.AA_RASTER_CHANNEL_DELTA + 1,
            )
            self.assertFalse(highDeltaChange["equivalent"])
            # 저델타라도 완화 허용치를 넘으면 실패한다.
            oversizedShimmer = comparisonWith(aaBudget + 1, CAPTURE_TOOL.AA_RASTER_CHANNEL_DELTA)
            self.assertFalse(oversizedShimmer["equivalent"])

    def testRasterNoiseBudgetScalesWithViewportAreaAndStaysCapped(self) -> None:
        self.assertEqual(CAPTURE_TOOL.allowedRasterNoisePixels((10, 10)), 8)
        self.assertEqual(CAPTURE_TOOL.allowedRasterNoisePixels((390, 844)), 11)
        self.assertEqual(CAPTURE_TOOL.allowedRasterNoisePixels((900, 760)), 23)
        self.assertEqual(CAPTURE_TOOL.allowedRasterNoisePixels((1440, 900)), 32)
        self.assertEqual(CAPTURE_TOOL.allowedRasterNoisePixels((3840, 2160)), 32)

    def testEquivalentCaptureNoiseDoesNotReplaceCanonicalSource(self) -> None:
        with tempfile.TemporaryDirectory(prefix="codaro-product-promotion-") as directory:
            root = Path(directory)
            sourcePath = root / "canonical.png"
            equivalentPath = root / "equivalent.png"
            changedPath = root / "changed.png"
            source = Image.new("RGBA", (10, 10), (20, 21, 24, 255))
            source.save(sourcePath)
            sourceBytes = sourcePath.read_bytes()

            equivalent = source.copy()
            equivalent.putpixel(
                (0, 0),
                (20 + CAPTURE_TOOL.MAX_RASTER_CHANNEL_DELTA, 21, 24, 255),
            )
            equivalent.save(equivalentPath)
            promotedHash, comparison = CAPTURE_TOOL.promoteCaptureSource(
                sourcePath,
                equivalentPath,
            )
            self.assertTrue(comparison["equivalent"])
            self.assertEqual(sourcePath.read_bytes(), sourceBytes)
            self.assertEqual(promotedHash, CAPTURE_TOOL.sha256Path(sourcePath))

            changed = source.copy()
            for x in range(CAPTURE_TOOL.MIN_RASTER_NOISE_PIXELS + 1):
                changed.putpixel((x, 0), (100, 21, 24, 255))
            changed.save(changedPath)
            promotedHash, comparison = CAPTURE_TOOL.promoteCaptureSource(
                sourcePath,
                changedPath,
            )
            self.assertFalse(comparison["equivalent"])
            self.assertEqual(sourcePath.read_bytes(), changedPath.read_bytes())
            self.assertEqual(promotedHash, CAPTURE_TOOL.sha256Path(changedPath))

    def testLocalAutomationFixtureHasStableIdsTimesAndBytes(self) -> None:
        with tempfile.TemporaryDirectory(prefix="codaro-automation-fixture-a-") as first:
            with tempfile.TemporaryDirectory(prefix="codaro-automation-fixture-b-") as second:
                firstRoot = Path(first)
                secondRoot = Path(second)
                PRODUCT_RUNNER.seedLocalAutomationFixture(firstRoot, firstRoot / "workspace")
                PRODUCT_RUNNER.seedLocalAutomationFixture(secondRoot, secondRoot / "workspace")
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
        self.assertIn(
            '"example.com", "example.org", "example.net"',
            PRODUCT_RUNNER.AUDIT_SCRIPT,
        )
        source = PRODUCT_RUNNER_PATH.read_text(encoding="utf-8")
        self.assertIn("visible capture contains sensitive text signals", source)


if __name__ == "__main__":
    unittest.main()
