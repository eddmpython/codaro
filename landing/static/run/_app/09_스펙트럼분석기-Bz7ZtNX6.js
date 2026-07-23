var e=`meta:\r
  packages:\r
  - matplotlib\r
  - numpy\r
  - pandas\r
  - scipy\r
  id: scipy_09\r
  title: 스펙트럼분석기\r
  order: 9\r
  category: scipy\r
  difficulty: ⭐⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - scipy.fft\r
  - FFT\r
  - 스펙트럼\r
  - 주파수분석\r
  - 스펙트로그램\r
  seo:\r
    title: scipy.fft 스펙트럼 분석 - 주파수 성분 분석하기\r
    description: scipy.fft로 신호의 주파수 성분을 분석합니다. FFT, 파워 스펙트럼, 스펙트로그램을 배웁니다.\r
    keywords:\r
    - scipy\r
    - fft\r
    - 스펙트럼\r
    - 주파수분석\r
    - 푸리에변환\r
intro:\r
  emoji: 📊\r
  goal: scipy.fft로 신호를 주파수 영역에서 분석합니다.\r
  description: 시간 영역 신호를 주파수 영역으로 변환하여 어떤 주파수 성분으로 구성되어 있는지 분석합니다. 오디오, 진동, 심장박동 등 다양한 신호 분석에 활용합니다.\r
  direction: 스펙트럼분석기에서 수치 데이터를 모델에 넣고 계산 결과와 오차를 검증합니다.\r
  benefits:\r
  - 수치 입력 확인 후 최적화/적분/신호 처리에 맞는 코드 입력을 고릅니다.\r
  - 스펙트럼분석기 결과를 오차와 결과 범위 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 과학 계산 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 데이터 로드 입력 확인\r
      detail: 입력 기준(수치 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: FFT 수행 처리 실행\r
      detail: 최적화/적분/신호 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 주파수 스펙트럼 결과 검증\r
      detail: 오차와 결과 범위 기준으로 실행 결과를 비교합니다.\r
    - label: 스펙트럼분석기 재사용\r
      detail: 완성 코드를 과학 계산 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 과학 계산 환경\r
      detail: matplotlib, numpy, pandas, scipy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 스펙트럼분석기 실행\r
      detail: 셀을 실행해 오차와 결과 범위와 예외 상태를 확인합니다.\r
    - label: 스펙트럼분석기 완료\r
      detail: 검증된 코드를 과학 계산 루틴로 남깁니다.\r
sections:\r
- id: load\r
  title: 데이터 로드\r
  structuredPrimary: true\r
  subtitle: 복합 신호 생성\r
  goal: 데이터 로드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 푸리에 변환(FFT)은 시간 영역 신호를 주파수 영역으로 변환합니다. 복잡한 신호가 어떤 주파수 성분들의 합으로 구성되어 있는지 분해할 수 있습니다. 이 프로젝트에서는\r
    여러 주파수가 합성된 신호를 생성하고 FFT로 각 주파수를 검출합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    import scipy\r
\r
    import numpy as np\r
    from scipy import fft\r
    from scipy import signal\r
    import matplotlib.pyplot as plt\r
    import pandas as pd\r
\r
    fs = 500\r
    duration = 2\r
    t = np.linspace(0, duration, fs * duration, endpoint=False)\r
\r
    freq1, amp1 = 5, 1.0\r
    freq2, amp2 = 15, 0.5\r
    freq3, amp3 = 30, 0.3\r
\r
    sig1 = amp1 * np.sin(2 * np.pi * freq1 * t)\r
    sig2 = amp2 * np.sin(2 * np.pi * freq2 * t)\r
    sig3 = amp3 * np.sin(2 * np.pi * freq3 * t)\r
\r
    compositeSignal = sig1 + sig2 + sig3\r
  exercise:\r
    prompt: 데이터 로드 예제에서 \`fs\`, \`duration\`, \`t\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      import scipy\r
\r
      import numpy as np\r
      from scipy import fft\r
      from scipy import signal\r
      import matplotlib.pyplot as plt\r
      import pandas as pd\r
\r
      fs = 500\r
      duration = 2\r
      t = np.linspace(0, duration, fs * duration, endpoint=False)\r
\r
      freq1, amp1 = 5, 1.0\r
      freq2, amp2 = 15, 0.5\r
      freq3, amp3 = 30, 0.3\r
\r
      sig1 = amp1 * np.sin(2 * np.pi * freq1 * t)\r
      sig2 = amp2 * np.sin(2 * np.pi * freq2 * t)\r
      sig3 = amp3 * np.sin(2 * np.pi * freq3 * t)\r
\r
      compositeSignal = sig1 + sig2 + sig3\r
    hints:\r
    - 바꿀 지점은 \`fs = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`fs\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 데이터 로드에서 \`fs\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 데이터 로드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: fftcalc\r
  title: FFT 수행\r
  structuredPrimary: true\r
  subtitle: fft.fft\r
  goal: FFT 수행에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    fft.fft는 시간 영역 신호를 주파수 영역으로 변환합니다. 결과는 복소수이며, 크기(절대값)가 각 주파수의 진폭을 나타냅니다. fftfreq로 각 빈에 해당하는 주파수를 계산합니다.\r
\r
    fftfreq는 각 FFT 빈에 해당하는 주파수를 반환합니다. 결과는 양수와 음수 주파수를 모두 포함하며, 실수 신호에서는 보통 양수 부분만 사용합니다.\r
  snippet: |-\r
    n = len(compositeSignal)\r
    fftResult = fft.fft(compositeSignal)\r
    freqs = fft.fftfreq(n, 1/fs)\r
\r
    magnitude = np.abs(fftResult) / n\r
  exercise:\r
    prompt: FFT 수행 예제에서 \`n\`, \`fftResult\`, \`freqs\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      n = len(compositeSignal)\r
      fftResult = fft.fft(compositeSignal)\r
      freqs = fft.fftfreq(n, 1/fs)\r
\r
      magnitude = np.abs(fftResult) / n\r
    hints:\r
    - 바꿀 지점은 \`n = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`n\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: FFT 수행에서 \`n\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: FFT 수행 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: spectrum\r
  title: 주파수 스펙트럼\r
  structuredPrimary: true\r
  subtitle: 양수 주파수만\r
  goal: 주파수 스펙트럼에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: 실수 신호의 FFT는 대칭이므로 양수 주파수만 사용합니다. DC 성분을 제외한 나머지 진폭을 2배하여 전체 에너지를 표현합니다. 스펙트럼에서 5Hz, 15Hz,\r
    30Hz에 피크가 나타나야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    positiveFreqs = freqs[:n//2]\r
    positiveMag = 2 * magnitude[:n//2]\r
    positiveMag[0] = magnitude[0]\r
\r
    figSpectrum, axSpectrum = plt.subplots(figsize=(12, 6))\r
    axSpectrum.plot(positiveFreqs, positiveMag, 'b-', linewidth=1.5)\r
    axSpectrum.axvline(freq1, color='r', linestyle='--', alpha=0.7, label=f'{freq1} Hz')\r
    axSpectrum.axvline(freq2, color='g', linestyle='--', alpha=0.7, label=f'{freq2} Hz')\r
    axSpectrum.axvline(freq3, color='orange', linestyle='--', alpha=0.7, label=f'{freq3} Hz')\r
    axSpectrum.set_xlabel('Frequency (Hz)')\r
    axSpectrum.set_ylabel('Magnitude')\r
    axSpectrum.set_title('Frequency Spectrum (FFT)')\r
    axSpectrum.set_xlim(0, 50)\r
    axSpectrum.legend()\r
    axSpectrum.grid(True, alpha=0.3)\r
    figSpectrum\r
  exercise:\r
    prompt: 주파수 스펙트럼 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      positiveFreqs = freqs[:n//2]\r
      positiveMag = 2 * magnitude[:n//2]\r
      positiveMag[0] = magnitude[0]\r
\r
      figSpectrum, axSpectrum = plt.subplots(figsize=(12, 6))\r
      axSpectrum.plot(positiveFreqs, positiveMag, 'b-', linewidth=1.5)\r
      axSpectrum.axvline(freq1, color='r', linestyle='--', alpha=0.7, label=f'{freq1} Hz')\r
      axSpectrum.axvline(freq2, color='g', linestyle='--', alpha=0.7, label=f'{freq2} Hz')\r
      axSpectrum.axvline(freq3, color='orange', linestyle='--', alpha=0.7, label=f'{freq3} Hz')\r
      axSpectrum.set_xlabel('Frequency (Hz)')\r
      axSpectrum.set_ylabel('Magnitude')\r
      axSpectrum.set_title('Frequency Spectrum (FFT)')\r
      axSpectrum.set_xlim(0, 50)\r
      axSpectrum.legend()\r
      axSpectrum.grid(True, alpha=0.3)\r
      figSpectrum\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 주파수 스펙트럼의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 주파수 스펙트럼의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: peaks\r
  title: 피크 검출\r
  structuredPrimary: true\r
  subtitle: 주요 주파수 찾기\r
  goal: 피크 검출에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: signal.find_peaks로 스펙트럼에서 피크를 자동으로 찾아 주요 주파수를 식별합니다. height 파라미터로 최소 진폭 임계값을 설정하여 노이즈로\r
    인한 작은 피크를 무시합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    peakIdx, peakProps = signal.find_peaks(positiveMag, height=0.1)\r
    peakFreqs = positiveFreqs[peakIdx]\r
    peakMags = positiveMag[peakIdx]\r
\r
    peakDf = pd.DataFrame({\r
        'Frequency (Hz)': peakFreqs,\r
        'Magnitude': peakMags\r
    }).sort_values('Magnitude', ascending=False)\r
    peakDf\r
  exercise:\r
    prompt: 피크 검출 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      peakIdx, peakProps = signal.find_peaks(positiveMag, height=0.1)\r
      peakFreqs = positiveFreqs[peakIdx]\r
      peakMags = positiveMag[peakIdx]\r
\r
      peakDf = pd.DataFrame({\r
          'Frequency (Hz)': peakFreqs,\r
          'Magnitude': peakMags\r
      }).sort_values('Magnitude', ascending=False)\r
      peakDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 피크 검출의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 피크 검출의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: psd\r
  title: 파워 스펙트럼 밀도\r
  structuredPrimary: true\r
  subtitle: Welch 방법\r
  goal: 파워 스펙트럼 밀도에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    파워 스펙트럼 밀도(PSD)는 주파수별 에너지 분포를 나타냅니다. signal.welch는 신호를 여러 세그먼트로 나누어 평균함으로써 더 안정적인 추정을 제공합니다. 노이즈가 있는 실제 신호 분석에 적합합니다.\r
\r
    semilogy는 y축을 로그 스케일로 표시합니다. 파워가 큰 주파수와 작은 주파수를 함께 볼 수 있습니다. nperseg는 각 세그먼트 길이로, 주파수 해상도와 분산 사이의 트레이드오프가 있습니다.\r
  tips:\r
  - semilogy는 y축을 로그 스케일로 표시합니다. 파워가 큰 주파수와 작은 주파수를 함께 볼 수 있습니다. nperseg는 각 세그먼트 길이로, 주파수 해상도와 분산 사이의\r
    트레이드오프가 있습니다.\r
  snippet: |-\r
    freqsWelch, psdWelch = signal.welch(compositeSignal, fs, nperseg=256)\r
\r
    figPsd, axPsd = plt.subplots(figsize=(12, 6))\r
    axPsd.semilogy(freqsWelch, psdWelch, 'b-', linewidth=2)\r
    axPsd.set_xlabel('Frequency (Hz)')\r
    axPsd.set_ylabel('Power Spectral Density')\r
    axPsd.set_title('Power Spectrum (Welch Method)')\r
    axPsd.set_xlim(0, 50)\r
    axPsd.grid(True, alpha=0.3)\r
    figPsd\r
  exercise:\r
    prompt: 파워 스펙트럼 밀도 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      freqsWelch, psdWelch = signal.welch(compositeSignal, fs, nperseg=256)\r
\r
      figPsd, axPsd = plt.subplots(figsize=(12, 6))\r
      axPsd.semilogy(freqsWelch, psdWelch, 'b-', linewidth=2)\r
      axPsd.set_xlabel('Frequency (Hz)')\r
      axPsd.set_ylabel('Power Spectral Density')\r
      axPsd.set_title('Power Spectrum (Welch Method)')\r
      axPsd.set_xlim(0, 50)\r
      axPsd.grid(True, alpha=0.3)\r
      figPsd\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 파워 스펙트럼 밀도의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 파워 스펙트럼 밀도 실행 결과가 오차와 결과 범위 기준으로 바꾼 데이터 값이나 축 설정을 반영해야 합니다.\r
- id: spectrogram\r
  title: 스펙트로그램\r
  structuredPrimary: true\r
  subtitle: 시간-주파수 분석\r
  goal: 스펙트로그램에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 스펙트로그램은 시간에 따라 주파수 성분이 어떻게 변하는지 보여줍니다. 음성, 음악, 비정상 신호 분석에 필수적입니다. STFT(Short-Time Fourier\r
    Transform)를 기반으로 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    tChirp = np.linspace(0, 5, 5000)\r
    chirpSignal = signal.chirp(tChirp, f0=5, f1=50, t1=5, method='linear')\r
  exercise:\r
    prompt: 스펙트로그램 예제에서 \`tChirp\`, \`chirpSignal\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      tChirp = np.linspace(0, 5, 5000)\r
      chirpSignal = signal.chirp(tChirp, f0=5, f1=50, t1=5, method='linear')\r
    hints:\r
    - 바꿀 지점은 \`tChirp = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`tChirp\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 스펙트로그램에서 \`tChirp\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 스펙트로그램 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: fftfilter\r
  title: FFT 필터링\r
  structuredPrimary: true\r
  subtitle: 주파수 영역에서 필터링\r
  goal: FFT 필터링에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: FFT 영역에서 특정 주파수를 제거하고 역변환(IFFT)하면 필터링 효과를 얻습니다. 정확한 주파수 제어가 가능하지만, 급격한 차단은 링잉 현상을 일으킬 수\r
    있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    fftFiltered = fftResult.copy()\r
\r
    freqMask = (np.abs(freqs) > 12) & (np.abs(freqs) < 18)\r
    fftFiltered[freqMask] = 0\r
\r
    filteredSignalFft = np.real(fft.ifft(fftFiltered))\r
  exercise:\r
    prompt: FFT 필터링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      fftFiltered = fftResult.copy()\r
\r
      freqMask = (np.abs(freqs) > 12) & (np.abs(freqs) < 18)\r
      fftFiltered[freqMask] = 0\r
\r
      filteredSignalFft = np.real(fft.ifft(fftFiltered))\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: FFT 필터링에서 \`fftFiltered\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: FFT 필터링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: window\r
  title: 윈도우 함수\r
  structuredPrimary: true\r
  subtitle: 스펙트럼 누설 방지\r
  goal: 윈도우 함수에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 차트는 데이터와 표시 설정을 함께 확인해야 보고서에서 잘못된 해석을 줄일 수 있습니다.\r
  explanation: |-\r
    유한 길이 신호의 FFT는 스펙트럼 누설(spectral leakage)이 발생합니다. 신호 끝부분의 불연속성이 원인입니다. Hann, Hamming 등의 윈도우 함수를 적용하면 양끝을 0으로 부드럽게 줄여 누설을 감소시킵니다.\r
\r
    10.5Hz처럼 FFT 빈 중심에서 벗어난 주파수는 누설이 심합니다. Hann 윈도우를 적용하면 사이드로브가 크게 감소합니다. 메인로브가 약간 넓어지는 트레이드오프가 있습니다.\r
  snippet: |-\r
    testFreq = 10.5\r
    testSig = np.sin(2 * np.pi * testFreq * t)\r
\r
    hannWindow = signal.windows.hann(len(testSig))\r
    testSigWindowed = testSig * hannWindow\r
\r
    fftRect = fft.fft(testSig)\r
    fftHann = fft.fft(testSigWindowed)\r
\r
    magRect = 20 * np.log10(np.abs(fftRect[:n//2]) / n + 1e-10)\r
    magHann = 20 * np.log10(np.abs(fftHann[:n//2]) / n + 1e-10)\r
\r
    figWindow, axWindow = plt.subplots(figsize=(12, 6))\r
    axWindow.plot(positiveFreqs, magRect, 'r-', alpha=0.7, label='Rectangular (no window)')\r
    axWindow.plot(positiveFreqs, magHann, 'b-', label='Hann window')\r
    axWindow.set_xlim(0, 30)\r
    axWindow.set_ylim(-80, 0)\r
    axWindow.set_xlabel('Frequency (Hz)')\r
    axWindow.set_ylabel('Magnitude (dB)')\r
    axWindow.set_title('Effect of Window Function on Spectral Leakage')\r
    axWindow.legend()\r
    axWindow.grid(True, alpha=0.3)\r
    figWindow\r
  exercise:\r
    prompt: 윈도우 함수 예제에서 데이터 값이나 축/마크 설정을 바꾸고 차트 표현이 달라지는지 확인하세요.\r
    starterCode: |-\r
      testFreq = 10.5\r
      testSig = np.sin(2 * np.pi * testFreq * t)\r
\r
      hannWindow = signal.windows.hann(len(testSig))\r
      testSigWindowed = testSig * hannWindow\r
\r
      fftRect = fft.fft(testSig)\r
      fftHann = fft.fft(testSigWindowed)\r
\r
      magRect = 20 * np.log10(np.abs(fftRect[:n//2]) / n + 1e-10)\r
      magHann = 20 * np.log10(np.abs(fftHann[:n//2]) / n + 1e-10)\r
\r
      figWindow, axWindow = plt.subplots(figsize=(12, 6))\r
      axWindow.plot(positiveFreqs, magRect, 'r-', alpha=0.7, label='Rectangular (no window)')\r
      axWindow.plot(positiveFreqs, magHann, 'b-', label='Hann window')\r
      axWindow.set_xlim(0, 30)\r
      axWindow.set_ylim(-80, 0)\r
      axWindow.set_xlabel('Frequency (Hz)')\r
      axWindow.set_ylabel('Magnitude (dB)')\r
      axWindow.set_title('Effect of Window Function on Spectral Leakage')\r
      axWindow.legend()\r
      axWindow.grid(True, alpha=0.3)\r
      figWindow\r
    hints:\r
    - 바꿀 지점은 x/y 데이터, 색상, 축 제목, 마크 설정 줄에서 찾으세요.\r
    - 실행 뒤 축, 범례, 표시 범위, 저장 결과가 바꾼 설정을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 윈도우 함수의 차트 객체와 축/마크 설정이 생성 단계까지 도달해야 합니다.\r
    resultCheck: 윈도우 함수의 축, 범례, 마크, 저장 결과가 바꾼 데이터나 설정을 반영해야 합니다.\r
- id: result\r
  title: FFT 분석 가이드\r
  structuredPrimary: true\r
  subtitle: 실무 팁\r
  goal: FFT 분석 가이드에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 주파수 분석 시 샘플링 주파수, 데이터 길이, 윈도우 선택이 결과에 큰 영향을 줍니다. 주파수 해상도는 fs/N으로 결정되며, 나이퀴스트 정리에 따라 fs/2까지만\r
    분석 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    fftGuideDf = pd.DataFrame({\r
        'Topic': ['주파수 해상도', '주파수 범위', '윈도우', '평균화', '제로 패딩'],\r
        'Formula': ['Δf = fs/N', '0 ~ fs/2', 'Hann, Hamming', 'Welch, Bartlett', 'N을 늘림'],\r
        'Effect': ['샘플 수 늘리면 해상도 증가', '나이퀴스트 한계', '스펙트럼 누설 감소', '노이즈 감소', '주파수 보간 효과']\r
    })\r
    fftGuideDf\r
  exercise:\r
    prompt: FFT 분석 가이드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      fftGuideDf = pd.DataFrame({\r
          'Topic': ['주파수 해상도', '주파수 범위', '윈도우', '평균화', '제로 패딩'],\r
          'Formula': ['Δf = fs/N', '0 ~ fs/2', 'Hann, Hamming', 'Welch, Bartlett', 'N을 늘림'],\r
          'Effect': ['샘플 수 늘리면 해상도 증가', '나이퀴스트 한계', '스펙트럼 누설 감소', '노이즈 감소', '주파수 보간 효과']\r
      })\r
      fftGuideDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: FFT 분석 가이드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: FFT 분석 가이드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 주파수 분석 프로젝트\r
  goal: 실습에서 최적화/적분/신호 처리 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 신호처리 엔지니어가 되어 다양한 신호의 주파수 특성을 분석해보세요. 심박 신호에서 심박수를 추출하거나, 합성 음성의 스펙트로그램을 시각화해보세요.\r
  snippet: |-\r
    fsHr = 250\r
    durHr = 10\r
    tHr = np.linspace(0, durHr, fsHr * durHr, endpoint=False)\r
\r
    heartRate = 72\r
    heartFreq = heartRate / 60\r
    hrSignal = np.sin(2 * np.pi * heartFreq * tHr)\r
    hrSignal += 0.3 * np.sin(2 * np.pi * 2 * heartFreq * tHr)\r
    hrSignal += 0.1 * np.random.randn(len(tHr))\r
  exercise:\r
    prompt: 실습 예제에서 \`fsHr\`, \`durHr\`, \`tHr\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      fsHr = 250\r
      durHr = 10\r
      tHr = np.linspace(0, durHr, fsHr * durHr, endpoint=False)\r
\r
      heartRate = 72\r
      heartFreq = heartRate / 60\r
      hrSignal = np.sin(2 * np.pi * heartFreq * tHr)\r
      hrSignal += 0.3 * np.sin(2 * np.pi * 2 * heartFreq * tHr)\r
      hrSignal += 0.1 * np.random.randn(len(tHr))\r
    hints:\r
    - 바꿀 지점은 \`fsHr = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`fsHr\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습에서 \`fsHr\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
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