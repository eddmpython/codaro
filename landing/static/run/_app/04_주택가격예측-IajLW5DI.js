var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scikit-learn\r
  id: sklearn_04\r
  title: 주택가격예측\r
  order: 4\r
  category: sklearn\r
  difficulty: ⭐⭐⭐\r
  badge: 기초\r
  tags:\r
  - 회귀\r
  - 교차검증\r
  - cross_val_score\r
  - 로컬데이터\r
  - 주택\r
  seo:\r
    title: scikit-learn 교차검증 - 로컬 주택 가격 예측\r
    description: cross_val_score로 교차검증을 수행합니다. 대규모 데이터셋으로 회귀 모델을 평가합니다.\r
    keywords:\r
    - scikit-learn\r
    - 교차검증\r
    - cross_val_score\r
    - 주택가격\r
    - 회귀\r
intro:\r
  emoji: 🏠\r
  goal: 교차검증으로 모델의 일반화 성능을 평가합니다.\r
  description: Codaro 로컬 주택 가격 데이터로 회귀 모델을 학습합니다. 교차검증(cross-validation)으로 모델이 새로운 데이터에도 잘 작동하는지 확인합니다.\r
    이전 프로젝트의 train_test_split, StandardScaler, LinearRegression, R²를 복습하고 cross_val_score를 새로 배웁니다.\r
  direction: 주택가격예측에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 주택가격예측 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 불러오기 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 데이터 탐색 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 주택가격예측 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: matplotlib, numpy, pandas, scikit-learn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 주택가격예측 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 주택가격예측 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 로컬 주택 가격 예측에 필요한 라이브러리를 불러옵니다. 교차검증을 위해 cross_val_score를 추가로 임포트합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sklearn.model_selection import train_test_split, cross_val_score\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.linear_model import LinearRegression, Ridge\r
    from sklearn.metrics import mean_squared_error, r2_score\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import pandas as pd\r
    import numpy as np\r
    import matplotlib.pyplot as plt\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.model_selection import train_test_split, cross_val_score\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.linear_model import LinearRegression, Ridge\r
      from sklearn.metrics import mean_squared_error, r2_score\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import pandas as pd\r
      import numpy as np\r
      import matplotlib.pyplot as plt\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_load\r
  title: 2단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: loadLocalDataset()\r
  goal: 2단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    Codaro 로컬 주택 데이터셋은 방 개수, 범죄율, 세금, 학생-교사 비율, 저소득층 비율 같은 특성으로 주택 가격 중앙값을 예측합니다. 외부 다운로드 없이 실행되므로 로컬 Python 학습 흐름에 맞습니다.\r
