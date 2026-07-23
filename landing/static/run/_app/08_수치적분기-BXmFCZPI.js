var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scipy\r
  id: scipy_08\r
  title: 수치적분기\r
  order: 8\r
  category: scipy\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - scipy.integrate\r
  - quad\r
  - 적분\r
  - 면적계산\r
  - 미분방정식\r
  seo:\r
    title: scipy.integrate 수치적분 - 곡선 아래 면적 계산\r
    description: scipy.integrate의 quad로 곡선 아래 면적을 계산합니다. 정적분, 이중적분, 미분방정식 풀이를 배웁니다.\r
    keywords:\r
    - scipy\r
    - integrate\r
    - quad\r
    - 적분\r
    - 면적\r
intro:\r
  emoji: 📐\r
  goal: scipy.integrate로 수치적분을 수행하고 미분방정식을 풉니다.\r
  description: 해석적으로 풀 수 없는 적분을 수치적으로 계산합니다. 곡선 아래 면적, 확률 계산, 물리량 누적 등 다양한 응용에 활용합니다.\r
  direction: 수치적분기에서 수치 데이터를 모델에 넣고 계산 결과와 오차를 검증합니다.\r
  benefits:\r
  - 수치 입력 확인 후 최적화/적분/신호 처리에 맞는 코드 입력을 고릅니다.\r
  - 수치적분기 결과를 오차와 결과 범위 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 과학 계산 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 데이터 로드 입력 확인\r
      detail: 입력 기준(수치 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 기본 정적분 처리 실행\r
      detail: 최적화/적분/신호 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 삼각함수 적분 결과 검증\r
      detail: 오차와 결과 범위 기준으로 실행 결과를 비교합니다.\r
    - label: 수치적분기 재사용\r
      detail: 완성 코드를 과학 계산 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 과학 계산 환경\r
      detail: matplotlib, numpy, pandas, scipy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 수치적분기 실행\r
      detail: 셀을 실행해 오차와 결과 범위와 예외 상태를 확인합니다.\r
    - label: 수치적분기 완료\r
      detail: 검증된 코드를 과학 계산 루틴로 남깁니다.\r
sections:\r
- id: load\r
  title: 데이터 로드\r
  structuredPrimary: true\r
  subtitle: 적분 환경 설정\r
  goal: 데이터 로드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: 수치적분은 함수 곡선 아래의 면적을 근사적으로 계산합니다. 해석적 적분이 불가능하거나 너무 복잡한 경우에 유용합니다. 이 프로젝트에서는 다양한 적분 기법과\r
    미분방정식 풀이를 실습합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import scipy\r
\r
    import numpy as np\r
    from scipy import integrate\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
  exercise:\r
    prompt: 데이터 로드 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import scipy\r
\r
      import numpy as np\r
      from scipy import integrate\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
    hints:\r
    - 바꿀 지점은 수치 입력을 만드는 첫 줄과 최적화/적분/신호 처리 줄에서 찾으세요.\r
    - 실행 뒤 오차와 결과 범위 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 데이터 로드의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 데이터 로드 실행 결과가 오차와 결과 범위 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: quad\r
  title: 기본 정적분\r
  structuredPrimary: true\r
  subtitle: integrate.quad\r
  goal: 기본 정적분에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    quad 함수는 1차원 정적분을 계산합니다. 적분할 함수, 하한, 상한을 입력하면 적분값과 추정 오차를 반환합니다. 적응형 구적법을 사용하여 함수가 급격히 변하는 곳에서 더 많은 점을 샘플링합니다.\r
\r
    quad는 적응형 Gauss-Kronrod 구적법을 사용합니다. 반환되는 error는 추정 오차이며, 대부분의 경우 매우 작습니다.\r
  snippet: |-\r
    def f1(x):\r
        return x ** 2\r
\r
    result1, error1 = integrate.quad(f1, 0, 1)\r
    analyticalResult = 1/3\r
\r
    quadDf = pd.DataFrame({\r
        'Method': ['Numerical (quad)', 'Analytical'],\r
        'Result': [result1, analyticalResult],\r
        'Error': [abs(result1 - analyticalResult), 0]\r
    })\r
    quadDf\r
  exercise:\r
    prompt: 기본 정적분 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      def f1(x):\r
          return x ** 2\r
\r
      result1, error1 = integrate.quad(f1, 0, 1)\r
      analyticalResult = 1/3\r
\r
      quadDf = pd.DataFrame({\r
          'Method': ['Numerical (quad)', 'Analytical'],\r
          'Result': [result1, analyticalResult],\r
          'Error': [abs(result1 - analyticalResult), 0]\r
      })\r
      quadDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 기본 정적분의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 기본 정적분 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: trig\r
  title: 삼각함수 적분\r
  structuredPrimary: true\r
  subtitle: 양수/음수 영역\r
  goal: 삼각함수 적분에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 삼각함수의 적분에서는 양수 영역과 음수 영역이 상쇄될 수 있습니다. 한 주기(0~2π)에 대한 sin 적분은 0이 됩니다. 절대값 적분이 필요한 경우 별도로\r
    처리해야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    sinHalf, _ = integrate.quad(np.sin, 0, np.pi)\r
    sinFull, _ = integrate.quad(np.sin, 0, 2 * np.pi)\r
\r
    sinDf = pd.DataFrame({\r
        'Range': ['0 to π', '0 to 2π'],\r
        'Integral': [f'{sinHalf:.6f}', f'{sinFull:.6e}'],\r
        'Interpretation': ['Positive area only', 'Positive + Negative = 0']\r
    })\r
    sinDf\r
  exercise:\r
    prompt: 삼각함수 적분 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      sinHalf, _ = integrate.quad(np.sin, 0, np.pi)\r
      sinFull, _ = integrate.quad(np.sin, 0, 2 * np.pi)\r
\r
      sinDf = pd.DataFrame({\r
          'Range': ['0 to π', '0 to 2π'],\r
          'Integral': [f'{sinHalf:.6f}', f'{sinFull:.6e}'],\r
          'Interpretation': ['Positive area only', 'Positive + Negative = 0']\r
      })\r
      sinDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 삼각함수 적분의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 삼각함수 적분의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: gaussian\r
  title: 가우스 적분\r
  structuredPrimary: true\r
  subtitle: 정규분포 확률\r
  goal: 가우스 적분에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 정규분포의 확률밀도함수를 적분하면 확률을 계산할 수 있습니다. 68-95-99.7 법칙은 ±1σ, ±2σ, ±3σ 범위에 각각 약 68%, 95%, 99.7%의\r
    데이터가 포함됨을 의미합니다. quad로 이를 직접 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def normalPdf(x, mu=0, sigma=1):\r
        return (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mu) / sigma) ** 2)\r
