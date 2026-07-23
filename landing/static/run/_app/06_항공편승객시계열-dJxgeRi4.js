var e=`meta:\r
  packages:\r
  - matplotlib\r
  - pandas\r
  - seaborn\r
  id: seaborn_06\r
  title: 항공편승객시계열\r
  order: 6\r
  category: seaborn\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - seaborn\r
  - heatmap\r
  - lineplot\r
  - pivot\r
  - flights\r
  - 시계열\r
  seo:\r
    title: Seaborn 히트맵과 선그래프 - 항공편 승객 시계열 분석\r
    description: Seaborn heatmap, lineplot으로 항공편 승객 수의 시계열 패턴을 분석합니다. pivot과 annot 파라미터 활용법을 배웁니다.\r
    keywords:\r
    - seaborn\r
    - heatmap\r
    - lineplot\r
    - flights\r
    - 시계열분석\r
intro:\r
  emoji: ✈️\r
  goal: 연도/월별 항공 승객 수 추이를 히트맵과 선 그래프로 분석합니다.\r
  description: flights 데이터셋은 1949년부터 1960년까지 월별 항공 승객 수를 담고 있습니다. lineplot으로 추세를 보고, heatmap으로 2차원 패턴을\r
    시각화합니다. 이전에 배운 barplot, countplot, catplot 개념을 함께 활용합니다.\r
  direction: 항공편승객시계열에서 정리된 데이터를 통계 차트로 보고 분포와 관계를 검증합니다.\r
  benefits:\r
  - 분석용 테이블 확인 후 통계 차트 구성에 맞는 코드 입력을 고릅니다.\r
  - 항공편승객시계열 결과를 분포, 그룹, 관계 패턴 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 탐색 리포트에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(분석용 테이블)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 선 그래프 처리 실행\r
      detail: 통계 차트 구성 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 월별 구분 선그래프 결과 검증\r
      detail: 분포, 그룹, 관계 패턴 기준으로 실행 결과를 비교합니다.\r
    - label: 항공편승객시계열 재사용\r
      detail: 완성 코드를 탐색 리포트에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 통계 시각화 환경\r
      detail: matplotlib, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 항공편승객시계열 실행\r
      detail: 셀을 실행해 분포, 그룹, 관계 패턴와 예외 상태를 확인합니다.\r
    - label: 항공편승객시계열 완료\r
      detail: 검증된 코드를 탐색 리포트로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: seaborn과 matplotlib을 불러옵니다. flights 데이터셋은 1949년부터 1960년까지 월별 항공 승객 수를 담고 있습니다. 총 144행(12년\r
    × 12개월)의 시계열 데이터입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import seaborn as sns\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    flights = loadLocalDataset('flights')\r
    flights\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      flights = loadLocalDataset('flights')\r
      flights\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_lineplot\r
  title: 2단계. 선 그래프\r
  structuredPrimary: true\r
  subtitle: sns.lineplot()\r
  goal: 2단계. 선 그래프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    연도별 승객 수 추이를 선 그래프로 확인합니다. 같은 x값에 여러 y값이 있으면 평균과 신뢰구간을 표시합니다.\r
\r
    sns.lineplot()은 연속적인 데이터의 추세를 표현합니다. 같은 x값에 여러 y값이 있으면 자동으로 평균과 신뢰구간을 계산해 표시합니다.\r
  snippet: |-\r
    figLine, axLine = plt.subplots(figsize=(10, 5))\r
    sns.lineplot(data=flights, x='year', y='passengers', ax=axLine)\r
    axLine.set_title('Annual Passenger Trend')\r
    figLine\r
  exercise:\r
    prompt: 2단계. 선 그래프 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figLine, axLine = plt.subplots(figsize=(10, 5))\r
      sns.lineplot(data=flights, x='year', y='passengers', ax=axLine)\r
      axLine.set_title('Annual Passenger Trend')\r
      figLine\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 선 그래프의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 선 그래프 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step3_lineplot_hue\r
  title: 3단계. 월별 구분 선그래프\r
  structuredPrimary: true\r
  subtitle: hue 파라미터\r
  goal: 3단계. 월별 구분 선그래프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 월별로 구분하여 더 자세한 추이를 확인합니다. hue로 범주를 구분하면 각 그룹별 추세를 비교할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figLineHue, axLineHue = plt.subplots(figsize=(12, 6))\r
    sns.lineplot(data=flights, x='year', y='passengers', hue='month', palette='tab20', ax=axLineHue)\r
    axLineHue.legend(title='Month', bbox_to_anchor=(1.02, 1), loc='upper left')\r
    axLineHue.set_title('Monthly Passenger Trend by Year')\r
    figLineHue\r
  exercise:\r
    prompt: 3단계. 월별 구분 선그래프 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figLineHue, axLineHue = plt.subplots(figsize=(12, 6))\r
      sns.lineplot(data=flights, x='year', y='passengers', hue='month', palette='tab20', ax=axLineHue)\r
      axLineHue.legend(title='Month', bbox_to_anchor=(1.02, 1), loc='upper left')\r
      axLineHue.set_title('Monthly Passenger Trend by Year')\r
      figLineHue\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 월별 구분 선그래프의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 월별 구분 선그래프 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step4_pivot\r
  title: 4단계. 피벗 테이블\r
  structuredPrimary: true\r
  subtitle: pivot()\r
  goal: 4단계. 피벗 테이블에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    히트맵을 그리기 위해 피벗 테이블로 변환합니다. 피벗은 행-열 형태로 데이터를 재구성합니다.\r
\r
    pivot()은 행-열 형태로 데이터를 재구성합니다. 히트맵은 2차원 행렬 형태의 데이터를 색상으로 표현하므로 피벗 변환이 필요합니다.\r
  snippet: |-\r
    flightsPivot = flights.pivot(index='month', columns='year', values='passengers')\r
    flightsPivot\r
  exercise:\r
    prompt: 4단계. 피벗 테이블 예제에서 \`flightsPivot\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      flightsPivot = flights.pivot(index='month', columns='year', values='passengers')\r
      flightsPivot\r
    hints:\r
    - 바꿀 지점은 \`flightsPivot = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`flightsPivot\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 피벗 테이블에서 \`flightsPivot\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 피벗 테이블 실행 뒤 \`flightsPivot\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step5_heatmap_basic\r
  title: 5단계. 기본 히트맵\r
  structuredPrimary: true\r
  subtitle: sns.heatmap()\r
  goal: 5단계. 기본 히트맵에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    기본 히트맵을 그립니다. 값이 클수록 밝은 색, 작을수록 어두운 색으로 표시됩니다.\r
\r
    sns.heatmap()은 2차원 데이터를 색상 강도로 표현합니다. 값이 클수록 밝은 색, 작을수록 어두운 색으로 표시됩니다. 오른쪽 컬러바가 값과 색상의 대응을 보여줍니다.\r
  snippet: |-\r
    figHeat, axHeat = plt.subplots(figsize=(10, 8))\r
    sns.heatmap(flightsPivot, ax=axHeat)\r
    axHeat.set_title('Flight Passengers Heatmap')\r
    figHeat\r
  exercise:\r
    prompt: 5단계. 기본 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHeat, axHeat = plt.subplots(figsize=(10, 8))\r
      sns.heatmap(flightsPivot, ax=axHeat)\r
      axHeat.set_title('Flight Passengers Heatmap')\r
      figHeat\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 기본 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 기본 히트맵 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step6_heatmap_annot\r
  title: 6단계. 값 표시 히트맵\r
  structuredPrimary: true\r
  subtitle: annot, fmt\r
  goal: 6단계. 값 표시 히트맵에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    각 셀에 값을 표시하여 정확한 숫자를 확인합니다. annot으로 값을 표시하고 fmt로 형식을 지정합니다.\r
\r
    annot=True는 각 셀에 값을 표시합니다. fmt='d'는 정수 형식(decimal)으로 표시하며, fmt='.1f'는 소수점 1자리, fmt='.2%'는 백분율 형식입니다.\r
  snippet: |-\r
    figHeatAnnot, axHeatAnnot = plt.subplots(figsize=(12, 8))\r
    sns.heatmap(flightsPivot, annot=True, fmt='d', ax=axHeatAnnot)\r
    axHeatAnnot.set_title('Flight Passengers with Values')\r
    figHeatAnnot\r
  exercise:\r
    prompt: 6단계. 값 표시 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHeatAnnot, axHeatAnnot = plt.subplots(figsize=(12, 8))\r
      sns.heatmap(flightsPivot, annot=True, fmt='d', ax=axHeatAnnot)\r
      axHeatAnnot.set_title('Flight Passengers with Values')\r
      figHeatAnnot\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 값 표시 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 6단계. 값 표시 히트맵 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step7_heatmap_style\r
  title: 7단계. 스타일 지정\r
  structuredPrimary: true\r
  subtitle: cmap, linewidths\r
  goal: 7단계. 스타일 지정에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    색상 팔레트를 변경하고 구분선을 추가합니다. cmap으로 색상을 지정하고 linewidths로 셀 구분선을 추가합니다.\r
\r
    cmap으로 색상 팔레트를 지정합니다. 순차 데이터에는 'Blues', 'YlOrRd', 'viridis' 등이 적합합니다. linewidths는 셀 사이 구분선 두께입니다.\r
  snippet: |-\r
    figHeatStyle, axHeatStyle = plt.subplots(figsize=(12, 8))\r
    sns.heatmap(flightsPivot, annot=True, fmt='d', cmap='YlOrRd', linewidths=0.5, ax=axHeatStyle)\r
    axHeatStyle.set_title('Styled Heatmap')\r
    figHeatStyle\r
  exercise:\r
    prompt: 7단계. 스타일 지정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHeatStyle, axHeatStyle = plt.subplots(figsize=(12, 8))\r
      sns.heatmap(flightsPivot, annot=True, fmt='d', cmap='YlOrRd', linewidths=0.5, ax=axHeatStyle)\r
      axHeatStyle.set_title('Styled Heatmap')\r
      figHeatStyle\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 스타일 지정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. 스타일 지정 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step8_heatmap_range\r
  title: 8단계. 색상 범위 지정\r
  structuredPrimary: true\r
  subtitle: vmin, vmax, center\r
  goal: 8단계. 색상 범위 지정에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    색상 범위를 지정하여 특정 구간을 강조합니다. center로 기준점을 설정하면 발산형 팔레트가 효과적입니다.\r
\r
    vmin과 vmax로 색상 범위를 지정합니다. center는 중앙 기준값으로, 발산형 팔레트(coolwarm, RdBu)에서 기준점 색상을 지정합니다. 이 값보다 작으면 파랑, 크면 빨강 계열로 표시됩니다.\r
  tips:\r
  - vmin과 vmax로 색상 범위를 지정합니다. center는 중앙 기준값으로, 발산형 팔레트(coolwarm, RdBu)에서 기준점 색상을 지정합니다. 이 값보다 작으면 파랑,\r
    크면 빨강 계열로 표시됩니다.\r
  snippet: |-\r
    figHeatRange, axHeatRange = plt.subplots(figsize=(12, 8))\r
    sns.heatmap(flightsPivot, annot=True, fmt='d', cmap='coolwarm', vmin=100, vmax=500, center=300, linewidths=0.5, ax=axHeatRange)\r
    axHeatRange.set_title('Heatmap with Custom Range')\r
    figHeatRange\r
  exercise:\r
    prompt: 8단계. 색상 범위 지정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figHeatRange, axHeatRange = plt.subplots(figsize=(12, 8))\r
      sns.heatmap(flightsPivot, annot=True, fmt='d', cmap='coolwarm', vmin=100, vmax=500, center=300, linewidths=0.5, ax=axHeatRange)\r
      axHeatRange.set_title('Heatmap with Custom Range')\r
      figHeatRange\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 색상 범위 지정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 색상 범위 지정 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step9_barplot_year\r
  title: 9단계. 연도별 막대그래프\r
  structuredPrimary: true\r
  subtitle: 집계 후 시각화\r
  goal: 9단계. 연도별 막대그래프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 연도별 총 승객 수를 막대 그래프로 비교합니다. groupby로 집계한 후 barplot으로 시각화합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    yearlyPassengers = flights.groupby('year')['passengers'].sum().reset_index()\r
    figBar, axBar = plt.subplots(figsize=(10, 5))\r
    sns.barplot(data=yearlyPassengers, x='year', y='passengers', hue='year', palette='Blues_d', legend=False, ax=axBar)\r
    axBar.set_title('Total Passengers by Year')\r
    figBar\r
  exercise:\r
    prompt: 9단계. 연도별 막대그래프 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      yearlyPassengers = flights.groupby('year')['passengers'].sum().reset_index()\r
      figBar, axBar = plt.subplots(figsize=(10, 5))\r
      sns.barplot(data=yearlyPassengers, x='year', y='passengers', hue='year', palette='Blues_d', legend=False, ax=axBar)\r
      axBar.set_title('Total Passengers by Year')\r
      figBar\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 연도별 막대그래프의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. 연도별 막대그래프의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_barplot_month\r
  title: 10단계. 월별 평균\r
  structuredPrimary: true\r
  subtitle: 계절성 분석\r
  goal: 10단계. 월별 평균에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    월별 평균 승객 수를 비교하여 계절성을 확인합니다. barplot은 기본적으로 평균과 95% 신뢰구간을 표시합니다.\r
\r
    barplot()은 기본적으로 평균을 계산하고 95% 신뢰구간을 에러바로 표시합니다. 7-8월 여름 휴가철에 승객이 많은 계절성 패턴을 확인할 수 있습니다.\r
  snippet: |-\r
    figMonthly, axMonthly = plt.subplots(figsize=(10, 5))\r
    sns.barplot(data=flights, x='month', y='passengers', hue='month', palette='coolwarm', legend=False, ax=axMonthly)\r
    axMonthly.set_title('Average Passengers by Month')\r
    axMonthly.tick_params(axis='x', rotation=45)\r
    figMonthly\r
  exercise:\r
    prompt: 10단계. 월별 평균 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figMonthly, axMonthly = plt.subplots(figsize=(10, 5))\r
      sns.barplot(data=flights, x='month', y='passengers', hue='month', palette='coolwarm', legend=False, ax=axMonthly)\r
      axMonthly.set_title('Average Passengers by Month')\r
      axMonthly.tick_params(axis='x', rotation=45)\r
      figMonthly\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 월별 평균의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. 월별 평균 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step11_corr_heatmap\r
  title: 11단계. 상관관계 히트맵\r
  structuredPrimary: true\r
  subtitle: corr()\r
  goal: 11단계. 상관관계 히트맵에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    상관관계 히트맵을 위해 월별 피벗 데이터의 상관계수를 계산합니다. 인접한 달끼리 높은 상관관계를 보입니다.\r
\r
    상관계수 히트맵은 변수 간 관계를 한눈에 보여줍니다. 인접한 달끼리 높은 상관관계(1에 가까움)를 보이고, 6개월 차이 나는 달은 낮은 상관관계를 보입니다.\r
  snippet: |-\r
    monthCorr = flightsPivot.T.corr()\r
    figCorr, axCorr = plt.subplots(figsize=(10, 8))\r
    sns.heatmap(monthCorr, annot=True, fmt='.2f', cmap='RdYlBu_r', vmin=-1, vmax=1, ax=axCorr)\r
    axCorr.set_title('Month Correlation Heatmap')\r
    figCorr\r
  exercise:\r
    prompt: 11단계. 상관관계 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      monthCorr = flightsPivot.T.corr()\r
      figCorr, axCorr = plt.subplots(figsize=(10, 8))\r
      sns.heatmap(monthCorr, annot=True, fmt='.2f', cmap='RdYlBu_r', vmin=-1, vmax=1, ax=axCorr)\r
      axCorr.set_title('Month Correlation Heatmap')\r
      figCorr\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 상관관계 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 상관관계 히트맵의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: workflow_validation\r
  title: 12단계. 항공편 시계열 검증 루프\r
  structuredPrimary: true\r
  subtitle: 예측 → 오류 수정 → 검증 → 실무 변주\r
  goal: 12단계. 항공편 시계열 검증 루프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    시계열 히트맵은 계절성과 장기 추세를 동시에 보여 줍니다. 월과 연도가 빠짐없이 있는지 먼저 확인하고, 피크 시즌과 성장 흐름을 검증합니다.\r
\r
    시계열 차트는 축이 맞아도 데이터 키가 중복되면 틀어집니다. pivot 전 키 검증을 습관으로 가져가세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    flightFlow = loadLocalDataset("flights")\r
    requiredColumns = {"year", "month", "passengers"}\r
    missingColumns = requiredColumns - set(flightFlow.columns)\r
\r
    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
    assert flightFlow["month"].nunique() == 12\r
    assert flightFlow["year"].nunique() == 12\r
\r
    firstYearTotal = flightFlow.loc[flightFlow["year"] == flightFlow["year"].min(), "passengers"].sum()\r
    lastYearTotal = flightFlow.loc[flightFlow["year"] == flightFlow["year"].max(), "passengers"].sum()\r
    assert lastYearTotal > firstYearTotal\r
    (firstYearTotal, lastYearTotal)\r
  exercise:\r
    prompt: 12단계. 항공편 시계열 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      flightFlow = loadLocalDataset("flights")\r
      requiredColumns = {"year", "month", "passengers"}\r
      missingColumns = requiredColumns - set(flightFlow.columns)\r
\r
      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"\r
      assert flightFlow["month"].nunique() == 12\r
      assert flightFlow["year"].nunique() == 12\r
\r
      firstYearTotal = flightFlow.loc[flightFlow["year"] == flightFlow["year"].min(), "passengers"].sum()\r
      lastYearTotal = flightFlow.loc[flightFlow["year"] == flightFlow["year"].max(), "passengers"].sum()\r
      assert lastYearTotal > firstYearTotal\r
      (firstYearTotal, lastYearTotal)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 항공편 시계열 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 항공편 시계열 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 시계열 시각화\r
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
    data = loadLocalDataset('tips')\r
    matrix = data.pivot_table(index='day', columns='time', values='total_bill', aggfunc='mean')\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import matplotlib.pyplot as plt\r
\r
      data = loadLocalDataset('tips')\r
      matrix = data.pivot_table(index='day', columns='time', values='total_bill', aggfunc='mean')\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};