var e=`meta:
  packages:
  - matplotlib
  - numpy
  - pandas
  - scikit-learn
  id: sklearn_03
  title: 당뇨병진행도예측
  order: 3
  category: sklearn
  difficulty: ⭐⭐
  badge: 기초
  tags:
  - 회귀
  - LinearRegression
  - MSE
  - R²
  - 당뇨병
  seo:
    title: scikit-learn 회귀 입문 - 당뇨병 진행도 예측
    description: LinearRegression으로 당뇨병 진행도를 예측합니다. MSE와 R²로 회귀 모델을 평가합니다.
    keywords:
    - scikit-learn
    - 회귀
    - LinearRegression
    - MSE
    - R²
intro:
  emoji: 💉
  goal: 선형 회귀로 당뇨병 진행도를 예측합니다.
  description: 분류가 아닌 회귀(regression) 문제를 다룹니다. LinearRegression으로 연속적인 값을 예측하고, MSE와 R²로 모델을 평가합니다. 이전
    프로젝트에서 배운 train_test_split, StandardScaler를 복습하고 회귀 평가 지표를 새로 배웁니다.
  direction: 당뇨병진행도예측에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.
  - 당뇨병진행도예측 결과를 출력과 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 불러오기 처리 실행
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 타겟 분석 결과 검증
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.
    - label: 당뇨병진행도예측 재사용
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.
    runtime:
    - label: 업무 코드 환경
      detail: matplotlib, numpy, pandas, scikit-learn 기준으로 로컬 Python 실행을 준비합니다.
    - label: 당뇨병진행도예측 실행
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.
    - label: 당뇨병진행도예측 완료
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: 당뇨병 진행도 예측 모델을 만들기 위해 필요한 라이브러리를 불러옵니다. 회귀 문제이므로 LinearRegression과 회귀 평가 지표를 사용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from sklearn.datasets import load_diabetes
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    from sklearn.linear_model import LinearRegression
    from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
    import pandas as pd
    import numpy as np
    import matplotlib.pyplot as plt
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      from sklearn.datasets import load_diabetes
      from sklearn.model_selection import train_test_split
      from sklearn.preprocessing import StandardScaler
      from sklearn.linear_model import LinearRegression
      from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
      import pandas as pd
      import numpy as np
      import matplotlib.pyplot as plt
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.
- id: step2_load
  title: 2단계. 데이터 불러오기
  structuredPrimary: true
  subtitle: load_diabetes()
  goal: 2단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    당뇨병 데이터셋은 442명 환자의 10가지 기준값(나이, 성별, BMI, 혈압 등)과 1년 후 질병 진행도를 담고 있습니다. 진행도는 연속적인 숫자이므로 회귀 문제입니다.

    이 데이터셋은 이미 정규화되어 있습니다. 각 특성의 평균이 거의 0이고 표준편차가 비슷합니다. 실제 값이 아닌 표준화된 값임을 참고하세요.
  snippet: |-
    diabetes = load_diabetes()
    X = pd.DataFrame(diabetes.data, columns=diabetes.feature_names)
    y = diabetes.target
    X.shape
  exercise:
    prompt: 2단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      diabetes = load_diabetes()
      X = pd.DataFrame(diabetes.data, columns=diabetes.feature_names)
      y = diabetes.target
      X.shape
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 2단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step3_target
  title: 3단계. 타겟 분석
  structuredPrimary: true
  subtitle: 연속값 분포
  goal: 3단계. 타겟 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 회귀 문제의 타겟은 연속적인 숫자입니다. 분류와 달리 클래스가 아닌 값의 분포를 확인합니다. 히스토그램으로 진행도의 분포를 살펴봅니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: pd.Series(y).describe()
  exercise:
    prompt: 3단계. 타겟 분석 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: pd.Series(y).describe()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 타겟 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 3단계. 타겟 분석 실행 결과가 출력과 상태 기준으로 바꾼 열 이름이나 행 값을 반영해야 합니다.
- id: step4_split
  title: 4단계. 데이터 분할
  structuredPrimary: true
  subtitle: train_test_split
  goal: 4단계. 데이터 분할에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 이전 프로젝트와 동일하게 학습/테스트 데이터로 분할합니다. 회귀에서도 동일한 방식으로 분할합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42)
    xTrain.shape, xTest.shape
  exercise:
    prompt: 4단계. 데이터 분할 예제에서 \`xTrain\`, \`xTest\`, \`yTrain\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42)
      xTrain.shape, xTest.shape
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 4단계. 데이터 분할에서 \`xTrain\`, \`xTest\`, \`yTrain\` 할당 개수와 값 순서가 맞아야 합니다.
    resultCheck: 4단계. 데이터 분할 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step5_scale
  title: 5단계. 스케일링
  structuredPrimary: true
  subtitle: StandardScaler
  goal: 5단계. 스케일링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 이 데이터셋은 이미 정규화되어 있지만, 실전에서는 항상 스케일링하는 습관을 들이는 것이 좋습니다. LinearRegression은 스케일에 덜 민감하지만,
    다른 알고리즘으로 교체할 때를 대비합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    scaler = StandardScaler()
    xTrainSc = scaler.fit_transform(xTrain)
    xTestSc = scaler.transform(xTest)
  exercise:
    prompt: 5단계. 스케일링 예제에서 \`scaler\`, \`xTrainSc\`, \`xTestSc\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      scaler = StandardScaler()
      xTrainSc = scaler.fit_transform(xTrain)
      xTestSc = scaler.transform(xTest)
    hints:
    - 바꿀 지점은 \`scaler = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`scaler\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 5단계. 스케일링에서 \`scaler\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 5단계. 스케일링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step6_model
  title: 6단계. 선형 회귀 모델
  structuredPrimary: true
  subtitle: LinearRegression
  goal: 6단계. 선형 회귀 모델에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    LinearRegression은 가장 기본적인 회귀 알고리즘입니다. 입력 특성과 타겟 사이의 선형 관계를 학습합니다. y = w1*x1 + w2*x2 + ... + b 형태의 식을 찾습니다.

    coef_는 각 특성의 가중치(기울기)입니다. 값이 클수록 해당 특성이 타겟에 큰 영향을 미칩니다. intercept_는 절편(bias)입니다.
  snippet: |-
    model = LinearRegression()
    model.fit(xTrainSc, yTrain)
  exercise:
    prompt: 6단계. 선형 회귀 모델 예제에서 \`model\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      model = LinearRegression()
      model.fit(xTrainSc, yTrain)
    hints:
    - 바꿀 지점은 \`model = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 6단계. 선형 회귀 모델에서 \`model\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 6단계. 선형 회귀 모델 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step7_predict
  title: 7단계. 예측
  structuredPrimary: true
  subtitle: predict
  goal: 7단계. 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 학습된 모델로 테스트 데이터의 진행도를 예측합니다. 회귀는 연속적인 값을 출력하므로 클래스가 아닌 숫자가 나옵니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    yPred = model.predict(xTestSc)
    yPred[:10]
  exercise:
    prompt: 7단계. 예측 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      yPred = model.predict(xTestSc)
      yPred[:10]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 7단계. 예측에서 \`yPred\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 7단계. 예측 실행 뒤 \`yPred\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step8_mse
  title: 8단계. MSE 평가
  structuredPrimary: true
  subtitle: mean_squared_error
  goal: 8단계. MSE 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    MSE(Mean Squared Error)는 예측 오차의 제곱 평균입니다. 값이 작을수록 좋습니다. RMSE는 MSE의 제곱근으로, 원래 단위로 해석할 수 있습니다.

    MSE = (1/n) * Σ(실제값 - 예측값)². 오차를 제곱하므로 큰 오차에 더 큰 패널티를 줍니다. RMSE는 타겟과 같은 단위이므로 해석이 쉽습니다.
  snippet: |-
    mse = mean_squared_error(yTest, yPred)
    rmse = np.sqrt(mse)
    f"MSE: {mse:.2f}, RMSE: {rmse:.2f}"
  exercise:
    prompt: 8단계. MSE 평가 예제에서 \`mse\`, \`rmse\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      mse = mean_squared_error(yTest, yPred)
      rmse = np.sqrt(mse)
      f"MSE: {mse:.2f}, RMSE: {rmse:.2f}"
    hints:
    - 바꿀 지점은 \`mse = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`mse\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 8단계. MSE 평가에서 \`mse\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 8단계. MSE 평가 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step9_mae
  title: 9단계. MAE 평가
  structuredPrimary: true
  subtitle: mean_absolute_error
  goal: 9단계. MAE 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    MAE(Mean Absolute Error)는 예측 오차의 절대값 평균입니다. MSE보다 이상치에 덜 민감합니다. 평균적으로 얼마나 틀리는지를 나타냅니다.

    MAE = (1/n) * Σ|실제값 - 예측값|. 절대값을 사용하므로 MSE보다 큰 오차에 덜 민감합니다. 이상치가 많은 데이터에서는 MAE가 더 적합할 수 있습니다.
  snippet: |-
    mae = mean_absolute_error(yTest, yPred)
    f"MAE: {mae:.2f}"
  exercise:
    prompt: 9단계. MAE 평가 예제에서 \`mae\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      mae = mean_absolute_error(yTest, yPred)
      f"MAE: {mae:.2f}"
    hints:
    - 바꿀 지점은 \`mae = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`mae\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 9단계. MAE 평가에서 \`mae\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 9단계. MAE 평가 실행 뒤 \`mae\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step10_r2
  title: 10단계. R² 평가
  structuredPrimary: true
  subtitle: 결정계수
  goal: 10단계. R² 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    R²(결정계수)는 모델이 타겟 변동의 몇 %를 설명하는지 나타냅니다. 1에 가까울수록 좋고, 0이면 평균만큼도 못 맞추는 것입니다. statsmodels에서 배운 R²와 동일한 개념입니다.

    R² = 1 - (SS_res / SS_tot). SS_res는 잔차 제곱합, SS_tot은 전체 변동입니다. R²=0.5면 모델이 타겟 변동의 50%를 설명합니다. 음수도 가능하며, 이는 평균보다 못한 모델입니다.
  tips:
  - R² = 1 - (SS_res / SS_tot). SS_res는 잔차 제곱합, SS_tot은 전체 변동입니다. R²=0.5면 모델이 타겟 변동의 50%를 설명합니다. 음수도 가능하며,
    이는 평균보다 못한 모델입니다.
  snippet: |-
    r2 = r2_score(yTest, yPred)
    f"R²: {r2:.4f}"
  exercise:
    prompt: 10단계. R² 평가 예제에서 \`r2\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      r2 = r2_score(yTest, yPred)
      f"R²: {r2:.4f}"
    hints:
    - 바꿀 지점은 \`r2 = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`r2\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 10단계. R² 평가에서 \`r2\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 10단계. R² 평가 실행 뒤 \`r2\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step11_visualize
  title: 11단계. 시각화
  structuredPrimary: true
  subtitle: 예측 vs 실제
  goal: 11단계. 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.
  explanation: |-
    예측값과 실제값을 산점도로 비교합니다. 완벽한 모델이라면 점들이 대각선(y=x) 위에 있어야 합니다.

    잔차가 0 주변에 대칭적으로 분포하면 좋은 모델입니다. 한쪽으로 치우치거나 패턴이 있으면 모델에 문제가 있을 수 있습니다.
  snippet: |-
    fig, ax = plt.subplots(figsize=(8, 6))
    ax.scatter(yTest, yPred, alpha=0.6)
    ax.plot([yTest.min(), yTest.max()], [yTest.min(), yTest.max()], 'r--', lw=2)
    ax.set_xlabel('Actual')
    ax.set_ylabel('Predicted')
    ax.set_title(f'Actual vs Predicted (R² = {r2:.4f})')
    fig
  exercise:
    prompt: 11단계. 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.
    starterCode: |-
      fig, ax = plt.subplots(figsize=(8, 6))
      ax.scatter(yTest, yPred, alpha=0.6)
      ax.plot([yTest.min(), yTest.max()], [yTest.min(), yTest.max()], 'r--', lw=2)
      ax.set_xlabel('Actual')
      ax.set_ylabel('Predicted')
      ax.set_title(f'Actual vs Predicted (R² = {r2:.4f})')
      fig
    hints:
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.
  check:
    type: noError
    noError: 11단계. 시각화의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.
    resultCheck: 11단계. 시각화 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.
- id: step12_summary
  title: 12단계. 정리
  structuredPrimary: true
  subtitle: 회귀 분석 완료
  goal: 12단계. 정리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 이번 프로젝트에서는 당뇨병 진행도 예측 모델을 만들어 회귀 분석을 학습했습니다. LinearRegression으로 연속값을 예측하고, MSE, MAE, R²로
    모델을 평가하는 방법을 배웠습니다. statsmodels에서 배운 R² 개념이 sklearn에서도 동일하게 적용됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    summary = pd.DataFrame({
        'Item': ['Dataset', 'Model', 'Features', 'MSE', 'R²'],
        'Value': ['Diabetes (442 samples)', 'LinearRegression', '10', f'{mse:.2f}', f'{r2:.4f}']
    })
    summary
  exercise:
    prompt: 12단계. 정리 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      summary = pd.DataFrame({
          'Item': ['Dataset', 'Model', 'Features', 'MSE', 'R²'],
          'Value': ['Diabetes (442 samples)', 'LinearRegression', '10', f'{mse:.2f}', f'{r2:.4f}']
      })
      summary
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 12단계. 정리의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 12단계. 정리의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 당뇨병 예측 프로젝트
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    의료 데이터 분석가가 되어 당뇨병 진행도 예측 시스템을 구축합니다. 각 미션은 데이터 로딩부터 모델 학습, 평가까지 전 과정을 독립적으로 수행합니다. train_test_split, StandardScaler, LinearRegression, MSE, R²를 모두 활용합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    from sklearn.datasets import load_diabetes
    from sklearn.model_selection import train_test_split
    from sklearn.preprocessing import StandardScaler
    from sklearn.linear_model import LinearRegression
    from sklearn.metrics import r2_score, mean_squared_error
    import pandas as pd
    import numpy as np

    data = load_diabetes()
    xAll = pd.DataFrame(data.data, columns=data.feature_names)
    xBmi = xAll[['bmi']]
    yData = data.target

    xTr1, xTe1, yTr1, yTe1 = train_test_split(xAll, yData, test_size=0.2, random_state=42)
    xTr2, xTe2, yTr2, yTe2 = train_test_split(xBmi, yData, test_size=0.2, random_state=42)

    sc1, sc2 = StandardScaler(), StandardScaler()

    model1 = LinearRegression()
    model1.fit(sc1.fit_transform(xTr1), yTr1)
    pred1 = model1.predict(sc1.transform(xTe1))

    model2 = LinearRegression()
    model2.fit(sc2.fit_transform(xTr2), yTr2)
    pred2 = model2.predict(sc2.transform(xTe2))

    pd.DataFrame({
        'Model': ['All Features (10)', 'BMI Only (1)'],
        'R²': [r2_score(yTe1, pred1), r2_score(yTe2, pred2)],
        'RMSE': [np.sqrt(mean_squared_error(yTe1, pred1)), np.sqrt(mean_squared_error(yTe2, pred2))]
    })
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      from sklearn.datasets import load_diabetes
      from sklearn.model_selection import train_test_split
      from sklearn.preprocessing import StandardScaler
      from sklearn.linear_model import LinearRegression
      from sklearn.metrics import r2_score, mean_squared_error
      import pandas as pd
      import numpy as np

      data = load_diabetes()
      xAll = pd.DataFrame(data.data, columns=data.feature_names)
      xBmi = xAll[['bmi']]
      yData = data.target

      xTr1, xTe1, yTr1, yTe1 = train_test_split(xAll, yData, test_size=0.2, random_state=42)
      xTr2, xTe2, yTr2, yTe2 = train_test_split(xBmi, yData, test_size=0.2, random_state=42)

      sc1, sc2 = StandardScaler(), StandardScaler()

      model1 = LinearRegression()
      model1.fit(sc1.fit_transform(xTr1), yTr1)
      pred1 = model1.predict(sc1.transform(xTe1))

      model2 = LinearRegression()
      model2.fit(sc2.fit_transform(xTr2), yTr2)
      pred2 = model2.predict(sc2.transform(xTe2))

      pd.DataFrame({
          'Model': ['All Features (10)', 'BMI Only (1)'],
          'R²': [r2_score(yTe1, pred1), r2_score(yTe2, pred2)],
          'RMSE': [np.sqrt(mean_squared_error(yTe1, pred1)), np.sqrt(mean_squared_error(yTe2, pred2))]
      })
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: workflow_validation
  title: 업무 흐름 검증
  structuredPrimary: true
  subtitle: 예측 모델 품질 게이트
  goal: 업무 흐름 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: 실무 머신러닝은 모델을 fit하는 데서 끝나지 않습니다. 먼저 어떤 성능이 나올지 예측하고, 학습/평가 데이터를 분리한 뒤, 잘못된 입력을 명확한 오류로 막고,
    정확도와 F1 점수를 assert로 검증해야 합니다. 마지막에는 하이퍼파라미터를 바꾸는 변주로 성능과 안정성을 비교합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from sklearn.datasets import make_classification
    from sklearn.model_selection import train_test_split
    from sklearn.pipeline import Pipeline
    from sklearn.preprocessing import StandardScaler
    from sklearn.linear_model import LogisticRegression
    from sklearn.metrics import accuracy_score, f1_score

    features, target = make_classification(
        n_samples=240,
        n_features=6,
        n_informative=4,
        n_redundant=0,
        class_sep=1.4,
        random_state=42,
    )
    xTrain, xTest, yTrain, yTest = train_test_split(
        features, target, test_size=0.25, random_state=42, stratify=target
    )

    riskPipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", LogisticRegression(max_iter=1000, random_state=42)),
    ])

    def fitRiskModel(pipeline, featureMatrix, labels):
        pipeline.fit(featureMatrix, labels)
        return pipeline

    riskModel = fitRiskModel(riskPipeline, xTrain, yTrain)
    riskPred = riskModel.predict(xTest)
    riskAccuracy = accuracy_score(yTest, riskPred)
    riskF1 = f1_score(yTest, riskPred)
    xTrain.shape, xTest.shape
  exercise:
    prompt: 업무 흐름 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      conservativePipeline = Pipeline([
          ("scaler", StandardScaler()),
          ("classifier", LogisticRegression(C=0.3, max_iter=1000, random_state=42)),
      ])
      conservativeModel = fitRiskModel(conservativePipeline, xTrain, yTrain)
      conservativePred = conservativeModel.predict(xTest)
      conservativeAccuracy = accuracy_score(yTest, conservativePred)
      conservativeF1 = f1_score(yTest, conservativePred)

      assert conservativeAccuracy >= 0.75
      {
          "baselineAccuracy": round(riskAccuracy, 3),
          "baselineF1": round(riskF1, 3),
          "conservativeAccuracy": round(conservativeAccuracy, 3),
          "conservativeF1": round(conservativeF1, 3),
          "accuracyDelta": round(conservativeAccuracy - riskAccuracy, 3),
      }
    solution: |-
      from sklearn.datasets import make_classification
      from sklearn.model_selection import train_test_split
      from sklearn.pipeline import Pipeline
      from sklearn.preprocessing import StandardScaler
      from sklearn.linear_model import LogisticRegression
      from sklearn.metrics import accuracy_score, f1_score

      features, target = make_classification(
          n_samples=240,
          n_features=6,
          n_informative=4,
          n_redundant=0,
          class_sep=1.4,
          random_state=42,
      )
      xTrain, xTest, yTrain, yTest = train_test_split(
          features, target, test_size=0.25, random_state=42, stratify=target
      )

      riskPipeline = Pipeline([
          ("scaler", StandardScaler()),
          ("classifier", LogisticRegression(max_iter=1000, random_state=42)),
      ])
      xTrain.shape, xTest.shape
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 업무 흐름 검증에서 \`conservativePipeline\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
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
  - id: sklearn_03-regression-errors-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: 당뇨 진행도 회귀의 MAE·RMSE·bias 계산하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: held-out residual의 크기와 방향을 분리한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - MAE와 RMSE를 함께 보고 큰 오차의 영향을 확인하세요.
    - bias 부호는 예측-실제 정의를 명시하세요.
    exercise:
      prompt: regression_metrics(actual, predicted)를 완성하세요.
      starterCode: |-
        def regression_metrics(actual, predicted):
            raise NotImplementedError
      solution: |
        def regression_metrics(actual, predicted):
            if len(actual)!=len(predicted) or not actual: raise ValueError("invalid regression sample")
            residuals = [guess-truth for truth,guess in zip(actual,predicted)]
            mae = sum(abs(value) for value in residuals)/len(residuals); rmse=(sum(value*value for value in residuals)/len(residuals))**0.5
            return {"mae":round(mae,4),"rmse":round(rmse,4),"bias":round(sum(residuals)/len(residuals),4),"residuals":residuals}
      hints: *id001
    check:
      id: python.sklearn.sklearn_03.regression-errors.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.sklearn.sklearn_03.regression-errors.mastery.behavior.v1.fixture
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
        entry: regression_metrics
        cases:
        - id: computes-errors
          arguments:
          - value:
            - 10
            - 20
            - 30
          - value:
            - 12
            - 18
            - 35
          expectedReturn:
            mae: 3.0
            rmse: 3.3166
            bias: 1.6667
            residuals:
            - 2
            - -2
            - 5
        - id: perfect-prediction
          arguments:
          - value:
            - 1
            - 2
          - value:
            - 1
            - 2
          expectedReturn:
            mae: 0.0
            rmse: 0.0
            bias: 0.0
            residuals:
            - 0
            - 0
        - id: rejects-empty
          arguments:
          - value: []
          - value: []
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: sklearn_03-regression-baseline-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - sklearn_03-regression-errors-mastery
    title: 새 연속 target에 baseline 비교 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: train mean baseline을 test에 적용하고 모델 MAE 개선을 계산한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - baseline parameter도 train에서만 계산하세요.
    - 모델 metric이 baseline보다 나쁜 경우를 숨기지 마세요.
    exercise:
      prompt: compare_regression_baseline(train_targets, test_targets, model_predictions)를 완성하세요.
      starterCode: |-
        def compare_regression_baseline(train_targets, test_targets, model_predictions):
            raise NotImplementedError
      solution: |
        def compare_regression_baseline(train_targets, test_targets, model_predictions):
            if not train_targets or len(test_targets)!=len(model_predictions) or not test_targets: raise ValueError("invalid baseline sample")
            baseline = sum(train_targets)/len(train_targets)
            baseline_mae = sum(abs(value-baseline) for value in test_targets)/len(test_targets)
            model_mae = sum(abs(value-guess) for value,guess in zip(test_targets,model_predictions))/len(test_targets)
            return {"baselineValue":round(baseline,4),"baselineMAE":round(baseline_mae,4),"modelMAE":round(model_mae,4),"improvement":round(baseline_mae-model_mae,4)}
      hints: *id002
    check:
      id: python.sklearn.sklearn_03.regression-baseline.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.sklearn.sklearn_03.regression-baseline.transfer.behavior.v1.fixture
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
        entry: compare_regression_baseline
        cases:
        - id: beats-train-mean
          arguments:
          - value:
            - 10
            - 20
          - value:
            - 12
            - 18
          - value:
            - 13
            - 17
          expectedReturn:
            baselineValue: 15.0
            baselineMAE: 3.0
            modelMAE: 1.0
            improvement: 2.0
        - id: detects-worse-model
          arguments:
          - value:
            - 0
            - 0
          - value:
            - 1
            - 1
          - value:
            - 5
            - 5
          expectedReturn:
            baselineValue: 0.0
            baselineMAE: 1.0
            modelMAE: 4.0
            improvement: -3.0
        - id: rejects-empty-train
          arguments:
          - value: []
          - value:
            - 1
          - value:
            - 1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: sklearn_03-regression-evaluation-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - sklearn_03-regression-baseline-transfer
    title: 회귀 평가 근거 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 오차·baseline·분포 이동을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 학습 데이터와 평가 데이터의 경계를 먼저 확인하세요.
    - 한 metric이나 예측을 실제 진단·인과 결론으로 확대하지 마세요.
    exercise:
      prompt: choose_regression_evidence(situation)를 완성해 method, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_regression_evidence(situation):
            raise NotImplementedError
      solution: |
        def choose_regression_evidence(situation):
            table = {'typical-error': {'method': 'MAE', 'evidence': 'target units', 'risk': 'tail errors'}, 'large-error-penalty': {'method': 'RMSE', 'evidence': 'residual distribution', 'risk': 'outlier domination'}, 'model-value': {'method': 'held-out baseline comparison', 'evidence': 'same split', 'risk': 'test tuning'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.sklearn.sklearn_03.regression-evaluation.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.sklearn.sklearn_03.regression-evaluation.retrieval.behavior.v1.fixture
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
        entry: choose_regression_evidence
        cases:
        - id: recalls-typical-error
          arguments:
          - value: typical-error
          expectedReturn:
            method: MAE
            evidence: target units
            risk: tail errors
        - id: recalls-large-error-penalty
          arguments:
          - value: large-error-penalty
          expectedReturn:
            method: RMSE
            evidence: residual distribution
            risk: outlier domination
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};