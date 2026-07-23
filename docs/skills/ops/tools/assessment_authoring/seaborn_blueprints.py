from __future__ import annotations

from .common import task
from .visualization_common import VisualLessonSpec, buildVisualBlueprints


SPECS: dict[str, VisualLessonSpec] = {
    "00": {
        "slug": "seaborn-semantic-contract", "title": "Seaborn 통계 시각화", "question": "통계 집계와 semantic mapping이 질문에 맞는가",
        "mark": "relational", "x": "x", "y": "y", "group": "hue", "transforms": ["semantic-map"], "interaction": "none", "required": ["x", "y", "hue"],
        "rows": [{"x": 1, "y": 4, "hue": "A"}, {"x": 2, "y": 6, "hue": "A"}, {"x": 1, "y": 3, "hue": "B"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"A": 2, "B": 1}, "xExtent": [1, 2], "yExtent": [3, 6]},
        "transferContext": "실험 조건별 두 수치 변수 관계를 hue와 marker로 비교한다",
        "retrieval": {"raw-observations": {"encoding": "scatter", "evidence": "point count", "risk": "overplotting"}, "estimated-mean": {"encoding": "point plus interval", "evidence": "estimator and uncertainty", "risk": "default estimator"}, "category-semantic": {"encoding": "hue plus style", "evidence": "group counts", "risk": "color-only distinction"}},
    },
    "01": {
        "slug": "iris-semantic-scatter", "title": "붓꽃 품종 scatter", "question": "품종 분리가 색 하나에만 의존하지 않는가",
        "mark": "scatter", "x": "sepalLength", "y": "petalLength", "group": "species", "transforms": ["hue", "style"], "interaction": "none", "required": ["sepalLength", "petalLength", "species"],
        "rows": [{"sepalLength": 5.1, "petalLength": 1.4, "species": "setosa"}, {"sepalLength": 6.0, "petalLength": 4.5, "species": "versicolor"}, {"sepalLength": 6.8, "petalLength": None, "species": "virginica"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"setosa": 1, "versicolor": 1}, "xExtent": [5.1, 6.0], "yExtent": [1.4, 4.5]},
        "transferContext": "장비 유형별 온도와 진동 관계를 색·marker 중복 encoding으로 비교한다",
        "retrieval": {"species-groups": {"encoding": "hue and style", "evidence": "legend and group n", "risk": "inaccessible color"}, "dense-points": {"encoding": "alpha or density", "evidence": "overlap rate", "risk": "hidden frequency"}, "class-boundary": {"encoding": "scatter plus model boundary", "evidence": "held-out score", "risk": "visual separability claim"}},
    },
    "02": {
        "slug": "tip-distribution-semantics", "title": "팁 분포 탐색", "question": "histogram과 KDE의 가정과 분모를 분리했는가",
        "mark": "histogram", "x": "tipRate", "y": "count", "group": "meal", "transforms": ["bin", "count"], "interaction": "none", "required": ["tipRate", "count", "meal"],
        "rows": [{"tipRate": 0.1, "count": 4, "meal": "lunch"}, {"tipRate": 0.2, "count": 3, "meal": "dinner"}, {"tipRate": 0.3, "count": 1, "meal": "dinner"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"dinner": 2, "lunch": 1}, "xExtent": [0.1, 0.3], "yExtent": [1, 4]},
        "transferContext": "응답 시간 분포를 트래픽 유형별 동일 bin으로 비교한다",
        "retrieval": {"honest-frequency": {"encoding": "histogram count", "evidence": "bin edges and n", "risk": "unequal bins"}, "shape-estimate": {"encoding": "KDE plus rug", "evidence": "bandwidth", "risk": "invented tails"}, "group-normalization": {"encoding": "density with explicit common_norm", "evidence": "group n", "risk": "area comparison"}},
    },
    "03": {
        "slug": "penguin-violin", "title": "펭귄 체중 분포", "question": "매끈한 density가 작은 표본을 과장하지 않는가",
        "mark": "violin", "x": "species", "y": "bodyMass", "group": "sex", "transforms": ["density", "inner-quartile"], "interaction": "none", "required": ["species", "bodyMass", "sex"],
        "rows": [{"species": "A", "bodyMass": 3000, "sex": "F"}, {"species": "A", "bodyMass": 3200, "sex": "M"}, {"species": "B", "bodyMass": 4500, "sex": "M"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"F": 1, "M": 2}, "xExtent": ["A", "B"], "yExtent": [3000, 4500]},
        "transferContext": "기종별 latency 분포를 리전으로 split하되 관측점과 quartile을 함께 보인다",
        "retrieval": {"small-group": {"encoding": "points plus box", "evidence": "raw n", "risk": "unstable KDE"}, "large-distribution": {"encoding": "violin plus quartile", "evidence": "bandwidth and n", "risk": "density width as count"}, "unequal-groups": {"encoding": "count-scaled or separate n", "evidence": "group sizes", "risk": "equal area illusion"}},
    },
    "04": {
        "slug": "advertising-regression", "title": "광고비와 판매액 회귀", "question": "회귀선이 인과 효과가 아니라 관측 관계임을 드러내는가",
        "mark": "regression", "x": "adSpend", "y": "sales", "group": "channel", "transforms": ["fit-linear", "confidence-interval"], "interaction": "none", "required": ["adSpend", "sales", "channel"],
        "rows": [{"adSpend": 10, "sales": 20, "channel": "web"}, {"adSpend": 20, "sales": 28, "channel": "web"}, {"adSpend": 10, "sales": 18, "channel": "store"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"store": 1, "web": 2}, "xExtent": [10, 20], "yExtent": [18, 28]},
        "transferContext": "교육 시간과 평가 점수의 관측 관계를 cohort별 회귀와 interval로 탐색한다",
        "retrieval": {"linear-association": {"encoding": "scatter plus regression", "evidence": "residuals and interval", "risk": "causal wording"}, "nonlinear-pattern": {"encoding": "scatter plus flexible smoother", "evidence": "held-out fit", "risk": "overfit curve"}, "extrapolation": {"encoding": "observed-domain only", "evidence": "x range", "risk": "line beyond data"}},
    },
    "05": {
        "slug": "titanic-survival-estimate", "title": "타이타닉 생존 추정", "question": "범주별 생존율의 유효 분모와 불확실성을 보여주는가",
        "mark": "point-interval", "x": "pclass", "y": "survivalRate", "group": "sex", "transforms": ["mean-binary", "confidence-interval"], "interaction": "none", "required": ["pclass", "survivalRate", "sex"],
        "rows": [{"pclass": 1, "survivalRate": 0.9, "sex": "F"}, {"pclass": 1, "survivalRate": 0.4, "sex": "M"}, {"pclass": 3, "survivalRate": 0.5, "sex": "F"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"F": 2, "M": 1}, "xExtent": [1, 3], "yExtent": [0.4, 0.9]},
        "transferContext": "요금제와 채널별 전환율을 유효 사용자 수와 interval로 비교한다",
        "retrieval": {"binary-outcome-rate": {"encoding": "point plus interval", "evidence": "known denominator", "risk": "unknown as failure"}, "raw-binary-points": {"encoding": "strip with jitter", "evidence": "point n", "risk": "overlap"}, "many-subgroups": {"encoding": "faceted estimates", "evidence": "subgroup n", "risk": "multiple comparisons"}},
    },
    "06": {
        "slug": "flight-seasonality", "title": "항공편 승객 시계열", "question": "장기 추세와 월별 계절성을 같은 행렬에서 구분하는가",
        "mark": "heatmap", "x": "month", "y": "year", "group": "era", "transforms": ["pivot", "fixed-color-scale"], "interaction": "none", "required": ["month", "year", "era"],
        "rows": [{"month": 1, "year": 2024, "era": "recent"}, {"month": 2, "year": 2024, "era": "recent"}, {"month": 1, "year": 2023, "era": "past"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"past": 1, "recent": 2}, "xExtent": [1, 2], "yExtent": [2023, 2024]},
        "transferContext": "월·연도별 전력 수요를 고정 color scale heatmap으로 비교한다",
        "retrieval": {"seasonal-matrix": {"encoding": "year-month heatmap", "evidence": "fixed scale", "risk": "color scale drift"}, "exact-time-trend": {"encoding": "line", "evidence": "ordered dates", "risk": "heatmap hides exact change"}, "year-over-year": {"encoding": "month lines by year", "evidence": "same months", "risk": "too many years"}},
    },
    "07": {
        "slug": "life-expectancy-facets", "title": "세계 기대수명", "question": "국가·대륙의 계층과 시간 변화가 섞이지 않았는가",
        "mark": "faceted-line", "x": "year", "y": "lifeExpectancy", "group": "continent", "transforms": ["country-aggregate", "facet-continent"], "interaction": "none", "required": ["year", "lifeExpectancy", "continent"],
        "rows": [{"year": 2000, "lifeExpectancy": 70, "continent": "Asia"}, {"year": 2010, "lifeExpectancy": 74, "continent": "Asia"}, {"year": 2000, "lifeExpectancy": 76, "continent": "Europe"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"Asia": 2, "Europe": 1}, "xExtent": [2000, 2010], "yExtent": [70, 76]},
        "transferContext": "지역별 서비스 가용성의 장기 추세를 region facet과 동일 y scale로 비교한다",
        "retrieval": {"continent-trends": {"encoding": "faceted lines", "evidence": "shared y scale", "risk": "country weighting"}, "country-ranking": {"encoding": "year-filtered dots", "evidence": "same year", "risk": "mixed periods"}, "global-average": {"encoding": "weighted line", "evidence": "population weights", "risk": "unweighted countries"}},
    },
    "08": {
        "slug": "diamond-price-scale", "title": "다이아몬드 가격", "question": "크기·등급·가격의 강한 왜도를 scale로 숨기지 않는가",
        "mark": "scatter", "x": "carat", "y": "pricePerCarat", "group": "cut", "transforms": ["unit-price", "log-y"], "interaction": "none", "required": ["carat", "pricePerCarat", "cut"],
        "rows": [{"carat": 0.5, "pricePerCarat": 3000, "cut": "Good"}, {"carat": 1.0, "pricePerCarat": 5000, "cut": "Ideal"}, {"carat": 2.0, "pricePerCarat": 9000, "cut": "Ideal"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"Good": 1, "Ideal": 2}, "xExtent": [0.5, 2.0], "yExtent": [3000, 9000]},
        "transferContext": "주택 면적과 단위면적 가격 관계를 지역별 log scale로 탐색한다",
        "retrieval": {"skewed-price": {"encoding": "log-axis scatter", "evidence": "positive-domain and ticks", "risk": "hidden transform"}, "unit-price": {"encoding": "derived metric scatter", "evidence": "formula", "risk": "zero denominator"}, "price-distribution": {"encoding": "log histogram", "evidence": "bin domain", "risk": "misread distances"}},
    },
    "09": {
        "slug": "mpg-multivariate", "title": "자동차 연비 종합", "question": "다변량 탐색에서 같은 변수를 반복 해석하지 않는가",
        "mark": "pair-grid", "x": "horsepower", "y": "mpg", "group": "origin", "transforms": ["sample", "diagonal-distribution"], "interaction": "none", "required": ["horsepower", "mpg", "origin"],
        "rows": [{"horsepower": 80, "mpg": 35, "origin": "EU"}, {"horsepower": 120, "mpg": 25, "origin": "US"}, {"horsepower": 200, "mpg": 15, "origin": "US"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"EU": 1, "US": 2}, "xExtent": [80, 200], "yExtent": [15, 35]},
        "transferContext": "장비 특성 여러 개와 에너지 효율의 관계를 pair grid로 탐색한다",
        "retrieval": {"many-numeric-features": {"encoding": "pair grid", "evidence": "variable list and n", "risk": "multiple comparisons"}, "target-focused": {"encoding": "small multiples versus target", "evidence": "shared target scale", "risk": "duplicated noise"}, "production-report": {"encoding": "selected hypotheses only", "evidence": "selection rationale", "risk": "EDA dump"}},
    },
    "10": {
        "slug": "eda-evidence-report", "title": "종합 EDA report", "question": "탐색 결과가 품질·분포·관계·한계 순서로 재현되는가",
        "mark": "eda-panels", "x": "feature", "y": "metric", "group": "panel", "transforms": ["quality-summary", "distribution", "relationship"], "interaction": "none", "required": ["feature", "metric", "panel"],
        "rows": [{"feature": "age", "metric": 0.1, "panel": "missing"}, {"feature": "fare", "metric": 0.7, "panel": "correlation"}, {"feature": "score", "metric": None, "panel": "distribution"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"correlation": 1, "missing": 1}, "xExtent": ["age", "fare"], "yExtent": [0.1, 0.7]},
        "transferContext": "고객 이탈 데이터 EDA를 품질, 단변량, 관계, 한계 panel로 재현한다",
        "retrieval": {"quality-first": {"encoding": "missingness table", "evidence": "row and field denominators", "risk": "silent drop"}, "distribution-next": {"encoding": "type-appropriate plots", "evidence": "n and domain", "risk": "default bins"}, "relationship-last": {"encoding": "hypothesis-linked plots", "evidence": "claim scope", "risk": "causal overreach"}},
    },
}


