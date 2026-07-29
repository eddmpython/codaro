from __future__ import annotations

from contextlib import contextmanager
from datetime import UTC, datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
from typing import Any

import yaml

from codaro.curriculum.efficacyStage import (
    EfficacyStageInvalid,
    productReleaseAggregate,
    resolveEfficacyStage,
    resolvePathPortfolio,
)
from codaro.releaseResearch import (  # noqa: E402
    COMPATIBILITY_TOMBSTONES,
    CompatibilityReleaseInvalid,
    telemetryPolicyHash,
    verifyCompatibilityRelease,
)


ROOT = Path(__file__).resolve().parents[2]
FIXTURE_PATH = ROOT / "tests/product/fixtures/releaseResearch/missing-research-owner.yml"
REPORT_PATH = ROOT / "output/test-runner/release-research-operations/release-research-operations-report.json"
PAGES_WORKFLOW_PATH = ROOT / ".github/workflows/pages.yml"
LANDING_HOME_PATH = ROOT / "landing/src/pages/home.jsx"
LANDING_LEARN_PATH = ROOT / "landing/src/pages/learn.jsx"
EDITOR_INDEX_PATH = ROOT / "editor/index.html"
SERVICE_WORKER_PATH = ROOT / "editor/public/serviceWorker.js"
C0_CONTRACT_PATH = ROOT / "contracts/webCompatibilityC0.json"
CONTENT_HASH = "sha256-" + ("a" * 64)
SECOND_HASH = "sha256-" + ("b" * 64)
THIRD_HASH = "sha256-" + ("c" * 64)
NPM_COMMAND = "npm.cmd" if os.name == "nt" else "npm"


def currentGitHead() -> str:
    result = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=30,
    )
    gitHead = result.stdout.strip()
    if len(gitHead) not in {40, 64}:
        raise ValueError("current Git head is invalid")
    return gitHead


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
    aggregate = productReleaseAggregate(
        [passed, failed],
        currentContentHashes={
            "passed-path": CONTENT_HASH,
            "failed-path": CONTENT_HASH,
        },
        shellReleaseEligible=True,
    )
    if (
        aggregate["shellReleaseEligible"] is not True
        or aggregate["allPathsEffectVerified"] is not False
        or aggregate["failedPathIds"] != ["failed-path"]
    ):
        raise ValueError("shell release and path efficacy aggregation were coupled")
    return {
        "aggregatePromotionForbidden": True,
        "allowedClaims": ["contentApproved", "usable", "learningSignal", "effectVerified"],
        "missingOwnerRejected": True,
        "shellReleaseSeparated": True,
        "staleContentRejected": True,
    }


def compatibilityCandidate() -> dict[str, Any]:
    policy: dict[str, Any] = {
        "sealedAt": "2026-01-01T00:00:00Z",
        "minimumWindowDays": 28,
        "minimumEligibleSessions": 100,
        "maximumLegacyRequestRate": 0.01,
    }
    policy["sha256"] = telemetryPolicyHash(policy)
    return {
        "milestone": "C3",
        "releaseArchiveUrl": "https://example.invalid/releases/c0.zip",
        "releaseArchiveSha256": CONTENT_HASH,
        "deployedTreeSha256": SECOND_HASH,
        "deployedCrawlSha256": SECOND_HASH,
        "stableReleaseIds": ["stable-1", "stable-2"],
        "appTreeSha256": SECOND_HASH,
        "runTreeSha256": THIRD_HASH,
        "outputCollisionCount": 0,
        "serviceWorkerScopes": ["/codaro/app/", "/codaro/run/"],
        "directReloadPassed": True,
        "deepReloadPassed": True,
        "coldOnlinePythonPassed": True,
        "rollbackArchiveSha256": CONTENT_HASH,
        "scopeAuditSha256": SECOND_HASH,
        "compatibilityPagePassed": True,
        "queryRoundTripPassed": True,
        "hashRoundTripPassed": True,
        "backForwardPassed": True,
        "ownedCacheOnly": True,
        "exactUnregisterPassed": True,
        "tombstonePaths": list(COMPATIBILITY_TOMBSTONES),
        "unregisterReleaseMarker": "stable-1-to-stable-2",
        "navigationAuditSha256": CONTENT_HASH,
        "ownedCacheAuditSha256": SECOND_HASH,
        "telemetryPolicy": policy,
        "telemetryReport": {
            "windowStartedAt": "2026-02-01T00:00:00Z",
            "windowEndedAt": "2026-03-01T00:00:00Z",
            "eligibleSessions": 200,
            "legacyRequests": 1,
            "reportSha256": THIRD_HASH,
        },
        "retirementDiffSha256": CONTENT_HASH,
        "previousUrlSmokePassed": True,
    }


