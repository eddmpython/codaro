var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scipy\r
  id: scipy_05\r
  title: 정규성검정기\r
  order: 5\r
  category: scipy\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - scipy.stats\r
  - 정규성검정\r
  - shapiro\r
  - normaltest\r
  - QQ플롯\r
  seo:\r
    title: scipy.stats 정규성 검정 - 데이터가 정규분포인지 확인하기\r
    description: scipy.stats로 데이터의 정규성을 검정합니다. Shapiro-Wilk, D'Agostino, QQ 플롯을 배웁니다.\r
    keywords:\r
    - scipy\r
    - 정규성검정\r
    - shapiro\r
    - normaltest\r
    - 가설검정\r
intro:\r
  emoji: 🔔\r
  goal: 고객 구매액 데이터가 정규분포를 따르는지 검정하고, 적절한 분석 방법을 선택합니다.\r
  description: t-검정, ANOVA, 회귀분석 등 많은 통계 기법은 데이터가 정규분포를 따른다고 가정합니다. 가정이 충족되지 않으면 결과의 신뢰성이 떨어집니다. 이 프로젝트에서는\r
    고객 구매액 데이터의 정규성을 다양한 방법으로 검정합니다. Shapiro-Wilk 검정, D'Agostino-Pearson 검정, QQ 플롯, 왜도/첨도 분석을 수행하고, 정규성이\r
    충족되지 않으면 로그 변환이나 Box-Cox 변환으로 정규화하는 방법을 배웁니다.\r
  direction: 정규성검정기에서 수치 데이터를 모델에 넣고 계산 결과와 오차를 검증합니다.\r
  benefits:\r
  - 수치 입력 확인 후 최적화/적분/신호 처리에 맞는 코드 입력을 고릅니다.\r
  - 정규성검정기 결과를 오차와 결과 범위 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 과학 계산 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 및 데이터 로드 입력 확인\r
      detail: 입력 기준(수치 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 데이터 탐색 처리 실행\r
      detail: 최적화/적분/신호 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: ShapiroWilk 검정 결과 검증\r
      detail: 오차와 결과 범위 기준으로 실행 결과를 비교합니다.\r
    - label: 정규성검정기 재사용\r
      detail: 완성 코드를 과학 계산 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 과학 계산 환경\r
      detail: matplotlib, numpy, pandas, scipy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 정규성검정기 실행\r
      detail: 셀을 실행해 오차와 결과 범위와 예외 상태를 확인합니다.\r
    - label: 정규성검정기 완료\r
      detail: 검증된 코드를 과학 계산 루틴로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 및 데이터 로드\r
  structuredPrimary: true\r
  subtitle: scipy.stats\r
  goal: 라이브러리 및 데이터 로드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    정규성 검정은 데이터가 정규분포(종 모양 곡선)를 따르는지 확인하는 통계적 절차입니다. scipy.stats는 여러 정규성 검정 함수를 제공합니다. Shapiro-Wilk는 소표본에 강력하고, D'Agostino-Pearson은 왜도와 첨도를 기반으로 합니다. 실제 비즈니스 데이터는 정규분포를 따르지 않는 경우가 많으므로, 검정과 변환 기법을 모두 익혀야 합니다.\r
\r
    normalData는 정규분포에서 생성, purchaseData는 로그정규분포에서 생성했습니다. 로그정규분포는 금액, 소득, 도시 인구 등 오른쪽으로 치우친 데이터에서 흔히 나타납니다.\r
  snippet: |-\r
    import scipy\r
\r
    import numpy as np\r
    from scipy import stats\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    np.random.seed(42)\r
    normalData = np.random.normal(loc=50, scale=10, size=100)\r
    purchaseData = np.random.lognormal(mean=4, sigma=1, size=150)\r
  exercise:\r
    prompt: 라이브러리 및 데이터 로드 예제에서 \`normalData\`, \`purchaseData\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import scipy\r
\r
      import numpy as np\r
      from scipy import stats\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      np.random.seed(42)\r
      normalData = np.random.normal(loc=50, scale=10, size=100)\r
      purchaseData = np.random.lognormal(mean=4, sigma=1, size=150)\r
    hints:\r
    - 바꿀 지점은 \`normalData = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`normalData\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 라이브러리 및 데이터 로드에서 \`normalData\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 라이브러리 및 데이터 로드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: explore\r
  title: 데이터 탐색\r
  structuredPrimary: true\r
  subtitle: 분포 시각화\r
  goal: 데이터 탐색에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    정규성 검정 전에 히스토그램과 기술통계량으로 분포 형태를 파악합니다. 정규분포는 종 모양으로 대칭이고, 평균 주위에 데이터가 집중됩니다. 비정규분포는 한쪽으로 치우치거나 여러 개의 봉우리가 있을 수 있습니다. 시각적 탐색은 검정 결과를 해석하는 데 도움이 됩니다.\r
\r
    정규분포는 평균 ≈ 중앙값, 왜도 ≈ 0, 첨도 ≈ 0입니다. 구매액 데이터는 평균 > 중앙값이고 왜도가 양수로, 오른쪽으로 치우쳐 있습니다.\r
  snippet: |-\r
    figExplore, (axExplore1, axExplore2) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
    axExplore1.hist(normalData, bins=20, color='steelblue', edgecolor='white', alpha=0.7)\r
    axExplore1.set_xlabel('Value')\r
    axExplore1.set_ylabel('Frequency')\r
    axExplore1.set_title(f'Normal Data (n={len(normalData)})')\r
    axExplore1.grid(True, alpha=0.3)\r
\r
    axExplore2.hist(purchaseData, bins=30, color='coral', edgecolor='white', alpha=0.7)\r
    axExplore2.set_xlabel('Purchase Amount ($)')\r
    axExplore2.set_ylabel('Frequency')\r
    axExplore2.set_title(f'Purchase Data (n={len(purchaseData)})')\r
    axExplore2.grid(True, alpha=0.3)\r
    figExplore\r
  exercise:\r
    prompt: 데이터 탐색 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figExplore, (axExplore1, axExplore2) = plt.subplots(1, 2, figsize=(14, 5))\r
\r
      axExplore1.hist(normalData, bins=20, color='steelblue', edgecolor='white', alpha=0.7)\r
      axExplore1.set_xlabel('Value')\r
      axExplore1.set_ylabel('Frequency')\r
      axExplore1.set_title(f'Normal Data (n={len(normalData)})')\r
      axExplore1.grid(True, alpha=0.3)\r
\r
      axExplore2.hist(purchaseData, bins=30, color='coral', edgecolor='white', alpha=0.7)\r
      axExplore2.set_xlabel('Purchase Amount ($)')\r
      axExplore2.set_ylabel('Frequency')\r
      axExplore2.set_title(f'Purchase Data (n={len(purchaseData)})')\r
      axExplore2.grid(True, alpha=0.3)\r
      figExplore\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 데이터 탐색의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 데이터 탐색 실행 결과가 오차와 결과 범위 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: shapiro\r
  title: Shapiro-Wilk 검정\r
  structuredPrimary: true\r
  subtitle: stats.shapiro\r
  goal: ShapiroWilk 검정에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    Shapiro-Wilk 검정은 가장 강력한 정규성 검정 중 하나입니다. 5000개 이하의 샘플에 적합하며, W 통계량과 p-value를 반환합니다. 귀무가설은 '데이터가 정규분포를 따른다'입니다. p-value가 0.05보다 크면 귀무가설을 기각하지 않으므로 정규분포를 따른다고 판단합니다.\r
\r
    W 통계량은 0~1 사이 값으로, 1에 가까울수록 정규분포에 가깝습니다. p > 0.05면 '정규분포를 따르지 않는다'는 증거가 불충분하므로 정규분포로 간주합니다.\r
  snippet: |-\r
    statNormal, pNormal = stats.shapiro(normalData)\r
    statPurchase, pPurchase = stats.shapiro(purchaseData[:50])\r
\r
    shapiroDf = pd.DataFrame({\r
        'Data': ['Normal Data', 'Purchase Data'],\r
        'W-statistic': [statNormal, statPurchase],\r
        'p-value': [pNormal, pPurchase],\r
        'Is Normal (p>0.05)': [pNormal > 0.05, pPurchase > 0.05]\r
    })\r
    shapiroDf\r
  exercise:\r
    prompt: ShapiroWilk 검정 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      statNormal, pNormal = stats.shapiro(normalData)\r
      statPurchase, pPurchase = stats.shapiro(purchaseData[:50])\r
\r
      shapiroDf = pd.DataFrame({\r
          'Data': ['Normal Data', 'Purchase Data'],\r
          'W-statistic': [statNormal, statPurchase],\r
          'p-value': [pNormal, pPurchase],\r
          'Is Normal (p>0.05)': [pNormal > 0.05, pPurchase > 0.05]\r
      })\r
      shapiroDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: ShapiroWilk 검정의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: ShapiroWilk 검정의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: qqplot\r
  title: QQ 플롯 분석\r
  structuredPrimary: true\r
  subtitle: 시각적 정규성 확인\r
  goal: QQ 플롯 분석에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: |-\r
    QQ 플롯(Quantile-Quantile Plot)은 데이터의 분위수와 이론적 정규분포의 분위수를 비교합니다. 점들이 대각선에 가까우면 정규분포입니다. S자 형태는 꼬리가 두껍거나 얇음을 의미하고, 위로 휘면 오른쪽 꼬리가 깁니다. 대규모 데이터에서는 통계 검정보다 QQ 플롯이 더 실용적입니다.\r
\r
    Normal Data의 점들은 대각선에 가깝게 분포합니다. Purchase Data는 오른쪽 끝에서 위로 휘어 있어 오른쪽 꼬리가 긴 분포(양의 왜도)임을 보여줍니다.\r
  snippet: |-\r
    def qqPlot(data, ax, title):\r
        sortedData = np.sort(data)\r
        n = len(data)\r
        theoreticalQ = stats.norm.ppf(np.linspace(0.01, 0.99, n))\r
\r
        ax.scatter(theoreticalQ, sortedData, alpha=0.7, s=30)\r
\r
        slope = data.std()\r
        intercept = data.mean()\r
        ax.plot(theoreticalQ, slope * theoreticalQ + intercept, 'r--', linewidth=2)\r
\r
        ax.set_xlabel('Theoretical Quantiles')\r
        ax.set_ylabel('Sample Quantiles')\r
        ax.set_title(title)\r
        ax.grid(True, alpha=0.3)\r
  exercise:\r
    prompt: QQ 플롯 분석 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def qqPlot(data, ax, title):\r
          sortedData = np.sort(data)\r
          n = len(data)\r
          theoreticalQ = stats.norm.ppf(np.linspace(0.01, 0.99, n))\r
\r
          ax.scatter(theoreticalQ, sortedData, alpha=0.7, s=30)\r
\r
          slope = data.std()\r
          intercept = data.mean()\r
          ax.plot(theoreticalQ, slope * theoreticalQ + intercept, 'r--', linewidth=2)\r
\r
          ax.set_xlabel('Theoretical Quantiles')\r
          ax.set_ylabel('Sample Quantiles')\r
          ax.set_title(title)\r
          ax.grid(True, alpha=0.3)\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: QQ 플롯 분석의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: QQ 플롯 분석 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: transform\r
  title: 정규성 달성을 위한 변환\r
  structuredPrimary: true\r
  subtitle: 로그 변환\r
  goal: 정규성 달성을 위한 변환에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    오른쪽으로 치우친 데이터는 로그 변환으로 정규분포에 가깝게 만들 수 있습니다. 금액, 소득, 인구 등 양수이면서 범위가 넓은 데이터에 효과적입니다. 변환 후 통계 분석을 수행하고, 결과 해석 시 원래 스케일로 역변환합니다.\r
\r
    로그 변환은 왜도를 줄이고 Shapiro 검정 p-value를 개선할 수 있지만, 항상 정규성을 보장하지는 않습니다. 변환 후에도 QQ 플롯과 검정 결과를 다시 확인한 뒤 t-검정이나 회귀분석 같은 정규성 가정 분석을 적용해야 합니다.\r
  tips:\r
  - 로그 변환 후에도 정규성은 자동으로 확보되지 않습니다. 왜도, QQ 플롯, Shapiro p-value를 다시 확인하세요.\r
  snippet: |-\r
    logPurchase = np.log(purchaseData)\r
\r
    figTransform, axes = plt.subplots(2, 2, figsize=(12, 8))\r
\r
    axes[0, 0].hist(purchaseData, bins=30, color='coral', edgecolor='white', alpha=0.7)\r
    axes[0, 0].set_title('Original Purchase Data')\r
\r
    axes[0, 1].hist(logPurchase, bins=25, color='steelblue', edgecolor='white', alpha=0.7)\r
    axes[0, 1].set_title('Log-Transformed Data')\r
\r
    qqPlot(purchaseData, axes[1, 0], 'QQ: Original')\r
    qqPlot(logPurchase, axes[1, 1], 'QQ: Log-Transformed')\r
\r
    plt.tight_layout()\r
    figTransform\r
  exercise:\r
    prompt: 정규성 달성을 위한 변환 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      logPurchase = np.log(purchaseData)\r
\r
      figTransform, axes = plt.subplots(2, 2, figsize=(12, 8))\r
\r
      axes[0, 0].hist(purchaseData, bins=30, color='coral', edgecolor='white', alpha=0.7)\r
      axes[0, 0].set_title('Original Purchase Data')\r
\r
      axes[0, 1].hist(logPurchase, bins=25, color='steelblue', edgecolor='white', alpha=0.7)\r
      axes[0, 1].set_title('Log-Transformed Data')\r
\r
      qqPlot(purchaseData, axes[1, 0], 'QQ: Original')\r
      qqPlot(logPurchase, axes[1, 1], 'QQ: Log-Transformed')\r
\r
      plt.tight_layout()\r
      figTransform\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 정규성 달성을 위한 변환의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 정규성 달성을 위한 변환의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: boxcox\r
  title: Box-Cox 변환\r
  structuredPrimary: true\r
  subtitle: 최적 변환 자동 탐색\r
  goal: BoxCox 변환에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    Box-Cox 변환은 데이터를 정규분포에 가장 가깝게 만드는 최적의 λ(람다) 값을 자동으로 찾습니다. λ=0이면 로그 변환, λ=1이면 변환 없음, λ=0.5면 제곱근 변환과 동일합니다. 양수 데이터에만 적용 가능합니다.\r
\r
    Box-Cox가 최적 λ를 자동으로 찾아주므로 로그 변환보다 정규성이 더 좋아질 수 있습니다. 단, 해석의 직관성은 로그 변환이 더 좋습니다.\r
  snippet: |-\r
    boxcoxData, lambdaOpt = stats.boxcox(purchaseData)\r
\r
    figBoxcox, (axBox1, axBox2) = plt.subplots(1, 2, figsize=(12, 5))\r
\r
    axBox1.hist(boxcoxData, bins=25, color='seagreen', edgecolor='white', alpha=0.7)\r
    axBox1.set_title(f'Box-Cox Transformed (λ = {lambdaOpt:.4f})')\r
\r
    qqPlot(boxcoxData, axBox2, 'QQ: Box-Cox Transformed')\r
    figBoxcox\r
  exercise:\r
    prompt: BoxCox 변환 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      boxcoxData, lambdaOpt = stats.boxcox(purchaseData)\r
\r
      figBoxcox, (axBox1, axBox2) = plt.subplots(1, 2, figsize=(12, 5))\r
\r
      axBox1.hist(boxcoxData, bins=25, color='seagreen', edgecolor='white', alpha=0.7)\r
      axBox1.set_title(f'Box-Cox Transformed (λ = {lambdaOpt:.4f})')\r
\r
      qqPlot(boxcoxData, axBox2, 'QQ: Box-Cox Transformed')\r
      figBoxcox\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: BoxCox 변환의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: BoxCox 변환 실행 결과가 오차와 결과 범위 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: result\r
  title: 정규성 검정 종합 보고서\r
  structuredPrimary: true\r
  subtitle: 분석 방법 선택 가이드\r
  goal: 정규성 검정 종합 보고서에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 정규성 검정 결과를 종합하여 적절한 분석 방법을 선택합니다. 정규분포를 따르면 모수적 검정(t-test, ANOVA)을, 따르지 않으면 비모수적 검정(Mann-Whitney,\r
    Kruskal-Wallis)이나 변환 후 분석을 사용합니다. 표본 크기가 30 이상이면 중심극한정리에 의해 평균의 분포는 정규분포에 가까워집니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    dagK, dagP = stats.normaltest(normalData)\r
    dagKp, dagPp = stats.normaltest(purchaseData)\r
\r
    normalStd = (normalData - normalData.mean()) / normalData.std()\r
    purchaseStd = (purchaseData - purchaseData.mean()) / purchaseData.std()\r
    ksN, ksPn = stats.kstest(normalStd, 'norm')\r
    ksP, ksPp = stats.kstest(purchaseStd, 'norm')\r
\r
    resultDf = pd.DataFrame({\r
        'Test': ['Shapiro-Wilk', "D'Agostino", 'Kolmogorov-Smirnov'],\r
        'Normal Data p': [pNormal, dagP, ksPn],\r
        'Purchase Data p': [pPurchase, dagPp, ksPp],\r
        'Normal Verdict': ['Normal' if pNormal > 0.05 else 'Non-normal', 'Normal' if dagP > 0.05 else 'Non-normal', 'Normal' if ksPn > 0.05 else 'Non-normal'],\r
        'Purchase Verdict': ['Normal' if pPurchase > 0.05 else 'Non-normal', 'Normal' if dagPp > 0.05 else 'Non-normal', 'Normal' if ksPp > 0.05 else 'Non-normal']\r
    })\r
    resultDf\r
  exercise:\r
    prompt: 정규성 검정 종합 보고서 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      dagK, dagP = stats.normaltest(normalData)\r
      dagKp, dagPp = stats.normaltest(purchaseData)\r
\r
      normalStd = (normalData - normalData.mean()) / normalData.std()\r
      purchaseStd = (purchaseData - purchaseData.mean()) / purchaseData.std()\r
      ksN, ksPn = stats.kstest(normalStd, 'norm')\r
      ksP, ksPp = stats.kstest(purchaseStd, 'norm')\r
\r
      resultDf = pd.DataFrame({\r
          'Test': ['Shapiro-Wilk', "D'Agostino", 'Kolmogorov-Smirnov'],\r
          'Normal Data p': [pNormal, dagP, ksPn],\r
          'Purchase Data p': [pPurchase, dagPp, ksPp],\r
          'Normal Verdict': ['Normal' if pNormal > 0.05 else 'Non-normal', 'Normal' if dagP > 0.05 else 'Non-normal', 'Normal' if ksPn > 0.05 else 'Non-normal'],\r
          'Purchase Verdict': ['Normal' if pPurchase > 0.05 else 'Non-normal', 'Normal' if dagPp > 0.05 else 'Non-normal', 'Normal' if ksPp > 0.05 else 'Non-normal']\r
      })\r
      resultDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 정규성 검정 종합 보고서의 조건식과 들여쓰기가 맞아 선택한 분기가 실행되어야 합니다.\r
    resultCheck: 정규성 검정 종합 보고서 분기 결과가 바꾼 조건값에 맞게 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 정규성 검정 프로젝트\r
  goal: 실습에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 Shapiro-Wilk 검정, QQ 플롯, 로그/Box-Cox 변환을 활용하여 실제 데이터의 정규성을 평가합니다. 미션1은 직원 급여 데이터 분석, 미션2는 종합 정규성 리포트 작성입니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import numpy as np\r
    from scipy import stats\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    np.random.seed(456)\r
    salaries = np.random.lognormal(mean=11, sigma=0.5, size=150)\r
  exercise:\r
    prompt: 실습 예제에서 \`salaries\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from scipy import stats\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      np.random.seed(456)\r
      salaries = np.random.lognormal(mean=11, sigma=0.5, size=150)\r
    hints:\r
    - 바꿀 지점은 \`salaries = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`salaries\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`salaries\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 \`salaries\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
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