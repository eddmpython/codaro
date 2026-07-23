from __future__ import annotations

from .visualization_common import VisualLessonSpec, buildVisualBlueprints


SPECS: dict[str, VisualLessonSpec] = {
    "00": {
        "slug": "plotly-interaction-contract", "title": "Plotly interactive chart", "question": "interaction이 질문에 필요한 세부 정보만 제공하는가",
        "mark": "interactive-scatter", "x": "x", "y": "y", "group": "series", "transforms": ["hover-fields"], "interaction": "hover", "required": ["x", "y", "series"],
        "rows": [{"x": 1, "y": 3, "series": "A"}, {"x": 2, "y": 5, "series": "A"}, {"x": 1, "y": 4, "series": "B"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"A": 2, "B": 1}, "xExtent": [1, 2], "yExtent": [3, 5]},
        "transferContext": "두 실험 series의 값을 hover 세부 정보와 함께 비교한다",
        "retrieval": {"inspect-one-point": {"encoding": "hover", "evidence": "keyboard-accessible equivalent", "risk": "hover-only meaning"}, "select-subset": {"encoding": "brush selection", "evidence": "visible selected count", "risk": "hidden scope"}, "static-report": {"encoding": "annotated export", "evidence": "all essential labels visible", "risk": "interaction lost"}},
    },
    "01": {
        "slug": "life-expectancy-comparison", "title": "세계 기대수명 비교", "question": "국가별 비교가 같은 연도와 population context를 쓰는가",
        "mark": "interactive-dot", "x": "lifeExpectancy", "y": "country", "group": "continent", "transforms": ["filter-year", "sort-x"], "interaction": "hover", "required": ["lifeExpectancy", "country", "continent"],
        "rows": [{"lifeExpectancy": 82, "country": "A", "continent": "Asia"}, {"lifeExpectancy": 76, "country": "B", "continent": "Europe"}, {"lifeExpectancy": None, "country": "C", "continent": "Africa"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"Asia": 1, "Europe": 1}, "xExtent": [76, 82], "yExtent": ["A", "B"]},
        "transferContext": "같은 분기의 국가별 서비스 가용성을 지역 색과 hover 표본 수로 비교한다",
        "retrieval": {"one-year-ranking": {"encoding": "sorted dots", "evidence": "fixed year", "risk": "mixed periods"}, "country-trend": {"encoding": "line", "evidence": "complete year domain", "risk": "survivorship"}, "population-context": {"encoding": "size or hover", "evidence": "population field", "risk": "area misread"}},
    },
    "02": {
        "slug": "tip-interactive-distribution", "title": "팁 분포", "question": "hover와 facet이 분포의 bin·분모를 가리지 않는가",
        "mark": "histogram", "x": "tipRate", "y": "count", "group": "day", "transforms": ["shared-bins", "count"], "interaction": "hover", "required": ["tipRate", "count", "day"],
        "rows": [{"tipRate": 0.1, "count": 5, "day": "Fri"}, {"tipRate": 0.2, "count": 3, "day": "Sat"}, {"tipRate": 0.3, "count": 1, "day": "Sat"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"Fri": 1, "Sat": 2}, "xExtent": [0.1, 0.3], "yExtent": [1, 5]},
        "transferContext": "채널별 주문 금액 분포를 공통 bin과 hover count로 비교한다",
        "retrieval": {"compare-distributions": {"encoding": "facet histogram", "evidence": "shared bins and n", "risk": "independent axes"}, "inspect-bin": {"encoding": "hover count and range", "evidence": "bin boundaries", "risk": "hover-only denominator"}, "show-outliers": {"encoding": "box plus points", "evidence": "outlier rule", "risk": "trimmed tails"}},
    },
    "03": {
        "slug": "iris-3d-restraint", "title": "붓꽃 품종 분류", "question": "차원 추가가 실제 분리를 돕고 2D 대안을 제공하는가",
        "mark": "scatter", "x": "petalLength", "y": "petalWidth", "group": "species", "transforms": ["hue", "symbol"], "interaction": "hover", "required": ["petalLength", "petalWidth", "species"],
        "rows": [{"petalLength": 1.3, "petalWidth": 0.2, "species": "setosa"}, {"petalLength": 4.7, "petalWidth": 1.5, "species": "versicolor"}, {"petalLength": 5.5, "petalWidth": 2.1, "species": "virginica"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"setosa": 1, "versicolor": 1, "virginica": 1}, "xExtent": [1.3, 5.5], "yExtent": [0.2, 2.1]},
        "transferContext": "세 장비 유형의 두 핵심 feature를 symbol과 color로 중복 구분한다",
        "retrieval": {"two-informative-features": {"encoding": "2D scatter", "evidence": "separation and n", "risk": "unneeded 3D"}, "third-feature": {"encoding": "facet or size", "evidence": "2D alternative", "risk": "occlusion"}, "classification-quality": {"encoding": "confusion matrix", "evidence": "held-out labels", "risk": "visual clusters as accuracy"}},
    },
    "04": {
        "slug": "gdp-life-bubble", "title": "GDP와 기대수명", "question": "log GDP, population size, year가 명시적으로 인코딩되는가",
        "mark": "bubble", "x": "gdpPerCapita", "y": "lifeExpectancy", "group": "continent", "transforms": ["log-x", "size-population"], "interaction": "hover", "required": ["gdpPerCapita", "lifeExpectancy", "continent"],
        "rows": [{"gdpPerCapita": 1000, "lifeExpectancy": 60, "continent": "A"}, {"gdpPerCapita": 10000, "lifeExpectancy": 75, "continent": "B"}, {"gdpPerCapita": 30000, "lifeExpectancy": 82, "continent": "B"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"A": 1, "B": 2}, "xExtent": [1000, 30000], "yExtent": [60, 82]},
        "transferContext": "고객 수를 bubble area로, 매출과 유지율 관계를 log 매출 축으로 탐색한다",
        "retrieval": {"wide-positive-x": {"encoding": "log x", "evidence": "positive domain and ticks", "risk": "hidden transform"}, "population-size": {"encoding": "bubble area", "evidence": "size legend", "risk": "radius encoding"}, "causal-development": {"encoding": "not established", "evidence": "longitudinal design", "risk": "cross-sectional causation"}},
    },
    "05": {
        "slug": "world-population-map", "title": "세계 인구 지도", "question": "위치 code와 color 분모가 지도 geometry에 정확히 결합되는가",
        "mark": "choropleth", "x": "locationCode", "y": "population", "group": "continent", "transforms": ["validate-location", "log-color"], "interaction": "hover", "required": ["locationCode", "population", "continent"],
        "rows": [{"locationCode": "KOR", "population": 52, "continent": "Asia"}, {"locationCode": "FRA", "population": 68, "continent": "Europe"}, {"locationCode": None, "population": 10, "continent": "Other"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"Asia": 1, "Europe": 1}, "xExtent": ["FRA", "KOR"], "yExtent": [52, 68]},
        "transferContext": "국가별 고객 수를 ISO code 검증과 log color scale이 있는 지도에 표시한다",
        "retrieval": {"country-total": {"encoding": "choropleth", "evidence": "join coverage", "risk": "area dominance"}, "city-points": {"encoding": "symbol map", "evidence": "lat lon validity", "risk": "overlap"}, "rate-comparison": {"encoding": "normalized color", "evidence": "denominator", "risk": "raw count map"}},
    },
    "06": {
        "slug": "world-change-animation", "title": "시간에 따른 세계 변화", "question": "animation frame마다 국가 집합과 scale이 안정적인가",
        "mark": "animated-bubble", "x": "year", "y": "metric", "group": "country", "transforms": ["complete-frames", "fixed-scale"], "interaction": "animation", "required": ["year", "metric", "country"],
        "rows": [{"year": 2000, "metric": 10, "country": "A"}, {"year": 2010, "metric": 15, "country": "A"}, {"year": 2000, "metric": 20, "country": "B"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"A": 2, "B": 1}, "xExtent": [2000, 2010], "yExtent": [10, 20]},
        "transferContext": "지역별 KPI 변화를 고정 scale과 결측 frame 표시가 있는 animation으로 탐색한다",
        "retrieval": {"change-over-frames": {"encoding": "animation plus static trail", "evidence": "frame completeness", "risk": "change blindness"}, "compare-endpoints": {"encoding": "slope chart", "evidence": "same entities", "risk": "missing middle"}, "precise-trend": {"encoding": "small-multiple lines", "evidence": "full series", "risk": "animation memory"}},
    },
    "07": {
        "slug": "restaurant-revenue-dashboard", "title": "레스토랑 매출", "question": "filter 상태가 모든 매출 panel에 같은 범위로 적용되는가",
        "mark": "dashboard", "x": "period", "y": "revenue", "group": "meal", "transforms": ["shared-filter", "aggregate"], "interaction": "dropdown", "required": ["period", "revenue", "meal"],
        "rows": [{"period": 1, "revenue": 100, "meal": "lunch"}, {"period": 1, "revenue": 200, "meal": "dinner"}, {"period": 2, "revenue": 150, "meal": "lunch"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"dinner": 1, "lunch": 2}, "xExtent": [1, 2], "yExtent": [100, 200]},
        "transferContext": "채널 filter가 매출 trend, 구성, KPI에 동일하게 적용되는 dashboard를 만든다",
        "retrieval": {"shared-scope": {"encoding": "linked dashboard", "evidence": "visible filter state", "risk": "panel scope mismatch"}, "revenue-composition": {"encoding": "stacked bar", "evidence": "total and parts", "risk": "hidden totals"}, "exact-orders": {"encoding": "detail table on demand", "evidence": "row count", "risk": "dashboard overload"}},
    },
    "08": {
        "slug": "continent-hierarchy", "title": "대륙별 계층", "question": "parent 합계와 child 합계가 일치하고 면적 해석이 가능한가",
        "mark": "treemap", "x": "node", "y": "value", "group": "parent", "transforms": ["hierarchy-sum", "validate-parent"], "interaction": "hover", "required": ["node", "value", "parent"],
        "rows": [{"node": "KOR", "value": 52, "parent": "Asia"}, {"node": "JPN", "value": 125, "parent": "Asia"}, {"node": "FRA", "value": 68, "parent": "Europe"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"Asia": 2, "Europe": 1}, "xExtent": ["FRA", "KOR"], "yExtent": [52, 125]},
        "transferContext": "부서와 팀의 예산 계층을 parent 검증과 hover exact value가 있는 treemap으로 본다",
        "retrieval": {"hierarchical-part-whole": {"encoding": "treemap", "evidence": "parent-child reconciliation", "risk": "area comparison"}, "precise-ranking": {"encoding": "sorted bar", "evidence": "exact values", "risk": "treemap rank"}, "deep-hierarchy": {"encoding": "sunburst or drilldown", "evidence": "path labels", "risk": "tiny leaves"}},
    },
    "09": {
        "slug": "stock-range-state", "title": "주식 시계열", "question": "range slider가 선택 구간과 전체 문맥을 동시에 보여주는가",
        "mark": "candlestick-line", "x": "date", "y": "close", "group": "ticker", "transforms": ["sort-date", "trading-gaps"], "interaction": "range-slider", "required": ["date", "close", "ticker"],
        "rows": [{"date": "01", "close": 100, "ticker": "A"}, {"date": "02", "close": 105, "ticker": "A"}, {"date": "01", "close": 80, "ticker": "B"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"A": 2, "B": 1}, "xExtent": ["01", "02"], "yExtent": [80, 105]},
        "transferContext": "서비스 latency 추세를 전체 context와 선택 range가 보이는 slider로 탐색한다",
        "retrieval": {"zoom-time-range": {"encoding": "range slider", "evidence": "selected dates visible", "risk": "hidden scope"}, "ohlc-data": {"encoding": "candlestick", "evidence": "open high low close contract", "risk": "missing sessions"}, "compare-returns": {"encoding": "normalized lines", "evidence": "base date", "risk": "raw price"}},
    },
    "10": {
        "slug": "plotly-dashboard-release", "title": "Plotly 종합 dashboard", "question": "interaction 없이도 핵심 결론과 현재 scope를 읽을 수 있는가",
        "mark": "linked-dashboard", "x": "period", "y": "metric", "group": "panel", "transforms": ["shared-filter", "quality-gate", "export-state"], "interaction": "linked-filter", "required": ["period", "metric", "panel"],
        "rows": [{"period": 1, "metric": 10, "panel": "trend"}, {"period": 2, "metric": 15, "panel": "trend"}, {"period": 1, "metric": 4, "panel": "breakdown"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"breakdown": 1, "trend": 2}, "xExtent": [1, 2], "yExtent": [4, 15]},
        "transferContext": "운영 dashboard의 filter state와 핵심 설명이 정적 export에도 남도록 구성한다",
        "retrieval": {"interactive-release": {"encoding": "linked views", "evidence": "state contract", "risk": "hidden filters"}, "static-export": {"encoding": "visible annotations", "evidence": "export regression", "risk": "lost hover"}, "performance-budget": {"encoding": "aggregated layers", "evidence": "point count and render time", "risk": "browser freeze"}},
    },
}


BLUEPRINTS = buildVisualBlueprints(SPECS)
