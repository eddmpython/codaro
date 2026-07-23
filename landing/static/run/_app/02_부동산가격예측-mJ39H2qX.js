var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - plotly\r
  - scipy\r
  - seaborn\r
  - statsmodels\r
  id: statsmodels_02\r
  title: 부동산가격예측\r
  order: 2\r
  category: statsmodels\r
  difficulty: ⭐⭐\r
  badge: 입문\r
  dataSource: codaro-local:boston_housing\r
  tags:\r
  - 다중회귀\r
  - 특성선택\r
  - 잔차분석\r
  - 부동산\r
  - 가격예측\r
  seo:\r
    title: statsmodels 다중선형회귀 - 보스턴 주택 가격 예측\r
    description: 여러 변수로 집값을 예측하는 다중선형회귀 모델을 구축합니다. 특성 선택과 잔차 분석을 배웁니다.\r
    keywords:\r
    - statsmodels\r
    - 다중회귀\r
    - 특성선택\r
    - 잔차분석\r
    - 부동산가격\r
    - VIF\r
intro:\r
  emoji: 🏠\r
  goal: 방 개수, 범죄율 등 여러 요인으로 주택 가격을 예측합니다.\r
  description: 보스턴 지역 506개 주택의 13가지 특성으로 집값을 예측합니다. 어떤 요인이 가격에 가장 큰 영향을 미치는지 분석하여 부동산 가격 책정에 활용할 수 있습니다.\r
  direction: 부동산가격예측에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 부동산가격예측 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 불러오기 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 미리보기 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 기초 통계량 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 부동산가격예측 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: matplotlib, numpy, pandas, plotly 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 부동산가격예측 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 부동산가격예측 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_load\r
  title: 1단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: 보스턴 주택 데이터셋\r
  goal: 1단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: Boston Housing 데이터셋은 1970년대 보스턴 지역 506개 주택의 13개 특성(방 개수, 범죄율, 세금, 학생-교사 비율 등)과 중앙값 가격(MEDV)을\r
    담고 있습니다. 통계학과 머신러닝 교육에서 가장 많이 사용되는 대표적인 벤치마크 데이터셋입니다. 이 데이터로 어떤 요인이 집값에 가장 큰 영향을 미치는지 분석하면, 부동산 가격\r
    책정, 투자 의사결정, 도시 계획 정책 수립에 활용할 수 있습니다. 실제 부동산 회사에서도 유사한 분석으로 적정 가격을 산출합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    import statsmodels.api as sm\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    bostonData = loadLocalDataset("boston_housing")\r
    bostonData.shape\r
  exercise:\r
    prompt: 1단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import statsmodels.api as sm\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      bostonData = loadLocalDataset("boston_housing")\r
      bostonData.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_head\r
  title: 2단계. 데이터 미리보기\r
  structuredPrimary: true\r
  subtitle: 컬럼 확인\r
  goal: 2단계. 데이터 미리보기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: 주요 컬럼은 CRIM(인구 1인당 범죄율), RM(평균 방 개수), TAX(10,000달러당 재산세율), LSTAT(저소득층 인구 비율), MEDV(주택 가격\r
    중앙값, 천 달러 단위)입니다. MEDV가 종속변수(예측할 값)이고 나머지 13개가 독립변수(예측에 사용할 값)입니다. 각 컬럼의 의미를 정확히 이해해야 회귀 계수를 올바르게\r
    해석할 수 있으며, 예를 들어 RM 계수가 양수이면 방이 많을수록 집값이 비싸다는 것을 의미합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: bostonData.head()\r
  exercise:\r
    prompt: 2단계. 데이터 미리보기 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: bostonData.head()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 미리보기의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 2단계. 데이터 미리보기 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step3_describe\r
  title: 3단계. 기초 통계량\r
  structuredPrimary: true\r
  subtitle: 데이터 범위 확인\r
  goal: 3단계. 기초 통계량에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: describe()로 각 변수의 평균, 표준편차, 최소/최대값을 확인합니다. RM(방 개수)의 평균은 6.3개, MEDV(가격)의 평균은 22.5천 달러입니다.\r
    주목할 점은 변수들의 스케일이 크게 다르다는 것입니다. CRIM은 0에서 89까지, RM은 3에서 9까지, TAX는 187에서 711까지 범위가 다릅니다. 회귀 계수 크기를 직접\r
    비교하려면 표준화가 필요하지만, OLS 회귀 자체는 스케일에 영향받지 않아 표준화 없이도 정확한 예측이 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: bostonData.describe()\r
  exercise:\r
    prompt: 3단계. 기초 통계량 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: bostonData.describe()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 기초 통계량의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 3단계. 기초 통계량 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step4_corr\r
  title: 4단계. 상관관계 분석\r
  structuredPrimary: true\r
  subtitle: 변수 간 관계 파악\r
  goal: 4단계. 상관관계 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: |-\r
    다중회귀분석을 하기 전에 변수 간 상관관계(correlation)를 확인하는 것은 필수 단계입니다. 상관계수는 -1에서 1 사이 값으로 두 변수가 함께 움직이는 정도를 나타내며, 1에 가까우면 강한 양의 상관(한 변수 증가 → 다른 변수도 증가), -1에 가까우면 강한 음의 상관(한 변수 증가 → 다른 변수 감소)입니다. 이 데이터에서 RM(방 개수)과 MEDV(가격)는 +0.7의 양의 상관관계를 보여 방이 많을수록 집값이 비싸고, LSTAT(저소득층 비율)과 MEDV는 -0.74의 음의 상관관계로 저소득층이 많은 지역일수록 집값이 쌉니다. 상관관계가 너무 높은 독립변수들끼리는(예로 0.9 이상) 다중공선성(multicollinearity) 문제를 일으켜 계수 해석이 불안정해지므로, 하나를 제거하거나 주성분 분석으로 결합해야 합니다.\r
