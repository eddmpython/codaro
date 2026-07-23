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
            "event나 시간이 발생했다는 사실보다 처리 identity와 결과 evidence를 검증하세요.",
            "중복·지연·재시작 상황에서 같은 업무 결과가 보존되는지 확인하세요.",
        ],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "01": {
        "mastery": T(
            "watch-contract-audit",
            "폴더 감시 root·event·filter 계약 감사하기",
            "허용 root와 event 종류, include/exclude가 빠진 감시 계획을 차단한다.",
            "audit_watch_contract(contract, allowed_roots)를 완성하세요.",
            "def audit_watch_contract(contract, allowed_roots):\n    raise NotImplementedError",
            """def audit_watch_contract(contract, allowed_roots):
    failures = []
    if contract.get("root") not in allowed_roots:
        failures.append("root")
    event_kinds = set(contract.get("eventKinds", []))
    unknown = sorted(event_kinds - {"created", "modified", "moved", "deleted"})
    if not event_kinds or unknown:
        failures.append("events")
    if not contract.get("include"):
        failures.append("include")
    if contract.get("recursive", False) and not contract.get("excludeDirectories"):
        failures.append("recursive-excludes")
    return {"ready": not failures, "failures": failures, "unknownEvents": unknown}
""",
            "audit_watch_contract",
            [
                (
                    "accepts-bounded-nonrecursive-watch",
                    [{"root": "/inbox", "eventKinds": ["created", "moved"], "include": ["*.csv"], "recursive": False}, ["/inbox"]],
                    {"ready": True, "failures": [], "unknownEvents": []},
                ),
                (
                    "reports-root-event-and-filter",
                    [{"root": "/other", "eventKinds": ["opened"], "include": [], "recursive": False}, ["/inbox"]],
                    {"ready": False, "failures": ["root", "events", "include"], "unknownEvents": ["opened"]},
                ),
                (
                    "requires-recursive-excludes",
                    [{"root": "/inbox", "eventKinds": ["created"], "include": ["*.txt"], "recursive": True}, ["/inbox"]],
                    {"ready": False, "failures": ["recursive-excludes"], "unknownEvents": []},
                ),
            ],
            [
                "감시 시작 전에 root와 event 종류를 allowlist로 고정하세요.",
                "재귀 감시는 output·cache 같은 제외 디렉터리를 필수로 두세요.",
            ],
        ),
        "transfer": T(
            "watch-event-admission",
            "새 filesystem event에 감시 계약 적용 전이하기",
            "path root·suffix·event kind·directory 여부로 처리 대상만 선별한다.",
            "admit_watch_events(events, contract)를 완성하세요.",
            "def admit_watch_events(events, contract):\n    raise NotImplementedError",
            """def admit_watch_events(events, contract):
    accepted = []
    rejected = []
    for event in events:
        reasons = []
        if not event["path"].startswith(contract["root"].rstrip("/") + "/"):
            reasons.append("root")
        if event["kind"] not in contract["eventKinds"]:
            reasons.append("kind")
        if event.get("isDirectory", False):
            reasons.append("directory")
        if contract.get("suffixes") and not any(event["path"].endswith(suffix) for suffix in contract["suffixes"]):
            reasons.append("suffix")
        if reasons:
            rejected.append({"id": event["id"], "reasons": reasons})
        else:
            accepted.append(event["id"])
    return {"accepted": accepted, "rejected": rejected}
""",
            "admit_watch_events",
            [
                (
                    "accepts-matching-file",
                    [[{"id": "a", "path": "/inbox/a.csv", "kind": "created", "isDirectory": False}], {"root": "/inbox", "eventKinds": ["created"], "suffixes": [".csv"]}],
                    {"accepted": ["a"], "rejected": []},
                ),
                (
                    "reports-multiple-reasons",
                    [[{"id": "x", "path": "/other/a.txt", "kind": "deleted", "isDirectory": False}], {"root": "/inbox", "eventKinds": ["created"], "suffixes": [".csv"]}],
                    {"accepted": [], "rejected": [{"id": "x", "reasons": ["root", "kind", "suffix"]}]},
                ),
                (
                    "rejects-directory-event",
                    [[{"id": "d", "path": "/inbox/folder", "kind": "created", "isDirectory": True}], {"root": "/inbox", "eventKinds": ["created"], "suffixes": []}],
                    {"accepted": [], "rejected": [{"id": "d", "reasons": ["directory"]}]},
                ),
            ],
            [
                "event callback 안에서 바로 처리하지 말고 admission 계약을 먼저 적용하세요.",
                "거부 event는 원문 대신 ID와 사유만 ledger에 남기세요.",
            ],
        ),
        "retrieval": decision(
            "watch-foundation-recall",
            "파일 감시 시작 계약 회상하기",
            "root·event·filter·output loop 경계를 복원한다.",
            "choose_watch_boundary",
            {
                "root": {"action": "resolve allowed watch root", "evidence": "canonical root identity", "risk": "scope escape"},
                "event": {"action": "allowlist event kinds and files", "evidence": "admission decision", "risk": "noise"},
                "output": {"action": "exclude generated directories", "evidence": "exclude manifest", "risk": "self-trigger loop"},
            },
        ),
    },
    "02": {
        "mastery": T(
            "watch-event-normalization",
            "filesystem event를 source·destination identity로 정규화하기",
            "created·modified·moved·deleted event에 필요한 path 필드를 검사한다.",
            "normalize_watch_event(event)를 완성하세요.",
            "def normalize_watch_event(event):\n    raise NotImplementedError",
            """def normalize_watch_event(event):
    kind = event.get("kind")
    if kind not in {"created", "modified", "moved", "deleted"}:
        raise ValueError("unknown event kind")
    source = event.get("source")
    destination = event.get("destination")
    if not source:
        raise ValueError("source path required")
    if kind == "moved" and not destination:
        raise ValueError("destination path required")
    if kind != "moved" and destination:
        raise ValueError("unexpected destination")
    identity = f"{kind}:{source}" + (f"->{destination}" if destination else "")
    return {"kind": kind, "source": source, "destination": destination, "identity": identity}
""",
            "normalize_watch_event",
            [
                ("normalizes-created", [{"kind": "created", "source": "/in/a.txt"}], {"kind": "created", "source": "/in/a.txt", "destination": None, "identity": "created:/in/a.txt"}),
                ("normalizes-moved", [{"kind": "moved", "source": "/in/a.tmp", "destination": "/in/a.csv"}], {"kind": "moved", "source": "/in/a.tmp", "destination": "/in/a.csv", "identity": "moved:/in/a.tmp->/in/a.csv"}),
                ("rejects-moved-without-destination", [{"kind": "moved", "source": "/in/a"}], E("ValueError")),
                ("rejects-destination-on-modified", [{"kind": "modified", "source": "/in/a", "destination": "/in/b"}], E("ValueError")),
            ],
            [
                "moved event는 source와 destination을 모두 identity에 포함하세요.",
                "event kind마다 허용 path 필드를 엄격하게 검사하세요.",
            ],
        ),
        "transfer": T(
            "watch-event-sequence-audit",
            "새 event sequence에 불가능한 lifecycle 감사 전이하기",
            "파일별 created·modified·deleted 순서를 상태기계로 판정한다.",
            "audit_event_sequence(events)를 완성하세요.",
            "def audit_event_sequence(events):\n    raise NotImplementedError",
            """def audit_event_sequence(events):
    states = {}
    failures = []
    for event in events:
        path = event["path"]
        state = states.get(path, "absent")
        kind = event["kind"]
        valid = (state, kind) in {("absent", "created"), ("present", "modified"), ("present", "deleted")}
        if not valid:
            failures.append({"id": event["id"], "state": state, "kind": kind})
            continue
        states[path] = "absent" if kind == "deleted" else "present"
    return {"accepted": not failures, "failures": failures, "states": dict(sorted(states.items()))}
""",
            "audit_event_sequence",
            [
                (
                    "accepts-create-modify-delete",
                    [[{"id": "1", "path": "/a", "kind": "created"}, {"id": "2", "path": "/a", "kind": "modified"}, {"id": "3", "path": "/a", "kind": "deleted"}]],
                    {"accepted": True, "failures": [], "states": {"/a": "absent"}},
                ),
                (
                    "reports-modify-before-create",
                    [[{"id": "1", "path": "/a", "kind": "modified"}]],
                    {"accepted": False, "failures": [{"id": "1", "state": "absent", "kind": "modified"}], "states": {}},
                ),
                (
                    "keeps-independent-path-states",
                    [[{"id": "1", "path": "/b", "kind": "created"}, {"id": "2", "path": "/a", "kind": "created"}]],
                    {"accepted": True, "failures": [], "states": {"/a": "present", "/b": "present"}},
                ),
            ],
            [
                "event 수만 세지 말고 path별 lifecycle state를 유지하세요.",
                "불가능한 순서를 조용히 보정하지 말고 event ID와 이전 state를 남기세요.",
            ],
        ),
        "retrieval": decision(
            "watch-event-types-recall",
            "파일 event 종류별 identity 회상하기",
            "생성·수정·이동·삭제의 path 근거를 구분한다.",
            "choose_event_identity",
            {
                "created-modified": {"action": "bind source path and file fingerprint", "evidence": "event kind and source", "risk": "duplicate callback"},
                "moved": {"action": "bind source and destination", "evidence": "move identity", "risk": "treating as two unrelated files"},
                "deleted": {"action": "retain pre-delete identity", "evidence": "last known descriptor", "risk": "missing artifact"},
            },
        ),
    },
    "03": {
        "mastery": T(
            "debounce-event-groups",
            "같은 path의 연속 event를 debounce window로 묶기",
            "마지막 event 시각 기준으로 group을 나누고 원본 event ID를 보존한다.",
            "group_debounced_events(events, window_ms)를 완성하세요.",
            "def group_debounced_events(events, window_ms):\n    raise NotImplementedError",
            """def group_debounced_events(events, window_ms):
    if window_ms < 0:
        raise ValueError("negative debounce window")
    groups = []
    for event in sorted(events, key=lambda item: (item["path"], item["atMs"], item["id"])):
        if not groups or groups[-1]["path"] != event["path"] or event["atMs"] - groups[-1]["lastAtMs"] > window_ms:
            groups.append({"path": event["path"], "firstAtMs": event["atMs"], "lastAtMs": event["atMs"], "eventIds": [event["id"]]})
        else:
            groups[-1]["lastAtMs"] = event["atMs"]
            groups[-1]["eventIds"].append(event["id"])
    return groups
""",
            "group_debounced_events",
            [
                (
                    "groups-nearby-same-path-events",
                    [[{"id": "a", "path": "/x", "atMs": 0}, {"id": "b", "path": "/x", "atMs": 50}], 100],
                    [{"path": "/x", "firstAtMs": 0, "lastAtMs": 50, "eventIds": ["a", "b"]}],
                ),
                (
                    "splits-distant-events",
                    [[{"id": "a", "path": "/x", "atMs": 0}, {"id": "b", "path": "/x", "atMs": 101}], 100],
                    [{"path": "/x", "firstAtMs": 0, "lastAtMs": 0, "eventIds": ["a"]}, {"path": "/x", "firstAtMs": 101, "lastAtMs": 101, "eventIds": ["b"]}],
                ),
                (
                    "separates-paths",
                    [[{"id": "b", "path": "/b", "atMs": 1}, {"id": "a", "path": "/a", "atMs": 1}], 100],
                    [{"path": "/a", "firstAtMs": 1, "lastAtMs": 1, "eventIds": ["a"]}, {"path": "/b", "firstAtMs": 1, "lastAtMs": 1, "eventIds": ["b"]}],
                ),
                ("rejects-negative-window", [[], -1], E("ValueError")),
            ],
            [
                "debounce는 첫 event가 아니라 마지막 event 시각으로 window를 연장하세요.",
                "합쳐진 group에도 모든 원본 event ID를 보존하세요.",
            ],
        ),
        "transfer": T(
            "file-stability-audit",
            "새 파일에 크기·수정시각 안정화 판정 전이하기",
            "연속 동일 fingerprint sample 수가 기준에 도달했는지 검사한다.",
            "audit_file_stability(samples, required_consecutive)를 완성하세요.",
            "def audit_file_stability(samples, required_consecutive):\n    raise NotImplementedError",
            """def audit_file_stability(samples, required_consecutive):
    if required_consecutive <= 0:
        raise ValueError("required consecutive must be positive")
    streak = 0
    previous = None
    maximum_streak = 0
    for sample in samples:
        fingerprint = (sample["size"], sample["modifiedNs"])
        streak = streak + 1 if fingerprint == previous else 1
        previous = fingerprint
        maximum_streak = max(maximum_streak, streak)
    return {"stable": maximum_streak >= required_consecutive, "maximumStreak": maximum_streak, "sampleCount": len(samples), "finalFingerprint": list(previous) if previous else None}
""",
            "audit_file_stability",
            [
                (
                    "accepts-three-identical-samples",
                    [[{"size": 10, "modifiedNs": 1}, {"size": 10, "modifiedNs": 1}, {"size": 10, "modifiedNs": 1}], 3],
                    {"stable": True, "maximumStreak": 3, "sampleCount": 3, "finalFingerprint": [10, 1]},
                ),
                (
                    "rejects-changing-file",
                    [[{"size": 10, "modifiedNs": 1}, {"size": 11, "modifiedNs": 2}], 2],
                    {"stable": False, "maximumStreak": 1, "sampleCount": 2, "finalFingerprint": [11, 2]},
                ),
                (
                    "handles-empty-samples",
                    [[], 1],
                    {"stable": False, "maximumStreak": 0, "sampleCount": 0, "finalFingerprint": None},
                ),
            ],
            [
                "debounce 종료와 파일 write 완료를 같은 것으로 보지 마세요.",
                "size와 modified time이 연속으로 같을 때만 처리 단계로 넘기세요.",
            ],
        ),
        "retrieval": decision(
            "debounce-stability-recall",
            "debounce와 파일 안정화 차이 회상하기",
            "event group과 content fingerprint 안정 근거를 구분한다.",
            "choose_debounce_stability",
            {
                "debounce": {"action": "group callbacks by path and time", "evidence": "event IDs and window", "risk": "callback burst"},
                "stability": {"action": "sample size and modified time", "evidence": "consecutive fingerprints", "risk": "partial file"},
                "process": {"action": "claim ledger identity then handle", "evidence": "stable fingerprint and claim", "risk": "duplicate worker"},
            },
        ),
    },
    "04": {
        "mastery": T(
            "recursive-watch-filter",
            "재귀 감시 path의 include·exclude·depth 판정하기",
            "root 상대 path를 기준으로 directory 제외와 최대 depth를 적용한다.",
            "filter_recursive_paths(paths, root, excluded_parts, maximum_depth)를 완성하세요.",
            "def filter_recursive_paths(paths, root, excluded_parts, maximum_depth):\n    raise NotImplementedError",
            """def filter_recursive_paths(paths, root, excluded_parts, maximum_depth):
    from pathlib import PurePosixPath
    root_path = PurePosixPath(root)
    accepted = []
    rejected = []
    for value in paths:
        path = PurePosixPath(value)
        try:
            relative = path.relative_to(root_path)
        except ValueError:
            rejected.append({"path": value, "reason": "root"})
            continue
        if any(part in excluded_parts for part in relative.parts[:-1]):
            rejected.append({"path": value, "reason": "excluded"})
        elif len(relative.parts) - 1 > maximum_depth:
            rejected.append({"path": value, "reason": "depth"})
        else:
            accepted.append(value)
    return {"accepted": accepted, "rejected": rejected}
""",
            "filter_recursive_paths",
            [
                (
                    "accepts-within-depth",
                    [["/root/a.txt", "/root/sub/b.txt"], "/root", ["output"], 1],
                    {"accepted": ["/root/a.txt", "/root/sub/b.txt"], "rejected": []},
                ),
                (
                    "rejects-excluded-directory",
                    [["/root/output/a.txt"], "/root", ["output"], 3],
                    {"accepted": [], "rejected": [{"path": "/root/output/a.txt", "reason": "excluded"}]},
                ),
                (
                    "rejects-depth-and-root",
                    [["/root/a/b/c.txt", "/other/x.txt"], "/root", [], 1],
                    {"accepted": [], "rejected": [{"path": "/root/a/b/c.txt", "reason": "depth"}, {"path": "/other/x.txt", "reason": "root"}]},
                ),
            ],
            [
                "문자열 prefix가 아니라 root 상대 path 구조로 scope를 검사하세요.",
                "생성 output directory와 최대 재귀 depth를 명시하세요.",
            ],
        ),
        "transfer": T(
            "symlink-watch-audit",
            "새 재귀 감시에 symlink 경계 감사 전이하기",
            "resolved target이 허용 root 밖이거나 cycle identity를 만들면 차단한다.",
            "audit_watch_links(links, allowed_root)를 완성하세요.",
            "def audit_watch_links(links, allowed_root):\n    raise NotImplementedError",
            """def audit_watch_links(links, allowed_root):
    accepted = []
    rejected = []
    seen_targets = set()
    prefix = allowed_root.rstrip("/") + "/"
    for link in links:
        target = link["target"]
        if not (target == allowed_root or target.startswith(prefix)):
            rejected.append({"path": link["path"], "reason": "target-outside-root"})
        elif target in seen_targets:
            rejected.append({"path": link["path"], "reason": "duplicate-target"})
        else:
            accepted.append(link["path"])
            seen_targets.add(target)
    return {"accepted": accepted, "rejected": rejected}
""",
            "audit_watch_links",
            [
                (
                    "accepts-in-root-link",
                    [[{"path": "/root/link", "target": "/root/data"}], "/root"],
                    {"accepted": ["/root/link"], "rejected": []},
                ),
                (
                    "rejects-outside-target",
                    [[{"path": "/root/link", "target": "/secret"}], "/root"],
                    {"accepted": [], "rejected": [{"path": "/root/link", "reason": "target-outside-root"}]},
                ),
                (
                    "rejects-duplicate-target",
                    [[{"path": "/root/a", "target": "/root/data"}, {"path": "/root/b", "target": "/root/data"}], "/root"],
                    {"accepted": ["/root/a"], "rejected": [{"path": "/root/b", "reason": "duplicate-target"}]},
                ),
            ],
            [
                "symlink path가 root 안이어도 resolved target을 다시 검사하세요.",
                "같은 target으로 이어지는 중복 link는 반복 감시를 막기 위해 격리하세요.",
            ],
        ),
        "retrieval": decision(
            "recursive-watch-recall",
            "재귀 감시 경계 회상하기",
            "depth·exclude·symlink target 근거를 복원한다.",
            "choose_recursive_watch_gate",
            {
                "depth": {"action": "bound root-relative depth", "evidence": "relative parts", "risk": "unbounded tree"},
                "exclude": {"action": "exclude output cache temp", "evidence": "directory allow and deny list", "risk": "self-trigger loop"},
                "symlink": {"action": "resolve and deduplicate target", "evidence": "link and target identities", "risk": "root escape or cycle"},
            },
        ),
    },
    "06": {
        "mastery": T(
            "scheduler-job-contract",
            "APScheduler job의 timezone·misfire·coalesce 계약 감사하기",
            "중복 실행과 지연 실행 정책을 명시한 job만 등록한다.",
            "audit_scheduler_job(job, allowed_timezones)를 완성하세요.",
            "def audit_scheduler_job(job, allowed_timezones):\n    raise NotImplementedError",
            """def audit_scheduler_job(job, allowed_timezones):
    failures = []
    if job.get("timezone") not in allowed_timezones:
        failures.append("timezone")
    if job.get("misfireGraceSeconds", 0) <= 0:
        failures.append("misfire-grace")
    if not isinstance(job.get("coalesce"), bool):
        failures.append("coalesce")
    if job.get("maximumInstances", 0) <= 0:
        failures.append("maximum-instances")
    if job.get("replaceExisting", False) and not job.get("id"):
        failures.append("stable-id")
    return {"ready": not failures, "failures": failures, "jobId": job.get("id")}
""",
            "audit_scheduler_job",
            [
                (
                    "accepts-bounded-job",
                    [{"id": "daily-report", "timezone": "Asia/Seoul", "misfireGraceSeconds": 60, "coalesce": True, "maximumInstances": 1, "replaceExisting": True}, ["Asia/Seoul"]],
                    {"ready": True, "failures": [], "jobId": "daily-report"},
                ),
                (
                    "reports-missing-policies",
                    [{"timezone": "UTC", "misfireGraceSeconds": 0, "coalesce": "yes", "maximumInstances": 0, "replaceExisting": True}, ["Asia/Seoul"]],
                    {"ready": False, "failures": ["timezone", "misfire-grace", "coalesce", "maximum-instances", "stable-id"], "jobId": None},
                ),
                (
                    "accepts-nonreplacing-anonymous-job",
                    [{"timezone": "UTC", "misfireGraceSeconds": 10, "coalesce": False, "maximumInstances": 2, "replaceExisting": False}, ["UTC"]],
                    {"ready": True, "failures": [], "jobId": None},
                ),
            ],
            [
                "timezone과 misfire 처리 방식을 job 등록 시점에 고정하세요.",
                "replaceExisting을 쓰려면 재시작 뒤에도 같은 stable job ID를 사용하세요.",
            ],
        ),
        "transfer": T(
            "misfire-decision",
            "새 지연 실행에 misfire·coalesce 판정 전이하기",
            "예정 시각 목록과 현재 시각, grace로 실행할 fire를 결정한다.",
            "resolve_misfires(scheduled_times, now, grace_seconds, coalesce)를 완성하세요.",
            "def resolve_misfires(scheduled_times, now, grace_seconds, coalesce):\n    raise NotImplementedError",
            """def resolve_misfires(scheduled_times, now, grace_seconds, coalesce):
    eligible = [value for value in scheduled_times if 0 <= now - value <= grace_seconds]
    expired = [value for value in scheduled_times if now - value > grace_seconds]
    future = [value for value in scheduled_times if value > now]
    execute = [eligible[-1]] if coalesce and eligible else eligible
    skipped_coalesced = eligible[:-1] if coalesce else []
    return {"execute": execute, "expired": expired, "future": future, "coalesced": skipped_coalesced}
""",
            "resolve_misfires",
            [
                (
                    "coalesces-eligible-fires",
                    [[90, 95, 110], 100, 20, True],
                    {"execute": [95], "expired": [], "future": [110], "coalesced": [90]},
                ),
                (
                    "executes-all-without-coalesce",
                    [[80, 90, 95], 100, 15, False],
                    {"execute": [90, 95], "expired": [80], "future": [], "coalesced": []},
                ),
                (
                    "handles-no-eligible-fire",
                    [[10, 200], 100, 20, True],
                    {"execute": [], "expired": [10], "future": [200], "coalesced": []},
                ),
            ],
            [
                "지연된 fire를 모두 실행할지 최신 하나로 합칠지 명시하세요.",
                "grace 밖 fire와 미래 fire를 별도 목록으로 남기세요.",
            ],
        ),
        "retrieval": decision(
            "apscheduler-policy-recall",
            "APScheduler job 정책 회상하기",
            "timezone·misfire·coalesce·instance 제한을 구분한다.",
            "choose_scheduler_policy",
            {
                "time": {"action": "bind IANA timezone", "evidence": "zone and next fire", "risk": "DST shift"},
                "delay": {"action": "apply misfire grace and coalesce", "evidence": "eligible expired skipped fires", "risk": "backlog burst"},
                "concurrency": {"action": "bound maximum instances", "evidence": "active job count", "risk": "overlapping mutation"},
            },
        ),
    },
    "07": {
        "mastery": T(
            "cron-field-parse",
            "제한된 cron minute·hour field를 값 집합으로 파싱하기",
            "wildcard·목록·단일 숫자의 범위를 검사해 예정 조합을 반환한다.",
            "parse_cron_fields(minute_field, hour_field)를 완성하세요.",
            "def parse_cron_fields(minute_field, hour_field):\n    raise NotImplementedError",
            """def parse_cron_fields(minute_field, hour_field):
    def parse(field, minimum, maximum):
        if field == "*":
            return list(range(minimum, maximum + 1))
        values = []
        for part in field.split(","):
            if not part.isdigit():
                raise ValueError("unsupported cron field")
            value = int(part)
            if not minimum <= value <= maximum:
                raise ValueError("cron value out of range")
            values.append(value)
        return sorted(set(values))
    minutes = parse(minute_field, 0, 59)
    hours = parse(hour_field, 0, 23)
    return {"minutes": minutes, "hours": hours, "dailyFireCount": len(minutes) * len(hours)}
""",
            "parse_cron_fields",
            [
                ("parses-single-time", ["30", "9"], {"minutes": [30], "hours": [9], "dailyFireCount": 1}),
                ("parses-deduplicated-lists", ["0,30,0", "9,18"], {"minutes": [0, 30], "hours": [9, 18], "dailyFireCount": 4}),
                ("rejects-minute-out-of-range", ["60", "9"], E("ValueError")),
                ("rejects-unsupported-step", ["*/5", "9"], E("ValueError")),
            ],
            [
                "지원하는 cron 문법 범위를 명시하고 모르는 표현을 추측하지 마세요.",
                "중복 값을 제거한 뒤 하루 예상 fire 수를 계산하세요.",
            ],
        ),
        "transfer": T(
            "cron-fire-audit",
            "새 cron schedule에 과도한 fire·업무시간 감사 전이하기",
            "하루 fire 수와 허용 hour 범위를 정책과 비교한다.",
            "audit_cron_schedule(minutes, hours, maximum_daily_fires, allowed_hours)를 완성하세요.",
            "def audit_cron_schedule(minutes, hours, maximum_daily_fires, allowed_hours):\n    raise NotImplementedError",
            """def audit_cron_schedule(minutes, hours, maximum_daily_fires, allowed_hours):
    fire_count = len(set(minutes)) * len(set(hours))
    outside = sorted(set(hours) - set(allowed_hours))
    failures = []
    if fire_count > maximum_daily_fires:
        failures.append("fire-budget")
    if outside:
        failures.append("hours")
    if not minutes or not hours:
        failures.append("empty")
    return {"accepted": not failures, "failures": failures, "dailyFireCount": fire_count, "outsideHours": outside}
""",
            "audit_cron_schedule",
            [
                (
                    "accepts-two-business-hour-fires",
                    [[0], [9, 18], 3, list(range(9, 19))],
                    {"accepted": True, "failures": [], "dailyFireCount": 2, "outsideHours": []},
                ),
                (
                    "reports-budget-and-hours",
                    [[0, 30], [1, 2], 2, [9]],
                    {"accepted": False, "failures": ["fire-budget", "hours"], "dailyFireCount": 4, "outsideHours": [1, 2]},
                ),
                (
                    "reports-empty-schedule",
                    [[], [9], 1, [9]],
                    {"accepted": False, "failures": ["empty"], "dailyFireCount": 0, "outsideHours": []},
                ),
            ],
            [
                "cron 문자열이 유효해도 하루 실행 budget을 초과할 수 있습니다.",
                "허용 업무시간 밖 fire를 별도 실패로 표시하세요.",
            ],
        ),
        "retrieval": decision(
            "cron-expression-recall",
            "cron 표현식 검증 원칙 회상하기",
            "문법·timezone·fire budget 근거를 복원한다.",
            "choose_cron_evidence",
            {
                "syntax": {"action": "parse supported fields strictly", "evidence": "normalized value sets", "risk": "unsupported syntax"},
                "timezone": {"action": "bind schedule timezone", "evidence": "zone and DST fixtures", "risk": "shifted fire"},
                "budget": {"action": "count daily fires and hours", "evidence": "fire count and outside hours", "risk": "runaway schedule"},
            },
        ),
    },
    "08": {
        "mastery": T(
            "persistent-job-record",
            "영속 schedule job record의 version·callable·args 감사하기",
            "재시작 뒤 복원 가능한 stable schema와 secret 비저장 원칙을 검사한다.",
            "audit_persistent_job(record, current_schema_version, secret_keys)를 완성하세요.",
            "def audit_persistent_job(record, current_schema_version, secret_keys):\n    raise NotImplementedError",
            """def audit_persistent_job(record, current_schema_version, secret_keys):
    failures = []
    if record.get("schemaVersion") != current_schema_version:
        failures.append("schema-version")
    if not record.get("id") or not record.get("callable"):
        failures.append("identity")
    argument_keys = set(record.get("kwargs", {}))
    exposed = sorted(argument_keys & set(secret_keys))
    if exposed:
        failures.append("secrets")
    if not record.get("nextRunAt"):
        failures.append("next-run")
    return {"restorable": not failures, "failures": failures, "exposedSecretKeys": exposed, "jobId": record.get("id")}
""",
            "audit_persistent_job",
            [
                (
                    "accepts-versioned-job",
                    [{"schemaVersion": 2, "id": "report", "callable": "jobs.report", "kwargs": {"region": "kr"}, "nextRunAt": "2026-07-23T00:00:00+09:00"}, 2, ["token"]],
                    {"restorable": True, "failures": [], "exposedSecretKeys": [], "jobId": "report"},
                ),
                (
                    "reports-version-secret-and-next-run",
                    [{"schemaVersion": 1, "id": "report", "callable": "jobs.report", "kwargs": {"token": "abc"}}, 2, ["token"]],
                    {"restorable": False, "failures": ["schema-version", "secrets", "next-run"], "exposedSecretKeys": ["token"], "jobId": "report"},
                ),
                (
                    "reports-missing-identity",
                    [{"schemaVersion": 2, "kwargs": {}, "nextRunAt": "later"}, 2, []],
                    {"restorable": False, "failures": ["identity"], "exposedSecretKeys": [], "jobId": None},
                ),
            ],
            [
                "영속 job에는 import 가능한 callable identity와 schema version을 저장하세요.",
                "token 값을 kwargs에 직렬화하지 말고 실행 시점 secret store에서 주입하세요.",
            ],
        ),
        "transfer": T(
            "job-store-reconciliation",
            "새 재시작에 원하는 job과 저장된 job reconciliation 전이하기",
            "create·update·remove·unchanged 계획을 stable ID로 계산한다.",
            "reconcile_jobs(desired, stored)를 완성하세요.",
            "def reconcile_jobs(desired, stored):\n    raise NotImplementedError",
            """def reconcile_jobs(desired, stored):
    desired_map = {job["id"]: job["definitionHash"] for job in desired}
    stored_map = {job["id"]: job["definitionHash"] for job in stored}
    create = sorted(set(desired_map) - set(stored_map))
    remove = sorted(set(stored_map) - set(desired_map))
    update = sorted(job_id for job_id in set(desired_map) & set(stored_map) if desired_map[job_id] != stored_map[job_id])
    unchanged = sorted(job_id for job_id in set(desired_map) & set(stored_map) if desired_map[job_id] == stored_map[job_id])
    return {"create": create, "update": update, "remove": remove, "unchanged": unchanged}
""",
            "reconcile_jobs",
            [
                (
                    "computes-all-reconciliation-actions",
                    [[{"id": "new", "definitionHash": "n"}, {"id": "change", "definitionHash": "b"}, {"id": "same", "definitionHash": "a"}], [{"id": "old", "definitionHash": "o"}, {"id": "change", "definitionHash": "a"}, {"id": "same", "definitionHash": "a"}]],
                    {"create": ["new"], "update": ["change"], "remove": ["old"], "unchanged": ["same"]},
                ),
                (
                    "handles-empty-store",
                    [[{"id": "a", "definitionHash": "x"}], []],
                    {"create": ["a"], "update": [], "remove": [], "unchanged": []},
                ),
                (
                    "handles-identical-sets",
                    [[{"id": "a", "definitionHash": "x"}], [{"id": "a", "definitionHash": "x"}]],
                    {"create": [], "update": [], "remove": [], "unchanged": ["a"]},
                ),
            ],
            [
                "재시작마다 job을 추가하지 말고 stable ID와 definition hash로 reconcile하세요.",
                "저장소에만 남은 job도 remove 계획에 포함하세요.",
            ],
        ),
        "retrieval": decision(
            "persistent-schedule-recall",
            "영속 schedule 복원 원칙 회상하기",
            "schema·secret·reconciliation 근거를 복원한다.",
            "choose_persistent_schedule",
            {
                "record": {"action": "store versioned stable job identity", "evidence": "schema callable next run", "risk": "unrestorable closure"},
                "secret": {"action": "store reference not value", "evidence": "secret key identity", "risk": "database leakage"},
                "restart": {"action": "reconcile by definition hash", "evidence": "create update remove plan", "risk": "duplicate job"},
            },
        ),
    },
    "09": {
        "mastery": T(
            "scheduled-retry-decision",
            "schedule job 실패의 재시도·다음 정규 실행 판정하기",
            "실패 class와 idempotency, 정규 fire 충돌을 함께 검사한다.",
            "decide_scheduled_retry(failure, idempotent, attempt, maximum_attempts, retry_at, next_regular_at)를 완성하세요.",
            "def decide_scheduled_retry(failure, idempotent, attempt, maximum_attempts, retry_at, next_regular_at):\n    raise NotImplementedError",
            """def decide_scheduled_retry(failure, idempotent, attempt, maximum_attempts, retry_at, next_regular_at):
    retryable = failure in {"timeout", "temporary-unavailable", "resource-busy"}
    reasons = []
    if not retryable:
        reasons.append("failure-class")
    if not idempotent:
        reasons.append("non-idempotent")
    if attempt >= maximum_attempts:
        reasons.append("attempt-limit")
    if retry_at >= next_regular_at:
        reasons.append("regular-fire-conflict")
    return {"retry": not reasons, "reasons": reasons, "attempt": attempt, "retryAt": retry_at if not reasons else None}
""",
            "decide_scheduled_retry",
            [
                (
                    "allows-bounded-idempotent-retry",
                    ["timeout", True, 1, 3, 110, 200],
                    {"retry": True, "reasons": [], "attempt": 1, "retryAt": 110},
                ),
                (
                    "reports-nonretryable-and-nonidempotent",
                    ["invalid-input", False, 1, 3, 110, 200],
                    {"retry": False, "reasons": ["failure-class", "non-idempotent"], "attempt": 1, "retryAt": None},
                ),
                (
                    "reports-limit-and-regular-conflict",
                    ["timeout", True, 3, 3, 210, 200],
                    {"retry": False, "reasons": ["attempt-limit", "regular-fire-conflict"], "attempt": 3, "retryAt": None},
                ),
            ],
            [
                "재시도가 다음 정규 fire와 겹치면 별도 run을 만들지 마세요.",
                "failure class·idempotency·attempt limit을 모두 통과해야 재시도하세요.",
            ],
        ),
        "transfer": T(
            "job-attempt-ledger",
            "새 job attempt sequence에 중복·최종 상태 감사 전이하기",
            "job ID·scheduled time·attempt 쌍의 유일성과 최종 결과를 계산한다.",
            "audit_job_attempts(attempts)를 완성하세요.",
            "def audit_job_attempts(attempts):\n    raise NotImplementedError",
            """def audit_job_attempts(attempts):
    seen = set()
    duplicates = []
    by_fire = {}
    for item in attempts:
        identity = (item["jobId"], item["scheduledAt"], item["attempt"])
        if identity in seen:
            duplicates.append(f"{item['jobId']}@{item['scheduledAt']}#{item['attempt']}")
        seen.add(identity)
        key = f"{item['jobId']}@{item['scheduledAt']}"
        by_fire.setdefault(key, []).append(item)
    final = {key: sorted(items, key=lambda item: item["attempt"])[-1]["status"] for key, items in sorted(by_fire.items())}
    return {"accepted": not duplicates, "duplicates": duplicates, "finalStatus": final, "attemptCount": len(attempts)}
""",
            "audit_job_attempts",
            [
                (
                    "summarizes-retry-final-status",
                    [[{"jobId": "a", "scheduledAt": 100, "attempt": 1, "status": "failed"}, {"jobId": "a", "scheduledAt": 100, "attempt": 2, "status": "passed"}]],
                    {"accepted": True, "duplicates": [], "finalStatus": {"a@100": "passed"}, "attemptCount": 2},
                ),
                (
                    "reports-duplicate-attempt",
                    [[{"jobId": "a", "scheduledAt": 100, "attempt": 1, "status": "failed"}, {"jobId": "a", "scheduledAt": 100, "attempt": 1, "status": "passed"}]],
                    {"accepted": False, "duplicates": ["a@100#1"], "finalStatus": {"a@100": "passed"}, "attemptCount": 2},
                ),
                (
                    "separates-scheduled-fires",
                    [[{"jobId": "a", "scheduledAt": 100, "attempt": 1, "status": "passed"}, {"jobId": "a", "scheduledAt": 200, "attempt": 1, "status": "failed"}]],
                    {"accepted": True, "duplicates": [], "finalStatus": {"a@100": "passed", "a@200": "failed"}, "attemptCount": 2},
                ),
            ],
            [
                "job ID만으로 attempt를 묶지 말고 scheduled fire identity를 포함하세요.",
                "재시도 뒤 pass라도 모든 attempt 상태를 ledger에 보존하세요.",
            ],
        ),
        "retrieval": decision(
            "schedule-retry-recall",
            "schedule 실패·재시도 원칙 회상하기",
            "failure class·fire identity·정규 실행 충돌을 복원한다.",
            "choose_schedule_retry",
            {
                "classify": {"action": "separate transient and contract failure", "evidence": "failure class", "risk": "blind retry"},
                "identity": {"action": "bind job scheduled fire attempt", "evidence": "attempt ledger", "risk": "duplicate run"},
                "conflict": {"action": "compare retry with next regular fire", "evidence": "two timestamps", "risk": "overlapping work"},
            },
        ),
    },
    "10": {
        "mastery": T(
            "folder-reporter-capstone",
            "폴더 감시 reporter의 event·file·report reconciliation 감사하기",
            "accepted event마다 안정 파일과 report row가 정확히 하나 있는지 판정한다.",
            "audit_folder_report(events, stable_files, report_rows)를 완성하세요.",
            "def audit_folder_report(events, stable_files, report_rows):\n    raise NotImplementedError",
            """def audit_folder_report(events, stable_files, report_rows):
    event_ids = {event["id"] for event in events if event.get("accepted", False)}
    stable_ids = {item["eventId"] for item in stable_files}
    row_counts = {}
    for row in report_rows:
        row_counts[row["eventId"]] = row_counts.get(row["eventId"], 0) + 1
    missing_stable = sorted(event_ids - stable_ids)
    missing_rows = sorted(event_ids - set(row_counts))
    duplicate_rows = sorted(event_id for event_id, count in row_counts.items() if count > 1)
    unexpected_rows = sorted(set(row_counts) - event_ids)
    failures = []
    if missing_stable:
        failures.append("stability")
    if missing_rows:
        failures.append("missing-report")
    if duplicate_rows:
        failures.append("duplicate-report")
    if unexpected_rows:
        failures.append("unexpected-report")
    return {"passed": not failures, "failures": failures, "missingStable": missing_stable, "missingRows": missing_rows, "duplicateRows": duplicate_rows, "unexpectedRows": unexpected_rows}
""",
            "audit_folder_report",
            [
                (
                    "accepts-one-row-per-stable-event",
                    [[{"id": "a", "accepted": True}], [{"eventId": "a"}], [{"eventId": "a"}]],
                    {"passed": True, "failures": [], "missingStable": [], "missingRows": [], "duplicateRows": [], "unexpectedRows": []},
                ),
                (
                    "reports-stability-and-missing-row",
                    [[{"id": "a", "accepted": True}], [], []],
                    {"passed": False, "failures": ["stability", "missing-report"], "missingStable": ["a"], "missingRows": ["a"], "duplicateRows": [], "unexpectedRows": []},
                ),
                (
                    "reports-duplicate-and-unexpected-row",
                    [[{"id": "a", "accepted": True}], [{"eventId": "a"}], [{"eventId": "a"}, {"eventId": "a"}, {"eventId": "x"}]],
                    {"passed": False, "failures": ["duplicate-report", "unexpected-report"], "missingStable": [], "missingRows": [], "duplicateRows": ["a"], "unexpectedRows": ["x"]},
                ),
            ],
            [
                "callback 수가 아니라 accepted event와 report row를 identity로 reconcile하세요.",
                "파일 안정성 증거가 없는 event를 report에 포함하지 마세요.",
            ],
        ),
        "transfer": T(
            "folder-reporter-release",
            "새 폴더 reporter 실행에 재시작·중복·artifact gate 전이하기",
            "같은 source와 watch contract에서 두 번 실행해 report hash가 같은지 판정한다.",
            "decide_reporter_release(runs, current_source_hash, current_contract_hash)를 완성하세요.",
            "def decide_reporter_release(runs, current_source_hash, current_contract_hash):\n    raise NotImplementedError",
            """def decide_reporter_release(runs, current_source_hash, current_contract_hash):
    current = [run for run in runs if run["sourceHash"] == current_source_hash and run["contractHash"] == current_contract_hash]
    stale = sorted(run["id"] for run in runs if run not in current)
    failures = []
    if len(current) < 2:
        failures.append("restart-evidence")
    report_hashes = {run["reportHash"] for run in current if run.get("passed")}
    if len(report_hashes) != 1 or any(not run.get("passed") for run in current):
        failures.append("determinism")
    if any(run.get("duplicateRows", 0) for run in current):
        failures.append("duplicates")
    return {"releaseReady": not failures and not stale, "failures": failures, "staleRuns": stale, "currentRunCount": len(current)}
""",
            "decide_reporter_release",
            [
                (
                    "accepts-two-deterministic-current-runs",
                    [[{"id": "a", "sourceHash": "s", "contractHash": "c", "reportHash": "r", "passed": True, "duplicateRows": 0}, {"id": "b", "sourceHash": "s", "contractHash": "c", "reportHash": "r", "passed": True, "duplicateRows": 0}], "s", "c"],
                    {"releaseReady": True, "failures": [], "staleRuns": [], "currentRunCount": 2},
                ),
                (
                    "reports-single-run-and-duplicate",
                    [[{"id": "a", "sourceHash": "s", "contractHash": "c", "reportHash": "r", "passed": True, "duplicateRows": 1}], "s", "c"],
                    {"releaseReady": False, "failures": ["restart-evidence", "duplicates"], "staleRuns": [], "currentRunCount": 1},
                ),
                (
                    "rejects-stale-run",
                    [[{"id": "old", "sourceHash": "old", "contractHash": "c", "reportHash": "r", "passed": True}, {"id": "a", "sourceHash": "s", "contractHash": "c", "reportHash": "r", "passed": True}, {"id": "b", "sourceHash": "s", "contractHash": "c", "reportHash": "r", "passed": True}], "s", "c"],
                    {"releaseReady": False, "failures": [], "staleRuns": ["old"], "currentRunCount": 2},
                ),
            ],
            [
                "재시작 뒤 같은 input에서 같은 report hash가 나오는지 검증하세요.",
                "현재 source·watch contract와 다른 run은 release evidence에서 제외하세요.",
            ],
        ),
        "retrieval": decision(
            "folder-reporter-capstone-recall",
            "폴더 감시 reporter 종료 조건 회상하기",
            "event·stability·ledger·report·restart 근거를 복원한다.",
            "choose_folder_reporter_gate",
            {
                "input": {"action": "admit debounce and stabilize event", "evidence": "event IDs and file fingerprint", "risk": "partial duplicate input"},
                "process": {"action": "claim idempotency ledger", "evidence": "single owner and attempts", "risk": "concurrent duplicate"},
                "release": {"action": "reconcile report and restart run", "evidence": "source-bound deterministic artifact", "risk": "stale or duplicated row"},
            },
        ),
    },
}
