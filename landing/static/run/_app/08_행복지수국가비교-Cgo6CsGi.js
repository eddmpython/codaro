var e=`meta:
  packages:
  - numpy
  - pandas
  id: numpy_08
  title: 행복지수국가비교
  order: 8
  category: numpy
  difficulty: ⭐⭐⭐
  badge: 중급
  tags:
  - numpy
  - stack
  - split
  - tile
  - repeat
  - meshgrid
  - einsum
  - 검증
  - 지표비교
  seo:
    title: NumPy 배열 조작 - 세계 행복지수 국가 비교
    description: NumPy의 고급 배열 조작을 배우며 세계 행복지수 데이터로 국가를 비교 분석합니다.
    keywords:
    - numpy
    - stack
    - split
    - tile
    - repeat
    - 행복지수
intro:
  emoji: 😊
  goal: 세계 행복지수 데이터로 고급 배열 조작을 익힙니다.
  description: 150개국의 행복지수 데이터를 분석합니다. stack, split, tile, repeat 등 고급 배열 조작으로 국가 간 비교와 순위 분석을 수행합니다.
  direction: 행복지수국가비교에서 배열 입력을 만들고 벡터 연산 결과를 수치로 검증합니다.
  benefits:
  - 배열 입력 확인 후 벡터화 계산에 맞는 코드 입력을 고릅니다.
  - 행복지수국가비교 결과를 shape와 수치 결과 기준으로 즉시 점검합니다.
  - 완료한 코드를 계산 파이프라인에 다시 사용할 수 있습니다.
  diagram:
    steps:
    - label: 1단계. 라이브러리 불러오기 입력 확인
      detail: 입력 기준(배열 입력)과 필요한 조건을 먼저 고정합니다.
    - label: 2단계. 데이터 로드 처리 실행
      detail: 벡터화 계산 코드를 실행해 중간 결과를 확인합니다.
    - label: 3단계. 배열 추출 결과 검증
      detail: shape와 수치 결과 기준으로 실행 결과를 비교합니다.
    - label: 행복지수국가비교 재사용
      detail: 완성 코드를 계산 파이프라인에 붙일 수 있게 정리합니다.
    runtime:
    - label: 배열 계산 환경
      detail: numpy, pandas 기준으로 로컬 Python 실행을 준비합니다.
    - label: 행복지수국가비교 실행
      detail: 셀을 실행해 shape와 수치 결과와 예외 상태를 확인합니다.
    - label: 행복지수국가비교 완료
      detail: 검증된 코드를 계산 파이프라인로 남깁니다.
sections:
- id: step1_import
  title: 1단계. 라이브러리 불러오기
  structuredPrimary: true
  subtitle: import
  goal: 1단계. 라이브러리 불러오기에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: import 준비가 정확해야 다음 셀과 자동화 코드에서 같은 이름을 안정적으로 재사용할 수 있습니다.
  explanation: NumPy와 pandas를 불러옵니다. pandas는 CSV 로딩용으로만 사용합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    import numpy as np
    import pandas as pd
  exercise:
    prompt: 1단계. 라이브러리 불러오기 예제에서 import한 모듈의 별칭이나 바로 이어지는 확인 호출을 바꿔 준비 상태를 확인하세요.
    starterCode: |-
      import numpy as np
      import pandas as pd
    hints:
    - 바꿀 지점은 배열 입력을 만드는 첫 줄과 벡터화 계산 줄에서 찾으세요.
    - 실행 뒤 shape와 수치 결과 중 하나가 바꾼 값을 반영하는지 보세요.
  check:
    type: noError
    noError: 1단계. 라이브러리 불러오기의 import 대상 모듈과 별칭이 현재 로컬 환경에서 준비되어야 합니다.
    resultCheck: 1단계. 라이브러리 불러오기 실행 결과가 shape와 수치 결과 기준으로 바꾼 입력값을 반영해야 합니다.
- id: step2_data
  title: 2단계. 데이터 로드
  structuredPrimary: true
  subtitle: 행복지수 데이터셋
  goal: 2단계. 데이터 로드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 유엔(UN)에서 발표하는 World Happiness Report 데이터입니다. 156개국을 대상으로 행복도를 0~10점 척도로 측정했습니다. GDP per
    capita(1인당 GDP), Social support(사회적 지지), Healthy life expectancy(건강 기대수명), Freedom(자유도) 등 행복에 영향을
    주는 요인들도 함께 측정됩니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    from codaro.curriculum.localData import loadLocalDataset

    happyDf = loadLocalDataset("happiness")
    happyDf.head()
  exercise:
    prompt: 2단계. 데이터 로드 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      from codaro.curriculum.localData import loadLocalDataset

      happyDf = loadLocalDataset("happiness")
      happyDf.head()
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 2단계. 데이터 로드의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 2단계. 데이터 로드의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step3_extract
  title: 3단계. 배열 추출
  structuredPrimary: true
  subtitle: 주요 지표
  goal: 3단계. 배열 추출에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 패턴 처리는 샘플 문자열 결과를 즉시 확인해야 과도한 매칭이나 누락을 줄일 수 있습니다.
  explanation: 주요 수치형 지표들을 NumPy 배열로 추출합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    score = happyDf['Score'].values
    gdp = happyDf['GDP per capita'].values
    social = happyDf['Social support'].values
    health = happyDf['Healthy life expectancy'].values
    freedom = happyDf['Freedom to make life choices'].values
    country = happyDf['Country or region'].values
    score.shape
  exercise:
    prompt: 3단계. 배열 추출 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      score = happyDf['Score'].values
      gdp = happyDf['GDP per capita'].values
      social = happyDf['Social support'].values
      health = happyDf['Healthy life expectancy'].values
      freedom = happyDf['Freedom to make life choices'].values
      country = happyDf['Country or region'].values
      score.shape
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 3단계. 배열 추출의 정규식 패턴과 입력 문자열 처리가 컴파일/치환 단계까지 도달해야 합니다.
    resultCheck: 3단계. 배열 추출의 match/search/sub 결과가 바꾼 패턴이나 샘플 문자열 기준과 맞아야 합니다.
- id: step4_stack
  title: 4단계. 배열 스택
  structuredPrimary: true
  subtitle: np.stack()
  goal: 4단계. 배열 스택에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    np.stack()은 여러 배열을 새로운 차원을 추가하면서 쌓습니다. 마치 카드를 쌓아 카드 덱을 만드는 것과 같습니다. 4개의 (156,) 배열을 stack하면 (4, 156) 배열이 됩니다. 첫 번째 차원이 '어떤 지표인가'를, 두 번째 차원이 '어느 국가인가'를 나타냅니다.

    np.stack([a, b, c])은 새로운 축을 추가하여 배열을 쌓습니다. 결과 shape은 (3, 원래길이)가 됩니다. axis 파라미터로 쌓는 방향을 조절할 수 있습니다.
  snippet: |-
    indicators = np.stack([gdp, social, health, freedom])
    indicators.shape
  exercise:
    prompt: 4단계. 배열 스택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      indicators = np.stack([gdp, social, health, freedom])
      indicators.shape
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 4단계. 배열 스택에서 \`indicators\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 4단계. 배열 스택 실행 뒤 \`indicators\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step5_stack_axis
  title: 5단계. 축 방향 스택
  structuredPrimary: true
  subtitle: axis=1
  goal: 5단계. 축 방향 스택에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    axis=1로 스택하면 열 방향으로 쌓입니다. 결과 shape이 달라집니다.

    axis=0(기본): 행 방향으로 쌓아 (4, 156) 형태. axis=1: 열 방향으로 쌓아 (156, 4) 형태가 됩니다.
  snippet: |-
    indicatorsCol = np.stack([gdp, social, health, freedom], axis=1)
    indicatorsCol.shape
  exercise:
    prompt: 5단계. 축 방향 스택 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      indicatorsCol = np.stack([gdp, social, health, freedom], axis=1)
      indicatorsCol.shape
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 5단계. 축 방향 스택에서 \`indicatorsCol\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 5단계. 축 방향 스택 실행 뒤 \`indicatorsCol\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step6_split
  title: 6단계. 배열 분할
  structuredPrimary: true
  subtitle: np.split()
  goal: 6단계. 배열 분할에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    np.split()은 배열을 여러 조각으로 나눕니다. 케이크를 N등분하는 것과 같습니다. 먼저 점수순으로 정렬한 뒤, 상위/중위/하위 3개 그룹으로 나눕니다. 주의할 점은 배열 크기가 정확히 나누어 떨어져야 합니다. 156개국을 3으로 나누면 나머지가 생기므로 앞부분만 사용합니다.

    np.split(arr, n)은 배열을 n개의 동일한 크기로 분할합니다. 정확히 나누어 떨어지지 않으면 에러가 발생합니다.
  snippet: |-
    sortIdx = np.argsort(score)[::-1]
    sortedScore = score[sortIdx]
    splitSize = len(score) // 3
    topGroup, midGroup, lowGroup = np.split(sortedScore[:splitSize*3], 3)
    f"상위: {len(topGroup)}개국, 중위: {len(midGroup)}개국, 하위: {len(lowGroup)}개국"
  exercise:
    prompt: 6단계. 배열 분할 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      sortIdx = np.argsort(score)[::-1]
      sortedScore = score[sortIdx]
      splitSize = len(score) // 3
      topGroup, midGroup, lowGroup = np.split(sortedScore[:splitSize*3], 3)
      f"상위: {len(topGroup)}개국, 중위: {len(midGroup)}개국, 하위: {len(lowGroup)}개국"
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 6단계. 배열 분할에서 \`sortIdx\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 6단계. 배열 분할 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step7_array_split
  title: 7단계. 유연한 분할
  structuredPrimary: true
  subtitle: np.array_split()
  goal: 7단계. 유연한 분할에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 반복 결과를 확인하면 빠진 항목이나 잘못된 누적을 초기에 잡을 수 있습니다.
  explanation: |-
    np.array_split()은 split의 유연한 버전입니다. 156개국을 5개 그룹으로 나누면 정확히 나눠지지 않는데(156÷5=31.2), array_split은 앞쪽 그룹에 하나씩 더 배분하여 32, 32, 31, 31, 30개로 나눕니다. 정확한 등분이 불가능할 때 유용합니다.

    np.array_split()은 나머지가 있을 때 앞쪽 그룹에 하나씩 더 배분합니다. split과 달리 항상 성공합니다.
  snippet: |-
    fiveGroups = np.array_split(sortedScore, 5)
    groupSizes = [len(g) for g in fiveGroups]
    f"그룹 크기: {groupSizes}"
  exercise:
    prompt: 7단계. 유연한 분할 예제에서 반복 대상의 항목이나 범위를 바꾸고 반복 결과가 같이 바뀌는지 확인하세요.
    starterCode: |-
      fiveGroups = np.array_split(sortedScore, 5)
      groupSizes = [len(g) for g in fiveGroups]
      f"그룹 크기: {groupSizes}"
    hints:
    - 바꿀 지점은 for 오른쪽의 리스트, range(), 슬라이스, 조건에서 찾으세요.
    - 실행 뒤 반복 횟수, 누적값, 만들어진 리스트 길이가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 7단계. 유연한 분할의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 7단계. 유연한 분할 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
- id: step8_tile
  title: 8단계. 배열 타일링
  structuredPrimary: true
  subtitle: np.tile()
  goal: 8단계. 배열 타일링에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    np.tile()은 배열을 타일처럼 반복해서 붙입니다. 화장실 바닥에 같은 타일을 반복해서 깔듯이, 같은 패턴을 여러 번 복사합니다. 세계 평균값 배열(4개 지표)을 156개 국가만큼 반복하면, 각 국가와 세계 평균을 비교하는 계산이 쉬워집니다.

    np.tile(arr, reps)는 배열을 reps 횟수만큼 타일처럼 반복합니다. 2D 배열의 경우 (행 반복, 열 반복) 형태로 지정합니다.
  snippet: |-
    worldAvg = np.array([np.mean(gdp), np.mean(social), np.mean(health), np.mean(freedom)])
    worldAvgTiled = np.tile(worldAvg, (len(score), 1))
    worldAvgTiled.shape
  exercise:
    prompt: 8단계. 배열 타일링 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      worldAvg = np.array([np.mean(gdp), np.mean(social), np.mean(health), np.mean(freedom)])
      worldAvgTiled = np.tile(worldAvg, (len(score), 1))
      worldAvgTiled.shape
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 8단계. 배열 타일링에서 \`worldAvg\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 8단계. 배열 타일링 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step9_compare_world
  title: 9단계. 세계 평균 비교
  structuredPrimary: true
  subtitle: 브로드캐스팅
  goal: 9단계. 세계 평균 비교에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: 각 국가 지표가 세계 평균 대비 얼마나 높은지 계산합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    ratioToWorld = indicatorsCol / worldAvgTiled
    ratioToWorld[:5]
  exercise:
    prompt: 9단계. 세계 평균 비교 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      ratioToWorld = indicatorsCol / worldAvgTiled
      ratioToWorld[:5]
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 9단계. 세계 평균 비교에서 \`ratioToWorld\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 9단계. 세계 평균 비교 실행 뒤 \`ratioToWorld\` 값, 출력, 또는 type() 확인이 바꾼 리스트 값을 반영해야 합니다.
- id: step10_repeat
  title: 10단계. 요소 반복
  structuredPrimary: true
  subtitle: np.repeat()
  goal: 10단계. 요소 반복에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    np.repeat()는 각 요소를 개별적으로 반복합니다. tile이 [1,2,3] → [1,2,3,1,2,3]이라면, repeat는 [1,2,3] → [1,1,2,2,3,3]입니다. 각 그룹의 라벨을 해당 그룹 크기만큼 반복해서 '1그룹, 1그룹, ..., 2그룹, 2그룹, ...'처럼 모든 국가에 그룹 번호를 할당할 수 있습니다.

    np.repeat(arr, n)은 각 요소를 n번 반복합니다. n이 배열이면 각 요소마다 다른 횟수로 반복할 수 있습니다.
  snippet: |-
    groupLabels = np.array([1, 2, 3])
    repeatLabels = np.repeat(groupLabels, [len(topGroup), len(midGroup), len(lowGroup)])
    repeatLabels.shape
  exercise:
    prompt: 10단계. 요소 반복 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      groupLabels = np.array([1, 2, 3])
      repeatLabels = np.repeat(groupLabels, [len(topGroup), len(midGroup), len(lowGroup)])
      repeatLabels.shape
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 10단계. 요소 반복에서 \`groupLabels\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 10단계. 요소 반복 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step11_meshgrid
  title: 11단계. 좌표 그리드
  structuredPrimary: true
  subtitle: np.meshgrid()
  goal: 11단계. 좌표 그리드에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    np.meshgrid()는 두 배열의 모든 조합을 만듭니다. 체스판의 좌표를 만드는 것과 비슷합니다. x=[1,2], y=[a,b]가 있으면 (1,a), (1,b), (2,a), (2,b) 모든 조합을 생성합니다. 국가 5개의 점수로 meshgrid를 만들면 5×5 = 25개의 모든 국가 쌍을 비교할 수 있습니다.

    np.meshgrid(x, y)는 두 1D 배열로 2D 좌표 그리드를 만듭니다. 모든 (x, y) 조합을 표현할 때 사용합니다.
  snippet: |-
    top5Score = score[sortIdx[:5]]
    top5Country = country[sortIdx[:5]]
    scoreGrid1, scoreGrid2 = np.meshgrid(top5Score, top5Score)
    scoreGrid1.shape
  exercise:
    prompt: 11단계. 좌표 그리드 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      top5Score = score[sortIdx[:5]]
      top5Country = country[sortIdx[:5]]
      scoreGrid1, scoreGrid2 = np.meshgrid(top5Score, top5Score)
      scoreGrid1.shape
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 11단계. 좌표 그리드에서 \`top5Score\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 11단계. 좌표 그리드 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step12_pairwise_diff
  title: 12단계. 쌍별 차이
  structuredPrimary: true
  subtitle: 행렬 연산
  goal: 12단계. 쌍별 차이에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: meshgrid로 만든 그리드로 모든 국가 쌍의 점수 차이를 계산합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    scoreDiff = scoreGrid1 - scoreGrid2
    diffDf = pd.DataFrame(scoreDiff.round(3), columns=top5Country, index=top5Country)
    diffDf
  exercise:
    prompt: 12단계. 쌍별 차이 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      scoreDiff = scoreGrid1 - scoreGrid2
      diffDf = pd.DataFrame(scoreDiff.round(3), columns=top5Country, index=top5Country)
      diffDf
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 12단계. 쌍별 차이의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 12단계. 쌍별 차이의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: step13_clip
  title: 13단계. 값 제한
  structuredPrimary: true
  subtitle: np.clip()
  goal: 13단계. 값 제한에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    np.clip()은 값의 범위를 제한합니다. 마치 종이를 자르듯이 지정한 최소/최대 범위를 벗어나는 값을 잘라냅니다. np.clip(score, 5, 7)은 5보다 작은 값은 5로, 7보다 큰 값은 7로 바꿉니다. 극단적인 이상치(outlier)가 분석을 왜곡하는 것을 방지할 때 유용합니다.

    np.clip(arr, min, max)는 배열의 값을 min과 max 사이로 제한합니다. min보다 작으면 min으로, max보다 크면 max로 설정됩니다.
  snippet: |-
    clippedScore = np.clip(score, 5, 7)
    f"원본 범위: {np.min(score):.2f}~{np.max(score):.2f}, 클리핑 후: {np.min(clippedScore):.2f}~{np.max(clippedScore):.2f}"
  exercise:
    prompt: 13단계. 값 제한 예제에서 \`clippedScore\` 할당값을 바꾸고 아래 표시 결과가 달라지는지 확인하세요.
    starterCode: |-
      clippedScore = np.clip(score, 5, 7)
      f"원본 범위: {np.min(score):.2f}~{np.max(score):.2f}, 클리핑 후: {np.min(clippedScore):.2f}~{np.max(clippedScore):.2f}"
    hints:
    - 바꿀 지점은 \`clippedScore = ...\` 오른쪽 값입니다.
    - 실행 뒤 \`clippedScore\` 값, 출력, 또는 type() 확인이 입력한 값과 맞는지 보세요.
  check:
    type: noError
    noError: 13단계. 값 제한에서 \`clippedScore\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 13단계. 값 제한 실행 뒤 \`clippedScore\` 값, 출력, 또는 type() 확인이 바꾼 입력값을 반영해야 합니다.
- id: step14_searchsorted
  title: 14단계. 순위 찾기
  structuredPrimary: true
  subtitle: np.searchsorted()
  goal: 14단계. 순위 찾기에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 변수 값 확인은 이후 계산, 조건, 출력에서 잘못된 입력을 빨리 찾게 해줍니다.
  explanation: |-
    np.searchsorted()는 정렬된 배열에서 특정 값이 들어갈 위치를 찾습니다. 사전에서 단어가 어디에 들어갈지 찾는 것과 같습니다. 오름차순 정렬된 점수 배열에서 각 국가 점수의 위치를 찾으면, 그 위치가 바로 '몇 번째로 낮은가'를 나타내므로 백분위 순위를 계산할 수 있습니다.

    np.searchsorted(sorted_arr, values)는 정렬된 배열에서 values가 삽입될 인덱스를 반환합니다. 이진 탐색을 사용하여 매우 빠릅니다.
  snippet: |-
    sortedScoreAsc = np.sort(score)
    percentileRank = np.searchsorted(sortedScoreAsc, score) / len(score) * 100
    f"한국(대략 54위): 상위 {100 - percentileRank[53]:.1f}%"
  exercise:
    prompt: 14단계. 순위 찾기 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.
    starterCode: |-
      sortedScoreAsc = np.sort(score)
      percentileRank = np.searchsorted(sortedScoreAsc, score) / len(score) * 100
      f"한국(대략 54위): 상위 {100 - percentileRank[53]:.1f}%"
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: 14단계. 순위 찾기에서 \`sortedScoreAsc\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.
    resultCheck: 14단계. 순위 찾기 실행 뒤 각 변수와 마지막 표시값이 바꾼 순서와 값을 반영해야 합니다.
- id: step15_composite
  title: 15단계. 종합 지수 계산
  structuredPrimary: true
  subtitle: 가중 평균
  goal: 15단계. 종합 지수 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: 가중 평균은 각 요소에 중요도(가중치)를 곱해서 평균을 구하는 방법입니다. 단순 평균은 모든 요소를 동등하게 취급하지만, 가중 평균은 '더 중요한 요소에 더
    큰 비중'을 줍니다. 여기서는 GDP 30%, 사회적 지지 25%, 건강 25%, 자유 20%의 가중치로 종합 점수를 계산합니다.
  tips:
  - 작게 실행하고 결과를 바로 확인하세요.
  snippet: |-
    weights = np.array([0.3, 0.25, 0.25, 0.2])
    compositeScore = np.sum(indicatorsCol * weights, axis=1)
    compositeRank = np.argsort(compositeScore)[::-1]
    pd.DataFrame({
        'Country': country[compositeRank[:10]],
        'CompositeScore': compositeScore[compositeRank[:10]].round(3),
        'OriginalScore': score[compositeRank[:10]]
    })
  exercise:
    prompt: 15단계. 종합 지수 계산 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      weights = np.array([0.3, 0.25, 0.25, 0.2])
      compositeScore = np.sum(indicatorsCol * weights, axis=1)
      compositeRank = np.argsort(compositeScore)[::-1]
      pd.DataFrame({
          'Country': country[compositeRank[:10]],
          'CompositeScore': compositeScore[compositeRank[:10]].round(3),
          'OriginalScore': score[compositeRank[:10]]
      })
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 15단계. 종합 지수 계산의 DataFrame 입력, 컬럼 참조, 행 길이 조건이 맞아야 합니다.
    resultCheck: 15단계. 종합 지수 계산의 shape, 컬럼 목록, head()/집계 결과가 바꾼 데이터 조건을 반영해야 합니다.
- id: workflow_validation
  title: '현업 흐름 검증: 국가 지표 가중 점수 계산'
  structuredPrimary: true
  subtitle: stack, broadcasting, einsum, 실패 케이스
  goal: '현업 흐름 검증: 국가 지표 가중 점수 계산에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.'
  why: 예상값과 실제 결과를 코드로 비교하면 눈으로만 확인하는 실수를 줄일 수 있습니다.
  explanation: |-
    여러 지표를 합친 점수는 가중치 합이 1인지, 행렬 shape이 맞는지 확인해야 합니다. NumPy로 빠르게 계산하되 점수 해석이 틀리지 않게 검증하세요.

    변주 실험
    건강 지표 가중치를 0.5로 올리고 나머지를 줄이면 국가 순위가 바뀌는지 \`np.argsort\` 결과를 비교하세요.
  tips:
  - 변주 실험 건강 지표 가중치를 0.5로 올리고 나머지를 줄이면 국가 순위가 바뀌는지 \`np.argsort\` 결과를 비교하세요.
  snippet: |-
    import numpy as np

    countries = np.array(["A", "B", "C"])
    indicators = np.array([
        [0.8, 0.7, 0.9],
        [0.6, 0.9, 0.8],
        [0.9, 0.6, 0.7],
    ])
    weights = np.array([0.4, 0.3, 0.3])

    scores = np.einsum("ij,j->i", indicators, weights)
    rank = np.argsort(scores)[::-1]

    assert np.isclose(weights.sum(), 1.0)
    assert np.allclose(scores, [0.8, 0.75, 0.75])
    assert countries[rank[0]] == "A"
  exercise:
    prompt: '현업 흐름 검증: 국가 지표 가중 점수 계산 예제에서 리스트 항목이나 인덱스를 바꾸고 선택 결과가 달라지는지 확인하세요.'
    starterCode: |-
      import numpy as np

      countries = np.array(["A", "B", "C"])
      indicators = np.array([
          [0.8, 0.7, 0.9],
          [0.6, 0.9, 0.8],
          [0.9, 0.6, 0.7],
      ])
      weights = np.array([0.4, 0.3, 0.3])

      scores = np.einsum("ij,j->i", indicators, weights)
      rank = np.argsort(scores)[::-1]

      assert np.isclose(weights.sum(), 1.0)
      assert np.allclose(scores, [0.8, 0.75, 0.75])
      assert countries[rank[0]] == "A"
    hints:
    - 바꿀 지점은 대괄호 안의 항목, 인덱스, 슬라이스 범위입니다.
    - 실행 뒤 선택된 값, 길이, 순서가 바꾼 리스트 기준과 맞는지 보세요.
  check:
    type: noError
    noError: '현업 흐름 검증: 국가 지표 가중 점수 계산에서 \`countries\` 할당문의 오른쪽 값이 SyntaxError 없이 평가되어야 합니다.'
    resultCheck: '현업 흐름 검증: 국가 지표 가중 점수 계산에서 기대값과 실제 결과가 같으면 검증이 통과하고, 다르면 실패해야 합니다.'
- id: practice
  title: 실습
  structuredPrimary: true
  subtitle: 행복지수 국가 비교
  goal: 실습에서 벡터화 계산 흐름을 코드로 실행하고 결과를 확인한다.
  why: 표 데이터는 컬럼, 행 수, 요약값을 함께 확인해야 분석 결과를 믿고 재사용할 수 있습니다.
  explanation: |-
    지금까지 배운 개념을 활용하여 미션을 수행해봅시다. 각 미션은 독립적으로 실행 가능합니다.

    각 미션은 import문부터 시작하지만, 위 연습 예제를 실행했다면 이미 라이브러리가 로딩되었으므로 import문은 제거해도 됩니다.
  snippet: |-
    import numpy as np
    import pandas as pd

    happyIdx = np.arange(156)
    countryNames = ['Korea' if i == 53 else f'Country {i + 1:03d}' for i in happyIdx]
    data = pd.DataFrame({
        'Country or region': countryNames,
        'Score': np.round(7.85 - happyIdx * 0.023, 3),
        'GDP per capita': np.round(1.45 - happyIdx * 0.006, 3),
        'Social support': np.round(1.62 - happyIdx * 0.004, 3),
        'Healthy life expectancy': np.round(1.05 - happyIdx * 0.003, 3),
        'Freedom to make life choices': np.round(0.62 - happyIdx * 0.0015, 3),
    })
    score = data['Score'].values
    country = data['Country or region'].values
  exercise:
    prompt: 실습 예제에서 데이터셋 이름, 컬럼, 행 값 중 하나를 바꾸고 DataFrame 결과가 어떻게 달라지는지 확인하세요.
    starterCode: |-
      import numpy as np
      import pandas as pd

      happyIdx = np.arange(156)
      countryNames = ['Korea' if i == 53 else f'Country {i + 1:03d}' for i in happyIdx]
      data = pd.DataFrame({
          'Country or region': countryNames,
          'Score': np.round(7.85 - happyIdx * 0.023, 3),
          'GDP per capita': np.round(1.45 - happyIdx * 0.006, 3),
          'Social support': np.round(1.62 - happyIdx * 0.004, 3),
          'Healthy life expectancy': np.round(1.05 - happyIdx * 0.003, 3),
          'Freedom to make life choices': np.round(0.62 - happyIdx * 0.0015, 3),
      })
      score = data['Score'].values
      country = data['Country or region'].values
    hints:
    - 바꿀 지점은 데이터 생성/로드 줄이나 컬럼 선택 줄에서 찾으세요.
    - 실행 뒤 shape, 컬럼 목록, head()/집계 결과 중 하나가 바뀐 입력을 반영하는지 보세요.
  check:
    type: noError
    noError: 실습의 반복 대상과 들여쓰기가 맞아 루프가 끝까지 실행되어야 합니다.
    resultCheck: 실습 반복 결과의 개수나 누적값이 바꾼 반복 대상 기준으로 달라져야 합니다.
assessment:
  schemaVersion: 1
  performanceClaim: 웹에서는 외부 패키지 없이 분석 판단과 데이터 계약을 검증하고, 실제 패키지 API와 산출물은 lesson Run 및 Local 실습 증거로 분리합니다.
  tierParity:
    web: portable-concept
    local: package-practice-and-artifact
  supportPolicy: 첫 실패는 실제 반환값과 계약 차이를 inline으로 보여주고 정답 전체는 자동 노출하지 않습니다.
  authoring:
    source: curated-blueprint
    solutionVerification: required
    independentReview: pending
  masteryVariants:
  - id: numpy_08-weighted-happiness-index-mastery
    mode: mastery
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - step1_import
    - practice
    title: 국가별 feature에 가중치를 적용해 행복 지수 순위 만들기
    subtitle: 새 입력으로 핵심 분석 재현
    goal: feature matrix와 weight vector의 dot product를 계산하고 높은 순위와 기여도를 반환한다.
    why: worked example을 복사하지 않고 새 레코드에서 같은 분석 판단을 재현해야 개념 숙달을 확인할 수 있습니다.
    explanation: 브라우저의 격리된 Python Worker가 보이지 않던 정상·경계·오류 입력으로 함수를 다시 호출합니다.
    tips: &id001
    - 최종 score만 남기지 말고 feature별 contribution을 보존하세요.
    - weight의 의미와 합계는 분석 문서에 따로 명시해야 합니다.
    exercise:
      prompt: rank_weighted_index(names, features, weights)를 완성해 scores, ranking, contributions를 반환하세요.
      starterCode: |-
        def rank_weighted_index(names, features, weights):
            raise NotImplementedError
      solution: |
        def rank_weighted_index(names, features, weights):
            if len(names) != len(features) or any(len(row) != len(weights) for row in features):
                raise ValueError("shape mismatch")
            contributions = [[round(value * weight, 3) for value, weight in zip(row, weights)] for row in features]
            scores = [round(sum(row), 3) for row in contributions]
            ranking = [name for _score, name in sorted(zip(scores, names), key=lambda item: (-item[0], item[1]))]
            return {"scores": scores, "ranking": ranking, "contributions": contributions}
      hints: *id001
    check:
      id: python.numpy.numpy_08.weighted-happiness-index.mastery.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.numpy.numpy_08.weighted-happiness-index.mastery.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: rank_weighted_index
        cases:
        - id: keeps-feature-contributions
          arguments:
          - value:
            - A
            - B
          - value:
            - - 0.8
              - 0.5
            - - 0.6
              - 0.9
          - value:
            - 0.7
            - 0.3
          expectedReturn:
            scores:
            - 0.71
            - 0.69
            ranking:
            - A
            - B
            contributions:
            - - 0.56
              - 0.15
            - - 0.42
              - 0.27
        - id: handles-empty-countries
          arguments:
          - value: []
          - value: []
          - value:
            - 1
          expectedReturn:
            scores: []
            ranking: []
            contributions: []
        - id: rejects-weight-shape-mismatch
          arguments:
          - value:
            - A
          - value:
            - - 1
              - 2
          - value:
            - 1
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
  transferVariants:
  - id: numpy_08-rank-change-between-years-transfer
    mode: transfer
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - numpy_08-weighted-happiness-index-mastery
    title: 새 연도별 지수에서 국가 순위 변화 계산하기
    subtitle: 다른 업무 문맥으로 판단 전이
    goal: 단일 순위를 이전·현재 score의 rank delta와 신규·이탈 국가 비교로 전이한다.
    why: 같은 판단을 다른 데이터 계약과 업무 질문으로 옮겨야 특정 예제 암기와 전이를 구분할 수 있습니다.
    explanation: 숙달 근거가 저장되면 별도 확인 클릭 없이 열리는 새 문맥 과제입니다.
    tips: &id002
    - 양수 change는 순위가 올라갔다는 뜻으로 정의하세요.
    - 공통 국가와 신규·이탈 국가를 분리해서 보고하세요.
    exercise:
      prompt: compare_rank_changes(previous, current)를 완성해 changes, entered, exited를 반환하세요.
      starterCode: |-
        def compare_rank_changes(previous, current):
            raise NotImplementedError
      solution: |
        def compare_rank_changes(previous, current):
            def ranks(scores):
                ordered = sorted(scores, key=lambda name: (-scores[name], name))
                return {name: index + 1 for index, name in enumerate(ordered)}
            before = ranks(previous)
            after = ranks(current)
            shared = sorted(set(before) & set(after))
            changes = {name: before[name] - after[name] for name in shared}
            return {"changes": changes, "entered": sorted(set(after) - set(before)), "exited": sorted(set(before) - set(after))}
      hints: *id002
    check:
      id: python.numpy.numpy_08.rank-change-between-years.transfer.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.numpy.numpy_08.rank-change-between-years.transfer.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: compare_rank_changes
        cases:
        - id: computes-rank-improvement
          arguments:
          - value:
              A: 90
              B: 80
              C: 70
          - value:
              B: 95
              A: 85
              D: 60
          expectedReturn:
            changes:
              A: -1
              B: 1
            entered:
            - D
            exited:
            - C
        - id: handles-identical-ranking
          arguments:
          - value:
              A: 2
              B: 1
          - value:
              A: 2
              B: 1
          expectedReturn:
            changes:
              A: 0
              B: 0
            entered: []
            exited: []
        expectedPaths: []
        normalizeReturnPaths: []
  retrievalVariants:
  - id: numpy_08-composite-index-caution-retrieval
    mode: retrieval
    unseen: true
    claimScope: portable-concept
    reviewStatus: machine-verified-pending-independent-review
    sourceSectionIds:
    - numpy_08-rank-change-between-years-transfer
    title: 복합 지수 해석의 핵심 주의점 회상하기
    subtitle: 7일 뒤 기준을 기억에서 복원
    goal: weight, scale, missing feature가 순위에 주는 영향을 구분한다.
    why: 시간을 둔 뒤 핵심 기준을 다시 구성해야 단기 모방과 장기 기억을 구분할 수 있습니다.
    explanation: 전이 과제를 통과한 지 7일 뒤 자동으로 열리며, worked example은 다시 노출하지 않습니다.
    tips: &id003
    - 복합 지수는 객관적 사실 하나가 아니라 선택한 weight의 결과입니다.
    - weight를 바꾼 순위 민감도를 함께 확인하세요.
    exercise:
      prompt: choose_index_caution(situation)를 완성해 caution, evidence, risk를 반환하세요.
      starterCode: |-
        def choose_index_caution(situation):
            raise NotImplementedError
      solution: |
        def choose_index_caution(situation):
            table = {'subjective-weights': {'caution': 'run sensitivity analysis', 'evidence': 'alternative rankings', 'risk': 'value judgment hidden'}, 'mixed-scales': {'caution': 'normalize features', 'evidence': 'scaling parameters', 'risk': 'large-unit feature dominates'}, 'missing-feature': {'caution': 'state imputation policy', 'evidence': 'missingness count', 'risk': 'unfair rank'}}
            if situation not in table:
                raise ValueError('unknown situation')
            return table[situation]
      hints: *id003
    check:
      id: python.numpy.numpy_08.composite-index-caution.retrieval.behavior.v1
      version: 1
      kind: behavior
      strength: strong
      executor: browser-worker
      timeoutMs: 8000
      fixtureId: python.numpy.numpy_08.composite-index-caution.retrieval.behavior.v1.fixture
      fixtureHash: sha256-5H2hz41NNRiQqR7gqqk7c7FuxPecIr+coT1+YyQEi2s=
      fixture:
        directories:
        - input
        - output
        env:
          LANG: C.UTF-8
          TZ: UTC
        files: []
        stdin: []
      packageAssets: []
      payload:
        entry: choose_index_caution
        cases:
        - id: recalls-subjective-weights
          arguments:
          - value: subjective-weights
          expectedReturn:
            caution: run sensitivity analysis
            evidence: alternative rankings
            risk: value judgment hidden
        - id: recalls-mixed-scales
          arguments:
          - value: mixed-scales
          expectedReturn:
            caution: normalize features
            evidence: scaling parameters
            risk: large-unit feature dominates
        - id: rejects-unknown-situation
          arguments:
          - value: unknown
          expectedException: ValueError
        expectedPaths: []
        normalizeReturnPaths: []
    minimumDelayHours: 168
`;export{e as default};