\r
    prob1Sig, _ = integrate.quad(normalPdf, -1, 1)\r
    prob2Sig, _ = integrate.quad(normalPdf, -2, 2)\r
    prob3Sig, _ = integrate.quad(normalPdf, -3, 3)\r
\r
    probDf = pd.DataFrame({\r
        'Range': ['±1σ', '±2σ', '±3σ'],\r
        'Probability': [f'{prob1Sig:.4%}', f'{prob2Sig:.4%}', f'{prob3Sig:.4%}'],\r
        'Expected': ['~68%', '~95%', '~99.7%']\r
    })\r
    probDf\r
  exercise:\r
    prompt: 가우스 적분 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      def normalPdf(x, mu=0, sigma=1):\r
          return (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((x - mu) / sigma) ** 2)\r
\r
      prob1Sig, _ = integrate.quad(normalPdf, -1, 1)\r
      prob2Sig, _ = integrate.quad(normalPdf, -2, 2)\r
      prob3Sig, _ = integrate.quad(normalPdf, -3, 3)\r
\r
      probDf = pd.DataFrame({\r
          'Range': ['±1σ', '±2σ', '±3σ'],\r
          'Probability': [f'{prob1Sig:.4%}', f'{prob2Sig:.4%}', f'{prob3Sig:.4%}'],\r
          'Expected': ['~68%', '~95%', '~99.7%']\r
      })\r
      probDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 가우스 적분의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 가우스 적분 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: infinite\r
  title: 무한 적분\r
  structuredPrimary: true\r
  subtitle: -∞ to ∞\r
  goal: 무한 적분에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: quad는 무한 구간 적분도 지원합니다. np.inf를 사용하여 양의 무한대, -np.inf를 사용하여 음의 무한대를 지정합니다. 정규분포 전체 적분은 정의에\r
    의해 1이 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    totalProb, errProb = integrate.quad(normalPdf, -np.inf, np.inf)\r
