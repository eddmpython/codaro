var e=`meta:\r
  packages:\r
  - numpy\r
  - scipy\r
  id: scipy_00\r
  title: scipy소개\r
  order: 0\r
  category: scipy\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - scipy\r
  - 과학계산\r
  - 최적화\r
  - 통계검정\r
  - 신호처리\r
  seo:\r
    title: SciPy 입문 - Python 과학 계산의 핵심\r
    description: SciPy로 최적화, 통계검정, 신호처리, 보간법을 시작하세요. NumPy를 확장한 고급 과학 계산 라이브러리입니다.\r
    keywords:\r
    - scipy\r
    - 과학계산\r
    - 최적화\r
    - 통계검정\r
    - 보간\r
    - 신호처리\r
intro:\r
  direction: scipy소개에서 수치 데이터를 모델에 넣고 계산 결과와 오차를 검증합니다.\r
  benefits:\r
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.\r
  - 수치 입력 확인 후 최적화/적분/신호 처리에 맞는 코드 입력을 고릅니다.\r
  - scipy소개 결과를 오차와 결과 범위 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 과학 계산 루틴에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 업무 흐름 검증 입력 확인\r
      detail: 입력 기준(수치 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 최적화/적분/신호 처리 처리 실행\r
      detail: 최적화/적분/신호 처리 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 오차와 결과 범위 결과 검증\r
      detail: 오차와 결과 범위 기준으로 실행 결과를 비교합니다.\r
    - label: scipy소개 재사용\r
      detail: 완성 코드를 과학 계산 루틴에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 과학 계산 환경\r
      detail: numpy, scipy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: scipy소개 실행\r
      detail: 셀을 실행해 오차와 결과 범위와 예외 상태를 확인합니다.\r
    - label: scipy소개 완료\r
      detail: 검증된 코드를 과학 계산 루틴로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 🔬\r
    title: SciPy란?\r
    subtitle: Python 과학 계산의 핵심 라이브러리\r
  - type: hero\r
    emoji: ⚗️\r
    title: NumPy를 확장한 고급 과학 도구\r
    subtitle: 수학, 과학, 공학 문제를 해결하는 알고리즘 모음\r
    points:\r
    - emoji: 📈\r
      title: 최적화\r
    - emoji: 📊\r
      title: 통계 검정\r
    - emoji: 🔊\r
      title: 신호 처리\r
    - emoji: 📐\r
      title: 수치 적분\r
  goal: SciPy란?에서 수치 입력을 바꿨을 때 오차와 결과 범위가 어떻게 달라지는지 확인한다.\r
  why: 과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.\r
- id: what_is_scipy\r
  blocks:\r
  - type: sectionHeader\r
    title: 🤔 SciPy가 뭔가요?\r
    subtitle: 과학 계산을 위한 스위스 군용 칼\r
  - type: note\r
    style: info\r
    title: NumPy vs SciPy\r
    content: NumPy는 배열 연산의 기초입니다. 행렬 곱셈, 인덱싱, 기본 통계는 NumPy로 충분합니다. SciPy는 NumPy 위에 구축된 고급 알고리즘 모음입니다.\r
      최적화, 적분, 보간, 신호처리, 통계검정 등 전문적인 과학 계산 기능을 제공합니다. NumPy가 기초 수학이라면, SciPy는 응용 수학입니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🎯\r
      title: scipy.optimize\r
      description: 함수 최소화, 방정식 풀이, 곡선 피팅\r
    - emoji: 📊\r
      title: scipy.stats\r
      description: 확률분포, 가설검정, 기술통계\r
    - emoji: 🔊\r
      title: scipy.signal\r
      description: 필터 설계, FFT, 스펙트럼 분석\r
    - emoji: 📐\r
      title: scipy.integrate\r
      description: 수치적분, 미분방정식\r
  goal: 🤔 SciPy가 뭔가요?에서 수치 입력을 바꿨을 때 오차와 결과 범위가 어떻게 달라지는지 확인한다.\r
  why: 과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.\r
- id: why_scipy\r
  blocks:\r
  - type: sectionHeader\r
    title: 🌟 왜 SciPy가 필요한가요?\r
    subtitle: 기존 라이브러리와의 차이\r
  - type: note\r
    style: info\r
    title: 전문 알고리즘의 보고\r
    content: 직접 구현하면 수백 줄이 필요한 알고리즘을 한 줄로 호출할 수 있습니다. 최적화 문제에서 minimize() 한 번이면 복잡한 경사하강법을 실행합니다. 통계검정에서\r
      ttest_ind() 한 번이면 t-검정 결과를 얻습니다. FORTRAN과 C로 작성된 검증된 알고리즘을 Python에서 편리하게 사용할 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: ⚡\r
      title: 검증된 알고리즘\r
      description: 수십 년간 검증된 수치해석 코드\r
    - emoji: 🚀\r
      title: 최적화된 성능\r
      description: C/FORTRAN 기반 고속 연산\r
    - emoji: 📚\r
      title: 풍부한 문서\r
      description: 상세한 API 문서와 예제\r
    - emoji: 🔧\r
      title: NumPy 호환\r
      description: ndarray 기반 일관된 인터페이스\r
  goal: 🌟 왜 SciPy가 필요한가요?에서 수치 입력을 바꿨을 때 오차와 결과 범위가 어떻게 달라지는지 확인한다.\r
  why: 과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.\r
- id: scipy_modules\r
  blocks:\r
  - type: sectionHeader\r
    title: 📦 SciPy 주요 모듈\r
    subtitle: 어떤 기능이 있나요?\r
  - type: table\r
    headers:\r
    - 모듈\r
    - 기능\r
    - 대표 함수\r
    rows:\r
    - - scipy.optimize\r
      - 최적화, 방정식\r
      - minimize, curve_fit, root\r
    - - scipy.stats\r
      - 통계, 확률분포\r
      - ttest_ind, norm, describe\r
    - - scipy.interpolate\r
      - 보간법\r
      - interp1d, griddata\r
    - - scipy.integrate\r
      - 적분, 미분방정식\r
      - quad, odeint\r
    - - scipy.signal\r
      - 신호처리\r
      - butter, filtfilt, spectrogram\r
    - - scipy.linalg\r
      - 선형대수\r
      - solve, eig, svd\r
    - - scipy.sparse\r
      - 희소행렬\r
      - csr_matrix, linalg.spsolve\r
    - - scipy.spatial\r
      - 공간 알고리즘\r
      - distance, KDTree\r
  - type: note\r
    style: tip\r
    title: 모듈별 import\r
    content: SciPy는 모듈별로 import합니다. from scipy import optimize처럼 필요한 모듈만 불러옵니다. scipy 전체를 import하면 느리고\r
      메모리를 많이 사용합니다. 각 모듈은 독립적이므로 필요한 것만 선택적으로 사용하세요.\r
  goal: 📦 SciPy 주요 모듈에서 수치 입력을 바꿨을 때 오차와 결과 범위가 어떻게 달라지는지 확인한다.\r
  why: 과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.\r
- id: scipy_vs_others\r
  blocks:\r
  - type: sectionHeader\r
    title: 🆚 SciPy vs 다른 라이브러리\r
    subtitle: 언제 무엇을 쓸까?\r
  - type: compare\r
    left:\r
      title: NumPy\r
      subtitle: 배열 연산 기초\r
      icon: 🔢\r
      color: blue\r
      items:\r
      - 배열 생성, 인덱싱\r
      - 기본 수학 연산\r
      - 선형대수 기초\r
      - 난수 생성\r
      infoBox: SciPy의 기반, 항상 함께 사용\r
    right:\r
      title: SciPy\r
      subtitle: 고급 과학 계산\r
      icon: 🔬\r
      color: green\r
      items:\r
      - 최적화, 피팅\r
      - 통계 검정\r
      - 신호처리, FFT\r
      - 수치적분, ODE\r
      infoBox: NumPy 확장, 전문 알고리즘\r
  - type: compare\r
    left:\r
      title: statsmodels\r
      subtitle: 통계 모델링\r
      icon: 📊\r
      color: purple\r
      items:\r
      - 회귀분석 summary\r
      - 시계열 ARIMA\r
      - p-value, 신뢰구간\r
      - 모델 진단\r
      infoBox: 통계적 추론, 해석 중심\r
    right:\r
      title: scipy.stats\r
      subtitle: 확률/검정 도구\r
      icon: 🎲\r
      color: green\r
      items:\r
      - 확률분포 계산\r
      - 가설검정 함수\r
      - 기술통계량\r
      - 난수 샘플링\r
      infoBox: 기본 통계 함수, statsmodels 보완\r
  goal: 🆚 SciPy vs 다른 라이브러리에서 수치 입력을 바꿨을 때 오차와 결과 범위가 어떻게 달라지는지 확인한다.\r
  why: 과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.\r
- id: core_concepts\r
  blocks:\r
  - type: sectionHeader\r
    title: 🧩 핵심 개념\r
    subtitle: SciPy로 무엇을 할 수 있나요?\r
  - type: featureCards\r
    cards:\r
    - emoji: 1️⃣\r
      title: 최적화 (Optimization)\r
      description: 함수의 최소값/최대값 찾기, 비용 최소화\r
    - emoji: 2️⃣\r
      title: 통계 검정 (Statistical Test)\r
      description: 두 집단 비교, 정규성 검정, 상관분석\r
    - emoji: 3️⃣\r
      title: 보간법 (Interpolation)\r
      description: 데이터 사이 값 추정, 곡선 연결\r
    - emoji: 4️⃣\r
      title: 곡선 피팅 (Curve Fitting)\r
      description: 데이터에 수식 맞추기, 모델 파라미터 추정\r
    - emoji: 5️⃣\r
      title: 신호 처리 (Signal Processing)\r
      description: 노이즈 제거, 주파수 분석\r
    - emoji: 6️⃣\r
      title: 수치 적분 (Integration)\r
      description: 면적 계산, 누적량 산출\r
  goal: 🧩 핵심 개념에서 수치 입력을 바꿨을 때 오차와 결과 범위가 어떻게 달라지는지 확인한다.\r
  why: 과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.\r
- id: use_cases\r
  blocks:\r
  - type: sectionHeader\r
    title: 💼 실전 활용 사례\r
    subtitle: SciPy로 해결하는 문제들\r
  - type: featureCards\r
    cards:\r
    - emoji: 💰\r
      title: 투자 포트폴리오 최적화\r
      description: 위험 대비 수익 최대화 자산 배분\r
    - emoji: 🧪\r
      title: A/B 테스트 분석\r
      description: 두 버전의 성과 차이 검정\r
    - emoji: 📈\r
      title: 성장 곡선 피팅\r
      description: 사용자 증가율 모델링\r
    - emoji: 🔊\r
      title: 오디오 필터링\r
      description: 노이즈 제거, 이퀄라이저\r
    - emoji: 🌡️\r
      title: 센서 데이터 보간\r
      description: 결측 구간 값 추정\r
    - emoji: 📊\r
      title: 분포 적합도 검정\r
      description: 데이터가 정규분포인지 확인\r
  goal: 💼 실전 활용 사례에서 수치 입력을 바꿨을 때 오차와 결과 범위가 어떻게 달라지는지 확인한다.\r
  why: 과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.\r
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
    - 실용 가치\r
    rows:\r
    - - 입문\r
      - 확률분포 탐색기\r
      - norm, uniform, 확률밀도함수\r
      - 통계 기초 이해\r
    - - 입문\r
      - A/B 테스트 분석\r
      - ttest_ind, p-value 해석\r
      - 마케팅 의사결정\r
    - - 기초\r
      - 데이터 보간기\r
      - interp1d, 스플라인\r
      - 결측값 처리\r
    - - 기초\r
      - 곡선 피팅 마스터\r
      - curve_fit, 비선형 회귀\r
      - 성장률 모델링\r
    - - 기초\r
      - 정규성 검정기\r
      - shapiro, normaltest\r
      - 분석 전제 확인\r
    - - 중급\r
      - 포트폴리오 최적화\r
      - minimize, 제약조건\r
      - 투자 전략\r
    - - 중급\r
      - 신호 필터링\r
      - butter, filtfilt\r
      - 센서 데이터 정제\r
    - - 중급\r
      - 수치 적분기\r
      - quad, 면적 계산\r
      - 물리량 계산\r
    - - 심화\r
      - 스펙트럼 분석기\r
      - fft, spectrogram\r
      - 주파수 분석\r
    - - 심화\r
      - 종합 과학 프로젝트\r
      - 모든 모듈 통합\r
      - 실전 문제 해결\r
  - type: note\r
    style: info\r
    title: 프로젝트 기반 학습\r
    content: 각 프로젝트는 실제 문제를 해결합니다. A/B 테스트로 마케팅 결정을 내리고, 포트폴리오 최적화로 투자 전략을 수립하고, 신호 필터링으로 센서 데이터를 정제합니다.\r
      10개 프로젝트를 완료하면 과학/공학 계산의 핵심 도구를 모두 다룰 수 있게 됩니다.\r
  goal: 🗺️ 앞으로 배울 내용에서 수치 입력을 바꿨을 때 오차와 결과 범위가 어떻게 달라지는지 확인한다.\r
  why: 과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.\r
- id: local_runtime_note\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚠️ Codaro 로컬 Python 환경 참고사항\r
    subtitle: 로컬 실행 시 확인할 점\r
  - type: note\r
    style: warning\r
    title: 제한사항\r
    content: SciPy는 Codaro 로컬 Python에서 실행됩니다. optimize, stats, interpolate, signal 같은 핵심 모듈을 로컬 패키지 환경에서\r
      바로 실습할 수 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: ✅\r
      title: 정상 작동\r
      description: optimize, stats, interpolate, signal, integrate\r
    - emoji: ⚠️\r
      title: 주의 필요\r
      description: sparse 일부 기능, 대용량 연산\r
    - emoji: 📦\r
      title: 로컬 준비
      description: meta.packages 기준 uv run\r
  goal: ⚠️ Codaro 로컬 Python 환경 참고사항에서 수치 입력을 바꿨을 때 오차와 결과 범위가 어떻게 달라지는지 확인한다.\r
  why: 과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.\r
- id: package_ready
  blocks:\r
  - type: sectionHeader\r
    title: 📦 준비 확인과 시작
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
      description: from scipy import optimize, stats\r
  goal: 📦 준비 확인과 시작에서 수치 입력을 바꿨을 때 오차와 결과 범위가 어떻게 달라지는지 확인한다.
  why: 과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.\r
- id: resources\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 참고 자료\r
    subtitle: 더 깊이 공부하고 싶다면\r
  - type: links\r
    items:\r
    - text: SciPy 공식 문서\r
      url: https://docs.scipy.org/doc/scipy/\r
      icon: 🔗\r
    - text: SciPy Tutorial\r
      url: https://docs.scipy.org/doc/scipy/tutorial/\r
      icon: 🔗\r
    - text: SciPy API Reference\r
      url: https://docs.scipy.org/doc/scipy/reference/\r
      icon: 🔗\r
  goal: 📚 참고 자료에서 수치 입력을 바꿨을 때 오차와 결과 범위가 어떻게 달라지는지 확인한다.\r
  why: 과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.\r
- id: next\r
  blocks:\r
  - type: hero\r
    emoji: 👉\r
    title: '다음: 확률분포 탐색기'\r
    subtitle: scipy.stats로 정규분포, 균등분포를 시각화하고 확률을 계산합니다\r
  goal: '다음: 확률분포 탐색기에서 수치 입력을 바꿨을 때 오차와 결과 범위가 어떻게 달라지는지 확인한다.'\r
  why: 과학 계산은 수학 모델을 코드로 실행하고 결과 신뢰도를 확인하는 과정입니다.\r
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