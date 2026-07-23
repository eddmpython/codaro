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
    selected = list(table.items())[:2]
    cases = [(f"recalls-{key}", [key], value) for key, value in selected]
    cases.append(("rejects-unknown-situation", ["unknown"], E("ValueError")))
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
    "00": {
        "mastery": T(
            "record-contract-boundary",
            "레코드 목록을 명시적 타입 계약으로 검증하기",
            "필수 id·name·active 타입을 확인해 통과 행과 오류 경로를 분리한다.",
            "validate_record_contract(rows)를 완성해 accepted와 errors를 반환하세요.",
            "def validate_record_contract(rows):\n    raise NotImplementedError",
            """def validate_record_contract(rows):
    accepted = []
    errors = []
    for index, row in enumerate(rows):
        row_errors = []
        if not isinstance(row.get("id"), int) or isinstance(row.get("id"), bool):
            row_errors.append({"path": f"{index}.id", "type": "int"})
        if not isinstance(row.get("name"), str) or not row.get("name", "").strip():
            row_errors.append({"path": f"{index}.name", "type": "nonempty-str"})
        if not isinstance(row.get("active"), bool):
            row_errors.append({"path": f"{index}.active", "type": "bool"})
        if row_errors:
            errors.extend(row_errors)
        else:
            accepted.append({"id": row["id"], "name": row["name"].strip(), "active": row["active"]})
    return {"accepted": accepted, "errors": errors}
""",
            "validate_record_contract",
            [
                ("keeps-field-error-paths", [[{"id": 1, "name": " Mina ", "active": True}, {"id": "2", "name": "", "active": 1}]], {"accepted": [{"id": 1, "name": "Mina", "active": True}], "errors": [{"path": "1.id", "type": "int"}, {"path": "1.name", "type": "nonempty-str"}, {"path": "1.active", "type": "bool"}]}),
                ("handles-empty-batch", [[]], {"accepted": [], "errors": []}),
            ],
            ["bool은 int와 구분해 검사하세요.", "오류 메시지만 남기지 말고 행 index와 field path를 보존하세요."],
        ),
        "transfer": T(
            "api-payload-contract",
            "새 API payload의 필수 열과 추가 열 정책 적용하기",
            "레코드 검증 개념을 단일 요청 payload와 forbid-extra 계약으로 전이한다.",
            "validate_api_payload(payload, required, allowed)를 완성해 normalized와 extra를 반환하세요.",
            "def validate_api_payload(payload, required, allowed):\n    raise NotImplementedError",
            """def validate_api_payload(payload, required, allowed):
    missing = sorted(key for key in required if key not in payload)
    extra = sorted(key for key in payload if key not in allowed)
    if missing or extra:
        return {"valid": False, "missing": missing, "extra": extra, "normalized": None}
    normalized = {key: payload[key] for key in allowed if key in payload}
    return {"valid": True, "missing": [], "extra": [], "normalized": normalized}
""",
            "validate_api_payload",
            [
                ("accepts-exact-contract", [{"id": 1, "name": "Mina"}, ["id", "name"], ["id", "name"]], {"valid": True, "missing": [], "extra": [], "normalized": {"id": 1, "name": "Mina"}}),
                ("reports-missing-and-extra", [{"id": 1, "debug": True}, ["id", "name"], ["id", "name"]], {"valid": False, "missing": ["name"], "extra": ["debug"], "normalized": None}),
            ],
            ["missing과 extra를 따로 계산하세요.", "실패 payload를 억지로 normalized 결과로 만들지 마세요."],
        ),
        "retrieval": decision(
            "validation-layer-choice",
            "검증이 필요한 경계와 책임 회상하기",
            "외부 입력, 내부 계산, 저장 전 단계에 맞는 검증 책임과 증거를 구분한다.",
            "choose_validation_layer(situation)를 완성해 owner, evidence, risk를 반환하세요.",
            "choose_validation_layer",
            {
                "external-input": {"owner": "input model", "evidence": "field error paths", "risk": "invalid state enters system"},
                "internal-calculation": {"owner": "domain function", "evidence": "invariant assertion", "risk": "model hides logic bug"},
                "before-storage": {"owner": "persistence boundary", "evidence": "serialized schema", "risk": "unreadable record"},
            },
            ["모든 검증을 한 model에 몰아넣지 말고 경계별 책임을 나누세요.", "실패 위치를 재현할 수 있는 field path나 invariant를 남기세요."],
        ),
    },
    "01": {
        "mastery": T(
            "normalize-user-model",
            "사용자 입력을 일관된 model 값으로 정규화하기",
            "name·email 공백과 대소문자를 정리하고 age 범위를 검증한다.",
            "normalize_user(payload)를 완성해 id, name, email, age를 반환하세요.",
            "def normalize_user(payload):\n    raise NotImplementedError",
            """def normalize_user(payload):
    user_id = payload.get("id")
    age = payload.get("age")
    if not isinstance(user_id, int) or isinstance(user_id, bool) or user_id < 1:
        raise ValueError("invalid id")
    if not isinstance(age, int) or isinstance(age, bool) or not 0 <= age <= 130:
        raise ValueError("invalid age")
    name = str(payload.get("name", "")).strip()
    email = str(payload.get("email", "")).strip().lower()
    if not name or "@" not in email:
        raise ValueError("invalid identity")
    return {"id": user_id, "name": name, "email": email, "age": age}
""",
            "normalize_user",
            [
                ("normalizes-valid-user", [{"id": 7, "name": " Mina ", "email": " MINA@Example.COM ", "age": 28}], {"id": 7, "name": "Mina", "email": "mina@example.com", "age": 28}),
                ("rejects-age-outside-range", [{"id": 1, "name": "A", "email": "a@b.c", "age": 200}], E("ValueError")),
                ("rejects-bool-id", [{"id": True, "name": "A", "email": "a@b.c", "age": 20}], E("ValueError")),
            ],
            ["문자열 정규화와 값 범위 검증을 분리해서 읽으세요.", "Python의 bool을 정수 id로 받아들이지 마세요."],
        ),
        "transfer": T(
            "alias-customer-model",
            "새 고객 payload의 alias를 내부 field로 변환하기",
            "user model 계약을 외부 camelCase 입력과 내부 snake_case 출력으로 전이한다.",
            "normalize_customer(payload)를 완성해 customer_id, display_name, marketing_opt_in을 반환하세요.",
            "def normalize_customer(payload):\n    raise NotImplementedError",
            """def normalize_customer(payload):
    required = ("customerId", "displayName")
    if any(key not in payload for key in required):
        raise ValueError("missing customer field")
    customer_id = int(payload["customerId"])
    display_name = str(payload["displayName"]).strip()
    opt_in = payload.get("marketingOptIn", False)
    if customer_id < 1 or not display_name or not isinstance(opt_in, bool):
        raise ValueError("invalid customer")
    return {"customer_id": customer_id, "display_name": display_name, "marketing_opt_in": opt_in}
""",
            "normalize_customer",
            [
                ("maps-aliases-and-default", [{"customerId": "12", "displayName": " Jun "}], {"customer_id": 12, "display_name": "Jun", "marketing_opt_in": False}),
                ("keeps-explicit-opt-in", [{"customerId": 8, "displayName": "Mina", "marketingOptIn": True}], {"customer_id": 8, "display_name": "Mina", "marketing_opt_in": True}),
                ("rejects-missing-name", [{"customerId": 1}], E("ValueError")),
            ],
            ["외부 alias와 내부 field 이름을 섞지 마세요.", "optional boolean의 default를 명시적으로 정하세요."],
        ),
        "retrieval": decision(
            "model-field-role",
            "model field 역할과 정책 회상하기",
            "식별자, 표시 이름, 비밀값에 맞는 정규화와 출력 정책을 선택한다.",
            "choose_field_policy(situation)를 완성해 normalize, serialize, risk를 반환하세요.",
            "choose_field_policy",
            {
                "identifier": {"normalize": "strict positive integer", "serialize": "include", "risk": "identity collision"},
                "display-name": {"normalize": "trim whitespace", "serialize": "include", "risk": "blank label"},
                "secret": {"normalize": "preserve exact value", "serialize": "exclude", "risk": "credential leak"},
            },
            ["field의 역할이 validation과 serialization 정책을 함께 결정합니다.", "비밀값은 유효하더라도 일반 model dump에서 제외하세요."],
        ),
    },
    "02": {
        "mastery": T(
            "field-validator-order",
            "상품 field별 변환과 범위 검증 적용하기",
            "문자 가격을 정수로 바꾼 뒤 양수 범위를 검사하고 sku 형식을 정규화한다.",
            "validate_product(payload)를 완성해 sku, price, stock을 반환하세요.",
            "def validate_product(payload):\n    raise NotImplementedError",
            """def validate_product(payload):
    sku = str(payload.get("sku", "")).strip().upper()
    try:
        price = int(payload["price"])
        stock = int(payload["stock"])
    except (KeyError, TypeError, ValueError) as error:
        raise ValueError("invalid numeric field") from error
    if not sku.startswith("SKU-") or price <= 0 or stock < 0:
        raise ValueError("field constraint failed")
    return {"sku": sku, "price": price, "stock": stock}
""",
            "validate_product",
            [
                ("converts-before-range-check", [{"sku": " sku-10 ", "price": "1200", "stock": "3"}], {"sku": "SKU-10", "price": 1200, "stock": 3}),
                ("rejects-zero-price", [{"sku": "SKU-1", "price": 0, "stock": 1}], E("ValueError")),
                ("rejects-bad-number", [{"sku": "SKU-1", "price": "many", "stock": 1}], E("ValueError")),
            ],
            ["타입 변환이 먼저인지 범위 검증이 먼저인지 순서를 분명히 하세요.", "sku 정규화 뒤 형식을 검사하세요."],
        ),
        "transfer": T(
            "cross-field-date-validator",
            "새 예약 payload의 field 간 날짜 관계 검증하기",
            "단일 field 검증을 start·end·cancelled 관계를 보는 model-level 규칙으로 전이한다.",
            "validate_booking(payload)를 완성해 status와 nights를 반환하세요.",
            "def validate_booking(payload):\n    raise NotImplementedError",
            """def validate_booking(payload):
    from datetime import date
    start = date.fromisoformat(payload["start"])
    end = date.fromisoformat(payload["end"])
    cancelled = payload.get("cancelled", False)
    if not isinstance(cancelled, bool) or end <= start:
        raise ValueError("invalid booking interval")
    nights = (end - start).days
    return {"status": "cancelled" if cancelled else "confirmed", "nights": nights}
""",
            "validate_booking",
            [
                ("validates-related-fields", [{"start": "2026-07-01", "end": "2026-07-04"}], {"status": "confirmed", "nights": 3}),
                ("keeps-cancelled-state", [{"start": "2026-08-01", "end": "2026-08-02", "cancelled": True}], {"status": "cancelled", "nights": 1}),
                ("rejects-reversed-range", [{"start": "2026-07-04", "end": "2026-07-01"}], E("ValueError")),
            ],
            ["개별 날짜가 유효해도 end > start 관계를 별도로 확인하세요.", "취소 여부는 날짜 간격 검증을 우회하지 않습니다."],
        ),
        "retrieval": decision(
            "validator-stage-choice",
            "검증 규칙을 둘 단계 회상하기",
            "원시 변환, field 범위, 여러 field 관계 규칙을 구분한다.",
            "choose_validator_stage(situation)를 완성해 stage, input, evidence를 반환하세요.",
            "choose_validator_stage",
            {
                "strip-before-parse": {"stage": "before field", "input": "raw value", "evidence": "normalized value"},
                "positive-price": {"stage": "after field", "input": "typed value", "evidence": "range failure"},
                "end-after-start": {"stage": "model", "input": "multiple fields", "evidence": "cross-field error path"},
            },
            ["원시 문자열을 보는 규칙과 typed 값을 보는 규칙을 구분하세요.", "여러 field 관계는 model 전체가 준비된 뒤 검사하세요."],
        ),
    },
    "03": {
        "mastery": T(
            "nested-order-contract",
            "중첩 주문·품목 구조와 합계 검증하기",
            "각 item의 수량·단가를 검증하고 선언된 total과 계산 total을 비교한다.",
            "validate_nested_order(payload)를 완성해 orderId, itemCount, calculatedTotal을 반환하세요.",
            "def validate_nested_order(payload):\n    raise NotImplementedError",
            """def validate_nested_order(payload):
    items = payload.get("items")
    if not isinstance(items, list) or not items:
        raise ValueError("items required")
    total = 0
    for item in items:
        quantity = item.get("quantity")
        unit_price = item.get("unitPrice")
        if not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1 or unit_price < 0:
            raise ValueError("invalid item")
        total += quantity * unit_price
    if payload.get("declaredTotal") != total:
        raise ValueError("total mismatch")
    return {"orderId": payload["orderId"], "itemCount": len(items), "calculatedTotal": total}
""",
            "validate_nested_order",
            [
                ("checks-nested-total", [{"orderId": "O-1", "items": [{"quantity": 2, "unitPrice": 1000}, {"quantity": 1, "unitPrice": 500}], "declaredTotal": 2500}], {"orderId": "O-1", "itemCount": 2, "calculatedTotal": 2500}),
                ("rejects-total-mismatch", [{"orderId": "O-2", "items": [{"quantity": 1, "unitPrice": 100}], "declaredTotal": 90}], E("ValueError")),
                ("rejects-empty-items", [{"orderId": "O-3", "items": [], "declaredTotal": 0}], E("ValueError")),
            ],
            ["중첩 item을 모두 검증한 뒤 합계를 계산하세요.", "외부가 보낸 total을 신뢰하지 말고 계산값과 비교하세요."],
        ),
        "transfer": T(
            "nested-team-contract",
            "새 조직·팀·구성원 중첩 구조 검증하기",
            "주문 중첩 검증을 팀별 고유 email과 전체 인원 집계로 전이한다.",
            "validate_organization(payload)를 완성해 teamCount, memberCount, emails를 반환하세요.",
            "def validate_organization(payload):\n    raise NotImplementedError",
            """def validate_organization(payload):
    teams = payload.get("teams", [])
    emails = []
    for team in teams:
        if not team.get("name") or not team.get("members"):
            raise ValueError("team needs name and members")
        for member in team["members"]:
            email = str(member.get("email", "")).strip().lower()
            if "@" not in email or email in emails:
                raise ValueError("invalid or duplicate email")
            emails.append(email)
    return {"teamCount": len(teams), "memberCount": len(emails), "emails": sorted(emails)}
""",
            "validate_organization",
            [
                ("validates-deep-members", [{"teams": [{"name": "Data", "members": [{"email": " A@EXAMPLE.COM "}, {"email": "b@example.com"}]}, {"name": "Web", "members": [{"email": "c@example.com"}]}]}], {"teamCount": 2, "memberCount": 3, "emails": ["a@example.com", "b@example.com", "c@example.com"]}),
                ("rejects-duplicate-across-teams", [{"teams": [{"name": "A", "members": [{"email": "same@example.com"}]}, {"name": "B", "members": [{"email": "same@example.com"}]}]}], E("ValueError")),
            ],
            ["중복 검사는 한 팀 안이 아니라 조직 전체 범위에서 하세요.", "중첩 값의 정규화 뒤 고유성을 검사하세요."],
        ),
        "retrieval": decision(
            "nested-error-path",
            "중첩 오류의 정확한 path 표현 회상하기",
            "list index와 field 이름을 조합해 수정 가능한 오류 위치를 선택한다.",
            "choose_nested_error_path(situation)를 완성해 path, message, owner를 반환하세요.",
            "choose_nested_error_path",
            {
                "second-item-quantity": {"path": "items.1.quantity", "message": "must be positive", "owner": "item model"},
                "first-team-member-email": {"path": "teams.0.members.0.email", "message": "invalid email", "owner": "member model"},
                "order-total-mismatch": {"path": "declaredTotal", "message": "does not match items", "owner": "order model"},
            },
            ["중첩 list에는 0부터 시작하는 index를 path에 포함하세요.", "오류가 발생한 가장 가까운 model 책임을 함께 표시하세요."],
        ),
    },
    "04": {
        "mastery": T(
            "explicit-type-coercion",
            "문자열 입력을 명시적 bool·int·float 계약으로 변환하기",
            "허용한 문자열 표현만 typed 값으로 변환하고 나머지는 거절한다.",
            "coerce_fields(payload)를 완성해 enabled, retries, threshold를 반환하세요.",
            "def coerce_fields(payload):\n    raise NotImplementedError",
            """def coerce_fields(payload):
    bool_map = {"true": True, "false": False, "1": True, "0": False}
    raw_enabled = str(payload.get("enabled", "")).strip().lower()
    if raw_enabled not in bool_map:
        raise ValueError("invalid boolean")
    try:
        retries = int(payload["retries"])
        threshold = float(payload["threshold"])
    except (KeyError, TypeError, ValueError) as error:
        raise ValueError("invalid numeric value") from error
    if retries < 0 or not 0 <= threshold <= 1:
        raise ValueError("value out of range")
    return {"enabled": bool_map[raw_enabled], "retries": retries, "threshold": threshold}
""",
            "coerce_fields",
            [
                ("coerces-explicit-values", [{"enabled": " TRUE ", "retries": "3", "threshold": "0.75"}], {"enabled": True, "retries": 3, "threshold": 0.75}),
                ("keeps-zero-false", [{"enabled": "0", "retries": 0, "threshold": 0}], {"enabled": False, "retries": 0, "threshold": 0.0}),
                ("rejects-ambiguous-bool", [{"enabled": "yes", "retries": 1, "threshold": 0.5}], E("ValueError")),
            ],
            ["bool('false')는 True이므로 직접 허용 목록을 만드세요.", "변환 뒤에도 범위 검증을 수행하세요."],
        ),
        "transfer": T(
            "query-parameter-coercion",
            "새 URL query 값을 pagination 계약으로 변환하기",
            "field 변환을 page·limit·tags query 입력으로 전이한다.",
            "normalize_query(params)를 완성해 page, limit, tags, offset을 반환하세요.",
            "def normalize_query(params):\n    raise NotImplementedError",
            """def normalize_query(params):
    try:
        page = int(params.get("page", 1))
        limit = int(params.get("limit", 20))
    except (TypeError, ValueError) as error:
        raise ValueError("invalid pagination") from error
    if page < 1 or not 1 <= limit <= 100:
        raise ValueError("pagination out of range")
    raw_tags = params.get("tags", [])
    tags = [tag.strip().lower() for tag in (raw_tags if isinstance(raw_tags, list) else [raw_tags]) if tag.strip()]
    return {"page": page, "limit": limit, "tags": tags, "offset": (page - 1) * limit}
""",
            "normalize_query",
            [
                ("normalizes-query-list", [{"page": "3", "limit": "10", "tags": [" Python ", "WEB"]}], {"page": 3, "limit": 10, "tags": ["python", "web"], "offset": 20}),
                ("applies-defaults", [{}], {"page": 1, "limit": 20, "tags": [], "offset": 0}),
                ("rejects-large-limit", [{"page": 1, "limit": 1000}], E("ValueError")),
            ],
            ["query는 문자열로 들어올 수 있으므로 변환과 범위를 모두 검사하세요.", "단일 tag와 tag 목록을 같은 내부 list로 정규화하세요."],
        ),
        "retrieval": decision(
            "strict-versus-coerce",
            "엄격 타입과 안전한 변환의 경계 회상하기",
            "식별자, 사용자 query, 계산 결과에 맞는 타입 정책을 선택한다.",
            "choose_type_policy(situation)를 완성해 policy, accepts, risk를 반환하세요.",
            "choose_type_policy",
            {
                "database-identifier": {"policy": "strict", "accepts": "integer only", "risk": "identity ambiguity"},
                "url-query-page": {"policy": "coerce then range-check", "accepts": "digit string or integer", "risk": "invalid pagination"},
                "computed-probability": {"policy": "strict range", "accepts": "number from 0 to 1", "risk": "invalid metric"},
            },
            ["입력 편의가 필요한 경계와 identity가 중요한 경계를 구분하세요.", "coerce를 허용해도 허용 표현과 범위는 좁게 정의하세요."],
        ),
    },
    "05": {
        "mastery": T(
            "settings-precedence",
            "설정 source 우선순위와 secret redaction 적용하기",
            "defaults < environment < explicit overrides 순서로 병합하고 비밀값은 출력에서 가린다.",
            "resolve_settings(defaults, environment, overrides, secret_keys)를 완성하세요.",
            "def resolve_settings(defaults, environment, overrides, secret_keys):\n    raise NotImplementedError",
            """def resolve_settings(defaults, environment, overrides, secret_keys):
    resolved = {**defaults, **environment, **overrides}
    public = {key: ("***" if key in secret_keys and value else value) for key, value in resolved.items()}
    sources = {}
    for key in resolved:
        sources[key] = "override" if key in overrides else "environment" if key in environment else "default"
    return {"resolved": resolved, "public": public, "sources": sources}
""",
            "resolve_settings",
            [
                ("applies-precedence-and-redaction", [{"mode": "dev", "timeout": 10}, {"timeout": 20, "apiKey": "secret"}, {"mode": "prod"}, ["apiKey"]], {"resolved": {"mode": "prod", "timeout": 20, "apiKey": "secret"}, "public": {"mode": "prod", "timeout": 20, "apiKey": "***"}, "sources": {"mode": "override", "timeout": "environment", "apiKey": "environment"}}),
                ("keeps-empty-settings", [{}, {}, {}, []], {"resolved": {}, "public": {}, "sources": {}}),
            ],
            ["병합 순서를 코드 순서로 명확히 드러내세요.", "실제 resolved 값과 화면·로그용 public 값을 분리하세요."],
        ),
        "transfer": T(
            "profile-settings-selection",
            "새 실행 profile별 설정 조합하기",
            "source 우선순위를 base·profile·runtime override 계층으로 전이한다.",
            "select_profile_settings(base, profiles, profile_name, runtime_override)를 완성하세요.",
            "def select_profile_settings(base, profiles, profile_name, runtime_override):\n    raise NotImplementedError",
            """def select_profile_settings(base, profiles, profile_name, runtime_override):
    if profile_name not in profiles:
        raise ValueError("unknown profile")
    resolved = {**base, **profiles[profile_name], **runtime_override}
    return {"profile": profile_name, "resolved": resolved, "overrideKeys": sorted(runtime_override)}
""",
            "select_profile_settings",
            [
                ("selects-profile-and-runtime-override", [{"logLevel": "INFO", "workers": 1}, {"dev": {"logLevel": "DEBUG"}, "prod": {"workers": 4}}, "prod", {"workers": 8}], {"profile": "prod", "resolved": {"logLevel": "INFO", "workers": 8}, "overrideKeys": ["workers"]}),
                ("uses-profile-without-overrides", [{"x": 1}, {"test": {"x": 2}}, "test", {}], {"profile": "test", "resolved": {"x": 2}, "overrideKeys": []}),
                ("rejects-unknown-profile", [{}, {}, "missing", {}], E("ValueError")),
            ],
            ["profile이 존재하는지 먼저 확인하세요.", "runtime override key 목록을 결과에 남겨 재현성을 높이세요."],
        ),
        "retrieval": decision(
            "settings-source-policy",
            "설정 source별 책임과 위험 회상하기",
            "default, environment, runtime override의 사용 목적과 금지 행동을 구분한다.",
            "choose_settings_policy(situation)를 완성해 purpose, evidence, forbidden을 반환하세요.",
            "choose_settings_policy",
            {
                "default": {"purpose": "safe local baseline", "evidence": "checked-in non-secret value", "forbidden": "embed credential"},
                "environment": {"purpose": "deployment-specific value", "evidence": "presence without value", "forbidden": "print secret"},
                "runtime-override": {"purpose": "explicit one-run change", "evidence": "override key list", "forbidden": "silently persist"},
            },
            ["비밀값의 존재 여부와 실제 값을 구분해 기록하세요.", "일회성 override를 기본 설정 파일에 몰래 저장하지 마세요."],
        ),
    },
    "06": {
        "mastery": T(
            "json-schema-subset",
            "field 정의에서 JSON Schema 핵심 구조 만들기",
            "field type·required·description을 object schema의 properties와 required로 변환한다.",
            "build_json_schema(fields, title)를 완성해 JSON Schema dict를 반환하세요.",
            "def build_json_schema(fields, title):\n    raise NotImplementedError",
            """def build_json_schema(fields, title):
    type_map = {"str": "string", "int": "integer", "float": "number", "bool": "boolean"}
    properties = {}
    required = []
    for field in fields:
        if field["type"] not in type_map:
            raise ValueError("unsupported field type")
        properties[field["name"]] = {
            "type": type_map[field["type"]],
            "description": field.get("description", ""),
        }
        if field.get("required", False):
            required.append(field["name"])
    return {"title": title, "type": "object", "properties": properties, "required": required}
""",
            "build_json_schema",
            [
                ("builds-properties-and-required", [[{"name": "id", "type": "int", "required": True, "description": "user id"}, {"name": "nickname", "type": "str", "required": False}], "User"], {"title": "User", "type": "object", "properties": {"id": {"type": "integer", "description": "user id"}, "nickname": {"type": "string", "description": ""}}, "required": ["id"]}),
                ("builds-empty-object-schema", [[], "Empty"], {"title": "Empty", "type": "object", "properties": {}, "required": []}),
                ("rejects-unknown-type", [[{"name": "x", "type": "date"}], "Bad"], E("ValueError")),
            ],
            ["Python type 이름과 JSON Schema type 이름을 명시적으로 매핑하세요.", "optional field는 properties에는 남지만 required에서는 제외됩니다."],
        ),
        "transfer": T(
            "schema-compatibility-diff",
            "새·이전 schema의 호환성 변화 분석하기",
            "schema 생성을 field 추가·삭제·required 변화 비교로 전이한다.",
            "compare_schema_fields(old_fields, new_fields)를 완성해 added, removed, newlyRequired, breaking을 반환하세요.",
            "def compare_schema_fields(old_fields, new_fields):\n    raise NotImplementedError",
            """def compare_schema_fields(old_fields, new_fields):
    old = {field["name"]: field for field in old_fields}
    new = {field["name"]: field for field in new_fields}
    added = sorted(set(new) - set(old))
    removed = sorted(set(old) - set(new))
    newly_required = sorted(
        name for name in new
        if new[name].get("required", False) and (name not in old or not old[name].get("required", False))
    )
    changed_types = sorted(name for name in set(old) & set(new) if old[name].get("type") != new[name].get("type"))
    return {"added": added, "removed": removed, "newlyRequired": newly_required, "changedTypes": changed_types, "breaking": bool(removed or newly_required or changed_types)}
""",
            "compare_schema_fields",
            [
                ("finds-breaking-changes", [[{"name": "id", "type": "int", "required": True}, {"name": "name", "type": "str"}], [{"name": "id", "type": "str", "required": True}, {"name": "email", "type": "str", "required": True}]], {"added": ["email"], "removed": ["name"], "newlyRequired": ["email"], "changedTypes": ["id"], "breaking": True}),
                ("accepts-optional-addition", [[{"name": "id", "type": "int"}], [{"name": "id", "type": "int"}, {"name": "note", "type": "str"}]], {"added": ["note"], "removed": [], "newlyRequired": [], "changedTypes": [], "breaking": False}),
            ],
            ["field 추가도 required이면 기존 client를 깨뜨릴 수 있습니다.", "type 변경과 field 삭제를 별도 목록으로 남기세요."],
        ),
        "retrieval": decision(
            "json-schema-keyword",
            "JSON Schema keyword 역할 회상하기",
            "required, type, format, additionalProperties의 책임과 위험을 구분한다.",
            "choose_schema_keyword(situation)를 완성해 keyword, meaning, risk를 반환하세요.",
            "choose_schema_keyword",
            {
                "field-must-exist": {"keyword": "required", "meaning": "property name must be present", "risk": "confuse with non-null"},
                "email-shape": {"keyword": "format", "meaning": "string follows email format", "risk": "treat format as transport security"},
                "reject-extra-fields": {"keyword": "additionalProperties", "meaning": "false blocks unknown keys", "risk": "break forward compatibility"},
            },
            ["required는 값이 null인지와 다른 조건입니다.", "format은 입력 구조 단서이지 외부 주소의 실제 존재 증명은 아닙니다."],
        ),
    },
    "07": {
        "mastery": T(
            "custom-order-id-type",
            "업무 식별자를 custom type 계약으로 파싱하기",
            "O-YYYY-NNNN 형식을 검증하고 year·sequence로 분해한다.",
            "parse_order_id(value)를 완성해 canonical, year, sequence를 반환하세요.",
            "def parse_order_id(value):\n    raise NotImplementedError",
            """def parse_order_id(value):
    import re
    match = re.fullmatch(r"O-(20\\d{2})-(\\d{4})", str(value).strip().upper())
    if not match:
        raise ValueError("invalid order id")
    year = int(match.group(1))
    sequence = int(match.group(2))
    if sequence < 1:
        raise ValueError("sequence must be positive")
    return {"canonical": f"O-{year}-{sequence:04d}", "year": year, "sequence": sequence}
""",
            "parse_order_id",
            [
                ("normalizes-valid-id", [" o-2026-0042 "], {"canonical": "O-2026-0042", "year": 2026, "sequence": 42}),
                ("rejects-zero-sequence", ["O-2026-0000"], E("ValueError")),
                ("rejects-wrong-shape", ["2026-42"], E("ValueError")),
            ],
            ["정규식 통과 뒤에도 sequence 의미 범위를 검사하세요.", "내부 표현은 한 canonical 형식으로 반환하세요."],
        ),
        "transfer": T(
            "custom-coordinate-type",
            "새 좌표 문자열을 범위가 있는 값 객체로 변환하기",
            "custom id parsing을 위도·경도 문자열과 범위 검증으로 전이한다.",
            "parse_coordinate(value)를 완성해 latitude, longitude, canonical을 반환하세요.",
            "def parse_coordinate(value):\n    raise NotImplementedError",
            """def parse_coordinate(value):
    try:
        latitude_text, longitude_text = str(value).split(",", 1)
        latitude = float(latitude_text.strip())
        longitude = float(longitude_text.strip())
    except (TypeError, ValueError) as error:
        raise ValueError("invalid coordinate") from error
    if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
        raise ValueError("coordinate out of range")
    return {"latitude": latitude, "longitude": longitude, "canonical": f"{latitude:.4f},{longitude:.4f}"}
""",
            "parse_coordinate",
            [
                ("parses-and-normalizes", ["37.5665, 126.9780"], {"latitude": 37.5665, "longitude": 126.978, "canonical": "37.5665,126.9780"}),
                ("accepts-boundary", ["-90,180"], {"latitude": -90.0, "longitude": 180.0, "canonical": "-90.0000,180.0000"}),
                ("rejects-out-of-range", ["91,0"], E("ValueError")),
            ],
            ["문자열 분리 실패와 숫자 변환 실패를 하나의 명확한 계약 오류로 바꾸세요.", "파싱 뒤 위도·경도 범위를 각각 검사하세요."],
        ),
        "retrieval": decision(
            "custom-type-decision",
            "custom type이 필요한 기준 회상하기",
            "반복 형식·범위·canonicalization이 필요한 값과 단순 field validator를 구분한다.",
            "choose_custom_type(situation)를 완성해 choice, reason, evidence를 반환하세요.",
            "choose_custom_type",
            {
                "reused-business-id": {"choice": "custom type", "reason": "shared parse and canonical rules", "evidence": "round-trip examples"},
                "one-model-positive-count": {"choice": "field constraint", "reason": "local numeric range", "evidence": "boundary cases"},
                "secret-string": {"choice": "secret type", "reason": "redacted representation", "evidence": "no plaintext dump"},
            },
            ["여러 model에서 반복되는 값 의미는 custom type으로 모으세요.", "한 field의 단순 범위까지 모두 custom class로 만들 필요는 없습니다."],
        ),
    },
    "08": {
        "mastery": T(
            "flatten-validation-errors",
            "중첩 validation error를 읽기 쉬운 field 목록으로 평탄화하기",
            "loc list를 dotted path로 바꾸고 type·message·input을 보존한다.",
            "flatten_validation_errors(errors)를 완성해 path, type, message, input 목록을 반환하세요.",
            "def flatten_validation_errors(errors):\n    raise NotImplementedError",
            """def flatten_validation_errors(errors):
    result = []
    for error in errors:
        path = ".".join(str(part) for part in error.get("loc", [])) or "$"
        result.append({"path": path, "type": error["type"], "message": error["msg"], "input": error.get("input")})
    return result
""",
            "flatten_validation_errors",
            [
                ("keeps-nested-paths", [[{"loc": ["items", 1, "quantity"], "type": "greater_than", "msg": "must be positive", "input": 0}, {"loc": ["email"], "type": "value_error", "msg": "invalid email", "input": "bad"}]], [{"path": "items.1.quantity", "type": "greater_than", "message": "must be positive", "input": 0}, {"path": "email", "type": "value_error", "message": "invalid email", "input": "bad"}]),
                ("handles-root-error", [[{"loc": [], "type": "model_error", "msg": "mismatch"}]], [{"path": "$", "type": "model_error", "message": "mismatch", "input": None}]),
            ],
            ["list index를 문자열로 바꿔 dotted path에 포함하세요.", "오류 message만 복사하지 말고 type과 원래 input도 보존하세요."],
        ),
        "transfer": T(
            "group-errors-by-top-field",
            "새 form UI를 위해 오류를 최상위 field별로 묶기",
            "평탄화한 오류를 field별 count와 상세 path 목록으로 전이한다.",
            "group_errors_by_field(errors)를 완성해 field별 count와 paths를 반환하세요.",
            "def group_errors_by_field(errors):\n    raise NotImplementedError",
            """def group_errors_by_field(errors):
    grouped = {}
    for error in errors:
        path = ".".join(str(part) for part in error.get("loc", [])) or "$"
        field = str(error.get("loc", ["$"])[0]) if error.get("loc") else "$"
        bucket = grouped.setdefault(field, {"count": 0, "paths": []})
        bucket["count"] += 1
        bucket["paths"].append(path)
    return {key: grouped[key] for key in sorted(grouped)}
""",
            "group_errors_by_field",
            [
                ("groups-nested-item-errors", [[{"loc": ["items", 0, "sku"]}, {"loc": ["items", 1, "quantity"]}, {"loc": ["email"]}]], {"email": {"count": 1, "paths": ["email"]}, "items": {"count": 2, "paths": ["items.0.sku", "items.1.quantity"]}}),
                ("handles-empty-errors", [[]], {}),
            ],
            ["UI grouping key와 정확한 수정 path를 둘 다 남기세요.", "정렬된 key로 반환해 화면과 테스트 결과를 안정화하세요."],
        ),
        "retrieval": decision(
            "validation-feedback-policy",
            "검증 실패 피드백의 안전한 수준 회상하기",
            "field 오류, secret 오류, model 관계 오류에 맞는 표시와 금지 내용을 구분한다.",
            "choose_validation_feedback(situation)를 완성해 show, action, forbidden을 반환하세요.",
            "choose_validation_feedback",
            {
                "field-error": {"show": "path and constraint", "action": "focus field", "forbidden": "dump full payload"},
                "secret-error": {"show": "presence or format only", "action": "re-enter secret", "forbidden": "echo secret"},
                "model-relation-error": {"show": "related field names", "action": "compare values", "forbidden": "blame one field only"},
            },
            ["학습 피드백은 수정할 위치와 규칙을 바로 보여줘야 합니다.", "비밀값과 전체 payload는 오류 설명에도 노출하지 마세요."],
        ),
    },
    "09": {
        "mastery": T(
            "request-response-contract",
            "API 요청과 응답 model 계약을 함께 검증하기",
            "요청 field를 검증해 계산한 응답이 선언된 key·type을 만족하는지 확인한다.",
            "handle_create_request(payload)를 완성해 status와 body를 반환하세요.",
            "def handle_create_request(payload):\n    raise NotImplementedError",
            """def handle_create_request(payload):
    name = str(payload.get("name", "")).strip()
    quantity = payload.get("quantity")
    if not name or not isinstance(quantity, int) or isinstance(quantity, bool) or quantity < 1:
        return {"status": 422, "body": {"error": "invalid request"}}
    body = {"id": f"item-{name.lower().replace(' ', '-')}", "name": name, "quantity": quantity}
    if set(body) != {"id", "name", "quantity"}:
        raise AssertionError("response contract drift")
    return {"status": 201, "body": body}
""",
            "handle_create_request",
            [
                ("returns-created-response", [{"name": " Paper Clip ", "quantity": 3}], {"status": 201, "body": {"id": "item-paper-clip", "name": "Paper Clip", "quantity": 3}}),
                ("returns-validation-error", [{"name": "", "quantity": 0}], {"status": 422, "body": {"error": "invalid request"}}),
                ("rejects-bool-quantity", [{"name": "Box", "quantity": True}], {"status": 422, "body": {"error": "invalid request"}}),
            ],
            ["요청 오류와 서버 내부 오류를 다른 status로 표현하세요.", "응답 model도 key와 type을 검증해야 합니다."],
        ),
        "transfer": T(
            "domain-error-status-map",
            "새 domain 오류를 안정된 HTTP 응답으로 매핑하기",
            "validation 개념을 not-found·conflict·permission 오류와 status/body 계약으로 전이한다.",
            "map_domain_error(error_type, resource)를 완성해 status와 body를 반환하세요.",
            "def map_domain_error(error_type, resource):\n    raise NotImplementedError",
            """def map_domain_error(error_type, resource):
    table = {
        "not-found": (404, "resource not found"),
        "conflict": (409, "resource conflict"),
        "permission": (403, "permission denied"),
        "validation": (422, "invalid request"),
    }
    if error_type not in table:
        raise ValueError("unknown domain error")
    status, message = table[error_type]
    return {"status": status, "body": {"error": error_type, "message": message, "resource": resource}}
""",
            "map_domain_error",
            [
                ("maps-conflict", ["conflict", "order/O-1"], {"status": 409, "body": {"error": "conflict", "message": "resource conflict", "resource": "order/O-1"}}),
                ("maps-permission", ["permission", "report/R-2"], {"status": 403, "body": {"error": "permission", "message": "permission denied", "resource": "report/R-2"}}),
                ("rejects-unknown-error", ["oops", "x"], E("ValueError")),
            ],
            ["domain 오류 이름과 HTTP status 매핑을 한 곳에 고정하세요.", "내부 stack trace 대신 안정된 body 계약을 반환하세요."],
        ),
        "retrieval": decision(
            "api-model-boundary",
            "FastAPI model이 맡을 경계 회상하기",
            "request parsing, domain logic, response serialization 책임을 구분한다.",
            "choose_api_boundary(situation)를 완성해 owner, evidence, forbidden을 반환하세요.",
            "choose_api_boundary",
            {
                "request-shape": {"owner": "request model", "evidence": "422 field paths", "forbidden": "run domain action first"},
                "business-rule": {"owner": "domain service", "evidence": "typed domain result", "forbidden": "hide in serializer"},
                "response-shape": {"owner": "response model", "evidence": "serialized contract", "forbidden": "return arbitrary object"},
            },
            ["model validation과 business rule을 같은 책임으로 섞지 마세요.", "응답도 외부 경계이므로 명시적 schema가 필요합니다."],
        ),
    },
    "10": {
        "mastery": T(
            "validated-data-pipeline",
            "원시 레코드를 검증·중복 제거·집계하는 pipeline 만들기",
            "각 단계의 accepted·rejected·duplicate 증거와 category 합계를 함께 반환한다.",
            "run_validated_pipeline(rows)를 완성해 acceptedCount, rejectedIndexes, duplicateIds, totals를 반환하세요.",
            "def run_validated_pipeline(rows):\n    raise NotImplementedError",
            """def run_validated_pipeline(rows):
    seen = set()
    accepted = []
    rejected = []
    duplicates = []
    for index, row in enumerate(rows):
        try:
            row_id = str(row["id"]).strip()
            category = str(row["category"]).strip().lower()
            amount = int(row["amount"])
            if not row_id or not category or amount < 0:
                raise ValueError
        except (KeyError, TypeError, ValueError):
            rejected.append(index)
            continue
        if row_id in seen:
            duplicates.append(row_id)
            continue
        seen.add(row_id)
        accepted.append({"id": row_id, "category": category, "amount": amount})
    totals = {}
    for row in accepted:
        totals[row["category"]] = totals.get(row["category"], 0) + row["amount"]
    return {"acceptedCount": len(accepted), "rejectedIndexes": rejected, "duplicateIds": duplicates, "totals": {key: totals[key] for key in sorted(totals)}}
""",
            "run_validated_pipeline",
            [
                ("keeps-stage-evidence", [[{"id": "A", "category": " Book ", "amount": "10"}, {"id": "A", "category": "book", "amount": 20}, {"id": "B", "category": "Music", "amount": 5}, {"id": "C", "amount": 1}]], {"acceptedCount": 2, "rejectedIndexes": [3], "duplicateIds": ["A"], "totals": {"book": 10, "music": 5}}),
                ("handles-empty-pipeline", [[]], {"acceptedCount": 0, "rejectedIndexes": [], "duplicateIds": [], "totals": {}}),
            ],
            ["validation 실패와 duplicate 제외를 다른 목록으로 남기세요.", "집계는 accepted 레코드에서만 수행하세요."],
        ),
        "transfer": T(
            "batch-contract-summary",
            "새 event batch의 schema version과 순서 계약 검증하기",
            "데이터 pipeline을 event version·sequence 중복·payload field 검사로 전이한다.",
            "validate_event_batch(events, version, required_payload_keys)를 완성하세요.",
            "def validate_event_batch(events, version, required_payload_keys):\n    raise NotImplementedError",
            """def validate_event_batch(events, version, required_payload_keys):
    accepted = []
    rejected = []
    seen_sequences = set()
    for index, event in enumerate(events):
        sequence = event.get("sequence")
        payload = event.get("payload")
        valid = (
            event.get("version") == version
            and isinstance(sequence, int) and not isinstance(sequence, bool)
            and sequence not in seen_sequences
            and isinstance(payload, dict)
            and all(key in payload for key in required_payload_keys)
        )
        if not valid:
            rejected.append(index)
            continue
        seen_sequences.add(sequence)
        accepted.append(sequence)
    return {"acceptedSequences": sorted(accepted), "rejectedIndexes": rejected, "nextSequence": max(accepted, default=0) + 1}
""",
            "validate_event_batch",
            [
                ("validates-version-sequence-and-payload", [[{"version": 2, "sequence": 2, "payload": {"id": "B"}}, {"version": 1, "sequence": 1, "payload": {"id": "A"}}, {"version": 2, "sequence": 2, "payload": {"id": "dup"}}, {"version": 2, "sequence": 3, "payload": {}}], 2, ["id"]], {"acceptedSequences": [2], "rejectedIndexes": [1, 2, 3], "nextSequence": 3}),
                ("handles-empty-batch", [[], 1, ["id"]], {"acceptedSequences": [], "rejectedIndexes": [], "nextSequence": 1}),
            ],
            ["version, sequence, payload 계약을 모두 통과한 event만 accepted에 넣으세요.", "중복 sequence도 rejected index로 남기세요."],
        ),
        "retrieval": decision(
            "pipeline-evidence-stage",
            "검증 pipeline 단계별 증거 회상하기",
            "ingest, validate, transform, persist 단계에 맞는 증거와 실패 위험을 구분한다.",
            "choose_pipeline_evidence(situation)를 완성해 evidence, check, risk를 반환하세요.",
            "choose_pipeline_evidence",
            {
                "ingest": {"evidence": "source hash and row count", "check": "read contract", "risk": "source drift"},
                "validate": {"evidence": "accepted and rejected indexes", "check": "field paths", "risk": "silent bad rows"},
                "persist": {"evidence": "artifact hash and schema version", "check": "read-back", "risk": "unreadable output"},
            },
            ["각 단계가 몇 개의 레코드를 받았고 넘겼는지 추적하세요.", "최종 파일만 남기지 말고 schema version과 read-back 증거를 함께 보존하세요."],
        ),
    },
}
