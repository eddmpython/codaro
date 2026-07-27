from __future__ import annotations

import argparse
from datetime import UTC, datetime
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import struct
import subprocess
import sys
import time
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = ROOT / "assets" / "brand" / "visuals" / "manifest.json"
BUILDER_PATH = ROOT / "assets" / "brand" / "tools" / "buildVisualAssets.py"
PRODUCT_RUNNER_PATH = ROOT / "tests" / "surface" / "verifyProductExperiencePlaywright.py"
REPORT_ROOT = ROOT / "output" / "test-runner" / "product-visual-capture"
REPORT_PATH = REPORT_ROOT / "product-visual-capture-report.json"
CAPTURE_OWNER_PATHS = (
    "tests/assets/captureProductVisuals.py",
    "tests/surface/verifyProductExperiencePlaywright.py",
)
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
MAX_RASTER_NOISE_PIXELS = 8
MAX_RASTER_CHANNEL_DELTA = 10


class ProductVisualCaptureError(RuntimeError):
    pass


def loadModule(name: str, path: Path) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise ProductVisualCaptureError(f"unable to load module: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def loadManifest() -> dict[str, Any]:
    value = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ProductVisualCaptureError("visual manifest root must be an object")
    return value


def productCaptureAssets(
    manifest: dict[str, Any],
    selectedAssetIds: set[str] | None = None,
) -> list[dict[str, Any]]:
    assets = [
        asset
        for asset in manifest.get("assets", [])
        if isinstance(asset, dict)
        and asset.get("kind") == "productScreenshot"
        and asset.get("sourceType") == "playwrightCapture"
    ]
    if selectedAssetIds:
        knownIds = {str(asset.get("id")) for asset in assets}
        missingIds = sorted(selectedAssetIds - knownIds)
        if missingIds:
            raise ProductVisualCaptureError(
                "unknown product visual asset ID(s): " + ", ".join(missingIds)
            )
        assets = [asset for asset in assets if asset.get("id") in selectedAssetIds]
    if not assets:
        raise ProductVisualCaptureError("visual manifest has no selected product captures")
    fixtureThemes = [
        (
            str(asset.get("provenance", {}).get("fixtureId", "")),
            str(asset.get("capture", {}).get("theme", "")),
        )
        for asset in assets
    ]
    if (
        len(fixtureThemes) != len(set(fixtureThemes))
        or any(not fixtureId or theme not in {"light", "dark"} for fixtureId, theme in fixtureThemes)
    ):
        raise ProductVisualCaptureError(
            "product capture fixture and theme pairs must be non-empty and unique"
        )
    return assets


def captureCasesByName() -> dict[str, dict[str, Any]]:
    runner = loadModule("codaro_product_capture_runner", PRODUCT_RUNNER_PATH)
    cases = runner.browserCases(41001, 41002, 41003)
    return {str(case["name"]): case for case in cases}


def normalizedCaptureSourcePaths(asset: dict[str, Any]) -> list[str]:
    sourcePaths = asset.get("capture", {}).get("sourcePaths")
    if not isinstance(sourcePaths, list) or not all(
        isinstance(path, str) and path for path in sourcePaths
    ):
        raise ProductVisualCaptureError(f"{asset.get('id')}: capture sourcePaths are invalid")
    return sorted(set(sourcePaths).union(CAPTURE_OWNER_PATHS))


def validateManifestCaptureContract(
    assets: list[dict[str, Any]],
    *,
    requireCaptureOwners: bool,
) -> list[str]:
    casesByName = captureCasesByName()
    failures: list[str] = []
    for asset in assets:
        assetId = str(asset.get("id"))
        fixtureId = str(asset.get("provenance", {}).get("fixtureId", ""))
        case = casesByName.get(fixtureId)
        if case is None:
            failures.append(f"{assetId}: unknown product browser fixture {fixtureId}")
            continue
        viewport = asset.get("capture", {}).get("viewport")
        rendering = asset.get("rendering", {})
        if viewport != case.get("viewport"):
            failures.append(
                f"{assetId}: manifest viewport {viewport} differs from fixture {case.get('viewport')}"
            )
        if viewport != {
            "width": rendering.get("width"),
            "height": rendering.get("height"),
        }:
            failures.append(f"{assetId}: capture and rendering dimensions differ")
        if requireCaptureOwners:
            actualPaths = asset.get("capture", {}).get("sourcePaths", [])
            missingOwners = [path for path in CAPTURE_OWNER_PATHS if path not in actualPaths]
            if missingOwners:
                failures.append(
                    f"{assetId}: capture provenance omits owner path(s) {missingOwners}"
                )
    return failures


def gitHead() -> str:
    return subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=True,
        capture_output=True,
        encoding="utf-8",
    ).stdout.strip()


