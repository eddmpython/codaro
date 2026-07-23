from __future__ import annotations

from typing import Any

from .common import TaskBlueprint, task


T = task


def recall(slug: str, title: str, goal: str, entry: str, table: dict[str, dict[str, Any]]) -> TaskBlueprint:
    solution = (
        f"def {entry}(stage):\n"
        f"    table = {table!r}\n"
        "    if stage not in table:\n"
        "        raise ValueError('unknown stage')\n"
        "    return table[stage]\n"
    )
    return T(
        slug, title, goal, f"{entry}(stage)를 완성해 action, evidence, risk를 반환하세요.",
        f"def {entry}(stage):\n    raise NotImplementedError", solution, entry,
        [(f"recalls-{key}", [key], value) for key, value in table.items()],
        ["Web에서 상태 전이와 불변식을 즉시 검증하세요.", "Local에서는 실제 crash·restart 뒤 원장과 artifact를 다시 읽어 확인하세요."],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "01": {
        "mastery": T(
            "idempotency-ledger-transition", "멱등 처리 원장의 claim·commit 상태 전이 감사하기", "중복 실행과 실패 후 재시도를 상태로 구분한다.", "decide_ledger_action(entry, now, lease_seconds)를 완성하세요.", "def decide_ledger_action(entry, now, lease_seconds):\n    raise NotImplementedError",
            """def decide_ledger_action(entry, now, lease_seconds):
    if entry is None:
        return {"action": "claim", "reason": "new-key"}
    status = entry.get("status")
    if status == "committed":
        return {"action": "skip", "reason": "already-committed"}
    if status == "claimed" and now - entry.get("claimedAt", now) < lease_seconds:
        return {"action": "wait", "reason": "active-lease"}
    if status in {"claimed", "failed"}:
        return {"action": "reclaim", "reason": "retryable"}
    return {"action": "reject", "reason": "invalid-state"}
""", "decide_ledger_action",
            [("claims-new-key", [None, 100, 30], {"action": "claim", "reason": "new-key"}), ("skips-committed-key", [{"status": "committed"}, 100, 30], {"action": "skip", "reason": "already-committed"}), ("waits-or-reclaims-lease", [{"status": "claimed", "claimedAt": 90}, 100, 30], {"action": "wait", "reason": "active-lease"}), ("reclaims-expired-lease", [{"status": "claimed", "claimedAt": 50}, 100, 30], {"action": "reclaim", "reason": "retryable"})],
            ["키 존재만 보지 말고 claimed·committed·failed 상태를 구분하세요.", "in-flight claim에는 lease 만료 규칙이 있어야 합니다."],
        ),
        "transfer": T(
            "idempotency-key-contract", "다른 업무 이벤트의 멱등 키 계약 만들기", "업무 identity와 payload hash를 묶어 충돌을 검출한다.", "build_idempotency_key(event, required_fields)를 완성하세요.", "def build_idempotency_key(event, required_fields):\n    raise NotImplementedError",
            """def build_idempotency_key(event, required_fields):
    import hashlib
    import json
    missing = sorted(field for field in required_fields if not str(event.get(field, "")).strip())
    if missing:
        return {"ready": False, "missing": missing, "key": None}
    identity = {field: event[field] for field in sorted(required_fields)}
    payload = json.dumps(identity, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:16]
    return {"ready": True, "missing": [], "key": f"{event.get('type', 'event')}:{digest}"}
""", "build_idempotency_key",
            [("builds-stable-key", [{"type": "invoice", "invoiceId": "i1", "version": 2}, ["invoiceId", "version"]], {"ready": True, "missing": [], "key": "invoice:bd28997bdc25cde1"}), ("ignores-input-order", [{"version": 2, "invoiceId": "i1", "type": "invoice"}, ["version", "invoiceId"]], {"ready": True, "missing": [], "key": "invoice:bd28997bdc25cde1"}), ("reports-missing-identity", [{"type": "invoice", "invoiceId": ""}, ["invoiceId", "version"]], {"ready": False, "missing": ["invoiceId", "version"], "key": None})],
            ["표시 이름이 아니라 변하지 않는 업무 identity를 키 재료로 사용하세요.", "정렬된 직렬화와 hash로 입력 순서와 무관한 키를 만드세요."],
        ),
        "retrieval": recall("idempotency-ledger-recall", "멱등 원장 원칙 회상하기", "claim·effect·commit 순서와 recovery를 복원한다.", "choose_ledger_evidence", {"claim": {"action": "atomically claim stable key", "evidence": "lease-bearing ledger entry", "risk": "concurrent duplicate"}, "effect": {"action": "perform bounded external effect", "evidence": "effect identity", "risk": "unknown outcome"}, "commit": {"action": "record committed result", "evidence": "result hash and timestamp", "risk": "repeat after success"}, "recover": {"action": "reclaim expired or failed work", "evidence": "retry transition", "risk": "permanent stuck claim"}}),
    },
    "02": {
        "mastery": T(
            "checkpoint-admission", "재개 체크포인트의 source identity와 cursor 감사하기", "다른 입력·잘못된 cursor·완료 상태의 재실행을 차단한다.", "audit_checkpoint(checkpoint, source_hash, item_count)를 완성하세요.", "def audit_checkpoint(checkpoint, source_hash, item_count):\n    raise NotImplementedError",
            """def audit_checkpoint(checkpoint, source_hash, item_count):
    failures = []
    if checkpoint.get("sourceHash") != source_hash:
        failures.append("source")
    cursor = checkpoint.get("nextIndex")
    if not isinstance(cursor, int) or isinstance(cursor, bool) or cursor < 0 or cursor > item_count:
        failures.append("cursor")
    if checkpoint.get("status") == "complete" and cursor != item_count:
        failures.append("completion")
    return {"accepted": not failures, "failures": failures, "nextIndex": cursor, "remaining": item_count - cursor if isinstance(cursor, int) and not isinstance(cursor, bool) and 0 <= cursor <= item_count else None}
""", "audit_checkpoint",
            [("accepts-resume-cursor", [{"sourceHash": "h", "nextIndex": 3, "status": "running"}, "h", 10], {"accepted": True, "failures": [], "nextIndex": 3, "remaining": 7}), ("reports-stale-source", [{"sourceHash": "old", "nextIndex": 3, "status": "running"}, "h", 10], {"accepted": False, "failures": ["source"], "nextIndex": 3, "remaining": 7}), ("reports-cursor-completion", [{"sourceHash": "h", "nextIndex": 11, "status": "complete"}, "h", 10], {"accepted": False, "failures": ["cursor", "completion"], "nextIndex": 11, "remaining": None})],
            ["checkpoint를 입력 content hash와 묶어 stale resume을 막으세요.", "next cursor의 허용 범위와 complete 불변식을 검사하세요."],
        ),
        "transfer": T(
            "resume-batch-plan", "중단된 배치의 다음 처리 구간 계획하기", "cursor·batch size·처리 예산으로 결정론적 구간을 만든다.", "plan_resume_batch(next_index, item_count, batch_size, remaining_budget)를 완성하세요.", "def plan_resume_batch(next_index, item_count, batch_size, remaining_budget):\n    raise NotImplementedError",
            """def plan_resume_batch(next_index, item_count, batch_size, remaining_budget):
    if min(next_index, item_count, batch_size, remaining_budget) < 0 or next_index > item_count or batch_size == 0:
        raise ValueError("invalid resume bounds")
    take = min(batch_size, remaining_budget, item_count - next_index)
    end = next_index + take
    return {"start": next_index, "endExclusive": end, "count": take, "nextIndex": end, "complete": end == item_count}
""", "plan_resume_batch",
            [("plans-bounded-batch", [3, 10, 4, 10], {"start": 3, "endExclusive": 7, "count": 4, "nextIndex": 7, "complete": False}), ("honors-budget", [3, 10, 4, 2], {"start": 3, "endExclusive": 5, "count": 2, "nextIndex": 5, "complete": False}), ("finishes-tail", [8, 10, 5, 5], {"start": 8, "endExclusive": 10, "count": 2, "nextIndex": 10, "complete": True})],
            ["resume은 마지막 처리 index가 아니라 다음 처리 index를 저장하세요.", "batch size와 남은 실행 예산 중 작은 값으로 구간을 제한하세요."],
        ),
        "retrieval": recall("checkpoint-recovery-recall", "체크포인트 recovery 원칙 회상하기", "입력 고정·cursor commit·resume 검증을 기억에서 복원한다.", "choose_checkpoint_evidence", {"bind": {"action": "bind checkpoint to source hash", "evidence": "source identity", "risk": "resume on changed input"}, "commit": {"action": "persist next index after durable effect", "evidence": "monotonic cursor", "risk": "skip or duplicate item"}, "resume": {"action": "validate bounds before continuing", "evidence": "remaining work plan", "risk": "out-of-range recovery"}}),
    },
    "03": {
        "mastery": T(
            "atomic-write-plan", "원자적 쓰기의 temp·flush·replace 계약 감사하기", "다른 볼륨 temp와 검증 없는 replace를 차단한다.", "audit_atomic_plan(target, temp, steps)를 완성하세요.", "def audit_atomic_plan(target, temp, steps):\n    raise NotImplementedError",
            """def audit_atomic_plan(target, temp, steps):
    from pathlib import PurePosixPath
    required_order = ["write-temp", "flush", "fsync", "verify-temp", "replace"]
    failures = []
    target_path = PurePosixPath(target)
    temp_path = PurePosixPath(temp)
    if target_path.parent != temp_path.parent:
        failures.append("directory")
    if steps != required_order:
        failures.append("order")
    if target == temp:
        failures.append("identity")
    return {"ready": not failures, "failures": failures, "sameDirectory": target_path.parent == temp_path.parent, "steps": steps}
""", "audit_atomic_plan",
            [("accepts-same-directory-replace", ["out/report.json", "out/.report.json.tmp", ["write-temp", "flush", "fsync", "verify-temp", "replace"]], {"ready": True, "failures": [], "sameDirectory": True, "steps": ["write-temp", "flush", "fsync", "verify-temp", "replace"]}), ("reports-directory", ["out/report.json", "tmp/report.tmp", ["write-temp", "flush", "fsync", "verify-temp", "replace"]], {"ready": False, "failures": ["directory"], "sameDirectory": False, "steps": ["write-temp", "flush", "fsync", "verify-temp", "replace"]}), ("reports-order-and-identity", ["out/report.json", "out/report.json", ["write-temp", "replace"]], {"ready": False, "failures": ["order", "identity"], "sameDirectory": True, "steps": ["write-temp", "replace"]})],
            ["temp는 target과 같은 디렉터리에 만들어 replace 원자성을 확보하세요.", "temp 내용 검증과 fsync 뒤에만 replace하세요."],
        ),
        "transfer": T(
            "atomic-recovery-decision", "crash 뒤 target·temp 상태에서 복구 행동 결정하기", "hash·validity·generation으로 보존 또는 승격을 선택한다.", "decide_atomic_recovery(target, temp, expected_hash)를 완성하세요.", "def decide_atomic_recovery(target, temp, expected_hash):\n    raise NotImplementedError",
            """def decide_atomic_recovery(target, temp, expected_hash):
    target_valid = bool(target and target.get("valid"))
    temp_valid = bool(temp and temp.get("valid"))
    if target_valid and target.get("hash") == expected_hash:
        return {"action": "keep-target", "reason": "expected-committed"}
    if temp_valid and temp.get("hash") == expected_hash and (not target_valid or temp.get("generation", 0) > target.get("generation", 0)):
        return {"action": "promote-temp", "reason": "verified-newer-temp"}
    if target_valid:
        return {"action": "keep-target", "reason": "last-valid-artifact"}
    return {"action": "quarantine", "reason": "no-verified-artifact"}
""", "decide_atomic_recovery",
            [("keeps-expected-target", [{"valid": True, "hash": "h", "generation": 2}, {"valid": True, "hash": "h", "generation": 3}, "h"], {"action": "keep-target", "reason": "expected-committed"}), ("promotes-verified-temp", [{"valid": True, "hash": "old", "generation": 1}, {"valid": True, "hash": "new", "generation": 2}, "new"], {"action": "promote-temp", "reason": "verified-newer-temp"}), ("quarantines-invalid-state", [{"valid": False, "hash": "x"}, {"valid": False, "hash": "new"}, "new"], {"action": "quarantine", "reason": "no-verified-artifact"})],
            ["crash recovery는 파일 존재보다 content validity와 generation을 비교하세요.", "검증되지 않은 temp를 target 위로 덮지 마세요."],
        ),
        "retrieval": recall("atomic-write-recall", "원자적 쓰기·복구 원칙 회상하기", "temp write·durability·replace·recovery를 복원한다.", "choose_atomic_evidence", {"temp": {"action": "write unique temp beside target", "evidence": "bounded temp path", "risk": "partial target"}, "durable": {"action": "flush fsync and verify temp", "evidence": "temp hash and parse check", "risk": "buffered corruption"}, "replace": {"action": "atomically replace target", "evidence": "generation manifest", "risk": "torn update"}, "recover": {"action": "choose last verified generation", "evidence": "target-temp audit", "risk": "promoting invalid data"}}),
    },
}