\r
    infDf = pd.DataFrame({\r
        'Integration': ['Full Normal PDF', 'Tail P(X > 2)'],\r
        'Result': [f'{totalProb:.6f}', ''],\r
        'Expected': ['1.0', '']\r
    })\r
  exercise:\r
    prompt: 무한 적분 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      totalProb, errProb = integrate.quad(normalPdf, -np.inf, np.inf)\r
\r
      infDf = pd.DataFrame({\r
          'Integration': ['Full Normal PDF', 'Tail P(X > 2)'],\r
          'Result': [f'{totalProb:.6f}', ''],\r
          'Expected': ['1.0', '']\r
      })\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 무한 적분의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 무한 적분의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: trapz\r
  title: 데이터 적분\r
  structuredPrimary: true\r
  subtitle: 사다리꼴 법칙\r
  goal: 데이터 적분에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    함수 대신 이산 데이터가 있을 때는 trapezoid(사다리꼴 법칙)나 simpson(심프슨 법칙)을 사용합니다. 속도-시간 그래프에서 이동 거리를 계산하거나, 전력-시간에서 총 에너지를 계산할 때 유용합니다.\r
\r
    trapezoid(구 trapz)는 사다리꼴로 근사합니다. simpson은 포물선으로 근사하여 더 정확하지만 짝수 개 구간이 필요합니다.\r
  snippet: |-\r
    time = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])\r
    velocity = np.array([0, 2, 5, 8, 10, 10, 9, 7, 4, 2, 0])\r
\r
    distance = integrate.trapezoid(velocity, time)\r
\r
    figVel, axVel = plt.subplots(figsize=(10, 6))\r
    axVel.plot(time, velocity, 'b-o', linewidth=2, markersize=8, label='Velocity')\r
    axVel.fill_between(time, velocity, alpha=0.3, color='blue', label=f'Distance = {distance:.1f} m')\r
    axVel.set_xlabel('Time (s)')\r
    axVel.set_ylabel('Velocity (m/s)')\r
    axVel.set_title('Distance from Velocity-Time Graph')\r
    axVel.legend()\r
    axVel.grid(True, alpha=0.3)\r
    figVel\r
  exercise:\r
    prompt: 데이터 적분 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      time = np.array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])\r
      velocity = np.array([0, 2, 5, 8, 10, 10, 9, 7, 4, 2, 0])\r
\r
      distance = integrate.trapezoid(velocity, time)\r
\r
      figVel, axVel = plt.subplots(figsize=(10, 6))\r
      axVel.plot(time, velocity, 'b-o', linewidth=2, markersize=8, label='Velocity')\r
      axVel.fill_between(time, velocity, alpha=0.3, color='blue', label=f'Distance = {distance:.1f} m')\r
      axVel.set_xlabel('Time (s)')\r
      axVel.set_ylabel('Velocity (m/s)')\r
      axVel.set_title('Distance from Velocity-Time Graph')\r
      axVel.legend()\r
      axVel.grid(True, alpha=0.3)\r
      figVel\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 데이터 적분의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 데이터 적분의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: dblquad\r
  title: 이중적분\r
  structuredPrimary: true\r
  subtitle: 2차원 적분\r
  goal: 이중적분에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: dblquad는 2차원 영역에서 적분을 수행합니다. 부피 계산, 2차원 확률 밀도 적분, 질량 중심 계산 등에 사용됩니다. 적분 순서는 안쪽(y)부터 계산한\r
    후 바깥쪽(x)을 계산합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def f2d(y, x):\r
        return x * y\r