def requireCleanWorktree() -> None:
    status = subprocess.run(
        ("git", "status", "--porcelain=v1"),
        cwd=ROOT,
        check=True,
        capture_output=True,
        encoding="utf-8",
    ).stdout.strip()
    if status:
        raise ProductVisualCaptureError(
            "product visual update requires a clean implementation commit"
        )


def sha256Path(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def pngDimensions(path: Path) -> tuple[int, int]:
    header = path.read_bytes()[:24]
    if (
        len(header) != 24
        or header[:8] != PNG_SIGNATURE
        or header[12:16] != b"IHDR"
    ):
        raise ProductVisualCaptureError(f"capture is not a valid PNG: {displayPath(path)}")
    return struct.unpack(">II", header[16:24])


def pngPixelComparison(expectedPath: Path, actualPath: Path) -> dict[str, Any]:
    from PIL import Image, ImageChops

    with Image.open(expectedPath) as expectedImage, Image.open(actualPath) as actualImage:
        expected = expectedImage.convert("RGBA")
        actual = actualImage.convert("RGBA")
        if expected.size != actual.size:
            return {
                "equivalent": False,
                "byteExact": False,
                "differingPixelCount": None,
                "maxChannelDelta": None,
                "expectedSize": list(expected.size),
                "actualSize": list(actual.size),
            }
        difference = ImageChops.difference(expected, actual)
        differingPixelCount = 0
        maxChannelDelta = 0
        differenceBytes = difference.tobytes()
        for offset in range(0, len(differenceBytes), 4):
            pixelDelta = max(differenceBytes[offset:offset + 4])
            if pixelDelta:
                differingPixelCount += 1
                maxChannelDelta = max(maxChannelDelta, pixelDelta)
        return {
            "equivalent": (
                differingPixelCount <= MAX_RASTER_NOISE_PIXELS
                and maxChannelDelta <= MAX_RASTER_CHANNEL_DELTA
            ),
            "byteExact": differingPixelCount == 0,
            "differingPixelCount": differingPixelCount,
            "maxChannelDelta": maxChannelDelta,
            "expectedSize": list(expected.size),
            "actualSize": list(actual.size),
        }


def displayPath(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return str(path)


def runCapture(asset: dict[str, Any], expectedGitHead: str) -> dict[str, Any]:
    assetId = str(asset["id"])
    fixtureId = str(asset["provenance"]["fixtureId"])
    theme = str(asset["capture"]["theme"])
    reportPath = REPORT_ROOT / "reports" / f"{assetId}.json"
    reportPath.parent.mkdir(parents=True, exist_ok=True)
    reportPath.unlink(missing_ok=True)
    environment = os.environ.copy()
    environment.update(
        {
            "CODARO_PRODUCT_CASE": fixtureId,
            "CODARO_PRODUCT_COLOR_SCHEME": theme,
            "CODARO_PRODUCT_GATE": "product-visual-capture",
            "CODARO_PRODUCT_REPORT_PATH": displayPath(reportPath),
            "PYTHONUTF8": "1",
            "PYTHONIOENCODING": "utf-8",
        }
    )
    result = subprocess.run(
        (sys.executable, "-X", "utf8", str(PRODUCT_RUNNER_PATH)),
        cwd=ROOT,
        env=environment,
        check=False,
    )
    if result.returncode != 0 or not reportPath.is_file():
        raise ProductVisualCaptureError(
            f"{assetId}: product browser fixture failed with exit {result.returncode}"
        )
    report = json.loads(reportPath.read_text(encoding="utf-8"))
    cases = report.get("cases")
    if (
        report.get("passed") is not True
        or report.get("gitHead") != expectedGitHead
        or report.get("colorScheme") != theme
        or not isinstance(cases, list)
        or len(cases) != 1
    ):
        raise ProductVisualCaptureError(f"{assetId}: capture report contract is invalid")
    case = cases[0]
    if case.get("name") != fixtureId or case.get("viewport") != asset["capture"]["viewport"]:
        raise ProductVisualCaptureError(f"{assetId}: captured fixture identity or viewport drifted")
    failures = [
        *report.get("failures", []),
        *case.get("failures", []),
        *case.get("consoleErrors", []),
        *case.get("httpFailures", []),
        *case.get("assetFailures", []),
    ]
    redactionSignals = case.get("audit", {}).get("captureRedactionSignals")
    if not isinstance(redactionSignals, dict):
        failures.append("capture redaction evidence is missing")
    else:
        failures.extend(
            f"sensitive text signal: {signal}"
            for signal, detected in redactionSignals.items()
            if detected
        )
    if failures:
        raise ProductVisualCaptureError(
            f"{assetId}: capture has product or redaction failure(s): {failures[:5]}"
        )
    screenshotValue = case.get("screenshot")
    if not isinstance(screenshotValue, str) or not screenshotValue:
        raise ProductVisualCaptureError(f"{assetId}: capture screenshot path is missing")
    screenshotPath = (ROOT / screenshotValue).resolve()
    if not screenshotPath.is_relative_to(ROOT) or not screenshotPath.is_file():
        raise ProductVisualCaptureError(f"{assetId}: capture screenshot is missing")
    width, height = pngDimensions(screenshotPath)
    expectedViewport = asset["capture"]["viewport"]
    if (width, height) != (expectedViewport["width"], expectedViewport["height"]):
        raise ProductVisualCaptureError(
            f"{assetId}: PNG dimensions {(width, height)} differ from {expectedViewport}"
        )
    return {
        "id": assetId,
        "fixtureId": fixtureId,
        "theme": theme,
        "viewport": expectedViewport,
        "browserVersion": str(report.get("browser", {}).get("version", "")),
        "screenshotPath": screenshotPath,
        "screenshotHash": sha256Path(screenshotPath),
        "reportPath": reportPath,
        "redactionSignals": redactionSignals,
    }


def captureAssets(assets: list[dict[str, Any]], expectedGitHead: str) -> tuple[list[dict[str, Any]], list[str]]:
    captures: list[dict[str, Any]] = []
    failures: list[str] = []
    for asset in assets:
        try:
            captures.append(runCapture(asset, expectedGitHead))
        except (OSError, ValueError, ProductVisualCaptureError) as exc:
            failures.append(str(exc))
    return captures, failures


def checkCaptures(
    assets: list[dict[str, Any]],
    captures: list[dict[str, Any]],
) -> list[str]:
    capturesById = {capture["id"]: capture for capture in captures}
    failures: list[str] = []
    for asset in assets:
        assetId = str(asset["id"])
        capture = capturesById.get(assetId)
        if capture is None:
            continue
        sourcePath = (ROOT / str(asset["sourcePath"])).resolve()
        comparison = pngPixelComparison(sourcePath, capture["screenshotPath"])
        capture["pixelComparison"] = comparison
        if not comparison["equivalent"]:
            failures.append(
                f"{assetId}: canonical product proof differs from fresh fixture "
                f"(source sha256-{sha256Path(sourcePath)}, "
                f"capture sha256-{capture['screenshotHash']}, "
                f"pixels {comparison['differingPixelCount']}, "
                f"max channel delta {comparison['maxChannelDelta']})"
            )
        if asset["capture"]["browserVersion"] != capture["browserVersion"]:
            failures.append(
                f"{assetId}: browser version drift "
                f"{asset['capture']['browserVersion']} != {capture['browserVersion']}"
            )
    return failures


def writeManifest(manifest: dict[str, Any]) -> None:
    temporaryPath = MANIFEST_PATH.with_suffix(".json.tmp")
    temporaryPath.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporaryPath.replace(MANIFEST_PATH)


def runRequired(args: tuple[str, ...], *, cwd: Path = ROOT) -> None:
    result = subprocess.run(args, cwd=cwd, check=False)
    if result.returncode != 0:
        raise ProductVisualCaptureError(
            f"required command failed with exit {result.returncode}: {' '.join(args)}"
        )


def updateCaptures(
    manifest: dict[str, Any],
    assets: list[dict[str, Any]],
    captures: list[dict[str, Any]],
    implementationGitHead: str,
) -> None:
    builder = loadModule("codaro_visual_asset_builder", BUILDER_PATH)
    capturesById = {capture["id"]: capture for capture in captures}
    for asset in assets:
        assetId = str(asset["id"])
        capture = capturesById[assetId]
        sourcePath = (ROOT / str(asset["sourcePath"])).resolve()
        temporaryPath = sourcePath.with_suffix(sourcePath.suffix + ".tmp")
        shutil.copyfile(capture["screenshotPath"], temporaryPath)
        temporaryPath.replace(sourcePath)
        asset["sourceHash"] = f"sha256-{capture['screenshotHash']}"
        asset["sourceGitHead"] = implementationGitHead
        asset["capture"]["browserVersion"] = capture["browserVersion"]
        asset["capture"]["sourcePaths"] = normalizedCaptureSourcePaths(asset)
        asset["capture"]["sourceSetHash"] = builder.captureSourceSetHash(
            asset["capture"]["sourcePaths"]
        )
    writeManifest(manifest)
    runRequired((sys.executable, "-X", "utf8", str(BUILDER_PATH)))
    runRequired(("node", "scripts/syncVisualAssets.mjs"), cwd=ROOT / "editor")
    runRequired(("node", "scripts/syncVisualAssets.js"), cwd=ROOT / "landing")


def writeReport(
    *,
    mode: str,
    gitHeadValue: str,
    startedAt: str,
    started: float,
    captures: list[dict[str, Any]],
    failures: list[str],
) -> None:
    payload = {
        "gate": "product-visual-capture",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "mode": mode,
        "gitHead": gitHeadValue,
        "startedAt": startedAt,
        "completedAt": datetime.now(UTC).isoformat(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "assetCount": len(captures),
        "assets": [
            {
                "id": capture["id"],
                "fixtureId": capture["fixtureId"],
                "theme": capture["theme"],
                "viewport": capture["viewport"],
                "browserVersion": capture["browserVersion"],
                "sourceHash": f"sha256-{capture['screenshotHash']}",
                "pixelComparison": capture.get("pixelComparison"),
                "reportPath": displayPath(capture["reportPath"]),
                "redactionSignals": capture["redactionSignals"],
            }
            for capture in captures
        ],
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(payload, ensure_ascii=False, indent=2))


def parseArgs(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Capture and verify manifest-owned Codaro product visuals."
    )
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true", help="Compare fresh fixture pixels with canonical sources.")
    mode.add_argument("--update", action="store_true", help="Promote fresh fixture pixels and regenerate mirrors.")
    parser.add_argument(
        "--asset",
        action="append",
        default=[],
        help="Limit capture to a manifest asset ID. May be repeated.",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parseArgs(list(sys.argv[1:] if argv is None else argv))
    startedAt = datetime.now(UTC).isoformat()
    started = time.monotonic()
    head = gitHead()
    captures: list[dict[str, Any]] = []
    failures: list[str] = []
    mode = "update" if args.update else "check"
    try:
        manifest = loadManifest()
        assets = productCaptureAssets(manifest, set(args.asset) or None)
        failures.extend(
            validateManifestCaptureContract(
                assets,
                requireCaptureOwners=args.check,
            )
        )
        if args.update:
            requireCleanWorktree()
        if not failures:
            captures, captureFailures = captureAssets(assets, head)
            failures.extend(captureFailures)
        if not failures and args.check:
            failures.extend(checkCaptures(assets, captures))
        if not failures and args.update:
            updateCaptures(manifest, assets, captures, head)
    except (OSError, subprocess.CalledProcessError, ValueError, ProductVisualCaptureError) as exc:
        failures.append(str(exc))
    writeReport(
        mode=mode,
        gitHeadValue=head,
        startedAt=startedAt,
        started=started,
        captures=captures,
        failures=failures,
    )
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print(f"ok: product visual capture {mode} ({len(captures)} assets)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
