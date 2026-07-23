var e=`meta:\r
  packages:\r
  - numpy\r
  id: numpy_00\r
  title: NumPy소개\r
  order: 0\r
  category: numpy\r
  badge: 소개\r
  source: eddmpython\r
  sourceUrl: https://eddmpython.com\r
  tags:\r
  - NumPy\r
  - 수치연산\r
  - 배열\r
  - 벡터화\r
  - 브로드캐스팅\r
  - 선형대수\r
  - 검증\r
  - 로컬실행\r
  seo:\r
    title: NumPy 입문 - 파이썬 수치 연산의 핵심\r
    description: NumPy로 빠르고 효율적인 수치 연산을 수행해보세요. 벡터화와 브로드캐스팅으로 반복문 없이 대용량 데이터를 처리합니다.\r
    keywords:\r
    - NumPy\r
    - 수치연산\r
    - 배열\r
    - ndarray\r
    - 벡터화\r
    - 브로드캐스팅\r
intro:\r
  direction: NumPy소개에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.\r
  benefits:\r
  - 첫 실행 셀은 assert로 핵심 결과를 고정해 실습 코드가 깨지지 않았는지 확인합니다.\r
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.\r
  - NumPy소개 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 매출 배열을 벡터화로 점검하기 입력 확인\r
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 벡터화 계산 처리 실행\r
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: shape와 수치 결과 결과 검증\r
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.\r
    - label: NumPy소개 재사용\r
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 배열 계산 환경\r
      detail: numpy 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: NumPy소개 실행\r
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.\r
    - label: NumPy소개 완료\r
      detail: 검증된 코드를 계산 파이프라인로 남깁니다.\r
sections:\r
- id: intro\r
  blocks:\r
  - type: mainHeader\r
    emoji: 🔢\r
    title: NumPy\r
    subtitle: 파이썬 수치 연산의 핵심\r
  - type: hero\r
    emoji: ⚡\r
    title: 빠르고 강력한 배열 연산\r
    subtitle: 반복문 없이 대용량 데이터 처리\r
    points:\r
    - emoji: 🚀\r
      title: C 기반 고속 연산\r
    - emoji: 📊\r
      title: 다차원 배열 지원\r
    - emoji: 🔗\r
      title: 데이터 과학의 기반\r
    - emoji: ⚙️\r
      title: 벡터화 연산\r
  goal: NumPy에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: numpy_history\r
  blocks:\r
  - type: sectionHeader\r
    title: 🏛️ NumPy의 탄생\r
    subtitle: 파이썬 과학 계산의 시작\r
  - type: text\r
    content: NumPy(Numerical Python)는 2005년 Travis Oliphant가 개발했습니다. 기존에 있던 Numeric과 Numarray를 통합하여 만들어졌으며,\r
      현재 파이썬 데이터 과학 생태계의 기반이 되는 핵심 라이브러리입니다. Pandas, Scikit-learn, TensorFlow, PyTorch 등 거의 모든 데이터 과학\r
      라이브러리가 NumPy를 기반으로 구축되어 있습니다.\r
  - type: featureCards\r
    cards:\r
    - emoji: 🎯\r
      title: 핵심 자료구조\r
      description: ndarray(N-dimensional array)라는 다차원 배열 자료구조를 제공합니다\r
    - emoji: ⚡\r
      title: 고성능\r
      description: C로 구현되어 파이썬 리스트보다 수십 배 빠른 연산 속도를 제공합니다\r
    - emoji: 🔧\r
      title: 범용성\r
      description: 과학 계산, 데이터 분석, 머신러닝 등 모든 수치 연산의 기초입니다\r
  goal: 🏛️ NumPy의 탄생에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: why_numpy\r
  blocks:\r
  - type: sectionHeader\r
    title: 🚀 왜 NumPy인가?\r
    subtitle: 파이썬 리스트의 한계를 넘어서\r
  - type: text\r
    content: 파이썬 리스트로 100만 개의 숫자를 더하려면 반복문이 필요하고 느립니다. NumPy 배열은 같은 연산을 반복문 없이 한 줄로 작성하고, 수십 배 빠르게 실행합니다.\r
  - type: note\r
    title: 벡터화(Vectorization)\r
    content: NumPy의 핵심 개념입니다. 반복문 없이 배열 전체에 연산을 적용하는 것을 벡터화라고 합니다. arr * 2라고 쓰면 배열의 모든 요소에 2가 곱해집니다. 이는\r
      코드를 간결하게 만들고, 내부적으로 최적화된 C 코드가 실행되어 매우 빠릅니다.\r
  goal: 🚀 왜 NumPy인가?에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: ndarray\r
  blocks:\r
  - type: sectionHeader\r
    title: 📦 ndarray 자료구조\r
    subtitle: NumPy의 핵심\r
  - type: text\r
    content: NumPy의 핵심 자료구조는 ndarray(N-dimensional array)입니다. 다차원 배열을 의미하며, 파이썬 리스트와 달리 모든 요소가 동일한 데이터\r
      타입을 가집니다. 이 제약 덕분에 메모리를 효율적으로 사용하고 빠른 연산이 가능합니다.\r
  - type: note\r
    title: 파이썬 리스트 vs NumPy 배열\r
    content: 파이썬 리스트는 서로 다른 타입의 요소를 담을 수 있고 크기가 동적으로 변합니다. NumPy 배열은 동일 타입만 저장하고 크기가 고정됩니다. 이런 제약이 오히려\r
      장점이 되어, 연속된 메모리에 데이터를 저장하고 CPU 캐시를 효율적으로 활용할 수 있습니다.\r
  goal: 📦 ndarray 자료구조에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: features\r
  blocks:\r
  - type: sectionHeader\r
    title: 🛠️ NumPy의 주요 기능\r
    subtitle: 수치 연산의 모든 것\r
  - type: text\r
    content: NumPy가 제공하는 주요 기능을 살펴봅시다. 단순히 배열을 만드는 것을 넘어 다양한 수학적, 통계적 연산을 지원합니다.\r
  - type: table\r
    headers:\r
    - 기능\r
    - 설명\r
    - 예시\r
    rows:\r
    - - 배열 생성\r
      - 다양한 방법으로 배열 생성\r
      - array(), zeros(), ones(), arange(), linspace()\r
    - - 인덱싱/슬라이싱\r
      - 배열 요소 접근 및 부분 선택\r
      - arr[0], arr[1:5], arr[arr > 0]\r
    - - 수학 연산\r
      - 산술, 삼각함수, 지수/로그\r
      - +, -, *, /, np.sin(), np.exp()\r
    - - 통계 함수\r
      - 평균, 표준편차, 최대/최소\r
      - mean(), std(), max(), min()\r
    - - 배열 변형\r
      - 형태 변경, 결합, 분할\r
      - reshape(), concatenate(), split()\r
    - - 선형대수\r
      - 행렬 연산, 역행렬, 고유값\r
      - dot(), linalg.inv(), linalg.eig()\r
    - - 브로드캐스팅\r
      - 크기가 다른 배열 간 연산\r
      - 자동으로 크기 맞춤\r
  goal: 🛠️ NumPy의 주요 기능에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: broadcasting\r
  blocks:\r
  - type: sectionHeader\r
    title: 📡 브로드캐스팅\r
    subtitle: 크기가 다른 배열 간 연산\r
  - type: text\r
    content: 브로드캐스팅은 NumPy의 강력한 기능 중 하나입니다. 크기가 다른 배열 간에도 연산이 가능하도록 자동으로 배열을 확장합니다. 예를 들어 (3, 3) 행렬에 스칼라\r
      값을 더하거나, (3, 1) 배열과 (1, 3) 배열을 더하면 자동으로 (3, 3) 결과가 나옵니다.\r
  - type: note\r
    title: 브로드캐스팅 규칙\r
    content: 두 배열의 차원을 오른쪽부터 비교합니다. 각 차원이 같거나, 둘 중 하나가 1이면 브로드캐스팅이 가능합니다. 예를 들어 (5, 3)과 (3,)은 호환되고, (5,\r
      3)과 (1, 3)도 호환됩니다. 하지만 (5, 3)과 (4,)는 호환되지 않습니다.\r
  goal: 📡 브로드캐스팅에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: datatype\r
  blocks:\r
  - type: sectionHeader\r
    title: 🏷️ 데이터 타입\r
    subtitle: dtype으로 메모리와 정밀도 제어\r
  - type: text\r
    content: NumPy 배열은 명시적인 데이터 타입(dtype)을 가집니다. 정수, 실수, 복소수, 불리언 등 다양한 타입을 지원하며, 메모리 크기를 직접 지정할 수도 있습니다.\r
  - type: table\r
    headers:\r
    - 타입\r
    - 설명\r
    - 범위/정밀도\r
    rows:\r
    - - int32\r
      - 32비트 정수\r
      - -2^31 ~ 2^31-1\r
    - - int64\r
      - 64비트 정수\r
      - -2^63 ~ 2^63-1\r
    - - float32\r
      - 32비트 실수\r
      - 약 7자리 정밀도\r
    - - float64\r
      - 64비트 실수 (기본값)\r
      - 약 15자리 정밀도\r
    - - bool\r
      - 불리언\r
      - True/False\r
    - - complex128\r
      - 복소수\r
      - 실수부+허수부 각 64비트\r
  goal: 🏷️ 데이터 타입에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: comparison\r
  blocks:\r
  - type: sectionHeader\r
    title: ⚖️ NumPy vs Pandas vs 리스트\r
    subtitle: 상황에 맞는 도구 선택\r
  - type: text\r
    content: NumPy는 다른 데이터 처리 도구들과 어떻게 다를까요? 각 도구의 특성을 이해하면 상황에 맞는 도구를 선택할 수 있습니다.\r
  - type: table\r
    headers:\r
    - 특성\r
    - NumPy\r
    - Pandas\r
    - 파이썬 리스트\r
    rows:\r
    - - 주요 용도\r
      - 수치 연산\r
      - 테이블 데이터 분석\r
      - 범용 자료구조\r
    - - 데이터 타입\r
      - 동일 타입만\r
      - 컬럼별 다른 타입\r
      - 혼합 가능\r
    - - 인덱싱\r
      - 정수/불리언\r
      - 정수/라벨/불리언\r
      - 정수만\r
    - - 속도\r
      - 매우 빠름\r
      - 빠름 (NumPy 기반)\r
      - 느림\r
    - - 메모리\r
      - 효율적\r
      - 보통\r
      - 비효율적\r
  goal: ⚖️ NumPy vs Pandas vs 리스트에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: ecosystem\r
  blocks:\r
  - type: sectionHeader\r
    title: 🌐 NumPy 생태계\r
    subtitle: 데이터 과학의 기반\r
  - type: text\r
    content: NumPy는 파이썬 데이터 과학 생태계의 기반입니다. NumPy를 잘 이해하면 다른 라이브러리들도 쉽게 배울 수 있습니다.\r
  - type: table\r
    headers:\r
    - 라이브러리\r
    - NumPy 활용\r
    rows:\r
    - - Pandas\r
      - DataFrame 내부가 NumPy 배열, .values로 접근\r
    - - Matplotlib\r
      - 플롯 데이터로 NumPy 배열 사용\r
    - - Scikit-learn\r
      - 모든 입출력이 NumPy 배열\r
    - - SciPy\r
      - NumPy 확장, 과학 계산 함수\r
    - - TensorFlow/PyTorch\r
      - 텐서와 NumPy 배열 상호 변환\r
  goal: 🌐 NumPy 생태계에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: usecases\r
  blocks:\r
  - type: sectionHeader\r
    title: 💡 활용 분야\r
    subtitle: NumPy가 사용되는 곳\r
  - type: text\r
    content: NumPy는 다양한 분야에서 활용됩니다. 데이터 전처리부터 과학 시뮬레이션까지 수치 계산이 필요한 거의 모든 곳에서 NumPy를 만날 수 있습니다.\r
  - type: table\r
    headers:\r
    - 분야\r
    - 활용 예시\r
    rows:\r
    - - 데이터 분석\r
      - 통계 계산, 데이터 정규화, 특성 엔지니어링\r
    - - 머신러닝\r
      - 특성 행렬 구성, 가중치 연산, 손실 함수 계산\r
    - - 이미지 처리\r
      - 픽셀 데이터 조작, 필터 적용, 변환\r
    - - 신호 처리\r
      - FFT, 필터링, 스펙트럼 분석\r
    - - 과학 시뮬레이션\r
      - 물리 시뮬레이션, 수치 해석, 미분방정식\r
    - - 금융\r
      - 포트폴리오 분석, 리스크 계산, 시계열 분석\r
  goal: 💡 활용 분야에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: pandas_notice\r
  blocks:\r
  - type: sectionHeader\r
    title: 📋 pandas 사용 안내\r
    subtitle: 데이터 로딩용으로만 사용\r
  - type: note\r
    title: pandas는 나중에 배워요\r
    content: 이 커리큘럼에서 pandas(pd)가 등장하지만, 데이터 로딩용으로만 사용합니다. pd.read_csv()로 CSV 파일을 불러온 뒤 .values로 NumPy\r
      배열을 추출합니다. pandas의 기능은 Pandas 코스에서 자세히 배우니, 지금은 '데이터 불러오는 도구'로만 이해하세요.\r
  goal: 📋 pandas 사용 안내에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: curriculum\r
  blocks:\r
  - type: sectionHeader\r
    title: 📚 커리큘럼\r
    subtitle: 10개 프로젝트로 마스터\r
  - type: text\r
    content: 이 커리큘럼에서는 실제 데이터셋을 활용한 10개의 프로젝트를 통해 NumPy를 배웁니다.\r
  - type: table\r
    headers:\r
    - 프로젝트\r
    - 데이터셋\r
    - 핵심 개념\r
    rows:\r
    - - 01. 포켓몬 스탯 분석\r
      - Pokemon\r
      - 배열 생성, 기본 통계\r
    - - 02. 기온 데이터 탐색\r
      - Global Temperature\r
      - 인덱싱, 슬라이싱\r
    - - 03. 지진 발생 패턴\r
      - Earthquakes\r
      - 불리언 인덱싱, 조건 선택\r
    - - 04. 음악 특성 분석\r
      - Spotify Songs\r
      - 정규화, 상관관계\r
    - - 05. BMI 계산기\r
      - Weight-Height\r
      - 브로드캐스팅, 벡터 연산\r
    - - 06. 심장병 위험 분석\r
      - Heart Disease\r
      - 정렬, 누적 연산\r
    - - 07. 대기질 시계열\r
      - Air Quality\r
      - 결측값 처리\r
    - - 08. 행복지수 국가 비교\r
      - World Happiness\r
      - 순위, 선형대수 기초\r
    - - 09. 전복 나이 예측\r
      - Abalone\r
      - 선형대수, 회귀\r
    - - 10. 당뇨병 종합 분석\r
      - Pima Diabetes\r
      - 전체 개념 종합\r
  goal: 📚 커리큘럼에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: start\r
  blocks:\r
  - type: sectionHeader\r
    title: 🎯 시작하기\r
    subtitle: 첫 번째 프로젝트로\r
  - type: text\r
    content: NumPy를 배우면 파이썬으로 수치 계산을 효율적으로 수행할 수 있습니다. 반복문 없이 간결한 코드로 빠른 연산이 가능해지고, 데이터 과학과 머신러닝의 기초를\r
      탄탄하게 다질 수 있습니다. 첫 번째 프로젝트에서 포켓몬 스탯 데이터를 분석하며 NumPy 배열의 기본을 익혀봅시다.\r
  goal: 🎯 시작하기에서 배열 입력을 바꿨을 때 shape와 수치 결과가 어떻게 달라지는지 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 매출 배열을 벡터화로 점검하기'\r
  structuredPrimary: true\r
  subtitle: 배열 생성, 브로드캐스팅, 실패 케이스, 변주 실험\r
  goal: '현업 흐름 검증: 매출 배열을 벡터화로 점검하기에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    NumPy 입문은 배열 문법 암기가 아니라 같은 업무 계산을 반복문 없이 안전하게 처리하는 감각에서 시작합니다. 매출과 할인율 배열의 shape을 예측하고, 브로드캐스팅 결과를 assert로 검증하세요.\r
\r
    변주 실험\r
    월별 할인율 \`(3,)\`과 지점별 할인율 \`(2, 1)\`을 각각 적용해보고, 결과 shape과 합계가 어떻게 달라지는지 비교하세요.\r
  tips:\r
  - 변주 실험 월별 할인율 \`(3,)\`과 지점별 할인율 \`(2, 1)\`을 각각 적용해보고, 결과 shape과 합계가 어떻게 달라지는지 비교하세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    sales = np.array([\r
        [120_000, 135_000, 128_000],\r
        [90_000, 98_000, 102_000],\r
    ])\r
    discountRates = np.array([[0.1], [0.05]])\r
\r
    discounted = sales * (1 - discountRates)\r
    branchTotals = discounted.sum(axis=1)\r
\r
    assert discounted.shape == (2, 3)\r
    assert np.allclose(branchTotals, [344_700, 275_500])\r
    assert sales.dtype.kind in {"i", "u"}\r
  exercise:\r
    prompt: '현업 흐름 검증: 매출 배열을 벡터화로 점검하기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import numpy as np\r
\r
      sales = np.array([\r
          [120_000, 135_000, 128_000],\r
          [90_000, 98_000, 102_000],\r
      ])\r
      discountRates = np.array([[0.1], [0.05]])\r
\r
      discounted = sales * (1 - discountRates)\r
      branchTotals = discounted.sum(axis=1)\r
\r
      assert discounted.shape == (2, 3)\r
      assert np.allclose(branchTotals, [344_700, 275_500])\r
      assert sales.dtype.kind in {"i", "u"}\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 매출 배열을 벡터화로 점검하기에서 \`sales\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 매출 배열을 벡터화로 점검하기에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'\r
`;export{e as default};