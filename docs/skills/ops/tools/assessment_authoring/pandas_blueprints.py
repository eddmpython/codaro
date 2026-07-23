from __future__ import annotations

from .common import TaskBlueprint, raises, task


T = task
E = raises


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "inspect-table-contract",
            "레코드에서 표의 shape와 결측 계약 읽기",
            "행 목록을 열 집합, 행 수, 열별 결측 수로 요약한다.",
            "inspect_table(rows)를 완성해 columns, rowCount, nullCounts를 반환하세요.",
            "def inspect_table(rows):\n    raise NotImplementedError",
            """def inspect_table(rows):
    if not isinstance(rows, list):
        raise TypeError("rows must be a list")
    if any(not isinstance(row, dict) for row in rows):
        raise TypeError("each row must be a dict")
    columns = sorted({key for row in rows for key in row})
    return {
        "columns": columns,
        "rowCount": len(rows),
        "nullCounts": {column: sum(row.get(column) is None for row in rows) for column in columns},
    }
""",
            "inspect_table",
            [
                (
                    "finds-union-and-missing-values",
                    [[{"city": "Seoul", "sales": 12}, {"city": "Busan", "sales": None}, {"city": "Jeju"}]],
                    {"columns": ["city", "sales"], "rowCount": 3, "nullCounts": {"city": 0, "sales": 2}},
                ),
                ("handles-empty-table", [[]], {"columns": [], "rowCount": 0, "nullCounts": {}}),
                ("rejects-non-row-value", [[{"ok": 1}, "broken"]], E("TypeError")),
            ],
            ["열 목록은 첫 행만 보지 말고 모든 행의 key 합집합으로 만드세요.", "key가 없거나 값이 None이면 결측으로 셉니다."],
        ),
        "transfer": T(
            "select-complete-rows",
            "새 주문 표에서 필수 열이 완전한 행만 고르기",
            "필수 열 계약을 처음 보는 주문 레코드에 적용하고 거절 위치를 함께 남긴다.",
            "select_complete_rows(rows, required)를 완성해 accepted와 rejectedIndexes를 반환하세요.",
            "def select_complete_rows(rows, required):\n    raise NotImplementedError",
            """def select_complete_rows(rows, required):
    if not required or len(set(required)) != len(required):
        raise ValueError("required columns must be unique and non-empty")
    accepted = []
    rejected = []
    for index, row in enumerate(rows):
        if all(column in row and row[column] is not None for column in required):
            accepted.append(row)
        else:
            rejected.append(index)
    return {"accepted": accepted, "rejectedIndexes": rejected}
""",
            "select_complete_rows",
            [
                (
                    "separates-valid-orders",
                    [[{"id": "A", "amount": 10}, {"id": "B"}, {"id": "C", "amount": None}], ["id", "amount"]],
                    {"accepted": [{"id": "A", "amount": 10}], "rejectedIndexes": [1, 2]},
                ),
                ("accepts-all-complete-rows", [[{"x": 1}, {"x": 2}], ["x"]], {"accepted": [{"x": 1}, {"x": 2}], "rejectedIndexes": []}),
                ("rejects-empty-contract", [[], []], E("ValueError")),
            ],
            ["필수 열의 존재와 None 여부를 모두 확인하세요.", "거절된 행을 버리기만 하지 말고 원래 index를 증거로 남기세요."],
        ),
        "retrieval": T(
            "choose-table-operation",
            "표 질문에 맞는 연산을 기억에서 선택하기",
            "select, filter, group, join의 역할과 row-count 변화를 구분한다.",
            "choose_table_operation(goal)를 완성해 operation, changesRows, evidence를 반환하세요.",
            "def choose_table_operation(goal):\n    raise NotImplementedError",
            """def choose_table_operation(goal):
    table = {
        "keep-columns": {"operation": "select", "changesRows": False, "evidence": "column list"},
        "keep-matching-rows": {"operation": "filter", "changesRows": True, "evidence": "predicate and row count"},
        "summarize-by-key": {"operation": "group", "changesRows": True, "evidence": "group key and aggregate"},
        "combine-related-tables": {"operation": "join", "changesRows": True, "evidence": "join key and unmatched rows"},
    }
    if goal not in table:
        raise ValueError("unknown table goal")
    return table[goal]
""",
            "choose_table_operation",
            [
                ("recalls-filter", ["keep-matching-rows"], {"operation": "filter", "changesRows": True, "evidence": "predicate and row count"}),
                ("recalls-join-evidence", ["combine-related-tables"], {"operation": "join", "changesRows": True, "evidence": "join key and unmatched rows"}),
                ("rejects-vague-goal", ["make-it-nice"], E("ValueError")),
            ],
            ["열을 고르는 select와 행을 고르는 filter를 구분하세요.", "join은 결합 결과뿐 아니라 매칭되지 않은 행도 확인해야 합니다."],
        ),
    },
    "01": {
        "mastery": T(
            "tip-rate-summary",
            "결제 금액 조건을 적용해 팁 비율 요약하기",
            "최소 결제 금액을 통과한 주문의 평균 팁 비율과 최고 결제 주문을 계산한다.",
            "summarize_tips(rows, minimum_total)를 완성해 qualifyingCount, averageTipRate, highestBillId를 반환하세요.",
            "def summarize_tips(rows, minimum_total):\n    raise NotImplementedError",
            """def summarize_tips(rows, minimum_total):
    if minimum_total < 0 or any(row["total"] <= 0 for row in rows):
        raise ValueError("bill totals must be positive")
    selected = [row for row in rows if row["total"] >= minimum_total]
    if not selected:
        return {"qualifyingCount": 0, "averageTipRate": None, "highestBillId": None}
    rates = [row["tip"] / row["total"] for row in selected]
    highest = max(selected, key=lambda row: (row["total"], row["id"]))
    return {
        "qualifyingCount": len(selected),
        "averageTipRate": round(sum(rates) / len(rates), 4),
        "highestBillId": highest["id"],
    }
""",
            "summarize_tips",
            [
                ("filters-and-computes-rates", [[{"id": "A", "total": 20, "tip": 4}, {"id": "B", "total": 40, "tip": 6}, {"id": "C", "total": 10, "tip": 1}], 20], {"qualifyingCount": 2, "averageTipRate": 0.175, "highestBillId": "B"}),
                ("reports-empty-selection", [[{"id": "A", "total": 10, "tip": 1}], 20], {"qualifyingCount": 0, "averageTipRate": None, "highestBillId": None}),
                ("rejects-zero-total", [[{"id": "A", "total": 0, "tip": 0}], 0], E("ValueError")),
            ],
            ["팁 금액 자체가 아니라 tip / total 비율을 비교하세요.", "선택된 행이 없을 때 0으로 나누지 말고 None으로 명시하세요."],
        ),
        "transfer": T(
            "service-shift-comparison",
            "새 카페 데이터에서 근무 시간대별 서비스 비율 비교하기",
            "팁 분석 규칙을 day 대신 shift 그룹에 옮겨 가장 높은 시간대를 찾는다.",
            "compare_service_shifts(rows)를 완성해 byShift와 bestShift를 반환하세요.",
            "def compare_service_shifts(rows):\n    raise NotImplementedError",
            """def compare_service_shifts(rows):
    grouped = {}
    for row in rows:
        if row["bill"] <= 0:
            raise ValueError("bill must be positive")
        grouped.setdefault(row["shift"], []).append(row["service"] / row["bill"])
    by_shift = {key: round(sum(values) / len(values), 3) for key, values in sorted(grouped.items())}
    best = max(by_shift, key=lambda key: (by_shift[key], key)) if by_shift else None
    return {"byShift": by_shift, "bestShift": best}
""",
            "compare_service_shifts",
            [
                ("compares-two-shifts", [[{"shift": "lunch", "bill": 20, "service": 2}, {"shift": "dinner", "bill": 20, "service": 4}, {"shift": "lunch", "bill": 10, "service": 2}]], {"byShift": {"dinner": 0.2, "lunch": 0.15}, "bestShift": "dinner"}),
                ("handles-no-rows", [[]], {"byShift": {}, "bestShift": None}),
                ("rejects-invalid-bill", [[{"shift": "night", "bill": -1, "service": 1}]], E("ValueError")),
            ],
            ["그룹별 비율을 먼저 만든 뒤 평균을 계산하세요.", "동률일 때 결과가 흔들리지 않도록 그룹 이름으로 한 번 더 정렬하세요."],
        ),
        "retrieval": T(
            "tip-metric-choice",
            "팁 질문의 올바른 지표와 분모 회상하기",
            "금액, 비율, 그룹 비교 질문마다 필요한 metric과 denominator를 선택한다.",
            "choose_tip_metric(question)를 완성해 metric, denominator, warning을 반환하세요.",
            "def choose_tip_metric(question):\n    raise NotImplementedError",
            """def choose_tip_metric(question):
    table = {
        "largest-tip-cash": {"metric": "tip", "denominator": None, "warning": "large bills dominate"},
        "fairest-tip-rate": {"metric": "tip / total", "denominator": "total", "warning": "exclude nonpositive totals"},
        "compare-groups": {"metric": "mean(tip / total)", "denominator": "rows per group", "warning": "show group counts"},
    }
    if question not in table:
        raise ValueError("unknown tip question")
    return table[question]
""",
            "choose_tip_metric",
            [
                ("recalls-rate-denominator", ["fairest-tip-rate"], {"metric": "tip / total", "denominator": "total", "warning": "exclude nonpositive totals"}),
                ("recalls-group-count-warning", ["compare-groups"], {"metric": "mean(tip / total)", "denominator": "rows per group", "warning": "show group counts"}),
                ("rejects-ambiguous-question", ["best-table"], E("ValueError")),
            ],
            ["큰 팁 금액과 높은 팁 비율은 다른 질문입니다.", "그룹 평균에는 그룹별 표본 수를 함께 남기세요."],
        ),
    },
    "02": {
        "mastery": T(
            "survival-rate-by-group",
            "승객 그룹별 생존율과 표본 수 계산하기",
            "선택한 그룹 열마다 전체 수, 생존 수, 생존율을 함께 집계한다.",
            "survival_by_group(rows, group_key)를 완성해 그룹별 count, survived, rate를 반환하세요.",
            "def survival_by_group(rows, group_key):\n    raise NotImplementedError",
            """def survival_by_group(rows, group_key):
    grouped = {}
    for row in rows:
        key = str(row[group_key])
        bucket = grouped.setdefault(key, {"count": 0, "survived": 0})
        bucket["count"] += 1
        bucket["survived"] += 1 if row["survived"] else 0
    return {
        key: {**value, "rate": round(value["survived"] / value["count"], 3)}
        for key, value in sorted(grouped.items())
    }
""",
            "survival_by_group",
            [
                ("groups-class-rates", [[{"class": 1, "survived": 1}, {"class": 1, "survived": 0}, {"class": 3, "survived": 0}], "class"], {"1": {"count": 2, "survived": 1, "rate": 0.5}, "3": {"count": 1, "survived": 0, "rate": 0.0}}),
                ("handles-empty-input", [[], "class"], {}),
            ],
            ["생존율만 반환하지 말고 분모가 되는 count를 함께 남기세요.", "그룹 key는 JSON 증거에서 안정적으로 비교하도록 문자열로 정규화하세요."],
        ),
        "transfer": T(
            "outcome-rate-comparison",
            "새 캠페인 데이터에서 세그먼트별 성공률 비교하기",
            "생존율 집계 구조를 캠페인 세그먼트와 boolean outcome에 전이한다.",
            "compare_outcome_rates(rows, segment_key, outcome_key)를 완성해 rates와 leader를 반환하세요.",
            "def compare_outcome_rates(rows, segment_key, outcome_key):\n    raise NotImplementedError",
            """def compare_outcome_rates(rows, segment_key, outcome_key):
    counts = {}
    for row in rows:
        key = str(row[segment_key])
        bucket = counts.setdefault(key, [0, 0])
        bucket[0] += 1
        bucket[1] += bool(row[outcome_key])
    rates = {key: round(success / count, 3) for key, (count, success) in sorted(counts.items())}
    leader = max(rates, key=lambda key: (rates[key], key)) if rates else None
    return {"rates": rates, "leader": leader, "counts": {key: value[0] for key, value in sorted(counts.items())}}
""",
            "compare_outcome_rates",
            [
                ("compares-campaigns", [[{"campaign": "A", "clicked": True}, {"campaign": "A", "clicked": False}, {"campaign": "B", "clicked": True}], "campaign", "clicked"], {"rates": {"A": 0.5, "B": 1.0}, "leader": "B", "counts": {"A": 2, "B": 1}}),
                ("handles-empty-campaign", [[], "campaign", "clicked"], {"rates": {}, "leader": None, "counts": {}}),
            ],
            ["outcome 값은 bool로 해석하되 그룹별 전체 수를 별도로 누적하세요.", "비율이 높아도 표본 수가 작을 수 있으므로 counts를 버리지 마세요."],
        ),
        "retrieval": T(
            "rate-denominator-choice",
            "비율 질문에서 올바른 분모를 회상하기",
            "전체 비율, 그룹 내 비율, 조건부 비율의 분모를 구분한다.",
            "choose_rate_denominator(question)를 완성해 numerator, denominator, groupBy를 반환하세요.",
            "def choose_rate_denominator(question):\n    raise NotImplementedError",
            """def choose_rate_denominator(question):
    table = {
        "overall-survival": {"numerator": "survived rows", "denominator": "all rows", "groupBy": None},
        "survival-within-class": {"numerator": "survived rows in class", "denominator": "all rows in class", "groupBy": "class"},
        "female-share-among-survivors": {"numerator": "female survived rows", "denominator": "all survived rows", "groupBy": None},
    }
    if question not in table:
        raise ValueError("unknown rate question")
    return table[question]
""",
            "choose_rate_denominator",
            [
                ("recalls-within-group-denominator", ["survival-within-class"], {"numerator": "survived rows in class", "denominator": "all rows in class", "groupBy": "class"}),
                ("distinguishes-share-among-survivors", ["female-share-among-survivors"], {"numerator": "female survived rows", "denominator": "all survived rows", "groupBy": None}),
                ("rejects-undefined-question", ["survival-vibes"], E("ValueError")),
            ],
            ["‘그룹 안에서’라는 말이 있으면 분모도 해당 그룹으로 제한됩니다.", "조건부 질문은 조건을 분자에만 적용하지 않도록 주의하세요."],
        ),
    },
    "03": {
        "mastery": T(
            "species-measurement-summary",
            "펭귄 종별 측정값과 결측 규모 요약하기",
            "종별 전체 수, 측정된 체중 수, 평균 체중을 함께 계산한다.",
            "summarize_species_mass(rows)를 완성해 종별 count, measured, meanMass를 반환하세요.",
            "def summarize_species_mass(rows):\n    raise NotImplementedError",
            """def summarize_species_mass(rows):
    grouped = {}
    for row in rows:
        bucket = grouped.setdefault(row["species"], {"count": 0, "values": []})
        bucket["count"] += 1
        if row.get("body_mass_g") is not None:
            bucket["values"].append(row["body_mass_g"])
    result = {}
    for species, bucket in sorted(grouped.items()):
        values = bucket["values"]
        result[species] = {
            "count": bucket["count"],
            "measured": len(values),
            "meanMass": round(sum(values) / len(values), 1) if values else None,
        }
    return result
""",
            "summarize_species_mass",
            [
                ("keeps-missingness-visible", [[{"species": "Adelie", "body_mass_g": 3700}, {"species": "Adelie", "body_mass_g": None}, {"species": "Gentoo", "body_mass_g": 5000}]], {"Adelie": {"count": 2, "measured": 1, "meanMass": 3700.0}, "Gentoo": {"count": 1, "measured": 1, "meanMass": 5000.0}}),
                ("handles-no-rows", [[]], {}),
            ],
            ["결측 행을 평균에서 제외하되 전체 count에서는 숨기지 마세요.", "측정값이 하나도 없는 그룹은 평균을 None으로 반환하세요."],
        ),
        "transfer": T(
            "group-numeric-comparison",
            "새 센서 데이터에서 장치별 측정 품질 비교하기",
            "종별 비교 규칙을 임의의 그룹 열과 숫자 열에 적용한다.",
            "compare_numeric_groups(rows, group_key, value_key)를 완성해 그룹별 mean, minimum, maximum, missing을 반환하세요.",
            "def compare_numeric_groups(rows, group_key, value_key):\n    raise NotImplementedError",
            """def compare_numeric_groups(rows, group_key, value_key):
    grouped = {}
    for row in rows:
        bucket = grouped.setdefault(str(row[group_key]), {"values": [], "missing": 0})
        value = row.get(value_key)
        if value is None:
            bucket["missing"] += 1
        else:
            bucket["values"].append(value)
    result = {}
    for key, bucket in sorted(grouped.items()):
        values = bucket["values"]
        result[key] = {
            "mean": round(sum(values) / len(values), 2) if values else None,
            "minimum": min(values) if values else None,
            "maximum": max(values) if values else None,
            "missing": bucket["missing"],
        }
    return result
""",
            "compare_numeric_groups",
            [
                ("compares-device-readings", [[{"device": "A", "temp": 10}, {"device": "A", "temp": 14}, {"device": "B", "temp": None}], "device", "temp"], {"A": {"mean": 12.0, "minimum": 10, "maximum": 14, "missing": 0}, "B": {"mean": None, "minimum": None, "maximum": None, "missing": 1}}),
                ("handles-empty-records", [[], "device", "temp"], {}),
            ],
            ["그룹마다 values와 missing을 분리해서 누적하세요.", "값이 없는 그룹에 min이나 max를 호출하지 마세요."],
        ),
        "retrieval": T(
            "missing-value-policy",
            "결측값 처리 기준을 데이터 역할에 맞게 회상하기",
            "식별자, 측정값, 범주형 값의 결측 처리와 남겨야 할 증거를 선택한다.",
            "choose_missing_policy(role)를 완성해 action, evidence, risk를 반환하세요.",
            "def choose_missing_policy(role):\n    raise NotImplementedError",
            """def choose_missing_policy(role):
    table = {
        "identifier": {"action": "reject-row", "evidence": "rejected row index", "risk": "cannot trace entity"},
        "numeric-measurement": {"action": "exclude-from-aggregate", "evidence": "measured and missing counts", "risk": "biased mean"},
        "category": {"action": "label-unknown", "evidence": "unknown category count", "risk": "hidden group"},
    }
    if role not in table:
        raise ValueError("unknown data role")
    return table[role]
""",
            "choose_missing_policy",
            [
                ("recalls-measurement-policy", ["numeric-measurement"], {"action": "exclude-from-aggregate", "evidence": "measured and missing counts", "risk": "biased mean"}),
                ("recalls-category-policy", ["category"], {"action": "label-unknown", "evidence": "unknown category count", "risk": "hidden group"}),
                ("rejects-unknown-role", ["mystery"], E("ValueError")),
            ],
            ["결측을 모두 삭제하는 대신 열의 역할부터 구분하세요.", "처리 결과에는 몇 건을 제외하거나 대체했는지 남겨야 합니다."],
        ),
    },
    "04": {
        "mastery": T(
            "class-centroids",
            "붓꽃 품종별 feature 중심점 계산하기",
            "label별 숫자 feature 평균을 계산해 비교 가능한 중심점 표를 만든다.",
            "class_centroids(rows, label_key, feature_keys)를 완성해 품종별 중심점을 반환하세요.",
            "def class_centroids(rows, label_key, feature_keys):\n    raise NotImplementedError",
            """def class_centroids(rows, label_key, feature_keys):
    if not feature_keys:
        raise ValueError("feature keys required")
    grouped = {}
    for row in rows:
        grouped.setdefault(str(row[label_key]), []).append(row)
    return {
        label: {feature: round(sum(row[feature] for row in group) / len(group), 2) for feature in feature_keys}
        for label, group in sorted(grouped.items())
    }
""",
            "class_centroids",
            [
                ("computes-two-feature-centroids", [[{"species": "setosa", "sepal": 5.0, "petal": 1.4}, {"species": "setosa", "sepal": 5.2, "petal": 1.6}, {"species": "virginica", "sepal": 6.5, "petal": 5.5}], "species", ["sepal", "petal"]], {"setosa": {"sepal": 5.1, "petal": 1.5}, "virginica": {"sepal": 6.5, "petal": 5.5}}),
                ("rejects-empty-features", [[], "species", []], E("ValueError")),
            ],
            ["label 열은 feature 평균에 넣지 마세요.", "각 feature를 같은 그룹 행 수로 나누고 소수 둘째 자리로 정규화하세요."],
        ),
        "transfer": T(
            "nearest-centroid-label",
            "새 측정값을 가장 가까운 중심점에 배정하기",
            "품종 중심점 개념을 거리 기반 분류로 옮겨 label과 거리 근거를 반환한다.",
            "nearest_centroid(point, centroids)를 완성해 label과 squaredDistance를 반환하세요.",
            "def nearest_centroid(point, centroids):\n    raise NotImplementedError",
            """def nearest_centroid(point, centroids):
    if not centroids:
        raise ValueError("centroids required")
    distances = {
        label: sum((point[key] - value) ** 2 for key, value in center.items())
        for label, center in centroids.items()
    }
    label = min(distances, key=lambda key: (distances[key], key))
    return {"label": label, "squaredDistance": round(distances[label], 4)}
""",
            "nearest_centroid",
            [
                ("assigns-nearest-class", [{"x": 1.2, "y": 1.1}, {"A": {"x": 1.0, "y": 1.0}, "B": {"x": 4.0, "y": 4.0}}], {"label": "A", "squaredDistance": 0.05}),
                ("uses-stable-tie-break", [{"x": 1}, {"B": {"x": 0}, "A": {"x": 2}}], {"label": "A", "squaredDistance": 1}),
                ("rejects-no-centroids", [{"x": 1}, {}], E("ValueError")),
            ],
            ["제곱거리는 제곱근을 취하지 않아도 순서가 같습니다.", "동률이면 label 이름으로 결정해 결과를 재현 가능하게 만드세요."],
        ),
        "retrieval": T(
            "feature-leakage-check",
            "분류 feature와 정답 label 경계를 회상하기",
            "열 역할을 받아 feature 사용 가능 여부와 leakage 위험을 판단한다.",
            "classify_column_role(role)를 완성해 useAsFeature, reason, evidence를 반환하세요.",
            "def classify_column_role(role):\n    raise NotImplementedError",
            """def classify_column_role(role):
    table = {
        "numeric-measurement": {"useAsFeature": True, "reason": "available before prediction", "evidence": "distribution and missingness"},
        "target-label": {"useAsFeature": False, "reason": "would reveal the answer", "evidence": "excluded feature list"},
        "post-outcome-field": {"useAsFeature": False, "reason": "not available at prediction time", "evidence": "timestamp availability audit"},
    }
    if role not in table:
        raise ValueError("unknown column role")
    return table[role]
""",
            "classify_column_role",
            [
                ("blocks-target-leakage", ["target-label"], {"useAsFeature": False, "reason": "would reveal the answer", "evidence": "excluded feature list"}),
                ("allows-pre-outcome-measurement", ["numeric-measurement"], {"useAsFeature": True, "reason": "available before prediction", "evidence": "distribution and missingness"}),
                ("rejects-unknown-role", ["pretty-color"], E("ValueError")),
            ],
            ["예측 시점에 알 수 없는 열은 feature에서 제외하세요.", "제외한 열 목록도 재현 증거의 일부입니다."],
        ),
    },
    "05": {
        "mastery": T(
            "mpg-efficiency-filter",
            "연식과 실린더 조건으로 자동차 연비 비교하기",
            "조건을 만족한 자동차의 평균 연비와 최고 연비 모델을 계산한다.",
            "summarize_mpg(rows, minimum_year, maximum_cylinders)를 완성해 count, meanMpg, bestModel을 반환하세요.",
            "def summarize_mpg(rows, minimum_year, maximum_cylinders):\n    raise NotImplementedError",
            """def summarize_mpg(rows, minimum_year, maximum_cylinders):
    selected = [row for row in rows if row["year"] >= minimum_year and row["cylinders"] <= maximum_cylinders]
    if not selected:
        return {"count": 0, "meanMpg": None, "bestModel": None}
    best = max(selected, key=lambda row: (row["mpg"], row["model"]))
    return {"count": len(selected), "meanMpg": round(sum(row["mpg"] for row in selected) / len(selected), 2), "bestModel": best["model"]}
""",
            "summarize_mpg",
            [
                ("filters-and-summarizes", [[{"model": "A", "year": 2020, "cylinders": 4, "mpg": 30}, {"model": "B", "year": 2018, "cylinders": 4, "mpg": 25}, {"model": "C", "year": 2021, "cylinders": 6, "mpg": 20}], 2019, 4], {"count": 1, "meanMpg": 30.0, "bestModel": "A"}),
                ("reports-empty-selection", [[], 2020, 4], {"count": 0, "meanMpg": None, "bestModel": None}),
            ],
            ["두 필터 조건을 모두 만족한 행만 selected에 넣으세요.", "빈 선택 결과를 평균 0으로 오해하지 않도록 None으로 표시하세요."],
        ),
        "transfer": T(
            "fuel-unit-normalization",
            "새 차량 데이터의 연비 단위를 하나로 정규화하기",
            "mpg와 L/100km가 섞인 레코드를 L/100km로 바꾸고 효율 순위를 만든다.",
            "normalize_fuel_use(rows)를 완성해 model, litersPer100Km을 효율이 좋은 순서로 반환하세요.",
            "def normalize_fuel_use(rows):\n    raise NotImplementedError",
            """def normalize_fuel_use(rows):
    normalized = []
    for row in rows:
        if row["value"] <= 0:
            raise ValueError("fuel value must be positive")
        if row["unit"] == "mpg":
            value = 235.215 / row["value"]
        elif row["unit"] == "l/100km":
            value = row["value"]
        else:
            raise ValueError("unknown fuel unit")
        normalized.append({"model": row["model"], "litersPer100Km": round(value, 2)})
    return sorted(normalized, key=lambda row: (row["litersPer100Km"], row["model"]))
""",
            "normalize_fuel_use",
            [
                ("normalizes-and-ranks", [[{"model": "A", "value": 47.043, "unit": "mpg"}, {"model": "B", "value": 6.0, "unit": "l/100km"}]], [{"model": "A", "litersPer100Km": 5.0}, {"model": "B", "litersPer100Km": 6.0}]),
                ("handles-empty-list", [[]], []),
                ("rejects-unknown-unit", [[{"model": "X", "value": 10, "unit": "km/l"}]], E("ValueError")),
            ],
            ["서로 다른 단위를 그대로 평균 내지 마세요.", "L/100km는 값이 작을수록 효율이 좋습니다."],
        ),
        "retrieval": T(
            "comparison-normalization-rule",
            "비교 전 단위와 조건 정규화 기준 회상하기",
            "비교 질문의 손상 유형에 맞는 준비 단계와 검증 증거를 선택한다.",
            "choose_comparison_fix(issue)를 완성해 action, evidence, failure를 반환하세요.",
            "def choose_comparison_fix(issue):\n    raise NotImplementedError",
            """def choose_comparison_fix(issue):
    table = {
        "mixed-units": {"action": "convert-to-one-unit", "evidence": "unit column and conversion formula", "failure": "meaningless aggregate"},
        "different-time-window": {"action": "filter-common-window", "evidence": "minimum and maximum date", "failure": "seasonal bias"},
        "empty-filter": {"action": "return-no-result", "evidence": "selected row count", "failure": "fake zero average"},
    }
    if issue not in table:
        raise ValueError("unknown comparison issue")
    return table[issue]
""",
            "choose_comparison_fix",
            [
                ("recalls-unit-normalization", ["mixed-units"], {"action": "convert-to-one-unit", "evidence": "unit column and conversion formula", "failure": "meaningless aggregate"}),
                ("recalls-empty-filter-policy", ["empty-filter"], {"action": "return-no-result", "evidence": "selected row count", "failure": "fake zero average"}),
                ("rejects-untracked-issue", ["ugly-chart"], E("ValueError")),
            ],
            ["비교 전에 단위, 기간, 필터 결과 수를 확인하세요.", "데이터가 없다는 사실과 평균이 0이라는 값은 다릅니다."],
        ),
    },
    "06": {
        "mastery": T(
            "monthly-delay-trend",
            "항공편 월별 평균 지연과 이전 달 변화 계산하기",
            "날짜 순서로 월별 평균 지연을 집계하고 직전 관측 월과의 차이를 남긴다.",
            "monthly_delay_trend(rows)를 완성해 month, meanDelay, changeFromPrevious 목록을 반환하세요.",
            "def monthly_delay_trend(rows):\n    raise NotImplementedError",
            """def monthly_delay_trend(rows):
    grouped = {}
    for row in rows:
        grouped.setdefault(row["month"], []).append(row["delay"])
    result = []
    previous = None
    for month in sorted(grouped):
        mean = round(sum(grouped[month]) / len(grouped[month]), 2)
        result.append({
            "month": month,
            "meanDelay": mean,
            "changeFromPrevious": None if previous is None else round(mean - previous, 2),
        })
        previous = mean
    return result
""",
            "monthly_delay_trend",
            [
                ("sorts-before-computing-change", [[{"month": "2026-02", "delay": 20}, {"month": "2026-01", "delay": 10}, {"month": "2026-02", "delay": 10}, {"month": "2026-03", "delay": 9}]], [{"month": "2026-01", "meanDelay": 10.0, "changeFromPrevious": None}, {"month": "2026-02", "meanDelay": 15.0, "changeFromPrevious": 5.0}, {"month": "2026-03", "meanDelay": 9.0, "changeFromPrevious": -6.0}]),
                ("handles-empty-series", [[]], []),
            ],
            ["입력 행 순서가 아니라 month를 정렬한 뒤 변화를 계산하세요.", "첫 관측 월은 비교 대상이 없으므로 changeFromPrevious가 None입니다."],
        ),
        "transfer": T(
            "rolling-window-average",
            "새 센서 시계열에서 이동 평균 계산하기",
            "월별 변화 개념을 고정 길이 window 평균으로 옮기고 window가 완성된 시점만 반환한다.",
            "rolling_average(points, window)를 완성해 time과 average 목록을 반환하세요.",
            "def rolling_average(points, window):\n    raise NotImplementedError",
            """def rolling_average(points, window):
    if not isinstance(window, int) or isinstance(window, bool) or window < 1:
        raise ValueError("window must be a positive integer")
    ordered = sorted(points, key=lambda point: point["time"])
    result = []
    for index in range(window - 1, len(ordered)):
        values = [point["value"] for point in ordered[index - window + 1:index + 1]]
        result.append({"time": ordered[index]["time"], "average": round(sum(values) / window, 2)})
    return result
""",
            "rolling_average",
            [
                ("computes-ordered-window", [[{"time": 3, "value": 9}, {"time": 1, "value": 3}, {"time": 2, "value": 6}, {"time": 4, "value": 12}], 3], [{"time": 3, "average": 6.0}, {"time": 4, "average": 9.0}]),
                ("returns-no-partial-window", [[{"time": 1, "value": 3}], 2], []),
                ("rejects-zero-window", [[], 0], E("ValueError")),
            ],
            ["계산 전에 time으로 정렬하세요.", "완성되지 않은 앞쪽 window를 임의로 짧게 평균 내지 마세요."],
        ),
        "retrieval": T(
            "time-series-order-check",
            "시계열 분석 전 순서와 간격 점검 기준 회상하기",
            "정렬, 중복 시점, 누락 구간 문제마다 필요한 조치와 증거를 선택한다.",
            "choose_time_series_check(issue)를 완성해 action, evidence, risk를 반환하세요.",
            "def choose_time_series_check(issue):\n    raise NotImplementedError",
            """def choose_time_series_check(issue):
    table = {
        "unsorted-time": {"action": "sort-by-time", "evidence": "monotonic timestamp check", "risk": "wrong lag"},
        "duplicate-time": {"action": "define-aggregation", "evidence": "duplicate count", "risk": "double counting"},
        "missing-period": {"action": "reindex-and-mark-missing", "evidence": "expected versus observed periods", "risk": "fake continuity"},
    }
    if issue not in table:
        raise ValueError("unknown time-series issue")
    return table[issue]
""",
            "choose_time_series_check",
            [
                ("recalls-sort-before-lag", ["unsorted-time"], {"action": "sort-by-time", "evidence": "monotonic timestamp check", "risk": "wrong lag"}),
                ("recalls-gap-policy", ["missing-period"], {"action": "reindex-and-mark-missing", "evidence": "expected versus observed periods", "risk": "fake continuity"}),
                ("rejects-unknown-issue", ["blue-line"], E("ValueError")),
            ],
            ["shift나 diff 전에 시간 정렬을 먼저 증명하세요.", "누락 기간을 0으로 채우는 것과 결측으로 표시하는 것은 다른 판단입니다."],
        ),
    },
    "07": {
        "mastery": T(
            "diamond-unit-price-bands",
            "다이아몬드의 캐럿당 가격과 가격대 분류하기",
            "크기가 다른 보석을 비교하도록 가격을 carat으로 정규화하고 기준 가격대로 나눈다.",
            "diamond_value_bands(rows, premium_threshold)를 완성해 id, pricePerCarat, band 목록을 반환하세요.",
            "def diamond_value_bands(rows, premium_threshold):\n    raise NotImplementedError",
            """def diamond_value_bands(rows, premium_threshold):
    result = []
    for row in rows:
        if row["carat"] <= 0:
            raise ValueError("carat must be positive")
        unit = round(row["price"] / row["carat"], 2)
        band = "premium" if unit >= premium_threshold else "standard"
        result.append({"id": row["id"], "pricePerCarat": unit, "band": band})
    return sorted(result, key=lambda row: row["id"])
""",
            "diamond_value_bands",
            [
                ("normalizes-before-banding", [[{"id": "B", "carat": 2, "price": 9000}, {"id": "A", "carat": 1, "price": 5000}], 4800], [{"id": "A", "pricePerCarat": 5000.0, "band": "premium"}, {"id": "B", "pricePerCarat": 4500.0, "band": "standard"}]),
                ("handles-empty-stock", [[], 5000], []),
                ("rejects-zero-carat", [[{"id": "X", "carat": 0, "price": 10}], 5], E("ValueError")),
            ],
            ["원 가격만 비교하지 말고 price / carat으로 단위를 맞추세요.", "경계값은 premium에 포함하는지 prompt의 계약을 그대로 적용하세요."],
        ),
        "transfer": T(
            "price-per-unit-comparison",
            "새 상품 카탈로그에서 단위 가격 비교하기",
            "캐럿당 가격 규칙을 용량이 다른 상품의 단위 가격과 최저가 선택으로 전이한다.",
            "best_unit_value(items)를 완성해 각 sku의 unitPrice와 bestSku를 반환하세요.",
            "def best_unit_value(items):\n    raise NotImplementedError",
            """def best_unit_value(items):
    if any(item["units"] <= 0 for item in items):
        raise ValueError("units must be positive")
    prices = {item["sku"]: round(item["price"] / item["units"], 4) for item in items}
    best = min(prices, key=lambda sku: (prices[sku], sku)) if prices else None
    return {"unitPrices": {key: prices[key] for key in sorted(prices)}, "bestSku": best}
""",
            "best_unit_value",
            [
                ("finds-lowest-unit-price", [[{"sku": "small", "price": 5, "units": 2}, {"sku": "bulk", "price": 20, "units": 10}]], {"unitPrices": {"bulk": 2.0, "small": 2.5}, "bestSku": "bulk"}),
                ("reports-empty-catalog", [[]], {"unitPrices": {}, "bestSku": None}),
                ("rejects-invalid-unit-count", [[{"sku": "bad", "price": 1, "units": 0}]], E("ValueError")),
            ],
            ["가격과 수량을 같은 통화·단위로 정규화한 뒤 비교하세요.", "동률이면 sku 이름으로 결정해 결과를 안정화하세요."],
        ),
        "retrieval": T(
            "price-outlier-policy",
            "가격 이상치 처리 기준 회상하기",
            "입력 오류, 희귀 고가품, 단위 손상 상황을 구분해 처리와 증거를 반환한다.",
            "choose_price_outlier_policy(cause)를 완성해 action, evidence, risk를 반환하세요.",
            "def choose_price_outlier_policy(cause):\n    raise NotImplementedError",
            """def choose_price_outlier_policy(cause):
    table = {
        "entry-error": {"action": "quarantine-row", "evidence": "source row and rule", "risk": "distorted aggregate"},
        "rare-premium-item": {"action": "keep-and-segment", "evidence": "category and robust summary", "risk": "erase real market"},
        "mixed-currency": {"action": "convert-before-analysis", "evidence": "currency and rate date", "risk": "false outlier"},
    }
    if cause not in table:
        raise ValueError("unknown outlier cause")
    return table[cause]
""",
            "choose_price_outlier_policy",
            [
                ("keeps-real-premium-segment", ["rare-premium-item"], {"action": "keep-and-segment", "evidence": "category and robust summary", "risk": "erase real market"}),
                ("normalizes-currency", ["mixed-currency"], {"action": "convert-before-analysis", "evidence": "currency and rate date", "risk": "false outlier"}),
                ("rejects-unexplained-cause", ["looks-big"], E("ValueError")),
            ],
            ["값이 크다는 이유만으로 행을 삭제하지 마세요.", "제거, 유지, 변환 판단마다 원본 행과 기준을 증거로 남기세요."],
        ),
    },
    "08": {
        "mastery": T(
            "normalized-crash-rate-rank",
            "주별 교통사고 수를 주행 거리로 정규화해 순위 만들기",
            "규모가 다른 지역을 비교하도록 사고 수를 노출량으로 나누고 재현 가능한 순위를 반환한다.",
            "rank_crash_rates(rows, scale)를 완성해 state, rate 목록을 높은 순서로 반환하세요.",
            "def rank_crash_rates(rows, scale):\n    raise NotImplementedError",
            """def rank_crash_rates(rows, scale):
    if scale <= 0:
        raise ValueError("scale must be positive")
    ranked = []
    for row in rows:
        if row["miles"] <= 0:
            raise ValueError("miles must be positive")
        ranked.append({"state": row["state"], "rate": round(row["crashes"] / row["miles"] * scale, 3)})
    return sorted(ranked, key=lambda row: (-row["rate"], row["state"]))
""",
            "rank_crash_rates",
            [
                ("ranks-normalized-rates", [[{"state": "A", "crashes": 10, "miles": 1000}, {"state": "B", "crashes": 8, "miles": 400}], 100], [{"state": "B", "rate": 2.0}, {"state": "A", "rate": 1.0}]),
                ("handles-no-states", [[], 100], []),
                ("rejects-zero-exposure", [[{"state": "X", "crashes": 1, "miles": 0}], 100], E("ValueError")),
            ],
            ["사고 건수만 정렬하지 말고 crashes / miles로 노출량을 보정하세요.", "동률은 state 이름으로 정렬해 순위 흔들림을 막으세요."],
        ),
        "transfer": T(
            "incident-rate-comparison",
            "새 사업장 데이터에서 근로시간당 사고율 비교하기",
            "주행 거리 정규화를 임의의 사건 수와 노출량 열에 전이해 최고 위험 그룹을 찾는다.",
            "compare_incident_rates(rows, event_key, exposure_key, scale)를 완성해 rates와 highestRisk를 반환하세요.",
            "def compare_incident_rates(rows, event_key, exposure_key, scale):\n    raise NotImplementedError",
            """def compare_incident_rates(rows, event_key, exposure_key, scale):
    rates = {}
    for row in rows:
        if row[exposure_key] <= 0:
            raise ValueError("exposure must be positive")
        rates[row["group"]] = round(row[event_key] / row[exposure_key] * scale, 3)
    leader = max(rates, key=lambda key: (rates[key], key)) if rates else None
    return {"rates": {key: rates[key] for key in sorted(rates)}, "highestRisk": leader}
""",
            "compare_incident_rates",
            [
                ("compares-workplace-risk", [[{"group": "plant-a", "incidents": 3, "hours": 300}, {"group": "plant-b", "incidents": 5, "hours": 1000}], "incidents", "hours", 1000], {"rates": {"plant-a": 10.0, "plant-b": 5.0}, "highestRisk": "plant-a"}),
                ("handles-empty-groups", [[], "incidents", "hours", 1000], {"rates": {}, "highestRisk": None}),
            ],
            ["분자는 사건 수, 분모는 위험에 노출된 양이어야 합니다.", "보고서에는 사용한 scale을 제목이나 설명에 함께 표시하세요."],
        ),
        "retrieval": T(
            "count-versus-rate-choice",
            "건수와 비율 중 맞는 비교 기준 회상하기",
            "업무 질문의 규모 차이 여부에 따라 metric과 필수 증거를 선택한다.",
            "choose_risk_metric(question)를 완성해 metric, denominator, evidence를 반환하세요.",
            "def choose_risk_metric(question):\n    raise NotImplementedError",
            """def choose_risk_metric(question):
    table = {
        "total-events-this-month": {"metric": "count", "denominator": None, "evidence": "time window"},
        "compare-different-size-groups": {"metric": "rate", "denominator": "exposure", "evidence": "count, exposure, and scale"},
        "share-of-all-events": {"metric": "proportion", "denominator": "all events", "evidence": "numerator and total"},
    }
    if question not in table:
        raise ValueError("unknown risk question")
    return table[question]
""",
            "choose_risk_metric",
            [
                ("recalls-rate-for-size-difference", ["compare-different-size-groups"], {"metric": "rate", "denominator": "exposure", "evidence": "count, exposure, and scale"}),
                ("recalls-count-window", ["total-events-this-month"], {"metric": "count", "denominator": None, "evidence": "time window"}),
                ("rejects-vague-risk-question", ["most-dangerous"], E("ValueError")),
            ],
            ["규모가 다른 집단을 비교할 때는 반드시 노출량 분모가 필요합니다.", "‘가장 많다’와 ‘발생률이 가장 높다’를 같은 말로 쓰지 마세요."],
        ),
    },
    "09": {
        "mastery": T(
            "left-join-records",
            "두 레코드 표를 key로 left join하기",
            "왼쪽 행을 모두 보존하고 오른쪽 열을 결합하며 중복 key를 명시적으로 거절한다.",
            "left_join_records(left, right, key, right_fields)를 완성하세요.",
            "def left_join_records(left, right, key, right_fields):\n    raise NotImplementedError",
            """def left_join_records(left, right, key, right_fields):
    index = {}
    for row in right:
        value = row[key]
        if value in index:
            raise ValueError("duplicate right key")
        index[value] = row
    result = []
    for row in left:
        merged = dict(row)
        match = index.get(row[key], {})
        for field in right_fields:
            merged[field] = match.get(field)
        result.append(merged)
    return result
""",
            "left_join_records",
            [
                ("preserves-unmatched-left-row", [[{"id": 1, "amount": 10}, {"id": 2, "amount": 20}], [{"id": 1, "owner": "Mina"}], "id", ["owner"]], [{"id": 1, "amount": 10, "owner": "Mina"}, {"id": 2, "amount": 20, "owner": None}]),
                ("handles-empty-right", [[{"id": 1}], [], "id", ["label"]], [{"id": 1, "label": None}]),
                ("rejects-duplicate-right-key", [[{"id": 1}], [{"id": 1}, {"id": 1}], "id", []], E("ValueError")),
            ],
            ["left join은 왼쪽 행 수를 기본적으로 보존합니다.", "many-to-one 계약이면 오른쪽 중복 key를 결합 전에 검사하세요."],
        ),
        "transfer": T(
            "join-key-audit",
            "새 고객·주문 표의 join 전 key 품질 감사하기",
            "결합 전에 양쪽 중복 key와 매칭되지 않는 key를 계산해 위험을 드러낸다.",
            "audit_join_keys(left, right, key)를 완성해 duplicateLeft, duplicateRight, unmatchedLeft, unmatchedRight를 반환하세요.",
            "def audit_join_keys(left, right, key):\n    raise NotImplementedError",
            """def audit_join_keys(left, right, key):
    def counts(rows):
        result = {}
        for row in rows:
            result[row[key]] = result.get(row[key], 0) + 1
        return result
    left_counts = counts(left)
    right_counts = counts(right)
    left_keys = set(left_counts)
    right_keys = set(right_counts)
    return {
        "duplicateLeft": sorted(value for value, count in left_counts.items() if count > 1),
        "duplicateRight": sorted(value for value, count in right_counts.items() if count > 1),
        "unmatchedLeft": sorted(left_keys - right_keys),
        "unmatchedRight": sorted(right_keys - left_keys),
    }
""",
            "audit_join_keys",
            [
                ("finds-duplicates-and-unmatched", [[{"id": 1}, {"id": 1}, {"id": 2}], [{"id": 1}, {"id": 3}, {"id": 3}], "id"], {"duplicateLeft": [1], "duplicateRight": [3], "unmatchedLeft": [2], "unmatchedRight": [3]}),
                ("reports-clean-keys", [[{"id": "A"}], [{"id": "A"}], "id"], {"duplicateLeft": [], "duplicateRight": [], "unmatchedLeft": [], "unmatchedRight": []}),
            ],
            ["join 결과를 보기 전에 각 표의 key 빈도를 세세요.", "unmatchedLeft와 unmatchedRight는 서로 다른 데이터 품질 문제입니다."],
        ),
        "retrieval": T(
            "join-type-choice",
            "보존해야 할 행에 맞는 join 종류 회상하기",
            "분석 질문별 join type, 보존 집합, 확인할 위험을 선택한다.",
            "choose_join_type(goal)를 완성해 join, preserves, audit를 반환하세요.",
            "def choose_join_type(goal):\n    raise NotImplementedError",
            """def choose_join_type(goal):
    table = {
        "only-matched-orders": {"join": "inner", "preserves": "matched keys", "audit": "dropped unmatched rows"},
        "all-customers-even-without-orders": {"join": "left", "preserves": "all customer rows", "audit": "null order fields"},
        "all-keys-from-both-sides": {"join": "outer", "preserves": "union of keys", "audit": "left-only and right-only rows"},
    }
    if goal not in table:
        raise ValueError("unknown join goal")
    return table[goal]
""",
            "choose_join_type",
            [
                ("recalls-left-join", ["all-customers-even-without-orders"], {"join": "left", "preserves": "all customer rows", "audit": "null order fields"}),
                ("recalls-outer-audit", ["all-keys-from-both-sides"], {"join": "outer", "preserves": "union of keys", "audit": "left-only and right-only rows"}),
                ("rejects-unclear-goal", ["merge-everything"], E("ValueError")),
            ],
            ["어느 표의 행을 반드시 보존해야 하는지 먼저 문장으로 쓰세요.", "join 뒤 행 수 증가는 중복 key의 신호일 수 있습니다."],
        ),
    },
    "10": {
        "mastery": T(
            "analysis-report-pipeline",
            "판매 레코드를 정제·집계해 보고서 계약 만들기",
            "유효 행과 거절 행을 분리하고 카테고리 합계와 최고 카테고리를 하나의 결과로 만든다.",
            "build_sales_report(rows, output_path)를 완성해 acceptedCount, rejectedIndexes, totals, leader를 반환하세요. output_path에는 sourceIndex, status, category, amount, reason 열로 모든 입력 행의 채택·거절 근거를 CSV로 저장하세요.",
            "def build_sales_report(rows, output_path=None):\n    raise NotImplementedError",
            """import csv
from pathlib import Path


def build_sales_report(rows, output_path=None):
    totals = {}
    rejected = []
    accepted = 0
    artifact_rows = []
    for index, row in enumerate(rows):
        if not row.get("category") or not isinstance(row.get("amount"), (int, float)) or isinstance(row.get("amount"), bool) or row["amount"] < 0:
            rejected.append(index)
            artifact_rows.append({
                "sourceIndex": index,
                "status": "rejected",
                "category": row.get("category"),
                "amount": row.get("amount"),
                "reason": "category-or-nonnegative-amount",
            })
            continue
        accepted += 1
        totals[row["category"]] = totals.get(row["category"], 0) + row["amount"]
        artifact_rows.append({
            "sourceIndex": index,
            "status": "accepted",
            "category": row["category"],
            "amount": row["amount"],
            "reason": "",
        })
    ordered = {key: totals[key] for key in sorted(totals)}
    leader = max(totals, key=lambda key: (totals[key], key)) if totals else None
    result = {"acceptedCount": accepted, "rejectedIndexes": rejected, "totals": ordered, "leader": leader}
    output_path = Path(output_path or ("output/sales-report.csv" if ordered else "output/empty-report.csv"))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    columns = ["sourceIndex", "status", "category", "amount", "reason"]
    with output_path.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=columns)
        writer.writeheader()
        writer.writerows(artifact_rows)
    return result
""",
            "build_sales_report",
            [
                ("builds-auditable-report", [[{"category": "book", "amount": 10}, {"category": "music", "amount": 20}, {"category": "book", "amount": 5}, {"category": "", "amount": 8}, {"category": "music", "amount": "bad"}], "output/sales-report.csv"], {"acceptedCount": 3, "rejectedIndexes": [3, 4], "totals": {"book": 15, "music": 20}, "leader": "music"}),
                ("reports-no-valid-rows", [[], "output/empty-report.csv"], {"acceptedCount": 0, "rejectedIndexes": [], "totals": {}, "leader": None}),
            ],
            ["반환 집계와 별개로 각 sourceIndex의 채택 상태와 거절 이유를 CSV에 보존하세요.", "빈 입력도 header가 있는 empty-report.csv를 남겨 무산출과 0건 결과를 구분하세요."],
            expectedPaths=[
                {"path": "output/sales-report.csv", "kind": "table", "origin": "created", "format": "csv", "columns": ["sourceIndex", "status", "category", "amount", "reason"]},
                {"path": "output/empty-report.csv", "kind": "table", "origin": "created", "format": "csv", "columns": ["sourceIndex", "status", "category", "amount", "reason"]},
            ],
        ),
        "transfer": T(
            "configurable-group-report",
            "새 비용 데이터에 재사용 가능한 그룹 보고서 적용하기",
            "판매 전용 파이프라인을 그룹 열·값 열·최소값이 다른 보고서로 전이한다.",
            "group_report(rows, group_key, value_key, minimum)를 완성해 groups, includedCount, excludedCount를 반환하세요.",
            "def group_report(rows, group_key, value_key, minimum):\n    raise NotImplementedError",
            """def group_report(rows, group_key, value_key, minimum):
    groups = {}
    included = 0
    for row in rows:
        value = row.get(value_key)
        if not isinstance(value, (int, float)) or isinstance(value, bool) or value < minimum:
            continue
        included += 1
        groups[str(row[group_key])] = groups.get(str(row[group_key]), 0) + value
    return {
        "groups": {key: groups[key] for key in sorted(groups)},
        "includedCount": included,
        "excludedCount": len(rows) - included,
    }
""",
            "group_report",
            [
                ("reuses-report-contract", [[{"team": "A", "cost": 5}, {"team": "A", "cost": 20}, {"team": "B", "cost": 30}, {"team": "B", "cost": None}], "team", "cost", 10], {"groups": {"A": 20, "B": 30}, "includedCount": 2, "excludedCount": 2}),
                ("handles-empty-report", [[], "team", "cost", 0], {"groups": {}, "includedCount": 0, "excludedCount": 0}),
            ],
            ["업무 열 이름을 함수 안에 하드코딩하지 마세요.", "제외 건수를 별도로 계산해 필터 조건의 영향을 드러내세요."],
        ),
        "retrieval": T(
            "report-evidence-contract",
            "재현 가능한 분석 보고서의 필수 증거 회상하기",
            "단계별로 필요한 입력, 변환, 결과 증거와 누락 위험을 선택한다.",
            "choose_report_evidence(stage)를 완성해 evidence, check, risk를 반환하세요.",
            "def choose_report_evidence(stage):\n    raise NotImplementedError",
            """def choose_report_evidence(stage):
    table = {
        "input": {"evidence": "schema and row count", "check": "required columns and types", "risk": "silent source drift"},
        "transform": {"evidence": "rule and rejected rows", "check": "before and after counts", "risk": "hidden data loss"},
        "aggregate": {"evidence": "group key and metric", "check": "recomputed totals", "risk": "wrong denominator"},
        "export": {"evidence": "artifact hash and schema", "check": "read-back validation", "risk": "corrupt report"},
    }
    if stage not in table:
        raise ValueError("unknown report stage")
    return table[stage]
""",
            "choose_report_evidence",
            [
                ("recalls-transform-evidence", ["transform"], {"evidence": "rule and rejected rows", "check": "before and after counts", "risk": "hidden data loss"}),
                ("recalls-export-readback", ["export"], {"evidence": "artifact hash and schema", "check": "read-back validation", "risk": "corrupt report"}),
                ("rejects-decoration-stage", ["make-pretty"], E("ValueError")),
            ],
            ["보고서는 최종 숫자만이 아니라 입력과 변환 근거를 함께 보존해야 합니다.", "파일을 썼다는 사실보다 다시 읽어 계약을 검증한 증거가 강합니다."],
        ),
    },
    "11": {
        "mastery": T(
            "validate-read-contract",
            "파일 읽기 직후 열 타입 계약 검증하기",
            "문자열로 손상될 수 있는 숫자 열을 명시적으로 변환하고 거절 행을 분리한다.",
            "validate_read_contract(rows)를 완성해 accepted와 rejected를 반환하세요.",
            "def validate_read_contract(rows):\n    raise NotImplementedError",
            """def validate_read_contract(rows):
    accepted = []
    rejected = []
    for index, row in enumerate(rows):
        try:
            record_id = str(row["id"]).strip()
            amount = int(row["amount"])
            if not record_id or amount < 0 or isinstance(row["amount"], bool):
                raise ValueError
            accepted.append({"id": record_id, "amount": amount})
        except (KeyError, TypeError, ValueError):
            rejected.append(index)
    return {"accepted": accepted, "rejected": rejected}
""",
            "validate_read_contract",
            [
                ("coerces-only-contract-safe-values", [[{"id": " A ", "amount": "12"}, {"id": "B", "amount": "bad"}, {"amount": 3}, {"id": "C", "amount": -1}]], {"accepted": [{"id": "A", "amount": 12}], "rejected": [1, 2, 3]}),
                ("handles-empty-source", [[]], {"accepted": [], "rejected": []}),
            ],
            ["read 성공을 타입 계약 통과로 간주하지 마세요.", "변환 실패와 음수 값의 원래 행 index를 거절 증거로 남기세요."],
        ),
        "transfer": T(
            "detect-type-damage",
            "새 데이터 소스의 관측 타입 손상 탐지하기",
            "기대 schema와 실제 행을 비교해 열별 손상 행 index를 반환한다.",
            "detect_type_damage(rows, schema)를 완성해 damagedByColumn과 cleanRowCount를 반환하세요.",
            "def detect_type_damage(rows, schema):\n    raise NotImplementedError",
            """def detect_type_damage(rows, schema):
    checks = {
        "int": lambda value: isinstance(value, int) and not isinstance(value, bool),
        "number": lambda value: isinstance(value, (int, float)) and not isinstance(value, bool),
        "str": lambda value: isinstance(value, str),
        "bool": lambda value: isinstance(value, bool),
    }
    if any(kind not in checks for kind in schema.values()):
        raise ValueError("unknown schema type")
    damaged = {column: [] for column in schema}
    clean = 0
    for index, row in enumerate(rows):
        row_clean = True
        for column, kind in schema.items():
            if column not in row or not checks[kind](row[column]):
                damaged[column].append(index)
                row_clean = False
        clean += row_clean
    return {"damagedByColumn": damaged, "cleanRowCount": clean}
""",
            "detect_type_damage",
            [
                ("locates-damaged-columns", [[{"id": 1, "amount": 2.5, "active": True}, {"id": "2", "amount": "3", "active": 1}, {"id": 3, "active": False}], {"id": "int", "amount": "number", "active": "bool"}], {"damagedByColumn": {"id": [1], "amount": [1, 2], "active": [1]}, "cleanRowCount": 1}),
                ("handles-empty-source", [[], {"id": "int"}], {"damagedByColumn": {"id": []}, "cleanRowCount": 0}),
                ("rejects-unknown-schema-kind", [[], {"id": "uuid"}], E("ValueError")),
            ],
            ["bool은 Python에서 int의 하위 타입이므로 숫자 검사에서 따로 제외하세요.", "열이 없는 경우도 타입 손상으로 기록하세요."],
        ),
        "retrieval": T(
            "read-boundary-policy",
            "데이터 읽기 경계의 손상 대응 원칙 회상하기",
            "열 누락, 타입 혼합, 날짜 파싱 실패 상황에 맞는 조치와 증거를 선택한다.",
            "choose_read_boundary_policy(issue)를 완성해 action, evidence, forbidden을 반환하세요.",
            "def choose_read_boundary_policy(issue):\n    raise NotImplementedError",
            """def choose_read_boundary_policy(issue):
    table = {
        "missing-required-column": {"action": "stop-load", "evidence": "expected and actual columns", "forbidden": "invent empty column"},
        "mixed-numeric-text": {"action": "coerce-with-rejection-log", "evidence": "failed row indexes", "forbidden": "silently keep object type"},
        "invalid-date": {"action": "parse-with-explicit-format", "evidence": "invalid values and timezone", "forbidden": "guess locale"},
    }
    if issue not in table:
        raise ValueError("unknown read issue")
    return table[issue]
""",
            "choose_read_boundary_policy",
            [
                ("recalls-mixed-type-policy", ["mixed-numeric-text"], {"action": "coerce-with-rejection-log", "evidence": "failed row indexes", "forbidden": "silently keep object type"}),
                ("recalls-missing-column-stop", ["missing-required-column"], {"action": "stop-load", "evidence": "expected and actual columns", "forbidden": "invent empty column"}),
                ("rejects-unknown-read-issue", ["slow-file"], E("ValueError")),
            ],
            ["파일이 열렸다는 사실과 데이터 계약이 유효하다는 사실을 분리하세요.", "손상 값을 추측해 고치지 말고 실패 위치와 정책을 함께 남기세요."],
        ),
    },
}
