from __future__ import annotations

from typing import Any

from .common import TaskBlueprint, raises, task


T = task
E = raises


def decision(
    slug: str,
    title: str,
    goal: str,
    entry: str,
    table: dict[str, dict[str, Any]],
) -> TaskBlueprint:
    solution = (
        f"def {entry}(situation):\n"
        f"    table = {table!r}\n"
        "    if situation not in table:\n"
        "        raise ValueError('unknown situation')\n"
        "    return table[situation]\n"
    )
    cases = [
        ("recalls-" + key, [key], value)
        for key, value in list(table.items())[:2]
    ] + [("rejects-unknown", ["unknown"], E("ValueError"))]
    return T(
        slug,
        title,
        goal,
        f"{entry}(situation)를 완성해 action, evidence, risk를 반환하세요.",
        f"def {entry}(situation):\n    raise NotImplementedError",
        solution,
        entry,
        cases,
        [
            "파일 action 전에 root·충돌·dry run 계약을 확인하세요.",
            "실행 횟수가 아니라 source와 destination artifact identity로 결과를 판정하세요.",
        ],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "02": {
        "mastery": T(
            "text-file-contract",
            "텍스트 파일의 encoding·newline·크기 계약 감사하기",
            "읽기 전에 허용 encoding과 byte limit, newline 정책을 검사한다.",
            "audit_text_file_contract(file_info, contract)를 완성하세요.",
            "def audit_text_file_contract(file_info, contract):\n    raise NotImplementedError",
            """def audit_text_file_contract(file_info, contract):
    failures = []
    if file_info.get("encoding") not in contract.get("allowedEncodings", []):
        failures.append("encoding")
    if file_info.get("byteLength", 0) > contract.get("maximumBytes", 0):
        failures.append("size")
    if file_info.get("newline") not in contract.get("allowedNewlines", []):
        failures.append("newline")
    if file_info.get("binaryNullBytes", 0) > 0:
        failures.append("binary-content")
    return {"readable": not failures, "failures": failures, "byteLength": file_info.get("byteLength", 0)}
""",
            "audit_text_file_contract",
            [
                (
                    "accepts-utf8-lf-file",
                    [{"encoding": "utf-8", "byteLength": 100, "newline": "lf", "binaryNullBytes": 0}, {"allowedEncodings": ["utf-8"], "maximumBytes": 1000, "allowedNewlines": ["lf", "crlf"]}],
                    {"readable": True, "failures": [], "byteLength": 100},
                ),
                (
                    "reports-all-contract-failures",
                    [{"encoding": "cp949", "byteLength": 2000, "newline": "cr", "binaryNullBytes": 1}, {"allowedEncodings": ["utf-8"], "maximumBytes": 1000, "allowedNewlines": ["lf"]}],
                    {"readable": False, "failures": ["encoding", "size", "newline", "binary-content"], "byteLength": 2000},
                ),
                (
                    "accepts-exact-size-limit",
                    [{"encoding": "utf-8", "byteLength": 10, "newline": "lf"}, {"allowedEncodings": ["utf-8"], "maximumBytes": 10, "allowedNewlines": ["lf"]}],
                    {"readable": True, "failures": [], "byteLength": 10},
                ),
            ],
            [
                "기본 encoding에 맡기지 말고 입력 파일 계약에 명시하세요.",
                "binary null byte와 최대 byte 크기를 읽기 전에 검사하세요.",
            ],
        ),
        "transfer": T(
            "atomic-text-write-plan",
            "새 텍스트 출력에 원자적 write 계획 전이하기",
            "temporary path·flush·replace·검증 순서를 destination별로 만든다.",
            "plan_atomic_text_write(destination, content_hash, existing_hash)를 완성하세요.",
            "def plan_atomic_text_write(destination, content_hash, existing_hash):\n    raise NotImplementedError",
            """def plan_atomic_text_write(destination, content_hash, existing_hash):
    if not content_hash:
        raise ValueError("content hash required")
    unchanged = existing_hash == content_hash
    suffix = content_hash[:8]
    temporary = f"{destination}.tmp-{suffix}"
    steps = [] if unchanged else ["write-temp", "flush-temp", "verify-temp-hash", "replace-destination", "verify-destination-hash"]
    return {"action": "skip" if unchanged else "replace", "temporary": None if unchanged else temporary, "steps": steps, "expectedHash": content_hash}
""",
            "plan_atomic_text_write",
            [
                (
                    "plans-atomic-replace",
                    ["/out/report.txt", "abcdef123456", "old"],
                    {"action": "replace", "temporary": "/out/report.txt.tmp-abcdef12", "steps": ["write-temp", "flush-temp", "verify-temp-hash", "replace-destination", "verify-destination-hash"], "expectedHash": "abcdef123456"},
                ),
                (
                    "skips-identical-content",
                    ["/out/report.txt", "same", "same"],
                    {"action": "skip", "temporary": None, "steps": [], "expectedHash": "same"},
                ),
                ("rejects-empty-hash", ["/out/report.txt", "", None], E("ValueError")),
            ],
            [
                "destination에 직접 쓰지 말고 같은 filesystem의 temporary path를 사용하세요.",
                "replace 전후 content hash를 검증하고 동일 내용은 skip하세요.",
            ],
        ),
        "retrieval": decision(
            "text-file-io-recall",
            "텍스트 파일 읽기·쓰기 품질 기준 회상하기",
            "encoding·size·atomic replace evidence를 복원한다.",
            "choose_text_file_policy",
            {
                "read": {"action": "validate encoding newline and byte limit", "evidence": "input descriptor", "risk": "decode or memory failure"},
                "write": {"action": "write and fsync temporary", "evidence": "temporary hash", "risk": "partial destination"},
                "replace": {"action": "atomic replace then verify", "evidence": "destination content hash", "risk": "stale or corrupt file"},
            },
        ),
    },
    "03": {
        "mastery": T(
            "directory-inventory",
            "디렉터리 entry를 root 상대 artifact inventory로 만들기",
            "path escape와 symlink를 격리하고 파일별 size·hash를 정렬한다.",
            "build_directory_inventory(entries, root)를 완성하세요.",
            "def build_directory_inventory(entries, root):\n    raise NotImplementedError",
            """def build_directory_inventory(entries, root):
    from pathlib import PurePosixPath
    root_path = PurePosixPath(root)
    files = []
    rejected = []
    for entry in entries:
        path = PurePosixPath(entry["path"])
        try:
            relative = path.relative_to(root_path).as_posix()
        except ValueError:
            rejected.append({"path": entry["path"], "reason": "root"})
            continue
        if entry.get("isSymlink", False):
            rejected.append({"path": entry["path"], "reason": "symlink"})
        elif entry.get("kind") == "file":
            files.append({"path": relative, "size": entry["size"], "hash": entry["hash"]})
    files.sort(key=lambda item: item["path"])
    return {"files": files, "rejected": rejected, "fileCount": len(files), "totalBytes": sum(item["size"] for item in files)}
""",
            "build_directory_inventory",
            [
                (
                    "builds-sorted-file-inventory",
                    [[{"path": "/root/b.txt", "kind": "file", "size": 2, "hash": "b"}, {"path": "/root/a.txt", "kind": "file", "size": 1, "hash": "a"}, {"path": "/root/sub", "kind": "directory"}], "/root"],
                    {"files": [{"path": "a.txt", "size": 1, "hash": "a"}, {"path": "b.txt", "size": 2, "hash": "b"}], "rejected": [], "fileCount": 2, "totalBytes": 3},
                ),
                (
                    "rejects-symlink-and-outside",
                    [[{"path": "/root/link", "kind": "file", "size": 1, "hash": "x", "isSymlink": True}, {"path": "/other/x", "kind": "file", "size": 1, "hash": "y"}], "/root"],
                    {"files": [], "rejected": [{"path": "/root/link", "reason": "symlink"}, {"path": "/other/x", "reason": "root"}], "fileCount": 0, "totalBytes": 0},
                ),
                (
                    "handles-empty-directory",
                    [[], "/root"],
                    {"files": [], "rejected": [], "fileCount": 0, "totalBytes": 0},
                ),
            ],
            [
                "절대 path 대신 허용 root 상대 path를 artifact identity로 사용하세요.",
                "symlink는 resolved target 정책이 없으면 기본 격리하세요.",
            ],
        ),
        "transfer": T(
            "inventory-diff",
            "새 디렉터리 snapshot에 추가·변경·삭제 diff 전이하기",
            "상대 path와 content hash로 두 inventory를 비교한다.",
            "diff_directory_inventory(before, after)를 완성하세요.",
            "def diff_directory_inventory(before, after):\n    raise NotImplementedError",
            """def diff_directory_inventory(before, after):
    before_map = {item["path"]: item["hash"] for item in before}
    after_map = {item["path"]: item["hash"] for item in after}
    added = sorted(set(after_map) - set(before_map))
    removed = sorted(set(before_map) - set(after_map))
    changed = sorted(path for path in set(before_map) & set(after_map) if before_map[path] != after_map[path])
    unchanged = sorted(path for path in set(before_map) & set(after_map) if before_map[path] == after_map[path])
    return {"added": added, "changed": changed, "removed": removed, "unchanged": unchanged}
""",
            "diff_directory_inventory",
            [
                (
                    "computes-all-diff-kinds",
                    [[{"path": "old", "hash": "o"}, {"path": "change", "hash": "a"}, {"path": "same", "hash": "s"}], [{"path": "new", "hash": "n"}, {"path": "change", "hash": "b"}, {"path": "same", "hash": "s"}]],
                    {"added": ["new"], "changed": ["change"], "removed": ["old"], "unchanged": ["same"]},
                ),
                (
                    "handles-identical-inventories",
                    [[{"path": "a", "hash": "x"}], [{"path": "a", "hash": "x"}]],
                    {"added": [], "changed": [], "removed": [], "unchanged": ["a"]},
                ),
                (
                    "handles-empty-before",
                    [[], [{"path": "a", "hash": "x"}]],
                    {"added": ["a"], "changed": [], "removed": [], "unchanged": []},
                ),
            ],
            [
                "modified time만으로 변경을 판단하지 말고 content hash를 사용하세요.",
                "추가·변경·삭제·동일을 모두 report에 남기세요.",
            ],
        ),
        "retrieval": decision(
            "directory-traversal-recall",
            "디렉터리 탐색 evidence 회상하기",
            "root containment·artifact inventory·snapshot diff를 구분한다.",
            "choose_directory_evidence",
            {
                "scope": {"action": "resolve under allowed root", "evidence": "relative path", "risk": "path escape"},
                "inventory": {"action": "record size and content hash", "evidence": "sorted artifact descriptors", "risk": "metadata-only identity"},
                "diff": {"action": "compare path and hash maps", "evidence": "added changed removed unchanged", "risk": "silent deletion"},
            },
        ),
    },
    "04": {
        "mastery": T(
            "file-transfer-plan",
            "복사·이동·이름변경의 충돌 정책 계획하기",
            "source identity와 destination 존재 여부, overwrite 정책으로 action을 결정한다.",
            "plan_file_transfer(operation, source, destination, destination_exists, overwrite)를 완성하세요.",
            "def plan_file_transfer(operation, source, destination, destination_exists, overwrite):\n    raise NotImplementedError",
            """def plan_file_transfer(operation, source, destination, destination_exists, overwrite):
    if operation not in {"copy", "move", "rename"}:
        raise ValueError("unknown operation")
    if source == destination:
        return {"ready": False, "action": "skip", "reason": "same-path", "requiresBackup": False}
    if destination_exists and not overwrite:
        return {"ready": False, "action": "conflict", "reason": "destination-exists", "requiresBackup": False}
    return {"ready": True, "action": operation, "reason": "planned", "requiresBackup": destination_exists and overwrite}
""",
            "plan_file_transfer",
            [
                ("plans-copy-to-empty-destination", ["copy", "/a", "/b", False, False], {"ready": True, "action": "copy", "reason": "planned", "requiresBackup": False}),
                ("reports-existing-conflict", ["move", "/a", "/b", True, False], {"ready": False, "action": "conflict", "reason": "destination-exists", "requiresBackup": False}),
                ("requires-backup-before-overwrite", ["rename", "/a", "/b", True, True], {"ready": True, "action": "rename", "reason": "planned", "requiresBackup": True}),
                ("rejects-unknown-operation", ["merge", "/a", "/b", False, False], E("ValueError")),
            ],
            [
                "destination 충돌을 조용히 overwrite하지 말고 정책으로 판정하세요.",
                "overwrite가 허용돼도 기존 destination backup을 먼저 계획하세요.",
            ],
        ),
        "transfer": T(
            "file-transfer-result",
            "새 복사·이동 결과에 source/destination hash 감사 전이하기",
            "operation별 source 잔존 조건과 destination content hash를 검사한다.",
            "audit_file_transfer_result(operation, expected_hash, result)를 완성하세요.",
            "def audit_file_transfer_result(operation, expected_hash, result):\n    raise NotImplementedError",
            """def audit_file_transfer_result(operation, expected_hash, result):
    failures = []
    if result.get("destinationHash") != expected_hash:
        failures.append("destination-hash")
    should_keep_source = operation == "copy"
    if result.get("sourceExists", False) != should_keep_source:
        failures.append("source-state")
    if result.get("destinationCount") != 1:
        failures.append("destination-count")
    return {"passed": not failures, "failures": failures, "sourceKept": result.get("sourceExists", False)}
""",
            "audit_file_transfer_result",
            [
                (
                    "accepts-copy-result",
                    ["copy", "abc", {"destinationHash": "abc", "sourceExists": True, "destinationCount": 1}],
                    {"passed": True, "failures": [], "sourceKept": True},
                ),
                (
                    "accepts-move-result",
                    ["move", "abc", {"destinationHash": "abc", "sourceExists": False, "destinationCount": 1}],
                    {"passed": True, "failures": [], "sourceKept": False},
                ),
                (
                    "reports-corrupt-duplicate-move",
                    ["move", "abc", {"destinationHash": "bad", "sourceExists": True, "destinationCount": 2}],
                    {"passed": False, "failures": ["destination-hash", "source-state", "destination-count"], "sourceKept": True},
                ),
            ],
            [
                "복사와 이동의 source 잔존 조건을 구분하세요.",
                "destination path 존재뿐 아니라 content hash와 단일 개수를 검사하세요.",
            ],
        ),
        "retrieval": decision(
            "file-transfer-recall",
            "복사·이동·이름변경 안전 원칙 회상하기",
            "충돌·backup·결과 hash evidence를 복원한다.",
            "choose_file_transfer_policy",
            {
                "conflict": {"action": "apply explicit overwrite policy", "evidence": "source destination identities", "risk": "silent replacement"},
                "overwrite": {"action": "backup existing destination", "evidence": "backup descriptor", "risk": "irreversible loss"},
                "verify": {"action": "compare destination hash and source state", "evidence": "operation result", "risk": "partial move"},
            },
        ),
    },
    "05": {
        "mastery": T(
            "safe-delete-plan",
            "삭제 대상을 quarantine로 이동하는 안전 계획 만들기",
            "허용 root·보존 기간·manifest가 있는 경우에만 삭제 후보를 준비한다.",
            "plan_safe_delete(items, allowed_root, quarantine_root, retention_days)를 완성하세요.",
            "def plan_safe_delete(items, allowed_root, quarantine_root, retention_days):\n    raise NotImplementedError",
            """def plan_safe_delete(items, allowed_root, quarantine_root, retention_days):
    if retention_days <= 0:
        raise ValueError("retention must be positive")
    accepted = []
    rejected = []
    prefix = allowed_root.rstrip("/") + "/"
    for item in items:
        if not item["path"].startswith(prefix):
            rejected.append({"path": item["path"], "reason": "root"})
        elif item.get("open", False):
            rejected.append({"path": item["path"], "reason": "open-file"})
        else:
            destination = quarantine_root.rstrip("/") + "/" + item["path"][len(prefix) :]
            accepted.append({"source": item["path"], "quarantine": destination, "hash": item["hash"]})
    return {"ready": not rejected, "moves": accepted, "rejected": rejected, "retentionDays": retention_days}
""",
            "plan_safe_delete",
            [
                (
                    "plans-quarantine-move",
                    [[{"path": "/root/old.txt", "hash": "abc", "open": False}], "/root", "/trash", 30],
                    {"ready": True, "moves": [{"source": "/root/old.txt", "quarantine": "/trash/old.txt", "hash": "abc"}], "rejected": [], "retentionDays": 30},
                ),
                (
                    "rejects-outside-and-open-files",
                    [[{"path": "/other/x", "hash": "x"}, {"path": "/root/open", "hash": "o", "open": True}], "/root", "/trash", 7],
                    {"ready": False, "moves": [], "rejected": [{"path": "/other/x", "reason": "root"}, {"path": "/root/open", "reason": "open-file"}], "retentionDays": 7},
                ),
                ("rejects-zero-retention", [[], "/root", "/trash", 0], E("ValueError")),
            ],
            [
                "바로 unlink하지 말고 quarantine 이동과 보존 기간을 먼저 적용하세요.",
                "열려 있는 파일과 허용 root 밖 path는 삭제 계획에서 제외하세요.",
            ],
        ),
        "transfer": T(
            "quarantine-purge-audit",
            "새 quarantine purge에 보존 기간·승인·hash 감사 전이하기",
            "만료되고 manifest hash가 일치하며 승인된 항목만 영구 삭제한다.",
            "authorize_quarantine_purge(items, now_day, approved_ids)를 완성하세요.",
            "def authorize_quarantine_purge(items, now_day, approved_ids):\n    raise NotImplementedError",
            """def authorize_quarantine_purge(items, now_day, approved_ids):
    approved = set(approved_ids)
    purge = []
    blocked = []
    for item in items:
        reasons = []
        if item["id"] not in approved:
            reasons.append("approval")
        if item["purgeAfterDay"] > now_day:
            reasons.append("retention")
        if item.get("currentHash") != item.get("manifestHash"):
            reasons.append("hash")
        if reasons:
            blocked.append({"id": item["id"], "reasons": reasons})
        else:
            purge.append(item["id"])
    return {"authorized": purge, "blocked": blocked}
""",
            "authorize_quarantine_purge",
            [
                (
                    "authorizes-expired-approved-item",
                    [[{"id": "a", "purgeAfterDay": 10, "currentHash": "x", "manifestHash": "x"}], 10, ["a"]],
                    {"authorized": ["a"], "blocked": []},
                ),
                (
                    "reports-all-blocking-reasons",
                    [[{"id": "a", "purgeAfterDay": 20, "currentHash": "y", "manifestHash": "x"}], 10, []],
                    {"authorized": [], "blocked": [{"id": "a", "reasons": ["approval", "retention", "hash"]}]},
                ),
                (
                    "separates-authorized-and-blocked",
                    [[{"id": "a", "purgeAfterDay": 1, "currentHash": "x", "manifestHash": "x"}, {"id": "b", "purgeAfterDay": 1, "currentHash": "x", "manifestHash": "x"}], 2, ["a"]],
                    {"authorized": ["a"], "blocked": [{"id": "b", "reasons": ["approval"]}]},
                ),
            ],
            [
                "영구 삭제는 학습 확인 클릭과 달리 명시적 안전 승인이 필요합니다.",
                "quarantine 이후 변경된 파일은 manifest hash 불일치로 purge를 막으세요.",
            ],
        ),
        "retrieval": decision(
            "safe-delete-recall",
            "안전 삭제 단계 회상하기",
            "quarantine·retention·purge 승인 근거를 복원한다.",
            "choose_safe_delete_policy",
            {
                "prepare": {"action": "validate root and open state", "evidence": "candidate descriptor", "risk": "wrong file"},
                "quarantine": {"action": "move and record hash", "evidence": "reversible manifest", "risk": "lost recovery"},
                "purge": {"action": "require expiry hash and approval", "evidence": "purge authorization", "risk": "irreversible deletion"},
            },
        ),
    },
    "07": {
        "mastery": T(
            "backup-sync-plan",
            "source·backup inventory로 증분 backup 계획 만들기",
            "content hash 기준 copy·update·unchanged와 삭제 보존을 계산한다.",
            "plan_backup_sync(source, backup, mirror_deletes)를 완성하세요.",
            "def plan_backup_sync(source, backup, mirror_deletes):\n    raise NotImplementedError",
            """def plan_backup_sync(source, backup, mirror_deletes):
    source_map = {item["path"]: item["hash"] for item in source}
    backup_map = {item["path"]: item["hash"] for item in backup}
    copy = sorted(set(source_map) - set(backup_map))
    update = sorted(path for path in set(source_map) & set(backup_map) if source_map[path] != backup_map[path])
    unchanged = sorted(path for path in set(source_map) & set(backup_map) if source_map[path] == backup_map[path])
    backup_only = sorted(set(backup_map) - set(source_map))
    delete = backup_only if mirror_deletes else []
    preserve = [] if mirror_deletes else backup_only
    return {"copy": copy, "update": update, "delete": delete, "preserve": preserve, "unchanged": unchanged}
""",
            "plan_backup_sync",
            [
                (
                    "plans-incremental-backup-with-preserve",
                    [[{"path": "new", "hash": "n"}, {"path": "change", "hash": "b"}, {"path": "same", "hash": "s"}], [{"path": "old", "hash": "o"}, {"path": "change", "hash": "a"}, {"path": "same", "hash": "s"}], False],
                    {"copy": ["new"], "update": ["change"], "delete": [], "preserve": ["old"], "unchanged": ["same"]},
                ),
                (
                    "plans-explicit-mirror-delete",
                    [[], [{"path": "old", "hash": "o"}], True],
                    {"copy": [], "update": [], "delete": ["old"], "preserve": [], "unchanged": []},
                ),
                (
                    "handles-identical-inventories",
                    [[{"path": "a", "hash": "x"}], [{"path": "a", "hash": "x"}], False],
                    {"copy": [], "update": [], "delete": [], "preserve": [], "unchanged": ["a"]},
                ),
            ],
            [
                "backup 기본 정책은 source에서 사라진 파일도 보존하도록 두세요.",
                "mirror 삭제는 별도 명시된 경우에만 plan에 포함하세요.",
            ],
        ),
        "transfer": T(
            "backup-restore-audit",
            "새 backup에 restore sample 검증 전이하기",
            "선택된 sample의 backup hash와 복원 hash, metadata를 비교한다.",
            "audit_restore_samples(samples, minimum_samples)를 완성하세요.",
            "def audit_restore_samples(samples, minimum_samples):\n    raise NotImplementedError",
            """def audit_restore_samples(samples, minimum_samples):
    if minimum_samples <= 0:
        raise ValueError("minimum samples must be positive")
    failures = []
    mismatches = []
    for sample in samples:
        reasons = []
        if sample.get("backupHash") != sample.get("restoredHash"):
            reasons.append("hash")
        if sample.get("expectedSize") != sample.get("restoredSize"):
            reasons.append("size")
        if reasons:
            mismatches.append({"path": sample["path"], "reasons": reasons})
    if len(samples) < minimum_samples:
        failures.append("sample-count")
    if mismatches:
        failures.append("restore-mismatch")
    return {"passed": not failures, "failures": failures, "sampleCount": len(samples), "mismatches": mismatches}
""",
            "audit_restore_samples",
            [
                (
                    "accepts-two-restored-samples",
                    [[{"path": "a", "backupHash": "x", "restoredHash": "x", "expectedSize": 1, "restoredSize": 1}, {"path": "b", "backupHash": "y", "restoredHash": "y", "expectedSize": 2, "restoredSize": 2}], 2],
                    {"passed": True, "failures": [], "sampleCount": 2, "mismatches": []},
                ),
                (
                    "reports-sample-count-and-mismatch",
                    [[{"path": "a", "backupHash": "x", "restoredHash": "bad", "expectedSize": 1, "restoredSize": 2}], 2],
                    {"passed": False, "failures": ["sample-count", "restore-mismatch"], "sampleCount": 1, "mismatches": [{"path": "a", "reasons": ["hash", "size"]}]},
                ),
                ("rejects-zero-minimum", [[], 0], E("ValueError")),
            ],
            [
                "backup 생성 success가 아니라 실제 restore sample로 복구 가능성을 검증하세요.",
                "복원된 파일의 content hash와 size를 함께 비교하세요.",
            ],
        ),
        "retrieval": decision(
            "backup-sync-recall",
            "backup·동기화 품질 기준 회상하기",
            "증분 plan·삭제 정책·restore evidence를 복원한다.",
            "choose_backup_policy",
            {
                "incremental": {"action": "compare path and content hashes", "evidence": "copy update unchanged plan", "risk": "metadata-only change"},
                "delete": {"action": "preserve unless mirror explicitly enabled", "evidence": "delete policy", "risk": "propagated loss"},
                "restore": {"action": "test sampled restore", "evidence": "restored hash and size", "risk": "unusable backup"},
            },
        ),
    },
    "08": {
        "mastery": T(
            "directory-organization-plan",
            "확장자 규칙으로 디렉터리 정리 dry-run 만들기",
            "분류되지 않은 파일과 destination 충돌을 숨기지 않고 move plan을 만든다.",
            "plan_directory_organization(files, rules, existing_destinations)를 완성하세요.",
            "def plan_directory_organization(files, rules, existing_destinations):\n    raise NotImplementedError",
            """def plan_directory_organization(files, rules, existing_destinations):
    existing = set(existing_destinations)
    moves = []
    unclassified = []
    conflicts = []
    for file in files:
        suffix = file["suffix"].lower()
        category = rules.get(suffix)
        if not category:
            unclassified.append(file["path"])
            continue
        name = file["path"].rsplit("/", 1)[-1]
        destination = f"{category}/{name}"
        if destination in existing:
            conflicts.append({"source": file["path"], "destination": destination})
        else:
            moves.append({"source": file["path"], "destination": destination})
            existing.add(destination)
    return {"ready": not conflicts, "moves": moves, "unclassified": unclassified, "conflicts": conflicts, "dryRun": True}
""",
            "plan_directory_organization",
            [
                (
                    "plans-classified-moves",
                    [[{"path": "/in/a.PDF", "suffix": ".PDF"}, {"path": "/in/b.jpg", "suffix": ".jpg"}], {".pdf": "docs", ".jpg": "images"}, []],
                    {"ready": True, "moves": [{"source": "/in/a.PDF", "destination": "docs/a.PDF"}, {"source": "/in/b.jpg", "destination": "images/b.jpg"}], "unclassified": [], "conflicts": [], "dryRun": True},
                ),
                (
                    "reports-unclassified-file",
                    [[{"path": "/in/a.bin", "suffix": ".bin"}], {".txt": "text"}, []],
                    {"ready": True, "moves": [], "unclassified": ["/in/a.bin"], "conflicts": [], "dryRun": True},
                ),
                (
                    "reports-destination-conflict",
                    [[{"path": "/in/a.txt", "suffix": ".txt"}], {".txt": "text"}, ["text/a.txt"]],
                    {"ready": False, "moves": [], "unclassified": [], "conflicts": [{"source": "/in/a.txt", "destination": "text/a.txt"}], "dryRun": True},
                ),
            ],
            [
                "정리 계획은 항상 dry run으로 먼저 보여주고 destination 충돌을 차단하세요.",
                "분류되지 않은 확장자는 기타 폴더로 추측 이동하지 말고 남겨 두세요.",
            ],
        ),
        "transfer": T(
            "organization-result-audit",
            "새 디렉터리 정리 결과에 move reconciliation 전이하기",
            "계획된 source·destination 쌍과 실제 artifact를 정확히 대조한다.",
            "audit_organization_result(planned, observed)를 완성하세요.",
            "def audit_organization_result(planned, observed):\n    raise NotImplementedError",
            """def audit_organization_result(planned, observed):
    planned_ids = {(item["source"], item["destination"], item["hash"]) for item in planned}
    observed_ids = {(item["source"], item["destination"], item["hash"]) for item in observed}
    missing = sorted([list(item) for item in planned_ids - observed_ids])
    unexpected = sorted([list(item) for item in observed_ids - planned_ids])
    return {"passed": not missing and not unexpected, "missing": missing, "unexpected": unexpected, "plannedCount": len(planned_ids), "observedCount": len(observed_ids)}
""",
            "audit_organization_result",
            [
                (
                    "accepts-exact-observation",
                    [[{"source": "a", "destination": "docs/a", "hash": "x"}], [{"source": "a", "destination": "docs/a", "hash": "x"}]],
                    {"passed": True, "missing": [], "unexpected": [], "plannedCount": 1, "observedCount": 1},
                ),
                (
                    "reports-missing-and-unexpected",
                    [[{"source": "a", "destination": "docs/a", "hash": "x"}], [{"source": "b", "destination": "docs/b", "hash": "y"}]],
                    {"passed": False, "missing": [["a", "docs/a", "x"]], "unexpected": [["b", "docs/b", "y"]], "plannedCount": 1, "observedCount": 1},
                ),
                (
                    "handles-empty-plan",
                    [[], []],
                    {"passed": True, "missing": [], "unexpected": [], "plannedCount": 0, "observedCount": 0},
                ),
            ],
            [
                "파일 수만 비교하지 말고 source·destination·hash 쌍을 reconcile하세요.",
                "계획에 없던 이동도 unexpected artifact로 실패시키세요.",
            ],
        ),
        "retrieval": decision(
            "directory-organization-recall",
            "디렉터리 정리 품질 기준 회상하기",
            "분류·충돌·dry run·reconciliation 근거를 복원한다.",
            "choose_organization_gate",
            {
                "classify": {"action": "apply explicit suffix rules", "evidence": "classified and unclassified lists", "risk": "guessed category"},
                "plan": {"action": "detect destination conflicts in dry run", "evidence": "move plan", "risk": "overwrite"},
                "verify": {"action": "reconcile source destination hash", "evidence": "artifact pairs", "risk": "partial organization"},
            },
        ),
    },
    "09": {
        "mastery": T(
            "file-metadata-descriptor",
            "파일 metadata를 portable artifact descriptor로 정규화하기",
            "path·kind·size·modified time·content hash·mode를 검증 가능한 구조로 만든다.",
            "normalize_file_metadata(metadata, root)를 완성하세요.",
            "def normalize_file_metadata(metadata, root):\n    raise NotImplementedError",
            """def normalize_file_metadata(metadata, root):
    from pathlib import PurePosixPath
    path = PurePosixPath(metadata["path"])
    try:
        relative = path.relative_to(PurePosixPath(root)).as_posix()
    except ValueError as error:
        raise ValueError("path outside root") from error
    if metadata.get("size", -1) < 0 or not metadata.get("contentHash"):
        raise ValueError("invalid metadata")
    return {"path": relative, "kind": metadata.get("kind", "file"), "byteLength": metadata["size"], "modifiedNs": metadata["modifiedNs"], "contentHash": metadata["contentHash"], "mode": metadata.get("mode")}
""",
            "normalize_file_metadata",
            [
                (
                    "normalizes-relative-descriptor",
                    [{"path": "/root/sub/a.txt", "size": 5, "modifiedNs": 10, "contentHash": "abc", "mode": "0644"}, "/root"],
                    {"path": "sub/a.txt", "kind": "file", "byteLength": 5, "modifiedNs": 10, "contentHash": "abc", "mode": "0644"},
                ),
                (
                    "preserves-explicit-kind",
                    [{"path": "/root/folder", "kind": "directory", "size": 0, "modifiedNs": 1, "contentHash": "tree"}, "/root"],
                    {"path": "folder", "kind": "directory", "byteLength": 0, "modifiedNs": 1, "contentHash": "tree", "mode": None},
                ),
                ("rejects-outside-root", [{"path": "/other/a", "size": 1, "modifiedNs": 1, "contentHash": "x"}, "/root"], E("ValueError")),
                ("rejects-negative-size", [{"path": "/root/a", "size": -1, "modifiedNs": 1, "contentHash": "x"}, "/root"], E("ValueError")),
            ],
            [
                "artifact path는 root 상대 identity로 저장하세요.",
                "modified time만이 아니라 content hash와 byte length를 함께 기록하세요.",
            ],
        ),
        "transfer": T(
            "metadata-policy-audit",
            "새 artifact metadata에 크기·나이·permission 정책 전이하기",
            "정책 위반을 path별 사유로 분리한다.",
            "audit_metadata_policy(items, now_ns, policy)를 완성하세요.",
            "def audit_metadata_policy(items, now_ns, policy):\n    raise NotImplementedError",
            """def audit_metadata_policy(items, now_ns, policy):
    violations = []
    for item in items:
        reasons = []
        if item["byteLength"] > policy["maximumBytes"]:
            reasons.append("size")
        if now_ns - item["modifiedNs"] > policy["maximumAgeNs"]:
            reasons.append("age")
        if item.get("mode") in policy.get("blockedModes", []):
            reasons.append("mode")
        if reasons:
            violations.append({"path": item["path"], "reasons": reasons})
    return {"accepted": not violations, "violations": violations, "itemCount": len(items)}
""",
            "audit_metadata_policy",
            [
                (
                    "accepts-within-policy",
                    [[{"path": "a", "byteLength": 10, "modifiedNs": 90, "mode": "0644"}], 100, {"maximumBytes": 20, "maximumAgeNs": 20, "blockedModes": ["0777"]}],
                    {"accepted": True, "violations": [], "itemCount": 1},
                ),
                (
                    "reports-size-age-and-mode",
                    [[{"path": "a", "byteLength": 30, "modifiedNs": 50, "mode": "0777"}], 100, {"maximumBytes": 20, "maximumAgeNs": 20, "blockedModes": ["0777"]}],
                    {"accepted": False, "violations": [{"path": "a", "reasons": ["size", "age", "mode"]}], "itemCount": 1},
                ),
                (
                    "handles-empty-items",
                    [[], 100, {"maximumBytes": 1, "maximumAgeNs": 1}],
                    {"accepted": True, "violations": [], "itemCount": 0},
                ),
            ],
            [
                "metadata 정책의 threshold를 report와 함께 보존하세요.",
                "한 파일의 복수 위반 사유를 첫 번째 하나로 숨기지 마세요.",
            ],
        ),
        "retrieval": decision(
            "file-metadata-recall",
            "파일 metadata 활용 원칙 회상하기",
            "identity·변경·정책 판정 근거를 복원한다.",
            "choose_metadata_evidence",
            {
                "identity": {"action": "record relative path size and hash", "evidence": "artifact descriptor", "risk": "absolute path leakage"},
                "change": {"action": "compare content hash", "evidence": "before after descriptors", "risk": "mtime-only decision"},
                "policy": {"action": "audit size age and mode", "evidence": "path reasons thresholds", "risk": "hidden permission issue"},
            },
        ),
    },
    "10": {
        "mastery": T(
            "downloads-cleanup-capstone",
            "다운로드 폴더 정리의 plan·conflict·quarantine 감사하기",
            "분류 move와 오래된 파일 quarantine를 분리하고 충돌 시 실행을 막는다.",
            "audit_download_cleanup(plan, output_path)를 완성해 판정 결과를 반환하고, output_path에는 같은 결과를 한 행짜리 JSON table로 저장하세요.",
            "def audit_download_cleanup(plan, output_path=None):\n    raise NotImplementedError",
            """import json
from pathlib import Path


def audit_download_cleanup(plan, output_path=None):
    failures = []
    conflicts = sorted(item["path"] for item in plan.get("items", []) if item.get("destinationExists", False))
    outside = sorted(item["path"] for item in plan.get("items", []) if not item.get("withinDownloads", False))
    direct_deletes = sorted(item["path"] for item in plan.get("items", []) if item.get("action") == "delete")
    if conflicts:
        failures.append("conflicts")
    if outside:
        failures.append("scope")
    if direct_deletes:
        failures.append("direct-delete")
    if not plan.get("dryRun", False):
        failures.append("dry-run")
    result = {"ready": not failures, "failures": failures, "conflicts": conflicts, "outside": outside, "directDeletes": direct_deletes}
    default_path = "output/empty-audit.json" if not plan.get("items", []) else "output/ready-audit.json" if result["ready"] else "output/blocked-audit.json"
    target = Path(output_path or default_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps([result], ensure_ascii=False, sort_keys=True, indent=2), encoding="utf-8")
    return result
""",
            "audit_download_cleanup",
            [
                (
                    "accepts-dry-run-move-and-quarantine",
                    [{"dryRun": True, "items": [{"path": "/Downloads/a.pdf", "action": "move", "withinDownloads": True, "destinationExists": False}, {"path": "/Downloads/old.zip", "action": "quarantine", "withinDownloads": True, "destinationExists": False}]}, "output/ready-audit.json"],
                    {"ready": True, "failures": [], "conflicts": [], "outside": [], "directDeletes": []},
                ),
                (
                    "reports-all-blockers",
                    [{"dryRun": False, "items": [{"path": "/other/a", "action": "delete", "withinDownloads": False, "destinationExists": True}]}, "output/blocked-audit.json"],
                    {"ready": False, "failures": ["conflicts", "scope", "direct-delete", "dry-run"], "conflicts": ["/other/a"], "outside": ["/other/a"], "directDeletes": ["/other/a"]},
                ),
                (
                    "accepts-empty-dry-run",
                    [{"dryRun": True, "items": []}, "output/empty-audit.json"],
                    {"ready": True, "failures": [], "conflicts": [], "outside": [], "directDeletes": []},
                ),
            ],
            [
                "다운로드 정리는 실행 전 전체 dry-run plan을 검증하고 그 판정을 JSON audit에 남기세요.",
                "JSON table은 dict 하나가 아니라 동일한 열을 가진 record list로 저장하세요.",
            ],
            expectedPaths=[
                {"path": "output/ready-audit.json", "kind": "table", "origin": "created", "format": "json", "columns": ["conflicts", "directDeletes", "failures", "outside", "ready"]},
                {"path": "output/blocked-audit.json", "kind": "table", "origin": "created", "format": "json", "columns": ["conflicts", "directDeletes", "failures", "outside", "ready"]},
                {"path": "output/empty-audit.json", "kind": "table", "origin": "created", "format": "json", "columns": ["conflicts", "directDeletes", "failures", "outside", "ready"]},
            ],
        ),
        "transfer": T(
            "downloads-cleanup-release",
            "새 다운로드 정리에 artifact·idempotency gate 전이하기",
            "같은 input inventory를 두 번 적용했을 때 두 번째 action 0과 artifact 일치를 검사한다.",
            "decide_cleanup_release(first_run, second_run, expected_artifacts)를 완성하세요.",
            "def decide_cleanup_release(first_run, second_run, expected_artifacts):\n    raise NotImplementedError",
            """def decide_cleanup_release(first_run, second_run, expected_artifacts):
    failures = []
    if not first_run.get("passed", False):
        failures.append("first-run")
    if second_run.get("actionCount") != 0:
        failures.append("idempotency")
    observed = set(first_run.get("artifacts", []))
    missing = sorted(set(expected_artifacts) - observed)
    unexpected = sorted(observed - set(expected_artifacts))
    if missing or unexpected:
        failures.append("artifacts")
    if first_run.get("inputHash") != second_run.get("inputHash"):
        failures.append("input-identity")
    return {"releaseReady": not failures, "failures": failures, "missingArtifacts": missing, "unexpectedArtifacts": unexpected}
""",
            "decide_cleanup_release",
            [
                (
                    "accepts-idempotent-artifact-result",
                    [{"passed": True, "artifacts": ["docs/a.pdf"], "inputHash": "x"}, {"actionCount": 0, "inputHash": "x"}, ["docs/a.pdf"]],
                    {"releaseReady": True, "failures": [], "missingArtifacts": [], "unexpectedArtifacts": []},
                ),
                (
                    "reports-run-idempotency-and-artifacts",
                    [{"passed": False, "artifacts": ["extra"], "inputHash": "x"}, {"actionCount": 1, "inputHash": "x"}, ["expected"]],
                    {"releaseReady": False, "failures": ["first-run", "idempotency", "artifacts"], "missingArtifacts": ["expected"], "unexpectedArtifacts": ["extra"]},
                ),
                (
                    "reports-input-identity-change",
                    [{"passed": True, "artifacts": [], "inputHash": "a"}, {"actionCount": 0, "inputHash": "b"}, []],
                    {"releaseReady": False, "failures": ["input-identity"], "missingArtifacts": [], "unexpectedArtifacts": []},
                ),
            ],
            [
                "두 번째 실행 action 0으로 정리 작업의 idempotency를 검증하세요.",
                "같은 input inventory hash에서만 두 run을 비교하세요.",
            ],
        ),
        "retrieval": decision(
            "downloads-cleanup-capstone-recall",
            "다운로드 폴더 정리 종료 조건 회상하기",
            "scope·dry run·quarantine·artifact·idempotency 근거를 복원한다.",
            "choose_cleanup_gate",
            {
                "plan": {"action": "classify and detect conflicts in dry run", "evidence": "source destination plan", "risk": "wrong move"},
                "delete": {"action": "quarantine with retention", "evidence": "reversible manifest", "risk": "irreversible loss"},
                "release": {"action": "reconcile artifacts and rerun", "evidence": "zero-action second run", "risk": "non-idempotent cleanup"},
            },
        ),
    },
}
