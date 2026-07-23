var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scikit-learn\r
  id: sklearn_08\r
  title: 심장병예측\r
  order: 8\r
  category: sklearn\r
  difficulty: ⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - sklearn\r
  - GradientBoosting\r
  - ROC-AUC\r
  - 앙상블\r
  - 심장병\r
  seo:\r
    title: Sklearn GradientBoosting - 심장병 예측\r
    description: GradientBoosting으로 심장병을 예측하고 ROC-AUC로 성능을 평가합니다. Boosting 앙상블과 확률 기반 평가를 배웁니다.\r
    keywords:\r
    - sklearn\r
    - GradientBoosting\r
    - ROC\r
    - AUC\r
    - 앙상블\r
    - 심장병\r
intro:\r
  emoji: ❤️\r
  goal: GradientBoosting으로 심장병을 예측하고 ROC-AUC로 모델 성능을 평가합니다.\r
  description: 심장병 데이터는 나이, 성별, 혈압, 콜레스테롤 등의 건강 지표로 구성됩니다. GradientBoosting은 이전 모델의 오차를 보완하는 방식으로 학습합니다.\r
    ROC-AUC는 임계값에 독립적인 분류 성능 지표입니다.\r
  direction: 심장병예측에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 심장병예측 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 로딩 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 탐색 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 데이터 준비 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 심장병예측 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: matplotlib, numpy, pandas, scikit-learn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 심장병예측 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 심장병예측 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_data\r
  title: 1단계. 데이터 로딩\r
  structuredPrimary: true\r
  subtitle: 심장병 데이터\r
  goal: 1단계. 데이터 로딩에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    심장병 예측 데이터를 로딩합니다. Codaro 로컬 데이터셋은 13개 특성과 심장병 유무(target)로 구성되어 있어 클래스 분포 확인, Boosting 학습, ROC-AUC 평가까지 같은 흐름으로 이어갑니다.\r
\r
    주요 특성은 age(나이), sex(성별), cp(흉통유형), trestbps(혈압), chol(콜레스테롤), fbs(공복혈당), thalach(최대심박수)입니다. target=1이 심장병 있음입니다.\r
  tips:\r
  - 주요 특성은 age(나이), sex(성별), cp(흉통유형), trestbps(혈압), chol(콜레스테롤), fbs(공복혈당), thalach(최대심박수)입니다. target=1이\r
    심장병 있음입니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.ensemble import GradientBoostingClassifier\r
    from sklearn.metrics import accuracy_score, roc_auc_score, roc_curve, classification_report\r
    import matplotlib.pyplot as plt\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    heart = loadLocalDataset("heart")\r
    heart\r
  exercise:\r
    prompt: 1단계. 데이터 로딩 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.ensemble import GradientBoostingClassifier\r
      from sklearn.metrics import accuracy_score, roc_auc_score, roc_curve, classification_report\r
      import matplotlib.pyplot as plt\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      heart = loadLocalDataset("heart")\r
      heart\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 로딩의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 로딩의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_eda\r
  title: 2단계. 데이터 탐색\r
  structuredPrimary: true\r
  subtitle: 클래스 분포\r
  goal: 2단계. 데이터 탐색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 심장병 유무 비율과 주요 특성의 분포를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figDist, axDist = plt.subplots(figsize=(6, 4))\r
    heart["target"].value_counts().plot(kind="bar", color=["steelblue", "coral"], ax=axDist)\r
    axDist.set_xticklabels(["No Disease", "Disease"], rotation=0)\r
    axDist.set_ylabel("Count")\r
    axDist.set_title("Heart Disease Distribution")\r
    figDist\r
  exercise:\r
    prompt: 2단계. 데이터 탐색 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figDist, axDist = plt.subplots(figsize=(6, 4))\r
      heart["target"].value_counts().plot(kind="bar", color=["steelblue", "coral"], ax=axDist)\r
      axDist.set_xticklabels(["No Disease", "Disease"], rotation=0)\r
      axDist.set_ylabel("Count")\r
      axDist.set_title("Heart Disease Distribution")\r
      figDist\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 탐색의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 2단계. 데이터 탐색 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step3_prep\r
  title: 3단계. 데이터 준비\r
  structuredPrimary: true\r
  subtitle: 분할 및 스케일링\r
  goal: 3단계. 데이터 준비에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 특성과 타깃을 분리하고 학습/테스트 데이터로 분할합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    X = heart.drop("target", axis=1)\r
    y = heart["target"]\r
\r
    xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)\r
