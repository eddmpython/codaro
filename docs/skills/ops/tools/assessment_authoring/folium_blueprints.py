from __future__ import annotations

from .visualization_common import VisualLessonSpec, buildVisualBlueprints


SPECS: dict[str, VisualLessonSpec] = {
    "00": {
        "slug": "folium-map-contract", "title": "Folium 지도 contract", "question": "좌표·zoom·tile 출처가 지도 목적에 맞는가",
        "mark": "web-map", "x": "longitude", "y": "latitude", "group": "layer", "transforms": ["validate-coordinates", "fit-bounds"], "interaction": "pan-zoom", "required": ["longitude", "latitude", "layer"],
        "rows": [{"longitude": 126.98, "latitude": 37.57, "layer": "places"}, {"longitude": 129.07, "latitude": 35.18, "layer": "places"}, {"longitude": None, "latitude": 0, "layer": "invalid"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"places": 2}, "xExtent": [126.98, 129.07], "yExtent": [35.18, 37.57]},
        "transferContext": "두 물류 거점의 좌표를 검증하고 bounds에 맞춰 초기 지도를 설정한다",
        "retrieval": {"known-points": {"encoding": "fit bounds", "evidence": "valid coordinate count", "risk": "hard-coded center"}, "tile-layer": {"encoding": "attributed tiles", "evidence": "provider attribution", "risk": "license omission"}, "offline-report": {"encoding": "static fallback", "evidence": "export screenshot", "risk": "network-only tiles"}},
    },
    "01": {
        "slug": "first-map-view", "title": "첫 지도", "question": "초기 center와 zoom이 모든 위치를 보이게 하는가",
        "mark": "marker-map", "x": "longitude", "y": "latitude", "group": "city", "transforms": ["validate-coordinates", "fit-bounds"], "interaction": "pan-zoom", "required": ["longitude", "latitude", "city"],
        "rows": [{"longitude": 126.98, "latitude": 37.57, "city": "Seoul"}, {"longitude": 129.07, "latitude": 35.18, "city": "Busan"}, {"longitude": 127.38, "latitude": 36.35, "city": "Daejeon"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"Busan": 1, "Daejeon": 1, "Seoul": 1}, "xExtent": [126.98, 129.07], "yExtent": [35.18, 37.57]},
        "transferContext": "세 서비스 센터를 누락 없이 포함하는 initial bounds를 계산한다",
        "retrieval": {"one-location": {"encoding": "center plus marker", "evidence": "coordinate label", "risk": "excessive zoom"}, "many-locations": {"encoding": "fit bounds", "evidence": "extent", "risk": "hidden point"}, "invalid-coordinate": {"encoding": "exclude plus report", "evidence": "invalid count", "risk": "marker at zero"}},
    },
    "02": {
        "slug": "marker-semantics", "title": "marker 표현", "question": "marker 색·icon·popup이 같은 범주 의미를 일관되게 전달하는가",
        "mark": "semantic-markers", "x": "longitude", "y": "latitude", "group": "status", "transforms": ["status-style", "popup-sanitize"], "interaction": "popup", "required": ["longitude", "latitude", "status"],
        "rows": [{"longitude": 127.0, "latitude": 37.5, "status": "open"}, {"longitude": 127.1, "latitude": 37.6, "status": "closed"}, {"longitude": 127.2, "latitude": 37.7, "status": "open"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"closed": 1, "open": 2}, "xExtent": [127.0, 127.2], "yExtent": [37.5, 37.7]},
        "transferContext": "시설 운영 상태를 color와 icon 중복 encoding, 안전한 popup으로 표시한다",
        "retrieval": {"status-category": {"encoding": "color plus icon", "evidence": "legend", "risk": "color-only"}, "exact-detail": {"encoding": "popup plus accessible list", "evidence": "sanitized fields", "risk": "HTML injection"}, "many-statuses": {"encoding": "filter layers", "evidence": "visible active state", "risk": "legend overload"}},
    },
    "03": {
        "slug": "map-geometries", "title": "지도 도형", "question": "circle 반경과 polygon 좌표 단위가 명확한가",
        "mark": "geometry-layer", "x": "longitude", "y": "latitude", "group": "geometryType", "transforms": ["validate-geometry", "unit-label"], "interaction": "popup", "required": ["longitude", "latitude", "geometryType"],
        "rows": [{"longitude": 127.0, "latitude": 37.5, "geometryType": "circle"}, {"longitude": 127.2, "latitude": 37.6, "geometryType": "polygon"}, {"longitude": 126.9, "latitude": 37.4, "geometryType": "polyline"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"circle": 1, "polygon": 1, "polyline": 1}, "xExtent": [126.9, 127.2], "yExtent": [37.4, 37.6]},
        "transferContext": "배송 반경, 서비스 구역, 이동 경로를 geometry별 단위와 legend로 구분한다",
        "retrieval": {"distance-radius": {"encoding": "meter circle", "evidence": "radius unit", "risk": "pixel radius"}, "screen-emphasis": {"encoding": "circle marker", "evidence": "pixel size", "risk": "geographic area claim"}, "service-boundary": {"encoding": "polygon", "evidence": "valid ring", "risk": "self-intersection"}},
    },
    "04": {
        "slug": "tile-style-access", "title": "지도 style", "question": "basemap style이 overlay 대비와 attribution을 해치지 않는가",
        "mark": "styled-map", "x": "longitude", "y": "latitude", "group": "tile", "transforms": ["contrast-check", "attribution"], "interaction": "layer-toggle", "required": ["longitude", "latitude", "tile"],
        "rows": [{"longitude": 127.0, "latitude": 37.5, "tile": "light"}, {"longitude": 129.0, "latitude": 35.2, "tile": "light"}, {"longitude": 126.7, "latitude": 37.4, "tile": "dark"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"dark": 1, "light": 2}, "xExtent": [126.7, 129.0], "yExtent": [35.2, 37.5]},
        "transferContext": "시설 overlay와 충분한 contrast를 가진 tile을 attribution과 함께 제공한다",
        "retrieval": {"dense-overlay": {"encoding": "quiet basemap", "evidence": "contrast audit", "risk": "visual competition"}, "custom-tiles": {"encoding": "tile URL plus attribution", "evidence": "license text", "risk": "missing attribution"}, "dark-mode": {"encoding": "tested dark tiles", "evidence": "marker contrast", "risk": "invisible labels"}},
    },
    "05": {
        "slug": "layer-visibility", "title": "layer 관리", "question": "overlay 기본 가시성과 control 이름이 데이터 의미를 드러내는가",
        "mark": "layered-map", "x": "longitude", "y": "latitude", "group": "layerName", "transforms": ["named-groups", "default-visibility"], "interaction": "layer-control", "required": ["longitude", "latitude", "layerName"],
        "rows": [{"longitude": 127.0, "latitude": 37.5, "layerName": "stores"}, {"longitude": 127.1, "latitude": 37.6, "layerName": "incidents"}, {"longitude": 127.2, "latitude": 37.7, "layerName": "stores"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"incidents": 1, "stores": 2}, "xExtent": [127.0, 127.2], "yExtent": [37.5, 37.7]},
        "transferContext": "매장과 장애 overlay를 이름 있는 FeatureGroup과 명시적 초기 상태로 제공한다",
        "retrieval": {"alternative-basemaps": {"encoding": "base layers", "evidence": "one active", "risk": "multiple tiles"}, "independent-overlays": {"encoding": "overlay groups", "evidence": "visible counts", "risk": "hidden default"}, "many-layers": {"encoding": "grouped control", "evidence": "layer taxonomy", "risk": "control clutter"}},
    },
    "06": {
        "slug": "geojson-join", "title": "GeoJSON 활용", "question": "feature id와 데이터 key의 join coverage를 검증했는가",
        "mark": "geojson", "x": "featureId", "y": "value", "group": "geometryType", "transforms": ["validate-geometry", "join-coverage"], "interaction": "highlight", "required": ["featureId", "value", "geometryType"],
        "rows": [{"featureId": "11", "value": 10, "geometryType": "Polygon"}, {"featureId": "26", "value": 20, "geometryType": "Polygon"}, {"featureId": None, "value": 5, "geometryType": "Polygon"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"Polygon": 2}, "xExtent": ["11", "26"], "yExtent": [10, 20]},
        "transferContext": "행정구역 feature id와 KPI key의 unmatched 항목을 보고하고 hover style을 적용한다",
        "retrieval": {"attribute-join": {"encoding": "feature key", "evidence": "matched and unmatched counts", "risk": "silent missing areas"}, "geometry-validity": {"encoding": "validated GeoJSON", "evidence": "geometry errors", "risk": "broken rendering"}, "user-hover": {"encoding": "style function", "evidence": "keyboard fallback", "risk": "hover-only meaning"}},
    },
    "07": {
        "slug": "choropleth-rate", "title": "단계구분도", "question": "지역 면적이 아니라 정규화된 rate를 color로 비교하는가",
        "mark": "choropleth", "x": "regionId", "y": "rate", "group": "classification", "transforms": ["normalize", "classify", "join-coverage"], "interaction": "tooltip", "required": ["regionId", "rate", "classification"],
        "rows": [{"regionId": "A", "rate": 0.1, "classification": "low"}, {"regionId": "B", "rate": 0.5, "classification": "high"}, {"regionId": "C", "rate": None, "classification": "missing"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"high": 1, "low": 1}, "xExtent": ["A", "B"], "yExtent": [0.1, 0.5]},
        "transferContext": "지역별 장애 건수를 요청 수로 정규화한 rate 단계구분도를 만든다",
        "retrieval": {"regional-rate": {"encoding": "choropleth", "evidence": "denominator and join coverage", "risk": "raw count"}, "skewed-rate": {"encoding": "documented class breaks", "evidence": "break values", "risk": "arbitrary bins"}, "missing-region": {"encoding": "separate missing color", "evidence": "missing count", "risk": "zero color"}},
    },
    "08": {
        "slug": "heatmap-weight", "title": "공간 heatmap", "question": "점 밀도와 weight 합을 인구·수요로 오해하지 않는가",
        "mark": "heatmap", "x": "longitude", "y": "latitude", "group": "weightBand", "transforms": ["validate-coordinates", "validate-weight", "normalize-radius"], "interaction": "pan-zoom", "required": ["longitude", "latitude", "weightBand"],
        "rows": [{"longitude": 127.0, "latitude": 37.5, "weightBand": "high"}, {"longitude": 127.01, "latitude": 37.51, "weightBand": "low"}, {"longitude": 129.0, "latitude": 35.2, "weightBand": "low"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"high": 1, "low": 2}, "xExtent": [127.0, 129.0], "yExtent": [35.2, 37.51]},
        "transferContext": "호출 위치의 건수와 severity weight를 구분한 공간 heatmap을 만든다",
        "retrieval": {"event-density": {"encoding": "unweighted heatmap", "evidence": "point count", "risk": "population exposure"}, "severity-weight": {"encoding": "weighted heatmap", "evidence": "weight definition", "risk": "one extreme point"}, "precise-location": {"encoding": "clustered markers", "evidence": "individual records", "risk": "heatmap hides points"}},
    },
    "09": {
        "slug": "marker-cluster-detail", "title": "marker cluster", "question": "cluster count와 개별 marker 상세가 zoom에 따라 보존되는가",
        "mark": "marker-cluster", "x": "longitude", "y": "latitude", "group": "category", "transforms": ["validate-coordinates", "cluster"], "interaction": "cluster-zoom", "required": ["longitude", "latitude", "category"],
        "rows": [{"longitude": 127.0, "latitude": 37.5, "category": "store"}, {"longitude": 127.001, "latitude": 37.501, "category": "store"}, {"longitude": 129.0, "latitude": 35.2, "category": "warehouse"}],
        "expectedEvidence": {"usableCount": 3, "excludedCount": 0, "groupCounts": {"store": 2, "warehouse": 1}, "xExtent": [127.0, 129.0], "yExtent": [35.2, 37.501]},
        "transferContext": "수천 개 장비 위치를 cluster count와 category detail을 잃지 않게 탐색한다",
        "retrieval": {"many-markers": {"encoding": "marker cluster", "evidence": "cluster and total counts", "risk": "hidden categories"}, "aggregate-density": {"encoding": "heatmap", "evidence": "weight definition", "risk": "lost identity"}, "server-scale": {"encoding": "tile aggregation", "evidence": "viewport query", "risk": "client overload"}},
    },
    "10": {
        "slug": "map-project-release", "title": "종합 지도 project", "question": "위치·레이어·분모·접근성·export가 하나의 지도 계약을 이루는가",
        "mark": "map-dashboard", "x": "longitude", "y": "latitude", "group": "layer", "transforms": ["quality-gate", "layer-policy", "fit-bounds", "export-fallback"], "interaction": "layer-filter", "required": ["longitude", "latitude", "layer"],
        "rows": [{"longitude": 127.0, "latitude": 37.5, "layer": "facilities"}, {"longitude": 127.1, "latitude": 37.6, "layer": "incidents"}, {"longitude": None, "latitude": 37.7, "layer": "invalid"}],
        "expectedEvidence": {"usableCount": 2, "excludedCount": 1, "groupCounts": {"facilities": 1, "incidents": 1}, "xExtent": [127.0, 127.1], "yExtent": [37.5, 37.6]},
        "transferContext": "시설·장애·행정구역 layer를 품질 보고서와 정적 대체물까지 포함해 배포한다",
        "retrieval": {"release-map": {"encoding": "layered interactive map", "evidence": "coordinate and join audit", "risk": "silent omissions"}, "accessible-equivalent": {"encoding": "filterable place table", "evidence": "same record count", "risk": "map-only access"}, "offline-evidence": {"encoding": "static image plus data summary", "evidence": "artifact hash", "risk": "network tiles"}},
    },
}


BLUEPRINTS = buildVisualBlueprints(SPECS)
