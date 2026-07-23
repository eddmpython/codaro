var e=`meta:\r
  packages:\r
  - matplotlib\r
  - networkx\r
  id: networkx_03\r
  title: 최단경로찾기\r
  order: 3\r
  category: networkx\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - networkx\r
  - 최단경로\r
  - shortest_path\r
  - 다익스트라\r
  - 경로탐색\r
  seo:\r
    title: NetworkX 최단 경로 - shortest_path와 다익스트라\r
    description: NetworkX로 두 노드 사이 최단 경로를 찾습니다. 가중치 없는 경로와 다익스트라 알고리즘을 배웁니다.\r
    keywords:\r
    - networkx\r
    - 최단경로\r
    - shortest_path\r
    - 다익스트라\r
    - dijkstra\r
    - 경로\r
intro:\r
  emoji: 🛤️\r
  goal: 두 노드 사이 최단 경로를 찾고 경로 관련 함수를 활용합니다.\r
  description: 최단 경로는 네트워크 분석의 핵심입니다. shortest_path()로 경로를 찾고, has_path()로 연결 여부를 확인합니다. 가중치가 있으면 다익스트라\r
    알고리즘이 적용됩니다. 지하철 노선도 예제로 실습합니다.\r
  direction: 최단경로찾기에서 노드와 엣지를 모델링하고 경로, 중심성, 연결 구조를 검증합니다.\r
  benefits:\r
  - 관계 데이터 확인 후 그래프 알고리즘에 맞는 코드 입력을 고릅니다.\r
  - 최단경로찾기 결과를 노드/엣지와 지표 값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 관계 분석 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(관계 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기본 최단 경로 처리 실행\r
      detail: 그래프 알고리즘 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 연결 확인 결과 검증\r
      detail: 노드/엣지와 지표 값 기준으로 실행 결과를 비교합니다.\r
    - label: 최단경로찾기 재사용\r
      detail: 완성 코드를 관계 분석 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 그래프 분석 환경\r
      detail: matplotlib, networkx 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 최단경로찾기 실행\r
      detail: 셀을 실행해 노드/엣지와 지표 값와 예외 상태를 확인합니다.\r
    - label: 최단경로찾기 완료\r
      detail: 검증된 코드를 관계 분석 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: NetworkX와 matplotlib을 불러옵니다. NetworkX는 그래프 알고리즘을 제공하고, matplotlib은 경로 시각화에 사용됩니다. 최단 경로\r
    알고리즘은 네트워크 분석의 핵심으로, 내비게이션, 소셜 네트워크의 관계 거리, 통신망 라우팅 등 다양한 분야에서 활용됩니다.\r
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
- id: step2_simple_path\r
  title: 2단계. 기본 최단 경로\r
  structuredPrimary: true\r
  subtitle: shortest_path()\r
  goal: 2단계. 기본 최단 경로에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    shortest_path(G, source, target)로 두 노드 사이 최단 경로를 찾습니다. 가중치가 없으면 BFS(너비 우선 탐색)를 사용하여 엣지 수가 가장 적은 경로를 반환합니다. 최단 경로는 출발 노드부터 도착 노드까지 거쳐가는 노드들의 리스트로 반환됩니다. shortest_path_length()는 경로의 길이(엣지 수)만 반환하여 메모리를 절약할 수 있습니다.\r
\r
    경로 길이는 경로에 포함된 엣지의 수입니다. 노드 수 - 1과 같습니다.\r
  snippet: |-\r
    G = nx.Graph()\r
    G.add_edges_from([\r
        (1, 2), (1, 3), (2, 3), (2, 4),\r
        (3, 4), (3, 5), (4, 5), (4, 6), (5, 6)\r
    ])\r
    list(G.edges())\r
  exercise:\r
    prompt: 2단계. 기본 최단 경로 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      G = nx.Graph()\r
      G.add_edges_from([\r
          (1, 2), (1, 3), (2, 3), (2, 4),\r
          (3, 4), (3, 5), (4, 5), (4, 6), (5, 6)\r
      ])\r
      list(G.edges())\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 기본 최단 경로에서 \`G\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 기본 최단 경로 실행 뒤 \`G\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step3_has_path\r
  title: 3단계. 연결 확인\r
  structuredPrimary: true\r
  subtitle: has_path()\r
  goal: 3단계. 연결 확인에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    has_path()로 두 노드가 연결되어 있는지 확인합니다. 그래프가 여러 컴포넌트로 분리된 경우, 서로 다른 컴포넌트에 속한 노드 사이에는 경로가 존재하지 않습니다. shortest_path()를 호출하기 전에 has_path()로 연결 여부를 먼저 확인하면 NetworkXNoPath 예외를 방지할 수 있습니다. 대규모 네트워크에서는 이 확인이 중요합니다.\r
\r
    연결되지 않은 노드 사이에 shortest_path()를 호출하면 NetworkXNoPath 예외가 발생합니다.\r
  snippet: |-\r
    G2 = nx.Graph()\r
    G2.add_edges_from([(1, 2), (2, 3)])\r
    G2.add_edges_from([(4, 5), (5, 6)])\r
    list(G2.edges())\r
  exercise:\r
    prompt: 3단계. 연결 확인 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      G2 = nx.Graph()\r
      G2.add_edges_from([(1, 2), (2, 3)])\r
      G2.add_edges_from([(4, 5), (5, 6)])\r
      list(G2.edges())\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 연결 확인에서 \`G2\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 연결 확인 실행 뒤 \`G2\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step4_all_paths\r
  title: 4단계. 모든 경로 찾기\r
  structuredPrimary: true\r
  subtitle: all_simple_paths()\r
  goal: 4단계. 모든 경로 찾기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    all_simple_paths()로 두 노드 사이의 모든 단순 경로를 찾습니다. 단순 경로(simple path)는 같은 노드를 두 번 방문하지 않는 경로입니다. 이 함수는 제너레이터를 반환하므로 메모리 효율적입니다. 큰 그래프에서는 경로 수가 기하급수적으로 증가할 수 있어 cutoff 파라미터로 최대 경로 길이를 제한하는 것이 권장됩니다.\r
\r
    큰 그래프에서는 경로 수가 폭발적으로 증가합니다. cutoff 파라미터로 최대 길이를 제한하세요.\r
  snippet: |-\r
    allPaths = list(nx.all_simple_paths(G, source=1, target=6))\r
    allPaths\r
  exercise:\r
    prompt: 4단계. 모든 경로 찾기 예제에서 \`allPaths\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      allPaths = list(nx.all_simple_paths(G, source=1, target=6))\r
      allPaths\r
    hints:\r
    - 바꿀 지점은 \`allPaths = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`allPaths\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 모든 경로 찾기에서 \`allPaths\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 모든 경로 찾기 실행 뒤 \`allPaths\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step5_weighted\r
  title: 5단계. 가중치 최단 경로\r
  structuredPrimary: true\r
  subtitle: 다익스트라 알고리즘\r
  goal: 5단계. 가중치 최단 경로에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    가중치 그래프에서는 엣지 수가 아닌 가중치 합이 최소인 경로를 찾습니다. weight 파라미터로 엣지 속성 이름을 지정하면 다익스트라(Dijkstra) 알고리즘이 자동으로 적용됩니다. 다익스트라 알고리즘은 1956년 에츠허르 다익스트라가 개발한 알고리즘으로, 음수가 아닌 가중치를 가진 그래프에서 최적의 경로를 보장합니다. GPS 내비게이션, 네트워크 라우팅 프로토콜(OSPF) 등에서 핵심적으로 사용됩니다.\r
\r
    weight="weight"를 지정하면 다익스트라 알고리즘이 적용됩니다. 가중치 합이 최소인 경로를 찾습니다.\r
  snippet: |-\r
    cities = nx.Graph()\r
    cities.add_edge("Seoul", "Daejeon", weight=140)\r
    cities.add_edge("Seoul", "Wonju", weight=120)\r
    cities.add_edge("Daejeon", "Daegu", weight=120)\r
    cities.add_edge("Wonju", "Daegu", weight=180)\r
    cities.add_edge("Daegu", "Busan", weight=90)\r
    cities.add_edge("Daejeon", "Gwangju", weight=150)\r
    cities.edges(data=True)\r
  exercise:\r
    prompt: 5단계. 가중치 최단 경로 예제에서 \`cities\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      cities = nx.Graph()\r
      cities.add_edge("Seoul", "Daejeon", weight=140)\r
      cities.add_edge("Seoul", "Wonju", weight=120)\r
      cities.add_edge("Daejeon", "Daegu", weight=120)\r
      cities.add_edge("Wonju", "Daegu", weight=180)\r
      cities.add_edge("Daegu", "Busan", weight=90)\r
      cities.add_edge("Daejeon", "Gwangju", weight=150)\r
      cities.edges(data=True)\r
    hints:\r
    - 바꿀 지점은 \`cities = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`cities\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 가중치 최단 경로에서 \`cities\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 가중치 최단 경로 실행 뒤 \`cities\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step6_visualize_path\r
  title: 6단계. 경로 시각화\r
  structuredPrimary: true\r
  subtitle: 경로 강조 표시\r
  goal: 6단계. 경로 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    최단 경로를 시각화에서 강조하면 결과를 직관적으로 이해할 수 있습니다. 노드 리스트로 된 경로를 엣지 리스트로 변환한 뒤, draw_networkx_edges()로 해당 엣지만 다른 색상이나 두께로 그립니다. 배경 그래프는 연한 색으로, 경로는 눈에 띄는 색으로 표현하는 것이 효과적입니다.\r
\r
    draw_networkx_edges()와 draw_networkx_nodes()로 특정 엣지나 노드만 다르게 그릴 수 있습니다.\r
  snippet: |-\r
    pathSB = nx.shortest_path(cities, "Seoul", "Busan", weight="weight")\r
    pathEdges = list(zip(pathSB[:-1], pathSB[1:]))\r
    pathEdges\r
  exercise:\r
    prompt: 6단계. 경로 시각화 예제에서 출발/도착 도시를 바꾸고 경로 엣지 리스트가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pathSB = nx.shortest_path(cities, "Seoul", "Busan", weight="weight")\r
      pathEdges = list(zip(pathSB[:-1], pathSB[1:]))\r
      pathEdges\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 경로 시각화에서 \`pathEdges\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 경로 시각화 실행 뒤 \`pathEdges\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step7_all_shortest\r
  title: 7단계. 모든 최단 경로\r
  structuredPrimary: true\r
  subtitle: 한 노드에서 모든 노드로\r
  goal: 7단계. 모든 최단 경로에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    source만 지정하고 target을 생략하면 해당 노드에서 도달 가능한 모든 노드까지의 최단 경로를 한 번에 계산합니다. 결과는 딕셔너리 형태로 반환되어 각 목적지별 경로를 쉽게 조회할 수 있습니다. 이 방식은 개별적으로 여러 번 호출하는 것보다 효율적이며, 한 지점에서 전체 네트워크로의 접근성을 분석할 때 유용합니다.\r
\r
    target을 생략하면 source에서 도달 가능한 모든 노드까지의 경로/거리를 반환합니다.\r
  snippet: |-\r
    allFromSeoul = nx.shortest_path(cities, source="Seoul", weight="weight")\r
    allFromSeoul\r
  exercise:\r
    prompt: 7단계. 모든 최단 경로 예제에서 \`allFromSeoul\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      allFromSeoul = nx.shortest_path(cities, source="Seoul", weight="weight")\r
      allFromSeoul\r
    hints:\r
    - 바꿀 지점은 \`allFromSeoul = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`allFromSeoul\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 모든 최단 경로에서 \`allFromSeoul\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 모든 최단 경로 실행 뒤 \`allFromSeoul\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step8_subway\r
  title: 8단계. 지하철 노선도\r
  structuredPrimary: true\r
  subtitle: 실제 예제\r
  goal: 8단계. 지하철 노선도에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 지하철 노선도를 그래프로 모델링합니다. 각 역은 노드로, 역 사이 구간은 엣지로, 이동 소요시간은 엣지의 가중치로 표현합니다. 이런 모델링을 통해 최단 시간\r
    경로, 최소 환승 경로 등 다양한 경로 탐색 문제를 해결할 수 있습니다. 실제 지하철 앱들도 이와 유사한 그래프 알고리즘을 사용하여 경로를 추천합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    subway = nx.Graph()\r
    subwayEdges = [\r
        ("Gangnam", "Yeoksam", 2),\r
        ("Yeoksam", "Seolleung", 2),\r
        ("Seolleung", "Samsung", 3),\r
        ("Samsung", "Jamsil", 5),\r
        ("Gangnam", "Express", 3),\r
        ("Express", "Sinnonhyeon", 2),\r
        ("Sinnonhyeon", "Nonhyeon", 2),\r
        ("Nonhyeon", "Hakdong", 2),\r
        ("Hakdong", "Samsung", 4)\r
    ]\r
    for u, v, t in subwayEdges:\r
        subway.add_edge(u, v, time=t)\r
    subway.edges(data=True)\r
  exercise:\r
    prompt: 8단계. 지하철 노선도 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      subway = nx.Graph()\r
      subwayEdges = [\r
          ("Gangnam", "Yeoksam", 2),\r
          ("Yeoksam", "Seolleung", 2),\r
          ("Seolleung", "Samsung", 3),\r
          ("Samsung", "Jamsil", 5),\r
          ("Gangnam", "Express", 3),\r
          ("Express", "Sinnonhyeon", 2),\r
          ("Sinnonhyeon", "Nonhyeon", 2),\r
          ("Nonhyeon", "Hakdong", 2),\r
          ("Hakdong", "Samsung", 4)\r
      ]\r
      for u, v, t in subwayEdges:\r
          subway.add_edge(u, v, time=t)\r
      subway.edges(data=True)\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 지하철 노선도의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. 지하철 노선도 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_diameter\r
  title: 9단계. 그래프 지름\r
  structuredPrimary: true\r
  subtitle: 가장 먼 두 노드\r
  goal: 9단계. 그래프 지름에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    그래프의 지름(diameter)은 모든 노드 쌍 중 최단 경로가 가장 긴 것의 길이입니다. 네트워크의 '최대 거리'를 나타내며, 두 노드가 최악의 경우에도 몇 단계 내에 연결되는지를 의미합니다. 반지름(radius)은 중심 노드에서 가장 먼 노드까지의 거리입니다. 중심(center)은 이심률이 반지름과 같은 노드들로, 네트워크에서 가장 접근성이 좋은 위치입니다.\r
\r
    중심(center)은 모든 노드까지의 최대 거리가 최소인 노드입니다. 네트워크에서 가장 접근성이 좋은 위치입니다.\r
  snippet: |-\r
    diameter = nx.diameter(G)\r
    diameter\r
  exercise:\r
    prompt: 9단계. 그래프 지름 예제에서 \`diameter\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      diameter = nx.diameter(G)\r
      diameter\r
    hints:\r
    - 바꿀 지점은 \`diameter = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`diameter\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 그래프 지름에서 \`diameter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 그래프 지름 실행 뒤 \`diameter\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step10_eccentricity\r
  title: 10단계. 이심률\r
  structuredPrimary: true\r
  subtitle: eccentricity\r
  goal: 10단계. 이심률에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    이심률(eccentricity)은 한 노드에서 가장 먼 노드까지의 최단 경로 길이입니다. 각 노드가 네트워크에서 얼마나 중심에 있는지 또는 외곽에 있는지를 나타냅니다. 모든 노드의 이심률 중 최대가 지름(diameter), 최소가 반지름(radius)입니다. periphery(주변부)는 이심률이 지름과 같은 노드들로, 네트워크의 가장 바깥에 위치합니다.\r
\r
    periphery는 이심률이 지름과 같은 노드들입니다. 네트워크의 가장 바깥에 위치합니다.\r
  snippet: |-\r
    ecc = nx.eccentricity(G)\r
    ecc\r
  exercise:\r
    prompt: 10단계. 이심률 예제에서 \`ecc\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      ecc = nx.eccentricity(G)\r
      ecc\r
    hints:\r
    - 바꿀 지점은 \`ecc = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`ecc\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 이심률에서 \`ecc\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 이심률 실행 뒤 \`ecc\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 경로 탐색\r
  goal: 실습에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 최단 경로 알고리즘을 활용하여 실전 미션을 수행해봅시다. 항공 네트워크에서 최적 경로를 찾고, 게임 맵에서 보스까지의 경로를 탐색합니다. 실제 응용에서 어떻게 활용되는지 경험해보세요.\r
\r
    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  snippet: |-\r
    import networkx as nx\r
    import matplotlib.pyplot as plt\r
\r
    flight = nx.Graph()\r
    flightRoutes = [\r
        ("ICN", "NRT", 2),\r
        ("ICN", "PEK", 2),\r
        ("ICN", "HKG", 3),\r
        ("NRT", "LAX", 11),\r
        ("PEK", "LAX", 12),\r
        ("HKG", "SIN", 4),\r
        ("SIN", "SYD", 8),\r
        ("LAX", "JFK", 5),\r
        ("LAX", "SYD", 15)\r
    ]\r
    for u, v, h in flightRoutes:\r
        flight.add_edge(u, v, hours=h)\r
    flight.edges(data=True)\r
  exercise:\r
    prompt: 실습 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import networkx as nx\r
      import matplotlib.pyplot as plt\r
\r
      flight = nx.Graph()\r
      flightRoutes = [\r
          ("ICN", "NRT", 2),\r
          ("ICN", "PEK", 2),\r
          ("ICN", "HKG", 3),\r
          ("NRT", "LAX", 11),\r
          ("PEK", "LAX", 12),\r
          ("HKG", "SIN", 4),\r
          ("SIN", "SYD", 8),\r
          ("LAX", "JFK", 5),\r
          ("LAX", "SYD", 15)\r
      ]\r
      for u, v, h in flightRoutes:\r
          flight.add_edge(u, v, hours=h)\r
      flight.edges(data=True)\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
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