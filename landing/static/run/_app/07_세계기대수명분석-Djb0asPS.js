var e=`meta:\r
  packages:\r
  - matplotlib\r
  - pandas\r
  - seaborn\r
  id: seaborn_07\r
  title: 세계기대수명분석\r
  order: 7\r
  category: seaborn\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - seaborn\r
  - relplot\r
  - scatterplot\r
  - gapminder\r
  - 다차원분석\r
  seo:\r
    title: Seaborn relplot - 세계 기대수명 다차원 분석\r
    description: Seaborn relplot으로 Gapminder 데이터의 GDP, 기대수명, 인구를 다차원으로 시각화합니다. col, size, style 파라미터 활용법을\r
      배웁니다.\r
    keywords:\r
    - seaborn\r
    - relplot\r
    - scatterplot\r
    - gapminder\r
    - 다차원분석\r
intro:\r
  emoji: 🌍\r
  goal: Gapminder 데이터로 대륙별 GDP와 기대수명의 관계를 다차원으로 분석합니다.\r
  description: Gapminder 데이터셋은 전 세계 국가들의 인구, GDP, 기대수명 정보를 담고 있습니다. relplot()을 활용하여 다차원 데이터를 시각화합니다. 이전에\r
    배운 heatmap, lineplot, barplot 개념을 함께 활용합니다.\r
  direction: 세계기대수명분석에서 정리된 데이터를 통계 차트로 보고 분포와 관계를 검증합니다.\r
  benefits:\r
  - 분석용 테이블 확인 후 통계 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 세계기대수명분석 결과를 분포, 그룹, 관계 패턴 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 탐색 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(분석용 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 필터링 처리 실행\r
      detail: 통계 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 기본 산점도 결과 검증\r
      detail: 분포, 그룹, 관계 패턴 기준으로 실행 결과를 비교합니다.\r
    - label: 세계기대수명분석 재사용\r
      detail: 완성 코드를 탐색 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 통계 시각화 환경\r
      detail: matplotlib, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 세계기대수명분석 실행\r
      detail: 셀을 실행해 분포, 그룹, 관계 패턴와 예외 상태를 확인합니다.\r
    - label: 세계기대수명분석 완료\r
      detail: 검증된 코드를 탐색 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    seaborn과 matplotlib을 불러옵니다. Gapminder 데이터는 Hans Rosling 교수가 유명하게 만든 데이터로, 국가별 인구, GDP, 기대수명, 대륙 정보를 포함합니다.\r
\r
    Gapminder 데이터는 Hans Rosling 교수가 유명하게 만든 데이터로, 국가별 인구(pop), 1인당 GDP(gdpPercap), 기대수명(lifeExp), 대륙(continent) 정보를 포함합니다.\r
  tips:\r
  - Gapminder 데이터는 Hans Rosling 교수가 유명하게 만든 데이터로, 국가별 인구(pop), 1인당 GDP(gdpPercap), 기대수명(lifeExp), 대륙(continent)\r
    정보를 포함합니다.\r
  snippet: |-\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    gapminder = loadLocalDataset("gapminder")\r
    gapminder\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      gapminder = loadLocalDataset("gapminder")\r
      gapminder\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_filter\r
  title: 2단계. 데이터 필터링\r
  structuredPrimary: true\r
  subtitle: 2007년 데이터\r
  goal: 2단계. 데이터 필터링에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 2007년 최신 데이터만 필터링합니다. 최신 데이터를 사용하면 현재 상황에 가까운 분석이 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    gap2007 = gapminder[gapminder['year'] == 2007].copy()\r
    gap2007\r
  exercise:\r
    prompt: 2단계. 데이터 필터링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      gap2007 = gapminder[gapminder['year'] == 2007].copy()\r
      gap2007\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 필터링에서 \`gap2007\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 데이터 필터링 실행 뒤 \`gap2007\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step3_scatter_basic\r
  title: 3단계. 기본 산점도\r
  structuredPrimary: true\r
  subtitle: sns.scatterplot()\r
  goal: 3단계. 기본 산점도에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: GDP와 기대수명의 관계를 산점도로 확인합니다. 두 변수 간의 상관관계를 한눈에 파악할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figScatter, axScatter = plt.subplots(figsize=(10, 6))\r
    sns.scatterplot(data=gap2007, x='gdpPercap', y='lifeExp', ax=axScatter)\r
    axScatter.set_title('GDP vs Life Expectancy (2007)')\r
    figScatter\r
  exercise:\r
    prompt: 3단계. 기본 산점도 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figScatter, axScatter = plt.subplots(figsize=(10, 6))\r
      sns.scatterplot(data=gap2007, x='gdpPercap', y='lifeExp', ax=axScatter)\r
      axScatter.set_title('GDP vs Life Expectancy (2007)')\r
      figScatter\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 기본 산점도의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 기본 산점도 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step4_scatter_hue\r
  title: 4단계. 대륙별 구분\r
  structuredPrimary: true\r
  subtitle: hue 파라미터\r
  goal: 4단계. 대륙별 구분에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 대륙별로 색상을 구분합니다. hue로 범주형 변수를 지정하면 그룹별 패턴을 비교할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figHue, axHue = plt.subplots(figsize=(10, 6))\r
    sns.scatterplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', palette='Set1', ax=axHue)\r
    axHue.set_title('GDP vs Life Expectancy by Continent')\r
    figHue\r
  exercise:\r
    prompt: 4단계. 대륙별 구분 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHue, axHue = plt.subplots(figsize=(10, 6))\r
      sns.scatterplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', palette='Set1', ax=axHue)\r
      axHue.set_title('GDP vs Life Expectancy by Continent')\r
      figHue\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 대륙별 구분의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. 대륙별 구분 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step5_scatter_size\r
  title: 5단계. 인구 크기 표현\r
  structuredPrimary: true\r
  subtitle: size 파라미터\r
  goal: 5단계. 인구 크기 표현에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    인구 크기를 점 크기로 표현합니다. 3개의 차원(GDP, 기대수명, 인구)을 동시에 시각화합니다.\r
\r
    size 파라미터로 연속형 변수를 점 크기에 매핑합니다. sizes=(최소, 최대)로 크기 범위를 지정합니다. alpha는 투명도(0~1)로 겹치는 점을 구분하는 데 도움이 됩니다.\r
  snippet: |-\r
    figSize, axSize = plt.subplots(figsize=(12, 7))\r
    sns.scatterplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 1000), palette='Set1', alpha=0.7, ax=axSize)\r
    axSize.legend(bbox_to_anchor=(1.02, 1), loc='upper left')\r
    axSize.set_title('GDP vs Life Expectancy (Size = Population)')\r
    figSize\r
  exercise:\r
    prompt: 5단계. 인구 크기 표현 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figSize, axSize = plt.subplots(figsize=(12, 7))\r
      sns.scatterplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 1000), palette='Set1', alpha=0.7, ax=axSize)\r
      axSize.legend(bbox_to_anchor=(1.02, 1), loc='upper left')\r
      axSize.set_title('GDP vs Life Expectancy (Size = Population)')\r
      figSize\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 인구 크기 표현의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 인구 크기 표현 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step6_relplot_basic\r
  title: 6단계. relplot 기본\r
  structuredPrimary: true\r
  subtitle: Figure-level 함수\r
  goal: 6단계. relplot 기본에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    relplot()을 사용하여 Figure-level 산점도를 그립니다. relplot은 자체 Figure를 생성하며 다중 패널을 쉽게 만들 수 있습니다.\r
\r
    relplot()은 Figure-level 함수로 자체 Figure를 생성합니다. height와 aspect로 크기를 조절합니다. Axes-level인 scatterplot()과 달리 ax 파라미터가 없고 col, row로 다중 패널을 만들 수 있습니다.\r
  tips:\r
  - relplot()은 Figure-level 함수로 자체 Figure를 생성합니다. height와 aspect로 크기를 조절합니다. Axes-level인 scatterplot()과\r
    달리 ax 파라미터가 없고 col, row로 다중 패널을 만들 수 있습니다.\r
  snippet: |-\r
    gRel = sns.relplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), palette='Set1', alpha=0.7, height=5, aspect=1.5)\r
    gRel.figure.suptitle('GDP vs Life Expectancy (relplot)', y=1.02)\r
    gRel.figure\r
  exercise:\r
    prompt: 6단계. relplot 기본 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gRel = sns.relplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), palette='Set1', alpha=0.7, height=5, aspect=1.5)\r
      gRel.figure.suptitle('GDP vs Life Expectancy (relplot)', y=1.02)\r
      gRel.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. relplot 기본의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. relplot 기본의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_relplot_col\r
  title: 7단계. 대륙별 패널\r
  structuredPrimary: true\r
  subtitle: col 파라미터\r
  goal: 7단계. 대륙별 패널에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    대륙별로 패널을 분리하여 비교합니다. col 파라미터로 범주별 패널을 생성합니다.\r
\r
    col 파라미터로 범주별 패널을 생성합니다. col_wrap은 한 줄에 표시할 패널 수를 지정합니다. 각 패널이 독립적인 스케일을 가지므로 대륙별 패턴을 자세히 볼 수 있습니다.\r
  snippet: |-\r
    gCol = sns.relplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), col='continent', col_wrap=3, palette='Set1', alpha=0.7, height=4)\r
    gCol.figure.suptitle('GDP vs Life Expectancy by Continent', y=1.02)\r
    gCol.figure\r
  exercise:\r
    prompt: 7단계. 대륙별 패널 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gCol = sns.relplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), col='continent', col_wrap=3, palette='Set1', alpha=0.7, height=4)\r
      gCol.figure.suptitle('GDP vs Life Expectancy by Continent', y=1.02)\r
      gCol.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 대륙별 패널의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 대륙별 패널의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_relplot_line\r
  title: 8단계. 선 그래프\r
  structuredPrimary: true\r
  subtitle: kind='line'\r
  goal: 8단계. 선 그래프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    시간에 따른 변화를 선 그래프로 확인합니다. relplot에서 kind='line'으로 선 그래프를 그립니다.\r
\r
    relplot()에서 kind='line'으로 선 그래프를 그립니다. marker='o'로 데이터 포인트를 표시합니다. kind 기본값은 'scatter'입니다.\r
  snippet: |-\r
    continentAvg = gapminder.groupby(['year', 'continent'])[['lifeExp', 'gdpPercap']].mean().reset_index()\r
    gLine = sns.relplot(data=continentAvg, x='year', y='lifeExp', hue='continent', kind='line', palette='Set1', height=5, aspect=1.5, marker='o')\r
    gLine.figure.suptitle('Life Expectancy Trend by Continent', y=1.02)\r
    gLine.figure\r
  exercise:\r
    prompt: 8단계. 선 그래프 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      continentAvg = gapminder.groupby(['year', 'continent'])[['lifeExp', 'gdpPercap']].mean().reset_index()\r
      gLine = sns.relplot(data=continentAvg, x='year', y='lifeExp', hue='continent', kind='line', palette='Set1', height=5, aspect=1.5, marker='o')\r
      gLine.figure.suptitle('Life Expectancy Trend by Continent', y=1.02)\r
      gLine.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 선 그래프의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 선 그래프의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_style\r
  title: 9단계. 스타일 구분\r
  structuredPrimary: true\r
  subtitle: style 파라미터\r
  goal: 9단계. 스타일 구분에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    스타일로 추가 차원을 표현합니다. style 파라미터로 선 스타일이나 마커 모양을 구분합니다.\r
\r
    style 파라미터로 선 스타일(실선, 점선 등)이나 마커 모양을 구분합니다. hue와 style에 같은 변수를 지정하면 색상과 스타일 모두로 구분되어 흑백 인쇄에서도 구분 가능합니다.\r
  snippet: |-\r
    gapAsia = gapminder[(gapminder['continent'] == 'Asia') & (gapminder['country'].isin(['Korea, Rep.', 'Japan', 'China', 'India']))].copy()\r
    gStyle = sns.relplot(data=gapAsia, x='year', y='lifeExp', hue='country', style='country', kind='line', markers=True, palette='Dark2', height=5, aspect=1.5)\r
    gStyle.figure.suptitle('Life Expectancy in Asian Countries', y=1.02)\r
    gStyle.figure\r
  exercise:\r
    prompt: 9단계. 스타일 구분 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gapAsia = gapminder[(gapminder['continent'] == 'Asia') & (gapminder['country'].isin(['Korea, Rep.', 'Japan', 'China', 'India']))].copy()\r
      gStyle = sns.relplot(data=gapAsia, x='year', y='lifeExp', hue='country', style='country', kind='line', markers=True, palette='Dark2', height=5, aspect=1.5)\r
      gStyle.figure.suptitle('Life Expectancy in Asian Countries', y=1.02)\r
      gStyle.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 스타일 구분의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 스타일 구분의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_col_year\r
  title: 10단계. 연도별 패널\r
  structuredPrimary: true\r
  subtitle: 시간 비교\r
  goal: 10단계. 연도별 패널에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: GDP와 기대수명 관계를 연도별 패널로 비교합니다. 시간에 따른 변화를 직관적으로 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    gapDecade = gapminder[gapminder['year'].isin([1962, 1982, 2007])].copy()\r
    gYear = sns.relplot(data=gapDecade, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), col='year', palette='Set1', alpha=0.7, height=4)\r
    gYear.figure.suptitle('GDP vs Life Expectancy Over Decades', y=1.02)\r
    gYear.figure\r
  exercise:\r
    prompt: 10단계. 연도별 패널 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gapDecade = gapminder[gapminder['year'].isin([1962, 1982, 2007])].copy()\r
      gYear = sns.relplot(data=gapDecade, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), col='year', palette='Set1', alpha=0.7, height=4)\r
      gYear.figure.suptitle('GDP vs Life Expectancy Over Decades', y=1.02)\r
      gYear.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 연도별 패널의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 연도별 패널의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step11_log_scale\r
  title: 11단계. 로그 스케일\r
  structuredPrimary: true\r
  subtitle: xscale='log'\r
  goal: 11단계. 로그 스케일에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    x축을 로그 스케일로 변환하여 분포를 개선합니다. GDP처럼 넓은 범위의 데이터에 적합합니다.\r
\r
    g.set()으로 축 속성을 일괄 설정합니다. xscale='log'는 로그 스케일로 변환하여 넓은 범위의 데이터를 효과적으로 표시합니다. GDP처럼 기하급수적으로 분포하는 데이터에 적합합니다.\r
  tips:\r
  - g.set()으로 축 속성을 일괄 설정합니다. xscale='log'는 로그 스케일로 변환하여 넓은 범위의 데이터를 효과적으로 표시합니다. GDP처럼 기하급수적으로 분포하는 데이터에\r
    적합합니다.\r
  snippet: |-\r
    gLog = sns.relplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), palette='Set1', alpha=0.7, height=5, aspect=1.5)\r
    gLog.set(xscale='log')\r
    gLog.figure.suptitle('GDP (Log Scale) vs Life Expectancy', y=1.02)\r
    gLog.figure\r
  exercise:\r
    prompt: 11단계. 로그 스케일 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      gLog = sns.relplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), palette='Set1', alpha=0.7, height=5, aspect=1.5)\r
      gLog.set(xscale='log')\r
      gLog.figure.suptitle('GDP (Log Scale) vs Life Expectancy', y=1.02)\r
      gLog.figure\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 로그 스케일의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 로그 스케일의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 다차원 시각화\r
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
    data = loadLocalDataset('penguins').dropna()\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import matplotlib.pyplot as plt\r
\r
      data = loadLocalDataset('penguins').dropna()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: workflow_validation\r
  title: 12단계. 다차원 산점도 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 수정 → 검증 → 실무 변주\r
  goal: 12단계. 다차원 산점도 검증 루프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    Gapminder 산점도는 GDP, 기대수명, 인구, 대륙을 한 번에 보여 줍니다. 로그 축을 쓰기 전 양수 조건을 확인하고, 최신 연도 기준으로 해석을 고정합니다.\r
\r
    다차원 차트는 멋있지만, 로그 축과 size 의미가 데이터 조건을 만족해야 해석 가능한 보고서가 됩니다.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    gapFlow = loadLocalDataset("gapminder")\r
    requiredColumns = {"country", "continent", "year", "pop", "lifeExp", "gdpPercap"}\r
    missingColumns = requiredColumns - set(gapFlow.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert gapFlow[["pop", "lifeExp", "gdpPercap"]].gt(0).all().all()\r
\r
    latestYear = int(gapFlow["year"].max())\r
    gapLatest = gapFlow[gapFlow["year"] == latestYear].copy()\r
    assert gapLatest["continent"].nunique() >= 5\r
    latestYear, gapLatest.shape\r
  exercise:\r
    prompt: 12단계. 다차원 산점도 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      gapFlow = loadLocalDataset("gapminder")\r
      requiredColumns = {"country", "continent", "year", "pop", "lifeExp", "gdpPercap"}\r
      missingColumns = requiredColumns - set(gapFlow.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert gapFlow[["pop", "lifeExp", "gdpPercap"]].gt(0).all().all()\r
\r
      latestYear = int(gapFlow["year"].max())\r
      gapLatest = gapFlow[gapFlow["year"] == latestYear].copy()\r
      assert gapLatest["continent"].nunique() >= 5\r
      latestYear, gapLatest.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 다차원 산점도 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 다차원 산점도 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};