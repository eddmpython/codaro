var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scikit-learn\r
  id: sklearn_03\r
  title: 당뇨병진행도예측\r
  order: 3\r
  category: sklearn\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - 회귀\r
  - LinearRegression\r
  - MSE\r
  - R²\r
  - 당뇨병\r
  seo:\r
    title: scikit-learn 회귀 입문 - 당뇨병 진행도 예측\r
    description: LinearRegression으로 당뇨병 진행도를 예측합니다. MSE와 R²로 회귀 모델을 평가합니다.\r
    keywords:\r
    - scikit-learn\r
    - 회귀\r
    - LinearRegression\r
    - MSE\r
    - R²\r
intro:\r
  emoji: 💉\r
  goal: 선형 회귀로 당뇨병 진행도를 예측합니다.\r
  description: 분류가 아닌 회귀(regression) 문제를 다룹니다. LinearRegression으로 연속적인 값을 예측하고, MSE와 R²로 모델을 평가합니다. 이전\r
    프로젝트에서 배운 train_test_split, StandardScaler를 복습하고 회귀 평가 지표를 새로 배웁니다.\r
  direction: 당뇨병진행도예측에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 당뇨병진행도예측 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 불러오기 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 타겟 분석 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 당뇨병진행도예측 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: matplotlib, numpy, pandas, scikit-learn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 당뇨병진행도예측 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 당뇨병진행도예측 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 당뇨병 진행도 예측 모델을 만들기 위해 필요한 라이브러리를 불러옵니다. 회귀 문제이므로 LinearRegression과 회귀 평가 지표를 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sklearn.datasets import load_diabetes\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.linear_model import LinearRegression\r
    from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error\r
    import pandas as pd\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      from sklearn.datasets import load_diabetes\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.linear_model import LinearRegression\r
      from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error\r
      import pandas as pd\r
      import numpy as np\r
      import matplotlib.pyplot as plt\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.\r
- id: step2_load\r
  title: 2단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: load_diabetes()\r
  goal: 2단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    당뇨병 데이터셋은 442명 환자의 10가지 기준값(나이, 성별, BMI, 혈압 등)과 1년 후 질병 진행도를 담고 있습니다. 진행도는 연속적인 숫자이므로 회귀 문제입니다.\r
\r
    이 데이터셋은 이미 정규화되어 있습니다. 각 특성의 평균이 거의 0이고 표준편차가 비슷합니다. 실제 값이 아닌 표준화된 값임을 참고하세요.\r
  snippet: |-\r
    diabetes = load_diabetes()\r
    X = pd.DataFrame(diabetes.data, columns=diabetes.feature_names)\r
    y = diabetes.target\r
    X.shape\r
  exercise:\r
    prompt: 2단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      diabetes = load_diabetes()\r
      X = pd.DataFrame(diabetes.data, columns=diabetes.feature_names)\r
      y = diabetes.target\r
      X.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_target\r
  title: 3단계. 타겟 분석\r
  structuredPrimary: true\r
  subtitle: 연속값 분포\r
  goal: 3단계. 타겟 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 회귀 문제의 타겟은 연속적인 숫자입니다. 분류와 달리 클래스가 아닌 값의 분포를 확인합니다. 히스토그램으로 진행도의 분포를 살펴봅니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: pd.Series(y).describe()\r
  exercise:\r
    prompt: 3단계. 타겟 분석 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: pd.Series(y).describe()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 타겟 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 3단계. 타겟 분석 실행 결과가 출력과 상태 기준으로 바꾼 열 이름이나 행 값을 반영해야 합니다.\r
