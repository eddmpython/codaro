var e=`meta:\r
  packages:\r
  - matplotlib\r
  - networkx\r
  id: networkx_10\r
  title: 종합네트워크프로젝트\r
  order: 10\r
  category: networkx\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - networkx\r
  - 종합\r
  - 분석\r
  - 시각화\r
  - 대시보드\r
  seo:\r
    title: NetworkX 종합 프로젝트 - 네트워크 분석 대시보드\r
    description: NetworkX로 종합 네트워크 분석을 수행합니다. 모든 개념을 통합하여 분석 파이프라인을 구축합니다.\r
    keywords:\r
    - networkx\r
    - 종합\r
    - 분석\r
    - 시각화\r
    - 대시보드\r
    - 파이프라인\r
intro:\r
  emoji: 🎓\r
  goal: 지금까지 배운 모든 개념을 활용하여 종합 네트워크 분석을 수행합니다.\r
  description: 이 프로젝트에서는 레미제라블 네트워크를 완전히 분석합니다. 기본 통계, 중심성, 경로, 클러스터링, 커뮤니티, 연결성을 모두 분석하고 종합 시각화합니다. 분석\r
    파이프라인을 구축하여 어떤 네트워크에도 적용할 수 있게 합니다.\r
  direction: 종합네트워크프로젝트에서 노드와 엣지를 모델링하고 경로, 중심성, 연결 구조를 검증합니다.\r
  benefits:\r
  - 관계 데이터 확인 후 그래프 알고리즘에 맞는 코드 입력을 고릅니다.\r
  - 종합네트워크프로젝트 결과를 노드/엣지와 지표 값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 관계 분석 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(관계 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 그래프 알고리즘 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 기본 통계 결과 검증\r
      detail: 노드/엣지와 지표 값 기준으로 실행 결과를 비교합니다.\r
    - label: 종합네트워크프로젝트 재사용\r
      detail: 완성 코드를 관계 분석 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 그래프 분석 환경\r
      detail: matplotlib, networkx 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합네트워크프로젝트 실행\r
      detail: 셀을 실행해 노드/엣지와 지표 값와 예외 상태를 확인합니다.\r
    - label: 종합네트워크프로젝트 완료\r
      detail: 검증된 코드를 관계 분석 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 종합 분석에 필요한 모든 라이브러리를 불러옵니다. 이 프로젝트에서는 지금까지 배운 NetworkX의 모든 기능을 활용합니다. 기본 통계, 중심성 분석, 경로\r
    분석, 클러스터링, 커뮤니티 탐지, 연결성 분석을 통합하여 하나의 네트워크를 완전히 분석하는 파이프라인을 구축합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import networkx as nx\r
    from networkx.algorithms import community\r
    import matplotlib.pyplot as plt\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import networkx as nx\r
      from networkx.algorithms import community\r
      import matplotlib.pyplot as plt\r
    hints:\r
    - 바꿀 지점은 관계 데이터을 만드는 첫 줄과 그래프 알고리즘 줄에서 찾으세요.\r
    - 실행 뒤 노드/엣지와 지표 값 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 노드/엣지와 지표 값 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step2_load_data\r
  title: 2단계. 데이터 로드\r
  structuredPrimary: true\r
  subtitle: 레미제라블 네트워크\r
  goal: 2단계. 데이터 로드에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Victor Hugo의 소설 '레미제라블'에 등장하는 인물들의 관계 네트워크를 로드합니다. 77명의 인물과 254개의 관계로 구성되며, 엣지의 weight 속성은 두 인물이 같은 장면에 함께 등장한 횟수를 나타냅니다. 이 데이터셋은 규모가 적당하면서도 풍부한 구조를 가지고 있어 네트워크 분석 학습에 이상적입니다.\r
\r
    레미제라블 네트워크는 77명의 등장인물과 254개의 관계로 구성됩니다. 엣지의 weight는 함께 등장한 횟수입니다.\r
  snippet: |-\r
    G = nx.les_miserables_graph()\r
    numNodes = G.number_of_nodes()\r
    numEdges = G.number_of_edges()\r
    numNodes, numEdges\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 \`G\`, \`numNodes\`, \`numEdges\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      G = nx.les_miserables_graph()\r
      numNodes = G.number_of_nodes()\r
      numEdges = G.number_of_edges()\r
      numNodes, numEdges\r
    hints:\r
    - 바꿀 지점은 \`G = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`G\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 데이터 로드에서 \`G\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 데이터 로드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_basic_stats\r
  title: 3단계. 기본 통계\r
  structuredPrimary: true\r
  subtitle: 네트워크 개요\r
  goal: 3단계. 기본 통계에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 네트워크의 기본 통계량을 계산합니다. 밀도는 전체 가능한 연결 중 실제 연결의 비율, 평균 차수는 인물당 평균 관계 수, 지름은 가장 먼 두 인물 사이의 거리,\r
    클러스터링은 친구의 친구가 친구인 정도를 나타냅니다. 이 지표들로 네트워크의 전반적인 특성을 파악합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    density = nx.density(G)\r
    degrees = [d for n, d in G.degree()]\r
    avgDegree = sum(degrees) / len(degrees)\r
    minDeg = min(degrees)\r
    maxDeg = max(degrees)\r
    density, avgDegree, minDeg, maxDeg\r
  exercise:\r
    prompt: 3단계. 기본 통계 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      density = nx.density(G)\r
      degrees = [d for n, d in G.degree()]\r
      avgDegree = sum(degrees) / len(degrees)\r
      minDeg = min(degrees)\r
      maxDeg = max(degrees)\r
      density, avgDegree, minDeg, maxDeg\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 기본 통계의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 3단계. 기본 통계 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step4_centrality\r
  title: 4단계. 중심성 분석\r
  structuredPrimary: true\r
  subtitle: 주요 인물 찾기\r
  goal: 4단계. 중심성 분석에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 다양한 중심성 지표로 소설의 핵심 인물들을 찾습니다. 연결 중심성은 가장 많은 인물과 관계를 가진 사람, 매개 중심성은 서로 다른 그룹을 연결하는 중요한 위치의\r
    인물, 근접 중심성은 모든 인물에게 빠르게 도달할 수 있는 중앙에 위치한 인물, 고유벡터 중심성은 중요한 인물들과 연결된 인물을 찾아냅니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    degCent = nx.degree_centrality(G)\r
    betCent = nx.betweenness_centrality(G)\r
    closeCent = nx.closeness_centrality(G)\r
    eigCent = nx.eigenvector_centrality(G)\r
  exercise:\r
    prompt: 4단계. 중심성 분석 예제에서 \`degCent\`, \`betCent\`, \`closeCent\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      degCent = nx.degree_centrality(G)\r
      betCent = nx.betweenness_centrality(G)\r
      closeCent = nx.closeness_centrality(G)\r
      eigCent = nx.eigenvector_centrality(G)\r
    hints:\r
    - 바꿀 지점은 \`degCent = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`degCent\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 중심성 분석에서 \`degCent\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 중심성 분석 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_community\r
  title: 5단계. 커뮤니티 탐지\r
  structuredPrimary: true\r
  subtitle: 그룹 발견\r
  goal: 5단계. 커뮤니티 탐지에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 커뮤니티 탐지 알고리즘으로 등장인물 그룹을 찾습니다. 소설에서 함께 등장하는 인물들은 자연스럽게 스토리라인별로 그룹을 형성합니다. 알고리즘이 발견한 커뮤니티가\r
    소설의 실제 스토리 구조와 어떻게 일치하는지 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    communities = community.louvain_communities(G, seed=42)\r
    commList = [set(c) for c in communities]\r
    numComms = len(commList)\r
    numComms\r
  exercise:\r
    prompt: 5단계. 커뮤니티 탐지 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      communities = community.louvain_communities(G, seed=42)\r
      commList = [set(c) for c in communities]\r
      numComms = len(commList)\r
      numComms\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 커뮤니티 탐지의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 5단계. 커뮤니티 탐지 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step6_path_analysis\r
  title: 6단계. 경로 분석\r
  structuredPrimary: true\r
  subtitle: 주요 인물 간 거리\r
  goal: 6단계. 경로 분석에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 주요 등장인물 사이의 최단 경로를 분석합니다. 중심성이 높은 주요 인물들 간의 거리 행렬을 계산하면 소설의 인물 관계 구조를 이해할 수 있습니다. 장발장과\r
    미리엘 주교, 코제트와 마리우스 등 중요한 인물들이 어떻게 연결되어 있는지 경로를 추적합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    mainChars = [n for n, v in sorted(degCent.items(), key=lambda x: x[1], reverse=True)[:5]]\r
    mainChars\r
  exercise:\r
    prompt: 6단계. 경로 분석 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      mainChars = [n for n, v in sorted(degCent.items(), key=lambda x: x[1], reverse=True)[:5]]\r
      mainChars\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 경로 분석의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 6단계. 경로 분석 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step7_connectivity\r
  title: 7단계. 연결성 분석\r
  structuredPrimary: true\r
  subtitle: 네트워크 구조\r
  goal: 7단계. 연결성 분석에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    네트워크의 연결 구조와 취약점을 분석합니다. 노드 연결도는 네트워크를 분리하기 위해 제거해야 하는 최소 노드 수, 엣지 연결도는 최소 엣지 수를 나타냅니다. 절단점(articulation point)은 제거 시 네트워크가 분리되는 중요 노드입니다. 소설에서 이 절단점들이 어떤 역할을 하는지 분석합니다.\r
\r
    절단점이 많다는 것은 네트워크가 특정 노드에 의존적임을 의미합니다.\r
  snippet: |-\r
    nodeConn = nx.node_connectivity(G)\r
    edgeConn = nx.edge_connectivity(G)\r
    nodeConn, edgeConn\r
  exercise:\r
    prompt: 7단계. 연결성 분석 예제에서 \`nodeConn\`, \`edgeConn\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      nodeConn = nx.node_connectivity(G)\r
      edgeConn = nx.edge_connectivity(G)\r
      nodeConn, edgeConn\r
    hints:\r
    - 바꿀 지점은 \`nodeConn = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`nodeConn\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 연결성 분석에서 \`nodeConn\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 연결성 분석 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step8_visualization\r
  title: 8단계. 종합 시각화\r
  structuredPrimary: true\r
  subtitle: 대시보드\r
  goal: 8단계. 종합 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 분석 결과를 종합하여 다중 패널 대시보드를 생성합니다. 커뮤니티+연결중심성, 커뮤니티+매개중심성, 클러스터링 계수, 차수 분포의 네 가지 뷰를 하나의 그림에\r
    배치합니다. 이런 종합 시각화는 네트워크의 다양한 측면을 한눈에 파악할 수 있게 해줍니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: pos = nx.spring_layout(G, seed=42, k=0.5)\r
  exercise:\r
    prompt: 8단계. 종합 시각화 예제에서 \`pos\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: pos = nx.spring_layout(G, seed=42, k=0.5)\r
    hints:\r
    - 바꿀 지점은 \`pos = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`pos\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 종합 시각화에서 \`pos\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 종합 시각화 실행 뒤 \`pos\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step9_summary_report\r
  title: 9단계. 분석 리포트\r
  structuredPrimary: true\r
  subtitle: 결과 정리\r
  goal: 9단계. 분석 리포트에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 분석 결과를 정리하여 리포트를 생성합니다. 데이터 분석에서 리포트는 단순한 결과 나열이 아니라, 발견한 패턴과 인사이트를 체계적으로 전달하는 중요한 산출물입니다.\r
    네트워크 분석 리포트에는 기본 통계, 구조적 특성, 핵심 노드, 커뮤니티 정보를 포함합니다. Python의 딕셔너리를 활용하면 계층적이고 구조화된 리포트를 쉽게 만들 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    diameter = nx.diameter(G)\r
    avgPath = nx.average_shortest_path_length(G)\r
    avgClustering = nx.average_clustering(G)\r
    transitivity = nx.transitivity(G)\r
    modularity = nx.community.modularity(G, commList)\r
    artPoints = list(nx.articulation_points(G))\r
    bridges = list(nx.bridges(G))\r
\r
    report = {\r
        'Basic Stats': {\r
            'Nodes': numNodes,\r
            'Edges': numEdges,\r
            'Density': round(density, 4),\r
            'Average Degree': round(avgDegree, 2),\r
            'Diameter': diameter,\r
            'Average Path Length': round(avgPath, 2)\r
        },\r
        'Clustering': {\r
            'Average Clustering': round(avgClustering, 3),\r
            'Transitivity': round(transitivity, 3)\r
        },\r
        'Community': {\r
            'Number of Communities': numComms,\r
            'Modularity': round(modularity, 3)\r
        },\r
        'Connectivity': {\r
            'Node Connectivity': nodeConn,\r
            'Edge Connectivity': edgeConn,\r
            'Articulation Points': len(artPoints),\r
            'Bridges': len(bridges)\r
        }\r
    }\r
    report\r
  exercise:\r
    prompt: 9단계. 분석 리포트 예제에서 \`report\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      diameter = nx.diameter(G)\r
      avgPath = nx.average_shortest_path_length(G)\r
      avgClustering = nx.average_clustering(G)\r
      transitivity = nx.transitivity(G)\r
      modularity = nx.community.modularity(G, commList)\r
      artPoints = list(nx.articulation_points(G))\r
      bridges = list(nx.bridges(G))\r
\r
      report = {\r
          'Basic Stats': {\r
              'Nodes': numNodes,\r
              'Edges': numEdges,\r
              'Density': round(density, 4),\r
              'Average Degree': round(avgDegree, 2),\r
              'Diameter': diameter,\r
              'Average Path Length': round(avgPath, 2)\r
          },\r
          'Clustering': {\r
              'Average Clustering': round(avgClustering, 3),\r
              'Transitivity': round(transitivity, 3)\r
          },\r
          'Community': {\r
              'Number of Communities': numComms,\r
              'Modularity': round(modularity, 3)\r
          },\r
          'Connectivity': {\r
              'Node Connectivity': nodeConn,\r
              'Edge Connectivity': edgeConn,\r
              'Articulation Points': len(artPoints),\r
              'Bridges': len(bridges)\r
          }\r
      }\r
      report\r
    hints:\r
    - 바꿀 지점은 \`report = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`report\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 분석 리포트에서 \`report\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 분석 리포트 실행 뒤 \`report\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step10_function\r
  title: 10단계. 재사용 함수\r
  structuredPrimary: true\r
  subtitle: 분석 파이프라인\r
  goal: 10단계. 재사용 함수에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 분석 과정을 함수로 정리하여 어떤 네트워크에도 적용할 수 있게 합니다. 소프트웨어 공학에서 반복되는 작업을 함수화하는 것은 재사용성, 유지보수성, 일관성을\r
    높이는 핵심 원칙입니다. 네트워크 분석 함수를 만들어두면 새로운 데이터셋에 동일한 분석을 즉시 적용할 수 있습니다. 가라테 클럽과 레미제라블 네트워크를 비교 분석하며 함수의 활용법을\r
    익힙니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def analyzeNetwork(graph):\r
        result = {}\r
\r
        result['nodes'] = graph.number_of_nodes()\r
        result['edges'] = graph.number_of_edges()\r
        result['density'] = round(nx.density(graph), 4)\r
\r
        degs = [d for n, d in graph.degree()]\r
        result['avgDegree'] = round(sum(degs) / len(degs), 2)\r
\r
        result['avgClustering'] = round(nx.average_clustering(graph), 3)\r
\r
        if nx.is_connected(graph):\r
            result['avgPath'] = round(nx.average_shortest_path_length(graph), 2)\r
            result['diameter'] = nx.diameter(graph)\r
        else:\r
            result['avgPath'] = None\r
            result['diameter'] = None\r
\r
        comms = community.louvain_communities(graph, seed=42)\r
        result['numCommunities'] = len(comms)\r
        result['modularity'] = round(nx.community.modularity(graph, comms), 3)\r
\r
        degCentG = nx.degree_centrality(graph)\r
        result['topNode'] = max(degCentG, key=degCentG.get)\r
\r
        return result\r
\r
    analyzeNetwork(G)\r
  exercise:\r
    prompt: 10단계. 재사용 함수 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def analyzeNetwork(graph):\r
          result = {}\r
\r
          result['nodes'] = graph.number_of_nodes()\r
          result['edges'] = graph.number_of_edges()\r
          result['density'] = round(nx.density(graph), 4)\r
\r
          degs = [d for n, d in graph.degree()]\r
          result['avgDegree'] = round(sum(degs) / len(degs), 2)\r
\r
          result['avgClustering'] = round(nx.average_clustering(graph), 3)\r
\r
          if nx.is_connected(graph):\r
              result['avgPath'] = round(nx.average_shortest_path_length(graph), 2)\r
              result['diameter'] = nx.diameter(graph)\r
          else:\r
              result['avgPath'] = None\r
              result['diameter'] = None\r
\r
          comms = community.louvain_communities(graph, seed=42)\r
          result['numCommunities'] = len(comms)\r
          result['modularity'] = round(nx.community.modularity(graph, comms), 3)\r
\r
          degCentG = nx.degree_centrality(graph)\r
          result['topNode'] = max(degCentG, key=degCentG.get)\r
\r
          return result\r
\r
      analyzeNetwork(G)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 재사용 함수의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 10단계. 재사용 함수 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 종합 분석\r
  goal: 실습에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 내용을 활용하여 미션을 수행해봅시다. 미션1에서는 르네상스 시대 피렌체 주요 가문들의 정치적 혼인 관계를 분석합니다. 이 데이터는 사회학 연구의 고전으로, 메디치 가문이 어떻게 네트워크 중심에서 권력을 장악했는지 보여줍니다. 미션2에서는 실제 네트워크와 랜덤 그래프 모델을 비교하여 어떤 모델이 현실을 가장 잘 설명하는지 분석합니다.\r
\r
    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  snippet: |-\r
    import networkx as nx\r
    from networkx.algorithms import community\r
    import matplotlib.pyplot as plt\r
\r
    data = nx.florentine_families_graph()\r
    numN = data.number_of_nodes()\r
    numE = data.number_of_edges()\r
    numN, numE\r
  exercise:\r
    prompt: 실습 예제에서 \`data\`, \`numN\`, \`numE\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import networkx as nx\r
      from networkx.algorithms import community\r
      import matplotlib.pyplot as plt\r
\r
      data = nx.florentine_families_graph()\r
      numN = data.number_of_nodes()\r
      numE = data.number_of_edges()\r
      numN, numE\r
    hints:\r
    - 바꿀 지점은 \`data = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`data\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: 업무 흐름 검증\r
  structuredPrimary: true\r
  subtitle: 인수인계 네트워크\r
  goal: 업무 흐름 검증에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 실무 네트워크 분석은 그래프를 그리는 데서 끝나지 않습니다. 먼저 병목 후보를 예측하고, 로컬 Python에서 실행한 뒤, 잘못된 노드나 끊어진 경로를 예외로\r
    처리하고, 핵심 지표를 assert로 검증해야 합니다. 아래 흐름은 영업, 지원, 운영, 재무, 엔지니어링 사이의 인수인계 비용을 네트워크로 보고 개선안을 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import networkx as nx\r
