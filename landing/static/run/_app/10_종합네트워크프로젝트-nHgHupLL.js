var e=`meta:
  packages:
  - matplotlib
  - networkx
  id: networkx_10
  title: 종합네트워크프로젝트
  order: 10
  category: networkx
  difficulty: ⭐⭐⭐⭐
  badge: 심화
  tags:
  - networkx
  - 종합
  - 분석
  - 시각화
  - 대시보드
  seo:
    title: NetworkX 종합 프로젝트 - 네트워크 분석 대시보드
    description: NetworkX로 종합 네트워크 분석을 수행합니다. 모든 개념을 통합하여 분석 파이프라인을 구축합니다.
    keywords:
    - networkx
    - 종합
    - 분석
    - 시각화
    - 대시보드
    - 파이프라인
intro:
  emoji: 🎓
  goal: 지금까지 배운 모든 개념을 활용하여 종합 네트워크 분석을 수행합니다.
  description: 이 프로젝트에서는 레미제라블 네트워크를 완전히 분석합니다. 기본 통계, 중심성, 경로, 클러스터링, 커뮤니티, 연결성을 모두 분석하고 종합 시각화합니다. 분석
    파이프라인을 구축하여 어떤 네트워크에도 적용할 수 있게 합니다.
  direction: 종합네트워크프로젝트에서 노드와 엣지를 모델링하고 경로, 중심성, 연결 구조를 검증합니다.
  benefits:
  - 관계 데이터 확인 후 그래프 알고리즘에 맞는 코드 입력을 고릅니다.
  - 종합네트워크프로젝트 결과를 노드/엣지와 지표 값 기준으로 즉시 점검합니다.
  - 완료한 코드를 관계 분석 리포트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(관계 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 로드 처리 실행
      detail: 그래프 알고리즘 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 기본 통계 결과 검증
      detail: 노드/엣지와 지표 값 기준으로 실행 결과를 비교합니다.
    - label: 종합네트워크프로젝트 재사용
      detail: 완성 코드를 관계 분석 리포트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 그래프 분석 환경
      detail: matplotlib, networkx 기준으로 로컬 Python 실행을 준비합니다.
    - label: 종합네트워크프로젝트 실행
      detail: 셀을 실행해 노드/엣지와 지표 값와 예외 상태를 확인합니다.
    - label: 종합네트워크프로젝트 완료
      detail: 검증된 코드를 관계 분석 리포트로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: 종합 분석에 필요한 모든 라이브러리를 불러옵니다. 이 프로젝트에서는 지금까지 배운 NetworkX의 모든 기능을 활용합니다. 기본 통계, 중심성 분석, 경로
    분석, 클러스터링, 커뮤니티 탐지, 연결성 분석을 통합하여 하나의 네트워크를 완전히 분석하는 파이프라인을 구축합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import networkx as nx
    from networkx.algorithms import community
    import matplotlib.pyplot as plt
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      import networkx as nx
      from networkx.algorithms import community
      import matplotlib.pyplot as plt
    hints:
    - 바꿀 지점은 관계 데이터을 만드는 첫 줄과 그래프 알고리즘 줄에서 찾으세요.
    - 실행 뒤 노드/엣지와 지표 값 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 노드/엣지와 지표 값 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step2_load_data
  title: 2단계. 데이터 로드
  structuredPrimary: true
  subtitle: 레미제라블 네트워크
  goal: 2단계. 데이터 로드에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    Victor Hugo의 소설 '레미제라블'에 등장하는 인물들의 관계 네트워크를 로드합니다. 77명의 인물과 254개의 관계로 구성되며, 엣지의 weight 속성은 두 인물이 같은 장면에 함께 등장한 횟수를 나타냅니다. 이 데이터셋은 규모가 적당하면서도 풍부한 구조를 가지고 있어 네트워크 분석 학습에 이상적입니다.

    레미제라블 네트워크는 77명의 등장인물과 254개의 관계로 구성됩니다. 엣지의 weight는 함께 등장한 횟수입니다.
  snippet: |-
    G = nx.les_miserables_graph()
    numNodes = G.number_of_nodes()
    numEdges = G.number_of_edges()
    numNodes, numEdges
  exercise:
    prompt: 2단계. 데이터 로드 예제에서 \`G\`, \`numNodes\`, \`numEdges\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      G = nx.les_miserables_graph()
      numNodes = G.number_of_nodes()
      numEdges = G.number_of_edges()
      numNodes, numEdges
    hints:
    - 바꿀 지점은 \`G = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`G\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 2단계. 데이터 로드에서 \`G\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 2단계. 데이터 로드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step3_basic_stats
  title: 3단계. 기본 통계
  structuredPrimary: true
  subtitle: 네트워크 개요
  goal: 3단계. 기본 통계에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: 네트워크의 기본 통계량을 계산합니다. 밀도는 전체 가능한 연결 중 실제 연결의 비율, 평균 차수는 인물당 평균 관계 수, 지름은 가장 먼 두 인물 사이의 거리,
    클러스터링은 친구의 친구가 친구인 정도를 나타냅니다. 이 지표들로 네트워크의 전반적인 특성을 파악합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    density = nx.density(G)
    degrees = [d for n, d in G.degree()]
    avgDegree = sum(degrees) / len(degrees)
    minDeg = min(degrees)
    maxDeg = max(degrees)
    density, avgDegree, minDeg, maxDeg
  exercise:
    prompt: 3단계. 기본 통계 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      density = nx.density(G)
      degrees = [d for n, d in G.degree()]
      avgDegree = sum(degrees) / len(degrees)
      minDeg = min(degrees)
      maxDeg = max(degrees)
      density, avgDegree, minDeg, maxDeg
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 3단계. 기본 통계의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 3단계. 기본 통계 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step4_centrality
  title: 4단계. 중심성 분석
  structuredPrimary: true
  subtitle: 주요 인물 찾기
  goal: 4단계. 중심성 분석에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 다양한 중심성 지표로 소설의 핵심 인물들을 찾습니다. 연결 중심성은 가장 많은 인물과 관계를 가진 사람, 매개 중심성은 서로 다른 그룹을 연결하는 중요한 위치의
    인물, 근접 중심성은 모든 인물에게 빠르게 도달할 수 있는 중앙에 위치한 인물, 고유벡터 중심성은 중요한 인물들과 연결된 인물을 찾아냅니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    degCent = nx.degree_centrality(G)
    betCent = nx.betweenness_centrality(G)
    closeCent = nx.closeness_centrality(G)
    eigCent = nx.eigenvector_centrality(G)
  exercise:
    prompt: 4단계. 중심성 분석 예제에서 \`degCent\`, \`betCent\`, \`closeCent\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      degCent = nx.degree_centrality(G)
      betCent = nx.betweenness_centrality(G)
      closeCent = nx.closeness_centrality(G)
      eigCent = nx.eigenvector_centrality(G)
    hints:
    - 바꿀 지점은 \`degCent = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`degCent\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 4단계. 중심성 분석에서 \`degCent\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 4단계. 중심성 분석 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step5_community
  title: 5단계. 커뮤니티 탐지
  structuredPrimary: true
  subtitle: 그룹 발견
  goal: 5단계. 커뮤니티 탐지에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: 커뮤니티 탐지 알고리즘으로 등장인물 그룹을 찾습니다. 소설에서 함께 등장하는 인물들은 자연스럽게 스토리라인별로 그룹을 형성합니다. 알고리즘이 발견한 커뮤니티가
    소설의 실제 스토리 구조와 어떻게 일치하는지 확인할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    communities = community.louvain_communities(G, seed=42)
    commList = [set(c) for c in communities]
    numComms = len(commList)
    numComms
  exercise:
    prompt: 5단계. 커뮤니티 탐지 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      communities = community.louvain_communities(G, seed=42)
      commList = [set(c) for c in communities]
      numComms = len(commList)
      numComms
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 5단계. 커뮤니티 탐지의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 5단계. 커뮤니티 탐지 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step6_path_analysis
  title: 6단계. 경로 분석
  structuredPrimary: true
  subtitle: 주요 인물 간 거리
  goal: 6단계. 경로 분석에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: 주요 등장인물 사이의 최단 경로를 분석합니다. 중심성이 높은 주요 인물들 간의 거리 행렬을 계산하면 소설의 인물 관계 구조를 이해할 수 있습니다. 장발장과
    미리엘 주교, 코제트와 마리우스 등 중요한 인물들이 어떻게 연결되어 있는지 경로를 추적합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    mainChars = [n for n, v in sorted(degCent.items(), key=lambda x: x[1], reverse=True)[:5]]
    mainChars
  exercise:
    prompt: 6단계. 경로 분석 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      mainChars = [n for n, v in sorted(degCent.items(), key=lambda x: x[1], reverse=True)[:5]]
      mainChars
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 6단계. 경로 분석의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 6단계. 경로 분석 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step7_connectivity
  title: 7단계. 연결성 분석
  structuredPrimary: true
  subtitle: 네트워크 구조
  goal: 7단계. 연결성 분석에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    네트워크의 연결 구조와 취약점을 분석합니다. 노드 연결도는 네트워크를 분리하기 위해 제거해야 하는 최소 노드 수, 엣지 연결도는 최소 엣지 수를 나타냅니다. 절단점(articulation point)은 제거 시 네트워크가 분리되는 중요 노드입니다. 소설에서 이 절단점들이 어떤 역할을 하는지 분석합니다.

    절단점이 많다는 것은 네트워크가 특정 노드에 의존적임을 의미합니다.
  snippet: |-
    nodeConn = nx.node_connectivity(G)
    edgeConn = nx.edge_connectivity(G)
    nodeConn, edgeConn
  exercise:
    prompt: 7단계. 연결성 분석 예제에서 \`nodeConn\`, \`edgeConn\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      nodeConn = nx.node_connectivity(G)
      edgeConn = nx.edge_connectivity(G)
      nodeConn, edgeConn
    hints:
    - 바꿀 지점은 \`nodeConn = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`nodeConn\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 7단계. 연결성 분석에서 \`nodeConn\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 7단계. 연결성 분석 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step8_visualization
  title: 8단계. 종합 시각화
  structuredPrimary: true
  subtitle: 대시보드
  goal: 8단계. 종합 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 분석 결과를 종합하여 다중 패널 대시보드를 생성합니다. 커뮤니티+연결중심성, 커뮤니티+매개중심성, 클러스터링 계수, 차수 분포의 네 가지 뷰를 하나의 그림에
    배치합니다. 이런 종합 시각화는 네트워크의 다양한 측면을 한눈에 파악할 수 있게 해줍니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: pos = nx.spring_layout(G, seed=42, k=0.5)
  exercise:
    prompt: 8단계. 종합 시각화 예제에서 \`pos\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: pos = nx.spring_layout(G, seed=42, k=0.5)
    hints:
    - 바꿀 지점은 \`pos = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`pos\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 8단계. 종합 시각화에서 \`pos\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 8단계. 종합 시각화 실행 뒤 \`pos\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step9_summary_report
  title: 9단계. 분석 리포트
  structuredPrimary: true
  subtitle: 결과 정리
  goal: 9단계. 분석 리포트에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 분석 결과를 정리하여 리포트를 생성합니다. 데이터 분석에서 리포트는 단순한 결과 나열이 아니라, 발견한 패턴과 인사이트를 체계적으로 전달하는 중요한 산출물입니다.
    네트워크 분석 리포트에는 기본 통계, 구조적 특성, 핵심 노드, 커뮤니티 정보를 포함합니다. Python의 딕셔너리를 활용하면 계층적이고 구조화된 리포트를 쉽게 만들 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    diameter = nx.diameter(G)
    avgPath = nx.average_shortest_path_length(G)
    avgClustering = nx.average_clustering(G)
    transitivity = nx.transitivity(G)
    modularity = nx.community.modularity(G, commList)
    artPoints = list(nx.articulation_points(G))
    bridges = list(nx.bridges(G))

    report = {
        'Basic Stats': {
            'Nodes': numNodes,
            'Edges': numEdges,
            'Density': round(density, 4),
            'Average Degree': round(avgDegree, 2),
            'Diameter': diameter,
            'Average Path Length': round(avgPath, 2)
        },
        'Clustering': {
            'Average Clustering': round(avgClustering, 3),
            'Transitivity': round(transitivity, 3)
        },
        'Community': {
            'Number of Communities': numComms,
            'Modularity': round(modularity, 3)
        },
        'Connectivity': {
            'Node Connectivity': nodeConn,
            'Edge Connectivity': edgeConn,
            'Articulation Points': len(artPoints),
            'Bridges': len(bridges)
        }
    }
    report
  exercise:
    prompt: 9단계. 분석 리포트 예제에서 \`report\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      diameter = nx.diameter(G)
      avgPath = nx.average_shortest_path_length(G)
      avgClustering = nx.average_clustering(G)
      transitivity = nx.transitivity(G)
      modularity = nx.community.modularity(G, commList)
      artPoints = list(nx.articulation_points(G))
      bridges = list(nx.bridges(G))

      report = {
          'Basic Stats': {
              'Nodes': numNodes,
              'Edges': numEdges,
              'Density': round(density, 4),
              'Average Degree': round(avgDegree, 2),
              'Diameter': diameter,
              'Average Path Length': round(avgPath, 2)
          },
          'Clustering': {
              'Average Clustering': round(avgClustering, 3),
              'Transitivity': round(transitivity, 3)
          },
          'Community': {
              'Number of Communities': numComms,
              'Modularity': round(modularity, 3)
          },
          'Connectivity': {
              'Node Connectivity': nodeConn,
              'Edge Connectivity': edgeConn,
              'Articulation Points': len(artPoints),
              'Bridges': len(bridges)
          }
      }
      report
    hints:
    - 바꿀 지점은 \`report = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`report\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 9단계. 분석 리포트에서 \`report\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 9단계. 분석 리포트 실행 뒤 \`report\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step10_function
  title: 10단계. 재사용 함수
  structuredPrimary: true
  subtitle: 분석 파이프라인
  goal: 10단계. 재사용 함수에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.
  explanation: 분석 과정을 함수로 정리하여 어떤 네트워크에도 적용할 수 있게 합니다. 소프트웨어 공학에서 반복되는 작업을 함수화하는 것은 재사용성, 유지보수성, 일관성을
    높이는 핵심 원칙입니다. 네트워크 분석 함수를 만들어두면 새로운 데이터셋에 동일한 분석을 즉시 적용할 수 있습니다. 가라테 클럽과 레미제라블 네트워크를 비교 분석하며 함수의 활용법을
    익힙니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    def analyzeNetwork(graph):
        result = {}

        result['nodes'] = graph.number_of_nodes()
        result['edges'] = graph.number_of_edges()
        result['density'] = round(nx.density(graph), 4)

        degs = [d for n, d in graph.degree()]
        result['avgDegree'] = round(sum(degs) / len(degs), 2)

        result['avgClustering'] = round(nx.average_clustering(graph), 3)

        if nx.is_connected(graph):
            result['avgPath'] = round(nx.average_shortest_path_length(graph), 2)
            result['diameter'] = nx.diameter(graph)
        else:
            result['avgPath'] = None
            result['diameter'] = None

        comms = community.louvain_communities(graph, seed=42)
        result['numCommunities'] = len(comms)
        result['modularity'] = round(nx.community.modularity(graph, comms), 3)

        degCentG = nx.degree_centrality(graph)
        result['topNode'] = max(degCentG, key=degCentG.get)

        return result

    analyzeNetwork(G)
  exercise:
    prompt: 10단계. 재사용 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.
    starterCode: |-
      def analyzeNetwork(graph):
          result = {}

          result['nodes'] = graph.number_of_nodes()
          result['edges'] = graph.number_of_edges()
          result['density'] = round(nx.density(graph), 4)

          degs = [d for n, d in graph.degree()]
          result['avgDegree'] = round(sum(degs) / len(degs), 2)

          result['avgClustering'] = round(nx.average_clustering(graph), 3)

          if nx.is_connected(graph):
              result['avgPath'] = round(nx.average_shortest_path_length(graph), 2)
              result['diameter'] = nx.diameter(graph)
          else:
              result['avgPath'] = None
              result['diameter'] = None

          comms = community.louvain_communities(graph, seed=42)
          result['numCommunities'] = len(comms)
          result['modularity'] = round(nx.community.modularity(graph, comms), 3)

          degCentG = nx.degree_centrality(graph)
          result['topNode'] = max(degCentG, key=degCentG.get)

          return result

      analyzeNetwork(G)
    hints:
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.
  check:
    noError: 10단계. 재사용 함수의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.
    resultCheck: 10단계. 재사용 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 종합 분석
  goal: 실습에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    지금까지 배운 내용을 활용하여 미션을 수행해봅시다. 미션1에서는 르네상스 시대 피렌체 주요 가문들의 정치적 혼인 관계를 분석합니다. 이 데이터는 사회학 연구의 고전으로, 메디치 가문이 어떻게 네트워크 중심에서 권력을 장악했는지 보여줍니다. 미션2에서는 실제 네트워크와 랜덤 그래프 모델을 비교하여 어떤 모델이 현실을 가장 잘 설명하는지 분석합니다.

    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.
  snippet: |-
    import networkx as nx
    from networkx.algorithms import community
    import matplotlib.pyplot as plt

    data = nx.florentine_families_graph()
    numN = data.number_of_nodes()
    numE = data.number_of_edges()
    numN, numE
  exercise:
    prompt: 실습 예제에서 \`data\`, \`numN\`, \`numE\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      import networkx as nx
      from networkx.algorithms import community
      import matplotlib.pyplot as plt

      data = nx.florentine_families_graph()
      numN = data.number_of_nodes()
      numE = data.number_of_edges()
      numN, numE
    hints:
    - 바꿀 지점은 \`data = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`data\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 실습에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: workflow_validation
  title: 업무 흐름 검증
  structuredPrimary: true
  subtitle: 인수인계 네트워크
  goal: 업무 흐름 검증에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 실무 네트워크 분석은 그래프를 그리는 데서 끝나지 않습니다. 먼저 병목 후보를 예측하고, 로컬 Python에서 실행한 뒤, 잘못된 노드나 끊어진 경로를 예외로
    처리하고, 핵심 지표를 assert로 검증해야 합니다. 아래 흐름은 영업, 지원, 운영, 재무, 엔지니어링 사이의 인수인계 비용을 네트워크로 보고 개선안을 비교합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import networkx as nx

    handoffEdges = [
        ("sales", "support", 1),
        ("support", "ops", 2),
        ("ops", "finance", 1),
        ("ops", "engineering", 1),
        ("engineering", "infra", 2),
        ("support", "customer_success", 2),
    ]

    workflowGraph = nx.Graph()
    workflowGraph.add_weighted_edges_from(handoffEdges)

    expectedNodes = {"sales", "support", "ops", "finance", "engineering", "infra", "customer_success"}
    if set(workflowGraph.nodes()) != expectedNodes:
        raise ValueError("인수인계 네트워크의 부서 목록이 예상과 다릅니다.")
    if any(data["weight"] <= 0 for _, _, data in workflowGraph.edges(data=True)):
        raise ValueError("인수인계 비용은 0보다 커야 합니다.")

    salesToFinanceCost = nx.shortest_path_length(workflowGraph, "sales", "finance", weight="weight")
    betweenness = nx.betweenness_centrality(workflowGraph, weight="weight")

    workflowGraph.number_of_nodes(), workflowGraph.number_of_edges()
  exercise:
    prompt: 업무 흐름 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      experimentGraph = workflowGraph.copy()
      experimentGraph.add_edge("sales", "finance", weight=2)

      improvedCost = nx.shortest_path_length(experimentGraph, "sales", "finance", weight="weight")
      improvedBetweenness = nx.betweenness_centrality(experimentGraph, weight="weight")
      improvement = salesToFinanceCost - improvedCost

      assert improvement > 0
      {
          "beforeCost": salesToFinanceCost,
          "afterCost": improvedCost,
          "costImprovement": improvement,
          "opsBetweennessBefore": round(betweenness["ops"], 3),
          "opsBetweennessAfter": round(improvedBetweenness["ops"], 3),
      }
    solution: |-
      import networkx as nx

      handoffEdges = [
          ("sales", "support", 1),
          ("support", "ops", 2),
          ("ops", "finance", 1),
          ("ops", "engineering", 1),
          ("engineering", "infra", 2),
          ("support", "customer_success", 2),
      ]

      workflowGraph = nx.Graph()
      workflowGraph.add_weighted_edges_from(handoffEdges)

      expectedNodes = {"sales", "support", "ops", "finance", "engineering", "infra", "customer_success"}
      if set(workflowGraph.nodes()) != expectedNodes:
          raise ValueError("인수인계 네트워크의 부서 목록이 예상과 다릅니다.")
      if any(data["weight"] <= 0 for _, _, data in workflowGraph.edges(data=True)):
          raise ValueError("인수인계 비용은 0보다 커야 합니다.")

      workflowGraph.number_of_nodes(), workflowGraph.number_of_edges()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 업무 흐름 검증에서 \`experimentGraph\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 업무 흐름 검증에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.
assessment:
  schemaVersion: 1
  performanceClaim: 웹에서는 외부 패키지 없이 분석 판단과 데이터 계약을 검증하고, 실제 패키지 API와 산출물은 lesson Run 및 Local 실습 증거로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: pending
  masteryVariants:
  - id: networkx_10-network-risk-report-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: network project 위험 보고서 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: component, isolate, degree, bridge를 한 구조 보고서로 통합한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 한 지표 대신 연결성·고립·hub를 함께 보고하세요.
    - 구조 위험과 실제 장애 기록을 구분하세요.
    exercise:
      prompt: network_risk_report(nodes, edges)를 완성하세요.
      starterCode: |-
        def network_risk_report(nodes, edges):
            raise NotImplementedError
      solution: |
        def network_risk_report(nodes, edges):
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
      hints: *id001
    check:
      id: python.networkx.networkx_10.network-risk-report.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.networkx.networkx_10.network-risk-report.mastery.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: network_risk_report
        cases:
        - id: summarizes-structure
          arguments:
          - value:
            - a
            - b
            - c
            - d
          - value:
            - - a
              - b
            - - b
              - c
          expectedReturn:
            nodeCount: 4
            edgeCount: 2
            componentSizes:
            - 3
            - 1
            isolates:
            - d
            maxDegreeNodes:
            - b
        - id: handles-empty
          arguments:
          - value: []
          - value: []
          expectedReturn:
            nodeCount: 0
            edgeCount: 0
            componentSizes: []
            isolates: []
            maxDegreeNodes: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: networkx_10-resilience-plan-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - networkx_10-network-risk-report-mastery
    title: 새 서비스 network에 복원력 설계 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: node 역할과 단일 실패 여부를 바탕으로 우선 보강 대상을 정렬한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 우선순위 공식과 입력 필드를 공개하세요.
    - 구조 score는 운영 영향 검토를 대체하지 않습니다.
    exercise:
      prompt: prioritize_resilience(nodes)를 완성하세요.
      starterCode: |-
        def prioritize_resilience(nodes):
            raise NotImplementedError
      solution: |
        def prioritize_resilience(nodes):
            result = []
            for node in nodes:
                score = node.get("dependents", 0) * 2 + int(node.get("singlePoint", False)) * 5 - node.get("redundancy", 0)
                action = "add redundancy" if node.get("singlePoint", False) else "monitor" if score > 2 else "accept"
                result.append({"node": node["id"], "score": score, "action": action})
            return sorted(result, key=lambda row: (-row["score"], row["node"]))
      hints: *id002
    check:
      id: python.networkx.networkx_10.resilience-plan.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.networkx.networkx_10.resilience-plan.transfer.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: prioritize_resilience
        cases:
        - id: prioritizes-single-point
          arguments:
          - value:
            - id: db
              dependents: 3
              singlePoint: true
              redundancy: 0
            - id: cache
              dependents: 2
              singlePoint: false
              redundancy: 1
          expectedReturn:
          - node: db
            score: 11
            action: add redundancy
          - node: cache
            score: 3
            action: monitor
        - id: accepts-low-risk
          arguments:
          - value:
            - id: x
              dependents: 1
              singlePoint: false
              redundancy: 2
          expectedReturn:
          - node: x
            score: 0
            action: accept
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: networkx_10-network-project-evidence-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - networkx_10-resilience-plan-transfer
    title: network project 증거 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 구조·모델·운영 결론의 증거를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 그래프 알고리즘의 입력 가정과 반환 의미를 함께 기록하세요.
    - 시각적 모양만으로 구조적 결론을 내리지 마세요.
    exercise:
      prompt: choose_network_evidence(situation)를 완성해 method, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_network_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_network_evidence(situation):
            table = {'structural-summary': {'method': 'components centrality bridges', 'evidence': 'graph snapshot hash', 'risk': 'stale topology'}, 'model-comparison': {'method': 'baseline distribution', 'evidence': 'multiple simulations', 'risk': 'single seed'}, 'operational-action': {'method': 'structure plus incident data', 'evidence': 'validated impact', 'risk': 'centrality-only decision'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.networkx.networkx_10.network-project-evidence.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.networkx.networkx_10.network-project-evidence.retrieval.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: choose_network_evidence
        cases:
        - id: recalls-structural-summary
          arguments:
          - value: structural-summary
          expectedReturn:
            method: components centrality bridges
            evidence: graph snapshot hash
            risk: stale topology
        - id: recalls-model-comparison
          arguments:
          - value: model-comparison
          expectedReturn:
            method: baseline distribution
            evidence: multiple simulations
            risk: single seed
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};