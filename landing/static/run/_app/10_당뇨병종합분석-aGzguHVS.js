var e=`meta:\r
  packages:\r
  - numpy\r
  - pandas\r
  id: numpy_10\r
  title: 당뇨병종합분석\r
  order: 10\r
  category: numpy\r
  difficulty: ⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - numpy\r
  - 종합\r
  - random\r
  - bincount\r
  - histogram\r
  - cov\r
  - eig\r
  - apply_along_axis\r
  - 검증\r
  - 종합분석\r
  seo:\r
    title: NumPy 종합 프로젝트 - 당뇨병 데이터 분석\r
    description: NumPy의 모든 핵심 기능을 종합하여 당뇨병 데이터를 심층 분석합니다.\r
    keywords:\r
    - numpy\r
    - 종합분석\r
    - 당뇨병\r
    - random\r
    - histogram\r
    - cov\r
intro:\r
  emoji: 🩺\r
  goal: NumPy의 모든 핵심 기능을 종합하여 당뇨병 데이터를 분석합니다.\r
  description: Pima 인디언 당뇨병 데이터셋으로 지금까지 배운 모든 NumPy 개념을 종합 활용합니다. 배열 생성, 인덱싱, 통계, 선형대수, 결측값 처리, 상관분석을\r
    모두 다룹니다.\r
  direction: 당뇨병종합분석에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.\r
  benefits:\r
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.\r
  - 당뇨병종합분석 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 배열 추출 결과 검증\r
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 당뇨병종합분석 재사용\r
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 배열 계산 환경\r
      detail: numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 당뇨병종합분석 실행\r
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.\r
    - label: 당뇨병종합분석 완료\r
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
  subtitle: 당뇨병 데이터셋\r
  goal: 2단계. 데이터 로드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 로컬 당뇨병 샘플은 220건의 합성 의료 검사 기록입니다.\r
    Glucose(혈당), BloodPressure(혈압), BMI(체질량지수), Insulin(인슐린 수치) 등과 Outcome(당뇨병 유무, 1이면 당뇨)이 기록되어 있습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    df = loadLocalDataset("diabetes")\r
    df.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      df = loadLocalDataset("diabetes")\r
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
  subtitle: 전체 특성\r
  goal: 3단계. 배열 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 모든 특성과 타겟을 NumPy 배열로 추출합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    cols = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigree', 'Age']\r
    X = df[cols].values\r
    y = df['Outcome'].values\r
    X.shape, y.shape\r
  exercise:\r
    prompt: 3단계. 배열 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      cols = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigree', 'Age']\r
      X = df[cols].values\r
      y = df['Outcome'].values\r
      X.shape, y.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 배열 추출에서 \`cols\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 배열 추출 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_zero_check\r
  title: 4단계. 결측값 확인\r
  structuredPrimary: true\r
  subtitle: 0값 처리\r
  goal: 4단계. 결측값 확인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 이 데이터셋의 특이점은 결측값이 NaN 대신 0으로 기록되어 있다는 것입니다. 하지만 혈당(Glucose)이나 혈압(BloodPressure)이 0이라는 것은\r
    생물학적으로 불가능합니다. 살아있는 사람의 혈당이 0일 수는 없죠. 따라서 이런 0값들은 실제로는 '측정하지 못함'을 의미하는 결측값입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    zeros = np.sum(X == 0, axis=0)\r
    ratio = zeros / len(X) * 100\r
    pd.DataFrame({'Feature': cols, 'ZeroCount': zeros, 'ZeroRatio': ratio.round(1)})\r
  exercise:\r
    prompt: 4단계. 결측값 확인 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      zeros = np.sum(X == 0, axis=0)\r
      ratio = zeros / len(X) * 100\r
      pd.DataFrame({'Feature': cols, 'ZeroCount': zeros, 'ZeroRatio': ratio.round(1)})\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 결측값 확인의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 결측값 확인의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_replace_nan\r
  title: 5단계. 0을 NaN으로\r
  structuredPrimary: true\r
  subtitle: np.where()\r
  goal: 5단계. 0을 NaN으로에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: Glucose, BloodPressure, SkinThickness, Insulin, BMI의 0값은 결측값이므로 NaN으로 변환합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    idx = [1, 2, 3, 4, 5]\r
    clean = X.astype(float).copy()\r
    for i in idx:\r
        clean[:, i] = np.where(clean[:, i] == 0, np.nan, clean[:, i])\r
    np.sum(np.isnan(clean), axis=0)\r
  exercise:\r
    prompt: 5단계. 0을 NaN으로 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      idx = [1, 2, 3, 4, 5]\r
      clean = X.astype(float).copy()\r
      for i in idx:\r
          clean[:, i] = np.where(clean[:, i] == 0, np.nan, clean[:, i])\r
      np.sum(np.isnan(clean), axis=0)\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 0을 NaN으로의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 5단계. 0을 NaN으로 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step6_impute\r
  title: 6단계. 결측값 대체\r
  structuredPrimary: true\r
  subtitle: nanmean\r
  goal: 6단계. 결측값 대체에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 결측값을 각 컬럼의 평균으로 대체합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    avg = np.nanmean(clean, axis=0)\r
    mask = np.isnan(clean)\r
    ci = np.where(mask)[1]\r
    clean[mask] = avg[ci]\r
    np.sum(np.isnan(clean))\r
  exercise:\r
    prompt: 6단계. 결측값 대체 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      avg = np.nanmean(clean, axis=0)\r
      mask = np.isnan(clean)\r
      ci = np.where(mask)[1]\r
      clean[mask] = avg[ci]\r
      np.sum(np.isnan(clean))\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 결측값 대체에서 \`avg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 결측값 대체 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step7_histogram\r
  title: 7단계. 히스토그램\r
  structuredPrimary: true\r
  subtitle: np.histogram()\r
  goal: 7단계. 히스토그램에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    히스토그램은 데이터를 구간(bin)으로 나누어 각 구간에 몇 개의 값이 있는지 세는 것입니다. 예를 들어 혈당 80~100에 몇 명, 100~120에 몇 명 이런 식으로요. np.histogram()은 그래프 없이 숫자만 반환하므로, 분포를 빠르게 파악하거나 추가 계산에 활용할 수 있습니다.\r
\r
    np.histogram(arr, bins)은 히스토그램 데이터를 반환합니다. 반환값은 (빈도, 구간 경계)입니다. 시각화 없이 분포를 분석할 때 유용합니다.\r
  snippet: |-\r
    glucose = clean[:, 1]\r
    hist, edges = np.histogram(glucose, bins=10)\r
    pd.DataFrame({'BinStart': edges[:-1].round(1), 'BinEnd': edges[1:].round(1), 'Count': hist})\r
  exercise:\r
    prompt: 7단계. 히스토그램 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      glucose = clean[:, 1]\r
      hist, edges = np.histogram(glucose, bins=10)\r
      pd.DataFrame({'BinStart': edges[:-1].round(1), 'BinEnd': edges[1:].round(1), 'Count': hist})\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 히스토그램의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 7단계. 히스토그램의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step8_bincount\r
  title: 8단계. 빈도 계산\r
  structuredPrimary: true\r
  subtitle: np.bincount()\r
  goal: 8단계. 빈도 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.bincount()는 정수 배열에서 각 숫자가 몇 번 나오는지 세줍니다. [0,1,1,0,1,0]이 있으면 0이 3번, 1이 3번입니다. 당뇨병 유무(0 또는 1)의 빈도를 세면 데이터에 클래스 불균형(한쪽이 너무 많음)이 있는지 확인할 수 있습니다.\r
\r
    np.bincount(arr)은 음이 아닌 정수 배열의 각 값 빈도를 계산합니다. 클래스 불균형 확인에 유용합니다.\r
  snippet: |-\r
    counts = np.bincount(y)\r
    f"정상: {counts[0]}명, 당뇨: {counts[1]}명, 비율: {counts[1]/len(y)*100:.1f}%"\r
  exercise:\r
    prompt: 8단계. 빈도 계산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      counts = np.bincount(y)\r
      f"정상: {counts[0]}명, 당뇨: {counts[1]}명, 비율: {counts[1]/len(y)*100:.1f}%"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 빈도 계산에서 \`counts\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 빈도 계산 실행 뒤 \`counts\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step9_cov\r
  title: 9단계. 공분산 행렬\r
  structuredPrimary: true\r
  subtitle: np.cov()\r
  goal: 9단계. 공분산 행렬에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    공분산(covariance)은 두 변수가 함께 변하는 정도를 나타냅니다. 양수면 함께 증가하고, 음수면 하나가 증가할 때 다른 것은 감소합니다. 상관계수와 비슷하지만, 공분산은 원래 단위를 유지합니다. np.cov()는 모든 변수 쌍의 공분산을 행렬로 반환합니다.\r
\r
    np.cov(arr)은 공분산 행렬을 계산합니다. 행이 변수, 열이 관측치여야 하므로 .T로 전치합니다.\r
  snippet: |-\r
    cov = np.cov(clean.T)\r
    cov.shape\r
  exercise:\r
    prompt: 9단계. 공분산 행렬 예제에서 \`cov\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      cov = np.cov(clean.T)\r
      cov.shape\r
    hints:\r
    - 바꿀 지점은 \`cov = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`cov\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 공분산 행렬에서 \`cov\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 공분산 행렬 실행 뒤 \`cov\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step10_corr_target\r
  title: 10단계. 타겟 상관관계\r
  structuredPrimary: true\r
  subtitle: corrcoef\r
  goal: 10단계. 타겟 상관관계에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 각 특성과 당뇨병 유무의 상관계수를 계산합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    corrs = []\r
    for i in range(clean.shape[1]):\r
        r = np.corrcoef(clean[:, i], y)[0, 1]\r
        corrs.append(r)\r
    corrs = np.array(corrs)\r
    result = pd.DataFrame({'Feature': cols, 'Correlation': corrs.round(3)})\r
    result.sort_values('Correlation', ascending=False)\r
  exercise:\r
    prompt: 10단계. 타겟 상관관계 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      corrs = []\r
      for i in range(clean.shape[1]):\r
          r = np.corrcoef(clean[:, i], y)[0, 1]\r
          corrs.append(r)\r
      corrs = np.array(corrs)\r
      result = pd.DataFrame({'Feature': cols, 'Correlation': corrs.round(3)})\r
      result.sort_values('Correlation', ascending=False)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 타겟 상관관계의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 10단계. 타겟 상관관계 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step11_group_stats\r
  title: 11단계. 그룹별 통계\r
  structuredPrimary: true\r
  subtitle: 당뇨/비당뇨\r
  goal: 11단계. 그룹별 통계에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 당뇨병 유무에 따른 각 특성의 평균을 비교합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    sick = y == 1\r
    well = y == 0\r
    avg1 = np.mean(clean[sick], axis=0)\r
    avg2 = np.mean(clean[well], axis=0)\r
    diff = (avg1 - avg2) / avg2 * 100\r
    pd.DataFrame({\r
        'Feature': cols,\r
        'Normal': avg2.round(2),\r
        'Diabetic': avg1.round(2),\r
        'Diff(%)': diff.round(1)\r
    })\r
  exercise:\r
    prompt: 11단계. 그룹별 통계 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      sick = y == 1\r
      well = y == 0\r
      avg1 = np.mean(clean[sick], axis=0)\r
      avg2 = np.mean(clean[well], axis=0)\r
      diff = (avg1 - avg2) / avg2 * 100\r
      pd.DataFrame({\r
          'Feature': cols,\r
          'Normal': avg2.round(2),\r
          'Diabetic': avg1.round(2),\r
          'Diff(%)': diff.round(1)\r
      })\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 그룹별 통계의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 11단계. 그룹별 통계의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step12_standardize\r
  title: 12단계. 표준화\r
  structuredPrimary: true\r
  subtitle: Z-score\r
  goal: 12단계. 표준화에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 모든 특성을 Z-score로 표준화합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    mu = np.mean(clean, axis=0)\r
    sigma = np.std(clean, axis=0)\r
    z = (clean - mu) / sigma\r
    f"표준화 후 평균: {np.mean(z, axis=0).round(5)}, 표준편차: {np.std(z, axis=0).round(2)}"\r
  exercise:\r
    prompt: 12단계. 표준화 예제에서 \`mu\`, \`sigma\`, \`z\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      mu = np.mean(clean, axis=0)\r
      sigma = np.std(clean, axis=0)\r
      z = (clean - mu) / sigma\r
      f"표준화 후 평균: {np.mean(z, axis=0).round(5)}, 표준편차: {np.std(z, axis=0).round(2)}"\r
    hints:\r
    - 바꿀 지점은 \`mu = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`mu\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 표준화에서 \`mu\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 12단계. 표준화 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step13_eig\r
  title: 13단계. 고유값 분해\r
  structuredPrimary: true\r
  subtitle: np.linalg.eig()\r
  goal: 13단계. 고유값 분해에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    고유값 분해(eigenvalue decomposition)는 행렬을 분석하는 핵심 기법입니다. 공분산 행렬의 고유값은 각 방향으로의 데이터 분산(퍼짐) 정도를 나타냅니다. 가장 큰 고유값의 방향이 데이터가 가장 많이 퍼진 방향입니다. 이것이 PCA(주성분 분석)의 수학적 기초입니다.\r
\r
    np.linalg.eig(A)는 정방행렬의 고유값과 고유벡터를 반환합니다. 공분산 행렬의 고유값은 각 주성분이 설명하는 분산량입니다.\r
  snippet: |-\r
    c = np.cov(z.T)\r
    eig, vec = np.linalg.eig(c)\r
    order = np.argsort(eig)[::-1]\r
    eig = eig[order]\r
    var = eig / np.sum(eig) * 100\r
    pd.DataFrame({'PC': [f'PC{i+1}' for i in range(8)], 'EigenValue': eig.round(3), 'ExplainedVar(%)': var.round(1)})\r
  exercise:\r
    prompt: 13단계. 고유값 분해 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      c = np.cov(z.T)\r
      eig, vec = np.linalg.eig(c)\r
      order = np.argsort(eig)[::-1]\r
      eig = eig[order]\r
      var = eig / np.sum(eig) * 100\r
      pd.DataFrame({'PC': [f'PC{i+1}' for i in range(8)], 'EigenValue': eig.round(3), 'ExplainedVar(%)': var.round(1)})\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 고유값 분해의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 13단계. 고유값 분해 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step14_apply_along\r
  title: 14단계. 축 따라 적용\r
  structuredPrimary: true\r
  subtitle: np.apply_along_axis()\r
  goal: 14단계. 축 따라 적용에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    np.apply_along_axis()는 직접 만든 함수를 배열의 특정 축을 따라 적용합니다. 예를 들어 IQR(사분위수 범위)을 계산하는 함수를 만들어, 모든 열에 한 번에 적용할 수 있습니다. IQR은 75% 백분위수에서 25% 백분위수를 뺀 값으로, 데이터의 퍼짐 정도를 나타냅니다.\r
\r
    np.apply_along_axis(func, axis, arr)는 배열의 특정 축을 따라 함수를 적용합니다. 커스텀 통계 함수를 적용할 때 유용합니다.\r
  snippet: |-\r
    def iqr(x):\r
        return np.percentile(x, 75) - np.percentile(x, 25)\r
\r
    vals = np.apply_along_axis(iqr, axis=0, arr=clean)\r
    pd.DataFrame({'Feature': cols, 'IQR': vals.round(2)})\r
  exercise:\r
    prompt: 14단계. 축 따라 적용 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      def iqr(x):\r
          return np.percentile(x, 75) - np.percentile(x, 25)\r
\r
      vals = np.apply_along_axis(iqr, axis=0, arr=clean)\r
      pd.DataFrame({'Feature': cols, 'IQR': vals.round(2)})\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 축 따라 적용의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 14단계. 축 따라 적용 함수 호출 결과가 바꾼 인자나 반환식 기준으로 달라져야 합니다.\r
- id: step15_risk_score\r
  title: 15단계. 위험 점수 계산\r
  structuredPrimary: true\r
  subtitle: 종합 분석\r
  goal: 15단계. 위험 점수 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 위험 점수(Risk Score)는 여러 특성을 종합하여 하나의 숫자로 나타낸 것입니다. 여기서는 각 특성의 상관계수를 가중치로 사용합니다. 당뇨와 상관관계가\r
    높은 특성일수록 가중치가 크고, 그 특성값이 높으면 위험 점수도 올라갑니다. 마치 건강검진 결과를 종합하여 '건강점수'를 매기는 것과 같습니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    w = np.abs(corrs) / np.sum(np.abs(corrs))\r
    score = np.sum(z * w, axis=1)\r
    pct = np.percentile(score, [25, 50, 75, 90])\r
    pd.DataFrame({\r
        'RiskGroup': ['Low (Q1)', 'Medium (Q2)', 'High (Q3)', 'VeryHigh (90%)', 'Actual'],\r
        'Threshold': list(pct.round(2)) + ['-'],\r
        'DiabeticRate': [\r
            np.mean(y[score < pct[0]]) * 100,\r
            np.mean(y[(score >= pct[0]) & (score < pct[1])]) * 100,\r
            np.mean(y[(score >= pct[1]) & (score < pct[2])]) * 100,\r
            np.mean(y[score >= pct[3]]) * 100,\r
            np.mean(y) * 100\r
        ]\r
    }).round(1)\r
  exercise:\r
    prompt: 15단계. 위험 점수 계산 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      w = np.abs(corrs) / np.sum(np.abs(corrs))\r
      score = np.sum(z * w, axis=1)\r
      pct = np.percentile(score, [25, 50, 75, 90])\r
      pd.DataFrame({\r
          'RiskGroup': ['Low (Q1)', 'Medium (Q2)', 'High (Q3)', 'VeryHigh (90%)', 'Actual'],\r
          'Threshold': list(pct.round(2)) + ['-'],\r
          'DiabeticRate': [\r
              np.mean(y[score < pct[0]]) * 100,\r
              np.mean(y[(score >= pct[0]) & (score < pct[1])]) * 100,\r
              np.mean(y[(score >= pct[1]) & (score < pct[2])]) * 100,\r
              np.mean(y[score >= pct[3]]) * 100,\r
              np.mean(y) * 100\r
          ]\r
      }).round(1)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 위험 점수 계산의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 15단계. 위험 점수 계산의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 당뇨 위험 점수 파이프라인'\r
  structuredPrimary: true\r
  subtitle: 표준화, 공분산, 히스토그램, 위험군 검증\r
  goal: '현업 흐름 검증: 당뇨 위험 점수 파이프라인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    종합 분석은 여러 NumPy 기능을 이어 붙이는 만큼 중간 산출물을 검증해야 합니다. 표준화 평균, 위험 점수 shape, 구간별 환자 수를 단계별로 확인하세요.\r
\r
    변주 실험\r
    가중치를 상관계수 기반으로 바꾼 점수와 수동 가중치 점수를 비교하고, 고위험군에 들어가는 사람이 달라지는지 확인하세요.\r
  tips:\r
  - 변주 실험 가중치를 상관계수 기반으로 바꾼 점수와 수동 가중치 점수를 비교하고, 고위험군에 들어가는 사람이 달라지는지 확인하세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    X = np.array([\r
        [120, 70, 28],\r
        [160, 85, 35],\r
        [140, 80, 31],\r
        [180, 95, 40],\r
    ], dtype=float)\r
    y = np.array([0, 1, 0, 1])\r
\r
    z = (X - X.mean(axis=0)) / X.std(axis=0)\r
    weights = np.array([0.4, 0.3, 0.3])\r
    riskScore = z @ weights\r
    counts, bins = np.histogram(riskScore, bins=2)\r
    covariance = np.cov(X, rowvar=False)\r
\r
    assert np.allclose(z.mean(axis=0), [0.0, 0.0, 0.0])\r
    assert riskScore.shape == (4,)\r
    assert counts.sum() == len(y)\r
    assert covariance.shape == (3, 3)\r
  exercise:\r
    prompt: '현업 흐름 검증: 당뇨 위험 점수 파이프라인 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import numpy as np\r
\r
      X = np.array([\r
          [120, 70, 28],\r
          [160, 85, 35],\r
          [140, 80, 31],\r
          [180, 95, 40],\r
      ], dtype=float)\r
      y = np.array([0, 1, 0, 1])\r
\r
      z = (X - X.mean(axis=0)) / X.std(axis=0)\r
      weights = np.array([0.4, 0.3, 0.3])\r
      riskScore = z @ weights\r
      counts, bins = np.histogram(riskScore, bins=2)\r
      covariance = np.cov(X, rowvar=False)\r
\r
      assert np.allclose(z.mean(axis=0), [0.0, 0.0, 0.0])\r
      assert riskScore.shape == (4,)\r
      assert counts.sum() == len(y)\r
      assert covariance.shape == (3, 3)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 당뇨 위험 점수 파이프라인의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.'\r
    resultCheck: '현업 흐름 검증: 당뇨 위험 점수 파이프라인의 match/search/sub 결과가 바꾼 패턴이나 샘플 문자열 기준과 맞아야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 당뇨병 종합 분석\r
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
    data = pd.DataFrame([\r
        [6, 148, 72, 35, 0, 33.6, 0.627, 50, 1],\r
        [1, 85, 66, 29, 0, 26.6, 0.351, 31, 0],\r
        [8, 183, 64, 0, 0, 23.3, 0.672, 32, 1],\r
        [1, 89, 66, 23, 94, 28.1, 0.167, 21, 0],\r
        [0, 137, 40, 35, 168, 43.1, 2.288, 33, 1],\r
        [5, 116, 74, 0, 0, 25.6, 0.201, 30, 0],\r
        [3, 78, 50, 32, 88, 31.0, 0.248, 26, 1],\r
        [10, 115, 0, 0, 0, 35.3, 0.134, 29, 0],\r
        [2, 197, 70, 45, 543, 30.5, 0.158, 53, 1],\r
        [8, 125, 96, 0, 0, 0.0, 0.232, 54, 1],\r
        [4, 110, 76, 20, 100, 37.2, 0.450, 61, 0],\r
        [7, 160, 82, 42, 210, 39.4, 0.690, 66, 1],\r
    ])\r
    data.columns = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigree', 'Age', 'Outcome']\r
    age = data['Age'].values\r
    target = data['Outcome'].values\r
    glucose = data['Glucose'].values\r
    bmi = data['BMI'].values\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      import pandas as pd\r
\r
      data = pd.DataFrame([\r
          [6, 148, 72, 35, 0, 33.6, 0.627, 50, 1],\r
          [1, 85, 66, 29, 0, 26.6, 0.351, 31, 0],\r
          [8, 183, 64, 0, 0, 23.3, 0.672, 32, 1],\r
          [1, 89, 66, 23, 94, 28.1, 0.167, 21, 0],\r
          [0, 137, 40, 35, 168, 43.1, 2.288, 33, 1],\r
          [5, 116, 74, 0, 0, 25.6, 0.201, 30, 0],\r
          [3, 78, 50, 32, 88, 31.0, 0.248, 26, 1],\r
          [10, 115, 0, 0, 0, 35.3, 0.134, 29, 0],\r
          [2, 197, 70, 45, 543, 30.5, 0.158, 53, 1],\r
          [8, 125, 96, 0, 0, 0.0, 0.232, 54, 1],\r
          [4, 110, 76, 20, 100, 37.2, 0.450, 61, 0],\r
          [7, 160, 82, 42, 210, 39.4, 0.690, 66, 1],\r
      ])\r
      data.columns = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI', 'DiabetesPedigree', 'Age', 'Outcome']\r
      age = data['Age'].values\r
      target = data['Outcome'].values\r
      glucose = data['Glucose'].values\r
      bmi = data['BMI'].values\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};