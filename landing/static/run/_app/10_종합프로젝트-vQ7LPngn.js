var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - plotly\r
  - seaborn\r
  - statsmodels\r
  id: statsmodels_10\r
  title: 종합프로젝트\r
  order: 10\r
  category: statsmodels\r
  difficulty: ⭐⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - VAR\r
  - 종합분석\r
  - 다변량시계열\r
  - 그랜저인과\r
  - 경제예측\r
  - 포트폴리오\r
  seo:\r
    title: statsmodels 종합 프로젝트 - VAR과 전체 개념 정리\r
    description: VAR 모델로 다변량 시계열을 예측합니다. 01-09 프로젝트의 모든 개념을 종합합니다.\r
    keywords:\r
    - statsmodels\r
    - VAR\r
    - 다변량시계열\r
    - 그랜저인과\r
    - 경제예측\r
    - 종합분석\r
intro:\r
  emoji: 🏆\r
  goal: 01-09 프로젝트의 모든 개념을 종합하여 다변량 시계열 분석을 완성합니다\r
  description: VAR(Vector Autoregression) 모델로 여러 경제 지표를 동시에 예측합니다. 그랜저 인과성 검정, 충격반응함수 등 고급 시계열 분석 기법을\r
    배웁니다.\r
  direction: 종합프로젝트에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 종합프로젝트 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 분석 변수 선택 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 시계열 시각화 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 종합프로젝트 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: matplotlib, numpy, pandas, plotly 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합프로젝트 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 종합프로젝트 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 미국 거시경제 데이터\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 07 프로젝트에서 사용한 macrodata를 다시 활용합니다. 이번에는 GDP, 소비, 투자를 동시에 예측하는 다변량 모델을 구축합니다. 단변량 ARIMA는\r
    한 변수만 분석하지만, VAR(Vector Autoregression)은 여러 변수가 서로 영향을 주고받는 관계를 모델링합니다. 경제 변수들은 상호 의존적이므로 VAR이 더 현실적인\r
    예측을 제공합니다. 중앙은행, 투자기관에서 거시경제 예측에 VAR을 표준 도구로 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    import statsmodels.api as sm\r
    from statsmodels.tsa.api import VAR\r
    from statsmodels.tsa.stattools import adfuller, grangercausalitytests\r
    import plotly.express as px\r
    import plotly.graph_objects as go\r
    from plotly.subplots import make_subplots\r
\r
    macro = sm.datasets.macrodata.load_pandas().data\r
    macro['date'] = pd.to_datetime(macro['year'].astype(int).astype(str) + '-' + (macro['quarter'].astype(int) * 3 - 2).astype(str) + '-01')\r
    macro = macro.set_index('date')\r
    macro.shape\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      import statsmodels.api as sm\r
      from statsmodels.tsa.api import VAR\r
      from statsmodels.tsa.stattools import adfuller, grangercausalitytests\r
      import plotly.express as px\r
      import plotly.graph_objects as go\r
      from plotly.subplots import make_subplots\r