\r
    handoffEdges = [\r
        ("sales", "support", 1),\r
        ("support", "ops", 2),\r
        ("ops", "finance", 1),\r
        ("ops", "engineering", 1),\r
        ("engineering", "infra", 2),\r
        ("support", "customer_success", 2),\r
    ]\r
\r
    workflowGraph = nx.Graph()\r
    workflowGraph.add_weighted_edges_from(handoffEdges)\r
\r
    expectedNodes = {"sales", "support", "ops", "finance", "engineering", "infra", "customer_success"}\r
    if set(workflowGraph.nodes()) != expectedNodes:\r
        raise ValueError("인수인계 네트워크의 부서 목록이 예상과 다릅니다.")\r
    if any(data["weight"] <= 0 for _, _, data in workflowGraph.edges(data=True)):\r
        raise ValueError("인수인계 비용은 0보다 커야 합니다.")\r
\r
    salesToFinanceCost = nx.shortest_path_length(workflowGraph, "sales", "finance", weight="weight")\r
    betweenness = nx.betweenness_centrality(workflowGraph, weight="weight")\r
\r
    workflowGraph.number_of_nodes(), workflowGraph.number_of_edges()\r
  exercise:\r
    prompt: 업무 흐름 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      experimentGraph = workflowGraph.copy()\r
      experimentGraph.add_edge("sales", "finance", weight=2)\r
