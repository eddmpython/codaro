var e=`meta:\r
  packages:\r
  - matplotlib\r
  - pandas\r
  - scikit-learn\r
  - seaborn\r
  id: sklearn_01\r
  title: 와인품질분류\r
  order: 1\r
  category: sklearn\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - 분류\r
  - train_test_split\r
  - LogisticRegression\r
  - 다중분류\r
  - 와인\r
  seo:\r
    title: scikit-learn 분류 입문 - 와인 품종 분류하기\r
    description: 첫 ML 모델을 만들어봅니다. train_test_split으로 데이터를 나누고 LogisticRegression으로 와인 품종을 분류합니다.\r
    keywords:\r
    - scikit-learn\r
    - 분류\r
    - LogisticRegression\r
    - 와인\r
    - 머신러닝\r
intro:\r
  emoji: 🍷\r
  goal: 첫 머신러닝 모델을 만들어 와인 품종을 분류합니다.\r
  description: scikit-learn의 기본 워크플로우를 배웁니다. train_test_split으로 데이터를 분할하고, StandardScaler로 전처리하고, LogisticRegression으로\r
    분류 모델을 학습합니다. 정확도와 혼동행렬로 모델 성능을 평가합니다.\r
  direction: 와인품질분류에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 와인품질분류 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. scikit-learn import 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 불러오기 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 데이터 탐색 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 와인품질분류 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: matplotlib, pandas, scikit-learn, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 와인품질분류 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 와인품질분류 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_package_ready\r
  title: 1단계. scikit-learn import 확인\r
  structuredPrimary: true\r
  subtitle: sklearn 모듈\r
  goal: 1단계. scikit-learn import 확인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    scikit-learn은 Python 머신러닝용 외부 패키지입니다. Codaro 로컬 환경에서는 YAML의 meta.packages와 라이브러리 패널을 기준으로 필요한 패키지를 uv로 준비합니다.\r
\r
    이 셀은 설치 명령을 실행하는 단계가 아니라 현재 Python 환경에서 sklearn 모듈을 import할 수 있는지 확인하는 단계입니다.\r
  tips:\r
  - import sklearn은 설치 명령이 아니라 준비된 패키지를 코드에서 불러오는 확인 단계입니다.\r
  snippet: import sklearn\r
  exercise:\r
    prompt: 1단계. scikit-learn import 확인 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: import sklearn\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. scikit-learn import 확인의 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. scikit-learn import 확인 다음 셀에서 import한 이름을 사용할 수 있어야 합니다.\r
- id: step2_load\r
  title: 2단계. 데이터 불러오기\r
  structuredPrimary: true\r
  subtitle: load_wine()\r
  goal: 2단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    sklearn.datasets에는 다양한 내장 데이터셋이 있습니다. load_wine()은 이탈리아 한 지역에서 재배한 세 가지 품종의 와인 178개 샘플을 제공합니다. 13가지 화학 성분(알코올, 산도, 마그네슘 등) 측정값이 특성입니다.\r
\r
    load_wine()은 Bunch 객체를 반환합니다. data는 특성(X), target은 레이블(y), feature_names는 컬럼명, target_names는 클래스명입니다.\r
  snippet: |-\r
    from sklearn.datasets import load_wine\r
    import pandas as pd\r
\r
    wine = load_wine()\r
    X = pd.DataFrame(wine.data, columns=wine.feature_names)\r
    y = wine.target\r
    X.shape\r
  exercise:\r
    prompt: 2단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.datasets import load_wine\r
      import pandas as pd\r
\r
      wine = load_wine()\r
      X = pd.DataFrame(wine.data, columns=wine.feature_names)\r
      y = wine.target\r
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
  subtitle: 특성 확인\r
  goal: 3단계. 데이터 탐색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
  explanation: 데이터의 구조와 분포를 확인합니다. 13개의 특성과 3개의 클래스(0, 1, 2)가 있습니다. 각 특성의 스케일이 다르므로 전처리가 필요합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: X.head()\r
  exercise:\r
    prompt: 3단계. 데이터 탐색 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: X.head()\r
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
  explanation: |-\r
    머신러닝의 핵심 원칙은 "학습에 사용하지 않은 데이터로 평가"입니다. train_test_split으로 데이터를 학습용(train)과 테스트용(test)으로 나눕니다. 보통 80:20 또는 70:30 비율로 분할합니다.\r
\r
    test_size=0.2는 20%를 테스트용으로 분리합니다. random_state는 재현성을 위한 시드값으로, 같은 값이면 항상 같은 분할 결과가 나옵니다. 시드를 고정하지 않으면 실행할 때마다 다른 결과가 나옵니다.\r
  tips:\r
  - test_size=0.2는 20%를 테스트용으로 분리합니다. random_state는 재현성을 위한 시드값으로, 같은 값이면 항상 같은 분할 결과가 나옵니다. 시드를 고정하지\r
    않으면 실행할 때마다 다른 결과가 나옵니다.\r
  snippet: |-\r
    from sklearn.model_selection import train_test_split\r
\r
    xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42)\r
    xTrain.shape, xTest.shape\r
  exercise:\r
    prompt: 4단계. 데이터 분할 예제에서 \`xTrain\`, \`xTest\`, \`yTrain\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.model_selection import train_test_split\r
\r
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
  explanation: |-\r
    특성들의 스케일이 다르면 일부 알고리즘이 제대로 작동하지 않습니다. 예를 들어 알코올 도수(11~14)와 프롤린 함량(278~1680)을 함께 사용하면 프롤린이 모델을 지배합니다. StandardScaler는 각 특성을 평균 0, 표준편차 1로 변환합니다.\r
\r
    fit_transform()은 학습 데이터로 평균/표준편차를 계산(fit)하고 변환(transform)합니다. 테스트 데이터는 transform()만 사용합니다. 테스트 데이터로 fit하면 데이터 누수(data leakage)가 발생합니다.\r
  tips:\r
  - fit_transform()은 학습 데이터로 평균/표준편차를 계산(fit)하고 변환(transform)합니다. 테스트 데이터는 transform()만 사용합니다. 테스트 데이터로\r
    fit하면 데이터 누수(data leakage)가 발생합니다.\r
  snippet: |-\r
    from sklearn.preprocessing import StandardScaler\r
\r
    scaler = StandardScaler()\r
    xTrainSc = scaler.fit_transform(xTrain)\r
    xTestSc = scaler.transform(xTest)\r
    xTrainSc[:3]\r
  exercise:\r
    prompt: 5단계. 스케일링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.preprocessing import StandardScaler\r
\r
      scaler = StandardScaler()\r
      xTrainSc = scaler.fit_transform(xTrain)\r
      xTestSc = scaler.transform(xTest)\r
      xTrainSc[:3]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 스케일링에서 \`scaler\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 스케일링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_model\r
  title: 6단계. 모델 학습\r
  structuredPrimary: true\r
  subtitle: LogisticRegression\r
  goal: 6단계. 모델 학습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    LogisticRegression은 분류 문제의 기본 알고리즘입니다. 이름에 "회귀"가 있지만 실제로는 분류에 사용합니다. 각 클래스에 속할 확률을 계산하고, 가장 높은 확률의 클래스를 예측합니다.\r
\r
    fit(X, y)으로 모델을 학습합니다. max_iter=1000은 최대 반복 횟수입니다. 수렴하지 않으면 경고가 나타나므로 값을 늘려주세요. sklearn의 모든 모델은 fit() 메서드로 학습합니다.\r
  tips:\r
  - fit(X, y)으로 모델을 학습합니다. max_iter=1000은 최대 반복 횟수입니다. 수렴하지 않으면 경고가 나타나므로 값을 늘려주세요. sklearn의 모든 모델은 fit()\r
    메서드로 학습합니다.\r
  snippet: |-\r
    from sklearn.linear_model import LogisticRegression\r
\r
    model = LogisticRegression(max_iter=1000)\r
    model.fit(xTrainSc, yTrain)\r
  exercise:\r
    prompt: 6단계. 모델 학습 예제에서 \`model\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.linear_model import LogisticRegression\r
\r
      model = LogisticRegression(max_iter=1000)\r
      model.fit(xTrainSc, yTrain)\r
    hints:\r
    - 바꿀 지점은 \`model = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 모델 학습에서 \`model\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 모델 학습 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step7_predict\r
  title: 7단계. 예측\r
  structuredPrimary: true\r
  subtitle: predict()\r
  goal: 7단계. 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    학습된 모델로 테스트 데이터의 품종을 예측합니다. predict()는 클래스 레이블을, predict_proba()는 각 클래스의 확률을 반환합니다.\r
\r
    predict_proba()는 각 클래스에 속할 확률을 반환합니다. 3개 클래스이므로 각 샘플마다 3개의 확률값이 나오고, 합은 1입니다. 가장 높은 확률의 클래스가 예측 결과입니다.\r
  snippet: |-\r
    yPred = model.predict(xTestSc)\r
    yPred\r
  exercise:\r
    prompt: 7단계. 예측 예제에서 \`yPred\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      yPred = model.predict(xTestSc)\r
      yPred\r
    hints:\r
    - 바꿀 지점은 \`yPred = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`yPred\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 예측에서 \`yPred\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 예측 실행 뒤 \`yPred\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step8_accuracy\r
  title: 8단계. 정확도 평가\r
  structuredPrimary: true\r
  subtitle: accuracy_score\r
  goal: 8단계. 정확도 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    정확도(accuracy)는 전체 샘플 중 올바르게 예측한 비율입니다. 가장 직관적인 평가 지표이지만, 클래스 불균형이 있으면 오해를 줄 수 있습니다.\r
\r
    accuracy_score(실제값, 예측값) 순서입니다. 0.97은 97%를 의미합니다. 모델이 테스트 데이터의 97%를 올바르게 분류했습니다.\r
  snippet: |-\r
    from sklearn.metrics import accuracy_score\r
\r
    acc = accuracy_score(yTest, yPred)\r
    f"정확도: {acc:.2%}"\r
  exercise:\r
    prompt: 8단계. 정확도 평가 예제에서 \`acc\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.metrics import accuracy_score\r
\r
      acc = accuracy_score(yTest, yPred)\r
      f"정확도: {acc:.2%}"\r
    hints:\r
    - 바꿀 지점은 \`acc = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`acc\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 정확도 평가에서 \`acc\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 정확도 평가 실행 뒤 \`acc\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step9_confusion\r
  title: 9단계. 혼동행렬\r
  structuredPrimary: true\r
  subtitle: confusion_matrix\r
  goal: 9단계. 혼동행렬에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    혼동행렬(confusion matrix)은 실제 클래스와 예측 클래스의 교차표입니다. 대각선은 올바른 예측, 비대각선은 오분류를 나타냅니다. 어떤 클래스에서 오류가 많은지 파악할 수 있습니다.\r
\r
    혼동행렬의 행은 실제 클래스, 열은 예측 클래스입니다. 대각선 값이 높을수록 좋습니다. 예를 들어 class_0 행에서 class_1 열에 값이 있다면, 실제 class_0을 class_1로 잘못 예측한 것입니다.\r
  tips:\r
  - 혼동행렬의 행은 실제 클래스, 열은 예측 클래스입니다. 대각선 값이 높을수록 좋습니다. 예를 들어 class_0 행에서 class_1 열에 값이 있다면, 실제 class_0을\r
    class_1로 잘못 예측한 것입니다.\r
  snippet: |-\r
    from sklearn.metrics import confusion_matrix\r
\r
    cm = confusion_matrix(yTest, yPred)\r
    pd.DataFrame(cm, index=wine.target_names, columns=wine.target_names)\r
  exercise:\r
    prompt: 9단계. 혼동행렬 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.metrics import confusion_matrix\r
\r
      cm = confusion_matrix(yTest, yPred)\r
      pd.DataFrame(cm, index=wine.target_names, columns=wine.target_names)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 혼동행렬의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 9단계. 혼동행렬의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step10_report\r
  title: 10단계. 상세 평가\r
  structuredPrimary: true\r
  subtitle: classification_report\r
  goal: 10단계. 상세 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    classification_report는 클래스별 정밀도(precision), 재현율(recall), F1 점수를 제공합니다. 정밀도는 "양성 예측 중 실제 양성 비율", 재현율은 "실제 양성 중 맞춘 비율"입니다.\r
\r
    precision(정밀도)은 예측이 얼마나 정확한지, recall(재현율)은 실제 양성을 얼마나 찾아냈는지를 나타냅니다. F1-score는 둘의 조화평균입니다. support는 각 클래스의 샘플 수입니다.\r
  tips:\r
  - precision(정밀도)은 예측이 얼마나 정확한지, recall(재현율)은 실제 양성을 얼마나 찾아냈는지를 나타냅니다. F1-score는 둘의 조화평균입니다. support는\r
    각 클래스의 샘플 수입니다.\r
  snippet: |-\r
    from sklearn.metrics import classification_report\r
\r
    report = classification_report(yTest, yPred, target_names=wine.target_names)\r
    report\r
  exercise:\r
    prompt: 10단계. 상세 평가 예제에서 \`report\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.metrics import classification_report\r
\r
      report = classification_report(yTest, yPred, target_names=wine.target_names)\r
      report\r
    hints:\r
    - 바꿀 지점은 \`report = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`report\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 상세 평가에서 \`report\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 상세 평가 실행 뒤 \`report\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step11_visualize\r
  title: 11단계. 시각화\r
  structuredPrimary: true\r
  subtitle: 혼동행렬 히트맵\r
  goal: 11단계. 시각화에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 혼동행렬을 히트맵으로 시각화하면 오분류 패턴을 더 직관적으로 파악할 수 있습니다. seaborn의 heatmap을 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import matplotlib.pyplot as plt\r
    import seaborn as sns\r
\r
    fig, ax = plt.subplots(figsize=(8, 6))\r
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=wine.target_names, yticklabels=wine.target_names, ax=ax)\r
    ax.set_xlabel('Predicted')\r
    ax.set_ylabel('Actual')\r
    ax.set_title('Confusion Matrix')\r
    fig\r
  exercise:\r
    prompt: 11단계. 시각화 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      import matplotlib.pyplot as plt\r
      import seaborn as sns\r
\r
      fig, ax = plt.subplots(figsize=(8, 6))\r
      sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=wine.target_names, yticklabels=wine.target_names, ax=ax)\r
      ax.set_xlabel('Predicted')\r
      ax.set_ylabel('Actual')\r
      ax.set_title('Confusion Matrix')\r
      fig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 시각화의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 11단계. 시각화 실행 결과가 출력과 상태 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: step12_summary\r
  title: 12단계. 전체 워크플로우\r
  structuredPrimary: true\r
  subtitle: 정리\r
  goal: 12단계. 전체 워크플로우에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: sklearn의 기본 워크플로우를 정리합니다. 데이터 분할 → 전처리 → 모델 학습 → 예측 → 평가 순서입니다. 이 패턴은 모든 sklearn 모델에 동일하게\r
    적용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    resultDf = pd.DataFrame({\r
        'Step': ['Data Split', 'Scaling', 'Model', 'Accuracy'],\r
        'Value': [f'{len(xTrain)} train, {len(xTest)} test', 'StandardScaler', 'LogisticRegression', f'{acc:.2%}']\r
    })\r
    resultDf\r
  exercise:\r
    prompt: 12단계. 전체 워크플로우 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      resultDf = pd.DataFrame({\r
          'Step': ['Data Split', 'Scaling', 'Model', 'Accuracy'],\r
          'Value': [f'{len(xTrain)} train, {len(xTest)} test', 'StandardScaler', 'LogisticRegression', f'{acc:.2%}']\r
      })\r
      resultDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 전체 워크플로우의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 전체 워크플로우의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 와인 분류 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    품질 관리 담당자가 되어 와인 품종 분류 시스템을 구축합니다. 각 미션은 데이터 로딩부터 모델 학습, 평가까지 전 과정을 독립적으로 수행합니다. train_test_split, StandardScaler, LogisticRegression, accuracy_score, confusion_matrix를 모두 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sklearn.datasets import load_wine\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.linear_model import LogisticRegression\r
    from sklearn.metrics import accuracy_score\r
    import pandas as pd\r
\r
    wineData = load_wine()\r
    xData = pd.DataFrame(wineData.data, columns=wineData.feature_names)\r
    yData = wineData.target\r
\r
    xTr, xTe, yTr, yTe = train_test_split(xData, yData, test_size=0.2, random_state=42)\r
\r
    modelRaw = LogisticRegression(max_iter=1000)\r
    modelRaw.fit(xTr, yTr)\r
    accRaw = accuracy_score(yTe, modelRaw.predict(xTe))\r
\r
    sc = StandardScaler()\r
    xTrSc = sc.fit_transform(xTr)\r
    xTeSc = sc.transform(xTe)\r
\r
    modelSc = LogisticRegression(max_iter=1000)\r
    modelSc.fit(xTrSc, yTr)\r
    accSc = accuracy_score(yTe, modelSc.predict(xTeSc))\r
\r
    pd.DataFrame({'Model': ['Raw', 'Scaled'], 'Accuracy': [accRaw, accSc]})\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.datasets import load_wine\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.linear_model import LogisticRegression\r
      from sklearn.metrics import accuracy_score\r
      import pandas as pd\r
\r
      wineData = load_wine()\r
      xData = pd.DataFrame(wineData.data, columns=wineData.feature_names)\r
      yData = wineData.target\r
\r
      xTr, xTe, yTr, yTe = train_test_split(xData, yData, test_size=0.2, random_state=42)\r
\r
      modelRaw = LogisticRegression(max_iter=1000)\r
      modelRaw.fit(xTr, yTr)\r
      accRaw = accuracy_score(yTe, modelRaw.predict(xTe))\r
\r
      sc = StandardScaler()\r
      xTrSc = sc.fit_transform(xTr)\r
      xTeSc = sc.transform(xTe)\r
\r
      modelSc = LogisticRegression(max_iter=1000)\r
      modelSc.fit(xTrSc, yTr)\r
      accSc = accuracy_score(yTe, modelSc.predict(xTeSc))\r
\r
      pd.DataFrame({'Model': ['Raw', 'Scaled'], 'Accuracy': [accRaw, accSc]})\r
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