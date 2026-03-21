from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter


PROJECT_ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = PROJECT_ROOT / "assets" / "brand" / "mascot" / "source"
SOURCE_SHEETS = (
    ("sheet-01", SOURCE_ROOT / "codaro-sheet-01.png"),
    ("sheet-02", SOURCE_ROOT / "codaro-sheet-02.png"),
)
AVATAR_SOURCE_KEY = "sheet-01"
AVATAR_SOURCE_INDEX = 0
WORK_ROOT = PROJECT_ROOT / "assets" / "brand" / "mascot" / "work"
WORK_POSE_ROOT = WORK_ROOT / "poses"
EDITOR_BRAND_ROOT = PROJECT_ROOT / "editor" / "static" / "brand"
EDITOR_POSE_ROOT = EDITOR_BRAND_ROOT / "mascot-poses"
EDITOR_FAVICON_PATH = PROJECT_ROOT / "editor" / "static" / "favicon.png"
EDITOR_APPLE_TOUCH_PATH = EDITOR_BRAND_ROOT / "apple-touch-icon.png"
SEED_COMPONENT_COUNT = 8
SEED_MIN_AREA = 20000
DECORATION_MIN_AREA = 120
DECORATION_SIDE_MARGIN = 72
DECORATION_TOP_MARGIN = 64
DECORATION_BOTTOM_MARGIN = 48


def makeSquareAsset(image: Image.Image, size: int, paddingRatio: float) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    usableSize = int(size * (1 - paddingRatio * 2))
    scale = min(usableSize / image.width, usableSize / image.height)
    resized = image.resize(
        (max(1, int(image.width * scale)), max(1, int(image.height * scale))),
        Image.Resampling.LANCZOS,
    )
    offsetX = (size - resized.width) // 2
    offsetY = (size - resized.height) // 2
    canvas.paste(resized, (offsetX, offsetY), resized)
    return canvas


def createFaceCrop(image: Image.Image) -> Image.Image:
    width, height = image.size
    left = int(width * 0.18)
    top = int(height * 0.02)
    right = int(width * 0.82)
    bottom = int(height * 0.76)
    return image.crop((left, top, right, bottom))


def createSidebarCrop(image: Image.Image) -> Image.Image:
    width, height = image.size
    left = int(width * 0.12)
    top = int(height * 0.02)
    right = int(width * 0.88)
    bottom = int(height * 0.86)
    return image.crop((left, top, right, bottom))


def savePng(image: Image.Image, targetPath: Path) -> None:
    targetPath.parent.mkdir(parents=True, exist_ok=True)
    image.save(targetPath, format="PNG")


def extractComponents(image: Image.Image) -> list[dict[str, object]]:
    alphaChannel = image.getchannel("A")
    width, height = alphaChannel.size
    pixelAccess = alphaChannel.load()
    visited = [[False] * width for _ in range(height)]
    components: list[dict[str, object]] = []

    for yPosition in range(height):
        for xPosition in range(width):
            if visited[yPosition][xPosition] or pixelAccess[xPosition, yPosition] == 0:
                continue

            queue = deque([(xPosition, yPosition)])
            visited[yPosition][xPosition] = True
            pixelCount = 0
            left = xPosition
            top = yPosition
            right = xPosition
            bottom = yPosition

            while queue:
                currentX, currentY = queue.popleft()
                pixelCount += 1
                left = min(left, currentX)
                top = min(top, currentY)
                right = max(right, currentX)
                bottom = max(bottom, currentY)

                for nextX, nextY in (
                    (currentX + 1, currentY),
                    (currentX - 1, currentY),
                    (currentX, currentY + 1),
                    (currentX, currentY - 1),
                ):
                    if not (0 <= nextX < width and 0 <= nextY < height):
                        continue
                    if visited[nextY][nextX] or pixelAccess[nextX, nextY] == 0:
                        continue
                    visited[nextY][nextX] = True
                    queue.append((nextX, nextY))

            components.append(
                {
                    "area": pixelCount,
                    "bbox": (left, top, right + 1, bottom + 1),
                    "center": ((left + right + 1) / 2, (top + bottom + 1) / 2),
                }
            )

    return components


def expandBox(
    box: tuple[int, int, int, int],
    imageSize: tuple[int, int],
    *,
    leftMargin: int,
    topMargin: int,
    rightMargin: int,
    bottomMargin: int,
) -> tuple[int, int, int, int]:
    width, height = imageSize
    left, top, right, bottom = box
    return (
        max(0, left - leftMargin),
        max(0, top - topMargin),
        min(width, right + rightMargin),
        min(height, bottom + bottomMargin),
    )


