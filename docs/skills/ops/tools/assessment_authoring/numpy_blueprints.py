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
    cases = [(f"recalls-{key}", [key], value) for key, value in list(table.items())[:2]]
    cases.append(("rejects-unknown-situation", ["unknown"], E("ValueError")))
    return T(slug, title, goal, prompt, f"def {entry}(situation):\n    raise NotImplementedError", solution, entry, cases, hints)


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "numeric-matrix-contract",
            "숫자 matrix의 shape·dtype·범위 읽기",
            "중첩 list가 직사각형인지 검증하고 행·열·숫자 종류·최솟값·최댓값을 반환한다.",
            "inspect_numeric_matrix(matrix)를 완성해 shape, dtype, minimum, maximum을 반환하세요.",
            "def inspect_numeric_matrix(matrix):\n    raise NotImplementedError",
            """def inspect_numeric_matrix(matrix):
    if not isinstance(matrix, list) or not matrix:
        raise ValueError("non-empty matrix required")
    width = len(matrix[0])
    if width == 0 or any(not isinstance(row, list) or len(row) != width for row in matrix):
        raise ValueError("ragged matrix")
    values = [value for row in matrix for value in row]
    if any(not isinstance(value, (int, float)) or isinstance(value, bool) for value in values):
        raise TypeError("numeric values required")
    dtype = "float" if any(isinstance(value, float) for value in values) else "int"
    return {"shape": [len(matrix), width], "dtype": dtype, "minimum": min(values), "maximum": max(values)}
""",
            "inspect_numeric_matrix",
            [
                ("reads-shape-and-promoted-dtype", [[[1, 2], [3.5, 4]]], {"shape": [2, 2], "dtype": "float", "minimum": 1, "maximum": 4}),
                ("keeps-integer-dtype", [[[2, -1, 5]]], {"shape": [1, 3], "dtype": "int", "minimum": -1, "maximum": 5}),
                ("rejects-ragged-matrix", [[[1, 2], [3]]], E("ValueError")),
            ],
            ["shape는 [행 수, 열 수] 순서입니다.", "float 값이 하나라도 있으면 공통 dtype을 float로 봅니다."],
        ),
        "transfer": T(
            "reshape-and-transpose",
            "새 sensor vector를 matrix로 reshape하고 transpose하기",
            "shape 개념을 flat values의 row-major 재배치와 축 교환으로 전이한다.",
            "reshape_and_transpose(values, rows)를 완성해 matrix, transpose, shape를 반환하세요.",
            "def reshape_and_transpose(values, rows):\n    raise NotImplementedError",
            """def reshape_and_transpose(values, rows):
    if not isinstance(rows, int) or isinstance(rows, bool) or rows < 1 or len(values) % rows:
        raise ValueError("incompatible shape")
    columns = len(values) // rows
    matrix = [list(values[index * columns:(index + 1) * columns]) for index in range(rows)]
    transposed = [[matrix[row][column] for row in range(rows)] for column in range(columns)]
    return {"matrix": matrix, "transpose": transposed, "shape": [rows, columns]}
""",
            "reshape_and_transpose",
            [
                ("reshapes-row-major-and-transposes", [[1, 2, 3, 4, 5, 6], 2], {"matrix": [[1, 2, 3], [4, 5, 6]], "transpose": [[1, 4], [2, 5], [3, 6]], "shape": [2, 3]}),
                ("handles-single-row", [[7, 8], 1], {"matrix": [[7, 8]], "transpose": [[7], [8]], "shape": [1, 2]}),
                ("rejects-incompatible-size", [[1, 2, 3], 2], E("ValueError")),
            ],
            ["reshape는 값 순서를 바꾸지 않고 row-major로 배치합니다.", "transpose의 각 행은 원 matrix의 한 열입니다."],
        ),
        "retrieval": decision(
            "array-axis-choice",
            "배열 질문에 맞는 axis 회상하기",
            "행별·열별·전체 집계에서 줄어드는 축과 결과 shape를 구분한다.",
            "choose_array_axis(situation)를 완성해 axis, resultShape, meaning을 반환하세요.",
            "choose_array_axis",
            {
                "sum-each-row": {"axis": 1, "resultShape": "rows", "meaning": "collapse columns"},
                "mean-each-column": {"axis": 0, "resultShape": "columns", "meaning": "collapse rows"},
                "global-maximum": {"axis": None, "resultShape": "scalar", "meaning": "collapse all dimensions"},
            },
            ["axis 번호는 남는 축이 아니라 줄어드는 축을 가리킵니다.", "작은 2x3 예시로 결과 shape를 먼저 적어보세요."],
        ),
    },
    "01": {
        "mastery": T(
            "pokemon-stat-totals",
            "포켓몬 stat matrix에서 total과 최강 항목 찾기",
            "각 행의 stat 합계를 계산하고 최소 total 조건을 통과한 이름과 최고 이름을 반환한다.",
            "summarize_pokemon_stats(names, stats, minimum_total)를 완성하세요.",
            "def summarize_pokemon_stats(names, stats, minimum_total):\n    raise NotImplementedError",
            """def summarize_pokemon_stats(names, stats, minimum_total):
    if len(names) != len(stats) or any(not row for row in stats):
        raise ValueError("name and stat rows must align")
    totals = [sum(row) for row in stats]
    selected = [name for name, total in zip(names, totals) if total >= minimum_total]
    best_index = max(range(len(names)), key=lambda index: (totals[index], names[index])) if names else None
    return {"totals": totals, "selected": selected, "best": names[best_index] if best_index is not None else None}
""",
            "summarize_pokemon_stats",
            [
                ("computes-row-totals", [["A", "B", "C"], [[10, 20, 30], [25, 25, 25], [40, 10, 5]], 60], {"totals": [60, 75, 55], "selected": ["A", "B"], "best": "B"}),
                ("handles-empty-roster", [[], [], 0], {"totals": [], "selected": [], "best": None}),
                ("rejects-misaligned-rows", [["A"], [], 0], E("ValueError")),
            ],
            ["stat 합계는 row axis를 줄이는 연산입니다.", "동률일 때 이름으로 결정해 결과를 재현 가능하게 만드세요."],
        ),
        "transfer": T(
            "weighted-candidate-score",
            "새 후보자 feature matrix에 가중 점수 적용하기",
            "stat 합계를 feature별 weight가 다른 dot product와 순위로 전이한다.",
            "rank_weighted_candidates(names, features, weights)를 완성해 scores와 ranking을 반환하세요.",
            "def rank_weighted_candidates(names, features, weights):\n    raise NotImplementedError",
            """def rank_weighted_candidates(names, features, weights):
    if len(names) != len(features) or any(len(row) != len(weights) for row in features):
        raise ValueError("shape mismatch")
    scores = [round(sum(value * weight for value, weight in zip(row, weights)), 3) for row in features]
    ranking = [name for _score, name in sorted(zip(scores, names), key=lambda item: (-item[0], item[1]))]
    return {"scores": scores, "ranking": ranking}
""",
            "rank_weighted_candidates",
            [
                ("applies-feature-weights", [["Mina", "Jun"], [[80, 90, 70], [90, 70, 85]], [0.5, 0.3, 0.2]], {"scores": [81.0, 83.0], "ranking": ["Jun", "Mina"]}),
                ("handles-no-candidates", [[], [], [1]], {"scores": [], "ranking": []}),
                ("rejects-feature-shape-mismatch", [["A"], [[1, 2]], [1]], E("ValueError")),
            ],
            ["각 row와 weights 길이가 같아야 dot product가 의미 있습니다.", "원래 입력 순서의 scores와 정렬된 ranking을 구분하세요."],
        ),
        "retrieval": decision(
            "matrix-selection-rule",
            "boolean mask와 argmax 역할 회상하기",
            "조건 통과 행 선택, 최고 위치, 정렬 순위에 맞는 연산을 구분한다.",
            "choose_matrix_selection(situation)를 완성해 operation, returns, risk를 반환하세요.",
            "choose_matrix_selection",
            {
                "keep-total-at-least-threshold": {"operation": "boolean mask", "returns": "matching rows", "risk": "mask length mismatch"},
                "position-of-largest-total": {"operation": "argmax", "returns": "single index", "risk": "flatten wrong axis"},
                "full-descending-order": {"operation": "argsort", "returns": "index array", "risk": "sort values without names"},
            },
            ["max 값과 max 위치는 다른 결과입니다.", "mask는 선택 대상의 첫 축 길이와 같아야 합니다."],
        ),
    },
    "02": {
        "mastery": T(
            "temperature-anomalies",
            "기온 series의 평균과 anomaly 계산하기",
            "관측값에서 평균을 빼 anomaly를 만들고 절대 anomaly가 큰 index를 찾는다.",
            "temperature_anomalies(values, threshold)를 완성해 mean, anomalies, extremeIndexes를 반환하세요.",
            "def temperature_anomalies(values, threshold):\n    raise NotImplementedError",
            """def temperature_anomalies(values, threshold):
    if not values or threshold < 0:
        raise ValueError("values and nonnegative threshold required")
    mean = sum(values) / len(values)
    anomalies = [round(value - mean, 2) for value in values]
    extremes = [index for index, value in enumerate(anomalies) if abs(value) >= threshold]
    return {"mean": round(mean, 2), "anomalies": anomalies, "extremeIndexes": extremes}
""",
            "temperature_anomalies",
            [
                ("centers-and-finds-extremes", [[10, 12, 14, 24], 7], {"mean": 15.0, "anomalies": [-5.0, -3.0, -1.0, 9.0], "extremeIndexes": [3]}),
                ("includes-threshold-boundary", [[0, 10], 5], {"mean": 5.0, "anomalies": [-5.0, 5.0], "extremeIndexes": [0, 1]}),
                ("rejects-empty-values", [[], 1], E("ValueError")),
            ],
            ["anomaly는 각 값에서 전체 평균을 뺀 값입니다.", "threshold 경계는 포함하는지 계약을 그대로 적용하세요."],
        ),
        "transfer": T(
            "heating-degree-days",
            "새 에너지 데이터에서 난방도일 계산하기",
            "기온 차이 개념을 기준 온도 아래의 양수 부족분 누적으로 전이한다.",
            "heating_degree_days(values, base_temperature)를 완성해 daily와 total을 반환하세요.",
            "def heating_degree_days(values, base_temperature):\n    raise NotImplementedError",
            """def heating_degree_days(values, base_temperature):
    daily = [round(max(0, base_temperature - value), 2) for value in values]
    return {"daily": daily, "total": round(sum(daily), 2), "coldDayCount": sum(value > 0 for value in daily)}
""",
            "heating_degree_days",
            [
                ("clips-warm-days-at-zero", [[12, 18, 22, 15], 18], {"daily": [6, 0, 0, 3], "total": 9, "coldDayCount": 2}),
                ("handles-empty-days", [[], 18], {"daily": [], "total": 0, "coldDayCount": 0}),
            ],
            ["기준보다 따뜻한 날의 부족분은 음수가 아니라 0입니다.", "daily vector와 total scalar를 함께 반환하세요."],
        ),
        "retrieval": decision(
            "temperature-summary-choice",
            "기온 질문에 맞는 요약 통계 회상하기",
            "중심, 변동, 극단값, 추세 질문별 metric과 위험을 구분한다.",
            "choose_temperature_metric(situation)를 완성해 metric, evidence, risk를 반환하세요.",
            "choose_temperature_metric",
            {
                "typical-day": {"metric": "median", "evidence": "ordered values", "risk": "mean distorted by heatwave"},
                "day-to-day-variation": {"metric": "difference", "evidence": "time order", "risk": "unsorted dates"},
                "extreme-event": {"metric": "anomaly threshold", "evidence": "baseline and index", "risk": "arbitrary baseline"},
            },
            ["질문이 중심인지 변화인지 극단인지 먼저 구분하세요.", "시간 차이를 계산하기 전에는 날짜 정렬을 확인하세요."],
        ),
    },
    "03": {
        "mastery": T(
            "earthquake-magnitude-bands",
            "지진 magnitude를 구간화하고 최고 사건 찾기",
            "magnitude 기준으로 minor·moderate·strong count와 strongest event를 반환한다.",
            "summarize_earthquakes(events)를 완성해 bands와 strongestId를 반환하세요.",
            "def summarize_earthquakes(events):\n    raise NotImplementedError",
            """def summarize_earthquakes(events):
    bands = {"minor": 0, "moderate": 0, "strong": 0}
    for event in events:
        magnitude = event["magnitude"]
        if magnitude < 0:
            raise ValueError("negative magnitude")
        band = "minor" if magnitude < 4 else "moderate" if magnitude < 6 else "strong"
        bands[band] += 1
    strongest = max(events, key=lambda event: (event["magnitude"], event["id"])) if events else None
    return {"bands": bands, "strongestId": strongest["id"] if strongest else None}
""",
            "summarize_earthquakes",
            [
                ("counts-magnitude-bands", [[{"id": "E1", "magnitude": 3.2}, {"id": "E2", "magnitude": 5.5}, {"id": "E3", "magnitude": 6.0}]], {"bands": {"minor": 1, "moderate": 1, "strong": 1}, "strongestId": "E3"}),
                ("handles-empty-events", [[]], {"bands": {"minor": 0, "moderate": 0, "strong": 0}, "strongestId": None}),
                ("rejects-negative-magnitude", [[{"id": "X", "magnitude": -1}]], E("ValueError")),
            ],
            ["구간 경계 4와 6이 어느 band에 속하는지 명시적으로 구현하세요.", "count와 strongest event는 다른 축의 결과입니다."],
        ),
        "transfer": T(
            "spatial-grid-counts",
            "새 위치 event를 고정 grid cell로 집계하기",
            "magnitude vector 분석을 latitude·longitude 공간 binning으로 전이한다.",
            "count_spatial_cells(events, cell_size)를 완성해 cells와 densestCell을 반환하세요.",
            "def count_spatial_cells(events, cell_size):\n    raise NotImplementedError",
            """def count_spatial_cells(events, cell_size):
    import math
    if cell_size <= 0:
        raise ValueError("cell size must be positive")
    cells = {}
    for event in events:
        key = f"{math.floor(event['lat'] / cell_size)}:{math.floor(event['lon'] / cell_size)}"
        cells[key] = cells.get(key, 0) + 1
    ordered = {key: cells[key] for key in sorted(cells)}
    densest = max(cells, key=lambda key: (cells[key], key)) if cells else None
    return {"cells": ordered, "densestCell": densest}
""",
            "count_spatial_cells",
            [
                ("bins-events-by-floor", [[{"lat": 1.2, "lon": 2.8}, {"lat": 1.9, "lon": 2.1}, {"lat": -0.1, "lon": 2.0}], 1], {"cells": {"-1:2": 1, "1:2": 2}, "densestCell": "1:2"}),
                ("handles-empty-space", [[], 5], {"cells": {}, "densestCell": None}),
                ("rejects-zero-cell", [[], 0], E("ValueError")),
            ],
            ["음수 좌표에서 int 절삭과 floor가 다름을 주의하세요.", "cell key 형식을 고정해 결과를 안정적으로 비교하세요."],
        ),
        "retrieval": decision(
            "earthquake-analysis-caution",
            "지진 수치 해석의 핵심 주의점 회상하기",
            "magnitude, count, 위치 density 질문의 scale과 증거를 구분한다.",
            "choose_earthquake_caution(situation)를 완성해 caution, evidence, risk를 반환하세요.",
            "choose_earthquake_caution",
            {
                "compare-magnitude": {"caution": "logarithmic scale", "evidence": "raw magnitude", "risk": "treat one unit as linear"},
                "compare-region-count": {"caution": "observation window", "evidence": "time and area bounds", "risk": "unequal exposure"},
                "map-density": {"caution": "cell size", "evidence": "bin definition", "risk": "arbitrary hotspot"},
            },
            ["magnitude는 단순 선형 크기가 아닙니다.", "지역 count 비교에는 관측 기간과 영역 크기가 필요합니다."],
        ),
    },
    "04": {
        "mastery": T(
            "minmax-music-features",
            "음악 feature별 min-max 정규화하기",
            "열별 최소·최대를 사용해 서로 다른 단위의 feature를 0~1 범위로 맞춘다.",
            "minmax_features(matrix)를 완성해 normalized와 ranges를 반환하세요.",
            "def minmax_features(matrix):\n    raise NotImplementedError",
            """def minmax_features(matrix):
    if not matrix or not matrix[0] or any(len(row) != len(matrix[0]) for row in matrix):
        raise ValueError("rectangular matrix required")
    columns = list(zip(*matrix))
    ranges = [[min(column), max(column)] for column in columns]
    normalized = []
    for row in matrix:
        normalized.append([
            0.0 if high == low else round((value - low) / (high - low), 3)
            for value, (low, high) in zip(row, ranges)
        ])
    return {"normalized": normalized, "ranges": ranges}
""",
            "minmax_features",
            [
                ("normalizes-by-column", [[[10, 100], [20, 150], [30, 200]]], {"normalized": [[0.0, 0.0], [0.5, 0.5], [1.0, 1.0]], "ranges": [[10, 30], [100, 200]]}),
                ("handles-constant-column", [[[5, 1], [5, 3]]], {"normalized": [[0.0, 0.0], [0.0, 1.0]], "ranges": [[5, 5], [1, 3]]}),
                ("rejects-empty-matrix", [[],], E("ValueError")),
            ],
            ["정규화 범위는 row가 아니라 각 column에서 계산하세요.", "최대와 최소가 같은 열은 0으로 고정해 0 나눗셈을 피하세요."],
        ),
        "transfer": T(
            "cosine-track-similarity",
            "새 트랙 vector의 cosine similarity 계산하기",
            "feature 정규화를 방향 기반 유사도와 가장 가까운 track 선택으로 전이한다.",
            "rank_cosine_similarity(query, tracks)를 완성해 similarities와 nearest를 반환하세요.",
            "def rank_cosine_similarity(query, tracks):\n    raise NotImplementedError",
            """def rank_cosine_similarity(query, tracks):
    import math
    query_norm = math.sqrt(sum(value * value for value in query))
    if query_norm == 0:
        raise ValueError("zero query vector")
    similarities = {}
    for name, vector in tracks.items():
        if len(vector) != len(query):
            raise ValueError("shape mismatch")
        norm = math.sqrt(sum(value * value for value in vector))
        if norm == 0:
            raise ValueError("zero track vector")
        similarities[name] = round(sum(a * b for a, b in zip(query, vector)) / (query_norm * norm), 4)
    nearest = max(similarities, key=lambda name: (similarities[name], name)) if similarities else None
    return {"similarities": {key: similarities[key] for key in sorted(similarities)}, "nearest": nearest}
""",
            "rank_cosine_similarity",
            [
                ("ranks-by-direction", [[1, 0], {"same": [2, 0], "diagonal": [1, 1], "opposite": [-1, 0]}], {"similarities": {"diagonal": 0.7071, "opposite": -1.0, "same": 1.0}, "nearest": "same"}),
                ("handles-no-tracks", [[1], {}], {"similarities": {}, "nearest": None}),
                ("rejects-zero-query", [[0, 0], {"x": [1, 1]}], E("ValueError")),
            ],
            ["cosine similarity는 vector 크기가 아니라 방향을 비교합니다.", "0 vector는 방향이 없으므로 명시적으로 거절하세요."],
        ),
        "retrieval": decision(
            "feature-scaling-choice",
            "feature scale 방법 선택 기준 회상하기",
            "bounded 값, outlier가 있는 값, 방향 비교에 맞는 변환을 구분한다.",
            "choose_feature_scaling(situation)를 완성해 method, evidence, risk를 반환하세요.",
            "choose_feature_scaling",
            {
                "known-bounds": {"method": "min-max", "evidence": "training min and max", "risk": "future values outside range"},
                "outlier-heavy": {"method": "robust scaling", "evidence": "median and IQR", "risk": "mean distorted"},
                "compare-direction": {"method": "unit norm", "evidence": "vector norm", "risk": "zero vector"},
            },
            ["모든 feature에 같은 scaling을 기계적으로 적용하지 마세요.", "validation/test 데이터로 scaling 기준을 다시 계산하면 leakage입니다."],
        ),
    },
    "05": {
        "mastery": T(
            "batch-bmi-categories",
            "키·몸무게 vector에서 BMI와 범주 계산하기",
            "행별 BMI를 계산하고 under·normal·over 범주 count를 반환한다.",
            "classify_bmi(heights_m, weights_kg)를 완성해 bmi, categories, counts를 반환하세요.",
            "def classify_bmi(heights_m, weights_kg):\n    raise NotImplementedError",
            """def classify_bmi(heights_m, weights_kg):
    if len(heights_m) != len(weights_kg) or any(height <= 0 or weight <= 0 for height, weight in zip(heights_m, weights_kg)):
        raise ValueError("aligned positive measurements required")
    values = [round(weight / (height * height), 1) for height, weight in zip(heights_m, weights_kg)]
    categories = ["under" if value < 18.5 else "normal" if value < 25 else "over" for value in values]
    counts = {key: categories.count(key) for key in ("under", "normal", "over")}
    return {"bmi": values, "categories": categories, "counts": counts}
""",
            "classify_bmi",
            [
                ("computes-and-bands-batch", [[2.0, 1.6, 1.8], [60, 64, 90]], {"bmi": [15.0, 25.0, 27.8], "categories": ["under", "over", "over"], "counts": {"under": 1, "normal": 0, "over": 2}}),
                ("handles-empty-batch", [[], []], {"bmi": [], "categories": [], "counts": {"under": 0, "normal": 0, "over": 0}}),
                ("rejects-zero-height", [[0], [50]], E("ValueError")),
            ],
            ["height 단위가 meter인지 계약에서 확인하세요.", "18.5와 25 경계가 어느 범주에 들어가는지 정확히 구현하세요."],
        ),
        "transfer": T(
            "batch-formula-evaluation",
            "새 가격 vector에 할인·세금 공식을 일괄 적용하기",
            "BMI vector 계산을 같은 shape의 값·할인율에 대한 element-wise 공식으로 전이한다.",
            "final_prices(prices, discount_rates, tax_rate)를 완성해 discounted, final, total을 반환하세요.",
            "def final_prices(prices, discount_rates, tax_rate):\n    raise NotImplementedError",
            """def final_prices(prices, discount_rates, tax_rate):
    if len(prices) != len(discount_rates) or not 0 <= tax_rate <= 1:
        raise ValueError("invalid price contract")
    if any(price < 0 or not 0 <= discount <= 1 for price, discount in zip(prices, discount_rates)):
        raise ValueError("value out of range")
    discounted = [round(price * (1 - discount), 2) for price, discount in zip(prices, discount_rates)]
    final = [round(value * (1 + tax_rate), 2) for value in discounted]
    return {"discounted": discounted, "final": final, "total": round(sum(final), 2)}
""",
            "final_prices",
            [
                ("applies-elementwise-formula", [[100, 200], [0.1, 0.25], 0.1], {"discounted": [90.0, 150.0], "final": [99.0, 165.0], "total": 264.0}),
                ("handles-empty-cart", [[], [], 0.1], {"discounted": [], "final": [], "total": 0}),
                ("rejects-shape-mismatch", [[100], [], 0.1], E("ValueError")),
            ],
            ["prices와 discount_rates는 같은 shape여야 합니다.", "할인 뒤 세금을 적용하는 연산 순서를 지키세요."],
        ),
        "retrieval": decision(
            "vectorization-shape-rule",
            "element-wise 연산의 shape 규칙 회상하기",
            "같은 shape, scalar broadcasting, 불일치 vector 상황을 구분한다.",
            "choose_vector_shape_rule(situation)를 완성해 allowed, resultShape, risk를 반환하세요.",
            "choose_vector_shape_rule",
            {
                "same-length-vectors": {"allowed": True, "resultShape": "same length", "risk": "pair order mismatch"},
                "vector-and-scalar": {"allowed": True, "resultShape": "vector length", "risk": "wrong unit"},
                "different-length-vectors": {"allowed": False, "resultShape": None, "risk": "unintended broadcasting"},
            },
            ["수식보다 먼저 각 입력의 shape를 적으세요.", "broadcasting이 된다는 사실과 업무 의미가 맞는지는 별도 판단입니다."],
        ),
    },
    "06": {
        "mastery": T(
            "heart-risk-points",
            "심장 위험 feature에 명시적 point rule 적용하기",
            "연령·혈압·콜레스테롤·흡연 조건을 행별 point와 band로 변환한다.",
            "score_heart_risk(rows)를 완성해 scores, bands, highRiskIndexes를 반환하세요.",
            "def score_heart_risk(rows):\n    raise NotImplementedError",
            """def score_heart_risk(rows):
    scores = []
    for row in rows:
        score = 0
        score += 1 if row["age"] >= 55 else 0
        score += 1 if row["systolic"] >= 140 else 0
        score += 1 if row["cholesterol"] >= 240 else 0
        score += 2 if row["smoker"] else 0
        scores.append(score)
    bands = ["low" if score <= 1 else "medium" if score <= 3 else "high" for score in scores]
    return {"scores": scores, "bands": bands, "highRiskIndexes": [index for index, band in enumerate(bands) if band == "high"]}
""",
            "score_heart_risk",
            [
                ("applies-transparent-point-rules", [[{"age": 60, "systolic": 150, "cholesterol": 250, "smoker": True}, {"age": 40, "systolic": 120, "cholesterol": 180, "smoker": False}, {"age": 60, "systolic": 130, "cholesterol": 200, "smoker": True}]], {"scores": [5, 0, 3], "bands": ["high", "low", "medium"], "highRiskIndexes": [0]}),
                ("handles-empty-cohort", [[]], {"scores": [], "bands": [], "highRiskIndexes": []}),
            ],
            ["각 feature가 몇 point를 더하는지 코드에서 읽을 수 있게 두세요.", "이 점수는 교육용 규칙이며 의료 진단으로 표현하지 마세요."],
        ),
        "transfer": T(
            "binary-confusion-metrics",
            "새 이진 예측 결과의 confusion matrix 계산하기",
            "risk band를 실제 label·예측 label 비교와 precision·recall로 전이한다.",
            "binary_metrics(actual, predicted)를 완성해 tp, tn, fp, fn, precision, recall을 반환하세요.",
            "def binary_metrics(actual, predicted):\n    raise NotImplementedError",
            """def binary_metrics(actual, predicted):
    if len(actual) != len(predicted) or any(value not in (0, 1) for value in actual + predicted):
        raise ValueError("aligned binary labels required")
    tp = sum(a == 1 and p == 1 for a, p in zip(actual, predicted))
    tn = sum(a == 0 and p == 0 for a, p in zip(actual, predicted))
    fp = sum(a == 0 and p == 1 for a, p in zip(actual, predicted))
    fn = sum(a == 1 and p == 0 for a, p in zip(actual, predicted))
    precision = tp / (tp + fp) if tp + fp else None
    recall = tp / (tp + fn) if tp + fn else None
    return {"tp": tp, "tn": tn, "fp": fp, "fn": fn, "precision": None if precision is None else round(precision, 3), "recall": None if recall is None else round(recall, 3)}
""",
            "binary_metrics",
            [
                ("computes-confusion-and-rates", [[1, 1, 0, 0, 1], [1, 0, 1, 0, 1]], {"tp": 2, "tn": 1, "fp": 1, "fn": 1, "precision": 0.667, "recall": 0.667}),
                ("handles-no-positive-predictions", [[1, 0], [0, 0]], {"tp": 0, "tn": 1, "fp": 0, "fn": 1, "precision": None, "recall": 0.0}),
                ("rejects-misaligned-labels", [[1], [],], E("ValueError")),
            ],
            ["precision 분모와 recall 분모를 구분하세요.", "분모가 0인 metric을 0으로 가장하지 말고 None으로 표시하세요."],
        ),
        "retrieval": decision(
            "risk-analysis-boundary",
            "위험 분석 결과의 해석 경계 회상하기",
            "상관 feature, 예측 score, 의료 진단의 증거 수준을 구분한다.",
            "choose_risk_claim(situation)를 완성해 allowedClaim, evidence, forbidden을 반환하세요.",
            "choose_risk_claim",
            {
                "feature-association": {"allowedClaim": "associated in this dataset", "evidence": "effect and sample size", "forbidden": "causes disease"},
                "prediction-score": {"allowedClaim": "model risk estimate", "evidence": "held-out metrics", "forbidden": "clinical diagnosis"},
                "screening-rule": {"allowedClaim": "rule flag", "evidence": "threshold and confusion matrix", "forbidden": "treatment advice"},
            },
            ["데이터 분석 수치를 진단이나 치료 조언으로 확대하지 마세요.", "예측 성능은 학습 데이터가 아니라 held-out 결과로 설명하세요."],
        ),
    },
    "07": {
        "mastery": T(
            "air-quality-rolling-mean",
            "대기질 시계열의 이동 평균과 초과 시점 찾기",
            "시간순 측정값에 완성 window만 적용하고 평균이 기준 이상인 time을 반환한다.",
            "air_quality_rolling(points, window, threshold)를 완성하세요.",
            "def air_quality_rolling(points, window, threshold):\n    raise NotImplementedError",
            """def air_quality_rolling(points, window, threshold):
    if not isinstance(window, int) or isinstance(window, bool) or window < 1:
        raise ValueError("positive integer window required")
    ordered = sorted(points, key=lambda point: point["time"])
    rolling = []
    for index in range(window - 1, len(ordered)):
        values = [point["pm25"] for point in ordered[index - window + 1:index + 1]]
        rolling.append({"time": ordered[index]["time"], "mean": round(sum(values) / window, 2)})
    return {"rolling": rolling, "exceedTimes": [point["time"] for point in rolling if point["mean"] >= threshold]}
""",
            "air_quality_rolling",
            [
                ("sorts-and-computes-complete-windows", [[{"time": 3, "pm25": 50}, {"time": 1, "pm25": 10}, {"time": 2, "pm25": 30}, {"time": 4, "pm25": 70}], 3, 50], {"rolling": [{"time": 3, "mean": 30.0}, {"time": 4, "mean": 50.0}], "exceedTimes": [4]}),
                ("returns-no-partial-window", [[{"time": 1, "pm25": 10}], 2, 5], {"rolling": [], "exceedTimes": []}),
                ("rejects-zero-window", [[], 0, 0], E("ValueError")),
            ],
            ["입력 순서를 믿지 말고 time으로 정렬하세요.", "window가 완성되기 전 시점은 rolling 결과에 넣지 마세요."],
        ),
        "transfer": T(
            "pollution-episode-detection",
            "새 측정 series에서 연속 초과 episode 찾기",
            "단일 threshold 초과를 연속된 시간 구간의 start·end·peak로 전이한다.",
            "detect_pollution_episodes(values, threshold)를 완성해 episodes를 반환하세요.",
            "def detect_pollution_episodes(values, threshold):\n    raise NotImplementedError",
            """def detect_pollution_episodes(values, threshold):
    episodes = []
    start = None
    peak = None
    for index, value in enumerate(values + [float("-inf")]):
        if value >= threshold:
            if start is None:
                start = index
                peak = value
            else:
                peak = max(peak, value)
        elif start is not None:
            episodes.append({"start": start, "end": index - 1, "peak": peak})
            start = None
            peak = None
    return episodes
""",
            "detect_pollution_episodes",
            [
                ("finds-two-episodes", [[10, 40, 60, 20, 50, 55, 10], 40], [{"start": 1, "end": 2, "peak": 60}, {"start": 4, "end": 5, "peak": 55}]),
                ("closes-episode-at-series-end", [[10, 40, 50], 40], [{"start": 1, "end": 2, "peak": 50}]),
                ("handles-no-episode", [[1, 2], 10], []),
            ],
            ["threshold 이상인 연속 구간을 하나의 episode로 묶으세요.", "series 끝에서도 열린 episode를 닫아야 합니다."],
        ),
        "retrieval": decision(
            "time-window-policy",
            "시계열 window 설정 기준 회상하기",
            "이동 평균, episode, 결측 간격 상황에 맞는 정책과 증거를 구분한다.",
            "choose_time_window_policy(situation)를 완성해 policy, evidence, risk를 반환하세요.",
            "choose_time_window_policy",
            {
                "smooth-noise": {"policy": "rolling mean", "evidence": "window length", "risk": "hide peaks"},
                "detect-sustained-event": {"policy": "consecutive threshold", "evidence": "start end peak", "risk": "ignore sampling gaps"},
                "missing-timestamp": {"policy": "reindex and mark missing", "evidence": "expected interval", "risk": "fake continuity"},
            },
            ["window 길이는 결과를 바꾸는 모델 선택값입니다.", "연속성 판단 전에 timestamp 간격을 확인하세요."],
        ),
    },
    "08": {
        "mastery": T(
            "weighted-happiness-index",
            "국가별 feature에 가중치를 적용해 행복 지수 순위 만들기",
            "feature matrix와 weight vector의 dot product를 계산하고 높은 순위와 기여도를 반환한다.",
            "rank_weighted_index(names, features, weights)를 완성해 scores, ranking, contributions를 반환하세요.",
            "def rank_weighted_index(names, features, weights):\n    raise NotImplementedError",
            """def rank_weighted_index(names, features, weights):
    if len(names) != len(features) or any(len(row) != len(weights) for row in features):
        raise ValueError("shape mismatch")
    contributions = [[round(value * weight, 3) for value, weight in zip(row, weights)] for row in features]
    scores = [round(sum(row), 3) for row in contributions]
    ranking = [name for _score, name in sorted(zip(scores, names), key=lambda item: (-item[0], item[1]))]
    return {"scores": scores, "ranking": ranking, "contributions": contributions}
""",
            "rank_weighted_index",
            [
                ("keeps-feature-contributions", [["A", "B"], [[0.8, 0.5], [0.6, 0.9]], [0.7, 0.3]], {"scores": [0.71, 0.69], "ranking": ["A", "B"], "contributions": [[0.56, 0.15], [0.42, 0.27]]}),
                ("handles-empty-countries", [[], [], [1]], {"scores": [], "ranking": [], "contributions": []}),
                ("rejects-weight-shape-mismatch", [["A"], [[1, 2]], [1]], E("ValueError")),
            ],
            ["최종 score만 남기지 말고 feature별 contribution을 보존하세요.", "weight의 의미와 합계는 분석 문서에 따로 명시해야 합니다."],
        ),
        "transfer": T(
            "rank-change-between-years",
            "새 연도별 지수에서 국가 순위 변화 계산하기",
            "단일 순위를 이전·현재 score의 rank delta와 신규·이탈 국가 비교로 전이한다.",
            "compare_rank_changes(previous, current)를 완성해 changes, entered, exited를 반환하세요.",
            "def compare_rank_changes(previous, current):\n    raise NotImplementedError",
            """def compare_rank_changes(previous, current):
    def ranks(scores):
        ordered = sorted(scores, key=lambda name: (-scores[name], name))
        return {name: index + 1 for index, name in enumerate(ordered)}
    before = ranks(previous)
    after = ranks(current)
    shared = sorted(set(before) & set(after))
    changes = {name: before[name] - after[name] for name in shared}
    return {"changes": changes, "entered": sorted(set(after) - set(before)), "exited": sorted(set(before) - set(after))}
""",
            "compare_rank_changes",
            [
                ("computes-rank-improvement", [{"A": 90, "B": 80, "C": 70}, {"B": 95, "A": 85, "D": 60}], {"changes": {"A": -1, "B": 1}, "entered": ["D"], "exited": ["C"]}),
                ("handles-identical-ranking", [{"A": 2, "B": 1}, {"A": 2, "B": 1}], {"changes": {"A": 0, "B": 0}, "entered": [], "exited": []}),
            ],
            ["양수 change는 순위가 올라갔다는 뜻으로 정의하세요.", "공통 국가와 신규·이탈 국가를 분리해서 보고하세요."],
        ),
        "retrieval": decision(
            "composite-index-caution",
            "복합 지수 해석의 핵심 주의점 회상하기",
            "weight, scale, missing feature가 순위에 주는 영향을 구분한다.",
            "choose_index_caution(situation)를 완성해 caution, evidence, risk를 반환하세요.",
            "choose_index_caution",
            {
                "subjective-weights": {"caution": "run sensitivity analysis", "evidence": "alternative rankings", "risk": "value judgment hidden"},
                "mixed-scales": {"caution": "normalize features", "evidence": "scaling parameters", "risk": "large-unit feature dominates"},
                "missing-feature": {"caution": "state imputation policy", "evidence": "missingness count", "risk": "unfair rank"},
            },
            ["복합 지수는 객관적 사실 하나가 아니라 선택한 weight의 결과입니다.", "weight를 바꾼 순위 민감도를 함께 확인하세요."],
        ),
    },
    "09": {
        "mastery": T(
            "linear-abalone-prediction",
            "전복 feature에 선형 계수를 적용해 나이 예측하기",
            "feature row와 coefficient vector의 dot product에 intercept를 더해 prediction을 반환한다.",
            "linear_predictions(features, coefficients, intercept)를 완성하세요.",
            "def linear_predictions(features, coefficients, intercept):\n    raise NotImplementedError",
            """def linear_predictions(features, coefficients, intercept):
    if any(len(row) != len(coefficients) for row in features):
        raise ValueError("feature shape mismatch")
    return [round(intercept + sum(value * coefficient for value, coefficient in zip(row, coefficients)), 3) for row in features]
""",
            "linear_predictions",
            [
                ("applies-linear-model", [[[1, 2], [3, 4]], [0.5, 2], 1], [5.5, 10.5]),
                ("handles-empty-features", [[], [1], 0], []),
                ("rejects-shape-mismatch", [[[1, 2]], [1], 0], E("ValueError")),
            ],
            ["각 row와 coefficients 길이를 먼저 확인하세요.", "intercept는 모든 row prediction에 한 번씩 더합니다."],
        ),
        "transfer": T(
            "regression-error-metrics",
            "새 회귀 결과의 MAE와 RMSE 계산하기",
            "prediction vector를 실제값과 비교해 signed error·absolute error·squared error를 요약한다.",
            "regression_metrics(actual, predicted)를 완성해 mae, rmse, errors를 반환하세요.",
            "def regression_metrics(actual, predicted):\n    raise NotImplementedError",
            """def regression_metrics(actual, predicted):
    import math
    if len(actual) != len(predicted) or not actual:
        raise ValueError("aligned non-empty values required")
    errors = [round(prediction - truth, 3) for truth, prediction in zip(actual, predicted)]
    mae = sum(abs(error) for error in errors) / len(errors)
    rmse = math.sqrt(sum(error * error for error in errors) / len(errors))
    return {"mae": round(mae, 3), "rmse": round(rmse, 3), "errors": errors}
""",
            "regression_metrics",
            [
                ("computes-two-error-metrics", [[10, 20, 30], [12, 18, 33]], {"mae": 2.333, "rmse": 2.38, "errors": [2, -2, 3]}),
                ("keeps-perfect-zero-error", [[1, 2], [1, 2]], {"mae": 0.0, "rmse": 0.0, "errors": [0, 0]}),
                ("rejects-empty-values", [[], []], E("ValueError")),
            ],
            ["error 부호는 predicted - actual로 고정하세요.", "RMSE는 큰 오류에 더 큰 가중을 줍니다."],
        ),
        "retrieval": decision(
            "regression-evaluation-rule",
            "회귀 평가와 데이터 분리 원칙 회상하기",
            "학습, 검증, 테스트와 MAE·RMSE 질문의 역할을 구분한다.",
            "choose_regression_evaluation(situation)를 완성해 choice, evidence, risk를 반환하세요.",
            "choose_regression_evaluation",
            {
                "tune-model": {"choice": "validation set", "evidence": "metric by candidate", "risk": "test leakage"},
                "final-generalization": {"choice": "untouched test set", "evidence": "one final metric", "risk": "repeated test tuning"},
                "large-errors-costly": {"choice": "RMSE", "evidence": "squared error distribution", "risk": "outlier domination"},
            },
            ["test set은 마지막 한 번의 일반화 추정에 남겨두세요.", "metric 선택은 업무에서 큰 오류가 얼마나 중요한지에 따라 달라집니다."],
        ),
    },
    "10": {
        "mastery": T(
            "standardize-diabetes-features",
            "당뇨 feature를 학습 mean·scale로 표준화하기",
            "각 column에 (value-mean)/scale을 적용하고 0 scale을 거절한다.",
            "standardize_features(matrix, means, scales)를 완성해 standardized와 shape를 반환하세요.",
            "def standardize_features(matrix, means, scales):\n    raise NotImplementedError",
            """def standardize_features(matrix, means, scales):
    if len(means) != len(scales) or any(scale <= 0 for scale in scales) or any(len(row) != len(means) for row in matrix):
        raise ValueError("invalid standardization contract")
    standardized = [[round((value - mean) / scale, 3) for value, mean, scale in zip(row, means, scales)] for row in matrix]
    return {"standardized": standardized, "shape": [len(matrix), len(means)]}
""",
            "standardize_features",
            [
                ("applies-training-parameters", [[[10, 100], [14, 80]], [12, 90], [2, 10]], {"standardized": [[-1.0, 1.0], [1.0, -1.0]], "shape": [2, 2]}),
                ("handles-empty-rows", [[], [0, 0], [1, 1]], {"standardized": [], "shape": [0, 2]}),
                ("rejects-zero-scale", [[[1]], [0], [0]], E("ValueError")),
            ],
            ["means와 scales는 학습 데이터에서 고정된 값이어야 합니다.", "test 행마다 새 mean을 계산하지 마세요."],
        ),
        "transfer": T(
            "score-threshold-classifier",
            "새 표준화 feature에 선형 score와 threshold 적용하기",
            "표준화 결과를 score·probability 없이도 투명한 이진 분류 규칙으로 전이한다.",
            "classify_linear_scores(matrix, weights, bias, threshold)를 완성해 scores, labels, positiveIndexes를 반환하세요.",
            "def classify_linear_scores(matrix, weights, bias, threshold):\n    raise NotImplementedError",
            """def classify_linear_scores(matrix, weights, bias, threshold):
    if any(len(row) != len(weights) for row in matrix):
        raise ValueError("shape mismatch")
    scores = [round(bias + sum(value * weight for value, weight in zip(row, weights)), 3) for row in matrix]
    labels = [1 if score >= threshold else 0 for score in scores]
    return {"scores": scores, "labels": labels, "positiveIndexes": [index for index, label in enumerate(labels) if label == 1]}
""",
            "classify_linear_scores",
            [
                ("applies-score-threshold", [[[1, 2], [-1, 0], [0.5, 0.5]], [1, 0.5], 0, 1], {"scores": [2.0, -1.0, 0.75], "labels": [1, 0, 0], "positiveIndexes": [0]}),
                ("includes-threshold-boundary", [[[1]], [1], 0, 1], {"scores": [1], "labels": [1], "positiveIndexes": [0]}),
                ("rejects-shape-mismatch", [[[1, 2]], [1], 0, 0], E("ValueError")),
            ],
            ["score와 label을 둘 다 남겨 threshold 영향을 확인하세요.", "score == threshold인 경계는 positive에 포함합니다."],
        ),
        "retrieval": decision(
            "ml-pipeline-leakage-check",
            "ML pipeline의 leakage 방지 원칙 회상하기",
            "scaling, threshold tuning, final test 단계에서 허용 데이터와 증거를 구분한다.",
            "choose_pipeline_split_policy(situation)를 완성해 fitOn, evaluateOn, forbidden을 반환하세요.",
            "choose_pipeline_split_policy",
            {
                "fit-scaler": {"fitOn": "training rows", "evaluateOn": "validation transform", "forbidden": "all-data mean"},
                "choose-threshold": {"fitOn": "validation predictions", "evaluateOn": "business metric", "forbidden": "test tuning"},
                "final-report": {"fitOn": "frozen pipeline", "evaluateOn": "untouched test rows", "forbidden": "repeated peeking"},
            },
            ["전처리 parameter도 model parameter처럼 training data에서만 학습하세요.", "test 결과를 보고 threshold를 바꾸면 더 이상 final test가 아닙니다."],
        ),
    },
}