\r
    corr()는 상관계수 행렬을 반환합니다. -1~1 사이 값으로, 1에 가까우면 강한 양의 상관, -1에 가까우면 강한 음의 상관입니다. ['MEDV']로 MEDV와 다른 변수들의 상관관계만 추출했습니다.\r
  tips:\r
  - corr()는 상관계수 행렬을 반환합니다. -1~1 사이 값으로, 1에 가까우면 강한 양의 상관, -1에 가까우면 강한 음의 상관입니다. ['MEDV']로 MEDV와 다른 변수들의\r
    상관관계만 추출했습니다.\r
  snippet: bostonData.corr()['medv'].sort_values(ascending=False)\r
  exercise:\r
    prompt: 4단계. 상관관계 분석 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: bostonData.corr()['medv'].sort_values(ascending=False)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 상관관계 분석의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 4단계. 상관관계 분석 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step5_select_features\r
  title: 5단계. 주요 변수 선택\r
  structuredPrimary: true\r
  subtitle: 상관관계 기반 특성 선택\r
  goal: 5단계. 주요 변수 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    모든 13개 변수를 사용할 수도 있지만, 먼저 MEDV와 상관관계가 높은 5개 변수로 시작합니다. RM(방 개수, +0.70), LSTAT(저소득층 비율, -0.74), PTRATIO(학생-교사 비율, -0.51), INDUS(비소매 비즈니스 비율, -0.48), TAX(재산세, -0.47)를 선택합니다. 변수를 줄이면 모델 해석이 쉬워지고, 불필요한 변수를 포함했을 때 발생하는 과적합(overfitting)을 방지할 수 있습니다. 실무에서도 모든 변수를 투입하기보다 비즈니스 의미가 있는 핵심 변수를 선별하는 것이 중요합니다.\r
