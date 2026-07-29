from __future__ import annotations

from datetime import UTC, datetime
import hashlib
import json
from pathlib import Path
import struct
import sys
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = ROOT / "assets" / "brand" / "visuals" / "manifest.json"
REPORT_PATH = ROOT / "output" / "test-runner" / "visual-assets" / "run-capture-matrix-report.json"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
EXPECTED = {
    "runStateReady": ("ready", "web-run-ready-desktop", "", 1440, 900, "dark"),
    "runStateReadyLight": ("ready", "web-run-ready-desktop", "", 1440, 900, "light"),
    "runStateRunning": (
        "running",
        "web-run-desktop",
        "notebookStateEvidence.screenshots.running",
        1440,
        900,
        "dark",
    ),
    "runStateRunningLight": (
        "running",
        "web-run-desktop",
        "notebookStateEvidence.screenshots.running",
        1440,
        900,
        "light",
    ),
    "runStateCheckFail": (
        "check-fail",
        "web-day1-transfer-desktop",
        "checkStateEvidence.screenshots.mismatch",
        900,
        760,
        "dark",
    ),
    "runStateCheckFailLight": (
        "check-fail",
        "web-day1-transfer-desktop",
        "checkStateEvidence.screenshots.mismatch",
        900,
        760,
        "light",
    ),
    "runStateCheckPass": (
        "check-pass",
        "web-day1-transfer-tablet",
        "checkStateEvidence.screenshots.verified",
        768,
        1024,
        "dark",
    ),
    "runStateCheckPassLight": (
        "check-pass",
        "web-day1-transfer-tablet",
        "checkStateEvidence.screenshots.verified",
        768,
        1024,
        "light",
    ),
    "runStateLocalRequired": (
        "local-required",
        "web-day2-progression-desktop",
        "checkCapabilityEvidence.screenshot",
        900,
        760,
        "dark",
    ),
    "runStateLocalRequiredLight": (
        "local-required",
        "web-day2-progression-desktop",
        "checkCapabilityEvidence.screenshot",
        900,
        760,
        "light",
    ),
}


def main() -> int:
    failures: list[str] = []
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    assets = {
        str(asset.get("id")): asset
        for asset in manifest.get("assets", [])
        if isinstance(asset, dict)
    }
    state_assets = {asset_id: assets.get(asset_id) for asset_id in EXPECTED}
    actual_state_ids = {
        asset_id
        for asset_id in assets
        if asset_id.startswith("runState")
    }
    if actual_state_ids != set(EXPECTED):
        failures.append(
            f"Run state asset set drifted: {sorted(actual_state_ids)}"
        )

    facts: dict[str, Any] = {}
    for asset_id, expected in EXPECTED.items():
        state, fixture_id, evidence_path, width, height, theme = expected
        asset = state_assets.get(asset_id)
        if not isinstance(asset, dict):
            failures.append(f"{asset_id}: manifest entry is missing")
            continue
        capture = asset.get("capture", {})
        provenance = asset.get("provenance", {})
        rendering = asset.get("rendering", {})
        viewport = capture.get("viewport")
        if asset.get("kind") != "productScreenshot" or asset.get("sourceType") != "playwrightCapture":
            failures.append(f"{asset_id}: source contract drifted")
        if provenance.get("fixtureId") != fixture_id:
            failures.append(f"{asset_id}: fixture drifted")
        if str(capture.get("evidencePath") or "") != evidence_path:
            failures.append(f"{asset_id}: evidence path drifted")
        if viewport != {"width": width, "height": height}:
            failures.append(f"{asset_id}: viewport drifted")
        if capture.get("theme") != theme:
            failures.append(f"{asset_id}: theme drifted")
        if rendering.get("width") != width or rendering.get("height") != height:
            failures.append(f"{asset_id}: rendering dimensions drifted")
        pair_id = asset.get("themePairId")
        pair = assets.get(str(pair_id))
        if (
            not isinstance(pair, dict)
            or pair.get("themePairId") != asset_id
            or pair.get("capture", {}).get("theme") == theme
        ):
            failures.append(f"{asset_id}: light/dark pair drifted")

        source_path = ROOT / str(asset.get("sourcePath", ""))
        source_hash = str(asset.get("sourceHash", ""))
        if not source_path.is_file():
            failures.append(f"{asset_id}: canonical PNG is missing")
        else:
            dimensions = png_dimensions(source_path)
            if dimensions != (width, height):
                failures.append(f"{asset_id}: PNG dimensions drifted: {dimensions}")
            actual_hash = f"sha256-{hashlib.sha256(source_path.read_bytes()).hexdigest()}"
            if source_hash != actual_hash:
                failures.append(f"{asset_id}: source hash drifted")
        facts[asset_id] = {
            "state": state,
            "fixtureId": fixture_id,
            "evidencePath": evidence_path,
            "theme": theme,
            "viewport": {"width": width, "height": height},
            "sourcePath": asset.get("sourcePath"),
        }

    web_widths = {
        asset.get("capture", {}).get("viewport", {}).get("width")
        for asset in assets.values()
        if asset.get("kind") == "productScreenshot"
        and str(asset.get("provenance", {}).get("fixtureId", "")).startswith("web-")
    }
    required_widths = {390, 768, 1440}
    if not required_widths.issubset(web_widths):
        failures.append(
            f"Run viewport coverage drifted: expected {sorted(required_widths)}, got {sorted(web_widths)}"
        )

    payload = {
        "gate": "run-capture-matrix",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "completedAt": datetime.now(UTC).isoformat(),
        "stateCount": 5,
        "assetCount": len(facts),
        "states": ["ready", "running", "check-fail", "check-pass", "local-required"],
        "viewportWidths": sorted(required_widths),
        "assets": facts,
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
    print("ok: Run capture matrix (5 states, 3 widths, light/dark)")
    return 0


def png_dimensions(path: Path) -> tuple[int, int]:
    header = path.read_bytes()[:24]
    if len(header) != 24 or header[:8] != PNG_SIGNATURE or header[12:16] != b"IHDR":
        raise ValueError(f"invalid PNG: {path}")
    return struct.unpack(">II", header[16:24])


if __name__ == "__main__":
    raise SystemExit(main())
