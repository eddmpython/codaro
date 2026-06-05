from __future__ import annotations

from datetime import UTC, datetime
import json
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
SMOKE_WORK_ROOT = ROOT / "output" / "test-runner" / "install-launcher-smoke"
LAUNCHER_ROOT = SMOKE_WORK_ROOT / "launcher-cli-root"
CARGO_TARGET_DIR = SMOKE_WORK_ROOT / "cargo-target"
LAUNCHER_MANIFEST = ROOT / "launcher" / "codaro-launcher" / "Cargo.toml"
INSTALL_LAUNCHER_REPORT_PATH = SMOKE_WORK_ROOT / "install-launcher-report.json"


class VerificationError(RuntimeError):
    pass


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
            "resolve_editor_root",
            "CODARO_WEB_BUILD_ROOT",
            "launch_config_uses_bundled_editor_when_archive_editor_is_missing",
            "pub fn wait_for_backend_ready",
            "health_url",
            "wait_for_backend_ready_fails_when_process_exits_early",
            "health_check_succeeds_when_server_replies",
        ),
    ),
    Evidence(
        "launcher-editor-backend-wheel-manifest",
        "launcher/codaro-launcher/src/manifest.rs",
        (
            "EditorArtifact",
            "backendWheel",
            "is_backend_wheel_source",
            "manifest_validation_accepts_backend_wheel_editor_source",
        ),
    ),
    Evidence(
        "launcher-editor-backend-wheel-stage",
        "launcher/codaro-launcher/src/provision.rs",
        (
            "backendWheel:codaro/webBuild",
            "backend_wheel_editor_root",
            "verify_editor_build_root",
            "stage_release_can_use_editor_build_bundled_in_backend_wheel",
        ),
    ),
    Evidence(
        "packaged-editor-wheel-publish-gate",
        ".github/workflows/product-release.yml",
        (
            "Verify wheel includes editor frontend",
            "codaro/webBuild/index.html",
            "codaro/webBuild/_app/",
            "Stage base curriculum into package",
            "codaro/curricula/python/__init__.py",
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
            "editor.source",
            "backendWheel",
            "codaro/webBuild",
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
            "backendWheel",
            "codaro/webBuild",
            "doctor",
            "state show",
        ),
    ),
)


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    results = [evidence.evaluate() for evidence in EVIDENCE]
    try:
        results.append(verifyLauncherCliSmoke())
    except VerificationError as exc:
        results.append({
            "id": "launcher-cli-smoke",
            "path": "launcher/codaro-launcher",
            "passed": False,
            "missing": [str(exc)],
        })
    failures = [
        f"{result['id']} missing {missing}"
        for result in results
        for missing in result["missing"]
    ]
    payload = {
        "gate": "install-launcher-smoke",
        "passed": not failures,
        "status": "passed" if not failures else "failed",
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "gitHead": currentGitHead(),
        "reportPath": reportDisplayPath(INSTALL_LAUNCHER_REPORT_PATH),
        "evidenceCount": len(results),
        "summary": launcherSmokeSummary(results),
        "results": results,
        "failures": failures,
    }
    writeInstallLauncherReport(payload)
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: install launcher smoke evidence is incomplete", file=sys.stderr)
        return 1
    print("ok: install launcher smoke verified")
    return 0


