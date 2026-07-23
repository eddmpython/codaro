var e=`meta:\r
  packages:\r
  - matplotlib\r
  - networkx\r
  id: networkx_06\r
  title: 연결성분석\r
  order: 6\r
  category: networkx\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - networkx\r
  - 연결성\r
  - 컴포넌트\r
  - 브릿지\r
  - 절단점\r
  seo:\r
    title: NetworkX 연결성 분석 - 컴포넌트와 취약점\r
    description: NetworkX로 네트워크의 연결 구조를 분석합니다. 연결 컴포넌트, 브릿지, 절단점을 찾아 취약점을 파악합니다.\r
    keywords:\r
    - networkx\r
    - 연결성\r
    - component\r
    - bridge\r
    - articulation\r
    - 취약점\r
intro:\r
  emoji: 🔗\r
  goal: 네트워크의 연결 구조를 분석하고 취약점을 찾습니다.\r
  description: 연결성 분석은 네트워크의 구조적 특성을 파악합니다. 연결 컴포넌트는 서로 도달 가능한 노드 그룹입니다. 브릿지와 절단점은 제거 시 네트워크가 분리되는 취약점입니다.\r
    네트워크 안정성 평가에 중요합니다.\r
  direction: 연결성분석에서 노드와 엣지를 모델링하고 경로, 중심성, 연결 구조를 검증합니다.\r
  benefits:\r
  - 관계 데이터 확인 후 그래프 알고리즘에 맞는 코드 입력을 고릅니다.\r
  - 연결성분석 결과를 노드/엣지와 지표 값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 관계 분석 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(관계 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 연결 그래프 처리 실행\r
      detail: 그래프 알고리즘 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 연결 컴포넌트 결과 검증\r
      detail: 노드/엣지와 지표 값 기준으로 실행 결과를 비교합니다.\r
    - label: 연결성분석 재사용\r
      detail: 완성 코드를 관계 분석 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 그래프 분석 환경\r
      detail: matplotlib, networkx 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 연결성분석 실행\r
      detail: 셀을 실행해 노드/엣지와 지표 값와 예외 상태를 확인합니다.\r
    - label: 연결성분석 완료\r
      detail: 검증된 코드를 관계 분석 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: NetworkX와 matplotlib을 불러옵니다. 연결성 분석은 네트워크의 구조적 안정성과 취약점을 파악하는 핵심 기법입니다. 통신망, 전력망, 교통망 등\r
    인프라 네트워크에서 어떤 부분이 고장나면 전체 시스템에 영향을 미치는지, 네트워크가 얼마나 견고한지를 분석합니다.\r
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
- id: step2_connected\r
  title: 2단계. 연결 그래프\r
  structuredPrimary: true\r
  subtitle: is_connected()\r
  goal: 2단계. 연결 그래프에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    연결 그래프(Connected Graph)는 모든 노드 쌍 사이에 경로가 존재하는 그래프입니다. 어떤 두 노드를 선택해도 연결된 엣지를 따라 도달할 수 있습니다. is_connected()로 그래프가 연결되어 있는지 확인할 수 있으며, 연결되지 않은 그래프에서 경로 관련 함수를 호출하면 에러가 발생하므로 사전 확인이 중요합니다.\r
\r
    연결되지 않은 그래프에서 shortest_path()를 사용하면 에러가 발생합니다. 먼저 is_connected()로 확인하세요.\r
  snippet: |-\r
    connectedG = nx.Graph()\r
    connectedG.add_edges_from([(1, 2), (2, 3), (3, 4), (4, 1)])\r
    isConn = nx.is_connected(connectedG)\r
    isConn\r
  exercise:\r
    prompt: 2단계. 연결 그래프 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      connectedG = nx.Graph()\r
      connectedG.add_edges_from([(1, 2), (2, 3), (3, 4), (4, 1)])\r
      isConn = nx.is_connected(connectedG)\r
      isConn\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 연결 그래프에서 \`connectedG\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 연결 그래프 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_components\r
  title: 3단계. 연결 컴포넌트\r
  structuredPrimary: true\r
  subtitle: connected_components()\r
  goal: 3단계. 연결 컴포넌트에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    connected_components()는 각 연결 컴포넌트(서로 도달 가능한 노드 그룹)를 반환합니다. 연결 컴포넌트는 내부적으로는 모두 연결되어 있지만 다른 컴포넌트와는 분리된 부분그래프입니다. 소셜 네트워크에서 서로 교류가 없는 독립적인 그룹들, 인터넷에서 연결이 끊어진 네트워크 조각들을 식별하는 데 사용됩니다.\r
\r
    connected_components()는 집합의 제너레이터를 반환합니다. list()로 변환하거나 max()로 가장 큰 것을 찾습니다.\r
  snippet: |-\r
    multiCompG = nx.Graph()\r
    multiCompG.add_edges_from([(1, 2), (2, 3), (3, 1)])\r
    multiCompG.add_edges_from([(4, 5)])\r
    multiCompG.add_edges_from([(6, 7), (7, 8)])\r
\r
    components = list(nx.connected_components(multiCompG))\r
    components\r
  exercise:\r
    prompt: 3단계. 연결 컴포넌트 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      multiCompG = nx.Graph()\r
      multiCompG.add_edges_from([(1, 2), (2, 3), (3, 1)])\r
      multiCompG.add_edges_from([(4, 5)])\r
      multiCompG.add_edges_from([(6, 7), (7, 8)])\r
\r
      components = list(nx.connected_components(multiCompG))\r
      components\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 연결 컴포넌트에서 \`multiCompG\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 연결 컴포넌트 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_visualize_comp\r
  title: 4단계. 컴포넌트 시각화\r
  structuredPrimary: true\r
  subtitle: 그룹별 색상\r
  goal: 4단계. 컴포넌트 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 각 연결 컴포넌트를 다른 색으로 시각화하면 네트워크의 분리된 영역을 쉽게 파악할 수 있습니다. 컴포넌트마다 고유한 색상을 지정하여 그래프를 그리면 어떤 노드들이\r
    같은 그룹에 속하는지, 몇 개의 독립된 네트워크가 존재하는지 한눈에 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    compList = list(nx.connected_components(multiCompG))\r
    colorList = ['skyblue', 'salmon', 'lightgreen', 'gold']\r
\r
    nodeColors = []\r
    for n in multiCompG.nodes():\r
        for i, comp in enumerate(compList):\r
            if n in comp:\r
                nodeColors.append(colorList[i % len(colorList)])\r
                break\r
\r
    posComp = nx.spring_layout(multiCompG, seed=42)\r
    fig1, ax1 = plt.subplots(figsize=(8, 6))\r
    nx.draw(multiCompG, pos=posComp, with_labels=True, node_color=nodeColors,\r
            node_size=700, font_size=12, ax=ax1)\r
    ax1.set_title('Connected Components')\r
    fig1\r
  exercise:\r
    prompt: 4단계. 컴포넌트 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      compList = list(nx.connected_components(multiCompG))\r
      colorList = ['skyblue', 'salmon', 'lightgreen', 'gold']\r
\r
      nodeColors = []\r
      for n in multiCompG.nodes():\r
          for i, comp in enumerate(compList):\r
              if n in comp:\r
                  nodeColors.append(colorList[i % len(colorList)])\r
                  break\r
\r
      posComp = nx.spring_layout(multiCompG, seed=42)\r
      fig1, ax1 = plt.subplots(figsize=(8, 6))\r
      nx.draw(multiCompG, pos=posComp, with_labels=True, node_color=nodeColors,\r
              node_size=700, font_size=12, ax=ax1)\r
      ax1.set_title('Connected Components')\r
      fig1\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 컴포넌트 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 4단계. 컴포넌트 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step5_bridges\r
  title: 5단계. 브릿지\r
  structuredPrimary: true\r
  subtitle: bridges()\r
  goal: 5단계. 브릿지에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    브릿지(Bridge)는 제거하면 그래프가 분리되는 엣지입니다. 두 컴포넌트를 연결하는 유일한 경로이므로, 이 연결이 끊어지면 네트워크가 둘로 쪼개집니다. 통신망에서 브릿지는 단일 장애점(Single Point of Failure)으로, 이 회선이 고장나면 일부 지역이 완전히 단절됩니다. 브릿지를 식별하여 백업 경로를 추가하는 것이 네트워크 안정성 향상의 핵심입니다.\r
\r
    브릿지는 두 컴포넌트를 연결하는 유일한 경로입니다. 브릿지가 많으면 네트워크가 취약합니다.\r
  snippet: |-\r
    bridgeG = nx.Graph()\r
    bridgeG.add_edges_from([(1, 2), (2, 3), (3, 1)])\r
    bridgeG.add_edge(3, 4)\r
    bridgeG.add_edges_from([(4, 5), (5, 6), (6, 4)])\r
    list(bridgeG.edges())\r
  exercise:\r
    prompt: 5단계. 브릿지 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      bridgeG = nx.Graph()\r
      bridgeG.add_edges_from([(1, 2), (2, 3), (3, 1)])\r
      bridgeG.add_edge(3, 4)\r
      bridgeG.add_edges_from([(4, 5), (5, 6), (6, 4)])\r
      list(bridgeG.edges())\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 브릿지에서 \`bridgeG\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 브릿지 실행 뒤 \`bridgeG\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step6_articulation\r
  title: 6단계. 절단점\r
  structuredPrimary: true\r
  subtitle: articulation_points()\r
  goal: 6단계. 절단점에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    절단점(Articulation Point)은 제거하면 그래프가 분리되는 노드입니다. 이 노드가 네트워크에서 사라지면 다른 노드들이 서로 도달할 수 없게 됩니다. 조직에서 특정 사람이 없으면 부서 간 소통이 끊기는 경우, 라우터가 고장나면 네트워크가 분리되는 경우가 이에 해당합니다. 절단점을 파악하면 네트워크의 병목과 취약점을 알 수 있습니다.\r
\r
    절단점은 네트워크의 병목입니다. 이 노드가 실패하면 네트워크가 분리됩니다.\r
  snippet: |-\r
    artPoints = list(nx.articulation_points(bridgeG))\r
    artPoints\r
  exercise:\r
    prompt: 6단계. 절단점 예제에서 \`artPoints\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      artPoints = list(nx.articulation_points(bridgeG))\r
      artPoints\r
    hints:\r
    - 바꿀 지점은 \`artPoints = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`artPoints\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 절단점에서 \`artPoints\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 절단점 실행 뒤 \`artPoints\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step7_robustness\r
  title: 7단계. 네트워크 견고성\r
  structuredPrimary: true\r
  subtitle: 노드 제거 시뮬레이션\r
  goal: 7단계. 네트워크 견고성에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    노드를 하나씩 제거하며 네트워크 견고성을 테스트합니다. 절단점을 제거하면 네트워크가 분리되지만, 절단점이 아닌 노드를 제거하면 연결성이 유지됩니다. 이런 시뮬레이션을 통해 어떤 노드가 시스템에 중요한지, 노드 장애 시 어떤 영향이 있는지를 사전에 파악할 수 있습니다.\r
\r
    절단점이 아닌 노드를 제거해도 연결성이 유지됩니다. 절단점 제거만 네트워크를 분리합니다.\r
  snippet: |-\r
    robustG = nx.Graph()\r
    robustG.add_edges_from([\r
        (1, 2), (1, 3), (2, 3), (2, 4), (3, 4),\r
        (4, 5), (5, 6), (5, 7), (6, 7)\r
    ])\r
    nx.is_connected(robustG)\r
  exercise:\r
    prompt: 7단계. 네트워크 견고성 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      robustG = nx.Graph()\r
      robustG.add_edges_from([\r
          (1, 2), (1, 3), (2, 3), (2, 4), (3, 4),\r
          (4, 5), (5, 6), (5, 7), (6, 7)\r
      ])\r
      nx.is_connected(robustG)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 네트워크 견고성에서 \`robustG\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 네트워크 견고성 실행 뒤 \`robustG\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step8_biconnected\r
  title: 8단계. 이중연결\r
  structuredPrimary: true\r
  subtitle: biconnected_components()\r
  goal: 8단계. 이중연결에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    이중연결 컴포넌트(Biconnected Component)는 어떤 한 노드를 제거해도 연결이 유지되는 부분그래프입니다. 절단점이 없는 최대 부분그래프로, 내부적으로 최소 두 개의 독립적인 경로가 존재합니다. 이중연결 그래프는 단일 노드 장애에 강건하므로, 고가용성이 필요한 네트워크 설계의 목표가 됩니다.\r
\r
    이중연결 그래프는 절단점이 없습니다. 어떤 한 노드가 실패해도 나머지가 연결을 유지합니다.\r
  snippet: |-\r
    biconnComps = list(nx.biconnected_components(bridgeG))\r
    biconnComps\r
  exercise:\r
    prompt: 8단계. 이중연결 예제에서 \`biconnComps\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      biconnComps = list(nx.biconnected_components(bridgeG))\r
      biconnComps\r
    hints:\r
    - 바꿀 지점은 \`biconnComps = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`biconnComps\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 이중연결에서 \`biconnComps\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 이중연결 실행 뒤 \`biconnComps\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step9_k_connectivity\r
  title: 9단계. k-연결성\r
  structuredPrimary: true\r
  subtitle: node_connectivity()\r
  goal: 9단계. k연결성에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    k-연결성(k-connectivity)은 그래프를 분리하려면 최소 몇 개의 노드(또는 엣지)를 제거해야 하는지를 나타냅니다. 노드 연결도가 k이면 k-1개의 노드가 동시에 장애를 일으켜도 네트워크가 연결을 유지합니다. 엣지 연결도도 마찬가지로 해석됩니다. 연결도가 높을수록 네트워크가 더 견고합니다.\r
\r
    연결도가 높을수록 견고합니다. 완전 그래프의 연결도는 n-1입니다 (모든 노드가 연결됨).\r
  snippet: |-\r
    nodeConn = nx.node_connectivity(robustG)\r
    nodeConn\r
  exercise:\r
    prompt: 9단계. k연결성 예제에서 \`nodeConn\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      nodeConn = nx.node_connectivity(robustG)\r
      nodeConn\r
    hints:\r
    - 바꿀 지점은 \`nodeConn = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`nodeConn\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 9단계. k연결성에서 \`nodeConn\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. k연결성 실행 뒤 \`nodeConn\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step10_practical\r
  title: 10단계. 실전 분석\r
  structuredPrimary: true\r
  subtitle: 네트워크 취약점 진단\r
  goal: 10단계. 실전 분석에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 실제 네트워크의 취약점을 종합적으로 분석합니다. 기업의 통신 네트워크, 전력망, 교통망 등을 모델링하고 브릿지와 절단점을 식별합니다. 이 분석 결과를 바탕으로\r
    백업 연결을 추가하거나, 중요 노드에 이중화를 적용하여 네트워크 안정성을 높일 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    network = nx.Graph()\r
    network.add_edges_from([\r
        ("HQ", "Branch1"), ("HQ", "Branch2"), ("HQ", "DataCenter"),\r
        ("Branch1", "Office1"), ("Branch1", "Office2"),\r
        ("Branch2", "Office3"), ("Branch2", "Office4"),\r
        ("DataCenter", "Server1"), ("DataCenter", "Server2"),\r
        ("Server1", "Server2")\r
    ])\r
    network.number_of_nodes(), network.number_of_edges()\r
  exercise:\r
    prompt: 10단계. 실전 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      network = nx.Graph()\r
      network.add_edges_from([\r
          ("HQ", "Branch1"), ("HQ", "Branch2"), ("HQ", "DataCenter"),\r
          ("Branch1", "Office1"), ("Branch1", "Office2"),\r
          ("Branch2", "Office3"), ("Branch2", "Office4"),\r
          ("DataCenter", "Server1"), ("DataCenter", "Server2"),\r
          ("Server1", "Server2")\r
      ])\r
      network.number_of_nodes(), network.number_of_edges()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 실전 분석에서 \`network\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 실전 분석 실행 뒤 \`network\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 연결성 분석\r
  goal: 실습에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 연결성 분석 기법을 활용하여 실전 미션을 수행해봅시다. 전력망의 취약점을 분석하고, 소셜 네트워크에서 브릿지 제거 시 어떻게 분리되는지 시뮬레이션합니다.\r
\r
    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  snippet: |-\r
    import networkx as nx\r
    import matplotlib.pyplot as plt\r
\r
    power = nx.Graph()\r
    power.add_edges_from([\r
        ("Plant1", "Substation1"), ("Plant1", "Substation2"),\r
        ("Substation1", "District1"), ("Substation1", "District2"),\r
        ("Substation2", "District3"), ("Substation2", "District4"),\r
        ("District1", "District2")\r
    ])\r
    power.number_of_nodes(), power.number_of_edges()\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import networkx as nx\r
      import matplotlib.pyplot as plt\r
\r
      power = nx.Graph()\r
      power.add_edges_from([\r
          ("Plant1", "Substation1"), ("Plant1", "Substation2"),\r
          ("Substation1", "District1"), ("Substation1", "District2"),\r
          ("Substation2", "District3"), ("Substation2", "District4"),\r
          ("District1", "District2")\r
      ])\r
      power.number_of_nodes(), power.number_of_edges()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`power\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 \`power\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
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