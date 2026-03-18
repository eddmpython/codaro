# NetworkX 카테고리 PRD

## 개요
NetworkX는 그래프(네트워크) 구조를 생성하고 분석하는 라이브러리입니다.
노드(점)와 엣지(선)로 구성된 네트워크를 다룹니다. 소셜 네트워크, 교통망, 웹 링크 등을 모델링합니다.

## 데이터 특성
- **데이터셋 불필요**: 그래프 생성 함수로 네트워크 직접 생성
- **내장 그래프**: nx.karate_club_graph(), nx.les_miserables_graph() 등 제공
- **생성기 함수**: nx.complete_graph(), nx.path_graph(), nx.random_graph() 등

## Pyodide 환경
- NetworkX는 순수 파이썬으로 pyodide에서 완벽 지원
- matplotlib과 연동하여 그래프 시각화 가능
- 대규모 그래프는 성능 고려 필요

## 핵심 개념 (A-L, 12개)

| ID | 개념 | 설명 |
|----|------|------|
| A | 그래프 생성 | Graph(), DiGraph(), 노드/엣지 추가 |
| B | 기본 속성 | nodes(), edges(), degree(), neighbors() |
| C | 그래프 유형 | 무방향, 방향, 가중치, 다중 그래프 |
| D | 시각화 | nx.draw(), spring_layout, matplotlib 연동 |
| E | 경로 탐색 | shortest_path(), has_path(), all_paths() |
| F | 중심성 | degree_centrality, betweenness, closeness, pagerank |
| G | 클러스터링 | clustering, transitivity, triangles |
| H | 연결성 | is_connected, connected_components, bridges |
| I | 커뮤니티 | 모듈성, 커뮤니티 탐지, 분할 |
| J | 그래프 알고리즘 | BFS, DFS, 최소신장트리, 위상정렬 |
| K | 속성 관리 | 노드/엣지 속성, 가중치, 레이블 |
| L | 그래프 생성기 | 랜덤 그래프, 소셜 네트워크 모델 |

## 10개 프로젝트

### 01_첫그래프만들기 (입문) ⭐
**목표**: 그래프를 생성하고 노드/엣지를 추가하여 시각화하기
**개념**: A(그래프 생성), B(기본 속성), D(시각화)
**내용**:
- Graph() 생성
- add_node(), add_edge() 사용
- nodes(), edges() 조회
- nx.draw()로 시각화
- 간단한 친구 관계 네트워크 만들기

### 02_방향그래프와가중치 (입문) ⭐
**목표**: 방향 그래프와 가중치 그래프 만들기
**개념**: A, B, D + C(그래프 유형), K(속성 관리)
**내용**:
- DiGraph() 방향 그래프
- 엣지 가중치 추가
- 노드/엣지 속성 관리
- 도로 네트워크 모델링

### 03_최단경로찾기 (기초) ⭐⭐
**목표**: 두 노드 사이 최단 경로 찾기
**개념**: A, B, C, D, K + E(경로 탐색)
**내용**:
- shortest_path() 사용
- shortest_path_length()
- has_path() 확인
- 가중치 기반 최단 경로 (다익스트라)
- 지하철 노선도 경로 찾기

### 04_중심성분석 (기초) ⭐⭐
**목표**: 네트워크에서 중요한 노드 찾기
**개념**: A, B, C, D, K + F(중심성)
**내용**:
- degree_centrality 연결 중심성
- betweenness_centrality 매개 중심성
- closeness_centrality 근접 중심성
- 가장 영향력 있는 사람 찾기

### 05_소셜네트워크분석 (기초) ⭐⭐
**목표**: 가라테 클럽 네트워크 분석하기
**개념**: A, B, C, D, E, F + G(클러스터링)
**내용**:
- karate_club_graph() 사용
- 클러스터링 계수
- transitivity 삼각형 비율
- 소셜 네트워크 구조 분석

### 06_연결성분석 (중급) ⭐⭐⭐
**목표**: 네트워크의 연결 구조 분석
**개념**: A, B, C, D, F, G + H(연결성)
**내용**:
- is_connected() 연결 확인
- connected_components() 컴포넌트 추출
- bridges() 다리 찾기
- 네트워크 취약점 분석

### 07_커뮤니티탐지 (중급) ⭐⭐⭐
**목표**: 그래프에서 커뮤니티(그룹) 찾기
**개념**: A, B, C, D, F, G, H + I(커뮤니티)
**내용**:
- 레미제라블 네트워크
- 그리디 모듈성 최적화
- 커뮤니티별 시각화
- 그룹 구조 분석

