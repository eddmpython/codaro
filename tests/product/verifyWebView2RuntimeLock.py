from __future__ import annotations

from datetime import UTC, datetime
import json
import sys

from webview2RuntimeLock import LOCK_PATH, RuntimeLockError, loadRuntimeLock, runtimeLockSha256


def main() -> int:
    try:
        payload = loadRuntimeLock()
    except RuntimeLockError as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    report = {
        "status": "passed",
        "checkedAt": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
        "lockPath": LOCK_PATH.relative_to(LOCK_PATH.parents[2]).as_posix(),
        "lockSha256": runtimeLockSha256(),
        "distributionMode": payload["distributionMode"],
        "version": payload["version"],
        "releaseDate": payload["releaseDate"],
        "architecture": payload["architecture"],
        "archiveBytes": payload["archiveBytes"],
        "maximumAgeDays": payload["maximumAgeDays"],
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print("ok: WebView2 Fixed Version runtime lock verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