\r
    리스트 ['RM', 'LSTAT', ...]는 대괄호 []로 여러 값을 묶은 것으로, 여러 컬럼 이름을 한번에 지정할 때 사용합니다. bostonData[['RM', 'LSTAT']]처럼 DataFrame에 리스트를 넣으면 해당 컬럼들만 추출하며, 결과는 자동으로 DataFrame(2차원 표)이 됩니다. features = [...] 형태로 변수에 저장하면 나중에 재사용할 수 있어 코드가 깔끔해집니다. =(등호)는 할당 연산자로 오른쪽 값을 왼쪽 변수에 저장합니다.\r
  tips:\r
  - 리스트 ['RM', 'LSTAT', ...]는 대괄호 []로 여러 값을 묶은 것으로, 여러 컬럼 이름을 한번에 지정할 때 사용합니다. bostonData[['RM', 'LSTAT']]처럼\r
    DataFrame에 리스트를 넣으면 해당 컬럼들만 추출하며, 결과는 자동으로 DataFrame(2차원 표)이 됩니다. features = [...] 형태로 변수에 저장하면 나중에\r
    재사용할 수 있어 코드가 깔끔해집니다. =(등호)는 할당 연산자로 오른쪽 값을 왼쪽 변수에 저장합니다.\r
  snippet: |-\r
    features = ['rm', 'lstat', 'ptratio', 'indus', 'tax']\r
    X = bostonData[features]\r
    y = bostonData['medv']\r
  exercise:\r
    prompt: 5단계. 주요 변수 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      features = ['rm', 'lstat', 'ptratio', 'indus', 'tax']\r
      X = bostonData[features]\r
      y = bostonData['medv']\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 주요 변수 선택에서 \`features\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 주요 변수 선택 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_add_constant\r
  title: 6단계. 상수항 추가\r
  structuredPrimary: true\r
  subtitle: 절편 계산\r
  goal: 6단계. 상수항 추가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 01 프로젝트에서 배운 것처럼 statsmodels는 절편(intercept)을 자동으로 추가하지 않습니다. add_constant()로 값이 모두 1인 const\r
    컬럼을 추가해야 절편이 계산됩니다. 절편은 모든 독립변수가 0일 때의 기본 집값을 의미하며, 회귀식 y = β₀ + β₁X₁ + β₂X₂ + ...에서 β₀에 해당합니다. sklearn과\r
    달리 statsmodels는 이 과정을 명시적으로 수행해야 하며, 이는 통계적 투명성을 위한 설계입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    XWithConst = sm.add_constant(X)\r
    XWithConst.head()\r
  exercise:\r
    prompt: 6단계. 상수항 추가 예제에서 \`XWithConst\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      XWithConst = sm.add_constant(X)\r
      XWithConst.head()\r
    hints:\r
    - 바꿀 지점은 \`XWithConst = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`XWithConst\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 상수항 추가에서 \`XWithConst\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 상수항 추가 실행 뒤 \`XWithConst\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step7_fit_model\r
  title: 7단계. 다중회귀 모델 학습\r
  structuredPrimary: true\r
  subtitle: 5개 변수로 예측\r
  goal: 7단계. 다중회귀 모델 학습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: OLS(y, X).fit()으로 다중회귀 모델을 학습합니다. 다중회귀(multiple regression)는 여러 독립변수(X1, X2, X3...)를 동시에\r
    사용하여 종속변수(y)를 예측하는 방법으로, 단순회귀가 "직선"을 찾는다면 다중회귀는 "평면" 또는 "고차원 공간"을 찾습니다. 사용법은 단순회귀와 같지만, X가 여러 컬럼을\r
    가진 DataFrame이라는 차이가 있습니다. 최소제곱법으로 각 변수의 회귀 계수를 동시에 계산하며, 수식은 y = β₀ + β₁X₁ + β₂X₂ + ... 형태입니다. 예를\r
    들어 집값 = 절편 + (방개수 계수 × 방개수) + (범죄율 계수 × 범죄율)로 표현됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: model = sm.OLS(y, XWithConst).fit()\r
  exercise:\r
    prompt: 7단계. 다중회귀 모델 학습 예제에서 \`model\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: model = sm.OLS(y, XWithConst).fit()\r
    hints:\r
    - 바꿀 지점은 \`model = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 다중회귀 모델 학습에서 \`model\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 다중회귀 모델 학습 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step8_summary\r
  title: 8단계. 결과 요약\r
  structuredPrimary: true\r
  subtitle: summary 해석\r
  goal: 8단계. 결과 요약에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: |-\r
    summary()에서 R²는 약 0.69로, 선택한 5개 변수가 주택 가격 변동의 69%를 설명합니다. 각 변수의 P>|t| 값(p-value)이 0.05보다 작으면 해당 변수가 통계적으로 유의미하게 가격에 영향을 미친다는 뜻입니다. coef(계수)는 다른 변수를 고정했을 때의 순수 영향력을 나타내며, 예를 들어 RM 계수가 4.09이면 다른 조건이 같을 때 방 1개 추가 시 집값이 4,090달러 상승한다는 의미입니다.\r
\r
    다중회귀에서 계수 해석은 "다른 변수가 일정할 때"라는 조건이 붙습니다. RM 계수가 4.09이면 "다른 조건이 같을 때 방 1개 증가 시 가격이 4.09천 달러 증가"합니다. 단순회귀와 달리 다른 변수의 영향을 통제한 순수 효과입니다.\r
  tips:\r
  - 다중회귀에서 계수 해석은 "다른 변수가 일정할 때"라는 조건이 붙습니다. RM 계수가 4.09이면 "다른 조건이 같을 때 방 1개 증가 시 가격이 4.09천 달러 증가"합니다.\r
    단순회귀와 달리 다른 변수의 영향을 통제한 순수 효과입니다.\r
  snippet: model.summary()\r
  exercise:\r
    prompt: 8단계. 결과 요약 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: model.summary()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 결과 요약의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 8단계. 결과 요약 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step9_rsquared\r
  title: 9단계. R² 확인\r
  structuredPrimary: true\r
  subtitle: 모델 설명력\r
  goal: 9단계. R² 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: |-\r
    R² 0.69는 5개 변수가 가격 변동의 69%를 설명한다는 뜻으로, 01 프로젝트의 TV 광고비 단일 변수(R² 0.61)보다 높은 설명력을 보입니다. 그러나 변수를 추가하면 실제 성능 향상과 무관하게 R²는 항상 증가하는 문제가 있습니다. 따라서 Adjusted R²(수정 결정계수)를 함께 확인해야 합니다. Adjusted R²는 변수 개수에 페널티를 부여하여, 쓸모없는 변수를 추가하면 오히려 감소합니다. 두 값의 차이가 크면 불필요한 변수가 포함되었을 가능성이 있습니다.\r
\r
    Adjusted R²는 변수 개수를 고려한 R²입니다. 변수를 추가해도 모델 성능이 실제로 개선되지 않으면 Adjusted R²는 오히려 감소합니다. 변수 선택 시 Adjusted R²를 기준으로 판단하는 것이 더 정확합니다.\r
  tips:\r
  - Adjusted R²는 변수 개수를 고려한 R²입니다. 변수를 추가해도 모델 성능이 실제로 개선되지 않으면 Adjusted R²는 오히려 감소합니다. 변수 선택 시 Adjusted\r
    R²를 기준으로 판단하는 것이 더 정확합니다.\r
  snippet: |-\r
    f"R²: {model.rsquared:.3f}"\r
    f"Adjusted R²: {model.rsquared_adj:.3f}"\r
  exercise:\r
    prompt: 9단계. R² 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: |-\r
      f"R²: {model.rsquared:.3f}"\r
      f"Adjusted R²: {model.rsquared_adj:.3f}"\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. R² 확인의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 9단계. R² 확인 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step10_params\r
  title: 10단계. 회귀 계수 해석\r
  structuredPrimary: true\r
  subtitle: 각 변수의 영향력\r
  goal: 10단계. 회귀 계수 해석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: params로 각 변수의 회귀 계수를 확인합니다. RM(방 개수)은 +4.09로 양의 영향, LSTAT(저소득층 비율)는 -0.62로 음의 영향을 미칩니다.\r
    양수 계수는 해당 변수 증가 시 집값 상승, 음수는 하락을 의미합니다. 주의할 점은 계수 크기로 중요도를 직접 비교할 수 없다는 것입니다. RM은 3~9 범위, TAX는 187~711\r
    범위로 스케일이 다르기 때문입니다. 변수 간 중요도를 비교하려면 표준화 계수(standardized coefficient)나 VIF를 사용해야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: model.params\r
  exercise:\r
    prompt: 10단계. 회귀 계수 해석 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: model.params\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 회귀 계수 해석의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 10단계. 회귀 계수 해석 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step11_residual_plot\r
  title: 11단계. 잔차 플롯\r
  structuredPrimary: true\r
  subtitle: 모델 진단\r
  goal: 11단계. 잔차 플롯에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    잔차(residual)는 실제값과 예측값의 차이(오차)로, 모델이 설명하지 못한 부분입니다. 잔차 플롯은 예측값(X축)과 잔차(Y축)를 그린 그래프로, 모델의 적합성을 진단하는 핵심 도구입니다. 이상적인 잔차 플롯은 (1) 잔차가 0 주변에 랜덤하게 분포하고, (2) 특정 패턴이나 추세가 없으며, (3) 분산이 일정해야 합니다. 만약 잔차가 깔때기 모양을 보이면 이분산성(heteroscedasticity), 곡선 패턴을 보이면 비선형 관계를 의미하여 모델 개선이 필요합니다. 예를 들어 고가 주택(예측값 30 이상)에서 잔차가 커지면 고가 주택 예측이 불안정하다는 뜻이므로, 로그 변환이나 추가 변수 투입을 고려해야 합니다.\r
\r
    model.resid는 잔차(실제값 - 예측값), model.fittedvalues는 예측값입니다. plotly의 add_hline()은 y=0에 수평선을 그리며, line_dash='dash'로 점선 스타일을 지정합니다. 잔차가 0 주변에 고르게 분포하고 특정 패턴이 없으면 좋은 모델이며, 깔때기 모양이나 곡선 패턴이 보이면 모델 가정을 위반하는 것입니다. 마우스를 올리면 특정 점의 예측값과 잔차를 확인할 수 있어 이상치(outlier)를 쉽게 찾을 수 있습니다.\r
  tips:\r
  - model.resid는 잔차(실제값 - 예측값), model.fittedvalues는 예측값입니다. plotly의 add_hline()은 y=0에 수평선을 그리며, line_dash='dash'로\r
    점선 스타일을 지정합니다. 잔차가 0 주변에 고르게 분포하고 특정 패턴이 없으면 좋은 모델이며, 깔때기 모양이나 곡선 패턴이 보이면 모델 가정을 위반하는 것입니다. 마우스를 올리면\r
    특정 점의 예측값과 잔차를 확인할 수 있어 이상치(outlier)를 쉽게 찾을 수 있습니다.\r
  snippet: |-\r
    import plotly.express as px\r
\r
    residuals = model.resid\r
    fittedValues = model.fittedvalues\r
\r
    residualDf = pd.DataFrame({'Fitted': fittedValues, 'Residuals': residuals})\r
    residualFig = px.scatter(residualDf, x='Fitted', y='Residuals',\r
                             title='Residual Plot',\r
                             labels={'Fitted': 'Fitted values', 'Residuals': 'Residuals'},\r
                             opacity=0.6)\r
    residualFig.add_hline(y=0, line_dash='dash', line_color='red')\r
    residualFig.show()\r
  exercise:\r
    prompt: 11단계. 잔차 플롯 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.express as px\r
\r
      residuals = model.resid\r
      fittedValues = model.fittedvalues\r
\r
      residualDf = pd.DataFrame({'Fitted': fittedValues, 'Residuals': residuals})\r
      residualFig = px.scatter(residualDf, x='Fitted', y='Residuals',\r
                               title='Residual Plot',\r
                               labels={'Fitted': 'Fitted values', 'Residuals': 'Residuals'},\r
                               opacity=0.6)\r
      residualFig.add_hline(y=0, line_dash='dash', line_color='red')\r
      residualFig.show()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 잔차 플롯의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 잔차 플롯의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_qq_plot\r
  title: 12단계. Q-Q 플롯\r
  structuredPrimary: true\r
  subtitle: 정규성 검정\r
  goal: 12단계. QQ 플롯에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    Q-Q 플롯(Quantile-Quantile plot)은 잔차의 분위수와 이론적 정규분포의 분위수를 비교하여 정규성을 확인하는 진단 도구입니다. X축은 이론적 정규분포의 분위수, Y축은 실제 잔차의 분위수를 나타내며, 점들이 45도 대각선에 가까우면 잔차가 정규분포를 따른다는 뜻입니다. 선형 회귀분석은 잔차가 평균 0, 일정한 분산의 정규분포를 따른다고 가정하므로(정규성 가정), Q-Q 플롯으로 이 가정을 검증합니다. 양 끝에서 약간 벗어나는 것은 정상이지만, 중간 부분이 S자 곡선을 그리거나 크게 벗어나면 정규성을 위반하는 것이므로 로그 변환이나 Box-Cox 변환을 고려해야 합니다. 정규성이 심하게 위반되면 p-value와 신뢰구간이 부정확해집니다.\r
\r
    scipy.stats.probplot()은 Q-Q 플롯 데이터를 계산하며, quantiles는 이론적 분위수, ordered_residuals는 정렬된 잔차입니다. slope와 intercept로 정규분포 기준선을 그립니다. dist="norm"은 정규분포와 비교한다는 뜻입니다. 점들이 빨간 대각선을 따라 분포하면 정규성을 만족하고, S자 곡선이나 큰 이탈이 보이면 변환이 필요합니다. 정규성 위반은 특히 작은 샘플(n<30)에서 문제가 되므로, 큰 데이터셋에서는 약간의 이탈은 허용됩니다.\r
  tips:\r
  - scipy.stats.probplot()은 Q-Q 플롯 데이터를 계산하며, quantiles는 이론적 분위수, ordered_residuals는 정렬된 잔차입니다. slope와\r
    intercept로 정규분포 기준선을 그립니다. dist="norm"은 정규분포와 비교한다는 뜻입니다. 점들이 빨간 대각선을 따라 분포하면 정규성을 만족하고, S자 곡선이나 큰\r
    이탈이 보이면 변환이 필요합니다. 정규성 위반은 특히 작은 샘플(n<30)에서 문제가 되므로, 큰 데이터셋에서는 약간의 이탈은 허용됩니다.\r
  snippet: |-\r
    import plotly.graph_objects as go\r
    import scipy.stats as stats\r
    import numpy as np\r
\r
    (quantiles, ordered_residuals), (slope, intercept, r) = stats.probplot(residuals, dist="norm")\r
\r
    qqFig = go.Figure()\r
    qqFig.add_trace(go.Scatter(x=quantiles, y=ordered_residuals,\r
                                mode='markers', name='Residuals',\r
                                marker=dict(size=6, opacity=0.6)))\r
    qqFig.add_trace(go.Scatter(x=quantiles, y=slope * quantiles + intercept,\r
                                mode='lines', name='Normal line',\r
                                line=dict(color='red', width=2)))\r
    qqFig.update_layout(title='Q-Q Plot',\r
                        xaxis_title='Theoretical Quantiles',\r
                        yaxis_title='Sample Quantiles')\r
    qqFig.show()\r
  exercise:\r
    prompt: 12단계. QQ 플롯 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      import plotly.graph_objects as go\r
      import scipy.stats as stats\r
      import numpy as np\r
\r
      (quantiles, ordered_residuals), (slope, intercept, r) = stats.probplot(residuals, dist="norm")\r
\r
      qqFig = go.Figure()\r
      qqFig.add_trace(go.Scatter(x=quantiles, y=ordered_residuals,\r
                                  mode='markers', name='Residuals',\r
                                  marker=dict(size=6, opacity=0.6)))\r
      qqFig.add_trace(go.Scatter(x=quantiles, y=slope * quantiles + intercept,\r
                                  mode='lines', name='Normal line',\r
                                  line=dict(color='red', width=2)))\r
      qqFig.update_layout(title='Q-Q Plot',\r
                          xaxis_title='Theoretical Quantiles',\r
                          yaxis_title='Sample Quantiles')\r
      qqFig.show()\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. QQ 플롯의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 12단계. QQ 플롯의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: step13_coef_plot\r
  title: 13단계. 계수 시각화\r
  structuredPrimary: true\r
  subtitle: 신뢰구간 포함\r
  goal: 13단계. 계수 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    회귀 계수를 막대그래프로 시각화하면 각 변수의 영향력을 한눈에 비교할 수 있습니다. 신뢰구간(confidence interval)을 함께 표시하면 계수의 불확실성도 확인할 수 있습니다. 신뢰구간이 0을 포함하면 그 변수는 통계적으로 유의하지 않을 수 있습니다. seaborn의 barplot과 에러바를 사용해 직관적인 시각화를 만듭니다.\r
\r
    model.conf_int()는 95% 신뢰구간의 하한과 상한을 반환합니다. 녹색은 양의 계수(가격 상승), 빨간색은 음의 계수(가격 하락)입니다. 에러바가 0을 지나지 않으면 통계적으로 유의미합니다.\r
  tips:\r
  - model.conf_int()는 95% 신뢰구간의 하한과 상한을 반환합니다. 녹색은 양의 계수(가격 상승), 빨간색은 음의 계수(가격 하락)입니다. 에러바가 0을 지나지 않으면\r
    통계적으로 유의미합니다.\r
  snippet: |-\r
    import seaborn as sns\r
    import matplotlib.pyplot as plt\r
\r
    coefDf = pd.DataFrame({\r
        'variable': model.params.index[1:],\r
        'coef': model.params.values[1:],\r
        'lower': model.conf_int()[0].values[1:],\r
        'upper': model.conf_int()[1].values[1:]\r
    })\r
    coefDf['error'] = coefDf['upper'] - coefDf['coef']\r
\r
    coefFig, coefAx = plt.subplots(figsize=(8, 5))\r
    colors = ['#2ecc71' if c > 0 else '#e74c3c' for c in coefDf['coef']]\r
    coefAx.barh(coefDf['variable'], coefDf['coef'], xerr=coefDf['error'], color=colors, capsize=5)\r
    coefAx.axvline(x=0, color='black', linestyle='--', linewidth=1)\r
    coefAx.set_xlabel('Coefficient')\r
    coefAx.set_title('Regression Coefficients with 95% CI')\r
    plt.tight_layout()\r
    coefFig\r
  exercise:\r
    prompt: 13단계. 계수 시각화 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import seaborn as sns\r
      import matplotlib.pyplot as plt\r
\r
      coefDf = pd.DataFrame({\r
          'variable': model.params.index[1:],\r
          'coef': model.params.values[1:],\r
          'lower': model.conf_int()[0].values[1:],\r
          'upper': model.conf_int()[1].values[1:]\r
      })\r
      coefDf['error'] = coefDf['upper'] - coefDf['coef']\r
\r
      coefFig, coefAx = plt.subplots(figsize=(8, 5))\r
      colors = ['#2ecc71' if c > 0 else '#e74c3c' for c in coefDf['coef']]\r
      coefAx.barh(coefDf['variable'], coefDf['coef'], xerr=coefDf['error'], color=colors, capsize=5)\r
      coefAx.axvline(x=0, color='black', linestyle='--', linewidth=1)\r
      coefAx.set_xlabel('Coefficient')\r
      coefAx.set_title('Regression Coefficients with 95% CI')\r
      plt.tight_layout()\r
      coefFig\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 계수 시각화의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 13단계. 계수 시각화 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step14_predict\r
  title: 14단계. 새로운 주택 가격 예측\r
  structuredPrimary: true\r
  subtitle: 실전 예측\r
  goal: 14단계. 새로운 주택 가격 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 학습된 모델로 새로운 주택의 예상 가격을 예측합니다. 방 7개, LSTAT 10%, PTRATIO 18, INDUS 5%, TAX 300인 주택의 적정 가격을\r
    계산해봅니다. predict() 사용법은 01 프로젝트와 동일하지만, 5개 변수를 모두 포함한 DataFrame을 입력해야 합니다. 이 예측 기능은 부동산 중개업체의 시세 산정,\r
    매수자의 적정 가격 판단, 도시 개발 시 가격 영향 평가 등 실무에서 활용됩니다. 변수 값을 바꿔가며 시뮬레이션하면 가격 민감도 분석도 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    newHouse = pd.DataFrame({\r
        'const': [1],\r
        'rm': [7],\r
        'lstat': [10],\r
        'ptratio': [18],\r
        'indus': [5],\r
        'tax': [300]\r
    })\r
    predictedPrice = model.predict(newHouse)[0]\r
    f"예상 가격: \${predictedPrice:.2f}천"\r
  exercise:\r
    prompt: 14단계. 새로운 주택 가격 예측 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      newHouse = pd.DataFrame({\r
          'const': [1],\r
          'rm': [7],\r
          'lstat': [10],\r
          'ptratio': [18],\r
          'indus': [5],\r
          'tax': [300]\r
      })\r
      predictedPrice = model.predict(newHouse)[0]\r
      f"예상 가격: \${predictedPrice:.2f}천"\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 새로운 주택 가격 예측의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 14단계. 새로운 주택 가격 예측의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 부동산 가격 분석 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    부동산 분석가가 되어 보스턴 주택 시장을 분석해봅시다. 각 미션은 데이터 로딩부터 모델링, 평가, 시각화까지 전체 과정을 독립적으로 수행합니다. 01 프로젝트에서 배운 OLS와 summary 해석, 그리고 이번 프로젝트에서 배운 다중회귀, 특성 선택, 잔차 분석을 모두 활용하여 실무 분석 역량을 키워봅시다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import statsmodels.api as sm\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    allData = loadLocalDataset("boston_housing")\r
    allData.shape\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import statsmodels.api as sm\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      allData = loadLocalDataset("boston_housing")\r
      allData.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: summary\r
  title: 정리\r
  subtitle: 두 번째 프로젝트 완료!\r
  blocks:\r
  - type: text\r
    content: 이번 프로젝트에서는 보스턴 주택 데이터로 방 개수, 저소득층 비율 등 5가지 요인으로 집값을 예측했습니다. 다중회귀 모델의 R²는 0.69로 단순회귀(01 프로젝트)보다\r
      높은 설명력을 보였고, 잔차 플롯과 Q-Q 플롯으로 모델의 적합성을 진단했습니다. 이 모델로 신규 주택의 적정 가격을 책정하고, 어떤 요인이 가격에 가장 큰 영향을 미치는지\r
      파악할 수 있습니다.\r
  - type: list\r
    items:\r
    - 다중선형회귀 - 여러 변수로 예측\r
    - 특성 선택 - 상관관계 기반 주요 변수 선택\r
    - Adjusted R² - 변수 개수를 고려한 모델 평가\r
    - 잔차 플롯 - 예측값 vs 잔차로 모델 진단\r
    - Q-Q 플롯 - 잔차 정규성 검정\r
    - 계수 해석 - 다른 변수 고정 시 순수 효과\r
  - type: text\r
    content: 다음 프로젝트에서는 의료보험 비용 데이터로 로그 변환과 범주형 변수 처리를 배웁니다. 나이, 흡연 여부 등으로 보험료를 예측해봅니다.\r
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