def verifyLauncherCliSmoke() -> dict[str, Any]:
    resetLauncherRoot()
    doctor = runLauncherJson("doctor")
    state = runLauncherJson("state", "show")

    expectedRoot = str(LAUNCHER_ROOT)
    requiredDoctorKeys = {
        "appRoot",
        "launcherVersion",
        "runtimeDir",
        "sharedPythonExecutableHint",
        "installsDir",
        "downloadsDir",
        "logsDir",
        "stateDir",
        "activeRelease",
        "lastKnownGoodRelease",
        "crashState",
        "rollbackMarker",
        "updateConfig",
    }
    missingKeys = sorted(requiredDoctorKeys - set(doctor))
    if missingKeys:
        raise VerificationError("doctor JSON missing keys: " + ", ".join(missingKeys))
    if normalizePath(doctor["appRoot"]) != normalizePath(expectedRoot):
        raise VerificationError(f"doctor appRoot mismatch: {doctor['appRoot']}")
    if doctor["activeRelease"] is not None:
        raise VerificationError("fresh launcher root should not have an active release")
    if doctor["lastKnownGoodRelease"] is not None:
        raise VerificationError("fresh launcher root should not have last-known-good release")
    if doctor["crashState"] is not None:
        raise VerificationError("fresh launcher root should not have crash state")
    if doctor["rollbackMarker"] is not None:
        raise VerificationError("fresh launcher root should not have rollback marker")

    updateConfig = doctor.get("updateConfig") or {}
    expectedUpdateConfig = {
        "channel": "stable",
        "autoUpdateOnLaunch": True,
        "manifestSource": None,
        "githubRepo": "eddmpython/codaro",
        "githubManifestAssetName": "release-manifest.json",
    }
    for key, expected in expectedUpdateConfig.items():
        if updateConfig.get(key) != expected:
            actual = updateConfig.get(key)
            raise VerificationError(f"doctor updateConfig.{key} expected {expected!r}, got {actual!r}")

    if state.get("updateConfig") != updateConfig:
        raise VerificationError("state show updateConfig did not match doctor output")
    for key in ("activeRelease", "lastKnownGoodRelease", "crashState", "rollbackMarker"):
        if state.get(key) is not None:
            raise VerificationError(f"fresh state show should have null {key}")

    expectedDirs = ("runtime", "installs", "downloads", "logs", "state")
    missingDirs = [name for name in expectedDirs if not (LAUNCHER_ROOT / name).is_dir()]
    if missingDirs:
        raise VerificationError("launcher layout dirs missing: " + ", ".join(missingDirs))

    return {
        "id": "launcher-cli-smoke",
        "path": "launcher/codaro-launcher",
        "passed": True,
        "missing": [],
        "evidence": {
            "commands": ["doctor", "state show"],
            "appRoot": doctor["appRoot"],
            "launcherVersion": doctor["launcherVersion"],
            "layoutDirs": list(expectedDirs),
            "updateConfig": updateConfig,
            "freshStateNulls": {
                "activeRelease": state.get("activeRelease") is None,
                "lastKnownGoodRelease": state.get("lastKnownGoodRelease") is None,
                "crashState": state.get("crashState") is None,
                "rollbackMarker": state.get("rollbackMarker") is None,
            },
        },
    }


def launcherSmokeSummary(results: list[dict[str, Any]]) -> dict[str, Any]:
    cliEvidence = next((result.get("evidence") for result in results if result.get("id") == "launcher-cli-smoke"), {})
    cliEvidence = cliEvidence if isinstance(cliEvidence, dict) else {}
    return {
        "allEvidencePassed": all(bool(result.get("passed")) for result in results),
        "evidenceIds": [str(result.get("id")) for result in results],
        "cliCommands": cliEvidence.get("commands", []),
        "layoutDirs": cliEvidence.get("layoutDirs", []),
        "freshStateNulls": cliEvidence.get("freshStateNulls", {}),
        "updateConfig": cliEvidence.get("updateConfig", {}),
    }


def writeInstallLauncherReport(payload: dict[str, Any]) -> Path:
    INSTALL_LAUNCHER_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    INSTALL_LAUNCHER_REPORT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return INSTALL_LAUNCHER_REPORT_PATH


def reportDisplayPath(reportPath: Path) -> str:
    try:
        return str(reportPath.relative_to(ROOT))
    except ValueError:
        return str(reportPath)


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def currentGitHead() -> str | None:
    try:
        result = subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=True,
        )
    except (FileNotFoundError, OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return None
    return result.stdout.strip() or None


def resetLauncherRoot() -> None:
    workRoot = SMOKE_WORK_ROOT.resolve()
    launcherRoot = LAUNCHER_ROOT.resolve()
    if workRoot not in launcherRoot.parents and workRoot != launcherRoot:
        raise VerificationError(f"unsafe launcher smoke root: {launcherRoot}")
    if LAUNCHER_ROOT.exists():
        shutil.rmtree(LAUNCHER_ROOT)
    LAUNCHER_ROOT.mkdir(parents=True, exist_ok=True)
    CARGO_TARGET_DIR.mkdir(parents=True, exist_ok=True)


def runLauncherJson(*args: str) -> dict[str, Any]:
    command = (
        "cargo",
        "run",
        "--quiet",
        "--manifest-path",
        str(LAUNCHER_MANIFEST),
        "--target-dir",
        str(CARGO_TARGET_DIR),
        "--",
        "--root",
        str(LAUNCHER_ROOT),
        *args,
    )
    result = subprocess.run(
        command,
        cwd=ROOT,
        text=True,
        capture_output=True,
        timeout=120,
        check=False,
    )
    if result.returncode != 0:
        output = result.stderr[-1200:] or result.stdout[-1200:]
        raise VerificationError(
            f"launcher {' '.join(args)} failed with {result.returncode}: {output}"
        )
    try:
        payload = json.loads(result.stdout)
    except json.JSONDecodeError as exc:
        raise VerificationError(f"launcher {' '.join(args)} did not return JSON stdout: {result.stdout[-1200:]}") from exc
    if not isinstance(payload, dict):
        raise VerificationError(f"launcher {' '.join(args)} returned non-object JSON")
    return payload


def normalizePath(value: Any) -> str:
    return str(Path(str(value))).replace("/", "\\").rstrip("\\")


if __name__ == "__main__":
    raise SystemExit(main())
