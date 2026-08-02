from __future__ import annotations

from datetime import UTC, datetime
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[4]
PRODUCT_TEST_ROOT = ROOT / "tests" / "product"
if str(PRODUCT_TEST_ROOT) not in sys.path:
    sys.path.insert(0, str(PRODUCT_TEST_ROOT))

from webview2RuntimeLock import (  # noqa: E402
    LOCK_PATH,
    RuntimeLockError,
    displayPath,
    loadRuntimeLock,
    runtimeInstallRoot,
    runtimeLockSha256,
    sha256File,
    verifyInstalledRuntime,
)


WORK_ROOT = ROOT / "output" / "test-runner" / "product-browser-webview2-fixed"
DOWNLOAD_ROOT = WORK_ROOT / "downloads"
STAGING_ROOT = WORK_ROOT / "fixed-runtime-staging"
RECEIPT_PATH = WORK_ROOT / "runtime-install-receipt.json"
DOWNLOAD_RETRIES = 3
READ_CHUNK_BYTES = 1024 * 1024


def main() -> int:
    if sys.platform != "win32":
        print("FAIL: WebView2 Fixed Version runtime installation requires Windows", file=sys.stderr)
        return 1
    try:
        payload = loadRuntimeLock()
        receipt = installRuntime(payload)
    except (RuntimeLockError, OSError, subprocess.SubprocessError, HTTPError, URLError) as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    RECEIPT_PATH.parent.mkdir(parents=True, exist_ok=True)
    RECEIPT_PATH.write_text(
        json.dumps(receipt, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(receipt, ensure_ascii=False, indent=2))
    print("ok: WebView2 Fixed Version runtime installed and verified")
    return 0


def installRuntime(payload: dict[str, object]) -> dict[str, object]:
    WORK_ROOT.mkdir(parents=True, exist_ok=True)
    DOWNLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    target = runtimeInstallRoot(payload)
    archive = DOWNLOAD_ROOT / str(payload["archiveFileName"])
    reused_runtime = False
    if target.is_dir():
        try:
            verifyInstalledRuntime(payload)
            reused_runtime = True
        except RuntimeLockError:
            removeWithinWorkRoot(target)

    archive_reused = downloadArchive(payload, archive)
    if not reused_runtime:
        extractArchive(payload, archive, target)
    runtime_evidence = verifyInstalledRuntime(payload)
    acl = grantAppContainerReadExecute(target)
    return {
        "status": "passed",
        "gitHead": currentGitHead(),
        "installedAt": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        "lockPath": displayPath(LOCK_PATH),
        "lockSha256": runtimeLockSha256(),
        "distributionMode": payload["distributionMode"],
        "version": payload["version"],
        "architecture": payload["architecture"],
        "archive": {
            "path": displayPath(archive),
            "bytes": archive.stat().st_size,
            "sha256": sha256File(archive),
            "downloadReused": archive_reused,
        },
        "runtime": runtime_evidence,
        "runtimeReused": reused_runtime,
        "appContainerAcl": acl,
    }


def currentGitHead() -> str:
    completed = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=30,
        check=True,
    )
    return completed.stdout.strip()


def downloadArchive(payload: dict[str, object], archive: Path) -> bool:
    expected_bytes = int(payload["archiveBytes"])
    expected_sha256 = str(payload["archiveSha256"])
    if archive.is_file() and archive.stat().st_size == expected_bytes:
        if sha256File(archive) == expected_sha256:
            return True
        archive.unlink()
    partial = archive.with_suffix(archive.suffix + ".part")
    for attempt in range(1, DOWNLOAD_RETRIES + 1):
        try:
            resumeDownload(str(payload["officialArchiveUrl"]), partial, expected_bytes)
            if partial.stat().st_size != expected_bytes:
                raise RuntimeLockError(
                    f"WebView2 archive byte size differs: expected={expected_bytes}, actual={partial.stat().st_size}"
                )
            actual_sha256 = sha256File(partial)
            if actual_sha256 != expected_sha256:
                partial.unlink()
                raise RuntimeLockError(
                    "WebView2 archive SHA-256 differs: "
                    f"expected={expected_sha256}, actual={actual_sha256}"
                )
            os.replace(partial, archive)
            return False
        except (OSError, HTTPError, URLError, RuntimeLockError):
            if attempt == DOWNLOAD_RETRIES:
                raise
            time.sleep(attempt)
    raise RuntimeLockError("WebView2 archive download exhausted retries")


