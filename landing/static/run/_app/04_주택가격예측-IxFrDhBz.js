var e=`meta:
  packages:
  - matplotlib
  - numpy
  - pandas
  - scikit-learn
  id: sklearn_04
  title: 주택가격예측
  order: 4
  category: sklearn
  difficulty: ⭐⭐⭐
  badge: 기초
  tags:
  - 회귀
  - 교차검증
  - cross_val_score
  - 로컬데이터
  - 주택
  seo:
    title: scikit-learn 교차검증 - 로컬 주택 가격 예측
    description: cross_val_score로 교차검증을 수행합니다. 대규모 데이터셋으로 회귀 모델을 평가합니다.
    keywords:
    - scikit-learn
    - 교차검증
    - cross_val_score
    - 주택가격
    - 회귀
intro:
  emoji: 🏠
  goal: 교차검증으로 모델의 일반화 성능을 평가합니다.
  description: Codaro 로컬 주택 가격 데이터로 회귀 모델을 학습합니다. 교차검증(cross-validation)으로 모델이 새로운 데이터에도 잘 작동하는지 확인합니다.
    이전 프로젝트의 train_test_split, StandardScaler, LinearRegression, R²를 복습하고 cross_val_score를 새로 배웁니다.
  direction: 주택가격예측에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.
  benefits:
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.
  - 주택가격예측 결과를 출력과 상태 기준으로 즉시 점검합니다.
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 불러오기 처리 실행
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 데이터 탐색 결과 검증
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.
    - label: 주택가격예측 재사용
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.
    runtime:
    - label: 업무 코드 환경
      detail: matplotlib, numpy, pandas, scikit-learn 기준으로 로컬 Python 실행을 준비합니다.
    - label: 주택가격예측 실행
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.
    - label: 주택가격예측 완료
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: 로컬 주택 가격 예측에 필요한 라이브러리를 불러옵니다. 교차검증을 위해 cross_val_score를 추가로 임포트합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.preprocessing import StandardScaler
    from sklearn.linear_model import LinearRegression, Ridge
    from sklearn.metrics import mean_squared_error, r2_score
    from codaro.curriculum.localData import loadLocalDataset
    import pandas as pd
    import numpy as np
    import matplotlib.pyplot as plt
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      from sklearn.model_selection import train_test_split, cross_val_score
      from sklearn.preprocessing import StandardScaler
      from sklearn.linear_model import LinearRegression, Ridge
      from sklearn.metrics import mean_squared_error, r2_score
      from codaro.curriculum.localData import loadLocalDataset
      import pandas as pd
      import numpy as np
      import matplotlib.pyplot as plt
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 라이브러리 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step2_load
  title: 2단계. 데이터 불러오기
  structuredPrimary: true
  subtitle: loadLocalDataset()
  goal: 2단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    Codaro 로컬 주택 데이터셋은 방 개수, 범죄율, 세금, 학생-교사 비율, 저소득층 비율 같은 특성으로 주택 가격 중앙값을 예측합니다. 외부 다운로드 없이 실행되므로 로컬 Python 학습 흐름에 맞습니다.

    rm은 평균 방 개수, lstat은 저소득층 비율, tax는 재산세율, ptratio는 학생-교사 비율, medv는 주택 가격 중앙값입니다. 타겟 컬럼 medv는 학습 입력에서 제외해야 데이터 누수를 막을 수 있습니다.
  tips:
  - rm은 평균 방 개수, lstat은 저소득층 비율, tax는 재산세율, ptratio는 학생-교사 비율, medv는 주택 가격 중앙값입니다. 타겟 컬럼 medv는 학습 입력에서
    제외해야 데이터 누수를 막을 수 있습니다.
  snippet: |-
    housing = loadLocalDataset("boston_housing")
    X = housing.drop(columns=["medv"])
    y = housing["medv"]
    featureNames = X.columns.tolist()
    X.shape
  exercise:
    prompt: 2단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      housing = loadLocalDataset("boston_housing")
      X = housing.drop(columns=["medv"])
      y = housing["medv"]
      featureNames = X.columns.tolist()
      X.shape
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 2단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step3_explore
  title: 3단계. 데이터 탐색
  structuredPrimary: true
  subtitle: 분포 확인
  goal: 3단계. 데이터 탐색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.
  explanation: 대규모 데이터셋의 특성과 타겟 분포를 확인합니다. 이상치나 스케일 차이를 파악합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: X.describe()
  exercise:
    prompt: 3단계. 데이터 탐색 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.
    starterCode: X.describe()
    hints:
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 3단계. 데이터 탐색의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.
    resultCheck: 3단계. 데이터 탐색 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step4_split
  title: 4단계. 데이터 분할
  structuredPrimary: true
  subtitle: train_test_split
  goal: 4단계. 데이터 분할에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 데이터가 작을수록 분할 운에 성능이 흔들릴 수 있습니다. 그래서 단일 테스트 성능만 보지 않고 뒤에서 교차검증 평균과 표준편차를 함께 확인합니다.
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
  explanation: 특성들의 스케일이 서로 다릅니다. 방 개수, 세금, 저소득층 비율처럼 단위가 다른 변수를 함께 쓰므로 StandardScaler로 표준화합니다.
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
- id: step6_baseline
  title: 6단계. 기본 모델
  structuredPrimary: true
  subtitle: LinearRegression
  goal: 6단계. 기본 모델에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 먼저 LinearRegression으로 기본 성능을 확인합니다. 이 성능을 기준(baseline)으로 다른 모델과 비교합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    modelLr = LinearRegression()
    modelLr.fit(xTrainSc, yTrain)
    predLr = modelLr.predict(xTestSc)
    r2Lr = r2_score(yTest, predLr)
    f"LinearRegression R²: {r2Lr:.4f}"
  exercise:
    prompt: 6단계. 기본 모델 예제에서 \`modelLr\`, \`predLr\`, \`r2Lr\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      modelLr = LinearRegression()
      modelLr.fit(xTrainSc, yTrain)
      predLr = modelLr.predict(xTestSc)
      r2Lr = r2_score(yTest, predLr)
      f"LinearRegression R²: {r2Lr:.4f}"
    hints:
    - 바꿀 지점은 \`modelLr = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`modelLr\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 6단계. 기본 모델에서 \`modelLr\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 6단계. 기본 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step7_cv_intro
  title: 7단계. 교차검증 소개
  structuredPrimary: true
  subtitle: 왜 필요한가?
  goal: 7단계. 교차검증 소개에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    단일 train/test 분할은 운에 따라 결과가 달라질 수 있습니다. 교차검증(cross-validation)은 데이터를 K개로 나눠 K번 반복 평가합니다. 모든 데이터가 한 번씩 테스트에 사용되므로 더 신뢰할 수 있는 성능 추정이 가능합니다.

    cv=5는 데이터를 5등분하여 4개로 학습, 1개로 평가를 5번 반복합니다. scoring='r2'는 R²를 평가 지표로 사용합니다. 회귀에서는 'neg_mean_squared_error'도 많이 사용합니다.
  tips:
  - cv=5는 데이터를 5등분하여 4개로 학습, 1개로 평가를 5번 반복합니다. scoring='r2'는 R²를 평가 지표로 사용합니다. 회귀에서는 'neg_mean_squared_error'도
    많이 사용합니다.
  snippet: |-
    cvScores = cross_val_score(modelLr, xTrainSc, yTrain, cv=5, scoring='r2')
    cvScores
  exercise:
    prompt: 7단계. 교차검증 소개 예제에서 \`cvScores\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      cvScores = cross_val_score(modelLr, xTrainSc, yTrain, cv=5, scoring='r2')
      cvScores
    hints:
    - 바꿀 지점은 \`cvScores = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`cvScores\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 7단계. 교차검증 소개에서 \`cvScores\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 7단계. 교차검증 소개 실행 뒤 \`cvScores\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step8_cv_analysis
  title: 8단계. 교차검증 분석
  structuredPrimary: true
  subtitle: 평균과 표준편차
  goal: 8단계. 교차검증 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    교차검증 결과의 평균과 표준편차를 확인합니다. 표준편차가 작으면 모델이 안정적입니다. 표준편차가 크면 데이터 분할에 따라 성능이 크게 달라지는 것입니다.

    모델 성능 보고 시 '0.60 ± 0.02'처럼 평균 ± 표준편차로 표기합니다. 표준편차가 0.05 이하면 안정적, 0.1 이상이면 불안정한 모델입니다.
  snippet: |-
    cvMean = cvScores.mean()
    cvStd = cvScores.std()
    f"CV R²: {cvMean:.4f} ± {cvStd:.4f}"
  exercise:
    prompt: 8단계. 교차검증 분석 예제에서 \`cvMean\`, \`cvStd\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      cvMean = cvScores.mean()
      cvStd = cvScores.std()
      f"CV R²: {cvMean:.4f} ± {cvStd:.4f}"
    hints:
    - 바꿀 지점은 \`cvMean = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`cvMean\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 8단계. 교차검증 분석에서 \`cvMean\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 8단계. 교차검증 분석 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step9_ridge
  title: 9단계. Ridge 회귀
  structuredPrimary: true
  subtitle: 정규화
  goal: 9단계. Ridge 회귀에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    Ridge 회귀는 LinearRegression에 L2 정규화를 추가한 것입니다. 과적합을 방지하고 모델을 더 안정적으로 만듭니다. alpha 파라미터로 정규화 강도를 조절합니다.

    Ridge는 계수(가중치)의 크기를 제한하여 과적합을 방지합니다. alpha가 클수록 정규화가 강해집니다. alpha=0이면 LinearRegression과 동일합니다.
  snippet: |-
    modelRidge = Ridge(alpha=1.0)
    modelRidge.fit(xTrainSc, yTrain)
    predRidge = modelRidge.predict(xTestSc)
    r2Ridge = r2_score(yTest, predRidge)
    cvRidge = cross_val_score(modelRidge, xTrainSc, yTrain, cv=5, scoring='r2')
    f"Ridge R²: {r2Ridge:.4f}"
  exercise:
    prompt: 9단계. Ridge 회귀 예제에서 \`modelRidge\`, \`predRidge\`, \`r2Ridge\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.
    starterCode: |-
      modelRidge = Ridge(alpha=1.0)
      modelRidge.fit(xTrainSc, yTrain)
      predRidge = modelRidge.predict(xTestSc)
      r2Ridge = r2_score(yTest, predRidge)
      cvRidge = cross_val_score(modelRidge, xTrainSc, yTrain, cv=5, scoring='r2')
      f"Ridge R²: {r2Ridge:.4f}"
    hints:
    - 바꿀 지점은 \`modelRidge = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`modelRidge\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 9단계. Ridge 회귀에서 \`modelRidge\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 9단계. Ridge 회귀 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step10_compare
  title: 10단계. 모델 비교
  structuredPrimary: true
  subtitle: 성능 비교
  goal: 10단계. 모델 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: LinearRegression과 Ridge의 성능을 비교합니다. 교차검증 결과와 테스트 결과를 함께 확인합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    comparison = pd.DataFrame({
        'Model': ['LinearRegression', 'Ridge'],
        'Test R²': [r2Lr, r2Ridge],
        'CV R² (mean)': [cvScores.mean(), cvRidge.mean()],
        'CV R² (std)': [cvScores.std(), cvRidge.std()]
    })
    comparison
  exercise:
    prompt: 10단계. 모델 비교 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      comparison = pd.DataFrame({
          'Model': ['LinearRegression', 'Ridge'],
          'Test R²': [r2Lr, r2Ridge],
          'CV R² (mean)': [cvScores.mean(), cvRidge.mean()],
          'CV R² (std)': [cvScores.std(), cvRidge.std()]
      })
      comparison
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 10단계. 모델 비교의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 10단계. 모델 비교의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step11_feature_importance
  title: 11단계. 특성 중요도
  structuredPrimary: true
  subtitle: 회귀 계수 분석
  goal: 11단계. 특성 중요도에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    회귀 계수의 절대값을 비교하여 어떤 특성이 주택 가격에 가장 큰 영향을 미치는지 확인합니다.

    양수 계수는 특성이 증가할 때 가격도 증가함을 의미합니다. 표준화된 입력에서는 계수 절대값으로 어떤 변수가 예측에 더 크게 기여하는지 비교할 수 있습니다.
  snippet: |-
    importance = pd.DataFrame({
        'Feature': featureNames,
        'Coefficient': modelLr.coef_
    })
    importance['Abs'] = importance['Coefficient'].abs()
    importance.sort_values('Abs', ascending=False)
  exercise:
    prompt: 11단계. 특성 중요도 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      importance = pd.DataFrame({
          'Feature': featureNames,
          'Coefficient': modelLr.coef_
      })
      importance['Abs'] = importance['Coefficient'].abs()
      importance.sort_values('Abs', ascending=False)
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 11단계. 특성 중요도의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 11단계. 특성 중요도의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step12_summary
  title: 12단계. 정리
  structuredPrimary: true
  subtitle: 교차검증 완료
  goal: 12단계. 정리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 이번 프로젝트에서는 로컬 주택 가격 예측 모델을 만들고 교차검증으로 평가했습니다. cross_val_score로 모델의 일반화 성능을 측정하고, Ridge
    회귀로 정규화의 효과를 확인했습니다. 다운로드 없는 로컬 회귀 분석 워크플로우를 익혔습니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    summary = pd.DataFrame({
        'Item': ['Dataset', 'Best Model', 'Test R²', 'CV R²', 'Key Feature'],
        'Value': ['Codaro local housing', 'Ridge', f'{r2Ridge:.4f}', f'{cvRidge.mean():.4f}', importance.sort_values('Abs', ascending=False).iloc[0]['Feature']]
    })
    summary
  exercise:
    prompt: 12단계. 정리 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      summary = pd.DataFrame({
          'Item': ['Dataset', 'Best Model', 'Test R²', 'CV R²', 'Key Feature'],
          'Value': ['Codaro local housing', 'Ridge', f'{r2Ridge:.4f}', f'{cvRidge.mean():.4f}', importance.sort_values('Abs', ascending=False).iloc[0]['Feature']]
      })
      summary
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    noError: 12단계. 정리의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 12단계. 정리의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 주택 가격 예측 프로젝트
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    부동산 분석가가 되어 주택 가격 예측 시스템을 구축합니다. 각 미션은 데이터 로딩부터 모델 학습, 교차검증까지 전 과정을 독립적으로 수행합니다. train_test_split, StandardScaler, LinearRegression, Ridge, cross_val_score, R²를 모두 활용합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    from sklearn.model_selection import train_test_split, cross_val_score
    from sklearn.preprocessing import StandardScaler
    from sklearn.linear_model import Ridge
    from codaro.curriculum.localData import loadLocalDataset
    import pandas as pd

    data = loadLocalDataset("boston_housing")
    xData = data.drop(columns=["medv"])
    yData = data["medv"]

    xTr, xTe, yTr, yTe = train_test_split(xData, yData, test_size=0.2, random_state=42)
    sc = StandardScaler()
    xTrSc = sc.fit_transform(xTr)

    alphas = [0.01, 0.1, 1.0, 10.0, 100.0]
    results = []

    for a in alphas:
        ridge = Ridge(alpha=a)
        cvScore = cross_val_score(ridge, xTrSc, yTr, cv=5, scoring='r2')
        results.append({'alpha': a, 'CV R² mean': cvScore.mean(), 'CV R² std': cvScore.std()})

    pd.DataFrame(results)
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      from sklearn.model_selection import train_test_split, cross_val_score
      from sklearn.preprocessing import StandardScaler
      from sklearn.linear_model import Ridge
      from codaro.curriculum.localData import loadLocalDataset
      import pandas as pd

      data = loadLocalDataset("boston_housing")
      xData = data.drop(columns=["medv"])
      yData = data["medv"]

      xTr, xTe, yTr, yTe = train_test_split(xData, yData, test_size=0.2, random_state=42)
      sc = StandardScaler()
      xTrSc = sc.fit_transform(xTr)

      alphas = [0.01, 0.1, 1.0, 10.0, 100.0]
      results = []

      for a in alphas:
          ridge = Ridge(alpha=a)
          cvScore = cross_val_score(ridge, xTrSc, yTr, cv=5, scoring='r2')
          results.append({'alpha': a, 'CV R² mean': cvScore.mean(), 'CV R² std': cvScore.std()})

      pd.DataFrame(results)
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
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
  - id: sklearn_04-housing-leakage-audit-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - workflow_validation
    title: 주택 가격 feature의 target·미래 누수 검사하기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: 금지 feature와 availability 시점을 기준으로 누수를 찾는다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 예측 시점에 실제로 알 수 있는 feature만 사용하세요.
    - target의 변형·사후 세금도 leakage입니다.
    exercise:
      prompt: audit_housing_features(features, prediction_time)를 완성하세요.
      starterCode: |-
        def audit_housing_features(features, prediction_time):
            raise NotImplementedError
      solution: |
        def audit_housing_features(features, prediction_time):
            forbidden_names = {"salePrice","finalPrice","postSaleTax"}; leaked=[]; usable=[]
            for feature in features:
                if feature["name"] in forbidden_names or feature.get("availableAt",prediction_time) > prediction_time: leaked.append(feature["name"])
                else: usable.append(feature["name"])
            return {"valid":not leaked,"usable":sorted(usable),"leaked":sorted(leaked)}
      hints: *id001
    check:
      id: python.sklearn.sklearn_04.housing-leakage-audit.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.sklearn.sklearn_04.housing-leakage-audit.mastery.behavior.v1.fixture
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
        entry: audit_housing_features
        cases:
        - id: keeps-prelisting-features
          arguments:
          - value:
            - name: area
              availableAt: 1
            - name: salePrice
              availableAt: 3
            - name: renovation
              availableAt: 4
          - value: 2
          expectedReturn:
            valid: false
            usable:
            - area
            leaked:
            - renovation
            - salePrice
        - id: accepts-clean-set
          arguments:
          - value:
            - name: rooms
              availableAt: 1
          - value: 1
          expectedReturn:
            valid: true
            usable:
            - rooms
            leaked: []
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: sklearn_04-cross-validation-folds-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - sklearn_04-housing-leakage-audit-mastery
    title: 새 회귀 dataset에 K-fold 원장 전이하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 각 row가 validation에 정확히 한 번 등장하는지 검사한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 각 row는 validation에 정확히 한 번 들어가야 합니다.
    - CV split 원장을 모델 선택과 함께 보존하세요.
    exercise:
      prompt: audit_cv_folds(row_ids, validation_folds)를 완성하세요.
      starterCode: |-
        def audit_cv_folds(row_ids, validation_folds):
            raise NotImplementedError
      solution: |
        def audit_cv_folds(row_ids, validation_folds):
            counts={row_id:0 for row_id in row_ids}; unknown=[]
            for fold in validation_folds:
                for row_id in fold:
                    if row_id not in counts: unknown.append(row_id)
                    else: counts[row_id]+=1
            missing=sorted(row_id for row_id,count in counts.items() if count==0); repeated=sorted(row_id for row_id,count in counts.items() if count>1)
            return {"valid":not missing and not repeated and not unknown,"missing":missing,"repeated":repeated,"unknown":sorted(set(unknown)),"foldSizes":[len(fold) for fold in validation_folds]}
      hints: *id002
    check:
      id: python.sklearn.sklearn_04.cross-validation-folds.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.sklearn.sklearn_04.cross-validation-folds.transfer.behavior.v1.fixture
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
        entry: audit_cv_folds
        cases:
        - id: accepts-complete-folds
          arguments:
          - value:
            - 1
            - 2
            - 3
            - 4
          - value:
            - - 1
              - 2
            - - 3
              - 4
          expectedReturn:
            valid: true
            missing: []
            repeated: []
            unknown: []
            foldSizes:
            - 2
            - 2
        - id: reports-fold-errors
          arguments:
          - value:
            - 1
            - 2
            - 3
          - value:
            - - 1
              - 2
            - - 2
              - 4
          expectedReturn:
            valid: false
            missing:
            - 3
            repeated:
            - 2
            unknown:
            - 4
            foldSizes:
            - 2
            - 2
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: sklearn_04-housing-model-validation-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - sklearn_04-cross-validation-folds-transfer
    title: 주택 회귀 검증 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: 누수·공간 grouping·시간 drift를 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 학습 데이터와 평가 데이터의 경계를 먼저 확인하세요.
    - 한 metric이나 예측을 실제 진단·인과 결론으로 확대하지 마세요.
    exercise:
      prompt: choose_housing_validation(situation)를 완성해 method, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_housing_validation(situation):
            raise NotImplementedError
      solution: |
        def choose_housing_validation(situation):
            table = {'random-homes': {'method': 'K-fold with pipeline', 'evidence': 'fold ledger', 'risk': 'neighborhood duplicates'}, 'same-buildings': {'method': 'group split', 'evidence': 'building overlap zero', 'risk': 'entity leakage'}, 'future-prices': {'method': 'time split', 'evidence': 'sale date boundary', 'risk': 'market lookahead'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.sklearn.sklearn_04.housing-model-validation.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.sklearn.sklearn_04.housing-model-validation.retrieval.behavior.v1.fixture
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
        entry: choose_housing_validation
        cases:
        - id: recalls-random-homes
          arguments:
          - value: random-homes
          expectedReturn:
            method: K-fold with pipeline
            evidence: fold ledger
            risk: neighborhood duplicates
        - id: recalls-same-buildings
          arguments:
          - value: same-buildings
          expectedReturn:
            method: group split
            evidence: building overlap zero
            risk: entity leakage
        - id: rejects-unknown
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};