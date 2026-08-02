from __future__ import annotations

from copy import deepcopy
from datetime import UTC, datetime
import json
from pathlib import Path

import pytest

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