_PNG_PREVIEW_HELPER = '''import csv
import struct
import zlib
from pathlib import Path


def _write_preview_png(output_path, group_counts):
    width, height = 320, 180
    pixels = [bytearray([248, 250, 252] * width) for _ in range(height)]

    def fill_rect(left, top, right, bottom, color):
        for y in range(max(0, top), min(height, bottom)):
            for x in range(max(0, left), min(width, right)):
                offset = x * 3
                pixels[y][offset:offset + 3] = bytes(color)

    fill_rect(20, 18, 300, 156, (255, 255, 255))
    fill_rect(39, 28, 41, 146, (51, 65, 85))
    fill_rect(39, 144, 294, 146, (51, 65, 85))
    items = sorted(group_counts.items())[:8]
    if items:
        maximum = max(count for _, count in items)
        slot = 240 // len(items)
        bar_width = min(36, max(8, slot - 10))
        palette = [(17, 138, 178), (6, 148, 162), (239, 108, 86), (255, 183, 3)]
        for index, (_, count) in enumerate(items):
            bar_height = max(2, round(100 * count / maximum))
            left = 47 + index * slot + (slot - bar_width) // 2
            fill_rect(left, 145 - bar_height, left + bar_width, 145, palette[index % len(palette)])
    else:
        fill_rect(88, 76, 232, 80, (148, 163, 184))
        fill_rect(158, 48, 162, 108, (148, 163, 184))

    def chunk(kind, data):
        checksum = zlib.crc32(kind + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", checksum)

    raw = b"".join(b"\\x00" + bytes(row) for row in pixels)
    payload = (
        b"\\x89PNG\\r\\n\\x1a\\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    target = Path(output_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(payload)
'''


