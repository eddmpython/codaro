var e=`meta:\r
  packages:\r
  - matplotlib\r
  - networkx\r
  id: networkx_02\r
  title: 방향그래프와가중치\r
  order: 2\r
  category: networkx\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - networkx\r
  - DiGraph\r
  - 방향그래프\r
  - 가중치\r
  - 속성\r
  seo:\r
    title: NetworkX 방향 그래프와 가중치\r
    description: DiGraph로 방향 그래프를 만들고, 엣지에 가중치를 추가합니다. 노드와 엣지 속성을 관리하는 방법을 배웁니다.\r
    keywords:\r
    - networkx\r
    - DiGraph\r
    - 방향그래프\r
    - 가중치\r
    - 속성\r
    - weight\r
intro:\r
  emoji: ➡️\r
  goal: 방향 그래프와 가중치 그래프를 만들고 속성을 관리합니다.\r
  description: 방향 그래프(DiGraph)는 엣지에 방향이 있습니다. A→B와 B→A는 다른 연결입니다. 가중치 그래프는 엣지에 수치가 있어 거리, 비용 등을 표현합니다.\r
    노드와 엣지에 다양한 속성을 추가하는 방법도 배웁니다.\r
  direction: 방향그래프와가중치에서 노드와 엣지를 모델링하고 경로, 중심성, 연결 구조를 검증합니다.\r
  benefits:\r
  - 관계 데이터 확인 후 그래프 알고리즘에 맞는 코드 입력을 고릅니다.\r
  - 방향그래프와가중치 결과를 노드/엣지와 지표 값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 관계 분석 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(관계 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 방향 그래프 생성 처리 실행\r
      detail: 그래프 알고리즘 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 진입/진출 차수 결과 검증\r
      detail: 노드/엣지와 지표 값 기준으로 실행 결과를 비교합니다.\r
    - label: 방향그래프와가중치 재사용\r
      detail: 완성 코드를 관계 분석 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 그래프 분석 환경\r
      detail: matplotlib, networkx 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 방향그래프와가중치 실행\r
      detail: 셀을 실행해 노드/엣지와 지표 값와 예외 상태를 확인합니다.\r
    - label: 방향그래프와가중치 완료\r
      detail: 검증된 코드를 관계 분석 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 이전 프로젝트와 마찬가지로 NetworkX와 matplotlib을 불러옵니다. 이번 프로젝트에서는 무방향 그래프(Graph) 외에 방향 그래프(DiGraph)를\r
    다룹니다. DiGraph는 Directed Graph의 줄임말로, 엣지에 방향이 있는 그래프입니다. 트위터 팔로우, 웹 링크, 인용 관계 등 비대칭적인 관계를 표현할 때 사용합니다.\r
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
- id: step2_digraph\r
  title: 2단계. 방향 그래프 생성\r
  structuredPrimary: true\r
  subtitle: DiGraph()\r
  goal: 2단계. 방향 그래프 생성에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    nx.DiGraph()로 방향 그래프를 생성합니다. add_edge(u, v)를 호출하면 u에서 v로 향하는 화살표가 생깁니다. 무방향 그래프와 달리 add_edge('A', 'B')와 add_edge('B', 'A')는 서로 다른 두 개의 엣지입니다. 양방향 연결이 필요하면 두 엣지를 모두 추가해야 합니다. has_edge()로 특정 방향의 엣지가 있는지 확인할 수 있습니다.\r
\r
    DiGraph에서 (A, B) 엣지와 (B, A) 엣지는 다릅니다. 무방향 그래프와 달리 방향이 중요합니다.\r
  snippet: |-\r
    dg = nx.DiGraph()\r
    dg.add_edge("A", "B")\r
    dg.add_edge("B", "C")\r
    dg.add_edge("A", "C")\r
    list(dg.edges())\r
  exercise:\r
    prompt: 2단계. 방향 그래프 생성 예제에서 \`dg\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dg = nx.DiGraph()\r
      dg.add_edge("A", "B")\r
      dg.add_edge("B", "C")\r
      dg.add_edge("A", "C")\r
      list(dg.edges())\r
    hints:\r
    - 바꿀 지점은 \`dg = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`dg\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 방향 그래프 생성에서 \`dg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 방향 그래프 생성 실행 뒤 \`dg\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step3_in_out\r
  title: 3단계. 진입/진출 차수\r
  structuredPrimary: true\r
  subtitle: in_degree(), out_degree()\r
  goal: 3단계. 진입/진출 차수에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    방향 그래프에서는 차수(degree)가 두 가지로 나뉩니다. 진입 차수(in-degree)는 해당 노드로 들어오는 화살표의 개수입니다. 트위터에서 팔로워 수에 해당합니다. 진출 차수(out-degree)는 해당 노드에서 나가는 화살표의 개수입니다. 트위터에서 팔로잉 수에 해당합니다. 인기 있는 인플루언서는 진입 차수가 높고, 활동적인 사용자는 진출 차수가 높습니다.\r
\r
    in_degree()는 들어오는 화살표 수, out_degree()는 나가는 화살표 수입니다. 일반 degree()는 둘의 합입니다.\r
  snippet: |-\r
    dg2 = nx.DiGraph()\r
    dg2.add_edges_from([("A", "B"), ("A", "C"), ("B", "C"), ("C", "D"), ("D", "A")])\r
    list(dg2.edges())\r
  exercise:\r
    prompt: 3단계. 진입/진출 차수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dg2 = nx.DiGraph()\r
      dg2.add_edges_from([("A", "B"), ("A", "C"), ("B", "C"), ("C", "D"), ("D", "A")])\r
      list(dg2.edges())\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 진입/진출 차수에서 \`dg2\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 진입/진출 차수 실행 뒤 \`dg2\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step4_visualize_directed\r
  title: 4단계. 방향 그래프 시각화\r
  structuredPrimary: true\r
  subtitle: 화살표 표시\r
  goal: 4단계. 방향 그래프 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    방향 그래프를 시각화하면 엣지가 화살표로 표시됩니다. nx.draw() 함수는 DiGraph를 감지하면 자동으로 화살표를 그립니다. arrows=True를 명시적으로 지정해도 됩니다. arrowsize 파라미터로 화살표 크기를 조절할 수 있습니다. 노드가 많거나 엣지가 복잡하면 화살표가 겹쳐 보이기 어려울 수 있으므로, 적절한 레이아웃과 크기 조절이 중요합니다.\r
\r
    arrowsize로 화살표 크기를 조절합니다. connectionstyle 파라미터로 곡선 화살표도 가능합니다.\r
  snippet: |-\r
    posDg = nx.spring_layout(dg2, seed=42)\r
    fig1, ax1 = plt.subplots(figsize=(7, 5))\r
    nx.draw(dg2, pos=posDg, with_labels=True, node_color='lightcoral',\r
            node_size=800, font_size=12, arrows=True,\r
            arrowsize=20, edge_color='gray', ax=ax1)\r
    ax1.set_title('Directed Graph')\r
    fig1\r
  exercise:\r
    prompt: 4단계. 방향 그래프 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      posDg = nx.spring_layout(dg2, seed=42)\r
      fig1, ax1 = plt.subplots(figsize=(7, 5))\r
      nx.draw(dg2, pos=posDg, with_labels=True, node_color='lightcoral',\r
              node_size=800, font_size=12, arrows=True,\r
              arrowsize=20, edge_color='gray', ax=ax1)\r
      ax1.set_title('Directed Graph')\r
      fig1\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 방향 그래프 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 방향 그래프 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_weighted\r
  title: 5단계. 가중치 그래프\r
  structuredPrimary: true\r
  subtitle: weight 속성\r
  goal: 5단계. 가중치 그래프에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    엣지에 가중치(weight)를 추가하면 연결의 강도나 비용을 표현할 수 있습니다. add_edge(u, v, weight=값)처럼 키워드 인자로 전달합니다. 도시 간 거리, 운송 비용, 친밀도 점수 등이 가중치가 됩니다. 가중치가 있으면 단순히 연결 여부만 보는 것이 아니라, 어떤 경로가 더 짧은지 또는 비용이 적은지 계산할 수 있습니다. edges(data=True)로 엣지와 가중치를 함께 조회합니다.\r
\r
    edges(data=True)로 엣지와 속성을 함께 조회합니다. G[u][v]로 특정 엣지의 속성 딕셔너리에 접근합니다.\r
  snippet: |-\r
    wg = nx.Graph()\r
    wg.add_edge("Seoul", "Busan", weight=325)\r
    wg.add_edge("Seoul", "Daejeon", weight=140)\r
    wg.add_edge("Daejeon", "Busan", weight=200)\r
    wg.add_edge("Seoul", "Gwangju", weight=270)\r
    list(wg.edges(data=True))\r
  exercise:\r
    prompt: 5단계. 가중치 그래프 예제에서 \`wg\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      wg = nx.Graph()\r
      wg.add_edge("Seoul", "Busan", weight=325)\r
      wg.add_edge("Seoul", "Daejeon", weight=140)\r
      wg.add_edge("Daejeon", "Busan", weight=200)\r
      wg.add_edge("Seoul", "Gwangju", weight=270)\r
      list(wg.edges(data=True))\r
    hints:\r
    - 바꿀 지점은 \`wg = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`wg\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 가중치 그래프에서 \`wg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 가중치 그래프 실행 뒤 \`wg\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step6_weighted_visual\r
  title: 6단계. 가중치 시각화\r
  structuredPrimary: true\r
  subtitle: 엣지 라벨\r
  goal: 6단계. 가중치 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    가중치 정보를 시각화에 표시하면 네트워크를 더 직관적으로 이해할 수 있습니다. nx.draw_networkx_edge_labels() 함수를 사용하면 엣지 위에 텍스트를 표시할 수 있습니다. get_edge_attributes(G, 'weight')로 모든 엣지의 가중치를 딕셔너리로 추출하고, 이를 edge_labels 파라미터에 전달합니다. 도시 간 거리, 비용, 시간 등을 엣지 위에 표시하면 한눈에 네트워크 특성을 파악할 수 있습니다.\r
\r
    get_edge_attributes()로 특정 속성만 추출하여 라벨로 표시합니다.\r
  snippet: |-\r
    posW = nx.spring_layout(wg, seed=42)\r
    fig2, ax2 = plt.subplots(figsize=(8, 6))\r
    nx.draw(wg, pos=posW, with_labels=True, node_color='lightgreen',\r
            node_size=1000, font_size=11, ax=ax2)\r
\r
    edgeLabels = nx.get_edge_attributes(wg, 'weight')\r
    nx.draw_networkx_edge_labels(wg, pos=posW, edge_labels=edgeLabels,\r
                                  font_size=10, ax=ax2)\r
    ax2.set_title('City Distance Network (km)')\r
    fig2\r
  exercise:\r
    prompt: 6단계. 가중치 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      posW = nx.spring_layout(wg, seed=42)\r
      fig2, ax2 = plt.subplots(figsize=(8, 6))\r
      nx.draw(wg, pos=posW, with_labels=True, node_color='lightgreen',\r
              node_size=1000, font_size=11, ax=ax2)\r
\r
      edgeLabels = nx.get_edge_attributes(wg, 'weight')\r
      nx.draw_networkx_edge_labels(wg, pos=posW, edge_labels=edgeLabels,\r
                                    font_size=10, ax=ax2)\r
      ax2.set_title('City Distance Network (km)')\r
      fig2\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 가중치 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 가중치 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_node_attr\r
  title: 7단계. 노드 속성\r
  structuredPrimary: true\r
  subtitle: 노드에 정보 추가\r
  goal: 7단계. 노드 속성에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    노드에도 다양한 속성을 추가할 수 있습니다. add_node(노드, 속성=값)처럼 키워드 인자로 전달합니다. 사람 노드에 나이, 성별, 도시 정보를 저장하거나, 도시 노드에 인구, 면적, 위도/경도를 저장할 수 있습니다. nodes(data=True)로 모든 노드와 속성을 조회하고, G.nodes[노드][속성]으로 특정 노드의 특정 속성에 접근합니다. 속성을 활용하면 특정 조건의 노드만 필터링하는 것도 가능합니다.\r
\r
    nodes(data=True)는 (노드, 속성딕셔너리) 튜플의 뷰를 반환합니다.\r
  snippet: |-\r
    social = nx.Graph()\r
    social.add_node("Alice", age=25, city="Seoul")\r
    social.add_node("Bob", age=30, city="Busan")\r
    social.add_node("Carol", age=28, city="Seoul")\r
    social.add_edge("Alice", "Bob")\r
    social.add_edge("Alice", "Carol")\r
    social.nodes(data=True)\r
  exercise:\r
    prompt: 7단계. 노드 속성 예제에서 \`social\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      social = nx.Graph()\r
      social.add_node("Alice", age=25, city="Seoul")\r
      social.add_node("Bob", age=30, city="Busan")\r
      social.add_node("Carol", age=28, city="Seoul")\r
      social.add_edge("Alice", "Bob")\r
      social.add_edge("Alice", "Carol")\r
      social.nodes(data=True)\r
    hints:\r
    - 바꿀 지점은 \`social = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`social\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 노드 속성에서 \`social\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 노드 속성 실행 뒤 \`social\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step8_edge_attr\r
  title: 8단계. 엣지 속성\r
  structuredPrimary: true\r
  subtitle: 다양한 엣지 정보\r
  goal: 8단계. 엣지 속성에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    엣지에는 weight 외에도 원하는 만큼 많은 속성을 추가할 수 있습니다. 관계 유형(친구, 동료, 가족), 관계 시작 연도, 상호작용 빈도 등 다양한 정보를 저장합니다. add_edge(u, v, 속성1=값1, 속성2=값2)처럼 여러 속성을 동시에 추가할 수 있습니다. G[u][v]로 엣지 속성 딕셔너리에 접근하고, 값을 읽거나 수정할 수 있습니다. 속성은 나중에 분석이나 시각화에 활용됩니다.\r
\r
    G[u][v]로 엣지 속성 딕셔너리에 접근하고 수정할 수 있습니다.\r
  snippet: |-\r
    relations = nx.Graph()\r
    relations.add_edge("A", "B", relation="friend", since=2020)\r
    relations.add_edge("A", "C", relation="colleague", since=2021)\r
    relations.add_edge("B", "C", relation="family", since=2015)\r
    relations.edges(data=True)\r
  exercise:\r
    prompt: 8단계. 엣지 속성 예제에서 \`relations\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      relations = nx.Graph()\r
      relations.add_edge("A", "B", relation="friend", since=2020)\r
      relations.add_edge("A", "C", relation="colleague", since=2021)\r
      relations.add_edge("B", "C", relation="family", since=2015)\r
      relations.edges(data=True)\r
    hints:\r
    - 바꿀 지점은 \`relations = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`relations\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 엣지 속성에서 \`relations\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 엣지 속성 실행 뒤 \`relations\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step9_color_by_attr\r
  title: 9단계. 속성으로 색상 지정\r
  structuredPrimary: true\r
  subtitle: 시각화 활용\r
  goal: 9단계. 속성으로 색상 지정에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    노드 속성에 따라 색상을 다르게 지정하면 시각화가 더 의미 있어집니다. 예를 들어 서울에 사는 사람은 파란색, 부산에 사는 사람은 빨간색으로 표시할 수 있습니다. 리스트 컴프리헨션을 사용해 각 노드의 속성값에 해당하는 색상 리스트를 만들고, 이를 node_color 파라미터에 전달합니다. 같은 방식으로 노드 크기(node_size)도 속성값에 비례하게 설정할 수 있습니다.\r
\r
    리스트 컴프리헨션으로 각 노드의 속성에 따른 색상 리스트를 만들어 node_color에 전달합니다.\r
  snippet: |-\r
    cityColors = {"Seoul": "skyblue", "Busan": "salmon"}\r
    nodeColors = [cityColors.get(social.nodes[n].get("city", "Seoul"), "gray")\r
                  for n in social.nodes()]\r
\r
    posSocial = nx.spring_layout(social, seed=42)\r
    fig3, ax3 = plt.subplots(figsize=(7, 5))\r
    nx.draw(social, pos=posSocial, with_labels=True, node_color=nodeColors,\r
            node_size=1000, font_size=11, ax=ax3)\r
    ax3.set_title('Social Network by City')\r
    fig3\r
  exercise:\r
    prompt: 9단계. 속성으로 색상 지정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      cityColors = {"Seoul": "skyblue", "Busan": "salmon"}\r
      nodeColors = [cityColors.get(social.nodes[n].get("city", "Seoul"), "gray")\r
                    for n in social.nodes()]\r
\r
      posSocial = nx.spring_layout(social, seed=42)\r
      fig3, ax3 = plt.subplots(figsize=(7, 5))\r
      nx.draw(social, pos=posSocial, with_labels=True, node_color=nodeColors,\r
              node_size=1000, font_size=11, ax=ax3)\r
      ax3.set_title('Social Network by City')\r
      fig3\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 속성으로 색상 지정의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 속성으로 색상 지정 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_road\r
  title: 10단계. 도로 네트워크 예제\r
  structuredPrimary: true\r
  subtitle: 종합 실습\r
  goal: 10단계. 도로 네트워크 예제에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 지금까지 배운 방향 그래프와 가중치를 모두 활용하여 도로 네트워크를 모델링합니다. 실제 도로망에는 일방통행(단방향)과 양방향 도로가 섞여 있습니다. 각 도로에는\r
    거리(distance)와 차선 수(lanes) 같은 속성이 있습니다. 양방향 도로는 양쪽 방향으로 엣지를 모두 추가해야 합니다. 완성된 도로 네트워크를 시각화하고, 각 교차로의\r
    진입/진출 차수를 분석합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    road = nx.DiGraph()\r
    road.add_edge("A", "B", distance=5, lanes=2)\r
    road.add_edge("B", "A", distance=5, lanes=2)\r
    road.add_edge("B", "C", distance=3, lanes=1)\r
    road.add_edge("A", "C", distance=10, lanes=3)\r
    road.add_edge("C", "D", distance=4, lanes=2)\r
    road.add_edge("D", "B", distance=6, lanes=1)\r
    road.edges(data=True)\r
  exercise:\r
    prompt: 10단계. 도로 네트워크 예제 예제에서 \`road\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      road = nx.DiGraph()\r
      road.add_edge("A", "B", distance=5, lanes=2)\r
      road.add_edge("B", "A", distance=5, lanes=2)\r
      road.add_edge("B", "C", distance=3, lanes=1)\r
      road.add_edge("A", "C", distance=10, lanes=3)\r
      road.add_edge("C", "D", distance=4, lanes=2)\r
      road.add_edge("D", "B", distance=6, lanes=1)\r
      road.edges(data=True)\r
    hints:\r
    - 바꿀 지점은 \`road = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`road\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 도로 네트워크 예제에서 \`road\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 도로 네트워크 예제 실행 뒤 \`road\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 방향과 가중치\r
  goal: 실습에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    이번 프로젝트에서 배운 방향 그래프(DiGraph), 진입/진출 차수, 가중치, 노드/엣지 속성을 활용하여 미션을 수행합니다. 미션1에서는 소셜 미디어의 팔로우 관계를 방향 그래프로 모델링하고, 미션2에서는 물류 네트워크의 운송 비용을 가중치 그래프로 분석합니다. 각 미션은 독립적으로 실행 가능합니다.\r
\r
    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  snippet: |-\r
    import networkx as nx\r
    import matplotlib.pyplot as plt\r
\r
    follow = nx.DiGraph()\r
    users = ["User1", "User2", "User3", "User4", "User5"]\r
    follow.add_nodes_from(users)\r
\r
    followEdges = [\r
        ("User1", "User2"),\r
        ("User1", "User3"),\r
        ("User2", "User3"),\r
        ("User3", "User1"),\r
        ("User4", "User1"),\r
        ("User4", "User2"),\r
        ("User5", "User1"),\r
        ("User5", "User2"),\r
        ("User5", "User3")\r
    ]\r
    follow.add_edges_from(followEdges)\r
    list(follow.edges())\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import networkx as nx\r
      import matplotlib.pyplot as plt\r
\r
      follow = nx.DiGraph()\r
      users = ["User1", "User2", "User3", "User4", "User5"]\r
      follow.add_nodes_from(users)\r
\r
      followEdges = [\r
          ("User1", "User2"),\r
          ("User1", "User3"),\r
          ("User2", "User3"),\r
          ("User3", "User1"),\r
          ("User4", "User1"),\r
          ("User4", "User2"),\r
          ("User5", "User1"),\r
          ("User5", "User2"),\r
          ("User5", "User3")\r
      ]\r
      follow.add_edges_from(followEdges)\r
      list(follow.edges())\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`follow\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
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