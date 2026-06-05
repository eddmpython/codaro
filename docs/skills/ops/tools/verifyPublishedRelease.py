"""발행된 릴리즈 아티팩트가 다른 환경에서 실제로 받아지는지 검증한다.

"내 로컬은 되는데 사용자 환경은 터진다"를 출시 전에 잡는 cross-env 수신 게이트. 빌드
환경이 아닌 깨끗한 러너(또는 로컬)에서, 발행된(또는 draft) `release-manifest.json`이
가리키는 **모든 자산**을 실제로 끝까지 받아 다음을 확인한다:

  (a) HTTP 200 (리다이렉트 따라가며)
  (b) 본문을 끝까지 수신 — 실측 바이트 == Content-Length(있으면)
  (c) 실측 sha256 == manifest의 sha256  ← 200만으론 부족, 이게 핵심
  (d) ranged GET(Range: bytes=0-N)이 206 Partial Content를 주는지(런처 resume 전제)

stdlib(urllib)만 쓴다 — 별도 의존성 없이 어느 러너에서도 돈다.

사용:
    uv run python -X utf8 docs/skills/ops/tools/verifyPublishedRelease.py [MANIFEST_SOURCE]

MANIFEST_SOURCE 우선순위: argv[1] > env CODARO_RELEASE_MANIFEST_URL > 기본(최신 릴리즈).
기본 URL이 404(아직 발행된 릴리즈 없음)이고 --strict가 아니면 'skipped'로 통과한다 —
로컬 preflight를 막지 않기 위함. 릴리즈 워크플로는 항상 발행된 URL을 명시로 넘긴다.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[4]
REPORT_PATH = (
    ROOT / "output" / "test-runner" / "published-release-smoke" / "published-release-report.json"
)
DEFAULT_MANIFEST_URL = (
    "https://github.com/eddmpython/codaro/releases/latest/download/release-manifest.json"
)
USER_AGENT = "codaro-release-verifier/1.0"
CONNECT_TIMEOUT_SECONDS = 30
CHUNK_SIZE = 256 * 1024


class VerificationError(RuntimeError):
    pass


@dataclass
class ArtifactResult:
    name: str
    url: str
    passed: bool
    checks: dict[str, Any] = field(default_factory=dict)
    failures: list[str] = field(default_factory=list)


def utcTimestamp() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def buildRequest(url: str, rangeHeader: str | None = None) -> urllib.request.Request:
    headers = {"User-Agent": USER_AGENT, "Accept": "*/*"}
    if rangeHeader is not None:
        headers["Range"] = rangeHeader
    return urllib.request.Request(url, headers=headers, method="GET")


def fetchManifest(source: str) -> dict[str, Any]:
    if "://" not in source:
        path = Path(source)
        if not path.exists():
            raise VerificationError(f"manifest source not found: {source}")
        return json.loads(path.read_text(encoding="utf-8"))
    try:
        with urllib.request.urlopen(
            buildRequest(source), timeout=CONNECT_TIMEOUT_SECONDS
        ) as response:
            payload = response.read()
    except urllib.error.HTTPError as exc:
        raise VerificationError(f"manifest fetch failed with HTTP {exc.code}: {source}") from exc
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise VerificationError(f"manifest fetch failed: {source}: {exc}") from exc
    try:
        return json.loads(payload.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise VerificationError(f"manifest is not valid JSON: {source}") from exc


def streamDownloadAndHash(url: str) -> tuple[int, str, int | None]:
    """본문을 끝까지 스트리밍하며 sha256·바이트수를 잰다. (받은바이트, sha256hex, contentLength)."""
    digest = hashlib.sha256()
    received = 0
    try:
        with urllib.request.urlopen(
            buildRequest(url), timeout=CONNECT_TIMEOUT_SECONDS
        ) as response:
            declared = response.headers.get("Content-Length")
            contentLength = int(declared) if declared and declared.isdigit() else None
            while True:
                chunk = response.read(CHUNK_SIZE)
                if not chunk:
                    break
                received += len(chunk)
                digest.update(chunk)
    except urllib.error.HTTPError as exc:
        raise VerificationError(f"HTTP {exc.code}") from exc
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise VerificationError(f"transfer failed: {exc}") from exc
    return received, digest.hexdigest(), contentLength


def probeRangeSupport(url: str) -> bool:
    """ranged GET이 206 Partial Content를 주는지(런처 resume 전제)."""
    try:
        with urllib.request.urlopen(
            buildRequest(url, rangeHeader="bytes=0-1023"),
            timeout=CONNECT_TIMEOUT_SECONDS,
        ) as response:
            return response.status == 206
    except urllib.error.HTTPError:
        return False
    except (urllib.error.URLError, TimeoutError, OSError):
        return False


def verifyArtifact(name: str, url: str, expectedSha256: str, *, strict: bool) -> ArtifactResult:
    result = ArtifactResult(name=name, url=url, passed=True)
    expected = expectedSha256.lower()
    try:
        received, actualSha256, contentLength = streamDownloadAndHash(url)
    except VerificationError as exc:
        result.passed = False
        result.failures.append(f"download failed: {exc}")
        return result

    result.checks["receivedBytes"] = received
    result.checks["contentLength"] = contentLength
    result.checks["sha256"] = actualSha256
    result.checks["expectedSha256"] = expected

    if contentLength is not None and contentLength != received:
        result.passed = False
        result.failures.append(
            f"content-length mismatch: declared {contentLength}, received {received}"
        )
    if actualSha256 != expected:
        result.passed = False
        result.failures.append(f"sha256 mismatch: expected {expected}, got {actualSha256}")

    rangeSupported = probeRangeSupport(url)
    result.checks["rangeSupported"] = rangeSupported
    if not rangeSupported:
        message = "range request did not return 206 Partial Content"
        if strict:
            result.passed = False
            result.failures.append(message)
        else:
            result.checks["rangeWarning"] = message
    return result


def collectArtifacts(manifest: dict[str, Any]) -> list[tuple[str, str, str]]:
    """(name, url, sha256) 목록. backendWheel 소스 editor는 url이 없으므로 건너뛴다."""
    artifacts: list[tuple[str, str, str]] = []
    runtime = manifest.get("pythonRuntime") or {}
    if runtime.get("url"):
        artifacts.append(("pythonRuntime", runtime["url"], runtime.get("sha256", "")))
    backend = manifest.get("backend") or {}
    if backend.get("wheelUrl"):
        artifacts.append(("backend", backend["wheelUrl"], backend.get("sha256", "")))
    editor = manifest.get("editor") or {}
    if editor.get("url"):
        artifacts.append(("editor", editor["url"], editor.get("sha256", "")))
    for index, bundle in enumerate(manifest.get("bundles") or []):
        if bundle.get("wheelUrl"):
            name = f"bundle:{bundle.get('packageName', index)}"
            artifacts.append((name, bundle["wheelUrl"], bundle.get("sha256", "")))
    return artifacts


def writeReport(payload: dict[str, Any]) -> None:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Verify published release artifacts are receivable.")
    parser.add_argument("manifest_source", nargs="?", default=None)
    parser.add_argument(
        "--strict",
        action="store_true",
        help="기본 manifest가 404여도 skip하지 않고 실패로 처리.",
    )
    args = parser.parse_args(argv)

    source = (
        args.manifest_source
        or _env("CODARO_RELEASE_MANIFEST_URL")
        or DEFAULT_MANIFEST_URL
    )
    startedAt = utcTimestamp()
    started = time.monotonic()

    try:
        manifest = fetchManifest(source)
    except VerificationError as exc:
        usedDefault = args.manifest_source is None and not _env("CODARO_RELEASE_MANIFEST_URL")
        if usedDefault and not args.strict and "HTTP 404" in str(exc):
            payload = {
                "gate": "published-release-smoke",
                "status": "skipped",
                "passed": True,
                "reason": "no published release manifest yet (default URL 404)",
                "manifestSource": source,
                "startedAt": startedAt,
                "completedAt": utcTimestamp(),
            }
            writeReport(payload)
            print(json.dumps(payload, ensure_ascii=False, indent=2))
            print("ok: published-release-smoke skipped (no release manifest)")
            return 0
        return _fail(source, startedAt, started, [str(exc)], [])

    artifacts = collectArtifacts(manifest)
    if not artifacts:
        return _fail(source, startedAt, started, ["manifest has no downloadable artifacts"], [])

    results = [verifyArtifact(name, url, sha, strict=args.strict) for name, url, sha in artifacts]
    failures = [f"{r.name}: {failure}" for r in results for failure in r.failures]
    return _finish(source, manifest, startedAt, started, results, failures)


def _finish(
    source: str,
    manifest: dict[str, Any],
    startedAt: str,
    started: float,
    results: list[ArtifactResult],
    failures: list[str],
) -> int:
    payload = {
        "gate": "published-release-smoke",
        "status": "passed" if not failures else "failed",
        "passed": not failures,
        "manifestSource": source,
        "releaseId": manifest.get("releaseId"),
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "artifactCount": len(results),
        "artifacts": [
            {
                "name": r.name,
                "url": r.url,
                "passed": r.passed,
                "checks": r.checks,
                "failures": r.failures,
            }
            for r in results
        ],
        "failures": failures,
    }
    writeReport(payload)
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    if failures:
        print("FAIL: published release artifacts are not cleanly receivable", file=sys.stderr)
        return 1
    print(f"ok: {len(results)} published artifacts verified (200 + length + sha256 + range)")
    return 0


def _fail(
    source: str,
    startedAt: str,
    started: float,
    failures: list[str],
    results: list[ArtifactResult],
) -> int:
    payload = {
        "gate": "published-release-smoke",
        "status": "failed",
        "passed": False,
        "manifestSource": source,
        "startedAt": startedAt,
        "completedAt": utcTimestamp(),
        "durationMs": round((time.monotonic() - started) * 1000),
        "artifacts": [],
        "failures": failures,
    }
    writeReport(payload)
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    print("FAIL: " + "; ".join(failures), file=sys.stderr)
    return 1


def _env(name: str) -> str | None:
    import os

    value = os.environ.get(name)
    return value if value else None


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
