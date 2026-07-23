var e=`meta:\r
  packages:\r
  - pandas\r
  - plotly\r
  id: plotly_10\r
  title: 종합대시보드\r
  order: 10\r
  category: plotly\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - gapminder\r
  - 대시보드\r
  - make_subplots\r
  - 애니메이션\r
  - 종합\r
  seo:\r
    title: Plotly 종합 대시보드 - gapminder 완전 분석\r
    description: gapminder 데이터로 모든 Plotly 개념을 종합한 대시보드를 만듭니다. 기본 차트부터 애니메이션까지 총정리합니다.\r
    keywords:\r
    - plotly 대시보드\r
    - gapminder\r
    - make_subplots\r
    - 종합 분석\r
    - 데이터 시각화\r
intro:\r
  emoji: 🌍\r
  goal: gapminder 데이터로 "세계 발전 종합 대시보드"를 완성합니다.\r
  description: 막대/선/산점도 기본 차트, 버블/히트맵 고급 차트, 트리맵/선버스트 계층 차트, 애니메이션까지 모든 개념을 종합합니다.\r
  direction: 종합대시보드에서 데이터를 상호작용 차트로 구성하고 필터와 표시 상태를 검증합니다.\r
  benefits:\r
  - 대시보드 데이터 확인 후 인터랙티브 시각화에 맞는 코드 입력을 고릅니다.\r
  - 종합대시보드 결과를 툴팁과 선택 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 공유 대시보드에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(대시보드 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 대륙별 평균 기대수명 처리 실행\r
      detail: 인터랙티브 시각화 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 대륙별 기대수명 변화 결과 검증\r
      detail: 툴팁과 선택 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 종합대시보드 재사용\r
      detail: 완성 코드를 공유 대시보드에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 인터랙티브 차트 환경\r
      detail: pandas, plotly, statsmodels 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합대시보드 실행\r
      detail: 셀을 실행해 툴팁과 선택 상태와 예외 상태를 확인합니다.\r
    - label: 종합대시보드 완료\r
      detail: 검증된 코드를 공유 대시보드로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: px.data.gapminder()\r
  goal: 1단계. 데이터 불러오기에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: gapminder는 1952~2007년 142개국의 인구, GDP, 기대수명 데이터로, Plotly의 모든 개념을 종합 실습하기에 이상적입니다. 총 1704행(142개국\r
    × 12개 시점)의 데이터는 대륙(continent), 국가(country), 연도(year), 인구(pop), 기대수명(lifeExp), 1인당 GDP(gdpPercap) 컬럼을\r
    포함하며, 범주형·수치형·시계열 데이터가 모두 있어 막대, 선, 산점도, 히스토그램, 박스, 파이, 버블, 히트맵, 트리맵, 선버스트, 지도, 애니메이션 등 모든 차트 타입을\r
    연습할 수 있습니다. df2007 = gapminder[gapminder['year'] == 2007]로 2007년 최신 데이터만 추출하여 현재 시점 분석에 사용하며, 실무에서는\r
    이처럼 전체 데이터와 필터링된 서브셋을 함께 활용하여 다각도 분석을 수행합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import plotly.express as px\r
    import plotly.graph_objects as go\r
    from plotly.subplots import make_subplots\r
    import pandas as pd\r
\r
    gapminder = px.data.gapminder()\r
    df2007 = gapminder[gapminder['year'] == 2007]\r
    gapminder\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      import plotly.graph_objects as go\r
      from plotly.subplots import make_subplots\r
      import pandas as pd\r
\r
      gapminder = px.data.gapminder()\r
      df2007 = gapminder[gapminder['year'] == 2007]\r
      gapminder\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기에서 \`gapminder\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step2_bar\r
  title: 2단계. 대륙별 평균 기대수명\r
  structuredPrimary: true\r
  subtitle: px.bar (A3 반복)\r
  goal: 2단계. 대륙별 평균 기대수명에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 막대 그래프로 2007년 대륙별 평균 기대수명을 비교합니다. groupby('continent')로 대륙별로 그룹화하고 lifeExp의 평균을 계산하여 142개\r
    국가 데이터를 5개 대륙 요약으로 압축하며, as_index=False로 continent를 일반 컬럼으로 유지하여 px.bar에서 사용하기 쉽게 만듭니다. color='continent'는\r
    각 대륙에 고유 색상을 할당하여 시각적 구분을 명확히 하고, showlegend=False는 x축에 이미 대륙명이 있어 범례가 중복되므로 제거합니다. 막대 그래프는 범주 간 수치를\r
    비교할 때 가장 직관적이며, 실무에서는 부서별 매출, 제품별 판매량, 지역별 고객 수 등을 비교하는 기본 차트로 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lifeByContinent = df2007.groupby('continent', as_index=False)['lifeExp'].mean()\r
    figBar = px.bar(\r
        lifeByContinent,\r
        x='continent',\r
        y='lifeExp',\r
        color='continent',\r
        title='2007년 대륙별 평균 기대수명'\r
    )\r
    figBar.update_layout(showlegend=False)\r
    figBar\r
  exercise:\r
    prompt: 2단계. 대륙별 평균 기대수명 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      lifeByContinent = df2007.groupby('continent', as_index=False)['lifeExp'].mean()\r
      figBar = px.bar(\r
          lifeByContinent,\r
          x='continent',\r
          y='lifeExp',\r
          color='continent',\r
          title='2007년 대륙별 평균 기대수명'\r
      )\r
      figBar.update_layout(showlegend=False)\r
      figBar\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 대륙별 평균 기대수명의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 대륙별 평균 기대수명의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step3_line\r
  title: 3단계. 대륙별 기대수명 변화\r
  structuredPrimary: true\r
  subtitle: px.line (A2 반복)\r
  goal: 3단계. 대륙별 기대수명 변화에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 선 그래프로 1952~2007년 대륙별 기대수명 변화 추이를 시각화합니다. groupby(['year', 'continent'])는 연도와 대륙 두 차원으로\r
    그룹화하여 각 연도·대륙 조합의 평균을 계산하며, 이를 통해 55년간의 장기 추세를 파악할 수 있습니다. color='continent'는 각 대륙을 다른 색상의 선으로 구분하여\r
    5개 대륙의 변화를 한 차트에서 비교하며, 선 그래프는 시계열 데이터의 추세, 계절성, 전환점을 발견하는 데 최적입니다. 이 차트를 통해 전 세계 기대수명이 지속적으로 증가했는지,\r
    어느 대륙이 가장 빠르게 개선되었는지, 정체 구간은 없었는지 등을 분석할 수 있으며, 실무에서는 매출 추이, 사용자 증가율, KPI 변화 등 모든 시계열 분석의 기본으로 사용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lifeByYear = gapminder.groupby(['year', 'continent'], as_index=False)['lifeExp'].mean()\r
    figLine = px.line(\r
        lifeByYear,\r
        x='year',\r
        y='lifeExp',\r
        color='continent',\r
        title='대륙별 기대수명 변화 (1952-2007)'\r
    )\r
    figLine\r
  exercise:\r
    prompt: 3단계. 대륙별 기대수명 변화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      lifeByYear = gapminder.groupby(['year', 'continent'], as_index=False)['lifeExp'].mean()\r
      figLine = px.line(\r
          lifeByYear,\r
          x='year',\r
          y='lifeExp',\r
          color='continent',\r
          title='대륙별 기대수명 변화 (1952-2007)'\r
      )\r
      figLine\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 대륙별 기대수명 변화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 대륙별 기대수명 변화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_scatter\r
  title: 4단계. GDP와 기대수명 산점도\r
  structuredPrimary: true\r
  subtitle: px.scatter (A1 반복)\r
  goal: 4단계. GDP와 기대수명 산점도에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 산점도로 GDP와 기대수명의 관계를 확인하고, 추세선으로 상관관계를 정량화합니다. log_x=True는 GDP가 넓은 범위(수백~수만 달러)에 분포하므로 로그\r
    스케일로 변환하여 저소득 국가들의 차이도 명확히 보이도록 하며, trendline='ols'는 최소자승법(Ordinary Least Squares) 회귀선을 자동으로 그려 GDP와\r
    기대수명 간 선형 관계를 보여줍니다. color='continent'는 대륙별로 색상을 구분하여 지역별 패턴 차이를 파악할 수 있게 합니다. 이 차트를 통해 "부유한 국가일수록\r
    기대수명이 높다"는 일반적 경향을 확인할 수 있지만, 같은 GDP 수준에서도 대륙별로 기대수명 차이가 있는지, 이상치(outlier)는 어디인지도 발견할 수 있으며, 실무에서는\r
    두 변수 간 관계를 탐색하고 가설을 검증하는 데 산점도와 추세선을 필수적으로 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figScatter = px.scatter(\r
        df2007,\r
        x='gdpPercap',\r
        y='lifeExp',\r
        color='continent',\r
        trendline='ols',\r
        log_x=True,\r
        title='GDP와 기대수명 관계'\r
    )\r
    figScatter\r
  exercise:\r
    prompt: 4단계. GDP와 기대수명 산점도 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figScatter = px.scatter(\r
          df2007,\r
          x='gdpPercap',\r
          y='lifeExp',\r
          color='continent',\r
          trendline='ols',\r
          log_x=True,\r
          title='GDP와 기대수명 관계'\r
      )\r
      figScatter\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. GDP와 기대수명 산점도의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 4단계. GDP와 기대수명 산점도의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step5_histogram\r
  title: 5단계. 기대수명 분포\r
  structuredPrimary: true\r
  subtitle: px.histogram (A4 반복)\r
  goal: 5단계. 기대수명 분포에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 히스토그램으로 전 세계 기대수명의 분포를 확인하여 중심 경향과 분산을 파악합니다. nbins=20은 x축을 20개 구간(bin)으로 나누어 각 구간에 속하는\r
    국가 수를 막대 높이로 표현하며, 구간이 너무 적으면(5개 이하) 분포의 디테일이 사라지고 너무 많으면(50개 이상) 노이즈가 생기므로 10~30개가 적당합니다. color='continent'는\r
    각 막대를 대륙별로 색상 구분하여 쌓기(stack) 형태로 표현하며, 이를 통해 "기대수명 60~70세 구간에 아프리카 국가가 많다" 같은 세부 인사이트를 발견할 수 있습니다.\r
    히스토그램은 평균·중앙값만으로는 알 수 없는 분포의 형태(정규분포인지, 왜도가 있는지, 봉우리가 여러 개인지)를 보여주며, 실무에서는 고객 연령 분포, 주문 금액 분포, 응답\r
    시간 분포 등을 분석할 때 필수적으로 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figHist = px.histogram(\r
        df2007,\r
        x='lifeExp',\r
        color='continent',\r
        nbins=20,\r
        title='2007년 기대수명 분포'\r
    )\r
    figHist\r
  exercise:\r
    prompt: 5단계. 기대수명 분포 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHist = px.histogram(\r
          df2007,\r
          x='lifeExp',\r
          color='continent',\r
          nbins=20,\r
          title='2007년 기대수명 분포'\r
      )\r
      figHist\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 기대수명 분포의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 기대수명 분포의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_box_violin\r
  title: 6단계. 분포 비교\r
  structuredPrimary: true\r
  subtitle: px.box, px.violin (A5, A6 반복)\r
  goal: 6단계. 분포 비교에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 박스 플롯과 바이올린 플롯으로 대륙별 기대수명 분포를 비교하여 그룹 간 차이를 정밀 분석합니다. 박스 플롯은 중앙값(상자 내 선), 사분위수(상자 경계),\r
    이상치(점)를 명확히 보여주어 통계적 비교에 강하고, 바이올린 플롯은 박스 플롯에 분포의 형태(밀도)를 추가하여 데이터가 어디에 밀집되어 있는지까지 시각화합니다. box=True는\r
    바이올린 내부에 박스 플롯을 함께 표시하고, points='all'은 모든 원본 데이터 포인트를 점으로 추가하여 극단값과 분포를 동시에 확인할 수 있게 합니다. 이를 통해 "아시아는\r
    기대수명 편차가 크다", "유럽은 중앙값이 높고 일정하다" 같은 대륙별 특성을 발견할 수 있으며, 실무에서는 A/B 테스트 결과 비교, 제품별 만족도 분석, 팀별 성과 비교 등에\r
    박스·바이올린 플롯을 활용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figBox = px.box(\r
        df2007,\r
        x='continent',\r
        y='lifeExp',\r
        color='continent',\r
        title='대륙별 기대수명 분포'\r
    )\r
    figBox\r
  exercise:\r
    prompt: 6단계. 분포 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBox = px.box(\r
          df2007,\r
          x='continent',\r
          y='lifeExp',\r
          color='continent',\r
          title='대륙별 기대수명 분포'\r
      )\r
      figBox\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 분포 비교의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 분포 비교의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step7_pie\r
  title: 7단계. 인구 비율\r
  structuredPrimary: true\r
  subtitle: px.pie (A7 반복)\r
  goal: 7단계. 인구 비율에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 파이 차트로 대륙별 인구 비율을 확인하여 전체에서 각 대륙이 차지하는 비중을 직관적으로 파악합니다. groupby('continent')['pop'].sum()으로\r
    각 대륙의 총 인구를 계산하고, values='pop'에 인구, names='continent'에 대륙명을 지정하면 Plotly가 자동으로 각 조각의 각도를 비율에 맞춰 계산하여\r
    원형 차트를 그려줍니다. 파이 차트는 "아시아가 전 세계 인구의 60%를 차지한다" 같은 비율 정보를 한눈에 전달하는 데 탁월하지만, 항목 수가 5~7개 이하일 때 가장 효과적이며,\r
    너무 많으면 조각이 작아져 구분이 어렵습니다. 실무에서는 시장 점유율, 예산 배분, 트래픽 소스 비율 등을 표현할 때 파이 차트를 사용하며, 절대값이 아닌 비율 비교가 핵심일\r
    때 선택합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    popByContinent = df2007.groupby('continent', as_index=False)['pop'].sum()\r
    figPie = px.pie(\r
        popByContinent,\r
        values='pop',\r
        names='continent',\r
        title='2007년 대륙별 인구 비율'\r
    )\r
    figPie\r
  exercise:\r
    prompt: 7단계. 인구 비율 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      popByContinent = df2007.groupby('continent', as_index=False)['pop'].sum()\r
      figPie = px.pie(\r
          popByContinent,\r
          values='pop',\r
          names='continent',\r
          title='2007년 대륙별 인구 비율'\r
      )\r
      figPie\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 인구 비율의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 인구 비율의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_bubble\r
  title: 8단계. 버블차트\r
  structuredPrimary: true\r
  subtitle: size로 인구 표현 (B1 반복)\r
  goal: 8단계. 버블차트에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 버블차트로 GDP, 기대수명, 인구 세 가지 변수를 한 차트에 표현하여 다차원 분석을 수행합니다. x축은 GDP, y축은 기대수명, 버블 크기(size='pop')는\r
    인구, 색상(color='continent')은 대륙을 나타내어 4차원 정보를 동시에 시각화하며, hover_name='country'는 마우스 오버 시 국가명을 표시합니다.\r
    log_x=True로 GDP를 로그 스케일로 변환하고, size_max=60으로 최대 버블 크기를 제한하여 거대 인구 국가(중국, 인도)가 화면을 지배하지 않도록 조정합니다.\r
    이 차트를 통해 "인구가 많고 GDP가 높지만 기대수명은 중간인 국가"처럼 복잡한 패턴을 발견할 수 있으며, 실무에서는 3개 이상의 지표를 동시에 비교할 때 버블차트를 활용하여\r
    숨겨진 인사이트를 찾아냅니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figBubble = px.scatter(\r
        df2007,\r
        x='gdpPercap',\r
        y='lifeExp',\r
        size='pop',\r
        color='continent',\r
        hover_name='country',\r
        log_x=True,\r
        size_max=60,\r
        title='2007년 세계 발전 현황'\r
    )\r
    figBubble\r
  exercise:\r
    prompt: 8단계. 버블차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figBubble = px.scatter(\r
          df2007,\r
          x='gdpPercap',\r
          y='lifeExp',\r
          size='pop',\r
          color='continent',\r
          hover_name='country',\r
          log_x=True,\r
          size_max=60,\r
          title='2007년 세계 발전 현황'\r
      )\r
      figBubble\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 버블차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 버블차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_heatmap\r
  title: 9단계. 밀도 히트맵\r
  structuredPrimary: true\r
  subtitle: px.density_heatmap (B2 반복)\r
  goal: 9단계. 밀도 히트맵에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 밀도 히트맵으로 GDP와 기대수명의 밀집 구간을 확인하여 데이터가 어디에 집중되어 있는지 파악합니다. px.density_heatmap은 x, y 축을 격자로\r
    나누고 각 셀에 속하는 데이터 개수를 색상 진하기로 표현하며, 산점도처럼 점이 많을 때 겹침(overplotting) 문제를 해결합니다. nbinsx=20, nbinsy=20은\r
    각 축을 20개 구간으로 나누어 총 400개 셀을 생성하고, color_continuous_scale='Viridis'는 색맹 친화적인 보라-노랑 팔레트를 적용합니다. 색이 진한\r
    영역이 데이터가 밀집된 곳이며, 이를 통해 "대부분의 국가가 GDP 1000~10000달러, 기대수명 60~75세 구간에 몰려있다" 같은 분포 패턴을 발견할 수 있습니다. 실무에서는\r
    수만 건 이상의 대용량 데이터를 시각화할 때 산점도 대신 밀도 히트맵을 사용하여 성능과 가독성을 동시에 확보합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figHeatmap = px.density_heatmap(\r
        df2007,\r
        x='gdpPercap',\r
        y='lifeExp',\r
        nbinsx=20,\r
        nbinsy=20,\r
        color_continuous_scale='Viridis',\r
        title='GDP-기대수명 밀도 분포'\r
    )\r
    figHeatmap\r
  exercise:\r
    prompt: 9단계. 밀도 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHeatmap = px.density_heatmap(\r
          df2007,\r
          x='gdpPercap',\r
          y='lifeExp',\r
          nbinsx=20,\r
          nbinsy=20,\r
          color_continuous_scale='Viridis',\r
          title='GDP-기대수명 밀도 분포'\r
      )\r
      figHeatmap\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 밀도 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 밀도 히트맵의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_treemap\r
  title: 10단계. 트리맵\r
  structuredPrimary: true\r
  subtitle: px.treemap (B3 반복)\r
  goal: 10단계. 트리맵에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 트리맵으로 대륙 > 국가 계층 구조를 인구 크기로 표현하여 전체와 부분의 관계를 직관적으로 파악합니다. path=['continent', 'country']는\r
    2단계 계층을 정의하고, values='pop'은 각 사각형의 크기를 인구에 비례하여 결정하며, color='lifeExp'는 기대수명을 RdYlGn 색상 팔레트로 표현합니다.\r
    트리맵은 공간을 재귀적으로 분할하여 모든 항목을 빈틈없이 배치하므로 파이 차트보다 공간 효율이 높고, 대륙을 클릭하면 하위 국가들이 확대되는 드릴다운 기능으로 세부 탐색이 가능합니다.\r
    이를 통해 "아시아 인구가 압도적으로 많지만, 그중 인도와 중국이 대부분을 차지한다"처럼 계층 내 구성을 명확히 이해할 수 있으며, 실무에서는 조직도, 예산 배분, 제품 카테고리\r
    매출, 디스크 사용량 등 계층 데이터를 시각화할 때 필수적으로 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figTreemap = px.treemap(\r
        df2007,\r
        path=['continent', 'country'],\r
        values='pop',\r
        color='lifeExp',\r
        color_continuous_scale='RdYlGn',\r
        title='세계 인구 트리맵 (색상: 기대수명)'\r
    )\r
    figTreemap\r
  exercise:\r
    prompt: 10단계. 트리맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figTreemap = px.treemap(\r
          df2007,\r
          path=['continent', 'country'],\r
          values='pop',\r
          color='lifeExp',\r
          color_continuous_scale='RdYlGn',\r
          title='세계 인구 트리맵 (색상: 기대수명)'\r
      )\r
      figTreemap\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 트리맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 트리맵의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step11_sunburst\r
  title: 11단계. 선버스트\r
  structuredPrimary: true\r
  subtitle: px.sunburst (B4 반복)\r
  goal: 11단계. 선버스트에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 선버스트로 같은 계층 구조를 원형으로 표현하여 트리맵과 다른 시각적 경험을 제공합니다. 선버스트는 중앙에서 바깥으로 펼쳐지는 동심원 형태로, 안쪽이 상위 계층(대륙),\r
    바깥쪽이 하위 계층(국가)을 나타내며, 각 조각의 각도는 값(인구)에 비례합니다. 트리맵과 동일하게 path, values, color를 지정하지만, 원형 구조가 시각적으로 더\r
    균형잡혀 보이고 프레젠테이션 효과가 뛰어나 경영진 보고나 인포그래픽에서 선호됩니다. 조각을 클릭하면 해당 계층이 확대되어 세부 정보를 탐색할 수 있으며, 계층 깊이에 제한이 없어\r
    3단계 이상의 복잡한 구조도 표현 가능합니다. 실무에서는 트리맵은 분석 작업에, 선버스트는 시각적 임팩트가 중요한 발표 자료에 사용하는 경향이 있으며, 데이터 성격과 청중에 따라\r
    선택합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figSunburst = px.sunburst(\r
        df2007,\r
        path=['continent', 'country'],\r
        values='pop',\r
        color='lifeExp',\r
        color_continuous_scale='RdYlGn',\r
        title='세계 인구 선버스트 (색상: 기대수명)'\r
    )\r
    figSunburst\r
  exercise:\r
    prompt: 11단계. 선버스트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figSunburst = px.sunburst(\r
          df2007,\r
          path=['continent', 'country'],\r
          values='pop',\r
          color='lifeExp',\r
          color_continuous_scale='RdYlGn',\r
          title='세계 인구 선버스트 (색상: 기대수명)'\r
      )\r
      figSunburst\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 선버스트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 선버스트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step12_choropleth\r
  title: 12단계. 세계지도\r
  structuredPrimary: true\r
  subtitle: px.choropleth (B6 반복)\r
  goal: 12단계. 세계지도에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: '단계구분도(choropleth)로 국가별 기대수명을 세계지도에 표현하여 지리적 패턴을 시각화합니다. locations=''iso_alpha''는 국가를 식별하는\r
    ISO 3166-1 alpha-3 코드(예: KOR, USA, JPN)를 지정하고, color=''lifeExp''는 각 국가의 색상을 기대수명에 따라 결정하며, color_continuous_scale=''RdYlGn''은\r
    낮으면 빨강, 높으면 초록으로 표현합니다. hover_name=''country''는 마우스 오버 시 국가명을 표시하고, update_layout(geo=dict(showframe=False))로\r
    지도 외곽 프레임을 제거하여 깔끔하게 만듭니다. 지도 시각화는 지역별 클러스터링(아프리카는 전반적으로 낮음, 유럽·북미는 높음)과 인접 국가 간 차이를 직관적으로 파악할 수 있게\r
    하며, 실무에서는 지역별 매출, 고객 분포, 물류 거점, 질병 확산 등 공간 데이터를 분석할 때 필수적으로 사용합니다.'\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figMap = px.choropleth(\r
        df2007,\r
        locations='iso_alpha',\r
        color='lifeExp',\r
        hover_name='country',\r
        color_continuous_scale='RdYlGn',\r
        title='2007년 세계 기대수명 지도'\r
    )\r
    figMap.update_layout(geo=dict(showframe=False))\r
    figMap\r
  exercise:\r
    prompt: 12단계. 세계지도 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figMap = px.choropleth(\r
          df2007,\r
          locations='iso_alpha',\r
          color='lifeExp',\r
          hover_name='country',\r
          color_continuous_scale='RdYlGn',\r
          title='2007년 세계 기대수명 지도'\r
      )\r
      figMap.update_layout(geo=dict(showframe=False))\r
      figMap\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 세계지도의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 12단계. 세계지도의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step13_animation\r
  title: 13단계. 애니메이션\r
  structuredPrimary: true\r
  subtitle: animation_frame (B9 반복)\r
  goal: 13단계. 애니메이션에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: animation_frame으로 1952~2007년 세계 발전 변화를 애니메이션으로 표현하여 시간에 따른 동적 변화를 시각화합니다. animation_frame='year'는\r
    연도별로 프레임을 생성하여 재생 버튼을 누르면 1952년부터 2007년까지 자동으로 넘어가며, animation_group='country'는 각 국가가 시간에 따라 이동하는\r
    경로를 추적하여 버블이 부드럽게 움직입니다. range_x=[100, 100000], range_y=[25, 90]으로 축 범위를 고정하면 프레임 전환 시 축이 자동 조정되지\r
    않아 국가 간 상대적 위치 변화를 명확히 볼 수 있습니다. 이 유명한 "Gapminder 애니메이션"은 한스 로슬링이 TED 강연에서 사용하여 세계적으로 유명해졌으며, "시간에\r
    따라 전 세계가 더 부유하고 건강해졌다"는 인사이트를 극적으로 전달합니다. 실무에서는 시계열 변화를 프레젠테이션할 때 애니메이션을 활용하여 청중의 주목을 끌고 스토리텔링 효과를\r
    극대화합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figAnim = px.scatter(\r
        gapminder,\r
        x='gdpPercap',\r
        y='lifeExp',\r
        size='pop',\r
        color='continent',\r
        hover_name='country',\r
        animation_frame='year',\r
        animation_group='country',\r
        log_x=True,\r
        size_max=60,\r
        range_x=[100, 100000],\r
        range_y=[25, 90],\r
        title='세계 발전 변화 (1952-2007)'\r
    )\r
    figAnim\r
  exercise:\r
    prompt: 13단계. 애니메이션 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figAnim = px.scatter(\r
          gapminder,\r
          x='gdpPercap',\r
          y='lifeExp',\r
          size='pop',\r
          color='continent',\r
          hover_name='country',\r
          animation_frame='year',\r
          animation_group='country',\r
          log_x=True,\r
          size_max=60,\r
          range_x=[100, 100000],\r
          range_y=[25, 90],\r
          title='세계 발전 변화 (1952-2007)'\r
      )\r
      figAnim\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 애니메이션의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 13단계. 애니메이션의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step14_facet\r
  title: 14단계. 패싯 차트\r
  structuredPrimary: true\r
  subtitle: facet_col (C6 반복)\r
  goal: 14단계. 패싯 차트에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: facet_col로 대륙별 GDP-기대수명 관계를 분리하여 그룹별 패턴 차이를 비교합니다. facet_col='continent'는 각 대륙을 별도의 패널로\r
    나누어 가로로 배치하고, 각 패널 내에서 해당 대륙 국가들만의 산점도를 그리며, trendline='ols'로 대륙별 추세선을 추가하여 상관관계 강도를 비교할 수 있습니다. showlegend=False는\r
    각 패널 제목에 대륙명이 있어 범례가 중복되므로 제거합니다. 이를 통해 "아프리카는 GDP와 기대수명 상관관계가 약하지만, 유럽은 강하다" 같은 그룹별 차이를 발견할 수 있으며,\r
    하나의 차트에 모든 데이터를 표시하면 겹쳐서 보기 어려운 패턴을 패싯으로 분리하여 명확히 파악할 수 있습니다. 실무에서는 제품별, 지역별, 세그먼트별로 동일한 분석을 반복할 때\r
    패싯을 활용하여 효율적으로 비교 분석을 수행합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figFacet = px.scatter(\r
        df2007,\r
        x='gdpPercap',\r
        y='lifeExp',\r
        color='continent',\r
        facet_col='continent',\r
        log_x=True,\r
        trendline='ols',\r
        title='대륙별 GDP-기대수명 관계'\r
    )\r
    figFacet.update_layout(showlegend=False)\r
    figFacet\r
  exercise:\r
    prompt: 14단계. 패싯 차트 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figFacet = px.scatter(\r
          df2007,\r
          x='gdpPercap',\r
          y='lifeExp',\r
          color='continent',\r
          facet_col='continent',\r
          log_x=True,\r
          trendline='ols',\r
          title='대륙별 GDP-기대수명 관계'\r
      )\r
      figFacet.update_layout(showlegend=False)\r
      figFacet\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 패싯 차트의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 14단계. 패싯 차트의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step15_dashboard\r
  title: 15단계. 종합 대시보드\r
  structuredPrimary: true\r
  subtitle: make_subplots + 스타일링 (C8, C11, C12 반복)\r
  goal: 15단계. 종합 대시보드에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: '지금까지 배운 모든 개념을 하나로 합쳐 완성도 높은 종합 대시보드를 만듭니다. make_subplots로 3행 2열 격자를 만들고, 6가지 차트를 배치합니다.\r
    specs 파라미터로 각 셀의 타입을 지정하며, 파이 차트는 {''type'': ''pie''}로 명시합니다. go.Bar, go.Pie, go.Scatter, go.Box,\r
    go.Histogram2d를 사용하여 막대, 파이, 선, 산점도, 박스, 히트맵을 한 화면에 배치합니다. update_xaxes(type=''log'')로 특정 축만 로그 스케일로\r
    변경하고, update_layout으로 제목, 배경색, 폰트, 여백을 전문적으로 설정합니다. plot_bgcolor=''white''는 차트 영역, paper_bgcolor=''#f8f9fa''는\r
    전체 배경을 의미합니다. showgrid=True로 격자선을 추가하면 값 읽기가 쉬워집니다. 이 대시보드는 막대(대륙별 평균), 파이(인구 비율), 선(추이), 산점도(관계),\r
    박스(분포), 히트맵(밀도) 6가지 관점에서 gapminder 데이터를 분석하며, 실무에서는 경영진에게 A4 한 장 분량의 executive summary로 제공하여 핵심 인사이트를\r
    효과적으로 전달합니다.'\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    finalDashboard = make_subplots(\r
        rows=3, cols=2,\r
        subplot_titles=[\r
            '대륙별 평균 기대수명',\r
            '대륙별 인구 비율',\r
            '기대수명 변화 추이',\r
            'GDP vs 기대수명',\r
            '대륙별 기대수명 분포',\r
            'GDP-기대수명 밀도'\r
        ],\r
        specs=[\r
            [{'type': 'xy'}, {'type': 'pie'}],\r
            [{'type': 'xy'}, {'type': 'xy'}],\r
            [{'type': 'xy'}, {'type': 'xy'}]\r
        ]\r
    )\r
\r
    dashLifeByContinent = df2007.groupby('continent', as_index=False)['lifeExp'].mean()\r
    finalDashboard.add_trace(\r
        go.Bar(x=dashLifeByContinent['continent'], y=dashLifeByContinent['lifeExp'], marker_color='steelblue'),\r
        row=1, col=1\r
    )\r
\r
    dashPopByContinent = df2007.groupby('continent', as_index=False)['pop'].sum()\r
    finalDashboard.add_trace(\r
        go.Pie(labels=dashPopByContinent['continent'], values=dashPopByContinent['pop']),\r
        row=1, col=2\r
    )\r
\r
    dashLifeByYear = gapminder.groupby(['year', 'continent'], as_index=False)['lifeExp'].mean()\r
    for continent in dashLifeByYear['continent'].unique():\r
        continentData = dashLifeByYear[dashLifeByYear['continent'] == continent]\r
        finalDashboard.add_trace(\r
            go.Scatter(x=continentData['year'], y=continentData['lifeExp'], mode='lines', name=continent),\r
            row=2, col=1\r
        )\r
\r
    for continent in df2007['continent'].unique():\r
        continentData = df2007[df2007['continent'] == continent]\r
        finalDashboard.add_trace(\r
            go.Scatter(x=continentData['gdpPercap'], y=continentData['lifeExp'], mode='markers', name=continent, showlegend=False),\r
            row=2, col=2\r
        )\r
\r
    for continent in df2007['continent'].unique():\r
        continentData = df2007[df2007['continent'] == continent]['lifeExp']\r
        finalDashboard.add_trace(\r
            go.Box(y=continentData, name=continent, showlegend=False),\r
            row=3, col=1\r
        )\r
\r
    finalDashboard.add_trace(\r
        go.Histogram2d(x=df2007['gdpPercap'], y=df2007['lifeExp'], nbinsx=15, nbinsy=15, colorscale='Viridis', showscale=False),\r
        row=3, col=2\r
    )\r
\r
    finalDashboard.update_xaxes(type='log', row=2, col=2)\r
    finalDashboard.update_xaxes(showgrid=True, gridcolor='lightgray')\r
    finalDashboard.update_yaxes(showgrid=True, gridcolor='lightgray')\r
    finalDashboard.update_layout(\r
        height=900,\r
        title={\r
            'text': 'Gapminder 세계 발전 종합 대시보드',\r
            'x': 0.5,\r
            'font': {'size': 22}\r
        },\r
        plot_bgcolor='white',\r
        paper_bgcolor='#f8f9fa',\r
        font={'family': 'Arial', 'size': 11},\r
        margin={'t': 120, 'b': 50, 'l': 50, 'r': 50},\r
        showlegend=True,\r
        legend=dict(orientation='h', yanchor='bottom', y=1.02, xanchor='right', x=1)\r
    )\r
    finalDashboard\r
  exercise:\r
    prompt: 15단계. 종합 대시보드 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      finalDashboard = make_subplots(\r
          rows=3, cols=2,\r
          subplot_titles=[\r
              '대륙별 평균 기대수명',\r
              '대륙별 인구 비율',\r
              '기대수명 변화 추이',\r
              'GDP vs 기대수명',\r
              '대륙별 기대수명 분포',\r
              'GDP-기대수명 밀도'\r
          ],\r
          specs=[\r
              [{'type': 'xy'}, {'type': 'pie'}],\r
              [{'type': 'xy'}, {'type': 'xy'}],\r
              [{'type': 'xy'}, {'type': 'xy'}]\r
          ]\r
      )\r
\r
      dashLifeByContinent = df2007.groupby('continent', as_index=False)['lifeExp'].mean()\r
      finalDashboard.add_trace(\r
          go.Bar(x=dashLifeByContinent['continent'], y=dashLifeByContinent['lifeExp'], marker_color='steelblue'),\r
          row=1, col=1\r
      )\r
\r
      dashPopByContinent = df2007.groupby('continent', as_index=False)['pop'].sum()\r
      finalDashboard.add_trace(\r
          go.Pie(labels=dashPopByContinent['continent'], values=dashPopByContinent['pop']),\r
          row=1, col=2\r
      )\r
\r
      dashLifeByYear = gapminder.groupby(['year', 'continent'], as_index=False)['lifeExp'].mean()\r
      for continent in dashLifeByYear['continent'].unique():\r
          continentData = dashLifeByYear[dashLifeByYear['continent'] == continent]\r
          finalDashboard.add_trace(\r
              go.Scatter(x=continentData['year'], y=continentData['lifeExp'], mode='lines', name=continent),\r
              row=2, col=1\r
          )\r
\r
      for continent in df2007['continent'].unique():\r
          continentData = df2007[df2007['continent'] == continent]\r
          finalDashboard.add_trace(\r
              go.Scatter(x=continentData['gdpPercap'], y=continentData['lifeExp'], mode='markers', name=continent, showlegend=False),\r
              row=2, col=2\r
          )\r
\r
      for continent in df2007['continent'].unique():\r
          continentData = df2007[df2007['continent'] == continent]['lifeExp']\r
          finalDashboard.add_trace(\r
              go.Box(y=continentData, name=continent, showlegend=False),\r
              row=3, col=1\r
          )\r
\r
      finalDashboard.add_trace(\r
          go.Histogram2d(x=df2007['gdpPercap'], y=df2007['lifeExp'], nbinsx=15, nbinsy=15, colorscale='Viridis', showscale=False),\r
          row=3, col=2\r
      )\r
\r
      finalDashboard.update_xaxes(type='log', row=2, col=2)\r
      finalDashboard.update_xaxes(showgrid=True, gridcolor='lightgray')\r
      finalDashboard.update_yaxes(showgrid=True, gridcolor='lightgray')\r
      finalDashboard.update_layout(\r
          height=900,\r
          title={\r
              'text': 'Gapminder 세계 발전 종합 대시보드',\r
              'x': 0.5,\r
              'font': {'size': 22}\r
          },\r
          plot_bgcolor='white',\r
          paper_bgcolor='#f8f9fa',\r
          font={'family': 'Arial', 'size': 11},\r
          margin={'t': 120, 'b': 50, 'l': 50, 'r': 50},\r
          showlegend=True,\r
          legend=dict(orientation='h', yanchor='bottom', y=1.02, xanchor='right', x=1)\r
      )\r
      finalDashboard\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 종합 대시보드의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 15단계. 종합 대시보드 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 고급 확장 과제\r
  goal: 실습에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    모든 개념을 종합하여 추가 분석 대시보드를 만들어봅시다. 각 미션은 필터링, 서브플롯 구성, 다차원 분석, 시계열 비교, 계층 구조 시각화 등 실전 데이터 분석 시나리오를 반영하며, 완성하면 어떤 데이터든 효과적으로 시각화하고 인사이트를 도출할 수 있는 종합 역량을 갖추게 됩니다. Plotly의 모든 차트 타입, 스타일링 기법, 대시보드 구성 능력을 실전 수준으로 마스터하는 최종 단계입니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import plotly.express as px\r
    import plotly.graph_objects as go\r
    from plotly.subplots import make_subplots\r
    import pandas as pd\r
\r
    asiaGap = px.data.gapminder()\r
    asiaOnly = asiaGap[(asiaGap['year'] == 2007) & (asiaGap['continent'] == 'Asia')]\r
    asiaTop10 = asiaOnly.nlargest(10, 'pop')\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      import plotly.graph_objects as go\r
      from plotly.subplots import make_subplots\r
      import pandas as pd\r
\r
      asiaGap = px.data.gapminder()\r
      asiaOnly = asiaGap[(asiaGap['year'] == 2007) & (asiaGap['continent'] == 'Asia')]\r
      asiaTop10 = asiaOnly.nlargest(10, 'pop')\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`asiaGap\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  blocks:\r
  - type: text\r
    content: gapminder 데이터로 Plotly의 모든 개념을 종합한 대시보드를 완성했습니다!\r
  - type: list\r
    items:\r
    - 'A. 기본 차트: bar, line, scatter, histogram, box, violin, pie'\r
    - 'B. 고급 차트: bubble, heatmap, treemap, sunburst, choropleth, animation'\r
    - 'C. 스타일링: color, size, hover, title, log_scale, facet, trendline'\r
    - 'C. 레이아웃: update_layout, update_traces, template, make_subplots'\r
  - type: text\r
    content: 10개 프로젝트를 완료하며 Plotly Express의 핵심 개념을 모두 마스터했습니다. 이제 어떤 데이터든 효과적으로 시각화할 수 있습니다!\r
  goal: 정리에서 대시보드 데이터을 바꿨을 때 툴팁과 선택 상태가 어떻게 달라지는지 확인한다.\r
  why: 인터랙티브 차트는 사용자가 직접 데이터를 탐색할 수 있는 분석 화면을 만듭니다.\r
