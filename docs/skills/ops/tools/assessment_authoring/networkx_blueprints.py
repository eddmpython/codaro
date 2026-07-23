from __future__ import annotations

from typing import Any

from .common import TaskBlueprint, raises, task


T = task
E = raises


def decision(slug: str, title: str, goal: str, entry: str, table: dict[str, dict[str, Any]]) -> TaskBlueprint:
    solution = f"def {entry}(situation):\n    table = {table!r}\n    if situation not in table:\n        raise ValueError('unknown situation')\n    return table[situation]\n"
    cases = [("recalls-" + key, [key], value) for key, value in list(table.items())[:2]] + [("rejects-unknown", ["unknown"], E("ValueError"))]
    return T(slug, title, goal, f"{entry}(situation)를 완성해 method, evidence, risk를 반환하세요.", f"def {entry}(situation):\n    raise NotImplementedError", solution, entry, cases, ["그래프 알고리즘의 입력 가정과 반환 의미를 함께 기록하세요.", "시각적 모양만으로 구조적 결론을 내리지 마세요."])


BLUEPRINTS: dict[str, dict[str, TaskBlueprint]] = {
    "00": {
        "mastery": T(
            "graph-contract", "그래프 데이터 계약 점검하기", "node identity, edge endpoint, directed 여부를 검사해 분석 가능한 graph contract를 만든다.", "audit_graph(nodes, edges, directed)를 완성하세요.", "def audit_graph(nodes, edges, directed):\n    raise NotImplementedError",
            """def audit_graph(nodes, edges, directed):
    node_set = set(nodes)
    dangling = sorted({endpoint for edge in edges for endpoint in edge[:2] if endpoint not in node_set})
    normalized = []
    seen = set()
    for source, target, *rest in edges:
        key = (source, target) if directed else tuple(sorted((source, target)))
        if key not in seen:
            normalized.append([source, target] + rest)
            seen.add(key)
    return {"valid": len(nodes) == len(node_set) and not dangling, "nodeCount": len(node_set), "edgeCount": len(normalized), "dangling": dangling, "directed": directed}
""", "audit_graph",
            [("normalizes-undirected-duplicates", [["a", "b"], [["a", "b"], ["b", "a"]], False], {"valid": True, "nodeCount": 2, "edgeCount": 1, "dangling": [], "directed": False}), ("reports-dangling-node", [["a"], [["a", "b"]], True], {"valid": False, "nodeCount": 1, "edgeCount": 1, "dangling": ["b"], "directed": True})],
            ["undirected edge는 endpoint 순서가 달라도 하나입니다.", "edge가 참조하는 모든 node identity를 먼저 검증하세요."],
        ),
        "transfer": T(
            "relationship-model", "새 업무 관계를 graph schema로 전이하기", "관계의 방향·가중치·다중 edge 필요 여부를 질문으로 결정한다.", "model_relationship(kind)를 완성하세요.", "def model_relationship(kind):\n    raise NotImplementedError",
            """def model_relationship(kind):
    table = {
        "friendship": {"directed": False, "weighted": False, "multi": False},
        "money-transfer": {"directed": True, "weighted": True, "multi": True},
        "road-distance": {"directed": False, "weighted": True, "multi": False},
    }
    if kind not in table:
        raise ValueError("unknown relationship")
    return table[kind]
""", "model_relationship",
            [("models-friendship", ["friendship"], {"directed": False, "weighted": False, "multi": False}), ("models-transfer", ["money-transfer"], {"directed": True, "weighted": True, "multi": True}), ("rejects-unknown", ["unknown"], E("ValueError"))],
            ["관계가 대칭인지 먼저 판단하세요.", "같은 두 node 사이의 여러 사건을 보존할지 명시하세요."],
        ),
        "retrieval": decision("graph-model-choice", "그래프 모델 선택 회상하기", "관계 의미에 맞는 graph 종류를 고른다.", "choose_graph_model", {"mutual-friend": {"method": "Graph", "evidence": "symmetric edge", "risk": "duplicate directions"}, "web-link": {"method": "DiGraph", "evidence": "source and target", "risk": "lost direction"}, "parallel-flights": {"method": "MultiDiGraph", "evidence": "flight identity", "risk": "collapsed routes"}}),
    },
    "01": {
        "mastery": T(
            "adjacency-degree", "첫 graph의 adjacency와 degree 만들기", "undirected edge에서 node별 이웃과 degree를 안정적으로 반환한다.", "build_adjacency(nodes, edges)를 완성하세요.", "def build_adjacency(nodes, edges):\n    raise NotImplementedError",
            """def build_adjacency(nodes, edges):
    adjacency = {node: set() for node in nodes}
    for source, target in edges:
        if source not in adjacency or target not in adjacency:
            raise ValueError("unknown endpoint")
        adjacency[source].add(target)
        adjacency[target].add(source)
    return {node: {"neighbors": sorted(adjacency[node]), "degree": len(adjacency[node])} for node in sorted(adjacency)}
""", "build_adjacency",
            [("builds-neighbors", [["a", "b", "c"], [["a", "b"], ["a", "c"], ["a", "b"]]], {"a": {"neighbors": ["b", "c"], "degree": 2}, "b": {"neighbors": ["a"], "degree": 1}, "c": {"neighbors": ["a"], "degree": 1}}), ("keeps-isolated-node", [["x"], []], {"x": {"neighbors": [], "degree": 0}}), ("rejects-unknown-endpoint", [["a"], [["a", "b"]]], E("ValueError"))],
            ["중복 edge가 degree를 부풀리지 않게 set을 사용하세요.", "edge가 없는 isolated node도 결과에 남기세요."],
        ),
        "transfer": T(
            "edge-list-summary", "새 협업 edge list에 graph 요약 전이하기", "self-loop와 중복 관계를 분리해 품질 보고서를 만든다.", "summarize_edges(edges)를 완성하세요.", "def summarize_edges(edges):\n    raise NotImplementedError",
            """def summarize_edges(edges):
    unique = set()
    loops = 0
    duplicates = 0
    for source, target in edges:
        if source == target:
            loops += 1
            continue
        key = tuple(sorted((source, target)))
        if key in unique:
            duplicates += 1
        unique.add(key)
    return {"uniqueEdges": len(unique), "selfLoops": loops, "duplicates": duplicates}
""", "summarize_edges",
            [("counts-quality-issues", [[['a', 'b'], ['b', 'a'], ['a', 'a']]], {"uniqueEdges": 1, "selfLoops": 1, "duplicates": 1}), ("handles-empty", [[]], {"uniqueEdges": 0, "selfLoops": 0, "duplicates": 0})],
            ["self-loop와 reverse duplicate는 다른 품질 문제입니다.", "분석 전에 edge 정제 정책을 증거로 남기세요."],
        ),
        "retrieval": decision("graph-construction", "graph 구성 판단 회상하기", "node와 edge 추가 방식의 결과를 구분한다.", "choose_construction", {"known-isolates": {"method": "add nodes before edges", "evidence": "isolated node count", "risk": "missing isolates"}, "clean-edge-list": {"method": "add edges", "evidence": "endpoint audit", "risk": "implicit nodes"}, "node-attributes": {"method": "attribute mapping", "evidence": "schema coverage", "risk": "mixed types"}}),
    },
    "02": {
        "mastery": T(
            "directed-weight-balance", "방향·가중 graph의 유입과 유출 계산하기", "node별 in/out degree와 weight 합을 분리한다.", "directed_balance(nodes, edges)를 완성하세요.", "def directed_balance(nodes, edges):\n    raise NotImplementedError",
            """def directed_balance(nodes, edges):
    result = {node: {"inDegree": 0, "outDegree": 0, "inWeight": 0, "outWeight": 0} for node in nodes}
    for source, target, weight in edges:
        if source not in result or target not in result or weight < 0:
            raise ValueError("invalid weighted edge")
        result[source]["outDegree"] += 1
        result[source]["outWeight"] += weight
        result[target]["inDegree"] += 1
        result[target]["inWeight"] += weight
    return {node: result[node] for node in sorted(result)}
""", "directed_balance",
            [("separates-in-and-out", [["a", "b"], [["a", "b", 3], ["b", "a", 1]]], {"a": {"inDegree": 1, "outDegree": 1, "inWeight": 1, "outWeight": 3}, "b": {"inDegree": 1, "outDegree": 1, "inWeight": 3, "outWeight": 1}}), ("keeps-zero-node", [["x"], []], {"x": {"inDegree": 0, "outDegree": 0, "inWeight": 0, "outWeight": 0}}), ("rejects-negative-weight", [["a"], [["a", "a", -1]]], E("ValueError"))],
            ["degree와 weight 합은 서로 다른 지표입니다.", "source와 target 역할을 바꾸지 마세요."],
        ),
        "transfer": T(
            "flow-anomaly", "새 자금 흐름에 방향 graph 전이하기", "node별 순유입과 총량을 계산해 큰 imbalance를 찾는다.", "flow_anomalies(nodes, edges, threshold)를 완성하세요.", "def flow_anomalies(nodes, edges, threshold):\n    raise NotImplementedError",
            """def flow_anomalies(nodes, edges, threshold):
    flow = {node: {"in": 0, "out": 0} for node in nodes}
    for source, target, amount in edges:
        flow[source]["out"] += amount
        flow[target]["in"] += amount
    result = []
    for node, values in sorted(flow.items()):
        net = values["in"] - values["out"]
        if abs(net) >= threshold:
            result.append({"node": node, "net": net, "volume": values["in"] + values["out"]})
    return result
""", "flow_anomalies",
            [("finds-imbalances", [["a", "b", "c"], [["a", "b", 10], ["b", "c", 2]], 5], [{"node": "a", "net": -10, "volume": 10}, {"node": "b", "net": 8, "volume": 12}]), ("returns-none-below-threshold", [["a", "b"], [["a", "b", 1]], 2], [])],
            ["net과 total volume을 함께 보여주세요.", "큰 순유입이 곧 이상 거래라는 인과 주장은 하지 마세요."],
        ),
        "retrieval": decision("directed-weight-choice", "방향과 가중치 회상하기", "경로 의미에 맞는 edge 속성을 고른다.", "choose_edge_semantics", {"follows": {"method": "directed unweighted", "evidence": "source target", "risk": "symmetrizing"}, "distance": {"method": "weighted", "evidence": "unit", "risk": "negative value"}, "event-count": {"method": "aggregate or multiedge", "evidence": "event grain", "risk": "lost multiplicity"}}),
    },
    "03": {
        "mastery": T(
            "bfs-shortest-path", "unweighted graph 최단 경로 찾기", "BFS로 최소 edge 수 경로와 방문 수를 반환한다.", "shortest_unweighted(edges, start, goal)를 완성하세요.", "def shortest_unweighted(edges, start, goal):\n    raise NotImplementedError",
            """def shortest_unweighted(edges, start, goal):
    adjacency = {}
    for source, target in edges:
        adjacency.setdefault(source, set()).add(target)
        adjacency.setdefault(target, set()).add(source)
    queue = [[start]]
    visited = {start}
    while queue:
        path = queue.pop(0)
        node = path[-1]
        if node == goal:
            return {"path": path, "hops": len(path) - 1, "visited": len(visited)}
        for neighbor in sorted(adjacency.get(node, [])):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(path + [neighbor])
    return {"path": None, "hops": None, "visited": len(visited)}
""", "shortest_unweighted",
            [("finds-minimum-hops", [[['a', 'b'], ['b', 'd'], ['a', 'c'], ['c', 'd']], 'a', 'd'], {"path": ["a", "b", "d"], "hops": 2, "visited": 4}), ("reports-unreachable", [[['a', 'b'], ['c', 'd']], 'a', 'd'], {"path": None, "hops": None, "visited": 2})],
            ["BFS queue는 전체 path를 보존해야 합니다.", "neighbor 정렬로 동률 경로를 재현 가능하게 만드세요."],
        ),
        "transfer": T(
            "dijkstra-distance", "새 도로망에 가중 최단 경로 전이하기", "음이 아닌 거리에서 Dijkstra로 비용과 경로를 계산한다.", "shortest_weighted(edges, start, goal)를 완성하세요.", "def shortest_weighted(edges, start, goal):\n    raise NotImplementedError",
            """def shortest_weighted(edges, start, goal):
    import heapq
    adjacency = {}
    for source, target, weight in edges:
        if weight < 0:
            raise ValueError("negative weight")
        adjacency.setdefault(source, []).append((target, weight))
        adjacency.setdefault(target, []).append((source, weight))
    heap = [(0, [start], start)]
    best = {}
    while heap:
        cost, path, node = heapq.heappop(heap)
        if node in best:
            continue
        best[node] = cost
        if node == goal:
            return {"path": path, "cost": cost}
        for neighbor, weight in adjacency.get(node, []):
            if neighbor not in best:
                heapq.heappush(heap, (cost + weight, path + [neighbor], neighbor))
    return {"path": None, "cost": None}
""", "shortest_weighted",
            [("prefers-lower-cost-not-hops", [[['a', 'b', 10], ['a', 'c', 2], ['c', 'b', 2]], 'a', 'b'], {"path": ["a", "c", "b"], "cost": 4}), ("reports-unreachable", [[], 'a', 'b'], {"path": None, "cost": None}), ("rejects-negative", [[['a', 'b', -1]], 'a', 'b'], E("ValueError"))],
            ["최소 hop과 최소 weight는 다른 문제입니다.", "음수 weight에서는 Dijkstra를 사용하지 마세요."],
        ),
        "retrieval": decision("shortest-path-method", "최단 경로 알고리즘 회상하기", "weight 가정에 맞는 알고리즘을 고른다.", "choose_shortest_path", {"unweighted": {"method": "BFS", "evidence": "hop count", "risk": "ignoring cost"}, "nonnegative-weight": {"method": "Dijkstra", "evidence": "weight unit", "risk": "negative edge"}, "negative-weight": {"method": "Bellman-Ford", "evidence": "cycle check", "risk": "negative cycle"}}),
    },
    "04": {
        "mastery": T(
            "degree-centrality", "degree centrality의 분모 계산하기", "simple graph에서 degree/(n-1)를 계산하고 isolated node를 보존한다.", "degree_centrality(nodes, edges)를 완성하세요.", "def degree_centrality(nodes, edges):\n    raise NotImplementedError",
            """def degree_centrality(nodes, edges):
    neighbors = {node: set() for node in nodes}
    for source, target in edges:
        neighbors[source].add(target)
        neighbors[target].add(source)
    denominator = max(1, len(nodes) - 1)
    return {node: round(len(neighbors[node]) / denominator, 3) for node in sorted(nodes)}
""", "degree_centrality",
            [("normalizes-by-n-minus-one", [["a", "b", "c"], [["a", "b"], ["a", "c"]]], {"a": 1.0, "b": 0.5, "c": 0.5}), ("handles-single-node", [["x"], []], {"x": 0.0})],
            ["simple graph degree 분모는 n-1입니다.", "높은 연결 수와 영향력은 같은 개념이 아닙니다."],
        ),
        "transfer": T(
            "closeness-reachability", "새 조직망에 closeness 개념 전이하기", "도달 가능한 거리 합과 전체 graph coverage를 함께 반환한다.", "closeness_scores(nodes, edges)를 완성하세요.", "def closeness_scores(nodes, edges):\n    raise NotImplementedError",
            """def closeness_scores(nodes, edges):
    adjacency = {node: set() for node in nodes}
    for a, b in edges:
        adjacency[a].add(b); adjacency[b].add(a)
    result = {}
    for start in nodes:
        distance = {start: 0}; queue = [start]
        while queue:
            node = queue.pop(0)
            for neighbor in adjacency[node]:
                if neighbor not in distance:
                    distance[neighbor] = distance[node] + 1; queue.append(neighbor)
        reachable = len(distance) - 1
        score = 0.0 if not reachable else round((reachable / sum(distance.values())) * (reachable / max(1, len(nodes) - 1)), 3)
        result[start] = {"score": score, "reachable": reachable}
    return {node: result[node] for node in sorted(result)}
""", "closeness_scores",
            [("penalizes-disconnected-coverage", [["a", "b", "c"], [["a", "b"]]], {"a": {"score": 0.5, "reachable": 1}, "b": {"score": 0.5, "reachable": 1}, "c": {"score": 0.0, "reachable": 0}}), ("scores-line-center-higher", [["a", "b", "c"], [["a", "b"], ["b", "c"]]], {"a": {"score": 0.667, "reachable": 2}, "b": {"score": 1.0, "reachable": 2}, "c": {"score": 0.667, "reachable": 2}})],
            ["distance 합뿐 아니라 전체 node 중 도달 가능한 비율을 반영하세요.", "서로 다른 component의 centrality 비교 한계를 남기세요."],
        ),
        "retrieval": decision("centrality-meaning", "중심성 의미 회상하기", "질문에 맞는 중심성 지표를 고른다.", "choose_centrality", {"many-direct-links": {"method": "degree", "evidence": "neighbor count", "risk": "popularity as authority"}, "broker-between-groups": {"method": "betweenness", "evidence": "shortest-path share", "risk": "path model assumption"}, "quick-reach": {"method": "closeness", "evidence": "distance and reachability", "risk": "disconnected graph"}}),
    },
    "05": {
        "mastery": T(
            "mutual-friends", "소셜 graph의 공통 이웃 추천 만들기", "직접 친구와 자기 자신을 제외하고 mutual friend 수로 후보를 정렬한다.", "recommend_friends(nodes, edges, person)를 완성하세요.", "def recommend_friends(nodes, edges, person):\n    raise NotImplementedError",
            """def recommend_friends(nodes, edges, person):
    adjacency = {node: set() for node in nodes}
    for a, b in edges:
        adjacency[a].add(b); adjacency[b].add(a)
    if person not in adjacency:
        raise ValueError("unknown person")
    candidates = []
    for node in nodes:
        if node != person and node not in adjacency[person]:
            count = len(adjacency[person] & adjacency[node])
            if count:
                candidates.append({"person": node, "mutual": count})
    return sorted(candidates, key=lambda row: (-row["mutual"], row["person"]))
""", "recommend_friends",
            [("ranks-mutual-friends", [["a", "b", "c", "d"], [["a", "b"], ["a", "c"], ["b", "d"], ["c", "d"]], "a"], [{"person": "d", "mutual": 2}]), ("returns-no-candidate", [["a", "b"], [["a", "b"]], "a"], []), ("rejects-unknown", [["a"], [], "x"], E("ValueError"))],
            ["직접 연결된 사람을 추천에서 제외하세요.", "mutual count는 친밀도나 안전성을 증명하지 않습니다."],
        ),
        "transfer": T(
            "ego-network", "새 협업망에 ego network 전이하기", "중심 node에서 radius 이내 node와 induced edge를 반환한다.", "ego_network(edges, center, radius)를 완성하세요.", "def ego_network(edges, center, radius):\n    raise NotImplementedError",
            """def ego_network(edges, center, radius):
    adjacency = {}
    for a, b in edges:
        adjacency.setdefault(a, set()).add(b); adjacency.setdefault(b, set()).add(a)
    distance = {center: 0}; queue = [center]
    while queue:
        node = queue.pop(0)
        if distance[node] == radius: continue
        for neighbor in adjacency.get(node, []):
            if neighbor not in distance:
                distance[neighbor] = distance[node] + 1; queue.append(neighbor)
    selected = set(distance)
    kept = sorted([sorted([a, b]) for a, b in edges if a in selected and b in selected])
    return {"nodes": sorted(selected), "edges": kept}
""", "ego_network",
            [("keeps-induced-edges", [[['a', 'b'], ['b', 'c'], ['a', 'c'], ['c', 'd']], 'a', 1], {"nodes": ["a", "b", "c"], "edges": [["a", "b"], ["a", "c"], ["b", "c"]]}), ("keeps-center-alone", [[], 'x', 2], {"nodes": ["x"], "edges": []})],
            ["선택 node 사이의 모든 induced edge를 보존하세요.", "radius는 hop 거리입니다."],
        ),
        "retrieval": decision("social-analysis-scope", "소셜 분석 범위 회상하기", "추천·ego·privacy 질문을 구분한다.", "choose_social_scope", {"friend-candidate": {"method": "common neighbors", "evidence": "mutual count", "risk": "privacy inference"}, "local-context": {"method": "ego graph", "evidence": "radius and boundary", "risk": "missing outside structure"}, "influence-claim": {"method": "centrality plus validation", "evidence": "outcome correlation", "risk": "structural determinism"}}),
    },
    "06": {
        "mastery": T(
            "connected-components", "연결 component와 isolated node 찾기", "undirected graph의 모든 component를 크기·이름 순으로 반환한다.", "connected_components(nodes, edges)를 완성하세요.", "def connected_components(nodes, edges):\n    raise NotImplementedError",
            """def connected_components(nodes, edges):
    adjacency = {node: set() for node in nodes}
    for a, b in edges:
        adjacency[a].add(b); adjacency[b].add(a)
    remaining = set(nodes); components = []
    while remaining:
        start = min(remaining); seen = {start}; queue = [start]
        while queue:
            for neighbor in adjacency[queue.pop(0)]:
                if neighbor not in seen: seen.add(neighbor); queue.append(neighbor)
        remaining -= seen; components.append(sorted(seen))
    return sorted(components, key=lambda group: (-len(group), group))
""", "connected_components",
            [("finds-components-and-isolate", [["a", "b", "c", "d"], [["a", "b"], ["b", "c"]]], [["a", "b", "c"], ["d"]]), ("handles-empty", [[], []], [])],
            ["node 목록에서 isolated node를 잃지 마세요.", "component 순서를 안정화해 결과를 재현하세요."],
        ),
        "transfer": T(
            "bridge-impact", "새 인프라 graph에 bridge 영향 전이하기", "각 edge 제거 전후 component 수를 비교해 bridge를 찾는다.", "find_bridges(nodes, edges)를 완성하세요.", "def find_bridges(nodes, edges):\n    raise NotImplementedError",
            """def find_bridges(nodes, edges):
    def count_components(kept):
        adjacency = {node: set() for node in nodes}
        for a, b in kept: adjacency[a].add(b); adjacency[b].add(a)
        remaining = set(nodes); count = 0
        while remaining:
            count += 1; queue = [next(iter(remaining))]; seen = set(queue)
            while queue:
                for neighbor in adjacency[queue.pop()]:
                    if neighbor not in seen: seen.add(neighbor); queue.append(neighbor)
            remaining -= seen
        return count
    baseline = count_components(edges)
    bridges = []
    for index, edge in enumerate(edges):
        if count_components(edges[:index] + edges[index + 1:]) > baseline:
            bridges.append(sorted(edge))
    return sorted(bridges)
""", "find_bridges",
            [("finds-tail-bridge", [["a", "b", "c", "d"], [["a", "b"], ["b", "c"], ["c", "a"], ["c", "d"]]], [["c", "d"]]), ("finds-none-in-cycle", [["a", "b", "c"], [["a", "b"], ["b", "c"], ["c", "a"]]], [])],
            ["edge 하나를 제거하기 전후의 component 수를 비교하세요.", "bridge가 곧 실제 장애 원인이라는 주장은 별도 운영 증거가 필요합니다."],
        ),
        "retrieval": decision("connectivity-question", "연결성 질문 회상하기", "component·bridge·cut 질문을 구분한다.", "choose_connectivity", {"disconnected-groups": {"method": "connected components", "evidence": "component sizes", "risk": "missing nodes"}, "single-edge-failure": {"method": "bridges", "evidence": "component increase", "risk": "directed semantics"}, "single-node-failure": {"method": "articulation points", "evidence": "node removal impact", "risk": "capacity ignored"}}),
    },
    "07": {
        "mastery": T(
            "community-cut-score", "community 배정의 내부·외부 edge 점검하기", "주어진 label에서 within/cross edge와 비율을 계산한다.", "audit_communities(edges, labels)를 완성하세요.", "def audit_communities(edges, labels):\n    raise NotImplementedError",
            """def audit_communities(edges, labels):
    within = 0; cross = 0; missing = []
    for source, target in edges:
        if source not in labels or target not in labels:
            missing += [node for node in (source, target) if node not in labels]
        elif labels[source] == labels[target]: within += 1
        else: cross += 1
    total = within + cross
    return {"within": within, "cross": cross, "withinRatio": 0.0 if not total else round(within / total, 3), "missing": sorted(set(missing))}
""", "audit_communities",
            [("measures-community-cut", [[['a', 'b'], ['b', 'c'], ['c', 'd']], {"a": 1, "b": 1, "c": 2, "d": 2}], {"within": 2, "cross": 1, "withinRatio": 0.667, "missing": []}), ("reports-missing-label", [[['a', 'b']], {"a": 1}], {"within": 0, "cross": 0, "withinRatio": 0.0, "missing": ["b"]})],
            ["모든 edge endpoint에 community label이 있어야 합니다.", "within ratio만으로 최적 community를 증명하지 마세요."],
        ),
        "transfer": T(
            "label-propagation-step", "새 graph에 label propagation 한 단계 전이하기", "각 node가 이웃 label 빈도와 tie-breaker로 다음 label을 선택한다.", "propagate_labels(nodes, edges, labels)를 완성하세요.", "def propagate_labels(nodes, edges, labels):\n    raise NotImplementedError",
            """def propagate_labels(nodes, edges, labels):
    adjacency = {node: set() for node in nodes}
    for a, b in edges: adjacency[a].add(b); adjacency[b].add(a)
    result = {}
    for node in nodes:
        counts = {}
        for neighbor in adjacency[node]:
            label = labels[neighbor]; counts[label] = counts.get(label, 0) + 1
        result[node] = labels[node] if not counts else sorted(counts, key=lambda label: (-counts[label], str(label)))[0]
    return {node: result[node] for node in sorted(result)}
""", "propagate_labels",
            [("propagates-majority-label", [["a", "b", "c"], [["a", "b"], ["a", "c"]], {"a": 1, "b": 2, "c": 2}], {"a": 2, "b": 1, "c": 1}), ("keeps-isolate-label", [["x"], [], {"x": 7}], {"x": 7})],
            ["동시 update를 위해 원래 label만 읽으세요.", "tie-breaker를 고정해 재현 가능하게 만드세요."],
        ),
        "retrieval": decision("community-validation", "community 탐지 검증 회상하기", "탐지와 해석의 증거를 분리한다.", "choose_community_check", {"dense-groups": {"method": "modularity or cut audit", "evidence": "within and cross edges", "risk": "resolution limit"}, "stable-segments": {"method": "rerun stability", "evidence": "agreement across seeds", "risk": "one random result"}, "named-meaning": {"method": "external attributes", "evidence": "post-hoc profile", "risk": "stereotyping"}}),
    },
    "08": {
        "mastery": T(
            "bfs-traversal", "BFS 탐색 순서와 거리 만들기", "시작 node에서 안정적 BFS order와 hop distance를 반환한다.", "bfs_traversal(edges, start)를 완성하세요.", "def bfs_traversal(edges, start):\n    raise NotImplementedError",
            """def bfs_traversal(edges, start):
    adjacency = {}
    for a, b in edges: adjacency.setdefault(a, set()).add(b); adjacency.setdefault(b, set()).add(a)
    order = []; distance = {start: 0}; queue = [start]
    while queue:
        node = queue.pop(0); order.append(node)
        for neighbor in sorted(adjacency.get(node, [])):
            if neighbor not in distance: distance[neighbor] = distance[node] + 1; queue.append(neighbor)
    return {"order": order, "distance": {node: distance[node] for node in sorted(distance)}}
""", "bfs_traversal",
            [("returns-order-and-distance", [[['a', 'b'], ['a', 'c'], ['b', 'd']], 'a'], {"order": ["a", "b", "c", "d"], "distance": {"a": 0, "b": 1, "c": 1, "d": 2}}), ("handles-isolated-start", [[], 'x'], {"order": ["x"], "distance": {"x": 0}})],
            ["queue에 넣을 때 visited를 표시해 중복 삽입을 막으세요.", "이웃 순서를 정렬해 traversal을 재현하세요."],
        ),
        "transfer": T(
            "topological-order", "새 dependency graph에 위상 정렬 전이하기", "directed acyclic graph의 실행 순서와 cycle node를 반환한다.", "topological_order(nodes, edges)를 완성하세요.", "def topological_order(nodes, edges):\n    raise NotImplementedError",
            """def topological_order(nodes, edges):
    outgoing = {node: [] for node in nodes}; indegree = {node: 0 for node in nodes}
    for source, target in edges: outgoing[source].append(target); indegree[target] += 1
    ready = sorted(node for node in nodes if indegree[node] == 0); order = []
    while ready:
        node = ready.pop(0); order.append(node)
        for target in sorted(outgoing[node]):
            indegree[target] -= 1
            if indegree[target] == 0: ready.append(target); ready.sort()
    cycle = sorted(node for node in nodes if indegree[node] > 0)
    return {"order": order, "cycleNodes": cycle}
""", "topological_order",
            [("orders-dependencies", [["build", "test", "deploy"], [["build", "test"], ["test", "deploy"]]], {"order": ["build", "test", "deploy"], "cycleNodes": []}), ("reports-cycle", [["a", "b"], [["a", "b"], ["b", "a"]]], {"order": [], "cycleNodes": ["a", "b"]})],
            ["indegree 0 node만 ready queue에 넣으세요.", "cycle이 있으면 부분 순서를 완료로 보지 마세요."],
        ),
        "retrieval": decision("graph-algorithm-choice", "graph 알고리즘 선택 회상하기", "탐색·순서·경로 질문을 구분한다.", "choose_graph_algorithm", {"layers-from-source": {"method": "BFS", "evidence": "hop distance", "risk": "weighted edges"}, "dependency-order": {"method": "topological sort", "evidence": "DAG and indegree", "risk": "cycle"}, "visit-deep-branch": {"method": "DFS", "evidence": "discovery tree", "risk": "recursion depth"}}),
    },
    "09": {
        "mastery": T(
            "random-model-expectation", "랜덤 graph 모델의 기대 통계 계산하기", "Erdos-Renyi n,p의 기대 edge 수와 평균 degree를 계산한다.", "er_expectation(n, probability)를 완성하세요.", "def er_expectation(n, probability):\n    raise NotImplementedError",
            """def er_expectation(n, probability):
    if n < 0 or not 0 <= probability <= 1:
        raise ValueError("invalid model parameters")
    expected_edges = n * (n - 1) / 2 * probability
    return {"expectedEdges": round(expected_edges, 3), "expectedMeanDegree": round(max(0, n - 1) * probability, 3)}
""", "er_expectation",
            [("computes-er-expectation", [5, 0.5], {"expectedEdges": 5.0, "expectedMeanDegree": 2.0}), ("handles-empty-model", [0, 0.7], {"expectedEdges": 0.0, "expectedMeanDegree": 0.0}), ("rejects-probability", [3, 1.1], E("ValueError"))],
            ["undirected 가능한 edge 수는 n(n-1)/2입니다.", "기대값은 한 번 생성한 graph의 실제값과 다를 수 있습니다."],
        ),
        "transfer": T(
            "degree-model-gap", "새 관측 graph와 random baseline 비교하기", "관측 평균 degree와 model 기대값의 차이를 계산한다.", "compare_degree_baseline(node_count, edge_count, probability)를 완성하세요.", "def compare_degree_baseline(node_count, edge_count, probability):\n    raise NotImplementedError",
            """def compare_degree_baseline(node_count, edge_count, probability):
    if node_count < 0 or edge_count < 0 or not 0 <= probability <= 1:
        raise ValueError("invalid graph summary")
    observed = 0.0 if node_count == 0 else 2 * edge_count / node_count
    expected = max(0, node_count - 1) * probability
    return {"observedMeanDegree": round(observed, 3), "expectedMeanDegree": round(expected, 3), "gap": round(observed - expected, 3)}
""", "compare_degree_baseline",
            [("compares-to-baseline", [10, 20, 0.2], {"observedMeanDegree": 4.0, "expectedMeanDegree": 1.8, "gap": 2.2}), ("handles-zero-nodes", [0, 0, 0.5], {"observedMeanDegree": 0.0, "expectedMeanDegree": 0.0, "gap": 0.0}), ("rejects-negative-edge", [2, -1, 0.2], E("ValueError"))],
            ["undirected 평균 degree는 2m/n입니다.", "한 summary gap만으로 생성 모델을 확정하지 마세요."],
        ),
        "retrieval": decision("random-graph-model", "랜덤 graph 모델 회상하기", "baseline 생성 가정과 실제 구조를 구분한다.", "choose_random_model", {"independent-edges": {"method": "Erdos-Renyi", "evidence": "n and p", "risk": "no clustering"}, "fixed-degree-sequence": {"method": "configuration model", "evidence": "degree distribution", "risk": "parallel edges"}, "preferential-growth": {"method": "Barabasi-Albert", "evidence": "growth process", "risk": "mechanism overclaim"}}),
    },
    "10": {
        "mastery": T(
            "network-risk-report", "network project 위험 보고서 만들기", "component, isolate, degree, bridge를 한 구조 보고서로 통합한다.", "network_risk_report(nodes, edges)를 완성하세요.", "def network_risk_report(nodes, edges):\n    raise NotImplementedError",
            """def network_risk_report(nodes, edges):
    adjacency = {node: set() for node in nodes}
    for a, b in edges: adjacency[a].add(b); adjacency[b].add(a)
    isolates = sorted(node for node in nodes if not adjacency[node])
    remaining = set(nodes); sizes = []
    while remaining:
        queue = [next(iter(remaining))]; seen = set(queue)
        while queue:
            for neighbor in adjacency[queue.pop()]:
                if neighbor not in seen: seen.add(neighbor); queue.append(neighbor)
        remaining -= seen; sizes.append(len(seen))
    degrees = {node: len(adjacency[node]) for node in nodes}
    hubs = sorted(node for node in nodes if degrees[node] == max(degrees.values(), default=0) and degrees[node] > 0)
    return {"nodeCount": len(nodes), "edgeCount": len(edges), "componentSizes": sorted(sizes, reverse=True), "isolates": isolates, "maxDegreeNodes": hubs}
""", "network_risk_report",
            [("summarizes-structure", [["a", "b", "c", "d"], [["a", "b"], ["b", "c"]]], {"nodeCount": 4, "edgeCount": 2, "componentSizes": [3, 1], "isolates": ["d"], "maxDegreeNodes": ["b"]}), ("handles-empty", [[], []], {"nodeCount": 0, "edgeCount": 0, "componentSizes": [], "isolates": [], "maxDegreeNodes": []})],
            ["한 지표 대신 연결성·고립·hub를 함께 보고하세요.", "구조 위험과 실제 장애 기록을 구분하세요."],
        ),
        "transfer": T(
            "resilience-plan", "새 서비스 network에 복원력 설계 전이하기", "node 역할과 단일 실패 여부를 바탕으로 우선 보강 대상을 정렬한다.", "prioritize_resilience(nodes)를 완성하세요.", "def prioritize_resilience(nodes):\n    raise NotImplementedError",
            """def prioritize_resilience(nodes):
    result = []
    for node in nodes:
        score = node.get("dependents", 0) * 2 + int(node.get("singlePoint", False)) * 5 - node.get("redundancy", 0)
        action = "add redundancy" if node.get("singlePoint", False) else "monitor" if score > 2 else "accept"
        result.append({"node": node["id"], "score": score, "action": action})
    return sorted(result, key=lambda row: (-row["score"], row["node"]))
""", "prioritize_resilience",
            [("prioritizes-single-point", [[{"id": "db", "dependents": 3, "singlePoint": True, "redundancy": 0}, {"id": "cache", "dependents": 2, "singlePoint": False, "redundancy": 1}]], [{"node": "db", "score": 11, "action": "add redundancy"}, {"node": "cache", "score": 3, "action": "monitor"}]), ("accepts-low-risk", [[{"id": "x", "dependents": 1, "singlePoint": False, "redundancy": 2}]], [{"node": "x", "score": 0, "action": "accept"}])],
            ["우선순위 공식과 입력 필드를 공개하세요.", "구조 score는 운영 영향 검토를 대체하지 않습니다."],
        ),
        "retrieval": decision("network-project-evidence", "network project 증거 회상하기", "구조·모델·운영 결론의 증거를 구분한다.", "choose_network_evidence", {"structural-summary": {"method": "components centrality bridges", "evidence": "graph snapshot hash", "risk": "stale topology"}, "model-comparison": {"method": "baseline distribution", "evidence": "multiple simulations", "risk": "single seed"}, "operational-action": {"method": "structure plus incident data", "evidence": "validated impact", "risk": "centrality-only decision"}}),
    },
}
