var e=`meta:
  packages:
  - matplotlib
  - numpy
  - pandas
  - plotly
  - seaborn
  - statsmodels
  id: statsmodels_10
  title: 종합프로젝트
  order: 10
  category: statsmodels
  difficulty: ⭐⭐⭐⭐⭐
  badge: 심화
  tags:
  - VAR
  - 종합분석
  - 다변량시계열
  - 그랜저인과
  - 경제예측
  - 포트폴리오
  seo:
    title: statsmodels 종합 프로젝트 - VAR과 전체 개념 정리
    description: VAR 모델로 다변량 시계열을 예측합니다. 01-09 프로젝트의 모든 개념을 종합합니다.
    keywords:
    - statsmodels
    - VAR
    - 다변량시계열
    - 그랜저인과
    - 경제예측
    - 종합분석
intro:
  emoji: 🏆
  goal: 01-09 프로젝트의 모든 개념을 종합하여 다변량 시계열 분석을 완성합니다
  description: VAR(Vector Autoregression) 모델로 여러 경제 지표를 동시에 예측합니다. 그랜저 인과성 검정, 충격반응함수 등 고급 시계열 분석 기법을
    배웁니다.
  direction: 종합프로젝트에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.
  - 종합프로젝트 결과를 출력과 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 데이터 불러오기 입력 확인
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 분석 변수 선택 처리 실행
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 시계열 시각화 결과 검증
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.
    - label: 종합프로젝트 재사용
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.
    runtime:
    - label: 업무 코드 환경
      detail: matplotlib, numpy, pandas, plotly 기준으로 로컬 Python 실행을 준비합니다.
    - label: 종합프로젝트 실행
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.
    - label: 종합프로젝트 완료
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.
sections:
- id: step1_load
  title: 1단계. 데이터 불러오기
  structuredPrimary: true
  subtitle: 미국 거시경제 데이터
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 07 프로젝트에서 사용한 macrodata를 다시 활용합니다. 이번에는 GDP, 소비, 투자를 동시에 예측하는 다변량 모델을 구축합니다. 단변량 ARIMA는
    한 변수만 분석하지만, VAR(Vector Autoregression)은 여러 변수가 서로 영향을 주고받는 관계를 모델링합니다. 경제 변수들은 상호 의존적이므로 VAR이 더 현실적인
    예측을 제공합니다. 중앙은행, 투자기관에서 거시경제 예측에 VAR을 표준 도구로 사용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import pandas as pd
    import numpy as np
    import statsmodels.api as sm
    from statsmodels.tsa.api import VAR
    from statsmodels.tsa.stattools import adfuller, grangercausalitytests
    import plotly.express as px
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots

    macro = sm.datasets.macrodata.load_pandas().data
    macro['date'] = pd.to_datetime(macro['year'].astype(int).astype(str) + '-' + (macro['quarter'].astype(int) * 3 - 2).astype(str) + '-01')
    macro = macro.set_index('date')
    macro.shape
  exercise:
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import pandas as pd
      import numpy as np
      import statsmodels.api as sm
      from statsmodels.tsa.api import VAR
      from statsmodels.tsa.stattools import adfuller, grangercausalitytests
      import plotly.express as px
      import plotly.graph_objects as go
      from plotly.subplots import make_subplots

      macro = sm.datasets.macrodata.load_pandas().data
      macro['date'] = pd.to_datetime(macro['year'].astype(int).astype(str) + '-' + (macro['quarter'].astype(int) * 3 - 2).astype(str) + '-01')
      macro = macro.set_index('date')
      macro.shape
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step2_select_vars
  title: 2단계. 분석 변수 선택
  structuredPrimary: true
  subtitle: GDP, 소비, 투자
  goal: 2단계. 분석 변수 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: GDP(realgdp), 소비(realcons), 투자(realinv) 3개 변수를 선택합니다. 경제학에서 GDP = 소비 + 투자 + 정부지출 + 순수출(Y
    = C + I + G + NX)이므로 이 변수들은 밀접하게 연관되어 있습니다. 소비가 증가하면 GDP가 증가하고, GDP 증가는 다시 소비를 촉진하는 피드백 관계가 존재합니다.
    VAR은 이런 상호 의존성을 명시적으로 모델링하여 한 변수의 변화가 다른 변수에 미치는 영향을 추적할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    varData = macro[['realgdp', 'realcons', 'realinv']].copy()
    varData.columns = ['GDP', 'Consumption', 'Investment']
    varData.head()
  exercise:
    prompt: 2단계. 분석 변수 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      varData = macro[['realgdp', 'realcons', 'realinv']].copy()
      varData.columns = ['GDP', 'Consumption', 'Investment']
      varData.head()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 2단계. 분석 변수 선택에서 \`varData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 2단계. 분석 변수 선택 실행 뒤 \`varData\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step3_viz
  title: 3단계. 시계열 시각화
  structuredPrimary: true
  subtitle: 3개 변수 추세
  goal: 3단계. 시계열 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 3개 변수의 시계열을 함께 시각화합니다. 다변량 분석에서는 변수들이 비슷한 추세를 보이는지, 한 변수가 다른 변수보다 먼저 움직이는지(선행/후행 관계) 시각적으로
    확인합니다. 예를 들어 투자가 GDP보다 먼저 하락하면 투자가 경기 선행지표일 수 있습니다. 이런 관찰은 이후 그랜저 인과성 검정으로 통계적으로 검증합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    varFig = make_subplots(rows=3, cols=1, shared_xaxes=True,
                           subplot_titles=('GDP', 'Consumption', 'Investment'))

    varFig.add_trace(go.Scatter(x=varData.index, y=varData['GDP'], name='GDP'), row=1, col=1)
    varFig.add_trace(go.Scatter(x=varData.index, y=varData['Consumption'], name='Consumption'), row=2, col=1)
    varFig.add_trace(go.Scatter(x=varData.index, y=varData['Investment'], name='Investment'), row=3, col=1)

    varFig.update_layout(title='Multivariate Time Series', height=600, showlegend=False)
    varFig.show()
  exercise:
    prompt: 3단계. 시계열 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      varFig = make_subplots(rows=3, cols=1, shared_xaxes=True,
                             subplot_titles=('GDP', 'Consumption', 'Investment'))

      varFig.add_trace(go.Scatter(x=varData.index, y=varData['GDP'], name='GDP'), row=1, col=1)
      varFig.add_trace(go.Scatter(x=varData.index, y=varData['Consumption'], name='Consumption'), row=2, col=1)
      varFig.add_trace(go.Scatter(x=varData.index, y=varData['Investment'], name='Investment'), row=3, col=1)

      varFig.update_layout(title='Multivariate Time Series', height=600, showlegend=False)
      varFig.show()
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 시계열 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 3단계. 시계열 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step4_stationarity
  title: 4단계. 정상성 검정
  structuredPrimary: true
  subtitle: 모든 변수 ADF
  goal: 4단계. 정상성 검정에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: VAR 모델도 정상 시계열을 가정하므로 모든 변수에 ADF 검정을 적용합니다. GDP, 소비, 투자 같은 경제 수준 변수는 대부분 추세가 있어 비정상입니다.
    모든 변수가 정상이어야 VAR을 적용할 수 있으므로, 비정상 변수가 하나라도 있으면 전체 데이터에 차분을 적용해야 합니다. 일부 변수만 정상이고 일부는 비정상인 경우, 일관성을
    위해 모두 차분하는 것이 일반적입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    adfResults = []
    for col in varData.columns:
        adfTest = adfuller(varData[col])
        adfResults.append({
            'Variable': col,
            'ADF Stat': adfTest[0],
            'p-value': adfTest[1],
            'Stationary': 'Yes' if adfTest[1] < 0.05 else 'No'
        })

    adfDf = pd.DataFrame(adfResults)
    adfDf
  exercise:
    prompt: 4단계. 정상성 검정 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      adfResults = []
      for col in varData.columns:
          adfTest = adfuller(varData[col])
          adfResults.append({
              'Variable': col,
              'ADF Stat': adfTest[0],
              'p-value': adfTest[1],
              'Stationary': 'Yes' if adfTest[1] < 0.05 else 'No'
          })

      adfDf = pd.DataFrame(adfResults)
      adfDf
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 4단계. 정상성 검정의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 4단계. 정상성 검정 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step5_diff
  title: 5단계. 차분 적용
  structuredPrimary: true
  subtitle: 정상성 확보
  goal: 5단계. 차분 적용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 모든 변수에 1차 차분을 적용하여 정상성을 확보합니다. 차분된 변수는 '변화량'을 의미합니다. GDP 차분은 전 분기 대비 GDP 증가량, 소비 차분은 소비
    증가량입니다. 차분 후 ADF 검정으로 모든 변수가 정상화되었는지 확인합니다. 차분된 데이터로 VAR을 적합하면 '변화량 간의 관계'를 모델링하게 되며, 예측 후 누적합으로 원래
    수준을 복원합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    varDiff = varData.diff().dropna()

    adfDiffResults = []
    for col in varDiff.columns:
        adfTest = adfuller(varDiff[col])
        adfDiffResults.append({
            'Variable': col,
            'ADF Stat': adfTest[0],
            'p-value': adfTest[1],
            'Stationary': 'Yes' if adfTest[1] < 0.05 else 'No'
        })

    adfDiffDf = pd.DataFrame(adfDiffResults)
    adfDiffDf
  exercise:
    prompt: 5단계. 차분 적용 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      varDiff = varData.diff().dropna()

      adfDiffResults = []
      for col in varDiff.columns:
          adfTest = adfuller(varDiff[col])
          adfDiffResults.append({
              'Variable': col,
              'ADF Stat': adfTest[0],
              'p-value': adfTest[1],
              'Stationary': 'Yes' if adfTest[1] < 0.05 else 'No'
          })

      adfDiffDf = pd.DataFrame(adfDiffResults)
      adfDiffDf
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 5단계. 차분 적용의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 5단계. 차분 적용 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step6_var_intro
  title: 6단계. VAR 모델 소개
  structuredPrimary: true
  subtitle: 벡터 자기회귀
  goal: 6단계. VAR 모델 소개에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: VAR(Vector Autoregression)은 여러 시계열을 동시에 모델링합니다. VAR에서 각 변수는 자신의 과거값뿐 아니라 다른 변수의 과거값에도 영향을
    받습니다. 예를 들어 오늘의 GDP는 어제의 GDP, 어제의 소비, 어제의 투자 모두에 의해 결정됩니다. 이런 상호 의존성을 통해 변수 간 동적 관계를 포착할 수 있습니다. 단변량
    AR 모델은 다른 변수의 영향이 없는 VAR의 특수한 경우입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    varModel = VAR(varDiff)
    varModel.select_order(maxlags=8)
  exercise:
    prompt: 6단계. VAR 모델 소개 예제에서 \`varModel\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      varModel = VAR(varDiff)
      varModel.select_order(maxlags=8)
    hints:
    - 바꿀 지점은 \`varModel = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`varModel\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 6단계. VAR 모델 소개에서 \`varModel\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 6단계. VAR 모델 소개 실행 뒤 \`varModel\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step7_lag_selection
  title: 7단계. 시차 선택
  structuredPrimary: true
  subtitle: AIC, BIC 기준
  goal: 7단계. 시차 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: AIC/BIC 기준으로 최적 시차(lag)를 선택합니다. VAR(p)에서 p는 몇 기간 전까지의 값을 사용할지 결정합니다. VAR(2)면 2기간 전까지의 GDP,
    소비, 투자가 현재 값에 영향을 미친다고 가정합니다. 시차가 너무 작으면 중요한 패턴을 놓치고, 너무 크면 파라미터가 많아져 과적합됩니다. select_order()가 여러 시차에
    대해 AIC/BIC를 계산하여 최적 시차를 제안합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    lagOrder = varModel.select_order(maxlags=8)
    lagOrderDf = pd.DataFrame(lagOrder.summary().data[1:], columns=lagOrder.summary().data[0])
    lagOrderDf
  exercise:
    prompt: 7단계. 시차 선택 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      lagOrder = varModel.select_order(maxlags=8)
      lagOrderDf = pd.DataFrame(lagOrder.summary().data[1:], columns=lagOrder.summary().data[0])
      lagOrderDf
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 7단계. 시차 선택의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 7단계. 시차 선택의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step8_fit
  title: 8단계. VAR 모델 적합
  structuredPrimary: true
  subtitle: 최적 시차로 학습
  goal: 8단계. VAR 모델 적합에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: AIC가 가장 낮은 시차로 VAR 모델을 적합합니다. fit() 후 summary()를 확인하면 각 변수에 대한 회귀식을 볼 수 있습니다. GDP 방정식에서
    소비의 과거값 계수가 양수면 과거 소비 증가가 현재 GDP 증가에 기여한다는 의미입니다. 이런 계수 해석을 통해 변수 간 동적 관계를 파악할 수 있습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    optimalLag = lagOrder.aic
    varFit = varModel.fit(optimalLag)
    varFit.summary()
  exercise:
    prompt: 8단계. VAR 모델 적합 예제에서 \`optimalLag\`, \`varFit\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      optimalLag = lagOrder.aic
      varFit = varModel.fit(optimalLag)
      varFit.summary()
    hints:
    - 바꿀 지점은 \`optimalLag = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`optimalLag\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 8단계. VAR 모델 적합에서 \`optimalLag\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 8단계. VAR 모델 적합 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step9_granger
  title: 9단계. 그랜저 인과성
  structuredPrimary: true
  subtitle: 변수 간 인과관계
  goal: 9단계. 그랜저 인과성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    그랜저 인과성 검정은 한 변수의 과거값이 다른 변수를 예측하는 데 도움이 되는지 통계적으로 검정합니다. '소비가 GDP를 그랜저 인과한다'는 것은 GDP 예측에 소비의 과거값을 추가하면 예측이 개선된다는 의미입니다. 주의할 점은 그랜저 인과성은 진정한 인과관계가 아니라 '예측력'을 나타냅니다. 그러나 예측력은 정책 결정, 투자 전략 수립에 중요한 정보입니다.

    p-value가 0.05 미만이면 첫 번째 변수(Consumption)가 두 번째 변수(GDP)를 예측하는 데 도움이 됩니다. 이를 그랜저 인과성이라 하며, 진정한 인과관계는 아니지만 예측력을 나타냅니다.
  tips:
  - p-value가 0.05 미만이면 첫 번째 변수(Consumption)가 두 번째 변수(GDP)를 예측하는 데 도움이 됩니다. 이를 그랜저 인과성이라 하며, 진정한 인과관계는
    아니지만 예측력을 나타냅니다.
  snippet: |-
    grangerTest = grangercausalitytests(varDiff[['GDP', 'Consumption']], maxlag=4, verbose=False)

    grangerResults = []
    for lag, result in grangerTest.items():
        fTest = result[0]['ssr_ftest']
        grangerResults.append({
            'Lag': lag,
            'F-stat': fTest[0],
            'p-value': fTest[1]
        })

    grangerDf = pd.DataFrame(grangerResults)
    grangerDf
  exercise:
    prompt: 9단계. 그랜저 인과성 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      grangerTest = grangercausalitytests(varDiff[['GDP', 'Consumption']], maxlag=4, verbose=False)

      grangerResults = []
      for lag, result in grangerTest.items():
          fTest = result[0]['ssr_ftest']
          grangerResults.append({
              'Lag': lag,
              'F-stat': fTest[0],
              'p-value': fTest[1]
          })

      grangerDf = pd.DataFrame(grangerResults)
      grangerDf
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 9단계. 그랜저 인과성의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 9단계. 그랜저 인과성 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step10_granger_matrix
  title: 10단계. 인과성 매트릭스
  structuredPrimary: true
  subtitle: 모든 변수 쌍
  goal: 10단계. 인과성 매트릭스에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    모든 변수 쌍에 대해 그랜저 인과성을 검정하여 인과성 매트릭스를 만듭니다. 이 매트릭스를 보면 어떤 변수가 다른 변수를 예측하는 데 유용한지 한눈에 파악할 수 있습니다. 예를 들어 투자가 GDP를 그랜저 인과하지만 GDP는 투자를 그랜저 인과하지 않으면, 투자가 경기 선행지표임을 시사합니다. 양방향 인과성이 있으면 상호 피드백 관계입니다.

    행은 타겟(예측 대상), 열은 예측자(원인 변수)입니다. 예를 들어 GDP 행의 Consumption 열 p-value가 0.05 미만이면 소비가 GDP를 예측합니다.
  snippet: |-
    variables = ['GDP', 'Consumption', 'Investment']
    grangerMatrix = pd.DataFrame(index=variables, columns=variables)

    for target in variables:
        for predictor in variables:
            if target != predictor:
                testData = varDiff[[target, predictor]]
                result = grangercausalitytests(testData, maxlag=4, verbose=False)
                pValues = [result[lag][0]['ssr_ftest'][1] for lag in result]
                minPval = min(pValues)
                grangerMatrix.loc[target, predictor] = f"{minPval:.4f}"
            else:
                grangerMatrix.loc[target, predictor] = "-"

    grangerMatrix
  exercise:
    prompt: 10단계. 인과성 매트릭스 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      variables = ['GDP', 'Consumption', 'Investment']
      grangerMatrix = pd.DataFrame(index=variables, columns=variables)

      for target in variables:
          for predictor in variables:
              if target != predictor:
                  testData = varDiff[[target, predictor]]
                  result = grangercausalitytests(testData, maxlag=4, verbose=False)
                  pValues = [result[lag][0]['ssr_ftest'][1] for lag in result]
                  minPval = min(pValues)
                  grangerMatrix.loc[target, predictor] = f"{minPval:.4f}"
              else:
                  grangerMatrix.loc[target, predictor] = "-"

      grangerMatrix
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 10단계. 인과성 매트릭스의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 10단계. 인과성 매트릭스 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step11_granger_heatmap
  title: 11단계. 인과성 히트맵
  structuredPrimary: true
  subtitle: 그랜저 인과성 시각화
  goal: 11단계. 인과성 히트맵에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    그랜저 인과성 매트릭스를 히트맵으로 시각화하면 변수 간 인과 관계를 직관적으로 파악할 수 있습니다. p-value가 낮을수록(진한 색) 강한 인과성을 나타냅니다.

    빨간색(p < 0.05)은 강한 인과성, 녹색(p > 0.05)은 약한 인과성입니다. 행은 예측 대상, 열은 원인 변수입니다.
  snippet: |-
    import seaborn as sns
    import matplotlib.pyplot as plt

    grangerNumeric = grangerMatrix.replace('-', np.nan).astype(float)

    heatFig, heatAx = plt.subplots(figsize=(6, 5))
    sns.heatmap(grangerNumeric, annot=True, fmt='.4f', cmap='RdYlGn_r', ax=heatAx,
                cbar_kws={'label': 'p-value'}, vmin=0, vmax=0.1)
    heatAx.set_title('Granger Causality p-values\\n(Row: Target, Column: Predictor)')
    heatAx.set_xlabel('Predictor (Cause)')
    heatAx.set_ylabel('Target (Effect)')
    heatFig
  exercise:
    prompt: 11단계. 인과성 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      import seaborn as sns
      import matplotlib.pyplot as plt

      grangerNumeric = grangerMatrix.replace('-', np.nan).astype(float)

      heatFig, heatAx = plt.subplots(figsize=(6, 5))
      sns.heatmap(grangerNumeric, annot=True, fmt='.4f', cmap='RdYlGn_r', ax=heatAx,
                  cbar_kws={'label': 'p-value'}, vmin=0, vmax=0.1)
      heatAx.set_title('Granger Causality p-values\\n(Row: Target, Column: Predictor)')
      heatAx.set_xlabel('Predictor (Cause)')
      heatAx.set_ylabel('Target (Effect)')
      heatFig
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 11단계. 인과성 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 11단계. 인과성 히트맵의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step12_forecast
  title: 12단계. 다변량 예측
  structuredPrimary: true
  subtitle: 8분기 동시 예측
  goal: 12단계. 다변량 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: VAR 모델로 3개 변수를 동시에 8분기(2년) 예측합니다. VAR 예측의 장점은 변수 간 상호작용을 반영한다는 점입니다. 예를 들어 투자 감소 예측이 GDP
    예측에도 반영되어 더 현실적인 시나리오를 제공합니다. forecast()는 마지막 p기간의 실제 데이터를 기반으로 미래를 예측합니다. 다변량 예측은 정책 효과 분석, 시나리오
    플래닝에 핵심 도구입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    forecastSteps = 8
    varForecast = varFit.forecast(varDiff.values[-optimalLag:], steps=forecastSteps)

    forecastIdx = pd.date_range(start=varDiff.index[-1] + pd.DateOffset(months=3), periods=forecastSteps, freq='QS')

    forecastDf = pd.DataFrame(varForecast, index=forecastIdx, columns=varDiff.columns)
    forecastDf
  exercise:
    prompt: 12단계. 다변량 예측 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      forecastSteps = 8
      varForecast = varFit.forecast(varDiff.values[-optimalLag:], steps=forecastSteps)

      forecastIdx = pd.date_range(start=varDiff.index[-1] + pd.DateOffset(months=3), periods=forecastSteps, freq='QS')

      forecastDf = pd.DataFrame(varForecast, index=forecastIdx, columns=varDiff.columns)
      forecastDf
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 12단계. 다변량 예측의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 12단계. 다변량 예측의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step13_cumsum
  title: 13단계. 누적 예측
  structuredPrimary: true
  subtitle: 차분 복원
  goal: 13단계. 누적 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 차분된 값을 예측했으므로 cumsum()으로 원래 수준으로 복원합니다. 차분 예측값은 '전 분기 대비 변화량'이므로, 마지막 실제값에 이 변화량을 순차적으로
    더해 원래 수준의 GDP, 소비, 투자를 얻습니다. 이 과정을 '역차분(inverse differencing)'이라고 합니다. 복원된 예측값이 현실적인 범위에 있는지 확인해야
    합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    lastValues = varData.iloc[-1]

    forecastLevel = forecastDf.cumsum() + lastValues.values

    forecastLevelDf = forecastLevel.copy()
    forecastLevelDf
  exercise:
    prompt: 13단계. 누적 예측 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      lastValues = varData.iloc[-1]

      forecastLevel = forecastDf.cumsum() + lastValues.values

      forecastLevelDf = forecastLevel.copy()
      forecastLevelDf
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 13단계. 누적 예측에서 \`lastValues\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 13단계. 누적 예측 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step14_viz_forecast
  title: 14단계. 예측 시각화
  structuredPrimary: true
  subtitle: 역사 + 미래
  goal: 14단계. 예측 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: 실제값과 예측값을 함께 시각화하여 모델의 예측 성능을 직관적으로 평가합니다. 예측선이 실제 데이터의 추세와 자연스럽게 연결되는지, 3개 변수의 상대적 움직임이
    경제적으로 타당한지 확인합니다. 예를 들어 소비 예측이 증가하는데 GDP 예측이 감소하면 모델에 문제가 있을 수 있습니다. 시각화는 숫자로 보이지 않는 패턴을 발견하게 해줍니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    forecastVizFig = make_subplots(rows=3, cols=1, shared_xaxes=True,
                                    subplot_titles=('GDP Forecast', 'Consumption Forecast', 'Investment Forecast'))

    for i, col in enumerate(['GDP', 'Consumption', 'Investment']):
        forecastVizFig.add_trace(go.Scatter(x=varData.index, y=varData[col], name=f'{col} Actual', mode='lines'), row=i+1, col=1)
        forecastVizFig.add_trace(go.Scatter(x=forecastLevelDf.index, y=forecastLevelDf[col], name=f'{col} Forecast', mode='lines', line=dict(dash='dash')), row=i+1, col=1)

    forecastVizFig.update_layout(title='VAR Multivariate Forecast', height=700, showlegend=False)
    forecastVizFig.show()
  exercise:
    prompt: 14단계. 예측 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      forecastVizFig = make_subplots(rows=3, cols=1, shared_xaxes=True,
                                      subplot_titles=('GDP Forecast', 'Consumption Forecast', 'Investment Forecast'))

      for i, col in enumerate(['GDP', 'Consumption', 'Investment']):
          forecastVizFig.add_trace(go.Scatter(x=varData.index, y=varData[col], name=f'{col} Actual', mode='lines'), row=i+1, col=1)
          forecastVizFig.add_trace(go.Scatter(x=forecastLevelDf.index, y=forecastLevelDf[col], name=f'{col} Forecast', mode='lines', line=dict(dash='dash')), row=i+1, col=1)

      forecastVizFig.update_layout(title='VAR Multivariate Forecast', height=700, showlegend=False)
      forecastVizFig.show()
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 14단계. 예측 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 14단계. 예측 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step15_irf
  title: 15단계. 충격반응함수
  structuredPrimary: true
  subtitle: IRF 분석
  goal: 15단계. 충격반응함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    충격반응함수(Impulse Response Function, IRF)는 한 변수에 충격이 가해졌을 때 다른 변수가 시간에 따라 어떻게 반응하는지 보여줍니다. 예를 들어 '투자가 갑자기 1단위 증가하면 GDP는 1분기 후, 2분기 후, 3분기 후에 각각 얼마나 변하는가?'를 분석합니다. IRF는 정책 효과 분석의 핵심 도구입니다. 금리 인하가 투자와 GDP에 미치는 파급 효과를 시뮬레이션할 수 있습니다.

    irfs[t, i, j]는 시점 t에서 변수 j의 충격이 변수 i에 미치는 영향입니다. 양수면 같은 방향, 음수면 반대 방향 반응입니다.
  snippet: |-
    irf = varFit.irf(10)

    irfData = irf.irfs

    irfDf = pd.DataFrame({
        'Period': range(11),
        'Investment → GDP': irfData[:, 0, 2],
        'Consumption → GDP': irfData[:, 0, 1],
        'GDP → GDP': irfData[:, 0, 0]
    })
    irfDf
  exercise:
    prompt: 15단계. 충격반응함수 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      irf = varFit.irf(10)

      irfData = irf.irfs

      irfDf = pd.DataFrame({
          'Period': range(11),
          'Investment → GDP': irfData[:, 0, 2],
          'Consumption → GDP': irfData[:, 0, 1],
          'GDP → GDP': irfData[:, 0, 0]
      })
      irfDf
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 15단계. 충격반응함수의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 15단계. 충격반응함수의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step16_irf_viz
  title: 16단계. IRF 시각화
  structuredPrimary: true
  subtitle: 충격 전파 경로
  goal: 16단계. IRF 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: IRF를 시각화하여 충격의 전파 경로를 확인합니다. 충격 후 반응이 점차 0으로 수렴하면 충격이 일시적이고, 지속되면 영구적 효과가 있습니다. 투자 충격이
    GDP에 양의 반응을 유발하고 서서히 소멸하는 것이 일반적인 경제 패턴입니다. IRF 그래프는 경제 정책 보고서, 투자 전략 문서에서 자주 사용되는 시각화 방법입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    irfFig = go.Figure()
    irfFig.add_trace(go.Scatter(x=irfDf['Period'], y=irfDf['Investment → GDP'], mode='lines+markers', name='Investment → GDP'))
    irfFig.add_trace(go.Scatter(x=irfDf['Period'], y=irfDf['Consumption → GDP'], mode='lines+markers', name='Consumption → GDP'))
    irfFig.add_hline(y=0, line_dash='dash', line_color='gray')
    irfFig.update_layout(title='Impulse Response Function - Effect on GDP',
                         xaxis_title='Periods', yaxis_title='Response')
    irfFig.show()
  exercise:
    prompt: 16단계. IRF 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      irfFig = go.Figure()
      irfFig.add_trace(go.Scatter(x=irfDf['Period'], y=irfDf['Investment → GDP'], mode='lines+markers', name='Investment → GDP'))
      irfFig.add_trace(go.Scatter(x=irfDf['Period'], y=irfDf['Consumption → GDP'], mode='lines+markers', name='Consumption → GDP'))
      irfFig.add_hline(y=0, line_dash='dash', line_color='gray')
      irfFig.update_layout(title='Impulse Response Function - Effect on GDP',
                           xaxis_title='Periods', yaxis_title='Response')
      irfFig.show()
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 16단계. IRF 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.
    resultCheck: 16단계. IRF 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.
- id: step17_summary_stats
  title: 17단계. 종합 통계
  structuredPrimary: true
  subtitle: 모든 개념 정리
  goal: 17단계. 종합 통계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 01-10 프로젝트에서 배운 주요 통계량을 정리합니다. 각 분석 방법마다 핵심 지표가 다르므로, 상황에 맞는 지표를 사용해야 합니다. 회귀분석에서는 R²와
    p-value, 시계열에서는 AIC와 Durbin-Watson, 분류에서는 AUC, 가설검정에서는 p-value, VAR에서는 그랜저 인과성이 중요합니다. 이 지표들의 의미와
    좋은 값 기준을 정확히 이해하는 것이 데이터 분석의 기본입니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    summaryStats = pd.DataFrame({
        'Project': ['01-02 OLS', '03 Dummy', '04-09 ARIMA', '05 Logit', '07 Regression', '08 t-test', '10 VAR'],
        'Key Metric': ['R²', 'dtype=int', 'AIC', 'AUC', 'DW stat', 'p-value', 'Granger'],
        'Purpose': ['설명력', '더미변수 타입', '모델 선택', '분류 성능', '자기상관', '유의성', '인과성'],
        'Good Value': ['높을수록', 'int 필수', '낮을수록', '0.7 이상', '2 근처', '0.05 미만', '0.05 미만']
    })
    summaryStats
  exercise:
    prompt: 17단계. 종합 통계 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      summaryStats = pd.DataFrame({
          'Project': ['01-02 OLS', '03 Dummy', '04-09 ARIMA', '05 Logit', '07 Regression', '08 t-test', '10 VAR'],
          'Key Metric': ['R²', 'dtype=int', 'AIC', 'AUC', 'DW stat', 'p-value', 'Granger'],
          'Purpose': ['설명력', '더미변수 타입', '모델 선택', '분류 성능', '자기상관', '유의성', '인과성'],
          'Good Value': ['높을수록', 'int 필수', '낮을수록', '0.7 이상', '2 근처', '0.05 미만', '0.05 미만']
      })
      summaryStats
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 17단계. 종합 통계의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 17단계. 종합 통계의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 종합 분석 프로젝트
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    경제 분석가가 되어 다변량 시계열 분석을 수행합니다. VAR 분석은 중앙은행, 투자은행, 경제연구소에서 실제로 사용하는 고급 분석 기법입니다. 각 미션은 데이터 로딩부터 정상성 검정, VAR 모델링, 그랜저 인과성, IRF, 예측까지 전체 과정을 독립적으로 수행합니다. 본 프로젝트에서 배운 VAR, 그랜저 인과성, IRF를 실습을 통해 숙달해봅니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import pandas as pd
    import numpy as np
    import statsmodels.api as sm
    from statsmodels.tsa.api import VAR
    from statsmodels.tsa.stattools import grangercausalitytests

    iuMacro = sm.datasets.macrodata.load_pandas().data
    iuMacro['date'] = pd.to_datetime(iuMacro['year'].astype(int).astype(str) + '-' + (iuMacro['quarter'].astype(int) * 3 - 2).astype(str) + '-01')
    iuMacro = iuMacro.set_index('date')

    iuData = iuMacro[['infl', 'unemp']].copy()
    iuData.columns = ['Inflation', 'Unemployment']
    iuDiff = iuData.diff().dropna()
    iuDiff.head()
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import pandas as pd
      import numpy as np
      import statsmodels.api as sm
      from statsmodels.tsa.api import VAR
      from statsmodels.tsa.stattools import grangercausalitytests

      iuMacro = sm.datasets.macrodata.load_pandas().data
      iuMacro['date'] = pd.to_datetime(iuMacro['year'].astype(int).astype(str) + '-' + (iuMacro['quarter'].astype(int) * 3 - 2).astype(str) + '-01')
      iuMacro = iuMacro.set_index('date')

      iuData = iuMacro[['infl', 'unemp']].copy()
      iuData.columns = ['Inflation', 'Unemployment']
      iuDiff = iuData.diff().dropna()
      iuDiff.head()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: summary
  title: 정리
  subtitle: statsmodels 완료!
  blocks:
  - type: text
    content: 10개 프로젝트를 통해 statsmodels의 모든 핵심 기능을 마스터했습니다. 단순회귀부터 다중회귀, 로지스틱 회귀, 시계열 분석, 가설검정, 그리고 VAR
      다변량 분석까지 완주했습니다. 이제 데이터로 비즈니스 의사결정을 지원하고, 통계적 근거를 제시할 수 있습니다.
  - type: list
    items:
    - '01-02: OLS 회귀분석, R², p-value, 잔차분석'
    - '03: 더미변수, dtype=int, drop_first'
    - '04: ARIMA 시계열, 계절분해, 예측'
    - '05: 로지스틱 회귀, Logit, ROC-AUC'
    - '06: 다중회귀 심화, VIF, 다중공선성'
    - '07: 시계열 회귀, 외생변수, Durbin-Watson'
    - '08: t-test, ANOVA, 가설검정'
    - '09: ACF/PACF, ARIMA 파라미터 선택'
    - '10: VAR, 그랜저 인과성, IRF'
  - type: text
    content: 이제 실전 데이터에 이 기법들을 적용해보세요. 광고 ROI 분석, 고객 이탈 예측, 매출 예측, HR 분석 등 다양한 비즈니스 문제를 해결할 수 있습니다!
  goal: 정리에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.
- id: workflow_validation
  title: 업무 흐름 검증
  structuredPrimary: true
  subtitle: 회귀 리포트 품질 게이트
  goal: 업무 흐름 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: statsmodels 학습의 핵심은 모델을 만들고 summary를 보는 데서 끝나지 않는 것입니다. 먼저 어떤 변수가 유의할지 예측하고, 로컬 데이터의 컬럼과
    결측치를 검증하고, 회귀 결과가 보고서에 들어갈 수준인지 R², F-test, 잔차 진단으로 확인해야 합니다. 마지막에는 변수를 빼는 변주로 모델 선택의 근거를 비교합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import pandas as pd
    import statsmodels.api as sm
    from statsmodels.stats.diagnostic import het_breuschpagan
    from codaro.curriculum.localData import loadLocalDataset

    marketingData = loadLocalDataset("advertising")
    requiredColumns = ["TV", "Radio", "Newspaper", "Sales"]

    missingColumns = [column for column in requiredColumns if column not in marketingData.columns]
    if missingColumns:
        raise ValueError(f"필수 컬럼이 없습니다: {missingColumns}")
    if marketingData[requiredColumns].isna().any().any():
        raise ValueError("회귀분석 전 결측치를 처리해야 합니다.")

    reportY = marketingData["Sales"]
    reportX = sm.add_constant(marketingData[["TV", "Radio", "Newspaper"]])
    reportModel = sm.OLS(reportY, reportX).fit()

    marketingData[requiredColumns].head()
  exercise:
    prompt: 업무 흐름 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      compactX = sm.add_constant(marketingData[["TV", "Radio"]])
      compactModel = sm.OLS(reportY, compactX).fit()
      r2Drop = reportModel.rsquared - compactModel.rsquared

      assert compactModel.rsquared >= 0.95
      {
          "fullR2": round(reportModel.rsquared, 3),
          "compactR2": round(compactModel.rsquared, 3),
          "r2Drop": round(r2Drop, 3),
          "fullAIC": round(reportModel.aic, 1),
          "compactAIC": round(compactModel.aic, 1),
      }
    solution: |-
      import pandas as pd
      import statsmodels.api as sm
      from statsmodels.stats.diagnostic import het_breuschpagan
      from codaro.curriculum.localData import loadLocalDataset

      marketingData = loadLocalDataset("advertising")
      requiredColumns = ["TV", "Radio", "Newspaper", "Sales"]

      missingColumns = [column for column in requiredColumns if column not in marketingData.columns]
      if missingColumns:
          raise ValueError(f"필수 컬럼이 없습니다: {missingColumns}")
      if marketingData[requiredColumns].isna().any().any():
          raise ValueError("회귀분석 전 결측치를 처리해야 합니다.")

      marketingData[requiredColumns].head()
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 업무 흐름 검증에서 \`compactX\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
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
  - id: statsmodels_10-statistical-model-report-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_load
    - workflow_validation
    title: 종합 통계 모델 report의 필수 증거 검사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: estimand·design·coefficient·diagnostics·validation·claim을 모두 blocking stage로 둔다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - coefficient table만으로 report를 완료하지 마세요.
    - claim scope와 validation을 blocking section으로 유지하세요.
    exercise:
      prompt: audit_statistical_report(sections)를 완성하세요.
      starterCode: |-
        def audit_statistical_report(sections):
            raise NotImplementedError
      solution: |
        def audit_statistical_report(sections):
            required=["estimand","design","coefficients","diagnostics","validation","claimScope"]
            by_name={section["name"]:section for section in sections}; missing=[name for name in required if name not in by_name]
            failed=[name for name in required if name in by_name and by_name[name].get("status")!="approved"]
            return {"releaseReady":not missing and not failed,"missing":missing,"failed":failed,"evidenceRefs":[by_name[name].get("ref") for name in required if name in by_name]}
      hints: *id001
    check:
      id: python.statsmodels.statsmodels_10.statistical-model-report.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.statsmodels.statsmodels_10.statistical-model-report.mastery.behavior.v1.fixture
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
        entry: audit_statistical_report
        cases:
        - id: accepts-complete-report
          arguments:
          - value:
            - name: estimand
              status: approved
              ref: estimand.json
            - name: design
              status: approved
              ref: design.json
            - name: coefficients
              status: approved
              ref: coefficients.json
            - name: diagnostics
              status: approved
              ref: diagnostics.json
            - name: validation
              status: approved
              ref: validation.json
            - name: claimScope
              status: approved
              ref: claimScope.json
          expectedReturn:
            releaseReady: true
            missing: []
            failed: []
            evidenceRefs:
            - estimand.json
            - design.json
            - coefficients.json
            - diagnostics.json
            - validation.json
            - claimScope.json
        - id: reports-gaps
          arguments:
          - value:
            - name: estimand
              status: approved
              ref: e
            - name: design
              status: failed
              ref: d
          expectedReturn:
            releaseReady: false
            missing:
            - coefficients
            - diagnostics
            - validation
            - claimScope
            failed:
            - design
            evidenceRefs:
            - e
            - d
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: statsmodels_10-model-comparison-ledger-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - statsmodels_10-statistical-model-report-mastery
    title: 새 후보 모델 비교에 원장 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 같은 validation rows에서 metric·복잡도·가정 실패를 비교한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 모든 후보가 같은 validation rows를 사용해야 합니다.
    - 낮은 error와 가정 적합성의 tradeoff를 원장에 남기세요.
    exercise:
      prompt: select_statistical_model(models, maximum_failures)를 완성하세요.
      starterCode: |-
        def select_statistical_model(models, maximum_failures):
            raise NotImplementedError
      solution: |
        def select_statistical_model(models, maximum_failures):
            eligible=[model for model in models if len(model.get("assumptionFailures",[]))<=maximum_failures]
            if not eligible: return {"selected":None,"reason":"no-eligible-model"}
            selected=min(eligible,key=lambda model:(model["validationError"],model["parameterCount"],model["name"]))
            return {"selected":selected["name"],"validationError":selected["validationError"],"parameterCount":selected["parameterCount"],"assumptionFailures":selected.get("assumptionFailures",[])}
      hints: *id002
    check:
      id: python.statsmodels.statsmodels_10.model-comparison-ledger.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.statsmodels.statsmodels_10.model-comparison-ledger.transfer.behavior.v1.fixture
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
        entry: select_statistical_model
        cases:
        - id: selects-low-error-eligible
          arguments:
          - value:
            - name: simple
              validationError: 3
              parameterCount: 2
              assumptionFailures: []
            - name: complex
              validationError: 2
              parameterCount: 10
              assumptionFailures:
              - heteroskedasticity
          - value: 1
          expectedReturn:
            selected: complex
            validationError: 2
            parameterCount: 10
            assumptionFailures:
            - heteroskedasticity
        - id: breaks-error-tie-by-complexity
          arguments:
          - value:
            - name: a
              validationError: 2
              parameterCount: 5
              assumptionFailures: []
            - name: b
              validationError: 2
              parameterCount: 2
              assumptionFailures: []
          - value: 0
          expectedReturn:
            selected: b
            validationError: 2
            parameterCount: 2
            assumptionFailures: []
        - id: reports-no-eligible
          arguments:
          - value:
            - name: x
              validationError: 1
              parameterCount: 1
              assumptionFailures:
              - a
          - value: 0
          expectedReturn:
            selected: null
            reason: no-eligible-model
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: statsmodels_10-statistical-project-release-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - statsmodels_10-model-comparison-ledger-transfer
    title: 종합 통계 project 증거 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 추정·진단·검증·claim을 분리한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 계수·불확실성·가정 진단을 한 묶음으로 해석하세요.
    - 통계적 연관을 인과 효과나 개인 확정 예측으로 확대하지 마세요.
    exercise:
      prompt: choose_statistical_release_evidence(situation)를 완성해 method, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_statistical_release_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_statistical_release_evidence(situation):
            table = {'coefficient-claim': {'method': 'estimate interval units', 'evidence': 'design and covariance', 'risk': 'p-value only'}, 'model-adequacy': {'method': 'residual and assumption diagnostics', 'evidence': 'plots tests effect', 'risk': 'single test'}, 'release-conclusion': {'method': 'validation plus claim review', 'evidence': 'out-of-sample and scope', 'risk': 'association as causation'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.statsmodels.statsmodels_10.statistical-project-release.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.statsmodels.statsmodels_10.statistical-project-release.retrieval.behavior.v1.fixture
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
        entry: choose_statistical_release_evidence
        cases:
        - id: recalls-coefficient-claim
          arguments:
          - value: coefficient-claim
          expectedReturn:
            method: estimate interval units
            evidence: design and covariance
            risk: p-value only
        - id: recalls-model-adequacy
          arguments:
          - value: model-adequacy
          expectedReturn:
            method: residual and assumption diagnostics
            evidence: plots tests effect
            risk: single test
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};