- id: workflow_validation\r
  title: 16단계. 종합 대시보드 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 실행 → 오류 수정 → 검증 → 실무 변주\r
  goal: 16단계. 종합 대시보드 검증 루프에서 인터랙티브 시각화 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    종합 대시보드는 차트를 많이 모으는 작업이 아니라 KPI, 비교, 관계, 분포가 같은 데이터 계약 위에서 움직이도록 만드는 작업입니다.\r
\r
    대시보드 레슨은 차트 완성보다 입력 검증과 KPI 변주까지 포함해야 실제 업무 템플릿이 됩니다.\r
  snippet: |-\r
    import plotly.express as px\r
    import plotly.graph_objects as go\r
    from plotly.subplots import make_subplots\r
\r
    dashboardGap = px.data.gapminder()\r
    dashboard2007 = dashboardGap.query("year == 2007")\r
    requiredColumns = {"continent", "country", "lifeExp", "pop", "gdpPercap"}\r
    missingColumns = requiredColumns - set(dashboard2007.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert dashboard2007[["lifeExp", "pop", "gdpPercap"]].gt(0).all().all()\r
    assert dashboard2007["continent"].nunique() == 5\r
  exercise:\r
    prompt: 16단계. 종합 대시보드 검증 루프 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
      import plotly.graph_objects as go\r
      from plotly.subplots import make_subplots\r
\r
      dashboardGap = px.data.gapminder()\r
      dashboard2007 = dashboardGap.query("year == 2007")\r
      requiredColumns = {"continent", "country", "lifeExp", "pop", "gdpPercap"}\r
      missingColumns = requiredColumns - set(dashboard2007.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert dashboard2007[["lifeExp", "pop", "gdpPercap"]].gt(0).all().all()\r
      assert dashboard2007["continent"].nunique() == 5\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 16단계. 종합 대시보드 검증 루프에서 \`dashboardGap\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 16단계. 종합 대시보드 검증 루프에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
`;export{e as default};