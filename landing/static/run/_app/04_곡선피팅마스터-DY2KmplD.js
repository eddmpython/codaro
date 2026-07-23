var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scipy\r
  id: scipy_04\r
  title: 곡선피팅마스터\r
  order: 4\r
  category: scipy\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - scipy.optimize\r
  - curve_fit\r
  - 비선형회귀\r
  - 모델피팅\r
  - 파라미터추정\r
  seo:\r
    title: scipy.optimize curve_fit - 데이터에 곡선 맞추기\r
    description: scipy.optimize의 curve_fit으로 데이터에 수학 함수를 피팅합니다. 지수함수, 로그함수, 다항식 피팅을 배웁니다.\r
    keywords:\r
    - scipy\r
    - curve_fit\r
    - 비선형회귀\r
    - 피팅\r
    - 파라미터추정\r
intro:\r
  emoji: 📐\r
  goal: 스타트업 사용자 증가 데이터를 지수 성장 모델로 피팅하여 미래 사용자를 예측합니다.\r
  description: 스타트업에서 12개월간 사용자 수를 기록했습니다. 이 데이터가 지수 성장을 따르는지 확인하고, 수학 모델 y = a × e^(bx)의 파라미터 a와 b를 찾아\r
    18개월 후 사용자 수를 예측합니다. scipy.optimize.curve_fit은 비선형 최소제곱법으로 데이터에 가장 잘 맞는 곡선의 파라미터를 자동으로 찾아줍니다. 성장률\r
    추정, 모델 검증, 예측까지 전체 워크플로우를 완성합니다.\r
  direction: 곡선피팅마스터에서 수치 데이터를 모델에 넣고 계산 결과와 오차를 검증합니다.\r
  benefits:\r
  - 수치 입력 확인 후 최적화/적분/신호 처리에 맞는 코드 입력을 고릅니다.\r
  - 곡선피팅마스터 결과를 오차와 결과 범위 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 과학 계산 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 및 데이터 로드 입력 확인\r
      detail: 입력 기준(수치 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 데이터 탐색 처리 실행\r
      detail: 최적화/적분/신호 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 지수 성장 모델 정의 결과 검증\r
      detail: 오차와 결과 범위 기준으로 실행 결과를 비교합니다.\r
    - label: 곡선피팅마스터 재사용\r
      detail: 완성 코드를 과학 계산 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 과학 계산 환경\r
      detail: matplotlib, numpy, pandas, scipy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 곡선피팅마스터 실행\r
      detail: 셀을 실행해 오차와 결과 범위와 예외 상태를 확인합니다.\r
    - label: 곡선피팅마스터 완료\r
      detail: 검증된 코드를 과학 계산 루틴로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 및 데이터 로드\r
  structuredPrimary: true\r
  subtitle: scipy.optimize\r
  goal: 라이브러리 및 데이터 로드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    곡선 피팅(Curve Fitting)은 데이터에 가장 잘 맞는 수학 함수의 파라미터를 찾는 과정입니다. 사용자 증가율, 약물 농도 감소, 온도 냉각 등 자연 현상을 수학 모델로 표현하면 미래 예측이 가능해집니다. scipy.optimize.curve_fit은 비선형 함수도 피팅할 수 있어 선형 회귀보다 훨씬 유연합니다. 이 프로젝트에서는 가상의 스타트업 사용자 증가 데이터를 분석합니다.\r
\r
    이 데이터는 y = 1000 × e^(0.15x) + 노이즈로 생성되었습니다. 월 15% 성장률을 가정한 지수 성장 모델입니다. curve_fit이 이 파라미터들을 얼마나 잘 찾아내는지 확인합니다.\r
  tips:\r
  - 이 데이터는 y = 1000 × e^(0.15x) + 노이즈로 생성되었습니다. 월 15% 성장률을 가정한 지수 성장 모델입니다. curve_fit이 이 파라미터들을 얼마나 잘\r
    찾아내는지 확인합니다.\r
  snippet: |-\r
    import scipy\r
\r
    import numpy as np\r
    from scipy import optimize\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    np.random.seed(42)\r
    months = np.arange(1, 13)\r
    users = 1000 * np.exp(0.15 * months) + np.random.normal(0, 200, 12)\r
    users = np.maximum(users, 0).astype(int)\r
  exercise:\r
    prompt: 라이브러리 및 데이터 로드 예제에서 \`months\`, \`users\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import scipy\r
\r
      import numpy as np\r
      from scipy import optimize\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      np.random.seed(42)\r
      months = np.arange(1, 13)\r
      users = 1000 * np.exp(0.15 * months) + np.random.normal(0, 200, 12)\r
      users = np.maximum(users, 0).astype(int)\r
    hints:\r
    - 바꿀 지점은 \`months = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`months\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 라이브러리 및 데이터 로드에서 \`months\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 라이브러리 및 데이터 로드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: explore\r
  title: 데이터 탐색\r
  structuredPrimary: true\r
  subtitle: 성장 패턴 시각화\r
  goal: 데이터 탐색에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    피팅 전에 데이터를 시각화하여 어떤 모델이 적합한지 파악합니다. 사용자 수가 선형으로 증가하는지, 지수적으로 증가하는지에 따라 적용할 함수가 달라집니다. 그래프에서 증가 속도가 점점 빨라지면 지수 성장, 일정하면 선형 성장입니다. 로그 스케일로 그렸을 때 직선이면 지수 성장의 확실한 증거입니다.\r
\r
    로그 스케일에서 거의 직선으로 보이면 지수 성장입니다. log(y) = log(a) + bx 형태가 되어 직선이 됩니다.\r
  snippet: |-\r
    figExplore, (axExplore1, axExplore2) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
    axExplore1.scatter(months, users, s=100, c='blue', label='Actual Users')\r
    axExplore1.set_xlabel('Month')\r
    axExplore1.set_ylabel('Users')\r
    axExplore1.set_title('User Growth (Linear Scale)')\r
    axExplore1.grid(True, alpha=0.3)\r
\r
    axExplore2.scatter(months, users, s=100, c='blue')\r
    axExplore2.set_yscale('log')\r
    axExplore2.set_xlabel('Month')\r
    axExplore2.set_ylabel('Users (log scale)')\r
    axExplore2.set_title('User Growth (Log Scale)')\r
    axExplore2.grid(True, alpha=0.3)\r
    figExplore\r
  exercise:\r
    prompt: 데이터 탐색 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figExplore, (axExplore1, axExplore2) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
      axExplore1.scatter(months, users, s=100, c='blue', label='Actual Users')\r
      axExplore1.set_xlabel('Month')\r
      axExplore1.set_ylabel('Users')\r
      axExplore1.set_title('User Growth (Linear Scale)')\r
      axExplore1.grid(True, alpha=0.3)\r
\r
      axExplore2.scatter(months, users, s=100, c='blue')\r
      axExplore2.set_yscale('log')\r
      axExplore2.set_xlabel('Month')\r
      axExplore2.set_ylabel('Users (log scale)')\r
      axExplore2.set_title('User Growth (Log Scale)')\r
      axExplore2.grid(True, alpha=0.3)\r
      figExplore\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 데이터 탐색의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 데이터 탐색 실행 결과가 오차와 결과 범위 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: define_model\r
  title: 지수 성장 모델 정의\r
  structuredPrimary: true\r
  subtitle: curve_fit용 함수\r
  goal: 지수 성장 모델 정의에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    curve_fit에 사용할 함수를 정의합니다. 함수의 첫 번째 인자는 반드시 독립변수(x)이고, 나머지 인자들이 찾을 파라미터입니다. 지수 성장 모델 y = a × e^(bx)에서 a는 초기 사용자 수, b는 성장률입니다. 함수는 numpy 배열을 입력받아 numpy 배열을 반환해야 합니다.\r
\r
    def expGrowth(x, a, b)에서 x는 독립변수, a와 b가 curve_fit이 최적화할 파라미터입니다. 파라미터 수는 제한이 없습니다.\r
  snippet: |-\r
    def expGrowth(x, a, b):\r
        return a * np.exp(b * x)\r
  exercise:\r
    prompt: 지수 성장 모델 정의 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def expGrowth(x, a, b):\r
          return a * np.exp(b * x)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 지수 성장 모델 정의의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 지수 성장 모델 정의 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: fitting\r
  title: 곡선 피팅 실행\r
  structuredPrimary: true\r
  subtitle: curve_fit\r
  goal: 곡선 피팅 실행에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    curve_fit(함수, x데이터, y데이터)를 호출하면 최적 파라미터와 공분산 행렬을 반환합니다. p0 인자로 초기 추정값을 제공하면 수렴이 빠르고 안정적입니다. 비선형 최적화는 초기값에 따라 결과가 달라질 수 있으므로, 도메인 지식을 활용하여 합리적인 초기값을 설정하는 것이 중요합니다.\r
\r
    p0=[1000, 0.1]은 '초기 사용자 약 1000명, 월 10% 성장률'이라는 초기 추정입니다. curve_fit은 이 값에서 시작하여 최적값을 찾습니다.\r
  snippet: |-\r
    params, covariance = optimize.curve_fit(expGrowth, months, users, p0=[1000, 0.1])\r
    aFit, bFit = params\r
    aFit, bFit\r
  exercise:\r
    prompt: 곡선 피팅 실행 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      params, covariance = optimize.curve_fit(expGrowth, months, users, p0=[1000, 0.1])\r
      aFit, bFit = params\r
      aFit, bFit\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 곡선 피팅 실행의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 곡선 피팅 실행 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: validate\r
  title: 피팅 검증\r
  structuredPrimary: true\r
  subtitle: R² 및 잔차 분석\r
  goal: 피팅 검증에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    피팅 품질을 평가하기 위해 R²(결정계수)와 잔차를 분석합니다. R²는 0~1 사이 값으로, 1에 가까울수록 모델이 데이터를 잘 설명합니다. 잔차(실제값 - 예측값)가 무작위로 분포하면 좋은 모델이고, 패턴이 있으면 모델이 데이터의 특성을 놓치고 있다는 의미입니다.\r
\r
    잔차가 0 주위에 무작위로 분포하고 특별한 패턴이 없으면 모델이 적합합니다. 잔차에 곡선 패턴이 있으면 모델을 변경해야 합니다.\r
  snippet: |-\r
    usersPred = expGrowth(months, aFit, bFit)\r
    ssRes = np.sum((users - usersPred) ** 2)\r
    ssTot = np.sum((users - np.mean(users)) ** 2)\r
    rSquared = 1 - (ssRes / ssTot)\r
    rSquared\r
  exercise:\r
    prompt: 피팅 검증 예제에서 \`usersPred\`, \`ssRes\`, \`ssTot\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      usersPred = expGrowth(months, aFit, bFit)\r
      ssRes = np.sum((users - usersPred) ** 2)\r
      ssTot = np.sum((users - np.mean(users)) ** 2)\r
      rSquared = 1 - (ssRes / ssTot)\r
      rSquared\r
    hints:\r
    - 바꿀 지점은 \`usersPred = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`usersPred\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 피팅 검증에서 \`usersPred\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 피팅 검증 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: predict\r
  title: 미래 예측\r
  structuredPrimary: true\r
  subtitle: 18개월 후 사용자\r
  goal: 미래 예측에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 피팅된 모델로 미래 사용자 수를 예측합니다. 단, 외삽(데이터 범위 밖 예측)은 불확실성이 크므로 주의해야 합니다. 파라미터의 표준오차를 이용하여 예측의 신뢰구간도\r
    계산합니다. 공분산 행렬의 대각 원소 제곱근이 각 파라미터의 표준오차입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    futureMonths = np.arange(1, 19)\r
    futureUsers = expGrowth(futureMonths, aFit, bFit)\r
\r
    predDf = pd.DataFrame({\r
        'Month': [12, 15, 18],\r
        'Predicted Users': [int(expGrowth(12, aFit, bFit)), int(expGrowth(15, aFit, bFit)), int(expGrowth(18, aFit, bFit))]\r
    })\r
    predDf\r
  exercise:\r
    prompt: 미래 예측 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      futureMonths = np.arange(1, 19)\r
      futureUsers = expGrowth(futureMonths, aFit, bFit)\r
\r
      predDf = pd.DataFrame({\r
          'Month': [12, 15, 18],\r
          'Predicted Users': [int(expGrowth(12, aFit, bFit)), int(expGrowth(15, aFit, bFit)), int(expGrowth(18, aFit, bFit))]\r
      })\r
      predDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 미래 예측의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 미래 예측의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: result\r
  title: 최종 분석 보고서\r
  structuredPrimary: true\r
  subtitle: 성장률 및 예측 요약\r
  goal: 최종 분석 보고서에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 곡선 피팅 결과를 종합하여 비즈니스 인사이트를 도출합니다. 월별 성장률, 배증 시간(사용자가 2배가 되는 기간), 연간 성장률 등을 계산합니다. 이러한 지표는\r
    투자자 보고, 사업 계획, 인프라 확장 계획에 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    monthlyGrowthRate = bFit\r
    doublingTime = np.log(2) / bFit\r
    annualGrowthRate = (np.exp(bFit * 12) - 1) * 100\r
\r
    growthDf = pd.DataFrame({\r
        'Metric': ['Monthly Growth Rate', 'Doubling Time', 'Annual Growth Rate', 'Initial Users (a)', 'R² Score'],\r
        'Value': [f'{monthlyGrowthRate*100:.1f}%', f'{doublingTime:.1f} months', f'{annualGrowthRate:.0f}%', f'{aFit:.0f}', f'{rSquared:.4f}']\r
    })\r
    growthDf\r
  exercise:\r
    prompt: 최종 분석 보고서 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      monthlyGrowthRate = bFit\r
      doublingTime = np.log(2) / bFit\r
      annualGrowthRate = (np.exp(bFit * 12) - 1) * 100\r
\r
      growthDf = pd.DataFrame({\r
          'Metric': ['Monthly Growth Rate', 'Doubling Time', 'Annual Growth Rate', 'Initial Users (a)', 'R² Score'],\r
          'Value': [f'{monthlyGrowthRate*100:.1f}%', f'{doublingTime:.1f} months', f'{annualGrowthRate:.0f}%', f'{aFit:.0f}', f'{rSquared:.4f}']\r
      })\r
      growthDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 최종 분석 보고서의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 최종 분석 보고서의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 곡선 피팅 프로젝트\r
  goal: 실습에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 curve_fit, 파라미터 해석, R² 계산, 예측을 활용하여 다양한 현상을 모델링합니다. 미션1은 배터리 방전 곡선(지수 감쇠), 미션2는 로지스틱 성장 모델(S자 곡선)입니다. 각 미션은 함수 정의, 피팅, 검증, 시각화를 포함합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import numpy as np\r
    from scipy import optimize\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    def batteryDecay(t, v0, tau, vMin):\r
        return (v0 - vMin) * np.exp(-t / tau) + vMin\r
\r
    np.random.seed(222)\r
    hours = np.arange(0, 25, 2)\r
    voltage = (4.2 - 3.0) * np.exp(-hours / 10) + 3.0 + np.random.normal(0, 0.05, len(hours))\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from scipy import optimize\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      def batteryDecay(t, v0, tau, vMin):\r
          return (v0 - vMin) * np.exp(-t / tau) + vMin\r
\r
      np.random.seed(222)\r
      hours = np.arange(0, 25, 2)\r
      voltage = (4.2 - 3.0) * np.exp(-hours / 10) + 3.0 + np.random.normal(0, 0.05, len(hours))\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 실습 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: 업무 흐름 검증\r
  structuredPrimary: true\r
  subtitle: SLA 지연시간 통계 게이트\r
  goal: 업무 흐름 검증에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: SciPy는 공식을 호출하는 연습만으로는 부족합니다. 업무에서는 측정값이 분석 가능한지 먼저 검증하고, 기준값을 넘는지 통계 검정으로 확인한 뒤, 보고 가능한\r
    신뢰구간과 개선 기준을 함께 제시해야 합니다. 아래 흐름은 API 지연시간이 SLA 기준을 넘는지 판단하고, 기준을 바꾸는 변주까지 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import numpy as np\r
    from scipy import optimize, stats\r
\r
    latencySamples = np.array([245, 260, 255, 271, 268, 290, 276, 263, 282, 274, 269, 258], dtype=float)\r
\r
    def validateLatencySamples(samples):\r
        values = np.asarray(samples, dtype=float)\r
        if values.size < 5:\r
            raise ValueError("통계 검정에는 최소 5개 이상의 측정값이 필요합니다.")\r
        if not np.isfinite(values).all():\r
            raise ValueError("지연시간 샘플에는 결측값이나 무한대가 없어야 합니다.")\r
        if (values <= 0).any():\r
            raise ValueError("지연시간은 0보다 커야 합니다.")\r
        return values\r
\r
    cleanLatency = validateLatencySamples(latencySamples)\r
    cleanLatency.mean(), cleanLatency.std(ddof=1)\r
  exercise:\r
    prompt: 업무 흐름 검증 예제에서 기대 문자열이나 실제 출력 문구를 바꾸고 assert 비교가 맞는지 확인하세요.\r
    starterCode: |-\r
      allowedMean = 264\r
      capThreshold = optimize.brentq(\r
          lambda threshold: np.clip(cleanLatency, None, threshold).mean() - allowedMean,\r
          cleanLatency.min(),\r
          cleanLatency.max(),\r
      )\r
      cappedMean = np.clip(cleanLatency, None, capThreshold).mean()\r
\r
      assert abs(cappedMean - allowedMean) < 1e-6\r
      {\r
          "allowedMean": allowedMean,\r
          "capThreshold": round(float(capThreshold), 2),\r
          "cappedMean": round(float(cappedMean), 2),\r
      }\r
    solution: |-\r
      import numpy as np\r
      from scipy import optimize, stats\r
\r
      latencySamples = np.array([245, 260, 255, 271, 268, 290, 276, 263, 282, 274, 269, 258], dtype=float)\r
\r
      def validateLatencySamples(samples):\r
          values = np.asarray(samples, dtype=float)\r
          if values.size < 5:\r
              raise ValueError("통계 검정에는 최소 5개 이상의 측정값이 필요합니다.")\r
          if not np.isfinite(values).all():\r
              raise ValueError("지연시간 샘플에는 결측값이나 무한대가 없어야 합니다.")\r
          if (values <= 0).any():\r
              raise ValueError("지연시간은 0보다 커야 합니다.")\r
          return values\r
\r
      cleanLatency = validateLatencySamples(latencySamples)\r
      cleanLatency.mean(), cleanLatency.std(ddof=1)\r
    hints:\r
    - 바꿀 지점은 expected 값과 실제 print()/계산 호출입니다.\r
    - 실행 뒤 기대값과 실제 결과가 같을 때만 검증이 통과하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 업무 흐름 검증에서 \`allowedMean\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 업무 흐름 검증에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.\r
`;export{e as default};