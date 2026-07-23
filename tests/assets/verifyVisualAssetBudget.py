from __future__ import annotations

from datetime import UTC, datetime
import json
from pathlib import Path
import subprocess
import sys
import time


ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = ROOT / "assets" / "brand" / "visuals" / "generated" / "manifest.json"
REPORT_PATH = ROOT / "output" / "test-runner" / "visual-assets" / "visual-assets-report.json"
HERO_BUDGET = 240 * 1024
PRODUCT_BUDGET = 180 * 1024


def main() -> int:
    startedAt = datetime.now(UTC).isoformat()
    started = time.monotonic()
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    failures: list[str] = []
    assets: list[dict[str, object]] = []
    for asset in manifest["assets"]:
        budget = HERO_BUDGET if "landing-hero-background" in asset["rendering"]["proofUsage"] else PRODUCT_BUDGET
        largest = max(asset["outputs"], key=lambda output: output["byteLength"])
        if largest["byteLength"] > budget:
            failures.append(
                f"{asset['id']}: {largest['byteLength']} bytes exceeds {budget} byte budget"
            )
        assets.append(
            {
                "id": asset["id"],
                "budgetBytes": budget,
                "largestBytes": largest["byteLength"],
                "largestFormat": largest["format"],
                "largestWidth": largest["width"],
                "outputCount": len(asset["outputs"]),
            }
        )

    payload = {
        "gate": "visual-assets",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "gitHead": subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=ROOT,
            check=True,
            capture_output=True,
            encoding="utf-8",
        ).stdout.strip(),
        "startedAt": startedAt,
        "completedAt": datetime.now(UTC).isoformat(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "sourceManifestHash": manifest["sourceManifestHash"],
        "assetCount": len(assets),
        "assets": assets,
        "failures": failures,
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: visual asset budget exceeded", file=sys.stderr)
        return 1
    print("ok: visual asset budgets verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
