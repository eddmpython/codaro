var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scikit-learn\r
  id: sklearn_09\r
  title: 신호탐지최적화\r
  order: 9\r
  category: sklearn\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 고급\r
  tags:\r
  - sklearn\r
  - GridSearchCV\r
  - 하이퍼파라미터\r
  - 교차검증\r
  - 최적화\r
  seo:\r
    title: Sklearn GridSearchCV - 하이퍼파라미터 최적화\r
    description: GridSearchCV로 하이퍼파라미터를 체계적으로 탐색합니다. 교차검증 기반 모델 최적화를 배웁니다.\r
    keywords:\r
    - sklearn\r
    - GridSearchCV\r
    - hyperparameter\r
    - cross validation\r
    - tuning\r
intro:\r
  emoji: 🎯\r
  goal: GridSearchCV로 하이퍼파라미터를 체계적으로 탐색하고 최적의 모델을 찾습니다.\r
  description: 하이퍼파라미터는 학습 전에 설정하는 값으로 모델 성능에 큰 영향을 줍니다. GridSearchCV는 지정한 파라미터 조합을 모두 시도하여 최적의 조합을 찾습니다.\r
    교차검증으로 과적합을 방지합니다.\r
  direction: 신호탐지최적화에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 신호탐지최적화 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 로딩 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 준비 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 기본 모델 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 신호탐지최적화 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: matplotlib, numpy, pandas, scikit-learn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 신호탐지최적화 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 신호탐지최적화 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_data\r
  title: 1단계. 데이터 로딩\r
  structuredPrimary: true\r
  subtitle: 와인 데이터\r
  goal: 1단계. 데이터 로딩에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    와인 품질 데이터로 하이퍼파라미터 튜닝을 실습합니다. 3개 클래스 분류 문제입니다.\r
\r
    와인 데이터는 13개 화학 성분으로 3종류 와인을 분류합니다. 하이퍼파라미터 튜닝 실습에 적합한 크기입니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    from sklearn.datasets import load_wine\r
    from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.svm import SVC\r
    from sklearn.ensemble import RandomForestClassifier\r
    from sklearn.metrics import accuracy_score, classification_report\r
    import matplotlib.pyplot as plt\r
\r
    wine = load_wine()\r
    X = pd.DataFrame(wine.data, columns=wine.feature_names)\r
    y = wine.target\r
    X.shape, np.unique(y)\r
  exercise:\r
    prompt: 1단계. 데이터 로딩 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      from sklearn.datasets import load_wine\r
      from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.svm import SVC\r
      from sklearn.ensemble import RandomForestClassifier\r
      from sklearn.metrics import accuracy_score, classification_report\r
      import matplotlib.pyplot as plt\r
\r
      wine = load_wine()\r
      X = pd.DataFrame(wine.data, columns=wine.feature_names)\r
      y = wine.target\r
      X.shape, np.unique(y)\r
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
  subtitle: 분할 및 스케일링\r
  goal: 2단계. 데이터 준비에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 학습/테스트 분할 후 스케일링합니다. SVM은 스케일에 민감하므로 반드시 스케일링합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)\r
\r
    scaler = StandardScaler()\r
    xTrainSc = scaler.fit_transform(xTrain)\r
    xTestSc = scaler.transform(xTest)\r
    xTrainSc.shape, xTest.shape\r
  exercise:\r
    prompt: 2단계. 데이터 준비 예제에서 test_size나 random_state 값을 바꾸고 분할·스케일 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)\r
