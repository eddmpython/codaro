var e=`meta:\r
  packages:\r
  - matplotlib\r
  - networkx\r
  id: networkx_01\r
  title: 첫그래프만들기\r
  order: 1\r
  category: networkx\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - networkx\r
  - Graph\r
  - 노드\r
  - 엣지\r
  - 시각화\r
  seo:\r
    title: NetworkX 첫걸음 - 그래프 생성과 시각화\r
    description: NetworkX로 첫 그래프를 만듭니다. 노드와 엣지를 추가하고 시각화하는 방법을 배웁니다.\r
    keywords:\r
    - networkx\r
    - Graph\r
    - 노드\r
    - 엣지\r
    - add_node\r
    - add_edge\r
    - 시각화\r
intro:\r
  emoji: 🌐\r
  goal: 그래프를 생성하고 노드/엣지를 추가하여 시각화합니다.\r
  description: NetworkX의 기본인 그래프 생성을 배웁니다. Graph() 객체를 만들고, add_node()와 add_edge()로 노드와 엣지를 추가합니다. nodes()와\r
    edges()로 그래프를 탐색하고, nx.draw()로 시각화합니다.\r
  direction: 첫그래프만들기에서 노드와 엣지를 모델링하고 경로, 중심성, 연결 구조를 검증합니다.\r
  benefits:\r
  - 관계 데이터 확인 후 그래프 알고리즘에 맞는 코드 입력을 고릅니다.\r
  - 첫그래프만들기 결과를 노드/엣지와 지표 값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 관계 분석 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(관계 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 빈 그래프 생성 처리 실행\r
      detail: 그래프 알고리즘 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 노드 추가 결과 검증\r
      detail: 노드/엣지와 지표 값 기준으로 실행 결과를 비교합니다.\r
    - label: 첫그래프만들기 재사용\r
      detail: 완성 코드를 관계 분석 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 그래프 분석 환경\r
      detail: matplotlib, networkx 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 첫그래프만들기 실행\r
      detail: 셀을 실행해 노드/엣지와 지표 값와 예외 상태를 확인합니다.\r
    - label: 첫그래프만들기 완료\r
      detail: 검증된 코드를 관계 분석 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: NetworkX와 시각화를 위한 matplotlib을 불러옵니다. networkx는 관례적으로 nx라는 별칭으로 임포트합니다. 이 별칭은 공식 문서와 대부분의\r
    튜토리얼에서 사용하는 표준이므로 그대로 따르는 것이 좋습니다. matplotlib.pyplot은 그래프를 그림으로 그릴 때 필요합니다. NetworkX 자체는 그래프 데이터 구조와\r
    알고리즘을 제공하고, 실제 시각화는 matplotlib이 담당합니다.\r
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
- id: step2_create\r
  title: 2단계. 빈 그래프 생성\r
  structuredPrimary: true\r
  subtitle: Graph()\r
  goal: 2단계. 빈 그래프 생성에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    nx.Graph()를 호출하면 빈 무방향 그래프 객체가 생성됩니다. 이 시점에서는 노드도 엣지도 없는 빈 컨테이너입니다. 변수명은 관례적으로 대문자 G를 사용하지만, 여러 그래프를 다룰 때는 의미 있는 이름(friends, network, road 등)을 사용하는 것이 좋습니다. 무방향 그래프는 엣지에 방향이 없어서 A-B 연결이 있으면 A에서 B로, B에서 A로 모두 이동 가능합니다.\r
\r
    Graph()는 무방향 그래프입니다. 방향 그래프는 DiGraph()를 사용합니다. 다음 프로젝트에서 배웁니다.\r
  snippet: |-\r
    G = nx.Graph()\r
    G\r
  exercise:\r
    prompt: 2단계. 빈 그래프 생성 예제에서 \`G\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      G = nx.Graph()\r
      G\r
    hints:\r
    - 바꿀 지점은 \`G = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`G\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 빈 그래프 생성에서 \`G\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 빈 그래프 생성 실행 뒤 \`G\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step3_add_nodes\r
  title: 3단계. 노드 추가\r
  structuredPrimary: true\r
  subtitle: add_node()\r
  goal: 3단계. 노드 추가에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    add_node() 메서드로 그래프에 노드를 하나씩 추가합니다. 노드는 해시 가능한(hashable) 모든 파이썬 객체가 될 수 있습니다. 정수(1, 2, 3), 문자열('Alice', 'Bob'), 튜플((0, 1)) 등을 노드로 사용할 수 있습니다. 다만 리스트나 딕셔너리처럼 변경 가능한(mutable) 객체는 노드가 될 수 없습니다. 실무에서는 사람 이름, 도시 이름, 제품 ID 등 의미 있는 식별자를 노드로 사용합니다.\r
\r
    add_nodes_from()은 리스트나 이터러블을 받아 여러 노드를 한번에 추가합니다.\r
  snippet: |-\r
    G1 = nx.Graph()\r
    G1.add_node(1)\r
    G1.add_node(2)\r
    G1.add_node("A")\r
    list(G1.nodes())\r
  exercise:\r
    prompt: 3단계. 노드 추가 예제에서 \`G1\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      G1 = nx.Graph()\r
      G1.add_node(1)\r
      G1.add_node(2)\r
      G1.add_node("A")\r
      list(G1.nodes())\r
    hints:\r
    - 바꿀 지점은 \`G1 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`G1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 노드 추가에서 \`G1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 노드 추가 실행 뒤 \`G1\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step4_add_edges\r
  title: 4단계. 엣지 추가\r
  structuredPrimary: true\r
  subtitle: add_edge()\r
  goal: 4단계. 엣지 추가에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    add_edge(u, v) 메서드로 노드 u와 노드 v 사이에 엣지(연결)를 추가합니다. 네트워크 분석에서 엣지는 관계를 나타냅니다. 친구 관계, 도로 연결, 협업 관계 등이 엣지가 됩니다. add_edge()의 편리한 점은 노드가 아직 존재하지 않아도 자동으로 생성해준다는 것입니다. 노드를 먼저 추가하지 않고 바로 엣지를 추가해도 됩니다. 여러 엣지를 한번에 추가할 때는 add_edges_from()에 튜플 리스트를 전달합니다.\r
\r
    엣지를 추가할 때 노드가 없으면 자동 생성됩니다. 노드를 먼저 추가하지 않아도 됩니다.\r
  snippet: |-\r
    G3 = nx.Graph()\r
    G3.add_edge(1, 2)\r
    G3.add_edge(2, 3)\r
    G3.add_edge(1, 3)\r
    list(G3.edges())\r
  exercise:\r
    prompt: 4단계. 엣지 추가 예제에서 \`G3\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      G3 = nx.Graph()\r
      G3.add_edge(1, 2)\r
      G3.add_edge(2, 3)\r
      G3.add_edge(1, 3)\r
      list(G3.edges())\r
    hints:\r
    - 바꿀 지점은 \`G3 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`G3\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 엣지 추가에서 \`G3\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 엣지 추가 실행 뒤 \`G3\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step5_explore\r
  title: 5단계. 그래프 탐색\r
  structuredPrimary: true\r
  subtitle: nodes(), edges(), degree()\r
  goal: 5단계. 그래프 탐색에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    그래프를 생성했으면 그 구조를 탐색해야 합니다. nodes()는 모든 노드를, edges()는 모든 엣지를 반환합니다. degree(노드)는 해당 노드의 차수, 즉 연결된 엣지의 개수를 반환합니다. 차수가 높은 노드는 많은 관계를 가진 중요한 노드입니다. neighbors(노드)는 해당 노드와 직접 연결된 이웃 노드들을 반환합니다. 이 기본 메서드들로 네트워크의 구조를 파악하고, 특정 노드의 연결 상태를 확인할 수 있습니다.\r
\r
    degree(노드)는 해당 노드의 연결 수입니다. neighbors(노드)는 연결된 이웃 노드 목록입니다.\r
  snippet: |-\r
    G5 = nx.Graph()\r
    G5.add_edges_from([(1, 2), (1, 3), (1, 4), (2, 3)])\r
    nodeList = list(G5.nodes())\r
    edgeList5 = list(G5.edges())\r
    nodeList, edgeList5\r
  exercise:\r
    prompt: 5단계. 그래프 탐색 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      G5 = nx.Graph()\r
      G5.add_edges_from([(1, 2), (1, 3), (1, 4), (2, 3)])\r
      nodeList = list(G5.nodes())\r
      edgeList5 = list(G5.edges())\r
      nodeList, edgeList5\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 그래프 탐색에서 \`G5\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 그래프 탐색 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_visualize\r
  title: 6단계. 그래프 시각화\r
  structuredPrimary: true\r
  subtitle: nx.draw()\r
  goal: 6단계. 그래프 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    nx.draw() 함수로 그래프를 시각적으로 표현합니다. 노드는 원으로, 엣지는 선으로 그려집니다. with_labels=True를 설정하면 노드 안에 라벨(노드 이름)이 표시됩니다. node_color로 노드 색상, node_size로 노드 크기, edge_color로 엣지 색상을 지정할 수 있습니다. matplotlib의 Figure와 Axes를 사용하면 더 세밀한 제어가 가능합니다. 시각화는 네트워크 구조를 직관적으로 이해하는 데 매우 유용합니다.\r
\r
    with_labels=True로 노드 라벨을 표시합니다. node_color, node_size, edge_color 등으로 스타일을 지정합니다.\r
  snippet: |-\r
    G6 = nx.Graph()\r
    G6.add_edges_from([(1, 2), (1, 3), (2, 3), (3, 4)])\r
\r
    fig1, ax1 = plt.subplots(figsize=(6, 4))\r
    nx.draw(G6, with_labels=True, ax=ax1)\r
    ax1.set_title('Simple Graph')\r
    fig1\r
  exercise:\r
    prompt: 6단계. 그래프 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      G6 = nx.Graph()\r
      G6.add_edges_from([(1, 2), (1, 3), (2, 3), (3, 4)])\r
\r
      fig1, ax1 = plt.subplots(figsize=(6, 4))\r
      nx.draw(G6, with_labels=True, ax=ax1)\r
      ax1.set_title('Simple Graph')\r
      fig1\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 그래프 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 그래프 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_layout\r
  title: 7단계. 레이아웃\r
  structuredPrimary: true\r
  subtitle: 노드 위치 결정\r
  goal: 7단계. 레이아웃에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    레이아웃(layout)은 2D 평면에서 노드의 위치를 결정하는 알고리즘입니다. spring_layout은 물리적인 스프링 시뮬레이션을 사용합니다. 연결된 노드 사이에는 인력이, 모든 노드 사이에는 척력이 작용한다고 가정하여 균형 위치를 찾습니다. 결과적으로 연결된 노드는 가까이, 연결되지 않은 노드는 멀리 배치됩니다. circular_layout은 모든 노드를 원형으로 배치합니다. 레이아웃 함수는 노드 이름을 키로, 좌표를 값으로 하는 딕셔너리를 반환합니다.\r
\r
    seed 파라미터를 설정하면 매번 같은 레이아웃을 얻습니다. 재현성을 위해 seed를 지정하세요.\r
  snippet: |-\r
    G7 = nx.Graph()\r
    G7.add_edges_from([(1, 2), (1, 3), (2, 3), (3, 4), (4, 5), (5, 6)])\r
\r
    pos7 = nx.spring_layout(G7, seed=42)\r
    fig3, ax3 = plt.subplots(figsize=(6, 4))\r
    nx.draw(G7, pos=pos7, with_labels=True, node_color='lightgreen',\r
            node_size=600, ax=ax3)\r
    ax3.set_title('Spring Layout')\r
    fig3\r
  exercise:\r
    prompt: 7단계. 레이아웃 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      G7 = nx.Graph()\r
      G7.add_edges_from([(1, 2), (1, 3), (2, 3), (3, 4), (4, 5), (5, 6)])\r
\r
      pos7 = nx.spring_layout(G7, seed=42)\r
      fig3, ax3 = plt.subplots(figsize=(6, 4))\r
      nx.draw(G7, pos=pos7, with_labels=True, node_color='lightgreen',\r
              node_size=600, ax=ax3)\r
      ax3.set_title('Spring Layout')\r
      fig3\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 레이아웃의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 레이아웃의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_friends\r
  title: 8단계. 친구 네트워크 만들기\r
  structuredPrimary: true\r
  subtitle: 실습 예제\r
  goal: 8단계. 친구 네트워크 만들기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 지금까지 배운 내용을 종합하여 실제 친구 관계 네트워크를 만들어봅시다. 사람 이름을 노드로, 친구 관계를 엣지로 표현합니다. 먼저 노드(사람들)를 추가하고,\r
    친구 관계를 엣지로 연결합니다. 그런 다음 시각화하여 누가 누구와 연결되어 있는지 한눈에 확인합니다. 마지막으로 각 사람의 친구 수(차수)를 분석하여 가장 인기 있는 사람을 찾아봅니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    friends = nx.Graph()\r
    friendNames = ["Alice", "Bob", "Carol", "David", "Eve"]\r
    friends.add_nodes_from(friendNames)\r
\r
    friendships = [\r
        ("Alice", "Bob"),\r
        ("Alice", "Carol"),\r
        ("Bob", "Carol"),\r
        ("Bob", "David"),\r
        ("Carol", "Eve"),\r
        ("David", "Eve")\r
    ]\r
    friends.add_edges_from(friendships)\r
    friends.number_of_nodes(), friends.number_of_edges()\r
  exercise:\r
    prompt: 8단계. 친구 네트워크 만들기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      friends = nx.Graph()\r
      friendNames = ["Alice", "Bob", "Carol", "David", "Eve"]\r
      friends.add_nodes_from(friendNames)\r
\r
      friendships = [\r
          ("Alice", "Bob"),\r
          ("Alice", "Carol"),\r
          ("Bob", "Carol"),\r
          ("Bob", "David"),\r
          ("Carol", "Eve"),\r
          ("David", "Eve")\r
      ]\r
      friends.add_edges_from(friendships)\r
      friends.number_of_nodes(), friends.number_of_edges()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 친구 네트워크 만들기에서 \`friends\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 친구 네트워크 만들기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_check\r
  title: 9단계. 연결 확인\r
  structuredPrimary: true\r
  subtitle: has_node(), has_edge()\r
  goal: 9단계. 연결 확인에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    그래프에 특정 노드나 엣지가 있는지 확인해야 할 때가 있습니다. has_node(노드)는 해당 노드가 그래프에 존재하면 True, 없으면 False를 반환합니다. has_edge(u, v)는 노드 u와 v 사이에 엣지가 있으면 True를 반환합니다. 이 메서드들은 조건문과 함께 사용하여 노드나 엣지가 있을 때만 특정 작업을 수행하도록 할 수 있습니다. 존재하지 않는 노드에 접근하면 에러가 발생하므로 사전 확인이 중요합니다.\r
\r
    has_node()와 has_edge()는 True/False를 반환합니다. 노드나 연결 존재 여부를 빠르게 확인할 수 있습니다.\r
  snippet: |-\r
    hasAlice = friends.has_node("Alice")\r
    hasFrank = friends.has_node("Frank")\r
    hasAlice, hasFrank\r
  exercise:\r
    prompt: 9단계. 연결 확인 예제에서 \`hasAlice\`, \`hasFrank\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      hasAlice = friends.has_node("Alice")\r
      hasFrank = friends.has_node("Frank")\r
      hasAlice, hasFrank\r
    hints:\r
    - 바꿀 지점은 \`hasAlice = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`hasAlice\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 연결 확인에서 \`hasAlice\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 연결 확인 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step10_remove\r
  title: 10단계. 노드/엣지 삭제\r
  structuredPrimary: true\r
  subtitle: remove_node(), remove_edge()\r
  goal: 10단계. 노드/엣지 삭제에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    그래프에서 노드나 엣지를 삭제할 수 있습니다. remove_edge(u, v)는 두 노드 사이의 연결만 끊고 노드는 그대로 남깁니다. remove_node(노드)는 해당 노드를 삭제하는데, 이때 그 노드와 연결된 모든 엣지도 자동으로 함께 삭제됩니다. 예를 들어 친구 네트워크에서 한 사람을 삭제하면 그 사람과의 모든 친구 관계도 사라집니다. 삭제 작업은 원본 그래프를 직접 수정하므로 주의가 필요합니다.\r
\r
    노드를 삭제하면 해당 노드와 연결된 모든 엣지가 자동으로 삭제됩니다.\r
  snippet: |-\r
    G8 = nx.Graph()\r
    G8.add_edges_from([(1, 2), (2, 3), (3, 1)])\r
    G8.remove_edge(1, 2)\r
    list(G8.edges())\r
  exercise:\r
    prompt: 10단계. 노드/엣지 삭제 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      G8 = nx.Graph()\r
      G8.add_edges_from([(1, 2), (2, 3), (3, 1)])\r
      G8.remove_edge(1, 2)\r
      list(G8.edges())\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 노드/엣지 삭제에서 \`G8\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 노드/엣지 삭제 실행 뒤 \`G8\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 그래프 만들기\r
  goal: 실습에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 그래프 생성, 노드/엣지 추가, 탐색, 시각화 기능을 활용하여 미션을 수행해봅시다. 미션1에서는 팀 조직도를 네트워크로 표현하고, 미션2에서는 중심 노드와 외곽 노드로 구성된 별 모양 그래프를 만듭니다. 각 미션은 독립적으로 실행 가능하며, 앞에서 배운 모든 개념을 종합적으로 활용합니다.\r
\r
    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  snippet: |-\r
    import networkx as nx\r
    import matplotlib.pyplot as plt\r
\r
    team = nx.Graph()\r
    members = ["Leader", "Dev1", "Dev2", "Designer", "PM"]\r
    team.add_nodes_from(members)\r
\r
    teamLinks = [\r
        ("Leader", "Dev1"),\r
        ("Leader", "Dev2"),\r
        ("Leader", "Designer"),\r
        ("Leader", "PM"),\r
        ("Dev1", "Dev2"),\r
        ("Designer", "PM")\r
    ]\r
    team.add_edges_from(teamLinks)\r
    team.number_of_nodes(), team.number_of_edges()\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import networkx as nx\r
      import matplotlib.pyplot as plt\r
\r
      team = nx.Graph()\r
      members = ["Leader", "Dev1", "Dev2", "Designer", "PM"]\r
      team.add_nodes_from(members)\r
\r
      teamLinks = [\r
          ("Leader", "Dev1"),\r
          ("Leader", "Dev2"),\r
          ("Leader", "Designer"),\r
          ("Leader", "PM"),\r
          ("Dev1", "Dev2"),\r
          ("Designer", "PM")\r
      ]\r
      team.add_edges_from(teamLinks)\r
      team.number_of_nodes(), team.number_of_edges()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`team\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
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