\r
    scaler = StandardScaler()\r
    xTrainSc = scaler.fit_transform(xTrain)\r
    xTestSc = scaler.transform(xTest)\r
    xTrainSc.shape, xTest.shape\r
  exercise:\r
    prompt: 3단계. 데이터 준비 예제에서 test_size나 random_state 값을 바꾸고 분할·스케일 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      X = heart.drop("target", axis=1)\r
      y = heart["target"]\r
\r
      xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)\r
\r
      scaler = StandardScaler()\r
      xTrainSc = scaler.fit_transform(xTrain)\r
      xTestSc = scaler.transform(xTest)\r
      xTrainSc.shape, xTest.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 데이터 준비에서 \`X\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 데이터 준비 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_gb\r
  title: 4단계. GradientBoosting 학습\r
  structuredPrimary: true\r
  subtitle: Boosting 앙상블\r
  goal: 4단계. GradientBoosting 학습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    GradientBoosting은 이전 모델의 잔차(오차)를 학습하는 순차적 앙상블입니다. n_estimators로 트리 개수, learning_rate로 학습률을 조절합니다.\r
\r
    Boosting은 순차적으로 모델을 학습합니다. 각 단계에서 이전 모델이 틀린 샘플에 가중치를 부여하여 점진적으로 성능을 개선합니다.\r
  snippet: |-\r
    gb = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)\r
    gb.fit(xTrainSc, yTrain)\r
    gb\r
  exercise:\r
    prompt: 4단계. GradientBoosting 학습 예제에서 \`gb\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      gb = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)\r
      gb.fit(xTrainSc, yTrain)\r
      gb\r
    hints:\r
    - 바꿀 지점은 \`gb = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`gb\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 4단계. GradientBoosting 학습에서 \`gb\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. GradientBoosting 학습 실행 뒤 \`gb\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step5_eval\r
  title: 5단계. 기본 평가\r
  structuredPrimary: true\r
  subtitle: 정확도와 분류 리포트\r
  goal: 5단계. 기본 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: 테스트 데이터로 정확도와 상세 지표를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    yPred = gb.predict(xTestSc)\r
    acc = accuracy_score(yTest, yPred)\r
    print(f"Accuracy: {acc:.4f}")\r
  exercise:\r
    prompt: 5단계. 기본 평가 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.\r
    starterCode: |-\r
      yPred = gb.predict(xTestSc)\r
      acc = accuracy_score(yTest, yPred)\r
      print(f"Accuracy: {acc:.4f}")\r
    hints:\r
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.\r
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.\r
  check:\r
    noError: 5단계. 기본 평가의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.\r
    resultCheck: 5단계. 기본 평가 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.\r
- id: step6_proba\r
  title: 6단계. 확률 예측\r
  structuredPrimary: true\r
  subtitle: predict_proba\r
  goal: 6단계. 확률 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    predict_proba로 클래스별 확률을 얻습니다. 양성(심장병) 확률을 기준으로 ROC 분석을 수행합니다.\r
\r
    predict_proba는 각 클래스에 속할 확률을 반환합니다. 이진분류에서 [:,1]은 양성(1) 클래스 확률입니다.\r
  snippet: |-\r
    yProba = gb.predict_proba(xTestSc)\r
    yProbaPos = yProba[:, 1]\r
    yProba[:5]\r
  exercise:\r
    prompt: 6단계. 확률 예측 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      yProba = gb.predict_proba(xTestSc)\r
      yProbaPos = yProba[:, 1]\r
      yProba[:5]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 확률 예측에서 \`yProba\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 확률 예측 실행 뒤 \`yProba\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step7_roc\r
  title: 7단계. ROC 곡선\r
  structuredPrimary: true\r
  subtitle: TPR vs FPR\r
  goal: 7단계. ROC 곡선에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    ROC 곡선은 다양한 임계값에서 TPR(민감도)과 FPR(1-특이도)의 관계를 보여줍니다.\r
\r
    ROC 곡선이 왼쪽 상단에 가까울수록 좋은 모델입니다. 대각선은 무작위 분류기의 성능입니다.\r
  snippet: |-\r
    fpr, tpr, thresholds = roc_curve(yTest, yProbaPos)\r
\r
    figRoc, axRoc = plt.subplots(figsize=(7, 6))\r
    axRoc.plot(fpr, tpr, color="steelblue", linewidth=2, label="ROC Curve")\r
    axRoc.plot([0, 1], [0, 1], "k--", label="Random")\r
    axRoc.set_xlabel("False Positive Rate")\r
    axRoc.set_ylabel("True Positive Rate")\r
    axRoc.set_title("ROC Curve")\r
    axRoc.legend()\r
    figRoc\r
  exercise:\r
    prompt: 7단계. ROC 곡선 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fpr, tpr, thresholds = roc_curve(yTest, yProbaPos)\r
\r
      figRoc, axRoc = plt.subplots(figsize=(7, 6))\r
      axRoc.plot(fpr, tpr, color="steelblue", linewidth=2, label="ROC Curve")\r
      axRoc.plot([0, 1], [0, 1], "k--", label="Random")\r
      axRoc.set_xlabel("False Positive Rate")\r
      axRoc.set_ylabel("True Positive Rate")\r
      axRoc.set_title("ROC Curve")\r
      axRoc.legend()\r
      figRoc\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. ROC 곡선의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 7단계. ROC 곡선 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step8_auc\r
  title: 8단계. AUC 계산\r
  structuredPrimary: true\r
  subtitle: 곡선 아래 면적\r
  goal: 8단계. AUC 계산에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    AUC(Area Under Curve)는 ROC 곡선 아래 면적입니다. 1에 가까울수록 좋은 분류 성능을 의미합니다.\r
\r
    AUC 해석 기준: 0.9+ 우수, 0.8-0.9 좋음, 0.7-0.8 보통, 0.6-0.7 낮음, 0.5 무작위\r
  snippet: |-\r
    auc = roc_auc_score(yTest, yProbaPos)\r
    print(f"AUC: {auc:.4f}")\r
  exercise:\r
    prompt: 8단계. AUC 계산 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.\r
    starterCode: |-\r
      auc = roc_auc_score(yTest, yProbaPos)\r
      print(f"AUC: {auc:.4f}")\r
    hints:\r
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.\r
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.\r
  check:\r
    noError: 8단계. AUC 계산의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.\r
    resultCheck: 8단계. AUC 계산 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.\r
- id: step9_threshold\r
  title: 9단계. 임계값 조정\r
  structuredPrimary: true\r
  subtitle: 최적 임계값\r
  goal: 9단계. 임계값 조정에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: 기본 임계값 0.5 대신 최적 임계값을 찾습니다. Youden's J statistic(TPR-FPR 최대화)을 사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    jStat = tpr - fpr\r
    optIdx = np.argmax(jStat)\r
    optThresh = thresholds[optIdx]\r
    print(f"Optimal Threshold: {optThresh:.4f}")\r
    print(f"TPR: {tpr[optIdx]:.4f}, FPR: {fpr[optIdx]:.4f}")\r
  exercise:\r
    prompt: 9단계. 임계값 조정 예제에서 출력 문장 하나를 바꾸고 출력 줄 순서와 바뀐 줄을 확인하세요.\r
    starterCode: |-\r
      jStat = tpr - fpr\r
      optIdx = np.argmax(jStat)\r
      optThresh = thresholds[optIdx]\r
      print(f"Optimal Threshold: {optThresh:.4f}")\r
      print(f"TPR: {tpr[optIdx]:.4f}, FPR: {fpr[optIdx]:.4f}")\r
    hints:\r
    - 바꿀 지점은 각 print()의 따옴표 안 문구나 출력 변수에서 찾으세요.\r
    - 실행 뒤 줄 수와 순서가 유지되고, 수정한 줄만 의도대로 바뀌었는지 보세요.\r
  check:\r
    noError: 9단계. 임계값 조정의 각 print() 호출이 따옴표와 괄호 조건을 만족하고 순서대로 출력되어야 합니다.\r
    resultCheck: 9단계. 임계값 조정 출력 줄 수와 순서가 유지되고, 바꾼 줄의 문구가 출력 영역에 나타나야 합니다.\r
- id: step10_lr\r
  title: 10단계. 학습률 비교\r
  structuredPrimary: true\r
  subtitle: learning_rate\r
  goal: 10단계. 학습률 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    learning_rate는 각 트리의 기여도를 조절합니다. 낮을수록 많은 트리가 필요하지만 안정적입니다.\r
\r
    learning_rate가 너무 높으면 과적합, 너무 낮으면 학습 부족(underfitting)이 발생합니다. 일반적으로 0.01~0.1 사이 값을 사용합니다.\r
  snippet: |-\r
    lrList = [0.01, 0.05, 0.1, 0.2, 0.5]\r
    aucList = []\r
    for lr in lrList:\r
        gbTemp = GradientBoostingClassifier(n_estimators=100, learning_rate=lr, max_depth=3, random_state=42)\r
        gbTemp.fit(xTrainSc, yTrain)\r
        probaTemp = gbTemp.predict_proba(xTestSc)[:, 1]\r
        aucList.append(roc_auc_score(yTest, probaTemp))\r
\r
    figLr, axLr = plt.subplots(figsize=(8, 5))\r
    axLr.plot(lrList, aucList, "o-", color="coral")\r
    axLr.set_xlabel("Learning Rate")\r
    axLr.set_ylabel("AUC")\r
    axLr.set_title("AUC vs Learning Rate")\r
    figLr\r
  exercise:\r
    prompt: 10단계. 학습률 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      lrList = [0.01, 0.05, 0.1, 0.2, 0.5]\r
      aucList = []\r
      for lr in lrList:\r
          gbTemp = GradientBoostingClassifier(n_estimators=100, learning_rate=lr, max_depth=3, random_state=42)\r
          gbTemp.fit(xTrainSc, yTrain)\r
          probaTemp = gbTemp.predict_proba(xTestSc)[:, 1]\r
          aucList.append(roc_auc_score(yTest, probaTemp))\r
\r
      figLr, axLr = plt.subplots(figsize=(8, 5))\r
      axLr.plot(lrList, aucList, "o-", color="coral")\r
      axLr.set_xlabel("Learning Rate")\r
      axLr.set_ylabel("AUC")\r
      axLr.set_title("AUC vs Learning Rate")\r
      figLr\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 학습률 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 학습률 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step11_importance\r
  title: 11단계. 특성 중요도\r
  structuredPrimary: true\r
  subtitle: feature_importances_\r
  goal: 11단계. 특성 중요도에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    GradientBoosting도 특성 중요도를 제공합니다. 심장병 예측에 중요한 요인을 확인합니다.\r
\r
    심장병 예측에서 주로 thalach(최대심박수), cp(흉통유형), ca(주요혈관수), oldpeak(ST depression) 등이 중요합니다.\r
  snippet: |-\r
    impGb = pd.DataFrame({"feature": X.columns, "importance": gb.feature_importances_})\r
    impGb = impGb.sort_values("importance", ascending=True)\r
\r
    figImp, axImp = plt.subplots(figsize=(8, 6))\r
    axImp.barh(impGb["feature"], impGb["importance"], color="coral")\r
    axImp.set_xlabel("Importance")\r
    axImp.set_title("GradientBoosting Feature Importances")\r
    figImp\r
  exercise:\r
    prompt: 11단계. 특성 중요도 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      impGb = pd.DataFrame({"feature": X.columns, "importance": gb.feature_importances_})\r
      impGb = impGb.sort_values("importance", ascending=True)\r
\r
      figImp, axImp = plt.subplots(figsize=(8, 6))\r
      axImp.barh(impGb["feature"], impGb["importance"], color="coral")\r
      axImp.set_xlabel("Importance")\r
      axImp.set_title("GradientBoosting Feature Importances")\r
      figImp\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 특성 중요도의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 특성 중요도의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_compare\r
  title: 12단계. 앙상블 비교\r
  structuredPrimary: true\r
  subtitle: RF vs GB\r
  goal: 12단계. 앙상블 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    RandomForest(Bagging)와 GradientBoosting(Boosting)의 성능을 비교합니다.\r
\r
    Bagging(RF)은 분산을 줄이고, Boosting(GB)은 편향을 줄입니다. 데이터 특성에 따라 적합한 방법이 다릅니다.\r
  snippet: |-\r
    from sklearn.ensemble import RandomForestClassifier\r
\r
    rf = RandomForestClassifier(n_estimators=100, random_state=42)\r
    rf.fit(xTrainSc, yTrain)\r
    rfProba = rf.predict_proba(xTestSc)[:, 1]\r
    rfAuc = roc_auc_score(yTest, rfProba)\r
\r
    gbAuc = roc_auc_score(yTest, yProbaPos)\r
\r
    fprRf, tprRf, _ = roc_curve(yTest, rfProba)\r
\r
    figComp, axComp = plt.subplots(figsize=(7, 6))\r
    axComp.plot(fpr, tpr, label=f"GradientBoosting (AUC={gbAuc:.3f})", color="coral")\r
    axComp.plot(fprRf, tprRf, label=f"RandomForest (AUC={rfAuc:.3f})", color="steelblue")\r
    axComp.plot([0, 1], [0, 1], "k--")\r
    axComp.set_xlabel("False Positive Rate")\r
    axComp.set_ylabel("True Positive Rate")\r
    axComp.set_title("ROC Comparison: RF vs GB")\r
    axComp.legend()\r
    figComp\r
  exercise:\r
    prompt: 12단계. 앙상블 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.ensemble import RandomForestClassifier\r
\r
      rf = RandomForestClassifier(n_estimators=100, random_state=42)\r
      rf.fit(xTrainSc, yTrain)\r
      rfProba = rf.predict_proba(xTestSc)[:, 1]\r
      rfAuc = roc_auc_score(yTest, rfProba)\r
\r
      gbAuc = roc_auc_score(yTest, yProbaPos)\r
\r
      fprRf, tprRf, _ = roc_curve(yTest, rfProba)\r
\r
      figComp, axComp = plt.subplots(figsize=(7, 6))\r
      axComp.plot(fpr, tpr, label=f"GradientBoosting (AUC={gbAuc:.3f})", color="coral")\r
      axComp.plot(fprRf, tprRf, label=f"RandomForest (AUC={rfAuc:.3f})", color="steelblue")\r
      axComp.plot([0, 1], [0, 1], "k--")\r
      axComp.set_xlabel("False Positive Rate")\r
      axComp.set_ylabel("True Positive Rate")\r
      axComp.set_title("ROC Comparison: RF vs GB")\r
      axComp.legend()\r
      figComp\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 12단계. 앙상블 비교의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 12단계. 앙상블 비교의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: Boosting과 ROC-AUC\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 개념을 활용하여 미션을 수행해봅시다. 각 미션은 독립적으로 실행 가능합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    from sklearn.datasets import load_breast_cancer\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.ensemble import GradientBoostingClassifier\r
    from sklearn.metrics import roc_auc_score, roc_curve\r
    import matplotlib.pyplot as plt\r
\r
    cancer = load_breast_cancer()\r
    xCancer = pd.DataFrame(cancer.data, columns=cancer.feature_names)\r
    yCancer = cancer.target\r
\r
    xTrC, xTeC, yTrC, yTeC = train_test_split(xCancer, yCancer, test_size=0.2, random_state=42)\r
    scalerC = StandardScaler()\r
    xTrCsc = scalerC.fit_transform(xTrC)\r
    xTeCsc = scalerC.transform(xTeC)\r
\r
    gbC = GradientBoostingClassifier(n_estimators=100, random_state=42)\r
    gbC.fit(xTrCsc, yTrC)\r
    probaC = gbC.predict_proba(xTeCsc)[:, 1]\r
    aucC = roc_auc_score(yTeC, probaC)\r
    fprC, tprC, _ = roc_curve(yTeC, probaC)\r
\r
    figM1, axM1 = plt.subplots(figsize=(7, 6))\r
    axM1.fill_between(fprC, tprC, alpha=0.3, color="coral")\r
    axM1.plot(fprC, tprC, color="coral", linewidth=2)\r
    axM1.plot([0, 1], [0, 1], "k--")\r
    axM1.set_xlabel("False Positive Rate")\r
    axM1.set_ylabel("True Positive Rate")\r
    axM1.set_title(f"Breast Cancer ROC (AUC = {aucC:.4f})")\r
    figM1\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      from sklearn.datasets import load_breast_cancer\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.ensemble import GradientBoostingClassifier\r
      from sklearn.metrics import roc_auc_score, roc_curve\r
      import matplotlib.pyplot as plt\r
\r
      cancer = load_breast_cancer()\r
      xCancer = pd.DataFrame(cancer.data, columns=cancer.feature_names)\r
      yCancer = cancer.target\r
\r
      xTrC, xTeC, yTrC, yTeC = train_test_split(xCancer, yCancer, test_size=0.2, random_state=42)\r
      scalerC = StandardScaler()\r
      xTrCsc = scalerC.fit_transform(xTrC)\r
      xTeCsc = scalerC.transform(xTeC)\r
\r
      gbC = GradientBoostingClassifier(n_estimators=100, random_state=42)\r
      gbC.fit(xTrCsc, yTrC)\r
      probaC = gbC.predict_proba(xTeCsc)[:, 1]\r
      aucC = roc_auc_score(yTeC, probaC)\r
      fprC, tprC, _ = roc_curve(yTeC, probaC)\r
\r
      figM1, axM1 = plt.subplots(figsize=(7, 6))\r
      axM1.fill_between(fprC, tprC, alpha=0.3, color="coral")\r
      axM1.plot(fprC, tprC, color="coral", linewidth=2)\r
      axM1.plot([0, 1], [0, 1], "k--")\r
      axM1.set_xlabel("False Positive Rate")\r
      axM1.set_ylabel("True Positive Rate")\r
      axM1.set_title(f"Breast Cancer ROC (AUC = {aucC:.4f})")\r
      figM1\r
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