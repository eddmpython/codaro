var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scikit-learn\r
  id: sklearn_10\r
  title: 종합ML파이프라인\r
  order: 10\r
  category: sklearn\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 고급\r
  tags:\r
  - sklearn\r
  - Pipeline\r
  - ColumnTransformer\r
  - 전처리\r
  - 워크플로우\r
  seo:\r
    title: Sklearn Pipeline - 종합 ML 워크플로우\r
    description: Pipeline과 ColumnTransformer로 전처리부터 모델 학습까지 통합합니다. 재현 가능한 ML 워크플로우를 구축합니다.\r
    keywords:\r
    - sklearn\r
    - Pipeline\r
    - ColumnTransformer\r
    - workflow\r
    - preprocessing\r
intro:\r
  emoji: 🔧\r
  goal: Pipeline으로 전처리와 모델 학습을 통합하고 재현 가능한 ML 워크플로우를 구축합니다.\r
  description: Pipeline은 여러 변환 단계와 모델을 하나로 연결합니다. ColumnTransformer는 수치형/범주형 컬럼에 다른 전처리를 적용합니다. 이전에 배운\r
    모든 개념을 통합하여 실전 ML 파이프라인을 구축합니다.\r
  direction: 종합ML파이프라인에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - 종합ML파이프라인 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 데이터 로딩 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 탐색 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 특성 선택 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: 종합ML파이프라인 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: matplotlib, numpy, pandas, scikit-learn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합ML파이프라인 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: 종합ML파이프라인 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: step1_data\r
  title: 1단계. 데이터 로딩\r
  structuredPrimary: true\r
  subtitle: 타이타닉 데이터\r
  goal: 1단계. 데이터 로딩에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    타이타닉 생존 데이터를 사용합니다. 수치형과 범주형 변수가 혼합되어 있어 Pipeline 실습에 적합합니다. Codaro 로컬 데이터셋에는 결측치, 수치형/범주형 컬럼, 생존 타깃이 모두 포함되어 Pipeline과 GridSearch 흐름을 끝까지 실행할 수 있습니다.\r
\r
    타이타닉 데이터는 Pclass(좌석등급), Sex(성별), Age(나이), SibSp(형제자매), Parch(부모자녀), Fare(요금), Embarked(승선항) 등으로 Survived(생존) 여부를 예측합니다.\r
  tips:\r
  - 타이타닉 데이터는 Pclass(좌석등급), Sex(성별), Age(나이), SibSp(형제자매), Parch(부모자녀), Fare(요금), Embarked(승선항) 등으로 Survived(생존)\r
    여부를 예측합니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV\r
    from sklearn.preprocessing import StandardScaler, OneHotEncoder\r
    from sklearn.impute import SimpleImputer\r
    from sklearn.compose import ColumnTransformer\r
    from sklearn.pipeline import Pipeline\r
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier\r
    from sklearn.linear_model import LogisticRegression\r
    from sklearn.metrics import accuracy_score, classification_report, roc_auc_score\r
    import matplotlib.pyplot as plt\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    titanic = loadLocalDataset("titanic_passengers")\r
    titanic.head()\r
  exercise:\r
    prompt: 1단계. 데이터 로딩 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV\r
      from sklearn.preprocessing import StandardScaler, OneHotEncoder\r
      from sklearn.impute import SimpleImputer\r
      from sklearn.compose import ColumnTransformer\r
      from sklearn.pipeline import Pipeline\r
      from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier\r
      from sklearn.linear_model import LogisticRegression\r
      from sklearn.metrics import accuracy_score, classification_report, roc_auc_score\r
      import matplotlib.pyplot as plt\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      titanic = loadLocalDataset("titanic_passengers")\r
      titanic.head()\r
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
  subtitle: 결측치와 분포\r
  goal: 2단계. 데이터 탐색에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 결측치 현황과 생존 분포를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    missingDf = pd.DataFrame({\r
        "missing": titanic.isnull().sum(),\r
        "percent": (titanic.isnull().sum() / len(titanic) * 100).round(2)\r
    })\r
    missingDf[missingDf["missing"] > 0]\r
  exercise:\r
    prompt: 2단계. 데이터 탐색 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      missingDf = pd.DataFrame({\r
          "missing": titanic.isnull().sum(),\r
          "percent": (titanic.isnull().sum() / len(titanic) * 100).round(2)\r
      })\r
      missingDf[missingDf["missing"] > 0]\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 탐색의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 탐색의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_select\r
  title: 3단계. 특성 선택\r
  structuredPrimary: true\r
  subtitle: 수치형/범주형 분류\r
  goal: 3단계. 특성 선택에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    분석에 사용할 특성을 선택하고 수치형/범주형으로 분류합니다.\r
