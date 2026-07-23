var e=`meta:\r
  packages:\r
  - matplotlib\r
  - networkx\r
  id: networkx_05\r
  title: 소셜네트워크분석\r
  order: 5\r
  category: networkx\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - networkx\r
  - 소셜네트워크\r
  - 가라테클럽\r
  - 클러스터링\r
  - 삼각형\r
  seo:\r
    title: NetworkX 소셜 네트워크 분석 - 가라테 클럽\r
    description: NetworkX로 유명한 가라테 클럽 네트워크를 분석합니다. 클러스터링 계수, 삼각형, 소셜 네트워크 구조를 배웁니다.\r
    keywords:\r
    - networkx\r
    - 소셜네트워크\r
    - karate\r
    - 클러스터링\r
    - transitivity\r
intro:\r
  emoji: 🥋\r
  goal: 가라테 클럽 네트워크로 소셜 네트워크 분석을 실습합니다.\r
  description: 가라테 클럽 네트워크는 네트워크 과학에서 가장 유명한 데이터셋입니다. 34명의 회원 간 친분 관계를 나타냅니다. 클러스터링 계수, 삼각형, 네트워크 밀도 등\r
    소셜 네트워크의 특성을 분석합니다.\r
  direction: 소셜네트워크분석에서 노드와 엣지를 모델링하고 경로, 중심성, 연결 구조를 검증합니다.\r
  benefits:\r
  - 관계 데이터 확인 후 그래프 알고리즘에 맞는 코드 입력을 고릅니다.\r
  - 소셜네트워크분석 결과를 노드/엣지와 지표 값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 관계 분석 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(관계 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 가라테 클럽 데이터 처리 실행\r
      detail: 그래프 알고리즘 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 네트워크 시각화 결과 검증\r
      detail: 노드/엣지와 지표 값 기준으로 실행 결과를 비교합니다.\r
    - label: 소셜네트워크분석 재사용\r
      detail: 완성 코드를 관계 분석 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 그래프 분석 환경\r
      detail: matplotlib, networkx 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 소셜네트워크분석 실행\r
      detail: 셀을 실행해 노드/엣지와 지표 값와 예외 상태를 확인합니다.\r
    - label: 소셜네트워크분석 완료\r
      detail: 검증된 코드를 관계 분석 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: NetworkX와 matplotlib을 불러옵니다. 소셜 네트워크 분석(SNA)은 사람들 간의 관계를 네트워크로 모델링하여 사회 구조를 이해하는 학문입니다.\r
    누가 영향력이 있는지, 그룹이 어떻게 형성되는지, 정보가 어떻게 퍼지는지 등을 분석합니다. 이 장에서는 네트워크 과학에서 가장 유명한 데이터셋인 가라테 클럽을 분석합니다.\r
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
- id: step2_karate\r
  title: 2단계. 가라테 클럽 데이터\r
  structuredPrimary: true\r
  subtitle: karate_club_graph()\r
  goal: 2단계. 가라테 클럽 데이터에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    karate_club_graph()는 1977년 사회학자 Wayne Zachary가 연구한 실제 가라테 클럽의 사회적 관계망입니다. 34명의 회원과 78개의 친분 관계로 구성됩니다. 이 클럽은 회장(Officer)과 교관(Mr. Hi) 사이의 갈등으로 결국 두 그룹으로 분리되었는데, Zachary는 네트워크 구조만으로 이 분열을 예측할 수 있음을 보여주었습니다. 커뮤니티 탐지 알고리즘의 벤치마크로 널리 사용됩니다.\r
\r
    가라테 클럽은 내부 갈등으로 두 그룹으로 분리되었습니다. 'club' 속성이 'Mr. Hi' 또는 'Officer'로 실제 분리 결과를 나타냅니다.\r
  snippet: |-\r
    karate = nx.karate_club_graph()\r
    numNodes = karate.number_of_nodes()\r
    numEdges = karate.number_of_edges()\r
    numNodes, numEdges\r
  exercise:\r
    prompt: 2단계. 가라테 클럽 데이터 예제에서 \`karate\`, \`numNodes\`, \`numEdges\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      karate = nx.karate_club_graph()\r
      numNodes = karate.number_of_nodes()\r
      numEdges = karate.number_of_edges()\r
      numNodes, numEdges\r
    hints:\r
    - 바꿀 지점은 \`karate = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`karate\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 2단계. 가라테 클럽 데이터에서 \`karate\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 가라테 클럽 데이터 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_visualize\r
  title: 3단계. 네트워크 시각화\r
  structuredPrimary: true\r
  subtitle: 그룹별 색상\r
  goal: 3단계. 네트워크 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    실제로 분리된 두 그룹을 다른 색으로 시각화합니다. 각 노드의 'club' 속성에는 분열 후 각 회원이 어느 그룹에 속했는지가 기록되어 있습니다. Mr. Hi 그룹은 교관을 따라간 회원들, Officer 그룹은 회장을 따라간 회원들입니다. 시각화를 통해 두 그룹이 네트워크 구조에서도 자연스럽게 분리되어 있음을 확인할 수 있습니다.\r
\r
    노드 0(Mr. Hi)과 노드 33(Officer)이 각 그룹의 리더입니다. 이들 주변에 각 그룹이 형성되어 있습니다.\r
  snippet: |-\r
    clubs = [karate.nodes[n]['club'] for n in karate.nodes()]\r
    colorMap = ['skyblue' if c == 'Mr. Hi' else 'salmon' for c in clubs]\r
\r
    posKarate = nx.spring_layout(karate, seed=42)\r
    fig1, ax1 = plt.subplots(figsize=(10, 8))\r
    nx.draw(karate, pos=posKarate, with_labels=True, node_color=colorMap,\r
            node_size=500, font_size=9, ax=ax1)\r
    ax1.set_title('Zachary Karate Club Network')\r
    fig1\r
  exercise:\r
    prompt: 3단계. 네트워크 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      clubs = [karate.nodes[n]['club'] for n in karate.nodes()]\r
      colorMap = ['skyblue' if c == 'Mr. Hi' else 'salmon' for c in clubs]\r
\r
      posKarate = nx.spring_layout(karate, seed=42)\r
      fig1, ax1 = plt.subplots(figsize=(10, 8))\r
      nx.draw(karate, pos=posKarate, with_labels=True, node_color=colorMap,\r
              node_size=500, font_size=9, ax=ax1)\r
      ax1.set_title('Zachary Karate Club Network')\r
      fig1\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. 네트워크 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 3단계. 네트워크 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step4_basic_stats\r
  title: 4단계. 기본 통계\r
  structuredPrimary: true\r
  subtitle: 네트워크 특성\r
  goal: 4단계. 기본 통계에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    네트워크의 기본 통계량을 계산합니다. 밀도(density)는 가능한 모든 연결 중 실제 연결의 비율로, 네트워크가 얼마나 촘촘한지를 나타냅니다. 평균 차수는 회원당 평균 친구 수입니다. 이런 기본 통계량은 네트워크의 전반적인 특성을 빠르게 파악하는 데 유용합니다.\r
\r
    밀도는 0~1 사이 값입니다. 완전 그래프는 1, 엣지가 없으면 0입니다. 소셜 네트워크는 보통 낮은 밀도를 가집니다.\r
  snippet: |-\r
    density = nx.density(karate)\r
    density\r
  exercise:\r
    prompt: 4단계. 기본 통계 예제에서 \`density\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      density = nx.density(karate)\r
      density\r
    hints:\r
    - 바꿀 지점은 \`density = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`density\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 4단계. 기본 통계에서 \`density\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 기본 통계 실행 뒤 \`density\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step5_clustering\r
  title: 5단계. 클러스터링 계수\r
  structuredPrimary: true\r
  subtitle: clustering()\r
  goal: 5단계. 클러스터링 계수에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    클러스터링 계수(Clustering Coefficient)는 노드의 이웃들이 서로 연결된 정도를 측정합니다. "내 친구의 친구가 내 친구이기도 한가?"라는 질문에 대한 답입니다. 소셜 네트워크에서는 이 현상이 자주 발생하는데, 같은 동아리 멤버들끼리 서로 아는 경우가 많은 것과 같습니다. 클러스터링 계수가 1이면 모든 이웃이 서로 연결되어 있음을 의미합니다.\r
\r
    클러스터링 계수 1은 이웃들이 모두 서로 연결됨을 의미합니다. 소셜 네트워크는 높은 클러스터링을 보이는 경향이 있습니다.\r
  snippet: |-\r
    clustering = nx.clustering(karate)\r
    clusteringList = [(n, round(c, 3)) for n, c in clustering.items()]\r
    clusteringList[:10]\r
  exercise:\r
    prompt: 5단계. 클러스터링 계수 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      clustering = nx.clustering(karate)\r
      clusteringList = [(n, round(c, 3)) for n, c in clustering.items()]\r
      clusteringList[:10]\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. 클러스터링 계수의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 5단계. 클러스터링 계수 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step6_triangles\r
  title: 6단계. 삼각형\r
  structuredPrimary: true\r
  subtitle: triangles()\r
  goal: 6단계. 삼각형에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    삼각형은 세 노드가 모두 서로 연결된 완전 부분그래프입니다. A가 B를 알고, B가 C를 알고, C가 A를 알면 삼각형이 형성됩니다. 소셜 네트워크에서 삼각형이 많다는 것은 긴밀한 커뮤니티가 존재함을 의미합니다. 이행성(transitivity)은 네트워크 전체에서 삼각형 형성 경향을 측정하며, 높은 이행성은 사회적 응집력이 강함을 나타냅니다.\r
\r
    이행성(transitivity)은 "연결된 두 노드가 공통 이웃을 가질 확률"입니다. 삼각형 수와 연결된 트리플 수의 비율입니다.\r
  snippet: |-\r
    triangles = nx.triangles(karate)\r
    trianglesList = [(n, t) for n, t in triangles.items()]\r
    trianglesList[:10]\r
  exercise:\r
    prompt: 6단계. 삼각형 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      triangles = nx.triangles(karate)\r
      trianglesList = [(n, t) for n, t in triangles.items()]\r
      trianglesList[:10]\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 삼각형의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 6단계. 삼각형 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step7_centrality\r
  title: 7단계. 주요 인물 찾기\r
  structuredPrimary: true\r
  subtitle: 중심성 분석\r
  goal: 7단계. 주요 인물 찾기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    가라테 클럽에서 가장 영향력 있는 회원을 중심성 분석으로 찾습니다. 연결 중심성은 친구가 많은 인기 있는 회원을, 매개 중심성은 서로 다른 그룹 사이를 연결하는 중재자 역할의 회원을 찾아냅니다. 노드 0(Mr. Hi)과 노드 33(Officer)이 두 리더로, 이들이 각 그룹에서 높은 중심성을 보입니다.\r
\r
    노드 0(Mr. Hi)과 노드 33(Officer)이 모두 높은 중심성을 가집니다. 두 리더 사이의 갈등이 클럽 분리의 원인이었습니다.\r
  snippet: |-\r
    degCent = nx.degree_centrality(karate)\r
    topDeg = sorted(degCent.items(), key=lambda x: x[1], reverse=True)[:5]\r
    topDeg\r
  exercise:\r
    prompt: 7단계. 주요 인물 찾기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      degCent = nx.degree_centrality(karate)\r
      topDeg = sorted(degCent.items(), key=lambda x: x[1], reverse=True)[:5]\r
      topDeg\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 주요 인물 찾기에서 \`degCent\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 주요 인물 찾기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step8_path_analysis\r
  title: 8단계. 경로 분석\r
  structuredPrimary: true\r
  subtitle: 두 리더 사이\r
  goal: 8단계. 경로 분석에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    두 리더(노드 0 - Mr. Hi, 노드 33 - Officer) 사이의 관계를 상세히 분석합니다. 흥미롭게도 두 리더는 직접 연결되어 있고 공통 친구도 있습니다. 그럼에도 불구하고 클럽이 분열된 것은 단순한 연결보다 깊은 사회적 역학이 작용했음을 시사합니다. 경로 분석을 통해 두 리더 간의 거리와 중간 매개자를 파악합니다.\r
\r
    두 리더가 직접 연결되어 있고 공통 친구도 있습니다. 그럼에도 갈등으로 클럽이 분리되었습니다.\r
  snippet: |-\r
    pathLeaders = nx.shortest_path(karate, 0, 33)\r
    pathLeaders\r
  exercise:\r
    prompt: 8단계. 경로 분석 예제에서 \`pathLeaders\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pathLeaders = nx.shortest_path(karate, 0, 33)\r
      pathLeaders\r
    hints:\r
    - 바꿀 지점은 \`pathLeaders = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`pathLeaders\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 8단계. 경로 분석에서 \`pathLeaders\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 경로 분석 실행 뒤 \`pathLeaders\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step9_group_analysis\r
  title: 9단계. 그룹 분석\r
  structuredPrimary: true\r
  subtitle: 두 그룹 비교\r
  goal: 9단계. 그룹 분석에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    Mr. Hi 그룹과 Officer 그룹의 구조적 특성을 비교합니다. 각 그룹 내부의 밀도를 계산하면 그룹 내 결속력을 알 수 있습니다. 또한 두 그룹 사이를 연결하는 엣지 수를 파악하면 분열 전에 얼마나 많은 교류가 있었는지 알 수 있습니다. 그룹 내 밀도가 그룹 간 연결보다 높다면, 이는 자연스러운 커뮤니티 구조가 존재함을 의미합니다.\r
\r
    그룹 내 밀도가 그룹 간 연결보다 높습니다. 이것이 커뮤니티 구조의 특징입니다.\r
  snippet: |-\r
    hiGroup = [n for n in karate.nodes() if karate.nodes[n]['club'] == 'Mr. Hi']\r
    officerGroup = [n for n in karate.nodes() if karate.nodes[n]['club'] == 'Officer']\r
    len(hiGroup), len(officerGroup)\r
  exercise:\r
    prompt: 9단계. 그룹 분석 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      hiGroup = [n for n in karate.nodes() if karate.nodes[n]['club'] == 'Mr. Hi']\r
      officerGroup = [n for n in karate.nodes() if karate.nodes[n]['club'] == 'Officer']\r
      len(hiGroup), len(officerGroup)\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 그룹 분석의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 그룹 분석 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_clustering_viz\r
  title: 10단계. 클러스터링 시각화\r
  structuredPrimary: true\r
  subtitle: 종합 시각화\r
  goal: 10단계. 클러스터링 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 클러스터링 계수와 중심성을 결합하여 종합적으로 시각화합니다. 노드 크기를 연결 중심성에 비례하게 하면 영향력 있는 회원이 크게 표시됩니다. 색상으로 그룹이나\r
    클러스터링 계수를 표현하면 네트워크 구조와 커뮤니티 특성을 한눈에 파악할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    nodeSizes = [1500 * degCent[n] for n in karate.nodes()]\r
\r
    fig2, ax2 = plt.subplots(figsize=(12, 9))\r
    nx.draw(karate, pos=posKarate, with_labels=True, node_color=colorMap,\r
            node_size=nodeSizes, font_size=8, edge_color='lightgray', ax=ax2)\r
    ax2.set_title('Karate Club: Size=Degree, Color=Group')\r
    fig2\r
  exercise:\r
    prompt: 10단계. 클러스터링 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      nodeSizes = [1500 * degCent[n] for n in karate.nodes()]\r
\r
      fig2, ax2 = plt.subplots(figsize=(12, 9))\r
      nx.draw(karate, pos=posKarate, with_labels=True, node_color=colorMap,\r
              node_size=nodeSizes, font_size=8, edge_color='lightgray', ax=ax2)\r
      ax2.set_title('Karate Club: Size=Degree, Color=Group')\r
      fig2\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 클러스터링 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 클러스터링 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 소셜 네트워크 분석\r
  goal: 실습에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 소셜 네트워크 분석 기법을 활용하여 실전 미션을 수행해봅시다. 커뮤니티 경계에 있는 회원들을 찾아 분석하고, 클러스터링 계수와 연결 수의 관계를 탐구합니다.\r
\r
    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  snippet: |-\r
    import networkx as nx\r
    import matplotlib.pyplot as plt\r
\r
    karateM = nx.karate_club_graph()\r
\r
    hiNodes = [n for n in karateM.nodes() if karateM.nodes[n]['club'] == 'Mr. Hi']\r
    officerNodes = [n for n in karateM.nodes() if karateM.nodes[n]['club'] == 'Officer']\r
\r
    boundaryNodes = []\r
    for n in karateM.nodes():\r
        neighbors = set(karateM.neighbors(n))\r
        if n in hiNodes:\r
            if any(nb in officerNodes for nb in neighbors):\r
                boundaryNodes.append(n)\r
        else:\r
            if any(nb in hiNodes for nb in neighbors):\r
                boundaryNodes.append(n)\r
    boundaryNodes\r
  exercise:\r
    prompt: 실습 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import networkx as nx\r
      import matplotlib.pyplot as plt\r
\r
      karateM = nx.karate_club_graph()\r
\r
      hiNodes = [n for n in karateM.nodes() if karateM.nodes[n]['club'] == 'Mr. Hi']\r
      officerNodes = [n for n in karateM.nodes() if karateM.nodes[n]['club'] == 'Officer']\r
\r
      boundaryNodes = []\r
      for n in karateM.nodes():\r
          neighbors = set(karateM.neighbors(n))\r
          if n in hiNodes:\r
              if any(nb in officerNodes for nb in neighbors):\r
                  boundaryNodes.append(n)\r
          else:\r
              if any(nb in hiNodes for nb in neighbors):\r
                  boundaryNodes.append(n)\r
      boundaryNodes\r
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