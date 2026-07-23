var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scikit-learn\r
  id: sklearn_07\r
  title: 소나신호분류\r
  order: 7\r
  category: sklearn\r
  difficulty: ⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - sklearn\r
  - RandomForest\r
  - 앙상블\r
  - 특성중요도\r
  - 소나\r
  seo:\r
    title: Sklearn RandomForest - 소나 신호 분류\r
    description: RandomForest로 소나 신호를 분류하고 특성 중요도를 분석합니다. 앙상블 학습과 변수 해석을 배웁니다.\r
    keywords:\r
    - sklearn\r
    - RandomForest\r
    - 앙상블\r
    - feature importance\r
    - 소나\r
intro:\r
  emoji: 📡\r
  goal: RandomForest로 소나 신호를 광물/바위로 분류하고 특성 중요도를 분석합니다.\r
  description: 소나 데이터는 60개 주파수 대역의 에너지 값으로 구성됩니다. RandomForest는 여러 결정트리를 결합한 앙상블 기법으로, 과적합에 강하고 특성 중요도를\r
    제공합니다.\r
  direction: 소나신호분류에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 소나신호분류 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 로딩 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 준비 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 스케일링 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 소나신호분류 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: matplotlib, numpy, pandas, scikit-learn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 소나신호분류 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 소나신호분류 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_data\r
  title: 1단계. 데이터 로딩\r
  structuredPrimary: true\r
  subtitle: 소나 데이터\r
  goal: 1단계. 데이터 로딩에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    소나 데이터를 로딩합니다. Codaro 로컬 데이터셋은 60개 주파수 대역 에너지와 M(광물)/R(바위) 레이블로 구성되어 있어 이후 분할, 스케일링, 모델 평가 흐름을 안정적으로 연습할 수 있습니다.\r
\r
    소나 데이터는 60개 주파수 대역(f0~f59)의 에너지 값을 담고 있습니다. label이 M이면 광물(Mine), R이면 바위(Rock)입니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.preprocessing import StandardScaler, LabelEncoder\r
    from sklearn.ensemble import RandomForestClassifier\r
    from sklearn.metrics import accuracy_score, classification_report, confusion_matrix\r
    import matplotlib.pyplot as plt\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    sonar = loadLocalDataset("sonar")\r
    sonar\r
  exercise:\r
    prompt: 1단계. 데이터 로딩 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.preprocessing import StandardScaler, LabelEncoder\r
      from sklearn.ensemble import RandomForestClassifier\r
      from sklearn.metrics import accuracy_score, classification_report, confusion_matrix\r
      import matplotlib.pyplot as plt\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      sonar = loadLocalDataset("sonar")\r
      sonar\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 데이터 로딩의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 1단계. 데이터 로딩의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step2_prep\r
  title: 2단계. 데이터 준비\r
  structuredPrimary: true\r
  subtitle: 레이블 인코딩\r
  goal: 2단계. 데이터 준비에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    문자열 레이블을 숫자로 변환하고 학습/테스트 데이터로 분할합니다.\r
\r
    LabelEncoder는 문자열 레이블을 0, 1 등 정수로 변환합니다. stratify로 클래스 비율을 유지합니다.\r
  snippet: |-\r
    X = sonar.drop("label", axis=1)\r
    y = sonar["label"]\r
\r
    le = LabelEncoder()\r
    yEnc = le.fit_transform(y)\r
\r
    xTrain, xTest, yTrain, yTest = train_test_split(\r
        X, yEnc, test_size=0.2, random_state=42, stratify=yEnc\r
    )\r
    xTrain.shape, xTest.shape\r
  exercise:\r
    prompt: 2단계. 데이터 준비 예제에서 test_size나 random_state 값을 바꾸고 분할 결과(shape)가 달라지는지 확인하세요.\r
    starterCode: |-\r
      X = sonar.drop("label", axis=1)\r
      y = sonar["label"]\r
\r
      le = LabelEncoder()\r
      yEnc = le.fit_transform(y)\r
