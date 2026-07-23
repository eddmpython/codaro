var e=`meta:\r
  packages:\r
  - numpy\r
  - pandas\r
  id: numpy_08\r
  title: 행복지수국가비교\r
  order: 8\r
  category: numpy\r
  difficulty: ⭐⭐⭐\r
  badge: 중급\r
  tags:\r
  - numpy\r
  - stack\r
  - split\r
  - tile\r
  - repeat\r
  - meshgrid\r
  - einsum\r
  - 검증\r
  - 지표비교\r
  seo:\r
    title: NumPy 배열 조작 - 세계 행복지수 국가 비교\r
    description: NumPy의 고급 배열 조작을 배우며 세계 행복지수 데이터로 국가를 비교 분석합니다.\r
    keywords:\r
    - numpy\r
    - stack\r
    - split\r
    - tile\r
    - repeat\r
    - 행복지수\r
intro:\r
  emoji: 😊\r
  goal: 세계 행복지수 데이터로 고급 배열 조작을 익힙니다.\r
  description: 150개국의 행복지수 데이터를 분석합니다. stack, split, tile, repeat 등 고급 배열 조작으로 국가 간 비교와 순위 분석을 수행합니다.\r
  direction: 행복지수국가비교에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.\r
  benefits:\r
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.\r
  - 행복지수국가비교 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.\r
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.\r
  diagram:\r
    steps:\r
    - label: 1단계. 라이브러리 불러오기 입력 확인\r
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.\r
    - label: 2단계. 데이터 로드 처리 실행\r
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.\r
    - label: 3단계. 배열 추출 결과 검증\r
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.\r
    - label: 행복지수국가비교 재사용\r
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.\r
    runtime:\r
    - label: 배열 계산 환경\r
      detail: numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.\r
    - label: 행복지수국가비교 실행\r
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.\r
    - label: 행복지수국가비교 완료\r
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
  subtitle: 행복지수 데이터셋\r
  goal: 2단계. 데이터 로드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 유엔(UN)에서 발표하는 World Happiness Report 데이터입니다. 156개국을 대상으로 행복도를 0~10점 척도로 측정했습니다. GDP per\r
    capita(1인당 GDP), Social support(사회적 지지), Healthy life expectancy(건강 기대수명), Freedom(자유도) 등 행복에 영향을\r
    주는 요인들도 함께 측정됩니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    from codaro.curriculum.localData import loadLocalDataset\r
\r
    happyDf = loadLocalDataset("happiness")\r
    happyDf.head()\r
  exercise:\r
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      from codaro.curriculum.localData import loadLocalDataset\r
\r
      happyDf = loadLocalDataset("happiness")\r
      happyDf.head()\r
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
  subtitle: 주요 지표\r
  goal: 3단계. 배열 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.\r
  explanation: 주요 수치형 지표들을 NumPy 배열로 추출합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    score = happyDf['Score'].values\r
    gdp = happyDf['GDP per capita'].values\r
    social = happyDf['Social support'].values\r
    health = happyDf['Healthy life expectancy'].values\r
    freedom = happyDf['Freedom to make life choices'].values\r
    country = happyDf['Country or region'].values\r
    score.shape\r
  exercise:\r
    prompt: 3단계. 배열 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      score = happyDf['Score'].values\r
      gdp = happyDf['GDP per capita'].values\r
      social = happyDf['Social support'].values\r
      health = happyDf['Healthy life expectancy'].values\r
      freedom = happyDf['Freedom to make life choices'].values\r
      country = happyDf['Country or region'].values\r
      score.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 3단계. 배열 추출의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.\r
    resultCheck: 3단계. 배열 추출의 match/search/sub 결과가 바꾼 패턴이나 샘플 문자열 기준과 맞아야 합니다.\r
- id: step4_stack\r
  title: 4단계. 배열 스택\r
  structuredPrimary: true\r
  subtitle: np.stack()\r
  goal: 4단계. 배열 스택에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.stack()은 여러 배열을 새로운 차원을 추가하면서 쌓습니다. 마치 카드를 쌓아 카드 덱을 만드는 것과 같습니다. 4개의 (156,) 배열을 stack하면 (4, 156) 배열이 됩니다. 첫 번째 차원이 '어떤 지표인가'를, 두 번째 차원이 '어느 국가인가'를 나타냅니다.\r
\r
    np.stack([a, b, c])은 새로운 축을 추가하여 배열을 쌓습니다. 결과 shape은 (3, 원래길이)가 됩니다. axis 파라미터로 쌓는 방향을 조절할 수 있습니다.\r
  snippet: |-\r
    indicators = np.stack([gdp, social, health, freedom])\r
    indicators.shape\r
  exercise:\r
    prompt: 4단계. 배열 스택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      indicators = np.stack([gdp, social, health, freedom])\r
      indicators.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 4단계. 배열 스택에서 \`indicators\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 4단계. 배열 스택 실행 뒤 \`indicators\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step5_stack_axis\r
  title: 5단계. 축 방향 스택\r
  structuredPrimary: true\r
  subtitle: axis=1\r
  goal: 5단계. 축 방향 스택에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    axis=1로 스택하면 열 방향으로 쌓입니다. 결과 shape이 달라집니다.\r
\r
    axis=0(기본): 행 방향으로 쌓아 (4, 156) 형태. axis=1: 열 방향으로 쌓아 (156, 4) 형태가 됩니다.\r
  snippet: |-\r
    indicatorsCol = np.stack([gdp, social, health, freedom], axis=1)\r
    indicatorsCol.shape\r
  exercise:\r
    prompt: 5단계. 축 방향 스택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      indicatorsCol = np.stack([gdp, social, health, freedom], axis=1)\r
      indicatorsCol.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 5단계. 축 방향 스택에서 \`indicatorsCol\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 5단계. 축 방향 스택 실행 뒤 \`indicatorsCol\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step6_split\r
  title: 6단계. 배열 분할\r
  structuredPrimary: true\r
  subtitle: np.split()\r
  goal: 6단계. 배열 분할에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.split()은 배열을 여러 조각으로 나눕니다. 케이크를 N등분하는 것과 같습니다. 먼저 점수순으로 정렬한 뒤, 상위/중위/하위 3개 그룹으로 나눕니다. 주의할 점은 배열 크기가 정확히 나누어 떨어져야 합니다. 156개국을 3으로 나누면 나머지가 생기므로 앞부분만 사용합니다.\r
\r
    np.split(arr, n)은 배열을 n개의 동일한 크기로 분할합니다. 정확히 나누어 떨어지지 않으면 에러가 발생합니다.\r
  snippet: |-\r
    sortIdx = np.argsort(score)[::-1]\r
    sortedScore = score[sortIdx]\r
    splitSize = len(score) // 3\r
    topGroup, midGroup, lowGroup = np.split(sortedScore[:splitSize*3], 3)\r
    f"상위: {len(topGroup)}개국, 중위: {len(midGroup)}개국, 하위: {len(lowGroup)}개국"\r
  exercise:\r
    prompt: 6단계. 배열 분할 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      sortIdx = np.argsort(score)[::-1]\r
      sortedScore = score[sortIdx]\r
      splitSize = len(score) // 3\r
      topGroup, midGroup, lowGroup = np.split(sortedScore[:splitSize*3], 3)\r
      f"상위: {len(topGroup)}개국, 중위: {len(midGroup)}개국, 하위: {len(lowGroup)}개국"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 6단계. 배열 분할에서 \`sortIdx\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 6단계. 배열 분할 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step7_array_split\r
  title: 7단계. 유연한 분할\r
  structuredPrimary: true\r
  subtitle: np.array_split()\r
  goal: 7단계. 유연한 분할에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.\r
  explanation: |-\r
    np.array_split()은 split의 유연한 버전입니다. 156개국을 5개 그룹으로 나누면 정확히 나눠지지 않는데(156÷5=31.2), array_split은 앞쪽 그룹에 하나씩 더 배분하여 32, 32, 31, 31, 30개로 나눕니다. 정확한 등분이 불가능할 때 유용합니다.\r
\r
    np.array_split()은 나머지가 있을 때 앞쪽 그룹에 하나씩 더 배분합니다. split과 달리 항상 성공합니다.\r
  snippet: |-\r
    fiveGroups = np.array_split(sortedScore, 5)\r
    groupSizes = [len(g) for g in fiveGroups]\r
    f"그룹 크기: {groupSizes}"\r
  exercise:\r
    prompt: 7단계. 유연한 분할 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.\r
    starterCode: |-\r
      fiveGroups = np.array_split(sortedScore, 5)\r
      groupSizes = [len(g) for g in fiveGroups]\r
      f"그룹 크기: {groupSizes}"\r
    hints:\r
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.\r
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 7단계. 유연한 분할의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 7단계. 유연한 분할 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
- id: step8_tile\r
  title: 8단계. 배열 타일링\r
  structuredPrimary: true\r
  subtitle: np.tile()\r
  goal: 8단계. 배열 타일링에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.tile()은 배열을 타일처럼 반복해서 붙입니다. 화장실 바닥에 같은 타일을 반복해서 깔듯이, 같은 패턴을 여러 번 복사합니다. 세계 평균값 배열(4개 지표)을 156개 국가만큼 반복하면, 각 국가와 세계 평균을 비교하는 계산이 쉬워집니다.\r
\r
    np.tile(arr, reps)는 배열을 reps 횟수만큼 타일처럼 반복합니다. 2D 배열의 경우 (행 반복, 열 반복) 형태로 지정합니다.\r
  snippet: |-\r
    worldAvg = np.array([np.mean(gdp), np.mean(social), np.mean(health), np.mean(freedom)])\r
    worldAvgTiled = np.tile(worldAvg, (len(score), 1))\r
    worldAvgTiled.shape\r
  exercise:\r
    prompt: 8단계. 배열 타일링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      worldAvg = np.array([np.mean(gdp), np.mean(social), np.mean(health), np.mean(freedom)])\r
      worldAvgTiled = np.tile(worldAvg, (len(score), 1))\r
      worldAvgTiled.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 8단계. 배열 타일링에서 \`worldAvg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 8단계. 배열 타일링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step9_compare_world\r
  title: 9단계. 세계 평균 비교\r
  structuredPrimary: true\r
  subtitle: 브로드캐스팅\r
  goal: 9단계. 세계 평균 비교에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: 각 국가 지표가 세계 평균 대비 얼마나 높은지 계산합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    ratioToWorld = indicatorsCol / worldAvgTiled\r
    ratioToWorld[:5]\r
  exercise:\r
    prompt: 9단계. 세계 평균 비교 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      ratioToWorld = indicatorsCol / worldAvgTiled\r
      ratioToWorld[:5]\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 9단계. 세계 평균 비교에서 \`ratioToWorld\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 9단계. 세계 평균 비교 실행 뒤 \`ratioToWorld\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.\r
- id: step10_repeat\r
  title: 10단계. 요소 반복\r
  structuredPrimary: true\r
  subtitle: np.repeat()\r
  goal: 10단계. 요소 반복에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.repeat()는 각 요소를 개별적으로 반복합니다. tile이 [1,2,3] → [1,2,3,1,2,3]이라면, repeat는 [1,2,3] → [1,1,2,2,3,3]입니다. 각 그룹의 라벨을 해당 그룹 크기만큼 반복해서 '1그룹, 1그룹, ..., 2그룹, 2그룹, ...'처럼 모든 국가에 그룹 번호를 할당할 수 있습니다.\r
\r
    np.repeat(arr, n)은 각 요소를 n번 반복합니다. n이 배열이면 각 요소마다 다른 횟수로 반복할 수 있습니다.\r
  snippet: |-\r
    groupLabels = np.array([1, 2, 3])\r
    repeatLabels = np.repeat(groupLabels, [len(topGroup), len(midGroup), len(lowGroup)])\r
    repeatLabels.shape\r
  exercise:\r
    prompt: 10단계. 요소 반복 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      groupLabels = np.array([1, 2, 3])\r
      repeatLabels = np.repeat(groupLabels, [len(topGroup), len(midGroup), len(lowGroup)])\r
      repeatLabels.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 10단계. 요소 반복에서 \`groupLabels\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 10단계. 요소 반복 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step11_meshgrid\r
  title: 11단계. 좌표 그리드\r
  structuredPrimary: true\r
  subtitle: np.meshgrid()\r
  goal: 11단계. 좌표 그리드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.meshgrid()는 두 배열의 모든 조합을 만듭니다. 체스판의 좌표를 만드는 것과 비슷합니다. x=[1,2], y=[a,b]가 있으면 (1,a), (1,b), (2,a), (2,b) 모든 조합을 생성합니다. 국가 5개의 점수로 meshgrid를 만들면 5×5 = 25개의 모든 국가 쌍을 비교할 수 있습니다.\r
\r
    np.meshgrid(x, y)는 두 1D 배열로 2D 좌표 그리드를 만듭니다. 모든 (x, y) 조합을 표현할 때 사용합니다.\r
  snippet: |-\r
    top5Score = score[sortIdx[:5]]\r
    top5Country = country[sortIdx[:5]]\r
    scoreGrid1, scoreGrid2 = np.meshgrid(top5Score, top5Score)\r
    scoreGrid1.shape\r
  exercise:\r
    prompt: 11단계. 좌표 그리드 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      top5Score = score[sortIdx[:5]]\r
      top5Country = country[sortIdx[:5]]\r
      scoreGrid1, scoreGrid2 = np.meshgrid(top5Score, top5Score)\r
      scoreGrid1.shape\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 11단계. 좌표 그리드에서 \`top5Score\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 11단계. 좌표 그리드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step12_pairwise_diff\r
  title: 12단계. 쌍별 차이\r
  structuredPrimary: true\r
  subtitle: 행렬 연산\r
  goal: 12단계. 쌍별 차이에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: meshgrid로 만든 그리드로 모든 국가 쌍의 점수 차이를 계산합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    scoreDiff = scoreGrid1 - scoreGrid2\r
    diffDf = pd.DataFrame(scoreDiff.round(3), columns=top5Country, index=top5Country)\r
    diffDf\r
  exercise:\r
    prompt: 12단계. 쌍별 차이 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      scoreDiff = scoreGrid1 - scoreGrid2\r
      diffDf = pd.DataFrame(scoreDiff.round(3), columns=top5Country, index=top5Country)\r
      diffDf\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 12단계. 쌍별 차이의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 12단계. 쌍별 차이의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: step13_clip\r
  title: 13단계. 값 제한\r
  structuredPrimary: true\r
  subtitle: np.clip()\r
  goal: 13단계. 값 제한에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.clip()은 값의 범위를 제한합니다. 마치 종이를 자르듯이 지정한 최소/최대 범위를 벗어나는 값을 잘라냅니다. np.clip(score, 5, 7)은 5보다 작은 값은 5로, 7보다 큰 값은 7로 바꿉니다. 극단적인 이상치(outlier)가 분석을 왜곡하는 것을 방지할 때 유용합니다.\r
\r
    np.clip(arr, min, max)는 배열의 값을 min과 max 사이로 제한합니다. min보다 작으면 min으로, max보다 크면 max로 설정됩니다.\r
  snippet: |-\r
    clippedScore = np.clip(score, 5, 7)\r
    f"원본 범위: {np.min(score):.2f}~{np.max(score):.2f}, 클리핑 후: {np.min(clippedScore):.2f}~{np.max(clippedScore):.2f}"\r
  exercise:\r
    prompt: 13단계. 값 제한 예제에서 \`clippedScore\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      clippedScore = np.clip(score, 5, 7)\r
      f"원본 범위: {np.min(score):.2f}~{np.max(score):.2f}, 클리핑 후: {np.min(clippedScore):.2f}~{np.max(clippedScore):.2f}"\r
    hints:\r
    - 바꿀 지점은 \`clippedScore = ...\` 오른쪽 값입니다.\r
    - 실행 뒤 \`clippedScore\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 13단계. 값 제한에서 \`clippedScore\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 13단계. 값 제한 실행 뒤 \`clippedScore\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.\r
- id: step14_searchsorted\r
  title: 14단계. 순위 찾기\r
  structuredPrimary: true\r
  subtitle: np.searchsorted()\r
  goal: 14단계. 순위 찾기에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.\r
  explanation: |-\r
    np.searchsorted()는 정렬된 배열에서 특정 값이 들어갈 위치를 찾습니다. 사전에서 단어가 어디에 들어갈지 찾는 것과 같습니다. 오름차순 정렬된 점수 배열에서 각 국가 점수의 위치를 찾으면, 그 위치가 바로 '몇 번째로 낮은가'를 나타내므로 백분위 순위를 계산할 수 있습니다.\r
\r
    np.searchsorted(sorted_arr, values)는 정렬된 배열에서 values가 삽입될 인덱스를 반환합니다. 이진 탐색을 사용하여 매우 빠릅니다.\r
  snippet: |-\r
    sortedScoreAsc = np.sort(score)\r
    percentileRank = np.searchsorted(sortedScoreAsc, score) / len(score) * 100\r
    f"한국(대략 54위): 상위 {100 - percentileRank[53]:.1f}%"\r
  exercise:\r
    prompt: 14단계. 순위 찾기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.\r
    starterCode: |-\r
      sortedScoreAsc = np.sort(score)\r
      percentileRank = np.searchsorted(sortedScoreAsc, score) / len(score) * 100\r
      f"한국(대략 54위): 상위 {100 - percentileRank[53]:.1f}%"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: 14단계. 순위 찾기에서 \`sortedScoreAsc\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.\r
    resultCheck: 14단계. 순위 찾기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.\r
- id: step15_composite\r
  title: 15단계. 종합 지수 계산\r
  structuredPrimary: true\r
  subtitle: 가중 평균\r
  goal: 15단계. 종합 지수 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.\r
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.\r
  explanation: 가중 평균은 각 요소에 중요도(가중치)를 곱해서 평균을 구하는 방법입니다. 단순 평균은 모든 요소를 동등하게 취급하지만, 가중 평균은 '더 중요한 요소에 더\r
    큰 비중'을 줍니다. 여기서는 GDP 30%, 사회적 지지 25%, 건강 25%, 자유 20%의 가중치로 종합 점수를 계산합니다.\r
  tips:\r
  - 작게 실행하고 결과를 바로 확인하세요.\r
  snippet: |-\r
    weights = np.array([0.3, 0.25, 0.25, 0.2])\r
    compositeScore = np.sum(indicatorsCol * weights, axis=1)\r
    compositeRank = np.argsort(compositeScore)[::-1]\r
    pd.DataFrame({\r
        'Country': country[compositeRank[:10]],\r
        'CompositeScore': compositeScore[compositeRank[:10]].round(3),\r
        'OriginalScore': score[compositeRank[:10]]\r
    })\r
  exercise:\r
    prompt: 15단계. 종합 지수 계산 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      weights = np.array([0.3, 0.25, 0.25, 0.2])\r
      compositeScore = np.sum(indicatorsCol * weights, axis=1)\r
      compositeRank = np.argsort(compositeScore)[::-1]\r
      pd.DataFrame({\r
          'Country': country[compositeRank[:10]],\r
          'CompositeScore': compositeScore[compositeRank[:10]].round(3),\r
          'OriginalScore': score[compositeRank[:10]]\r
      })\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 15단계. 종합 지수 계산의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.\r
    resultCheck: 15단계. 종합 지수 계산의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.\r
- id: workflow_validation\r
  title: '현업 흐름 검증: 국가 지표 가중 점수 계산'\r
  structuredPrimary: true\r
  subtitle: stack, broadcasting, einsum, 실패 케이스\r
  goal: '현업 흐름 검증: 국가 지표 가중 점수 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'\r
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.\r
  explanation: |-\r
    여러 지표를 합친 점수는 가중치 합이 1인지, 행렬 shape이 맞는지 확인해야 합니다. NumPy로 빠르게 계산하되 점수 해석이 틀리지 않게 검증하세요.\r
\r
    변주 실험\r
    건강 지표 가중치를 0.5로 올리고 나머지를 줄이면 국가 순위가 바뀌는지 \`np.argsort\` 결과를 비교하세요.\r
  tips:\r
  - 변주 실험 건강 지표 가중치를 0.5로 올리고 나머지를 줄이면 국가 순위가 바뀌는지 \`np.argsort\` 결과를 비교하세요.\r
  snippet: |-\r
    import numpy as np\r
\r
    countries = np.array(["A", "B", "C"])\r
    indicators = np.array([\r
        [0.8, 0.7, 0.9],\r
        [0.6, 0.9, 0.8],\r
        [0.9, 0.6, 0.7],\r
    ])\r
    weights = np.array([0.4, 0.3, 0.3])\r
\r
    scores = np.einsum("ij,j->i", indicators, weights)\r
    rank = np.argsort(scores)[::-1]\r
\r
    assert np.isclose(weights.sum(), 1.0)\r
    assert np.allclose(scores, [0.8, 0.75, 0.75])\r
    assert countries[rank[0]] == "A"\r
  exercise:\r
    prompt: '현업 흐름 검증: 국가 지표 가중 점수 계산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'\r
    starterCode: |-\r
      import numpy as np\r
\r
      countries = np.array(["A", "B", "C"])\r
      indicators = np.array([\r
          [0.8, 0.7, 0.9],\r
          [0.6, 0.9, 0.8],\r
          [0.9, 0.6, 0.7],\r
      ])\r
      weights = np.array([0.4, 0.3, 0.3])\r
\r
      scores = np.einsum("ij,j->i", indicators, weights)\r
      rank = np.argsort(scores)[::-1]\r
\r
      assert np.isclose(weights.sum(), 1.0)\r
      assert np.allclose(scores, [0.8, 0.75, 0.75])\r
      assert countries[rank[0]] == "A"\r
    hints:\r
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.\r
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.\r
  check:\r
    type: noError\r
    noError: '현업 흐름 검증: 국가 지표 가중 점수 계산에서 \`countries\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'\r
    resultCheck: '현업 흐름 검증: 국가 지표 가중 점수 계산에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'\r
- id: practice\r
  title: 실습\r
  structuredPrimary: true\r
  subtitle: 행복지수 국가 비교\r
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
    happyIdx = np.arange(156)\r
    countryNames = ['Korea' if i == 53 else f'Country {i + 1:03d}' for i in happyIdx]\r
    data = pd.DataFrame({\r
        'Country or region': countryNames,\r
        'Score': np.round(7.85 - happyIdx * 0.023, 3),\r
        'GDP per capita': np.round(1.45 - happyIdx * 0.006, 3),\r
        'Social support': np.round(1.62 - happyIdx * 0.004, 3),\r
        'Healthy life expectancy': np.round(1.05 - happyIdx * 0.003, 3),\r
        'Freedom to make life choices': np.round(0.62 - happyIdx * 0.0015, 3),\r
    })\r
    score = data['Score'].values\r
    country = data['Country or region'].values\r
  exercise:\r
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.\r
    starterCode: |-\r
      import numpy as np\r
      import pandas as pd\r
\r
      happyIdx = np.arange(156)\r
      countryNames = ['Korea' if i == 53 else f'Country {i + 1:03d}' for i in happyIdx]\r
      data = pd.DataFrame({\r
          'Country or region': countryNames,\r
          'Score': np.round(7.85 - happyIdx * 0.023, 3),\r
          'GDP per capita': np.round(1.45 - happyIdx * 0.006, 3),\r
          'Social support': np.round(1.62 - happyIdx * 0.004, 3),\r
          'Healthy life expectancy': np.round(1.05 - happyIdx * 0.003, 3),\r
          'Freedom to make life choices': np.round(0.62 - happyIdx * 0.0015, 3),\r
      })\r
      score = data['Score'].values\r
      country = data['Country or region'].values\r
    hints:\r
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.\r
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.\r
  check:\r
    type: noError\r
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.\r
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.\r
`;export{e as default};