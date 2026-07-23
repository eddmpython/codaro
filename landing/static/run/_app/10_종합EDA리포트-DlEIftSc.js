var e=`meta:\r
  packages:\r
  - matplotlib\r
  - pandas\r
  - seaborn\r
  id: seaborn_10\r
  title: 종합EDA리포트\r
  order: 10\r
  category: seaborn\r
  difficulty: ⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - seaborn\r
  - EDA\r
  - FacetGrid\r
  - set_theme\r
  - penguins\r
  - 종합분석\r
  seo:\r
    title: Seaborn 종합 EDA - 펭귄 데이터 탐색적 분석\r
    description: Seaborn의 모든 기능을 활용하여 펭귄 데이터셋의 완전한 EDA 리포트를 작성합니다. FacetGrid, 테마 설정, 다양한 차트 유형을 종합합니다.\r
    keywords:\r
    - seaborn\r
    - EDA\r
    - FacetGrid\r
    - set_theme\r
    - penguins\r
    - 종합분석\r
intro:\r
  emoji: 📊\r
  goal: penguins 데이터로 지금까지 배운 모든 Seaborn 기능을 종합하여 완전한 EDA 리포트를 작성합니다.\r
  description: 이 프로젝트에서는 테마 설정, countplot, histplot, boxplot, violinplot, scatterplot, pairplot, heatmap,\r
    jointplot, lmplot, FacetGrid 등 모든 Seaborn 기능을 활용합니다. 이전에 배운 모든 개념을 종합하여 실전 EDA를 수행합니다.\r
  direction: 종합EDA리포트에서 정리된 데이터를 통계 차트로 보고 분포와 관계를 검증합니다.\r
  benefits:\r
  - 분석용 테이블 확인 후 통계 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 종합EDA리포트 결과를 분포, 그룹, 관계 패턴 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 탐색 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리와 테마 설 입력 확인\r
      detail: 입력 기준(분석용 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 기초 통계 처리 실행\r
      detail: 통계 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 종별 개체 수 결과 검증\r
      detail: 분포, 그룹, 관계 패턴 기준으로 실행 결과를 비교합니다.\r
    - label: 종합EDA리포트 재사용\r
      detail: 완성 코드를 탐색 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 통계 시각화 환경\r
      detail: matplotlib, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합EDA리포트 실행\r
      detail: 셀을 실행해 분포, 그룹, 관계 패턴와 예외 상태를 확인합니다.\r
    - label: 종합EDA리포트 완료\r
      detail: 검증된 코드를 탐색 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리와 테마 설정\r
  structuredPrimary: true\r
  subtitle: set_theme()\r
  goal: 1단계. 라이브러리와 테마 설정에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    데이터를 로드하고 Seaborn 테마를 설정합니다. set_theme()으로 전역 스타일을 지정합니다.\r
\r
    set_theme()은 전역 스타일을 설정합니다. style은 'white', 'dark', 'whitegrid', 'darkgrid', 'ticks' 중 선택합니다. palette는 색상 팔레트, font_scale은 글꼴 크기 배율입니다.\r
  tips:\r
  - set_theme()은 전역 스타일을 설정합니다. style은 'white', 'dark', 'whitegrid', 'darkgrid', 'ticks' 중 선택합니다. palette는\r
    색상 팔레트, font_scale은 글꼴 크기 배율입니다.\r
  snippet: |-\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    sns.set_theme(style='whitegrid', palette='Set2', font_scale=1.1)\r
    penguins = loadLocalDataset('penguins').dropna()\r
    penguins\r
  exercise:\r
    prompt: 1단계. 라이브러리와 테마 설정 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      sns.set_theme(style='whitegrid', palette='Set2', font_scale=1.1)\r
      penguins = loadLocalDataset('penguins').dropna()\r
      penguins\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리와 테마 설정의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 라이브러리와 테마 설정의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_describe\r
  title: 2단계. 기초 통계\r
  structuredPrimary: true\r
  subtitle: describe()\r
  goal: 2단계. 기초 통계에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 통계 시각화는 데이터의 분포와 관계를 빠르게 점검하는 탐색 분석 흐름입니다.\r
  explanation: 데이터 기본 정보를 확인합니다. describe()로 수치형 변수의 통계량을 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: penguins.describe()\r
  exercise:\r
    prompt: 2단계. 기초 통계 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: penguins.describe()\r
    hints:\r
    - 바꿀 지점은 분석용 테이블을 만드는 첫 줄과 통계 차트 구성 줄에서 찾으세요.\r
    - 실행 뒤 분포, 그룹, 관계 패턴 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 기초 통계의 수정 코드가 통계 차트 구성 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 2단계. 기초 통계 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step3_countplot\r
  title: 3단계. 종별 개체 수\r
  structuredPrimary: true\r
  subtitle: sns.countplot()\r
  goal: 3단계. 종별 개체 수에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 종별 개체 수를 countplot으로 확인합니다. hue로 성별을 구분합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figCount, axCount = plt.subplots(figsize=(8, 5))\r
    sns.countplot(data=penguins, x='species', hue='sex', palette='Set2', ax=axCount)\r
    axCount.set_title('Penguin Count by Species and Sex')\r
    figCount\r
  exercise:\r
    prompt: 3단계. 종별 개체 수 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figCount, axCount = plt.subplots(figsize=(8, 5))\r
      sns.countplot(data=penguins, x='species', hue='sex', palette='Set2', ax=axCount)\r
      axCount.set_title('Penguin Count by Species and Sex')\r
      figCount\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 종별 개체 수의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 종별 개체 수 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step4_island\r
  title: 4단계. 섬별 분포\r
  structuredPrimary: true\r
  subtitle: 그룹별 비교\r
  goal: 4단계. 섬별 분포에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 섬별 종 분포를 확인합니다. 각 섬에 어떤 종이 서식하는지 파악합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figIsland, axIsland = plt.subplots(figsize=(10, 5))\r
    sns.countplot(data=penguins, x='island', hue='species', palette='Set2', ax=axIsland)\r
    axIsland.set_title('Species Distribution by Island')\r
    figIsland\r
  exercise:\r
    prompt: 4단계. 섬별 분포 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figIsland, axIsland = plt.subplots(figsize=(10, 5))\r
      sns.countplot(data=penguins, x='island', hue='species', palette='Set2', ax=axIsland)\r
      axIsland.set_title('Species Distribution by Island')\r
      figIsland\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 섬별 분포의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 섬별 분포 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step5_histplot\r
  title: 5단계. 체중 분포\r
  structuredPrimary: true\r
  subtitle: sns.histplot()\r
  goal: 5단계. 체중 분포에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 체중 분포를 종별로 비교합니다. kde=True로 밀도 곡선을 추가합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figMass, axMass = plt.subplots(figsize=(10, 5))\r
    sns.histplot(data=penguins, x='body_mass_g', hue='species', kde=True, palette='Set2', ax=axMass)\r
    axMass.set_title('Body Mass Distribution by Species')\r
    figMass\r
  exercise:\r
    prompt: 5단계. 체중 분포 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figMass, axMass = plt.subplots(figsize=(10, 5))\r
      sns.histplot(data=penguins, x='body_mass_g', hue='species', kde=True, palette='Set2', ax=axMass)\r
      axMass.set_title('Body Mass Distribution by Species')\r
      figMass\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 체중 분포의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 체중 분포 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step6_boxplot\r
  title: 6단계. 부리 길이 박스플롯\r
  structuredPrimary: true\r
  subtitle: sns.boxplot()\r
  goal: 6단계. 부리 길이 박스플롯에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 박스플롯으로 부리 길이 분포를 비교합니다. 중앙값, 사분위수, 이상치를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figBox, axBox = plt.subplots(figsize=(10, 5))\r
    sns.boxplot(data=penguins, x='species', y='bill_length_mm', hue='sex', palette='Set2', ax=axBox)\r
    axBox.set_title('Bill Length by Species and Sex')\r
    figBox\r
  exercise:\r
    prompt: 6단계. 부리 길이 박스플롯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBox, axBox = plt.subplots(figsize=(10, 5))\r
      sns.boxplot(data=penguins, x='species', y='bill_length_mm', hue='sex', palette='Set2', ax=axBox)\r
      axBox.set_title('Bill Length by Species and Sex')\r
      figBox\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 부리 길이 박스플롯의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 부리 길이 박스플롯 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step7_violinplot\r
  title: 7단계. 날개 길이 바이올린\r
  structuredPrimary: true\r
  subtitle: sns.violinplot()\r
  goal: 7단계. 날개 길이 바이올린에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 바이올린 플롯으로 날개 길이 분포를 확인합니다. split=True로 성별을 양쪽에 표시합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figViolin, axViolin = plt.subplots(figsize=(10, 5))\r
    sns.violinplot(data=penguins, x='species', y='flipper_length_mm', hue='sex', split=True, palette='Set2', ax=axViolin)\r
    axViolin.set_title('Flipper Length Distribution')\r
    figViolin\r
  exercise:\r
    prompt: 7단계. 날개 길이 바이올린 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figViolin, axViolin = plt.subplots(figsize=(10, 5))\r
      sns.violinplot(data=penguins, x='species', y='flipper_length_mm', hue='sex', split=True, palette='Set2', ax=axViolin)\r
      axViolin.set_title('Flipper Length Distribution')\r
      figViolin\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 날개 길이 바이올린의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 날개 길이 바이올린 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step8_scatterplot\r
  title: 8단계. 다차원 산점도\r
  structuredPrimary: true\r
  subtitle: size, style\r
  goal: 8단계. 다차원 산점도에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 부리 길이와 깊이의 관계를 산점도로 분석합니다. hue, style, size로 4개 변수를 동시에 표현합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figScatter, axScatter = plt.subplots(figsize=(10, 6))\r
    sns.scatterplot(data=penguins, x='bill_length_mm', y='bill_depth_mm', hue='species', style='sex', size='body_mass_g', sizes=(50, 300), palette='Set2', alpha=0.7, ax=axScatter)\r
    axScatter.legend(bbox_to_anchor=(1.02, 1), loc='upper left')\r
    axScatter.set_title('Bill Dimensions with Size = Body Mass')\r
    figScatter\r
  exercise:\r
    prompt: 8단계. 다차원 산점도 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figScatter, axScatter = plt.subplots(figsize=(10, 6))\r
      sns.scatterplot(data=penguins, x='bill_length_mm', y='bill_depth_mm', hue='species', style='sex', size='body_mass_g', sizes=(50, 300), palette='Set2', alpha=0.7, ax=axScatter)\r
      axScatter.legend(bbox_to_anchor=(1.02, 1), loc='upper left')\r
      axScatter.set_title('Bill Dimensions with Size = Body Mass')\r
      figScatter\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 다차원 산점도의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 다차원 산점도 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step9_pairplot\r
  title: 9단계. pairplot\r
  structuredPrimary: true\r
  subtitle: 전체 변수 관계\r
  goal: 9단계. pairplot에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: pairplot으로 모든 수치 변수 관계를 탐색합니다. 대각선에는 KDE, 비대각선에는 산점도가 표시됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    gPair = sns.pairplot(penguins, hue='species', diag_kind='kde', palette='Set2', height=2.5)\r
    gPair.figure.suptitle('Penguin Measurements Pairplot', y=1.02)\r
    gPair.figure\r
  exercise:\r
    prompt: 9단계. pairplot 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gPair = sns.pairplot(penguins, hue='species', diag_kind='kde', palette='Set2', height=2.5)\r
      gPair.figure.suptitle('Penguin Measurements Pairplot', y=1.02)\r
      gPair.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. pairplot의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. pairplot의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_heatmap\r
  title: 10단계. 상관계수 히트맵\r
  structuredPrimary: true\r
  subtitle: sns.heatmap()\r
  goal: 10단계. 상관계수 히트맵에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 상관계수 히트맵을 그립니다. 변수 간 선형 관계 강도를 색상으로 표현합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    penguinsNumeric = penguins[['bill_length_mm', 'bill_depth_mm', 'flipper_length_mm', 'body_mass_g']]\r
    corrMatrix = penguinsNumeric.corr()\r
    figCorr, axCorr = plt.subplots(figsize=(8, 6))\r
    sns.heatmap(corrMatrix, annot=True, fmt='.2f', cmap='RdYlBu_r', vmin=-1, vmax=1, center=0, linewidths=0.5, ax=axCorr)\r
    axCorr.set_title('Correlation Matrix')\r
    figCorr\r
  exercise:\r
    prompt: 10단계. 상관계수 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      penguinsNumeric = penguins[['bill_length_mm', 'bill_depth_mm', 'flipper_length_mm', 'body_mass_g']]\r
      corrMatrix = penguinsNumeric.corr()\r
      figCorr, axCorr = plt.subplots(figsize=(8, 6))\r
      sns.heatmap(corrMatrix, annot=True, fmt='.2f', cmap='RdYlBu_r', vmin=-1, vmax=1, center=0, linewidths=0.5, ax=axCorr)\r
      axCorr.set_title('Correlation Matrix')\r
      figCorr\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 상관계수 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 상관계수 히트맵의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step11_jointplot\r
  title: 11단계. jointplot\r
  structuredPrimary: true\r
  subtitle: 상세 2변수 분석\r
  goal: 11단계. jointplot에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: jointplot으로 날개 길이와 체중 관계를 상세 분석합니다. 중앙에 산점도, 양 축에 분포를 표시합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    gJoint = sns.jointplot(data=penguins, x='flipper_length_mm', y='body_mass_g', hue='species', kind='scatter', palette='Set2', height=7)\r
    gJoint.figure.suptitle('Flipper Length vs Body Mass', y=1.02)\r
    gJoint.figure\r
  exercise:\r
    prompt: 11단계. jointplot 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gJoint = sns.jointplot(data=penguins, x='flipper_length_mm', y='body_mass_g', hue='species', kind='scatter', palette='Set2', height=7)\r
      gJoint.figure.suptitle('Flipper Length vs Body Mass', y=1.02)\r
      gJoint.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. jointplot의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. jointplot의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step12_lmplot\r
  title: 12단계. lmplot 회귀\r
  structuredPrimary: true\r
  subtitle: 그룹별 회귀\r
  goal: 12단계. lmplot 회귀에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: lmplot으로 종별 회귀 분석을 수행합니다. col로 성별 패널을 분리합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    gLm = sns.lmplot(data=penguins, x='flipper_length_mm', y='body_mass_g', hue='species', col='sex', palette='Set2', height=4)\r
    gLm.figure.suptitle('Regression by Species and Sex', y=1.02)\r
    gLm.figure\r
  exercise:\r
    prompt: 12단계. lmplot 회귀 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gLm = sns.lmplot(data=penguins, x='flipper_length_mm', y='body_mass_g', hue='species', col='sex', palette='Set2', height=4)\r
      gLm.figure.suptitle('Regression by Species and Sex', y=1.02)\r
      gLm.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. lmplot 회귀의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 12단계. lmplot 회귀의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step13_facetgrid\r
  title: 13단계. FacetGrid 기본\r
  structuredPrimary: true\r
  subtitle: 커스텀 다중 패널\r
  goal: 13단계. FacetGrid 기본에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    FacetGrid를 사용하여 커스텀 다중 패널을 만듭니다. col, row, hue를 조합하여 다차원 비교가 가능합니다.\r
\r
    FacetGrid는 가장 유연한 다중 패널 도구입니다. col, row로 그리드를 정의하고, map()으로 각 패널에 그릴 플롯 함수를 지정합니다. Axes-level 함수만 사용 가능합니다.\r
  tips:\r
  - FacetGrid는 가장 유연한 다중 패널 도구입니다. col, row로 그리드를 정의하고, map()으로 각 패널에 그릴 플롯 함수를 지정합니다. Axes-level 함수만\r
    사용 가능합니다.\r
  snippet: |-\r
    gFacet = sns.FacetGrid(penguins, col='species', row='sex', hue='island', palette='Set2', height=3, aspect=1.2)\r
    gFacet.map(sns.scatterplot, 'bill_length_mm', 'bill_depth_mm', alpha=0.7)\r
    gFacet.add_legend()\r
    gFacet.figure.suptitle('Bill Dimensions by Species, Sex, and Island', y=1.02)\r
    gFacet.figure\r
  exercise:\r
    prompt: 13단계. FacetGrid 기본 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gFacet = sns.FacetGrid(penguins, col='species', row='sex', hue='island', palette='Set2', height=3, aspect=1.2)\r
      gFacet.map(sns.scatterplot, 'bill_length_mm', 'bill_depth_mm', alpha=0.7)\r
      gFacet.add_legend()\r
      gFacet.figure.suptitle('Bill Dimensions by Species, Sex, and Island', y=1.02)\r
      gFacet.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. FacetGrid 기본의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 13단계. FacetGrid 기본의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step14_facetgrid_hist\r
  title: 14단계. FacetGrid 히스토그램\r
  structuredPrimary: true\r
  subtitle: map() 활용\r
  goal: 14단계. FacetGrid 히스토그램에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: FacetGrid에 히스토그램을 적용합니다. map()에 다양한 플롯 함수를 전달할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    gFacetHist = sns.FacetGrid(penguins, col='species', hue='sex', palette='Set2', height=4)\r
    gFacetHist.map(sns.histplot, 'body_mass_g', kde=True, alpha=0.6)\r
    gFacetHist.add_legend()\r
    gFacetHist.figure.suptitle('Body Mass Distribution by Species and Sex', y=1.02)\r
    gFacetHist.figure\r
  exercise:\r
    prompt: 14단계. FacetGrid 히스토그램 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gFacetHist = sns.FacetGrid(penguins, col='species', hue='sex', palette='Set2', height=4)\r
      gFacetHist.map(sns.histplot, 'body_mass_g', kde=True, alpha=0.6)\r
      gFacetHist.add_legend()\r
      gFacetHist.figure.suptitle('Body Mass Distribution by Species and Sex', y=1.02)\r
      gFacetHist.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. FacetGrid 히스토그램의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 14단계. FacetGrid 히스토그램의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step15_style_compare\r
  title: 15단계. 스타일 비교\r
  structuredPrimary: true\r
  subtitle: axes_style()\r
  goal: 15단계. 스타일 비교에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    다양한 스타일을 비교해봅니다. axes_style()은 컨텍스트 매니저로 특정 플롯에만 스타일을 적용합니다.\r
\r
    axes_style()은 컨텍스트 매니저로 특정 플롯에만 스타일을 적용합니다. with 문 안에서만 해당 스타일이 적용되고 이후에는 원래 스타일로 돌아갑니다.\r
  snippet: |-\r
    styles = ['white', 'dark', 'whitegrid', 'darkgrid', 'ticks']\r
    figStyles, axesStyles = plt.subplots(1, 5, figsize=(20, 4))\r
    for idx, styleName in enumerate(styles):\r
        with sns.axes_style(styleName):\r
            sns.boxplot(data=penguins, x='species', y='body_mass_g', hue='species', palette='Set2', legend=False, ax=axesStyles[idx])\r
            axesStyles[idx].set_title(styleName)\r
            axesStyles[idx].set_xlabel('')\r
    figStyles.suptitle('Seaborn Style Comparison', y=1.02)\r
    figStyles.tight_layout()\r
    figStyles\r
  exercise:\r
    prompt: 15단계. 스타일 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      styles = ['white', 'dark', 'whitegrid', 'darkgrid', 'ticks']\r
      figStyles, axesStyles = plt.subplots(1, 5, figsize=(20, 4))\r
      for idx, styleName in enumerate(styles):\r
          with sns.axes_style(styleName):\r
              sns.boxplot(data=penguins, x='species', y='body_mass_g', hue='species', palette='Set2', legend=False, ax=axesStyles[idx])\r
              axesStyles[idx].set_title(styleName)\r
              axesStyles[idx].set_xlabel('')\r
      figStyles.suptitle('Seaborn Style Comparison', y=1.02)\r
      figStyles.tight_layout()\r
      figStyles\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 스타일 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 15단계. 스타일 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step16_context\r
  title: 16단계. 컨텍스트 비교\r
  structuredPrimary: true\r
  subtitle: plotting_context()\r
  goal: 16단계. 컨텍스트 비교에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    컨텍스트 크기를 비교합니다. 출력 목적에 맞는 크기를 선택합니다.\r
\r
    plotting_context()로 출력 목적에 맞는 크기를 설정합니다. 'paper'(논문), 'notebook'(기본), 'talk'(발표), 'poster'(포스터) 순으로 요소 크기가 커집니다.\r
  tips:\r
  - plotting_context()로 출력 목적에 맞는 크기를 설정합니다. 'paper'(논문), 'notebook'(기본), 'talk'(발표), 'poster'(포스터) 순으로\r
    요소 크기가 커집니다.\r
  snippet: |-\r
    contexts = ['paper', 'notebook', 'talk', 'poster']\r
    figContext, axesContext = plt.subplots(2, 2, figsize=(12, 10))\r
    axesFlat = axesContext.flatten()\r
    for idx, contextName in enumerate(contexts):\r
        with sns.plotting_context(contextName):\r
            sns.barplot(data=penguins, x='species', y='body_mass_g', hue='species', palette='Set2', legend=False, ax=axesFlat[idx])\r
            axesFlat[idx].set_title(f'Context: {contextName}')\r
    figContext.suptitle('Seaborn Context Comparison', y=1.02)\r
    figContext.tight_layout()\r
    figContext\r
  exercise:\r
    prompt: 16단계. 컨텍스트 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      contexts = ['paper', 'notebook', 'talk', 'poster']\r
      figContext, axesContext = plt.subplots(2, 2, figsize=(12, 10))\r
      axesFlat = axesContext.flatten()\r
      for idx, contextName in enumerate(contexts):\r
          with sns.plotting_context(contextName):\r
              sns.barplot(data=penguins, x='species', y='body_mass_g', hue='species', palette='Set2', legend=False, ax=axesFlat[idx])\r
              axesFlat[idx].set_title(f'Context: {contextName}')\r
      figContext.suptitle('Seaborn Context Comparison', y=1.02)\r
      figContext.tight_layout()\r
      figContext\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 16단계. 컨텍스트 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 16단계. 컨텍스트 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: 17단계. 종합 EDA 리포트 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 수정 → 검증 → 실무 변주\r
  goal: 17단계. 종합 EDA 리포트 검증 루프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    종합 리포트는 차트를 많이 넣는 것이 아니라 질문, 데이터 계약, 핵심 지표, 검증 가능한 차트를 일관되게 묶는 일입니다. 펭귄 데이터로 보고서에 들어갈 주장과 차트를 같이 검증합니다.\r
\r
    종합 EDA의 품질은 차트 수가 아니라, 입력 검증과 주장 검증이 리포트 안에 남아 있는지로 판단합니다.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    edaPenguins = loadLocalDataset("penguins").dropna()\r
    requiredColumns = {"species", "island", "bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g", "sex"}\r
    missingColumns = requiredColumns - set(edaPenguins.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert not edaPenguins[list(requiredColumns)].isna().any().any()\r
\r
    summaryClaim = edaPenguins.groupby("species")["body_mass_g"].mean().sort_values(ascending=False)\r
    assert summaryClaim.index[0] == "Gentoo"\r
    summaryClaim.round(1)\r
  exercise:\r
    prompt: 17단계. 종합 EDA 리포트 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      edaPenguins = loadLocalDataset("penguins").dropna()\r
      requiredColumns = {"species", "island", "bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g", "sex"}\r
      missingColumns = requiredColumns - set(edaPenguins.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert not edaPenguins[list(requiredColumns)].isna().any().any()\r
\r
      summaryClaim = edaPenguins.groupby("species")["body_mass_g"].mean().sort_values(ascending=False)\r
      assert summaryClaim.index[0] == "Gentoo"\r
      summaryClaim.round(1)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 17단계. 종합 EDA 리포트 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 17단계. 종합 EDA 리포트 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 종합 EDA\r
  goal: 실습에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 개념을 활용하여 미션을 수행해봅시다. 각 미션은 독립적으로 실행 가능합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import matplotlib.pyplot as plt\r
\r
    sns.set_theme(style='whitegrid', palette='husl')\r
    data = loadLocalDataset('tips')\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import matplotlib.pyplot as plt\r
\r
      sns.set_theme(style='whitegrid', palette='husl')\r
      data = loadLocalDataset('tips')\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};