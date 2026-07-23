var e=`meta:
  packages:
  - matplotlib
  - networkx
  id: networkx_05
  title: 소셜네트워크분석
  order: 5
  category: networkx
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - networkx
  - 소셜네트워크
  - 가라테클럽
  - 클러스터링
  - 삼각형
  seo:
    title: NetworkX 소셜 네트워크 분석 - 가라테 클럽
    description: NetworkX로 유명한 가라테 클럽 네트워크를 분석합니다. 클러스터링 계수, 삼각형, 소셜 네트워크 구조를 배웁니다.
    keywords:
    - networkx
    - 소셜네트워크
    - karate
    - 클러스터링
    - transitivity
intro:
  emoji: 🥋
  goal: 가라테 클럽 네트워크로 소셜 네트워크 분석을 실습합니다.
  description: 가라테 클럽 네트워크는 네트워크 과학에서 가장 유명한 데이터셋입니다. 34명의 회원 간 친분 관계를 나타냅니다. 클러스터링 계수, 삼각형, 네트워크 밀도 등
    소셜 네트워크의 특성을 분석합니다.
  direction: 소셜네트워크분석에서 노드와 엣지를 모델링하고 경로, 중심성, 연결 구조를 검증합니다.
  benefits:
  - 관계 데이터 확인 후 그래프 알고리즘에 맞는 코드 입력을 고릅니다.
  - 소셜네트워크분석 결과를 노드/엣지와 지표 값 기준으로 즉시 점검합니다.
  - 완료한 코드를 관계 분석 리포트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(관계 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 가라테 클럽 데이터 처리 실행
      detail: 그래프 알고리즘 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 네트워크 시각화 결과 검증
      detail: 노드/엣지와 지표 값 기준으로 실행 결과를 비교합니다.
    - label: 소셜네트워크분석 재사용
      detail: 완성 코드를 관계 분석 리포트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 그래프 분석 환경
      detail: matplotlib, networkx 기준으로 로컬 Python 실행을 준비합니다.
    - label: 소셜네트워크분석 실행
      detail: 셀을 실행해 노드/엣지와 지표 값와 예외 상태를 확인합니다.
    - label: 소셜네트워크분석 완료
      detail: 검증된 코드를 관계 분석 리포트로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: NetworkX와 matplotlib을 불러옵니다. 소셜 네트워크 분석(SNA)은 사람들 간의 관계를 네트워크로 모델링하여 사회 구조를 이해하는 학문입니다.
    누가 영향력이 있는지, 그룹이 어떻게 형성되는지, 정보가 어떻게 퍼지는지 등을 분석합니다. 이 장에서는 네트워크 과학에서 가장 유명한 데이터셋인 가라테 클럽을 분석합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import networkx as nx
    import matplotlib.pyplot as plt
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      import networkx as nx
      import matplotlib.pyplot as plt
    hints:
    - 바꿀 지점은 관계 데이터을 만드는 첫 줄과 그래프 알고리즘 줄에서 찾으세요.
    - 실행 뒤 노드/엣지와 지표 값 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 노드/엣지와 지표 값 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step2_karate
  title: 2단계. 가라테 클럽 데이터
  structuredPrimary: true
  subtitle: karate_club_graph()
  goal: 2단계. 가라테 클럽 데이터에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    karate_club_graph()는 1977년 사회학자 Wayne Zachary가 연구한 실제 가라테 클럽의 사회적 관계망입니다. 34명의 회원과 78개의 친분 관계로 구성됩니다. 이 클럽은 회장(Officer)과 교관(Mr. Hi) 사이의 갈등으로 결국 두 그룹으로 분리되었는데, Zachary는 네트워크 구조만으로 이 분열을 예측할 수 있음을 보여주었습니다. 커뮤니티 탐지 알고리즘의 벤치마크로 널리 사용됩니다.

    가라테 클럽은 내부 갈등으로 두 그룹으로 분리되었습니다. 'club' 속성이 'Mr. Hi' 또는 'Officer'로 실제 분리 결과를 나타냅니다.
  snippet: |-
    karate = nx.karate_club_graph()
    numNodes = karate.number_of_nodes()
    numEdges = karate.number_of_edges()
    numNodes, numEdges
  exercise:
    prompt: 2단계. 가라테 클럽 데이터 예제에서 \`karate\`, \`numNodes\`, \`numEdges\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      karate = nx.karate_club_graph()
      numNodes = karate.number_of_nodes()
      numEdges = karate.number_of_edges()
      numNodes, numEdges
    hints:
    - 바꿀 지점은 \`karate = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`karate\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 2단계. 가라테 클럽 데이터에서 \`karate\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 2단계. 가라테 클럽 데이터 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step3_visualize
  title: 3단계. 네트워크 시각화
  structuredPrimary: true
  subtitle: 그룹별 색상
  goal: 3단계. 네트워크 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    실제로 분리된 두 그룹을 다른 색으로 시각화합니다. 각 노드의 'club' 속성에는 분열 후 각 회원이 어느 그룹에 속했는지가 기록되어 있습니다. Mr. Hi 그룹은 교관을 따라간 회원들, Officer 그룹은 회장을 따라간 회원들입니다. 시각화를 통해 두 그룹이 네트워크 구조에서도 자연스럽게 분리되어 있음을 확인할 수 있습니다.

    노드 0(Mr. Hi)과 노드 33(Officer)이 각 그룹의 리더입니다. 이들 주변에 각 그룹이 형성되어 있습니다.
  snippet: |-
    clubs = [karate.nodes[n]['club'] for n in karate.nodes()]
    colorMap = ['skyblue' if c == 'Mr. Hi' else 'salmon' for c in clubs]

    posKarate = nx.spring_layout(karate, seed=42)
    fig1, ax1 = plt.subplots(figsize=(10, 8))
    nx.draw(karate, pos=posKarate, with_labels=True, node_color=colorMap,
            node_size=500, font_size=9, ax=ax1)
    ax1.set_title('Zachary Karate Club Network')
    fig1
  exercise:
    prompt: 3단계. 네트워크 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      clubs = [karate.nodes[n]['club'] for n in karate.nodes()]
      colorMap = ['skyblue' if c == 'Mr. Hi' else 'salmon' for c in clubs]

      posKarate = nx.spring_layout(karate, seed=42)
      fig1, ax1 = plt.subplots(figsize=(10, 8))
      nx.draw(karate, pos=posKarate, with_labels=True, node_color=colorMap,
              node_size=500, font_size=9, ax=ax1)
      ax1.set_title('Zachary Karate Club Network')
      fig1
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 3단계. 네트워크 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 3단계. 네트워크 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step4_basic_stats
  title: 4단계. 기본 통계
  structuredPrimary: true
  subtitle: 네트워크 특성
  goal: 4단계. 기본 통계에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    네트워크의 기본 통계량을 계산합니다. 밀도(density)는 가능한 모든 연결 중 실제 연결의 비율로, 네트워크가 얼마나 촘촘한지를 나타냅니다. 평균 차수는 회원당 평균 친구 수입니다. 이런 기본 통계량은 네트워크의 전반적인 특성을 빠르게 파악하는 데 유용합니다.

    밀도는 0~1 사이 값입니다. 완전 그래프는 1, 엣지가 없으면 0입니다. 소셜 네트워크는 보통 낮은 밀도를 가집니다.
  snippet: |-
    density = nx.density(karate)
    density
  exercise:
    prompt: 4단계. 기본 통계 예제에서 \`density\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      density = nx.density(karate)
      density
    hints:
    - 바꿀 지점은 \`density = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`density\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 4단계. 기본 통계에서 \`density\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 4단계. 기본 통계 실행 뒤 \`density\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step5_clustering
  title: 5단계. 클러스터링 계수
  structuredPrimary: true
  subtitle: clustering()
  goal: 5단계. 클러스터링 계수에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    클러스터링 계수(Clustering Coefficient)는 노드의 이웃들이 서로 연결된 정도를 측정합니다. "내 친구의 친구가 내 친구이기도 한가?"라는 질문에 대한 답입니다. 소셜 네트워크에서는 이 현상이 자주 발생하는데, 같은 동아리 멤버들끼리 서로 아는 경우가 많은 것과 같습니다. 클러스터링 계수가 1이면 모든 이웃이 서로 연결되어 있음을 의미합니다.

    클러스터링 계수 1은 이웃들이 모두 서로 연결됨을 의미합니다. 소셜 네트워크는 높은 클러스터링을 보이는 경향이 있습니다.
  snippet: |-
    clustering = nx.clustering(karate)
    clusteringList = [(n, round(c, 3)) for n, c in clustering.items()]
    clusteringList[:10]
  exercise:
    prompt: 5단계. 클러스터링 계수 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      clustering = nx.clustering(karate)
      clusteringList = [(n, round(c, 3)) for n, c in clustering.items()]
      clusteringList[:10]
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 5단계. 클러스터링 계수의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 5단계. 클러스터링 계수 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step6_triangles
  title: 6단계. 삼각형
  structuredPrimary: true
  subtitle: triangles()
  goal: 6단계. 삼각형에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    삼각형은 세 노드가 모두 서로 연결된 완전 부분그래프입니다. A가 B를 알고, B가 C를 알고, C가 A를 알면 삼각형이 형성됩니다. 소셜 네트워크에서 삼각형이 많다는 것은 긴밀한 커뮤니티가 존재함을 의미합니다. 이행성(transitivity)은 네트워크 전체에서 삼각형 형성 경향을 측정하며, 높은 이행성은 사회적 응집력이 강함을 나타냅니다.

    이행성(transitivity)은 "연결된 두 노드가 공통 이웃을 가질 확률"입니다. 삼각형 수와 연결된 트리플 수의 비율입니다.
  snippet: |-
    triangles = nx.triangles(karate)
    trianglesList = [(n, t) for n, t in triangles.items()]
    trianglesList[:10]
  exercise:
    prompt: 6단계. 삼각형 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      triangles = nx.triangles(karate)
      trianglesList = [(n, t) for n, t in triangles.items()]
      trianglesList[:10]
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 6단계. 삼각형의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 6단계. 삼각형 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step7_centrality
  title: 7단계. 주요 인물 찾기
  structuredPrimary: true
  subtitle: 중심성 분석
  goal: 7단계. 주요 인물 찾기에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    가라테 클럽에서 가장 영향력 있는 회원을 중심성 분석으로 찾습니다. 연결 중심성은 친구가 많은 인기 있는 회원을, 매개 중심성은 서로 다른 그룹 사이를 연결하는 중재자 역할의 회원을 찾아냅니다. 노드 0(Mr. Hi)과 노드 33(Officer)이 두 리더로, 이들이 각 그룹에서 높은 중심성을 보입니다.

    노드 0(Mr. Hi)과 노드 33(Officer)이 모두 높은 중심성을 가집니다. 두 리더 사이의 갈등이 클럽 분리의 원인이었습니다.
  snippet: |-
    degCent = nx.degree_centrality(karate)
    topDeg = sorted(degCent.items(), key=lambda x: x[1], reverse=True)[:5]
    topDeg
  exercise:
    prompt: 7단계. 주요 인물 찾기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      degCent = nx.degree_centrality(karate)
      topDeg = sorted(degCent.items(), key=lambda x: x[1], reverse=True)[:5]
      topDeg
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    noError: 7단계. 주요 인물 찾기에서 \`degCent\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 7단계. 주요 인물 찾기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step8_path_analysis
  title: 8단계. 경로 분석
  structuredPrimary: true
  subtitle: 두 리더 사이
  goal: 8단계. 경로 분석에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    두 리더(노드 0 - Mr. Hi, 노드 33 - Officer) 사이의 관계를 상세히 분석합니다. 흥미롭게도 두 리더는 직접 연결되어 있고 공통 친구도 있습니다. 그럼에도 불구하고 클럽이 분열된 것은 단순한 연결보다 깊은 사회적 역학이 작용했음을 시사합니다. 경로 분석을 통해 두 리더 간의 거리와 중간 매개자를 파악합니다.

    두 리더가 직접 연결되어 있고 공통 친구도 있습니다. 그럼에도 갈등으로 클럽이 분리되었습니다.
  snippet: |-
    pathLeaders = nx.shortest_path(karate, 0, 33)
    pathLeaders
  exercise:
    prompt: 8단계. 경로 분석 예제에서 \`pathLeaders\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      pathLeaders = nx.shortest_path(karate, 0, 33)
      pathLeaders
    hints:
    - 바꿀 지점은 \`pathLeaders = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`pathLeaders\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    noError: 8단계. 경로 분석에서 \`pathLeaders\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 8단계. 경로 분석 실행 뒤 \`pathLeaders\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step9_group_analysis
  title: 9단계. 그룹 분석
  structuredPrimary: true
  subtitle: 두 그룹 비교
  goal: 9단계. 그룹 분석에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    Mr. Hi 그룹과 Officer 그룹의 구조적 특성을 비교합니다. 각 그룹 내부의 밀도를 계산하면 그룹 내 결속력을 알 수 있습니다. 또한 두 그룹 사이를 연결하는 엣지 수를 파악하면 분열 전에 얼마나 많은 교류가 있었는지 알 수 있습니다. 그룹 내 밀도가 그룹 간 연결보다 높다면, 이는 자연스러운 커뮤니티 구조가 존재함을 의미합니다.

    그룹 내 밀도가 그룹 간 연결보다 높습니다. 이것이 커뮤니티 구조의 특징입니다.
  snippet: |-
    hiGroup = [n for n in karate.nodes() if karate.nodes[n]['club'] == 'Mr. Hi']
    officerGroup = [n for n in karate.nodes() if karate.nodes[n]['club'] == 'Officer']
    len(hiGroup), len(officerGroup)
  exercise:
    prompt: 9단계. 그룹 분석 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      hiGroup = [n for n in karate.nodes() if karate.nodes[n]['club'] == 'Mr. Hi']
      officerGroup = [n for n in karate.nodes() if karate.nodes[n]['club'] == 'Officer']
      len(hiGroup), len(officerGroup)
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 9단계. 그룹 분석의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 9단계. 그룹 분석 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step10_clustering_viz
  title: 10단계. 클러스터링 시각화
  structuredPrimary: true
  subtitle: 종합 시각화
  goal: 10단계. 클러스터링 시각화에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 클러스터링 계수와 중심성을 결합하여 종합적으로 시각화합니다. 노드 크기를 연결 중심성에 비례하게 하면 영향력 있는 회원이 크게 표시됩니다. 색상으로 그룹이나
    클러스터링 계수를 표현하면 네트워크 구조와 커뮤니티 특성을 한눈에 파악할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    nodeSizes = [1500 * degCent[n] for n in karate.nodes()]

    fig2, ax2 = plt.subplots(figsize=(12, 9))
    nx.draw(karate, pos=posKarate, with_labels=True, node_color=colorMap,
            node_size=nodeSizes, font_size=8, edge_color='lightgray', ax=ax2)
    ax2.set_title('Karate Club: Size=Degree, Color=Group')
    fig2
  exercise:
    prompt: 10단계. 클러스터링 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      nodeSizes = [1500 * degCent[n] for n in karate.nodes()]

      fig2, ax2 = plt.subplots(figsize=(12, 9))
      nx.draw(karate, pos=posKarate, with_labels=True, node_color=colorMap,
              node_size=nodeSizes, font_size=8, edge_color='lightgray', ax=ax2)
      ax2.set_title('Karate Club: Size=Degree, Color=Group')
      fig2
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    noError: 10단계. 클러스터링 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 10단계. 클러스터링 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 소셜 네트워크 분석
  goal: 실습에서 그래프 알고리즘 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    지금까지 배운 소셜 네트워크 분석 기법을 활용하여 실전 미션을 수행해봅시다. 커뮤니티 경계에 있는 회원들을 찾아 분석하고, 클러스터링 계수와 연결 수의 관계를 탐구합니다.

    각 미션은 import문부터 시작합니다. 위 예제를 실행했다면 import는 생략해도 됩니다.
  snippet: |-
    import networkx as nx
    import matplotlib.pyplot as plt

    karateM = nx.karate_club_graph()

    hiNodes = [n for n in karateM.nodes() if karateM.nodes[n]['club'] == 'Mr. Hi']
    officerNodes = [n for n in karateM.nodes() if karateM.nodes[n]['club'] == 'Officer']

    boundaryNodes = []
    for n in karateM.nodes():
        neighbors = set(karateM.neighbors(n))
        if n in hiNodes:
            if any(nb in officerNodes for nb in neighbors):
                boundaryNodes.append(n)
        else:
            if any(nb in hiNodes for nb in neighbors):
                boundaryNodes.append(n)
    boundaryNodes
  exercise:
    prompt: 실습 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      import networkx as nx
      import matplotlib.pyplot as plt

      karateM = nx.karate_club_graph()

      hiNodes = [n for n in karateM.nodes() if karateM.nodes[n]['club'] == 'Mr. Hi']
      officerNodes = [n for n in karateM.nodes() if karateM.nodes[n]['club'] == 'Officer']

      boundaryNodes = []
      for n in karateM.nodes():
          neighbors = set(karateM.neighbors(n))
          if n in hiNodes:
              if any(nb in officerNodes for nb in neighbors):
                  boundaryNodes.append(n)
          else:
              if any(nb in hiNodes for nb in neighbors):
                  boundaryNodes.append(n)
      boundaryNodes
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
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
  - id: networkx_05-mutual-friends-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: 소셜 graph의 공통 이웃 추천 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 직접 친구와 자기 자신을 제외하고 mutual friend 수로 후보를 정렬한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 직접 연결된 사람을 추천에서 제외하세요.
    - mutual count는 친밀도나 안전성을 증명하지 않습니다.
    exercise:
      prompt: recommend_friends(nodes, edges, person)를 완성하세요.
      starterCode: |-
        def recommend_friends(nodes, edges, person):
            raise NotImplementedError
      solution: |
        def recommend_friends(nodes, edges, person):
            adjacency = {node: set() for node in nodes}
            for a, b in edges:
                adjacency[a].add(b); adjacency[b].add(a)
            if person not in adjacency:
                raise ValueError("unknown person")
            candidates = []
            for node in nodes:
                if node != person and node not in adjacency[person]:
                    count = len(adjacency[person] & adjacency[node])
                    if count:
                        candidates.append({"person": node, "mutual": count})
            return sorted(candidates, key=lambda row: (-row["mutual"], row["person"]))
      hints: *id001
    check:
      id: python.networkx.networkx_05.mutual-friends.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.networkx.networkx_05.mutual-friends.mastery.behavior.v1.fixture
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
        entry: recommend_friends
        cases:
        - id: ranks-mutual-friends
          arguments:
          - value:
            - a
            - b
            - c
            - d
          - value:
            - - a
              - b
            - - a
              - c
            - - b
              - d
            - - c
              - d
          - value: a
          expectedReturn:
          - person: d
            mutual: 2
        - id: returns-no-candidate
          arguments:
          - value:
            - a
            - b
          - value:
            - - a
              - b
          - value: a
          expectedReturn: []
        - id: rejects-unknown
          arguments:
          - value:
            - a
          - value: []
          - value: x
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: networkx_05-ego-network-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - networkx_05-mutual-friends-mastery
    title: 새 협업망에 ego network 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 중심 node에서 radius 이내 node와 induced edge를 반환한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 선택 node 사이의 모든 induced edge를 보존하세요.
    - radius는 hop 거리입니다.
    exercise:
      prompt: ego_network(edges, center, radius)를 완성하세요.
      starterCode: |-
        def ego_network(edges, center, radius):
            raise NotImplementedError
      solution: |
        def ego_network(edges, center, radius):
            adjacency = {}
            for a, b in edges:
                adjacency.setdefault(a, set()).add(b); adjacency.setdefault(b, set()).add(a)
            distance = {center: 0}; queue = [center]
            while queue:
                node = queue.pop(0)
                if distance[node] == radius: continue
                for neighbor in adjacency.get(node, []):
                    if neighbor not in distance:
                        distance[neighbor] = distance[node] + 1; queue.append(neighbor)
            selected = set(distance)
            kept = sorted([sorted([a, b]) for a, b in edges if a in selected and b in selected])
            return {"nodes": sorted(selected), "edges": kept}
      hints: *id002
    check:
      id: python.networkx.networkx_05.ego-network.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.networkx.networkx_05.ego-network.transfer.behavior.v1.fixture
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
        entry: ego_network
        cases:
        - id: keeps-induced-edges
          arguments:
          - value:
            - - a
              - b
            - - b
              - c
            - - a
              - c
            - - c
              - d
          - value: a
          - value: 1
          expectedReturn:
            nodes:
            - a
            - b
            - c
            edges:
            - - a
              - b
            - - a
              - c
            - - b
              - c
        - id: keeps-center-alone
          arguments:
          - value: []
          - value: x
          - value: 2
          expectedReturn:
            nodes:
            - x
            edges: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: networkx_05-social-analysis-scope-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - networkx_05-ego-network-transfer
    title: 소셜 분석 범위 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 추천·ego·privacy 질문을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 그래프 알고리즘의 입력 가정과 반환 의미를 함께 기록하세요.
    - 시각적 모양만으로 구조적 결론을 내리지 마세요.
    exercise:
      prompt: choose_social_scope(situation)를 완성해 method, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_social_scope(situation):
            raise NotImplementedError
      solution: |
        def choose_social_scope(situation):
            table = {'friend-candidate': {'method': 'common neighbors', 'evidence': 'mutual count', 'risk': 'privacy inference'}, 'local-context': {'method': 'ego graph', 'evidence': 'radius and boundary', 'risk': 'missing outside structure'}, 'influence-claim': {'method': 'centrality plus validation', 'evidence': 'outcome correlation', 'risk': 'structural determinism'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.networkx.networkx_05.social-analysis-scope.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.networkx.networkx_05.social-analysis-scope.retrieval.behavior.v1.fixture
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
        entry: choose_social_scope
        cases:
        - id: recalls-friend-candidate
          arguments:
          - value: friend-candidate
          expectedReturn:
            method: common neighbors
            evidence: mutual count
            risk: privacy inference
        - id: recalls-local-context
          arguments:
          - value: local-context
          expectedReturn:
            method: ego graph
            evidence: radius and boundary
            risk: missing outside structure
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};