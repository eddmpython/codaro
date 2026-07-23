var e=`meta:
  packages:
  - matplotlib
  - pandas
  - seaborn
  id: seaborn_07
  title: 세계기대수명분석
  order: 7
  category: seaborn
  difficulty: ⭐⭐⭐
  badge: 중급
  tags:
  - seaborn
  - relplot
  - scatterplot
  - gapminder
  - 다차원분석
  seo:
    title: Seaborn relplot - 세계 기대수명 다차원 분석
    description: Seaborn relplot으로 Gapminder 데이터의 GDP, 기대수명, 인구를 다차원으로 시각화합니다. col, size, style 파라미터 활용법을
      배웁니다.
    keywords:
    - seaborn
    - relplot
    - scatterplot
    - gapminder
    - 다차원분석
intro:
  emoji: 🌍
  goal: Gapminder 데이터로 대륙별 GDP와 기대수명의 관계를 다차원으로 분석합니다.
  description: Gapminder 데이터셋은 전 세계 국가들의 인구, GDP, 기대수명 정보를 담고 있습니다. relplot()을 활용하여 다차원 데이터를 시각화합니다. 이전에
    배운 heatmap, lineplot, barplot 개념을 함께 활용합니다.
  direction: 세계기대수명분석에서 정리된 데이터를 통계 차트로 보고 분포와 관계를 검증합니다.
  benefits:
  - 분석용 테이블 확인 후 통계 차트 구성에 맞는 코드 입력을 고릅니다.
  - 세계기대수명분석 결과를 분포, 그룹, 관계 패턴 기준으로 즉시 점검합니다.
  - 완료한 코드를 탐색 리포트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(분석용 테이블)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 필터링 처리 실행
      detail: 통계 차트 구성 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 기본 산점도 결과 검증
      detail: 분포, 그룹, 관계 패턴 기준으로 실행 결과를 비교합니다.
    - label: 세계기대수명분석 재사용
      detail: 완성 코드를 탐색 리포트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 통계 시각화 환경
      detail: matplotlib, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.
    - label: 세계기대수명분석 실행
      detail: 셀을 실행해 분포, 그룹, 관계 패턴와 예외 상태를 확인합니다.
    - label: 세계기대수명분석 완료
      detail: 검증된 코드를 탐색 리포트로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    seaborn과 matplotlib을 불러옵니다. Gapminder 데이터는 Hans Rosling 교수가 유명하게 만든 데이터로, 국가별 인구, GDP, 기대수명, 대륙 정보를 포함합니다.

    Gapminder 데이터는 Hans Rosling 교수가 유명하게 만든 데이터로, 국가별 인구(pop), 1인당 GDP(gdpPercap), 기대수명(lifeExp), 대륙(continent) 정보를 포함합니다.
  tips:
  - Gapminder 데이터는 Hans Rosling 교수가 유명하게 만든 데이터로, 국가별 인구(pop), 1인당 GDP(gdpPercap), 기대수명(lifeExp), 대륙(continent)
    정보를 포함합니다.
  snippet: |-
    import seaborn as sns
    from codaro.curriculum.localData import loadLocalDataset
    import matplotlib.pyplot as plt
    import pandas as pd

    gapminder = loadLocalDataset("gapminder")
    gapminder
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import seaborn as sns
      from codaro.curriculum.localData import loadLocalDataset
      import matplotlib.pyplot as plt
      import pandas as pd

      gapminder = loadLocalDataset("gapminder")
      gapminder
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 라이브러리 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step2_filter
  title: 2단계. 데이터 필터링
  structuredPrimary: true
  subtitle: 2007년 데이터
  goal: 2단계. 데이터 필터링에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 2007년 최신 데이터만 필터링합니다. 최신 데이터를 사용하면 현재 상황에 가까운 분석이 가능합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    gap2007 = gapminder[gapminder['year'] == 2007].copy()
    gap2007
  exercise:
    prompt: 2단계. 데이터 필터링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      gap2007 = gapminder[gapminder['year'] == 2007].copy()
      gap2007
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 2단계. 데이터 필터링에서 \`gap2007\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 2단계. 데이터 필터링 실행 뒤 \`gap2007\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step3_scatter_basic
  title: 3단계. 기본 산점도
  structuredPrimary: true
  subtitle: sns.scatterplot()
  goal: 3단계. 기본 산점도에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: GDP와 기대수명의 관계를 산점도로 확인합니다. 두 변수 간의 상관관계를 한눈에 파악할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figScatter, axScatter = plt.subplots(figsize=(10, 6))
    sns.scatterplot(data=gap2007, x='gdpPercap', y='lifeExp', ax=axScatter)
    axScatter.set_title('GDP vs Life Expectancy (2007)')
    figScatter
  exercise:
    prompt: 3단계. 기본 산점도 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figScatter, axScatter = plt.subplots(figsize=(10, 6))
      sns.scatterplot(data=gap2007, x='gdpPercap', y='lifeExp', ax=axScatter)
      axScatter.set_title('GDP vs Life Expectancy (2007)')
      figScatter
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 기본 산점도의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 3단계. 기본 산점도 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step4_scatter_hue
  title: 4단계. 대륙별 구분
  structuredPrimary: true
  subtitle: hue 파라미터
  goal: 4단계. 대륙별 구분에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 대륙별로 색상을 구분합니다. hue로 범주형 변수를 지정하면 그룹별 패턴을 비교할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figHue, axHue = plt.subplots(figsize=(10, 6))
    sns.scatterplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', palette='Set1', ax=axHue)
    axHue.set_title('GDP vs Life Expectancy by Continent')
    figHue
  exercise:
    prompt: 4단계. 대륙별 구분 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figHue, axHue = plt.subplots(figsize=(10, 6))
      sns.scatterplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', palette='Set1', ax=axHue)
      axHue.set_title('GDP vs Life Expectancy by Continent')
      figHue
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 4단계. 대륙별 구분의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 4단계. 대륙별 구분 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step5_scatter_size
  title: 5단계. 인구 크기 표현
  structuredPrimary: true
  subtitle: size 파라미터
  goal: 5단계. 인구 크기 표현에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    인구 크기를 점 크기로 표현합니다. 3개의 차원(GDP, 기대수명, 인구)을 동시에 시각화합니다.

    size 파라미터로 연속형 변수를 점 크기에 매핑합니다. sizes=(최소, 최대)로 크기 범위를 지정합니다. alpha는 투명도(0~1)로 겹치는 점을 구분하는 데 도움이 됩니다.
  snippet: |-
    figSize, axSize = plt.subplots(figsize=(12, 7))
    sns.scatterplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 1000), palette='Set1', alpha=0.7, ax=axSize)
    axSize.legend(bbox_to_anchor=(1.02, 1), loc='upper left')
    axSize.set_title('GDP vs Life Expectancy (Size = Population)')
    figSize
  exercise:
    prompt: 5단계. 인구 크기 표현 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figSize, axSize = plt.subplots(figsize=(12, 7))
      sns.scatterplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 1000), palette='Set1', alpha=0.7, ax=axSize)
      axSize.legend(bbox_to_anchor=(1.02, 1), loc='upper left')
      axSize.set_title('GDP vs Life Expectancy (Size = Population)')
      figSize
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 5단계. 인구 크기 표현의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 5단계. 인구 크기 표현 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step6_relplot_basic
  title: 6단계. relplot 기본
  structuredPrimary: true
  subtitle: Figure-level 함수
  goal: 6단계. relplot 기본에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    relplot()을 사용하여 Figure-level 산점도를 그립니다. relplot은 자체 Figure를 생성하며 다중 패널을 쉽게 만들 수 있습니다.

    relplot()은 Figure-level 함수로 자체 Figure를 생성합니다. height와 aspect로 크기를 조절합니다. Axes-level인 scatterplot()과 달리 ax 파라미터가 없고 col, row로 다중 패널을 만들 수 있습니다.
  tips:
  - relplot()은 Figure-level 함수로 자체 Figure를 생성합니다. height와 aspect로 크기를 조절합니다. Axes-level인 scatterplot()과
    달리 ax 파라미터가 없고 col, row로 다중 패널을 만들 수 있습니다.
  snippet: |-
    gRel = sns.relplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), palette='Set1', alpha=0.7, height=5, aspect=1.5)
    gRel.figure.suptitle('GDP vs Life Expectancy (relplot)', y=1.02)
    gRel.figure
  exercise:
    prompt: 6단계. relplot 기본 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      gRel = sns.relplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), palette='Set1', alpha=0.7, height=5, aspect=1.5)
      gRel.figure.suptitle('GDP vs Life Expectancy (relplot)', y=1.02)
      gRel.figure
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 6단계. relplot 기본의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 6단계. relplot 기본의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step7_relplot_col
  title: 7단계. 대륙별 패널
  structuredPrimary: true
  subtitle: col 파라미터
  goal: 7단계. 대륙별 패널에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    대륙별로 패널을 분리하여 비교합니다. col 파라미터로 범주별 패널을 생성합니다.

    col 파라미터로 범주별 패널을 생성합니다. col_wrap은 한 줄에 표시할 패널 수를 지정합니다. 각 패널이 독립적인 스케일을 가지므로 대륙별 패턴을 자세히 볼 수 있습니다.
  snippet: |-
    gCol = sns.relplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), col='continent', col_wrap=3, palette='Set1', alpha=0.7, height=4)
    gCol.figure.suptitle('GDP vs Life Expectancy by Continent', y=1.02)
    gCol.figure
  exercise:
    prompt: 7단계. 대륙별 패널 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      gCol = sns.relplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), col='continent', col_wrap=3, palette='Set1', alpha=0.7, height=4)
      gCol.figure.suptitle('GDP vs Life Expectancy by Continent', y=1.02)
      gCol.figure
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 7단계. 대륙별 패널의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 7단계. 대륙별 패널의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step8_relplot_line
  title: 8단계. 선 그래프
  structuredPrimary: true
  subtitle: kind='line'
  goal: 8단계. 선 그래프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    시간에 따른 변화를 선 그래프로 확인합니다. relplot에서 kind='line'으로 선 그래프를 그립니다.

    relplot()에서 kind='line'으로 선 그래프를 그립니다. marker='o'로 데이터 포인트를 표시합니다. kind 기본값은 'scatter'입니다.
  snippet: |-
    continentAvg = gapminder.groupby(['year', 'continent'])[['lifeExp', 'gdpPercap']].mean().reset_index()
    gLine = sns.relplot(data=continentAvg, x='year', y='lifeExp', hue='continent', kind='line', palette='Set1', height=5, aspect=1.5, marker='o')
    gLine.figure.suptitle('Life Expectancy Trend by Continent', y=1.02)
    gLine.figure
  exercise:
    prompt: 8단계. 선 그래프 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      continentAvg = gapminder.groupby(['year', 'continent'])[['lifeExp', 'gdpPercap']].mean().reset_index()
      gLine = sns.relplot(data=continentAvg, x='year', y='lifeExp', hue='continent', kind='line', palette='Set1', height=5, aspect=1.5, marker='o')
      gLine.figure.suptitle('Life Expectancy Trend by Continent', y=1.02)
      gLine.figure
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 8단계. 선 그래프의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 8단계. 선 그래프의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step9_style
  title: 9단계. 스타일 구분
  structuredPrimary: true
  subtitle: style 파라미터
  goal: 9단계. 스타일 구분에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    스타일로 추가 차원을 표현합니다. style 파라미터로 선 스타일이나 마커 모양을 구분합니다.

    style 파라미터로 선 스타일(실선, 점선 등)이나 마커 모양을 구분합니다. hue와 style에 같은 변수를 지정하면 색상과 스타일 모두로 구분되어 흑백 인쇄에서도 구분 가능합니다.
  snippet: |-
    gapAsia = gapminder[(gapminder['continent'] == 'Asia') & (gapminder['country'].isin(['Korea, Rep.', 'Japan', 'China', 'India']))].copy()
    gStyle = sns.relplot(data=gapAsia, x='year', y='lifeExp', hue='country', style='country', kind='line', markers=True, palette='Dark2', height=5, aspect=1.5)
    gStyle.figure.suptitle('Life Expectancy in Asian Countries', y=1.02)
    gStyle.figure
  exercise:
    prompt: 9단계. 스타일 구분 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      gapAsia = gapminder[(gapminder['continent'] == 'Asia') & (gapminder['country'].isin(['Korea, Rep.', 'Japan', 'China', 'India']))].copy()
      gStyle = sns.relplot(data=gapAsia, x='year', y='lifeExp', hue='country', style='country', kind='line', markers=True, palette='Dark2', height=5, aspect=1.5)
      gStyle.figure.suptitle('Life Expectancy in Asian Countries', y=1.02)
      gStyle.figure
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 9단계. 스타일 구분의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 9단계. 스타일 구분의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step10_col_year
  title: 10단계. 연도별 패널
  structuredPrimary: true
  subtitle: 시간 비교
  goal: 10단계. 연도별 패널에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: GDP와 기대수명 관계를 연도별 패널로 비교합니다. 시간에 따른 변화를 직관적으로 확인할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    gapDecade = gapminder[gapminder['year'].isin([1962, 1982, 2007])].copy()
    gYear = sns.relplot(data=gapDecade, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), col='year', palette='Set1', alpha=0.7, height=4)
    gYear.figure.suptitle('GDP vs Life Expectancy Over Decades', y=1.02)
    gYear.figure
  exercise:
    prompt: 10단계. 연도별 패널 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      gapDecade = gapminder[gapminder['year'].isin([1962, 1982, 2007])].copy()
      gYear = sns.relplot(data=gapDecade, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), col='year', palette='Set1', alpha=0.7, height=4)
      gYear.figure.suptitle('GDP vs Life Expectancy Over Decades', y=1.02)
      gYear.figure
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 10단계. 연도별 패널의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 10단계. 연도별 패널의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step11_log_scale
  title: 11단계. 로그 스케일
  structuredPrimary: true
  subtitle: xscale='log'
  goal: 11단계. 로그 스케일에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    x축을 로그 스케일로 변환하여 분포를 개선합니다. GDP처럼 넓은 범위의 데이터에 적합합니다.

    g.set()으로 축 속성을 일괄 설정합니다. xscale='log'는 로그 스케일로 변환하여 넓은 범위의 데이터를 효과적으로 표시합니다. GDP처럼 기하급수적으로 분포하는 데이터에 적합합니다.
  tips:
  - g.set()으로 축 속성을 일괄 설정합니다. xscale='log'는 로그 스케일로 변환하여 넓은 범위의 데이터를 효과적으로 표시합니다. GDP처럼 기하급수적으로 분포하는 데이터에
    적합합니다.
  snippet: |-
    gLog = sns.relplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), palette='Set1', alpha=0.7, height=5, aspect=1.5)
    gLog.set(xscale='log')
    gLog.figure.suptitle('GDP (Log Scale) vs Life Expectancy', y=1.02)
    gLog.figure
  exercise:
    prompt: 11단계. 로그 스케일 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      gLog = sns.relplot(data=gap2007, x='gdpPercap', y='lifeExp', hue='continent', size='pop', sizes=(20, 500), palette='Set1', alpha=0.7, height=5, aspect=1.5)
      gLog.set(xscale='log')
      gLog.figure.suptitle('GDP (Log Scale) vs Life Expectancy', y=1.02)
      gLog.figure
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 11단계. 로그 스케일의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 11단계. 로그 스케일의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 다차원 시각화
  goal: 실습에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    지금까지 배운 개념을 활용하여 미션을 수행해봅시다. 각 미션은 독립적으로 실행 가능합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import seaborn as sns
    from codaro.curriculum.localData import loadLocalDataset
    import matplotlib.pyplot as plt

    data = loadLocalDataset('penguins').dropna()
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import seaborn as sns
      from codaro.curriculum.localData import loadLocalDataset
      import matplotlib.pyplot as plt

      data = loadLocalDataset('penguins').dropna()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: workflow_validation
  title: 12단계. 다차원 산점도 검증 루프
  structuredPrimary: true
  subtitle: 예측 → 오류 수정 → 검증 → 실무 변주
  goal: 12단계. 다차원 산점도 검증 루프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    Gapminder 산점도는 GDP, 기대수명, 인구, 대륙을 한 번에 보여 줍니다. 로그 축을 쓰기 전 양수 조건을 확인하고, 최신 연도 기준으로 해석을 고정합니다.

    다차원 차트는 멋있지만, 로그 축과 size 의미가 데이터 조건을 만족해야 해석 가능한 보고서가 됩니다.
  snippet: |-
    from codaro.curriculum.localData import loadLocalDataset

    gapFlow = loadLocalDataset("gapminder")
    requiredColumns = {"country", "continent", "year", "pop", "lifeExp", "gdpPercap"}
    missingColumns = requiredColumns - set(gapFlow.columns)

    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"
    assert gapFlow[["pop", "lifeExp", "gdpPercap"]].gt(0).all().all()

    latestYear = int(gapFlow["year"].max())
    gapLatest = gapFlow[gapFlow["year"] == latestYear].copy()
    assert gapLatest["continent"].nunique() >= 5
    latestYear, gapLatest.shape
  exercise:
    prompt: 12단계. 다차원 산점도 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      from codaro.curriculum.localData import loadLocalDataset

      gapFlow = loadLocalDataset("gapminder")
      requiredColumns = {"country", "continent", "year", "pop", "lifeExp", "gdpPercap"}
      missingColumns = requiredColumns - set(gapFlow.columns)

      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"
      assert gapFlow[["pop", "lifeExp", "gdpPercap"]].gt(0).all().all()

      latestYear = int(gapFlow["year"].max())
      gapLatest = gapFlow[gapFlow["year"] == latestYear].copy()
      assert gapLatest["continent"].nunique() >= 5
      latestYear, gapLatest.shape
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 12단계. 다차원 산점도 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 12단계. 다차원 산점도 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
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
  - id: seaborn_07-life-expectancy-facets-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: 세계 기대수명 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 국가·대륙의 계층과 시간 변화가 섞이지 않았는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_life_expectancy_facets(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_life_expectancy_facets(rows):
            raise NotImplementedError
      solution: |
        def prepare_life_expectancy_facets(rows):
            required = ['year', 'lifeExpectancy', 'continent']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'continent'
            for row in usable:
                key = "all" if group_field is None else str(row[group_field])
                groups[key] = groups.get(key, 0) + 1
            x_values = [row['year'] for row in usable]
            y_values = [row['lifeExpectancy'] for row in usable]
            return {
                "usableCount": len(usable),
                "excludedCount": len(rows) - len(usable),
                "groupCounts": {key: groups[key] for key in sorted(groups)},
                "xExtent": None if not x_values else [min(x_values), max(x_values)],
                "yExtent": None if not y_values else [min(y_values), max(y_values)],
            }
      hints: *id001
    check:
      id: python.seaborn.seaborn_07.life-expectancy-facets-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.seaborn.seaborn_07.life-expectancy-facets-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_life_expectancy_facets
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - year: 2000
              lifeExpectancy: 70
              continent: Asia
            - year: 2010
              lifeExpectancy: 74
              continent: Asia
            - year: 2000
              lifeExpectancy: 76
              continent: Europe
          expectedReturn:
            usableCount: 3
            excludedCount: 0
            groupCounts:
              Asia: 2
              Europe: 1
            xExtent:
            - 2000
            - 2010
            yExtent:
            - 70
            - 76
        - id: handles-empty-data
          arguments:
          - value: []
          expectedReturn:
            usableCount: 0
            excludedCount: 0
            groupCounts: {}
            xExtent: null
            yExtent: null
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: seaborn_07-life-expectancy-facets-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - seaborn_07-life-expectancy-facets-data-evidence-mastery
    title: 세계 기대수명 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 지역별 서비스 가용성의 장기 추세를 region facet과 동일 y scale로 비교한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_life_expectancy_facets(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_life_expectancy_facets(candidate):
            raise NotImplementedError
      solution: |
        def audit_life_expectancy_facets(candidate):
            expected = {'mark': 'faceted-line', 'x': 'year', 'y': 'lifeExpectancy', 'group': 'continent', 'transforms': ['country-aggregate', 'facet-continent'], 'interaction': 'none'}
            errors = []
            for name in ["mark", "x", "y", "group", "transforms", "interaction"]:
                actual = sorted(candidate.get(name, [])) if name == "transforms" else candidate.get(name)
                if actual != expected[name]:
                    errors.append(name)
            if not str(candidate.get("description", "")).strip():
                errors.append("description")
            return {"valid": not errors, "errors": errors, "encoding": expected}
      hints: *id002
    check:
      id: python.seaborn.seaborn_07.life-expectancy-facets-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.seaborn.seaborn_07.life-expectancy-facets-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_life_expectancy_facets
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: faceted-line
              x: year
              y: lifeExpectancy
              group: continent
              transforms:
              - country-aggregate
              - facet-continent
              interaction: none
              description: 지역별 서비스 가용성의 장기 추세를 region facet과 동일 y scale로 비교한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: faceted-line
              x: year
              y: lifeExpectancy
              group: continent
              transforms:
              - country-aggregate
              - facet-continent
              interaction: none
        - id: reports-misleading-encoding
          arguments:
          - value:
              mark: table
              x: lifeExpectancy
              y: year
              group: null
              transforms: []
              interaction: none
              description: ''
          expectedReturn:
            valid: false
            errors:
            - mark
            - x
            - y
            - group
            - transforms
            - description
            encoding:
              mark: faceted-line
              x: year
              y: lifeExpectancy
              group: continent
              transforms:
              - country-aggregate
              - facet-continent
              interaction: none
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: seaborn_07-life-expectancy-facets-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - seaborn_07-life-expectancy-facets-encoding-transfer-transfer
    title: 세계 기대수명 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 국가·대륙의 계층과 시간 변화가 섞이지 않았는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_life_expectancy_facets(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_life_expectancy_facets(situation):
            raise NotImplementedError
      solution: |
        def choose_life_expectancy_facets(situation):
            table = {'continent-trends': {'encoding': 'faceted lines', 'evidence': 'shared y scale', 'risk': 'country weighting'}, 'country-ranking': {'encoding': 'year-filtered dots', 'evidence': 'same year', 'risk': 'mixed periods'}, 'global-average': {'encoding': 'weighted line', 'evidence': 'population weights', 'risk': 'unweighted countries'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.seaborn.seaborn_07.life-expectancy-facets-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.seaborn.seaborn_07.life-expectancy-facets-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_life_expectancy_facets
        cases:
        - id: recalls-continent-trends
          arguments:
          - value: continent-trends
          expectedReturn:
            encoding: faceted lines
            evidence: shared y scale
            risk: country weighting
        - id: recalls-country-ranking
          arguments:
          - value: country-ranking
          expectedReturn:
            encoding: year-filtered dots
            evidence: same year
            risk: mixed periods
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};