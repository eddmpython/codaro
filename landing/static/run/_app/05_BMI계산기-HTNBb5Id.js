var e=`meta:\r
  packages:\r
  - numpy\r
  - pandas\r
  id: numpy_05\r
  title: BMI계산기\r
  order: 5\r
  category: numpy\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - numpy\r
  - broadcasting\r
  - vectorization\r
  - where\r
  - digitize\r
  - 검증\r
  - 벡터화\r
  seo:\r
    title: NumPy 브로드캐스팅 - BMI 계산기\r
    description: NumPy의 브로드캐스팅과 벡터 연산을 배우며 160명의 키/몸무게 데이터로 BMI를 계산합니다.\r
    keywords:\r
    - numpy\r
    - 브로드캐스팅\r
    - 벡터화\r
    - BMI\r
    - broadcasting\r
intro:\r
  emoji: ⚖️\r
  goal: 160명의 키/몸무게 데이터로 BMI를 계산합니다.\r
  description: 브로드캐스팅을 활용한 벡터 연산으로 반복문 없이 대량의 데이터를 빠르게 처리하는 방법을 배웁니다.\r
  direction: BMI계산기에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.\r
  benefits:\r
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.\r
  - BMI계산기 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 데이터 구조 확인 결과 검증\r
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.\r
    - label: BMI계산기 재사용\r
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 배열 계산 환경\r
      detail: numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: BMI계산기 실행\r
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.\r
    - label: BMI계산기 완료\r
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
  subtitle: 키/몸무게 데이터\r
  goal: 2단계. 데이터 로드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 160명의 키와 몸무게 데이터를 로드합니다. 데이터가 미국 단위로 되어 있어서 키는 인치(inch, 1인치=2.54cm), 몸무게는 파운드(pound,\r
    1파운드=0.45kg)입니다. 나중에 우리가 익숙한 미터와 킬로그램으로 변환할 예정입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    df = loadLocalDataset("weight_height")\r
    df.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      df = loadLocalDataset("weight_height")\r
      df.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_shape\r
  title: 3단계. 데이터 구조 확인\r
  structuredPrimary: true\r
  subtitle: shape\r
  goal: 3단계. 데이터 구조 확인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: 데이터의 크기를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: df.shape\r
  exercise:\r
    prompt: 3단계. 데이터 구조 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: df.shape\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 데이터 구조 확인의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 3단계. 데이터 구조 확인 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step4_extract\r
  title: 4단계. 배열 추출\r
  structuredPrimary: true\r
  subtitle: Height, Weight\r
  goal: 4단계. 배열 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 키(인치)와 몸무게(파운드) 데이터를 NumPy 배열로 추출합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    inch = df['Height'].values\r
    lbs = df['Weight'].values\r
    inch[:10]\r
  exercise:\r
    prompt: 4단계. 배열 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      inch = df['Height'].values\r
      lbs = df['Weight'].values\r
      inch[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 배열 추출에서 \`inch\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 배열 추출 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_convert_height\r
  title: 5단계. 키 단위 변환\r
  structuredPrimary: true\r
  subtitle: 인치 → 미터\r
  goal: 5단계. 키 단위 변환에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    브로드캐스팅(Broadcasting)은 NumPy의 핵심 기능입니다. 배열에 하나의 숫자(스칼라)를 곱하면, NumPy가 자동으로 배열의 모든 요소에 그 연산을 적용합니다. inch * 0.0254 한 줄로 160개 값 모두가 인치에서 미터로 변환됩니다. for문을 쓸 필요가 없습니다.\r
\r
    NumPy 배열에 스칼라 값을 곱하면 모든 요소에 자동으로 연산이 적용됩니다. 이것이 브로드캐스팅의 가장 기본적인 형태입니다.\r
  snippet: |-\r
    meter = inch * 0.0254\r
    meter[:10]\r
  exercise:\r
    prompt: 5단계. 키 단위 변환 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      meter = inch * 0.0254\r
      meter[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 키 단위 변환에서 \`meter\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 키 단위 변환 실행 뒤 \`meter\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step6_convert_weight\r
  title: 6단계. 몸무게 단위 변환\r
  structuredPrimary: true\r
  subtitle: 파운드 → 킬로그램\r
  goal: 6단계. 몸무게 단위 변환에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 몸무게를 파운드에서 킬로그램으로 변환합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    kg = lbs * 0.453592\r
    kg[:10]\r
  exercise:\r
    prompt: 6단계. 몸무게 단위 변환 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      kg = lbs * 0.453592\r
      kg[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 몸무게 단위 변환에서 \`kg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 몸무게 단위 변환 실행 뒤 \`kg\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step7_bmi\r
  title: 7단계. BMI 계산\r
  structuredPrimary: true\r
  subtitle: 벡터 연산\r
  goal: 7단계. BMI 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    BMI(Body Mass Index, 체질량지수)는 비만도를 측정하는 지표입니다. 공식은 체중(kg) ÷ 키(m)²입니다. NumPy에서는 배열끼리의 연산도 요소별로 자동 적용됩니다. kg 배열과 meter 배열의 같은 위치 값들끼리 계산되어 160명의 BMI가 한 번에 계산됩니다. 이를 벡터 연산(vectorization)이라 합니다.\r
\r
    배열 간 연산도 요소별로 자동 적용됩니다. kg / meter ** 2는 각 사람의 BMI를 한 번에 계산합니다.\r
  snippet: |-\r
    bmi = kg / (meter ** 2)\r
    bmi[:10]\r
  exercise:\r
    prompt: 7단계. BMI 계산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      bmi = kg / (meter ** 2)\r
      bmi[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. BMI 계산에서 \`bmi\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. BMI 계산 실행 뒤 \`bmi\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step8_stats\r
  title: 8단계. BMI 통계\r
  structuredPrimary: true\r
  subtitle: 기본 통계량\r
  goal: 8단계. BMI 통계에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: BMI의 평균, 최소, 최대, 표준편차를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: 'f"평균: {np.mean(bmi):.2f}, 최소: {np.min(bmi):.2f}, 최대: {np.max(bmi):.2f}, 표준편차: {np.std(bmi):.2f}"'\r
  exercise:\r
    prompt: 8단계. BMI 통계 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: 'f"평균: {np.mean(bmi):.2f}, 최소: {np.min(bmi):.2f}, 최대: {np.max(bmi):.2f}, 표준편차: {np.std(bmi):.2f}"'\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. BMI 통계의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 8단계. BMI 통계 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step9_category\r
  title: 9단계. BMI 분류\r
  structuredPrimary: true\r
  subtitle: 중첩 where\r
  goal: 9단계. BMI 분류에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 세계보건기구(WHO) 기준으로 BMI를 분류합니다. 18.5 미만은 저체중(Underweight), 18.5~25는 정상(Normal), 25~30은 과체중(Overweight),\r
    30 이상은 비만(Obese)입니다. np.where를 중첩하면 4개 이상의 카테고리로 분류할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    category = np.where(bmi < 18.5, 'Underweight',\r
               np.where(bmi < 25, 'Normal',\r
               np.where(bmi < 30, 'Overweight', 'Obese')))\r
    category[:10]\r
  exercise:\r
    prompt: 9단계. BMI 분류 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      category = np.where(bmi < 18.5, 'Underweight',\r
                 np.where(bmi < 25, 'Normal',\r
                 np.where(bmi < 30, 'Overweight', 'Obese')))\r
      category[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. BMI 분류에서 \`category\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. BMI 분류 실행 뒤 \`category\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step10_count\r
  title: 10단계. 카테고리별 집계\r
  structuredPrimary: true\r
  subtitle: np.unique()\r
  goal: 10단계. 카테고리별 집계에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 각 카테고리별 인원수와 비율을 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    labels, counts = np.unique(category, return_counts=True)\r
    pd.DataFrame({'Category': labels, 'Count': counts, 'Ratio': np.round(counts / len(bmi) * 100, 1)})\r
  exercise:\r
    prompt: 10단계. 카테고리별 집계 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      labels, counts = np.unique(category, return_counts=True)\r
      pd.DataFrame({'Category': labels, 'Count': counts, 'Ratio': np.round(counts / len(bmi) * 100, 1)})\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 카테고리별 집계의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 10단계. 카테고리별 집계 실행 결과가 shape와 수치 결과 기준으로 바꾼 열 이름이나 행 값을 반영해야 합니다.\r
- id: step11_gender\r
  title: 11단계. 성별 데이터 추출\r
  structuredPrimary: true\r
  subtitle: Gender\r
  goal: 11단계. 성별 데이터 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 성별 데이터를 추출하여 남녀별 분석을 준비합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    sex = df['Gender'].values\r
    sex[:10]\r
  exercise:\r
    prompt: 11단계. 성별 데이터 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      sex = df['Gender'].values\r
      sex[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 성별 데이터 추출에서 \`sex\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. 성별 데이터 추출 실행 뒤 \`sex\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step12_gender_bmi\r
  title: 12단계. 성별 BMI 비교\r
  structuredPrimary: true\r
  subtitle: 불리언 마스크\r
  goal: 12단계. 성별 BMI 비교에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 불리언 마스크를 활용해 남녀 데이터를 분리합니다. sex == 'Male'은 남성이면 True, 아니면 False인 배열을 만듭니다. 이 True/False\r
    배열로 bmi[male]처럼 인덱싱하면 남성의 BMI만 추출됩니다. 성별에 따른 BMI 차이를 쉽게 비교할 수 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    male = sex == 'Male'\r
    female = sex == 'Female'\r
    m = bmi[male]\r
    f_ = bmi[female]\r
    f"남성 평균 BMI: {np.mean(m):.2f}, 여성 평균 BMI: {np.mean(f_):.2f}"\r
  exercise:\r
    prompt: 12단계. 성별 BMI 비교 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      male = sex == 'Male'\r
      female = sex == 'Female'\r
      m = bmi[male]\r
      f_ = bmi[female]\r
      f"남성 평균 BMI: {np.mean(m):.2f}, 여성 평균 BMI: {np.mean(f_):.2f}"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 성별 BMI 비교에서 \`male\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 12단계. 성별 BMI 비교 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step13_gender_stats\r
  title: 13단계. 성별 종합 통계\r
  structuredPrimary: true\r
  subtitle: DataFrame 정리\r
  goal: 13단계. 성별 종합 통계에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 성별에 따른 키, 몸무게, BMI 차이를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pd.DataFrame({\r
        'Gender': ['Male', 'Female'],\r
        'Height(cm)': [np.mean(meter[male]) * 100, np.mean(meter[female]) * 100],\r
        'Weight(kg)': [np.mean(kg[male]), np.mean(kg[female])],\r
        'BMI': [np.mean(m), np.mean(f_)]\r
    }).round(2)\r
  exercise:\r
    prompt: 13단계. 성별 종합 통계 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      pd.DataFrame({\r
          'Gender': ['Male', 'Female'],\r
          'Height(cm)': [np.mean(meter[male]) * 100, np.mean(meter[female]) * 100],\r
          'Weight(kg)': [np.mean(kg[male]), np.mean(kg[female])],\r
          'BMI': [np.mean(m), np.mean(f_)]\r
      }).round(2)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 성별 종합 통계의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 13단계. 성별 종합 통계 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step14_digitize\r
  title: 14단계. 키 구간화\r
  structuredPrimary: true\r
  subtitle: np.digitize()\r
  goal: 14단계. 키 구간화에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.digitize()는 연속적인 숫자 데이터를 구간(bin)으로 나눕니다. 예를 들어 bins=[150, 155, 160]이면 150 미만은 0, 150~155는 1, 155~160은 2, 160 이상은 3으로 분류됩니다. 키 데이터를 5cm 단위로 그룹화하면 구간별 분석이 가능해집니다.\r
\r
    np.digitize(arr, bins)는 배열의 각 값이 bins의 어느 구간에 속하는지 인덱스로 반환합니다. 데이터를 구간별로 그룹화할 때 유용합니다.\r
  snippet: |-\r
    cm = meter * 100\r
    bins = np.arange(150, 200, 5)\r
    groups = np.digitize(cm, bins)\r
    np.unique(groups)\r
  exercise:\r
    prompt: 14단계. 키 구간화 예제에서 \`cm\`, \`bins\`, \`groups\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      cm = meter * 100\r
      bins = np.arange(150, 200, 5)\r
      groups = np.digitize(cm, bins)\r
      np.unique(groups)\r
    hints:\r
    - 바꿀 지점은 \`cm = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`cm\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 키 구간화에서 \`cm\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 14단계. 키 구간화 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step15_ideal_weight\r
  title: 15단계. 이상적 체중 범위\r
  structuredPrimary: true\r
  subtitle: BMI 18.5~25\r
  goal: 15단계. 이상적 체중 범위에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 각 사람의 이상적인 체중 범위를 계산합니다. BMI 18.5~25 기준입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    lo = 18.5 * (meter ** 2)\r
    hi = 25 * (meter ** 2)\r
    ideal = (kg >= lo) & (kg <= hi)\r
    f"정상 체중 비율: {np.mean(ideal) * 100:.1f}%"\r
  exercise:\r
    prompt: 15단계. 이상적 체중 범위 예제에서 \`lo\`, \`hi\`, \`ideal\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      lo = 18.5 * (meter ** 2)\r
      hi = 25 * (meter ** 2)\r
      ideal = (kg >= lo) & (kg <= hi)\r
      f"정상 체중 비율: {np.mean(ideal) * 100:.1f}%"\r
    hints:\r
    - 바꿀 지점은 \`lo = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`lo\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 이상적 체중 범위에서 \`lo\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 15단계. 이상적 체중 범위 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 건강검진 BMI 벡터화'\r
  structuredPrimary: true\r
  subtitle: 브로드캐스팅, where, digitize, 실패 케이스\r
  goal: '현업 흐름 검증: 건강검진 BMI 벡터화에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    BMI 계산은 한 명씩 반복문으로 처리하기보다 배열 단위로 검증하는 연습에 좋습니다. 키와 몸무게 배열 shape을 맞추고, 분류 기준이 기대대로 적용되는지 확인하세요.\r
\r
    변주 실험\r
    아시아 기준 BMI 구간과 WHO 기준 BMI 구간을 각각 \`bins\`로 만들어 같은 사람들의 분류가 어떻게 달라지는지 비교하세요.\r
  tips:\r
  - 변주 실험 아시아 기준 BMI 구간과 WHO 기준 BMI 구간을 각각 \`bins\`로 만들어 같은 사람들의 분류가 어떻게 달라지는지 비교하세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    weights = np.array([60.0, 82.0, 95.0])\r
    heights = np.array([1.70, 1.75, 1.80])\r
\r
    bmi = weights / (heights ** 2)\r
    labels = np.where(bmi >= 25, "review", "normal")\r
    groups = np.digitize(bmi, bins=[18.5, 23.0, 25.0, 30.0])\r
\r
    assert np.allclose(np.round(bmi, 1), [20.8, 26.8, 29.3])\r
    assert labels.tolist() == ["normal", "review", "review"]\r
    assert groups.tolist() == [1, 3, 3]\r
  exercise:\r
    prompt: '현업 흐름 검증: 건강검진 BMI 벡터화 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import numpy as np\r
\r
      weights = np.array([60.0, 82.0, 95.0])\r
      heights = np.array([1.70, 1.75, 1.80])\r
\r
      bmi = weights / (heights ** 2)\r
      labels = np.where(bmi >= 25, "review", "normal")\r
      groups = np.digitize(bmi, bins=[18.5, 23.0, 25.0, 30.0])\r
\r
      assert np.allclose(np.round(bmi, 1), [20.8, 26.8, 29.3])\r
      assert labels.tolist() == ["normal", "review", "review"]\r
      assert groups.tolist() == [1, 3, 3]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 건강검진 BMI 벡터화에서 \`weights\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 건강검진 BMI 벡터화에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: BMI 분석\r
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
        'Gender': ['Male', 'Female', 'Male', 'Female', 'Male',\r
                   'Female', 'Male', 'Female', 'Male', 'Female'],\r
        'Height': [70.0, 64.0, 68.5, 62.0, 72.0, 66.5, 69.0, 63.5, 74.0, 61.5],\r
        'Weight': [180.0, 135.0, 165.0, 120.0, 210.0, 150.0, 175.0, 128.0, 230.0, 112.0],\r
    })\r
    height = data['Height'].values * 0.0254\r
    weight = data['Weight'].values * 0.453592\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      import pandas as pd\r
\r
      data = pd.DataFrame({\r
          'Gender': ['Male', 'Female', 'Male', 'Female', 'Male',\r
                     'Female', 'Male', 'Female', 'Male', 'Female'],\r
          'Height': [70.0, 64.0, 68.5, 62.0, 72.0, 66.5, 69.0, 63.5, 74.0, 61.5],\r
          'Weight': [180.0, 135.0, 165.0, 120.0, 210.0, 150.0, 175.0, 128.0, 230.0, 112.0],\r
      })\r
      height = data['Height'].values * 0.0254\r
      weight = data['Weight'].values * 0.453592\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};