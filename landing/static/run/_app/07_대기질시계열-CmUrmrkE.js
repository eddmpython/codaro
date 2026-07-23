var e=`meta:\r
  packages:\r
  - numpy\r
  - pandas\r
  id: numpy_07\r
  title: 대기질시계열\r
  order: 7\r
  category: numpy\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - numpy\r
  - nan\r
  - isnan\r
  - nanmean\r
  - nanstd\r
  - zeros\r
  - flatten\r
  - 검증\r
  - 결측시계열\r
  seo:\r
    title: NumPy 결측값 처리 - 대기질 시계열 분석\r
    description: NumPy의 결측값 처리와 시계열 분석을 배우며 대기질 데이터의 추세를 파악합니다.\r
    keywords:\r
    - numpy\r
    - 결측값\r
    - nan\r
    - nanmean\r
    - 대기질\r
    - 시계열\r
intro:\r
  emoji: 🌫️\r
  goal: 대기질 데이터로 결측값 처리와 시계열 분석을 익힙니다.\r
  description: 뉴욕시의 대기질 데이터를 분석합니다. 실제 데이터에는 결측값(NaN)이 많으며, 이를 적절히 처리하면서 시계열 추세를 분석합니다.\r
  direction: 대기질시계열에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.\r
  benefits:\r
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.\r
  - 대기질시계열 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 배열 추출 결과 검증\r
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 대기질시계열 재사용\r
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 배열 계산 환경\r
      detail: numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 대기질시계열 실행\r
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.\r
    - label: 대기질시계열 완료\r
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
  subtitle: 대기질 데이터셋\r
  goal: 2단계. 데이터 로드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: R 프로그래밍 언어에서 유명한 airquality 데이터셋입니다. 1973년 5~9월 뉴욕시의 일일 대기질 측정값으로, Ozone(오존 농도, ppb), Solar.R(태양\r
    복사량), Wind(풍속), Temp(기온, 화씨) 등이 기록되어 있습니다. 실제 측정 데이터라 결측값(측정 실패)이 포함되어 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    df = loadLocalDataset("airquality")\r
    df.head(10)\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      df = loadLocalDataset("airquality")\r
      df.head(10)\r
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
  subtitle: Ozone\r
  goal: 3단계. 배열 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 오존 농도 데이터를 NumPy 배열로 추출합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    ozone = df['Ozone'].values\r
    ozone[:20]\r
  exercise:\r
    prompt: 3단계. 배열 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      ozone = df['Ozone'].values\r
      ozone[:20]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 배열 추출에서 \`ozone\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 배열 추출 실행 뒤 \`ozone\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step4_isnan\r
  title: 4단계. 결측값 확인\r
  structuredPrimary: true\r
  subtitle: np.isnan()\r
  goal: 4단계. 결측값 확인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    NaN(Not a Number)은 '숫자가 아님'이라는 뜻으로, 결측값을 나타냅니다. 측정 장비 고장, 데이터 입력 누락 등으로 발생합니다. np.isnan()은 각 값이 NaN인지 확인해서 True/False 배열을 반환합니다. 실제 데이터 분석에서는 결측값 처리가 매우 중요합니다.\r
\r
    np.isnan()은 NaN(Not a Number) 여부를 불리언 배열로 반환합니다. NaN은 결측값을 나타내는 특수한 부동소수점 값입니다.\r
  snippet: |-\r
    mask = np.isnan(ozone)\r
    mask[:20]\r
  exercise:\r
    prompt: 4단계. 결측값 확인 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      mask = np.isnan(ozone)\r
      mask[:20]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 결측값 확인에서 \`mask\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 결측값 확인 실행 뒤 \`mask\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step5_nan_count\r
  title: 5단계. 결측값 개수\r
  structuredPrimary: true\r
  subtitle: 비율 계산\r
  goal: 5단계. 결측값 개수에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 결측값의 개수와 비율을 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    n = np.sum(mask)\r
    ratio = n / len(ozone) * 100\r
    f"결측값: {n}개 ({ratio:.1f}%)"\r
  exercise:\r
    prompt: 5단계. 결측값 개수 예제에서 \`n\`, \`ratio\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      n = np.sum(mask)\r
      ratio = n / len(ozone) * 100\r
      f"결측값: {n}개 ({ratio:.1f}%)"\r
    hints:\r
    - 바꿀 지점은 \`n = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`n\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 결측값 개수에서 \`n\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 결측값 개수 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step6_mean_nan\r
  title: 6단계. 일반 mean의 문제\r
  structuredPrimary: true\r
  subtitle: NaN 전파\r
  goal: 6단계. 일반 mean의 문제에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: NaN은 '전파(propagation)'되는 특성이 있습니다. 어떤 숫자와 NaN을 연산하면 결과도 NaN이 됩니다. 1 + NaN = NaN, NaN ×\r
    5 = NaN 입니다. 따라서 배열에 NaN이 하나라도 있으면 np.mean()의 결과도 NaN이 되어버립니다. 이 문제를 해결하려면 NaN을 무시하는 특별한 함수가 필요합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    avg = np.mean(ozone)\r
    f"일반 mean: {avg}"\r
  exercise:\r
    prompt: 6단계. 일반 mean의 문제 예제에서 \`avg\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      avg = np.mean(ozone)\r
      f"일반 mean: {avg}"\r
    hints:\r
    - 바꿀 지점은 \`avg = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`avg\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 일반 mean의 문제에서 \`avg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 일반 mean의 문제 실행 뒤 \`avg\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step7_nanmean\r
  title: 7단계. nanmean\r
  structuredPrimary: true\r
  subtitle: NaN 무시 평균\r
  goal: 7단계. nanmean에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.nanmean()은 NaN 값을 건너뛰고 유효한 값들만으로 평균을 계산합니다. nan이 붙은 함수들(nansum, nanstd, nanmax, nanmin 등)은 모두 NaN을 무시합니다. 결측값이 있는 실제 데이터를 다룰 때 필수적인 함수들입니다.\r
\r
    np.nanmean(), np.nansum(), np.nanstd(), np.nanmax(), np.nanmin() 등은 NaN을 무시하고 계산합니다. 결측값이 있는 데이터에서 필수적입니다.\r
  tips:\r
  - np.nanmean(), np.nansum(), np.nanstd(), np.nanmax(), np.nanmin() 등은 NaN을 무시하고 계산합니다. 결측값이 있는 데이터에서\r
    필수적입니다.\r
  snippet: |-\r
    clean = np.nanmean(ozone)\r
    f"nanmean: {clean:.2f}"\r
  exercise:\r
    prompt: 7단계. nanmean 예제에서 \`clean\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      clean = np.nanmean(ozone)\r
      f"nanmean: {clean:.2f}"\r
    hints:\r
    - 바꿀 지점은 \`clean = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`clean\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. nanmean에서 \`clean\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. nanmean 실행 뒤 \`clean\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step8_nan_funcs\r
  title: 8단계. NaN-safe 함수들\r
  structuredPrimary: true\r
  subtitle: 비교\r
  goal: 8단계. NaNsafe 함수들에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 다른 nan 통계 함수들도 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    pd.DataFrame({\r
        'Statistic': ['Sum', 'Mean', 'Std', 'Max', 'Min'],\r
        'Normal': [np.sum(ozone), np.mean(ozone), np.std(ozone), np.max(ozone), np.min(ozone)],\r
        'NaN-safe': [np.nansum(ozone), np.nanmean(ozone), np.nanstd(ozone), np.nanmax(ozone), np.nanmin(ozone)]\r
    }).round(2)\r
  exercise:\r
    prompt: 8단계. NaNsafe 함수들 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      pd.DataFrame({\r
          'Statistic': ['Sum', 'Mean', 'Std', 'Max', 'Min'],\r
          'Normal': [np.sum(ozone), np.mean(ozone), np.std(ozone), np.max(ozone), np.min(ozone)],\r
          'NaN-safe': [np.nansum(ozone), np.nanmean(ozone), np.nanstd(ozone), np.nanmax(ozone), np.nanmin(ozone)]\r
      }).round(2)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. NaNsafe 함수들의 시퀀스 접근이 IndexError 없이 실행되어야 합니다.\r
    resultCheck: 8단계. NaNsafe 함수들 결과가 바꾼 리스트 값이나 인덱스 기준으로 달라져야 합니다.\r
- id: step9_where_fill\r
  title: 9단계. 결측값 대체\r
  structuredPrimary: true\r
  subtitle: np.where()\r
  goal: 9단계. 결측값 대체에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    결측값을 다른 값으로 대체하는 것을 '대체(imputation)'라고 합니다. 가장 간단한 방법은 0으로 대체하는 것입니다. np.where(조건, 참일때 값, 거짓일때 값)을 사용해서 NaN이면 0을, 아니면 원래 값을 선택합니다. 단, 0으로 대체하면 평균이 왜곡될 수 있어서 주의가 필요합니다.\r
\r
    np.where(condition, x, y)로 조건에 따라 값을 선택할 수 있습니다. 여기서는 NaN을 0으로 대체했습니다.\r
  snippet: |-\r
    filled = np.where(np.isnan(ozone), 0, ozone)\r
    filled[:20]\r
  exercise:\r
    prompt: 9단계. 결측값 대체 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      filled = np.where(np.isnan(ozone), 0, ozone)\r
      filled[:20]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 결측값 대체에서 \`filled\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 결측값 대체 실행 뒤 \`filled\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step10_mean_fill\r
  title: 10단계. 평균값 대체\r
  structuredPrimary: true\r
  subtitle: 결측값 보간\r
  goal: 10단계. 평균값 대체에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 더 나은 대체 방법은 평균값으로 대체하는 것입니다. 먼저 nanmean으로 NaN을 제외한 평균을 구한 뒤, 그 값으로 NaN을 대체합니다. 이렇게 하면 전체\r
    평균이 크게 왜곡되지 않습니다. 단, 이 방법은 데이터의 변동성(표준편차)을 줄이는 부작용이 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    mu = np.nanmean(ozone)\r
    imputed = np.where(np.isnan(ozone), mu, ozone)\r
    f"원본 평균: {np.nanmean(ozone):.2f}, 대체 후 평균: {np.mean(imputed):.2f}"\r
  exercise:\r
    prompt: 10단계. 평균값 대체 예제에서 \`mu\`, \`imputed\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      mu = np.nanmean(ozone)\r
      imputed = np.where(np.isnan(ozone), mu, ozone)\r
      f"원본 평균: {np.nanmean(ozone):.2f}, 대체 후 평균: {np.mean(imputed):.2f}"\r
    hints:\r
    - 바꿀 지점은 \`mu = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`mu\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 평균값 대체에서 \`mu\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 평균값 대체 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step11_zeros\r
  title: 11단계. zeros로 배열 생성\r
  structuredPrimary: true\r
  subtitle: 유효 데이터만\r
  goal: 11단계. zeros로 배열 생성에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.zeros(크기)는 지정한 크기만큼 0으로 채워진 배열을 생성합니다. 대체 대신 NaN을 제거하고 유효한 데이터만 남기는 방법도 있습니다. ~mask는 mask의 반대(NaN이 아닌 위치)이므로, ozone[~mask]로 유효한 값들만 추출할 수 있습니다.\r
\r
    np.zeros(shape)는 0으로 채워진 배열을 생성합니다. ~(틸다)는 불리언 배열을 반전시켜 NaN이 아닌 위치를 선택합니다.\r
  snippet: |-\r
    count = np.sum(~mask)\r
    valid = np.zeros(count)\r
    valid[:] = ozone[~mask]\r
    valid[:10]\r
  exercise:\r
    prompt: 11단계. zeros로 배열 생성 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      count = np.sum(~mask)\r
      valid = np.zeros(count)\r
      valid[:] = ozone[~mask]\r
      valid[:10]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. zeros로 배열 생성에서 \`count\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. zeros로 배열 생성 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step12_isinf\r
  title: 12단계. 무한대 검사\r
  structuredPrimary: true\r
  subtitle: np.isinf(), np.isfinite()\r
  goal: 12단계. 무한대 검사에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    NaN 외에 무한대(infinity)도 특수한 값입니다. 0으로 나누기 등의 연산에서 발생할 수 있습니다. np.isinf()는 무한대(inf, -inf) 여부를 확인하고, np.isfinite()는 값이 '유한한 숫자'인지(NaN도 아니고 무한대도 아닌) 확인합니다. 데이터 품질 검증에 유용합니다.\r
\r
    np.isinf()는 무한대(inf, -inf) 여부를, np.isfinite()는 유한한 숫자인지(NaN과 inf가 아닌)를 검사합니다.\r
  snippet: |-\r
    solar = df['Solar.R'].values\r
    inf = np.any(np.isinf(solar[~np.isnan(solar)]))\r
    finite = np.isfinite(solar)\r
    f"무한대 존재: {inf}, 유한값 개수: {np.sum(finite)}"\r
  exercise:\r
    prompt: 12단계. 무한대 검사 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      solar = df['Solar.R'].values\r
      inf = np.any(np.isinf(solar[~np.isnan(solar)]))\r
      finite = np.isfinite(solar)\r
      f"무한대 존재: {inf}, 유한값 개수: {np.sum(finite)}"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 무한대 검사에서 \`solar\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 12단계. 무한대 검사 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step13_monthly\r
  title: 13단계. 월별 평균\r
  structuredPrimary: true\r
  subtitle: flatten\r
  goal: 13단계. 월별 평균에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    월별 오존 평균을 계산합니다.\r
\r
    flatten()은 다차원 배열을 1차원으로 평탄화합니다. 복잡한 구조의 결과를 단순하게 만들 때 유용합니다.\r
  snippet: |-\r
    month = df['Month'].values\r
    months = np.unique(month)\r
    avgs = []\r
    for m in months:\r
        sub = month == m\r
        vals = ozone[sub]\r
        avgs.append(np.nanmean(vals))\r
    arr = np.array(avgs)\r
    arr\r
  exercise:\r
    prompt: 13단계. 월별 평균 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      month = df['Month'].values\r
      months = np.unique(month)\r
      avgs = []\r
      for m in months:\r
          sub = month == m\r
          vals = ozone[sub]\r
          avgs.append(np.nanmean(vals))\r
      arr = np.array(avgs)\r
      arr\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 월별 평균의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 13단계. 월별 평균 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step14_cumsum\r
  title: 14단계. 누적 추세\r
  structuredPrimary: true\r
  subtitle: 시계열 분석\r
  goal: 14단계. 누적 추세에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 일별 오존 누적합으로 추세를 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    zero = np.where(np.isnan(ozone), 0, ozone)\r
    cumsum = np.cumsum(zero)\r
    cumsum[-10:]\r
  exercise:\r
    prompt: 14단계. 누적 추세 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      zero = np.where(np.isnan(ozone), 0, ozone)\r
      cumsum = np.cumsum(zero)\r
      cumsum[-10:]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 누적 추세에서 \`zero\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 14단계. 누적 추세 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step15_correlation\r
  title: 15단계. 상관관계\r
  structuredPrimary: true\r
  subtitle: 기온과 오존\r
  goal: 15단계. 상관관계에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 15단계. 상관관계의 핵심 흐름을 예제 코드로 확인하고, 같은 구조를 직접 실행해 결과를 검증한다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    temp = df['Temp'].values\r
    both = ~np.isnan(ozone) & ~np.isnan(temp)\r
    o = ozone[both]\r
    t = temp[both]\r
    r = np.corrcoef(o, t)[0, 1]\r
    f"오존-기온 상관계수: {r:.3f}"\r
  exercise:\r
    prompt: 15단계. 상관관계 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      temp = df['Temp'].values\r
      both = ~np.isnan(ozone) & ~np.isnan(temp)\r
      o = ozone[both]\r
      t = temp[both]\r
      r = np.corrcoef(o, t)[0, 1]\r
      f"오존-기온 상관계수: {r:.3f}"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 상관관계에서 \`temp\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 15단계. 상관관계 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 대기질 결측값과 경보일 계산'\r
  structuredPrimary: true\r
  subtitle: isnan, nanmean, where, corrcoef, 실패 케이스\r
  goal: '현업 흐름 검증: 대기질 결측값과 경보일 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    환경 데이터는 결측값을 어떻게 처리했는지가 분석 결과를 좌우합니다. NaN을 유지한 평균, 대체한 누적합, 유효한 날짜만 쓰는 상관관계를 구분해 검증하세요.\r
\r
    변주 실험\r
    결측을 평균으로 채우는 대신 직전 유효값으로 채우면 누적 오존 추세가 어떻게 달라지는지 비교하세요.\r
  tips:\r
  - 변주 실험 결측을 평균으로 채우는 대신 직전 유효값으로 채우면 누적 오존 추세가 어떻게 달라지는지 비교하세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    ozone = np.array([41.0, np.nan, 80.0, 120.0, 55.0])\r
    temp = np.array([67.0, 72.0, 79.0, 85.0, 70.0])\r
\r
    valid = ~np.isnan(ozone)\r
    filled = np.where(valid, ozone, np.nanmean(ozone))\r
    alertDays = ozone >= 80\r
    corr = np.corrcoef(ozone[valid], temp[valid])[0, 1]\r
\r
    assert round(float(np.nanmean(ozone)), 2) == 74.0\r
    assert filled[1] == 74.0\r
    assert alertDays.tolist() == [False, False, True, True, False]\r
    assert corr > 0.9\r
  exercise:\r
    prompt: '현업 흐름 검증: 대기질 결측값과 경보일 계산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import numpy as np\r
\r
      ozone = np.array([41.0, np.nan, 80.0, 120.0, 55.0])\r
      temp = np.array([67.0, 72.0, 79.0, 85.0, 70.0])\r
\r
      valid = ~np.isnan(ozone)\r
      filled = np.where(valid, ozone, np.nanmean(ozone))\r
      alertDays = ozone >= 80\r
      corr = np.corrcoef(ozone[valid], temp[valid])[0, 1]\r
\r
      assert round(float(np.nanmean(ozone)), 2) == 74.0\r
      assert filled[1] == 74.0\r
      assert alertDays.tolist() == [False, False, True, True, False]\r
      assert corr > 0.9\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 대기질 결측값과 경보일 계산에서 \`ozone\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 대기질 결측값과 경보일 계산에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 대기질 데이터 분석\r
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
        'Ozone': [41, 36, 12, np.nan, 18, 28, np.nan, 23, 45, 60, 32, 29],\r
        'Solar.R': [190, 118, 149, 313, np.nan, 299, 99, 19, 256, 290, 274, 65],\r
        'Wind': [7.4, 8.0, 12.6, 11.5, 14.3, 8.6, 13.8, 20.1, 9.7, 6.9, 10.9, 13.2],\r
        'Temp': [67, 72, 74, 62, 65, 79, 68, 61, 81, 86, 82, 58],\r
        'Month': [5, 5, 5, 5, 5, 6, 6, 6, 7, 7, 8, 9],\r
        'Day': [1, 2, 3, 4, 5, 1, 2, 3, 1, 2, 1, 1],\r
    })\r
    ozone = data['Ozone'].values\r
    solar = data['Solar.R'].values\r
    month = data['Month'].values\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      import pandas as pd\r
\r
      data = pd.DataFrame({\r
          'Ozone': [41, 36, 12, np.nan, 18, 28, np.nan, 23, 45, 60, 32, 29],\r
          'Solar.R': [190, 118, 149, 313, np.nan, 299, 99, 19, 256, 290, 274, 65],\r
          'Wind': [7.4, 8.0, 12.6, 11.5, 14.3, 8.6, 13.8, 20.1, 9.7, 6.9, 10.9, 13.2],\r
          'Temp': [67, 72, 74, 62, 65, 79, 68, 61, 81, 86, 82, 58],\r
          'Month': [5, 5, 5, 5, 5, 6, 6, 6, 7, 7, 8, 9],\r
          'Day': [1, 2, 3, 4, 5, 1, 2, 3, 1, 2, 1, 1],\r
      })\r
      ozone = data['Ozone'].values\r
      solar = data['Solar.R'].values\r
      month = data['Month'].values\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};