\r
      xTrain, xTest, yTrain, yTest = train_test_split(\r
          X, yEnc, test_size=0.2, random_state=42, stratify=yEnc\r
      )\r
      xTrain.shape, xTest.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 준비에서 \`X\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 2단계. 데이터 준비 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_scale\r
  title: 3단계. 스케일링\r
  structuredPrimary: true\r
  subtitle: StandardScaler\r
  goal: 3단계. 스케일링에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 60개 특성의 스케일을 맞춥니다. RandomForest는 스케일에 덜 민감하지만 일관성을 위해 적용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    scaler = StandardScaler()\r
    xTrainSc = scaler.fit_transform(xTrain)\r
    xTestSc = scaler.transform(xTest)\r
    xTrainSc.shape\r
  exercise:\r
    prompt: 3단계. 스케일링 예제에서 \`scaler\`, \`xTrainSc\`, \`xTestSc\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      scaler = StandardScaler()\r
      xTrainSc = scaler.fit_transform(xTrain)\r
      xTestSc = scaler.transform(xTest)\r
      xTrainSc.shape\r
    hints:\r
    - 바꿀 지점은 \`scaler = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`scaler\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 3단계. 스케일링에서 \`scaler\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 스케일링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_rf\r
  title: 4단계. RandomForest 학습\r
  structuredPrimary: true\r
  subtitle: 앙상블 학습\r
  goal: 4단계. RandomForest 학습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    RandomForest는 여러 결정트리를 학습하고 투표로 예측합니다. n_estimators로 트리 개수를 지정합니다.\r
\r
    RandomForest는 Bootstrap Aggregating(Bagging) 기반입니다. 각 트리는 무작위 샘플과 특성 부분집합으로 학습하여 다양성을 확보합니다.\r
  snippet: |-\r
    rf = RandomForestClassifier(n_estimators=100, random_state=42)\r
    rf.fit(xTrainSc, yTrain)\r
    rf\r
  exercise:\r
    prompt: 4단계. RandomForest 학습 예제에서 \`rf\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      rf = RandomForestClassifier(n_estimators=100, random_state=42)\r
      rf.fit(xTrainSc, yTrain)\r
      rf\r
    hints:\r
    - 바꿀 지점은 \`rf = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`rf\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 4단계. RandomForest 학습에서 \`rf\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. RandomForest 학습 실행 뒤 \`rf\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step5_eval\r
  title: 5단계. 모델 평가\r
  structuredPrimary: true\r
  subtitle: 분류 성능\r
  goal: 5단계. 모델 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: 테스트 데이터로 정확도와 상세 지표를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    yPred = rf.predict(xTestSc)\r
    acc = accuracy_score(yTest, yPred)\r
    print(f"Accuracy: {acc:.4f}")\r
  exercise:\r
    prompt: 5단계. 모델 평가 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.\r
    starterCode: |-\r
      yPred = rf.predict(xTestSc)\r
      acc = accuracy_score(yTest, yPred)\r
      print(f"Accuracy: {acc:.4f}")\r
    hints:\r
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.\r
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.\r
  check:\r
    noError: 5단계. 모델 평가의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.\r
    resultCheck: 5단계. 모델 평가 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.\r
- id: step6_cm\r
  title: 6단계. 혼동행렬\r
  structuredPrimary: true\r
  subtitle: 오분류 분석\r
  goal: 6단계. 혼동행렬에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 혼동행렬로 광물/바위 분류 오류를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    cm = confusion_matrix(yTest, yPred)\r
    figCm, axCm = plt.subplots(figsize=(6, 5))\r
    im = axCm.imshow(cm, cmap="Blues")\r
    axCm.set_xticks([0, 1])\r
    axCm.set_yticks([0, 1])\r
    axCm.set_xticklabels(le.classes_)\r
    axCm.set_yticklabels(le.classes_)\r
    axCm.set_xlabel("Predicted")\r
    axCm.set_ylabel("Actual")\r
    axCm.set_title("Confusion Matrix")\r
    for i in range(2):\r
        for j in range(2):\r
            axCm.text(j, i, cm[i, j], ha="center", va="center", fontsize=14)\r
    plt.colorbar(im, ax=axCm)\r
    figCm\r
  exercise:\r
    prompt: 6단계. 혼동행렬 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      cm = confusion_matrix(yTest, yPred)\r
      figCm, axCm = plt.subplots(figsize=(6, 5))\r
      im = axCm.imshow(cm, cmap="Blues")\r
      axCm.set_xticks([0, 1])\r
      axCm.set_yticks([0, 1])\r
      axCm.set_xticklabels(le.classes_)\r
      axCm.set_yticklabels(le.classes_)\r
      axCm.set_xlabel("Predicted")\r
      axCm.set_ylabel("Actual")\r
      axCm.set_title("Confusion Matrix")\r
      for i in range(2):\r
          for j in range(2):\r
              axCm.text(j, i, cm[i, j], ha="center", va="center", fontsize=14)\r
      plt.colorbar(im, ax=axCm)\r
      figCm\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 혼동행렬의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 6단계. 혼동행렬 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step7_importance\r
  title: 7단계. 특성 중요도\r
  structuredPrimary: true\r
  subtitle: feature_importances_\r
  goal: 7단계. 특성 중요도에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    RandomForest는 각 특성의 중요도를 제공합니다. 어떤 주파수 대역이 분류에 중요한지 확인합니다.\r
\r
    feature_importances_는 각 특성이 불순도 감소에 기여한 정도를 나타냅니다. 값이 클수록 분류에 중요한 특성입니다.\r
  snippet: |-\r
    imp = rf.feature_importances_\r
    impDf = pd.DataFrame({"feature": X.columns, "importance": imp})\r
    impDf = impDf.sort_values("importance", ascending=False).head(20)\r
    impDf\r
  exercise:\r
    prompt: 7단계. 특성 중요도 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      imp = rf.feature_importances_\r
      impDf = pd.DataFrame({"feature": X.columns, "importance": imp})\r
      impDf = impDf.sort_values("importance", ascending=False).head(20)\r
      impDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 7단계. 특성 중요도의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 7단계. 특성 중요도의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step8_trees\r
  title: 8단계. 트리 개수 비교\r
  structuredPrimary: true\r
  subtitle: n_estimators 튜닝\r
  goal: 8단계. 트리 개수 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    트리 개수에 따른 성능 변화를 확인합니다. 트리가 많을수록 안정적이지만 속도는 느려집니다.\r
\r
    트리 개수가 늘어나면 성능이 안정화되지만, 일정 수준 이상에서는 개선폭이 줄어듭니다. 100개 정도가 일반적인 시작점입니다.\r
  snippet: |-\r
    nTrees = [10, 30, 50, 100, 150]\r
    accList = []\r
    for n in nTrees:\r
        rfTemp = RandomForestClassifier(n_estimators=n, random_state=42)\r
        rfTemp.fit(xTrainSc, yTrain)\r
        predTemp = rfTemp.predict(xTestSc)\r
        accList.append(accuracy_score(yTest, predTemp))\r
\r
    figTrees, axTrees = plt.subplots(figsize=(8, 5))\r
    axTrees.plot(nTrees, accList, "o-", color="steelblue")\r
    axTrees.set_xlabel("Number of Trees")\r
    axTrees.set_ylabel("Accuracy")\r
    axTrees.set_title("Accuracy vs Number of Trees")\r
    axTrees.set_xticks(nTrees)\r
    figTrees\r
  exercise:\r
    prompt: 8단계. 트리 개수 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      nTrees = [10, 30, 50, 100, 150]\r
      accList = []\r
      for n in nTrees:\r
          rfTemp = RandomForestClassifier(n_estimators=n, random_state=42)\r
          rfTemp.fit(xTrainSc, yTrain)\r
          predTemp = rfTemp.predict(xTestSc)\r
          accList.append(accuracy_score(yTest, predTemp))\r
\r
      figTrees, axTrees = plt.subplots(figsize=(8, 5))\r
      axTrees.plot(nTrees, accList, "o-", color="steelblue")\r
      axTrees.set_xlabel("Number of Trees")\r
      axTrees.set_ylabel("Accuracy")\r
      axTrees.set_title("Accuracy vs Number of Trees")\r
      axTrees.set_xticks(nTrees)\r
      figTrees\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 트리 개수 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. 트리 개수 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_depth\r
  title: 9단계. 트리 깊이 조절\r
  structuredPrimary: true\r
  subtitle: max_depth\r
  goal: 9단계. 트리 깊이 조절에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    max_depth로 트리 깊이를 제한하면 과적합을 방지할 수 있습니다.\r
\r
    max_depth=None이면 노드가 순수해질 때까지 분할합니다. 깊이를 제한하면 단순한 모델이 되어 과적합을 줄일 수 있습니다.\r
  snippet: |-\r
    depths = [3, 5, 7, 10, 15, None]\r
    accDepth = []\r
    for d in depths:\r
        rfD = RandomForestClassifier(n_estimators=100, max_depth=d, random_state=42)\r
        rfD.fit(xTrainSc, yTrain)\r
        predD = rfD.predict(xTestSc)\r
        accDepth.append(accuracy_score(yTest, predD))\r
\r
    depthLabels = [str(d) if d else "None" for d in depths]\r
    figDepth, axDepth = plt.subplots(figsize=(8, 5))\r
    axDepth.bar(depthLabels, accDepth, color="coral")\r
    axDepth.set_xlabel("Max Depth")\r
    axDepth.set_ylabel("Accuracy")\r
    axDepth.set_title("Accuracy vs Max Depth")\r
    figDepth\r
  exercise:\r
    prompt: 9단계. 트리 깊이 조절 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      depths = [3, 5, 7, 10, 15, None]\r
      accDepth = []\r
      for d in depths:\r
          rfD = RandomForestClassifier(n_estimators=100, max_depth=d, random_state=42)\r
          rfD.fit(xTrainSc, yTrain)\r
          predD = rfD.predict(xTestSc)\r
          accDepth.append(accuracy_score(yTest, predD))\r
\r
      depthLabels = [str(d) if d else "None" for d in depths]\r
      figDepth, axDepth = plt.subplots(figsize=(8, 5))\r
      axDepth.bar(depthLabels, accDepth, color="coral")\r
      axDepth.set_xlabel("Max Depth")\r
      axDepth.set_ylabel("Accuracy")\r
      axDepth.set_title("Accuracy vs Max Depth")\r
      figDepth\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 트리 깊이 조절의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 트리 깊이 조절 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_oob\r
  title: 10단계. OOB 스코어\r
  structuredPrimary: true\r
  subtitle: Out-of-Bag 평가\r
  goal: 10단계. OOB 스코어에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    RandomForest는 OOB(Out-of-Bag) 샘플로 검증이 가능합니다. 별도 검증 세트 없이 성능을 추정합니다.\r
\r
    부트스트랩 샘플링에서 제외된 샘플(약 37%)로 평가합니다. 교차검증 없이 모델 성능을 빠르게 추정할 수 있습니다.\r
  snippet: |-\r
    rfOob = RandomForestClassifier(n_estimators=100, oob_score=True, random_state=42)\r
    rfOob.fit(xTrainSc, yTrain)\r
    print(f"OOB Score: {rfOob.oob_score_:.4f}")\r
    print(f"Test Score: {accuracy_score(yTest, rfOob.predict(xTestSc)):.4f}")\r
  exercise:\r
    prompt: 10단계. OOB 스코어 예제에서 출력 문장 하나를 바꾸고 출력 줄 순서와 바뀐 줄을 확인하세요.\r
    starterCode: |-\r
      rfOob = RandomForestClassifier(n_estimators=100, oob_score=True, random_state=42)\r
      rfOob.fit(xTrainSc, yTrain)\r
      print(f"OOB Score: {rfOob.oob_score_:.4f}")\r
      print(f"Test Score: {accuracy_score(yTest, rfOob.predict(xTestSc)):.4f}")\r
    hints:\r
    - 바꿀 지점은 각 print()의 따옴표 안 문구나 출력 변수에서 찾으세요.\r
    - 실행 뒤 줄 수와 순서가 유지되고, 수정한 줄만 의도대로 바뀌었는지 보세요.\r
  check:\r
    noError: 10단계. OOB 스코어의 각 print() 호출이 따옴표와 괄호 조건을 만족하고 순서대로 출력되어야 합니다.\r
    resultCheck: 10단계. OOB 스코어 출력 줄 수와 순서가 유지되고, 바꾼 줄의 문구가 출력 영역에 나타나야 합니다.\r
- id: step11_compare\r
  title: 11단계. 모델 비교\r
  structuredPrimary: true\r
  subtitle: 단일트리 vs 앙상블\r
  goal: 11단계. 모델 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    단일 결정트리와 RandomForest 성능을 비교합니다. 앙상블의 효과를 확인합니다.\r
\r
    RandomForest는 여러 트리의 예측을 결합하여 단일 트리보다 안정적이고 일반화 성능이 좋습니다.\r
  snippet: |-\r
    from sklearn.tree import DecisionTreeClassifier\r
\r
    dt = DecisionTreeClassifier(random_state=42)\r
    dt.fit(xTrainSc, yTrain)\r
    dtPred = dt.predict(xTestSc)\r
    dtAcc = accuracy_score(yTest, dtPred)\r
\r
    rfAcc = accuracy_score(yTest, rf.predict(xTestSc))\r
\r
    figComp, axComp = plt.subplots(figsize=(6, 4))\r
    axComp.bar(["DecisionTree", "RandomForest"], [dtAcc, rfAcc], color=["gray", "steelblue"])\r
    axComp.set_ylabel("Accuracy")\r
    axComp.set_title("Single Tree vs Ensemble")\r
    axComp.set_ylim(0.5, 1.0)\r
    for i, v in enumerate([dtAcc, rfAcc]):\r
        axComp.text(i, v + 0.02, f"{v:.3f}", ha="center")\r
    figComp\r
  exercise:\r
    prompt: 11단계. 모델 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      from sklearn.tree import DecisionTreeClassifier\r
\r
      dt = DecisionTreeClassifier(random_state=42)\r
      dt.fit(xTrainSc, yTrain)\r
      dtPred = dt.predict(xTestSc)\r
      dtAcc = accuracy_score(yTest, dtPred)\r
\r
      rfAcc = accuracy_score(yTest, rf.predict(xTestSc))\r
\r
      figComp, axComp = plt.subplots(figsize=(6, 4))\r
      axComp.bar(["DecisionTree", "RandomForest"], [dtAcc, rfAcc], color=["gray", "steelblue"])\r
      axComp.set_ylabel("Accuracy")\r
      axComp.set_title("Single Tree vs Ensemble")\r
      axComp.set_ylim(0.5, 1.0)\r
      for i, v in enumerate([dtAcc, rfAcc]):\r
          axComp.text(i, v + 0.02, f"{v:.3f}", ha="center")\r
      figComp\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 11단계. 모델 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 11단계. 모델 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 앙상블 분류\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 개념을 활용하여 미션을 수행해봅시다. 각 미션은 독립적으로 실행 가능합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    from sklearn.datasets import load_iris\r
    from sklearn.model_selection import train_test_split\r
    from sklearn.ensemble import RandomForestClassifier\r
    from sklearn.metrics import accuracy_score\r
    import matplotlib.pyplot as plt\r
\r
    iris = load_iris()\r
    xIris = pd.DataFrame(iris.data, columns=iris.feature_names)\r
    yIris = iris.target\r
\r
    xTr, xTe, yTr, yTe = train_test_split(xIris, yIris, test_size=0.2, random_state=42)\r
    rfIris = RandomForestClassifier(n_estimators=100, random_state=42)\r
    rfIris.fit(xTr, yTr)\r
    predIris = rfIris.predict(xTe)\r
    print(f"Accuracy: {accuracy_score(yTe, predIris):.4f}")\r
\r
    impIris = pd.DataFrame({"feature": xIris.columns, "importance": rfIris.feature_importances_})\r
    impIris = impIris.sort_values("importance", ascending=True)\r
    figM1, axM1 = plt.subplots(figsize=(8, 4))\r
    axM1.barh(impIris["feature"], impIris["importance"], color="forestgreen")\r
    axM1.set_xlabel("Importance")\r
    axM1.set_title("Iris Feature Importances")\r
    figM1\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      from sklearn.datasets import load_iris\r
      from sklearn.model_selection import train_test_split\r
      from sklearn.ensemble import RandomForestClassifier\r
      from sklearn.metrics import accuracy_score\r
      import matplotlib.pyplot as plt\r
\r
      iris = load_iris()\r
      xIris = pd.DataFrame(iris.data, columns=iris.feature_names)\r
      yIris = iris.target\r
\r
      xTr, xTe, yTr, yTe = train_test_split(xIris, yIris, test_size=0.2, random_state=42)\r
      rfIris = RandomForestClassifier(n_estimators=100, random_state=42)\r
      rfIris.fit(xTr, yTr)\r
      predIris = rfIris.predict(xTe)\r
      print(f"Accuracy: {accuracy_score(yTe, predIris):.4f}")\r
\r
      impIris = pd.DataFrame({"feature": xIris.columns, "importance": rfIris.feature_importances_})\r
      impIris = impIris.sort_values("importance", ascending=True)\r
      figM1, axM1 = plt.subplots(figsize=(8, 4))\r
      axM1.barh(impIris["feature"], impIris["importance"], color="forestgreen")\r
      axM1.set_xlabel("Importance")\r
      axM1.set_title("Iris Feature Importances")\r
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