\r
      macro = sm.datasets.macrodata.load_pandas().data\r
      macro['date'] = pd.to_datetime(macro['year'].astype(int).astype(str) + '-' + (macro['quarter'].astype(int) * 3 - 2).astype(str) + '-01')\r
      macro = macro.set_index('date')\r
      macro.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_select_vars\r
  title: 2단계. 분석 변수 선택\r
  structuredPrimary: true\r
  subtitle: GDP, 소비, 투자\r
  goal: 2단계. 분석 변수 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: GDP(realgdp), 소비(realcons), 투자(realinv) 3개 변수를 선택합니다. 경제학에서 GDP = 소비 + 투자 + 정부지출 + 순수출(Y\r
    = C + I + G + NX)이므로 이 변수들은 밀접하게 연관되어 있습니다. 소비가 증가하면 GDP가 증가하고, GDP 증가는 다시 소비를 촉진하는 피드백 관계가 존재합니다.\r
    VAR은 이런 상호 의존성을 명시적으로 모델링하여 한 변수의 변화가 다른 변수에 미치는 영향을 추적할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    varData = macro[['realgdp', 'realcons', 'realinv']].copy()\r
    varData.columns = ['GDP', 'Consumption', 'Investment']\r
    varData.head()\r
  exercise:\r
    prompt: 2단계. 분석 변수 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      varData = macro[['realgdp', 'realcons', 'realinv']].copy()\r
      varData.columns = ['GDP', 'Consumption', 'Investment']\r
      varData.head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 분석 변수 선택에서 \`varData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 분석 변수 선택 실행 뒤 \`varData\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step3_viz\r
  title: 3단계. 시계열 시각화\r
  structuredPrimary: true\r
  subtitle: 3개 변수 추세\r
  goal: 3단계. 시계열 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 3개 변수의 시계열을 함께 시각화합니다. 다변량 분석에서는 변수들이 비슷한 추세를 보이는지, 한 변수가 다른 변수보다 먼저 움직이는지(선행/후행 관계) 시각적으로\r
    확인합니다. 예를 들어 투자가 GDP보다 먼저 하락하면 투자가 경기 선행지표일 수 있습니다. 이런 관찰은 이후 그랜저 인과성 검정으로 통계적으로 검증합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    varFig = make_subplots(rows=3, cols=1, shared_xaxes=True,\r
                           subplot_titles=('GDP', 'Consumption', 'Investment'))\r
\r
    varFig.add_trace(go.Scatter(x=varData.index, y=varData['GDP'], name='GDP'), row=1, col=1)\r
    varFig.add_trace(go.Scatter(x=varData.index, y=varData['Consumption'], name='Consumption'), row=2, col=1)\r
    varFig.add_trace(go.Scatter(x=varData.index, y=varData['Investment'], name='Investment'), row=3, col=1)\r
\r
    varFig.update_layout(title='Multivariate Time Series', height=600, showlegend=False)\r
    varFig.show()\r
  exercise:\r
    prompt: 3단계. 시계열 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      varFig = make_subplots(rows=3, cols=1, shared_xaxes=True,\r
                             subplot_titles=('GDP', 'Consumption', 'Investment'))\r
\r
      varFig.add_trace(go.Scatter(x=varData.index, y=varData['GDP'], name='GDP'), row=1, col=1)\r
      varFig.add_trace(go.Scatter(x=varData.index, y=varData['Consumption'], name='Consumption'), row=2, col=1)\r
      varFig.add_trace(go.Scatter(x=varData.index, y=varData['Investment'], name='Investment'), row=3, col=1)\r
\r
      varFig.update_layout(title='Multivariate Time Series', height=600, showlegend=False)\r
      varFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 시계열 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 시계열 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step4_stationarity\r
  title: 4단계. 정상성 검정\r
  structuredPrimary: true\r
  subtitle: 모든 변수 ADF\r
  goal: 4단계. 정상성 검정에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: VAR 모델도 정상 시계열을 가정하므로 모든 변수에 ADF 검정을 적용합니다. GDP, 소비, 투자 같은 경제 수준 변수는 대부분 추세가 있어 비정상입니다.\r
    모든 변수가 정상이어야 VAR을 적용할 수 있으므로, 비정상 변수가 하나라도 있으면 전체 데이터에 차분을 적용해야 합니다. 일부 변수만 정상이고 일부는 비정상인 경우, 일관성을\r
    위해 모두 차분하는 것이 일반적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    adfResults = []\r
    for col in varData.columns:\r
        adfTest = adfuller(varData[col])\r
        adfResults.append({\r
            'Variable': col,\r
            'ADF Stat': adfTest[0],\r
            'p-value': adfTest[1],\r
            'Stationary': 'Yes' if adfTest[1] < 0.05 else 'No'\r
        })\r
\r
    adfDf = pd.DataFrame(adfResults)\r
    adfDf\r
  exercise:\r
    prompt: 4단계. 정상성 검정 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      adfResults = []\r
      for col in varData.columns:\r
          adfTest = adfuller(varData[col])\r
          adfResults.append({\r
              'Variable': col,\r
              'ADF Stat': adfTest[0],\r
              'p-value': adfTest[1],\r
              'Stationary': 'Yes' if adfTest[1] < 0.05 else 'No'\r
          })\r
\r
      adfDf = pd.DataFrame(adfResults)\r
      adfDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 정상성 검정의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 4단계. 정상성 검정 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step5_diff\r
  title: 5단계. 차분 적용\r
  structuredPrimary: true\r
  subtitle: 정상성 확보\r
  goal: 5단계. 차분 적용에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 모든 변수에 1차 차분을 적용하여 정상성을 확보합니다. 차분된 변수는 '변화량'을 의미합니다. GDP 차분은 전 분기 대비 GDP 증가량, 소비 차분은 소비\r
    증가량입니다. 차분 후 ADF 검정으로 모든 변수가 정상화되었는지 확인합니다. 차분된 데이터로 VAR을 적합하면 '변화량 간의 관계'를 모델링하게 되며, 예측 후 누적합으로 원래\r
    수준을 복원합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    varDiff = varData.diff().dropna()\r
\r
    adfDiffResults = []\r
    for col in varDiff.columns:\r
        adfTest = adfuller(varDiff[col])\r
        adfDiffResults.append({\r
            'Variable': col,\r
            'ADF Stat': adfTest[0],\r
            'p-value': adfTest[1],\r
            'Stationary': 'Yes' if adfTest[1] < 0.05 else 'No'\r
        })\r
\r
    adfDiffDf = pd.DataFrame(adfDiffResults)\r
    adfDiffDf\r
  exercise:\r
    prompt: 5단계. 차분 적용 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      varDiff = varData.diff().dropna()\r
\r
      adfDiffResults = []\r
      for col in varDiff.columns:\r
          adfTest = adfuller(varDiff[col])\r
          adfDiffResults.append({\r
              'Variable': col,\r
              'ADF Stat': adfTest[0],\r
              'p-value': adfTest[1],\r
              'Stationary': 'Yes' if adfTest[1] < 0.05 else 'No'\r
          })\r
\r
      adfDiffDf = pd.DataFrame(adfDiffResults)\r
      adfDiffDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 차분 적용의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 5단계. 차분 적용 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step6_var_intro\r
  title: 6단계. VAR 모델 소개\r
  structuredPrimary: true\r
  subtitle: 벡터 자기회귀\r
  goal: 6단계. VAR 모델 소개에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: VAR(Vector Autoregression)은 여러 시계열을 동시에 모델링합니다. VAR에서 각 변수는 자신의 과거값뿐 아니라 다른 변수의 과거값에도 영향을\r
    받습니다. 예를 들어 오늘의 GDP는 어제의 GDP, 어제의 소비, 어제의 투자 모두에 의해 결정됩니다. 이런 상호 의존성을 통해 변수 간 동적 관계를 포착할 수 있습니다. 단변량\r
    AR 모델은 다른 변수의 영향이 없는 VAR의 특수한 경우입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    varModel = VAR(varDiff)\r
    varModel.select_order(maxlags=8)\r
  exercise:\r
    prompt: 6단계. VAR 모델 소개 예제에서 \`varModel\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      varModel = VAR(varDiff)\r
      varModel.select_order(maxlags=8)\r
    hints:\r
    - 바꿀 지점은 \`varModel = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`varModel\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. VAR 모델 소개에서 \`varModel\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. VAR 모델 소개 실행 뒤 \`varModel\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step7_lag_selection\r
  title: 7단계. 시차 선택\r
  structuredPrimary: true\r
  subtitle: AIC, BIC 기준\r
  goal: 7단계. 시차 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: AIC/BIC 기준으로 최적 시차(lag)를 선택합니다. VAR(p)에서 p는 몇 기간 전까지의 값을 사용할지 결정합니다. VAR(2)면 2기간 전까지의 GDP,\r
    소비, 투자가 현재 값에 영향을 미친다고 가정합니다. 시차가 너무 작으면 중요한 패턴을 놓치고, 너무 크면 파라미터가 많아져 과적합됩니다. select_order()가 여러 시차에\r
    대해 AIC/BIC를 계산하여 최적 시차를 제안합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lagOrder = varModel.select_order(maxlags=8)\r
    lagOrderDf = pd.DataFrame(lagOrder.summary().data[1:], columns=lagOrder.summary().data[0])\r
    lagOrderDf\r
  exercise:\r
    prompt: 7단계. 시차 선택 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      lagOrder = varModel.select_order(maxlags=8)\r
      lagOrderDf = pd.DataFrame(lagOrder.summary().data[1:], columns=lagOrder.summary().data[0])\r
      lagOrderDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 시차 선택의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 7단계. 시차 선택의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step8_fit\r
  title: 8단계. VAR 모델 적합\r
  structuredPrimary: true\r
  subtitle: 최적 시차로 학습\r
  goal: 8단계. VAR 모델 적합에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: AIC가 가장 낮은 시차로 VAR 모델을 적합합니다. fit() 후 summary()를 확인하면 각 변수에 대한 회귀식을 볼 수 있습니다. GDP 방정식에서\r
    소비의 과거값 계수가 양수면 과거 소비 증가가 현재 GDP 증가에 기여한다는 의미입니다. 이런 계수 해석을 통해 변수 간 동적 관계를 파악할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    optimalLag = lagOrder.aic\r
    varFit = varModel.fit(optimalLag)\r
    varFit.summary()\r
  exercise:\r
    prompt: 8단계. VAR 모델 적합 예제에서 \`optimalLag\`, \`varFit\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      optimalLag = lagOrder.aic\r
      varFit = varModel.fit(optimalLag)\r
      varFit.summary()\r
    hints:\r
    - 바꿀 지점은 \`optimalLag = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`optimalLag\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. VAR 모델 적합에서 \`optimalLag\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. VAR 모델 적합 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_granger\r
  title: 9단계. 그랜저 인과성\r
  structuredPrimary: true\r
  subtitle: 변수 간 인과관계\r
  goal: 9단계. 그랜저 인과성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    그랜저 인과성 검정은 한 변수의 과거값이 다른 변수를 예측하는 데 도움이 되는지 통계적으로 검정합니다. '소비가 GDP를 그랜저 인과한다'는 것은 GDP 예측에 소비의 과거값을 추가하면 예측이 개선된다는 의미입니다. 주의할 점은 그랜저 인과성은 진정한 인과관계가 아니라 '예측력'을 나타냅니다. 그러나 예측력은 정책 결정, 투자 전략 수립에 중요한 정보입니다.\r
\r
    p-value가 0.05 미만이면 첫 번째 변수(Consumption)가 두 번째 변수(GDP)를 예측하는 데 도움이 됩니다. 이를 그랜저 인과성이라 하며, 진정한 인과관계는 아니지만 예측력을 나타냅니다.\r
  tips:\r
  - p-value가 0.05 미만이면 첫 번째 변수(Consumption)가 두 번째 변수(GDP)를 예측하는 데 도움이 됩니다. 이를 그랜저 인과성이라 하며, 진정한 인과관계는\r
    아니지만 예측력을 나타냅니다.\r
  snippet: |-\r
    grangerTest = grangercausalitytests(varDiff[['GDP', 'Consumption']], maxlag=4, verbose=False)\r
\r
    grangerResults = []\r
    for lag, result in grangerTest.items():\r
        fTest = result[0]['ssr_ftest']\r
        grangerResults.append({\r
            'Lag': lag,\r
            'F-stat': fTest[0],\r
            'p-value': fTest[1]\r
        })\r
\r
    grangerDf = pd.DataFrame(grangerResults)\r
    grangerDf\r
  exercise:\r
    prompt: 9단계. 그랜저 인과성 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      grangerTest = grangercausalitytests(varDiff[['GDP', 'Consumption']], maxlag=4, verbose=False)\r
\r
      grangerResults = []\r
      for lag, result in grangerTest.items():\r
          fTest = result[0]['ssr_ftest']\r
          grangerResults.append({\r
              'Lag': lag,\r
              'F-stat': fTest[0],\r
              'p-value': fTest[1]\r
          })\r
\r
      grangerDf = pd.DataFrame(grangerResults)\r
      grangerDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 그랜저 인과성의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 그랜저 인과성 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_granger_matrix\r
  title: 10단계. 인과성 매트릭스\r
  structuredPrimary: true\r
  subtitle: 모든 변수 쌍\r
  goal: 10단계. 인과성 매트릭스에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    모든 변수 쌍에 대해 그랜저 인과성을 검정하여 인과성 매트릭스를 만듭니다. 이 매트릭스를 보면 어떤 변수가 다른 변수를 예측하는 데 유용한지 한눈에 파악할 수 있습니다. 예를 들어 투자가 GDP를 그랜저 인과하지만 GDP는 투자를 그랜저 인과하지 않으면, 투자가 경기 선행지표임을 시사합니다. 양방향 인과성이 있으면 상호 피드백 관계입니다.\r
\r
    행은 타겟(예측 대상), 열은 예측자(원인 변수)입니다. 예를 들어 GDP 행의 Consumption 열 p-value가 0.05 미만이면 소비가 GDP를 예측합니다.\r
  snippet: |-\r
    variables = ['GDP', 'Consumption', 'Investment']\r
    grangerMatrix = pd.DataFrame(index=variables, columns=variables)\r
\r
    for target in variables:\r
        for predictor in variables:\r
            if target != predictor:\r
                testData = varDiff[[target, predictor]]\r
                result = grangercausalitytests(testData, maxlag=4, verbose=False)\r
                pValues = [result[lag][0]['ssr_ftest'][1] for lag in result]\r
                minPval = min(pValues)\r
                grangerMatrix.loc[target, predictor] = f"{minPval:.4f}"\r
            else:\r
                grangerMatrix.loc[target, predictor] = "-"\r
\r
    grangerMatrix\r
  exercise:\r
    prompt: 10단계. 인과성 매트릭스 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      variables = ['GDP', 'Consumption', 'Investment']\r
      grangerMatrix = pd.DataFrame(index=variables, columns=variables)\r
\r
      for target in variables:\r
          for predictor in variables:\r
              if target != predictor:\r
                  testData = varDiff[[target, predictor]]\r
                  result = grangercausalitytests(testData, maxlag=4, verbose=False)\r
                  pValues = [result[lag][0]['ssr_ftest'][1] for lag in result]\r
                  minPval = min(pValues)\r
                  grangerMatrix.loc[target, predictor] = f"{minPval:.4f}"\r
              else:\r
                  grangerMatrix.loc[target, predictor] = "-"\r
\r
      grangerMatrix\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 인과성 매트릭스의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 인과성 매트릭스 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step11_granger_heatmap\r
  title: 11단계. 인과성 히트맵\r
  structuredPrimary: true\r
  subtitle: 그랜저 인과성 시각화\r
  goal: 11단계. 인과성 히트맵에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    그랜저 인과성 매트릭스를 히트맵으로 시각화하면 변수 간 인과 관계를 직관적으로 파악할 수 있습니다. p-value가 낮을수록(진한 색) 강한 인과성을 나타냅니다.\r
\r
    빨간색(p < 0.05)은 강한 인과성, 녹색(p > 0.05)은 약한 인과성입니다. 행은 예측 대상, 열은 원인 변수입니다.\r
  snippet: |-\r
    import seaborn as sns\r
    import matplotlib.pyplot as plt\r
\r
    grangerNumeric = grangerMatrix.replace('-', np.nan).astype(float)\r
\r
    heatFig, heatAx = plt.subplots(figsize=(6, 5))\r
    sns.heatmap(grangerNumeric, annot=True, fmt='.4f', cmap='RdYlGn_r', ax=heatAx,\r
                cbar_kws={'label': 'p-value'}, vmin=0, vmax=0.1)\r
    heatAx.set_title('Granger Causality p-values\\n(Row: Target, Column: Predictor)')\r
    heatAx.set_xlabel('Predictor (Cause)')\r
    heatAx.set_ylabel('Target (Effect)')\r
    heatFig\r
  exercise:\r
    prompt: 11단계. 인과성 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      import matplotlib.pyplot as plt\r
\r
      grangerNumeric = grangerMatrix.replace('-', np.nan).astype(float)\r
\r
      heatFig, heatAx = plt.subplots(figsize=(6, 5))\r
      sns.heatmap(grangerNumeric, annot=True, fmt='.4f', cmap='RdYlGn_r', ax=heatAx,\r
                  cbar_kws={'label': 'p-value'}, vmin=0, vmax=0.1)\r
      heatAx.set_title('Granger Causality p-values\\n(Row: Target, Column: Predictor)')\r
      heatAx.set_xlabel('Predictor (Cause)')\r
      heatAx.set_ylabel('Target (Effect)')\r
      heatFig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 인과성 히트맵의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 인과성 히트맵의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step12_forecast\r
  title: 12단계. 다변량 예측\r
  structuredPrimary: true\r
  subtitle: 8분기 동시 예측\r
  goal: 12단계. 다변량 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: VAR 모델로 3개 변수를 동시에 8분기(2년) 예측합니다. VAR 예측의 장점은 변수 간 상호작용을 반영한다는 점입니다. 예를 들어 투자 감소 예측이 GDP\r
    예측에도 반영되어 더 현실적인 시나리오를 제공합니다. forecast()는 마지막 p기간의 실제 데이터를 기반으로 미래를 예측합니다. 다변량 예측은 정책 효과 분석, 시나리오\r
    플래닝에 핵심 도구입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    forecastSteps = 8\r
    varForecast = varFit.forecast(varDiff.values[-optimalLag:], steps=forecastSteps)\r
\r
    forecastIdx = pd.date_range(start=varDiff.index[-1] + pd.DateOffset(months=3), periods=forecastSteps, freq='QS')\r
\r
    forecastDf = pd.DataFrame(varForecast, index=forecastIdx, columns=varDiff.columns)\r
    forecastDf\r
  exercise:\r
    prompt: 12단계. 다변량 예측 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      forecastSteps = 8\r
      varForecast = varFit.forecast(varDiff.values[-optimalLag:], steps=forecastSteps)\r
\r
      forecastIdx = pd.date_range(start=varDiff.index[-1] + pd.DateOffset(months=3), periods=forecastSteps, freq='QS')\r
\r
      forecastDf = pd.DataFrame(varForecast, index=forecastIdx, columns=varDiff.columns)\r
      forecastDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 다변량 예측의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 다변량 예측의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step13_cumsum\r
  title: 13단계. 누적 예측\r
  structuredPrimary: true\r
  subtitle: 차분 복원\r
  goal: 13단계. 누적 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 차분된 값을 예측했으므로 cumsum()으로 원래 수준으로 복원합니다. 차분 예측값은 '전 분기 대비 변화량'이므로, 마지막 실제값에 이 변화량을 순차적으로\r
    더해 원래 수준의 GDP, 소비, 투자를 얻습니다. 이 과정을 '역차분(inverse differencing)'이라고 합니다. 복원된 예측값이 현실적인 범위에 있는지 확인해야\r
    합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lastValues = varData.iloc[-1]\r
\r
    forecastLevel = forecastDf.cumsum() + lastValues.values\r
\r
    forecastLevelDf = forecastLevel.copy()\r
    forecastLevelDf\r
  exercise:\r
    prompt: 13단계. 누적 예측 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      lastValues = varData.iloc[-1]\r
\r
      forecastLevel = forecastDf.cumsum() + lastValues.values\r
\r
      forecastLevelDf = forecastLevel.copy()\r
      forecastLevelDf\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 누적 예측에서 \`lastValues\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 13단계. 누적 예측 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step14_viz_forecast\r
  title: 14단계. 예측 시각화\r
  structuredPrimary: true\r
  subtitle: 역사 + 미래\r
  goal: 14단계. 예측 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 실제값과 예측값을 함께 시각화하여 모델의 예측 성능을 직관적으로 평가합니다. 예측선이 실제 데이터의 추세와 자연스럽게 연결되는지, 3개 변수의 상대적 움직임이\r
    경제적으로 타당한지 확인합니다. 예를 들어 소비 예측이 증가하는데 GDP 예측이 감소하면 모델에 문제가 있을 수 있습니다. 시각화는 숫자로 보이지 않는 패턴을 발견하게 해줍니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    forecastVizFig = make_subplots(rows=3, cols=1, shared_xaxes=True,\r
                                    subplot_titles=('GDP Forecast', 'Consumption Forecast', 'Investment Forecast'))\r
\r
    for i, col in enumerate(['GDP', 'Consumption', 'Investment']):\r
        forecastVizFig.add_trace(go.Scatter(x=varData.index, y=varData[col], name=f'{col} Actual', mode='lines'), row=i+1, col=1)\r
        forecastVizFig.add_trace(go.Scatter(x=forecastLevelDf.index, y=forecastLevelDf[col], name=f'{col} Forecast', mode='lines', line=dict(dash='dash')), row=i+1, col=1)\r
\r
    forecastVizFig.update_layout(title='VAR Multivariate Forecast', height=700, showlegend=False)\r
    forecastVizFig.show()\r
  exercise:\r
    prompt: 14단계. 예측 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      forecastVizFig = make_subplots(rows=3, cols=1, shared_xaxes=True,\r
                                      subplot_titles=('GDP Forecast', 'Consumption Forecast', 'Investment Forecast'))\r
\r
      for i, col in enumerate(['GDP', 'Consumption', 'Investment']):\r
          forecastVizFig.add_trace(go.Scatter(x=varData.index, y=varData[col], name=f'{col} Actual', mode='lines'), row=i+1, col=1)\r
          forecastVizFig.add_trace(go.Scatter(x=forecastLevelDf.index, y=forecastLevelDf[col], name=f'{col} Forecast', mode='lines', line=dict(dash='dash')), row=i+1, col=1)\r
\r
      forecastVizFig.update_layout(title='VAR Multivariate Forecast', height=700, showlegend=False)\r
      forecastVizFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 예측 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 14단계. 예측 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step15_irf\r
  title: 15단계. 충격반응함수\r
  structuredPrimary: true\r
  subtitle: IRF 분석\r
  goal: 15단계. 충격반응함수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    충격반응함수(Impulse Response Function, IRF)는 한 변수에 충격이 가해졌을 때 다른 변수가 시간에 따라 어떻게 반응하는지 보여줍니다. 예를 들어 '투자가 갑자기 1단위 증가하면 GDP는 1분기 후, 2분기 후, 3분기 후에 각각 얼마나 변하는가?'를 분석합니다. IRF는 정책 효과 분석의 핵심 도구입니다. 금리 인하가 투자와 GDP에 미치는 파급 효과를 시뮬레이션할 수 있습니다.\r
\r
    irfs[t, i, j]는 시점 t에서 변수 j의 충격이 변수 i에 미치는 영향입니다. 양수면 같은 방향, 음수면 반대 방향 반응입니다.\r
  snippet: |-\r
    irf = varFit.irf(10)\r
\r
    irfData = irf.irfs\r
\r
    irfDf = pd.DataFrame({\r
        'Period': range(11),\r
        'Investment → GDP': irfData[:, 0, 2],\r
        'Consumption → GDP': irfData[:, 0, 1],\r
        'GDP → GDP': irfData[:, 0, 0]\r
    })\r
    irfDf\r
  exercise:\r
    prompt: 15단계. 충격반응함수 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      irf = varFit.irf(10)\r
\r
      irfData = irf.irfs\r
\r
      irfDf = pd.DataFrame({\r
          'Period': range(11),\r
          'Investment → GDP': irfData[:, 0, 2],\r
          'Consumption → GDP': irfData[:, 0, 1],\r
          'GDP → GDP': irfData[:, 0, 0]\r
      })\r
      irfDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 충격반응함수의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 15단계. 충격반응함수의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step16_irf_viz\r
  title: 16단계. IRF 시각화\r
  structuredPrimary: true\r
  subtitle: 충격 전파 경로\r
  goal: 16단계. IRF 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: IRF를 시각화하여 충격의 전파 경로를 확인합니다. 충격 후 반응이 점차 0으로 수렴하면 충격이 일시적이고, 지속되면 영구적 효과가 있습니다. 투자 충격이\r
    GDP에 양의 반응을 유발하고 서서히 소멸하는 것이 일반적인 경제 패턴입니다. IRF 그래프는 경제 정책 보고서, 투자 전략 문서에서 자주 사용되는 시각화 방법입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    irfFig = go.Figure()\r
    irfFig.add_trace(go.Scatter(x=irfDf['Period'], y=irfDf['Investment → GDP'], mode='lines+markers', name='Investment → GDP'))\r
    irfFig.add_trace(go.Scatter(x=irfDf['Period'], y=irfDf['Consumption → GDP'], mode='lines+markers', name='Consumption → GDP'))\r
    irfFig.add_hline(y=0, line_dash='dash', line_color='gray')\r
    irfFig.update_layout(title='Impulse Response Function - Effect on GDP',\r
                         xaxis_title='Periods', yaxis_title='Response')\r
    irfFig.show()\r
  exercise:\r
    prompt: 16단계. IRF 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      irfFig = go.Figure()\r
      irfFig.add_trace(go.Scatter(x=irfDf['Period'], y=irfDf['Investment → GDP'], mode='lines+markers', name='Investment → GDP'))\r
      irfFig.add_trace(go.Scatter(x=irfDf['Period'], y=irfDf['Consumption → GDP'], mode='lines+markers', name='Consumption → GDP'))\r
      irfFig.add_hline(y=0, line_dash='dash', line_color='gray')\r
      irfFig.update_layout(title='Impulse Response Function - Effect on GDP',\r
                           xaxis_title='Periods', yaxis_title='Response')\r
      irfFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 16단계. IRF 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 16단계. IRF 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step17_summary_stats\r
  title: 17단계. 종합 통계\r
  structuredPrimary: true\r
  subtitle: 모든 개념 정리\r
  goal: 17단계. 종합 통계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 01-10 프로젝트에서 배운 주요 통계량을 정리합니다. 각 분석 방법마다 핵심 지표가 다르므로, 상황에 맞는 지표를 사용해야 합니다. 회귀분석에서는 R²와\r
    p-value, 시계열에서는 AIC와 Durbin-Watson, 분류에서는 AUC, 가설검정에서는 p-value, VAR에서는 그랜저 인과성이 중요합니다. 이 지표들의 의미와\r
    좋은 값 기준을 정확히 이해하는 것이 데이터 분석의 기본입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    summaryStats = pd.DataFrame({\r
        'Project': ['01-02 OLS', '03 Dummy', '04-09 ARIMA', '05 Logit', '07 Regression', '08 t-test', '10 VAR'],\r
        'Key Metric': ['R²', 'dtype=int', 'AIC', 'AUC', 'DW stat', 'p-value', 'Granger'],\r
        'Purpose': ['설명력', '더미변수 타입', '모델 선택', '분류 성능', '자기상관', '유의성', '인과성'],\r
        'Good Value': ['높을수록', 'int 필수', '낮을수록', '0.7 이상', '2 근처', '0.05 미만', '0.05 미만']\r
    })\r
    summaryStats\r
  exercise:\r
    prompt: 17단계. 종합 통계 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      summaryStats = pd.DataFrame({\r
          'Project': ['01-02 OLS', '03 Dummy', '04-09 ARIMA', '05 Logit', '07 Regression', '08 t-test', '10 VAR'],\r
          'Key Metric': ['R²', 'dtype=int', 'AIC', 'AUC', 'DW stat', 'p-value', 'Granger'],\r
          'Purpose': ['설명력', '더미변수 타입', '모델 선택', '분류 성능', '자기상관', '유의성', '인과성'],\r
          'Good Value': ['높을수록', 'int 필수', '낮을수록', '0.7 이상', '2 근처', '0.05 미만', '0.05 미만']\r
      })\r
      summaryStats\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 17단계. 종합 통계의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 17단계. 종합 통계의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 종합 분석 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    경제 분석가가 되어 다변량 시계열 분석을 수행합니다. VAR 분석은 중앙은행, 투자은행, 경제연구소에서 실제로 사용하는 고급 분석 기법입니다. 각 미션은 데이터 로딩부터 정상성 검정, VAR 모델링, 그랜저 인과성, IRF, 예측까지 전체 과정을 독립적으로 수행합니다. 본 프로젝트에서 배운 VAR, 그랜저 인과성, IRF를 실습을 통해 숙달해봅니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    import statsmodels.api as sm\r
    from statsmodels.tsa.api import VAR\r
    from statsmodels.tsa.stattools import grangercausalitytests\r
\r
    iuMacro = sm.datasets.macrodata.load_pandas().data\r
    iuMacro['date'] = pd.to_datetime(iuMacro['year'].astype(int).astype(str) + '-' + (iuMacro['quarter'].astype(int) * 3 - 2).astype(str) + '-01')\r
    iuMacro = iuMacro.set_index('date')\r
\r
    iuData = iuMacro[['infl', 'unemp']].copy()\r
    iuData.columns = ['Inflation', 'Unemployment']\r
    iuDiff = iuData.diff().dropna()\r
    iuDiff.head()\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      import statsmodels.api as sm\r
      from statsmodels.tsa.api import VAR\r
      from statsmodels.tsa.stattools import grangercausalitytests\r
\r
      iuMacro = sm.datasets.macrodata.load_pandas().data\r
      iuMacro['date'] = pd.to_datetime(iuMacro['year'].astype(int).astype(str) + '-' + (iuMacro['quarter'].astype(int) * 3 - 2).astype(str) + '-01')\r
      iuMacro = iuMacro.set_index('date')\r
\r
      iuData = iuMacro[['infl', 'unemp']].copy()\r
      iuData.columns = ['Inflation', 'Unemployment']\r
      iuDiff = iuData.diff().dropna()\r
      iuDiff.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: statsmodels 완료!\r
  blocks:\r
  - type: text\r
    content: 10개 프로젝트를 통해 statsmodels의 모든 핵심 기능을 마스터했습니다. 단순회귀부터 다중회귀, 로지스틱 회귀, 시계열 분석, 가설검정, 그리고 VAR\r
      다변량 분석까지 완주했습니다. 이제 데이터로 비즈니스 의사결정을 지원하고, 통계적 근거를 제시할 수 있습니다.\r
  - type: list\r
    items:\r
    - '01-02: OLS 회귀분석, R², p-value, 잔차분석'\r
    - '03: 더미변수, dtype=int, drop_first'\r
    - '04: ARIMA 시계열, 계절분해, 예측'\r
    - '05: 로지스틱 회귀, Logit, ROC-AUC'\r
    - '06: 다중회귀 심화, VIF, 다중공선성'\r
    - '07: 시계열 회귀, 외생변수, Durbin-Watson'\r
    - '08: t-test, ANOVA, 가설검정'\r
    - '09: ACF/PACF, ARIMA 파라미터 선택'\r
    - '10: VAR, 그랜저 인과성, IRF'\r
  - type: text\r
    content: 이제 실전 데이터에 이 기법들을 적용해보세요. 광고 ROI 분석, 고객 이탈 예측, 매출 예측, HR 분석 등 다양한 비즈니스 문제를 해결할 수 있습니다!\r
  goal: 정리에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: workflow_validation\r
  title: 업무 흐름 검증\r
  structuredPrimary: true\r
  subtitle: 회귀 리포트 품질 게이트\r
  goal: 업무 흐름 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: statsmodels 학습의 핵심은 모델을 만들고 summary를 보는 데서 끝나지 않는 것입니다. 먼저 어떤 변수가 유의할지 예측하고, 로컬 데이터의 컬럼과\r
    결측치를 검증하고, 회귀 결과가 보고서에 들어갈 수준인지 R², F-test, 잔차 진단으로 확인해야 합니다. 마지막에는 변수를 빼는 변주로 모델 선택의 근거를 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    import statsmodels.api as sm\r
    from statsmodels.stats.diagnostic import het_breuschpagan\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    marketingData = loadLocalDataset("advertising")\r
    requiredColumns = ["TV", "Radio", "Newspaper", "Sales"]\r
\r
    missingColumns = [column for column in requiredColumns if column not in marketingData.columns]\r
    if missingColumns:\r
        raise ValueError(f"필수 컬럼이 없습니다: {missingColumns}")\r
    if marketingData[requiredColumns].isna().any().any():\r
        raise ValueError("회귀분석 전 결측치를 처리해야 합니다.")\r
\r
    reportY = marketingData["Sales"]\r
    reportX = sm.add_constant(marketingData[["TV", "Radio", "Newspaper"]])\r
    reportModel = sm.OLS(reportY, reportX).fit()\r
\r
    marketingData[requiredColumns].head()\r
  exercise:\r
    prompt: 업무 흐름 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      compactX = sm.add_constant(marketingData[["TV", "Radio"]])\r
      compactModel = sm.OLS(reportY, compactX).fit()\r
      r2Drop = reportModel.rsquared - compactModel.rsquared\r
\r
      assert compactModel.rsquared >= 0.95\r
      {\r
          "fullR2": round(reportModel.rsquared, 3),\r
          "compactR2": round(compactModel.rsquared, 3),\r
          "r2Drop": round(r2Drop, 3),\r
          "fullAIC": round(reportModel.aic, 1),\r
          "compactAIC": round(compactModel.aic, 1),\r
      }\r
    solution: |-\r
      import pandas as pd\r
      import statsmodels.api as sm\r
      from statsmodels.stats.diagnostic import het_breuschpagan\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      marketingData = loadLocalDataset("advertising")\r
      requiredColumns = ["TV", "Radio", "Newspaper", "Sales"]\r
\r
      missingColumns = [column for column in requiredColumns if column not in marketingData.columns]\r
      if missingColumns:\r
          raise ValueError(f"필수 컬럼이 없습니다: {missingColumns}")\r
      if marketingData[requiredColumns].isna().any().any():\r
          raise ValueError("회귀분석 전 결측치를 처리해야 합니다.")\r
\r
      marketingData[requiredColumns].head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 업무 흐름 검증에서 \`compactX\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 업무 흐름 검증에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
`;export{e as default};