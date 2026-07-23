var e=`meta:\r
  packages:\r
  - numpy\r
  - pandas\r
  id: numpy_01\r
  title: 포켓몬스탯분석\r
  order: 1\r
  category: numpy\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - numpy\r
  - array\r
  - shape\r
  - dtype\r
  - mean\r
  - max\r
  - argmax\r
  - 검증\r
  - 배열분석\r
  seo:\r
    title: NumPy 배열 기초 - 포켓몬 스탯 분석\r
    description: NumPy 배열의 기본을 배우며 포켓몬 능력치 데이터를 분석합니다. shape, dtype, mean, max, argmax를 익힙니다.\r
    keywords:\r
    - numpy\r
    - array\r
    - shape\r
    - dtype\r
    - mean\r
    - 포켓몬\r
    - 데이터분석\r
intro:\r
  emoji: 🎮\r
  goal: 포켓몬 능력치 데이터로 NumPy 배열의 기본을 익힙니다.\r
  description: NumPy 배열을 생성하고 기본 속성을 확인합니다. 통계 함수로 포켓몬들의 능력치 특성을 분석합니다.\r
  direction: 포켓몬스탯분석에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.\r
  benefits:\r
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.\r
  - 포켓몬스탯분석 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. NumPy 배열 추출 결과 검증\r
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 포켓몬스탯분석 재사용\r
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 배열 계산 환경\r
      detail: numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 포켓몬스탯분석 실행\r
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.\r
    - label: 포켓몬스탯분석 완료\r
      detail: 검증된 코드를 계산 파이프라인로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: |-\r
    NumPy는 파이썬의 수치 연산 핵심 라이브러리입니다. 관례적으로 np라는 별칭을 사용합니다. pandas는 데이터 로딩용으로만 사용하며, pandas 자체는 나중에 Pandas 코스에서 배웁니다.\r
\r
    pandas(pd)는 CSV 파일 로드용으로만 사용합니다. pd.read_csv()로 데이터를 불러온 뒤 .values로 NumPy 배열을 추출합니다. pandas 기능은 Pandas 코스에서 배웁니다.\r
  tips:\r
  - pandas(pd)는 CSV 파일 로드용으로만 사용합니다. pd.read_csv()로 데이터를 불러온 뒤 .values로 NumPy 배열을 추출합니다. pandas 기능은 Pandas\r
    코스에서 배웁니다.\r
  snippet: |-\r
    import numpy as np\r
    import pandas as pd\r
  exercise:\r
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      import pandas as pd\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.\r
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step2_data\r
  title: 2단계. 데이터 로드\r
  structuredPrimary: true\r
  subtitle: Pokemon 데이터셋\r
  goal: 2단계. 데이터 로드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 포켓몬 데이터셋은 1000마리 이상의 포켓몬 능력치를 담고 있습니다. HP, Attack, Defense, Sp.Atk, Sp.Def, Speed 등 6가지\r
    스탯이 있으며, 이를 NumPy 배열로 분석합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    pokemon = loadLocalDataset("pokemon")\r
    pokemon.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      pokemon = loadLocalDataset("pokemon")\r
      pokemon.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_extract\r
  title: 3단계. NumPy 배열 추출\r
  structuredPrimary: true\r
  subtitle: .values\r
  goal: 3단계. NumPy 배열 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    DataFrame에서 NumPy 배열을 추출합니다. pandas의 DataFrame은 엑셀 표와 비슷한 2차원 테이블 형태인데, .values 속성을 사용하면 이 테이블 데이터를 NumPy의 ndarray(N차원 배열) 형태로 꺼낼 수 있습니다. ndarray는 NumPy에서 모든 계산의 기본이 되는 자료구조입니다. 여러 컬럼(열)을 선택하면 행과 열로 이루어진 2차원 배열이 됩니다.\r
\r
    DataFrame의 .values 속성은 데이터를 NumPy 배열(ndarray)로 반환합니다. 여러 컬럼을 선택하면 2차원 배열이 됩니다.\r
  snippet: |-\r
    cols = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']\r
    stats = pokemon[cols].values\r
    stats\r
  exercise:\r
    prompt: 3단계. NumPy 배열 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      cols = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']\r
      stats = pokemon[cols].values\r
      stats\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. NumPy 배열 추출에서 \`cols\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. NumPy 배열 추출 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_shape\r
  title: 4단계. 배열 형태 확인\r
  structuredPrimary: true\r
  subtitle: shape\r
  goal: 4단계. 배열 형태 확인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: |-\r
    shape는 배열의 형태를 튜플(괄호로 묶인 숫자들)로 반환합니다. 예를 들어 (1000, 6)이라면 1000개의 행(포켓몬)과 6개의 열(스탯)이 있다는 뜻입니다. 데이터 분석에서 shape 확인은 가장 먼저 하는 작업입니다. 데이터가 몇 건인지, 특성이 몇 개인지 파악해야 이후 분석 방향을 정할 수 있기 때문입니다.\r
\r
    shape는 배열의 형태를 튜플로 반환합니다. (행, 열) 형태로 몇 개의 데이터가 몇 개의 특성을 가지는지 알 수 있습니다.\r
  snippet: stats.shape\r
  exercise:\r
    prompt: 4단계. 배열 형태 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: stats.shape\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 배열 형태 확인의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 4단계. 배열 형태 확인 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step5_ndim\r
  title: 5단계. 차원 수 확인\r
  structuredPrimary: true\r
  subtitle: ndim\r
  goal: 5단계. 차원 수 확인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: |-\r
    ndim은 배열의 차원 수를 나타냅니다. 차원이란 데이터를 표현하는 축의 개수입니다. 1차원은 한 줄로 늘어선 숫자들(리스트처럼), 2차원은 행과 열이 있는 표 형태(엑셀처럼), 3차원은 여러 장의 표가 쌓인 형태입니다. 현재 배열은 포켓몬(행) x 스탯(열) 구조이므로 2차원입니다. 수학에서는 1차원을 벡터, 2차원을 행렬, 3차원 이상을 텐서라고 부릅니다.\r
\r
    ndim은 배열의 차원 수입니다. 1차원은 벡터, 2차원은 행렬, 3차원 이상은 텐서라고 부릅니다.\r
  snippet: stats.ndim\r
  exercise:\r
    prompt: 5단계. 차원 수 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: stats.ndim\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 차원 수 확인의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 5단계. 차원 수 확인 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step6_dtype\r
  title: 6단계. 데이터 타입 확인\r
  structuredPrimary: true\r
  subtitle: dtype\r
  goal: 6단계. 데이터 타입 확인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: |-\r
    dtype은 배열에 저장된 데이터의 종류를 나타냅니다. 파이썬 리스트는 정수, 문자열, 소수점 숫자를 섞어서 담을 수 있지만, NumPy 배열은 모든 요소가 같은 타입이어야 합니다. 이런 제약 덕분에 메모리를 효율적으로 사용하고 계산 속도가 빨라집니다. int64는 64비트 정수(소수점 없는 숫자), float64는 64비트 실수(소수점 있는 숫자)를 의미합니다.\r
\r
    dtype은 배열 요소의 데이터 타입입니다. int64는 64비트 정수, float64는 64비트 실수를 의미합니다. NumPy 배열은 모든 요소가 같은 타입을 가집니다.\r
  snippet: stats.dtype\r
  exercise:\r
    prompt: 6단계. 데이터 타입 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: stats.dtype\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 데이터 타입 확인의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 6단계. 데이터 타입 확인 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step7_size\r
  title: 7단계. 요소 개수 확인\r
  structuredPrimary: true\r
  subtitle: size\r
  goal: 7단계. 요소 개수 확인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: size는 배열의 전체 요소 개수입니다. 2차원 배열의 경우 행 x 열 값과 같습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: stats.size\r
  exercise:\r
    prompt: 7단계. 요소 개수 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: stats.size\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 요소 개수 확인의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 7단계. 요소 개수 확인 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step8_column\r
  title: 8단계. 특정 컬럼 추출\r
  structuredPrimary: true\r
  subtitle: 2D 인덱싱\r
  goal: 8단계. 특정 컬럼 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    2차원 배열에서 특정 열을 추출해봅시다. 인덱싱이란 배열에서 원하는 위치의 값을 꺼내는 것입니다. 프로그래밍에서 순서를 셀 때는 0부터 시작하므로, HP는 첫 번째 열이지만 인덱스는 0입니다. [:, 0]이라는 표현에서 콜론(:)은 '모든 행'을 의미하고, 0은 '첫 번째 열'을 의미합니다. 즉 모든 포켓몬의 HP만 꺼내는 것입니다.\r
\r
    [:, 0]은 모든 행(:)의 첫 번째 열(0)을 선택합니다. 결과는 1차원 배열이 됩니다.\r
  snippet: |-\r
    hp = stats[:, 0]\r
    hp\r
  exercise:\r
    prompt: 8단계. 특정 컬럼 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      hp = stats[:, 0]\r
      hp\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 특정 컬럼 추출에서 \`hp\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 특정 컬럼 추출 실행 뒤 \`hp\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step9_mean\r
  title: 9단계. 평균 계산\r
  structuredPrimary: true\r
  subtitle: np.mean()\r
  goal: 9단계. 평균 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: |-\r
    np.mean()은 배열에 들어있는 모든 숫자의 평균을 계산합니다. 평균이란 모든 값을 더한 뒤 개수로 나눈 것입니다. 예를 들어 HP가 [100, 80, 120]이면 평균은 (100+80+120)/3 = 100입니다. 포켓몬 전체의 평균 HP를 알면 특정 포켓몬의 HP가 높은 편인지 낮은 편인지 비교 기준으로 삼을 수 있습니다.\r
\r
    np.mean()은 배열의 평균을 계산합니다. 배열 메서드로 hp.mean()처럼 사용할 수도 있습니다.\r
  snippet: np.mean(hp)\r
  exercise:\r
    prompt: 9단계. 평균 계산 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: np.mean(hp)\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 평균 계산의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 9단계. 평균 계산 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step10_maxmin\r
  title: 10단계. 최대/최소값\r
  structuredPrimary: true\r
  subtitle: np.max(), np.min()\r
  goal: 10단계. 최대/최소값에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: |-\r
    np.max()와 np.min()은 배열의 최대값과 최소값을 반환합니다. 가장 HP가 높은/낮은 포켓몬의 수치를 확인해봅시다.\r
\r
    np.max()와 np.min()은 배열의 최대값과 최소값을 반환합니다.\r
  snippet: np.max(hp)\r
  exercise:\r
    prompt: 10단계. 최대/최소값 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: np.max(hp)\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 최대/최소값의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 10단계. 최대/최소값 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step11_argmax\r
  title: 11단계. 최대값 인덱스\r
  structuredPrimary: true\r
  subtitle: np.argmax()\r
  goal: 11단계. 최대값 인덱스에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.argmax()는 최대값이 '어디에' 있는지 위치(인덱스)를 알려줍니다. np.max()가 '값 자체'를 알려준다면, np.argmax()는 '몇 번째인지'를 알려주는 것입니다. 예를 들어 [50, 255, 80]에서 max()는 255를, argmax()는 1(두 번째 위치)을 반환합니다. 이 인덱스로 원본 데이터에서 해당 포켓몬의 이름 등 다른 정보를 찾을 수 있습니다.\r
\r
    np.argmax()는 최대값이 위치한 인덱스를 반환합니다. np.argmin()은 최소값의 인덱스를 반환합니다.\r
  snippet: |-\r
    idx = np.argmax(hp)\r
    idx\r
  exercise:\r
    prompt: 11단계. 최대값 인덱스 예제에서 \`idx\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      idx = np.argmax(hp)\r
      idx\r
    hints:\r
    - 바꿀 지점은 \`idx = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`idx\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 최대값 인덱스에서 \`idx\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. 최대값 인덱스 실행 뒤 \`idx\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step12_find\r
  title: 12단계. 포켓몬 이름 찾기\r
  structuredPrimary: true\r
  subtitle: iloc\r
  goal: 12단계. 포켓몬 이름 찾기에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: 앞서 argmax()로 찾은 인덱스를 이용해 원본 DataFrame에서 해당 포켓몬의 이름을 확인합니다. iloc은 'index location'의 줄임말로,\r
    숫자 위치로 데이터를 찾는 방법입니다. iloc[인덱스]로 해당 행 전체를 가져오고, ['Name']으로 이름 컬럼만 선택합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: pokemon.iloc[idx]['Name']\r
  exercise:\r
    prompt: 12단계. 포켓몬 이름 찾기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: pokemon.iloc[idx]['Name']\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 포켓몬 이름 찾기의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 12단계. 포켓몬 이름 찾기 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step13_sum_axis\r
  title: 13단계. 축 방향 합계\r
  structuredPrimary: true\r
  subtitle: axis 파라미터\r
  goal: 13단계. 축 방향 합계에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    axis는 '축' 또는 '방향'을 의미하며, 연산을 어느 방향으로 수행할지 지정합니다. 엑셀로 비유하면 axis=0은 열을 따라 세로로 계산(같은 컬럼의 모든 행을 합산), axis=1은 행을 따라 가로로 계산(같은 행의 모든 컬럼을 합산)합니다. 여기서 axis=1로 설정하면 각 포켓몬의 HP+Attack+Defense+...를 모두 더한 총 스탯이 계산됩니다.\r
\r
    axis=1은 행 방향(가로)으로 연산합니다. 각 포켓몬의 능력치 합계가 계산됩니다. axis=0은 열 방향(세로)으로 연산합니다.\r
  snippet: |-\r
    total = np.sum(stats, axis=1)\r
    total[:10]\r
  exercise:\r
    prompt: 13단계. 축 방향 합계 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      total = np.sum(stats, axis=1)\r
      total[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 축 방향 합계에서 \`total\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 13단계. 축 방향 합계 실행 뒤 \`total\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step14_mean_axis\r
  title: 14단계. 스탯별 평균\r
  structuredPrimary: true\r
  subtitle: axis=0\r
  goal: 14단계. 스탯별 평균에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: axis=0으로 열 방향 평균을 구하면 각 스탯별 평균이 계산됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    avg = np.mean(stats, axis=0)\r
    avg\r
  exercise:\r
    prompt: 14단계. 스탯별 평균 예제에서 \`avg\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      avg = np.mean(stats, axis=0)\r
      avg\r
    hints:\r
    - 바꿀 지점은 \`avg = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`avg\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 스탯별 평균에서 \`avg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 14단계. 스탯별 평균 실행 뒤 \`avg\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step15_result\r
  title: 15단계. 결과 정리\r
  structuredPrimary: true\r
  subtitle: DataFrame 변환\r
  goal: 15단계. 결과 정리에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    계산 결과를 보기 좋게 DataFrame으로 정리합니다. 표준편차(std)는 데이터가 평균에서 얼마나 퍼져있는지를 나타내는 지표입니다. 표준편차가 크면 데이터들이 평균에서 멀리 떨어져 있고(편차가 크고), 작으면 평균 근처에 모여 있다는 뜻입니다. 예를 들어 HP의 표준편차가 크다면 포켓몬들의 HP가 천차만별이라는 의미입니다.\r
\r
    np.std()는 표준편차를 계산합니다. 표준편차가 크면 데이터가 평균에서 많이 떨어져 있다는 의미입니다. np.round()로 소수점 자릿수를 조절할 수 있습니다.\r
  snippet: |-\r
    std = np.std(stats, axis=0)\r
    pd.DataFrame({'Stat': cols, 'Mean': np.round(avg, 1), 'Std': np.round(std, 1)})\r
  exercise:\r
    prompt: 15단계. 결과 정리 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      std = np.std(stats, axis=0)\r
      pd.DataFrame({'Stat': cols, 'Mean': np.round(avg, 1), 'Std': np.round(std, 1)})\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 결과 정리의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 15단계. 결과 정리의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 능력치 테이블 품질 점검'\r
  structuredPrimary: true\r
  subtitle: shape, axis, argmax, 실패 케이스, 변주 실험\r
  goal: '현업 흐름 검증: 능력치 테이블 품질 점검에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    배열 분석은 결과 숫자가 그럴듯해 보이는 순간이 위험합니다. 스탯 행렬의 shape을 먼저 고정하고, axis별 계산이 무엇을 의미하는지 assert로 확인하세요.\r
\r
    변주 실험\r
    Speed에 가중치 2를 주는 weighted total을 만들고, 가장 강한 포켓몬이 그대로인지 \`np.argmax\` 결과를 비교하세요.\r
  tips:\r
  - 변주 실험 Speed에 가중치 2를 주는 weighted total을 만들고, 가장 강한 포켓몬이 그대로인지 \`np.argmax\` 결과를 비교하세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    names = np.array(["Bulbasaur", "Pikachu", "Snorlax"])\r
    cols = np.array(["HP", "Attack", "Defense", "Speed"])\r
    stats = np.array([\r
        [45, 49, 49, 45],\r
        [35, 55, 40, 90],\r
        [160, 110, 65, 30],\r
    ])\r
\r
    totals = stats.sum(axis=1)\r
    averages = stats.mean(axis=0)\r
    strongestIndex = int(np.argmax(totals))\r
\r
    assert stats.shape == (3, 4)\r
    assert names[strongestIndex] == "Snorlax"\r
    assert totals.tolist() == [188, 220, 365]\r
    assert dict(zip(cols, averages.round(1)))["Speed"] == 55.0\r
  exercise:\r
    prompt: '현업 흐름 검증: 능력치 테이블 품질 점검 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import numpy as np\r
\r
      names = np.array(["Bulbasaur", "Pikachu", "Snorlax"])\r
      cols = np.array(["HP", "Attack", "Defense", "Speed"])\r
      stats = np.array([\r
          [45, 49, 49, 45],\r
          [35, 55, 40, 90],\r
          [160, 110, 65, 30],\r
      ])\r
\r
      totals = stats.sum(axis=1)\r
      averages = stats.mean(axis=0)\r
      strongestIndex = int(np.argmax(totals))\r
\r
      assert stats.shape == (3, 4)\r
      assert names[strongestIndex] == "Snorlax"\r
      assert totals.tolist() == [188, 220, 365]\r
      assert dict(zip(cols, averages.round(1)))["Speed"] == 55.0\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 능력치 테이블 품질 점검에서 \`names\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 능력치 테이블 품질 점검에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 포켓몬 능력치 분석\r
  goal: 실습에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    지금까지 배운 개념을 활용하여 미션을 수행해봅시다. 각 미션은 독립적으로 실행 가능합니다.\r
\r
    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.\r
  snippet: |-\r
    import numpy as np\r
    import pandas as pd\r
\r
    data = pd.DataFrame({\r
        'Name': ['Bulbasaur', 'Charmander', 'Squirtle', 'Pikachu', 'Onix',\r
                 'Gengar', 'Snorlax', 'Chikorita', 'Treecko', 'Mudkip'],\r
        'Generation': [1, 1, 1, 1, 1, 1, 1, 2, 3, 3],\r
        'HP': [45, 39, 44, 35, 35, 60, 160, 45, 40, 50],\r
        'Attack': [49, 52, 48, 55, 45, 65, 110, 49, 45, 70],\r
        'Defense': [49, 43, 65, 40, 160, 60, 65, 65, 35, 50],\r
        'Sp. Atk': [65, 60, 50, 50, 30, 130, 65, 49, 65, 50],\r
        'Sp. Def': [65, 50, 64, 50, 45, 75, 110, 65, 55, 50],\r
        'Speed': [45, 65, 43, 90, 70, 110, 30, 45, 70, 40],\r
    })\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      import pandas as pd\r
\r
      data = pd.DataFrame({\r
          'Name': ['Bulbasaur', 'Charmander', 'Squirtle', 'Pikachu', 'Onix',\r
                   'Gengar', 'Snorlax', 'Chikorita', 'Treecko', 'Mudkip'],\r
          'Generation': [1, 1, 1, 1, 1, 1, 1, 2, 3, 3],\r
          'HP': [45, 39, 44, 35, 35, 60, 160, 45, 40, 50],\r
          'Attack': [49, 52, 48, 55, 45, 65, 110, 49, 45, 70],\r
          'Defense': [49, 43, 65, 40, 160, 60, 65, 65, 35, 50],\r
          'Sp. Atk': [65, 60, 50, 50, 30, 130, 65, 49, 65, 50],\r
          'Sp. Def': [65, 50, 64, 50, 45, 75, 110, 65, 55, 50],\r
          'Speed': [45, 65, 43, 90, 70, 110, 30, 45, 70, 40],\r
      })\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};