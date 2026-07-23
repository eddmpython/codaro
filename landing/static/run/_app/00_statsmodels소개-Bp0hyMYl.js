var e=`meta:\r
  packages:\r
  - pandas\r
  - scipy\r
  - statsmodels\r
  id: statsmodels_00\r
  title: statsmodels소개\r
  order: 0\r
  category: statsmodels\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - statsmodels\r
  - 통계분석\r
  - 회귀분석\r
  - 시계열\r
  - 가설검정\r
  seo:\r
    title: statsmodels 입문 - Python 통계 분석의 표준\r
    description: statsmodels로 회귀분석, 시계열, 가설검정을 시작하세요. R 수준의 통계 분석을 Python에서 수행할 수 있습니다.\r
    keywords:\r
    - statsmodels\r
    - 통계분석\r
    - 회귀분석\r
    - 시계열\r
    - OLS\r
    - ARIMA\r
intro:\r
  direction: statsmodels소개에서 입력, 처리, 검증을 하나의 실행 가능한 코드 흐름으로 연결합니다.\r
  benefits:\r
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.\r
  - 입력 데이터 확인 후 핵심 처리에 맞는 코드 입력을 고릅니다.\r
  - statsmodels소개 결과를 출력과 상태 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 업무 자동화 조각에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 업무 흐름 검증 입력 확인\r
      detail: 입력 기준(입력 데이터)과 필요한 조건을 먼저 고정합니다.\r
    - label: 핵심 처리 처리 실행\r
      detail: 핵심 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 출력과 상태 결과 검증\r
      detail: 출력과 상태 기준으로 실행 결과를 비교합니다.\r
    - label: statsmodels소개 재사용\r
      detail: 완성 코드를 업무 자동화 조각에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 업무 코드 환경\r
      detail: pandas, scipy, statsmodels 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: statsmodels소개 실행\r
      detail: 셀을 실행해 출력과 상태와 예외 상태를 확인합니다.\r
    - label: statsmodels소개 완료\r
      detail: 검증된 코드를 업무 자동화 조각로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 📊\r
    title: statsmodels란?\r
    subtitle: Python 통계 분석의 대표 외부 패키지\r
  - type: hero\r
    emoji: 🔬\r
    title: 통계적 추론을 위한 라이브러리\r
    subtitle: 예측이 아닌 이해를 위한 분석\r
    points:\r
    - emoji: 📈\r
      title: 회귀분석에 특화\r
    - emoji: 📉\r
      title: 시계열 모델링\r
    - emoji: 🧪\r
      title: 가설 검정\r
    - emoji: 📊\r
      title: R 수준의 통계량\r
  goal: statsmodels란?에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: what_is_statsmodels\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤔 statsmodels가 뭔가요?\r
    subtitle: 통계적 추론을 위한 도구\r
  - type: note\r
    style: info\r
    title: 예측 vs 추론\r
    content: 머신러닝(sklearn)은 "예측"에 집중합니다. 미래 값을 맞추는 것이 목표입니다. 하지만 statsmodels는 "이해"에 집중합니다. "왜 이런 결과가 나왔는가?",\r
      "이 변수는 통계적으로 유의미한가?"를 답합니다. p-value, 신뢰구간, R² 같은 통계량으로 데이터의 본질을 파악합니다. 비즈니스 의사결정에서는 예측만큼이나 이해가 중요합니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 📐\r
      title: OLS 회귀분석\r
      description: 최소제곱법으로 변수 간 관계 분석\r
    - emoji: 🎯\r
      title: 통계적 유의성\r
      description: p-value, t-검정, F-검정\r
    - emoji: 📊\r
      title: 모델 진단\r
      description: 잔차 분석, 이상치 탐지\r
    - emoji: ⏱️\r
      title: 시계열 분석\r
      description: ARIMA, 계절성 분해\r
  goal: 🤔 statsmodels가 뭔가요?에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: why_statsmodels\r
  blocks:\r
  - type: sectionHeader\r
    title: 🌟 왜 statsmodels가 필요한가요?\r
    subtitle: sklearn과의 차이\r
  - type: note\r
    style: info\r
    title: sklearn vs statsmodels\r
    content: sklearn의 LinearRegression은 계수만 반환합니다. 하지만 statsmodels의 OLS는 p-value, R², 표준오차, 신뢰구간, F-통계량\r
      등 30개 이상의 통계량을 제공합니다. "이 변수가 정말 중요한가?"를 판단할 수 있습니다. 논문, 리포트, 비즈니스 분석에서는 이런 통계적 근거가 필수입니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 📋\r
      title: 상세한 summary\r
      description: R과 동일한 수준의 통계 리포트\r
    - emoji: 🔍\r
      title: 잔차 진단\r
      description: 정규성, 등분산성, 자기상관 검정\r
    - emoji: 📊\r
      title: 회귀 종류 다양\r
      description: OLS, Logit, Probit, GLM, Robust\r
    - emoji: ⏰\r
      title: 시계열 특화\r
      description: ARIMA, SARIMA, VAR, 상태공간\r
    - emoji: 🧮\r
      title: 가설 검정 도구\r
      description: t-test, ANOVA, chi-square, 정규성 검정\r
    - emoji: 📈\r
      title: 비즈니스 활용\r
      description: 매출 예측, A/B 테스트, 인과 분석\r
  goal: 🌟 왜 statsmodels가 필요한가요?에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: statsmodels_vs_others\r
  blocks:\r
  - type: sectionHeader\r
    title: 🆚 statsmodels vs 다른 라이브러리\r
    subtitle: 언제 무엇을 쓸까?\r
  - type: compare\r
    left:\r
      title: sklearn\r
      subtitle: 머신러닝, 예측\r
      icon: 🤖\r
      color: blue\r
      items:\r
      - 예측 정확도 최우선\r
      - 복잡한 모델 (RandomForest, XGBoost)\r
      - 교차검증, 하이퍼파라미터 튜닝\r
      - 통계량 최소\r
      - 프로덕션 배포\r
      infoBox: 미래 값을 맞추는 것이 목표\r
    right:\r
      title: statsmodels\r
      subtitle: 통계 분석, 추론\r
      icon: 📊\r
      color: green\r
      items:\r
      - 통계적 유의성 최우선\r
      - 단순하고 해석 가능한 모델\r
      - p-value, 신뢰구간, R²\r
      - 통계량 30개 이상\r
      - 리포트, 논문 작성\r
      infoBox: 왜 이런 결과인지 이해하는 것이 목표\r
  - type: compare\r
    left:\r
      title: scipy.stats\r
      subtitle: 기본 통계\r
      icon: 🔢\r
      color: purple\r
      items:\r
      - t-test, chi-square 등 개별 검정\r
      - 확률분포 계산\r
      - 기술통계량\r
      - 단순 함수 호출\r
      infoBox: 기본 통계 계산용\r
    right:\r
      title: statsmodels\r
      subtitle: 고급 통계 모델\r
      icon: 📊\r
      color: green\r
      items:\r
      - 회귀 모델 종합 분석\r
      - 시계열 예측\r
      - 모델 진단 도구\r
      - 객체지향 API\r
      infoBox: 복잡한 통계 모델링용\r
  - type: note\r
    style: tip\r
    title: 용도별 선택 가이드\r
    content: 예측 정확도가 중요하면 sklearn, 통계적 근거가 필요하면 statsmodels를 사용하세요. 비즈니스 리포트에서 "광고비가 매출에 미치는 영향이 통계적으로\r
      유의미한가?"를 증명하려면 statsmodels의 p-value가 필수입니다. 반대로 "내일 매출을 최대한 정확히 예측"하려면 sklearn의 앙상블 모델이 좋습니다.\r
  goal: 🆚 statsmodels vs 다른 라이브러리에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: core_concepts\r
  blocks:\r
  - type: sectionHeader\r
    title: 🧩 핵심 개념\r
    subtitle: statsmodels로 무엇을 할 수 있나요?\r
  - type: featureCards\r
    cards:\r
    - emoji: 1️⃣\r
      title: 단순선형회귀 (OLS)\r
      description: 한 변수로 다른 변수 예측. y = a + bx\r
    - emoji: 2️⃣\r
      title: 다중회귀\r
      description: 여러 변수로 예측. y = a + b₁x₁ + b₂x₂ + ...\r
    - emoji: 3️⃣\r
      title: 로지스틱 회귀\r
      description: 확률 예측. 이탈/비이탈, 구매/미구매\r
    - emoji: 4️⃣\r
      title: 시계열 분해\r
      description: 추세, 계절성, 잔차로 분리\r
    - emoji: 5️⃣\r
      title: ARIMA\r
      description: 과거 패턴으로 미래 예측\r
    - emoji: 6️⃣\r
      title: 가설 검정\r
      description: t-test, ANOVA, chi-square\r
  goal: 🧩 핵심 개념에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: workflow\r
  blocks:\r
  - type: sectionHeader\r
    title: 🔄 statsmodels 분석 흐름\r
    subtitle: 데이터에서 인사이트까지\r
  - type: note\r
    style: info\r
    title: 전형적인 분석 단계\r
    content: |-\r
      1. 데이터 준비: pandas로 전처리\r
      2. 모델 정의: sm.OLS(y, X), sm.Logit(y, X) 등\r
      3. 학습: .fit()으로 모델 추정\r
      4. 평가: .summary()로 통계량 확인\r
      5. 진단: 잔차 분석, 정규성 검정\r
      6. 예측: .predict()로 미래 값 계산\r
      7. 해석: p-value, 계수로 의사결정\r
  - type: featureCards\r
    cards:\r
    - emoji: 📦\r
      title: 1. 데이터 로드\r
      description: loadLocalDataset()과 pandas로 데이터 준비\r
    - emoji: 🔧\r
      title: 2. 전처리\r
      description: 결측치 처리, 더미 변수 생성\r
    - emoji: 📐\r
      title: 3. 모델 정의\r
      description: sm.OLS(y, X), sm.add_constant(X)\r
    - emoji: 🎯\r
      title: 4. 모델 학습\r
      description: .fit()으로 계수 추정\r
    - emoji: 📊\r
      title: 5. 결과 확인\r
      description: .summary() 통계량 분석\r
    - emoji: 🔍\r
      title: 6. 진단\r
      description: 잔차 플롯, 정규성 검정\r
  goal: 🔄 statsmodels 분석 흐름에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: key_outputs\r
  blocks:\r
  - type: sectionHeader\r
    title: 📋 주요 출력물\r
    subtitle: statsmodels가 제공하는 정보\r
  - type: table\r
    headers:\r
    - 통계량\r
    - 의미\r
    - 해석\r
    rows:\r
    - - R²\r
      - 결정계수, 모델 설명력\r
      - 0~1 사이, 1에 가까울수록 좋음\r
    - - p-value\r
      - 통계적 유의성\r
      - < 0.05면 유의미\r
    - - coef\r
      - 회귀 계수 (기울기)\r
      - 변수 1 증가시 y 변화량\r
    - - std err\r
      - 표준오차\r
      - 계수 추정의 불확실성\r
    - - t\r
      - t-통계량\r
      - 계수 / 표준오차\r
    - - F-statistic\r
      - 모델 전체 유의성\r
      - p-value가 낮으면 모델 유의미\r
    - - AIC/BIC\r
      - 모델 선택 기준\r
      - 낮을수록 좋은 모델\r
  - type: note\r
    style: tip\r
    title: p-value 해석\r
    content: p-value < 0.05는 "이 변수가 우연히 이런 관계를 보일 확률이 5% 미만"이라는 뜻입니다. 즉 통계적으로 유의미한 관계입니다. p-value < 0.01이면\r
      더 강력한 증거입니다. 비즈니스 의사결정에서 "광고비를 늘려야 할까?"를 판단할 때 p-value가 근거가 됩니다.\r
  goal: 📋 주요 출력물에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: use_cases\r
  blocks:\r
  - type: sectionHeader\r
    title: 💼 실전 활용 사례\r
    subtitle: statsmodels로 해결하는 비즈니스 문제\r
  - type: featureCards\r
    cards:\r
    - emoji: 📺\r
      title: 마케팅 ROI 분석\r
      description: 광고비가 매출에 미치는 영향 정량화\r
    - emoji: 🏠\r
      title: 가격 책정 전략\r
      description: 부동산, 보험료 등 가격 결정 요인 분석\r
    - emoji: 👥\r
      title: 고객 이탈 예측\r
      description: 어떤 요인이 이탈에 영향을 미치는지 파악\r
    - emoji: 📈\r
      title: 매출 예측\r
      description: 시계열 데이터로 다음 분기 매출 예상\r
    - emoji: 🧪\r
      title: A/B 테스트 검정\r
      description: 두 그룹 간 차이가 유의미한지 통계 검정\r
    - emoji: 👔\r
      title: HR 분석\r
      description: 퇴사 요인, 급여 결정 요인 분석\r
  goal: 💼 실전 활용 사례에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
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
      - 광고비 매출 예측\r
      - 단순회귀, summary, R²\r
      - 마케팅 ROI 최적화\r
    - - 입문\r
      - 부동산 가격 예측\r
      - 다중회귀, 잔차분석\r
      - 부동산 가격 책정\r
    - - 기초\r
      - 매출 다중요인 분석\r
      - VIF, 다중공선성\r
      - 매출 드라이버 파악\r
    - - 기초\r
      - 보험료 가격책정\r
      - 더미 변수, 범주형\r
      - 보험 상품 가격 책정\r
    - - 기초\r
      - 고객 이탈 예측\r
      - 로지스틱 회귀, ROC\r
      - 고객 유지 전략\r
    - - 중급\r
      - 항공 수요 시계열\r
      - 시계열 분해, 계절성\r
      - 항공사 용량 계획\r
    - - 중급\r
      - 월마트 매출 예측\r
      - 외생변수, SARIMA\r
      - 소매 수요 예측\r
    - - 중급\r
      - 직원 퇴사 예측\r
      - 가설 검정, t-test\r
      - 인재 유지, 채용 계획\r
    - - 심화\r
      - 자전거 수요 ARIMA\r
      - ARIMA, ACF, PACF\r
      - 자전거 배치 최적화\r
    - - 심화\r
      - 경제지표 종합분석\r
      - VAR, 모든 개념 종합\r
      - 경제 예측, 정책 분석\r
  - type: note\r
    style: info\r
    title: 프로젝트 기반 학습\r
    content: 각 프로젝트는 실제 비즈니스 문제를 해결합니다. 단순히 문법을 배우는 것이 아니라, "광고비를 얼마나 늘려야 할까?", "고객 이탈을 줄이려면 어떤 요인을 개선해야\r
      할까?" 같은 실전 질문에 답합니다. 10개 프로젝트를 완료하면 데이터로 비즈니스 의사결정을 지원할 수 있는 역량을 갖추게 됩니다.\r
  goal: 🗺️ 앞으로 배울 내용에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: statsmodels_vs_r\r
  blocks:\r
  - type: sectionHeader\r
    title: 🔄 R 사용자를 위한 안내\r
    subtitle: R에서 Python으로\r
  - type: note\r
    style: info\r
    title: R과의 호환성\r
    content: statsmodels는 R의 통계 모델을 Python에 구현한 것입니다. lm(), glm(), arima()와 유사한 API를 제공하며, summary() 출력도\r
      거의 동일합니다. R 경험자라면 쉽게 적응할 수 있습니다. 차이점은 R은 함수형, statsmodels는 객체지향이라는 점입니다.\r
  - type: table\r
    headers:\r
    - R\r
    - statsmodels\r
    - 설명\r
    rows:\r
    - - lm(y ~ x, data)\r
      - sm.OLS(y, sm.add_constant(X)).fit()\r
      - 선형회귀\r
    - - glm(..., family=binomial)\r
      - sm.Logit(y, X).fit()\r
      - 로지스틱 회귀\r
    - - summary(model)\r
      - model.summary()\r
      - 모델 요약\r
    - - predict(model, newdata)\r
      - model.predict(new_X)\r
      - 예측\r
    - - arima(y, order=c(1,0,1))\r
      - sm.tsa.ARIMA(y, order=(1,0,1)).fit()\r
      - ARIMA\r
  goal: 🔄 R 사용자를 위한 안내에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: package_ready\r
  blocks:\r
  - type: sectionHeader\r
    title: 📦 준비 확인과 시작\r
    subtitle: Codaro 로컬 Python 환경에서 바로 사용\r
  - type: note\r
    style: info\r
    title: 로컬에서 바로 실행\r
    content: 이 강의는 Codaro 로컬 Python 환경에서 실행됩니다. 필요한 패키지는 YAML meta.packages와 프로젝트 의존성 기준으로 uv가 준비하고, 레슨\r
      안에서는 import가 성공하는지 확인합니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🌐\r
      title: Codaro 로컬 Python 환경\r
      description: 로컬 Python 실행\r
    - emoji: 📦\r
      title: 패키지 준비\r
      description: meta.packages 기준 uv run\r
    - emoji: 🚀\r
      title: 바로 시작\r
      description: import statsmodels.api as sm\r
  goal: 📦 준비 확인과 시작에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: resources\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 참고 자료\r
    subtitle: 더 깊이 공부하고 싶다면\r
  - type: links\r
    items:\r
    - text: statsmodels 공식 문서\r
      url: https://www.statsmodels.org/\r
      icon: 🔗\r
    - text: statsmodels API Reference\r
      url: https://www.statsmodels.org/stable/api.html\r
      icon: 🔗\r
    - text: statsmodels Examples\r
      url: https://www.statsmodels.org/stable/examples/index.html\r
      icon: 🔗\r
  goal: 📚 참고 자료에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: next\r
  blocks:\r
  - type: hero\r
    emoji: 👉\r
    title: '다음: 광고비 매출 예측'\r
    subtitle: 단순선형회귀로 첫 번째 통계 모델을 만들어봅니다\r
  goal: '다음: 광고비 매출 예측에서 입력 데이터을 바꿨을 때 출력과 상태가 어떻게 달라지는지 확인한다.'\r
  why: 작게 실행하고 검증하는 흐름은 코드를 업무에 가져가기 위한 기본 조건입니다.\r
- id: workflow_validation\r
  title: 업무 흐름 검증\r
  structuredPrimary: true\r
  subtitle: 회귀 리포트 품질 게이트\r
  goal: 업무 흐름 검증에서 핵심 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: statsmodels 학습의 핵심은 모델을 만들고 summary를 보는 데서 끝나지 않는 것입니다. 먼저 어떤 변수가 유의할지 예측하고, 로컬 데이터의 컬럼과\r
    결측치를 검증하고, 회귀 결과가 보고서에 들어갈 수준인지 R², F-test, 잔차 진단으로 확인해야 합니다. 마지막에는 변수를 빼는 변주로 모델 선택의 근거를 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import pandas as pd\r
    import statsmodels.api as sm\r
    from statsmodels.stats.diagnostic import het_breuschpagan\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    marketingData = loadLocalDataset("advertising")\r
    requiredColumns = ["TV", "Radio", "Newspaper", "Sales"]\r
\r
    missingColumns = [column for column in requiredColumns if column not in marketingData.columns]\r
    if missingColumns:\r
        raise ValueError(f"필수 컬럼이 없습니다: {missingColumns}")\r
    if marketingData[requiredColumns].isna().any().any():\r
        raise ValueError("회귀분석 전 결측치를 처리해야 합니다.")\r
\r
    reportY = marketingData["Sales"]\r
    reportX = sm.add_constant(marketingData[["TV", "Radio", "Newspaper"]])\r
    reportModel = sm.OLS(reportY, reportX).fit()\r
\r
    marketingData[requiredColumns].head()\r
  exercise:\r
    prompt: 업무 흐름 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      compactX = sm.add_constant(marketingData[["TV", "Radio"]])\r
      compactModel = sm.OLS(reportY, compactX).fit()\r
      r2Drop = reportModel.rsquared - compactModel.rsquared\r
\r
      assert compactModel.rsquared >= 0.95\r
      {\r
          "fullR2": round(reportModel.rsquared, 3),\r
          "compactR2": round(compactModel.rsquared, 3),\r
          "r2Drop": round(r2Drop, 3),\r
          "fullAIC": round(reportModel.aic, 1),\r
          "compactAIC": round(compactModel.aic, 1),\r
      }\r
    solution: |-\r
      import pandas as pd\r
      import statsmodels.api as sm\r
      from statsmodels.stats.diagnostic import het_breuschpagan\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      marketingData = loadLocalDataset("advertising")\r
      requiredColumns = ["TV", "Radio", "Newspaper", "Sales"]\r
\r
      missingColumns = [column for column in requiredColumns if column not in marketingData.columns]\r
      if missingColumns:\r
          raise ValueError(f"필수 컬럼이 없습니다: {missingColumns}")\r
      if marketingData[requiredColumns].isna().any().any():\r
          raise ValueError("회귀분석 전 결측치를 처리해야 합니다.")\r
\r
      marketingData[requiredColumns].head()\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 업무 흐름 검증에서 \`compactX\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 업무 흐름 검증에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
`;export{e as default};