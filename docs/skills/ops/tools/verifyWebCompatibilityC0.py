from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import UTC, datetime
import hashlib
import json
from pathlib import Path
import sys
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urljoin
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[4]
DEFAULT_CONTRACT_PATH = ROOT / "contracts" / "webCompatibilityC0.json"


class WebCompatibilityC0Error(ValueError):
    pass


def loadContract(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise WebCompatibilityC0Error("C0 contract root must be an object")
    required = {"build", "deployedCapture", "entrypoints", "milestone", "releaseArchive", "schemaVersion", "source", "status", "tree"}
    if set(payload) != required or payload.get("schemaVersion") != 1 or payload.get("milestone") != "C0":
        raise WebCompatibilityC0Error("C0 contract fields or version are invalid")
    source = payload.get("source")
    tree = payload.get("tree")
    if (
        not isinstance(source, dict)
        or not isinstance(source.get("commit"), str)
        or len(source["commit"]) != 40
        or source.get("basePath") != "/codaro/app/"
        or not isinstance(tree, dict)
        or tree.get("fileCount") != 632
        or not isinstance(tree.get("sha256"), str)
        or len(tree["sha256"]) != 64
    ):
        raise WebCompatibilityC0Error("C0 source or tree identity is invalid")
    releaseArchive = payload.get("releaseArchive")
    if not isinstance(releaseArchive, dict) or releaseArchive.get("status") not in {"published", "pending-explicit-release"}:
        raise WebCompatibilityC0Error("C0 release archive status is invalid")
    return payload


def treeFacts(root: Path) -> tuple[list[Path], dict[str, Any]]:
    if not root.is_dir():
        raise WebCompatibilityC0Error(f"C0 tree does not exist: {root}")
    files = sorted(
        (path for path in root.rglob("*") if path.is_file()),
        key=lambda path: path.relative_to(root).as_posix().encode("utf-8"),
    )
    digest = hashlib.sha256()
    byteCount = 0
    for path in files:
        relative = path.relative_to(root).as_posix().encode("utf-8")
        content = path.read_bytes()
        byteCount += len(content)
        digest.update(len(relative).to_bytes(4, "big"))
        digest.update(relative)
        digest.update(len(content).to_bytes(8, "big"))
        digest.update(content)
    return files, {
        "byteCount": byteCount,
        "fileCount": len(files),
        "sha256": digest.hexdigest(),
    }


def verifyLocalTree(root: Path, contract: dict[str, Any]) -> tuple[list[Path], dict[str, Any]]:
    files, facts = treeFacts(root)
    expectedTree = contract["tree"]
    expectedFacts = {key: expectedTree[key] for key in ("byteCount", "fileCount", "sha256")}
    if facts != expectedFacts:
        raise WebCompatibilityC0Error(f"C0 tree identity mismatch: actual={facts} expected={expectedFacts}")

    index = (root / "index.html").read_text(encoding="utf-8")
    worker = (root / "serviceWorker.js").read_text(encoding="utf-8")
    pyproc = json.loads((root / "pyproc-assets.json").read_text(encoding="utf-8"))
    basePath = contract["source"]["basePath"]
    if basePath not in index or "SCOPE_PATH" not in worker:
        raise WebCompatibilityC0Error("C0 index or service worker lost its /codaro/app/ scope")
    entrypoints = pyproc.get("entrypoints")
    if not isinstance(entrypoints, list) or not entrypoints or any(
        not isinstance(row, dict) or not str(row.get("url", "")).startswith(basePath)
        for row in entrypoints
    ):
        raise WebCompatibilityC0Error("C0 pyproc entrypoints are outside /codaro/app/")

    for relative, expected in contract["entrypoints"].items():
        path = root / relative
        if not path.is_file():
            raise WebCompatibilityC0Error(f"C0 entrypoint is missing: {relative}")
        content = path.read_bytes()
        actual = {"bytes": len(content), "sha256": hashlib.sha256(content).hexdigest()}
        wanted = {"bytes": expected["bytes"], "sha256": expected["sha256"]}
        if actual != wanted:
            raise WebCompatibilityC0Error(f"C0 entrypoint identity mismatch: {relative} actual={actual} expected={wanted}")
    return files, {**facts, "pyprocEntrypoints": len(entrypoints), "scope": basePath}


def fetchDeployed(relative: str, *, baseUrl: str) -> tuple[str, bytes, str]:
    url = urljoin(baseUrl.rstrip("/") + "/", quote(relative, safe="/@._-~"))
    request = Request(url, headers={"User-Agent": "codaro-c0-deployed-crawl/1"})
    with urlopen(request, timeout=60) as response:
        return relative, response.read(), str(response.headers.get("Content-Type") or "")


def verifyDeployedTree(
    root: Path,
    files: list[Path],
    contract: dict[str, Any],
    *,
    baseUrl: str,
    workers: int,
) -> dict[str, Any]:
    expectedByPath = {path.relative_to(root).as_posix(): path for path in files}
    failures: list[str] = []
    contentTypes: dict[str, str] = {}
    downloadedBytes = 0
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(fetchDeployed, relative, baseUrl=baseUrl): relative
            for relative in expectedByPath
        }
        for future in as_completed(futures):
            relative = futures[future]
            try:
                fetchedRelative, content, contentType = future.result()
            except (HTTPError, URLError, OSError) as error:
                failures.append(f"{relative}: {error}")
                continue
            expected = expectedByPath[fetchedRelative].read_bytes()
            downloadedBytes += len(content)
            if content != expected:
                failures.append(
                    f"{relative}: bytes differ deployed={hashlib.sha256(content).hexdigest()} "
                    f"expected={hashlib.sha256(expected).hexdigest()}"
                )
            if relative in contract["entrypoints"]:
                contentTypes[relative] = contentType
                wanted = contract["entrypoints"][relative]["contentType"]
                if contentType.lower() != wanted.lower():
                    failures.append(f"{relative}: content-type={contentType!r} expected={wanted!r}")
    if failures:
        preview = "; ".join(failures[:12])
        raise WebCompatibilityC0Error(f"deployed C0 crawl failed ({len(failures)} files): {preview}")
    return {
        "baseUrl": baseUrl.rstrip("/") + "/",
        "contentTypes": contentTypes,
        "downloadedBytes": downloadedBytes,
        "fileCount": len(files),
        "matched": True,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="verify the pinned Codaro /app/ C0 tree")
    parser.add_argument("--tree", type=Path, required=True)
    parser.add_argument("--contract", type=Path, default=DEFAULT_CONTRACT_PATH)
    parser.add_argument("--deployed-url")
    parser.add_argument("--report", type=Path)
    parser.add_argument("--workers", type=int, default=12)
    args = parser.parse_args()
    startedAt = datetime.now(UTC).isoformat(timespec="seconds")
    try:
        contract = loadContract(args.contract.resolve())
        files, local = verifyLocalTree(args.tree.resolve(), contract)
        deployed = (
            verifyDeployedTree(
                args.tree.resolve(),
                files,
                contract,
                baseUrl=args.deployed_url,
                workers=max(1, min(args.workers, 32)),
            )
            if args.deployed_url
            else None
        )
        payload = {
            "schemaVersion": 1,
            "audit": "web-compatibility-c0",
            "status": "passed",
            "passed": True,
            "startedAt": startedAt,
            "completedAt": datetime.now(UTC).isoformat(timespec="seconds"),
            "sourceCommit": contract["source"]["commit"],
            "local": local,
            "deployed": deployed,
            "releaseArchive": contract["releaseArchive"],
        }
    except (OSError, json.JSONDecodeError, WebCompatibilityC0Error) as error:
        payload = {
            "schemaVersion": 1,
            "audit": "web-compatibility-c0",
            "status": "failed",
            "passed": False,
            "startedAt": startedAt,
            "completedAt": datetime.now(UTC).isoformat(timespec="seconds"),
            "failure": str(error),
        }
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    if not payload["passed"]:
        print(f"FAIL: {payload['failure']}", file=sys.stderr)
        return 1
    deployedLabel = f" deployed={payload['deployed']['fileCount']}" if payload["deployed"] else ""
    print(
        f"ok: C0 source={payload['sourceCommit'][:8]} files={payload['local']['fileCount']} "
        f"sha256={payload['local']['sha256']}{deployedLabel}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
