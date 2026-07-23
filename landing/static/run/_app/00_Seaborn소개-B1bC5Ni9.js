var e=`meta:\r
  packages:\r
  - matplotlib\r
  - seaborn\r
  id: seaborn_00\r
  title: Seaborn소개\r
  order: 0\r
  category: seaborn\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - Seaborn\r
  - 시각화\r
  - 통계\r
  - EDA\r
  - Matplotlib\r
  - hue\r
  seo:\r
    title: Seaborn 입문 - 통계 시각화의 강력한 도구\r
    description: Seaborn으로 아름다운 통계 차트를 만들어보세요. Matplotlib 위에 구축된 고수준 인터페이스로 탐색적 데이터 분석을 빠르게 수행합니다.\r
    keywords:\r
    - Seaborn\r
    - 통계 시각화\r
    - EDA\r
    - hue\r
    - palette\r
    - Matplotlib\r
intro:\r
  direction: Seaborn소개에서 정리된 데이터를 통계 차트로 보고 분포와 관계를 검증합니다.\r
  benefits:\r
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.\r
  - 분석용 테이블 확인 후 통계 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - Seaborn소개 결과를 분포, 그룹, 관계 패턴 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 탐색 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 17단계. Seaborn 학습 입력 확인\r
      detail: 입력 기준(분석용 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 통계 차트 구성 처리 실행\r
      detail: 통계 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 분포, 그룹, 관계 패턴 결과 검증\r
      detail: 분포, 그룹, 관계 패턴 기준으로 실행 결과를 비교합니다.\r
    - label: Seaborn소개 재사용\r
      detail: 완성 코드를 탐색 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 통계 시각화 환경\r
      detail: matplotlib, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: Seaborn소개 실행\r
      detail: 셀을 실행해 분포, 그룹, 관계 패턴와 예외 상태를 확인합니다.\r
    - label: Seaborn소개 완료\r
      detail: 검증된 코드를 탐색 리포트로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 🎨\r
    title: Seaborn\r
    subtitle: 통계 시각화의 강력한 도구\r
  - type: hero\r
    emoji: 📊\r
    title: 아름다운 통계 차트\r
    subtitle: 한 줄 코드로 복잡한 분석 시각화\r
    points:\r
    - emoji: 🎯\r
      title: 통계 시각화에 최적화\r
    - emoji: 🖌️\r
      title: 아름다운 기본 스타일\r
    - emoji: 🔗\r
      title: Matplotlib 완벽 호환\r
    - emoji: ⚡\r
      title: 빠른 탐색적 분석\r
  goal: Seaborn에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: seaborn_history\r
  blocks:\r
  - type: sectionHeader\r
    title: 🏛️ Seaborn의 탄생\r
    subtitle: Matplotlib의 아름다운 확장\r
  - type: text\r
    content: |-\r
      Seaborn은 2012년 Michael Waskom이 만들었습니다. 당시 그는 뉴욕대학교에서 신경과학을 연구하던 대학원생이었습니다. 실험 데이터를 분석하면서 Matplotlib의 복잡한 코드에 불편함을 느꼈고, 더 쉽고 아름다운 시각화 도구를 만들고 싶었습니다.\r
\r
      Seaborn은 Matplotlib 위에 구축되어 있어서 모든 Matplotlib 기능을 그대로 사용할 수 있습니다. 하지만 통계적 시각화에 특화된 고수준 인터페이스를 제공하여, 복잡한 차트를 한 줄로 그릴 수 있게 해줍니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🔬\r
      title: 연구자가 만든 도구\r
      description: 실제 데이터 분석 경험에서 탄생한 실용적인 라이브러리\r
    - emoji: 📈\r
      title: 통계 시각화 전문\r
      description: 분포, 관계, 범주형 비교 등 통계 분석에 최적화\r
    - emoji: 🎨\r
      title: 과학적 색상 팔레트\r
      description: 색맹 친화적이고 인쇄에도 적합한 색상 체계\r
    - emoji: 📚\r
      title: 활발한 커뮤니티\r
      description: 지속적인 업데이트와 풍부한 문서\r
  goal: 🏛️ Seaborn의 탄생에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: why_seaborn\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤔 왜 Seaborn인가?\r
    subtitle: Matplotlib과의 차이점\r
  - type: text\r
    content: |-\r
      Matplotlib은 모든 것을 할 수 있지만, 그만큼 코드가 길어집니다. Seaborn은 자주 사용하는 통계 시각화 패턴을 함수로 제공하여 코드를 획기적으로 줄여줍니다.\r
\r
      예를 들어 그룹별 박스플롯을 그리려면 Matplotlib에서는 데이터를 수동으로 분리하고 반복문을 돌려야 하지만, Seaborn에서는 hue 파라미터 하나로 해결됩니다.\r
  - type: compare\r
    left:\r
      title: Matplotlib\r
      subtitle: 저수준 제어\r
      icon: 🔧\r
      color: blue\r
      items:\r
      - 모든 요소 직접 제어\r
      - 코드가 길어질 수 있음\r
      - 데이터 전처리 필요\r
      - 범례 수동 설정\r
      - 색상 직접 지정\r
      infoBox: 세밀한 커스터마이징에 적합\r
    right:\r
      title: Seaborn\r
      subtitle: 고수준 인터페이스\r
      icon: 🎨\r
      color: green\r
      items:\r
      - 통계 시각화 한 줄 완성\r
      - 아름다운 기본 스타일\r
      - DataFrame 직접 사용\r
      - 범례 자동 생성\r
      - 팔레트 자동 적용\r
      infoBox: 빠른 탐색적 분석에 적합\r
  goal: 🤔 왜 Seaborn인가?에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: semantic_mapping\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎯 시맨틱 매핑\r
    subtitle: Seaborn의 핵심 철학\r
  - type: text\r
    content: |-\r
      Seaborn의 가장 강력한 기능은 시맨틱 매핑(Semantic Mapping)입니다. 데이터의 변수를 시각적 속성에 자동으로 연결해줍니다.\r
\r
      hue는 색상, style은 선/마커 스타일, size는 크기, col과 row는 패널 분할을 담당합니다. 이 파라미터들을 조합하면 한 차트에서 5개 이상의 변수를 동시에 표현할 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🎨\r
      title: hue (색상)\r
      description: 범주형 변수를 색상으로 구분. 가장 많이 사용되는 파라미터\r
    - emoji: ✏️\r
      title: style (스타일)\r
      description: 선 스타일이나 마커 모양으로 추가 변수 표현\r
    - emoji: 📏\r
      title: size (크기)\r
      description: 점이나 선의 크기로 연속형 변수 표현\r
    - emoji: 📊\r
      title: col, row (패널)\r
      description: 데이터를 분할하여 여러 패널로 비교\r
  - type: note\r
    style: tip\r
    title: 다차원 데이터 시각화\r
    content: x, y, hue, style, size, col, row를 조합하면 최대 7개 변수를 하나의 그림에 표현할 수 있습니다. Matplotlib으로 같은 결과를\r
      얻으려면 수십 줄의 코드가 필요합니다.\r
  goal: 🎯 시맨틱 매핑에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: chart_categories\r
  blocks:\r
  - type: sectionHeader\r
    title: 📊 차트 유형별 분류\r
    subtitle: 목적에 맞는 함수 선택\r
  - type: text\r
    content: |-\r
      Seaborn은 차트를 목적에 따라 5가지 범주로 분류합니다. 각 범주에는 Figure-level 함수(다중 패널 지원)와 Axes-level 함수(단일 차트)가 있습니다.\r
\r
      Figure-level 함수는 relplot, displot, catplot처럼 plot으로 끝나고, 자체 Figure를 생성합니다. Axes-level 함수는 기존 Matplotlib Axes에 그릴 수 있어 더 유연합니다.\r
  - type: table\r
    headers:\r
    - 범주\r
    - Figure-level\r
    - Axes-level 함수들\r
    rows:\r
    - - 관계형\r
      - relplot()\r
      - scatterplot(), lineplot()\r
    - - 분포형\r
      - displot()\r
      - histplot(), kdeplot(), rugplot()\r
    - - 범주형\r
      - catplot()\r
      - stripplot(), swarmplot(), boxplot(), violinplot(), barplot(), countplot(), pointplot()\r
    - - 회귀형\r
      - lmplot()\r
      - regplot(), residplot()\r
    - - 행렬형\r
      - '-'\r
      - heatmap(), clustermap()\r
  - type: note\r
    style: info\r
    title: Figure-level vs Axes-level\r
    content: Figure-level 함수는 col, row 파라미터로 다중 패널을 쉽게 만들 수 있습니다. Axes-level 함수는 ax 파라미터로 기존 서브플롯에 그릴\r
      수 있어 Matplotlib과 조합하기 좋습니다.\r
  goal: 📊 차트 유형별 분류에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: relational\r
  blocks:\r
  - type: sectionHeader\r
    title: 🔗 관계형 차트\r
    subtitle: 두 연속 변수의 관계\r
  - type: text\r
    content: |-\r
      관계형 차트는 두 연속 변수 사이의 관계를 보여줍니다. scatterplot은 산점도로 개별 데이터 포인트를 표시하고, lineplot은 선 그래프로 추세를 보여줍니다.\r
\r
      relplot은 Figure-level 함수로, kind 파라미터로 scatter와 line 중 선택할 수 있고, col과 row로 다중 패널을 만들 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: ⚫\r
      title: scatterplot()\r
      description: 산점도. 두 연속 변수의 관계를 점으로 표시\r
    - emoji: 📈\r
      title: lineplot()\r
      description: 선 그래프. 시계열이나 연속적 관계 표현\r
    - emoji: 🔲\r
      title: relplot()\r
      description: Figure-level. col/row로 다중 패널 지원\r
  goal: 🔗 관계형 차트에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: distribution\r
  blocks:\r
  - type: sectionHeader\r
    title: 📊 분포형 차트\r
    subtitle: 데이터 분포 탐색\r
  - type: text\r
    content: |-\r
      분포형 차트는 단일 변수 또는 두 변수의 분포를 보여줍니다. histplot은 히스토그램, kdeplot은 커널 밀도 추정으로 부드러운 분포 곡선을 그립니다.\r
\r
      displot은 Figure-level 함수로, kind 파라미터로 hist, kde, ecdf 중 선택할 수 있습니다. multiple 파라미터로 여러 그룹의 분포를 겹쳐서(layer), 쌓아서(stack), 채워서(fill) 표현할 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 📊\r
      title: histplot()\r
      description: 히스토그램. 구간별 빈도를 막대로 표시\r
    - emoji: 〰️\r
      title: kdeplot()\r
      description: 커널 밀도. 부드러운 분포 곡선\r
    - emoji: 📈\r
      title: displot()\r
      description: Figure-level. 다중 패널 분포 비교\r
  goal: 📊 분포형 차트에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: categorical\r
  blocks:\r
  - type: sectionHeader\r
    title: 📋 범주형 차트\r
    subtitle: 그룹별 비교 분석\r
  - type: text\r
    content: |-\r
      범주형 차트는 카테고리별로 데이터를 비교합니다. stripplot과 swarmplot은 개별 데이터 포인트를 보여주고, boxplot과 violinplot은 분포를 요약합니다. barplot은 평균값과 신뢰구간을, countplot은 빈도를 표시합니다.\r
\r
      catplot은 Figure-level 함수로, kind 파라미터로 모든 범주형 차트를 선택할 수 있습니다.\r
  - type: table\r
    headers:\r
    - 함수\r
    - 용도\r
    - 특징\r
    rows:\r
    - - stripplot()\r
      - 개별 점 표시\r
      - 점이 겹칠 수 있음\r
    - - swarmplot()\r
      - 개별 점 표시\r
      - 점이 겹치지 않게 배치\r
    - - boxplot()\r
      - 분포 요약\r
      - 중앙값, 사분위수, 이상치\r
    - - violinplot()\r
      - 분포 모양\r
      - KDE + 박스플롯 결합\r
    - - barplot()\r
      - 평균값 비교\r
      - 신뢰구간 자동 표시\r
    - - countplot()\r
      - 빈도 비교\r
      - 카테고리별 개수\r
    - - pointplot()\r
      - 평균 추세\r
      - 점과 선으로 연결\r
  goal: 📋 범주형 차트에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: regression\r
  blocks:\r
  - type: sectionHeader\r
    title: 📐 회귀형 차트\r
    subtitle: 관계의 추세선\r
  - type: text\r
    content: |-\r
      회귀형 차트는 두 변수 사이의 선형 관계를 시각화합니다. regplot은 산점도와 회귀선을 함께 그리고, 신뢰구간도 표시합니다.\r
\r
      lmplot은 Figure-level 함수로, hue와 col로 그룹별 회귀선을 비교할 수 있습니다. order 파라미터로 다항 회귀도 가능합니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 📈\r
      title: regplot()\r
      description: 산점도 + 회귀선. 신뢰구간 자동 표시\r
    - emoji: 🔲\r
      title: lmplot()\r
      description: Figure-level. 그룹별 회귀선 비교\r
    - emoji: 📊\r
      title: residplot()\r
      description: 잔차 플롯. 회귀 모델 진단\r
  goal: 📐 회귀형 차트에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: matrix\r
  blocks:\r
  - type: sectionHeader\r
    title: 🔥 행렬형 차트\r
    subtitle: 2D 데이터의 시각화\r
  - type: text\r
    content: |-\r
      행렬형 차트는 2차원 배열 데이터를 색상으로 표현합니다. heatmap은 상관관계 행렬이나 피벗 테이블을 시각화하는 데 자주 사용됩니다.\r
\r
      annot 파라미터로 각 셀에 값을 표시하고, cmap으로 색상 체계를 변경할 수 있습니다. clustermap은 계층적 군집화를 적용한 히트맵입니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🔥\r
      title: heatmap()\r
      description: 색상으로 값의 크기 표현. 상관관계 분석에 필수\r
    - emoji: 🌳\r
      title: clustermap()\r
      description: 계층적 군집화 + 히트맵. 패턴 발견에 유용\r
  goal: 🔥 행렬형 차트에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: multiplot\r
  blocks:\r
  - type: sectionHeader\r
    title: 🔲 다변량 차트\r
    subtitle: 여러 변수를 한눈에\r
  - type: text\r
    content: |-\r
      다변량 차트는 여러 변수의 관계를 한 그림에 표현합니다. pairplot은 모든 변수 쌍의 산점도를 격자로 보여주고, jointplot은 두 변수의 결합 분포와 주변 분포를 함께 표시합니다.\r
\r
      FacetGrid는 조건부로 데이터를 분할하여 여러 패널에 같은 유형의 차트를 그립니다. 직접 map 메서드를 사용하여 커스텀 시각화를 만들 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🔲\r
      title: pairplot()\r
      description: 모든 변수 쌍 비교. EDA 시작점으로 최적\r
    - emoji: 🎯\r
      title: jointplot()\r
      description: 두 변수의 결합 분포 + 주변 분포\r
    - emoji: 📊\r
      title: FacetGrid\r
      description: 조건부 다중 패널. 커스텀 시각화 구성\r
  goal: 🔲 다변량 차트에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: styling\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎨 스타일링 시스템\r
    subtitle: 아름다운 차트 만들기\r
  - type: text\r
    content: |-\r
      Seaborn은 강력한 스타일링 시스템을 제공합니다. set_theme()으로 전체 테마를, set_style()로 배경 스타일을, set_palette()로 색상 팔레트를 설정합니다.\r
\r
      context 파라미터는 출력 목적에 따라 폰트와 선 크기를 조절합니다. paper, notebook, talk, poster 순으로 크기가 커집니다.\r
  - type: table\r
    headers:\r
    - 함수\r
    - 설정 대상\r
    - 옵션 예시\r
    rows:\r
    - - set_theme()\r
      - 전체 테마\r
      - style, palette, context 한번에\r
    - - set_style()\r
      - 배경 스타일\r
      - white, dark, whitegrid, darkgrid, ticks\r
    - - set_palette()\r
      - 색상 팔레트\r
      - deep, muted, bright, pastel, dark, colorblind\r
    - - set_context()\r
      - 출력 크기\r
      - paper, notebook, talk, poster\r
  - type: note\r
    style: tip\r
    title: 색맹 친화적 팔레트\r
    content: colorblind 팔레트는 색각 이상이 있는 사람도 구분할 수 있는 색상으로 구성되어 있습니다. 발표나 출판물에서는 이 팔레트를 권장합니다.\r
  goal: 🎨 스타일링 시스템에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: projects_preview\r
  blocks:\r
  - type: sectionHeader\r
    title: 🗺️ 10개 프로젝트 미리보기\r
    subtitle: 이 순서대로 배웁니다\r
  - type: table\r
    headers:\r
    - 단계\r
    - 프로젝트\r
    - 배울 내용\r
    rows:\r
    - - 입문\r
      - 01 붓꽃품종산점도\r
      - scatterplot, hue, palette\r
    - - 입문\r
      - 02 팁데이터분포탐색\r
      - histplot, stripplot, multiple\r
    - - 기초\r
      - 03 펭귄체중분포비교\r
      - boxplot, violinplot, hue\r
    - - 기초\r
      - 04 광고비판매액회귀\r
      - regplot, ci, scatter\r
    - - 기초\r
      - 05 타이타닉생존분석\r
      - barplot, countplot, catplot, col\r
    - - 중급\r
      - 06 항공편승객시계열\r
      - heatmap, lineplot, annot\r
    - - 중급\r
      - 07 세계기대수명분석\r
      - relplot, size, col\r
    - - 중급\r
      - 08 다이아몬드가격분석\r
      - displot, kdeplot, multiple\r
    - - 심화\r
      - 09 자동차연비종합분석\r
      - pairplot, jointplot, lmplot\r
    - - 심화\r
      - 10 종합EDA리포트\r
      - 모든 개념 종합, FacetGrid, set_theme\r
  - type: note\r
    style: info\r
    title: 프로젝트 기반 학습\r
    content: 각 프로젝트는 완성된 분석 결과물을 만듭니다. 개념을 배우면서 실제 데이터로 EDA를 수행합니다.\r
  goal: 🗺️ 10개 프로젝트 미리보기에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: datasets\r
  blocks:\r
  - type: sectionHeader\r
    title: 📦 내장 데이터셋\r
    subtitle: 학습에 최적화된 데이터\r
  - type: text\r
    content: |-\r
      Codaro는 학습과 예제를 위한 로컬 데이터셋을 제공합니다. loadLocalDataset() 함수로 간편하게 불러오며, 인터넷 연결 없이 같은 예제를 재현할 수 있습니다.\r
\r
      이 과정에서는 iris(붓꽃), tips(팁), penguins(펭귄), titanic(타이타닉), flights(항공편), diamonds(다이아몬드), mpg(자동차 연비) 데이터를 사용합니다.\r
  - type: table\r
    headers:\r
    - 데이터셋\r
    - 행 수\r
    - 주요 변수\r
    - 분석 주제\r
    rows:\r
    - - iris\r
      - '150'\r
      - 꽃잎/꽃받침 길이, 품종\r
      - 분류, 산점도\r
    - - tips\r
      - '120'\r
      - 결제금액, 팁, 요일, 시간\r
      - 회귀, 범주 비교\r
    - - penguins\r
      - '120'\r
      - 종, 섬, 부리, 체중\r
      - 분포 비교, 다변량\r
    - - titanic\r
      - '180'\r
      - 생존, 클래스, 성별, 나이\r
      - 생존 분석, 범주\r
    - - flights\r
      - '144'\r
      - 연도, 월, 승객 수\r
      - 시계열, 히트맵\r
    - - diamonds\r
      - '5400'\r
      - 캐럿, 컷, 색상, 가격\r
      - 대용량, 분포\r
    - - mpg\r
      - '144'\r
      - 연비, 실린더, 마력, 원산지\r
      - 회귀, 다변량\r
  goal: 📦 내장 데이터셋에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: when_to_use\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚖️ 언제 Seaborn을 선택할까?\r
    subtitle: 상황별 가이드\r
  - type: table\r
    headers:\r
    - 상황\r
    - 적합도\r
    - 이유\r
    rows:\r
    - - 탐색적 데이터 분석(EDA)\r
      - O\r
      - 빠른 시각화, 자동 통계\r
    - - 그룹별 분포 비교\r
      - O\r
      - hue 파라미터로 한 줄 해결\r
    - - 상관관계 분석\r
      - O\r
      - heatmap, pairplot\r
    - - 회귀 분석 시각화\r
      - O\r
      - regplot, lmplot\r
    - - 세밀한 커스터마이징\r
      - △\r
      - Matplotlib 결합 필요\r
    - - 비표준 차트\r
      - X\r
      - Matplotlib 직접 사용\r
    - - 인터랙티브 차트\r
      - X\r
      - Plotly 등 사용\r
  - type: note\r
    style: tip\r
    title: Matplotlib과 함께 사용하기\r
    content: Seaborn으로 빠르게 기본 차트를 만들고, Matplotlib으로 세부 조정하는 워크플로우가 효과적입니다. ax 파라미터로 기존 Axes에 Seaborn 차트를\r
      추가할 수 있습니다.\r
  goal: ⚖️ 언제 Seaborn을 선택할까?에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: resources\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 참고 자료\r
    subtitle: 더 깊이 공부하고 싶다면\r
  - type: links\r
    items:\r
    - text: Seaborn 공식 문서\r
      url: https://seaborn.pydata.org/\r
      icon: 🔗\r
    - text: Seaborn 갤러리\r
      url: https://seaborn.pydata.org/examples/index.html\r
      icon: 🔗\r
    - text: Seaborn 튜토리얼\r
      url: https://seaborn.pydata.org/tutorial.html\r
      icon: 🔗\r
    - text: Seaborn GitHub\r
      url: https://github.com/mwaskom/seaborn\r
      icon: 🔗\r
  goal: 📚 참고 자료에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: next\r
  blocks:\r
  - type: hero\r
    emoji: 👉\r
    title: '다음: 붓꽃 품종 산점도'\r
    subtitle: scatterplot으로 품종별 꽃잎 특성을 시각화합니다\r
  goal: '다음: 붓꽃 품종 산점도에서 분석용 테이블을 바꿨을 때 분포, 그룹, 관계 패턴가 어떻게 달라지는지 확인한다.'\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
- id: workflow_validation\r
  title: 17단계. Seaborn 학습 흐름 검증\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 수정 → 검증 → 실무 변주\r
  goal: 17단계. Seaborn 학습 흐름 검증에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    Seaborn 입문은 함수 이름을 외우는 과정이 아닙니다. 어떤 질문에 어떤 차트를 고르고, 데이터 구조가 그 차트에 맞는지 확인한 뒤, 완성된 Axes가 보고서에 들어갈 수준인지 점검해야 합니다.\r
\r
    입문 레슨도 로컬 데이터, 예측, 검증, 변주를 한 번 통과해야 뒤 레슨의 차트 선택 기준이 생깁니다.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    seabornTips = loadLocalDataset("tips")\r
    requiredColumns = {"total_bill", "tip", "sex", "smoker", "day", "time", "size"}\r
    missingColumns = requiredColumns - set(seabornTips.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert len(seabornTips) >= 100\r
    assert seabornTips["total_bill"].gt(seabornTips["tip"]).all()\r
\r
    prediction = "계산 금액이 클수록 팁도 대체로 커질 것이다"\r
    correlation = seabornTips[["total_bill", "tip"]].corr().loc["total_bill", "tip"]\r
    assert correlation > 0.6\r
\r
    print(prediction, round(correlation, 3))\r
  exercise:\r
    prompt: 17단계. Seaborn 학습 흐름 검증 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      seabornTips = loadLocalDataset("tips")\r
      requiredColumns = {"total_bill", "tip", "sex", "smoker", "day", "time", "size"}\r
      missingColumns = requiredColumns - set(seabornTips.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert len(seabornTips) >= 100\r
      assert seabornTips["total_bill"].gt(seabornTips["tip"]).all()\r
\r
      prediction = "계산 금액이 클수록 팁도 대체로 커질 것이다"\r
      correlation = seabornTips[["total_bill", "tip"]].corr().loc["total_bill", "tip"]\r
      assert correlation > 0.6\r
\r
      print(prediction, round(correlation, 3))\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 17단계. Seaborn 학습 흐름 검증의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 17단계. Seaborn 학습 흐름 검증의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};