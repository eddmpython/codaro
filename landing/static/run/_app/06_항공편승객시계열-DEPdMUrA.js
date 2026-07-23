var e=`meta:
  packages:
  - matplotlib
  - pandas
  - seaborn
  id: seaborn_06
  title: 항공편승객시계열
  order: 6
  category: seaborn
  difficulty: ⭐⭐⭐
  badge: 중급
  tags:
  - seaborn
  - heatmap
  - lineplot
  - pivot
  - flights
  - 시계열
  seo:
    title: Seaborn 히트맵과 선그래프 - 항공편 승객 시계열 분석
    description: Seaborn heatmap, lineplot으로 항공편 승객 수의 시계열 패턴을 분석합니다. pivot과 annot 파라미터 활용법을 배웁니다.
    keywords:
    - seaborn
    - heatmap
    - lineplot
    - flights
    - 시계열분석
intro:
  emoji: ✈️
  goal: 연도/월별 항공 승객 수 추이를 히트맵과 선 그래프로 분석합니다.
  description: flights 데이터셋은 1949년부터 1960년까지 월별 항공 승객 수를 담고 있습니다. lineplot으로 추세를 보고, heatmap으로 2차원 패턴을
    시각화합니다. 이전에 배운 barplot, countplot, catplot 개념을 함께 활용합니다.
  direction: 항공편승객시계열에서 정리된 데이터를 통계 차트로 보고 분포와 관계를 검증합니다.
  benefits:
  - 분석용 테이블 확인 후 통계 차트 구성에 맞는 코드 입력을 고릅니다.
  - 항공편승객시계열 결과를 분포, 그룹, 관계 패턴 기준으로 즉시 점검합니다.
  - 완료한 코드를 탐색 리포트에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(분석용 테이블)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 선 그래프 처리 실행
      detail: 통계 차트 구성 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 월별 구분 선그래프 결과 검증
      detail: 분포, 그룹, 관계 패턴 기준으로 실행 결과를 비교합니다.
    - label: 항공편승객시계열 재사용
      detail: 완성 코드를 탐색 리포트에 붙일 수 있게 정리합니다.
    runtime:
    - label: 통계 시각화 환경
      detail: matplotlib, pandas, seaborn 기준으로 로컬 Python 실행을 준비합니다.
    - label: 항공편승객시계열 실행
      detail: 셀을 실행해 분포, 그룹, 관계 패턴와 예외 상태를 확인합니다.
    - label: 항공편승객시계열 완료
      detail: 검증된 코드를 탐색 리포트로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: seaborn과 matplotlib을 불러옵니다. flights 데이터셋은 1949년부터 1960년까지 월별 항공 승객 수를 담고 있습니다. 총 144행(12년
    × 12개월)의 시계열 데이터입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import seaborn as sns
    from codaro.curriculum.localData import loadLocalDataset
    import matplotlib.pyplot as plt
    import pandas as pd

    flights = loadLocalDataset('flights')
    flights
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import seaborn as sns
      from codaro.curriculum.localData import loadLocalDataset
      import matplotlib.pyplot as plt
      import pandas as pd

      flights = loadLocalDataset('flights')
      flights
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 라이브러리 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step2_lineplot
  title: 2단계. 선 그래프
  structuredPrimary: true
  subtitle: sns.lineplot()
  goal: 2단계. 선 그래프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    연도별 승객 수 추이를 선 그래프로 확인합니다. 같은 x값에 여러 y값이 있으면 평균과 신뢰구간을 표시합니다.

    sns.lineplot()은 연속적인 데이터의 추세를 표현합니다. 같은 x값에 여러 y값이 있으면 자동으로 평균과 신뢰구간을 계산해 표시합니다.
  snippet: |-
    figLine, axLine = plt.subplots(figsize=(10, 5))
    sns.lineplot(data=flights, x='year', y='passengers', ax=axLine)
    axLine.set_title('Annual Passenger Trend')
    figLine
  exercise:
    prompt: 2단계. 선 그래프 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figLine, axLine = plt.subplots(figsize=(10, 5))
      sns.lineplot(data=flights, x='year', y='passengers', ax=axLine)
      axLine.set_title('Annual Passenger Trend')
      figLine
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. 선 그래프의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 2단계. 선 그래프 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step3_lineplot_hue
  title: 3단계. 월별 구분 선그래프
  structuredPrimary: true
  subtitle: hue 파라미터
  goal: 3단계. 월별 구분 선그래프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 월별로 구분하여 더 자세한 추이를 확인합니다. hue로 범주를 구분하면 각 그룹별 추세를 비교할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    figLineHue, axLineHue = plt.subplots(figsize=(12, 6))
    sns.lineplot(data=flights, x='year', y='passengers', hue='month', palette='tab20', ax=axLineHue)
    axLineHue.legend(title='Month', bbox_to_anchor=(1.02, 1), loc='upper left')
    axLineHue.set_title('Monthly Passenger Trend by Year')
    figLineHue
  exercise:
    prompt: 3단계. 월별 구분 선그래프 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figLineHue, axLineHue = plt.subplots(figsize=(12, 6))
      sns.lineplot(data=flights, x='year', y='passengers', hue='month', palette='tab20', ax=axLineHue)
      axLineHue.legend(title='Month', bbox_to_anchor=(1.02, 1), loc='upper left')
      axLineHue.set_title('Monthly Passenger Trend by Year')
      figLineHue
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 월별 구분 선그래프의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 3단계. 월별 구분 선그래프 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step4_pivot
  title: 4단계. 피벗 테이블
  structuredPrimary: true
  subtitle: pivot()
  goal: 4단계. 피벗 테이블에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    히트맵을 그리기 위해 피벗 테이블로 변환합니다. 피벗은 행-열 형태로 데이터를 재구성합니다.

    pivot()은 행-열 형태로 데이터를 재구성합니다. 히트맵은 2차원 행렬 형태의 데이터를 색상으로 표현하므로 피벗 변환이 필요합니다.
  snippet: |-
    flightsPivot = flights.pivot(index='month', columns='year', values='passengers')
    flightsPivot
  exercise:
    prompt: 4단계. 피벗 테이블 예제에서 \`flightsPivot\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      flightsPivot = flights.pivot(index='month', columns='year', values='passengers')
      flightsPivot
    hints:
    - 바꿀 지점은 \`flightsPivot = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`flightsPivot\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 4단계. 피벗 테이블에서 \`flightsPivot\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 4단계. 피벗 테이블 실행 뒤 \`flightsPivot\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step5_heatmap_basic
  title: 5단계. 기본 히트맵
  structuredPrimary: true
  subtitle: sns.heatmap()
  goal: 5단계. 기본 히트맵에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    기본 히트맵을 그립니다. 값이 클수록 밝은 색, 작을수록 어두운 색으로 표시됩니다.

    sns.heatmap()은 2차원 데이터를 색상 강도로 표현합니다. 값이 클수록 밝은 색, 작을수록 어두운 색으로 표시됩니다. 오른쪽 컬러바가 값과 색상의 대응을 보여줍니다.
  snippet: |-
    figHeat, axHeat = plt.subplots(figsize=(10, 8))
    sns.heatmap(flightsPivot, ax=axHeat)
    axHeat.set_title('Flight Passengers Heatmap')
    figHeat
  exercise:
    prompt: 5단계. 기본 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figHeat, axHeat = plt.subplots(figsize=(10, 8))
      sns.heatmap(flightsPivot, ax=axHeat)
      axHeat.set_title('Flight Passengers Heatmap')
      figHeat
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 5단계. 기본 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 5단계. 기본 히트맵 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step6_heatmap_annot
  title: 6단계. 값 표시 히트맵
  structuredPrimary: true
  subtitle: annot, fmt
  goal: 6단계. 값 표시 히트맵에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    각 셀에 값을 표시하여 정확한 숫자를 확인합니다. annot으로 값을 표시하고 fmt로 형식을 지정합니다.

    annot=True는 각 셀에 값을 표시합니다. fmt='d'는 정수 형식(decimal)으로 표시하며, fmt='.1f'는 소수점 1자리, fmt='.2%'는 백분율 형식입니다.
  snippet: |-
    figHeatAnnot, axHeatAnnot = plt.subplots(figsize=(12, 8))
    sns.heatmap(flightsPivot, annot=True, fmt='d', ax=axHeatAnnot)
    axHeatAnnot.set_title('Flight Passengers with Values')
    figHeatAnnot
  exercise:
    prompt: 6단계. 값 표시 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figHeatAnnot, axHeatAnnot = plt.subplots(figsize=(12, 8))
      sns.heatmap(flightsPivot, annot=True, fmt='d', ax=axHeatAnnot)
      axHeatAnnot.set_title('Flight Passengers with Values')
      figHeatAnnot
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 6단계. 값 표시 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 6단계. 값 표시 히트맵 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step7_heatmap_style
  title: 7단계. 스타일 지정
  structuredPrimary: true
  subtitle: cmap, linewidths
  goal: 7단계. 스타일 지정에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    색상 팔레트를 변경하고 구분선을 추가합니다. cmap으로 색상을 지정하고 linewidths로 셀 구분선을 추가합니다.

    cmap으로 색상 팔레트를 지정합니다. 순차 데이터에는 'Blues', 'YlOrRd', 'viridis' 등이 적합합니다. linewidths는 셀 사이 구분선 두께입니다.
  snippet: |-
    figHeatStyle, axHeatStyle = plt.subplots(figsize=(12, 8))
    sns.heatmap(flightsPivot, annot=True, fmt='d', cmap='YlOrRd', linewidths=0.5, ax=axHeatStyle)
    axHeatStyle.set_title('Styled Heatmap')
    figHeatStyle
  exercise:
    prompt: 7단계. 스타일 지정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figHeatStyle, axHeatStyle = plt.subplots(figsize=(12, 8))
      sns.heatmap(flightsPivot, annot=True, fmt='d', cmap='YlOrRd', linewidths=0.5, ax=axHeatStyle)
      axHeatStyle.set_title('Styled Heatmap')
      figHeatStyle
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 7단계. 스타일 지정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 7단계. 스타일 지정 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step8_heatmap_range
  title: 8단계. 색상 범위 지정
  structuredPrimary: true
  subtitle: vmin, vmax, center
  goal: 8단계. 색상 범위 지정에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    색상 범위를 지정하여 특정 구간을 강조합니다. center로 기준점을 설정하면 발산형 팔레트가 효과적입니다.

    vmin과 vmax로 색상 범위를 지정합니다. center는 중앙 기준값으로, 발산형 팔레트(coolwarm, RdBu)에서 기준점 색상을 지정합니다. 이 값보다 작으면 파랑, 크면 빨강 계열로 표시됩니다.
  tips:
  - vmin과 vmax로 색상 범위를 지정합니다. center는 중앙 기준값으로, 발산형 팔레트(coolwarm, RdBu)에서 기준점 색상을 지정합니다. 이 값보다 작으면 파랑,
    크면 빨강 계열로 표시됩니다.
  snippet: |-
    figHeatRange, axHeatRange = plt.subplots(figsize=(12, 8))
    sns.heatmap(flightsPivot, annot=True, fmt='d', cmap='coolwarm', vmin=100, vmax=500, center=300, linewidths=0.5, ax=axHeatRange)
    axHeatRange.set_title('Heatmap with Custom Range')
    figHeatRange
  exercise:
    prompt: 8단계. 색상 범위 지정 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figHeatRange, axHeatRange = plt.subplots(figsize=(12, 8))
      sns.heatmap(flightsPivot, annot=True, fmt='d', cmap='coolwarm', vmin=100, vmax=500, center=300, linewidths=0.5, ax=axHeatRange)
      axHeatRange.set_title('Heatmap with Custom Range')
      figHeatRange
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 8단계. 색상 범위 지정의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 8단계. 색상 범위 지정 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step9_barplot_year
  title: 9단계. 연도별 막대그래프
  structuredPrimary: true
  subtitle: 집계 후 시각화
  goal: 9단계. 연도별 막대그래프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 연도별 총 승객 수를 막대 그래프로 비교합니다. groupby로 집계한 후 barplot으로 시각화합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    yearlyPassengers = flights.groupby('year')['passengers'].sum().reset_index()
    figBar, axBar = plt.subplots(figsize=(10, 5))
    sns.barplot(data=yearlyPassengers, x='year', y='passengers', hue='year', palette='Blues_d', legend=False, ax=axBar)
    axBar.set_title('Total Passengers by Year')
    figBar
  exercise:
    prompt: 9단계. 연도별 막대그래프 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      yearlyPassengers = flights.groupby('year')['passengers'].sum().reset_index()
      figBar, axBar = plt.subplots(figsize=(10, 5))
      sns.barplot(data=yearlyPassengers, x='year', y='passengers', hue='year', palette='Blues_d', legend=False, ax=axBar)
      axBar.set_title('Total Passengers by Year')
      figBar
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 9단계. 연도별 막대그래프의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 9단계. 연도별 막대그래프의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step10_barplot_month
  title: 10단계. 월별 평균
  structuredPrimary: true
  subtitle: 계절성 분석
  goal: 10단계. 월별 평균에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    월별 평균 승객 수를 비교하여 계절성을 확인합니다. barplot은 기본적으로 평균과 95% 신뢰구간을 표시합니다.

    barplot()은 기본적으로 평균을 계산하고 95% 신뢰구간을 에러바로 표시합니다. 7-8월 여름 휴가철에 승객이 많은 계절성 패턴을 확인할 수 있습니다.
  snippet: |-
    figMonthly, axMonthly = plt.subplots(figsize=(10, 5))
    sns.barplot(data=flights, x='month', y='passengers', hue='month', palette='coolwarm', legend=False, ax=axMonthly)
    axMonthly.set_title('Average Passengers by Month')
    axMonthly.tick_params(axis='x', rotation=45)
    figMonthly
  exercise:
    prompt: 10단계. 월별 평균 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      figMonthly, axMonthly = plt.subplots(figsize=(10, 5))
      sns.barplot(data=flights, x='month', y='passengers', hue='month', palette='coolwarm', legend=False, ax=axMonthly)
      axMonthly.set_title('Average Passengers by Month')
      axMonthly.tick_params(axis='x', rotation=45)
      figMonthly
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 10단계. 월별 평균의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 10단계. 월별 평균 실행 결과가 분포, 그룹, 관계 패턴 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.
- id: step11_corr_heatmap
  title: 11단계. 상관관계 히트맵
  structuredPrimary: true
  subtitle: corr()
  goal: 11단계. 상관관계 히트맵에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    상관관계 히트맵을 위해 월별 피벗 데이터의 상관계수를 계산합니다. 인접한 달끼리 높은 상관관계를 보입니다.

    상관계수 히트맵은 변수 간 관계를 한눈에 보여줍니다. 인접한 달끼리 높은 상관관계(1에 가까움)를 보이고, 6개월 차이 나는 달은 낮은 상관관계를 보입니다.
  snippet: |-
    monthCorr = flightsPivot.T.corr()
    figCorr, axCorr = plt.subplots(figsize=(10, 8))
    sns.heatmap(monthCorr, annot=True, fmt='.2f', cmap='RdYlBu_r', vmin=-1, vmax=1, ax=axCorr)
    axCorr.set_title('Month Correlation Heatmap')
    figCorr
  exercise:
    prompt: 11단계. 상관관계 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      monthCorr = flightsPivot.T.corr()
      figCorr, axCorr = plt.subplots(figsize=(10, 8))
      sns.heatmap(monthCorr, annot=True, fmt='.2f', cmap='RdYlBu_r', vmin=-1, vmax=1, ax=axCorr)
      axCorr.set_title('Month Correlation Heatmap')
      figCorr
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 11단계. 상관관계 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 11단계. 상관관계 히트맵의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: workflow_validation
  title: 12단계. 항공편 시계열 검증 루프
  structuredPrimary: true
  subtitle: 예측 → 오류 수정 → 검증 → 실무 변주
  goal: 12단계. 항공편 시계열 검증 루프에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    시계열 히트맵은 계절성과 장기 추세를 동시에 보여 줍니다. 월과 연도가 빠짐없이 있는지 먼저 확인하고, 피크 시즌과 성장 흐름을 검증합니다.

    시계열 차트는 축이 맞아도 데이터 키가 중복되면 틀어집니다. pivot 전 키 검증을 습관으로 가져가세요.
  snippet: |-
    from codaro.curriculum.localData import loadLocalDataset

    flightFlow = loadLocalDataset("flights")
    requiredColumns = {"year", "month", "passengers"}
    missingColumns = requiredColumns - set(flightFlow.columns)

    assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"
    assert flightFlow["month"].nunique() == 12
    assert flightFlow["year"].nunique() == 12

    firstYearTotal = flightFlow.loc[flightFlow["year"] == flightFlow["year"].min(), "passengers"].sum()
    lastYearTotal = flightFlow.loc[flightFlow["year"] == flightFlow["year"].max(), "passengers"].sum()
    assert lastYearTotal > firstYearTotal
    (firstYearTotal, lastYearTotal)
  exercise:
    prompt: 12단계. 항공편 시계열 검증 루프 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      from codaro.curriculum.localData import loadLocalDataset

      flightFlow = loadLocalDataset("flights")
      requiredColumns = {"year", "month", "passengers"}
      missingColumns = requiredColumns - set(flightFlow.columns)

      assert not missingColumns, f"필수 컬럼 누락: {missingColumns}"
      assert flightFlow["month"].nunique() == 12
      assert flightFlow["year"].nunique() == 12

      firstYearTotal = flightFlow.loc[flightFlow["year"] == flightFlow["year"].min(), "passengers"].sum()
      lastYearTotal = flightFlow.loc[flightFlow["year"] == flightFlow["year"].max(), "passengers"].sum()
      assert lastYearTotal > firstYearTotal
      (firstYearTotal, lastYearTotal)
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 12단계. 항공편 시계열 검증 루프의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 12단계. 항공편 시계열 검증 루프의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 시계열 시각화
  goal: 실습에서 통계 차트 구성 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    지금까지 배운 개념을 활용하여 미션을 수행해봅시다. 각 미션은 독립적으로 실행 가능합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import seaborn as sns
    from codaro.curriculum.localData import loadLocalDataset
    import matplotlib.pyplot as plt

    data = loadLocalDataset('tips')
    matrix = data.pivot_table(index='day', columns='time', values='total_bill', aggfunc='mean')
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import seaborn as sns
      from codaro.curriculum.localData import loadLocalDataset
      import matplotlib.pyplot as plt

      data = loadLocalDataset('tips')
      matrix = data.pivot_table(index='day', columns='time', values='total_bill', aggfunc='mean')
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
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
  - id: seaborn_06-flight-seasonality-data-evidence-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - practice
    title: 항공편 승객 시계열 데이터 증거 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 장기 추세와 월별 계절성을 같은 행렬에서 구분하는가에 답하기 전에 usable·excluded 분모와 축 범위를 고정한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 차트에 들어가지 않은 NULL 행도 excludedCount로 보존하세요.
    - 축 범위와 그룹별 표본 수 없이 모양만 해석하지 마세요.
    exercise:
      prompt: prepare_flight_seasonality(rows)를 완성해 차트에 실제 사용된 행 수, 제외 수, 그룹 수, 두 축 범위를 반환하세요.
      starterCode: |-
        def prepare_flight_seasonality(rows):
            raise NotImplementedError
      solution: |
        def prepare_flight_seasonality(rows):
            required = ['month', 'year', 'era']
            if any(not set(required) <= set(row) for row in rows):
                raise ValueError("chart schema mismatch")
            usable = [row for row in rows if all(row[name] is not None for name in required)]
            groups = {}
            group_field = 'era'
            for row in usable:
                key = "all" if group_field is None else str(row[group_field])
                groups[key] = groups.get(key, 0) + 1
            x_values = [row['month'] for row in usable]
            y_values = [row['year'] for row in usable]
            return {
                "usableCount": len(usable),
                "excludedCount": len(rows) - len(usable),
                "groupCounts": {key: groups[key] for key in sorted(groups)},
                "xExtent": None if not x_values else [min(x_values), max(x_values)],
                "yExtent": None if not y_values else [min(y_values), max(y_values)],
            }
      hints: *id001
    check:
      id: python.seaborn.seaborn_06.flight-seasonality-data-evidence.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.seaborn.seaborn_06.flight-seasonality-data-evidence.mastery.behavior.v1.fixture
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
        entry: prepare_flight_seasonality
        cases:
        - id: summarizes-visible-data
          arguments:
          - value:
            - month: 1
              year: 2024
              era: recent
            - month: 2
              year: 2024
              era: recent
            - month: 1
              year: 2023
              era: past
          expectedReturn:
            usableCount: 3
            excludedCount: 0
            groupCounts:
              past: 1
              recent: 2
            xExtent:
            - 1
            - 2
            yExtent:
            - 2023
            - 2024
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
  - id: seaborn_06-flight-seasonality-encoding-transfer-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - seaborn_06-flight-seasonality-data-evidence-mastery
    title: 항공편 승객 시계열 인코딩 계약을 새 문맥에 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 월·연도별 전력 수요를 고정 color scale heatmap으로 비교한다라는 새 문맥에서도 mark·axis·transform·interaction 책임을 재현한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 표현 mark만 맞아도 충분하지 않습니다. 축·그룹·변환을 함께 검사하세요.
    - description은 보이지 않는 사용자와 차트를 열 수 없는 상황의 핵심 증거입니다.
    exercise:
      prompt: audit_flight_seasonality(candidate)를 완성해 주어진 차트 사양의 오류와 기대 encoding을 반환하세요.
      starterCode: |-
        def audit_flight_seasonality(candidate):
            raise NotImplementedError
      solution: |
        def audit_flight_seasonality(candidate):
            expected = {'mark': 'heatmap', 'x': 'month', 'y': 'year', 'group': 'era', 'transforms': ['fixed-color-scale', 'pivot'], 'interaction': 'none'}
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
      id: python.seaborn.seaborn_06.flight-seasonality-encoding-transfer.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.seaborn.seaborn_06.flight-seasonality-encoding-transfer.transfer.behavior.v1.fixture
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
        entry: audit_flight_seasonality
        cases:
        - id: accepts-complete-encoding
          arguments:
          - value:
              mark: heatmap
              x: month
              y: year
              group: era
              transforms:
              - fixed-color-scale
              - pivot
              interaction: none
              description: 월·연도별 전력 수요를 고정 color scale heatmap으로 비교한다
          expectedReturn:
            valid: true
            errors: []
            encoding:
              mark: heatmap
              x: month
              y: year
              group: era
              transforms:
              - fixed-color-scale
              - pivot
              interaction: none
        - id: reports-misleading-encoding
          arguments:
          - value:
              mark: table
              x: year
              y: month
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
              mark: heatmap
              x: month
              y: year
              group: era
              transforms:
              - fixed-color-scale
              - pivot
              interaction: none
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: seaborn_06-flight-seasonality-interpretation-retrieval-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - seaborn_06-flight-seasonality-encoding-transfer-transfer
    title: 항공편 승객 시계열 해석 위험 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 장기 추세와 월별 계절성을 같은 행렬에서 구분하는가을 다시 판단할 때 차트 선택과 증거 한계를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 차트가 보여주는 패턴과 인과 주장을 구분하세요.
    - 축·분모·결측·표본 수 중 무엇이 해석을 바꾸는지 명시하세요.
    exercise:
      prompt: choose_flight_seasonality(situation)를 완성해 encoding, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_flight_seasonality(situation):
            raise NotImplementedError
      solution: |
        def choose_flight_seasonality(situation):
            table = {'seasonal-matrix': {'encoding': 'year-month heatmap', 'evidence': 'fixed scale', 'risk': 'color scale drift'}, 'exact-time-trend': {'encoding': 'line', 'evidence': 'ordered dates', 'risk': 'heatmap hides exact change'}, 'year-over-year': {'encoding': 'month lines by year', 'evidence': 'same months', 'risk': 'too many years'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.seaborn.seaborn_06.flight-seasonality-interpretation-retrieval.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.seaborn.seaborn_06.flight-seasonality-interpretation-retrieval.retrieval.behavior.v1.fixture
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
        entry: choose_flight_seasonality
        cases:
        - id: recalls-seasonal-matrix
          arguments:
          - value: seasonal-matrix
          expectedReturn:
            encoding: year-month heatmap
            evidence: fixed scale
            risk: color scale drift
        - id: recalls-exact-time-trend
          arguments:
          - value: exact-time-trend
          expectedReturn:
            encoding: line
            evidence: ordered dates
            risk: heatmap hides exact change
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};