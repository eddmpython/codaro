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
            "HTTP 성공과 업무 데이터의 유효성을 별도 근거로 판정하세요.",
            "요청 action과 함께 재현 가능한 evidence와 남는 risk를 기록하세요.",
        ],
    )


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "http-request-contract",
            "HTTP 요청의 method·origin·timeout 계약 감사하기",
            "실제 호출 전에 허용 origin, timeout, body 정책이 빠진 요청을 차단한다.",
            "audit_request_contract(request, allowed_origins)를 완성하세요.",
            "def audit_request_contract(request, allowed_origins):\n    raise NotImplementedError",
            """def audit_request_contract(request, allowed_origins):
    from urllib.parse import urlsplit
    required = {"method", "url", "timeoutSeconds"}
    missing = sorted(required - set(request))
    failures = []
    if request.get("method") not in {"GET", "POST", "PUT", "PATCH", "DELETE"}:
        failures.append("method")
    parts = urlsplit(request.get("url", ""))
    origin = f"{parts.scheme}://{parts.netloc}" if parts.scheme and parts.netloc else ""
    if origin not in allowed_origins:
        failures.append("origin")
    if request.get("timeoutSeconds", 0) <= 0:
        failures.append("timeout")
    if request.get("method") in {"GET", "DELETE"} and request.get("json") is not None:
        failures.append("body-policy")
    return {"ready": not missing and not failures, "missing": missing, "failures": failures, "origin": origin}
""",
            "audit_request_contract",
            [
                (
                    "accepts-bounded-get",
                    [{"method": "GET", "url": "https://api.example.test/items", "timeoutSeconds": 5}, ["https://api.example.test"]],
                    {"ready": True, "missing": [], "failures": [], "origin": "https://api.example.test"},
                ),
                (
                    "reports-origin-timeout-and-body",
                    [{"method": "GET", "url": "https://other.test/items", "timeoutSeconds": 0, "json": {"q": 1}}, ["https://api.example.test"]],
                    {"ready": False, "missing": [], "failures": ["origin", "timeout", "body-policy"], "origin": "https://other.test"},
                ),
                (
                    "reports-missing-contract",
                    [{"url": "not-a-url"}, []],
                    {"ready": False, "missing": ["method", "timeoutSeconds"], "failures": ["method", "origin", "timeout"], "origin": ""},
                ),
            ],
            [
                "호출 함수보다 먼저 method·origin·timeout을 데이터 계약으로 만드세요.",
                "GET query와 JSON body를 혼용하지 말고 API 계약에 맞게 구분하세요.",
            ],
        ),
        "transfer": T(
            "request-safety-plan",
            "새 API 작업에 재시도·idempotency 계획 전이하기",
            "method와 idempotency key 유무로 자동 재시도 가능 여부를 판정한다.",
            "plan_request_safety(request, maximum_attempts)를 완성하세요.",
            "def plan_request_safety(request, maximum_attempts):\n    raise NotImplementedError",
            """def plan_request_safety(request, maximum_attempts):
    if maximum_attempts <= 0:
        raise ValueError("attempt count must be positive")
    method = request["method"]
    inherently_safe = method in {"GET", "HEAD", "OPTIONS"}
    idempotent = inherently_safe or method in {"PUT", "DELETE"} or bool(request.get("idempotencyKey"))
    attempts = maximum_attempts if idempotent else 1
    return {
        "idempotent": idempotent,
        "attempts": attempts,
        "requiresDryRun": method in {"POST", "PATCH", "DELETE"},
        "evidence": ["request identity", "attempt log", "final response"],
    }
""",
            "plan_request_safety",
            [
                (
                    "allows-get-retries",
                    [{"method": "GET"}, 3],
                    {"idempotent": True, "attempts": 3, "requiresDryRun": False, "evidence": ["request identity", "attempt log", "final response"]},
                ),
                (
                    "limits-unkeyed-post",
                    [{"method": "POST"}, 4],
                    {"idempotent": False, "attempts": 1, "requiresDryRun": True, "evidence": ["request identity", "attempt log", "final response"]},
                ),
                (
                    "allows-keyed-post-retries",
                    [{"method": "POST", "idempotencyKey": "job-42"}, 2],
                    {"idempotent": True, "attempts": 2, "requiresDryRun": True, "evidence": ["request identity", "attempt log", "final response"]},
                ),
                ("rejects-zero-attempts", [{"method": "GET"}, 0], E("ValueError")),
            ],
            [
                "모든 네트워크 오류를 같은 방식으로 재시도하지 마세요.",
                "상태 변경 요청은 dry run과 request identity를 먼저 확보하세요.",
            ],
        ),
        "retrieval": decision(
            "requests-foundation-recall",
            "requests 기본 안전 계약 회상하기",
            "읽기·생성·삭제 요청의 timeout과 재시도 경계를 복원한다.",
            "choose_request_policy",
            {
                "read": {"action": "bounded GET with retry", "evidence": "status headers parsed body", "risk": "stale cache"},
                "create": {"action": "POST with idempotency key", "evidence": "request identity and created resource", "risk": "duplicate mutation"},
                "delete": {"action": "dry run then allowlisted DELETE", "evidence": "target before and response after", "risk": "irreversible loss"},
            },
        ),
    },
    "01": {
        "mastery": T(
            "get-response-audit",
            "첫 GET 응답의 status·content type·schema 판정하기",
            "200 여부뿐 아니라 JSON content type과 필수 필드를 함께 검사한다.",
            "audit_get_response(response, required_fields)를 완성하세요.",
            "def audit_get_response(response, required_fields):\n    raise NotImplementedError",
            """def audit_get_response(response, required_fields):
    failures = []
    if response.get("status") != 200:
        failures.append("status")
    content_type = response.get("headers", {}).get("content-type", "").split(";", 1)[0].strip().lower()
    if content_type != "application/json":
        failures.append("content-type")
    body = response.get("json")
    if not isinstance(body, dict):
        failures.append("json-object")
        missing = sorted(required_fields)
    else:
        missing = sorted(set(required_fields) - set(body))
        if missing:
            failures.append("schema")
    return {"accepted": not failures, "failures": failures, "missingFields": missing, "contentType": content_type}
""",
            "audit_get_response",
            [
                (
                    "accepts-json-schema",
                    [{"status": 200, "headers": {"content-type": "application/json; charset=utf-8"}, "json": {"id": 1, "name": "A"}}, ["id", "name"]],
                    {"accepted": True, "failures": [], "missingFields": [], "contentType": "application/json"},
                ),
                (
                    "reports-html-error-page",
                    [{"status": 503, "headers": {"content-type": "text/html"}, "text": "down"}, ["id"]],
                    {"accepted": False, "failures": ["status", "content-type", "json-object"], "missingFields": ["id"], "contentType": "text/html"},
                ),
                (
                    "reports-schema-gap",
                    [{"status": 200, "headers": {"content-type": "application/json"}, "json": {"id": 1}}, ["id", "name"]],
                    {"accepted": False, "failures": ["schema"], "missingFields": ["name"], "contentType": "application/json"},
                ),
            ],
            [
                "`response.json()` 호출 전에 status와 content type을 검사하세요.",
                "JSON 파싱 성공과 업무 schema 충족을 별도 판정으로 남기세요.",
            ],
        ),
        "transfer": T(
            "retry-schedule",
            "새 GET 실패에 제한된 backoff 계획 전이하기",
            "status와 Retry-After를 근거로 재시도 시각을 계산한다.",
            "build_retry_schedule(attempts, base_delay, maximum_delay)를 완성하세요.",
            "def build_retry_schedule(attempts, base_delay, maximum_delay):\n    raise NotImplementedError",
            """def build_retry_schedule(attempts, base_delay, maximum_delay):
    if base_delay <= 0 or maximum_delay <= 0:
        raise ValueError("delays must be positive")
    schedule = []
    for index, attempt in enumerate(attempts):
        retryable = attempt["status"] in {408, 425, 429, 500, 502, 503, 504}
        if not retryable:
            schedule.append({"attempt": index + 1, "retry": False, "wait": None})
            break
        header_delay = attempt.get("retryAfter")
        wait = min(maximum_delay, header_delay if header_delay is not None else base_delay * (2**index))
        schedule.append({"attempt": index + 1, "retry": True, "wait": wait})
    return schedule
""",
            "build_retry_schedule",
            [
                (
                    "backs-off-retryable-statuses",
                    [[{"status": 503}, {"status": 500}], 1, 10],
                    [{"attempt": 1, "retry": True, "wait": 1}, {"attempt": 2, "retry": True, "wait": 2}],
                ),
                (
                    "honors-capped-retry-after",
                    [[{"status": 429, "retryAfter": 30}], 1, 8],
                    [{"attempt": 1, "retry": True, "wait": 8}],
                ),
                (
                    "stops-on-client-error",
                    [[{"status": 404}, {"status": 503}], 1, 10],
                    [{"attempt": 1, "retry": False, "wait": None}],
                ),
                ("rejects-invalid-delay", [[], 0, 10], E("ValueError")),
            ],
            [
                "404 같은 계약 오류를 서버 일시 장애처럼 재시도하지 마세요.",
                "Retry-After와 최대 지연을 함께 적용해 무한 대기를 막으세요.",
            ],
        ),
        "retrieval": decision(
            "get-response-recall",
            "GET 응답 검증 순서 회상하기",
            "전송·형식·업무 schema 오류를 단계별로 구분한다.",
            "choose_response_check",
            {
                "transport": {"action": "check timeout and status", "evidence": "attempt log", "risk": "blind retry"},
                "format": {"action": "check content type then parse", "evidence": "header and parse result", "risk": "HTML error as JSON"},
                "schema": {"action": "validate required fields and types", "evidence": "schema failures", "risk": "silent API drift"},
            },
        ),
    },
    "11": {
        "mastery": T(
            "business-status-normalization",
            "사업자등록번호와 상태 응답 정규화하기",
            "번호 형식과 응답 identity를 맞춰 상태·조회 시각을 반환한다.",
            "normalize_business_status(requested_numbers, responses)를 완성하세요.",
            "def normalize_business_status(requested_numbers, responses):\n    raise NotImplementedError",
            """def normalize_business_status(requested_numbers, responses):
    def normalize(value):
        digits = "".join(character for character in value if character.isdigit())
        if len(digits) != 10:
            raise ValueError("business number must have 10 digits")
        return digits
    requested = [normalize(value) for value in requested_numbers]
    by_number = {normalize(item["number"]): item for item in responses}
    missing = [number for number in requested if number not in by_number]
    records = []
    for number in requested:
        if number in by_number:
            item = by_number[number]
            records.append({"number": number, "status": item["status"], "checkedAt": item["checkedAt"]})
    return {"complete": not missing, "records": records, "missing": missing}
""",
            "normalize_business_status",
            [
                (
                    "normalizes-and-orders-records",
                    [["123-45-67890", "1111122222"], [{"number": "111-11-22222", "status": "active", "checkedAt": "2026-07-22"}, {"number": "1234567890", "status": "closed", "checkedAt": "2026-07-22"}]],
                    {"complete": True, "records": [{"number": "1234567890", "status": "closed", "checkedAt": "2026-07-22"}, {"number": "1111122222", "status": "active", "checkedAt": "2026-07-22"}], "missing": []},
                ),
                (
                    "reports-missing-response",
                    [["1234567890", "1111122222"], [{"number": "1234567890", "status": "active", "checkedAt": "2026-07-22"}]],
                    {"complete": False, "records": [{"number": "1234567890", "status": "active", "checkedAt": "2026-07-22"}], "missing": ["1111122222"]},
                ),
                ("rejects-invalid-number", [["123"], []], E("ValueError")),
            ],
            [
                "표시용 하이픈을 제거하되 10자리 identity 검증은 유지하세요.",
                "응답 순서를 신뢰하지 말고 요청 번호와 명시적으로 join하세요.",
            ],
        ),
        "transfer": T(
            "business-status-batch-audit",
            "새 대량 조회에 누락·중복·민감정보 감사 전이하기",
            "batch 결과의 identity 완전성과 보존 가능한 필드를 판정한다.",
            "audit_business_batch(requested, returned, allowed_fields)를 완성하세요.",
            "def audit_business_batch(requested, returned, allowed_fields):\n    raise NotImplementedError",
            """def audit_business_batch(requested, returned, allowed_fields):
    requested_set = set(requested)
    counts = {}
    leaked = []
    for row in returned:
        number = row["number"]
        counts[number] = counts.get(number, 0) + 1
        extra = sorted(set(row) - set(allowed_fields))
        if extra:
            leaked.append({"number": number, "fields": extra})
    missing = sorted(requested_set - set(counts))
    unexpected = sorted(set(counts) - requested_set)
    duplicates = sorted(number for number, count in counts.items() if count > 1)
    return {"accepted": not missing and not unexpected and not duplicates and not leaked, "missing": missing, "unexpected": unexpected, "duplicates": duplicates, "leaked": leaked}
""",
            "audit_business_batch",
            [
                (
                    "accepts-minimal-results",
                    [["a", "b"], [{"number": "a", "status": "active"}, {"number": "b", "status": "closed"}], ["number", "status"]],
                    {"accepted": True, "missing": [], "unexpected": [], "duplicates": [], "leaked": []},
                ),
                (
                    "reports-identity-problems",
                    [["a", "b"], [{"number": "a", "status": "active"}, {"number": "a", "status": "active"}, {"number": "c", "status": "active"}], ["number", "status"]],
                    {"accepted": False, "missing": ["b"], "unexpected": ["c"], "duplicates": ["a"], "leaked": []},
                ),
                (
                    "reports-extra-sensitive-field",
                    [["a"], [{"number": "a", "status": "active", "ownerName": "Kim"}], ["number", "status"]],
                    {"accepted": False, "missing": [], "unexpected": [], "duplicates": [], "leaked": [{"number": "a", "fields": ["ownerName"]}]},
                ),
            ],
            [
                "batch 개수만 비교하지 말고 요청 identity와 응답 identity를 집합으로 대조하세요.",
                "업무에 필요하지 않은 대표자 등 민감 필드는 결과에 보존하지 마세요.",
            ],
        ),
        "retrieval": decision(
            "business-status-recall",
            "사업자 상태 조회 증거 회상하기",
            "번호 identity·상태 시점·개인정보 최소화 원칙을 복원한다.",
            "choose_business_status_evidence",
            {
                "single": {"action": "normalize and identity-match", "evidence": "number status checkedAt", "risk": "wrong response order"},
                "batch": {"action": "audit missing duplicate unexpected", "evidence": "identity reconciliation", "risk": "partial success"},
                "archive": {"action": "retain minimal fields", "evidence": "allowed-field manifest", "risk": "personal data leakage"},
            },
        ),
    },
    "12": {
        "mastery": T(
            "business-day-calculation",
            "주말·공휴일을 제외한 영업일 계산하기",
            "시작·종료 포함 정책을 고정해 실제 영업일과 제외 사유를 반환한다.",
            "calculate_business_days(start_day, end_day, weekdays, holidays)를 완성하세요.",
            "def calculate_business_days(start_day, end_day, weekdays, holidays):\n    raise NotImplementedError",
            """def calculate_business_days(start_day, end_day, weekdays, holidays):
    if end_day < start_day or len(weekdays) <= end_day:
        raise ValueError("invalid day range")
    holiday_set = set(holidays)
    business = []
    excluded = []
    for day in range(start_day, end_day + 1):
        reasons = []
        if weekdays[day] >= 5:
            reasons.append("weekend")
        if day in holiday_set:
            reasons.append("holiday")
        if reasons:
            excluded.append({"day": day, "reasons": reasons})
        else:
            business.append(day)
    return {"count": len(business), "businessDays": business, "excluded": excluded}
""",
            "calculate_business_days",
            [
                (
                    "excludes-weekend-and-holiday",
                    [0, 6, [0, 1, 2, 3, 4, 5, 6], [2]],
                    {"count": 4, "businessDays": [0, 1, 3, 4], "excluded": [{"day": 2, "reasons": ["holiday"]}, {"day": 5, "reasons": ["weekend"]}, {"day": 6, "reasons": ["weekend"]}]},
                ),
                (
                    "records-overlapping-reasons",
                    [5, 6, [0, 1, 2, 3, 4, 5, 6], [5]],
                    {"count": 0, "businessDays": [], "excluded": [{"day": 5, "reasons": ["weekend", "holiday"]}, {"day": 6, "reasons": ["weekend"]}]},
                ),
                ("rejects-invalid-range", [2, 1, [0, 1, 2], []], E("ValueError")),
            ],
            [
                "시작일과 종료일 포함 여부를 함수 계약으로 고정하세요.",
                "주말과 공휴일이 겹쳐도 제외 사유 둘 다 남기세요.",
            ],
        ),
        "transfer": T(
            "holiday-source-audit",
            "새 공휴일 데이터에 출처·연도 완전성 감사 전이하기",
            "요청 연도와 source metadata, 중복 날짜를 검사한다.",
            "audit_holiday_source(records, requested_year, source_meta)를 완성하세요.",
            "def audit_holiday_source(records, requested_year, source_meta):\n    raise NotImplementedError",
            """def audit_holiday_source(records, requested_year, source_meta):
    failures = []
    if source_meta.get("year") != requested_year:
        failures.append("year")
    if not source_meta.get("provider") or not source_meta.get("retrievedAt"):
        failures.append("provenance")
    dates = [record["date"] for record in records]
    duplicates = sorted({date for date in dates if dates.count(date) > 1})
    if duplicates:
        failures.append("duplicates")
    wrong_year = sorted(date for date in dates if not date.startswith(f"{requested_year}-"))
    if wrong_year:
        failures.append("record-year")
    return {"accepted": not failures, "failures": failures, "duplicates": duplicates, "wrongYear": wrong_year}
""",
            "audit_holiday_source",
            [
                (
                    "accepts-provenanced-year",
                    [[{"date": "2026-01-01"}, {"date": "2026-03-01"}], 2026, {"year": 2026, "provider": "public-api", "retrievedAt": "2025-12-01"}],
                    {"accepted": True, "failures": [], "duplicates": [], "wrongYear": []},
                ),
                (
                    "reports-stale-source-year",
                    [[{"date": "2026-01-01"}], 2026, {"year": 2025, "provider": "public-api", "retrievedAt": "2025-12-01"}],
                    {"accepted": False, "failures": ["year"], "duplicates": [], "wrongYear": []},
                ),
                (
                    "reports-provenance-duplicate-and-year",
                    [[{"date": "2025-12-31"}, {"date": "2025-12-31"}], 2026, {"year": 2026}],
                    {"accepted": False, "failures": ["provenance", "duplicates", "record-year"], "duplicates": ["2025-12-31"], "wrongYear": ["2025-12-31", "2025-12-31"]},
                ),
            ],
            [
                "공휴일 이름만 저장하지 말고 provider·조회 시각·대상 연도를 보존하세요.",
                "다른 연도의 캐시를 정상 응답처럼 사용하지 마세요.",
            ],
        ),
        "retrieval": decision(
            "business-day-recall",
            "공휴일 영업일 계산 원칙 회상하기",
            "달력 계산·출처 검증·장애 fallback을 구분한다.",
            "choose_business_day_policy",
            {
                "calculation": {"action": "apply explicit inclusive range", "evidence": "business days and excluded reasons", "risk": "off-by-one"},
                "source": {"action": "validate year and provenance", "evidence": "provider retrievedAt records", "risk": "stale calendar"},
                "outage": {"action": "use approved dated cache", "evidence": "cache age and warning", "risk": "unknown holiday change"},
            },
        ),
    },
    "13": {
        "mastery": T(
            "exchange-rate-conversion",
            "환율 quote 방향과 반올림 정책으로 금액 환산하기",
            "base·quote·rate·as-of를 검사해 Decimal 금액과 근거를 반환한다.",
            "convert_currency(amount, from_currency, to_currency, quote, places)를 완성하세요.",
            "def convert_currency(amount, from_currency, to_currency, quote, places):\n    raise NotImplementedError",
            """def convert_currency(amount, from_currency, to_currency, quote, places):
    from decimal import Decimal, ROUND_HALF_UP
    if places < 0 or Decimal(str(amount)) < 0:
        raise ValueError("invalid conversion input")
    rate = Decimal(str(quote["rate"]))
    if rate <= 0:
        raise ValueError("rate must be positive")
    if quote["base"] == from_currency and quote["quote"] == to_currency:
        raw = Decimal(str(amount)) * rate
        direction = "multiply"
    elif quote["base"] == to_currency and quote["quote"] == from_currency:
        raw = Decimal(str(amount)) / rate
        direction = "divide"
    else:
        raise ValueError("currency pair mismatch")
    unit = Decimal("1").scaleb(-places)
    return {"amount": format(raw.quantize(unit, rounding=ROUND_HALF_UP), f".{places}f"), "currency": to_currency, "direction": direction, "rate": str(quote["rate"]), "asOf": quote["asOf"]}
""",
            "convert_currency",
            [
                (
                    "multiplies-direct-quote",
                    [100, "USD", "KRW", {"base": "USD", "quote": "KRW", "rate": "1350.25", "asOf": "2026-07-22T09:00:00Z"}, 0],
                    {"amount": "135025", "currency": "KRW", "direction": "multiply", "rate": "1350.25", "asOf": "2026-07-22T09:00:00Z"},
                ),
                (
                    "divides-inverse-quote",
                    [1350, "KRW", "USD", {"base": "USD", "quote": "KRW", "rate": "1350", "asOf": "2026-07-22T09:00:00Z"}, 2],
                    {"amount": "1.00", "currency": "USD", "direction": "divide", "rate": "1350", "asOf": "2026-07-22T09:00:00Z"},
                ),
                (
                    "rejects-pair-mismatch",
                    [10, "EUR", "KRW", {"base": "USD", "quote": "KRW", "rate": 1300, "asOf": "now"}, 0],
                    E("ValueError"),
                ),
            ],
            [
                "환율 숫자만 보지 말고 base/quote 방향을 먼저 검사하세요.",
                "금액 계산은 float 대신 Decimal과 명시한 반올림 자리수를 사용하세요.",
            ],
        ),
        "transfer": T(
            "exchange-rate-freshness-audit",
            "새 환율 응답에 freshness·provider 감사 전이하기",
            "조회 시점과 quote 시점 차이, provider, 통화쌍 중복을 검사한다.",
            "audit_rate_feed(quotes, now_epoch, maximum_age, allowed_providers)를 완성하세요.",
            "def audit_rate_feed(quotes, now_epoch, maximum_age, allowed_providers):\n    raise NotImplementedError",
            """def audit_rate_feed(quotes, now_epoch, maximum_age, allowed_providers):
    failures = []
    stale = []
    untrusted = []
    pairs = []
    for quote in quotes:
        pair = f"{quote['base']}/{quote['quote']}"
        pairs.append(pair)
        if now_epoch - quote["asOfEpoch"] > maximum_age or quote["asOfEpoch"] > now_epoch:
            stale.append(pair)
        if quote["provider"] not in allowed_providers:
            untrusted.append(pair)
    duplicates = sorted({pair for pair in pairs if pairs.count(pair) > 1})
    if stale:
        failures.append("freshness")
    if untrusted:
        failures.append("provider")
    if duplicates:
        failures.append("duplicates")
    return {"accepted": not failures, "failures": failures, "stale": stale, "untrusted": untrusted, "duplicates": duplicates}
""",
            "audit_rate_feed",
            [
                (
                    "accepts-fresh-trusted-quotes",
                    [[{"base": "USD", "quote": "KRW", "asOfEpoch": 990, "provider": "central"}], 1000, 20, ["central"]],
                    {"accepted": True, "failures": [], "stale": [], "untrusted": [], "duplicates": []},
                ),
                (
                    "reports-stale-and-untrusted",
                    [[{"base": "EUR", "quote": "KRW", "asOfEpoch": 900, "provider": "unknown"}], 1000, 30, ["central"]],
                    {"accepted": False, "failures": ["freshness", "provider"], "stale": ["EUR/KRW"], "untrusted": ["EUR/KRW"], "duplicates": []},
                ),
                (
                    "reports-duplicate-pair",
                    [[{"base": "USD", "quote": "KRW", "asOfEpoch": 990, "provider": "central"}, {"base": "USD", "quote": "KRW", "asOfEpoch": 995, "provider": "central"}], 1000, 20, ["central"]],
                    {"accepted": False, "failures": ["duplicates"], "stale": [], "untrusted": [], "duplicates": ["USD/KRW"]},
                ),
            ],
            [
                "환율 값과 함께 provider·as-of·허용 최대 나이를 저장하세요.",
                "같은 통화쌍의 복수 quote를 조용히 마지막 값으로 덮지 마세요.",
            ],
        ),
        "retrieval": decision(
            "exchange-rate-recall",
            "환율 조회·환산 근거 회상하기",
            "통화 방향·정밀도·시점 위험에 맞는 검증을 복원한다.",
            "choose_exchange_rate_evidence",
            {
                "direction": {"action": "match base and quote", "evidence": "multiply or divide decision", "risk": "inverted conversion"},
                "amount": {"action": "use Decimal and currency places", "evidence": "rounding policy", "risk": "float drift"},
                "freshness": {"action": "validate provider and as-of", "evidence": "age and source", "risk": "stale financial value"},
            },
        ),
    },
}
