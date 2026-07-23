var e=`meta:\r
  packages:\r
  - numpy\r
  - pandas\r
  - plotly\r
  - statsmodels\r
  id: statsmodels_07\r
  title: 경제지표회귀분석\r
  order: 7\r
  category: statsmodels\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - 시계열회귀\r
  - 외생변수\r
  - 경제지표\r
  - GDP예측\r
  - 인플레이션\r
  seo:\r
    title: statsmodels 시계열 회귀 - 경제 지표로 GDP 예측하기\r
    description: CPI, 실업률 등 경제 지표로 GDP를 예측합니다. 외생변수를 포함한 시계열 회귀를 배웁니다.\r
    keywords:\r
    - statsmodels\r
    - 시계열회귀\r
    - GDP예측\r
    - 외생변수\r
    - 경제지표\r
    - macrodata\r
intro:\r
  emoji: 📈\r
  goal: 여러 경제 지표로 GDP를 예측하는 시계열 회귀 모델 만들기\r
  description: 1959-2009년 미국 거시경제 데이터로 실업률, 인플레이션, 금리 등 경제 지표가 GDP에 미치는 영향을 분석합니다. 외생변수를 포함한 시계열 회귀로 경제\r
    예측 능력을 기릅니다.\r
  direction: 경제지표회귀분석에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 경제지표회귀분석 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 변수 탐색 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 데이터 미리보기 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 경제지표회귀분석 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: numpy, pandas, plotly, statsmodels 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 경제지표회귀분석 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 경제지표회귀분석 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 미국 거시경제 데이터\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    statsmodels에 내장된 macrodata는 1959년 1분기부터 2009년 3분기까지 미국 거시경제 지표를 담고 있습니다. GDP, 소비, 투자, CPI, 실업률, 인플레이션 등 14개 변수가 분기별로 기록되어 있어 경제 분석에 최적입니다. 이 데이터는 50년간 미국 경제의 성장과 침체를 보여주며, 중앙은행, 투자기관, 정책연구소에서 거시경제 모델을 검증할 때 자주 사용하는 표준 데이터셋입니다. 외부 URL 없이 statsmodels 패키지에서 직접 불러올 수 있어 재현성이 보장됩니다.\r
\r
    load_pandas()는 statsmodels 데이터셋을 pandas DataFrame으로 반환합니다. .data 속성으로 실제 데이터에 접근합니다. macrodata는 경제학 교과서에서 자주 사용되는 표준 시계열 데이터셋입니다.\r
  tips:\r
  - load_pandas()는 statsmodels 데이터셋을 pandas DataFrame으로 반환합니다. .data 속성으로 실제 데이터에 접근합니다. macrodata는 경제학\r
    교과서에서 자주 사용되는 표준 시계열 데이터셋입니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    import statsmodels.api as sm\r
    import plotly.express as px\r
    import plotly.graph_objects as go\r
\r
    macro = sm.datasets.macrodata.load_pandas().data\r
    macro.shape\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 \`macro\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      import statsmodels.api as sm\r
      import plotly.express as px\r
      import plotly.graph_objects as go\r
\r
      macro = sm.datasets.macrodata.load_pandas().data\r
      macro.shape\r
    hints:\r
    - 바꿀 지점은 \`macro = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`macro\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기에서 \`macro\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기 실행 뒤 \`macro\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step2_explore\r
  title: 2단계. 변수 탐색\r
  structuredPrimary: true\r
  subtitle: 경제 지표 이해하기\r
  goal: 2단계. 변수 탐색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: |-\r
    데이터에는 실질GDP(realgdp), 소비(realcons), 투자(realinv), CPI(물가지수), 실업률(unemp), 인플레이션(infl), 실질금리(realint) 등이 포함됩니다. 이 변수들은 경제학 교과서에서 배우는 핵심 지표들로, GDP는 경제 규모를, CPI는 물가 수준을, 실업률은 노동시장 상황을 나타냅니다. 경제 변수들은 서로 밀접하게 연관되어 있어 다중회귀 분석에 적합하며, 실업률이 오르면 GDP가 감소하는 등의 관계를 정량적으로 분석할 수 있습니다.\r
\r
    realgdp는 실질GDP(물가 조정 GDP), realcons는 실질소비, cpi는 소비자물가지수, unemp는 실업률(%), infl은 인플레이션율(%), tbilrate는 3개월 국채 금리입니다. 'real'이 붙은 변수는 인플레이션 효과를 제거한 실질 값입니다.\r
  tips:\r
  - realgdp는 실질GDP(물가 조정 GDP), realcons는 실질소비, cpi는 소비자물가지수, unemp는 실업률(%), infl은 인플레이션율(%), tbilrate는\r
    3개월 국채 금리입니다. 'real'이 붙은 변수는 인플레이션 효과를 제거한 실질 값입니다.\r
  snippet: macro.columns.tolist()\r
  exercise:\r
    prompt: 2단계. 변수 탐색 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: macro.columns.tolist()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 변수 탐색의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 2단계. 변수 탐색 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step3_head\r
  title: 3단계. 데이터 미리보기\r
  structuredPrimary: true\r
  subtitle: 시계열 구조 확인\r
  goal: 3단계. 데이터 미리보기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: year와 quarter 컬럼으로 시간 정보를 확인할 수 있습니다. 1959년 1분기부터 2009년 3분기까지 203개 분기(약 50년) 데이터가 포함됩니다.\r
    경제 데이터는 월별, 분기별, 연간 단위로 발표되는데, 분기별 데이터는 월별보다 노이즈가 적고 연간보다 변화를 자세히 관찰할 수 있어 거시경제 분석에 많이 사용됩니다. 분기별\r
    데이터이므로 계절성보다는 장기 추세 분석이 핵심입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: macro.head()\r
  exercise:\r
    prompt: 3단계. 데이터 미리보기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: macro.head()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 데이터 미리보기의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 3단계. 데이터 미리보기 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step4_time_index\r
  title: 4단계. 시간 인덱스 생성\r
  structuredPrimary: true\r
  subtitle: 날짜 형식 변환\r
  goal: 4단계. 시간 인덱스 생성에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    시계열 분석을 위해 year와 quarter를 결합하여 날짜 인덱스를 생성합니다. 날짜 인덱스가 있으면 시계열 그래프를 그리거나 특정 기간을 필터링할 때 매우 편리합니다. 예를 들어 2008년 금융위기 전후 데이터만 추출하거나, 1970년대 오일쇼크 기간과 비교하는 분석이 가능해집니다. pandas의 DatetimeIndex는 분기 데이터에도 적용할 수 있어 경제 시계열 분석에 필수적인 도구입니다.\r
\r
    분기를 월로 변환하려면 1분기=1월, 2분기=4월, 3분기=7월, 4분기=10월이므로 quarter * 3 - 2 공식을 사용합니다. pd.to_datetime()으로 문자열을 날짜로 변환하고, set_index()로 인덱스를 설정합니다. 04 프로젝트의 시계열 인덱스 개념을 복습합니다.\r
  tips:\r
  - 분기를 월로 변환하려면 1분기=1월, 2분기=4월, 3분기=7월, 4분기=10월이므로 quarter * 3 - 2 공식을 사용합니다. pd.to_datetime()으로 문자열을\r
    날짜로 변환하고, set_index()로 인덱스를 설정합니다. 04 프로젝트의 시계열 인덱스 개념을 복습합니다.\r
  snippet: |-\r
    macro['date'] = pd.to_datetime(macro['year'].astype(int).astype(str) + '-' + (macro['quarter'].astype(int) * 3 - 2).astype(str) + '-01')\r
    macro = macro.set_index('date')\r
    macro.index\r
  exercise:\r
    prompt: 4단계. 시간 인덱스 생성 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      macro['date'] = pd.to_datetime(macro['year'].astype(int).astype(str) + '-' + (macro['quarter'].astype(int) * 3 - 2).astype(str) + '-01')\r
      macro = macro.set_index('date')\r
      macro.index\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 시간 인덱스 생성의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 시간 인덱스 생성의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_gdp_trend\r
  title: 5단계. GDP 추세 시각화\r
  structuredPrimary: true\r
  subtitle: 50년 경제 성장\r
  goal: 5단계. GDP 추세 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    1959-2009년 미국 GDP 추세를 시각화합니다. 50년간 실질GDP는 약 3조 달러에서 13조 달러로 4배 이상 성장했으며, 이 과정에서 여러 경기침체 시기를 겪었습니다. 1970년대 오일쇼크, 1980년대 초 스태그플레이션, 2001년 닷컴버블 붕괴, 2008년 글로벌 금융위기 등이 그래프에서 급락으로 나타납니다. 경제 분석에서 시각화는 숫자만으로는 보이지 않는 추세와 변곡점을 발견하게 해줍니다.\r
\r
    reset_index()로 인덱스를 컬럼으로 변환해야 plotly에서 x축으로 사용할 수 있습니다. 그래프에서 1970년대 오일쇼크, 1980년대 초 경기침체, 2001년 닷컴버블, 2008년 금융위기 시기의 GDP 변동을 확인할 수 있습니다.\r
  tips:\r
  - reset_index()로 인덱스를 컬럼으로 변환해야 plotly에서 x축으로 사용할 수 있습니다. 그래프에서 1970년대 오일쇼크, 1980년대 초 경기침체, 2001년 닷컴버블,\r
    2008년 금융위기 시기의 GDP 변동을 확인할 수 있습니다.\r
  snippet: |-\r
    trendData = macro.drop(columns='date') if 'date' in macro.columns else macro\r
    trendData = trendData.reset_index()\r
    gdpFig = px.line(trendData, x='date', y='realgdp',\r
                     title='US Real GDP (1959-2009)',\r
                     labels={'date': 'Date', 'realgdp': 'Real GDP (Billions)'})\r
    gdpFig.show()\r
  exercise:\r
    prompt: 5단계. GDP 추세 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      trendData = macro.drop(columns='date') if 'date' in macro.columns else macro\r
      trendData = trendData.reset_index()\r
      gdpFig = px.line(trendData, x='date', y='realgdp',\r
                       title='US Real GDP (1959-2009)',\r
                       labels={'date': 'Date', 'realgdp': 'Real GDP (Billions)'})\r
      gdpFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. GDP 추세 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 5단계. GDP 추세 시각화의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step6_correlation\r
  title: 6단계. 변수 간 상관관계\r
  structuredPrimary: true\r
  subtitle: 경제 지표 연관성\r
  goal: 6단계. 변수 간 상관관계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    GDP와 다른 경제 지표의 상관관계를 확인합니다. 상관분석은 회귀 모델에 어떤 변수를 넣을지 결정하는 첫 단계입니다. 소비(realcons)와 투자(realinv)는 GDP를 구성하는 요소이므로 0.99에 가까운 높은 상관을 보일 것입니다. 반면 실업률(unemp)은 경기가 좋으면 낮아지고 나쁘면 높아지므로 GDP와 음의 상관이 예상됩니다. 이런 경제적 직관을 데이터로 검증하는 것이 분석의 첫걸음입니다.\r
\r
    corr()['realgdp']로 GDP와 각 변수의 상관계수만 추출합니다. realcons(소비)가 0.99로 거의 완벽한 양의 상관, unemp(실업률)가 음의 상관을 보입니다. cpi(물가)도 GDP와 양의 상관인데, 경제 성장과 물가가 함께 올라가는 경향을 반영합니다.\r
  tips:\r
  - corr()['realgdp']로 GDP와 각 변수의 상관계수만 추출합니다. realcons(소비)가 0.99로 거의 완벽한 양의 상관, unemp(실업률)가 음의 상관을 보입니다.\r
    cpi(물가)도 GDP와 양의 상관인데, 경제 성장과 물가가 함께 올라가는 경향을 반영합니다.\r
  snippet: |-\r
    targetVars = ['realgdp', 'realcons', 'realinv', 'unemp', 'cpi', 'infl', 'realint']\r
    macro[targetVars].corr()['realgdp'].sort_values(ascending=False)\r
  exercise:\r
    prompt: 6단계. 변수 간 상관관계 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      targetVars = ['realgdp', 'realcons', 'realinv', 'unemp', 'cpi', 'infl', 'realint']\r
      macro[targetVars].corr()['realgdp'].sort_values(ascending=False)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 변수 간 상관관계에서 \`targetVars\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 변수 간 상관관계 실행 뒤 \`targetVars\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step7_feature_selection\r
  title: 7단계. 독립변수 선택\r
  structuredPrimary: true\r
  subtitle: 외생변수 결정\r
  goal: 7단계. 독립변수 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    GDP 예측 모델에 사용할 외생변수를 선택합니다. 외생변수(exogenous variable)란 모델 외부에서 결정되어 종속변수에 영향을 주는 변수입니다. 실업률, 인플레이션, 금리는 중앙은행 정책이나 노동시장 상황에 따라 결정되므로 GDP의 원인이 될 수 있습니다. 반면 소비(realcons)는 GDP의 구성요소여서 원인보다는 결과에 가깝습니다. 변수 선택 시 인과관계 방향을 고려해야 의미 있는 예측 모델을 만들 수 있습니다.\r
\r
    외생변수(exogenous variable)는 모델 외부에서 결정되어 종속변수에 영향을 주는 변수입니다. 실업률 상승 → GDP 하락, 인플레이션 → GDP 변동 같은 인과관계를 분석할 수 있습니다. describe()로 각 변수의 범위와 분포를 확인합니다.\r
  tips:\r
  - 외생변수(exogenous variable)는 모델 외부에서 결정되어 종속변수에 영향을 주는 변수입니다. 실업률 상승 → GDP 하락, 인플레이션 → GDP 변동 같은 인과관계를\r
    분석할 수 있습니다. describe()로 각 변수의 범위와 분포를 확인합니다.\r
  snippet: |-\r
    exogVars = ['unemp', 'infl', 'realint', 'cpi']\r
    XRaw = macro[exogVars]\r
    y = macro['realgdp']\r
    XRaw.describe()\r
  exercise:\r
    prompt: 7단계. 독립변수 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      exogVars = ['unemp', 'infl', 'realint', 'cpi']\r
      XRaw = macro[exogVars]\r
      y = macro['realgdp']\r
      XRaw.describe()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 독립변수 선택에서 \`exogVars\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 독립변수 선택 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step8_scatter_matrix\r
  title: 8단계. 산점도 행렬\r
  structuredPrimary: true\r
  subtitle: 변수 관계 시각화\r
  goal: 8단계. 산점도 행렬에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    GDP와 외생변수의 관계를 산점도로 확인합니다. 산점도 행렬(scatter matrix)은 여러 변수 쌍의 관계를 한눈에 볼 수 있어 다변량 데이터 탐색에 효과적입니다. 실업률과 GDP 산점도에서 우하향 패턴이 보이면 음의 관계를, CPI와 GDP에서 우상향 패턴이 보이면 양의 관계를 의미합니다. 비선형 패턴이 발견되면 변환이나 다항 항을 고려해야 합니다.\r
\r
    scatter_matrix()는 모든 변수 쌍의 산점도를 한 번에 그립니다. diagonal_visible=False로 대각선(자기 자신과의 관계)을 숨깁니다. unemp-realgdp 산점도에서 역U자 형태가 보이면 비선형 관계일 수 있습니다.\r
  tips:\r
  - scatter_matrix()는 모든 변수 쌍의 산점도를 한 번에 그립니다. diagonal_visible=False로 대각선(자기 자신과의 관계)을 숨깁니다. unemp-realgdp\r
    산점도에서 역U자 형태가 보이면 비선형 관계일 수 있습니다.\r
  snippet: |-\r
    scatterData = macro[['realgdp'] + exogVars].reset_index(drop=True)\r
    scatterFig = px.scatter_matrix(scatterData, dimensions=['realgdp', 'unemp', 'cpi'],\r
                                   title='GDP vs Unemployment vs CPI')\r
    scatterFig.update_traces(diagonal_visible=False)\r
    scatterFig.show()\r
  exercise:\r
    prompt: 8단계. 산점도 행렬 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      scatterData = macro[['realgdp'] + exogVars].reset_index(drop=True)\r
      scatterFig = px.scatter_matrix(scatterData, dimensions=['realgdp', 'unemp', 'cpi'],\r
                                     title='GDP vs Unemployment vs CPI')\r
      scatterFig.update_traces(diagonal_visible=False)\r
      scatterFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 산점도 행렬의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 8단계. 산점도 행렬의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step9_multiple_regression\r
  title: 9단계. 다중회귀 모델\r
  structuredPrimary: true\r
  subtitle: 4개 외생변수 사용\r
  goal: 9단계. 다중회귀 모델에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    실업률, 인플레이션, 실질금리, CPI를 독립변수로 GDP를 예측하는 다중회귀 모델을 학습합니다. 다중회귀는 여러 요인이 결과에 미치는 개별 영향력을 분리하여 측정할 수 있어 정책 분석에 필수적입니다. 예를 들어 실업률 1%p 증가가 다른 조건이 같을 때 GDP에 미치는 순수 효과를 계수로 확인할 수 있습니다. R²가 높으면 선택한 경제 지표가 GDP 변동을 잘 설명한다는 의미입니다.\r
\r
    R²가 높으면 선택한 경제 지표가 GDP 변동을 잘 설명합니다. 각 계수의 부호를 확인하세요. unemp 계수가 음수면 실업률 1%p 증가 시 GDP가 감소, cpi 계수가 양수면 물가와 GDP가 함께 증가하는 관계입니다.\r
  tips:\r
  - R²가 높으면 선택한 경제 지표가 GDP 변동을 잘 설명합니다. 각 계수의 부호를 확인하세요. unemp 계수가 음수면 실업률 1%p 증가 시 GDP가 감소, cpi 계수가 양수면\r
    물가와 GDP가 함께 증가하는 관계입니다.\r
  snippet: |-\r
    X = sm.add_constant(XRaw)\r
    modelGdp = sm.OLS(y, X).fit()\r
    modelGdp.summary()\r
  exercise:\r
    prompt: 9단계. 다중회귀 모델 예제에서 \`X\`, \`modelGdp\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      X = sm.add_constant(XRaw)\r
      modelGdp = sm.OLS(y, X).fit()\r
      modelGdp.summary()\r
    hints:\r
    - 바꿀 지점은 \`X = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`X\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 다중회귀 모델에서 \`X\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 다중회귀 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step10_coefficient_interpret\r
  title: 10단계. 계수 해석\r
  structuredPrimary: true\r
  subtitle: 경제적 의미\r
  goal: 10단계. 계수 해석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    각 계수의 경제적 의미를 해석합니다. 회귀 계수는 '다른 변수가 고정되었을 때' 해당 변수 1단위 증가의 효과를 나타냅니다. 예를 들어 unemp 계수가 -100이면 인플레이션, 금리, 물가가 그대로일 때 실업률 1%p 증가 시 GDP가 100억 달러 감소한다는 의미입니다. 이 해석은 정책 효과를 분석할 때 핵심이며, p-value로 이 효과가 통계적으로 유의미한지도 함께 확인해야 합니다.\r
\r
    p-value가 0.05 미만이면 해당 변수는 통계적으로 유의합니다. const(절편)는 모든 독립변수가 0일 때 GDP 기대값입니다. 계수의 부호가 경제 이론과 일치하는지 확인하세요. 실업률이 상승하면 GDP가 하락하는 것이 일반적입니다.\r
  tips:\r
  - p-value가 0.05 미만이면 해당 변수는 통계적으로 유의합니다. const(절편)는 모든 독립변수가 0일 때 GDP 기대값입니다. 계수의 부호가 경제 이론과 일치하는지 확인하세요.\r
    실업률이 상승하면 GDP가 하락하는 것이 일반적입니다.\r
  snippet: |-\r
    coefDf = pd.DataFrame({\r
        'Coefficient': modelGdp.params,\r
        'Std Error': modelGdp.bse,\r
        'p-value': modelGdp.pvalues\r
    }).round(4)\r
    coefDf\r
  exercise:\r
    prompt: 10단계. 계수 해석 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      coefDf = pd.DataFrame({\r
          'Coefficient': modelGdp.params,\r
          'Std Error': modelGdp.bse,\r
          'p-value': modelGdp.pvalues\r
      }).round(4)\r
      coefDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 계수 해석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 계수 해석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step11_residual_analysis\r
  title: 11단계. 잔차 분석\r
  structuredPrimary: true\r
  subtitle: 모델 진단\r
  goal: 11단계. 잔차 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    잔차 분석으로 모델의 적합성을 진단합니다. 잔차(residual)는 실제값과 예측값의 차이로, 모델이 설명하지 못한 부분입니다. 좋은 모델이라면 잔차가 무작위하게 0 주위에 분포해야 합니다. 시간에 따라 잔차가 커지거나 특정 패턴을 보이면 모델에 문제가 있습니다. 특히 시계열 데이터에서는 잔차의 자기상관(autocorrelation), 즉 이전 시점 오차가 현재 시점 오차에 영향을 주는지도 확인해야 합니다.\r
\r
    잔차가 시간에 따라 증가하거나 감소하는 추세가 있으면 모델이 추세를 제대로 포착하지 못한 것입니다. 특정 시기에 잔차가 집중되면 구조적 변화가 있을 수 있습니다(2008년 금융위기 등). macro.index는 이미 DatetimeIndex이므로 바로 사용할 수 있습니다.\r
  tips:\r
  - 잔차가 시간에 따라 증가하거나 감소하는 추세가 있으면 모델이 추세를 제대로 포착하지 못한 것입니다. 특정 시기에 잔차가 집중되면 구조적 변화가 있을 수 있습니다(2008년 금융위기\r
    등). macro.index는 이미 DatetimeIndex이므로 바로 사용할 수 있습니다.\r
  snippet: |-\r
    residuals = modelGdp.resid\r
    residDf = pd.DataFrame({'Date': macro.index, 'Residuals': residuals})\r
\r
    residFig = px.scatter(residDf, x='Date', y='Residuals',\r
                          title='Residuals Over Time',\r
                          opacity=0.6)\r
    residFig.add_hline(y=0, line_dash='dash', line_color='red')\r
    residFig.show()\r
  exercise:\r
    prompt: 11단계. 잔차 분석 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      residuals = modelGdp.resid\r
      residDf = pd.DataFrame({'Date': macro.index, 'Residuals': residuals})\r
\r
      residFig = px.scatter(residDf, x='Date', y='Residuals',\r
                            title='Residuals Over Time',\r
                            opacity=0.6)\r
      residFig.add_hline(y=0, line_dash='dash', line_color='red')\r
      residFig.show()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 잔차 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 잔차 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_durbin_watson\r
  title: 12단계. 자기상관 검정\r
  structuredPrimary: true\r
  subtitle: Durbin-Watson 통계량\r
  goal: 12단계. 자기상관 검정에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    시계열 회귀에서 잔차의 자기상관(autocorrelation)은 중요한 진단 지표입니다. 자기상관이 있으면 표준오차가 과소추정되어 p-value가 부정확해지므로, 유의미하지 않은 변수를 유의미하다고 잘못 판단할 수 있습니다. Durbin-Watson 통계량은 이를 검정하는 도구로, 2에 가까우면 자기상관이 없고, 0에 가까우면 양의 자기상관(어제 오차가 양수면 오늘도 양수), 4에 가까우면 음의 자기상관을 의미합니다.\r
\r
    DW 통계량이 1.5~2.5면 자기상관이 심각하지 않습니다. 0에 가까우면 양의 자기상관(어제 오차가 양수면 오늘도 양수일 가능성), 4에 가까우면 음의 자기상관입니다. 자기상관이 있으면 표준오차가 과소추정되어 p-value가 부정확해집니다.\r
  tips:\r
  - DW 통계량이 1.5~2.5면 자기상관이 심각하지 않습니다. 0에 가까우면 양의 자기상관(어제 오차가 양수면 오늘도 양수일 가능성), 4에 가까우면 음의 자기상관입니다. 자기상관이\r
    있으면 표준오차가 과소추정되어 p-value가 부정확해집니다.\r
  snippet: |-\r
    from statsmodels.stats.stattools import durbin_watson\r
\r
    dwStat = durbin_watson(modelGdp.resid)\r
    f"Durbin-Watson: {dwStat:.3f}"\r
  exercise:\r
    prompt: 12단계. 자기상관 검정 예제에서 \`dwStat\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from statsmodels.stats.stattools import durbin_watson\r
\r
      dwStat = durbin_watson(modelGdp.resid)\r
      f"Durbin-Watson: {dwStat:.3f}"\r
    hints:\r
    - 바꿀 지점은 \`dwStat = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`dwStat\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 자기상관 검정에서 \`dwStat\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 12단계. 자기상관 검정 실행 뒤 \`dwStat\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step13_prediction\r
  title: 13단계. GDP 예측\r
  structuredPrimary: true\r
  subtitle: 새로운 경제 시나리오\r
  goal: 13단계. GDP 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    특정 경제 시나리오에서 GDP를 예측합니다. 회귀 모델의 가장 큰 장점은 가상의 조건에서 결과를 예측할 수 있다는 점입니다. 실업률 6%, 인플레이션 3%, 실질금리 2%, CPI 200인 가상 시나리오를 설정하고 GDP를 예측해봅니다. 이런 시나리오 분석은 정책 결정, 투자 계획, 리스크 관리에서 다양한 상황에 대비하는 데 활용됩니다.\r
\r
    has_constant='add'는 단일 행 데이터에도 상수항을 추가합니다. 03 프로젝트에서 배운 더미 변수 처리와 동일한 패턴입니다. 예측값이 현실적인 범위(5000-15000)인지 확인하세요.\r
  tips:\r
  - has_constant='add'는 단일 행 데이터에도 상수항을 추가합니다. 03 프로젝트에서 배운 더미 변수 처리와 동일한 패턴입니다. 예측값이 현실적인 범위(5000-15000)인지\r
    확인하세요.\r
  snippet: |-\r
    scenarioData = {col: [0] for col in exogVars}\r
    scenarioData['unemp'] = [6.0]\r
    scenarioData['infl'] = [3.0]\r
    scenarioData['realint'] = [2.0]\r
    scenarioData['cpi'] = [200.0]\r
\r
    scenarioDf = pd.DataFrame(scenarioData)[exogVars]\r
    scenarioWithConst = sm.add_constant(scenarioDf, has_constant='add')\r
    predictedGdp = modelGdp.predict(scenarioWithConst)[0]\r
    f"예측 GDP: {predictedGdp:.2f} billion"\r
  exercise:\r
    prompt: 13단계. GDP 예측 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      scenarioData = {col: [0] for col in exogVars}\r
      scenarioData['unemp'] = [6.0]\r
      scenarioData['infl'] = [3.0]\r
      scenarioData['realint'] = [2.0]\r
      scenarioData['cpi'] = [200.0]\r
\r
      scenarioDf = pd.DataFrame(scenarioData)[exogVars]\r
      scenarioWithConst = sm.add_constant(scenarioDf, has_constant='add')\r
      predictedGdp = modelGdp.predict(scenarioWithConst)[0]\r
      f"예측 GDP: {predictedGdp:.2f} billion"\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. GDP 예측의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 13단계. GDP 예측 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step14_scenario_comparison\r
  title: 14단계. 시나리오 비교\r
  structuredPrimary: true\r
  subtitle: 경기침체 vs 호황\r
  goal: 14단계. 시나리오 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 경기침체와 호황 시나리오를 비교합니다. 침체 시나리오는 실업률 9%, 저인플레이션, 저금리를 설정하고, 호황 시나리오는 실업률 4%, 적정 인플레이션, 정상\r
    금리를 설정합니다. 두 시나리오의 예측 GDP 차이를 계산하면 경제 상황 변화가 GDP에 미치는 영향의 규모를 파악할 수 있습니다. 이런 비교 분석은 경기 전망 보고서나 정책\r
    제안서 작성에 자주 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    recessionData = {col: [0] for col in exogVars}\r
    recessionData['unemp'] = [9.0]\r
    recessionData['infl'] = [1.0]\r
    recessionData['realint'] = [0.5]\r
    recessionData['cpi'] = [180.0]\r
\r
    boomData = {col: [0] for col in exogVars}\r
    boomData['unemp'] = [4.0]\r
    boomData['infl'] = [3.5]\r
    boomData['realint'] = [3.0]\r
    boomData['cpi'] = [220.0]\r
\r
    recessionDf = pd.DataFrame(recessionData)[exogVars]\r
    boomDf = pd.DataFrame(boomData)[exogVars]\r
\r
    recessionConst = sm.add_constant(recessionDf, has_constant='add')\r
    boomConst = sm.add_constant(boomDf, has_constant='add')\r
\r
    recessionGdp = modelGdp.predict(recessionConst)[0]\r
    boomGdp = modelGdp.predict(boomConst)[0]\r
\r
    compareDf = pd.DataFrame({\r
        'Scenario': ['Recession', 'Boom'],\r
        'Unemployment': [9.0, 4.0],\r
        'Inflation': [1.0, 3.5],\r
        'Predicted GDP': [recessionGdp, boomGdp]\r
    })\r
    compareDf\r
  exercise:\r
    prompt: 14단계. 시나리오 비교 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      recessionData = {col: [0] for col in exogVars}\r
      recessionData['unemp'] = [9.0]\r
      recessionData['infl'] = [1.0]\r
      recessionData['realint'] = [0.5]\r
      recessionData['cpi'] = [180.0]\r
\r
      boomData = {col: [0] for col in exogVars}\r
      boomData['unemp'] = [4.0]\r
      boomData['infl'] = [3.5]\r
      boomData['realint'] = [3.0]\r
      boomData['cpi'] = [220.0]\r
\r
      recessionDf = pd.DataFrame(recessionData)[exogVars]\r
      boomDf = pd.DataFrame(boomData)[exogVars]\r
\r
      recessionConst = sm.add_constant(recessionDf, has_constant='add')\r
      boomConst = sm.add_constant(boomDf, has_constant='add')\r
\r
      recessionGdp = modelGdp.predict(recessionConst)[0]\r
      boomGdp = modelGdp.predict(boomConst)[0]\r
\r
      compareDf = pd.DataFrame({\r
          'Scenario': ['Recession', 'Boom'],\r
          'Unemployment': [9.0, 4.0],\r
          'Inflation': [1.0, 3.5],\r
          'Predicted GDP': [recessionGdp, boomGdp]\r
      })\r
      compareDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 시나리오 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 14단계. 시나리오 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step15_time_effect\r
  title: 15단계. 시간 효과 추가\r
  structuredPrimary: true\r
  subtitle: 추세 변수 포함\r
  goal: 15단계. 시간 효과 추가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    경제는 기술 발전, 인구 증가, 생산성 향상으로 장기적으로 성장하는 추세가 있습니다. 이 추세를 무시하면 다른 변수들이 추세 효과까지 흡수하여 계수 해석이 왜곡됩니다. 시간 변수를 추가하면 추세 효과가 분리되어, 다른 변수 계수는 '추세를 제외한 순수 효과'로 바뀝니다. 시간 변수 추가 전후의 R², 계수, AIC를 비교하면 추세 효과의 크기를 확인할 수 있습니다.\r
\r
    time 변수는 0, 1, 2, ... 순으로 증가하는 추세 변수입니다. 시간 변수를 추가하면 다른 변수의 계수는 "추세를 제외한 순수 효과"로 해석이 바뀝니다. R²와 Adj R² 차이가 크면 과적합 가능성이 있습니다.\r
  tips:\r
  - time 변수는 0, 1, 2, ... 순으로 증가하는 추세 변수입니다. 시간 변수를 추가하면 다른 변수의 계수는 "추세를 제외한 순수 효과"로 해석이 바뀝니다. R²와 Adj\r
    R² 차이가 크면 과적합 가능성이 있습니다.\r
  snippet: |-\r
    macro['time'] = range(len(macro))\r
\r
    XWithTime = macro[exogVars + ['time']]\r
    XWithTimeConst = sm.add_constant(XWithTime)\r
\r
    modelWithTime = sm.OLS(y, XWithTimeConst).fit()\r
\r
    compareSummary = pd.DataFrame({\r
        'Model': ['Without Time', 'With Time'],\r
        'R²': [modelGdp.rsquared, modelWithTime.rsquared],\r
        'Adj R²': [modelGdp.rsquared_adj, modelWithTime.rsquared_adj],\r
        'AIC': [modelGdp.aic, modelWithTime.aic]\r
    })\r
    compareSummary\r
  exercise:\r
    prompt: 15단계. 시간 효과 추가 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      macro['time'] = range(len(macro))\r
\r
      XWithTime = macro[exogVars + ['time']]\r
      XWithTimeConst = sm.add_constant(XWithTime)\r
\r
      modelWithTime = sm.OLS(y, XWithTimeConst).fit()\r
\r
      compareSummary = pd.DataFrame({\r
          'Model': ['Without Time', 'With Time'],\r
          'R²': [modelGdp.rsquared, modelWithTime.rsquared],\r
          'Adj R²': [modelGdp.rsquared_adj, modelWithTime.rsquared_adj],\r
          'AIC': [modelGdp.aic, modelWithTime.aic]\r
      })\r
      compareSummary\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 시간 효과 추가의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 15단계. 시간 효과 추가의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step16_fitted_vs_actual\r
  title: 16단계. 예측 vs 실제 비교\r
  structuredPrimary: true\r
  subtitle: 모델 적합도 시각화\r
  goal: 16단계. 예측 vs 실제 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 모델의 예측값과 실제 GDP를 시각화하여 적합도를 확인합니다. 실제값과 예측값 그래프가 가까울수록 모델이 데이터를 잘 설명한다는 의미입니다. 특히 2008년\r
    금융위기 같은 급격한 변동 시점에서 두 선의 차이를 확인하세요. 모델이 예측하지 못한 큰 오차가 있다면 그 시점에 특별한 사건이 있었거나 모델에 포함되지 않은 요인이 작용했을\r
    수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    fittedValues = modelWithTime.fittedvalues\r
\r
    compFig = go.Figure()\r
    compFig.add_trace(go.Scatter(x=macro.index, y=y, mode='lines', name='Actual GDP'))\r
    compFig.add_trace(go.Scatter(x=macro.index, y=fittedValues, mode='lines', name='Predicted GDP', line=dict(dash='dash')))\r
    compFig.update_layout(title='Actual vs Predicted GDP', xaxis_title='Date', yaxis_title='GDP (Billions)')\r
    compFig.show()\r
  exercise:\r
    prompt: 16단계. 예측 vs 실제 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fittedValues = modelWithTime.fittedvalues\r
\r
      compFig = go.Figure()\r
      compFig.add_trace(go.Scatter(x=macro.index, y=y, mode='lines', name='Actual GDP'))\r
      compFig.add_trace(go.Scatter(x=macro.index, y=fittedValues, mode='lines', name='Predicted GDP', line=dict(dash='dash')))\r
      compFig.update_layout(title='Actual vs Predicted GDP', xaxis_title='Date', yaxis_title='GDP (Billions)')\r
      compFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 16단계. 예측 vs 실제 비교의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 16단계. 예측 vs 실제 비교의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 거시경제 분석 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    경제 분석가가 되어 거시경제 지표를 분석합니다. 실제 경제 분석에서는 여러 지표 조합, 시간 변수 포함 여부, 진단 검정 결과를 종합적으로 판단하여 최적의 모델을 선택합니다. 각 미션은 데이터 로딩부터 회귀 분석, 진단, 예측까지 전체 과정을 독립적으로 수행합니다. 본 프로젝트에서 배운 외생변수 선택, Durbin-Watson 검정, 시나리오 분석을 실습을 통해 체화해봅니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    import statsmodels.api as sm\r
\r
    consMacro = sm.datasets.macrodata.load_pandas().data\r
    consMacro['date'] = pd.to_datetime(consMacro['year'].astype(int).astype(str) + '-' + (consMacro['quarter'].astype(int) * 3 - 2).astype(str) + '-01')\r
    consMacro = consMacro.set_index('date')\r
    consY = consMacro['realgdp']\r
    consMacro.head()\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      import statsmodels.api as sm\r
\r
      consMacro = sm.datasets.macrodata.load_pandas().data\r
      consMacro['date'] = pd.to_datetime(consMacro['year'].astype(int).astype(str) + '-' + (consMacro['quarter'].astype(int) * 3 - 2).astype(str) + '-01')\r
      consMacro = consMacro.set_index('date')\r
      consY = consMacro['realgdp']\r
      consMacro.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 일곱 번째 프로젝트 완료!\r
  blocks:\r
  - type: text\r
    content: 이번 프로젝트에서는 1959-2009년 미국 거시경제 데이터로 GDP를 예측했습니다. 실업률, 인플레이션, CPI 등 외생변수를 포함한 다중회귀 모델을 구축하고,\r
      Durbin-Watson 검정으로 시계열 잔차의 자기상관을 진단했습니다. 시간 변수를 추가하여 추세 효과를 명시적으로 모델링하고, 경기침체와 호황 시나리오별 GDP를 예측했습니다.\r
      이제 경제 지표 분석, 정책 효과 예측, 시나리오 플래닝에 시계열 회귀를 활용할 수 있습니다.\r
  - type: list\r
    items:\r
    - 외생변수 - 모델 외부에서 결정되어 종속변수에 영향을 주는 변수\r
    - 시계열 회귀 - 시간에 따른 데이터의 추세와 변동을 회귀로 분석\r
    - Durbin-Watson - 잔차의 자기상관 검정 (2에 가까우면 양호)\r
    - 시간 변수 - 추세 효과를 명시적으로 모델에 포함\r
    - 시나리오 분석 - 여러 경제 상황에서 결과 예측\r
    - PeriodIndex - 분기/월별 시계열 인덱스\r
  - type: text\r
    content: 다음 프로젝트에서는 IBM HR 데이터로 직원 퇴사를 예측합니다. 05 프로젝트에서 배운 로지스틱 회귀를 확장하여 가설 검정과 범주형 변수 처리를 심화합니다.\r
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