\r
    resultDbl, errDbl = integrate.dblquad(f2d, 0, 1, 0, 1)\r
\r
    dblDf = pd.DataFrame({\r
        'Integral': ['∬xy dA', 'Circle Area (r=1)'],\r
        'Result': [f'{resultDbl:.6f}', ''],\r
        'Analytical': ['1/4 = 0.25', 'π ≈ 3.1416']\r
    })\r
    dblDf\r
  exercise:\r
    prompt: 이중적분 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      def f2d(y, x):\r
          return x * y\r
\r
      resultDbl, errDbl = integrate.dblquad(f2d, 0, 1, 0, 1)\r
\r
      dblDf = pd.DataFrame({\r
          'Integral': ['∬xy dA', 'Circle Area (r=1)'],\r
          'Result': [f'{resultDbl:.6f}', ''],\r
          'Analytical': ['1/4 = 0.25', 'π ≈ 3.1416']\r
      })\r
      dblDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 이중적분의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 이중적분 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: ode\r
  title: 미분방정식 풀이\r
  structuredPrimary: true\r
  subtitle: odeint\r
  goal: 미분방정식 풀이에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 미분방정식은 변화율을 정의합니다. odeint로 초기값 문제를 수치적으로 풉니다. 가장 간단한 예는 지수 감쇠 dy/dt = -ky로, 방사성 붕괴나 RC\r
    회로 방전을 모델링합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def decay(y, tVal, k):\r
        return -k * y\r
\r
    y0 = 100\r
    kDecay = 0.3\r
    tSpan = np.linspace(0, 20, 100)\r
\r
    solution = integrate.odeint(decay, y0, tSpan, args=(kDecay,))\r
    analyticalSol = y0 * np.exp(-kDecay * tSpan)\r
\r
    figDecay, axDecay = plt.subplots(figsize=(10, 6))\r
    axDecay.plot(tSpan, solution, 'b-', linewidth=2, label='Numerical (odeint)')\r
    axDecay.plot(tSpan, analyticalSol, 'r--', linewidth=2, label='Analytical')\r
    axDecay.set_xlabel('Time')\r
    axDecay.set_ylabel('y')\r
    axDecay.set_title("Exponential Decay: dy/dt = -0.3y")\r
    axDecay.legend()\r
    axDecay.grid(True, alpha=0.3)\r
    figDecay\r
  exercise:\r
    prompt: 미분방정식 풀이 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      def decay(y, tVal, k):\r
          return -k * y\r
\r
      y0 = 100\r
      kDecay = 0.3\r
      tSpan = np.linspace(0, 20, 100)\r
\r
      solution = integrate.odeint(decay, y0, tSpan, args=(kDecay,))\r
      analyticalSol = y0 * np.exp(-kDecay * tSpan)\r
