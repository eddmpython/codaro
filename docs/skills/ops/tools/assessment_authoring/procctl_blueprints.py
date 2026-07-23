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
            "process 실행 성공과 업무 결과물 성공을 같은 것으로 처리하지 마세요.",
            "명령 identity·제한 시간·산출물 evidence·남는 risk를 함께 기록하세요.",
        ],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "01": {
        "mastery": T(
            "subprocess-result-audit",
            "subprocess 결과의 return code·출력·산출물 판정하기",
            "프로세스 종료와 기대 산출물 생성을 분리해 성공 여부를 결정한다.",
            "audit_process_result(result, expected_artifacts)를 완성하세요.",
            "def audit_process_result(result, expected_artifacts):\n    raise NotImplementedError",
            """def audit_process_result(result, expected_artifacts):
    failures = []
    if result.get("returnCode") != 0:
        failures.append("return-code")
    produced = set(result.get("artifacts", []))
    missing = sorted(set(expected_artifacts) - produced)
    if missing:
        failures.append("artifacts")
    if result.get("stderr", "").strip() and not result.get("stderrAllowed", False):
        failures.append("stderr")
    return {"passed": not failures, "failures": failures, "missingArtifacts": missing, "stdoutLines": len(result.get("stdout", "").splitlines())}
""",
            "audit_process_result",
            [
                (
                    "accepts-zero-with-artifact",
                    [{"returnCode": 0, "stdout": "done\n", "stderr": "", "artifacts": ["report.json"]}, ["report.json"]],
                    {"passed": True, "failures": [], "missingArtifacts": [], "stdoutLines": 1},
                ),
                (
                    "reports-code-and-artifact",
                    [{"returnCode": 2, "stdout": "", "stderr": "failed", "artifacts": []}, ["report.json"]],
                    {"passed": False, "failures": ["return-code", "artifacts", "stderr"], "missingArtifacts": ["report.json"], "stdoutLines": 0},
                ),
                (
                    "allows-documented-stderr",
                    [{"returnCode": 0, "stdout": "ok", "stderr": "warning", "stderrAllowed": True, "artifacts": []}, []],
                    {"passed": True, "failures": [], "missingArtifacts": [], "stdoutLines": 1},
                ),
            ],
            [
                "return code 0만으로 report 생성 성공을 선언하지 마세요.",
                "stderr 허용은 도구별 계약으로 명시하고 기본값은 실패로 두세요.",
            ],
        ),
        "transfer": T(
            "command-capability-plan",
            "새 외부 명령에 capability 제한 전이하기",
            "필요한 filesystem·network·process 권한을 allowlist와 비교한다.",
            "plan_command_capabilities(requested, allowed)를 완성하세요.",
            "def plan_command_capabilities(requested, allowed):\n    raise NotImplementedError",
            """def plan_command_capabilities(requested, allowed):
    requested_set = set(requested)
    allowed_set = set(allowed)
    denied = sorted(requested_set - allowed_set)
    granted = sorted(requested_set & allowed_set)
    return {"ready": not denied, "granted": granted, "denied": denied, "sandbox": "restricted" if granted else "no-capabilities"}
""",
            "plan_command_capabilities",
            [
                (
                    "grants-allowed-filesystem-read",
                    [["filesystem-read"], ["filesystem-read", "network"]],
                    {"ready": True, "granted": ["filesystem-read"], "denied": [], "sandbox": "restricted"},
                ),
                (
                    "denies-unlisted-process-spawn",
                    [["filesystem-read", "process-spawn"], ["filesystem-read"]],
                    {"ready": False, "granted": ["filesystem-read"], "denied": ["process-spawn"], "sandbox": "restricted"},
                ),
                (
                    "handles-no-capabilities",
                    [[], ["network"]],
                    {"ready": True, "granted": [], "denied": [], "sandbox": "no-capabilities"},
                ),
            ],
            [
                "외부 명령 전체를 신뢰하지 말고 필요한 capability만 요청하게 하세요.",
                "요청과 허용의 차이를 실행 전에 denied 목록으로 보여주세요.",
            ],
        ),
        "retrieval": decision(
            "subprocess-foundation-recall",
            "subprocess 실행 증거 회상하기",
            "프로세스·출력·artifact 성공 근거를 구분한다.",
            "choose_subprocess_evidence",
            {
                "process": {"action": "capture return code", "evidence": "exit identity and duration", "risk": "zero without outcome"},
                "output": {"action": "capture bounded stdout stderr", "evidence": "decoded streams", "risk": "secret leakage"},
                "artifact": {"action": "verify expected paths and hashes", "evidence": "artifact descriptors", "risk": "stale file"},
            },
        ),
    },
    "02": {
        "mastery": T(
            "argv-contract-audit",
            "명령 argv를 shell 문자열 없이 감사하기",
            "빈 인자·secret 노출·shell metacharacter 의존을 찾아 실행을 차단한다.",
            "audit_argv(argv, secret_values)를 완성하세요.",
            "def audit_argv(argv, secret_values):\n    raise NotImplementedError",
            """def audit_argv(argv, secret_values):
    if not argv:
        raise ValueError("empty argv")
    failures = []
    empty_indices = [index for index, value in enumerate(argv) if value == ""]
    if empty_indices:
        failures.append("empty-argument")
    leaked_indices = [index for index, value in enumerate(argv) if any(secret and secret in value for secret in secret_values)]
    if leaked_indices:
        failures.append("secret-in-argv")
    shell_indices = [index for index, value in enumerate(argv) if value in {"|", ">", ">>", "&&", ";"}]
    if shell_indices:
        failures.append("shell-metacharacter")
    return {"ready": not failures, "failures": failures, "emptyIndices": empty_indices, "secretIndices": leaked_indices, "shellIndices": shell_indices}
""",
            "audit_argv",
            [
                (
                    "accepts-literal-argument-with-space",
                    [["tool", "--name", "Quarterly Report"], []],
                    {"ready": True, "failures": [], "emptyIndices": [], "secretIndices": [], "shellIndices": []},
                ),
                (
                    "reports-secret-and-pipe",
                    [["tool", "--token=abc", "|", "next"], ["abc"]],
                    {"ready": False, "failures": ["secret-in-argv", "shell-metacharacter"], "emptyIndices": [], "secretIndices": [1], "shellIndices": [2]},
                ),
                (
                    "reports-empty-argument",
                    [["tool", ""], []],
                    {"ready": False, "failures": ["empty-argument"], "emptyIndices": [1], "secretIndices": [], "shellIndices": []},
                ),
                ("rejects-empty-argv", [[], []], E("ValueError")),
            ],
            [
                "공백이 있는 path도 argv 한 항목으로 전달하고 직접 quote 문자를 넣지 마세요.",
                "secret은 argv나 process 목록에 노출하지 말고 별도 secret channel을 사용하세요.",
            ],
        ),
        "transfer": T(
            "argument-schema-build",
            "새 도구 wrapper에 typed argument schema 전이하기",
            "허용 option과 값 type을 검사해 결정적 argv를 만든다.",
            "build_argv(executable, schema, values)를 완성하세요.",
            "def build_argv(executable, schema, values):\n    raise NotImplementedError",
            """def build_argv(executable, schema, values):
    unknown = sorted(set(values) - set(schema))
    if unknown:
        raise ValueError("unknown option")
    argv = [executable]
    omitted = []
    for name in sorted(schema):
        contract = schema[name]
        if name not in values:
            if contract.get("required"):
                omitted.append(name)
            continue
        value = values[name]
        if contract["type"] == "bool":
            if value:
                argv.append(contract["flag"])
        elif contract["type"] == "int":
            if not isinstance(value, int):
                raise ValueError("invalid integer option")
            argv.extend([contract["flag"], str(value)])
        else:
            argv.extend([contract["flag"], str(value)])
    return {"ready": not omitted, "argv": argv, "omitted": omitted}
""",
            "build_argv",
            [
                (
                    "builds-sorted-typed-argv",
                    ["tool", {"count": {"flag": "--count", "type": "int", "required": True}, "verbose": {"flag": "--verbose", "type": "bool"}}, {"verbose": True, "count": 3}],
                    {"ready": True, "argv": ["tool", "--count", "3", "--verbose"], "omitted": []},
                ),
                (
                    "reports-omitted-required-option",
                    ["tool", {"input": {"flag": "--input", "type": "str", "required": True}}, {}],
                    {"ready": False, "argv": ["tool"], "omitted": ["input"]},
                ),
                (
                    "rejects-unknown-option",
                    ["tool", {}, {"extra": 1}],
                    E("ValueError"),
                ),
            ],
            [
                "사용자 문자열을 command template에 끼우지 말고 option schema에서 argv를 만드세요.",
                "required option 누락과 type 오류를 process 실행 전에 실패시키세요.",
            ],
        ),
        "retrieval": decision(
            "argv-boundary-recall",
            "인자 전달 안전 경계 회상하기",
            "공백·shell 기능·secret 전달 방식을 구분한다.",
            "choose_argv_policy",
            {
                "space": {"action": "single literal argv item", "evidence": "argument list", "risk": "manual quoting"},
                "pipeline": {"action": "connect processes explicitly", "evidence": "separate argv and pipe handles", "risk": "shell injection"},
                "secret": {"action": "approved secret channel", "evidence": "redacted process manifest", "risk": "process-list exposure"},
            },
        ),
    },
    "03": {
        "mastery": T(
            "timeout-outcome-audit",
            "timeout과 partial output 결과 판정하기",
            "시간 초과·종료 확인·부분 산출물 오염을 별도 실패로 기록한다.",
            "audit_timeout_outcome(outcome, expected_timeout_ms)를 완성하세요.",
            "def audit_timeout_outcome(outcome, expected_timeout_ms):\n    raise NotImplementedError",
            """def audit_timeout_outcome(outcome, expected_timeout_ms):
    if expected_timeout_ms <= 0:
        raise ValueError("timeout must be positive")
    failures = []
    if outcome.get("durationMs", 0) > expected_timeout_ms or outcome.get("timedOut", False):
        failures.append("timeout")
    if outcome.get("timedOut", False) and not outcome.get("terminated", False):
        failures.append("not-terminated")
    if outcome.get("timedOut", False) and outcome.get("partialArtifacts"):
        failures.append("partial-artifacts")
    return {"accepted": not failures, "failures": failures, "partialArtifacts": sorted(outcome.get("partialArtifacts", [])), "durationMs": outcome.get("durationMs", 0)}
""",
            "audit_timeout_outcome",
            [
                (
                    "accepts-bounded-completion",
                    [{"durationMs": 90, "timedOut": False}, 100],
                    {"accepted": True, "failures": [], "partialArtifacts": [], "durationMs": 90},
                ),
                (
                    "reports-unterminated-timeout",
                    [{"durationMs": 150, "timedOut": True, "terminated": False, "partialArtifacts": ["output.tmp"]}, 100],
                    {"accepted": False, "failures": ["timeout", "not-terminated", "partial-artifacts"], "partialArtifacts": ["output.tmp"], "durationMs": 150},
                ),
                (
                    "reports-duration-overrun",
                    [{"durationMs": 101, "timedOut": False}, 100],
                    {"accepted": False, "failures": ["timeout"], "partialArtifacts": [], "durationMs": 101},
                ),
                ("rejects-zero-timeout", [{}, 0], E("ValueError")),
            ],
            [
                "TimeoutExpired 발생 자체보다 child 종료 확인과 partial artifact 처리가 중요합니다.",
                "부분 파일은 정상 output과 분리해 quarantine 목록으로 남기세요.",
            ],
        ),
        "transfer": T(
            "retryable-process-failure",
            "새 외부 도구 실패에 재시도 정책 전이하기",
            "실패 class와 idempotency로 재시도 가능 여부를 판정한다.",
            "classify_process_retry(failure, idempotent, attempt, maximum_attempts)를 완성하세요.",
            "def classify_process_retry(failure, idempotent, attempt, maximum_attempts):\n    raise NotImplementedError",
            """def classify_process_retry(failure, idempotent, attempt, maximum_attempts):
    if attempt <= 0 or maximum_attempts <= 0:
        raise ValueError("attempts must be positive")
    retryable_failure = failure in {"timeout", "temporary-unavailable", "resource-busy"}
    retry = idempotent and retryable_failure and attempt < maximum_attempts
    return {"retry": retry, "reason": "retryable" if retry else "stop", "remaining": max(0, maximum_attempts - attempt)}
""",
            "classify_process_retry",
            [
                ("retries-idempotent-timeout", ["timeout", True, 1, 3], {"retry": True, "reason": "retryable", "remaining": 2}),
                ("stops-non-idempotent-timeout", ["timeout", False, 1, 3], {"retry": False, "reason": "stop", "remaining": 2}),
                ("stops-contract-error", ["invalid-argument", True, 1, 3], {"retry": False, "reason": "stop", "remaining": 2}),
                ("stops-at-limit", ["timeout", True, 3, 3], {"retry": False, "reason": "stop", "remaining": 0}),
            ],
            [
                "timeout이라고 무조건 재시도하지 말고 작업의 idempotency를 먼저 확인하세요.",
                "인자 계약 오류는 backoff로 고쳐지지 않으므로 즉시 중단하세요.",
            ],
        ),
        "retrieval": decision(
            "timeout-recovery-recall",
            "process timeout 복구 순서 회상하기",
            "종료·부분 산출물·재시도 판단을 구분한다.",
            "choose_timeout_recovery",
            {
                "terminate": {"action": "stop owned process tree", "evidence": "termination confirmation", "risk": "orphan child"},
                "cleanup": {"action": "quarantine partial artifacts", "evidence": "partial path list", "risk": "stale output reuse"},
                "retry": {"action": "check idempotency and failure class", "evidence": "attempt ledger", "risk": "duplicate side effect"},
            },
        ),
    },
    "04": {
        "mastery": T(
            "stream-line-framing",
            "stream chunk를 줄 단위 record로 안전하게 조립하기",
            "chunk 경계에 걸린 UTF-8 text를 buffer에 보존하고 완성 줄만 반환한다.",
            "frame_stream_lines(chunks)를 완성하세요.",
            "def frame_stream_lines(chunks):\n    raise NotImplementedError",
            r"""def frame_stream_lines(chunks):
    buffer = ""
    lines = []
    for chunk in chunks:
        buffer += chunk
        parts = buffer.split("\n")
        lines.extend(parts[:-1])
        buffer = parts[-1]
    return {"lines": lines, "remainder": buffer, "lineCount": len(lines)}
""",
            "frame_stream_lines",
            [
                (
                    "joins-split-lines",
                    [["hel", "lo\nwor", "ld\n"]],
                    {"lines": ["hello", "world"], "remainder": "", "lineCount": 2},
                ),
                (
                    "keeps-final-remainder",
                    [["a\nb"]],
                    {"lines": ["a"], "remainder": "b", "lineCount": 1},
                ),
                (
                    "handles-empty-chunks",
                    [[]],
                    {"lines": [], "remainder": "", "lineCount": 0},
                ),
            ],
            [
                "read chunk 하나를 log line 하나로 가정하지 마세요.",
                "마지막 newline이 없는 remainder를 성공 line처럼 확정하지 마세요.",
            ],
        ),
        "transfer": T(
            "stream-backpressure-plan",
            "새 process stream에 buffer 제한 전이하기",
            "producer·consumer rate와 최대 buffer로 pause·drop 금지 정책을 판정한다.",
            "plan_stream_backpressure(producer_rate, consumer_rate, current_buffer, maximum_buffer)를 완성하세요.",
            "def plan_stream_backpressure(producer_rate, consumer_rate, current_buffer, maximum_buffer):\n    raise NotImplementedError",
            """def plan_stream_backpressure(producer_rate, consumer_rate, current_buffer, maximum_buffer):
    if min(producer_rate, consumer_rate, current_buffer, maximum_buffer) < 0 or maximum_buffer == 0:
        raise ValueError("invalid stream rates")
    growth = max(0, producer_rate - consumer_rate)
    projected = current_buffer + growth
    if projected > maximum_buffer:
        action = "pause-producer"
    elif projected > maximum_buffer * 0.8:
        action = "drain-priority"
    else:
        action = "continue"
    return {"action": action, "projectedBuffer": projected, "growth": growth, "dropAllowed": False}
""",
            "plan_stream_backpressure",
            [
                ("continues-balanced-stream", [10, 10, 20, 100], {"action": "continue", "projectedBuffer": 20, "growth": 0, "dropAllowed": False}),
                ("prioritizes-near-limit-drain", [20, 10, 75, 100], {"action": "drain-priority", "projectedBuffer": 85, "growth": 10, "dropAllowed": False}),
                ("pauses-over-limit-producer", [50, 10, 80, 100], {"action": "pause-producer", "projectedBuffer": 120, "growth": 40, "dropAllowed": False}),
                ("rejects-zero-buffer", [1, 1, 0, 0], E("ValueError")),
            ],
            [
                "stdout가 빠르다는 이유로 줄을 버리지 말고 producer를 제어하세요.",
                "현재 buffer와 다음 interval 성장량을 함께 계산하세요.",
            ],
        ),
        "retrieval": decision(
            "streaming-process-recall",
            "process streaming 경계 회상하기",
            "chunk framing·stderr 분리·backpressure 증거를 복원한다.",
            "choose_streaming_policy",
            {
                "framing": {"action": "buffer until newline", "evidence": "complete lines and remainder", "risk": "split record"},
                "channels": {"action": "tag stdout and stderr separately", "evidence": "channel timestamp sequence", "risk": "lost ordering"},
                "pressure": {"action": "bound buffer and pause producer", "evidence": "rates and buffer size", "risk": "silent drop"},
            },
        ),
    },
    "05": {
        "mastery": T(
            "execution-context-audit",
            "process 환경변수·CWD 실행 context 감사하기",
            "허용 root 밖 CWD와 secret·예상 밖 환경변수를 차단한다.",
            "audit_execution_context(context, allowed_root, allowed_env_keys, secret_keys)를 완성하세요.",
            "def audit_execution_context(context, allowed_root, allowed_env_keys, secret_keys):\n    raise NotImplementedError",
            """def audit_execution_context(context, allowed_root, allowed_env_keys, secret_keys):
    from pathlib import PurePosixPath
    root = PurePosixPath(allowed_root)
    cwd = PurePosixPath(context["cwd"])
    failures = []
    try:
        cwd.relative_to(root)
    except ValueError:
        failures.append("cwd")
    env_keys = set(context.get("env", {}))
    unexpected = sorted(env_keys - set(allowed_env_keys))
    exposed_secrets = sorted(env_keys & set(secret_keys))
    if unexpected:
        failures.append("environment")
    if exposed_secrets:
        failures.append("secrets")
    return {"accepted": not failures, "failures": failures, "unexpectedEnv": unexpected, "exposedSecrets": exposed_secrets}
""",
            "audit_execution_context",
            [
                (
                    "accepts-scoped-context",
                    [{"cwd": "/workspace/job", "env": {"LANG": "C.UTF-8"}}, "/workspace", ["LANG"], ["TOKEN"]],
                    {"accepted": True, "failures": [], "unexpectedEnv": [], "exposedSecrets": []},
                ),
                (
                    "reports-cwd-and-environment",
                    [{"cwd": "/tmp", "env": {"DEBUG": "1"}}, "/workspace", ["LANG"], []],
                    {"accepted": False, "failures": ["cwd", "environment"], "unexpectedEnv": ["DEBUG"], "exposedSecrets": []},
                ),
                (
                    "reports-secret-environment",
                    [{"cwd": "/workspace", "env": {"TOKEN": "secret"}}, "/workspace", ["TOKEN"], ["TOKEN"]],
                    {"accepted": False, "failures": ["secrets"], "unexpectedEnv": [], "exposedSecrets": ["TOKEN"]},
                ),
            ],
            [
                "현재 shell의 전체 환경을 상속하지 말고 허용 key만 새 dict로 구성하세요.",
                "CWD가 작업 root 안인지 구조적으로 검사하세요.",
            ],
        ),
        "transfer": T(
            "environment-diff-manifest",
            "새 실행에 환경 diff manifest 전이하기",
            "base 환경에서 추가·변경·삭제된 key를 값 노출 없이 기록한다.",
            "summarize_environment_diff(base, target, secret_keys)를 완성하세요.",
            "def summarize_environment_diff(base, target, secret_keys):\n    raise NotImplementedError",
            """def summarize_environment_diff(base, target, secret_keys):
    secrets = set(secret_keys)
    added = sorted(set(target) - set(base))
    removed = sorted(set(base) - set(target))
    changed = sorted(key for key in set(base) & set(target) if base[key] != target[key])
    redacted = sorted(key for key in set(added + changed) if key in secrets)
    return {"added": added, "removed": removed, "changed": changed, "redactedKeys": redacted}
""",
            "summarize_environment_diff",
            [
                (
                    "summarizes-add-change-remove",
                    [{"LANG": "C", "OLD": "1"}, {"LANG": "C.UTF-8", "NEW": "2"}, []],
                    {"added": ["NEW"], "removed": ["OLD"], "changed": ["LANG"], "redactedKeys": []},
                ),
                (
                    "marks-secret-without-value",
                    [{}, {"TOKEN": "abc"}, ["TOKEN"]],
                    {"added": ["TOKEN"], "removed": [], "changed": [], "redactedKeys": ["TOKEN"]},
                ),
                (
                    "handles-no-diff",
                    [{"A": "1"}, {"A": "1"}, []],
                    {"added": [], "removed": [], "changed": [], "redactedKeys": []},
                ),
            ],
            [
                "환경값 전체가 아니라 key 수준 diff만 release evidence에 남기세요.",
                "secret key는 변경 여부만 기록하고 실제 값은 출력하지 마세요.",
            ],
        ),
        "retrieval": decision(
            "execution-context-recall",
            "환경변수와 CWD 격리 원칙 회상하기",
            "경로·환경·secret evidence를 구분한다.",
            "choose_execution_context",
            {
                "cwd": {"action": "resolve under allowed root", "evidence": "relative path check", "risk": "path escape"},
                "environment": {"action": "construct allowlisted env", "evidence": "key diff manifest", "risk": "ambient dependency"},
                "secret": {"action": "inject through approved channel", "evidence": "redacted key identity", "risk": "log exposure"},
            },
        ),
    },
    "06": {
        "mastery": T(
            "tool-wrapper-contract",
            "외부 도구 wrapper의 version·input·output 계약 감사하기",
            "도구 version 범위와 필수 input/output, timeout을 실행 전에 검사한다.",
            "audit_tool_wrapper(contract, invocation)를 완성하세요.",
            "def audit_tool_wrapper(contract, invocation):\n    raise NotImplementedError",
            """def audit_tool_wrapper(contract, invocation):
    failures = []
    if invocation.get("version") not in contract.get("allowedVersions", []):
        failures.append("version")
    missing_inputs = sorted(set(contract.get("requiredInputs", [])) - set(invocation.get("inputs", [])))
    if missing_inputs:
        failures.append("inputs")
    missing_outputs = sorted(set(contract.get("requiredOutputs", [])) - set(invocation.get("expectedOutputs", [])))
    if missing_outputs:
        failures.append("outputs")
    if invocation.get("timeoutMs", 0) <= 0 or invocation.get("timeoutMs", 0) > contract.get("maximumTimeoutMs", 0):
        failures.append("timeout")
    return {"ready": not failures, "failures": failures, "missingInputs": missing_inputs, "missingOutputs": missing_outputs}
""",
            "audit_tool_wrapper",
            [
                (
                    "accepts-versioned-wrapper",
                    [{"allowedVersions": ["1.2"], "requiredInputs": ["source"], "requiredOutputs": ["report"], "maximumTimeoutMs": 5000}, {"version": "1.2", "inputs": ["source"], "expectedOutputs": ["report"], "timeoutMs": 1000}],
                    {"ready": True, "failures": [], "missingInputs": [], "missingOutputs": []},
                ),
                (
                    "reports-contract-gaps",
                    [{"allowedVersions": ["1.2"], "requiredInputs": ["source"], "requiredOutputs": ["report"], "maximumTimeoutMs": 5000}, {"version": "2.0", "inputs": [], "expectedOutputs": [], "timeoutMs": 6000}],
                    {"ready": False, "failures": ["version", "inputs", "outputs", "timeout"], "missingInputs": ["source"], "missingOutputs": ["report"]},
                ),
                (
                    "reports-zero-timeout",
                    [{"allowedVersions": ["1"], "maximumTimeoutMs": 10}, {"version": "1", "timeoutMs": 0}],
                    {"ready": False, "failures": ["timeout"], "missingInputs": [], "missingOutputs": []},
                ),
            ],
            [
                "도구 이름이 같아도 version이 다르면 별도 contract로 판정하세요.",
                "wrapper는 argv뿐 아니라 필수 output과 timeout까지 소유해야 합니다.",
            ],
        ),
        "transfer": T(
            "tool-output-schema",
            "새 외부 도구 출력에 schema 검증 전이하기",
            "필수 field·type과 unknown field 정책으로 파싱 결과를 감사한다.",
            "audit_tool_output(output, schema, allow_unknown)를 완성하세요.",
            "def audit_tool_output(output, schema, allow_unknown):\n    raise NotImplementedError",
            """def audit_tool_output(output, schema, allow_unknown):
    missing = sorted(set(schema) - set(output))
    wrong_types = sorted(key for key, type_name in schema.items() if key in output and type(output[key]).__name__ != type_name)
    unknown = sorted(set(output) - set(schema)) if not allow_unknown else []
    failures = []
    if missing:
        failures.append("missing")
    if wrong_types:
        failures.append("types")
    if unknown:
        failures.append("unknown")
    return {"accepted": not failures, "failures": failures, "missing": missing, "wrongTypes": wrong_types, "unknown": unknown}
""",
            "audit_tool_output",
            [
                (
                    "accepts-schema",
                    [{"count": 2, "ok": True}, {"count": "int", "ok": "bool"}, False],
                    {"accepted": True, "failures": [], "missing": [], "wrongTypes": [], "unknown": []},
                ),
                (
                    "reports-missing-type-and-unknown",
                    [{"count": "2", "extra": 1}, {"count": "int", "ok": "bool"}, False],
                    {"accepted": False, "failures": ["missing", "types", "unknown"], "missing": ["ok"], "wrongTypes": ["count"], "unknown": ["extra"]},
                ),
                (
                    "allows-unknown-fields",
                    [{"count": 2, "extra": 1}, {"count": "int"}, True],
                    {"accepted": True, "failures": [], "missing": [], "wrongTypes": [], "unknown": []},
                ),
            ],
            [
                "stdout JSON 파싱 성공과 wrapper schema 충족을 별도 판정하세요.",
                "unknown field 허용 여부를 version별 계약으로 명시하세요.",
            ],
        ),
        "retrieval": decision(
            "external-tool-wrapper-recall",
            "외부 도구 wrapper 책임 회상하기",
            "version·실행·출력 schema 책임을 구분한다.",
            "choose_tool_wrapper_evidence",
            {
                "version": {"action": "probe and allowlist exact version", "evidence": "tool identity", "risk": "behavior drift"},
                "invoke": {"action": "build typed argv with timeout", "evidence": "invocation manifest", "risk": "shell coupling"},
                "parse": {"action": "validate output schema", "evidence": "field and type audit", "risk": "silent format drift"},
            },
        ),
    },
    "07": {
        "mastery": T(
            "process-inventory-filter",
            "process 목록을 PID·create time identity로 필터링하기",
            "이름만 같은 재사용 PID를 피하고 owner·command 계약을 적용한다.",
            "filter_process_inventory(processes, criteria)를 완성하세요.",
            "def filter_process_inventory(processes, criteria):\n    raise NotImplementedError",
            """def filter_process_inventory(processes, criteria):
    matches = []
    rejected = []
    for process in processes:
        reasons = []
        for key in ["name", "owner"]:
            if key in criteria and process.get(key) != criteria[key]:
                reasons.append(key)
        if "commandContains" in criteria and criteria["commandContains"] not in " ".join(process.get("argv", [])):
            reasons.append("command")
        identity = {"pid": process["pid"], "createTime": process["createTime"]}
        if reasons:
            rejected.append({**identity, "reasons": reasons})
        else:
            matches.append(identity)
    return {"matches": matches, "rejected": rejected}
""",
            "filter_process_inventory",
            [
                (
                    "matches-owner-name-and-command",
                    [[{"pid": 10, "createTime": 1, "name": "python", "owner": "me", "argv": ["python", "job.py"]}], {"name": "python", "owner": "me", "commandContains": "job.py"}],
                    {"matches": [{"pid": 10, "createTime": 1}], "rejected": []},
                ),
                (
                    "reports-rejection-reasons",
                    [[{"pid": 10, "createTime": 1, "name": "python", "owner": "other", "argv": ["python", "other.py"]}], {"name": "python", "owner": "me", "commandContains": "job.py"}],
                    {"matches": [], "rejected": [{"pid": 10, "createTime": 1, "reasons": ["owner", "command"]}]},
                ),
                (
                    "matches-empty-criteria",
                    [[{"pid": 1, "createTime": 5}], {}],
                    {"matches": [{"pid": 1, "createTime": 5}], "rejected": []},
                ),
            ],
            [
                "PID만 저장하지 말고 create time을 포함한 process identity를 사용하세요.",
                "프로세스 이름 하나로 종료 대상을 선택하지 마세요.",
            ],
        ),
        "transfer": T(
            "process-snapshot-diff",
            "새 process snapshot에 시작·종료·재사용 PID 감사 전이하기",
            "PID와 create time 쌍으로 두 시점의 process 변화를 계산한다.",
            "diff_process_snapshots(before, after)를 완성하세요.",
            "def diff_process_snapshots(before, after):\n    raise NotImplementedError",
            """def diff_process_snapshots(before, after):
    before_ids = {(item["pid"], item["createTime"]) for item in before}
    after_ids = {(item["pid"], item["createTime"]) for item in after}
    started = sorted([{"pid": pid, "createTime": created} for pid, created in after_ids - before_ids], key=lambda item: (item["pid"], item["createTime"]))
    stopped = sorted([{"pid": pid, "createTime": created} for pid, created in before_ids - after_ids], key=lambda item: (item["pid"], item["createTime"]))
    reused = sorted(pid for pid in {item["pid"] for item in before} & {item["pid"] for item in after} if {item["createTime"] for item in before if item["pid"] == pid} != {item["createTime"] for item in after if item["pid"] == pid})
    return {"started": started, "stopped": stopped, "reusedPids": reused}
""",
            "diff_process_snapshots",
            [
                (
                    "finds-start-and-stop",
                    [[{"pid": 1, "createTime": 10}], [{"pid": 2, "createTime": 20}]],
                    {"started": [{"pid": 2, "createTime": 20}], "stopped": [{"pid": 1, "createTime": 10}], "reusedPids": []},
                ),
                (
                    "finds-reused-pid",
                    [[{"pid": 7, "createTime": 10}], [{"pid": 7, "createTime": 30}]],
                    {"started": [{"pid": 7, "createTime": 30}], "stopped": [{"pid": 7, "createTime": 10}], "reusedPids": [7]},
                ),
                (
                    "keeps-stable-process",
                    [[{"pid": 1, "createTime": 10}], [{"pid": 1, "createTime": 10}]],
                    {"started": [], "stopped": [], "reusedPids": []},
                ),
            ],
            [
                "snapshot diff도 PID가 아니라 PID·create time 쌍으로 계산하세요.",
                "재사용 PID는 단순 유지가 아니라 종료와 시작으로 함께 기록하세요.",
            ],
        ),
        "retrieval": decision(
            "process-inventory-recall",
            "process 조회 identity 회상하기",
            "검색·snapshot diff·소유권 확인 근거를 복원한다.",
            "choose_process_identity",
            {
                "search": {"action": "filter name owner argv", "evidence": "PID and create time", "risk": "name collision"},
                "diff": {"action": "compare identity pairs", "evidence": "started stopped reused", "risk": "PID reuse"},
                "control": {"action": "revalidate identity before signal", "evidence": "fresh create time and owner", "risk": "wrong process"},
            },
        ),
    },
    "08": {
        "mastery": T(
            "resource-window-audit",
            "시스템 자원 임계 초과의 지속시간 판정하기",
            "순간 spike가 아니라 연속 sample 수로 CPU·memory 경보를 결정한다.",
            "audit_resource_windows(samples, thresholds, minimum_consecutive)를 완성하세요.",
            "def audit_resource_windows(samples, thresholds, minimum_consecutive):\n    raise NotImplementedError",
            """def audit_resource_windows(samples, thresholds, minimum_consecutive):
    if minimum_consecutive <= 0:
        raise ValueError("minimum consecutive must be positive")
    alerts = []
    for metric, threshold in sorted(thresholds.items()):
        streak = 0
        maximum_streak = 0
        for sample in samples:
            streak = streak + 1 if sample.get(metric, 0) > threshold else 0
            maximum_streak = max(maximum_streak, streak)
        if maximum_streak >= minimum_consecutive:
            alerts.append({"metric": metric, "maximumStreak": maximum_streak, "threshold": threshold})
    return {"healthy": not alerts, "alerts": alerts, "sampleCount": len(samples)}
""",
            "audit_resource_windows",
            [
                (
                    "ignores-single-spike",
                    [[{"cpu": 90}, {"cpu": 10}], {"cpu": 80}, 2],
                    {"healthy": True, "alerts": [], "sampleCount": 2},
                ),
                (
                    "alerts-sustained-cpu",
                    [[{"cpu": 90}, {"cpu": 91}, {"cpu": 20}], {"cpu": 80}, 2],
                    {"healthy": False, "alerts": [{"metric": "cpu", "maximumStreak": 2, "threshold": 80}], "sampleCount": 3},
                ),
                (
                    "orders-multiple-metric-alerts",
                    [[{"memory": 95, "cpu": 90}, {"memory": 96, "cpu": 91}], {"memory": 90, "cpu": 80}, 2],
                    {"healthy": False, "alerts": [{"metric": "cpu", "maximumStreak": 2, "threshold": 80}, {"metric": "memory", "maximumStreak": 2, "threshold": 90}], "sampleCount": 2},
                ),
                ("rejects-zero-window", [[], {}, 0], E("ValueError")),
            ],
            [
                "한 번의 높은 sample을 지속 장애로 선언하지 마세요.",
                "threshold와 연속 sample 수를 alert evidence에 함께 남기세요.",
            ],
        ),
        "transfer": T(
            "resource-baseline-comparison",
            "새 실행의 자원 사용량을 baseline과 비교하기",
            "절대 한계와 baseline 대비 증가율을 함께 검사한다.",
            "compare_resource_baseline(current, baseline, absolute_limits, growth_limits)를 완성하세요.",
            "def compare_resource_baseline(current, baseline, absolute_limits, growth_limits):\n    raise NotImplementedError",
            """def compare_resource_baseline(current, baseline, absolute_limits, growth_limits):
    failures = []
    details = []
    for metric in sorted(current):
        value = current[metric]
        base = baseline.get(metric, 0)
        growth = None if base == 0 else round((value - base) / base, 4)
        reasons = []
        if metric in absolute_limits and value > absolute_limits[metric]:
            reasons.append("absolute")
        if growth is not None and metric in growth_limits and growth > growth_limits[metric]:
            reasons.append("growth")
        if reasons:
            failures.append(metric)
        details.append({"metric": metric, "value": value, "baseline": base, "growth": growth, "reasons": reasons})
    return {"accepted": not failures, "failedMetrics": failures, "details": details}
""",
            "compare_resource_baseline",
            [
                (
                    "accepts-within-limits",
                    [{"memory": 110}, {"memory": 100}, {"memory": 200}, {"memory": 0.2}],
                    {"accepted": True, "failedMetrics": [], "details": [{"metric": "memory", "value": 110, "baseline": 100, "growth": 0.1, "reasons": []}]},
                ),
                (
                    "reports-absolute-and-growth",
                    [{"memory": 250}, {"memory": 100}, {"memory": 200}, {"memory": 1.0}],
                    {"accepted": False, "failedMetrics": ["memory"], "details": [{"metric": "memory", "value": 250, "baseline": 100, "growth": 1.5, "reasons": ["absolute", "growth"]}]},
                ),
                (
                    "handles-zero-baseline",
                    [{"cpu": 10}, {"cpu": 0}, {"cpu": 50}, {"cpu": 0.1}],
                    {"accepted": True, "failedMetrics": [], "details": [{"metric": "cpu", "value": 10, "baseline": 0, "growth": None, "reasons": []}]},
                ),
            ],
            [
                "baseline 대비 증가만으로 절대 자원 한계를 무시하지 마세요.",
                "baseline 0에서는 무한 증가율을 만들지 말고 growth를 미정으로 두세요.",
            ],
        ),
        "retrieval": decision(
            "resource-monitoring-recall",
            "시스템 자원 모니터링 근거 회상하기",
            "순간값·지속 구간·baseline 회귀를 구분한다.",
            "choose_resource_evidence",
            {
                "sample": {"action": "record timestamped metric", "evidence": "raw bounded sample", "risk": "single spike"},
                "alert": {"action": "require consecutive threshold breach", "evidence": "maximum streak", "risk": "alert noise"},
                "regression": {"action": "compare absolute and baseline limits", "evidence": "value growth reasons", "risk": "moving baseline"},
            },
        ),
    },
    "09": {
        "mastery": T(
            "termination-authorization",
            "process 종료 전 identity·owner·allowlist 승인하기",
            "현재 snapshot이 계획과 일치할 때만 signal 단계를 허용한다.",
            "authorize_termination(plan, current_process, allowed_signals)를 완성하세요.",
            "def authorize_termination(plan, current_process, allowed_signals):\n    raise NotImplementedError",
            """def authorize_termination(plan, current_process, allowed_signals):
    failures = []
    for key in ["pid", "createTime", "owner"]:
        if plan.get(key) != current_process.get(key):
            failures.append(key)
    if plan.get("signal") not in allowed_signals:
        failures.append("signal")
    if not plan.get("ownedByAutomation", False):
        failures.append("ownership")
    return {"authorized": not failures, "failures": failures, "target": {"pid": current_process.get("pid"), "createTime": current_process.get("createTime")}}
""",
            "authorize_termination",
            [
                (
                    "authorizes-owned-current-process",
                    [{"pid": 10, "createTime": 5, "owner": "me", "signal": "TERM", "ownedByAutomation": True}, {"pid": 10, "createTime": 5, "owner": "me"}, ["TERM"]],
                    {"authorized": True, "failures": [], "target": {"pid": 10, "createTime": 5}},
                ),
                (
                    "rejects-reused-pid-and-signal",
                    [{"pid": 10, "createTime": 5, "owner": "me", "signal": "KILL", "ownedByAutomation": True}, {"pid": 10, "createTime": 8, "owner": "me"}, ["TERM"]],
                    {"authorized": False, "failures": ["createTime", "signal"], "target": {"pid": 10, "createTime": 8}},
                ),
                (
                    "rejects-unowned-process",
                    [{"pid": 1, "createTime": 1, "owner": "system", "signal": "TERM", "ownedByAutomation": False}, {"pid": 1, "createTime": 1, "owner": "system"}, ["TERM"]],
                    {"authorized": False, "failures": ["ownership"], "target": {"pid": 1, "createTime": 1}},
                ),
            ],
            [
                "종료 직전에 PID·create time·owner를 fresh snapshot으로 다시 확인하세요.",
                "자동화가 소유하지 않은 process는 이름이 같아도 종료하지 마세요.",
            ],
        ),
        "transfer": T(
            "termination-escalation-plan",
            "새 종료 작업에 단계적 signal 계획 전이하기",
            "graceful signal과 대기 후 강제 종료를 명시적 budget으로 구성한다.",
            "build_termination_plan(graceful_signal, force_signal, grace_ms, total_budget_ms)를 완성하세요.",
            "def build_termination_plan(graceful_signal, force_signal, grace_ms, total_budget_ms):\n    raise NotImplementedError",
            """def build_termination_plan(graceful_signal, force_signal, grace_ms, total_budget_ms):
    if grace_ms < 0 or total_budget_ms <= 0 or grace_ms >= total_budget_ms:
        raise ValueError("invalid termination budget")
    return {
        "steps": [
            {"action": "signal", "signal": graceful_signal, "atMs": 0},
            {"action": "verify-exit", "atMs": grace_ms},
            {"action": "signal-if-alive", "signal": force_signal, "atMs": grace_ms},
            {"action": "verify-exit", "atMs": total_budget_ms},
        ],
        "budgetMs": total_budget_ms,
    }
""",
            "build_termination_plan",
            [
                (
                    "builds-graceful-then-force-plan",
                    ["TERM", "KILL", 1000, 3000],
                    {"steps": [{"action": "signal", "signal": "TERM", "atMs": 0}, {"action": "verify-exit", "atMs": 1000}, {"action": "signal-if-alive", "signal": "KILL", "atMs": 1000}, {"action": "verify-exit", "atMs": 3000}], "budgetMs": 3000},
                ),
                (
                    "allows-zero-grace-with-verification",
                    ["INT", "TERM", 0, 100],
                    {"steps": [{"action": "signal", "signal": "INT", "atMs": 0}, {"action": "verify-exit", "atMs": 0}, {"action": "signal-if-alive", "signal": "TERM", "atMs": 0}, {"action": "verify-exit", "atMs": 100}], "budgetMs": 100},
                ),
                ("rejects-grace-equal-budget", ["TERM", "KILL", 100, 100], E("ValueError")),
            ],
            [
                "바로 강제 종료하지 말고 graceful signal과 exit 확인 단계를 두세요.",
                "각 대기 시점과 전체 종료 budget을 고정하세요.",
            ],
        ),
        "retrieval": decision(
            "process-termination-recall",
            "process 종료 안전 원칙 회상하기",
            "대상 승인·단계적 signal·종료 증거를 복원한다.",
            "choose_termination_policy",
            {
                "authorize": {"action": "revalidate PID create time owner", "evidence": "fresh identity", "risk": "PID reuse"},
                "signal": {"action": "graceful then force within budget", "evidence": "signal timeline", "risk": "data corruption"},
                "verify": {"action": "confirm process tree exited", "evidence": "post-signal snapshot", "risk": "orphan child"},
            },
        ),
    },
    "10": {
        "mastery": T(
            "build-runner-dag",
            "빌드 step 의존성 DAG와 실행 순서 만들기",
            "누락 의존성과 cycle을 거부하고 결정적 topological order를 반환한다.",
            "plan_build_steps(steps)를 완성하세요.",
            "def plan_build_steps(steps):\n    raise NotImplementedError",
            """def plan_build_steps(steps):
    names = {step["name"] for step in steps}
    missing = sorted({dependency for step in steps for dependency in step.get("needs", []) if dependency not in names})
    if missing:
        raise ValueError("missing dependency")
    needs = {step["name"]: set(step.get("needs", [])) for step in steps}
    order = []
    while needs:
        ready = sorted(name for name, dependencies in needs.items() if not dependencies)
        if not ready:
            raise ValueError("dependency cycle")
        for name in ready:
            order.append(name)
            needs.pop(name)
        for dependencies in needs.values():
            dependencies.difference_update(ready)
    return {"order": order, "stepCount": len(order)}
""",
            "plan_build_steps",
            [
                (
                    "orders-dependent-steps",
                    [[{"name": "test", "needs": ["lint"]}, {"name": "lint", "needs": []}, {"name": "package", "needs": ["test"]}]],
                    {"order": ["lint", "test", "package"], "stepCount": 3},
                ),
                (
                    "orders-independent-steps-by-name",
                    [[{"name": "b", "needs": []}, {"name": "a", "needs": []}]],
                    {"order": ["a", "b"], "stepCount": 2},
                ),
                ("rejects-missing-dependency", [[{"name": "test", "needs": ["build"]}]], E("ValueError")),
                ("rejects-cycle", [[{"name": "a", "needs": ["b"]}, {"name": "b", "needs": ["a"]}]], E("ValueError")),
            ],
            [
                "step 목록 순서를 의존성 순서로 가정하지 말고 DAG를 계산하세요.",
                "누락 dependency와 cycle을 process 실행 전에 거부하세요.",
            ],
        ),
        "transfer": T(
            "build-run-evidence",
            "새 빌드 실행에 step·artifact 증거 감사 전이하기",
            "실패 뒤 downstream 실행과 산출물 누락을 찾아 전체 결과를 판정한다.",
            "audit_build_run(results, expected_artifacts)를 완성하세요.",
            "def audit_build_run(results, expected_artifacts):\n    raise NotImplementedError",
            """def audit_build_run(results, expected_artifacts):
    failures = []
    first_failed_index = next((index for index, result in enumerate(results) if not result["passed"]), None)
    executed_after_failure = []
    if first_failed_index is not None:
        failures.append("step")
        executed_after_failure = [result["name"] for result in results[first_failed_index + 1 :] if result.get("executed", True)]
        if executed_after_failure:
            failures.append("continued-after-failure")
    artifacts = {artifact for result in results for artifact in result.get("artifacts", [])}
    missing = sorted(set(expected_artifacts) - artifacts)
    if missing:
        failures.append("artifacts")
    return {"passed": not failures, "failures": failures, "executedAfterFailure": executed_after_failure, "missingArtifacts": missing}
""",
            "audit_build_run",
            [
                (
                    "accepts-green-build-with-artifact",
                    [[{"name": "test", "passed": True, "artifacts": []}, {"name": "package", "passed": True, "artifacts": ["app.zip"]}], ["app.zip"]],
                    {"passed": True, "failures": [], "executedAfterFailure": [], "missingArtifacts": []},
                ),
                (
                    "reports-continuation-and-missing-artifact",
                    [[{"name": "test", "passed": False}, {"name": "package", "passed": True, "executed": True}], ["app.zip"]],
                    {"passed": False, "failures": ["step", "continued-after-failure", "artifacts"], "executedAfterFailure": ["package"], "missingArtifacts": ["app.zip"]},
                ),
                (
                    "reports-stopped-failure",
                    [[{"name": "test", "passed": False}], []],
                    {"passed": False, "failures": ["step"], "executedAfterFailure": [], "missingArtifacts": []},
                ),
            ],
            [
                "step 실패 뒤 실행된 downstream step를 green count에 포함하지 마세요.",
                "빌드 성공은 필수 artifact identity와 함께 판정하세요.",
            ],
        ),
        "retrieval": decision(
            "build-runner-capstone-recall",
            "종합 빌드 runner 종료 조건 회상하기",
            "DAG·sandbox·step·artifact 증거를 복원한다.",
            "choose_build_runner_gate",
            {
                "plan": {"action": "validate dependency DAG", "evidence": "deterministic order", "risk": "cycle or missing step"},
                "execute": {"action": "run each step in bounded context", "evidence": "argv duration return code", "risk": "ambient environment"},
                "release": {"action": "verify all steps and artifacts", "evidence": "source-bound build manifest", "risk": "stale artifact"},
            },
        ),
    },
}
