var e=`meta:\r
  packages:\r
  - matplotlib\r
  - pandas\r
  - scikit-learn\r
  - seaborn\r
  id: sklearn_02\r
  title: 유방암진단\r
  order: 2\r
  category: sklearn\r
  difficulty: ⭐⭐\r
  badge: 입문\r
  tags:\r
  - 이진분류\r
  - precision\r
  - recall\r
  - F1\r
  - 유방암\r
  seo:\r
    title: scikit-learn 이진 분류 - 유방암 진단 모델\r
    description: 이진 분류 모델로 유방암 양성/악성을 판별합니다. 정밀도, 재현율, F1 점수로 모델을 평가합니다.\r
    keywords:\r
    - scikit-learn\r
    - 이진분류\r
    - 유방암\r
    - precision\r
    - recall\r
intro:\r
  emoji: 🏥\r
  goal: 이진 분류 모델로 유방암 양성/악성을 판별합니다.\r
  description: 의료 진단에서 중요한 이진 분류를 배웁니다. 정밀도(precision)와 재현율(recall)의 차이를 이해하고, 상황에 맞는 평가 지표를 선택하는 방법을\r
    익힙니다. 이전 프로젝트에서 배운 train_test_split, StandardScaler, LogisticRegression을 복습합니다.\r
  direction: 유방암진단에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 유방암진단 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 불러오기 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 분할과 스케일링 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 유방암진단 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: matplotlib, pandas, scikit-learn, seaborn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 유방암진단 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 유방암진단 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 유방암 진단 모델을 만들기 위해 필요한 라이브러리를 불러옵니다. sklearn의 breast_cancer 데이터셋은 569개의 세포 샘플과 30개의 특성을\r
    제공합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from sklearn.datasets import load_breast_cancer\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.linear_model import LogisticRegression\r
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score\r
    from sklearn.metrics import confusion_matrix, classification_report\r
    import pandas as pd\r
    import matplotlib.pyplot as plt\r
    import seaborn as sns\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      from sklearn.datasets import load_breast_cancer\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.linear_model import LogisticRegression\r
      from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score\r
      from sklearn.metrics import confusion_matrix, classification_report\r
      import pandas as pd\r
      import matplotlib.pyplot as plt\r
      import seaborn as sns\r
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
  subtitle: load_breast_cancer()\r
  goal: 2단계. 데이터 불러오기에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    유방암 데이터셋을 불러옵니다. 세포핵의 반지름, 질감, 둘레, 면적 등 30개의 특성으로 양성(benign)과 악성(malignant)을 구분합니다. 타겟 0은 악성, 1은 양성입니다.\r
\r
    target=0은 malignant(악성), target=1은 benign(양성)입니다. 의료에서는 악성을 "양성(positive)"으로 취급합니다. 혼란을 방지하기 위해 0/1 숫자로 작업하는 것이 좋습니다.\r
  tips:\r
  - target=0은 malignant(악성), target=1은 benign(양성)입니다. 의료에서는 악성을 "양성(positive)"으로 취급합니다. 혼란을 방지하기 위해 0/1\r
    숫자로 작업하는 것이 좋습니다.\r
  snippet: |-\r
    cancer = load_breast_cancer()\r
    X = pd.DataFrame(cancer.data, columns=cancer.feature_names)\r
    y = cancer.target\r
    X.shape\r
  exercise:\r
    prompt: 2단계. 데이터 불러오기 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      cancer = load_breast_cancer()\r
      X = pd.DataFrame(cancer.data, columns=cancer.feature_names)\r
      y = cancer.target\r
      X.shape\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 불러오기의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 불러오기의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_split_scale\r
  title: 3단계. 분할과 스케일링\r
  structuredPrimary: true\r
  subtitle: 전처리\r
  goal: 3단계. 분할과 스케일링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 이전 프로젝트에서 배운 대로 데이터를 분할하고 스케일링합니다. 30개의 특성이 모두 다른 스케일이므로 StandardScaler가 필수입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42)\r
\r
    scaler = StandardScaler()\r
    xTrainSc = scaler.fit_transform(xTrain)\r
    xTestSc = scaler.transform(xTest)\r
    xTrainSc.shape\r
  exercise:\r
    prompt: 3단계. 분할과 스케일링 예제에서 \`xTrain\`, \`xTest\`, \`yTrain\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42)\r
\r
      scaler = StandardScaler()\r
      xTrainSc = scaler.fit_transform(xTrain)\r
      xTestSc = scaler.transform(xTest)\r
      xTrainSc.shape\r
    hints:\r
    - 바꿀 지점은 \`scaler = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`scaler\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 분할과 스케일링에서 \`scaler\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 분할과 스케일링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_train\r
  title: 4단계. 모델 학습\r
  structuredPrimary: true\r
  subtitle: LogisticRegression\r
  goal: 4단계. 모델 학습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 이진 분류에서도 LogisticRegression을 사용합니다. 출력이 0 또는 1의 두 클래스이므로 이진 분류(binary classification)라고\r
    합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    model = LogisticRegression(max_iter=1000)\r
    model.fit(xTrainSc, yTrain)\r
  exercise:\r
    prompt: 4단계. 모델 학습 예제에서 \`model\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      model = LogisticRegression(max_iter=1000)\r
      model.fit(xTrainSc, yTrain)\r
    hints:\r
    - 바꿀 지점은 \`model = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 모델 학습에서 \`model\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 모델 학습 실행 뒤 \`model\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step5_predict\r
  title: 5단계. 예측\r
  structuredPrimary: true\r
  subtitle: predict\r
  goal: 5단계. 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 테스트 데이터로 예측을 수행합니다. 의료 진단에서는 악성(0)을 놓치지 않는 것이 중요합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    yPred = model.predict(xTestSc)\r
    yPred[:10]\r
  exercise:\r
    prompt: 5단계. 예측 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      yPred = model.predict(xTestSc)\r
      yPred[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 예측에서 \`yPred\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 예측 실행 뒤 \`yPred\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step6_accuracy\r
  title: 6단계. 정확도\r
  structuredPrimary: true\r
  subtitle: accuracy_score\r
  goal: 6단계. 정확도에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 전체 정확도를 확인합니다. 하지만 의료 진단에서는 정확도만으로는 부족합니다. 악성을 양성으로 잘못 판단하면 치명적이기 때문입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    acc = accuracy_score(yTest, yPred)\r
    f"정확도: {acc:.2%}"\r
  exercise:\r
    prompt: 6단계. 정확도 예제에서 \`acc\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      acc = accuracy_score(yTest, yPred)\r
      f"정확도: {acc:.2%}"\r
    hints:\r
    - 바꿀 지점은 \`acc = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`acc\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 정확도에서 \`acc\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 정확도 실행 뒤 \`acc\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step7_precision_recall\r
  title: 7단계. 정밀도와 재현율\r
  structuredPrimary: true\r
  subtitle: precision, recall\r
  goal: 7단계. 정밀도와 재현율에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    정밀도(precision)는 "양성 예측 중 실제 양성 비율"입니다. 재현율(recall)은 "실제 양성 중 맞춘 비율"입니다. 이 데이터셋은 악성이 0, 양성이 1이므로 악성 탐지 지표를 보려면 pos_label=0을 명시해야 합니다. 의료에서는 악성(0)을 놓치지 않는 것이 중요하므로 재현율이 더 중요합니다.\r
\r
    암 진단에서 악성(0)을 놓치면(False Negative) 환자가 치료 시기를 놓칩니다. 따라서 재현율이 높아야 합니다. 반대로 스팸 필터에서는 정상 메일을 스팸으로 오분류(False Positive)하면 안 되므로 정밀도가 더 중요합니다.\r
  tips:\r
  - sklearn의 precision_score/recall_score는 기본 pos_label=1입니다. 유방암 데이터에서 악성(0)을 기준으로 보려면 pos_label=0을 넣습니다.\r
  snippet: |-\r
    prec = precision_score(yTest, yPred, pos_label=0)\r
    rec = recall_score(yTest, yPred, pos_label=0)\r
    f"정밀도: {prec:.2%}, 재현율: {rec:.2%}"\r
  exercise:\r
    prompt: 7단계. 정밀도와 재현율 예제에서 \`prec\`, \`rec\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      prec = precision_score(yTest, yPred, pos_label=0)\r
      rec = recall_score(yTest, yPred, pos_label=0)\r
      f"정밀도: {prec:.2%}, 재현율: {rec:.2%}"\r
    hints:\r
    - 바꿀 지점은 \`prec = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`prec\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 정밀도와 재현율에서 \`prec\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 정밀도와 재현율 실행 뒤 \`prec\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step8_f1\r
  title: 8단계. F1 점수\r
  structuredPrimary: true\r
  subtitle: 조화평균\r
  goal: 8단계. F1 점수에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    F1 점수는 정밀도와 재현율의 조화평균입니다. 두 지표 중 하나만 높으면 F1이 낮아집니다. 정밀도와 재현율의 균형을 평가할 때 사용합니다.\r
\r
    F1 = 2 * (precision * recall) / (precision + recall). 조화평균이므로 두 값이 비슷해야 높은 F1이 나옵니다. 예를 들어 precision=0.9, recall=0.1이면 F1은 0.18에 불과합니다.\r
  tips:\r
  - F1 = 2 * (precision * recall) / (precision + recall). 조화평균이므로 두 값이 비슷해야 높은 F1이 나옵니다. 예를 들어 precision=0.9,\r
    recall=0.1이면 F1은 0.18에 불과합니다.\r
  snippet: |-\r
    f1 = f1_score(yTest, yPred, pos_label=0)\r
    f"F1 점수: {f1:.2%}"\r
  exercise:\r
    prompt: 8단계. F1 점수 예제에서 \`f1\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      f1 = f1_score(yTest, yPred, pos_label=0)\r
      f"F1 점수: {f1:.2%}"\r
    hints:\r
    - 바꿀 지점은 \`f1 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`f1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. F1 점수에서 \`f1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. F1 점수 실행 뒤 \`f1\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step9_confusion\r
  title: 9단계. 혼동행렬 분석\r
  structuredPrimary: true\r
  subtitle: TP, TN, FP, FN\r
  goal: 9단계. 혼동행렬 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    혼동행렬을 통해 실제 클래스와 예측 클래스가 어떻게 엇갈렸는지 확인합니다. 이 데이터셋은 라벨 0이 악성, 1이 양성이므로 의료 관점에서는 실제 악성을 양성으로 예측한 칸이 가장 위험합니다.\r
\r
    confusion_matrix(yTest, yPred)는 기본 라벨 순서 [0, 1]을 씁니다. 이 표에서는 좌상=악성을 악성으로 정확히 예측, 우상=악성을 양성으로 놓침, 좌하=양성을 악성으로 오경보, 우하=양성을 양성으로 정확히 예측입니다. TP/TN 명칭은 어떤 클래스를 positive로 둘지에 따라 달라집니다.\r
  tips:\r
  - 악성을 positive로 볼 때는 라벨 0 기준으로 해석합니다. 우상 칸이 실제 악성을 양성으로 놓친 위험 사례입니다.\r
  snippet: |-\r
    cm = confusion_matrix(yTest, yPred)\r
    cmDf = pd.DataFrame(cm, index=['Actual Malignant', 'Actual Benign'], columns=['Pred Malignant', 'Pred Benign'])\r
    cmDf\r
  exercise:\r
    prompt: 9단계. 혼동행렬 분석 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      cm = confusion_matrix(yTest, yPred)\r
      cmDf = pd.DataFrame(cm, index=['Actual Malignant', 'Actual Benign'], columns=['Pred Malignant', 'Pred Benign'])\r
      cmDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 혼동행렬 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 9단계. 혼동행렬 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step10_report\r
  title: 10단계. 상세 리포트\r
  structuredPrimary: true\r
  subtitle: classification_report\r
  goal: 10단계. 상세 리포트에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: classification_report로 클래스별 상세 평가를 확인합니다. 악성(0)과 양성(1) 각각의 precision, recall, f1을 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    report = classification_report(yTest, yPred, target_names=['malignant', 'benign'])\r
    report\r
  exercise:\r
    prompt: 10단계. 상세 리포트 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      report = classification_report(yTest, yPred, target_names=['malignant', 'benign'])\r
      report\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 상세 리포트에서 \`report\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 상세 리포트 실행 뒤 \`report\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step11_proba\r
  title: 11단계. 확률 예측\r
  structuredPrimary: true\r
  subtitle: predict_proba\r
  goal: 11단계. 확률 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    predict_proba()로 각 클래스의 확률을 얻을 수 있습니다. 의료에서는 확률값을 활용하여 위험도를 세분화하거나, 임계값을 조정할 수 있습니다.\r
\r
    기본 임계값은 0.5입니다. 악성 확률이 0.5 이상이면 악성으로 예측합니다. 재현율을 높이려면 임계값을 낮춰서 더 많은 케이스를 악성으로 분류할 수 있습니다.\r
  snippet: |-\r
    proba = model.predict_proba(xTestSc)\r
    probaDf = pd.DataFrame(proba, columns=['Malignant Prob', 'Benign Prob'])\r
    probaDf.head(10)\r
  exercise:\r
    prompt: 11단계. 확률 예측 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      proba = model.predict_proba(xTestSc)\r
      probaDf = pd.DataFrame(proba, columns=['Malignant Prob', 'Benign Prob'])\r
      probaDf.head(10)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 확률 예측의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 확률 예측의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_summary\r
  title: 12단계. 정리\r
  structuredPrimary: true\r
  subtitle: 이진 분류 완료\r
  goal: 12단계. 정리에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 이번 프로젝트에서는 유방암 진단 모델을 만들어 이진 분류를 학습했습니다. 정확도뿐 아니라 정밀도, 재현율, F1 점수로 모델을 다각도로 평가하는 방법을 배웠습니다.\r
    의료처럼 오분류 비용이 다른 경우 상황에 맞는 지표를 선택해야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    summary = pd.DataFrame({\r
        'Item': ['Dataset', 'Model', 'Accuracy', 'Malignant Precision', 'Malignant Recall', 'Malignant F1'],\r
        'Value': ['Breast Cancer (569 samples)', 'LogisticRegression', f'{acc:.2%}', f'{prec:.2%}', f'{rec:.2%}', f'{f1:.2%}']\r
    })\r
    summary\r
  exercise:\r
    prompt: 12단계. 정리 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      summary = pd.DataFrame({\r
          'Item': ['Dataset', 'Model', 'Accuracy', 'Malignant Precision', 'Malignant Recall', 'Malignant F1'],\r
          'Value': ['Breast Cancer (569 samples)', 'LogisticRegression', f'{acc:.2%}', f'{prec:.2%}', f'{rec:.2%}', f'{f1:.2%}']\r
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
  subtitle: 유방암 진단 프로젝트\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    의료 AI 개발자가 되어 진단 시스템을 구축합니다. 각 미션은 데이터 로딩부터 모델 학습, 평가까지 전 과정을 독립적으로 수행합니다. 이전 프로젝트의 train_test_split, StandardScaler와 이번 프로젝트의 precision, recall, F1을 모두 활용합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    from sklearn.datasets import load_breast_cancer\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.linear_model import LogisticRegression\r
    from sklearn.metrics import accuracy_score, f1_score\r
    import pandas as pd\r
\r
    data = load_breast_cancer()\r
    xFull = pd.DataFrame(data.data, columns=data.feature_names)\r
    yFull = data.target\r
\r
    top10 = ['mean radius', 'mean texture', 'mean perimeter', 'mean area', 'mean smoothness', 'mean compactness', 'mean concavity', 'mean concave points', 'mean symmetry', 'mean fractal dimension']\r
    xTop10 = xFull[top10]\r
\r
    xTr1, xTe1, yTr1, yTe1 = train_test_split(xFull, yFull, test_size=0.2, random_state=42)\r
    xTr2, xTe2, yTr2, yTe2 = train_test_split(xTop10, yFull, test_size=0.2, random_state=42)\r
\r
    sc1 = StandardScaler()\r
    sc2 = StandardScaler()\r
\r
    model1 = LogisticRegression(max_iter=1000)\r
    model1.fit(sc1.fit_transform(xTr1), yTr1)\r
    pred1 = model1.predict(sc1.transform(xTe1))\r
\r
    model2 = LogisticRegression(max_iter=1000)\r
    model2.fit(sc2.fit_transform(xTr2), yTr2)\r
    pred2 = model2.predict(sc2.transform(xTe2))\r
\r
    pd.DataFrame({\r
        'Features': ['All 30', 'Top 10'],\r
        'Accuracy': [accuracy_score(yTe1, pred1), accuracy_score(yTe2, pred2)],\r
        'F1': [f1_score(yTe1, pred1), f1_score(yTe2, pred2)]\r
    })\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.datasets import load_breast_cancer\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.linear_model import LogisticRegression\r
      from sklearn.metrics import accuracy_score, f1_score\r
      import pandas as pd\r
\r
      data = load_breast_cancer()\r
      xFull = pd.DataFrame(data.data, columns=data.feature_names)\r
      yFull = data.target\r
\r
      top10 = ['mean radius', 'mean texture', 'mean perimeter', 'mean area', 'mean smoothness', 'mean compactness', 'mean concavity', 'mean concave points', 'mean symmetry', 'mean fractal dimension']\r
      xTop10 = xFull[top10]\r
\r
      xTr1, xTe1, yTr1, yTe1 = train_test_split(xFull, yFull, test_size=0.2, random_state=42)\r
      xTr2, xTe2, yTr2, yTe2 = train_test_split(xTop10, yFull, test_size=0.2, random_state=42)\r
\r
      sc1 = StandardScaler()\r
      sc2 = StandardScaler()\r
\r
      model1 = LogisticRegression(max_iter=1000)\r
      model1.fit(sc1.fit_transform(xTr1), yTr1)\r
      pred1 = model1.predict(sc1.transform(xTe1))\r
\r
      model2 = LogisticRegression(max_iter=1000)\r
      model2.fit(sc2.fit_transform(xTr2), yTr2)\r
      pred2 = model2.predict(sc2.transform(xTe2))\r
\r
      pd.DataFrame({\r
          'Features': ['All 30', 'Top 10'],\r
          'Accuracy': [accuracy_score(yTe1, pred1), accuracy_score(yTe2, pred2)],\r
          'F1': [f1_score(yTe1, pred1), f1_score(yTe2, pred2)]\r
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