\r
      figDecay, axDecay = plt.subplots(figsize=(10, 6))\r
      axDecay.plot(tSpan, solution, 'b-', linewidth=2, label='Numerical (odeint)')\r
      axDecay.plot(tSpan, analyticalSol, 'r--', linewidth=2, label='Analytical')\r
      axDecay.set_xlabel('Time')\r
      axDecay.set_ylabel('y')\r
      axDecay.set_title("Exponential Decay: dy/dt = -0.3y")\r
      axDecay.legend()\r
      axDecay.grid(True, alpha=0.3)\r
      figDecay\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 미분방정식 풀이의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 미분방정식 풀이 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: oscillator\r
  title: 조화진동자\r
  structuredPrimary: true\r
  subtitle: 2차 미분방정식\r
  goal: 조화진동자에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 2차 미분방정식은 1차 연립방정식으로 변환하여 풉니다. 조화진동자(스프링-질량 시스템)는 d²x/dt² = -ω²x로, 위치 x와 속도 v = dx/dt 두\r
    변수의 연립방정식으로 변환합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def harmonic(state, tVal, omega):\r
        x, v = state\r
        dxdt = v\r
        dvdt = -omega**2 * x\r
        return [dxdt, dvdt]\r
\r
    omegaH = 2\r
    initState = [1, 0]\r
    tOsc = np.linspace(0, 10, 500)\r
\r
    oscSol = integrate.odeint(harmonic, initState, tOsc, args=(omegaH,))\r
    xOsc = oscSol[:, 0]\r
    vOsc = oscSol[:, 1]\r
  exercise:\r
    prompt: 조화진동자 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def harmonic(state, tVal, omega):\r
          x, v = state\r
          dxdt = v\r
          dvdt = -omega**2 * x\r
          return [dxdt, dvdt]\r
\r
      omegaH = 2\r
      initState = [1, 0]\r
      tOsc = np.linspace(0, 10, 500)\r
\r
      oscSol = integrate.odeint(harmonic, initState, tOsc, args=(omegaH,))\r
      xOsc = oscSol[:, 0]\r
      vOsc = oscSol[:, 1]\r
    hints:\r
    - 바꿀 지점은 def 줄의 매개변수, 함수 본문, 함수 호출 인자에서 찾으세요.\r
    - 실행 뒤 반환값이나 출력값이 바꾼 인자/계산식과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 조화진동자의 함수 정의, 매개변수, 호출 인자가 NameError나 TypeError 조건을 피해야 합니다.\r
    resultCheck: 조화진동자 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: solveivp\r
  title: solve_ivp\r
  structuredPrimary: true\r
  subtitle: 최신 ODE 솔버\r
  goal: solveivp에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: solve_ivp는 odeint보다 현대적인 인터페이스를 제공하며 다양한 솔버를 지원합니다. 감쇠 진동자와 같은 복잡한 시스템을 시뮬레이션할 때 더 유연하게\r
    사용할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def dampedOsc(tVal, state, omega, gamma):\r
        x, v = state\r
        dxdt = v\r
        dvdt = -omega**2 * x - 2 * gamma * v\r
        return [dxdt, dvdt]\r
\r
    omegaD = 2\r
    gammaD = 0.2\r
    tSpanIvp = (0, 15)\r
    tEvalIvp = np.linspace(0, 15, 300)\r
\r
    solIvp = integrate.solve_ivp(\r
        dampedOsc, tSpanIvp, [1, 0],\r
        args=(omegaD, gammaD),\r
        t_eval=tEvalIvp,\r
        method='RK45'\r
    )\r
\r
    figDamp, axDamp = plt.subplots(figsize=(12, 5))\r
    axDamp.plot(solIvp.t, solIvp.y[0], 'b-', linewidth=2, label='Position')\r
    axDamp.plot(solIvp.t, np.exp(-gammaD * solIvp.t), 'r--', linewidth=1.5, alpha=0.7, label='Envelope')\r
    axDamp.plot(solIvp.t, -np.exp(-gammaD * solIvp.t), 'r--', linewidth=1.5, alpha=0.7)\r
    axDamp.set_xlabel('Time')\r
    axDamp.set_ylabel('Position')\r
    axDamp.set_title('Damped Harmonic Oscillator')\r
    axDamp.legend()\r
    axDamp.grid(True, alpha=0.3)\r
    figDamp\r
  exercise:\r
    prompt: solveivp 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      def dampedOsc(tVal, state, omega, gamma):\r
          x, v = state\r
          dxdt = v\r
          dvdt = -omega**2 * x - 2 * gamma * v\r
          return [dxdt, dvdt]\r