\r
    Age와 Embarked에 결측치가 있습니다. Pipeline에서 SimpleImputer로 자동 처리합니다.\r
  snippet: |-\r
    numCols = ["Age", "SibSp", "Parch", "Fare"]\r
    catCols = ["Pclass", "Sex", "Embarked"]\r
\r
    featureCols = numCols + catCols\r
    X = titanic[featureCols].copy()\r
    y = titanic["Survived"].copy()\r
    X.shape, y.shape\r
  exercise:\r
    prompt: 3단계. 특성 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      numCols = ["Age", "SibSp", "Parch", "Fare"]\r
      catCols = ["Pclass", "Sex", "Embarked"]\r
\r
      featureCols = numCols + catCols\r
      X = titanic[featureCols].copy()\r
      y = titanic["Survived"].copy()\r
      X.shape, y.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 특성 선택에서 \`numCols\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 특성 선택 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_split\r
  title: 4단계. 데이터 분할\r
  structuredPrimary: true\r
  subtitle: 학습/테스트 분리\r
  goal: 4단계. 데이터 분할에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    학습/테스트 데이터로 분할합니다. 파이프라인 구축 전에 분할하여 데이터 누수를 방지합니다.\r
\r
    전처리(스케일링, 인코딩)는 반드시 분할 후 학습 데이터에만 fit하고 테스트 데이터에는 transform만 적용합니다. Pipeline이 이를 자동으로 처리합니다.\r
  snippet: |-\r
    xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)\r
    xTrain.shape, xTest.shape\r
  exercise:\r
    prompt: 4단계. 데이터 분할 예제에서 \`xTrain\`, \`xTest\`, \`yTrain\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      xTrain, xTest, yTrain, yTest = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)\r
      xTrain.shape, xTest.shape\r
    hints:\r
    - 바꿀 지점은 입력 데이터을 만드는 첫 줄과 핵심 처리 줄에서 찾으세요.\r
    - 실행 뒤 출력과 상태 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 데이터 분할에서 \`xTrain\`, \`xTest\`, \`yTrain\` 할당 개수와 값 순서가 맞아야 합니다.\r
    resultCheck: 4단계. 데이터 분할 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_preprocessor\r
  title: 5단계. 전처리 파이프라인\r
  structuredPrimary: true\r
  subtitle: ColumnTransformer\r
  goal: 5단계. 전처리 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    ColumnTransformer로 수치형/범주형 컬럼에 다른 전처리를 적용합니다.\r
\r
    ColumnTransformer는 컬럼별로 다른 변환을 적용합니다. remainder='passthrough'로 나머지 컬럼을 유지하거나 'drop'으로 제거할 수 있습니다.\r
  snippet: |-\r
    numPipeline = Pipeline([\r
        ("imputer", SimpleImputer(strategy="median")),\r
        ("scaler", StandardScaler())\r
    ])\r
    catPipeline = Pipeline([\r
        ("imputer", SimpleImputer(strategy="most_frequent")),\r
        ("encoder", OneHotEncoder(handle_unknown="ignore"))\r
    ])\r
    preprocessor = ColumnTransformer([\r
        ("num", numPipeline, numCols),\r
        ("cat", catPipeline, catCols)\r
    ])\r
    preprocessor\r
  exercise:\r
    prompt: 5단계. 전처리 파이프라인 예제에서 numCols/catCols에 적용할 변환 단계를 바꾸고 preprocessor 구성이 달라지는지 확인하세요.\r
    starterCode: |-\r
      numPipeline = Pipeline([\r
          ("imputer", SimpleImputer(strategy="median")),\r
          ("scaler", StandardScaler())\r
      ])\r
      catPipeline = Pipeline([\r
          ("imputer", SimpleImputer(strategy="most_frequent")),\r
          ("encoder", OneHotEncoder(handle_unknown="ignore"))\r
      ])\r
      preprocessor = ColumnTransformer([\r
          ("num", numPipeline, numCols),\r
          ("cat", catPipeline, catCols)\r
      ])\r
      preprocessor\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 전처리 파이프라인에서 \`numPipeline\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 전처리 파이프라인 실행 뒤 \`numPipeline\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step6_fullpipe\r
  title: 6단계. 전체 파이프라인\r
  structuredPrimary: true\r
  subtitle: 전처리 + 모델\r
  goal: 6단계. 전체 파이프라인에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    전처리와 모델을 하나의 파이프라인으로 연결합니다. fit과 predict가 한 번에 실행됩니다.\r
\r
    Pipeline.fit()은 모든 전처리 단계의 fit_transform()과 마지막 모델의 fit()을 순차적으로 실행합니다. predict()도 마찬가지입니다.\r
  snippet: |-\r
    fullPipeline = Pipeline([\r
        ("preprocessor", preprocessor),\r
        ("classifier", RandomForestClassifier(n_estimators=100, random_state=42))\r
    ])\r
    fullPipeline\r
  exercise:\r
    prompt: 6단계. 전체 파이프라인 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      fullPipeline = Pipeline([\r
          ("preprocessor", preprocessor),\r
          ("classifier", RandomForestClassifier(n_estimators=100, random_state=42))\r
      ])\r
      fullPipeline\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 6단계. 전체 파이프라인에서 \`fullPipeline\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 전체 파이프라인 실행 뒤 \`fullPipeline\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step7_cv\r
  title: 7단계. 교차검증\r
  structuredPrimary: true\r
  subtitle: 파이프라인 CV\r
  goal: 7단계. 교차검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: |-\r
    파이프라인 전체에 교차검증을 적용합니다. 각 폴드에서 전처리도 다시 수행됩니다.\r
\r
    파이프라인에 교차검증을 적용하면 각 폴드에서 전처리가 독립적으로 수행되어 데이터 누수를 완벽히 방지합니다.\r
  snippet: |-\r
    cvScores = cross_val_score(fullPipeline, xTrain, yTrain, cv=5, scoring="accuracy")\r
    print(f"CV Scores: {cvScores}")\r
    print(f"Mean: {cvScores.mean():.4f} (+/- {cvScores.std() * 2:.4f})")\r
  exercise:\r
    prompt: 7단계. 교차검증 예제에서 출력 문장 하나를 바꾸고 출력 줄 순서와 바뀐 줄을 확인하세요.\r
    starterCode: |-\r
      cvScores = cross_val_score(fullPipeline, xTrain, yTrain, cv=5, scoring="accuracy")\r
      print(f"CV Scores: {cvScores}")\r
      print(f"Mean: {cvScores.mean():.4f} (+/- {cvScores.std() * 2:.4f})")\r
    hints:\r
    - 바꿀 지점은 각 print()의 따옴표 안 문구나 출력 변수에서 찾으세요.\r
    - 실행 뒤 줄 수와 순서가 유지되고, 수정한 줄만 의도대로 바뀌었는지 보세요.\r
  check:\r
    noError: 7단계. 교차검증의 각 print() 호출이 따옴표와 괄호 조건을 만족하고 순서대로 출력되어야 합니다.\r
    resultCheck: 7단계. 교차검증 출력 줄 수와 순서가 유지되고, 바꾼 줄의 문구가 출력 영역에 나타나야 합니다.\r
- id: step8_grid\r
  title: 8단계. 파이프라인 GridSearch\r
  structuredPrimary: true\r
  subtitle: 하이퍼파라미터 튜닝\r
  goal: 8단계. 파이프라인 GridSearch에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    파이프라인의 모델 파라미터를 GridSearchCV로 튜닝합니다. 파라미터명에 단계명을 접두사로 붙입니다.\r
\r
    파이프라인 파라미터명 형식: '단계명__파라미터명'. classifier__n_estimators는 classifier 단계의 n_estimators 파라미터입니다.\r
  snippet: |-\r
    paramGrid = {\r
        "classifier__n_estimators": [50, 100],\r
        "classifier__max_depth": [5, 10, None],\r
        "classifier__min_samples_split": [2, 5]\r
    }\r
\r
    gridSearch = GridSearchCV(fullPipeline, paramGrid, cv=5, scoring="accuracy")\r
    gridSearch.fit(xTrain, yTrain)\r
    print(f"Best params: {gridSearch.best_params_}")\r
    print(f"Best CV score: {gridSearch.best_score_:.4f}")\r
  exercise:\r
    prompt: 8단계. 파이프라인 GridSearch 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      paramGrid = {\r
          "classifier__n_estimators": [50, 100],\r
          "classifier__max_depth": [5, 10, None],\r
          "classifier__min_samples_split": [2, 5]\r
      }\r
\r
      gridSearch = GridSearchCV(fullPipeline, paramGrid, cv=5, scoring="accuracy")\r
      gridSearch.fit(xTrain, yTrain)\r
      print(f"Best params: {gridSearch.best_params_}")\r
      print(f"Best CV score: {gridSearch.best_score_:.4f}")\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 파이프라인 GridSearch에서 \`paramGrid\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 파이프라인 GridSearch 실행 뒤 \`paramGrid\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step9_models\r
  title: 9단계. 모델 비교\r
  structuredPrimary: true\r
  subtitle: 여러 알고리즘\r
  goal: 9단계. 모델 비교에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 동일한 전처리로 여러 모델의 성능을 비교합니다. 파이프라인을 재사용하면 효율적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    models = {\r
        "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),\r
        "RandomForest": RandomForestClassifier(n_estimators=100, random_state=42),\r
        "GradientBoosting": GradientBoostingClassifier(n_estimators=100, random_state=42)\r
    }\r
\r
    results = {}\r
    for name, model in models.items():\r
        pipe = Pipeline([\r
            ("preprocessor", preprocessor),\r
            ("classifier", model)\r
        ])\r
        scores = cross_val_score(pipe, xTrain, yTrain, cv=5, scoring="accuracy")\r
        results[name] = {"mean": scores.mean(), "std": scores.std()}\r
        print(f"{name}: {scores.mean():.4f} (+/- {scores.std() * 2:.4f})")\r
  exercise:\r
    prompt: 9단계. 모델 비교 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      models = {\r
          "LogisticRegression": LogisticRegression(max_iter=1000, random_state=42),\r
          "RandomForest": RandomForestClassifier(n_estimators=100, random_state=42),\r
          "GradientBoosting": GradientBoostingClassifier(n_estimators=100, random_state=42)\r
      }\r
\r
      results = {}\r
      for name, model in models.items():\r
          pipe = Pipeline([\r
              ("preprocessor", preprocessor),\r
              ("classifier", model)\r
          ])\r
          scores = cross_val_score(pipe, xTrain, yTrain, cv=5, scoring="accuracy")\r
          results[name] = {"mean": scores.mean(), "std": scores.std()}\r
          print(f"{name}: {scores.mean():.4f} (+/- {scores.std() * 2:.4f})")\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    noError: 9단계. 모델 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 9단계. 모델 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step10_final\r
  title: 10단계. 최종 평가\r
  structuredPrimary: true\r
  subtitle: 테스트 성능\r
  goal: 10단계. 최종 평가에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: 최적 모델로 테스트 데이터 성능을 평가합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    bestPipe = gridSearch.best_estimator_\r
    yPredFinal = bestPipe.predict(xTest)\r
    accFinal = accuracy_score(yTest, yPredFinal)\r
    print(f"Test Accuracy: {accFinal:.4f}")\r
  exercise:\r
    prompt: 10단계. 최종 평가 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.\r
    starterCode: |-\r
      bestPipe = gridSearch.best_estimator_\r
      yPredFinal = bestPipe.predict(xTest)\r
      accFinal = accuracy_score(yTest, yPredFinal)\r
      print(f"Test Accuracy: {accFinal:.4f}")\r
    hints:\r
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.\r
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.\r
  check:\r
    noError: 10단계. 최종 평가의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.\r
    resultCheck: 10단계. 최종 평가 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.\r
- id: step11_proba\r
  title: 11단계. 확률 예측\r
  structuredPrimary: true\r
  subtitle: ROC-AUC\r
  goal: 11단계. 확률 예측에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 출력 확인은 코드가 의도대로 실행됐는지 가장 작게 점검하는 방법입니다.\r
  explanation: 생존 확률을 예측하고 ROC-AUC로 성능을 평가합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    yProba = bestPipe.predict_proba(xTest)[:, 1]\r
    auc = roc_auc_score(yTest, yProba)\r
    print(f"ROC-AUC: {auc:.4f}")\r
  exercise:\r
    prompt: 11단계. 확률 예측 예제에서 따옴표 안 문구나 출력 변수를 바꾸고 출력이 그대로 바뀌는지 확인하세요.\r
    starterCode: |-\r
      yProba = bestPipe.predict_proba(xTest)[:, 1]\r
      auc = roc_auc_score(yTest, yProba)\r
      print(f"ROC-AUC: {auc:.4f}")\r
    hints:\r
    - 바꿀 지점은 print() 안의 문자열, 변수명, 쉼표로 연결된 값입니다.\r
    - 실행 뒤 출력 영역에 수정한 문구나 값이 빠짐없이 보이는지 확인하세요.\r
  check:\r
    noError: 11단계. 확률 예측의 print() 호출이 따옴표와 괄호 조건을 만족하고 출력되어야 합니다.\r
    resultCheck: 11단계. 확률 예측 출력 영역에 직접 바꾼 문자열이나 값이 그대로 나타나야 합니다.\r
- id: step12_importance\r
  title: 12단계. 특성 중요도\r
  structuredPrimary: true\r
  subtitle: 모델 해석\r
  goal: 12단계. 특성 중요도에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    파이프라인에서 특성 중요도를 추출합니다. OneHotEncoder로 생성된 특성명을 복원합니다.\r
\r
    타이타닉 생존 예측에서 Sex(성별), Fare(요금), Age(나이), Pclass(좌석등급)가 중요한 요인입니다. 여성, 고가 티켓, 1등석 승객의 생존율이 높았습니다.\r
  snippet: |-\r
    numFeatures = numCols\r
    catEncoder = bestPipe.named_steps["preprocessor"].named_transformers_["cat"].named_steps["encoder"]\r
    catFeatures = catEncoder.get_feature_names_out(catCols).tolist()\r
    allFeatures = numFeatures + catFeatures\r
    allFeatures\r
  exercise:\r
    prompt: 12단계. 특성 중요도 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      numFeatures = numCols\r
      catEncoder = bestPipe.named_steps["preprocessor"].named_transformers_["cat"].named_steps["encoder"]\r
      catFeatures = catEncoder.get_feature_names_out(catCols).tolist()\r
      allFeatures = numFeatures + catFeatures\r
      allFeatures\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    noError: 12단계. 특성 중요도에서 \`numFeatures\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 12단계. 특성 중요도 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: ML 파이프라인\r
  goal: 실습에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 개념을 활용하여 미션을 수행해봅시다. 각 미션은 독립적으로 실행 가능합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import pandas as pd\r
    import numpy as np\r
    from sklearn.datasets import load_diabetes\r
    from sklearn.model_selection import train_test_split, cross_val_score\r
    from sklearn.preprocessing import StandardScaler\r
    from sklearn.pipeline import Pipeline\r
    from sklearn.linear_model import Ridge\r
    from sklearn.metrics import mean_squared_error, r2_score\r
    import matplotlib.pyplot as plt\r
\r
    diabetes = load_diabetes()\r
    xDiab = pd.DataFrame(diabetes.data, columns=diabetes.feature_names)\r
    yDiab = diabetes.target\r
    xTrD, xTeD, yTrD, yTeD = train_test_split(xDiab, yDiab, test_size=0.2, random_state=42)\r
\r
    regPipe = Pipeline([\r
        ("scaler", StandardScaler()),\r
        ("regressor", Ridge(alpha=1.0))\r
    ])\r
    regPipe.fit(xTrD, yTrD)\r
    predD = regPipe.predict(xTeD)\r
    r2D = r2_score(yTeD, predD)\r
    print(f"R2 Score: {r2D:.4f}")\r
\r
    cvR2 = cross_val_score(regPipe, xTrD, yTrD, cv=5, scoring="r2")\r
    print(f"CV R2: {cvR2.mean():.4f} (+/- {cvR2.std() * 2:.4f})")\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import pandas as pd\r
      import numpy as np\r
      from sklearn.datasets import load_diabetes\r
      from sklearn.model_selection import train_test_split, cross_val_score\r
      from sklearn.preprocessing import StandardScaler\r
      from sklearn.pipeline import Pipeline\r
      from sklearn.linear_model import Ridge\r
      from sklearn.metrics import mean_squared_error, r2_score\r
      import matplotlib.pyplot as plt\r
\r
      diabetes = load_diabetes()\r
      xDiab = pd.DataFrame(diabetes.data, columns=diabetes.feature_names)\r
      yDiab = diabetes.target\r
      xTrD, xTeD, yTrD, yTeD = train_test_split(xDiab, yDiab, test_size=0.2, random_state=42)\r
\r
      regPipe = Pipeline([\r
          ("scaler", StandardScaler()),\r
          ("regressor", Ridge(alpha=1.0))\r
      ])\r
      regPipe.fit(xTrD, yTrD)\r
      predD = regPipe.predict(xTeD)\r
      r2D = r2_score(yTeD, predD)\r
      print(f"R2 Score: {r2D:.4f}")\r
\r
      cvR2 = cross_val_score(regPipe, xTrD, yTrD, cv=5, scoring="r2")\r
      print(f"CV R2: {cvR2.mean():.4f} (+/- {cvR2.std() * 2:.4f})")\r
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