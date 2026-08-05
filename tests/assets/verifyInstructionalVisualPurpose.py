from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys
import time
from typing import Any

import yaml

from codaro.curriculum.contentHash import lessonContentHash


ROOT = Path(__file__).resolve().parents[2]
CURRICULA_ROOT = ROOT / "curricula" / "python"
MANIFEST_PATH = ROOT / "assets" / "brand" / "visuals" / "manifest.json"
REPORT_PATH = (
    ROOT
    / "output"
    / "test-runner"
    / "instructional-visual-purpose"
    / "instructional-visual-purpose-report.json"
)
EXPECTED_ASSET_IDS = {
    "aiIntegration",
    "dataAnalysis",
    "dataVisualization",
    "developerLiteracy",
    "imageVision",
    "learningAutomation",
    "pythonFundamentals",
    "statisticsMachineLearning",
}


def main() -> int:
    startedAt = datetime.now(UTC).isoformat()
    started = time.monotonic()
    failures: list[str] = []
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    instructionalAssets = {
        asset["id"]: asset
        for asset in manifest.get("assets", [])
        if isinstance(asset, dict) and asset.get("kind") == "instructional"
    }
    if set(instructionalAssets) != EXPECTED_ASSET_IDS:
        failures.append(
            "instructional asset set drifted: "
            f"{sorted(instructionalAssets)}"
        )

    lessonsByRef = curriculumLessons(failures)
    anchorsByAsset: dict[str, list[str]] = {}
    for lessonRef, lesson in lessonsByRef.items():
        for assetId in lessonAssetAnchors(lesson["payload"]):
            anchorsByAsset.setdefault(assetId, []).append(lessonRef)
            if assetId not in instructionalAssets:
                failures.append(
                    f"{lessonRef}: image assetId {assetId} is not an instructional manifest asset"
                )

    for assetId, asset in instructionalAssets.items():
        learning = asset.get("learning", {})
        lessonRefs = learning.get("lessonRefs")
        if not isinstance(lessonRefs, list) or len(lessonRefs) != 1:
            failures.append(
                f"{assetId}: instructional asset must have exactly one reviewed lessonRef"
            )
            continue
        lessonRef = lessonRefs[0]
        lesson = lessonsByRef.get(lessonRef)
        if lesson is None:
            failures.append(f"{assetId}: unknown lessonRef {lessonRef}")
            continue
        if anchorsByAsset.get(assetId) != [lessonRef]:
            failures.append(
                f"{assetId}: manifest/YAML anchor mismatch "
                f"{anchorsByAsset.get(assetId, [])} != {[lessonRef]}"
            )
        # 원장과 같은 규칙(LF 정규화)으로 계산한다. 원본 바이트를 그대로 해시하면
        # 같은 커밋인데도 Windows 작업 트리와 Linux CI 가 다른 값을 낸다.
        expectedHash = f"sha256-{lessonContentHash(lesson['path'])}"
        if asset.get("provenance", {}).get("lessonContentHash") != expectedHash:
            failures.append(f"{assetId}: lessonContentHash drifted for {lessonRef}")
        for field in ("alt", "caption", "learningQuestion", "decisionShown"):
            value = learning.get(field)
            if not isinstance(value, str) or not value.strip():
                failures.append(f"{assetId}: learning.{field} is empty")
        if "lesson-context" not in asset.get("rendering", {}).get("proofUsage", []):
            failures.append(f"{assetId}: lesson-context usage is missing")

    orphanAnchors = sorted(set(anchorsByAsset) - set(instructionalAssets))
    if orphanAnchors:
        failures.append(f"orphan instructional anchors: {orphanAnchors}")

    payload = {
        "gate": "instructional-visual-purpose",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "gitHead": gitHead(),
        "startedAt": startedAt,
        "completedAt": datetime.now(UTC).isoformat(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "assetCount": len(instructionalAssets),
        "anchorCount": sum(len(refs) for refs in anchorsByAsset.values()),
        "assets": {
            assetId: {
                "lessonRefs": asset["learning"]["lessonRefs"],
                "anchors": anchorsByAsset.get(assetId, []),
                "lessonContentHash": asset["provenance"].get("lessonContentHash"),
            }
            for assetId, asset in sorted(instructionalAssets.items())
        },
        "failures": failures,
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    if failures:
        for failure in failures:
            print(f"FAIL: {failure}", file=sys.stderr)
        return 1
    print(
        "ok: instructional visual purpose "
        f"({len(instructionalAssets)} assets, {payload['anchorCount']} exact lesson anchors)"
    )
    return 0


def curriculumLessons(failures: list[str]) -> dict[str, dict[str, Any]]:
    lessons: dict[str, dict[str, Any]] = {}
    for path in sorted(CURRICULA_ROOT.glob("**/*.yaml")):
        if path.name == "schema.yaml":
            continue
        try:
            payload = yaml.safe_load(path.read_text(encoding="utf-8"))
        except yaml.YAMLError as error:
            failures.append(f"{path.relative_to(ROOT).as_posix()}: invalid YAML: {error}")
            continue
        if not isinstance(payload, dict):
            continue
        category = payload.get("meta", {}).get("category")
        if not isinstance(category, str) or not category:
            continue
        lessonRef = f"{category}/{path.stem}"
        if lessonRef in lessons:
            failures.append(f"duplicate canonical lessonRef: {lessonRef}")
            continue
        lessons[lessonRef] = {"path": path, "payload": payload}
    return lessons


def lessonAssetAnchors(payload: dict[str, Any]) -> list[str]:
    anchors: list[str] = []

    def walk(blocks: Any) -> None:
        if not isinstance(blocks, list):
            return
        for block in blocks:
            if not isinstance(block, dict):
                continue
            assetId = block.get("assetId")
            if block.get("type") == "image" and isinstance(assetId, str) and assetId:
                anchors.append(assetId)
            walk(block.get("blocks"))

    for section in payload.get("sections", []):
        if isinstance(section, dict):
            walk(section.get("blocks"))
    return anchors


def gitHead() -> str:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout.strip()


if __name__ == "__main__":
    raise SystemExit(main())