\r
    rm은 평균 방 개수, lstat은 저소득층 비율, tax는 재산세율, ptratio는 학생-교사 비율, medv는 주택 가격 중앙값입니다. 타겟 컬럼 medv는 학습 입력에서 제외해야 데이터 누수를 막을 수 있습니다.\r
  tips:\r
  - rm은 평균 방 개수, lstat은 저소득층 비율, tax는 재산세율, ptratio는 학생-교사 비율, medv는 주택 가격 중앙값입니다. 타겟 컬럼 medv는 학습 입력에서\r
    제외해야 데이터 누수를 막을 수 있습니다.\r
  snippet: |-\r
    housing = loadLocalDataset("boston_housing")\r
    X = housing.drop(columns=["medv"])\r
    y = housing["medv"]\r
    featureNames = X.columns.tolist()\r
    X.shape\r
  exercise:\r
    prompt: 2단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      housing = loadLocalDataset("boston_housing")\r
      X = housing.drop(columns=["medv"])\r
      y = housing["medv"]\r
      featureNames = X.columns.tolist()\r
      X.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_explore\r
  title: 3단계. 데이터 탐색\r
  structuredPrimary: true\r
  subtitle: 분포 확인\r
  goal: 3단계. 데이터 탐색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: 대규모 데이터셋의 특성과 타겟 분포를 확인합니다. 이상치나 스케일 차이를 파악합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: X.describe()\r
  exercise:\r
    prompt: 3단계. 데이터 탐색 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: X.describe()\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 데이터 탐색의 수정 코드가 핵심 처리 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 3단계. 데이터 탐색 실행 결과가 출력과 상태 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step4_split\r
  title: 4단계. 데이터 분할\r
  structuredPrimary: true\r
  subtitle: train_test_split\r
  goal: 4단계. 데이터 분할에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 데이터가 작을수록 분할 운에 성능이 흔들릴 수 있습니다. 그래서 단일 테스트 성능만 보지 않고 뒤에서 교차검증 평균과 표준편차를 함께 확인합니다.\r
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
  explanation: 특성들의 스케일이 서로 다릅니다. 방 개수, 세금, 저소득층 비율처럼 단위가 다른 변수를 함께 쓰므로 StandardScaler로 표준화합니다.\r
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
- id: step6_baseline\r
  title: 6단계. 기본 모델\r
  structuredPrimary: true\r
  subtitle: LinearRegression\r
  goal: 6단계. 기본 모델에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 먼저 LinearRegression으로 기본 성능을 확인합니다. 이 성능을 기준(baseline)으로 다른 모델과 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    modelLr = LinearRegression()\r
    modelLr.fit(xTrainSc, yTrain)\r
    predLr = modelLr.predict(xTestSc)\r
    r2Lr = r2_score(yTest, predLr)\r
    f"LinearRegression R²: {r2Lr:.4f}"\r
  exercise:\r
    prompt: 6단계. 기본 모델 예제에서 \`modelLr\`, \`predLr\`, \`r2Lr\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      modelLr = LinearRegression()\r
      modelLr.fit(xTrainSc, yTrain)\r
      predLr = modelLr.predict(xTestSc)\r
      r2Lr = r2_score(yTest, predLr)\r
      f"LinearRegression R²: {r2Lr:.4f}"\r
    hints:\r
    - 바꿀 지점은 \`modelLr = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`modelLr\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 기본 모델에서 \`modelLr\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 기본 모델 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step7_cv_intro\r
  title: 7단계. 교차검증 소개\r
  structuredPrimary: true\r
  subtitle: 왜 필요한가?\r
  goal: 7단계. 교차검증 소개에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    단일 train/test 분할은 운에 따라 결과가 달라질 수 있습니다. 교차검증(cross-validation)은 데이터를 K개로 나눠 K번 반복 평가합니다. 모든 데이터가 한 번씩 테스트에 사용되므로 더 신뢰할 수 있는 성능 추정이 가능합니다.\r
\r
    cv=5는 데이터를 5등분하여 4개로 학습, 1개로 평가를 5번 반복합니다. scoring='r2'는 R²를 평가 지표로 사용합니다. 회귀에서는 'neg_mean_squared_error'도 많이 사용합니다.\r
  tips:\r
  - cv=5는 데이터를 5등분하여 4개로 학습, 1개로 평가를 5번 반복합니다. scoring='r2'는 R²를 평가 지표로 사용합니다. 회귀에서는 'neg_mean_squared_error'도\r
    많이 사용합니다.\r
  snippet: |-\r
    cvScores = cross_val_score(modelLr, xTrainSc, yTrain, cv=5, scoring='r2')\r
    cvScores\r
  exercise:\r
    prompt: 7단계. 교차검증 소개 예제에서 \`cvScores\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      cvScores = cross_val_score(modelLr, xTrainSc, yTrain, cv=5, scoring='r2')\r
      cvScores\r
    hints:\r
    - 바꿀 지점은 \`cvScores = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`cvScores\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 교차검증 소개에서 \`cvScores\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 교차검증 소개 실행 뒤 \`cvScores\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step8_cv_analysis\r
  title: 8단계. 교차검증 분석\r
  structuredPrimary: true\r
  subtitle: 평균과 표준편차\r
  goal: 8단계. 교차검증 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    교차검증 결과의 평균과 표준편차를 확인합니다. 표준편차가 작으면 모델이 안정적입니다. 표준편차가 크면 데이터 분할에 따라 성능이 크게 달라지는 것입니다.\r
\r
    모델 성능 보고 시 '0.60 ± 0.02'처럼 평균 ± 표준편차로 표기합니다. 표준편차가 0.05 이하면 안정적, 0.1 이상이면 불안정한 모델입니다.\r
  snippet: |-\r
    cvMean = cvScores.mean()\r
    cvStd = cvScores.std()\r
    f"CV R²: {cvMean:.4f} ± {cvStd:.4f}"\r
  exercise:\r
    prompt: 8단계. 교차검증 분석 예제에서 \`cvMean\`, \`cvStd\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      cvMean = cvScores.mean()\r
      cvStd = cvScores.std()\r
      f"CV R²: {cvMean:.4f} ± {cvStd:.4f}"\r
    hints:\r
    - 바꿀 지점은 \`cvMean = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`cvMean\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 교차검증 분석에서 \`cvMean\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 교차검증 분석 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_ridge\r
  title: 9단계. Ridge 회귀\r
  structuredPrimary: true\r
  subtitle: 정규화\r
  goal: 9단계. Ridge 회귀에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Ridge 회귀는 LinearRegression에 L2 정규화를 추가한 것입니다. 과적합을 방지하고 모델을 더 안정적으로 만듭니다. alpha 파라미터로 정규화 강도를 조절합니다.\r
\r
    Ridge는 계수(가중치)의 크기를 제한하여 과적합을 방지합니다. alpha가 클수록 정규화가 강해집니다. alpha=0이면 LinearRegression과 동일합니다.\r
  snippet: |-\r
    modelRidge = Ridge(alpha=1.0)\r
    modelRidge.fit(xTrainSc, yTrain)\r
    predRidge = modelRidge.predict(xTestSc)\r
    r2Ridge = r2_score(yTest, predRidge)\r
    cvRidge = cross_val_score(modelRidge, xTrainSc, yTrain, cv=5, scoring='r2')\r
    f"Ridge R²: {r2Ridge:.4f}"\r
  exercise:\r
    prompt: 9단계. Ridge 회귀 예제에서 \`modelRidge\`, \`predRidge\`, \`r2Ridge\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      modelRidge = Ridge(alpha=1.0)\r
      modelRidge.fit(xTrainSc, yTrain)\r
      predRidge = modelRidge.predict(xTestSc)\r
      r2Ridge = r2_score(yTest, predRidge)\r
      cvRidge = cross_val_score(modelRidge, xTrainSc, yTrain, cv=5, scoring='r2')\r
      f"Ridge R²: {r2Ridge:.4f}"\r
    hints:\r
    - 바꿀 지점은 \`modelRidge = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`modelRidge\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. Ridge 회귀에서 \`modelRidge\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. Ridge 회귀 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step10_compare\r
  title: 10단계. 모델 비교\r
  structuredPrimary: true\r
  subtitle: 성능 비교\r
  goal: 10단계. 모델 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: LinearRegression과 Ridge의 성능을 비교합니다. 교차검증 결과와 테스트 결과를 함께 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    comparison = pd.DataFrame({\r
        'Model': ['LinearRegression', 'Ridge'],\r
        'Test R²': [r2Lr, r2Ridge],\r
        'CV R² (mean)': [cvScores.mean(), cvRidge.mean()],\r
        'CV R² (std)': [cvScores.std(), cvRidge.std()]\r
    })\r
    comparison\r
  exercise:\r
    prompt: 10단계. 모델 비교 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      comparison = pd.DataFrame({\r
          'Model': ['LinearRegression', 'Ridge'],\r
          'Test R²': [r2Lr, r2Ridge],\r
          'CV R² (mean)': [cvScores.mean(), cvRidge.mean()],\r
          'CV R² (std)': [cvScores.std(), cvRidge.std()]\r
      })\r
      comparison\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 모델 비교의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 모델 비교의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step11_feature_importance\r
  title: 11단계. 특성 중요도\r
  structuredPrimary: true\r
  subtitle: 회귀 계수 분석\r
  goal: 11단계. 특성 중요도에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    회귀 계수의 절대값을 비교하여 어떤 특성이 주택 가격에 가장 큰 영향을 미치는지 확인합니다.\r
\r
    양수 계수는 특성이 증가할 때 가격도 증가함을 의미합니다. 표준화된 입력에서는 계수 절대값으로 어떤 변수가 예측에 더 크게 기여하는지 비교할 수 있습니다.\r
  snippet: |-\r
    importance = pd.DataFrame({\r
        'Feature': featureNames,\r
        'Coefficient': modelLr.coef_\r
    })\r
    importance['Abs'] = importance['Coefficient'].abs()\r
    importance.sort_values('Abs', ascending=False)\r
  exercise:\r
    prompt: 11단계. 특성 중요도 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      importance = pd.DataFrame({\r
          'Feature': featureNames,\r
          'Coefficient': modelLr.coef_\r
      })\r
      importance['Abs'] = importance['Coefficient'].abs()\r
      importance.sort_values('Abs', ascending=False)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 특성 중요도의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 특성 중요도의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_summary\r
  title: 12단계. 정리\r
  structuredPrimary: true\r
  subtitle: 교차검증 완료\r
  goal: 12단계. 정리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 이번 프로젝트에서는 로컬 주택 가격 예측 모델을 만들고 교차검증으로 평가했습니다. cross_val_score로 모델의 일반화 성능을 측정하고, Ridge\r
    회귀로 정규화의 효과를 확인했습니다. 다운로드 없는 로컬 회귀 분석 워크플로우를 익혔습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    summary = pd.DataFrame({\r
        'Item': ['Dataset', 'Best Model', 'Test R²', 'CV R²', 'Key Feature'],\r
        'Value': ['Codaro local housing', 'Ridge', f'{r2Ridge:.4f}', f'{cvRidge.mean():.4f}', importance.sort_values('Abs', ascending=False).iloc[0]['Feature']]\r
    })\r
    summary\r
  exercise:\r
    prompt: 12단계. 정리 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      summary = pd.DataFrame({\r
          'Item': ['Dataset', 'Best Model', 'Test R²', 'CV R²', 'Key Feature'],\r
          'Value': ['Codaro local housing', 'Ridge', f'{r2Ridge:.4f}', f'{cvRidge.mean():.4f}', importance.sort_values('Abs', ascending=False).iloc[0]['Feature']]\r
      })\r
      summary\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 12단계. 정리의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 정리의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 주택 가격 예측 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    부동산 분석가가 되어 주택 가격 예측 시스템을 구축합니다. 각 미션은 데이터 로딩부터 모델 학습, 교차검증까지 전 과정을 독립적으로 수행합니다. train_test_split, StandardScaler, LinearRegression, Ridge, cross_val_score, R²를 모두 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sklearn.model_selection import train_test_split, cross_val_score\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.linear_model import Ridge\r
    from codaro.curriculum.localData import loadLocalDataset\r
    import pandas as pd\r
\r
    data = loadLocalDataset("boston_housing")\r
    xData = data.drop(columns=["medv"])\r
    yData = data["medv"]\r
\r
    xTr, xTe, yTr, yTe = train_test_split(xData, yData, test_size=0.2, random_state=42)\r
    sc = StandardScaler()\r
    xTrSc = sc.fit_transform(xTr)\r
\r
    alphas = [0.01, 0.1, 1.0, 10.0, 100.0]\r
    results = []\r
\r
    for a in alphas:\r
        ridge = Ridge(alpha=a)\r
        cvScore = cross_val_score(ridge, xTrSc, yTr, cv=5, scoring='r2')\r
        results.append({'alpha': a, 'CV R² mean': cvScore.mean(), 'CV R² std': cvScore.std()})\r
\r
    pd.DataFrame(results)\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.model_selection import train_test_split, cross_val_score\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.linear_model import Ridge\r
      from codaro.curriculum.localData import loadLocalDataset\r
      import pandas as pd\r
\r
      data = loadLocalDataset("boston_housing")\r
      xData = data.drop(columns=["medv"])\r
      yData = data["medv"]\r
\r
      xTr, xTe, yTr, yTe = train_test_split(xData, yData, test_size=0.2, random_state=42)\r
      sc = StandardScaler()\r
      xTrSc = sc.fit_transform(xTr)\r
\r
      alphas = [0.01, 0.1, 1.0, 10.0, 100.0]\r
      results = []\r
\r
      for a in alphas:\r
          ridge = Ridge(alpha=a)\r
          cvScore = cross_val_score(ridge, xTrSc, yTr, cv=5, scoring='r2')\r
          results.append({'alpha': a, 'CV R² mean': cvScore.mean(), 'CV R² std': cvScore.std()})\r
\r
      pd.DataFrame(results)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
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