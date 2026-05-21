from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Evidence:
    evidenceId: str
    relPath: str
    needles: tuple[str, ...]

    def evaluate(self) -> dict[str, Any]:
        path = ROOT / self.relPath
        if not path.exists():
            return {
                "id": self.evidenceId,
                "path": self.relPath,
                "passed": False,
                "missing": [f"missing file {self.relPath}"],
            }
        text = path.read_text(encoding="utf-8")
        missing = [needle for needle in self.needles if needle not in text]
        return {
            "id": self.evidenceId,
            "path": self.relPath,
            "passed": not missing,
            "missing": missing,
        }


EVIDENCE = (
    Evidence(
        "launcher-doctor-diagnostics",
        "launcher/codaro-launcher/src/main.rs",
        (
            "Command::Doctor",
            "fn run_doctor",
            "activePythonExecutable",
            "lastKnownGoodRelease",
            "crashState",
            "rollbackMarker",
        ),
    ),
    Evidence(
        "launcher-health-checked-startup",
        "launcher/codaro-launcher/src/main.rs",
        (
            "BackendLaunchConfig::from_active_release",
            "wait_for_backend_ready",
            "HEALTH_TIMEOUT",
            "Backend failed to become healthy.",
            "launch_active_backend_rolls_back_to_last_known_good_on_health_failure",
        ),
    ),
    Evidence(
        "backend-health-probe",
        "launcher/codaro-launcher/src/backend.rs",
        (
            "pub struct BackendLaunchConfig",
            "pub fn wait_for_backend_ready",
            "health_url",
            "wait_for_backend_ready_fails_when_process_exits_early",
            "health_check_succeeds_when_server_replies",
        ),
    ),
    Evidence(
        "launcher-state-recovery-files",
        "launcher/codaro-launcher/src/state.rs",
        (
            "last-known-good-release.json",
            "rollback-marker.json",
            "crash-state.json",
            "health check failed",
        ),
    ),
    Evidence(
        "launcher-packaging-ssot",
        "launcher/PACKAGING.md",
        (
            "exact wheel",
            "sha256",
            "제품 품질 검증용 내부 빌드",
            "launcher-managed bundle",
            "uv run codaro",
        ),
    ),
    Evidence(
        "launcher-product-ssot",
        "launcher/PRD.md",
        (
            "Python 없는 설치 경험",
            "last-known-good runtime",
            "backend health timeout",
            "doctor",
            "state show",
        ),
    ),
)


def main() -> int:
    results = [evidence.evaluate() for evidence in EVIDENCE]
    failures = [
        f"{result['id']} missing {missing}"
        for result in results
        for missing in result["missing"]
    ]
    payload = {
        "gate": "install-launcher-smoke",
        "passed": not failures,
        "evidenceCount": len(results),
        "results": results,
        "failures": failures,
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: install launcher smoke evidence is incomplete", file=sys.stderr)
        return 1
    print("ok: install launcher smoke verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