def verifyCompatibilityStateMachine() -> dict[str, Any]:
    candidate = compatibilityCandidate()
    result = verifyCompatibilityRelease(candidate)
    if result["milestone"] != "C3" or result["appAssetsRetired"] is not True:
        raise ValueError("valid C3 compatibility evidence did not pass")
    shortWindow = {
        **candidate,
        "telemetryReport": {
            **candidate["telemetryReport"],
            "windowEndedAt": "2026-02-14T00:00:00Z",
        },
    }
    try:
        verifyCompatibilityRelease(shortWindow)
    except CompatibilityReleaseInvalid as error:
        if error.code != "telemetry-window-too-short":
            raise
    else:
        raise ValueError("short C3 telemetry window unexpectedly passed")
    return {
        "milestones": ["C0", "C1", "C2", "C3"],
        "cumulativeEvidenceRequired": True,
        "c3ShortWindowRejected": True,
        "tombstonePaths": list(COMPATIBILITY_TOMBSTONES),
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
        try:
            label = cwd.relative_to(ROOT).as_posix()
        except ValueError:
            label = str(cwd)
        raise ValueError(f"build failed in {label}: {detail}")


def treeDigest(root: Path) -> tuple[int, str]:
    digest = hashlib.sha256()
    files = sorted(
        (path for path in root.rglob("*") if path.is_file()),
        key=lambda path: path.relative_to(root).as_posix().encode("utf-8"),
    )
    for path in files:
        relative = path.relative_to(root).as_posix().encode("utf-8")
        digest.update(len(relative).to_bytes(4, "big"))
        digest.update(relative)
        content = path.read_bytes()
        digest.update(len(content).to_bytes(8, "big"))
        digest.update(content)
    return len(files), digest.hexdigest()


@contextmanager
def preserveDirectories(
    paths: tuple[Path, ...],
    backupRoot: Path,
    *,
    allowedRoot: Path = ROOT,
):
    resolvedAllowed = allowedRoot.resolve()
    snapshots: list[tuple[Path, Path, bool]] = []
    backupRoot.mkdir(parents=True, exist_ok=False)
    for index, path in enumerate(paths):
        resolved = path.resolve()
        if not resolved.is_relative_to(resolvedAllowed):
            raise ValueError(f"refusing to preserve directory outside allowed root: {resolved}")
        backup = backupRoot / str(index)
        existed = path.is_dir()
        if existed:
            shutil.copytree(path, backup)
        snapshots.append((path, backup, existed))
    try:
        yield
    finally:
        for path, backup, existed in snapshots:
            if path.exists():
                if not path.is_dir():
                    raise ValueError(f"preserved directory was replaced by a file: {path}")
                shutil.rmtree(path)
            if existed:
                shutil.copytree(backup, path)


def buildPinnedC0(contract: dict[str, Any], root: Path) -> Path:
    suppliedTree = os.environ.get("CODARO_C0_TREE")
    if suppliedTree:
        return Path(suppliedTree).resolve()
    source = root / "source"
    output = root / "app"
    runBuild(
        (
            "git",
            "-c",
            "core.autocrlf=false",
            "-c",
            "core.longpaths=true",
            "clone",
            "--no-local",
            "--no-checkout",
            str(ROOT),
            str(source),
        ),
        cwd=ROOT,
    )
    runBuild(
        (
            "git",
            "-c",
            "core.autocrlf=false",
            "-c",
            "core.longpaths=true",
            "checkout",
            "--detach",
            contract["source"]["commit"],
        ),
        cwd=source,
    )
    runBuild((NPM_COMMAND, "ci", "--no-audit", "--no-fund"), cwd=source / "editor")
    environment = os.environ.copy()
    environment["CODARO_WEB_BASE"] = "codaro/app"
    environment["CODARO_WEB_OUT"] = str(output)
    runBuild((NPM_COMMAND, "run", "build"), cwd=source / "editor", environment=environment)
    return output


def verifyC0Tree(tree: Path, contract: dict[str, Any]) -> dict[str, Any]:
    indexPath = tree / "index.html"
    workerPath = tree / "serviceWorker.js"
    pyprocManifestPath = tree / "pyproc-assets.json"
    if not indexPath.is_file() or not workerPath.is_file() or not pyprocManifestPath.is_file():
        raise ValueError("pinned C0 /app/ tree is incomplete")
    builtIndex = indexPath.read_text(encoding="utf-8")
    builtWorker = workerPath.read_text(encoding="utf-8")
    manifest = json.loads(pyprocManifestPath.read_text(encoding="utf-8"))
    expectedBase = contract["source"]["basePath"]
    entrypoints = manifest.get("entrypoints")
    if expectedBase not in builtIndex or "SCOPE_PATH" not in builtWorker:
        raise ValueError("pinned C0 /app/ tree lost its subpath scope")
    if not isinstance(entrypoints, list) or not entrypoints or any(
        not str(entry.get("url") or "").startswith(expectedBase)
        for entry in entrypoints
        if isinstance(entry, dict)
    ):
        raise ValueError("pinned C0 pyproc entrypoints use the wrong base")
    fileCount, sha256 = treeDigest(tree)
    byteCount = sum(path.stat().st_size for path in tree.rglob("*") if path.is_file())
    facts = {"byteCount": byteCount, "fileCount": fileCount, "sha256": sha256}
    expected = {key: contract["tree"][key] for key in facts}
    if facts != expected:
        raise ValueError(f"pinned C0 identity mismatch: actual={facts} expected={expected}")
    return {**facts, "pyprocEntrypoints": len(entrypoints)}


def verifyCompatibilityBuild() -> dict[str, Any]:
    workflow = PAGES_WORKFLOW_PATH.read_text(encoding="utf-8")
    home = LANDING_HOME_PATH.read_text(encoding="utf-8")
    learn = LANDING_LEARN_PATH.read_text(encoding="utf-8")
    index = EDITOR_INDEX_PATH.read_text(encoding="utf-8")
    serviceWorker = SERVICE_WORKER_PATH.read_text(encoding="utf-8")
    contract = json.loads(C0_CONTRACT_PATH.read_text(encoding="utf-8"))
    requiredContracts = (
        (workflow, "build-c0-compatibility:"),
        (workflow, "contracts/webCompatibilityC0.json"),
        (workflow, 'git config core.autocrlf false'),
        (workflow, 'git checkout --detach "${{ steps.c0.outputs.source_commit }}"'),
        (workflow, "name: web-compatibility-c0"),
        (workflow, "Download pinned C0 app tree"),
        (workflow, "--deployed-url"),
        (workflow, "CODARO_WEB_BASE: codaro/run"),
        (workflow, "CODARO_WEB_OUT: ../landing/static/run"),
        (workflow, "CODARO_WEB_BASE: codaro/app"),
        (workflow, "CODARO_WEB_OUT: ../landing/static/app"),
        (home, "const curriculumUrl = firstLessonHref()"),
        (learn, "const href = brand.appPath(`${lesson.route.replace"),
        (index, 'scope: serviceWorkerBase'),
        (serviceWorker, 'const SCOPE_URL = new URL(self.registration.scope)'),
        (serviceWorker, 'codaro-shell-v3:${SCOPE_PATH}'),
        (serviceWorker, 'codaro-runtime-v3:${SCOPE_PATH}'),
    )
    missing = [token for source, token in requiredContracts if token not in source]
    if missing:
        raise ValueError("compatibility build contract is incomplete: " + ", ".join(missing))

    sourceCommit = str(contract.get("source", {}).get("commit", ""))
    if len(sourceCommit) != 40:
        raise ValueError("C0 source commit is invalid")
    commitCheck = subprocess.run(
        ("git", "cat-file", "-e", f"{sourceCommit}^{{commit}}"),
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    if commitCheck.returncode != 0:
        raise ValueError(f"C0 source commit is unavailable: {sourceCommit}")

    with tempfile.TemporaryDirectory(prefix="codaro-c0-") as temporary:
        temporaryRoot = Path(temporary)
        c0Tree = buildPinnedC0(contract, temporaryRoot / "c0")
        appStaticTree = ROOT / "landing/static/app"
        runStaticTree = ROOT / "landing/static/run"
        with preserveDirectories(
            (appStaticTree, runStaticTree),
            temporaryRoot / "static-backup",
        ):
            environment = os.environ.copy()
            environment["CODARO_WEB_BASE"] = "codaro/run"
            environment["CODARO_WEB_OUT"] = "../landing/static/run"
            runBuild((NPM_COMMAND, "run", "build"), cwd=ROOT / "editor", environment=environment)
            if appStaticTree.is_dir():
                shutil.rmtree(appStaticTree)
            shutil.copytree(c0Tree, appStaticTree)
            runBuild((NPM_COMMAND, "run", "build"), cwd=ROOT / "landing")
            appFacts = verifyC0Tree(c0Tree, contract)

            runTree = ROOT / "landing/build/run"
            appTree = ROOT / "landing/build/app"
            if not runTree.is_dir() or not appTree.is_dir():
                raise ValueError("fresh site composition did not contain both /run/ and /app/")
            runFileCount, runSha256 = treeDigest(runTree)
            composedAppFacts = verifyC0Tree(appTree, contract)
            if composedAppFacts != appFacts:
                raise ValueError("Landing composition changed the pinned C0 tree")
            if runSha256 == appFacts["sha256"]:
                raise ValueError("current /run/ unexpectedly equals pinned C0 /app/")
    return {
        "appCompatibilityTree": appFacts,
        "c0SourceCommit": sourceCommit,
        "releaseArchiveStatus": contract["releaseArchive"]["status"],
        "outputCollisionCount": 0,
        "primaryRunTree": {"fileCount": runFileCount, "sha256": runSha256},
        "scopeIsolatedCaches": True,
    }


def main() -> int:
    startedAt = utcTimestamp()
    started = time.monotonic()
    gitHead = currentGitHead()
    failures: list[str] = []
    facts: dict[str, Any] = {}
    try:
        facts["negativeFixture"] = rejectMissingOwnerFixture()
        facts["efficacy"] = verifyEfficacyStateMachine()
        facts["compatibilityStateMachine"] = verifyCompatibilityStateMachine()
        facts["compatibility"] = verifyCompatibilityBuild()
        if currentGitHead() != gitHead:
            raise ValueError("Git head changed while release research operations were running")
    except (OSError, ValueError, subprocess.SubprocessError, yaml.YAMLError) as error:
        failures.append(str(error))
    completionBlockers = [
        "formal C0 release asset URL and archive SHA-256 require an explicit release",
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
        "gitHead": gitHead,
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
