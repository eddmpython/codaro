from __future__ import annotations

from datetime import UTC, datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from typing import Any

import yaml

from codaro.curriculum.efficacyStage import EfficacyStageInvalid, resolveEfficacyStage, resolvePathPortfolio


ROOT = Path(__file__).resolve().parents[2]
FIXTURE_PATH = ROOT / "tests/product/fixtures/releaseResearch/missing-research-owner.yml"
REPORT_PATH = ROOT / "output/test-runner/release-research-operations/release-research-operations-report.json"
PAGES_WORKFLOW_PATH = ROOT / ".github/workflows/pages.yml"
LANDING_HOME_PATH = ROOT / "landing/src/pages/home.jsx"
LANDING_LEARN_PATH = ROOT / "landing/src/pages/learn.jsx"
EDITOR_INDEX_PATH = ROOT / "editor/index.html"
SERVICE_WORKER_PATH = ROOT / "editor/public/serviceWorker.js"
CONTENT_HASH = "sha256-" + ("a" * 64)
NPM_COMMAND = "npm.cmd" if os.name == "nt" else "npm"


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def loadMapping(path: Path) -> dict[str, Any]:
    payload = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError(f"YAML root must be a mapping: {path.relative_to(ROOT).as_posix()}")
    return payload


def rejectMissingOwnerFixture() -> dict[str, Any]:
    fixture = loadMapping(FIXTURE_PATH)
    candidate = fixture.get("candidate")
    expectedFailure = fixture.get("expectedFailure")
    if not isinstance(candidate, dict) or not isinstance(expectedFailure, dict):
        raise ValueError("release research negative fixture is incomplete")
    try:
        resolveEfficacyStage(candidate, currentContentHash=CONTENT_HASH)
    except EfficacyStageInvalid as error:
        if error.code != expectedFailure.get("code"):
            raise ValueError(f"negative fixture produced {error.code}, expected {expectedFailure.get('code')}") from error
        return {
            "expectedFailure": error.code,
            "path": FIXTURE_PATH.relative_to(ROOT).as_posix(),
            "rejected": True,
        }
    raise ValueError("missing research owner fixture unexpectedly passed")


def verifyEfficacyStateMachine() -> dict[str, Any]:
    passed = {
        "pathId": "passed-path",
        "targetStage": "E0",
        "contentHash": CONTENT_HASH,
        "curriculumOwner": "curriculum-owner",
        "learningQaReviewer": "learning-qa",
        "contentApproved": True,
    }
    failed = {**passed, "pathId": "failed-path", "contentApproved": False}
    portfolio = resolvePathPortfolio(
        [passed, failed],
        currentContentHashes={"passed-path": CONTENT_HASH, "failed-path": CONTENT_HASH},
    )
    if portfolio.get("passed-path", {}).get("passed") is not True:
        raise ValueError("valid E0 path did not pass")
    if portfolio.get("failed-path", {}).get("code") != "content-review-required":
        raise ValueError("failed path was hidden by portfolio aggregation")
    stale = {**passed, "pathId": "stale-path"}
    try:
        resolveEfficacyStage(stale, currentContentHash="sha256-" + ("b" * 64))
    except EfficacyStageInvalid as error:
        if error.code != "stale-content-evidence":
            raise
    else:
        raise ValueError("stale content evidence unexpectedly passed")
    return {
        "aggregatePromotionForbidden": True,
        "allowedClaims": ["contentApproved", "usable", "learningSignal", "effectVerified"],
        "missingOwnerRejected": True,
        "staleContentRejected": True,
    }


def runBuild(command: tuple[str, ...], *, cwd: Path, environment: dict[str, str] | None = None) -> None:
    result = subprocess.run(
        command,
        cwd=cwd,
        env=environment,
        capture_output=True,
        text=True,
        timeout=600,
    )
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()[-1_500:]
        raise ValueError(f"build failed in {cwd.relative_to(ROOT).as_posix()}: {detail}")


def treeDigest(root: Path) -> tuple[int, str]:
    digest = hashlib.sha256()
    files = sorted(path for path in root.rglob("*") if path.is_file())
    for path in files:
        relative = path.relative_to(root).as_posix().encode("utf-8")
        digest.update(len(relative).to_bytes(4, "big"))
        digest.update(relative)
        content = path.read_bytes()
        digest.update(len(content).to_bytes(8, "big"))
        digest.update(content)
    return len(files), digest.hexdigest()


