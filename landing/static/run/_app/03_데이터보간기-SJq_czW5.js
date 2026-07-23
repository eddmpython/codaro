var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scipy\r
  id: scipy_03\r
  title: 데이터보간기\r
  order: 3\r
  category: scipy\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - scipy.interpolate\r
  - 보간법\r
  - interp1d\r
  - 스플라인\r
  - 결측값\r
  seo:\r
    title: scipy.interpolate 보간법 - 데이터 사이 값 추정하기\r
    description: scipy.interpolate로 데이터 사이 값을 추정합니다. 선형보간, 스플라인, 다차원 보간을 배웁니다.\r
    keywords:\r
    - scipy\r
    - interpolate\r
    - 보간\r
    - 스플라인\r
    - interp1d\r
intro:\r
  emoji: 📈\r
  goal: 센서 데이터의 결측값을 보간하고 해상도를 높여 부드러운 온도 변화 곡선을 만듭니다.\r
  description: IoT 온도 센서가 2시간마다 데이터를 수집합니다. 하지만 1시간 간격으로 더 세밀한 온도 변화를 알고 싶습니다. 또한 센서 오류로 일부 데이터가 누락되었습니다.\r
    scipy.interpolate의 보간 기법으로 측정되지 않은 시점의 값을 추정합니다. 선형보간, 3차 스플라인, PCHIP 등 다양한 방법을 비교하고, 각 상황에 맞는 최적의\r
    방법을 선택합니다.\r
  direction: 데이터보간기에서 수치 데이터를 모델에 넣고 계산 결과와 오차를 검증합니다.\r
  benefits:\r
  - 수치 입력 확인 후 최적화/적분/신호 처리에 맞는 코드 입력을 고릅니다.\r
  - 데이터보간기 결과를 오차와 결과 범위 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 과학 계산 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 라이브러리 및 데이터 로드 입력 확인\r
      detail: 입력 기준(수치 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 데이터 탐색 처리 실행\r
      detail: 최적화/적분/신호 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 선형 보간 결과 검증\r
      detail: 오차와 결과 범위 기준으로 실행 결과를 비교합니다.\r
    - label: 데이터보간기 재사용\r
      detail: 완성 코드를 과학 계산 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 과학 계산 환경\r
      detail: matplotlib, numpy, pandas, scipy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 데이터보간기 실행\r
      detail: 셀을 실행해 오차와 결과 범위와 예외 상태를 확인합니다.\r
    - label: 데이터보간기 완료\r
      detail: 검증된 코드를 과학 계산 루틴로 남깁니다.\r
sections:\r
- id: load\r
  title: 라이브러리 및 데이터 로드\r
  structuredPrimary: true\r
  subtitle: scipy.interpolate\r
  goal: 라이브러리 및 데이터 로드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    보간(Interpolation)은 알려진 데이터 점들 사이의 값을 추정하는 기법입니다. 센서 데이터 결측 처리, 해상도 증가, 부드러운 곡선 생성에 광범위하게 활용됩니다. scipy.interpolate 모듈은 1차원부터 다차원까지 다양한 보간 함수를 제공합니다. 이 프로젝트에서는 하루 동안 2시간 간격으로 측정된 온도 데이터를 사용합니다.\r
\r
    이 데이터는 전형적인 일일 온도 패턴입니다. 새벽에 가장 낮고, 오후 2시경에 가장 높습니다. 13개 측정점을 25개 이상으로 늘려 더 부드러운 곡선을 만들겠습니다.\r
  snippet: |-\r
    import scipy\r
\r
    import numpy as np\r
    from scipy import interpolate\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    hours = np.array([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24])\r
    temps = np.array([15, 14, 13, 14, 17, 21, 24, 26, 25, 22, 19, 17, 15])\r
  exercise:\r
    prompt: 라이브러리 및 데이터 로드 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import scipy\r
\r
      import numpy as np\r
      from scipy import interpolate\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      hours = np.array([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24])\r
      temps = np.array([15, 14, 13, 14, 17, 21, 24, 26, 25, 22, 19, 17, 15])\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 라이브러리 및 데이터 로드에서 \`hours\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 라이브러리 및 데이터 로드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: explore\r
  title: 데이터 탐색\r
  structuredPrimary: true\r
  subtitle: 측정 지점 시각화\r
  goal: 데이터 탐색에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 보간 전에 원본 데이터를 시각화합니다. 측정 지점을 점으로, 연결선을 점선으로 표시하면 현재 데이터의 해상도를 직관적으로 파악할 수 있습니다. 2시간 간격의\r
    직선 연결은 실제 온도 변화의 부드러운 곡선을 제대로 표현하지 못합니다. 보간을 통해 이 문제를 해결합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figOrig, axOrig = plt.subplots(figsize=(12, 6))\r
    axOrig.scatter(hours, temps, s=100, c='red', zorder=5, label='Measured Points')\r
    axOrig.plot(hours, temps, 'r--', alpha=0.5, label='Linear Connection')\r
    axOrig.set_xlabel('Hour')\r
    axOrig.set_ylabel('Temperature (°C)')\r
    axOrig.set_title('Original Temperature Measurements (2-hour intervals)')\r
    axOrig.set_xticks(range(0, 25, 2))\r
    axOrig.legend()\r
    axOrig.grid(True, alpha=0.3)\r
    figOrig\r
  exercise:\r
    prompt: 데이터 탐색 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figOrig, axOrig = plt.subplots(figsize=(12, 6))\r
      axOrig.scatter(hours, temps, s=100, c='red', zorder=5, label='Measured Points')\r
      axOrig.plot(hours, temps, 'r--', alpha=0.5, label='Linear Connection')\r
      axOrig.set_xlabel('Hour')\r
      axOrig.set_ylabel('Temperature (°C)')\r
      axOrig.set_title('Original Temperature Measurements (2-hour intervals)')\r
      axOrig.set_xticks(range(0, 25, 2))\r
      axOrig.legend()\r
      axOrig.grid(True, alpha=0.3)\r
      figOrig\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 데이터 탐색의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 데이터 탐색 실행 결과가 오차와 결과 범위 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: linear\r
  title: 선형 보간\r
  structuredPrimary: true\r
  subtitle: interp1d(kind='linear')\r
  goal: 선형 보간에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    선형 보간은 두 측정점을 직선으로 연결하여 중간값을 추정합니다. 가장 단순하고 계산이 빠르지만, 꺾이는 점에서 부자연스러운 각이 생깁니다. interp1d 함수는 보간 함수 객체를 반환하며, 이 함수에 새로운 x값을 입력하면 보간된 y값을 얻습니다. kind 파라미터로 보간 방식을 지정합니다.\r
\r
    interp1d는 함수를 반환합니다. linearFunc(5)처럼 호출하면 5시의 보간된 온도를 얻습니다. 배열을 입력하면 여러 값을 한 번에 계산합니다.\r
  snippet: |-\r
    linearFunc = interpolate.interp1d(hours, temps, kind='linear')\r
\r
    hoursNew = np.arange(0, 24.1, 1)\r
    tempsLinear = linearFunc(hoursNew)\r
    tempsLinear\r
  exercise:\r
    prompt: 선형 보간 예제에서 \`linearFunc\`, \`hoursNew\`, \`tempsLinear\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      linearFunc = interpolate.interp1d(hours, temps, kind='linear')\r
\r
      hoursNew = np.arange(0, 24.1, 1)\r
      tempsLinear = linearFunc(hoursNew)\r
      tempsLinear\r
    hints:\r
    - 바꿀 지점은 \`linearFunc = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`linearFunc\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 선형 보간에서 \`linearFunc\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 선형 보간 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: cubic\r
  title: 3차 스플라인 보간\r
  structuredPrimary: true\r
  subtitle: kind='cubic'\r
  goal: 3차 스플라인 보간에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    3차 스플라인(cubic spline)은 각 구간을 3차 다항식으로 맞추고, 연결점에서 1차 및 2차 도함수가 연속이 되도록 합니다. 결과적으로 매우 부드러운 곡선이 생성됩니다. 자연 현상의 연속적인 변화를 표현할 때 선호되는 방법입니다. 단점은 극값 근처에서 약간의 오버슈팅이 발생할 수 있습니다.\r
\r
    cubic 스플라인은 연속적인 자연 현상(온도, 고도, 속도 등)을 표현할 때 가장 많이 사용됩니다. 부드러운 곡선이 필요한 경우 기본 선택입니다.\r
  snippet: |-\r
    cubicFunc = interpolate.interp1d(hours, temps, kind='cubic')\r
    tempsCubic = cubicFunc(hoursNew)\r
\r
    figCubic, axCubic = plt.subplots(figsize=(12, 6))\r
    axCubic.scatter(hours, temps, s=100, c='red', zorder=5, label='Measured')\r
    axCubic.plot(hoursNew, tempsCubic, 'g-', linewidth=2, label='Cubic Spline')\r
    axCubic.set_xlabel('Hour')\r
    axCubic.set_ylabel('Temperature (°C)')\r
    axCubic.set_title('Cubic Spline Interpolation')\r
    axCubic.set_xticks(range(0, 25, 2))\r
    axCubic.legend()\r
    axCubic.grid(True, alpha=0.3)\r
    figCubic\r
  exercise:\r
    prompt: 3차 스플라인 보간 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      cubicFunc = interpolate.interp1d(hours, temps, kind='cubic')\r
      tempsCubic = cubicFunc(hoursNew)\r
\r
      figCubic, axCubic = plt.subplots(figsize=(12, 6))\r
      axCubic.scatter(hours, temps, s=100, c='red', zorder=5, label='Measured')\r
      axCubic.plot(hoursNew, tempsCubic, 'g-', linewidth=2, label='Cubic Spline')\r
      axCubic.set_xlabel('Hour')\r
      axCubic.set_ylabel('Temperature (°C)')\r
      axCubic.set_title('Cubic Spline Interpolation')\r
      axCubic.set_xticks(range(0, 25, 2))\r
      axCubic.legend()\r
      axCubic.grid(True, alpha=0.3)\r
      figCubic\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3차 스플라인 보간의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 3차 스플라인 보간의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: compare\r
  title: 보간 방법 비교\r
  structuredPrimary: true\r
  subtitle: linear vs cubic vs PCHIP\r
  goal: 보간 방법 비교에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    다양한 보간 방법을 비교합니다. PCHIP(Piecewise Cubic Hermite Interpolating Polynomial)은 데이터의 단조성을 보존하여 오버슈팅 없이 안정적인 보간을 제공합니다. 각 방법의 특성을 이해하고 데이터에 맞는 방법을 선택하는 것이 중요합니다.\r
\r
    PCHIP은 오버슈팅이 없어 안전한 선택입니다. 최고/최저점이 측정값을 초과하지 않습니다. 금융 데이터나 단조 변화가 예상되는 경우에 적합합니다.\r
  snippet: |-\r
    pchipFunc = interpolate.PchipInterpolator(hours, temps)\r
    tempsPchip = pchipFunc(hoursNew)\r
    tempsPchip[:5]\r
  exercise:\r
    prompt: 보간 방법 비교 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      pchipFunc = interpolate.PchipInterpolator(hours, temps)\r
      tempsPchip = pchipFunc(hoursNew)\r
      tempsPchip[:5]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 보간 방법 비교에서 \`pchipFunc\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 보간 방법 비교 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: missing\r
  title: 결측값 처리\r
  structuredPrimary: true\r
  subtitle: NaN 보간\r
  goal: 결측값 처리에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 보간의 가장 실용적인 활용 중 하나는 결측값 처리입니다. 센서 오류, 통신 장애, 데이터 손실 등으로 일부 값이 누락된 경우 주변 데이터로부터 추정할 수 있습니다.\r
    먼저 유효한 데이터만 추출하고, 이를 바탕으로 보간 함수를 만든 후 결측 위치의 값을 채웁니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    sensorData = np.array([20, 21, np.nan, 23, np.nan, np.nan, 26, 25, 24, np.nan, 22])\r
    timePoints = np.arange(len(sensorData))\r
\r
    sensorDf = pd.DataFrame({'Time': timePoints, 'Value': sensorData})\r
    sensorDf\r
  exercise:\r
    prompt: 결측값 처리 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      sensorData = np.array([20, 21, np.nan, 23, np.nan, np.nan, 26, 25, 24, np.nan, 22])\r
      timePoints = np.arange(len(sensorData))\r
\r
      sensorDf = pd.DataFrame({'Time': timePoints, 'Value': sensorData})\r
      sensorDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 결측값 처리의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 결측값 처리의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: result\r
  title: 최종 온도 분석 보고서\r
  structuredPrimary: true\r
  subtitle: 고해상도 온도 곡선\r
  goal: 최종 온도 분석 보고서에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 2시간 간격 데이터를 1시간 간격으로 보간하여 더 세밀한 온도 변화를 분석합니다. 최고/최저 온도 시간, 변화율이 가장 큰 시간대 등을 정밀하게 파악할 수\r
    있습니다. 실무에서는 이런 고해상도 데이터가 에너지 관리, 농업, 기상 예보 등에 활용됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    hoursHigh = np.arange(0, 24.1, 0.5)\r
    tempsHigh = pchipFunc(hoursHigh)\r
\r
    maxIdx = np.argmax(tempsHigh)\r
    minIdx = np.argmin(tempsHigh)\r
\r
    analysisDf = pd.DataFrame({\r
        'Metric': ['Max Temperature', 'Max Time', 'Min Temperature', 'Min Time', 'Daily Range'],\r
        'Value': [f'{tempsHigh[maxIdx]:.1f}°C', f'{hoursHigh[maxIdx]:.1f}h', f'{tempsHigh[minIdx]:.1f}°C', f'{hoursHigh[minIdx]:.1f}h', f'{tempsHigh[maxIdx] - tempsHigh[minIdx]:.1f}°C']\r
    })\r
    analysisDf\r
  exercise:\r
    prompt: 최종 온도 분석 보고서 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      hoursHigh = np.arange(0, 24.1, 0.5)\r
      tempsHigh = pchipFunc(hoursHigh)\r
\r
      maxIdx = np.argmax(tempsHigh)\r
      minIdx = np.argmin(tempsHigh)\r
\r
      analysisDf = pd.DataFrame({\r
          'Metric': ['Max Temperature', 'Max Time', 'Min Temperature', 'Min Time', 'Daily Range'],\r
          'Value': [f'{tempsHigh[maxIdx]:.1f}°C', f'{hoursHigh[maxIdx]:.1f}h', f'{tempsHigh[minIdx]:.1f}°C', f'{hoursHigh[minIdx]:.1f}h', f'{tempsHigh[maxIdx] - tempsHigh[minIdx]:.1f}°C']\r
      })\r
      analysisDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 최종 온도 분석 보고서의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 최종 온도 분석 보고서의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 보간 활용 프로젝트\r
  goal: 실습에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    지금까지 배운 선형보간, 스플라인, PCHIP, 결측값 처리를 활용하여 실제 데이터 문제를 해결합니다. 미션1은 주가 데이터의 결측값 처리입니다. 미션2는 저해상도 신호를 업샘플링하여 부드러운 곡선을 만듭니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import numpy as np\r
    from scipy import interpolate\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    np.random.seed(123)\r
    days = np.arange(1, 31)\r
    basePrices = 100 + np.cumsum(np.random.randn(30) * 2)\r
\r
    missingIdx = [4, 5, 10, 15, 16, 17, 22]\r
    pricesWithNan = basePrices.copy()\r
    pricesWithNan[missingIdx] = np.nan\r
  exercise:\r
    prompt: 실습 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      from scipy import interpolate\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      np.random.seed(123)\r
      days = np.arange(1, 31)\r
      basePrices = 100 + np.cumsum(np.random.randn(30) * 2)\r
\r
      missingIdx = [4, 5, 10, 15, 16, 17, 22]\r
      pricesWithNan = basePrices.copy()\r
      pricesWithNan[missingIdx] = np.nan\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`days\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 실습 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
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