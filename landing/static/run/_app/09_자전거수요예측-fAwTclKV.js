var e=`meta:\r
  packages:\r
  - numpy\r
  - pandas\r
  - plotly\r
  - statsmodels\r
  id: statsmodels_09\r
  title: 자전거수요예측\r
  order: 9\r
  category: statsmodels\r
  difficulty: ⭐⭐⭐⭐⭐\r
  badge: 심화\r
  dataSource: codaro-local:bike_demand\r
  tags:\r
  - ARIMA\r
  - ACF\r
  - PACF\r
  - 시계열예측\r
  - 자전거공유\r
  - 수요예측\r
  seo:\r
    title: statsmodels ARIMA 심화 - ACF/PACF로 시계열 예측하기\r
    description: ACF, PACF로 ARIMA 파라미터를 선택합니다. 자전거 수요 데이터로 시계열 예측을 마스터합니다.\r
    keywords:\r
    - statsmodels\r
    - ARIMA\r
    - ACF\r
    - PACF\r
    - 시계열예측\r
    - 자전거공유\r
    - 수요예측\r
intro:\r
  emoji: 🚴\r
  goal: ACF/PACF 분석으로 최적 ARIMA 모델을 구축하고 수요를 예측합니다\r
  description: 시계열 데이터의 자기상관 패턴을 분석하여 ARIMA 파라미터를 결정합니다. 04 프로젝트의 ARIMA 기초를 심화하여 실전 수요 예측 능력을 기릅니다.\r
  direction: 자전거수요예측에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 자전거수요예측 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 시계열 탐색 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 기술통계량 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 자전거수요예측 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: numpy, pandas, plotly, scikit-learn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 자전거수요예측 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 자전거수요예측 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 일별 시계열 데이터\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 일별 자전거 대여 수요 데이터를 사용합니다. 1년 동안의 날짜별 Demand 값에 주중/주말 차이, 계절성, 완만한 증가 추세가 들어 있어 ARIMA 분석\r
    실습에 적합합니다. 실제 비즈니스에서 수요 예측은 재고 관리, 인력 배치, 마케팅 계획 수립에 핵심적인 역할을 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    import statsmodels.api as sm\r
    from statsmodels.tsa.arima.model import ARIMA\r
    from statsmodels.tsa.stattools import adfuller, acf, pacf\r
    from statsmodels.graphics.tsaplots import plot_acf, plot_pacf\r
    import plotly.express as px\r
    import plotly.graph_objects as go\r
    from plotly.subplots import make_subplots\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    demandData = loadLocalDataset("bike_demand")\r
    demandData['Date'] = pd.to_datetime(demandData['Date'])\r
    demandData = demandData.set_index('Date')\r
    demandData.shape\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      import statsmodels.api as sm\r
      from statsmodels.tsa.arima.model import ARIMA\r
      from statsmodels.tsa.stattools import adfuller, acf, pacf\r
      from statsmodels.graphics.tsaplots import plot_acf, plot_pacf\r
      import plotly.express as px\r
      import plotly.graph_objects as go\r
      from plotly.subplots import make_subplots\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      demandData = loadLocalDataset("bike_demand")\r
      demandData['Date'] = pd.to_datetime(demandData['Date'])\r
      demandData = demandData.set_index('Date')\r
      demandData.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_explore\r
  title: 2단계. 시계열 탐색\r
  structuredPrimary: true\r
  subtitle: 데이터 패턴 확인\r
  goal: 2단계. 시계열 탐색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 시계열의 추세, 계절성, 불규칙성을 시각적으로 확인합니다. 시계열 시각화는 데이터에 숨겨진 패턴을 발견하는 첫 단계입니다. 전체적으로 상승 또는 하락하는 추세가\r
    있는지, 특정 주기로 반복되는 패턴이 있는지, 갑작스러운 급등이나 급락이 있는지 관찰합니다. 일별 데이터는 주말/평일 패턴이나 월말 효과가 나타날 수 있어 이런 특성을 파악해야\r
    적절한 모델을 선택할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    demandFig = px.line(demandData, y='Demand',\r
                        title='Daily Demand Time Series',\r
                        labels={'Date': 'Date', 'Demand': 'Daily Demand'})\r
    demandFig.show()\r
  exercise:\r
    prompt: 2단계. 시계열 탐색 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      demandFig = px.line(demandData, y='Demand',\r
                          title='Daily Demand Time Series',\r
                          labels={'Date': 'Date', 'Demand': 'Daily Demand'})\r
      demandFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 시계열 탐색의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 2단계. 시계열 탐색의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step3_stats\r
  title: 3단계. 기술통계량\r
  structuredPrimary: true\r
  subtitle: 기본 특성 파악\r
  goal: 3단계. 기술통계량에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 평균, 표준편차, 최소/최대값으로 시계열의 기본 특성을 파악합니다. 평균은 수요의 일반적인 수준을, 표준편차는 변동성의 크기를 나타냅니다. 최소/최대값의 차이가\r
    크면 극단적인 상황(폭염, 폭우 등)에 대비해야 합니다. 기술통계는 간단하지만 데이터의 전체적인 특성을 빠르게 파악할 수 있어, 이후 모델링 결과를 해석할 때 기준점이 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    statsDf = pd.DataFrame({\r
        'Statistic': ['Mean', 'Std', 'Min', 'Max', 'Count'],\r
        'Value': [demandData['Demand'].mean(), demandData['Demand'].std(),\r
                 demandData['Demand'].min(), demandData['Demand'].max(), len(demandData)]\r
    })\r
    statsDf\r
  exercise:\r
    prompt: 3단계. 기술통계량 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      statsDf = pd.DataFrame({\r
          'Statistic': ['Mean', 'Std', 'Min', 'Max', 'Count'],\r
          'Value': [demandData['Demand'].mean(), demandData['Demand'].std(),\r
                   demandData['Demand'].min(), demandData['Demand'].max(), len(demandData)]\r
      })\r
      statsDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 기술통계량의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. 기술통계량의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step4_adf_test\r
  title: 4단계. 정상성 검정\r
  structuredPrimary: true\r
  subtitle: ADF 테스트\r
  goal: 4단계. 정상성 검정에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    ARIMA 모델은 정상(stationary) 시계열을 가정합니다. 정상성이란 시계열의 평균과 분산이 시간에 따라 변하지 않는 성질입니다. 주가처럼 계속 상승하는 데이터는 비정상이고, 그 차이(일별 수익률)는 정상입니다. ADF(Augmented Dickey-Fuller) 검정은 정상성을 통계적으로 검정하며, p-value가 0.05 미만이면 '이 시계열은 정상이다'라고 결론짓습니다. 비정상 시계열에 ARIMA를 적용하면 잘못된 예측이 나올 수 있습니다.\r
\r
    ADF Statistic이 음수이고 절대값이 클수록 정상성 증거가 강합니다. p-value가 0.05 미만이면 귀무가설(비정상)을 기각하고 정상 시계열로 판단합니다.\r
  snippet: |-\r
    adfResult = adfuller(demandData['Demand'])\r
    adfDf = pd.DataFrame({\r
        'Metric': ['ADF Statistic', 'p-value', 'Lags Used', 'Observations'],\r
        'Value': [adfResult[0], adfResult[1], adfResult[2], adfResult[3]]\r
    })\r
    adfDf\r
  exercise:\r
    prompt: 4단계. 정상성 검정 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      adfResult = adfuller(demandData['Demand'])\r
      adfDf = pd.DataFrame({\r
          'Metric': ['ADF Statistic', 'p-value', 'Lags Used', 'Observations'],\r
          'Value': [adfResult[0], adfResult[1], adfResult[2], adfResult[3]]\r
      })\r
      adfDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 정상성 검정의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 정상성 검정의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_diff\r
  title: 5단계. 차분\r
  structuredPrimary: true\r
  subtitle: 비정상성 제거\r
  goal: 5단계. 차분에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    정상성을 확보하기 위해 차분(differencing)을 적용합니다. 차분은 현재 값에서 이전 값을 빼는 연산으로, 추세를 제거하여 정상 시계열로 변환합니다. ARIMA(p,d,q)에서 d가 차분 횟수를 나타내며, 1차 차분으로 정상성이 확보되면 d=1을 사용합니다. 대부분의 경제/비즈니스 시계열은 1차 또는 2차 차분으로 정상화됩니다. 차분 후 ADF 검정으로 정상성이 확보되었는지 반드시 확인해야 합니다.\r
\r
    diff()는 현재 값에서 이전 값을 뺍니다. 첫 번째 값은 NaN이 되므로 dropna()로 제거합니다. 차분 후 p-value가 0.05 미만이면 d=1이 적절합니다.\r
  snippet: |-\r
    demandDiff = demandData['Demand'].diff().dropna()\r
\r
    diffFig = px.line(x=demandDiff.index, y=demandDiff.values,\r
                      title='Differenced Series (d=1)',\r
                      labels={'x': 'Date', 'y': 'Differenced Demand'})\r
    diffFig.show()\r
\r
    adfDiffResult = adfuller(demandDiff)\r
    f"Differenced ADF p-value: {adfDiffResult[1]:.4f}"\r
  exercise:\r
    prompt: 5단계. 차분 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      demandDiff = demandData['Demand'].diff().dropna()\r
\r
      diffFig = px.line(x=demandDiff.index, y=demandDiff.values,\r
                        title='Differenced Series (d=1)',\r
                        labels={'x': 'Date', 'y': 'Differenced Demand'})\r
      diffFig.show()\r
\r
      adfDiffResult = adfuller(demandDiff)\r
      f"Differenced ADF p-value: {adfDiffResult[1]:.4f}"\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 차분의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. 차분의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_acf_intro\r
  title: 6단계. ACF 소개\r
  structuredPrimary: true\r
  subtitle: 자기상관함수\r
  goal: 6단계. ACF 소개에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: ACF(Autocorrelation Function)는 시계열과 자신의 과거 값 간 상관관계를 보여줍니다. 예를 들어 lag=1의 ACF는 오늘 수요와 어제\r
    수요의 상관계수입니다. ACF가 높으면 과거 값이 현재 값을 예측하는 데 유용하다는 의미입니다. ARIMA 모델에서 MA(q)의 q 파라미터는 ACF 패턴을 분석하여 결정합니다.\r
    ACF가 특정 lag 이후 급격히 0으로 떨어지면 그 lag가 q 후보가 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    acfValues = acf(demandData['Demand'], nlags=20)\r
\r
    acfDf = pd.DataFrame({\r
        'Lag': range(len(acfValues)),\r
        'ACF': acfValues\r
    })\r
    acfDf.head(10)\r
  exercise:\r
    prompt: 6단계. ACF 소개 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      acfValues = acf(demandData['Demand'], nlags=20)\r
\r
      acfDf = pd.DataFrame({\r
          'Lag': range(len(acfValues)),\r
          'ACF': acfValues\r
      })\r
      acfDf.head(10)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. ACF 소개의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 6단계. ACF 소개의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step7_acf_plot\r
  title: 7단계. ACF 시각화\r
  structuredPrimary: true\r
  subtitle: 상관관계 패턴\r
  goal: 7단계. ACF 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    ACF 플롯에서 빨간 점선(95% 신뢰구간)을 벗어나는 막대가 통계적으로 유의미한 자기상관입니다. 신뢰구간은 무작위 데이터에서도 우연히 나타날 수 있는 상관의 범위를 나타냅니다. ACF 패턴 해석이 ARIMA 파라미터 선택의 핵심입니다. ACF가 지수적으로 천천히 감소하면 AR 성분이 있고, 특정 lag에서 급격히 0으로 떨어지면 MA 성분을 나타냅니다.\r
\r
    신뢰구간(점선)을 벗어나는 막대가 통계적으로 유의미한 자기상관입니다. ACF가 서서히 감소하면 AR 성분이 있고, 급격히 0으로 떨어지면 MA 성분을 나타냅니다.\r
  snippet: |-\r
    confInt = 1.96 / np.sqrt(len(demandData))\r
\r
    acfFig = go.Figure()\r
    acfFig.add_trace(go.Bar(x=list(range(len(acfValues))), y=acfValues, name='ACF'))\r
    acfFig.add_hline(y=confInt, line_dash='dash', line_color='red', annotation_text='95% CI')\r
    acfFig.add_hline(y=-confInt, line_dash='dash', line_color='red')\r
    acfFig.add_hline(y=0, line_color='black')\r
    acfFig.update_layout(title='Autocorrelation Function (ACF)',\r
                         xaxis_title='Lag', yaxis_title='ACF')\r
    acfFig.show()\r
  exercise:\r
    prompt: 7단계. ACF 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      confInt = 1.96 / np.sqrt(len(demandData))\r
\r
      acfFig = go.Figure()\r
      acfFig.add_trace(go.Bar(x=list(range(len(acfValues))), y=acfValues, name='ACF'))\r
      acfFig.add_hline(y=confInt, line_dash='dash', line_color='red', annotation_text='95% CI')\r
      acfFig.add_hline(y=-confInt, line_dash='dash', line_color='red')\r
      acfFig.add_hline(y=0, line_color='black')\r
      acfFig.update_layout(title='Autocorrelation Function (ACF)',\r
                           xaxis_title='Lag', yaxis_title='ACF')\r
      acfFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. ACF 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 7단계. ACF 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step8_pacf_intro\r
  title: 8단계. PACF 소개\r
  structuredPrimary: true\r
  subtitle: 편자기상관함수\r
  goal: 8단계. PACF 소개에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: PACF(Partial ACF)는 중간 시차의 영향을 제거한 순수 상관관계입니다. 예를 들어 lag=2의 PACF는 lag=1의 영향을 제거한 후 오늘과 그저께의\r
    직접적인 상관만 측정합니다. AR(p)의 p 파라미터는 PACF 패턴으로 결정합니다. PACF가 lag p 이후 급격히 0으로 떨어지면 AR(p)가 적절합니다. ACF와 PACF를\r
    함께 분석하면 AR, MA, 또는 ARMA 중 어떤 모델이 적합한지 판단할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pacfValues = pacf(demandData['Demand'], nlags=20)\r
\r
    pacfDf = pd.DataFrame({\r
        'Lag': range(len(pacfValues)),\r
        'PACF': pacfValues\r
    })\r
    pacfDf.head(10)\r
  exercise:\r
    prompt: 8단계. PACF 소개 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      pacfValues = pacf(demandData['Demand'], nlags=20)\r
\r
      pacfDf = pd.DataFrame({\r
          'Lag': range(len(pacfValues)),\r
          'PACF': pacfValues\r
      })\r
      pacfDf.head(10)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. PACF 소개의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 8단계. PACF 소개의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step9_pacf_plot\r
  title: 9단계. PACF 시각화\r
  structuredPrimary: true\r
  subtitle: AR 파라미터 결정\r
  goal: 9단계. PACF 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: PACF 플롯에서 신뢰구간을 벗어나는 초기 시차들이 AR(p)의 p 후보입니다. 예를 들어 lag 1, 2만 신뢰구간을 벗어나고 lag 3부터 구간 내에 있으면\r
    AR(2)가 적절합니다. PACF 해석 규칙은 'cut-off' 패턴을 찾는 것으로, 특정 시점 이후 갑자기 0 근처로 떨어지는 패턴을 찾습니다. 이 분석이 시계열 모델링에서\r
    가장 중요한 기술 중 하나입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pacfFig = go.Figure()\r
    pacfFig.add_trace(go.Bar(x=list(range(len(pacfValues))), y=pacfValues, name='PACF'))\r
    pacfFig.add_hline(y=confInt, line_dash='dash', line_color='red', annotation_text='95% CI')\r
    pacfFig.add_hline(y=-confInt, line_dash='dash', line_color='red')\r
    pacfFig.add_hline(y=0, line_color='black')\r
    pacfFig.update_layout(title='Partial Autocorrelation Function (PACF)',\r
                          xaxis_title='Lag', yaxis_title='PACF')\r
    pacfFig.show()\r
  exercise:\r
    prompt: 9단계. PACF 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      pacfFig = go.Figure()\r
      pacfFig.add_trace(go.Bar(x=list(range(len(pacfValues))), y=pacfValues, name='PACF'))\r
      pacfFig.add_hline(y=confInt, line_dash='dash', line_color='red', annotation_text='95% CI')\r
      pacfFig.add_hline(y=-confInt, line_dash='dash', line_color='red')\r
      pacfFig.add_hline(y=0, line_color='black')\r
      pacfFig.update_layout(title='Partial Autocorrelation Function (PACF)',\r
                            xaxis_title='Lag', yaxis_title='PACF')\r
      pacfFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. PACF 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 9단계. PACF 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step10_acf_pacf_combined\r
  title: 10단계. ACF/PACF 종합\r
  structuredPrimary: true\r
  subtitle: 파라미터 결정 규칙\r
  goal: 10단계. ACF/PACF 종합에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    ACF와 PACF 패턴으로 ARIMA(p,d,q)를 결정합니다. 핵심 규칙은 다음과 같습니다. ACF가 지수적으로 감소하고 PACF가 cut-off되면 AR(p) 모델을, PACF가 지수적으로 감소하고 ACF가 cut-off되면 MA(q) 모델을 선택합니다. 둘 다 서서히 감소하면 ARMA(p,q) 모델이 필요합니다. 이 규칙을 외우는 것보다 여러 데이터로 실습하며 패턴 인식 능력을 기르는 것이 중요합니다.\r
\r
    AR(p) 모델에서는 ACF가 지수적으로 감소하고 PACF가 lag p 이후 급격히 0이 됩니다. MA(q) 모델에서는 PACF가 지수적으로 감소하고 ACF가 lag q 이후 급격히 0이 됩니다.\r
  tips:\r
  - AR(p) 모델에서는 ACF가 지수적으로 감소하고 PACF가 lag p 이후 급격히 0이 됩니다. MA(q) 모델에서는 PACF가 지수적으로 감소하고 ACF가 lag q 이후\r
    급격히 0이 됩니다.\r
  snippet: |-\r
    combinedFig = make_subplots(rows=1, cols=2, subplot_titles=('ACF', 'PACF'))\r
\r
    combinedFig.add_trace(go.Bar(x=list(range(len(acfValues))), y=acfValues, name='ACF'), row=1, col=1)\r
    combinedFig.add_trace(go.Bar(x=list(range(len(pacfValues))), y=pacfValues, name='PACF'), row=1, col=2)\r
\r
    combinedFig.add_hline(y=confInt, line_dash='dash', line_color='red', row=1, col=1)\r
    combinedFig.add_hline(y=-confInt, line_dash='dash', line_color='red', row=1, col=1)\r
    combinedFig.add_hline(y=confInt, line_dash='dash', line_color='red', row=1, col=2)\r
    combinedFig.add_hline(y=-confInt, line_dash='dash', line_color='red', row=1, col=2)\r
\r
    combinedFig.update_layout(title='ACF and PACF Comparison', showlegend=False)\r
    combinedFig.show()\r
  exercise:\r
    prompt: 10단계. ACF/PACF 종합 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      combinedFig = make_subplots(rows=1, cols=2, subplot_titles=('ACF', 'PACF'))\r
\r
      combinedFig.add_trace(go.Bar(x=list(range(len(acfValues))), y=acfValues, name='ACF'), row=1, col=1)\r
      combinedFig.add_trace(go.Bar(x=list(range(len(pacfValues))), y=pacfValues, name='PACF'), row=1, col=2)\r
\r
      combinedFig.add_hline(y=confInt, line_dash='dash', line_color='red', row=1, col=1)\r
      combinedFig.add_hline(y=-confInt, line_dash='dash', line_color='red', row=1, col=1)\r
      combinedFig.add_hline(y=confInt, line_dash='dash', line_color='red', row=1, col=2)\r
      combinedFig.add_hline(y=-confInt, line_dash='dash', line_color='red', row=1, col=2)\r
\r
      combinedFig.update_layout(title='ACF and PACF Comparison', showlegend=False)\r
      combinedFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. ACF/PACF 종합의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 10단계. ACF/PACF 종합의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step11_arima_fit\r
  title: 11단계. ARIMA 모델 적합\r
  structuredPrimary: true\r
  subtitle: 파라미터 적용\r
  goal: 11단계. ARIMA 모델 적합에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: ACF/PACF 분석 결과를 바탕으로 ARIMA 모델을 구축합니다. ACF/PACF에서 얻은 p, q 후보값으로 모델을 적합하고 결과를 확인합니다. ARIMA(1,0,1)은\r
    AR(1)과 MA(1)을 결합한 모델로, 어제 값과 어제의 예측 오차가 오늘 값에 영향을 미친다고 가정합니다. summary()로 계수의 유의성, AIC, BIC 등 모델 품질\r
    지표를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    arimaModel = ARIMA(demandData['Demand'], order=(1, 0, 1))\r
    arimaFit = arimaModel.fit()\r
    arimaFit.summary()\r
  exercise:\r
    prompt: 11단계. ARIMA 모델 적합 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      arimaModel = ARIMA(demandData['Demand'], order=(1, 0, 1))\r
      arimaFit = arimaModel.fit()\r
      arimaFit.summary()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. ARIMA 모델 적합에서 \`arimaModel\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. ARIMA 모델 적합 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step12_model_comparison\r
  title: 12단계. 모델 비교\r
  structuredPrimary: true\r
  subtitle: AIC로 선택\r
  goal: 12단계. 모델 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    여러 ARIMA 파라미터 조합의 AIC를 비교하여 최적 모델을 선택합니다. AIC(Akaike Information Criterion)는 모델의 적합도와 복잡도를 동시에 고려하는 지표로, 낮을수록 좋습니다. 파라미터가 많으면 적합도는 좋지만 과적합 위험이 있어 AIC가 불이익을 줍니다. BIC(Bayesian IC)도 유사한 목적이지만 복잡도에 더 큰 패널티를 부여합니다. 실무에서는 AIC와 BIC가 모두 낮은 모델을 선택합니다.\r
\r
    AIC(Akaike Information Criterion)는 모델 복잡도와 적합도의 균형을 평가합니다. 파라미터가 많으면 적합도는 좋지만 과적합 위험이 있습니다. AIC가 가장 낮은 모델을 선택합니다.\r
  tips:\r
  - AIC(Akaike Information Criterion)는 모델 복잡도와 적합도의 균형을 평가합니다. 파라미터가 많으면 적합도는 좋지만 과적합 위험이 있습니다. AIC가 가장\r
    낮은 모델을 선택합니다.\r
  snippet: |-\r
    orders = [(1, 0, 0), (0, 0, 1), (1, 0, 1), (2, 0, 1), (1, 0, 2), (2, 0, 2)]\r
    aicResults = []\r
\r
    for order in orders:\r
        modelTemp = ARIMA(demandData['Demand'], order=order)\r
        fitTemp = modelTemp.fit()\r
        aicResults.append({\r
            'Order': f"ARIMA{order}",\r
            'AIC': fitTemp.aic,\r
            'BIC': fitTemp.bic\r
        })\r
\r
    aicDf = pd.DataFrame(aicResults).sort_values('AIC')\r
    aicDf\r
  exercise:\r
    prompt: 12단계. 모델 비교 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      orders = [(1, 0, 0), (0, 0, 1), (1, 0, 1), (2, 0, 1), (1, 0, 2), (2, 0, 2)]\r
      aicResults = []\r
\r
      for order in orders:\r
          modelTemp = ARIMA(demandData['Demand'], order=order)\r
          fitTemp = modelTemp.fit()\r
          aicResults.append({\r
              'Order': f"ARIMA{order}",\r
              'AIC': fitTemp.aic,\r
              'BIC': fitTemp.bic\r
          })\r
\r
      aicDf = pd.DataFrame(aicResults).sort_values('AIC')\r
      aicDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 모델 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 12단계. 모델 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step13_best_model\r
  title: 13단계. 최적 모델 선택\r
  structuredPrimary: true\r
  subtitle: 최저 AIC 모델\r
  goal: 13단계. 최적 모델 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: AIC가 가장 낮은 모델을 최종 선택합니다. 모델 선택은 단순히 AIC만 보는 것이 아니라, ACF/PACF 분석 결과와의 일관성, 계수의 통계적 유의성,\r
    비즈니스 해석 가능성도 함께 고려해야 합니다. 최적 모델로 예측과 잔차 분석을 수행하여 모델이 데이터의 패턴을 제대로 포착했는지 검증합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    bestOrder = (2, 0, 2)\r
    bestModel = ARIMA(demandData['Demand'], order=bestOrder)\r
    bestFit = bestModel.fit()\r
\r
    f"Best Model: ARIMA{bestOrder}, AIC: {bestFit.aic:.2f}"\r
  exercise:\r
    prompt: 13단계. 최적 모델 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      bestOrder = (2, 0, 2)\r
      bestModel = ARIMA(demandData['Demand'], order=bestOrder)\r
      bestFit = bestModel.fit()\r
\r
      f"Best Model: ARIMA{bestOrder}, AIC: {bestFit.aic:.2f}"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 최적 모델 선택에서 \`bestOrder\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 13단계. 최적 모델 선택 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step14_residual_analysis\r
  title: 14단계. 잔차 분석\r
  structuredPrimary: true\r
  subtitle: 모델 진단\r
  goal: 14단계. 잔차 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    잔차 분석으로 ARIMA 모델의 적합성을 진단합니다. 좋은 모델이라면 잔차가 백색잡음(white noise), 즉 무작위하고 자기상관이 없어야 합니다. 잔차에 패턴이 남아있다면 모델이 시계열의 모든 정보를 포착하지 못한 것입니다. 잔차의 ACF가 모든 시차에서 신뢰구간 내에 있으면 잔차가 백색잡음이라고 판단합니다. 이 조건이 충족되어야 예측값을 신뢰할 수 있습니다.\r
\r
    잔차의 ACF가 모두 신뢰구간 내에 있으면 잔차가 백색잡음입니다. 이는 모델이 시계열의 모든 패턴을 포착했다는 뜻입니다.\r
  snippet: |-\r
    residuals = bestFit.resid\r
    residAcf = acf(residuals, nlags=20)\r
\r
    residAcfFig = go.Figure()\r
    residAcfFig.add_trace(go.Bar(x=list(range(len(residAcf))), y=residAcf, name='Residual ACF'))\r
    residAcfFig.add_hline(y=confInt, line_dash='dash', line_color='red')\r
    residAcfFig.add_hline(y=-confInt, line_dash='dash', line_color='red')\r
    residAcfFig.add_hline(y=0, line_color='black')\r
    residAcfFig.update_layout(title='Residual ACF - Check for White Noise',\r
                              xaxis_title='Lag', yaxis_title='ACF')\r
    residAcfFig.show()\r
  exercise:\r
    prompt: 14단계. 잔차 분석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      residuals = bestFit.resid\r
      residAcf = acf(residuals, nlags=20)\r
\r
      residAcfFig = go.Figure()\r
      residAcfFig.add_trace(go.Bar(x=list(range(len(residAcf))), y=residAcf, name='Residual ACF'))\r
      residAcfFig.add_hline(y=confInt, line_dash='dash', line_color='red')\r
      residAcfFig.add_hline(y=-confInt, line_dash='dash', line_color='red')\r
      residAcfFig.add_hline(y=0, line_color='black')\r
      residAcfFig.update_layout(title='Residual ACF - Check for White Noise',\r
                                xaxis_title='Lag', yaxis_title='ACF')\r
      residAcfFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 잔차 분석의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 14단계. 잔차 분석 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step15_ljung_box\r
  title: 15단계. Ljung-Box 검정\r
  structuredPrimary: true\r
  subtitle: 잔차 자기상관 검정\r
  goal: 15단계. LjungBox 검정에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Ljung-Box 검정은 잔차에 자기상관이 있는지 공식적으로 검정합니다. ACF 플롯은 시각적 판단이지만, Ljung-Box는 여러 시차를 종합적으로 고려한 통계적 검정입니다. 귀무가설은 '잔차에 자기상관이 없다'이며, p-value가 0.05 이상이면 귀무가설을 채택합니다. 즉 잔차가 백색잡음이라는 가정이 만족됩니다. 모든 검정 lag에서 p-value가 0.05 이상이어야 모델이 적절합니다.\r
\r
    lb_pvalue가 0.05 이상이면 잔차에 자기상관이 없습니다. 모든 lag에서 p-value가 0.05 이상이면 모델이 적절합니다.\r
  snippet: |-\r
    from statsmodels.stats.diagnostic import acorr_ljungbox\r
\r
    ljungBox = acorr_ljungbox(residuals, lags=[10, 20], return_df=True)\r
    ljungBox\r
  exercise:\r
    prompt: 15단계. LjungBox 검정 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from statsmodels.stats.diagnostic import acorr_ljungbox\r
\r
      ljungBox = acorr_ljungbox(residuals, lags=[10, 20], return_df=True)\r
      ljungBox\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. LjungBox 검정에서 \`ljungBox\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 15단계. LjungBox 검정 실행 뒤 \`ljungBox\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step16_forecast\r
  title: 16단계. 미래 예측\r
  structuredPrimary: true\r
  subtitle: 30일 수요 예측\r
  goal: 16단계. 미래 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 최종 모델로 미래 30일 수요를 예측합니다. 시계열 예측에서 중요한 점은 예측 불확실성을 함께 제공하는 것입니다. 95% 신뢰구간은 '실제 값이 이 범위 안에\r
    있을 확률이 95%'라는 의미입니다. 예측 기간이 길어질수록 신뢰구간이 넓어지는데, 이는 먼 미래일수록 불확실성이 커진다는 자연스러운 현상입니다. 비즈니스 의사결정에서 예측값뿐\r
    아니라 불확실성 범위도 고려해야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    forecastSteps = 30\r
    forecast = bestFit.get_forecast(steps=forecastSteps)\r
    forecastMean = forecast.predicted_mean\r
    forecastConf = forecast.conf_int()\r
\r
    forecastIdx = pd.date_range(start=demandData.index[-1] + pd.Timedelta(days=1), periods=forecastSteps)\r
\r
    forecastFig = go.Figure()\r
    forecastFig.add_trace(go.Scatter(x=demandData.index, y=demandData['Demand'], mode='lines', name='Historical'))\r
    forecastFig.add_trace(go.Scatter(x=forecastIdx, y=forecastMean, mode='lines', name='Forecast', line=dict(dash='dash')))\r
    forecastFig.add_trace(go.Scatter(x=forecastIdx, y=forecastConf.iloc[:, 0], mode='lines', name='Lower CI', line=dict(dash='dot', color='gray')))\r
    forecastFig.add_trace(go.Scatter(x=forecastIdx, y=forecastConf.iloc[:, 1], mode='lines', name='Upper CI', line=dict(dash='dot', color='gray')))\r
    forecastFig.update_layout(title=f'ARIMA{bestOrder} Forecast - Next {forecastSteps} Days',\r
                              xaxis_title='Date', yaxis_title='Demand')\r
    forecastFig.show()\r
  exercise:\r
    prompt: 16단계. 미래 예측 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      forecastSteps = 30\r
      forecast = bestFit.get_forecast(steps=forecastSteps)\r
      forecastMean = forecast.predicted_mean\r
      forecastConf = forecast.conf_int()\r
\r
      forecastIdx = pd.date_range(start=demandData.index[-1] + pd.Timedelta(days=1), periods=forecastSteps)\r
\r
      forecastFig = go.Figure()\r
      forecastFig.add_trace(go.Scatter(x=demandData.index, y=demandData['Demand'], mode='lines', name='Historical'))\r
      forecastFig.add_trace(go.Scatter(x=forecastIdx, y=forecastMean, mode='lines', name='Forecast', line=dict(dash='dash')))\r
      forecastFig.add_trace(go.Scatter(x=forecastIdx, y=forecastConf.iloc[:, 0], mode='lines', name='Lower CI', line=dict(dash='dot', color='gray')))\r
      forecastFig.add_trace(go.Scatter(x=forecastIdx, y=forecastConf.iloc[:, 1], mode='lines', name='Upper CI', line=dict(dash='dot', color='gray')))\r
      forecastFig.update_layout(title=f'ARIMA{bestOrder} Forecast - Next {forecastSteps} Days',\r
                                xaxis_title='Date', yaxis_title='Demand')\r
      forecastFig.show()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 16단계. 미래 예측의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 16단계. 미래 예측의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 시계열 예측 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    데이터 분석가가 되어 수요 예측 시스템을 구축합니다. 실제 수요 예측 프로젝트에서는 정상성 검정, ACF/PACF 분석, 여러 모델 비교, 잔차 진단, 예측 성능 평가까지 체계적인 과정을 거칩니다. 각 미션은 데이터 로딩부터 예측까지 전체 파이프라인을 독립적으로 수행합니다. 본 프로젝트에서 배운 ACF/PACF 해석, AIC 기반 모델 선택, Ljung-Box 검정을 실습을 통해 숙달해봅니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    from statsmodels.tsa.arima.model import ARIMA\r
    from statsmodels.tsa.stattools import adfuller, acf, pacf\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    diffData = loadLocalDataset("bike_demand")\r
    diffData['Date'] = pd.to_datetime(diffData['Date'])\r
    diffData = diffData.set_index('Date')\r
    diffData.columns = ['Demand']\r
\r
    diffSeries = diffData['Demand'].diff().dropna()\r
    diffSeries.head()\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      from statsmodels.tsa.arima.model import ARIMA\r
      from statsmodels.tsa.stattools import adfuller, acf, pacf\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      diffData = loadLocalDataset("bike_demand")\r
      diffData['Date'] = pd.to_datetime(diffData['Date'])\r
      diffData = diffData.set_index('Date')\r
      diffData.columns = ['Demand']\r
\r
      diffSeries = diffData['Demand'].diff().dropna()\r
      diffSeries.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 아홉 번째 프로젝트 완료!\r
  blocks:\r
  - type: text\r
    content: 이번 프로젝트에서는 ACF/PACF 분석으로 ARIMA 파라미터를 결정하는 방법을 배웠습니다. ADF 검정으로 정상성을 확인하고, ACF는 MA(q), PACF는\r
      AR(p) 파라미터를 결정합니다. 여러 모델의 AIC를 비교하여 최적 모델을 선택하고, Ljung-Box 검정으로 잔차를 진단했습니다. 이제 시계열 예측 모델을 체계적으로\r
      구축할 수 있습니다.\r
  - type: list\r
    items:\r
    - ADF 검정 - 정상성 확인, p-value가 0.05 미만이면 정상\r
    - ACF - 자기상관함수, MA(q) 파라미터 결정\r
    - PACF - 편자기상관함수, AR(p) 파라미터 결정\r
    - AIC - 모델 선택 기준, 낮을수록 좋음\r
    - Ljung-Box - 잔차 자기상관 검정\r
    - get_forecast() - 신뢰구간과 함께 예측\r
  - type: text\r
    content: 다음 프로젝트에서는 VAR 모델로 여러 시계열을 동시에 예측합니다. 지금까지 배운 모든 개념을 종합하여 경제 지표 분석을 완성합니다.\r
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