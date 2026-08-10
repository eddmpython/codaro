from __future__ import annotations

import hashlib
import json
from typing import Mapping


PROOF_EXECUTION_ISOLATION_PROFILE = "codaro-local-restricted-v1"
PROOF_EXECUTION_ISOLATION_SPEC = {
    "schemaVersion": 1,
    "profile": PROOF_EXECUTION_ISOLATION_PROFILE,
    "environmentMode": "minimal-declared",
    "childProcessMode": "deny",
    "nativeInteropMode": "audit-deny",
    "destroyMode": "interrupt-then-dispose",
}


def executionIsolationPolicyHash(spec: Mapping[str, object]) -> str:
    encoded = json.dumps(
        spec,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")
    return f"sha256-{hashlib.sha256(encoded).hexdigest()}"


def proofExecutionIsolationPolicyHash() -> str:
    return executionIsolationPolicyHash(PROOF_EXECUTION_ISOLATION_SPEC)
