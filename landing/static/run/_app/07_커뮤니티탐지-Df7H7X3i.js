var e=`meta:\r
  packages:\r
  - matplotlib\r
  - networkx\r
  id: networkx_07\r
  title: 커뮤니티탐지\r
  order: 7\r
  category: networkx\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - networkx\r
  - 커뮤니티\r
  - 모듈성\r
  - 그리디\r
  - 레미제라블\r
  seo:\r
    title: NetworkX 커뮤니티 탐지 - 그룹 발견\r
    description: NetworkX로 네트워크에서 커뮤니티(그룹)를 찾습니다. 모듈성 최적화, 그리디 알고리즘, 레미제라블 데이터를 활용합니다.\r
    keywords:\r
    - networkx\r
    - 커뮤니티\r
    - community\r
    - modularity\r
    - 그리디\r
    - 레미제라블\r
intro:\r
  emoji: 👥\r
  goal: 그래프에서 커뮤니티(밀접하게 연결된 그룹)를 찾습니다.\r
  description: 커뮤니티 탐지는 네트워크에서 밀접하게 연결된 노드 그룹을 찾는 것입니다. 소셜 네트워크의 친구 그룹, 웹의 주제별 페이지 등을 발견합니다. 모듈성(modularity)을\r
    최적화하는 그리디 알고리즘으로 커뮤니티를 탐지합니다.\r
  direction: 커뮤니티탐지에서 노드와 엣지를 모델링하고 경로, 중심성, 연결 구조를 검증합니다.\r
  benefits:\r
  - 관계 데이터 확인 후 그래프 알고리즘에 맞는 코드 입력을 고릅니다.\r
  - 커뮤니티탐지 결과를 노드/엣지와 지표 값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 관계 분석 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(관계 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 모듈성 개념 처리 실행\r
      detail: 그래프 알고리즘 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 그리디 모듈성 최적화 결과 검증\r
      detail: 노드/엣지와 지표 값 기준으로 실행 결과를 비교합니다.\r
    - label: 커뮤니티탐지 재사용\r
      detail: 완성 코드를 관계 분석 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 그래프 분석 환경\r
      detail: matplotlib, networkx 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 커뮤니티탐지 실행\r
      detail: 셀을 실행해 노드/엣지와 지표 값와 예외 상태를 확인합니다.\r
    - label: 커뮤니티탐지 완료\r
      detail: 검증된 코드를 관계 분석 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: NetworkX와 커뮤니티 탐지 알고리즘을 불러옵니다. 커뮤니티 탐지(Community Detection)는 네트워크에서 밀접하게 연결된 노드들의 그룹을 자동으로\r
    찾는 기법입니다. 소셜 네트워크의 친구 그룹, 생물학 네트워크의 기능적 모듈, 웹 페이지의 주제별 클러스터 등을 발견하는 데 활용됩니다.\r
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
- id: step2_modularity\r
  title: 2단계. 모듈성 개념\r
  structuredPrimary: true\r
  subtitle: modularity\r
  goal: 2단계. 모듈성 개념에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    모듈성(Modularity)은 2004년 Newman과 Girvan이 제안한 커뮤니티 분할의 품질 지표입니다. 커뮤니티 내부의 실제 연결 수가 무작위 그래프에서 기대되는 연결 수보다 얼마나 많은지를 측정합니다. -0.5 ~ 1 범위이며, 0.3 이상이면 유의미한 커뮤니티 구조가 있고, 0.7 이상이면 매우 강한 구조입니다. 대부분의 커뮤니티 탐지 알고리즘은 이 모듈성을 최대화하려고 합니다.\r
\r
    모듈성이 0.3 이상이면 의미 있는 커뮤니티 구조가 있다고 봅니다. 0.7 이상이면 매우 강한 구조입니다.\r
  snippet: |-\r
    G = nx.Graph()\r
    G.add_edges_from([(1, 2), (1, 3), (2, 3), (2, 4), (3, 4)])\r
    G.add_edges_from([(5, 6), (5, 7), (6, 7), (6, 8), (7, 8)])\r
    G.add_edge(4, 5)\r
    G.number_of_nodes(), G.number_of_edges()\r
  exercise:\r
    prompt: 2단계. 모듈성 개념 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      G = nx.Graph()\r
      G.add_edges_from([(1, 2), (1, 3), (2, 3), (2, 4), (3, 4)])\r
      G.add_edges_from([(5, 6), (5, 7), (6, 7), (6, 8), (7, 8)])\r
      G.add_edge(4, 5)\r
      G.number_of_nodes(), G.number_of_edges()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 모듈성 개념에서 \`G\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 모듈성 개념 실행 뒤 \`G\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step3_greedy\r
  title: 3단계. 그리디 모듈성 최적화\r
  structuredPrimary: true\r
  subtitle: greedy_modularity_communities()\r
  goal: 3단계. 그리디 모듈성 최적화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    그리디 모듈성 최적화 알고리즘은 처음에 각 노드를 개별 커뮤니티로 시작하여, 모듈성이 가장 많이 증가하는 방향으로 커뮤니티를 병합해 나갑니다. Clauset, Newman, Moore가 2004년에 제안한 이 방법은 O(n log² n)의 시간 복잡도로 빠르면서도 효과적입니다. 커뮤니티 수를 미리 지정할 필요가 없으며, 알고리즘이 최적의 분할을 자동으로 찾습니다.\r
\r
    greedy_modularity_communities()는 frozenset의 리스트를 반환합니다. set()으로 변환하면 다루기 쉽습니다.\r
  snippet: |-\r
    communities = community.greedy_modularity_communities(G)\r
    commList = [set(c) for c in communities]\r
    commList\r
  exercise:\r
    prompt: 3단계. 그리디 모듈성 최적화 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      communities = community.greedy_modularity_communities(G)\r
      commList = [set(c) for c in communities]\r
      commList\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 그리디 모듈성 최적화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 3단계. 그리디 모듈성 최적화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step4_visualize\r
  title: 4단계. 커뮤니티 시각화\r
  structuredPrimary: true\r
  subtitle: 그룹별 색상\r
  goal: 4단계. 커뮤니티 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 탐지된 커뮤니티를 서로 다른 색으로 시각화하면 네트워크의 그룹 구조를 직관적으로 파악할 수 있습니다. 각 노드가 속한 커뮤니티에 따라 색상을 지정하고, spring_layout으로\r
    배치하면 같은 커뮤니티의 노드들이 자연스럽게 가깝게 모이는 것을 볼 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    colorPalette = ['skyblue', 'salmon', 'lightgreen', 'gold', 'plum']\r
\r
    nodeColors = []\r
    for n in G.nodes():\r
        for i, comm in enumerate(commList):\r
            if n in comm:\r
                nodeColors.append(colorPalette[i % len(colorPalette)])\r
                break\r
\r
    posG = nx.spring_layout(G, seed=42)\r
    fig1, ax1 = plt.subplots(figsize=(8, 6))\r
    nx.draw(G, pos=posG, with_labels=True, node_color=nodeColors,\r
            node_size=700, font_size=12, ax=ax1)\r
    ax1.set_title('Detected Communities')\r
    fig1\r
  exercise:\r
    prompt: 4단계. 커뮤니티 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      colorPalette = ['skyblue', 'salmon', 'lightgreen', 'gold', 'plum']\r
\r
      nodeColors = []\r
      for n in G.nodes():\r
          for i, comm in enumerate(commList):\r
              if n in comm:\r
                  nodeColors.append(colorPalette[i % len(colorPalette)])\r
                  break\r
\r
      posG = nx.spring_layout(G, seed=42)\r
      fig1, ax1 = plt.subplots(figsize=(8, 6))\r
      nx.draw(G, pos=posG, with_labels=True, node_color=nodeColors,\r
              node_size=700, font_size=12, ax=ax1)\r
      ax1.set_title('Detected Communities')\r
      fig1\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 4단계. 커뮤니티 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 4단계. 커뮤니티 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step5_les_miserables\r
  title: 5단계. 레미제라블 네트워크\r
  structuredPrimary: true\r
  subtitle: les_miserables_graph()\r
  goal: 5단계. 레미제라블 네트워크에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    레미제라블(Les Misérables) 네트워크는 Victor Hugo의 소설에 등장하는 인물들 간의 관계를 나타냅니다. 77명의 인물과 254개의 관계로 구성되며, 같은 장면에 함께 등장하면 연결됩니다. 이 데이터셋은 네트워크 분석의 대표적인 벤치마크로, 장발장(Valjean), 코제트(Cosette), 마리우스(Marius) 등 스토리라인별로 자연스러운 커뮤니티가 형성되어 있습니다.\r
\r
    레미제라블은 Victor Hugo의 소설입니다. 장발장(Valjean), 코제트(Cosette) 등 유명 캐릭터가 등장합니다.\r
  snippet: |-\r
    lesmis = nx.les_miserables_graph()\r
    numNodesLM = lesmis.number_of_nodes()\r
    numEdgesLM = lesmis.number_of_edges()\r
    numNodesLM, numEdgesLM\r
  exercise:\r
    prompt: 5단계. 레미제라블 네트워크 예제에서 \`lesmis\`, \`numNodesLM\`, \`numEdgesLM\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      lesmis = nx.les_miserables_graph()\r
      numNodesLM = lesmis.number_of_nodes()\r
      numEdgesLM = lesmis.number_of_edges()\r
      numNodesLM, numEdgesLM\r
    hints:\r
    - 바꿀 지점은 \`lesmis = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`lesmis\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 5단계. 레미제라블 네트워크에서 \`lesmis\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 레미제라블 네트워크 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_lesmis_community\r
  title: 6단계. 레미제라블 커뮤니티\r
  structuredPrimary: true\r
  subtitle: 등장인물 그룹\r
  goal: 6단계. 레미제라블 커뮤니티에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 레미제라블 네트워크에 커뮤니티 탐지를 적용하면 소설의 스토리라인과 일치하는 그룹들이 발견됩니다. 주교와 관련된 초반부 인물들, 팡틴과 코제트 관련 인물들,\r
    바리케이드 혁명가들 등이 각각 커뮤니티를 형성합니다. 이는 알고리즘이 네트워크 구조만으로 의미 있는 그룹을 찾아낼 수 있음을 보여줍니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lmComms = community.greedy_modularity_communities(lesmis)\r
    lmCommList = [set(c) for c in lmComms]\r
    numComms = len(lmCommList)\r
    numComms\r
  exercise:\r
    prompt: 6단계. 레미제라블 커뮤니티 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      lmComms = community.greedy_modularity_communities(lesmis)\r
      lmCommList = [set(c) for c in lmComms]\r
      numComms = len(lmCommList)\r
      numComms\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 레미제라블 커뮤니티의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 6단계. 레미제라블 커뮤니티 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step7_lesmis_viz\r
  title: 7단계. 레미제라블 시각화\r
  structuredPrimary: true\r
  subtitle: 커뮤니티별 색상\r
  goal: 7단계. 레미제라블 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 레미제라블 네트워크를 커뮤니티별로 시각화합니다. 77개의 노드가 있으므로 레이블 대신 색상으로 커뮤니티를 구분합니다. k 파라미터를 조정하여 노드 간 간격을\r
    넓히면 구조가 더 잘 보입니다. 시각화를 통해 소설의 스토리 구조와 인물 관계를 한눈에 파악할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lmColors = []\r
    for n in lesmis.nodes():\r
        for i, comm in enumerate(lmCommList):\r
            if n in comm:\r
                lmColors.append(colorPalette[i % len(colorPalette)])\r
                break\r
\r
    posLM = nx.spring_layout(lesmis, seed=42, k=0.5)\r
    fig2, ax2 = plt.subplots(figsize=(14, 10))\r
    nx.draw(lesmis, pos=posLM, node_color=lmColors, node_size=100,\r
            edge_color='lightgray', alpha=0.8, ax=ax2)\r
    ax2.set_title(f'Les Miserables Communities ({numComms} groups)')\r
    fig2\r
  exercise:\r
    prompt: 7단계. 레미제라블 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      lmColors = []\r
      for n in lesmis.nodes():\r
          for i, comm in enumerate(lmCommList):\r
              if n in comm:\r
                  lmColors.append(colorPalette[i % len(colorPalette)])\r
                  break\r
\r
      posLM = nx.spring_layout(lesmis, seed=42, k=0.5)\r
      fig2, ax2 = plt.subplots(figsize=(14, 10))\r
      nx.draw(lesmis, pos=posLM, node_color=lmColors, node_size=100,\r
              edge_color='lightgray', alpha=0.8, ax=ax2)\r
      ax2.set_title(f'Les Miserables Communities ({numComms} groups)')\r
      fig2\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 레미제라블 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 7단계. 레미제라블 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step8_louvain\r
  title: 8단계. 루뱅 알고리즘\r
  structuredPrimary: true\r
  subtitle: louvain_communities()\r
  goal: 8단계. 루뱅 알고리즘에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    루뱅(Louvain) 알고리즘은 2008년 벨기에 루뱅 대학에서 개발된 대규모 네트워크용 커뮤니티 탐지 방법입니다. 2단계 과정을 반복합니다. 먼저 각 노드를 이웃 커뮤니티로 이동시켜 로컬 모듈성을 최적화하고, 그 다음 커뮤니티들을 하나의 노드로 축약하여 새 그래프를 만듭니다. 이 과정을 모듈성 증가가 없을 때까지 반복합니다. 수백만 노드의 네트워크도 처리할 수 있으며, 그리디보다 높은 모듈성을 달성하는 경우가 많습니다.\r
\r
    루뱅 알고리즘은 그리디보다 더 높은 모듈성을 달성하는 경우가 많습니다. 대규모 네트워크에서도 빠릅니다.\r
  snippet: |-\r
    louvainComms = community.louvain_communities(lesmis, seed=42)\r
    louvainList = [set(c) for c in louvainComms]\r
    numLouvain = len(louvainList)\r
    numLouvain\r
  exercise:\r
    prompt: 8단계. 루뱅 알고리즘 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      louvainComms = community.louvain_communities(lesmis, seed=42)\r
      louvainList = [set(c) for c in louvainComms]\r
      numLouvain = len(louvainList)\r
      numLouvain\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 루뱅 알고리즘의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. 루뱅 알고리즘 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_label_propagation\r
  title: 9단계. 레이블 전파\r
  structuredPrimary: true\r
  subtitle: label_propagation_communities()\r
  goal: 9단계. 레이블 전파에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 레이블 전파(Label Propagation)는 2007년 Raghavan 등이 제안한 간단하면서 빠른 알고리즘입니다. 처음에 각 노드에 고유 레이블을 부여한\r
    뒤, 반복적으로 각 노드가 이웃들 중 가장 많이 가진 레이블을 채택하게 합니다. 안정 상태에 도달하면 같은 레이블을 가진 노드들이 커뮤니티를 형성합니다. O(n + m) 시간으로\r
    매우 빠르지만, 비결정적이라 실행마다 결과가 달라질 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lpComms = community.label_propagation_communities(lesmis)\r
    lpList = [set(c) for c in lpComms]\r
    numLP = len(lpList)\r
    numLP\r
  exercise:\r
    prompt: 9단계. 레이블 전파 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      lpComms = community.label_propagation_communities(lesmis)\r
      lpList = [set(c) for c in lpComms]\r
      numLP = len(lpList)\r
      numLP\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 레이블 전파의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 레이블 전파 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_karate_community\r
  title: 10단계. 가라테 클럽 커뮤니티\r
  structuredPrimary: true\r
  subtitle: 실제 분리와 비교\r
  goal: 10단계. 가라테 클럽 커뮤니티에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    가라테 클럽은 실제 분리 결과가 알려진 유일한 벤치마크 데이터입니다. 1977년 Zachary가 관찰한 실제 분열과 알고리즘이 탐지한 커뮤니티를 비교하여 알고리즘의 정확도를 검증할 수 있습니다. 네트워크 구조만으로 실제 사회적 분열을 얼마나 정확하게 예측할 수 있는지 확인해봅니다.\r
\r
    커뮤니티 탐지 알고리즘이 실제 분리를 상당히 정확하게 예측합니다. 네트워크 구조만으로 그룹을 발견할 수 있습니다.\r
  snippet: |-\r
    karate = nx.karate_club_graph()\r
\r
    actualHi = {n for n in karate.nodes() if karate.nodes[n]['club'] == 'Mr. Hi'}\r
    actualOfficer = {n for n in karate.nodes() if karate.nodes[n]['club'] == 'Officer'}\r
    actualHi, actualOfficer\r
  exercise:\r
    prompt: 10단계. 가라테 클럽 커뮤니티 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      karate = nx.karate_club_graph()\r
\r
      actualHi = {n for n in karate.nodes() if karate.nodes[n]['club'] == 'Mr. Hi'}\r
      actualOfficer = {n for n in karate.nodes() if karate.nodes[n]['club'] == 'Officer'}\r
      actualHi, actualOfficer\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 가라테 클럽 커뮤니티의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 가라테 클럽 커뮤니티 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 커뮤니티 탐지\r
  goal: 실습에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 커뮤니티 탐지 알고리즘을 활용하여 실전 미션을 수행해봅시다. 여러 알고리즘의 결과를 비교하고, 피렌체 가문 네트워크에서 역사적 동맹 관계를 탐지해봅니다.\r
\r
    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  snippet: |-\r
    import networkx as nx\r
    from networkx.algorithms import community\r
    import matplotlib.pyplot as plt\r
\r
    data = nx.karate_club_graph()\r
    data.number_of_nodes(), data.number_of_edges()\r
  exercise:\r
    prompt: 실습 예제에서 \`data\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import networkx as nx\r
      from networkx.algorithms import community\r
      import matplotlib.pyplot as plt\r
\r
      data = nx.karate_club_graph()\r
      data.number_of_nodes(), data.number_of_edges()\r
    hints:\r
    - 바꿀 지점은 \`data = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`data\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 실습에서 \`data\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 \`data\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
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