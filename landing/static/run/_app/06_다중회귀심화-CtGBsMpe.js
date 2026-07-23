var e=`meta:\r
  packages:\r
  - altair\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - seaborn\r
  - statsmodels\r
  id: statsmodels_06\r
  title: 다중회귀심화\r
  order: 6\r
  category: statsmodels\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  dataSource: codaro-local:advertising\r
  tags:\r
  - 다중회귀\r
  - VIF\r
  - 다중공선성\r
  - 특성선택\r
  - 모델비교\r
  seo:\r
    title: statsmodels 다중회귀 심화 - 다중공선성과 특성 선택\r
    description: 다중회귀의 고급 기법을 배웁니다. VIF로 다중공선성을 진단하고 최적 변수를 선택합니다.\r
    keywords:\r
    - statsmodels\r
    - 다중회귀\r
    - VIF\r
    - 다중공선성\r
    - 특성선택\r
    - 모델비교\r
intro:\r
  emoji: 📊\r
  goal: 여러 광고 매체를 동시에 분석하여 최적 조합 찾기\r
  description: 3개 광고 매체(TV, Radio, Newspaper)를 모두 사용한 다중회귀 모델을 만들고, VIF로 다중공선성을 진단하며, 최적 변수 조합을 찾습니다.\r
  direction: 다중회귀심화에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 다중회귀심화 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 변수 간 상관관계 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 다중회귀 모델 학습 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 다중회귀심화 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: altair, matplotlib, numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 다중회귀심화 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 다중회귀심화 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 광고비 데이터 준비\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    01 프로젝트에서 사용한 Advertising 데이터를 다시 불러옵니다. 이번에는 TV 한 가지가 아니라 Radio, Newspaper 광고비도 모두 활용하여 매출을 예측하는 다중회귀 모델을 만듭니다. 01 프로젝트의 단순회귀는 독립변수가 하나뿐이었지만, 다중회귀는 여러 독립변수를 동시에 고려하므로 각 변수의 '순수한' 영향을 분리하고 더 정확한 예측이 가능합니다. 이 프로젝트에서는 VIF(다중공선성 진단), 변수 선택, 상호작용 효과 등 다중회귀의 심화 개념을 배웁니다.\r
\r
    index_col=0은 첫 번째 컬럼을 인덱스로 사용합니다. shape은 (행, 열) 튜플로 데이터 크기를 반환하며, 200개 시장과 4개 컬럼(TV, Radio, Newspaper, Sales)을 확인할 수 있습니다.\r
  tips:\r
  - index_col=0은 첫 번째 컬럼을 인덱스로 사용합니다. shape은 (행, 열) 튜플로 데이터 크기를 반환하며, 200개 시장과 4개 컬럼(TV, Radio, Newspaper,\r
    Sales)을 확인할 수 있습니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    import statsmodels.api as sm\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    adData = loadLocalDataset("advertising")\r
    adData.shape\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      import statsmodels.api as sm\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      adData = loadLocalDataset("advertising")\r
      adData.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_correlation\r
  title: 2단계. 변수 간 상관관계\r
  structuredPrimary: true\r
  subtitle: 다중공선성 예비 확인\r
  goal: 2단계. 변수 간 상관관계에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: |-\r
    다중회귀를 하기 전 독립변수들 간의 상관관계를 확인하는 것은 필수입니다. 상관계수는 -1에서 1 사이 값으로, 절대값이 0.8 이상이면 강한 상관관계를 의미하며 다중공선성(multicollinearity) 문제가 발생할 수 있습니다. 다중공선성은 독립변수들끼리 높은 상관관계를 가질 때 발생하며, 회귀 계수가 불안정해지고 해석이 어려워집니다. 02 프로젝트에서 배운 상관관계 분석 기법을 다중회귀 준비에 활용합니다.\r
\r
    corr()는 모든 변수 쌍의 피어슨 상관계수를 계산합니다. 대각선은 자기 자신과의 상관이므로 항상 1.0입니다. TV와 Radio는 0.05로 거의 무상관이지만, TV와 Newspaper는 0.06으로 약한 양의 상관입니다. Sales와 각 광고비의 상관을 보면 TV(0.78), Radio(0.58), Newspaper(0.23) 순으로 높습니다.\r
  tips:\r
  - corr()는 모든 변수 쌍의 피어슨 상관계수를 계산합니다. 대각선은 자기 자신과의 상관이므로 항상 1.0입니다. TV와 Radio는 0.05로 거의 무상관이지만, TV와 Newspaper는\r
    0.06으로 약한 양의 상관입니다. Sales와 각 광고비의 상관을 보면 TV(0.78), Radio(0.58), Newspaper(0.23) 순으로 높습니다.\r
  snippet: adData.corr()\r
  exercise:\r
    prompt: 2단계. 변수 간 상관관계 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: adData.corr()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 변수 간 상관관계의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 2단계. 변수 간 상관관계 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step3_multiple_regression\r
  title: 3단계. 다중회귀 모델 학습\r
  structuredPrimary: true\r
  subtitle: 3개 변수 모두 사용\r
  goal: 3단계. 다중회귀 모델 학습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    TV, Radio, Newspaper 광고비를 모두 독립변수로 사용하여 매출을 예측합니다. 다중회귀식은 y = β₀ + β₁X₁ + β₂X₂ + β₃X₃ 형태로, 각 변수의 계수 β는 '다른 변수를 고정했을 때' 해당 변수의 순수 효과를 나타냅니다. 예를 들어 TV 계수가 0.046이면 Radio와 Newspaper 광고비가 같을 때 TV 광고비 1천 달러 증가 시 매출이 46개 증가한다는 뜻입니다. 01 프로젝트의 단순회귀와 코드는 같지만 X DataFrame에 여러 컬럼을 포함한다는 차이가 있습니다.\r
\r
    adData[['TV', 'Radio', 'Newspaper']]는 대괄호 2개로 여러 컬럼을 선택하여 DataFrame을 반환합니다. add_constant()는 절편용 const 컬럼을 추가하며, 01 프로젝트에서 배운 필수 단계입니다. OLS(y, X).fit()으로 최소제곱법으로 3개 계수를 동시에 추정합니다.\r
  tips:\r
  - adData[['TV', 'Radio', 'Newspaper']]는 대괄호 2개로 여러 컬럼을 선택하여 DataFrame을 반환합니다. add_constant()는 절편용 const\r
    컬럼을 추가하며, 01 프로젝트에서 배운 필수 단계입니다. OLS(y, X).fit()으로 최소제곱법으로 3개 계수를 동시에 추정합니다.\r
  snippet: |-\r
    XRaw = adData[['TV', 'Radio', 'Newspaper']]\r
    y = adData['Sales']\r
    X = sm.add_constant(XRaw)\r
\r
    modelAll = sm.OLS(y, X).fit()\r
    modelAll.summary()\r
  exercise:\r
    prompt: 3단계. 다중회귀 모델 학습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      XRaw = adData[['TV', 'Radio', 'Newspaper']]\r
      y = adData['Sales']\r
      X = sm.add_constant(XRaw)\r
\r
      modelAll = sm.OLS(y, X).fit()\r
      modelAll.summary()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 다중회귀 모델 학습에서 \`XRaw\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 다중회귀 모델 학습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_interpret_coefficients\r
  title: 4단계. 계수 해석\r
  structuredPrimary: true\r
  subtitle: 각 광고 매체의 효과\r
  goal: 4단계. 계수 해석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: |-\r
    다중회귀 계수는 '다른 변수를 고정했을 때'라는 중요한 조건이 붙습니다. TV 계수 0.046은 Radio와 Newspaper 광고비가 같을 때 TV 광고비 1천 달러 증가 시 매출 46개 증가를 의미합니다. 01 프로젝트의 단순회귀 TV 계수(0.048)와 다중회귀 TV 계수(0.046)가 다른 이유는 다른 변수의 영향을 통제(control)했기 때문입니다. 특히 Newspaper 계수가 0에 가깝거나 음수라면, Radio와 TV를 고려했을 때 Newspaper의 순수 효과는 미미하다는 뜻입니다.\r
\r
    params는 절편(const)과 각 변수의 기울기를 보여줍니다. TV 계수가 0.046이면 다른 광고비를 고정하고 TV 광고비만 1천 달러 늘리면 매출이 46개 증가합니다. Newspaper 계수가 음수나 0에 가까우면 Newspaper 광고는 다른 매체를 고려했을 때 효과가 미미하다는 뜻입니다.\r
  tips:\r
  - params는 절편(const)과 각 변수의 기울기를 보여줍니다. TV 계수가 0.046이면 다른 광고비를 고정하고 TV 광고비만 1천 달러 늘리면 매출이 46개 증가합니다.\r
    Newspaper 계수가 음수나 0에 가까우면 Newspaper 광고는 다른 매체를 고려했을 때 효과가 미미하다는 뜻입니다.\r
  snippet: modelAll.params\r
  exercise:\r
    prompt: 4단계. 계수 해석 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: modelAll.params\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 계수 해석의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 4단계. 계수 해석 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step5_rsquared_comparison\r
  title: 5단계. R² 비교\r
  structuredPrimary: true\r
  subtitle: 단순회귀 vs 다중회귀\r
  goal: 5단계. R² 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    다중회귀의 R²는 단순회귀보다 항상 크거나 같습니다. 변수를 추가하면 R²는 자동으로 증가하므로, Adjusted R²(조정된 R²)로 비교해야 합니다. Adjusted R²는 변수 개수에 페널티를 부여하여 변수 추가가 실제로 모델을 개선하는지 판단합니다. 02 프로젝트에서 배운 Adjusted R² 개념을 모델 비교에 활용합니다.\r
\r
    rsquared는 R², rsquared_adj는 Adjusted R²입니다. TV만 사용한 모델의 R²가 0.61, 3개 변수 모델이 0.90이면 설명력이 크게 향상되었습니다. Adjusted R²도 함께 증가하면 변수 추가가 실제로 도움이 되는 것입니다.\r
  tips:\r
  - rsquared는 R², rsquared_adj는 Adjusted R²입니다. TV만 사용한 모델의 R²가 0.61, 3개 변수 모델이 0.90이면 설명력이 크게 향상되었습니다.\r
    Adjusted R²도 함께 증가하면 변수 추가가 실제로 도움이 되는 것입니다.\r
  snippet: |-\r
    XTvRaw = adData[['TV']]\r
    XTv = sm.add_constant(XTvRaw)\r
    modelTv = sm.OLS(y, XTv).fit()\r
\r
    f"TV만: R² = {modelTv.rsquared:.4f}, Adj R² = {modelTv.rsquared_adj:.4f}"\r
    f"전체: R² = {modelAll.rsquared:.4f}, Adj R² = {modelAll.rsquared_adj:.4f}"\r
  exercise:\r
    prompt: 5단계. R² 비교 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      XTvRaw = adData[['TV']]\r
      XTv = sm.add_constant(XTvRaw)\r
      modelTv = sm.OLS(y, XTv).fit()\r
\r
      f"TV만: R² = {modelTv.rsquared:.4f}, Adj R² = {modelTv.rsquared_adj:.4f}"\r
      f"전체: R² = {modelAll.rsquared:.4f}, Adj R² = {modelAll.rsquared_adj:.4f}"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. R² 비교에서 \`XTvRaw\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. R² 비교 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_vif\r
  title: 6단계. VIF로 다중공선성 진단\r
  structuredPrimary: true\r
  subtitle: 변수 독립성 확인\r
  goal: 6단계. VIF로 다중공선성 진단에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    VIF(Variance Inflation Factor, 분산팽창인자)는 다중공선성을 정량적으로 측정하는 지표입니다. VIF=1은 완전 독립, VIF>10이면 심각한 다중공선성으로 변수 제거를 고려해야 합니다. VIF는 각 독립변수를 다른 독립변수들로 회귀했을 때 R²를 사용하여 VIF = 1/(1-R²)로 계산됩니다. 예를 들어 TV를 Radio와 Newspaper로 예측했을 때 R²=0.9이면 VIF=10으로 높은 다중공선성을 의미합니다.\r
\r
    variance_inflation_factor(X, i)는 i번째 변수의 VIF를 계산합니다. XRaw.values는 DataFrame을 numpy 배열로 변환하며, range(XRaw.shape[1])은 컬럼 개수만큼 반복합니다. VIF < 5면 문제없음, 5-10이면 주의, >10이면 다중공선성 문제가 있어 변수 제거를 고려해야 합니다.\r
  tips:\r
  - variance_inflation_factor(X, i)는 i번째 변수의 VIF를 계산합니다. XRaw.values는 DataFrame을 numpy 배열로 변환하며, range(XRaw.shape[1])은\r
    컬럼 개수만큼 반복합니다. VIF < 5면 문제없음, 5-10이면 주의, >10이면 다중공선성 문제가 있어 변수 제거를 고려해야 합니다.\r
  snippet: |-\r
    from statsmodels.stats.outliers_influence import variance_inflation_factor\r
\r
    vifData = pd.DataFrame()\r
    vifData['Feature'] = XRaw.columns\r
    vifData['VIF'] = [variance_inflation_factor(XRaw.values, i) for i in range(XRaw.shape[1])]\r
    vifData\r
  exercise:\r
    prompt: 6단계. VIF로 다중공선성 진단 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from statsmodels.stats.outliers_influence import variance_inflation_factor\r
\r
      vifData = pd.DataFrame()\r
      vifData['Feature'] = XRaw.columns\r
      vifData['VIF'] = [variance_inflation_factor(XRaw.values, i) for i in range(XRaw.shape[1])]\r
      vifData\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. VIF로 다중공선성 진단의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 6단계. VIF로 다중공선성 진단 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step7_vif_viz\r
  title: 7단계. VIF 시각화\r
  structuredPrimary: true\r
  subtitle: 다중공선성 시각화\r
  goal: 7단계. VIF 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    VIF를 막대 그래프로 시각화하면 어떤 변수가 다중공선성 문제가 있는지 한눈에 파악할 수 있습니다. VIF < 5면 녹색(안전), 5-10이면 노란색(주의), > 10이면 빨간색(위험)으로 표시합니다.\r
\r
    녹색(VIF < 5)은 안전, 노란색(5-10)은 주의, 빨간색(> 10)은 변수 제거 고려입니다. 점선은 5와 10 기준선입니다.\r
  snippet: |-\r
    import altair as alt\r
\r
    vifData['Risk'] = vifData['VIF'].apply(lambda x: 'Safe' if x < 5 else ('Warning' if x < 10 else 'Danger'))\r
\r
    vifChart = alt.Chart(vifData).mark_bar().encode(\r
        x=alt.X('VIF:Q', title='VIF', scale=alt.Scale(domain=[0, 12])),\r
        y=alt.Y('Feature:N', sort='-x', title='Variable'),\r
        color=alt.Color('Risk:N', scale=alt.Scale(domain=['Safe', 'Warning', 'Danger'], range=['#2ecc71', '#f39c12', '#e74c3c']))\r
    ).properties(width=400, height=150, title='VIF by Variable')\r
\r
    threshLine = alt.Chart(pd.DataFrame({'x': [5, 10]})).mark_rule(strokeDash=[3, 3]).encode(\r
        x='x:Q', color=alt.value('gray')\r
    )\r
    vifChart + threshLine\r
  exercise:\r
    prompt: 7단계. VIF 시각화 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import altair as alt\r
\r
      vifData['Risk'] = vifData['VIF'].apply(lambda x: 'Safe' if x < 5 else ('Warning' if x < 10 else 'Danger'))\r
\r
      vifChart = alt.Chart(vifData).mark_bar().encode(\r
          x=alt.X('VIF:Q', title='VIF', scale=alt.Scale(domain=[0, 12])),\r
          y=alt.Y('Feature:N', sort='-x', title='Variable'),\r
          color=alt.Color('Risk:N', scale=alt.Scale(domain=['Safe', 'Warning', 'Danger'], range=['#2ecc71', '#f39c12', '#e74c3c']))\r
      ).properties(width=400, height=150, title='VIF by Variable')\r
\r
      threshLine = alt.Chart(pd.DataFrame({'x': [5, 10]})).mark_rule(strokeDash=[3, 3]).encode(\r
          x='x:Q', color=alt.value('gray')\r
      )\r
      vifChart + threshLine\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. VIF 시각화의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.\r
    resultCheck: 7단계. VIF 시각화 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.\r
- id: step8_pvalues\r
  title: 8단계. p-value로 변수 유의성 확인\r
  structuredPrimary: true\r
  subtitle: 통계적 유의성 검정\r
  goal: 8단계. pvalue로 변수 유의성 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: |-\r
    p-value는 해당 변수가 종속변수에 실제로 영향을 미치는지 통계적으로 검정하는 지표입니다. 귀무가설(H₀)은 '계수가 0이다(영향 없음)'이며, p-value < 0.05면 귀무가설을 기각하여 95% 신뢰수준에서 유의미한 영향이 있다고 판단합니다. 0.05 이상이면 우연일 가능성이 높아 변수 제거를 고려합니다. summary()의 P>|t| 컬럼이 p-value이며, Newspaper의 p-value가 0.86으로 높으면 다른 변수를 고려했을 때 Newspaper는 통계적으로 유의미한 효과가 없다는 뜻입니다.\r
\r
    pvalues는 각 변수의 p-value를 Series로 반환합니다. drop('const')는 절편을 제외하고 독립변수만 확인합니다. p-value가 0.000이면 거의 확실히 영향을 미치며, 0.860이면 86% 확률로 우연이므로 효과가 없을 가능성이 높습니다.\r
  tips:\r
  - pvalues는 각 변수의 p-value를 Series로 반환합니다. drop('const')는 절편을 제외하고 독립변수만 확인합니다. p-value가 0.000이면 거의 확실히\r
    영향을 미치며, 0.860이면 86% 확률로 우연이므로 효과가 없을 가능성이 높습니다.\r
  snippet: modelAll.pvalues.drop('const')\r
  exercise:\r
    prompt: 8단계. pvalue로 변수 유의성 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: modelAll.pvalues.drop('const')\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. pvalue로 변수 유의성 확인의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 8단계. pvalue로 변수 유의성 확인 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step9_remove_newspaper\r
  title: 9단계. 유의미하지 않은 변수 제거\r
  structuredPrimary: true\r
  subtitle: TV + Radio 모델\r
  goal: 9단계. 유의미하지 않은 변수 제거에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Newspaper의 p-value가 0.05보다 높으면 이 변수를 제거하고 TV와 Radio만으로 모델을 다시 학습합니다. 변수 제거 후 R²는 약간 감소할 수 있지만, Adjusted R²가 유지되거나 오히려 증가하면 제거한 변수는 불필요했다는 증거입니다. 더 간결한 모델은 해석이 쉽고, 불필요한 변수를 제거하면 과적합(overfitting)을 방지하여 새로운 데이터에 대한 예측 안정성이 향상됩니다. 이것이 '파시모니(parsimony) 원칙', 즉 간결한 모델이 좋은 모델이라는 통계학의 핵심 원칙입니다.\r
\r
    변수를 제거했는데 Adjusted R²가 거의 같거나 증가하면 제거한 변수는 불필요했다는 뜻입니다. R²는 0.90에서 0.897로 약간 감소했지만 Adjusted R²는 거의 유지되면 TV+Radio 모델이 더 간결하고 실용적입니다.\r
  tips:\r
  - 변수를 제거했는데 Adjusted R²가 거의 같거나 증가하면 제거한 변수는 불필요했다는 뜻입니다. R²는 0.90에서 0.897로 약간 감소했지만 Adjusted R²는 거의\r
    유지되면 TV+Radio 모델이 더 간결하고 실용적입니다.\r
  snippet: |-\r
    XTvRadioRaw = adData[['TV', 'Radio']]\r
    XTvRadio = sm.add_constant(XTvRadioRaw)\r
    modelTvRadio = sm.OLS(y, XTvRadio).fit()\r
\r
    f"전체(3개): R² = {modelAll.rsquared:.4f}, Adj R² = {modelAll.rsquared_adj:.4f}"\r
    f"TV+Radio: R² = {modelTvRadio.rsquared:.4f}, Adj R² = {modelTvRadio.rsquared_adj:.4f}"\r
  exercise:\r
    prompt: 9단계. 유의미하지 않은 변수 제거 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      XTvRadioRaw = adData[['TV', 'Radio']]\r
      XTvRadio = sm.add_constant(XTvRadioRaw)\r
      modelTvRadio = sm.OLS(y, XTvRadio).fit()\r
\r
      f"전체(3개): R² = {modelAll.rsquared:.4f}, Adj R² = {modelAll.rsquared_adj:.4f}"\r
      f"TV+Radio: R² = {modelTvRadio.rsquared:.4f}, Adj R² = {modelTvRadio.rsquared_adj:.4f}"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 유의미하지 않은 변수 제거에서 \`XTvRadioRaw\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 유의미하지 않은 변수 제거 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step10_interaction\r
  title: 10단계. 상호작용 효과\r
  structuredPrimary: true\r
  subtitle: TV × Radio\r
  goal: 10단계. 상호작용 효과에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    상호작용(interaction)은 두 변수가 함께 작용할 때 발생하는 추가 효과입니다. TV와 Radio 광고를 동시에 집행하면 시너지 효과로 개별 효과의 합보다 더 큰 매출 증가가 발생할 수 있습니다. 예를 들어 TV만 보던 소비자가 Radio에서 같은 광고를 들으면 기억이 강화되어 구매 전환율이 높아집니다. 상호작용항은 TV × Radio를 새로운 변수로 추가하며, 계수가 양수면 시너지 효과(1+1>2), 음수면 상쇄 효과(1+1<2)를 의미합니다. 마케팅 믹스 최적화에서 매우 중요한 개념입니다.\r
\r
    adData['TV'] * adData['Radio']는 요소별 곱셈으로 새로운 컬럼을 만듭니다. 상호작용 계수가 0.001이면 TV와 Radio를 각각 100씩 증가시킬 때 개별 효과 외에 추가로 0.001×100×100=10개 매출 증가가 발생합니다. R²가 증가하고 p-value < 0.05면 상호작용이 유의미합니다.\r
  tips:\r
  - adData['TV'] * adData['Radio']는 요소별 곱셈으로 새로운 컬럼을 만듭니다. 상호작용 계수가 0.001이면 TV와 Radio를 각각 100씩 증가시킬 때\r
    개별 효과 외에 추가로 0.001×100×100=10개 매출 증가가 발생합니다. R²가 증가하고 p-value < 0.05면 상호작용이 유의미합니다.\r
  snippet: |-\r
    adDataInteraction = adData.copy()\r
    adDataInteraction['TV_Radio'] = adDataInteraction['TV'] * adDataInteraction['Radio']\r
\r
    XInteractionRaw = adDataInteraction[['TV', 'Radio', 'TV_Radio']]\r
    XInteraction = sm.add_constant(XInteractionRaw)\r
    modelInteraction = sm.OLS(y, XInteraction).fit()\r
\r
    f"상호작용 R²: {modelInteraction.rsquared:.4f}"\r
    f"TV_Radio 계수: {modelInteraction.params['TV_Radio']:.6f}"\r
  exercise:\r
    prompt: 10단계. 상호작용 효과 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      adDataInteraction = adData.copy()\r
      adDataInteraction['TV_Radio'] = adDataInteraction['TV'] * adDataInteraction['Radio']\r
\r
      XInteractionRaw = adDataInteraction[['TV', 'Radio', 'TV_Radio']]\r
      XInteraction = sm.add_constant(XInteractionRaw)\r
      modelInteraction = sm.OLS(y, XInteraction).fit()\r
\r
      f"상호작용 R²: {modelInteraction.rsquared:.4f}"\r
      f"TV_Radio 계수: {modelInteraction.params['TV_Radio']:.6f}"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 상호작용 효과에서 \`adDataInteraction\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 상호작용 효과 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step11_coef_comparison\r
  title: 11단계. 모델별 계수 비교\r
  structuredPrimary: true\r
  subtitle: 시각화\r
  goal: 11단계. 모델별 계수 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    단순회귀와 다중회귀의 계수를 비교하면 변수 추가가 각 계수에 미치는 영향을 파악할 수 있습니다. Newspaper 계수가 단순회귀에서는 양수였다가 다중회귀에서 0에 가까워지면, 다른 변수를 통제했을 때 실제 효과가 없다는 뜻입니다.\r
\r
    파란색은 단순회귀 계수, 주황색은 다중회귀 계수입니다. Newspaper가 다중회귀에서 0에 가까워지면 다른 변수 효과를 통제했을 때 실제 효과가 미미하다는 뜻입니다.\r
  snippet: |-\r
    import seaborn as sns\r
    import matplotlib.pyplot as plt\r
\r
    coefCompare = pd.DataFrame({\r
        'Variable': ['TV', 'Radio', 'Newspaper'],\r
        'Simple': [modelTv.params['TV'], radioModel.params['Radio'] if 'radioModel' in dir() else 0.2, 0.055],\r
        'Multiple': [modelAll.params['TV'], modelAll.params['Radio'], modelAll.params['Newspaper']]\r
    })\r
\r
    coefMelt = coefCompare.melt(id_vars='Variable', var_name='Model', value_name='Coefficient')\r
    coefFig, coefAx = plt.subplots(figsize=(8, 4))\r
    sns.barplot(data=coefMelt, x='Variable', y='Coefficient', hue='Model', ax=coefAx)\r
    coefAx.set_title('Simple vs Multiple Regression Coefficients')\r
    coefAx.axhline(y=0, color='gray', linestyle='--', alpha=0.5)\r
    coefFig\r
  exercise:\r
    prompt: 11단계. 모델별 계수 비교 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      import matplotlib.pyplot as plt\r
\r
      coefCompare = pd.DataFrame({\r
          'Variable': ['TV', 'Radio', 'Newspaper'],\r
          'Simple': [modelTv.params['TV'], radioModel.params['Radio'] if 'radioModel' in dir() else 0.2, 0.055],\r
          'Multiple': [modelAll.params['TV'], modelAll.params['Radio'], modelAll.params['Newspaper']]\r
      })\r
\r
      coefMelt = coefCompare.melt(id_vars='Variable', var_name='Model', value_name='Coefficient')\r
      coefFig, coefAx = plt.subplots(figsize=(8, 4))\r
      sns.barplot(data=coefMelt, x='Variable', y='Coefficient', hue='Model', ax=coefAx)\r
      coefAx.set_title('Simple vs Multiple Regression Coefficients')\r
      coefAx.axhline(y=0, color='gray', linestyle='--', alpha=0.5)\r
      coefFig\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 모델별 계수 비교의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.\r
    resultCheck: 11단계. 모델별 계수 비교 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.\r
- id: step12_predict\r
  title: 12단계. 최종 모델로 예측\r
  structuredPrimary: true\r
  subtitle: 새로운 광고 예산 시나리오\r
  goal: 12단계. 최종 모델로 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    최종 선택한 TV+Radio 모델로 새로운 광고 예산 시나리오의 매출을 예측합니다. 예를 들어 TV 광고비 200천 달러, Radio 30천 달러 투입 시 예상 매출을 계산하여 마케팅 예산 배분 의사결정에 활용합니다. 01 프로젝트에서 배운 predict() 사용법을 다중회귀에 적용하며, 여러 변수 값을 포함한 DataFrame을 입력합니다. 다양한 시나리오를 시뮬레이션하면 최적 예산 배분을 찾을 수 있습니다.\r
\r
    predict()는 학습된 계수로 y = β₀ + β₁X₁ + β₂X₂를 계산합니다. newScenario는 모델 학습 시 X와 같은 컬럼(const, TV, Radio)을 가져야 하며, 순서는 상관없지만 이름은 정확히 일치해야 합니다. [0]은 예측값 배열의 첫 번째 원소를 추출합니다.\r
  tips:\r
  - predict()는 학습된 계수로 y = β₀ + β₁X₁ + β₂X₂를 계산합니다. newScenario는 모델 학습 시 X와 같은 컬럼(const, TV, Radio)을 가져야\r
    하며, 순서는 상관없지만 이름은 정확히 일치해야 합니다. [0]은 예측값 배열의 첫 번째 원소를 추출합니다.\r
  snippet: |-\r
    newScenario = pd.DataFrame({'const': [1], 'TV': [200], 'Radio': [30]})\r
    predictedSales = modelTvRadio.predict(newScenario)[0]\r
    f"예상 매출: {predictedSales:.2f}천 개"\r
  exercise:\r
    prompt: 12단계. 최종 모델로 예측 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      newScenario = pd.DataFrame({'const': [1], 'TV': [200], 'Radio': [30]})\r
      predictedSales = modelTvRadio.predict(newScenario)[0]\r
      f"예상 매출: {predictedSales:.2f}천 개"\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 최종 모델로 예측의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 최종 모델로 예측의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 다중회귀 마스터 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    마케팅 전략 분석가가 되어 최적 광고 믹스를 찾아냅니다. 각 미션은 데이터 로딩부터 다중회귀 모델링, VIF 분석, 최적화까지 전체 과정을 독립적으로 수행합니다. 01-05 프로젝트에서 배운 모든 기법과 이번 프로젝트의 심화 내용을 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import statsmodels.api as sm\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    cmpData = loadLocalDataset("advertising")\r
    cmpY = cmpData['Sales']\r
\r
    tvX = sm.add_constant(cmpData[['TV']])\r
    radioX = sm.add_constant(cmpData[['Radio']])\r
    newsX = sm.add_constant(cmpData[['Newspaper']])\r
\r
    tvModel = sm.OLS(cmpY, tvX).fit()\r
    radioModel = sm.OLS(cmpY, radioX).fit()\r
    newsModel = sm.OLS(cmpY, newsX).fit()\r
    tvModel.rsquared\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import statsmodels.api as sm\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      cmpData = loadLocalDataset("advertising")\r
      cmpY = cmpData['Sales']\r
\r
      tvX = sm.add_constant(cmpData[['TV']])\r
      radioX = sm.add_constant(cmpData[['Radio']])\r
      newsX = sm.add_constant(cmpData[['Newspaper']])\r
\r
      tvModel = sm.OLS(cmpY, tvX).fit()\r
      radioModel = sm.OLS(cmpY, radioX).fit()\r
      newsModel = sm.OLS(cmpY, newsX).fit()\r
      tvModel.rsquared\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 여섯 번째 프로젝트 완료!\r
  blocks:\r
  - type: text\r
    content: 이번 프로젝트에서는 Advertising 데이터로 TV, Radio, Newspaper 3개 광고 매체를 모두 사용한 다중회귀 모델을 만들었습니다. VIF로 다중공선성을\r
      진단하고, p-value로 Newspaper가 유의미하지 않음을 확인하여 TV+Radio 모델을 최종 선택했습니다. 상호작용 효과도 분석하여 TV와 Radio의 시너지를 발견했으며,\r
      Adjusted R² 0.897로 높은 설명력을 달성했습니다. 이제 다중회귀의 핵심 개념인 변수 선택, 다중공선성 진단, 모델 비교를 활용하여 실전 마케팅 의사결정을 수행할\r
      수 있습니다.\r
  - type: list\r
    items:\r
    - 다중회귀 - 여러 독립변수로 동시 예측\r
    - VIF - 다중공선성 정량적 측정 (>10이면 문제)\r
    - p-value - 변수 유의성 검정 (<0.05면 유의미)\r
    - Adjusted R² - 변수 개수 고려한 모델 평가\r
    - 상호작용 - 변수 간 시너지 효과 분석\r
    - 변수 선택 - 불필요한 변수 제거로 간결한 모델\r
  - type: text\r
    content: 다음 프로젝트에서는 시계열 데이터를 다룹니다. 지금까지 배운 회귀분석 기법과 시계열 특성을 결합하여 시간에 따라 변하는 패턴을 분석하고 미래를 예측하는 고급 기법을\r
      익힙니다.\r
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