def resumeDownload(url: str, partial: Path, expected_bytes: int) -> None:
    partial.parent.mkdir(parents=True, exist_ok=True)
    existing_bytes = partial.stat().st_size if partial.is_file() else 0
    if existing_bytes > expected_bytes:
        partial.unlink()
        existing_bytes = 0
    headers = {"User-Agent": "Codaro-WebView2-Release-Gate/1"}
    if existing_bytes:
        headers["Range"] = f"bytes={existing_bytes}-"
    request = Request(url, headers=headers)
    with urlopen(request, timeout=60) as response:
        status = getattr(response, "status", None)
        append = existing_bytes > 0 and status == 206
        if existing_bytes > 0 and not append:
            existing_bytes = 0
        mode = "ab" if append else "wb"
        with partial.open(mode) as handle:
            while True:
                chunk = response.read(READ_CHUNK_BYTES)
                if not chunk:
                    break
                handle.write(chunk)


def extractArchive(payload: dict[str, object], archive: Path, target: Path) -> None:
    removeWithinWorkRoot(STAGING_ROOT)
    STAGING_ROOT.mkdir(parents=True, exist_ok=True)
    completed = subprocess.run(
        ("expand.exe", str(archive), "-F:*", str(STAGING_ROOT)),
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=180,
        check=False,
    )
    if completed.returncode != 0:
        raise RuntimeLockError(
            "WebView2 archive expansion failed: "
            + (completed.stderr or completed.stdout)[-2000:]
        )
    staged_runtime = STAGING_ROOT / str(payload["runtimeDirectoryName"])
    staged_executable = staged_runtime / str(payload["executableRelativePath"])
    if not staged_executable.is_file():
        raise RuntimeLockError("WebView2 archive did not contain the locked runtime directory")
    actual_executable_sha256 = sha256File(staged_executable)
    if actual_executable_sha256 != payload["executableSha256"]:
        raise RuntimeLockError(
            "expanded WebView2 executable SHA-256 differs: "
            f"expected={payload['executableSha256']}, actual={actual_executable_sha256}"
        )
    target.parent.mkdir(parents=True, exist_ok=True)
    removeWithinWorkRoot(target)
    shutil.move(str(staged_runtime), str(target))
    removeWithinWorkRoot(STAGING_ROOT)


def grantAppContainerReadExecute(target: Path) -> list[dict[str, object]]:
    results: list[dict[str, object]] = []
    for sid in ("*S-1-15-2-2", "*S-1-15-2-1"):
        completed = subprocess.run(
            ("icacls.exe", str(target), "/grant", f"{sid}:(OI)(CI)(RX)"),
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=60,
            check=False,
        )
        result = {
            "sid": sid,
            "returnCode": completed.returncode,
            "stdout": completed.stdout.strip(),
            "stderr": completed.stderr.strip(),
        }
        results.append(result)
        if completed.returncode != 0:
            raise RuntimeLockError(f"WebView2 AppContainer ACL grant failed for {sid}: {result}")
    return results


def removeWithinWorkRoot(path: Path) -> None:
    resolved = path.resolve()
    allowed = WORK_ROOT.resolve()
    if resolved == allowed or allowed not in resolved.parents:
        raise RuntimeLockError(f"unsafe WebView2 runtime cleanup target: {resolved}")
    if not path.exists():
        return
    if path.is_dir():
        shutil.rmtree(path)
    else:
        path.unlink()


if __name__ == "__main__":
    raise SystemExit(main())
