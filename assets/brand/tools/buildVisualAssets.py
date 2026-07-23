from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import shutil
import sys
import tempfile
from typing import Any


ROOT = Path(__file__).resolve().parents[3]
VISUAL_ROOT = ROOT / "assets" / "brand" / "visuals"
MANIFEST_PATH = VISUAL_ROOT / "manifest.json"
SCHEMA_PATH = VISUAL_ROOT / "manifest.schema.json"
GENERATED_ROOT = VISUAL_ROOT / "generated"
GENERATED_MANIFEST_PATH = GENERATED_ROOT / "manifest.json"
GENERATED_FILES_ROOT = GENERATED_ROOT / "files"
KINDS = {
    "productScreenshot",
    "outcomeProof",
    "instructional",
    "brandCharacter",
    "socialPreview",
    "video",
}
SOURCE_TYPES = {
    "playwrightCapture",
    "generatedRaster",
    "authoredRaster",
    "licensedMedia",
    "videoCapture",
}
FORMATS = {"avif", "webp"}
FITS = {"contain", "cover", "natural"}
LIGHT_DARK = {"single", "paired", "adaptive"}


class VisualAssetError(RuntimeError):
    pass


def canonicalJson(value: object) -> str:
    return json.dumps(value, ensure_ascii=True, sort_keys=True, separators=(",", ":"))


def sha256Bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def loadManifest(path: Path = MANIFEST_PATH) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise VisualAssetError("visual manifest root must be an object")
    return value


