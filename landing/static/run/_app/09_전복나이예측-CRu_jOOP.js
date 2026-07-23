var e=`meta:\r
  packages:\r
  - numpy\r
  - pandas\r
  id: numpy_09\r
  title: 전복나이예측\r
  order: 9\r
  category: numpy\r
  difficulty: ⭐⭐⭐\r
  badge: 심화\r
  tags:\r
  - numpy\r
  - dot\r
  - matmul\r
  - linalg\r
  - lstsq\r
  - polyfit\r
  - polyval\r
  - 검증\r
  - 회귀분석\r
  seo:\r
    title: NumPy 선형대수 - 전복 나이 예측\r
    description: NumPy의 선형대수 기능을 배우며 전복의 물리적 특성으로 나이를 예측합니다.\r
    keywords:\r
    - numpy\r
    - 선형대수\r
    - dot\r
    - lstsq\r
    - polyfit\r
    - 전복\r
intro:\r
  emoji: 🐚\r
  goal: 전복 데이터로 선형대수 연산과 회귀를 익힙니다.\r
  description: 180개 전복 샘플의 물리적 특성 데이터로 나이를 예측합니다. 행렬 연산, 선형 회귀, 다항 피팅을 NumPy의 선형대수 기능으로 구현합니다.\r
  direction: 전복나이예측에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.\r
  benefits:\r
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.\r
  - 전복나이예측 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 배열 추출 결과 검증\r
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 전복나이예측 재사용\r
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 배열 계산 환경\r
      detail: numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 전복나이예측 실행\r
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.\r
    - label: 전복나이예측 완료\r
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
  subtitle: 전복 데이터셋\r
  goal: 2단계. 데이터 로드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 로컬 전복(Abalone) 샘플은 180마리의 전복 정보입니다. 전복 나이는 껍질의 고리 수(Rings)를 세어 알 수 있는데, 이 작업은 시간이\r
    많이 걸립니다. 그래서 길이, 지름, 높이, 무게 등 쉽게 측정할 수 있는 특성으로 나이를 예측하려는 것이 이 데이터셋의 목적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    abaloneDf = loadLocalDataset("abalone")\r
    abaloneDf.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      abaloneDf = loadLocalDataset("abalone")\r
      abaloneDf.head()\r
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
  subtitle: 특성과 타겟\r
  goal: 3단계. 배열 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 예측에 사용할 특성과 타겟(나이)을 추출합니다. 전복의 나이는 고리 수 + 1.5로 계산됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    featureCols = ['Length', 'Diameter', 'Height', 'WholeWeight', 'ShuckedWeight', 'VisceraWeight', 'ShellWeight']\r
    X = abaloneDf[featureCols].values\r
    rings = abaloneDf['Rings'].values\r
    age = rings + 1.5\r
    X.shape, age.shape\r
  exercise:\r
    prompt: 3단계. 배열 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      featureCols = ['Length', 'Diameter', 'Height', 'WholeWeight', 'ShuckedWeight', 'VisceraWeight', 'ShellWeight']\r
      X = abaloneDf[featureCols].values\r
      rings = abaloneDf['Rings'].values\r
      age = rings + 1.5\r
      X.shape, age.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 배열 추출에서 \`featureCols\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 배열 추출 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_dot\r
  title: 4단계. 내적 계산\r
  structuredPrimary: true\r
  subtitle: np.dot()\r
  goal: 4단계. 내적 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    내적(dot product)은 두 벡터의 각 원소를 곱해서 더한 값입니다. [1,2,3]과 [4,5,6]의 내적은 1×4 + 2×5 + 3×6 = 32입니다. 내적이 크면 두 벡터가 비슷한 방향을 가리키고 있다는 의미입니다. 머신러닝에서 유사도 측정, 행렬 연산의 기초로 자주 사용됩니다.\r
\r
    np.dot(a, b)는 두 벡터의 내적(스칼라곱)을 계산합니다. 결과는 스칼라 값으로, 두 벡터가 얼마나 같은 방향을 가리키는지 나타냅니다.\r
  snippet: |-\r
    length = X[:, 0]\r
    diameter = X[:, 1]\r
    dotProduct = np.dot(length, diameter)\r
    f"Length·Diameter 내적: {dotProduct:.2f}"\r
  exercise:\r
    prompt: 4단계. 내적 계산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      length = X[:, 0]\r
      diameter = X[:, 1]\r
      dotProduct = np.dot(length, diameter)\r
      f"Length·Diameter 내적: {dotProduct:.2f}"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 내적 계산에서 \`length\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 내적 계산 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step5_matmul\r
  title: 5단계. 행렬 곱셈\r
  structuredPrimary: true\r
  subtitle: '@ 연산자'\r
  goal: 5단계. 행렬 곱셈에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    행렬 곱셈은 첫 행렬의 각 행과 두 번째 행렬의 각 열을 내적한 결과입니다. A@B에서 A가 (m,n) 크기, B가 (n,k) 크기면 결과는 (m,k) 크기입니다. X.T @ X는 X의 전치행렬과 X를 곱한 것으로, 선형 회귀에서 정규방정식을 풀 때 핵심이 되는 연산입니다.\r
\r
    @ 연산자는 행렬 곱셈(matmul)을 수행합니다. np.dot()도 2D 배열에서는 같은 결과지만, @가 더 명시적입니다.\r
  snippet: |-\r
    XtX = X.T @ X\r
    XtX.shape\r
  exercise:\r
    prompt: 5단계. 행렬 곱셈 예제에서 \`XtX\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      XtX = X.T @ X\r
      XtX.shape\r
    hints:\r
    - 바꿀 지점은 \`XtX = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`XtX\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 행렬 곱셈에서 \`XtX\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 행렬 곱셈 실행 뒤 \`XtX\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step6_linalg_norm\r
  title: 6단계. 벡터 노름\r
  structuredPrimary: true\r
  subtitle: np.linalg.norm()\r
  goal: 6단계. 벡터 노름에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: |-\r
    노름(norm)은 벡터의 '크기' 또는 '길이'입니다. 피타고라스 정리로 계산합니다. [3,4]의 노름은 √(3²+4²) = 5입니다. np.linalg는 linear algebra(선형대수)의 약자로, 행렬과 벡터 연산에 관한 함수들이 모여 있습니다.\r
\r
    np.linalg.norm(arr)은 벡터의 유클리드 노름(길이)을 계산합니다. axis 파라미터로 행/열 방향을 지정할 수 있습니다.\r
  snippet: |-\r
    featureNorms = np.linalg.norm(X, axis=0)\r
    pd.DataFrame({'Feature': featureCols, 'Norm': featureNorms.round(2)})\r
  exercise:\r
    prompt: 6단계. 벡터 노름 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      featureNorms = np.linalg.norm(X, axis=0)\r
      pd.DataFrame({'Feature': featureCols, 'Norm': featureNorms.round(2)})\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 벡터 노름의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 6단계. 벡터 노름의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step7_normalize\r
  title: 7단계. 특성 정규화\r
  structuredPrimary: true\r
  subtitle: 단위 벡터\r
  goal: 7단계. 특성 정규화에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 각 특성을 노름으로 나누어 단위 벡터로 정규화합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    Xnorm = X / featureNorms\r
    normCheck = np.linalg.norm(Xnorm, axis=0)\r
    f"정규화 후 노름: {normCheck.round(2)}"\r
  exercise:\r
    prompt: 7단계. 특성 정규화 예제에서 \`Xnorm\`, \`normCheck\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      Xnorm = X / featureNorms\r
      normCheck = np.linalg.norm(Xnorm, axis=0)\r
      f"정규화 후 노름: {normCheck.round(2)}"\r
    hints:\r
    - 바꿀 지점은 \`Xnorm = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`Xnorm\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 특성 정규화에서 \`Xnorm\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. 특성 정규화 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step8_lstsq\r
  title: 8단계. 최소제곱 회귀\r
  structuredPrimary: true\r
  subtitle: np.linalg.lstsq()\r
  goal: 8단계. 최소제곱 회귀에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    선형 회귀는 '특성 × 계수 = 나이' 관계를 찾는 것입니다. lstsq(least squares, 최소제곱)는 예측값과 실제값의 차이(오차)의 제곱합을 최소화하는 계수를 찾습니다. Xbias에 1로 채운 열을 추가하는 이유는 절편(bias, 상수항)을 구하기 위함입니다.\r
\r
    np.linalg.lstsq(A, b)는 Ax=b의 최소제곱 해를 구합니다. 반환값은 (계수, 잔차, 행렬 랭크, 특이값)입니다.\r
  snippet: |-\r
    Xbias = np.column_stack([np.ones(len(X)), X])\r
    coeffs, residuals, rank, s = np.linalg.lstsq(Xbias, age, rcond=None)\r
    coeffs.round(3)\r
  exercise:\r
    prompt: 8단계. 최소제곱 회귀 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      Xbias = np.column_stack([np.ones(len(X)), X])\r
      coeffs, residuals, rank, s = np.linalg.lstsq(Xbias, age, rcond=None)\r
      coeffs.round(3)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 최소제곱 회귀에서 \`Xbias\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 최소제곱 회귀 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_predict\r
  title: 9단계. 예측 수행\r
  structuredPrimary: true\r
  subtitle: 행렬 연산\r
  goal: 9단계. 예측 수행에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 구한 계수로 나이를 예측합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    agePred = Xbias @ coeffs\r
    agePred[:10].round(1)\r
  exercise:\r
    prompt: 9단계. 예측 수행 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      agePred = Xbias @ coeffs\r
      agePred[:10].round(1)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 예측 수행에서 \`agePred\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 예측 수행 실행 뒤 \`agePred\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step10_error\r
  title: 10단계. 오차 계산\r
  structuredPrimary: true\r
  subtitle: MSE, RMSE\r
  goal: 10단계. 오차 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: MSE(Mean Squared Error, 평균제곱오차)는 예측 오차의 제곱을 평균한 값입니다. 제곱하는 이유는 양수/음수 오차가 상쇄되지 않게 하고, 큰\r
    오차에 더 큰 페널티를 주기 위함입니다. RMSE(Root MSE)는 MSE에 루트를 씌운 값으로, 원래 단위(년)로 해석할 수 있어 더 직관적입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    errors = age - agePred\r
    mse = np.mean(errors ** 2)\r
    rmse = np.sqrt(mse)\r
    f"MSE: {mse:.3f}, RMSE: {rmse:.3f}년"\r
  exercise:\r
    prompt: 10단계. 오차 계산 예제에서 \`errors\`, \`mse\`, \`rmse\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      errors = age - agePred\r
      mse = np.mean(errors ** 2)\r
      rmse = np.sqrt(mse)\r
      f"MSE: {mse:.3f}, RMSE: {rmse:.3f}년"\r
    hints:\r
    - 바꿀 지점은 \`errors = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`errors\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 오차 계산에서 \`errors\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 오차 계산 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step11_rsquared\r
  title: 11단계. 결정계수\r
  structuredPrimary: true\r
  subtitle: R²\r
  goal: 11단계. 결정계수에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: R²(결정계수)는 모델이 데이터 변동의 몇 %를 설명하는지 나타냅니다. 0~1 사이 값으로, 1에 가까울수록 모델이 데이터를 잘 설명합니다. R²=0.5면\r
    '나이 변동의 50%를 특성들로 설명할 수 있다'는 의미입니다. 단순히 평균만 예측하는 모델은 R²=0입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    ssTot = np.sum((age - np.mean(age)) ** 2)\r
    ssRes = np.sum(errors ** 2)\r
    rSquared = 1 - ssRes / ssTot\r
    f"R²: {rSquared:.4f}"\r
  exercise:\r
    prompt: 11단계. 결정계수 예제에서 \`ssTot\`, \`ssRes\`, \`rSquared\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      ssTot = np.sum((age - np.mean(age)) ** 2)\r
      ssRes = np.sum(errors ** 2)\r
      rSquared = 1 - ssRes / ssTot\r
      f"R²: {rSquared:.4f}"\r
    hints:\r
    - 바꿀 지점은 \`ssTot = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`ssTot\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 결정계수에서 \`ssTot\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. 결정계수 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step12_polyfit\r
  title: 12단계. 다항 피팅\r
  structuredPrimary: true\r
  subtitle: np.polyfit()\r
  goal: 12단계. 다항 피팅에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    다항 회귀는 y = ax² + bx + c 같은 곡선 관계를 찾습니다. 선형 회귀(직선)보다 복잡한 패턴을 표현할 수 있습니다. np.polyfit(x, y, deg=2)는 2차 다항식의 계수 [a, b, c]를 찾습니다. 로컬 샘플에서는 껍질 무게와 나이의 관계가 약할 수 있으므로 다항식 결과도 RMSE로 확인합니다.\r
\r
    np.polyfit(x, y, deg)는 deg차 다항식으로 데이터를 피팅합니다. 반환되는 계수는 최고차항부터 상수항 순서입니다.\r
  snippet: |-\r
    shellWeight = X[:, 6]\r
    polyCoeffs = np.polyfit(shellWeight, age, deg=2)\r
    polyCoeffs.round(3)\r
  exercise:\r
    prompt: 12단계. 다항 피팅 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      shellWeight = X[:, 6]\r
      polyCoeffs = np.polyfit(shellWeight, age, deg=2)\r
      polyCoeffs.round(3)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 다항 피팅에서 \`shellWeight\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 12단계. 다항 피팅 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step13_polyval\r
  title: 13단계. 다항식 평가\r
  structuredPrimary: true\r
  subtitle: np.polyval()\r
  goal: 13단계. 다항식 평가에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    polyval로 피팅된 다항식을 평가합니다.\r
\r
    np.polyval(coeffs, x)는 다항식 계수와 x값으로 다항식을 평가합니다. polyfit과 함께 사용하면 다항 회귀를 쉽게 수행할 수 있습니다.\r
  snippet: |-\r
    agePolyPred = np.polyval(polyCoeffs, shellWeight)\r
    polyErrors = age - agePolyPred\r
    polyRmse = np.sqrt(np.mean(polyErrors ** 2))\r
    f"다항 회귀 RMSE: {polyRmse:.3f}년"\r
  exercise:\r
    prompt: 13단계. 다항식 평가 예제에서 \`agePolyPred\`, \`polyErrors\`, \`polyRmse\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      agePolyPred = np.polyval(polyCoeffs, shellWeight)\r
      polyErrors = age - agePolyPred\r
      polyRmse = np.sqrt(np.mean(polyErrors ** 2))\r
      f"다항 회귀 RMSE: {polyRmse:.3f}년"\r
    hints:\r
    - 바꿀 지점은 \`agePolyPred = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`agePolyPred\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 다항식 평가에서 \`agePolyPred\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 13단계. 다항식 평가 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step14_inv\r
  title: 14단계. 역행렬\r
  structuredPrimary: true\r
  subtitle: np.linalg.inv()\r
  goal: 14단계. 역행렬에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    역행렬은 행렬의 '역수' 같은 개념입니다. A × A⁻¹ = I(단위행렬)입니다. 선형 회귀의 정규 방정식 해는 (X^T X)^(-1) X^T y인데, 이 공식을 직접 계산할 수 있습니다. lstsq와 결과가 같지만, 역행렬 방식은 수치적으로 불안정할 수 있어 lstsq가 더 권장됩니다.\r
\r
    np.linalg.inv(A)는 정방행렬의 역행렬을 계산합니다. 단, 역행렬이 존재하지 않으면(특이 행렬) 에러가 발생합니다.\r
  snippet: |-\r
    XtXinv = np.linalg.inv(Xbias.T @ Xbias)\r
    coeffsNormal = XtXinv @ Xbias.T @ age\r
    f"lstsq와 차이: {np.max(np.abs(coeffs - coeffsNormal)):.10f}"\r
  exercise:\r
    prompt: 14단계. 역행렬 예제에서 \`XtXinv\`, \`coeffsNormal\` 값 중 하나를 바꾸고 마지막 표시 결과가 맞는지 확인하세요.\r
    starterCode: |-\r
      XtXinv = np.linalg.inv(Xbias.T @ Xbias)\r
      coeffsNormal = XtXinv @ Xbias.T @ age\r
      f"lstsq와 차이: {np.max(np.abs(coeffs - coeffsNormal)):.10f}"\r
    hints:\r
    - 바꿀 지점은 \`XtXinv = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`XtXinv\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 역행렬에서 \`XtXinv\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 14단계. 역행렬 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step15_feature_importance\r
  title: 15단계. 특성 중요도\r
  structuredPrimary: true\r
  subtitle: 계수 분석\r
  goal: 15단계. 특성 중요도에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 회귀 계수 크기만으로는 특성 중요도를 비교하기 어렵습니다. 특성마다 단위와 스케일이 다르기 때문입니다. 계수에 해당 특성의 표준편차를 곱하면 '특성이 1 표준편차만큼\r
    변할 때 예측값이 얼마나 변하는가'로 공정하게 비교할 수 있습니다. 로컬 샘플에서는 WholeWeight의 표준화 계수가 가장 크게 보일 수 있지만, R²가 낮으면 중요도 해석도 제한적으로 보아야 합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    Xstd = np.std(X, axis=0)\r
    stdCoeffs = coeffs[1:] * Xstd\r
    importanceDf = pd.DataFrame({\r
        'Feature': featureCols,\r
        'Coefficient': coeffs[1:].round(3),\r
        'StdCoeff': stdCoeffs.round(3),\r
        'AbsImportance': np.abs(stdCoeffs).round(3)\r
    })\r
    importanceDf.sort_values('AbsImportance', ascending=False)\r
  exercise:\r
    prompt: 15단계. 특성 중요도 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      Xstd = np.std(X, axis=0)\r
      stdCoeffs = coeffs[1:] * Xstd\r
      importanceDf = pd.DataFrame({\r
          'Feature': featureCols,\r
          'Coefficient': coeffs[1:].round(3),\r
          'StdCoeff': stdCoeffs.round(3),\r
          'AbsImportance': np.abs(stdCoeffs).round(3)\r
      })\r
      importanceDf.sort_values('AbsImportance', ascending=False)\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 특성 중요도의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 15단계. 특성 중요도의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 전복 나이 선형 회귀 검증'\r
  structuredPrimary: true\r
  subtitle: 행렬 설계, lstsq, 예측 오차, 실패 케이스\r
  goal: '현업 흐름 검증: 전복 나이 선형 회귀 검증에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    선형 회귀는 계수가 나왔다고 끝이 아닙니다. 설계 행렬에 bias 열이 있는지, 예측 shape이 맞는지, 오차가 기대 범위인지 확인해야 업무에 쓸 수 있습니다.\r
\r
    변주 실험\r
    \`shellWeight\`만 쓰는 모델과 \`diameter\`까지 쓰는 모델의 MAE를 비교하고, 특성을 늘리는 것이 항상 좋은지 확인하세요.\r
  tips:\r
  - 변주 실험 \`shellWeight\`만 쓰는 모델과 \`diameter\`까지 쓰는 모델의 MAE를 비교하고, 특성을 늘리는 것이 항상 좋은지 확인하세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    shellWeight = np.array([0.15, 0.20, 0.30, 0.35])\r
    diameter = np.array([0.30, 0.36, 0.44, 0.52])\r
    age = np.array([7.0, 8.0, 11.0, 12.0])\r
\r
    X = np.column_stack([np.ones(len(shellWeight)), shellWeight, diameter])\r
    coeffs, residuals, rank, singularValues = np.linalg.lstsq(X, age, rcond=None)\r
    predicted = X @ coeffs\r
    mae = np.mean(np.abs(predicted - age))\r
\r
    assert X.shape == (4, 3)\r
    assert rank == 3\r
    assert mae < 0.2\r
    assert predicted.shape == age.shape\r
  exercise:\r
    prompt: '현업 흐름 검증: 전복 나이 선형 회귀 검증 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import numpy as np\r
\r
      shellWeight = np.array([0.15, 0.20, 0.30, 0.35])\r
      diameter = np.array([0.30, 0.36, 0.44, 0.52])\r
      age = np.array([7.0, 8.0, 11.0, 12.0])\r
\r
      X = np.column_stack([np.ones(len(shellWeight)), shellWeight, diameter])\r
      coeffs, residuals, rank, singularValues = np.linalg.lstsq(X, age, rcond=None)\r
      predicted = X @ coeffs\r
      mae = np.mean(np.abs(predicted - age))\r
\r
      assert X.shape == (4, 3)\r
      assert rank == 3\r
      assert mae < 0.2\r
      assert predicted.shape == age.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 전복 나이 선형 회귀 검증에서 \`shellWeight\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 전복 나이 선형 회귀 검증에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 전복 나이 예측\r
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
    cols = ['Sex', 'Length', 'Diameter', 'Height', 'WholeWeight', 'ShuckedWeight', 'VisceraWeight', 'ShellWeight', 'Rings']\r
    data = pd.DataFrame({\r
        'Sex': ['M', 'F', 'I', 'M', 'F', 'I', 'M', 'F', 'I', 'M', 'F', 'I'],\r
        'Length': [0.455, 0.350, 0.530, 0.440, 0.610, 0.330, 0.575, 0.650, 0.420, 0.590, 0.520, 0.375],\r
        'Diameter': [0.365, 0.265, 0.420, 0.365, 0.490, 0.255, 0.455, 0.545, 0.315, 0.470, 0.400, 0.290],\r
        'Height': [0.095, 0.090, 0.135, 0.125, 0.150, 0.080, 0.140, 0.175, 0.105, 0.155, 0.130, 0.095],\r
        'WholeWeight': [0.514, 0.225, 0.677, 0.516, 1.134, 0.205, 0.880, 1.265, 0.390, 1.010, 0.720, 0.310],\r
        'ShuckedWeight': [0.224, 0.099, 0.256, 0.216, 0.456, 0.089, 0.360, 0.520, 0.155, 0.430, 0.300, 0.130],\r
        'VisceraWeight': [0.101, 0.048, 0.142, 0.114, 0.237, 0.039, 0.180, 0.260, 0.082, 0.210, 0.148, 0.067],\r
        'ShellWeight': [0.150, 0.070, 0.210, 0.155, 0.330, 0.060, 0.260, 0.390, 0.120, 0.310, 0.220, 0.090],\r
        'Rings': [15, 7, 9, 10, 12, 6, 11, 14, 8, 13, 10, 7],\r
    })\r
    feat = ['Length', 'Diameter', 'Height', 'WholeWeight', 'ShuckedWeight', 'VisceraWeight', 'ShellWeight']\r
    X = data[feat].values\r
    age = data['Rings'].values + 1.5\r
    sex = data['Sex'].values\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      import pandas as pd\r
\r
      cols = ['Sex', 'Length', 'Diameter', 'Height', 'WholeWeight', 'ShuckedWeight', 'VisceraWeight', 'ShellWeight', 'Rings']\r
      data = pd.DataFrame({\r
          'Sex': ['M', 'F', 'I', 'M', 'F', 'I', 'M', 'F', 'I', 'M', 'F', 'I'],\r
          'Length': [0.455, 0.350, 0.530, 0.440, 0.610, 0.330, 0.575, 0.650, 0.420, 0.590, 0.520, 0.375],\r
          'Diameter': [0.365, 0.265, 0.420, 0.365, 0.490, 0.255, 0.455, 0.545, 0.315, 0.470, 0.400, 0.290],\r
          'Height': [0.095, 0.090, 0.135, 0.125, 0.150, 0.080, 0.140, 0.175, 0.105, 0.155, 0.130, 0.095],\r
          'WholeWeight': [0.514, 0.225, 0.677, 0.516, 1.134, 0.205, 0.880, 1.265, 0.390, 1.010, 0.720, 0.310],\r
          'ShuckedWeight': [0.224, 0.099, 0.256, 0.216, 0.456, 0.089, 0.360, 0.520, 0.155, 0.430, 0.300, 0.130],\r
          'VisceraWeight': [0.101, 0.048, 0.142, 0.114, 0.237, 0.039, 0.180, 0.260, 0.082, 0.210, 0.148, 0.067],\r
          'ShellWeight': [0.150, 0.070, 0.210, 0.155, 0.330, 0.060, 0.260, 0.390, 0.120, 0.310, 0.220, 0.090],\r
          'Rings': [15, 7, 9, 10, 12, 6, 11, 14, 8, 13, 10, 7],\r
      })\r
      feat = ['Length', 'Diameter', 'Height', 'WholeWeight', 'ShuckedWeight', 'VisceraWeight', 'ShellWeight']\r
      X = data[feat].values\r
      age = data['Rings'].values + 1.5\r
      sex = data['Sex'].values\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};