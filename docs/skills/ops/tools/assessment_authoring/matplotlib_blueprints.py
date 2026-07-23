from __future__ import annotations

from .visualization_common import VisualLessonSpec, buildVisualBlueprints


SPECS: dict[str, VisualLessonSpec] = {
    "00": {
        "slug": "matplotlib-chart-contract", "title": "Matplotlib 기본 차트", "question": "데이터 질문과 축 계약이 일치하는가",
        "mark": "line", "x": "step", "y": "value", "group": "series", "transforms": ["sort-x"], "interaction": "none", "required": ["step", "value", "series"],
        "rows": [{"step": 1, "value": 2, "series": "A"}, {"step": 2, "value": 4, "series": "A"}, {"step": 1, "value": None, "series": "B"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"A": 2}, "xExtent": [1, 2], "yExtent": [2, 4]},
        "transferContext": "두 실험 series의 단계별 값 변화를 비교한다",
        "retrieval": {"ordered-change": {"encoding": "line", "evidence": "sorted x and visible gaps", "risk": "connecting missing values"}, "category-comparison": {"encoding": "bar", "evidence": "common zero baseline", "risk": "using line for unordered labels"}, "single-value": {"encoding": "text plus context", "evidence": "denominator", "risk": "decorative chart"}},
    },
    "01": {
        "slug": "stock-trend", "title": "주가 추세", "question": "시간 순서와 결측 거래일을 보존했는가",
        "mark": "line", "x": "date", "y": "close", "group": "ticker", "transforms": ["sort-date"], "interaction": "none", "required": ["date", "close", "ticker"],
        "rows": [{"date": "2026-01-01", "close": 100, "ticker": "A"}, {"date": "2026-01-02", "close": 105, "ticker": "A"}, {"date": "2026-01-02", "close": 80, "ticker": "B"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"A": 2, "B": 1}, "xExtent": ["2026-01-01", "2026-01-02"], "yExtent": [80, 105]},
        "transferContext": "두 펀드의 날짜별 종가 추세를 비교한다",
        "retrieval": {"price-over-time": {"encoding": "line by ticker", "evidence": "date domain and gaps", "risk": "unsorted date"}, "return-comparison": {"encoding": "normalized line", "evidence": "shared base date", "risk": "raw price scale"}, "single-day-ranking": {"encoding": "sorted dot", "evidence": "same date", "risk": "implied continuity"}},
    },
    "02": {
        "slug": "tip-distribution", "title": "팁 분포", "question": "분포의 bin과 표본 수를 숨기지 않았는가",
        "mark": "histogram", "x": "tip", "y": "count", "group": "day", "transforms": ["bin-x", "count"], "interaction": "none", "required": ["tip", "count", "day"],
        "rows": [{"tip": 1, "count": 2, "day": "Fri"}, {"tip": 3, "count": 1, "day": "Fri"}, {"tip": 5, "count": 4, "day": "Sat"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"Fri": 2, "Sat": 1}, "xExtent": [1, 5], "yExtent": [1, 4]},
        "transferContext": "배송 시간 분포를 요일별 histogram으로 비교한다",
        "retrieval": {"one-number-distribution": {"encoding": "histogram", "evidence": "bin edges and n", "risk": "arbitrary bins"}, "group-spread": {"encoding": "boxplot", "evidence": "quartiles and outliers", "risk": "hidden sample size"}, "two-numeric-relation": {"encoding": "scatter", "evidence": "point count", "risk": "overplotting"}},
    },
    "03": {
        "slug": "iris-scatter", "title": "붓꽃 산점도", "question": "두 수치 변수 관계와 품종 그룹을 분리했는가",
        "mark": "scatter", "x": "petalLength", "y": "petalWidth", "group": "species", "transforms": [], "interaction": "none", "required": ["petalLength", "petalWidth", "species"],
        "rows": [{"petalLength": 1.4, "petalWidth": 0.2, "species": "setosa"}, {"petalLength": 4.5, "petalWidth": 1.5, "species": "versicolor"}, {"petalLength": None, "petalWidth": 2.0, "species": "virginica"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"setosa": 1, "versicolor": 1}, "xExtent": [1.4, 4.5], "yExtent": [0.2, 1.5]},
        "transferContext": "두 센서 측정값 관계를 장비 유형별 scatter로 비교한다",
        "retrieval": {"two-numeric-features": {"encoding": "scatter", "evidence": "axis ranges and n", "risk": "overplotting"}, "species-separation": {"encoding": "color plus marker", "evidence": "group counts", "risk": "color-only encoding"}, "causal-claim": {"encoding": "none sufficient", "evidence": "study design", "risk": "correlation as causation"}},
    },
    "04": {
        "slug": "continent-population", "title": "대륙별 인구", "question": "범주별 합계와 0 기준선을 정확히 비교하는가",
        "mark": "bar", "x": "continent", "y": "population", "group": None, "transforms": ["sum-y", "sort-y-desc"], "interaction": "none", "required": ["continent", "population"],
        "rows": [{"continent": "Asia", "population": 60}, {"continent": "Asia", "population": 40}, {"continent": "Europe", "population": 30}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"all": 3}, "xExtent": ["Asia", "Europe"], "yExtent": [30, 60]},
        "transferContext": "부서별 총 예산을 0 기준 bar로 비교한다",
        "retrieval": {"category-total": {"encoding": "bar", "evidence": "aggregation and zero baseline", "risk": "truncated axis"}, "part-of-whole": {"encoding": "100 percent stacked bar", "evidence": "same denominator", "risk": "different totals"}, "many-categories": {"encoding": "sorted horizontal bar", "evidence": "label legibility", "risk": "alphabetical clutter"}},
    },
    "05": {
        "slug": "penguin-weight", "title": "펭귄 체중", "question": "종별 체중 분포와 표본 불균형을 함께 드러내는가",
        "mark": "boxplot", "x": "species", "y": "bodyMass", "group": "island", "transforms": ["quartiles"], "interaction": "none", "required": ["species", "bodyMass", "island"],
        "rows": [{"species": "A", "bodyMass": 3000, "island": "X"}, {"species": "A", "bodyMass": 3200, "island": "X"}, {"species": "B", "bodyMass": 4500, "island": "Y"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"X": 2, "Y": 1}, "xExtent": ["A", "B"], "yExtent": [3000, 4500]},
        "transferContext": "기종별 응답 시간 분포를 리전 그룹과 함께 비교한다",
        "retrieval": {"compare-group-spread": {"encoding": "boxplot plus points", "evidence": "quartiles and n", "risk": "tiny groups"}, "compare-group-mean": {"encoding": "point with interval", "evidence": "uncertainty", "risk": "bar hides spread"}, "identify-outlier": {"encoding": "boxplot", "evidence": "defined whisker rule", "risk": "outlier equals error"}},
    },
    "06": {
        "slug": "correlation-heatmap", "title": "상관관계 heatmap", "question": "상관 행렬의 대칭성과 scale 범위를 지키는가",
        "mark": "heatmap", "x": "featureX", "y": "featureY", "group": "cohort", "transforms": ["correlation", "mask-diagonal"], "interaction": "none", "required": ["featureX", "featureY", "cohort"],
        "rows": [{"featureX": "age", "featureY": "fare", "cohort": "train"}, {"featureX": "fare", "featureY": "age", "cohort": "train"}, {"featureX": "age", "featureY": "score", "cohort": "test"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"test": 1, "train": 2}, "xExtent": ["age", "fare"], "yExtent": ["age", "score"]},
        "transferContext": "센서 간 상관을 cohort별 diverging heatmap으로 점검한다",
        "retrieval": {"signed-correlation": {"encoding": "diverging heatmap", "evidence": "fixed -1 to 1 scale", "risk": "independent scales"}, "many-feature-pairs": {"encoding": "clustered heatmap", "evidence": "ordering method", "risk": "pattern fishing"}, "causal-effect": {"encoding": "not established", "evidence": "causal design", "risk": "correlation claim"}},
    },
    "07": {
        "slug": "dual-axis-time", "title": "다중축 시계열", "question": "서로 다른 단위가 같은 추세처럼 보이지 않게 했는가",
        "mark": "line", "x": "date", "y": "normalizedValue", "group": "metric", "transforms": ["normalize-base", "sort-date"], "interaction": "none", "required": ["date", "normalizedValue", "metric"],
        "rows": [{"date": "01", "normalizedValue": 100, "metric": "sales"}, {"date": "02", "normalizedValue": 110, "metric": "sales"}, {"date": "01", "normalizedValue": 100, "metric": "temperature"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"sales": 2, "temperature": 1}, "xExtent": ["01", "02"], "yExtent": [100, 110]},
        "transferContext": "트래픽과 오류율을 공통 기준일 index로 정규화해 비교한다",
        "retrieval": {"different-units": {"encoding": "small multiples or normalized lines", "evidence": "unit labels", "risk": "dual-axis correlation illusion"}, "same-unit-series": {"encoding": "shared-axis lines", "evidence": "common domain", "risk": "too many series"}, "rate-and-count": {"encoding": "separate panels", "evidence": "linked time axis", "risk": "scale manipulation"}},
    },
    "08": {
        "slug": "multipanel-dashboard", "title": "다중 패널 dashboard", "question": "패널마다 다른 grain을 공통 필터와 연결했는가",
        "mark": "small-multiples", "x": "period", "y": "metricValue", "group": "panel", "transforms": ["shared-filter", "shared-x"], "interaction": "linked-filter", "required": ["period", "metricValue", "panel"],
        "rows": [{"period": 1, "metricValue": 10, "panel": "sales"}, {"period": 1, "metricValue": 2, "panel": "returns"}, {"period": 2, "metricValue": 12, "panel": "sales"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"returns": 1, "sales": 2}, "xExtent": [1, 2], "yExtent": [2, 12]},
        "transferContext": "운영 dashboard의 트래픽·지연·오류 패널을 동일 기간 필터로 연결한다",
        "retrieval": {"different-metrics": {"encoding": "aligned small multiples", "evidence": "shared time domain", "risk": "misaligned periods"}, "same-metric-groups": {"encoding": "facets", "evidence": "shared scale", "risk": "free-scale comparison"}, "dashboard-filter": {"encoding": "linked filter", "evidence": "visible active scope", "risk": "hidden filter state"}},
    },
    "09": {
        "slug": "annotation-evidence", "title": "고급 주석 차트", "question": "주석이 데이터 근거와 정확히 연결되는가",
        "mark": "annotated-line", "x": "date", "y": "value", "group": "eventType", "transforms": ["sort-date", "join-events"], "interaction": "none", "required": ["date", "value", "eventType"],
        "rows": [{"date": "01", "value": 10, "eventType": "none"}, {"date": "02", "value": 18, "eventType": "release"}, {"date": "03", "value": None, "eventType": "incident"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"none": 1, "release": 1}, "xExtent": ["01", "02"], "yExtent": [10, 18]},
        "transferContext": "배포와 장애 이벤트를 서비스 지표 선 위에 근거 ID와 함께 주석 처리한다",
        "retrieval": {"known-event": {"encoding": "anchored annotation", "evidence": "event id and timestamp", "risk": "implied causation"}, "threshold-crossing": {"encoding": "rule plus label", "evidence": "threshold definition", "risk": "cherry-picked cutoff"}, "many-events": {"encoding": "interactive detail or separate table", "evidence": "event count", "risk": "label collision"}},
    },
    "10": {
        "slug": "analysis-report", "title": "종합 분석 report", "question": "질문·분모·차트·결론이 같은 증거 사슬을 이루는가",
        "mark": "report-panels", "x": "segment", "y": "metric", "group": "evidenceType", "transforms": ["quality-gate", "aggregate", "annotate"], "interaction": "none", "required": ["segment", "metric", "evidenceType"],
        "rows": [{"segment": "A", "metric": 10, "evidenceType": "observed"}, {"segment": "B", "metric": 15, "evidenceType": "observed"}, {"segment": "C", "metric": None, "evidenceType": "missing"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"observed": 2}, "xExtent": ["A", "B"], "yExtent": [10, 15]},
        "transferContext": "분기 성과 report에 데이터 품질, 비교 차트, 한계 문장을 함께 배치한다",
        "retrieval": {"executive-comparison": {"encoding": "ranked bars plus context", "evidence": "metric contract", "risk": "missing denominator"}, "trend-explanation": {"encoding": "line plus sourced annotations", "evidence": "time range and events", "risk": "causal overclaim"}, "release-report": {"encoding": "reproducible panels", "evidence": "input hash and exclusions", "risk": "manual drift"}},
    },
}


BLUEPRINTS = buildVisualBlueprints(SPECS)
