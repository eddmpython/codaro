var e=`meta:\r
  packages:\r
  - numpy\r
  - pandas\r
  id: numpy_06\r
  title: 심장병위험분석\r
  order: 6\r
  category: numpy\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - numpy\r
  - concatenate\r
  - vstack\r
  - any\r
  - all\r
  - sort\r
  - argsort\r
  - cumsum\r
  - 검증\r
  - 위험점수\r
  seo:\r
    title: NumPy 배열 결합과 정렬 - 심장병 위험 분석\r
    description: NumPy의 배열 결합과 정렬을 배우며 심장병 위험 요인 데이터를 분석합니다.\r
    keywords:\r
    - numpy\r
    - concatenate\r
    - sort\r
    - argsort\r
    - cumsum\r
    - 심장병\r
intro:\r
  emoji: ❤️\r
  goal: 심장병 환자 데이터로 배열 결합과 정렬을 익힙니다.\r
  description: 303명의 심장병 환자 데이터를 분석합니다. 배열 결합(concatenate)으로 데이터를 병합하고, 정렬과 누적합으로 위험 요인을 분석합니다.\r
  direction: 심장병위험분석에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.\r
  benefits:\r
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.\r
  - 심장병위험분석 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 컬럼 확인 결과 검증\r
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 심장병위험분석 재사용\r
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 배열 계산 환경\r
      detail: numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 심장병위험분석 실행\r
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.\r
    - label: 심장병위험분석 완료\r
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
  subtitle: 심장병 데이터셋\r
  goal: 2단계. 데이터 로드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: UCI(캘리포니아 대학교)에서 제공하는 유명한 심장병 데이터셋입니다. 303명의 환자 데이터가 있으며, 콜레스테롤(chol, 혈중 지방 수치), 안정 시 혈압(trestbps),\r
    최대 심박수(thalach) 등 건강 지표와 함께 심장병 유무(target, 1이면 심장병 있음)가 기록되어 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    df = loadLocalDataset("heart")\r
    df.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      df = loadLocalDataset("heart")\r
      df.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_columns\r
  title: 3단계. 컬럼 확인\r
  structuredPrimary: true\r
  subtitle: 데이터 구조\r
  goal: 3단계. 컬럼 확인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: 데이터의 컬럼을 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: df.columns.tolist()\r
  exercise:\r
    prompt: 3단계. 컬럼 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: df.columns.tolist()\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 컬럼 확인의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 3단계. 컬럼 확인 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step4_extract\r
  title: 4단계. 배열 추출\r
  structuredPrimary: true\r
  subtitle: 주요 변수\r
  goal: 4단계. 배열 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 주요 수치형 변수들을 NumPy 배열로 추출합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    age = df['age'].values\r
    chol = df['chol'].values\r
    bp = df['trestbps'].values\r
    hr = df['thalach'].values\r
    target = df['target'].values\r
    age.shape\r
  exercise:\r
    prompt: 4단계. 배열 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      age = df['age'].values\r
      chol = df['chol'].values\r
      bp = df['trestbps'].values\r
      hr = df['thalach'].values\r
      target = df['target'].values\r
      age.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 배열 추출에서 \`age\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 배열 추출 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_concat_1d\r
  title: 5단계. 1차원 배열 결합\r
  structuredPrimary: true\r
  subtitle: np.concatenate()\r
  goal: 5단계. 1차원 배열 결합에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    concatenate(연결하다)는 여러 배열을 하나로 이어붙이는 함수입니다. 기차 객차를 연결하듯이 배열들을 순서대로 붙입니다. 예를 들어 [1,2,3]과 [4,5]를 concatenate하면 [1,2,3,4,5]가 됩니다. 여러 소스의 데이터를 하나로 합칠 때 유용합니다.\r
\r
    np.concatenate([arr1, arr2])는 배열들을 순서대로 이어붙입니다. 기본적으로 axis=0(첫 번째 축)을 따라 결합합니다.\r
  snippet: |-\r
    concat = np.concatenate([age, chol])\r
    concat.shape\r
  exercise:\r
    prompt: 5단계. 1차원 배열 결합 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      concat = np.concatenate([age, chol])\r
      concat.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 1차원 배열 결합에서 \`concat\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 1차원 배열 결합 실행 뒤 \`concat\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step6_concat_2d\r
  title: 6단계. 2차원 열 결합\r
  structuredPrimary: true\r
  subtitle: axis=1\r
  goal: 6단계. 2차원 열 결합에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    여러 변수를 열로 나란히 붙여 2차원 테이블을 만듭니다. 각 1차원 배열을 reshape(-1, 1)로 열 벡터로 바꾼 뒤, axis=1(열 방향)로 결합합니다. -1은 '나머지 크기는 자동 계산해줘'라는 의미입니다. 결과적으로 303명 × 3개 변수의 테이블이 만들어집니다.\r
\r
    axis=1로 지정하면 열 방향으로 결합합니다. reshape(-1, 1)은 1D 배열을 열 벡터로 변환합니다. -1은 자동 계산을 의미합니다.\r
  snippet: |-\r
    c1 = age.reshape(-1, 1)\r
    c2 = chol.reshape(-1, 1)\r
    c3 = bp.reshape(-1, 1)\r
    features = np.concatenate([c1, c2, c3], axis=1)\r
    features.shape\r
  exercise:\r
    prompt: 6단계. 2차원 열 결합 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      c1 = age.reshape(-1, 1)\r
      c2 = chol.reshape(-1, 1)\r
      c3 = bp.reshape(-1, 1)\r
      features = np.concatenate([c1, c2, c3], axis=1)\r
      features.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 2차원 열 결합에서 \`c1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 2차원 열 결합 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step7_vstack_hstack\r
  title: 7단계. vstack과 column_stack\r
  structuredPrimary: true\r
  subtitle: 편리한 결합\r
  goal: 7단계. vstack과 columnstack에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    vstack, hstack, column_stack은 concatenate보다 직관적인 결합 함수입니다. vstack은 vertical(수직) stack으로 배열들을 위아래로 쌓고, hstack은 horizontal(수평) stack으로 좌우로 붙입니다. column_stack은 1차원 배열들을 각각 하나의 열로 만들어 옆으로 붙여줍니다.\r
\r
    np.vstack()은 수직(행)으로, np.hstack()은 수평(열)으로 쌓습니다. np.column_stack()은 1D 배열들을 열로 쌓아 2D 배열을 만듭니다.\r
  snippet: |-\r
    v = np.vstack([age, chol, bp])\r
    v.shape\r
  exercise:\r
    prompt: 7단계. vstack과 columnstack 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      v = np.vstack([age, chol, bp])\r
      v.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. vstack과 columnstack에서 \`v\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. vstack과 columnstack 실행 뒤 \`v\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step8_group_compare\r
  title: 8단계. 그룹별 비교\r
  structuredPrimary: true\r
  subtitle: 심장병 유무\r
  goal: 8단계. 그룹별 비교에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 심장병 유무(target)에 따른 평균 나이를 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    sick = target == 1\r
    well = target == 0\r
    f"심장병 있음: {np.mean(age[sick]):.1f}세, 없음: {np.mean(age[well]):.1f}세"\r
  exercise:\r
    prompt: 8단계. 그룹별 비교 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      sick = target == 1\r
      well = target == 0\r
      f"심장병 있음: {np.mean(age[sick]):.1f}세, 없음: {np.mean(age[well]):.1f}세"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 그룹별 비교에서 \`sick\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 그룹별 비교 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_any_all\r
  title: 9단계. any와 all\r
  structuredPrimary: true\r
  subtitle: 조건 검사\r
  goal: 9단계. any와 all에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    any()는 '하나라도 있으면 True', all()은 '전부 다 그래야 True'입니다. 예를 들어 np.any(chol > 240)은 콜레스테롤 240 초과인 환자가 한 명이라도 있는지 확인합니다. np.all(bp < 180)은 모든 환자의 혈압이 180 미만인지 검사합니다. 데이터 전체에 대한 조건 검증에 유용합니다.\r
\r
    np.any()는 하나라도 True면 True, np.all()은 모두 True여야 True를 반환합니다. 데이터 검증에 유용합니다.\r
  snippet: |-\r
    hi1 = chol > 240\r
    hi2 = bp > 140\r
    any1 = np.any(hi1)\r
    all1 = np.all(bp < 180)\r
    f"고콜레스테롤 환자 존재: {any1}, 모든 환자 정상 혈압(<180): {all1}"\r
  exercise:\r
    prompt: 9단계. any와 all 예제에서 \`hi1\`, \`hi2\`, \`any1\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      hi1 = chol > 240\r
      hi2 = bp > 140\r
      any1 = np.any(hi1)\r
      all1 = np.all(bp < 180)\r
      f"고콜레스테롤 환자 존재: {any1}, 모든 환자 정상 혈압(<180): {all1}"\r
    hints:\r
    - 바꿀 지점은 \`hi1 = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`hi1\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. any와 all에서 \`hi1\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. any와 all 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step10_any_axis\r
  title: 10단계. 행별 any/all\r
  structuredPrimary: true\r
  subtitle: axis=1\r
  goal: 10단계. 행별 any/all에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    각 환자별로 위험 요인이 있는지 확인합니다.\r
\r
    axis=1로 지정하면 각 행(환자)별로 any/all을 계산합니다. axis=0은 각 열(위험요인)별로 계산합니다.\r
  snippet: |-\r
    risks = np.column_stack([hi1, hi2, age > 60])\r
    any2 = np.any(risks, axis=1)\r
    all2 = np.all(risks, axis=1)\r
    f"위험요인 1개 이상: {np.sum(any2)}명, 모든 위험요인: {np.sum(all2)}명"\r
  exercise:\r
    prompt: 10단계. 행별 any/all 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      risks = np.column_stack([hi1, hi2, age > 60])\r
      any2 = np.any(risks, axis=1)\r
      all2 = np.all(risks, axis=1)\r
      f"위험요인 1개 이상: {np.sum(any2)}명, 모든 위험요인: {np.sum(all2)}명"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 행별 any/all에서 \`risks\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 행별 any/all 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step11_sort\r
  title: 11단계. 정렬\r
  structuredPrimary: true\r
  subtitle: np.sort()\r
  goal: 11단계. 정렬에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    나이순으로 데이터를 정렬합니다.\r
\r
    np.sort()는 정렬된 새 배열을 반환합니다. 원본 배열은 변경되지 않습니다.\r
  snippet: |-\r
    sorted_ = np.sort(age)\r
    sorted_[:10]\r
  exercise:\r
    prompt: 11단계. 정렬 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      sorted_ = np.sort(age)\r
      sorted_[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 정렬에서 \`sorted_\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. 정렬 실행 뒤 \`sorted_\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step12_argsort\r
  title: 12단계. 정렬 인덱스\r
  structuredPrimary: true\r
  subtitle: np.argsort()\r
  goal: 12단계. 정렬 인덱스에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    argsort로 정렬 인덱스를 얻어 다른 배열도 같이 정렬합니다.\r
\r
    np.argsort()는 정렬 후 인덱스를 반환합니다. 이 인덱스로 여러 배열을 동일한 순서로 정렬할 수 있습니다.\r
  snippet: |-\r
    order = np.argsort(age)\r
    arr1 = age[order]\r
    arr2 = chol[order]\r
    pd.DataFrame({'Age': arr1[:10], 'Cholesterol': arr2[:10]})\r
  exercise:\r
    prompt: 12단계. 정렬 인덱스 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      order = np.argsort(age)\r
      arr1 = age[order]\r
      arr2 = chol[order]\r
      pd.DataFrame({'Age': arr1[:10], 'Cholesterol': arr2[:10]})\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 정렬 인덱스의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 정렬 인덱스의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step13_top10\r
  title: 13단계. 상위 N개 추출\r
  structuredPrimary: true\r
  subtitle: 내림차순\r
  goal: 13단계. 상위 N개 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 콜레스테롤 기준 상위 10명을 찾습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    idx = np.argsort(chol)[::-1]\r
    top = idx[:10]\r
    pd.DataFrame({\r
        'Age': age[top],\r
        'Cholesterol': chol[top],\r
        'HeartDisease': target[top]\r
    })\r
  exercise:\r
    prompt: 13단계. 상위 N개 추출 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      idx = np.argsort(chol)[::-1]\r
      top = idx[:10]\r
      pd.DataFrame({\r
          'Age': age[top],\r
          'Cholesterol': chol[top],\r
          'HeartDisease': target[top]\r
      })\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 상위 N개 추출의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 13단계. 상위 N개 추출의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step14_cumsum\r
  title: 14단계. 누적합\r
  structuredPrimary: true\r
  subtitle: np.cumsum()\r
  goal: 14단계. 누적합에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    cumsum(cumulative sum, 누적합)은 배열의 값을 순서대로 더해가는 함수입니다. [1,2,3]의 cumsum은 [1, 1+2, 1+2+3] = [1, 3, 6]입니다. 나이순 정렬된 심장병 유무(1 또는 0) 데이터에 cumsum을 적용하면, 각 나이까지 심장병 환자가 몇 명인지 누적 수를 볼 수 있습니다.\r
\r
    np.cumsum()은 누적합을 계산합니다. 시계열 분석이나 누적 분포를 볼 때 유용합니다.\r
  snippet: |-\r
    t = target[order]\r
    cumsum = np.cumsum(t)\r
    cumsum[:20]\r
  exercise:\r
    prompt: 14단계. 누적합 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      t = target[order]\r
      cumsum = np.cumsum(t)\r
      cumsum[:20]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 누적합에서 \`t\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 14단계. 누적합 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step15_risk_score\r
  title: 15단계. 위험 점수 분석\r
  structuredPrimary: true\r
  subtitle: 종합 분석\r
  goal: 15단계. 위험 점수 분석에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 여러 위험 요인을 종합한 점수를 만들어 분석합니다. 불리언 배열에 .astype(int)를 적용하면 True는 1, False는 0으로 변환됩니다. 콜레스테롤\r
    > 200, 혈압 > 130, 나이 > 55 세 가지 조건을 더하면 0~3점의 위험 점수가 됩니다. 점수가 높을수록 심장병 발생률이 높아지는지 확인할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    score = (chol > 200).astype(int) + (bp > 130).astype(int) + (age > 55).astype(int)\r
    levels, counts = np.unique(score, return_counts=True)\r
    rows = []\r
    for r in levels:\r
        mask = score == r\r
        rate = np.mean(target[mask])\r
        rows.append([r, np.sum(mask), round(rate * 100, 1)])\r
    pd.DataFrame(rows, columns=['RiskScore', 'Count', 'DiseaseRate(%)'])\r
  exercise:\r
    prompt: 15단계. 위험 점수 분석 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      score = (chol > 200).astype(int) + (bp > 130).astype(int) + (age > 55).astype(int)\r
      levels, counts = np.unique(score, return_counts=True)\r
      rows = []\r
      for r in levels:\r
          mask = score == r\r
          rate = np.mean(target[mask])\r
          rows.append([r, np.sum(mask), round(rate * 100, 1)])\r
      pd.DataFrame(rows, columns=['RiskScore', 'Count', 'DiseaseRate(%)'])\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 위험 점수 분석의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 15단계. 위험 점수 분석 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 심장병 위험 점수 배치 계산'\r
  structuredPrimary: true\r
  subtitle: 조건 배열, 정렬, cumsum, 실패 케이스\r
  goal: '현업 흐름 검증: 심장병 위험 점수 배치 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    위험 점수는 조건을 많이 더하는 만큼 기준을 잘못 잡기 쉽습니다. 각 조건 배열을 분리해 예측하고, 정렬 후 누적 환자 수가 의도대로 계산되는지 검증하세요.\r
\r
    변주 실험\r
    나이 기준을 55세에서 60세로 바꾸면 위험 점수 분포와 누적 환자 수 해석이 어떻게 달라지는지 비교하세요.\r
  tips:\r
  - 변주 실험 나이 기준을 55세에서 60세로 바꾸면 위험 점수 분포와 누적 환자 수 해석이 어떻게 달라지는지 비교하세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    age = np.array([45, 62, 58, 39])\r
    chol = np.array([180, 230, 205, 190])\r
    bp = np.array([120, 145, 135, 118])\r
    disease = np.array([0, 1, 1, 0])\r
\r
    riskScore = (chol > 200).astype(int) + (bp > 130).astype(int) + (age > 55).astype(int)\r
    order = np.argsort(age)\r
    cumulativeDisease = np.cumsum(disease[order])\r
\r
    assert riskScore.tolist() == [0, 3, 3, 0]\r
    assert age[order].tolist() == [39, 45, 58, 62]\r
    assert cumulativeDisease.tolist() == [0, 0, 1, 2]\r
  exercise:\r
    prompt: '현업 흐름 검증: 심장병 위험 점수 배치 계산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import numpy as np\r
\r
      age = np.array([45, 62, 58, 39])\r
      chol = np.array([180, 230, 205, 190])\r
      bp = np.array([120, 145, 135, 118])\r
      disease = np.array([0, 1, 1, 0])\r
\r
      riskScore = (chol > 200).astype(int) + (bp > 130).astype(int) + (age > 55).astype(int)\r
      order = np.argsort(age)\r
      cumulativeDisease = np.cumsum(disease[order])\r
\r
      assert riskScore.tolist() == [0, 3, 3, 0]\r
      assert age[order].tolist() == [39, 45, 58, 62]\r
      assert cumulativeDisease.tolist() == [0, 0, 1, 2]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 심장병 위험 점수 배치 계산의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 심장병 위험 점수 배치 계산의 match/search/sub 결과가 바꾼 패턴이나 샘플 문자열 기준과 맞아야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 심장병 위험 분석\r
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
    heartIdx = np.arange(303)\r
    data = pd.DataFrame({\r
        'age': 35 + (heartIdx * 3) % 38,\r
        'trestbps': 112 + (heartIdx * 5) % 48,\r
        'chol': 165 + (heartIdx * 7) % 155,\r
        'thalach': 178 - (heartIdx * 4) % 58,\r
    })\r
    data['target'] = (\r
        (data['chol'] > 225).astype(int)\r
        + (data['trestbps'] > 135).astype(int)\r
        + (data['age'] > 56).astype(int)\r
        >= 2\r
    ).astype(int)\r
    age = data['age'].values\r
    hr = data['thalach'].values\r
    target = data['target'].values\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      import pandas as pd\r
\r
      heartIdx = np.arange(303)\r
      data = pd.DataFrame({\r
          'age': 35 + (heartIdx * 3) % 38,\r
          'trestbps': 112 + (heartIdx * 5) % 48,\r
          'chol': 165 + (heartIdx * 7) % 155,\r
          'thalach': 178 - (heartIdx * 4) % 58,\r
      })\r
      data['target'] = (\r
          (data['chol'] > 225).astype(int)\r
          + (data['trestbps'] > 135).astype(int)\r
          + (data['age'] > 56).astype(int)\r
          >= 2\r
      ).astype(int)\r
      age = data['age'].values\r
      hr = data['thalach'].values\r
      target = data['target'].values\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};