\r
      omegaD = 2\r
      gammaD = 0.2\r
      tSpanIvp = (0, 15)\r
      tEvalIvp = np.linspace(0, 15, 300)\r
\r
      solIvp = integrate.solve_ivp(\r
          dampedOsc, tSpanIvp, [1, 0],\r
          args=(omegaD, gammaD),\r
          t_eval=tEvalIvp,\r
          method='RK45'\r
      )\r
\r
      figDamp, axDamp = plt.subplots(figsize=(12, 5))\r
      axDamp.plot(solIvp.t, solIvp.y[0], 'b-', linewidth=2, label='Position')\r
      axDamp.plot(solIvp.t, np.exp(-gammaD * solIvp.t), 'r--', linewidth=1.5, alpha=0.7, label='Envelope')\r
      axDamp.plot(solIvp.t, -np.exp(-gammaD * solIvp.t), 'r--', linewidth=1.5, alpha=0.7)\r
      axDamp.set_xlabel('Time')\r
      axDamp.set_ylabel('Position')\r
      axDamp.set_title('Damped Harmonic Oscillator')\r
      axDamp.legend()\r
      axDamp.grid(True, alpha=0.3)\r
      figDamp\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: solveivp의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: solveivp 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: result\r
  title: 적분 함수 정리\r
  structuredPrimary: true\r
  subtitle: 함수 선택 가이드\r
  goal: 적분 함수 정리에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: scipy.integrate는 다양한 적분 상황에 맞는 함수를 제공합니다. 1차원 함수는 quad, 2차원은 dblquad, 이산 데이터는 trapezoid나\r
    simpson, 미분방정식은 odeint나 solve_ivp를 사용하세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    intGuideDf = pd.DataFrame({\r
        'Function': ['quad', 'dblquad', 'tplquad', 'trapezoid', 'simpson', 'odeint', 'solve_ivp'],\r
        'Purpose': ['1D 정적분', '2D 정적분', '3D 정적분', '데이터 적분 (사다리꼴)', '데이터 적분 (심프슨)', 'ODE 풀이 (구 버전)', 'ODE 풀이 (신 버전)'],\r
        'Input': ['함수', '함수', '함수', '배열', '배열', '미분방정식', '미분방정식']\r
    })\r
    intGuideDf\r
  exercise:\r
    prompt: 적분 함수 정리 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      intGuideDf = pd.DataFrame({\r
          'Function': ['quad', 'dblquad', 'tplquad', 'trapezoid', 'simpson', 'odeint', 'solve_ivp'],\r
          'Purpose': ['1D 정적분', '2D 정적분', '3D 정적분', '데이터 적분 (사다리꼴)', '데이터 적분 (심프슨)', 'ODE 풀이 (구 버전)', 'ODE 풀이 (신 버전)'],\r
          'Input': ['함수', '함수', '함수', '배열', '배열', '미분방정식', '미분방정식']\r
      })\r
      intGuideDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 적분 함수 정리의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 적분 함수 정리의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 적분 프로젝트\r
  goal: 실습에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 물리/공학 문제를 수치적분으로 해결해보세요. 힘-거리 그래프에서 일(Work)을 계산하거나, 인구 성장을 로지스틱 방정식으로 시뮬레이션해보세요.\r
  snippet: |-\r
    def force(x):\r
        return 10 + 5 * x - 0.5 * x**2\r
\r
    xForce = np.linspace(0, 10, 100)\r
    yForce = force(xForce)\r
\r
    workDone, _ = integrate.quad(force, 0, 10)\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      def force(x):\r
          return 10 + 5 * x - 0.5 * x**2\r
\r
      xForce = np.linspace(0, 10, 100)\r
      yForce = force(xForce)\r
\r
      workDone, _ = integrate.quad(force, 0, 10)\r
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