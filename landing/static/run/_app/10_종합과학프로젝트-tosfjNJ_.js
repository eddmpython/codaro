var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scipy\r
  id: scipy_10\r
  title: 종합과학프로젝트\r
  order: 10\r
  category: scipy\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - scipy\r
  - 종합프로젝트\r
  - 데이터분석\r
  - 과학계산\r
  - 실전\r
  seo:\r
    title: SciPy 종합 프로젝트 - 모든 모듈 통합 활용\r
    description: SciPy의 모든 모듈을 통합하여 실전 과학 계산 문제를 해결합니다. 센서 데이터 분석 파이프라인을 구축합니다.\r
    keywords:\r
    - scipy\r
    - 종합프로젝트\r
    - 데이터분석\r
    - 과학계산\r
intro:\r
  emoji: 🔬\r
  goal: SciPy의 모든 모듈을 통합하여 실전 데이터 분석 파이프라인을 구축합니다.\r
  description: 센서 데이터를 필터링하고, 주파수 분석하고, 통계 검정하고, 모델을 피팅하는 전체 워크플로우를 경험합니다. 이 과정에서 scipy.signal, scipy.fft,\r
    scipy.stats, scipy.optimize, scipy.integrate를 모두 활용합니다.\r
  direction: 종합과학프로젝트에서 수치 데이터를 모델에 넣고 계산 결과와 오차를 검증합니다.\r
  benefits:\r
  - 수치 입력 확인 후 최적화/적분/신호 처리에 맞는 코드 입력을 고릅니다.\r
  - 종합과학프로젝트 결과를 오차와 결과 범위 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 과학 계산 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 데이터 로드 입력 확인\r
      detail: 입력 기준(수치 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 신호 필터링 처리 실행\r
      detail: 최적화/적분/신호 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 주파수 분석 결과 검증\r
      detail: 오차와 결과 범위 기준으로 실행 결과를 비교합니다.\r
    - label: 종합과학프로젝트 재사용\r
      detail: 완성 코드를 과학 계산 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 과학 계산 환경\r
      detail: matplotlib, numpy, pandas, scipy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 종합과학프로젝트 실행\r
      detail: 셀을 실행해 오차와 결과 범위와 예외 상태를 확인합니다.\r
    - label: 종합과학프로젝트 완료\r
      detail: 검증된 코드를 과학 계산 루틴로 남깁니다.\r
sections:\r
- id: load\r
  title: 데이터 로드\r
  structuredPrimary: true\r
  subtitle: 진동 센서 시뮬레이션\r
  goal: 데이터 로드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 산업용 기계에서 수집한 진동 센서 데이터를 분석합니다. 정상 진동(50Hz 회전 주파수), 베어링 결함 신호(120Hz), 전력선 간섭(60Hz), 랜덤 노이즈가\r
    합성된 현실적인 센서 데이터를 생성합니다. 이런 데이터에서 결함을 감지하고 상태를 진단하는 것이 산업 현장의 핵심 과제입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import scipy\r
\r
    import numpy as np\r
    from scipy import signal, fft, stats, optimize, integrate\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    np.random.seed(42)\r
    fs = 1000\r
    duration = 10\r
    t = np.linspace(0, duration, fs * duration, endpoint=False)\r
    n = len(t)\r
\r
    rotationFreq = 50\r
    normalVib = 1.0 * np.sin(2 * np.pi * rotationFreq * t)\r
    normalVib += 0.3 * np.sin(2 * np.pi * 2 * rotationFreq * t)\r
\r
    defectFreq = 120\r
    defectVib = 0.4 * np.sin(2 * np.pi * defectFreq * t)\r
\r
    powerNoise = 0.2 * np.sin(2 * np.pi * 60 * t)\r
    randomNoise = 0.3 * np.random.randn(n)\r
\r
    rawSignal = normalVib + defectVib + powerNoise + randomNoise\r
  exercise:\r
    prompt: 데이터 로드 예제에서 \`fs\`, \`duration\`, \`t\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import scipy\r
\r
      import numpy as np\r
      from scipy import signal, fft, stats, optimize, integrate\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      np.random.seed(42)\r
      fs = 1000\r
      duration = 10\r
      t = np.linspace(0, duration, fs * duration, endpoint=False)\r
      n = len(t)\r
\r
      rotationFreq = 50\r
      normalVib = 1.0 * np.sin(2 * np.pi * rotationFreq * t)\r
      normalVib += 0.3 * np.sin(2 * np.pi * 2 * rotationFreq * t)\r
\r
      defectFreq = 120\r
      defectVib = 0.4 * np.sin(2 * np.pi * defectFreq * t)\r
\r
      powerNoise = 0.2 * np.sin(2 * np.pi * 60 * t)\r
      randomNoise = 0.3 * np.random.randn(n)\r
\r
      rawSignal = normalVib + defectVib + powerNoise + randomNoise\r
    hints:\r
    - 바꿀 지점은 \`fs = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`fs\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 데이터 로드에서 \`fs\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 데이터 로드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: filter\r
  title: 신호 필터링\r
  structuredPrimary: true\r
  subtitle: scipy.signal\r
  goal: 신호 필터링에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 전력선 간섭(60Hz)을 노치 필터로 제거하고, 관심 대역 외의 고주파 노이즈를 저역통과 필터로 줄입니다. 필터 순서가 중요합니다. 먼저 노치로 특정 간섭을\r
    제거한 후, 저역통과로 전체 대역을 정리합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    bNotch, aNotch = signal.iirnotch(60 / (fs/2), 30)\r
    afterNotch = signal.filtfilt(bNotch, aNotch, rawSignal)\r
\r
    sosLow = signal.butter(4, 200 / (fs/2), btype='low', output='sos')\r
    filteredSignal = signal.sosfiltfilt(sosLow, afterNotch)\r
  exercise:\r
    prompt: 신호 필터링 예제에서 \`bNotch\`, \`aNotch\`, \`afterNotch\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      bNotch, aNotch = signal.iirnotch(60 / (fs/2), 30)\r
      afterNotch = signal.filtfilt(bNotch, aNotch, rawSignal)\r
\r
      sosLow = signal.butter(4, 200 / (fs/2), btype='low', output='sos')\r
      filteredSignal = signal.sosfiltfilt(sosLow, afterNotch)\r
    hints:\r
    - 바꿀 지점은 \`afterNotch = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`afterNotch\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 신호 필터링에서 \`afterNotch\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 신호 필터링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: spectrum\r
  title: 주파수 분석\r
  structuredPrimary: true\r
  subtitle: scipy.fft\r
  goal: 주파수 분석에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: FFT로 신호의 주파수 성분을 분석하여 회전 주파수(50Hz)와 결함 주파수(120Hz)를 검출합니다. 정상 기계는 회전 주파수와 그 고조파만 나타나야 합니다.\r
    결함이 있으면 베어링 결함 주파수 등 비정상적인 피크가 나타납니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    fftResult = fft.fft(filteredSignal)\r
    freqs = fft.fftfreq(n, 1/fs)\r
    posFreqs = freqs[:n//2]\r
    magnitude = 2 * np.abs(fftResult[:n//2]) / n\r
\r
    figFft, axFft = plt.subplots(figsize=(12, 5))\r
    axFft.plot(posFreqs, magnitude, 'b-', linewidth=1)\r
    axFft.axvline(50, color='green', linestyle='--', alpha=0.7, label='Rotation (50Hz)')\r
    axFft.axvline(100, color='green', linestyle=':', alpha=0.5, label='2x Rotation (100Hz)')\r
    axFft.axvline(120, color='red', linestyle='--', alpha=0.7, label='Defect (120Hz)')\r
    axFft.set_xlim(0, 200)\r
    axFft.set_xlabel('Frequency (Hz)')\r
    axFft.set_ylabel('Magnitude')\r
    axFft.set_title('Frequency Spectrum of Filtered Signal')\r
    axFft.legend()\r
    axFft.grid(True, alpha=0.3)\r
    figFft\r
  exercise:\r
    prompt: 주파수 분석 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      fftResult = fft.fft(filteredSignal)\r
      freqs = fft.fftfreq(n, 1/fs)\r
      posFreqs = freqs[:n//2]\r
      magnitude = 2 * np.abs(fftResult[:n//2]) / n\r
\r
      figFft, axFft = plt.subplots(figsize=(12, 5))\r
      axFft.plot(posFreqs, magnitude, 'b-', linewidth=1)\r
      axFft.axvline(50, color='green', linestyle='--', alpha=0.7, label='Rotation (50Hz)')\r
      axFft.axvline(100, color='green', linestyle=':', alpha=0.5, label='2x Rotation (100Hz)')\r
      axFft.axvline(120, color='red', linestyle='--', alpha=0.7, label='Defect (120Hz)')\r
      axFft.set_xlim(0, 200)\r
      axFft.set_xlabel('Frequency (Hz)')\r
      axFft.set_ylabel('Magnitude')\r
      axFft.set_title('Frequency Spectrum of Filtered Signal')\r
      axFft.legend()\r
      axFft.grid(True, alpha=0.3)\r
      figFft\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 주파수 분석의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 주파수 분석의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: statistics\r
  title: 통계 분석\r
  structuredPrimary: true\r
  subtitle: scipy.stats\r
  goal: 통계 분석에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    진동 신호의 통계적 특성을 분석합니다. RMS(Root Mean Square)는 에너지 수준, 왜도(skewness)는 비대칭성, 첨도(kurtosis)는 충격성을 나타냅니다. 결함이 있으면 첨도가 높아지고 RMS가 증가하는 경향이 있습니다.\r
\r
    정상 기계의 진동은 보통 정규분포에 가깝습니다. 결함이 발생하면 충격 성분이 추가되어 분포가 뾰족해지고(높은 첨도) 정규성이 감소합니다.\r
  snippet: |-\r
    rmsValue = np.sqrt(np.mean(filteredSignal**2))\r
    skewValue = stats.skew(filteredSignal)\r
    kurtValue = stats.kurtosis(filteredSignal)\r
    peakValue = np.max(np.abs(filteredSignal))\r
    crestFactor = peakValue / rmsValue\r
\r
    statsDf = pd.DataFrame({\r
        'Metric': ['RMS', 'Peak', 'Crest Factor', 'Skewness', 'Kurtosis'],\r
        'Value': [f'{rmsValue:.4f}', f'{peakValue:.4f}', f'{crestFactor:.4f}', f'{skewValue:.4f}', f'{kurtValue:.4f}']\r
    })\r
    statsDf\r
  exercise:\r
    prompt: 통계 분석 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      rmsValue = np.sqrt(np.mean(filteredSignal**2))\r
      skewValue = stats.skew(filteredSignal)\r
      kurtValue = stats.kurtosis(filteredSignal)\r
      peakValue = np.max(np.abs(filteredSignal))\r
      crestFactor = peakValue / rmsValue\r
\r
      statsDf = pd.DataFrame({\r
          'Metric': ['RMS', 'Peak', 'Crest Factor', 'Skewness', 'Kurtosis'],\r
          'Value': [f'{rmsValue:.4f}', f'{peakValue:.4f}', f'{crestFactor:.4f}', f'{skewValue:.4f}', f'{kurtValue:.4f}']\r
      })\r
      statsDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 통계 분석의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 통계 분석의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: trend\r
  title: 시간 추이 분석\r
  structuredPrimary: true\r
  subtitle: 상태 변화 모니터링\r
  goal: 시간 추이 분석에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: 신호를 세그먼트로 나누어 시간에 따른 특성 변화를 분석합니다. 결함이 진행되면 RMS와 첨도가 점진적으로 증가하는 경향을 보입니다. 이 추이를 모니터링하면\r
    고장을 예측할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    segmentLen = 1000\r
    nSegments = n // segmentLen\r
    segmentRms = []\r
    segmentKurt = []\r
\r
    for i in range(nSegments):\r
        seg = filteredSignal[i*segmentLen:(i+1)*segmentLen]\r
        segmentRms.append(np.sqrt(np.mean(seg**2)))\r
        segmentKurt.append(stats.kurtosis(seg))\r
\r
    segmentTime = np.arange(nSegments) * (segmentLen / fs)\r
  exercise:\r
    prompt: 시간 추이 분석 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      segmentLen = 1000\r
      nSegments = n // segmentLen\r
      segmentRms = []\r
      segmentKurt = []\r
\r
      for i in range(nSegments):\r
          seg = filteredSignal[i*segmentLen:(i+1)*segmentLen]\r
          segmentRms.append(np.sqrt(np.mean(seg**2)))\r
          segmentKurt.append(stats.kurtosis(seg))\r
\r
      segmentTime = np.arange(nSegments) * (segmentLen / fs)\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 시간 추이 분석의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 시간 추이 분석 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: fitting\r
  title: 진폭 피팅\r
  structuredPrimary: true\r
  subtitle: scipy.optimize\r
  goal: 진폭 피팅에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: RMS 값의 시간 변화에 지수함수를 피팅하여 결함 진행 속도를 추정합니다. 지수적 성장 모델은 베어링 결함의 전형적인 진행 패턴입니다. 피팅된 파라미터로 남은\r
    수명을 예측할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    def expGrowth(tVal, a, b, c):\r
        return a * np.exp(b * tVal) + c\r
\r
    try:\r
        fitParams, fitCov = optimize.curve_fit(\r
            expGrowth, segmentTime, segmentRms,\r
            p0=[0.01, 0.1, np.mean(segmentRms)],\r
            maxfev=5000\r
        )\r
        aFit, bFit, cFit = fitParams\r
        rmsFit = expGrowth(segmentTime, aFit, bFit, cFit)\r
        fitSuccess = True\r
    except (RuntimeError, ValueError):\r
        fitSuccess = False\r
        rmsFit = np.ones_like(segmentTime) * np.mean(segmentRms)\r
\r
    figFit, axFit = plt.subplots(figsize=(10, 5))\r
    axFit.scatter(segmentTime, segmentRms, s=50, c='blue', label='Measured RMS')\r
    axFit.plot(segmentTime, rmsFit, 'r-', linewidth=2, label='Fitted Trend')\r
    axFit.set_xlabel('Time (s)')\r
    axFit.set_ylabel('RMS')\r
    axFit.set_title('RMS Trend with Exponential Fit')\r
    axFit.legend()\r
    axFit.grid(True, alpha=0.3)\r
    figFit\r
  exercise:\r
    prompt: 진폭 피팅 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      def expGrowth(tVal, a, b, c):\r
          return a * np.exp(b * tVal) + c\r
\r
      try:\r
          fitParams, fitCov = optimize.curve_fit(\r
              expGrowth, segmentTime, segmentRms,\r
              p0=[0.01, 0.1, np.mean(segmentRms)],\r
              maxfev=5000\r
          )\r
          aFit, bFit, cFit = fitParams\r
          rmsFit = expGrowth(segmentTime, aFit, bFit, cFit)\r
          fitSuccess = True\r
      except (RuntimeError, ValueError):\r
          fitSuccess = False\r
          rmsFit = np.ones_like(segmentTime) * np.mean(segmentRms)\r
\r
      figFit, axFit = plt.subplots(figsize=(10, 5))\r
      axFit.scatter(segmentTime, segmentRms, s=50, c='blue', label='Measured RMS')\r
      axFit.plot(segmentTime, rmsFit, 'r-', linewidth=2, label='Fitted Trend')\r
      axFit.set_xlabel('Time (s)')\r
      axFit.set_ylabel('RMS')\r
      axFit.set_title('RMS Trend with Exponential Fit')\r
      axFit.legend()\r
      axFit.grid(True, alpha=0.3)\r
      figFit\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 진폭 피팅의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 진폭 피팅 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: energy\r
  title: 에너지 계산\r
  structuredPrimary: true\r
  subtitle: scipy.integrate\r
  goal: 에너지 계산에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 진동 에너지(신호 제곱의 적분)는 피로 손상과 관련됩니다. 누적 에너지를 계산하면 기계가 받은 총 스트레스를 추정할 수 있습니다. 이 값이 임계치를 넘으면\r
    부품 교체가 필요합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    signalSquared = filteredSignal ** 2\r
    cumulativeEnergy = integrate.cumulative_trapezoid(signalSquared, t, initial=0)\r
    totalEnergy = cumulativeEnergy[-1]\r
\r
    figEnergy, (axEnergyS, axEnergyC) = plt.subplots(2, 1, figsize=(12, 6), sharex=True)\r
\r
    axEnergyS.plot(t, signalSquared, 'b-', linewidth=0.3, alpha=0.5)\r
    axEnergyS.set_ylabel('Signal²')\r
    axEnergyS.set_title('Squared Vibration Signal')\r
    axEnergyS.grid(True, alpha=0.3)\r
\r
    axEnergyC.plot(t, cumulativeEnergy, 'r-', linewidth=2)\r
    axEnergyC.set_xlabel('Time (s)')\r
    axEnergyC.set_ylabel('Cumulative Energy')\r
    axEnergyC.set_title(f'Cumulative Vibration Energy (Total: {totalEnergy:.2f})')\r
    axEnergyC.grid(True, alpha=0.3)\r
\r
    plt.tight_layout()\r
    figEnergy\r
  exercise:\r
    prompt: 에너지 계산 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      signalSquared = filteredSignal ** 2\r
      cumulativeEnergy = integrate.cumulative_trapezoid(signalSquared, t, initial=0)\r
      totalEnergy = cumulativeEnergy[-1]\r
\r
      figEnergy, (axEnergyS, axEnergyC) = plt.subplots(2, 1, figsize=(12, 6), sharex=True)\r
\r
      axEnergyS.plot(t, signalSquared, 'b-', linewidth=0.3, alpha=0.5)\r
      axEnergyS.set_ylabel('Signal²')\r
      axEnergyS.set_title('Squared Vibration Signal')\r
      axEnergyS.grid(True, alpha=0.3)\r
\r
      axEnergyC.plot(t, cumulativeEnergy, 'r-', linewidth=2)\r
      axEnergyC.set_xlabel('Time (s)')\r
      axEnergyC.set_ylabel('Cumulative Energy')\r
      axEnergyC.set_title(f'Cumulative Vibration Energy (Total: {totalEnergy:.2f})')\r
      axEnergyC.grid(True, alpha=0.3)\r
\r
      plt.tight_layout()\r
      figEnergy\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 에너지 계산의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 에너지 계산의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: comparison\r
  title: 정상 vs 결함 비교\r
  structuredPrimary: true\r
  subtitle: 통계 검정\r
  goal: 정상 vs 결함 비교에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 정상 상태(결함 없음)와 결함 상태의 진동 특성을 비교합니다. t-검정으로 두 상태의 RMS 값에 유의미한 차이가 있는지 확인합니다. 이런 통계 검정은 자동\r
    이상 탐지 알고리즘의 기반이 됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    np.random.seed(123)\r
    tComp = np.linspace(0, 5, 5000)\r
\r
    normalSig = np.sin(2 * np.pi * 50 * tComp) + 0.2 * np.random.randn(5000)\r
    defectSig = np.sin(2 * np.pi * 50 * tComp) + 0.5 * np.sin(2 * np.pi * 120 * tComp) + 0.3 * np.random.randn(5000)\r
\r
    segRmsNormal = [np.sqrt(np.mean(normalSig[i*500:(i+1)*500]**2)) for i in range(10)]\r
    segRmsDefect = [np.sqrt(np.mean(defectSig[i*500:(i+1)*500]**2)) for i in range(10)]\r
\r
    tStat, pValue = stats.ttest_ind(segRmsNormal, segRmsDefect)\r
\r
    testDf = pd.DataFrame({\r
        'Condition': ['Normal', 'Defect'],\r
        'Mean RMS': [f'{np.mean(segRmsNormal):.4f}', f'{np.mean(segRmsDefect):.4f}'],\r
        'Std RMS': [f'{np.std(segRmsNormal):.4f}', f'{np.std(segRmsDefect):.4f}'],\r
        't-statistic': [f'{tStat:.4f}', ''],\r
        'p-value': [f'{pValue:.6f}', '']\r
    })\r
    testDf\r
  exercise:\r
    prompt: 정상 vs 결함 비교 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      np.random.seed(123)\r
      tComp = np.linspace(0, 5, 5000)\r
\r
      normalSig = np.sin(2 * np.pi * 50 * tComp) + 0.2 * np.random.randn(5000)\r
      defectSig = np.sin(2 * np.pi * 50 * tComp) + 0.5 * np.sin(2 * np.pi * 120 * tComp) + 0.3 * np.random.randn(5000)\r
\r
      segRmsNormal = [np.sqrt(np.mean(normalSig[i*500:(i+1)*500]**2)) for i in range(10)]\r
      segRmsDefect = [np.sqrt(np.mean(defectSig[i*500:(i+1)*500]**2)) for i in range(10)]\r
\r
      tStat, pValue = stats.ttest_ind(segRmsNormal, segRmsDefect)\r
\r
      testDf = pd.DataFrame({\r
          'Condition': ['Normal', 'Defect'],\r
          'Mean RMS': [f'{np.mean(segRmsNormal):.4f}', f'{np.mean(segRmsDefect):.4f}'],\r
          'Std RMS': [f'{np.std(segRmsNormal):.4f}', f'{np.std(segRmsDefect):.4f}'],\r
          't-statistic': [f'{tStat:.4f}', ''],\r
          'p-value': [f'{pValue:.6f}', '']\r
      })\r
      testDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 정상 vs 결함 비교의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 정상 vs 결함 비교 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: result\r
  title: 분석 대시보드\r
  structuredPrimary: true\r
  subtitle: 종합 시각화\r
  goal: 분석 대시보드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 모든 분석 결과를 하나의 대시보드로 시각화합니다. 필터링된 신호, 주파수 스펙트럼, RMS 추이, 누적 에너지를 한눈에 볼 수 있습니다. 이런 대시보드는 기계\r
    상태 모니터링 시스템의 핵심입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    figDash, axesDash = plt.subplots(2, 2, figsize=(14, 10))\r
\r
    axesDash[0, 0].plot(t[:1000], filteredSignal[:1000], 'b-', linewidth=0.5)\r
    axesDash[0, 0].set_xlabel('Time (s)')\r
    axesDash[0, 0].set_ylabel('Amplitude')\r
    axesDash[0, 0].set_title('Filtered Vibration Signal')\r
    axesDash[0, 0].grid(True, alpha=0.3)\r
\r
    axesDash[0, 1].plot(posFreqs, magnitude, 'b-', linewidth=1)\r
    axesDash[0, 1].axvline(50, color='green', linestyle='--', alpha=0.7, label='50Hz')\r
    axesDash[0, 1].axvline(120, color='red', linestyle='--', alpha=0.7, label='120Hz (Defect)')\r
    axesDash[0, 1].set_xlim(0, 200)\r
    axesDash[0, 1].set_xlabel('Frequency (Hz)')\r
    axesDash[0, 1].set_ylabel('Magnitude')\r
    axesDash[0, 1].set_title('Frequency Spectrum')\r
    axesDash[0, 1].legend()\r
    axesDash[0, 1].grid(True, alpha=0.3)\r
\r
    axesDash[1, 0].scatter(segmentTime, segmentRms, s=50, c='blue', label='RMS')\r
    axesDash[1, 0].plot(segmentTime, rmsFit, 'r-', linewidth=2, label='Trend')\r
    axesDash[1, 0].set_xlabel('Time (s)')\r
    axesDash[1, 0].set_ylabel('RMS')\r
    axesDash[1, 0].set_title('RMS Trend')\r
    axesDash[1, 0].legend()\r
    axesDash[1, 0].grid(True, alpha=0.3)\r
\r
    axesDash[1, 1].plot(t, cumulativeEnergy, 'purple', linewidth=2)\r
    axesDash[1, 1].set_xlabel('Time (s)')\r
    axesDash[1, 1].set_ylabel('Cumulative Energy')\r
    axesDash[1, 1].set_title(f'Cumulative Energy (Total: {totalEnergy:.1f})')\r
    axesDash[1, 1].grid(True, alpha=0.3)\r
\r
    plt.suptitle('Vibration Analysis Dashboard', fontsize=14, fontweight='bold')\r
    plt.tight_layout()\r
    figDash\r
  exercise:\r
    prompt: 분석 대시보드 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      figDash, axesDash = plt.subplots(2, 2, figsize=(14, 10))\r
\r
      axesDash[0, 0].plot(t[:1000], filteredSignal[:1000], 'b-', linewidth=0.5)\r
      axesDash[0, 0].set_xlabel('Time (s)')\r
      axesDash[0, 0].set_ylabel('Amplitude')\r
      axesDash[0, 0].set_title('Filtered Vibration Signal')\r
      axesDash[0, 0].grid(True, alpha=0.3)\r
\r
      axesDash[0, 1].plot(posFreqs, magnitude, 'b-', linewidth=1)\r
      axesDash[0, 1].axvline(50, color='green', linestyle='--', alpha=0.7, label='50Hz')\r
      axesDash[0, 1].axvline(120, color='red', linestyle='--', alpha=0.7, label='120Hz (Defect)')\r
      axesDash[0, 1].set_xlim(0, 200)\r
      axesDash[0, 1].set_xlabel('Frequency (Hz)')\r
      axesDash[0, 1].set_ylabel('Magnitude')\r
      axesDash[0, 1].set_title('Frequency Spectrum')\r
      axesDash[0, 1].legend()\r
      axesDash[0, 1].grid(True, alpha=0.3)\r
\r
      axesDash[1, 0].scatter(segmentTime, segmentRms, s=50, c='blue', label='RMS')\r
      axesDash[1, 0].plot(segmentTime, rmsFit, 'r-', linewidth=2, label='Trend')\r
      axesDash[1, 0].set_xlabel('Time (s)')\r
      axesDash[1, 0].set_ylabel('RMS')\r
      axesDash[1, 0].set_title('RMS Trend')\r
      axesDash[1, 0].legend()\r
      axesDash[1, 0].grid(True, alpha=0.3)\r
\r
      axesDash[1, 1].plot(t, cumulativeEnergy, 'purple', linewidth=2)\r
      axesDash[1, 1].set_xlabel('Time (s)')\r
      axesDash[1, 1].set_ylabel('Cumulative Energy')\r
      axesDash[1, 1].set_title(f'Cumulative Energy (Total: {totalEnergy:.1f})')\r
      axesDash[1, 1].grid(True, alpha=0.3)\r
\r
      plt.suptitle('Vibration Analysis Dashboard', fontsize=14, fontweight='bold')\r
      plt.tight_layout()\r
      figDash\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 분석 대시보드의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 분석 대시보드 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 종합 프로젝트\r
  goal: 실습에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 함수 입력과 반환값을 작게 확인하면 이후 코드에서 같은 동작을 안전하게 재사용할 수 있습니다.\r
  explanation: 데이터 과학자가 되어 전체 분석 파이프라인을 직접 구축해보세요. 심전도(ECG) 분석이나 기상 데이터 분석처럼 다른 도메인의 데이터에 같은 기법을 적용해보세요.\r
  snippet: |-\r
    np.random.seed(456)\r
    fsEcg = 360\r
    durEcg = 10\r
    tEcg = np.linspace(0, durEcg, fsEcg * durEcg, endpoint=False)\r
\r
    def ecgWave(tVal, hr):\r
        period = 60 / hr\r
        phase = (tVal % period) / period\r
        p = 0.1 * np.exp(-((phase - 0.1) ** 2) / 0.001)\r
        qrs = np.exp(-((phase - 0.2) ** 2) / 0.0003) - 0.2 * np.exp(-((phase - 0.18) ** 2) / 0.0001)\r
        tW = 0.3 * np.exp(-((phase - 0.35) ** 2) / 0.002)\r
        return p + qrs + tW\r
\r
    ecgClean = ecgWave(tEcg, 72)\r
    ecgNoisy = ecgClean + 0.1 * np.random.randn(len(tEcg)) + 0.05 * np.sin(2 * np.pi * 60 * tEcg)\r
\r
    bNotchEcg, aNotchEcg = signal.iirnotch(60 / (fsEcg/2), 30)\r
    ecgFiltered = signal.filtfilt(bNotchEcg, aNotchEcg, ecgNoisy)\r
\r
    sosEcg = signal.butter(4, [0.5 / (fsEcg/2), 40 / (fsEcg/2)], btype='band', output='sos')\r
    ecgFinal = signal.sosfiltfilt(sosEcg, ecgFiltered)\r
  exercise:\r
    prompt: 실습 예제에서 함수 인자나 return 식을 바꾸고 같은 호출이 다른 값을 돌려주는지 확인하세요.\r
    starterCode: |-\r
      np.random.seed(456)\r
      fsEcg = 360\r
      durEcg = 10\r
      tEcg = np.linspace(0, durEcg, fsEcg * durEcg, endpoint=False)\r
\r
      def ecgWave(tVal, hr):\r
          period = 60 / hr\r
          phase = (tVal % period) / period\r
          p = 0.1 * np.exp(-((phase - 0.1) ** 2) / 0.001)\r
          qrs = np.exp(-((phase - 0.2) ** 2) / 0.0003) - 0.2 * np.exp(-((phase - 0.18) ** 2) / 0.0001)\r
          tW = 0.3 * np.exp(-((phase - 0.35) ** 2) / 0.002)\r
          return p + qrs + tW\r
\r
      ecgClean = ecgWave(tEcg, 72)\r
      ecgNoisy = ecgClean + 0.1 * np.random.randn(len(tEcg)) + 0.05 * np.sin(2 * np.pi * 60 * tEcg)\r
\r
      bNotchEcg, aNotchEcg = signal.iirnotch(60 / (fsEcg/2), 30)\r
      ecgFiltered = signal.filtfilt(bNotchEcg, aNotchEcg, ecgNoisy)\r
\r
      sosEcg = signal.butter(4, [0.5 / (fsEcg/2), 40 / (fsEcg/2)], btype='band', output='sos')\r
      ecgFinal = signal.sosfiltfilt(sosEcg, ecgFiltered)\r
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