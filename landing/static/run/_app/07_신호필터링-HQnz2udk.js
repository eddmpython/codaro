var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scipy\r
  id: scipy_07\r
  title: 신호필터링\r
  order: 7\r
  category: scipy\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - scipy.signal\r
  - 필터\r
  - butter\r
  - filtfilt\r
  - 노이즈제거\r
  seo:\r
    title: scipy.signal 필터링 - 노이즈 제거와 신호 처리\r
    description: scipy.signal로 신호에서 노이즈를 제거합니다. 버터워스 필터, 저역통과, 고역통과 필터를 배웁니다.\r
    keywords:\r
    - scipy\r
    - signal\r
    - filter\r
    - butter\r
    - 노이즈제거\r
intro:\r
  emoji: 🔊\r
  goal: scipy.signal로 신호에서 노이즈를 제거하고 원하는 주파수 성분을 추출합니다.\r
  description: 센서 데이터, 오디오 신호, 생체신호에서 노이즈를 제거하는 디지털 필터를 설계하고 적용합니다. 버터워스 필터를 중심으로 저역통과, 고역통과, 대역통과 필터를\r
    배웁니다.\r
  direction: 신호필터링에서 수치 데이터를 모델에 넣고 계산 결과와 오차를 검증합니다.\r
  benefits:\r
  - 수치 입력 확인 후 최적화/적분/신호 처리에 맞는 코드 입력을 고릅니다.\r
  - 신호필터링 결과를 오차와 결과 범위 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 과학 계산 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 데이터 로드 입력 확인\r
      detail: 입력 기준(수치 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 버터워스 필터 설계 처리 실행\r
      detail: 최적화/적분/신호 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 주파수 응답 결과 검증\r
      detail: 오차와 결과 범위 기준으로 실행 결과를 비교합니다.\r
    - label: 신호필터링 재사용\r
      detail: 완성 코드를 과학 계산 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 과학 계산 환경\r
      detail: matplotlib, numpy, pandas, scipy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 신호필터링 실행\r
      detail: 셀을 실행해 오차와 결과 범위와 예외 상태를 확인합니다.\r
    - label: 신호필터링 완료\r
      detail: 검증된 코드를 과학 계산 루틴로 남깁니다.\r
sections:\r
- id: load\r
  title: 데이터 로드\r
  structuredPrimary: true\r
  subtitle: 노이즈가 섞인 신호\r
  goal: 데이터 로드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 디지털 신호 처리(DSP)에서 필터는 특정 주파수 대역을 통과시키거나 제거합니다. 이 프로젝트에서는 5Hz 사인파에 고주파 노이즈가 섞인 신호를 생성하고,\r
    필터링으로 원래 신호를 복원합니다. 실제 센서 데이터나 생체신호 분석에서 필수적인 기술입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import scipy\r
\r
    import numpy as np\r
    from scipy import signal\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    fs = 500\r
    t = np.linspace(0, 1, fs)\r
\r
    cleanSig = np.sin(2 * np.pi * 5 * t)\r
    noise = 0.5 * np.sin(2 * np.pi * 50 * t) + 0.3 * np.random.randn(len(t))\r
    noisySig = cleanSig + noise\r
  exercise:\r
    prompt: 데이터 로드 예제에서 \`fs\`, \`t\`, \`cleanSig\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import scipy\r
\r
      import numpy as np\r
      from scipy import signal\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      fs = 500\r
      t = np.linspace(0, 1, fs)\r
\r
      cleanSig = np.sin(2 * np.pi * 5 * t)\r
      noise = 0.5 * np.sin(2 * np.pi * 50 * t) + 0.3 * np.random.randn(len(t))\r
      noisySig = cleanSig + noise\r
    hints:\r
    - 바꿀 지점은 \`fs = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`fs\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 데이터 로드에서 \`fs\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 데이터 로드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: butter\r
  title: 버터워스 필터 설계\r
  structuredPrimary: true\r
  subtitle: signal.butter\r
  goal: 버터워스 필터 설계에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    버터워스 필터는 통과대역에서 가장 평탄한 주파수 응답을 가집니다. butter 함수로 필터 계수(b, a)를 설계합니다. 차단 주파수는 나이퀴스트 주파수(샘플링 주파수의 절반)로 정규화해야 합니다.\r
\r
    btype='low'는 저역통과(저주파만 통과), 'high'는 고역통과, 'band'는 대역통과입니다. order가 높을수록 전이대역이 급격하지만 위상왜곡이 커집니다.\r
  snippet: |-\r
    cutoff = 10\r
    nyquist = fs / 2\r
    normalCutoff = cutoff / nyquist\r
    order = 4\r
\r
    b, a = signal.butter(order, normalCutoff, btype='low')\r
\r
    filterDf = pd.DataFrame({\r
        'Parameter': ['Cutoff Frequency', 'Nyquist Frequency', 'Normalized Cutoff', 'Filter Order'],\r
        'Value': [f'{cutoff} Hz', f'{nyquist} Hz', f'{normalCutoff:.3f}', order]\r
    })\r
    filterDf\r
  exercise:\r
    prompt: 버터워스 필터 설계 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      cutoff = 10\r
      nyquist = fs / 2\r
      normalCutoff = cutoff / nyquist\r
      order = 4\r
\r
      b, a = signal.butter(order, normalCutoff, btype='low')\r
\r
      filterDf = pd.DataFrame({\r
          'Parameter': ['Cutoff Frequency', 'Nyquist Frequency', 'Normalized Cutoff', 'Filter Order'],\r
          'Value': [f'{cutoff} Hz', f'{nyquist} Hz', f'{normalCutoff:.3f}', order]\r
      })\r
      filterDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 버터워스 필터 설계의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 버터워스 필터 설계의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: freqresp\r
  title: 주파수 응답\r
  structuredPrimary: true\r
  subtitle: 필터 특성 확인\r
  goal: 주파수 응답에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 설계된 필터가 각 주파수를 얼마나 통과시키는지 주파수 응답으로 확인합니다. -3dB 지점이 차단 주파수이며, 이 지점에서 신호 전력이 절반으로 감소합니다.\r
    차단 주파수 이상의 고주파는 급격히 감쇄됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    w, h = signal.freqz(b, a, worN=2000)\r
    freqs = w * fs / (2 * np.pi)\r
\r
    figFreq, (axFreqM, axFreqP) = plt.subplots(2, 1, figsize=(10, 6), sharex=True)\r
\r
    axFreqM.plot(freqs, 20 * np.log10(abs(h)), 'b-', linewidth=2)\r
    axFreqM.axvline(cutoff, color='r', linestyle='--', label=f'Cutoff: {cutoff} Hz')\r
    axFreqM.axhline(-3, color='gray', linestyle=':', label='-3 dB')\r
    axFreqM.set_ylabel('Magnitude (dB)')\r
    axFreqM.set_title('Butterworth Lowpass Filter Frequency Response')\r
    axFreqM.set_ylim(-60, 5)\r
    axFreqM.legend()\r
    axFreqM.grid(True, alpha=0.3)\r
\r
    axFreqP.plot(freqs, np.angle(h, deg=True), 'g-', linewidth=2)\r
    axFreqP.set_xlabel('Frequency (Hz)')\r
    axFreqP.set_ylabel('Phase (degrees)')\r
    axFreqP.grid(True, alpha=0.3)\r
\r
    plt.tight_layout()\r
    figFreq\r
  exercise:\r
    prompt: 주파수 응답 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      w, h = signal.freqz(b, a, worN=2000)\r
      freqs = w * fs / (2 * np.pi)\r
\r
      figFreq, (axFreqM, axFreqP) = plt.subplots(2, 1, figsize=(10, 6), sharex=True)\r
\r
      axFreqM.plot(freqs, 20 * np.log10(abs(h)), 'b-', linewidth=2)\r
      axFreqM.axvline(cutoff, color='r', linestyle='--', label=f'Cutoff: {cutoff} Hz')\r
      axFreqM.axhline(-3, color='gray', linestyle=':', label='-3 dB')\r
      axFreqM.set_ylabel('Magnitude (dB)')\r
      axFreqM.set_title('Butterworth Lowpass Filter Frequency Response')\r
      axFreqM.set_ylim(-60, 5)\r
      axFreqM.legend()\r
      axFreqM.grid(True, alpha=0.3)\r
\r
      axFreqP.plot(freqs, np.angle(h, deg=True), 'g-', linewidth=2)\r
      axFreqP.set_xlabel('Frequency (Hz)')\r
      axFreqP.set_ylabel('Phase (degrees)')\r
      axFreqP.grid(True, alpha=0.3)\r
\r
      plt.tight_layout()\r
      figFreq\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 주파수 응답의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 주파수 응답의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: filtfilt\r
  title: 제로위상 필터링\r
  structuredPrimary: true\r
  subtitle: signal.filtfilt\r
  goal: 제로위상 필터링에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: filtfilt은 신호를 정방향과 역방향으로 두 번 필터링하여 위상 왜곡을 제거합니다. 시간 지연 없이 깨끗한 필터링 결과를 얻습니다. 오프라인 분석에서는\r
    항상 filtfilt을 사용하는 것이 좋습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    filteredSig = signal.filtfilt(b, a, noisySig)\r
\r
    figFilt, axFilt = plt.subplots(figsize=(12, 5))\r
\r
    axFilt.plot(t, noisySig, 'r-', alpha=0.5, linewidth=0.8, label='Noisy')\r
    axFilt.plot(t, filteredSig, 'b-', linewidth=2, label='Filtered')\r
    axFilt.plot(t, cleanSig, 'g--', linewidth=1.5, label='Original Clean')\r
\r
    axFilt.set_xlabel('Time (s)')\r
    axFilt.set_ylabel('Amplitude')\r
    axFilt.set_title('Noise Removal with Butterworth Lowpass Filter')\r
    axFilt.legend()\r
    axFilt.grid(True, alpha=0.3)\r
    figFilt\r
  exercise:\r
    prompt: 제로위상 필터링 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      filteredSig = signal.filtfilt(b, a, noisySig)\r
\r
      figFilt, axFilt = plt.subplots(figsize=(12, 5))\r
\r
      axFilt.plot(t, noisySig, 'r-', alpha=0.5, linewidth=0.8, label='Noisy')\r
      axFilt.plot(t, filteredSig, 'b-', linewidth=2, label='Filtered')\r
      axFilt.plot(t, cleanSig, 'g--', linewidth=1.5, label='Original Clean')\r
\r
      axFilt.set_xlabel('Time (s)')\r
      axFilt.set_ylabel('Amplitude')\r
      axFilt.set_title('Noise Removal with Butterworth Lowpass Filter')\r
      axFilt.legend()\r
      axFilt.grid(True, alpha=0.3)\r
      figFilt\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 제로위상 필터링의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 제로위상 필터링의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: lfilter\r
  title: lfilter vs filtfilt\r
  structuredPrimary: true\r
  subtitle: 위상 지연 비교\r
  goal: lfilter vs filtfilt에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    lfilter는 실시간 필터링에 사용하지만 위상 지연이 발생합니다. 실시간 처리가 필요한 경우(예: 라이브 센서)에만 lfilter를 사용하고, 오프라인 분석에서는 filtfilt을 사용하세요.\r
\r
    lfilter의 위상 지연은 필터 차수와 차단 주파수에 따라 달라집니다. filtfilt은 두 번 필터링하므로 감쇄가 2배가 되어 더 급격한 롤오프를 보입니다.\r
  snippet: |-\r
    lfilterResult = signal.lfilter(b, a, noisySig)\r
\r
    figLfilt, axLfilt = plt.subplots(figsize=(12, 5))\r
\r
    axLfilt.plot(t, cleanSig, 'g--', linewidth=2, label='Original')\r
    axLfilt.plot(t, lfilterResult, 'r-', linewidth=1.5, alpha=0.7, label='lfilter (has delay)')\r
    axLfilt.plot(t, filteredSig, 'b-', linewidth=1.5, label='filtfilt (zero-phase)')\r
\r
    axLfilt.set_xlim(0, 0.3)\r
    axLfilt.set_xlabel('Time (s)')\r
    axLfilt.set_ylabel('Amplitude')\r
    axLfilt.set_title('lfilter vs filtfilt - Phase Delay Comparison')\r
    axLfilt.legend()\r
    axLfilt.grid(True, alpha=0.3)\r
    figLfilt\r
  exercise:\r
    prompt: lfilter vs filtfilt 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      lfilterResult = signal.lfilter(b, a, noisySig)\r
\r
      figLfilt, axLfilt = plt.subplots(figsize=(12, 5))\r
\r
      axLfilt.plot(t, cleanSig, 'g--', linewidth=2, label='Original')\r
      axLfilt.plot(t, lfilterResult, 'r-', linewidth=1.5, alpha=0.7, label='lfilter (has delay)')\r
      axLfilt.plot(t, filteredSig, 'b-', linewidth=1.5, label='filtfilt (zero-phase)')\r
\r
      axLfilt.set_xlim(0, 0.3)\r
      axLfilt.set_xlabel('Time (s)')\r
      axLfilt.set_ylabel('Amplitude')\r
      axLfilt.set_title('lfilter vs filtfilt - Phase Delay Comparison')\r
      axLfilt.legend()\r
      axLfilt.grid(True, alpha=0.3)\r
      figLfilt\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: lfilter vs filtfilt의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: lfilter vs filtfilt의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: highpass\r
  title: 고역통과 필터\r
  structuredPrimary: true\r
  subtitle: 저주파 제거\r
  goal: 고역통과 필터에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 고역통과 필터는 저주파 성분(드리프트, DC 오프셋)을 제거합니다. 심전도(ECG) 신호에서 기저선 변동을 제거하거나, 가속도계에서 중력 성분을 제거할 때\r
    사용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    drift = 0.5 * np.sin(2 * np.pi * 0.5 * t)\r
    driftSig = cleanSig + drift\r
  exercise:\r
    prompt: 고역통과 필터 예제에서 \`drift\`, \`driftSig\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      drift = 0.5 * np.sin(2 * np.pi * 0.5 * t)\r
      driftSig = cleanSig + drift\r
    hints:\r
    - 바꿀 지점은 \`drift = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`drift\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 고역통과 필터에서 \`drift\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 고역통과 필터 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: bandpass\r
  title: 대역통과 필터\r
  structuredPrimary: true\r
  subtitle: 특정 주파수 대역 추출\r
  goal: 대역통과 필터에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 대역통과 필터는 두 차단 주파수 사이의 성분만 통과시킵니다. 특정 주파수 대역의 신호를 추출할 때 사용합니다. 예를 들어 심박수 분석에서 0.5-4Hz 대역만\r
    추출하거나, 특정 진동 주파수를 분석할 때 유용합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    comp1 = np.sin(2 * np.pi * 5 * t)\r
    comp2 = 0.5 * np.sin(2 * np.pi * 20 * t)\r
    comp3 = 0.3 * np.sin(2 * np.pi * 60 * t)\r
    complexSig = comp1 + comp2 + comp3\r
  exercise:\r
    prompt: 대역통과 필터 예제에서 \`comp1\`, \`comp2\`, \`comp3\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      comp1 = np.sin(2 * np.pi * 5 * t)\r
      comp2 = 0.5 * np.sin(2 * np.pi * 20 * t)\r
      comp3 = 0.3 * np.sin(2 * np.pi * 60 * t)\r
      complexSig = comp1 + comp2 + comp3\r
    hints:\r
    - 바꿀 지점은 \`comp1 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`comp1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 대역통과 필터에서 \`comp1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 대역통과 필터 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: notch\r
  title: 노치 필터\r
  structuredPrimary: true\r
  subtitle: 특정 주파수 제거\r
  goal: 노치 필터에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 노치(대역저지) 필터는 특정 주파수만 제거합니다. 전력선 간섭(50Hz 또는 60Hz)을 제거할 때 주로 사용합니다. 생체신호(ECG, EEG) 분석에서 필수적인\r
    전처리 단계입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    notchFreq = 50\r
    quality = 30\r
    bNotch, aNotch = signal.iirnotch(notchFreq / nyquist, quality)\r
\r
    powerNoise = 0.8 * np.sin(2 * np.pi * 50 * t)\r
    contaminated = cleanSig + powerNoise\r
    notchFiltered = signal.filtfilt(bNotch, aNotch, contaminated)\r
\r
    figNotch, axNotch = plt.subplots(figsize=(12, 5))\r
    axNotch.plot(t, contaminated, 'r-', alpha=0.5, linewidth=0.8, label='With 50Hz Noise')\r
    axNotch.plot(t, notchFiltered, 'b-', linewidth=1.5, label='Notch Filtered')\r
    axNotch.plot(t, cleanSig, 'g--', alpha=0.7, label='Original')\r
    axNotch.set_xlim(0, 0.5)\r
    axNotch.set_xlabel('Time (s)')\r
    axNotch.set_ylabel('Amplitude')\r
    axNotch.set_title('50Hz Power Line Noise Removal')\r
    axNotch.legend()\r
    axNotch.grid(True, alpha=0.3)\r
    figNotch\r
  exercise:\r
    prompt: 노치 필터 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      notchFreq = 50\r
      quality = 30\r
      bNotch, aNotch = signal.iirnotch(notchFreq / nyquist, quality)\r
\r
      powerNoise = 0.8 * np.sin(2 * np.pi * 50 * t)\r
      contaminated = cleanSig + powerNoise\r
      notchFiltered = signal.filtfilt(bNotch, aNotch, contaminated)\r
\r
      figNotch, axNotch = plt.subplots(figsize=(12, 5))\r
      axNotch.plot(t, contaminated, 'r-', alpha=0.5, linewidth=0.8, label='With 50Hz Noise')\r
      axNotch.plot(t, notchFiltered, 'b-', linewidth=1.5, label='Notch Filtered')\r
      axNotch.plot(t, cleanSig, 'g--', alpha=0.7, label='Original')\r
      axNotch.set_xlim(0, 0.5)\r
      axNotch.set_xlabel('Time (s)')\r
      axNotch.set_ylabel('Amplitude')\r
      axNotch.set_title('50Hz Power Line Noise Removal')\r
      axNotch.legend()\r
      axNotch.grid(True, alpha=0.3)\r
      figNotch\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 노치 필터의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 노치 필터의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: sos\r
  title: SOS 형식 필터\r
  structuredPrimary: true\r
  subtitle: 수치 안정성\r
  goal: SOS 형식 필터에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    높은 차수의 필터는 b/a 형식으로 불안정할 수 있습니다. SOS(Second-Order Sections) 형식이 더 안정적입니다. 고차 필터(order > 4)에서는 SOS를 권장합니다.\r
\r
    output='sos'로 SOS 형식 계수를 얻고, sosfiltfilt로 필터링합니다. 수치적으로 훨씬 안정적이며, 특히 협대역 필터에서 중요합니다.\r
  snippet: |-\r
    sos = signal.butter(8, normalCutoff, btype='low', output='sos')\r
    sosFiltered = signal.sosfiltfilt(sos, noisySig)\r
\r
    figSos, axSos = plt.subplots(figsize=(12, 5))\r
    axSos.plot(t, noisySig, 'r-', alpha=0.4, linewidth=0.8, label='Noisy')\r
    axSos.plot(t, sosFiltered, 'b-', linewidth=2, label='SOS Filtered (order 8)')\r
    axSos.plot(t, cleanSig, 'g--', linewidth=1.5, label='Original')\r
    axSos.set_xlabel('Time (s)')\r
    axSos.set_ylabel('Amplitude')\r
    axSos.set_title('Filtering with SOS Format (Higher Order)')\r
    axSos.legend()\r
    axSos.grid(True, alpha=0.3)\r
    figSos\r
  exercise:\r
    prompt: SOS 형식 필터 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      sos = signal.butter(8, normalCutoff, btype='low', output='sos')\r
      sosFiltered = signal.sosfiltfilt(sos, noisySig)\r
\r
      figSos, axSos = plt.subplots(figsize=(12, 5))\r
      axSos.plot(t, noisySig, 'r-', alpha=0.4, linewidth=0.8, label='Noisy')\r
      axSos.plot(t, sosFiltered, 'b-', linewidth=2, label='SOS Filtered (order 8)')\r
      axSos.plot(t, cleanSig, 'g--', linewidth=1.5, label='Original')\r
      axSos.set_xlabel('Time (s)')\r
      axSos.set_ylabel('Amplitude')\r
      axSos.set_title('Filtering with SOS Format (Higher Order)')\r
      axSos.legend()\r
      axSos.grid(True, alpha=0.3)\r
      figSos\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: SOS 형식 필터의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: SOS 형식 필터의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: result\r
  title: 필터 선택 가이드\r
  structuredPrimary: true\r
  subtitle: 상황별 권장\r
  goal: 필터 선택 가이드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 필터 유형은 제거하려는 노이즈의 주파수 특성에 따라 선택합니다. 고주파 노이즈는 저역통과, 저주파 드리프트는 고역통과, 특정 간섭은 노치 필터를 사용합니다.\r
    필터 차수는 4-6차가 일반적이며, 높은 차수는 SOS 형식을 사용하세요.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    guideDf = pd.DataFrame({\r
        'Filter Type': ['Lowpass', 'Highpass', 'Bandpass', 'Notch'],\r
        'Purpose': ['고주파 노이즈 제거', '저주파 드리프트 제거', '특정 대역 추출', '특정 주파수 제거'],\r
        'Example Use': ['센서 스무딩', 'ECG 기저선 보정', '특정 진동 추출', '전력선 간섭 제거'],\r
        'btype': ['low', 'high', 'band', 'iirnotch']\r
    })\r
    guideDf\r
  exercise:\r
    prompt: 필터 선택 가이드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      guideDf = pd.DataFrame({\r
          'Filter Type': ['Lowpass', 'Highpass', 'Bandpass', 'Notch'],\r
          'Purpose': ['고주파 노이즈 제거', '저주파 드리프트 제거', '특정 대역 추출', '특정 주파수 제거'],\r
          'Example Use': ['센서 스무딩', 'ECG 기저선 보정', '특정 진동 추출', '전력선 간섭 제거'],\r
          'btype': ['low', 'high', 'band', 'iirnotch']\r
      })\r
      guideDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 필터 선택 가이드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 필터 선택 가이드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 신호처리 프로젝트\r
  goal: 실습에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 신호처리 엔지니어가 되어 다양한 노이즈를 제거해보세요. ECG 신호에서 기저선 변동과 전력선 간섭을 동시에 제거하거나, 가속도계 데이터에서 고주파 진동을 필터링하세요.\r
  snippet: |-\r
    fsEcg = 360\r
    tEcg = np.linspace(0, 2, fsEcg * 2)\r
    nyqEcg = fsEcg / 2\r
\r
    ecgClean = np.sin(2 * np.pi * 1.2 * tEcg) * np.exp(-((tEcg % 0.8 - 0.1) ** 2) / 0.01)\r
    ecgClean += 0.3 * np.sin(2 * np.pi * 1.2 * tEcg)\r
\r
    baseline = 0.5 * np.sin(2 * np.pi * 0.3 * tEcg)\r
    powerline = 0.2 * np.sin(2 * np.pi * 60 * tEcg)\r
    muscle = 0.1 * np.random.randn(len(tEcg))\r
    ecgNoisy = ecgClean + baseline + powerline + muscle\r
  exercise:\r
    prompt: 실습 예제에서 \`fsEcg\`, \`tEcg\`, \`nyqEcg\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      fsEcg = 360\r
      tEcg = np.linspace(0, 2, fsEcg * 2)\r
      nyqEcg = fsEcg / 2\r
\r
      ecgClean = np.sin(2 * np.pi * 1.2 * tEcg) * np.exp(-((tEcg % 0.8 - 0.1) ** 2) / 0.01)\r
      ecgClean += 0.3 * np.sin(2 * np.pi * 1.2 * tEcg)\r
\r
      baseline = 0.5 * np.sin(2 * np.pi * 0.3 * tEcg)\r
      powerline = 0.2 * np.sin(2 * np.pi * 60 * tEcg)\r
      muscle = 0.1 * np.random.randn(len(tEcg))\r
      ecgNoisy = ecgClean + baseline + powerline + muscle\r
    hints:\r
    - 바꿀 지점은 \`fsEcg = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`fsEcg\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`fsEcg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
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