\r
      scaler = StandardScaler()\r
      xTrainSc = scaler.fit_transform(xTrain)\r
      xTestSc = scaler.transform(xTest)\r
      xTrainSc.shape, xTest.shape\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 준비에서 \`xTrain\`, \`xTest\`, \`yTrain\` 할당 개수와 값 순서가 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 준비 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step3_baseline\r
  title: 3단계. 기본 모델\r
  structuredPrimary: true\r
  subtitle: 기본 SVM\r
  goal: 3단계. 기본 모델에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    기본 파라미터로 SVM을 학습하여 기준선 성능을 확인합니다.\r
\r
    SVM 기본값은 C=1.0, kernel='rbf', gamma='scale'입니다. 튜닝으로 더 나은 성능을 얻을 수 있습니다.\r
  snippet: |-\r
    svcBase = SVC(random_state=42)\r
    svcBase.fit(xTrainSc, yTrain)\r
    yPredBase = svcBase.predict(xTestSc)\r
    accBase = accuracy_score(yTest, yPredBase)\r
    print(f"Baseline Accuracy: {accBase:.4f}")\r
  exercise:\r
    prompt: 3단계. 기본 모델 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.\r
    starterCode: |-\r
      svcBase = SVC(random_state=42)\r
      svcBase.fit(xTrainSc, yTrain)\r
      yPredBase = svcBase.predict(xTestSc)\r
      accBase = accuracy_score(yTest, yPredBase)\r
      print(f"Baseline Accuracy: {accBase:.4f}")\r
    hints:\r
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.\r
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.\r
  check:\r
    noError: 3단계. 기본 모델의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.\r
    resultCheck: 3단계. 기본 모델 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.\r
- id: step4_params\r
  title: 4단계. 파라미터 그리드\r
  structuredPrimary: true\r
  subtitle: 탐색 범위\r
  goal: 4단계. 파라미터 그리드에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    탐색할 파라미터와 값 범위를 딕셔너리로 정의합니다. C는 규제 강도, gamma는 RBF 커널 폭입니다.\r
\r
    C가 클수록 오분류 페널티가 커집니다. gamma가 클수록 결정 경계가 복잡해집니다. 둘 다 너무 크면 과적합됩니다.\r
  snippet: |-\r
    paramGrid = {\r
        "C": [0.1, 1, 10, 100],\r
        "gamma": [0.001, 0.01, 0.1, 1],\r
        "kernel": ["rbf", "linear"]\r
    }\r
    totalComb = len(paramGrid["C"]) * len(paramGrid["gamma"]) * len(paramGrid["kernel"])\r
    print(f"Total combinations: {totalComb}")\r
  exercise:\r
    prompt: 4단계. 파라미터 그리드 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.\r
    starterCode: |-\r
      paramGrid = {\r
          "C": [0.1, 1, 10, 100],\r
          "gamma": [0.001, 0.01, 0.1, 1],\r
          "kernel": ["rbf", "linear"]\r
      }\r
      totalComb = len(paramGrid["C"]) * len(paramGrid["gamma"]) * len(paramGrid["kernel"])\r
      print(f"Total combinations: {totalComb}")\r
    hints:\r
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.\r
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 파라미터 그리드의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.\r
    resultCheck: 4단계. 파라미터 그리드 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.\r
- id: step5_gridsearch\r
  title: 5단계. GridSearchCV 실행\r
  structuredPrimary: true\r
  subtitle: 체계적 탐색\r
  goal: 5단계. GridSearchCV 실행에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    GridSearchCV로 모든 파라미터 조합을 교차검증합니다. cv=5로 5-폴드 교차검증을 수행합니다.\r
\r
    GridSearchCV는 모든 조합을 시도하므로 파라미터가 많으면 시간이 오래 걸립니다. 범위를 좁히거나 RandomizedSearchCV를 고려하세요.\r
  snippet: |-\r
    gridSearch = GridSearchCV(SVC(random_state=42), paramGrid, cv=5, scoring="accuracy", return_train_score=True)\r
    gridSearch.fit(xTrainSc, yTrain)\r
    gridSearch\r
  exercise:\r
    prompt: 5단계. GridSearchCV 실행 예제에서 \`gridSearch\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      gridSearch = GridSearchCV(SVC(random_state=42), paramGrid, cv=5, scoring="accuracy", return_train_score=True)\r
      gridSearch.fit(xTrainSc, yTrain)\r
      gridSearch\r
    hints:\r
    - 바꿀 지점은 \`gridSearch = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`gridSearch\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    noError: 5단계. GridSearchCV 실행에서 \`gridSearch\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. GridSearchCV 실행 실행 뒤 \`gridSearch\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step6_results\r
  title: 6단계. 결과 분석\r
  structuredPrimary: true\r
  subtitle: cv_results_\r
  goal: 6단계. 결과 분석에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: cv_results_에서 모든 조합의 성능을 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    resultsDf = pd.DataFrame(gridSearch.cv_results_)\r
    cols = ["param_C", "param_gamma", "param_kernel", "mean_test_score", "std_test_score", "rank_test_score"]\r
    resultsDf[cols].sort_values("rank_test_score").head(10)\r
  exercise:\r
    prompt: 6단계. 결과 분석 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      resultsDf = pd.DataFrame(gridSearch.cv_results_)\r
      cols = ["param_C", "param_gamma", "param_kernel", "mean_test_score", "std_test_score", "rank_test_score"]\r
      resultsDf[cols].sort_values("rank_test_score").head(10)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 6단계. 결과 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 6단계. 결과 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step7_best\r
  title: 7단계. 최적 모델 평가\r
  structuredPrimary: true\r
  subtitle: best_estimator_\r
  goal: 7단계. 최적 모델 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: GridSearchCV는 최적 파라미터로 전체 학습 데이터에 다시 학습한 모델을 best_estimator_에 저장합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    bestModel = gridSearch.best_estimator_\r
    yPredBest = bestModel.predict(xTestSc)\r
    accBest = accuracy_score(yTest, yPredBest)\r
    print(f"Baseline Accuracy: {accBase:.4f}")\r
    print(f"Tuned Accuracy: {accBest:.4f}")\r
    print(f"Improvement: {(accBest - accBase) * 100:.2f}%")\r
  exercise:\r
    prompt: 7단계. 최적 모델 평가 예제에서 출력 문장 하나를 바꾸고 출력 줄 순서와 바뀐 줄을 확인하세요.\r
    starterCode: |-\r
      bestModel = gridSearch.best_estimator_\r
      yPredBest = bestModel.predict(xTestSc)\r
      accBest = accuracy_score(yTest, yPredBest)\r
      print(f"Baseline Accuracy: {accBase:.4f}")\r
      print(f"Tuned Accuracy: {accBest:.4f}")\r
      print(f"Improvement: {(accBest - accBase) * 100:.2f}%")\r
    hints:\r
    - 바꿀 지점은 각 print()의 따옴표 안 문구나 출력 변수에서 찾으세요.\r
    - 실행 뒤 줄 수와 순서가 유지되고, 수정한 줄만 의도대로 바뀌었는지 보세요.\r
  check:\r
    noError: 7단계. 최적 모델 평가의 각 print() 호출이 따옴표와 괄호 조건을 만족하고 순서대로 출력되어야 합니다.\r
    resultCheck: 7단계. 최적 모델 평가 출력 줄 수와 순서가 유지되고, 바꾼 줄의 문구가 출력 영역에 나타나야 합니다.\r
- id: step8_heatmap\r
  title: 8단계. 파라미터 히트맵\r
  structuredPrimary: true\r
  subtitle: C vs gamma\r
  goal: 8단계. 파라미터 히트맵에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: RBF 커널에서 C와 gamma 조합별 성능을 히트맵으로 시각화합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    rbfResults = resultsDf[resultsDf["param_kernel"] == "rbf"].copy()\r
    pivot = rbfResults.pivot_table(values="mean_test_score", index="param_gamma", columns="param_C")\r
\r
    figHeat, axHeat = plt.subplots(figsize=(8, 6))\r
    im = axHeat.imshow(pivot.values, cmap="YlGn", aspect="auto")\r
    axHeat.set_xticks(range(len(pivot.columns)))\r
    axHeat.set_yticks(range(len(pivot.index)))\r
    axHeat.set_xticklabels(pivot.columns)\r
    axHeat.set_yticklabels(pivot.index)\r
    axHeat.set_xlabel("C")\r
    axHeat.set_ylabel("gamma")\r
    axHeat.set_title("CV Accuracy: C vs gamma (RBF kernel)")\r
    for i in range(len(pivot.index)):\r
        for j in range(len(pivot.columns)):\r
            axHeat.text(j, i, f"{pivot.values[i, j]:.3f}", ha="center", va="center")\r
    plt.colorbar(im, ax=axHeat)\r
    figHeat\r
  exercise:\r
    prompt: 8단계. 파라미터 히트맵 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      rbfResults = resultsDf[resultsDf["param_kernel"] == "rbf"].copy()\r
      pivot = rbfResults.pivot_table(values="mean_test_score", index="param_gamma", columns="param_C")\r
\r
      figHeat, axHeat = plt.subplots(figsize=(8, 6))\r
      im = axHeat.imshow(pivot.values, cmap="YlGn", aspect="auto")\r
      axHeat.set_xticks(range(len(pivot.columns)))\r
      axHeat.set_yticks(range(len(pivot.index)))\r
      axHeat.set_xticklabels(pivot.columns)\r
      axHeat.set_yticklabels(pivot.index)\r
      axHeat.set_xlabel("C")\r
      axHeat.set_ylabel("gamma")\r
      axHeat.set_title("CV Accuracy: C vs gamma (RBF kernel)")\r
      for i in range(len(pivot.index)):\r
          for j in range(len(pivot.columns)):\r
              axHeat.text(j, i, f"{pivot.values[i, j]:.3f}", ha="center", va="center")\r
      plt.colorbar(im, ax=axHeat)\r
      figHeat\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 8단계. 파라미터 히트맵의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 8단계. 파라미터 히트맵 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step9_rf\r
  title: 9단계. RandomForest 튜닝\r
  structuredPrimary: true\r
  subtitle: 다른 모델 적용\r
  goal: 9단계. RandomForest 튜닝에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: RandomForest에도 GridSearchCV를 적용합니다. n_estimators, max_depth, min_samples_split을 튜닝합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    rfParamGrid = {\r
        "n_estimators": [50, 100, 150],\r
        "max_depth": [3, 5, 7, None],\r
        "min_samples_split": [2, 5, 10]\r
    }\r
    rfTotalComb = 3 * 4 * 3\r
    print(f"Total combinations: {rfTotalComb}")\r
\r
    rfGridSearch = GridSearchCV(RandomForestClassifier(random_state=42), rfParamGrid, cv=5, scoring="accuracy")\r
    rfGridSearch.fit(xTrainSc, yTrain)\r
    print(f"Best RF params: {rfGridSearch.best_params_}")\r
  exercise:\r
    prompt: 9단계. RandomForest 튜닝 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.\r
    starterCode: |-\r
      rfParamGrid = {\r
          "n_estimators": [50, 100, 150],\r
          "max_depth": [3, 5, 7, None],\r
          "min_samples_split": [2, 5, 10]\r
      }\r
      rfTotalComb = 3 * 4 * 3\r
      print(f"Total combinations: {rfTotalComb}")\r
\r
      rfGridSearch = GridSearchCV(RandomForestClassifier(random_state=42), rfParamGrid, cv=5, scoring="accuracy")\r
      rfGridSearch.fit(xTrainSc, yTrain)\r
      print(f"Best RF params: {rfGridSearch.best_params_}")\r
    hints:\r
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.\r
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.\r
  check:\r
    type: noError\r
    noError: 9단계. RandomForest 튜닝의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.\r
    resultCheck: 9단계. RandomForest 튜닝 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.\r
- id: step10_compare\r
  title: 10단계. 모델 비교\r
  structuredPrimary: true\r
  subtitle: SVM vs RF\r
  goal: 10단계. 모델 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 튜닝된 SVM과 RandomForest의 성능을 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    rfBest = rfGridSearch.best_estimator_\r
    rfPred = rfBest.predict(xTestSc)\r
    rfAcc = accuracy_score(yTest, rfPred)\r
\r
    figComp, axComp = plt.subplots(figsize=(7, 5))\r
    models = ["SVM (baseline)", "SVM (tuned)", "RF (tuned)"]\r
    accs = [accBase, accBest, rfAcc]\r
    colors = ["gray", "steelblue", "coral"]\r
    axComp.bar(models, accs, color=colors)\r
    axComp.set_ylabel("Accuracy")\r
    axComp.set_title("Model Comparison")\r
    axComp.set_ylim(0.8, 1.0)\r
    for i, v in enumerate(accs):\r
        axComp.text(i, v + 0.01, f"{v:.3f}", ha="center")\r
    figComp\r
  exercise:\r
    prompt: 10단계. 모델 비교 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      rfBest = rfGridSearch.best_estimator_\r
      rfPred = rfBest.predict(xTestSc)\r
      rfAcc = accuracy_score(yTest, rfPred)\r
\r
      figComp, axComp = plt.subplots(figsize=(7, 5))\r
      models = ["SVM (baseline)", "SVM (tuned)", "RF (tuned)"]\r
      accs = [accBase, accBest, rfAcc]\r
      colors = ["gray", "steelblue", "coral"]\r
      axComp.bar(models, accs, color=colors)\r
      axComp.set_ylabel("Accuracy")\r
      axComp.set_title("Model Comparison")\r
      axComp.set_ylim(0.8, 1.0)\r
      for i, v in enumerate(accs):\r
          axComp.text(i, v + 0.01, f"{v:.3f}", ha="center")\r
      figComp\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    noError: 10단계. 모델 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 모델 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step11_cv\r
  title: 11단계. 교차검증 상세\r
  structuredPrimary: true\r
  subtitle: cv별 점수\r
  goal: 11단계. 교차검증 상세에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    최적 모델의 각 폴드별 점수를 확인합니다. 점수 분산이 크면 데이터 의존성이 높습니다.\r
\r
    교차검증 점수의 표준편차가 작을수록 모델이 안정적입니다. 큰 분산은 특정 데이터 분할에 민감함을 의미합니다.\r
  snippet: |-\r
    cvScores = cross_val_score(bestModel, xTrainSc, yTrain, cv=5)\r
    print(f"CV Scores: {cvScores}")\r
    print(f"Mean: {cvScores.mean():.4f} (+/- {cvScores.std() * 2:.4f})")\r
  exercise:\r
    prompt: 11단계. 교차검증 상세 예제에서 출력 문장 하나를 바꾸고 출력 줄 순서와 바뀐 줄을 확인하세요.\r
    starterCode: |-\r
      cvScores = cross_val_score(bestModel, xTrainSc, yTrain, cv=5)\r
      print(f"CV Scores: {cvScores}")\r
      print(f"Mean: {cvScores.mean():.4f} (+/- {cvScores.std() * 2:.4f})")\r
    hints:\r
    - 바꿀 지점은 각 print()의 따옴표 안 문구나 출력 변수에서 찾으세요.\r
    - 실행 뒤 줄 수와 순서가 유지되고, 수정한 줄만 의도대로 바뀌었는지 보세요.\r
  check:\r
    noError: 11단계. 교차검증 상세의 각 print() 호출이 따옴표와 괄호 조건을 만족하고 순서대로 출력되어야 합니다.\r
    resultCheck: 11단계. 교차검증 상세 출력 줄 수와 순서가 유지되고, 바꾼 줄의 문구가 출력 영역에 나타나야 합니다.\r
- id: step12_time\r
  title: 12단계. 학습 시간\r
  structuredPrimary: true\r
  subtitle: 시간 비용\r
  goal: 12단계. 학습 시간에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    그리드 서치의 총 학습 시간과 조합당 시간을 확인합니다. 파라미터가 많을수록 시간이 기하급수적으로 증가합니다.\r
\r
    시간 절약 팁: 1) 작은 그리드로 시작, 2) RandomizedSearchCV 사용, 3) 병렬화(Codaro 로컬 Python에서는 불가), 4) 조기 종료(early stopping)\r
  tips:\r
  - '시간 절약 팁: 1) 작은 그리드로 시작, 2) RandomizedSearchCV 사용, 3) 병렬화(Codaro 로컬 Python에서는 불가), 4) 조기 종료(early\r
    stopping)'\r
  snippet: |-\r
    totalTime = resultsDf["mean_fit_time"].sum()\r
    meanTime = resultsDf["mean_fit_time"].mean()\r
    print(f"Total combinations: {len(resultsDf)}")\r
    print(f"Total fit time: {totalTime:.2f}s")\r
    print(f"Mean time per combination: {meanTime:.4f}s")\r
  exercise:\r
    prompt: 12단계. 학습 시간 예제에서 출력 문장 하나를 바꾸고 출력 줄 순서와 바뀐 줄을 확인하세요.\r
    starterCode: |-\r
      totalTime = resultsDf["mean_fit_time"].sum()\r
      meanTime = resultsDf["mean_fit_time"].mean()\r
      print(f"Total combinations: {len(resultsDf)}")\r
      print(f"Total fit time: {totalTime:.2f}s")\r
      print(f"Mean time per combination: {meanTime:.4f}s")\r
    hints:\r
    - 바꿀 지점은 각 print()의 따옴표 안 문구나 출력 변수에서 찾으세요.\r
    - 실행 뒤 줄 수와 순서가 유지되고, 수정한 줄만 의도대로 바뀌었는지 보세요.\r
  check:\r
    noError: 12단계. 학습 시간의 각 print() 호출이 따옴표와 괄호 조건을 만족하고 순서대로 출력되어야 합니다.\r
    resultCheck: 12단계. 학습 시간 출력 줄 수와 순서가 유지되고, 바꾼 줄의 문구가 출력 영역에 나타나야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 하이퍼파라미터 튜닝\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    지금까지 배운 개념을 활용하여 미션을 수행해봅시다. 각 미션은 독립적으로 실행 가능합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    from sklearn.datasets import load_breast_cancer\r
    from sklearn.model_selection import train_test_split, GridSearchCV\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.svm import SVC\r
    from sklearn.metrics import accuracy_score\r
    import matplotlib.pyplot as plt\r
\r
    cancer = load_breast_cancer()\r
    xC = cancer.data\r
    yC = cancer.target\r
    xTrC, xTeC, yTrC, yTeC = train_test_split(xC, yC, test_size=0.2, random_state=42)\r
    scalerC = StandardScaler()\r
    xTrCsc = scalerC.fit_transform(xTrC)\r
    xTeCsc = scalerC.transform(xTeC)\r
\r
    paramC = {"C": [0.1, 1, 10], "gamma": [0.01, 0.1, 1]}\r
    gridC = GridSearchCV(SVC(random_state=42), paramC, cv=5)\r
    gridC.fit(xTrCsc, yTrC)\r
    print(f"Best Params: {gridC.best_params_}")\r
    print(f"Best CV Score: {gridC.best_score_:.4f}")\r
\r
    predC = gridC.predict(xTeCsc)\r
    print(f"Test Accuracy: {accuracy_score(yTeC, predC):.4f}")\r
  exercise:\r
    prompt: 실습 예제에서 출력 문장 하나를 바꾸고 출력 줄 순서와 바뀐 줄을 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      from sklearn.datasets import load_breast_cancer\r
      from sklearn.model_selection import train_test_split, GridSearchCV\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.svm import SVC\r
      from sklearn.metrics import accuracy_score\r
      import matplotlib.pyplot as plt\r
\r
      cancer = load_breast_cancer()\r
      xC = cancer.data\r
      yC = cancer.target\r
      xTrC, xTeC, yTrC, yTeC = train_test_split(xC, yC, test_size=0.2, random_state=42)\r
      scalerC = StandardScaler()\r
      xTrCsc = scalerC.fit_transform(xTrC)\r
      xTeCsc = scalerC.transform(xTeC)\r
\r
      paramC = {"C": [0.1, 1, 10], "gamma": [0.01, 0.1, 1]}\r
      gridC = GridSearchCV(SVC(random_state=42), paramC, cv=5)\r
      gridC.fit(xTrCsc, yTrC)\r
      print(f"Best Params: {gridC.best_params_}")\r
      print(f"Best CV Score: {gridC.best_score_:.4f}")\r
\r
      predC = gridC.predict(xTeCsc)\r
      print(f"Test Accuracy: {accuracy_score(yTeC, predC):.4f}")\r
    hints:\r
    - 바꿀 지점은 각 print()의 따옴표 안 문구나 출력 변수에서 찾으세요.\r
    - 실행 뒤 줄 수와 순서가 유지되고, 수정한 줄만 의도대로 바뀌었는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 각 print() 호출이 따옴표와 괄호 조건을 만족하고 순서대로 출력되어야 합니다.\r
    resultCheck: 실습 출력 줄 수와 순서가 유지되고, 바꾼 줄의 문구가 출력 영역에 나타나야 합니다.\r
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