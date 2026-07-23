var e=`meta:\r
  packages:\r
  - scikit-learn\r
  id: sklearn_00\r
  title: sklearn소개\r
  order: 0\r
  category: sklearn\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - scikit-learn\r
  - 머신러닝\r
  - 분류\r
  - 회귀\r
  - 클러스터링\r
  seo:\r
    title: scikit-learn 입문 - Python 머신러닝의 표준\r
    description: scikit-learn으로 분류, 회귀, 클러스터링을 시작하세요. 통일된 API로 다양한 ML 알고리즘을 쉽게 사용할 수 있습니다.\r
    keywords:\r
    - scikit-learn\r
    - 머신러닝\r
    - 분류\r
    - 회귀\r
    - 클러스터링\r
    - 예측\r
intro:\r
  direction: sklearn소개에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - sklearn소개 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 업무 흐름 검증 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 핵심 처리 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 출력과 상태 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: sklearn소개 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: numpy, scikit-learn 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: sklearn소개 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: sklearn소개 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 🤖\r
    title: scikit-learn이란?\r
    subtitle: Python 머신러닝의 대표 외부 패키지\r
  - type: hero\r
    emoji: 🎯\r
    title: 예측을 위한 라이브러리\r
    subtitle: 데이터에서 패턴을 학습하고 미래를 예측\r
    points:\r
    - emoji: 📊\r
      title: 분류/회귀\r
    - emoji: 🔮\r
      title: 예측 모델링\r
    - emoji: 🎨\r
      title: 클러스터링\r
    - emoji: ⚙️\r
      title: 통일된 API\r
  goal: scikit-learn이란?에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: what_is_sklearn\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤔 scikit-learn이 뭔가요?\r
    subtitle: 머신러닝을 쉽게 만드는 도구\r
  - type: note\r
    style: info\r
    title: 머신러닝이란?\r
    content: 머신러닝은 데이터에서 패턴을 학습하여 새로운 데이터를 예측하는 기술입니다. "이 이메일이 스팸인가?", "이 환자가 당뇨병일 확률은?", "이 집의 가격은 얼마일까?"\r
      같은 질문에 답합니다. scikit-learn은 이런 머신러닝 알고리즘을 쉽게 사용할 수 있게 만든 Python 라이브러리입니다. fit/predict/transform이라는\r
      일관된 인터페이스로 수십 개의 알고리즘을 동일한 방식으로 사용할 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🏷️\r
      title: 분류 (Classification)\r
      description: 카테고리 예측 - 스팸/정상, 양성/악성\r
    - emoji: 📈\r
      title: 회귀 (Regression)\r
      description: 연속 값 예측 - 가격, 수량, 점수\r
    - emoji: 🎨\r
      title: 클러스터링 (Clustering)\r
      description: 비슷한 데이터 그룹화 - 고객 세분화\r
    - emoji: 📉\r
      title: 차원 축소 (Dimensionality)\r
      description: 특성 압축 - PCA, 시각화\r
  goal: 🤔 scikit-learn이 뭔가요?에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: why_sklearn\r
  blocks:\r
  - type: sectionHeader\r
    title: 🌟 왜 scikit-learn인가요?\r
    subtitle: 머신러닝 라이브러리 선택 이유\r
  - type: note\r
    style: info\r
    title: 산업 표준\r
    content: scikit-learn은 가장 많이 사용되는 Python ML 라이브러리입니다. 수천 개의 기업과 연구기관에서 사용합니다. 문서화가 잘 되어 있고, 커뮤니티가\r
      활발합니다. 취업 시장에서도 sklearn 경험은 필수입니다. TensorFlow, PyTorch 같은 딥러닝 프레임워크를 배우기 전에 sklearn으로 ML 기초를 다지는\r
      것이 좋습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🔄\r
      title: 통일된 API\r
      description: fit(), predict(), transform() 일관된 인터페이스\r
    - emoji: 📚\r
      title: 풍부한 문서\r
      description: 예제, 튜토리얼, API 레퍼런스\r
    - emoji: 🧩\r
      title: 파이프라인\r
      description: 전처리 → 학습 → 평가 자동화\r
    - emoji: ⚡\r
      title: 최적화된 성능\r
      description: NumPy, Cython 기반 고속 연산\r
    - emoji: 🛠️\r
      title: 다양한 도구\r
      description: 교차검증, 그리드서치, 특성선택\r
    - emoji: 🌐\r
      title: Codaro 로컬 Python 지원\r
      description: 로컬 Python에서 바로 실행 가능\r
  goal: 🌟 왜 scikit-learn인가요?에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: statsmodels_vs_sklearn\r
  blocks:\r
  - type: sectionHeader\r
    title: 🆚 statsmodels vs scikit-learn\r
    subtitle: 통계 분석과 머신러닝의 차이\r
  - type: compare\r
    left:\r
      title: statsmodels\r
      subtitle: 통계적 추론\r
      icon: 📊\r
      color: green\r
      items:\r
      - 왜 이런 결과인지 이해\r
      - p-value, 신뢰구간, 계수 해석\r
      - 가설 검정, 통계적 유의성\r
      - 단순하고 해석 가능한 모델\r
      - 논문, 리포트 작성\r
      infoBox: 선수 과목 - 통계적 기반 이해\r
    right:\r
      title: scikit-learn\r
      subtitle: 예측 정확도\r
      icon: 🤖\r
      color: blue\r
      items:\r
      - 얼마나 정확하게 예측하는지\r
      - 정확도, F1, MSE, ROC-AUC\r
      - 교차검증, 과적합 방지\r
      - 복잡한 앙상블 모델\r
      - 프로덕션 시스템 배포\r
      infoBox: 본 과목 - 예측 모델 구축\r
  - type: note\r
    style: tip\r
    title: 학습 순서가 중요합니다\r
    content: statsmodels를 먼저 배운 이유가 있습니다. "왜 이 변수가 중요한지" 통계적으로 이해한 뒤에 "어떻게 예측을 최적화할지" 배우는 것이 올바른 순서입니다.\r
      통계적 기반 없이 ML을 시작하면 모델이 블랙박스가 됩니다. statsmodels에서 배운 회귀 개념, R², p-value 해석 능력이 sklearn에서도 활용됩니다.\r
  goal: 🆚 statsmodels vs scikit-learn에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: sklearn_workflow\r
  blocks:\r
  - type: sectionHeader\r
    title: 🔄 scikit-learn 워크플로우\r
    subtitle: 데이터에서 예측까지\r
  - type: note\r
    style: info\r
    title: 일관된 5단계 프로세스\r
    content: '모든 sklearn 모델은 동일한 패턴을 따릅니다. 1) 데이터 분할: train_test_split으로 학습/테스트 분리. 2) 전처리: StandardScaler,\r
      LabelEncoder로 데이터 변환. 3) 모델 학습: model.fit(X_train, y_train). 4) 예측: model.predict(X_test). 5) 평가:\r
      accuracy_score, MSE 등으로 성능 측정. 이 패턴을 익히면 어떤 알고리즘이든 동일하게 적용할 수 있습니다.'\r
  - type: featureCards\r
    cards:\r
    - emoji: ✂️\r
      title: 1. 데이터 분할\r
      description: train_test_split으로 학습/테스트 분리\r
    - emoji: 🔧\r
      title: 2. 전처리\r
      description: 스케일링, 인코딩, 결측치 처리\r
    - emoji: 📚\r
      title: 3. 모델 학습\r
      description: model.fit(X_train, y_train)\r
    - emoji: 🔮\r
      title: 4. 예측\r
      description: model.predict(X_test)\r
    - emoji: 📊\r
      title: 5. 평가\r
      description: accuracy, MSE, F1, ROC-AUC\r
    - emoji: 🔄\r
      title: 6. 개선\r
      description: 하이퍼파라미터 튜닝, 교차검증\r
  goal: 🔄 scikit-learn 워크플로우에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: algorithms\r
  blocks:\r
  - type: sectionHeader\r
    title: 🧠 주요 알고리즘\r
    subtitle: scikit-learn이 제공하는 모델들\r
  - type: table\r
    headers:\r
    - 유형\r
    - 알고리즘\r
    - 용도\r
    rows:\r
    - - 분류\r
      - LogisticRegression\r
      - 이진/다중 분류 기본\r
    - - 분류\r
      - RandomForestClassifier\r
      - 앙상블, 특성 중요도\r
    - - 분류\r
      - GradientBoostingClassifier\r
      - 고성능 앙상블\r
    - - 분류\r
      - SVC\r
      - 서포트 벡터 머신\r
    - - 회귀\r
      - LinearRegression\r
      - 선형 회귀 기본\r
    - - 회귀\r
      - Ridge, Lasso\r
      - 정규화 회귀\r
    - - 회귀\r
      - RandomForestRegressor\r
      - 앙상블 회귀\r
    - - 클러스터링\r
      - KMeans\r
      - K개 군집으로 분리\r
    - - 클러스터링\r
      - DBSCAN\r
      - 밀도 기반 군집화\r
    - - 차원축소\r
      - PCA\r
      - 주성분 분석\r
    - - 전처리\r
      - StandardScaler\r
      - 표준화\r
    - - 전처리\r
      - MinMaxScaler\r
      - 정규화 (0~1)\r
  - type: note\r
    style: tip\r
    title: 알고리즘 선택 가이드\r
    content: 분류 문제라면 LogisticRegression으로 시작하세요. 성능이 부족하면 RandomForest, GradientBoosting 순으로 시도합니다. 회귀\r
      문제는 LinearRegression 기본, 과적합 방지에는 Ridge/Lasso를 사용합니다. 클러스터링은 KMeans가 가장 직관적입니다. 어떤 알고리즘이든 fit/predict\r
      패턴은 동일합니다.\r
  goal: 🧠 주요 알고리즘에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: key_concepts\r
  blocks:\r
  - type: sectionHeader\r
    title: 🧩 핵심 개념\r
    subtitle: ML을 이해하기 위한 필수 용어\r
  - type: featureCards\r
    cards:\r
    - emoji: ✂️\r
      title: Train/Test Split\r
      description: 학습 데이터와 평가 데이터 분리\r
    - emoji: 📉\r
      title: 과적합 (Overfitting)\r
      description: 학습 데이터에만 너무 맞춰진 상태\r
    - emoji: 🔄\r
      title: 교차검증 (Cross-Validation)\r
      description: 데이터를 K개로 나눠 반복 검증\r
    - emoji: ⚙️\r
      title: 하이퍼파라미터\r
      description: 모델 외부에서 설정하는 값\r
    - emoji: 📊\r
      title: 특성 (Feature)\r
      description: 예측에 사용하는 입력 변수\r
    - emoji: 🎯\r
      title: 타겟 (Target)\r
      description: 예측하려는 출력 변수\r
  goal: 🧩 핵심 개념에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: metrics\r
  blocks:\r
  - type: sectionHeader\r
    title: 📋 평가 지표\r
    subtitle: 모델 성능을 측정하는 방법\r
  - type: table\r
    headers:\r
    - 지표\r
    - 유형\r
    - 의미\r
    - 해석\r
    rows:\r
    - - Accuracy\r
      - 분류\r
      - 정확도\r
      - 전체 중 맞춘 비율\r
    - - Precision\r
      - 분류\r
      - 정밀도\r
      - 양성 예측 중 실제 양성\r
    - - Recall\r
      - 분류\r
      - 재현율\r
      - 실제 양성 중 맞춘 비율\r
    - - F1 Score\r
      - 분류\r
      - 조화평균\r
      - 정밀도와 재현율의 균형\r
    - - ROC-AUC\r
      - 분류\r
      - 곡선 아래 면적\r
      - 1에 가까울수록 좋음\r
    - - MSE\r
      - 회귀\r
      - 평균제곱오차\r
      - 낮을수록 좋음\r
    - - RMSE\r
      - 회귀\r
      - MSE의 제곱근\r
      - 원래 단위로 해석\r
    - - R²\r
      - 회귀\r
      - 결정계수\r
      - 1에 가까울수록 좋음\r
  - type: note\r
    style: info\r
    title: 지표 선택 가이드\r
    content: 분류에서 클래스 불균형이 있다면 Accuracy보다 F1 Score를 사용하세요. 암 진단처럼 놓치면 안 되는 경우 Recall을 중시하고, 스팸 필터처럼 오탐이\r
      문제면 Precision을 중시합니다. 회귀에서는 MSE가 기본이고, 해석 편의를 위해 RMSE를 사용합니다. R²는 모델 설명력을 보여줍니다.\r
  goal: 📋 평가 지표에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: preprocessing\r
  blocks:\r
  - type: sectionHeader\r
    title: 🔧 전처리의 중요성\r
    subtitle: 좋은 예측은 좋은 데이터에서\r
  - type: note\r
    style: info\r
    title: 왜 전처리가 필요한가?\r
    content: 대부분의 ML 알고리즘은 숫자만 처리할 수 있습니다. 범주형 데이터(성별, 지역)는 숫자로 변환해야 합니다. 또한 특성 간 스케일이 다르면 일부 알고리즘이 제대로\r
      작동하지 않습니다. 예를 들어 나이(0~100)와 수입(0~10000000)을 함께 사용하면 수입이 모델을 지배합니다. StandardScaler로 모든 특성을 같은 스케일로\r
      맞추면 이 문제를 해결합니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 📏\r
      title: StandardScaler\r
      description: 평균 0, 표준편차 1로 변환\r
    - emoji: 📐\r
      title: MinMaxScaler\r
      description: 0~1 범위로 정규화\r
    - emoji: 🏷️\r
      title: LabelEncoder\r
      description: 범주를 숫자로 변환\r
    - emoji: 📊\r
      title: OneHotEncoder\r
      description: 범주를 이진 벡터로 변환\r
  goal: 🔧 전처리의 중요성에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: local_runtime_note\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚠️ Codaro 로컬 Python 환경 참고사항\r
    subtitle: 로컬 실행 시 확인할 점\r
  - type: note\r
    style: warning\r
    title: 제한사항\r
    content: 이 강의는 Codaro 로컬 Python 환경에서 실행됩니다. scikit-learn의 병렬 처리, 모델 평가, 파이프라인 기능을 로컬 CPU와 메모리 기준으로\r
      실습할 수 있습니다. 대용량 데이터셋은 실행 시간을 고려해 샘플링하면서 다룹니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: ✅\r
      title: 정상 작동\r
      description: LinearRegression, LogisticRegression, RandomForest, KMeans, PCA, StandardScaler\r
    - emoji: ⚠️\r
      title: 주의 필요\r
      description: n_jobs=-1 → n_jobs=1로 변경 필요\r
    - emoji: 📦\r
      title: 준비 방법\r
      description: 라이브러리 패널이 meta.packages 기준으로 현재 실행 환경을 준비\r
  goal: ⚠️ Codaro 로컬 Python 환경 참고사항에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: projects_preview\r
  blocks:\r
  - type: sectionHeader\r
    title: 🗺️ 앞으로 배울 내용\r
    subtitle: 10개 프로젝트로 마스터하기\r
  - type: table\r
    headers:\r
    - 단계\r
    - 프로젝트\r
    - 배울 내용\r
    - 비즈니스 가치\r
    rows:\r
    - - 입문\r
      - 와인 품질 분류\r
      - train_test_split, 다중분류, 스케일링\r
      - 품질 자동 분류\r
    - - 입문\r
      - 유방암 진단\r
      - 이진분류, 정밀도/재현율, F1\r
      - 의료 진단 자동화\r
    - - 기초\r
      - 당뇨병 진행도 예측\r
      - LinearRegression, MSE, R²\r
      - 건강 위험도 예측\r
    - - 기초\r
      - 주택 가격 예측\r
      - 다중특성 회귀, 교차검증\r
      - 부동산 가격 책정\r
    - - 기초\r
      - 손글씨 숫자 인식\r
      - 이미지 분류, PCA 시각화\r
      - OCR 기초\r
    - - 중급\r
      - 고객 세분화\r
      - KMeans, 엘보우, 실루엣\r
      - 마케팅 세분화\r
    - - 중급\r
      - 소나 신호 분류\r
      - RandomForest, 특성 중요도\r
      - 신호 탐지 자동화\r
    - - 중급\r
      - 심장병 예측\r
      - GradientBoosting, ROC-AUC\r
      - 건강 관리 시스템\r
    - - 심화\r
      - 신호 탐지 최적화\r
      - GridSearchCV, 하이퍼파라미터\r
      - 레이더 시스템\r
    - - 심화\r
      - 종합 ML 파이프라인\r
      - Pipeline, 모든 개념 종합\r
      - 실전 ML 시스템\r
  - type: note\r
    style: info\r
    title: 프로젝트 기반 학습\r
    content: 각 프로젝트는 실제 데이터로 실제 문제를 해결합니다. 와인 품종 분류, 암 진단, 주택 가격 예측 등 현실적인 문제를 다룹니다. 프로젝트를 진행하면서 이전에 배운\r
      개념을 반복 사용하고, 새로운 개념을 추가로 학습합니다. 10개 프로젝트를 완료하면 데이터에서 예측 모델을 구축하는 전체 워크플로우를 마스터하게 됩니다.\r
  goal: 🗺️ 앞으로 배울 내용에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: prerequisites\r
  blocks:\r
  - type: sectionHeader\r
    title: 📋 선수 지식\r
    subtitle: 시작하기 전에 알아야 할 것\r
  - type: note\r
    style: tip\r
    title: 권장 선수 과목\r
    content: pandas 기초 (데이터 로딩, 필터링, 그룹화), NumPy 기초 (배열 연산), statsmodels 기초 (회귀 개념, R² 해석)를 미리 학습하는 것을\r
      권장합니다. 특히 statsmodels에서 배운 회귀 개념은 sklearn에서도 그대로 활용됩니다. Python 기본 문법(함수, 리스트, 딕셔너리)도 알아야 합니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🐼\r
      title: pandas\r
      description: DataFrame, 필터링, 그룹화\r
    - emoji: 🔢\r
      title: NumPy\r
      description: 배열 연산, 인덱싱\r
    - emoji: 📊\r
      title: statsmodels\r
      description: 회귀 개념, R², p-value\r
    - emoji: 🐍\r
      title: Python 기초\r
      description: 함수, 리스트, 딕셔너리\r
  goal: 📋 선수 지식에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: resources\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 참고 자료\r
    subtitle: 더 깊이 공부하고 싶다면\r
  - type: links\r
    items:\r
    - text: scikit-learn 공식 문서\r
      url: https://scikit-learn.org/\r
      icon: 🔗\r
    - text: scikit-learn User Guide\r
      url: https://scikit-learn.org/stable/user_guide.html\r
      icon: 🔗\r
    - text: scikit-learn API Reference\r
      url: https://scikit-learn.org/stable/modules/classes.html\r
      icon: 🔗\r
    - text: scikit-learn Tutorials\r
      url: https://scikit-learn.org/stable/tutorial/index.html\r
      icon: 🔗\r
  goal: 📚 참고 자료에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: next\r
  blocks:\r
  - type: hero\r
    emoji: 👉\r
    title: '다음: 와인 품질 분류'\r
    subtitle: 첫 번째 머신러닝 모델을 만들어봅니다\r
  goal: '다음: 와인 품질 분류에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.'\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
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