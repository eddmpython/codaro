var e=`meta:\r
  packages:\r
  - matplotlib\r
  - networkx\r
  - scipy\r
  id: networkx_04\r
  title: 중심성분석\r
  order: 4\r
  category: networkx\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - networkx\r
  - 중심성\r
  - degree\r
  - betweenness\r
  - closeness\r
  - pagerank\r
  seo:\r
    title: NetworkX 중심성 분석 - 중요 노드 찾기\r
    description: NetworkX로 네트워크에서 중요한 노드를 찾습니다. 연결, 매개, 근접, 고유벡터 중심성과 PageRank를 배웁니다.\r
    keywords:\r
    - networkx\r
    - 중심성\r
    - centrality\r
    - degree\r
    - betweenness\r
    - pagerank\r
intro:\r
  emoji: 🎯\r
  goal: 네트워크에서 중요한 노드를 찾는 다양한 중심성 지표를 학습합니다.\r
  description: 중심성(Centrality)은 네트워크에서 노드의 중요도를 측정합니다. 연결 중심성은 연결 수, 매개 중심성은 다리 역할, 근접 중심성은 접근성을 측정합니다.\r
    PageRank는 구글 검색의 기반이 된 알고리즘입니다.\r
  direction: 중심성분석에서 노드와 엣지를 모델링하고 경로, 중심성, 연결 구조를 검증합니다.\r
  benefits:\r
  - 관계 데이터 확인 후 그래프 알고리즘에 맞는 코드 입력을 고릅니다.\r
  - 중심성분석 결과를 노드/엣지와 지표 값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 관계 분석 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(관계 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 샘플 그래프 처리 실행\r
      detail: 그래프 알고리즘 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 연결 중심성 결과 검증\r
      detail: 노드/엣지와 지표 값 기준으로 실행 결과를 비교합니다.\r
    - label: 중심성분석 재사용\r
      detail: 완성 코드를 관계 분석 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 그래프 분석 환경\r
      detail: matplotlib, networkx, scipy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 중심성분석 실행\r
      detail: 셀을 실행해 노드/엣지와 지표 값와 예외 상태를 확인합니다.\r
    - label: 중심성분석 완료\r
      detail: 검증된 코드를 관계 분석 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: NetworkX와 matplotlib을 불러옵니다. 중심성(Centrality) 분석은 네트워크에서 '중요한' 노드를 찾는 핵심 기법입니다. 소셜 네트워크의\r
    인플루언서, 교통망의 허브 역, 조직의 핵심 인물 등을 식별하는 데 사용됩니다. 중심성에는 여러 종류가 있으며, 각각 '중요함'을 다른 관점에서 정의합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import networkx as nx\r
    import matplotlib.pyplot as plt\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import networkx as nx\r
      import matplotlib.pyplot as plt\r
    hints:\r
    - 바꿀 지점은 관계 데이터을 만드는 첫 줄과 그래프 알고리즘 줄에서 찾으세요.\r
    - 실행 뒤 노드/엣지와 지표 값 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 노드/엣지와 지표 값 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step2_sample_graph\r
  title: 2단계. 샘플 그래프\r
  structuredPrimary: true\r
  subtitle: 분석용 네트워크\r
  goal: 2단계. 샘플 그래프에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 중심성 분석을 위한 샘플 네트워크를 생성합니다. 이 그래프는 두 개의 밀집된 영역이 브릿지 노드로 연결된 구조입니다. 왼쪽에는 A를 중심으로 한 허브 구조가,\r
    오른쪽에는 F, G, H, I로 이루어진 클러스터가 있습니다. E와 F가 두 영역을 연결하는 브릿지 역할을 합니다. 이 구조에서 각 중심성 지표가 어떤 노드를 '중요'하다고 평가하는지\r
    비교해봅니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    G = nx.Graph()\r
    G.add_edges_from([\r
        ("A", "B"), ("A", "C"), ("A", "D"), ("A", "E"),\r
        ("B", "C"), ("D", "E"),\r
        ("E", "F"), ("F", "G"), ("F", "H"),\r
        ("G", "H"), ("G", "I"), ("H", "I")\r
    ])\r
    G.number_of_nodes(), G.number_of_edges()\r
  exercise:\r
    prompt: 2단계. 샘플 그래프 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      G = nx.Graph()\r
      G.add_edges_from([\r
          ("A", "B"), ("A", "C"), ("A", "D"), ("A", "E"),\r
          ("B", "C"), ("D", "E"),\r
          ("E", "F"), ("F", "G"), ("F", "H"),\r
          ("G", "H"), ("G", "I"), ("H", "I")\r
      ])\r
      G.number_of_nodes(), G.number_of_edges()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 샘플 그래프에서 \`G\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 샘플 그래프 실행 뒤 \`G\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step3_degree\r
  title: 3단계. 연결 중심성\r
  structuredPrimary: true\r
  subtitle: degree_centrality()\r
  goal: 3단계. 연결 중심성에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    연결 중심성(Degree Centrality)은 가장 직관적인 중심성 지표입니다. 노드의 연결 수(degree)를 전체 노드 수 - 1로 나누어 0~1 사이로 정규화합니다. 많은 이웃과 직접 연결된 노드가 높은 값을 가집니다. 소셜 네트워크에서 '친구가 많은 사람', 공항 네트워크에서 '노선이 많은 공항'을 찾을 때 유용합니다.\r
\r
    연결 중심성 = (연결 수) / (노드 수 - 1)입니다. 0과 1 사이 값으로 정규화됩니다.\r
  snippet: |-\r
    degCent = nx.degree_centrality(G)\r
    degCent\r
  exercise:\r
    prompt: 3단계. 연결 중심성 예제에서 \`degCent\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      degCent = nx.degree_centrality(G)\r
      degCent\r
    hints:\r
    - 바꿀 지점은 \`degCent = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`degCent\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 연결 중심성에서 \`degCent\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 연결 중심성 실행 뒤 \`degCent\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step4_betweenness\r
  title: 4단계. 매개 중심성\r
  structuredPrimary: true\r
  subtitle: betweenness_centrality()\r
  goal: 4단계. 매개 중심성에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    매개 중심성(Betweenness Centrality)은 노드가 네트워크의 '정보 흐름'에서 얼마나 중요한 위치에 있는지를 측정합니다. 모든 노드 쌍 사이의 최단 경로를 계산하고, 해당 노드가 그 경로에 얼마나 자주 포함되는지를 집계합니다. 서로 다른 그룹을 연결하는 브릿지 역할의 노드가 높은 값을 가집니다. 조직에서 부서 간 소통을 담당하는 사람, 네트워크의 병목점을 찾을 때 유용합니다.\r
\r
    매개 중심성이 높은 노드를 제거하면 네트워크가 분리될 수 있습니다. 정보 흐름의 병목점입니다.\r
  snippet: |-\r
    betCent = nx.betweenness_centrality(G)\r
    betCent\r
  exercise:\r
    prompt: 4단계. 매개 중심성 예제에서 \`betCent\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      betCent = nx.betweenness_centrality(G)\r
      betCent\r
    hints:\r
    - 바꿀 지점은 \`betCent = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`betCent\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 매개 중심성에서 \`betCent\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 매개 중심성 실행 뒤 \`betCent\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step5_closeness\r
  title: 5단계. 근접 중심성\r
  structuredPrimary: true\r
  subtitle: closeness_centrality()\r
  goal: 5단계. 근접 중심성에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    근접 중심성(Closeness Centrality)은 한 노드에서 네트워크의 다른 모든 노드에 얼마나 빠르게 도달할 수 있는지를 측정합니다. (노드 수 - 1)을 모든 최단 거리의 합으로 나눈 값입니다. 네트워크의 지리적 중심에 위치한 노드가 높은 값을 가집니다. 정보를 빠르게 전파하거나 받을 수 있는 위치, 물류 센터의 최적 위치를 찾을 때 유용합니다.\r
\r
    근접 중심성 = (노드 수 - 1) / (모든 최단 거리의 합)입니다. 네트워크의 중앙에 위치한 노드가 높습니다.\r
  snippet: |-\r
    closeCent = nx.closeness_centrality(G)\r
    closeCent\r
  exercise:\r
    prompt: 5단계. 근접 중심성 예제에서 \`closeCent\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      closeCent = nx.closeness_centrality(G)\r
      closeCent\r
    hints:\r
    - 바꿀 지점은 \`closeCent = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`closeCent\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 근접 중심성에서 \`closeCent\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 근접 중심성 실행 뒤 \`closeCent\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step6_eigenvector\r
  title: 6단계. 고유벡터 중심성\r
  structuredPrimary: true\r
  subtitle: eigenvector_centrality()\r
  goal: 6단계. 고유벡터 중심성에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    고유벡터 중심성(Eigenvector Centrality)은 '누구와 연결되어 있는가'를 중시합니다. 단순히 연결 수가 많은 것이 아니라, 중요한 노드들과 연결되어 있을수록 높은 값을 가집니다. 인접행렬의 주요 고유벡터에서 계산되며, 반복적으로 이웃의 중심성을 합산하는 방식으로 수렴합니다. 학계에서 저명한 학자들에게 인용받는 논문, VIP 고객과 연결된 서비스 담당자를 찾을 때 유용합니다.\r
\r
    고유벡터 중심성은 인접행렬의 고유벡터에서 계산됩니다. 많이 연결된 노드와 연결되면 중심성이 높아집니다.\r
  snippet: |-\r
    eigCent = nx.eigenvector_centrality(G)\r
    eigCent\r
  exercise:\r
    prompt: 6단계. 고유벡터 중심성 예제에서 \`eigCent\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      eigCent = nx.eigenvector_centrality(G)\r
      eigCent\r
    hints:\r
    - 바꿀 지점은 \`eigCent = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`eigCent\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 고유벡터 중심성에서 \`eigCent\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 고유벡터 중심성 실행 뒤 \`eigCent\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step7_pagerank\r
  title: 7단계. PageRank\r
  structuredPrimary: true\r
  subtitle: pagerank()\r
  goal: 7단계. PageRank에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    PageRank는 1998년 래리 페이지와 세르게이 브린이 구글 검색 엔진의 기초로 개발한 알고리즘입니다. 랜덤 서퍼 모델에 기반하며, 임의의 사용자가 링크를 따라 웹을 탐색할 때 각 페이지에 도달할 확률을 계산합니다. 중요한 페이지에서 링크를 많이 받을수록 PageRank가 높아집니다. 주로 방향 그래프에서 사용하지만, 무방향 그래프에도 적용 가능합니다.\r
\r
    PageRank는 random surfer model 기반입니다. 임의의 웹서퍼가 각 페이지에 도달할 확률을 계산합니다.\r
  snippet: |-\r
    pr = nx.pagerank(G)\r
    pr\r
  exercise:\r
    prompt: 7단계. PageRank 예제에서 \`pr\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pr = nx.pagerank(G)\r
      pr\r
    hints:\r
    - 바꿀 지점은 \`pr = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`pr\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 7단계. PageRank에서 \`pr\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. PageRank 실행 뒤 \`pr\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step8_visualize_centrality\r
  title: 8단계. 중심성 시각화\r
  structuredPrimary: true\r
  subtitle: 노드 크기/색상 매핑\r
  goal: 8단계. 중심성 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 중심성 값을 노드의 크기나 색상에 매핑하면 결과를 직관적으로 파악할 수 있습니다. 노드 크기로 연결 중심성을 표현하면 허브가 크게 보이고, 색상 그라디언트로\r
    매개 중심성을 표현하면 브릿지 노드가 강조됩니다. matplotlib의 컬러맵과 결합하여 다양한 시각화가 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pos = nx.spring_layout(G, seed=42)\r
    nodeSizes = [3000 * degCent[n] for n in G.nodes()]\r
\r
    fig2, ax2 = plt.subplots(figsize=(8, 6))\r
    nx.draw(G, pos=pos, with_labels=True, node_color='lightblue',\r
            node_size=nodeSizes, font_size=10, ax=ax2)\r
    ax2.set_title('Node Size by Degree Centrality')\r
    fig2\r
  exercise:\r
    prompt: 8단계. 중심성 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      pos = nx.spring_layout(G, seed=42)\r
      nodeSizes = [3000 * degCent[n] for n in G.nodes()]\r
\r
      fig2, ax2 = plt.subplots(figsize=(8, 6))\r
      nx.draw(G, pos=pos, with_labels=True, node_color='lightblue',\r
              node_size=nodeSizes, font_size=10, ax=ax2)\r
      ax2.set_title('Node Size by Degree Centrality')\r
      fig2\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 중심성 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. 중심성 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_compare\r
  title: 9단계. 중심성 비교\r
  structuredPrimary: true\r
  subtitle: 다양한 관점\r
  goal: 9단계. 중심성 비교에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    각 중심성 지표는 서로 다른 관점에서 '중요함'을 정의합니다. 연결 중심성은 직접적인 영향력, 매개 중심성은 정보 흐름 통제력, 근접 중심성은 접근성, 고유벡터 중심성은 연결의 질, PageRank는 추천받는 정도를 측정합니다. 같은 노드라도 중심성 종류에 따라 순위가 달라질 수 있으므로, 분석 목적에 맞는 지표를 선택하는 것이 중요합니다.\r
\r
    연결 중심성 1위는 허브, 매개 중심성 1위는 브릿지, 근접 중심성 1위는 중앙에 위치한 노드입니다.\r
  snippet: |-\r
    comparison = {}\r
    for n in G.nodes():\r
        comparison[n] = {\r
            'degree': round(degCent[n], 3),\r
            'betweenness': round(betCent[n], 3),\r
            'closeness': round(closeCent[n], 3),\r
            'eigenvector': round(eigCent[n], 3),\r
            'pagerank': round(pr[n], 3)\r
        }\r
    comparison\r
  exercise:\r
    prompt: 9단계. 중심성 비교 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      comparison = {}\r
      for n in G.nodes():\r
          comparison[n] = {\r
              'degree': round(degCent[n], 3),\r
              'betweenness': round(betCent[n], 3),\r
              'closeness': round(closeCent[n], 3),\r
              'eigenvector': round(eigCent[n], 3),\r
              'pagerank': round(pr[n], 3)\r
          }\r
      comparison\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 중심성 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 중심성 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_influence\r
  title: 10단계. 영향력 분석\r
  structuredPrimary: true\r
  subtitle: 실제 응용\r
  goal: 10단계. 영향력 분석에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 소셜 네트워크에서 영향력 있는 인플루언서를 찾는 실제 응용 예제입니다. 바이럴 마케팅에서는 연결 중심성이 높은 사람에게 제품을 홍보하면 많은 사람에게 직접\r
    전달됩니다. 정보 확산 속도를 최대화하려면 근접 중심성이 높은 사람을, 서로 다른 커뮤니티에 메시지를 전파하려면 매개 중심성이 높은 사람을 타겟팅합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    social = nx.Graph()\r
    social.add_edges_from([\r
        ("Influencer", "User1"), ("Influencer", "User2"),\r
        ("Influencer", "User3"), ("Influencer", "User4"),\r
        ("User1", "User5"), ("User1", "User6"),\r
        ("User2", "User7"), ("User3", "User8"),\r
        ("User4", "User9"), ("User4", "User10"),\r
        ("User5", "User6"), ("User9", "User10")\r
    ])\r
    social.number_of_nodes(), social.number_of_edges()\r
  exercise:\r
    prompt: 10단계. 영향력 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      social = nx.Graph()\r
      social.add_edges_from([\r
          ("Influencer", "User1"), ("Influencer", "User2"),\r
          ("Influencer", "User3"), ("Influencer", "User4"),\r
          ("User1", "User5"), ("User1", "User6"),\r
          ("User2", "User7"), ("User3", "User8"),\r
          ("User4", "User9"), ("User4", "User10"),\r
          ("User5", "User6"), ("User9", "User10")\r
      ])\r
      social.number_of_nodes(), social.number_of_edges()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 영향력 분석에서 \`social\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 영향력 분석 실행 뒤 \`social\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 중심성 분석\r
  goal: 실습에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 중심성 분석 기법을 활용하여 실전 미션을 수행해봅시다. 학교 친구 네트워크에서 인기 있는 학생과 그룹 간 연결자를 찾고, 웹 페이지에 PageRank를 적용하여 중요도 순위를 매겨봅니다.\r
\r
    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  snippet: |-\r
    import networkx as nx\r
    import matplotlib.pyplot as plt\r
\r
    school = nx.Graph()\r
    school.add_edges_from([\r
        ("Kim", "Lee"), ("Kim", "Park"), ("Kim", "Choi"),\r
        ("Lee", "Park"), ("Lee", "Jung"),\r
        ("Park", "Choi"), ("Park", "Kang"),\r
        ("Choi", "Kang"), ("Jung", "Kang"),\r
        ("Kang", "Oh"), ("Oh", "Yoon")\r
    ])\r
    school.number_of_nodes(), school.number_of_edges()\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import networkx as nx\r
      import matplotlib.pyplot as plt\r
\r
      school = nx.Graph()\r
      school.add_edges_from([\r
          ("Kim", "Lee"), ("Kim", "Park"), ("Kim", "Choi"),\r
          ("Lee", "Park"), ("Lee", "Jung"),\r
          ("Park", "Choi"), ("Park", "Kang"),\r
          ("Choi", "Kang"), ("Jung", "Kang"),\r
          ("Kang", "Oh"), ("Oh", "Yoon")\r
      ])\r
      school.number_of_nodes(), school.number_of_edges()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`school\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 \`school\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
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