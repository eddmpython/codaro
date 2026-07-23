var e=`meta:\r
  packages:\r
  - matplotlib\r
  - networkx\r
  id: networkx_09\r
  title: 랜덤그래프모델\r
  order: 9\r
  category: networkx\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - networkx\r
  - 랜덤그래프\r
  - Erdos-Renyi\r
  - Barabasi-Albert\r
  - 스몰월드\r
  seo:\r
    title: NetworkX 랜덤 그래프 모델 - ER, BA, WS\r
    description: NetworkX로 다양한 랜덤 그래프를 생성합니다. Erdős-Rényi, Barabási-Albert, Watts-Strogatz 모델을 배웁니다.\r
    keywords:\r
    - networkx\r
    - 랜덤그래프\r
    - Erdos-Renyi\r
    - Barabasi-Albert\r
    - Watts-Strogatz\r
intro:\r
  emoji: 🎲\r
  goal: 다양한 랜덤 그래프 모델을 생성하고 특성을 분석합니다.\r
  description: 랜덤 그래프 모델은 실제 네트워크의 특성을 이해하는 도구입니다. Erdős-Rényi는 완전 랜덤, Barabási-Albert는 척도없는 네트워크, Watts-Strogatz는\r
    스몰월드 네트워크를 생성합니다. 각 모델의 차수 분포, 클러스터링, 경로 길이를 비교합니다.\r
  direction: 랜덤그래프모델에서 노드와 엣지를 모델링하고 경로, 중심성, 연결 구조를 검증합니다.\r
  benefits:\r
  - 관계 데이터 확인 후 그래프 알고리즘에 맞는 코드 입력을 고릅니다.\r
  - 랜덤그래프모델 결과를 노드/엣지와 지표 값 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 관계 분석 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(관계 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. ErdősRényi 처리 실행\r
      detail: 그래프 알고리즘 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. ER 차수 분포 결과 검증\r
      detail: 노드/엣지와 지표 값 기준으로 실행 결과를 비교합니다.\r
    - label: 랜덤그래프모델 재사용\r
      detail: 완성 코드를 관계 분석 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 그래프 분석 환경\r
      detail: matplotlib, networkx 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 랜덤그래프모델 실행\r
      detail: 셀을 실행해 노드/엣지와 지표 값와 예외 상태를 확인합니다.\r
    - label: 랜덤그래프모델 완료\r
      detail: 검증된 코드를 관계 분석 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: NetworkX와 matplotlib을 불러옵니다. 랜덤 그래프 모델은 실제 네트워크의 형성 메커니즘과 특성을 이해하기 위한 이론적 도구입니다. 왜 어떤 네트워크에는\r
    허브가 존재하는지, 왜 '6단계 분리'가 가능한지 등의 질문에 답할 수 있습니다. 이 장에서는 세 가지 대표적인 랜덤 그래프 모델을 배웁니다.\r
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
- id: step2_erdos_renyi\r
  title: 2단계. Erdős-Rényi 모델\r
  structuredPrimary: true\r
  subtitle: erdos_renyi_graph()\r
  goal: 2단계. ErdősRényi 모델에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Erdős-Rényi(ER) 모델은 1959년 헝가리 수학자 Paul Erdős와 Alfréd Rényi가 제안한 가장 고전적인 랜덤 그래프입니다. n개의 노드가 있을 때, 가능한 모든 노드 쌍이 확률 p로 독립적으로 연결됩니다. 수학적으로 분석이 용이하여 그래프 이론의 기초가 되었지만, 실제 네트워크와는 다른 특성을 보입니다.\r
\r
    ER 모델의 예상 엣지 수는 n(n-1)/2 × p입니다. p가 1/(n-1)보다 크면 거대 컴포넌트가 형성됩니다.\r
  snippet: |-\r
    erGraph = nx.erdos_renyi_graph(n=50, p=0.1, seed=42)\r
    numNodesER = erGraph.number_of_nodes()\r
    numEdgesER = erGraph.number_of_edges()\r
    numNodesER, numEdgesER\r
  exercise:\r
    prompt: 2단계. ErdősRényi 모델 예제에서 \`erGraph\`, \`numNodesER\`, \`numEdgesER\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      erGraph = nx.erdos_renyi_graph(n=50, p=0.1, seed=42)\r
      numNodesER = erGraph.number_of_nodes()\r
      numEdgesER = erGraph.number_of_edges()\r
      numNodesER, numEdgesER\r
    hints:\r
    - 바꿀 지점은 \`erGraph = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`erGraph\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 2단계. ErdősRényi 모델에서 \`erGraph\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. ErdősRényi 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_er_degree\r
  title: 3단계. ER 차수 분포\r
  structuredPrimary: true\r
  subtitle: 포아송 분포\r
  goal: 3단계. ER 차수 분포에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: ER 그래프의 차수 분포는 포아송(Poisson) 분포에 가깝습니다. 평균 차수 주변에 대부분의 노드가 모여 있고, 극단적으로 높거나 낮은 차수를 가진 노드는\r
    거의 없습니다. 이는 실제 소셜 네트워크나 웹 그래프와 다른 특성으로, ER 모델이 실제 네트워크를 잘 설명하지 못하는 이유 중 하나입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    degreesER = [d for n, d in erGraph.degree()]\r
\r
    fig2, ax2 = plt.subplots(figsize=(8, 5))\r
    ax2.hist(degreesER, bins=range(max(degreesER)+2), align='left',\r
             color='skyblue', edgecolor='black')\r
    ax2.set_xlabel('Degree')\r
    ax2.set_ylabel('Count')\r
    ax2.set_title('ER Graph Degree Distribution')\r
    fig2\r
  exercise:\r
    prompt: 3단계. ER 차수 분포 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      degreesER = [d for n, d in erGraph.degree()]\r
\r
      fig2, ax2 = plt.subplots(figsize=(8, 5))\r
      ax2.hist(degreesER, bins=range(max(degreesER)+2), align='left',\r
               color='skyblue', edgecolor='black')\r
      ax2.set_xlabel('Degree')\r
      ax2.set_ylabel('Count')\r
      ax2.set_title('ER Graph Degree Distribution')\r
      fig2\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 3단계. ER 차수 분포의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 3단계. ER 차수 분포 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step4_barabasi_albert\r
  title: 4단계. Barabási-Albert 모델\r
  structuredPrimary: true\r
  subtitle: barabasi_albert_graph()\r
  goal: 4단계. BarabásiAlbert 모델에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Barabási-Albert(BA) 모델은 1999년 물리학자 Albert-László Barabási와 Réka Albert가 제안한 모델로, '부익부' 현상을 반영합니다. 네트워크가 성장할 때 새 노드는 이미 연결이 많은 노드에 더 연결되려는 경향이 있습니다(선호적 연결, Preferential Attachment). 이 메커니즘은 월드와이드웹, 인용 네트워크, 소셜 네트워크 등에서 관찰되는 허브의 존재를 설명합니다.\r
\r
    BA 모델은 척도없는(scale-free) 네트워크를 생성합니다. 소수의 허브가 많은 연결을 가집니다.\r
  snippet: |-\r
    baGraph = nx.barabasi_albert_graph(n=50, m=2, seed=42)\r
    numNodesBA = baGraph.number_of_nodes()\r
    numEdgesBA = baGraph.number_of_edges()\r
    numNodesBA, numEdgesBA\r
  exercise:\r
    prompt: 4단계. BarabásiAlbert 모델 예제에서 \`baGraph\`, \`numNodesBA\`, \`numEdgesBA\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지\r
      확인하세요.\r
    starterCode: |-\r
      baGraph = nx.barabasi_albert_graph(n=50, m=2, seed=42)\r
      numNodesBA = baGraph.number_of_nodes()\r
      numEdgesBA = baGraph.number_of_edges()\r
      numNodesBA, numEdgesBA\r
    hints:\r
    - 바꿀 지점은 \`baGraph = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`baGraph\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 4단계. BarabásiAlbert 모델에서 \`baGraph\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. BarabásiAlbert 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_ba_degree\r
  title: 5단계. BA 차수 분포\r
  structuredPrimary: true\r
  subtitle: 멱법칙 분포\r
  goal: 5단계. BA 차수 분포에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    BA 그래프의 차수 분포는 멱법칙(Power-law)을 따릅니다. P(k) ∝ k^(-γ) 형태로, 로그-로그 그래프에서 직선으로 나타납니다. 대부분의 노드는 적은 연결을 가지지만, 소수의 허브는 매우 많은 연결을 가집니다. 이러한 '척도없는(Scale-free)' 특성은 네트워크가 특정 규모에 구애받지 않고 자기유사성을 보임을 의미합니다.\r
\r
    멱법칙 분포는 롱테일(long tail)입니다. 대부분은 적은 연결, 극소수가 매우 많은 연결을 가집니다.\r
  snippet: |-\r
    degListBA = [d for n, d in baGraph.degree()]\r
\r
    fig4, ax4 = plt.subplots(figsize=(8, 5))\r
    ax4.hist(degListBA, bins=range(max(degListBA)+2), align='left',\r
             color='salmon', edgecolor='black')\r
    ax4.set_xlabel('Degree')\r
    ax4.set_ylabel('Count')\r
    ax4.set_title('BA Graph Degree Distribution')\r
    fig4\r
  exercise:\r
    prompt: 5단계. BA 차수 분포 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      degListBA = [d for n, d in baGraph.degree()]\r
\r
      fig4, ax4 = plt.subplots(figsize=(8, 5))\r
      ax4.hist(degListBA, bins=range(max(degListBA)+2), align='left',\r
               color='salmon', edgecolor='black')\r
      ax4.set_xlabel('Degree')\r
      ax4.set_ylabel('Count')\r
      ax4.set_title('BA Graph Degree Distribution')\r
      fig4\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 5단계. BA 차수 분포의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 5단계. BA 차수 분포 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step6_watts_strogatz\r
  title: 6단계. Watts-Strogatz 모델\r
  structuredPrimary: true\r
  subtitle: watts_strogatz_graph()\r
  goal: 6단계. WattsStrogatz 모델에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Watts-Strogatz(WS) 모델은 1998년 Duncan Watts와 Steven Strogatz가 제안한 스몰월드 네트워크 모델입니다. 규칙적인 격자에서 시작하여 일부 엣지를 무작위로 재연결합니다. 이렇게 하면 지역적으로는 높은 클러스터링(친구의 친구가 친구)을 유지하면서, 전역적으로는 짧은 평균 경로(소수의 단계로 누구든 도달 가능)를 가지게 됩니다.\r
\r
    p=0이면 규칙 격자(높은 클러스터링, 긴 경로), p=1이면 랜덤 그래프(낮은 클러스터링, 짧은 경로)입니다.\r
  snippet: |-\r
    wsGraph = nx.watts_strogatz_graph(n=50, k=4, p=0.3, seed=42)\r
    numNodesWS = wsGraph.number_of_nodes()\r
    numEdgesWS = wsGraph.number_of_edges()\r
    numNodesWS, numEdgesWS\r
  exercise:\r
    prompt: 6단계. WattsStrogatz 모델 예제에서 \`wsGraph\`, \`numNodesWS\`, \`numEdgesWS\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지\r
      확인하세요.\r
    starterCode: |-\r
      wsGraph = nx.watts_strogatz_graph(n=50, k=4, p=0.3, seed=42)\r
      numNodesWS = wsGraph.number_of_nodes()\r
      numEdgesWS = wsGraph.number_of_edges()\r
      numNodesWS, numEdgesWS\r
    hints:\r
    - 바꿀 지점은 \`wsGraph = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`wsGraph\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 6단계. WattsStrogatz 모델에서 \`wsGraph\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. WattsStrogatz 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step7_small_world\r
  title: 7단계. 스몰월드 특성\r
  structuredPrimary: true\r
  subtitle: 클러스터링과 경로 길이\r
  goal: 7단계. 스몰월드 특성에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    스몰월드 네트워크는 '6단계 분리(Six Degrees of Separation)' 현상을 설명합니다. 세상 누구나 평균 6단계의 아는 사람 관계로 연결된다는 개념입니다. 스몰월드 네트워크는 높은 클러스터링(지역적 밀집)과 짧은 평균 경로(전역적 연결)를 동시에 가집니다. 이 두 특성의 조합이 실제 소셜 네트워크, 신경망, 전력망 등에서 관찰됩니다.\r
\r
    WS 모델은 높은 클러스터링(지역 연결)과 짧은 경로(전역 도달)를 모두 달성합니다. 실제 소셜 네트워크와 유사합니다.\r
  snippet: |-\r
    clustER = nx.average_clustering(erGraph)\r
    clustBA = nx.average_clustering(baGraph)\r
    clustWS = nx.average_clustering(wsGraph)\r
    round(clustER, 3), round(clustBA, 3), round(clustWS, 3)\r
  exercise:\r
    prompt: 7단계. 스몰월드 특성 예제에서 \`clustER\`, \`clustBA\`, \`clustWS\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      clustER = nx.average_clustering(erGraph)\r
      clustBA = nx.average_clustering(baGraph)\r
      clustWS = nx.average_clustering(wsGraph)\r
      round(clustER, 3), round(clustBA, 3), round(clustWS, 3)\r
    hints:\r
    - 바꿀 지점은 \`clustER = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`clustER\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 7단계. 스몰월드 특성에서 \`clustER\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 스몰월드 특성 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step8_degree_dist_compare\r
  title: 8단계. 차수 분포 비교\r
  structuredPrimary: true\r
  subtitle: 세 모델 시각화\r
  goal: 8단계. 차수 분포 비교에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 세 가지 모델의 차수 분포를 한 그림에서 비교합니다. ER 모델은 포아송 분포(종 모양), BA 모델은 멱법칙 분포(롱테일), WS 모델은 거의 균일한 분포를\r
    보입니다. 차수 분포의 형태만으로도 네트워크가 어떤 메커니즘으로 형성되었는지 추론할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    degWS = [d for n, d in wsGraph.degree()]\r
\r
    fig6, axes = plt.subplots(1, 3, figsize=(14, 4))\r
\r
    axes[0].hist(degreesER, bins=range(max(degreesER)+2), align='left',\r
                 color='skyblue', edgecolor='black')\r
    axes[0].set_title('ER')\r
    axes[0].set_xlabel('Degree')\r
\r
    axes[1].hist(degListBA, bins=range(max(degListBA)+2), align='left',\r
                 color='salmon', edgecolor='black')\r
    axes[1].set_title('BA')\r
    axes[1].set_xlabel('Degree')\r
\r
    axes[2].hist(degWS, bins=range(max(degWS)+2), align='left',\r
                 color='lightgreen', edgecolor='black')\r
    axes[2].set_title('WS')\r
    axes[2].set_xlabel('Degree')\r
\r
    fig6.suptitle('Degree Distribution Comparison')\r
    fig6.tight_layout()\r
    fig6\r
  exercise:\r
    prompt: 8단계. 차수 분포 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      degWS = [d for n, d in wsGraph.degree()]\r
\r
      fig6, axes = plt.subplots(1, 3, figsize=(14, 4))\r
\r
      axes[0].hist(degreesER, bins=range(max(degreesER)+2), align='left',\r
                   color='skyblue', edgecolor='black')\r
      axes[0].set_title('ER')\r
      axes[0].set_xlabel('Degree')\r
\r
      axes[1].hist(degListBA, bins=range(max(degListBA)+2), align='left',\r
                   color='salmon', edgecolor='black')\r
      axes[1].set_title('BA')\r
      axes[1].set_xlabel('Degree')\r
\r
      axes[2].hist(degWS, bins=range(max(degWS)+2), align='left',\r
                   color='lightgreen', edgecolor='black')\r
      axes[2].set_title('WS')\r
      axes[2].set_xlabel('Degree')\r
\r
      fig6.suptitle('Degree Distribution Comparison')\r
      fig6.tight_layout()\r
      fig6\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 차수 분포 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. 차수 분포 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_real_world\r
  title: 9단계. 실제 네트워크와 비교\r
  structuredPrimary: true\r
  subtitle: 가라테 클럽\r
  goal: 9단계. 실제 네트워크와 비교에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    실제 네트워크(가라테 클럽)의 특성을 랜덤 그래프 모델들과 비교합니다. 동일한 노드 수와 엣지 수를 가진 각 모델의 랜덤 그래프를 생성하고, 클러스터링 계수와 평균 경로 길이를 비교합니다. 어떤 모델이 실제 네트워크와 가장 유사한 특성을 보이는지 확인합니다.\r
\r
    실제 소셜 네트워크는 보통 BA(허브 존재)와 WS(높은 클러스터링)의 특성을 함께 보입니다.\r
  snippet: |-\r
    karate = nx.karate_club_graph()\r
    nK = karate.number_of_nodes()\r
    mK = karate.number_of_edges()\r
    clustK = nx.average_clustering(karate)\r
    pathK = nx.average_shortest_path_length(karate)\r
    nK, mK, round(clustK, 3), round(pathK, 2)\r
  exercise:\r
    prompt: 9단계. 실제 네트워크와 비교 예제에서 \`karate\`, \`nK\`, \`mK\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      karate = nx.karate_club_graph()\r
      nK = karate.number_of_nodes()\r
      mK = karate.number_of_edges()\r
      clustK = nx.average_clustering(karate)\r
      pathK = nx.average_shortest_path_length(karate)\r
      nK, mK, round(clustK, 3), round(pathK, 2)\r
    hints:\r
    - 바꿀 지점은 \`karate = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`karate\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 9단계. 실제 네트워크와 비교에서 \`karate\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 실제 네트워크와 비교 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step10_summary\r
  title: 10단계. 모델 요약\r
  structuredPrimary: true\r
  subtitle: 어떤 모델을 사용할까\r
  goal: 10단계. 모델 요약에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 각 랜덤 그래프 모델의 특징과 적합한 사용 상황을 정리합니다. ER 모델은 기준선(baseline)으로, BA 모델은 허브가 있는 네트워크(웹, 인용) 시뮬레이션에,\r
    WS 모델은 높은 클러스터링의 소셜 네트워크 시뮬레이션에 적합합니다. 실제 네트워크를 분석할 때 이 모델들과 비교하면 네트워크의 특성을 이해하는 데 도움이 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    modelSummary = {\r
        'Erdős-Rényi': {\r
            'degree_dist': 'Poisson',\r
            'clustering': 'Low',\r
            'use_case': 'Baseline, Random structure'\r
        },\r
        'Barabási-Albert': {\r
            'degree_dist': 'Power-law',\r
            'clustering': 'Low-Medium',\r
            'use_case': 'Web, Citation, Hub networks'\r
        },\r
        'Watts-Strogatz': {\r
            'degree_dist': 'Regular',\r
            'clustering': 'High',\r
            'use_case': 'Social networks, Small-world'\r
        }\r
    }\r
    modelSummary\r
  exercise:\r
    prompt: 10단계. 모델 요약 예제에서 \`modelSummary\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      modelSummary = {\r
          'Erdős-Rényi': {\r
              'degree_dist': 'Poisson',\r
              'clustering': 'Low',\r
              'use_case': 'Baseline, Random structure'\r
          },\r
          'Barabási-Albert': {\r
              'degree_dist': 'Power-law',\r
              'clustering': 'Low-Medium',\r
              'use_case': 'Web, Citation, Hub networks'\r
          },\r
          'Watts-Strogatz': {\r
              'degree_dist': 'Regular',\r
              'clustering': 'High',\r
              'use_case': 'Social networks, Small-world'\r
          }\r
      }\r
      modelSummary\r
    hints:\r
    - 바꿀 지점은 \`modelSummary = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`modelSummary\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 10단계. 모델 요약에서 \`modelSummary\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 모델 요약 실행 뒤 \`modelSummary\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 랜덤 그래프\r
  goal: 실습에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 랜덤 그래프 모델을 활용하여 실전 미션을 수행해봅시다. 파라미터를 변경하며 그래프 특성의 변화를 관찰하고, 재연결 확률에 따른 스몰월드 특성을 탐구합니다.\r
\r
    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.\r
  snippet: |-\r
    import networkx as nx\r
    import matplotlib.pyplot as plt\r
\r
    ba1 = nx.barabasi_albert_graph(100, 1, seed=42)\r
    ba2 = nx.barabasi_albert_graph(100, 3, seed=42)\r
    ba3 = nx.barabasi_albert_graph(100, 5, seed=42)\r
\r
    maxDeg1 = max(d for n, d in ba1.degree())\r
    maxDeg2 = max(d for n, d in ba2.degree())\r
    maxDeg3 = max(d for n, d in ba3.degree())\r
    maxDeg1, maxDeg2, maxDeg3\r
  exercise:\r
    prompt: 실습 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      import networkx as nx\r
      import matplotlib.pyplot as plt\r
\r
      ba1 = nx.barabasi_albert_graph(100, 1, seed=42)\r
      ba2 = nx.barabasi_albert_graph(100, 3, seed=42)\r
      ba3 = nx.barabasi_albert_graph(100, 5, seed=42)\r
\r
      maxDeg1 = max(d for n, d in ba1.degree())\r
      maxDeg2 = max(d for n, d in ba2.degree())\r
      maxDeg3 = max(d for n, d in ba3.degree())\r
      maxDeg1, maxDeg2, maxDeg3\r
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