### 08_그래프알고리즘 (중급) ⭐⭐⭐
**목표**: BFS, DFS, 최소신장트리 구현
**개념**: A, B, C, D, E, K + J(그래프 알고리즘)
**내용**:
- bfs_edges(), dfs_edges()
- minimum_spanning_tree()
- topological_sort() (DAG)
- 네트워크 탐색 시각화

### 09_랜덤그래프모델 (심화) ⭐⭐⭐⭐
**목표**: 다양한 랜덤 그래프 생성과 특성 분석
**개념**: A, B, C, D, F, G, H + L(그래프 생성기)
**내용**:
- erdos_renyi_graph() 랜덤 그래프
- barabasi_albert_graph() 척도없는 네트워크
- watts_strogatz_graph() 스몰월드
- 네트워크 모델 비교

### 10_종합네트워크프로젝트 (심화) ⭐⭐⭐⭐
**목표**: 실제 네트워크 데이터 종합 분석
**개념**: A-L 모든 개념 종합
**내용**:
- 전체 분석 파이프라인
- 중심성 + 커뮤니티 + 경로 분석
- 인사이트 도출
- 네트워크 시각화 대시보드

## 개념 분포표

| 개념 | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 | 합계 |
|------|----|----|----|----|----|----|----|----|----|----|------|
| A 그래프생성 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 10 |
| B 기본속성 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 10 |
| C 그래프유형 |   | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 9 |
| D 시각화 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 10 |
| E 경로탐색 |   |   | ✓ |   | ✓ |   |   | ✓ |   | ✓ | 4 |
| F 중심성 |   |   |   | ✓ | ✓ | ✓ | ✓ |   | ✓ | ✓ | 6 |
| G 클러스터링 |   |   |   |   | ✓ | ✓ | ✓ |   | ✓ | ✓ | 5 |
| H 연결성 |   |   |   |   |   | ✓ | ✓ |   | ✓ | ✓ | 4 |
| I 커뮤니티 |   |   |   |   |   |   | ✓ |   |   | ✓ | 2 |
| J 알고리즘 |   |   |   |   |   |   |   | ✓ |   | ✓ | 2 |
| K 속성관리 |   | ✓ | ✓ | ✓ |   |   |   | ✓ |   | ✓ | 5 |
| L 생성기 |   |   |   |   |   |   |   |   | ✓ | ✓ | 2 |

## 변수명 규칙

### 그래프 변수
- 기본: `G`, `graph`, `net`
- 방향: `dg`, `digraph`
- 특수: `social`, `road`, `web`
- 미션별: `G1`, `G2`, `netA`, `netB`

### 노드/엣지
- 노드 리스트: `nodes`, `nodeList`, `friends`
- 엣지 리스트: `edges`, `edgeList`, `links`
- 경로: `path`, `route`, `shortPath`

### 분석 결과
- 중심성: `cent`, `degCent`, `betCent`
- 클러스터링: `clust`, `trans`
- 컴포넌트: `comps`, `groups`

### 시각화
- Figure: `fig`, `figGraph`, `figNet`
- 레이아웃: `pos`, `layout`, `coords`

## 내장 데이터셋

NetworkX 내장 그래프 활용:
- `nx.karate_club_graph()` - 가라테 클럽 소셜 네트워크 (34명)
- `nx.les_miserables_graph()` - 레미제라블 등장인물 네트워크 (77명)
- `nx.florentine_families_graph()` - 피렌체 가문 관계 (15가문)
- `nx.davis_southern_women_graph()` - 사회학 연구 데이터

## 프로젝트 구조

각 프로젝트는 다음 구조를 따름:
1. 라이브러리 import
2. 그래프 생성 또는 로드
3. 그래프 탐색 및 분석
4. 시각화
5. 인사이트 도출
6. 실습 미션 2개

## 시각화 가이드

```python
import networkx as nx
import matplotlib.pyplot as plt

G = nx.karate_club_graph()
pos = nx.spring_layout(G, seed=42)

fig, ax = plt.subplots(figsize=(10, 8))
nx.draw(G, pos, ax=ax, with_labels=True, node_color='skyblue',
        node_size=500, font_size=10, edge_color='gray')
ax.set_title('Network Visualization')
fig
```

## 특이사항

- 데이터셋 로드 대신 그래프 생성 함수 사용
- matplotlib 기반 시각화 (pyodide 호환)
- print() 대신 표현식 반환
- 모든 변수명 camelCase 엄수
- 파일 내 변수 중복 절대 금지