def unionBox(firstBox: tuple[int, int, int, int], secondBox: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    firstLeft, firstTop, firstRight, firstBottom = firstBox
    secondLeft, secondTop, secondRight, secondBottom = secondBox
    return (
        min(firstLeft, secondLeft),
        min(firstTop, secondTop),
        max(firstRight, secondRight),
        max(firstBottom, secondBottom),
    )


def containsPoint(box: tuple[int, int, int, int], point: tuple[float, float]) -> bool:
    left, top, right, bottom = box
    xPosition, yPosition = point
    return left <= xPosition <= right and top <= yPosition <= bottom


def isLabelLike(box: tuple[int, int, int, int], area: int) -> bool:
    left, top, right, bottom = box
    width = right - left
    height = bottom - top
    return width >= int(height * 1.8) and area <= 12000


def sortSceneBoxes(boxes: list[tuple[int, int, int, int]]) -> list[tuple[int, int, int, int]]:
    annotated = [
        {
            "bbox": box,
            "centerY": (box[1] + box[3]) / 2,
            "centerX": (box[0] + box[2]) / 2,
        }
        for box in boxes
    ]
    annotated.sort(key=lambda item: item["centerY"])

    rows: list[list[dict[str, object]]] = []
    rowThreshold = 120
    for item in annotated:
        if not rows or abs(item["centerY"] - rows[-1][0]["centerY"]) > rowThreshold:
            rows.append([item])
        else:
            rows[-1].append(item)

    sortedBoxes: list[tuple[int, int, int, int]] = []
    for row in rows:
        row.sort(key=lambda item: item["centerX"])
        sortedBoxes.extend(item["bbox"] for item in row)
    return sortedBoxes


def clampBox(
    box: tuple[int, int, int, int],
    limits: tuple[int, int, int, int],
) -> tuple[int, int, int, int]:
    left, top, right, bottom = box
    minLeft, minTop, maxRight, maxBottom = limits
    return (
        max(left, minLeft),
        max(top, minTop),
        min(right, maxRight),
        min(bottom, maxBottom),
    )


def splitPoseSheet(image: Image.Image) -> list[Image.Image]:
    components = extractComponents(image)
    seedComponents = [
        component for component in sorted(components, key=lambda item: item["area"], reverse=True)
        if int(component["area"]) >= SEED_MIN_AREA
    ][:SEED_COMPONENT_COUNT]
    if len(seedComponents) != SEED_COMPONENT_COUNT:
        raise ValueError(f"Expected {SEED_COMPONENT_COUNT} main components, got {len(seedComponents)}")

    mergedBoxes = [component["bbox"] for component in seedComponents]
    sortedSeedBoxes = sortSceneBoxes(mergedBoxes)

    rowBoxes = [sortedSeedBoxes[rowIndex * 2:(rowIndex + 1) * 2] for rowIndex in range(4)]
    rowBands: list[tuple[int, int]] = []
    for rowIndex, currentRow in enumerate(rowBoxes):
        currentTop = min(box[1] for box in currentRow)
        currentBottom = max(box[3] for box in currentRow)
        if rowIndex == 0:
            rowTop = 0
        else:
            previousBottom = max(box[3] for box in rowBoxes[rowIndex - 1])
            rowTop = (previousBottom + currentTop) // 2
        if rowIndex == len(rowBoxes) - 1:
            rowBottom = image.height
        else:
            nextTop = min(box[1] for box in rowBoxes[rowIndex + 1])
            rowBottom = (currentBottom + nextTop) // 2
        rowBands.append((rowTop, rowBottom))

    rowColumnLimits: list[tuple[int, int, int, int]] = []
    for rowIndex, currentRow in enumerate(rowBoxes):
        leftBox, rightBox = sorted(currentRow, key=lambda box: box[0])
        divider = (leftBox[2] + rightBox[0]) // 2
        rowTop, rowBottom = rowBands[rowIndex]
        rowColumnLimits.append((0, rowTop, divider, rowBottom))
        rowColumnLimits.append((divider, rowTop, image.width, rowBottom))

    mergedBoxes = sortedSeedBoxes
    for component in components:
        componentArea = int(component["area"])
        if componentArea >= SEED_MIN_AREA or componentArea < DECORATION_MIN_AREA:
            continue

        componentCenter = component["center"]
        componentBox = component["bbox"]
        if isLabelLike(componentBox, componentArea):
            continue
        for boxIndex, mergedBox in enumerate(mergedBoxes):
            candidateBox = expandBox(
                mergedBox,
                image.size,
                leftMargin=DECORATION_SIDE_MARGIN,
                topMargin=DECORATION_TOP_MARGIN,
                rightMargin=DECORATION_SIDE_MARGIN,
                bottomMargin=DECORATION_BOTTOM_MARGIN,
            )
            candidateBox = clampBox(candidateBox, rowColumnLimits[boxIndex])
            if containsPoint(candidateBox, componentCenter):
                mergedBoxes[boxIndex] = clampBox(unionBox(mergedBox, componentBox), rowColumnLimits[boxIndex])
                break

    return [image.crop(box) for box in mergedBoxes]


def savePoseAssets(targetRoot: Path, sheetKey: str, poses: list[Image.Image]) -> None:
    for poseIndex, poseImage in enumerate(poses, start=1):
        paddedPose = makeSquareAsset(poseImage, size=1024, paddingRatio=0.04)
        savePng(paddedPose, targetRoot / sheetKey / f"pose-{poseIndex:02d}.png")


def main() -> None:
    poseSheets: dict[str, list[Image.Image]] = {}
    for sheetKey, sourcePath in SOURCE_SHEETS:
        if not sourcePath.exists():
            raise FileNotFoundError(f"Brand source not found: {sourcePath}")
        poseSheets[sheetKey] = splitPoseSheet(Image.open(sourcePath))

    avatarBase = poseSheets[AVATAR_SOURCE_KEY][AVATAR_SOURCE_INDEX]
    avatarFull = makeSquareAsset(avatarBase, size=512, paddingRatio=0.06)
    sidebarCrop = createSidebarCrop(avatarBase)
    avatarSmall = makeSquareAsset(sidebarCrop, size=256, paddingRatio=0.12)
    faceCrop = createFaceCrop(avatarBase)
    avatarFace = makeSquareAsset(faceCrop, size=512, paddingRatio=0.12)
    favicon = avatarFace.resize((64, 64), Image.Resampling.LANCZOS).filter(
        ImageFilter.UnsharpMask(radius=1.2, percent=170, threshold=2)
    )
    appleTouch = avatarFull.resize((180, 180), Image.Resampling.LANCZOS)

    savePng(avatarFull, WORK_ROOT / "avatar-full.png")
    savePng(avatarSmall, WORK_ROOT / "avatar-small.png")
    savePng(avatarFace, WORK_ROOT / "avatar-face.png")
    savePng(favicon, WORK_ROOT / "favicon.png")
    savePng(appleTouch, WORK_ROOT / "apple-touch-icon.png")
    for sheetKey, poses in poseSheets.items():
        savePoseAssets(WORK_POSE_ROOT, sheetKey, poses)

    savePng(avatarFull, EDITOR_BRAND_ROOT / "avatar-full.png")
    savePng(avatarSmall, EDITOR_BRAND_ROOT / "avatar-small.png")
    savePng(avatarFace, EDITOR_BRAND_ROOT / "avatar-face.png")
    savePng(favicon, EDITOR_FAVICON_PATH)
    savePng(appleTouch, EDITOR_APPLE_TOUCH_PATH)
    for sheetKey, poses in poseSheets.items():
        savePoseAssets(EDITOR_POSE_ROOT, sheetKey, poses)

    print(f"[brand] avatarSource={dict(SOURCE_SHEETS)[AVATAR_SOURCE_KEY]}")
    for sheetKey, sourcePath in SOURCE_SHEETS:
        print(f"[brand] poseSheet.{sheetKey}={sourcePath}")
    print(f"[brand] avatar-full={EDITOR_BRAND_ROOT / 'avatar-full.png'}")
    print(f"[brand] avatar-small={EDITOR_BRAND_ROOT / 'avatar-small.png'}")
    print(f"[brand] avatar-face={EDITOR_BRAND_ROOT / 'avatar-face.png'}")
    print(f"[brand] favicon={EDITOR_FAVICON_PATH}")
    print(f"[brand] apple-touch={EDITOR_APPLE_TOUCH_PATH}")


if __name__ == "__main__":
    main()
