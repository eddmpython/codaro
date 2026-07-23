var e=`meta:\r
  packages:\r
  - numpy\r
  - pandas\r
  id: numpy_04\r
  title: 음악특성분석\r
  order: 4\r
  category: numpy\r
  difficulty: ⭐⭐\r
  badge: 기초\r
  tags:\r
  - numpy\r
  - reshape\r
  - normalization\r
  - corrcoef\r
  - broadcasting\r
  - nan\r
  - 검증\r
  - 특성분석\r
  seo:\r
    title: NumPy 정규화와 상관관계 - Spotify 음악 분석\r
    description: NumPy의 배열 변형과 정규화를 배우며 Spotify 음악 특성 데이터의 상관관계를 분석합니다.\r
    keywords:\r
    - numpy\r
    - 정규화\r
    - 상관계수\r
    - corrcoef\r
    - spotify\r
    - 음악분석\r
intro:\r
  emoji: 🎵\r
  goal: Spotify 음악 특성 데이터로 정규화와 상관관계를 익힙니다.\r
  description: 144곡의 로컬 음악 특성 데이터를 분석합니다. reshape으로 배열 형태를 변경하고, 브로드캐스팅으로 정규화를 수행하며, 상관계수를 계산합니다.\r
  direction: 음악특성분석에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.\r
  benefits:\r
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.\r
  - 음악특성분석 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 특성 배열 추출 결과 검증\r
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 음악특성분석 재사용\r
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 배열 계산 환경\r
      detail: numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 음악특성분석 실행\r
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.\r
    - label: 음악특성분석 완료\r
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
  subtitle: Spotify 데이터셋\r
  goal: 2단계. 데이터 로드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 로컬 Spotify 샘플에는 144곡의 음악 특성이 담겨 있습니다. danceability(춤추기\r
    좋은 정도), energy(에너지), valence(밝고 긍정적인 정도) 등 Spotify가 자체 알고리즘으로 분석한 0~1 사이의 수치들입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    df = loadLocalDataset("spotify_songs")\r
    df.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      df = loadLocalDataset("spotify_songs")\r
      df.head()\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step3_extract\r
  title: 3단계. 특성 배열 추출\r
  structuredPrimary: true\r
  subtitle: 다중 컬럼\r
  goal: 3단계. 특성 배열 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 여러 개의 열(컬럼)을 동시에 선택할 수 있습니다. df[['A', 'B', 'C']]처럼 열 이름 리스트를 전달하면 해당 열들만 추출됩니다. 9개 음악 특성을\r
    선택하면 144행 × 9열 크기의 2차원 배열이 만들어집니다. 각 행은 하나의 곡, 각 열은 하나의 특성입니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    cols = ['danceability', 'energy', 'loudness', 'speechiness',\r
            'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo']\r
    features = df[cols].values\r
    features.shape\r
  exercise:\r
    prompt: 3단계. 특성 배열 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      cols = ['danceability', 'energy', 'loudness', 'speechiness',\r
              'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo']\r
      features = df[cols].values\r
      features.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 특성 배열 추출에서 \`cols\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 3단계. 특성 배열 추출 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step4_stats\r
  title: 4단계. 기본 통계\r
  structuredPrimary: true\r
  subtitle: axis=0\r
  goal: 4단계. 기본 통계에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 각 특성의 평균과 표준편차를 계산합니다. axis=0으로 열 방향 연산을 수행합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    avg = np.mean(features, axis=0)\r
    std = np.std(features, axis=0)\r
    pd.DataFrame({'Feature': cols, 'Mean': np.round(avg, 2), 'Std': np.round(std, 2)})\r
  exercise:\r
    prompt: 4단계. 기본 통계 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      avg = np.mean(features, axis=0)\r
      std = np.std(features, axis=0)\r
      pd.DataFrame({'Feature': cols, 'Mean': np.round(avg, 2), 'Std': np.round(std, 2)})\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 기본 통계의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 4단계. 기본 통계의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step5_nan_check\r
  title: 5단계. 결측값 확인\r
  structuredPrimary: true\r
  subtitle: np.isnan()\r
  goal: 5단계. 결측값 확인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: |-\r
    NaN(Not a Number)은 '값이 없음'을 나타내는 특수한 표시입니다. 엑셀의 빈 셀과 비슷합니다. 실제 데이터에서는 측정 실패, 입력 누락 등으로 결측값이 자주 발생합니다. np.isnan()은 각 값이 NaN인지 확인해서 True/False 배열을 반환합니다. sum()으로 전체 NaN 개수를 셀 수 있습니다.\r
\r
    np.isnan()은 NaN(결측값) 여부를 불리언 배열로 반환합니다. sum()으로 전체 NaN 개수를 확인할 수 있습니다.\r
  snippet: np.sum(np.isnan(features))\r
  exercise:\r
    prompt: 5단계. 결측값 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: np.sum(np.isnan(features))\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 결측값 확인의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 5단계. 결측값 확인 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step6_nan_remove\r
  title: 6단계. 결측값 제거\r
  structuredPrimary: true\r
  subtitle: np.any()\r
  goal: 6단계. 결측값 제거에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    any()는 '하나라도 있으면 True'를 반환합니다. np.any(np.isnan(features), axis=1)은 각 행(axis=1)에서 NaN이 하나라도 있으면 True입니다. 이 True/False 배열 앞에 ~(틸다)를 붙이면 반전되어, NaN이 없는 행만 True가 됩니다. 결과적으로 NaN이 없는 깨끗한 행들만 남습니다.\r
\r
    np.any(arr, axis=1)은 각 행에서 하나라도 True가 있으면 True를 반환합니다. ~(틸다)는 불리언 배열을 반전시킵니다.\r
  snippet: |-\r
    mask = np.any(np.isnan(features), axis=1)\r
    clean = features[~mask]\r
    clean.shape\r
  exercise:\r
    prompt: 6단계. 결측값 제거 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      mask = np.any(np.isnan(features), axis=1)\r
      clean = features[~mask]\r
      clean.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 결측값 제거에서 \`mask\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 결측값 제거 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step7_minmax\r
  title: 7단계. Min-Max 정규화\r
  structuredPrimary: true\r
  subtitle: 0~1 범위\r
  goal: 7단계. MinMax 정규화에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    정규화(Normalization)는 서로 다른 단위의 데이터를 같은 범위로 맞추는 작업입니다. tempo(템포)는 50~200 범위이고 danceability는 0~1 범위라서 직접 비교하기 어렵습니다. Min-Max 정규화는 (값 - 최소) / (최대 - 최소)로 모든 값을 0~1 범위로 변환합니다. 브로드캐스팅 덕분에 for문 없이 한 줄로 전체 배열에 적용됩니다.\r
\r
    Min-Max 정규화는 (값 - 최소) / (최대 - 최소)로 계산합니다. 브로드캐스팅 덕분에 반복문 없이 전체 배열에 연산이 적용됩니다.\r
  snippet: |-\r
    lo = np.min(clean, axis=0)\r
    hi = np.max(clean, axis=0)\r
    norm = (clean - lo) / (hi - lo)\r
    norm[:5]\r
  exercise:\r
    prompt: 7단계. MinMax 정규화 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      lo = np.min(clean, axis=0)\r
      hi = np.max(clean, axis=0)\r
      norm = (clean - lo) / (hi - lo)\r
      norm[:5]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. MinMax 정규화에서 \`lo\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 7단계. MinMax 정규화 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step8_norm_verify\r
  title: 8단계. 정규화 확인\r
  structuredPrimary: true\r
  subtitle: 범위 검증\r
  goal: 8단계. 정규화 확인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 정규화 후 모든 특성이 0~1 범위에 있는지 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    avg = np.mean(norm, axis=0)\r
    mins = np.min(norm, axis=0)\r
    maxs = np.max(norm, axis=0)\r
    pd.DataFrame({\r
        'Feature': cols,\r
        'Min': np.round(mins, 2),\r
        'Max': np.round(maxs, 2),\r
        'Mean': np.round(avg, 2)\r
    })\r
  exercise:\r
    prompt: 8단계. 정규화 확인 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      avg = np.mean(norm, axis=0)\r
      mins = np.min(norm, axis=0)\r
      maxs = np.max(norm, axis=0)\r
      pd.DataFrame({\r
          'Feature': cols,\r
          'Min': np.round(mins, 2),\r
          'Max': np.round(maxs, 2),\r
          'Mean': np.round(avg, 2)\r
      })\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 정규화 확인의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 8단계. 정규화 확인의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step9_zscore\r
  title: 9단계. Z-score 표준화\r
  structuredPrimary: true\r
  subtitle: 평균 0, 표준편차 1\r
  goal: 9단계. Zscore 표준화에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    Z-score 표준화는 (값 - 평균) / 표준편차로 계산합니다. 결과 값은 '평균에서 표준편차 몇 개 만큼 떨어져 있는가'를 의미합니다. Z=2면 평균보다 표준편차 2개만큼 큰 값이고, Z=-1이면 평균보다 표준편차 1개만큼 작은 값입니다. 표준화 후에는 평균이 0, 표준편차가 1이 됩니다.\r
\r
    Z-score 표준화는 (값 - 평균) / 표준편차로 계산합니다. 결과의 평균은 0, 표준편차는 1이 됩니다.\r
  snippet: |-\r
    mu = np.mean(clean, axis=0)\r
    sigma = np.std(clean, axis=0)\r
    z = (clean - mu) / sigma\r
    z[:5]\r
  exercise:\r
    prompt: 9단계. Zscore 표준화 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      mu = np.mean(clean, axis=0)\r
      sigma = np.std(clean, axis=0)\r
      z = (clean - mu) / sigma\r
      z[:5]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. Zscore 표준화에서 \`mu\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. Zscore 표준화 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step10_zscore_verify\r
  title: 10단계. 표준화 확인\r
  structuredPrimary: true\r
  subtitle: 결과 검증\r
  goal: 10단계. 표준화 확인에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 배열 계산은 반복문 없이 많은 값을 빠르게 처리하는 분석 코드의 바탕입니다.\r
  explanation: 표준화 후 평균이 0, 표준편차가 1에 가까운지 확인합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: 'f"평균: {np.mean(z, axis=0).round(5)}, 표준편차: {np.std(z, axis=0).round(2)}"'\r
  exercise:\r
    prompt: 10단계. 표준화 확인 예제에서 입력값을 바꾸고 마지막 확인 값이 달라지는지 확인하세요.\r
    starterCode: 'f"평균: {np.mean(z, axis=0).round(5)}, 표준편차: {np.std(z, axis=0).round(2)}"'\r
    hints:\r
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.\r
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 표준화 확인의 수정 코드가 벡터화 계산 단계의 마지막 확인 값까지 도달해야 합니다.\r
    resultCheck: 10단계. 표준화 확인 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.\r
- id: step11_corr_two\r
  title: 11단계. 두 변수 상관계수\r
  structuredPrimary: true\r
  subtitle: np.corrcoef()\r
  goal: 11단계. 두 변수 상관계수에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    상관계수는 두 변수가 함께 변하는 정도를 -1에서 1 사이 숫자로 나타냅니다. 1에 가까우면 양의 상관(하나가 커지면 다른 것도 커짐), -1에 가까우면 음의 상관(하나가 커지면 다른 것은 작아짐), 0에 가까우면 관계가 없습니다. np.corrcoef()는 상관계수 행렬을 반환하는데, 2x2 행렬의 비대각선 값이 실제 상관계수입니다.\r
\r
    np.corrcoef(x, y)는 피어슨 상관계수 행렬을 반환합니다. 대각선은 항상 1(자기 자신과의 상관), 비대각선이 두 변수 간 상관계수입니다.\r
  snippet: |-\r
    dance = clean[:, 0]\r
    energy = clean[:, 1]\r
    corr = np.corrcoef(dance, energy)\r
    corr\r
  exercise:\r
    prompt: 11단계. 두 변수 상관계수 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      dance = clean[:, 0]\r
      energy = clean[:, 1]\r
      corr = np.corrcoef(dance, energy)\r
      corr\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 두 변수 상관계수에서 \`dance\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. 두 변수 상관계수 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step12_corr_value\r
  title: 12단계. 상관계수 추출\r
  structuredPrimary: true\r
  subtitle: 행렬 인덱싱\r
  goal: 12단계. 상관계수 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 상관계수 행렬에서 두 변수 간 상관계수만 추출합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    r = corr[0, 1]\r
    f"danceability-energy 상관계수: {r:.3f}"\r
  exercise:\r
    prompt: 12단계. 상관계수 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      r = corr[0, 1]\r
      f"danceability-energy 상관계수: {r:.3f}"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 상관계수 추출에서 \`r\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 12단계. 상관계수 추출 실행 뒤 \`r\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step13_corr_all\r
  title: 13단계. 전체 상관계수 행렬\r
  structuredPrimary: true\r
  subtitle: 전치 활용\r
  goal: 13단계. 전체 상관계수 행렬에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    9개 특성 간의 모든 상관계수를 한 번에 계산합니다. corrcoef()는 행을 변수로 취급하는데, 현재 데이터는 열이 특성입니다. .T(전치)로 행과 열을 바꿔주면 됩니다. 전치란 행과 열을 서로 뒤집는 것으로, (144, 9) 배열이 (9, 144)으로 바뀝니다. 결과는 9x9 상관계수 행렬입니다.\r
\r
    corrcoef는 행을 변수로 취급합니다. 특성이 열에 있으므로 .T로 전치하여 행과 열을 바꿔줍니다.\r
  snippet: |-\r
    matrix = np.corrcoef(clean.T)\r
    matrix.shape\r
  exercise:\r
    prompt: 13단계. 전체 상관계수 행렬 예제에서 \`matrix\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      matrix = np.corrcoef(clean.T)\r
      matrix.shape\r
    hints:\r
    - 바꿀 지점은 \`matrix = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`matrix\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 전체 상관계수 행렬에서 \`matrix\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 13단계. 전체 상관계수 행렬 실행 뒤 \`matrix\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step14_corr_display\r
  title: 14단계. 상관계수 시각화\r
  structuredPrimary: true\r
  subtitle: DataFrame 변환\r
  goal: 14단계. 상관계수 시각화에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 상관계수 행렬을 DataFrame으로 보기 좋게 표시합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    result = pd.DataFrame(np.round(matrix, 2), columns=cols, index=cols)\r
    result\r
  exercise:\r
    prompt: 14단계. 상관계수 시각화 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      result = pd.DataFrame(np.round(matrix, 2), columns=cols, index=cols)\r
      result\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 상관계수 시각화의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 14단계. 상관계수 시각화의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step15_corr_extreme\r
  title: 15단계. 강한 상관관계 찾기\r
  structuredPrimary: true\r
  subtitle: np.triu(), unravel_index\r
  goal: 15단계. 강한 상관관계 찾기에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    상관계수 행렬에서 가장 강한 관계를 찾습니다. 대각선은 자기 자신과의 상관(항상 1)이므로 제외해야 합니다. np.triu(matrix, k=1)은 상삼각 부분만 남깁니다(대각선 위쪽). unravel_index는 1차원 인덱스를 2차원 위치(행, 열)로 변환합니다. 가장 높은 양의 상관과 음의 상관을 가진 특성 쌍을 찾을 수 있습니다.\r
\r
    np.triu(arr, k=1)은 상삼각 행렬을 반환합니다. 대각선(k=0)을 제외하면 자기 자신과의 상관(1.0)이 제거됩니다.\r
  snippet: |-\r
    upper = np.triu(matrix, k=1)\r
    idx1 = np.unravel_index(np.argmax(upper), upper.shape)\r
    temp = matrix.copy()\r
    np.fill_diagonal(temp, 0)\r
    idx2 = np.unravel_index(np.argmin(temp), temp.shape)\r
    f"가장 강한 양의 상관: {cols[idx1[0]]} - {cols[idx1[1]]} ({matrix[idx1]:.3f})"\r
  exercise:\r
    prompt: 15단계. 강한 상관관계 찾기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      upper = np.triu(matrix, k=1)\r
      idx1 = np.unravel_index(np.argmax(upper), upper.shape)\r
      temp = matrix.copy()\r
      np.fill_diagonal(temp, 0)\r
      idx2 = np.unravel_index(np.argmin(temp), temp.shape)\r
      f"가장 강한 양의 상관: {cols[idx1[0]]} - {cols[idx1[1]]} ({matrix[idx1]:.3f})"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 강한 상관관계 찾기에서 \`upper\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 15단계. 강한 상관관계 찾기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 음악 특성 정규화와 결측 처리'\r
  structuredPrimary: true\r
  subtitle: nanmean, min-max scaling, corrcoef, 실패 케이스\r
  goal: '현업 흐름 검증: 음악 특성 정규화와 결측 처리에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    음악 특성처럼 단위가 섞인 배열은 먼저 정규화하고 결측값을 처리해야 합니다. 결측을 무시한 평균과 정규화 범위를 검증한 뒤 상관관계를 해석하세요.\r
\r
    변주 실험\r
    템포 컬럼만 표준화(z-score)하고 나머지는 min-max로 유지하면 상관계수 해석이 달라지는지 비교하세요.\r
  tips:\r
  - 변주 실험 템포 컬럼만 표준화(z-score)하고 나머지는 min-max로 유지하면 상관계수 해석이 달라지는지 비교하세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    features = np.array([\r
        [0.8, 120.0, 0.6],\r
        [0.5, np.nan, 0.7],\r
        [0.9, 140.0, 0.4],\r
    ])\r
\r
    columnMeans = np.nanmean(features, axis=0)\r
    filled = np.where(np.isnan(features), columnMeans, features)\r
    minimum = filled.min(axis=0)\r
    maximum = filled.max(axis=0)\r
    scaled = (filled - minimum) / (maximum - minimum)\r
    corr = np.corrcoef(scaled, rowvar=False)\r
\r
    assert not np.isnan(filled).any()\r
    assert np.allclose(scaled.min(axis=0), [0.0, 0.0, 0.0])\r
    assert np.allclose(scaled.max(axis=0), [1.0, 1.0, 1.0])\r
    assert corr.shape == (3, 3)\r
  exercise:\r
    prompt: '현업 흐름 검증: 음악 특성 정규화와 결측 처리 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import numpy as np\r
\r
      features = np.array([\r
          [0.8, 120.0, 0.6],\r
          [0.5, np.nan, 0.7],\r
          [0.9, 140.0, 0.4],\r
      ])\r
\r
      columnMeans = np.nanmean(features, axis=0)\r
      filled = np.where(np.isnan(features), columnMeans, features)\r
      minimum = filled.min(axis=0)\r
      maximum = filled.max(axis=0)\r
      scaled = (filled - minimum) / (maximum - minimum)\r
      corr = np.corrcoef(scaled, rowvar=False)\r
\r
      assert not np.isnan(filled).any()\r
      assert np.allclose(scaled.min(axis=0), [0.0, 0.0, 0.0])\r
      assert np.allclose(scaled.max(axis=0), [1.0, 1.0, 1.0])\r
      assert corr.shape == (3, 3)\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 음악 특성 정규화와 결측 처리에서 \`features\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 음악 특성 정규화와 결측 처리에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: Spotify 음악 분석\r
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
        'track_name': ['Local Groove', 'Quiet Pulse', 'Bright Run', 'Deep Focus',\r
                       'Night Drive', 'Warm Echo', 'Fast Steps', 'Soft Rain'],\r
        'playlist_genre': ['pop', 'acoustic', 'pop', 'ambient',\r
                           'rock', 'acoustic', 'edm', 'ambient'],\r
        'track_popularity': [72, 44, 81, 35, 67, 58, 89, 39],\r
        'danceability': [0.72, 0.42, 0.81, 0.33, 0.64, 0.58, 0.89, 0.37],\r
        'energy': [0.80, 0.35, 0.76, 0.28, 0.70, 0.45, 0.91, 0.30],\r
        'loudness': [-5.1, -12.4, -6.3, -15.0, -7.8, -10.2, -4.5, -14.1],\r
        'speechiness': [0.05, 0.03, 0.08, 0.04, 0.06, 0.05, 0.10, 0.03],\r
        'acousticness': [0.12, 0.72, 0.18, 0.86, 0.22, 0.55, 0.08, 0.90],\r
        'instrumentalness': [0.01, 0.35, 0.02, 0.60, 0.12, 0.28, 0.00, 0.50],\r
        'liveness': [0.10, 0.12, 0.18, 0.09, 0.16, 0.11, 0.22, 0.08],\r
        'valence': [0.74, 0.30, 0.82, 0.24, 0.66, 0.48, 0.88, 0.27],\r
        'tempo': [118, 86, 128, 72, 104, 94, 140, 68],\r
    })\r
    cols = ['danceability', 'energy', 'valence', 'tempo']\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      import pandas as pd\r
\r
      data = pd.DataFrame({\r
          'track_name': ['Local Groove', 'Quiet Pulse', 'Bright Run', 'Deep Focus',\r
                         'Night Drive', 'Warm Echo', 'Fast Steps', 'Soft Rain'],\r
          'playlist_genre': ['pop', 'acoustic', 'pop', 'ambient',\r
                             'rock', 'acoustic', 'edm', 'ambient'],\r
          'track_popularity': [72, 44, 81, 35, 67, 58, 89, 39],\r
          'danceability': [0.72, 0.42, 0.81, 0.33, 0.64, 0.58, 0.89, 0.37],\r
          'energy': [0.80, 0.35, 0.76, 0.28, 0.70, 0.45, 0.91, 0.30],\r
          'loudness': [-5.1, -12.4, -6.3, -15.0, -7.8, -10.2, -4.5, -14.1],\r
          'speechiness': [0.05, 0.03, 0.08, 0.04, 0.06, 0.05, 0.10, 0.03],\r
          'acousticness': [0.12, 0.72, 0.18, 0.86, 0.22, 0.55, 0.08, 0.90],\r
          'instrumentalness': [0.01, 0.35, 0.02, 0.60, 0.12, 0.28, 0.00, 0.50],\r
          'liveness': [0.10, 0.12, 0.18, 0.09, 0.16, 0.11, 0.22, 0.08],\r
          'valence': [0.74, 0.30, 0.82, 0.24, 0.66, 0.48, 0.88, 0.27],\r
          'tempo': [118, 86, 128, 72, 104, 94, 140, 68],\r
      })\r
      cols = ['danceability', 'energy', 'valence', 'tempo']\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 실습의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
`;export{e as default};