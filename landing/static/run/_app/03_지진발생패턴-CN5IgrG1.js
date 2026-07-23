var e=`meta:\r
  packages:\r
  - numpy\r
  - pandas\r
  id: numpy_03\r
  title: 지진발생패턴\r
  order: 3\r
  category: numpy\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - numpy\r
  - boolean indexing\r
  - where\r
  - unique\r
  - percentile\r
  - argsort\r
  - 검증\r
  - 조건선택\r
  seo:\r
    title: NumPy 불리언 인덱싱 - 지진 데이터 분석\r
    description: NumPy의 불리언 인덱싱과 조건 선택을 배우며 전 세계 지진 발생 데이터를 분석합니다.\r
    keywords:\r
    - numpy\r
    - boolean indexing\r
    - where\r
    - unique\r
    - 지진데이터\r
intro:\r
  emoji: 🌍\r
  goal: 지진 데이터로 불리언 인덱싱과 조건 선택을 익힙니다.\r
  description: 160건의 로컬 지진 샘플을 분석합니다. 불리언 인덱싱으로 조건에 맞는 데이터를 필터링하고, where와 unique 함수로 데이터를 탐색합니다.\r
  direction: 지진발생패턴에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.\r
  benefits:\r
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.\r
  - 지진발생패턴 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 배열 추출 결과 검증\r
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 지진발생패턴 재사용\r
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 배열 계산 환경\r
      detail: numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 지진발생패턴 실행\r
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.\r
    - label: 지진발생패턴 완료\r
      detail: 검증된 코드를 계산 파이프라인로 남깁니다.\r
sections:\r
- id: step1_import\r
  title: 1단계. 라이브러리 불러오기\r
  structuredPrimary: true\r
  subtitle: import\r
  goal: 1단계. 라이브러리 불러오기에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.\r
  explanation: NumPy와 pandas를 불러옵니다. pandas는 CSV 로딩용으로만 사용합니다.\r
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
  subtitle: 지진 데이터셋\r
  goal: 2단계. 데이터 로드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 160건의 로컬 지진 샘플을 로드합니다. Magnitude(규모), Latitude(위도), Longitude(경도) 등의 정보가 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    df = loadLocalDataset("earthquakes")\r
    df.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      df = loadLocalDataset("earthquakes")\r
      df.head()\r
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
  subtitle: Magnitude\r
  goal: 3단계. 배열 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: Magnitude는 지진의 '규모'를 나타내는 수치입니다. 리히터 규모라고도 불리며, 숫자가 1 증가할 때마다 에너지는 약 32배 커집니다. 예를 들어 규모\r
    6.0 지진은 규모 5.0 지진보다 32배나 강합니다. df['Magnitude']로 해당 열을 선택하고 .values로 NumPy 배열로 변환합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    mag = df['Magnitude'].values\r
    mag.shape\r
  exercise:\r
    prompt: 3단계. 배열 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      mag = df['Magnitude'].values\r
      mag.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 배열 추출에서 \`mag\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 배열 추출 실행 뒤 \`mag\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step4_stats\r
  title: 4단계. 기본 통계\r
  structuredPrimary: true\r
  subtitle: 규모 분포\r
  goal: 4단계. 기본 통계에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: 기본 통계로 지진 규모 분포를 파악합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: 'f"평균: {np.mean(mag):.2f}, 최소: {np.min(mag):.1f}, 최대: {np.max(mag):.1f}"'\r
  exercise:\r
    prompt: 4단계. 기본 통계 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: 'f"평균: {np.mean(mag):.2f}, 최소: {np.min(mag):.1f}, 최대: {np.max(mag):.1f}"'\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 기본 통계의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 4단계. 기본 통계 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step5_boolean\r
  title: 5단계. 불리언 배열 생성\r
  structuredPrimary: true\r
  subtitle: 비교 연산\r
  goal: 5단계. 불리언 배열 생성에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    불리언(Boolean)은 '참(True) 또는 거짓(False)' 두 가지 값만 가지는 데이터 타입입니다. mag >= 6.0이라고 쓰면 NumPy는 160개 모든 지진 샘플에 대해 '규모가 6.0 이상인가?'를 확인하고, 각각 True 또는 False로 답한 배열을 만들어 줍니다. 이렇게 만든 True/False 배열을 불리언 배열이라 하며, 이것으로 원하는 데이터만 골라낼 수 있습니다.\r
\r
    NumPy 배열에 비교 연산을 적용하면 각 요소에 대한 True/False 불리언 배열이 반환됩니다. 이 배열을 인덱싱에 사용할 수 있습니다.\r
  snippet: |-\r
    strong = mag >= 6.0\r
    strong[:10]\r
  exercise:\r
    prompt: 5단계. 불리언 배열 생성 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      strong = mag >= 6.0\r
      strong[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 불리언 배열 생성에서 \`strong\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 불리언 배열 생성 실행 뒤 \`strong\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step6_boolean_index\r
  title: 6단계. 불리언 인덱싱\r
  structuredPrimary: true\r
  subtitle: 조건 필터링\r
  goal: 6단계. 불리언 인덱싱에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    불리언 인덱싱은 True/False 배열을 '체크리스트'처럼 사용해서 True인 항목만 골라내는 기법입니다. mag[strong]이라고 쓰면 strong 배열이 True인 위치의 규모 값만 추출됩니다. 160개 샘플 중 규모 6.0 이상인 지진만 깔끔하게 걸러낼 수 있습니다. 엑셀의 필터 기능을 코드 한 줄로 구현하는 것입니다.\r
\r
    불리언 배열을 인덱스로 사용하면 True인 위치의 요소만 선택됩니다. mag[mag >= 6.0]처럼 한 줄로 쓸 수도 있습니다.\r
  snippet: |-\r
    filtered = mag[strong]\r
    filtered.shape\r
  exercise:\r
    prompt: 6단계. 불리언 인덱싱 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      filtered = mag[strong]\r
      filtered.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 불리언 인덱싱에서 \`filtered\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 불리언 인덱싱 실행 뒤 \`filtered\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step7_ratio\r
  title: 7단계. 비율 계산\r
  structuredPrimary: true\r
  subtitle: sum으로 개수 세기\r
  goal: 7단계. 비율 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    불리언 배열에 sum()을 적용하면 True의 개수가 계산됩니다. 강진 비율을 구해봅시다.\r
\r
    불리언 배열에 sum()을 적용하면 True의 개수가 계산됩니다. True는 1, False는 0으로 취급되기 때문입니다.\r
  snippet: |-\r
    ratio = np.sum(strong) / len(mag) * 100\r
    f"규모 6.0 이상 비율: {ratio:.2f}%"\r
  exercise:\r
    prompt: 7단계. 비율 계산 예제에서 \`ratio\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      ratio = np.sum(strong) / len(mag) * 100\r
      f"규모 6.0 이상 비율: {ratio:.2f}%"\r
    hints:\r
    - 바꿀 지점은 \`ratio = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`ratio\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 비율 계산에서 \`ratio\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 비율 계산 실행 뒤 \`ratio\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step8_multiple\r
  title: 8단계. 여러 조건 결합\r
  structuredPrimary: true\r
  subtitle: '& (and), | (or)'\r
  goal: 8단계. 여러 조건 결합에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    두 개 이상의 조건을 동시에 적용할 수 있습니다. &는 '그리고(AND)'로 두 조건을 모두 만족해야 하고, |는 '또는(OR)'로 둘 중 하나만 만족해도 됩니다. (mag >= 5.0) & (mag < 6.0)은 '5.0 이상이면서 동시에 6.0 미만'인 중규모 지진을 찾습니다. 각 조건을 괄호로 감싸는 것이 중요합니다.\r
\r
    NumPy에서 여러 조건을 결합할 때는 & (and), | (or), ~ (not)을 사용합니다. 각 조건은 반드시 괄호로 감싸야 합니다.\r
  snippet: |-\r
    medium = (mag >= 5.0) & (mag < 6.0)\r
    count = np.sum(medium)\r
    f"규모 5.0~6.0 지진 수: {count}"\r
  exercise:\r
    prompt: 8단계. 여러 조건 결합 예제에서 \`medium\`, \`count\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      medium = (mag >= 5.0) & (mag < 6.0)\r
      count = np.sum(medium)\r
      f"규모 5.0~6.0 지진 수: {count}"\r
    hints:\r
    - 바꿀 지점은 \`medium = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`medium\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 여러 조건 결합에서 \`medium\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 여러 조건 결합 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_percentile\r
  title: 9단계. 백분위수\r
  structuredPrimary: true\r
  subtitle: np.percentile()\r
  goal: 9단계. 백분위수에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    백분위수(percentile)는 '전체 중 몇 %가 이 값보다 작은가'를 나타냅니다. 예를 들어 75번째 백분위수가 5.5라면, 전체 지진의 75%가 규모 5.5 미만이라는 뜻입니다. 25%, 50%, 75% 백분위수를 보면 데이터가 어떻게 분포되어 있는지 한눈에 파악할 수 있습니다. 50번째 백분위수는 중앙값(median)과 같습니다.\r
\r
    np.percentile(arr, q)는 q번째 백분위수를 반환합니다. 50번째 백분위수는 중앙값과 같습니다.\r
  snippet: |-\r
    q1 = np.percentile(mag, 25)\r
    q2 = np.percentile(mag, 50)\r
    q3 = np.percentile(mag, 75)\r
    f"25%: {q1:.2f}, 50%(중앙값): {q2:.2f}, 75%: {q3:.2f}"\r
  exercise:\r
    prompt: 9단계. 백분위수 예제에서 \`q1\`, \`q2\`, \`q3\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      q1 = np.percentile(mag, 25)\r
      q2 = np.percentile(mag, 50)\r
      q3 = np.percentile(mag, 75)\r
      f"25%: {q1:.2f}, 50%(중앙값): {q2:.2f}, 75%: {q3:.2f}"\r
    hints:\r
    - 바꿀 지점은 \`q1 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`q1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 백분위수에서 \`q1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 백분위수 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step10_where\r
  title: 10단계. where로 조건 선택\r
  structuredPrimary: true\r
  subtitle: np.where()\r
  goal: 10단계. where로 조건 선택에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.where()는 조건에 따라 다른 값을 지정하는 함수입니다. np.where(조건, 참일때 값, 거짓일때 값) 형태로 씁니다. 엑셀의 IF 함수와 똑같이 작동합니다. mag >= 6.0 조건이 True면 'Strong', False면 'Normal'을 할당해서 160개 지진 샘플 전체를 한 번에 분류할 수 있습니다.\r
\r
    np.where(condition, x, y)는 조건이 True인 곳은 x, False인 곳은 y를 반환합니다. 엑셀의 IF 함수와 비슷합니다.\r
  snippet: |-\r
    category = np.where(mag >= 6.0, 'Strong', 'Normal')\r
    category[:10]\r
  exercise:\r
    prompt: 10단계. where로 조건 선택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      category = np.where(mag >= 6.0, 'Strong', 'Normal')\r
      category[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. where로 조건 선택에서 \`category\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. where로 조건 선택 실행 뒤 \`category\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step11_nested_where\r
  title: 11단계. 중첩 where\r
  structuredPrimary: true\r
  subtitle: 여러 카테고리\r
  goal: 11단계. 중첩 where에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: where 안에 또 다른 where를 넣어 3개 이상의 카테고리로 분류할 수 있습니다. 엑셀에서 IF 안에 IF를 넣는 중첩 IF와 같습니다. 규모 7.0\r
    이상은 Major, 6.0 이상은 Strong, 5.0 이상은 Moderate, 나머지는 Light로 4단계 분류가 가능합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    level = np.where(mag >= 7.0, 'Major',\r
            np.where(mag >= 6.0, 'Strong',\r
            np.where(mag >= 5.0, 'Moderate', 'Light')))\r
    level[:20]\r
  exercise:\r
    prompt: 11단계. 중첩 where 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      level = np.where(mag >= 7.0, 'Major',\r
              np.where(mag >= 6.0, 'Strong',\r
              np.where(mag >= 5.0, 'Moderate', 'Light')))\r
      level[:20]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 중첩 where에서 \`level\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. 중첩 where 실행 뒤 \`level\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step12_unique\r
  title: 12단계. 고유값과 빈도\r
  structuredPrimary: true\r
  subtitle: np.unique()\r
  goal: 12단계. 고유값과 빈도에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    np.unique()는 배열에서 '중복을 제거한 고유한 값들'을 찾아줍니다. 예를 들어 ['A', 'B', 'A', 'C', 'B']에서 unique를 적용하면 ['A', 'B', 'C']가 됩니다. return_counts=True를 추가하면 각 값이 몇 번 나타났는지도 함께 알려줍니다. 분류 결과별 지진 수를 세는 데 유용합니다.\r
\r
    np.unique()는 배열의 고유한 값들을 반환합니다. return_counts=True를 추가하면 각 값의 빈도도 함께 반환됩니다.\r
  snippet: |-\r
    labels, counts = np.unique(level, return_counts=True)\r
    pd.DataFrame({'Category': labels, 'Count': counts})\r
  exercise:\r
    prompt: 12단계. 고유값과 빈도 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      labels, counts = np.unique(level, return_counts=True)\r
      pd.DataFrame({'Category': labels, 'Count': counts})\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 고유값과 빈도의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 고유값과 빈도 실행 결과가 shape와 수치 결과 기준으로 바꾼 열 이름이나 행 값을 반영해야 합니다.\r
- id: step13_location\r
  title: 13단계. 위치 데이터 추출\r
  structuredPrimary: true\r
  subtitle: 위도/경도\r
  goal: 13단계. 위치 데이터 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 위도(Latitude)는 적도를 기준으로 남북 위치를, 경도(Longitude)는 영국 그리니치를 기준으로 동서 위치를 나타냅니다. 서울은 약 위도 37°,\r
    경도 127°입니다. argmax로 최대 규모 지진의 인덱스를 찾고, 그 인덱스로 위도와 경도 배열에서 해당 위치를 꺼내면 가장 강한 지진이 어디서 발생했는지 알 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lat = df['Latitude'].values\r
    lon = df['Longitude'].values\r
    idx = np.argmax(mag)\r
    peak = mag[idx]\r
    y = lat[idx]\r
    x = lon[idx]\r
    f"최대 규모: {peak}, 위치: ({y:.2f}, {x:.2f})"\r
  exercise:\r
    prompt: 13단계. 위치 데이터 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      lat = df['Latitude'].values\r
      lon = df['Longitude'].values\r
      idx = np.argmax(mag)\r
      peak = mag[idx]\r
      y = lat[idx]\r
      x = lon[idx]\r
      f"최대 규모: {peak}, 위치: ({y:.2f}, {x:.2f})"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 위치 데이터 추출에서 \`lat\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 13단계. 위치 데이터 추출 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step14_region\r
  title: 14단계. 지역 필터링\r
  structuredPrimary: true\r
  subtitle: 태평양 불의 고리\r
  goal: 14단계. 지역 필터링에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 태평양 불의 고리(Ring of Fire)는 태평양을 둘러싼 지역으로, 전 세계 지진과 화산의 약 75%가 이곳에서 발생합니다. 한국, 일본, 인도네시아,\r
    칠레, 미국 서부 등이 포함됩니다. 경도가 120° 이상이거나 -60° 이하이고(|로 연결), 위도가 60° 이내인 조건을 &로 결합해 이 지역의 지진을 필터링합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pacific = ((lon >= 120) | (lon <= -60)) & (np.abs(lat) <= 60)\r
    n = np.sum(pacific)\r
    f"태평양 불의 고리 지진 수: {n} ({n/len(mag)*100:.1f}%)"\r
  exercise:\r
    prompt: 14단계. 지역 필터링 예제에서 \`pacific\`, \`n\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      pacific = ((lon >= 120) | (lon <= -60)) & (np.abs(lat) <= 60)\r
      n = np.sum(pacific)\r
      f"태평양 불의 고리 지진 수: {n} ({n/len(mag)*100:.1f}%)"\r
    hints:\r
    - 바꿀 지점은 \`pacific = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`pacific\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 지역 필터링에서 \`pacific\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 14단계. 지역 필터링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step15_argsort\r
  title: 15단계. 정렬 인덱스\r
  structuredPrimary: true\r
  subtitle: np.argsort()\r
  goal: 15단계. 정렬 인덱스에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    argsort()는 '정렬하면 각 값이 몇 번째에 위치할지'를 알려주는 인덱스 배열을 반환합니다. 예를 들어 [3, 1, 2]를 argsort하면 [1, 2, 0]이 나오는데, 이는 '1번 위치 값(1)이 가장 작고, 다음은 2번 위치(2), 그 다음은 0번 위치(3)'라는 뜻입니다. [::-1]로 역순으로 만들면 내림차순 정렬 인덱스가 되어 상위 10개 강진을 쉽게 찾을 수 있습니다.\r
\r
    np.argsort()는 정렬된 인덱스를 반환합니다. [::-1]로 역순으로 만들어 내림차순 정렬 인덱스를 얻습니다.\r
  snippet: |-\r
    order = np.argsort(mag)[::-1]\r
    top = mag[order[:10]]\r
    top\r
  exercise:\r
    prompt: 15단계. 정렬 인덱스 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      order = np.argsort(mag)[::-1]\r
      top = mag[order[:10]]\r
      top\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 정렬 인덱스에서 \`order\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 15단계. 정렬 인덱스 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 지진 위험 이벤트 필터링'\r
  structuredPrimary: true\r
  subtitle: 불리언 인덱싱, percentile, argsort, 실패 케이스\r
  goal: '현업 흐름 검증: 지진 위험 이벤트 필터링에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    조건 선택은 눈으로 맞아 보이는 결과보다 마스크의 의미가 중요합니다. 규모와 깊이 조건을 분리해서 예측하고, 상위 위험 이벤트가 올바른 순서로 뽑히는지 검증하세요.\r
\r
    변주 실험\r
    깊이가 얕은 지진보다 대도시 근접 지진을 더 위험하게 보는 정책으로 바꾸고, 정렬 기준 배열을 새로 만들어 비교하세요.\r
  tips:\r
  - 변주 실험 깊이가 얕은 지진보다 대도시 근접 지진을 더 위험하게 보는 정책으로 바꾸고, 정렬 기준 배열을 새로 만들어 비교하세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    magnitude = np.array([4.8, 5.1, 6.3, 4.2, 7.0])\r
    depth = np.array([10, 70, 25, 12, 40])\r
    eventIds = np.array(["E-1", "E-2", "E-3", "E-4", "E-5"])\r
\r
    shallowStrong = (magnitude >= 5.0) & (depth <= 50)\r
    threshold = np.percentile(magnitude, 80)\r
    topOrder = np.argsort(magnitude)[::-1]\r
\r
    assert eventIds[shallowStrong].tolist() == ["E-3", "E-5"]\r
    assert round(float(threshold), 2) == 6.44\r
    assert eventIds[topOrder[:2]].tolist() == ["E-5", "E-3"]\r
  exercise:\r
    prompt: '현업 흐름 검증: 지진 위험 이벤트 필터링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import numpy as np\r
\r
      magnitude = np.array([4.8, 5.1, 6.3, 4.2, 7.0])\r
      depth = np.array([10, 70, 25, 12, 40])\r
      eventIds = np.array(["E-1", "E-2", "E-3", "E-4", "E-5"])\r
\r
      shallowStrong = (magnitude >= 5.0) & (depth <= 50)\r
      threshold = np.percentile(magnitude, 80)\r
      topOrder = np.argsort(magnitude)[::-1]\r
\r
      assert eventIds[shallowStrong].tolist() == ["E-3", "E-5"]\r
      assert round(float(threshold), 2) == 6.44\r
      assert eventIds[topOrder[:2]].tolist() == ["E-5", "E-3"]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 지진 위험 이벤트 필터링에서 \`magnitude\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 지진 위험 이벤트 필터링에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 지진 데이터 분석\r
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
        'Date': ['2026-01-01', '2026-01-03', '2026-01-05', '2026-01-07',\r
                 '2026-01-09', '2026-01-11', '2026-01-13', '2026-01-15'],\r
        'Latitude': [35.2, -6.1, 38.4, -12.7, 52.1, 19.4, -3.2, 41.7],\r
        'Longitude': [139.1, 106.8, -122.3, -77.0, -168.4, -155.2, 142.1, 29.0],\r
        'Magnitude': [4.8, 5.6, 3.2, 6.1, 7.0, 4.2, 5.9, 6.5],\r
        'Depth': [35, 12, 8, 70, 25, 18, 45, 10],\r
    })\r
    mag = data['Magnitude'].values\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      import pandas as pd\r
\r
      data = pd.DataFrame({\r
          'Date': ['2026-01-01', '2026-01-03', '2026-01-05', '2026-01-07',\r
                   '2026-01-09', '2026-01-11', '2026-01-13', '2026-01-15'],\r
          'Latitude': [35.2, -6.1, 38.4, -12.7, 52.1, 19.4, -3.2, 41.7],\r
          'Longitude': [139.1, 106.8, -122.3, -77.0, -168.4, -155.2, 142.1, 29.0],\r
          'Magnitude': [4.8, 5.6, 3.2, 6.1, 7.0, 4.2, 5.9, 6.5],\r
          'Depth': [35, 12, 8, 70, 25, 18, 45, 10],\r
      })\r
      mag = data['Magnitude'].values\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};