def validateVisualManifest(manifest: dict[str, Any]) -> None:
    if manifest.get("schemaVersion") != 1:
        raise VisualAssetError("visual manifest schemaVersion must be 1")
    assets = manifest.get("assets")
    if not isinstance(assets, list) or not assets:
        raise VisualAssetError("visual manifest assets must be a non-empty list")

    seenIds: set[str] = set()
    seenSources: set[str] = set()
    for index, assetValue in enumerate(assets):
        if not isinstance(assetValue, dict):
            raise VisualAssetError(f"asset {index} must be an object")
        asset = assetValue
        assetId = requiredText(asset, "id", f"asset {index}")
        if not assetId[0].islower() or not assetId.replace("_", "").isalnum():
            raise VisualAssetError(f"asset id must be stable camelCase: {assetId}")
        if assetId in seenIds:
            raise VisualAssetError(f"duplicate visual asset id: {assetId}")
        seenIds.add(assetId)

        kind = requiredText(asset, "kind", assetId)
        sourceType = requiredText(asset, "sourceType", assetId)
        if kind not in KINDS:
            raise VisualAssetError(f"{assetId}: unsupported kind {kind}")
        if sourceType not in SOURCE_TYPES:
            raise VisualAssetError(f"{assetId}: unsupported sourceType {sourceType}")

        sourceRelative = requiredText(asset, "sourcePath", assetId)
        sourcePath = resolveSourcePath(sourceRelative)
        if sourceRelative in seenSources:
            raise VisualAssetError(f"duplicate visual source path: {sourceRelative}")
        seenSources.add(sourceRelative)
        if not sourcePath.is_file():
            raise VisualAssetError(f"{assetId}: missing source {sourceRelative}")
        sourceHash = requiredText(asset, "sourceHash", assetId)
        actualHash = f"sha256-{sha256Bytes(sourcePath.read_bytes())}"
        if sourceHash != actualHash:
            raise VisualAssetError(f"{assetId}: source hash drift")
        sourceGitHead = requiredText(asset, "sourceGitHead", assetId)
        if len(sourceGitHead) != 40 or any(character not in "0123456789abcdef" for character in sourceGitHead):
            raise VisualAssetError(f"{assetId}: sourceGitHead must be a full lowercase commit hash")

        provenance = requiredObject(asset, "provenance", assetId)
        for field in ("author", "license", "fixtureId"):
            requiredText(provenance, field, f"{assetId}.provenance")
        if sourceType == "generatedRaster" and not provenance.get("promptHash"):
            raise VisualAssetError(f"{assetId}: generatedRaster requires promptHash")

        rendering = requiredObject(asset, "rendering", assetId)
        width = requiredPositiveInt(rendering, "width", f"{assetId}.rendering")
        height = requiredPositiveInt(rendering, "height", f"{assetId}.rendering")
        aspectRatio = rendering.get("aspectRatio")
        if not isinstance(aspectRatio, (int, float)) or aspectRatio <= 0:
            raise VisualAssetError(f"{assetId}: aspectRatio must be positive")
        if abs(float(aspectRatio) - width / height) > 0.00001:
            raise VisualAssetError(f"{assetId}: aspectRatio does not match dimensions")
        if requiredText(rendering, "fit", f"{assetId}.rendering") not in FITS:
            raise VisualAssetError(f"{assetId}: unsupported fit")
        if kind in {"instructional", "outcomeProof"} and rendering["fit"] == "cover":
            raise VisualAssetError(f"{assetId}: instructional and outcome proof assets cannot use cover")
        validatePoint(requiredObject(rendering, "focalPoint", assetId), f"{assetId}.focalPoint")
        safeRegion = rendering.get("safeTextRegion")
        if safeRegion is not None:
            if not isinstance(safeRegion, dict):
                raise VisualAssetError(f"{assetId}: safeTextRegion must be an object or null")
            validateRegion(safeRegion, f"{assetId}.safeTextRegion")
        proofUsage = rendering.get("proofUsage")
        if not isTextList(proofUsage):
            raise VisualAssetError(f"{assetId}: proofUsage must be a non-empty text list")

        variants = requiredObject(asset, "variants", assetId)
        formats = variants.get("formats")
        if not isTextList(formats) or set(formats) != FORMATS:
            raise VisualAssetError(f"{assetId}: formats must contain AVIF and WebP")
        widths = variants.get("responsiveWidths")
        if (
            not isinstance(widths, list)
            or not widths
            or any(not isinstance(item, int) or isinstance(item, bool) or item < 240 for item in widths)
            or widths != sorted(set(widths))
        ):
            raise VisualAssetError(f"{assetId}: responsiveWidths must be sorted unique integers")
        if max(widths) > width:
            raise VisualAssetError(f"{assetId}: responsive variants cannot upscale source pixels")
        if variants.get("lightDark") not in LIGHT_DARK:
            raise VisualAssetError(f"{assetId}: invalid lightDark mode")
        if not isTextList(variants.get("locales")):
            raise VisualAssetError(f"{assetId}: locales must be a non-empty text list")
        if not isinstance(variants.get("offlineIncluded"), bool):
            raise VisualAssetError(f"{assetId}: offlineIncluded must be boolean")

        learning = requiredObject(asset, "learning", assetId)
        for field in ("alt", "caption", "learningQuestion", "decisionShown"):
            requiredText(learning, field, f"{assetId}.learning")
        lessonRefs = learning.get("lessonRefs")
        if not isinstance(lessonRefs, list) or any(not isinstance(item, str) or not item for item in lessonRefs):
            raise VisualAssetError(f"{assetId}: lessonRefs must be a text list")

        if sourceType in {"playwrightCapture", "videoCapture"}:
            capture = requiredObject(asset, "capture", assetId)
            for field in ("browser", "browserVersion", "theme", "locale"):
                requiredText(capture, field, f"{assetId}.capture")
            viewport = requiredObject(capture, "viewport", f"{assetId}.capture")
            if (
                requiredPositiveInt(viewport, "width", f"{assetId}.capture.viewport") != width
                or requiredPositiveInt(viewport, "height", f"{assetId}.capture.viewport") != height
            ):
                raise VisualAssetError(f"{assetId}: capture viewport and source dimensions differ")

    validateRasterDimensions(assets)