- id: step4_split\r
  title: 4단계. 데이터 분할\r
  structuredPrimary: true\r
  subtitle: train_test_split\r
  goal: 4단계. 데이터 분할에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 이전 프로젝트와 동일하게 학습/테스트 데이터로 분할합니다. 회귀에서도 동일한 방식으로 분할합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42)\r
    xTrain.shape, xTest.shape\r
  exercise:\r
    prompt: 4단계. 데이터 분할 예제에서 \`xTrain\`, \`xTest\`, \`yTrain\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42)\r
      xTrain.shape, xTest.shape\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 데이터 분할에서 \`xTrain\`, \`xTest\`, \`yTrain\` 할당 개수와 값 순서가 맞아야 합니다.\r
    resultCheck: 4단계. 데이터 분할 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_scale\r
  title: 5단계. 스케일링\r
  structuredPrimary: true\r
  subtitle: StandardScaler\r
  goal: 5단계. 스케일링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 이 데이터셋은 이미 정규화되어 있지만, 실전에서는 항상 스케일링하는 습관을 들이는 것이 좋습니다. LinearRegression은 스케일에 덜 민감하지만,\r
    다른 알고리즘으로 교체할 때를 대비합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    scaler = StandardScaler()\r
    xTrainSc = scaler.fit_transform(xTrain)\r
    xTestSc = scaler.transform(xTest)\r
  exercise:\r
    prompt: 5단계. 스케일링 예제에서 \`scaler\`, \`xTrainSc\`, \`xTestSc\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      scaler = StandardScaler()\r
      xTrainSc = scaler.fit_transform(xTrain)\r
      xTestSc = scaler.transform(xTest)\r
    hints:\r
    - 바꿀 지점은 \`scaler = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`scaler\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 스케일링에서 \`scaler\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 스케일링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_model\r
  title: 6단계. 선형 회귀 모델\r
  structuredPrimary: true\r
  subtitle: LinearRegression\r
  goal: 6단계. 선형 회귀 모델에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    LinearRegression은 가장 기본적인 회귀 알고리즘입니다. 입력 특성과 타겟 사이의 선형 관계를 학습합니다. y = w1*x1 + w2*x2 + ... + b 형태의 식을 찾습니다.\r
\r
    coef_는 각 특성의 가중치(기울기)입니다. 값이 클수록 해당 특성이 타겟에 큰 영향을 미칩니다. intercept_는 절편(bias)입니다.\r
  snippet: |-\r
    model = LinearRegression()\r
    model.fit(xTrainSc, yTrain)\r
  exercise:\r
    prompt: 6단계. 선형 회귀 모델 예제에서 \`model\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      model = LinearRegression()\r
      model.fit(xTrainSc, yTrain)\r
    hints:\r
    - 바꿀 지점은 \`model = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 선형 회귀 모델에서 \`model\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 선형 회귀 모델 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step7_predict\r
  title: 7단계. 예측\r
  structuredPrimary: true\r
  subtitle: predict\r
  goal: 7단계. 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 학습된 모델로 테스트 데이터의 진행도를 예측합니다. 회귀는 연속적인 값을 출력하므로 클래스가 아닌 숫자가 나옵니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    yPred = model.predict(xTestSc)\r
    yPred[:10]\r
  exercise:\r
    prompt: 7단계. 예측 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      yPred = model.predict(xTestSc)\r
      yPred[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 예측에서 \`yPred\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 예측 실행 뒤 \`yPred\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step8_mse\r
  title: 8단계. MSE 평가\r
  structuredPrimary: true\r
  subtitle: mean_squared_error\r
  goal: 8단계. MSE 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    MSE(Mean Squared Error)는 예측 오차의 제곱 평균입니다. 값이 작을수록 좋습니다. RMSE는 MSE의 제곱근으로, 원래 단위로 해석할 수 있습니다.\r
\r
    MSE = (1/n) * Σ(실제값 - 예측값)². 오차를 제곱하므로 큰 오차에 더 큰 패널티를 줍니다. RMSE는 타겟과 같은 단위이므로 해석이 쉽습니다.\r
  snippet: |-\r
    mse = mean_squared_error(yTest, yPred)\r
    rmse = np.sqrt(mse)\r
    f"MSE: {mse:.2f}, RMSE: {rmse:.2f}"\r
  exercise:\r
    prompt: 8단계. MSE 평가 예제에서 \`mse\`, \`rmse\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      mse = mean_squared_error(yTest, yPred)\r
      rmse = np.sqrt(mse)\r
      f"MSE: {mse:.2f}, RMSE: {rmse:.2f}"\r
    hints:\r
    - 바꿀 지점은 \`mse = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`mse\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. MSE 평가에서 \`mse\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. MSE 평가 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_mae\r
  title: 9단계. MAE 평가\r
  structuredPrimary: true\r
  subtitle: mean_absolute_error\r
  goal: 9단계. MAE 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    MAE(Mean Absolute Error)는 예측 오차의 절대값 평균입니다. MSE보다 이상치에 덜 민감합니다. 평균적으로 얼마나 틀리는지를 나타냅니다.\r
\r
    MAE = (1/n) * Σ|실제값 - 예측값|. 절대값을 사용하므로 MSE보다 큰 오차에 덜 민감합니다. 이상치가 많은 데이터에서는 MAE가 더 적합할 수 있습니다.\r
  snippet: |-\r
    mae = mean_absolute_error(yTest, yPred)\r
    f"MAE: {mae:.2f}"\r
  exercise:\r
    prompt: 9단계. MAE 평가 예제에서 \`mae\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      mae = mean_absolute_error(yTest, yPred)\r
      f"MAE: {mae:.2f}"\r
    hints:\r
    - 바꿀 지점은 \`mae = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`mae\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. MAE 평가에서 \`mae\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. MAE 평가 실행 뒤 \`mae\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step10_r2\r
  title: 10단계. R² 평가\r
  structuredPrimary: true\r
  subtitle: 결정계수\r
  goal: 10단계. R² 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    R²(결정계수)는 모델이 타겟 변동의 몇 %를 설명하는지 나타냅니다. 1에 가까울수록 좋고, 0이면 평균만큼도 못 맞추는 것입니다. statsmodels에서 배운 R²와 동일한 개념입니다.\r
\r
    R² = 1 - (SS_res / SS_tot). SS_res는 잔차 제곱합, SS_tot은 전체 변동입니다. R²=0.5면 모델이 타겟 변동의 50%를 설명합니다. 음수도 가능하며, 이는 평균보다 못한 모델입니다.\r
  tips:\r
  - R² = 1 - (SS_res / SS_tot). SS_res는 잔차 제곱합, SS_tot은 전체 변동입니다. R²=0.5면 모델이 타겟 변동의 50%를 설명합니다. 음수도 가능하며,\r
    이는 평균보다 못한 모델입니다.\r
  snippet: |-\r
    r2 = r2_score(yTest, yPred)\r
    f"R²: {r2:.4f}"\r
  exercise:\r
    prompt: 10단계. R² 평가 예제에서 \`r2\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      r2 = r2_score(yTest, yPred)\r
      f"R²: {r2:.4f}"\r
    hints:\r
    - 바꿀 지점은 \`r2 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`r2\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. R² 평가에서 \`r2\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. R² 평가 실행 뒤 \`r2\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step11_visualize\r
  title: 11단계. 시각화\r
  structuredPrimary: true\r
  subtitle: 예측 vs 실제\r
  goal: 11단계. 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    예측값과 실제값을 산점도로 비교합니다. 완벽한 모델이라면 점들이 대각선(y=x) 위에 있어야 합니다.\r
\r
    잔차가 0 주변에 대칭적으로 분포하면 좋은 모델입니다. 한쪽으로 치우치거나 패턴이 있으면 모델에 문제가 있을 수 있습니다.\r
  snippet: |-\r
    fig, ax = plt.subplots(figsize=(8, 6))\r
    ax.scatter(yTest, yPred, alpha=0.6)\r
    ax.plot([yTest.min(), yTest.max()], [yTest.min(), yTest.max()], 'r--', lw=2)\r
    ax.set_xlabel('Actual')\r
    ax.set_ylabel('Predicted')\r
    ax.set_title(f'Actual vs Predicted (R² = {r2:.4f})')\r
    fig\r
  exercise:\r
    prompt: 11단계. 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fig, ax = plt.subplots(figsize=(8, 6))\r
      ax.scatter(yTest, yPred, alpha=0.6)\r
      ax.plot([yTest.min(), yTest.max()], [yTest.min(), yTest.max()], 'r--', lw=2)\r
      ax.set_xlabel('Actual')\r
      ax.set_ylabel('Predicted')\r
      ax.set_title(f'Actual vs Predicted (R² = {r2:.4f})')\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 시각화의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 11단계. 시각화 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step12_summary\r
  title: 12단계. 정리\r
  structuredPrimary: true\r
  subtitle: 회귀 분석 완료\r
  goal: 12단계. 정리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 이번 프로젝트에서는 당뇨병 진행도 예측 모델을 만들어 회귀 분석을 학습했습니다. LinearRegression으로 연속값을 예측하고, MSE, MAE, R²로\r
    모델을 평가하는 방법을 배웠습니다. statsmodels에서 배운 R² 개념이 sklearn에서도 동일하게 적용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    summary = pd.DataFrame({\r
        'Item': ['Dataset', 'Model', 'Features', 'MSE', 'R²'],\r
        'Value': ['Diabetes (442 samples)', 'LinearRegression', '10', f'{mse:.2f}', f'{r2:.4f}']\r
    })\r
    summary\r
  exercise:\r
    prompt: 12단계. 정리 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      summary = pd.DataFrame({\r
          'Item': ['Dataset', 'Model', 'Features', 'MSE', 'R²'],\r
          'Value': ['Diabetes (442 samples)', 'LinearRegression', '10', f'{mse:.2f}', f'{r2:.4f}']\r
      })\r
      summary\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 정리의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 정리의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 당뇨병 예측 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    의료 데이터 분석가가 되어 당뇨병 진행도 예측 시스템을 구축합니다. 각 미션은 데이터 로딩부터 모델 학습, 평가까지 전 과정을 독립적으로 수행합니다. train_test_split, StandardScaler, LinearRegression, MSE, R²를 모두 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sklearn.datasets import load_diabetes\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.linear_model import LinearRegression\r
    from sklearn.metrics import r2_score, mean_squared_error\r
    import pandas as pd\r
    import numpy as np\r
\r
    data = load_diabetes()\r
    xAll = pd.DataFrame(data.data, columns=data.feature_names)\r
    xBmi = xAll[['bmi']]\r
    yData = data.target\r
\r
    xTr1, xTe1, yTr1, yTe1 = train_test_split(xAll, yData, test_size=0.2, random_state=42)\r
    xTr2, xTe2, yTr2, yTe2 = train_test_split(xBmi, yData, test_size=0.2, random_state=42)\r
\r
    sc1, sc2 = StandardScaler(), StandardScaler()\r
\r
    model1 = LinearRegression()\r
    model1.fit(sc1.fit_transform(xTr1), yTr1)\r
    pred1 = model1.predict(sc1.transform(xTe1))\r
\r
    model2 = LinearRegression()\r
    model2.fit(sc2.fit_transform(xTr2), yTr2)\r
    pred2 = model2.predict(sc2.transform(xTe2))\r
\r
    pd.DataFrame({\r
        'Model': ['All Features (10)', 'BMI Only (1)'],\r
        'R²': [r2_score(yTe1, pred1), r2_score(yTe2, pred2)],\r
        'RMSE': [np.sqrt(mean_squared_error(yTe1, pred1)), np.sqrt(mean_squared_error(yTe2, pred2))]\r
    })\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.datasets import load_diabetes\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.linear_model import LinearRegression\r
      from sklearn.metrics import r2_score, mean_squared_error\r
      import pandas as pd\r
      import numpy as np\r
\r
      data = load_diabetes()\r
      xAll = pd.DataFrame(data.data, columns=data.feature_names)\r
      xBmi = xAll[['bmi']]\r
      yData = data.target\r
\r
      xTr1, xTe1, yTr1, yTe1 = train_test_split(xAll, yData, test_size=0.2, random_state=42)\r
      xTr2, xTe2, yTr2, yTe2 = train_test_split(xBmi, yData, test_size=0.2, random_state=42)\r
\r
      sc1, sc2 = StandardScaler(), StandardScaler()\r
\r
      model1 = LinearRegression()\r
      model1.fit(sc1.fit_transform(xTr1), yTr1)\r
      pred1 = model1.predict(sc1.transform(xTe1))\r
\r
      model2 = LinearRegression()\r
      model2.fit(sc2.fit_transform(xTr2), yTr2)\r
      pred2 = model2.predict(sc2.transform(xTe2))\r
\r
      pd.DataFrame({\r
          'Model': ['All Features (10)', 'BMI Only (1)'],\r
          'R²': [r2_score(yTe1, pred1), r2_score(yTe2, pred2)],\r
          'RMSE': [np.sqrt(mean_squared_error(yTe1, pred1)), np.sqrt(mean_squared_error(yTe2, pred2))]\r
      })\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: workflow_validation\r
  title: 업무 흐름 검증\r
  structuredPrimary: true\r
  subtitle: 예측 모델 품질 게이트\r
  goal: 업무 흐름 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: 실무 머신러닝은 모델을 fit하는 데서 끝나지 않습니다. 먼저 어떤 성능이 나올지 예측하고, 학습/평가 데이터를 분리한 뒤, 잘못된 입력을 명확한 오류로 막고,\r
    정확도와 F1 점수를 assert로 검증해야 합니다. 마지막에는 하이퍼파라미터를 바꾸는 변주로 성능과 안정성을 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sklearn.datasets import make_classification\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.pipeline import Pipeline\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.linear_model import LogisticRegression\r
    from sklearn.metrics import accuracy_score, f1_score\r
\r
    features, target = make_classification(\r
        n_samples=240,\r
        n_features=6,\r
        n_informative=4,\r
        n_redundant=0,\r
        class_sep=1.4,\r
        random_state=42,\r
    )\r
    xTrain, xTest, yTrain, yTest = train_test_split(\r
        features, target, test_size=0.25, random_state=42, stratify=target\r
    )\r
\r
    riskPipeline = Pipeline([\r
        ("scaler", StandardScaler()),\r
        ("classifier", LogisticRegression(max_iter=1000, random_state=42)),\r
    ])\r
\r
    def fitRiskModel(pipeline, featureMatrix, labels):\r
        pipeline.fit(featureMatrix, labels)\r
        return pipeline\r
\r
    riskModel = fitRiskModel(riskPipeline, xTrain, yTrain)\r
    riskPred = riskModel.predict(xTest)\r
    riskAccuracy = accuracy_score(yTest, riskPred)\r
    riskF1 = f1_score(yTest, riskPred)\r
    xTrain.shape, xTest.shape\r
  exercise:\r
    prompt: 업무 흐름 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      conservativePipeline = Pipeline([\r
          ("scaler", StandardScaler()),\r
          ("classifier", LogisticRegression(C=0.3, max_iter=1000, random_state=42)),\r
      ])\r
      conservativeModel = fitRiskModel(conservativePipeline, xTrain, yTrain)\r
      conservativePred = conservativeModel.predict(xTest)\r
      conservativeAccuracy = accuracy_score(yTest, conservativePred)\r
      conservativeF1 = f1_score(yTest, conservativePred)\r
\r
      assert conservativeAccuracy >= 0.75\r
      {\r
          "baselineAccuracy": round(riskAccuracy, 3),\r
          "baselineF1": round(riskF1, 3),\r
          "conservativeAccuracy": round(conservativeAccuracy, 3),\r
          "conservativeF1": round(conservativeF1, 3),\r
          "accuracyDelta": round(conservativeAccuracy - riskAccuracy, 3),\r
      }\r
    solution: |-\r
      from sklearn.datasets import make_classification\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.pipeline import Pipeline\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.linear_model import LogisticRegression\r
      from sklearn.metrics import accuracy_score, f1_score\r
\r
      features, target = make_classification(\r
          n_samples=240,\r
          n_features=6,\r
          n_informative=4,\r
          n_redundant=0,\r
          class_sep=1.4,\r
          random_state=42,\r
      )\r
      xTrain, xTest, yTrain, yTest = train_test_split(\r
          features, target, test_size=0.25, random_state=42, stratify=target\r
      )\r
\r
      riskPipeline = Pipeline([\r
          ("scaler", StandardScaler()),\r
          ("classifier", LogisticRegression(max_iter=1000, random_state=42)),\r
      ])\r
      xTrain.shape, xTest.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 업무 흐름 검증에서 \`conservativePipeline\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 업무 흐름 검증에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
`;export{e as default};