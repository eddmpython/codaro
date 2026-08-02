from __future__ import annotations

from datetime import UTC, date, datetime
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
from typing import Any
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[2]
LOCK_PATH = ROOT / "tests" / "product" / "webview2-runtime.lock.json"
OFFICIAL_ARCHIVE_HOST = "msedge.sf.dl.delivery.mp.microsoft.com"
OFFICIAL_SOURCE_HOST = "developer.microsoft.com"
EXPECTED_KEYS = {
    "schemaVersion",
    "distributionMode",
    "architecture",
    "version",
    "releaseDate",
    "sourcePageUrl",
    "officialArchiveUrl",
    "archiveFileName",
    "archiveBytes",
    "archiveSha256",
    "archiveLastModified",
    "runtimeDirectoryName",
    "executableRelativePath",
    "executableSha256",
    "installPath",
    "maximumAgeDays",
}
SHA256_PATTERN = re.compile(r"^[0-9a-f]{64}$")
VERSION_PATTERN = re.compile(r"^\d+\.\d+\.\d+\.\d+$")


class RuntimeLockError(ValueError):
    pass


def loadRuntimeLock(
    path: Path = LOCK_PATH,
    *,
    now: datetime | None = None,
) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise RuntimeLockError(f"WebView2 runtime lock cannot be read: {path}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeLockError(f"WebView2 runtime lock is not valid JSON: {path}") from exc
    validateRuntimeLock(payload, now=now)
    return payload


def validateRuntimeLock(
    payload: Any,
    *,
    now: datetime | None = None,
) -> None:
    if not isinstance(payload, dict):
        raise RuntimeLockError("WebView2 runtime lock must be a JSON object")
    keys = set(payload)
    if keys != EXPECTED_KEYS:
        missing = sorted(EXPECTED_KEYS - keys)
        extra = sorted(keys - EXPECTED_KEYS)
        raise RuntimeLockError(f"WebView2 runtime lock keys differ: missing={missing}, extra={extra}")
    if payload["schemaVersion"] != 1:
        raise RuntimeLockError("WebView2 runtime lock schemaVersion must be 1")
    if payload["distributionMode"] != "fixed":
        raise RuntimeLockError("WebView2 runtime distributionMode must be fixed")
    if payload["architecture"] != "x64":
        raise RuntimeLockError("WebView2 release runtime architecture must be x64")

    version = requireString(payload, "version")
    if VERSION_PATTERN.fullmatch(version) is None:
        raise RuntimeLockError("WebView2 runtime version must be an exact four-part version")
    release_date = parseDate(requireString(payload, "releaseDate"), "releaseDate")
    maximum_age_days = payload["maximumAgeDays"]
    if maximum_age_days != 30:
        raise RuntimeLockError("WebView2 runtime maximumAgeDays must remain exactly 30")
    today = (now or datetime.now(UTC)).astimezone(UTC).date()
    age_days = (today - release_date).days
    if age_days < 0:
        raise RuntimeLockError("WebView2 runtime releaseDate is in the future")
    if age_days > maximum_age_days:
        raise RuntimeLockError(
            f"WebView2 runtime lock is stale: ageDays={age_days}, maximumAgeDays={maximum_age_days}"
        )

    source_url = urlsplit(requireString(payload, "sourcePageUrl"))
    if source_url.scheme != "https" or source_url.hostname != OFFICIAL_SOURCE_HOST:
        raise RuntimeLockError("WebView2 sourcePageUrl must use the official Microsoft developer host")
    archive_url_text = requireString(payload, "officialArchiveUrl")
    archive_url = urlsplit(archive_url_text)
    if archive_url.scheme != "https" or archive_url.hostname != OFFICIAL_ARCHIVE_HOST:
        raise RuntimeLockError("WebView2 archive URL must use the official Microsoft delivery host")

    expected_archive_name = f"Microsoft.WebView2.FixedVersionRuntime.{version}.x64.cab"
    if payload["archiveFileName"] != expected_archive_name:
        raise RuntimeLockError("WebView2 archiveFileName does not match version and architecture")
    if PurePosixPath(archive_url.path).name != expected_archive_name:
        raise RuntimeLockError("WebView2 archive URL file name does not match the locked archive")
    archive_bytes = payload["archiveBytes"]
    if not isinstance(archive_bytes, int) or isinstance(archive_bytes, bool) or archive_bytes < 250_000_000:
        raise RuntimeLockError("WebView2 Fixed Version archiveBytes is implausibly small")
    requireSha256(payload, "archiveSha256")
    requireSha256(payload, "executableSha256")

    last_modified = parseTimestamp(
        requireString(payload, "archiveLastModified"),
        "archiveLastModified",
    )
    if last_modified.date() != release_date:
        raise RuntimeLockError("WebView2 releaseDate must match the official archive Last-Modified date")

    expected_directory = f"Microsoft.WebView2.FixedVersionRuntime.{version}.x64"
    if payload["runtimeDirectoryName"] != expected_directory:
        raise RuntimeLockError("WebView2 runtimeDirectoryName does not match version and architecture")
    if payload["executableRelativePath"] != "msedgewebview2.exe":
        raise RuntimeLockError("WebView2 executableRelativePath must be msedgewebview2.exe")
    expected_install_path = (
        "output/test-runner/product-browser-webview2-win10/fixed-runtime/"
        + expected_directory
    )
    if payload["installPath"] != expected_install_path:
        raise RuntimeLockError("WebView2 installPath must remain inside the Win10 gate workspace")


def runtimeInstallRoot(payload: dict[str, Any]) -> Path:
    install_path = PurePosixPath(requireString(payload, "installPath"))
    if install_path.is_absolute() or ".." in install_path.parts:
        raise RuntimeLockError("WebView2 installPath must be a safe repository-relative path")
    resolved = (ROOT / Path(*install_path.parts)).resolve()
    allowed_root = (
        ROOT / "output" / "test-runner" / "product-browser-webview2-win10" / "fixed-runtime"
    ).resolve()
    if resolved == allowed_root or allowed_root not in resolved.parents:
        raise RuntimeLockError("WebView2 installPath escaped the Win10 gate runtime root")
    return resolved


def runtimeExecutable(payload: dict[str, Any]) -> Path:
    return runtimeInstallRoot(payload) / requireString(payload, "executableRelativePath")


def verifyInstalledRuntime(payload: dict[str, Any]) -> dict[str, Any]:
    executable = runtimeExecutable(payload)
    if not executable.is_file():
        raise RuntimeLockError(f"locked WebView2 executable is missing: {executable}")
    actual_sha256 = sha256File(executable)
    if actual_sha256 != payload["executableSha256"]:
        raise RuntimeLockError(
            "locked WebView2 executable SHA-256 differs: "
            f"expected={payload['executableSha256']}, actual={actual_sha256}"
        )
    return {
        "installPath": displayPath(runtimeInstallRoot(payload)),
        "executablePath": displayPath(executable),
        "executableSha256": actual_sha256,
        "version": payload["version"],
    }


def runtimeLockSha256(path: Path = LOCK_PATH) -> str:
    return sha256File(path)


def sha256File(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def requireString(payload: dict[str, Any], key: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise RuntimeLockError(f"WebView2 runtime lock {key} must be a non-empty string")
    return value


def requireSha256(payload: dict[str, Any], key: str) -> None:
    value = requireString(payload, key)
    if SHA256_PATTERN.fullmatch(value) is None:
        raise RuntimeLockError(f"WebView2 runtime lock {key} must be lowercase SHA-256")


def parseDate(value: str, key: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise RuntimeLockError(f"WebView2 runtime lock {key} must be an ISO date") from exc


def parseTimestamp(value: str, key: str) -> datetime:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise RuntimeLockError(f"WebView2 runtime lock {key} must be an ISO timestamp") from exc
    if parsed.tzinfo is None:
        raise RuntimeLockError(f"WebView2 runtime lock {key} must include a timezone")
    return parsed.astimezone(UTC)


def displayPath(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return str(path.resolve())