def buildResponsiveVariants(manifest: dict[str, Any], outputRoot: Path) -> dict[str, Any]:
    validateVisualManifest(manifest)
    try:
        from PIL import Image
    except ImportError as exc:
        raise VisualAssetError("Pillow is required to build visual asset variants") from exc

    filesRoot = outputRoot / "files"
    filesRoot.mkdir(parents=True, exist_ok=True)
    generatedAssets: list[dict[str, Any]] = []
    for sourceAsset in manifest["assets"]:
        sourcePath = resolveSourcePath(sourceAsset["sourcePath"])
        sourceHash = sourceAsset["sourceHash"].removeprefix("sha256-")
        outputs: list[dict[str, Any]] = []
        with Image.open(sourcePath) as opened:
            image = opened.convert("RGB")
            for width in sourceAsset["variants"]["responsiveWidths"]:
                height = round(image.height * width / image.width)
                resized = image if width == image.width else image.resize((width, height), Image.Resampling.LANCZOS)
                for imageFormat in sourceAsset["variants"]["formats"]:
                    fileName = f"{sourceAsset['id']}-{width}-{sourceHash[:12]}.{imageFormat}"
                    relativePath = Path(sourceAsset["id"]) / fileName
                    targetPath = filesRoot / relativePath
                    targetPath.parent.mkdir(parents=True, exist_ok=True)
                    saveVariant(resized, targetPath, imageFormat)
                    payload = targetPath.read_bytes()
                    outputs.append(
                        {
                            "byteLength": len(payload),
                            "format": imageFormat,
                            "height": height,
                            "integrity": f"sha256-{sha256Bytes(payload)}",
                            "publicPath": f"/visuals/files/{relativePath.as_posix()}",
                            "width": width,
                        }
                    )
        generatedAsset = dict(sourceAsset)
        generatedAsset["outputs"] = outputs
        generatedAssets.append(generatedAsset)

    generatedManifest = {
        "schemaVersion": 1,
        "sourceManifestHash": f"sha256-{sha256Bytes(canonicalJson(manifest).encode('utf-8'))}",
        "assets": generatedAssets,
    }
    writeJson(outputRoot / "manifest.json", generatedManifest)
    return generatedManifest


def saveVariant(image: Any, targetPath: Path, imageFormat: str) -> None:
    if imageFormat == "avif":
        image.save(targetPath, format="AVIF", quality=62, speed=6)
        return
    if imageFormat == "webp":
        image.save(targetPath, format="WEBP", quality=80, method=6)
        return
    raise VisualAssetError(f"unsupported output format: {imageFormat}")


def buildVisualAssets(*, check: bool = False) -> None:
    manifest = loadManifest()
    validateVisualManifest(manifest)
    with tempfile.TemporaryDirectory(prefix="codaro-visual-assets-") as temporary:
        expectedRoot = Path(temporary) / "generated"
        buildResponsiveVariants(manifest, expectedRoot)
        if check:
            failures = compareTrees(expectedRoot, GENERATED_ROOT)
            if failures:
                raise VisualAssetError("visual asset generated output drift:\n" + "\n".join(failures))
            return
        syncTree(expectedRoot, GENERATED_ROOT)


def compareTrees(expectedRoot: Path, actualRoot: Path) -> list[str]:
    expected = relativeFiles(expectedRoot)
    actual = relativeFiles(actualRoot)
    failures = [f"missing generated file: {path}" for path in sorted(expected - actual)]
    failures.extend(f"orphan generated file: {path}" for path in sorted(actual - expected))
    for path in sorted(expected & actual):
        if (expectedRoot / path).read_bytes() != (actualRoot / path).read_bytes():
            failures.append(f"generated file drift: {path}")
    return failures


def syncTree(sourceRoot: Path, targetRoot: Path) -> None:
    targetRoot.mkdir(parents=True, exist_ok=True)
    expected = relativeFiles(sourceRoot)
    actual = relativeFiles(targetRoot)
    for orphan in actual - expected:
        (targetRoot / orphan).unlink()
    for relativePath in expected:
        sourcePath = sourceRoot / relativePath
        targetPath = targetRoot / relativePath
        targetPath.parent.mkdir(parents=True, exist_ok=True)
        temporaryPath = targetPath.with_suffix(targetPath.suffix + ".tmp")
        shutil.copyfile(sourcePath, temporaryPath)
        temporaryPath.replace(targetPath)
    removeEmptyDirectories(targetRoot)


