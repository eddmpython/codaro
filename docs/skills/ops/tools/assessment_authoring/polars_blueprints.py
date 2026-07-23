from __future__ import annotations

from typing import Any

from .common import TaskBlueprint, raises, task


T = task
E = raises


def decision(slug: str, title: str, goal: str, prompt: str, entry: str, table: dict[str, dict[str, Any]], hints: list[str]) -> TaskBlueprint:
    solution = f"def {entry}(situation):\n    table = {table!r}\n    if situation not in table:\n        raise ValueError('unknown situation')\n    return table[situation]\n"
    cases = [(f"recalls-{key}", [key], value) for key, value in list(table.items())[:2]] + [("rejects-unknown", ["unknown"], E("ValueError"))]
    return T(slug, title, goal, prompt, f"def {entry}(situation):\n    raise NotImplementedError", solution, entry, cases, hints)


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "lazy-query-plan",
            "columnar lazy query의 연산 순서 계획하기",
            "scan·filter·select·group·collect 단계를 검증하고 projection pushdown 가능 열을 반환한다.",
            "audit_lazy_plan(steps, required_columns)를 완성해 valid, stages, scanColumns를 반환하세요.",
            "def audit_lazy_plan(steps, required_columns):\n    raise NotImplementedError",
            """def audit_lazy_plan(steps, required_columns):
    allowed = ["scan", "filter", "select", "group", "collect"]
    if not steps or steps[0] != "scan" or steps[-1] != "collect" or any(step not in allowed for step in steps):
        return {"valid": False, "stages": steps, "scanColumns": []}
    if steps.count("collect") != 1 or steps.count("scan") != 1:
        return {"valid": False, "stages": steps, "scanColumns": []}
    return {"valid": True, "stages": steps, "scanColumns": sorted(set(required_columns))}
""",
            "audit_lazy_plan",
            [
                ("accepts-one-collect-at-boundary", [["scan", "filter", "select", "collect"], ["amount", "region", "amount"]], {"valid": True, "stages": ["scan", "filter", "select", "collect"], "scanColumns": ["amount", "region"]}),
                ("rejects-early-collect", [["scan", "collect", "filter"], ["x"]], {"valid": False, "stages": ["scan", "collect", "filter"], "scanColumns": []}),
            ],
            ["collect는 lazy plan의 마지막 경계에서 한 번만 호출하세요.", "실제로 필요한 열만 scanColumns에 남겨 projection pushdown을 설명하세요."],
        ),
        "transfer": T(
            "expression-dependency-plan",
            "새 파생 열 expression의 의존성 순서 만들기",
            "lazy 단계 개념을 파생 열 간 dependency graph와 실행 순서로 전이한다.",
            "order_expressions(expressions)를 완성해 order와 unresolved를 반환하세요.",
            "def order_expressions(expressions):\n    raise NotImplementedError",
            """def order_expressions(expressions):
    pending = {item["name"]: set(item.get("dependsOn", [])) for item in expressions}
    known = {"source"}
    order = []
    while pending:
        ready = sorted(name for name, deps in pending.items() if deps <= known)
        if not ready:
            break
        for name in ready:
            order.append(name)
            known.add(name)
            del pending[name]
    return {"order": order, "unresolved": sorted(pending)}
""",
            "order_expressions",
            [
                ("orders-dependent-columns", [[{"name": "net", "dependsOn": ["source"]}, {"name": "tax", "dependsOn": ["net"]}, {"name": "final", "dependsOn": ["net", "tax"]}]], {"order": ["net", "tax", "final"], "unresolved": []}),
                ("reports-cycle", [[{"name": "a", "dependsOn": ["b"]}, {"name": "b", "dependsOn": ["a"]}]], {"order": [], "unresolved": ["a", "b"]}),
            ],
            ["expression이 참조하는 열이 먼저 만들어져야 합니다.", "진행할 ready node가 없으면 cycle이나 missing dependency를 unresolved로 남기세요."],
        ),
        "retrieval": decision(
            "lazy-eager-boundary",
            "lazy와 eager 실행 경계 회상하기",
            "대용량 scan, 작은 결과 확인, 반복 변환 상황의 실행 정책을 구분한다.",
            "choose_lazy_boundary(situation)를 완성해 mode, evidence, risk를 반환하세요.",
            "choose_lazy_boundary",
            {
                "large-file-pipeline": {"mode": "lazy", "evidence": "optimized plan", "risk": "early materialization"},
                "small-final-result": {"mode": "collect once", "evidence": "row count and schema", "risk": "repeated collect"},
                "interactive-single-column": {"mode": "eager acceptable", "evidence": "bounded size", "risk": "unbounded source"},
            },
            ["lazy라는 이름만으로 빠른 것이 아니라 optimizer가 볼 전체 plan이 있어야 합니다.", "collect 횟수와 결과 크기를 증거로 남기세요."],
        ),
    },
    "01": {
        "mastery": T(
            "movie-rating-groups",
            "영화별 평점 count·mean과 최소 표본 필터 만들기",
            "group aggregation 뒤 최소 rating 수를 통과한 영화만 평균 내림차순으로 반환한다.",
            "rank_movie_ratings(rows, minimum_count)를 완성해 movies와 dropped를 반환하세요.",
            "def rank_movie_ratings(rows, minimum_count):\n    raise NotImplementedError",
            """def rank_movie_ratings(rows, minimum_count):
    grouped = {}
    for row in rows:
        grouped.setdefault(row["movie"], []).append(row["rating"])
    kept = []
    dropped = []
    for movie, values in grouped.items():
        if len(values) < minimum_count:
            dropped.append(movie)
        else:
            kept.append({"movie": movie, "count": len(values), "mean": round(sum(values) / len(values), 2)})
    kept.sort(key=lambda row: (-row["mean"], -row["count"], row["movie"]))
    return {"movies": kept, "dropped": sorted(dropped)}
""",
            "rank_movie_ratings",
            [
                ("filters-after-grouping", [[{"movie": "A", "rating": 5}, {"movie": "A", "rating": 3}, {"movie": "B", "rating": 5}], 2], {"movies": [{"movie": "A", "count": 2, "mean": 4.0}], "dropped": ["B"]}),
                ("handles-empty-ratings", [[], 1], {"movies": [], "dropped": []}),
            ],
            ["minimum_count는 개별 row filter가 아니라 group count에 적용하세요.", "평균과 count를 함께 보여 표본이 작은 순위를 숨기지 마세요."],
        ),
        "transfer": T(
            "weighted-review-score",
            "새 리뷰 데이터에 신뢰도 weight를 적용하기",
            "단순 평균을 verified reviewer weight가 있는 가중 평균과 evidence count로 전이한다.",
            "weighted_review_scores(rows)를 완성해 영화별 score와 weightTotal을 반환하세요.",
            "def weighted_review_scores(rows):\n    raise NotImplementedError",
            """def weighted_review_scores(rows):
    grouped = {}
    for row in rows:
        weight = 2 if row.get("verified") else 1
        bucket = grouped.setdefault(row["movie"], {"weighted": 0, "weight": 0, "count": 0})
        bucket["weighted"] += row["rating"] * weight
        bucket["weight"] += weight
        bucket["count"] += 1
    return {movie: {"score": round(bucket["weighted"] / bucket["weight"], 3), "weightTotal": bucket["weight"], "reviewCount": bucket["count"]} for movie, bucket in sorted(grouped.items())}
""",
            "weighted_review_scores",
            [
                ("weights-verified-review", [[{"movie": "A", "rating": 5, "verified": True}, {"movie": "A", "rating": 2, "verified": False}, {"movie": "B", "rating": 4, "verified": False}]], {"A": {"score": 4.0, "weightTotal": 3, "reviewCount": 2}, "B": {"score": 4.0, "weightTotal": 1, "reviewCount": 1}}),
                ("handles-empty-review-set", [[]], {}),
            ],
            ["가중 합과 weight 합을 따로 누적하세요.", "가중 평균 옆에 실제 reviewCount도 남기세요."],
        ),
        "retrieval": decision(
            "group-expression-choice",
            "group aggregation expression 선택 회상하기",
            "count, mean, weighted mean 질문의 분자·분모·필터 시점을 구분한다.",
            "choose_group_expression(situation)를 완성해 expression, denominator, filterStage를 반환하세요.",
            "choose_group_expression",
            {
                "ratings-per-movie": {"expression": "len", "denominator": None, "filterStage": "after group"},
                "average-rating": {"expression": "mean", "denominator": "non-null ratings", "filterStage": "before group for invalid rows"},
                "trusted-average": {"expression": "sum(value*weight)/sum(weight)", "denominator": "weight sum", "filterStage": "after weight validation"},
            },
            ["group filter와 row filter의 시점을 구분하세요.", "가중 평균 분모는 row 수가 아니라 weight 합입니다."],
        ),
    },
    "02": {
        "mastery": T(
            "weather-filter-plan",
            "날씨 레코드의 schema·조건·projection plan 만들기",
            "필수 열을 확인하고 기온 범위와 강수 조건을 적용해 필요한 열만 반환한다.",
            "filter_weather(rows, minimum_temp, rainy_only)를 완성해 rows와 scannedColumns를 반환하세요.",
            "def filter_weather(rows, minimum_temp, rainy_only):\n    raise NotImplementedError",
            """def filter_weather(rows, minimum_temp, rainy_only):
    required = {"date", "city", "temperature", "rain"}
    if any(set(row) < required for row in rows):
        raise ValueError("weather schema mismatch")
    selected = [row for row in rows if row["temperature"] >= minimum_temp and (not rainy_only or row["rain"] > 0)]
    result = [{"date": row["date"], "city": row["city"], "temperature": row["temperature"]} for row in selected]
    return {"rows": result, "scannedColumns": sorted(required)}
""",
            "filter_weather",
            [
                ("filters-and-projects", [[{"date": "07-01", "city": "Seoul", "temperature": 30, "rain": 5}, {"date": "07-02", "city": "Seoul", "temperature": 25, "rain": 0}], 28, True], {"rows": [{"date": "07-01", "city": "Seoul", "temperature": 30}], "scannedColumns": ["city", "date", "rain", "temperature"]}),
                ("handles-empty-weather", [[], 0, False], {"rows": [], "scannedColumns": ["city", "date", "rain", "temperature"]}),
                ("rejects-schema-gap", [[{"date": "x"}], 0, False], E("ValueError")),
            ],
            ["filter에 쓰는 열도 scan projection에 포함해야 합니다.", "최종 결과에서는 rain 열을 제외해도 filter 단계에서는 필요합니다."],
        ),
        "transfer": T(
            "daily-weather-aggregation",
            "새 hourly weather를 도시·날짜별 일 요약으로 집계하기",
            "row filter를 group key 두 개와 min·max·rain sum 집계로 전이한다.",
            "daily_weather_summary(rows)를 완성해 city, date, minTemp, maxTemp, rainTotal 목록을 반환하세요.",
            "def daily_weather_summary(rows):\n    raise NotImplementedError",
            """def daily_weather_summary(rows):
    grouped = {}
    for row in rows:
        grouped.setdefault((row["city"], row["date"]), []).append(row)
    result = []
    for (city, date), group in sorted(grouped.items()):
        temperatures = [row["temperature"] for row in group]
        result.append({"city": city, "date": date, "minTemp": min(temperatures), "maxTemp": max(temperatures), "rainTotal": sum(row["rain"] for row in group)})
    return result
""",
            "daily_weather_summary",
            [
                ("groups-by-two-keys", [[{"city": "Seoul", "date": "07-01", "temperature": 20, "rain": 1}, {"city": "Seoul", "date": "07-01", "temperature": 30, "rain": 2}, {"city": "Busan", "date": "07-01", "temperature": 25, "rain": 0}]], [{"city": "Busan", "date": "07-01", "minTemp": 25, "maxTemp": 25, "rainTotal": 0}, {"city": "Seoul", "date": "07-01", "minTemp": 20, "maxTemp": 30, "rainTotal": 3}]),
                ("handles-empty-hours", [[]], []),
            ],
            ["city와 date를 함께 group key로 사용하세요.", "temperature는 min/max, rain은 sum으로 서로 다른 집계를 적용하세요."],
        ),
        "retrieval": decision(
            "query-optimization-signal",
            "lazy query 최적화 신호 회상하기",
            "predicate pushdown, projection pushdown, streaming 가능성의 조건을 구분한다.",
            "choose_query_optimization(situation)를 완성해 optimization, evidence, blocker를 반환하세요.",
            "choose_query_optimization",
            {
                "filter-near-scan": {"optimization": "predicate pushdown", "evidence": "filter in plan", "blocker": "opaque Python callback"},
                "select-needed-columns": {"optimization": "projection pushdown", "evidence": "scan column list", "blocker": "select all"},
                "bounded-group-aggregate": {"optimization": "streaming candidate", "evidence": "engine plan", "blocker": "global sort"},
            },
            ["optimizer가 이해할 수 있는 expression을 사용하세요.", "Python callback은 pushdown을 막을 수 있습니다."],
        ),
    },
    "03": {
        "mastery": T(
            "game-sales-pivot",
            "플랫폼·지역별 게임 판매를 pivot 형태로 집계하기",
            "long rows를 플랫폼 행과 지역 열의 합계 matrix로 바꾸고 row totals를 반환한다.",
            "pivot_game_sales(rows)를 완성해 regions, rows를 반환하세요.",
            "def pivot_game_sales(rows):\n    raise NotImplementedError",
            """def pivot_game_sales(rows):
    regions = sorted({row["region"] for row in rows})
    platforms = sorted({row["platform"] for row in rows})
    result = []
    for platform in platforms:
        values = {region: sum(row["sales"] for row in rows if row["platform"] == platform and row["region"] == region) for region in regions}
        result.append({"platform": platform, **values, "total": sum(values.values())})
    return {"regions": regions, "rows": result}
""",
            "pivot_game_sales",
            [
                ("pivots-and-sums-duplicates", [[{"platform": "PC", "region": "EU", "sales": 2}, {"platform": "PC", "region": "EU", "sales": 1}, {"platform": "Switch", "region": "JP", "sales": 4}]], {"regions": ["EU", "JP"], "rows": [{"platform": "PC", "EU": 3, "JP": 0, "total": 3}, {"platform": "Switch", "EU": 0, "JP": 4, "total": 4}]}),
                ("handles-empty-sales", [[]], {"regions": [], "rows": []}),
            ],
            ["같은 platform·region 조합이 여러 행이면 먼저 합산하세요.", "관측이 없는 조합은 0으로 채우되 region 열 목록을 별도로 남기세요."],
        ),
        "transfer": T(
            "market-share-by-platform",
            "새 판매 matrix에서 지역 내 플랫폼 점유율 계산하기",
            "pivot 합계를 지역별 분모가 다른 share와 선두 플랫폼으로 전이한다.",
            "regional_market_share(rows)를 완성해 shares와 leaders를 반환하세요.",
            "def regional_market_share(rows):\n    raise NotImplementedError",
            """def regional_market_share(rows):
    regions = sorted({row["region"] for row in rows})
    shares = {}
    leaders = {}
    for region in regions:
        totals = {}
        for row in rows:
            if row["region"] == region:
                totals[row["platform"]] = totals.get(row["platform"], 0) + row["sales"]
        denominator = sum(totals.values())
        if denominator <= 0:
            raise ValueError("region total must be positive")
        shares[region] = {key: round(totals[key] / denominator, 3) for key in sorted(totals)}
        leaders[region] = max(totals, key=lambda key: (totals[key], key))
    return {"shares": shares, "leaders": leaders}
""",
            "regional_market_share",
            [
                ("computes-region-specific-denominator", [[{"region": "EU", "platform": "PC", "sales": 3}, {"region": "EU", "platform": "Switch", "sales": 1}, {"region": "JP", "platform": "Switch", "sales": 2}]], {"shares": {"EU": {"PC": 0.75, "Switch": 0.25}, "JP": {"Switch": 1.0}}, "leaders": {"EU": "PC", "JP": "Switch"}}),
                ("handles-empty-markets", [[]], {"shares": {}, "leaders": {}}),
            ],
            ["점유율 분모는 전체 세계 판매가 아니라 각 region 합계입니다.", "share와 leader를 같은 group 결과에서 계산하세요."],
        ),
        "retrieval": decision(
            "reshape-operation-choice",
            "long·wide 변환 연산 회상하기",
            "pivot, melt, explode가 바꾸는 행·열 구조를 구분한다.",
            "choose_reshape_operation(situation)를 완성해 operation, inputShape, risk를 반환하세요.",
            "choose_reshape_operation",
            {
                "categories-to-columns": {"operation": "pivot", "inputShape": "long", "risk": "duplicate key needs aggregate"},
                "columns-to-category-rows": {"operation": "melt", "inputShape": "wide", "risk": "lose identifier columns"},
                "list-items-to-rows": {"operation": "explode", "inputShape": "list column", "risk": "row count expansion"},
            },
            ["변환 전 unique key가 보장되는지 확인하세요.", "reshape 뒤 예상 행 수와 identifier 열을 검증하세요."],
        ),
    },
    "04": {
        "mastery": T(
            "stock-return-window",
            "종목별 시간순 수익률과 누적 수익 계산하기",
            "symbol별로 date를 정렬해 이전 close 대비 return과 cumulative return을 반환한다.",
            "stock_returns(rows)를 완성해 symbol, date, return, cumulative 목록을 반환하세요.",
            "def stock_returns(rows):\n    raise NotImplementedError",
            """def stock_returns(rows):
    grouped = {}
    for row in rows:
        grouped.setdefault(row["symbol"], []).append(row)
    result = []
    for symbol, group in sorted(grouped.items()):
        previous = None
        cumulative = 1.0
        for row in sorted(group, key=lambda item: item["date"]):
            change = None if previous is None else row["close"] / previous - 1
            if change is not None:
                cumulative *= 1 + change
            result.append({"symbol": symbol, "date": row["date"], "return": None if change is None else round(change, 3), "cumulative": round(cumulative - 1, 3)})
            previous = row["close"]
    return result
""",
            "stock_returns",
            [
                ("computes-window-per-symbol", [[{"symbol": "A", "date": 2, "close": 110}, {"symbol": "A", "date": 1, "close": 100}, {"symbol": "A", "date": 3, "close": 99}, {"symbol": "B", "date": 1, "close": 50}]], [{"symbol": "A", "date": 1, "return": None, "cumulative": 0.0}, {"symbol": "A", "date": 2, "return": 0.1, "cumulative": 0.1}, {"symbol": "A", "date": 3, "return": -0.1, "cumulative": -0.01}, {"symbol": "B", "date": 1, "return": None, "cumulative": 0.0}]),
                ("handles-empty-prices", [[]], []),
            ],
            ["shift 기준은 symbol group 안에서 date 순서입니다.", "단순 return 합이 아니라 (1+r)을 곱해 cumulative를 계산하세요."],
        ),
        "transfer": T(
            "rolling-volatility",
            "새 return series의 종목별 rolling 변동성 계산하기",
            "window return을 표본 표준편차와 완성 window 시점으로 전이한다.",
            "rolling_volatility(rows, window)를 완성해 symbol, date, volatility 목록을 반환하세요.",
            "def rolling_volatility(rows, window):\n    raise NotImplementedError",
            """def rolling_volatility(rows, window):
    import math
    if window < 2:
        raise ValueError("window must be at least two")
    grouped = {}
    for row in rows:
        grouped.setdefault(row["symbol"], []).append(row)
    result = []
    for symbol, group in sorted(grouped.items()):
        ordered = sorted(group, key=lambda item: item["date"])
        for index in range(window - 1, len(ordered)):
            values = [item["return"] for item in ordered[index - window + 1:index + 1]]
            mean = sum(values) / window
            variance = sum((value - mean) ** 2 for value in values) / (window - 1)
            result.append({"symbol": symbol, "date": ordered[index]["date"], "volatility": round(math.sqrt(variance), 4)})
    return result
""",
            "rolling_volatility",
            [
                ("computes-sample-window-volatility", [[{"symbol": "A", "date": 1, "return": 0.1}, {"symbol": "A", "date": 2, "return": -0.1}, {"symbol": "A", "date": 3, "return": 0.0}], 2], [{"symbol": "A", "date": 2, "volatility": 0.1414}, {"symbol": "A", "date": 3, "volatility": 0.0707}]),
                ("returns-no-partial-window", [[{"symbol": "A", "date": 1, "return": 0.1}], 2], []),
                ("rejects-one-point-window", [[], 1], E("ValueError")),
            ],
            ["표본 표준편차는 window-1로 나눕니다.", "각 symbol group에서 window를 독립적으로 시작하세요."],
        ),
        "retrieval": decision(
            "window-expression-rule",
            "window expression의 partition·order 회상하기",
            "종목별 lag, 전체 rank, 이동 평균에 필요한 partition와 order를 구분한다.",
            "choose_window_expression(situation)를 완성해 partitionBy, orderBy, operation을 반환하세요.",
            "choose_window_expression",
            {
                "previous-close-per-symbol": {"partitionBy": "symbol", "orderBy": "date", "operation": "shift"},
                "daily-rank-across-symbols": {"partitionBy": "date", "orderBy": "return desc", "operation": "rank"},
                "rolling-mean-per-symbol": {"partitionBy": "symbol", "orderBy": "date", "operation": "rolling_mean"},
            },
            ["window 결과를 정의하려면 partition와 order를 둘 다 적으세요.", "전체 row shift를 종목별 이전 값으로 착각하지 마세요."],
        ),
    },
    "05": {
        "mastery": T(
            "streaming-session-rank",
            "음악 청취 event를 사용자별 재생 수·시간으로 집계하기",
            "user·track group 집계와 사용자 안 rank를 한 결과로 반환한다.",
            "rank_streaming_tracks(events)를 완성해 user별 track, plays, seconds, rank를 반환하세요.",
            "def rank_streaming_tracks(events):\n    raise NotImplementedError",
            """def rank_streaming_tracks(events):
    grouped = {}
    for event in events:
        key = (event["user"], event["track"])
        bucket = grouped.setdefault(key, {"plays": 0, "seconds": 0})
        bucket["plays"] += 1
        bucket["seconds"] += event["seconds"]
    users = sorted({key[0] for key in grouped})
    result = []
    for user in users:
        tracks = [(track, grouped[(user, track)]) for owner, track in grouped if owner == user]
        tracks.sort(key=lambda item: (-item[1]["seconds"], -item[1]["plays"], item[0]))
        for index, (track, values) in enumerate(tracks, start=1):
            result.append({"user": user, "track": track, **values, "rank": index})
    return result
""",
            "rank_streaming_tracks",
            [
                ("aggregates-before-user-rank", [[{"user": "u1", "track": "A", "seconds": 30}, {"user": "u1", "track": "A", "seconds": 20}, {"user": "u1", "track": "B", "seconds": 60}, {"user": "u2", "track": "A", "seconds": 10}]], [{"user": "u1", "track": "B", "plays": 1, "seconds": 60, "rank": 1}, {"user": "u1", "track": "A", "plays": 2, "seconds": 50, "rank": 2}, {"user": "u2", "track": "A", "plays": 1, "seconds": 10, "rank": 1}]),
                ("handles-empty-events", [[]], []),
            ],
            ["event row를 바로 rank하지 말고 user·track으로 먼저 집계하세요.", "rank는 사용자마다 1부터 다시 시작합니다."],
        ),
        "transfer": T(
            "sessionize-events",
            "새 event stream을 시간 gap 기준 session으로 나누기",
            "사용자 group window를 gap이 threshold보다 큰 지점에서 session id 증가로 전이한다.",
            "sessionize_events(events, gap_threshold)를 완성해 user, time, session 목록을 반환하세요.",
            "def sessionize_events(events, gap_threshold):\n    raise NotImplementedError",
            """def sessionize_events(events, gap_threshold):
    if gap_threshold < 0:
        raise ValueError("gap threshold must be nonnegative")
    grouped = {}
    for event in events:
        grouped.setdefault(event["user"], []).append(event)
    result = []
    for user, group in sorted(grouped.items()):
        previous = None
        session = 0
        for event in sorted(group, key=lambda item: item["time"]):
            if previous is None or event["time"] - previous > gap_threshold:
                session += 1
            result.append({"user": user, "time": event["time"], "session": session})
            previous = event["time"]
    return result
""",
            "sessionize_events",
            [
                ("splits-on-large-gap-per-user", [[{"user": "a", "time": 20}, {"user": "a", "time": 0}, {"user": "a", "time": 5}, {"user": "b", "time": 100}], 10], [{"user": "a", "time": 0, "session": 1}, {"user": "a", "time": 5, "session": 1}, {"user": "a", "time": 20, "session": 2}, {"user": "b", "time": 100, "session": 1}]),
                ("handles-empty-stream", [[], 10], []),
                ("rejects-negative-gap", [[], -1], E("ValueError")),
            ],
            ["user별 time 정렬 뒤 gap을 계산하세요.", "gap == threshold는 같은 session에 남깁니다."],
        ),
        "retrieval": decision(
            "streaming-group-rule",
            "event stream 집계 단위 회상하기",
            "event, user-track aggregate, session 수준의 key와 증거를 구분한다.",
            "choose_streaming_grain(situation)를 완성해 grain, key, evidence를 반환하세요.",
            "choose_streaming_grain",
            {
                "raw-play": {"grain": "event", "key": "event id", "evidence": "timestamp and duration"},
                "favorite-track": {"grain": "user-track aggregate", "key": "user, track", "evidence": "play and second totals"},
                "visit-behavior": {"grain": "session", "key": "user, session id", "evidence": "gap threshold"},
            },
            ["질문에 맞는 row grain을 먼저 고정하세요.", "session 결과에는 사용한 gap threshold를 반드시 남기세요."],
        ),
    },
    "06": {
        "mastery": T(
            "real-estate-unit-price",
            "부동산 면적당 가격과 지역별 중앙값 비교하기",
            "면적을 검증해 unitPrice를 만들고 지역별 중앙값과 premium listing을 반환한다.",
            "real_estate_unit_prices(rows, premium_ratio)를 완성하세요.",
            "def real_estate_unit_prices(rows, premium_ratio):\n    raise NotImplementedError",
            """def real_estate_unit_prices(rows, premium_ratio):
    if premium_ratio < 1:
        raise ValueError("premium ratio must be at least one")
    normalized = []
    for row in rows:
        if row["area"] <= 0:
            raise ValueError("area must be positive")
        normalized.append({**row, "unitPrice": row["price"] / row["area"]})
    regions = sorted({row["region"] for row in normalized})
    medians = {}
    for region in regions:
        values = sorted(row["unitPrice"] for row in normalized if row["region"] == region)
        middle = len(values) // 2
        medians[region] = round(values[middle] if len(values) % 2 else (values[middle - 1] + values[middle]) / 2, 2)
    premium = sorted(row["id"] for row in normalized if row["unitPrice"] >= medians[row["region"]] * premium_ratio)
    return {"medians": medians, "premiumIds": premium}
""",
            "real_estate_unit_prices",
            [
                ("normalizes-and-compares-within-region", [[{"id": "A", "region": "north", "price": 100, "area": 10}, {"id": "B", "region": "north", "price": 240, "area": 10}, {"id": "C", "region": "south", "price": 90, "area": 10}], 1.4], {"medians": {"north": 17.0, "south": 9.0}, "premiumIds": ["B"]}),
                ("handles-empty-listings", [[], 1], {"medians": {}, "premiumIds": []}),
                ("rejects-zero-area", [[{"id": "X", "region": "r", "price": 1, "area": 0}], 1], E("ValueError")),
            ],
            ["원 가격이 아니라 면적당 가격으로 비교하세요.", "premium은 전체가 아니라 같은 region median을 기준으로 판단하세요."],
        ),
        "transfer": T(
            "property-join-audit",
            "새 매물·지역 통계 join의 unmatched와 중복 감사하기",
            "unit price 분석을 many-to-one 지역 metadata 결합과 key 품질 검사로 전이한다.",
            "join_property_regions(properties, regions)를 완성해 rows, unmatched, duplicateRegions를 반환하세요.",
            "def join_property_regions(properties, regions):\n    raise NotImplementedError",
            """def join_property_regions(properties, regions):
    counts = {}
    for row in regions:
        counts[row["region"]] = counts.get(row["region"], 0) + 1
    duplicates = sorted(key for key, count in counts.items() if count > 1)
    if duplicates:
        return {"rows": [], "unmatched": [], "duplicateRegions": duplicates}
    index = {row["region"]: row for row in regions}
    joined = []
    unmatched = []
    for row in properties:
        if row["region"] not in index:
            unmatched.append(row["id"])
        else:
            joined.append({**row, "population": index[row["region"]]["population"]})
    return {"rows": joined, "unmatched": unmatched, "duplicateRegions": []}
""",
            "join_property_regions",
            [
                ("joins-and-keeps-unmatched-evidence", [[{"id": "A", "region": "r1"}, {"id": "B", "region": "r2"}], [{"region": "r1", "population": 100}]], {"rows": [{"id": "A", "region": "r1", "population": 100}], "unmatched": ["B"], "duplicateRegions": []}),
                ("blocks-duplicate-dimension-key", [[{"id": "A", "region": "r1"}], [{"region": "r1", "population": 1}, {"region": "r1", "population": 2}]], {"rows": [], "unmatched": [], "duplicateRegions": ["r1"]}),
            ],
            ["dimension table의 key uniqueness를 join 전에 확인하세요.", "unmatched 매물을 조용히 버리지 말고 id 목록으로 남기세요."],
        ),
        "retrieval": decision(
            "property-comparison-grain",
            "부동산 비교의 올바른 grain 회상하기",
            "매물, 지역, 시간 단위 질문에 맞는 key와 정규화 지표를 구분한다.",
            "choose_property_grain(situation)를 완성해 grain, metric, evidence를 반환하세요.",
            "choose_property_grain",
            {
                "compare-listings": {"grain": "listing", "metric": "price per area", "evidence": "area unit"},
                "compare-regions": {"grain": "region aggregate", "metric": "median unit price", "evidence": "listing count"},
                "price-trend": {"grain": "region-month", "metric": "median change", "evidence": "time window"},
            },
            ["질문마다 한 row가 무엇을 뜻하는지 먼저 고정하세요.", "지역 비교에는 매물 수와 기간을 함께 표시하세요."],
        ),
    },
    "07": {
        "mastery": T(
            "sports-team-standings",
            "경기 결과에서 팀별 승·패·득실차 순위 만들기",
            "home·away 점수를 양쪽 팀 record로 펼쳐 points와 goal difference를 집계한다.",
            "build_team_standings(matches)를 완성해 team, wins, losses, points, goalDiff 목록을 반환하세요.",
            "def build_team_standings(matches):\n    raise NotImplementedError",
            """def build_team_standings(matches):
    teams = {}
    for match in matches:
        for side, other in (("home", "away"), ("away", "home")):
            name = match[side]
            scored = match[f"{side}Score"]
            conceded = match[f"{other}Score"]
            row = teams.setdefault(name, {"wins": 0, "losses": 0, "points": 0, "goalDiff": 0})
            row["goalDiff"] += scored - conceded
            if scored > conceded:
                row["wins"] += 1
                row["points"] += 3
            elif scored < conceded:
                row["losses"] += 1
    result = [{"team": team, **values} for team, values in teams.items()]
    return sorted(result, key=lambda row: (-row["points"], -row["goalDiff"], row["team"]))
""",
            "build_team_standings",
            [
                ("aggregates-both-sides", [[{"home": "A", "away": "B", "homeScore": 2, "awayScore": 1}, {"home": "B", "away": "C", "homeScore": 0, "awayScore": 3}]], [{"team": "C", "wins": 1, "losses": 0, "points": 3, "goalDiff": 3}, {"team": "A", "wins": 1, "losses": 0, "points": 3, "goalDiff": 1}, {"team": "B", "wins": 0, "losses": 2, "points": 0, "goalDiff": -4}]),
                ("handles-empty-season", [[]], []),
            ],
            ["한 경기를 home·away 두 팀 관점의 row로 생각하세요.", "points 동률이면 goalDiff, team 순서로 tie-break하세요."],
        ),
        "transfer": T(
            "player-window-ranking",
            "새 선수 기록에서 팀 내 득점 rank 만들기",
            "팀 standings 집계를 partition별 dense rank와 동률 처리로 전이한다.",
            "rank_players_within_team(players)를 완성해 team, player, score, rank 목록을 반환하세요.",
            "def rank_players_within_team(players):\n    raise NotImplementedError",
            """def rank_players_within_team(players):
    grouped = {}
    for player in players:
        grouped.setdefault(player["team"], []).append(player)
    result = []
    for team, group in sorted(grouped.items()):
        ordered = sorted(group, key=lambda row: (-row["score"], row["player"]))
        previous_score = None
        rank = 0
        for index, row in enumerate(ordered, start=1):
            if row["score"] != previous_score:
                rank = index
            result.append({"team": team, "player": row["player"], "score": row["score"], "rank": rank})
            previous_score = row["score"]
    return result
""",
            "rank_players_within_team",
            [
                ("ranks-with-ties-per-team", [[{"team": "A", "player": "Mina", "score": 10}, {"team": "A", "player": "Jun", "score": 10}, {"team": "A", "player": "Sol", "score": 5}, {"team": "B", "player": "Ara", "score": 7}]], [{"team": "A", "player": "Jun", "score": 10, "rank": 1}, {"team": "A", "player": "Mina", "score": 10, "rank": 1}, {"team": "A", "player": "Sol", "score": 5, "rank": 3}, {"team": "B", "player": "Ara", "score": 7, "rank": 1}]),
                ("handles-empty-roster", [[]], []),
            ],
            ["rank는 team partition마다 다시 시작합니다.", "같은 score는 같은 rank를 받고 다음 rank에는 gap이 생깁니다."],
        ),
        "retrieval": decision(
            "sports-window-choice",
            "스포츠 통계 window 연산 회상하기",
            "팀 내 rank, 이전 경기, 시즌 누적에 맞는 partition·order를 구분한다.",
            "choose_sports_window(situation)를 완성해 partitionBy, orderBy, operation을 반환하세요.",
            "choose_sports_window",
            {
                "rank-player-in-team": {"partitionBy": "team", "orderBy": "score desc", "operation": "rank"},
                "previous-match-score": {"partitionBy": "team", "orderBy": "date", "operation": "shift"},
                "season-running-points": {"partitionBy": "team", "orderBy": "date", "operation": "cum_sum"},
            },
            ["window 질문에는 group key와 order key가 모두 필요합니다.", "rank와 row number의 동률 처리 차이를 확인하세요."],
        ),
    },
    "08": {
        "mastery": T(
            "social-engagement-rate",
            "게시물별 engagement rate와 creator 요약 만들기",
            "likes·comments·shares를 impressions로 정규화하고 creator별 평균과 count를 반환한다.",
            "social_engagement_summary(posts)를 완성해 postRates와 creators를 반환하세요.",
            "def social_engagement_summary(posts):\n    raise NotImplementedError",
            """def social_engagement_summary(posts):
    rates = []
    grouped = {}
    for post in posts:
        if post["impressions"] <= 0:
            raise ValueError("impressions must be positive")
        rate = (post["likes"] + post["comments"] + post["shares"]) / post["impressions"]
        rates.append({"id": post["id"], "rate": round(rate, 4)})
        grouped.setdefault(post["creator"], []).append(rate)
    creators = {name: {"meanRate": round(sum(values) / len(values), 4), "postCount": len(values)} for name, values in sorted(grouped.items())}
    return {"postRates": rates, "creators": creators}
""",
            "social_engagement_summary",
            [
                ("normalizes-before-creator-mean", [[{"id": "p1", "creator": "A", "likes": 10, "comments": 2, "shares": 0, "impressions": 100}, {"id": "p2", "creator": "A", "likes": 5, "comments": 0, "shares": 0, "impressions": 50}]], {"postRates": [{"id": "p1", "rate": 0.12}, {"id": "p2", "rate": 0.1}], "creators": {"A": {"meanRate": 0.11, "postCount": 2}}}),
                ("handles-empty-feed", [[]], {"postRates": [], "creators": {}}),
                ("rejects-zero-impressions", [[{"id": "x", "creator": "A", "likes": 1, "comments": 0, "shares": 0, "impressions": 0}]], E("ValueError")),
            ],
            ["반응 건수 합을 impressions로 나눠 게시물 크기를 보정하세요.", "creator 평균 옆에 postCount를 함께 남기세요."],
        ),
        "transfer": T(
            "hashtag-explode-count",
            "새 게시물의 hashtag list를 explode해 빈도 집계하기",
            "게시물 grain을 hashtag row로 펼치고 unique post count와 total mention을 구분한다.",
            "hashtag_usage(posts)를 완성해 hashtag별 mentions와 postCount를 반환하세요.",
            "def hashtag_usage(posts):\n    raise NotImplementedError",
            """def hashtag_usage(posts):
    grouped = {}
    for post in posts:
        for tag in post.get("hashtags", []):
            normalized = tag.strip().lower().lstrip("#")
            if not normalized:
                continue
            bucket = grouped.setdefault(normalized, {"mentions": 0, "posts": set()})
            bucket["mentions"] += 1
            bucket["posts"].add(post["id"])
    return {tag: {"mentions": value["mentions"], "postCount": len(value["posts"])} for tag, value in sorted(grouped.items())}
""",
            "hashtag_usage",
            [
                ("distinguishes-mentions-and-posts", [[{"id": "p1", "hashtags": ["#Python", "python", "web"]}, {"id": "p2", "hashtags": ["Python"]}]], {"python": {"mentions": 3, "postCount": 2}, "web": {"mentions": 1, "postCount": 1}}),
                ("handles-posts-without-tags", [[{"id": "p1"}]], {}),
            ],
            ["explode 전에 hashtag를 소문자·# 제거로 정규화하세요.", "같은 게시물의 중복 tag는 mentions에는 세되 postCount에는 한 번만 셉니다."],
        ),
        "retrieval": decision(
            "social-metric-denominator",
            "소셜 metric의 올바른 분모 회상하기",
            "engagement rate, click-through rate, creator share에 맞는 분모와 위험을 구분한다.",
            "choose_social_denominator(situation)를 완성해 numerator, denominator, risk를 반환하세요.",
            "choose_social_denominator",
            {
                "engagement-rate": {"numerator": "likes+comments+shares", "denominator": "impressions", "risk": "compare raw reactions"},
                "click-through-rate": {"numerator": "clicks", "denominator": "impressions", "risk": "use followers"},
                "creator-post-share": {"numerator": "creator posts", "denominator": "all posts in window", "risk": "mixed time window"},
            },
            ["비율 이름이 비슷해도 분자와 분모가 다릅니다.", "모든 비교에 같은 관측 기간을 사용하세요."],
        ),
    },
    "09": {
        "mastery": T(
            "large-log-aggregation",
            "대용량 로그를 level·service별 count와 오류율로 집계하기",
            "원본 message를 모두 materialize하지 않고 필요한 group count와 error rate를 반환한다.",
            "aggregate_logs(rows)를 완성해 services와 scannedColumns를 반환하세요.",
            "def aggregate_logs(rows):\n    raise NotImplementedError",
            """def aggregate_logs(rows):
    grouped = {}
    for row in rows:
        bucket = grouped.setdefault(row["service"], {"total": 0, "levels": {}})
        bucket["total"] += 1
        bucket["levels"][row["level"]] = bucket["levels"].get(row["level"], 0) + 1
    services = {}
    for service, bucket in sorted(grouped.items()):
        errors = bucket["levels"].get("ERROR", 0)
        services[service] = {"total": bucket["total"], "levels": {key: bucket["levels"][key] for key in sorted(bucket["levels"])}, "errorRate": round(errors / bucket["total"], 3)}
    return {"services": services, "scannedColumns": ["level", "service"]}
""",
            "aggregate_logs",
            [
                ("aggregates-needed-columns-only", [[{"service": "api", "level": "INFO", "message": "ok"}, {"service": "api", "level": "ERROR", "message": "bad"}, {"service": "worker", "level": "INFO", "message": "done"}]], {"services": {"api": {"total": 2, "levels": {"ERROR": 1, "INFO": 1}, "errorRate": 0.5}, "worker": {"total": 1, "levels": {"INFO": 1}, "errorRate": 0.0}}, "scannedColumns": ["level", "service"]}),
                ("handles-empty-log", [[]], {"services": {}, "scannedColumns": ["level", "service"]}),
            ],
            ["집계에 쓰지 않는 message 열은 scanColumns에서 제외하세요.", "error count와 total을 함께 반환해 rate를 재검산할 수 있게 하세요."],
        ),
        "transfer": T(
            "log-schema-drift",
            "새 로그 batch의 schema drift와 type 손상 탐지하기",
            "대용량 scan 전에 기대 열·추가 열·잘못된 type의 row index를 반환한다.",
            "audit_log_schema(rows, required_types)를 완성해 missingColumns, extraColumns, damagedRows를 반환하세요.",
            "def audit_log_schema(rows, required_types):\n    raise NotImplementedError",
            """def audit_log_schema(rows, required_types):
    type_map = {"str": str, "int": int}
    if any(kind not in type_map for kind in required_types.values()):
        raise ValueError("unknown type")
    observed = set().union(*(set(row) for row in rows)) if rows else set()
    missing = sorted(set(required_types) - observed)
    extra = sorted(observed - set(required_types))
    damaged = []
    for index, row in enumerate(rows):
        if any(key not in row or not isinstance(row[key], type_map[kind]) or (kind == "int" and isinstance(row[key], bool)) for key, kind in required_types.items()):
            damaged.append(index)
    return {"missingColumns": missing, "extraColumns": extra, "damagedRows": damaged}
""",
            "audit_log_schema",
            [
                ("finds-schema-and-row-damage", [[{"service": "api", "status": 200, "debug": True}, {"service": "worker", "status": "ok"}], {"service": "str", "status": "int", "requestId": "str"}], {"missingColumns": ["requestId"], "extraColumns": ["debug"], "damagedRows": [0, 1]}),
                ("reports-empty-source-gaps", [[], {"service": "str"}], {"missingColumns": ["service"], "extraColumns": [], "damagedRows": []}),
                ("rejects-unknown-type", [[], {"x": "uuid"}], E("ValueError")),
            ],
            ["전체 schema drift와 개별 row type damage를 분리하세요.", "대용량 처리를 시작하기 전에 scan schema를 먼저 확인하세요."],
        ),
        "retrieval": decision(
            "large-log-plan",
            "대용량 로그 query plan 기준 회상하기",
            "scan projection, early filter, group aggregate, global sort의 비용과 증거를 구분한다.",
            "choose_log_plan(situation)를 완성해 action, evidence, risk를 반환하세요.",
            "choose_log_plan",
            {
                "few-needed-columns": {"action": "projection pushdown", "evidence": "scan column list", "risk": "read full payload"},
                "narrow-time-window": {"action": "predicate pushdown", "evidence": "time filter in plan", "risk": "filter after collect"},
                "top-errors": {"action": "group then limited sort", "evidence": "group cardinality", "risk": "global raw-row sort"},
            },
            ["원본 row를 모두 Python으로 가져오기 전에 engine plan을 줄이세요.", "explain plan과 실제 결과 row count를 함께 확인하세요."],
        ),
    },
    "10": {
        "mastery": T(
            "columnar-report-pipeline",
            "검증·정제·집계·rank를 잇는 columnar report 만들기",
            "원시 판매 행에서 schema 오류를 분리하고 region별 total과 rank를 반환한다.",
            "run_columnar_report(rows)를 완성해 rejectedIndexes와 regions를 반환하세요.",
            "def run_columnar_report(rows):\n    raise NotImplementedError",
            """def run_columnar_report(rows):
    totals = {}
    rejected = []
    for index, row in enumerate(rows):
        amount = row.get("amount")
        region = str(row.get("region", "")).strip()
        if not region or not isinstance(amount, (int, float)) or isinstance(amount, bool) or amount < 0:
            rejected.append(index)
            continue
        totals[region] = totals.get(region, 0) + amount
    ordered = sorted(totals.items(), key=lambda item: (-item[1], item[0]))
    regions = [{"region": region, "total": total, "rank": index} for index, (region, total) in enumerate(ordered, start=1)]
    return {"rejectedIndexes": rejected, "regions": regions, "acceptedCount": len(rows) - len(rejected)}
""",
            "run_columnar_report",
            [
                ("keeps-rejection-and-rank-evidence", [[{"region": "Seoul", "amount": 10}, {"region": "Busan", "amount": 20}, {"region": "Seoul", "amount": 15}, {"region": "", "amount": 5}, {"region": "Busan", "amount": "bad"}]], {"rejectedIndexes": [3, 4], "regions": [{"region": "Seoul", "total": 25, "rank": 1}, {"region": "Busan", "total": 20, "rank": 2}], "acceptedCount": 3}),
                ("handles-empty-report", [[]], {"rejectedIndexes": [], "regions": [], "acceptedCount": 0}),
            ],
            ["정제에서 제외한 원래 index를 버리지 마세요.", "rank는 집계 total을 계산한 뒤 적용하세요."],
        ),
        "transfer": T(
            "incremental-batch-merge",
            "새 batch 집계를 기존 snapshot과 idempotent하게 병합하기",
            "columnar report를 processed batch id 원장과 category total 업데이트로 전이한다.",
            "merge_incremental_batch(snapshot, batch_id, rows)를 완성하세요.",
            "def merge_incremental_batch(snapshot, batch_id, rows):\n    raise NotImplementedError",
            """def merge_incremental_batch(snapshot, batch_id, rows):
    result = {"processed": list(snapshot.get("processed", [])), "totals": dict(snapshot.get("totals", {}))}
    if batch_id in result["processed"]:
        return {**result, "applied": False}
    for row in rows:
        result["totals"][row["category"]] = result["totals"].get(row["category"], 0) + row["amount"]
    result["processed"].append(batch_id)
    result["processed"].sort()
    result["totals"] = {key: result["totals"][key] for key in sorted(result["totals"])}
    return {**result, "applied": True}
""",
            "merge_incremental_batch",
            [
                ("applies-new-batch-once", [{"processed": ["b1"], "totals": {"book": 10}}, "b2", [{"category": "book", "amount": 5}, {"category": "pen", "amount": 2}]], {"processed": ["b1", "b2"], "totals": {"book": 15, "pen": 2}, "applied": True}),
                ("skips-replayed-batch", [{"processed": ["b1"], "totals": {"book": 10}}, "b1", [{"category": "book", "amount": 100}]], {"processed": ["b1"], "totals": {"book": 10}, "applied": False}),
            ],
            ["batch id를 total보다 먼저 확인해 replay를 막으세요.", "입력 snapshot을 직접 mutate하지 말고 새 결과를 반환하세요."],
        ),
        "retrieval": decision(
            "columnar-capstone-evidence",
            "columnar pipeline 완료 증거 회상하기",
            "source, optimized plan, result, incremental state의 검증 증거를 구분한다.",
            "choose_columnar_evidence(situation)를 완성해 evidence, check, risk를 반환하세요.",
            "choose_columnar_evidence",
            {
                "source": {"evidence": "schema hash and row count", "check": "required columns", "risk": "silent drift"},
                "optimized-plan": {"evidence": "explain output", "check": "pushdown and collect boundary", "risk": "eager full scan"},
                "incremental-state": {"evidence": "processed batch ids", "check": "replay returns applied false", "risk": "double count"},
            },
            ["결과 숫자뿐 아니라 source schema와 실행 plan을 보존하세요.", "incremental pipeline은 같은 batch 재실행 결과까지 검증해야 합니다."],
        ),
    },
}
