var e=`meta:\r
  packages:\r
  - numpy\r
  - pandas\r
  id: numpy_02\r
  title: 기온데이터탐색\r
  order: 2\r
  category: numpy\r
  difficulty: ⭐\r
  badge: 입문\r
  tags:\r
  - numpy\r
  - arange\r
  - linspace\r
  - indexing\r
  - slicing\r
  - reshape\r
  - 검증\r
  - 시계열배열\r
  seo:\r
    title: NumPy 인덱싱/슬라이싱 - 기온 데이터 탐색\r
    description: NumPy 배열의 인덱싱과 슬라이싱을 배우며 전 세계 기온 변화 데이터를 탐색합니다.\r
    keywords:\r
    - numpy\r
    - arange\r
    - linspace\r
    - 인덱싱\r
    - 슬라이싱\r
    - 기온데이터\r
intro:\r
  emoji: 🌡️\r
  goal: 전 세계 기온 변화 데이터로 인덱싱과 슬라이싱을 익힙니다.\r
  description: arange와 linspace로 배열을 생성하고, 다양한 인덱싱과 슬라이싱으로 원하는 데이터를 추출합니다.\r
  direction: 기온데이터탐색에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.\r
  benefits:\r
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.\r
  - 기온데이터탐색 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 배열 추출 결과 검증\r
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 기온데이터탐색 재사용\r
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 배열 계산 환경\r
      detail: numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 기온데이터탐색 실행\r
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.\r
    - label: 기온데이터탐색 완료\r
      detail: 검증된 코드를 계산 파이프라인로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: NumPy와 pandas를 불러옵니다. pandas는 CSV 파일 로딩용으로만 사용하며, pandas 자체는 나중에 Pandas 코스에서 배웁니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
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
  subtitle: 전지구 기온 데이터\r
  goal: 2단계. 데이터 로드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    1880년부터 1894년까지 15년치 전 지구 월평균 기온 편차 샘플을 로드합니다. '편차'란 기준 기간 평균 기온과의 차이를 말합니다. Mean 값이 +0.5라면 기준보다 0.5도 더 따뜻했다는 뜻이고, -0.3이라면 0.3도 더 추웠다는 뜻입니다. 이렇게 편차로 표현하면 월별 계절성과 장기 추세를 같은 단위로 비교할 수 있습니다.\r
\r
    이 데이터는 기준 기간(1951-1980) 대비 기온 편차(anomaly)를 나타냅니다. Mean 값이 양수면 기준보다 따뜻했고, 음수면 추웠습니다.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    temps = loadLocalDataset("global_temp")\r
    temps.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      temps = loadLocalDataset("global_temp")\r
      temps.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_extract\r
  title: 3단계. 배열 추출\r
  structuredPrimary: true\r
  subtitle: GCAG 소스\r
  goal: 3단계. 배열 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 이 데이터에는 두 가지 출처(Source)의 측정값이 있습니다. GCAG는 미국 해양대기청(NOAA)의 'Global Component of Climate\r
    at a Glance' 데이터입니다. 필터링이란 전체 데이터에서 특정 조건을 만족하는 행만 골라내는 것입니다. temps['Source'] == 'GCAG'로 GCAG 출처만\r
    선택하고, .values로 NumPy 배열로 변환합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    gcag = temps[temps['Source'] == 'GCAG']\r
    arr = gcag['Mean'].values\r
    arr.shape\r
  exercise:\r
    prompt: 3단계. 배열 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      gcag = temps[temps['Source'] == 'GCAG']\r
      arr = gcag['Mean'].values\r
      arr.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 배열 추출에서 \`gcag\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 배열 추출 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_arange\r
  title: 4단계. arange로 배열 생성\r
  structuredPrimary: true\r
  subtitle: np.arange()\r
  goal: 4단계. arange로 배열 생성에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.arange()는 연속된 숫자 배열을 자동으로 생성하는 함수입니다. 일일이 [1880, 1881, 1882, ...]를 타이핑하는 대신 np.arange(1880, 1895)라고 쓰면 1880부터 1894까지 15개의 숫자가 담긴 배열이 만들어집니다. 파이썬의 range()와 비슷하지만 NumPy 배열을 반환해서 바로 수학 연산에 활용할 수 있습니다.\r
\r
    np.arange(start, stop, step)은 start부터 stop 미만까지 step 간격으로 배열을 생성합니다. 파이썬 range()와 비슷하지만 NumPy 배열을 반환합니다.\r
  tips:\r
  - np.arange(start, stop, step)은 start부터 stop 미만까지 step 간격으로 배열을 생성합니다. 파이썬 range()와 비슷하지만 NumPy 배열을\r
    반환합니다.\r
  snippet: |-\r
    years = np.arange(1880, 1895)\r
    years\r
  exercise:\r
    prompt: 4단계. arange로 배열 생성 예제에서 \`years\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      years = np.arange(1880, 1895)\r
      years\r
    hints:\r
    - 바꿀 지점은 \`years = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`years\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. arange로 배열 생성에서 \`years\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. arange로 배열 생성 실행 뒤 \`years\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step5_arange_step\r
  title: 5단계. step 간격 지정\r
  structuredPrimary: true\r
  subtitle: 10년 단위\r
  goal: 5단계. step 간격 지정에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: step을 지정해 특정 간격의 배열을 만들 수 있습니다. 10년 단위 연도를 생성해봅시다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    decades = np.arange(1880, 2030, 10)\r
    decades\r
  exercise:\r
    prompt: 5단계. step 간격 지정 예제에서 \`decades\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      decades = np.arange(1880, 2030, 10)\r
      decades\r
    hints:\r
    - 바꿀 지점은 \`decades = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`decades\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. step 간격 지정에서 \`decades\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. step 간격 지정 실행 뒤 \`decades\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step6_linspace\r
  title: 6단계. linspace로 균등 분할\r
  structuredPrimary: true\r
  subtitle: np.linspace()\r
  goal: 6단계. linspace로 균등 분할에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    linspace는 'linear space(선형 공간)'의 줄임말로, 시작점과 끝점 사이를 균등하게 나눈 배열을 생성합니다. arange가 '간격'을 지정하는 반면, linspace는 '개수'를 지정합니다. 예를 들어 linspace(0, 1, 11)은 0부터 1까지를 11개 점으로 균등하게 나누어 0, 0.1, 0.2, ..., 1.0을 만듭니다. 그래프를 그릴 때 x축 값을 만들거나 실험 구간을 나눌 때 유용합니다.\r
\r
    np.linspace(start, stop, num)은 start부터 stop까지 num개의 균등한 간격의 숫자를 생성합니다. arange와 달리 stop이 포함됩니다.\r
  snippet: |-\r
    space = np.linspace(0, 1, 11)\r
    space\r
  exercise:\r
    prompt: 6단계. linspace로 균등 분할 예제에서 \`space\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      space = np.linspace(0, 1, 11)\r
      space\r
    hints:\r
    - 바꿀 지점은 \`space = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`space\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. linspace로 균등 분할에서 \`space\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. linspace로 균등 분할 실행 뒤 \`space\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step7_indexing\r
  title: 7단계. 기본 인덱싱\r
  structuredPrimary: true\r
  subtitle: 요소 접근\r
  goal: 7단계. 기본 인덱싱에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: |-\r
    NumPy 배열의 인덱싱은 파이썬 리스트와 같습니다. 0부터 시작하며, 음수 인덱스는 뒤에서부터 접근합니다.\r
\r
    NumPy 배열의 인덱싱은 파이썬 리스트와 같습니다. 0부터 시작하며, 음수 인덱스는 뒤에서부터 접근합니다.\r
  snippet: arr[0]\r
  exercise:\r
    prompt: 7단계. 기본 인덱싱 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: arr[0]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 기본 인덱싱의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 7단계. 기본 인덱싱 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step8_negative\r
  title: 8단계. 음수 인덱싱\r
  structuredPrimary: true\r
  subtitle: 마지막 요소\r
  goal: 8단계. 음수 인덱싱에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: 음수 인덱스로 뒤에서부터 접근합니다. -1은 마지막 요소입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: arr[-1]\r
  exercise:\r
    prompt: 8단계. 음수 인덱싱 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: arr[-1]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 음수 인덱싱의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 8단계. 음수 인덱싱 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step9_slicing\r
  title: 9단계. 슬라이싱\r
  structuredPrimary: true\r
  subtitle: 범위 선택\r
  goal: 9단계. 슬라이싱에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    슬라이싱(slicing)은 배열을 '잘라서' 일부분만 꺼내는 기능입니다. 빵을 슬라이스하듯이 원하는 구간만 선택합니다. [시작:끝] 형태로 쓰며, 끝 위치는 포함되지 않습니다. [:12]는 '처음부터 12번째 직전까지', 즉 0~11번 인덱스(12개)를 선택합니다. 월별 데이터에서 처음 12개는 첫 해(1880년) 1월~12월 데이터입니다.\r
\r
    [start:stop]은 start부터 stop-1까지의 요소를 선택합니다. start를 생략하면 처음부터, stop을 생략하면 끝까지 선택합니다.\r
  snippet: |-\r
    first = arr[:12]\r
    first\r
  exercise:\r
    prompt: 9단계. 슬라이싱 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      first = arr[:12]\r
      first\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 슬라이싱에서 \`first\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 슬라이싱 실행 뒤 \`first\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step10_last\r
  title: 10단계. 최근 데이터 추출\r
  structuredPrimary: true\r
  subtitle: 마지막 12개월\r
  goal: 10단계. 최근 데이터 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 음수 인덱스와 슬라이싱을 조합하면 마지막 N개 요소를 쉽게 추출할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    last = arr[-12:]\r
    last\r
  exercise:\r
    prompt: 10단계. 최근 데이터 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      last = arr[-12:]\r
      last\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 최근 데이터 추출에서 \`last\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 최근 데이터 추출 실행 뒤 \`last\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step11_step\r
  title: 11단계. step 슬라이싱\r
  structuredPrimary: true\r
  subtitle: 간격 지정\r
  goal: 11단계. step 슬라이싱에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    step을 사용해 특정 간격으로 추출합니다. 매년 1월(12개월마다) 데이터만 추출해봅시다.\r
\r
    [start:stop:step]에서 step은 간격입니다. [::12]는 처음부터 끝까지 12개 간격으로 선택합니다.\r
  snippet: |-\r
    jan = arr[::12]\r
    jan[:10]\r
  exercise:\r
    prompt: 11단계. step 슬라이싱 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      jan = arr[::12]\r
      jan[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. step 슬라이싱에서 \`jan\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. step 슬라이싱 실행 뒤 \`jan\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step12_reshape\r
  title: 12단계. reshape로 형태 변경\r
  structuredPrimary: true\r
  subtitle: 2차원 배열\r
  goal: 12단계. reshape로 형태 변경에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: reshape는 배열의 '형태를 바꾸는' 기능입니다. 현재 기온 데이터는 180개 숫자가 일렬로 나열된 1차원 배열입니다. 이것을 reshape(15,\r
    12)로 바꾸면 15행 × 12열의 표(2차원 배열)가 됩니다. 각 행이 1년치(12개월) 데이터가 되어, 연도별 비교가 훨씬 쉬워집니다. 총 개수(15×12=180)는\r
    변하지 않고 배치만 바뀝니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    n = len(arr) // 12\r
    matrix = arr[:n * 12].reshape(n, 12)\r
    matrix.shape\r
  exercise:\r
    prompt: 12단계. reshape로 형태 변경 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      n = len(arr) // 12\r
      matrix = arr[:n * 12].reshape(n, 12)\r
      matrix.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. reshape로 형태 변경에서 \`n\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 12단계. reshape로 형태 변경 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step13_2d_index\r
  title: 13단계. 2D 배열 인덱싱\r
  structuredPrimary: true\r
  subtitle: 특정 연도 선택\r
  goal: 13단계. 2D 배열 인덱싱에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: 2차원 배열에서 특정 행(연도)의 데이터를 추출합니다. 첫 번째 행은 1880년 데이터입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: matrix[0]\r
  exercise:\r
    prompt: 13단계. 2D 배열 인덱싱 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: matrix[0]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 2D 배열 인덱싱의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 13단계. 2D 배열 인덱싱 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step14_column\r
  title: 14단계. 특정 월 선택\r
  structuredPrimary: true\r
  subtitle: 열 인덱싱\r
  goal: 14단계. 특정 월 선택에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    특정 월의 모든 연도 데이터를 추출합니다. 7월(인덱스 6) 데이터를 확인해봅시다.\r
\r
    2차원 배열에서 [행, 열] 형태로 인덱싱합니다. [:, 6]은 모든 행의 6번째 열을 선택합니다.\r
  snippet: |-\r
    july = matrix[:, 6]\r
    july[:10]\r
  exercise:\r
    prompt: 14단계. 특정 월 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      july = matrix[:, 6]\r
      july[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 특정 월 선택에서 \`july\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 14단계. 특정 월 선택 실행 뒤 \`july\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step15_yearly_mean\r
  title: 15단계. 연도별 평균\r
  structuredPrimary: true\r
  subtitle: axis=1\r
  goal: 15단계. 연도별 평균에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 연도별 평균 기온 편차를 계산하고, 최근 10년과 과거 10년을 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    yearly = np.mean(matrix, axis=1)\r
    recent = yearly[-10:]\r
    past = yearly[:10]\r
    avg1 = np.mean(recent)\r
    avg2 = np.mean(past)\r
    f"최근 10년 평균: {avg1:.3f}, 과거 10년 평균: {avg2:.3f}, 차이: {avg1 - avg2:.3f}"\r
  exercise:\r
    prompt: 15단계. 연도별 평균 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      yearly = np.mean(matrix, axis=1)\r
      recent = yearly[-10:]\r
      past = yearly[:10]\r
      avg1 = np.mean(recent)\r
      avg2 = np.mean(past)\r
      f"최근 10년 평균: {avg1:.3f}, 과거 10년 평균: {avg2:.3f}, 차이: {avg1 - avg2:.3f}"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 연도별 평균에서 \`yearly\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 15단계. 연도별 평균 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 월별 기온 편차 행렬 만들기'\r
  structuredPrimary: true\r
  subtitle: reshape 전제, 월 선택, 기간 비교, 실패 케이스\r
  goal: '현업 흐름 검증: 월별 기온 편차 행렬 만들기에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    시계열을 행렬로 바꿀 때는 데이터 개수가 월 단위로 딱 맞는지 먼저 확인해야 합니다. reshape는 강력하지만 전제 조건이 틀리면 분석 전체가 잘못됩니다.\r
\r
    변주 실험\r
    분기별 데이터라면 \`monthsPerYear=4\` 대신 실제 분기 수를 쓰고, \`axis=1\` 평균이 무엇을 뜻하는지 다시 설명해보세요.\r
  tips:\r
  - 변주 실험 분기별 데이터라면 \`monthsPerYear=4\` 대신 실제 분기 수를 쓰고, \`axis=1\` 평균이 무엇을 뜻하는지 다시 설명해보세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    monthly = np.array([\r
        -0.2, -0.1, 0.0, 0.1,\r
        -0.1, 0.0, 0.2, 0.3,\r
        0.0, 0.1, 0.3, 0.4,\r
    ])\r
\r
    matrix = monthly.reshape(3, 4)\r
    yearlyMean = matrix.mean(axis=1)\r
    warmestYearIndex = int(np.argmax(yearlyMean))\r
\r
    assert matrix.shape == (3, 4)\r
    assert np.allclose(yearlyMean, [-0.05, 0.1, 0.2])\r
    assert warmestYearIndex == 2\r
    assert matrix[:, 2].tolist() == [0.0, 0.2, 0.3]\r
  exercise:\r
    prompt: '현업 흐름 검증: 월별 기온 편차 행렬 만들기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import numpy as np\r
\r
      monthly = np.array([\r
          -0.2, -0.1, 0.0, 0.1,\r
          -0.1, 0.0, 0.2, 0.3,\r
          0.0, 0.1, 0.3, 0.4,\r
      ])\r
\r
      matrix = monthly.reshape(3, 4)\r
      yearlyMean = matrix.mean(axis=1)\r
      warmestYearIndex = int(np.argmax(yearlyMean))\r
\r
      assert matrix.shape == (3, 4)\r
      assert np.allclose(yearlyMean, [-0.05, 0.1, 0.2])\r
      assert warmestYearIndex == 2\r
      assert matrix[:, 2].tolist() == [0.0, 0.2, 0.3]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 월별 기온 편차 행렬 만들기에서 \`monthly\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 월별 기온 편차 행렬 만들기에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 기온 데이터 분석\r
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
        'Source': ['GCAG'] * 24 + ['GISTEMP'] * 4,\r
        'Date': [f"1880-{m:02d}-01" for m in range(1, 13)]\r
                + [f"1881-{m:02d}-01" for m in range(1, 13)]\r
                + [f"1880-{m:02d}-01" for m in range(1, 5)],\r
        'Mean': [-0.20, -0.14, -0.10, -0.02, 0.04, 0.10,\r
                 0.18, 0.21, 0.15, 0.08, -0.01, -0.07,\r
                 -0.16, -0.09, -0.03, 0.05, 0.12, 0.19,\r
                 0.26, 0.29, 0.22, 0.14, 0.06, -0.02,\r
                 -0.18, -0.08, 0.02, 0.10],\r
    })\r
    gcag = data[data['Source'] == 'GCAG']\r
    temps = gcag['Mean'].values\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      import pandas as pd\r
\r
      data = pd.DataFrame({\r
          'Source': ['GCAG'] * 24 + ['GISTEMP'] * 4,\r
          'Date': [f"1880-{m:02d}-01" for m in range(1, 13)]\r
                  + [f"1881-{m:02d}-01" for m in range(1, 13)]\r
                  + [f"1880-{m:02d}-01" for m in range(1, 5)],\r
          'Mean': [-0.20, -0.14, -0.10, -0.02, 0.04, 0.10,\r
                   0.18, 0.21, 0.15, 0.08, -0.01, -0.07,\r
                   -0.16, -0.09, -0.03, 0.05, 0.12, 0.19,\r
                   0.26, 0.29, 0.22, 0.14, 0.06, -0.02,\r
                   -0.18, -0.08, 0.02, 0.10],\r
      })\r
      gcag = data[data['Source'] == 'GCAG']\r
      temps = gcag['Mean'].values\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
`;export{e as default};