def removeEmptyDirectories(root: Path) -> None:
    for directory in sorted((path for path in root.rglob("*") if path.is_dir()), reverse=True):
        if not any(directory.iterdir()):
            directory.rmdir()


def relativeFiles(root: Path) -> set[Path]:
    if not root.is_dir():
        return set()
    return {path.relative_to(root) for path in root.rglob("*") if path.is_file()}


def validateRasterDimensions(assets: list[dict[str, Any]]) -> None:
    try:
        from PIL import Image
    except ImportError as exc:
        raise VisualAssetError("Pillow is required to validate visual asset dimensions") from exc
    for asset in assets:
        if asset["kind"] == "video":
            continue
        with Image.open(resolveSourcePath(asset["sourcePath"])) as image:
            expected = (asset["rendering"]["width"], asset["rendering"]["height"])
            if image.size != expected:
                raise VisualAssetError(f"{asset['id']}: declared dimensions do not match source pixels")


def resolveSourcePath(relativeValue: str) -> Path:
    relativePath = Path(relativeValue)
    if relativePath.is_absolute():
        raise VisualAssetError(f"visual source must be repository-relative: {relativeValue}")
    resolved = (ROOT / relativePath).resolve()
    sourceRoot = VISUAL_ROOT.resolve()
    if not resolved.is_relative_to(sourceRoot) or GENERATED_ROOT.resolve() in resolved.parents:
        raise VisualAssetError(f"visual source escapes source root: {relativeValue}")
    return resolved


def requiredText(value: dict[str, Any], field: str, context: str) -> str:
    candidate = value.get(field)
    if not isinstance(candidate, str) or not candidate.strip():
        raise VisualAssetError(f"{context}: {field} must be non-empty text")
    return candidate


def requiredObject(value: dict[str, Any], field: str, context: str) -> dict[str, Any]:
    candidate = value.get(field)
    if not isinstance(candidate, dict):
        raise VisualAssetError(f"{context}: {field} must be an object")
    return candidate


def requiredPositiveInt(value: dict[str, Any], field: str, context: str) -> int:
    candidate = value.get(field)
    if not isinstance(candidate, int) or isinstance(candidate, bool) or candidate <= 0:
        raise VisualAssetError(f"{context}: {field} must be a positive integer")
    return candidate


def isTextList(value: object) -> bool:
    return isinstance(value, list) and bool(value) and all(isinstance(item, str) and bool(item) for item in value)


def validatePoint(value: dict[str, Any], context: str) -> None:
    for field in ("x", "y"):
        candidate = value.get(field)
        if not isinstance(candidate, (int, float)) or not 0 <= candidate <= 1:
            raise VisualAssetError(f"{context}: {field} must be between 0 and 1")


def validateRegion(value: dict[str, Any], context: str) -> None:
    validatePoint(value, context)
    width = value.get("width")
    height = value.get("height")
    if not isinstance(width, (int, float)) or not 0 < width <= 1:
        raise VisualAssetError(f"{context}: width must be between 0 and 1")
    if not isinstance(height, (int, float)) or not 0 < height <= 1:
        raise VisualAssetError(f"{context}: height must be between 0 and 1")
    if value["x"] + width > 1 or value["y"] + height > 1:
        raise VisualAssetError(f"{context}: region must stay inside the image")


def writeJson(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parseArgs(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Build deterministic Codaro visual asset variants.")
    parser.add_argument("--check", action="store_true", help="Fail when generated output is stale.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parseArgs(list(sys.argv[1:] if argv is None else argv))
    try:
        buildVisualAssets(check=args.check)
    except (OSError, ValueError, VisualAssetError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    print("ok: visual asset manifest and variants are current")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