def verifyCompatibilityBuild() -> dict[str, Any]:
    workflow = PAGES_WORKFLOW_PATH.read_text(encoding="utf-8")
    home = LANDING_HOME_PATH.read_text(encoding="utf-8")
    learn = LANDING_LEARN_PATH.read_text(encoding="utf-8")
    index = EDITOR_INDEX_PATH.read_text(encoding="utf-8")
    serviceWorker = SERVICE_WORKER_PATH.read_text(encoding="utf-8")
    requiredContracts = (
        (workflow, "CODARO_WEB_BASE: codaro/run"),
        (workflow, "CODARO_WEB_OUT: ../landing/static/run"),
        (workflow, "CODARO_WEB_BASE: codaro/app"),
        (workflow, "CODARO_WEB_OUT: ../landing/static/app"),
        (home, 'appPath("/run/'),
        (learn, 'brand.appPath("/run/")'),
        (index, 'scope: serviceWorkerBase'),
        (serviceWorker, 'const SCOPE_URL = new URL(self.registration.scope)'),
        (serviceWorker, 'codaro-shell-v3:${SCOPE_PATH}'),
        (serviceWorker, 'codaro-runtime-v3:${SCOPE_PATH}'),
    )
    missing = [token for source, token in requiredContracts if token not in source]
    if missing:
        raise ValueError("compatibility build contract is incomplete: " + ", ".join(missing))

    for base in ("run", "app"):
        environment = os.environ.copy()
        environment["CODARO_WEB_BASE"] = f"codaro/{base}"
        environment["CODARO_WEB_OUT"] = f"../landing/static/{base}"
        runBuild((NPM_COMMAND, "run", "build"), cwd=ROOT / "editor", environment=environment)
    runBuild((NPM_COMMAND, "run", "build"), cwd=ROOT / "landing")

    facts: dict[str, Any] = {}
    for base in ("run", "app"):
        tree = ROOT / "landing/build" / base
        indexPath = tree / "index.html"
        workerPath = tree / "serviceWorker.js"
        pyprocManifestPath = tree / "pyproc-assets.json"
        if not indexPath.is_file() or not workerPath.is_file() or not pyprocManifestPath.is_file():
            raise ValueError(f"built /{base}/ tree is incomplete")
        builtIndex = indexPath.read_text(encoding="utf-8")
        builtWorker = workerPath.read_text(encoding="utf-8")
        manifest = json.loads(pyprocManifestPath.read_text(encoding="utf-8"))
        expectedBase = f"/codaro/{base}/"
        entrypoints = manifest.get("entrypoints")
        if expectedBase not in builtIndex or "SCOPE_PATH" not in builtWorker:
            raise ValueError(f"built /{base}/ tree does not own its subpath scope")
        if not isinstance(entrypoints, list) or not entrypoints or any(
            not str(entry.get("url") or "").startswith(expectedBase)
            for entry in entrypoints
            if isinstance(entry, dict)
        ):
            raise ValueError(f"built /{base}/ pyproc entrypoints use the wrong base")
        fileCount, sha256 = treeDigest(tree)
        facts[base] = {
            "fileCount": fileCount,
            "pyprocEntrypoints": len(entrypoints),
            "sha256": sha256,
        }
    if facts["run"]["sha256"] == facts["app"]["sha256"]:
        raise ValueError("primary and compatibility trees unexpectedly have the same path-bound bytes")
    return {
        "appCompatibilityTree": facts["app"],
        "outputCollisionCount": 0,
        "primaryRunTree": facts["run"],
        "scopeIsolatedCaches": True,
    }


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    failures: list[str] = []
    facts: dict[str, Any] = {}
    try:
        facts["negativeFixture"] = rejectMissingOwnerFixture()
        facts["efficacy"] = verifyEfficacyStateMachine()
        facts["compatibility"] = verifyCompatibilityBuild()
    except (OSError, ValueError, subprocess.SubprocessError, yaml.YAMLError) as error:
        failures.append(str(error))
    completionBlockers = [
        "deployed C0 app archive URL, hash, and crawl receipt are absent",
        "two-release C2 compatibility tombstone and 28-day C3 telemetry are absent",
        "real research and privacy owners are unassigned",
        "E1, E2, and E3 participant reports are absent",
        "independent release and research-operations review is absent",
    ]
    payload = {
        "schemaVersion": 1,
        "audit": "release-research-operations",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "machineEligible": not failures,
        "completionEligible": False,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "facts": facts,
        "completionBlockers": completionBlockers,
        "failures": failures,
        "reportPath": REPORT_PATH.relative_to(ROOT).as_posix(),
    }
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if failures:
        print("FAIL: release research operations audit failed", file=sys.stderr)
        for failure in failures:
            print(f"  - {failure}", file=sys.stderr)
        return 1
    print("ok: /run + /app composition and efficacy state machine verified (completionEligible=false)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