def _capstoneMastery():
    entry = "prepare_eda_evidence_report"
    starter = _PNG_PREVIEW_HELPER + f'''\n\ndef {entry}(rows, table_path=None, image_path=None):
    raise NotImplementedError
'''
    solution = _PNG_PREVIEW_HELPER + f'''\n\ndef {entry}(rows, table_path=None, image_path=None):
    required = ["feature", "metric", "panel"]
    if any(not set(required) <= set(row) for row in rows):
        raise ValueError("chart schema mismatch")
    usable = [row for row in rows if all(row[name] is not None for name in required)]
    groups = {{}}
    for row in usable:
        key = str(row["panel"])
        groups[key] = groups.get(key, 0) + 1
    x_values = [row["feature"] for row in usable]
    y_values = [row["metric"] for row in usable]
    result = {{
        "usableCount": len(usable),
        "excludedCount": len(rows) - len(usable),
        "groupCounts": {{key: groups[key] for key in sorted(groups)}},
        "xExtent": None if not x_values else [min(x_values), max(x_values)],
        "yExtent": None if not y_values else [min(y_values), max(y_values)],
    }}
    empty = not rows
    table_path = table_path or ("output/empty-eda-report.csv" if empty else "output/eda-report.csv")
    image_path = image_path or ("output/empty-eda-preview.png" if empty else "output/eda-preview.png")
    target = Path(table_path)
    target.parent.mkdir(parents=True, exist_ok=True)
    columns = ["feature", "metric", "panel", "status"]
    with target.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=columns)
        writer.writeheader()
        for row in rows:
            writer.writerow({{
                "feature": row["feature"],
                "metric": row["metric"],
                "panel": row["panel"],
                "status": "usable" if all(row[name] is not None for name in required) else "excluded",
            }})
    _write_preview_png(image_path, groups)
    return result
'''
    return task(
        "eda-evidence-report-data-evidence",
        "종합 EDA report 데이터·preview 증거 만들기",
        "탐색 결과를 해석하기 전에 모든 입력 행의 포함 상태와 panel별 표본 수를 재현 가능한 표·이미지로 남긴다.",
        f"{entry}(rows, table_path, image_path)를 완성하세요. table_path에는 feature, metric, panel, status 열의 CSV를 저장하고, 제공된 helper로 image_path에 panel별 usable count를 그린 PNG preview를 저장한 뒤 usable·excluded 분모와 축 범위를 반환하세요.",
        starter,
        solution,
        entry,
        [
            (
                "summarizes-visible-data",
                [SPECS["10"]["rows"], "output/eda-report.csv", "output/eda-preview.png"],
                SPECS["10"]["expectedEvidence"],
            ),
            (
                "handles-empty-data",
                [[], "output/empty-eda-report.csv", "output/empty-eda-preview.png"],
                {"usableCount": 0, "excludedCount": 0, "groupCounts": {}, "xExtent": None, "yExtent": None},
            ),
        ],
        [
            "CSV의 status로 NULL 때문에 preview에서 제외된 행을 숨기지 마세요.",
            "빈 입력도 header-only table과 명시적인 empty-state preview를 모두 남기세요.",
        ],
        expectedPaths=[
            {"path": "output/eda-report.csv", "kind": "table", "origin": "created", "format": "csv", "columns": ["feature", "metric", "panel", "status"]},
            {"path": "output/eda-preview.png", "kind": "image", "origin": "created", "mediaType": "image/png", "width": 320, "height": 180},
            {"path": "output/empty-eda-report.csv", "kind": "table", "origin": "created", "format": "csv", "columns": ["feature", "metric", "panel", "status"]},
            {"path": "output/empty-eda-preview.png", "kind": "image", "origin": "created", "mediaType": "image/png", "width": 320, "height": 180},
        ],
    )


BLUEPRINTS = buildVisualBlueprints(SPECS)
BLUEPRINTS["10"]["mastery"] = _capstoneMastery()
