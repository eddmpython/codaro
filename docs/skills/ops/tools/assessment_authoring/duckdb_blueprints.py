from __future__ import annotations

from typing import Any

from .common import TaskBlueprint, raises, task


T = task
E = raises


def decision(
    slug: str,
    title: str,
    goal: str,
    prompt: str,
    entry: str,
    table: dict[str, dict[str, Any]],
    hints: list[str],
) -> TaskBlueprint:
    solution = (
        f"def {entry}(situation):\n"
        f"    table = {table!r}\n"
        "    if situation not in table:\n"
        "        raise ValueError('unknown situation')\n"
        "    return table[situation]\n"
    )
    cases = [
        (f"recalls-{key}", [key], value)
        for key, value in list(table.items())[:2]
    ] + [("rejects-unknown", ["unknown"], E("ValueError"))]
    return T(
        slug,
        title,
        goal,
        prompt,
        f"def {entry}(situation):\n    raise NotImplementedError",
        solution,
        entry,
        cases,
        hints,
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00_DuckDB소개": {
        "mastery": T(
            "embedded-query-boundary",
            "임베디드 분석 쿼리의 실행 경계 설계하기",
            "데이터 크기와 결과 크기를 바탕으로 로컬 scan, filter, aggregate, collect 경계를 정한다.",
            "plan_embedded_query(source_rows, selected_columns, result_rows)를 완성해 실행 계획과 위험을 반환하세요.",
            "def plan_embedded_query(source_rows, selected_columns, result_rows):\n    raise NotImplementedError",
            """def plan_embedded_query(source_rows, selected_columns, result_rows):
    if source_rows < 0 or result_rows < 0 or not selected_columns:
        raise ValueError("invalid query estimate")
    if result_rows > source_rows:
        raise ValueError("result cannot exceed source")
    return {
        "engine": "embedded-columnar",
        "stages": ["scan", "project", "filter", "aggregate", "collect"],
        "scanColumns": sorted(set(selected_columns)),
        "materialize": "final-only",
        "risk": "large-result" if result_rows > 100000 else "bounded-result",
    }
""",
            "plan_embedded_query",
            [
                ("plans-bounded-local-query", [1000000, ["city", "amount", "city"], 20], {"engine": "embedded-columnar", "stages": ["scan", "project", "filter", "aggregate", "collect"], "scanColumns": ["amount", "city"], "materialize": "final-only", "risk": "bounded-result"}),
                ("flags-large-result", [500000, ["event"], 150000], {"engine": "embedded-columnar", "stages": ["scan", "project", "filter", "aggregate", "collect"], "scanColumns": ["event"], "materialize": "final-only", "risk": "large-result"}),
                ("rejects-impossible-estimate", [10, ["x"], 11], E("ValueError")),
            ],
            ["중간 결과를 Python으로 옮기지 말고 최종 결과만 collect하세요.", "읽는 열과 반환하는 행 수를 각각 제한해야 합니다."],
        ),
        "transfer": T(
            "columnar-cost-estimate",
            "새 로그 분석의 columnar scan 비용 추정하기",
            "projection 개념을 행 수·열 크기·선택 열에 따른 scan byte 계산으로 전이한다.",
            "estimate_scan_bytes(row_count, column_bytes, selected)를 완성해 fullBytes, scanBytes, savedRatio를 반환하세요.",
            "def estimate_scan_bytes(row_count, column_bytes, selected):\n    raise NotImplementedError",
            """def estimate_scan_bytes(row_count, column_bytes, selected):
    if row_count < 0 or any(value < 0 for value in column_bytes.values()):
        raise ValueError("negative size")
    missing = sorted(set(selected) - set(column_bytes))
    if missing:
        raise ValueError("unknown column")
    full = row_count * sum(column_bytes.values())
    scanned = row_count * sum(column_bytes[name] for name in set(selected))
    saved = 0.0 if full == 0 else round(1 - scanned / full, 4)
    return {"fullBytes": full, "scanBytes": scanned, "savedRatio": saved}
""",
            "estimate_scan_bytes",
            [
                ("estimates-projection-saving", [100, {"id": 8, "text": 100, "score": 8}, ["id", "score"]], {"fullBytes": 11600, "scanBytes": 1600, "savedRatio": 0.8621}),
                ("handles-empty-source", [0, {"id": 8}, ["id"]], {"fullBytes": 0, "scanBytes": 0, "savedRatio": 0.0}),
                ("rejects-unknown-column", [2, {"id": 8}, ["missing"]], E("ValueError")),
            ],
            ["columnar scan 비용은 선택한 열의 byte 합으로 계산하세요.", "0-byte source에서는 비율을 0으로 정의하세요."],
        ),
        "retrieval": decision(
            "duckdb-engine-choice",
            "DuckDB 실행 위치 선택 근거 회상하기",
            "로컬 파일 분석과 운영 트랜잭션 요청을 구분한다.",
            "choose_duckdb_engine(situation)를 완성해 engine, evidence, boundary를 반환하세요.",
            "choose_duckdb_engine",
            {
                "local-parquet-analysis": {"engine": "DuckDB", "evidence": "query plan and bounded result", "boundary": "local process"},
                "concurrent-order-writes": {"engine": "transactional service", "evidence": "write isolation", "boundary": "server database"},
                "browser-learning": {"engine": "portable concept check", "evidence": "hidden cases", "boundary": "no native package claim"},
            },
            ["분석용 임베디드 엔진과 다중 사용자 쓰기 DB를 구분하세요.", "웹 과제는 DuckDB 패키지 실행을 주장하지 않습니다."],
        ),
    },
    "00_MotherDuck소개": {
        "mastery": T(
            "remote-secret-boundary",
            "MotherDuck 연결 정보와 출력 경계 점검하기",
            "원격 연결 설정에서 token을 출력·쿼리·로그로 내보내지 않고 허용 필드만 반환한다.",
            "audit_remote_config(config, log_fields)를 완성해 ready, exposed, safeLog를 반환하세요.",
            "def audit_remote_config(config, log_fields):\n    raise NotImplementedError",
            """def audit_remote_config(config, log_fields):
    secret_names = {"token", "password", "api_key"}
    exposed = sorted(set(log_fields) & secret_names)
    safe_log = {name: config.get(name) for name in log_fields if name in config and name not in secret_names}
    ready = bool(config.get("database")) and bool(config.get("token")) and not exposed
    return {"ready": ready, "exposed": exposed, "safeLog": safe_log}
""",
            "audit_remote_config",
            [
                ("accepts-secret-outside-log", [{"database": "learn", "token": "secret", "region": "kr"}, ["database", "region"]], {"ready": True, "exposed": [], "safeLog": {"database": "learn", "region": "kr"}}),
                ("blocks-token-log", [{"database": "learn", "token": "secret"}, ["database", "token"]], {"ready": False, "exposed": ["token"], "safeLog": {"database": "learn"}}),
            ],
            ["secret 존재 여부만 확인하고 실제 값은 반환하지 마세요.", "로그 allowlist와 secret denylist를 함께 적용하세요."],
        ),
        "transfer": T(
            "remote-sync-budget",
            "새 원격 분석 작업의 전송 예산 세우기",
            "원격 실행 경계를 업로드 byte, 결과 byte, 반복 횟수의 총 전송량과 cache 판단으로 전이한다.",
            "plan_remote_sync(upload_bytes, result_bytes, runs, budget_bytes)를 완성하세요.",
            "def plan_remote_sync(upload_bytes, result_bytes, runs, budget_bytes):\n    raise NotImplementedError",
            """def plan_remote_sync(upload_bytes, result_bytes, runs, budget_bytes):
    values = [upload_bytes, result_bytes, runs, budget_bytes]
    if any(value < 0 for value in values):
        raise ValueError("negative budget input")
    total = upload_bytes + result_bytes * runs
    return {"totalBytes": total, "withinBudget": total <= budget_bytes, "cacheUpload": runs > 1 and upload_bytes > 0}
""",
            "plan_remote_sync",
            [
                ("reuses-upload-across-runs", [1000, 100, 3, 1500], {"totalBytes": 1300, "withinBudget": True, "cacheUpload": True}),
                ("detects-over-budget", [0, 800, 2, 1000], {"totalBytes": 1600, "withinBudget": False, "cacheUpload": False}),
                ("rejects-negative-byte", [-1, 0, 1, 10], E("ValueError")),
            ],
            ["업로드는 한 번, 결과 다운로드는 실행 횟수만큼 계산하세요.", "반복 실행에서는 immutable 입력을 cache할 수 있습니다."],
        ),
        "retrieval": decision(
            "remote-boundary-choice",
            "원격 분석의 보안·비용 경계 회상하기",
            "비밀값, 대용량 결과, 오프라인 재현 상황의 정책을 구분한다.",
            "choose_remote_boundary(situation)를 완성해 policy, evidence, risk를 반환하세요.",
            "choose_remote_boundary",
            {
                "credential-config": {"policy": "environment secret", "evidence": "redacted config audit", "risk": "token disclosure"},
                "large-result": {"policy": "aggregate remotely", "evidence": "result byte estimate", "risk": "egress cost"},
                "offline-reproduction": {"policy": "local snapshot", "evidence": "content hash", "risk": "stale data"},
            },
            ["비밀값은 코드와 학습 결과에 포함하지 마세요.", "원격에서는 원본보다 집계 결과를 이동하세요."],
        ),
    },
    "01": {
        "mastery": T(
            "select-where-contract",
            "SELECT·WHERE 결과 계약 구현하기",
            "필수 열을 검사하고 조건을 통과한 행만 projection 순서대로 반환한다.",
            "select_where(rows, column, minimum, projection)를 완성하세요.",
            "def select_where(rows, column, minimum, projection):\n    raise NotImplementedError",
            """def select_where(rows, column, minimum, projection):
    required = set(projection) | {column}
    if any(not required <= set(row) for row in rows):
        raise ValueError("schema mismatch")
    return [{name: row[name] for name in projection} for row in rows if row[column] >= minimum]
""",
            "select_where",
            [
                ("filters-tip-rows", [[{"day": "Fri", "total": 18, "tip": 3}, {"day": "Sat", "total": 10, "tip": 1}], "tip", 2, ["day", "tip"]], [{"day": "Fri", "tip": 3}]),
                ("keeps-threshold-equality", [[{"id": 1, "score": 5}], "score", 5, ["id"]], [{"id": 1}]),
                ("rejects-missing-column", [[{"id": 1}], "score", 0, ["id"]], E("ValueError")),
            ],
            ["WHERE 비교 열도 schema 계약에 포함하세요.", "projection은 필터가 끝난 뒤 적용하세요."],
        ),
        "transfer": T(
            "ordered-limit",
            "새 주문 데이터에 ORDER BY·LIMIT 전이하기",
            "필터 결과를 복합 정렬하고 제한하되 동점 순서를 안정화한다.",
            "top_orders(rows, status, limit)를 완성해 amount 내림차순, id 오름차순으로 반환하세요.",
            "def top_orders(rows, status, limit):\n    raise NotImplementedError",
            """def top_orders(rows, status, limit):
    if limit < 0:
        raise ValueError("negative limit")
    selected = [row for row in rows if row.get("status") == status]
    selected.sort(key=lambda row: (-row["amount"], row["id"]))
    return [{"id": row["id"], "amount": row["amount"]} for row in selected[:limit]]
""",
            "top_orders",
            [
                ("orders-and-limits", [[{"id": 2, "amount": 50, "status": "paid"}, {"id": 1, "amount": 50, "status": "paid"}, {"id": 3, "amount": 90, "status": "open"}], "paid", 1], [{"id": 1, "amount": 50}]),
                ("returns-empty-status", [[{"id": 1, "amount": 5, "status": "open"}], "paid", 3], []),
                ("rejects-negative-limit", [[], "paid", -1], E("ValueError")),
            ],
            ["WHERE가 먼저, ORDER BY가 다음, LIMIT가 마지막입니다.", "동점에는 id 같은 안정적인 두 번째 key를 두세요."],
        ),
        "retrieval": decision(
            "row-operation-order",
            "기본 SQL 연산 순서 회상하기",
            "필터, projection, 정렬, 제한의 논리적 책임을 구분한다.",
            "choose_row_operation(situation)를 완성해 stage, evidence, pitfall을 반환하세요.",
            "choose_row_operation",
            {
                "remove-low-tips": {"stage": "WHERE", "evidence": "row predicate", "pitfall": "filter after limit"},
                "keep-two-columns": {"stage": "SELECT", "evidence": "output schema", "pitfall": "scan every unused column"},
                "top-five": {"stage": "ORDER BY then LIMIT", "evidence": "stable sort keys", "pitfall": "limit before sort"},
            },
            ["행 조건과 출력 열 선택을 분리하세요.", "top N은 정렬 근거가 없으면 재현되지 않습니다."],
        ),
    },
    "02": {
        "mastery": T(
            "survival-group-rate",
            "타이타닉 그룹별 생존율의 분모 보존하기",
            "객실 등급·성별 그룹에서 known outcome만 분모로 사용하고 count와 rate를 함께 반환한다.",
            "survival_by_group(rows)를 완성하세요.",
            "def survival_by_group(rows):\n    raise NotImplementedError",
            """def survival_by_group(rows):
    grouped = {}
    for row in rows:
        if row.get("survived") not in (0, 1):
            continue
        key = (row["pclass"], row["sex"])
        bucket = grouped.setdefault(key, [0, 0])
        bucket[0] += row["survived"]
        bucket[1] += 1
    return [{"pclass": key[0], "sex": key[1], "known": value[1], "rate": round(value[0] / value[1], 3)} for key, value in sorted(grouped.items())]
""",
            "survival_by_group",
            [
                ("uses-known-outcomes", [[{"pclass": 1, "sex": "f", "survived": 1}, {"pclass": 1, "sex": "f", "survived": None}, {"pclass": 1, "sex": "f", "survived": 0}]], [{"pclass": 1, "sex": "f", "known": 2, "rate": 0.5}]),
                ("groups-by-two-keys", [[{"pclass": 2, "sex": "m", "survived": 1}, {"pclass": 1, "sex": "m", "survived": 1}]], [{"pclass": 1, "sex": "m", "known": 1, "rate": 1.0}, {"pclass": 2, "sex": "m", "known": 1, "rate": 1.0}]),
            ],
            ["NULL outcome은 0으로 바꾸지 말고 분모에서 제외하세요.", "비율 옆에 known count를 항상 남기세요."],
        ),
        "transfer": T(
            "conversion-cohort-rate",
            "새 캠페인 데이터에 그룹 집계 전이하기",
            "생존율 집계를 캠페인별 유효 전환율과 제외 수 계산으로 옮긴다.",
            "conversion_by_campaign(rows)를 완성하세요.",
            "def conversion_by_campaign(rows):\n    raise NotImplementedError",
            """def conversion_by_campaign(rows):
    grouped = {}
    for row in rows:
        bucket = grouped.setdefault(row["campaign"], {"yes": 0, "known": 0, "excluded": 0})
        if row.get("converted") in (True, False):
            bucket["yes"] += int(row["converted"])
            bucket["known"] += 1
        else:
            bucket["excluded"] += 1
    return {name: {"known": b["known"], "excluded": b["excluded"], "rate": None if not b["known"] else round(b["yes"] / b["known"], 3)} for name, b in sorted(grouped.items())}
""",
            "conversion_by_campaign",
            [
                ("reports-rate-and-exclusion", [[{"campaign": "A", "converted": True}, {"campaign": "A", "converted": None}, {"campaign": "A", "converted": False}]], {"A": {"known": 2, "excluded": 1, "rate": 0.5}}),
                ("keeps-empty-denominator-visible", [[{"campaign": "B", "converted": None}]], {"B": {"known": 0, "excluded": 1, "rate": None}}),
            ],
            ["유효 분모가 0이면 rate를 0으로 꾸미지 말고 None으로 남기세요.", "제외된 행 수도 품질 증거입니다."],
        ),
        "retrieval": decision(
            "aggregate-denominator",
            "집계 함수와 분모 선택 회상하기",
            "COUNT(*), COUNT(column), AVG(binary)의 NULL 처리 차이를 구분한다.",
            "choose_aggregate_denominator(situation)를 완성하세요.",
            "choose_aggregate_denominator",
            {
                "all-passengers": {"aggregate": "COUNT(*)", "denominator": "all rows", "risk": "none"},
                "known-ages": {"aggregate": "COUNT(age)", "denominator": "non-null age", "risk": "hidden missingness"},
                "survival-rate": {"aggregate": "AVG(survived)", "denominator": "known binary outcomes", "risk": "unknown treated as zero"},
            },
            ["COUNT(column)은 NULL을 세지 않습니다.", "평균의 실제 분모를 결과와 함께 기록하세요."],
        ),
    },
    "03": {
        "mastery": T(
            "tip-tier-case",
            "CASE WHEN 팁 등급과 정렬 규칙 만들기",
            "tip rate 경계를 겹치지 않게 분류하고 rate 내림차순으로 반환한다.",
            "classify_tips(rows)를 완성하세요.",
            "def classify_tips(rows):\n    raise NotImplementedError",
            """def classify_tips(rows):
    result = []
    for row in rows:
        if row["total"] <= 0:
            raise ValueError("non-positive total")
        rate = row["tip"] / row["total"]
        tier = "high" if rate >= 0.2 else "standard" if rate >= 0.15 else "low"
        result.append({"id": row["id"], "rate": round(rate, 3), "tier": tier})
    return sorted(result, key=lambda row: (-row["rate"], row["id"]))
""",
            "classify_tips",
            [
                ("classifies-boundaries", [[{"id": 2, "total": 20, "tip": 3}, {"id": 1, "total": 10, "tip": 2}]], [{"id": 1, "rate": 0.2, "tier": "high"}, {"id": 2, "rate": 0.15, "tier": "standard"}]),
                ("classifies-low-tip", [[{"id": 3, "total": 40, "tip": 4}]], [{"id": 3, "rate": 0.1, "tier": "low"}]),
                ("rejects-zero-total", [[{"id": 1, "total": 0, "tip": 0}]], E("ValueError")),
            ],
            ["높은 threshold부터 CASE 조건을 배치하세요.", "tip rate 분모가 0인 행은 명시적으로 거부하세요."],
        ),
        "transfer": T(
            "shipping-service-tier",
            "새 배송 데이터에 조건 분류 전이하기",
            "배송 지연일과 파손 여부를 우선순위가 있는 service tier로 분류한다.",
            "classify_shipping(rows)를 완성해 id와 tier를 반환하세요.",
            "def classify_shipping(rows):\n    raise NotImplementedError",
            """def classify_shipping(rows):
    result = []
    for row in rows:
        if row["damaged"]:
            tier = "critical"
        elif row["delay_days"] >= 3:
            tier = "late"
        elif row["delay_days"] > 0:
            tier = "watch"
        else:
            tier = "on-time"
        result.append({"id": row["id"], "tier": tier})
    return sorted(result, key=lambda row: row["id"])
""",
            "classify_shipping",
            [
                ("prioritizes-damage", [[{"id": 2, "delay_days": 5, "damaged": True}, {"id": 1, "delay_days": 3, "damaged": False}]], [{"id": 1, "tier": "late"}, {"id": 2, "tier": "critical"}]),
                ("separates-watch-and-on-time", [[{"id": 4, "delay_days": 1, "damaged": False}, {"id": 3, "delay_days": 0, "damaged": False}]], [{"id": 3, "tier": "on-time"}, {"id": 4, "tier": "watch"}]),
            ],
            ["서로 겹치는 조건은 업무상 우선순위가 높은 것부터 평가하세요.", "경계값 0과 3을 별도 사례로 확인하세요."],
        ),
        "retrieval": decision(
            "case-order-policy",
            "CASE WHEN 조건 순서 회상하기",
            "겹치는 범위, NULL, fallback 처리 원칙을 구분한다.",
            "choose_case_policy(situation)를 완성하세요.",
            "choose_case_policy",
            {
                "overlapping-thresholds": {"policy": "most specific first", "evidence": "boundary cases", "risk": "unreachable branch"},
                "nullable-input": {"policy": "explicit NULL branch", "evidence": "missing count", "risk": "silent ELSE"},
                "unexpected-category": {"policy": "named ELSE or reject", "evidence": "unknown count", "risk": "misclassification"},
            },
            ["CASE는 첫 번째 참인 분기에서 멈춥니다.", "ELSE가 어떤 데이터를 숨기는지 측정하세요."],
        ),
    },
    "04": {
        "mastery": T(
            "having-null-groups",
            "NULL을 분리한 뒤 HAVING으로 표본 필터링하기",
            "연령 결측 수를 보존하고 객실 등급별 known age 평균을 최소 표본 수로 필터한다.",
            "age_groups(rows, minimum_known)를 완성하세요.",
            "def age_groups(rows, minimum_known):\n    raise NotImplementedError",
            """def age_groups(rows, minimum_known):
    grouped = {}
    for row in rows:
        bucket = grouped.setdefault(str(row["pclass"]), {"values": [], "missing": 0})
        if row.get("age") is None:
            bucket["missing"] += 1
        else:
            bucket["values"].append(row["age"])
    result = []
    for pclass, bucket in sorted(grouped.items()):
        if len(bucket["values"]) >= minimum_known:
            result.append({"pclass": int(pclass), "known": len(bucket["values"]), "missing": bucket["missing"], "meanAge": round(sum(bucket["values"]) / len(bucket["values"]), 2)})
    return result
""",
            "age_groups",
            [
                ("filters-after-aggregation", [[{"pclass": 1, "age": 20}, {"pclass": 1, "age": 40}, {"pclass": 1, "age": None}, {"pclass": 2, "age": 30}], 2], [{"pclass": 1, "known": 2, "missing": 1, "meanAge": 30.0}]),
                ("allows-one-known", [[{"pclass": 3, "age": 18}], 1], [{"pclass": 3, "known": 1, "missing": 0, "meanAge": 18.0}]),
            ],
            ["known age count로 HAVING 조건을 판단하세요.", "NULL 행을 버리기 전에 missing count를 보존하세요."],
        ),
        "transfer": T(
            "sensor-missingness-gate",
            "새 센서 데이터에 결측 품질 게이트 전이하기",
            "장비별 결측률을 계산하고 허용률을 넘은 장비를 분리한다.",
            "sensor_quality(rows, maximum_missing_rate)를 완성하세요.",
            "def sensor_quality(rows, maximum_missing_rate):\n    raise NotImplementedError",
            """def sensor_quality(rows, maximum_missing_rate):
    grouped = {}
    for row in rows:
        bucket = grouped.setdefault(row["sensor"], [0, 0])
        bucket[1] += 1
        bucket[0] += int(row.get("value") is None)
    result = []
    for sensor, (missing, total) in sorted(grouped.items()):
        rate = round(missing / total, 3)
        result.append({"sensor": sensor, "missing": missing, "total": total, "rate": rate, "accepted": rate <= maximum_missing_rate})
    return result
""",
            "sensor_quality",
            [
                ("marks-unhealthy-sensor", [[{"sensor": "a", "value": None}, {"sensor": "a", "value": 1}, {"sensor": "b", "value": 2}], 0.25], [{"sensor": "a", "missing": 1, "total": 2, "rate": 0.5, "accepted": False}, {"sensor": "b", "missing": 0, "total": 1, "rate": 0.0, "accepted": True}]),
                ("accepts-threshold-equality", [[{"sensor": "c", "value": None}, {"sensor": "c", "value": 4}], 0.5], [{"sensor": "c", "missing": 1, "total": 2, "rate": 0.5, "accepted": True}]),
            ],
            ["결측률 분모는 센서별 전체 관측 수입니다.", "임계값과 같은 경우의 정책을 명시하세요."],
        ),
        "retrieval": decision(
            "where-having-null",
            "WHERE·HAVING·NULL 판단 회상하기",
            "row filter와 aggregate filter, NULL 비교 방식을 구분한다.",
            "choose_filter_stage(situation)를 완성하세요.",
            "choose_filter_stage",
            {
                "age-is-missing": {"stage": "WHERE age IS NULL", "evidence": "missing row count", "risk": "equals NULL"},
                "groups-over-ten": {"stage": "HAVING COUNT(*) > 10", "evidence": "group count", "risk": "aggregate in WHERE"},
                "positive-fares": {"stage": "WHERE fare > 0", "evidence": "row predicate", "risk": "late filter"},
            },
            ["NULL은 `= NULL`이 아니라 IS NULL로 검사하세요.", "HAVING은 그룹을 만든 뒤 적용됩니다."],
        ),
    },
    "05": {
        "mastery": T(
            "above-dynamic-average",
            "스칼라 서브쿼리의 동적 기준 구현하기",
            "전체 평균보다 tip rate가 높은 행을 고정 숫자 없이 계산한다.",
            "above_average_tip_rate(rows)를 완성하세요.",
            "def above_average_tip_rate(rows):\n    raise NotImplementedError",
            """def above_average_tip_rate(rows):
    rates = []
    for row in rows:
        if row["total"] <= 0:
            raise ValueError("non-positive total")
        rates.append((row["id"], row["tip"] / row["total"]))
    if not rates:
        return {"average": None, "ids": []}
    average = sum(rate for _, rate in rates) / len(rates)
    return {"average": round(average, 3), "ids": sorted(row_id for row_id, rate in rates if rate > average)}
""",
            "above_average_tip_rate",
            [
                ("uses-computed-average", [[{"id": 1, "total": 10, "tip": 1}, {"id": 2, "total": 10, "tip": 3}]], {"average": 0.2, "ids": [2]}),
                ("handles-empty-input", [[]], {"average": None, "ids": []}),
                ("rejects-zero-total", [[{"id": 1, "total": 0, "tip": 1}]], E("ValueError")),
            ],
            ["기준 평균과 각 행의 비율을 같은 정의로 계산하세요.", "평균과 같은 행은 `>` 조건에서 제외됩니다."],
        ),
        "transfer": T(
            "correlated-peer-benchmark",
            "새 급여 데이터에 상관 서브쿼리 전이하기",
            "각 직원 급여를 자기 부서의 동료 평균과 비교한다.",
            "above_department_average(rows)를 완성하세요.",
            "def above_department_average(rows):\n    raise NotImplementedError",
            """def above_department_average(rows):
    grouped = {}
    for row in rows:
        grouped.setdefault(row["department"], []).append(row["salary"])
    averages = {name: sum(values) / len(values) for name, values in grouped.items()}
    result = []
    for row in rows:
        benchmark = averages[row["department"]]
        if row["salary"] > benchmark:
            result.append({"id": row["id"], "department": row["department"], "benchmark": round(benchmark, 2)})
    return sorted(result, key=lambda row: row["id"])
""",
            "above_department_average",
            [
                ("compares-with-own-department", [[{"id": 1, "department": "A", "salary": 100}, {"id": 2, "department": "A", "salary": 200}, {"id": 3, "department": "B", "salary": 1000}]], [{"id": 2, "department": "A", "benchmark": 150.0}]),
                ("returns-none-for-singletons", [[{"id": 4, "department": "C", "salary": 50}]], []),
            ],
            ["상관 기준은 현재 행의 department로 제한하세요.", "자기 자신도 부서 평균 분모에 포함되는 정의입니다."],
        ),
        "retrieval": decision(
            "subquery-shape",
            "서브쿼리 결과 shape 회상하기",
            "scalar, set, correlated 기준의 사용 위치를 구분한다.",
            "choose_subquery_shape(situation)를 완성하세요.",
            "choose_subquery_shape",
            {
                "compare-overall-average": {"shape": "scalar", "operator": ">", "risk": "multiple rows"},
                "allowed-customer-ids": {"shape": "set", "operator": "IN", "risk": "NULL membership"},
                "compare-with-own-group": {"shape": "correlated scalar", "operator": ">", "risk": "repeated work"},
            },
            ["비교 연산자는 서브쿼리의 반환 행 수와 맞아야 합니다.", "상관 서브쿼리는 join이나 window로 바꿀 수 있는지 검토하세요."],
        ),
    },
    "06": {
        "mastery": T(
            "cte-stage-ledger",
            "CTE 단계별 데이터 계약 추적하기",
            "raw, valid, grouped 단계가 필요 열을 잃지 않는지 lineage와 row count로 검증한다.",
            "audit_cte_stages(stages, required_output)를 완성하세요.",
            "def audit_cte_stages(stages, required_output):\n    raise NotImplementedError",
            """def audit_cte_stages(stages, required_output):
    if not stages:
        raise ValueError("no stages")
    failures = []
    previous_count = None
    for stage in stages:
        if previous_count is not None and stage["rowCount"] > previous_count and not stage.get("allowsGrowth", False):
            failures.append(stage["name"] + ":unexpected-growth")
        previous_count = stage["rowCount"]
    missing = sorted(set(required_output) - set(stages[-1]["columns"]))
    failures += ["final:missing:" + name for name in missing]
    return {"valid": not failures, "failures": failures, "lineage": [stage["name"] for stage in stages]}
""",
            "audit_cte_stages",
            [
                ("accepts-contract", [[{"name": "raw", "rowCount": 10, "columns": ["day", "tip"]}, {"name": "valid", "rowCount": 8, "columns": ["day", "tip"]}, {"name": "grouped", "rowCount": 2, "columns": ["day", "meanTip"]}], ["day", "meanTip"]], {"valid": True, "failures": [], "lineage": ["raw", "valid", "grouped"]}),
                ("reports-growth-and-column-loss", [[{"name": "raw", "rowCount": 2, "columns": ["id"]}, {"name": "joined", "rowCount": 3, "columns": ["id"]}], ["id", "amount"]], {"valid": False, "failures": ["joined:unexpected-growth", "final:missing:amount"], "lineage": ["raw", "joined"]}),
                ("rejects-empty-stages", [[], ["id"]], E("ValueError")),
            ],
            ["각 CTE에 row count와 output columns 계약을 붙이세요.", "join으로 행이 늘어나는 단계는 allowsGrowth를 명시해야 합니다."],
        ),
        "transfer": T(
            "pipeline-checkpoints",
            "새 정산 파이프라인에 CTE 구조 전이하기",
            "filter, normalize, aggregate 단계별 checkpoint를 계산해 첫 실패 단계를 찾는다.",
            "reconcile_pipeline(checkpoints)를 완성하세요.",
            "def reconcile_pipeline(checkpoints):\n    raise NotImplementedError",
            """def reconcile_pipeline(checkpoints):
    for checkpoint in checkpoints:
        if checkpoint["actual"] != checkpoint["expected"]:
            return {"passed": False, "failedStage": checkpoint["stage"], "delta": checkpoint["actual"] - checkpoint["expected"]}
    return {"passed": True, "failedStage": None, "delta": 0}
""",
            "reconcile_pipeline",
            [
                ("finds-first-mismatch", [[{"stage": "valid", "actual": 5, "expected": 5}, {"stage": "grouped", "actual": 4, "expected": 3}, {"stage": "final", "actual": 1, "expected": 2}]], {"passed": False, "failedStage": "grouped", "delta": 1}),
                ("accepts-all-checkpoints", [[{"stage": "raw", "actual": 7, "expected": 7}]], {"passed": True, "failedStage": None, "delta": 0}),
            ],
            ["최종 결과만 비교하지 말고 첫 불일치 단계를 반환하세요.", "delta 부호로 과다·누락을 구분하세요."],
        ),
        "retrieval": decision(
            "cte-responsibility",
            "CTE 분리 기준 회상하기",
            "정제, 집계, 재사용, 디버깅 상황의 단계 책임을 구분한다.",
            "choose_cte_boundary(situation)를 완성하세요.",
            "choose_cte_boundary",
            {
                "reused-valid-rows": {"boundary": "valid_rows CTE", "evidence": "one predicate definition", "risk": "duplicated filters"},
                "group-before-rank": {"boundary": "aggregate then rank CTE", "evidence": "stage row counts", "risk": "wrong grain"},
                "single-trivial-expression": {"boundary": "inline expression", "evidence": "no reused contract", "risk": "unnecessary fragmentation"},
            },
            ["CTE 이름은 데이터의 grain과 책임을 드러내야 합니다.", "단계를 많이 나누는 것 자체가 목표는 아닙니다."],
        ),
    },
    "07": {
        "mastery": T(
            "partition-row-number",
            "PARTITION BY 안에서 안정적 순위 매기기",
            "그룹별 score 내림차순, id 오름차순으로 row number를 붙이되 행을 줄이지 않는다.",
            "rank_within_group(rows)를 완성하세요.",
            "def rank_within_group(rows):\n    raise NotImplementedError",
            """def rank_within_group(rows):
    grouped = {}
    for row in rows:
        grouped.setdefault(row["group"], []).append(row)
    result = []
    for name in sorted(grouped):
        ordered = sorted(grouped[name], key=lambda row: (-row["score"], row["id"]))
        for position, row in enumerate(ordered, 1):
            result.append({"id": row["id"], "group": name, "score": row["score"], "rowNumber": position})
    return result
""",
            "rank_within_group",
            [
                ("resets-rank-per-group", [[{"id": 2, "group": "A", "score": 9}, {"id": 1, "group": "A", "score": 9}, {"id": 3, "group": "B", "score": 1}]], [{"id": 1, "group": "A", "score": 9, "rowNumber": 1}, {"id": 2, "group": "A", "score": 9, "rowNumber": 2}, {"id": 3, "group": "B", "score": 1, "rowNumber": 1}]),
                ("handles-empty-input", [[]], []),
            ],
            ["PARTITION마다 번호를 1부터 다시 시작하세요.", "동점에도 재현 가능한 id 정렬을 추가하세요."],
        ),
        "transfer": T(
            "running-account-balance",
            "새 거래 데이터에 누적 window 전이하기",
            "계좌별 시간 순서로 running balance를 계산하고 원래 거래 grain을 보존한다.",
            "running_balances(rows)를 완성하세요.",
            "def running_balances(rows):\n    raise NotImplementedError",
            """def running_balances(rows):
    grouped = {}
    for row in rows:
        grouped.setdefault(row["account"], []).append(row)
    result = []
    for account in sorted(grouped):
        balance = 0
        for row in sorted(grouped[account], key=lambda item: (item["time"], item["id"])):
            balance += row["amount"]
            result.append({"id": row["id"], "account": account, "balance": balance})
    return result
""",
            "running_balances",
            [
                ("accumulates-per-account", [[{"id": 2, "account": "a", "time": 2, "amount": -3}, {"id": 1, "account": "a", "time": 1, "amount": 10}, {"id": 3, "account": "b", "time": 1, "amount": 5}]], [{"id": 1, "account": "a", "balance": 10}, {"id": 2, "account": "a", "balance": 7}, {"id": 3, "account": "b", "balance": 5}]),
                ("handles-empty-ledger", [[]], []),
            ],
            ["누적값은 account partition마다 0에서 시작하세요.", "같은 시각에는 id로 순서를 안정화하세요."],
        ),
        "retrieval": decision(
            "window-vs-group",
            "윈도우와 GROUP BY 선택 회상하기",
            "행 grain 보존 여부에 따라 연산을 선택한다.",
            "choose_window_operation(situation)를 완성하세요.",
            "choose_window_operation",
            {
                "one-row-per-department": {"operation": "GROUP BY", "grain": "department", "risk": "none"},
                "employee-plus-department-average": {"operation": "window AVG", "grain": "employee", "risk": "missing partition"},
                "top-one-per-group": {"operation": "ROW_NUMBER then QUALIFY", "grain": "selected employee", "risk": "unstable ties"},
            },
            ["원래 행을 남겨야 하면 window를 사용하세요.", "window 결과를 필터할 때 정렬 tie-breaker를 명시하세요."],
        ),
    },
    "08": {
        "mastery": T(
            "lag-moving-window",
            "LAG와 이동 평균을 같은 시간축에 계산하기",
            "센서별 시각 순서에서 이전 값 차이와 현재 포함 3개 이동 평균을 반환한다.",
            "sensor_windows(rows)를 완성하세요.",
            "def sensor_windows(rows):\n    raise NotImplementedError",
            """def sensor_windows(rows):
    grouped = {}
    for row in rows:
        grouped.setdefault(row["sensor"], []).append(row)
    result = []
    for sensor in sorted(grouped):
        values = []
        for row in sorted(grouped[sensor], key=lambda item: item["time"]):
            previous = values[-1] if values else None
            values.append(row["value"])
            frame = values[-3:]
            result.append({"sensor": sensor, "time": row["time"], "delta": None if previous is None else row["value"] - previous, "movingMean": round(sum(frame) / len(frame), 2)})
    return result
""",
            "sensor_windows",
            [
                ("computes-lag-and-bounded-frame", [[{"sensor": "a", "time": 1, "value": 3}, {"sensor": "a", "time": 2, "value": 6}, {"sensor": "a", "time": 3, "value": 9}, {"sensor": "a", "time": 4, "value": 12}]], [{"sensor": "a", "time": 1, "delta": None, "movingMean": 3.0}, {"sensor": "a", "time": 2, "delta": 3, "movingMean": 4.5}, {"sensor": "a", "time": 3, "delta": 3, "movingMean": 6.0}, {"sensor": "a", "time": 4, "delta": 3, "movingMean": 9.0}]),
                ("resets-partition", [[{"sensor": "b", "time": 1, "value": 7}]], [{"sensor": "b", "time": 1, "delta": None, "movingMean": 7.0}]),
            ],
            ["LAG 첫 행은 이전 값이 없으므로 None입니다.", "ROWS 2 PRECEDING 프레임은 최대 현재 포함 3개입니다."],
        ),
        "transfer": T(
            "qualify-change-events",
            "새 가격 데이터에 QUALIFY 패턴 전이하기",
            "상품별 이전 가격과 비교해 threshold 이상의 변화 행만 남긴다.",
            "significant_price_changes(rows, threshold)를 완성하세요.",
            "def significant_price_changes(rows, threshold):\n    raise NotImplementedError",
            """def significant_price_changes(rows, threshold):
    grouped = {}
    for row in rows:
        grouped.setdefault(row["product"], []).append(row)
    result = []
    for product in sorted(grouped):
        previous = None
        for row in sorted(grouped[product], key=lambda item: item["date"]):
            if previous is not None:
                change = row["price"] - previous
                if abs(change) >= threshold:
                    result.append({"product": product, "date": row["date"], "change": change})
            previous = row["price"]
    return result
""",
            "significant_price_changes",
            [
                ("filters-after-lag", [[{"product": "A", "date": 1, "price": 10}, {"product": "A", "date": 2, "price": 12}, {"product": "A", "date": 3, "price": 8}], 3], [{"product": "A", "date": 3, "change": -4}]),
                ("does-not-cross-products", [[{"product": "A", "date": 1, "price": 100}, {"product": "B", "date": 1, "price": 1}], 1], []),
            ],
            ["먼저 LAG를 계산하고 그 결과를 QUALIFY 조건으로 거르세요.", "partition 사이의 이전 값을 섞지 마세요."],
        ),
        "retrieval": decision(
            "advanced-window-frame",
            "고급 window frame 선택 회상하기",
            "LAG, rolling ROWS, QUALIFY의 책임을 구분한다.",
            "choose_advanced_window(situation)를 완성하세요.",
            "choose_advanced_window",
            {
                "previous-event": {"function": "LAG", "frame": "ordered partition", "risk": "missing order"},
                "last-seven-rows": {"function": "AVG", "frame": "ROWS 6 PRECEDING", "risk": "date gaps"},
                "filter-window-rank": {"function": "QUALIFY", "frame": "after window", "risk": "WHERE too early"},
            },
            ["ROWS frame은 달력 기간이 아니라 행 개수입니다.", "window alias 필터는 QUALIFY 단계에서 수행하세요."],
        ),
    },
    "09": {
        "mastery": T(
            "string-normalization",
            "문자열 정규화와 패턴 추출 계약 만들기",
            "email의 공백·대소문자를 정규화하고 유효한 domain만 추출한다.",
            "normalize_emails(values)를 완성해 rows와 invalidCount를 반환하세요.",
            "def normalize_emails(values):\n    raise NotImplementedError",
            """def normalize_emails(values):
    rows = []
    invalid = 0
    for value in values:
        normalized = value.strip().lower()
        if normalized.count("@") != 1 or not all(normalized.split("@")):
            invalid += 1
            continue
        local, domain = normalized.split("@")
        if "." not in domain:
            invalid += 1
            continue
        rows.append({"email": normalized, "local": local, "domain": domain})
    return {"rows": rows, "invalidCount": invalid}
""",
            "normalize_emails",
            [
                ("normalizes-and-extracts", [[" Alice@Example.COM ", "bad", "bob@test.io"]], {"rows": [{"email": "alice@example.com", "local": "alice", "domain": "example.com"}, {"email": "bob@test.io", "local": "bob", "domain": "test.io"}], "invalidCount": 1}),
                ("rejects-empty-local", [["@example.com"]], {"rows": [], "invalidCount": 1}),
            ],
            ["TRIM과 LOWER를 패턴 검사 전에 적용하세요.", "제외한 문자열 수를 함께 반환하세요."],
        ),
        "transfer": T(
            "sku-pattern-parser",
            "새 SKU 데이터에 문자열 패턴 전이하기",
            "대문자 category와 숫자 code로 구성된 SKU만 구조화한다.",
            "parse_skus(values)를 완성하세요.",
            "def parse_skus(values):\n    raise NotImplementedError",
            """def parse_skus(values):
    parsed = []
    rejected = []
    for value in values:
        parts = value.strip().split("-")
        if len(parts) != 2 or not parts[0].isalpha() or not parts[1].isdigit():
            rejected.append(value)
            continue
        parsed.append({"raw": value, "category": parts[0].upper(), "code": int(parts[1])})
    return {"parsed": parsed, "rejected": rejected}
""",
            "parse_skus",
            [
                ("parses-valid-skus", [["ab-001", " HOME-42 "]], {"parsed": [{"raw": "ab-001", "category": "AB", "code": 1}, {"raw": " HOME-42 ", "category": "HOME", "code": 42}], "rejected": []}),
                ("keeps-rejected-evidence", [["A-x", "A-1-2"]], {"parsed": [], "rejected": ["A-x", "A-1-2"]}),
            ],
            ["split 결과의 segment 수를 먼저 확인하세요.", "정제된 값과 원본 증거를 혼동하지 마세요."],
        ),
        "retrieval": decision(
            "string-function-choice",
            "문자열 함수 선택 회상하기",
            "부분 일치, 고정 위치, 구조 패턴에 맞는 함수를 구분한다.",
            "choose_string_function(situation)를 완성하세요.",
            "choose_string_function",
            {
                "prefix-search": {"function": "LIKE 'ABC%'", "evidence": "matched count", "risk": "case sensitivity"},
                "fixed-slice": {"function": "SUBSTR", "evidence": "position examples", "risk": "one-based index"},
                "structured-token": {"function": "REGEXP_EXTRACT", "evidence": "rejected examples", "risk": "partial match"},
            },
            ["단순 패턴에는 복잡한 정규식을 쓰지 않아도 됩니다.", "정규식은 전체 match인지 일부 match인지 명시하세요."],
        ),
    },
    "10": {
        "mastery": T(
            "analytics-capstone-report",
            "집계·window·품질 증거를 한 보고서로 통합하기",
            "지역별 유효 주문의 매출·주문 수·점유율·순위를 계산하고 제외 수를 보존한다.",
            "regional_sales_report(rows)를 완성하세요.",
            "def regional_sales_report(rows):\n    raise NotImplementedError",
            """def regional_sales_report(rows):
    grouped = {}
    excluded = 0
    for row in rows:
        if row.get("status") != "paid" or row.get("amount") is None or row["amount"] < 0:
            excluded += 1
            continue
        bucket = grouped.setdefault(row["region"], {"revenue": 0, "orders": 0})
        bucket["revenue"] += row["amount"]
        bucket["orders"] += 1
    total = sum(bucket["revenue"] for bucket in grouped.values())
    ordered = sorted(grouped.items(), key=lambda item: (-item[1]["revenue"], item[0]))
    regions = [{"region": name, "revenue": bucket["revenue"], "orders": bucket["orders"], "share": 0.0 if total == 0 else round(bucket["revenue"] / total, 3), "rank": index} for index, (name, bucket) in enumerate(ordered, 1)]
    return {"regions": regions, "totalRevenue": total, "excluded": excluded}
""",
            "regional_sales_report",
            [
                ("builds-ranked-report", [[{"region": "East", "status": "paid", "amount": 30}, {"region": "West", "status": "paid", "amount": 70}, {"region": "East", "status": "open", "amount": 100}]], {"regions": [{"region": "West", "revenue": 70, "orders": 1, "share": 0.7, "rank": 1}, {"region": "East", "revenue": 30, "orders": 1, "share": 0.3, "rank": 2}], "totalRevenue": 100, "excluded": 1}),
                ("handles-no-valid-sales", [[{"region": "X", "status": "open", "amount": 2}]], {"regions": [], "totalRevenue": 0, "excluded": 1}),
            ],
            ["유효 행 filter, region 집계, 전체 대비 share, rank 순서로 단계화하세요.", "제외 수와 전체 매출을 보고서 계약에 포함하세요."],
        ),
        "transfer": T(
            "idempotent-batch-audit",
            "새 배치 분석에 재실행 안전성 전이하기",
            "입력 batch와 기존 output key를 비교해 write, skip, conflict를 결정한다.",
            "plan_idempotent_batch(rows, existing)를 완성하세요.",
            "def plan_idempotent_batch(rows, existing):\n    raise NotImplementedError",
            """def plan_idempotent_batch(rows, existing):
    seen = {}
    conflicts = []
    for row in rows:
        key = row["key"]
        value = row["value"]
        if key in seen and seen[key] != value:
            conflicts.append(key)
        seen[key] = value
    writes = sorted(key for key, value in seen.items() if key not in existing)
    skips = sorted(key for key, value in seen.items() if existing.get(key) == value)
    conflicts += [key for key, value in seen.items() if key in existing and existing[key] != value]
    return {"writes": writes, "skips": skips, "conflicts": sorted(set(conflicts)), "safe": not conflicts}
""",
            "plan_idempotent_batch",
            [
                ("separates-write-and-skip", [[{"key": "a", "value": 1}, {"key": "b", "value": 2}], {"a": 1}], {"writes": ["b"], "skips": ["a"], "conflicts": [], "safe": True}),
                ("detects-existing-and-batch-conflicts", [[{"key": "a", "value": 1}, {"key": "a", "value": 2}, {"key": "b", "value": 3}], {"b": 4}], {"writes": ["a"], "skips": [], "conflicts": ["a", "b"], "safe": False}),
            ],
            ["같은 key·같은 value는 재실행 시 skip할 수 있습니다.", "batch 내부 충돌과 기존 output 충돌을 모두 검사하세요."],
        ),
        "retrieval": decision(
            "capstone-evidence-chain",
            "종합 분석의 증거 사슬 회상하기",
            "질문, grain, 품질, 성능, 재실행 증거를 구분한다.",
            "choose_capstone_evidence(situation)를 완성하세요.",
            "choose_capstone_evidence",
            {
                "business-question": {"evidence": "metric definition and denominator", "stage": "contract", "risk": "answer drift"},
                "query-performance": {"evidence": "EXPLAIN plan and scanned bytes", "stage": "execution", "risk": "early materialization"},
                "repeatable-output": {"evidence": "input hash and output key", "stage": "publication", "risk": "duplicate write"},
            },
            ["차트만으로 정답을 주장하지 말고 metric 계약을 남기세요.", "성능과 재현성은 서로 다른 증거입니다."],
        ),
    },
}