\r
      improvedCost = nx.shortest_path_length(experimentGraph, "sales", "finance", weight="weight")\r
      improvedBetweenness = nx.betweenness_centrality(experimentGraph, weight="weight")\r
      improvement = salesToFinanceCost - improvedCost\r
\r
      assert improvement > 0\r
      {\r
          "beforeCost": salesToFinanceCost,\r
          "afterCost": improvedCost,\r
          "costImprovement": improvement,\r
          "opsBetweennessBefore": round(betweenness["ops"], 3),\r
          "opsBetweennessAfter": round(improvedBetweenness["ops"], 3),\r
      }\r
    solution: |-\r
      import networkx as nx\r
\r
      handoffEdges = [\r
          ("sales", "support", 1),\r
          ("support", "ops", 2),\r
          ("ops", "finance", 1),\r
          ("ops", "engineering", 1),\r
          ("engineering", "infra", 2),\r
          ("support", "customer_success", 2),\r
      ]\r
\r
      workflowGraph = nx.Graph()\r
      workflowGraph.add_weighted_edges_from(handoffEdges)\r
\r
      expectedNodes = {"sales", "support", "ops", "finance", "engineering", "infra", "customer_success"}\r
      if set(workflowGraph.nodes()) != expectedNodes:\r
          raise ValueError("인수인계 네트워크의 부서 목록이 예상과 다릅니다.")\r
      if any(data["weight"] <= 0 for _, _, data in workflowGraph.edges(data=True)):\r
          raise ValueError("인수인계 비용은 0보다 커야 합니다.")\r
\r
      workflowGraph.number_of_nodes(), workflowGraph.number_of_edges()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 업무 흐름 검증에서 \`experimentGraph\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 업무 흐름 검증에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
`;export{e as default};