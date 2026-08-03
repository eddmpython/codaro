from __future__ import annotations

from copy import deepcopy
from datetime import UTC, datetime
import importlib.util
import json
from pathlib import Path
import subprocess

import pytest


def _loadInstallerModule():
    # docs/ 트리는 패키지가 아니다. `from docs...` import는 repo 루트가 sys.path에 있을
    # 때만 우연히 동작해(python -m pytest) CI의 pytest 콘솔 스크립트 실행에서 깨진다.
    path = Path(__file__).resolve().parents[2] / "docs" / "skills" / "ops" / "tools" / "installWebView2FixedRuntime.py"
    spec = importlib.util.spec_from_file_location("installWebView2FixedRuntime", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


installer = _loadInstallerModule()
from product.webview2RuntimeLock import (
    LOCK_PATH,
    RuntimeLockError,
    loadRuntimeLock,
    runtimeInstallRoot,
    validateRuntimeLock,
)


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "webview2RuntimeLockInvalid.json"
LOCK_NOW = datetime(2026, 8, 2, tzinfo=UTC)


def testWebView2RuntimeLockAcceptsCurrentExactArtifact() -> None:
    payload = loadRuntimeLock(now=LOCK_NOW)

    assert payload["version"] == "151.0.4129.59"
    assert payload["maximumAgeDays"] == 30
    assert runtimeInstallRoot(payload).name == payload["runtimeDirectoryName"]


@pytest.mark.parametrize(
    "case",
    json.loads(FIXTURE_PATH.read_text(encoding="utf-8")),
    ids=lambda case: case["id"],
)
def testWebView2RuntimeLockRejectsInvalidReleaseBoundaries(case: dict[str, object]) -> None:
    payload = json.loads(LOCK_PATH.read_text(encoding="utf-8"))
    mutated = deepcopy(payload)
    mutated.update(case["overrides"])

    with pytest.raises(RuntimeLockError, match=str(case["message"])):
        validateRuntimeLock(mutated, now=LOCK_NOW)


def testWebView2RuntimeLockBecomesRedAfterFreshnessWindow() -> None:
    payload = json.loads(LOCK_PATH.read_text(encoding="utf-8"))

    with pytest.raises(RuntimeLockError, match="ageDays=31"):
        validateRuntimeLock(payload, now=datetime(2026, 8, 31, tzinfo=UTC))


def testFixedRuntimeReceiptIsBoundToCurrentCommit(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    work_root = tmp_path / "fixed-gate"
    download_root = work_root / "downloads"
    target = work_root / "fixed-runtime" / "runtime"
    payload = {
        "archiveFileName": "runtime.cab",
        "distributionMode": "fixed",
        "version": "151.0.4129.59",
        "architecture": "x64",
    }

    def download(_payload: dict[str, object], archive: Path) -> bool:
        archive.write_bytes(b"locked archive")
        return True

    def extract(_payload: dict[str, object], _archive: Path, destination: Path) -> None:
        destination.mkdir(parents=True)

    monkeypatch.setattr(installer, "WORK_ROOT", work_root)
    monkeypatch.setattr(installer, "DOWNLOAD_ROOT", download_root)
    monkeypatch.setattr(installer, "runtimeInstallRoot", lambda _payload: target)
    monkeypatch.setattr(installer, "downloadArchive", download)
    monkeypatch.setattr(installer, "extractArchive", extract)
    monkeypatch.setattr(
        installer,
        "verifyInstalledRuntime",
        lambda _payload: {"version": payload["version"]},
    )
    monkeypatch.setattr(installer, "grantAppContainerReadExecute", lambda _target: [])
    monkeypatch.setattr(installer, "runtimeLockSha256", lambda: "lock-sha256")
    monkeypatch.setattr(installer, "sha256File", lambda _path: "archive-sha256")
    monkeypatch.setattr(installer, "displayPath", lambda path: path.as_posix())

    receipt = installer.installRuntime(payload)
    expected_head = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=installer.ROOT,
        capture_output=True,
        text=True,
        check=True,
    ).stdout.strip()

    assert receipt["gitHead"] == expected_head
