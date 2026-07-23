from __future__ import annotations

from .visualization_common import VisualLessonSpec, buildVisualBlueprints


SPECS: dict[str, VisualLessonSpec] = {
    "00": {
        "slug": "altair-grammar-contract", "title": "Altair 선언형 grammar", "question": "데이터 field type과 encoding channel이 명시적인가",
        "mark": "point", "x": "featureX", "y": "featureY", "group": "category", "transforms": ["type-declarations"], "interaction": "none", "required": ["featureX", "featureY", "category"],
        "rows": [{"featureX": 1, "featureY": 3, "category": "A"}, {"featureX": 2, "featureY": 5, "category": "A"}, {"featureX": 1, "featureY": 4, "category": "B"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"A": 2, "B": 1}, "xExtent": [1, 2], "yExtent": [3, 5]},
        "transferContext": "새 실험 데이터의 quantitative 축과 nominal group을 선언형 spec으로 표현한다",
        "retrieval": {"numeric-measure": {"encoding": "quantitative", "evidence": "numeric domain", "risk": "ordinal inference"}, "unordered-label": {"encoding": "nominal", "evidence": "category list", "risk": "alphabetic magnitude"}, "ordered-level": {"encoding": "ordinal", "evidence": "explicit order", "risk": "nominal default"}},
    },
    "01": {
        "slug": "car-efficiency-encoding", "title": "자동차 연비 탐색", "question": "마력·연비 관계에서 origin과 model year 역할이 분리되는가",
        "mark": "point", "x": "horsepower", "y": "mpg", "group": "origin", "transforms": ["filter-valid", "type-declarations"], "interaction": "hover", "required": ["horsepower", "mpg", "origin"],
        "rows": [{"horsepower": 80, "mpg": 35, "origin": "EU"}, {"horsepower": 120, "mpg": 25, "origin": "US"}, {"horsepower": None, "mpg": 30, "origin": "JP"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"EU": 1, "US": 1}, "xExtent": [80, 120], "yExtent": [25, 35]},
        "transferContext": "장비 출력과 효율 관계를 제조 지역 색과 hover 모델 정보로 탐색한다",
        "retrieval": {"numeric-relation": {"encoding": "point QxQ", "evidence": "valid rows and domains", "risk": "null coercion"}, "origin-group": {"encoding": "color nominal", "evidence": "group n", "risk": "too many colors"}, "model-year": {"encoding": "facet or temporal filter", "evidence": "year range", "risk": "ordinal treated continuous"}},
    },
    "02": {
        "slug": "iris-type-separation", "title": "붓꽃 품종 구분", "question": "품종 nominal encoding과 수치 scale이 schema에 맞는가",
        "mark": "point", "x": "sepalLength", "y": "petalWidth", "group": "species", "transforms": ["type-declarations"], "interaction": "legend-filter", "required": ["sepalLength", "petalWidth", "species"],
        "rows": [{"sepalLength": 5.0, "petalWidth": 0.2, "species": "setosa"}, {"sepalLength": 6.0, "petalWidth": 1.5, "species": "versicolor"}, {"sepalLength": 6.5, "petalWidth": 2.0, "species": "virginica"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"setosa": 1, "versicolor": 1, "virginica": 1}, "xExtent": [5.0, 6.5], "yExtent": [0.2, 2.0]},
        "transferContext": "세 제품 유형을 두 품질 지표와 legend filter로 비교한다",
        "retrieval": {"species-field": {"encoding": "nominal color", "evidence": "domain values", "risk": "implicit type"}, "measurement-field": {"encoding": "quantitative axis", "evidence": "units", "risk": "zero baseline assumption"}, "legend-selection": {"encoding": "parameter filter", "evidence": "visible active values", "risk": "hidden exclusion"}},
    },
    "03": {
        "slug": "tip-aggregate-grain", "title": "팁 데이터 분석", "question": "aggregate가 day·meal grain과 같은 분모를 쓰는가",
        "mark": "bar", "x": "day", "y": "meanTipRate", "group": "meal", "transforms": ["calculate-rate", "mean", "count-evidence"], "interaction": "hover", "required": ["day", "meanTipRate", "meal"],
        "rows": [{"day": "Fri", "meanTipRate": 0.15, "meal": "dinner"}, {"day": "Sat", "meanTipRate": 0.2, "meal": "dinner"}, {"day": "Fri", "meanTipRate": 0.1, "meal": "lunch"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"dinner": 2, "lunch": 1}, "xExtent": ["Fri", "Sat"], "yExtent": [0.1, 0.2]},
        "transferContext": "요일·채널별 평균 주문 전환율을 유효 분모 hover와 함께 비교한다",
        "retrieval": {"row-derived-rate": {"encoding": "calculate then aggregate", "evidence": "formula and n", "risk": "ratio of sums mismatch"}, "group-mean": {"encoding": "aggregate mean", "evidence": "group grain", "risk": "implicit aggregation"}, "sample-size": {"encoding": "tooltip count", "evidence": "valid n", "risk": "mean without support"}},
    },
    "04": {
        "slug": "penguin-facet", "title": "펭귄 서식지", "question": "species와 island를 color 하나에 과적재하지 않는가",
        "mark": "point", "x": "billLength", "y": "bodyMass", "group": "species", "transforms": ["facet-island"], "interaction": "none", "required": ["billLength", "bodyMass", "species"],
        "rows": [{"billLength": 40, "bodyMass": 3200, "species": "A"}, {"billLength": 45, "bodyMass": 4000, "species": "B"}, {"billLength": None, "bodyMass": 4100, "species": "B"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"A": 1, "B": 1}, "xExtent": [40, 45], "yExtent": [3200, 4000]},
        "transferContext": "장비 유형은 color, 운영 지역은 facet으로 분리해 두 측정값을 비교한다",
        "retrieval": {"two-categories": {"encoding": "color plus facet", "evidence": "group counts", "risk": "combinatorial legend"}, "shared-comparison": {"encoding": "fixed facet scales", "evidence": "common domains", "risk": "free scales"}, "tiny-facet": {"encoding": "points plus n", "evidence": "facet sample size", "risk": "empty pattern"}},
    },
    "05": {
        "slug": "titanic-aggregate", "title": "타이타닉 생존", "question": "binary mean이 생존율이며 NULL 분모를 제외한다고 명시했는가",
        "mark": "bar", "x": "pclass", "y": "survivalRate", "group": "sex", "transforms": ["mean-binary", "valid-count"], "interaction": "hover", "required": ["pclass", "survivalRate", "sex"],
        "rows": [{"pclass": 1, "survivalRate": 0.9, "sex": "F"}, {"pclass": 1, "survivalRate": 0.4, "sex": "M"}, {"pclass": 3, "survivalRate": None, "sex": "M"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"F": 1, "M": 1}, "xExtent": [1, 1], "yExtent": [0.4, 0.9]},
        "transferContext": "요금제·채널별 전환율을 known outcome count와 함께 집계한다",
        "retrieval": {"binary-mean": {"encoding": "mean with percent format", "evidence": "known n", "risk": "NULL as zero"}, "uncertainty": {"encoding": "interval layer", "evidence": "interval method", "risk": "tiny group certainty"}, "raw-count": {"encoding": "count bar", "evidence": "all rows", "risk": "count called rate"}},
    },
    "06": {
        "slug": "flight-delay-transform", "title": "항공편 분석", "question": "시간 단위와 delay 집계가 transform 단계에서 고정되는가",
        "mark": "line", "x": "month", "y": "meanDelay", "group": "carrier", "transforms": ["timeunit-month", "mean", "sort-time"], "interaction": "hover", "required": ["month", "meanDelay", "carrier"],
        "rows": [{"month": 1, "meanDelay": 5, "carrier": "A"}, {"month": 2, "meanDelay": 8, "carrier": "A"}, {"month": 1, "meanDelay": 3, "carrier": "B"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"A": 2, "B": 1}, "xExtent": [1, 2], "yExtent": [3, 8]},
        "transferContext": "서비스별 월간 평균 latency를 timeUnit과 동일 분모로 비교한다",
        "retrieval": {"monthly-seasonality": {"encoding": "month timeUnit", "evidence": "years included", "risk": "years collapsed"}, "chronological-trend": {"encoding": "yearmonth temporal", "evidence": "full date", "risk": "month-only sort"}, "carrier-comparison": {"encoding": "line or facet", "evidence": "carrier n", "risk": "too many lines"}},
    },
    "07": {
        "slug": "interactive-filter", "title": "interactive filter", "question": "selection parameter와 filter 대상이 눈에 보이는가",
        "mark": "point", "x": "metricX", "y": "metricY", "group": "category", "transforms": ["selection-param", "filter-param"], "interaction": "brush", "required": ["metricX", "metricY", "category"],
        "rows": [{"metricX": 1, "metricY": 8, "category": "A"}, {"metricX": 2, "metricY": 4, "category": "B"}, {"metricX": 3, "metricY": 6, "category": "A"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"A": 2, "B": 1}, "xExtent": [1, 3], "yExtent": [4, 8]},
        "transferContext": "산점도 brush가 아래 상세 table을 filter하고 선택 수를 표시한다",
        "retrieval": {"continuous-region": {"encoding": "interval selection", "evidence": "selected bounds and count", "risk": "invisible state"}, "category-toggle": {"encoding": "legend point selection", "evidence": "active categories", "risk": "empty selection semantics"}, "reset": {"encoding": "explicit clear behavior", "evidence": "all rows restored", "risk": "stuck filter"}},
    },
    "08": {
        "slug": "linked-multiview", "title": "다중 view 연결", "question": "선택이 서로 다른 grain의 view에 올바르게 전파되는가",
        "mark": "linked-views", "x": "period", "y": "metric", "group": "view", "transforms": ["shared-selection", "grain-contract"], "interaction": "linked-filter", "required": ["period", "metric", "view"],
        "rows": [{"period": 1, "metric": 10, "view": "overview"}, {"period": 2, "metric": 15, "view": "overview"}, {"period": 1, "metric": 3, "view": "detail"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"detail": 1, "overview": 2}, "xExtent": [1, 2], "yExtent": [3, 15]},
        "transferContext": "overview 기간 brush가 category summary와 row detail에 같은 scope로 전달된다",
        "retrieval": {"overview-to-detail": {"encoding": "brush filter", "evidence": "scope count per view", "risk": "grain mismatch"}, "highlight-only": {"encoding": "conditional opacity", "evidence": "unselected context remains", "risk": "filter confusion"}, "independent-views": {"encoding": "separate parameters", "evidence": "named controls", "risk": "parameter collision"}},
    },
    "09": {
        "slug": "advanced-transform-order", "title": "고급 data transform", "question": "calculate·filter·aggregate·window 순서가 결과 grain을 지키는가",
        "mark": "ranked-bar", "x": "entity", "y": "metric", "group": "segment", "transforms": ["calculate", "filter", "aggregate", "window-rank"], "interaction": "none", "required": ["entity", "metric", "segment"],
        "rows": [{"entity": "A", "metric": 10, "segment": "X"}, {"entity": "B", "metric": 20, "segment": "X"}, {"entity": "C", "metric": 15, "segment": "Y"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"X": 2, "Y": 1}, "xExtent": ["A", "C"], "yExtent": [10, 20]},
        "transferContext": "계산된 단위 가격을 filter한 뒤 지역 집계와 순위를 만드는 선언형 pipeline을 구성한다",
        "retrieval": {"derived-row-field": {"encoding": "calculate before aggregate", "evidence": "formula", "risk": "aggregate inputs lost"}, "top-groups": {"encoding": "aggregate then window rank", "evidence": "group grain", "risk": "rank raw rows"}, "post-rank-filter": {"encoding": "filter rank", "evidence": "rank domain", "risk": "filter before window"}},
    },
    "10": {
        "slug": "altair-dashboard", "title": "Altair 종합 dashboard", "question": "선언형 spec의 데이터·parameter·view 계약이 재현 가능한가",
        "mark": "dashboard", "x": "period", "y": "metric", "group": "panel", "transforms": ["quality-gate", "shared-param", "resolve-scale"], "interaction": "linked-filter", "required": ["period", "metric", "panel"],
        "rows": [{"period": 1, "metric": 10, "panel": "trend"}, {"period": 2, "metric": 12, "panel": "trend"}, {"period": 1, "metric": 4, "panel": "detail"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"detail": 1, "trend": 2}, "xExtent": [1, 2], "yExtent": [4, 12]},
        "transferContext": "분기 분석 dashboard를 shared parameter, scale resolve, description이 있는 spec으로 배포한다",
        "retrieval": {"reproducible-spec": {"encoding": "serialized declarative chart", "evidence": "schema validation", "risk": "implicit defaults"}, "linked-views": {"encoding": "named parameter", "evidence": "scope tests", "risk": "hidden state"}, "release-artifact": {"encoding": "HTML plus static fallback", "evidence": "render regression", "risk": "runtime-only view"}},
    },
}


BLUEPRINTS = buildVisualBlueprints(SPECS)
